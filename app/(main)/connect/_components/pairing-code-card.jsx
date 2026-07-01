"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

function formatCountdown(msRemaining) {
  if (msRemaining <= 0) return "expired";
  const totalSeconds = Math.floor(msRemaining / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
}

export function PairingCodeCard() {
  const [code, setCode] = useState(null);
  const [expiresAt, setExpiresAt] = useState(null);
  const [now, setNow] = useState(Date.now());
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!expiresAt) return;
    const interval = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(interval);
  }, [expiresAt]);

  const handleGenerate = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/device/pair-code", { method: "POST" });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || "Failed to generate a pairing code");
        return;
      }
      setCode(data.code);
      setExpiresAt(data.expiresAt);
      setNow(Date.now());
    } catch {
      toast.error("Failed to generate a pairing code");
    } finally {
      setLoading(false);
    }
  };

  const msRemaining = expiresAt ? new Date(expiresAt).getTime() - now : 0;
  const expired = expiresAt && msRemaining <= 0;

  return (
    <div className="flex flex-col items-center gap-3 rounded-2xl border border-border bg-card p-6 text-center card-lifted">
      <p className="text-sm font-medium text-foreground">Pair your phone</p>
      <p className="text-xs text-muted-foreground">
        Generate a code and enter it in the PayNey Capture app to connect this
        account.
      </p>

      {code && !expired && (
        <div className="mt-1 space-y-1">
          <p className="money font-mono text-3xl tracking-[0.3em] text-primary">
            {code}
          </p>
          <p className="text-xs text-muted-foreground">
            Expires in {formatCountdown(msRemaining)}
          </p>
        </div>
      )}

      {code && expired && (
        <p className="mt-1 text-xs text-destructive">This code has expired.</p>
      )}

      <Button onClick={handleGenerate} disabled={loading} className="mt-1">
        {code ? "Generate new code" : "Generate code"}
      </Button>
    </div>
  );
}
