"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import type { Tattoo } from "@/lib/types";
import { STYLE_LABEL } from "@/lib/status";
import { withParams } from "@/lib/app-context";
import { ArtImage, Arrow, ButtonLink, Kbd, SampleTag, Star, cx } from "@/components/ui/primitives";
import { Wordmark } from "@/components/shell/AppShell";

const pad = (n: number) => String(n).padStart(2, "0");

export function ArtworkViewer({
  pieces, index, onIndex, onClose,
}: { pieces: Tattoo[]; index: number; onIndex: (i: number) => void; onClose: () => void }) {
  const piece = pieces[index];
  const [dir, setDir] = useState(0);
  const [zoom, setZoom] = useState<{ x: number; y: number } | null>(null);
  const dialogRef = useRef<HTMLDivElement>(null);

  const go = useCallback(
    (d: number) => {
      setZoom(null);
      setDir(d);
      onIndex((index + d + pieces.length) % pieces.length);
    },
    [index, onIndex, pieces.length],
  );

  useEffect(() => {
    const prev = document.activeElement as HTMLElement | null;
    dialogRef.current?.focus();
    const html = document.documentElement;
    const overflow = html.style.overflow;
    html.style.overflow = "hidden";
    return () => {
      html.style.overflow = overflow;
      prev?.focus?.();
    };
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      else if (e.key === "ArrowRight") go(1);
      else if (e.key === "ArrowLeft") go(-1);
      else if (e.key === "Tab" && dialogRef.current) {
        // focus trap
        const f = dialogRef.current.querySelectorAll<HTMLElement>("a[href], button:not([disabled])");
        if (!f.length) return;
        const first = f[0], last = f[f.length - 1];
        if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
        else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [go, onClose]);

  if (!piece) return null;
  const aspect = piece.image.width / piece.image.height;

  const share = async () => {
    const url = `${window.location.origin}/work/${piece.slug}`;
    try {
      if (navigator.share) await navigator.share({ title: `${piece.title} — LOASH`, url });
      else await navigator.clipboard.writeText(url);
    } catch {}
  };

  return (
    <motion.div
      ref={dialogRef}
      role="dialog"
      aria-modal="true"
      tabIndex={-1}
      aria-label={`${piece.title}, piece ${index + 1} of ${pieces.length}`}
      className="fixed inset-0 z-[70] flex flex-col outline-none bg-ink lg:flex-row"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, transition: { duration: 0.35 } }}
      transition={{ duration: 0.45 }}
    >
      {/* ── Stage ── */}
      <div className="relative min-h-0 flex-1 overflow-hidden">
        <div className="pointer-events-none absolute inset-0 hatch opacity-60" />
        <div className="absolute inset-x-0 top-0 z-10 flex items-center justify-between p-4 lg:hidden">
          <Wordmark className="w-[4.6rem]" />
          <button onClick={onClose} className="flex h-10 items-center gap-2 border border-[var(--line-strong)] bg-ink/60 px-3 font-mono text-[10px] uppercase tracking-[0.2em] backdrop-blur" aria-label="Close viewer">
            Close <span aria-hidden className="text-base leading-none">×</span>
          </button>
        </div>

        <AnimatePresence initial={false} custom={dir} mode="popLayout">
          <motion.div
            key={piece.id}
            custom={dir}
            className="absolute inset-0 grid place-items-center px-4 pb-4 pt-[4.5rem] lg:px-14 lg:pb-20 lg:pt-12"
            initial={{ opacity: 0, x: dir * 60 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: dir * -60 }}
            transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
            drag={zoom ? false : "x"}
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={0.25}
            onDragEnd={(_, i) => {
              if (i.offset.x < -70) go(1);
              else if (i.offset.x > 70) go(-1);
            }}
          >
            <motion.div
              layoutId={`art-${piece.id}`}
              className="relative max-h-full max-w-full overflow-hidden"
              style={{ aspectRatio: aspect, height: "100%", maxWidth: "100%" }}
              transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
            >
              <button
                data-cursor={zoom ? "back" : "zoom"}
                className="block size-full"
                aria-label={zoom ? "Zoom out" : "Zoom in to see linework"}
                onClick={(e) => {
                  if (zoom) return setZoom(null);
                  const r = e.currentTarget.getBoundingClientRect();
                  setZoom({ x: ((e.clientX - r.left) / r.width) * 100, y: ((e.clientY - r.top) / r.height) * 100 });
                }}
              >
                <span
                  className="block size-full transition-transform duration-700 ease-[var(--ease-ink)]"
                  style={{ transform: zoom ? "scale(2.2)" : "scale(1)", transformOrigin: zoom ? `${zoom.x}% ${zoom.y}%` : "50% 50%" }}
                >
                  <ArtImage image={piece.image} alt={piece.alt} sizes="(min-width:1024px) 70vw, 100vw" priority fit="contain" className="size-full" />
                </span>
              </button>
            </motion.div>
          </motion.div>
        </AnimatePresence>

        {/* stage controls */}
        <div className="absolute inset-x-0 bottom-0 z-10 hidden items-end justify-between p-6 lg:flex">
          <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-ash">
            <Kbd>←</Kbd> <Kbd>→</Kbd> browse · <Kbd>esc</Kbd> close · click to zoom
          </span>
          <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-ash">Original photograph · real work</span>
        </div>
      </div>

      {/* ── Plate (info) ── */}
      <motion.aside
        className="relative flex max-h-[46dvh] shrink-0 flex-col overflow-y-auto border-t border-[var(--line)] bg-stone lg:max-h-none lg:w-[400px] lg:border-l lg:border-t-0"
        initial={{ x: 40, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ delay: 0.15, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      >
        <div className="hidden items-center justify-between border-b border-[var(--line)] px-7 py-5 lg:flex">
          <Wordmark className="w-[5.2rem]" />
          <button onClick={onClose} className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.22em] text-mist hover:text-bone" aria-label="Close viewer">
            Close <span aria-hidden className="grid size-8 place-items-center border border-[var(--line-strong)] text-base">×</span>
          </button>
        </div>

        <div className="flex-1 px-5 py-5 lg:px-7 lg:py-8">
          <div className="flex items-center justify-between">
            <span className="font-mono text-[11px] tracking-[0.2em] text-ash tabular">
              <span className="text-bone">{pad(index + 1)}</span> / {pad(pieces.length)}
            </span>
            <div className="flex gap-1.5">
              <button onClick={() => go(-1)} className="grid size-10 place-items-center border border-[var(--line-strong)] hover:border-silver/60" aria-label="Previous piece"><Arrow dir="left" /></button>
              <button onClick={() => go(1)} className="grid size-10 place-items-center border border-[var(--line-strong)] hover:border-silver/60" aria-label="Next piece"><Arrow /></button>
            </div>
          </div>

          <AnimatePresence mode="wait">
            <motion.div key={piece.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.35 }}>
              <p className="eyebrow mt-6 lg:mt-10">{piece.styles.map((s) => STYLE_LABEL[s]).join(" · ")}</p>
              <h2 className="display mt-3 text-[2.4rem] text-bone lg:text-[3.1rem]">{piece.title}</h2>

              <dl className="mt-6 grid grid-cols-2 gap-y-4 border-y border-[var(--line)] py-5">
                <div>
                  <dt className="eyebrow">Style</dt>
                  <dd className="mt-1 text-[14px] text-mist">{STYLE_LABEL[piece.styles[0]]}</dd>
                </div>
                <div>
                  <dt className="eyebrow">Placement</dt>
                  <dd className="mt-1 text-[14px] text-mist">{piece.placement ?? "—"}</dd>
                </div>
              </dl>

              <p className="mt-5 font-display text-[1.2rem] leading-snug text-mist">{piece.description}</p>
              {piece.needsReview && <SampleTag className="mt-4">Draft copy — confirm in admin</SampleTag>}
            </motion.div>
          </AnimatePresence>
        </div>

        <div className="sticky bottom-0 space-y-3 border-t border-[var(--line)] bg-stone/95 px-5 py-4 backdrop-blur lg:px-7 lg:py-6">
          <ButtonLink href={withParams("/book", { ref: piece.slug })} variant="primary" className="w-full">
            <Star size={9} /> Request something like this
          </ButtonLink>
          <button onClick={share} className="w-full py-1 font-mono text-[10px] uppercase tracking-[0.2em] text-ash hover:text-bone">
            Share this piece
          </button>
        </div>
      </motion.aside>

      {/* filmstrip (desktop) */}
      <div className="pointer-events-none absolute bottom-7 left-[calc(50%-200px)] hidden -translate-x-1/2 lg:block">
        <div className="pointer-events-auto flex gap-1.5">
          {pieces.map((p, i) => (
            <button
              key={p.id}
              onClick={() => { setZoom(null); setDir(i > index ? 1 : -1); onIndex(i); }}
              aria-label={`View ${p.title}`}
              aria-current={i === index}
              className={cx("h-1 transition-all duration-500", i === index ? "w-8 bg-silver" : "w-3 bg-white/20 hover:bg-white/50")}
            />
          ))}
        </div>
      </div>
    </motion.div>
  );
}
