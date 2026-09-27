import { useState } from "react";
import Form from "./Form";
import Book from "./Book";
import type { Game, Settings, User } from "../../lib/types";
import { t } from "../../lib/i18n";
import { buttonClass } from "../../lib/button";

interface Props {
  siteUrl: string;
}

/**
 * React island root for /make.
 *
 * Until a username and settings are chosen it shows the setup panel; after
 * that it renders the book and the print/reset controls. The book itself is
 * untouched from the original build — only this shell is new.
 */
export default function BookApp({ siteUrl }: Props) {
  const [data, setData] = useState<
    { user: User; games: Game[]; settings: Settings } | undefined
  >();

  if (data === undefined) {
    return (
      <div className="mx-auto w-full max-w-md">
        <div className="panel">
          <Form setData={setData} />
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="no-print mx-auto mb-6 max-w-md text-center">
        <div className="flex flex-wrap items-center justify-center gap-3">
          <button
            type="button"
            className={buttonClass("outline")}
            onClick={(e) => {
              e.preventDefault();
              setData(undefined);
            }}
          >
            {t("button.reset")}
          </button>
          <button
            type="button"
            className={buttonClass("primary")}
            onClick={(e) => {
              e.preventDefault();
              window.print();
            }}
          >
            {t("button.print")}
          </button>
        </div>
        <p className="mt-3 font-mono text-[0.7rem] font-bold uppercase tracking-[0.08em] text-muted">
          Print at {data.settings.pageSize} · margins none · background graphics
          on
        </p>
      </div>
      <Book data={data} siteUrl={siteUrl} />
    </>
  );
}
