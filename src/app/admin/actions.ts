"use server";
/**
 * Every admin write goes through here. Each action re-checks the session, writes with the
 * service-role client, then revalidates the public site so changes appear immediately.
 */
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import type { AvailabilityStatus, InquiryStatus, StopKind, StyleTag } from "@/lib/types";
import { supabaseService } from "@/lib/data/supabase";
import { getAdmin, isAdminUser, supabaseSession } from "@/lib/admin/session";
import { eachDay } from "@/lib/dates";

export type ActionResult<T = undefined> = { ok: true; data?: T } | { ok: false; error: string };

const STATUSES: AvailabilityStatus[] = ["open", "limited", "full", "closed", "soon"];
const INQUIRY_STATUSES: InquiryStatus[] = ["new", "reviewing", "accepted", "deposit_required", "confirmed", "completed", "declined"];
const KINDS: StopKind[] = ["home", "guest", "convention", "travel"];
const STYLES: StyleTag[] = ["black-grey", "blackwork", "gothic", "american-traditional", "lettering", "linework", "custom"];

async function guard() {
  const admin = await getAdmin();
  if (!admin) throw new Error("Your session expired — sign in again.");
  if (admin.demo) throw new Error("Demo mode — connect Supabase to save changes.");
  const db = supabaseService();
  if (!db) throw new Error("SUPABASE_SERVICE_ROLE_KEY is missing in your environment.");
  return db;
}

async function run<T>(fn: () => Promise<T>): Promise<ActionResult<T>> {
  try {
    const data = await fn();
    revalidatePath("/", "layout");
    return { ok: true, data };
  } catch (e) {
    const msg = e instanceof Error ? e.message : typeof e === "object" && e && "message" in e ? String((e as { message: unknown }).message) : "Something went wrong.";
    return { ok: false, error: msg };
  }
}

const must = <T,>(r: { data: T; error: unknown }) => {
  if (r.error) throw r.error;
  return r.data;
};

const slugify = (s: string) => s.toLowerCase().normalize("NFKD").replace(/[^\w\s-]/g, "").trim().replace(/[\s_]+/g, "-").replace(/-+/g, "-").slice(0, 48) || "piece";
const rand = () => Math.random().toString(36).slice(2, 7);

/* ── Auth ─────────────────────────────────────────────── */

export async function signIn(_: unknown, form: FormData): Promise<{ error: string } | undefined> {
  const email = String(form.get("email") ?? "").trim();
  const password = String(form.get("password") ?? "");
  if (!email || !password) return { error: "Enter your email and password." };
  const sb = await supabaseSession();
  const { data, error } = await sb.auth.signInWithPassword({ email, password });
  if (error || !data.user) return { error: "That email and password don't match." };
  if (!(await isAdminUser(data.user.id, data.user.email))) {
    await sb.auth.signOut();
    return { error: "This account isn't set up as an admin yet. Add it to the admins table (see README)." };
  }
  redirect("/admin");
}

export async function signOut() {
  const sb = await supabaseSession();
  await sb.auth.signOut();
  redirect("/admin/login");
}

/* ── Uploads ──────────────────────────────────────────── */

/**
 * Photos are resized in the browser to three WebP widths, then uploaded straight to Storage
 * with one-time signed URLs — so big phone photos never pass through a server function.
 */
export async function createUploadSlots(folder: "tattoos" | "profile", widths: number[]): Promise<ActionResult<{ key: string; slots: { width: number; path: string; token: string }[] }>> {
  return run(async () => {
    const db = await guard();
    const key = `${folder}/${Date.now().toString(36)}-${rand()}`;
    const slots = await Promise.all(
      widths.map(async (w) => {
        const path = `${key}-${w}.webp`;
        const r = must(await db.storage.from("portfolio").createSignedUploadUrl(path, { upsert: true }));
        return { width: w, path, token: r!.token };
      }),
    );
    return { key, slots };
  });
}

async function removeRenditions(db: NonNullable<ReturnType<typeof supabaseService>>, key: string | null | undefined) {
  if (!key || key.startsWith("/")) return; // bundled images live in the repo
  await db.storage.from("portfolio").remove([480, 828, 1170].map((w) => `${key}-${w}.webp`));
}

/* ── Portfolio ────────────────────────────────────────── */

export interface TattooInput {
  id?: string;
  title: string;
  description: string;
  alt: string;
  styles: StyleTag[];
  placement: string;
  featured: boolean;
  published: boolean;
  image?: { key: string; width: number; height: number; blur: string; tone: string };
}

