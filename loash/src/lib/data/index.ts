/**
 * Data access entry point (server side).
 * Every page reads ONE snapshot from here; home, work, map, schedule and booking
 * all derive from the same source, so they can never disagree.
 *
 * Supabase env vars present → live database. Otherwise → bundled sample data.
 */
import { cache } from "react";
import type { Snapshot } from "../types";
import { sampleSnapshot } from "./sample";
import { supabaseConfigured, supabaseSnapshot } from "./supabase";

export const getSnapshot = cache(async (): Promise<Snapshot> => {
  if (!supabaseConfigured()) return sampleSnapshot();
  try {
    return await supabaseSnapshot();
  } catch (err) {
    console.error("[loash] Supabase read failed, serving sample data", err);
    return sampleSnapshot();
  }
});
