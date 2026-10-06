"use client";
import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, LayoutGroup, motion } from "motion/react";
import type { AvailabilityDay, Stop } from "@/lib/types";
import { KIND_LABEL, STATUS } from "@/lib/status";
import { useData, useNav, withParams } from "@/lib/app-context";
import { dayIndex, daysForStop, locationById, locationStatus, upcomingStops } from "@/lib/selectors";
import { formatDayNum, formatLong, formatMonDay, formatMonth, formatMonthYear, formatRange, monthGrid, monthKey, shiftMonth } from "@/lib/dates";
import { Arrow, ButtonLink, Corners, SampleTag, Star, StatusBadge, StatusGlyph, cx } from "@/components/ui/primitives";
import { DayStrip, Legend } from "./DayStrip";

const WEEKDAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

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
          <p className="mt-4 max-w-lg text-[15px] text-ash">
            {selectedLoc
              ? `Every date I'm tattooing in ${selectedLoc.city}. Pick a day to see if it's open.`
              : "Where I'm tattooing and when — home studio, guest spots and travel. Tap any open day to request it."}
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
                <button key={id ?? "all"} role="radio" aria-checked={active} onClick={() => pickLoc(id)} className={cx("relative flex shrink-0 items-center gap-2 px-3.5 py-2 font-mono text-[10.5px] uppercase tracking-[0.18em] transition-colors", active ? "text-ink" : "text-ash hover:text-bone")}>
                  {active && <motion.span layoutId="loc-pill" className="absolute inset-0 bg-gradient-to-b from-[#ecebe7] to-[#bdbcb7]" transition={{ type: "spring", stiffness: 420, damping: 38 }} />}
                  {id && <span className="relative"><StatusGlyph status={locationStatus(snapshot, id, today)} size={7} /></span>}
                  <span className="relative">{l ? l.city : "All cities"}</span>
                </button>
              );
            })}
            {selectedLoc && (
              <ButtonLink href={withParams("/map", { loc })} variant="quiet" className="ml-auto h-9 shrink-0 px-2 text-[10px]">On the map <Arrow /></ButtonLink>
            )}
          </div>
        </LayoutGroup>
      </div>

      <div className="mt-10 grid gap-12 lg:grid-cols-[minmax(0,1fr)_minmax(340px,440px)] xl:gap-16">
        {/* Calendar (first on mobile) */}
        <div className="lg:order-2">
          <div className="relative etched bg-stone/60 p-4 sm:p-6 lg:sticky lg:top-24">
            <Corners />
            <div className="flex items-center justify-between">
              <button onClick={() => setMonth(shiftMonth(month, -1))} className="grid size-10 place-items-center border border-[var(--line)] hover:border-[var(--line-strong)]" aria-label="Previous month"><Arrow dir="left" /></button>
              <AnimatePresence mode="wait" initial={false}>
                <motion.h2 key={monthKey(month)} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} className="caps text-[14px] tracking-[0.32em] text-bone" aria-live="polite">
                  {formatMonthYear(month)}
                </motion.h2>
              </AnimatePresence>
              <button onClick={() => setMonth(shiftMonth(month, 1))} className="grid size-10 place-items-center border border-[var(--line)] hover:border-[var(--line-strong)]" aria-label="Next month"><Arrow /></button>
            </div>

            <table className="mt-5 w-full table-fixed border-collapse" role="grid" aria-label={`${formatMonthYear(month)} availability`}>
              <thead>
                <tr>{WEEKDAYS.map((d) => <th key={d} scope="col" className="pb-2 font-mono text-[9px] font-normal uppercase tracking-[0.16em] text-ash">{d}</th>)}</tr>
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
                      const city = primary && !loc ? locationById(snapshot, primary.locationId)?.city.slice(0, 3) : null;
                      return (
                        <td key={di} className="p-0.5">
                          <button
                            onClick={() => setSelectedDate(sel ? null : date)}
                            disabled={!primary}
                            aria-pressed={sel}
                            aria-label={`${formatLong(date)}${primary ? `: ${STATUS[primary.status].label}` : ": no dates"}`}
                            className={cx(
                              "relative flex aspect-square w-full flex-col items-center justify-center gap-1 transition-colors",
                              primary ? "border border-[var(--line)] hover:border-silver/50" : "text-ash/35",
                              sel && "border-silver/80 bg-white/[0.07]",
                              past && "opacity-40",
                            )}
                            style={primary && !sel ? { background: `color-mix(in oklab, ${STATUS[primary.status].token} 7%, transparent)` } : undefined}
                          >
                            {date === today && <span className="absolute left-1 top-1 size-1 rounded-full bg-bone" aria-label="Today" />}
                            <span className={cx("font-display text-[17px] leading-none tabular sm:text-[19px]", primary ? "text-bone" : "")}>{formatDayNum(date)}</span>
                            {primary && <StatusGlyph status={primary.status} size={7} />}
                            {city && <span className="absolute bottom-0.5 right-1 hidden font-mono text-[7.5px] uppercase tracking-[0.1em] text-ash sm:block">{city}</span>}
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
                  <p className="eyebrow">{formatLong(selectedDate)}</p>
                  <ul className="mt-3 space-y-3">
                    {(idx.get(selectedDate) ?? []).map((d) => <DayDetail key={d.id} day={d} />)}
                  </ul>
                </motion.div>
              ) : (
                <motion.p key="hint" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-5 border-t border-[var(--line)] pt-4 font-mono text-[10px] uppercase tracking-[0.16em] text-ash">
                  Select a marked day for details
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
                <span className="h-px flex-1 bg-[var(--line)]" />
                <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-ash">{g.stops.length} {g.stops.length === 1 ? "stop" : "stops"}</span>
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
        <p className="caps text-[13px] tracking-[0.2em] text-bone">{l?.city}<span className="text-ash">, {l?.region}</span></p>
        <StatusBadge status={day.status} className="mt-1" />
        {stop?.isPlaceholder && <SampleTag className="ml-2" />}
      </div>
      {s.bookable ? (
        <ButtonLink href={withParams("/book", { stop: day.stopId, date: day.date })} variant="primary" className="h-9 shrink-0 px-3 text-[10px]">Request</ButtonLink>
      ) : (
        <span className="max-w-[9rem] text-right text-[12px] text-ash">{day.status === "full" ? "Booked — try a nearby day" : day.status === "soon" ? "Books open soon" : "Not tattooing"}</span>
      )}
    </li>
  );
}

