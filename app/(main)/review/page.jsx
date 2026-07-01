import { getPendingTransactions } from "@/actions/review";
import { ReviewClient } from "./_components/review-client";

export default async function ReviewPage() {
  const pendingTransactions = await getPendingTransactions();

  return <ReviewClient initialTransactions={pendingTransactions} />;
}
