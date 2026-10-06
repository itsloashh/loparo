"use client";
import { useEffect, useMemo, useState, type ReactNode } from "react";
import { AnimatePresence, motion, useScroll, useTransform } from "motion/react";
import { AppLink, useData, withParams } from "@/lib/app-context";
import { STATUS, STYLE_LABEL } from "@/lib/status";
import { locationById, locationStatus, newestTattoo, nextAvailableDay, nextStop, sortedTattoos, stopsForLocation, upcomingStops, hasPlaceholders } from "@/lib/selectors";
import { formatDayNum, formatMonDay, formatRange, formatWeekday, daysBetween } from "@/lib/dates";
import { ArtImage, Arrow, ButtonLink, Corners, Divider, SampleTag, Star, StatusBadge, StatusGlyph, cx } from "@/components/ui/primitives";
import { Wordmark } from "@/components/shell/AppShell";
import { Atlas } from "@/components/map/Atlas";

const ARCH = "M0,1 L0,0.36 C0,0.17 0.24,0.05 0.5,0 C0.76,0.05 1,0.17 1,0.36 L1,1 Z";

/** Lancet-arch frame: the one overtly gothic gesture, used once, on the hero. */
function ArchFrame({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div className={cx("relative", className)}>
      <svg width="0" height="0" className="absolute" aria-hidden>
        <clipPath id="arch" clipPathUnits="objectBoundingBox"><path d={ARCH} /></clipPath>
      </svg>
      <div className="absolute inset-0" style={{ clipPath: "url(#arch)" }}>{children}</div>
      <svg viewBox="0 0 1 1" preserveAspectRatio="none" className="pointer-events-none absolute inset-0 size-full" aria-hidden>
        <path d={ARCH} fill="none" stroke="rgb(214 214 219 / 0.35)" strokeWidth="1" vectorEffect="non-scaling-stroke" />
      </svg>
      <svg viewBox="0 0 1 1" preserveAspectRatio="none" className="pointer-events-none absolute -inset-3 size-[calc(100%+1.5rem)]" aria-hidden>
        <path d={ARCH} fill="none" stroke="rgb(214 214 219 / 0.12)" strokeWidth="1" vectorEffect="non-scaling-stroke" />
      </svg>
    </div>
  );
}

function Module({ label, children, href, cursor = "open", tag }: { label: string; children: ReactNode; href: string; cursor?: string; tag?: ReactNode }) {
  return (
    <AppLink href={href} data-cursor={cursor} className="group relative flex flex-col etched bg-stone/50 p-5 transition-colors hover:bg-white/[0.03] sm:p-6">
      <Corners />
      <span className="flex items-center justify-between gap-2">
        <span className="eyebrow">{label}</span>
        {tag}
      </span>
      {children}
      <Arrow className="absolute bottom-5 right-5 text-ash transition-all duration-500 group-hover:translate-x-1 group-hover:text-bone sm:bottom-6 sm:right-6" />
    </AppLink>
  );
}

