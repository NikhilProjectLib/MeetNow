"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Compass, PlusCircle, User, CalendarCheck } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/stores/auth-store";

const navItems = [
  { label: "Home", href: "/", icon: Home },
  { label: "Explore", href: "/explore", icon: Compass },
  { label: "Create", href: "/create", icon: PlusCircle },
  { label: "My Activities", href: "/my-activities", icon: CalendarCheck },
  { label: "Profile", href: "/profile", icon: User },
];

export function SidebarNavigation() {
  const pathname = usePathname();
  const { user } = useAuthStore();

  const displayName = user?.displayName || user?.email?.split("@")[0] || "User";
  const initial = displayName[0]?.toUpperCase() || "U";

  return (
    <aside className="fixed left-0 top-0 z-50 flex h-screen w-64 flex-col border-r border-[#E2E2E2] dark:border-[#333333] bg-[#FFFFFF] dark:bg-[#000000]">
      {/* Logo — Uber uses bold wordmark */}
      <div className="flex items-center px-6 py-6">
        <span className="text-[1.5rem] font-black tracking-tight text-[#000000] dark:text-[#FFFFFF]">
          MeetNow
        </span>
      </div>

      {/* Nav Items */}
      <nav className="flex-1 px-3 py-2">
        <ul className="flex flex-col gap-0.5">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium transition-all",
                    isActive
                      ? "bg-[#F6F6F6] dark:bg-[#1A1A1A] text-[#000000] dark:text-[#FFFFFF] font-semibold"
                      : "text-[#6B6B6B] hover:bg-[#F6F6F6] dark:hover:bg-[#1A1A1A] hover:text-[#000000] dark:hover:text-[#FFFFFF]"
                  )}
                >
                  <item.icon className={cn(
                    "h-5 w-5",
                    isActive ? "text-[#000000] dark:text-[#FFFFFF]" : "text-[#6B6B6B]"
                  )} />
                  <span>{item.label}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* User footer */}
      <div className="border-t border-[#E2E2E2] dark:border-[#333333] px-4 py-4">
        <div className="flex items-center gap-3 px-2">
          {user?.photoURL ? (
            <img src={user.photoURL} alt="" className="h-9 w-9 rounded-full object-cover" />
          ) : (
            <div className="h-9 w-9 rounded-full bg-[#F6F6F6] dark:bg-[#1A1A1A] flex items-center justify-center text-sm font-bold text-[#000000] dark:text-[#FFFFFF]">
              {initial}
            </div>
          )}
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-[#000000] dark:text-[#FFFFFF] truncate">{displayName}</p>
            <p className="text-[11px] text-[#6B6B6B] truncate">{user?.email || ""}</p>
          </div>
        </div>
      </div>
    </aside>
  );
}
