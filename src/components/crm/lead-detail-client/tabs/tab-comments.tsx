"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { formatDateTime } from "@/lib/utils";
import { Send } from "lucide-react";

interface Props {
  lead: any;
  currentUser: { id: string; name?: string | null };
  onRefresh: () => void;
}

export function TabComments({ lead, currentUser, onRefresh }: Props) {
  const { toast } = useToast();
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);

  async function submitComment() {
    if (!text.trim()) return;
    setLoading(true);
    const res = await fetch(`/api/leads/${lead.id}/comments`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content: text }),
    });
    if (res.ok) {
      setText("");
      onRefresh();
    } else {
      toast({ title: "Fehler", description: "Kommentar konnte nicht gespeichert werden.", variant: "destructive" });
    }
    setLoading(false);
  }

  return (
    <div className="space-y-4 max-w-2xl">
      {lead.comments?.length === 0 && (
        <div className="text-center py-8 text-gray-400">Noch keine Kommentare.</div>
      )}

      <div className="space-y-3">
        {lead.comments?.map((c: any) => (
          <div key={c.id} className="bg-gray-50 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-7 h-7 rounded-full bg-blue-100 flex items-center justify-center text-xs font-bold text-blue-700">
                {c.author.name.charAt(0).toUpperCase()}
              </div>
              <span className="text-sm font-medium text-gray-900">{c.author.name}</span>
              <span className="text-xs text-gray-400">{formatDateTime(c.createdAt)}</span>
            </div>
            <p className="text-sm text-gray-700 whitespace-pre-wrap">{c.content}</p>
          </div>
        ))}
      </div>

      <div className="bg-white border border-gray-200 rounded-xl p-4 space-y-3">
        <Textarea
          placeholder="Kommentar schreiben..."
          value={text}
          onChange={(e) => setText(e.target.value)}
          rows={3}
        />
        <div className="flex justify-end">
          <Button size="sm" onClick={submitComment} disabled={loading || !text.trim()}>
            <Send className="h-4 w-4" /> Senden
          </Button>
        </div>
      </div>
    </div>
  );
}
