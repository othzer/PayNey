import { getAiSummary } from "@/actions/ai-summary";
import { SummaryClient } from "./_components/summary-client";

export default async function AiSummaryPage() {
  const summary = await getAiSummary();

  return <SummaryClient initialSummary={summary} />;
}
