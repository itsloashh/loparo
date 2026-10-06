import { requireAdmin } from "@/lib/admin/session";
import { getAdminData } from "@/lib/admin/data";
import { AdminShell } from "@/components/admin/AdminShell";

export const dynamic = "force-dynamic";

export default async function PanelLayout({ children }: { children: React.ReactNode }) {
  const admin = await requireAdmin();
  const data = await getAdminData();
  const fresh = data.inquiries.filter((i) => i.status === "new").length;
  return (
    <AdminShell email={admin.email} newCount={fresh} demo={data.demo}>
      {children}
    </AdminShell>
  );
}
