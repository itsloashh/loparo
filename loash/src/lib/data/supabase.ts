import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import type { ArtistProfile, AvailabilityDay, ImageAsset, Location, Snapshot, Stop, StyleTag, Tattoo } from "../types";
import { artist as sampleArtist } from "./sample";
import { storageBase } from "../images";

export const supabaseConfigured = () =>
  Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

let anon: SupabaseClient | null = null;
export function supabaseAnon() {
  anon ??= createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, {
    auth: { persistSession: false },
  });
  return anon;
}

/** Service-role client — server only (API routes / admin actions). Never import into client components. */
export function supabaseService() {
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !key) return null;
  return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, key, { auth: { persistSession: false } });
}

/** "/work/slug" stays a bundled asset; anything else is a key in the 'portfolio' bucket. */
export const imageSrc = (path: string) => (path.startsWith("/") ? path : storageBase(path));

/* eslint-disable @typescript-eslint/no-explicit-any */
export const mapTattoo = (r: any): Tattoo => ({
  id: r.id,
  slug: r.slug,
  title: r.title,
  alt: r.alt_text || r.title,
  styles: r.styles ?? [],
  placement: r.placement,
  description: r.description ?? "",
  featured: r.featured,
  order: r.sort_order,
  image: { src: imageSrc(r.image_path), width: r.image_width, height: r.image_height, blur: r.image_blur ?? undefined, tone: r.image_tone ?? undefined },
});

export const mapLocation = (r: any): Location => ({
  id: r.id, city: r.city, region: r.region, country: r.country, latitude: r.latitude, longitude: r.longitude, isHome: r.is_home,
});

export const mapStop = (r: any): Stop => ({
  id: r.id, locationId: r.location_id, kind: r.kind, venue: r.venue, startDate: r.start_date, endDate: r.end_date,
  status: r.status, appointmentWindows: r.appointment_windows, spotsRemaining: r.spots_remaining, note: r.note, isPlaceholder: !!r.is_placeholder,
});

export const mapDay = (r: any): AvailabilityDay => ({
  id: r.id, stopId: r.schedule_id, locationId: r.location_id, date: r.date, status: r.status, note: r.note,
});

export function mapProfile(p: any | null): ArtistProfile {
  if (!p) return sampleArtist;
  const bio: string[] = (p.bio ?? []).filter((x: string) => x?.trim());
  const faq: { q: string; a: string }[] = Array.isArray(p.faq) ? p.faq.filter((f: any) => f?.q?.trim()) : [];
  const socials = Array.isArray(p.socials) && p.socials.length ? p.socials : sampleArtist.socials;
  const portrait: ImageAsset | null = p.portrait_path
    ? { src: imageSrc(p.portrait_path), width: p.portrait_width ?? 1170, height: p.portrait_height ?? 1462 }
    : null;
  return {
    name: p.name ?? sampleArtist.name,
    handle: p.handle ?? sampleArtist.handle,
    tagline: p.tagline ?? sampleArtist.tagline,
    homeCity: p.home_city ?? sampleArtist.homeCity,
    styles: (p.styles ?? sampleArtist.styles) as StyleTag[],
    notOffered: p.not_offered ?? sampleArtist.notOffered,
    byAppointmentOnly: p.by_appointment ?? true,
    bio: bio.length ? bio : sampleArtist.bio,
    bioIsPlaceholder: !bio.length,
    socials,
    contactEmail: p.contact_email ?? null,
    faq: faq.length ? faq : sampleArtist.faq,
    faqIsPlaceholder: !faq.length,
    portrait,
  };
}

export async function supabaseSnapshot(): Promise<Snapshot> {
  const db = supabaseAnon();
  const [t, l, s, a, p] = await Promise.all([
    db.from("tattoos").select("*").eq("published", true).order("sort_order", { ascending: false }),
    db.from("locations").select("*"),
    db.from("schedule").select("*").order("start_date", { ascending: true, nullsFirst: false }),
    db.from("availability").select("*").order("date"),
    db.from("artist_profile").select("*").limit(1).maybeSingle(),
  ]);
  for (const r of [t, l, s, a]) if (r.error) throw r.error;

  return {
    artist: mapProfile(p.data),
    tattoos: (t.data ?? []).map(mapTattoo),
    locations: (l.data ?? []).map(mapLocation),
    stops: (s.data ?? []).map(mapStop),
    availability: (a.data ?? []).map(mapDay),
    generatedAt: new Date().toISOString(),
    source: "supabase",
  };
}
