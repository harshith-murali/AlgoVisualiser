import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { databaseResponse } from "@/lib/database-response";
import { projectInput } from "@/lib/simulation-input";
import type { Prisma } from "@prisma/client";

export async function GET() {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  return databaseResponse(() => prisma.simulationProject.findMany({
    where: { clerkUserId: userId },
    orderBy: { updatedAt: "desc" },
    take: 100,
  }));
}

export async function POST(request: Request) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  return databaseResponse(async () => {
    const body = projectInput.parse(await request.json());
    return prisma.$transaction(async transaction => {
      const project = await transaction.simulationProject.create({
        data: {
          ...body,
          clerkUserId: userId,
          inputData: body.inputData as Prisma.InputJsonObject,
        },
      });
      await transaction.recentActivity.create({
        data: {
          clerkUserId: userId,
          action: "project.created",
          metadata: { projectId: project.id, moduleType: project.moduleType },
        },
      });
      return project;
    });
  }, 201);
}
