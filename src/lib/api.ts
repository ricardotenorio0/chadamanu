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

export function handleRouteError(error: unknown) {
  if (error instanceof DatabaseNotConfiguredError) {
    console.error("[db]", error.message);
    return jsonError(
      "O banco de dados ainda não foi configurado. Verifique a variável DATABASE_URL.",
      503
    );
  }
  console.error("[api]", error);
  return jsonError("Não foi possível completar a operação. Tente novamente.", 500);
}
