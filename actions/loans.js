"use server";

import { auth } from "@clerk/nextjs/server";
import { Prisma } from "@prisma/client";
import { db } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import {
  computeLoanStatus,
  generatePublicToken,
  remainingDecimal,
  serializeLoan,
  serializeRepayment,
} from "@/lib/loans";
import { getOrCreateUser } from "@/lib/checkUser";
import { istStartOfToday } from "@/lib/loan-display";

async function getCurrentUser() {
  const user = await getOrCreateUser();
  if (!user) throw new Error("Unauthorized");
  return user;
}

// --- Reads (throw on failure, matching existing getters) -------------------

export async function getLoans() {
  const user = await getCurrentUser();
  const loans = await db.loan.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
    include: { counterparty: true },
  });
  return loans.map(serializeLoan);
}

export async function getLoan(id) {
  const user = await getCurrentUser();
  const loan = await db.loan.findFirst({
    where: { id, userId: user.id },
    include: {
      counterparty: true,
      repayments: { orderBy: { paidOn: "desc" } },
    },
  });
  if (!loan) return null;
  return serializeLoan(loan);
}

// Dashboard tiles: total lent, total owed, net position, overdue count.
export async function getLoanDashboardTiles() {
  const user = await getCurrentUser();

  const grouped = await db.loan.groupBy({
    by: ["direction"],
    where: { userId: user.id },
    _sum: { principalAmount: true, repaidAmount: true },
  });

  // Outstanding = principal - repaid, per direction.
  let lentOutstanding = new Prisma.Decimal(0);
  let borrowedOutstanding = new Prisma.Decimal(0);
  for (const row of grouped) {
    const outstanding = remainingDecimal(
      row._sum.principalAmount || 0,
      row._sum.repaidAmount || 0
    );
    if (row.direction === "LENT") lentOutstanding = outstanding;
    else borrowedOutstanding = outstanding;
  }

  const overdueCount = await db.loan.count({
    where: {
      userId: user.id,
      status: { not: "SETTLED" },
      // Overdue = due date strictly before today (IST); "due today" isn't
      // overdue. Same rule as isOverdue() so tiles and badges agree.
      dueOn: { lt: istStartOfToday() },
    },
  });

  return {
    totalLent: lentOutstanding.toNumber(),
    totalOwed: borrowedOutstanding.toNumber(),
    netPosition: lentOutstanding.minus(borrowedOutstanding).toNumber(),
    overdueCount,
  };
}

export async function getOverdueLoanCount() {
  const { userId } = await auth();
  if (!userId) return 0;
  const user = await db.user.findUnique({ where: { clerkUserId: userId } });
  if (!user) return 0;

  return db.loan.count({
    where: {
      userId: user.id,
      status: { not: "SETTLED" },
      // Match isOverdue(): strictly before start of today (IST).
      dueOn: { lt: istStartOfToday() },
    },
  });
}

export async function getCounterpartyDetail(counterpartyId) {
  const user = await getCurrentUser();

  const counterparty = await db.counterparty.findFirst({
    where: { id: counterpartyId, userId: user.id },
    include: {
      loans: {
        orderBy: { createdAt: "desc" },
        include: { counterparty: true },
      },
    },
  });
  if (!counterparty) return null;

  // Net position with this person: what they still owe me (LENT) minus what I
  // still owe them (BORROWED).
  let net = new Prisma.Decimal(0);
  for (const loan of counterparty.loans) {
    const outstanding = remainingDecimal(loan.principalAmount, loan.repaidAmount);
    net = loan.direction === "LENT" ? net.plus(outstanding) : net.minus(outstanding);
  }

  return {
    id: counterparty.id,
    name: counterparty.name,
    phone: counterparty.phone,
    notes: counterparty.notes,
    netPosition: net.toNumber(),
    loans: counterparty.loans.map(serializeLoan),
  };
}

