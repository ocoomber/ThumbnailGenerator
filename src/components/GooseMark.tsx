// Shared goose-wing mark used by Header, ContextPreviews, and the logo on ThumbnailCanvas.
export default function GooseMark({
  width,
  height,
  color,
  strokeWidth = 7,
}: {
  width: number;
  height: number;
  color: string;
  strokeWidth?: number;
}) {
  return (
    <svg viewBox="0 0 100 46" width={width} height={height} aria-hidden="true">
      <path
        d="M4 40 Q30 8 50 26 Q70 8 96 40"
        fill="none"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
