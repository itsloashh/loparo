import { getAdminData } from "@/lib/admin/data";
import { ScheduleManager } from "@/components/admin/ScheduleManager";

export const metadata = { title: "Schedule" };

export default async function Page() {
  const d = await getAdminData();
  return <ScheduleManager locations={d.locations} stops={d.stops} days={d.days} />;
}
