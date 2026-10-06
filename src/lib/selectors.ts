/**
 * Pure derivations from a Snapshot. The "live" parts of the UI (next stop, next
 * available, per-city status) are all computed here — never typed into components.
 */
import type { AvailabilityDay, AvailabilityStatus, Location, Snapshot, Stop, StyleTag, Tattoo } from "./types";
import { STATUS } from "./status";

export function locationById(s: Snapshot, id: string): Location | undefined {
  return s.locations.find((l) => l.id === id);
}

/** Stops that haven't finished yet (TBA dates count as upcoming), chronological. */
export function upcomingStops(s: Snapshot, today: string): Stop[] {
  return s.stops
    .filter((st) => !st.endDate || st.endDate >= today)
    .sort((a, b) => (a.startDate ?? "9999").localeCompare(b.startDate ?? "9999"));
}

export function isActive(st: Stop, today: string) {
  return !!st.startDate && !!st.endDate && st.startDate <= today && st.endDate >= today;
}

/** The next stop someone could plan around: currently active, else next dated, skipping closures. */
export function nextStop(s: Snapshot, today: string): Stop | undefined {
  const up = upcomingStops(s, today).filter((st) => st.status !== "closed" && st.startDate);
  return up.find((st) => isActive(st, today)) ?? up[0];
}

export function nextBookableStop(s: Snapshot, today: string): Stop | undefined {
  return upcomingStops(s, today).find((st) => STATUS[st.status].bookable);
}

/** First future day that can actually be requested. */
export function nextAvailableDay(s: Snapshot, today: string): AvailabilityDay | undefined {
  return [...s.availability]
    .filter((d) => d.date >= today && STATUS[d.status].bookable)
    .sort((a, b) => a.date.localeCompare(b.date))[0];
}

export function daysForStop(s: Snapshot, stopId: string): AvailabilityDay[] {
  return s.availability.filter((d) => d.stopId === stopId).sort((a, b) => a.date.localeCompare(b.date));
}

export function dayIndex(s: Snapshot, locationId?: string | null): Map<string, AvailabilityDay[]> {
  const m = new Map<string, AvailabilityDay[]>();
  for (const d of s.availability) {
    if (locationId && d.locationId !== locationId) continue;
    const arr = m.get(d.date) ?? [];
    arr.push(d);
    m.set(d.date, arr);
  }
  return m;
}

export function bookableDays(days: AvailabilityDay[]) {
  return days.filter((d) => STATUS[d.status].bookable);
}

/** Summary status for a city = the most bookable state among its upcoming stops. */
export function locationStatus(s: Snapshot, locationId: string, today: string): AvailabilityStatus {
  const st = upcomingStops(s, today).filter((x) => x.locationId === locationId);
  if (!st.length) return "closed";
  return st.map((x) => x.status).sort((a, b) => STATUS[a].rank - STATUS[b].rank)[0];
}

export function stopsForLocation(s: Snapshot, locationId: string, today: string): Stop[] {
  return upcomingStops(s, today).filter((x) => x.locationId === locationId);
}

export function newestTattoo(s: Snapshot): Tattoo | undefined {
  return [...s.tattoos].sort((a, b) => b.order - a.order)[0];
}

export function sortedTattoos(s: Snapshot): Tattoo[] {
  // Manual order from the admin (▲▼) wins; "featured" only drives the home hero.
  return [...s.tattoos].sort((a, b) => b.order - a.order);
}

export function styleCounts(t: Tattoo[]): Map<StyleTag, number> {
  const m = new Map<StyleTag, number>();
  for (const x of t) for (const st of x.styles) m.set(st, (m.get(st) ?? 0) + 1);
  return m;
}

export function hasPlaceholders(s: Snapshot) {
  return s.stops.some((x) => x.isPlaceholder);
}

export const placeLabel = (l?: Location) => (l ? `${l.city}, ${l.region}` : "");

/**
 * Where Loash is tattooing right now: the city of a stop that's running today,
 * otherwise the home base. Drives the gold "Here now" pulse on the map.
 */
export function hereNow(s: Snapshot, today: string): { location: Location; stop: Stop | null } | null {
  const active = s.stops.find((st) => isActive(st, today) && st.status !== "closed");
  if (active) {
    const l = locationById(s, active.locationId);
    if (l) return { location: l, stop: active };
  }
  const home = s.locations.find((l) => l.isHome);
  return home ? { location: home, stop: null } : null;
}
