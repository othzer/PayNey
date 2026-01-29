"use client";

import { useMemo, useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CreateAccountDrawer } from "@/components/create-account-drawer";
import { AccountCardsRow } from "./account-cards-row";
import { ExpandedAccountPanel } from "./expanded-account-panel";

export function AccountsClient({
  accounts: initialAccounts,
  transactions,
  initialAccountId,
}) {
  const [accounts, setAccounts] = useState(initialAccounts);
  const [txList, setTxList] = useState(transactions);
  const [selectedAccountId, setSelectedAccountId] = useState(() => {
    if (initialAccountId && initialAccounts.some((a) => a.id === initialAccountId)) {
      return initialAccountId;
    }
    return initialAccounts.find((a) => a.isDefault)?.id || initialAccounts[0]?.id;
  });

  const selectedAccount = useMemo(
    () => accounts.find((a) => a.id === selectedAccountId),
    [accounts, selectedAccountId]
  );

  const accountTransactions = useMemo(
    () => txList.filter((t) => t.accountId === selectedAccountId),
    [txList, selectedAccountId]
  );

  const handleDefaultChanged = (accountId) => {
    setAccounts((current) =>
      current.map((a) => ({ ...a, isDefault: a.id === accountId }))
    );
  };

  const handleAccountCreated = (created) => {
    if (!created) return;
    setAccounts((current) => {
      // createAccount makes the first account (or an explicit choice) default,
      // so mirror that here by unsetting the others when the new one is default.
      const base = created.isDefault
        ? current.map((a) => ({ ...a, isDefault: false }))
        : current;
      return [{ _count: { transactions: 0 }, ...created }, ...base];
    });
    setSelectedAccountId(created.id);
  };

  const handleAccountUpdated = (updated) => {
    setAccounts((current) =>
      current.map((a) => (a.id === updated.id ? { ...a, ...updated } : a))
    );
  };

  const handleAccountDeleted = (accountId, newDefaultAccountId) => {
    setAccounts((current) => {
      const remaining = current.filter((a) => a.id !== accountId);
      return newDefaultAccountId
        ? remaining.map((a) => ({
            ...a,
            isDefault: a.id === newDefaultAccountId,
          }))
        : remaining;
    });
    setTxList((current) => current.filter((t) => t.accountId !== accountId));
    setSelectedAccountId((current) =>
      current === accountId
        ? newDefaultAccountId || accounts.find((a) => a.id !== accountId)?.id
        : current
    );
  };

  const handleTransactionDeleted = (id) => {
    const deleted = txList.find((t) => t.id === id);
    if (deleted) {
      setAccounts((current) =>
        current.map((a) => {
          if (a.id !== deleted.accountId) return a;
          const balanceChange =
            deleted.type === "EXPENSE" ? deleted.amount : -deleted.amount;
          return {
            ...a,
            balance: a.balance + balanceChange,
            _count: a._count
              ? {
                  ...a._count,
                  transactions: Math.max(0, a._count.transactions - 1),
                }
              : a._count,
          };
        })
      );
    }
    setTxList((current) => current.filter((t) => t.id !== id));
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-2xl font-bold tracking-tight">Accounts</h1>
        {accounts.length > 0 && (
          <CreateAccountDrawer onCreated={handleAccountCreated}>
            <Button size="sm" className="gap-2">
              <Plus className="h-4 w-4" />
              New account
            </Button>
          </CreateAccountDrawer>
        )}
      </div>

      {accounts.length === 0 ? (
        <div className="rounded-2xl border border-border bg-card p-10 card-lifted">
          <div className="flex flex-col items-center justify-center gap-3 text-center">
            <p className="text-sm text-muted-foreground">
              You don&apos;t have any accounts yet. Create one to start tracking
              your balance and transactions.
            </p>
            <CreateAccountDrawer onCreated={handleAccountCreated}>
              <Button size="sm" className="gap-2">
                <Plus className="h-4 w-4" />
                Create your first account
              </Button>
            </CreateAccountDrawer>
          </div>
        </div>
      ) : (
        <AccountCardsRow
          accounts={accounts}
          selectedAccountId={selectedAccountId}
          onSelect={setSelectedAccountId}
          onDefaultChanged={handleDefaultChanged}
        />
      )}

      {selectedAccount && (
        <ExpandedAccountPanel
          account={selectedAccount}
          transactions={accountTransactions}
          onAccountUpdated={handleAccountUpdated}
          onAccountDeleted={handleAccountDeleted}
          onTransactionDeleted={handleTransactionDeleted}
        />
      )}
    </div>
  );
}
