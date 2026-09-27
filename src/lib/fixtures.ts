import { Chess } from "chess.js";
import type { Game as LichessGame } from "./lichess";

/**
 * Deterministic fixtures shaped like the Lichess API responses.
 *
 * Used by the unit tests and by `scripts/pdf-check.mjs` (through Playwright
 * route interception), so the print check never touches the network and a run
 * is reproducible.
 */

export const FIXTURE_USERNAME = "fixtureuser";

/** Deterministic PRNG (mulberry32). */
export function mulberry32(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

interface FixtureSpec {
  plies: number;
  analysed?: boolean;
  /** Whether the fixture user is White (default true). */
  white?: boolean;
}

/** Play a deterministic, quiet game of exactly `plies` half-moves. */
function playGame(plies: number, seed: number): { pgn: string; sans: string[] } {
  for (let attempt = 0; attempt < 500; attempt++) {
    const chess = new Chess();
    const rng = mulberry32(seed + attempt * 7919);
    const sans: string[] = [];

    while (sans.length < plies) {
      const moves = chess.moves({ verbose: true });
      if (moves.length === 0) break;
      // Prefer quiet moves so random play lasts long enough to reach `plies`.
      const quiet = moves.filter((m) => !m.captured && !m.promotion);
      const pool = quiet.length > 0 ? quiet : moves;
      const pick = pool[Math.floor(rng() * pool.length)];
      if (!pick) break;
      const move = chess.move({
        from: pick.from,
        to: pick.to,
        promotion: pick.promotion,
      });
      if (!move) break;
      sans.push(move.san);
    }

    if (sans.length >= plies) {
      // Rebuild from the trimmed move list so the PGN and SAN list agree.
      const trimmed = new Chess();
      for (const san of sans.slice(0, plies)) trimmed.move(san);
      return { pgn: trimmed.pgn(), sans: sans.slice(0, plies) };
    }
  }
  throw new Error(`Could not build a ${plies}-ply game`);
}

function makeAnalysis(plies: number, rng: () => number) {
  const out: { eval: number; judgment?: { name: string; comment: string } }[] =
    [];
  const blunderPly = Math.max(1, Math.floor(plies * 0.6));
  const mistakePly = Math.max(1, Math.floor(plies * 0.3));
  let evalCp = 20;

  for (let i = 0; i < plies; i++) {
    evalCp += Math.round((rng() - 0.5) * 60);
    if (i === blunderPly) {
      evalCp += 450;
      out.push({ eval: evalCp, judgment: { name: "Blunder", comment: "" } });
    } else if (i === mistakePly) {
      evalCp -= 130;
      out.push({ eval: evalCp, judgment: { name: "Mistake", comment: "" } });
    } else {
      out.push({ eval: evalCp });
    }
  }
  return out;
}

function makeGame(spec: FixtureSpec, index: number): LichessGame {
  const { pgn, sans } = playGame(spec.plies, 1000 + index * 37);
  const rng = mulberry32(5000 + index);
  const userIsWhite = spec.white ?? true;

  const other = `opponent${index}`;
  const players = {
    white: {
      user: { name: userIsWhite ? FIXTURE_USERNAME : other, id: "w" },
      rating: 1600 + index * 12,
      provisional: index % 3 === 0,
    },
    black: {
      user: { name: userIsWhite ? other : FIXTURE_USERNAME, id: "b" },
      rating: 1580 + index * 9,
    },
  };

  return {
    id: `fixture${index}`,
    rated: true,
    variant: "standard",
    speed: "blitz",
    perf: "blitz",
    createdAt: 1700000000000 + index * 86400000,
    lastMoveAt: 1700000000000 + index * 86400000 + 300000,
    status: "resign",
    source: "friend",
    players,
    winner: index % 2 === 0 ? "white" : "black",
    moves: sans.join(" "),
    clock: { initial: 300, increment: 3, totalTime: 420 },
    pgn,
    analysis: spec.analysed ? makeAnalysis(spec.plies, rng) : undefined,
  };
}

const SPECS: FixtureSpec[] = [
  { plies: 24, analysed: true },
  { plies: 40, analysed: true },
  { plies: 60 },
  { plies: 18, analysed: true },
  { plies: 30 },
  { plies: 50, analysed: true },
  { plies: 12 },
  { plies: 34 },
  { plies: 44, analysed: true },
  { plies: 70 },
  { plies: 90 },
  { plies: 100, analysed: true },
  { plies: 26 },
  { plies: 56 },
];

export interface Fixtures {
  user: { username: string };
  games: LichessGame[];
}

/** A fresh set of fixtures (deterministic, so identical every call). */
export function makeFixtures(): Fixtures {
  return {
    user: { username: FIXTURE_USERNAME },
    games: SPECS.map((spec, index) => makeGame(spec, index)),
  };
}

/** The games endpoint body: one JSON object per line (NDJSON). */
export function makeGamesNdjson(fixtures: Fixtures): string {
  return fixtures.games.map((game) => JSON.stringify(game)).join("\n") + "\n";
}
