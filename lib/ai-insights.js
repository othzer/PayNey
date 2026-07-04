import { db } from "@/lib/prisma";
import { getGeminiModel, cleanJsonResponse } from "@/lib/gemini";
import { defaultCategories } from "@/data/categories";

const categoryNameById = defaultCategories.reduce((acc, c) => {
  acc[c.id] = c.name;
  return acc;
}, {});

export async function getMonthlyStats(userId, month) {
  const startDate = new Date(month.getFullYear(), month.getMonth(), 1);
  const endDate = new Date(month.getFullYear(), month.getMonth() + 1, 0);

  const transactions = await db.transaction.findMany({
    where: {
      userId,
      date: {
        gte: startDate,
        lte: endDate,
      },
    },
  });

  return transactions.reduce(
    (stats, t) => {
      const amount = t.amount.toNumber();
      if (t.type === "EXPENSE") {
        stats.totalExpenses += amount;
        stats.byCategory[t.category] =
          (stats.byCategory[t.category] || 0) + amount;
      } else {
        stats.totalIncome += amount;
      }
      return stats;
    },
    {
      totalExpenses: 0,
      totalIncome: 0,
      byCategory: {},
      transactionCount: transactions.length,
    }
  );
}

// Generates the AI-written financial insights shown on the dashboard's AI
// Summary page and emailed in the monthly report — kept as a single function
// so both surfaces stay in sync.
export async function generateFinancialInsights(stats, month) {
  if (stats.transactionCount === 0) {
    return [
      `No transactions were recorded for ${month} yet — insights will appear once you log some income or expenses.`,
    ];
  }

  const model = getGeminiModel();

  const categoryBreakdown = Object.entries(stats.byCategory)
    .sort((a, b) => b[1] - a[1])
    .map(
      ([category, amount]) =>
        `${categoryNameById[category] || category}: $${amount.toFixed(2)}`
    )
    .join(", ");

  const netIncome = stats.totalIncome - stats.totalExpenses;
  const savingsRate =
    stats.totalIncome > 0
      ? Math.round((netIncome / stats.totalIncome) * 100)
      : null;

  const prompt = `You are a personal finance assistant. Analyze the financial data below for ${month} and write exactly 3 concise, specific insights.

Requirements for each insight:
- Reference actual numbers or category names from the data, not generic advice.
- Cover a mix of: notable spending patterns, one risk or area of concern, and one practical, actionable suggestion.
- Keep each insight to a single sentence, friendly and conversational, no more than 30 words.
- Never invent data that isn't provided.

Financial Data for ${month}:
- Total Income: $${stats.totalIncome.toFixed(2)}
- Total Expenses: $${stats.totalExpenses.toFixed(2)}
- Net Income: $${netIncome.toFixed(2)}
- Savings Rate: ${savingsRate === null ? "N/A" : `${savingsRate}%`}
- Transaction Count: ${stats.transactionCount}
- Expense Breakdown by Category (highest first): ${categoryBreakdown || "none"}

Respond with ONLY a strict JSON array of 3 strings, like this:
["insight 1", "insight 2", "insight 3"]`;

  try {
    const result = await model.generateContent(prompt);
    const text = result.response.text();
    const parsed = JSON.parse(cleanJsonResponse(text));
    if (!Array.isArray(parsed) || parsed.length === 0) {
      throw new Error("Unexpected insights format");
    }
    return parsed;
  } catch (error) {
    console.error("Error generating insights:", error);
    return [
      "Your highest expense category this month might need attention.",
      "Consider setting up a budget for better financial management.",
      "Track your recurring expenses to identify potential savings.",
    ];
  }
}
