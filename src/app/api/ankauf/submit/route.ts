import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const submitSchema = z.object({
  // Step 1
  source: z.enum(["ankaufstation", "besichtigung", "website", "other"]).default("ankaufstation"),
  // Step 2 – Immobiliendaten
  propertyType: z.string().min(1, "Immobilienart ist Pflicht"),
  address: z.string().min(1, "Adresse ist Pflicht"),
  city: z.string().min(1, "Stadt ist Pflicht"),
  zip: z.string().optional(),
  objectRef: z.string().optional(),
  yearBuilt: z.string().optional(),
  livingArea: z.number().positive(),
  plotArea: z.number().optional(),
  rooms: z.string().optional(),
  bathrooms: z.number().optional(),
  floor: z.number().optional(),
  totalFloors: z.number().optional(),
  condition: z.string().optional(),
  energyClass: z.string().optional(),
  hasGarage: z.boolean().optional(),
  propertyNotes: z.string().optional(),
  // Step 3 – Fotos
  photos: z.array(z.string()).optional().default([]),
  // Step 4 – Preis & Zeitraum
  priceExpectation: z.number().optional(),
  sellTimeline: z.string().optional(),
  // Step 5 – Kontakt
  customerName: z.string().min(1, "Name ist Pflicht"),
  customerPhone: z.string().min(1, "Telefon ist Pflicht"),
  customerEmail: z.string().email().optional().or(z.literal("")),
  whatsappOptIn: z.boolean().default(false),
  dsgvoAccepted: z.boolean().refine((v) => v === true, "DSGVO Zustimmung ist Pflicht"),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const data = submitSchema.parse(body);

    const lead = await prisma.lead.create({
      data: {
        status: "open",
        source: data.source,
        customerName: data.customerName,
        customerPhone: data.customerPhone,
        customerEmail: data.customerEmail || null,
        whatsappOptIn: data.whatsappOptIn,
        propertyType: data.propertyType,
        address: data.address,
        city: data.city,
        zip: data.zip,
        objectRef: data.objectRef,
        yearBuilt: data.yearBuilt,
        livingArea: data.livingArea,
        plotArea: data.plotArea,
        rooms: data.rooms,
        bathrooms: data.bathrooms,
        floor: data.floor,
        totalFloors: data.totalFloors,
        condition: data.condition,
        energyClass: data.energyClass,
        hasGarage: data.hasGarage,
        propertyNotes: data.propertyNotes,
        photos: JSON.stringify(data.photos),
        priceExpectation: data.priceExpectation,
        sellTimeline: data.sellTimeline,
        lastActivityAt: new Date(),
      },
    });

    // System-Task: Erstkontakt in 60 Minuten
    await prisma.task.create({
      data: {
        leadId: lead.id,
        type: "contact",
        description: "Neues Objekt – Erstkontakt herstellen",
        dueAt: new Date(Date.now() + 60 * 60 * 1000),
        createdBy: "system",
      },
    });

    await prisma.activityLog.create({
      data: {
        leadId: lead.id,
        eventType: "lead_created",
        metadata: { source: data.source },
      },
    });

    return NextResponse.json({ success: true, refNumber: lead.refNumber, id: lead.id }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ success: false, errors: error.issues }, { status: 400 });
    }
    console.error("Lead submit error:", error);
    return NextResponse.json({ success: false, message: "Interner Fehler" }, { status: 500 });
  }
}
