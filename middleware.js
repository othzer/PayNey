import arcjet, { createMiddleware, detectBot, shield } from "@arcjet/next";
import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

const isProtectedRoute = createRouteMatcher([
  "/dashboard(.*)",
  "/account(.*)",
  "/accounts(.*)",
  "/transaction(.*)",
  "/transactions(.*)",
  "/review(.*)",
  "/connect(.*)",
  "/summary(.*)",
  "/loans(.*)",
]);

// Hit directly by the paired phone's bare HTTP client (OkHttp) — no browser
// fingerprint, no Clerk session cookie. Arcjet's bot detection would otherwise
// flag these as automated traffic and reject them with a 403 before the route
// handler runs. They are NOT unauthenticated: /api/device/pair is gated by the
// one-time pairing code in its body, and the transaction endpoints require a
// Bearer device token (or a Clerk session) via resolveRequestUser. Shield still
// runs on all of them below; only the bot fingerprint check is dropped.
const isDeviceClientRoute = createRouteMatcher([
  "/api/device/pair",
  "/api/transactions/ingest",
  "/api/transactions/receipt",
  "/api/transactions/receipt/confirm",
]);

// Create Arcjet middleware
const aj = arcjet({
  key: process.env.ARCJET_KEY,
  // characteristics: ["userId"], // Track based on Clerk userId
  rules: [
    // Shield protection for content and security
    shield({
      mode: "LIVE",
    }),
    detectBot({
      mode: "LIVE", // will block requests. Use "DRY_RUN" to log only
      allow: [
        "CATEGORY:SEARCH_ENGINE", // Google, Bing, etc
        "GO_HTTP", // For Inngest
        // See the full list at https://arcjet.com/bot-list
      ],
    }),
  ],
});

// Same shield protection, but no bot detection — used for the device-facing
// endpoints, which are expected to come from a non-browser client.
const ajDeviceClient = arcjet({
  key: process.env.ARCJET_KEY,
  rules: [
    shield({
      mode: "LIVE",
    }),
  ],
});

// Create base Clerk middleware
const clerk = clerkMiddleware(async (auth, req) => {
  const { userId } = await auth();

  if (!userId && isProtectedRoute(req)) {
    const { redirectToSignIn } = await auth();
    return redirectToSignIn();
  }

  return NextResponse.next();
});

// Chain middlewares - ArcJet runs first, then Clerk
const withFullProtection = createMiddleware(aj, clerk);
const withDeviceClientProtection = createMiddleware(ajDeviceClient, clerk);

export default function middleware(request, event) {
  if (isDeviceClientRoute(request)) {
    return withDeviceClientProtection(request, event);
  }
  return withFullProtection(request, event);
}

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    // Always run for API routes
    "/(api|trpc)(.*)",
  ],
};
