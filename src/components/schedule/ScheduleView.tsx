"use client";
import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, LayoutGroup, motion } from "motion/react";
import type { AvailabilityDay, Stop } from "@/lib/types";
import { KIND_LABEL, STATUS } from "@/lib/status";
import { useData, useNav, withParams } from "@/lib/app-context";
import { dayIndex, daysForStop, isActive, locationById, locationStatus, upcomingStops } from "@/lib/selectors";
import { capacityLine } from "./StopRow";
import { formatDayNum, formatLong, formatMonDay, formatMonth, formatMonthYear, formatRange, monthGrid, monthKey, shiftMonth } from "@/lib/dates";
import { Arrow, ButtonLink, Corners, SampleTag, Star, StatusBadge, StatusGlyph, cx } from "@/components/ui/primitives";
import { DayStrip, Legend } from "./DayStrip";

const WEEKDAYS = ["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"];

export function ScheduleView() {
  const { snapshot, today } = useData();
  const nav = useNav();
  const [loc, setLoc] = useState<string | null>(nav.search.get("loc"));
  useEffect(() => setLoc(nav.search.get("loc")), [nav.search]);

  const pickLoc = (id: string | null) => {
    setLoc(id);
    setSelectedDate(null);
    nav.replace(withParams("/schedule", { loc: id }));
  };

  const stops = useMemo(() => upcomingStops(snapshot, today).filter((s) => !loc || s.locationId === loc), [snapshot, today, loc]);
  const firstDated = stops.find((s) => s.startDate && s.status !== "closed");
  const [month, setMonth] = useState(() => (firstDated?.startDate && firstDated.startDate > today ? firstDated.startDate : today));
  useEffect(() => {
    if (firstDated?.startDate) setMonth(firstDated.startDate > today ? firstDated.startDate : today);
  }, [loc]); // eslint-disable-line react-hooks/exhaustive-deps

  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const idx = useMemo(() => dayIndex(snapshot, loc), [snapshot, loc]);
  const selectedLoc = loc ? locationById(snapshot, loc) : undefined;

  // Group stops by month for the itinerary
  const groups = useMemo(() => {
    const g: { key: string; label: string; stops: Stop[] }[] = [];
    for (const s of stops) {
      const key = s.startDate ? monthKey(s.startDate) : "tba";
      const label = s.startDate ? formatMonth(s.startDate) : "Dates TBA";
      const last = g[g.length - 1];
      if (last?.key === key) last.stops.push(s);
      else g.push({ key, label, stops: [s] });
    }
    return g;
  }, [stops]);

  return (
    <section className="px-4 pb-24 pt-8 sm:px-8 lg:px-14 lg:pt-14" aria-labelledby="schedule-title">
      <header className="grid gap-6 lg:grid-cols-[1fr_auto] lg:items-end">
        <div>
          <p className="eyebrow flex items-center gap-2"><Star size={8} /> III — Availability</p>
          <h1 id="schedule-title" className="display mt-4 text-[3.4rem] sm:text-[5rem] lg:text-[6.5rem]">
            <span className="metal">{selectedLoc ? selectedLoc.city : "My Schedule"}</span>
          </h1>
          <p className="mt-4 max-w-lg font-display text-[1.3rem] italic leading-snug text-mist">
            {selectedLoc
              ? `Every date I'm tattooing in ${selectedLoc.city}. Pick a day to see if it's open.`
              : "Where I'm tattooing and when. The home studio, guest spots and the road. Choose an open day to request it."}
          </p>
        </div>
        <Legend className="lg:max-w-[22rem] lg:justify-end lg:pb-3" />
      </header>

      {/* Location filter — shared with the map via ?loc= */}
      <div className="sticky top-[var(--topbar-h)] z-20 -mx-4 mt-8 border-y border-[var(--line)] bg-ink/80 px-4 backdrop-blur-xl sm:-mx-8 sm:px-8 lg:top-0 lg:-mx-14 lg:px-14">
        <LayoutGroup id="loc-filter">
          <div role="radiogroup" aria-label="Filter by city" className="no-scrollbar flex items-center gap-1 overflow-x-auto py-2.5">
            {[null, ...snapshot.locations.map((l) => l.id)].map((id) => {
              const l = id ? locationById(snapshot, id) : undefined;
              const active = loc === id;
              return (
                <button key={id ?? "all"} role="radio" aria-checked={active} onClick={() => pickLoc(id)} className={cx("relative flex shrink-0 items-center gap-2 px-4 py-2 font-display text-[1.1rem] transition-colors", active ? "text-gold-bright" : "text-mist hover:text-bone")}>
                  {active && <motion.span layoutId="loc-pill" className="absolute inset-x-2 bottom-0 h-px bg-gold" transition={{ type: "spring", stiffness: 420, damping: 38 }} />}
                  {id && <span className="relative"><StatusGlyph status={locationStatus(snapshot, id, today)} size={7} /></span>}
                  <span className="relative">{l ? l.city : "All cities"}</span>
                </button>
              );
            })}
            {selectedLoc && (
              <ButtonLink href={withParams("/map", { loc })} variant="quiet" className="ml-auto h-9 shrink-0 px-2 text-[11px]">On the map <Arrow /></ButtonLink>
            )}
          </div>
        </LayoutGroup>
      </div>

      <div className="mt-10 grid gap-12 lg:grid-cols-[minmax(0,1fr)_minmax(340px,440px)] xl:gap-16">
        {/* Calendar (first on mobile) */}
        <div className="lg:order-2">
          <div className="relative etched bg-gradient-to-b from-[#16140f]/70 to-stone/60 p-4 sm:p-6 lg:sticky lg:top-24">
            <Corners />
            <div className="flex items-center justify-between">
              <button onClick={() => setMonth(shiftMonth(month, -1))} className="grid size-10 place-items-center rounded-full text-gold hover:bg-gold/10" aria-label="Previous month"><Arrow dir="left" /></button>
              <AnimatePresence mode="wait" initial={false}>
                <motion.h2 key={monthKey(month)} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} className="font-display text-[1.6rem] text-bone" aria-live="polite">
                  {formatMonthYear(month)}
                </motion.h2>
              </AnimatePresence>
              <button onClick={() => setMonth(shiftMonth(month, 1))} className="grid size-10 place-items-center rounded-full text-gold hover:bg-gold/10" aria-label="Next month"><Arrow /></button>
            </div>

            <table className="mt-5 w-full table-fixed border-collapse" role="grid" aria-label={`${formatMonthYear(month)} availability`}>
              <thead>
                <tr>{WEEKDAYS.map((d) => <th key={d} scope="col" className="pb-3 font-display text-[14px] font-normal italic text-gold/80">{d}</th>)}</tr>
              </thead>
              <tbody>
                {monthGrid(month).map((week, wi) => (
                  <tr key={wi}>
                    {week.map((date, di) => {
                      if (!date) return <td key={di} />;
                      const entries = idx.get(date) ?? [];
                      const primary = [...entries].sort((a, b) => STATUS[a.status].rank - STATUS[b.status].rank)[0];
                      const past = date < today;
                      const sel = selectedDate === date;
                      const st = primary ? STATUS[primary.status] : null;
                      return (
                        <td key={di} className="p-0.5">
                          <button
                            onClick={() => setSelectedDate(sel ? null : date)}
                            disabled={!primary}
                            aria-pressed={sel}
                            aria-label={`${formatLong(date)}${primary ? `: ${STATUS[primary.status].label}` : ": no dates"}`}
                            className={cx(
                              "relative flex aspect-square w-full flex-col items-center justify-center rounded-full transition-colors",
                              primary ? "hover:bg-white/[0.05]" : "text-ash/30",
                              sel && "bg-gold/[0.14] ring-1 ring-gold/80",
                              past && "opacity-40",
                            )}
                          >
                            <span className={cx("font-display text-[18px] leading-none tabular sm:text-[21px]", st ? (st.bookable ? "text-bone" : "text-ash/70") : "", primary?.status === "full" && "line-through decoration-1", date === today && "text-gold-bright underline decoration-gold underline-offset-4")}>{formatDayNum(date)}</span>
                            {st && <span className="mt-1.5 size-[5px] rounded-full" style={{ background: st.token, opacity: st.bookable ? 1 : 0.5 }} />}
                          </button>
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>

            <AnimatePresence mode="wait">
              {selectedDate ? (
                <motion.div key={selectedDate} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="mt-5 border-t border-[var(--line)] pt-5" aria-live="polite">
                  <p className="font-display text-[1.4rem] text-bone">{formatLong(selectedDate)}</p>
                  <ul className="mt-3 space-y-3">
                    {(idx.get(selectedDate) ?? []).map((d) => <DayDetail key={d.id} day={d} />)}
                  </ul>
                </motion.div>
              ) : (
                <motion.p key="hint" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-5 border-t border-[var(--line)] pt-4 font-display text-[1.05rem] italic text-ash">
                  Choose a marked day to see where I'll be
                </motion.p>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Itinerary */}
        <div className="lg:order-1">
          {groups.length === 0 && <p className="text-ash">No upcoming dates for this city yet.</p>}
          {groups.map((g) => (
            <div key={g.key} className="mb-12">
              <div className="flex items-baseline gap-4">
                <h2 className="display text-[2.6rem] text-bone sm:text-[3.4rem]">{g.label}</h2>
                <span className="h-px flex-1 bg-gradient-to-r from-gold/40 to-transparent" />
                <span className="font-display text-[1.05rem] italic text-gold">{g.stops.length} {g.stops.length === 1 ? "stop" : "stops"}</span>
              </div>
              <ol className="mt-3">
                {g.stops.map((s) => <ItineraryRow key={`${loc}-${s.id}`} stop={s} defaultOpen={!!loc && s.id === stops[0]?.id} onDay={(d) => { setMonth(d); setSelectedDate(d); }} />)}
              </ol>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function DayDetail({ day }: { day: AvailabilityDay }) {
  const { snapshot } = useData();
  const l = locationById(snapshot, day.locationId);
  const stop = snapshot.stops.find((s) => s.id === day.stopId);
  const s = STATUS[day.status];
  return (
    <li className="flex items-center justify-between gap-3">
      <div>
        <p className="font-display text-[1.35rem] leading-none text-bone">{l?.city}<span className="text-ash">, {l?.region}</span></p>
        <StatusBadge status={day.status} className="mt-1" />
        {stop?.isPlaceholder && <SampleTag className="ml-2" />}
      </div>
      {s.bookable ? (
        <ButtonLink href={withParams("/book", { stop: day.stopId, date: day.date })} variant="primary" className="h-9 shrink-0 px-3 text-[11px]">Request</ButtonLink>
      ) : (
        <span className="max-w-[10rem] text-right font-display text-[1rem] italic text-ash">{day.status === "full" ? "Booked — try a nearby day" : day.status === "soon" ? "Books open soon" : "Not tattooing"}</span>
      )}
    </li>
  );
}

function ItineraryRow({ stop, onDay, defaultOpen }: { stop: Stop; onDay: (date: string) => void; defaultOpen?: boolean }) {
  const { snapshot, today } = useData();
  const [open, setOpen] = useState(!!defaultOpen);
  const l = locationById(snapshot, stop.locationId)!;
  const days = daysForStop(snapshot, stop.id);
  const s = STATUS[stop.status];
  const capacity = capacityLine(stop);
  const now = isActive(stop, today);
  return (
    <li className="border-b border-[var(--line)]">
      <button onClick={() => setOpen((v) => !v)} aria-expanded={open} className="group grid w-full grid-cols-[auto_1fr_auto] items-center gap-4 py-5 text-left sm:grid-cols-[8.5rem_1fr_auto_auto] sm:gap-6">
        <span className="font-display text-[1.3rem] italic leading-none text-gold tabular sm:text-[1.5rem]">{formatRange(stop.startDate, stop.endDate)}</span>
        <span className="min-w-0">
          <span className="flex items-center gap-2">
            <span className="font-display text-[1.8rem] leading-none text-bone transition-colors group-hover:text-gold-bright sm:text-[2.1rem]">{l.city}</span>
            <span className="text-[13px] text-ash">{l.region}</span>
            {now && <span className="here-glow text-[11.5px] font-medium uppercase tracking-[0.16em] text-gold-bright">Here now</span>}
            {stop.isPlaceholder && <SampleTag />}
          </span>
          <span className="mt-1.5 block text-[13.5px] text-ash">{[KIND_LABEL[stop.kind], stop.venue, capacity].filter(Boolean).join(" · ")}</span>
        </span>
        <span className="hidden sm:block"><StatusBadge status={stop.status} pulse={stop.status === "open"} /></span>
        <span className="flex items-center gap-3">
          <span className="sm:hidden"><StatusGlyph status={stop.status} /></span>
          <span className={cx("grid size-9 place-items-center rounded-full border border-gold/40 text-gold transition-transform duration-500 group-hover:border-gold", open && "rotate-45")}>+</span>
        </span>
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }} className="overflow-hidden">
            <div className="pb-6 sm:pl-[calc(8.5rem+1.5rem)]">
              <p className="mb-3 sm:hidden"><StatusBadge status={stop.status} /></p>
              {days.length > 0 && stop.status !== "closed" ? <DayStrip days={days} onPick={(d) => onDay(d.date)} /> : <p className="font-display text-[1.05rem] italic text-ash">{stop.status === "soon" ? "Dates open here first. Follow the city on the map to hear when." : stop.status === "closed" ? "The studio is closed for these dates." : "No bookable days."}</p>}
              <div className="mt-4 flex flex-wrap gap-2">
                {s.bookable && <ButtonLink href={withParams("/book", { stop: stop.id })} variant="primary" className="h-10">Request {l.city} <Arrow /></ButtonLink>}
                <ButtonLink href={withParams("/map", { loc: l.id })} variant="ghost" className="h-10">See on map</ButtonLink>
              </div>
              {stop.startDate && days.length > 0 && <p className="mt-3 font-display text-[1rem] italic text-ash">Choose a day to find it on the calendar.</p>}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </li>
  );
}
