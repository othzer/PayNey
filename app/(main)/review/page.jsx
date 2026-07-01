import { getPendingTransactions } from "@/actions/review";
import { getCaptureSyncStatus } from "@/actions/capture";
import { ReviewClient } from "./_components/review-client";

export default async function ReviewPage() {
  const [pendingTransactions, { lastCaptureSyncAt }] = await Promise.all([
    getPendingTransactions(),
    getCaptureSyncStatus(),
  ]);

  return (
    <ReviewClient
      initialTransactions={pendingTransactions}
      hasEverConnected={Boolean(lastCaptureSyncAt)}
    />
  );
}
