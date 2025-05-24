export type User = {
  name: string,
  rating?: number,
  ratingProvisional?: boolean
  title?: string,
};

export type Game = {
  id: string,
  white: User,
  black: User,
  board: {
    pgn: string,
    ply: number,
  },
  moves: string,
  analysis?: {
    eval: number,
    type: 'mistake' /** ? */ | 'blunder' /** ?? */ | 'inaccuracy' /** ?! */
  }
};

export type Settings = {
  pageSize: "A4" | "A5";
  color: "all" | "white" | "black";
  results: "all" | "wins" | "draws" | "losses";
  gameType: string;
  rated: "all" | "rated" | "unrated";
};
