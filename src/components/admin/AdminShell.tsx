"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { motion } from "motion/react";
import { asset } from "@/lib/images";
import { cx } from "@/components/ui/primitives";
import { ToastProvider } from "./kit";
import { signOut } from "@/app/admin/actions";

const NAV = [
  { href: "/admin", label: "Home", icon: IconHome },
  { href: "/admin/work", label: "Work", icon: IconWork },
  { href: "/admin/schedule", label: "Schedule", icon: IconCal },
  { href: "/admin/inquiries", label: "Inbox", icon: IconInbox },
  { href: "/admin/profile", label: "Profile", icon: IconText },
];

const active = (p: string, href: string) => (href === "/admin" ? p === "/admin" : p.startsWith(href));

export function AdminShell({ email, newCount, demo, children }: { email: string; newCount: number; demo: boolean; children: ReactNode }) {
  const pathname = usePathname();
  return (
    <ToastProvider>
      {/* Desktop sidebar */}
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-60 flex-col border-r border-[var(--line)] bg-stone lg:flex">
        <div className="px-6 pt-7">
          <img src={asset("/brand/loash-wordmark-240.webp")} alt="LOASH" className="w-28" />
          <p className="eyebrow mt-2">Admin</p>
        </div>
        <nav className="mt-8 px-3" aria-label="Admin">
          {NAV.map((n) => {
            const on = active(pathname, n.href);
            const Icon = n.icon;
            return (
              <Link key={n.href} href={n.href} aria-current={on ? "page" : undefined} className={cx("relative flex items-center gap-3 px-3 py-3 font-mono text-[12px] uppercase tracking-[0.2em] transition-colors", on ? "text-bone" : "text-ash hover:text-bone")}>
                {on && <motion.span layoutId="admin-nav" className="absolute inset-0 etched bg-white/[0.04]" />}
                <span className="relative"><Icon /></span>
                <span className="relative">{n.label}</span>
                {n.href === "/admin/inquiries" && newCount > 0 && <span className="relative ml-auto bg-silver px-1.5 text-[11px] text-ink">{newCount}</span>}
              </Link>
            );
          })}
        </nav>
        <div className="mt-auto space-y-2 px-6 pb-6">
          <a href="/" target="_blank" rel="noreferrer" className="block font-mono text-[11px] uppercase tracking-[0.2em] text-mist hover:text-bone">View live site ↗</a>
          <p className="truncate font-mono text-[11px] text-ash">{email}</p>
          <form action={signOut}><button className="font-mono text-[11px] uppercase tracking-[0.2em] text-ash hover:text-bone">Sign out</button></form>
        </div>
      </aside>

      {/* Mobile top bar */}
      <header className="fixed inset-x-0 top-0 z-40 flex items-center justify-between border-b border-[var(--line)] bg-ink/85 px-4 pb-2.5 pt-[calc(env(safe-area-inset-top)+10px)] backdrop-blur-xl lg:hidden">
        <span className="flex items-center gap-2.5">
          <img src={asset("/brand/loash-wordmark-240.webp")} alt="LOASH" className="w-[4.6rem]" />
          <span className="eyebrow">Admin</span>
        </span>
        <span className="flex items-center gap-3">
          <a href="/" target="_blank" rel="noreferrer" className="font-mono text-[11px] uppercase tracking-[0.18em] text-mist">Site ↗</a>
          <form action={signOut}><button className="font-mono text-[11px] uppercase tracking-[0.18em] text-ash">Sign out</button></form>
        </span>
      </header>

      <main className="min-h-dvh px-4 pb-[calc(var(--tabbar-h)+env(safe-area-inset-bottom)+32px)] pt-[calc(env(safe-area-inset-top)+76px)] sm:px-6 lg:pb-16 lg:pl-[calc(15rem+3rem)] lg:pr-12 lg:pt-10">
        <div className="mx-auto max-w-5xl">
        {demo && (
          <p className="mb-6 border border-dashed border-limited/50 px-4 py-3 font-mono text-[11.5px] uppercase tracking-[0.14em] text-limited">
            Demo mode — showing sample data. Connect Supabase to save changes.
          </p>
        )}
        {children}
        </div>
      </main>

      {/* Mobile tabs */}
      <nav aria-label="Admin" className="fixed inset-x-0 bottom-0 z-40 border-t border-[var(--line)] bg-ink/90 pb-[env(safe-area-inset-bottom)] backdrop-blur-xl lg:hidden">
        <ul className="grid h-[var(--tabbar-h)] grid-cols-5">
          {NAV.map((n) => {
            const on = active(pathname, n.href);
            const Icon = n.icon;
            return (
              <li key={n.href} className="relative">
                <Link href={n.href} aria-current={on ? "page" : undefined} className={cx("flex h-full flex-col items-center justify-center gap-1.5", on ? "text-bone" : "text-ash")}>
                  {on && <motion.span layoutId="admin-tab" className="absolute inset-x-5 top-0 h-px bg-silver" />}
                  <span className="relative">
                    <Icon />
                    {n.href === "/admin/inquiries" && newCount > 0 && <span className="absolute -right-2.5 -top-1.5 min-w-4 bg-silver px-1 text-center font-mono text-[10.5px] text-ink">{newCount}</span>}
                  </span>
                  <span className="font-mono text-[10.5px] uppercase tracking-[0.16em]">{n.label}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
      <div className="grain" aria-hidden />
    </ToastProvider>
  );
}

function I({ children }: { children: ReactNode }) {
  return <svg width="18" height="18" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.15" aria-hidden>{children}</svg>;
}
function IconHome() { return <I><path d="M3 9.5 10 3.5l7 6V17H3Z" /><path d="M8 17v-5h4v5" /></I>; }
function IconWork() { return <I><rect x="3.5" y="2.5" width="13" height="15" /><rect x="6" y="5" width="8" height="10" /></I>; }
function IconCal() { return <I><rect x="2.5" y="4" width="15" height="13" /><path d="M2.5 8h15M6.5 2.2v3.4M13.5 2.2v3.4" /></I>; }
function IconInbox() { return <I><path d="M2.5 11.5 5 4h10l2.5 7.5V16h-15Z" /><path d="M2.5 11.5h4.5l1 2h4l1-2h4.5" /></I>; }
function IconText() { return <I><path d="M4 4.5h12M4 8.5h12M4 12.5h8M4 16.5h6" /></I>; }
