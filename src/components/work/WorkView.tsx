"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, LayoutGroup, motion } from "motion/react";
import type { StyleTag, Tattoo } from "@/lib/types";
import { STYLE_FILTERS, STYLE_LABEL } from "@/lib/status";
import { sortedTattoos, styleCounts } from "@/lib/selectors";
import { useData, useNav, withParams } from "@/lib/app-context";
import { ArtImage, Arrow, ButtonLink, Star, cx } from "@/components/ui/primitives";
import { ArtworkViewer } from "./ArtworkViewer";

const pad = (n: number) => String(n).padStart(2, "0");

/** Greedy masonry: each piece goes to the column that is currently shortest (in real px). */
function distribute(items: Tattoo[], weights: number[], offsets: number[]) {
  const cols: Tattoo[][] = weights.map(() => []);
  const h = offsets.slice();
  for (const t of items) {
    let best = 0;
    for (let i = 1; i < cols.length; i++) if (h[i] < h[best] - 0.01) best = i;
    cols[best].push(t);
    h[best] += (weights[best] * t.image.height) / t.image.width + 0.32; // + caption & gap
  }
  return cols;
}

function useColumns() {
  const [n, setN] = useState(3);
  useEffect(() => {
    const q = () => setN(window.innerWidth >= 1280 ? 3 : window.innerWidth >= 640 ? 2 : 2);
    q();
    window.addEventListener("resize", q);
    return () => window.removeEventListener("resize", q);
  }, []);
  return n;
}

