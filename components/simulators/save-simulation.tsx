"use client";

import { useState } from "react";
import { Loader2, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { ModuleType } from "@prisma/client";

type Props = {
  moduleType: ModuleType;
  algorithm: string;
  inputData: object;
  resultData: object;
};

export function SaveSimulation({ moduleType, algorithm, inputData, resultData }: Props) {
  const [title, setTitle] = useState("");
  const [saving, setSaving] = useState<"project" | "run" | null>(null);
  const [feedback, setFeedback] = useState<{ message: string; error: boolean } | null>(null);

  async function save(kind: "project" | "run") {
    setSaving(kind);
    setFeedback(null);
    try {
      const response = await fetch(`/api/${kind === "project" ? "projects" : "runs"}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: title.trim() || `${algorithm} simulation`,
          moduleType,
          algorithm,
          inputData,
          ...(kind === "run" ? { resultData } : {}),
        }),
      });
      if (response.status === 401) throw new Error("Please sign in again to save your work.");
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Could not save. Please try again.");
      setFeedback({ message: kind === "project" ? "Project saved. Find it on your dashboard." : "Result saved to your run history.", error: false });
    } catch (error) {
      setFeedback({ message: error instanceof Error ? error.message : "Could not save. Please try again.", error: true });
    } finally {
      setSaving(null);
    }
  }

  return (
    <div className="mt-4 space-y-3 rounded-md border p-3">
      <Label className="block space-y-2">
        <span>Project name</span>
        <Input value={title} maxLength={120} placeholder={`${algorithm} simulation`} onChange={event => setTitle(event.target.value)} />
      </Label>
      <div className="flex flex-wrap gap-2">
        <Button variant="outline" disabled={saving !== null} onClick={() => save("project")}>
          {saving === "project" ? <Loader2 className="animate-spin" /> : <Save />} Save project
        </Button>
        <Button variant="outline" disabled={saving !== null} onClick={() => save("run")}>
          {saving === "run" ? <Loader2 className="animate-spin" /> : <Save />} Save result
        </Button>
      </div>
      {feedback && <p role={feedback.error ? "alert" : "status"} className={`text-sm ${feedback.error ? "text-destructive" : "text-primary"}`}>{feedback.message}</p>}
    </div>
  );
}
