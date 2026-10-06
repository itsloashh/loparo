/**
 * LOASH domain model.
 * These types mirror the Supabase tables in supabase/migrations/0001_init.sql.
 * UI components only ever consume these shapes — never raw rows or hard-coded values.
 */

export type AvailabilityStatus = "open" | "limited" | "full" | "closed" | "soon";

export type StyleTag =
  | "black-grey"
  | "blackwork"
  | "gothic"
  | "american-traditional"
  | "lettering"
  | "linework"
  | "custom";

export interface ImageAsset {
  /**
   * Base path without size suffix. Renditions live at `${src}-480.webp`, `-828`, `-1170`.
   * Either a bundled path ("/work/the-lovers") or a Supabase Storage public URL base.
   */
  src: string;
  width: number;
  height: number;
  /** Tiny base64 placeholder for progressive reveal */
  blur?: string;
  /** Average tone, used as the frame colour while loading */
  tone?: string;
}

export interface Tattoo {
  id: string;
  slug: string;
  title: string;
  image: ImageAsset;
  alt: string;
  styles: StyleTag[];
  /** Visible placement only — null when it can't be told from the photo */
  placement: string | null;
  description: string;
  featured: boolean;
  /** Higher = newer. Drives "New work". */
  order: number;
  /** True when copy was drafted from the photo and needs Loash to confirm */
  needsReview?: boolean;
}

export interface Location {
  id: string;
  city: string;
  region: string;
  country: "CA" | "US" | string;
  latitude: number;
  longitude: number;
  /** Home base gets a distinct marker */
  isHome?: boolean;
}

export type StopKind = "home" | "guest" | "convention" | "travel";

/** A block of time Loash is tattooing in one place. ("schedule" table) */
export interface Stop {
  id: string;
  locationId: string;
  kind: StopKind;
  venue: string | null;
  startDate: string | null; // ISO yyyy-mm-dd, null = dates TBA
  endDate: string | null;
  status: AvailabilityStatus;
  appointmentWindows: number | null;
  spotsRemaining: number | null;
  note: string | null;
  /** Sample data that must be replaced before launch */
  isPlaceholder: boolean;
}

/** Per-day availability inside a stop. ("availability" table) */
export interface AvailabilityDay {
  id: string;
  stopId: string;
  locationId: string;
  date: string; // ISO yyyy-mm-dd
  status: AvailabilityStatus;
  note?: string | null;
}

export interface ArtistProfile {
  name: string;
  handle: string;
  tagline: string;
  homeCity: string;
  styles: StyleTag[];
  notOffered: string[];
  byAppointmentOnly: boolean;
  bio: string[];
  bioIsPlaceholder: boolean;
  socials: { label: string; href: string; handle: string }[];
  contactEmail: string | null;
  faq: { q: string; a: string }[];
  faqIsPlaceholder: boolean;
  portrait: ImageAsset | null;
}

export interface Snapshot {
  artist: ArtistProfile;
  tattoos: Tattoo[];
  locations: Location[];
  stops: Stop[];
  availability: AvailabilityDay[];
  /** ISO timestamp — lets the UI say "updated …" */
  generatedAt: string;
  source: "sample" | "supabase";
}

export type InquiryType = "custom" | "portfolio" | "flash" | "cover-up" | "other";
export type InquiryStatus =
  | "new"
  | "reviewing"
  | "accepted"
  | "deposit_required"
  | "confirmed"
  | "completed"
  | "declined";

export interface InquiryInput {
  type: InquiryType;
  referenceTattooId: string | null;
  placement: string;
  size: string;
  stopId: string | null;
  preferredDates: string[];
  flexibleDates: boolean;
  idea: string;
  name: string;
  email: string;
  phone: string | null;
  instagram: string | null;
  over18: boolean;
}
