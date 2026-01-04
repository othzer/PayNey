"use client";

import { useCallback, useEffect, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Search, SlidersHorizontal } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { TransactionTable } from "@/components/transaction-table";
import { AccountScopeDropdown } from "./account-scope-dropdown";
import { MonthTabs } from "./month-tabs";
import { SummaryBar } from "./summary-bar";
import { DateRangePopover } from "./date-range-popover";
import { FiltersPanel } from "./filters-panel";

export function TransactionsPageClient({
  accounts,
  transactions,
  summary,
  amountRange,
  months,
  defaultMonthKey,
  searchParams,
}) {
  const router = useRouter();
  const pathname = usePathname();
  const currentSearchParams = useSearchParams();

  const [searchInput, setSearchInput] = useState(searchParams.search || "");
  const [filtersOpen, setFiltersOpen] = useState(false);

  const updateParams = useCallback(
    (updates) => {
      const next = new URLSearchParams(currentSearchParams.toString());
      Object.entries(updates).forEach(([key, value]) => {
        if (value === undefined || value === null || value === "") {
          next.delete(key);
        } else {
          next.set(key, value);
        }
      });
      router.push(`${pathname}?${next.toString()}`);
    },
    [currentSearchParams, pathname, router]
  );

  useEffect(() => {
    const currentSearch = searchParams.search || "";
    if (searchInput === currentSearch) return;
    const handle = setTimeout(() => {
      updateParams({ search: searchInput || undefined });
    }, 300);
    return () => clearTimeout(handle);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchInput]);

  const isCustomRange = Boolean(searchParams.from && searchParams.to);
  const selectedMonth = isCustomRange ? null : searchParams.month || defaultMonthKey;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="font-display text-2xl font-bold tracking-tight">
          Transactions
        </h1>
        <AccountScopeDropdown
          accounts={accounts}
          value={searchParams.account || "all"}
          onChange={(accountId) =>
            updateParams({ account: accountId === "all" ? undefined : accountId })
          }
        />
      </div>

      <div className="flex items-center gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search transactions…"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className="pl-8"
          />
        </div>
        <DateRangePopover
          from={searchParams.from}
          to={searchParams.to}
          onApply={(range) => updateParams({ ...range, month: undefined })}
        />
        <Button
          variant="outline"
          size="icon"
          aria-label="Filters"
          onClick={() => setFiltersOpen(true)}
        >
          <SlidersHorizontal className="h-4 w-4" />
        </Button>
      </div>

      <MonthTabs
        months={months}
        selectedMonth={selectedMonth}
        onSelect={(monthKey) =>
          updateParams({ month: monthKey, from: undefined, to: undefined })
        }
      />

      <SummaryBar summary={summary} />

      <TransactionTable
        transactions={transactions}
        hideInlineToolbar
        emptyStateMessage="No transactions match the current view"
        onTransactionDeleted={() => router.refresh()}
      />

      <FiltersPanel
        open={filtersOpen}
        onOpenChange={setFiltersOpen}
        searchParams={searchParams}
        amountRange={amountRange}
        onApply={(filters) => {
          updateParams(filters);
          setFiltersOpen(false);
        }}
      />
    </div>
  );
}
