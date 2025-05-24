import { Game, Settings } from "../../types";
import ChessBoard from "../Chess/ChessBoard";
import { type PageProps } from "./page";
import GameTitle from "../GameTitle";
import ContentPage from "./ContentPage";
import MoveListTable from "../Chess/MoveListTable";

function GameRow(props: { index: number; settings: Settings; game: Game }) {
  const moves = props.game.moves.split(" ");

  // Find the best variant to use to get the most out the move data.
  let size = "text-xs";
  if (moves.length < 20 * 2) {
    size = "text-xs";
  } else if (moves.length < 33 * 2) {
    size = "text-xs";
  } else {
    size = "text-xs";
  }

  return (
    <div>
      <ChessBoard game={props.game} className="text-sm" />
      <div className="mb-2">
        <GameTitle
          zoom={0.4}
          black={props.game.black}
          white={props.game.white}
        />
      </div>
      <MoveListTable moves={moves} highlightedPly={props.game.board.ply} size={size} columns="columns-2 gap-4" />
    </div>
  );
}

export default function SixGamePage(props: PageProps & { games: Game[] }) {
  return (
    <ContentPage {...props}>
      <div className="grid grid-cols-3 gap-4">
        {props.games.map((game, i) => (
          <GameRow
            index={i}
            key={game.id}
            settings={props.settings}
            game={game}
          />
        ))}
      </div>
    </ContentPage>
  );
}
