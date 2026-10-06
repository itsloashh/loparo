"use client";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import type { InquiryStatus, Location, Stop } from "@/lib/types";
import type { AdminInquiry, AdminTattoo } from "@/lib/admin/queries";
import { formatMonDay, formatRange } from "@/lib/dates";
import { deleteInquiry, updateInquiry } from "@/app/admin/actions";
import { ArtImage, Button, cx } from "@/components/ui/primitives";
import { ConfirmButton, Field, PageHead, Sheet, TextArea, useToast } from "./kit";
import { PIPELINE } from "@/lib/admin/pipeline";

const TYPE_LABEL: Record<string, string> = { custom: "Custom piece", portfolio: "Portfolio inspired", flash: "Flash", "cover-up": "Cover-up", other: "Other" };
const SIZE_LABEL: Record<string, string> = { tiny: "Tiny", small: "Small", medium: "Medium", large: "Large", session: "Multi-session" };

const ago = (iso: string) => {
  const m = Math.round((Date.now() - new Date(iso).getTime()) / 60000);
  if (m < 60) return `${Math.max(m, 1)}m ago`;
  const h = Math.round(m / 60);
  if (h < 48) return `${h}h ago`;
  return new Date(iso).toLocaleDateString("en-CA", { month: "short", day: "numeric" });
};

export function InquiriesManager({ inquiries, tattoos, stops, locations }: { inquiries: AdminInquiry[]; tattoos: AdminTattoo[]; stops: Stop[]; locations: Location[] }) {
  const [filter, setFilter] = useState<InquiryStatus | "open" | "all">("open");
  const [openId, setOpenId] = useState<string | null>(null);
  const [list, setList] = useState(inquiries);
  useEffect(() => setList(inquiries), [inquiries]);

  const counts = useMemo(() => {
    const m = new Map<string, number>();
    list.forEach((i) => m.set(i.status, (m.get(i.status) ?? 0) + 1));
    return m;
  }, [list]);
  const isOpen = (s: InquiryStatus) => s !== "completed" && s !== "declined";
  const shown = list.filter((i) => (filter === "all" ? true : filter === "open" ? isOpen(i.status) : i.status === filter));
  const where = (id: string | null) => {
    const s = stops.find((x) => x.id === id);
    const l = s && locations.find((x) => x.id === s.locationId);
    return l ? `${l.city} · ${formatRange(s!.startDate, s!.endDate)}` : "Flexible";
  };
  const current = list.find((i) => i.id === openId) ?? null;

  return (
    <>
      <PageHead eyebrow="Requests" title="Inbox" sub={`${list.filter((i) => isOpen(i.status)).length} open · ${counts.get("new") ?? 0} new`} />

      <div role="radiogroup" aria-label="Filter" className="no-scrollbar -mx-4 mt-6 flex gap-1 overflow-x-auto px-4 pb-1 sm:mx-0 sm:px-0">
        {[{ id: "open", label: "Open" }, ...PIPELINE, { id: "all", label: "All" }].map((f) => {
          const n = f.id === "all" ? list.length : f.id === "open" ? list.filter((i) => isOpen(i.status)).length : counts.get(f.id) ?? 0;
          const on = filter === f.id;
          return (
            <button key={f.id} role="radio" aria-checked={on} onClick={() => setFilter(f.id as typeof filter)}
              className={cx("flex shrink-0 items-center gap-2 border px-3 py-2 font-mono text-[11px] uppercase tracking-[0.14em] transition-colors", on ? "border-silver bg-silver text-ink" : "border-[var(--line)] text-ash hover:text-bone")}>
              {f.label} <span className={on ? "text-ink/60" : "text-ash/60"}>{n}</span>
            </button>
          );
        })}
      </div>

      <ul className="mt-5 space-y-2">
        {shown.map((i) => {
          const p = PIPELINE.find((x) => x.id === i.status)!;
          return (
            <li key={i.id}>
              <button onClick={() => setOpenId(i.id)} className="block w-full border border-[var(--line)] p-4 text-left transition-colors hover:border-[var(--line-strong)] hover:bg-white/[0.02]">
                <span className="flex items-start justify-between gap-3">
                  <span className="min-w-0">
                    <span className="flex items-center gap-2">
                      {i.status === "new" && <span className="size-1.5 shrink-0 rounded-full bg-silver" aria-label="New" />}
                      <span className="truncate font-display text-[1.3rem] text-bone">{i.name}</span>
                    </span>
                    <span className="mt-0.5 block font-mono text-[11px] uppercase tracking-[0.12em] text-ash">
                      {TYPE_LABEL[i.type]} · {i.placement} · {SIZE_LABEL[i.size] ?? i.size}
                    </span>
                  </span>
                  <span className="shrink-0 text-right">
                    <span className="block font-mono text-[11px] uppercase tracking-[0.14em]" style={{ color: p.tone }}>{p.label}</span>
                    <span className="mt-1 block font-mono text-[11px] text-ash">{ago(i.createdAt)}</span>
                  </span>
                </span>
                <span className="mt-2 line-clamp-2 block text-[13.5px] text-mist">{i.idea}</span>
                <span className="mt-2 block font-mono text-[11px] uppercase tracking-[0.12em] text-ash">{where(i.scheduleId)}</span>
              </button>
            </li>
          );
        })}
        {!shown.length && <li className="border border-dashed border-[var(--line)] p-8 text-center text-[14px] text-ash">Nothing here.</li>}
      </ul>

      <InquiryDetail
        inquiry={current}
        reference={current?.referenceTattooId ? tattoos.find((t) => t.id === current.referenceTattooId || t.slug === current.referenceTattooId) ?? null : null}
        where={current ? where(current.scheduleId) : ""}
        onClose={() => setOpenId(null)}
        onChange={(patch) => setList((l) => l.map((x) => (x.id === openId ? { ...x, ...patch } : x)))}
        onDeleted={() => { setList((l) => l.filter((x) => x.id !== openId)); setOpenId(null); }}
      />
    </>
  );
}

