import { useRef, useState } from "react";
import { Check, Trash2 } from "lucide-react";

export function SpaceExplorerAnswer({
  value,
  onChange,
  onSubmit,
  onAddAstronaut,
}) {
  const astronautCount = Math.max(0, value);
  const rocketRef = useRef(null);
  const [dragPosition, setDragPosition] = useState(null);
  const [isOverRocket, setIsOverRocket] = useState(false);

  function changeAstronautCount(nextCount) {
    onChange(Math.max(0, nextCount));
  }

  function handlePointerDown(event) {
    event.currentTarget.setPointerCapture(event.pointerId);
    setDragPosition({ x: event.clientX, y: event.clientY });
  }

  function handlePointerMove(event) {
    if (!dragPosition) return;
    const x = event.clientX;
    const y = event.clientY;
    setDragPosition({ x, y });

    const rocketBounds = rocketRef.current?.getBoundingClientRect();
    const overRocket = Boolean(
      rocketBounds &&
        x >= rocketBounds.left &&
        x <= rocketBounds.right &&
        y >= rocketBounds.top &&
        y <= rocketBounds.bottom,
    );
    setIsOverRocket(overRocket);
  }

  function finishDrag(event) {
    if (!dragPosition) return;

    const rocketBounds = rocketRef.current?.getBoundingClientRect();
    const isOver = Boolean(
      rocketBounds &&
        event.clientX >= rocketBounds.left &&
        event.clientX <= rocketBounds.right &&
        event.clientY >= rocketBounds.top &&
        event.clientY <= rocketBounds.bottom,
    );

    setDragPosition(null);
    setIsOverRocket(false);

    // Hanya menambah jika benar-benar di-drop ke dalam kabin roket
    if (isOver) {
      if (onAddAstronaut) onAddAstronaut();
      changeAstronautCount(astronautCount + 1);
    }
  }

  return (
    <div className="space-answer">
      {/* 1. Stasiun Luar Angkasa / Sumber Astronot (Pure Drag & Drop) */}
      <div className="astronaut-source">
        <span className="source-title">👨‍🚀 Astronot</span>
        <div
          className="draggable-astronaut-slot"
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={finishDrag}
          onPointerCancel={() => {
            setDragPosition(null);
            setIsOverRocket(false);
          }}
          role="button"
          tabIndex={0}
          aria-label="Seret astronot ke dalam roket"
          title="Seret astronot ini ke kabin roket"
        >
          <div className="astronaut-suit-bubble">
            <span className="source-astronaut-icon" aria-hidden="true">
              👨‍🚀
            </span>
          </div>
          <small className="drag-helper-text">Seret ke roket ➡️</small>
        </div>
      </div>

      {/* 2. Kotak Jawaban: Roket Realistis Horizontal */}
      <div
        ref={rocketRef}
        className={`realistic-horizontal-rocket ${isOverRocket ? "realistic-horizontal-rocket--target" : ""}`}
        aria-label={`Jawaban ${value}, kabin roket berisi ${astronautCount} astronot`}
      >
        {/* Moncong Roket Kiri */}
        <div className="rocket-nose-left" aria-hidden="true">
          <div className="rocket-nose-tip" />
          <div className="rocket-stripe rocket-stripe--front" />
        </div>

        {/* Badan & Kabin Roket Utama */}
        <div className="rocket-body-main">
          <div className="rocket-header-strip">
            <span className="rocket-ship-name">🚀 APOLLO-LAB</span>
            <span className="rocket-cabin-title">KABIN PENUMPANG</span>
          </div>

          <div className="rocket-passengers-grid" aria-hidden="true">
            {Array.from({ length: astronautCount }, (_, index) => (
              <span key={index} className="rocket-astronaut">
                👨‍🚀
              </span>
            ))}
            {astronautCount === 0 && (
              <span className="rocket-empty-hint">
                {isOverRocket ? "✨ Lepaskan di sini!" : "Tarik astronot ke dalam kabin roket..."}
              </span>
            )}
          </div>
        </div>

        {/* Ekor, Sayap & Pendorong Roket Kanan */}
        <div className="rocket-engine-right" aria-hidden="true">
          <div className="rocket-fin rocket-fin--top" />
          <div className="rocket-nozzle" />
          <div className="rocket-fin rocket-fin--bottom" />
          <div className="rocket-horizontal-flame">
            <span className="flame-layer flame-layer--outer">🔥</span>
            <span className="flame-layer flame-layer--core">⚡</span>
          </div>
        </div>

        <output>{value}</output>
      </div>

      {/* 3. Astronot Mengambang Saat Diseret */}
      {dragPosition && (
        <div
          className="dragging-astronaut"
          style={{ left: dragPosition.x, top: dragPosition.y }}
          aria-hidden="true"
        >
          <span className="dragging-astronaut-avatar">👨‍🚀</span>
          <span className="space-dust">✨</span>
          {isOverRocket && <span className="space-entry-badge">Masuk Roket! 🚀</span>}
        </div>
      )}

      {/* 4. Tombol Aksi */}
      <div className="space-answer__actions">
        <button
          type="button"
          disabled={astronautCount === 0}
          onClick={() => changeAstronautCount(astronautCount - 1)}
          title="Turunkan satu astronot"
          aria-label="Turunkan satu astronot"
        >
          <Trash2 />
        </button>
        <button className="primary-button" type="button" onClick={onSubmit}>
          <Check /> Luncurkan
        </button>
      </div>
    </div>
  );
}
