/** Tipos e regras compartilhados entre servidor e cliente. */

export const RSVP_STATUSES = ["confirmed", "pending", "cancelled"] as const;
export type RsvpStatus = (typeof RSVP_STATUSES)[number];

export const STATUS_LABEL: Record<RsvpStatus, string> = {
  confirmed: "Confirmado",
  pending: "Pendente",
  cancelled: "Cancelado",
};

export const NAME_MIN = 2;
export const NAME_MAX = 80;
export const COMPANIONS_MAX = 10;
export const NOTE_MAX = 280;

export type Rsvp = {
  id: string;
  name: string;
  companions: number;
  status: RsvpStatus;
  note: string | null;
  createdAt: string;
  updatedAt: string;
  totalPeople: number;
};

export type RsvpStats = {
  entries: number;
  confirmedEntries: number;
  guests: number;
  companions: number;
  totalPeople: number;
  pendingEntries: number;
  cancelledEntries: number;
};

export function isRsvpStatus(value: unknown): value is RsvpStatus {
  return typeof value === "string" && (RSVP_STATUSES as readonly string[]).includes(value);
}

/** Normaliza o nome para comparação: sem acentos, minúsculo, espaços colapsados. */
export function normalizeName(name: string): string {
  return name
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

/** Deixa o nome apresentável: espaços limpos e capitalização respeitando partículas. */
export function cleanName(name: string): string {
  const particles = new Set(["de", "da", "do", "das", "dos", "e", "di", "du", "del", "van", "von"]);
  return name
    .replace(/\s+/g, " ")
    .trim()
    .split(" ")
    .map((word, index) => {
      const lower = word.toLocaleLowerCase("pt-BR");
      if (index > 0 && particles.has(lower)) return lower;
      return lower.charAt(0).toLocaleUpperCase("pt-BR") + lower.slice(1);
    })
    .join(" ");
}

export type ValidationResult =
  | { ok: true; name: string; companions: number; note: string | null }
  | { ok: false; field: "name" | "companions" | "note"; message: string };

export function validateRsvpInput(input: {
  name?: unknown;
  companions?: unknown;
  note?: unknown;
}): ValidationResult {
  const rawName = typeof input.name === "string" ? input.name.replace(/\s+/g, " ").trim() : "";

  if (rawName.length < NAME_MIN) {
    return { ok: false, field: "name", message: "Informe seu nome completo." };
  }
  if (rawName.length > NAME_MAX) {
    return { ok: false, field: "name", message: `O nome deve ter ate ${NAME_MAX} caracteres.` };
  }
  if (!/[\p{L}]/u.test(rawName)) {
    return { ok: false, field: "name", message: "Informe um nome valido." };
  }

  const companionsRaw =
    typeof input.companions === "number"
      ? input.companions
      : typeof input.companions === "string" && input.companions.trim() !== ""
        ? Number(input.companions)
        : 0;

  if (!Number.isInteger(companionsRaw) || companionsRaw < 0 || companionsRaw > COMPANIONS_MAX) {
    return {
      field: "companions",
      ok: false,
      message: `A quantidade de acompanhantes deve ser um número entre 0 e ${COMPANIONS_MAX}.`,
    };
  }

  const noteRaw = typeof input.note === "string" ? input.note.trim() : "";
  if (noteRaw.length > NOTE_MAX) {
    return { ok: false, field: "note", message: `O recado deve ter ate ${NOTE_MAX} caracteres.` };
  }

  return {
    ok: true,
    name: cleanName(rawName),
    companions: companionsRaw,
    note: noteRaw.length > 0 ? noteRaw : null,
  };
}
