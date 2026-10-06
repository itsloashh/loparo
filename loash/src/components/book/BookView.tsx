"use client";
import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { AnimatePresence, motion } from "motion/react";
import type { AvailabilityDay, InquiryType, Stop, Tattoo } from "@/lib/types";
import { KIND_LABEL, STATUS, STYLE_LABEL } from "@/lib/status";
import { AppLink, useData, useNav, withParams } from "@/lib/app-context";
import { bookableDays, daysForStop, locationById, upcomingStops } from "@/lib/selectors";
import { formatLong, formatMonDay, formatRange } from "@/lib/dates";
import { submitInquiry } from "@/lib/api";
import { ArtImage, Arrow, Button, ButtonLink, Corners, SampleTag, Star, StatusBadge, StatusGlyph, cx } from "@/components/ui/primitives";
import { DayStrip } from "@/components/schedule/DayStrip";

const TYPES: { id: InquiryType; label: string; sub: string }[] = [
  { id: "custom", label: "Custom piece", sub: "Drawn for you from your idea" },
  { id: "portfolio", label: "Portfolio inspired", sub: "Something in the spirit of a piece I've done" },
  { id: "flash", label: "Flash", sub: "A pre-drawn design" },
  { id: "cover-up", label: "Cover-up", sub: "Work over an existing tattoo" },
  { id: "other", label: "Other", sub: "Touch-up, lettering, something else" },
];

const PLACEMENTS: { group: string; items: string[] }[] = [
  { group: "Arm", items: ["Forearm", "Inner forearm", "Upper arm", "Inner arm", "Elbow", "Wrist", "Hand", "Knuckles"] },
  { group: "Leg", items: ["Thigh", "Knee", "Calf", "Shin", "Ankle", "Foot"] },
  { group: "Torso", items: ["Chest", "Sternum", "Ribs", "Stomach", "Back", "Shoulder", "Hip"] },
  { group: "Head & neck", items: ["Neck", "Throat", "Behind the ear"] },
  { group: "Undecided", items: ["Not sure yet"] },
];

const SIZES = [
  { id: "tiny", label: "Tiny", sub: "Under 2 in · coin", px: 14 },
  { id: "small", label: "Small", sub: "2–4 in · palm", px: 26 },
  { id: "medium", label: "Medium", sub: "4–7 in · hand-span", px: 40 },
  { id: "large", label: "Large", sub: "7 in + · half limb", px: 56 },
  { id: "session", label: "Multi-session", sub: "Sleeve, back, large scale", px: 72 },
];

const STEPS = ["What", "Where on you", "How big", "Where", "When", "The idea", "References", "Send"] as const;
const ROMAN = ["I", "II", "III", "IV", "V", "VI", "VII", "VIII"];

type Draft = {
  type: InquiryType | null;
  placement: string | null;
  size: string | null;
  stopId: string | "flexible" | null;
  dates: string[];
  flexibleDates: boolean;
  idea: string;
  name: string;
  email: string;
  phone: string;
  instagram: string;
  over18: boolean;
};
const EMPTY: Draft = { type: null, placement: null, size: null, stopId: null, dates: [], flexibleDates: false, idea: "", name: "", email: "", phone: "", instagram: "", over18: false };
const DRAFT_KEY = "loash:inquiry-draft";

