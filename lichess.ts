import { Game as GenericGame, Settings } from './types';

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
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export default async function processGame(game: Game, username: string, settings: Settings): Promise<GenericGame | undefined> {
  const color = game.players.black.user.name === username ? 'black' : 'white';
  if ((settings.result !== 'all' && !['black', 'white'].includes(game.winner))
    || (settings.result === 'wins' && color !== game.winner)
    || (settings.result === 'losses' && color === game.winner)
  ) {
    // The game did not match the requirement of only showing wins or only losses.
    return;
  }
  return {
    id: game.id,
    white: {
      name: game.players.white.user.name,
      rating: game.players.white.rating,
      ratingProvisional: game.players.white.provisional,
    },
    black: {
      name: game.players.black.user.name,
      rating: game.players.black.rating,
      ratingProvisional: game.players.black.provisional,
    },
    moves: game.moves,
    board: {
      pgn: game.pgn,
      ply: randomNumberBetween(1, game.moves.split(" ").length),
    }
  };
}