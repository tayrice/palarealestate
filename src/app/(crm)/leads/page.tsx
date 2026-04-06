import { requireAuth } from "@/lib/auth-helpers";
import { prisma } from "@/lib/prisma";
import { LeadListClient } from "@/components/crm/lead-list-client";

export default async function LeadsPage() {
  await requireAuth();
  return <LeadListClient />;
}
