"use client";

import { CashFlowChart } from "@/components/cash-flow-chart";
import { AccountMenu } from "./account-menu";
import { AccountTransactionsTable } from "./account-transactions-table";

export function ExpandedAccountPanel({
  account,
  transactions,
  onAccountUpdated,
  onAccountDeleted,
  onTransactionDeleted,
}) {
  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-border bg-card p-5 card-lifted">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-display text-xl font-semibold capitalize">
                {account.name}
              </h2>
              {account.isDefault && (
                <span className="rounded-full bg-primary/15 px-2 py-0.5 text-[10px] font-medium text-primary">
                  Default
                </span>
              )}
            </div>
            <p className="mt-1 text-sm text-muted-foreground">
              {account.type.charAt(0) + account.type.slice(1).toLowerCase()}{" "}
              account &middot; {account._count?.transactions ?? transactions.length}{" "}
              transactions
            </p>
          </div>

          <div className="flex items-center gap-3">
            <p className="money text-2xl">${account.balance.toFixed(2)}</p>
            <AccountMenu
              account={account}
              onUpdated={onAccountUpdated}
              onDeleted={onAccountDeleted}
            />
          </div>
        </div>
      </div>

      <CashFlowChart transactions={transactions} title="Transaction overview" />

      <AccountTransactionsTable
        transactions={transactions}
        onTransactionDeleted={onTransactionDeleted}
      />
    </div>
  );
}
