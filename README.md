<p align="center">
  <img src="https://img.shields.io/badge/Next.js_14-black?style=for-the-badge&logo=next.js&logoColor=white" />
  <img src="https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white" />
  <img src="https://img.shields.io/badge/TailwindCSS-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white" />
  <img src="https://img.shields.io/badge/Clerk-6C47FF?style=for-the-badge&logo=clerk&logoColor=white" />
  <img src="https://img.shields.io/badge/Neon_Postgres-00E599?style=for-the-badge&logo=postgresql&logoColor=black" />
  <img src="https://img.shields.io/badge/Prisma-2D3748?style=for-the-badge&logo=prisma&logoColor=white" />
  <img src="https://img.shields.io/badge/Recharts-FF6384?style=for-the-badge" />
</p>

# OS Algorithm Simulator — Interactive Systems Visualizer

> An interactive, high-performance Operating Systems algorithm visualizer designed for Computer Science students and systems engineers. Built to replace static textbook calculations with dynamic, frame-by-frame simulation, interactive timelines, and step-by-step state verification.

🔗 **Live Demo:** [algo-visualiser-xi.vercel.app](https://algo-visualiser-xi.vercel.app)  
📦 **Repository:** [github.com/harshith-murali/AlgoVisualiser](https://github.com/harshith-murali/AlgoVisualiser)

---

## 🚀 Key Modules & Simulators

### 1. ⚙️ CPU Scheduling Engine
Simulates uniprocessor and preemptive scheduling policies with live Gantt charts and per-process timelines:
- **Supported Algorithms**:
  - **FCFS** (First-Come, First-Served) — non-preemptive queue order
  - **SJF** (Shortest Job First) — optimal non-preemptive turnaround
  - **SRTF** (Shortest Remaining Time First) — preemptive variant of SJF
  - **Round Robin (RR)** — configurable time quantum with ready queue transitions
  - **Priority Scheduling** — both Preemptive and Non-Preemptive modes
- **Playback Controls**: Step forward, step backward, auto-play, pause, speed adjustment, and scrubbing slider.
- **Computed Metrics**: Arrival Time, Burst Time, Completion Time, Turnaround Time ($TAT = CT - AT$), and Waiting Time ($WT = TAT - BT$) with aggregate averages.

### 2. 📄 Page Replacement Simulator
Visualizes memory management and virtual memory page frame allocation:
- **Supported Policies**:
  - **FIFO** (First-In, First-Out) with queue-based frame eviction
  - **LRU** (Least Recently Used) with recency tracking stacks
  - **Optimal** (Belady’s Min) looking ahead into future reference strings
- **Analytics**: Frame-by-frame memory tables, page hit vs page fault counters, hit ratio percentage, and Belady's Anomaly comparisons.

### 3. 💽 Disk Scheduling Simulator
Visualizes magnetic disk arm trajectory across cylinders:
- **Supported Algorithms**: **FCFS**, **SSTF** (Shortest Seek Time First), **SCAN** (Elevator), **C-SCAN** (Circular SCAN), **LOOK**, and **C-LOOK**.
- **Interactive Visualizer**: Animated disk head trajectory graph showing cylinder hops and head direction reversals.
- **Metrics**: Total track head movements (total seek distance) and average seek time.

### 4. 🛡️ Banker’s Algorithm (Deadlock Avoidance)
Full matrix simulation of Dijkstra's Banker's Algorithm:
- **State Matrices**: Interactive editors for **Allocation**, **Maximum**, and **Available** resource vectors.
- **Dynamic Derivation**: Real-time calculation of the **Need Matrix** ($Need = Max - Allocation$).
- **Safety Algorithm**: Step-by-step verification showing the safe process execution sequence $<P_1, P_3, ...>$ or identifying deadlock states.
- **Resource Request Algorithm**: Test hypothetical resource allocation requests from specific processes to verify if granting them maintains system safety.

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| **Framework** | Next.js 14 (App Router) |
| **Language** | TypeScript (strict mode) |
| **Styling** | Tailwind CSS + Radix UI primitives |
| **Authentication** | Clerk Auth (OAuth + Email sign-in) |
| **Database** | Neon Serverless PostgreSQL |
| **ORM** | Prisma ORM |
| **Data Visualization** | Recharts + custom SVG Gantt charts |
| **Icons** | Lucide React |

---

## 📂 Project Structure

```text
AlgoVisualiser/
├── app/                        # Next.js App Router (dashboard, auth, simulators)
│   ├── (auth)/                 # Clerk sign-in & sign-up routes
│   ├── dashboard/              # Simulator shells & user presets
│   ├── layout.tsx              # Root layout & ClerkProvider
│   └── page.tsx                # Landing page & feature showcase
├── components/
│   ├── dashboard/              # Navigation sidebar, theme toggles, user profile
│   ├── simulators/             # Simulator UI controllers (CPU, Page, Disk, Banker)
│   └── ui/                     # Reusable design system primitives
├── lib/
│   ├── simulators/             # Pure, deterministic TypeScript algorithm engines
│   │   ├── cpu-scheduling.ts   # FCFS, SJF, SRTF, RR, Priority algorithms
│   │   ├── page-replacement.ts # FIFO, LRU, Optimal algorithms
│   │   ├── disk-scheduling.ts  # FCFS, SSTF, SCAN, LOOK algorithms
│   │   └── bankers.ts          # Matrix safety & resource request algorithms
│   └── utils.ts
├── prisma/
│   ├── schema.prisma           # Simulation runs, history, and presets
│   └── migrations/
└── package.json
```

---

## 🚀 Getting Started

### Prerequisites
- **Node.js** ≥ 18.x
- **npm** or **pnpm**

### 1. Clone & Install
```bash
git clone https://github.com/harshith-murali/AlgoVisualiser.git
cd AlgoVisualiser
npm install
```

### 2. Configure Environment Variables
Create `.env.local` in the project root:
```env
DATABASE_URL="postgresql://user:password@ep-something-pooler.neon.tech/algovisualiser?sslmode=require"
DIRECT_URL="postgresql://user:password@ep-something.neon.tech/algovisualiser?sslmode=require"
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY="pk_test_..."
CLERK_SECRET_KEY="sk_test_..."
NEXT_PUBLIC_CLERK_SIGN_IN_URL="/sign-in"
NEXT_PUBLIC_CLERK_SIGN_UP_URL="/sign-up"
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL="/dashboard"
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL="/dashboard"
```

### 3. Setup Database
```bash
npm run prisma:generate
npm run prisma:migrate
```

### 4. Run Development Server
```bash
npm run dev
# Open http://localhost:3000
```

---

## 🧪 Validation & Production Build

```bash
npm run lint         # Run ESLint validation
npm run typecheck    # Validate TypeScript types without emit (tsc --noEmit)
npm run test:storage # Authentication, input validation, and atomic save checks
npm run build        # Build optimized production bundle
```

---

## Vercel environment setup

Configure `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` and `CLERK_SECRET_KEY` from the
same Clerk application in Vercel before deploying. Also set the sign-in and
sign-up routes to `/sign-in` and `/sign-up`, and their fallback redirect URLs
to `/dashboard`. Local `.env.local` files are ignored by Git and are not
automatically copied into a Git-based Vercel deployment.

After changing environment variables, redeploy. A missing Clerk publishable
key causes protected pages such as `/dashboard` to fail in middleware. The
application uses Clerk's environment configuration directly, without a dummy key.

`DATABASE_URL` enables saved projects, runs, presets, and history. Without it,
the interactive simulations still run, but cloud persistence is unavailable.
Set `DATABASE_URL` to the pooled Neon URL (host containing `-pooler`) and
`DIRECT_URL` to the direct URL for the same database. Prisma uses `DIRECT_URL`
for migrations. Test migrations on a Neon child branch, then apply committed
migrations with `npx prisma migrate deploy` before using the persistence APIs.

Each simulator has **Save project** for its input snapshot and **Save result**
for its inputs and calculated result. The dashboard's **Saved projects & run
history** section lists the signed-in user's saved work. Expand an item to
view its inputs or results; use **Refresh** to reload the list. Saved records
and their activity entries are written in one transaction.

Neon development tooling is available in `.agents/skills/` (`neon`,
`neon-postgres`, and `neon-postgres-branches`), with versions recorded in
`skills-lock.json`. The local `.neon` context and environment files are ignored
by Git. Preserve the existing Clerk provider and Prisma ORM when working on
database changes.

---

## 📄 License
MIT License. Built for Operating Systems education and simulation.
