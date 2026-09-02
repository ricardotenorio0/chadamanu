import { NextResponse, type NextRequest } from "next/server";

import { handleRouteError, jsonError, requireAdmin } from "@/lib/api";
import { isUniqueViolation } from "@/lib/db";
import { deleteRsvp, getRsvpById, updateRsvp } from "@/lib/rsvp-repository";
import { COMPANIONS_MAX, NAME_MAX, NAME_MIN, NOTE_MAX, cleanName, isRsvpStatus } from "@/lib/rsvp-shared";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type Context = { params: Promise<{ id: string }> };

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export async function GET(_request: NextRequest, context: Context) {
  if (!(await requireAdmin())) return jsonError("Não autorizado.", 401);
  const { id } = await context.params;
  if (!UUID_RE.test(id)) return jsonError("Identificador inválido.", 400);

  try {
    const rsvp = await getRsvpById(id);
    if (!rsvp) return jsonError("Confirmação não encontrada.", 404);
    return NextResponse.json({ ok: true, rsvp });
  } catch (error) {
    return handleRouteError(error);
  }
}

export async function PATCH(request: NextRequest, context: Context) {
  if (!(await requireAdmin())) return jsonError("Não autorizado.", 401);
  const { id } = await context.params;
  if (!UUID_RE.test(id)) return jsonError("Identificador inválido.", 400);

  let body: Record<string, unknown>;
  try {
    body = (await request.json()) as Record<string, unknown>;
  } catch {
    return jsonError("Requisição inválida.", 400);
  }

  const patch: Parameters<typeof updateRsvp>[1] = {};

  if (body.name !== undefined) {
    const name = typeof body.name === "string" ? body.name.replace(/\s+/g, " ").trim() : "";
    if (name.length < NAME_MIN || name.length > NAME_MAX) {
      return jsonError(`O nome deve ter entre ${NAME_MIN} e ${NAME_MAX} caracteres.`, 400, {
        field: "name",
      });
    }
    patch.name = cleanName(name);
  }

  if (body.companions !== undefined) {
    const companions = Number(body.companions);
    if (!Number.isInteger(companions) || companions < 0 || companions > COMPANIONS_MAX) {
      return jsonError(`Acompanhantes deve ser um número entre 0 e ${COMPANIONS_MAX}.`, 400, {
        field: "companions",
      });
    }
    patch.companions = companions;
  }

  if (body.status !== undefined) {
    if (!isRsvpStatus(body.status)) return jsonError("Status inválido.", 400, { field: "status" });
    patch.status = body.status;
  }

  if (body.note !== undefined) {
    const note = typeof body.note === "string" ? body.note.trim() : "";
    if (note.length > NOTE_MAX) {
      return jsonError(`O recado deve ter ate ${NOTE_MAX} caracteres.`, 400, { field: "note" });
    }
    patch.note = note.length > 0 ? note : null;
  }

  try {
    const rsvp = await updateRsvp(id, patch);
    if (!rsvp) return jsonError("Confirmação não encontrada.", 404);
    return NextResponse.json({ ok: true, rsvp });
  } catch (error) {
    if (isUniqueViolation(error)) {
      return jsonError("Já existe uma confirmação com esse nome.", 409, { field: "name" });
    }
    return handleRouteError(error);
  }
}

export async function DELETE(_request: NextRequest, context: Context) {
  if (!(await requireAdmin())) return jsonError("Não autorizado.", 401);
  const { id } = await context.params;
  if (!UUID_RE.test(id)) return jsonError("Identificador inválido.", 400);

  try {
    const removed = await deleteRsvp(id);
    if (!removed) return jsonError("Confirmação não encontrada.", 404);
    return NextResponse.json({ ok: true });
  } catch (error) {
    return handleRouteError(error);
  }
}
