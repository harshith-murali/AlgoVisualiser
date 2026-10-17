import { RefreshSavedWork } from "./refresh-saved-work";
import { listProjects, listRuns } from "@/lib/persistence";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type SavedItem = {
  id: string;
  title?: string;
  algorithm: string;
  moduleType: string;
  createdAt: Date;
  inputData: unknown;
  resultData?: unknown;
};

export async function SavedWork() {
  let data: { projects: SavedItem[]; runs: SavedItem[] } | null = null;
  let error: string | null = null;
  try {
    if (!process.env.DATABASE_URL) throw new Error("Cloud saving is not configured yet.");
    const [projects, runs] = await Promise.all([listProjects(), listRuns()]);
    data = { projects, runs };
  } catch {
    error = "Saved work is temporarily unavailable. Please refresh to retry.";
  }

  return (
    <Card>
      <CardHeader className="flex flex-row flex-wrap items-center justify-between gap-2">
        <CardTitle>Saved projects &amp; run history</CardTitle>
        <RefreshSavedWork />
      </CardHeader>
      <CardContent className="space-y-5">
        {error && <p role="alert" className="text-sm text-destructive">{error}</p>}
        {!error && data && (["projects", "runs"] as const).map(kind => (
          <section key={kind} className="min-w-0 space-y-2">
            <h3 className="font-medium">{kind === "projects" ? "Saved projects" : "Run history"}</h3>
            {data[kind].length === 0 && <p className="text-sm text-muted-foreground">{kind === "projects" ? "No saved projects yet. Use Save project in any simulator." : "No saved results yet. Use Save result to keep a run in your history."}</p>}
            {data[kind].map(item => (
              <details key={item.id} className="min-w-0 rounded-md border p-3">
                <summary className="cursor-pointer text-sm font-medium [overflow-wrap:anywhere]">
                  {item.title || `${item.algorithm} result`} <span className="font-normal text-muted-foreground">· {item.moduleType} · {new Date(item.createdAt).toLocaleString()}</span>
                </summary>
                <div className="mt-3 space-y-2 text-xs">
                  <p>Algorithm: {item.algorithm}</p>
                  <p className="font-semibold">Saved inputs</p>
                  <pre className="whitespace-pre-wrap rounded bg-muted p-3 [overflow-wrap:anywhere]">{JSON.stringify(item.inputData, null, 2)}</pre>
                  {item.resultData !== undefined && <><p className="font-semibold">Saved result</p><pre className="max-h-80 overflow-y-auto whitespace-pre-wrap rounded bg-muted p-3 [overflow-wrap:anywhere]">{JSON.stringify(item.resultData, null, 2)}</pre></>}
                </div>
              </details>
            ))}
          </section>
        ))}
      </CardContent>
    </Card>
  );
}
