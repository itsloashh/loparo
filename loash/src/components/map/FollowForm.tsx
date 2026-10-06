"use client";
import { useState } from "react";
import { useData } from "@/lib/app-context";
import { submitFollow } from "@/lib/api";
import { Button, Star, cx } from "@/components/ui/primitives";

/**
 * FOLLOW LOASH — pick cities, get told when books open there.
 * V1 stores the subscription (Supabase `follows`); the notifier is a later job
 * that fires when a stop's status flips to open.
 */
export function FollowForm({ preselect, className }: { preselect?: string[]; className?: string }) {
  const { snapshot } = useData();
  const [picked, setPicked] = useState<string[]>(preselect ?? []);
  const [email, setEmail] = useState("");
  const [state, setState] = useState<"idle" | "sending" | "done" | "error">("idle");
  const [msg, setMsg] = useState("");

  const toggle = (id: string) => setPicked((p) => (p.includes(id) ? p.filter((x) => x !== id) : [...p, id]));

  if (state === "done")
    return (
      <div className={cx("etched p-5", className)} role="status">
        <p className="flex items-center gap-2 font-display text-xl text-bone"><Star size={10} /> You're on the list.</p>
        <p className="mt-1 text-[13px] text-ash">{msg}</p>
      </div>
    );

  return (
    <form
      className={cx("etched p-5", className)}
      onSubmit={async (e) => {
        e.preventDefault();
        if (!picked.length) return;
        setState("sending");
        const r = await submitFollow({ email, locationIds: picked });
        if (r.ok) {
          setMsg(r.mode === "demo" ? "Preview mode — nothing was stored." : "I'll email you the moment books open.");
          setState("done");
        } else {
          setMsg(r.error);
          setState("error");
        }
      }}
    >
      <p className="eyebrow">Follow Loash</p>
      <p className="mt-2 font-display text-[1.35rem] leading-snug text-bone">Get a note when books open in your city.</p>
      <fieldset className="mt-4">
        <legend className="sr-only">Cities</legend>
        <div className="flex flex-wrap gap-1.5">
          {snapshot.locations.map((l) => {
            const on = picked.includes(l.id);
            return (
              <label key={l.id} className={cx("flex cursor-pointer items-center gap-2 border px-3 py-2 font-mono text-[10px] uppercase tracking-[0.16em] transition-colors", on ? "border-silver/70 bg-white/[0.06] text-bone" : "border-[var(--line)] text-ash hover:text-bone")}>
                <input type="checkbox" className="sr-only" checked={on} onChange={() => toggle(l.id)} />
                <span aria-hidden className={cx("grid size-3 place-items-center border", on ? "border-silver bg-silver" : "border-ash/60")}>
                  {on && <svg width="8" height="8" viewBox="0 0 8 8"><path d="M1 4 L3.2 6 L7 1.6" fill="none" stroke="#0a0a0b" strokeWidth="1.4" /></svg>}
                </span>
                {l.city}
              </label>
            );
          })}
        </div>
      </fieldset>
      <div className="mt-3 flex gap-2">
        <label className="sr-only" htmlFor="follow-email">Email</label>
        <input
          id="follow-email"
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@email.com"
          className="h-11 min-w-0 flex-1 border border-[var(--line-strong)] bg-transparent px-3 text-[14px] text-bone placeholder:text-ash/60 focus:border-silver/70 focus:outline-none"
        />
        <Button type="submit" variant="ghost" disabled={!picked.length || state === "sending"}>
          {state === "sending" ? "…" : "Notify me"}
        </Button>
      </div>
      {state === "error" && <p className="mt-2 text-[12px] text-full" role="alert">{msg}</p>}
    </form>
  );
}
