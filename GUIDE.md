# Bespoke Astro Website Build Guide (v2)

## Purpose

Create a fast, accessible, static-first website for one client. Each client gets a
standalone Astro repository and its own Cloudflare Pages project. The site must be
exportable without depending on a monorepo, a shared template, or the agency starter at
runtime.

This guide is written against a real build — `client-lexiphanic-co-uk` — and uses it as
the worked example throughout. Copy that repository's shape and conventions for new
clients unless there is a concrete reason to differ.

Stack:

- Astro + TypeScript (`astro/tsconfigs/strict`)
- Static generation (no SSR adapter by default)
- Tailwind CSS v4 with design tokens in `@theme`, plus a small set of component classes
- Self-hosted variable font, preloaded
- Leaflet for maps (only when a public, customer-facing location exists)
- Cloudflare Pages for hosting (optional Pages Function for a contact form)
- One GitHub repository per client, named after the domain, e.g. `client-lexiphanic-co-uk`
- Bun for installs, scripts and binaries (`bun`, `bunx`) — never `npm` or `npx`; the
  lockfile is `bun.lock`

---

## Input Contract

You may receive:

- Client name
- Existing website URL
- Logo file (`@logo.png`)
- Design reference screenshot (`@screenshot-of-design.png`)
- Domain, business details, services, photos, contact info

### Rules

1. Use the existing website only as a factual source for public information: name, company
   number, address, phone, email, services, hours, social links, legal text.
2. Use the supplied logo as provided. Do not alter it unless asked. If no suitable logo is
   supplied, a typographic wordmark (the client name set in the display font) is an
   acceptable fallback — this is what the Lexiphanic build does.
3. Treat the design screenshot as a visual direction: reproduce hierarchy, spacing, colour
   mood, typography character, component shapes, and restraint. Do not copy proprietary
   artwork, text, or photography.
4. Never invent regulated claims, qualifications, awards, hours, company numbers, addresses,
   testimonials, prices, service areas, team bios, or social URLs. Omit, use a clearly
   labelled placeholder, or ask for clarification.

---

## Required Outcome

Deliver a production-ready website that:

- Looks bespoke to the client, not like a generic template
- Reflects the supplied design direction while remaining original
- Works on mobile, tablet, and desktop
- Is accessible: keyboard navigation, visible focus, semantic HTML, sufficient contrast,
  useful alt text, a skip link
- Is static and fast by default
- Has SEO essentials: unique titles, descriptions, canonical URLs, Open Graph data,
  favicon set and web manifest, robots.txt, sitemap, and JSON-LD where facts are available
- Has a clear conversion path: phone, email, form, booking link, or visit-us direction
- Includes a privacy notice before collecting personal data — including when the only
  contact route is phone or email
- Ships security headers and caching rules via `public/_headers`
- Is easy for another developer to understand and export

Astro pages are routed from `src/pages/`; structured, repeatable content should use content
collections. One-off bespoke page copy may live directly in section components.

---

## Repository Rules

### One repository per client

Use a repository name derived from the client's domain:

```text
client-lexiphanic-co-uk
```

The repository must be self-contained. It may originate from an internal starter, but once
created it must not depend on the starter at runtime or build time.

Do not use a monorepo. Do not share client assets, secrets, domains, Cloudflare projects,
content, or environment variables between client repositories.

### No template coupling

It is acceptable to begin from an agency starter. After cloning:

- Remove unused placeholder pages, assets, copy, components, integrations, and dependencies
- Give the site its own design tokens and content
- Commit the client site independently
- Do not rely on Git submodules, workspace dependencies, or hidden external configuration

---

## Project Layout

This is the actual layout used by `client-lexiphanic-co-uk`:

```text
.
├── public/
│   ├── _headers                 # Cloudflare Pages security + cache headers
│   ├── _redirects               # legacy/renamed URL redirects
│   ├── robots.txt
│   ├── fonts/
│   │   ├── exo2-latin.woff2
│   │   └── exo2-latin-italic.woff2
│   └── icons/                   # generated favicon/app icon set + manifest
│       ├── favicon.ico
│       ├── favicon-16x16.png
│       ├── favicon-32x32.png
│       ├── apple-touch-icon-180x180.png
│       ├── apple-touch-icon-1024x1024.png   # also used as the social/OG image
│       ├── android-chrome-192x192.png
│       ├── android-chrome-512x512.png
│       ├── manifest.webmanifest
│       └── browserconfig.xml
├── src/
│   ├── components/
│   │   ├── Ambient.astro        # fixed background layer
│   │   ├── HeroVisual.astro     # brand-specific hero graphic
│   │   ├── layout/
│   │   │   ├── Header.astro
│   │   │   ├── Footer.astro
│   │   │   └── Seo.astro
│   │   ├── sections/
│   │   │   ├── Hero.astro
│   │   │   ├── TrustStrip.astro
│   │   │   ├── WhyUs.astro
│   │   │   ├── Pricing.astro
│   │   │   ├── Contact.astro
│   │   │   └── Cta.astro
│   │   └── ui/
│   │       ├── Button.astro
│   │       ├── Container.astro
│   │       └── Tick.astro
│   ├── content/
│   │   ├── site/
│   │   │   └── settings.json    # single source of truth for business data
│   │   └── legal/
│   │       └── privacy.md
│   ├── content.config.ts        # Astro 5+ location (NOT src/content/config.ts)
│   ├── layouts/
│   │   └── BaseLayout.astro
│   ├── pages/
│   │   ├── index.astro
│   │   ├── why-us.astro         # service/benefit detail page
│   │   ├── pricing.astro
│   │   ├── contact.astro
│   │   ├── privacy.astro
│   │   └── 404.astro
│   └── styles/
│       └── global.css           # Tailwind import, @theme tokens, component classes
├── astro.config.mjs
├── package.json
├── bun.lock                      # Bun lockfile (never package-lock.json)
├── tsconfig.json
├── README.md
└── GUIDE_v2.md                   # this guide travels with the client repo
```

Notes:

- `src/` is for source code; `public/` is for unprocessed public assets copied verbatim to
  `dist/`.
- There is **no `tokens.css`**: design tokens live in `@theme` inside `global.css`.
- There is **no `functions/` directory** unless a contact form is actually enabled.
- Page copy for bespoke one-off pages lives in `src/components/sections/*.astro`; there is
  no `src/content/pages/` collection.

---

## Site Configuration

Create `src/content/site/settings.json` as the single source of truth for business-wide
data, and validate it through `src/content.config.ts`.

Because the collection uses Astro's `file()` loader, the JSON must be an **array** and each
record needs an `id`. The site reads the `main` entry via `getEntry("site", "main")`.

Example (from `client-lexiphanic-co-uk`):

```json
[
  {
    "id": "main",
    "name": "Lexiphanic",
    "legalName": "Lexiphanic Limited",
    "companyNumber": "10065854",
    "tagline": "Bespoke websites & online growth",
    "description": "Lexiphanic builds bespoke websites that help you grow your business online. From £25 setup plus £7.50/month, with 24/7 support, free SSL and free domain.",
    "url": "https://www.lexiphanic.co.uk",
    "email": "hello@lexiphanic.co.uk",
    "phone": "+447915810750",
    "phoneDisplay": "07915 810 750",
    "address": {
      "street": "650 Anlaby Road",
      "locality": "Kingston Upon Hull",
      "region": "East Yorkshire",
      "postcode": "HU3 6UU",
      "country": "GB"
    },
    "openingHours": ["Mo-Fr 09:00-17:00"],
    "social": {
      "facebook": "",
      "instagram": "",
      "linkedin": "https://uk.linkedin.com/in/happypaul55"
    },
    "contact": { "formEnabled": false, "recipientEmail": "hello@lexiphanic.co.uk" },
    "geo": {
      "region": "GB-ERY",
      "placename": "Kingston Upon Hull",
      "lat": 53.7443,
      "lng": -0.3866
    },
    "companyUrl": "https://find-and-update.company-information.service.gov.uk/company/10065854",
    "pricing": {
      "currency": "GBP",
      "setup": "£25",
      "setupValue": "25.00",
      "monthly": "£7.50",
      "monthlyValue": "7.50",
      "setupDescription": "One-off setup fee"
    }
  }
]
```

Schema (`src/content.config.ts`), using Astro 5+ loaders and Zod:

```ts
import { defineCollection } from "astro:content";
import { z } from "astro/zod";
import { file, glob } from "astro/loaders";

const site = defineCollection({
  loader: file("src/content/site/settings.json"),
  schema: z.object({
    name: z.string(),
    legalName: z.string(),
    companyNumber: z.string(),
    tagline: z.string(),
    description: z.string(),
    url: z.url(),
    email: z.email(),
    phone: z.string(),
    phoneDisplay: z.string(),
    address: z.object({
      street: z.string(),
      locality: z.string(),
      region: z.string(),
      postcode: z.string(),
      country: z.string(),
    }),
    openingHours: z.array(z.string()),
    social: z.object({
      facebook: z.string().optional().default(""),
      instagram: z.string().optional().default(""),
      linkedin: z.string().optional().default(""),
    }),
    contact: z.object({
      formEnabled: z.boolean(),
      recipientEmail: z.string(),
    }),
    geo: z.object({
      region: z.string(),
      placename: z.string(),
      lat: z.number(),
      lng: z.number(),
    }),
    companyUrl: z.url(),
    pricing: z
      .object({
        currency: z.string(),
        setup: z.string(),
        setupValue: z.string(),
        monthly: z.string(),
        monthlyValue: z.string(),
        setupDescription: z.string(),
      })
      .optional(),
  }),
});

const legal = defineCollection({
  loader: glob({ pattern: "**/*.md", base: "./src/content/legal" }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    updated: z.string(),
  }),
});

export const collections = { site, legal };
```

Only include fields supported by supplied or verified public information. Trim fields such
as `pricing` when the client does not publish prices.

### Astro configuration

Set the production domain and a clear trailing-slash policy up front. The Lexiphanic build
uses clean, extensionless URLs:

```js
// astro.config.mjs
// @ts-check
import { defineConfig } from "astro/config";
import sitemap from "@astrojs/sitemap";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  site: "https://www.lexiphanic.co.uk",
  build: { format: "file" },
  trailingSlash: "never",
  prefetch: { prefetchAll: true, defaultStrategy: "viewport" },
  integrations: [sitemap()],
  vite: { plugins: [tailwindcss()] },
});
```

`site` is required for correct canonical URLs, sitemap output, and JSON-LD. Whichever
trailing-slash policy you choose, keep the README, internal links, and active-nav logic
consistent with it (see the pitfall below).

---

## Design Workflow

### 1. Inspect and summarise

Before coding, create a brief internal note covering:

- Client identity and industry
- Primary audience and the action visitors should take
- Required pages
- Verified factual details
- Design cues from the screenshot: colour family, type mood, density, layout rhythm,
  corners, shadows, imagery, motion
- Missing information

### 2. Make it bespoke

Define a design system for this client as `@theme` tokens in `src/styles/global.css`:

- 3 to 6 colour tokens: background, surface, text, muted text, primary, accent
- Type styles appropriate for the reference and business
- Spacing scale, one repeated radius token, and an easing token
- One distinctive hero treatment and at least one brand-specific visual detail
  (e.g. Lexiphanic's fixed ambient gradient/`Ambient.astro` and the rotated browser-mock
  `HeroVisual.astro`)
- Consistent reusable sections, varied layout where content benefits

Avoid generic "AI website" clichés unless aligned with the brief.

### 3. Build mobile first

Start at narrow viewport widths. Ensure:

- Navigation works without hover
- Buttons are easily tappable
- Headings do not overflow
- Images have explicit dimensions or stable aspect ratios
- Layouts do not rely on horizontal scrolling
- The contact method is obvious above the fold or shortly after it

Verify the site on mobile, tablet, and desktop before release.

### 4. Keep client-side JavaScript optional

Ship HTML and CSS for normal content pages. Add small JavaScript islands only for a concrete
reason: mobile navigation toggle, sticky-header state, form status messages, Leaflet map,
gallery lightbox, or calculator.

In the Lexiphanic build, JavaScript is limited to: removing the `no-js` class, the mobile
menu (with Escape-to-close and focus return), the scrolled-header state, and
`IntersectionObserver` scroll reveals that are disabled under `prefers-reduced-motion`.

Do not ship a client-side framework merely to render static headings, service cards,
navigation, or content sections.

---

## Content Rules

### Use real, verified material

When an existing site is supplied:

- Reuse factual business details after checking them against the source
- Rewrite copy for clarity and the new layout; do not reproduce large passages verbatim
- Preserve legal and company details accurately
- Use only images and assets the client owns or has supplied permission to use

