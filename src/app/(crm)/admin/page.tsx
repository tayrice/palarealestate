import { requireAdmin } from "@/lib/auth-helpers";
import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, Clock, Inbox, Users } from "lucide-react";

export default async function AdminOverviewPage() {
  await requireAdmin();

  const since24h = new Date(Date.now() - 24 * 60 * 60 * 1000);

  const [openLeads, staleLeads, overdueTasks, userLoad, monthStats, users] = await Promise.all([
    prisma.lead.count({ where: { status: "open" } }),
    prisma.lead.count({
      where: {
        status: { in: ["open", "claimed"] },
        lastActivityAt: { lt: since24h },
      },
    }),
    prisma.task.count({ where: { doneAt: null, dueAt: { lt: new Date() } } }),
    prisma.lead.groupBy({
      by: ["ownerId"],
      where: { status: "claimed", ownerId: { not: null } },
      _count: true,
      orderBy: { _count: { id: "desc" } },
    }),
    prisma.lead.groupBy({
      by: ["closedResult"],
      where: {
        status: "closed",
        closedAt: { gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1) },
      },
      _count: true,
    }),
    prisma.user.findMany({ select: { id: true, name: true, email: true, role: true }, orderBy: { createdAt: "asc" } }),
  ]);

  const won = monthStats.find((m) => m.closedResult === "won")?._count ?? 0;
  const lost = monthStats.find((m) => m.closedResult === "lost")?._count ?? 0;
  const loadByUser = new Map(userLoad.map((x) => [x.ownerId, x._count]));

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Admin Übersicht</h1>
        <p className="text-sm text-gray-500 mt-0.5">Operative Kennzahlen und Teamauslastung</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <MetricCard title="Offene Leads" value={openLeads} icon={Inbox} />
        <MetricCard title=">24h inaktiv" value={staleLeads} icon={Clock} danger={staleLeads > 0} />
        <MetricCard title="Überfällige Tasks" value={overdueTasks} icon={AlertTriangle} danger={overdueTasks > 0} />
        <MetricCard title="Teamgröße" value={users.length} icon={Users} />
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Abschlüsse im aktuellen Monat</CardTitle>
        </CardHeader>
        <CardContent className="flex gap-8">
          <div>
            <div className="text-3xl font-bold text-green-600">{won}</div>
            <div className="text-sm text-gray-500">Gewonnen</div>
          </div>
          <div>
            <div className="text-3xl font-bold text-red-500">{lost}</div>
            <div className="text-sm text-gray-500">Verloren</div>
          </div>
          <div>
            <div className="text-3xl font-bold text-gray-700">{won + lost}</div>
            <div className="text-sm text-gray-500">Gesamt</div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Teamauslastung (übernommene Objekte)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {users.map((user) => {
              const load = loadByUser.get(user.id) ?? 0;
              return (
                <div key={user.id} className="flex items-center justify-between rounded-lg border border-gray-200 px-3 py-2">
                  <div>
                    <div className="text-sm font-medium text-gray-900">{user.name}</div>
                    <div className="text-xs text-gray-500">{user.email}</div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={user.role === "admin" ? "secondary" : "outline"}>{user.role}</Badge>
                    <Badge variant="warning">{load} aktiv</Badge>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function MetricCard({
  title,
  value,
  icon: Icon,
  danger,
}: {
  title: string;
  value: number;
  icon: any;
  danger?: boolean;
}) {
  return (
    <Card>
      <CardContent className="p-5">
        <div className={`mb-3 inline-flex h-10 w-10 items-center justify-center rounded-xl ${danger ? "bg-red-50 text-red-600" : "bg-blue-50 text-blue-600"}`}>
          <Icon className="h-5 w-5" />
        </div>
        <div className="text-2xl font-bold text-gray-900">{value}</div>
        <div className="text-sm text-gray-500">{title}</div>
      </CardContent>
    </Card>
  );
}