export function BookView() {
  const { snapshot, today } = useData();
  const nav = useNav();
  const refSlug = nav.search.get("ref");
  const ref = refSlug ? snapshot.tattoos.find((t) => t.slug === refSlug) ?? null : null;
  const [reference, setReference] = useState<Tattoo | null>(ref);
  useEffect(() => setReference(ref), [ref?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  const [d, setD] = useState<Draft>(EMPTY);
  const [step, setStep] = useState(0);
  const [dir, setDir] = useState(1);
  const [files, setFiles] = useState<File[]>([]);
  const [state, setState] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const [error, setError] = useState("");
  const [mode, setMode] = useState<"live" | "demo">("live");
  const top = useRef<HTMLDivElement>(null);

  // Restore draft, then apply deep-link context (?ref, ?stop, ?date)
  useEffect(() => {
    let base = EMPTY;
    try { const raw = sessionStorage.getItem(DRAFT_KEY); if (raw) base = { ...EMPTY, ...JSON.parse(raw) }; } catch {}
    const stop = nav.search.get("stop"), date = nav.search.get("date");
    const next = { ...base };
    if (refSlug) next.type = "portfolio";
    if (stop && snapshot.stops.some((s) => s.id === stop)) { next.stopId = stop; next.dates = date ? [date] : []; }
    setD(next);
  }, [nav.search]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    try { sessionStorage.setItem(DRAFT_KEY, JSON.stringify(d)); } catch {}
  }, [d]);

  const set = <K extends keyof Draft>(k: K, v: Draft[K]) => setD((p) => ({ ...p, [k]: v }));

  const stops = useMemo(() => upcomingStops(snapshot, today).filter((s) => s.status !== "closed"), [snapshot, today]);
  const chosenStop = d.stopId && d.stopId !== "flexible" ? snapshot.stops.find((s) => s.id === d.stopId) : undefined;
  const chosenDays = chosenStop ? bookableDays(daysForStop(snapshot, chosenStop.id)).filter((x) => x.date >= today) : [];

  const valid = [
    !!d.type,
    !!d.placement,
    !!d.size,
    !!d.stopId,
    d.flexibleDates || d.dates.length > 0 || d.stopId === "flexible",
    d.idea.trim().length >= 20 && d.name.trim().length > 1 && /\S+@\S+\.\S+/.test(d.email) && d.over18,
    true,
    true,
  ];

  const go = (to: number) => {
    setDir(to > step ? 1 : -1);
    setStep(to);
    requestAnimationFrame(() => top.current?.scrollIntoView({ behavior: "smooth", block: "start" }));
  };

  const send = async () => {
    setState("sending");
    const fd = new FormData();
    fd.set("payload", JSON.stringify({
      type: d.type, referenceTattooId: reference?.id ?? null, placement: d.placement, size: d.size,
      stopId: d.stopId === "flexible" ? null : d.stopId, preferredDates: d.dates, flexibleDates: d.flexibleDates || d.stopId === "flexible",
      idea: d.idea, name: d.name, email: d.email, phone: d.phone || null, instagram: d.instagram || null, over18: d.over18,
    }));
    files.forEach((f) => fd.append("files", f));
    const r = await submitInquiry(fd);
    if (r.ok) {
      setMode(r.mode);
      setState("sent");
      try { sessionStorage.removeItem(DRAFT_KEY); } catch {}
    } else {
      setError(r.error);
      setState("error");
    }
  };

  if (state === "sent") return <Sent mode={mode} name={d.name} onReset={() => { setD(EMPTY); setFiles([]); setStep(0); setState("idle"); }} />;

  const stepBody: Record<number, ReactNode> = {
    0: (
      <Step title="What are you looking for?" lede={reference ? "Your reference is attached. Pick what kind of piece you're after." : "Start with the kind of piece you have in mind."}>
        {reference && <ReferenceCard t={reference} onRemove={() => { setReference(null); nav.replace(withParams("/book", { stop: nav.search.get("stop"), date: nav.search.get("date") })); }} />}
        <div className="mt-6 grid gap-2 sm:grid-cols-2">
          {TYPES.map((t) => (
            <Choice key={t.id} selected={d.type === t.id} onClick={() => set("type", t.id)} title={t.label} sub={t.sub} />
          ))}
        </div>
      </Step>
    ),
    1: (
      <Step title="Where on you?" lede="Roughly where you'd like it. We can fine-tune placement on the day.">
        <div className="space-y-6">
          {PLACEMENTS.map((g) => (
            <fieldset key={g.group}>
              <legend className="eyebrow mb-2.5">{g.group}</legend>
              <div className="flex flex-wrap gap-1.5">
                {g.items.map((p) => (
                  <Chip key={p} selected={d.placement === p} onClick={() => set("placement", p)}>{p}</Chip>
                ))}
              </div>
            </fieldset>
          ))}
        </div>
      </Step>
    ),
    2: (
      <Step title="How big?" lede="An estimate is perfect — sizing gets dialled in at the stencil.">
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-5">
          {SIZES.map((s) => (
            <button key={s.id} type="button" onClick={() => set("size", s.id)} aria-pressed={d.size === s.id}
              className={cx("group flex flex-col items-start border p-4 text-left transition-colors", d.size === s.id ? "border-silver/70 bg-white/[0.06]" : "border-[var(--line)] hover:border-[var(--line-strong)]")}>
              <span className="grid h-20 w-full place-items-center">
                <span className={cx("block border transition-colors", d.size === s.id ? "border-silver bg-silver/10" : "border-ash/50")} style={{ width: s.px, height: s.px * 1.2 }} />
              </span>
              <span className="mt-3 font-display text-[1.35rem] leading-none text-bone">{s.label}</span>
              <span className="mt-1.5 font-mono text-[9.5px] uppercase tracking-[0.14em] text-ash">{s.sub}</span>
            </button>
          ))}
        </div>
      </Step>
    ),
    3: (
      <Step title="Where would you like to get tattooed?" lede="These are the places I'm booking right now.">
        <ul className="space-y-2">
          {stops.map((s) => {
            const l = locationById(snapshot, s.locationId)!;
            const ok = STATUS[s.status].bookable;
            return (
              <li key={s.id}>
                <button type="button" disabled={!ok} onClick={() => { set("stopId", s.id); set("dates", []); }} aria-pressed={d.stopId === s.id}
                  className={cx("grid w-full grid-cols-[1fr_auto] items-center gap-4 border p-4 text-left transition-colors sm:p-5", d.stopId === s.id ? "border-silver/70 bg-white/[0.06]" : "border-[var(--line)] hover:border-[var(--line-strong)]", !ok && "cursor-not-allowed opacity-45")}>
                  <span>
                    <span className="flex items-center gap-2">
                      <span className="caps text-[15px] tracking-[0.22em] text-bone">{l.city}<span className="text-ash">, {l.region}</span></span>
                      {s.isPlaceholder && <SampleTag />}
                    </span>
                    <span className="mt-1.5 block font-mono text-[10px] uppercase tracking-[0.14em] text-ash">{KIND_LABEL[s.kind]} · {formatRange(s.startDate, s.endDate)}</span>
                  </span>
                  <StatusBadge status={s.status} short />
                </button>
              </li>
            );
          })}
          <li>
            <button type="button" onClick={() => { set("stopId", "flexible"); set("dates", []); }} aria-pressed={d.stopId === "flexible"}
              className={cx("w-full border border-dashed p-4 text-left transition-colors sm:p-5", d.stopId === "flexible" ? "border-silver/70 bg-white/[0.06]" : "border-[var(--line-strong)] hover:border-silver/50")}>
              <span className="caps text-[14px] tracking-[0.22em] text-bone">Flexible</span>
              <span className="mt-1.5 block font-mono text-[10px] uppercase tracking-[0.14em] text-ash">Wherever I'll be next — or somewhere not listed</span>
            </button>
          </li>
        </ul>
        <p className="mt-4 text-[13px] text-ash">Not seeing your city? <AppLink href="/map" className="text-mist underline decoration-[var(--line-strong)] underline-offset-4 hover:text-bone">Follow it on the map</AppLink> to hear when books open.</p>
      </Step>
    ),
    4: (
      <Step title="When?" lede={chosenStop ? `Pick up to three days that work for you in ${locationById(snapshot, chosenStop.locationId)?.city}.` : "Tell me how flexible you are."}>
        {chosenStop && chosenDays.length > 0 && (
          <div>
            <DayStrip
              days={daysForStop(snapshot, chosenStop.id).filter((x) => x.date >= today)}
              selectedDates={d.dates}
              onPick={(day: AvailabilityDay) => {
                if (!STATUS[day.status].bookable) return;
                set("flexibleDates", false);
                setD((p) => ({ ...p, dates: p.dates.includes(day.date) ? p.dates.filter((x) => x !== day.date) : p.dates.length >= 3 ? p.dates : [...p.dates, day.date].sort() }));
              }}
            />
            <ul className="mt-4 flex flex-wrap gap-1.5" aria-live="polite">
              {d.dates.map((x, i) => (
                <li key={x} className="flex items-center gap-2 border border-silver/60 bg-white/[0.05] px-3 py-1.5 font-mono text-[10.5px] uppercase tracking-[0.14em] text-bone">
                  <span className="text-ash">{ROMAN[i]}</span> {formatMonDay(x)}
                  <button type="button" onClick={() => set("dates", d.dates.filter((y) => y !== x))} aria-label={`Remove ${formatLong(x)}`} className="text-ash hover:text-bone">×</button>
                </li>
              ))}
              {!d.dates.length && <li className="font-mono text-[10px] uppercase tracking-[0.14em] text-ash">Tap open (●) or limited (◐) days above</li>}
            </ul>
          </div>
        )}
        {chosenStop && chosenDays.length === 0 && <p className="text-[14px] text-ash">No open days listed for this stop yet.</p>}
        <label className={cx("mt-6 flex cursor-pointer items-center gap-3 border p-4", d.flexibleDates || d.stopId === "flexible" ? "border-silver/60 bg-white/[0.04]" : "border-[var(--line)]")}>
          <input type="checkbox" className="size-4 accent-[#d6d6db]" checked={d.flexibleDates || d.stopId === "flexible"} disabled={d.stopId === "flexible"} onChange={(e) => { set("flexibleDates", e.target.checked); if (e.target.checked) set("dates", []); }} />
          <span>
            <span className="block text-[14px] text-bone">I'm flexible on dates</span>
            <span className="block text-[12.5px] text-ash">Offer me whatever opens up first.</span>
          </span>
        </label>
      </Step>
    ),
    5: (
      <Step title="Tell me about the idea" lede="Subject, mood, anything you want to avoid. The more you share, the better the first sketch.">
        <Field label="Your idea" hint={`${d.idea.trim().length < 20 ? `${20 - d.idea.trim().length} more characters` : "Looks good"}`}>
          <textarea value={d.idea} onChange={(e) => set("idea", e.target.value)} rows={6} required
            placeholder="e.g. A moth like the one in your archive, but with a crescent moon behind it…"
            className="w-full resize-y border border-[var(--line-strong)] bg-ink/40 p-4 font-display text-[1.15rem] leading-snug text-bone placeholder:text-ash/50 focus:border-silver/70 focus:outline-none" />
        </Field>
        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          <Field label="Name"><Input value={d.name} onChange={(v) => set("name", v)} autoComplete="name" required /></Field>
          <Field label="Email"><Input type="email" value={d.email} onChange={(v) => set("email", v)} autoComplete="email" required /></Field>
          <Field label="Phone" hint="Optional"><Input type="tel" value={d.phone} onChange={(v) => set("phone", v)} autoComplete="tel" /></Field>
          <Field label="Instagram" hint="Optional"><Input value={d.instagram} onChange={(v) => set("instagram", v)} placeholder="@handle" /></Field>
        </div>
        <label className="mt-5 flex cursor-pointer items-center gap-3 text-[14px] text-mist">
          <input type="checkbox" className="size-4 accent-[#d6d6db]" checked={d.over18} onChange={(e) => set("over18", e.target.checked)} required />
          I'm 18 or older and will bring valid photo ID.
        </label>
      </Step>
    ),
    6: (
      <Step title="Upload references" lede="Photos of ideas, the area to be tattooed, or an existing piece for cover-ups. Optional, up to 5.">
        {reference && <ReferenceCard t={reference} compact />}
        <Dropzone files={files} setFiles={setFiles} />
      </Step>
    ),
    7: (
      <Step title="Send inquiry" lede="Check it over. Edit anything by tapping it.">
        <dl className="divide-y divide-[var(--line)] border-y border-[var(--line)]">
          <Row label="Looking for" value={TYPES.find((t) => t.id === d.type)?.label} onEdit={() => go(0)} />
          {reference && <Row label="Reference" value={reference.title} onEdit={() => go(0)} />}
          <Row label="Placement" value={d.placement} onEdit={() => go(1)} />
          <Row label="Size" value={SIZES.find((s) => s.id === d.size)?.label} onEdit={() => go(2)} />
          <Row label="Location" value={d.stopId === "flexible" ? "Flexible" : chosenStop ? `${locationById(snapshot, chosenStop.locationId)?.city} · ${formatRange(chosenStop.startDate, chosenStop.endDate)}` : null} onEdit={() => go(3)} />
          <Row label="Dates" value={d.flexibleDates || d.stopId === "flexible" ? "Flexible" : d.dates.map(formatMonDay).join(", ")} onEdit={() => go(4)} />
          <Row label="Idea" value={d.idea} onEdit={() => go(5)} long />
          <Row label="Contact" value={[d.name, d.email, d.phone, d.instagram].filter(Boolean).join(" · ")} onEdit={() => go(5)} />
          <Row label="References" value={`${files.length + (reference ? 1 : 0)} attached`} onEdit={() => go(6)} />
        </dl>
        <p className="mt-5 text-[13px] text-ash">Sending this doesn't book an appointment — it starts the conversation. I'll review it and reply by email.</p>
        {state === "error" && <p role="alert" className="mt-3 text-[13px] text-full">{error}</p>}
      </Step>
    ),
  };

  const last = step === STEPS.length - 1;

  return (
    <section className="px-4 pb-40 pt-8 sm:px-8 lg:px-14 lg:pb-24 lg:pt-14" aria-labelledby="book-title">
      <div ref={top} className="scroll-mt-24" />
      <header>
        <p className="eyebrow flex items-center gap-2"><Star size={8} /> V — Request a tattoo</p>
        <h1 id="book-title" className="display mt-4 text-[3rem] sm:text-[4.4rem] lg:text-[5.4rem]"><span className="metal">Start a request</span></h1>
      </header>

      {/* Progress */}
      <nav aria-label="Request steps" className="mt-8">
        <div className="flex items-center justify-between lg:hidden">
          <span className="font-mono text-[10.5px] uppercase tracking-[0.18em] text-mist">Step {step + 1} / {STEPS.length} — {STEPS[step]}</span>
        </div>
        <div className="mt-2 h-px bg-[var(--line)] lg:hidden"><motion.div className="h-px bg-silver" animate={{ width: `${((step + 1) / STEPS.length) * 100}%` }} /></div>
        <ol className="hidden grid-cols-8 border-y border-[var(--line)] lg:grid">
          {STEPS.map((s, i) => {
            const reachable = i <= step || valid.slice(0, i).every(Boolean);
            return (
              <li key={s}>
                <button type="button" disabled={!reachable} onClick={() => go(i)} aria-current={i === step ? "step" : undefined}
                  className={cx("relative flex w-full flex-col gap-1 px-3 py-3 text-left transition-colors", i === step ? "text-bone" : reachable ? "text-ash hover:text-bone" : "text-ash/35")}>
                  {i === step && <motion.span layoutId="step-bar" className="absolute inset-x-0 -top-px h-px bg-silver" />}
                  <span className="font-display text-[13px] italic">{ROMAN[i]}</span>
                  <span className="font-mono text-[9.5px] uppercase tracking-[0.16em]">{s}</span>
                  {i < step && valid[i] && <Star size={6} className="absolute right-3 top-4 text-silver" />}
                </button>
              </li>
            );
          })}
        </ol>
      </nav>

      <div className="mt-10 grid gap-12 lg:grid-cols-[minmax(0,1fr)_340px] xl:gap-16">
        <div className="min-w-0">
          <AnimatePresence mode="wait" custom={dir} initial={false}>
            <motion.div key={step} custom={dir} initial={{ opacity: 0, x: dir * 28 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: dir * -28 }} transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}>
              {stepBody[step]}
            </motion.div>
          </AnimatePresence>

          {/* Actions */}
          <div className="fixed inset-x-0 bottom-[calc(var(--tabbar-h)+env(safe-area-inset-bottom))] z-30 flex gap-2 border-t border-[var(--line)] bg-ink/90 p-3 backdrop-blur-xl lg:static lg:mt-10 lg:border-0 lg:bg-transparent lg:p-0">
            {step > 0 && <Button type="button" onClick={() => go(step - 1)} className="px-4" aria-label="Back"><Arrow dir="left" /></Button>}
            {!last ? (
              <Button type="button" variant="primary" className="flex-1 lg:flex-none lg:px-10" disabled={!valid[step]} onClick={() => go(step + 1)}>
                Continue <Arrow />
              </Button>
            ) : (
              <Button type="button" variant="primary" className="flex-1 lg:flex-none lg:px-10" disabled={state === "sending" || !valid.slice(0, 6).every(Boolean)} onClick={send}>
                {state === "sending" ? "Sending…" : <>Send inquiry <Star size={9} /></>}
              </Button>
            )}
          </div>
        </div>

        {/* Live request sheet */}
        <aside className="hidden lg:block" aria-label="Your request so far">
          <div className="sticky top-8 etched bg-stone/60 p-6">
            <Corners />
            <p className="eyebrow">Request sheet</p>
            {reference && (
              <div className="mt-4 flex gap-3">
                <ArtImage image={reference.image} alt={reference.alt} sizes="80px" className="w-20 shrink-0" style={{ aspectRatio: `${reference.image.width}/${reference.image.height}` }} />
                <div>
                  <p className="eyebrow">Reference piece</p>
                  <p className="mt-1 font-display text-[1.2rem] leading-tight text-bone">{reference.title}</p>
                  <p className="mt-1 font-mono text-[9.5px] uppercase tracking-[0.14em] text-ash">{reference.styles.map((s) => STYLE_LABEL[s]).join(" / ")}</p>
                </div>
              </div>
            )}
            <dl className="mt-5 space-y-3.5">
              {[
                ["Type", TYPES.find((t) => t.id === d.type)?.label],
                ["Placement", d.placement],
                ["Size", SIZES.find((s) => s.id === d.size)?.label],
                ["Where", d.stopId === "flexible" ? "Flexible" : chosenStop ? locationById(snapshot, chosenStop.locationId)?.city : null],
                ["When", d.flexibleDates || d.stopId === "flexible" ? "Flexible" : d.dates.length ? d.dates.map(formatMonDay).join(", ") : null],
                ["References", files.length ? `${files.length} file${files.length > 1 ? "s" : ""}` : null],
              ].map(([k, v]) => (
                <div key={k} className="flex items-baseline justify-between gap-4 border-b border-dashed border-[var(--line)] pb-2">
                  <dt className="font-mono text-[9.5px] uppercase tracking-[0.16em] text-ash">{k}</dt>
                  <dd className={cx("truncate text-right text-[13.5px]", v ? "text-bone" : "text-ash/40")}>{v ?? "—"}</dd>
                </div>
              ))}
            </dl>
            {chosenStop && (
              <div className="mt-5 flex items-center gap-2">
                <StatusGlyph status={chosenStop.status} /> <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-mist">{STATUS[chosenStop.status].label}</span>
              </div>
            )}
          </div>
        </aside>
      </div>
    </section>
  );
}

