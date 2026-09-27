// @ts-check
import { defineConfig } from "astro/config";
import sitemap from "@astrojs/sitemap";
import react from "@astrojs/react";
import tailwindcss from "@tailwindcss/vite";

// Static-first: the whole tool is a client-side React island, so no adapter is
// needed. `wrangler.jsonc` serves `dist/` as Cloudflare Worker static assets.
export default defineConfig({
  site: "https://chess-book.happypaul55.com",
  build: {
    format: "file",
    inlineStylesheets: "always",
  },
  trailingSlash: "never",
  integrations: [sitemap({ filter: (page) => !page.endsWith("/404") }), react()],
  vite: {
    plugins: [tailwindcss()],
  },
});
