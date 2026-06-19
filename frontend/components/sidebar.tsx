"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { logout } from "@/lib/auth";
import {
  LayoutDashboard,
  Users,
  CalendarDays,
  ClipboardList,
  LogOut,
} from "lucide-react";
import { Button } from "@/components/ui/button";

const nav = [
  { href: "/dashboard", label: "Inicio", icon: LayoutDashboard },
  { href: "/pacientes", label: "Pacientes", icon: Users },
  { href: "/sesiones", label: "Sesiones", icon: ClipboardList },
  { href: "/turnos", label: "Turnos", icon: CalendarDays },
];

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();

  function handleLogout() {
    logout();
    router.push("/login");
  }

  return (
    <aside className="flex flex-col w-60 min-h-screen bg-rose-900 text-white shrink-0">
      <div className="px-6 py-6 border-b border-rose-800">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-white rounded-full flex items-center justify-center">
            <span className="text-rose-900 font-bold text-sm">K</span>
          </div>
          <div>
            <p className="font-semibold text-sm leading-tight">Consultorio</p>
            <p className="text-rose-300 text-xs">Kenti</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-1">
        {nav.map(({ href, label, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            className={cn(
              "flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors",
              pathname === href || pathname.startsWith(href + "/")
                ? "bg-rose-700 text-white"
                : "text-rose-200 hover:bg-rose-800 hover:text-white"
            )}
          >
            <Icon size={18} />
            {label}
          </Link>
        ))}
      </nav>

      <div className="px-3 py-4 border-t border-rose-800">
        <Button
          variant="ghost"
          size="sm"
          className="w-full justify-start text-rose-200 hover:bg-rose-800 hover:text-white"
          onClick={handleLogout}
        >
          <LogOut size={18} className="mr-2" />
          Cerrar sesión
        </Button>
      </div>
    </aside>
  );
}
