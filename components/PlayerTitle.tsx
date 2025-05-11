import { Player } from "../types";

export default function PlayerTitle(
  props: { player: Player | undefined },
) {
  if (props?.player?.user?.name === undefined) {
    return (
      <span>
        <em>Unknown</em>
      </span>
    );
  }
  return (
    <span className="relative inline-block text-4xl">
      {props.player.user.title && (
        <div className="bg-black text-white text-xl font-medium pt-1 rounded-sm font-[Roboto] rotate-270 block w-14 float-left text-center -mr-2 mt-2 -ml-2">
          {props.player.user.title}
        </div>
      )}
      {props.player.user.name}{" "}
      <small className="text-gray-500 align-super inline-block -ml-1">
        <small>
          {props.player.rating.toLocaleString()}
          {props.player.provisional && <span className="text-gray-400">?</span>}
        </small>
      </small>
    </span>
  );
}
