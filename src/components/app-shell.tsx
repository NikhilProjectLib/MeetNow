"use client";

import { usePathname } from "next/navigation";
import { AuthProvider } from "@/components/auth-provider";
import { AuthGuard } from "@/components/auth-guard";
import { FirebaseProvider } from "@/components/firebase-provider";
import { SidebarNavigation } from "@/components/sidebar-navigation";
import { PageTransition } from "@/components/page-transition";
import { useAuthStore } from "@/stores/auth-store";

function AppContent({ children }: { children: React.ReactNode }) {
  const { user } = useAuthStore();
  const pathname = usePathname();
  const isLoginPage = pathname === "/login";

  // Login page — no sidebar, no padding
  if (isLoginPage || !user) {
    return <PageTransition>{children}</PageTransition>;
  }

  // Authenticated pages — sidebar + main content
  return (
    <div className="flex min-h-screen">
      <SidebarNavigation />
      <main className="flex-1 ml-64">
        <div className="max-w-6xl mx-auto p-8">
          <PageTransition>{children}</PageTransition>
        </div>
      </main>
    </div>
  );
}

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <FirebaseProvider>
        <AuthGuard>
          <AppContent>{children}</AppContent>
        </AuthGuard>
      </FirebaseProvider>
    </AuthProvider>
  );
}
