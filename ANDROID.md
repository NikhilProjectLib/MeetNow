# Meelo — Android App

The Android app is a [Capacitor](https://capacitorjs.com) shell around the same Next.js codebase.
It loads the live site (`https://www.meelo.online`), so a web deploy updates the app as well.
You only need a Play Store release when native code or config changes.

```
src/                 ← one codebase (web + Android)
capacitor.config.ts  ← app id, server URL, plugin config
mobile-shell/        ← offline fallback page bundled into the APK
android/             ← native Android Studio project
```

## Native integrations (`src/lib/native.ts`)

| Feature | Web | Android app |
|---|---|---|
| Google sign-in | `signInWithPopup` | Native account picker (`@capacitor-firebase/authentication`) → `signInWithCredential` |
| Share | `navigator.share` | Native share sheet (`@capacitor/share`) |
| Back button | — | Navigates back; exits on home (`native-bridge.tsx`) |
| Location | Browser prompt | Android runtime permission (manifest) |
| AdSense | Shown | Hidden (AdSense isn't allowed in apps; use AdMob) |

## One-time setup

1. **Firebase:** Console → Project settings → *Add app* → Android, package `online.meelo.app`.
   - Add your SHA-1 fingerprint. For the debug key, run `cd android && gradlew signingReport`.
     For release, add the Play App Signing SHA-1 from Play Console.
   - Download `google-services.json` to `android/app/google-services.json`. The file is gitignored.
   Without this file, Google sign-in fails in the app. Email/password sign-in still works.
2. **Deploy the web app.** The native code paths ship with the website, so the app needs the deployed site to include them.

## Everyday commands

```bash
npm run android:sync     # after changing capacitor.config.ts or adding plugins
npm run android:open     # open in Android Studio (run on emulator/device)
npm run android:build    # debug APK → android/app/build/outputs/apk/debug/app-debug.apk
npm run android:release  # Play Store bundle (.aab), needs signing configured
```

### Test against your local dev server

```powershell
npm run dev
$env:CAP_SERVER_URL="http://10.0.2.2:3000"; npx cap sync android   # emulator
# physical device: use http://<your-PC-LAN-IP>:3000
```

Run `npx cap sync android` without the variable before releasing. Otherwise the app keeps pointing at localhost.

## Build environment notes

- Capacitor 8 needs **JDK 21**. JDK 17 is too old to compile it, and Gradle 8.14 can't run on Android Studio's bundled JDK 25.
  Install it with `winget install EclipseAdoptium.Temurin.21.JDK`, then point `JAVA_HOME` at it.
  In Android Studio, set it under *Settings → Build Tools → Gradle → Gradle JDK*.
- On networks with TLS inspection, Gradle uses `%USERPROFILE%\.gradle\windows-truststore.jks`.
  That truststore is built from the Windows root CAs and configured in `%USERPROFILE%\.gradle\gradle.properties`.
  The wrapper's first download also needs it in `GRADLE_OPTS`.

## Releasing to Play Store

1. Create an upload keystore (`keytool -genkey -v -keystore meelo-upload.jks -alias meelo -keyalg RSA -keysize 2048 -validity 10000`) and keep it outside git.
2. Android Studio → *Build → Generate Signed App Bundle*, or configure `signingConfigs` in `android/app/build.gradle`.
3. Bump `versionCode` and `versionName` in `android/app/build.gradle` for every release.

## App Links: shared links open in the app

When someone with the app installed taps a `www.meelo.online/activity/…` link (WhatsApp, Instagram…),
Android opens it in Meelo instead of the browser. The same applies to `/login` and `/explore` links.

- `android/app/src/main/AndroidManifest.xml` has an `autoVerify` intent filter for those paths.
- `public/.well-known/assetlinks.json` proves to Android that the site owns the app.
  It must list the SHA-256 of every signing key:
  - the debug key (already added)
  - the **Play App Signing** key, from Play Console → App integrity (add it before release)
- `src/components/native-bridge.tsx` routes the opened link to the right page.

Check verification after deploying:
`adb shell pm verify-app-links --re-verify online.meelo.app` and then `adb shell pm get-app-links online.meelo.app`.
