"use client";

import { useSyncExternalStore } from "react";
import { useTheme } from "next-themes";
import { Sun, Moon } from "lucide-react";

const emptySubscribe = () => () => {};

export function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();
  // true hanya setelah hidrasi klien (hindari mismatch label/ikon).
  const mounted = useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false
  );

  const isDark = resolvedTheme === "dark";

  return (
    <button
      type="button"
      // Label stabil sebelum mounted agar tak ada mismatch hidrasi.
      aria-label={
        !mounted ? "Ganti tema" : isDark ? "Ganti ke mode terang" : "Ganti ke mode malam"
      }
      onClick={() => setTheme(isDark ? "light" : "dark")}
      className="flex h-9 w-9 items-center justify-center rounded-full border border-border text-muted-foreground transition hover:border-[color:var(--line-strong)] hover:text-[color:var(--gold-hi)]"
    >
      {mounted ? (
        isDark ? (
          <Sun className="h-4 w-4" />
        ) : (
          <Moon className="h-4 w-4" />
        )
      ) : (
        <Moon className="h-4 w-4 opacity-0" />
      )}
    </button>
  );
}
