"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { PendingTransactionCard } from "./pending-transaction-card";
import { bulkConfirmSuggested } from "@/actions/review";
import useFetch from "@/hooks/use-fetch";

export function ReviewClient({ initialTransactions }) {
  const [transactions, setTransactions] = useState(initialTransactions);

  const {
    fn: bulkConfirmFn,
    data: bulkResult,
    loading: bulkLoading,
  } = useFetch(bulkConfirmSuggested);

  useEffect(() => {
    if (!bulkResult) return;
    if (bulkResult.success) {
      toast.success(`${bulkResult.confirmedCount} transaction(s) added`);
      setTransactions((current) =>
        current.filter((t) => t.confidence !== "medium" && t.confidence !== "high")
      );
    } else {
      toast.error(bulkResult.error || "Failed to accept suggestions");
    }
  }, [bulkResult]);

  const handleResolved = (id) => {
    setTransactions((current) => current.filter((t) => t.id !== id));
  };

  const suggestedCount = transactions.filter(
    (t) => t.confidence === "medium" || t.confidence === "high"
  ).length;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Review</h1>
          <p className="text-sm text-muted-foreground">
            {transactions.length} pending &middot; captured from SMS and notifications
          </p>
        </div>
        {suggestedCount > 0 && (
          <Button onClick={() => bulkConfirmFn()} disabled={bulkLoading}>
            Accept all suggested
          </Button>
        )}
      </div>

      {transactions.length === 0 ? (
        <p className="text-sm text-muted-foreground">No pending reviews</p>
      ) : (
        <div className="space-y-3">
          {transactions.map((t) => (
            <PendingTransactionCard key={t.id} transaction={t} onResolved={handleResolved} />
          ))}
        </div>
      )}
    </div>
  );
}
