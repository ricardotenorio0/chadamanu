import "server-only";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

import { SESSION_COOKIE, verifySessionToken, type SessionPayload } from "@/lib/auth";
import { DatabaseNotConfiguredError } from "@/lib/db";

export function jsonError(message: string, status: number, extra?: Record<string, unknown>) {
  return NextResponse.json({ ok: false, error: message, ...extra }, { status });
}

/** Garante que a requisição veio de um administrador autenticado. */
export async function requireAdmin(): Promise<SessionPayload | null> {
  const store = await cookies();
  return verifySessionToken(store.get(SESSION_COOKIE)?.value);
}

/**
 * Falhas de instalação que valem uma mensagem própria: sem elas o painel diz
 * só "tente novamente" e quem está configurando o site fica sem pista.
 * O código vem do próprio PostgreSQL; a mensagem não expõe host nem senha.
 */
const SETUP_ERRORS: Record<string, string> = {
  // undefined_table
  "42P01":
    "O banco está conectado, mas as tabelas ainda não existem. Rode as migrations (npm run db:migrate).",
  // invalid_password
  "28P01": "O banco recusou as credenciais. Confira a senha na DATABASE_URL.",
  // invalid_catalog_name
  "3D000": "O banco informado na DATABASE_URL não existe.",
  ENOTFOUND: "O servidor do banco não foi encontrado. Confira o host na DATABASE_URL.",
  ECONNREFUSED: "O servidor do banco recusou a conexão. Confira host e porta na DATABASE_URL.",
};

function setupHint(error: unknown): string | null {
  if (typeof error !== "object" || error === null || !("code" in error)) return null;
  const code = (error as { code?: string }).code;
  return (code && SETUP_ERRORS[code]) ?? null;
}

/**
 * Converte o erro em resposta. `detailed` só é ligado nas rotas do painel, que
 * exigem sessão: para o convidado a mensagem continua genérica.
 */
export function handleRouteError(error: unknown, options?: { detailed?: boolean }) {
  if (error instanceof DatabaseNotConfiguredError) {
    console.error("[db]", error.message);
    return jsonError(
      "O banco de dados ainda não foi configurado. Verifique a variável DATABASE_URL.",
      503
    );
  }

  console.error("[api]", error);

  const hint = setupHint(error);
  if (hint) {
    // O 503 diz "o serviço ainda não está pronto", que é o caso aqui.
    if (options?.detailed) return jsonError(hint, 503);
    return jsonError(
      "O sistema de confirmações está fora do ar no momento. Avise a família e tente mais tarde.",
      503
    );
  }

  return jsonError("Não foi possível completar a operação. Tente novamente.", 500);
}
