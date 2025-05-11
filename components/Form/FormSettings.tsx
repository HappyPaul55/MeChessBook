import type { User as LichessUser } from "../../lichess";
import { useState } from "react";
import { Settings } from "../../types";

export default function FormSettings(
  props: {
    user: LichessUser;
    setSettings: (settings: Settings) => void;
  },
) {
  const [color, setColor] = useState<Settings["color"]>("all");
  const [results, setResults] = useState<Settings["results"]>("all");
  const [rated, setRated] = useState<Settings["rated"]>("all");
  const [gameType, setGameType] = useState<Settings["gameType"]>("all");

  return (
    <>
      <h1 className="text-3xl font-bold text-white mb-6 text-center drop-shadow-lg">
        Book Settings...
      </h1>
      <form
        className="flex flex-col gap-4"
        onSubmit={() =>
          props.setSettings({
            color,
            results,
            gameType,
            rated,
            pageSize: "A4",
          })}
      >
        <select
          value={results}
          onChange={(e) => setResults(e.target.value as Settings["results"])}
          className="px-4 py-3 rounded-lg bg-white placeholder-white text-black border border-white/30 focus:outline-none focus:ring-2 focus:ring-white/50 backdrop-blur-md"
        >
          <option value="all">Wins and Losses</option>
          <option value="wins">Just Wins</option>
          <option value="losses">Just Losses</option>
        </select>
        <select
          value={results}
          onChange={(e) => setColor(e.target.value as Settings["color"])}
          className="px-4 py-3 rounded-lg bg-white placeholder-white text-black border border-white/30 focus:outline-none focus:ring-2 focus:ring-white/50 backdrop-blur-md"
        >
          <option value="all">Black and White</option>
          <option value="black">Just Black</option>
          <option value="white">Just White</option>
        </select>
        <select
          value={gameType}
          onChange={(e) => setGameType(e.target.value)}
          className="px-4 py-3 rounded-lg bg-white placeholder-white text-black border border-white/30 focus:outline-none focus:ring-2 focus:ring-white/50 backdrop-blur-md"
        >
          <option value="all">All Game Types</option>
          {Object.keys(props.user.perfs).map((gameType) => (
            <option key={gameType} value={gameType}>{gameType}</option>
          ))}
        </select>
        <select
          value={rated}
          onChange={(e) => setRated(e.target.value as Settings["rated"])}
          className="px-4 py-3 rounded-lg bg-white placeholder-white text-black border border-white/30 focus:outline-none focus:ring-2 focus:ring-white/50 backdrop-blur-md"
        >
          <option value="all">Rated and Unrated</option>
          <option value="rated">Rated</option>
          <option value="unrated">Unrated</option>
        </select>
        <button
          type="submit"
          className="mt-4 py-3 rounded-lg bg-white text-purple-600 font-semibold hover:bg-purple-100 transition duration-300 cursor-pointer"
        >
          Let's Go...
        </button>
      </form>
    </>
  );
}
