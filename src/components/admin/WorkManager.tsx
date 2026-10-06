"use client";
import { useEffect, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "motion/react";
import type { StyleTag } from "@/lib/types";
import type { AdminTattoo } from "@/lib/admin/queries";
import { STYLE_FILTERS, STYLE_LABEL } from "@/lib/status";
import { src as imgSrc } from "@/lib/images";
import { processImage, uploadProcessed, type ProcessedImage } from "@/lib/admin/process-image";
import { createUploadSlots, deleteTattoo, reorderTattoos, saveTattoo, setTattooFlags } from "@/app/admin/actions";
import { ArtImage, Button, Star, cx } from "@/components/ui/primitives";
import { ChipGroup, ConfirmButton, Field, PageHead, Sheet, TextArea, TextInput, Toggle, useToast } from "./kit";

const STYLE_OPTIONS = STYLE_FILTERS.map((s) => ({ value: s, label: STYLE_LABEL[s] }));

export function WorkManager({ initial }: { initial: AdminTattoo[] }) {
  const [list, setList] = useState(initial);
  useEffect(() => setList(initial), [initial]);
  const [editing, setEditing] = useState<AdminTattoo | "new" | null>(null);
  const toast = useToast();
  const router = useRouter();
  const [, startTransition] = useTransition();

  const move = (i: number, d: -1 | 1) => {
    const j = i + d;
    if (j < 0 || j >= list.length) return;
    const next = [...list];
    [next[i], next[j]] = [next[j], next[i]];
    setList(next);
    startTransition(async () => {
      const r = await reorderTattoos(next.map((t) => t.id));
      if (!r.ok) { toast(r.error, "error"); setList(list); }
    });
  };

  const flag = (t: AdminTattoo, f: { featured?: boolean; published?: boolean }) => {
    setList((l) => l.map((x) => (x.id === t.id ? { ...x, ...f } : x)));
    startTransition(async () => {
      const r = await setTattooFlags(t.id, f);
      if (!r.ok) { toast(r.error, "error"); setList((l) => l.map((x) => (x.id === t.id ? t : x))); }
      else toast(f.published === false ? "Hidden from site" : f.published ? "Visible on site" : f.featured ? "Featured" : "Unfeatured");
    });
  };

  const live = list.filter((t) => t.published).length;

  return (
    <>
      <PageHead
        eyebrow="Portfolio"
        title="The Work"
        sub={<>{live} live{list.length - live ? ` · ${list.length - live} hidden` : ""} · first in the list shows first on the site</>}
        action={<Button variant="primary" onClick={() => setEditing("new")}><Star size={9} /> Add piece</Button>}
      />

      <ol className="mt-8 border-t border-[var(--line)]">
        <AnimatePresence initial={false}>
          {list.map((t, i) => (
            <motion.li key={t.id} layout transition={{ type: "spring", stiffness: 500, damping: 40 }} className="flex items-center gap-3 border-b border-[var(--line)] py-3">
              <div className="flex flex-col">
                <button onClick={() => move(i, -1)} disabled={i === 0} className="grid size-8 place-items-center text-ash hover:text-bone disabled:opacity-20" aria-label={`Move ${t.title} up`}>▲</button>
                <button onClick={() => move(i, 1)} disabled={i === list.length - 1} className="grid size-8 place-items-center text-ash hover:text-bone disabled:opacity-20" aria-label={`Move ${t.title} down`}>▼</button>
              </div>
              <button onClick={() => setEditing(t)} className="flex min-w-0 flex-1 items-center gap-3.5 text-left">
                <ArtImage image={t.image} alt="" sizes="64px" className={cx("size-16 shrink-0", !t.published && "opacity-35 grayscale")} />
                <span className="min-w-0">
                  <span className="flex items-center gap-2">
                    <span className="truncate font-display text-[1.25rem] text-bone">{t.title}</span>
                    {!t.published && <span className="shrink-0 border border-ash/50 px-1.5 font-mono text-[10.5px] uppercase tracking-[0.14em] text-ash">Hidden</span>}
                  </span>
                  <span className="mt-0.5 block truncate font-mono text-[11px] uppercase tracking-[0.14em] text-ash">{t.styles.map((s) => STYLE_LABEL[s]).join(" · ") || "No style set"}</span>
                </span>
              </button>
              <button onClick={() => flag(t, { featured: !t.featured })} aria-pressed={t.featured} aria-label={t.featured ? "Unfeature" : "Feature on home"} className={cx("grid size-10 shrink-0 place-items-center border transition-colors", t.featured ? "border-silver/60 text-silver" : "border-[var(--line)] text-ash/50 hover:text-bone")}>
                <Star size={11} />
              </button>
              <button onClick={() => flag(t, { published: !t.published })} aria-pressed={t.published} aria-label={t.published ? "Hide from site" : "Show on site"} className={cx("hidden size-10 shrink-0 place-items-center border transition-colors sm:grid", t.published ? "border-[var(--line)] text-mist" : "border-[var(--line)] text-ash/40")}>
                <EyeIcon off={!t.published} />
              </button>
            </motion.li>
          ))}
        </AnimatePresence>
      </ol>
      <p className="mt-4 font-mono text-[11px] uppercase tracking-[0.14em] text-ash">★ = rotates in the home page hero · ▲▼ = order on the site</p>

      <PieceEditor
        piece={editing}
        onClose={() => setEditing(null)}
        onSaved={(msg) => { toast(msg); setEditing(null); router.refresh(); }}
      />
    </>
  );
}

function PieceEditor({ piece, onClose, onSaved }: { piece: AdminTattoo | "new" | null; onClose: () => void; onSaved: (msg: string) => void }) {
  const isNew = piece === "new";
  const t = piece && piece !== "new" ? piece : null;
  const [title, setTitle] = useState("");
  const [styles, setStyles] = useState<StyleTag[]>([]);
  const [placement, setPlacement] = useState("");
  const [description, setDescription] = useState("");
  const [alt, setAlt] = useState("");
  const [featured, setFeatured] = useState(false);
  const [published, setPublished] = useState(true);
  const [file, setFile] = useState<File | null>(null);
  const [trim, setTrim] = useState(true);
  const [img, setImg] = useState<ProcessedImage | null>(null);
  const [busy, setBusy] = useState<"" | "processing" | "uploading" | "saving" | "deleting">("");
  const fileRef = useRef<HTMLInputElement>(null);
  const toast = useToast();

  useEffect(() => {
    if (!piece) return;
    setTitle(t?.title ?? ""); setStyles(t?.styles ?? []); setPlacement(t?.placement ?? "");
    setDescription(t?.description ?? ""); setAlt(t && t.alt !== t.title ? t.alt : ""); setFeatured(t?.featured ?? false);
    setPublished(t?.published ?? true); setFile(null); setImg(null); setTrim(true); setBusy("");
  }, [piece]); // eslint-disable-line react-hooks/exhaustive-deps

  // (Re)process whenever the file or the trim choice changes
  useEffect(() => {
    if (!file) return;
    let cancelled = false;
    setBusy("processing");
    processImage(file, { trimBars: trim })
      .then((p) => { if (!cancelled) setImg((old) => { if (old) URL.revokeObjectURL(old.previewUrl); return p; }); })
      .catch((e) => toast(e.message, "error"))
      .finally(() => !cancelled && setBusy(""));
    return () => { cancelled = true; };
  }, [file, trim]); // eslint-disable-line react-hooks/exhaustive-deps

  const save = async () => {
    try {
      let image;
      if (img) {
        setBusy("uploading");
        const key = await uploadProcessed(img, "tattoos", createUploadSlots);
        image = { key, width: img.width, height: img.height, blur: img.blur, tone: img.tone };
      }
      setBusy("saving");
      const r = await saveTattoo({ id: t?.id, title, styles, placement, description, alt, featured, published, image });
      if (!r.ok) throw new Error(r.error);
      onSaved(isNew ? "Added to the archive" : "Saved");
    } catch (e) {
      toast(e instanceof Error ? e.message : "Couldn't save", "error");
      setBusy("");
    }
  };

  const remove = async () => {
    if (!t) return;
    setBusy("deleting");
    const r = await deleteTattoo(t.id);
    if (r.ok) onSaved("Deleted");
    else { toast(r.error, "error"); setBusy(""); }
  };

  const previewSrc = img?.previewUrl ?? (t ? imgSrc(t.image) : null);
  const aspect = img ? img.width / img.height : t ? t.image.width / t.image.height : 4 / 5;
  const canSave = !!title.trim() && (!!img || !!t) && !busy;

  return (
    <Sheet
      open={!!piece}
      onClose={onClose}
      title={isNew ? "New piece" : "Edit piece"}
      footer={
        <div className="flex items-center gap-2">
          {t && <ConfirmButton onConfirm={remove} busy={!!busy} />}
          <Button variant="primary" className="ml-auto flex-1 sm:flex-none sm:px-10" onClick={save} disabled={!canSave}>
            {busy === "uploading" ? "Uploading photo…" : busy === "saving" ? "Saving…" : busy === "deleting" ? "Deleting…" : isNew ? "Add to archive" : "Save changes"}
          </Button>
        </div>
      }
    >
      <div className="space-y-5">
        {/* Photo */}
        <div>
          <input ref={fileRef} type="file" accept="image/*" hidden onChange={(e) => { const f = e.target.files?.[0]; if (f) setFile(f); e.target.value = ""; }} />
          {previewSrc ? (
            <div className="relative mx-auto w-full max-w-xs overflow-hidden border border-[var(--line)] bg-ink" style={{ aspectRatio: aspect }}>
              <img src={previewSrc} alt="" className={cx("size-full object-cover transition-opacity", busy === "processing" && "opacity-40")} />
              {busy === "processing" && <span className="absolute inset-0 grid place-items-center font-mono text-[11px] uppercase tracking-[0.2em] text-bone">Preparing…</span>}
            </div>
          ) : (
            <button type="button" onClick={() => fileRef.current?.click()} className="hatch flex aspect-[4/5] w-full max-w-xs flex-col items-center justify-center gap-3 border border-dashed border-[var(--line-strong)] text-center hover:border-silver/50 mx-auto">
              <Star size={14} className="text-gold" />
              <span className="font-display text-[1.3rem] text-bone">Choose a photo</span>
              <span className="font-mono text-[11px] uppercase tracking-[0.14em] text-ash">From your camera roll</span>
            </button>
          )}
          {previewSrc && (
            <div className="mx-auto mt-3 flex max-w-xs flex-col gap-2">
              <Button type="button" onClick={() => fileRef.current?.click()} className="w-full">{t || img ? "Replace photo" : "Choose photo"}</Button>
              {file && (
                <Toggle checked={trim} onChange={setTrim} label="Trim black screenshot bars" sub={img?.trimmed ? "Bars found and cropped off" : "No bars found"} />
              )}
            </div>
          )}
          <p className="mx-auto mt-2 max-w-xs text-center text-[11.5px] text-ash">Photos are only resized and cropped — never edited.</p>
        </div>

        <Field label="Title"><TextInput value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Death's-Head Moth" /></Field>
        <Field label="Styles" hint="Shows in filters"><ChipGroup options={STYLE_OPTIONS} value={styles} onChange={setStyles} /></Field>
        <Field label="Placement" hint="Optional"><TextInput value={placement} onChange={(e) => setPlacement(e.target.value)} placeholder="e.g. Forearm" /></Field>
        <Field label="Description" hint="Optional"><TextArea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="What's in the piece — linework, shading, details." /></Field>
        <Field label="Alt text" hint="For screen readers & Google"><TextInput value={alt} onChange={(e) => setAlt(e.target.value)} placeholder="Defaults to the title" /></Field>
        <div className="space-y-2">
          <Toggle checked={featured} onChange={setFeatured} label="Featured" sub="Rotates in the home page hero" />
          <Toggle checked={published} onChange={setPublished} label="Visible on site" sub="Turn off to hide without deleting" />
        </div>
      </div>
    </Sheet>
  );
}

function EyeIcon({ off }: { off?: boolean }) {
  return (
    <svg width="16" height="16" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.2" aria-hidden>
      <path d="M1.8 10 C5 4.6 15 4.6 18.2 10 C15 15.4 5 15.4 1.8 10Z" /><circle cx="10" cy="10" r="2.4" />
      {off && <path d="M3 17 L17 3" />}
    </svg>
  );
}
