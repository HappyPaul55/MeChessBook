// One-off helper: download the latin-subset woff2 files from Google Fonts.
// Run with: bun run fonts
//
// Space Grotesk + Space Mono dress the site (matching the main happypaul55.com
// build); Anton + Roboto are kept for the printed book, which is deliberately
// its own design.
import { promises as fs } from "node:fs";
import path from "node:path";

const UA =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120 Safari/537.36";

const outDir = path.join(process.cwd(), "public", "fonts");

async function fetchCss(family) {
  const url = `https://fonts.googleapis.com/css2?family=${family}&display=swap`;
  const res = await fetch(url, { headers: { "User-Agent": UA } });
  if (!res.ok) throw new Error(`CSS ${family}: ${res.status}`);
  return res.text();
}

function blocks(css) {
  return css
    .split("@font-face")
    .slice(1)
    .map((block) => {
      const url = block.match(/url\((https:\/\/[^)]+\.woff2)\)/)?.[1];
      const style = block.match(/font-style:\s*([^;]+);/)?.[1]?.trim() ?? "normal";
      const weight = block.match(/font-weight:\s*([^;]+);/)?.[1]?.trim() ?? "400";
      const range = block.match(/unicode-range:\s*([^;]+);/)?.[1]?.trim() ?? "";
      return { url, style, weight, range };
    })
    .filter((b) => b.url);
}

// The latin subset starts at U+0000-00FF. Google also ships latin-ext, so pin
// to the exact latin block rather than "whatever contains 0000-00FF".
const isLatin = (range) => range.startsWith("U+0000-00FF");

async function save(url, name) {
  const res = await fetch(url, { headers: { "User-Agent": UA } });
  if (!res.ok) throw new Error(`${name}: ${res.status}`);
  const buf = Buffer.from(await res.arrayBuffer());
  await fs.writeFile(path.join(outDir, name), buf);
  console.log(`saved ${name} (${buf.length} bytes)`);
}

await fs.mkdir(outDir, { recursive: true });

async function latinFile(family, name, match = () => true) {
  const list = blocks(await fetchCss(family));
  const block = list.find((b) => isLatin(b.range) && match(b)) ?? list.find(isLatin);
  if (!block) throw new Error(`No latin block for ${family}`);
  await save(block.url, name);
}

// --- Site: the engineer's-notebook pairing ------------------------------
await latinFile("Space+Grotesk:wght@300..700", "space-grotesk-latin.woff2");
await latinFile("Space+Mono:wght@400;700", "space-mono-latin-400.woff2", (b) => b.weight === "400");
await latinFile("Space+Mono:wght@400;700", "space-mono-latin-700.woff2", (b) => b.weight === "700");

// --- Book: Anton for display, Roboto for body --------------------------
await latinFile("Anton", "anton-latin.woff2");
await latinFile("Roboto:ital,wght@0,100..900;1,100..900", "roboto-latin.woff2", (b) => b.style === "normal");
await latinFile("Roboto:ital,wght@0,100..900;1,100..900", "roboto-latin-italic.woff2", (b) => b.style === "italic");

console.log("done");
