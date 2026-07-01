import React from "react";
import Link from "next/link";

const AuthNavbar = () => {
  return (
    <div className="fixed left-6 top-6 z-50">
      <Link
        href="/"
        className="lifted flex h-12 w-12 items-center justify-center rounded-full border border-border bg-card"
        aria-label="PayNey home"
      >
        <span className="h-5 w-5 rounded-sm bg-primary" />
      </Link>
    </div>
  );
};

export default AuthNavbar;
