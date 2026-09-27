import common from "../locales/en/common.json";

type Catalogue = { [key: string]: Catalogue | string };

function lookup(source: Catalogue, key: string): string | undefined {
  let node: Catalogue | string | undefined = source;
  for (const part of key.split(".")) {
    if (typeof node !== "object" || node === null) return undefined;
    node = node[part];
  }
  return typeof node === "string" ? node : undefined;
}

/**
 * Translate a dotted key from the English catalogue.
 *
 * This replaces `next-translate` (the app only ever shipped English). The key is
 * returned unchanged when missing, so a gap is visible rather than blank and the
 * catalogue can grow into other locales later without a framework.
 */
export function t(key: string): string {
  return lookup(common as Catalogue, key) ?? key;
}
