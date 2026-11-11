import { Capacitor } from "@capacitor/core";

/** True when running inside the Meelo Android (Capacitor) app. */
export function isNativeApp(): boolean {
  return typeof window !== "undefined" && Capacitor.isNativePlatform();
}

/**
 * Open the OS share sheet. Uses the native Share plugin inside the app
 * (Android WebView has no Web Share API), navigator.share on the web.
 * Returns false if sharing isn't available so callers can fall back.
 */
export async function shareContent(data: { title: string; text: string; url: string }): Promise<boolean> {
  if (isNativeApp()) {
    const { Share } = await import("@capacitor/share");
    try {
      await Share.share({ title: data.title, text: data.text, url: data.url, dialogTitle: data.title });
    } catch {
      /* user cancelled */
    }
    return true;
  }
  if (typeof navigator !== "undefined" && navigator.share) {
    try {
      await navigator.share(data);
    } catch {
      /* user cancelled */
    }
    return true;
  }
  return false;
}
