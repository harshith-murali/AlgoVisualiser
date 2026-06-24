import { DiskSimulator } from "@/components/simulators/disk-simulator";

export default function DiskPage() {
  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-semibold">Disk Scheduling</h1>
        <p className="text-sm text-muted-foreground">
          Visualize head movement and seek distance across FCFS, SSTF, SCAN, C-SCAN, LOOK, and C-LOOK.
        </p>
      </div>
      <DiskSimulator />
    </div>
  );
}