export function HomeView() {
  const { snapshot, today } = useData();
  const featured = useMemo(() => snapshot.tattoos.filter((t) => t.featured), [snapshot]);
  const [i, setI] = useState(0);
  const [paused, setPaused] = useState(false);
  useEffect(() => {
    if (paused || featured.length < 2 || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const id = setInterval(() => setI((x) => (x + 1) % featured.length), 6500);
    return () => clearInterval(id);
  }, [paused, featured.length]);
  const hero = featured[i] ?? snapshot.tattoos[0];

  const stop = nextStop(snapshot, today);
  const stopLoc = stop && locationById(snapshot, stop.locationId);
  const avail = nextAvailableDay(snapshot, today);
  const availLoc = avail && locationById(snapshot, avail.locationId);
  const fresh = newestTattoo(snapshot);
  const sample = hasPlaceholders(snapshot);

  const { scrollY } = useScroll();
  const parallax = useTransform(scrollY, [0, 800], [0, 80]);

  return (
    <>
      {/* ── HERO ── */}
      <section className="relative overflow-hidden px-4 pb-14 pt-6 sm:px-8 lg:flex lg:min-h-dvh lg:flex-col lg:justify-center lg:px-14 lg:pb-20 lg:pt-12" aria-label="Introduction">
        <div className="grid w-full items-center gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,0.9fr)_minmax(300px,0.75fr)] lg:gap-12">
          {/* Identity */}
          <div className="order-1 text-center lg:order-none lg:text-left">
            <motion.h1 initial={{ opacity: 0, y: 14, filter: "blur(6px)" }} animate={{ opacity: 1, y: 0, filter: "blur(0px)" }} transition={{ duration: 1.1, ease: [0.22, 1, 0.36, 1] }}>
              <span className="sr-only">LOASH — tattoo artist in Windsor, Ontario</span>
              <Wordmark width={640} className="mx-auto w-[min(62vw,420px)] lg:mx-0 lg:w-full lg:max-w-[440px]" />
            </motion.h1>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5, duration: 1 }}>
              <p className="caps mt-4 text-[12px] tracking-[0.5em] text-mist sm:text-[13px] lg:mt-6">Tattoo Artist</p>
              <Divider className="mx-auto mt-4 hidden max-w-[16rem] sm:flex lg:mx-0 lg:mt-5" />
              <p className="mt-3 font-display text-[1.15rem] leading-snug text-mist sm:mt-5 sm:text-[1.45rem]">
                {snapshot.artist.styles.map((s) => STYLE_LABEL[s]).join(" · ")}
              </p>
              <p className="mt-2 font-mono text-[10.5px] uppercase tracking-[0.2em] text-ash">
                {snapshot.artist.homeCity} {snapshot.artist.byAppointmentOnly && "· By appointment only"}
              </p>
              <div className="mt-6 flex justify-center gap-2 lg:mt-8 lg:flex-wrap lg:justify-start [&>a]:max-sm:px-3.5 [&>a]:max-sm:text-[10px] [&>a]:max-sm:tracking-[0.14em]">
                <ButtonLink href="/work" variant="primary">Explore the work <Arrow /></ButtonLink>
                <ButtonLink href="/map" variant="ghost">Where I'll be</ButtonLink>
              </div>
            </motion.div>
          </div>

          {/* Featured artwork in an arch */}
          <motion.div style={{ y: parallax }} className="order-2 lg:order-none" onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)}>
            <AppLink href={withParams("/work", { piece: hero.slug })} data-cursor="view" aria-label={`View ${hero.title}`} className="block">
              <ArchFrame className="mx-auto aspect-[3/4.2] w-full max-w-[460px]">
                <AnimatePresence initial={false}>
                  <motion.div key={hero.id} className="absolute inset-0" initial={{ opacity: 0, scale: 1.06 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} transition={{ duration: 1.6, ease: [0.22, 1, 0.36, 1] }}>
                    <ArtImage image={hero.image} alt={hero.alt} sizes="(min-width:1024px) 34vw, 90vw" priority className="size-full" />
                  </motion.div>
                </AnimatePresence>
                <span className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-ink/80 to-transparent" />
              </ArchFrame>
            </AppLink>
            <div className="mx-auto mt-5 flex max-w-[460px] items-center justify-between">
              <AnimatePresence mode="wait">
                <motion.p key={hero.id} initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="font-display text-[1.15rem] italic text-mist">
                  {hero.title}
                </motion.p>
              </AnimatePresence>
              <div className="flex gap-1.5" role="tablist" aria-label="Featured pieces">
                {featured.map((f, j) => (
                  <button key={f.id} role="tab" aria-selected={j === i} aria-label={f.title} onClick={() => setI(j)} className={cx("h-[3px] transition-all duration-700", j === i ? "w-7 bg-silver" : "w-2.5 bg-white/20 hover:bg-white/50")} />
                ))}
              </div>
            </div>
          </motion.div>

          {/* Live board */}
          <div className="order-3 grid grid-cols-2 gap-2 lg:order-none lg:grid-cols-1 lg:gap-3">
            <div className="col-span-2 flex items-center justify-between lg:col-span-1">
              <span className="eyebrow flex items-center gap-2">
                <span className="relative flex size-1.5"><span className="absolute inset-0 animate-ping rounded-full bg-open opacity-60 motion-reduce:hidden" /><span className="relative size-1.5 rounded-full bg-open" /></span>
                Live
              </span>
              {sample && <SampleTag>Sample schedule</SampleTag>}
            </div>
            {stop && stopLoc && (
              <Module label="Next stop" href={withParams("/map", { loc: stop.locationId })} cursor="explore">
                <span className="display mt-3 text-[2rem] text-bone sm:text-[2.5rem]">{stopLoc.city}</span>
                <span className="mt-1 font-mono text-[11px] uppercase tracking-[0.14em] text-mist tabular">{formatRange(stop.startDate, stop.endDate)}</span>
                <StatusBadge status={stop.status} className="mt-3 !text-[9.5px] sm:!text-[10.5px]" pulse />
              </Module>
            )}
            {avail && availLoc && (
              <Module label="Next available" href={withParams("/book", { stop: avail.stopId, date: avail.date })}>
                <span className="mt-3 flex items-baseline gap-2">
                  <span className="display text-[2rem] text-bone tabular sm:text-[2.5rem]">{formatMonDay(avail.date)}</span>
                  <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-ash">{formatWeekday(avail.date)}</span>
                </span>
                <span className="mt-1 font-mono text-[11px] uppercase tracking-[0.14em] text-mist">{availLoc.city}</span>
                <span className="mt-3 font-mono text-[9.5px] uppercase tracking-[0.16em] text-ash sm:text-[10.5px]">
                  {(() => { const n = daysBetween(today, avail.date); return n <= 0 ? "Today" : n === 1 ? "Tomorrow" : `In ${n} days`; })()}
                </span>
              </Module>
            )}
            {fresh && (
              <AppLink href={withParams("/work", { piece: fresh.slug })} data-cursor="view" className="group relative col-span-2 flex gap-4 etched bg-stone/50 p-3 transition-colors hover:bg-white/[0.03] lg:col-span-1">
                <Corners />
                <ArtImage image={fresh.image} alt={fresh.alt} sizes="96px" className="w-20 shrink-0 sm:w-24" style={{ aspectRatio: "4/5" }} />
                <span className="flex flex-col justify-center pr-6">
                  <span className="eyebrow">New work</span>
                  <span className="mt-2 font-display text-[1.35rem] leading-tight text-bone">{fresh.title}</span>
                  <span className="mt-1 font-mono text-[9.5px] uppercase tracking-[0.14em] text-ash">{fresh.styles.slice(0, 2).map((s) => STYLE_LABEL[s]).join(" · ")}</span>
                </span>
                <Arrow className="absolute bottom-4 right-4 text-ash transition-all duration-500 group-hover:translate-x-1 group-hover:text-bone" />
              </AppLink>
            )}
          </div>
        </div>
        <a href="#archive" className="absolute bottom-6 left-1/2 hidden -translate-x-1/2 flex-col items-center gap-2 font-mono text-[9.5px] uppercase tracking-[0.3em] text-ash hover:text-bone lg:flex">
          The archive
          <motion.span aria-hidden className="block h-8 w-px bg-gradient-to-b from-silver/70 to-transparent" animate={{ scaleY: [0.3, 1, 0.3], originY: 0 }} transition={{ duration: 2.6, repeat: Infinity, ease: "easeInOut" }} />
        </a>
      </section>

      <ArchiveRail />
      <WhereStrip />
      <Process />
      <Footer />
    </>
  );
}

