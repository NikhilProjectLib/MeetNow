"use client";

import { useAuthStore } from "@/stores/auth-store";
import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";
import { Loader2, Zap } from "lucide-react";

const publicPaths = ["/login"];

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuthStore();
  const pathname = usePathname();
  const router = useRouter();

  const isPublicPath = publicPaths.includes(pathname);

  useEffect(() => {
    if (!isLoading && !user && !isPublicPath) {
      router.push("/login");
    }
    if (!isLoading && user && isPublicPath) {
      router.push("/");
    }
  }, [user, isLoading, isPublicPath, router]);

  // Loading state
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
  if (!user && !isPublicPath) {
    return null;
  }

  // Logged in and on login page — show nothing while redirecting
  if (user && isPublicPath) {
    return null;
  }

  return <>{children}</>;
}
