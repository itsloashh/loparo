/**
 * Admin sessions — Supabase Auth (email + password) stored in cookies via @supabase/ssr.
 * Server-only: used by admin pages, server actions and the proxy.
 */
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { createServerClient } from "@supabase/ssr";
import { supabaseConfigured, supabaseService } from "@/lib/data/supabase";

export type AdminUser = { id: string; email: string; demo?: boolean };

/** Local UI preview without a database: ADMIN_DEMO=1 (never active in production). */
export const demoMode = () => !supabaseConfigured() && process.env.ADMIN_DEMO === "1" && process.env.VERCEL !== "1";

export async function supabaseSession() {
  const store = await cookies();
  return createServerClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, {
    cookies: {
      getAll: () => store.getAll(),
      setAll: (list) => {
        try {
          list.forEach(({ name, value, options }) => store.set(name, value, options));
        } catch {
          // called from a Server Component — the proxy refreshes cookies instead
        }
      },
    },
  });
}

const allowlist = () =>
  (process.env.ADMIN_EMAILS ?? "").split(",").map((e) => e.trim().toLowerCase()).filter(Boolean);

/** Is this signed-in user allowed into the admin? (admins table or ADMIN_EMAILS) */
export async function isAdminUser(id: string, email: string | undefined) {
  if (email && allowlist().includes(email.toLowerCase())) return true;
  const db = supabaseService();
  if (!db) return false;
  const { data } = await db.from("admins").select("user_id").eq("user_id", id).maybeSingle();
  return !!data;
}

export async function getAdmin(): Promise<AdminUser | null> {
  if (demoMode()) return { id: "demo", email: "demo@loash.local", demo: true };
  if (!supabaseConfigured()) return null;
  const sb = await supabaseSession();
  const { data } = await sb.auth.getUser();
  const user = data.user;
  if (!user) return null;
  return (await isAdminUser(user.id, user.email)) ? { id: user.id, email: user.email ?? "" } : null;
}

export async function requireAdmin(): Promise<AdminUser> {
  const a = await getAdmin();
  if (!a) redirect("/admin/login");
  return a;
}
