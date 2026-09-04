import { NextResponse, type NextRequest } from "next/server";

import { handleRouteError, jsonError, requireAdmin } from "@/lib/api";
import { createOrUpdateRsvp, listRsvps, type ListOptions } from "@/lib/rsvp-repository";
import { isRsvpStatus, validateRsvpInput } from "@/lib/rsvp-shared";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const SORTS = ["created_at", "name", "companions", "total"] as const;

export async function GET(request: NextRequest) {
  if (!(await requireAdmin())) return jsonError("Não autorizado.", 401);

  const params = request.nextUrl.searchParams;
  const sortParam = params.get("sort");
  const statusParam = params.get("status");

  const options: ListOptions = {
    search: params.get("search") ?? undefined,
    status: statusParam && isRsvpStatus(statusParam) ? statusParam : "all",
    sort: (SORTS as readonly string[]).includes(sortParam ?? "")
      ? (sortParam as ListOptions["sort"])
      : "created_at",
    direction: params.get("direction") === "asc" ? "asc" : "desc",
    page: Number(params.get("page") ?? 1) || 1,
    pageSize: Number(params.get("pageSize") ?? 50) || 50,
  };

  try {
    const result = await listRsvps(options);
    return NextResponse.json({ ok: true, ...result });
  } catch (error) {
    return handleRouteError(error, { detailed: true });
  }
}

/** Permite que o organizador adicione uma confirmação manualmente pelo painel. */
export async function POST(request: NextRequest) {
  if (!(await requireAdmin())) return jsonError("Não autorizado.", 401);

  let body: Record<string, unknown>;
  try {
    body = (await request.json()) as Record<string, unknown>;
  } catch {
    return jsonError("Requisição inválida.", 400);
  }

  const validation = validateRsvpInput(body);
  if (!validation.ok) return jsonError(validation.message, 400, { field: validation.field });

  try {
    const result = await createOrUpdateRsvp({
      name: validation.name,
      companions: validation.companions,
      note: validation.note,
      submissionId: null,
    });
    return NextResponse.json({ ok: true, mode: result.mode, rsvp: result.rsvp }, { status: 201 });
  } catch (error) {
    return handleRouteError(error, { detailed: true });
  }
}
