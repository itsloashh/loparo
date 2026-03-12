"use client";
import { useEffect } from "react";
import type { CaseStudy } from "@/lib/data";
export default function Modal({ study, onClose }: { study: CaseStudy | null; onClose: () => void }) {
  useEffect(() => { const h = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); }; if (study) { document.body.style.overflow = "hidden"; document.addEventListener("keydown", h); } return () => { document.body.style.overflow = ""; document.removeEventListener("keydown", h); }; }, [study, onClose]);
  if (!study) return null;
  return (
    <div className="modal-bg open" onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="relative w-full max-w-[700px] max-h-[85vh] overflow-y-auto glass p-8 md:p-12 gradient-border">
        <button onClick={onClose} className="absolute top-4 right-5 text-2xl text-txt-muted hover:text-txt bg-transparent border-none cursor-pointer">&times;</button>
        <span className="pill pill-gold mb-5">{study.type}</span>
        <h2 className="font-serif text-3xl text-txt mb-8 mt-3">{study.title}</h2>
        {[{ h: "Business Context", b: study.context }, { h: "Challenge", b: study.challenge }, { h: "Strategy & Architecture", b: study.strategy }, { h: "Outcome", b: study.outcome }].map(s => (
          <div key={s.h} className="mb-6"><h4 className="text-[0.65rem] font-semibold uppercase tracking-[0.15em] text-txt-muted mb-2">{s.h}</h4><p className="text-[0.9rem] font-light leading-[1.75] text-txt-mid">{s.b}</p></div>
        ))}
        <div className="flex gap-10 mt-8 pt-6 border-t border-line">
          {study.metrics.map(m => (<div key={m.label}><h5 className="font-serif text-2xl gold-text">{m.value}</h5><p className="text-[0.65rem] uppercase tracking-[0.1em] text-txt-muted mt-1">{m.label}</p></div>))}
        </div>
      </div>
    </div>
  );
}
