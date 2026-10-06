/**
 * Static preview entry: the exact same views as the Next.js app, wired to a hash router
 * and the bundled sample data. No server, so form submissions run in "demo" mode.
 */
import { StrictMode, useEffect, useMemo, useState, type AnchorHTMLAttributes } from "react";
import { createRoot } from "react-dom/client";
// Fonts come from Google Fonts in the preview (see index.html); the Next app self-hosts them.
import "@/styles/globals.css";
import { AppProviders, type NavApi } from "@/lib/app-context";
import { sampleSnapshot } from "@/lib/data/sample";
import { setAssetBase } from "@/lib/images";
import { AppShell } from "@/components/shell/AppShell";
import { HomeView } from "@/components/home/HomeView";
import { WorkView } from "@/components/work/WorkView";
import { MapView } from "@/components/map/MapView";
import { ScheduleView } from "@/components/schedule/ScheduleView";
import { AboutView } from "@/components/about/AboutView";
import { BookView } from "@/components/book/BookView";

(window as unknown as { __LOASH_PREVIEW__: boolean }).__LOASH_PREVIEW__ = true;
setAssetBase("./");

const parse = () => {
  const h = window.location.hash.replace(/^#/, "") || "/";
  const [p, q = ""] = h.split("?");
  return { pathname: p || "/", search: new URLSearchParams(q) };
};

function HashLink({ href, onClick, ...p }: AnchorHTMLAttributes<HTMLAnchorElement> & { href: string }) {
  const external = /^https?:/.test(href) || href.startsWith("#") || href.startsWith("mailto:");
  return (
    <a
      {...p}
      href={external ? href : `#${href}`}
      onClick={(e) => {
        onClick?.(e);
        if (external || e.defaultPrevented || e.metaKey || e.ctrlKey) return;
        e.preventDefault();
        go(href, true);
      }}
    />
  );
}

let listeners: (() => void)[] = [];
function go(href: string, scroll: boolean, replace = false) {
  const url = `#${href}`;
  if (replace) history.replaceState(null, "", url);
  else history.pushState(null, "", url);
  listeners.forEach((l) => l());
  if (scroll) window.scrollTo({ top: 0 });
}

function App() {
  const snapshot = useMemo(() => sampleSnapshot(), []);
  const [loc, setLoc] = useState(parse);
  useEffect(() => {
    const sync = () => setLoc(parse());
    listeners.push(sync);
    window.addEventListener("hashchange", sync);
    window.addEventListener("popstate", sync);
    return () => {
      listeners = listeners.filter((l) => l !== sync);
      window.removeEventListener("hashchange", sync);
      window.removeEventListener("popstate", sync);
    };
  }, []);

  const nav: NavApi = useMemo(
    () => ({
      pathname: loc.pathname,
      search: loc.search,
      push: (href, o) => go(href, o?.scroll ?? true),
      replace: (href) => go(href, false, true),
      Link: HashLink,
    }),
    [loc],
  );

  const p = loc.pathname;
  const view =
    p === "/work" ? <WorkView />
    : p.startsWith("/work/") ? <WorkView initialSlug={p.slice(6)} />
    : p === "/map" ? <MapView />
    : p === "/schedule" ? <ScheduleView />
    : p === "/about" ? <AboutView />
    : p === "/book" ? <BookView />
    : <HomeView />;

  return (
    <AppProviders snapshot={snapshot} nav={nav}>
      <AppShell>{view}</AppShell>
    </AppProviders>
  );
}

createRoot(document.getElementById("root")!).render(<StrictMode><App /></StrictMode>);