// Public, unauthenticated. Returns a redacted shape or null (page calls
// notFound()). Exposes only what the counterparty should see — amounts, dates,
// status, repayment history, owner name, their own name. No userId, no
// publicToken, no phone, no other loans, and NO notes: loan/repayment notes are
// free-text the owner may have written as private memos, so they never leave
// the authed views (this matches the "no notes" guarantee in DECISIONS.md).
export async function getPublicLoan(publicToken) {
  if (!publicToken || typeof publicToken !== "string") return null;

  const loan = await db.loan.findUnique({
    where: { publicToken },
    include: {
      counterparty: { select: { name: true } },
      user: { select: { name: true } },
      repayments: { orderBy: { paidOn: "desc" } },
    },
  });
  if (!loan) return null;

  return {
    direction: loan.direction,
    principalAmount: loan.principalAmount.toNumber(),
    repaidAmount: loan.repaidAmount.toNumber(),
    status: loan.status,
    dueOn: loan.dueOn,
    createdAt: loan.createdAt,
    ownerName: loan.user?.name || "A PayNey user",
    counterpartyName: loan.counterparty?.name || "you",
    repayments: loan.repayments.map((r) => ({
      id: r.id,
      amount: r.amount.toNumber(),
      paidOn: r.paidOn,
    })),
  };
}

// --- Mutations ({ success, error }) ----------------------------------------

function parseAmountToDecimal(value) {
  const num = parseFloat(value);
  if (!Number.isFinite(num) || num <= 0) {
    throw new Error("Amount must be a positive number");
  }
  return new Prisma.Decimal(num);
}

