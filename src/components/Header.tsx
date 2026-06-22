import GooseMark from './GooseMark';

export default function Header() {
  return (
    <div className="top">
      <div className="brand">
        <GooseMark width={42} height={19} color="#2b2620" />
        <b>STRANGE&nbsp;GOOSE</b>
        <span className="pill">Thumbnail template · A</span>
      </div>
      <div className="hint">Drop a film still · set the title · export 1280×720</div>
    </div>
  );
}
