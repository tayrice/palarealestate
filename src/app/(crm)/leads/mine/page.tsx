import Link from "next/link";
import { requireAuth } from "@/lib/auth-helpers";
import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Building2, CalendarClock, PhoneCall } from "lucide-react";
import { formatDateTime, formatPrice, LEAD_STATUS_LABELS } from "@/lib/utils";

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

export default async function MyLeadsPage() {
  const session = await requireAuth();

  const leads = await prisma.lead.findMany({
    where: { ownerId: session.user.id },
    orderBy: { updatedAt: "desc" },
    take: 100,
  });

  return (
    <div className="p-6 space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Meine Objekte</h1>
          <p className="text-sm text-gray-500 mt-0.5">{leads.length} zugewiesene Leads</p>
        </div>
        <Link href="/leads">
          <Button variant="outline">Zur Team Inbox</Button>
        </Link>
      </div>

      {leads.length === 0 ? (
        <Card>
          <CardContent className="py-14 text-center text-gray-500">
            <Building2 className="h-10 w-10 mx-auto mb-3 text-gray-300" />
            Noch keine zugewiesenen Objekte.
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {leads.map((lead) => (
            <Link key={lead.id} href={`/leads/${lead.id}`}>
              <Card className="hover:shadow-md transition-shadow">
                <CardHeader className="pb-2">
                  <CardTitle className="text-base flex items-center justify-between gap-2">
                    <span>{lead.customerName}</span>
                    <Badge variant={STATUS_VARIANT[lead.status] ?? "secondary"}>
                      {LEAD_STATUS_LABELS[lead.status] ?? lead.status}
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-sm text-gray-600 space-y-1">
                  <div>
                    {lead.propertyType ? PROPERTY_TYPE_LABELS[lead.propertyType] ?? lead.propertyType : "Immobilie"}
                    {lead.address ? ` · ${lead.address}` : ""}
                    {lead.city ? `, ${lead.city}` : ""}
                  </div>
                  <div className="flex flex-wrap gap-4 text-xs text-gray-500">
                    <span className="inline-flex items-center gap-1"><PhoneCall className="h-3 w-3" />{lead.customerPhone}</span>
                    <span className="inline-flex items-center gap-1"><CalendarClock className="h-3 w-3" />Aktualisiert: {formatDateTime(lead.updatedAt)}</span>
                    {lead.priceExpectation ? <span>{formatPrice(lead.priceExpectation)}</span> : null}
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
