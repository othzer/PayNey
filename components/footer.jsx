import React from "react";
import { Github, Linkedin } from "lucide-react";

// TODO: swap these placeholder hrefs for the real profile URLs.
const SOCIAL_LINKS = [
  { icon: Github, label: "GitHub", href: "#" },
  { icon: Linkedin, label: "LinkedIn", href: "#" },
];

const Footer = () => {
  return (
    <footer className="border-t border-border py-8">
      <div className="container mx-auto flex flex-col items-center justify-between gap-4 px-4 text-sm text-muted-foreground md:flex-row">
        <p>Made with ❤️ by otzr.labs</p>
        <div className="flex items-center gap-4">
          {SOCIAL_LINKS.map(({ icon: Icon, label, href }) => (
            <a
              key={label}
              href={href}
              aria-label={label}
              className="text-muted-foreground transition-colors hover:text-primary"
            >
              <Icon className="h-5 w-5" />
            </a>
          ))}
        </div>
        <p>© 2026 PayNey. All rights reserved.</p>
      </div>
    </footer>
  );
};

export default Footer;
