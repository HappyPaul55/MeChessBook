import { Game as GenericGame, Settings } from './types';
import { Chess } from "chess.js";

export interface User {
  id: string;
  username: string;
  perfs: Record<string, Perf>;
  patron: boolean;
  createdAt: number;
  profile: Profile;
  seenAt: number;
  playTime: PlayTime;
  url: string;
  count: Count;
}

export interface Perf {
  games: number;
  rating: number;
  rd: number;
  prog: number;
  prov?: boolean;
}

export interface Profile {
  location: string;
  ecfRating: number;
  realName: string;
  flag: string;
  bio: string;
  links: string;
}

export interface PlayTime {
  total: number;
  tv: number;
}

export interface Count {
  all: number;
  rated: number;
  ai: number;
  draw: number;
  drawH: number;
  loss: number;
  lossH: number;
  win: number;
  winH: number;
  bookmark: number;
  playing: number;
  import: number;
  me: number;
}

export interface Game {
  id: string;
  rated: boolean;
  variant: string;
  speed: string;
  perf: string;
  createdAt: number;
  lastMoveAt: number;
  status: string;
  source: string;
  players: Players;
  winner: 'black' | 'white' | '';
  moves: string;
  clock: Clock;
  tournament?: string;
  pgn: string;
  analysis?: {
    eval: number,
    best?: string,
    variation?: string,
    judgment?: {
      name: string,
      comment: string,
    },
  }[]
}

export interface Players {
  white: Player;
  black: Player;
}

export interface Player {
  user: UserLite;
  rating: number;
  ratingDiff?: number;
  provisional?: boolean;
}

export interface UserLite {
  name: string;
  id: string;
  patron?: boolean;
  flair?: string;
  title?: string;
}

export interface Clock {
  initial: number;
  increment: number;
  totalTime: number;
}

function randomNumberBetween(min: number, max: number): number {
  // Box-Muller transform for normal distribution
  const mean = (min + max) / 2;
  const stddev = (max - min) / 6; // ~99.7% within [min, max]
  let val;
  do {
    const u = 1 - Math.random();
    const v = Math.random();
    val = Math.round(mean + stddev * Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v));
  } while (val < min || val > max);
  return val;
}

const judgementMap = {
  mistake: '?',
  blunder: '??',
  inaccuracy: '?!',
} as const;

export default function processGame(game: Game, username: string, settings: Settings): GenericGame | undefined {
  // No AI games.
  if (game.source === 'ai') {
    return undefined;
  }

  // No variants other than standard chess.
  if (game.variant !== 'standard') {
    return undefined;
  }

  // Filter by result if needed.
  const color = game.players.black.user.name === username ? 'black' : 'white';
  if ((settings.result !== 'all' && !['black', 'white'].includes(game.winner))
    || (settings.result === 'wins' && color !== game.winner)
    || (settings.result === 'losses' && color === game.winner)
  ) {
    // The game did not match the requirement of only showing wins or only losses.
    console.debug("filtering out " + game.id)
    return undefined;
  }

  if ((game.pgn ?? '').trim() === '') {
    throw new Error("Game has no PGN: " + game.id);
  }

  const moves = game.moves.split(" ");
  const movesCount = moves.length;
  let positionDelta = 0;
  let biggestDelta = 0;
  let biggestDeltaPly = -1;
  for (let i = 0; i < (game.analysis?.length ?? 0); i++) {
    const analysis = game.analysis![i]!;
    const name = analysis.judgment?.name.toLowerCase() as keyof typeof judgementMap | undefined;
    const delta = Math.abs(analysis.eval - positionDelta);
    if (name !== undefined) {
      moves[i] += judgementMap[name];
    }

    if (delta > biggestDelta) {
      // If it's a blunder, always pick that.
      biggestDelta = name === 'blunder' ? Infinity : delta;
      biggestDeltaPly = i;
    }

    positionDelta = analysis.eval;
  }
  const plyOfInterest = biggestDeltaPly !== -1
    ? biggestDeltaPly
    : randomNumberBetween(Math.max(0, Math.min(movesCount - 2, 3)), movesCount)

  const chess = new Chess(undefined, { skipValidation: true });
  chess.loadPgn(game.pgn);
  while (chess.moveNumber() > 1
    && (chess.moveNumber() - 1) * 2 + Number(chess.turn() === 'b') > plyOfInterest) {
    chess.undo();
  }

  const board = chess.board();
  if (chess.turn() === 'b') {
    board.reverse();
    board.map(row => row.reverse());
  }

  return {
    id: game.id,
    white: {
      name: game.players.white.user.name,
      rating: game.players.white.rating,
      ratingProvisional: game.players.white.provisional === true,
    },
    black: {
      name: game.players.black.user.name,
      rating: game.players.black.rating,
      ratingProvisional: game.players.black.provisional === true,
    },
    moves: moves.join(" "),
    movesCount,
    board: {
      grid: board,
      ply: plyOfInterest - 1,
      turn: chess.turn(),
    },
    analysis: game.analysis?.map(entry => ({
      eval: entry.eval,
      type: entry.judgment?.name
        ? (entry.judgment.name.toLowerCase() as 'mistake' /** ? */ | 'blunder' /** ?? */ | 'inaccuracy' /** ?! */)
        : undefined
    })),
  };
}