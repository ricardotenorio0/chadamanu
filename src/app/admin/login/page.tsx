import Link from "next/link";
import { redirect } from "next/navigation";

import { LoginForm } from "@/components/admin/LoginForm";
import { HeartIcon } from "@/components/Icons";
import { requireAdmin } from "@/lib/api";
import { isAdminConfigured } from "@/lib/auth";

export const dynamic = "force-dynamic";

export const metadata = { title: "Acesso restrito" };

export default async function AdminLoginPage() {
  if (await requireAdmin()) redirect("/admin");

  const configured = isAdminConfigured();

  return (
    <main className="login">
      <div className="login__panel">
        <span className="login__mark" aria-hidden="true">
          <HeartIcon />
        </span>
        <p className="login__name script">Manuela</p>
        <p className="login__tag">Painel de confirmações</p>

        {configured ? (
          <LoginForm />
        ) : (
          <p className="notice notice--error" style={{ marginTop: "2.5rem" }}>
            O acesso administrativo ainda não foi configurado. Defina as variáveis de ambiente
            <code> ADMIN_PASSWORD </code> e <code> SESSION_SECRET </code> antes de entrar.
          </p>
        )}

        <Link className="login__back" href="/">
          Voltar ao convite
        </Link>
      </div>
    </main>
  );
}
