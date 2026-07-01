"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";

const NAV_LINKS = [
  { id: "features", label: "Features" },
  { id: "how-it-works", label: "How it works" },
  { id: "pricing", label: "Pricing" },
  { id: "about", label: "About us" },
];

const Navbar = () => {
  const [active, setActive] = useState("features");

  useEffect(() => {
    const sections = NAV_LINKS.map(({ id }) => document.getElementById(id)).filter(
      Boolean
    );
    if (sections.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActive(entry.target.id);
          }
        });
      },
      { rootMargin: "-40% 0px -50% 0px", threshold: 0 }
    );

    sections.forEach((section) => observer.observe(section));
    return () => observer.disconnect();
  }, []);

  return (
    <div className="fixed inset-x-0 top-6 z-50 px-4">
      <div className="container mx-auto flex items-center justify-between">
        <div className="flex items-center gap-[10px]">
          {/* Pill 1: logo mark */}
          <Link
            href="/"
            className="lifted flex h-12 w-12 shrink-0 items-center justify-center rounded-full border border-border bg-card"
            aria-label="PayNey home"
          >
            <span className="h-5 w-5 rounded-sm bg-primary" />
          </Link>

          {/* Pill 2: nav links */}
          <nav className="lifted hidden items-center gap-6 rounded-full border border-border bg-card px-6 py-3 md:flex">
            {NAV_LINKS.map((link) => (
              <a
                key={link.id}
                href={`#${link.id}`}
                className={`text-sm transition-colors hover:text-foreground ${
                  active === link.id ? "text-foreground" : "text-muted-foreground"
                }`}
              >
                {link.label}
              </a>
            ))}
          </nav>
        </div>

        {/* Pill 3: auth actions */}
        <div className="lifted flex items-center overflow-hidden rounded-full border border-border">
          <Link
            href="/sign-up"
            className="bg-primary px-5 py-3 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90"
          >
            Create account
          </Link>
          <div className="h-full w-px bg-border" />
          <Link
            href="/sign-in"
            className="px-5 py-3 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            Log in
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Navbar;