export async function saveTattoo(input: TattooInput): Promise<ActionResult<{ id: string; slug: string }>> {
  return run(async () => {
    const db = await guard();
    const title = input.title.trim();
    if (!title) throw new Error("Give the piece a title.");
    const row: Record<string, unknown> = {
      title,
      description: input.description.trim() || null,
      alt_text: input.alt.trim() || null,
      styles: input.styles.filter((s) => STYLES.includes(s)),
      placement: input.placement.trim() || null,
      featured: input.featured,
      published: input.published,
    };
    if (input.image) {
      Object.assign(row, {
        image_path: input.image.key, image_width: input.image.width, image_height: input.image.height,
        image_blur: input.image.blur, image_tone: input.image.tone,
      });
    }
    if (input.id) {
      const prev = must(await db.from("tattoos").select("image_path").eq("id", input.id).single()) as { image_path: string };
      const r = must(await db.from("tattoos").update(row).eq("id", input.id).select("id,slug").single()) as { id: string; slug: string };
      if (input.image && prev.image_path !== input.image.key) await removeRenditions(db, prev.image_path);
      return r;
    }
    if (!input.image) throw new Error("Add a photo first.");
    const top = must(await db.from("tattoos").select("sort_order").order("sort_order", { ascending: false }).limit(1)) as { sort_order: number }[];
    row.sort_order = (top[0]?.sort_order ?? 0) + 1; // new work goes to the front
    row.slug = `${slugify(title)}-${rand()}`;
    return must(await db.from("tattoos").insert(row).select("id,slug").single()) as { id: string; slug: string };
  });
}

export async function deleteTattoo(id: string): Promise<ActionResult> {
  return run(async () => {
    const db = await guard();
    const prev = must(await db.from("tattoos").select("image_path").eq("id", id).single()) as { image_path: string };
    must(await db.from("tattoos").delete().eq("id", id));
    await removeRenditions(db, prev.image_path);
    return undefined;
  });
}

/** ids in display order, first = shown first */
export async function reorderTattoos(ids: string[]): Promise<ActionResult> {
  return run(async () => {
    const db = await guard();
    const n = ids.length;
    await Promise.all(ids.map((id, i) => db.from("tattoos").update({ sort_order: n - i }).eq("id", id).then(must)));
    return undefined;
  });
}

export async function setTattooFlags(id: string, flags: { featured?: boolean; published?: boolean }): Promise<ActionResult> {
  return run(async () => {
    const db = await guard();
    must(await db.from("tattoos").update(flags).eq("id", id));
    return undefined;
  });
}

/* ── Cities ───────────────────────────────────────────── */

export interface LocationInput { id?: string; city: string; region: string; country: string; latitude: number; longitude: number; isHome: boolean }

export async function saveLocation(input: LocationInput): Promise<ActionResult<{ id: string }>> {
  return run(async () => {
    const db = await guard();
    if (!input.city.trim()) throw new Error("City name is required.");
    if (!Number.isFinite(input.latitude) || !Number.isFinite(input.longitude)) throw new Error("Look up or enter coordinates for this city.");
    const id = input.id ?? slugify(`${input.city}-${input.region}`);
    if (input.isHome) must(await db.from("locations").update({ is_home: false }).neq("id", id));
    must(await db.from("locations").upsert({
      id, city: input.city.trim(), region: input.region.trim(), country: input.country.trim() || "CA",
      latitude: input.latitude, longitude: input.longitude, is_home: input.isHome,
    }));
    return { id };
  });
}

export async function deleteLocation(id: string): Promise<ActionResult> {
  return run(async () => {
    const db = await guard();
    must(await db.from("locations").delete().eq("id", id));
    return undefined;
  });
}

