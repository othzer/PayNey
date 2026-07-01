"use client";

import { useEffect } from "react";
import { ArrowUpRight, ArrowDownRight, Plus } from "lucide-react";
import { toast } from "sonner";
import { Switch } from "@/components/ui/switch";
import { CreateAccountDrawer } from "@/components/create-account-drawer";
import { updateDefaultAccount } from "@/actions/account";
import useFetch from "@/hooks/use-fetch";
import { cn } from "@/lib/utils";

function AccountCard({ account, isSelected, onSelect, onDefaultChanged }) {
  const {
    fn: updateDefaultFn,
    data: updated,
    loading,
  } = useFetch(updateDefaultAccount);

  const handleToggleDefault = (e) => {
    e.stopPropagation();
    if (account.isDefault) {
      toast.warning("You need at least 1 default account");
      return;
    }
    updateDefaultFn(account.id);
  };

  useEffect(() => {
    if (!updated) return;
    if (updated.success) {
      onDefaultChanged(account.id);
      toast.success("Default account updated");
    } else {
      toast.error(updated.error || "Failed to update default account");
    }
  }, [updated]);

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={() => onSelect(account.id)}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onSelect(account.id);
        }
      }}
      className={cn(
        "flex w-[220px] shrink-0 cursor-pointer flex-col gap-3 rounded-2xl border bg-card p-4 transition-shadow",
        isSelected
          ? "border-primary shadow-[0_0_20px_rgba(34,47,168,0.35)]"
          : "border-border card-lifted"
      )}
    >
      <div className="flex items-center justify-between gap-2">
        <p className="truncate text-sm font-medium capitalize">
          {account.name}
        </p>
        <Switch
          checked={account.isDefault}
          onClick={handleToggleDefault}
          disabled={loading}
        />
      </div>
      <p className="money text-xl">${account.balance.toFixed(2)}</p>
      <p className="text-xs text-muted-foreground">
        {account.type.charAt(0) + account.type.slice(1).toLowerCase()} account
      </p>
      <div className="flex items-center gap-3 text-xs text-muted-foreground">
        <span className="flex items-center gap-1">
          <ArrowUpRight className="h-3.5 w-3.5 text-green-400" />
          Income
        </span>
        <span className="flex items-center gap-1">
          <ArrowDownRight className="h-3.5 w-3.5 text-red-400" />
          Expense
        </span>
      </div>
    </div>
  );
}

export function AccountCardsRow({
  accounts,
  selectedAccountId,
  onSelect,
  onDefaultChanged,
}) {
  return (
    <div className="flex gap-4 overflow-x-auto pb-2">
      {accounts.map((account) => (
        <AccountCard
          key={account.id}
          account={account}
          isSelected={account.id === selectedAccountId}
          onSelect={onSelect}
          onDefaultChanged={onDefaultChanged}
        />
      ))}

      <CreateAccountDrawer>
        <button
          type="button"
          className="flex w-[220px] shrink-0 flex-col items-center justify-center gap-2 rounded-2xl border border-dashed border-border p-4 text-sm text-muted-foreground transition-colors hover:border-primary hover:text-foreground"
        >
          <Plus className="h-5 w-5" />
          Add account
        </button>
      </CreateAccountDrawer>
    </div>
  );
}
