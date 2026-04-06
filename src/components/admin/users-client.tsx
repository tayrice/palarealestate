"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";

interface UserItem {
  id: string;
  name: string;
  email: string;
  role: string;
  createdAt: string;
}

export function AdminUsersClient({ initialUsers }: { initialUsers: UserItem[] }) {
  const [users, setUsers] = useState<UserItem[]>(initialUsers);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("staff");
  const [submitting, setSubmitting] = useState(false);
  const { toast } = useToast();

  async function reloadUsers() {
    const res = await fetch("/api/admin/users");
    if (!res.ok) return;
    const data = await res.json();
    setUsers(data.users ?? []);
  }

  async function createUser() {
    if (!name || !email || password.length < 6) {
      toast({ title: "Eingaben prüfen", description: "Name, E-Mail und Passwort (min. 6 Zeichen) sind Pflicht.", variant: "destructive" });
      return;
    }

    setSubmitting(true);
    const res = await fetch("/api/admin/users", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, password, role }),
    });

    if (res.ok) {
      toast({ title: "Mitarbeiter erstellt" });
      setName("");
      setEmail("");
      setPassword("");
      setRole("staff");
      await reloadUsers();
    } else {
      const error = await res.json().catch(() => ({}));
      toast({ title: "Fehler", description: error.error ?? "Konnte Nutzer nicht anlegen", variant: "destructive" });
    }
    setSubmitting(false);
  }

  async function updateRole(userId: string, nextRole: string) {
    const res = await fetch(`/api/admin/users/${userId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ role: nextRole }),
    });

    if (res.ok) {
      toast({ title: "Rolle aktualisiert" });
      await reloadUsers();
    } else {
      const error = await res.json().catch(() => ({}));
      toast({ title: "Fehler", description: error.error ?? "Konnte Rolle nicht ändern", variant: "destructive" });
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Neuen Mitarbeiter anlegen</CardTitle>
        </CardHeader>
        <CardContent className="grid md:grid-cols-5 gap-3">
          <Input placeholder="Name" value={name} onChange={(e) => setName(e.target.value)} />
          <Input placeholder="E-Mail" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
          <Input placeholder="Passwort" type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
          <Select value={role} onValueChange={setRole}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="staff">staff</SelectItem>
              <SelectItem value="admin">admin</SelectItem>
            </SelectContent>
          </Select>
          <Button onClick={createUser} disabled={submitting}>
            {submitting ? "Speichern..." : "Anlegen"}
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Mitarbeiter</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {users.map((user) => (
            <div key={user.id} className="flex items-center justify-between rounded-lg border border-gray-200 p-3">
              <div>
                <div className="text-sm font-medium text-gray-900">{user.name}</div>
                <div className="text-xs text-gray-500">{user.email}</div>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant={user.role === "admin" ? "secondary" : "outline"}>{user.role}</Badge>
                <Select value={user.role} onValueChange={(next) => updateRole(user.id, next)}>
                  <SelectTrigger className="w-28">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="staff">staff</SelectItem>
                    <SelectItem value="admin">admin</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
