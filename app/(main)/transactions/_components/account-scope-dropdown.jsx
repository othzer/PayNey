"use client";

import { ChevronDown } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function AccountScopeDropdown({ accounts, value, onChange }) {
  const label =
    value === "all"
      ? "All accounts"
      : accounts.find((a) => a.id === value)?.name || "All accounts";

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="lifted flex items-center gap-1.5 rounded-full border border-border bg-card px-3 py-1.5 text-sm font-medium text-foreground transition-colors hover:bg-secondary">
          {label}
          <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => onChange("all")}>
          All accounts
        </DropdownMenuItem>
        {accounts.map((a) => (
          <DropdownMenuItem
            key={a.id}
            onClick={() => onChange(a.id)}
            className="capitalize"
          >
            {a.name}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
