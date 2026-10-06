"use client";
import { type ReactNode } from "react";
import { motion } from "motion/react";
import { AppLink, useData, useNav, withParams } from "@/lib/app-context";
import { asset } from "@/lib/images";
import { locationById, nextStop } from "@/lib/selectors";
import { formatRange } from "@/lib/dates";
import { ButtonLink, Corners, SampleTag, Star, StatusBadge, StatusGlyph, cx } from "@/components/ui/primitives";
import { Cursor } from "./Cursor";

export const NAV = [
  { href: "/work", label: "Work", sub: "The archive", numeral: "I", icon: IconWork },
  { href: "/map", label: "Map", sub: "Where I'll be", numeral: "II", icon: IconMap },
  { href: "/schedule", label: "Schedule", sub: "Availability", numeral: "III", icon: IconCalendar },
  { href: "/about", label: "About", sub: "The artist", numeral: "IV", icon: IconEye },
] as const;

function isActive(pathname: string, href: string) {
  return pathname === href || pathname.startsWith(href + "/");
}

export function Wordmark({ className, width = 240 }: { className?: string; width?: 240 | 640 }) {
  return (
    <img
      src={asset(`/brand/loash-wordmark-${width}.webp`)}
      srcSet={`${asset("/brand/loash-wordmark-240.webp")} 240w, ${asset("/brand/loash-wordmark-640.webp")} 640w`}
      sizes={width === 640 ? "(min-width: 1024px) 520px, 80vw" : "160px"}
      alt="LOASH"
      width={582}
      height={362}
      className={cx("h-auto select-none", className)}
      draggable={false}
    />
  );
}

/** "Now" card: the live pulse of the platform — next stop, straight from data. */
function NowCard() {
  const { snapshot, today } = useData();
  const stop = nextStop(snapshot, today);
  if (!stop) return null;
  const loc = locationById(snapshot, stop.locationId);
  return (
    <AppLink
      href={withParams("/map", { loc: stop.locationId })}
      data-cursor="explore"
      className="group relative block p-4 etched transition-colors hover:bg-white/[0.025]"
    >
      <Corners />
      <div className="flex items-center justify-between">
        <span className="eyebrow">Next stop</span>
        {stop.isPlaceholder && <SampleTag />}
      </div>
      <div className="mt-2.5 display text-[1.65rem] leading-none text-bone">{loc?.city}</div>
      <div className="mt-1.5 font-mono text-[11px] uppercase tracking-[0.14em] text-mist tabular">{formatRange(stop.startDate, stop.endDate)}</div>
      <StatusBadge status={stop.status} className="mt-3" pulse />
    </AppLink>
  );
}

