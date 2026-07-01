import { NextResponse } from "next/server";
import { db } from "@/lib/prisma";
import { generateDeviceToken, hashDeviceToken } from "@/lib/auth/device-token";

// Public — called from the phone, which has no web session.
export async function POST(req) {
  let body;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const { code, label } = body;
  if (!code || typeof code !== "string") {
    return NextResponse.json({ error: "code is required" }, { status: 400 });
  }

  const pairingCode = await db.pairingCode.findUnique({
    where: { code: code.toUpperCase().trim() },
  });

  if (!pairingCode) {
    return NextResponse.json({ error: "Invalid pairing code" }, { status: 404 });
  }
  if (pairingCode.usedAt) {
    return NextResponse.json(
      { error: "This pairing code has already been used" },
      { status: 410 }
    );
  }
  if (pairingCode.expiresAt < new Date()) {
    return NextResponse.json(
      { error: "This pairing code has expired" },
      { status: 410 }
    );
  }

  const rawToken = generateDeviceToken();
  const tokenHash = hashDeviceToken(rawToken);

  await db.$transaction([
    db.pairingCode.update({
      where: { id: pairingCode.id },
      data: { usedAt: new Date() },
    }),
    db.device.create({
      data: {
        userId: pairingCode.userId,
        tokenHash,
        label: typeof label === "string" && label.trim() ? label.trim() : null,
        revoked: false,
      },
    }),
  ]);

  // Returned once — the caller must store it now, it can't be retrieved again.
  return NextResponse.json({ token: rawToken });
}
