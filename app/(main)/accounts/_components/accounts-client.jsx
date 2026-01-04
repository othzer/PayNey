"use client";

import { useMemo, useState } from "react";
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
      <h1 className="text-2xl font-bold tracking-tight">Accounts</h1>

      {accounts.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          Create an account to get started.
        </p>
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
