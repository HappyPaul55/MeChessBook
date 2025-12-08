import { Game } from "../../types";
import ChessBoard from "../Chess/ChessBoard";
import { type PageProps } from "./Page";
import GameTitle from "../GameTitle";
import ContentPage from "./ContentPage";
import MoveListTable from "../Chess/MoveListTable";
import MoveListInline from "../Chess/MoveListInline";

export default function OneGamePage(props: PageProps & { game: Game }) {
  const moves = props.game.moves.split(" ");

  // Find the best variant to use to get the most out the move data.
  let style: "table" | "inline" = "table";
  let size = "hidden";
  let columns = "columns-4 gap-4";
  if (props.settings.pageSize === "A4") {
    if (moves.length < 11 * 2) {
      style = "table";
      size = "text-lg";
      columns = "columns-2 gap-40";
    } else if (moves.length < 24 * 2) {
      style = "table";
      size = "text-base";
      columns = "columns-2 gap-40";
    } else if (moves.length < 36 * 2) {
      style = "table";
      size = "text-base";
      columns = "columns-3 gap-8";
    } else if (moves.length < 48 * 2) {
      style = "table";
      size = "text-base";
      columns = "columns-4 gap-8";
    } else if (moves.length < 99 * 2) {
      style = "inline";
      size = "text-md";
    } else {
      style = "inline";
      size = "text-sm";
    }
  } else {
    if (moves.length < 16 * 2) {
      style = "table";
      size = "text-lg";
      columns = "columns-2 gap-20";
    } else if (moves.length < 28 * 2) {
      style = "table";
      size = "text-base";
      columns = "columns-3 gap-4";
    } else if (moves.length < 45 * 2) {
      style = "table";
      size = "text-sm";
      columns = "columns-4 gap-4";
    } else if (moves.length < 63 * 2) {
      style = "inline";
      size = "text-sm";
    } else {
      style = "inline";
      size = "text-xs";
    }
  }

  return (
    <ContentPage {...props}>
      <ChessBoard game={props.game} />
      <div>
        <GameTitle
          zoom={props.settings.pageSize === "A4" ? 1 : 0.75}
          black={props.game.black}
          white={props.game.white}
        />
        {style === "inline"
          ? (
            <MoveListInline moves={moves} highlightedPly={props.game.board.ply} size={size} />
          )
          : (
            <MoveListTable moves={moves} highlightedPly={props.game.board.ply} size={size} columns={columns} />
          )}
      </div>
    </ContentPage>
  );
}
