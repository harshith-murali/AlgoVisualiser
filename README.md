# OS Algorithm Simulator

An interactive Operating Systems algorithm visualizer built for CSE students.
It focuses on step-by-step simulation rather than final-answer tables.

## Features

- CPU Scheduling simulator with FCFS, SJF, SRTF, Round Robin, and Priority scheduling.
- Animated Gantt playback with play, pause, previous, next, reset, and slider controls.
- Page Replacement simulator for FIFO, LRU, and Optimal with frame-by-frame playback.
- Disk Scheduling simulator for FCFS, SSTF, SCAN, C-SCAN, LOOK, and C-LOOK with animated head movement.
- Banker’s Algorithm simulator with need matrix calculation, work-vector tracing, safe sequence discovery, and request checks.
- Light/dark dashboard UI with responsive layouts and bounded visualizations.
- Custom loading and not-found pages.

## Tech Stack

- Next.js App Router
- TypeScript
- Tailwind CSS
- Clerk authentication
- Neon Postgres
- Prisma ORM
- Radix/shadcn-style UI primitives
- Recharts
- Lucide React

## Getting Started

Install dependencies:

```bash
npm install
```

Create local environment variables:

```bash
cp .env.example .env.local
```

Fill in:

```bash
DATABASE_URL="postgresql://..."
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY="pk_test_..."
CLERK_SECRET_KEY="sk_test_..."
```

Generate Prisma client:

```bash
npm run prisma:generate
```

Run locally:

```bash
npm run dev
```

Open:

```bash
http://127.0.0.1:3000
```

## Database

Apply schema changes:

```bash
npm run prisma:migrate
```

The schema includes models for simulation projects, runs, presets, and recent
activity. The visible UI is currently focused on algorithm simulation.

## Validation

```bash
npm run lint
npm run typecheck
npm run build
```

## Project Structure

```text
app/                    Next.js routes, dashboard, auth, API routes
components/dashboard/   Dashboard shell and navigation
components/simulators/  Interactive simulator UI modules
components/ui/          Reusable UI primitives
lib/simulators/         Typed algorithm engines
prisma/                 Prisma schema and migrations
public/images/          Static visual assets
```

## Security Notes

Do not commit `.env` or `.env.local`. They are ignored by `.gitignore`.
