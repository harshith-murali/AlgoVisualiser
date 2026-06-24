export type CpuAlgorithm =
  | "FCFS"
  | "SJF"
  | "SRTF"
  | "RR"
  | "PRIORITY_NP"
  | "PRIORITY_P";

export type ProcessInput = {
  id: string;
  arrival: number;
  burst: number;
  priority: number;
};

export type GanttSegment = {
  processId: string;
  start: number;
  end: number;
};

export type CpuProcessResult = ProcessInput & {
  completion: number;
  turnaround: number;
  waiting: number;
  response: number;
};

export type CpuStep = {
  time: number;
  running: string;
  readyQueue: string[];
  remaining: Record<string, number>;
};

export type CpuResult = {
  algorithm: CpuAlgorithm;
  segments: GanttSegment[];
  steps: CpuStep[];
  processes: CpuProcessResult[];
  averageWaiting: number;
  averageTurnaround: number;
  averageResponse: number;
  totalTime: number;
};

const byArrival = (a: ProcessInput, b: ProcessInput) =>
  a.arrival - b.arrival || a.id.localeCompare(b.id);

function normalizeSegments(segments: GanttSegment[]) {
  return segments.reduce<GanttSegment[]>((acc, segment) => {
    const prev = acc.at(-1);
    if (prev && prev.processId === segment.processId && prev.end === segment.start) {
      prev.end = segment.end;
      return acc;
    }
    acc.push({ ...segment });
    return acc;
  }, []);
}

function finalize(
  algorithm: CpuAlgorithm,
  input: ProcessInput[],
  segments: GanttSegment[],
  steps: CpuStep[]
): CpuResult {
  const firstStart = new Map<string, number>();
  const completion = new Map<string, number>();
  for (const segment of segments) {
    if (segment.processId !== "IDLE" && !firstStart.has(segment.processId)) {
      firstStart.set(segment.processId, segment.start);
    }
    if (segment.processId !== "IDLE") {
      completion.set(segment.processId, segment.end);
    }
  }

  const processes = input.map((process) => {
    const doneAt = completion.get(process.id) ?? process.arrival;
    const turnaround = doneAt - process.arrival;
    const waiting = turnaround - process.burst;
    const response = (firstStart.get(process.id) ?? process.arrival) - process.arrival;
    return {
      ...process,
      completion: doneAt,
      turnaround,
      waiting,
      response
    };
  });

  const divisor = Math.max(processes.length, 1);
  return {
    algorithm,
    segments: normalizeSegments(segments),
    steps,
    processes,
    averageWaiting:
      processes.reduce((sum, process) => sum + process.waiting, 0) / divisor,
    averageTurnaround:
      processes.reduce((sum, process) => sum + process.turnaround, 0) / divisor,
    averageResponse:
      processes.reduce((sum, process) => sum + process.response, 0) / divisor,
    totalTime: Math.max(...segments.map((segment) => segment.end), 0)
  };
}

function nonPreemptive(
  algorithm: CpuAlgorithm,
  input: ProcessInput[],
  selector: (ready: ProcessInput[]) => ProcessInput
) {
  const pending = [...input].sort(byArrival);
  const completed = new Set<string>();
  const segments: GanttSegment[] = [];
  const steps: CpuStep[] = [];
  let time = Math.min(...pending.map((process) => process.arrival), 0);

  while (completed.size < input.length) {
    const ready = pending.filter(
      (process) => process.arrival <= time && !completed.has(process.id)
    );
    if (!ready.length) {
      const nextArrival = pending.find((process) => !completed.has(process.id));
      if (!nextArrival) break;
      segments.push({ processId: "IDLE", start: time, end: nextArrival.arrival });
      time = nextArrival.arrival;
      continue;
    }
    const current = selector(ready);
    steps.push({
      time,
      running: current.id,
      readyQueue: ready.filter((process) => process.id !== current.id).map((p) => p.id),
      remaining: Object.fromEntries(
        pending
          .filter((process) => !completed.has(process.id))
          .map((process) => [process.id, process.id === current.id ? 0 : process.burst])
      )
    });
    segments.push({ processId: current.id, start: time, end: time + current.burst });
    time += current.burst;
    completed.add(current.id);
  }

  return finalize(algorithm, input, segments, steps);
}

