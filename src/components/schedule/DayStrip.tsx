"use client";
import type { AvailabilityDay, AvailabilityStatus } from "@/lib/types";
import { STATUS } from "@/lib/status";
import { formatDayNum, formatLong, formatWeekday } from "@/lib/dates";
import { StatusGlyph, cx } from "@/components/ui/primitives";

/** A row of days for one stop: serif numerals, availability shown as a coloured underline. */
export function DayStrip({
  days, selected, selectedDates, onPick, size = "md",
}: { days: AvailabilityDay[]; selected?: string | null; selectedDates?: string[]; onPick?: (d: AvailabilityDay) => void; size?: "sm" | "md" }) {
  if (!days.length) return null;
  return (
    <ul className="no-scrollbar -mx-1 flex gap-1.5 overflow-x-auto px-1 pb-1" aria-label="Days">
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
                "relative flex flex-col items-center gap-1 rounded-sm transition-colors",
                size === "sm" ? "w-11 pb-2.5 pt-2" : "w-13 pb-3 pt-2.5",
                sel ? "bg-gold/[0.12] ring-1 ring-gold/70" : "hover:bg-white/[0.04]",
              )}
            >
              <span className="font-display text-[13px] italic text-ash">{formatWeekday(d.date)}</span>
              <span className={cx("font-display tabular leading-none", size === "sm" ? "text-[20px]" : "text-[23px]", s.bookable ? "text-bone" : "text-ash/60", d.status === "full" && "line-through decoration-1")}>
                {formatDayNum(d.date)}
              </span>
              <span className="absolute inset-x-2.5 bottom-1 h-[2px] rounded-full" style={{ background: s.token, opacity: s.bookable ? 0.9 : 0.35 }} />
            </button>
          </li>
        );
      })}
    </ul>
  );
}

const ORDER: AvailabilityStatus[] = ["open", "limited", "full", "closed", "soon"];

export function Legend({ className, compact }: { className?: string; compact?: boolean }) {
  return (
    <ul className={cx("flex flex-wrap gap-x-4 gap-y-2", className)} aria-label="Availability legend">
      {ORDER.map((k) => (
        <li key={k} className="flex items-center gap-1.5 text-[12.5px] text-mist">
          <StatusGlyph status={k} size={8} />
          {compact ? STATUS[k].short : STATUS[k].label}
        </li>
      ))}
    </ul>
  );
}
