import type { ProcessInput } from "@/lib/simulators/cpu";

export const cpuSample: ProcessInput[] = [
  { id: "P1", arrival: 0, burst: 8, priority: 2 },
  { id: "P2", arrival: 1, burst: 4, priority: 1 },
  { id: "P3", arrival: 2, burst: 9, priority: 3 },
  { id: "P4", arrival: 3, burst: 5, priority: 2 }
];

export const pageSample = {
  references: [7, 0, 1, 2, 0, 3, 0, 4, 2, 3, 0, 3, 2],
  frames: 3
};

export const diskSample = {
  requests: [98, 183, 37, 122, 14, 124, 65, 67],
  head: 53,
  diskSize: 200
};

export const deadlockSample = {
  allocation: [
    [0, 1, 0],
    [2, 0, 0],
    [3, 0, 2],
    [2, 1, 1],
    [0, 0, 2]
  ],
  maximum: [
    [7, 5, 3],
    [3, 2, 2],
    [9, 0, 2],
    [2, 2, 2],
    [4, 3, 3]
  ],
  available: [3, 3, 2]
};
