import crypto from "crypto";
import { Prisma } from "@prisma/client";

// A read-only capability link, like PairingCode.code — a leaked link only
// exposes figures both parties already know, so it's stored unhashed. High
// entropy (32 random bytes) makes it unguessable.
export function generatePublicToken() {
  return crypto.randomBytes(32).toString("base64url");
}

// Status is derived from repaid-vs-principal, never set by the user. The
// comparison is done in Decimal space (not after .toNumber()) so a chain of
// repayments that sums to exactly the principal lands on SETTLED instead of
// being left a float-epsilon short at PARTIALLY_REPAID.
export function computeLoanStatus(principal, repaid) {
  const p = toDecimal(principal);
  const r = toDecimal(repaid);
  if (r.lessThanOrEqualTo(0)) return "OPEN";
  if (r.greaterThanOrEqualTo(p)) return "SETTLED";
  return "PARTIALLY_REPAID";
}

// Remaining balance as a Decimal, floored at 0.
export function remainingDecimal(principal, repaid) {
  const diff = toDecimal(principal).minus(toDecimal(repaid));
  return diff.lessThan(0) ? new Prisma.Decimal(0) : diff;
}

// OVERDUE is computed, never stored — a loan past its due date that isn't
// settled. dueOn may be null (no due date set).
export function isOverdue(loan, now = new Date()) {
  if (!loan?.dueOn || loan.status === "SETTLED") return false;
  return new Date(loan.dueOn) < now;
}

function toDecimal(value) {
  return value instanceof Prisma.Decimal ? value : new Prisma.Decimal(value ?? 0);
}

// --- Serialization: Decimal -> number at the action boundary --------------
// The existing serializeAmount/serializeDecimal helpers in other action files
// are single-field (they check obj.amount / obj.balance by name) and would
// silently pass a raw Decimal through, which crashes at the RSC client
// boundary. Loan has TWO Decimal fields, so it needs its own serializer.

export function serializeRepayment(repayment) {
  return {
    ...repayment,
    amount: repayment.amount.toNumber(),
  };
}

export function serializeLoan(loan) {
  const serialized = {
    ...loan,
    principalAmount: loan.principalAmount.toNumber(),
    repaidAmount: loan.repaidAmount.toNumber(),
  };
  if (Array.isArray(loan.repayments)) {
    serialized.repayments = loan.repayments.map(serializeRepayment);
  }
  return serialized;
}

// Note: the WhatsApp nudge message/URL builders live in lib/loan-display.js
// (client-safe) since they're used from a client component — this file imports
// crypto + @prisma/client and must stay server-only.
