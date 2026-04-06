"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import {
  Building2, ArrowLeft, Phone, MessageCircle, CheckCircle2, XCircle,
  MapPin, Calendar, Ruler, Home, Zap
} from "lucide-react";
import {
  formatDate, formatDateTime, formatRelative, formatPrice, formatArea,
  LEAD_SOURCE_LABELS, LEAD_STATUS_LABELS, PRIORITY_LABELS, CLOSED_REASON_LABELS
} from "@/lib/utils";

// Tab components
import { TabOverview } from "./lead-detail-client/tabs/tab-overview";
import { TabTimeline } from "./lead-detail-client/tabs/tab-timeline";
import { TabComments } from "./lead-detail-client/tabs/tab-comments";
import { TabTasks } from "./lead-detail-client/tabs/tab-tasks";
import { TabFeatures } from "./lead-detail-client/tabs/tab-features";
import { TabDocuments } from "./lead-detail-client/tabs/tab-documents";
import { TabInserat } from "./lead-detail-client/tabs/tab-inserat";

interface Props {
  lead: any;
  currentUser: { id: string; name?: string | null; role: string };
  allUsers: { id: string; name: string; role: string }[];
}

const STATUS_VARIANT: Record<string, "default" | "warning" | "secondary" | "success" | "destructive"> = {
  open: "default",
  claimed: "warning",
  closed: "success",
};

const PROPERTY_TYPE_LABELS: Record<string, string> = {
  haus: "Haus", wohnung: "Wohnung", grundstueck: "Grundstück",
  mehrfamilienhaus: "MFH", gewerbe: "Gewerbe", other: "Sonstiges",
};

