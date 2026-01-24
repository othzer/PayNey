// Client-safe loan helpers — pure, no node/prisma imports, so they can be
// bundled into client components. (lib/loans.js imports crypto + @prisma/client
// and must stay server-only.)
import { toWhatsAppDigits } from "@/lib/phone";

// OVERDUE is computed, never stored — a loan past its due date that isn't
// settled. Works on serialized loans (numbers, ISO/Date strings).
export function isOverdue(loan, now = new Date()) {
  if (!loan?.dueOn || loan.status === "SETTLED") return false;
  return new Date(loan.dueOn) < now;
}

export function remainingAmount(loan) {
  return Math.max(Number(loan.principalAmount) - Number(loan.repaidAmount), 0);
}

// A friendly, factual pre-filled WhatsApp message the *user* sends from their
// own WhatsApp — neutral wording, not a collections notice. Operates on a
// serialized loan (plain numbers).
export function buildNudgeMessage({ loan, counterpartyName, ownerName, publicUrl }) {
  const amountText = `₹${remainingAmount(loan).toFixed(2)}`;
  const name = counterpartyName || "there";
  const signoff = ownerName ? `\n\n— ${ownerName}` : "";

  if (loan.direction === "LENT") {
    const due = loan.dueOn
      ? ` It was due on ${new Date(loan.dueOn).toLocaleDateString("en-IN")}.`
      : "";
    return (
      `Hi ${name}, a gentle reminder about the ${amountText} still pending between us.${due} ` +
      `You can see the full record here: ${publicUrl}${signoff}`
    );
  }

  return (
    `Hi ${name}, just confirming I still owe you ${amountText}. ` +
    `Here's the record: ${publicUrl}${signoff}`
  );
}

export function buildWhatsAppUrl(phoneE164, message) {
  return `https://wa.me/${toWhatsAppDigits(phoneE164)}?text=${encodeURIComponent(message)}`;
}
