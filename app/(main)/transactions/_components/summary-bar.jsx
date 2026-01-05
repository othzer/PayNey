export function SummaryBar({ summary }) {
  const net = summary.net;

  return (
    <div className="rounded-2xl border border-border bg-card p-5 card-lifted">
      <div className="grid grid-cols-3 gap-4">
        <div>
          <p className="text-[10px] uppercase tracking-wide text-muted-foreground">
            Expense
          </p>
          <p className="money mt-1 text-xl text-red-400">
            ${summary.expense.toFixed(2)}
          </p>
        </div>
        <div className="border-l border-border pl-4">
          <p className="text-[10px] uppercase tracking-wide text-muted-foreground">
            Income
          </p>
          <p className="money mt-1 text-xl text-green-400">
            ${summary.income.toFixed(2)}
          </p>
        </div>
        <div className="border-l border-border pl-4">
          <p className="text-[10px] uppercase tracking-wide text-muted-foreground">
            Net
          </p>
          <p
            className={`money mt-1 text-xl ${
              net >= 0 ? "text-green-400" : "text-red-400"
            }`}
          >
            {net >= 0 ? "+" : "-"}${Math.abs(net).toFixed(2)}
          </p>
        </div>
      </div>
    </div>
  );
}
