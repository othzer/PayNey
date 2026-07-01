import { formatDistanceToNow } from "date-fns";
import { Download, ShieldCheck, Smartphone } from "lucide-react";
import { getCaptureConnectionStatus } from "@/actions/capture";
import { CAPTURE_APK_URL } from "@/lib/capture-config";
import { Button } from "@/components/ui/button";
import { PairingCodeCard } from "./_components/pairing-code-card";

const SETUP_STEPS = [
  "Download and install the APK above",
  "Generate a pairing code below and enter it in the app",
  "Grant SMS and Notification access when prompted (Android will ask twice — once for SMS, once for notification listener access in Settings)",
  "Done — transactions will start appearing in your Review queue automatically",
];

export default async function ConnectPage() {
  const { hasDevice, lastCaptureSyncAt } = await getCaptureConnectionStatus();

  let statusLabel;
  let connected;
  if (hasDevice && lastCaptureSyncAt) {
    statusLabel = `Connected · last synced ${formatDistanceToNow(new Date(lastCaptureSyncAt), { addSuffix: true })}`;
    connected = true;
  } else if (hasDevice) {
    statusLabel = "Connected · not synced yet";
    connected = true;
  } else {
    statusLabel = "Not connected yet";
    connected = false;
  }

  return (
    <div className="mx-auto max-w-[600px] space-y-8">
      <div className="space-y-4">
        {connected ? (
          <span className="inline-flex items-center gap-1.5 rounded-full border border-green-500/30 bg-green-500/10 px-3 py-1 text-xs font-medium text-green-400">
            <span className="h-1.5 w-1.5 rounded-full bg-green-400" />
            {statusLabel}
          </span>
        ) : (
          <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-secondary px-3 py-1 text-xs font-medium text-muted-foreground">
            <span className="h-1.5 w-1.5 rounded-full bg-muted-foreground" />
            {statusLabel}
          </span>
        )}

        <h1 className="font-display text-2xl font-bold tracking-tight">
          Set up automatic capture
        </h1>
        <p className="text-sm text-muted-foreground [line-height:1.6]">
          PayNey&apos;s Android companion app reads your bank SMS and UPI app
          notifications, extracts transaction details, and brings them to your
          Review queue for a quick confirm. Nothing else on your phone is read
          — only messages from recognized bank and payment senders.
        </p>
      </div>

      <div className="flex flex-col items-center gap-3 rounded-2xl border border-border bg-card p-6 text-center card-lifted">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/15">
          <Smartphone className="h-6 w-6 text-primary" />
        </div>
        <div>
          <p className="font-medium text-foreground">PayNey Capture</p>
          <p className="text-xs text-muted-foreground">for Android</p>
        </div>
        <Button asChild className="mt-2 gap-2 brand-glow">
          <a href={CAPTURE_APK_URL}>
            <Download className="h-4 w-4" />
            Download APK
          </a>
        </Button>
        <p className="text-xs text-muted-foreground">
          Direct APK download — not distributed via Play Store. You may need to
          allow installs from unknown sources.
        </p>
      </div>

      <PairingCodeCard />

      <div className="space-y-3">
        {SETUP_STEPS.map((step, i) => (
          <div
            key={i}
            className="flex items-start gap-3 rounded-2xl border border-border bg-card p-4 card-lifted"
          >
            <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/15 text-xs font-semibold text-primary">
              {i + 1}
            </span>
            <p className="text-sm text-foreground">{step}</p>
          </div>
        ))}
      </div>

      <div className="flex items-start gap-2 rounded-xl border border-border bg-secondary/50 p-4 text-xs text-muted-foreground">
        <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0" />
        <p>
          Only messages from a known allowlist of bank and payment-app senders
          are ever read or sent to PayNey&apos;s servers — nothing else on the
          device is accessed.
        </p>
      </div>
    </div>
  );
}
