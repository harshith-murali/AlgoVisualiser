import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

import { prisma } from "@/lib/db";
import { databaseResponse } from "@/lib/database-response";

export async function GET() {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  return databaseResponse(() => prisma.recentActivity.findMany({
    where: { clerkUserId: userId },
    orderBy: { createdAt: "desc" },
    take: 30
  }));
}
