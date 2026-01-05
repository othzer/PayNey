"use client";

import { cn } from "@/lib/utils";

export function MonthTabs({ months, selectedMonth, onSelect }) {
  return (
    <div className="flex gap-1 overflow-x-auto border-b border-border">
      {months.map((m) => (
        <button
          key={m.key}
          type="button"
          onClick={() => onSelect(m.key)}
          className={cn(
            "shrink-0 whitespace-nowrap border-b-2 px-3 py-2 text-sm transition-colors",
            selectedMonth === m.key
              ? "border-primary text-foreground"
              : "border-transparent text-muted-foreground hover:text-foreground"
          )}
        >
          {m.label}
        </button>
      ))}
    </div>
  );
}
