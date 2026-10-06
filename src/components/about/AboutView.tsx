"use client";
import { useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { AppLink, useData, withParams } from "@/lib/app-context";
import { STYLE_LABEL } from "@/lib/status";
import { styleCounts } from "@/lib/selectors";
import { ArtImage, Arrow, ButtonLink, Corners, Divider, SampleTag, Star, cx } from "@/components/ui/primitives";
import { Wordmark } from "@/components/shell/AppShell";
import { FollowForm } from "@/components/map/FollowForm";
import { Footer } from "@/components/home/HomeView";

export function AboutView() {
  const { snapshot } = useData();
  const a = snapshot.artist;
  const counts = styleCounts(snapshot.tattoos);
  const travels = snapshot.stops.some((s) => s.kind === "guest" || s.kind === "travel");
  const [open, setOpen] = useState<number | null>(0);

  return (
    <>
      <section className="px-4 pb-20 pt-8 sm:px-8 lg:px-14 lg:pt-14" aria-labelledby="about-title">
        <p className="eyebrow flex items-center gap-2"><Star size={8} /> IV — The artist</p>
        <div className="mt-6 grid gap-12 lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1fr)] lg:gap-20">
          {/* Portrait slot */}
          <div>
            <div className="relative aspect-[4/5] w-full overflow-hidden etched hatch">
              <Corners />
              {a.portrait ? (
                <ArtImage image={a.portrait} alt={`${a.name}, tattoo artist`} sizes="(min-width:1024px) 40vw, 92vw" priority className="absolute inset-0 size-full" />
              ) : (
                <div className="absolute inset-0 grid place-items-center p-8 text-center">
                  <div>
                    <Wordmark className="mx-auto w-44 opacity-25" />
                    <SampleTag className="mt-6">Portrait — upload one in admin</SampleTag>
                  </div>
                </div>
              )}
            </div>
            <dl className="mt-6 grid grid-cols-2 gap-px bg-[var(--line)]">
              {[
                ["Home base", a.homeCity],
                ["Booking", a.byAppointmentOnly ? "By appointment" : "Walk-ins welcome"],
                ["Travel", travels ? "Guest spots" : "Home studio"],
                ["Archive", `${snapshot.tattoos.length} pieces`],
              ].map(([k, v]) => (
                <div key={k} className="bg-ink p-4">
                  <dt className="eyebrow">{k}</dt>
                  <dd className="mt-1.5 font-display text-[1.2rem] text-bone">{v}</dd>
                </div>
              ))}
            </dl>
          </div>

          <div>
            <h1 id="about-title" className="display text-[3.4rem] sm:text-[5rem] lg:text-[6rem]"><span className="metal">{a.name}</span></h1>
            <p className="caps mt-3 text-[13px] tracking-[0.4em] text-mist">{a.tagline}</p>
            <Divider className="mt-8 max-w-xs" />
            <div className="mt-8 space-y-5">
              {a.bio.map((p, i) => (
                <p key={i} className={cx("font-display text-[1.35rem] leading-snug sm:text-[1.55rem]", a.bioIsPlaceholder ? "text-ash" : "text-mist")}>{p}</p>
              ))}
              {a.bioIsPlaceholder && <SampleTag>Bio — edit in admin</SampleTag>}
            </div>

            <h2 className="eyebrow mt-14">What I tattoo</h2>
            <ul className="mt-4 border-t border-[var(--line)]">
              {a.styles.map((s) => (
                <li key={s}>
                  <AppLink href={withParams("/work", { style: s })} data-cursor="view" className="group flex items-center justify-between border-b border-[var(--line)] py-4">
                    <span className="display text-[1.8rem] text-bone transition-transform duration-500 group-hover:translate-x-2 sm:text-[2.2rem]">{STYLE_LABEL[s]}</span>
                    <span className="flex items-center gap-3 font-mono text-[11px] uppercase tracking-[0.16em] text-ash">
                      {counts.get(s) ?? 0} in archive <Arrow className="group-hover:text-bone" />
                    </span>
                  </AppLink>
                </li>
              ))}
            </ul>
            {a.notOffered.length > 0 && (
              <p className="mt-4 font-mono text-[11.5px] uppercase tracking-[0.16em] text-ash">
                Not offered: <span className="text-mist">{a.notOffered.join(", ")}</span>
              </p>
            )}

            <h2 className="eyebrow mt-14 flex items-center gap-3">Before you book {a.faqIsPlaceholder && <SampleTag>Answers — edit in admin</SampleTag>}</h2>
            <ul className="mt-4 border-t border-[var(--line)]">
              {a.faq.map((f, i) => (
                <li key={f.q} className="border-b border-[var(--line)]">
                  <button onClick={() => setOpen(open === i ? null : i)} aria-expanded={open === i} className="flex w-full items-center justify-between gap-4 py-4 text-left">
                    <span className="font-display text-[1.3rem] text-bone">{f.q}</span>
                    <span className={cx("grid size-7 shrink-0 place-items-center border border-[var(--line)] text-ash transition-transform duration-500", open === i && "rotate-45")}>+</span>
                  </button>
                  <AnimatePresence initial={false}>
                    {open === i && (
                      <motion.p initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden pb-4 pr-10 text-[14px] text-ash">
                        {f.a}
                      </motion.p>
                    )}
                  </AnimatePresence>
                </li>
              ))}
            </ul>

            <div className="mt-14 grid gap-4 sm:grid-cols-[1fr_auto] sm:items-center">
              <p className="display text-[2rem] text-mist">Have an idea?</p>
              <ButtonLink href="/book" variant="primary">Request a tattoo <Arrow /></ButtonLink>
            </div>
            <FollowForm className="mt-8" />
          </div>
        </div>
      </section>
      <Footer />
    </>
  );
}
