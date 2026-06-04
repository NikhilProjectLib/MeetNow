"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Compass, PlusCircle, User } from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { label: "Home", href: "/", icon: Home },
  { label: "Explore", href: "/explore", icon: Compass },
  { label: "Create", href: "/create", icon: PlusCircle },
  { label: "Profile", href: "/profile", icon: User },
];

export function BottomNavigation() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="mx-auto flex max-w-md items-center justify-around py-2">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          const isCreate = item.href === "/create";

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-col items-center gap-1 px-3 py-1 text-xs transition-colors",
                isActive
                  ? "text-primary"
                  : "text-muted-foreground hover:text-foreground",
                isCreate && "relative -top-2"
              )}
            >
              {isCreate ? (
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg">
                  <item.icon className="h-6 w-6" />
                </div>
              ) : (
                <item.icon className={cn("h-5 w-5", isActive && "text-primary")} />
              )}
              <span className={cn(isCreate && "mt-1")}>{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