function SectionHead({ numeral, eyebrow, title, action }: { numeral: string; eyebrow: string; title: string; action?: ReactNode }) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-4">
      <div>
        <p className="eyebrow flex items-center gap-2"><Star size={8} /> {numeral} — {eyebrow}</p>
        <h2 className="display mt-3 text-[2.6rem] text-bone sm:text-[3.6rem]">{title}</h2>
      </div>
      {action}
    </div>
  );
}

function ArchiveRail() {
  const { snapshot } = useData();
  const pieces = sortedTattoos(snapshot);
  return (
    <section id="archive" className="scroll-mt-4 border-t border-[var(--line)] py-16 lg:py-24" aria-labelledby="rail-title">
      <div className="px-4 sm:px-8 lg:px-14">
        <SectionHead numeral="I" eyebrow="The archive" title="Explore the work" action={<ButtonLink href="/work" variant="ghost">All {pieces.length} pieces <Arrow /></ButtonLink>} />
      </div>
      <ul className="no-scrollbar mt-10 flex snap-x snap-mandatory items-end gap-4 overflow-x-auto px-4 pb-2 sm:px-8 lg:gap-6 lg:px-14">
        {pieces.map((t, n) => (
          <li key={t.id} className="snap-start">
            <AppLink href={withParams("/work", { piece: t.slug })} data-cursor="view" className="group block">
              <ArtImage
                image={t.image}
                alt={t.alt}
                sizes="(min-width:1024px) 22vw, 60vw"
                className={cx("transition-transform duration-[1200ms] ease-[var(--ease-ink)] group-hover:-translate-y-1.5", n % 3 === 0 ? "h-[52vw] max-h-[460px] sm:h-[360px]" : n % 3 === 1 ? "h-[44vw] max-h-[380px] sm:h-[300px]" : "h-[48vw] max-h-[420px] sm:h-[330px]")}
                style={{ aspectRatio: `${t.image.width}/${t.image.height}` }}
              />
              <span className="mt-3 flex items-baseline gap-2.5">
                <span className="font-display text-[12px] italic text-ash tabular">{String(n + 1).padStart(2, "0")}</span>
                <span className="font-display text-[1.1rem] text-mist group-hover:text-bone">{t.title}</span>
              </span>
            </AppLink>
          </li>
        ))}
        <li className="snap-start self-center pr-8">
          <AppLink href="/work" className="grid size-40 place-items-center border border-[var(--line-strong)] text-center transition-colors hover:bg-white/[0.03]">
            <span><Star size={12} className="mx-auto text-silver" /><span className="mt-3 block font-mono text-[10px] uppercase tracking-[0.2em] text-mist">Open the archive</span></span>
          </AppLink>
        </li>
      </ul>
    </section>
  );
}

