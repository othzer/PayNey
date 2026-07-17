"use server";

import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { normalizePhone } from "@/lib/phone";

async function getCurrentUser() {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");
  const user = await db.user.findUnique({ where: { clerkUserId: userId } });
  if (!user) throw new Error("User not found");
  return user;
}

// Getter throws on failure, matching getUserAccounts / getTransaction.
export async function getCounterparties() {
  const user = await getCurrentUser();
  return db.counterparty.findMany({
    where: { userId: user.id },
    orderBy: { name: "asc" },
  });
}

function resolvePhone(rawPhone) {
  if (!rawPhone || !rawPhone.trim()) return { phone: null };
  const result = normalizePhone(rawPhone);
  if (!result.ok) {
    return { error: "Enter a valid Indian mobile number, or leave it blank" };
  }
  return { phone: result.e164 };
}

export async function createCounterparty(data) {
  try {
    const user = await getCurrentUser();

    const name = data.name?.trim();
    if (!name) throw new Error("Name is required");

    const { phone, error } = resolvePhone(data.phone);
    if (error) throw new Error(error);

    const counterparty = await db.counterparty.create({
      data: {
        userId: user.id,
        name,
        phone,
        notes: data.notes?.trim() || null,
      },
    });

    revalidatePath("/loans");
    return { success: true, data: counterparty };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

export async function updateCounterparty(id, data) {
  try {
    const user = await getCurrentUser();

    const existing = await db.counterparty.findFirst({
      where: { id, userId: user.id },
    });
    if (!existing) throw new Error("Counterparty not found");

    const updateData = {};
    if (data.name !== undefined) {
      const name = data.name.trim();
      if (!name) throw new Error("Name is required");
      updateData.name = name;
    }
    if (data.phone !== undefined) {
      const { phone, error } = resolvePhone(data.phone);
      if (error) throw new Error(error);
      updateData.phone = phone;
    }
    if (data.notes !== undefined) {
      updateData.notes = data.notes?.trim() || null;
    }

    const counterparty = await db.counterparty.update({
      where: { id, userId: user.id },
      data: updateData,
    });

    revalidatePath("/loans");
    revalidatePath(`/loans/counterparty/${id}`);
    return { success: true, data: counterparty };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

export async function deleteCounterparty(id) {
  try {
    const user = await getCurrentUser();

    const existing = await db.counterparty.findFirst({
      where: { id, userId: user.id },
    });
    if (!existing) throw new Error("Counterparty not found");

    // Block rather than cascade — deleting someone still tied to a loan would
    // silently erase a debt record. Pre-check instead of relying on the DB's
    // RESTRICT FK so we can return a friendly message.
    const loanCount = await db.loan.count({
      where: { counterpartyId: id, userId: user.id },
    });
    if (loanCount > 0) {
      throw new Error(
        `${existing.name} still has ${loanCount} loan(s). Delete or settle those first.`
      );
    }

    await db.counterparty.delete({ where: { id, userId: user.id } });

    revalidatePath("/loans");
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
}
