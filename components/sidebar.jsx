"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Wallet,
  ArrowLeftRight,
  HandCoins,
  ClipboardCheck,
  Sparkles,
  Smartphone,
  Settings,
  ChevronLeft,
  ChevronRight,
  Plus,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/accounts", label: "Accounts", icon: Wallet },
  { href: "/transactions", label: "Transactions", icon: ArrowLeftRight },
  { href: "/loans", label: "Loans", icon: HandCoins, badgeKey: "loans" },
  {
    href: "/review",
    label: "Review",
    icon: ClipboardCheck,
    badgeKey: "review",
  },
  { href: "/summary", label: "AI Summary", icon: Sparkles },
  { href: "/connect", label: "Connect", icon: Smartphone },
];

const STORAGE_KEY = "payney:sidebar-collapsed";

export default function Sidebar({ pendingReviewCount = 0, overdueLoanCount = 0 }) {
  const badgeCounts = { review: pendingReviewCount, loans: overdueLoanCount };
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);

  useEffect(() => {
    if (window.localStorage.getItem(STORAGE_KEY) === "true") {
      setCollapsed(true);
    }
  }, []);

  const toggleCollapsed = () => {
    setCollapsed((prev) => {
      const next = !prev;
      window.localStorage.setItem(STORAGE_KEY, String(next));
      return next;
    });
  };

  return (
    <TooltipProvider delayDuration={200}>
      <aside
        className={cn(
          "sticky top-0 flex h-screen shrink-0 flex-col border-r border-border bg-card transition-[width] duration-200",
          collapsed ? "w-[68px]" : "w-[190px]"
        )}
      >
        <div
          className={cn(
            "flex items-center gap-2 p-3",
            collapsed ? "flex-col" : "justify-between"
          )}
        >
          <Link
            href="/dashboard"
            className="flex items-center gap-2 overflow-hidden"
            aria-label="PayNey"
          >
            <Image
              src="/payney-logomark.svg"
              alt="PayNey"
              width={24}
              height={24}
              className="h-6 w-6 shrink-0 rounded-md object-contain"
              priority
            />
            {!collapsed && (
              <span className="font-display text-sm font-semibold text-foreground">
                PayNey
              </span>
            )}
          </Link>
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 shrink-0"
            onClick={toggleCollapsed}
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {collapsed ? (
              <ChevronRight className="h-4 w-4" />
            ) : (
              <ChevronLeft className="h-4 w-4" />
            )}
          </Button>
        </div>

        <div className="px-3 pb-3">
          {collapsed ? (
            <Tooltip>
              <TooltipTrigger asChild>
                <Button asChild size="icon" className="w-full">
                  <Link href="/transaction/create" aria-label="Add Transaction">
                    <Plus className="h-4 w-4" />
                  </Link>
                </Button>
              </TooltipTrigger>
              <TooltipContent side="right">Add Transaction</TooltipContent>
            </Tooltip>
          ) : (
            <Button asChild className="w-full justify-center gap-2 brand-glow">
              <Link href="/transaction/create">
                <Plus className="h-4 w-4" />
                Add Transaction
              </Link>
            </Button>
          )}
        </div>

        <nav className="flex-1 space-y-1 px-2">
          {NAV_ITEMS.map(({ href, label, icon: Icon, badgeKey }) => {
            const active = pathname === href || pathname?.startsWith(`${href}/`);
            const badgeCount = badgeKey ? badgeCounts[badgeKey] : 0;
            const hasBadge = badgeCount > 0;

            const link = (
              <Link
                href={href}
                className={cn(
                  "relative flex items-center gap-3 rounded-lg px-2.5 py-2 text-sm transition-colors",
                  collapsed && "justify-center",
                  active
                    ? "bg-primary/15 text-foreground"
                    : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                )}
              >
                <Icon className="h-4 w-4 shrink-0" />
                {!collapsed && <span className="flex-1">{label}</span>}
                {!collapsed && hasBadge && (
                  <span className="rounded-full bg-destructive px-1.5 py-0.5 text-[10px] font-semibold text-destructive-foreground">
                    {badgeCount}
                  </span>
                )}
                {collapsed && hasBadge && (
                  <span className="absolute right-1.5 top-1.5 h-1.5 w-1.5 rounded-full bg-destructive" />
                )}
              </Link>
            );

            return collapsed ? (
              <Tooltip key={href}>
                <TooltipTrigger asChild>{link}</TooltipTrigger>
                <TooltipContent side="right">{label}</TooltipContent>
              </Tooltip>
            ) : (
              <div key={href}>{link}</div>
            );
          })}
        </nav>

        <div className="border-t border-border px-2 py-3">
          <div
            className={cn(
              "flex cursor-not-allowed items-center gap-3 rounded-lg px-2.5 py-2 text-sm text-muted-foreground opacity-50",
              collapsed && "justify-center"
            )}
          >
            <Settings className="h-4 w-4 shrink-0" />
            {!collapsed && <span>Settings</span>}
          </div>
        </div>
      </aside>
    </TooltipProvider>
  );
}
