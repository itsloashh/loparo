/** Admin reads — service-role, includes hidden pieces and private inquiry data. Server-only. */
import type { ArtistProfile, AvailabilityDay, InquiryStatus, InquiryType, Location, Stop, Tattoo } from "@/lib/types";
import { mapDay, mapLocation, mapProfile, mapStop, mapTattoo, supabaseService } from "@/lib/data/supabase";
import { availability, artist, locations, stops, tattoos } from "@/lib/data/sample";
import { demoMode } from "./session";

export type AdminTattoo = Tattoo & { published: boolean; imagePath: string };
export type AdminProfile = ArtistProfile & { portraitPath: string | null };
export interface AdminInquiry {
  id: string;
  createdAt: string;
  status: InquiryStatus;
  type: InquiryType;
  referenceTattooId: string | null;
  placement: string;
  size: string;
  scheduleId: string | null;
  preferredDates: string[];
  flexibleDates: boolean;
  idea: string;
  name: string;
  email: string;
  phone: string | null;
  instagram: string | null;
  referenceUrls: string[];
  internalNotes: string;
}

export interface AdminData {
  tattoos: AdminTattoo[];
  locations: Location[];
  stops: Stop[];
  days: AvailabilityDay[];
  inquiries: AdminInquiry[];
  profile: AdminProfile;
  demo: boolean;
}

const DEMO_INQUIRIES: AdminInquiry[] = [
  {
    id: "demo-1", createdAt: new Date(Date.now() - 3 * 3600e3).toISOString(), status: "new", type: "portfolio",
    referenceTattooId: "t-moth", placement: "Forearm", size: "medium", scheduleId: "s-toronto-nov", preferredDates: ["2026-11-02", "2026-11-03"],
    flexibleDates: false, idea: "EXAMPLE INQUIRY — something like the moth but with a crescent moon behind it.", name: "Example Client",
    email: "client@example.com", phone: null, instagram: "@example", referenceUrls: [], internalNotes: "",
  },
  {
    id: "demo-2", createdAt: new Date(Date.now() - 50 * 3600e3).toISOString(), status: "deposit_required", type: "custom",
    referenceTattooId: null, placement: "Thigh", size: "large", scheduleId: "s-windsor-nov", preferredDates: [], flexibleDates: true,
    idea: "EXAMPLE INQUIRY — gothic cathedral window with a snake.", name: "Sample Person", email: "sample@example.com",
    phone: null, instagram: null, referenceUrls: [], internalNotes: "Sent deposit link",
  },
];

/* eslint-disable @typescript-eslint/no-explicit-any */
export async function loadAdminData(): Promise<AdminData> {
  if (demoMode()) {
    return {
      tattoos: tattoos.map((t) => ({ ...t, published: true, imagePath: t.image.src })).sort((a, b) => b.order - a.order),
      locations, stops, days: availability, inquiries: DEMO_INQUIRIES,
      profile: { ...artist, portraitPath: null }, demo: true,
    };
  }
  const db = supabaseService();
  if (!db) throw new Error("SUPABASE_SERVICE_ROLE_KEY is missing.");
  const [t, l, s, a, i, p] = await Promise.all([
    db.from("tattoos").select("*").order("sort_order", { ascending: false }),
    db.from("locations").select("*").order("city"),
    db.from("schedule").select("*").order("start_date", { ascending: true, nullsFirst: false }),
    db.from("availability").select("*").order("date"),
    db.from("inquiries").select("*").order("created_at", { ascending: false }).limit(200),
    db.from("artist_profile").select("*").eq("id", 1).maybeSingle(),
  ]);
  for (const r of [t, l, s, a, i, p]) if (r.error) throw r.error;

  // Signed links (1h) for the private reference photos clients uploaded
  const inquiries: AdminInquiry[] = await Promise.all(
    (i.data ?? []).map(async (r: any) => {
      const paths: string[] = r.reference_paths ?? [];
      const signed = paths.length ? (await db.storage.from("inquiry-references").createSignedUrls(paths, 3600)).data ?? [] : [];
      return {
        id: r.id, createdAt: r.created_at, status: r.status, type: r.type, referenceTattooId: r.reference_tattoo_id,
        placement: r.placement, size: r.size, scheduleId: r.schedule_id, preferredDates: r.preferred_dates ?? [],
        flexibleDates: r.flexible_dates, idea: r.idea, name: r.name, email: r.email, phone: r.phone, instagram: r.instagram,
        referenceUrls: signed.map((x) => x.signedUrl).filter(Boolean) as string[], internalNotes: r.internal_notes ?? "",
      };
    }),
  );

  return {
    tattoos: (t.data ?? []).map((r: any) => ({ ...mapTattoo(r), published: r.published, imagePath: r.image_path })),
    locations: (l.data ?? []).map(mapLocation),
    stops: (s.data ?? []).map(mapStop),
    days: (a.data ?? []).map(mapDay),
    inquiries,
    profile: { ...mapProfile(p.data), portraitPath: p.data?.portrait_path ?? null },
    demo: false,
  };
}
