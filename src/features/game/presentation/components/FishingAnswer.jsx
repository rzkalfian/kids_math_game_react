import { useEffect, useRef, useState } from "react";
import { Check, Trash2 } from "lucide-react";
import pancingImg from "../../../../assets/images/pancing.png";
import { TIMINGS } from "../../constants.js";

export function FishingAnswer({
  value,
  onChange,
  onSubmit,
  onFishStart,
  onGetFish,
}) {
  const fishCount = Math.max(0, value);
  const pondSourceRef = useRef(null);
  const answerBoxRef = useRef(null);
  const fishTimerRef = useRef(null);

  const [dragPosition, setDragPosition] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isWaitingFish, setIsWaitingFish] = useState(false);
  const [hasHookedFish, setHasHookedFish] = useState(false);
  const [isOverPond, setIsOverPond] = useState(false);
  const [isOverAnswer, setIsOverAnswer] = useState(false);

  useEffect(() => {
    return () => {
      if (fishTimerRef.current) clearTimeout(fishTimerRef.current);
    };
  }, []);

  function changeFishCount(nextCount) {
    onChange(Math.max(0, nextCount));
  }

  function triggerFishCatchTimer() {
    setIsWaitingFish(true);
    setHasHookedFish(false);
    if (onFishStart) onFishStart();

    if (fishTimerRef.current) clearTimeout(fishTimerRef.current);
    fishTimerRef.current = setTimeout(() => {
      setHasHookedFish(true);
      setIsWaitingFish(false);
      if (onGetFish) onGetFish();
    }, TIMINGS.DRAG_ACTION_MS);
  }

  function handleStartDrag(event, startFromPond = false) {
    event.currentTarget.setPointerCapture(event.pointerId);
    setIsDragging(true);
    setDragPosition({ x: event.clientX, y: event.clientY });

    if (startFromPond) {
      triggerFishCatchTimer();
    } else {
      setHasHookedFish(false);
      setIsWaitingFish(false);
    }
  }

  function handlePointerMove(event) {
    if (!isDragging) return;
    const x = event.clientX;
    const y = event.clientY;
    setDragPosition({ x, y });

    // Cek apakah kail berada di atas Kolam Ikan
    const pondBounds = pondSourceRef.current?.getBoundingClientRect();
    const overPond = Boolean(
      pondBounds &&
        x >= pondBounds.left &&
        x <= pondBounds.right &&
        y >= pondBounds.top &&
        y <= pondBounds.bottom,
    );
    setIsOverPond(overPond);

    // Jika kail baru diarahkan ke kolam ikan dan belum dapat ikan serta belum sedang menunggu
    if (overPond && !hasHookedFish && !isWaitingFish) {
      triggerFishCatchTimer();
    } else if (!overPond && isWaitingFish && !hasHookedFish) {
      // Jika kursor keluar dari kolam ikan sebelum 2 detik selesai
      if (fishTimerRef.current) clearTimeout(fishTimerRef.current);
      setIsWaitingFish(false);
    }

    // Cek apakah kail menyentuh Kotak Jawaban
    const answerBounds = answerBoxRef.current?.getBoundingClientRect();
    const overAnswer = Boolean(
      answerBounds &&
        x >= answerBounds.left &&
        x <= answerBounds.right &&
        y >= answerBounds.top &&
        y <= answerBounds.bottom,
    );
    setIsOverAnswer(overAnswer);
  }

  function handlePointerUp(event) {
    if (!isDragging) return;
    if (fishTimerRef.current) clearTimeout(fishTimerRef.current);

    const answerBounds = answerBoxRef.current?.getBoundingClientRect();
    const isOver = Boolean(
      answerBounds &&
        event.clientX >= answerBounds.left &&
        event.clientX <= answerBounds.right &&
        event.clientY >= answerBounds.top &&
        event.clientY <= answerBounds.bottom,
    );

    // Hanya jika melepaskan di kotak jawaban & SUDAH dapat ikan (setelah 2 detik)
    if (isOver && hasHookedFish) {
      changeFishCount(fishCount + 1);
    }

    setDragPosition(null);
    setIsDragging(false);
    setIsWaitingFish(false);
    setHasHookedFish(false);
    setIsOverPond(false);
    setIsOverAnswer(false);
  }

  // Aksi interaktif klik langsung (ramah anak 3-4 tahun)
  function handlePondClick() {
    if (isWaitingFish) return;
    triggerFishCatchTimer();
    setTimeout(() => {
      changeFishCount(fishCount + 1);
      setHasHookedFish(false);
      setIsWaitingFish(false);
    }, TIMINGS.DRAG_ACTION_MS);
  }

  return (
    <div className="fishing-answer">
      {/* 1. Joran & Kail */}
      <div className="fishing-dock">
        <button
          type="button"
          className={`fishing-rod-control ${isDragging ? "fishing-rod-control--dragging" : ""}`}
          onPointerDown={(e) => handleStartDrag(e, false)}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerCancel={() => {
            if (fishTimerRef.current) clearTimeout(fishTimerRef.current);
            setDragPosition(null);
            setIsDragging(false);
            setIsWaitingFish(false);
            setHasHookedFish(false);
            setIsOverPond(false);
            setIsOverAnswer(false);
          }}
          title="Tarik kail ke kolam ikan lalu tunggu 2 detik untuk dapat ikan"
          aria-label="Tarik kail ke kolam ikan lalu tunggu 2 detik untuk dapat ikan"
        >
          <div className="rod-preview">
            <img
              src={pancingImg}
              alt="Joran pancing lengkap dengan kail"
              className="rod-image"
              draggable="false"
            />
            {!isDragging && (
              <span className="hook-marker" aria-hidden="true">
                🪝
              </span>
            )}
          </div>
          <span className="rod-hint">Joran Pancing</span>
        </button>
      </div>

      {/* 2. Kolam Ikan (Sumber Ikan) */}
      <div
        ref={pondSourceRef}
        className={`fishing-source-pond ${isOverPond ? "fishing-source-pond--active" : ""} ${isWaitingFish ? "fishing-source-pond--waiting" : ""}`}
        onPointerDown={(e) => handleStartDrag(e, true)}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onClick={handlePondClick}
        role="button"
        tabIndex={0}
        aria-label="Kolam ikan - sentuh untuk memancing ikan"
        title="Arahkan kail ke sini, tunggu 2 detik untuk dapat ikan"
      >
        <span className="source-pond__label">🐟 Kolam Ikan</span>
        <div className="source-pond__water" aria-hidden="true">
          <span className="swimming-fish swimming-fish--1">🐟</span>
          <span className="swimming-fish swimming-fish--2">🐠</span>
          <span className="swimming-fish swimming-fish--3">🐟</span>
        </div>
        <small className="source-pond__hint">
          {isWaitingFish
            ? "Menunggu ikan... ⏳"
            : hasHookedFish
              ? "Ikan dapat! Geser ke jawaban ➡️"
              : "Kaitkan kail di sini (2s)"}
        </small>
      </div>

      {/* 3. Kotak Jawaban (Tempat Ikan Hasil Pancingan) */}
      <div
        ref={answerBoxRef}
        className={`fishing-answer-box ${isOverAnswer ? "fishing-answer-box--highlight" : ""}`}
        aria-label={`Jawaban ${value}, berisi ${fishCount} ikan`}
      >
        <span className="fishing-answer-box__label">🎯 Jawaban</span>
        <div className="fishing-answer-box__fishes" aria-hidden="true">
          {Array.from({ length: fishCount }, (_, index) => (
            <span key={index} className="pond-fish">
              🐟
            </span>
          ))}
          {fishCount === 0 && (
            <span className="fishing-answer-box__empty-hint">
              Taruh ikan pancingan di sini...
            </span>
          )}
        </div>
        <output>{value}</output>
      </div>

      {/* 4. Set Joran & Kail yang Mengikuti Gerakan Kursor/Jari */}
      {isDragging && dragPosition && (
        <div
          className="dragging-rod-set"
          style={{ left: dragPosition.x, top: dragPosition.y }}
          aria-hidden="true"
        >
          <img
            src={pancingImg}
            alt=""
            className="dragging-rod-image"
            draggable="false"
          />
          {hasHookedFish ? (
            <>
              <span className="dragging-hooked-fish">🐟</span>
              <span className="hook-status-badge">Ikan Dapat! 🐟</span>
            </>
          ) : isWaitingFish ? (
            <>
              <span className="dragging-empty-hook hook-wobble">🪝</span>
              <span className="hook-status-badge hook-status-badge--waiting">
                Menunggu Umpan... ⏳
              </span>
            </>
          ) : (
            <span className="dragging-empty-hook">🪝</span>
          )}
          {isOverAnswer && hasHookedFish && (
            <span className="splash-bubble">✨ Lepaskan di sini!</span>
          )}
        </div>
      )}

      {/* 5. Tombol Aksi */}
      <div className="fishing-answer__actions">
        <button
          type="button"
          disabled={fishCount === 0}
          onClick={() => changeFishCount(fishCount - 1)}
          title="Lepaskan satu ikan"
          aria-label="Lepaskan satu ikan"
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
