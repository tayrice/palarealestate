import { requireAuth } from "@/lib/auth-helpers";
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { LeadDetailClient } from "@/components/crm/lead-detail-client";

export default async function LeadDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await requireAuth();
  const { id } = await params;

  const lead = await prisma.lead.findUnique({
    where: { id },
    include: {
      owner: { select: { id: true, name: true, email: true } },
      comments: {
        include: { author: { select: { id: true, name: true } } },
        orderBy: { createdAt: "asc" },
      },
      tasks: {
        include: { assignee: { select: { id: true, name: true } } },
        orderBy: { dueAt: "asc" },
      },
      documents: { orderBy: { createdAt: "desc" } },
      features: true,
      activityLogs: {
        include: { user: { select: { id: true, name: true } } },
        orderBy: { createdAt: "desc" },
        take: 50,
      },
    },
  });

  if (!lead) notFound();

  const allUsers = await prisma.user.findMany({ select: { id: true, name: true, role: true } });

  return (
    <LeadDetailClient
      lead={JSON.parse(JSON.stringify(lead))}
      currentUser={session.user}
      allUsers={allUsers}
    />
  );
}
