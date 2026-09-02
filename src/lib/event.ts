/** Dados do evento. Podem ser sobrescritos por variáveis de ambiente públicas. */

export const EVENT = {
  babyName: "Manuela",
  title: "Chá de Bebê da Manuela",
  tagline: "Um pequeno amor está a caminho...",
  /** Instante do evento em horário de Brasília (UTC-3). */
  startsAt: process.env.NEXT_PUBLIC_EVENT_DATE ?? "2026-10-10T14:30:00-03:00",
  dateLabel: "10 de Outubro",
  weekdayLabel: "Sábado",
  timeLabel: "14:30",
  shortDate: "10.10",
  venue: "Clube ASBAC",
  address: "Rua Maria Stela, 165",
  maxCompanions: 10,
} as const;

export const MAPS_URL =
  "https://www.google.com/maps/search/?api=1&query=" +
  encodeURIComponent(`${EVENT.venue}, ${EVENT.address}`);

export const EVENT_DATE_MS = new Date(EVENT.startsAt).getTime();
