export default function FormLoading(
  props: { username: string; linesProcessed?: number },
) {
  return (
    <div className="text-white text-center text-lg">
      <div className="w-48 h-48 border-8 border-white my-12 mx-auto border-t-transparent rounded-full animate-spin" />
      Fetching data for &quot;<strong>{props.username}</strong>&quot;<br />
      {props.linesProcessed !== undefined && (
        <small>Processed {props.linesProcessed} games</small>
      )}
    </div>
  );
}
