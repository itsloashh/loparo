import type { InquiryStatus } from "@/lib/types";

/** Inquiry pipeline, in order. */
export const PIPELINE: { id: InquiryStatus; label: string; tone: string }[] = [
  { id: "new", label: "New", tone: "var(--color-silver)" },
  { id: "reviewing", label: "Reviewing", tone: "var(--color-soon)" },
  { id: "accepted", label: "Accepted", tone: "var(--color-open)" },
  { id: "deposit_required", label: "Deposit required", tone: "var(--color-limited)" },
  { id: "confirmed", label: "Confirmed", tone: "var(--color-open)" },
  { id: "completed", label: "Completed", tone: "var(--color-ash)" },
  { id: "declined", label: "Declined", tone: "var(--color-full)" },
];