export function WorkView({ initialSlug }: { initialSlug?: string }) {
  const { snapshot } = useData();
  const nav = useNav();
  const all = useMemo(() => sortedTattoos(snapshot), [snapshot]);
  const counts = useMemo(() => styleCounts(all), [all]);
  const filters = STYLE_FILTERS.filter((f) => (counts.get(f) ?? 0) > 0);

  const param = nav.search.get("style") as StyleTag | null;
  const [filter, setFilter] = useState<StyleTag | "all">(param && filters.includes(param) ? param : "all");
  const [mode, setMode] = useState<"plates" | "index">("plates");
  const pieces = useMemo(() => (filter === "all" ? all : all.filter((t) => t.styles.includes(filter))), [all, filter]);

  const [openSlug, setOpenSlug] = useState<string | null>(initialSlug ?? null);
  useEffect(() => {
    const s = nav.search.get("piece");
    if (s) setOpenSlug(s);
  }, [nav.search]);

  const openIndex = openSlug ? pieces.findIndex((p) => p.slug === openSlug) : -1;
  const viewerList = openIndex >= 0 ? pieces : all;
  const viewerIndex = openSlug ? viewerList.findIndex((p) => p.slug === openSlug) : -1;

  const open = (slug: string) => {
    setOpenSlug(slug);
    nav.replace(withParams("/work", { style: filter === "all" ? null : filter, piece: slug }));
  };
  const close = () => {
    setOpenSlug(null);
    nav.replace(withParams("/work", { style: filter === "all" ? null : filter }));
  };
  const pick = (f: StyleTag | "all") => {
    setFilter(f);
    nav.replace(withParams("/work", { style: f === "all" ? null : f }));
  };

  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const ncols = useColumns();
  const cols = useMemo(() => {
    const weights = ncols === 3 ? [1.12, 0.92, 1] : [1, 1];
    const offsets = ncols === 3 ? [0, 0.42, 0.16] : [0, 0.3];
    return { list: distribute(pieces, weights, offsets), weights, offsets };
  }, [pieces, ncols]);

  return (
    <LayoutGroup>
      <section className="px-4 pb-24 pt-8 sm:px-8 lg:px-14 lg:pt-14" aria-labelledby="archive-title">
        {/* Masthead */}
        <header className="grid gap-6 lg:grid-cols-[1fr_auto] lg:items-end">
          <div>
            <p className="eyebrow flex items-center gap-2"><Star size={8} /> I — The archive</p>
            <h1 id="archive-title" className="display mt-4 text-[3.4rem] sm:text-[5rem] lg:text-[6.5rem]">
              <span className="metal">The Work</span>
            </h1>
            <p className="mt-4 max-w-md text-[15px] text-ash">
              Real pieces from my chair — no mockups, no stock. Open any plate to see the linework up close, or start a request from it.
            </p>
          </div>
          <div className="flex items-center gap-6 lg:pb-3">
            <div className="text-right">
              <div className="display text-5xl tabular text-bone">{pad(pieces.length)}</div>
              <div className="eyebrow mt-1">{filter === "all" ? "Pieces" : STYLE_LABEL[filter]}</div>
            </div>
            <div role="radiogroup" aria-label="Layout" className="flex border border-[var(--line)]">
              {(["plates", "index"] as const).map((m) => (
                <button
                  key={m}
                  role="radio"
                  aria-checked={mode === m}
                  onClick={() => setMode(m)}
                  className={cx("px-3.5 py-2 font-mono text-[10px] uppercase tracking-[0.2em] transition-colors", mode === m ? "bg-white/[0.07] text-bone" : "text-ash hover:text-bone")}
                >
                  {m}
                </button>
              ))}
            </div>
          </div>
        </header>

        {/* Filters */}
        <div className="sticky top-[var(--topbar-h)] z-20 -mx-4 mt-8 border-y border-[var(--line)] bg-ink/80 px-4 backdrop-blur-xl sm:-mx-8 sm:px-8 lg:top-0 lg:-mx-14 lg:px-14">
          <div role="radiogroup" aria-label="Filter by style" className="no-scrollbar flex gap-1 overflow-x-auto py-2.5">
            {(["all", ...filters] as const).map((f) => {
              const active = filter === f;
              const n = f === "all" ? all.length : counts.get(f) ?? 0;
              return (
                <button
                  key={f}
                  role="radio"
                  aria-checked={active}
                  onClick={() => pick(f)}
                  className={cx("relative flex shrink-0 items-center gap-2 px-3.5 py-2 font-mono text-[10.5px] uppercase tracking-[0.18em] transition-colors", active ? "text-ink" : "text-ash hover:text-bone")}
                >
                  {active && <motion.span layoutId="filter-pill" className="absolute inset-0 bg-gradient-to-b from-[#ecebe7] to-[#bdbcb7]" transition={{ type: "spring", stiffness: 420, damping: 38 }} />}
                  <span className="relative">{f === "all" ? "All" : STYLE_LABEL[f]}</span>
                  <span className={cx("relative tabular", active ? "text-ink/60" : "text-ash/60")}>{n}</span>
                </button>
              );
            })}
          </div>
        </div>

        {mode === "plates" ? (
          <div className="mt-10 flex gap-4 sm:gap-6 lg:gap-10" style={{ alignItems: "flex-start" }}>
            {cols.list.map((col, ci) => (
              <div key={ci} className="flex min-w-0 flex-col gap-10 sm:gap-14" style={{ flex: cols.weights[ci], paddingTop: `${cols.offsets[ci] * 22}vw` }}>
                <AnimatePresence mode="popLayout">
                  {col.map((t) => (
                    <Plate key={t.id} t={t} n={all.indexOf(t) + 1} onOpen={() => open(t.slug)} />
                  ))}
                </AnimatePresence>
              </div>
            ))}
          </div>
        ) : (
          <IndexList pieces={pieces} all={all} onOpen={open} />
        )}

        <div className="mt-24 flex flex-col items-center gap-5 text-center">
          <p className="display text-3xl text-mist sm:text-4xl">Seen something close to what you want?</p>
          <ButtonLink href="/book" variant="primary">Start a request <Arrow /></ButtonLink>
        </div>
      </section>

      {/* Portal: the page-transition wrapper creates a containing block that would trap position:fixed */}
      {mounted &&
        createPortal(
          <AnimatePresence>
            {openSlug && viewerIndex >= 0 && (
              <ArtworkViewer pieces={viewerList} index={viewerIndex} onIndex={(i) => open(viewerList[i].slug)} onClose={close} />
            )}
          </AnimatePresence>,
          document.body,
        )}
    </LayoutGroup>
  );
}

