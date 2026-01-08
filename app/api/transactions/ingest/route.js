import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/prisma";
import { parseTransaction } from "@/lib/transaction-capture/parse";
import { findDuplicate } from "@/lib/transaction-capture/dedupe";
import { categorizeTransaction } from "@/lib/transaction-capture/categorize";

// Authenticated via the existing Clerk session for now. `deviceToken` is accepted
// (and currently unused) so the future Android app's device-based auth can be wired
// in later without a breaking body-shape change.
export async function POST(req) {
  const { userId: clerkUserId } = await auth();
  if (!clerkUserId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const user = await db.user.findUnique({ where: { clerkUserId } });
  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  let body;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const { sourceChannel, rawText, timestamp } = body;
  void body.deviceToken;

  if (sourceChannel !== "sms" && sourceChannel !== "notification") {
    return NextResponse.json(
      { error: "sourceChannel must be 'sms' or 'notification'" },
      { status: 400 }
    );
  }
  if (!rawText || typeof rawText !== "string") {
    return NextResponse.json({ error: "rawText is required" }, { status: 400 });
  }

  let parsed;
  try {
    parsed = await parseTransaction({ rawText, sourceChannel });
  } catch (error) {
    return NextResponse.json(
      { error: `Failed to parse: ${error.message}` },
      { status: 422 }
    );
  }

  if (!parsed || !Number.isFinite(parsed.amount) || !parsed.direction) {
    return NextResponse.json(
      { error: "Could not extract a transaction from the given text" },
      { status: 422 }
    );
  }

  const candidateDate =
    parsed.date instanceof Date && !Number.isNaN(parsed.date.getTime())
      ? parsed.date
      : timestamp
        ? new Date(timestamp)
        : new Date();

  const duplicate = await findDuplicate(user.id, {
    referenceNumber: parsed.referenceNumber,
    amount: parsed.amount,
    direction: parsed.direction,
    date: candidateDate,
  });

  if (duplicate) {
    return NextResponse.json({ status: "duplicate", skipped: true }, { status: 200 });
  }

  const { suggestedCategory, suggestedName, confidence } = await categorizeTransaction({
    userId: user.id,
    merchant: parsed.merchant,
    amount: parsed.amount,
    direction: parsed.direction,
  });

  const pendingTransaction = await db.pendingTransaction.create({
    data: {
      userId: user.id,
      sourceChannel,
      rawText,
      referenceNumber: parsed.referenceNumber,
      parsedAmount: parsed.amount,
      parsedDirection: parsed.direction,
      parsedMerchant: parsed.merchant,
      parsedDate: candidateDate,
      suggestedCategory,
      suggestedName,
      confidence,
      status: "pending",
    },
  });

  return NextResponse.json({ status: "created", data: pendingTransaction }, { status: 201 });
}
