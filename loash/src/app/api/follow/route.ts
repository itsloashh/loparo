import { NextResponse } from "next/server";
import { supabaseService } from "@/lib/data/supabase";

/** FOLLOW LOASH — stores city subscriptions. The "books opened" notifier is a future job. */
export async function POST(req: Request) {
  const body = await req.json().catch(() => null) as { email?: string; locationIds?: string[] } | null;
  if (!body?.email || !/^\S+@\S+\.\S+$/.test(body.email) || !body.locationIds?.length)
    return NextResponse.json({ error: "Add an email and at least one city." }, { status: 422 });
  const db = supabaseService();
  if (!db) return NextResponse.json({ ok: true, mode: "demo" });
  const rows = body.locationIds.slice(0, 20).map((location_id) => ({ email: body.email!.toLowerCase(), location_id }));
  const { error } = await db.from("follows").upsert(rows, { onConflict: "email,location_id" });
  if (error) return NextResponse.json({ error: "Couldn't save that — try again." }, { status: 500 });
  return NextResponse.json({ ok: true, mode: "live" });
}
