import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/prisma";
import { hashDeviceToken } from "@/lib/auth/device-token";

// Resolves the authenticated user for a request that may come from either the
// web app (Clerk session cookie) or a paired device (Bearer device token).
// Returns the User row, or null if neither auth method succeeds.
export async function resolveRequestUser(req) {
  const authHeader = req.headers.get("authorization");

  if (authHeader?.startsWith("Bearer ")) {
    const rawToken = authHeader.slice("Bearer ".length).trim();
    if (!rawToken) return null;

    const tokenHash = hashDeviceToken(rawToken);
    const device = await db.device.findUnique({ where: { tokenHash } });
    if (!device || device.revoked) return null;

    await db.device.update({
      where: { id: device.id },
      data: { lastSeenAt: new Date() },
    });

    return db.user.findUnique({ where: { id: device.userId } });
  }

  const { userId: clerkUserId } = await auth();
  if (!clerkUserId) return null;

  return db.user.findUnique({ where: { clerkUserId } });
}