/* ── pieces ── */
function Step({ title, lede, children }: { title: string; lede?: string; children: ReactNode }) {
  return (
    <div>
      <h2 className="display text-[2.2rem] text-bone sm:text-[2.9rem]">{title}</h2>
      {lede && <p className="mt-2 max-w-xl text-[14.5px] text-ash">{lede}</p>}
      <div className="mt-7">{children}</div>
    </div>
  );
}

function Choice({ selected, onClick, title, sub }: { selected: boolean; onClick: () => void; title: string; sub: string }) {
  return (
    <button type="button" onClick={onClick} aria-pressed={selected}
      className={cx("group relative flex items-start gap-4 border p-5 text-left transition-colors", selected ? "border-silver/70 bg-white/[0.06]" : "border-[var(--line)] hover:border-[var(--line-strong)]")}>
      <span aria-hidden className={cx("mt-1 grid size-3.5 shrink-0 rotate-45 place-items-center border transition-colors", selected ? "border-silver bg-silver" : "border-ash/60")} />
      <span>
        <span className="block font-display text-[1.45rem] leading-none text-bone">{title}</span>
        <span className="mt-1.5 block text-[13px] text-ash">{sub}</span>
      </span>
    </button>
  );
}

function Chip({ selected, onClick, children }: { selected: boolean; onClick: () => void; children: ReactNode }) {
  return (
    <button type="button" onClick={onClick} aria-pressed={selected}
      className={cx("border px-3.5 py-2.5 font-mono text-[10.5px] uppercase tracking-[0.14em] transition-colors", selected ? "border-silver/80 bg-silver text-ink" : "border-[var(--line)] text-mist hover:border-[var(--line-strong)] hover:text-bone")}>
      {children}
    </button>
  );
}

