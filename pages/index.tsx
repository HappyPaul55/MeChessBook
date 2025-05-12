import { useState } from "react";
import Form from "../components/Form";
import Book from "../components/Book";
import type { Game, Settings, User } from "../types";
import Head from "next/head";

export default function HomePage() {
  const [data, setData] = useState<
    { user: User; games: Game[]; settings: Settings }
  >();

  if (data === undefined) {
    return (
      <div className="relative min-h-screen flex items-center justify-center bg-gradient-to-br from-pink-500 via-purple-500 to-indigo-500 overflow-hidden animate-gradient">
        <div className="relative z-10 p-10 bg-white/20 backdrop-blur-md rounded-2xl shadow-2xl border border-white/20 w-full max-w-md">
          <Form setData={setData} />
        </div>

        <Head>
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

  return <Book data={data} />;
}
