"use client";

import { useState } from "react";
import { Calendar as CalendarIcon } from "lucide-react";
import { startOfMonth, endOfMonth, subMonths } from "date-fns";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

const PRESETS = [
  {
    label: "This month",
    range: () => ({ from: startOfMonth(new Date()), to: endOfMonth(new Date()) }),
  },
  {
    label: "Last 3 months",
    range: () => ({
      from: startOfMonth(subMonths(new Date(), 2)),
      to: endOfMonth(new Date()),
    }),
  },
];

export function DateRangePopover({ from, to, onApply }) {
  const [open, setOpen] = useState(false);
  const [range, setRange] = useState({
    from: from ? new Date(from) : undefined,
    to: to ? new Date(to) : undefined,
  });

  const handlePreset = (preset) => {
    const r = preset.range();
    setRange(r);
    onApply({ from: r.from.toISOString(), to: r.to.toISOString() });
    setOpen(false);
  };

  const handleApply = () => {
    if (!range?.from || !range?.to) return;
    onApply({ from: range.from.toISOString(), to: range.to.toISOString() });
    setOpen(false);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" size="icon" aria-label="Date range">
          <CalendarIcon className="h-4 w-4" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-3" align="end">
        <div className="flex gap-2 pb-3">
          {PRESETS.map((p) => (
            <button
              key={p.label}
              type="button"
              onClick={() => handlePreset(p)}
              className="rounded-full border border-border px-3 py-1 text-xs text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
            >
              {p.label}
            </button>
          ))}
        </div>
        <Calendar mode="range" selected={range} onSelect={setRange} numberOfMonths={1} />
        <Button
          className="mt-2 w-full"
          size="sm"
          onClick={handleApply}
          disabled={!range?.from || !range?.to}
        >
          Apply range
        </Button>
      </PopoverContent>
    </Popover>
  );
}
