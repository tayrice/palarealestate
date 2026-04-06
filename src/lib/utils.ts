import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { format, formatDistanceToNow, isAfter } from "date-fns";
import { de } from "date-fns/locale";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: Date | string | null | undefined): string {
  if (!date) return "–";
  return format(new Date(date), "dd.MM.yyyy", { locale: de });
}

export function formatDateTime(date: Date | string | null | undefined): string {
  if (!date) return "–";
  return format(new Date(date), "dd.MM.yyyy HH:mm", { locale: de });
}

export function formatRelative(date: Date | string | null | undefined): string {
  if (!date) return "–";
  return formatDistanceToNow(new Date(date), { addSuffix: true, locale: de });
}

export function isOverdue(date: Date | string | null | undefined): boolean {
  if (!date) return false;
  return isAfter(new Date(), new Date(date));
}

export function formatArea(area: number | null | undefined): string {
  if (!area) return "–";
  return area.toLocaleString("de-DE") + " m²";
}

export function formatPrice(price: number | null | undefined): string {
  if (!price) return "–";
  return price.toLocaleString("de-DE", { style: "currency", currency: "EUR" });
}

export function generateRefNumber(): string {
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substring(2, 5).toUpperCase();
  return `PA-${timestamp}-${random}`;
}

export const PROPERTY_TYPE_OPTIONS = [
  { value: "haus", label: "Haus" },
  { value: "wohnung", label: "Wohnung" },
  { value: "grundstueck", label: "Grundstück" },
  { value: "mehrfamilienhaus", label: "Mehrfamilienhaus" },
  { value: "gewerbe", label: "Gewerbeimmobilie" },
  { value: "other", label: "Sonstiges" },
];

export const CONDITION_OPTIONS = [
  { value: "neuwertig", label: "Neuwertig" },
  { value: "gut", label: "Gut" },
  { value: "gepflegt", label: "Gepflegt" },
  { value: "renovierungsbeduerftig", label: "Renovierungsbedürftig" },
  { value: "sanierungsbeduerftig", label: "Sanierungsbedürftig" },
  { value: "rohbau", label: "Rohbau" },
];

export const ENERGY_CLASS_OPTIONS = [
  { value: "A+", label: "A+" },
  { value: "A", label: "A" },
  { value: "B", label: "B" },
  { value: "C", label: "C" },
  { value: "D", label: "D" },
  { value: "E", label: "E" },
  { value: "F", label: "F" },
  { value: "G", label: "G" },
  { value: "H", label: "H" },
];

export const SELL_TIMELINE_OPTIONS = [
  { value: "today", label: "So schnell wie möglich" },
  { value: "7days", label: "Innerhalb 1 Monat" },
  { value: "30days", label: "Innerhalb 3 Monate" },
  { value: "flexible", label: "Flexibel" },
];

export const CLOSED_REASON_LABELS: Record<string, string> = {
  price: "Preis",
  competition: "Konkurrenz",
  no_interest: "Kein Interesse",
  not_reachable: "Nicht erreichbar",
  later: "Später",
  other: "Sonstiges",
};

export const LEAD_SOURCE_LABELS: Record<string, string> = {
  ankaufstation: "Ankaufstation",
  besichtigung: "Besichtigung",
  website: "Webseite",
  other: "Sonstiges",
};

export const LEAD_STATUS_LABELS: Record<string, string> = {
  open: "Offen",
  claimed: "Übernommen",
  closed: "Abgeschlossen",
};

export const PRIORITY_LABELS: Record<string, string> = {
  low: "Niedrig",
  normal: "Normal",
  high: "Hoch",
};
