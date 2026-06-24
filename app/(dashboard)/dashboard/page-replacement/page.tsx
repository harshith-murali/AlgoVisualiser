import { PageSimulator } from "@/components/simulators/page-simulator";

export default function PageReplacementPage() {
  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-semibold">Page Replacement</h1>
        <p className="text-sm text-muted-foreground">
          Trace FIFO, LRU, and Optimal frame states with hit and fault explanations.
        </p>
      </div>
      <PageSimulator />
    </div>
  );
}
