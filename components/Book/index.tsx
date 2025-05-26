import { ReactNode, useCallback, useId, useState } from "react";
import type { Game, Settings, User } from "../../types";
import OneGamePage from "./OneGamePage";
import ThreeGamePage from "./ThreeGamePage";
import Page from "./page";
import Head from "next/head";
import ContentPage from "./ContentPage";
import CoverPage from "./CoverPage";
import SixGamePage from "./SixGamePage";

function stringToNumber(input: string, min: number, max: number) {
  let hash = 0;
  for (let i = 0; i < input.length; i++) {
    hash = (hash * 31 + input.charCodeAt(i)) >>> 0;
  }
  return (hash % max) + min;
}

type ChessPage = {
  type: 'one',
  games: [Game],
} | {
  type: 'three',
  games: [Game, Game, Game | undefined],
} | {
  type: 'four',
  games: [Game, Game, Game, Game],
} | {
  type: 'six',
  games: [Game, Game, Game, Game, Game | undefined, Game | undefined],
}

function convertGamesToPages(settings: Settings, games: Game[]): ChessPage[] {
  const result: ChessPage[] = [];

  function scoreGame(game: Game): number {
    return game.black.rating * 100
      + game.white.rating * 100
      - (Number(game.black.ratingProvisional) * 1)
      - (Number(game.white.ratingProvisional) * 1);
  }
  const gamesSortedByStrength = games.sort((a, b) => {
    const aScore = scoreGame(a);
    const bScore = scoreGame(b);

    if (aScore === bScore) {
      return 0;
    }

    return aScore > bScore ? -1 : 1;
  });

  // Best Game gets a full page
  if (gamesSortedByStrength[0]) {
    result.push({
      type: 'one',
      games: [gamesSortedByStrength[0]]
    });
  }

  const batch: Game[] = [];
  for (let i = 1; i < gamesSortedByStrength.length; i++) {
    batch.push(gamesSortedByStrength[i]);

    // @todo: Highlight games without any blunders/mistakes.
    // @todo: Maybe highlight games that are full of blunders.

    if (batch.length < 4 && (i > gamesSortedByStrength.length * 0.33 || settings.pageSize === 'A5')) {
      if (batch.length === 3) {
        result.push({
          type: 'three',
          games: [...batch] as [Game, Game, Game],
        });
        batch.length = 0;
        continue;
      }
    } else {
      if (batch.length === 6) {
        result.push({
          type: 'six',
          games: [...batch] as [Game, Game, Game, Game, Game, Game],
        });
        batch.length = 0;
        continue;
      }
    }
  }

  // No more games to add to batch, what was left over in the batching?
  if (batch.length === 1) result.push({ type: 'one', games: [...batch] as [Game] });
  if (batch.length === 2 || batch.length === 3) result.push({ type: 'three', games: [...batch] as [Game, Game, Game | undefined] });
  if (batch.length > 3) result.push({ type: 'six', games: [...batch] as any });
  batch.length = 0;

  return result;
}

