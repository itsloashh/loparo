import type { ImageAsset } from "./types";

export const RENDITIONS = [480, 828, 1170] as const;

/**
 * Every image (bundled or uploaded through the admin) exists at three fixed widths:
 * `${src}-480.webp`, `${src}-828.webp`, `${src}-1170.webp`. No paid image-transform service needed.
 */
export function srcSet(img: ImageAsset): string {
  return RENDITIONS.filter((w) => w <= Math.max(img.width, RENDITIONS[0])).map((w) => `${asset(img.src)}-${w}.webp ${w}w`).join(", ");
}

export function src(img: ImageAsset, w: (typeof RENDITIONS)[number] = 828): string {
  const best = RENDITIONS.filter((r) => r <= Math.max(img.width, RENDITIONS[0]));
  const pick = best.includes(w) ? w : best[best.length - 1];
  return `${asset(img.src)}-${pick}.webp`;
}

/** Static preview builds are served from a sub-path; Next serves from root. */
let base = "";
export function setAssetBase(b: string) { base = b; }
export function asset(path: string) { return base && path.startsWith("/") ? base + path.slice(1) : path; }

/** Public URL base for a key in the 'portfolio' bucket. */
export function storageBase(key: string) {
  return `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/portfolio/${key}`;
}
