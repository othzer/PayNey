import {
  startOfMonth,
  endOfMonth,
  parseISO,
  subMonths,
  format,
  isValid,
} from "date-fns";
import { getUserAccounts } from "@/actions/dashboard";
import {
  getFilteredTransactions,
  getTransactionAmountRange,
} from "@/actions/transaction";
import { TransactionsPageClient } from "./_components/transactions-page-client";

function normalizeParam(value) {
  return Array.isArray(value) ? value.join(",") : value;
}

function resolveDateRange(params) {
  if (params.from && params.to) {
    const from = parseISO(normalizeParam(params.from));
    const to = parseISO(normalizeParam(params.to));
    if (isValid(from) && isValid(to)) {
      return { from, to };
    }
  }
  const month = normalizeParam(params.month);
  const parsedMonth = month ? parseISO(`${month}-01`) : null;
  const base = parsedMonth && isValid(parsedMonth) ? parsedMonth : new Date();
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

  const categoryParam = normalizeParam(params.category);
  const typeParam = normalizeParam(params.type);
  const recurringParam = normalizeParam(params.recurring);
  const categories = categoryParam ? categoryParam.split(",") : undefined;
  const types = typeParam ? typeParam.split(",") : undefined;
  const recurring = recurringParam ? recurringParam.split(",") : undefined;

  const parsedAmountMin = parseFloat(normalizeParam(params.amountMin));
  const parsedAmountMax = parseFloat(normalizeParam(params.amountMax));
  const amountMin = Number.isFinite(parsedAmountMin) ? parsedAmountMin : undefined;
  const amountMax = Number.isFinite(parsedAmountMax) ? parsedAmountMax : undefined;

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
