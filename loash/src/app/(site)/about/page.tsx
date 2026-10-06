import type { Metadata } from "next";
import { AboutView } from "@/components/about/AboutView";

export const metadata: Metadata = {
  title: "About Loash",
  description: "LOASH — tattoo artist in Windsor, Ontario working in black & grey, blackwork, gothic and American traditional. By appointment only.",
  alternates: { canonical: "/about" },
};

export default function Page() {
  return <AboutView />;
}
