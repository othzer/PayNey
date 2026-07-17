import { headers } from "next/headers";

// Absolute origin of the current request, for building shareable links
// (the public loan ledger). Prefers an explicit NEXT_PUBLIC_APP_URL if set
// (stable across environments), otherwise derives it from the request's
// forwarded host/proto headers. Server-only (uses next/headers).
export async function getBaseUrl() {
  const configured = process.env.NEXT_PUBLIC_APP_URL;
  if (configured) return configured.replace(/\/$/, "");

  const h = await headers();
  const host = h.get("x-forwarded-host") || h.get("host");
  const proto = h.get("x-forwarded-proto") || "https";
  return `${proto}://${host}`;
}
