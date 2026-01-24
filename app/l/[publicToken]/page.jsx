import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { format } from "date-fns";
import { getPublicLoan } from "@/actions/loans";
import { formatMoney } from "@/lib/utils";
import { isOverdue } from "@/lib/loan-display";
import Footer from "@/components/footer";
import { LoanStatusBadge } from "@/app/(main)/loans/_components/loan-status-badge";

export const metadata = {
  title: "Shared loan · PayNey",
  robots: { index: false, follow: false },
};

// Public, unauthenticated, read-only. Shows the borrower/lender the same figures
// the owner sees. getPublicLoan returns a redacted shape only (no userId, no
// token, no phone, no other loans) — see actions/loans.js.
export default async function PublicLoanPage({ params }) {
  const { publicToken } = await params;
  const loan = await getPublicLoan(publicToken);
  if (!loan) notFound();

  const overdue = isOverdue(loan);
  const remaining = Math.max(loan.principalAmount - loan.repaidAmount, 0);
  const isLent = loan.direction === "LENT";
  // Framed from the viewer's (counterparty's) perspective.
  const headline = isLent
    ? `${loan.ownerName} lent money to ${loan.counterpartyName}`
    : `${loan.counterpartyName} lent money to ${loan.ownerName}`;

  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      <header className="border-b border-border">
        <div className="mx-auto flex max-w-2xl items-center gap-2 px-4 py-4">
          <Link href="/" className="flex items-center gap-2" aria-label="PayNey">
            <Image
              src="/payney-logomark.svg"
              alt="PayNey"
              width={28}
              height={28}
              className="h-7 w-7 rounded-md object-contain"
              priority
            />
            <span className="font-display text-sm font-semibold">PayNey</span>
          </Link>
        </div>
      </header>

      <main className="mx-auto w-full max-w-2xl flex-1 px-4 py-8">
        <div className="mb-6">
          <p className="text-xs uppercase tracking-wide text-muted-foreground">
            Shared loan record
          </p>
          <h1 className="mt-1 font-display text-2xl font-bold tracking-tight">
            {headline}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Opened {format(new Date(loan.createdAt), "MMMM d, yyyy")}
          </p>
        </div>

        <div className="rounded-2xl border border-border bg-card p-5 card-lifted">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-muted-foreground">Summary</p>
            <LoanStatusBadge status={loan.status} overdue={overdue} />
          </div>

          <div className="mt-4 grid grid-cols-3 gap-4">
            <div>
              <p className="text-[10px] uppercase tracking-wide text-muted-foreground">
                Amount
              </p>
              <p className="money mt-1 text-lg">
                {formatMoney(loan.principalAmount)}
              </p>
            </div>
            <div>
              <p className="text-[10px] uppercase tracking-wide text-muted-foreground">
                Repaid
              </p>
              <p className="money mt-1 text-lg text-green-400">
                {formatMoney(loan.repaidAmount)}
              </p>
            </div>
            <div>
              <p className="text-[10px] uppercase tracking-wide text-muted-foreground">
                Remaining
              </p>
              <p className="money mt-1 text-lg">{formatMoney(remaining)}</p>
            </div>
          </div>

          {loan.dueOn && (
            <p className="mt-4 border-t border-border pt-3 text-sm text-muted-foreground">
              Due{" "}
              <span className={overdue ? "text-red-400" : "text-foreground"}>
                {format(new Date(loan.dueOn), "MMMM d, yyyy")}
              </span>
            </p>
          )}
          {loan.note && (
            <p className="mt-2 text-sm text-foreground">{loan.note}</p>
          )}
        </div>

        <div className="mt-6 rounded-2xl border border-border bg-card p-5 card-lifted">
          <p className="mb-3 text-sm font-medium text-foreground">
            Repayment history
          </p>
          {loan.repayments.length ? (
            <ul className="divide-y divide-border">
              {loan.repayments.map((r) => (
                <li
                  key={r.id}
                  className="flex items-center justify-between gap-4 py-2.5"
                >
                  <div>
                    <p className="text-sm text-foreground">
                      {format(new Date(r.paidOn), "MMM d, yyyy")}
                    </p>
                    {r.note && (
                      <p className="text-xs text-muted-foreground">{r.note}</p>
                    )}
                  </div>
                  <p className="money text-sm text-green-400">
                    {formatMoney(r.amount)}
                  </p>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-muted-foreground">
              No repayments recorded yet.
            </p>
          )}
        </div>

        <p className="mt-6 text-center text-xs text-muted-foreground">
          This is a read-only record shared via PayNey.
        </p>
      </main>

      <Footer />
    </div>
  );
}
