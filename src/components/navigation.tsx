"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { siteConfig } from "@/content/site";
import { cn } from "@/lib/utils";

export function Navigation() {
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();
  const isHome = pathname === "/";

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const linkClass = "text-sm text-[#666] hover:text-[#1a1410] transition-colors";

  return (
    <header
      className={cn(
        "fixed top-0 inset-x-0 z-50 h-[4.25rem] transition-all duration-200",
        scrolled
          ? "bg-[#f5f0eb]/95 backdrop-blur-md border-b border-[#e0d5cc]/60 shadow-sm"
          : "bg-[#f5f0eb]/70 backdrop-blur-sm border-b border-transparent",
      )}
    >
      <nav
        aria-label="Main"
        className="section-shell-wide h-full flex items-center justify-between"
      >
        <Link
          href="/"
          className="font-serif text-lg sm:text-xl tracking-wide text-[#1a1410] hover:text-[#5c5048] transition-colors"
        >
          {siteConfig.name}
        </Link>
        <div className="flex items-center gap-4 sm:gap-7">
          {isHome && (
            <>
              <Link href="#highlights" className={cn(linkClass, "hidden md:inline")}>
                Reels
              </Link>
              <Link href="#about" className={cn(linkClass, "hidden sm:inline")}>
                About
              </Link>
              <Link href="#audiobook" className={linkClass}>
                Audiobook
              </Link>
            </>
          )}
          <Link href="/purchases" className={linkClass}>
            My Purchases
          </Link>
        </div>
      </nav>
    </header>
  );
}
