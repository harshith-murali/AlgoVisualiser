import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

import { prisma } from "@/lib/db";

export async function GET() {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!process.env.DATABASE_URL) return NextResponse.json([]);

  const runs = await prisma.simulationRun.findMany({
    where: { clerkUserId: userId },
    orderBy: { createdAt: "desc" },
    take: 100
  });
  return NextResponse.json(runs);
}

export async function POST(request: Request) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!process.env.DATABASE_URL) {
    return NextResponse.json({ error: "DATABASE_URL is not configured" }, { status: 503 });
  }

  const body = await request.json();
  const run = await prisma.simulationRun.create({
    data: {
      clerkUserId: userId,
      moduleType: body.moduleType,
      algorithm: body.algorithm,
      inputData: body.inputData ?? {},
      resultData: body.resultData ?? {}
    }
  });
  await prisma.recentActivity.create({
    data: {
      clerkUserId: userId,
      action: "run.created",
      metadata: { runId: run.id, moduleType: run.moduleType }
    }
  });
  return NextResponse.json(run, { status: 201 });
}
