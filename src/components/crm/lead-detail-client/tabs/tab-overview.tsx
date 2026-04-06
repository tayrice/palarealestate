"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import {
  Building2, User, Phone, Mail, MessageCircle, MapPin, Ruler,
  Home, Calendar, Zap, Car as GarageIcon, FileText, Euro, Clock
} from "lucide-react";
import {
  formatDate, formatDateTime, formatPrice, formatArea,
  LEAD_STATUS_LABELS, PRIORITY_LABELS, SELL_TIMELINE_OPTIONS
} from "@/lib/utils";

const PROPERTY_TYPE_LABELS: Record<string, string> = {
  haus: "Haus", wohnung: "Wohnung", grundstueck: "Grundstück",
  mehrfamilienhaus: "Mehrfamilienhaus", gewerbe: "Gewerbe", other: "Sonstiges",
};

const CONDITION_LABELS: Record<string, string> = {
  neuwertig: "Neuwertig", gut: "Gut", gepflegt: "Gepflegt",
  renovierungsbeduerftig: "Renovierungsbedürftig", sanierungsbeduerftig: "Sanierungsbedürftig", rohbau: "Rohbau",
};

interface Props {
  lead: any;
  canEdit: boolean;
  allUsers: { id: string; name: string; role: string }[];
  onRefresh: () => void;
}

function InfoRow({ icon: Icon, label, value }: { icon: any; label: string; value?: string | null }) {
  if (!value) return null;
  return (
    <div className="flex items-start gap-3 py-2 border-b border-gray-50 last:border-0">
      <Icon className="h-4 w-4 text-gray-400 mt-0.5 shrink-0" />
      <div className="flex-1">
        <div className="text-xs text-gray-500 mb-0.5">{label}</div>
        <div className="text-sm font-medium text-gray-900">{value}</div>
      </div>
    </div>
  );
}

