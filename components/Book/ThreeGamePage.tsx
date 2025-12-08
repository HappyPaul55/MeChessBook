import { Fragment } from "react";
import { Game, Settings } from "../../types";
import ChessBoard from "../Chess/ChessBoard";
import { type PageProps } from "./Page";
import GameTitle from "../GameTitle";
import ContentPage from "./ContentPage";
import MoveListTable from "../Chess/MoveListTable";
import MoveListInline from "../Chess/MoveListInline";

function GameRow(props: { index: number; settings: Settings; game: Game }) {
  const movess = props.game.moves.split(" ");
  const moves = [
    ...movess,
  ];
  const pairs: [string, string?][] = [];

  for (let i = 0; i < moves.length; i++) {
    const pairIndex = Math.floor(i / 2);
    if (!pairs[pairIndex]) {
      pairs[pairIndex] = [""];
    }
    pairs[pairIndex][i % 2] = moves[i];
  }

  // Find the best variant to use to get the most out the move data.
  let style: "table" | "inline" = "table";
  let size = "hidden";
  let columns = "columns-4 gap-4";
  if (props.settings.pageSize === "A4") {
    if (moves.length < 20 * 2) {
      style = "table";
      size = "text-base";
      columns = "columns-2 gap-10";
    } else if (moves.length < 33 * 2) {
      style = "inline";
      size = "text-base";
      columns = "columns-2 gap-5";
    } else {
      style = "inline";
      size = "text-sm";
    }
  } else {
    if (moves.length < 16 * 2) {
      style = "table";
      size = "text-sm";
      columns = "columns-2 gap-10";
    } else if (moves.length < 22 * 2) {
      style = "table";
      size = "text-xs";
      columns = "columns-2 gap-10";
    } else if (moves.length < 33 * 2) {
      style = "table";
      size = "text-xs";
      columns = "columns-3 gap-2";
    } else {
      style = "inline";
      size = "text-xs";
    }
  }

  return (
    <div
      className={`grid grid-cols-2 mb-5 ${props.index < 2 && "border-b-2 border-dotted border-gray-300"
        }`}
    >
      <div
        className={`${props.index % 2 === 0 ? "order-1 -left-2" : "order-2 -right-4"
          } px-2 relative`}
      >
        <ChessBoard game={props.game} />
      </div>
      <div
        className={`${props.index % 2 === 0 ? "order-2" : "order-1"}`}
      >
        <div className="mb-2">
          <GameTitle
            zoom={props.settings.pageSize === "A4" ? 0.6 : 0.45}
            black={props.game.black}
            white={props.game.white}
          />
        </div>
        <div className={size}>
          {style === "inline"
            ? (
              <MoveListInline moves={moves} highlightedPly={props.game.board.ply} size={size} />
            )
            : (
              <MoveListTable moves={moves} highlightedPly={props.game.board.ply} size={size} columns={columns} />
            )}
        </div>
      </div>
    </div>
  );
}

export default function ThreeGamePage(props: PageProps & { games: Game[] }) {
  return (
    <ContentPage {...props}>
      {props.games.map((game, i) => (
        <GameRow
          index={i}
          key={game.id}
          settings={props.settings}
          game={game}
        />
      ))}
    </ContentPage>
  );
}
