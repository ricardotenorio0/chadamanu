/** Dados do evento. Podem ser sobrescritos por variáveis de ambiente públicas. */

export const EVENT = {
  babyName: "Manuela",
  title: "Chá de Bebê da Manuela",
  tagline: "Um pequeno amor está a caminho — e a gente quer celebrar com você.",
  /** Instante do evento em horário de Brasília (UTC-3). */
  startsAt: process.env.NEXT_PUBLIC_EVENT_DATE ?? "2026-10-10T14:30:00-03:00",
  /** Duração estimada da festa, usada só para o convite de calendário. */
  durationHours: 3,
  dateLabel: "10 de outubro",
  dateFull: "10 de outubro de 2026",
  weekdayLabel: "Sábado",
  timeLabel: "14h30",
  shortDate: "10.10.26",
  venue: "Clube ASBAC",
  address: "Rua Maria Stela, 165",
  maxCompanions: 10,
} as const;

export const MAPS_URL =
  "https://www.google.com/maps/search/?api=1&query=" +
  encodeURIComponent(`${EVENT.venue}, ${EVENT.address}`);

export const EVENT_DATE_MS = new Date(EVENT.startsAt).getTime();

/** Formato exigido pelo Google Agenda: 20261010T173000Z (sempre em UTC). */
function toCalendarStamp(ms: number): string {
  return new Date(ms).toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
}

const EVENT_END_MS = EVENT_DATE_MS + EVENT.durationHours * 60 * 60 * 1000;

export const CALENDAR_URL =
  "https://calendar.google.com/calendar/render?action=TEMPLATE" +
  `&text=${encodeURIComponent(EVENT.title)}` +
  `&dates=${toCalendarStamp(EVENT_DATE_MS)}/${toCalendarStamp(EVENT_END_MS)}` +
  `&location=${encodeURIComponent(`${EVENT.venue}, ${EVENT.address}`)}` +
  `&details=${encodeURIComponent(EVENT.tagline)}`;
