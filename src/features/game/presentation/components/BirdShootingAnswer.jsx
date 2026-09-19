import { Check, Crosshair, Target, Trash2 } from "lucide-react";
import birdImg from "../../../../assets/images/bird.svg";
import { useBirdShooting } from "../useBirdShooting.js";
import { BirdTreeTarget } from "./BirdTreeTarget.jsx";
import { BirdCageBox } from "./BirdCageBox.jsx";

export function BirdShootingAnswer({
  value,
  onChange,
  onSubmit,
  onShootGun,
  onStopShootGun,
  onHitBird,
}) {
  const shooting = useBirdShooting({
    value,
    onChange,
    onShootGun,
    onStopShootGun,
    onHitBird,
  });
  const {
    birdCount,
    dragPosition,
    isDragging,
    isAiming,
    hasHitBird,
    isOverCage,
    handleStartDrag,
    handlePointerMove,
    handlePointerUp,
    handlePointerCancel,
  } = shooting;

  return (
    <div className="shooting-answer">
      {/* 1. Ketapel / Alat Bidik */}
      <div className="shooting-dock">
        <button
          type="button"
          className={`slingshot-control ${isDragging ? "slingshot-control--dragging" : ""}`}
          onPointerDown={(event) => handleStartDrag(event, false)}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerCancel}
          title="Tarik bidikan ke pohon burung, tunggu 2 detik tembakan untuk dapat burung"
          aria-label="Tarik bidikan ke pohon burung, tunggu 2 detik tembakan untuk dapat burung"
        >
          <div className="slingshot-preview">
            <div className="slingshot-graphic" aria-hidden="true">
              <span className="slingshot-emoji">🎯</span>
            </div>
            {!isDragging && (
              <span className="crosshair-marker" aria-hidden="true">
                <Crosshair />
              </span>
            )}
          </div>
          <span className="slingshot-hint">Ketapel Bidik</span>
        </button>
      </div>

      {/* 2. Pohon sasaran */}
      <BirdTreeTarget
        treeRef={shooting.treeRef}
        isOverTarget={shooting.isOverTarget}
        isAiming={isAiming}
        hasHitBird={hasHitBird}
        onStartDrag={handleStartDrag}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onDirectShoot={shooting.handleDirectShoot}
      />

      {/* 3. Kotak Jawaban: Sangkar Burung */}
      <BirdCageBox
        cageRef={shooting.cageRef}
        value={value}
        birdCount={birdCount}
        isOverCage={isOverCage}
      />

      {/* 4. Set Bidikan / Burung yang Melayang Mengikuti Gerakan Kursor/Jari */}
      {isDragging && dragPosition && (
        <div
          className="dragging-slingshot-set"
          style={{ left: dragPosition.x, top: dragPosition.y }}
          aria-hidden="true"
        >
          {hasHitBird ? (
            <>
              <img className="dragging-flying-bird" src={birdImg} alt="" />
              <span className="hit-status-badge">Burung Didapat!</span>
            </>
          ) : isAiming ? (
            <div className="dragging-aiming-flash">
              <span className="flash-effect">💥</span>
              <span className="aiming-badge">Menembak...</span>
            </div>
          ) : (
            <span className="dragging-crosshair">
              <Target />
            </span>
          )}
          {isOverCage && hasHitBird && (
            <span className="splash-bubble">✨ Masuk Sangkar!</span>
          )}
        </div>
      )}

      {/* 5. Tombol Aksi */}
      <div className="shooting-answer__actions">
        <button
          type="button"
          disabled={birdCount === 0}
          onClick={() => shooting.changeBirdCount(birdCount - 1)}
          title="Lepaskan satu burung"
          aria-label="Lepaskan satu burung"
        >
          <Trash2 />
        </button>
        <button className="primary-button" type="button" onClick={onSubmit}>
          <Check /> Periksa
        </button>
      </div>
    </div>
  );
}