function Field({ label, hint, children }: { label: string; hint?: string; children: ReactNode }) {
  return (
    <label className="block">
      <span className="mb-2 flex items-baseline justify-between">
        <span className="eyebrow">{label}</span>
        {hint && <span className="font-mono text-[9.5px] uppercase tracking-[0.14em] text-ash/70">{hint}</span>}
      </span>
      {children}
    </label>
  );
}

function Input({ value, onChange, ...p }: { value: string; onChange: (v: string) => void; type?: string; autoComplete?: string; required?: boolean; placeholder?: string }) {
  return <input {...p} value={value} onChange={(e) => onChange(e.target.value)} className="h-12 w-full border border-[var(--line-strong)] bg-ink/40 px-4 text-[15px] text-bone placeholder:text-ash/50 focus:border-silver/70 focus:outline-none" />;
}

function Row({ label, value, onEdit, long }: { label: string; value?: string | null; onEdit: () => void; long?: boolean }) {
  return (
    <button type="button" onClick={onEdit} className="group grid w-full grid-cols-[7.5rem_1fr_auto] items-start gap-4 py-3.5 text-left">
      <dt className="pt-0.5 font-mono text-[9.5px] uppercase tracking-[0.16em] text-ash">{label}</dt>
      <dd className={cx("text-[14px] text-bone", long ? "line-clamp-3" : "truncate")}>{value || <span className="text-full">Missing</span>}</dd>
      <span className="font-mono text-[9.5px] uppercase tracking-[0.16em] text-ash group-hover:text-bone">Edit</span>
    </button>
  );
}

