import treeImg from "../../../../assets/images/tree.png";
import birdsImg from "../../../../assets/images/birds.png";

export function BirdTreeTarget({
  treeRef,
  isOverTarget,
  isAiming,
  hasHitBird,
  onStartDrag,
  onPointerMove,
  onPointerUp,
  onDirectShoot,
}) {
  return (
    <div
      ref={treeRef}
      className={`realistic-tree ${isOverTarget ? "realistic-tree--aiming" : ""}`}
      onPointerDown={(event) => onStartDrag(event, true)}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onClick={onDirectShoot}
      role="button"
      tabIndex={0}
      aria-label="Pohon burung - bidik burung di pohon"
      title="Arahkan bidikan ke sini untuk menembak burung (2 detik)"
    >
      <div className="realistic-tree__stage">
        <img className="tree-image" src={treeImg} alt="" aria-hidden="true" />
        <img
          className="tree-birds-flock"
          src={birdsImg}
          alt=""
          aria-hidden="true"
        />
        {isOverTarget && isAiming && (
          <span className="aim-crosshair-anim">💥 Dor!</span>
        )}
      </div>
      <span className="realistic-tree__label">🌳 Pohon Burung</span>
      <small className="realistic-tree__hint">
        {isAiming
          ? "Membidik (2 detik)... 💥"
          : hasHitBird
            ? "Burung kena! Geser ke sangkar ➡️"
            : "Arahkan bidikan ke sini"}
      </small>
    </div>
  );
}
