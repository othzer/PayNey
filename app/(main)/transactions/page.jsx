import { startOfMonth, endOfMonth, parseISO, subMonths, format } from "date-fns";
import { getUserAccounts } from "@/actions/dashboard";
import {
  getFilteredTransactions,
  getTransactionAmountRange,
} from "@/actions/transaction";
import { TransactionsPageClient } from "./_components/transactions-page-client";

function resolveDateRange(params) {
  if (params.from && params.to) {
    return { from: parseISO(params.from), to: parseISO(params.to) };
  }
  const base = params.month ? parseISO(`${params.month}-01`) : new Date();
  return { from: startOfMonth(base), to: endOfMonth(base) };
}

function getRecentMonths(count = 6) {
  const now = new Date();
  return Array.from({ length: count }, (_, i) => {
    const d = subMonths(now, count - 1 - i);
    return { key: format(d, "yyyy-MM"), label: format(d, "MMM") };
  });
}

export default async function TransactionsPage({ searchParams }) {
  const params = await searchParams;
  const { from, to } = resolveDateRange(params);

  const accountId =
    params.account && params.account !== "all" ? params.account : undefined;
  const categories = params.category ? params.category.split(",") : undefined;
  const types = params.type ? params.type.split(",") : undefined;
  const recurring = params.recurring ? params.recurring.split(",") : undefined;
  const amountMin = params.amountMin ? parseFloat(params.amountMin) : undefined;
  const amountMax = params.amountMax ? parseFloat(params.amountMax) : undefined;

  const [accounts, { transactions, summary }, amountRange] = await Promise.all([
    getUserAccounts(),
    getFilteredTransactions({
      from,
      to,
      accountId,
      search: params.search,
      categories,
      types,
      recurring,
      amountMin,
      amountMax,
    }),
    getTransactionAmountRange({ accountId }),
  ]);

  return (
    <TransactionsPageClient
      accounts={accounts || []}
      transactions={transactions}
      summary={summary}
      amountRange={amountRange}
      months={getRecentMonths()}
      defaultMonthKey={format(new Date(), "yyyy-MM")}
      searchParams={params}
    />
  );
}
