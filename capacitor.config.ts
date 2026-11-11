import type { CapacitorConfig } from "@capacitor/cli";
import { existsSync } from "node:fs";

/**
 * Android app = native shell that loads the Meelo web app.
 *
 * - Production: loads https://www.meelo.online (default).
 * - Local dev:  CAP_SERVER_URL=http://10.0.2.2:3000 npx cap sync android
 *               (10.0.2.2 is the host machine from the Android emulator;
 *                use your PC's LAN IP for a physical device).
 */
const serverUrl = process.env.CAP_SERVER_URL || "https://www.meelo.online";
const isHttp = serverUrl.startsWith("http://");

// Native Google sign-in needs Firebase's android/app/google-services.json.
// Without it the plugin crashes app startup, so only include it once present.
const hasGoogleServices = existsSync("android/app/google-services.json");

const config: CapacitorConfig = {
  appId: "online.meelo.app",
  appName: "Meelo",
  // Offline fallback page bundled into the APK (shown if the site can't load)
  webDir: "mobile-shell",
  server: {
    url: serverUrl,
    cleartext: isHttp,
    androidScheme: "https",
    errorPath: "index.html",
  },
  android: {
    allowMixedContent: isHttp,
    includePlugins: [
      "@capacitor/app",
      "@capacitor/share",
      ...(hasGoogleServices ? ["@capacitor-firebase/authentication"] : []),
    ],
  },
  plugins: {
    FirebaseAuthentication: {
      // Native Google sign-in gives us an ID token; the web Firebase SDK
      // then signs in with it, so Firestore/RTDB auth keeps working.
      skipNativeAuth: true,
      providers: ["google.com"],
    },
  },
};

export default config;
