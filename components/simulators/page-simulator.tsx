"use client";

import { useEffect, useMemo, useState } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Download,
  Pause,
  Play,
  RotateCcw,
  Save
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { MetricCard, Panel } from "@/components/simulators/shared";
import { numberInputChange, numberInputValue } from "@/lib/number-input";
import { pageSample } from "@/lib/sample-data";
import { simulatePageReplacement, type PageAlgorithm } from "@/lib/simulators/page-replacement";

const algorithms: PageAlgorithm[] = ["FIFO", "LRU", "OPTIMAL"];

export function PageSimulator() {
  const [algorithm, setAlgorithm] = useState<PageAlgorithm>("LRU");
  const [references, setReferences] = useState(pageSample.references.join(" "));
  const [frames, setFrames] = useState(pageSample.frames);
  const [currentStep, setCurrentStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const parsedReferences = useMemo(
    () =>
      references
        .split(/[\s,]+/)
        .map(Number)
        .filter(Number.isFinite),
    [references]
  );
  const result = useMemo(
    () => simulatePageReplacement(algorithm, parsedReferences, frames),
    [algorithm, parsedReferences, frames]
  );
  const comparison = algorithms.map((item) =>
    simulatePageReplacement(item, parsedReferences, frames)
  );
  const safeCurrentStep = Math.min(currentStep, Math.max(result.steps.length - 1, 0));
  const visibleSteps = result.steps.slice(0, safeCurrentStep + 1);
  const activeStep = result.steps[safeCurrentStep];
  const currentFaults = visibleSteps.filter((step) => !step.hit).length;
  const currentHits = visibleSteps.filter((step) => step.hit).length;
  const currentTotal = Math.max(visibleSteps.length, 1);

  useEffect(() => {
    if (!isPlaying || safeCurrentStep >= result.steps.length - 1) return;
    const timer = window.setTimeout(() => {
      setCurrentStep((value) => Math.min(value + 1, result.steps.length - 1));
    }, 800);
    return () => window.clearTimeout(timer);
  }, [isPlaying, result.steps.length, safeCurrentStep]);

  return (
    <div className="grid gap-4 xl:grid-cols-[380px_1fr]">
      <div className="space-y-4">
        <Panel title="Input Panel">
          <div className="space-y-3">
            <div className="space-y-1">
              <Label>Algorithm</Label>
              <select
                value={algorithm}
                onChange={(event) => setAlgorithm(event.target.value as PageAlgorithm)}
                className="h-9 w-full rounded-md border bg-background px-3 text-sm"
              >
                {algorithms.map((item) => (
                  <option key={item}>{item}</option>
                ))}
              </select>
            </div>
            <div className="space-y-1">
              <Label>Reference string</Label>
              <Input value={references} onChange={(event) => setReferences(event.target.value)} />
            </div>
            <div className="space-y-1">
              <Label>Frame count</Label>
              <Input
                type="number"
                min={1}
                value={numberInputValue(frames)}
                onChange={(event) => setFrames(numberInputChange(event.target.value))}
              />
            </div>
            <div className="flex gap-2">
              <Button
                onClick={() => {
                  setCurrentStep(0);
                  setIsPlaying(true);
                }}
              >
                <Play /> Run
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setReferences(pageSample.references.join(" "));
                  setFrames(pageSample.frames);
                  setCurrentStep(0);
                  setIsPlaying(false);
                }}
              >
                Load preset
              </Button>
            </div>
          </div>
        </Panel>
        <Panel title="Side-by-side Comparison">
          <div className="space-y-2">
            {comparison.map((item) => (
              <div key={item.algorithm} className="rounded-md border p-3">
                <div className="flex items-center justify-between">
                  <span className="font-medium">{item.algorithm}</span>
                  <Badge variant={item.algorithm === algorithm ? "default" : "secondary"}>
                    {item.faults} faults
                  </Badge>
                </div>
                <p className="mt-1 text-xs text-muted-foreground">
                  Hit ratio {(item.hitRatio * 100).toFixed(1)}%
                </p>
              </div>
            ))}
          </div>
        </Panel>
      </div>
      <div className="space-y-4">
        <div className="grid gap-3 md:grid-cols-4">
          <MetricCard label="Page faults" value={String(currentFaults)} detail={`Final: ${result.faults}`} />
          <MetricCard label="Hits" value={String(currentHits)} detail={`Final: ${result.hits}`} />
          <MetricCard label="Hit ratio" value={`${((currentHits / currentTotal) * 100).toFixed(1)}%`} />
          <MetricCard label="Miss ratio" value={`${((currentFaults / currentTotal) * 100).toFixed(1)}%`} />
        </div>
        <Panel title="Frame Playback">
          <div className="rounded-md border bg-muted/40 p-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-xs font-medium uppercase text-muted-foreground">
                  Current reference
                </p>
                <div className="mt-1 flex items-center gap-2">
                  <span className="text-2xl font-semibold">{activeStep?.page ?? "-"}</span>
                  {activeStep && (
                    <Badge variant={activeStep.hit ? "success" : "warning"}>
                      {activeStep.hit ? "Hit" : "Miss"}
                    </Badge>
                  )}
                </div>
              </div>
              <div className="flex gap-2">
                {(activeStep?.frames ?? Array.from({ length: Math.max(1, frames) }, () => null)).map(
                  (frame, index) => (
                    <div
                      key={`${index}-${frame}`}
                      className="flex h-14 w-14 items-center justify-center rounded-md border bg-background text-lg font-semibold shadow-sm"
                    >
                      {frame ?? "-"}
                    </div>
                  )
                )}
              </div>
            </div>
            <p className="mt-3 text-sm text-muted-foreground">
              {activeStep?.explanation ?? "Press play to start the reference string."}
            </p>
            <div className="mt-4 flex flex-wrap items-center gap-2">
              <Button
                variant="outline"
                size="icon"
                aria-label="Previous reference"
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
                aria-label="Next reference"
                onClick={() => {
                  setIsPlaying(false);
                  setCurrentStep((value) =>
                    Math.min(value + 1, Math.max(result.steps.length - 1, 0))
                  );
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
          </div>
        </Panel>
        <Panel title="Step-by-step Frame Table">
          <div className="overflow-x-auto rounded-md border">
            <table className="w-full min-w-[720px] text-sm">
              <thead className="bg-muted text-xs text-muted-foreground">
                <tr>
                  <th className="p-2 text-left">Ref</th>
                  {Array.from({ length: Math.max(1, frames) }, (_, index) => (
                    <th key={index} className="p-2 text-left">
                      F{index + 1}
                    </th>
                  ))}
                  <th className="p-2 text-left">Result</th>
                  <th className="p-2 text-left">Explanation</th>
                </tr>
              </thead>
              <tbody>
                {visibleSteps.map((step) => (
                  <tr key={step.index} className="border-t">
                    <td className="p-2 font-medium">{step.page}</td>
                    {step.frames.map((frame, index) => (
                      <td key={index} className="p-2">
                        {frame ?? "-"}
                      </td>
                    ))}
                    <td className="p-2">
                      <Badge variant={step.hit ? "success" : "warning"}>
                        {step.hit ? "Hit" : "Miss"}
                      </Badge>
                    </td>
                    <td className="p-2 text-xs text-muted-foreground">{step.explanation}</td>
                  </tr>
                ))}
              </tbody>
            </table>
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
      </div>
    </div>
  );
}
