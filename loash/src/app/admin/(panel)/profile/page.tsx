import { getAdminData } from "@/lib/admin/data";
import { ProfileEditor } from "@/components/admin/ProfileEditor";

export const metadata = { title: "Profile" };

export default async function Page() {
  const d = await getAdminData();
  return <ProfileEditor profile={d.profile} />;
}
