"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { forwardRef, useCallback, useEffect, useMemo, useState, type AnchorHTMLAttributes, type ReactNode } from "react";
import type { Snapshot } from "@/lib/types";
import { AppProviders, type NavApi } from "@/lib/app-context";
import { AppShell } from "./AppShell";

const NextLink = forwardRef<HTMLAnchorElement, AnchorHTMLAttributes<HTMLAnchorElement> & { href: string }>(function NextLink(p, ref) {
  return <Link ref={ref} {...p} />;
});

/**
 * Next.js adapter for the app context. Search params are tracked from window.location
 * (instead of useSearchParams) so statically rendered pages don't bail out of SSR.
 */
export function NextProviders({ snapshot, today, children }: { snapshot: Snapshot; today: string; children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [search, setSearch] = useState(() => new URLSearchParams());

  const sync = useCallback(() => setSearch(new URLSearchParams(window.location.search)), []);
  useEffect(() => { sync(); }, [pathname, sync]);
  useEffect(() => {
    window.addEventListener("popstate", sync);
    return () => window.removeEventListener("popstate", sync);
  }, [sync]);

  const nav: NavApi = useMemo(
    () => ({
      pathname,
      search,
      push: (href, opts) => {
        router.push(href, { scroll: opts?.scroll ?? true });
        setSearch(new URLSearchParams(href.split("?")[1] ?? ""));
      },
      replace: (href) => {
        // Shallow URL update — keeps state, no server round-trip.
        window.history.replaceState(window.history.state, "", href);
        setSearch(new URLSearchParams(href.split("?")[1] ?? ""));
      },
      Link: NextLink,
    }),
    [pathname, search, router],
  );

  return (
    <AppProviders snapshot={snapshot} nav={nav} initialToday={today}>
      <AppShell>{children}</AppShell>
    </AppProviders>
  );
}
