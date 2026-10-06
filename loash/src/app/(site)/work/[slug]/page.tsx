import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getSnapshot } from "@/lib/data";
import { STYLE_LABEL } from "@/lib/status";
import { WorkView } from "@/components/work/WorkView";

export async function generateStaticParams() {
  const s = await getSnapshot();
  return s.tattoos.map((t) => ({ slug: t.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const t = (await getSnapshot()).tattoos.find((x) => x.slug === slug);
  if (!t) return {};
  const styles = t.styles.map((s) => STYLE_LABEL[s]).join(", ");
  return {
    title: `${t.title} — ${styles} tattoo`,
    description: `${t.description} Tattooed by LOASH.`,
    alternates: { canonical: `/work/${t.slug}` },
    openGraph: { images: [{ url: `${t.image.src}-${t.image.width >= 1170 ? 1170 : 828}.webp`, width: t.image.width, height: t.image.height, alt: t.alt }] },
  };
}

export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const t = (await getSnapshot()).tattoos.find((x) => x.slug === slug);
  if (!t) notFound();
  return <WorkView initialSlug={slug} />;
}