export async function createLoan(data) {
  try {
    const user = await getCurrentUser();

    if (data.direction !== "LENT" && data.direction !== "BORROWED") {
      throw new Error("Choose whether you lent or borrowed");
    }

    // Ownership check on the counterparty — URL/form params are hostile.
    const counterparty = await db.counterparty.findFirst({
      where: { id: data.counterpartyId, userId: user.id },
    });
    if (!counterparty) throw new Error("Counterparty not found");

    const principalAmount = parseAmountToDecimal(data.principalAmount);

    const loan = await db.loan.create({
      data: {
        userId: user.id,
        counterpartyId: counterparty.id,
        direction: data.direction,
        principalAmount,
        note: data.note?.trim() || null,
        dueOn: data.dueOn ? new Date(data.dueOn) : null,
        publicToken: generatePublicToken(),
        status: "OPEN",
      },
    });

    revalidatePath("/loans");
    revalidatePath(`/loans/counterparty/${counterparty.id}`);
    return { success: true, data: serializeLoan(loan) };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

export async function updateLoan(id, data) {
  try {
    const user = await getCurrentUser();

    const existing = await db.loan.findFirst({
      where: { id, userId: user.id },
    });
    if (!existing) throw new Error("Loan not found");

    const updateData = {};

    if (data.principalAmount !== undefined) {
      // Principal is locked once any repayment exists — changing it would make
      // the recorded repayments meaningless against a different total.
      if (!existing.repaidAmount.equals(0)) {
        throw new Error(
          "Can't change the amount after repayments have been recorded"
        );
      }
      updateData.principalAmount = parseAmountToDecimal(data.principalAmount);
    }

    if (data.direction !== undefined) {
      if (data.direction !== "LENT" && data.direction !== "BORROWED") {
        throw new Error("Invalid direction");
      }
      updateData.direction = data.direction;
    }

    if (data.counterpartyId !== undefined) {
      const counterparty = await db.counterparty.findFirst({
        where: { id: data.counterpartyId, userId: user.id },
      });
      if (!counterparty) throw new Error("Counterparty not found");
      updateData.counterpartyId = counterparty.id;
    }

    if (data.note !== undefined) updateData.note = data.note?.trim() || null;
    if (data.dueOn !== undefined) {
      updateData.dueOn = data.dueOn ? new Date(data.dueOn) : null;
    }

    const loan = await db.loan.update({
      where: { id, userId: user.id },
      data: updateData,
    });

    revalidatePath("/loans");
    revalidatePath(`/loans/${id}`);
    revalidatePath(`/loans/counterparty/${loan.counterpartyId}`);
    return { success: true, data: serializeLoan(loan) };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

export async function deleteLoan(id) {
  try {
    const user = await getCurrentUser();

    const existing = await db.loan.findFirst({
      where: { id, userId: user.id },
    });
    if (!existing) throw new Error("Loan not found");

    // Repayments and reminder logs cascade (onDelete: Cascade in schema).
    await db.loan.delete({ where: { id, userId: user.id } });

    revalidatePath("/loans");
    revalidatePath(`/loans/counterparty/${existing.counterpartyId}`);
    return { success: true, counterpartyId: existing.counterpartyId };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

export async function createRepayment(loanId, data) {
  try {
    const user = await getCurrentUser();

    const amount = parseAmountToDecimal(data.amount);
    const paidOn = data.paidOn ? new Date(data.paidOn) : new Date();
    const note = data.note?.trim() || null;

    const result = await db.$transaction(async (tx) => {
      // Lock the loan row for the life of the transaction so concurrent
      // repayments serialize. Without it, two racing writes (e.g. a double
      // submit) both read the same repaidAmount, both pass the overpayment
      // guard against the same stale balance, and both insert — overpaying the
      // loan. Prisma has no FOR UPDATE in the query builder, hence raw SQL;
      // the second transaction blocks here until the first commits, then reads
      // the updated balance and is correctly rejected.
      const locked = await tx.$queryRaw`
        SELECT id FROM loans WHERE id = ${loanId} AND "userId" = ${user.id} FOR UPDATE
      `;
      if (!locked || locked.length === 0) throw new Error("Loan not found");

      const loan = await tx.loan.findFirst({
        where: { id: loanId, userId: user.id },
      });
      if (!loan) throw new Error("Loan not found");

      // Overpayment guard in Decimal space, against the *current* repaid total.
      const remaining = remainingDecimal(loan.principalAmount, loan.repaidAmount);
      if (amount.greaterThan(remaining)) {
        throw new Error(
          `That's more than the ₹${remaining.toFixed(2)} still remaining`
        );
      }

      await tx.repayment.create({
        data: {
          loanId: loan.id,
          userId: user.id,
          amount,
          paidOn,
          note,
        },
      });

      // Recompute from source rows rather than incrementing the cache — this
      // self-heals against any drift in the denormalized repaidAmount.
      const agg = await tx.repayment.aggregate({
        where: { loanId: loan.id },
        _sum: { amount: true },
      });
      const newRepaid = agg._sum.amount || new Prisma.Decimal(0);
      const newStatus = computeLoanStatus(loan.principalAmount, newRepaid);

      const updated = await tx.loan.update({
        where: { id: loan.id },
        data: { repaidAmount: newRepaid, status: newStatus },
        include: {
          counterparty: true,
          repayments: { orderBy: { paidOn: "desc" } },
        },
      });
      return updated;
    });

    revalidatePath("/loans");
    revalidatePath(`/loans/${loanId}`);
    revalidatePath(`/loans/counterparty/${result.counterpartyId}`);
    return { success: true, data: serializeLoan(result) };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

// Records a manual WhatsApp nudge. Fire-and-forget from the client — never
// blocks the wa.me navigation.
export async function logNudge(loanId) {
  try {
    const user = await getCurrentUser();

    const loan = await db.loan.findFirst({
      where: { id: loanId, userId: user.id },
    });
    if (!loan) throw new Error("Loan not found");

    const now = new Date();
    await db.$transaction([
      db.reminderLog.create({
        data: {
          loanId: loan.id,
          userId: user.id,
          // Fresh key per click so a repeat nudge is never blocked; the @unique
          // is a seam for a future automated cron's deterministic per-day key.
          dedupeKey: `manual:${loan.id}:${now.getTime()}`,
          channel: "whatsapp_manual",
          sentAt: now,
        },
      }),
      db.loan.update({
        where: { id: loan.id },
        data: { lastNudgedAt: now },
      }),
    ]);

    revalidatePath(`/loans/${loanId}`);
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
}
