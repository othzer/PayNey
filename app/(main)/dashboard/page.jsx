import { getUserAccounts, getDashboardData, getPendingReviewCount } from "@/actions/dashboard";
import { getCurrentBudget } from "@/actions/budget";
import { DashboardClient } from "./_components/dashboard-client";

export default async function DashboardPage() {
  const [accounts, transactions, pendingReviewCount] = await Promise.all([
    getUserAccounts(),
    getDashboardData(),
    getPendingReviewCount(),
  ]);

  const defaultAccount = accounts?.find((account) => account.isDefault) || accounts?.[0];

  let budget = null;
  if (defaultAccount) {
    const budgetData = await getCurrentBudget(defaultAccount.id);
    budget = budgetData?.budget || null;
  }

  return (
    <DashboardClient
      accounts={accounts || []}
      transactions={transactions || []}
      budget={budget}
      pendingReviewCount={pendingReviewCount}
    />
  );
}
