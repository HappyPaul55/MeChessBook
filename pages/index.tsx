import { useState } from "react";
import Form from "../components/Form";
import Book from "../components/Book";
import type { Game, Settings, User } from "../types";
import Head from "next/head";
import useTranslation from "next-translate/useTranslation";

export default function HomePage() {
  const [data, setData] = useState<
    { user: User; games: Game[]; settings: Settings }
  >();
  const { t } = useTranslation("common");

  if (data === undefined) {
    return (
      <div className="relative min-h-screen flex items-center justify-center bg-gradient-to-br from-pink-500 via-purple-500 to-indigo-500 overflow-hidden animate-gradient">
        <div className="relative z-10 p-10 bg-white/20 backdrop-blur-md rounded-2xl shadow-2xl border border-white/20 w-full max-w-md">
          <Form setData={setData} />
        </div>

        <Head>
          <title>Me Chess Book</title>
          <style>
            {`
              @keyframes gradient {
                0% {
                  background-position: 0% 50%;
                }
                50% {
                  background-position: 100% 50%;
                }
                100% {
                  background-position: 0% 50%;
                }
              }

              .animate-gradient {
                background-size: 400% 400%;
                animation: gradient 15s ease infinite;
              }
            `}
          </style>
        </Head>
      </div>
    );
  }

  return <>
    <Head>
      <title>Me Chess Book</title>
    </Head>
    <div className="text-center print:hidden">
      <button
        className="my-4 mx-2 p-3 rounded-lg bg-white text-purple-600 font-semibold hover:bg-purple-100 transition duration-300 cursor-pointer"
        onClick={(e) => {
          e.preventDefault();
          setData(undefined);
        }}
      >
        {t('button.reset')}
      </button>
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
    <Book data={data} />
  </>;
}
