"use client";

import { useMemo } from "react";
import {
  eachDayOfInterval,
  endOfMonth,
  format,
  getDay,
  isSameDay,
  startOfMonth,
  subMonths,
} from "date-fns";
import { cn } from "@/lib/utils";

const EXPENSE_STEPS = [
  "bg-red-500/20",
  "bg-red-500/40",
  "bg-red-500/60",
  "bg-red-500/80",
];
const INCOME_STEPS = [
  "bg-green-500/20",
  "bg-green-500/40",
  "bg-green-500/60",
  "bg-green-500/80",
];

const MONTHS_TO_SHOW = 3;

function intensityClass(net, maxExpense, maxIncome) {
  if (!net) return "bg-[#1F212A]";
  if (net < 0) {
    const step = Math.min(3, Math.ceil((Math.abs(net) / maxExpense) * 4) - 1);
    return EXPENSE_STEPS[Math.max(0, step)];
  }
  const step = Math.min(3, Math.ceil((net / maxIncome) * 4) - 1);
  return INCOME_STEPS[Math.max(0, step)];
}

function buildMonthGrid(monthDate, transactions) {
  const monthStart = startOfMonth(monthDate);
  const monthEnd = endOfMonth(monthDate);
  const days = eachDayOfInterval({ start: monthStart, end: monthEnd });

  const netByDay = days.map((day) => {
    const dayTransactions = transactions.filter((t) =>
      isSameDay(new Date(t.date), day)
    );
    const income = dayTransactions
      .filter((t) => t.type === "INCOME")
      .reduce((sum, t) => sum + t.amount, 0);
    const expense = dayTransactions
      .filter((t) => t.type === "EXPENSE")
      .reduce((sum, t) => sum + t.amount, 0);
    return { day, net: income - expense };
  });

  const maxExpense =
    Math.max(0, ...netByDay.filter((d) => d.net < 0).map((d) => -d.net)) || 1;
  const maxIncome =
    Math.max(0, ...netByDay.filter((d) => d.net > 0).map((d) => d.net)) || 1;

  const leadingBlanks = getDay(monthStart);
  const cells = [
    ...Array.from({ length: leadingBlanks }, () => null),
    ...netByDay.map(({ day, net }) => ({
      day,
      net,
      className: intensityClass(net, maxExpense, maxIncome),
    })),
  ];

  const weeks = [];
  for (let i = 0; i < cells.length; i += 7) {
    weeks.push(cells.slice(i, i + 7));
  }

  return { weeks, label: format(monthDate, "MMM yyyy") };
}

export function SpendHeatmap({ transactions }) {
  const months = useMemo(() => {
    const now = new Date();
    return Array.from({ length: MONTHS_TO_SHOW }, (_, i) =>
      buildMonthGrid(subMonths(now, MONTHS_TO_SHOW - 1 - i), transactions)
    );
  }, [transactions]);

  return (
    <div className="rounded-2xl border border-border bg-card p-5 card-lifted">
      <p className="text-sm font-medium text-muted-foreground">
        Spend heatmap
      </p>

      <div className="mt-4 flex flex-wrap gap-6">
        {months.map((month) => (
          <div key={month.label}>
            <p className="mb-2 text-center text-xs text-muted-foreground">
              {month.label}
            </p>
            <div className="inline-grid grid-cols-7 gap-1">
              {["S", "M", "T", "W", "T", "F", "S"].map((label, i) => (
                <div
                  key={i}
                  className="flex h-5 w-5 items-center justify-center text-[9px] text-muted-foreground"
                >
                  {label}
                </div>
              ))}
              {month.weeks.flatMap((week, weekIndex) =>
                week.map((cell, dayIndex) => (
                  <div
                    key={`${weekIndex}-${dayIndex}`}
                    className={cn(
                      "h-5 w-5 rounded-sm",
                      cell ? cell.className : "bg-transparent"
                    )}
                    title={
                      cell
                        ? `${format(cell.day, "MMM d")}: ${
                            cell.net >= 0 ? "+" : "-"
                          }$${Math.abs(cell.net).toFixed(2)}`
                        : undefined
                    }
                  />
                ))
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
