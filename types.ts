import { Color, PieceSymbol, Square } from "chess.js";

export type ChessPage = {
  type: 'one',
  games: [Game],
} | {
  type: 'three',
  games: [Game, Game, Game | undefined],
} | {
  type: 'four',
  games: [Game, Game, Game, Game],
} | {
  type: 'six',
  games: [Game, Game, Game, Game, Game | undefined, Game | undefined],
}

export type User = {
  name: string,
  rating: number,
  ratingProvisional: boolean
  title?: string,
};

export type Game = {
  id: string,
  white: User,
  black: User,
  board: {
    grid: ({
      square: Square;
      type: PieceSymbol;
      color: Color;
    } | null)[][],
    ply: number,
    turn: Color,
  },
  moves: string,
  movesCount: number,
  analysis?: {
    eval: number,
    type?: 'mistake' /** ? */ | 'blunder' /** ?? */ | 'inaccuracy' /** ?! */
  }[]
};

export type Settings = {
  pageSize: "A4" | "A5";
  color: "all" | "white" | "black";
  result: "all" | "wins" | "draws" | "losses";
  gameType: string;
  rated: "all" | "rated" | "unrated";
  analysed: "all" | "only";
  dateRange: "all" | "last-month" | "last-year";
};
