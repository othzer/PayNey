"use client";

import { useMemo } from "react";
import Link from "next/link";
import { format } from "date-fns";
import { defaultCategories } from "@/data/categories";
import { TransactionRowActions } from "@/components/transaction-row-actions";

const categoryById = defaultCategories.reduce((acc, c) => {
  acc[c.id] = c;
  return acc;
}, {});

const MAX_ROWS = 8;

export function RecentTransactionsCard({ transactions, onTransactionDeleted }) {
  const rows = useMemo(
    () =>
      [...transactions]
        .sort((a, b) => new Date(b.date) - new Date(a.date))
        .slice(0, MAX_ROWS),
    [transactions]
  );

  return (
    <div className="rounded-2xl border border-border bg-card p-5 card-lifted">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-muted-foreground">
          Recent transactions
        </p>
        <Link
          href="/transactions"
          className="text-sm text-primary hover:underline"
        >
          View all &rarr;
        </Link>
      </div>

      {rows.length === 0 ? (
        <p className="mt-4 text-sm text-muted-foreground">
          No transactions yet
        </p>
      ) : (
        <div className="mt-4 overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-[10px] uppercase tracking-wide text-muted-foreground">
                <th className="pb-2 font-medium">Date</th>
                <th className="pb-2 font-medium">Description</th>
                <th className="pb-2 font-medium">Category</th>
                <th className="pb-2 text-right font-medium">Amount</th>
                <th className="w-8 pb-2" />
              </tr>
            </thead>
            <tbody>
              {rows.map((t) => {
                const category = categoryById[t.category];
                return (
                  <tr key={t.id} className="group border-t border-border">
                    <td className="whitespace-nowrap py-2.5 text-muted-foreground">
                      {format(new Date(t.date), "MMM d")}
                    </td>
                    <td className="py-2.5">
                      {t.description || "Untitled Transaction"}
                    </td>
                    <td className="py-2.5">
                      <span
                        className="rounded-full px-2 py-0.5 text-xs"
                        style={{
                          backgroundColor: `${category?.color || "#8A8E9C"}22`,
                          color: category?.color || "#8A8E9C",
                        }}
                      >
                        {category?.name || t.category}
                      </span>
                    </td>
                    <td
                      className={`money py-2.5 text-right ${
                        t.type === "EXPENSE" ? "text-red-400" : "text-green-400"
                      }`}
                    >
                      {t.type === "EXPENSE" ? "-" : "+"}${t.amount.toFixed(2)}
                    </td>
                    <td className="py-2.5 text-right">
                      <TransactionRowActions
                        transaction={t}
                        onDeleted={onTransactionDeleted}
                      />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
