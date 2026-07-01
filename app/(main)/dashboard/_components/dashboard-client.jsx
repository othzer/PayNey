"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { UserButton } from "@clerk/nextjs";
import { Plus, ClipboardCheck } from "lucide-react";
import {
  startOfMonth,
  endOfMonth,
  subMonths,
  isWithinInterval,
} from "date-fns";
import { Button } from "@/components/ui/button";
import { defaultCategories } from "@/data/categories";
import { AccountSwitcher } from "./account-switcher";
import { OverviewCard } from "./overview-card";
import { BudgetCard } from "./budget-card";
import { CashFlowCard } from "./cash-flow-card";
import { SpendHeatmap } from "./spend-heatmap";
import { TopCategoriesCard } from "./top-categories-card";
import { RecentTransactionsCard } from "./recent-transactions-card";
import { RecurringTransactionsCard } from "./recurring-transactions-card";

const categoryNameById = defaultCategories.reduce((acc, c) => {
  acc[c.id] = c.name;
  return acc;
}, {});

function sumByType(transactions, type) {
  return transactions
    .filter((t) => t.type === type)
    .reduce((sum, t) => sum + t.amount, 0);
}

function buildInsight({ thisMonthExpense, prevMonthExpense, topCategory }) {
  if (prevMonthExpense > 0) {
    const diffPct = Math.round(
      ((thisMonthExpense - prevMonthExpense) / prevMonthExpense) * 100
    );
    if (diffPct > 5) {
      return `You've spent ${diffPct}% more this month than last${
        topCategory ? `, mostly on ${topCategory}` : ""
      }.`;
    }
    if (diffPct < -5) {
      return `You've spent ${Math.abs(diffPct)}% less this month than last — nice work.`;
    }
  }
  return topCategory
    ? `${topCategory} is your top spending category this month.`
    : "No spending activity yet this month.";
}

export function DashboardClient({
  accounts,
  transactions,
  budget: initialBudget,
  pendingReviewCount = 0,
}) {
  const [selectedAccountId, setSelectedAccountId] = useState(
    () => accounts.find((a) => a.isDefault)?.id || accounts[0]?.id
  );
  const [budget, setBudget] = useState(initialBudget);

  const selectedAccount = useMemo(
    () => accounts.find((a) => a.id === selectedAccountId),
    [accounts, selectedAccountId]
  );

  const accountTransactions = useMemo(
    () => transactions.filter((t) => t.accountId === selectedAccountId),
    [transactions, selectedAccountId]
  );

  const stats = useMemo(() => {
    const now = new Date();
    const monthRange = { start: startOfMonth(now), end: endOfMonth(now) };
    const prevMonthDate = subMonths(now, 1);
    const prevMonthRange = {
      start: startOfMonth(prevMonthDate),
      end: endOfMonth(prevMonthDate),
    };

    const thisMonthTx = accountTransactions.filter((t) =>
      isWithinInterval(new Date(t.date), monthRange)
    );
    const prevMonthTx = accountTransactions.filter((t) =>
      isWithinInterval(new Date(t.date), prevMonthRange)
    );

    const thisMonthIncome = sumByType(thisMonthTx, "INCOME");
    const thisMonthExpense = sumByType(thisMonthTx, "EXPENSE");
    const prevMonthExpense = sumByType(prevMonthTx, "EXPENSE");
    const netThisMonth = thisMonthIncome - thisMonthExpense;

    const expenseDeltaPct =
      prevMonthExpense > 0
        ? ((thisMonthExpense - prevMonthExpense) / prevMonthExpense) * 100
        : null;

    const categoryTotals = thisMonthTx
      .filter((t) => t.type === "EXPENSE")
      .reduce((acc, t) => {
        acc[t.category] = (acc[t.category] || 0) + t.amount;
        return acc;
      }, {});
    const topCategoryId = Object.entries(categoryTotals).sort(
      (a, b) => b[1] - a[1]
    )[0]?.[0];

    return {
      thisMonthIncome,
      thisMonthExpense,
      prevMonthExpense,
      netThisMonth,
      balanceDelta: netThisMonth,
      expenseDeltaPct,
      topCategoryId,
    };
  }, [accountTransactions]);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
          {accounts.length > 0 && (
            <AccountSwitcher
              accounts={accounts}
              selectedAccountId={selectedAccountId}
              onChange={setSelectedAccountId}
            />
          )}
        </div>

        <div className="flex items-center gap-3">
          <Link href="/review" className="relative">
            <Button variant="outline" size="sm" className="gap-2 rounded-full">
              <ClipboardCheck className="h-4 w-4" />
              Review
            </Button>
            {pendingReviewCount > 0 && (
              <span className="absolute -right-1 -top-1 h-2.5 w-2.5 rounded-full bg-destructive" />
            )}
          </Link>
          <Button asChild size="sm" className="gap-2">
            <Link href="/transaction/create">
              <Plus className="h-4 w-4" />
              Add Transaction
            </Link>
          </Button>
          <UserButton appearance={{ elements: { avatarBox: "w-8 h-8" } }} />
        </div>
      </div>

      {!selectedAccount ? (
        <p className="text-sm text-muted-foreground">
          Create an account to start tracking your finances.
        </p>
      ) : (
        <>
          <OverviewCard
            accountName={selectedAccount.name}
            balance={selectedAccount.balance}
            balanceDelta={stats.balanceDelta}
            thisMonthExpense={stats.thisMonthExpense}
            expenseDeltaPct={stats.expenseDeltaPct}
            netThisMonth={stats.netThisMonth}
            insight={buildInsight({
              thisMonthExpense: stats.thisMonthExpense,
              prevMonthExpense: stats.prevMonthExpense,
              topCategory: categoryNameById[stats.topCategoryId],
            })}
          />

          <BudgetCard
            accountName={selectedAccount.name}
            budget={budget}
            currentExpenses={stats.thisMonthExpense}
            onBudgetUpdated={setBudget}
          />

          <RecentTransactionsCard transactions={accountTransactions} />

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1.4fr_1fr]">
            <div className="space-y-6">
              <CashFlowCard transactions={accountTransactions} />
              <SpendHeatmap transactions={accountTransactions} />
            </div>
            <div className="space-y-6">
              <TopCategoriesCard transactions={accountTransactions} />
              <RecurringTransactionsCard transactions={accountTransactions} />
            </div>
          </div>
        </>
      )}
    </div>
  );
}
