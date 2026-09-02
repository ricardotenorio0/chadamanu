import { NextResponse, type NextRequest } from "next/server";

import { SESSION_COOKIE, verifySessionToken } from "@/lib/auth";

/**
 * Primeira barreira do painel administrativo.
 * As rotas de API também validam a sessão por conta própria (defesa em camadas).
 */
export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const isPublicApi =
    pathname === "/api/admin/login" ||
    pathname === "/api/admin/logout" ||
    pathname === "/api/admin/session";

  if (isPublicApi) return NextResponse.next();

  const session = await verifySessionToken(request.cookies.get(SESSION_COOKIE)?.value);

  if (pathname === "/admin/login") {
    if (session) return NextResponse.redirect(new URL("/admin", request.url));
    return NextResponse.next();
  }

  if (session) return NextResponse.next();

  if (pathname.startsWith("/api/")) {
    return NextResponse.json({ ok: false, error: "Não autorizado." }, { status: 401 });
  }

  return NextResponse.redirect(new URL("/admin/login", request.url));
}

export const config = {
  matcher: ["/admin", "/admin/:path*", "/api/admin/:path*"],
};
