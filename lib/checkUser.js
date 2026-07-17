import { auth, currentUser } from "@clerk/nextjs/server";
import { db } from "./prisma";

// Resolves the DB user for the current Clerk session, creating the row on first
// sign-in if it doesn't exist yet.
//
// On first sign-in (especially OAuth) the Clerk session exists before our user
// row does. The (main) layout provisions it via this function, but the layout
// and its page render concurrently in the App Router — so a page-level getter
// can run before that provisioning finishes. Resolving-or-creating here, at the
// point of use, removes that race: whoever gets there first creates the row,
// and everyone else reads it.
//
// Fast path is a cheap auth() + findUnique (no Clerk API call); the full Clerk
// profile is only fetched when the row actually has to be created.
export async function getOrCreateUser() {
  const { userId: clerkUserId } = await auth();
  if (!clerkUserId) return null;

  const existing = await db.user.findUnique({ where: { clerkUserId } });
  if (existing) return existing;

  const clerkUser = await currentUser();
  if (!clerkUser) return null;

  const name =
    [clerkUser.firstName, clerkUser.lastName].filter(Boolean).join(" ") || null;
  const email = clerkUser.emailAddresses?.[0]?.emailAddress;

  try {
    return await db.user.create({
      data: {
        clerkUserId,
        name,
        imageUrl: clerkUser.imageUrl,
        email,
      },
    });
  } catch (error) {
    // A concurrent request (e.g. the layout and a page getter racing to
    // provision) may have created the row first — unique clerkUserId/email
    // collide with P2002. Re-read and return that row instead of failing.
    const raced = await db.user.findUnique({ where: { clerkUserId } });
    if (raced) return raced;
    throw error;
  }
}

// Kept for the (main) layout, which just needs provisioning to happen and
// ignores the return value.
export const checkUser = async () => {
  try {
    return await getOrCreateUser();
  } catch (error) {
    console.log(error.message);
    return null;
  }
};
