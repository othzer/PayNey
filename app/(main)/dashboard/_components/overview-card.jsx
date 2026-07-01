import { Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

function DeltaPill({ value, format = "currency", positiveIsGood = true }) {
  if (value === null || value === undefined) return null;

  const isZero = Math.abs(value) < 0.005;
  const isPositive = value > 0;
  const className = isZero
    ? "delta-neutral"
    : isPositive === positiveIsGood
      ? "delta-positive"
      : "delta-negative";
  const sign = isZero ? "" : isPositive ? "+" : "-";
  const label =
    format === "percent"
      ? `${Math.abs(value).toFixed(0)}%`
      : `$${Math.abs(value).toFixed(2)}`;

  return (
    <span className={className}>
      {sign}
      {label}
    </span>
  );
}

export function OverviewCard({
  accountName,
  balance,
  balanceDelta,
  thisMonthExpense,
  expenseDeltaPct,
  netThisMonth,
  insight,
}) {
  return (
    <div className="rounded-2xl border border-border bg-card p-5 card-lifted">
      <p className="text-sm font-medium text-muted-foreground">
        Overview &middot; {accountName}
      </p>

      <div className="mt-4 grid grid-cols-1 gap-6 sm:grid-cols-3">
        <div>
          <p className="text-[10px] uppercase tracking-wide text-muted-foreground">
            Balance
          </p>
          <p className="money mt-1 text-2xl">${balance.toFixed(2)}</p>
          <div className="mt-2">
            <DeltaPill value={balanceDelta} format="currency" />
          </div>
        </div>

        <div className="border-t border-border pt-4 sm:border-l sm:border-t-0 sm:pl-6 sm:pt-0">
          <p className="text-[10px] uppercase tracking-wide text-muted-foreground">
            This month
          </p>
          <p className="money mt-1 text-2xl">${thisMonthExpense.toFixed(2)}</p>
          <div className="mt-2">
            <DeltaPill
              value={expenseDeltaPct}
              format="percent"
              positiveIsGood={false}
            />
          </div>
        </div>

        <div className="border-t border-border pt-4 sm:border-l sm:border-t-0 sm:pl-6 sm:pt-0">
          <p className="text-[10px] uppercase tracking-wide text-muted-foreground">
            Net this month
          </p>
          <p
            className={cn(
              "money mt-1 text-2xl",
              netThisMonth >= 0 ? "text-green-400" : "text-red-400"
            )}
          >
            {netThisMonth >= 0 ? "+" : "-"}${Math.abs(netThisMonth).toFixed(2)}
          </p>
        </div>
      </div>

      <div className="mt-4 flex items-center justify-between gap-4 border-t border-border pt-3">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Sparkles className="h-4 w-4 shrink-0 text-primary" />
          <span>{insight}</span>
        </div>
        <a
          href="#"
          className="shrink-0 text-sm text-primary hover:underline"
        >
          View summary &rarr;
        </a>
      </div>
    </div>
  );
}
