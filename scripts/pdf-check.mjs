// Print regression check.
//
// Serves the built site, drives /make with deterministic Lichess fixtures, and
// renders PDFs for both A4 and A5. It asserts that:
//   * no book page overflows its box (nothing is clipped),
//   * every content page actually prints ink (no page hidden behind the
//     document background),
//   * one book page becomes exactly one PDF sheet,
//   * that holds with background graphics off as well as on,
//   * every fixture game reached the book,
//   * the page logs no errors and loads its piece artwork.
//
// Run with: bun run check:pdf   (which builds first). PDFs and a screenshot are
// written to tmp/pdf-check/ for eyeballing.
import { createServer } from "node:http";
import { existsSync, statSync } from "node:fs";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { chromium } from "playwright";
import { FIXTURE_USERNAME, makeFixtures, makeGamesNdjson } from "../src/lib/fixtures.ts";

const PORT = Number(process.env.PDF_CHECK_PORT ?? 4325);
const BASE = `http://127.0.0.1:${PORT}`;
const OUT_DIR = path.join(process.cwd(), "tmp", "pdf-check");
const ROOT = path.join(process.cwd(), "dist");

const fixtures = makeFixtures();
const userBody = JSON.stringify(fixtures.user);
const gamesBody = makeGamesNdjson(fixtures);

const MIME = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".webmanifest": "application/manifest+json; charset=utf-8",
  ".xml": "application/xml; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".ico": "image/x-icon",
  ".woff2": "font/woff2",
  ".txt": "text/plain; charset=utf-8",
};

function resolveFile(pathname) {
  const rel = path.normalize(decodeURIComponent(pathname)).replace(/^[/\\]+/, "");
  let file = path.join(ROOT, rel);
  if (!file.startsWith(ROOT)) return null;
  if (existsSync(file) && statSync(file).isDirectory()) {
    file = path.join(file, "index.html");
  }
  if (!existsSync(file) && existsSync(`${file}.html`)) {
    file = `${file}.html`;
  }
  return existsSync(file) ? file : null;
}

function startServer() {
  const server = createServer(async (req, res) => {
    try {
      const { pathname } = new URL(req.url ?? "/", BASE);
      const file = resolveFile(pathname);
      if (!file) {
        const notFound = path.join(ROOT, "404.html");
        res.writeHead(404, { "content-type": "text/html; charset=utf-8" });
        res.end(existsSync(notFound) ? await readFile(notFound) : "Not found");
        return;
      }
      res.writeHead(200, {
        "content-type": MIME[path.extname(file).toLowerCase()] ?? "application/octet-stream",
      });
      res.end(await readFile(file));
    } catch (error) {
      res.writeHead(500);
      res.end(String(error));
    }
  });
  return new Promise((resolve) => {
    server.listen(PORT, "127.0.0.1", () => resolve(server));
  });
}

/** Chromium writes a flat page tree; the largest /Count is the page total. */
function countPdfPages(buffer) {
  const text = buffer.toString("latin1");
  const counts = [...text.matchAll(/\/Count\s+(\d+)/g)].map((m) => Number(m[1]));
  if (counts.length > 0) return Math.max(...counts);
  return [...text.matchAll(/\/Type\s*\/Page[^s]/g)].length;
}

/**
 * Screenshot one book page and measure how much of it is not white. A page that
 * is painted behind the document background — for example when an opaque body
 * background covers the book's negative z-index pages — comes out blank, which
 * this catches. Downscaled in the browser so no image library is needed.
 */
async function pageInk(page, locator) {
  const buffer = await locator.screenshot();
  const dataUrl = `data:image/png;base64,${buffer.toString("base64")}`;
  return page.evaluate(async (url) => {
    const image = new Image();
    await new Promise((resolve, reject) => {
      image.onload = () => resolve(undefined);
      image.onerror = () => reject(new Error("screenshot decode failed"));
      image.src = url;
    });
    const width = 240;
    const height = Math.max(1, Math.round((image.height / image.width) * width));
    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const context = canvas.getContext("2d");
    context.drawImage(image, 0, 0, width, height);
    const { data } = context.getImageData(0, 0, width, height);
    let ink = 0;
    for (let i = 0; i < data.length; i += 4) {
      if (data[i] < 245 || data[i + 1] < 245 || data[i + 2] < 245) ink++;
    }
    return ink / (data.length / 4);
  }, dataUrl);
}

const failures = [];
function check(condition, message) {
  if (condition) {
    console.log(`  ok    ${message}`);
  } else {
    console.log(`  FAIL  ${message}`);
    failures.push(message);
  }
}

/**
 * The book pages paint at a negative z-index, so the <body> must not have an
 * opaque background — otherwise it paints over them and only the current page
 * is visible (on screen and in print). Chromium reports "rgba(0, 0, 0, 0)".
 */
function isTransparent(color) {
  return (
    color === "transparent" ||
    color === "rgba(0, 0, 0, 0)" ||
    /^rgba?\([^)]*,\s*0(\.0+)?\)$/.test(color)
  );
}

