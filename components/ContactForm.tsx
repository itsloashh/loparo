"use client";

import { useState, FormEvent } from "react";

export default function ContactForm() {
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    const form = e.currentTarget;
    const data = {
      name: (form.elements.namedItem("name") as HTMLInputElement).value,
      email: (form.elements.namedItem("email") as HTMLInputElement).value,
      service: (form.elements.namedItem("service") as HTMLSelectElement).value,
      budget: (form.elements.namedItem("budget") as HTMLSelectElement).value,
      message: (form.elements.namedItem("message") as HTMLTextAreaElement).value,
      submitted: new Date().toISOString(),
    };

    try {
      const webhookUrl = process.env.NEXT_PUBLIC_WEBHOOK_URL;
      if (webhookUrl) {
        await fetch(webhookUrl, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        });
      }
    } catch (err) {
      console.error("Webhook error:", err);
    }

    setSubmitted(true);
    setLoading(false);
  }

  if (submitted) {
    return (
      <div className="text-center py-12">
        <p className="font-serif text-2xl text-green dark:text-green-bright">Inquiry received.</p>
        <p className="text-[0.92rem] text-txt-muted dark:text-txt-dark-muted mt-2">We&apos;ll be in touch within 24 hours.</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div>
          <label className="block text-[0.7rem] font-medium uppercase tracking-[0.15em] text-txt-muted dark:text-txt-dark-muted mb-2">Name</label>
          <input
            type="text" name="name" required placeholder="Your full name"
            className="w-full bg-transparent border border-border dark:border-border-dark px-4 py-3 text-[0.92rem] text-txt dark:text-txt-dark placeholder:text-txt-muted/50 dark:placeholder:text-txt-dark-muted/50 outline-none focus:border-green dark:focus:border-green-bright transition-colors"
          />
        </div>
        <div>
          <label className="block text-[0.7rem] font-medium uppercase tracking-[0.15em] text-txt-muted dark:text-txt-dark-muted mb-2">Email</label>
          <input
            type="email" name="email" required placeholder="you@company.com"
            className="w-full bg-transparent border border-border dark:border-border-dark px-4 py-3 text-[0.92rem] text-txt dark:text-txt-dark placeholder:text-txt-muted/50 dark:placeholder:text-txt-dark-muted/50 outline-none focus:border-green dark:focus:border-green-bright transition-colors"
          />
        </div>
      </div>
      <div>
        <label className="block text-[0.7rem] font-medium uppercase tracking-[0.15em] text-txt-muted dark:text-txt-dark-muted mb-2">Project Type</label>
        <select
          name="service"
          className="w-full bg-transparent border border-border dark:border-border-dark px-4 py-3 text-[0.92rem] text-txt dark:text-txt-dark outline-none focus:border-green dark:focus:border-green-bright transition-colors appearance-none"
        >
          <option value="">Select a service</option>
          <option value="website">Conversion-Focused Website</option>
          <option value="platform">Scalable Platform Build</option>
          <option value="automation">Intelligent Automation</option>
          <option value="audit">Strategic Audit</option>
          <option value="other">Something Else</option>
        </select>
      </div>
      <div>
        <label className="block text-[0.7rem] font-medium uppercase tracking-[0.15em] text-txt-muted dark:text-txt-dark-muted mb-2">Budget Range</label>
        <select
          name="budget"
          className="w-full bg-transparent border border-border dark:border-border-dark px-4 py-3 text-[0.92rem] text-txt dark:text-txt-dark outline-none focus:border-green dark:focus:border-green-bright transition-colors appearance-none"
        >
          <option value="">Select range</option>
          <option value="2k-5k">$2,000 – $5,000</option>
          <option value="5k-10k">$5,000 – $10,000</option>
          <option value="10k-25k">$10,000 – $25,000</option>
          <option value="25k+">$25,000+</option>
        </select>
      </div>
      <div>
        <label className="block text-[0.7rem] font-medium uppercase tracking-[0.15em] text-txt-muted dark:text-txt-dark-muted mb-2">Project Details</label>
        <textarea
          name="message" rows={4}
          placeholder="Tell us about your project, current infrastructure, and what you're looking to build..."
          className="w-full bg-transparent border border-border dark:border-border-dark px-4 py-3 text-[0.92rem] text-txt dark:text-txt-dark placeholder:text-txt-muted/50 dark:placeholder:text-txt-dark-muted/50 outline-none focus:border-green dark:focus:border-green-bright transition-colors resize-none"
        />
      </div>
      <button
        type="submit"
        disabled={loading}
        className="w-full bg-green dark:bg-green-bright text-white text-[0.78rem] font-medium uppercase tracking-[0.12em] py-4 border-none cursor-pointer hover:opacity-[0.88] transition-opacity disabled:opacity-50"
      >
        {loading ? "Sending..." : "Submit Inquiry"}
      </button>
    </form>
  );
}
