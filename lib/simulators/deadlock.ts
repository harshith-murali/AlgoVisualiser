export type BankerStep = {
  iteration: number;
  process: string;
  work: number[];
  need: number[];
  allocation: number[];
  canFinish: boolean;
};

export type BankerResult = {
  need: number[][];
  steps: BankerStep[];
  safe: boolean;
  safeSequence: string[];
};

export function computeNeed(allocation: number[][], maximum: number[][]) {
  return maximum.map((row, processIndex) =>
    row.map((max, resourceIndex) =>
      Math.max(0, max - (allocation[processIndex]?.[resourceIndex] ?? 0))
    )
  );
}

export function runBankerSafety(
  allocation: number[][],
  maximum: number[][],
  available: number[]
): BankerResult {
  const need = computeNeed(allocation, maximum);
  const finished = Array.from({ length: allocation.length }, () => false);
  const work = [...available];
  const safeSequence: string[] = [];
  const steps: BankerStep[] = [];
  let progressed = true;
  let iteration = 0;

  while (safeSequence.length < allocation.length && progressed) {
    progressed = false;
    for (let processIndex = 0; processIndex < allocation.length; processIndex += 1) {
      if (finished[processIndex]) continue;
      const canFinish = need[processIndex].every(
        (amount, resourceIndex) => amount <= work[resourceIndex]
      );
      steps.push({
        iteration,
        process: `P${processIndex}`,
        work: [...work],
        need: [...need[processIndex]],
        allocation: [...allocation[processIndex]],
        canFinish
      });
      if (canFinish) {
        allocation[processIndex].forEach((amount, resourceIndex) => {
          work[resourceIndex] += amount;
        });
        finished[processIndex] = true;
        safeSequence.push(`P${processIndex}`);
        progressed = true;
      }
      iteration += 1;
    }
  }

  return {
    need,
    steps,
    safe: safeSequence.length === allocation.length,
    safeSequence
  };
}

export function checkResourceRequest(
  allocation: number[][],
  maximum: number[][],
  available: number[],
  processIndex: number,
  request: number[]
) {
  const need = computeNeed(allocation, maximum);
  const safeProcessIndex = Number.isFinite(processIndex) ? processIndex : 0;
  const withinNeed = request.every(
    (amount, resourceIndex) => amount <= (need[safeProcessIndex]?.[resourceIndex] ?? 0)
  );
  const withinAvailable = request.every(
    (amount, resourceIndex) => amount <= available[resourceIndex]
  );

  if (!withinNeed || !withinAvailable) {
    return {
      grantable: false,
      reason: !withinNeed
        ? "Request exceeds the process need vector."
        : "Request exceeds the available vector.",
      result: runBankerSafety(allocation, maximum, available)
    };
  }

  const trialAllocation = allocation.map((row) => [...row]);
  const trialAvailable = [...available];
  request.forEach((amount, resourceIndex) => {
    trialAllocation[safeProcessIndex][resourceIndex] += amount;
    trialAvailable[resourceIndex] -= amount;
  });
  const result = runBankerSafety(trialAllocation, maximum, trialAvailable);
  return {
    grantable: result.safe,
    reason: result.safe
      ? "Request can be granted and the system remains safe."
      : "Request would leave the system in an unsafe state.",
    result
  };
}
