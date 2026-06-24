import { auth } from "@clerk/nextjs/server";

import { prisma } from "@/lib/db";

const hasDatabase = Boolean(process.env.DATABASE_URL);

export async function getUserId() {
  const { userId } = await auth();
  return userId;
}

export async function listProjects() {
  const userId = await getUserId();
  if (!hasDatabase || !userId) return [];
  return prisma.simulationProject.findMany({
    where: { clerkUserId: userId },
    orderBy: { updatedAt: "desc" },
    take: 50
  });
}

export async function listRuns() {
  const userId = await getUserId();
  if (!hasDatabase || !userId) return [];
  return prisma.simulationRun.findMany({
    where: { clerkUserId: userId },
    orderBy: { createdAt: "desc" },
    take: 50
  });
}

export async function listPresets() {
  const userId = await getUserId();
  if (!hasDatabase || !userId) return [];
  return prisma.savedPreset.findMany({
    where: { clerkUserId: userId },
    orderBy: { createdAt: "desc" },
    take: 50
  });
}
