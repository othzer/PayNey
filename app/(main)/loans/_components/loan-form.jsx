"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { CalendarIcon, Loader2, Plus } from "lucide-react";
import { format } from "date-fns";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import useFetch from "@/hooks/use-fetch";
import { loanSchema } from "@/app/lib/schema";
import { createLoan, updateLoan } from "@/actions/loans";
import { CreateCounterpartyDrawer } from "./create-counterparty-drawer";

export function LoanForm({
  counterparties: initialCounterparties,
  editMode = false,
  initialData = null,
}) {
  const router = useRouter();
  const [counterparties, setCounterparties] = useState(initialCounterparties);

  const {
    handleSubmit,
    register,
    formState: { errors },
    watch,
    setValue,
  } = useForm({
    resolver: zodResolver(loanSchema),
    defaultValues:
      editMode && initialData
        ? {
            counterpartyId: initialData.counterpartyId,
            direction: initialData.direction,
            principalAmount: initialData.principalAmount.toString(),
            note: initialData.note || "",
            dueOn: initialData.dueOn ? new Date(initialData.dueOn) : null,
          }
        : {
            counterpartyId: "",
            direction: "LENT",
            principalAmount: "",
            note: "",
            dueOn: null,
          },
  });

  const { fn: submitFn, data: result, loading } = useFetch(
    editMode ? updateLoan : createLoan
  );

  const principalLocked =
    editMode && initialData && Number(initialData.repaidAmount) > 0;

  useEffect(() => {
    if (!result) return;
    if (result.success) {
      toast.success(editMode ? "Loan updated" : "Loan added");
      router.push(editMode ? `/loans/${initialData.id}` : "/loans");
      router.refresh();
    } else {
      toast.error(result.error || "Something went wrong");
    }
  }, [result]);

  const onSubmit = (data) => {
    const payload = {
      counterpartyId: data.counterpartyId,
      direction: data.direction,
      note: data.note,
      dueOn: data.dueOn || null,
    };
    // Don't send principal on an edit where it's locked — the server rejects a
    // change, but omitting it avoids a spurious error if the value is untouched.
    if (!principalLocked) payload.principalAmount = data.principalAmount;

    if (editMode) {
      submitFn(initialData.id, payload);
    } else {
      submitFn(payload);
    }
  };

  const direction = watch("direction");
  const dueOn = watch("dueOn");
  const counterpartyId = watch("counterpartyId");

  const handleCounterpartyCreated = (created) => {
    setCounterparties((current) => [...current, created]);
    setValue("counterpartyId", created.id, { shouldValidate: true });
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Direction */}
      <div className="space-y-2">
        <label className="text-sm font-medium">Type</label>
        <Select
          onValueChange={(value) => setValue("direction", value)}
          defaultValue={direction}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="LENT">I lent money</SelectItem>
            <SelectItem value="BORROWED">I borrowed money</SelectItem>
          </SelectContent>
        </Select>
        {errors.direction && (
          <p className="text-sm text-red-500">{errors.direction.message}</p>
        )}
      </div>

      {/* Counterparty */}
      <div className="space-y-2">
        <label className="text-sm font-medium">
          {direction === "LENT" ? "Lent to" : "Borrowed from"}
        </label>
        <Select
          value={counterpartyId || undefined}
          onValueChange={(value) => setValue("counterpartyId", value, { shouldValidate: true })}
        >
          <SelectTrigger>
            <SelectValue placeholder="Choose a person" />
          </SelectTrigger>
          <SelectContent>
            {counterparties.map((cp) => (
              <SelectItem key={cp.id} value={cp.id}>
                {cp.name}
              </SelectItem>
            ))}
            <CreateCounterpartyDrawer onCreated={handleCounterpartyCreated}>
              <Button
                type="button"
                variant="ghost"
                className="relative flex w-full cursor-default select-none items-center gap-2 rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none hover:bg-accent hover:text-accent-foreground"
              >
                <Plus className="h-3.5 w-3.5" />
                Add a person
              </Button>
            </CreateCounterpartyDrawer>
          </SelectContent>
        </Select>
        {errors.counterpartyId && (
          <p className="text-sm text-red-500">{errors.counterpartyId.message}</p>
        )}
      </div>

      {/* Amount */}
      <div className="space-y-2">
        <label className="text-sm font-medium">Amount (₹)</label>
        <Input
          type="number"
          step="0.01"
          placeholder="0.00"
          disabled={principalLocked}
          {...register("principalAmount")}
        />
        {principalLocked && (
          <p className="text-xs text-muted-foreground">
            The amount can&apos;t be changed once repayments are recorded.
          </p>
        )}
        {errors.principalAmount && (
          <p className="text-sm text-red-500">
            {errors.principalAmount.message}
          </p>
        )}
      </div>

      {/* Due date */}
      <div className="space-y-2">
        <label className="text-sm font-medium">
          Due date <span className="text-muted-foreground">(optional)</span>
        </label>
        <div className="flex gap-2">
          <Popover>
            <PopoverTrigger asChild>
              <Button
                type="button"
                variant="outline"
                className={cn(
                  "w-full pl-3 text-left font-normal",
                  !dueOn && "text-muted-foreground"
                )}
              >
                {dueOn ? format(dueOn, "PPP") : <span>No due date</span>}
                <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={dueOn || undefined}
                onSelect={(date) => setValue("dueOn", date || null)}
                initialFocus
              />
            </PopoverContent>
          </Popover>
          {dueOn && (
            <Button
              type="button"
              variant="ghost"
              onClick={() => setValue("dueOn", null)}
            >
              Clear
            </Button>
          )}
        </div>
      </div>

      {/* Note */}
      <div className="space-y-2">
        <label className="text-sm font-medium">
          Note <span className="text-muted-foreground">(optional)</span>
        </label>
        <Input placeholder="What was this for?" {...register("note")} />
      </div>

      {/* Actions */}
      <div className="flex gap-4">
        <Button
          type="button"
          variant="outline"
          className="w-full"
          onClick={() => router.back()}
        >
          Cancel
        </Button>
        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              {editMode ? "Saving..." : "Adding..."}
            </>
          ) : editMode ? (
            "Save changes"
          ) : (
            "Add loan"
          )}
        </Button>
      </div>
    </form>
  );
}
