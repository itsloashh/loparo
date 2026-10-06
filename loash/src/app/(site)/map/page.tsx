import type { Metadata } from "next";
import { MapView } from "@/components/map/MapView";

export const metadata: Metadata = {
  title: "Where I'll Be — Tattoo Guest Spots & Travel",
  description: "See where LOASH is tattooing next — Windsor home studio, guest spots and travel — with live booking status for every city.",
  alternates: { canonical: "/map" },
};

export default function Page() {
  return <MapView />;
}
