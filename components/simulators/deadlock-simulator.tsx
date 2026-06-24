"use client";

import { useEffect, useMemo, useState } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Download,
  Pause,
  Play,
  RotateCcw
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { MetricCard, Panel } from "@/components/simulators/shared";
import { numberInputChange, numberInputValue } from "@/lib/number-input";
import { deadlockSample } from "@/lib/sample-data";
import { checkResourceRequest, runBankerSafety } from "@/lib/simulators/deadlock";

function matrixToText(matrix: number[][]) {
  return matrix.map((row) => row.join(" ")).join("\n");
}

function parseMatrix(value: string) {
  return value
    .split("\n")
    .map((row) => row.trim())
    .filter(Boolean)
    .map((row) => row.split(/[\s,]+/).map(Number).filter(Number.isFinite));
}

function parseVector(value: string) {
  return value.split(/[\s,]+/).map(Number).filter(Number.isFinite);
}

export function DeadlockSimulator() {
  const [allocation, setAllocation] = useState(matrixToText(deadlockSample.allocation));
  const [maximum, setMaximum] = useState(matrixToText(deadlockSample.maximum));
  const [available, setAvailable] = useState(deadlockSample.available.join(" "));
  const [requestProcess, setRequestProcess] = useState(1);
  const [request, setRequest] = useState("1 0 2");
  const [currentStep, setCurrentStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const parsedAllocation = useMemo(() => parseMatrix(allocation), [allocation]);
  const parsedMaximum = useMemo(() => parseMatrix(maximum), [maximum]);
  const parsedAvailable = useMemo(() => parseVector(available), [available]);
  const result = useMemo(
    () => runBankerSafety(parsedAllocation, parsedMaximum, parsedAvailable),
    [parsedAllocation, parsedMaximum, parsedAvailable]
  );
  const requestResult = useMemo(
    () =>
      checkResourceRequest(
        parsedAllocation,
        parsedMaximum,
        parsedAvailable,
        requestProcess,
        parseVector(request)
      ),
    [parsedAllocation, parsedMaximum, parsedAvailable, requestProcess, request]
  );
  const safeCurrentStep = Math.min(currentStep, Math.max(result.steps.length - 1, 0));
  const visibleSteps = result.steps.slice(0, safeCurrentStep + 1);
  const activeStep = result.steps[safeCurrentStep];
  const visibleSafeSequence = visibleSteps
    .filter((step) => step.canFinish)
    .map((step) => step.process);
  const isComplete = safeCurrentStep >= result.steps.length - 1;

  useEffect(() => {
    if (!isPlaying || safeCurrentStep >= result.steps.length - 1) return;
    const timer = window.setTimeout(() => {
      setCurrentStep((value) => Math.min(value + 1, result.steps.length - 1));
    }, 900);
    return () => window.clearTimeout(timer);
  }, [isPlaying, result.steps.length, safeCurrentStep]);

  return (
    <div className="grid gap-4 xl:grid-cols-[420px_1fr]">
      <div className="space-y-4">
        <Panel title="Input Panel" description="Matrices are entered one process per line.">
          <div className="space-y-3">
            <div className="space-y-1">
              <Label>Allocation matrix</Label>
              <textarea
                value={allocation}
                onChange={(event) => setAllocation(event.target.value)}
                className="min-h-28 w-full rounded-md border bg-background p-3 font-mono text-sm"
              />
            </div>
            <div className="space-y-1">
              <Label>Maximum matrix</Label>
              <textarea
                value={maximum}
                onChange={(event) => setMaximum(event.target.value)}
                className="min-h-28 w-full rounded-md border bg-background p-3 font-mono text-sm"
              />
            </div>
            <div className="space-y-1">
              <Label>Available vector</Label>
              <Input value={available} onChange={(event) => setAvailable(event.target.value)} />
            </div>
            <div className="flex gap-2">
              <Button
                onClick={() => {
                  setCurrentStep(0);
                  setIsPlaying(true);
                }}
              >
                <Play /> Run safety
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setAllocation(matrixToText(deadlockSample.allocation));
                  setMaximum(matrixToText(deadlockSample.maximum));
                  setAvailable(deadlockSample.available.join(" "));
                  setCurrentStep(0);
                  setIsPlaying(false);
                }}
              >
                Load preset
              </Button>
            </div>
          </div>
        </Panel>
        <Panel title="Resource Request Check">
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-1">
              <Label>Process index</Label>
              <Input
                type="number"
                min={0}
                max={Math.max(parsedAllocation.length - 1, 0)}
                value={numberInputValue(requestProcess)}
                onChange={(event) => setRequestProcess(numberInputChange(event.target.value))}
              />
            </div>
            <div className="space-y-1">
              <Label>Request vector</Label>
              <Input value={request} onChange={(event) => setRequest(event.target.value)} />
            </div>
          </div>
          <div className="mt-3 rounded-md border p-3">
            <Badge variant={requestResult.grantable ? "success" : "danger"}>
              {requestResult.grantable ? "Grantable" : "Blocked"}
            </Badge>
            <p className="mt-2 text-sm text-muted-foreground">{requestResult.reason}</p>
          </div>
        </Panel>
      </div>
      <div className="space-y-4">
        <div className="grid gap-3 md:grid-cols-3">
          <MetricCard
            label="System state"
            value={isComplete ? (result.safe ? "Safe" : "Unsafe") : "Checking"}
            detail={isComplete ? (result.safe ? "Safe sequence exists" : "No complete sequence found") : "Playback in progress"}
          />
          <MetricCard label="Processes" value={String(parsedAllocation.length)} />
          <MetricCard label="Resources" value={String(parsedAvailable.length)} />
        </div>
        <Panel title="Need Matrix">
          <div className="overflow-hidden rounded-md border">
            <table className="w-full text-sm">
              <thead className="bg-muted text-xs text-muted-foreground">
                <tr>
                  <th className="p-2 text-left">Process</th>
                  {parsedAvailable.map((_, index) => (
                    <th key={index} className="p-2 text-left">
                      R{index}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {result.need.map((row, index) => (
                  <tr key={index} className="border-t">
                    <td className="p-2 font-medium">P{index}</td>
                    {row.map((cell, resourceIndex) => (
                      <td key={resourceIndex} className="p-2">
                        {cell}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Panel>
        <Panel title="Safety Execution" description="Play through each process check and watch the work vector change.">
          <div className="mb-4 grid gap-3 md:grid-cols-[220px_1fr]">
            <div className="rounded-md border bg-muted/40 p-3">
              <p className="text-xs font-medium uppercase text-muted-foreground">
                Current check
              </p>
              <div className="mt-2 flex items-center gap-2">
                <span className="text-2xl font-semibold">{activeStep?.process ?? "-"}</span>
                {activeStep && (
                  <Badge variant={activeStep.canFinish ? "success" : "warning"}>
                    {activeStep.canFinish ? "Can finish" : "Wait"}
                  </Badge>
                )}
              </div>
              <p className="mt-1 text-xs text-muted-foreground">
                Work [{activeStep?.work.join(", ") ?? parsedAvailable.join(", ")}]
              </p>
            </div>
            <div className="rounded-md border bg-muted/40 p-3">
              <p className="text-xs font-medium uppercase text-muted-foreground">
                Safe sequence found so far
              </p>
              <div className="mt-2 flex flex-wrap gap-2">
                {visibleSafeSequence.length ? (
                  visibleSafeSequence.map((process, index) => (
                    <Badge key={`${process}-${index}`} variant="success">
                      {process}
                    </Badge>
                  ))
                ) : (
                  <Badge variant="secondary">None yet</Badge>
                )}
              </div>
            </div>
          </div>
          <div className="mb-3 flex flex-wrap gap-2">
            {isComplete && result.safeSequence.map((process) => (
              <Badge key={process} variant="success">
                {process}
              </Badge>
            ))}
            {isComplete && !result.safe && <Badge variant="danger">Unsafe state detected</Badge>}
          </div>
          <div className="grid max-h-[420px] gap-3 overflow-y-auto pr-1 md:grid-cols-2">
            {visibleSteps.map((step, index) => (
              <div
                key={`${step.process}-${index}`}
                className="rounded-md border p-3"
              >
                <div className="flex items-center justify-between">
                  <span className="font-medium">{step.process}</span>
                  <Badge variant={step.canFinish ? "success" : "warning"}>
                    {step.canFinish ? "Can finish" : "Wait"}
                  </Badge>
                </div>
                <p className="mt-2 text-xs text-muted-foreground">
                  Work [{step.work.join(", ")}] • Need [{step.need.join(", ")}]
                </p>
              </div>
            ))}
          </div>
          <div className="mt-4 flex flex-wrap items-center gap-2">
            <Button
              variant="outline"
              size="icon"
              aria-label="Previous safety step"
              onClick={() => {
                setIsPlaying(false);
                setCurrentStep((value) => Math.max(value - 1, 0));
              }}
            >
              <ChevronLeft />
            </Button>
            <Button
              onClick={() => {
                if (safeCurrentStep >= result.steps.length - 1) {
                  setCurrentStep(0);
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
              aria-label="Next safety step"
              onClick={() => {
                setIsPlaying(false);
                setCurrentStep((value) => Math.min(value + 1, Math.max(result.steps.length - 1, 0)));
              }}
            >
              <ChevronRight />
            </Button>
            <Button
              variant="outline"
              onClick={() => {
                setCurrentStep(0);
                setIsPlaying(false);
              }}
            >
              <RotateCcw /> Reset
            </Button>
            <span className="text-xs text-muted-foreground">
              Step {Math.min(safeCurrentStep + 1, result.steps.length)} of {result.steps.length || 1}
            </span>
            <Button variant="outline">
              <Download /> Export
            </Button>
          </div>
          <Input
            className="mt-3"
            type="range"
            min={0}
            max={Math.max(result.steps.length - 1, 0)}
            value={safeCurrentStep}
            onChange={(event) => {
              setIsPlaying(false);
              setCurrentStep(Number(event.target.value));
            }}
          />
        </Panel>
      </div>
    </div>
  );
}