function ItineraryRow({ stop, onDay, defaultOpen }: { stop: Stop; onDay: (date: string) => void; defaultOpen?: boolean }) {
  const { snapshot } = useData();
  const [open, setOpen] = useState(!!defaultOpen);
  const l = locationById(snapshot, stop.locationId)!;
  const days = daysForStop(snapshot, stop.id);
  const s = STATUS[stop.status];
  const capacity =
    stop.status === "limited" && stop.spotsRemaining != null ? `${stop.spotsRemaining} spots remaining`
    : stop.status === "open" && stop.appointmentWindows != null ? `${stop.appointmentWindows} appointment windows`
    : stop.note ?? "";
  return (
    <li className="border-b border-[var(--line)]">
      <button onClick={() => setOpen((v) => !v)} aria-expanded={open} className="group grid w-full grid-cols-[auto_1fr_auto] items-center gap-4 py-5 text-left sm:grid-cols-[8.5rem_1fr_auto_auto] sm:gap-6">
        <span className="font-display text-[1.35rem] leading-none text-mist tabular sm:text-[1.55rem]">{formatRange(stop.startDate, stop.endDate)}</span>
        <span className="min-w-0">
          <span className="flex items-center gap-2">
            <span className="caps text-[15px] tracking-[0.24em] text-bone sm:text-[17px]">{l.city}</span>
            <span className="font-mono text-[10px] text-ash">{l.region}</span>
            {stop.isPlaceholder && <SampleTag />}
          </span>
          <span className="mt-1 block font-mono text-[10px] uppercase tracking-[0.14em] text-ash">{KIND_LABEL[stop.kind]}{capacity ? ` · ${capacity}` : ""}</span>
        </span>
        <span className="hidden sm:block"><StatusBadge status={stop.status} pulse={stop.status === "open"} /></span>
        <span className="flex items-center gap-3">
          <span className="sm:hidden"><StatusGlyph status={stop.status} /></span>
          <span className={cx("grid size-8 place-items-center border border-[var(--line)] text-ash transition-transform duration-500 group-hover:text-bone", open && "rotate-45")}>+</span>
        </span>
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }} className="overflow-hidden">
            <div className="pb-6 sm:pl-[calc(8.5rem+1.5rem)]">
              <p className="mb-3 sm:hidden"><StatusBadge status={stop.status} /></p>
              {days.length > 0 ? <DayStrip days={days} onPick={(d) => onDay(d.date)} /> : <p className="text-[13px] text-ash">{stop.status === "soon" ? "Dates will open here first — follow the city on the map." : "No bookable days."}</p>}
              <div className="mt-4 flex flex-wrap gap-2">
                {s.bookable && <ButtonLink href={withParams("/book", { stop: stop.id })} variant="primary" className="h-10">Request {l.city} <Arrow /></ButtonLink>}
                <ButtonLink href={withParams("/map", { loc: l.id })} variant="ghost" className="h-10">See on map</ButtonLink>
              </div>
              {stop.startDate && days.length > 0 && <p className="mt-3 font-mono text-[9.5px] uppercase tracking-[0.16em] text-ash">Tap a day to show it on the calendar · First day {formatMonDay(stop.startDate)}</p>}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </li>
  );
}
