import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { databaseResponse } from "@/lib/database-response";
import { runInput } from "@/lib/simulation-input";
import type { Prisma } from "@prisma/client";

export async function GET() {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  return databaseResponse(() => prisma.simulationRun.findMany({
    where: { clerkUserId: userId },
    orderBy: { createdAt: "desc" },
    take: 100,
  }));
}

export async function POST(request: Request) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  return databaseResponse(async () => {
    const body = runInput.parse(await request.json());
    return prisma.$transaction(async transaction => {
      const run = await transaction.simulationRun.create({
        data: {
          ...body,
          clerkUserId: userId,
          inputData: body.inputData as Prisma.InputJsonObject,
          resultData: body.resultData as Prisma.InputJsonObject,
        },
      });
      await transaction.recentActivity.create({
        data: {
          clerkUserId: userId,
          action: "run.created",
          metadata: { runId: run.id, moduleType: run.moduleType },
        },
      });
      return run;
    });
  }, 201);
}
