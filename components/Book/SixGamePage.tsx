import { Fragment } from "react";
import { Game, Settings } from "../../types";
import ChessBoard from "../Chess/ChessBoard";
import { type PageProps } from "./page";
import GameTitle from "../GameTitle";
import ContentPage from "./ContentPage";

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
  let size = "text-xs";
  const columns = "columns-2 gap-4";
  if (moves.length < 20 * 2) {
    size = "text-xs";
  } else if (moves.length < 33 * 2) {
    size = "text-xs";
  } else {
    size = "text-xs";
  }

  return (
    <div>
      <ChessBoard game={props.game} />
      <div className="mb-2">
        <GameTitle
          zoom={0.4}
          black={props.game.players.black}
          white={props.game.players.white}
        />
      </div>
      <div className={size}>
        <div className={`${columns}`}>
          <table className="w-full">
            <tbody>
              {pairs.map((moves, i) => (
                <tr
                  key={i}
                  className={i === 13
                    ? "border-t-2 border-b-2 border-black"
                    : ""}
                >
                  <td className="text-gray-400 w-6 font-anton">
                    {i + 1}
                  </td>
                  <td>{moves[0]}</td>
                  <td>{moves[1]}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
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
