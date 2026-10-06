"use client";
/**
 * The Loash Atlas — a custom engraved vector map.
 * Geography: Natural Earth (public domain), clipped to the Great Lakes region at build time.
 * Projection fits whatever locations exist, so adding a city in the DB just works.
 *
 * Swappable: <Atlas> takes plain markers + callbacks, so a Mapbox GL implementation can
 * replace it later without touching the map page.
 */
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
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

const LAKE_LABELS: { name: string; lon: number; lat: number; size?: number; minK?: number }[] = [
  { name: "Lake Huron", lon: -82.3, lat: 44.75, size: 1 },
  { name: "Georgian Bay", lon: -80.75, lat: 45.15 },
  { name: "Lake Erie", lon: -81.25, lat: 42.2, size: 1 },
  { name: "Lake Ontario", lon: -77.9, lat: 43.62, size: 1 },
  { name: "Lake Michigan", lon: -87.0, lat: 43.6, size: 1 },
  { name: "Lake St. Clair", lon: -82.7, lat: 42.47, minK: 2.5 },
  { name: "Lake Simcoe", lon: -79.4, lat: 44.42, minK: 1.5 },
];
const COUNTRY_LABELS = [
  { name: "Canada", lon: -80.4, lat: 44.0 },
  { name: "United States", lon: -84.6, lat: 41.75 },
];

type View = { k: number; x: number; y: number };

