import { NextResponse } from "next/server";

import { handleRouteError, jsonError, requireAdmin } from "@/lib/api";
import { listAllRsvpsForExport } from "@/lib/rsvp-repository";
import { STATUS_LABEL } from "@/lib/rsvp-shared";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** Escapa um valor para CSV (RFC 4180). */
function csvCell(value: string | number): string {
  const text = String(value ?? "");
  return /[";\n\r]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
}

const dateFormatter = new Intl.DateTimeFormat("pt-BR", {
  dateStyle: "short",
  timeStyle: "short",
  timeZone: "America/Sao_Paulo",
});

export async function GET() {
  if (!(await requireAdmin())) return jsonError("Não autorizado.", 401);

  try {
    const rsvps = await listAllRsvpsForExport();

    const header = [
      "Nome",
      "Acompanhantes",
      "Total de pessoas",
      "Status",
      "Recado",
      "Confirmado em",
    ];

    const lines = [
      header.join(";"),
      ...rsvps.map((rsvp) =>
        [
          csvCell(rsvp.name),
          rsvp.companions,
          rsvp.totalPeople,
          STATUS_LABEL[rsvp.status],
          csvCell(rsvp.note ?? ""),
          dateFormatter.format(new Date(rsvp.createdAt)),
        ].join(";")
      ),
    ];

    // BOM para o Excel reconhecer UTF-8 corretamente.
    const csv = "﻿" + lines.join("\r\n") + "\r\n";
    const stamp = new Date().toISOString().slice(0, 10);

    return new NextResponse(csv, {
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="confirmacoes-manuela-${stamp}.csv"`,
        "Cache-Control": "no-store",
      },
    });
  } catch (error) {
    return handleRouteError(error, { detailed: true });
  }
}
