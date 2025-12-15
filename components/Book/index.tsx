import { ReactNode, useCallback, useId, useState } from "react";
import type { Game, Settings, User } from "../../types";
import OneGamePage from "./OneGamePage";
import ThreeGamePage from "./ThreeGamePage";
import Page from "./Page";
import Head from "next/head";
import ContentPage from "./ContentPage";
import CoverPage from "./CoverPage";
import SixGamePage from "./SixGamePage";
import stringToSemiRandomNumber from "../../utils/stringToNumber";
import convertGamesToPages from "../../utils/convertGamesToPages";

export default function Book(
  props: { data: { user: User; games: Game[]; settings: Settings } },
) {
  const [activePage, setActivePage] = useState<number>(0);
  const cover = stringToSemiRandomNumber(useId(), 1, 9);

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

  // Stat Page.
  pages.push(
    <ContentPage
      key="stat-page"
      settings={props.data.settings}
      className={activePage > pages.length ? "turned" : ""}
      onClick={pageClickHandler}
      pageNumber={pages.length}
    >
      <div
        className="pt-30 text-center text-2xl"
        style={{ zoom: props.data.settings.pageSize === "A5" ? 1 : 1.5 }}
      >
        <h1 className="font-[Anton] text-4xl pb-12">Stats</h1>
        <table className="mx-auto text-left">
          <tbody>
            <tr>
              <th className="p-2 font-normal text-right">Games:</th>
              <td className="font-[Anton]">{props.data.games.length.toLocaleString()}</td>
            </tr>
            <tr>
              <th className="p-2 font-normal text-right">Players:</th>
              <td className="font-[Anton]">
                {Array.from(new Set(props.data.games.flatMap(game => [game.white.name, game.black.name]))).length.toLocaleString()}
              </td>
            </tr>
          </tbody>
        </table>

        <div className="flex flex-col items-center justify-center mt-16 space-y-4">
          <div className="flex items-center justify-center space-x-6">
            <h2 className="font-[Anton] text-4xl">The best game</h2>
            <span
              className="text-[6rem] font-black leading-none"
              aria-label="arrow right"
            >
              ➠
            </span>
          </div>
          <p className="text-sm italic opacity-80">
            Based on the highest ELO of both players combined.
          </p>
        </div>
      </div>
    </ContentPage>,
  );

  const gamePages = convertGamesToPages(props.data.settings, props.data.games);
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

  // Notes
  for (let i = 0; i < 2; i++) {
    pages.push(
      <ContentPage
        key="notes"
        pageNumber={pages.length}
        settings={props.data.settings}
        className={activePage > pages.length ? "turned" : ""}
        onClick={pageClickHandler}
      >
        <div className="px-20 m-auto text-center font-[Anton] text-4xl">
          Notes
        </div>
      </ContentPage>,
    );
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

  // Back cover.
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

  // Spine
  // pages.push(
  //   <CoverPage
  //     key="spine"
  //     settings={props.data.settings}
  //     className={activePage > pages.length ? "turned" : ""}
  //     onClick={pageClickHandler}
  //     pageNumber={-pages.length}
  //   >
  //     <div>
  //       <div
  //         className="absolute inset-0 bg-cover bg-middle z-0"
  //         style={{
  //           backgroundImage: `url(/covers/${cover}.jpg)`,
  //         }}
  //       />

  //       <div className="absolute inset-0 z-5 pointer-events-none shadow-[inset_0_0_40px_20px_rgba(0,0,0,0.3)]" />

  //       <h1
  //         className="absolute top-1/2 -mt-7 left-0 right-10 z-10 text-center text-4xl font-bold text-white font-[Anton] tracking-[0.075em] text-shadow-lg text-shadow-black"
  //         style={{ zoom: props.data.settings.pageSize === "A5" ? 1 : 1.5 }}
  //       >
  //         <div className="text-6xl">The {props.data.user.name} Chess Book</div>
  //       </h1>
  //       <div className="font-[Anton] text-shadow-lg text-shadow-black text-6xl text-white absolute right-10 pr-0 top-1/2 -translate-y-1/2 text-8xl -rotate-90 origin-center pr-[12px]">
  //         ♞
  //       </div>
  //     </div>
  //   </CoverPage>,
  // );

  console.log({ allPages: pages.length });

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
