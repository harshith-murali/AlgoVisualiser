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
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from "recharts";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { MetricCard, Panel } from "@/components/simulators/shared";
import { numberInputChange, numberInputValue } from "@/lib/number-input";
import { diskSample } from "@/lib/sample-data";
import { simulateDisk, type DiskAlgorithm, type DiskDirection } from "@/lib/simulators/disk";

const algorithms: DiskAlgorithm[] = ["FCFS", "SSTF", "SCAN", "CSCAN", "LOOK", "CLOOK"];

export function DiskSimulator() {
  const [algorithm, setAlgorithm] = useState<DiskAlgorithm>("SCAN");
  const [requests, setRequests] = useState(diskSample.requests.join(" "));
  const [head, setHead] = useState(diskSample.head);
  const [diskSize, setDiskSize] = useState(diskSample.diskSize);
  const [direction, setDirection] = useState<DiskDirection>("right");
  const [currentStep, setCurrentStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const parsed = useMemo(
    () =>
      requests
        .split(/[\s,]+/)
        .map(Number)
        .filter(Number.isFinite),
    [requests]
  );
  const result = useMemo(
    () => simulateDisk(algorithm, parsed, head, diskSize, direction),
    [algorithm, parsed, head, diskSize, direction]
  );
  const comparison = algorithms.map((item) => simulateDisk(item, parsed, head, diskSize, direction));
  const safeCurrentStep = Math.min(currentStep, Math.max(result.steps.length - 1, 0));
  const visibleSteps = result.steps.slice(0, safeCurrentStep + 1);
  const activeStep = result.steps[safeCurrentStep];
  const visibleChart = result.chart.slice(0, Math.min(safeCurrentStep + 2, result.chart.length));
  const currentSeek = visibleSteps.reduce((total, step) => total + step.seek, 0);
  const currentHead = activeStep?.to ?? (Number.isFinite(head) ? head : 0);

  useEffect(() => {
    if (!isPlaying || safeCurrentStep >= result.steps.length - 1) return;
    const timer = window.setTimeout(() => {
      setCurrentStep((value) => Math.min(value + 1, result.steps.length - 1));
    }, 850);
    return () => window.clearTimeout(timer);
  }, [isPlaying, result.steps.length, safeCurrentStep]);

  return (
    <div className="grid gap-4 xl:grid-cols-[380px_1fr]">
      <div className="space-y-4">
        <Panel title="Input Panel">
          <div className="space-y-3">
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-1">
                <Label>Algorithm</Label>
                <select
                  value={algorithm}
                  onChange={(event) => setAlgorithm(event.target.value as DiskAlgorithm)}
                  className="h-9 w-full rounded-md border bg-background px-3 text-sm"
                >
                  {algorithms.map((item) => (
                    <option key={item}>{item}</option>
                  ))}
                </select>
              </div>
              <div className="space-y-1">
                <Label>Direction</Label>
                <select
                  value={direction}
                  onChange={(event) => setDirection(event.target.value as DiskDirection)}
                  className="h-9 w-full rounded-md border bg-background px-3 text-sm"
                >
                  <option value="right">Right</option>
                  <option value="left">Left</option>
                </select>
              </div>
            </div>
            <div className="space-y-1">
              <Label>Request queue</Label>
              <Input value={requests} onChange={(event) => setRequests(event.target.value)} />
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-1">
                <Label>Initial head</Label>
                <Input
                  type="number"
                  value={numberInputValue(head)}
                  onChange={(event) => setHead(numberInputChange(event.target.value))}
                />
              </div>
              <div className="space-y-1">
                <Label>Disk size</Label>
                <Input
                  type="number"
                  min={1}
                  value={numberInputValue(diskSize)}
                  onChange={(event) => setDiskSize(numberInputChange(event.target.value))}
                />
              </div>
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
                  setRequests(diskSample.requests.join(" "));
                  setHead(diskSample.head);
                  setDiskSize(diskSample.diskSize);
                  setCurrentStep(0);
                  setIsPlaying(false);
                }}
              >
                Load preset
              </Button>
            </div>
          </div>
        </Panel>
        <Panel title="Algorithm Comparison">
          <div className="space-y-2">
            {comparison.map((item) => (
              <div key={item.algorithm} className="flex items-center justify-between rounded-md border p-3">
                <span className="font-medium">{item.algorithm}</span>
                <Badge variant={item.algorithm === algorithm ? "default" : "secondary"}>
                  {item.totalSeek} seek
                </Badge>
              </div>
            ))}
          </div>
        </Panel>
      </div>
      <div className="space-y-4">
        <div className="grid gap-3 md:grid-cols-3">
          <MetricCard label="Seek so far" value={String(currentSeek)} detail={`Final: ${result.totalSeek}`} />
          <MetricCard label="Requests served" value={`${visibleSteps.length}/${result.steps.length}`} />
          <MetricCard
            label="Current head"
            value={String(currentHead)}
            detail={`Final: ${result.order.at(-1) ?? currentHead}`}
          />
        </div>
        <Panel title="Disk Head Movement" description="Press play to move the disk head through the service order.">
          <div className="mb-4 grid gap-3 md:grid-cols-[220px_1fr]">
            <div className="rounded-md border bg-muted/40 p-3">
              <p className="text-xs font-medium uppercase text-muted-foreground">
                Current movement
              </p>
              <p className="mt-2 text-2xl font-semibold">
                {activeStep ? `${activeStep.from} → ${activeStep.to}` : currentHead}
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                {activeStep ? `${activeStep.seek} cylinders this step` : "Press play to start"}
              </p>
            </div>
            <div className="rounded-md border bg-muted/40 p-3">
              <p className="text-xs font-medium uppercase text-muted-foreground">
                Pending queue
              </p>
              <div className="mt-2 flex flex-wrap gap-2">
                {result.order.slice(safeCurrentStep + 1).map((request, index) => (
                  <Badge key={`${request}-${index}`} variant="secondary">
                    {request}
                  </Badge>
                ))}
                {safeCurrentStep >= result.steps.length - 1 && (
                  <Badge variant="success">Complete</Badge>
                )}
              </div>
            </div>
          </div>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={visibleChart}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="index" />
                <YAxis domain={[0, Number.isFinite(diskSize) ? Math.max(diskSize - 1, 0) : 0]} />
                <Tooltip />
                <Line type="monotone" dataKey="head" stroke="hsl(var(--primary))" strokeWidth={3} dot />
              </LineChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-4 flex flex-wrap items-center gap-2">
            <Button
              variant="outline"
              size="icon"
              aria-label="Previous movement"
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
              aria-label="Next movement"
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
        <Panel title="Sequence Table">
          <div className="max-h-[360px] overflow-y-auto rounded-md border">
            <table className="w-full text-sm">
              <thead className="bg-muted text-xs text-muted-foreground">
                <tr>
                  <th className="p-2 text-left">From</th>
                  <th className="p-2 text-left">To</th>
                  <th className="p-2 text-left">Seek</th>
                </tr>
              </thead>
              <tbody>
                {visibleSteps.map((step, index) => (
                  <tr key={`${step.from}-${step.to}-${index}`} className="border-t">
                    <td className="p-2">{step.from}</td>
                    <td className="p-2 font-medium">{step.to}</td>
                    <td className="p-2">{step.seek}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="mt-4 flex gap-2">
            <Button variant="outline">
              <Download /> Export
            </Button>
          </div>
        </Panel>
      </div>
    </div>
  );
}
