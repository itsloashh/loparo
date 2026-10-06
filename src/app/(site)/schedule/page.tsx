import type { Metadata } from "next";
import { ScheduleView } from "@/components/schedule/ScheduleView";

export const metadata: Metadata = {
  title: "Schedule & Availability",
  description: "LOASH's tattoo schedule: dates, cities and live availability. Pick an open day and request it.",
  alternates: { canonical: "/schedule" },
};

export default function Page() {
  return <ScheduleView />;
}
