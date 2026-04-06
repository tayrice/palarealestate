"use client";

import { formatDateTime } from "@/lib/utils";
import { Clock, User2, CheckCircle2, AlertCircle, MessageCircle, FileText } from "lucide-react";

interface Props { lead: any; }

const EVENT_ICONS: Record<string, any> = {
  lead_created: AlertCircle,
  lead_claimed: User2,
  lead_closed: CheckCircle2,
  comment_added: MessageCircle,
  task_done: CheckCircle2,
  document_created: FileText,
};

const EVENT_LABELS: Record<string, string> = {
  lead_created: "Lead erstellt",
  lead_claimed: "Lead übernommen",
  lead_closed: "Lead abgeschlossen",
  comment_added: "Kommentar hinzugefügt",
  task_done: "Aufgabe erledigt",
  document_created: "Dokument erstellt",
};

export function TabTimeline({ lead }: Props) {
  const events = lead.activityLogs ?? [];

  if (events.length === 0) {
    return <div className="text-center py-10 text-gray-400">Keine Ereignisse vorhanden.</div>;
  }

  return (
    <div className="relative space-y-0">
      <div className="absolute left-5 top-0 bottom-0 w-px bg-gray-200" />
      {events.map((event: any) => {
        const Icon = EVENT_ICONS[event.eventType] ?? Clock;
        return (
          <div key={event.id} className="relative flex gap-4 pb-5">
            <div className="relative z-10 w-10 h-10 bg-white border-2 border-gray-200 rounded-full flex items-center justify-center shrink-0">
              <Icon className="h-4 w-4 text-gray-500" />
            </div>
            <div className="flex-1 pt-1.5">
              <div className="text-sm font-medium text-gray-900">
                {EVENT_LABELS[event.eventType] ?? event.eventType}
              </div>
              {event.user && (
                <div className="text-xs text-gray-500">von {event.user.name}</div>
              )}
              <div className="text-xs text-gray-400 mt-0.5">{formatDateTime(event.createdAt)}</div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
