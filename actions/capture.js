"use server";

import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/prisma";

export async function getCaptureConnectionStatus() {
  const { userId } = await auth();
  if (!userId) return { hasDevice: false, lastCaptureSyncAt: null };

  const user = await db.user.findUnique({
    where: { clerkUserId: userId },
    select: { id: true, lastCaptureSyncAt: true },
  });
  if (!user) return { hasDevice: false, lastCaptureSyncAt: null };

  const device = await db.device.findFirst({
    where: { userId: user.id, revoked: false },
    select: { id: true },
  });

  return { hasDevice: Boolean(device), lastCaptureSyncAt: user.lastCaptureSyncAt };
}
