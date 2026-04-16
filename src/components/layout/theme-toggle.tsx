"use client";

import { useCallback, useEffect, useSyncExternalStore, useState } from "react";

type Theme = "light" | "dark" | "system";

const THEME_KEY = "theme";

const THEME_CYCLE: Theme[] = ["light", "dark", "system"];

function getSystemPreference(): boolean {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(prefers-color-scheme: dark)").matches;
}

function applyTheme(theme: Theme) {
  const isDark =
    theme === "dark" || (theme === "system" && getSystemPreference());

  if (isDark) {
    document.documentElement.classList.add("dark");
  } else {
    document.documentElement.classList.remove("dark");
  }
}

function readStoredTheme(): Theme {
  if (typeof window === "undefined") return "system";
  const stored = localStorage.getItem(THEME_KEY) as Theme | null;
  return stored && THEME_CYCLE.includes(stored) ? stored : "system";
}

/** Detect client-side mount without setState-in-effect */
const emptySubscribe = () => () => {};

function useIsMounted() {
  return useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false,
  );
}

/** Sun icon -- light theme indicator */
function SunIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <circle cx="12" cy="12" r="5" />
      <line x1="12" y1="1" x2="12" y2="3" />
      <line x1="12" y1="21" x2="12" y2="23" />
      <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
      <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
      <line x1="1" y1="12" x2="3" y2="12" />
      <line x1="21" y1="12" x2="23" y2="12" />
      <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
      <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
    </svg>
  );
}

/** Moon icon -- dark theme indicator */
function MoonIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
    </svg>
  );
}

/** Monitor icon -- system theme indicator */
function MonitorIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <rect x="2" y="3" width="20" height="14" rx="2" ry="2" />
      <line x1="8" y1="21" x2="16" y2="21" />
      <line x1="12" y1="17" x2="12" y2="21" />
    </svg>
  );
}

const THEME_LABELS: Record<Theme, string> = {
  light: "밝은 모드",
  dark: "어두운 모드",
  system: "시스템 설정",
};

const THEME_ICONS: Record<Theme, () => React.JSX.Element> = {
  light: SunIcon,
  dark: MoonIcon,
  system: MonitorIcon,
};

export default function ThemeToggle() {
  const [theme, setTheme] = useState<Theme>(readStoredTheme);
  const mounted = useIsMounted();

  // Listen for system preference changes when in "system" mode
  useEffect(() => {
    if (theme !== "system") return;

    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    const handler = () => applyTheme("system");
    mediaQuery.addEventListener("change", handler);
    return () => mediaQuery.removeEventListener("change", handler);
  }, [theme]);

  const cycleTheme = useCallback(() => {
    const currentIndex = THEME_CYCLE.indexOf(theme);
    const nextTheme = THEME_CYCLE[(currentIndex + 1) % THEME_CYCLE.length];
    setTheme(nextTheme);
    localStorage.setItem(THEME_KEY, nextTheme);
    applyTheme(nextTheme);
  }, [theme]);

  // Prevent hydration mismatch -- render a placeholder until mounted
  if (!mounted) {
    return (
      <div
        className="h-11 w-11 rounded-lg"
        aria-hidden="true"
      />
    );
  }

  const Icon = THEME_ICONS[theme];
  const label = THEME_LABELS[theme];

  return (
    <button
      onClick={cycleTheme}
      className="flex h-11 w-11 items-center justify-center rounded-lg
                 text-[var(--text-secondary)] transition-colors
                 duration-[var(--duration-normal)]
                 hover:bg-[var(--surface-hover)] hover:text-[var(--text-primary)]
                 focus-visible:outline-2 focus-visible:outline-[var(--color-brand)]
                 focus-visible:outline-offset-2"
      aria-label={`테마 변경: 현재 ${label}`}
      title={label}
      type="button"
    >
      <Icon />
    </button>
  );
}
