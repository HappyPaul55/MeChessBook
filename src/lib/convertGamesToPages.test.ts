import { describe, expect, test } from "bun:test";
import convertGamesToPages from "./convertGamesToPages";
import type { Game } from "./types";

function makeGame(id: string, movesCount: number, rating: number): Game {
  const user = { name: id, rating, ratingProvisional: false };
  return {
    id,
    white: user,
    black: user,
    board: { grid: [], ply: 0, turn: "w" },
    moves: new Array(movesCount).fill("e4").join(" "),
    movesCount,
  };
}

const settings = {
  pageSize: "A5",
  color: "all",
  result: "all",
  gameType: "all",
  rated: "all",
  analysed: "all",
  dateRange: "all",
} as const;

describe("convertGamesToPages", () => {
  test("returns nothing for no games", () => {
    expect(convertGamesToPages(settings, [])).toEqual([]);
  });

  test("uses every game exactly once", () => {
    const games = Array.from({ length: 19 }, (_, i) =>
      makeGame(`g${i}`, 20 + (i % 7) * 6, 1400 + i * 15),
    );
    const pages = convertGamesToPages(settings, games);

    const used = pages.flatMap((page) => page.games.map((game) => game.id));
    expect(used.length).toBe(games.length);
    expect(new Set(used).size).toBe(games.length);
  });

  test("puts the strongest game on the first page, alone", () => {
    const games = [
      makeGame("weak", 30, 1200),
      makeGame("strong", 30, 2100),
      makeGame("mid", 30, 1600),
    ];
    const pages = convertGamesToPages(settings, games);
    expect(pages[0]!.type).toBe("one");
    expect(pages[0]!.games).toHaveLength(1);
    expect(pages[0]!.games[0]!.id).toBe("strong");
  });

  test("only produces one/three/six pages with a matching game count", () => {
    const games = Array.from({ length: 24 }, (_, i) =>
      makeGame(`g${i}`, 10 + (i % 5) * 18, 1500 + (i % 8) * 40),
    );
    for (const page of convertGamesToPages(settings, games)) {
      if (page.type === "one") {
        expect(page.games).toHaveLength(1);
      } else if (page.type === "three") {
        expect(page.games.length).toBeGreaterThanOrEqual(1);
        expect(page.games.length).toBeLessThanOrEqual(3);
      } else {
        // A `six` page is used whenever the six-game test passes, including a
        // short final batch, so it can hold anywhere from 1 to 6 games.
        expect(page.games.length).toBeGreaterThanOrEqual(1);
        expect(page.games.length).toBeLessThanOrEqual(6);
      }
    }
  });

  test("is deterministic", () => {
    const games = Array.from({ length: 13 }, (_, i) =>
      makeGame(`g${i}`, 12 + (i % 6) * 14, 1450 + i * 20),
    );
    const ids = () =>
      convertGamesToPages(settings, games)
        .flatMap((page) => page.games.map((game) => game.id))
        .join(",");
    expect(ids()).toBe(ids());
  });

  test("gives A5 smaller multi-game pages than A4", () => {
    const games = Array.from({ length: 12 }, (_, i) =>
      makeGame(`g${i}`, 60, 2000 - i * 5),
    );
    const largest = (pageSize: "A4" | "A5") =>
      Math.max(
        ...convertGamesToPages({ ...settings, pageSize }, games).map((page) =>
          page.games.length
        ),
      );

    // The same games fit more to an A4 page than to an A5 page, so an A5 book
    // never squeezes a long game onto an overloaded sheet.
    expect(largest("A4")).toBeGreaterThan(largest("A5"));
    expect(largest("A5")).toBeLessThanOrEqual(3);
  });
});
