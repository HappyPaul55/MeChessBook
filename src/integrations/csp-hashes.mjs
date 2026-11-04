/**
 * After a static build, add CSP hashes for the inline `<script>` and `<style>`
 * elements Astro emits for hydrated islands. The deployed `_headers` then allows
 * exactly those blocks without `'unsafe-inline'`.
 *
 * Runs after `public/_headers` is copied into `dist/`.
 */

import { createHash } from "node:crypto";
import { readdir, readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";

const sha256 = (value) =>
  `'sha256-${createHash("sha256").update(value).digest("base64")}'`;

async function htmlFiles(dir) {
  const entries = await readdir(dir, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) files.push(...(await htmlFiles(path)));
    else if (entry.name.endsWith(".html")) files.push(path);
  }
  return files;
}

export default function cspHashes() {
  return {
    name: "csp-hashes",
    hooks: {
      "astro:build:done": async ({ dir }) => {
        const dist = dir.pathname.replace(/^\/([A-Za-z]:)/, "$1");
        const scripts = new Set();
        const styles = new Set();

        for (const file of await htmlFiles(dist)) {
          const html = await readFile(file, "utf8");
          for (const match of html.matchAll(
            /<(script|style)\b([^>]*)>([\s\S]*?)<\/\1>/gi,
          )) {
            const tag = match[1].toLowerCase();
            const attrs = match[2];
            const body = match[3];
            if (!body.trim()) continue;
            if (tag === "script") {
              if (/\bsrc\s*=/i.test(attrs)) continue;
              if (/application\/ld\+json/i.test(attrs)) continue;
              scripts.add(sha256(body));
            } else {
              styles.add(sha256(body));
            }
          }
        }

        if (scripts.size === 0 && styles.size === 0) return;

        const headersPath = join(dist, "_headers");
        let headers;
        try {
          headers = await readFile(headersPath, "utf8");
        } catch {
          return;
        }

        headers = headers.replace(
          /^(\s*Content-Security-Policy:\s*)(.*)$/gm,
          (_line, prefix, value) => {
            const parts = value
              .split(";")
              .map((part) => part.trim())
              .filter(Boolean)
              .map((part) => {
                if (part.startsWith("script-src") && scripts.size) {
                  return `${part} ${[...scripts].join(" ")}`;
                }
                if (part.startsWith("style-src") && styles.size) {
                  return `${part} ${[...styles].join(" ")}`;
                }
                return part;
              });
            return prefix + parts.join("; ");
          },
        );

        await writeFile(headersPath, headers);
      },
    },
  };
}
