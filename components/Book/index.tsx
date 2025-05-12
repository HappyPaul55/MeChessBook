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
        <div>{props.data.user.username}</div>
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
            <a className="underline" href="https://www.mechessbook.com">
              www.mechessbook.com
            </a>
          </p>

          <p className="mb-10">
            Created dynamically from the content of{" "}
            <a
              className="underline"
              href={`https://lichess.org/@/${props.data.user.username}`}
            >
              https://lichess.org/@/{props.data.user.username}
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

  const batch: Game[] = [];
  console.log({ activePage });
  for (const game of props.data.games) {
    if (game.id.substring(0, 1).includes("A")) {
      // Game is important.
      // Show it solo.
      pages.push(
        <OneGamePage
          key={game.id}
          pageNumber={pages.length}
          game={game}
          settings={props.data.settings}
          className={activePage > pages.length ? "turned" : ""}
          onClick={pageClickHandler}
        />,
      );

      continue;
    }

    // Add the game to the batch.
    batch.push(game);
    if (
      props.data.settings.pageSize === "A4" && (
        batch.length === 6 ||
        game.id === props.data.games[props.data.games.length - 1].id
      )
    ) {
      // Batch is full, make a page.
      pages.push(
        <SixGamePage
          key={batch.map((game) => game.id).join("-")}
          pageNumber={pages.length}
          games={[...batch]}
          settings={props.data.settings}
          className={activePage > pages.length ? "turned" : ""}
          onClick={pageClickHandler}
        />,
      );

      batch.length = 0;
      continue;
    }

    if (
      false && (
        batch.length === 3 ||
        game.id === props.data.games[props.data.games.length - 1].id
      )
    ) {
      // Batch is full, make a page.
      pages.push(
        <ThreeGamePage
          key={batch.map((game) => game.id).join("-")}
          pageNumber={pages.length}
          games={[...batch]}
          settings={props.data.settings}
          className={activePage > pages.length ? "turned" : ""}
          onClick={pageClickHandler}
        />,
      );

      batch.length = 0;
      continue;
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
        {props.data.user.username}. It includes, wins and losses and everything
        in-between.
        <br />
        <br />
        You can make your own at{" "}
        <a href="https://MeChessBook.com">MeChessBook.com</a>.
      </p>
    </CoverPage>,
  );

  return (
    <div
      className={`print:w-auto mx-auto book-container simulate print:block print:mx-0 ${
        props.data.settings.pageSize === "A4"
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
          }
        `}
        </style>
      </Head>
    </div>
  );
}
