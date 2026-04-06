"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { formatDateTime, isOverdue } from "@/lib/utils";
import { CheckCircle2, Circle, Plus, AlertTriangle, Clock } from "lucide-react";

interface Props {
  lead: any;
  currentUser: { id: string };
  canEdit: boolean;
  onRefresh: () => void;
}

export function TabTasks({ lead, currentUser, canEdit, onRefresh }: Props) {
  const { toast } = useToast();
  const [showNew, setShowNew] = useState(false);
  const [desc, setDesc] = useState("");
  const [dueAt, setDueAt] = useState("");

  const open = lead.tasks?.filter((t: any) => !t.doneAt) ?? [];
  const done = lead.tasks?.filter((t: any) => t.doneAt) ?? [];

  async function markDone(taskId: string) {
    await fetch(`/api/tasks/${taskId}/done`, { method: "POST" });
    onRefresh();
  }

  async function createTask() {
    if (!dueAt) { toast({ title: "Fälligkeitsdatum ist Pflicht", variant: "destructive" }); return; }
    const res = await fetch(`/api/leads/${lead.id}/tasks`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ description: desc, dueAt, type: "followup" }),
    });
    if (res.ok) {
      setShowNew(false); setDesc(""); setDueAt("");
      onRefresh();
    }
  }

  return (
    <div className="space-y-4 max-w-2xl">
      <div className="flex justify-end">
        <Button size="sm" onClick={() => setShowNew(true)}>
          <Plus className="h-4 w-4" /> Aufgabe erstellen
        </Button>
      </div>

      {showNew && (
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 space-y-3">
          <h3 className="font-medium text-sm">Neue Aufgabe</h3>
          <Input placeholder="Beschreibung (optional)" value={desc} onChange={(e) => setDesc(e.target.value)} />
          <div className="space-y-1">
            <label className="text-xs text-gray-600">Fällig bis *</label>
            <Input type="datetime-local" value={dueAt} onChange={(e) => setDueAt(e.target.value)} />
          </div>
          <div className="flex gap-2">
            <Button size="sm" onClick={createTask}>Speichern</Button>
            <Button size="sm" variant="outline" onClick={() => setShowNew(false)}>Abbrechen</Button>
          </div>
        </div>
      )}

      {open.length === 0 && done.length === 0 && (
        <div className="text-center py-8 text-gray-400">Keine Aufgaben vorhanden.</div>
      )}

      {open.length > 0 && (
        <div className="space-y-2">
          <h3 className="text-sm font-semibold text-gray-700">Offen ({open.length})</h3>
          {open.map((task: any) => {
            const overdue = isOverdue(task.dueAt);
            return (
              <div key={task.id} className="flex items-start gap-3 bg-white border border-gray-200 rounded-lg p-3">
                <button onClick={() => markDone(task.id)} className="mt-0.5 shrink-0">
                  <Circle className={`h-5 w-5 ${overdue ? "text-red-400" : "text-gray-300"} hover:text-blue-500 transition-colors`} />
                </button>
                <div className="flex-1">
                  <p className="text-sm text-gray-900">{task.description ?? "Kontakt herstellen"}</p>
                  <div className="flex items-center gap-2 mt-1 text-xs text-gray-400">
                    <Clock className="h-3 w-3" />
                    {formatDateTime(task.dueAt)}
                    {overdue && (
                      <span className="flex items-center gap-1 text-red-500 font-medium">
                        <AlertTriangle className="h-3 w-3" /> Überfällig
                      </span>
                    )}
                  </div>
                </div>
                <Badge variant="outline" className="capitalize text-xs shrink-0">{task.type}</Badge>
              </div>
            );
          })}
        </div>
      )}

      {done.length > 0 && (
        <div className="space-y-2">
          <h3 className="text-sm font-semibold text-gray-400">Erledigt ({done.length})</h3>
          {done.map((task: any) => (
            <div key={task.id} className="flex items-start gap-3 bg-gray-50 border border-gray-100 rounded-lg p-3 opacity-60">
              <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5 shrink-0" />
              <div>
                <p className="text-sm text-gray-600 line-through">{task.description ?? "Kontakt herstellen"}</p>
                <p className="text-xs text-gray-400 mt-0.5">Erledigt: {formatDateTime(task.doneAt)}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
