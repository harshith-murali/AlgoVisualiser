import { Cpu, HardDrive, Layers3, LockKeyhole } from "lucide-react";

const loaders = [
  { label: "Scheduling", icon: Cpu },
  { label: "Paging", icon: Layers3 },
  { label: "Disk", icon: HardDrive },
  { label: "Safety", icon: LockKeyhole }
];

export default function Loading() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-background p-6">
      <div className="w-full max-w-xl rounded-lg border bg-card p-6 shadow-panel">
        <div className="flex items-center gap-3">
          <div className="flex size-11 items-center justify-center rounded-md bg-primary text-primary-foreground">
            <Cpu className="size-5 animate-pulse" />
          </div>
          <div>
            <h1 className="text-lg font-semibold">Preparing simulation</h1>
            <p className="text-sm text-muted-foreground">
              Building the next algorithm state.
            </p>
          </div>
        </div>
        <div className="mt-6 grid gap-3 sm:grid-cols-4">
          {loaders.map((item, index) => {
            const Icon = item.icon;
            return (
              <div
                key={item.label}
                className="rounded-md border bg-background p-3"
                style={{ animationDelay: `${index * 120}ms` }}
              >
                <Icon className="size-4 text-primary" />
                <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-muted">
                  <div className="h-full w-2/3 animate-pulse rounded-full bg-primary" />
                </div>
                <p className="mt-2 text-xs font-medium text-muted-foreground">
                  {item.label}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </main>
  );
}
