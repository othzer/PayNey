import { NextResponse } from "next/server";
import { db } from "@/lib/prisma";
import { resolveRequestUser } from "@/lib/auth/resolve-request-user";

// Persists a receipt the user reviewed on the capture app into the Review queue
// as a pending transaction. Unlike POST /api/transactions/receipt (which only
// extracts fields), this one creates a PendingTransaction so it shows up on the
// web for final categorization/approval. Receipts are always spends, so the
// direction is fixed to "debit"; confidence stays "low" so the Review UI still
// asks the user to confirm rather than auto-accepting OCR output.
// Authenticated via either a Clerk session or a Bearer device token.
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

  const { amount, merchant, date, category } = body;

  const parsedAmount = Number(amount);
  if (!Number.isFinite(parsedAmount) || parsedAmount <= 0) {
    return NextResponse.json(
      { error: "A positive amount is required" },
      { status: 400 }
    );
  }

  const candidateDate = date ? new Date(date) : new Date();
  const parsedDate = Number.isNaN(candidateDate.getTime())
    ? new Date()
    : candidateDate;

  const merchantName =
    typeof merchant === "string" && merchant.trim() ? merchant.trim() : null;

  const pendingTransaction = await db.pendingTransaction.create({
    data: {
      userId: user.id,
      sourceChannel: "receipt",
      rawText: null,
      referenceNumber: null,
      parsedAmount,
      parsedDirection: "debit",
      parsedMerchant: merchantName,
      parsedDate,
      suggestedCategory:
        typeof category === "string" && category.trim() ? category.trim() : null,
      suggestedName: merchantName,
      confidence: "low",
      status: "pending",
    },
  });

  await db.user.update({
    where: { id: user.id },
    data: { lastCaptureSyncAt: new Date() },
  });

  return NextResponse.json(
    { status: "created", id: pendingTransaction.id },
    { status: 201 }
  );
}
