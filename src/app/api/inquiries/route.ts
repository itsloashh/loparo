import { NextResponse } from "next/server";
import type { InquiryInput } from "@/lib/types";
import { supabaseService } from "@/lib/data/supabase";
import { notifyNewInquiry } from "@/lib/notify";

const TYPES = ["custom", "portfolio", "flash", "cover-up", "other"];
const MAX_FILES = 5, MAX_BYTES = 10 * 1024 * 1024;

function validate(p: Partial<InquiryInput>): string | null {
  if (!p.type || !TYPES.includes(p.type)) return "Pick what you're looking for.";
  if (!p.placement) return "Choose a placement.";
  if (!p.size) return "Choose a size.";
  if (!p.idea || p.idea.trim().length < 20) return "Tell me a bit more about the idea.";
  if (!p.name?.trim()) return "Your name is required.";
  if (!p.email || !/^\S+@\S+\.\S+$/.test(p.email)) return "A valid email is required.";
  if (p.over18 !== true) return "You must be 18 or older.";
  return null;
}

export async function POST(req: Request) {
  let payload: Partial<InquiryInput>;
  let files: File[] = [];
  try {
    const fd = await req.formData();
    payload = JSON.parse(String(fd.get("payload") ?? "{}"));
    files = fd.getAll("files").filter((f): f is File => f instanceof File).slice(0, MAX_FILES);
  } catch {
    return NextResponse.json({ error: "Malformed request." }, { status: 400 });
  }
  const err = validate(payload);
  if (err) return NextResponse.json({ error: err }, { status: 422 });
  if (files.some((f) => f.size > MAX_BYTES || !f.type.startsWith("image/")))
    return NextResponse.json({ error: "References must be images under 10 MB." }, { status: 422 });

  const db = supabaseService();
  const summary = [
    `Type: ${payload.type}`, `Placement: ${payload.placement}`, `Size: ${payload.size}`,
    `Stop: ${payload.stopId ?? "flexible"}`, `Dates: ${payload.flexibleDates ? "flexible" : payload.preferredDates?.join(", ")}`,
    `Reference piece: ${payload.referenceTattooId ?? "—"}`, `Contact: ${payload.name} <${payload.email}> ${payload.phone ?? ""} ${payload.instagram ?? ""}`,
    "", payload.idea,
  ].join("\n");

  if (!db) {
    // No database yet: accept, log, and (optionally) email so nothing is lost.
    console.info("[loash] inquiry (no database configured)\n" + summary);
    await notifyNewInquiry({ name: payload.name!, email: payload.email!, summary });
    return NextResponse.json({ ok: true, mode: process.env.RESEND_API_KEY ? "live" : "demo" });
  }

  const { data, error } = await db
    .from("inquiries")
    .insert({
      type: payload.type, reference_tattoo_id: payload.referenceTattooId, placement: payload.placement, size: payload.size,
      schedule_id: payload.stopId, preferred_dates: payload.preferredDates ?? [], flexible_dates: !!payload.flexibleDates,
      idea: payload.idea, name: payload.name, email: payload.email, phone: payload.phone, instagram: payload.instagram, status: "new",
    })
    .select("id")
    .single();
  if (error) {
    console.error(error);
    return NextResponse.json({ error: "Couldn't save your request. Please try again." }, { status: 500 });
  }

  const paths: string[] = [];
  for (const [i, f] of files.entries()) {
    const ext = (f.name.split(".").pop() || "jpg").toLowerCase().replace(/[^a-z0-9]/g, "");
    const path = `${data.id}/${i}.${ext}`;
    const up = await db.storage.from("inquiry-references").upload(path, f, { contentType: f.type });
    if (!up.error) paths.push(path);
  }
  if (paths.length) await db.from("inquiries").update({ reference_paths: paths }).eq("id", data.id);

  await notifyNewInquiry({ id: data.id, name: payload.name!, email: payload.email!, summary });
  return NextResponse.json({ ok: true, mode: "live", id: data.id });
}
