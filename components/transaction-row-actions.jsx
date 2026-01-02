"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { MoreHorizontal } from "lucide-react";
import { toast } from "sonner";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { bulkDeleteTransactions } from "@/actions/account";
import useFetch from "@/hooks/use-fetch";
import { cn } from "@/lib/utils";

export function TransactionRowActions({ transaction, onDeleted, className }) {
  const router = useRouter();
  const { loading, fn: deleteFn, data: result } = useFetch(bulkDeleteTransactions);

  useEffect(() => {
    if (!result) return;
    if (result.success) {
      toast.success("Transaction deleted");
      onDeleted?.(transaction.id);
    } else {
      toast.error(result.error || "Failed to delete transaction");
    }
  }, [result]);

  const handleDelete = () => {
    if (!window.confirm("Delete this transaction? This can't be undone.")) {
      return;
    }
    deleteFn([transaction.id]);
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          disabled={loading}
          className={cn(
            "h-7 w-7 opacity-0 transition-opacity group-hover:opacity-100 focus-visible:opacity-100 data-[state=open]:opacity-100",
            className
          )}
        >
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem
          onClick={() => router.push(`/transaction/create?edit=${transaction.id}`)}
        >
          Edit
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          className="text-destructive"
          onClick={handleDelete}
          disabled={loading}
        >
          Delete
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
