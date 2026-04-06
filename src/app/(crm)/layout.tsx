import { requireAuth } from "@/lib/auth-helpers";
import { CRMSidebar } from "@/components/crm/sidebar";

export default async function CRMLayout({ children }: { children: React.ReactNode }) {
  const session = await requireAuth();
  return (
    <div className="flex h-screen bg-gray-50">
      <CRMSidebar user={session.user} />
      <main className="flex-1 overflow-auto">
        {children}
      </main>
    </div>
  );
}
