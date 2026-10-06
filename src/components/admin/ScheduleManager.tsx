"use client";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import type { AvailabilityDay, AvailabilityStatus, Location, Stop, StopKind } from "@/lib/types";
import { KIND_LABEL, STATUS, STATUS_ORDER } from "@/lib/status";
import { eachDay, formatDayNum, formatMonth, formatRange, formatWeekday, todayISO } from "@/lib/dates";
import { deleteLocation, deleteStop, lookupCity, saveLocation, saveStop } from "@/app/admin/actions";
import { Button, SampleTag, Star, StatusBadge, StatusGlyph, cx } from "@/components/ui/primitives";
import { ChipGroup, ConfirmButton, Field, PageHead, Section, Sheet, TextInput, Toggle, useToast } from "./kit";

const KINDS: StopKind[] = ["home", "guest", "convention", "travel"];
const CYCLE: AvailabilityStatus[] = ["open", "limited", "full", "closed", "soon"];

export function ScheduleManager({ locations, stops, days }: { locations: Location[]; stops: Stop[]; days: AvailabilityDay[] }) {
  const [stop, setStop] = useState<Stop | "new" | null>(null);
  const [city, setCity] = useState<Location | "new" | null>(null);
  const [showPast, setShowPast] = useState(false);
  const router = useRouter();
  const toast = useToast();
  const today = todayISO();
  const upcoming = stops.filter((s) => !s.endDate || s.endDate >= today);
  const past = stops.filter((s) => s.endDate && s.endDate < today).reverse();
  const city_ = (id: string) => locations.find((l) => l.id === id);
  const done = (msg: string) => { toast(msg); setStop(null); setCity(null); router.refresh(); };

  const StopRow = ({ s }: { s: Stop }) => (
    <li>
      <button onClick={() => setStop(s)} className="grid w-full grid-cols-[1fr_auto] items-center gap-3 border-b border-[var(--line)] py-4 text-left hover:bg-white/[0.02]">
        <span className="min-w-0">
          <span className="flex flex-wrap items-center gap-2">
            <span className="caps text-[14px] tracking-[0.2em] text-bone">{city_(s.locationId)?.city ?? "Unknown city"}</span>
            {s.isPlaceholder && <SampleTag />}
          </span>
          <span className="mt-1 block font-mono text-[11.5px] uppercase tracking-[0.12em] text-ash">
            {formatRange(s.startDate, s.endDate)} · {KIND_LABEL[s.kind]}
            {s.status === "limited" && s.spotsRemaining != null ? ` · ${s.spotsRemaining} spots` : ""}
          </span>
        </span>
        <StatusBadge status={s.status} short />
      </button>
    </li>
  );

  return (
    <>
      <PageHead
        eyebrow="Where & when"
        title="Schedule"
        sub="Stops drive the map, schedule, home page and the booking flow."
        action={<Button variant="primary" onClick={() => setStop("new")} disabled={!locations.length}><Star size={9} /> Add stop</Button>}
      />

      <Section title={`Upcoming · ${upcoming.length}`}>
        {upcoming.length ? <ul>{upcoming.map((s) => <StopRow key={s.id} s={s} />)}</ul> : <p className="py-4 text-[14px] text-ash">No upcoming stops. Add one to light up the map.</p>}
        {past.length > 0 && (
          <>
            <button onClick={() => setShowPast((v) => !v)} className="mt-3 font-mono text-[11px] uppercase tracking-[0.18em] text-ash hover:text-bone">
              {showPast ? "Hide" : "Show"} past stops ({past.length})
            </button>
            {showPast && <ul className="opacity-60">{past.map((s) => <StopRow key={s.id} s={s} />)}</ul>}
          </>
        )}
      </Section>

      <Section title={`Cities · ${locations.length}`} action={<button onClick={() => setCity("new")} className="font-mono text-[11px] uppercase tracking-[0.18em] text-mist hover:text-bone">+ Add city</button>}>
        <ul className="grid gap-2 sm:grid-cols-2">
          {locations.map((l) => (
            <li key={l.id}>
              <button onClick={() => setCity(l)} className="flex w-full items-center justify-between border border-[var(--line)] px-4 py-3 text-left hover:border-[var(--line-strong)]">
                <span>
                  <span className="caps text-[13px] tracking-[0.2em] text-bone">{l.city}<span className="text-ash">, {l.region}</span></span>
                  <span className="mt-0.5 block font-mono text-[11px] text-ash">{l.latitude.toFixed(2)}, {l.longitude.toFixed(2)}</span>
                </span>
                {l.isHome && <span className="font-mono text-[11px] uppercase tracking-[0.16em] text-silver">Home ★</span>}
              </button>
            </li>
          ))}
        </ul>
      </Section>

      <StopEditor stop={stop} locations={locations} days={days} onClose={() => setStop(null)} onDone={done} />
      <CityEditor city={city} onClose={() => setCity(null)} onDone={done} />
    </>
  );
}

