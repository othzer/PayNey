import { db } from "@/lib/prisma";
import { defaultCategories } from "@/data/categories";
import { getGeminiModel, cleanJsonResponse } from "@/lib/gemini";

const KEYWORD_RULES = [
  { pattern: /swiggy|zomato|dominos|pizza|restaurant|cafe|eatery/i, category: "food" },
  { pattern: /uber|ola|rapido|\btaxi\b|\bcab\b/i, category: "transportation" },
  { pattern: /amazon|flipkart|myntra|ajio/i, category: "shopping" },
  { pattern: /netflix|spotify|hotstar|prime video/i, category: "entertainment" },
  {
    pattern: /electricity|bescom|water board|gas board|broadband|airtel|jio|vi\b/i,
    category: "utilities",
  },
  { pattern: /pharmacy|hospital|clinic|apollo|medplus/i, category: "healthcare" },
  {
    pattern: /irctc|makemytrip|goibibo|indigo|spicejet|\bairlines\b/i,
    category: "travel",
  },
];

function normalizeMerchant(merchant) {
  return merchant
    .toLowerCase()
    .trim()
    .replace(/\b(pvt|ltd|private|limited|inc)\b\.?/g, "")
    .replace(/[^a-z0-9@.\s]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function keywordMatch(normalizedMerchant) {
  const rule = KEYWORD_RULES.find((r) => r.pattern.test(normalizedMerchant));
  return rule?.category || null;
}

async function llmCategorize({ merchant, amount, categories }) {
  const model = getGeminiModel();
  const categoryList = categories.map((c) => `${c.id} (${c.name})`).join(", ");
  const prompt = `Classify this expense into exactly one category id from this list: ${categoryList}.
Merchant: "${merchant}". Amount: ${amount}.
Respond with ONLY strict JSON: {"category": "<category id from the list>"}`;

  try {
    const result = await model.generateContent(prompt);
    const data = JSON.parse(cleanJsonResponse(result.response.text()));
    const match = categories.find((c) => c.id === data.category);
    return match ? match.id : null;
  } catch {
    return null;
  }
}

// Returns { suggestedCategory, suggestedName, confidence }. Confidence order:
// MerchantCategoryMap hit -> "high", keyword ruleset hit -> "medium",
// LLM guess or no match -> "low" (always requires manual review in the Review UI).
export async function categorizeTransaction({ userId, merchant, amount, direction }) {
  const name = merchant || null;

  if (direction === "credit") {
    const incomeCategory = defaultCategories.find((c) => c.id === "other-income");
    return {
      suggestedCategory: incomeCategory?.id || null,
      suggestedName: name,
      confidence: incomeCategory ? "medium" : "low",
    };
  }

  if (!merchant) {
    return { suggestedCategory: null, suggestedName: null, confidence: "low" };
  }

  const normalized = normalizeMerchant(merchant);

  const mapping = await db.merchantCategoryMap.findUnique({
    where: { userId_merchantPattern: { userId, merchantPattern: normalized } },
  });
  if (mapping) {
    return { suggestedCategory: mapping.category, suggestedName: name, confidence: "high" };
  }

  const keywordCategory = keywordMatch(normalized);
  if (keywordCategory) {
    return { suggestedCategory: keywordCategory, suggestedName: name, confidence: "medium" };
  }

  const expenseCategories = defaultCategories.filter((c) => c.type === "EXPENSE");
  const llmCategory = await llmCategorize({ merchant, amount, categories: expenseCategories });

  return {
    suggestedCategory: llmCategory,
    suggestedName: name,
    confidence: "low",
  };
}
