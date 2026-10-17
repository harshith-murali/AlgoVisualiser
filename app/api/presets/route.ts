import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { databaseResponse } from "@/lib/database-response";
import { presetInput } from "@/lib/simulation-input";
import type { Prisma } from "@prisma/client";

export async function GET() {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  return databaseResponse(() => prisma.savedPreset.findMany({
    where: { OR: [{ clerkUserId: userId }, { isPublic: true }] },
    orderBy: { createdAt: "desc" },
    take: 100,
  }));
}

export async function POST(request: Request) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  return databaseResponse(async () => {
    const body = presetInput.parse(await request.json());
    return prisma.$transaction(async transaction => {
      const preset = await transaction.savedPreset.create({
        data: {
          ...body,
          clerkUserId: userId,
          presetData: body.presetData as Prisma.InputJsonObject,
        },
      });
      await transaction.recentActivity.create({
        data: {
          clerkUserId: userId,
          action: "preset.created",
          metadata: { presetId: preset.id, moduleType: preset.moduleType },
        },
      });
      return preset;
    });
  }, 201);
}
