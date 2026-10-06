"use client";
import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import type { AvailabilityDay, Location, Stop } from "@/lib/types";
import { KIND_LABEL, STATUS } from "@/lib/status";
import { useData, useNav, withParams } from "@/lib/app-context";
import { daysForStop, hereNow, isActive, locationById, locationStatus, stopsForLocation, upcomingStops } from "@/lib/selectors";
import { formatLong, formatMonDay, formatMonth, formatRange } from "@/lib/dates";
import { StopLine, capacityLine } from "@/components/schedule/StopRow";
import { Arrow, ButtonLink, Corners, SampleTag, Star, StatusBadge, cx } from "@/components/ui/primitives";
import { DayStrip, Legend } from "@/components/schedule/DayStrip";
import { Atlas, type AtlasMarker } from "./Atlas";
import { FollowForm } from "./FollowForm";

export function MapView() {
  const { snapshot, today } = useData();
  const nav = useNav();
  const [selected, setSelected] = useState<string | null>(nav.search.get("loc"));
  useEffect(() => setSelected(nav.search.get("loc")), [nav.search]);

  const select = (id: string | null) => {
    setSelected(id);
    nav.replace(withParams("/map", { loc: id }));
  };

  const markers: AtlasMarker[] = useMemo(
    () =>
      snapshot.locations.map((l) => {
        const st = stopsForLocation(snapshot, l.id, today);
        const first = st.find((x) => x.status !== "closed") ?? st[0];
        return { location: l, status: locationStatus(snapshot, l.id, today), sub: first ? formatRange(first.startDate, first.endDate) : "No dates yet" };
      }),
    [snapshot, today],
  );
  const loc = selected ? locationById(snapshot, selected) : undefined;
  const here = hereNow(snapshot, today);

  return (
    <section aria-labelledby="map-title" className="relative h-[calc(100dvh-var(--topbar-h)-var(--tabbar-h)-env(safe-area-inset-bottom))] lg:h-dvh">
      <h1 id="map-title" className="sr-only">Where I'll be — map</h1>
      <Atlas markers={markers} selectedId={selected} onSelect={select} hereId={here?.location.id} className="absolute inset-0" />

      {/* Desktop panel */}
      <div className="pointer-events-none absolute inset-y-0 left-0 hidden w-[392px] p-6 lg:block">
        <div className="pointer-events-auto relative flex max-h-full flex-col overflow-hidden panel etched">
          <Corners />
          <AnimatePresence mode="wait" initial={false}>
            {loc ? (
              <motion.div key={loc.id} initial={{ opacity: 0, x: 24 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -24 }} transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }} className="overflow-y-auto">
                <LocationDetail location={loc} onBack={() => select(null)} />
              </motion.div>
            ) : (
              <motion.div key="list" initial={{ opacity: 0, x: -24 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 24 }} transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }} className="overflow-y-auto">
                <StopList onPick={select} />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Legend */}
      <div className="absolute bottom-6 right-6 hidden items-center gap-5 border border-[var(--line)] bg-ink/80 px-4 py-3 backdrop-blur lg:flex">
        {here && (
          <span className="flex items-center gap-2 text-[12px] font-medium text-gold-bright">
            <span className="here-glow size-2.5 rotate-45 bg-gold" /> Here now · {here.location.city}
          </span>
        )}
        <Legend />
      </div>

      {/* Mobile sheet */}
      <MobileSheet selected={loc} onPick={select} />
    </section>
  );
}

function StopList({ onPick, dense }: { onPick: (id: string) => void; dense?: boolean }) {
  const { snapshot, today } = useData();
  const stops = upcomingStops(snapshot, today);
  const here = hereNow(snapshot, today);
  let lastMonth = "";
  return (
    <div className={cx(dense ? "px-4 pb-6" : "p-6")}>
      {!dense && (
        <>
          <p className="eyebrow flex items-center gap-2"><Star size={8} /> II — The map</p>
          <h2 className="display mt-3 text-[2.7rem] text-bone">Where I'll be</h2>
          <p className="mt-2 font-display text-[1.15rem] italic leading-snug text-mist">Home studio, guest spots and the road. Choose a city to see its open days.</p>
        </>
      )}
      {here && (
        <button onClick={() => onPick(here.location.id)} className={cx("flex w-full items-center gap-3 border border-gold/40 bg-gold/[0.06] px-4 py-3 text-left", !dense && "mt-5")}>
          <span className="here-glow size-2.5 shrink-0 rotate-45 bg-gold" />
          <span className="text-[13.5px] text-bone">
            {here.stop ? "Tattooing now in " : "In the studio in "}<span className="font-display text-[1.15rem] text-gold-bright">{here.location.city}</span>
          </span>
        </button>
      )}
      <ol className="mt-2">
        {stops.map((st) => {
          const m = st.startDate ? formatMonth(st.startDate) : "Dates to be announced";
          const header = m !== lastMonth ? m : null;
          lastMonth = m;
          return (
            <li key={st.id}>
              {header && <p className="mt-6 font-display text-[1.25rem] italic text-gold first:mt-4">{header}</p>}
              <StopLine stop={st} onClick={() => onPick(st.locationId)} compact={dense} />
            </li>
          );
        })}
      </ol>
    </div>
  );
}

