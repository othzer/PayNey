"use client";

import { useMemo, useState } from "react";
import {
  Bar,
  BarChart,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
} from "recharts";
import { format, isSameDay, startOfDay, subDays } from "date-fns";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const RANGES = {
  "7D": { label: "Last 7 days", days: 7 },
  "1M": { label: "Last 30 days", days: 30 },
  "3M": { label: "Last 3 months", days: 90 },
};

export function CashFlowCard({ transactions }) {
  const [range, setRange] = useState("7D");
  const { days } = RANGES[range];

  const data = useMemo(() => {
    const today = startOfDay(new Date());
    const dayList = Array.from({ length: days }, (_, i) =>
      subDays(today, days - 1 - i)
    );

    return dayList.map((day) => {
      const dayTransactions = transactions.filter((t) =>
        isSameDay(new Date(t.date), day)
      );
      const income = dayTransactions
        .filter((t) => t.type === "INCOME")
        .reduce((sum, t) => sum + t.amount, 0);
      const expense = dayTransactions
        .filter((t) => t.type === "EXPENSE")
        .reduce((sum, t) => sum + t.amount, 0);

      return {
        date: format(day, "MMM d"),
        net: income - expense,
        isToday: isSameDay(day, today),
      };
    });
  }, [transactions, days]);

  const total = data.reduce((sum, d) => sum + d.net, 0);

  return (
    <div className="rounded-2xl border border-border bg-card p-5 card-lifted">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-muted-foreground">Cash flow</p>
        <Select value={range} onValueChange={setRange}>
          <SelectTrigger className="h-7 w-[140px] rounded-full text-xs">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {Object.entries(RANGES).map(([key, { label }]) => (
              <SelectItem key={key} value={key}>
                {label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="mt-4 h-[180px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 4, right: 0, left: 0, bottom: 0 }}>
            <XAxis
              dataKey="date"
              fontSize={11}
              tickLine={false}
              axisLine={false}
              interval={days > 7 ? "preserveStartEnd" : 0}
              stroke="hsl(var(--muted-foreground))"
            />
            <Tooltip
              cursor={{ fill: "hsl(var(--secondary))" }}
              formatter={(value) => [`$${value.toFixed(2)}`, "Net"]}
              contentStyle={{
                backgroundColor: "hsl(var(--popover))",
                border: "1px solid hsl(var(--border))",
                borderRadius: "var(--radius)",
              }}
            />
            <Bar dataKey="net" radius={[4, 4, 4, 4]}>
              {data.map((entry, index) => (
                <Cell
                  key={index}
                  fill={entry.net >= 0 ? "#22c55e" : "#ef4444"}
                  fillOpacity={entry.isToday ? 1 : 0.6}
                  stroke={entry.isToday ? "hsl(var(--foreground))" : "none"}
                  strokeWidth={entry.isToday ? 1 : 0}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      <p
        className={`money mt-2 text-xl ${
          total >= 0 ? "text-green-400" : "text-red-400"
        }`}
      >
        {total >= 0 ? "+" : "-"}${Math.abs(total).toFixed(2)}
      </p>
    </div>
  );
}