function Rail() {
  const { pathname } = useNav();
  const { snapshot } = useData();
  const home = pathname === "/";
  return (
    <aside className="fixed inset-y-0 left-0 z-40 hidden w-[var(--rail-w)] flex-col border-r border-[var(--line)] bg-stone/80 backdrop-blur-xl lg:flex">
      <div className="px-6 pt-7">
        <AppLink href="/" aria-label="LOASH — home" className={cx("block transition-opacity duration-700", home && "pointer-events-none opacity-0")} data-cursor="open" tabIndex={home ? -1 : undefined}>
          <Wordmark className="w-[9.5rem]" />
        </AppLink>
        <p className="eyebrow mt-3">Tattoo artist · {snapshot.artist.homeCity.split(",")[0]}</p>
      </div>

      <nav aria-label="Primary" className="mt-10 px-3">
        <ul className="space-y-0.5">
          {NAV.map((n) => {
            const active = isActive(pathname, n.href);
            return (
              <li key={n.href}>
                <AppLink
                  href={n.href}
                  aria-current={active ? "page" : undefined}
                  className={cx(
                    "group relative flex items-baseline gap-4 px-3 py-2.5 transition-colors",
                    active ? "text-bone" : "text-ash hover:text-bone",
                  )}
                >
                  {active && (
                    <motion.span layoutId="rail-active" className="absolute inset-0 bg-white/[0.04] etched" transition={{ type: "spring", stiffness: 380, damping: 36 }} />
                  )}
                  <span className="relative w-7 font-display text-[13px] italic text-ash/80">{n.numeral}</span>
                  <span className="relative">
                    <span className="block caps text-[13px] tracking-[0.28em]">{n.label}</span>
                    <span className="mt-0.5 block font-mono text-[9.5px] uppercase tracking-[0.18em] text-ash/70 group-hover:text-ash">{n.sub}</span>
                  </span>
                  {active && <Star size={7} className="relative ml-auto self-center text-silver" />}
                </AppLink>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="mt-auto space-y-3 px-5 pb-6">
        {!home && <NowCard />}
        <ButtonLink href="/book" variant="primary" className="w-full">
          Request a tattoo
        </ButtonLink>
        <div className="flex items-center justify-between pt-2">
          {snapshot.artist.socials.map((s) => (
            <a key={s.label} href={s.href} target="_blank" rel="noreferrer" className="font-mono text-[10px] uppercase tracking-[0.18em] text-ash hover:text-bone">
              {s.label}
            </a>
          ))}
        </div>
      </div>
    </aside>
  );
}

function TopBar() {
  const { snapshot, today } = useData();
  const { pathname } = useNav();
  const stop = nextStop(snapshot, today);
  const loc = stop && locationById(snapshot, stop.locationId);
  return (
    <header className="fixed inset-x-0 top-0 z-40 flex h-[var(--topbar-h)] items-center justify-between border-b border-[var(--line)] bg-ink/75 px-4 backdrop-blur-xl lg:hidden">
      <AppLink href="/" aria-label="LOASH — home" className={cx("transition-opacity duration-500", pathname === "/" && "pointer-events-none opacity-0")} tabIndex={pathname === "/" ? -1 : undefined}>
        <Wordmark className="w-[5.6rem]" />
      </AppLink>
      {stop && loc && (
        <AppLink href={withParams("/map", { loc: stop.locationId })} className="flex items-center gap-2 border border-[var(--line)] px-2.5 py-1.5">
          <StatusGlyph status={stop.status} pulse />
          <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-mist">
            {loc.city} · {formatRange(stop.startDate, stop.endDate)}
          </span>
        </AppLink>
      )}
    </header>
  );
}

function TabBar() {
  const { pathname } = useNav();
  const items = [...NAV, { href: "/book", label: "Book", sub: "", numeral: "V", icon: IconNeedle }];
  return (
    <nav aria-label="Primary" className="fixed inset-x-0 bottom-0 z-40 border-t border-[var(--line)] bg-ink/85 pb-[env(safe-area-inset-bottom)] backdrop-blur-xl lg:hidden">
      <ul className="grid h-[var(--tabbar-h)] grid-cols-5">
        {items.map((n) => {
          const active = isActive(pathname, n.href);
          const book = n.href === "/book";
          const Icon = n.icon;
          return (
            <li key={n.href} className="relative">
              <AppLink
                href={n.href}
                aria-current={active ? "page" : undefined}
                className={cx("flex h-full flex-col items-center justify-center gap-1.5 transition-colors", active ? "text-bone" : "text-ash")}
              >
                {active && <motion.span layoutId="tab-active" className="absolute inset-x-5 top-0 h-px bg-silver" />}
                <span className={cx("grid place-items-center", book && "size-8 -my-1 rounded-full bg-gradient-to-b from-[#ecebe7] to-[#b5b4af] text-ink")}>
                  <Icon />
                </span>
                <span className="font-mono text-[9px] uppercase tracking-[0.18em]">{n.label}</span>
              </AppLink>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

export function AppShell({ children }: { children: ReactNode }) {
  const { pathname } = useNav();
  return (
    <>
      <a href="#main" className="sr-only-focusable fixed left-3 top-3 z-[90] bg-bone px-3 py-2 font-mono text-xs text-ink">
        Skip to content
      </a>
      <Rail />
      <TopBar />
      <main
        id="main"
        className="relative min-h-dvh pb-[calc(var(--tabbar-h)+env(safe-area-inset-bottom))] pt-[var(--topbar-h)] lg:pb-0 lg:pl-[var(--rail-w)] lg:pt-0"
      >
        <motion.div
          key={pathname}
          // No filter here: a lingering filter/transform would trap position:fixed children
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        >
          {children}
        </motion.div>
      </main>
      <TabBar />
      <div className="grain" aria-hidden />
      <Cursor />
    </>
  );
}

/* ── Icons: thin, engraved-line ── */
function I({ children }: { children: ReactNode }) {
  return <svg width="18" height="18" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.15" aria-hidden>{children}</svg>;
}
function IconWork() { return <I><rect x="3.5" y="2.5" width="13" height="15" /><rect x="6" y="5" width="8" height="10" /></I>; }
function IconMap() { return <I><circle cx="10" cy="10" r="7.5" /><path d="M10 3.5 L11.6 10 L10 16.5 L8.4 10Z" fill="currentColor" stroke="none" /></I>; }
function IconCalendar() { return <I><rect x="2.5" y="4" width="15" height="13" /><path d="M2.5 8h15M6.5 2.2v3.4M13.5 2.2v3.4" /><circle cx="10" cy="12.5" r="1.1" fill="currentColor" stroke="none" /></I>; }
function IconEye() { return <I><path d="M1.8 10 C5 4.6 15 4.6 18.2 10 C15 15.4 5 15.4 1.8 10Z" /><circle cx="10" cy="10" r="2.4" /></I>; }
function IconNeedle() { return <I><path d="M4 16 L13.5 6.5 M12 5 L15 8 M14.2 4.2 L15.8 5.8 M3 17 L5 15" strokeWidth="1.4" /></I>; }
