import { requireAuth } from "@/lib/auth-helpers";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Building2, Inbox, AlertTriangle, CheckCircle2, Clock, TrendingUp
} from "lucide-react";
import { formatRelative, isOverdue } from "@/lib/utils";

export default async function DashboardPage() {
  const session = await requireAuth();
  const userId = session.user.id;
  const isAdmin = session.user.role === "admin";

  const [openLeads, myLeads, overdueLeads, todayTasks, monthStats] = await Promise.all([
    prisma.lead.count({ where: { status: "open" } }),
    prisma.lead.findMany({
      where: { ownerId: userId, status: "claimed" },
      orderBy: { nextActionAt: "asc" },
      take: 5,
      include: { tasks: { where: { doneAt: null }, orderBy: { dueAt: "asc" }, take: 1 } },
    }),
    prisma.lead.count({ where: { nextActionAt: { lt: new Date() }, status: "claimed" } }),
    prisma.task.count({
      where: {
        doneAt: null,
        dueAt: { gte: new Date(new Date().setHours(0, 0, 0, 0)), lt: new Date(new Date().setHours(23, 59, 59)) },
        assignedTo: userId,
      },
    }),
    prisma.lead.groupBy({
      by: ["closedResult"],
      where: {
        status: "closed",
        closedAt: { gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1) },
      },
      _count: true,
    }),
  ]);

  const won = monthStats.find((s) => s.closedResult === "won")?._count ?? 0;
  const lost = monthStats.find((s) => s.closedResult === "lost")?._count ?? 0;

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Guten Tag, {session.user.name} 👋</h1>
        <p className="text-gray-500 text-sm mt-0.5">Ihre Übersicht für heute</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard
          icon={Inbox}
          label="Offene Leads"
          value={openLeads}
          href="/leads?status=open"
          color="blue"
        />
        <StatCard
          icon={Building2}
          label="Meine Objekte"
          value={myLeads.length}
          href="/leads/mine"
          color="purple"
        />
        <StatCard
          icon={AlertTriangle}
          label="Überfällig"
          value={overdueLeads}
          href="/leads?status=claimed"
          color={overdueLeads > 0 ? "red" : "gray"}
        />
        <StatCard
          icon={Clock}
          label="Tasks heute"
          value={todayTasks}
          color="orange"
        />
      </div>

      {/* Monat */}
      <Card>
        <CardHeader><CardTitle className="text-base flex items-center gap-2"><TrendingUp className="h-4 w-4" /> Abschlüsse diesen Monat</CardTitle></CardHeader>
        <CardContent className="flex gap-6">
          <div>
            <div className="text-3xl font-bold text-green-600">{won}</div>
            <div className="text-sm text-gray-500">Gewonnen</div>
          </div>
          <div>
            <div className="text-3xl font-bold text-red-500">{lost}</div>
            <div className="text-sm text-gray-500">Verloren</div>
          </div>
          {won + lost > 0 && (
            <div>
              <div className="text-3xl font-bold text-gray-700">
                {Math.round((won / (won + lost)) * 100)}%
              </div>
              <div className="text-sm text-gray-500">Abschlussquote</div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Meine Leads */}
      {myLeads.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Meine übernommenen Objekte</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {myLeads.map((lead) => {
              const nextTask = lead.tasks[0];
              const isLate = lead.nextActionAt ? isOverdue(lead.nextActionAt) : false;
              return (
                <Link key={lead.id} href={`/leads/${lead.id}`}>
                  <div className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition-colors border border-gray-100">
                    <div>
                      <div className="font-medium text-sm text-gray-900">{lead.customerName}</div>
                      <div className="text-xs text-gray-400 mt-0.5">{formatRelative(lead.lastActivityAt)}</div>
                    </div>
                    <div className="flex items-center gap-2">
                      {isLate && <AlertTriangle className="h-4 w-4 text-red-500" />}
                      <Badge variant="warning">Aktiv</Badge>
                    </div>
                  </div>
                </Link>
              );
            })}
            <Link href="/leads/mine">
              <Button variant="outline" size="sm" className="w-full mt-2">Alle anzeigen</Button>
            </Link>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function StatCard({
  icon: Icon, label, value, href, color,
}: {
  icon: any; label: string; value: number; href?: string; color: "blue" | "purple" | "red" | "gray" | "orange";
}) {
  const colors = {
    blue: "bg-blue-50 text-blue-600",
    purple: "bg-purple-50 text-purple-600",
    red: "bg-red-50 text-red-600",
    gray: "bg-gray-50 text-gray-500",
    orange: "bg-orange-50 text-orange-600",
  };

  const card = (
    <Card className={href ? "cursor-pointer hover:shadow-md transition-shadow" : ""}>
      <CardContent className="p-5">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${colors[color]}`}>
          <Icon className="h-5 w-5" />
        </div>
        <div className="text-2xl font-bold text-gray-900">{value}</div>
        <div className="text-sm text-gray-500">{label}</div>
      </CardContent>
    </Card>
  );

  if (href) return <Link href={href}>{card}</Link>;
  return card;
}
