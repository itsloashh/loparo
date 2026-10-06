/**
 * Date helpers that treat ISO "yyyy-mm-dd" strings as calendar days (no timezone drift).
 */
const MS_DAY = 86_400_000;

export function parseISODate(iso: string): Date {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d));
}

export function toISODate(d: Date): string {
  return d.toISOString().slice(0, 10);
}

/** Today's calendar date in Loash's home timezone. */
export function todayISO(tz = "America/Toronto"): string {
  const parts = new Intl.DateTimeFormat("en-CA", { timeZone: tz, year: "numeric", month: "2-digit", day: "2-digit" }).format(new Date());
  return parts; // en-CA formats as yyyy-mm-dd
}

export function addDays(iso: string, n: number): string {
  return toISODate(new Date(parseISODate(iso).getTime() + n * MS_DAY));
}

export function eachDay(start: string, end: string): string[] {
  const out: string[] = [];
  for (let d = start; d <= end; d = addDays(d, 1)) out.push(d);
  return out;
}

export function daysBetween(a: string, b: string): number {
  return Math.round((parseISODate(b).getTime() - parseISODate(a).getTime()) / MS_DAY);
}

const fmt = (opts: Intl.DateTimeFormatOptions) => new Intl.DateTimeFormat("en-US", { timeZone: "UTC", ...opts });
const fMonDay = fmt({ month: "short", day: "numeric" });
const fDay = fmt({ day: "numeric" });
const fMonth = fmt({ month: "long" });
const fMonthYear = fmt({ month: "long", year: "numeric" });
const fWeekday = fmt({ weekday: "short" });
const fLong = fmt({ weekday: "long", month: "long", day: "numeric" });

export const formatMonDay = (iso: string) => fMonDay.format(parseISODate(iso));
export const formatDayNum = (iso: string) => fDay.format(parseISODate(iso));
export const formatMonth = (iso: string) => fMonth.format(parseISODate(iso));
export const formatMonthYear = (iso: string) => fMonthYear.format(parseISODate(iso));
export const formatWeekday = (iso: string) => fWeekday.format(parseISODate(iso));
export const formatLong = (iso: string) => fLong.format(parseISODate(iso));

/** "Oct 14 – 20", "Oct 30 – Nov 2", or "Dates TBA" */
export function formatRange(start: string | null, end: string | null): string {
  if (!start) return "Dates TBA";
  if (!end || end === start) return formatMonDay(start);
  const sameMonth = start.slice(0, 7) === end.slice(0, 7);
  return `${formatMonDay(start)} – ${sameMonth ? formatDayNum(end) : formatMonDay(end)}`;
}

export const monthKey = (iso: string) => iso.slice(0, 7);

/** Monday-first weeks covering the month of `iso`. Cells outside the month are null. */
export function monthGrid(iso: string): (string | null)[][] {
  const first = `${iso.slice(0, 7)}-01`;
  const d = parseISODate(first);
  const daysInMonth = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth() + 1, 0)).getUTCDate();
  const lead = (d.getUTCDay() + 6) % 7;
  const cells: (string | null)[] = Array(lead).fill(null);
  for (let i = 0; i < daysInMonth; i++) cells.push(addDays(first, i));
  while (cells.length % 7) cells.push(null);
  const weeks: (string | null)[][] = [];
  for (let i = 0; i < cells.length; i += 7) weeks.push(cells.slice(i, i + 7));
  return weeks;
}

export function shiftMonth(iso: string, delta: number): string {
  const d = parseISODate(`${iso.slice(0, 7)}-01`);
  return toISODate(new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth() + delta, 1)));
}