function Plate({ t, n, onOpen }: { t: Tattoo; n: number; onOpen: () => void }) {
  return (
    <motion.figure
      layout
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.97 }}
      transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
      className="group"
    >
      <button onClick={onOpen} data-cursor="view" className="block w-full text-left" aria-label={`Open ${t.title}`}>
        <motion.div layoutId={`art-${t.id}`} className="relative overflow-hidden" style={{ aspectRatio: `${t.image.width} / ${t.image.height}` }}>
          <ArtImage
            image={t.image}
            alt={t.alt}
            sizes="(min-width:1280px) 30vw, (min-width:640px) 45vw, 50vw"
            className="size-full transition-transform duration-[1400ms] ease-[var(--ease-ink)] group-hover:scale-[1.035]"
          />
          <span className="pointer-events-none absolute inset-0 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.06)] transition-shadow duration-500 group-hover:shadow-[inset_0_0_0_1px_rgba(214,214,219,0.45)]" />
          <span className="pointer-events-none absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-ink/70 to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
          {t.featured && (
            <span className="absolute left-2.5 top-2.5 flex items-center gap-1.5 bg-ink/70 px-2 py-1 font-mono text-[9px] uppercase tracking-[0.2em] text-silver backdrop-blur">
              <Star size={7} /> Featured
            </span>
          )}
        </motion.div>
        <figcaption className="mt-3 flex items-baseline gap-3">
          <span className="font-display text-[13px] italic text-ash tabular">{pad(n)}</span>
          <span className="min-w-0 flex-1">
            <span className="block truncate font-display text-[1.15rem] leading-tight text-bone sm:text-[1.3rem]">{t.title}</span>
            <span className="mt-0.5 block truncate font-mono text-[9.5px] uppercase tracking-[0.16em] text-ash">
              {t.styles.slice(0, 2).map((s) => STYLE_LABEL[s]).join(" · ")}
            </span>
          </span>
        </figcaption>
      </button>
    </motion.figure>
  );
}

/** Editorial index: a typographic list with a floating preview that follows the pointer. */
function IndexList({ pieces, all, onOpen }: { pieces: Tattoo[]; all: Tattoo[]; onOpen: (slug: string) => void }) {
  const [hover, setHover] = useState<Tattoo | null>(null);
  const ref = useRef<HTMLDivElement>(null);
  const prev = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const move = (e: PointerEvent) => {
      if (prev.current) prev.current.style.transform = `translate3d(${e.clientX + 28}px, ${e.clientY - 120}px, 0)`;
    };
    el.addEventListener("pointermove", move);
    return () => el.removeEventListener("pointermove", move);
  }, []);
  return (
    <div ref={ref} className="mt-8" onPointerLeave={() => setHover(null)}>
      <div className="hidden grid-cols-[4rem_1fr_16rem_9rem_2rem] gap-4 border-b border-[var(--line)] pb-3 lg:grid">
        {["No.", "Title", "Style", "Placement", ""].map((h) => <span key={h} className="eyebrow">{h}</span>)}
      </div>
      <ul>
        {pieces.map((t) => (
          <li key={t.id}>
            <button
              onClick={() => onOpen(t.slug)}
              onPointerEnter={() => setHover(t)}
              onFocus={() => setHover(t)}
              data-cursor="view"
              className="group grid w-full grid-cols-[3.5rem_1fr_auto] items-center gap-4 border-b border-[var(--line)] py-4 text-left transition-colors hover:bg-white/[0.02] lg:grid-cols-[4rem_1fr_16rem_9rem_2rem] lg:py-5"
            >
              <span className="flex items-center gap-3">
                <span className="hidden font-display italic text-ash tabular lg:inline">{pad(all.indexOf(t) + 1)}</span>
                <ArtImage image={t.image} alt="" sizes="56px" className="size-14 lg:hidden" />
              </span>
              <span className="min-w-0">
                <span className="block display text-[1.6rem] text-bone transition-transform duration-500 group-hover:translate-x-2 lg:text-[2.3rem]">{t.title}</span>
                <span className="mt-1 block font-mono text-[9.5px] uppercase tracking-[0.16em] text-ash lg:hidden">{t.styles.map((s) => STYLE_LABEL[s]).join(" · ")}</span>
              </span>
              <span className="hidden font-mono text-[10.5px] uppercase tracking-[0.16em] text-mist lg:block">{t.styles.map((s) => STYLE_LABEL[s]).join(" · ")}</span>
              <span className="hidden font-mono text-[10.5px] uppercase tracking-[0.16em] text-ash lg:block">{t.placement ?? "—"}</span>
              <Arrow className="text-ash transition-colors group-hover:text-bone" />
            </button>
          </li>
        ))}
      </ul>
      <div ref={prev} aria-hidden className="pointer-events-none fixed left-0 top-0 z-30 hidden w-56 lg:block">
        <AnimatePresence>
          {hover && (
            <motion.div key={hover.id} initial={{ opacity: 0, scale: 0.92, rotate: -2 }} animate={{ opacity: 1, scale: 1, rotate: 0 }} exit={{ opacity: 0, scale: 0.95 }} transition={{ duration: 0.35 }} className="absolute shadow-2xl shadow-black/70" style={{ width: 224, aspectRatio: `${hover.image.width}/${hover.image.height}` }}>
              <ArtImage image={hover.image} alt="" sizes="224px" className="size-full" />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
