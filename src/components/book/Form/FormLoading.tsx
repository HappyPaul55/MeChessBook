export default function FormLoading(
  props: { username: string; linesProcessed?: number },
) {
  return (
    <div className="text-center">
      <div className="spinner mx-auto my-8" />
      <p>
        Fetching data for &quot;<strong>{props.username}</strong>&quot;
      </p>
      {props.linesProcessed !== undefined && (
        <small className="mt-1 block text-muted">
          Processed {props.linesProcessed} games
        </small>
      )}
    </div>
  );
}
