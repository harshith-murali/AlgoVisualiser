"use client";

import { useEffect, useMemo, useState } from "react";
import {
  BarChart3,
  ChevronLeft,
  ChevronRight,
  Download,
  Pause,
  Play,
  Plus,
  RotateCcw,
  Save,
  Trash2
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { MetricCard, Panel } from "@/components/simulators/shared";
import { cpuSample } from "@/lib/sample-data";
import { numberInputChange, numberInputValue } from "@/lib/number-input";
import {
  cpuAlgorithmLabels,
  simulateCpu,
  type CpuAlgorithm,
  type ProcessInput
} from "@/lib/simulators/cpu";

const algorithms = Object.keys(cpuAlgorithmLabels) as CpuAlgorithm[];
const processPalette = [
  "hsl(173 70% 38%)",
  "hsl(221 83% 53%)",
  "hsl(38 92% 50%)",
  "hsl(346 77% 55%)",
  "hsl(262 83% 58%)",
  "hsl(142 71% 38%)",
  "hsl(24 95% 53%)",
  "hsl(199 89% 48%)"
];

export function CpuSimulator() {
  const [processes, setProcesses] = useState<ProcessInput[]>(cpuSample);
  const [algorithm, setAlgorithm] = useState<CpuAlgorithm>("SRTF");
  const [quantum, setQuantum] = useState(2);
  const [hasRun, setHasRun] = useState(true);
  const [currentSegment, setCurrentSegment] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const result = useMemo(
    () => simulateCpu(algorithm, processes, quantum),
    [algorithm, processes, quantum]
  );
  const comparisons = useMemo(
    () => algorithms.map((item) => simulateCpu(item, processes, quantum)),
    [processes, quantum]
  );
  const safeCurrentSegment = Math.min(
    currentSegment,
    Math.max(result.segments.length - 1, 0)
  );
  const visibleSegments = result.segments.slice(0, safeCurrentSegment + 1);
  const activeSegment = result.segments[safeCurrentSegment];
  const currentCpuStep =
    result.steps[Math.min(safeCurrentSegment, result.steps.length - 1)];
  const processIds = useMemo(
    () =>
      Array.from(
        new Set(
          result.segments
            .map((segment) => segment.processId)
            .filter((processId) => processId !== "IDLE")
        )
      ),
    [result.segments]
  );

  useEffect(() => {
    if (!isPlaying || safeCurrentSegment >= result.segments.length - 1) return;
    const timer = window.setTimeout(() => {
      setCurrentSegment((value) => Math.min(value + 1, result.segments.length - 1));
    }, 700);
    return () => window.clearTimeout(timer);
  }, [isPlaying, result.segments.length, safeCurrentSegment]);

  function updateProcess(index: number, patch: Partial<ProcessInput>) {
    setProcesses((current) =>
      current.map((process, processIndex) =>
        processIndex === index ? { ...process, ...patch } : process
      )
    );
  }

  function addProcess() {
    setProcesses((current) => [
      ...current,
      { id: `P${current.length + 1}`, arrival: current.length, burst: 4, priority: 2 }
    ]);
  }

  function processColor(processId: string) {
    if (processId === "IDLE") return "hsl(var(--muted-foreground))";
    const index = processIds.indexOf(processId);
    return processPalette[Math.max(index, 0) % processPalette.length];
  }

  function segmentWidth(start: number, end: number) {
    const duration = Math.max(end - start, 1);
    return Math.min(Math.max(duration * 18, 58), 108);
  }

  return (
    <div className="grid min-w-0 gap-4 xl:grid-cols-[minmax(360px,440px)_minmax(0,1fr)]">
      <div className="min-w-0 space-y-4">
        <Panel title="Input Panel" description="Edit processes, choose an algorithm, then run the simulation.">
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-1">
              <Label>Algorithm</Label>
              <select
                value={algorithm}
                onChange={(event) => setAlgorithm(event.target.value as CpuAlgorithm)}
                className="h-9 w-full rounded-md border bg-background px-3 text-sm"
              >
                {algorithms.map((item) => (
                  <option key={item} value={item}>
                    {cpuAlgorithmLabels[item]}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-1">
              <Label>Time quantum</Label>
              <Input
                type="number"
                min={1}
                value={numberInputValue(quantum)}
                onChange={(event) => setQuantum(numberInputChange(event.target.value))}
              />
            </div>
          </div>
          <div className="mt-4 overflow-hidden rounded-md border">
            <table className="w-full text-sm">
              <thead className="bg-muted text-xs text-muted-foreground">
                <tr>
                  <th className="p-2 text-left">PID</th>
                  <th className="p-2 text-left">Arrival</th>
                  <th className="p-2 text-left">Burst</th>
                  <th className="p-2 text-left">Priority</th>
                  <th className="p-2" />
                </tr>
              </thead>
              <tbody>
                {processes.map((process, index) => (
                  <tr key={`${process.id}-${index}`} className="border-t">
                    <td className="p-2">
                      <Input
                        value={process.id}
                        onChange={(event) => updateProcess(index, { id: event.target.value })}
                      />
                    </td>
                    <td className="p-2">
                      <Input
                        type="number"
                        value={numberInputValue(process.arrival)}
                        onChange={(event) =>
                          updateProcess(index, { arrival: numberInputChange(event.target.value) })
                        }
                      />
                    </td>
                    <td className="p-2">
                      <Input
                        type="number"
                        min={1}
                        value={numberInputValue(process.burst)}
                        onChange={(event) =>
                          updateProcess(index, { burst: numberInputChange(event.target.value) })
                        }
                      />
                    </td>
                    <td className="p-2">
                      <Input
                        type="number"
                        min={1}
                        value={numberInputValue(process.priority)}
                        onChange={(event) =>
                          updateProcess(index, { priority: numberInputChange(event.target.value) })
                        }
                      />
                    </td>
                    <td className="p-2 text-right">
                      <Button
                        variant="ghost"
                        size="icon"
                        aria-label="Remove process"
                        onClick={() =>
                          setProcesses((current) =>
                            current.filter((_, processIndex) => processIndex !== index)
                          )
                        }
                      >
                        <Trash2 />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            <Button variant="secondary" onClick={addProcess}>
              <Plus /> Add
            </Button>
            <Button variant="outline" onClick={() => setProcesses(cpuSample)}>
              <RotateCcw /> Sample
            </Button>
            <Button
              variant="outline"
              onClick={() =>
                setProcesses(
                  Array.from({ length: 5 }, (_, index) => ({
                    id: `P${index + 1}`,
                    arrival: index,
                    burst: 2 + ((index * 3) % 8),
                    priority: 1 + (index % 4)
                  }))
                )
              }
            >
              <BarChart3 /> Random
            </Button>
            <Button
              onClick={() => {
                setHasRun(true);
                setCurrentSegment(0);
                setIsPlaying(true);
              }}
            >
              <Play /> Run
            </Button>
          </div>
        </Panel>
        <Panel title="Comparison Mode">
          <div className="space-y-2">
            {comparisons.map((item) => (
              <div key={item.algorithm} className="flex items-center justify-between rounded-md border p-3">
                <span className="text-sm font-medium">{cpuAlgorithmLabels[item.algorithm]}</span>
                <span className="text-xs text-muted-foreground">
                  WT {item.averageWaiting.toFixed(2)} • TAT {item.averageTurnaround.toFixed(2)}
                </span>
              </div>
            ))}
          </div>
        </Panel>
      </div>

      <div className="min-w-0 space-y-4">
        <div className="grid gap-3 md:grid-cols-3">
          <MetricCard label="Average waiting" value={result.averageWaiting.toFixed(2)} />
          <MetricCard label="Average turnaround" value={result.averageTurnaround.toFixed(2)} />
          <MetricCard label="Average response" value={result.averageResponse.toFixed(2)} />
        </div>
        <Panel title="Animated Gantt Timeline" description="Press play to grow the chart one CPU decision at a time.">
          <div className="max-w-full overflow-hidden rounded-md border bg-muted/40 p-3">
            <div className="mb-4 grid gap-3 sm:grid-cols-[220px_1fr]">
              <div className="rounded-md border bg-background p-3">
                <p className="text-xs font-medium uppercase text-muted-foreground">
                  Currently executing
                </p>
                <div className="mt-2 flex min-w-0 items-center gap-2">
                  <span
                    className="inline-flex size-3 shrink-0 rounded-sm"
                    style={{ backgroundColor: processColor(activeSegment?.processId ?? "IDLE") }}
                  />
                  <span className="truncate text-2xl font-semibold">
                    {activeSegment?.processId ?? "-"}
                  </span>
                </div>
                <p className="mt-1 text-xs text-muted-foreground">
                  {activeSegment
                    ? `t = ${activeSegment.start} to ${activeSegment.end}`
                    : "Press play to start"}
                </p>
              </div>
              <div className="min-w-0 rounded-md border bg-background p-3">
                <p className="text-xs font-medium uppercase text-muted-foreground">
                  Process colors
                </p>
                <div className="mt-2 flex min-w-0 flex-wrap gap-2">
                  {processIds.map((processId) => (
                    <Badge key={processId} variant="outline" className="gap-1.5">
                      <span
                        className="size-2.5 rounded-sm"
                        style={{ backgroundColor: processColor(processId) }}
                      />
                      {processId}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
            <div className="max-w-full overflow-x-auto rounded-md border bg-background">
              <div className="flex h-14 w-max min-w-full">
                {visibleSegments.map((segment, index) => {
                  const isActive = index === safeCurrentSegment;
                  return (
                    <div
                      key={`${segment.processId}-${segment.start}-${index}`}
                      className="min-w-[58px] max-w-[108px] shrink-0 border-r p-1 transition-colors last:border-r-0"
                      style={{
                        width: segmentWidth(segment.start, segment.end)
                      }}
                      title={`${segment.processId}: ${segment.start} to ${segment.end}`}
                    >
                      <div
                        className="flex h-full min-w-0 items-center justify-center rounded-sm px-2 text-xs font-semibold text-white shadow-sm"
                        style={{
                          backgroundColor: processColor(segment.processId),
                          outline: isActive ? "3px solid hsl(var(--accent))" : "0 solid transparent",
                          outlineOffset: "-3px"
                        }}
                      >
                        <span className="block max-w-full truncate">{segment.processId}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
              <div className="flex w-max min-w-full border-t bg-muted/30 text-[11px] text-muted-foreground">
                {visibleSegments.map((segment, index) => {
                  return (
                    <div
                      key={`${segment.processId}-${segment.start}-time-${index}`}
                      className="min-w-[58px] max-w-[108px] shrink-0 px-1 py-1 text-right"
                      style={{
                        width: segmentWidth(segment.start, segment.end)
                      }}
                    >
                      <span className="inline-block max-w-full truncate pl-1">
                        {index === 0 ? `${segment.start} / ` : ""}
                        {segment.end}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
            <div className="mt-4 flex flex-wrap items-center gap-2">
              <Button
                variant="outline"
                size="icon"
                aria-label="Previous step"
                onClick={() => {
                  setIsPlaying(false);
                  setCurrentSegment((value) => Math.max(value - 1, 0));
                }}
              >
                <ChevronLeft />
              </Button>
              <Button
                onClick={() => {
                  if (safeCurrentSegment >= result.segments.length - 1) {
                    setCurrentSegment(0);
                  }
                  setIsPlaying((value) => !value);
                }}
              >
                {isPlaying ? <Pause /> : <Play />}
                {isPlaying ? "Pause" : "Play"}
              </Button>
              <Button
                variant="outline"
                size="icon"
                aria-label="Next step"
                onClick={() => {
                  setIsPlaying(false);
                  setCurrentSegment((value) =>
                    Math.min(value + 1, Math.max(result.segments.length - 1, 0))
                  );
                }}
              >
                <ChevronRight />
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setCurrentSegment(0);
                  setIsPlaying(false);
                }}
              >
                <RotateCcw /> Reset
              </Button>
              <span className="text-xs text-muted-foreground">
                Step {Math.min(safeCurrentSegment + 1, result.segments.length)} of{" "}
                {result.segments.length || 1}
              </span>
            </div>
            <Input
              className="mt-3"
              type="range"
              min={0}
              max={Math.max(result.segments.length - 1, 0)}
              value={safeCurrentSegment}
              onChange={(event) => {
                setIsPlaying(false);
                setCurrentSegment(Number(event.target.value));
              }}
            />
          </div>
          <div className="mt-4 flex gap-2">
            <Button variant="outline">
              <Save /> Save result
            </Button>
            <Button variant="outline">
              <Download /> Export
            </Button>
          </div>
        </Panel>
        <Panel title="Timeline Stepper" description="Ready queue and remaining times at each decision point.">
          <div className="grid max-h-[460px] min-w-0 gap-3 overflow-y-auto pr-1 md:grid-cols-2">
            {hasRun &&
              result.steps.slice(0, safeCurrentSegment + 1).map((step) => (
                <div key={`${step.time}-${step.running}`} className="min-w-0 rounded-md border p-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-semibold">t = {step.time}</span>
                    <Badge variant="success">Running {step.running}</Badge>
                  </div>
                  <p className="mt-2 truncate text-xs text-muted-foreground">
                    Ready: {step.readyQueue.join(", ") || "empty"}
                  </p>
                </div>
              ))}
            {currentCpuStep && (
              <div className="min-w-0 rounded-md border border-primary/30 bg-primary/5 p-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold">Current decision</span>
                  <Badge variant="default">{currentCpuStep.running}</Badge>
                </div>
                <p className="mt-2 text-xs text-muted-foreground">
                  Time {currentCpuStep.time}; ready queue{" "}
                  {currentCpuStep.readyQueue.join(", ") || "empty"}
                </p>
              </div>
            )}
          </div>
        </Panel>
        <Panel title="Per-process Breakdown">
          <div className="overflow-hidden rounded-md border">
            <table className="w-full text-sm">
              <thead className="bg-muted text-xs text-muted-foreground">
                <tr>
                  {["PID", "CT", "TAT", "WT", "RT"].map((heading) => (
                    <th key={heading} className="p-2 text-left">
                      {heading}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {result.processes.map((process) => (
                  <tr key={process.id} className="border-t">
                    <td className="p-2 font-medium">{process.id}</td>
                    <td className="p-2">{process.completion}</td>
                    <td className="p-2">{process.turnaround}</td>
                    <td className="p-2">{process.waiting}</td>
                    <td className="p-2">{process.response}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Panel>
      </div>
    </div>
  );
}
