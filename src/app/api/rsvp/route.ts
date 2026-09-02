import { NextResponse, type NextRequest } from "next/server";

import { handleRouteError, jsonError } from "@/lib/api";
import { checkRateLimit, clientIp } from "@/lib/rate-limit";
import { createOrUpdateRsvp } from "@/lib/rsvp-repository";
import { validateRsvpInput } from "@/lib/rsvp-shared";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export async function POST(request: NextRequest) {
  let body: Record<string, unknown>;
  try {
    body = (await request.json()) as Record<string, unknown>;
  } catch {
    return jsonError("Requisição inválida.", 400);
  }

  // Campo isca: preenchido apenas por robos. Responde com sucesso silencioso.
  if (typeof body.website === "string" && body.website.trim() !== "") {
    return NextResponse.json({ ok: true, mode: "duplicate" });
  }

  const validation = validateRsvpInput(body);
  if (!validation.ok) {
    return jsonError(validation.message, 400, { field: validation.field });
  }

  const limit = await checkRateLimit("rsvp", clientIp(request.headers), 8, 60 * 10);
  if (!limit.allowed) {
    return NextResponse.json(
      {
        ok: false,
        error: "Muitos envios em pouco tempo. Aguarde alguns minutos e tente novamente.",
      },
      { status: 429, headers: { "Retry-After": String(limit.retryAfterSeconds) } }
    );
  }

  const submissionId =
    typeof body.submissionId === "string" && UUID_RE.test(body.submissionId)
      ? body.submissionId
      : null;

  try {
    const result = await createOrUpdateRsvp({
      name: validation.name,
      companions: validation.companions,
      note: validation.note,
      submissionId,
    });

    return NextResponse.json(
      {
        ok: true,
        mode: result.mode,
        rsvp: {
          name: result.rsvp.name,
          companions: result.rsvp.companions,
          totalPeople: result.rsvp.totalPeople,
          createdAt: result.rsvp.createdAt,
        },
      },
      { status: result.mode === "created" ? 201 : 200 }
    );
  } catch (error) {
    return handleRouteError(error);
  }
}
