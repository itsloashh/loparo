"use client";
/**
 * One stop, written like a line in a tour programme rather than a log entry:
 * a serif date plate, the city, a quiet line of detail, and the booking state in words.
 */
import type { ReactNode } from "react";
import type { Stop } from "@/lib/types";
import { KIND_LABEL, STATUS } from "@/lib/status";
import { useData } from "@/lib/app-context";
import { isActive, locationById } from "@/lib/selectors";
import { formatDayNum, formatRange, parseISODate } from "@/lib/dates";
import { SampleTag, StatusGlyph, cx } from "@/components/ui/primitives";

const monShort = (iso: string) => new Intl.DateTimeFormat("en-US", { timeZone: "UTC", month: "short" }).format(parseISODate(iso));

export function capacityLine(stop: Stop) {
  if (stop.status === "limited" && stop.spotsRemaining != null) return `${stop.spotsRemaining} ${stop.spotsRemaining === 1 ? "spot" : "spots"} left`;
  if (stop.status === "open" && stop.appointmentWindows != null) return `${stop.appointmentWindows} appointment windows`;
  return stop.note ?? "";
}

export function DatePlate({ iso, size = "md" }: { iso: string | null; size?: "sm" | "md" | "lg" }) {
  return (
    <span className={cx("flex shrink-0 flex-col items-center justify-center text-center", size === "lg" ? "w-16" : size === "sm" ? "w-11" : "w-13")}>
      <span className="font-display text-[14px] italic leading-none text-gold">{iso ? monShort(iso) : "TBA"}</span>
      <span className={cx("mt-1 font-display leading-none text-bone tabular", size === "lg" ? "text-[2.6rem]" : size === "sm" ? "text-[1.7rem]" : "text-[2.1rem]")}>
        {iso ? formatDayNum(iso) : "—"}
      </span>
    </span>
  );
}

export function StopLine({ stop, onClick, href, right, compact, Link }: {
  stop: Stop;
  onClick?: () => void;
  href?: string;
  right?: ReactNode;
  compact?: boolean;
  Link?: (p: { href: string; className: string; children: ReactNode; "data-cursor"?: string; onMouseEnter?: () => void; onMouseLeave?: () => void }) => ReactNode;
}) {
  const { snapshot, today } = useData();
  const l = locationById(snapshot, stop.locationId);
  const now = isActive(stop, today);
  const s = STATUS[stop.status];
  const detail = [KIND_LABEL[stop.kind], stop.venue, formatRange(stop.startDate, stop.endDate)].filter(Boolean).join(" · ");
  const cap = capacityLine(stop);
  const cls = "group grid w-full grid-cols-[auto_1fr_auto] items-center gap-4 border-b border-[var(--line)] py-4 text-left transition-colors hover:bg-white/[0.02] sm:gap-5";
  const body = (
    <>
      <DatePlate iso={stop.startDate} size={compact ? "sm" : "md"} />
      <span className="min-w-0">
        <span className="flex flex-wrap items-center gap-x-2.5 gap-y-1">
          <span className={cx("font-display leading-none text-bone transition-colors group-hover:text-gold-bright", compact ? "text-[1.45rem]" : "text-[1.7rem]")}>{l?.city ?? "—"}</span>
          {now && <span className="here-glow text-[11.5px] font-medium uppercase tracking-[0.16em] text-gold-bright">Here now</span>}
          {stop.isPlaceholder && <SampleTag />}
        </span>
        <span className="mt-1.5 block truncate text-[13.5px] text-ash">{detail}</span>
      </span>
      {right ?? (
        <span className="flex flex-col items-end gap-1 text-right">
          <span className="flex items-center gap-1.5 text-[13px] font-medium" style={{ color: s.token }}>
            <StatusGlyph status={stop.status} size={8} /> <span className={compact ? "hidden sm:inline" : ""}>{s.short === "Soon" ? "Coming soon" : s.short}</span>
          </span>
          {cap && !compact && <span className="hidden text-[12px] text-ash sm:block">{cap}</span>}
        </span>
      )}
    </>
  );
  if (href && Link) return <Link href={href} className={cls} data-cursor="explore">{body}</Link>;
  return <button type="button" onClick={onClick} className={cls}>{body}</button>;
}
