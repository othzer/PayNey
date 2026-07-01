"use client";

import { useEffect, useState } from "react";
import { format } from "date-fns";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { defaultCategories } from "@/data/categories";
import { confirmPendingTransaction, discardPendingTransaction } from "@/actions/review";
import useFetch from "@/hooks/use-fetch";
import { cn } from "@/lib/utils";

const categoryById = defaultCategories.reduce((acc, c) => {
  acc[c.id] = c;
  return acc;
}, {});

const SOURCE_LABEL = {
  sms: "SMS",
  notification: "Notification",
  receipt: "Receipt",
};

export function PendingTransactionCard({ transaction, onResolved }) {
  const [category, setCategory] = useState(transaction.suggestedCategory);
  const [name, setName] = useState(
    transaction.suggestedName || transaction.parsedMerchant || ""
  );
  const [popoverOpen, setPopoverOpen] = useState(false);

  const {
    fn: confirmFn,
    data: confirmResult,
    loading: confirmLoading,
  } = useFetch(confirmPendingTransaction);
  const {
    fn: discardFn,
    data: discardResult,
    loading: discardLoading,
  } = useFetch(discardPendingTransaction);

  useEffect(() => {
    if (!confirmResult) return;
    if (confirmResult.success) {
      toast.success("Transaction added");
      onResolved(transaction.id);
    } else {
      toast.error(confirmResult.error || "Failed to confirm transaction");
    }
  }, [confirmResult]);

  useEffect(() => {
    if (!discardResult) return;
    if (discardResult.success) {
      toast.success("Discarded");
      onResolved(transaction.id);
    } else {
      toast.error(discardResult.error || "Failed to discard");
    }
  }, [discardResult]);

  const handleConfirm = () => {
    confirmFn(transaction.id, { category, name });
  };

  const handleDiscard = () => {
    discardFn(transaction.id);
  };

  const categoryInfo = category ? categoryById[category] : null;
  const isExpense = transaction.parsedDirection === "debit";
  const busy = confirmLoading || discardLoading;

  return (
    <div className="rounded-2xl border border-border bg-card p-4 card-lifted">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium text-foreground">
            {transaction.parsedMerchant || "Unknown merchant"}
          </p>
          <p className="mt-0.5 text-xs text-muted-foreground">
            {SOURCE_LABEL[transaction.sourceChannel] || transaction.sourceChannel}
            {" · "}
            {format(new Date(transaction.parsedDate), "MMM d, yyyy")}
          </p>
        </div>
        <p
          className={cn(
            "money shrink-0 text-lg",
            isExpense ? "text-red-400" : "text-green-400"
          )}
        >
          {isExpense ? "-" : "+"}${transaction.parsedAmount.toFixed(2)}
        </p>
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-3">
        <Popover open={popoverOpen} onOpenChange={setPopoverOpen}>
          <PopoverTrigger asChild>
            <button
              type="button"
              className={cn(
                "rounded-full px-2.5 py-1 text-xs",
                !categoryInfo && "border border-dashed border-border text-muted-foreground"
              )}
              style={
                categoryInfo
                  ? { backgroundColor: `${categoryInfo.color}22`, color: categoryInfo.color }
                  : undefined
              }
            >
              {categoryInfo ? categoryInfo.name : "Uncategorized"}
            </button>
          </PopoverTrigger>
          <PopoverContent className="w-56 p-1" align="start">
            <div className="max-h-64 overflow-y-auto">
              {defaultCategories.map((c) => (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => {
                    setCategory(c.id);
                    setPopoverOpen(false);
                  }}
                  className="flex w-full items-center gap-2 rounded-sm px-2 py-1.5 text-left text-sm hover:bg-secondary"
                >
                  <span className="h-2 w-2 rounded-full" style={{ backgroundColor: c.color }} />
                  {c.name}
                </button>
              ))}
            </div>
          </PopoverContent>
        </Popover>

        <Input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Name"
          className="h-8 max-w-[220px] flex-1"
        />

        <div className="ml-auto flex gap-2">
          <Button variant="outline" size="sm" onClick={handleDiscard} disabled={busy}>
            Discard
          </Button>
          <Button size="sm" onClick={handleConfirm} disabled={busy}>
            Confirm
          </Button>
        </div>
      </div>
    </div>
  );
}
