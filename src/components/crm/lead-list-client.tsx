"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import {
  Building2, Search, Filter, Clock, User, PhoneCall,
  ChevronRight, AlertTriangle, MapPin
} from "lucide-react";
import {
  formatRelative, formatDateTime, isOverdue,
  LEAD_SOURCE_LABELS, LEAD_STATUS_LABELS, PRIORITY_LABELS, formatPrice
} from "@/lib/utils";

interface Lead {
  id: string;
  status: string;
  source: string;
  priority: string;
  refNumber: string;
  customerName: string;
  customerPhone: string;
  propertyType?: string;
  address?: string;
  city?: string;
  livingArea?: number;
  priceExpectation?: number;
  lastActivityAt: string;
  nextActionAt?: string;
  owner?: { id: string; name: string } | null;
  tasks: { dueAt: string; type: string }[];
  _count: { comments: number };
}

const STATUS_VARIANT: Record<string, "default" | "warning" | "secondary" | "success"> = {
  open: "default",
  claimed: "warning",
  closed: "success",
};

const PROPERTY_TYPE_LABELS: Record<string, string> = {
  haus: "Haus",
  wohnung: "Wohnung",
  grundstueck: "Grundstück",
  mehrfamilienhaus: "Mehrfamilienhaus",
  gewerbe: "Gewerbe",
  other: "Sonstiges",
};

export function LeadListClient() {
  const router = useRouter();
  const { toast } = useToast();
  const [leads, setLeads] = useState<Lead[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("open");
  const [sourceFilter, setSourceFilter] = useState("all");
  const [page, setPage] = useState(1);

  const fetchLeads = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams({
      status: statusFilter,
      page: String(page),
    });
    if (search) params.set("search", search);
    if (sourceFilter !== "all") params.set("source", sourceFilter);

    const res = await fetch(`/api/leads?${params}`);
    const data = await res.json();
    setLeads(data.leads ?? []);
    setTotal(data.total ?? 0);
    setLoading(false);
  }, [statusFilter, sourceFilter, search, page]);

  useEffect(() => { fetchLeads(); }, [fetchLeads]);

  async function claimLead(leadId: string) {
    const nextActionAt = prompt("Nächste Aktion bis (Datum/Uhrzeit):", new Date(Date.now() + 60 * 60 * 1000).toISOString().slice(0, 16));
    if (!nextActionAt) return;
    const res = await fetch(`/api/leads/${leadId}/claim`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ nextActionAt }),
    });
    if (res.ok) {
      toast({ title: "Lead übernommen", description: "Der Lead wurde Ihnen zugewiesen." });
      fetchLeads();
    }
  }

  return (
    <div className="p-6 space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Team Inbox</h1>
          <p className="text-gray-500 text-sm mt-0.5">{total} Leads gesamt</p>
        </div>
      </div>

      {/* Filter */}
      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Name, Telefon, Adresse, PLZ..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            className="pl-9"
          />
        </div>
        <Select value={statusFilter} onValueChange={(v) => { setStatusFilter(v); setPage(1); }}>
          <SelectTrigger className="w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Alle Status</SelectItem>
            <SelectItem value="open">Offen</SelectItem>
            <SelectItem value="claimed">Übernommen</SelectItem>
            <SelectItem value="closed">Abgeschlossen</SelectItem>
          </SelectContent>
        </Select>
        <Select value={sourceFilter} onValueChange={(v) => { setSourceFilter(v); setPage(1); }}>
          <SelectTrigger className="w-44">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Alle Quellen</SelectItem>
            <SelectItem value="ankaufstation">Ankaufstation</SelectItem>
            <SelectItem value="besichtigung">Besichtigung</SelectItem>
            <SelectItem value="website">Webseite</SelectItem>
            <SelectItem value="other">Sonstiges</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Liste */}
      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-20 bg-gray-100 rounded-xl animate-pulse" />
          ))}
        </div>
      ) : leads.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <Building2 className="h-12 w-12 mx-auto mb-3 opacity-30" />
          <p className="font-medium">Keine Leads gefunden</p>
        </div>
      ) : (
        <div className="space-y-2">
          {leads.map((lead) => {
            const overdue = lead.nextActionAt ? isOverdue(lead.nextActionAt) : false;
            const nextTask = lead.tasks[0];
            const taskOverdue = nextTask ? isOverdue(nextTask.dueAt) : false;
            return (
              <div
                key={lead.id}
                className="bg-white rounded-xl border border-gray-200 p-4 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start gap-4">
                  {/* Icon */}
                  <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center shrink-0">
                    <Building2 className="h-5 w-5 text-blue-600" />
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center flex-wrap gap-2 mb-1">
                      <span className="font-semibold text-gray-900">{lead.customerName}</span>
                      <Badge variant={STATUS_VARIANT[lead.status] ?? "secondary"}>
                        {LEAD_STATUS_LABELS[lead.status] ?? lead.status}
                      </Badge>
                      <Badge variant="outline">{LEAD_SOURCE_LABELS[lead.source] ?? lead.source}</Badge>
                      {lead.priority === "high" && <Badge variant="destructive">Hohe Priorität</Badge>}
                    </div>

                    {/* Immobilien-Info */}
                    {(lead.propertyType || lead.address) && (
                      <div className="flex items-center gap-1 text-sm text-gray-600 mb-1">
                        <MapPin className="h-3.5 w-3.5 shrink-0" />
                        <span className="truncate">
                          {lead.propertyType ? PROPERTY_TYPE_LABELS[lead.propertyType] ?? lead.propertyType : ""}
                          {lead.propertyType && lead.address ? " · " : ""}
                          {lead.address ?? ""}
                          {lead.city ? `, ${lead.city}` : ""}
                          {lead.livingArea ? ` · ${lead.livingArea} m²` : ""}
                        </span>
                      </div>
                    )}

                    <div className="flex items-center flex-wrap gap-3 text-xs text-gray-500">
                      <span className="flex items-center gap-1">
                        <PhoneCall className="h-3 w-3" />{lead.customerPhone}
                      </span>
                      {lead.priceExpectation && (
                        <span>{formatPrice(lead.priceExpectation)}</span>
                      )}
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />{formatRelative(lead.lastActivityAt)}
                      </span>
                      {lead.owner && (
                        <span className="flex items-center gap-1">
                          <User className="h-3 w-3" />{lead.owner.name}
                        </span>
                      )}
                      {(overdue || taskOverdue) && (
                        <span className="flex items-center gap-1 text-red-500 font-medium">
                          <AlertTriangle className="h-3 w-3" />Überfällig
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 shrink-0">
                    {lead.status === "open" && (
                      <Button size="sm" variant="secondary" onClick={() => claimLead(lead.id)}>
                        Übernehmen
                      </Button>
                    )}
                    <Link href={`/leads/${lead.id}`}>
                      <Button size="icon" variant="ghost">
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Pagination */}
      {total > 20 && (
        <div className="flex justify-center gap-2 pt-4">
          <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>
            Zurück
          </Button>
          <span className="text-sm text-gray-500 py-1.5">Seite {page}</span>
          <Button variant="outline" size="sm" disabled={page * 20 >= total} onClick={() => setPage((p) => p + 1)}>
            Weiter
          </Button>
        </div>
      )}
    </div>
  );
}
