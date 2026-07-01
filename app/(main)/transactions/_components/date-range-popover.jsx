"use client";

import { useEffect, useState } from "react";
import { Calendar as CalendarIcon } from "lucide-react";
import { format, startOfMonth, endOfMonth, subMonths } from "date-fns";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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

function toInputValue(isoString) {
  if (!isoString) return "";
  return format(new Date(isoString), "yyyy-MM-dd");
}

export function DateRangePopover({ from, to, onApply }) {
  const [open, setOpen] = useState(false);
  const [startDate, setStartDate] = useState(toInputValue(from));
  const [endDate, setEndDate] = useState(toInputValue(to));

  useEffect(() => {
    if (!open) return;
    setStartDate(toInputValue(from));
    setEndDate(toInputValue(to));
  }, [open, from, to]);

  const handlePreset = (preset) => {
    const r = preset.range();
    onApply({ from: r.from.toISOString(), to: r.to.toISOString() });
    setOpen(false);
  };

  const handleApply = () => {
    if (!startDate || !endDate) return;
    const fromDate = new Date(`${startDate}T00:00:00`);
    const toDate = new Date(`${endDate}T23:59:59`);
    if (fromDate > toDate) return;
    onApply({ from: fromDate.toISOString(), to: toDate.toISOString() });
    setOpen(false);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" size="icon" aria-label="Date range">
          <CalendarIcon className="h-4 w-4" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-72" align="end">
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

        <div className="space-y-3">
          <div className="space-y-1">
            <label className="text-xs text-muted-foreground">Start date</label>
            <Input
              type="date"
              value={startDate}
              max={endDate || undefined}
              onChange={(e) => setStartDate(e.target.value)}
            />
          </div>
          <div className="space-y-1">
            <label className="text-xs text-muted-foreground">End date</label>
            <Input
              type="date"
              value={endDate}
              min={startDate || undefined}
              onChange={(e) => setEndDate(e.target.value)}
            />
          </div>
        </div>

        <Button
          className="mt-3 w-full"
          size="sm"
          onClick={handleApply}
          disabled={!startDate || !endDate}
        >
          Apply range
        </Button>
      </PopoverContent>
    </Popover>
  );
}
