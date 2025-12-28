import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { featuresData, howItWorksData } from "@/data/landing";
import HeroSection from "@/components/hero";
import Navbar from "@/components/navbar";
import Footer from "@/components/footer";
import ScrollReveal from "@/components/scroll-reveal";
import Link from "next/link";

const LandingPage = () => {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />

      {/* Hero Section */}
      <HeroSection />

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
                <Card className="h-full border-border bg-card p-6">
                  <CardContent className="space-y-4 pt-4">
                    {feature.icon}
                    <h3 className="text-xl font-semibold">{feature.title}</h3>
                    <p className="text-muted-foreground">
                      {feature.description}
                    </p>
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
          <div className="grid grid-cols-1 gap-12 md:grid-cols-3">
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

      {/* Pricing Section (placeholder) */}
      <section id="pricing" className="border-t border-border py-20">
        <div className="container mx-auto px-4">
          <ScrollReveal>
            <h2 className="text-center text-3xl font-bold">Pricing</h2>
            <p className="mt-4 text-center text-muted-foreground">
              Coming soon.
            </p>
          </ScrollReveal>
        </div>
      </section>

      {/* About Us Section (placeholder) */}
      <section id="about" className="border-t border-border py-20">
        <div className="container mx-auto px-4">
          <ScrollReveal>
            <h2 className="text-center text-3xl font-bold">About us</h2>
            <p className="mt-4 text-center text-muted-foreground">
              Coming soon.
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
