/**
 * SAMPLE DATA — used whenever Supabase isn't configured.
 *
 * ▸ Tattoos: real photos of Loash's work. Titles/descriptions were drafted from what is
 *   visible in each photo only (no meanings, no client details) and are flagged
 *   `needsReview` so Loash can confirm or rewrite them.
 * ▸ Stops & availability: PLACEHOLDERS. Not real commitments. Every one is flagged
 *   `isPlaceholder` and renders with a "Sample" tag until replaced.
 *
 * Everything here maps 1:1 onto supabase/seed.sql.
 */
import meta from "./image-meta.json";
import type { ArtistProfile, AvailabilityDay, AvailabilityStatus, Location, Snapshot, Stop, Tattoo } from "../types";
import { eachDay } from "../dates";

type Meta = { width: number; height: number; blur: string; tone: string; source: string };
const img = (slug: string) => {
  const m = (meta as Record<string, Meta>)[slug];
  return { src: `/work/${slug}`, width: m.width, height: m.height, blur: m.blur, tone: m.tone };
};

export const artist: ArtistProfile = {
  name: "Loash",
  handle: "@loash",
  tagline: "Tattoo artist",
  homeCity: "Windsor, Ontario",
  styles: ["black-grey", "blackwork", "gothic", "american-traditional"],
  notOffered: ["Realism"],
  byAppointmentOnly: true,
  bio: [
    "PLACEHOLDER — a few sentences in your own voice: how you got into tattooing, what pulls you toward dark, graphic imagery, and what a session with you feels like.",
    "PLACEHOLDER — what you love to draw most, and the kind of client you do your best work with.",
  ],
  bioIsPlaceholder: true,
  // Add Instagram (and others) from Admin → Profile → Socials
  socials: [],
  contactEmail: null,
  faq: [
    { q: "Do you take deposits?", a: "PLACEHOLDER — how deposits work, how much, and whether they're refundable." },
    { q: "Do I need to be 18?", a: "Yes — every client must be 18+ with valid photo ID. PLACEHOLDER — confirm wording." },
    { q: "Do you do cover-ups?", a: "PLACEHOLDER — which cover-ups you take on and what to send in your request." },
    { q: "How do touch-ups work?", a: "PLACEHOLDER — your touch-up policy." },
  ],
  faqIsPlaceholder: true,
  portrait: null,
};

export const tattoos: Tattoo[] = [
  {
    id: "t-moth", slug: "deaths-head-moth", title: "Death's-Head Moth", image: img("deaths-head-moth"),
    alt: "Black and grey death's-head moth tattoo with a skull on its thorax, surrounded by blossoms and four-point sparkles",
    styles: ["american-traditional", "black-grey", "gothic"], placement: null, featured: true, order: 11,
    description: "A death's-head moth with the skull marking on its thorax, framed by traditional blossoms and four-point sparkles. Bold outline, soft black and grey shading.",
    needsReview: true,
  },
  {
    id: "t-lovers", slug: "the-lovers", title: "The Lovers — VI", image: img("the-lovers"),
    alt: "Tarot card tattoo of The Lovers, numbered VI, showing two skeletons embracing with a rose on the card's corner",
    styles: ["black-grey", "gothic"], placement: null, featured: true, order: 6,
    description: "Tarot card VI. Two skeletons in an embrace inside a hand-drawn card frame, with a rose breaking the top corner.",
    needsReview: true,
  },
  {
    id: "t-rose", slug: "barbed-heart-rose", title: "Barbed Heart Rose", image: img("barbed-heart-rose"),
    alt: "Blackwork tattoo of a solid black rose with a barbed-wire heart and blackletter lettering",
    styles: ["blackwork", "gothic", "lettering"], placement: null, featured: true, order: 10,
    description: "A solid black rose growing through a barbed-wire heart, with blackletter lettering at the centre and ink drips below.",
    needsReview: true,
  },
  {
    id: "t-seraph", slug: "seraph-eye", title: "Seraph", image: img("seraph-eye"),
    alt: "Linework tattoo of a six-winged seraph around a single eye, outlined with red accent flames",
    styles: ["linework", "gothic"], placement: null, featured: true, order: 2,
    description: "Six wings fanning out around a single open eye. Fine black linework with red flame accents tracing the silhouette.",
    needsReview: true,
  },
  {
    id: "t-cherub", slug: "cherub-on-column", title: "Cherub on Column", image: img("cherub-on-column"),
    alt: "Engraving-style linework tattoo of a cherub sitting on a fluted Ionic column",
    styles: ["linework", "blackwork"], placement: null, featured: false, order: 5,
    description: "A seated cherub on a fluted Ionic column, built entirely from engraving-style hatching.",
    needsReview: true,
  },
  {
    id: "t-moon", slug: "crescent-and-cat", title: "Crescent & Cat", image: img("crescent-and-cat"),
    alt: "Tattoo of a crescent moon with a face and a black and white cat sitting inside its curve, with sparkles",
    styles: ["american-traditional", "black-grey"], placement: null, featured: false, order: 7,
    description: "A crescent moon with a face, a black-and-white cat sitting in its curve, and scattered sparkles.",
    needsReview: true,
  },
  {
    id: "t-songbird", slug: "songbird-skull-branch", title: "Songbird & Skull Branch", image: img("songbird-skull-branch"),
    alt: "Black and grey tattoo of a songbird perched on a leafy branch bearing small skulls",
    styles: ["black-grey", "gothic"], placement: null, featured: false, order: 1,
    description: "A songbird perched on a leafy branch that bears small skulls in place of fruit. Stippled black and grey.",
    needsReview: true,
  },
  {
    id: "t-knuckles", slug: "knuckle-lettering", title: "Knuckle Lettering", image: img("knuckle-lettering"),
    alt: "Blackletter knuckle tattoo, one letter per finger",
    styles: ["lettering", "blackwork"], placement: "Knuckles", featured: false, order: 4,
    description: "Four blackletter capitals across the knuckles, one per finger.",
    needsReview: true,
  },
  {
    id: "t-pine", slug: "torn-skin-pine", title: "Torn Skin, Evergreen", image: img("torn-skin-pine"),
    alt: "Black and grey torn-skin tattoo revealing a banded panel with an evergreen tree",
    styles: ["black-grey"], placement: null, featured: false, order: 3,
    description: "A torn-skin opening revealing a banded panel with a single evergreen at its centre.",
    needsReview: true,
  },
  {
    id: "t-circle", slug: "circle-character-piece", title: "Character Vignette", image: img("circle-character-piece"),
    alt: "Black and grey circular tattoo of two animated characters with a shadowy figure behind them and a date",
    styles: ["black-grey"], placement: null, featured: false, order: 9,
    description: "A circular vignette of two animated characters, a soft shadowed figure looming behind, finished with a date.",
    needsReview: true,
  },
  {
    id: "t-dino", slug: "little-dino", title: "Little Dino", image: img("little-dino"),
    alt: "Small black and grey cartoon dinosaur tattoo with a name in script above it",
    styles: ["black-grey"], placement: "Lower leg", featured: false, order: 8,
    description: "A small cartoon dinosaur with soft shading and a name in script above.",
    needsReview: true,
  },
];

