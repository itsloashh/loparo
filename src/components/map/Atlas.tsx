"use client";
/**
 * The Loash Atlas — a custom engraved vector map.
 * Geography: Natural Earth (public domain), clipped to the Great Lakes region at build time.
 * Projection fits whatever locations exist, so adding a city in the admin just works.
 *
 * Swappable: <Atlas> takes plain markers + callbacks, so a Mapbox GL implementation can
 * replace it later without touching the pages.
 */
import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { geoConicConformal, geoGraticule, geoPath } from "d3-geo";
import type { Feature, FeatureCollection, Geometry } from "geojson";
import region from "@/lib/geo/region.json";
import type { AvailabilityStatus, Location } from "@/lib/types";
import { STATUS } from "@/lib/status";
import { Star, StatusGlyph, cx } from "@/components/ui/primitives";

export interface AtlasMarker {
  location: Location;
  status: AvailabilityStatus;
  sub: string;
}

type FC = FeatureCollection<Geometry, { name?: string | null }>;
const geo = region as unknown as { land: FC; lakes: FC; states: FC; border: FC };

const LAKE_LABELS: { name: string; lon: number; lat: number; big?: boolean; minK?: number }[] = [
  { name: "Lake Huron", lon: -82.3, lat: 44.75, big: true },
  { name: "Georgian Bay", lon: -80.75, lat: 45.15 },
  { name: "Lake Erie", lon: -81.25, lat: 42.2, big: true },
  { name: "Lake Ontario", lon: -77.9, lat: 43.62, big: true },
  { name: "Lake Michigan", lon: -87.0, lat: 43.6, big: true },
  { name: "Lake St. Clair", lon: -82.7, lat: 42.47, minK: 2.5 },
  { name: "Lake Simcoe", lon: -79.4, lat: 44.42, minK: 1.6 },
];
const LAND_LABELS = [
  { name: "Ontario", lon: -80.2, lat: 43.95, cls: "text-[13px] tracking-[0.5em]" },
  { name: "Michigan", lon: -84.7, lat: 42.75, cls: "text-[12px] tracking-[0.45em]" },
  { name: "Ohio", lon: -82.6, lat: 41.0, cls: "text-[12px] tracking-[0.45em]" },
  { name: "New York", lon: -76.6, lat: 42.7, cls: "text-[12px] tracking-[0.45em]" },
];

type View = { k: number; x: number; y: number };
const MIN_K = 1, MAX_K = 7;

