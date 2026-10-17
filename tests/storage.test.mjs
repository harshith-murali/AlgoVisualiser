import test, { beforeEach, afterEach } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import Module from 'node:module';
import { fileURLToPath } from 'node:url';
import ts from 'typescript';

const root = fileURLToPath(new URL('../', import.meta.url));
const originalDatabaseUrl = process.env.DATABASE_URL;
let userId, calls, failure, prisma;

function load(relative) {
  const filename = root + relative;
  const compiled = ts.transpileModule(readFileSync(filename, 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020, esModuleInterop: true },
  }).outputText;
  const mod = new Module(filename);
  mod.filename = filename;
  mod.paths = Module._nodeModulePaths(root);
  const baseRequire = mod.require.bind(mod);
  mod.require = id => {
    if (id === '@clerk/nextjs/server') return { auth: async () => ({ userId }) };
    if (id === '@/lib/db') return { prisma };
    if (id === '@/lib/database-response') return load('lib/database-response.ts');
    if (id === '@/lib/simulation-input') return load('lib/simulation-input.ts');
    return baseRequire(id);
  };
  mod._compile(compiled, filename);
  return mod.exports;
}

beforeEach(() => {
  userId = 'user_current';
  calls = [];
  failure = null;
  process.env.DATABASE_URL = 'postgresql://mock.invalid/test';
  const transaction = {};
  prisma = { $transaction: async operation => { calls.push(['transaction']); return operation(transaction); } };
  for (const model of ['simulationProject', 'simulationRun', 'savedPreset', 'recentActivity']) {
    transaction[model] = { create: async ({ data }) => {
      calls.push(['create', model, data]);
      if (failure) throw failure;
      return { id: 'record_1', ...data };
    } };
    prisma[model] = { findMany: async options => { calls.push(['findMany', model, options]); return []; } };
  }
});

afterEach(() => {
  if (originalDatabaseUrl === undefined) delete process.env.DATABASE_URL;
  else process.env.DATABASE_URL = originalDatabaseUrl;
});

function request(body) {
  return new Request('http://localhost/api/test', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
}

for (const [route, model, action] of [['projects', 'simulationProject', 'project.created'], ['runs', 'simulationRun', 'run.created'], ['presets', 'savedPreset', 'preset.created']]) {
  test(`${route}: save and activity use one transaction, owned by authenticated user`, async () => {
    const { POST } = load(`app/api/${route}/route.ts`);
    const response = await POST(request({ moduleType: 'cpu', algorithm: 'SRTF', title: 'My project', name: 'My preset', inputData: { quantum: 2 }, resultData: { totalTime: 10 }, presetData: { quantum: 2 }, clerkUserId: 'user_someone_else' }));
    assert.equal(response.status, 201);
    assert.equal(calls.filter(call => call[0] === 'transaction').length, 1);
    const saved = calls.find(call => call[0] === 'create' && call[1] === model);
    assert.equal(saved[2].clerkUserId, 'user_current');
    const activity = calls.find(call => call[0] === 'create' && call[1] === 'recentActivity');
    assert.equal(activity[2].action, action);
    assert.equal(activity[2].clerkUserId, 'user_current');
  });
}

test('run snapshots accept all four simulator modules', async () => {
  const { POST } = load('app/api/runs/route.ts');
  for (const moduleType of ['cpu', 'page', 'disk', 'deadlock']) {
    const response = await POST(request({ moduleType, algorithm: 'test', inputData: { values: [1, 2] }, resultData: { steps: [{ time: 1 }] } }));
    assert.equal(response.status, 201);
    assert.deepEqual((await response.json()).resultData, { steps: [{ time: 1 }] });
  }
});

test('invalid or malformed input returns 400 without opening a transaction', async () => {
  const { POST } = load('app/api/projects/route.ts');
  for (const body of [{ moduleType: 'invalid', algorithm: 'FCFS' }, { moduleType: 'cpu', algorithm: '' }, { moduleType: 'cpu', algorithm: 'FCFS', title: 'x'.repeat(121) }]) {
    assert.equal((await POST(request(body))).status, 400);
  }
  const malformed = new Request('http://localhost/api/projects', { method: 'POST', body: '{invalid' });
  assert.equal((await POST(malformed)).status, 400);
  assert.equal(calls.length, 0);
});

test('signed-out users cannot list or save work', async () => {
  userId = null;
  const { GET, POST } = load('app/api/projects/route.ts');
  assert.equal((await GET()).status, 401);
  assert.equal((await POST(request({}))).status, 401);
  assert.equal(calls.length, 0);
});

test('projects and history queries remain scoped to the signed-in user', async () => {
  for (const route of ['projects', 'runs', 'activity']) {
    const { GET } = load(`app/api/${route}/route.ts`);
    assert.equal((await GET()).status, 200);
  }
  assert.equal(calls.filter(call => call[0] === 'findMany').length, 3);
  for (const call of calls) assert.equal(call[2].where.clerkUserId, 'user_current');
});

test('missing database configuration returns 503 without claiming success', async () => {
  delete process.env.DATABASE_URL;
  const { POST } = load('app/api/projects/route.ts');
  assert.equal((await POST(request({ moduleType: 'cpu', algorithm: 'FCFS' }))).status, 503);
  assert.equal(calls.length, 0);
});

test('database failures return a safe error and do not create an activity entry', async () => {
  failure = Object.assign(new Error('private-connection-string'), { code: 'P1001' });
  const { POST } = load('app/api/runs/route.ts');
  const response = await POST(request({ moduleType: 'cpu', algorithm: 'FCFS' }));
  assert.equal(response.status, 503);
  assert.doesNotMatch(await response.text(), /private-connection-string/);
  assert.equal(calls.some(call => call[1] === 'recentActivity'), false);
});
