"use client";

import { useMemo } from "react";
import { format } from "date-fns";

const INTERVAL_LABEL = {
  DAILY: "Daily",
  WEEKLY: "Weekly",
  MONTHLY: "Monthly",
  YEARLY: "Yearly",
};

export function RecurringTransactionsCard({ transactions }) {
  const rows = useMemo(
    () =>
      transactions
        .filter((t) => t.isRecurring)
        .sort(
          (a, b) => new Date(a.nextRecurringDate) - new Date(b.nextRecurringDate)
        ),
    [transactions]
  );

  return (
    <div className="rounded-2xl border border-border bg-card p-5 card-lifted">
      <p className="text-sm font-medium text-muted-foreground">
        Recurring transactions
      </p>

      <div className="mt-4 space-y-3">
        {rows.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            No recurring transactions on this account
          </p>
        ) : (
          rows.map((t) => (
            <div key={t.id} className="flex items-center justify-between gap-3">
              <div className="min-w-0">
                <p className="truncate text-sm text-foreground">
                  {t.description || "Untitled Transaction"}
                </p>
                <p className="text-xs text-muted-foreground">
                  {INTERVAL_LABEL[t.recurringInterval] || "Recurring"}
                  {t.nextRecurringDate &&
                    ` · next ${format(new Date(t.nextRecurringDate), "MMM d")}`}
                </p>
              </div>
              <span
                className={`money shrink-0 text-sm ${
                  t.type === "INCOME" ? "text-green-400" : "text-red-400"
                }`}
              >
                {t.type === "INCOME" ? "+" : "-"}${t.amount.toFixed(2)}
              </span>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
