import { notFound } from "next/navigation";
import Link from "next/link";
import { format } from "date-fns";
import { ArrowLeft } from "lucide-react";
import { getCounterpartyDetail } from "@/actions/loans";
import { formatMoney } from "@/lib/utils";
import { formatPhoneForDisplay } from "@/lib/phone";
import { isOverdue, remainingAmount } from "@/lib/loan-display";
import { LoanStatusBadge } from "../../_components/loan-status-badge";

export default async function CounterpartyDetailPage({ params }) {
  const { id } = await params;
  const cp = await getCounterpartyDetail(id);
  if (!cp) notFound();

  const netFavourable = cp.netPosition >= 0;

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <Link
        href="/loans"
        className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        Back to loans
      </Link>

      <div className="rounded-2xl border border-border bg-card p-5 card-lifted">
        <h1 className="font-display text-xl font-bold tracking-tight">
          {cp.name}
        </h1>
        {cp.phone && (
          <p className="mt-0.5 text-sm text-muted-foreground">
            {formatPhoneForDisplay(cp.phone)}
          </p>
        )}
        {cp.notes && <p className="mt-2 text-sm text-foreground">{cp.notes}</p>}

        <div className="mt-4 border-t border-border pt-4">
          <p className="text-[10px] uppercase tracking-wide text-muted-foreground">
            Net position
          </p>
          <p
            className={`money mt-1 text-2xl ${
              netFavourable ? "text-green-400" : "text-red-400"
            }`}
          >
            {netFavourable ? "+" : "-"}
            {formatMoney(Math.abs(cp.netPosition))}
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            {cp.netPosition === 0
              ? "All square"
              : netFavourable
                ? `${cp.name} owes you, on balance`
                : `You owe ${cp.name}, on balance`}
          </p>
        </div>
      </div>

      <div className="space-y-3">
        <p className="text-sm font-medium text-muted-foreground">
          Loans with {cp.name}
        </p>
        {cp.loans.map((loan) => {
          const overdue = isOverdue(loan);
          const remaining = remainingAmount(loan);
          const isLent = loan.direction === "LENT";
          return (
            <Link
              key={loan.id}
              href={`/loans/${loan.id}`}
              className="block rounded-2xl border border-border bg-card p-4 card-lifted transition-colors hover:border-primary/40"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-medium text-foreground">
                      {isLent ? "You lent" : "You borrowed"}
                    </p>
                    <LoanStatusBadge status={loan.status} overdue={overdue} />
                  </div>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    {format(new Date(loan.createdAt), "MMM d, yyyy")}
                    {loan.dueOn &&
                      ` · due ${format(new Date(loan.dueOn), "MMM d")}`}
                  </p>
                </div>
                <div className="text-right">
                  <p
                    className={`money text-lg ${
                      isLent ? "text-green-400" : "text-red-400"
                    }`}
                  >
                    {formatMoney(loan.principalAmount)}
                  </p>
                  {loan.status !== "SETTLED" && (
                    <p className="text-xs text-muted-foreground">
                      {formatMoney(remaining)} left
                    </p>
                  )}
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
