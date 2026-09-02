import { redirect } from "next/navigation";

import { AdminDashboard } from "@/components/admin/AdminDashboard";
import { requireAdmin } from "@/lib/api";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  // O middleware já barra o acesso; esta checagem é a segunda camada.
  const session = await requireAdmin();
  if (!session) redirect("/admin/login");

  return <AdminDashboard />;
}
