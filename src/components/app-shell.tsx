"use client";

import { usePathname } from "next/navigation";
import { AuthProvider } from "@/components/auth-provider";
import { AuthGuard } from "@/components/auth-guard";
import { FirebaseProvider } from "@/components/firebase-provider";
import { TopNavbar } from "@/components/top-navbar";
import { MobileNav } from "@/components/mobile-nav";
import { PageTransition } from "@/components/page-transition";
import { Footer } from "@/components/footer";
import { useAuthStore } from "@/stores/auth-store";
import { useUserProfileSync } from "@/hooks/use-user-profile";
import { Toaster } from "sonner";
import { NativeBridge } from "@/components/native-bridge";
import { isPublicPath } from "@/lib/auth-redirect";

function AppContent({ children }: { children: React.ReactNode }) {
  const { user } = useAuthStore();
  useUserProfileSync();
  const pathname = usePathname();
  const isLoginPage = pathname === "/login";
  const isLegalPage = ["/privacy", "/terms", "/contact"].includes(pathname);

  // Legal pages — no auth required, no nav, just content + footer
  if (isLegalPage) {
    return (
      <>
        <PageTransition>{children}</PageTransition>
        <Footer />
      </>
    );
  }

  // Login page (and protected pages while redirecting to login) — no nav.
  // Guests browsing public pages (home, explore, activity) get the full app.
  if (isLoginPage || (!user && !isPublicPath(pathname))) {
    return (
      <>
        <PageTransition>{children}</PageTransition>
        <Footer />
      </>
    );
  }

  // Main layout (signed in, or guest browsing): Top navbar + content + mobile bottom nav
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
      <NativeBridge />
      <FirebaseProvider>
        <AuthGuard>
          <AppContent>{children}</AppContent>
        </AuthGuard>
      </FirebaseProvider>
    </AuthProvider>
  );
}