/** City → coordinates via OpenStreetMap Nominatim (free, low volume). */
export async function lookupCity(query: string): Promise<ActionResult<{ latitude: number; longitude: number; label: string }>> {
  try {
    await guard();
    const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&limit=1&q=${encodeURIComponent(query)}`, {
      headers: { "user-agent": "loash-admin/1.0 (tattoo schedule)" },
      cache: "no-store",
    });
    const j = (await res.json()) as { lat: string; lon: string; display_name: string }[];
    if (!j[0]) return { ok: false, error: "Couldn't find that place — try adding the province/state." };
    return { ok: true, data: { latitude: +(+j[0].lat).toFixed(4), longitude: +(+j[0].lon).toFixed(4), label: j[0].display_name } };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Lookup failed." };
  }
}

/* ── Schedule + day availability ──────────────────────── */

export interface StopInput {
  id?: string;
  locationId: string;
  kind: StopKind;
  venue: string;
  startDate: string | null;
  endDate: string | null;
  status: AvailabilityStatus;
  appointmentWindows: number | null;
  spotsRemaining: number | null;
  note: string;
  isPlaceholder: boolean;
  /** Full day map for the range; days missing from the map inherit the stop status */
  days: Record<string, AvailabilityStatus>;
}

export async function saveStop(input: StopInput): Promise<ActionResult<{ id: string }>> {
  return run(async () => {
    const db = await guard();
    if (!input.locationId) throw new Error("Pick a city.");
    if (!KINDS.includes(input.kind) || !STATUSES.includes(input.status)) throw new Error("Invalid stop type or status.");
    if (input.startDate && input.endDate && input.endDate < input.startDate) throw new Error("End date is before the start date.");
    if (input.startDate && input.endDate && eachDay(input.startDate, input.endDate).length > 120) throw new Error("Keep a stop under 120 days — split longer stretches.");

    const row = {
      location_id: input.locationId, kind: input.kind, venue: input.venue.trim() || null,
      start_date: input.startDate || null, end_date: input.endDate || input.startDate || null, status: input.status,
      appointment_windows: input.appointmentWindows, spots_remaining: input.spotsRemaining,
      note: input.note.trim() || null, is_placeholder: input.isPlaceholder,
    };
    const saved = input.id
      ? (must(await db.from("schedule").update(row).eq("id", input.id).select("id").single()) as { id: string })
      : (must(await db.from("schedule").insert(row).select("id").single()) as { id: string });

    // Replace this stop's day rows with exactly what the editor shows
    must(await db.from("availability").delete().eq("schedule_id", saved.id));
    if (row.start_date && row.end_date) {
      const rows = eachDay(row.start_date, row.end_date).map((date) => ({
        schedule_id: saved.id, location_id: input.locationId, date,
        status: STATUSES.includes(input.days[date]) ? input.days[date] : input.status,
      }));
      if (rows.length) must(await db.from("availability").insert(rows));
    }
    return { id: saved.id };
  });
}

export async function deleteStop(id: string): Promise<ActionResult> {
  return run(async () => {
    const db = await guard();
    must(await db.from("schedule").delete().eq("id", id));
    return undefined;
  });
}

/* ── Inquiries ────────────────────────────────────────── */

export async function updateInquiry(id: string, patch: { status?: InquiryStatus; internalNotes?: string }): Promise<ActionResult> {
  return run(async () => {
    const db = await guard();
    const row: Record<string, unknown> = {};
    if (patch.status) {
      if (!INQUIRY_STATUSES.includes(patch.status)) throw new Error("Unknown status.");
      row.status = patch.status;
    }
    if (patch.internalNotes !== undefined) row.internal_notes = patch.internalNotes;
    must(await db.from("inquiries").update(row).eq("id", id));
    return undefined;
  });
}

export async function deleteInquiry(id: string): Promise<ActionResult> {
  return run(async () => {
    const db = await guard();
    const r = must(await db.from("inquiries").select("reference_paths").eq("id", id).single()) as { reference_paths: string[] };
    if (r.reference_paths?.length) await db.storage.from("inquiry-references").remove(r.reference_paths);
    must(await db.from("inquiries").delete().eq("id", id));
    return undefined;
  });
}

/* ── Profile / site text ──────────────────────────────── */

export interface ProfileInput {
  name: string;
  handle: string;
  tagline: string;
  homeCity: string;
  byAppointment: boolean;
  styles: StyleTag[];
  notOffered: string[];
  bio: string[];
  contactEmail: string;
  socials: { label: string; handle: string; href: string }[];
  faq: { q: string; a: string }[];
  portrait?: { key: string; width: number; height: number } | null; // null = remove
}

export async function saveProfile(input: ProfileInput): Promise<ActionResult> {
  return run(async () => {
    const db = await guard();
    const row: Record<string, unknown> = {
      id: 1,
      name: input.name.trim() || "Loash",
      handle: input.handle.trim(),
      tagline: input.tagline.trim(),
      home_city: input.homeCity.trim(),
      by_appointment: input.byAppointment,
      styles: input.styles.filter((s) => STYLES.includes(s)),
      not_offered: input.notOffered.map((s) => s.trim()).filter(Boolean),
      bio: input.bio.map((s) => s.trim()).filter(Boolean),
      contact_email: input.contactEmail.trim() || null,
      socials: input.socials.filter((s) => s.label.trim() && s.href.trim()),
      faq: input.faq.filter((f) => f.q.trim()),
    };
    if (input.portrait !== undefined) {
      const prev = (await db.from("artist_profile").select("portrait_path").eq("id", 1).maybeSingle()).data as { portrait_path: string | null } | null;
      row.portrait_path = input.portrait?.key ?? null;
      row.portrait_width = input.portrait?.width ?? null;
      row.portrait_height = input.portrait?.height ?? null;
      if (prev?.portrait_path && prev.portrait_path !== input.portrait?.key) await removeRenditions(db, prev.portrait_path);
    }
    must(await db.from("artist_profile").upsert(row));
    return undefined;
  });
}