### Write useful copy

Each page should answer:

- What does the business offer?
- Who is it for?
- Why should someone choose it?
- What should they do next?

Prefer specific language over generic claims.

### Recommended page set

- Home
- A service/benefit detail page (e.g. "Why us")
- Pricing or packages, when the business publishes prices
- Contact
- Privacy policy
- 404
- Optional: about, terms, cookies, accessibility, portfolio, FAQ, news, testimonials only
  when the source material supports them

A single-page site is acceptable for a small business, but still use section anchors, a
privacy page, and a clear contact route.

### Legal content collection

Store the privacy notice as markdown in `src/content/legal/privacy.md` with frontmatter:

```md
---
title: Privacy Policy
description: How Client Limited handles personal information when you contact us or use this website.
updated: "2026-09-25"
---

...
```

Render it in `src/pages/privacy.astro` with `getEntry("legal", "privacy")` and
`render(entry)`.

---

## Components

Build reusable, accessible Astro components. The Lexiphanic build uses:

- `layout/Header` — wordmark/logo, navigation, primary CTA, mobile menu with
  `aria-expanded` / `aria-controls`
- `layout/Footer` — business details, company number, registered address, Companies House
  link, privacy link, and social links only when verified
- `layout/Seo` — all page metadata and structured data
- `sections/Hero`, `sections/TrustStrip`, `sections/WhyUs`, `sections/Pricing`,
  `sections/Contact`, `sections/Cta`
- `ui/Button`, `ui/Container`, `ui/Tick` — small primitives
- `Ambient`, `HeroVisual` — brand-specific decorative components

Conventions:

- Section components accept `first?: boolean` and `as?: "h1" | "h2"` so a section can supply
  the page's single `h1` on a detail page but render `h2` when reused on the home page.
- `Container` centralises the `mx-auto w-[min(1200px,100%-3rem)]` width rule.
- `Seo` accepts `title`, `description`, `path`, `noindex`, and `breadcrumbs`.

Do not make a universal "mega component" with dozens of boolean props. If a client needs a
truly different hero or section, create a clear client-specific component in that
repository.

---

## Fonts and Typography

- Prefer a variable font, self-hosted and subset to the languages you need. Lexiphanic uses
  Exo 2, latin subset, normal + italic, in `public/fonts/`.
- Declare `@font-face` with `font-display: swap` in `global.css`.
- Preload the primary font file in `BaseLayout.astro`:

  ```html
  <link rel="preload" href="/fonts/exo2-latin.woff2" as="font" type="font/woff2" crossorigin="anonymous" />
  ```

- Expose font families as `--font-display` / `--font-body` tokens so a typeface change is a
  one-line edit.
- If the design permits, system fonts are even faster — only self-host when the brand needs
  it.

---

## Icons and Web Manifest

Do not hand-roll a single favicon. Generate a complete icon set (`favicons` package or
equivalent) into `public/icons/` and reference it from `BaseLayout.astro`:

- `favicon.ico` plus 16/32/48 PNGs
- `apple-touch-icon` sizes including 180×180
- `android-chrome-192x192.png` and `android-chrome-512x512.png`
- `manifest.webmanifest` with `name`, `short_name`, `theme_color`, and icon entries
- `browserconfig.xml` with a `msapplication-TileColor`

Set `theme-color`, `color-scheme`, and `application-name` meta tags. Use a square brand
mark as the default Open Graph image. For richer social cards, add a 1200×630 image and
point `ogImage` at it (see SEO).

---

## Find Us / Maps (Leaflet)

Show a map only when the business has a public, customer-facing location or directions are
genuinely useful.

Use Leaflet with OpenStreetMap tiles:

- Include Leaflet CSS and JS from a CDN or a local bundle
- Initialise with `geo.lat` and `geo.lng` from the site settings
- Lazy-load the map component and its assets
- Provide a fallback "Get directions" link for users without JavaScript or with reduced
  motion
- If a Content Security Policy is present, allow the tile host in `img-src` and the
  Leaflet host in `script-src`/`style-src` in `public/_headers`

Do not claim a physical address for a home-based or service-area business unless the client
has confirmed it should be public. Lexiphanic has a registered office only and therefore
ships **no map**.

