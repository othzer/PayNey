import React from "react";
import Link from "next/link";
import Image from "next/image";

const AuthNavbar = () => {
  return (
    <div className="fixed left-6 top-6 z-50">
      <Link
        href="/"
        className="lifted flex h-12 w-12 items-center justify-center overflow-hidden rounded-xl"
        aria-label="PayNey home"
      >
        <Image
          src="/payney-logomark.svg"
          alt="PayNey"
          width={48}
          height={48}
          className="h-full w-full object-contain"
          priority
        />
      </Link>
    </div>
  );
};

export default AuthNavbar;
