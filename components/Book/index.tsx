import { ReactNode } from "react";
import type { Game, Settings, User } from "../../types";
import OneGamePage from "./OneGamePage";
import ThreeGamePage from "./ThreeGamePage";
import BlankPage from "./BlankPage";
import Page from "./page";

export default function Book(
  props: { data: { user: User; games: Game[]; settings: Settings } },
) {
  props.data.settings.pageSize = "A4";

  const pages: ReactNode[] = [];

  // Imprint
  pages.push(
    <Page settings={props.data.settings} key="cover-backside">
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
    </Page>,
  );

  const batch: Game[] = [];
  for (const game of props.data.games) {
    if (game.id.substring(0, 1).includes("A") && false) {
      // Game is important.
      // Show it solo.
      pages.push(
        <OneGamePage
          pageNumber={pages.length + 1}
          key={game.id}
          game={game}
          settings={props.data.settings}
        />,
      );

      continue;
    }

    // Add the game to the batch.
    batch.push(game);
    if (
      batch.length === 3 ||
      game.id === props.data.games[props.data.games.length - 1].id
    ) {
      // Batch is full, make a page.
      pages.push(
        <ThreeGamePage
          pageNumber={pages.length + 1}
          key={batch.map((game) => game.id).join("-")}
          games={[...batch]}
          settings={props.data.settings}
        />,
      );

      batch.length = 0;
      continue;
    }
  }

  return (
    <div
      className={`print:w-auto mx-auto book-container print:block print:mx-0 ${
        props.data.settings.pageSize === "A4"
          ? "w-a4 2xl:grid 2xl:grid-cols-2 2xl:w-a2"
          : "w-a5 xl:grid xl:grid-cols-2 xl:w-a3"
      }`}
    >
      {pages}

      <style global>
        {`
          @page {
            size: ${props.data.settings.pageSize} portrait;
            margin: 0;
          }
        `}
      </style>
    </div>
  );
}
