import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

import { prisma } from "@/lib/db";

export async function GET() {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!process.env.DATABASE_URL) return NextResponse.json([]);

  const presets = await prisma.savedPreset.findMany({
    where: {
      OR: [{ clerkUserId: userId }, { isPublic: true }]
    },
    orderBy: { createdAt: "desc" }
  });
  return NextResponse.json(presets);
}

export async function POST(request: Request) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!process.env.DATABASE_URL) {
    return NextResponse.json({ error: "DATABASE_URL is not configured" }, { status: 503 });
  }

  const body = await request.json();
  const preset = await prisma.savedPreset.create({
    data: {
      clerkUserId: userId,
      name: body.name ?? "Untitled preset",
      moduleType: body.moduleType,
      algorithm: body.algorithm,
      presetData: body.presetData ?? {},
      isPublic: Boolean(body.isPublic)
    }
  });
  await prisma.recentActivity.create({
    data: {
      clerkUserId: userId,
      action: "preset.created",
      metadata: { presetId: preset.id, moduleType: preset.moduleType }
    }
  });
  return NextResponse.json(preset, { status: 201 });
}
