"use client";
import { useEffect, useRef, ReactNode } from "react";
export default function SR({ children, className = "", delay = 0 }: { children: ReactNode; className?: string; delay?: number }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => { const el = ref.current; if (!el) return; const o = new IntersectionObserver(([e]) => { if (e.isIntersecting) { el.classList.add("v"); o.unobserve(el); } }, { threshold: 0.08, rootMargin: "0px 0px -30px 0px" }); o.observe(el); return () => o.disconnect(); }, []);
  const d = delay === 1 ? "sr-d1" : delay === 2 ? "sr-d2" : delay === 3 ? "sr-d3" : delay === 4 ? "sr-d4" : "";
  return <div ref={ref} className={`sr ${d} ${className}`}>{children}</div>;
}
