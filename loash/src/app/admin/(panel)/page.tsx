import Link from "next/link";
import { getAdminData } from "@/lib/admin/data";
import { STATUS } from "@/lib/status";
import { formatMonDay, formatRange, todayISO, addDays } from "@/lib/dates";
import { PIPELINE } from "@/lib/admin/pipeline";
import { StatusBadge } from "@/components/ui/primitives";

export const metadata = { title: "Dashboard" };

function Tile({ label, value, sub, href }: { label: string; value: React.ReactNode; sub?: React.ReactNode; href: string }) {
  return (
    <Link href={href} className="etched block bg-stone/60 p-4 transition-colors hover:bg-white/[0.03] sm:p-5">
      <span className="eyebrow">{label}</span>
      <span className="display mt-2 block text-[2.2rem] leading-none text-bone tabular sm:text-[2.6rem]">{value}</span>
      {sub && <span className="mt-2 block font-mono text-[10px] uppercase tracking-[0.12em] text-ash">{sub}</span>}
    </Link>
  );
}

export default async function Dashboard() {
  const d = await getAdminData();
  const today = todayISO();
  const fresh = d.inquiries.filter((i) => i.status === "new");
  const openReq = d.inquiries.filter((i) => !["completed", "declined"].includes(i.status));
  const upcoming = d.stops.filter((s) => !s.endDate || s.endDate >= today);
  const next = upcoming.find((s) => s.status !== "closed" && s.startDate);
  const nextCity = next && d.locations.find((l) => l.id === next.locationId);
  const in30 = addDays(today, 30);
  const openDays = d.days.filter((x) => x.date >= today && x.date <= in30 && STATUS[x.status].bookable).length;

  const todo = [
    d.stops.some((s) => s.isPlaceholder) && { text: `${d.stops.filter((s) => s.isPlaceholder).length} sample stops still on the site`, href: "/admin/schedule" },
    d.profile.bioIsPlaceholder && { text: "Write your bio", href: "/admin/profile" },
    d.profile.faqIsPlaceholder && { text: "Answer the FAQ", href: "/admin/profile" },
    !d.profile.portrait && { text: "Upload a portrait", href: "/admin/profile" },
    !d.tattoos.some((t) => t.styles.includes("custom")) && { text: "Tag custom pieces (turns on the Custom filter)", href: "/admin/work" },
  ].filter(Boolean) as { text: string; href: string }[];

  return (
    <>
      <p className="eyebrow">Admin</p>
      <h1 className="display mt-2 text-[2.6rem] text-bone sm:text-[3.2rem]">Welcome back, {d.profile.name}.</h1>

      <div className="mt-8 grid grid-cols-2 gap-2 lg:grid-cols-4 lg:gap-3">
        <Tile label="New requests" value={fresh.length} sub={`${openReq.length} open in total`} href="/admin/inquiries" />
        <Tile label="Next stop" value={nextCity?.city ?? "—"} sub={next ? <>{formatRange(next.startDate, next.endDate)}</> : "Add one"} href="/admin/schedule" />
        <Tile label="Open days · 30d" value={openDays} sub="Open or limited" href="/admin/schedule" />
        <Tile label="Pieces live" value={d.tattoos.filter((t) => t.published).length} sub={`${d.tattoos.filter((t) => t.featured).length} featured`} href="/admin/work" />
      </div>

      <div className="mt-10 grid gap-10 lg:grid-cols-[1.3fr_1fr]">
        <section>
          <div className="mb-3 flex items-center justify-between border-b border-[var(--line)] pb-2">
            <h2 className="caps text-[12.5px] tracking-[0.26em] text-bone">Latest requests</h2>
            <Link href="/admin/inquiries" className="font-mono text-[10px] uppercase tracking-[0.18em] text-mist hover:text-bone">Inbox →</Link>
          </div>
          <ul>
            {d.inquiries.slice(0, 5).map((i) => {
              const p = PIPELINE.find((x) => x.id === i.status)!;
              return (
                <li key={i.id} className="flex items-center justify-between gap-3 border-b border-[var(--line)] py-3">
                  <span className="min-w-0">
                    <span className="block truncate font-display text-[1.15rem] text-bone">{i.name}</span>
                    <span className="block truncate text-[12.5px] text-ash">{i.idea}</span>
                  </span>
                  <span className="shrink-0 font-mono text-[9.5px] uppercase tracking-[0.12em]" style={{ color: p.tone }}>{p.label}</span>
                </li>
              );
            })}
            {!d.inquiries.length && <li className="py-4 text-[14px] text-ash">No requests yet.</li>}
          </ul>
        </section>

        <section>
          <div className="mb-3 flex items-center justify-between border-b border-[var(--line)] pb-2">
            <h2 className="caps text-[12.5px] tracking-[0.26em] text-bone">Coming up</h2>
            <Link href="/admin/schedule" className="font-mono text-[10px] uppercase tracking-[0.18em] text-mist hover:text-bone">Edit →</Link>
          </div>
          <ul>
            {upcoming.slice(0, 5).map((s) => (
              <li key={s.id} className="flex items-center justify-between gap-3 border-b border-[var(--line)] py-3">
                <span>
                  <span className="caps text-[13px] tracking-[0.2em] text-bone">{d.locations.find((l) => l.id === s.locationId)?.city}</span>
                  <span className="block font-mono text-[10px] uppercase tracking-[0.12em] text-ash">{s.startDate ? formatMonDay(s.startDate) : "TBA"}{s.endDate && s.endDate !== s.startDate ? ` – ${formatMonDay(s.endDate)}` : ""}</span>
                </span>
                <StatusBadge status={s.status} short />
              </li>
            ))}
          </ul>

          {todo.length > 0 && (
            <div className="mt-8 border border-dashed border-limited/40 p-4">
              <p className="eyebrow text-limited">Before launch</p>
              <ul className="mt-2 space-y-1.5">
                {todo.map((t) => (
                  <li key={t.text}><Link href={t.href} className="text-[13.5px] text-mist underline decoration-[var(--line-strong)] underline-offset-4 hover:text-bone">{t.text}</Link></li>
                ))}
              </ul>
            </div>
          )}
        </section>
      </div>
    </>
  );
}
