"use client";
/**
 * Framework-agnostic app context: data snapshot + navigation.
 * Next.js supplies a NextNav adapter; the static preview supplies a hash router.
 * Components never import next/* directly, which keeps them portable and testable.
 */
import { createContext, useContext, useEffect, useState, type AnchorHTMLAttributes, type ComponentType, type ReactNode } from "react";
import type { Snapshot } from "./types";
import { todayISO } from "./dates";

export interface NavApi {
  pathname: string;
  search: URLSearchParams;
  push: (href: string, opts?: { scroll?: boolean }) => void;
  replace: (href: string) => void;
  /** Renders an <a>. Adapters may swap in a prefetching link. */
  Link: ComponentType<AnchorHTMLAttributes<HTMLAnchorElement> & { href: string }>;
}

const NavCtx = createContext<NavApi | null>(null);
const DataCtx = createContext<{ snapshot: Snapshot; today: string } | null>(null);

export function AppProviders({ snapshot, nav, children, initialToday }: { snapshot: Snapshot; nav: NavApi; children: ReactNode; initialToday?: string }) {
  const [today, setToday] = useState(initialToday ?? todayISO());
  useEffect(() => {
    // Keep "today" honest for long-lived tabs and statically rendered pages.
    const tick = () => setToday(todayISO());
    tick();
    const id = setInterval(tick, 60_000);
    return () => clearInterval(id);
  }, []);
  return (
    <DataCtx.Provider value={{ snapshot, today }}>
      <NavCtx.Provider value={nav}>{children}</NavCtx.Provider>
    </DataCtx.Provider>
  );
}

export function useNav(): NavApi {
  const n = useContext(NavCtx);
  if (!n) throw new Error("useNav outside AppProviders");
  return n;
}

export function useData() {
  const d = useContext(DataCtx);
  if (!d) throw new Error("useData outside AppProviders");
  return d;
}

/** Link that routes through whichever adapter is active. */
export function AppLink(props: AnchorHTMLAttributes<HTMLAnchorElement> & { href: string }) {
  const { Link } = useNav();
  return <Link {...props} />;
}

export function withParams(path: string, params: Record<string, string | null | undefined>) {
  const q = new URLSearchParams();
  for (const [k, v] of Object.entries(params)) if (v) q.set(k, v);
  const s = q.toString();
  return s ? `${path}?${s}` : path;
}
