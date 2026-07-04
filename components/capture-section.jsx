import { Download, ShieldCheck, Smartphone } from "lucide-react";
import Link from "next/link";
import { CAPTURE_APK_URL } from "@/lib/capture-config";
import { Button } from "@/components/ui/button";
import ScrollReveal from "@/components/scroll-reveal";

const STEPS = [
  "Download the PayNey Capture app on your phone using the button below",
  "On your computer, sign in to PayNey and open Settings → Connect to generate a pairing code",
  "Enter that code in the app on your phone to link it",
  "Grant SMS and Notification access when prompted, and you're done",
];

const CaptureSection = () => {
  return (
    <section id="connect" className="border-t border-border py-20">
      <div className="container mx-auto px-4">
        <ScrollReveal>
          <h2 className="mb-4 text-center text-3xl font-bold">
            Automatic transaction capture
          </h2>
          <p className="mx-auto mb-12 max-w-2xl text-center text-muted-foreground">
            Install the Android companion app on your phone — no sign-in
            needed on your phone&apos;s browser. Pairing happens with a code
            you generate from your computer.
          </p>
        </ScrollReveal>

        <div className="mx-auto mt-8 max-w-[600px] space-y-3">
          {STEPS.map((step, i) => (
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

        <p className="mx-auto mt-4 mb-8 max-w-[600px] text-center text-xs text-muted-foreground">
          Already have an account?{" "}
          <Link href="/connect" className="text-primary hover:underline">
            Sign in and generate a pairing code
          </Link>
          .
        </p>

        <div className="mx-auto flex max-w-[600px] flex-col items-center gap-3 rounded-2xl border border-border bg-card p-6 text-center card-lifted">
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
            Direct APK download — not distributed via Play Store. You may
            need to allow installs from unknown sources.
          </p>
        </div>

        <div className="mx-auto mt-8 flex max-w-[600px] items-start gap-2 rounded-xl border border-border bg-secondary/50 p-4 text-xs text-muted-foreground">
          <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0" />
          <p>
            Only messages from a known allowlist of bank and payment-app
            senders are ever read or sent to PayNey&apos;s servers — nothing
            else on the device is accessed.
          </p>
        </div>
      </div>
    </section>
  );
};

export default CaptureSection;