function StopEditor({ stop, locations, days, onClose, onDone }: { stop: Stop | "new" | null; locations: Location[]; days: AvailabilityDay[]; onClose: () => void; onDone: (m: string) => void }) {
  const s = stop && stop !== "new" ? stop : null;
  const [locationId, setLocationId] = useState("");
  const [kind, setKind] = useState<StopKind>("guest");
  const [venue, setVenue] = useState("");
  const [start, setStart] = useState("");
  const [end, setEnd] = useState("");
  const [status, setStatus] = useState<AvailabilityStatus>("open");
  const [windows, setWindows] = useState("");
  const [spots, setSpots] = useState("");
  const [note, setNote] = useState("");
  const [placeholder, setPlaceholder] = useState(false);
  const [dayMap, setDayMap] = useState<Record<string, AvailabilityStatus>>({});
  const [busy, setBusy] = useState(false);
  const toast = useToast();

  useEffect(() => {
    if (!stop) return;
    setLocationId(s?.locationId ?? locations.find((l) => l.isHome)?.id ?? locations[0]?.id ?? "");
    setKind(s?.kind ?? "guest"); setVenue(s?.venue ?? ""); setStart(s?.startDate ?? ""); setEnd(s?.endDate ?? "");
    setStatus(s?.status ?? "open"); setWindows(s?.appointmentWindows?.toString() ?? ""); setSpots(s?.spotsRemaining?.toString() ?? "");
    setNote(s?.note ?? ""); setPlaceholder(s?.isPlaceholder ?? false);
    setDayMap(Object.fromEntries(days.filter((d) => d.stopId === s?.id).map((d) => [d.date, d.status])));
    setBusy(false);
  }, [stop]); // eslint-disable-line react-hooks/exhaustive-deps

  const range = useMemo(() => (start && (end || start) >= start ? eachDay(start, end || start).slice(0, 120) : []), [start, end]);
  const dayStatus = (d: string) => dayMap[d] ?? status;
  const cycle = (d: string) => setDayMap((m) => ({ ...m, [d]: CYCLE[(CYCLE.indexOf(dayStatus(d)) + 1) % CYCLE.length] }));
  const setAll = (st: AvailabilityStatus) => setDayMap(Object.fromEntries(range.map((d) => [d, st])));

  const save = async () => {
    setBusy(true);
    const r = await saveStop({
      id: s?.id, locationId, kind, venue, startDate: start || null, endDate: end || start || null, status,
      appointmentWindows: windows ? Number(windows) : null, spotsRemaining: spots ? Number(spots) : null,
      note, isPlaceholder: placeholder, days: Object.fromEntries(range.map((d) => [d, dayStatus(d)])),
    });
    if (r.ok) onDone(s ? "Stop updated" : "Stop added");
    else { toast(r.error, "error"); setBusy(false); }
  };
  const remove = async () => {
    if (!s) return;
    setBusy(true);
    const r = await deleteStop(s.id);
    if (r.ok) onDone("Stop deleted");
    else { toast(r.error, "error"); setBusy(false); }
  };

  // Group the range into Monday-first weeks for the day editor
  const weeks = useMemo(() => {
    const out: (string | null)[][] = [];
    let w: (string | null)[] = [];
    range.forEach((d, i) => {
      if (i === 0) { const lead = (new Date(d + "T00:00:00Z").getUTCDay() + 6) % 7; w = Array(lead).fill(null); }
      w.push(d);
      if (w.length === 7) { out.push(w); w = []; }
    });
    if (w.length) out.push([...w, ...Array(7 - w.length).fill(null)]);
    return out;
  }, [range]);

  return (
    <Sheet
      open={!!stop}
      onClose={onClose}
      title={s ? "Edit stop" : "New stop"}
      footer={
        <div className="flex items-center gap-2">
          {s && <ConfirmButton onConfirm={remove} busy={busy} />}
          <Button variant="primary" className="ml-auto flex-1 sm:flex-none sm:px-10" onClick={save} disabled={busy || !locationId}>
            {busy ? "Saving…" : s ? "Save stop" : "Add stop"}
          </Button>
        </div>
      }
    >
      <div className="space-y-5">
        <Field label="City">
          <ChipGroup multi={false} options={locations.map((l) => ({ value: l.id, label: l.city }))} value={[locationId]} onChange={(v) => setLocationId(v[0])} />
        </Field>
        <Field label="Type"><ChipGroup multi={false} options={KINDS.map((k) => ({ value: k, label: KIND_LABEL[k] }))} value={[kind]} onChange={(v) => setKind(v[0])} /></Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Start"><TextInput type="date" value={start} onChange={(e) => { setStart(e.target.value); if (!end || end < e.target.value) setEnd(e.target.value); }} /></Field>
          <Field label="End"><TextInput type="date" value={end} min={start} onChange={(e) => setEnd(e.target.value)} /></Field>
        </div>
        <p className="-mt-3 text-[12px] text-ash">Leave dates empty for "Dates TBA".</p>
        <Field label="Venue / studio" hint="Optional"><TextInput value={venue} onChange={(e) => setVenue(e.target.value)} placeholder="Shown on the stop card" /></Field>

        <Field label="Booking status">
          <div className="grid grid-cols-2 gap-1.5 sm:grid-cols-3">
            {STATUS_ORDER.map((st) => (
              <button key={st} type="button" onClick={() => setStatus(st)} aria-pressed={status === st} className={cx("flex items-center gap-2 border px-3 py-2.5 text-left transition-colors", status === st ? "border-silver/70 bg-white/[0.07]" : "border-[var(--line)] hover:border-[var(--line-strong)]")}>
                <StatusGlyph status={st} />
                <span className="font-mono text-[11px] uppercase tracking-[0.12em]" style={{ color: STATUS[st].token }}>{STATUS[st].label}</span>
              </button>
            ))}
          </div>
        </Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Appointment windows" hint="Open"><TextInput type="number" inputMode="numeric" min={0} value={windows} onChange={(e) => setWindows(e.target.value)} /></Field>
          <Field label="Spots remaining" hint="Limited"><TextInput type="number" inputMode="numeric" min={0} value={spots} onChange={(e) => setSpots(e.target.value)} /></Field>
        </div>
        <Field label="Note" hint="Optional"><TextInput value={note} onChange={(e) => setNote(e.target.value)} placeholder="e.g. Books open Oct 20" /></Field>

        {range.length > 0 && (
          <div>
            <div className="mb-2 flex items-baseline justify-between">
              <span className="eyebrow">Each day</span>
              <span className="font-mono text-[11px] uppercase tracking-[0.12em] text-ash">Tap a day to change it</span>
            </div>
            <div className="mb-3 flex flex-wrap gap-1">
              <span className="self-center pr-1 font-mono text-[11px] uppercase tracking-[0.12em] text-ash">Set all:</span>
              {CYCLE.map((st) => (
                <button key={st} type="button" onClick={() => setAll(st)} className="flex items-center gap-1.5 border border-[var(--line)] px-2 py-1.5 font-mono text-[11px] uppercase tracking-[0.12em] text-mist hover:border-[var(--line-strong)]">
                  <StatusGlyph status={st} size={7} /> {STATUS[st].short}
                </button>
              ))}
            </div>
            <div className="grid grid-cols-7 gap-1">
              {["M", "T", "W", "T", "F", "S", "S"].map((d, i) => <span key={i} className="pb-1 text-center font-mono text-[10.5px] text-ash">{d}</span>)}
              {weeks.flat().map((d, i) =>
                d ? (
                  <button key={d} type="button" onClick={() => cycle(d)} aria-label={`${d}: ${STATUS[dayStatus(d)].label}`}
                    className="flex aspect-square flex-col items-center justify-center gap-1 border border-[var(--line)] transition-colors hover:border-silver/50"
                    style={{ background: `color-mix(in oklab, ${STATUS[dayStatus(d)].token} 10%, transparent)` }}>
                    <span className="font-display text-[16px] leading-none text-bone">{formatDayNum(d)}</span>
                    <StatusGlyph status={dayStatus(d)} size={8} />
                  </button>
                ) : <span key={`x${i}`} />,
              )}
            </div>
            <p className="mt-2 font-mono text-[11px] uppercase tracking-[0.12em] text-ash">{formatMonth(range[0])}{range.length > 1 && formatMonth(range[range.length - 1]) !== formatMonth(range[0]) ? ` – ${formatMonth(range[range.length - 1])}` : ""} · {range.length} days · first {formatWeekday(range[0])}</p>
          </div>
        )}

        <Toggle checked={placeholder} onChange={setPlaceholder} label="Mark as sample" sub="Shows a dashed “Sample” tag on the site" />
      </div>
    </Sheet>
  );
}

