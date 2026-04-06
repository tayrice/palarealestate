import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const { content } = z.object({ content: z.string().min(1) }).parse(await req.json());

  const comment = await prisma.leadComment.create({
    data: { leadId: id, authorId: session.user.id, content },
    include: { author: { select: { id: true, name: true } } },
  });

  await prisma.lead.update({ where: { id }, data: { lastActivityAt: new Date() } });

  await prisma.activityLog.create({
    data: { leadId: id, userId: session.user.id, eventType: "comment_added" },
  });

  return NextResponse.json(comment, { status: 201 });
}
