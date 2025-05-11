import { Fragment } from "react";
import { Game } from "../../types";
import ChessBoard from "../Chess/ChessBoard";
import PlayerTitle from "../PlayerTitle";
import Page, { type PageProps } from "./page";
import GameTitle from "../GameTitle";

export default function OneGamePage(props: PageProps & { game: Game }) {
  const moves = props.game.moves.split(" ");
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
    <Page {...props}>
      <ChessBoard game={props.game} />
      <div>
        <GameTitle
          zoom={props.settings.pageSize === "A4" ? 1 : 0.75}
          black={props.game.players.black}
          white={props.game.players.white}
        />
        <div className={size}>
          {style === "inline"
            ? (
              <div className="text-justify">
                {pairs.map((moves, i) => (
                  <Fragment key={i}>
                    <span className="whitespace-nowrap">
                      <span className="text-gray-400 font-anton">{i + 1}</span>
                      &nbsp;
                      {moves[0]}
                      &nbsp;
                      {moves[1]}.
                    </span>
                    {" "}
                  </Fragment>
                ))}
              </div>
            )
            : (
              <div className={`${columns}`}>
                <table className="w-full">
                  {pairs.map((moves, i) => (
                    <tr
                      key={i}
                      className={i === 13
                        ? "border-t-2 border-b-2 border-black"
                        : ""}
                    >
                      <td className="text-gray-400 w-6 font-anton">{i + 1}</td>
                      <td>{moves[0]}</td>
                      <td>{moves[1]}</td>
                    </tr>
                  ))}
                </table>
              </div>
            )}
        </div>
      </div>
    </Page>
  );
}
