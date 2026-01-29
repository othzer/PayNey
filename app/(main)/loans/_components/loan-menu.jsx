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
import { deleteLoan } from "@/actions/loans";
import useFetch from "@/hooks/use-fetch";

export function LoanMenu({ loan }) {
  const router = useRouter();
  const { fn: deleteFn, data: result, loading } = useFetch(deleteLoan);

  useEffect(() => {
    if (!result) return;
    if (result.success) {
      toast.success("Loan deleted");
      router.push("/loans");
      router.refresh();
    } else {
      toast.error(result.error || "Failed to delete loan");
    }
  }, [result]);

  const handleDelete = () => {
    const hasRepayments = Number(loan.repaidAmount) > 0;
    const message = hasRepayments
      ? "Delete this loan and all its recorded repayments? This can't be undone."
      : "Delete this loan? This can't be undone.";
    if (!window.confirm(message)) return;
    deleteFn(loan.id);
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" aria-label="Loan options">
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem
          onClick={() => router.push(`/loans/new?edit=${loan.id}`)}
        >
          Edit loan
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          className="text-destructive"
          onClick={handleDelete}
          disabled={loading}
        >
          Delete loan
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