export default function Book(
  props: { data: { user: User; games: Game[]; settings: Settings } },
) {
  const [activePage, setActivePage] = useState<number>(0);
  const cover = stringToNumber(useId(), 1, 9);

  const pageClickHandler = useCallback((pageNumber: number) => {
    if (pageNumber < 0) {
      setActivePage(0);
      return;
    }
    setActivePage(pageNumber >= activePage ? activePage + 2 : activePage - 2);
  }, [activePage, setActivePage]);

  const pages: ReactNode[] = [];
  pages.push(
    <CoverPage
      key="front-cover"
      settings={props.data.settings}
      className={activePage > pages.length ? "turned" : ""}
      onClick={pageClickHandler}
      pageNumber={pages.length}
    >
      <div
        className="absolute inset-0 bg-cover bg-bottom z-0"
        style={{
          backgroundImage: `url(/covers/${cover}.jpg)`,
        }}
      />
      <h1
        className="absolute left-0 right-0 bottom-0 z-10 py-20 text-center text-8xl font-bold text-white font-[Anton] text-shadow-lg text-shadow-black"
        style={{ zoom: props.data.settings.pageSize === "A5" ? 1 : 1.5 }}
      >
        <div className="text-5xl">The</div>
        <div>{props.data.user.name}</div>
        <div>Chess</div>
        <div>Book</div>
      </h1>
    </CoverPage>,
  );

  // Imprint
  pages.push(
    <ContentPage
      key="imprint"
      pageNumber={pages.length}
      settings={props.data.settings}
      className={activePage > pages.length ? "turned" : ""}
      onClick={pageClickHandler}
    >
      <div className="flex justify-center h-full">
        <div className="px-20 m-auto text-center">
          <p className="mb-10">
            Created By MeChessBook{" "}
            <a className="underline" href="https://me-chess-book.vercel.app/">
              me-chess-book.vercel.app
            </a>
          </p>

          <p className="mb-10">
            Created dynamically from the content of{" "}
            <a
              className="underline"
              href={`https://lichess.org/@/${props.data.user.name}`}
            >
              https://lichess.org/@/{props.data.user.name}
            </a>
          </p>

          <p className="mb-10">Design and layout by Paul Hutchinson</p>

          <p className="mb-10">
            All rights reserved. No part of this work may be reproduced or
            utilised in any form or by any means, electronic or mechanical,
            including photocopying, recording or by any information storage and
            retrieval system, without the prior written permission of the
            publisher.
          </p>

          <p className="mb-10">ISBN Not Required</p>

          <p className="mb-10">
            A CIP catalogue record for this book is not available from the
            British Library.
          </p>

          <p className="mb-10">Printed and bound in Great Britain</p>
        </div>
      </div>
    </ContentPage>,
  );

  const gamePages = convertGamesToPages(props.data.settings, props.data.games);
  console.log({ gamePages })
  for (const gamePage of gamePages) {
    if (gamePage.type === 'one') {
      const game = gamePage.games[0];
      pages.push(<OneGamePage
        key={game.id}
        pageNumber={pages.length}
        game={game}
        settings={props.data.settings}
        className={activePage > pages.length ? "turned" : ""}
        onClick={pageClickHandler}
      />);
    } else if (gamePage.type === 'three') {
      pages.push(
        <ThreeGamePage
          key={gamePage.games.map((game) => game?.id ?? '0').join("-")}
          pageNumber={pages.length}
          games={gamePage.games.filter((game): game is Game => {
            return game !== undefined;
          })}
          settings={props.data.settings}
          className={activePage > pages.length ? "turned" : ""}
          onClick={pageClickHandler}
        />
      );
    } else if (gamePage.type === 'four') {
      // @todo: Four Game Page
      // pages.push(
      //   <FourGamePage
      //     key={gamePage.games.map((game) => game.id).join("-")}
      //     pageNumber={pages.length}
      //     games={gamePage.games}
      //     settings={props.data.settings}
      //     className={activePage > pages.length ? "turned" : ""}
      //     onClick={pageClickHandler}
      //   />
      // );
    } else if (gamePage.type === 'six') {
      pages.push(
        <SixGamePage
          key={gamePage.games.map((game) => game?.id ?? '0').join("-")}
          pageNumber={pages.length}
          games={gamePage.games.filter((game): game is Game => {
            return game !== undefined;
          })}
          settings={props.data.settings}
          className={activePage > pages.length ? "turned" : ""}
          onClick={pageClickHandler}
        />
      );
    }
  }

  if (pages.length % 2 === 0) {
    pages.push(
      <Page
        key="back-spacer-page"
        settings={props.data.settings}
        className={activePage > pages.length ? "turned" : ""}
        onClick={pageClickHandler}
        pageNumber={pages.length}
      />,
    );
  }

  pages.push(
    <CoverPage
      key="back-cover"
      settings={props.data.settings}
      className={activePage > pages.length ? "turned" : ""}
      onClick={pageClickHandler}
      pageNumber={-pages.length}
    >
      <div
        className="absolute inset-0 bg-cover bg-bottom z-0 blur-sm"
        style={{
          backgroundImage: `url(/covers/${cover}.jpg)`,
          transform: "scaleX(-1)",
        }}
      />
      <p
        className="absolute z-10 bottom-0 py-40 px-20 text-center text-xl font-bold text-white font-[Anton] text-shadow-md text-shadow-black/80"
        style={{ zoom: props.data.settings.pageSize === "A5" ? 1 : 1.5 }}
      >
        This book is made up of {props.data.games.length.toLocaleString()}{" "}
        games from{" "}
        {props.data.user.name}.
        <br />
        <br />
        You can make your own at{" "}
        <a href="https://me-chess-book.vercel.app/">me-chess-book.vercel.app</a>.
      </p>
    </CoverPage>,
  );

  return (
    <div
      className={`print:w-auto mx-auto book-container simulate print:block print:mx-0 ${props.data.settings.pageSize === "A4"
        ? "w-a4 2xl:grid 2xl:grid-cols-2 2xl:w-a2"
        : "w-a5 xl:grid xl:grid-cols-2 xl:w-a3"
        }`}
    >
      <div />
      {pages}
      <Head>
        <style>
          {`
          @page {
            size: ${props.data.settings.pageSize} portrait;
            margin: 0;
            padding: 0;
          }
        `}
        </style>
      </Head>
    </div>
  );
}