export function Atlas({
  markers, selectedId, onSelect, className, compact, hereId, popover,
}: {
  markers: AtlasMarker[];
  selectedId: string | null;
  onSelect: (id: string | null) => void;
  className?: string;
  /** Embedded preview: taps only, never hijacks page scroll */
  compact?: boolean;
  /** City Loash is tattooing in right now — gets the gold pulse */
  hereId?: string | null;
  /** Card rendered next to the selected pin */
  popover?: (m: AtlasMarker) => ReactNode;
}) {
  const wrap = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState({ w: 0, h: 0 });
  const [view, setView] = useState<View>({ k: 1, x: 0, y: 0 });
  const [anim, setAnim] = useState<"none" | "fast" | "fly">("none");

  useEffect(() => {
    const el = wrap.current!;
    const ro = new ResizeObserver(([e]) => setSize({ w: e.contentRect.width, h: e.contentRect.height }));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const wide = !compact && size.w > 1000; // desktop map page with side panel
  const { projection, box } = useMemo(() => {
    const lons = markers.map((m) => m.location.longitude), lats = markers.map((m) => m.location.latitude);
    // Embedded map hugs the cities; the full map keeps more geography around them
    const tight = compact || size.w < 700; // phones: hug the cities so pins aren't tiny
    const mLon = tight ? 0.35 : 0.9, mLat = tight ? 0.3 : 0.5;
    const minLon = Math.min(tight ? -83.4 : -84.2, ...lons) - mLon, maxLon = Math.max(tight ? -79.2 : -78.6, ...lons) + mLon;
    const minLat = Math.min(tight ? 41.9 : 41.5, ...lats) - mLat, maxLat = Math.max(tight ? 43.9 : 44.4, ...lats) + mLat;
    const box: Feature = {
      type: "Feature", properties: {},
      geometry: { type: "MultiPoint", coordinates: [[minLon, minLat], [maxLon, minLat], [maxLon, maxLat], [minLon, maxLat]] },
    };
    const w = Math.max(size.w, 1), h = Math.max(size.h, 1);
    const padL = wide ? 420 : compact ? 92 : 88; // room for west-side labels (Detroit)
    const padR = compact ? 96 : wide ? 110 : 96;
    const padT = compact ? 24 : 70;
    const padB = !compact && !wide ? Math.min(240, h * 0.34) : compact ? 24 : 70;
    const projection = geoConicConformal().parallels([42, 45]).rotate([81.5, 0]).fitExtent([[padL, padT], [w - padR, h - padB]], box);
    return { projection, box: [[padL, padT], [w - padR, h - padB]] as const };
  }, [markers, size.w, size.h, compact, wide]);

  const path = useMemo(() => geoPath(projection), [projection]);
  const d = useMemo(
    () => ({
      land: path(geo.land) ?? "",
      lakes: path(geo.lakes) ?? "",
      states: path(geo.states) ?? "",
      border: path(geo.border) ?? "",
      grat: path(geoGraticule().extent([[-92, 38], [-70, 49.5]]).step([2, 1])()) ?? "",
    }),
    [path],
  );

  const toScreen = useCallback(
    (lon: number, lat: number) => {
      const p = projection([lon, lat]) ?? [0, 0];
      return [p[0] * view.k + view.x, p[1] * view.k + view.y] as const;
    },
    [projection, view],
  );

  /** Keep the region of interest on screen: never pan it fully out of view. */
  const clamp = useCallback(
    (v: View): View => {
      const k = Math.min(MAX_K, Math.max(MIN_K, v.k));
      if (k === 1) return { k: 1, x: 0, y: 0 };
      const [[x0, y0], [x1, y1]] = box;
      const m = 80;
      const x = Math.min(size.w - m - x0 * k, Math.max(m - x1 * k, v.x));
      const y = Math.min(size.h - m - y0 * k, Math.max(m - y1 * k, v.y));
      return { k, x, y };
    },
    [box, size.w, size.h],
  );

  // Collision-aware label placement (Windsor & Detroit sit ~2km apart)
  const placed = useMemo(() => {
    const pts = markers.map((m) => {
      const [x, y] = toScreen(m.location.longitude, m.location.latitude);
      return { m, x, y, side: "right" as "left" | "right" };
    });
    for (let i = 0; i < pts.length; i++)
      for (let j = i + 1; j < pts.length; j++) {
        const a = pts[i], b = pts[j];
        const dist = Math.hypot(b.x - a.x, b.y - a.y);
        if (dist < 34) {
          const push = (34 - dist) / 2 + 1;
          const west = a.m.location.longitude < b.m.location.longitude ? a : b;
          const east = west === a ? b : a;
          west.x -= push; east.x += push;
          west.side = "left"; east.side = "right";
        }
      }
    for (const p of pts) {
      if (p.side !== "right") continue;
      const blocked = pts.some((o) => o !== p && o.x > p.x + 8 && o.x < p.x + 104 && Math.abs(o.y - p.y) < 30);
      if (blocked) p.side = "left";
    }
    return pts;
  }, [markers, toScreen]);

  /* ── Interaction (full map only) ── */
  const pointers = useRef(new Map<number, { x: number; y: number }>());
  const last = useRef<{ x: number; y: number; dist?: number } | null>(null);
  const moved = useRef(0);
  const lastTap = useRef(0);

  const zoomAt = useCallback(
    (factor: number, cx: number, cy: number, mode: "none" | "fast" | "fly" = "fast") => {
      setAnim(mode);
      setView((v) => {
        const k = Math.min(MAX_K, Math.max(MIN_K, v.k * factor));
        const f = k / v.k;
        return clamp({ k, x: cx - (cx - v.x) * f, y: cy - (cy - v.y) * f });
      });
    },
    [clamp],
  );

  useEffect(() => {
    if (compact) return;
    const el = wrap.current!;
    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      const r = el.getBoundingClientRect();
      // trackpads send many small deltas, mice send large ones — normalise both
      const delta = Math.max(-60, Math.min(60, e.deltaY));
      zoomAt(Math.exp(-delta * 0.006), e.clientX - r.left, e.clientY - r.top, "fast");
    };
    el.addEventListener("wheel", onWheel, { passive: false });
    return () => el.removeEventListener("wheel", onWheel);
  }, [compact, zoomAt]);

  const onPointerDown = (e: React.PointerEvent) => {
    if (compact || (e.target as HTMLElement).closest("button")) return;
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    pointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
    last.current = null;
    moved.current = 0;
    setAnim("none");
  };
  const onPointerMove = (e: React.PointerEvent) => {
    if (!pointers.current.has(e.pointerId)) return;
    pointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
    const ps = [...pointers.current.values()];
    const r = wrap.current!.getBoundingClientRect();
    if (ps.length === 1) {
      const p = ps[0];
      if (last.current && last.current.dist === undefined) {
        const dx = p.x - last.current.x, dy = p.y - last.current.y;
        moved.current += Math.abs(dx) + Math.abs(dy);
        setView((v) => clamp({ ...v, x: v.x + dx, y: v.y + dy }));
      }
      last.current = { x: p.x, y: p.y };
    } else if (ps.length === 2) {
      const [a, b] = ps;
      const dist = Math.hypot(a.x - b.x, a.y - b.y);
      const mx = (a.x + b.x) / 2 - r.left, my = (a.y + b.y) / 2 - r.top;
      if (last.current?.dist) {
        const f = dist / last.current.dist;
        const pdx = mx - (last.current.x - r.left), pdy = my - (last.current.y - r.top);
        setView((v) => {
          const k = Math.min(MAX_K, Math.max(MIN_K, v.k * f));
          const ff = k / v.k;
          return clamp({ k, x: mx - (mx - v.x) * ff + pdx, y: my - (my - v.y) * ff + pdy });
        });
      }
      moved.current += 10;
      last.current = { x: mx + r.left, y: my + r.top, dist };
    }
  };
  const onPointerUp = (e: React.PointerEvent) => {
    pointers.current.delete(e.pointerId);
    last.current = null;
    if (compact || moved.current > 6 || (e.target as HTMLElement).closest("button")) return;
    // double-tap / double-click zooms in
    const now = Date.now();
    if (now - lastTap.current < 300) {
      const r = wrap.current!.getBoundingClientRect();
      zoomAt(1.8, e.clientX - r.left, e.clientY - r.top, "fly");
      lastTap.current = 0;
    } else lastTap.current = now;
  };

  // Fly to the selected city
  useEffect(() => {
    if (!size.w) return;
    const m = markers.find((x) => x.location.id === selectedId);
    setAnim("fly");
    if (!m) return setView({ k: 1, x: 0, y: 0 });
    if (compact) return; // embedded map stays put; the card does the talking
    const p = projection([m.location.longitude, m.location.latitude]);
    if (!p) return;
    const k = 2.2;
    const tx = wide ? 420 + (size.w - 420) / 2 : size.w / 2;
    const ty = wide ? size.h / 2 : size.h * 0.16; // phones: the sheet covers the lower 70%
    setView(clamp({ k, x: tx - p[0] * k, y: ty - p[1] * k }));
  }, [selectedId, size.w, size.h, projection, markers, compact, wide, clamp]);

  const ease = anim === "fly" ? "transform 1s cubic-bezier(0.65,0,0.35,1)" : anim === "fast" ? "transform 0.22s ease-out" : "none";
  const selected = placed.find((p) => p.m.location.id === selectedId);

  return (
    <div
      ref={wrap}
      className={cx("select-none overflow-hidden bg-[#070708]", compact ? "touch-pan-y" : "touch-none cursor-grab active:cursor-grabbing", className ?? "relative")}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerUp}
      onClick={(e) => {
        if (moved.current > 6) return;
        const t = e.target as Element;
        if (!t.closest("button") && !t.closest("[data-popover]")) onSelect(null);
      }}
      role="application"
      aria-label="Map of where Loash will be tattooing. Use the list of stops for keyboard access."
    >
      <svg width={size.w} height={size.h} className="absolute inset-0 block" aria-hidden>
        <defs>
          {/* Water: fine engraved swell lines, like an old chart */}
          <pattern id="water" width="9" height="5" patternUnits="userSpaceOnUse">
            <path d="M0 2.5 Q2.25 1.4 4.5 2.5 T9 2.5" fill="none" stroke="rgb(150 170 200 / 0.10)" strokeWidth="0.6" />
          </pattern>
          {/* Land: stippled stone */}
          <pattern id="stipple" width="6" height="6" patternUnits="userSpaceOnUse">
            <circle cx="1" cy="1" r="0.45" fill="rgb(236 226 205 / 0.10)" />
            <circle cx="4" cy="4" r="0.35" fill="rgb(236 226 205 / 0.07)" />
          </pattern>
          <linearGradient id="landShade" x1="0" y1="0" x2="0.4" y2="1">
            <stop offset="0%" stopColor="#2d2a26" />
            <stop offset="100%" stopColor="#201e1b" />
          </linearGradient>
          <radialGradient id="vignette" cx="55%" cy="45%" r="78%">
            <stop offset="60%" stopColor="#000" stopOpacity="0" />
            <stop offset="100%" stopColor="#000" stopOpacity="0.7" />
          </radialGradient>
        </defs>
        <rect width="100%" height="100%" fill="#08090c" />
        <rect width="100%" height="100%" fill="url(#water)" />
        <g style={{ transform: `translate(${view.x}px, ${view.y}px) scale(${view.k})`, transformOrigin: "0 0", transition: ease, willChange: "transform" }}>
          <path d={d.grat} fill="none" stroke="rgb(201 169 106 / 0.07)" strokeWidth="0.6" vectorEffect="non-scaling-stroke" strokeDasharray="2 5" />
          {/* coast glow then land */}
          <path d={d.land} fill="none" stroke="rgb(201 169 106 / 0.10)" strokeWidth="5" vectorEffect="non-scaling-stroke" />
          <path d={d.land} fill="url(#landShade)" stroke="rgb(236 226 205 / 0.55)" strokeWidth="0.9" vectorEffect="non-scaling-stroke" />
          <path d={d.land} fill="url(#stipple)" />
          <path d={d.lakes} fill="#08090c" stroke="rgb(236 226 205 / 0.5)" strokeWidth="0.9" vectorEffect="non-scaling-stroke" />
          <path d={d.lakes} fill="url(#water)" />
          <path d={d.states} fill="none" stroke="rgb(236 226 205 / 0.22)" strokeWidth="0.7" vectorEffect="non-scaling-stroke" strokeDasharray="2 3" />
          <path d={d.border} fill="none" stroke="rgb(201 169 106 / 0.55)" strokeWidth="1" vectorEffect="non-scaling-stroke" strokeDasharray="6 3 1 3" />
        </g>
        <rect width="100%" height="100%" fill="url(#vignette)" pointerEvents="none" />
      </svg>

      {/* geographic labels — fixed size while zooming */}
      <div aria-hidden className="pointer-events-none absolute inset-0">
        {LAND_LABELS.map((l) => {
          const [x, y] = toScreen(l.lon, l.lat);
          return (
            <span key={l.name} className={cx("absolute left-0 top-0 whitespace-nowrap caps text-[#d8cfbd]/30", l.cls)} style={{ transform: `translate(${x}px, ${y}px) translate(-50%,-50%)`, transition: ease }}>
              {l.name}
            </span>
          );
        })}
        {LAKE_LABELS.filter((l) => !l.minK || view.k >= l.minK).map((l) => {
          const [x, y] = toScreen(l.lon, l.lat);
          return (
            <span key={l.name} className={cx("absolute left-0 top-0 whitespace-nowrap font-display italic text-[#9fb3cc]/45", l.big ? "text-[16px] tracking-[0.1em]" : "text-[13px]")} style={{ transform: `translate(${x}px, ${y}px) translate(-50%,-50%)`, transition: ease }}>
              {l.name}
            </span>
          );
        })}
      </div>

      {/* markers */}
      <ul className="absolute inset-0" aria-label="Locations">
        {placed.map(({ m, x, y, side }) => {
          const sel = m.location.id === selectedId;
          const here = m.location.id === hereId;
          const s = STATUS[m.status];
          return (
            <li key={m.location.id} className="absolute left-0 top-0" style={{ transform: `translate(${x}px, ${y}px)`, transition: ease, zIndex: sel ? 4 : here ? 3 : 2 }}>
              <button
                data-cursor="explore"
                onClick={(e) => { e.stopPropagation(); onSelect(sel ? null : m.location.id); }}
                aria-pressed={sel}
                aria-label={`${m.location.city}, ${m.location.region}: ${s.label}. ${m.sub}${here ? ". Here now." : ""}`}
                className="group relative -translate-x-1/2 -translate-y-1/2 p-3"
              >
                {here && (
                  <>
                    <span className="here-ring pointer-events-none absolute left-1/2 top-1/2 size-6 rounded-full border-2 border-gold motion-reduce:hidden" />
                    <span className="here-ring pointer-events-none absolute left-1/2 top-1/2 size-6 rounded-full border border-gold-bright motion-reduce:hidden" style={{ animationDelay: "0.9s" }} />
                  </>
                )}
                <span
                  className={cx("relative block rotate-45 border transition-all duration-500", sel ? "size-4" : "size-3 group-hover:size-3.5", here && "here-glow")}
                  style={{
                    borderColor: here ? "var(--color-gold-bright)" : s.token,
                    background: here ? "var(--color-gold)" : sel ? s.token : "#0b0b0d",
                    boxShadow: sel ? `0 0 0 5px rgb(8 8 10 / .85), 0 0 0 6px ${here ? "var(--color-gold)" : s.token}` : "0 0 0 3px rgb(8 8 10 / .85)",
                  }}
                />
                {m.location.isHome && !here && <Star size={8} className="absolute left-1/2 top-0 -translate-x-1/2 text-gold" />}
                <span className={cx("absolute top-1/2 -translate-y-1/2 whitespace-nowrap", side === "right" ? "left-full text-left" : "right-full text-right")}>
                  <span className={cx("block caps text-[13.5px] tracking-[0.2em] transition-colors", sel || here ? "text-bone" : "text-mist group-hover:text-bone")} style={{ textShadow: "0 1px 8px #000, 0 0 3px #000" }}>
                    {m.location.city}
                  </span>
                  <span className={cx("mt-0.5 flex items-center gap-1.5 text-[12px] font-medium", side === "left" && "justify-end")} style={{ color: here ? "var(--color-gold-bright)" : s.token, textShadow: "0 1px 6px #000" }}>
                    {here ? <>Here now</> : <><StatusGlyph status={m.status} size={7} /> {s.short}</>}
                  </span>
                </span>
              </button>
            </li>
          );
        })}
      </ul>

      {/* popover card beside the selected pin */}
      {popover && selected && (
        <div
          data-popover
          className="absolute z-10"
          style={
            size.w < 560
              ? { left: 10, right: 10, bottom: 10 } // phones: dock the card along the bottom edge
              : {
                  width: 280,
                  left: Math.min(Math.max(12, selected.x - 140), size.w - 292),
                  top: selected.y > size.h * 0.5 ? undefined : Math.min(selected.y + 26, size.h - 12),
                  bottom: selected.y > size.h * 0.5 ? Math.max(12, size.h - selected.y + 26) : undefined,
                }
          }
          onClick={(e) => e.stopPropagation()}
        >
          {popover(selected.m)}
        </div>
      )}

      {!compact && (
        <div className="absolute right-4 top-4 z-10 flex flex-col border border-[var(--line-strong)] bg-ink/80 backdrop-blur lg:right-6 lg:top-6">
          <button className="grid size-11 place-items-center text-xl text-mist hover:text-gold-bright" onClick={() => zoomAt(1.6, size.w / 2, size.h / 2, "fly")} aria-label="Zoom in">+</button>
          <span className="h-px bg-[var(--line)]" />
          <button className="grid size-11 place-items-center text-xl text-mist hover:text-gold-bright" onClick={() => zoomAt(1 / 1.6, size.w / 2, size.h / 2, "fly")} aria-label="Zoom out">−</button>
          <span className="h-px bg-[var(--line)]" />
          <button className="grid size-11 place-items-center text-mist hover:text-gold-bright" onClick={() => { onSelect(null); setAnim("fly"); setView({ k: 1, x: 0, y: 0 }); }} aria-label="Reset view">
            <svg width="14" height="14" viewBox="0 0 14 14" aria-hidden><circle cx="7" cy="7" r="5.5" fill="none" stroke="currentColor" /><circle cx="7" cy="7" r="1.5" fill="currentColor" /></svg>
          </button>
        </div>
      )}
    </div>
  );
}
