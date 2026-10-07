# AGENTS.md

## What this repo is

A standalone **tool site** for **Me Chess Book** (`chess-book.happypaul55.com`)
that turns Lichess games into a printable chess book. One self-contained
repository, no monorepo, no shared template. The structure follows the agency
client-site standard; the **visual style follows `client-happypaul55-com`** (the
engineer's-notebook look), while the **book itself keeps its own classical type
and layout** because it is the printed artefact.

The marketing pages (`/`, `/how-to-print`, `/privacy`, `/404`) are plain Astro and
ship no JavaScript. **`/make` is a React island** (`@astrojs/react`,
`client:load`) because the bookmaker is interactive. There is no server, no
database and no adapter — the browser talks directly to the Lichess API.

Routes: `/` (landing), `/make` (the bookmaker), `/how-to-print`, `/privacy`, `/404`.

## Commands

```bash
bun install
bun run dev       # dev server on http://localhost:4321
bun run build     # static build into dist/
bun run preview   # serve the built site
bun run check     # astro check — types for everything except the tests
bun test          # unit tests (pipeline, packing, i18n, hashing)
bun run check:pdf # build + render PDFs and assert print quality (needs Playwright)
bun run icons     # regenerate public/icons from public/icons/brand-mark.svg
bun run fonts     # re-download the self-hosted woff2 files
```

Use **Bun** for everything: `bun` (never `npm`) and `bunx` (never `npx`). The
lockfile is `bun.lock`. Verify every change with `bun run check`, `bun test`,
`bun run build` and `bun run check:pdf`. There is no linter.

`src/lib/*.test.ts` are excluded from the `astro check` tsconfig because they
import `bun:test`; Bun runs and transpiles them natively.

`bun run check:pdf` needs Chromium once: `bunx playwright install chromium`.

## Key files

- `src/components/book/**` — the bookmaker (React). `BookApp.tsx` is the island
  root; `Form/**` is the fetch + settings flow; `Book/**` and `Chess/**` render the
  printed pages. These are ported from the original Next.js build and kept as
  close to verbatim as possible. **Do not restyle them.**
- `src/lib/lichess.ts` — `processGame`: turns a Lichess game into a board (via
  `chess.js`), a move list with `?`/`??`/`?!` marks, and a highlighted ply. Takes
  an injectable `Rng` so tests are deterministic (the app defaults to `Math.random`).
- `src/lib/convertGamesToPages.ts` — packs games into one/three/six-game pages,
  strongest first. **The move budget is page-size aware** (A5 carries fewer games
  than A4) so a page never overflows and clips.
- `src/lib/fixtures.ts` — deterministic Lichess-shaped fixtures, used by the tests
  and by the print check's route interception.
- `src/lib/i18n.ts` + `src/locales/en/common.json` — a tiny `t()` over the English
  catalogue (replaces `next-translate`).
- `src/lib/button.ts` + `src/components/ui/Button.astro` — button styles shared
  by the Astro pages and the React island (the main happypaul55.com button).
- `src/components/book/Book/index.tsx` — also injects the runtime `@page size` rule.
- `src/components/layout/Seo.astro` — metadata + JSON-LD (`WebApplication` +
  `WebSite` + author `Person` + `BreadcrumbList`).
- `src/styles/global.css` — Tailwind v4 `@import` + `@config` + `@theme`, the
  notebook component classes, the ported book CSS, and the print rules.
- `src/content/site/settings.json` + `src/content.config.ts` — site data and schema.
- `scripts/pdf-check.mjs` — the print regression check (see below).

## The book (the part that must not break)

The printed page is the product. Its rules:

- Page geometry is exact: A4 `210×297mm`, A5 `148×210mm`, `@page { margin: 0 }`.
- The `@page size` is emitted **statically** into `/make`'s `<head>` (default A5,
  from `src/lib/book.ts`) and updated at runtime by `usePageSize` in
  `Book/index.tsx`, because the user chooses A4/A5 after load. Chromium takes the
  PDF dimensions from it exactly, but its print-dialog **paper size** still has to
  be selected by the user, so the book page shows a "Print at A5 · margins none ·
  background graphics on" hint.
- Each book page is exactly one sheet; a blank page is added so the count is even.
- The book pages are painted at a **negative z-index** (the flip-book preview
  relies on it). In print this is harmless **only while the body is transparent**.
  See gotchas.

## Tests and the print check

- `bun test` covers `processGame` (board, filters, judgement marks,
  determinism), page packing (every game used once, strongest first, page-size
  budgets), `stringToSemiRandomNumber` and `t()`.
- `bun run check:pdf` builds the site, serves `dist/`, drives `/make` with the
  fixtures (intercepting `lichess.org` — no network), and renders PDFs for A4 and
  A5. It asserts: all games reach the book; no page overflows its box; **every
  content page prints ink**; one page = one PDF sheet with and without background
  graphics; pieces load; a move is highlighted; no console errors or failed
  requests. Artifacts land in `tmp/pdf-check/`.

When you change anything that touches the book, run `bun run check:pdf`.

## Client-side architecture

Only `/make` ships JavaScript; the other pages stay static and script-free. Keep
it that way. Do not add another client framework.

- The Lichess `fetch` streams NDJSON. It is **buffered across chunks** in
  `Form/index.tsx`; without that, a chunk boundary in the middle of a line
  silently drops a game.
