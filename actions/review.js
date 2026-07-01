"use server";

import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

async function getCurrentUser() {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");
  const user = await db.user.findUnique({ where: { clerkUserId: userId } });
  if (!user) throw new Error("User not found");
  return user;
}

// Confirming needs somewhere to attach the real Transaction; the Review UI has no
// per-row account picker, so this uses the user's default account (or their first,
// if none is marked default).
async function getDefaultAccountId(userId) {
  const account = await db.account.findFirst({
    where: { userId },
    orderBy: [{ isDefault: "desc" }, { createdAt: "asc" }],
  });
  if (!account) {
    throw new Error("Create an account before confirming transactions");
  }
  return account.id;
}

function normalizeMerchantPattern(merchant) {
  return merchant
    .toLowerCase()
    .trim()
    .replace(/\b(pvt|ltd|private|limited|inc)\b\.?/g, "")
    .replace(/[^a-z0-9@.\s]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

export async function getPendingTransactions() {
  const user = await getCurrentUser();
  return db.pendingTransaction.findMany({
    where: { userId: user.id, status: "pending" },
    orderBy: { createdAt: "desc" },
  });
}

export async function confirmPendingTransaction(id, overrides = {}) {
  try {
    const user = await getCurrentUser();

    const pending = await db.pendingTransaction.findUnique({
      where: { id },
    });
    if (!pending || pending.userId !== user.id) {
      throw new Error("Pending transaction not found");
    }

    const accountId = await getDefaultAccountId(user.id);
    const type = pending.parsedDirection === "credit" ? "INCOME" : "EXPENSE";
    const category = overrides.category || pending.suggestedCategory || "other-expense";
    const description =
      overrides.name || pending.suggestedName || pending.parsedMerchant || undefined;
    const amount = pending.parsedAmount;
    const date = pending.parsedDate;
    const balanceChange = type === "EXPENSE" ? -amount : amount;

    const transaction = await db.$transaction(async (tx) => {
      const created = await tx.transaction.create({
        data: {
          type,
          amount,
          description,
          date,
          category,
          userId: user.id,
          accountId,
        },
      });

      await tx.account.update({
        where: { id: accountId },
        data: { balance: { increment: balanceChange } },
      });

      await tx.pendingTransaction.update({
        where: { id },
        data: { status: "confirmed" },
      });

      return created;
    });

    // Learning loop: only record a correction if the user actually changed the
    // suggested category — accepting the suggestion as-is teaches nothing new.
    if (pending.parsedMerchant && category !== pending.suggestedCategory) {
      const merchantPattern = normalizeMerchantPattern(pending.parsedMerchant);
      await db.merchantCategoryMap.upsert({
        where: { userId_merchantPattern: { userId: user.id, merchantPattern } },
        update: { category },
        create: { userId: user.id, merchantPattern, category },
      });
    }

    revalidatePath("/review");
    revalidatePath("/dashboard");
    revalidatePath("/accounts");
    revalidatePath("/transactions");

    return { success: true, data: transaction };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

export async function discardPendingTransaction(id) {
  try {
    const user = await getCurrentUser();

    const pending = await db.pendingTransaction.findUnique({ where: { id } });
    if (!pending || pending.userId !== user.id) {
      throw new Error("Pending transaction not found");
    }

    await db.pendingTransaction.update({
      where: { id },
      data: { status: "discarded" },
    });

    revalidatePath("/review");
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

export async function bulkConfirmSuggested() {
  try {
    const user = await getCurrentUser();

    const rows = await db.pendingTransaction.findMany({
      where: {
        userId: user.id,
        status: "pending",
        confidence: { in: ["medium", "high"] },
        suggestedCategory: { not: null },
      },
    });

    if (rows.length === 0) {
      return { success: true, confirmedCount: 0 };
    }

    const accountId = await getDefaultAccountId(user.id);

    await db.$transaction(async (tx) => {
      let balanceDelta = 0;
      for (const row of rows) {
        const type = row.parsedDirection === "credit" ? "INCOME" : "EXPENSE";
        await tx.transaction.create({
          data: {
            type,
            amount: row.parsedAmount,
            description: row.suggestedName || row.parsedMerchant || undefined,
            date: row.parsedDate,
            category: row.suggestedCategory,
            userId: user.id,
            accountId,
          },
        });
        balanceDelta += type === "EXPENSE" ? -row.parsedAmount : row.parsedAmount;
      }

      await tx.account.update({
        where: { id: accountId },
        data: { balance: { increment: balanceDelta } },
      });

      await tx.pendingTransaction.updateMany({
        where: { id: { in: rows.map((r) => r.id) } },
        data: { status: "confirmed" },
      });
    });

    revalidatePath("/review");
    revalidatePath("/dashboard");
    revalidatePath("/accounts");
    revalidatePath("/transactions");

    return { success: true, confirmedCount: rows.length };
  } catch (error) {
    return { success: false, error: error.message };
  }
}
