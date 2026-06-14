"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Compass, PlusCircle, CalendarCheck, User } from "lucide-react";
import { cn } from "@/lib/utils";
import { useTranslation } from "@/hooks/use-translation";

export function MobileNav() {
  const pathname = usePathname();
  const { t } = useTranslation();

  const navItems = [
    { label: t.nav_home, href: "/", icon: Home },
    { label: t.nav_explore, href: "/explore", icon: Compass },
    { label: t.nav_create, href: "/create", icon: PlusCircle },
    { label: t.nav_activity, href: "/my-activities", icon: CalendarCheck },
    { label: t.nav_profile, href: "/profile", icon: User },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-[#E2E2E2] dark:border-[#333333] bg-[#FFFFFF] dark:bg-[#000000]">
      <div className="flex items-center justify-around py-2.5">
        {navItems.map((item) => {
          const isActive = pathname === item.href;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-col items-center gap-1 px-3 py-1 text-[10px] font-medium transition-colors",
                isActive
                  ? "text-[#000000] dark:text-[#FFFFFF]"
                  : "text-[#6B6B6B]"
              )}
            >
              <item.icon className={cn(
                "h-5 w-5",
                isActive ? "text-[#000000] dark:text-[#FFFFFF]" : "text-[#6B6B6B]"
              )} />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
