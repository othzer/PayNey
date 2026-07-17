// India-first phone normalization. Deliberately hand-rolled rather than pulling
// in libphonenumber-js — the whole app is India-only (₹ currency, Indian bank
// SMS parsing, no i18n anywhere), so a full international parser would be dead
// weight. A missing country code fails *silently* in wa.me (the link just
// doesn't resolve to a chat), so we always store a fully-qualified +91… number
// and reject anything we can't confidently normalize.

// Returns { ok: true, e164 } on success, or { ok: false } if the input can't be
// turned into a valid Indian mobile number.
export function normalizePhone(input) {
  if (typeof input !== "string") return { ok: false };

  // Strip everything that isn't a digit or a leading plus.
  const trimmed = input.trim();
  const hasPlus = trimmed.startsWith("+");
  let digits = trimmed.replace(/\D/g, "");

  // Drop a leading 0 (STD-style "098765…") before country-code checks.
  if (digits.startsWith("0")) digits = digits.replace(/^0+/, "");

  // Already carries the 91 country code (with or without the +): expect
  // 91 + 10 national digits.
  if ((hasPlus || digits.length > 10) && digits.startsWith("91")) {
    const national = digits.slice(2);
    if (isValidIndianMobile(national)) return { ok: true, e164: `+91${national}` };
    return { ok: false };
  }

  // Bare 10-digit national number.
  if (isValidIndianMobile(digits)) return { ok: true, e164: `+91${digits}` };

  return { ok: false };
}

// Indian mobile numbers are 10 digits starting 6-9.
function isValidIndianMobile(national) {
  return /^[6-9]\d{9}$/.test(national);
}

// +919876543210 -> "+91 98765 43210" for display.
export function formatPhoneForDisplay(e164) {
  if (typeof e164 !== "string") return "";
  const match = e164.match(/^\+91(\d{5})(\d{5})$/);
  if (!match) return e164;
  return `+91 ${match[1]} ${match[2]}`;
}

// Digits only, no plus — the form wa.me expects in its path (wa.me/919876543210).
export function toWhatsAppDigits(e164) {
  if (typeof e164 !== "string") return "";
  return e164.replace(/\D/g, "");
}
