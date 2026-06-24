import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  Cpu,
  HardDrive,
  Layers3,
  LockKeyhole,
  PlayCircle,
  Sparkles
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

const modules = [
  {
    title: "CPU Scheduling",
    icon: Cpu,
    copy: "Animate Gantt charts for FCFS, SJF, SRTF, Round Robin, and Priority scheduling."
  },
  {
    title: "Page Replacement",
    icon: Layers3,
    copy: "Trace FIFO, LRU, and Optimal frame transitions with hit and miss explanations."
  },
  {
    title: "Disk Scheduling",
    icon: HardDrive,
    copy: "Plot head movement for FCFS, SSTF, SCAN, C-SCAN, LOOK, and C-LOOK."
  },
  {
    title: "Deadlock Safety",
    icon: LockKeyhole,
    copy: "Compute need matrices, safe sequences, unsafe states, and request safety."
  }
];

const faqs = [
  ["Is this just a calculator?", "No. Every module exposes step traces, visual playback, metrics, and comparisons."],
  ["Can students experiment freely?", "Yes. Inputs update instantly, and playback controls make each decision easy to inspect."],
  ["Does it use real OS algorithms?", "The simulator logic is typed and implemented locally, so interactions update immediately."],
  ["Can this become a portfolio project?", "It is structured as a polished interactive OS lab with reusable simulator modules."]
];

export default function LandingPage() {
  return (
    <main className="bg-background">
      <section className="relative overflow-hidden border-b">
        <div className="container grid min-h-[92vh] items-center gap-8 py-12 lg:grid-cols-[0.9fr_1.1fr] lg:py-16">
          <div className="relative z-10 max-w-2xl">
            <Badge variant="secondary" className="mb-4">
              <Sparkles className="mr-1 size-3" /> Portfolio-grade OS lab
            </Badge>
            <h1 className="text-4xl font-semibold tracking-normal sm:text-5xl lg:text-6xl">
              OS Algorithm Simulator
            </h1>
            <p className="mt-5 max-w-xl text-base leading-7 text-muted-foreground sm:text-lg">
              Learn scheduling, memory, disk, and deadlock algorithms through
              interactive execution traces, animated metrics, and step-by-step playback.
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              <Button asChild size="lg">
                <Link href="/sign-up">
                  Start simulating <ArrowRight />
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline">
                <Link href="/dashboard">
                  <PlayCircle /> Open demo
                </Link>
              </Button>
            </div>
          </div>
          <div className="relative">
            <Image
              src="/images/os-simulator-hero.png"
              width={1200}
              height={800}
              priority
              alt="OS Algorithm Simulator dashboard mockup"
              className="rounded-lg border shadow-panel"
            />
          </div>
        </div>
      </section>

      <section className="container py-12">
        <div className="mb-6 max-w-2xl">
          <h2 className="text-2xl font-semibold">Built for how OS is actually learned</h2>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">
            Students can change inputs, watch each decision, compare algorithms, and
            inspect useful runs for reports or viva preparation.
          </p>
        </div>
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {modules.map((module) => {
            const Icon = module.icon;
            return (
              <Card key={module.title}>
                <CardContent className="p-5">
                  <div className="mb-4 flex size-10 items-center justify-center rounded-md bg-primary/10 text-primary">
                    <Icon className="size-5" />
                  </div>
                  <h3 className="font-semibold">{module.title}</h3>
                  <p className="mt-2 text-sm leading-6 text-muted-foreground">{module.copy}</p>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </section>

      <section className="border-y bg-card">
        <div className="container grid gap-8 py-12 lg:grid-cols-2">
          <div>
            <h2 className="text-2xl font-semibold">Why this project stands out</h2>
            <p className="mt-3 text-sm leading-6 text-muted-foreground">
              Most OS projects stop at final averages. This one teaches the reasoning:
              why a process ran, why a page was replaced, where the disk head moved,
              and how Banker’s Algorithm proves safety.
            </p>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            {["Typed algorithm engine", "Live playback controls", "Step-by-step state panels", "Comparison-first UX"].map(
              (item) => (
                <div key={item} className="rounded-md border bg-background p-4 text-sm font-medium">
                  {item}
                </div>
              )
            )}
          </div>
        </div>
      </section>

      <section className="container grid gap-8 py-12 lg:grid-cols-[0.8fr_1.2fr]">
        <div>
          <h2 className="text-2xl font-semibold">Student-centric by design</h2>
          <p className="mt-3 text-sm leading-6 text-muted-foreground">
            “The step panels make it easy to explain the algorithm in a lab record
            instead of memorizing a table of answers.”
          </p>
        </div>
        <div className="grid gap-3 md:grid-cols-2">
          {faqs.map(([question, answer]) => (
            <Card key={question}>
              <CardContent className="p-4">
                <h3 className="text-sm font-semibold">{question}</h3>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">{answer}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>
    </main>
  );
}