function CityEditor({ city, onClose, onDone }: { city: Location | "new" | null; onClose: () => void; onDone: (m: string) => void }) {
  const c = city && city !== "new" ? city : null;
  const [name, setName] = useState("");
  const [region, setRegion] = useState("");
  const [country, setCountry] = useState("CA");
  const [lat, setLat] = useState("");
  const [lng, setLng] = useState("");
  const [home, setHome] = useState(false);
  const [busy, setBusy] = useState(false);
  const [found, setFound] = useState("");
  const toast = useToast();

  useEffect(() => {
    if (!city) return;
    setName(c?.city ?? ""); setRegion(c?.region ?? ""); setCountry(c?.country ?? "CA");
    setLat(c?.latitude.toString() ?? ""); setLng(c?.longitude.toString() ?? ""); setHome(!!c?.isHome); setFound(""); setBusy(false);
  }, [city]); // eslint-disable-line react-hooks/exhaustive-deps

  const lookup = async () => {
    setBusy(true);
    const r = await lookupCity([name, region, country].filter(Boolean).join(", "));
    setBusy(false);
    if (!r.ok || !r.data) return toast(r.ok ? "Not found" : r.error, "error");
    setLat(String(r.data.latitude)); setLng(String(r.data.longitude)); setFound(r.data.label);
  };
  const save = async () => {
    setBusy(true);
    const r = await saveLocation({ id: c?.id, city: name, region, country, latitude: Number(lat), longitude: Number(lng), isHome: home });
    if (r.ok) onDone(c ? "City updated" : "City added");
    else { toast(r.error, "error"); setBusy(false); }
  };
  const remove = async () => {
    if (!c) return;
    setBusy(true);
    const r = await deleteLocation(c.id);
    if (r.ok) onDone("City removed");
    else { toast(r.error, "error"); setBusy(false); }
  };

  return (
    <Sheet
      open={!!city}
      onClose={onClose}
      title={c ? c.city : "New city"}
      footer={
        <div className="flex items-center gap-2">
          {c && <ConfirmButton onConfirm={remove} busy={busy}>Delete city</ConfirmButton>}
          <Button variant="primary" className="ml-auto flex-1 sm:flex-none sm:px-10" onClick={save} disabled={busy || !name.trim() || !lat || !lng}>{busy ? "…" : "Save city"}</Button>
        </div>
      }
    >
      <div className="space-y-5">
        <Field label="City"><TextInput value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Montreal" /></Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Province / state"><TextInput value={region} onChange={(e) => setRegion(e.target.value)} placeholder="QC" /></Field>
          <Field label="Country"><TextInput value={country} onChange={(e) => setCountry(e.target.value)} placeholder="CA" /></Field>
        </div>
        <div>
          <Button type="button" onClick={lookup} disabled={busy || !name.trim()} className="w-full">Find on map</Button>
          {found && <p className="mt-2 text-[12px] text-ash">Found: {found}</p>}
        </div>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Latitude"><TextInput inputMode="decimal" value={lat} onChange={(e) => setLat(e.target.value)} /></Field>
          <Field label="Longitude"><TextInput inputMode="decimal" value={lng} onChange={(e) => setLng(e.target.value)} /></Field>
        </div>
        <Toggle checked={home} onChange={setHome} label="Home base" sub="Gets the star on the map" />
        {c && <p className="text-[12px] text-ash">Deleting a city also deletes its stops.</p>}
      </div>
    </Sheet>
  );
}
