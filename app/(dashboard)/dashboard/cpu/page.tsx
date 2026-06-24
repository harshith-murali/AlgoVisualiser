import { CpuSimulator } from "@/components/simulators/cpu-simulator";

export default function CpuPage() {
  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-semibold">CPU Scheduling</h1>
        <p className="text-sm text-muted-foreground">
          Compare FCFS, SJF, SRTF, Round Robin, and Priority scheduling with full metrics.
        </p>
      </div>
      <CpuSimulator />
    </div>
  );
}
