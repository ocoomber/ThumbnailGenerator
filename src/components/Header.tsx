export default function Header() {
  return (
    <div className="top">
      <div className="brand">
        <svg viewBox="0 0 100 46" width="42" height="19" aria-hidden="true">
          <path
            d="M4 40 Q30 8 50 26 Q70 8 96 40"
            fill="none"
            stroke="#2b2620"
            strokeWidth="7"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
        <b>STRANGE&nbsp;GOOSE</b>
        <span className="pill">Thumbnail template · A</span>
      </div>
      <div className="hint">Drop a film still · set the title · export 1280×720</div>
    </div>
  );
}