function WhereStrip() {
  const { snapshot, today } = useData();
  const [sel, setSel] = useState<string | null>(null);
  const markers = snapshot.locations.map((l) => {
    const st = stopsForLocation(snapshot, l.id, today)[0];
    return { location: l, status: locationStatus(snapshot, l.id, today), sub: st ? formatRange(st.startDate, st.endDate) : "" };
  });
  const stops = upcomingStops(snapshot, today).filter((s) => s.status !== "closed").slice(0, 4);
  return (
    <section className="border-t border-[var(--line)] px-4 py-16 sm:px-8 lg:px-14 lg:py-24" aria-labelledby="where-title">
      <SectionHead numeral="II" eyebrow="Movement" title="Where I'll be" action={<ButtonLink href="/map" variant="ghost">Open the map <Arrow /></ButtonLink>} />
      <div className="mt-10 grid gap-6 lg:grid-cols-[1.3fr_1fr]">
        <div className="relative h-[320px] etched sm:h-[420px]">
          <Atlas markers={markers} selectedId={sel} onSelect={setSel} compact className="absolute inset-0" />
          <Corners />
        </div>
        <ol className="flex flex-col">
          {stops.map((s) => {
            const l = locationById(snapshot, s.locationId)!;
            return (
              <li key={s.id}>
                <AppLink href={withParams("/map", { loc: s.locationId })} data-cursor="explore" onMouseEnter={() => setSel(s.locationId)} onMouseLeave={() => setSel(null)} className="group grid grid-cols-[3.2rem_1fr_auto] items-center gap-4 border-b border-[var(--line)] py-4">
                  <span className="text-center">
                    <span className="block font-mono text-[9px] uppercase tracking-[0.16em] text-ash">{s.startDate ? formatWeekday(s.startDate) : ""}</span>
                    <span className="block font-display text-[1.8rem] leading-none text-bone tabular">{s.startDate ? formatDayNum(s.startDate) : "—"}</span>
                  </span>
                  <span>
                    <span className="flex items-center gap-2"><span className="caps text-[14px] tracking-[0.22em] text-bone">{l.city}</span>{s.isPlaceholder && <SampleTag />}</span>
                    <span className="mt-1 block font-mono text-[10px] uppercase tracking-[0.14em] text-ash">{formatRange(s.startDate, s.endDate)}</span>
                  </span>
                  <span className="flex items-center gap-2 font-mono text-[9.5px] uppercase tracking-[0.14em]" style={{ color: STATUS[s.status].token }}>
                    <StatusGlyph status={s.status} /> <span className="hidden sm:inline">{STATUS[s.status].short}</span>
                  </span>
                </AppLink>
              </li>
            );
          })}
          <li className="mt-auto pt-6">
            <ButtonLink href="/schedule" variant="quiet" className="px-0">Full schedule <Arrow /></ButtonLink>
          </li>
        </ol>
      </div>
    </section>
  );
}

