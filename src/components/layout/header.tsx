"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import ThemeToggle from "./theme-toggle";

interface NavItem {
  href: string;
  label: string;
}

const NAV_ITEMS: NavItem[] = [
  { href: "/", label: "홈" },
  { href: "/create", label: "새 시놉시스" },
  { href: "/synopses", label: "보관함" },
  { href: "/settings", label: "설정" },
];

/** Hamburger / close icon for mobile menu */
function MenuIcon({ open }: { open: boolean }) {
  return (
    <svg
      width="22"
      height="22"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {open ? (
        <>
          <line x1="18" y1="6" x2="6" y2="18" />
          <line x1="6" y1="6" x2="18" y2="18" />
        </>
      ) : (
        <>
          <line x1="4" y1="7" x2="20" y2="7" />
          <line x1="4" y1="12" x2="20" y2="12" />
          <line x1="4" y1="17" x2="20" y2="17" />
        </>
      )}
    </svg>
  );
}

export default function Header() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const closeMobile = useCallback(() => {
    setMobileOpen(false);
  }, []);

  // Close mobile menu when clicking outside
  useEffect(() => {
    if (!mobileOpen) return;

    function handleClick(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMobileOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [mobileOpen]);

  // Close on Escape key
  useEffect(() => {
    if (!mobileOpen) return;

    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") {
        setMobileOpen(false);
      }
    }
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [mobileOpen]);

  const toggleMobile = useCallback(() => {
    setMobileOpen((prev) => !prev);
  }, []);

  function isActive(href: string): boolean {
    if (href === "/") return pathname === "/";
    return pathname.startsWith(href);
  }

  return (
    <header
      ref={menuRef}
      className="sticky top-0 z-50 w-full border-b border-[var(--border-subtle)]
                 bg-[var(--bg-base)]/95 backdrop-blur-sm"
    >
      <nav className="mx-auto flex h-14 max-w-5xl items-center justify-between px-4 sm:px-6">
        {/* Logo / Brand */}
        <Link
          href="/"
          className="text-display text-lg font-semibold tracking-tight
                     text-[var(--text-primary)] transition-colors
                     duration-[var(--duration-normal)]
                     hover:text-[var(--color-brand)]"
        >
          시놉시스 공방
        </Link>

        {/* Desktop navigation */}
        <div className="hidden items-center gap-1 sm:flex">
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`text-body rounded-lg px-3 py-1.5 text-sm transition-colors
                         duration-[var(--duration-normal)]
                         ${
                           isActive(item.href)
                             ? "bg-[var(--surface-active)] text-[var(--text-primary)] font-medium"
                             : "text-[var(--text-secondary)] hover:bg-[var(--surface-hover)] hover:text-[var(--text-primary)]"
                         }`}
            >
              {item.label}
            </Link>
          ))}

          <div className="ml-2 flex items-center border-l border-[var(--border-subtle)] pl-2">
            <ThemeToggle />
          </div>
        </div>

        {/* Mobile controls */}
        <div className="flex items-center gap-1 sm:hidden">
          <ThemeToggle />

          <button
            onClick={toggleMobile}
            className="flex h-11 w-11 items-center justify-center rounded-lg
                       text-[var(--text-secondary)] transition-colors
                       duration-[var(--duration-normal)]
                       hover:bg-[var(--surface-hover)] hover:text-[var(--text-primary)]"
            aria-label={mobileOpen ? "메뉴 닫기" : "메뉴 열기"}
            aria-expanded={mobileOpen}
            type="button"
          >
            <MenuIcon open={mobileOpen} />
          </button>
        </div>
      </nav>

      {/* Mobile menu -- slide down */}
      <div
        className={`overflow-hidden border-t border-[var(--border-subtle)]
                    transition-all duration-[var(--duration-slow)] ease-out-quart
                    sm:hidden
                    ${mobileOpen ? "max-h-64 opacity-100" : "max-h-0 opacity-0 border-t-0"}`}
      >
        <div className="flex flex-col gap-1 px-4 py-3">
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={closeMobile}
              className={`text-body rounded-lg px-3 py-2.5 text-sm transition-colors
                         duration-[var(--duration-normal)]
                         ${
                           isActive(item.href)
                             ? "bg-[var(--surface-active)] text-[var(--text-primary)] font-medium"
                             : "text-[var(--text-secondary)] hover:bg-[var(--surface-hover)] hover:text-[var(--text-primary)]"
                         }`}
            >
              {item.label}
            </Link>
          ))}
        </div>
      </div>
    </header>
  );
}
