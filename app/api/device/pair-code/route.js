import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import crypto from "crypto";
import { db } from "@/lib/prisma";

// Avoids visually ambiguous characters (0/O, 1/I/l) since this is meant to be
// read off a screen and typed into a phone.
const CODE_CHARSET = "23456789ABCDEFGHJKLMNPQRSTUVWXYZ";
const CODE_LENGTH = 8;
const EXPIRY_MINUTES = 10;

function generateCode() {
  let code = "";
  for (let i = 0; i < CODE_LENGTH; i++) {
    code += CODE_CHARSET[crypto.randomInt(CODE_CHARSET.length)];
  }
  return code;
}

export async function POST() {
  const { userId: clerkUserId } = await auth();
  if (!clerkUserId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const user = await db.user.findUnique({ where: { clerkUserId } });
  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  // Only one active code per user at a time.
  await db.pairingCode.updateMany({
    where: { userId: user.id, usedAt: null },
    data: { usedAt: new Date() },
  });

  const expiresAt = new Date(Date.now() + EXPIRY_MINUTES * 60 * 1000);

  for (let attempt = 0; attempt < 5; attempt++) {
    const code = generateCode();
    try {
      const pairingCode = await db.pairingCode.create({
        data: { userId: user.id, code, expiresAt },
      });
      return NextResponse.json({
        code: pairingCode.code,
        expiresAt: pairingCode.expiresAt,
      });
    } catch (error) {
      if (error.code === "P2002") continue; // code collision, retry
      throw error;
    }
  }

  return NextResponse.json(
    { error: "Failed to generate a pairing code" },
    { status: 500 }
  );
}
