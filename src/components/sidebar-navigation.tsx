"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Compass, PlusCircle, User, Zap, CalendarCheck } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/stores/auth-store";

const navItems = [
  { label: "Home", href: "/", icon: Home, description: "Activity feed", color: "text-blue-600" },
  { label: "Explore", href: "/explore", icon: Compass, description: "Discover nearby", color: "text-emerald-600" },
  { label: "Create", href: "/create", icon: PlusCircle, description: "New activity", color: "text-purple-600" },
  { label: "My Activities", href: "/my-activities", icon: CalendarCheck, description: "Joined & history", color: "text-amber-600" },
  { label: "Profile", href: "/profile", icon: User, description: "Your account", color: "text-slate-600" },
];

export function SidebarNavigation() {
  const pathname = usePathname();
  const { user } = useAuthStore();

  const displayName = user?.displayName || user?.email?.split("@")[0] || "User";
  const initial = displayName[0]?.toUpperCase() || "U";

  return (
    <aside className="fixed left-0 top-0 z-50 flex h-screen w-64 flex-col border-r bg-card">
      {/* Logo */}
      <div className="flex items-center gap-2.5 px-6 py-6 border-b">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-purple-600 shadow-sm">
          <Zap className="h-5 w-5 text-white" />
        </div>
        <div>
          <span className="text-lg font-bold bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
            MeetNow
          </span>
          <p className="text-[10px] text-muted-foreground leading-none">Find your crew</p>
        </div>
      </div>

      {/* Nav Items */}
      <nav className="flex-1 px-3 py-4">
        <ul className="flex flex-col gap-1">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium transition-all",
                    isActive
                      ? "bg-primary/10 text-primary shadow-sm border border-primary/20"
                      : "text-muted-foreground hover:bg-accent hover:text-foreground"
                  )}
                >
                  <div className={cn(
                    "h-9 w-9 rounded-lg flex items-center justify-center transition-colors",
                    isActive ? "bg-primary/20" : "bg-secondary"
                  )}>
                    <item.icon className={cn("h-[18px] w-[18px]", isActive ? "text-primary" : item.color)} />
                  </div>
                  <div>
                    <p className={cn(isActive && "font-semibold")}>{item.label}</p>
                    <p className="text-[11px] font-normal text-muted-foreground">{item.description}</p>
                  </div>
                  {/* Active indicator dot */}
                  {isActive && (
                    <div className="ml-auto h-2 w-2 rounded-full bg-primary" />
                  )}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Footer */}
      <div className="border-t px-4 py-4">
        <div className="flex items-center gap-3 px-2">
          <div className="h-10 w-10 rounded-full bg-gradient-to-br from-primary/30 to-purple-200 flex items-center justify-center text-sm font-bold text-primary shadow-inner">
            {initial}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">{displayName}</p>
            <p className="text-[11px] text-muted-foreground truncate">{user?.email || ""}</p>
          </div>
        </div>
      </div>
    </aside>
  );
}
