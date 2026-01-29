import { headers } from "next/headers";

// Absolute origin used to build shareable capability links (the public loan
// ledger URL that goes into a WhatsApp nudge). In production this MUST come from
// an explicit NEXT_PUBLIC_APP_URL — deriving it from the request's Host /
// X-Forwarded-Host headers would let a spoofed Host put an attacker-controlled
// origin into a link the user then sends to someone else. The header fallback
// is dev-only convenience. Server-only (uses next/headers).
export async function getBaseUrl() {
  const configured = process.env.NEXT_PUBLIC_APP_URL;
  if (configured) return configured.replace(/\/$/, "");

  if (process.env.NODE_ENV === "production") {
    throw new Error(
      "NEXT_PUBLIC_APP_URL must be set in production (used to build public share links)."
    );
  }

  const h = await headers();
  const host = h.get("x-forwarded-host") || h.get("host");
  const proto = h.get("x-forwarded-proto") || "http";
  return `${proto}://${host}`;
}
