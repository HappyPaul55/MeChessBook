import { Fragment } from "react";

const highlightedStyle = "outline-2 bg-black text-white outline-black";

export default function MoveListInline(props: { moves: string[], highlightedPly: number, size: string }) {
  const pairs: [string, string?][] = [];

  for (let i = 0; i < props.moves.length; i++) {
    const pairIndex = Math.floor(i / 2);
    if (!pairs[pairIndex]) {
      pairs[pairIndex] = [""];
    }
    pairs[pairIndex][i % 2] = props.moves[i];
  }

  return <div className={`${props.size} text-justify`}>
    {pairs.map((moves, i) => (
      <Fragment key={i}>
        <span className="whitespace-nowrap">
          <span className="text-gray-400 font-anton">{i + 1}</span>
          &nbsp;
          {i * 2 === props.highlightedPly ? <span className={highlightedStyle}>{moves[0]}</span> : moves[0]}
          &nbsp;
          {i * 2 + 1 === props.highlightedPly ? <span className={highlightedStyle}>{moves[1]}</span> : moves[1]}.
        </span>
        {" "}
      </Fragment>
    ))}
  </div>
}