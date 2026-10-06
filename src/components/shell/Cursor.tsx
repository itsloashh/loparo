"use client";
import { useEffect, useRef, useState } from "react";

/**
 * Quiet cursor (fine pointers only): a small light dot.
 * - Over buttons/links it eases into a thin gold ring — no words.
 * - Over artwork ([data-cursor="view"]) it becomes a soft "View" lens.
 */
type Mode = "dot" | "ring" | "view";

export function Cursor() {
  const ref = useRef<HTMLDivElement>(null);
  const [mode, setMode] = useState<Mode>("dot");
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(hover: hover) and (pointer: fine)");
    if (!mq.matches) return;
    setEnabled(true);
    document.documentElement.classList.add("has-cursor");
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    let x = -100, y = -100, cx = -100, cy = -100, raf = 0, visible = false;
    const move = (e: PointerEvent) => {
      x = e.clientX; y = e.clientY;
      const el = ref.current;
      if (el && !visible) { visible = true; cx = x; cy = y; el.style.opacity = "1"; }
      const t = (e.target as HTMLElement)?.closest?.("[data-cursor], a, button, [role=button], label, select, summary") as HTMLElement | null;
      let next: Mode = "dot";
      if (t && !t.matches("input, textarea")) next = t.getAttribute("data-cursor") === "view" ? "view" : t.getAttribute("data-cursor") === "none" ? "dot" : "ring";
      setMode((p) => (p === next ? p : next));
    };
    const leave = () => { visible = false; if (ref.current) ref.current.style.opacity = "0"; };
    const loop = () => {
      const k = reduce ? 1 : 0.25;
      cx += (x - cx) * k; cy += (y - cy) * k;
      if (ref.current) ref.current.style.transform = `translate3d(${cx}px, ${cy}px, 0)`;
      raf = requestAnimationFrame(loop);
    };
    window.addEventListener("pointermove", move, { passive: true });
    document.addEventListener("pointerleave", leave);
    raf = requestAnimationFrame(loop);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("pointermove", move);
      document.removeEventListener("pointerleave", leave);
      document.documentElement.classList.remove("has-cursor");
    };
  }, []);

  const size = mode === "view" ? 72 : mode === "ring" ? 30 : 8;
  return (
    <div ref={ref} aria-hidden className="pointer-events-none fixed left-0 top-0 z-[100] opacity-0 transition-opacity duration-300">
      {enabled && (
        <div
          className="grid place-items-center rounded-full transition-[width,height,background-color,border-color] duration-500 ease-[var(--ease-ink)]"
          style={{
            width: size,
            height: size,
            transform: "translate(-50%, -50%)",
            border: `1px solid ${mode === "dot" ? "transparent" : "rgb(201 169 106 / 0.75)"}`,
            background: mode === "view" ? "rgb(10 10 11 / 0.5)" : mode === "ring" ? "transparent" : "#f4f0e9",
            backdropFilter: mode === "view" ? "blur(6px)" : undefined,
          }}
        >
          {mode === "view" && <span className="font-display text-[15px] italic text-bone">View</span>}
        </div>
      )}
    </div>
  );
}
