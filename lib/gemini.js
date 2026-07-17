import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// gemini-3.5-flash (the newest flash model) has been returning 503 "high demand"
// under load; gemini-2.5-flash is mature and reliably available. Override via
// GEMINI_MODEL env var to move back to a newer model once it stabilizes.
export function getGeminiModel() {
  return genAI.getGenerativeModel({
    model: process.env.GEMINI_MODEL || "gemini-2.5-flash",
  });
}

export function cleanJsonResponse(text) {
  return text.replace(/```(?:json)?\n?/g, "").trim();
}