function preemptive(
  algorithm: CpuAlgorithm,
  input: ProcessInput[],
  selector: (ready: ProcessInput[], remaining: Record<string, number>) => ProcessInput,
  quantum = 2
) {
  const remaining = Object.fromEntries(input.map((process) => [process.id, process.burst]));
  const completed = new Set<string>();
  const segments: GanttSegment[] = [];
  const steps: CpuStep[] = [];
  let time = Math.min(...input.map((process) => process.arrival), 0);
  let rrQueue: ProcessInput[] = [];

  while (completed.size < input.length) {
    let ready = input
      .filter((process) => process.arrival <= time && !completed.has(process.id))
      .sort(byArrival);

    if (!ready.length) {
      const nextArrival = input
        .filter((process) => !completed.has(process.id))
        .sort(byArrival)[0];
      segments.push({ processId: "IDLE", start: time, end: nextArrival.arrival });
      time = nextArrival.arrival;
      continue;
    }

    let current: ProcessInput;
    let slice = 1;
    if (algorithm === "RR") {
      const arrivedIds = new Set(rrQueue.map((process) => process.id));
      rrQueue.push(
        ...ready.filter((process) => !arrivedIds.has(process.id) && remaining[process.id] > 0)
      );
      current = rrQueue.shift() ?? ready[0];
      slice = Math.min(quantum, remaining[current.id]);
    } else {
      current = selector(ready, remaining);
    }

    steps.push({
      time,
      running: current.id,
      readyQueue: ready.filter((process) => process.id !== current.id).map((p) => p.id),
      remaining: { ...remaining }
    });

    segments.push({ processId: current.id, start: time, end: time + slice });
    remaining[current.id] -= slice;
    time += slice;

    if (remaining[current.id] === 0) {
      completed.add(current.id);
    } else if (algorithm === "RR") {
      const arrivedIds = new Set(rrQueue.map((process) => process.id));
      ready = input
        .filter((process) => process.arrival <= time && !completed.has(process.id))
        .sort(byArrival);
      rrQueue.push(
        ...ready.filter(
          (process) =>
            process.id !== current.id &&
            !arrivedIds.has(process.id) &&
            remaining[process.id] > 0
        )
      );
      rrQueue.push(current);
    }
  }

  return finalize(algorithm, input, segments, steps);
}

export function simulateCpu(
  algorithm: CpuAlgorithm,
  processes: ProcessInput[],
  quantum = 2
): CpuResult {
  const input = processes
    .filter((process) => process.id && Number.isFinite(process.burst) && process.burst > 0)
    .map((process) => ({
      ...process,
      arrival: Number.isFinite(process.arrival) ? Math.max(0, process.arrival) : 0,
      burst: Math.max(1, process.burst),
      priority: Number.isFinite(process.priority) ? Math.max(1, process.priority) : 1
    }));
  const safeQuantum = Number.isFinite(quantum) ? Math.max(1, quantum) : 1;

  if (!input.length) {
    return finalize(algorithm, [], [], []);
  }

  switch (algorithm) {
    case "FCFS":
      return nonPreemptive(algorithm, input, (ready) => [...ready].sort(byArrival)[0]);
    case "SJF":
      return nonPreemptive(
        algorithm,
        input,
        (ready) => [...ready].sort((a, b) => a.burst - b.burst || byArrival(a, b))[0]
      );
    case "PRIORITY_NP":
      return nonPreemptive(
        algorithm,
        input,
        (ready) =>
          [...ready].sort((a, b) => a.priority - b.priority || byArrival(a, b))[0]
      );
    case "SRTF":
      return preemptive(
        algorithm,
        input,
        (ready, remaining) =>
          [...ready].sort(
            (a, b) => remaining[a.id] - remaining[b.id] || byArrival(a, b)
          )[0]
      );
    case "PRIORITY_P":
      return preemptive(
        algorithm,
        input,
        (ready) =>
          [...ready].sort((a, b) => a.priority - b.priority || byArrival(a, b))[0]
      );
    case "RR":
      return preemptive(algorithm, input, (ready) => ready[0], safeQuantum);
  }
}

export const cpuAlgorithmLabels: Record<CpuAlgorithm, string> = {
  FCFS: "FCFS",
  SJF: "SJF",
  SRTF: "SRTF",
  RR: "Round Robin",
  PRIORITY_NP: "Priority NP",
  PRIORITY_P: "Priority P"
};