function ReferenceCard({ t, onRemove, compact }: { t: Tattoo; onRemove?: () => void; compact?: boolean }) {
  return (
    <div className={cx("relative flex gap-4 etched bg-stone/60 p-3", compact ? "mb-4" : "")}>
      <Corners />
      <ArtImage image={t.image} alt={t.alt} sizes="120px" className={cx("shrink-0", compact ? "w-16" : "w-24 sm:w-28")} style={{ aspectRatio: `${t.image.width}/${t.image.height}` }} />
      <div className="flex min-w-0 flex-1 flex-col justify-center">
        <p className="eyebrow">Reference piece</p>
        <p className="mt-1.5 font-display text-[1.5rem] leading-tight text-bone">{t.title}</p>
        <p className="mt-1 font-mono text-[10px] uppercase tracking-[0.14em] text-ash">Style · {t.styles.map((s) => STYLE_LABEL[s]).join(" / ")}</p>
        {!compact && <p className="mt-3 font-display text-[1.05rem] italic text-mist">Now tell me about your idea.</p>}
      </div>
      {onRemove && <button type="button" onClick={onRemove} className="self-start p-1 font-mono text-[10px] uppercase tracking-[0.16em] text-ash hover:text-bone" aria-label="Remove reference">×</button>}
    </div>
  );
}

