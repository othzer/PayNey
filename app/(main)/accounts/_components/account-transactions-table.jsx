"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { format } from "date-fns";
import { Search, Trash } from "lucide-react";
import { toast } from "sonner";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { TransactionRowActions } from "@/components/transaction-row-actions";
import { defaultCategories } from "@/data/categories";
import { bulkDeleteTransactions } from "@/actions/account";
import useFetch from "@/hooks/use-fetch";

const categoryById = defaultCategories.reduce((acc, c) => {
  acc[c.id] = c;
  return acc;
}, {});

const PAGE_SIZE = 15;

export function AccountTransactionsTable({ transactions, onTransactionDeleted }) {
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("ALL");
  const [categoryFilter, setCategoryFilter] = useState("ALL");
  const [selectedIds, setSelectedIds] = useState([]);
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);

  const {
    fn: deleteFn,
    data: deleteResult,
    loading: deleteLoading,
  } = useFetch(bulkDeleteTransactions);

  const categoryOptions = useMemo(() => {
    const ids = [...new Set(transactions.map((t) => t.category))];
    return ids
      .map((id) => ({ id, name: categoryById[id]?.name || id }))
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [transactions]);

  const filtered = useMemo(() => {
    let result = [...transactions].sort(
      (a, b) => new Date(b.date) - new Date(a.date)
    );

    if (search) {
      const q = search.toLowerCase();
      result = result.filter((t) => t.description?.toLowerCase().includes(q));
    }
    if (typeFilter !== "ALL") {
      result = result.filter((t) => t.type === typeFilter);
    }
    if (categoryFilter !== "ALL") {
      result = result.filter((t) => t.category === categoryFilter);
    }

    return result;
  }, [transactions, search, typeFilter, categoryFilter]);

  const visible = filtered.slice(0, visibleCount);

  useEffect(() => {
    setVisibleCount(PAGE_SIZE);
    setSelectedIds([]);
  }, [search, typeFilter, categoryFilter]);

  useEffect(() => {
    if (!deleteResult) return;
    if (deleteResult.success) {
      toast.success(`${selectedIds.length} transaction(s) deleted`);
      selectedIds.forEach((id) => onTransactionDeleted?.(id));
      setSelectedIds([]);
    } else {
      toast.error(deleteResult.error || "Failed to delete transactions");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [deleteResult]);

  const handleToggleRow = (id) => {
    setSelectedIds((current) =>
      current.includes(id) ? current.filter((x) => x !== id) : [...current, id]
    );
  };

  const handleToggleAll = () => {
    setSelectedIds((current) =>
      current.length === visible.length ? [] : visible.map((t) => t.id)
    );
  };

  const handleBulkDelete = () => {
    if (
      !window.confirm(
        `Delete ${selectedIds.length} transaction(s)? This can't be undone.`
      )
    ) {
      return;
    }
    deleteFn(selectedIds);
  };

  if (transactions.length === 0) {
    return (
      <div className="rounded-2xl border border-border bg-card p-10 card-lifted">
        <div className="flex flex-col items-center justify-center gap-3 text-center">
          <p className="text-sm text-muted-foreground">No transactions yet</p>
          <Button asChild size="sm">
            <Link href="/transaction/create">Add transaction</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-border bg-card p-5 card-lifted">
      {selectedIds.length > 0 ? (
        <div className="flex items-center justify-between rounded-lg bg-secondary px-3 py-2">
          <span className="text-sm text-foreground">
            {selectedIds.length} selected
          </span>
          <button
            onClick={handleBulkDelete}
            disabled={deleteLoading}
            className="flex items-center gap-1.5 text-sm text-destructive hover:underline disabled:opacity-50"
          >
            <Trash className="h-3.5 w-3.5" />
            Delete
          </button>
        </div>
      ) : (
        <div className="flex flex-col gap-3 sm:flex-row">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search transactions…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-8"
            />
          </div>
          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="All types" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All types</SelectItem>
              <SelectItem value="INCOME">Income</SelectItem>
              <SelectItem value="EXPENSE">Expense</SelectItem>
            </SelectContent>
          </Select>
          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="w-[160px]">
              <SelectValue placeholder="All categories" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All categories</SelectItem>
              {categoryOptions.map((c) => (
                <SelectItem key={c.id} value={c.id}>
                  {c.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      <div className="mt-4 overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[40px]">
                <Checkbox
                  checked={
                    selectedIds.length === visible.length && visible.length > 0
                  }
                  onCheckedChange={handleToggleAll}
                />
              </TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Description</TableHead>
              <TableHead>Category</TableHead>
              <TableHead className="text-right">Amount</TableHead>
              <TableHead className="w-8" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {visible.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={6}
                  className="text-center text-sm text-muted-foreground"
                >
                  No transactions match your filters
                </TableCell>
              </TableRow>
            ) : (
              visible.map((t) => {
                const category = categoryById[t.category];
                return (
                  <TableRow key={t.id} className="group">
                    <TableCell>
                      <Checkbox
                        checked={selectedIds.includes(t.id)}
                        onCheckedChange={() => handleToggleRow(t.id)}
                      />
                    </TableCell>
                    <TableCell className="whitespace-nowrap text-muted-foreground">
                      {format(new Date(t.date), "MMM d, yyyy")}
                    </TableCell>
                    <TableCell>{t.description || "Untitled Transaction"}</TableCell>
                    <TableCell>
                      <span
                        className="rounded-full px-2 py-0.5 text-xs"
                        style={{
                          backgroundColor: `${category?.color || "#8A8E9C"}22`,
                          color: category?.color || "#8A8E9C",
                        }}
                      >
                        {category?.name || t.category}
                      </span>
                    </TableCell>
                    <TableCell
                      className={`money text-right ${
                        t.type === "EXPENSE" ? "text-red-400" : "text-green-400"
                      }`}
                    >
                      {t.type === "EXPENSE" ? "-" : "+"}${t.amount.toFixed(2)}
                    </TableCell>
                    <TableCell>
                      <TransactionRowActions
                        transaction={t}
                        onDeleted={onTransactionDeleted}
                      />
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>

      {visibleCount < filtered.length && (
        <div className="mt-4 flex justify-center">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setVisibleCount((c) => c + PAGE_SIZE)}
          >
            Load more
          </Button>
        </div>
      )}
    </div>
  );
}
