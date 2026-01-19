"use client";

import { useEffect } from "react";
import { Sparkles, RefreshCw, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { defaultCategories } from "@/data/categories";
import { getAiSummary } from "@/actions/ai-summary";
import useFetch from "@/hooks/use-fetch";

const categoryNameById = defaultCategories.reduce((acc, c) => {
  acc[c.id] = c.name;
  return acc;
}, {});
const categoryColorById = defaultCategories.reduce((acc, c) => {
  acc[c.id] = c.color;
  return acc;
}, {});

export function SummaryClient({ initialSummary }) {
  const {
    data: refreshedSummary,
    loading,
    fn: refresh,
  } = useFetch(getAiSummary);

  const summary = refreshedSummary || initialSummary;

  useEffect(() => {
    if (refreshedSummary) {
      toast.success("Summary refreshed");
    }
  }, [refreshedSummary]);

  const topCategories = Object.entries(summary.stats.byCategory).sort(
    (a, b) => b[1] - a[1]
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <Link
            href="/dashboard"
            className="mb-1 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Back to dashboard
          </Link>
          <h1 className="text-2xl font-bold tracking-tight">AI Summary</h1>
          <p className="text-sm text-muted-foreground">{summary.month}</p>
        </div>
        <Button
          variant="outline"
          size="sm"
          className="gap-2"
          onClick={() => refresh()}
          disabled={loading}
        >
          <RefreshCw className={loading ? "h-4 w-4 animate-spin" : "h-4 w-4"} />
          Regenerate
        </Button>
      </div>

      <div className="rounded-2xl border border-border bg-card p-5 card-lifted">
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
          <div>
            <p className="text-[10px] uppercase tracking-wide text-muted-foreground">
              Income
            </p>
            <p className="money mt-1 text-2xl text-green-400">
              ${summary.stats.totalIncome.toFixed(2)}
            </p>
          </div>
          <div className="border-t border-border pt-4 sm:border-l sm:border-t-0 sm:pl-6 sm:pt-0">
            <p className="text-[10px] uppercase tracking-wide text-muted-foreground">
              Expenses
            </p>
            <p className="money mt-1 text-2xl text-red-400">
              ${summary.stats.totalExpenses.toFixed(2)}
            </p>
          </div>
          <div className="border-t border-border pt-4 sm:border-l sm:border-t-0 sm:pl-6 sm:pt-0">
            <p className="text-[10px] uppercase tracking-wide text-muted-foreground">
              Net
            </p>
            <p
              className={
                summary.stats.netIncome >= 0
                  ? "money mt-1 text-2xl text-green-400"
                  : "money mt-1 text-2xl text-red-400"
              }
            >
              {summary.stats.netIncome >= 0 ? "+" : "-"}$
              {Math.abs(summary.stats.netIncome).toFixed(2)}
            </p>
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-border bg-card p-5 card-lifted">
        <p className="mb-3 flex items-center gap-2 text-sm font-medium text-foreground">
          <Sparkles className="h-4 w-4 text-primary" />
          AI Insights
        </p>
        <ul className="space-y-3">
          {summary.insights.map((insight, i) => (
            <li
              key={i}
              className="rounded-lg border border-border bg-secondary/40 p-3 text-sm text-foreground"
            >
              {insight}
            </li>
          ))}
        </ul>
      </div>

      {topCategories.length > 0 && (
        <div className="rounded-2xl border border-border bg-card p-5 card-lifted">
          <p className="mb-3 text-sm font-medium text-foreground">
            Spending by category
          </p>
          <ul className="space-y-2">
            {topCategories.map(([categoryId, amount]) => (
              <li
                key={categoryId}
                className="flex items-center justify-between text-sm"
              >
                <span className="flex items-center gap-2">
                  <span
                    className="h-2 w-2 rounded-full"
                    style={{
                      backgroundColor: categoryColorById[categoryId] || "#94a3b8",
                    }}
                  />
                  {categoryNameById[categoryId] || categoryId}
                </span>
                <span className="money">${amount.toFixed(2)}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
