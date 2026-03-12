"use client";

import { useState, useCallback } from "react";
import { caseStudies } from "@/lib/data";
import CaseStudyModal from "./CaseStudyModal";
import ScrollReveal from "./ScrollReveal";

export default function PortfolioSection() {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const close = useCallback(() => setActiveIndex(null), []);

  return (
    <>
      <section id="work" className="py-24 lg:py-36 border-b border-border dark:border-border-dark">
        <div className="max-w-[1140px] mx-auto px-6 lg:px-12">
          <ScrollReveal>
            <p className="text-[0.68rem] font-medium uppercase tracking-[0.2em] text-gold dark:text-gold-bright mb-6">
              Case Studies
            </p>
          </ScrollReveal>
          <ScrollReveal delay={1}>
            <h2 className="font-serif text-[clamp(2.2rem,4.5vw,3.4rem)] font-normal leading-[1.12] tracking-tight text-txt dark:text-txt-dark">
              Automations running in production.
            </h2>
          </ScrollReveal>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-px bg-border dark:bg-border-dark mt-12">
            {caseStudies.map((cs, i) => (
              <ScrollReveal key={cs.slug} delay={i % 2 === 0 ? 2 : 3}>
                <button
                  onClick={() => setActiveIndex(i)}
                  className="w-full text-left bg-white dark:bg-bg-dark p-8 lg:p-10 hover:bg-green-light dark:hover:bg-green-bright-light transition-colors cursor-pointer border-none"
                >
                  <div className="flex items-center gap-2 mb-4">
                    <span className="w-[18px] h-px bg-gold dark:bg-gold-bright" />
                    <span className="text-[0.65rem] font-medium uppercase tracking-[0.18em] text-gold dark:text-gold-bright">
                      {cs.type}
                    </span>
                  </div>
                  <h3 className="font-serif text-[1.55rem] font-normal text-txt dark:text-txt-dark mb-2">
                    {cs.title}
                  </h3>
                  <p className="text-[0.88rem] font-light text-txt-muted dark:text-txt-dark-muted leading-[1.7] mb-5 line-clamp-2">
                    {cs.context}
                  </p>
                  <div className="flex gap-2 flex-wrap">
                    {cs.tags.map((tag) => (
                      <span
                        key={tag}
                        className="text-[0.65rem] font-normal uppercase tracking-[0.1em] text-txt-muted dark:text-txt-dark-muted border border-border dark:border-border-dark px-2.5 py-1"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                  <span className="inline-block mt-4 text-[0.75rem] text-green dark:text-green-bright tracking-[0.05em]">
                    Read case study →
                  </span>
                </button>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      <CaseStudyModal
        study={activeIndex !== null ? caseStudies[activeIndex] : null}
        onClose={close}
      />
    </>
  );
}
