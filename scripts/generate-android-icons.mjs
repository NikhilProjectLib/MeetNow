#!/usr/bin/env node
/**
 * Generates the Android launcher icons, splash screens and Play Store icon
 * from the website logo (public/icon.svg), so app and website match.
 *
 *   npm run android:icons
 *
 * Renders with headless Chrome/Edge (no extra npm dependencies).
 * Re-run whenever public/icon.svg changes, then rebuild the app.
 */
import { execFileSync } from "node:child_process";
import { existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const res = join(root, "android/app/src/main/res");
const svg = readFileSync(join(root, "public/icon.svg"), "utf8");
const BG = "#FFFFFF"; // same white tile as the website favicon

const browser = [
  process.env.CHROME_PATH,
  "C:/Program Files/Google/Chrome/Application/chrome.exe",
  "C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe",
  "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
  "/usr/bin/google-chrome",
  "/usr/bin/chromium",
].find((p) => p && existsSync(p));
if (!browser) {
  console.error("Chrome/Edge not found. Set CHROME_PATH to a Chromium-based browser.");
  process.exit(1);
}

const work = mkdtempSync(join(tmpdir(), "meelo-icons-"));

/**
 * Render one PNG.
 * @param out       output path
 * @param w,h       pixel size
 * @param logoPct   logo box size as % of the shorter side
 * @param shape     "none" (transparent), "square" (full bleed), "rounded", "circle"
 */
function render(out, w, h, logoPct, shape) {
  const bg = shape === "none" ? "transparent" : BG;
  const radius = shape === "circle" ? "50%" : shape === "rounded" ? "22%" : "0";
  const logo = Math.round((Math.min(w, h) * logoPct) / 100);
  const html = `<!doctype html><html><head><style>
    html,body{margin:0;width:${w}px;height:${h}px;background:transparent;overflow:hidden}
    .tile{width:${w}px;height:${h}px;background:${bg};border-radius:${radius};
      display:flex;align-items:center;justify-content:center}
    .tile svg{width:${logo}px;height:${logo}px;display:block}
  </style></head><body><div class="tile">${svg}</div></body></html>`;
  const page = join(work, "page.html");
  writeFileSync(page, html);
  mkdirSync(dirname(out), { recursive: true });
  execFileSync(
    browser,
    [
      "--headless=new",
      "--disable-gpu",
      "--hide-scrollbars",
      "--force-device-scale-factor=1",
      "--default-background-color=00000000",
      `--window-size=${w},${h}`,
      `--screenshot=${out}`,
      pathToFileURL(page).href,
    ],
    { stdio: "ignore" }
  );
  if (!existsSync(out)) throw new Error(`Failed to render ${out}`);
  console.log(`  ${out.replace(root + "\\", "").replace(root + "/", "")}  ${w}x${h}`);
}

// Launcher icons (legacy, Android 7 and below) + adaptive foreground (Android 8+).
// Adaptive canvas is 108dp; the logo stays inside the 66dp safe zone.
const densities = { mdpi: 1, hdpi: 1.5, xhdpi: 2, xxhdpi: 3, xxxhdpi: 4 };
console.log("Launcher icons");
for (const [d, s] of Object.entries(densities)) {
  render(join(res, `mipmap-${d}/ic_launcher.png`), 48 * s, 48 * s, 78, "rounded");
  render(join(res, `mipmap-${d}/ic_launcher_round.png`), 48 * s, 48 * s, 66, "circle");
  render(join(res, `mipmap-${d}/ic_launcher_foreground.png`), 108 * s, 108 * s, 56, "none");
}

// Splash screens (Android 11 and below; Android 12+ shows the adaptive icon).
console.log("Splash screens");
const splash = {
  "drawable": [480, 320],
  "drawable-port-mdpi": [320, 480],
  "drawable-port-hdpi": [480, 800],
  "drawable-port-xhdpi": [720, 1280],
  "drawable-port-xxhdpi": [960, 1600],
  "drawable-port-xxxhdpi": [1280, 1920],
  "drawable-land-mdpi": [480, 320],
  "drawable-land-hdpi": [800, 480],
  "drawable-land-xhdpi": [1280, 720],
  "drawable-land-xxhdpi": [1600, 960],
  "drawable-land-xxxhdpi": [1920, 1280],
};
for (const [dir, [w, h]] of Object.entries(splash)) {
  render(join(res, `${dir}/splash.png`), w, h, 30, "square");
}

// Play Store listing icon (512x512, full bleed — Play applies its own mask).
console.log("Play Store");
render(join(root, "android/store/play-store-icon-512.png"), 512, 512, 72, "square");

rmSync(work, { recursive: true, force: true });
console.log("Done. Rebuild the app to see the new icon.");
