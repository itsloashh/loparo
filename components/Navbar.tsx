"use client";

import { useState } from "react";
import ThemeToggle from "./ThemeToggle";

const links = [
  { href: "#services", label: "Reservoir" },
  { href: "#work", label: "Case Studies" },
  { href: "#process", label: "Process" },
  { href: "#pricing", label: "Pricing" },
];

export default function Navbar() {
  const [open, setOpen] = useState(false);

  const close = () => {
    setOpen(false);
    document.body.style.overflow = "";
  };

  const toggle = () => {
    const next = !open;
    setOpen(next);
    document.body.style.overflow = next ? "hidden" : "";
  };

  return (
    <>
      <nav className="fixed top-0 left-0 right-0 z-[200] px-6 lg:px-12 py-4 flex justify-between items-center bg-white/[0.94] dark:bg-bg-dark/[0.94] backdrop-blur-xl border-b border-border dark:border-border-dark transition-colors">
        <a href="#" className="font-serif font-medium text-[1.4rem] text-txt dark:text-txt-dark tracking-[0.04em] no-underline">
          Loparo
        </a>
        <div className="flex items-center gap-6">
          <div className="hidden md:flex items-center gap-10">
            {links.map((l) => (
              <a
                key={l.href}
                href={l.href}
                className="text-[0.75rem] font-normal uppercase tracking-[0.14em] text-txt-muted dark:text-txt-dark-muted no-underline hover:text-txt dark:hover:text-txt-dark transition-colors"
              >
                {l.label}
              </a>
            ))}
          </div>
          <ThemeToggle />
          <a
            href="#contact"
            className="hidden md:inline-block text-[0.75rem] font-medium uppercase tracking-[0.1em] text-white bg-green dark:bg-green-bright px-5 py-2 no-underline hover:opacity-[0.88] transition-opacity"
          >
            Book a Call
          </a>
          {/* Hamburger */}
          <button
            onClick={toggle}
            className="flex md:hidden flex-col justify-center items-center gap-[5px] w-9 h-9 bg-transparent border-none cursor-pointer"
            aria-label="Menu"
          >
            <span className={`block w-[22px] h-[1.5px] bg-txt dark:bg-txt-dark transition-transform duration-300 ${open ? "translate-y-[6.5px] rotate-45" : ""}`} />
            <span className={`block w-[22px] h-[1.5px] bg-txt dark:bg-txt-dark transition-opacity duration-300 ${open ? "opacity-0" : ""}`} />
            <span className={`block w-[22px] h-[1.5px] bg-txt dark:bg-txt-dark transition-transform duration-300 ${open ? "-translate-y-[6.5px] -rotate-45" : ""}`} />
          </button>
        </div>
      </nav>

      {/* Mobile Menu */}
      <div className={`mobile-menu ${open ? "open" : ""}`}>
        {links.map((l) => (
          <a
            key={l.href}
            href={l.href}
            onClick={close}
            className="text-lg font-normal text-txt dark:text-txt-dark no-underline"
          >
            {l.label}
          </a>
        ))}
        <a
          href="#contact"
          onClick={close}
          className="text-[0.78rem] font-medium uppercase tracking-[0.12em] text-white bg-green dark:bg-green-bright px-8 py-3 no-underline mt-4"
        >
          Book a Call
        </a>
      </div>
    </>
  );
}
