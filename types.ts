import {
  Game as LichessGame,
  Player as LichessPlayer,
  User as LichessUser,
} from "./lichess";

// @todo: Make our own types.
export type User = LichessUser;
export type Game = LichessGame;
export type Player = LichessPlayer;

export type Settings = {
  pageSize: "A4" | "A5";
  color: "all" | "white" | "black";
  results: "all" | "wins" | "losses";
  gameType: string;
  rated: "all" | "rated" | "unrated";
};
