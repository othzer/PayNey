import { getPendingTransactions } from "@/actions/review";
import { getCaptureConnectionStatus } from "@/actions/capture";
import { ReviewClient } from "./_components/review-client";

export default async function ReviewPage() {
  const [pendingTransactions, { hasDevice, lastCaptureSyncAt }] = await Promise.all([
    getPendingTransactions(),
    getCaptureConnectionStatus(),
  ]);

  return (
    <ReviewClient
      initialTransactions={pendingTransactions}
      hasEverConnected={hasDevice || Boolean(lastCaptureSyncAt)}
    />
  );
}
