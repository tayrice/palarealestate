import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const { type } = await req.json();

  // Immobilien-Dokument-Templates
  const templates: Record<string, object> = {
    offer: {
      title: "Kaufangebot",
      intro: "Wir unterbreiten Ihnen folgendes unverbindliches Kaufangebot für die genannte Immobilie:",
      fields: ["Objekt", "Adresse", "Kaufpreis", "Zahlungsbedingungen", "Übergabetermin"],
    },
    reservation: {
      title: "Reservierungsvereinbarung",
      intro: "Die nachstehende Immobilie wird für den genannten Zeitraum reserviert:",
      fields: ["Objekt", "Adresse", "Reservierungszeitraum", "Reservierungsgebühr"],
    },
    contract_draft: {
      title: "ENTWURF – Kaufvertrag (nicht final)",
      watermark: "ENTWURF – nicht final",
      intro: "Dies ist ein Vertragsentwurf und entfaltet keine rechtliche Bindungswirkung.",
      fields: ["Verkäufer", "Käufer", "Kaufgegenstand", "Kaufpreis", "Übergabe", "Gewährleistung"],
    },
  };

  const doc = await prisma.document.create({
    data: {
      leadId: id,
      type: type as any,
      status: "draft",
      content: templates[type] ?? {},
    },
  });

  await prisma.activityLog.create({
    data: { leadId: id, userId: session.user.id, eventType: "document_created", metadata: { type } },
  });

  return NextResponse.json(doc, { status: 201 });
}