function Dropzone({ files, setFiles }: { files: File[]; setFiles: (f: File[]) => void }) {
  const [over, setOver] = useState(false);
  const input = useRef<HTMLInputElement>(null);
  const add = (list: FileList | null) => {
    if (!list) return;
    const ok = [...list].filter((f) => f.type.startsWith("image/") && f.size < 10 * 1024 * 1024);
    setFiles([...files, ...ok].slice(0, 5));
  };
  const urls = useMemo(() => files.map((f) => URL.createObjectURL(f)), [files]);
  useEffect(() => () => urls.forEach(URL.revokeObjectURL), [urls]);
  return (
    <div>
      <button type="button" onClick={() => input.current?.click()}
        onDragOver={(e) => { e.preventDefault(); setOver(true); }} onDragLeave={() => setOver(false)}
        onDrop={(e) => { e.preventDefault(); setOver(false); add(e.dataTransfer.files); }}
        className={cx("hatch flex w-full flex-col items-center justify-center gap-3 border border-dashed px-6 py-12 text-center transition-colors", over ? "border-silver bg-white/[0.04]" : "border-[var(--line-strong)] hover:border-silver/50")}>
        <Star size={14} className="text-silver" />
        <span className="font-display text-[1.4rem] text-bone">Drop images or tap to choose</span>
        <span className="font-mono text-[9.5px] uppercase tracking-[0.16em] text-ash">JPG · PNG · HEIC · up to 10 MB each</span>
      </button>
      <input ref={input} type="file" accept="image/*" multiple hidden onChange={(e) => add(e.target.files)} />
      {files.length > 0 && (
        <ul className="mt-4 grid grid-cols-3 gap-2 sm:grid-cols-5">
          {files.map((f, i) => (
            <li key={i} className="relative aspect-square overflow-hidden border border-[var(--line)]">
              <img src={urls[i]} alt={f.name} className="size-full object-cover" />
              <button type="button" onClick={() => setFiles(files.filter((_, j) => j !== i))} aria-label={`Remove ${f.name}`} className="absolute right-1 top-1 grid size-7 place-items-center bg-ink/80 text-bone">×</button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function Sent({ mode, name, onReset }: { mode: "live" | "demo"; name: string; onReset: () => void }) {
  return (
    <section className="grid min-h-[80dvh] place-items-center px-6 py-20 text-center">
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }} className="max-w-lg">
        <Star size={22} className="mx-auto text-silver" />
        <h1 className="display mt-6 text-[3.4rem] sm:text-[4.4rem]"><span className="metal">Received.</span></h1>
        <p className="mt-4 font-display text-[1.35rem] leading-snug text-mist">Thanks{name ? `, ${name.split(" ")[0]}` : ""}. Your request is in — I'll review it and reply by email.</p>
        {mode === "demo" && <SampleTag className="mt-5">Preview — nothing was sent</SampleTag>}
        <ol className="mx-auto mt-10 grid max-w-md grid-cols-4 gap-2 text-left">
          {["Request", "Review", "Deposit", "Session"].map((s, i) => (
            <li key={s} className={cx("border-t pt-2", i === 0 ? "border-silver" : "border-[var(--line)]")}>
              <span className="font-display text-[12px] italic text-ash">{ROMAN[i]}</span>
              <span className={cx("block font-mono text-[9.5px] uppercase tracking-[0.14em]", i === 0 ? "text-bone" : "text-ash")}>{s}</span>
            </li>
          ))}
        </ol>
        <div className="mt-10 flex flex-wrap justify-center gap-2">
          <ButtonLink href="/work" variant="ghost">Back to the work</ButtonLink>
          <Button onClick={onReset} variant="quiet">New request</Button>
        </div>
      </motion.div>
    </section>
  );
}

