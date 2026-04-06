"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { formatDateTime } from "@/lib/utils";
import { FileText, Plus, CheckCircle, Send, Copy } from "lucide-react";

interface Props {
  lead: any;
  canEdit: boolean;
  onRefresh: () => void;
}

const DOC_TYPE_LABELS: Record<string, string> = {
  offer: "Angebot",
  reservation: "Reservierung",
  contract_draft: "Vertragsentwurf",
};

const DOC_STATUS_LABELS: Record<string, string> = {
  draft: "Entwurf",
  approved: "Freigegeben",
  sent: "Gesendet",
};

const DOC_STATUS_VARIANT: Record<string, "warning" | "success" | "default"> = {
  draft: "warning",
  approved: "success",
  sent: "default",
};

export function TabDocuments({ lead, canEdit, onRefresh }: Props) {
  const { toast } = useToast();
  const [creating, setCreating] = useState(false);
  const [docType, setDocType] = useState("offer");

  async function createDocument() {
    setCreating(true);
    const res = await fetch(`/api/leads/${lead.id}/documents`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type: docType }),
    });
    setCreating(false);
    if (res.ok) {
      toast({ title: "Dokument erstellt" });
      onRefresh();
    } else {
      toast({ title: "Fehler", variant: "destructive" });
    }
  }

  async function approve(docId: string) {
    await fetch(`/api/documents/${docId}/approve`, { method: "POST" });
    onRefresh();
  }

  async function copyLink(docId: string) {
    const url = `${window.location.origin}/dokumente/${docId}`;
    await navigator.clipboard.writeText(url);
    toast({ title: "Link kopiert" });
  }

  return (
    <div className="space-y-4 max-w-2xl">
      {canEdit && (
        <div className="bg-gray-50 rounded-xl p-4 space-y-3">
          <h3 className="text-sm font-semibold">Neues Dokument erstellen</h3>
          <div className="flex gap-3">
            <select
              value={docType}
              onChange={(e) => setDocType(e.target.value)}
              className="flex h-9 rounded-md border border-gray-300 bg-white px-3 py-1 text-sm"
            >
              <option value="offer">Angebot</option>
              <option value="reservation">Reservierung</option>
              <option value="contract_draft">Vertragsentwurf</option>
            </select>
            <Button size="sm" onClick={createDocument} disabled={creating}>
              <Plus className="h-4 w-4" /> Erstellen
            </Button>
          </div>
        </div>
      )}

      {lead.documents?.length === 0 && (
        <div className="text-center py-8 text-gray-400">
          <FileText className="h-10 w-10 mx-auto mb-2 opacity-30" />
          Noch keine Dokumente.
        </div>
      )}

      <div className="space-y-3">
        {lead.documents?.map((doc: any) => (
          <div key={doc.id} className="bg-white border border-gray-200 rounded-xl p-4">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3">
                <FileText className="h-5 w-5 text-blue-500 shrink-0" />
                <div>
                  <div className="font-medium text-sm">
                    {DOC_TYPE_LABELS[doc.type] ?? doc.type}
                    {doc.type === "contract_draft" && (
                      <span className="ml-2 text-xs text-red-500 font-semibold">ENTWURF – nicht final</span>
                    )}
                  </div>
                  <div className="text-xs text-gray-400">{formatDateTime(doc.createdAt)}</div>
                </div>
              </div>
              <Badge variant={DOC_STATUS_VARIANT[doc.status]}>{DOC_STATUS_LABELS[doc.status]}</Badge>
            </div>
            <div className="flex gap-2 mt-3">
              {canEdit && doc.status === "draft" && (
                <Button size="sm" variant="secondary" onClick={() => approve(doc.id)}>
                  <CheckCircle className="h-4 w-4" /> Freigeben
                </Button>
              )}
              {doc.status !== "draft" && (
                <Button size="sm" variant="outline" onClick={() => copyLink(doc.id)}>
                  <Copy className="h-4 w-4" /> Link kopieren
                </Button>
              )}
              {doc.pdfUrl && (
                <a href={doc.pdfUrl} target="_blank" rel="noreferrer">
                  <Button size="sm" variant="outline">
                    <Send className="h-4 w-4" /> PDF öffnen
                  </Button>
                </a>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