---

## Contact Forms

### Default approach

If a phone number, email, or booking link is sufficient, use that and avoid a form. This is
the default for most small-business builds — Lexiphanic uses direct phone and email only
(`formEnabled: false`), with no `functions/` directory.

### If a form is needed

It must:

- Submit to a server-side endpoint; never expose email-provider secrets in browser code
- Validate required fields on both client and server
- Include spam protection using Cloudflare Turnstile (free, Cloudflare-native,
  privacy-friendly)
- Return an accessible success or error message
- Send to the client's confirmed recipient address
- Avoid collecting unnecessary personal data
- Link to the privacy policy next to the submit button

### Cloudflare implementation

Use a Cloudflare Pages Function in `functions/api/contact.ts`, or a dedicated Cloudflare
Worker, for contact submissions. Store secrets such as email API keys and the recipient
address in the relevant Cloudflare project/Worker environment variables. Never commit
secrets, API keys, or client mailbox credentials to the repository.

If Turnstile is added, extend the Content Security Policy in `public/_headers` to allow
`https://challenges.cloudflare.com` in `script-src` and `frame-src`.

### Privacy requirement

Collecting personal data — whether via a form, a phone number, or an email address —
requires a privacy notice explaining who collects the data, why, the lawful basis,
recipients/processors, retention period, and the person's rights. It should be available
when the data is collected. The ICO identifies transparency and the "right to be informed"
as a core UK GDPR requirement.

This guide is a technical workflow, not legal advice. Ask the business to confirm the legal
wording, data retention period, processors, and responsible contact details before
publishing.

---

## Security Headers, Caching and Redirects

Ship `public/_headers` with every site. Lexiphanic's file:

```text
/*
  X-Content-Type-Options: nosniff
  Referrer-Policy: strict-origin-when-cross-origin
  Permissions-Policy: camera=(), geolocation=(), microphone=()
  X-Frame-Options: DENY
  Strict-Transport-Security: max-age=31536000; includeSubDomains; preload
  Content-Security-Policy: default-src 'self'; base-uri 'self'; object-src 'none'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; font-src 'self'; connect-src 'self'; form-action 'self'; frame-ancestors 'none'; upgrade-insecure-requests

/_astro/*
  Cache-Control: public, max-age=31536000, immutable

/fonts/*
  Cache-Control: public, max-age=31536000, immutable

/icons/*
  Cache-Control: public, max-age=604800

/sitemap-index.xml
  Cache-Control: public, max-age=3600
```

Notes:

- Astro inlines critical CSS and one small bootstrap script, hence `'unsafe-inline'` for
  `script-src`/`style-src` in the baseline. Tighten with hashes/nonces only if the design
  allows; otherwise extend the directives for any third party you add.
- `Strict-Transport-Security` with `preload` assumes the domain is HTTPS-only. Omit
  `preload` until you are sure the client wants HSTS preload.
- Use `public/_redirects` for renamed or legacy URLs, e.g.:

  ```text
  /services   /why-us   301
  /services/  /why-us   301
  ```

---

## SEO and Metadata

Every production site must include:

- One clear `h1` per page
- Logical heading hierarchy
- Unique `<title>` and meta description per indexable page
- Canonical URL using the real production domain (from `settings.json` / `site`)
- Open Graph title, description, URL, locale, and image, plus Twitter card metadata
- Descriptive image alt text; use empty alt text only for decorative images
- `robots.txt` pointing at the sitemap
- Sitemap generated by `@astrojs/sitemap` — output is `sitemap-index.xml` (not
  `sitemap.xml`), referenced from both `robots.txt` and a `<link rel="sitemap">`
- Favicon set, web manifest, and basic app metadata
- 404 page with `noindex` and excluded from the sitemap
- JSON-LD as a single `@graph` containing the business, the `WebSite`, and a per-page
  `BreadcrumbList`

Type selection:

- Use `Organization` for a generic company with no public location
- Use an appropriate `LocalBusiness` subtype (e.g. `ProfessionalService`) when a public,
  customer-facing address and hours are verified
- Include `makesOffer`/`Offer` only for prices the client actually publishes

Lexiphanic's `Seo.astro` builds a `@graph` of `ProfessionalService` (`@id` `/#business`),
`WebSite` (`@id` `/#website`, `publisher` → business), and `BreadcrumbList`, with business
facts pulled from `settings.json`.

