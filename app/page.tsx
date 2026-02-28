"use client";

import { useEffect } from "react";

export default function Home() {
  useEffect(() => {
    const reveals = document.querySelectorAll(".reveal");
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry, i) => {
          if (entry.isIntersecting) {
            setTimeout(() => entry.target.classList.add("visible"), i * 60);
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.08 }
    );
    reveals.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  return (
    <>
      {/* NAVIGATION */}
      <nav>
        <a href="#" className="nav-logo">Loparo</a>
        <ul className="nav-links">
          <li><a href="#services">Services</a></li>
          <li><a href="#work">Case Studies</a></li>
          <li><a href="#process">Process</a></li>
          <li><a href="#pricing">Pricing</a></li>
        </ul>
        <a href="#contact" className="nav-cta">Book a Call</a>
      </nav>

      {/* HERO */}
      <section className="hero">
        <div className="orb orb-cyan orb-1" style={{ animation: "float 8s ease-in-out infinite" }} />
        <div className="orb orb-purple orb-2" style={{ animation: "float 10s ease-in-out infinite 2s" }} />
        <div className="hero-grid" />
        <div className="container">
          <div className="hero-content">
            <div className="hero-badge">
              <div className="dot" />
              <span>Available for new projects</span>
            </div>
            <h1>
              Automate your business with{" "}
              <span className="gradient-text">AI-powered workflows</span>
            </h1>
            <p className="hero-desc">
              I build intelligent automation systems that capture leads, follow up
              instantly with AI, sync your CRM, and keep your team in the loop — so
              you can focus on closing deals, not chasing them.
            </p>
            <div className="hero-buttons">
              <a href="#contact" className="btn-glow">Start a Project</a>
              <a href="#work" className="btn-glass">View Case Studies</a>
            </div>
            <div className="hero-metrics">
              <div>
                <div className="hero-metric-value">&lt;5s</div>
                <div className="hero-metric-label">Lead response time</div>
              </div>
              <div>
                <div className="hero-metric-value">100%</div>
                <div className="hero-metric-label">Automated follow-up</div>
              </div>
              <div>
                <div className="hero-metric-value">24/7</div>
                <div className="hero-metric-label">Always running</div>
              </div>
              <div>
                <div className="hero-metric-value">$0</div>
                <div className="hero-metric-label">Manual effort</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SERVICES */}
      <section id="services">
        <div className="container">
          <div className="section-label reveal">What I Build</div>
          <h2 className="section-title reveal">
            Workflows that <span className="gradient-text">eliminate busywork</span>
          </h2>
          <p className="section-desc reveal">
            Custom automations tailored to your business. No templates, no bloat —
            just systems that work.
          </p>
          <div className="services-grid">
            {[
              {
                icon: "⚡",
                title: "Lead Capture & AI Follow-up",
                desc: "Every lead gets a unique, AI-written email within seconds. CRM updates automatically. Your team gets notified instantly.",
                tags: ["n8n", "Claude AI", "Gmail", "Slack"],
              },
              {
                icon: "🔄",
                title: "CRM Sync & Data Pipeline",
                desc: "Connect forms, calendars, and lead sources to your CRM. Automatic contact creation, deal tracking, and zero manual data entry.",
                tags: ["HubSpot", "Sheets", "Pipedrive"],
              },
              {
                icon: "🔔",
                title: "Smart Notifications",
                desc: "Real-time Slack alerts with priority routing. Hot leads go to the right person. Nothing gets missed, even at 3am.",
                tags: ["Slack", "Email", "Webhooks"],
              },
              {
                icon: "🧠",
                title: "Custom AI Workflows",
                desc: "Content generation, lead scoring, data enrichment, and intelligent routing — your business logic, amplified by AI.",
                tags: ["Claude", "GPT", "Custom Logic"],
              },
            ].map((s, i) => (
              <div key={i} className="service-card reveal">
                <div className="service-icon">{s.icon}</div>
                <h3>{s.title}</h3>
                <p>{s.desc}</p>
                <div className="service-tags">
                  {s.tags.map((t) => (
                    <span key={t}>{t}</span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CASE STUDIES */}
      <section id="work">
        <div className="container">
          <div className="section-label reveal">Case Studies</div>
          <h2 className="section-title reveal">
            Automations running <span className="gradient-text">in production</span>
          </h2>
          <p className="section-desc reveal">
            Real workflows solving real problems for real businesses.
          </p>
          <div className="cases-grid">
            {[
              {
                title: "LeadFlow Pipeline",
                desc: "End-to-end lead automation: AI-personalized follow-up emails, CRM sync, Slack notifications, and priority routing — all in under 5 seconds.",
                metrics: [
                  { value: "<5s", label: "Response" },
                  { value: "6", label: "Integrations" },
                  { value: "100%", label: "Follow-up" },
                ],
              },
              {
                title: "Client Onboarding Engine",
                desc: "Automated intake creates project workspaces, sends welcome sequences, generates contracts, and assigns tasks to team members.",
                metrics: [
                  { value: "90%", label: "Time saved" },
                  { value: "8", label: "Auto steps" },
                  { value: "0", label: "Missed tasks" },
                ],
              },
            ].map((c, i) => (
              <div key={i} className="case-card reveal">
                <div className="case-status">
                  <div className="dot" /> Live
                </div>
                <h3>{c.title}</h3>
                <p>{c.desc}</p>
                <div className="case-metrics">
                  {c.metrics.map((m, j) => (
                    <div key={j}>
                      <div className="case-metric-value">{m.value}</div>
                      <div className="case-metric-label">{m.label}</div>
                    </div>
                  ))}
                </div>
                <a href="#" className="case-link">Read case study →</a>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* PROCESS */}
      <section id="process">
        <div className="container">
          <div className="section-label reveal">How It Works</div>
          <h2 className="section-title reveal">
            From call to <span className="gradient-text">running automation</span>
          </h2>
          <p className="section-desc reveal">
            Simple process. Fast delivery. Runs forever.
          </p>
          <div className="process-grid">
            {[
              { num: "01", title: "Discovery", desc: "15-min call to map your workflow, pain points, and goals." },
              { num: "02", title: "Blueprint", desc: "I design the automation flow and share a clear scope with you." },
              { num: "03", title: "Build & Test", desc: "I build, test every edge case, and make sure it's bulletproof." },
              { num: "04", title: "Deploy", desc: "We go live together. Your automation runs on autopilot." },
            ].map((p, i) => (
              <div key={i} className="process-card reveal">
                <div className="process-num">{p.num}</div>
                <h4>{p.title}</h4>
                <p>{p.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* PRICING */}
      <section id="pricing">
        <div className="container">
          <div className="section-label reveal">Investment</div>
          <h2 className="section-title reveal">
            Simple pricing. <span className="gradient-text">Obvious ROI.</span>
          </h2>
          <p className="section-desc reveal">
            One-time setup. Runs forever. One closed deal pays for it.
          </p>
          <div className="pricing-grid">
            <div className="pricing-card reveal">
              <div className="pricing-tier">Starter</div>
              <div className="pricing-amount">$400 <span>one-time</span></div>
              <div className="pricing-desc">One automation that solves your biggest bottleneck.</div>
              <ul className="pricing-list">
                <li>1 workflow automation</li>
                <li>Up to 4 integrations</li>
                <li>Testing &amp; deployment</li>
                <li>Setup documentation</li>
                <li>7 days of support</li>
              </ul>
              <a href="#contact" className="pricing-btn outline">Get Started</a>
            </div>

            <div className="pricing-card featured reveal">
              <div className="pricing-badge">Most Popular</div>
              <div className="pricing-tier">Growth</div>
              <div className="pricing-amount">$800 <span>one-time</span></div>
              <div className="pricing-desc">Full lead pipeline with AI follow-up and CRM sync.</div>
              <ul className="pricing-list">
                <li>Up to 3 connected workflows</li>
                <li>AI-powered email drafting</li>
                <li>CRM + Slack + Email setup</li>
                <li>Priority routing logic</li>
                <li>Custom dashboard</li>
                <li>30 days of support</li>
              </ul>
              <a href="#contact" className="pricing-btn gradient">Start a Project</a>
            </div>

            <div className="pricing-card reveal">
              <div className="pricing-tier">Scale</div>
              <div className="pricing-amount">Custom</div>
              <div className="pricing-desc">Enterprise-grade systems built to your exact spec.</div>
              <ul className="pricing-list">
                <li>Unlimited workflows</li>
                <li>Custom integrations</li>
                <li>Advanced AI logic</li>
                <li>Team onboarding</li>
                <li>Dedicated Slack channel</li>
                <li>Ongoing maintenance</li>
              </ul>
              <a href="#contact" className="pricing-btn outline">Let&apos;s Talk</a>
            </div>
          </div>
        </div>
      </section>

      {/* CONTACT */}
      <section id="contact">
        <div className="orb orb-cyan orb-1" style={{ animation: "float 8s ease-in-out infinite" }} />
        <div className="container">
          <div className="cta-inner">
            <div className="section-label reveal">Let&apos;s Build</div>
            <h2 className="section-title reveal" style={{ textAlign: "center" }}>
              Ready to stop losing <span className="gradient-text">leads?</span>
            </h2>
            <p className="cta-desc reveal">
              Book a free 15-minute discovery call. I&apos;ll show you exactly how
              automation can eliminate your busywork and close more deals.
            </p>
            <div className="cta-buttons reveal">
              <a href="mailto:loparoian@gmail.com" className="btn-glow">Book a Call →</a>
              <a href="mailto:loparoian@gmail.com" className="btn-glass">Send an Email</a>
            </div>
            <a href="mailto:loparoian@gmail.com" className="cta-email reveal">
              loparoian@gmail.com
            </a>
            <div className="cta-socials reveal">
              <a href="#">LinkedIn</a>
              <a href="#">Twitter / X</a>
              <a href="#">GitHub</a>
            </div>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer>
        <span>
          &copy; 2026 <span className="footer-brand">Loparo</span>. All rights reserved.
        </span>
        <span style={{ color: "var(--text-4)" }}>AI-Powered Automation Studio</span>
      </footer>
    </>
  );
}
