"use client";

import { usePathname } from "next/navigation";
import { AuthProvider } from "@/components/auth-provider";
import { AuthGuard } from "@/components/auth-guard";
import { FirebaseProvider } from "@/components/firebase-provider";
import { TopNavbar } from "@/components/top-navbar";
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

  // Authenticated layout: Top navbar + content + mobile bottom nav
  return (
    <>
      {/* Top navbar (like Uber) */}
      <TopNavbar />

      {/* Main content — full width, no sidebar offset */}
      <main className="pb-20 md:pb-0">
        <PageTransition>{children}</PageTransition>
      </main>

      {/* Mobile bottom nav (small screens only) */}
      <div className="md:hidden">
        <MobileNav />
      </div>

      <Toaster position="bottom-right" richColors closeButton />
    </>
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
