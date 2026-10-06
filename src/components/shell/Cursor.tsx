"use client";
import { useEffect, useRef, useState } from "react";

/**
 * Subtle silver cursor (fine pointers only).
 * Reads the nearest [data-cursor] attribute: "view" | "open" | "explore" | "none".
 * Plain links/buttons fall back to "open".
 */
export function Cursor() {
  const ref = useRef<HTMLDivElement>(null);
  const [label, setLabel] = useState<string | null>(null);
  const [enabled, setEnabled] = useState(false);
  const [down, setDown] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(hover: hover) and (pointer: fine)");
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!mq.matches) return;
    setEnabled(true);
    document.documentElement.classList.add("has-cursor");

    let x = -100, y = -100, cx = -100, cy = -100, raf = 0, visible = false;
    const el = ref.current!;
    const move = (e: PointerEvent) => {
      x = e.clientX; y = e.clientY;
      if (!visible) { visible = true; cx = x; cy = y; el.style.opacity = "1"; }
      const t = (e.target as HTMLElement)?.closest?.("[data-cursor], a, button, [role=button], label, select, summary") as HTMLElement | null;
      let next: string | null = null;
      if (t) {
        const attr = t.getAttribute("data-cursor");
        next = attr === "none" ? null : attr ?? "open";
        if (t.matches("input, textarea")) next = null;
      }
      setLabel((p) => (p === next ? p : next));
    };
    const leave = () => { visible = false; el.style.opacity = "0"; };
    const loop = () => {
      const k = reduce ? 1 : 0.22;
      cx += (x - cx) * k; cy += (y - cy) * k;
      el.style.transform = `translate3d(${cx}px, ${cy}px, 0)`;
      raf = requestAnimationFrame(loop);
    };
    const d = () => setDown(true), u = () => setDown(false);
    window.addEventListener("pointermove", move, { passive: true });
    document.addEventListener("pointerleave", leave);
    window.addEventListener("pointerdown", d);
    window.addEventListener("pointerup", u);
    raf = requestAnimationFrame(loop);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("pointermove", move);
      document.removeEventListener("pointerleave", leave);
      window.removeEventListener("pointerdown", d);
      window.removeEventListener("pointerup", u);
      document.documentElement.classList.remove("has-cursor");
    };
  }, []);

  const big = label === "view" || label === "explore";
  const size = big ? 76 : label ? 52 : 10;
  return (
    <div ref={ref} aria-hidden className="pointer-events-none fixed left-0 top-0 z-[100] opacity-0 transition-opacity duration-300">
      {enabled && <div
        className="grid -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full transition-[width,height,background-color,border-color] duration-500 ease-[var(--ease-ink)]"
        style={{
          width: size,
          height: size,
          transform: `translate(-50%, -50%) scale(${down ? 0.85 : 1})`,
          border: `1px solid ${label ? "rgb(214 214 219 / 0.7)" : "transparent"}`,
          background: big ? "rgb(10 10 11 / 0.55)" : label ? "transparent" : "#e9e8e4",
          backdropFilter: big ? "blur(6px)" : undefined,
          mixBlendMode: label ? "normal" : "difference",
        }}
      >
        {label && (
          <span className={`font-mono uppercase text-bone ${big ? "text-[9.5px] tracking-[0.24em]" : "text-[8px] tracking-[0.2em] opacity-80"}`}>{label}</span>
        )}
      </div>}
    </div>
  );
}
