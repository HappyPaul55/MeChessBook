import { Game } from "../../types";

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

export default function ChessBoard(props: { game: Game, className?: string }) {
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
              {props.game.board.grid[row][col]?.type
                ? (
                  // eslint-disable-next-line
                  <img
                    src={`/pieces/${props.game.board.grid[row][col]?.color === "w" ? "white" : "black"
                      }/${props.game.board.grid[row][col]?.type.toUpperCase()}.svg`}
                    className="block m-auto w-full h-full"
                  />
                )
                : <div className="w-full aspect-square" />}
            </div>
          );
        })}
      </div>
      <div className={`${props.className ?? ''} absolute top-full left-0 right-0 aspect-none grid grid-cols-8 col-span-8`}>
        {(new Array(8).fill(true)).map((_, i) => {
          return <div key={i} className="text-center h-0">{props.game.board.turn === 'b' ? columns[7 - i] : columns[i]}</div>;
        })}
      </div>
      <div className={`${props.className ?? ''} absolute top-0 -left-4 bottom-0 aspect-none grid grid-cols-1 col-span-8`}>
        {(new Array(8).fill(true)).map((_, i) => {
          return <div key={i} className="flex items-center">{
            props.game.board.turn === 'w'
              ? 8 - i
              : i + 1
          }</div>;
        })}
      </div>
    </div>
  );
}
