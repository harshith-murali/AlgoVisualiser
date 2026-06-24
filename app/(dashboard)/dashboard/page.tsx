import { Activity, Cpu, HardDrive, Layers3, LockKeyhole } from "lucide-react";

import { StatCard } from "@/components/dashboard/stat-card";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const modules = [
  ["CPU Scheduling", "SRTF comparison run", "Ready queue traced over 12 decisions"],
  ["Page Replacement", "LRU sample preset", "13 references, 3 frames"],
  ["Disk Scheduling", "SCAN path plotted", "Total seek distance highlighted"],
  ["Banker Safety", "Safe sequence detected", "Need matrix auto-computed"]
];

export default function DashboardPage() {
  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-semibold">Dashboard</h1>
        <p className="text-sm text-muted-foreground">
          Launch interactive OS simulators and watch each algorithm decision unfold.
        </p>
      </div>
      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Modules" value="4" icon={Activity} detail="Interactive OS concepts" />
        <StatCard label="CPU algorithms" value="6" icon={Cpu} detail="Preemptive and non-preemptive" />
        <StatCard label="Memory algorithms" value="3" icon={Layers3} detail="FIFO, LRU, Optimal" />
        <StatCard label="Disk algorithms" value="6" icon={HardDrive} detail="Seek movement charts" />
      </div>
      <div className="grid gap-4 xl:grid-cols-[1.2fr_0.8fr]">
        <Card>
          <CardHeader>
            <CardTitle>Simulation Modes</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {modules.map(([title, action, meta]) => (
              <div key={title} className="flex items-center justify-between rounded-md border p-3">
                <div>
                  <p className="text-sm font-medium">{action}</p>
                  <p className="text-xs text-muted-foreground">{meta}</p>
                </div>
                <Badge variant="secondary">{title}</Badge>
              </div>
            ))}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Learning Focus</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-muted-foreground">
            <div className="flex gap-3 rounded-md border p-3">
              <LockKeyhole className="mt-0.5 size-4 text-primary" />
              <p>Banker playback reveals every work-vector check before declaring safety.</p>
            </div>
            <div className="flex gap-3 rounded-md border p-3">
              <Cpu className="mt-0.5 size-4 text-primary" />
              <p>Comparison panels help students defend algorithm tradeoffs.</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
