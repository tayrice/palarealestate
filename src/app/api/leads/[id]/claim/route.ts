import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const claimSchema = z.object({
  nextActionAt: z.string().min(1, "Nächste Aktion ist Pflicht"),
});

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const body = await req.json();
  const { nextActionAt } = claimSchema.parse(body);

  const lead = await prisma.lead.findUnique({ where: { id } });
  if (!lead) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (lead.status !== "open") return NextResponse.json({ error: "Lead ist nicht offen" }, { status: 400 });

  const updated = await prisma.lead.update({
    where: { id },
    data: {
      status: "claimed",
      ownerId: session.user.id,
      claimedAt: new Date(),
      nextActionAt: new Date(nextActionAt),
      lastActivityAt: new Date(),
    },
  });

  // System-Task: Kontakt in 60 Minuten
  await prisma.task.create({
    data: {
      leadId: id,
      type: "contact",
      description: "Lead übernommen – Erstkontakt herstellen",
      dueAt: new Date(Date.now() + 60 * 60 * 1000),
      createdBy: "system",
      assignedTo: session.user.id,
    },
  });

  await prisma.activityLog.create({
    data: { leadId: id, userId: session.user.id, eventType: "lead_claimed" },
  });

  return NextResponse.json(updated);
}
