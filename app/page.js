import React from "react";
import { CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { featuresData, howItWorksData } from "@/data/landing";
import HeroSection from "@/components/hero";
import Navbar from "@/components/navbar";
import CaptureSection from "@/components/capture-section";
import Footer from "@/components/footer";
import ScrollReveal from "@/components/scroll-reveal";
import Link from "next/link";

const FREE_PLAN_INCLUDES = [
  "Automatic SMS + UPI transaction capture",
  "AI receipt scanning",
  "Budgets, multi-account & multi-currency support",
  "Monthly AI spending summary",
  "Lending ledger with public share links",
];

const LandingPage = () => {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />

      {/* Hero Section */}
      <HeroSection />

      {/* Automatic Capture Section */}
      <CaptureSection />

      {/* Features Section */}
      <section id="features" className="py-20">
        <div className="container mx-auto px-4">
          <ScrollReveal>
            <h2 className="mb-12 text-center text-3xl font-bold">
              Everything you need to manage your finances
            </h2>
          </ScrollReveal>
          <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
            {featuresData.map((feature, index) => (
              <ScrollReveal key={index}>
                <Card className="h-full rounded-2xl border-border bg-card p-6 card-lifted">
                  <CardContent className="space-y-4 pt-4">
                    {feature.icon}
                    <h3 className="text-xl font-semibold">{feature.title}</h3>
                    <p className="text-muted-foreground">
                      {feature.description}
                    </p>
                    {feature.href && (
                      <Link
                        href={feature.href}
                        className="inline-block text-sm text-primary hover:underline"
                      >
                        {feature.linkLabel || "Learn more"} &rarr;
                      </Link>
                    )}
                  </CardContent>
                </Card>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="border-t border-border py-20">
        <div className="container mx-auto px-4">
          <ScrollReveal>
            <h2 className="mb-16 text-center text-3xl font-bold">
              How It Works
            </h2>
          </ScrollReveal>
          <div className="grid grid-cols-1 gap-x-8 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
            {howItWorksData.map((step, index) => (
              <ScrollReveal key={index} className="text-center">
                <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full border border-border bg-card">
                  {step.icon}
                </div>
                <h3 className="mb-4 text-xl font-semibold">{step.title}</h3>
                <p className="text-muted-foreground">{step.description}</p>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="border-t border-border py-20">
        <div className="container mx-auto px-4">
          <ScrollReveal>
            <h2 className="text-center text-3xl font-bold">Pricing</h2>
            <p className="mx-auto mt-4 max-w-xl text-center text-muted-foreground">
              PayNey is free while it&apos;s in beta — every feature below,
              on the house.
            </p>
          </ScrollReveal>
          <ScrollReveal>
            <Card className="card-lifted mx-auto mt-12 max-w-md rounded-2xl border-border bg-card">
              <CardContent className="space-y-6 p-8">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">
                      Beta plan
                    </p>
                    <p className="font-display text-4xl font-bold">
                      Free
                    </p>
                  </div>
                  <Badge className="brand-glow bg-primary text-primary-foreground">
                    No card required
                  </Badge>
                </div>
                <ul className="space-y-3">
                  {FREE_PLAN_INCLUDES.map((item) => (
                    <li key={item} className="flex items-start gap-3">
                      <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
                      <span className="text-muted-foreground">{item}</span>
                    </li>
                  ))}
                </ul>
                <Button
                  asChild
                  size="lg"
                  className="brand-glow w-full bg-primary text-primary-foreground hover:bg-primary/90"
                >
                  <Link href="/dashboard">Get started free</Link>
                </Button>
                <p className="text-center text-xs text-muted-foreground">
                  Paid plans may come later — anyone on the beta keeps free
                  access to everything they&apos;re using today.
                </p>
              </CardContent>
            </Card>
          </ScrollReveal>
        </div>
      </section>

      {/* About Us Section */}
      <section id="about" className="border-t border-border py-20">
        <div className="container mx-auto px-4">
          <ScrollReveal>
            <h2 className="text-center text-3xl font-bold">Why PayNey</h2>
            <p className="mx-auto mt-6 max-w-2xl text-center text-muted-foreground [line-height:1.7]">
              Tracking expenses across bank SMS, UPI apps, and paper receipts
              was tedious enough that most of it never got tracked at all.
              PayNey pulls all of it into one place automatically, so you
              spend less time bookkeeping and more time acting on what it
              tells you. It&apos;s built and maintained by a solo developer
              (otzr.labs).
            </p>
          </ScrollReveal>
        </div>
      </section>

      {/* CTA Section */}
      <section className="border-t border-border py-20">
        <div className="container mx-auto px-4 text-center">
          <h2 className="mb-4 text-3xl font-bold">
            Ready to Take Control of Your Finances?
          </h2>
          <p className="mx-auto mb-8 max-w-2xl text-muted-foreground">
            Join thousands of users who are already managing their finances
            smarter with PayNey
          </p>
          <Button
            asChild
            size="lg"
            className="brand-glow bg-primary text-primary-foreground hover:bg-primary/90"
          >
            <Link href="/dashboard">Start Free Trial</Link>
          </Button>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default LandingPage;
