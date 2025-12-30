"use client";

import { ChevronDown } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function AccountSwitcher({ accounts, selectedAccountId, onChange }) {
  const selected = accounts.find((a) => a.id === selectedAccountId);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="lifted flex items-center gap-1.5 rounded-full border border-border bg-card px-3 py-1.5 text-sm font-medium text-foreground transition-colors hover:bg-secondary">
          {selected?.name || "Select account"}
          <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start">
        {accounts.map((account) => (
          <DropdownMenuItem
            key={account.id}
            onClick={() => onChange(account.id)}
            className="capitalize"
          >
            {account.name}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
