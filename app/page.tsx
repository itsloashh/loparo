import dynamic from "next/dynamic";
import Navbar from "@/components/Navbar";
import SR from "@/components/SR";
import Work from "@/components/Work";
import ContactForm from "@/components/ContactForm";

const HeroScene = dynamic(() => import("@/components/HeroScene"), { ssr: false });

export default function Home() {
  return (
    <>
      <Navbar />

      {/* ═══ HERO ═══ */}
      <section className="relative min-h-screen flex items-center overflow-hidden">
        <HeroScene />
        <div className="orb orb-gold w-[500px] h-[500px] top-[-100px] left-[-100px]" />
        <div className="orb orb-purple w-[400px] h-[400px] bottom-20 right-[-80px]" />

        <div className="relative z-10 max-w-[1200px] mx-auto px-6 lg:px-12 pt-32 pb-16 w-full">
          <div className="max-w-[650px]">
            <div className="ha flex items-center gap-2 mb-8">
              <span className="w-2 h-2 rounded-full bg-gold shadow-glow animate-pulse" />
              <span className="pill pill-gold">Available for new projects</span>
            </div>

            <h1 className="ha ha-1 text-[clamp(2.6rem,6.5vw,4.8rem)] font-serif font-light leading-[1.02] tracking-tight mb-7">
              Automate your business with <span className="gold-text">Agentic Powered</span> Workflows
            </h1>

            <p className="ha ha-2 text-[1.05rem] font-light leading-relaxed text-txt-mid max-w-[520px] mb-10">
              Intelligent automation systems that can help capture leads, follow up instantly with AI, sync your CRM, and keep your team in the loop — so you can focus on closing deals, not chasing them.
            </p>

            <div className="ha ha-3 flex gap-3 items-center flex-wrap mb-16">
              <a href="#contact" className="inline-block bg-gold text-bg text-[0.75rem] font-semibold uppercase tracking-wider px-7 py-3.5 rounded-full hover:bg-gold-dim hover:shadow-glow transition-all">Start a Project</a>
              <a href="#work" className="inline-block text-txt-mid text-[0.75rem] font-normal uppercase tracking-wider px-7 py-3.5 border border-line rounded-full hover:border-line-gold hover:text-txt transition-all">View Case Studies</a>
            </div>

            <div className="ha ha-4 grid grid-cols-3 gap-3">
              {[{ v: "~5s", l: "Lead response time" }, { v: "100%", l: "Automated follow-up" }, { v: "24/7", l: "Always running" }].map(s => (
                <div key={s.l} className="glass p-4 text-center">
                  <p className="font-serif text-2xl gold-text">{s.v}</p>
                  <p className="text-[0.6rem] uppercase tracking-[0.1em] text-txt-muted mt-1">{s.l}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ═══ RESERVOIR / SERVICES ═══ */}
      <section id="services" className="relative py-28 lg:py-40">
        <div className="orb orb-gold w-[400px] h-[400px] -left-40 top-40 opacity-60" />
        <div className="max-w-[1200px] mx-auto px-6 lg:px-12 relative z-10">
          <SR><span className="pill pill-gold">Reservoir</span></SR>
          <SR delay={1}><h2 className="font-serif text-[clamp(2rem,4.5vw,3.2rem)] font-normal leading-[1.1] text-txt mt-5 mb-3">Workflows that eliminate busywork.</h2></SR>
          <SR delay={2}><p className="text-sm text-txt-muted font-light max-w-[500px] mb-12">Custom automations tailored to your business. No bloat — just systems that work.</p></SR>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              { icon: "⚡", ai: true, title: "Lead Capture & AI Follow-up", desc: "Every lead gets a unique, AI-written email within seconds. CRM updates automatically. Your team gets notified instantly.", tags: ["n8n", "Claude AI", "Gmail", "Slack"] },
              { icon: "🔄", ai: false, title: "CRM Sync & Data Pipeline", desc: "Connect forms, calendars, and lead sources to your CRM. Automatic contact creation, deal tracking, and zero manual data entry.", tags: ["HubSpot", "Sheets", "Pipedrive"] },
              { icon: "🔔", ai: false, title: "Smart Notifications", desc: "Real-time Slack alerts with priority routing. Hot leads go to the right person. Nothing gets missed, even at 3am.", tags: ["Slack", "Email", "Webhooks"] },
              { icon: "🧠", ai: true, title: "Custom AI Workflows", desc: "Content generation, lead scoring, data enrichment, and intelligent routing — your business logic, amplified by AI.", tags: ["Claude", "GPT", "Custom Logic"] },
            ].map((item, i) => (
              <SR key={item.title} delay={i < 2 ? 2 : 3}>
                <div className="glass p-8 group">
                  <div className="flex items-center gap-3 mb-5">
                    <span className="text-2xl">{item.icon}</span>
                    {item.ai && <span className="pill pill-gold">AI-Powered</span>}
                  </div>
                  <h3 className="font-serif text-[1.4rem] text-txt mb-3 group-hover:text-gold transition-colors">{item.title}</h3>
                  <p className="text-[0.85rem] font-light text-txt-muted leading-[1.75] mb-5">{item.desc}</p>
                  <div className="flex gap-1.5 flex-wrap">{item.tags.map(t => <span key={t} className="pill">{t}</span>)}</div>
                  <p className="text-[0.72rem] text-gold mt-5 tracking-wide group-hover:tracking-widest transition-all cursor-pointer">Learn more →</p>
                </div>
              </SR>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ CASE STUDIES ═══ */}
      <Work />

      {/* ═══ PROCESS ═══ */}
      <section id="process" className="relative py-28 lg:py-40">
        <div className="max-w-[1200px] mx-auto px-6 lg:px-12 relative z-10">
          <SR><span className="pill pill-gold">How It Works</span></SR>
          <SR delay={1}><h2 className="font-serif text-[clamp(2rem,4.5vw,3.2rem)] font-normal leading-[1.1] text-txt mt-5 mb-3">From call to running automation.</h2></SR>
          <SR delay={2}><p className="text-sm text-txt-muted font-light max-w-[480px] mb-12">Simple process. Fast delivery. Runs forever.</p></SR>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { n: "01", t: "Discovery", d: "15-min call to map your workflow, pain points, and goals." },
              { n: "02", t: "Blueprint", d: "I design the automation flow and share a clear scope with you." },
              { n: "03", t: "Build & Test", d: "I build, test every edge case, and make sure it's bulletproof." },
              { n: "04", t: "Deploy", d: "We go live together. Your automation runs on autopilot." },
            ].map((s, i) => (
              <SR key={s.n} delay={i < 2 ? 2 : 3}>
                <div className="glass p-7 h-full group gradient-border">
                  <p className="font-serif text-4xl gold-text opacity-40 mb-5">{s.n}</p>
                  <h3 className="font-serif text-xl text-txt mb-2 group-hover:text-gold transition-colors">{s.t}</h3>
                  <p className="text-[0.85rem] font-light text-txt-muted leading-[1.75]">{s.d}</p>
                </div>
              </SR>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ PRICING ═══ */}
      <section id="pricing" className="relative py-28 lg:py-40">
        <div className="orb orb-pink w-[500px] h-[500px] -right-40 top-20 opacity-50" />
        <div className="max-w-[1200px] mx-auto px-6 lg:px-12 relative z-10">
          <SR><span className="pill pill-gold">Investment</span></SR>
          <SR delay={1}><h2 className="font-serif text-[clamp(2rem,4.5vw,3.2rem)] font-normal leading-[1.1] text-txt mt-5 mb-3">Simple pricing. Obvious ROI.</h2></SR>
          <SR delay={2}><p className="text-sm text-txt-muted font-light max-w-[460px] mb-14">One-time setup. Runs forever. One closed deal pays for it.</p></SR>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              { name: "Starter", price: "$800", sub: "one-time", desc: "One pre-built workflow from the Reservoir — no AI automation included.", features: ["1 workflow from the Reservoir", "Standard automation (no AI)", "Testing & deployment", "Setup walkthrough & documentation", "7 days of support"], cta: "Get Started", pop: false },
              { name: "Growth", price: "$1,350", sub: "one-time", desc: "Any AI-powered workflow from the Reservoir — includes an AI agent and/or AI automation.", features: ["1 AI-powered workflow from the Reservoir", "AI agent & automation included", "Example: auto lead gen with custom AI outreach", "Testing & deployment", "Setup walkthrough & documentation", "30 days of support"], cta: "Start a Project", pop: true },
              { name: "Scale", price: "Custom", sub: "", desc: "Project-specific builds priced by use case, complexity, hosting needs, and your requirements.", features: ["Custom-scoped workflows", "Tailored integrations", "Advanced AI logic", "Team onboarding", "Dedicated communication channel", "Ongoing support available"], cta: "Let's Talk", pop: false },
            ].map(plan => (
              <SR key={plan.name} delay={plan.pop ? 2 : 3}>
                <div className={`glass p-8 h-full flex flex-col ${plan.pop ? "gradient-border shadow-glow" : ""}`}>
                  {plan.pop && <span className="pill pill-gold self-start mb-4">Most Popular</span>}
                  <h3 className="font-serif text-2xl text-txt">{plan.name}</h3>
                  <div className="mt-3 mb-4">
                    <span className="font-serif text-[2.5rem] font-light gold-text">{plan.price}</span>
                    {plan.sub && <span className="text-sm text-txt-muted ml-2">{plan.sub}</span>}
                  </div>
                  <p className="text-[0.82rem] font-light text-txt-muted leading-[1.7] mb-6">{plan.desc}</p>
                  <ul className="space-y-3 mb-8 flex-1">
                    {plan.features.map(f => (
                      <li key={f} className="flex items-start gap-2.5 text-[0.82rem] font-light text-txt-mid leading-[1.6]">
                        <span className="w-1.5 h-1.5 bg-gold rounded-full mt-[7px] flex-shrink-0" />{f}
                      </li>
                    ))}
                  </ul>
                  <a href="#contact" className={`block text-center text-[0.7rem] font-semibold uppercase tracking-wider py-3.5 rounded-xl transition-all ${plan.pop ? "bg-gold text-bg hover:bg-gold-dim" : "border border-line text-txt-mid hover:border-line-gold hover:text-txt"}`}>{plan.cta}</a>
                </div>
              </SR>
            ))}
          </div>
          <SR delay={3}><p className="text-center text-[0.82rem] font-light text-txt-muted mt-10 max-w-[580px] mx-auto">Need ongoing maintenance? Monthly service & upkeep plans are available at a percentage-based fee — so your automations stay optimized as your business grows.</p></SR>
        </div>
      </section>

      {/* ═══ FOUNDER ═══ */}
      <section className="relative py-28 lg:py-40">
        <div className="max-w-[1200px] mx-auto px-6 lg:px-12 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-[340px_1fr] gap-12 lg:gap-20 items-start">
            <SR><div className="w-full max-w-[340px] aspect-[3/4] glass flex items-center justify-center overflow-hidden gradient-border" style={{background: 'linear-gradient(135deg, #1a1a1a 0%, #0f0f14 100%)'}}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/lp-logo.png" alt="LP monogram" className="w-52 h-52 object-contain" onError={(e) => { (e.target as HTMLImageElement).src = '/lp-logo.svg'; }} />
            </div></SR>
            <div>
              <SR><span className="pill pill-gold">The Founder</span></SR>
              <SR delay={1}><h2 className="font-serif text-[clamp(2rem,4.5vw,3.2rem)] font-normal leading-[1.1] text-txt mt-5 mb-6">Lagan Paroian.</h2></SR>
              <SR delay={2}>
                <p className="text-[1.02rem] font-light leading-relaxed text-txt-mid mb-4">Founder, systems architect, and operator building at the intersection of media, commerce, and intelligent automation. I started Loparo because I saw the same problem everywhere — founders with real momentum running on infrastructure that couldn&apos;t keep up.</p>
                <p className="text-[1.02rem] font-light leading-relaxed text-txt-mid">My background spans live events, brand development, and trading — each demanding the same discipline: build lean, execute fast, and design every system to scale before you need it to.</p>
              </SR>
              <SR delay={3}>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mt-10 pt-8 border-t border-line">
                  {[{ t: "Systems Over Hustle", d: "Sustainable growth comes from architecture, not effort alone." }, { t: "Operator Mindset", d: "Every build is treated like a business decision, not a design exercise." }, { t: "Leverage Through AI", d: "Intelligent automation is a multiplier, not a gimmick." }, { t: "Long-Term Thinking", d: "Infrastructure should still work in two years without being rebuilt." }].map(v => (
                    <div key={v.t} className="flex items-start gap-3"><span className="w-1.5 h-1.5 bg-gold rounded-full mt-2 flex-shrink-0" /><div><h4 className="font-serif text-[1.1rem] text-txt mb-1">{v.t}</h4><p className="text-[0.78rem] font-light text-txt-muted leading-[1.65]">{v.d}</p></div></div>
                  ))}
                </div>
              </SR>
              <SR delay={4}>
                <div className="flex gap-4 mt-8">
                  <a href="https://www.thesecondspliff.com" target="_blank" rel="noopener noreferrer" className="text-[0.7rem] uppercase tracking-wider gold-text pb-0.5 border-b border-gold/30 hover:border-gold transition-colors">The Second Spliff</a>
                </div>
              </SR>
            </div>
          </div>
        </div>
      </section>

      {/* ═══ CONTACT ═══ */}
      <section id="contact" className="relative py-28 lg:py-40">
        <div className="orb orb-gold w-[400px] h-[400px] left-1/4 bottom-0 opacity-30" />
        <div className="max-w-[1200px] mx-auto px-6 lg:px-12 relative z-10">
          <SR><span className="pill pill-gold">Get In Touch</span></SR>
          <SR delay={1}><h2 className="font-serif text-[clamp(2rem,4.5vw,3.2rem)] font-normal leading-[1.1] text-txt mt-5 mb-10">Let&apos;s Build Something.</h2></SR>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20">
            <SR delay={2}>
              <p className="text-sm font-light text-txt-mid leading-relaxed mb-8">If you&apos;re serious about building something scalable, let&apos;s architect it correctly from day one. Fill out the form and we&apos;ll respond within 24 hours.</p>
              <ul className="space-y-4">
                {["Based in Windsor, Ontario", "Serving founders globally", "Typical response: under 24 hours", "Projects start at strategic audit"].map(item => (
                  <li key={item} className="flex items-center gap-3 text-[0.85rem] text-txt-muted"><span className="w-1.5 h-1.5 bg-gold rounded-full flex-shrink-0" />{item}</li>
                ))}
              </ul>
              <div className="mt-8 pt-6 border-t border-line flex flex-col gap-2">
                <a href="mailto:loparoian@gmail.com" className="text-sm gold-text hover:opacity-70 transition-opacity">loparoian@gmail.com</a>
              </div>
            </SR>
            <SR delay={3}><div className="glass p-8 gradient-border"><ContactForm /></div></SR>
          </div>
        </div>
      </section>

      {/* ═══ FOOTER ═══ */}
      <footer className="border-t border-line px-6 lg:px-12 py-8 flex flex-col sm:flex-row justify-between items-center gap-4">
        <span className="font-serif text-lg text-txt">Loparo</span>
        <div className="flex items-center gap-6">
          <a href="mailto:loparoian@gmail.com" className="text-[0.7rem] uppercase tracking-wider text-txt-muted hover:text-txt transition-colors">loparoian@gmail.com</a>
          <span className="text-[0.7rem] uppercase tracking-wider text-txt-muted">© 2026 Loparo</span>
        </div>
        <span className="text-[0.65rem] uppercase tracking-wider text-txt-muted">Agentic Workflow Automation</span>
      </footer>
    </>
  );
}
