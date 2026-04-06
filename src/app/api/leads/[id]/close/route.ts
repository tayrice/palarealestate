import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const closeSchema = z.object({
  result: z.enum(["won", "lost"]),
  reason: z.string().optional(),
  comment: z.string().optional(),
});

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const body = await req.json();
  const { result, reason, comment } = closeSchema.parse(body);

  if (result === "lost" && !reason) {
    return NextResponse.json({ error: "Verlustgrund ist Pflicht" }, { status: 400 });
  }

  const lead = await prisma.lead.update({
    where: { id },
    data: {
      status: "closed",
      closedAt: new Date(),
      closedResult: result,
      closedReason: reason as any,
      closedComment: comment,
      lastActivityAt: new Date(),
    },
  });

  await prisma.activityLog.create({
    data: { leadId: id, userId: session.user.id, eventType: "lead_closed", metadata: { result, reason } },
  });

  return NextResponse.json(lead);
}
