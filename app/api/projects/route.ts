import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

import { prisma } from "@/lib/db";

export async function GET() {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!process.env.DATABASE_URL) return NextResponse.json([]);

  const projects = await prisma.simulationProject.findMany({
    where: { clerkUserId: userId },
    orderBy: { updatedAt: "desc" }
  });
  return NextResponse.json(projects);
}

export async function POST(request: Request) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!process.env.DATABASE_URL) {
    return NextResponse.json({ error: "DATABASE_URL is not configured" }, { status: 503 });
  }

  const body = await request.json();
  const project = await prisma.simulationProject.create({
    data: {
      clerkUserId: userId,
      title: body.title ?? "Untitled simulation",
      moduleType: body.moduleType,
      algorithm: body.algorithm,
      inputData: body.inputData ?? {}
    }
  });
  await prisma.recentActivity.create({
    data: {
      clerkUserId: userId,
      action: "project.created",
      metadata: { projectId: project.id, moduleType: project.moduleType }
    }
  });
  return NextResponse.json(project, { status: 201 });
}
