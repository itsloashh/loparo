import Navbar from "@/components/Navbar";
import ScrollReveal from "@/components/ScrollReveal";
import PortfolioSection from "@/components/PortfolioSection";
import ContactForm from "@/components/ContactForm";

export default function Home() {
  return (
    <>
      <Navbar />

      {/* ═══ HERO ═══ */}
      <section className="pt-40 lg:pt-48 pb-24 lg:pb-36 border-b border-border dark:border-border-dark relative">
        <div className="max-w-[1140px] mx-auto px-6 lg:px-12">
          {/* Accent glow */}
          <div className="absolute top-32 right-12 w-60 h-60 rounded-full bg-[radial-gradient(circle,rgba(0,96,57,0.07)_0%,transparent_70%)] dark:bg-[radial-gradient(circle,rgba(0,168,107,0.06)_0%,transparent_70%)] pointer-events-none" />

          <p className="hero-reveal text-[0.68rem] font-medium uppercase tracking-[0.2em] text-gold dark:text-gold-bright mb-4 flex items-center gap-3">
            <span className="w-2 h-2 rounded-full bg-green dark:bg-green-bright animate-pulse" />
            Available for new projects
          </p>

          <h1 className="hero-reveal hero-reveal-d1 font-serif font-light text-[clamp(3rem,6.5vw,5.2rem)] leading-[1.05] tracking-tight max-w-[800px] mb-8 text-txt dark:text-txt-dark">
            Automate your business with{" "}
            <em className="italic font-light text-green dark:text-green-bright">
              Agentic Powered Workflows
            </em>
          </h1>

          <p className="hero-reveal hero-reveal-d2 text-[1.1rem] font-light leading-[1.85] text-txt-mid dark:text-txt-dark-mid max-w-[580px] mb-10">
            Intelligent automation systems that can help capture leads, follow up instantly with AI, sync your CRM, and keep your team in the loop — so you can focus on closing deals, not chasing them.
          </p>

          <div className="hero-reveal hero-reveal-d3 flex gap-4 items-center flex-wrap">
            <a href="#contact" className="inline-block bg-green dark:bg-green-bright text-white text-[0.78rem] font-medium uppercase tracking-[0.12em] px-8 py-4 no-underline hover:opacity-[0.88] transition-opacity">
              Start a Project
            </a>
            <a href="#work" className="inline-block text-txt-mid dark:text-txt-dark-mid text-[0.78rem] font-normal uppercase tracking-[0.12em] px-8 py-4 no-underline border border-border dark:border-border-dark hover:border-txt-muted dark:hover:border-txt-dark-muted hover:text-txt dark:hover:text-txt-dark transition-colors">
              View Case Studies
            </a>
          </div>

          {/* Stats */}
          <div className="hero-reveal hero-reveal-d3 flex gap-12 mt-16 pt-8 border-t border-border dark:border-border-dark flex-wrap">
            {[
              { value: "~5s", label: "Lead response time" },
              { value: "100%", label: "Automated follow-up" },
              { value: "24/7", label: "Always running" },
            ].map((s) => (
              <div key={s.label}>
                <p className="font-serif text-3xl font-light text-green dark:text-green-bright">{s.value}</p>
                <p className="text-[0.75rem] uppercase tracking-[0.1em] text-txt-muted dark:text-txt-dark-muted mt-1">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ RESERVOIR / SERVICES ═══ */}
      <section id="services" className="py-24 lg:py-36 border-b border-border dark:border-border-dark">
        <div className="max-w-[1140px] mx-auto px-6 lg:px-12">
          <ScrollReveal>
            <p className="text-[0.68rem] font-medium uppercase tracking-[0.2em] text-gold dark:text-gold-bright mb-6">Reservoir</p>
          </ScrollReveal>
          <ScrollReveal delay={1}>
            <h2 className="font-serif text-[clamp(2.2rem,4.5vw,3.4rem)] font-normal leading-[1.12] tracking-tight text-txt dark:text-txt-dark mb-4">
              Workflows that eliminate busywork.
            </h2>
          </ScrollReveal>
          <ScrollReveal delay={2}>
            <p className="text-[1rem] font-light text-txt-muted dark:text-txt-dark-muted max-w-[540px] mb-12">
              Custom automations tailored to your business. No bloat — just systems that work.
            </p>
          </ScrollReveal>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-px bg-border dark:bg-border-dark">
            {[
              {
                icon: "⚡",
                ai: true,
                title: "Lead Capture & AI Follow-up",
                desc: "Every lead gets a unique, AI-written email within seconds. CRM updates automatically. Your team gets notified instantly.",
                tags: ["n8n", "Claude AI", "Gmail", "Slack"],
              },
              {
                icon: "🔄",
                ai: false,
                title: "CRM Sync & Data Pipeline",
                desc: "Connect forms, calendars, and lead sources to your CRM. Automatic contact creation, deal tracking, and zero manual data entry.",
                tags: ["HubSpot", "Sheets", "Pipedrive"],
              },
              {
                icon: "🔔",
                ai: false,
                title: "Smart Notifications",
                desc: "Real-time Slack alerts with priority routing. Hot leads go to the right person. Nothing gets missed, even at 3am.",
                tags: ["Slack", "Email", "Webhooks"],
              },
              {
                icon: "🧠",
                ai: true,
                title: "Custom AI Workflows",
                desc: "Content generation, lead scoring, data enrichment, and intelligent routing — your business logic, amplified by AI.",
                tags: ["Claude", "GPT", "Custom Logic"],
              },
            ].map((item, i) => (
              <ScrollReveal key={item.title} delay={i < 2 ? 2 : 3}>
                <div className="bg-white dark:bg-bg-dark p-8 lg:p-10 group hover:bg-green-light dark:hover:bg-green-bright-light transition-colors">
                  <div className="flex items-center gap-3 mb-5">
                    <span className="text-xl">{item.icon}</span>
                    {item.ai && (
                      <span className="text-[0.6rem] font-medium uppercase tracking-[0.15em] text-green dark:text-green-bright border border-green/20 dark:border-green-bright/20 px-2 py-0.5">
                        AI-Powered
                      </span>
                    )}
                  </div>
                  <h3 className="font-serif text-[1.4rem] font-normal text-txt dark:text-txt-dark mb-3">{item.title}</h3>
                  <p className="text-[0.88rem] font-light text-txt-muted dark:text-txt-dark-muted leading-[1.7] mb-5">{item.desc}</p>
                  <div className="flex gap-2 flex-wrap">
                    {item.tags.map((t) => (
                      <span key={t} className="text-[0.62rem] uppercase tracking-[0.1em] text-txt-muted dark:text-txt-dark-muted border border-border dark:border-border-dark px-2 py-1">
                        {t}
                      </span>
                    ))}
                  </div>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ CASE STUDIES ═══ */}
      <PortfolioSection />

      {/* ═══ PROCESS ═══ */}
      <section id="process" className="py-24 lg:py-36 border-b border-border dark:border-border-dark">
        <div className="max-w-[1140px] mx-auto px-6 lg:px-12">
          <ScrollReveal>
            <p className="text-[0.68rem] font-medium uppercase tracking-[0.2em] text-gold dark:text-gold-bright mb-6">How It Works</p>
          </ScrollReveal>
          <ScrollReveal delay={1}>
            <h2 className="font-serif text-[clamp(2.2rem,4.5vw,3.4rem)] font-normal leading-[1.12] tracking-tight text-txt dark:text-txt-dark">
              From call to running automation.
            </h2>
          </ScrollReveal>

          <div className="mt-12 space-y-0">
            {[
              { num: "01", title: "Discovery", desc: "15-min call to map your workflow, pain points, and goals." },
              { num: "02", title: "Blueprint", desc: "I design the automation flow and share a clear scope with you." },
              { num: "03", title: "Build & Test", desc: "I build, test every edge case, and make sure it's bulletproof." },
              { num: "04", title: "Deploy", desc: "We go live together. Your automation runs on autopilot." },
            ].map((step, i) => (
              <ScrollReveal key={step.num} delay={i < 2 ? 2 : 3}>
                <div className={`grid grid-cols-[80px_1fr] lg:grid-cols-[120px_1fr] gap-6 lg:gap-12 py-8 border-b border-border dark:border-border-dark hover:bg-green-light dark:hover:bg-green-bright-light hover:-mx-6 hover:px-6 lg:hover:-mx-12 lg:hover:px-12 transition-all ${i === 0 ? "border-t" : ""}`}>
                  <p className="font-serif text-[2.8rem] lg:text-[3.2rem] font-light text-gold/60 dark:text-gold-bright/60 leading-none">{step.num}</p>
                  <div>
                    <h3 className="font-serif text-[1.4rem] font-normal text-txt dark:text-txt-dark mb-2">{step.title}</h3>
                    <p className="text-[0.92rem] font-light text-txt-muted dark:text-txt-dark-muted leading-[1.75] max-w-[480px]">{step.desc}</p>
                  </div>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ PRICING ═══ */}
      <section id="pricing" className="py-24 lg:py-36 bg-bg-warm dark:bg-bg-dark-warm border-b border-border dark:border-border-dark">
        <div className="max-w-[1140px] mx-auto px-6 lg:px-12">
          <ScrollReveal>
            <p className="text-[0.68rem] font-medium uppercase tracking-[0.2em] text-gold dark:text-gold-bright mb-6">Investment</p>
          </ScrollReveal>
          <ScrollReveal delay={1}>
            <h2 className="font-serif text-[clamp(2.2rem,4.5vw,3.4rem)] font-normal leading-[1.12] tracking-tight text-txt dark:text-txt-dark mb-3">
              Simple pricing. Obvious ROI.
            </h2>
          </ScrollReveal>
          <ScrollReveal delay={2}>
            <p className="text-[1rem] font-light text-txt-muted dark:text-txt-dark-muted max-w-[500px] mb-14">
              One-time setup. Runs forever. One closed deal pays for it.
            </p>
          </ScrollReveal>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-px bg-border dark:bg-border-dark">
            {[
              {
                name: "Starter",
                price: "$800",
                sub: "one-time",
                desc: "One pre-built workflow from the Reservoir — no AI automation included.",
                features: [
                  "1 workflow from the Reservoir",
                  "Standard automation (no AI)",
                  "Testing & deployment",
                  "Setup walkthrough & documentation",
                  "7 days of support",
                ],
                cta: "Get Started",
                popular: false,
              },
              {
                name: "Growth",
                price: "$1,350",
                sub: "one-time",
                desc: "Any AI-powered workflow from the Reservoir — includes an AI agent and/or AI automation.",
                features: [
                  "1 AI-powered workflow from the Reservoir",
                  "AI agent & automation included",
                  "Example: auto lead gen with custom AI outreach",
                  "Testing & deployment",
                  "Setup walkthrough & documentation",
                  "30 days of support",
                ],
                cta: "Start a Project",
                popular: true,
              },
              {
                name: "Scale",
                price: "Custom",
                sub: "",
                desc: "Project-specific builds priced by use case, complexity, hosting needs, and your requirements.",
                features: [
                  "Custom-scoped workflows",
                  "Tailored integrations",
                  "Advanced AI logic",
                  "Team onboarding",
                  "Dedicated communication channel",
                  "Ongoing support available",
                ],
                cta: "Let's Talk",
                popular: false,
              },
            ].map((plan) => (
              <ScrollReveal key={plan.name} delay={plan.popular ? 2 : 3}>
                <div className={`bg-white dark:bg-bg-dark p-8 lg:p-10 h-full flex flex-col ${plan.popular ? "ring-1 ring-green dark:ring-green-bright" : ""}`}>
                  {plan.popular && (
                    <span className="text-[0.6rem] font-medium uppercase tracking-[0.15em] text-green dark:text-green-bright mb-4 self-start border border-green/20 dark:border-green-bright/20 px-2.5 py-1">
                      Most Popular
                    </span>
                  )}
                  <h3 className="font-serif text-[1.6rem] font-normal text-txt dark:text-txt-dark">{plan.name}</h3>
                  <div className="mt-3 mb-4">
                    <span className="font-serif text-[2.4rem] font-light text-txt dark:text-txt-dark">{plan.price}</span>
                    {plan.sub && <span className="text-[0.82rem] text-txt-muted dark:text-txt-dark-muted ml-2">{plan.sub}</span>}
                  </div>
                  <p className="text-[0.85rem] font-light text-txt-muted dark:text-txt-dark-muted leading-[1.7] mb-6">{plan.desc}</p>
                  <ul className="space-y-3 mb-8 flex-1">
                    {plan.features.map((f) => (
                      <li key={f} className="flex items-start gap-2.5 text-[0.85rem] font-light text-txt-mid dark:text-txt-dark-mid leading-[1.6]">
                        <span className="w-1.5 h-1.5 bg-green dark:bg-green-bright rounded-full mt-2 flex-shrink-0" />
                        {f}
                      </li>
                    ))}
                  </ul>
                  <a
                    href="#contact"
                    className={`block text-center text-[0.75rem] font-medium uppercase tracking-[0.12em] py-3.5 no-underline transition-all ${
                      plan.popular
                        ? "bg-green dark:bg-green-bright text-white hover:opacity-[0.88]"
                        : "border border-border dark:border-border-dark text-txt-mid dark:text-txt-dark-mid hover:border-txt-muted dark:hover:border-txt-dark-muted hover:text-txt dark:hover:text-txt-dark"
                    }`}
                  >
                    {plan.cta}
                  </a>
                </div>
              </ScrollReveal>
            ))}
          </div>

          <ScrollReveal delay={3}>
            <p className="text-center text-[0.85rem] font-light text-txt-muted dark:text-txt-dark-muted mt-10 max-w-[600px] mx-auto">
              Need ongoing maintenance? Monthly service & upkeep plans are available at a percentage-based fee — so your automations stay optimized as your business grows.
            </p>
          </ScrollReveal>
        </div>
      </section>

      {/* ═══ VISIONARY / FOUNDER ═══ */}
      <section id="about" className="py-24 lg:py-36 border-b border-border dark:border-border-dark">
        <div className="max-w-[1140px] mx-auto px-6 lg:px-12">
          <div className="grid grid-cols-1 lg:grid-cols-[340px_1fr] gap-12 lg:gap-20 items-start">
            {/* Photo placeholder */}
            <ScrollReveal>
              <div className="w-full max-w-[340px] aspect-[3/4] bg-bg-warm dark:bg-bg-dark-warm border border-border dark:border-border-dark relative flex items-end justify-center overflow-hidden">
                <p className="font-serif italic text-[0.85rem] text-txt-muted dark:text-txt-dark-muted p-6 text-center">Your photo here</p>
                <div className="absolute inset-0 border border-gold/10 dark:border-gold-bright/10 pointer-events-none" />
              </div>
            </ScrollReveal>

            <div>
              <ScrollReveal>
                <p className="text-[0.68rem] font-medium uppercase tracking-[0.2em] text-gold dark:text-gold-bright mb-5">The Founder</p>
              </ScrollReveal>
              <ScrollReveal delay={1}>
                <h2 className="font-serif text-[clamp(2.2rem,4.5vw,3.4rem)] font-normal leading-[1.12] tracking-tight text-txt dark:text-txt-dark mb-6">
                  Lo Paroian.
                </h2>
              </ScrollReveal>
              <ScrollReveal delay={2}>
                <p className="text-[1.1rem] font-light leading-[1.85] text-txt-mid dark:text-txt-dark-mid mb-4">
                  Founder, systems architect, and operator building at the intersection of media, commerce, and intelligent automation. I started Loparo because I saw the same problem everywhere — founders with real momentum running on infrastructure that couldn&apos;t keep up.
                </p>
                <p className="text-[1.1rem] font-light leading-[1.85] text-txt-mid dark:text-txt-dark-mid">
                  My background spans live events, brand development, and trading — each demanding the same discipline: build lean, execute fast, and design every system to scale before you need it to. That&apos;s the philosophy behind every project we take on.
                </p>
              </ScrollReveal>

              <ScrollReveal delay={3}>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mt-10 pt-8 border-t border-border dark:border-border-dark">
                  {[
                    { title: "Systems Over Hustle", desc: "Sustainable growth comes from architecture, not effort alone." },
                    { title: "Operator Mindset", desc: "Every build is treated like a business decision, not a design exercise." },
                    { title: "Leverage Through AI", desc: "Intelligent automation is a multiplier, not a gimmick." },
                    { title: "Long-Term Thinking", desc: "Infrastructure should still work in two years without being rebuilt." },
                  ].map((v) => (
                    <div key={v.title} className="flex items-start gap-3">
                      <span className="w-2 h-2 bg-green dark:bg-green-bright flex-shrink-0 mt-1.5" />
                      <div>
                        <h4 className="font-serif text-[1.15rem] font-normal text-txt dark:text-txt-dark mb-1">{v.title}</h4>
                        <p className="text-[0.82rem] font-light text-txt-muted dark:text-txt-dark-muted leading-[1.65]">{v.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollReveal>

              <ScrollReveal delay={4}>
                <div className="flex gap-6 mt-8">
                  <a href="https://thesecondspliff.com" target="_blank" rel="noopener noreferrer" className="text-[0.72rem] uppercase tracking-[0.12em] text-green dark:text-green-bright no-underline pb-0.5 border-b border-green dark:border-green-bright hover:opacity-70 transition-opacity">
                    The Second Spliff
                  </a>
                  <a href="https://loparo.ca" target="_blank" rel="noopener noreferrer" className="text-[0.72rem] uppercase tracking-[0.12em] text-green dark:text-green-bright no-underline pb-0.5 border-b border-green dark:border-green-bright hover:opacity-70 transition-opacity">
                    Loparo.ca
                  </a>
                </div>
              </ScrollReveal>
            </div>
          </div>
        </div>
      </section>

      {/* ═══ CONTACT ═══ */}
      <section id="contact" className="py-24 lg:py-36 border-b border-border dark:border-border-dark">
        <div className="max-w-[1140px] mx-auto px-6 lg:px-12">
          <ScrollReveal>
            <p className="text-[0.68rem] font-medium uppercase tracking-[0.2em] text-gold dark:text-gold-bright mb-6">Get In Touch</p>
          </ScrollReveal>
          <ScrollReveal delay={1}>
            <h2 className="font-serif text-[clamp(2.2rem,4.5vw,3.4rem)] font-normal leading-[1.12] tracking-tight text-txt dark:text-txt-dark mb-10">
              Let&apos;s Build Something.
            </h2>
          </ScrollReveal>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20">
            <ScrollReveal delay={2}>
              <p className="text-[1rem] font-light text-txt-mid dark:text-txt-dark-mid leading-[1.8] mb-8">
                If you&apos;re serious about building something scalable, let&apos;s architect it correctly from day one. Fill out the form and we&apos;ll respond within 24 hours.
              </p>
              <ul className="space-y-4">
                {[
                  "Based in Windsor, Ontario",
                  "Serving founders globally",
                  "Typical response: under 24 hours",
                  "Projects start at strategic audit",
                ].map((item) => (
                  <li key={item} className="flex items-center gap-3 text-[0.88rem] text-txt-muted dark:text-txt-dark-muted">
                    <span className="w-1.5 h-1.5 bg-green dark:bg-green-bright flex-shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
              <div className="mt-8 pt-6 border-t border-border dark:border-border-dark">
                <a href="mailto:loparoian@gmail.com" className="text-[0.82rem] text-green dark:text-green-bright no-underline hover:opacity-70 transition-opacity">
                  loparoian@gmail.com
                </a>
              </div>
            </ScrollReveal>

            <ScrollReveal delay={3}>
              <ContactForm />
            </ScrollReveal>
          </div>
        </div>
      </section>

      {/* ═══ CLOSE CTA ═══ */}
      <section className="py-24 lg:py-36 text-center relative overflow-hidden border-b border-border dark:border-border-dark">
        <div className="max-w-[1140px] mx-auto px-6 lg:px-12 relative z-10">
          <ScrollReveal>
            <p className="text-[0.68rem] font-medium uppercase tracking-[0.2em] text-gold dark:text-gold-bright mb-6">Let&apos;s Build</p>
          </ScrollReveal>
          <ScrollReveal delay={1}>
            <h2 className="font-serif text-[clamp(2.2rem,4.5vw,3.4rem)] font-normal leading-[1.12] tracking-tight text-txt dark:text-txt-dark max-w-[550px] mx-auto mb-4">
              Ready to stop losing leads?
            </h2>
          </ScrollReveal>
          <ScrollReveal delay={2}>
            <p className="text-[0.95rem] font-light text-txt-muted dark:text-txt-dark-muted max-w-[500px] mx-auto mb-10">
              Book a free 15-minute discovery call. I&apos;ll show you exactly how automation can eliminate your busywork and close more deals.
            </p>
          </ScrollReveal>
          <ScrollReveal delay={3}>
            <div className="flex gap-4 justify-center flex-wrap">
              <a href="#contact" className="inline-block bg-green dark:bg-green-bright text-white text-[0.78rem] font-medium uppercase tracking-[0.12em] px-8 py-4 no-underline hover:opacity-[0.88] transition-opacity">
                Book a Call →
              </a>
              <a href="mailto:loparoian@gmail.com" className="inline-block text-txt-mid dark:text-txt-dark-mid text-[0.78rem] font-normal uppercase tracking-[0.12em] px-8 py-4 no-underline border border-border dark:border-border-dark hover:border-txt-muted dark:hover:border-txt-dark-muted hover:text-txt dark:hover:text-txt-dark transition-colors">
                Send an Email
              </a>
            </div>
          </ScrollReveal>
        </div>
        <div className="absolute bottom-[-80px] left-1/2 -translate-x-1/2 w-[500px] h-[500px] rounded-full bg-[radial-gradient(circle,rgba(0,96,57,0.07)_0%,transparent_60%)] dark:bg-[radial-gradient(circle,rgba(0,168,107,0.06)_0%,transparent_60%)] pointer-events-none" />
      </section>

      {/* ═══ FOOTER ═══ */}
      <footer className="border-t border-border dark:border-border-dark px-6 lg:px-12 py-8 flex flex-col sm:flex-row justify-between items-center gap-4">
        <span className="font-serif text-[1.1rem] font-normal text-txt dark:text-txt-dark">Loparo</span>
        <div className="flex items-center gap-6">
          <a href="mailto:loparoian@gmail.com" className="text-[0.72rem] uppercase tracking-[0.12em] text-txt-muted dark:text-txt-dark-muted no-underline hover:text-txt dark:hover:text-txt-dark transition-colors">
            loparoian@gmail.com
          </a>
          <span className="text-[0.72rem] uppercase tracking-[0.12em] text-txt-muted dark:text-txt-dark-muted">
            © 2026 Loparo
          </span>
        </div>
      </footer>
    </>
  );
}
