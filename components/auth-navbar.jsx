import React from "react";
import Link from "next/link";
import Image from "next/image";

const AuthNavbar = () => {
  return (
    <div className="fixed left-6 top-6 z-50">
      <Link
        href="/"
        className="lifted flex h-12 w-12 items-center justify-center rounded-md border border-border bg-card"
        aria-label="PayNey home"
      >
        {/* <span className="h-5 w-5 rounded-sm bg-primary" /> */}
        <Image
              src="/payney-logomark.svg"
              alt=""
              width={5}
              height={5}
              className="h-full w-full object-cover"
              priority
        />
      </Link>
    </div>
  );
};

export default AuthNavbar;
