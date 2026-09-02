import "server-only";

import { getDb, isUniqueViolation } from "@/lib/db";
import {
  COMPANIONS_MAX,
  normalizeName,
  type Rsvp,
  type RsvpStats,
  type RsvpStatus,
} from "@/lib/rsvp-shared";

type Row = {
  id: string;
  name: string;
  companions: number;
  status: RsvpStatus;
  note: string | null;
  created_at: string | Date;
  updated_at: string | Date;
};

function toIso(value: string | Date): string {
  return value instanceof Date ? value.toISOString() : new Date(value).toISOString();
}

function mapRow(row: Row): Rsvp {
  return {
    id: row.id,
    name: row.name,
    companions: Number(row.companions),
    status: row.status,
    note: row.note,
    createdAt: toIso(row.created_at),
    updatedAt: toIso(row.updated_at),
    totalPeople: 1 + Number(row.companions),
  };
}

const SELECT_COLUMNS = "id, name, companions, status, note, created_at, updated_at";

/** Executa uma consulta parametrizada e devolve as linhas já tipadas. */
async function query<T>(text: string, params: unknown[] = []): Promise<T[]> {
  const db = await getDb();
  return db.query<T>(text, params);
}

export type CreateRsvpResult = {
  rsvp: Rsvp;
  mode: "created" | "updated" | "duplicate";
};

/**
 * Grava a confirmação de forma idempotente.
 *
 * 1. `submissionId` repetido (duplo clique, retry de rede) devolve o registro existente.
 * 2. Mesmo nome já confirmado atualiza o registro em vez de duplicar.
 */
export async function createOrUpdateRsvp(input: {
  name: string;
  companions: number;
  note: string | null;
  submissionId: string | null;
}): Promise<CreateRsvpResult> {
  const nameKey = normalizeName(input.name);

  if (input.submissionId) {
    const existing = await query<Row>(
      `SELECT ${SELECT_COLUMNS} FROM rsvps WHERE submission_id = $1 LIMIT 1`,
      [input.submissionId]
    );
    if (existing.length > 0) {
      return { rsvp: mapRow(existing[0]), mode: "duplicate" };
    }
  }

  const upsert = `
    INSERT INTO rsvps (name, name_key, companions, note, submission_id, status)
    VALUES ($1, $2, $3, $4, $5, 'confirmed')
    ON CONFLICT (name_key) DO UPDATE
       SET name          = EXCLUDED.name,
           companions    = EXCLUDED.companions,
           note          = COALESCE(EXCLUDED.note, rsvps.note),
           submission_id = COALESCE(EXCLUDED.submission_id, rsvps.submission_id),
           status        = 'confirmed'
    RETURNING ${SELECT_COLUMNS}, (xmax = 0) AS inserted
  `;

  const params = [
    input.name,
    nameKey,
    Math.min(input.companions, COMPANIONS_MAX),
    input.note,
    input.submissionId,
  ];

  try {
    const rows = await query<Row & { inserted: boolean }>(upsert, params);
    const row = rows[0];
    return { rsvp: mapRow(row), mode: row.inserted ? "created" : "updated" };
  } catch (error) {
    // Corrida entre dois envios simultâneos com o mesmo submission_id.
    if (isUniqueViolation(error) && input.submissionId) {
      const rows = await query<Row>(
        `SELECT ${SELECT_COLUMNS} FROM rsvps WHERE submission_id = $1 LIMIT 1`,
        [input.submissionId]
      );
      if (rows.length > 0) return { rsvp: mapRow(rows[0]), mode: "duplicate" };
    }
    throw error;
  }
}

export type ListOptions = {
  search?: string;
  status?: RsvpStatus | "all";
  sort?: "created_at" | "name" | "companions" | "total";
  direction?: "asc" | "desc";
  page?: number;
  pageSize?: number;
};

export type ListResult = {
  items: Rsvp[];
  total: number;
  page: number;
  pageSize: number;
  pageCount: number;
  stats: RsvpStats;
};

const SORT_COLUMNS: Record<NonNullable<ListOptions["sort"]>, string> = {
  created_at: "created_at",
  name: "name_key",
  companions: "companions",
  total: "(companions + 1)",
};

