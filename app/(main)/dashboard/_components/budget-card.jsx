"use client";

import { useEffect, useState } from "react";
import { Pencil, Check, X } from "lucide-react";
import { toast } from "sonner";
import useFetch from "@/hooks/use-fetch";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { updateBudget } from "@/actions/budget";
import { cn } from "@/lib/utils";

export function BudgetCard({ accountName, budget, currentExpenses, onBudgetUpdated }) {
  const [isEditing, setIsEditing] = useState(false);
  const [newBudget, setNewBudget] = useState(budget?.amount?.toString() || "");

  const {
    loading: isLoading,
    fn: updateBudgetFn,
    data: updatedBudget,
    error,
  } = useFetch(updateBudget);

  const percentUsed = budget?.amount ? (currentExpenses / budget.amount) * 100 : 0;

  const handleSave = async () => {
    const amount = parseFloat(newBudget);
    if (isNaN(amount) || amount <= 0) {
      toast.error("Please enter a valid amount");
      return;
    }
    await updateBudgetFn(amount);
  };

  const handleEditClick = () => {
    setNewBudget(budget?.amount?.toString() || "");
    setIsEditing(true);
  };

  const handleCancel = () => {
    setNewBudget(budget?.amount?.toString() || "");
    setIsEditing(false);
  };

  useEffect(() => {
    if (!updatedBudget) return;

    if (updatedBudget.success) {
      setIsEditing(false);
      toast.success("Budget updated successfully");
      onBudgetUpdated?.(updatedBudget.data);
    } else {
      toast.error(updatedBudget.error || "Failed to update budget");
    }
  }, [updatedBudget]);

  useEffect(() => {
    if (error) {
      toast.error(error.message || "Failed to update budget");
    }
  }, [error]);

  return (
    <div className="rounded-2xl border border-border bg-card p-5 card-lifted">
      {isEditing ? (
        <div className="flex flex-wrap items-center gap-2">
          <p className="text-sm font-medium text-muted-foreground">
            Monthly budget &middot; {accountName}
          </p>
          <Input
            type="number"
            value={newBudget}
            onChange={(e) => setNewBudget(e.target.value)}
            className="h-8 w-32"
            placeholder="Enter amount"
            autoFocus
            disabled={isLoading}
          />
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7"
            onClick={handleSave}
            disabled={isLoading}
          >
            <Check className="h-4 w-4 text-green-400" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7"
            onClick={handleCancel}
            disabled={isLoading}
          >
            <X className="h-4 w-4 text-red-400" />
          </Button>
        </div>
      ) : budget ? (
        <>
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <p className="text-sm font-medium text-muted-foreground">
                Monthly budget &middot; {accountName}
              </p>
              <button
                onClick={handleEditClick}
                className="text-muted-foreground hover:text-foreground"
                aria-label="Edit budget"
              >
                <Pencil className="h-3 w-3" />
              </button>
            </div>
            <p className="money text-sm">
              ${currentExpenses.toFixed(2)} of ${budget.amount.toFixed(2)} &middot;{" "}
              {percentUsed.toFixed(0)}% used
            </p>
          </div>
          <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-secondary">
            <div
              className={cn(
                "h-full rounded-full bg-primary transition-all",
                percentUsed >= 100 && "bg-destructive"
              )}
              style={{ width: `${Math.min(percentUsed, 100)}%` }}
            />
          </div>
        </>
      ) : (
        <div className="flex items-center justify-between gap-4">
          <p className="text-sm text-muted-foreground">
            No budget set for {accountName}
          </p>
          <Button size="sm" onClick={handleEditClick}>
            Set budget
          </Button>
        </div>
      )}
    </div>
  );
}
