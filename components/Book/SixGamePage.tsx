import { Game, Settings } from "../../types";
import ChessBoard from "../Chess/ChessBoard";
import { type PageProps } from "./Page";
import GameTitle from "../GameTitle";
import ContentPage from "./ContentPage";
import MoveListTable from "../Chess/MoveListTable";
import MoveListInline from "../Chess/MoveListInline";

function GameRow(props: { settings: Settings; game: Game, otherGameMoves: number }) {
  const moves = props.game.moves.split(" ");

  // Find the best variant to use to get the most out the move data.
  let size = "text-xs";

  return (
    <div className="mb-10">
      <ChessBoard game={props.game} className="text-sm" />
      <div className="mb-2">
        <GameTitle
          zoom={0.4}
          black={props.game.black}
          white={props.game.white}
        />
      </div>
      {(props.otherGameMoves + props.game.movesCount) < 65 * 2
        ? (
          <MoveListTable moves={moves} highlightedPly={props.game.board.ply} size={size} columns="columns-2 gap-4" />
        )
        : (
          <MoveListInline moves={moves} highlightedPly={props.game.board.ply} size={size} />
        )}
    </div>
  );
}

export default function SixGamePage(props: PageProps & { games: Game[] }) {
  const sortedByMoveCountGames = [...props.games].sort((a, b) => {
    return b.movesCount - a.movesCount;
  });

  const columns: [number, number | undefined][] = [];
  const offset = sortedByMoveCountGames.length - 1;

  for (let i = 0; i < 3; i++) {
    if (!sortedByMoveCountGames[i]) {
      break;
    }

    const newColumn: [number, number | undefined] = [i, undefined];
    const key = offset - i;
    if (offset - 1 > 2 && sortedByMoveCountGames[key]) {
      newColumn[1] = key;
    }

    columns.push(newColumn);
  }

  return (
    <ContentPage {...props}>
      <div className={`grid grid-cols-3 gap-x-4 gap-y-4`}>
        {
          columns.map((pair) => (<div key={`${pair.join("-")}`}>
            <GameRow
              key={pair[0]}
              settings={props.settings}
              game={sortedByMoveCountGames[pair[0]]}
              otherGameMoves={pair[1] ? sortedByMoveCountGames[pair[1]].movesCount : 0}
            />
            {pair[1] && <GameRow
              key={pair[1]}
              settings={props.settings}
              game={sortedByMoveCountGames[pair[1]]}
              otherGameMoves={sortedByMoveCountGames[pair[0]].movesCount}
            />}
          </div>))
        }
      </div>
    </ContentPage>
  );
}