export function LocationDetail({ location, onBack }: { location: Location; onBack?: () => void }) {
  const { snapshot, today } = useData();
  const stops = stopsForLocation(snapshot, location.id, today);
  const [showFollow, setShowFollow] = useState(false);
  const status = locationStatus(snapshot, location.id, today);
  const anyBookable = stops.some((s) => STATUS[s.status].bookable);

  return (
    <div className="p-5 lg:p-6">
      {onBack && (
        <button onClick={onBack} className="mb-5 hidden items-center gap-2 text-[13px] text-ash hover:text-gold-bright lg:flex">
          <Arrow dir="left" /> All stops
        </button>
      )}
      <p className="eyebrow">{location.isHome ? "Home base" : location.country === "US" ? "Across the border" : "On the road"}</p>
      <h2 className="display mt-2 text-[2.6rem] text-bone lg:text-[3rem]">{location.city}<span className="text-ash">, {location.region}</span></h2>
      {stops.some((s) => isActive(s, today)) ? (
        <p className="here-glow mt-3 text-[13px] font-medium uppercase tracking-[0.16em] text-gold-bright">Here now</p>
      ) : (
        <StatusBadge status={status} className="mt-3" pulse />
      )}

      <div className="mt-6 space-y-4">
        {stops.length === 0 && <p className="text-[14px] text-ash">No dates here yet. Follow the city to hear first.</p>}
        {stops.map((st) => <StopCard key={st.id} stop={st} />)}
      </div>

      <div className="mt-6 grid grid-cols-2 gap-2">
        <ButtonLink href={withParams("/schedule", { loc: location.id })} variant="ghost" className="px-2 text-[11px] tracking-[0.14em]">Schedule</ButtonLink>
        {anyBookable ? (
          <ButtonLink href={withParams("/book", { stop: stops.find((s) => STATUS[s.status].bookable)!.id })} variant="primary" className="px-2 text-[11px] tracking-[0.14em]">Request here</ButtonLink>
        ) : (
          <button onClick={() => setShowFollow((v) => !v)} className="sweep h-11 border border-[var(--line-strong)] px-3 font-mono text-[12px] uppercase tracking-[0.2em] text-bone">
            Notify me
          </button>
        )}
      </div>
      {anyBookable && (
        <button onClick={() => setShowFollow((v) => !v)} className="mt-3 w-full text-[13px] text-ash underline decoration-[var(--line-strong)] underline-offset-4 hover:text-gold-bright" aria-expanded={showFollow}>
          {showFollow ? "Hide" : "Follow this city"}
        </button>
      )}
      <AnimatePresence>
        {showFollow && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
            <FollowForm preselect={[location.id]} className="mt-3" />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function StopCard({ stop }: { stop: Stop }) {
  const { snapshot } = useData();
  const days = daysForStop(snapshot, stop.id);
  const [day, setDay] = useState<AvailabilityDay | null>(null);
  const capacity = capacityLine(stop);
  return (
    <article className="relative border border-[var(--line)] bg-ink/40 p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="font-display text-[1.75rem] leading-none text-bone">{formatRange(stop.startDate, stop.endDate)}</p>
          <p className="mt-1.5 text-[13px] text-ash">{KIND_LABEL[stop.kind]}{stop.venue ? ` · ${stop.venue}` : ""}</p>
        </div>
        {stop.isPlaceholder && <SampleTag />}
      </div>
      <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1">
        <StatusBadge status={stop.status} />
        {capacity && <span className="text-[13px] text-mist">{capacity}</span>}
      </div>
      {days.length > 0 && stop.status !== "closed" && (
        <div className="mt-4">
          <DayStrip days={days} size="sm" selected={day?.date} onPick={(d) => setDay(day?.date === d.date ? null : d)} />
          <AnimatePresence>
            {day && (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
                <div className="mt-3 flex items-center justify-between gap-3 border-t border-[var(--line)] pt-3">
                  <div>
                    <p className="text-[13px] text-bone">{formatLong(day.date)}</p>
                    <StatusBadge status={day.status} className="mt-1" />
                  </div>
                  {STATUS[day.status].bookable && (
                    <ButtonLink href={withParams("/book", { stop: stop.id, date: day.date })} variant="primary" className="h-9 px-3 text-[11px]">Request {formatMonDay(day.date)}</ButtonLink>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}
    </article>
  );
}

function MobileSheet({ selected, onPick }: { selected?: Location; onPick: (id: string | null) => void }) {
  const [expanded, setExpanded] = useState(false);
  useEffect(() => setExpanded(!!selected), [selected]);
  return (
    <motion.div
      className="absolute inset-x-0 bottom-0 z-20 flex flex-col border-t border-[var(--line-strong)] panel lg:hidden"
      initial={false}
      animate={{ height: expanded || selected ? "70%" : 210 }}
      transition={{ type: "spring", stiffness: 300, damping: 34 }}
    >
      <button
        className="flex shrink-0 flex-col items-center gap-2 pb-2 pt-2.5"
        onClick={() => (selected ? onPick(null) : setExpanded((v) => !v))}
        aria-label={selected ? "Back to all stops" : expanded ? "Collapse" : "Expand stop list"}
      >
        <span className="h-1 w-10 rounded-full bg-white/25" />
        <span className="flex w-full items-center px-4">
          <span className="eyebrow flex items-center gap-2">
            {selected ? <><Arrow dir="left" /> All stops</> : <><Star size={8} /> Where I'll be</>}
          </span>
        </span>
      </button>
      <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain">
        {selected ? <LocationDetail location={selected} /> : <StopList onPick={onPick} dense />}
      </div>
    </motion.div>
  );
}

