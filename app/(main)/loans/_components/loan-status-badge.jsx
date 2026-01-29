import { cn } from "@/lib/utils";

// Presentational status pill. OVERDUE is a display-only state layered on top of
// the stored status (a loan past its due date that isn't settled), computed by
// the caller — it takes visual priority over OPEN/PARTIALLY_REPAID.
const STATUS_STYLES = {
  OPEN: "border-blue-500/30 bg-blue-500/10 text-blue-300",
  PARTIALLY_REPAID: "border-amber-500/30 bg-amber-500/10 text-amber-300",
  SETTLED: "border-green-500/30 bg-green-500/10 text-green-400",
  OVERDUE: "border-red-500/30 bg-red-500/10 text-red-400",
};

const STATUS_LABEL = {
  OPEN: "Open",
  PARTIALLY_REPAID: "Partially repaid",
  SETTLED: "Settled",
  OVERDUE: "Overdue",
};

export function LoanStatusBadge({ status, overdue = false, className }) {
  const key = overdue ? "OVERDUE" : status;
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-medium",
        STATUS_STYLES[key] || STATUS_STYLES.OPEN,
        className
      )}
    >
      {STATUS_LABEL[key] || status}
    </span>
  );
}
