import { useState } from "react";

export default function FormUsername(
  props: { error: boolean; setUsername: (username: string) => void },
) {
  const [username, setUsername] = useState("");

  return (
    <>
      <h1 className="text-3xl font-bold text-white mb-6 text-center drop-shadow-md">
        Me Chess Book
      </h1>
      <form
        className="flex flex-col gap-4"
        onSubmit={(e) => {
          e.preventDefault();
          props.setUsername(username);
        }}
      >
        {props.error && (
          <div className="bg-red-600 text-white px-4 py-3 text-sm rounded-lg">
            Username not valid. Please try another one...
          </div>
        )}
        <input
          type="text"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          placeholder="Lichess Username"
          className="px-4 py-3 rounded-lg bg-white placeholder-black/30 text-black border border-white/30 focus:outline-none focus:ring-2 focus:ring-white/50 backdrop-blur-md"
        />
        <button
          type="submit"
          className="mt-4 py-3 rounded-lg bg-white text-purple-600 font-semibold hover:bg-purple-100 transition duration-300 cursor-pointer"
        >
          Let&apos;s Go...
        </button>
      </form>
    </>
  );
}