Do not create fake location pages, keyword-stuffed text, fake reviews, fake star ratings, or
invented schema fields.

### Trailing-slash pitfall

Active-navigation logic must match the configured trailing-slash policy. The Lexiphanic
build initially compared `Astro.url.pathname` against `href + "/"` while running
`trailingSlash: "never"`, so no nav item was ever marked current.

Stripping the trailing slash is not enough when `build.format: "file"`: at build time
`Astro.url.pathname` is `/why-us.html` (and `/index.html`), even though the served URL is
extensionless. Normalise the `.html` suffix as well as trailing slashes, on both sides:

```ts
const normalizePath = (value: string) =>
  value
    .replace(/index\.html$/, "")
    .replace(/\.html$/, "")
    .replace(/\/+$/, "") || "/";
const isActive = (href: string) =>
  normalizePath(Astro.url.pathname) === normalizePath(href);
```

Note the bug only shows in the production build (dev serves extensionless paths), so check
`aria-current="page"` in `dist/*.html`, not just in the dev server.

Keep the README's stated policy in step with `astro.config.mjs`.

---

## Accessibility Baseline

Before release, verify:

- The whole site is usable with a keyboard
- A "Skip to content" link is the first focusable element
- Focus is visible and follows a sensible order
- Menus, accordions, modals, and forms have correct labels and states
- The mobile menu sets `aria-expanded`, closes on Escape, and returns focus to the toggle
- Text and interactive controls have sufficient contrast
- Every form field has a programmatic label
- Error messages identify the field and explain the fix
- Images have meaningful alt text or are marked decorative
- Motion is reduced for users who request reduced motion
- Page structure uses semantic landmarks (`header`, `nav`, `main`, `footer`)
- Decorative layers (gradients, noise, icons) are marked `aria-hidden="true"`

Do not use text embedded in images for key content or CTAs.

---

## Performance Baseline

Aim for a site that feels instant on an ordinary mobile connection:

- Prefer static rendering
- Enable Astro prefetch (`prefetchAll` with the `viewport` strategy) for near-instant
  internal navigation
- Use appropriately sized, compressed images; modern formats where suitable
- Set width and height/aspect ratio to avoid layout shift
- Lazy-load below-the-fold images and third-party embeds
- Self-host and preload only the necessary font weights; prefer system fonts if the design
  permits
- Keep third-party scripts to a minimum
- Avoid autoplaying video and large animated assets unless central to the brief
- Test mobile performance before launch

---

## Cloudflare Pages Deployment

Each client site gets a separate Cloudflare Pages project attached to its own Git
repository.

For a standard static Astro site:

```text
Build command:          bun run build
Build output directory: dist
```

Bun is used for installs and scripts throughout (`bun` / `bunx`); do not use `npm` or
`npx`, and commit only the `bun.lock` lockfile.

- Connect the real production domain only after the initial deployment is approved.
- Use preview deployments for pull requests or non-main branches.
- If no server code is needed, keep deployment static (no adapter). If a contact endpoint
  is required, configure the Pages Function/Worker deliberately and document each
  environment variable in `README.md` without recording its secret value.
- Newer Astro Cloudflare adapter guidance is oriented to Workers deployment. Verify the
  current Cloudflare product path before selecting an adapter; do not add one to a purely
  static site.

---

## Quality Gate

Do not mark a site complete until all applicable checks pass.

### Content

- Client name, company number, address, phone, email, opening hours, and links are accurate
- No placeholders, lorem ipsum, dummy social links, or invented statements remain
- No duplicated or overly copied text from the source site
- Calls to action reach the intended destination

### Design

- Logo (or wordmark) is crisp, proportional, and used appropriately
- The implementation follows the reference's mood without copying protected assets or text
- Mobile, tablet, and desktop layouts are intentional
- Spacing, typography, buttons, cards, and links are consistent

### Technical

- `bun run build` passes with no errors
- `bun run check` (astro check) passes with no type errors
- All internal links work and match the trailing-slash policy
- External links use the correct URLs
- Forms have an end-to-end delivery test when enabled
- No secrets are committed
- No console errors on key pages
- 404 page exists, is `noindex`, and is excluded from the sitemap
- `public/_headers` and `public/_redirects` are present and correct
- Sitemap, robots, metadata, favicon set, canonical URL, and social preview are present and
  point at the production domain

