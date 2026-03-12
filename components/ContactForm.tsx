"use client";
import { useState, FormEvent } from "react";
const ic = "w-full bg-transparent border border-line rounded-xl px-4 py-3 text-sm text-txt placeholder:text-txt-muted/40 outline-none focus:border-line-gold transition-colors";

export default function ContactForm() {
  const [done, setDone] = useState(false);
  const [loading, setLoading] = useState(false);
  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault(); setLoading(true);
    const f = e.currentTarget;
    const data = { name: (f.elements.namedItem("name") as HTMLInputElement).value, email: (f.elements.namedItem("email") as HTMLInputElement).value, service: (f.elements.namedItem("service") as HTMLSelectElement).value, budget: (f.elements.namedItem("budget") as HTMLSelectElement).value, message: (f.elements.namedItem("message") as HTMLTextAreaElement).value, submitted: new Date().toISOString() };
    try { const url = process.env.NEXT_PUBLIC_WEBHOOK_URL; if (url) await fetch(url, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) }); } catch (err) { console.error(err); }
    setDone(true); setLoading(false);
  }
  if (done) return <div className="text-center py-12"><p className="font-serif text-2xl gold-text">Inquiry received.</p><p className="text-sm text-txt-muted mt-2">We&apos;ll be in touch within 24 hours.</p></div>;
  return (
    <form onSubmit={submit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div><label className="block text-[0.65rem] font-semibold uppercase tracking-[0.15em] text-txt-muted mb-2">Name</label><input type="text" name="name" required placeholder="Your full name" className={ic} /></div>
        <div><label className="block text-[0.65rem] font-semibold uppercase tracking-[0.15em] text-txt-muted mb-2">Email</label><input type="email" name="email" required placeholder="you@company.com" className={ic} /></div>
      </div>
      <div><label className="block text-[0.65rem] font-semibold uppercase tracking-[0.15em] text-txt-muted mb-2">Project Type</label><select name="service" className={`${ic} appearance-none`}><option value="">Select a service</option><option value="website">Conversion-Focused Website</option><option value="platform">Scalable Platform Build</option><option value="automation">Intelligent Automation</option><option value="audit">Strategic Audit</option><option value="other">Something Else</option></select></div>
      <div><label className="block text-[0.65rem] font-semibold uppercase tracking-[0.15em] text-txt-muted mb-2">Budget Range</label><select name="budget" className={`${ic} appearance-none`}><option value="">Select range</option><option value="2k-5k">$2,000 – $5,000</option><option value="5k-10k">$5,000 – $10,000</option><option value="10k-25k">$10,000 – $25,000</option><option value="25k+">$25,000+</option></select></div>
      <div><label className="block text-[0.65rem] font-semibold uppercase tracking-[0.15em] text-txt-muted mb-2">Project Details</label><textarea name="message" rows={4} placeholder="Tell us about your project..." className={`${ic} resize-none`} /></div>
      <button type="submit" disabled={loading} className="w-full bg-gold text-bg text-sm font-semibold uppercase tracking-wider py-4 rounded-xl hover:bg-gold-dim transition-colors disabled:opacity-50 cursor-pointer">{loading ? "Sending..." : "Submit Inquiry"}</button>
    </form>
  );
}
