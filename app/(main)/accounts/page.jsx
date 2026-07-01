import { getUserAccounts, getDashboardData } from "@/actions/dashboard";
import { AccountsClient } from "./_components/accounts-client";

export default async function AccountsPage({ searchParams }) {
  const params = await searchParams;
  const [accounts, transactions] = await Promise.all([
    getUserAccounts(),
    getDashboardData(),
  ]);

  return (
    <AccountsClient
      accounts={accounts || []}
      transactions={transactions || []}
      initialAccountId={params?.account}
    />
  );
}