function InquiryDetail({ inquiry: i, reference, where, onClose, onChange, onDeleted }: {
  inquiry: AdminInquiry | null; reference: AdminTattoo | null; where: string; onClose: () => void;
  onChange: (p: Partial<AdminInquiry>) => void; onDeleted: () => void;
}) {
  const [notes, setNotes] = useState("");
  const [busy, setBusy] = useState(false);
  const toast = useToast();
  const router = useRouter();
  useEffect(() => { setNotes(i?.internalNotes ?? ""); }, [i?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  const setStatus = async (status: InquiryStatus) => {
    if (!i) return;
    const prev = i.status;
    onChange({ status });
    const r = await updateInquiry(i.id, { status });
    if (!r.ok) { onChange({ status: prev }); toast(r.error, "error"); }
    else { toast(`Marked ${PIPELINE.find((p) => p.id === status)!.label.toLowerCase()}`); router.refresh(); }
  };
  const saveNotes = async () => {
    if (!i) return;
    setBusy(true);
    const r = await updateInquiry(i.id, { internalNotes: notes });
    setBusy(false);
    if (r.ok) { onChange({ internalNotes: notes }); toast("Notes saved"); } else toast(r.error, "error");
  };
  const remove = async () => {
    if (!i) return;
    setBusy(true);
    const r = await deleteInquiry(i.id);
    setBusy(false);
    if (r.ok) { toast("Deleted"); onDeleted(); router.refresh(); } else toast(r.error, "error");
  };
  const copy = async (text: string) => {
    try { await navigator.clipboard.writeText(text); toast("Copied"); } catch { toast(text); }
  };

  // Opening a "new" request moves it to reviewing automatically
  useEffect(() => {
    if (i?.status === "new") void setStatus("reviewing");
  }, [i?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <Sheet
      open={!!i}
      onClose={onClose}
      title={i?.name ?? ""}
      footer={i && (
        <div className="flex items-center gap-2">
          <ConfirmButton onConfirm={remove} busy={busy} />
          <a href={`mailto:${i.email}?subject=${encodeURIComponent("Your tattoo request — LOASH")}`} className="sweep ml-auto flex h-11 flex-1 items-center justify-center border border-white/40 bg-gradient-to-b from-[#e9e8e4] to-[#b9b8b3] px-6 font-mono text-[12px] uppercase tracking-[0.2em] text-ink sm:flex-none">
            Reply by email
          </a>
        </div>
      )}
    >
      {i && (
        <div className="space-y-6">
          <div>
            <p className="eyebrow mb-2">Status</p>
            <div className="flex flex-wrap gap-1.5">
              {PIPELINE.map((p) => (
                <button key={p.id} onClick={() => setStatus(p.id)} aria-pressed={i.status === p.id}
                  className={cx("border px-3 py-2 font-mono text-[11px] uppercase tracking-[0.12em] transition-colors", i.status === p.id ? "border-silver bg-white/[0.08] text-bone" : "border-[var(--line)] text-ash hover:text-bone")}
                  style={i.status === p.id ? { color: p.tone, borderColor: p.tone } : undefined}>
                  {p.label}
                </button>
              ))}
            </div>
          </div>

          <dl className="divide-y divide-[var(--line)] border-y border-[var(--line)]">
            {[
              ["Received", new Date(i.createdAt).toLocaleString("en-CA", { dateStyle: "medium", timeStyle: "short" })],
              ["Looking for", TYPE_LABEL[i.type]],
              ["Placement", i.placement],
              ["Size", SIZE_LABEL[i.size] ?? i.size],
              ["Where", where],
              ["Dates", i.flexibleDates ? "Flexible" : i.preferredDates.map(formatMonDay).join(", ") || "—"],
            ].map(([k, v]) => (
              <div key={k} className="grid grid-cols-[7rem_1fr] gap-3 py-2.5">
                <dt className="pt-0.5 font-mono text-[11px] uppercase tracking-[0.14em] text-ash">{k}</dt>
                <dd className="text-[14px] text-bone">{v}</dd>
              </div>
            ))}
          </dl>

          <div>
            <p className="eyebrow mb-2">The idea</p>
            <p className="whitespace-pre-wrap font-display text-[1.2rem] leading-snug text-mist">{i.idea}</p>
          </div>

          {(reference || i.referenceUrls.length > 0) && (
            <div>
              <p className="eyebrow mb-2">References</p>
              <div className="grid grid-cols-3 gap-2">
                {reference && (
                  <div className="relative">
                    <ArtImage image={reference.image} alt={reference.title} sizes="160px" className="aspect-square w-full" />
                    <span className="absolute inset-x-0 bottom-0 truncate bg-ink/80 px-2 py-1 font-mono text-[10.5px] uppercase tracking-[0.12em] text-silver">Your piece · {reference.title}</span>
                  </div>
                )}
                {i.referenceUrls.map((u, n) => (
                  <a key={u} href={u} target="_blank" rel="noreferrer" className="block aspect-square overflow-hidden border border-[var(--line)]">
                    <img src={u} alt={`Client reference ${n + 1}`} className="size-full object-cover" />
                  </a>
                ))}
              </div>
            </div>
          )}

          <div>
            <p className="eyebrow mb-2">Contact</p>
            <div className="space-y-1.5">
              {[i.email, i.phone, i.instagram].filter(Boolean).map((c) => (
                <button key={c} onClick={() => copy(c!)} className="flex w-full items-center justify-between border border-[var(--line)] px-3.5 py-2.5 text-left text-[14px] text-bone hover:border-[var(--line-strong)]">
                  <span className="truncate">{c}</span><span className="font-mono text-[11px] uppercase tracking-[0.14em] text-ash">Copy</span>
                </button>
              ))}
            </div>
          </div>

          <Field label="Private notes" hint="Only you see these">
            <TextArea value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Quote, deposit sent, design ideas…" />
          </Field>
          <Button onClick={saveNotes} disabled={busy || notes === i.internalNotes} className="w-full">Save notes</Button>
        </div>
      )}
    </Sheet>
  );
}
