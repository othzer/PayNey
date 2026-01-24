"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { format } from "date-fns";
import { Plus, HandCoins } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatMoney, cn } from "@/lib/utils";
import { isOverdue } from "@/lib/loan-display";
import { LoanDashboardTiles } from "./loan-dashboard-tiles";
import { LoanStatusBadge } from "./loan-status-badge";

const FILTERS = [
  { key: "all", label: "All" },
  { key: "LENT", label: "Lent" },
  { key: "BORROWED", label: "Borrowed" },
  { key: "active", label: "Active" },
];

export function LoansClient({ loans, tiles }) {
  const [filter, setFilter] = useState("all");

  const filtered = useMemo(() => {
    if (filter === "all") return loans;
    if (filter === "active") return loans.filter((l) => l.status !== "SETTLED");
    return loans.filter((l) => l.direction === filter);
  }, [loans, filter]);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold tracking-tight">Loans</h1>
          <p className="text-sm text-muted-foreground">
            Money you&apos;ve lent and borrowed
          </p>
        </div>
        <Button asChild size="sm" className="gap-2">
          <Link href="/loans/new">
            <Plus className="h-4 w-4" />
            Add loan
          </Link>
        </Button>
      </div>

      <LoanDashboardTiles tiles={tiles} />

      {loans.length === 0 ? (
        <div className="rounded-2xl border border-border bg-card p-10 card-lifted">
          <div className="flex flex-col items-center justify-center gap-3 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/15">
              <HandCoins className="h-6 w-6 text-primary" />
            </div>
            <p className="text-sm text-muted-foreground">
              No loans yet. Track money you lend to or borrow from friends and
              family.
            </p>
            <Button asChild size="sm">
              <Link href="/loans/new">Add your first loan</Link>
            </Button>
          </div>
        </div>
      ) : (
        <>
          <div className="flex flex-wrap gap-2">
            {FILTERS.map((f) => (
              <button
                key={f.key}
                type="button"
                onClick={() => setFilter(f.key)}
                className={cn(
                  "rounded-full border px-3 py-1 text-xs transition-colors",
                  filter === f.key
                    ? "border-primary bg-primary/15 text-foreground"
                    : "border-border text-muted-foreground hover:text-foreground"
                )}
              >
                {f.label}
              </button>
            ))}
          </div>

          <div className="space-y-3">
            {filtered.map((loan) => (
              <LoanRow key={loan.id} loan={loan} />
            ))}
            {filtered.length === 0 && (
              <p className="py-6 text-center text-sm text-muted-foreground">
                No loans match this filter.
              </p>
            )}
          </div>
        </>
      )}
    </div>
  );
}

function LoanRow({ loan }) {
  const overdue = isOverdue(loan);
  const remaining = Math.max(loan.principalAmount - loan.repaidAmount, 0);
  const isLent = loan.direction === "LENT";

  return (
    <Link
      href={`/loans/${loan.id}`}
      className="block rounded-2xl border border-border bg-card p-4 card-lifted transition-colors hover:border-primary/40"
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <p className="truncate text-sm font-medium text-foreground">
              {loan.counterparty?.name || "Unknown"}
            </p>
            <LoanStatusBadge status={loan.status} overdue={overdue} />
          </div>
          <p className="mt-0.5 text-xs text-muted-foreground">
            {isLent ? "You lent" : "You borrowed"}
            {" · "}
            {format(new Date(loan.createdAt), "MMM d, yyyy")}
            {loan.dueOn && ` · due ${format(new Date(loan.dueOn), "MMM d")}`}
          </p>
        </div>
        <div className="text-right">
          <p
            className={cn(
              "money text-lg",
              isLent ? "text-green-400" : "text-red-400"
            )}
          >
            {formatMoney(loan.principalAmount)}
          </p>
          {loan.status !== "SETTLED" && loan.repaidAmount > 0 && (
            <p className="text-xs text-muted-foreground">
              {formatMoney(remaining)} left
            </p>
          )}
        </div>
      </div>
    </Link>
  );
}
