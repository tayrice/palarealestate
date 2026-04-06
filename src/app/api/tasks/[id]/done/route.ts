import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const task = await prisma.task.update({
    where: { id },
    data: { doneAt: new Date() },
  });

  await prisma.activityLog.create({
    data: { leadId: task.leadId, userId: session.user.id, eventType: "task_done", metadata: { taskId: id } },
  });

  return NextResponse.json(task);
}