async function runPageSize(browser, pageSize) {
  console.log(`\n== ${pageSize} ==`);
  const context = await browser.newContext();
  const page = await context.newPage();

  const consoleErrors = [];
  const failedRequests = [];
  page.on("pageerror", (error) => consoleErrors.push(String(error)));
  page.on("console", (message) => {
    if (message.type() === "error") consoleErrors.push(message.text());
  });
  page.on("requestfailed", (request) => {
    failedRequests.push(`${request.url()} — ${request.failure()?.errorText}`);
  });

  await page.route("https://lichess.org/api/user/**", (route) =>
    route.fulfill({
      status: 200,
      contentType: "application/json",
      body: userBody,
    }));
  await page.route("https://lichess.org/api/games/user/**", (route) =>
    route.fulfill({
      status: 200,
      contentType: "application/x-ndjson",
      body: gamesBody,
    }));

  await page.goto(`${BASE}/make`, { waitUntil: "domcontentloaded" });
  await page.waitForSelector("#lichess-username");
  await page.fill("#lichess-username", FIXTURE_USERNAME);
  await page.getByRole("button", { name: "Next..." }).click();

  const pageSizeField = page.locator("fieldset", { hasText: "Page Size" });
  await pageSizeField.waitFor({ timeout: 30000 });
  await pageSizeField
    .getByRole("button", { name: pageSize, exact: true })
    .click();
  await page.getByRole("button", { name: "Create Me Book" }).click();

  // The container is 0-height on screen (its pages are absolutely positioned
  // for the flip-book preview), so wait for it to be attached, not "visible".
  await page.waitForSelector(".book-container", {
    state: "attached",
    timeout: 60000,
  });
  await page.evaluate(() => document.fonts.ready);
  await page.waitForFunction(() => {
    const pieces = Array.from(
      document.querySelectorAll('.book-container img[src*="/pieces/"]'),
    );
    return pieces.length > 0 && pieces.every((img) => img.complete);
  }, { timeout: 30000 });

  const screenBodyBg = await page.evaluate(
    () => getComputedStyle(document.body).backgroundColor,
  );
  check(
    isTransparent(screenBodyBg),
    `body background is transparent on screen, so the book shows (${screenBodyBg})`,
  );

  const buttonCursor = await page.evaluate(
    () => getComputedStyle(document.querySelector(".no-print button")).cursor,
  );
  check(
    buttonCursor === "pointer",
    `buttons show a pointer cursor (${buttonCursor})`,
  );

  // The book advances by clicking the right-hand page. That page is painted at a
  // negative z-index, so the container must not intercept its clicks.
  const turnedBefore = await page.evaluate(
    () => document.querySelectorAll(".book-container > div.turned").length,
  );
  const containerBox = await page.locator(".book-container").boundingBox();
  if (containerBox) {
    await page.mouse.click(
      containerBox.x + containerBox.width * 0.75,
      Math.min(containerBox.y + containerBox.height * 0.5, containerBox.y + 700),
    );
    await page.waitForTimeout(400);
  }
  const turnedAfter = await page.evaluate(
    () => document.querySelectorAll(".book-container > div.turned").length,
  );
  check(
    turnedAfter > turnedBefore,
    `clicking the right page advances the book (${turnedBefore} -> ${turnedAfter})`,
  );

  // Measure and print under print media: the on-screen flip-book lays pages out
  // absolutely and draws a page-edge shadow, neither of which exists in print.
  await page.emulateMedia({ media: "print" });
  await page.evaluate(
    () =>
      new Promise((resolve) =>
        requestAnimationFrame(() => requestAnimationFrame(() => resolve(undefined)))
      ),
  );

  const metrics = await page.evaluate(() => {
    const container = document.querySelector(".book-container");
    if (!container) return null;
    const pages = Array.from(container.querySelectorAll(":scope > div.bg-white"));

    const overflow = [];
    pages.forEach((el, index) => {
      const dh = el.scrollHeight - el.clientHeight;
      const dw = el.scrollWidth - el.clientWidth;
      if (dh > 2 || dw > 2) {
        overflow.push({
          index,
          dh,
          dw,
          text: (el.textContent ?? "").replace(/\s+/g, " ").trim().slice(0, 80),
        });
      }
    });

    const columnOverflow = [];
    for (const el of container.querySelectorAll('[class*="columns-"]')) {
      // Multi-column boxes can round a few pixels wider than their content box
      // without the page itself overflowing (checked separately, at zero
      // tolerance). Ignore that rounding; flag anything that could really spill.
      const dw = el.scrollWidth - el.clientWidth;
      if (dw > 12) {
        const page = el.closest(".bg-white");
        columnOverflow.push({
          dw,
          className: el.className,
          page: pages.indexOf(page),
          pageText: (page?.textContent ?? "").replace(/\s+/g, " ").trim().slice(0, 90),
        });
      }
    }

    const text = container.textContent ?? "";
    const gamesMatch = text.match(/Games:\s*([\d,]+)/);

    // Pages with real content (everything except the deliberately blank spacer
    // and the page-number-only pages) are the ones that must print ink.
    const contentPages = pages
      .map((el, index) => ({
        index,
        hasContent: Array.from(el.children).some(
          (child) => !String(child.className).includes("absolute top-6"),
        ),
      }))
      .filter((entry) => entry.hasContent)
      .map((entry) => entry.index);

    return {
      pages: pages.length,
      overflow,
      columnOverflow,
      contentPages,
      pieces: container.querySelectorAll('img[src*="/pieces/"]').length,
      highlighted: container.querySelectorAll(".bg-black.text-white").length,
      games: gamesMatch ? Number(gamesMatch[1].replace(/,/g, "")) : null,
    };
  });

  check(metrics !== null, "the book renders");
  if (!metrics) {
    await context.close();
    return;
  }

  check(
    metrics.games === fixtures.games.length,
    `every fixture game reached the book (${metrics.games}/${fixtures.games.length})`,
  );
  check(metrics.pages >= 6, `the book has pages (${metrics.pages})`);
  check(
    metrics.overflow.length === 0,
    `no page overflows its box${metrics.overflow.length ? `: ${JSON.stringify(metrics.overflow.slice(0, 5))}` : ""}`,
  );
  check(
    metrics.columnOverflow.length === 0,
    `no move list overflows its columns${metrics.columnOverflow.length ? `: ${JSON.stringify(metrics.columnOverflow.slice(0, 3))}` : ""}`,
  );
  check(metrics.pieces > 0, `the chess pieces render (${metrics.pieces})`);
  check(metrics.highlighted > 0, "a move is highlighted");

  const pagesLocator = page.locator(".book-container > div.bg-white");
  const blank = [];
  for (const index of metrics.contentPages) {
    const ratio = await pageInk(page, pagesLocator.nth(index));
    // A truly blank page measures ~0; the sparse "Notes" pages still register
    // a little ink, so the bar is very low.
    if (ratio < 0.0005) blank.push({ index, ratio: Number(ratio.toFixed(5)) });
  }
  check(
    blank.length === 0,
    `every content page prints ink${
      blank.length ? `: ${JSON.stringify(blank.slice(0, 6))}` : ""
    }`,
  );

  const bgPdf = await page.pdf({
    preferCSSPageSize: true,
    printBackground: true,
    path: path.join(OUT_DIR, `${pageSize}-backgrounds.pdf`),
  });
  const plainPdf = await page.pdf({
    preferCSSPageSize: true,
    printBackground: false,
    path: path.join(OUT_DIR, `${pageSize}-no-backgrounds.pdf`),
  });
  await page.screenshot({
    path: path.join(OUT_DIR, `${pageSize}.png`),
    fullPage: false,
  });

  const bgPages = countPdfPages(bgPdf);
  const plainPages = countPdfPages(plainPdf);

  check(
    bgPages === metrics.pages,
    `one sheet per page with backgrounds (pdf ${bgPages} vs dom ${metrics.pages})`,
  );
  check(
    plainPages === metrics.pages,
    `one sheet per page without backgrounds (pdf ${plainPages} vs dom ${metrics.pages})`,
  );

  const printBodyBg = await page.evaluate(
    () => getComputedStyle(document.body).backgroundColor,
  );
  check(
    isTransparent(printBodyBg),
    `body background is transparent in print, so no page is blanked (${printBodyBg})`,
  );
  check(consoleErrors.length === 0, `no console errors${consoleErrors.length ? `: ${consoleErrors.slice(0, 3).join(" | ")}` : ""}`);
  check(
    failedRequests.length === 0,
    `no failed requests${failedRequests.length ? `: ${failedRequests.slice(0, 3).join(" | ")}` : ""}`,
  );

  await context.close();
}

await mkdir(OUT_DIR, { recursive: true });

if (!existsSync(path.join(ROOT, "make.html"))) {
  console.error("dist/ is missing — run `bun run build` first.");
  process.exit(1);
}

const server = await startServer();
const browser = await chromium.launch();
let exitCode = 0;

try {
  for (const pageSize of ["A4", "A5"]) {
    await runPageSize(browser, pageSize);
  }
} catch (error) {
  console.error(error);
  failures.push(String(error));
} finally {
  await browser.close();
  await new Promise((resolve) => server.close(resolve));
}

await writeFile(path.join(OUT_DIR, "summary.txt"), failures.join("\n"));

if (failures.length > 0) {
  console.error(`\nPDF check failed (${failures.length}):`);
  for (const failure of failures) console.error(`  - ${failure}`);
  exitCode = 1;
} else {
  console.log(`\nPDF check passed. Artifacts in ${path.relative(process.cwd(), OUT_DIR)}`);
}

process.exit(exitCode);
