"use client";

import { useEffect, useState } from "react";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { defaultCategories } from "@/data/categories";
import { cn } from "@/lib/utils";

function parseList(value) {
  return value ? value.split(",") : [];
}

export function FiltersPanel({
  open,
  onOpenChange,
  searchParams,
  amountRange,
  onApply,
}) {
  const [categories, setCategories] = useState(() => parseList(searchParams.category));
  const [types, setTypes] = useState(() => {
    const parsed = parseList(searchParams.type);
    return parsed.length ? parsed : ["INCOME", "EXPENSE"];
  });
  const [recurring, setRecurring] = useState(() => {
    const parsed = parseList(searchParams.recurring);
    return parsed.length ? parsed : ["one-time", "recurring"];
  });
  const [amount, setAmount] = useState([
    searchParams.amountMin ? parseFloat(searchParams.amountMin) : amountRange.min,
    searchParams.amountMax ? parseFloat(searchParams.amountMax) : amountRange.max,
  ]);

  useEffect(() => {
    if (!open) return;
    setCategories(parseList(searchParams.category));
    const parsedTypes = parseList(searchParams.type);
    setTypes(parsedTypes.length ? parsedTypes : ["INCOME", "EXPENSE"]);
    const parsedRecurring = parseList(searchParams.recurring);
    setRecurring(parsedRecurring.length ? parsedRecurring : ["one-time", "recurring"]);
    setAmount([
      searchParams.amountMin ? parseFloat(searchParams.amountMin) : amountRange.min,
      searchParams.amountMax ? parseFloat(searchParams.amountMax) : amountRange.max,
    ]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const toggleCategory = (id) => {
    setCategories((current) =>
      current.includes(id) ? current.filter((c) => c !== id) : [...current, id]
    );
  };

  const toggleFromList = (setter, value) => {
    setter((current) => {
      if (current.includes(value)) {
        if (current.length === 1) return current;
        return current.filter((v) => v !== value);
      }
      return [...current, value];
    });
  };

  const handleReset = () => {
    setCategories([]);
    setTypes(["INCOME", "EXPENSE"]);
    setRecurring(["one-time", "recurring"]);
    setAmount([amountRange.min, amountRange.max]);
  };

  const handleApply = () => {
    onApply({
      category: categories.length ? categories.join(",") : undefined,
      type: types.length === 2 ? undefined : types.join(","),
      recurring: recurring.length === 2 ? undefined : recurring.join(","),
      amountMin: amount[0] > amountRange.min ? String(amount[0]) : undefined,
      amountMax: amount[1] < amountRange.max ? String(amount[1]) : undefined,
    });
  };

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent>
        <DrawerHeader className="flex flex-row items-center justify-between">
          <DrawerTitle>Filters</DrawerTitle>
          <button
            type="button"
            onClick={handleReset}
            className="text-sm text-primary hover:underline"
          >
            Reset
          </button>
        </DrawerHeader>

        <div className="space-y-6 px-4 pb-6">
          <div>
            <p className="mb-2 text-sm font-medium text-muted-foreground">
              Category
            </p>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => setCategories([])}
                className={cn(
                  "rounded-full border px-3 py-1 text-xs transition-colors",
                  categories.length === 0
                    ? "border-primary bg-primary/15 text-foreground"
                    : "border-border text-muted-foreground hover:text-foreground"
                )}
              >
                All
              </button>
              {defaultCategories.map((c) => (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => toggleCategory(c.id)}
                  className={cn(
                    "flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs transition-colors",
                    categories.includes(c.id)
                      ? "border-primary bg-primary/15 text-foreground"
                      : "border-border text-muted-foreground hover:text-foreground"
                  )}
                >
                  <span
                    className="h-2 w-2 rounded-full"
                    style={{ backgroundColor: c.color }}
                  />
                  {c.name}
                </button>
              ))}
            </div>
          </div>

          <div>
            <p className="mb-3 text-sm font-medium text-muted-foreground">
              Amount range
            </p>
            <Slider
              min={amountRange.min}
              max={amountRange.max}
              step={1}
              value={amount}
              onValueChange={setAmount}
            />
            <div className="mt-2 flex items-center justify-between">
              <span className="money text-sm">${amount[0].toFixed(2)}</span>
              <span className="money text-sm">${amount[1].toFixed(2)}</span>
            </div>
          </div>

          <div>
            <p className="mb-2 text-sm font-medium text-muted-foreground">Type</p>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => toggleFromList(setTypes, "INCOME")}
                className={cn(
                  "rounded-full border px-3 py-1 text-xs transition-colors",
                  types.includes("INCOME")
                    ? "border-green-500 bg-green-500/10 text-green-400"
                    : "border-border text-muted-foreground hover:text-foreground"
                )}
              >
                Income
              </button>
              <button
                type="button"
                onClick={() => toggleFromList(setTypes, "EXPENSE")}
                className={cn(
                  "rounded-full border px-3 py-1 text-xs transition-colors",
                  types.includes("EXPENSE")
                    ? "border-red-500 bg-red-500/10 text-red-400"
                    : "border-border text-muted-foreground hover:text-foreground"
                )}
              >
                Expense
              </button>
            </div>
          </div>

          <div>
            <p className="mb-2 text-sm font-medium text-muted-foreground">
              Recurring
            </p>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => toggleFromList(setRecurring, "one-time")}
                className={cn(
                  "rounded-full border px-3 py-1 text-xs transition-colors",
                  recurring.includes("one-time")
                    ? "border-primary bg-primary/15 text-foreground"
                    : "border-border text-muted-foreground hover:text-foreground"
                )}
              >
                One-time
              </button>
              <button
                type="button"
                onClick={() => toggleFromList(setRecurring, "recurring")}
                className={cn(
                  "rounded-full border px-3 py-1 text-xs transition-colors",
                  recurring.includes("recurring")
                    ? "border-primary bg-primary/15 text-foreground"
                    : "border-border text-muted-foreground hover:text-foreground"
                )}
              >
                Recurring
              </button>
            </div>
          </div>

          <Button className="w-full" onClick={handleApply}>
            Apply filters
          </Button>
        </div>
      </DrawerContent>
    </Drawer>
  );
}
