"use client";

import { formatDistanceToNow } from "date-fns";
import { MessageCircle } from "lucide-react";
import { buildNudgeMessage, buildWhatsAppUrl } from "@/lib/loan-display";
import { logNudge } from "@/actions/loans";

// Plain anchor with target="_blank" — never window.open (popup blockers kill it
// on Safari/mobile). The current tab doesn't unload (link opens a new tab), so
// the nudge log is a simple fire-and-forget server action call in the same
// onClick; no preventDefault, no gating dialog, no sendBeacon (which can't
// target a server action anyway).
export function NudgeButton({ loan, counterpartyName, ownerName, publicUrl, phone }) {
  if (!phone) {
    return (
      <p className="text-xs text-muted-foreground">
        Add a phone number for {counterpartyName} to send a WhatsApp nudge.
      </p>
    );
  }

  const message = buildNudgeMessage({
    loan,
    counterpartyName,
    ownerName,
    publicUrl,
  });
  const waUrl = buildWhatsAppUrl(phone, message);

  return (
    <div className="space-y-1">
      <a
        href={waUrl}
        target="_blank"
        rel="noopener noreferrer"
        onClick={() => {
          // Fire-and-forget; must not block or delay the navigation.
          logNudge(loan.id);
        }}
        className="inline-flex items-center gap-2 rounded-lg bg-[#25D366] px-3 py-2 text-sm font-medium text-black transition-opacity hover:opacity-90"
      >
        <MessageCircle className="h-4 w-4" />
        Nudge on WhatsApp
      </a>
      {loan.lastNudgedAt && (
        <p className="text-xs text-muted-foreground">
          Last nudged{" "}
          {formatDistanceToNow(new Date(loan.lastNudgedAt), { addSuffix: true })}
        </p>
      )}
    </div>
  );
}
