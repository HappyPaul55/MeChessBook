// @ts-check
import { defineConfig } from "astro/config";
import sitemap from "@astrojs/sitemap";
import react from "@astrojs/react";
import tailwindcss from "@tailwindcss/vite";
import cspHashes from "./src/integrations/csp-hashes.mjs";

// Static-first: the whole tool is a client-side React island, so no adapter is
// needed. Cloudflare Pages serves `dist/` as-is.
export default defineConfig({
  site: "https://chess-book.happypaul55.com",
  build: {
    format: "file",
    // Inline CSS keeps the print layout byte-for-byte as before; csp-hashes
    // adds its hash to the CSP so `'unsafe-inline'` is still unnecessary.
    inlineStylesheets: "always",
  },
  trailingSlash: "never",
  integrations: [sitemap({ filter: (page) => !page.endsWith("/404") }), react(), cspHashes()],
  vite: {
    build: {
      assetsInlineLimit: 0,
    },
    plugins: [tailwindcss()],
  },
});
