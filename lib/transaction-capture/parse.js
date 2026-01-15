import { getGeminiModel, cleanJsonResponse } from "@/lib/gemini";

const AMOUNT_RE = /(?:Rs\.?|INR|₹)\s?([\d,]+(?:\.\d{1,2})?)/i;
const DEBIT_KEYWORDS = /\b(debited|spent|paid|sent|withdrawn|debit)\b/i;
const CREDIT_KEYWORDS = /\b(credited|received|deposited|credit)\b/i;
// "X paid you" / "paid to you" is money *received* even though it contains the
// debit word "paid" — GPay posts exactly this ("John paid you ₹2"). Checked
// ahead of the keyword tug-of-war so it isn't misread as a spend.
const CREDIT_PHRASE_RE = /\bpaid\s+(?:to\s+)?you\b/i;
const REF_RE = /\b(?:UPI Ref(?:erence)?(?: No)?\.?|UTR|RRN)[:\s]*([A-Za-z0-9]{6,})/i;
// VPA addresses are the most reliable counterparty signal in UPI messages — checked
// first so a generic "to/at" earlier in the sentence (e.g. "credited to your account")
// doesn't win over the real "from/to VPA x@bank" segment.
const VPA_RE = /VPA\s+([A-Za-z0-9@.\-_]{2,60})/i;
// "from" is included so the counterparty of a *received* payment (e.g.
// "received ₹500 from John") is captured, not just "to/at" for spends.
const MERCHANT_RE = /\b(?:to|at|from)\s+([A-Za-z0-9][A-Za-z0-9.\-_&\s]{1,40})/i;
const DATE_RE = /\b(\d{1,2}[-/][A-Za-z]{3}[-/]?\d{2,4}|\d{1,2}[-/]\d{1,2}[-/]\d{2,4})\b/;
const MERCHANT_STOP_WORDS = new Set([
  "via",
  "using",
  "ref",
  "on",
  "dt",
  "dated",
  "upi",
  "card",
  "utr",
  "rrn",
  // UI chrome that leaks in from payment-app notifications like
  // "You received ₹500 · Tap to view" — otherwise "to view" -> merchant "view".
  "view",
  "tap",
  "your",
  "you",
]);

function parseLooseDate(text) {
  const parsed = new Date(text);
  return Number.isNaN(parsed.getTime()) ? new Date() : parsed;
}

// Regex captures are greedy/generous by design; this trims the capture down to a
// clean 1-3 word merchant name, stopping at the first stop-word or sentence break.
function cleanMerchant(raw) {
  if (!raw) return null;
  const words = raw.trim().split(/\s+/);
  const kept = [];
  for (const word of words) {
    const endsSentence = /[.,]$/.test(word);
    const lower = word.toLowerCase().replace(/[^a-z]/g, "");
    if (MERCHANT_STOP_WORDS.has(lower)) break;
    kept.push(word.replace(/[.,]+$/, ""));
    if (endsSentence || kept.length >= 3) break;
  }
  return kept.join(" ").trim() || null;
}

function extractMerchant(rawText) {
  const vpaMatch = rawText.match(VPA_RE);
  if (vpaMatch) return cleanMerchant(vpaMatch[1]);

  const merchantMatch = rawText.match(MERCHANT_RE);
  return merchantMatch ? cleanMerchant(merchantMatch[1]) : null;
}

// Decides credit vs debit from the keywords present. When the signal is
// ambiguous (both or neither keyword), payment-app *notifications* are treated
// as credit: you initiate outgoing UPI payments inside the app (no notification
// is posted for those), so the notifications that do arrive are practically
// always money received. Bank SMS stays unresolved and falls back to the LLM.
function detectDirection(rawText, sourceChannel) {
  if (CREDIT_PHRASE_RE.test(rawText)) return "credit";
  const hasDebit = DEBIT_KEYWORDS.test(rawText);
  const hasCredit = CREDIT_KEYWORDS.test(rawText);
  if (hasCredit && !hasDebit) return "credit";
  if (hasDebit && !hasCredit) return "debit";
  if (sourceChannel === "notification") return "credit";
  return null;
}

function tryRegexParse(rawText, sourceChannel) {
  const amountMatch = rawText.match(AMOUNT_RE);
  if (!amountMatch) return null;

  const amount = parseFloat(amountMatch[1].replace(/,/g, ""));
  if (!Number.isFinite(amount)) return null;

  const direction = detectDirection(rawText, sourceChannel);
  if (!direction) return null; // not confident enough — fall back to the LLM

  const refMatch = rawText.match(REF_RE);
  const dateMatch = rawText.match(DATE_RE);

  return {
    amount,
    direction,
    merchant: extractMerchant(rawText),
    date: dateMatch ? parseLooseDate(dateMatch[1]) : new Date(),
    referenceNumber: refMatch ? refMatch[1] : null,
  };
}

async function llmParse(rawText, sourceChannel) {
  const model = getGeminiModel();
  const prompt = `Extract transaction details from this ${
    sourceChannel === "notification" ? "payment app notification" : "bank SMS"
  } text.
Respond with ONLY strict JSON, no markdown, in this exact shape:
{"amount": number, "direction": "credit"|"debit", "merchant": string|null, "date": "ISO date string", "referenceNumber": string|null}

Text:
"""
${rawText}
"""`;

  const result = await model.generateContent(prompt);
  const text = result.response.text();
  const data = JSON.parse(cleanJsonResponse(text));

  // Respect an explicit LLM verdict; only when it's missing/garbage do we fall
  // back — to credit for notifications (see detectDirection), debit otherwise.
  let direction;
  if (data.direction === "credit" || data.direction === "debit") {
    direction = data.direction;
  } else {
    direction = sourceChannel === "notification" ? "credit" : "debit";
  }

  return {
    amount: parseFloat(data.amount),
    direction,
    merchant: data.merchant || null,
    date: data.date ? new Date(data.date) : new Date(),
    referenceNumber: data.referenceNumber || null,
  };
}

export async function parseTransaction({ rawText, sourceChannel }) {
  const regexResult = tryRegexParse(rawText, sourceChannel);
  if (regexResult) return regexResult;

  return llmParse(rawText, sourceChannel);
}
