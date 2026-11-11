"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { isNativeApp } from "@/lib/native";

const APP_HOSTS = ["meelo.online", "www.meelo.online"];

/** In-app path for a meelo.online link, or null for anything else. */
function toAppPath(url: string | undefined): string | null {
  if (!url) return null;
  try {
    const u = new URL(url);
    if (!APP_HOSTS.includes(u.hostname)) return null;
    return u.pathname + u.search + u.hash;
  } catch {
    return null;
  }
}

/**
 * Wires Android-specific behaviour when running inside the Capacitor app:
 * - Shared meelo.online links (App Links) open the matching page in the app.
 * - Hardware back button navigates back, and exits the app on the root page.
 * - Adds a `native-app` class on <html> for app-only styling.
 */
export function NativeBridge() {
  const router = useRouter();

  useEffect(() => {
    if (!isNativeApp()) return;
    document.documentElement.classList.add("native-app");

    const handles: { remove: () => Promise<void> }[] = [];
    let cancelled = false;

    import("@capacitor/app").then(async ({ App }) => {
      if (cancelled) return;

      const openLink = (url: string | undefined) => {
        const path = toAppPath(url);
        if (path && path !== window.location.pathname + window.location.search) router.push(path);
      };

      // Cold start from a link
      const launch = await App.getLaunchUrl();
      openLink(launch?.url);

      // Link tapped while the app is already running
      handles.push(await App.addListener("appUrlOpen", ({ url }) => openLink(url)));

      handles.push(
        await App.addListener("backButton", ({ canGoBack }) => {
          if (canGoBack && window.location.pathname !== "/") {
            window.history.back();
          } else {
            App.exitApp();
          }
        })
      );
    });

    return () => {
      cancelled = true;
      handles.forEach((h) => h.remove());
    };
  }, [router]);

  return null;
}
