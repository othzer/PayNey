"use client";

import React from "react";
import Link from "next/link";
import { Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

const HeroSection = () => {
  return (
    <section className="relative overflow-hidden px-4 pb-24 pt-44">
      {/* Hex-grid background pattern */}
      <svg
        className="pointer-events-none absolute inset-0 h-full w-full opacity-[0.05]"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <pattern
            id="hero-hex-grid"
            width="56"
            height="100"
            patternUnits="userSpaceOnUse"
            patternTransform="scale(1)"
          >
            <path
              d="M28 0 L56 16 L56 50 L28 66 L0 50 L0 16 Z"
              fill="none"
              stroke="hsl(var(--muted-foreground))"
              strokeWidth="1"
            />
            <path
              d="M28 66 L56 82 L56 116 L28 132 L0 116 L0 82 Z"
              fill="none"
              stroke="hsl(var(--muted-foreground))"
              strokeWidth="1"
            />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#hero-hex-grid)" />
      </svg>

      {/* Metallic sheen */}
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-[600px]"
        style={{
          background:
            "radial-gradient(closest-side, hsl(var(--primary) / 0.2), transparent 70%)",
        }}
      />

      <div className="container relative mx-auto flex flex-col items-center gap-12 lg:flex-row lg:items-center lg:justify-center">
        <div className="flex flex-col items-center text-center lg:w-2/3">
          <div className="lifted mb-6 inline-flex items-center gap-2 rounded-full border border-border bg-card px-4 py-1.5 text-sm text-muted-foreground">
            <Sparkles className="h-4 w-4 text-primary" />
            AI-powered
          </div>

          <h1 className="pb-6 font-display text-[46px] font-bold leading-tight md:text-[56px]">
            PayNey
          </h1>

          <p className="mx-auto mb-8 max-w-[480px] text-muted-foreground [line-height:1.6]">
            PayNey turns receipts into structured records the moment you snap
            a photo, and automatically captures transactions straight from
            your phone so your ledger stays current without manual entry.
            Every month, it distills your activity into a clear AI summary of
            where your money went and where it can go further.
          </p>

          <Link href="/dashboard">
            <Button size="lg" className="brand-glow bg-primary px-8 text-primary-foreground hover:bg-primary/90">
              Get started
            </Button>
          </Link>
        </div>

        <div className="flex items-center justify-center lg:w-1/3">
          <div className="relative flex h-[120px] w-[120px] items-center justify-center">
            <div className="absolute inset-0 rounded-full border border-border" />
            <div className="absolute inset-[14px] rounded-full border border-border" />
            <div
              className="brand-glow absolute inset-[32px] flex items-center justify-center rounded-full bg-card"
              style={{ border: "1px solid #3D4ED1" }}
            >
              <Sparkles className="h-6 w-6 text-primary" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
