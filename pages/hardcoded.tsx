import Book from "../components/Book";
import type { Game, Settings, User } from "../types";
import type { Game as LichessGame } from "../lichess";
import Head from "next/head";
import useTranslation from "next-translate/useTranslation";
import gamesSource from '../jo55.json';
import processGame from "../lichess";

const games = gamesSource as LichessGame[];

export default function HomePage() {
  const settings: Settings = {
    pageSize: "A4",
    color: "all",
    result: "all",
    gameType: "all",
    rated: "rated",
    analysed: "all",
    dateRange: "all",
  };
  const user: User = {
    name: 'Jo55',
    rating: 1921,
    ratingProvisional: false,
    title: 'IM',
  };
  const data: { user: User, games: Game[], settings: Settings } = {
    user,
    games: games
      .filter((game, i) => game.analysis !== undefined)
      .filter((game, i) => i === 80)
      .map((game) => processGame(game, "jo55", settings))
      .filter((game): game is Game =>
        game !== undefined
        && game.movesCount > 10
        && (game.white.rating + game.black.rating) > 3000
        && game.analysis !== undefined
      )
      .sort((a, b) => (a.white.rating + a.black.rating > b.white.rating + b.black.rating ? -1 : 1)),
    settings,
  };
  const { t } = useTranslation("common");

  return <>
    <Head>
      <title>Me Chess Book</title>
    </Head>
    <div className="text-center print:hidden">
      <button
        className="my-4 mx-2 p-3 rounded-lg bg-white text-purple-600 font-semibold hover:bg-purple-100 transition duration-300 cursor-pointer"
        onClick={(e) => {
          e.preventDefault();
          window.print();
        }}
      >
        {t('button.print')}
      </button>
    </div>
    {/* <h1>{data.games.length} games</h1> */}
    {data.games.map((game, i) => (
      <div key={game.id}>
        <a href={`https://lichess.org/${game.id}`}>https://lichess.org/{game.id}</a>
      </div>
    ))}
    <Book data={data} />
  </>;
}
