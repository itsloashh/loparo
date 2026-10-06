import { getAdminData } from "@/lib/admin/data";
import { InquiriesManager } from "@/components/admin/InquiriesManager";

export const metadata = { title: "Inbox" };

export default async function Page() {
  const d = await getAdminData();
  return <InquiriesManager inquiries={d.inquiries} tattoos={d.tattoos} stops={d.stops} locations={d.locations} />;
}