export function LeadDetailClient({ lead: initialLead, currentUser, allUsers }: Props) {
  const router = useRouter();
  const { toast } = useToast();
  const [lead, setLead] = useState(initialLead);
  const [closingMode, setClosingMode] = useState<null | "won" | "lost">(null);

  const isOwner = lead.ownerId === currentUser.id;
  const isAdmin = currentUser.role === "admin";
  const canEdit = isOwner || isAdmin;

  async function refreshLead() {
    const res = await fetch(`/api/leads/${lead.id}`);
    const data = await res.json();
    setLead(data);
  }

  async function handleClose(result: "won" | "lost", reason?: string, comment?: string) {
    const res = await fetch(`/api/leads/${lead.id}/close`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ result, reason, comment }),
    });
    if (res.ok) {
      toast({ title: result === "won" ? "Lead gewonnen! 🎉" : "Lead abgeschlossen" });
      setClosingMode(null);
      refreshLead();
    }
  }

  return (
    <div className="flex flex-col h-full">
      {/* Top bar */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-3">
            <Link href="/leads">
              <Button variant="ghost" size="icon" className="mt-0.5">
                <ArrowLeft className="h-4 w-4" />
              </Button>
            </Link>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-xl font-bold text-gray-900">{lead.customerName}</h1>
                <Badge variant={STATUS_VARIANT[lead.status]}>{LEAD_STATUS_LABELS[lead.status]}</Badge>
                <Badge variant="outline">{LEAD_SOURCE_LABELS[lead.source] ?? lead.source}</Badge>
                {lead.priority === "high" && <Badge variant="destructive">Hohe Priorität</Badge>}
              </div>
              <div className="flex items-center gap-3 mt-1 text-sm text-gray-500 flex-wrap">
                <span className="font-mono text-xs bg-gray-100 px-2 py-0.5 rounded">{lead.refNumber}</span>
                {lead.propertyType && (
                  <span className="flex items-center gap-1">
                    <Building2 className="h-3.5 w-3.5" />
                    {PROPERTY_TYPE_LABELS[lead.propertyType] ?? lead.propertyType}
                  </span>
                )}
                {lead.city && (
                  <span className="flex items-center gap-1">
                    <MapPin className="h-3.5 w-3.5" />
                    {lead.address ? `${lead.address}, ` : ""}{lead.city}
                  </span>
                )}
                {lead.livingArea && (
                  <span className="flex items-center gap-1">
                    <Ruler className="h-3.5 w-3.5" />
                    {lead.livingArea} m²
                  </span>
                )}
                {lead.priceExpectation && (
                  <span>{formatPrice(lead.priceExpectation)}</span>
                )}
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2 shrink-0">
            <a href={`tel:${lead.customerPhone}`}>
              <Button size="sm" variant="outline">
                <Phone className="h-4 w-4" /> Anrufen
              </Button>
            </a>
            {lead.whatsappOptIn && (
              <a href={`https://wa.me/${lead.customerPhone.replace(/\D/g, "")}`} target="_blank" rel="noreferrer">
                <Button size="sm" variant="outline">
                  <MessageCircle className="h-4 w-4" /> WhatsApp
                </Button>
              </a>
            )}
            {canEdit && lead.status !== "closed" && (
              <>
                <Button size="sm" variant="default" onClick={() => setClosingMode("won")}>
                  <CheckCircle2 className="h-4 w-4" /> Gewonnen
                </Button>
                <Button size="sm" variant="destructive" onClick={() => setClosingMode("lost")}>
                  <XCircle className="h-4 w-4" /> Verloren
                </Button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Closing modal */}
      {closingMode && (
        <CloseLeadModal
          mode={closingMode}
          onClose={() => setClosingMode(null)}
          onSubmit={handleClose}
        />
      )}

      {/* Tabs */}
      <div className="flex-1 overflow-auto p-6">
        <Tabs defaultValue="overview">
          <TabsList className="mb-4 flex-wrap h-auto gap-1">
            <TabsTrigger value="overview">Übersicht</TabsTrigger>
            <TabsTrigger value="timeline">Timeline</TabsTrigger>
            <TabsTrigger value="comments">Kommentare ({lead.comments?.length ?? 0})</TabsTrigger>
            <TabsTrigger value="tasks">Aufgaben ({lead.tasks?.filter((t: any) => !t.doneAt).length ?? 0})</TabsTrigger>
            <TabsTrigger value="features">Ausstattung</TabsTrigger>
            <TabsTrigger value="documents">Dokumente</TabsTrigger>
            <TabsTrigger value="inserat">Inserat</TabsTrigger>
          </TabsList>

          <TabsContent value="overview">
            <TabOverview lead={lead} canEdit={canEdit} allUsers={allUsers} onRefresh={refreshLead} />
          </TabsContent>
          <TabsContent value="timeline">
            <TabTimeline lead={lead} />
          </TabsContent>
          <TabsContent value="comments">
            <TabComments lead={lead} currentUser={currentUser} onRefresh={refreshLead} />
          </TabsContent>
          <TabsContent value="tasks">
            <TabTasks lead={lead} currentUser={currentUser} canEdit={canEdit} onRefresh={refreshLead} />
          </TabsContent>
          <TabsContent value="features">
            <TabFeatures lead={lead} canEdit={canEdit} onRefresh={refreshLead} />
          </TabsContent>
          <TabsContent value="documents">
            <TabDocuments lead={lead} canEdit={canEdit} onRefresh={refreshLead} />
          </TabsContent>
          <TabsContent value="inserat">
            <TabInserat lead={lead} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

// ─── Close Modal ─────────────────────────────────────────────────────────────

function CloseLeadModal({
  mode,
  onClose,
  onSubmit,
}: {
  mode: "won" | "lost";
  onClose: () => void;
  onSubmit: (result: "won" | "lost", reason?: string, comment?: string) => void;
}) {
  const [reason, setReason] = useState("");
  const [comment, setComment] = useState("");
  const [error, setError] = useState("");

  const lostReasons = [
    { value: "price", label: "Preis" },
    { value: "competition", label: "Konkurrenz" },
    { value: "no_interest", label: "Kein Interesse" },
    { value: "not_reachable", label: "Nicht erreichbar" },
    { value: "later", label: "Später" },
    { value: "other", label: "Sonstiges" },
  ];

  function submit() {
    if (mode === "lost" && !reason) { setError("Bitte einen Grund angeben"); return; }
    onSubmit(mode, reason || undefined, comment || undefined);
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6 space-y-4">
        <h2 className="text-lg font-semibold">
          {mode === "won" ? "Lead als Gewonnen markieren" : "Lead als Verloren markieren"}
        </h2>
        {mode === "lost" && (
          <div className="space-y-3">
            <label className="block text-sm font-medium text-gray-700">Verlustgrund *</label>
            <div className="grid grid-cols-2 gap-2">
              {lostReasons.map((r) => (
                <button
                  key={r.value}
                  onClick={() => { setReason(r.value); setError(""); }}
                  className={`p-2 rounded-lg border text-sm text-left transition-colors ${
                    reason === r.value ? "border-blue-500 bg-blue-50 text-blue-700" : "border-gray-200 hover:border-gray-300"
                  }`}
                >
                  {r.label}
                </button>
              ))}
            </div>
            {error && <p className="text-xs text-red-500">{error}</p>}
          </div>
        )}
        <div className="space-y-1">
          <label className="block text-sm font-medium text-gray-700">Kommentar (optional)</label>
          <textarea
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
            rows={3}
            value={comment}
            onChange={(e) => setComment(e.target.value)}
          />
        </div>
        <div className="flex gap-3">
          <Button variant="outline" className="flex-1" onClick={onClose}>Abbrechen</Button>
          <Button
            className={`flex-1 ${mode === "won" ? "" : "bg-red-600 hover:bg-red-700"}`}
            onClick={submit}
          >
            {mode === "won" ? "Gewonnen" : "Als verloren markieren"}
          </Button>
        </div>
      </div>
    </div>
  );
}
