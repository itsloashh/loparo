"use client";
import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { AnimatePresence, motion, useScroll, useTransform } from "motion/react";
import { AppLink, useData, useNav, withParams } from "@/lib/app-context";
import { STATUS, STYLE_LABEL } from "@/lib/status";
import { hereNow, locationById, locationStatus, newestTattoo, nextAvailableDay, nextStop, sortedTattoos, stopsForLocation, upcomingStops, hasPlaceholders } from "@/lib/selectors";
import { StopLine } from "@/components/schedule/StopRow";
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
        <path d={ARCH} fill="none" stroke="rgb(214 214 219 / 0.4)" strokeWidth="1" vectorEffect="non-scaling-stroke" />
      </svg>
      <svg viewBox="0 0 1 1" preserveAspectRatio="none" className="pointer-events-none absolute -inset-2.5 size-[calc(100%+1.25rem)] max-sm:hidden" aria-hidden>
        <path d={ARCH} fill="none" stroke="rgb(201 169 106 / 0.28)" strokeWidth="1" vectorEffect="non-scaling-stroke" />
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
      <section className="relative overflow-hidden px-4 pb-14 pt-6 sm:px-8 md:pt-10 lg:px-14 lg:pb-24 2xl:flex 2xl:min-h-dvh 2xl:flex-col 2xl:justify-center 2xl:pb-20 2xl:pt-12" aria-label="Introduction">
        <div className="grid w-full items-center gap-10 md:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)] md:gap-x-10 md:gap-y-12 lg:gap-x-14 2xl:grid-cols-[minmax(0,1fr)_minmax(0,0.9fr)_minmax(320px,0.72fr)] 2xl:gap-12">
          {/* Identity */}
          <div className="order-1 text-center md:text-left">
            <motion.h1 initial={{ opacity: 0, y: 14, filter: "blur(6px)" }} animate={{ opacity: 1, y: 0, filter: "blur(0px)" }} transition={{ duration: 1.1, ease: [0.22, 1, 0.36, 1] }}>
              <span className="sr-only">LOASH — tattoo artist in Windsor, Ontario</span>
              <Wordmark width={640} className="mx-auto w-[min(64vw,380px)] md:mx-0 md:w-full md:max-w-[440px]" />
            </motion.h1>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5, duration: 1 }}>
              <p className="caps mt-4 text-[13px] tracking-[0.5em] text-bone md:mt-6">Tattoo Artist</p>
              <Divider className="mx-auto mt-4 max-w-[14rem] md:mx-0 md:mt-5" />
              <p className="mt-4 font-display text-[1.2rem] leading-snug text-mist sm:text-[1.45rem] md:mt-5">
                {snapshot.artist.styles.map((s) => STYLE_LABEL[s]).join(" · ")}
              </p>
              <p className="mt-2 text-[13.5px] text-ash">
                {snapshot.artist.homeCity}{snapshot.artist.byAppointmentOnly && <> · <span className="text-gold">By appointment only</span></>}
              </p>
              <div className="mt-7 flex flex-wrap justify-center gap-2 md:mt-8 md:justify-start [&>a]:max-sm:flex-1 [&>a]:max-sm:px-3 [&>a]:max-sm:text-[11px] [&>a]:max-sm:tracking-[0.12em]">
                <ButtonLink href="/work" variant="primary">Explore the work <Arrow /></ButtonLink>
                <ButtonLink href="/map" variant="ghost">Where I'll be</ButtonLink>
              </div>
            </motion.div>
          </div>

          {/* Featured artwork in an arch */}
          <motion.div style={{ y: parallax }} className="order-2 px-3 sm:px-0" onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)}>
            <AppLink href={withParams("/work", { piece: hero.slug })} data-cursor="view" aria-label={`View ${hero.title}`} className="block">
              <ArchFrame className="mx-auto aspect-[3/4.1] w-full max-w-[340px] sm:max-w-[420px] 2xl:max-w-[460px]">
                <AnimatePresence initial={false}>
                  <motion.div key={hero.id} className="absolute inset-0" initial={{ opacity: 0, scale: 1.06 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} transition={{ duration: 1.6, ease: [0.22, 1, 0.36, 1] }}>
                    <ArtImage image={hero.image} alt={hero.alt} sizes="(min-width:1536px) 30vw, (min-width:768px) 42vw, 90vw" priority className="size-full" />
                  </motion.div>
                </AnimatePresence>
                <span className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-ink/80 to-transparent" />
              </ArchFrame>
            </AppLink>
            <div className="mx-auto mt-5 flex max-w-[340px] items-center justify-between gap-3 sm:max-w-[420px] 2xl:max-w-[460px]">
              <AnimatePresence mode="wait">
                <motion.p key={hero.id} initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="font-display text-[1.15rem] italic text-mist">
                  {hero.title}
                </motion.p>
              </AnimatePresence>
              <div className="flex gap-1.5" role="tablist" aria-label="Featured pieces">
                {featured.map((f, j) => (
                  <button key={f.id} role="tab" aria-selected={j === i} aria-label={f.title} onClick={() => setI(j)} className={cx("h-[3px] transition-all duration-700", j === i ? "w-7 bg-gold" : "w-2.5 bg-white/25 hover:bg-white/50")} />
                ))}
              </div>
            </div>
          </motion.div>

          {/* Live board */}
          <div className="order-3 grid grid-cols-2 gap-2 md:col-span-2 md:grid-cols-3 md:gap-3 2xl:col-span-1 2xl:grid-cols-1">
            <div className="col-span-2 flex items-center justify-between md:col-span-3 2xl:col-span-1">
              <span className="eyebrow flex items-center gap-2">
                <span className="relative flex size-1.5"><span className="absolute inset-0 animate-ping rounded-full bg-gold opacity-60 motion-reduce:hidden" /><span className="relative size-1.5 rounded-full bg-gold" /></span>
                Live
              </span>
              {sample && <SampleTag>Sample schedule</SampleTag>}
            </div>
            {stop && stopLoc && (
              <Module label="Next stop" href={withParams("/map", { loc: stop.locationId })} cursor="explore">
                <span className="display mt-3 text-[1.9rem] text-bone sm:text-[2.4rem]">{stopLoc.city}</span>
                <span className="mt-1 text-[13.5px] text-mist tabular">{formatRange(stop.startDate, stop.endDate)}</span>
                <span className="mt-3 pr-6">
                  <span className="sm:hidden"><StatusBadge status={stop.status} short pulse /></span>
                  <span className="hidden sm:inline"><StatusBadge status={stop.status} pulse /></span>
                </span>
              </Module>
            )}
            {avail && availLoc && (
              <Module label="Next available" href={withParams("/book", { stop: avail.stopId, date: avail.date })}>
                <span className="mt-3 flex flex-wrap items-baseline gap-x-2">
                  <span className="display text-[1.9rem] text-bone tabular sm:text-[2.4rem]">{formatMonDay(avail.date)}</span>
                  <span className="font-display text-[15px] italic text-gold">{formatWeekday(avail.date)}</span>
                </span>
                <span className="mt-1 text-[13.5px] text-mist">{availLoc.city}</span>
                <span className="mt-3 pr-6 text-[13px] font-medium text-open">
                  {(() => { const n = daysBetween(today, avail.date); return n <= 0 ? "Today" : n === 1 ? "Tomorrow" : `In ${n} days`; })()}
                </span>
              </Module>
            )}
            {fresh && (
              <AppLink href={withParams("/work", { piece: fresh.slug })} data-cursor="view" className="group relative col-span-2 flex gap-4 etched bg-stone/50 p-3 transition-colors hover:bg-white/[0.03] md:col-span-1">
                <Corners />
                <ArtImage image={fresh.image} alt={fresh.alt} sizes="96px" className="w-20 shrink-0 sm:w-24" style={{ aspectRatio: "4/5" }} />
                <span className="flex flex-col justify-center pr-6">
                  <span className="eyebrow">New work</span>
                  <span className="mt-2 font-display text-[1.35rem] leading-tight text-bone">{fresh.title}</span>
                  <span className="mt-1 text-[13px] text-ash">{fresh.styles.slice(0, 2).map((s) => STYLE_LABEL[s]).join(" · ")}</span>
                </span>
                <Arrow className="absolute bottom-4 right-4 text-ash transition-all duration-500 group-hover:translate-x-1 group-hover:text-bone" />
              </AppLink>
            )}
          </div>
        </div>
        <a href="#archive" className="absolute bottom-6 left-1/2 hidden -translate-x-1/2 flex-col items-center gap-2 font-mono text-[11px] uppercase tracking-[0.3em] text-ash hover:text-gold-bright 2xl:flex">
          The archive
          <motion.span aria-hidden className="block h-8 w-px bg-gradient-to-b from-gold/80 to-transparent" animate={{ scaleY: [0.3, 1, 0.3], originY: 0 }} transition={{ duration: 2.6, repeat: Infinity, ease: "easeInOut" }} />
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
  const rail = useRef<HTMLUListElement>(null);
  const [edge, setEdge] = useState({ start: true, end: false, progress: 0 });

  const measure = useCallback(() => {
    const el = rail.current;
    if (!el) return;
    const max = el.scrollWidth - el.clientWidth;
    setEdge({ start: el.scrollLeft < 8, end: el.scrollLeft > max - 8, progress: max > 0 ? el.scrollLeft / max : 0 });
  }, []);
  useEffect(() => {
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, [measure]);

  const page = (dir: 1 | -1) => {
    const el = rail.current;
    if (!el) return;
    el.scrollBy({ left: dir * el.clientWidth * 0.8, behavior: "smooth" });
  };

  const arrowCls = "grid size-12 place-items-center rounded-full border border-gold/40 bg-ink/70 text-gold backdrop-blur transition-all hover:border-gold hover:text-gold-bright disabled:pointer-events-none disabled:opacity-25";

  return (
    <section id="archive" className="scroll-mt-4 border-t border-[var(--line)] py-16 lg:py-24" aria-labelledby="rail-title">
      <div className="px-4 sm:px-8 lg:px-14">
        <SectionHead
          numeral="I"
          eyebrow="The archive"
          title="Explore the work"
          action={
            <div className="flex items-center gap-3">
              <div className="hidden gap-2 md:flex">
                <button type="button" onClick={() => page(-1)} disabled={edge.start} className={arrowCls} aria-label="Previous pieces"><Arrow dir="left" /></button>
                <button type="button" onClick={() => page(1)} disabled={edge.end} className={arrowCls} aria-label="More pieces"><Arrow /></button>
              </div>
              <ButtonLink href="/work" variant="ghost">All {pieces.length} pieces <Arrow /></ButtonLink>
            </div>
          }
        />
      </div>
      <ul
        ref={rail}
        onScroll={measure}
        className="no-scrollbar mt-10 flex snap-x snap-mandatory scroll-px-4 items-end gap-4 overflow-x-auto overscroll-x-contain px-4 pb-2 sm:scroll-px-8 sm:px-8 lg:scroll-px-14 lg:gap-6 lg:px-14"
      >
        {pieces.map((t, n) => (
          <li key={t.id} className="shrink-0 snap-start">
            <AppLink href={withParams("/work", { piece: t.slug })} data-cursor="view" className="group block">
              <ArtImage
                image={t.image}
                alt={t.alt}
                sizes="(min-width:1024px) 22vw, 70vw"
                className={cx(
                  "transition-transform duration-[1200ms] ease-[var(--ease-ink)] group-hover:-translate-y-1.5",
                  // phones: one even height so swiping feels steady; larger screens: staggered heights
                  "h-[min(88vw,380px)] sm:h-[300px]",
                  n % 3 === 0 ? "md:h-[360px]" : n % 3 === 1 ? "md:h-[300px]" : "md:h-[330px]",
                )}
                style={{ aspectRatio: `${t.image.width}/${t.image.height}` }}
              />
              <span className="mt-3 flex items-baseline gap-2.5">
                <span className="font-display text-[13px] italic text-gold tabular">{String(n + 1).padStart(2, "0")}</span>
                <span className="font-display text-[1.15rem] text-mist group-hover:text-bone">{t.title}</span>
              </span>
            </AppLink>
          </li>
        ))}
        <li className="shrink-0 snap-start self-center pr-8">
          <AppLink href="/work" className="grid size-40 place-items-center border border-gold/40 text-center transition-colors hover:bg-gold/[0.06]">
            <span><Star size={12} className="mx-auto text-gold" /><span className="mt-3 block font-mono text-[11px] uppercase tracking-[0.2em] text-mist">Open the archive</span></span>
          </AppLink>
        </li>
      </ul>
      {/* progress + swipe hint */}
      <div className="mt-6 flex items-center gap-4 px-4 sm:px-8 lg:px-14">
        <div className="relative h-px flex-1 bg-[var(--line-strong)]">
          <span className="absolute inset-y-0 left-0 bg-gold transition-[width] duration-300" style={{ width: `${Math.max(8, edge.progress * 100)}%` }} />
        </div>
        <span className="font-display text-[14px] italic text-ash md:hidden">Swipe</span>
      </div>
    </section>
  );
}

function WhereStrip() {
  const { snapshot, today } = useData();
  const { Link } = useNav();
  const [sel, setSel] = useState<string | null>(null);
  const here = hereNow(snapshot, today);
  const markers = snapshot.locations.map((l) => {
    const st = stopsForLocation(snapshot, l.id, today)[0];
    return { location: l, status: locationStatus(snapshot, l.id, today), sub: st ? formatRange(st.startDate, st.endDate) : "" };
  });
  const stops = upcomingStops(snapshot, today).filter((s) => s.status !== "closed").slice(0, 4);
  return (
    <section className="border-t border-[var(--line)] px-4 py-16 sm:px-8 lg:px-14 lg:py-24" aria-labelledby="where-title">
      <SectionHead numeral="II" eyebrow="Movement" title="Where I'll be" action={<ButtonLink href="/map" variant="ghost">Open the map <Arrow /></ButtonLink>} />
      <div className="mt-10 grid gap-8 lg:grid-cols-[1.3fr_1fr]">
        <div className="relative h-[340px] etched sm:h-[440px]">
          <Atlas
            markers={markers}
            selectedId={sel}
            onSelect={setSel}
            hereId={here?.location.id}
            compact
            className="absolute inset-0"
            popover={(m) => <PinCard locationId={m.location.id} onClose={() => setSel(null)} />}
          />
          <Corners />
          {!sel && <p className="pointer-events-none absolute bottom-3 left-4 font-display text-[14px] italic text-mist/80">Tap a city for dates</p>}
        </div>
        <ol className="flex flex-col">
          {stops.map((s) => (
            <li key={s.id} onMouseEnter={() => setSel(s.locationId)}>
              <StopLine stop={s} href={withParams("/map", { loc: s.locationId })} Link={Link as never} compact />
            </li>
          ))}
          <li className="mt-auto pt-6">
            <ButtonLink href="/schedule" variant="quiet" className="px-0">Full schedule <Arrow /></ButtonLink>
          </li>
        </ol>
      </div>
    </section>
  );
}

/** Small card that opens beside a pin on the home map. */
function PinCard({ locationId, onClose }: { locationId: string; onClose: () => void }) {
  const { snapshot, today } = useData();
  const l = locationById(snapshot, locationId);
  const st = stopsForLocation(snapshot, locationId, today).filter((x) => x.status !== "closed")[0];
  const here = hereNow(snapshot, today)?.location.id === locationId;
  if (!l) return null;
  return (
    <div className="relative border border-gold/40 bg-[#0d0c0a]/95 p-4 shadow-2xl shadow-black/70 backdrop-blur">
      <button onClick={onClose} className="absolute right-2 top-2 grid size-7 place-items-center text-ash hover:text-bone" aria-label="Close">×</button>
      <p className="eyebrow">{here ? "Here now" : l.isHome ? "Home base" : "Guest city"}</p>
      <p className="mt-1.5 font-display text-[1.7rem] leading-none text-bone">{l.city}<span className="text-ash">, {l.region}</span></p>
      {st ? (
        <>
          <p className="mt-2 font-display text-[1.1rem] italic text-gold">{formatRange(st.startDate, st.endDate)}</p>
          <StatusBadge status={st.status} className="mt-2" />
        </>
      ) : (
        <p className="mt-2 text-[13px] text-ash">No dates announced yet.</p>
      )}
      <div className="mt-4 flex gap-2">
        <ButtonLink href={withParams("/map", { loc: l.id })} variant="ghost" className="h-9 flex-1 px-2 text-[11px] tracking-[0.12em]">Details</ButtonLink>
        {st && STATUS[st.status].bookable && (
          <ButtonLink href={withParams("/book", { stop: st.id })} variant="primary" className="h-9 flex-1 px-2 text-[11px] tracking-[0.12em]">Request</ButtonLink>
        )}
      </div>
    </div>
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
            <span className="font-display text-[2.6rem] italic leading-none text-gold/80">{["I", "II", "III", "IV"][i]}</span>
            <h3 className="caps mt-5 text-[14px] tracking-[0.26em] text-bone">{s.t}</h3>
            <p className="mt-3 text-[14.5px] leading-relaxed text-mist">{s.d}</p>
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
        <p className="text-[13.5px] text-ash">
          {snapshot.artist.homeCity} · <span className="text-gold">By appointment only</span>
        </p>
        <div className="flex items-center gap-5">
          {snapshot.artist.socials.map((s) => (
            <a key={s.label} href={s.href} target="_blank" rel="noreferrer" className="font-mono text-[11px] uppercase tracking-[0.2em] text-mist hover:text-gold-bright">{s.label} {s.handle}</a>
          ))}
          <a href="/admin" className="font-mono text-[11px] uppercase tracking-[0.2em] text-ash hover:text-gold-bright">Admin</a>
        </div>
      </div>
      <p className="mt-8 text-center font-mono text-[11px] uppercase tracking-[0.2em] text-ash/60">© {new Date().getFullYear()} Loash · All work shown is original work by Loash</p>
    </footer>
  );
}
