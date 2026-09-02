import { NextResponse, type NextRequest } from "next/server";

import { jsonError } from "@/lib/api";
import {
  SESSION_COOKIE,
  checkAdminCredentials,
  createSessionToken,
  getAdminUsername,
  sessionCookieOptions,
} from "@/lib/auth";
import { checkRateLimit, clientIp } from "@/lib/rate-limit";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  let body: Record<string, unknown>;
  try {
    body = (await request.json()) as Record<string, unknown>;
  } catch {
    return jsonError("Requisição inválida.", 400);
  }

  const username =
    typeof body.username === "string" && body.username.trim() !== ""
      ? body.username.trim()
      : getAdminUsername();
  const password = typeof body.password === "string" ? body.password : "";

  if (password.length === 0) {
    return jsonError("Informe a senha de acesso.", 400);
  }

  const limit = await checkRateLimit("admin-login", clientIp(request.headers), 8, 60 * 15);
  if (!limit.allowed) {
    return NextResponse.json(
      {
        ok: false,
        error: `Muitas tentativas. Tente novamente em ${Math.ceil(limit.retryAfterSeconds / 60)} minuto(s).`,
      },
      { status: 429, headers: { "Retry-After": String(limit.retryAfterSeconds) } }
    );
  }

  let valid = false;
  try {
    valid = checkAdminCredentials(username, password);
  } catch (error) {
    console.error("[auth]", error);
    return jsonError(
      "Acesso administrativo não configurado. Defina ADMIN_PASSWORD e SESSION_SECRET.",
      503
    );
  }

  if (!valid) {
    return jsonError("Usuário ou senha incorretos.", 401);
  }

  let token: string;
  try {
    token = await createSessionToken(getAdminUsername());
  } catch (error) {
    console.error("[auth]", error);
    return jsonError("Sessão não pode ser criada. Verifique a variável SESSION_SECRET.", 503);
  }

  const response = NextResponse.json({ ok: true });
  response.cookies.set(SESSION_COOKIE, token, sessionCookieOptions());
  return response;
}
