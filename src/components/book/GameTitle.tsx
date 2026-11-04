import type { User } from "../../lib/types";
import PlayerTitle from "./PlayerTitle";

export default function GameTitle(
  props: { zoom?: number; white: User; black: User; wrap?: boolean },
) {
  return (
    <h1
      className={`text-4xl mb-2 font-anton ${props.wrap ? "text-wrap" : "text-nowrap"}`}
      style={{ zoom: props.zoom }}
    >
      <PlayerTitle player={props.white} />
      <span className="text-xl align-middle text-gray-500 font-[Roboto] italic">
        &nbsp;vs&nbsp;
      </span>
      <PlayerTitle player={props.black} />
    </h1>
  );
}
