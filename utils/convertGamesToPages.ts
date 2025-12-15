import type { ChessPage, Game, Settings } from "../types";

/** Strength score used for the primary sort. */
function scoreGame(g: Game): number {
  const provisionalPenalty = 20;
  return (g.white.rating + g.black.rating)
    - (g.white.ratingProvisional ? provisionalPenalty : 0)
    - (g.black.ratingProvisional ? provisionalPenalty : 0);
}

function validateGamesFor6Page(games: Game[]): boolean {
  const sortedByMoveCountGames = [...games].sort((a, b) => {
    return b.movesCount - a.movesCount;
  });

  const limit = 85 * 2;

  return ((sortedByMoveCountGames[0]?.movesCount ?? 0) + (sortedByMoveCountGames[5]?.movesCount ?? -42)) < limit
    && ((sortedByMoveCountGames[1]?.movesCount ?? 0) + (sortedByMoveCountGames[4]?.movesCount ?? -42)) < limit
    && ((sortedByMoveCountGames[2]?.movesCount ?? 0) + (sortedByMoveCountGames[3]?.movesCount ?? -42)) < limit
}

function validateGamesFor3Page(games: (Game | undefined)[]): boolean {
  const realGames = games.filter((game) => game?.id !== undefined);
  if (realGames.length === 3) {
    return realGames.every(g => (g?.movesCount ?? 0) <= 50 * 2);
  }
  if (realGames.length === 2) {
    return realGames.every(g => (g?.movesCount ?? 0) <= 80 * 2);
  }
  if (realGames.length === 1) {
    return (realGames[0]?.movesCount ?? 0) < 200 * 2;
  }

  return false;
}

/* ---------- main export -------------------------------------------------- */
export default function convertGamesToPages(
  _settings: Settings,
  games: Game[]
): ChessPage[] {
  if (!games.length) return [];

  // Refactor the pool to be sorted by strength
  const pool = [...games].sort((a, b) => scoreGame(b) - scoreGame(a));

  // Build up an array of our page.
  const pages: ChessPage[] = [];

  // Greedy page building
  let batch: Game[] = [];
  let current: Game | undefined = undefined;

  // Add games to pages until we run out of games.
  while (current = pool.shift()) {
    batch.push(current);

    // First page is always a single game to highlight the best one
    if (pages.length === 0) {
      pages.push({ type: "one", games: [batch[0]] });
      batch.length = 0;
      continue;
    }

    // If we're in the first 1% of games or first 10 games, try make a 3-game page
    const inTopPercent = batch.length < 30
      && (pool.length < games.length * 0.01 || games.length - pool.length < 10);

    // Try make a 3 page with 3 games if inTopPercent
    if (inTopPercent && batch.length === 3 && validateGamesFor3Page(batch)) {
      pages.push({ type: "three", games: [...batch] as any });
      batch.length = 0;
      continue;
    }

    // If batch has less than 6 games, keep adding unless there are no more games,
    if (batch.length !== 6 && pool.length > 0) {
      continue;
    }

    // Try make a 6 page with 6 games
    if (validateGamesFor6Page(batch)) {
      pages.push({ type: "six", games: [...batch] as any });
      batch.length = 0;
      continue;
    }

    // Try make a 3 page with 3 games
    // Try every combination of 3 games in the batch
    let foundThreeForThree = false;
    for (let i = 0; i < batch.length - 2 && !foundThreeForThree; i++) {
      for (let j = i + 1; j < batch.length - 1 && !foundThreeForThree; j++) {
        for (let k = j + 1; k < batch.length && !foundThreeForThree; k++) {
          const trio = [batch[i], batch[j], batch[k]];
          if (validateGamesFor3Page(trio)) {
            pages.push({ type: "three", games: trio as any });
            // Remove the used games from batch
            batch = batch.filter((_, idx) => idx !== i && idx !== j && idx !== k);
            foundThreeForThree = true;
          }
        }
      }
    }
    if (foundThreeForThree) {
      continue;
    }

    // Try make a 6 page with 3 games
    // Try every combination of 3 games in the batch
    let foundThreeForSix = false;
    for (let i = 0; i < batch.length - 2 && !foundThreeForSix; i++) {
      for (let j = i + 1; j < batch.length - 1 && !foundThreeForSix; j++) {
        for (let k = j + 1; k < batch.length && !foundThreeForSix; k++) {
          const trio = [batch[i], batch[j], batch[k]];
          if (validateGamesFor6Page(trio)) {
            pages.push({ type: "six", games: trio as any });
            // Remove the used games from batch
            batch = batch.filter((_, idx) => idx !== i && idx !== j && idx !== k);
            foundThreeForSix = true;
          }
        }
      }
    }
    if (foundThreeForSix) {
      continue;
    }

    // Try make a 3 page with any pair of games
    let foundPairForThree = false;
    for (let i = 0; i < batch.length - 1 && !foundPairForThree; i++) {
      for (let j = i + 1; j < batch.length && !foundPairForThree; j++) {
        const pair = [batch[i], batch[j]];
        if (validateGamesFor3Page(pair)) {
          pages.push({ type: "three", games: pair as any });
          // Remove the used games from batch
          batch = batch.filter((_, idx) => idx !== i && idx !== j);
          foundPairForThree = true;
        }
      }
    }
    if (foundPairForThree) {
      continue;
    }

    // Make a 1 page with the game with the most moves
    const maxMovesIdx = batch.reduce(
      (maxIdx, g, idx, arr) =>
        g.moves.length > arr[maxIdx].moves.length ? idx : maxIdx,
      0
    );
    pages.push({ type: "one", games: [batch.splice(maxMovesIdx, 1)[0]] });
  }

  const stats: Record<string, number> = {};
  for (const page of pages) {
    const key = page.type;
    stats[key] = (stats[key] ?? 0) + 1;
  }

  console.log(stats);

  // All done.
  // console.log({ pageCount: pages.length });
  // pages.length = Math.min(5, pages.length); // limit to 40 pages

  return pages;
}
