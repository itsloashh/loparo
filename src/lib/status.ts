import type { AvailabilityStatus, StyleTag, StopKind } from "./types";

/**
 * The single availability language used across the entire platform.
 * Every status has a label, a short label, a colour token AND a glyph shape,
 * so meaning never relies on colour alone.
 */
export const STATUS: Record<
  AvailabilityStatus,
  { label: string; short: string; token: string; glyph: "dot" | "half" | "cross" | "dash" | "diamond"; bookable: boolean; rank: number }
> = {
  open: { label: "Books open", short: "Open", token: "var(--status-open)", glyph: "dot", bookable: true, rank: 0 },
  limited: { label: "Limited availability", short: "Limited", token: "var(--status-limited)", glyph: "half", bookable: true, rank: 1 },
  soon: { label: "Coming soon", short: "Soon", token: "var(--status-soon)", glyph: "diamond", bookable: false, rank: 2 },
  full: { label: "Fully booked", short: "Full", token: "var(--status-full)", glyph: "cross", bookable: false, rank: 3 },
  closed: { label: "Closed", short: "Closed", token: "var(--status-closed)", glyph: "dash", bookable: false, rank: 4 },
};

export const STATUS_ORDER: AvailabilityStatus[] = ["open", "limited", "full", "closed", "soon"];

export const STYLE_LABEL: Record<StyleTag, string> = {
  "black-grey": "Black & Grey",
  blackwork: "Blackwork",
  gothic: "Gothic",
  "american-traditional": "American Traditional",
  lettering: "Lettering",
  linework: "Linework",
  custom: "Custom",
};

export const STYLE_FILTERS: StyleTag[] = [
  "blackwork",
  "gothic",
  "black-grey",
  "american-traditional",
  "lettering",
  "linework",
  "custom",
];

export const KIND_LABEL: Record<StopKind, string> = {
  home: "Home studio",
  guest: "Guest spot",
  convention: "Convention",
  travel: "Travel",
};

export const ROMAN = ["I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX", "X", "XI", "XII", "XIII", "XIV", "XV", "XVI", "XVII", "XVIII", "XIX", "XX"];