export async function listRsvps(options: ListOptions = {}): Promise<ListResult> {
  const page = Math.max(1, Math.floor(options.page ?? 1));
  const pageSize = Math.min(200, Math.max(5, Math.floor(options.pageSize ?? 50)));
  const sortColumn = SORT_COLUMNS[options.sort ?? "created_at"] ?? "created_at";
  const direction = options.direction === "asc" ? "ASC" : "DESC";

  const conditions: string[] = [];
  const params: unknown[] = [];

  const search = options.search?.trim();
  if (search) {
    params.push(`%${normalizeName(search)}%`);
    conditions.push(`name_key LIKE $${params.length}`);
  }
  if (options.status && options.status !== "all") {
    params.push(options.status);
    conditions.push(`status = $${params.length}`);
  }

  const where = conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";

  params.push(pageSize, (page - 1) * pageSize);
  const limitParam = params.length - 1;
  const offsetParam = params.length;

  const [items, totals, stats] = await Promise.all([
    query<Row>(
      `SELECT ${SELECT_COLUMNS} FROM rsvps ${where}
        ORDER BY ${sortColumn} ${direction}, created_at DESC
        LIMIT $${limitParam} OFFSET $${offsetParam}`,
      params
    ),
    query<{ total: number }>(
      `SELECT count(*)::int AS total FROM rsvps ${where}`,
      params.slice(0, params.length - 2)
    ),
    getStats(),
  ]);

  const total = totals[0]?.total ?? 0;

  return {
    items: items.map(mapRow),
    total,
    page,
    pageSize,
    pageCount: Math.max(1, Math.ceil(total / pageSize)),
    stats,
  };
}

export async function getStats(): Promise<RsvpStats> {
  const rows = await query<{
    entries: number;
    confirmed_entries: number;
    pending_entries: number;
    cancelled_entries: number;
    companions: number;
  }>(`
    SELECT
      count(*)::int                                                              AS entries,
      count(*) FILTER (WHERE status = 'confirmed')::int                          AS confirmed_entries,
      count(*) FILTER (WHERE status = 'pending')::int                            AS pending_entries,
      count(*) FILTER (WHERE status = 'cancelled')::int                          AS cancelled_entries,
      COALESCE(sum(companions) FILTER (WHERE status = 'confirmed'), 0)::int      AS companions
    FROM rsvps
  `);

  const row = rows[0] ?? {
    entries: 0,
    confirmed_entries: 0,
    pending_entries: 0,
    cancelled_entries: 0,
    companions: 0,
  };

  return {
    entries: row.entries,
    confirmedEntries: row.confirmed_entries,
    pendingEntries: row.pending_entries,
    cancelledEntries: row.cancelled_entries,
    guests: row.confirmed_entries,
    companions: row.companions,
    totalPeople: row.confirmed_entries + row.companions,
  };
}

export async function getRsvpById(id: string): Promise<Rsvp | null> {
  const rows = await query<Row>(`SELECT ${SELECT_COLUMNS} FROM rsvps WHERE id = $1`, [id]);
  return rows.length > 0 ? mapRow(rows[0]) : null;
}

export async function updateRsvp(
  id: string,
  patch: { name?: string; companions?: number; status?: RsvpStatus; note?: string | null }
): Promise<Rsvp | null> {
  const sets: string[] = [];
  const params: unknown[] = [];

  if (patch.name !== undefined) {
    params.push(patch.name);
    sets.push(`name = $${params.length}`);
    params.push(normalizeName(patch.name));
    sets.push(`name_key = $${params.length}`);
  }
  if (patch.companions !== undefined) {
    params.push(patch.companions);
    sets.push(`companions = $${params.length}`);
  }
  if (patch.status !== undefined) {
    params.push(patch.status);
    sets.push(`status = $${params.length}`);
  }
  if (patch.note !== undefined) {
    params.push(patch.note);
    sets.push(`note = $${params.length}`);
  }

  if (sets.length === 0) return getRsvpById(id);

  params.push(id);
  const rows = await query<Row>(
    `UPDATE rsvps SET ${sets.join(", ")} WHERE id = $${params.length} RETURNING ${SELECT_COLUMNS}`,
    params
  );

  return rows.length > 0 ? mapRow(rows[0]) : null;
}

export async function deleteRsvp(id: string): Promise<boolean> {
  const rows = await query<{ id: string }>("DELETE FROM rsvps WHERE id = $1 RETURNING id", [id]);
  return rows.length > 0;
}

export async function listAllRsvpsForExport(): Promise<Rsvp[]> {
  const rows = await query<Row>(`SELECT ${SELECT_COLUMNS} FROM rsvps ORDER BY created_at ASC`);
  return rows.map(mapRow);
}
