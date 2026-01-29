"use client";

import { useState } from "react";
import Link from "next/link";
import { format } from "date-fns";
import { ArrowLeft, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatMoney, cn } from "@/lib/utils";
import { isOverdue, remainingAmount } from "@/lib/loan-display";
import { LoanStatusBadge } from "./loan-status-badge";
import { LoanMenu } from "./loan-menu";
import { AddRepaymentDrawer } from "./add-repayment-drawer";
import { NudgeButton } from "./nudge-button";
import { CopyLinkButton } from "./copy-link-button";

export function LoanDetailClient({ loan: initialLoan, ownerName, publicUrl }) {
  const [loan, setLoan] = useState(initialLoan);

  const overdue = isOverdue(loan);
  const remaining = remainingAmount(loan);
  const isLent = loan.direction === "LENT";
  const counterpartyName = loan.counterparty?.name || "Unknown";
  const settled = loan.status === "SETTLED";
  const progressPct =
    loan.principalAmount > 0
      ? Math.min((loan.repaidAmount / loan.principalAmount) * 100, 100)
      : 0;

  const handleRepaid = (updated) => {
    // Server returns the fully re-serialized loan (with repayments) — swap it in.
    setLoan(updated);
  };

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <Link
        href="/loans"
        className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        Back to loans
      </Link>

      {/* Summary card */}
      <div className="rounded-2xl border border-border bg-card p-5 card-lifted">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="font-display text-xl font-bold tracking-tight">
                <Link
                  href={`/loans/counterparty/${loan.counterpartyId}`}
                  className="hover:underline"
                >
                  {counterpartyName}
                </Link>
              </h1>
              <LoanStatusBadge status={loan.status} overdue={overdue} />
            </div>
            <p className="mt-1 text-sm text-muted-foreground">
              {isLent ? "You lent" : "You borrowed"} &middot;{" "}
              {format(new Date(loan.createdAt), "MMM d, yyyy")}
              {loan.dueOn && (
                <>
                  {" · "}
                  <span className={cn(overdue && "text-red-400")}>
                    due {format(new Date(loan.dueOn), "MMM d, yyyy")}
                  </span>
                </>
              )}
            </p>
            {loan.note && (
              <p className="mt-2 text-sm text-foreground">{loan.note}</p>
            )}
          </div>
          <LoanMenu loan={loan} />
        </div>

        {/* Amounts */}
        <div className="mt-5 grid grid-cols-3 gap-4">
          <div>
            <p className="text-[10px] uppercase tracking-wide text-muted-foreground">
              Principal
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
            <p
              className={cn(
                "money mt-1 text-lg",
                settled ? "text-muted-foreground" : "text-foreground"
              )}
            >
              {formatMoney(remaining)}
            </p>
          </div>
        </div>

        {/* Progress */}
        <div className="mt-4 h-1.5 w-full overflow-hidden rounded-full bg-secondary">
          <div
            className={cn(
              "h-full rounded-full transition-all",
              settled ? "bg-green-500" : "bg-primary"
            )}
            style={{ width: `${progressPct}%` }}
          />
        </div>

        {/* Actions */}
        <div className="mt-5 flex flex-wrap items-center gap-3">
          {!settled && (
            <AddRepaymentDrawer
              loanId={loan.id}
              remaining={remaining}
              onRepaid={handleRepaid}
            >
              <Button size="sm" className="gap-2">
                <Plus className="h-4 w-4" />
                Record repayment
              </Button>
            </AddRepaymentDrawer>
          )}
          <CopyLinkButton url={publicUrl} />
        </div>

        {isLent && !settled && (
          <div className="mt-4 border-t border-border pt-4">
            <NudgeButton
              loan={loan}
              counterpartyName={counterpartyName}
              ownerName={ownerName}
              publicUrl={publicUrl}
              phone={loan.counterparty?.phone}
            />
          </div>
        )}
      </div>

      {/* Repayment history */}
      <div className="rounded-2xl border border-border bg-card p-5 card-lifted">
        <p className="mb-3 text-sm font-medium text-foreground">
          Repayment history
        </p>
        {loan.repayments?.length ? (
          <ul className="divide-y divide-border">
            {loan.repayments.map((r) => (
              <li
                key={r.id}
                className="flex items-center justify-between gap-4 py-2.5"
              >
                <div className="min-w-0">
                  <p className="text-sm text-foreground">
                    {format(new Date(r.paidOn), "MMM d, yyyy")}
                  </p>
                  {r.note && (
                    <p className="truncate text-xs text-muted-foreground">
                      {r.note}
                    </p>
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
    </div>
  );
}
