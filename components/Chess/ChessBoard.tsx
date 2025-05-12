import { Game } from "../../types";
import { Chess } from "chess.js";

const columns = [
  "A",
  "B",
  "C",
  "D",
  "E",
  "F",
  "G",
  "H",
] as const;

export default function ChessBoard(props: { game: Game }) {
  const chess = new Chess();
  chess.loadPgn(props.game.pgn);

  const board = chess.board();

  return (
    <div className="mx-4 relative chessboard">
      <div className="w-full aspect-square grid grid-cols-8 border-gray-500 border-2 mb-8">
        {(new Array(64).fill(true)).map((_, i) => {
          const row = Math.floor(i / 8);
          const col = i % 8;
          const isDark = (row + col) % 2 === 1; // alternate colors like a chessboard

          return (
            <div
              key={i}
              className={`${isDark ? "" : "bg-white"} overflow-hidden`}
            >
              {board[row][col]?.type
                ? (
                  <img
                    src={`/pieces/${
                      board[row][col]?.color === "w" ? "white" : "black"
                    }/${board[row][col]?.type.toUpperCase()}.svg`}
                    className={`block m-auto w-full h-full`}
                  />
                )
                : <div className="w-full aspect-square" />}
            </div>
          );
        })}
      </div>
      <div className="absolute top-full left-0 right-0 aspect-none grid grid-cols-8 col-span-8">
        {(new Array(8).fill(true)).map((_, i) => {
          return <div key={i} className="text-center h-0">{columns[i]}</div>;
        })}
      </div>
      <div className="absolute top-0 -left-4 bottom-0 aspect-none grid grid-cols-1 col-span-8">
        {(new Array(8).fill(true)).map((_, i) => {
          return <div key={i} className="flex items-center">{8 - i}</div>;
        })}
      </div>
    </div>
  );
}
