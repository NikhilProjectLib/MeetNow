"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Compass, PlusCircle, CalendarCheck, User } from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { label: "Home", href: "/", icon: Home },
  { label: "Explore", href: "/explore", icon: Compass },
  { label: "Create", href: "/create", icon: PlusCircle },
  { label: "My Stuff", href: "/my-activities", icon: CalendarCheck },
  { label: "Profile", href: "/profile", icon: User },
];

export function MobileNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 lg:hidden">
      <div className="flex items-center justify-around py-2">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          const isCreate = item.href === "/create";

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-col items-center gap-0.5 px-2 py-1 text-[10px] transition-colors",
                isActive ? "text-primary" : "text-muted-foreground"
              )}
            >
              {isCreate ? (
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-md -mt-4">
                  <item.icon className="h-5 w-5" />
                </div>
              ) : (
                <item.icon className="h-5 w-5" />
              )}
              <span className={cn(isCreate && "mt-1")}>{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
