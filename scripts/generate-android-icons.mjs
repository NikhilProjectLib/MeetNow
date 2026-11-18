#!/usr/bin/env node
/**
 * Generates the Android launcher icons, splash screens, Play Store icon and
 * Play Store feature graphic
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
import { crc32, deflateSync, inflateSync } from "node:zlib";

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

/**
 * Google Play requires the store icon as a 32-bit PNG (with alpha). Chrome
 * saves fully opaque screenshots as 24-bit RGB, so add an opaque alpha channel.
 */
function pngToRgba(file) {
  const buf = readFileSync(file);
  let pos = 8, ihdr = null;
  const idat = [];
  while (pos < buf.length) {
    const len = buf.readUInt32BE(pos);
    const type = buf.toString("ascii", pos + 4, pos + 8);
    const data = buf.subarray(pos + 8, pos + 8 + len);
    if (type === "IHDR") ihdr = data;
    if (type === "IDAT") idat.push(data);
    pos += 12 + len;
  }
  const w = ihdr.readUInt32BE(0), h = ihdr.readUInt32BE(4), depth = ihdr[8], colorType = ihdr[9];
  if (colorType === 6) return; // already RGBA
  if (colorType !== 2 || depth !== 8 || ihdr[12] !== 0) throw new Error(`Unsupported PNG format in ${file}`);
  const raw = inflateSync(Buffer.concat(idat));
  const bpp = 3, stride = w * bpp;
  const prev = Buffer.alloc(stride), cur = Buffer.alloc(stride);
  const out = Buffer.alloc(h * (1 + w * 4));
  for (let y = 0; y < h; y++) {
    const ft = raw[y * (stride + 1)];
    const line = raw.subarray(y * (stride + 1) + 1, (y + 1) * (stride + 1));
    for (let i = 0; i < stride; i++) {
      const a = i >= bpp ? cur[i - bpp] : 0, b = prev[i], c = i >= bpp ? prev[i - bpp] : 0;
      let v = line[i];
      if (ft === 1) v += a;
      else if (ft === 2) v += b;
      else if (ft === 3) v += (a + b) >> 1;
      else if (ft === 4) { const p = a + b - c, pa = Math.abs(p - a), pb = Math.abs(p - b), pc = Math.abs(p - c); v += pa <= pb && pa <= pc ? a : pb <= pc ? b : c; }
      cur[i] = v & 0xff;
    }
    const o = y * (1 + w * 4);
    out[o] = 0; // filter: none
    for (let x = 0; x < w; x++) {
      out[o + 1 + x * 4] = cur[x * 3]; out[o + 2 + x * 4] = cur[x * 3 + 1]; out[o + 3 + x * 4] = cur[x * 3 + 2]; out[o + 4 + x * 4] = 255;
    }
    cur.copy(prev);
  }
  const chunk = (type, data) => {
    const len = Buffer.alloc(4); len.writeUInt32BE(data.length);
    const td = Buffer.concat([Buffer.from(type, "ascii"), data]);
    const crc = Buffer.alloc(4); crc.writeUInt32BE(crc32(td) >>> 0);
    return Buffer.concat([len, td, crc]);
  };
  const newIhdr = Buffer.from(ihdr); newIhdr[9] = 6;
  writeFileSync(file, Buffer.concat([buf.subarray(0, 8), chunk("IHDR", newIhdr), chunk("IDAT", deflateSync(out, { level: 9 })), chunk("IEND", Buffer.alloc(0))]));
}

// Play Store listing icon (512x512 32-bit PNG, full bleed — Play applies its own mask).
console.log("Play Store");
const playIcon = join(root, "android/store/play-store-icon-512.png");
render(playIcon, 512, 512, 72, "square");
pngToRgba(playIcon);

// Play Store feature graphic (1024x500)
console.log("Feature graphic");
{
  const w = 1024, h = 500;
  const chips = ["🏏 Cricket", "⚽ Football", "🏃 Running", "🏸 Badminton", "🥾 Trekking", "🧘 Yoga"];
  const html = `<!doctype html><html><head><style>
    html,body{margin:0;width:${w}px;height:${h}px;overflow:hidden}
    body{font-family:"Segoe UI",Roboto,Helvetica,Arial,sans-serif;color:#fff;
      background:linear-gradient(135deg,#0b0b12 0%,#1e1b4b 55%,#4c1d95 100%);
      display:flex;align-items:center;padding:0 72px;box-sizing:border-box;gap:56px}
    .tile{width:220px;height:220px;flex:none;border-radius:48px;background:#fff;display:flex;align-items:center;justify-content:center;
      box-shadow:0 20px 60px rgba(0,0,0,.35)}
    .tile svg{width:168px;height:168px}
    h1{margin:0;font-size:84px;font-weight:800;letter-spacing:-2px;line-height:1}
    p{margin:14px 0 26px;font-size:34px;line-height:1.2;color:#ddd6fe;font-weight:600}
    .chips{display:flex;flex-wrap:wrap;gap:10px;max-width:640px}
    .chip{padding:9px 16px;border-radius:999px;background:rgba(255,255,255,.12);font-size:21px;font-weight:600}
  </style></head><body><div class="tile">${svg}</div><div>
    <h1>Meelo</h1><p>Find people to play with<br/>near you — today</p>
    <div class="chips">${chips.map((c) => `<span class="chip">${c}</span>`).join("")}</div>
  </div></body></html>`;
  const page = join(work, "feature.html");
  writeFileSync(page, html);
  const out = join(root, "android/store/feature-graphic-1024x500.png");
  execFileSync(browser, ["--headless=new", "--disable-gpu", "--hide-scrollbars", "--force-device-scale-factor=1",
    `--window-size=${w},${h}`, `--screenshot=${out}`, pathToFileURL(page).href], { stdio: "ignore" });
  console.log("  android/store/feature-graphic-1024x500.png  1024x500");
}

rmSync(work, { recursive: true, force: true });
console.log("Done. Rebuild the app to see the new icon.");
