"use client";

import { useMemo } from "react";
import { startOfMonth, endOfMonth, isWithinInterval } from "date-fns";
import { defaultCategories } from "@/data/categories";

const categoryById = defaultCategories.reduce((acc, c) => {
  acc[c.id] = c;
  return acc;
}, {});

const MAX_ROWS = 5;

export function TopCategoriesCard({ transactions }) {
  const rows = useMemo(() => {
    const now = new Date();
    const monthRange = { start: startOfMonth(now), end: endOfMonth(now) };

    const totals = transactions
      .filter(
        (t) => t.type === "EXPENSE" && isWithinInterval(new Date(t.date), monthRange)
      )
      .reduce((acc, t) => {
        acc[t.category] = (acc[t.category] || 0) + t.amount;
        return acc;
      }, {});

    const sorted = Object.entries(totals).sort((a, b) => b[1] - a[1]);
    const top = sorted.slice(0, MAX_ROWS);
    const rest = sorted.slice(MAX_ROWS);
    const otherTotal = rest.reduce((sum, [, amount]) => sum + amount, 0);

    const items = top.map(([categoryId, amount]) => ({
      name: categoryById[categoryId]?.name || categoryId,
      color: categoryById[categoryId]?.color || "#8A8E9C",
      amount,
    }));

    if (otherTotal > 0) {
      items.push({ name: "Other", color: "#8A8E9C", amount: otherTotal });
    }

    const maxAmount = Math.max(...items.map((i) => i.amount), 1);

    return items.map((item) => ({
      ...item,
      widthPct: (item.amount / maxAmount) * 100,
    }));
  }, [transactions]);

  return (
    <div className="rounded-2xl border border-border bg-card p-5 card-lifted">
      <p className="text-sm font-medium text-muted-foreground">
        Top categories
      </p>

      <div className="mt-4 space-y-3">
        {rows.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            No expenses this month
          </p>
        ) : (
          rows.map((row) => (
            <div key={row.name} className="flex items-center gap-3">
              <span
                className="h-2.5 w-2.5 shrink-0 rounded-sm"
                style={{ backgroundColor: row.color }}
              />
              <span className="w-24 shrink-0 truncate text-sm text-foreground">
                {row.name}
              </span>
              <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-secondary">
                <div
                  className="h-full rounded-full"
                  style={{
                    width: `${row.widthPct}%`,
                    backgroundColor: row.color,
                  }}
                />
              </div>
              <span className="money w-20 shrink-0 text-right text-sm">
                ${row.amount.toFixed(2)}
              </span>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
