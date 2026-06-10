#!/usr/bin/env node
/**
 * Download hero portrait to public/images/bhawna-hero.jpg
 * Usage: node scripts/download-hero-image.mjs "https://instagram...."
 *    or: HERO_PORTRAIT_URL="https://..." node scripts/download-hero-image.mjs
 */
import { writeFileSync, mkdirSync } from "fs";
import { dirname, join } from "path";
import { fileURLToPath } from "url";

const url = process.argv[2] || process.env.HERO_PORTRAIT_URL;
if (!url) {
  console.error("Pass the full Instagram CDN URL as an argument or set HERO_PORTRAIT_URL.");
  process.exit(1);
}

const outDir = join(dirname(fileURLToPath(import.meta.url)), "../public/images");
mkdirSync(outDir, { recursive: true });
const outPath = join(outDir, "bhawna-hero.jpg");

const res = await fetch(url, {
  headers: {
    "User-Agent":
      "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    Referer: "https://www.instagram.com/",
  },
});

if (!res.ok) {
  console.error(`Download failed: ${res.status} ${res.statusText}`);
  process.exit(1);
}

const buf = Buffer.from(await res.arrayBuffer());
writeFileSync(outPath, buf);
console.log(`Saved ${buf.length} bytes to public/images/bhawna-hero.jpg`);
