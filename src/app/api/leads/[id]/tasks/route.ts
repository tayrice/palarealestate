import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const { type, description, dueAt } = z.object({
    type: z.string().default("followup"),
    description: z.string().optional(),
    dueAt: z.string(),
  }).parse(await req.json());

  const task = await prisma.task.create({
    data: {
      leadId: id,
      type: type as any,
      description,
      dueAt: new Date(dueAt),
      createdBy: session.user.id,
      assignedTo: session.user.id,
    },
  });

  await prisma.lead.update({ where: { id }, data: { lastActivityAt: new Date() } });
  return NextResponse.json(task, { status: 201 });
}
