import type { ChessPage, Game, Settings } from "../types";

/* ---------- helpers ------------------------------------------------------ */

/** Strength score used for the primary sort. */
function scoreGame(g: Game): number {
  const w = g.white.rating ?? 0;
  const b = g.black.rating ?? 0;
  const wp = g.white.ratingProvisional ? 1 : 0;
  const bp = g.black.ratingProvisional ? 1 : 0;
  return (w + b) * 100 - wp - bp;
}

/** Total half-moves (ply) for a game. */
function ply(g: Game): number {
  return g.movesCount;
}

/** Total ply for an array of games. */
function totalPly(games: Game[]): number {
  return games.reduce((s, g) => s + ply(g), 0);
}

/** Max ply in an array of games. */
function maxPly(games: Game[]): number {
  return games.length ? Math.max(...games.map(ply)) : 0;
}

/** Median ply of an array (used for similarity). */
function medianPly(games: Game[]): number {
  if (!games.length) return 0;
  const sorted = games.map(ply).sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2
    ? sorted[mid]
    : (sorted[mid - 1] + sorted[mid]) / 2;
}

/** Distance between two games for clustering (percentile based). */
function distance(a: Game, b: Game): number {
  const longer = Math.max(ply(a), ply(b));
  const shorter = Math.min(ply(a), ply(b));
  return (longer - shorter) / longer; // 0..1
}

/** Cluster games into groups of “similar” length. */
function clusterByLength(games: Game[]): Game[][] {
  const CLUSTERS = 8; // tweak if you want more/fewer buckets
  const sorted = [...games].sort((a, b) => ply(a) - ply(b));
  const step = Math.ceil(sorted.length / CLUSTERS);
  const out: Game[][] = [];
  for (let i = 0; i < sorted.length; i += step) {
    out.push(sorted.slice(i, i + step));
  }
  return out;
}

/* ---------- page builders ------------------------------------------------ */

/** Try to build a 3-page (3 games) that respects the 165-move limit. */
function tryThree(pool: Game[]): Game[] | null {
  if (pool.length < 3) return null;
  // prefer candidates whose median is close to the pool median
  const poolMedian = medianPly(pool);
  const candidates = pool
    .map((_, i) => pool.slice(i, i + 3))
    .filter((g) => g.length === 3 && totalPly(g) <= 330)
    .sort(
      (a, b) =>
        Math.abs(medianPly(a) - poolMedian) -
        Math.abs(medianPly(b) - poolMedian)
    );
  return candidates.length ? candidates[0] : null;
}

/** Try to build a 6-page (6 games) that respects the 100-move row limit. */
function trySix(pool: Game[]): Game[] | null {
  if (pool.length < 6) return null;
  // brute-force all 6-length slices (cheap for small arrays)
  const candidates = pool
    .map((_, i) => pool.slice(i, i + 6))
    .filter((g) => g.length === 6)
    .filter((g) => {
      const top = maxPly(g.slice(0, 3));
      const bot = maxPly(g.slice(3, 6));
      return top + bot <= 200;
    })
    .sort((a, b) => totalPly(a) - totalPly(b)); // prefer tighter packing
  return candidates.length ? candidates[0] : null;
}

/** Try to build a 6-page with only 3 games (template allows empty slots). */
function trySixWithThree(pool: Game[]): Game[] | null {
  if (pool.length < 3) return null;
  return pool.slice(0, 3);
}

/* ---------- main export -------------------------------------------------- */

export default function convertGamesToPages(
  _settings: Settings,
  games: Game[]
): ChessPage[] {
  if (!games.length) return [];

  /* 1. Strength order ---------------------------------------------------- */
  const strength = [...games].sort((a, b) => scoreGame(b) - scoreGame(a));

  /* 2. Best game always gets a full page --------------------------------- */
  const pages: ChessPage[] = [];
  const best = strength.shift()!;
  pages.push({ type: "one", games: [best] });

  /* 3. Cluster remaining games by similar length ------------------------- */
  const clusters = clusterByLength(strength); // array of Game[]

  /* 4. Greedy page building inside each cluster -------------------------- */
  for (const cluster of clusters) {
    let pool = [...cluster].sort((a, b) => scoreGame(b) - scoreGame(a)); // still strength order inside cluster

    while (pool.length) {
      let used: Game[] | null = null;

      /* 6-page (6 games) */
      if ((used = trySix(pool))) {
        pages.push({ type: "six", games: used as [Game, Game, Game, Game, Game, Game] });
        pool = pool.slice(used.length);
        continue;
      }

      /* 3-page (3 games) */
      if ((used = tryThree(pool))) {
        pages.push({ type: "three", games: used as [Game, Game, Game] });
        pool = pool.slice(used.length);
        continue;
      }

      /* 6-page with only 3 games */
      if ((used = trySixWithThree(pool))) {
        pages.push({ type: "six", games: used as [Game, Game, Game, Game, Game, Game] });
        pool = pool.slice(used.length);
        continue;
      }

      /* Nothing fitted – pad with single pages */
      pages.push({ type: "one", games: [pool.shift()!] });
    }
  }

  /* 5. Done -------------------------------------------------------------- */
  console.log({ pageCount: pages.length });
  pages.length = Math.min(40, pages.length); // limit to 40 pages

  return pages;
}
