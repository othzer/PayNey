import { db } from "@/lib/prisma";

const FIVE_MINUTES_MS = 5 * 60 * 1000;

// Finds an existing match for this candidate, if any (PendingTransaction of any
// status, or a confirmed Transaction). Returns the matching record or null.
export async function findDuplicate(userId, candidate) {
  const { referenceNumber, amount, direction, date } = candidate;

  if (referenceNumber) {
    // The confirmed Transaction model has no referenceNumber field to cross-check —
    // but confirming a PendingTransaction updates its status rather than deleting the
    // row, so this check alone still catches re-sent duplicates after confirmation.
    return db.pendingTransaction.findFirst({
      where: { userId, referenceNumber },
    });
  }

  const windowStart = new Date(date.getTime() - FIVE_MINUTES_MS);
  const windowEnd = new Date(date.getTime() + FIVE_MINUTES_MS);

  const existingPending = await db.pendingTransaction.findFirst({
    where: {
      userId,
      parsedDirection: direction,
      parsedAmount: amount,
      parsedDate: { gte: windowStart, lte: windowEnd },
    },
  });
  if (existingPending) return existingPending;

  const type = direction === "credit" ? "INCOME" : "EXPENSE";
  return db.transaction.findFirst({
    where: {
      userId,
      type,
      amount,
      date: { gte: windowStart, lte: windowEnd },
    },
  });
}
