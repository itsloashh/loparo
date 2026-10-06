"use client";
import { useState, type ButtonHTMLAttributes, type CSSProperties, type ReactNode } from "react";
import type { AvailabilityStatus, ImageAsset } from "@/lib/types";
import { STATUS } from "@/lib/status";
import { src, srcSet } from "@/lib/images";
import { AppLink } from "@/lib/app-context";

const cx = (...c: (string | false | null | undefined)[]) => c.filter(Boolean).join(" ");
export { cx };

/* ── Four-point star: the Loash ornament (borrowed from the sparkles in the work) ── */
export function Star({ size = 10, className, style }: { size?: number; className?: string; style?: CSSProperties }) {
  return (
    <svg width={size} height={size} viewBox="0 0 20 20" aria-hidden className={className} style={style}>
      <path d="M10 0 C10.8 6.2 13.8 9.2 20 10 C13.8 10.8 10.8 13.8 10 20 C9.2 13.8 6.2 10.8 0 10 C6.2 9.2 9.2 6.2 10 0Z" fill="currentColor" />
    </svg>
  );
}

/** Engraved divider: hairline · star · hairline */
export function Divider({ className, label }: { className?: string; label?: string }) {
  return (
    <div className={cx("flex items-center gap-3 text-ash/70", className)} role="separator">
      <span className="h-px flex-1 bg-gradient-to-r from-transparent via-[var(--line-strong)] to-[var(--line-strong)]" />
      {label ? <span className="eyebrow">{label}</span> : <Star size={9} />}
      <span className="h-px flex-1 bg-gradient-to-l from-transparent via-[var(--line-strong)] to-[var(--line-strong)]" />
    </div>
  );
}

/** Corner ticks — the "engraved plate" frame used on key cards */
export function Corners({ className }: { className?: string }) {
  const c = "absolute size-2.5 border-silver/40";
  return (
    <span aria-hidden className={cx("pointer-events-none absolute inset-0", className)}>
      <span className={cx(c, "left-0 top-0 border-l border-t")} />
      <span className={cx(c, "right-0 top-0 border-r border-t")} />
      <span className={cx(c, "bottom-0 left-0 border-b border-l")} />
      <span className={cx(c, "bottom-0 right-0 border-b border-r")} />
    </span>
  );
}

/* ── Availability ── */
export function StatusGlyph({ status, size = 9, pulse }: { status: AvailabilityStatus; size?: number; pulse?: boolean }) {
  const s = STATUS[status];
  const color = s.token;
  const common = { width: size, height: size, viewBox: "0 0 10 10", "aria-hidden": true as const, style: { color, flex: "none" } };
  const shape =
    s.glyph === "dot" ? <circle cx="5" cy="5" r="4" fill="currentColor" />
    : s.glyph === "half" ? (<><circle cx="5" cy="5" r="3.6" fill="none" stroke="currentColor" strokeWidth="1.2" /><path d="M5 1.4 A3.6 3.6 0 0 1 5 8.6Z" fill="currentColor" /></>)
    : s.glyph === "cross" ? <path d="M2 2 L8 8 M8 2 L2 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    : s.glyph === "dash" ? <path d="M1.5 5 H8.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    : <path d="M5 0.8 L9.2 5 L5 9.2 L0.8 5Z" fill="none" stroke="currentColor" strokeWidth="1.2" />;
  return (
    <span className="relative inline-grid place-items-center" style={{ width: size, height: size }}>
      {pulse && s.glyph === "dot" && (
        <span className="absolute inset-0 animate-ping rounded-full opacity-40 motion-reduce:hidden" style={{ background: color, animationDuration: "2.4s" }} />
      )}
      <svg {...common}>{shape}</svg>
    </span>
  );
}

export function StatusBadge({ status, short, className, pulse }: { status: AvailabilityStatus; short?: boolean; className?: string; pulse?: boolean }) {
  const s = STATUS[status];
  return (
    <span className={cx("inline-flex items-center gap-2 whitespace-nowrap font-mono text-[10.5px] uppercase tracking-[0.18em]", className)} style={{ color: s.token }}>
      <StatusGlyph status={status} pulse={pulse} />
      {short ? s.short : s.label}
    </span>
  );
}

export function SampleTag({ className, children = "Sample" }: { className?: string; children?: ReactNode }) {
  return (
    <span
      title="Placeholder data — replace before launch"
      className={cx("inline-flex items-center gap-1 border border-dashed border-limited/50 px-1.5 py-[1px] font-mono text-[9px] uppercase tracking-[0.18em] text-limited/90", className)}
    >
      {children}
    </span>
  );
}

