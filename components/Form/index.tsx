import { useEffect, useState } from "react";
import type { Game as LichessGame, User as LichessUser } from "../../lichess";
import type { Settings, User, Game } from "../../types";
import FormLoading from "./FormLoading";
import FormSettings from "./FormSettings";
import FormUsername from "./FormUsername";
import processGame from "../../lichess";

export default function Form(
  props: {
    setData: (data: { user: User; games: Game[]; settings: Settings }) => void;
  },
) {
  const setData = props.setData;
  const [error, setError] = useState<undefined | "username">(undefined);
  const [username, setUsername] = useState<string | undefined>(undefined);
  const [user, setUser] = useState<LichessUser | undefined>(undefined);
  const [settings, setSettings] = useState<Settings>();
  const [linesProcessed, setLinesProcessed] = useState(0);

  // Handle a username been set.
  useEffect(() => {
    if (!username || error === "username") {
      return;
    }

    const controller = new AbortController();
    async function getData(username: string) {
      const response = await fetch(
        `https://lichess.org/api/user/${username}`,
        {
          signal: controller.signal,
        },
      );

      try {
        if (!response.ok) {
          throw new Error("Invalid username");
        }
        const data = await response.json() as LichessUser;
        setUser(data);
      } catch (e) {
        setError("username");
      }
    }

    getData(username);

    return () => controller.abort();
  }, [error, username]);

  // Handle Settings been completed.
  useEffect(() => {
    if (!settings || !user || !username) {
      return;
    }

    const controller = new AbortController();
    async function getData(
      settings: Settings,
      user: LichessUser,
      username: string,
    ) {
      const filters: string[] = [
        "withBookmarked=true",
        "pgnInJson=true",
        "evals=true",
      ];
      if (settings.color !== "all") {
        filters.push(`color=${settings.color}`);
      }
      if (settings.rated !== "all") {
        filters.push(`rated=${settings.rated === "rated" ? "true" : "false"}`);
      }
      if (settings.gameType !== undefined && settings.gameType !== "all") {
        filters.push(`perfType=${settings.gameType}`);
      } else {
        filters.push("perfType=ultraBullet,bullet,blitz,rapid,classical,correspondence");
      }
      if (settings.analysed !== "all") {
        filters.push(`analysed=${settings.analysed === 'only' ? 'true' : 'false'}`);
      }

      if (settings.dateRange === "last-month") {
        const since = new Date();
        since.setMonth(since.getMonth() - 1);
        filters.push(`since=${since.getTime()}`);
      } else if (settings.dateRange === "last-year") {
        const since = new Date();
        since.setFullYear(since.getFullYear() - 1);
        filters.push(`since=${since.getTime()}`);
      }
      // No filter for `result` as that's no in the API and has to be done client side.

      const response = await fetch(
        `https://lichess.org/api/games/user/${username}?${filters.join("&")}`,
        {
          headers: {
            accept: "application/x-ndjson",
          },
          signal: controller.signal,
        },
      );
      const reader = response.body!.getReader();
      const games: Game[] = [];
      while (true) {
        const { done, value } = await reader.read();
        if (done) {
          setData({ user: { name: user.username, rating: 1500, ratingProvisional: true }, games, settings });
          break;
        }
        const decoder = new TextDecoder("utf-8");
        const chunk = decoder.decode(value, { stream: true });
        if (!chunk) {
          continue;
        }
        const lines = chunk.split("\n");
        for (const line of lines) {
          if (!line) {
            continue;
          }
          try {
            const data = JSON.parse(line) as LichessGame;
            const result = await processGame(data, user.username, settings);
            if (result) {
              // Game will only be added if it's interesting.
              games.push(result);
            }
          } catch (e) {
            console.warn(e);
            console.warn(line);
          }
          setLinesProcessed((s) => s + 1);
        }
      };
    }

    getData(settings, user, username);

    return () => controller.abort();
  }, [setData, user, settings, username]);

  if (!username || error === "username") {
    return (
      <FormUsername
        error={error !== undefined}
        setUsername={(username) => {
          setError(undefined);
          setUsername(username);
        }}
      />
    );
  }

  if (!user) {
    return <FormLoading username={username} />;
  }

  if (!settings) {
    return <FormSettings user={user} setSettings={setSettings} />;
  }

  return <FormLoading username={username} linesProcessed={linesProcessed} />;
}