- Render text as children, never with `dangerouslySetInnerHTML`.

## Design constraints (do not regress)

- The site look is an **engineer's notebook**, matching the main happypaul55.com
  build: ink (`--color-ink`), off-white paper (`--color-paper`) and electric
  yellow (`--color-yellow`); graph-paper and dot-grid backdrops; monospace `//`
  labels; the yellow `.mark` highlighter; hard offset shadows; a black header with
  a yellow rule.
- Site type is **Space Grotesk** (display + body) + **Space Mono** (labels),
  self-hosted and preloaded. Buttons come from `src/lib/button.ts` /
  `src/components/ui/Button.astro` — the same styles as the main site.
- Bands follow the main site: the hero and the closing print section are ink; the
  middle work section is paper; the footer is ink.
- Headings use tight `leading-[0.98]` (matching the main site). The `.mark`
  highlighter is drawn as a band sized to Space Grotesk's glyphs (0.96em at
  0.24em) rather than a full `background`, because the font box (1.27em) is
  taller than the line box and would bleed over the line above. Do not revert it
  to `background: var(--color-yellow)`.
- The **book keeps its own** type and layout — **Anton** + **Roboto**, pinned to
  `.book-container`. Changing its Tailwind classes changes the printed output;
  re-run the print check if you do.

## Gotchas

- **The book is scoped by font and height.** `.book-container` pins Roboto (the
  site uses Space Grotesk), and the container carries `h-a4` / `h-a5` on screen so
  the absolutely-positioned book pages reserve space — without that height the
  pages overflow and cover the footer. Print resets it with `print:h-auto`.
- **Watch whitespace between inline tags in Astro.** An inline element at the end
  of a line followed by text on the next line loses its space (`…</a>` newline
  `page` renders "…page"). Keep the continuation on the same line, or use
  `{" "}` — as the footer's copyright line does.
- **The book paints at a negative z-index.** Two consequences, both easy to
  break:
  - `body` must stay **transparent** — the paper colour lives on `html`, which
    paints first as the canvas. An opaque body background paints over the pages:
    on screen only the current page shows, and in print every page but the front
    cover is blank. `bun run check:pdf` asserts the body background is transparent
    in both media.
  - `.book-container` must form its own stacking context (`isolation: isolate`)
    and be `pointer-events: none`, with `pointer-events: auto` on its pages.
    Otherwise the container and its ancestors sit above the pages and swallow
    their clicks, so the book turns back but never forward. `bun run check:pdf`
    asserts "clicking the right page advances the book".
- **The preview's page turn is exempt from reduced motion.** The flip is the
  primary interaction, so the global `prefers-reduced-motion` rule (which zeroes
  every transition) is overridden for `.book-container.simulate > div`; an
  instant spread-to-spread cut is more jarring than the turn. The original
  Next.js build had no reduced-motion rule at all, so this restores its
  behaviour. Keep the flip as the original **flat `rotateY`** — do not add a
  `perspective` to the container; it makes the sheet fold the wrong way.
  The reduced-motion block also re-enables `.spinner` (duration **and** iteration
  count), because a loader that does not turn reads as a frozen page.
- **`tailwind.config.js` is loaded via `@config`** and kept on purpose. Its
  `font.anton` entry sits in an unrecognised namespace, matching the original
  build where `font-anton` produced no rule. Do not "fix" it; the book's text
  would change.
- **Buttons need `cursor: pointer`.** Tailwind v4's preflight leaves `<button>`
  with the default cursor, so a base-layer rule sets the pointer (and
  `not-allowed` when disabled). `bun run check:pdf` asserts it.
- **URL policy** is `trailingSlash: "never"` + `build.format: "file"`. At build
  time `Astro.url.pathname` is `/make.html`; active-nav logic in `Header.astro`
  normalises `.html` and trailing slashes. Check `aria-current` in `dist/*.html`.
- **CSP allows Lichess.** `public/_headers` sets
  `connect-src 'self' https://lichess.org`, because the browser fetches games
  directly from Lichess. Any new origin must be added there.
- **Printing needs background graphics on** for the cover art and chessboard
  squares. This is documented on `/how-to-print`; the book is *not* rewritten to
  avoid CSS backgrounds.
- **The page-size-aware packing budgets** in `convertGamesToPages.ts` keep A5
  pages from overflowing. They change page composition but not the design. They
  are unit-tested; do not remove them without replacing the guarantee.
- `src/content/site/settings.json` must be an **array** with `id: "main"`.
- `src/content.config.ts` is the Astro 5+ location (NOT `src/content/config.ts`).
- TypeScript is on 6.x: `astro check` refuses TypeScript 7.

## Deployment and handover

- Static `dist/` on **Cloudflare Pages** (no adapter): build `bun run build`,
  output `dist`. CI (`.github/workflows/ci.yml`) runs check/test/build plus the
  print check.
- `site` is `https://chess-book.happypaul55.com`; keep `astro.config.mjs`,
  `settings.json.url` and `public/robots.txt` in step if the domain changes.
- Keep `README.md` accurate for handover: commands, build/output, deploy
  location, where content lives, the printing contract, the print check, icon and
  font replacement, and the AGPL-3.0 licence.
