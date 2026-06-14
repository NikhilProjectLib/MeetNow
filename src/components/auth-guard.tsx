"use client";

import { useAuthStore } from "@/stores/auth-store";
import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";
import { Loader2, Zap } from "lucide-react";

const publicPaths = ["/login", "/privacy", "/terms", "/contact"];

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuthStore();
  const pathname = usePathname();
  const router = useRouter();

  const isPublicPath = publicPaths.includes(pathname);
  const isLoginPage = pathname === "/login";

  useEffect(() => {
    if (!isLoading && !user && !isPublicPath) {
      router.push("/login");
    }
    if (!isLoading && user && isLoginPage) {
      router.push("/");
    }
  }, [user, isLoading, isPublicPath, isLoginPage, router]);

  // Public pages render immediately — no auth check needed
  if (isPublicPath) {
    return <>{children}</>;
  }

  // Loading state (only for protected pages)
  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-purple-600 shadow-lg">
          <Zap className="h-7 w-7 text-white" />
        </div>
        <Loader2 className="h-5 w-5 animate-spin text-primary" />
      </div>
    );
  }

  // Not logged in and on protected page — show nothing while redirecting
  if (!user) {
    return null;
  }

  return <>{children}</>;
}
