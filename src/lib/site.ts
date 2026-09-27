import type { CollectionEntry } from "astro:content";

/** The shape of `src/content/site/settings.json`, validated by the collection. */
export type SiteSettings = CollectionEntry<"site">["data"];
