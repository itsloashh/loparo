import type { MetadataRoute } from "next";
import { getSnapshot } from "@/lib/data";
import { SITE_URL } from "@/lib/site";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const s = await getSnapshot();
  const now = new Date();
  return [
    ...["", "/work", "/map", "/schedule", "/about", "/book"].map((p) => ({ url: `${SITE_URL}${p}`, lastModified: now })),
    ...s.tattoos.map((t) => ({ url: `${SITE_URL}/work/${t.slug}`, lastModified: now, images: [`${SITE_URL}${t.image.src}-1170.webp`] })),
  ];
}