export function TabOverview({ lead, canEdit, allUsers, onRefresh }: Props) {
  const { toast } = useToast();
  const [priority, setPriority] = useState(lead.priority);
  const [ownerId, setOwnerId] = useState(lead.ownerId ?? "");

  async function savePriority(val: string) {
    setPriority(val);
    await fetch(`/api/leads/${lead.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ priority: val }),
    });
    onRefresh();
  }

  async function saveOwner(val: string) {
    setOwnerId(val);
    await fetch(`/api/leads/${lead.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ownerId: val }),
    });
    toast({ title: "Zuständiger aktualisiert" });
    onRefresh();
  }

  const timeline = SELL_TIMELINE_OPTIONS.find((o) => o.value === lead.sellTimeline)?.label;

  return (
    <div className="grid gap-5 md:grid-cols-2">
      {/* Kundendaten */}
      <Card>
        <CardHeader><CardTitle className="text-base">Kontaktdaten</CardTitle></CardHeader>
        <CardContent>
          <InfoRow icon={User} label="Name" value={lead.customerName} />
          <InfoRow icon={Phone} label="Telefon" value={lead.customerPhone} />
          {lead.customerEmail && <InfoRow icon={Mail} label="E-Mail" value={lead.customerEmail} />}
          <InfoRow icon={MessageCircle} label="WhatsApp" value={lead.whatsappOptIn ? "Ja (Opt-in)" : "Nein"} />
        </CardContent>
      </Card>

      {/* Immobiliendaten */}
      <Card>
        <CardHeader><CardTitle className="text-base">Immobilie</CardTitle></CardHeader>
        <CardContent>
          {lead.propertyType && (
            <InfoRow icon={Building2} label="Art" value={PROPERTY_TYPE_LABELS[lead.propertyType] ?? lead.propertyType} />
          )}
          {lead.address && (
            <InfoRow icon={MapPin} label="Adresse" value={`${lead.address}${lead.zip ? `, ${lead.zip}` : ""}${lead.city ? ` ${lead.city}` : ""}`} />
          )}
          {lead.livingArea && <InfoRow icon={Ruler} label="Wohnfläche" value={`${lead.livingArea} m²`} />}
          {lead.plotArea && <InfoRow icon={Ruler} label="Grundstücksfläche" value={`${lead.plotArea} m²`} />}
          {lead.rooms && <InfoRow icon={Home} label="Zimmer" value={lead.rooms} />}
          {lead.bathrooms && <InfoRow icon={Home} label="Badezimmer" value={String(lead.bathrooms)} />}
          {lead.floor != null && <InfoRow icon={Home} label="Etage" value={String(lead.floor)} />}
          {lead.yearBuilt && <InfoRow icon={Calendar} label="Baujahr" value={lead.yearBuilt} />}
          {lead.condition && <InfoRow icon={FileText} label="Zustand" value={CONDITION_LABELS[lead.condition] ?? lead.condition} />}
          {lead.energyClass && <InfoRow icon={Zap} label="Energieklasse" value={lead.energyClass} />}
          {lead.hasGarage != null && <InfoRow icon={GarageIcon} label="Garage" value={lead.hasGarage ? "Vorhanden" : "Nicht vorhanden"} />}
          {lead.propertyNotes && <InfoRow icon={FileText} label="Hinweise" value={lead.propertyNotes} />}
        </CardContent>
      </Card>

      {/* Preis & Zeitplanung */}
      <Card>
        <CardHeader><CardTitle className="text-base">Preis & Zeitplanung</CardTitle></CardHeader>
        <CardContent>
          <InfoRow icon={Euro} label="Preisvorstellung" value={lead.priceExpectation ? formatPrice(lead.priceExpectation) : undefined} />
          <InfoRow icon={Clock} label="Verkaufszeitpunkt" value={timeline} />
        </CardContent>
      </Card>

      {/* CRM-Status */}
      <Card>
        <CardHeader><CardTitle className="text-base">CRM Status</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div>
            <div className="text-xs text-gray-500 mb-1">Priorität</div>
            <Select value={priority} onValueChange={savePriority} disabled={!canEdit}>
              <SelectTrigger className="w-36">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="low">Niedrig</SelectItem>
                <SelectItem value="normal">Normal</SelectItem>
                <SelectItem value="high">Hoch</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <div className="text-xs text-gray-500 mb-1">Zuständig</div>
            <Select value={ownerId} onValueChange={saveOwner} disabled={!canEdit}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Niemand zugewiesen" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Niemand</SelectItem>
                {allUsers.map((u) => (
                  <SelectItem key={u.id} value={u.id}>{u.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          {lead.claimedAt && (
            <div>
              <div className="text-xs text-gray-500">Übernommen am</div>
              <div className="text-sm">{formatDateTime(lead.claimedAt)}</div>
            </div>
          )}
          {lead.nextActionAt && (
            <div>
              <div className="text-xs text-gray-500">Nächste Aktion</div>
              <div className="text-sm">{formatDateTime(lead.nextActionAt)}</div>
            </div>
          )}
          {lead.status === "closed" && (
            <div className="pt-2 border-t border-gray-100 space-y-2">
              <div>
                <div className="text-xs text-gray-500">Ergebnis</div>
                <Badge variant={lead.closedResult === "won" ? "success" : "destructive"}>
                  {lead.closedResult === "won" ? "Gewonnen" : "Verloren"}
                </Badge>
              </div>
              {lead.closedReason && (
                <InfoRow icon={FileText} label="Verlustgrund" value={lead.closedReason} />
              )}
              {lead.closedComment && (
                <InfoRow icon={FileText} label="Kommentar" value={lead.closedComment} />
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Fotos */}
      {(() => { const photos: string[] = typeof lead.photos === "string" ? JSON.parse(lead.photos || "[]") : (lead.photos || []); return photos.length > 0 && (
        <Card className="md:col-span-2">
          <CardHeader><CardTitle className="text-base">Fotos ({photos.length})</CardTitle></CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2">
              {photos.map((url: string, i: number) => (
                <a key={i} href={url} target="_blank" rel="noreferrer">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={url} alt={`Foto ${i + 1}`} className="aspect-square object-cover rounded-lg hover:opacity-80 transition-opacity" />
                </a>
              ))}
            </div>
          </CardContent>
        </Card>
      ); })()}
    </div>
  );
}
