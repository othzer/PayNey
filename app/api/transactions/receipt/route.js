import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { getGeminiModel, cleanJsonResponse } from "@/lib/gemini";
import { defaultCategories } from "@/data/categories";

// Stateless: extracts fields from a receipt image and returns them so a client
// (the future Android app, or a web upload) can pre-fill the Add Transaction form
// for the user to confirm. Does NOT create a PendingTransaction or touch Review.
export async function POST(req) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let formData;
  try {
    formData = await req.formData();
  } catch {
    return NextResponse.json(
      { error: "Expected multipart/form-data body" },
      { status: 400 }
    );
  }

  const file = formData.get("file");
  if (!file || typeof file === "string") {
    return NextResponse.json({ error: "file is required" }, { status: 400 });
  }

  const arrayBuffer = await file.arrayBuffer();
  const base64String = Buffer.from(arrayBuffer).toString("base64");

  const categoryList = defaultCategories
    .filter((c) => c.type === "EXPENSE")
    .map((c) => c.id)
    .join(", ");

  const prompt = `Analyze this receipt image and extract:
- amount (number)
- merchant (string)
- date (ISO date string)
- suggestedCategory (one of: ${categoryList})

Respond with ONLY strict JSON: {"amount": number, "merchant": string, "date": "ISO date string", "suggestedCategory": string}
If this isn't a receipt, return {}.`;

  try {
    const model = getGeminiModel();
    const result = await model.generateContent([
      { inlineData: { data: base64String, mimeType: file.type } },
      prompt,
    ]);
    const data = JSON.parse(cleanJsonResponse(result.response.text()));

    return NextResponse.json({
      amount: data.amount ? parseFloat(data.amount) : null,
      merchant: data.merchant || null,
      date: data.date || null,
      suggestedCategory: data.suggestedCategory || null,
    });
  } catch (error) {
    return NextResponse.json(
      { error: `Failed to extract receipt data: ${error.message}` },
      { status: 422 }
    );
  }
}