function Process() {
  const steps = [
    { t: "Request", d: "Tell me the idea, placement, size and where you'd like to sit — or start from a piece in the archive." },
    { t: "Review", d: "I read it, ask anything I need, and let you know if it's a fit for my style." },
    { t: "Deposit", d: "Once we agree on the piece and a date, a deposit holds your appointment." },
    { t: "Session", d: "We refine the stencil together on the day, then get to work." },
  ];
  return (
    <section className="border-t border-[var(--line)] px-4 py-16 sm:px-8 lg:px-14 lg:py-24" aria-labelledby="process-title">
      <SectionHead numeral="III" eyebrow="How it works" title="From idea to ink" />
      <ol className="mt-10 grid gap-px bg-[var(--line)] sm:grid-cols-2 lg:grid-cols-4">
        {steps.map((s, i) => (
          <li key={s.t} className="bg-ink p-6 lg:p-8">
            <span className="font-display text-[2.6rem] italic leading-none text-ash/60">{["I", "II", "III", "IV"][i]}</span>
            <h3 className="caps mt-5 text-[14px] tracking-[0.26em] text-bone">{s.t}</h3>
            <p className="mt-3 text-[14px] text-ash">{s.d}</p>
          </li>
        ))}
      </ol>
      <div className="mt-12 flex flex-col items-center gap-4 text-center">
        <p className="display text-[2rem] text-mist sm:text-[2.6rem]">Ready when you are.</p>
        <ButtonLink href="/book" variant="primary">Request a tattoo <Star size={9} /></ButtonLink>
      </div>
    </section>
  );
}

export function Footer() {
  const { snapshot } = useData();
  return (
    <footer className="border-t border-[var(--line)] px-4 py-12 sm:px-8 lg:px-14">
      <div className="flex flex-col items-center gap-6 text-center lg:flex-row lg:justify-between lg:text-left">
        <Wordmark className="w-28 opacity-80" />
        <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-ash">
          {snapshot.artist.homeCity} · By appointment only
        </p>
        <div className="flex gap-5">
          {snapshot.artist.socials.map((s) => (
            <a key={s.label} href={s.href} target="_blank" rel="noreferrer" className="font-mono text-[10px] uppercase tracking-[0.2em] text-mist hover:text-bone">{s.label} {s.handle}</a>
          ))}
        </div>
      </div>
      <p className="mt-8 text-center font-mono text-[9.5px] uppercase tracking-[0.2em] text-ash/60">© {new Date().getFullYear()} Loash · All work shown is original work by Loash</p>
    </footer>
  );
}
