import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// Cron-Job: alle 15 Minuten aufrufen
// Sichern mit CRON_SECRET Header
export async function GET(req: NextRequest) {
  const secret = req.headers.get("x-cron-secret");
  if (secret !== process.env.CRON_SECRET && process.env.NODE_ENV !== "development") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const now = new Date();
  const results: Record<string, number> = {};

  // Regel 1: 24h keine Aktivität bei claimed → Warning-Flag
  const inactiveLeads = await prisma.lead.findMany({
    where: {
      status: "claimed",
      lastActivityAt: { lt: new Date(now.getTime() - 24 * 60 * 60 * 1000) },
    },
    include: { owner: true },
  });
  results.inactive24h = inactiveLeads.length;

  // Aktivitäten loggen falls noch nicht gelogged in letzten 24h
  for (const lead of inactiveLeads) {
    const existing = await prisma.activityLog.findFirst({
      where: {
        leadId: lead.id,
        eventType: "inactivity_warning_24h",
        createdAt: { gte: new Date(now.getTime() - 24 * 60 * 60 * 1000) },
      },
    });
    if (!existing) {
      await prisma.activityLog.create({
        data: { leadId: lead.id, eventType: "inactivity_warning_24h" },
      });
    }
  }

  // Regel 2: 48h keine Aktivität bei claimed → zurück auf open
  const autoReopenLeads = await prisma.lead.findMany({
    where: {
      status: "claimed",
      lastActivityAt: { lt: new Date(now.getTime() - 48 * 60 * 60 * 1000) },
    },
  });
  results.autoReopen = autoReopenLeads.length;

  for (const lead of autoReopenLeads) {
    await prisma.lead.update({
      where: { id: lead.id },
      data: { status: "open", ownerId: null, lastActivityAt: new Date() },
    });
    await prisma.activityLog.create({
      data: { leadId: lead.id, eventType: "auto_reopened", metadata: { reason: "48h_inactivity" } },
    });
  }

  return NextResponse.json({ success: true, timestamp: now.toISOString(), ...results });
}
