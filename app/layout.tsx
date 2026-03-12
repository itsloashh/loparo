import type { Metadata } from "next";
import "./globals.css";
export const metadata: Metadata = {
  title: "Loparo — Agentic Workflow Automation",
  description: "Intelligent automation systems that capture leads, follow up with AI, sync your CRM, and keep your team in the loop.",
  metadataBase: new URL("https://loparo.ca"),
  openGraph: { title: "Loparo — Agentic Workflow Automation", description: "Automate your business with agentic powered workflows.", url: "https://loparo.ca", siteName: "Loparo", type: "website", images: [{ url: "/og-image.jpg", width: 1200, height: 630 }] },
  twitter: { card: "summary_large_image", title: "Loparo — Agentic Workflow Automation", images: ["/og-image.jpg"] },
  icons: { icon: [{ url: "data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><rect fill='%23D4A843' rx='20' width='100' height='100'/><text x='50' y='68' font-family='serif' font-size='52' fill='%23060911' text-anchor='middle'>L</text></svg>", type: "image/svg+xml" }] },
};
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en"><head>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({ "@context": "https://schema.org", "@type": "ProfessionalService", name: "Loparo", url: "https://loparo.ca", description: "AI workflow automation studio for modern founders.", founder: { "@type": "Person", name: "Lagan Paroian" }, areaServed: "Worldwide", serviceType: ["Workflow Automation", "AI Integration", "Lead Generation Systems"], address: { "@type": "PostalAddress", addressLocality: "Windsor", addressRegion: "Ontario", addressCountry: "CA" } }) }} />
    </head><body>{children}</body></html>
  );
}
