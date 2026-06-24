import Link from "next/link";
import { ArrowLeft, Cpu, Home } from "lucide-react";

import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-background p-6">
      <section className="w-full max-w-2xl rounded-lg border bg-card p-8 text-center shadow-panel">
        <div className="mx-auto flex size-14 items-center justify-center rounded-md bg-primary/10 text-primary">
          <Cpu className="size-7" />
        </div>
        <p className="mt-6 text-xs font-semibold uppercase text-muted-foreground">
          404 · Invalid state
        </p>
        <h1 className="mt-2 text-3xl font-semibold">This simulation path does not exist.</h1>
        <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-muted-foreground">
          The route may have been removed, renamed, or typed incorrectly. Return to
          the simulator dashboard and choose an algorithm module.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <Button asChild>
            <Link href="/dashboard">
              <Home /> Dashboard
            </Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/">
              <ArrowLeft /> Landing page
            </Link>
          </Button>
        </div>
      </section>
    </main>
  );
}
