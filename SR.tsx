"use client";
import { useState, useCallback } from "react";
import { caseStudies } from "@/lib/data";
import Modal from "./Modal";
import SR from "./SR";

export default function Work() {
  const [active, setActive] = useState<number | null>(null);
  const close = useCallback(() => setActive(null), []);
  return (
    <>
      <section id="work" className="relative py-28 lg:py-40">
        <div className="orb orb-purple w-[500px] h-[500px] -right-40 top-20" />
        <div className="max-w-[1200px] mx-auto px-6 lg:px-12 relative z-10">
          <SR><span className="pill pill-gold mb-4">Case Studies</span></SR>
          <SR delay={1}><h2 className="font-serif text-[clamp(2rem,4.5vw,3.2rem)] font-normal leading-[1.1] text-txt mt-4 mb-3">Automations running in production.</h2></SR>
          <SR delay={2}><p className="text-sm text-txt-muted font-light max-w-[480px] mb-12">Real workflows solving real problems for real businesses.</p></SR>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {caseStudies.map((cs, i) => (
              <SR key={cs.slug} delay={i < 3 ? 2 : 3}>
                <div className="glass p-7 group h-full flex flex-col">
                  <span className="pill pill-gold mb-4">{cs.type}</span>
                  <h3 className="font-serif text-xl text-txt mb-2 mt-2 group-hover:text-gold transition-colors">{cs.title}</h3>
                  <p className="text-[0.82rem] font-light text-txt-muted leading-[1.7] mb-4 line-clamp-2">{cs.context}</p>
                  <div className="flex gap-1.5 flex-wrap mb-4">{cs.tags.map(t => <span key={t} className="pill">{t}</span>)}</div>
                  <div className="mt-auto flex items-center gap-4">
                    <button onClick={() => setActive(i)} className="text-[0.72rem] text-gold tracking-wide hover:tracking-widest transition-all cursor-pointer bg-transparent border-none p-0">Read case study →</button>
                    {cs.url && (
                      <a href={cs.url} target="_blank" rel="noopener noreferrer" className="text-[0.72rem] text-txt-muted hover:text-gold tracking-wide transition-all">Visit site ↗</a>
                    )}
                  </div>
                </div>
              </SR>
            ))}
          </div>
        </div>
      </section>
      <Modal study={active !== null ? caseStudies[active] : null} onClose={close} />
    </>
  );
}
