"use server";

import { db } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { getMonthlyStats, generateFinancialInsights } from "@/lib/ai-insights";

// Powers the dashboard's AI Summary page. Reuses the same stats/prompt logic
// as the monthly emailed report (lib/ai-insights.js) so both surfaces agree.
export async function getAiSummary() {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const user = await db.user.findUnique({ where: { clerkUserId: userId } });
  if (!user) throw new Error("User not found");

  const now = new Date();
  const monthName = now.toLocaleString("default", { month: "long", year: "numeric" });

  const stats = await getMonthlyStats(user.id, now);
  const insights = await generateFinancialInsights(stats, monthName);

  return {
    month: monthName,
    stats: {
      totalIncome: stats.totalIncome,
      totalExpenses: stats.totalExpenses,
      netIncome: stats.totalIncome - stats.totalExpenses,
      transactionCount: stats.transactionCount,
      byCategory: stats.byCategory,
    },
    insights,
  };
}
