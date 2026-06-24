export type DiskAlgorithm = "FCFS" | "SSTF" | "SCAN" | "CSCAN" | "LOOK" | "CLOOK";
export type DiskDirection = "left" | "right";

export type DiskStep = {
  from: number;
  to: number;
  seek: number;
};

export type DiskResult = {
  algorithm: DiskAlgorithm;
  order: number[];
  steps: DiskStep[];
  totalSeek: number;
  chart: { index: number; head: number }[];
};

function seekFromOrder(start: number, algorithm: DiskAlgorithm, order: number[]): DiskResult {
  const steps: DiskStep[] = [];
  let current = start;
  for (const to of order) {
    steps.push({ from: current, to, seek: Math.abs(current - to) });
    current = to;
  }
  return {
    algorithm,
    order,
    steps,
    totalSeek: steps.reduce((sum, step) => sum + step.seek, 0),
    chart: [start, ...order].map((head, index) => ({ index, head }))
  };
}

export function simulateDisk(
  algorithm: DiskAlgorithm,
  requests: number[],
  start: number,
  diskSize: number,
  direction: DiskDirection
): DiskResult {
  const safeDiskSize = Number.isFinite(diskSize) ? Math.max(1, diskSize) : 1;
  const safeStart = Number.isFinite(start)
    ? Math.max(0, Math.min(safeDiskSize - 1, start))
    : 0;
  const cleaned = requests
    .map((request) => Math.max(0, Math.min(safeDiskSize - 1, request)))
    .filter(Number.isFinite);
  const left = cleaned.filter((request) => request < safeStart).sort((a, b) => a - b);
  const right = cleaned.filter((request) => request >= safeStart).sort((a, b) => a - b);
  let order: number[] = [];

  if (algorithm === "FCFS") order = cleaned;
  if (algorithm === "SSTF") {
    const pending = [...cleaned];
    let head = start;
    while (pending.length) {
      pending.sort((a, b) => Math.abs(a - head) - Math.abs(b - head));
      const next = pending.shift()!;
      order.push(next);
      head = next;
    }
  }
  if (algorithm === "SCAN") {
    order =
      direction === "right"
        ? [...right, safeDiskSize - 1, ...left.reverse()]
        : [...left.reverse(), 0, ...right];
  }
  if (algorithm === "CSCAN") {
    order =
      direction === "right"
        ? [...right, safeDiskSize - 1, 0, ...left]
        : [...left.reverse(), 0, safeDiskSize - 1, ...right.reverse()];
  }
  if (algorithm === "LOOK") {
    order =
      direction === "right" ? [...right, ...left.reverse()] : [...left.reverse(), ...right];
  }
  if (algorithm === "CLOOK") {
    order =
      direction === "right" ? [...right, ...left] : [...left.reverse(), ...right.reverse()];
  }

  return seekFromOrder(safeStart, algorithm, order);
}
