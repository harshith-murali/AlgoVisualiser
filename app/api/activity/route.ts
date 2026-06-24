import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

import { prisma } from "@/lib/db";

export async function GET() {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!process.env.DATABASE_URL) return NextResponse.json([]);

  const activity = await prisma.recentActivity.findMany({
    where: { clerkUserId: userId },
    orderBy: { createdAt: "desc" },
    take: 30
  });
  return NextResponse.json(activity);
}
