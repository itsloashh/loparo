"use client";

import { useEffect } from "react";
import type { CaseStudy } from "@/lib/data";

interface Props {
  study: CaseStudy | null;
  onClose: () => void;
}

export default function CaseStudyModal({ study, onClose }: Props) {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (study) {
      document.body.style.overflow = "hidden";
      document.addEventListener("keydown", handler);
    }
    return () => {
      document.body.style.overflow = "";
      document.removeEventListener("keydown", handler);
    };
  }, [study, onClose]);

  if (!study) return null;

  return (
    <div
      className="modal-overlay open"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="relative w-full max-w-[680px] max-h-[85vh] overflow-y-auto bg-white dark:bg-bg-dark-warm border border-border dark:border-border-dark p-8 md:p-12">
        <button
          onClick={onClose}
          className="absolute top-4 right-5 text-2xl text-txt-muted dark:text-txt-dark-muted hover:text-txt dark:hover:text-txt-dark bg-transparent border-none cursor-pointer"
        >
          &times;
        </button>
        <p className="text-[0.68rem] font-medium uppercase tracking-[0.2em] text-gold dark:text-gold-bright mb-6">
          {study.type}
        </p>
        <h2 className="font-serif text-3xl font-normal text-txt dark:text-txt-dark mb-8">
          {study.title}
        </h2>

        {[
          { heading: "Business Context", body: study.context },
          { heading: "Challenge", body: study.challenge },
          { heading: "Strategy & Architecture", body: study.strategy },
          { heading: "Outcome", body: study.outcome },
        ].map((s) => (
          <div key={s.heading} className="mb-6">
            <h4 className="text-[0.7rem] font-medium uppercase tracking-[0.15em] text-txt-muted dark:text-txt-dark-muted mb-2">
              {s.heading}
            </h4>
            <p className="text-[0.92rem] font-light leading-[1.75] text-txt-mid dark:text-txt-dark-mid">
              {s.body}
            </p>
          </div>
        ))}

        <div className="flex gap-8 mt-8 pt-6 border-t border-border dark:border-border-dark">
          {study.metrics.map((m) => (
            <div key={m.label}>
              <h5 className="font-serif text-2xl font-normal text-green dark:text-green-bright">
                {m.value}
              </h5>
              <p className="text-[0.7rem] uppercase tracking-[0.12em] text-txt-muted dark:text-txt-dark-muted mt-1">
                {m.label}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
