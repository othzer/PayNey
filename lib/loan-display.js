// Client-safe loan helpers — pure, no node/prisma imports, so they can be
// bundled into client components. (lib/loans.js imports crypto + @prisma/client
// and must stay server-only.)
import { toWhatsAppDigits } from "@/lib/phone";

// India has a single fixed offset (UTC+5:30) and no DST, so a constant is exact.
const IST_OFFSET_MS = (5 * 60 + 30) * 60 * 1000;

// Start of "today" in IST, as a UTC instant. A due date is stored as IST
// midnight of the chosen day (the calendar picks local-midnight and the app is
// India-only), so comparing against this makes a loan "due today" NOT overdue
// until tomorrow — fixing the off-by-one where a due-today loan showed overdue
// all day. Everything money-related here is IST by design (see DECISIONS.md),
// so this is the one place we do explicit tz math rather than trusting the
// server's local `new Date()`.
export function istStartOfToday(now = new Date()) {
  const shifted = new Date(now.getTime() + IST_OFFSET_MS);
  const istMidnightUtc = Date.UTC(
    shifted.getUTCFullYear(),
    shifted.getUTCMonth(),
    shifted.getUTCDate()
  );
  return new Date(istMidnightUtc - IST_OFFSET_MS);
}

// OVERDUE is computed, never stored — a loan whose due date has fully passed
// (strictly before the start of today, IST) and that isn't settled. Works on
// serialized loans (numbers, ISO/Date strings).
export function isOverdue(loan, now = new Date()) {
  if (!loan?.dueOn || loan.status === "SETTLED") return false;
  return new Date(loan.dueOn) < istStartOfToday(now);
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
