"use client";
import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import type { AvailabilityDay, Location, Stop } from "@/lib/types";
import { KIND_LABEL, STATUS } from "@/lib/status";
import { useData, useNav, withParams } from "@/lib/app-context";
import { daysForStop, locationById, locationStatus, stopsForLocation, upcomingStops } from "@/lib/selectors";
import { formatLong, formatMonDay, formatMonth, formatRange, formatWeekday, formatDayNum } from "@/lib/dates";
import { Arrow, ButtonLink, Corners, SampleTag, Star, StatusBadge, StatusGlyph, cx } from "@/components/ui/primitives";
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

  return (
    <section aria-labelledby="map-title" className="relative h-[calc(100dvh-var(--topbar-h)-var(--tabbar-h)-env(safe-area-inset-bottom))] lg:h-dvh">
      <h1 id="map-title" className="sr-only">Where I'll be — map</h1>
      <Atlas markers={markers} selectedId={selected} onSelect={select} className="absolute inset-0" />

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
      <div className="absolute bottom-6 right-6 hidden border border-[var(--line)] bg-ink/70 px-4 py-3 backdrop-blur lg:block">
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
  let lastMonth = "";
  return (
    <div className={cx(dense ? "px-4 pb-4" : "p-6")}>
      {!dense && (
        <>
          <p className="eyebrow flex items-center gap-2"><Star size={8} /> II — The map</p>
          <h2 className="display mt-3 text-[2.6rem] text-bone">Where I'll be</h2>
          <p className="mt-2 text-[13.5px] text-ash">Home base, guest spots and travel. Pick a city to see open days.</p>
        </>
      )}
      <ol className={cx(!dense && "mt-6")}>
        {stops.map((st) => {
          const l = locationById(snapshot, st.locationId)!;
          const m = st.startDate ? formatMonth(st.startDate) : "Dates TBA";
          const header = m !== lastMonth ? m : null;
          lastMonth = m;
          return (
            <li key={st.id}>
              {header && <p className="eyebrow mb-1 mt-5 first:mt-0">{header}</p>}
              <button
                data-cursor="explore"
                onClick={() => onPick(st.locationId)}
                className="group flex w-full items-center gap-4 border-b border-[var(--line)] py-3.5 text-left"
              >
                <span className="w-11 shrink-0 text-center">
                  <span className="block font-mono text-[9px] uppercase tracking-[0.16em] text-ash">{st.startDate ? formatWeekday(st.startDate) : "—"}</span>
                  <span className="block font-display text-[1.6rem] leading-none text-bone tabular">{st.startDate ? formatDayNum(st.startDate) : "?"}</span>
                </span>
                <span className="min-w-0 flex-1">
                  <span className="flex items-center gap-2">
                    <span className="caps text-[13px] tracking-[0.2em] text-bone">{l.city}</span>
                    {st.isPlaceholder && <SampleTag />}
                  </span>
                  <span className="mt-1 block font-mono text-[10px] uppercase tracking-[0.14em] text-ash">
                    {KIND_LABEL[st.kind]} · {formatRange(st.startDate, st.endDate)}
                  </span>
                </span>
                <span className="flex flex-col items-end gap-1">
                  <StatusGlyph status={st.status} pulse={st.status === "open"} />
                  <span className="font-mono text-[9px] uppercase tracking-[0.14em]" style={{ color: STATUS[st.status].token }}>{STATUS[st.status].short}</span>
                </span>
              </button>
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
        <button onClick={onBack} className="mb-5 hidden items-center gap-2 font-mono text-[10px] uppercase tracking-[0.2em] text-ash hover:text-bone lg:flex">
          <Arrow dir="left" /> All stops
        </button>
      )}
      <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-ash tabular">
        {Math.abs(location.latitude).toFixed(2)}°{location.latitude >= 0 ? "N" : "S"} · {Math.abs(location.longitude).toFixed(2)}°{location.longitude <= 0 ? "W" : "E"}
        {location.isHome && <span className="ml-2 text-silver">· Home base</span>}
      </p>
      <h2 className="display mt-2 text-[2.6rem] text-bone lg:text-[3rem]">{location.city}<span className="text-ash">, {location.region}</span></h2>
      <StatusBadge status={status} className="mt-3" pulse />

      <div className="mt-6 space-y-4">
        {stops.length === 0 && <p className="text-[14px] text-ash">No dates here yet. Follow the city to hear first.</p>}
        {stops.map((st) => <StopCard key={st.id} stop={st} />)}
      </div>

      <div className="mt-6 grid grid-cols-2 gap-2">
        <ButtonLink href={withParams("/schedule", { loc: location.id })} variant="ghost" className="px-2 text-[10px] tracking-[0.14em]">View schedule</ButtonLink>
        {anyBookable ? (
          <ButtonLink href={withParams("/book", { stop: stops.find((s) => STATUS[s.status].bookable)!.id })} variant="primary" className="px-2 text-[10px] tracking-[0.14em]">Request here</ButtonLink>
        ) : (
          <button onClick={() => setShowFollow((v) => !v)} className="sweep h-11 border border-[var(--line-strong)] px-3 font-mono text-[11px] uppercase tracking-[0.2em] text-bone">
            Notify me
          </button>
        )}
      </div>
      {anyBookable && (
        <button onClick={() => setShowFollow((v) => !v)} className="mt-3 w-full font-mono text-[10px] uppercase tracking-[0.2em] text-ash hover:text-bone" aria-expanded={showFollow}>
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
  const capacity =
    stop.status === "limited" && stop.spotsRemaining != null ? `${stop.spotsRemaining} ${stop.spotsRemaining === 1 ? "spot" : "spots"} remaining`
    : stop.status === "open" && stop.appointmentWindows != null ? `${stop.appointmentWindows} appointment windows`
    : stop.note;
  return (
    <article className="border border-[var(--line)] bg-ink/40 p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-ash">{KIND_LABEL[stop.kind]}{stop.venue ? ` · ${stop.venue}` : ""}</p>
          <p className="mt-1 font-display text-[1.6rem] leading-none text-bone">{formatRange(stop.startDate, stop.endDate)}</p>
        </div>
        {stop.isPlaceholder && <SampleTag />}
      </div>
      <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1">
        <StatusBadge status={stop.status} />
        {capacity && <span className="font-mono text-[10.5px] uppercase tracking-[0.14em] text-mist">{capacity}</span>}
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
                    <ButtonLink href={withParams("/book", { stop: stop.id, date: day.date })} variant="primary" className="h-9 px-3 text-[10px]">Request {formatMonDay(day.date)}</ButtonLink>
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
      animate={{ height: expanded ? "68%" : selected ? "68%" : 196 }}
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

