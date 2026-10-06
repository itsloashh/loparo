/**
 * Browser-side photo prep for uploads. Only crops and resizes — the artwork itself is never
 * altered. Produces the three renditions the site expects, a blur placeholder and a tone colour.
 */
export const WIDTHS = [480, 828, 1170] as const;

export interface ProcessedImage {
  width: number;
  height: number;
  blur: string;
  tone: string;
  previewUrl: string;
  renditions: { width: number; blob: Blob }[];
  trimmed: boolean;
}

/** Finds solid near-black letterbox bars (phone screenshots) at the top/bottom edges. */
function findBars(ctx: CanvasRenderingContext2D, w: number, h: number) {
  const data = ctx.getImageData(0, 0, w, h).data;
  const dark = (y: number) => {
    let max = 0, sum = 0, n = 0;
    for (let x = 0; x < w; x += Math.max(1, Math.floor(w / 120))) {
      const i = (y * w + x) * 4;
      const v = Math.max(data[i], data[i + 1], data[i + 2]);
      max = Math.max(max, v); sum += v; n++;
    }
    return max <= 40 && sum / n <= 12;
  };
  let top = 0, bottom = h;
  while (top < h * 0.45 && dark(top)) top++;
  while (bottom > h * 0.55 && dark(bottom - 1)) bottom--;
  // Only treat as bars if they're substantial (avoids trimming dark photos)
  if (top < h * 0.03) top = 0;
  if (h - bottom < h * 0.03) bottom = h;
  return { top, bottom };
}

const toBlob = (c: HTMLCanvasElement, q = 0.86) =>
  new Promise<Blob>((res, rej) =>
    c.toBlob((b) => {
      if (b && b.type === "image/webp") return res(b);
      // Older Safari can't encode WebP — fall back to JPEG (served with its real content type)
      c.toBlob((j) => (j ? res(j) : rej(new Error("Couldn't encode image"))), "image/jpeg", q);
    }, "image/webp", q),
  );

export async function processImage(file: File, opts: { trimBars: boolean }): Promise<ProcessedImage> {
  if (!file.type.startsWith("image/")) throw new Error("That file isn't an image.");
  let bmp: ImageBitmap;
  try {
    bmp = await createImageBitmap(file, { imageOrientation: "from-image" });
  } catch {
    throw new Error("This photo format can't be read here. Try exporting it as JPG.");
  }
  // Work at ≤2400px for speed
  const scale = Math.min(1, 2400 / Math.max(bmp.width, bmp.height));
  const W = Math.round(bmp.width * scale), H = Math.round(bmp.height * scale);
  const work = document.createElement("canvas");
  work.width = W; work.height = H;
  const wctx = work.getContext("2d", { willReadFrequently: true })!;
  wctx.drawImage(bmp, 0, 0, W, H);

  const { top, bottom } = opts.trimBars ? findBars(wctx, W, H) : { top: 0, bottom: H };
  const cropH = bottom - top;

  const renditions: { width: number; blob: Blob }[] = [];
  for (const target of WIDTHS) {
    const w = Math.min(target, W);
    const h = Math.round((cropH * w) / W);
    const c = document.createElement("canvas");
    c.width = w; c.height = h;
    const ctx = c.getContext("2d")!;
    ctx.imageSmoothingQuality = "high";
    ctx.drawImage(work, 0, top, W, cropH, 0, 0, w, h);
    renditions.push({ width: target, blob: await toBlob(c) });
  }

  // 16px blur placeholder + average tone
  const tiny = document.createElement("canvas");
  const tw = 16, th = Math.max(1, Math.round((cropH * 16) / W));
  tiny.width = tw; tiny.height = th;
  const tctx = tiny.getContext("2d", { willReadFrequently: true })!;
  tctx.drawImage(work, 0, top, W, cropH, 0, 0, tw, th);
  const px = tctx.getImageData(0, 0, tw, th).data;
  let r = 0, g = 0, b = 0;
  for (let i = 0; i < px.length; i += 4) { r += px[i]; g += px[i + 1]; b += px[i + 2]; }
  const n = px.length / 4;
  const hex = (v: number) => Math.round(v / n).toString(16).padStart(2, "0");

  const finalW = Math.min(1170, W);
  return {
    width: finalW,
    height: Math.round((cropH * finalW) / W),
    blur: tiny.toDataURL("image/jpeg", 0.5),
    tone: `#${hex(r)}${hex(g)}${hex(b)}`,
    previewUrl: URL.createObjectURL(renditions[renditions.length - 1].blob),
    renditions,
    trimmed: top > 0 || bottom < H,
  };
}

/** Uploads processed renditions through one-time signed URLs issued by the server. */
export async function uploadProcessed(
  img: ProcessedImage,
  folder: "tattoos" | "profile",
  createSlots: (folder: "tattoos" | "profile", widths: number[]) => Promise<{ ok: true; data?: { key: string; slots: { width: number; path: string; token: string }[] } } | { ok: false; error: string }>,
): Promise<string> {
  const res = await createSlots(folder, img.renditions.map((r) => r.width));
  if (!res.ok || !res.data) throw new Error(res.ok ? "Upload failed." : res.error);
  const { createClient } = await import("@supabase/supabase-js");
  const sb = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, { auth: { persistSession: false } });
  await Promise.all(
    res.data.slots.map(async (slot) => {
      const r = img.renditions.find((x) => x.width === slot.width)!;
      const { error } = await sb.storage.from("portfolio").uploadToSignedUrl(slot.path, slot.token, r.blob, { contentType: r.blob.type, cacheControl: "31536000" });
      if (error) throw new Error(`Upload failed: ${error.message}`);
    }),
  );
  return res.data.key;
}
