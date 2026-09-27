import { defineCollection } from "astro:content";
import { z } from "astro/zod";
import { file, glob } from "astro/loaders";

const site = defineCollection({
  loader: file("src/content/site/settings.json"),
  schema: z.object({
    name: z.string(),
    shortName: z.string(),
    tagline: z.string(),
    description: z.string(),
    url: z.url(),
    author: z.string(),
    authorUrl: z.url(),
    repo: z.url(),
    license: z.string(),
    licenseUrl: z.url(),
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
