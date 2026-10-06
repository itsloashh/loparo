"use client";
import type { AvailabilityDay } from "@/lib/types";
import { STATUS } from "@/lib/status";
import { formatDayNum, formatLong, formatWeekday } from "@/lib/dates";
import { StatusGlyph, cx } from "@/components/ui/primitives";

/** A row of days for one stop — the "MON TUE WED / ● ● ×" strip. */
export function DayStrip({
  days, selected, selectedDates, onPick, size = "md",
}: { days: AvailabilityDay[]; selected?: string | null; selectedDates?: string[]; onPick?: (d: AvailabilityDay) => void; size?: "sm" | "md" }) {
  if (!days.length) return null;
  return (
    <ul className="no-scrollbar -mx-1 flex gap-1 overflow-x-auto px-1 pb-1" aria-label="Days">
      {days.map((d) => {
        const s = STATUS[d.status];
        const sel = selected === d.date || !!selectedDates?.includes(d.date);
        return (
          <li key={d.id} className="shrink-0">
            <button
              type="button"
              disabled={!onPick}
              onClick={() => onPick?.(d)}
              aria-pressed={sel}
              aria-label={`${formatLong(d.date)}: ${s.label}`}
              className={cx(
                "flex flex-col items-center gap-1.5 border transition-colors",
                size === "sm" ? "w-10 py-2" : "w-12 py-2.5",
                sel ? "border-silver/70 bg-white/[0.06]" : "border-[var(--line)] hover:border-[var(--line-strong)]",
                !s.bookable && "opacity-60",
              )}
            >
              <span className="font-mono text-[8.5px] uppercase tracking-[0.14em] text-ash">{formatWeekday(d.date)}</span>
              <span className={cx("font-display tabular leading-none text-bone", size === "sm" ? "text-[17px]" : "text-[20px]")}>{formatDayNum(d.date)}</span>
              <StatusGlyph status={d.status} size={8} />
            </button>
          </li>
        );
      })}
    </ul>
  );
}

export function Legend({ className, compact }: { className?: string; compact?: boolean }) {
  return (
    <ul className={cx("flex flex-wrap gap-x-4 gap-y-2", className)} aria-label="Availability legend">
      {(["open", "limited", "full", "closed", "soon"] as const).map((k) => (
        <li key={k} className="flex items-center gap-1.5 font-mono text-[9.5px] uppercase tracking-[0.16em] text-ash">
          <StatusGlyph status={k} size={8} />
          {compact ? STATUS[k].short : STATUS[k].label}
        </li>
      ))}
    </ul>
  );
}
