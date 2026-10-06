import { getAdminData } from "@/lib/admin/data";
import { WorkManager } from "@/components/admin/WorkManager";

export const metadata = { title: "Work" };

export default async function Page() {
  const d = await getAdminData();
  return <WorkManager initial={d.tattoos} />;
}
