import { User } from "../types";

export default function PlayerTitle(
  props: { player: User | undefined },
) {
  if (props?.player?.name === undefined) {
    return (
      <span>
        <em>Unknown</em>
      </span>
    );
  }
  return (
    <span className="relative inline-block text-4xl">
      {props.player.title && (
        <div className="bg-black text-white text-xl font-medium pt-1 rounded-sm font-[Roboto] rotate-270 block w-14 float-left text-center -mr-2 mt-2 -ml-2">
          {props.player.title}
        </div>
      )}
      {props.player.name}{" "}
      {props.player.rating && <small className="text-gray-500 align-super inline-block -ml-1">
        <small>
          {props.player.rating.toLocaleString()}
          {props.player.ratingProvisional && <span className="text-gray-400">?</span>}
        </small>
      </small>}
    </span>
  );
}
