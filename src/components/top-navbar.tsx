"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/stores/auth-store";
import { NotificationBell } from "@/components/notification-bell";
import { useTranslation } from "@/hooks/use-translation";
import { MeeloLogo } from "@/components/meelo-logo";

export function TopNavbar() {
  const pathname = usePathname();
  const { user } = useAuthStore();
  const { t } = useTranslation();

  const navLinks = [
    { label: t.nav_home, href: "/" },
    { label: t.nav_explore, href: "/explore" },
    { label: t.nav_create, href: "/create" },
    { label: t.nav_activity, href: "/my-activities" },
  ];

  const displayName = user?.displayName || user?.email?.split("@")[0] || "User";
  const initial = displayName[0]?.toUpperCase() || "U";

  return (
    <header className="sticky top-0 z-50 w-full bg-[#000000] text-[#FFFFFF]">
      <div className="flex items-center justify-between h-16 px-6 lg:px-10">
        {/* Left: Logo + Nav links */}
        <div className="flex items-center gap-8">
          {/* Logo */}
          <Link href="/" className="hover:opacity-80 transition-opacity">
            <MeeloLogo variant="dark" size="sm" />
          </Link>

          {/* Nav links */}
          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    "px-4 py-2 rounded-full text-sm font-medium transition-colors",
                    isActive
                      ? "bg-[#FFFFFF]/15 text-[#FFFFFF]"
                      : "text-[#FFFFFF]/70 hover:bg-[#FFFFFF]/10 hover:text-[#FFFFFF]"
                  )}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Right: Notifications + Profile */}
        <div className="flex items-center gap-2">
          <NotificationBell />
          <Link
            href="/profile"
            className="flex items-center gap-2.5 px-3 py-1.5 rounded-full hover:bg-[#FFFFFF]/10 transition-colors"
          >
            {user?.photoURL ? (
              <img src={user.photoURL} alt="" className="h-8 w-8 rounded-full object-cover" />
            ) : (
              <div className="h-8 w-8 rounded-full bg-[#FFFFFF]/20 flex items-center justify-center text-xs font-bold text-[#FFFFFF]">
                {initial}
              </div>
            )}
            <span className="hidden lg:block text-sm font-medium text-[#FFFFFF]">
              {displayName}
            </span>
          </Link>
        </div>
      </div>
    </header>
  );
}