### Accessibility and performance

- Keyboard test passes, including the skip link
- Mobile menu and forms work on a narrow viewport
- Images do not cause significant layout shift
- Third-party embeds are lazy-loaded where possible
- Basic automated audit results have been reviewed and critical issues fixed

---

## Client Handover

The repository must contain a short `README.md` with:

- Local development commands (`dev`, `build`, `preview`, `check`)
- Node version requirement (Node.js 20+)
- Build command and output directory
- Deployment location / Cloudflare project name
- Domain name and DNS ownership notes
- Where to change business details (`settings.json`) and page copy (section components)
- How to replace the logo and icon set
- Font replacement notes
- Required Cloudflare environment variable names, without secret values
- Contact-form provider and operational notes, if applicable
- Third-party accounts/services the client owns or must retain

At offboarding, provide the client with:

- Repository access or a Git archive
- The built `dist/` output on request
- Domain/DNS transfer information where applicable
- Cloudflare Pages/Worker transfer or redeployment instructions
- A list of external services and assets required to keep the site operating

The client should be able to host the static output anywhere, even if they choose not to
retain the Astro source project.

---

## Execution Checklist

When asked to make a client website, follow this sequence:

1. Read this guide and inspect all supplied assets.
2. Research the supplied existing website for factual information only.
3. Write a concise internal brief and identify missing or uncertain facts.
4. Create a new standalone Astro repository from the agency starter, named after the
   domain.
5. Set up `src/content.config.ts` and `settings.json` before writing visual components.
6. Set `site` and the trailing-slash policy in `astro.config.mjs`.
7. Define the client-specific `@theme` tokens and component classes in `global.css`.
8. Self-host/subset the font and preload it; generate the icon set and manifest.
9. Build the core layout, responsive navigation, home page, and required pages.
10. Add verified content, wordmark/logo, licensed images, metadata, and legal pages.
11. Add `public/_headers` and `public/_redirects`.
12. Add a Leaflet map and contact form with Turnstile only when appropriate and configured.
13. Run the quality gate, fix issues, and build for production.
14. Deploy to the client's own Cloudflare Pages project and connect the domain after
    approval.
15. Update `README.md` so the website is maintainable and exportable.

---

## Example Build Request

A valid request may look like:

```md
# Instructions
Following @GUIDE_v2.md make a website for this customer;
Name: Lexiphanic Limited
Existing Website: https://www.lexiphanic.co.uk/
This is their logo @logo.png, and this is the theme and style to copy @screenshot-of-design.png
```

For this request, the builder must:

- Use the existing public site to verify company and contact details
- Use `@logo.png` as the client logo, or a typographic wordmark if the logo is unsuitable
- Translate the supplied screenshot's visual style into an original Astro implementation
- Create a separate client repository named `client-lexiphanic-co-uk`
- Not invent information absent from the public source
- Include a privacy page even though the site has no contact form
- Produce a website ready to deploy to its own Cloudflare Pages project

---

## Worked Example: Lexiphanic

The `client-lexiphanic-co-uk` repository is the reference implementation for this guide:

- **Pages:** Home (`/`), Why Us, Pricing, Contact, Privacy, 404
- **Contact route:** direct phone and email only; no form, no server code
- **Styling:** Tailwind v4, tokens in `@theme` in `src/styles/global.css`
- **Font:** Exo 2 variable, latin subset, self-hosted and preloaded
- **Brand detail:** fixed ambient gradient/noise background and a rotated browser-mock hero
  visual; wordmark instead of an image logo
- **Data:** `src/content/site/settings.json` (array, `id: "main"`) validated by
  `src/content.config.ts`; privacy notice as a `legal` markdown collection
- **SEO:** canonical, OG/Twitter, `sitemap-index.xml`, `robots.txt`, and a JSON-LD `@graph`
  of `ProfessionalService` + `WebSite` + `BreadcrumbList`
- **Hardening:** `public/_headers` (CSP/HSTS/cache) and `public/_redirects`
- **Deployment:** static `dist/` on Cloudflare Pages, no adapter

Use it as the baseline; adapt tokens, sections, and schema per client, but keep the
repository self-contained and the README accurate.
