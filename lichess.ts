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
  winner: string;
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
