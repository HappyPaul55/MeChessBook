# Me Chess Book

Turn your [Lichess](https://lichess.org) games into a real, printable chess book.
It reads your public games, finds the interesting moment in each one, and lays
them out as a book — then you print it, or save it as a PDF and have it bound.

Built with [Astro](https://astro.build) and [Tailwind CSS v4](https://tailwindcss.com),
with a single [React](https://react.dev) island for the bookmaker, and a
[chess.js](https://github.com/jhlywa/chess.js)-powered pipeline that replays your
games. It is a static site: there is no server, no account and no upload — the
browser talks straight to the Lichess API.

The site is **Me Chess Book** (`chess-book.happypaul55.com`).

## Routes

| Route            | What it is                                                       |
| ---------------- | ---------------------------------------------------------------- |
| `/`              | Landing page: what it is, how it works, print guidance (no JS)   |
| `/make`          | The bookmaker (the only page with client-side JavaScript)        |
| `/how-to-print`  | The print-dialog settings, and how to get a book bound           |
| `/privacy`       | Privacy notice (rendered from `src/content/legal/privacy.md`)    |
| `/404`           | Not found — `noindex` and excluded from the sitemap              |

## Local development

```bash
bun install
bun run dev      # dev server on http://localhost:4321
bun run build    # production build into dist/
bun run preview  # serve the built site locally
bun run check    # type-check .astro and .ts/.tsx files (astro check)
bun test         # unit tests for the game pipeline and page packing
bun run icons    # regenerate public/icons from public/icons/brand-mark.svg
bun run fonts    # re-download the self-hosted woff2 files from Google Fonts
```

Requires Node.js 20+ (or Bun) and [Bun](https://bun.sh). Use `bun` (never `npm`)
and `bunx` (never `npx`). The lockfile is `bun.lock`; do not add
`package-lock.json`, `yarn.lock` or `pnpm-lock.yaml`. There is no linter; the
gates are `bun run check`, `bun test`, `bun run build` and `bun run check:pdf`.

## The book

The book is the point, so its layout is deliberately its own thing: Anton for
display, Roboto for body, exact A4 (`210×297mm`) or A5 (`148×210mm`) pages, the
9 cover photographs, and one page type per game count (one, three or six games).

- Games are sorted by the combined rating of both players, so the strongest game
  gets a full page.
- Every board is rebuilt from the game's PGN with chess.js. Where Lichess has
  analysis, the highlighted move is the biggest swing (a blunder always wins);
  otherwise a sensible mid-game ply is chosen.
- Pages are packed by `src/lib/convertGamesToPages.ts`. The move budget is
  **page-size aware**: an A5 page takes fewer games than an A4 page, so a long
  game moves to its own page instead of overflowing and being clipped.
- The `@page` size is injected at runtime (`src/components/book/Book/index.tsx`),
  because a user picks A4 or A5 after the page has loaded.
- **Print one page per sheet**: each book page is exactly one sheet, and blank
  pages are added so the count is even for double-sided printing.

To print: use the Print button on `/make`. In the dialog choose the matching
paper size, margins **None**, scale **100%**, **background graphics on** (for the
cover art and the chessboard squares) and headers/footers **off**. The `@page`
size is declared in the page, so Chromium sizes the PDF exactly (A5 = 420×595pt,
A4 = 595×842pt), but its dialog's paper-size dropdown is not always preselected —
the book page reminds you which size to pick. Full steps and a troubleshooting
list are on `/how-to-print`.

## Print regression check

The most important output is the printed page, so print is tested:

```bash
bunx playwright install chromium   # once
bun run check:pdf                  # builds, serves dist/, renders PDFs
```

`scripts/pdf-check.mjs` drives `/make` with deterministic Lichess fixtures
(`src/lib/fixtures.ts`, served by intercepting the Lichess API — no network
needed) for both A4 and A5, and asserts that:

- every fixture game reached the book,
- no page overflows its box in print media (nothing is clipped),
- **every content page actually prints ink** (a page hidden behind the document
  background — e.g. an opaque `body` background over the book's negative-z-index
  pages — is caught here),
- one book page becomes exactly one PDF sheet, with and without background
  graphics,
- the chess pieces load, a move is highlighted, and the console is clean.

PDFs and a screenshot are written to `tmp/pdf-check/` for eyeballing.

## Deployment

Deployed to **Cloudflare Pages** (static, no adapter) via its own Git-connected
project:

```text
Build command:          bun run build
Build output directory: dist
```

The production domain is `https://chess-book.happypaul55.com`, set as `site` in
`astro.config.mjs`, mirrored in `src/content/site/settings.json` (`url`) and
`public/robots.txt`. If the domain changes, change all three and rebuild.

## Content and code layout

| What                                                | Where                                         |
| --------------------------------------------------- | --------------------------------------------- |
| Site metadata, author, repo, licence                | `src/content/site/settings.json`              |
| Landing copy and sections                           | `src/components/sections/*.astro`             |
| Header / footer / metadata + JSON-LD                | `src/components/layout/*.astro`               |
| Design tokens and component classes                 | `src/styles/global.css` (`@theme`)            |
| The bookmaker (React island)                        | `src/components/book/**`                      |
| Game rules of the pipeline (Lichess → game)         | `src/lib/lichess.ts`                          |
| Page packing (games → book pages)                   | `src/lib/convertGamesToPages.ts`              |
| Deterministic fixtures for tests and the print check | `src/lib/fixtures.ts`                        |
| i18n (English catalogue + `t()`)                    | `src/lib/i18n.ts`, `src/locales/en/common.json` |
| Privacy notice                                      | `src/content/legal/privacy.md`                |
| Zod schemas for the two collections                 | `src/content.config.ts`                       |
| Icons, fonts, cover art, chess pieces               | `public/icons`, `public/fonts`, `public/covers`, `public/pieces` |

`src/content/site/settings.json` is an **array** with `id: "main"` (required by
Astro's `file()` loader); the site reads `getEntry("site", "main")`. Adding a
field there without updating the schema in `src/content.config.ts` fails the build.

### Tailwind

`src/styles/global.css` imports Tailwind v4 and loads `tailwind.config.js` through
`@config`. The config is kept because the book was authored against its `w-a4` /
`h-a5` page-size utilities. Its `font.anton` entry is left in an unrecognised
namespace on purpose — it reproduces the original build exactly, where
`font-anton` produced no rule. Do not "fix" it without re-checking the printed
book.

## How the bookmaker is built

Only `/make` ships JavaScript: it is a React island
([`@astrojs/react`](https://docs.astro.build/en/guides/integrations-guide-react/),
`client:load`). The other pages are static and script-free.

- `src/components/book/Form/**` — username and settings, then the streaming fetch
  from `https://lichess.org/api/games/user/...` (NDJSON, buffered so a line split
  across chunks is not dropped).
- `src/components/book/Book/**` and `Chess/**` — the printed pages. These are
  ported from the original Next.js build and kept as close to verbatim as
  possible: the printed artwork is the product, so its markup and classes are
  deliberately unchanged.

## Privacy

No accounts, no cookies, no analytics and no server-side storage. The browser
talks directly to the Lichess API with the username you type; the games and the
book never leave your browser. `src/content/legal/privacy.md` explains this and
must be updated before anything else that collects personal data is added.

## Icons and fonts

- Icons are generated from `public/icons/brand-mark.svg` (a yellow tile with an
  ink chess pawn) with `bun run icons` (the `favicons` package via
  `scripts/generate-icons.mjs`). The social/Open Graph image is
  `public/icons/apple-touch-icon-1024x1024.png`.
- Fonts are self-hosted latin-subset woff2 files in `public/fonts/`. The **site**
  uses Space Grotesk (display + body, variable 300–700) and Space Mono
  (labels, 400/700); the **book** uses Anton (display) and Roboto (body, variable
  100–900, roman + italic), pinned to `.book-container`. Space Grotesk is
  preloaded in `src/layouts/BaseLayout.astro`. To swap typefaces, update the
  `@font-face` rules, the preload link and the `--font-display` / `--font-body` /
  `--font-mono` tokens. `scripts/fetch-fonts.mjs` re-downloads all of them from
  Google Fonts.

## SEO, headers and caching

- Unique `<title>`, meta description and canonical URL per indexable page; Open
  Graph and Twitter cards; a generated icon set and web manifest.
- JSON-LD `@graph` of `WebApplication` (the tool), `WebSite` and the author
  `Person` (linking to `happypaul55.com`), plus a `BreadcrumbList` on sub-pages.
- `sitemap-index.xml` (via `@astrojs/sitemap`) and `robots.txt`; the 404 is
  `noindex` and excluded from the sitemap.
- `public/_headers` sets security headers (CSP, HSTS, `nosniff`, frame denial) and
  caching. The CSP allows `connect-src 'self' https://lichess.org`, because the
  browser fetches games directly from Lichess; everything else is same-origin.
- `public/_redirects` is present and empty (no legacy URLs yet).

## Licence

Released under the **GNU Affero General Public License v3.0** — see `LICENSE.md`.
The licence is linked from the site footer and recorded in `settings.json`.

`GUIDE.md` is the build guide this site was produced against.
