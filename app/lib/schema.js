import { z } from "zod";

export const accountSchema = z.object({
  name: z.string().min(1, "Name is required"),
  type: z.enum(["CURRENT", "SAVINGS"]),
  balance: z
    .string()
    .min(1, "Initial balance is required")
    .refine((v) => Number.isFinite(parseFloat(v)), "Enter a valid number"),
  isDefault: z.boolean().default(false),
});

export const transactionSchema = z
  .object({
    type: z.enum(["INCOME", "EXPENSE"]),
    amount: z
      .string()
      .min(1, "Amount is required")
      .refine(
        (v) => Number.isFinite(parseFloat(v)) && parseFloat(v) > 0,
        "Amount must be a positive number"
      ),
    description: z.string().optional(),
    date: z.date({ required_error: "Date is required" }),
    accountId: z.string().min(1, "Account is required"),
    category: z.string().min(1, "Category is required"),
    isRecurring: z.boolean().default(false),
    recurringInterval: z
      .enum(["DAILY", "WEEKLY", "MONTHLY", "YEARLY"])
      .optional(),
  })
  .superRefine((data, ctx) => {
    if (data.isRecurring && !data.recurringInterval) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Recurring interval is required for recurring transactions",
        path: ["recurringInterval"],
      });
    }
  });

const positiveAmount = z
  .string()
  .min(1, "Amount is required")
  .refine(
    (v) => Number.isFinite(parseFloat(v)) && parseFloat(v) > 0,
    "Amount must be a positive number"
  );

export const counterpartySchema = z.object({
  name: z.string().min(1, "Name is required"),
  // Optional, but if provided must normalize to a valid Indian mobile number —
  // the form validates via normalizePhone before submit (a bad number fails
  // silently in wa.me, so it's caught here rather than at click time).
  phone: z.string().optional(),
  notes: z.string().optional(),
});

export const loanSchema = z.object({
  counterpartyId: z.string().min(1, "Choose who this is with"),
  direction: z.enum(["LENT", "BORROWED"]),
  principalAmount: positiveAmount,
  note: z.string().optional(),
  dueOn: z.date().optional().nullable(),
});

export const repaymentSchema = z.object({
  amount: positiveAmount,
  paidOn: z.date({ required_error: "Date is required" }),
  note: z.string().optional(),
});
