import type { Metadata } from "next";
import { WorkView } from "@/components/work/WorkView";

export const metadata: Metadata = {
  title: "The Work — Tattoo Archive",
  description: "Real tattoos by LOASH, photographed unretouched: blackwork, black & grey, gothic, American traditional and fine linework.",
  alternates: { canonical: "/work" },
};

export default function Page() {
  return <WorkView />;
}
