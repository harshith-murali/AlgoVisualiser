export type PageAlgorithm = "FIFO" | "LRU" | "OPTIMAL";

export type PageStep = {
  index: number;
  page: number;
  frames: (number | null)[];
  hit: boolean;
  replaced?: number;
  explanation: string;
};

export type PageResult = {
  algorithm: PageAlgorithm;
  steps: PageStep[];
  faults: number;
  hits: number;
  hitRatio: number;
  missRatio: number;
};

export function simulatePageReplacement(
  algorithm: PageAlgorithm,
  references: number[],
  frameCount: number
): PageResult {
  const safeFrameCount = Number.isFinite(frameCount) ? Math.max(1, frameCount) : 1;
  const frames: (number | null)[] = Array.from(
    { length: safeFrameCount },
    () => null
  );
  const steps: PageStep[] = [];
  const queue: number[] = [];
  const lastUsed = new Map<number, number>();
  let faults = 0;

  references.forEach((page, index) => {
    const hit = frames.includes(page);
    let replaced: number | undefined;
    let explanation = `Page ${page} already exists in memory.`;

    if (hit) {
      lastUsed.set(page, index);
    } else {
      faults += 1;
      const emptyIndex = frames.findIndex((frame) => frame === null);
      if (emptyIndex >= 0) {
        frames[emptyIndex] = page;
        queue.push(page);
        explanation = `Frame ${emptyIndex + 1} was empty, so page ${page} was loaded.`;
      } else {
        let replaceIndex = 0;
        if (algorithm === "FIFO") {
          const victim = queue.shift();
          replaceIndex = frames.findIndex((frame) => frame === victim);
          if (replaceIndex < 0) replaceIndex = 0;
          explanation = `FIFO evicts page ${victim}, the oldest loaded page.`;
        }
        if (algorithm === "LRU") {
          replaceIndex = frames.reduce<number>((oldest, frame, frameIndex) => {
            const currentLast = lastUsed.get(frame ?? -1) ?? -1;
            const oldestLast = lastUsed.get(frames[oldest] ?? -1) ?? -1;
            return currentLast < oldestLast ? frameIndex : oldest;
          }, 0);
          explanation = `LRU evicts page ${frames[replaceIndex]}, least recently used before this reference.`;
        }
        if (algorithm === "OPTIMAL") {
          replaceIndex = frames.reduce<number>((best, frame, frameIndex) => {
            const nextUse = references.slice(index + 1).indexOf(frame ?? -1);
            const bestNextUse = references.slice(index + 1).indexOf(frames[best] ?? -1);
            if (nextUse === -1) return frameIndex;
            if (bestNextUse === -1) return best;
            return nextUse > bestNextUse ? frameIndex : best;
          }, 0);
          explanation = `Optimal evicts page ${frames[replaceIndex]}, whose next use is farthest away.`;
        }
        replaced = frames[replaceIndex] ?? undefined;
        frames[replaceIndex] = page;
        queue.push(page);
      }
      lastUsed.set(page, index);
    }

    steps.push({
      index,
      page,
      frames: [...frames],
      hit,
      replaced,
      explanation
    });
  });

  const hits = references.length - faults;
  const divisor = Math.max(references.length, 1);
  return {
    algorithm,
    steps,
    faults,
    hits,
    hitRatio: hits / divisor,
    missRatio: faults / divisor
  };
}