export function Atlas({
  markers, selectedId, onSelect, className, compact,
}: { markers: AtlasMarker[]; selectedId: string | null; onSelect: (id: string | null) => void; className?: string; compact?: boolean }) {
  const wrap = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState({ w: 0, h: 0 });
  const [view, setView] = useState<View>({ k: 1, x: 0, y: 0 });
  const [animate, setAnimate] = useState(false);

  useEffect(() => {
    const el = wrap.current!;
    const ro = new ResizeObserver(([e]) => setSize({ w: e.contentRect.width, h: e.contentRect.height }));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  // Fit the projection to every location (+ geographic context)
  const projection = useMemo(() => {
    const lons = markers.map((m) => m.location.longitude), lats = markers.map((m) => m.location.latitude);
    const minLon = Math.min(-84.2, ...lons) - 0.9, maxLon = Math.max(-78.6, ...lons) + 0.9;
    const minLat = Math.min(41.5, ...lats) - 0.5, maxLat = Math.max(44.4, ...lats) + 0.5;
    // MultiPoint avoids spherical winding pitfalls when fitting a bounding box
    const box: Feature = {
      type: "Feature", properties: {},
      geometry: { type: "MultiPoint", coordinates: [[minLon, minLat], [maxLon, minLat], [maxLon, maxLat], [minLon, maxLat]] },
    };
    const w = Math.max(size.w, 1), h = Math.max(size.h, 1);
    const padX = compact ? 16 : Math.min(80, w * 0.08);
    const padRight = compact ? 70 : Math.max(padX, 96); // room for city labels
    const padTop = compact ? 16 : 60;
    // leave room for the side panel on wide screens / the sheet on phones
    const padLeft = !compact && w > 900 ? 400 : padX;
    const padBottom = !compact && w <= 900 ? Math.min(220, h * 0.32) : padTop;
    return geoConicConformal().parallels([42, 45]).rotate([81.5, 0]).fitExtent([[padLeft, padTop], [w - padRight, h - padBottom]], box);
  }, [markers, size.w, size.h, compact]);

  const path = useMemo(() => geoPath(projection), [projection]);
  const d = useMemo(
    () => ({
      land: path(geo.land) ?? "",
      lakes: path(geo.lakes) ?? "",
      states: path(geo.states) ?? "",
      border: path(geo.border) ?? "",
      // graticule limited to the data extent — a global one explodes near the pole under a conic projection
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

  // Collision-aware marker placement (Windsor & Detroit sit ~2km apart)
  const placed = useMemo(() => {
    const pts = markers.map((m) => {
      const [x, y] = toScreen(m.location.longitude, m.location.latitude);
      return { m, x, y, side: "right" as "left" | "right" };
    });
    for (let i = 0; i < pts.length; i++)
      for (let j = i + 1; j < pts.length; j++) {
        const a = pts[i], b = pts[j];
        const dx = b.x - a.x, dy = b.y - a.y, dist = Math.hypot(dx, dy);
        if (dist < 30) {
          const push = (30 - dist) / 2 + 1;
          const west = a.m.location.longitude < b.m.location.longitude ? a : b;
          const east = west === a ? b : a;
          west.x -= push; east.x += push;
          west.side = "left"; east.side = "right";
        }
      }
    return pts;
  }, [markers, toScreen]);

  // ── interaction: drag to pan, wheel / pinch to zoom ──
  const pointers = useRef(new Map<number, { x: number; y: number }>());
  const last = useRef<{ x: number; y: number; dist?: number } | null>(null);
  const moved = useRef(0);
  const clampK = (k: number) => Math.min(6, Math.max(0.8, k));

  const zoomAt = (factor: number, cx: number, cy: number, anim = false) => {
    setAnimate(anim);
    setView((v) => {
      const k = clampK(v.k * factor);
      const f = k / v.k;
      return { k, x: cx - (cx - v.x) * f, y: cy - (cy - v.y) * f };
    });
  };

  const onWheel = (e: React.WheelEvent) => {
    const r = wrap.current!.getBoundingClientRect();
    zoomAt(Math.exp(-e.deltaY * 0.0015), e.clientX - r.left, e.clientY - r.top);
  };
  useEffect(() => {
    // prevent page scroll while zooming the map with a wheel
    const el = wrap.current!;
    const stop = (e: WheelEvent) => e.preventDefault();
    el.addEventListener("wheel", stop, { passive: false });
    return () => el.removeEventListener("wheel", stop);
  }, []);

  const onPointerDown = (e: React.PointerEvent) => {
    if ((e.target as HTMLElement).closest("button")) return;
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    pointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
    last.current = null;
    moved.current = 0;
    setAnimate(false);
  };
  const onPointerMove = (e: React.PointerEvent) => {
    if (!pointers.current.has(e.pointerId)) return;
    pointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
    const ps = [...pointers.current.values()];
    const r = wrap.current!.getBoundingClientRect();
    if (ps.length === 1) {
      const p = ps[0];
      if (last.current) {
        const dx = p.x - last.current.x, dy = p.y - last.current.y;
        moved.current += Math.abs(dx) + Math.abs(dy);
        setView((v) => ({ ...v, x: v.x + dx, y: v.y + dy }));
      }
      last.current = { x: p.x, y: p.y };
    } else if (ps.length === 2) {
      const [a, b] = ps;
      const dist = Math.hypot(a.x - b.x, a.y - b.y);
      const mx = (a.x + b.x) / 2 - r.left, my = (a.y + b.y) / 2 - r.top;
      if (last.current?.dist) zoomAt(dist / last.current.dist, mx, my);
      last.current = { x: mx + r.left, y: my + r.top, dist };
    }
  };
  const onPointerUp = (e: React.PointerEvent) => {
    pointers.current.delete(e.pointerId);
    last.current = null;
  };

  // Fly to selection
  useEffect(() => {
    if (!size.w) return;
    const m = markers.find((x) => x.location.id === selectedId);
    setAnimate(true);
    if (!m) return setView({ k: 1, x: 0, y: 0 });
    const p = projection([m.location.longitude, m.location.latitude]);
    if (!p) return;
    const k = compact ? 1.4 : 2.1;
    const wide = size.w > 900 && !compact;
    const tx = wide ? 400 + (size.w - 400) / 2 : size.w / 2;
    const ty = wide ? size.h / 2 : compact ? size.h / 2 : size.h * 0.3;
    setView({ k, x: tx - p[0] * k, y: ty - p[1] * k });
  }, [selectedId, size.w, size.h, projection, markers, compact]);

  const transition = animate ? "transform 1.1s cubic-bezier(0.65,0,0.35,1)" : "none";
  const posTransition = animate ? "transform 1.1s cubic-bezier(0.65,0,0.35,1)" : "none";

  return (
    <div
      ref={wrap}
      className={cx("touch-none select-none overflow-hidden bg-[#0c0c0e]", className ?? "relative")}
      onWheel={onWheel}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerUp}
      onClick={(e) => { if (moved.current > 6) return; if (e.target === e.currentTarget || (e.target as Element).tagName === "svg" || (e.target as Element).tagName === "path") onSelect(null); }}
      role="application"
      aria-label="Map of where Loash will be tattooing. Use the list of stops for keyboard access."
    >
      <svg width={size.w} height={size.h} className="absolute inset-0 block" aria-hidden>
        <defs>
          <pattern id="engrave" width="5" height="5" patternUnits="userSpaceOnUse" patternTransform="rotate(-28)">
            <line x1="0" y1="0" x2="0" y2="5" stroke="rgb(214 214 219 / 0.11)" strokeWidth="0.7" />
          </pattern>
          <radialGradient id="vignette" cx="55%" cy="45%" r="75%">
            <stop offset="55%" stopColor="#000" stopOpacity="0" />
            <stop offset="100%" stopColor="#000" stopOpacity="0.75" />
          </radialGradient>
          <linearGradient id="landShade" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#212126" />
            <stop offset="100%" stopColor="#19191d" />
          </linearGradient>
        </defs>
        {/* water */}
        <rect width="100%" height="100%" fill="url(#engrave)" />
        <g style={{ transform: `translate(${view.x}px, ${view.y}px) scale(${view.k})`, transformOrigin: "0 0", transition }}>
          <path d={d.grat} fill="none" stroke="rgb(214 214 219 / 0.05)" strokeWidth="0.6" vectorEffect="non-scaling-stroke" strokeDasharray="2 4" />
          <path d={d.land} fill="url(#landShade)" stroke="rgb(214 214 219 / 0.28)" strokeWidth="0.8" vectorEffect="non-scaling-stroke" />
          <path d={d.lakes} fill="#09090b" stroke="rgb(214 214 219 / 0.32)" strokeWidth="0.8" vectorEffect="non-scaling-stroke" />
          <path d={d.lakes} fill="url(#engrave)" />
          <path d={d.states} fill="none" stroke="rgb(214 214 219 / 0.12)" strokeWidth="0.6" vectorEffect="non-scaling-stroke" strokeDasharray="1 3" />
          <path d={d.border} fill="none" stroke="rgb(214 214 219 / 0.3)" strokeWidth="0.9" vectorEffect="non-scaling-stroke" strokeDasharray="5 3 1 3" />
        </g>
        <rect width="100%" height="100%" fill="url(#vignette)" pointerEvents="none" />
      </svg>

      {/* geographic labels (don't scale with zoom) */}
      <div aria-hidden className="pointer-events-none absolute inset-0">
        {LAKE_LABELS.filter((l) => !l.minK || view.k >= l.minK).map((l) => {
          const [x, y] = toScreen(l.lon, l.lat);
          return (
            <span key={l.name} className={cx("absolute whitespace-nowrap font-display italic text-mist/45", l.size ? "text-[15px] tracking-[0.12em]" : "text-[12px]")} style={{ transform: `translate(${x}px, ${y}px) translate(-50%,-50%)`, left: 0, top: 0, transition: posTransition }}>
              {l.name}
            </span>
          );
        })}
        {COUNTRY_LABELS.map((l) => {
          const [x, y] = toScreen(l.lon, l.lat);
          return (
            <span key={l.name} className="absolute left-0 top-0 whitespace-nowrap caps text-[11px] tracking-[0.6em] text-ash/40" style={{ transform: `translate(${x}px, ${y}px) translate(-50%,-50%)`, transition: posTransition }}>
              {l.name}
            </span>
          );
        })}
      </div>

      {/* markers */}
      <ul className="absolute inset-0" aria-label="Locations">
        {placed.map(({ m, x, y, side }) => {
          const sel = m.location.id === selectedId;
          const s = STATUS[m.status];
          return (
            <li key={m.location.id} className="absolute left-0 top-0" style={{ transform: `translate(${x}px, ${y}px)`, transition: posTransition, zIndex: sel ? 3 : 2 }}>
              <button
                data-cursor="explore"
                onClick={(e) => { e.stopPropagation(); onSelect(sel ? null : m.location.id); }}
                aria-pressed={sel}
                aria-label={`${m.location.city}, ${m.location.region}: ${s.label}. ${m.sub}`}
                className="group relative -translate-x-1/2 -translate-y-1/2 p-2"
              >
                {m.status === "open" && (
                  <span className="absolute left-1/2 top-1/2 size-8 -translate-x-1/2 -translate-y-1/2 animate-ping rounded-full border opacity-30 motion-reduce:hidden" style={{ borderColor: s.token, animationDuration: "2.8s" }} />
                )}
                <span
                  className={cx("relative block rotate-45 border transition-all duration-500", sel ? "size-4" : "size-3 group-hover:size-3.5")}
                  style={{ borderColor: s.token, background: sel ? s.token : "#0c0c0e", boxShadow: sel ? `0 0 0 5px rgb(10 10 11 / .8), 0 0 0 6px ${s.token}` : "0 0 0 3px rgb(10 10 11 / .85)" }}
                />
                {m.location.isHome && <Star size={8} className="absolute left-1/2 top-[-6px] -translate-x-1/2 text-silver" />}
                <span
                  className={cx(
                    "absolute top-1/2 -translate-y-1/2 whitespace-nowrap text-left",
                    side === "right" ? "left-full pl-1.5" : "right-full pr-1.5 text-right",
                  )}
                >
                  <span className={cx("block caps text-[12.5px] tracking-[0.22em] transition-colors", sel ? "text-bone" : "text-mist group-hover:text-bone")} style={{ textShadow: "0 1px 8px #000, 0 0 2px #000" }}>
                    {m.location.city}
                  </span>
                  <span className={cx("mt-0.5 flex items-center gap-1.5 font-mono text-[9px] uppercase tracking-[0.16em]", side === "left" && "justify-end")} style={{ color: s.token, textShadow: "0 1px 6px #000" }}>
                    <StatusGlyph status={m.status} size={7} /> {s.short}
                  </span>
                </span>
              </button>
            </li>
          );
        })}
      </ul>

      {!compact && (
        <div className="absolute right-4 top-4 z-10 flex flex-col border border-[var(--line)] bg-ink/70 backdrop-blur lg:right-6 lg:top-6">
          <button className="grid size-10 place-items-center text-lg text-mist hover:text-bone" onClick={() => zoomAt(1.5, size.w / 2, size.h / 2, true)} aria-label="Zoom in">+</button>
          <span className="h-px bg-[var(--line)]" />
          <button className="grid size-10 place-items-center text-lg text-mist hover:text-bone" onClick={() => zoomAt(1 / 1.5, size.w / 2, size.h / 2, true)} aria-label="Zoom out">−</button>
          <span className="h-px bg-[var(--line)]" />
          <button className="grid size-10 place-items-center text-mist hover:text-bone" onClick={() => onSelect(null)} aria-label="Reset view">
            <svg width="14" height="14" viewBox="0 0 14 14" aria-hidden><circle cx="7" cy="7" r="5.5" fill="none" stroke="currentColor" /><circle cx="7" cy="7" r="1.5" fill="currentColor" /></svg>
          </button>
        </div>
      )}
    </div>
  );
}