/* ── Buttons ── */
type BtnVariant = "primary" | "ghost" | "quiet";
const btn: Record<BtnVariant, string> = {
  primary:
    "sweep bg-gradient-to-b from-[#e9e8e4] to-[#b9b8b3] text-ink border border-white/40 shadow-[inset_0_1px_0_rgba(255,255,255,0.7),0_10px_30px_-12px_rgba(0,0,0,0.9)] hover:from-white hover:to-[#cfceca]",
  ghost: "sweep border border-[var(--line-strong)] text-bone hover:border-silver/60 hover:bg-white/[0.03]",
  quiet: "text-mist hover:text-bone",
};
const base =
  "inline-flex items-center justify-center gap-2.5 whitespace-nowrap px-5 h-11 font-mono text-[11px] uppercase tracking-[0.2em] transition-colors duration-300 disabled:opacity-35 disabled:pointer-events-none select-none";

/** Minimal class merge: caller's size/spacing utilities replace the base ones. */
const GROUPS = [/^px-/, /^h-/, /^text-\[/, /^tracking-/];
function merge(baseCls: string, extra?: string) {
  if (!extra) return baseCls;
  const ex = extra.split(/\s+/).map((c) => c.replace(/^[a-z]+:/, ""));
  const keep = baseCls.split(/\s+/).filter((b) => !GROUPS.some((g) => g.test(b) && ex.some((e) => g.test(e))));
  return `${keep.join(" ")} ${extra}`;
}

export function Button({ variant = "ghost", className, ...p }: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: BtnVariant }) {
  return <button data-cursor="open" {...p} className={merge(cx(base, btn[variant]), className)} />;
}

export function ButtonLink({ variant = "ghost", className, href, children, ...p }: { variant?: BtnVariant; className?: string; href: string; children: ReactNode; "aria-label"?: string }) {
  return (
    <AppLink href={href} data-cursor="open" className={merge(cx(base, btn[variant]), className)} {...p}>
      {children}
    </AppLink>
  );
}

export function Arrow({ dir = "right", className }: { dir?: "right" | "left" | "up" | "down"; className?: string }) {
  const r = { right: 0, down: 90, left: 180, up: 270 }[dir];
  return (
    <svg width="14" height="10" viewBox="0 0 14 10" aria-hidden className={className} style={{ transform: `rotate(${r}deg)` }}>
      <path d="M0 5 H12.5 M8.5 1 L12.5 5 L8.5 9" fill="none" stroke="currentColor" strokeWidth="1.1" />
    </svg>
  );
}

/* ── Artwork image: responsive, blur-up reveal, real aspect ratio preserved ── */
export function ArtImage({
  image, alt, sizes, priority, className, fit = "cover", style,
}: { image: ImageAsset; alt: string; sizes: string; priority?: boolean; className?: string; fit?: "cover" | "contain"; style?: CSSProperties }) {
  const [loaded, setLoaded] = useState(false);
  return (
    <span className={cx("relative block overflow-hidden", className)} style={{ background: image.tone ? `${image.tone}22` : undefined, ...style }}>
      {image.blur && (
        <img src={image.blur} alt="" aria-hidden className={cx("absolute inset-0 size-full scale-110 blur-xl transition-opacity duration-700", fit === "cover" ? "object-cover" : "object-contain", loaded && "opacity-0")} />
      )}
      <img
        src={src(image)}
        srcSet={srcSet(image)}
        sizes={sizes}
        alt={alt}
        width={image.width}
        height={image.height}
        loading={priority ? "eager" : "lazy"}
        fetchPriority={priority ? "high" : "auto"}
        decoding="async"
        onLoad={() => setLoaded(true)}
        ref={(el) => { if (el?.complete && el.naturalWidth) setLoaded(true); }}
        className={cx(
          "relative size-full transition-[opacity,transform,filter] duration-[1100ms] ease-[var(--ease-ink)]",
          fit === "cover" ? "object-cover" : "object-contain",
          loaded ? "opacity-100 blur-0" : "opacity-0 blur-sm",
        )}
      />
    </span>
  );
}

export function Kbd({ children }: { children: ReactNode }) {
  return <kbd className="border border-[var(--line-strong)] px-1.5 py-0.5 font-mono text-[10px] text-ash">{children}</kbd>;
}
