import birdImg from "../../../../assets/images/bird.svg";

export function BirdCageBox({ cageRef, value, birdCount, isOverCage }) {
  return (
    <div
      ref={cageRef}
      className={`shooting-cage-box ${isOverCage ? "shooting-cage-box--highlight" : ""}`}
      aria-label={`Jawaban ${value}, sangkar berisi ${birdCount} burung`}
    >
      <span className="shooting-cage-box__label">🏠 Sangkar Jawaban</span>
      <div className="shooting-cage-box__birds" aria-hidden="true">
        {Array.from({ length: birdCount }, (_, index) => (
          <img key={index} className="bird-icon cage-bird" src={birdImg} alt="" />
        ))}
        {birdCount === 0 && (
          <span className="shooting-cage-box__empty-hint">
            Taruh burung hasil bidikan di sini...
          </span>
        )}
      </div>
      <output>{value}</output>
    </div>
  );
}