export const locations: Location[] = [
  { id: "windsor", city: "Windsor", region: "ON", country: "CA", latitude: 42.3149, longitude: -83.0364, isHome: true },
  { id: "detroit", city: "Detroit", region: "MI", country: "US", latitude: 42.3314, longitude: -83.0458 },
  { id: "london", city: "London", region: "ON", country: "CA", latitude: 42.9849, longitude: -81.2453 },
  { id: "toronto", city: "Toronto", region: "ON", country: "CA", latitude: 43.6532, longitude: -79.3832 },
];

/** ⚠ PLACEHOLDER SCHEDULE — replace with real dates. */
export const stops: Stop[] = [
  { id: "s-windsor-oct", locationId: "windsor", kind: "home", venue: null, startDate: "2026-10-14", endDate: "2026-10-20", status: "limited", appointmentWindows: 6, spotsRemaining: 2, note: null, isPlaceholder: true },
  { id: "s-london-oct", locationId: "london", kind: "guest", venue: null, startDate: "2026-10-24", endDate: "2026-10-25", status: "full", appointmentWindows: 4, spotsRemaining: 0, note: null, isPlaceholder: true },
  { id: "s-toronto-nov", locationId: "toronto", kind: "guest", venue: null, startDate: "2026-11-02", endDate: "2026-11-05", status: "open", appointmentWindows: 3, spotsRemaining: 3, note: null, isPlaceholder: true },
  { id: "s-detroit-nov", locationId: "detroit", kind: "guest", venue: null, startDate: "2026-11-07", endDate: "2026-11-09", status: "soon", appointmentWindows: null, spotsRemaining: null, note: "Books open soon", isPlaceholder: true },
  { id: "s-windsor-nov", locationId: "windsor", kind: "home", venue: null, startDate: "2026-11-16", endDate: "2026-11-28", status: "open", appointmentWindows: 10, spotsRemaining: 7, note: null, isPlaceholder: true },
  { id: "s-windsor-dec", locationId: "windsor", kind: "home", venue: null, startDate: "2026-12-21", endDate: "2027-01-03", status: "closed", appointmentWindows: null, spotsRemaining: null, note: "Studio closed", isPlaceholder: true },
];

/** Day-level availability, written out per stop so it reads like what the admin will edit. */
const dayPattern: Record<string, AvailabilityStatus[]> = {
  "s-windsor-oct": ["full", "limited", "full", "full", "limited", "full", "closed"],
  "s-london-oct": ["full", "full"],
  "s-toronto-nov": ["open", "open", "limited", "full"],
  "s-detroit-nov": ["soon", "soon", "soon"],
  "s-windsor-nov": ["open", "open", "limited", "open", "full", "closed", "closed", "open", "limited", "open", "open", "full", "open"],
  "s-windsor-dec": [],
};

export const availability: AvailabilityDay[] = stops.flatMap((s) => {
  if (!s.startDate || !s.endDate) return [];
  const pattern = dayPattern[s.id] ?? [];
  return eachDay(s.startDate, s.endDate).map((date, i) => ({
    id: `${s.id}-${date}`,
    stopId: s.id,
    locationId: s.locationId,
    date,
    status: pattern[i] ?? s.status,
  }));
});

export function sampleSnapshot(): Snapshot {
  return { artist, tattoos, locations, stops, availability, generatedAt: new Date().toISOString(), source: "sample" };
}
