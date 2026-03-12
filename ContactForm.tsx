"use client";
import { useState } from "react";
const links = [{ href: "#services", label: "Reservoir" }, { href: "#work", label: "Case Studies" }, { href: "#process", label: "Process" }, { href: "#pricing", label: "Pricing" }];

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const close = () => { setOpen(false); document.body.style.overflow = ""; };
  const toggle = () => { const n = !open; setOpen(n); document.body.style.overflow = n ? "hidden" : ""; };

  return (
    <>
      <nav className="fixed top-4 left-4 right-4 z-[200] mx-auto max-w-[1200px] px-5 py-3 flex justify-between items-center bg-bg-nav backdrop-blur-2xl border border-line rounded-2xl">
        <a href="#" className="font-serif font-medium text-xl text-txt tracking-[0.04em]">Loparo</a>
        <div className="hidden md:flex items-center bg-bg-card/60 border border-line rounded-full p-1">
          {links.map(l => (
            <a key={l.href} href={l.href} className="text-[0.7rem] font-medium uppercase tracking-[0.1em] text-txt-muted hover:text-txt hover:bg-white/[0.04] px-4 py-1.5 rounded-full transition-all">{l.label}</a>
          ))}
        </div>
        <div className="flex items-center gap-3">
          <a href="#contact" className="hidden md:inline-block text-[0.7rem] font-semibold uppercase tracking-[0.08em] text-bg bg-gold hover:bg-gold-dim px-5 py-2 rounded-full transition-colors">Book a Call</a>
          <button onClick={toggle} className="flex md:hidden flex-col gap-[5px] w-8 h-8 items-center justify-center" aria-label="Menu">
            <span className={`block w-5 h-[1.5px] bg-txt transition-transform duration-300 ${open ? "translate-y-[6.5px] rotate-45" : ""}`} />
            <span className={`block w-5 h-[1.5px] bg-txt transition-opacity duration-300 ${open ? "opacity-0" : ""}`} />
            <span className={`block w-5 h-[1.5px] bg-txt transition-transform duration-300 ${open ? "-translate-y-[6.5px] -rotate-45" : ""}`} />
          </button>
        </div>
      </nav>
      <div className={`mob-menu ${open ? "open" : ""}`}>
        {links.map(l => <a key={l.href} href={l.href} onClick={close} className="text-lg text-txt">{l.label}</a>)}
        <a href="#contact" onClick={close} className="text-sm font-semibold uppercase tracking-wider text-bg bg-gold px-8 py-3 rounded-full mt-4">Book a Call</a>
      </div>
    </>
  );
}
