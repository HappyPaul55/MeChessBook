import { describe, expect, test } from "bun:test";
import { FIXTURE_USERNAME, makeFixtures, mulberry32 } from "./fixtures";
import processGame from "./lichess";
import type { Settings } from "./types";

const settings: Settings = {
  pageSize: "A5",
  color: "all",
  result: "all",
  gameType: "all",
  rated: "all",
  analysed: "all",
  dateRange: "all",
};

const fixtures = makeFixtures();

describe("processGame", () => {
  test("turns a lichess game into a board and a move list", () => {
    const game = processGame(
      fixtures.games[0]!,
      FIXTURE_USERNAME,
      settings,
      mulberry32(1),
    );
    expect(game).toBeDefined();
    expect(game!.board.grid).toHaveLength(8);
    expect(game!.board.grid[0]).toHaveLength(8);
    expect(game!.movesCount).toBe(24);
    expect(game!.board.ply).toBeGreaterThanOrEqual(-1);
    expect(game!.board.ply).toBeLessThan(24);
  });

  test("is deterministic for a given rng", () => {
    const a = processGame(
      fixtures.games[3]!,
      FIXTURE_USERNAME,
      settings,
      mulberry32(42),
    );
    const b = processGame(
      fixtures.games[3]!,
      FIXTURE_USERNAME,
      settings,
      mulberry32(42),
    );
    expect(JSON.stringify(a!.board)).toBe(JSON.stringify(b!.board));
  });

  test("drops AI games and non-standard variants", () => {
    expect(
      processGame(
        { ...fixtures.games[0]!, source: "ai" },
        FIXTURE_USERNAME,
        settings,
        mulberry32(1),
      ),
    ).toBeUndefined();
    expect(
      processGame(
        { ...fixtures.games[0]!, variant: "chess960" },
        FIXTURE_USERNAME,
        settings,
        mulberry32(1),
      ),
    ).toBeUndefined();
  });

  test("honours the wins filter", () => {
    const wins = fixtures.games
      .map((game) =>
        processGame(
          game,
          FIXTURE_USERNAME,
          { ...settings, result: "wins" },
          mulberry32(1),
        )
      )
      .filter((game) => game !== undefined);

    expect(wins.length).toBeGreaterThan(0);
    // The fixture user is White in every game, and the winner alternates.
    expect(wins.every((game) => game.white.name === FIXTURE_USERNAME)).toBe(
      true,
    );
  });

  test("marks judged moves on analysed games", () => {
    const analysed = fixtures.games.find(
      (game) => (game.analysis?.length ?? 0) > 0,
    )!;
    const game = processGame(analysed, FIXTURE_USERNAME, settings, mulberry32(1))!;
    expect(game.moves.includes("?")).toBe(true);
  });

  test("throws when a game has no PGN", () => {
    expect(() =>
      processGame({ ...fixtures.games[0]!, pgn: "" }, FIXTURE_USERNAME, settings)
    ).toThrow();
  });
});
