import { getSnapshot } from "@/lib/data";
import { todayISO } from "@/lib/dates";
import { SITE_DESCRIPTION, SITE_URL } from "@/lib/site";
import { NextProviders } from "@/components/shell/NextProviders";

// Public pages are static and refresh every 5 minutes; admin saves also revalidate instantly.
export const revalidate = 300;

export default async function SiteLayout({ children }: { children: React.ReactNode }) {
  const snapshot = await getSnapshot();
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "TattooParlor",
    name: "LOASH",
    url: SITE_URL,
    description: SITE_DESCRIPTION,
    image: `${SITE_URL}/og.jpg`,
    address: { "@type": "PostalAddress", addressLocality: "Windsor", addressRegion: "ON", addressCountry: "CA" },
    sameAs: snapshot.artist.socials.map((s) => s.href),
  };
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <NextProviders snapshot={snapshot} today={todayISO()}>{children}</NextProviders>
    </>
  );
}
