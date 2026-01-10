"use server";

import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/prisma";

export async function getCaptureSyncStatus() {
  const { userId } = await auth();
  if (!userId) return { lastCaptureSyncAt: null };

  const user = await db.user.findUnique({
    where: { clerkUserId: userId },
    select: { lastCaptureSyncAt: true },
  });

  return { lastCaptureSyncAt: user?.lastCaptureSyncAt || null };
}
