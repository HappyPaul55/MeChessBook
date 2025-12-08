import { Game, Settings } from "../../types";
import ChessBoard from "../Chess/ChessBoard";
import { type PageProps } from "./Page";
import GameTitle from "../GameTitle";
import ContentPage from "./ContentPage";
import MoveListTable from "../Chess/MoveListTable";
import MoveListInline from "../Chess/MoveListInline";

function GameRow(props: { index: number; settings: Settings; game: Game, totalMoveRows: number, fullLength: Boolean }) {
  const moves = props.game.moves.split(" ");

  // Find the best variant to use to get the most out the move data.
  let size = "text-xs";

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
      {props.totalMoveRows > 35 * (Number(props.fullLength) + 1) && moves.length > 40 * (Number(props.fullLength) + 1)
        ? (
          <MoveListInline moves={moves} highlightedPly={props.game.board.ply} size={size} />
        )
        : (
          <MoveListTable moves={moves} highlightedPly={props.game.board.ply} size={size} columns="columns-2 gap-4" />
        )}
    </div>
  );
}

export default function SixGamePage(props: PageProps & { games: Game[] }) {
  const sortedByMoveCountGames = [...props.games].sort((a, b) => {
    return b.movesCount - a.movesCount;
  });

  const totalMoveRows = sortedByMoveCountGames[0].movesCount + (sortedByMoveCountGames[3]?.movesCount ?? 0) / 2;

  let yGap = 'gap-y-4';
  if (totalMoveRows < 80) {
    yGap = 'gap-y-20';
  } else if (totalMoveRows < 160) {
    yGap = 'gap-y-12';
  } else if (totalMoveRows < 220) {
    yGap = 'gap-y-8';
  } else {
    yGap = 'gap-y-4';
  }

  return (
    <ContentPage {...props}>
      <div className={`grid grid-cols-3 gap-x-4 ${yGap} ${totalMoveRows}`}>
        {sortedByMoveCountGames.map((game, i) => (
          <GameRow
            index={i}
            key={game.id}
            settings={props.settings}
            game={game}
            totalMoveRows={totalMoveRows}
            fullLength={props.games.length < 4}
          />
        ))}
      </div>
    </ContentPage>
  );
}
