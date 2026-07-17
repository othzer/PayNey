import { notFound } from "next/navigation";
import { auth } from "@clerk/nextjs/server";
import { getLoan } from "@/actions/loans";
import { db } from "@/lib/prisma";
import { getBaseUrl } from "@/lib/base-url";
import { LoanDetailClient } from "../_components/loan-detail-client";

export default async function LoanDetailPage({ params }) {
  const { id } = await params;
  const loan = await getLoan(id);
  if (!loan) notFound();

  // The owner's display name for the nudge message signature.
  const { userId } = await auth();
  const user = userId
    ? await db.user.findUnique({
        where: { clerkUserId: userId },
        select: { name: true },
      })
    : null;

  const baseUrl = await getBaseUrl();
  const publicUrl = `${baseUrl}/l/${loan.publicToken}`;

  return (
    <LoanDetailClient
      loan={loan}
      ownerName={user?.name || null}
      publicUrl={publicUrl}
    />
  );
}
