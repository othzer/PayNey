import { ArrowUpRight, ArrowDownRight, Scale, AlertTriangle } from "lucide-react";
import { formatMoney } from "@/lib/utils";
import { cn } from "@/lib/utils";

function Tile({ label, value, hint, icon: Icon, valueClassName }) {
  return (
    <div className="rounded-2xl border border-border bg-card p-4 card-lifted">
      <div className="flex items-center justify-between">
        <p className="text-[10px] uppercase tracking-wide text-muted-foreground">
          {label}
        </p>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </div>
      <p className={cn("money mt-2 text-2xl", valueClassName)}>{value}</p>
      {hint && <p className="mt-1 text-xs text-muted-foreground">{hint}</p>}
    </div>
  );
}

export function LoanDashboardTiles({ tiles }) {
  const { totalLent, totalOwed, netPosition, overdueCount } = tiles;

  return (
    <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
      <Tile
        label="You're owed"
        value={formatMoney(totalLent)}
        hint="Outstanding money lent"
        icon={ArrowUpRight}
        valueClassName="text-green-400"
      />
      <Tile
        label="You owe"
        value={formatMoney(totalOwed)}
        hint="Outstanding money borrowed"
        icon={ArrowDownRight}
        valueClassName="text-red-400"
      />
      <Tile
        label="Net position"
        value={`${netPosition >= 0 ? "+" : "-"}${formatMoney(Math.abs(netPosition))}`}
        hint={netPosition >= 0 ? "In your favour" : "You owe more than you're owed"}
        icon={Scale}
        valueClassName={netPosition >= 0 ? "text-green-400" : "text-red-400"}
      />
      <Tile
        label="Overdue"
        value={overdueCount}
        hint={overdueCount === 1 ? "loan past its due date" : "loans past due date"}
        icon={AlertTriangle}
        valueClassName={overdueCount > 0 ? "text-red-400" : undefined}
      />
    </div>
  );
}
