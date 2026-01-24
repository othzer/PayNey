"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { format } from "date-fns";
import { CalendarIcon, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { cn, formatMoney } from "@/lib/utils";
import useFetch from "@/hooks/use-fetch";
import { repaymentSchema } from "@/app/lib/schema";
import { createRepayment } from "@/actions/loans";

export function AddRepaymentDrawer({ loanId, remaining, onRepaid, children }) {
  const [open, setOpen] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
    reset,
  } = useForm({
    resolver: zodResolver(repaymentSchema),
    defaultValues: { amount: "", paidOn: new Date(), note: "" },
  });

  const { fn: repayFn, data: result, loading } = useFetch(createRepayment);

  useEffect(() => {
    if (!result) return;
    if (result.success) {
      toast.success("Repayment recorded");
      onRepaid?.(result.data);
      reset({ amount: "", paidOn: new Date(), note: "" });
      setOpen(false);
    } else {
      toast.error(result.error || "Failed to record repayment");
    }
  }, [result]);

  const paidOn = watch("paidOn");

  const onSubmit = (data) => {
    repayFn(loanId, {
      amount: data.amount,
      paidOn: data.paidOn,
      note: data.note,
    });
  };

  return (
    <Drawer open={open} onOpenChange={setOpen}>
      <DrawerTrigger asChild>{children}</DrawerTrigger>
      <DrawerContent>
        <DrawerHeader>
          <DrawerTitle>Record a repayment</DrawerTitle>
        </DrawerHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 px-4 pb-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium">Amount (₹)</label>
              <button
                type="button"
                className="text-xs text-primary hover:underline"
                onClick={() =>
                  setValue("amount", remaining.toFixed(2), {
                    shouldValidate: true,
                  })
                }
              >
                Pay full {formatMoney(remaining)}
              </button>
            </div>
            <Input
              type="number"
              step="0.01"
              placeholder="0.00"
              autoFocus
              {...register("amount")}
            />
            {errors.amount && (
              <p className="text-sm text-red-500">{errors.amount.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Date</label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  type="button"
                  variant="outline"
                  className={cn(
                    "w-full pl-3 text-left font-normal",
                    !paidOn && "text-muted-foreground"
                  )}
                >
                  {paidOn ? format(paidOn, "PPP") : <span>Pick a date</span>}
                  <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={paidOn}
                  onSelect={(date) => setValue("paidOn", date)}
                  disabled={(date) => date > new Date()}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">
              Note <span className="text-muted-foreground">(optional)</span>
            </label>
            <Input placeholder="e.g., via UPI" {...register("note")} />
          </div>

          <div className="flex gap-4 pt-2">
            <DrawerClose asChild>
              <Button type="button" variant="outline" className="flex-1">
                Cancel
              </Button>
            </DrawerClose>
            <Button type="submit" className="flex-1" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                "Record"
              )}
            </Button>
          </div>
        </form>
      </DrawerContent>
    </Drawer>
  );
}
