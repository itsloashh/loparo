"use client";
/** Small form + feedback kit for the admin. Same tokens as the public site, tuned for thumbs. */
import { createContext, useCallback, useContext, useEffect, useState, type InputHTMLAttributes, type ReactNode, type TextareaHTMLAttributes } from "react";
import { AnimatePresence, motion } from "motion/react";
import { cx } from "@/components/ui/primitives";

/* ── Toasts ── */
type Toast = { id: number; text: string; tone: "ok" | "error" };
const ToastCtx = createContext<(text: string, tone?: "ok" | "error") => void>(() => {});
export const useToast = () => useContext(ToastCtx);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const push = useCallback((text: string, tone: "ok" | "error" = "ok") => {
    const id = Date.now() + Math.random();
    setToasts((t) => [...t, { id, text, tone }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), tone === "error" ? 6000 : 2600);
  }, []);
  return (
    <ToastCtx.Provider value={push}>
      {children}
      <div aria-live="polite" className="pointer-events-none fixed inset-x-0 bottom-[calc(var(--tabbar-h)+env(safe-area-inset-bottom)+12px)] z-[90] flex flex-col items-center gap-2 px-4 lg:bottom-6">
        <AnimatePresence>
          {toasts.map((t) => (
            <motion.div
              key={t.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 6 }}
              role={t.tone === "error" ? "alert" : "status"}
              className={cx(
                "pointer-events-auto max-w-md border px-4 py-3 font-mono text-[12px] uppercase tracking-[0.14em] shadow-2xl shadow-black/60 backdrop-blur",
                t.tone === "error" ? "border-full/60 bg-[#2a1614]/95 text-[#f1c7c0]" : "border-silver/40 bg-graphite/95 text-bone",
              )}
            >
              {t.text}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </ToastCtx.Provider>
  );
}

/* ── Fields ── */
export function Field({ label, hint, children, className }: { label: string; hint?: ReactNode; children: ReactNode; className?: string }) {
  return (
    <label className={cx("block", className)}>
      <span className="mb-1.5 flex items-baseline justify-between gap-3">
        <span className="eyebrow">{label}</span>
        {hint && <span className="font-mono text-[11px] uppercase tracking-[0.12em] text-ash/70">{hint}</span>}
      </span>
      {children}
    </label>
  );
}

const inputCls = "w-full border border-[var(--line-strong)] bg-ink/60 px-3.5 text-[15px] text-bone placeholder:text-ash/45 focus:border-silver/70 focus:outline-none disabled:opacity-50";

export function TextInput(p: InputHTMLAttributes<HTMLInputElement>) {
  return <input {...p} className={cx(inputCls, "h-12", p.className)} />;
}

export function TextArea(p: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea {...p} className={cx(inputCls, "min-h-28 resize-y py-3 leading-relaxed", p.className)} />;
}

export function Select({ value, onChange, options, className, id }: { value: string; onChange: (v: string) => void; options: { value: string; label: string }[]; className?: string; id?: string }) {
  return (
    <select id={id} value={value} onChange={(e) => onChange(e.target.value)} className={cx(inputCls, "h-12 appearance-none bg-[url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='10' height='6'><path d='M0 0l5 6 5-6' fill='%239b968e'/></svg>\")] bg-[length:10px_6px] bg-[right_14px_center] bg-no-repeat pr-9", className)}>
      {options.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
    </select>
  );
}

export function Toggle({ checked, onChange, label, sub }: { checked: boolean; onChange: (v: boolean) => void; label: string; sub?: string }) {
  return (
    <button type="button" role="switch" aria-checked={checked} onClick={() => onChange(!checked)} className="flex w-full items-center justify-between gap-4 border border-[var(--line)] px-4 py-3 text-left transition-colors hover:border-[var(--line-strong)]">
      <span>
        <span className="block text-[14px] text-bone">{label}</span>
        {sub && <span className="block text-[12px] text-ash">{sub}</span>}
      </span>
      <span className={cx("relative h-6 w-11 shrink-0 rounded-full border transition-colors", checked ? "border-silver bg-silver/90" : "border-ash/50 bg-transparent")}>
        <span className={cx("absolute top-1/2 size-4 -translate-y-1/2 rounded-full transition-all duration-300", checked ? "left-[22px] bg-ink" : "left-[3px] bg-ash")} />
      </span>
    </button>
  );
}

export function ChipGroup<T extends string>({ options, value, onChange, multi = true }: { options: { value: T; label: string }[]; value: T[]; onChange: (v: T[]) => void; multi?: boolean }) {
  return (
    <div className="flex flex-wrap gap-1.5">
      {options.map((o) => {
        const on = value.includes(o.value);
        return (
          <button
            key={o.value}
            type="button"
            aria-pressed={on}
            onClick={() => onChange(multi ? (on ? value.filter((v) => v !== o.value) : [...value, o.value]) : [o.value])}
            className={cx("border px-3 py-2 font-mono text-[11.5px] uppercase tracking-[0.14em] transition-colors", on ? "border-silver bg-silver text-ink" : "border-[var(--line)] text-mist hover:border-[var(--line-strong)]")}
          >
            {o.label}
          </button>
        );
      })}
    </div>
  );
}

/* ── Sheet: full screen on phones, side panel on desktop ── */
export function Sheet({ open, onClose, title, children, footer }: { open: boolean; onClose: () => void; title: string; children: ReactNode; footer?: ReactNode }) {
  useEffect(() => {
    if (!open) return;
    const k = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", k);
    const html = document.documentElement, prev = html.style.overflow;
    html.style.overflow = "hidden";
    return () => { window.removeEventListener("keydown", k); html.style.overflow = prev; };
  }, [open, onClose]);
  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-[80]" role="dialog" aria-modal="true" aria-label={title}>
          <motion.div className="absolute inset-0 bg-black/70 backdrop-blur-sm" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} />
          <motion.div
            className="absolute inset-0 flex flex-col bg-stone lg:inset-y-0 lg:left-auto lg:right-0 lg:w-[560px] lg:border-l lg:border-[var(--line-strong)]"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", stiffness: 340, damping: 38 }}
          >
            <header className="flex shrink-0 items-center justify-between border-b border-[var(--line)] px-4 pb-3 pt-[calc(env(safe-area-inset-top)+12px)] lg:px-6">
              <h2 className="display text-[1.7rem] text-bone">{title}</h2>
              <button onClick={onClose} className="grid size-10 place-items-center border border-[var(--line-strong)] text-lg text-mist hover:text-bone" aria-label="Close">×</button>
            </header>
            <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-4 py-5 lg:px-6">{children}</div>
            {footer && <footer className="shrink-0 border-t border-[var(--line)] bg-stone px-4 pb-[calc(env(safe-area-inset-bottom)+12px)] pt-3 lg:px-6">{footer}</footer>}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

/** Two-tap delete: avoids accidental taps without a browser confirm() dialog. */
export function ConfirmButton({ onConfirm, children = "Delete", busy }: { onConfirm: () => void; children?: ReactNode; busy?: boolean }) {
  const [armed, setArmed] = useState(false);
  useEffect(() => {
    if (!armed) return;
    const t = setTimeout(() => setArmed(false), 3500);
    return () => clearTimeout(t);
  }, [armed]);
  return (
    <button
      type="button"
      disabled={busy}
      onClick={() => (armed ? onConfirm() : setArmed(true))}
      className={cx("h-11 border px-4 font-mono text-[11.5px] uppercase tracking-[0.16em] transition-colors disabled:opacity-40", armed ? "border-full bg-full/15 text-full" : "border-[var(--line)] text-ash hover:border-full/50 hover:text-full")}
    >
      {armed ? "Tap again to confirm" : children}
    </button>
  );
}

export function PageHead({ eyebrow, title, action, sub }: { eyebrow: string; title: string; action?: ReactNode; sub?: ReactNode }) {
  return (
    <header className="flex flex-wrap items-end justify-between gap-4">
      <div>
        <p className="eyebrow">{eyebrow}</p>
        <h1 className="display mt-2 text-[2.6rem] text-bone sm:text-[3.2rem]">{title}</h1>
        {sub && <div className="mt-2 text-[14px] text-ash">{sub}</div>}
      </div>
      {action}
    </header>
  );
}

export function Section({ title, children, action, className }: { title: string; children: ReactNode; action?: ReactNode; className?: string }) {
  return (
    <section className={cx("mt-10", className)}>
      <div className="mb-3 flex items-center justify-between gap-3 border-b border-[var(--line)] pb-2">
        <h2 className="caps text-[12.5px] tracking-[0.26em] text-bone">{title}</h2>
        {action}
      </div>
      {children}
    </section>
  );
}
