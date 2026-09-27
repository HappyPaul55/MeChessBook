import type { Settings } from "./types";

/** The page size a new book starts on. */
export const DEFAULT_PAGE_SIZE: Settings["pageSize"] = "A5";

/**
 * The `@page` rule for a book.
 *
 * Kept in one place because it is emitted twice: statically into `/make` (so the
 * print dialog sees the paper size from the first paint) and again at runtime
 * when the user changes the page size.
 */
export function pageSizeRule(pageSize: Settings["pageSize"]): string {
  return `@page { size: ${pageSize} portrait; margin: 0; }`;
}
