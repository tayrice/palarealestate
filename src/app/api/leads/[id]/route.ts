import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const lead = await prisma.lead.findUnique({
    where: { id },
    include: {
      owner: { select: { id: true, name: true, email: true } },
      comments: { include: { author: { select: { id: true, name: true } } }, orderBy: { createdAt: "asc" } },
      tasks: { include: { assignee: { select: { id: true, name: true } } }, orderBy: { dueAt: "asc" } },
      documents: { orderBy: { createdAt: "desc" } },
      features: true,
      activityLogs: { include: { user: { select: { id: true, name: true } } }, orderBy: { createdAt: "desc" }, take: 50 },
    },
  });

  if (!lead) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(lead);
}

const patchSchema = z.object({
  priority: z.enum(["low", "normal", "high"]).optional(),
  ownerId: z.string().optional().nullable(),
  nextActionAt: z.string().optional(),
  status: z.enum(["open", "claimed", "closed"]).optional(),
}).partial();

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const body = await req.json();
  const data = patchSchema.parse(body);

  const lead = await prisma.lead.update({
    where: { id },
    data: { ...data, lastActivityAt: new Date() },
  });

  await prisma.activityLog.create({
    data: { leadId: id, userId: session.user.id, eventType: "lead_updated", metadata: data as object },
  });

  return NextResponse.json(lead);
}
