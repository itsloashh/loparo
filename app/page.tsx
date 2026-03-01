"use client";

import { useEffect, useState } from "react";

export default function Home() {
  const [activeModal, setActiveModal] = useState<string | null>(null);
  const [activeReservoir, setActiveReservoir] = useState<number | null>(null);
  const [emailForm, setEmailForm] = useState({ name: "", email: "", company: "", message: "", urgency: "normal" });
  const [emailSent, setEmailSent] = useState(false);

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

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setActiveModal(null);
        setActiveReservoir(null);
      }
    };
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, []);

  const handleEmailSubmit = async () => {
    if (!emailForm.email || !emailForm.name || !emailForm.message) return;
    await fetch("https://itsloashh.app.n8n.cloud/webhook/lead-capture", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: emailForm.name,
        email: emailForm.email,
        company: emailForm.company,
        message: emailForm.message,
        source: "website_form",
        priority: emailForm.urgency === "urgent" ? "high" : "normal",
      }),
    });
    setEmailSent(true);
    setTimeout(() => {
      setEmailSent(false);
      setActiveModal(null);
      setEmailForm({ name: "", email: "", company: "", message: "", urgency: "normal" });
    }, 3000);
  };

  const reservoirItems = [
    {
      icon: "⚡",
      title: "Lead Capture & AI Follow-up",
      desc: "Every lead gets a unique, AI-written email within seconds. CRM updates automatically. Your team gets notified instantly.",
      tags: ["n8n", "Claude AI", "Gmail", "Slack"],
      hasAI: true,
      detail: "When a lead submits a form on your website, this automation instantly captures their details, uses AI to draft a personalized follow-up email referencing their company and message, sends it from your real email address, logs the lead in your CRM, and pings your team on Slack — all within seconds.",
      useCase: "A marketing agency receives 20+ leads per week from their website. Before this automation, leads waited 4–12 hours for a response and 30% went cold. After deploying this workflow, every lead gets a personalized AI response in seconds, and the team closes 2–3 extra deals per month.",
    },
    {
      icon: "🔄",
      title: "CRM Sync & Data Pipeline",
      desc: "Connect forms, calendars, and lead sources to your CRM. Automatic contact creation, deal tracking, and zero manual data entry.",
      tags: ["HubSpot", "Sheets", "Pipedrive"],
      hasAI: false,
      detail: "This workflow connects all your lead sources — website forms, Cal.com bookings, LinkedIn messages, and email inquiries — into one unified CRM. Every new contact is automatically created, tagged by source, and added to the right pipeline stage.",
      useCase: "A real estate team manually entered leads from 4 different sources into Google Sheets every evening. This automation eliminated 2+ hours of daily data entry and ensured no lead was ever lost between platforms.",
    },
    {
      icon: "🔔",
      title: "Smart Notifications",
      desc: "Real-time Slack alerts with priority routing. Hot leads go to the right person. Nothing gets missed, even at 3am.",
      tags: ["Slack", "Email", "Webhooks"],
      hasAI: false,
      detail: "This system sends instant, formatted notifications to your team whenever a lead comes in, a deal moves stages, or a task needs attention. Priority routing ensures high-value leads get flagged separately for immediate follow-up.",
      useCase: "An e-commerce brand was losing high-value wholesale inquiries because they sat in a shared inbox overnight. With smart notifications, wholesale leads now trigger an urgent Slack alert to the sales lead within seconds, even on weekends.",
    },
    {
      icon: "🧠",
      title: "Custom AI Workflows",
      desc: "Content generation, lead scoring, data enrichment, and intelligent routing — your business logic, amplified by AI.",
      tags: ["Claude", "GPT", "Custom Logic"],
      hasAI: true,
      detail: "AI-powered workflows that go beyond simple automation. These systems use language models to score leads, generate content, enrich data, draft outreach, and make intelligent routing decisions based on your custom business rules.",
      useCase: "A SaaS startup needed to qualify 100+ trial signups weekly. This AI workflow automatically scores each signup based on company size, industry, and usage patterns, then routes high-potential accounts to the sales team with a personalized outreach draft ready to send.",
    },
  ];

  return (
    <>
      {/* NAVIGATION */}
      <nav>
        <a href="#" className="nav-logo" onClick={(e) => { e.preventDefault(); window.scrollTo({ top: 0, behavior: "smooth" }); }}>Loparo</a>
        <ul className="nav-links">
          <li><a href="#services">Reservoir</a></li>
          <li><a href="#work">Case Studies</a></li>
          <li><a href="#process">Process</a></li>
          <li><a href="#pricing">Pricing</a></li>
        </ul>
        <button className="nav-cta" onClick={() => setActiveModal("book")}>Book a Call</button>
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
              <span className="gradient-text">Agentic Powered Workflows</span>
            </h1>
            <p className="hero-desc">
              Intelligent automation systems that can help capture leads, follow up
              instantly with AI, sync your CRM, and keep your team in the loop — so
              you can focus on closing deals, not chasing them.
            </p>
            <div className="hero-buttons">
              <button className="btn-glow" onClick={() => setActiveModal("book")}>Start a Project</button>
              <a href="#work" className="btn-glass">View Case Studies</a>
            </div>
            <div className="hero-metrics">
              <div>
                <div className="hero-metric-value">~5s</div>
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
            </div>
          </div>
        </div>
      </section>

      {/* RESERVOIR */}
      <section id="services">
        <div className="container">
          <div className="section-label reveal">Reservoir</div>
          <h2 className="section-title reveal">
            Workflows that <span className="gradient-text">eliminate busywork</span>
          </h2>
          <p className="section-desc reveal">
            Custom automations tailored to your business. No bloat — just systems that work.
          </p>
          <div className="services-grid">
            {reservoirItems.map((s, i) => (
              <div key={i} className="service-card reveal" onClick={() => setActiveReservoir(i)} style={{ cursor: "pointer" }}>
                <div className="service-icon">{s.icon}</div>
                {s.hasAI && <span className="ai-badge">AI-Powered</span>}
                <h3>{s.title}</h3>
                <p>{s.desc}</p>
                <div className="service-tags">
                  {s.tags.map((t) => <span key={t}>{t}</span>)}
                </div>
                <span className="card-expand">Learn more →</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* RESERVOIR DETAIL MODAL */}
      {activeReservoir !== null && (
        <div className="modal-overlay" onClick={() => setActiveReservoir(null)}>
          <div className="modal-content reservoir-modal" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setActiveReservoir(null)}>✕</button>
            <div className="service-icon" style={{ marginBottom: 16 }}>{reservoirItems[activeReservoir].icon}</div>
            {reservoirItems[activeReservoir].hasAI && <span className="ai-badge" style={{ marginBottom: 12 }}>AI-Powered</span>}
            <h3 style={{ fontSize: 24, fontWeight: 600, marginBottom: 16, letterSpacing: "-0.5px" }}>
              {reservoirItems[activeReservoir].title}
            </h3>
            <div className="service-tags" style={{ marginBottom: 20 }}>
              {reservoirItems[activeReservoir].tags.map((t) => <span key={t}>{t}</span>)}
            </div>
            <h4 className="modal-section-title">How It Works</h4>
            <p className="modal-text">{reservoirItems[activeReservoir].detail}</p>
            <h4 className="modal-section-title" style={{ marginTop: 24 }}>Example Use Case</h4>
            <p className="modal-text">{reservoirItems[activeReservoir].useCase}</p>
            <div style={{ marginTop: 28, display: "flex", gap: 12 }}>
              <button className="btn-glow" style={{ fontSize: 13 }} onClick={() => { setActiveReservoir(null); setActiveModal("email"); }}>
                Inquire About This →
              </button>
              <button className="btn-glass" style={{ fontSize: 13 }} onClick={() => setActiveReservoir(null)}>Close</button>
            </div>
          </div>
        </div>
      )}

      {/* CASE STUDIES */}
      <section id="work">
        <div className="container">
          <div className="section-label reveal">Case Studies</div>
          <h2 className="section-title reveal">
            Automations running <span className="gradient-text">in production</span>
          </h2>
          <p className="section-desc reveal">
            Real workflows solving real problems for real businesses. Understand why it works.
          </p>
          <div className="cases-grid">
            {[
              {
                title: "LeadFlow Pipeline",
                desc: "End-to-end lead automation: AI-personalized follow-up emails, CRM sync, Slack notifications, and priority routing — all in approximately 5 seconds.",
                metrics: [
                  { value: "~5s", label: "Response" },
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
                <div className="case-status"><div className="dot" /> Live</div>
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
          <p className="section-desc reveal">Simple process. Fast delivery. Runs forever.</p>
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
          <p className="section-desc reveal">One-time setup. Runs forever. One closed deal pays for it.</p>
          <div className="pricing-grid">
            <div className="pricing-card reveal">
              <div className="pricing-tier">Starter</div>
              <div className="pricing-amount">$800 <span>one-time</span></div>
              <div className="pricing-desc">One pre-built workflow from the Reservoir — no AI automation included.</div>
              <ul className="pricing-list">
                <li>1 workflow from the Reservoir</li>
                <li>Standard automation (no AI)</li>
                <li>Testing &amp; deployment</li>
                <li>Setup walkthrough &amp; documentation</li>
                <li>7 days of support</li>
              </ul>
              <button className="pricing-btn outline" onClick={() => setActiveModal("email")}>Get Started</button>
            </div>
            <div className="pricing-card featured reveal">
              <div className="pricing-badge">Most Popular</div>
              <div className="pricing-tier">Growth</div>
              <div className="pricing-amount">$1,350 <span>one-time</span></div>
              <div className="pricing-desc">Any AI-powered workflow from the Reservoir — includes an AI agent and/or AI automation.</div>
              <ul className="pricing-list">
                <li>1 AI-powered workflow from the Reservoir</li>
                <li>AI agent &amp; automation included</li>
                <li>Example: auto lead gen with custom AI outreach</li>
                <li>Testing &amp; deployment</li>
                <li>Setup walkthrough &amp; documentation</li>
                <li>30 days of support</li>
              </ul>
              <button className="pricing-btn gradient" onClick={() => setActiveModal("email")}>Start a Project</button>
            </div>
            <div className="pricing-card reveal">
              <div className="pricing-tier">Scale</div>
              <div className="pricing-amount">Custom</div>
              <div className="pricing-desc">Project-specific builds priced by use case, complexity, hosting needs, and your requirements.</div>
              <ul className="pricing-list">
                <li>Custom-scoped workflows</li>
                <li>Tailored integrations</li>
                <li>Advanced AI logic</li>
                <li>Team onboarding</li>
                <li>Dedicated communication channel</li>
                <li>Ongoing support available</li>
              </ul>
              <button className="pricing-btn outline" onClick={() => setActiveModal("email")}>Let&apos;s Talk</button>
            </div>
          </div>
          <p className="pricing-note reveal">
            Need ongoing maintenance? Monthly service &amp; upkeep plans are available at a percentage-based fee — so your automations stay optimized as your business grows.
          </p>
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
              <button className="btn-glow" onClick={() => setActiveModal("book")}>Book a Call →</button>
              <button className="btn-glass" onClick={() => setActiveModal("email")}>Send an Email</button>
            </div>
            <a href="mailto:loparoian@gmail.com" className="cta-email reveal">loparoian@gmail.com</a>
            <div className="cta-socials reveal">
              <a href="#" target="_blank" rel="noopener noreferrer">LinkedIn</a>
            </div>
          </div>
        </div>
      </section>

      {/* BOOK A CALL MODAL */}
      {activeModal === "book" && (
        <div className="modal-overlay" onClick={() => setActiveModal(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setActiveModal(null)}>✕</button>
            <div className="section-label" style={{ marginBottom: 8 }}>Free Discovery Call</div>
            <h3 style={{ fontSize: 26, fontWeight: 600, marginBottom: 8, letterSpacing: "-0.5px" }}>
              15 Minutes That Could <span className="gradient-text">Change Your Workflow</span>
            </h3>
            <p className="modal-text" style={{ marginBottom: 24 }}>
              A focused conversation to understand your business, identify automation opportunities, and map out a plan. No pressure, no obligations.
            </p>
            <div className="book-features">
              <div className="book-feature">
                <span className="book-feature-icon">🎯</span>
                <div>
                  <strong>Workflow Audit</strong>
                  <p>We&apos;ll identify your biggest time sinks and where automation has the highest ROI.</p>
                </div>
              </div>
              <div className="book-feature">
                <span className="book-feature-icon">📋</span>
                <div>
                  <strong>Custom Blueprint</strong>
                  <p>You&apos;ll walk away with a clear picture of what your automation could look like.</p>
                </div>
              </div>
              <div className="book-feature">
                <span className="book-feature-icon">💰</span>
                <div>
                  <strong>Transparent Pricing</strong>
                  <p>Honest conversation about costs, timeline, and expected outcomes.</p>
                </div>
              </div>
              <div className="book-feature">
                <span className="book-feature-icon">🚀</span>
                <div>
                  <strong>Quick Start</strong>
                  <p>If we&apos;re a fit, most projects can begin within 48 hours of the call.</p>
                </div>
              </div>
            </div>
            <div style={{ display: "flex", gap: 12, marginTop: 28 }}>
              <button className="btn-glow" style={{ flex: 1, fontSize: 13 }} onClick={() => setActiveModal("email")}>
                Send an Email Instead →
              </button>
            </div>
            <p style={{ fontSize: 12, color: "var(--text-3)", marginTop: 12, textAlign: "center" }}>
              Booking link coming soon — email us in the meantime
            </p>
          </div>
        </div>
      )}

      {/* EMAIL MODAL */}
      {activeModal === "email" && (
        <div className="modal-overlay" onClick={() => setActiveModal(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setActiveModal(null)}>✕</button>
            {emailSent ? (
              <div className="email-success">
                <div style={{ fontSize: 48, marginBottom: 16 }}>✓</div>
                <h3 style={{ fontSize: 22, fontWeight: 600, marginBottom: 8 }}>Message Sent</h3>
                <p className="modal-text">We&apos;ll get back to you as soon as possible.</p>
              </div>
            ) : (
              <>
                <div className="section-label" style={{ marginBottom: 8 }}>Get in Touch</div>
                <h3 style={{ fontSize: 24, fontWeight: 600, marginBottom: 20, letterSpacing: "-0.5px" }}>
                  Send Us a <span className="gradient-text">Message</span>
                </h3>
                <div className="form-group">
                  <label>Name *</label>
                  <input type="text" placeholder="Your name" value={emailForm.name} onChange={(e) => setEmailForm({ ...emailForm, name: e.target.value })} />
                </div>
                <div className="form-group">
                  <label>Email *</label>
                  <input type="email" placeholder="your@email.com" value={emailForm.email} onChange={(e) => setEmailForm({ ...emailForm, email: e.target.value })} />
                </div>
                <div className="form-group">
                  <label>Company</label>
                  <input type="text" placeholder="Your company name" value={emailForm.company} onChange={(e) => setEmailForm({ ...emailForm, company: e.target.value })} />
                </div>
                <div className="form-group">
                  <label>Urgency</label>
                  <div className="urgency-select">
                    {["normal", "soon", "urgent"].map((u) => (
                      <button key={u} className={`urgency-btn ${emailForm.urgency === u ? "active" : ""} ${u === "urgent" ? "urgent" : ""}`} onClick={() => setEmailForm({ ...emailForm, urgency: u })}>
                        {u === "normal" ? "No Rush" : u === "soon" ? "This Week" : "🔥 ASAP"}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="form-group">
                  <label>Message *</label>
                  <textarea placeholder="Tell us about your project, goals, or questions..." rows={4} value={emailForm.message} onChange={(e) => setEmailForm({ ...emailForm, message: e.target.value })} />
                </div>
                <button className="btn-glow" style={{ width: "100%", marginTop: 8, fontSize: 14, opacity: emailForm.name && emailForm.email && emailForm.message ? 1 : 0.5 }} onClick={handleEmailSubmit} disabled={!emailForm.name || !emailForm.email || !emailForm.message}>
                  Send Message →
                </button>
              </>
            )}
          </div>
        </div>
      )}

      {/* FOOTER */}
      <footer>
        <span>&copy; 2026 <span className="footer-brand">Loparo</span>. All rights reserved.</span>
        <span style={{ color: "var(--text-4)" }}>Agentic Workflow Automation</span>
      </footer>
    </>
  );
}
