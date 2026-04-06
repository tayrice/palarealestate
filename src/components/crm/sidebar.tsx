"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Inbox,
  Building2,
  LogOut,
  Settings,
  BarChart3,
  FileText,
} from "lucide-react";

interface SidebarProps {
  user: {
    id: string;
    name?: string | null;
    email?: string | null;
    role: string;
  };
}

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/leads", label: "Team Inbox", icon: Inbox },
  { href: "/leads/mine", label: "Meine Objekte", icon: Building2 },
];

const adminItems = [
  { href: "/admin", label: "Admin Übersicht", icon: BarChart3 },
  { href: "/admin/users", label: "Mitarbeiter", icon: Settings },
];

export function CRMSidebar({ user }: SidebarProps) {
  const pathname = usePathname();

  return (
    <div className="w-64 bg-gray-900 text-white flex flex-col h-full">
      {/* Logo */}
      <div className="p-6 border-b border-gray-700">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
            <Building2 className="h-5 w-5 text-white" />
          </div>
          <div>
            <div className="font-bold text-sm">Pala CRM</div>
            <div className="text-xs text-gray-400">Immobilien</div>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 p-4 space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = pathname === item.href || pathname.startsWith(item.href + "/");
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                active ? "bg-blue-600 text-white" : "text-gray-300 hover:bg-gray-800 hover:text-white"
              )}
            >
              <Icon className="h-4 w-4" />
              {item.label}
            </Link>
          );
        })}

        {user.role === "admin" && (
          <>
            <div className="pt-4 pb-1">
              <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider px-3">Admin</div>
            </div>
            {adminItems.map((item) => {
              const Icon = item.icon;
              const active = pathname === item.href || pathname.startsWith(item.href + "/");
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                    active ? "bg-blue-600 text-white" : "text-gray-300 hover:bg-gray-800 hover:text-white"
                  )}
                >
                  <Icon className="h-4 w-4" />
                  {item.label}
                </Link>
              );
            })}
          </>
        )}
      </nav>

      {/* User + Logout */}
      <div className="p-4 border-t border-gray-700">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-8 h-8 rounded-full bg-gray-600 flex items-center justify-center text-sm font-medium">
            {user.name?.charAt(0).toUpperCase() ?? "U"}
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-sm font-medium truncate">{user.name}</div>
            <div className="text-xs text-gray-400 capitalize">{user.role}</div>
          </div>
        </div>
        <button
          onClick={() => signOut({ callbackUrl: "/login" })}
          className="flex items-center gap-2 w-full px-3 py-2 text-sm text-gray-300 hover:bg-gray-800 hover:text-white rounded-lg transition-colors"
        >
          <LogOut className="h-4 w-4" />
          Abmelden
        </button>
      </div>
    </div>
  );
}
