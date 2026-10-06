"use client";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import type { StyleTag } from "@/lib/types";
import type { AdminProfile } from "@/lib/admin/queries";
import { STYLE_FILTERS, STYLE_LABEL } from "@/lib/status";
import { src as imgSrc } from "@/lib/images";
import { processImage, uploadProcessed, type ProcessedImage } from "@/lib/admin/process-image";
import { createUploadSlots, saveProfile } from "@/app/admin/actions";
import { Button, Star, cx } from "@/components/ui/primitives";
import { ChipGroup, Field, PageHead, Section, TextArea, TextInput, Toggle, useToast } from "./kit";

const STYLE_OPTIONS = STYLE_FILTERS.filter((s) => s !== "custom").map((s) => ({ value: s, label: STYLE_LABEL[s] }));

export function ProfileEditor({ profile }: { profile: AdminProfile }) {
  const p = profile;
  const [name, setName] = useState(p.name);
  const [handle, setHandle] = useState(p.handle);
  const [tagline, setTagline] = useState(p.tagline);
  const [homeCity, setHomeCity] = useState(p.homeCity);
  const [byAppt, setByAppt] = useState(p.byAppointmentOnly);
  const [styles, setStyles] = useState<StyleTag[]>(p.styles);
  const [notOffered, setNotOffered] = useState(p.notOffered.join(", "));
  const [bio, setBio] = useState(p.bioIsPlaceholder ? "" : p.bio.join("\n\n"));
  const [email, setEmail] = useState(p.contactEmail ?? "");
  const [socials, setSocials] = useState(p.socials);
  const [faq, setFaq] = useState(p.faqIsPlaceholder ? p.faq.map((f) => ({ q: f.q, a: "" })) : p.faq);
  const [portrait, setPortrait] = useState<ProcessedImage | null>(null);
  const [removePortrait, setRemovePortrait] = useState(false);
  const [busy, setBusy] = useState(false);
  const [dirty, setDirty] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const toast = useToast();
  const router = useRouter();

  // any edit marks the form dirty
  const d = <T,>(fn: (v: T) => void) => (v: T) => { fn(v); setDirty(true); };

  useEffect(() => {
    const warn = (e: BeforeUnloadEvent) => { if (dirty) e.preventDefault(); };
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [dirty]);

  const pickPortrait = async (f: File) => {
    try {
      setBusy(true);
      const img = await processImage(f, { trimBars: true });
      setPortrait(img); setRemovePortrait(false); setDirty(true);
    } catch (e) { toast(e instanceof Error ? e.message : "Couldn't read photo", "error"); }
    finally { setBusy(false); }
  };

  const save = async () => {
    setBusy(true);
    try {
      let portraitInput: { key: string; width: number; height: number } | null | undefined;
      if (portrait) portraitInput = { key: await uploadProcessed(portrait, "profile", createUploadSlots), width: portrait.width, height: portrait.height };
      else if (removePortrait) portraitInput = null;
      const r = await saveProfile({
        name, handle, tagline, homeCity, byAppointment: byAppt, styles,
        notOffered: notOffered.split(","), bio: bio.split(/\n\s*\n/), contactEmail: email,
        socials, faq, portrait: portraitInput,
      });
      if (!r.ok) throw new Error(r.error);
      toast("Profile saved — live on the site");
      setDirty(false); setPortrait(null);
      router.refresh();
    } catch (e) {
      toast(e instanceof Error ? e.message : "Couldn't save", "error");
    } finally { setBusy(false); }
  };

  const portraitSrc = portrait?.previewUrl ?? (!removePortrait && p.portrait ? imgSrc(p.portrait) : null);

  return (
    <>
      <PageHead eyebrow="Site text" title="Profile" sub="Everything on the About page, plus the details used across the site." />

      <Section title="Portrait">
        <input ref={fileRef} type="file" accept="image/*" hidden onChange={(e) => { const f = e.target.files?.[0]; if (f) pickPortrait(f); e.target.value = ""; }} />
        <div className="flex items-end gap-4">
          <div className="hatch relative aspect-[4/5] w-32 shrink-0 overflow-hidden border border-[var(--line)]">
            {portraitSrc ? <img src={portraitSrc} alt="" className="size-full object-cover" /> : <span className="absolute inset-0 grid place-items-center font-mono text-[9px] uppercase tracking-[0.14em] text-ash">None</span>}
          </div>
          <div className="flex flex-col gap-2">
            <Button type="button" onClick={() => fileRef.current?.click()} disabled={busy}>{portraitSrc ? "Replace" : "Upload"} portrait</Button>
            {portraitSrc && <button type="button" onClick={() => { setPortrait(null); setRemovePortrait(true); setDirty(true); }} className="font-mono text-[10px] uppercase tracking-[0.16em] text-ash hover:text-full">Remove</button>}
          </div>
        </div>
      </Section>

      <Section title="Identity">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Name"><TextInput value={name} onChange={(e) => d(setName)(e.target.value)} /></Field>
          <Field label="Handle"><TextInput value={handle} onChange={(e) => d(setHandle)(e.target.value)} /></Field>
          <Field label="Tagline"><TextInput value={tagline} onChange={(e) => d(setTagline)(e.target.value)} /></Field>
          <Field label="Home city"><TextInput value={homeCity} onChange={(e) => d(setHomeCity)(e.target.value)} /></Field>
          <Field label="Contact email" hint="Optional, not shown yet" className="sm:col-span-2"><TextInput type="email" value={email} onChange={(e) => d(setEmail)(e.target.value)} /></Field>
        </div>
        <div className="mt-3"><Toggle checked={byAppt} onChange={d(setByAppt)} label="By appointment only" /></div>
      </Section>

      <Section title="Bio">
        <Field label="About you" hint="Blank line = new paragraph">
          <TextArea rows={8} value={bio} onChange={(e) => d(setBio)(e.target.value)} placeholder="How you got into tattooing, what pulls you toward dark, graphic imagery, what a session with you is like…" />
        </Field>
        {!bio.trim() && <p className="mt-2 text-[12px] text-limited">Empty — the site shows a placeholder until you write this.</p>}
      </Section>

      <Section title="Styles">
        <Field label="What you tattoo" hint="Home & About pages"><ChipGroup options={STYLE_OPTIONS} value={styles} onChange={d(setStyles)} /></Field>
        <Field label="Not offered" hint="Comma separated" className="mt-4"><TextInput value={notOffered} onChange={(e) => d(setNotOffered)(e.target.value)} placeholder="Realism, Colour portraits" /></Field>
      </Section>

      <Section title="Socials" action={<button type="button" onClick={() => d(setSocials)([...socials, { label: "", handle: "", href: "" }])} className="font-mono text-[10px] uppercase tracking-[0.18em] text-mist hover:text-bone">+ Add</button>}>
        <ul className="space-y-3">
          {socials.map((s, i) => (
            <li key={i} className="grid grid-cols-[1fr_1fr_auto] gap-2 sm:grid-cols-[8rem_8rem_1fr_auto]">
              <TextInput aria-label="Label" placeholder="Instagram" value={s.label} onChange={(e) => d(setSocials)(socials.map((x, j) => (j === i ? { ...x, label: e.target.value } : x)))} />
              <TextInput aria-label="Handle" placeholder="@loash" value={s.handle} onChange={(e) => d(setSocials)(socials.map((x, j) => (j === i ? { ...x, handle: e.target.value } : x)))} />
              <TextInput aria-label="Link" placeholder="https://…" className="col-span-2 row-start-2 sm:col-span-1 sm:row-start-auto" value={s.href} onChange={(e) => d(setSocials)(socials.map((x, j) => (j === i ? { ...x, href: e.target.value } : x)))} />
              <button type="button" onClick={() => d(setSocials)(socials.filter((_, j) => j !== i))} className="grid h-12 w-10 place-items-center border border-[var(--line)] text-ash hover:text-full" aria-label="Remove">×</button>
            </li>
          ))}
        </ul>
      </Section>

      <Section title="FAQ — Before you book" action={<button type="button" onClick={() => d(setFaq)([...faq, { q: "", a: "" }])} className="font-mono text-[10px] uppercase tracking-[0.18em] text-mist hover:text-bone">+ Add question</button>}>
        <ol className="space-y-4">
          {faq.map((f, i) => (
            <li key={i} className="border border-[var(--line)] p-3">
              <div className="flex items-center gap-2">
                <span className="font-display text-[14px] italic text-ash">{i + 1}</span>
                <TextInput value={f.q} placeholder="Question" onChange={(e) => d(setFaq)(faq.map((x, j) => (j === i ? { ...x, q: e.target.value } : x)))} />
                <div className="flex shrink-0 flex-col">
                  <button type="button" disabled={i === 0} onClick={() => { const n = [...faq]; [n[i - 1], n[i]] = [n[i], n[i - 1]]; d(setFaq)(n); }} className="px-2 text-[11px] text-ash hover:text-bone disabled:opacity-20" aria-label="Move up">▲</button>
                  <button type="button" disabled={i === faq.length - 1} onClick={() => { const n = [...faq]; [n[i + 1], n[i]] = [n[i], n[i + 1]]; d(setFaq)(n); }} className="px-2 text-[11px] text-ash hover:text-bone disabled:opacity-20" aria-label="Move down">▼</button>
                </div>
              </div>
              <TextArea className="mt-2 min-h-20" value={f.a} placeholder="Answer" onChange={(e) => d(setFaq)(faq.map((x, j) => (j === i ? { ...x, a: e.target.value } : x)))} />
              <button type="button" onClick={() => d(setFaq)(faq.filter((_, j) => j !== i))} className="mt-2 font-mono text-[9.5px] uppercase tracking-[0.16em] text-ash hover:text-full">Remove</button>
            </li>
          ))}
        </ol>
      </Section>

      {/* Sticky save */}
      <div className={cx("fixed inset-x-0 bottom-[calc(var(--tabbar-h)+env(safe-area-inset-bottom))] z-30 border-t border-[var(--line)] bg-ink/90 px-4 py-3 backdrop-blur-xl transition-transform duration-300 lg:bottom-0 lg:left-60", dirty || portrait ? "translate-y-0" : "translate-y-[150%]")}>
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-3">
          <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-limited">Unsaved changes</span>
          <Button variant="primary" onClick={save} disabled={busy} className="px-8"><Star size={9} /> {busy ? "Saving…" : "Save & publish"}</Button>
        </div>
      </div>
      <div className="h-24" />
    </>
  );
}
