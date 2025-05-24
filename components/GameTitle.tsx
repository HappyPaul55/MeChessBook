import { User } from "../types";
import PlayerTitle from "./PlayerTitle";

export default function GameTitle(
  props: { zoom?: number; white: User; black: User },
) {
  return (
    <h1
      className="text-4xl mb-2 font-anton text-nowrap"
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
