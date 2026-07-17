import { NextResponse } from "next/server";
import { db } from "@/lib/prisma";
import { resolveRequestUser } from "@/lib/auth/resolve-request-user";
import { parseTransaction } from "@/lib/transaction-capture/parse";
import { findDuplicate } from "@/lib/transaction-capture/dedupe";
import { categorizeTransaction } from "@/lib/transaction-capture/categorize";

// Authenticated via either a web session (Clerk cookie) or a paired device's
// Bearer token — see lib/auth/resolve-request-user.js.
export async function POST(req) {
  const user = await resolveRequestUser(req);
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const { sourceChannel, rawText, timestamp } = body;

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

  // Prefer the date printed in the message; otherwise the device's capture
  // timestamp (when the transaction actually happened, even if this request
  // arrives later from the offline outbox); "now" only as a last resort.
  const parsedDate =
    parsed.date instanceof Date && !Number.isNaN(parsed.date.getTime())
      ? parsed.date
      : null;
  const deviceDateRaw = timestamp ? new Date(timestamp) : null;
  const deviceDate =
    deviceDateRaw && !Number.isNaN(deviceDateRaw.getTime()) ? deviceDateRaw : null;

  let candidateDate = parsedDate || deviceDate || new Date();
  // Message-printed dates are date-only (midnight). When the device timestamp
  // falls on the same calendar day, use it instead — it carries the real
  // time-of-day, which keeps the ±5min dedup window meaningful.
  if (
    parsedDate &&
    deviceDate &&
    parsedDate.getFullYear() === deviceDate.getFullYear() &&
    parsedDate.getMonth() === deviceDate.getMonth() &&
    parsedDate.getDate() === deviceDate.getDate()
  ) {
    candidateDate = deviceDate;
  }

  const duplicate = await findDuplicate(user.id, {
    referenceNumber: parsed.referenceNumber,
    amount: parsed.amount,
    direction: parsed.direction,
    date: candidateDate,
  });

  if (duplicate) {
    await db.user.update({
      where: { id: user.id },
      data: { lastCaptureSyncAt: new Date() },
    });
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

  await db.user.update({
    where: { id: user.id },
    data: { lastCaptureSyncAt: new Date() },
  });

  return NextResponse.json({ status: "created", data: pendingTransaction }, { status: 201 });
}
