import { requireAuth } from "@/lib/auth-helpers";
import { LeadListClient } from "@/components/crm/lead-list-client";

export default async function LeadsPage() {
  await requireAuth();
  return <LeadListClient />;
}
