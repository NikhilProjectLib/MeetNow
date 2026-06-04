"use client";

import { usePathname } from "next/navigation";
import { AuthProvider } from "@/components/auth-provider";
import { AuthGuard } from "@/components/auth-guard";
import { FirebaseProvider } from "@/components/firebase-provider";
import { SidebarNavigation } from "@/components/sidebar-navigation";
import { MobileNav } from "@/components/mobile-nav";
import { PageTransition } from "@/components/page-transition";
import { useAuthStore } from "@/stores/auth-store";
import { Toaster } from "sonner";

function AppContent({ children }: { children: React.ReactNode }) {
  const { user } = useAuthStore();
  const pathname = usePathname();
  const isLoginPage = pathname === "/login";

  // Login page — no nav
  if (isLoginPage || !user) {
    return <PageTransition>{children}</PageTransition>;
  }

  // Authenticated pages — sidebar (desktop) + bottom nav (mobile)
  return (
    <>
      {/* Desktop sidebar */}
      <div className="hidden lg:block">
        <SidebarNavigation />
      </div>

      {/* Main content */}
      <main className="lg:ml-64 pb-20 lg:pb-0">
        <div className="max-w-6xl mx-auto p-4 lg:p-8">
          <PageTransition>{children}</PageTransition>
        </div>
      </main>

      {/* Mobile bottom nav */}
      <MobileNav />
    </>
  );
}

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <FirebaseProvider>
        <AuthGuard>
          <AppContent>{children}</AppContent>
          <Toaster position="bottom-right" richColors closeButton />
        </AuthGuard>
      </FirebaseProvider>
    </AuthProvider>
  );
}
