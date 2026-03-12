import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Loparo — AI Workflow Automation",
  description:
    "Intelligent automation systems that capture leads, follow up with AI, sync your CRM, and keep your team in the loop. Built for revenue-generating founders.",
  metadataBase: new URL("https://loparo.ca"),
  openGraph: {
    title: "Loparo — AI Workflow Automation",
    description:
      "Automate your business with agentic powered workflows. Intelligent systems for lead capture, AI follow-up, CRM sync, and team notifications.",
    url: "https://loparo.ca",
    siteName: "Loparo",
    type: "website",
    images: [{ url: "/og-image.jpg", width: 1200, height: 630 }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Loparo — AI Workflow Automation",
    description: "Agentic workflow automation for modern founders.",
    images: ["/og-image.jpg"],
  },
  icons: {
    icon: [
      {
        url: "data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><rect fill='%23006039' rx='16' width='100' height='100'/><text x='50' y='68' font-family='serif' font-size='52' fill='%23A37E2C' text-anchor='middle'>L</text></svg>",
        type: "image/svg+xml",
      },
    ],
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              try {
                if (localStorage.getItem('loparo-theme') === 'dark') {
                  document.documentElement.classList.add('dark');
                }
              } catch(e) {}
            `,
          }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "ProfessionalService",
              name: "Loparo",
              url: "https://loparo.ca",
              description:
                "AI workflow automation studio building intelligent systems for modern founders.",
              founder: { "@type": "Person", name: "Lo Paroian" },
              areaServed: "Worldwide",
              serviceType: [
                "Workflow Automation",
                "AI Integration",
                "Lead Generation Systems",
                "CRM Automation",
              ],
              address: {
                "@type": "PostalAddress",
                addressLocality: "Windsor",
                addressRegion: "Ontario",
                addressCountry: "CA",
              },
            }),
          }}
        />
      </head>
      <body className="bg-bg dark:bg-bg-dark text-txt dark:text-txt-dark">
        {children}
      </body>
    </html>
  );
}
