import type { Metadata, Viewport } from "next";
import "@fontsource/cormorant-garamond/400.css";
import "@fontsource/cormorant-garamond/500.css";
import "@fontsource/cormorant-garamond/400-italic.css";
import "@fontsource/ibm-plex-mono/400.css";
import "@fontsource-variable/inter-tight";
import "@/styles/globals.css";
import { SITE_DESCRIPTION, SITE_NAME, SITE_URL } from "@/lib/site";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: { default: "LOASH — Tattoo Artist · Windsor, Ontario", template: "%s · LOASH" },
  description: SITE_DESCRIPTION,
  applicationName: SITE_NAME,
  keywords: ["LOASH", "tattoo artist", "Windsor Ontario tattoo", "gothic tattoo", "blackwork", "black and grey tattoo", "American traditional tattoo", "custom tattoos"],
  openGraph: {
    type: "website",
    siteName: SITE_NAME,
    url: SITE_URL,
    title: "LOASH — Tattoo Artist · Windsor, Ontario",
    description: SITE_DESCRIPTION,
    images: [{ url: "/og.jpg", width: 1200, height: 630, alt: "LOASH" }],
  },
  twitter: { card: "summary_large_image", images: ["/og.jpg"] },
  icons: { icon: "/brand/icon.png", apple: "/brand/apple-icon.png" },
};

export const viewport: Viewport = {
  themeColor: "#09090a",
  colorScheme: "dark",
  viewportFit: "cover",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}

