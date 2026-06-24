import { DeadlockSimulator } from "@/components/simulators/deadlock-simulator";

export default function DeadlockPage() {
  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-semibold">Deadlock Safety</h1>
        <p className="text-sm text-muted-foreground">
          Compute need matrices, safe sequences, unsafe states, and resource request safety.
        </p>
      </div>
      <DeadlockSimulator />
    </div>
  );
}
