const highlightedStyle = "outline-2 bg-black text-white outline-black";

export default function MoveListTable(props: { moves: string[], highlightedPly: number, size: string, columns: string }) {
  const pairs: [string, string?][] = [];

  for (let i = 0; i < props.moves.length; i++) {
    const pairIndex = Math.floor(i / 2);
    if (!pairs[pairIndex]) {
      pairs[pairIndex] = [""];
    }
    pairs[pairIndex][i % 2] = props.moves[i];
  }

  return <div className={`${props.size} ${props.columns}`}>
    <table className="w-full">
      <tbody>
        {pairs.map((moves, i) => (
          <tr
            key={i}
          >
            <td className="text-gray-400 w-6 font-anton">
              {i + 1}
            </td>
            <td><span className={i * 2 == props.highlightedPly ? highlightedStyle : ''}>{moves[0]}</span></td>
            <td><span className={i * 2 + 1 === props.highlightedPly ? highlightedStyle : ''}>{moves[1]}</span></td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
}