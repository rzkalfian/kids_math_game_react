import { useEffect, useRef, useState } from "react";
import { Check, Crosshair, Target, Trash2 } from "lucide-react";

export function BirdShootingAnswer({
  value,
  onChange,
  onSubmit,
  onShootGun,
  onStopShootGun,
  onHitBird,
}) {
  const birdCount = Math.max(0, value);
  const targetAreaRef = useRef(null);
  const cageBoxRef = useRef(null);
  const shootTimerRef = useRef(null);

  const [dragPosition, setDragPosition] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isAiming, setIsAiming] = useState(false);
  const [hasHitBird, setHasHitBird] = useState(false);
  const [isOverTarget, setIsOverTarget] = useState(false);
  const [isOverCage, setIsOverCage] = useState(false);

  useEffect(() => {
    return () => {
      if (shootTimerRef.current) clearTimeout(shootTimerRef.current);
    };
  }, []);

  function changeBirdCount(nextCount) {
    onChange(Math.max(0, nextCount));
  }

  function triggerShoot() {
    setIsAiming(true);
    setHasHitBird(false);
    if (onShootGun) {
      onShootGun(() => {
        setHasHitBird(true);
        setIsAiming(false);
        if (onHitBird) onHitBird();
      }, 2000);
    } else {
      if (shootTimerRef.current) clearTimeout(shootTimerRef.current);
      shootTimerRef.current = setTimeout(() => {
        setHasHitBird(true);
        setIsAiming(false);
        if (onHitBird) onHitBird();
      }, 2000);
    }
  }

  function cancelAiming() {
    setIsAiming(false);
    if (shootTimerRef.current) clearTimeout(shootTimerRef.current);
    if (onStopShootGun) onStopShootGun();
  }

  function handleStartDrag(event, startWithBird = false) {
    event.currentTarget.setPointerCapture(event.pointerId);
    setIsDragging(true);
    setDragPosition({ x: event.clientX, y: event.clientY });

    if (startWithBird) {
      triggerShoot();
    } else {
      setHasHitBird(false);
      setIsAiming(false);
    }
  }

  function handlePointerMove(event) {
    if (!isDragging) return;
    const x = event.clientX;
    const y = event.clientY;
    setDragPosition({ x, y });

    // Cek apakah bidikan berada di atas Pohon Burung
    const targetBounds = targetAreaRef.current?.getBoundingClientRect();
    const overTarget = Boolean(
      targetBounds &&
        x >= targetBounds.left &&
        x <= targetBounds.right &&
        y >= targetBounds.top &&
        y <= targetBounds.bottom,
    );
    setIsOverTarget(overTarget);

    // Ketika mulai membidik pohon dan belum dapat burung serta belum sedang menembak
    if (overTarget && !hasHitBird && !isAiming) {
      triggerShoot();
    } else if (!overTarget && isAiming && !hasHitBird) {
      cancelAiming();
    }

    // Cek apakah mengenai Sangkar Jawaban
    const cageBounds = cageBoxRef.current?.getBoundingClientRect();
    const overCage = Boolean(
      cageBounds &&
        x >= cageBounds.left &&
        x <= cageBounds.right &&
        y >= cageBounds.top &&
        y <= cageBounds.bottom,
    );
    setIsOverCage(overCage);
  }

  function handlePointerUp(event) {
    if (!isDragging) return;
    if (shootTimerRef.current) clearTimeout(shootTimerRef.current);

    const cageBounds = cageBoxRef.current?.getBoundingClientRect();
    const isOver = Boolean(
      cageBounds &&
        event.clientX >= cageBounds.left &&
        event.clientX <= cageBounds.right &&
        event.clientY >= cageBounds.top &&
        event.clientY <= cageBounds.bottom,
    );

    // Hanya jika melepaskan di sangkar jawaban & SUDAH mengenai burung (setelah 2 detik)
    if (isOver && hasHitBird) {
      changeBirdCount(birdCount + 1);
    }

    setDragPosition(null);
    setIsDragging(false);
    setIsAiming(false);
    setHasHitBird(false);
    setIsOverTarget(false);
    setIsOverCage(false);
  }

  // Aksi interaktif klik langsung (ramah anak 3-4 tahun)
  function handleDirectShoot() {
    if (isAiming) return;
    triggerShoot();
    setTimeout(() => {
      changeBirdCount(birdCount + 1);
      setHasHitBird(false);
      setIsAiming(false);
    }, 2000);
  }

  return (
    <div className="shooting-answer">
      {/* 1. Ketapel / Alat Bidik */}
      <div className="shooting-dock">
        <button
          type="button"
          className={`slingshot-control ${isDragging ? "slingshot-control--dragging" : ""}`}
          onPointerDown={(e) => handleStartDrag(e, false)}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerCancel={() => {
            cancelAiming();
            setDragPosition(null);
            setIsDragging(false);
            setHasHitBird(false);
            setIsOverTarget(false);
            setIsOverCage(false);
          }}
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

      {/* 2. Pohon Sasaran Berbentuk Pohon Realistis (Realistic Tree) */}
      <div
        ref={targetAreaRef}
        className={`realistic-tree ${isOverTarget ? "realistic-tree--aiming" : ""}`}
        onPointerDown={(e) => handleStartDrag(e, true)}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onClick={handleDirectShoot}
        role="button"
        tabIndex={0}
        aria-label="Pohon burung - bidik burung di pohon"
        title="Arahkan bidikan ke sini untuk menembak burung (2 detik)"
      >
        <div className="tree-top">
          <div className="tree-crown">
            {/* Cabang & Ranting Pohon */}
            <div className="tree-branch tree-branch--left" aria-hidden="true" />
            <div className="tree-branch tree-branch--right" aria-hidden="true" />

            {/* Burung-burung hinggap di ranting */}
            <div className="perched-birds-group" aria-hidden="true">
              <span className="realistic-bird bird-pos-1">🐦</span>
              <span className="realistic-bird bird-pos-2">🦜</span>
              <span className="realistic-bird bird-pos-3">🐦</span>
              <span className="realistic-bird bird-pos-4">🕊️</span>
            </div>

            {isOverTarget && isAiming && (
              <span className="aim-crosshair-anim">💥 Dor!</span>
            )}
          </div>
        </div>
        <div className="tree-trunk" aria-hidden="true">
          <div className="tree-bark-line" />
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

      {/* 3. Kotak Jawaban: Sangkar Burung */}
      <div
        ref={cageBoxRef}
        className={`shooting-cage-box ${isOverCage ? "shooting-cage-box--highlight" : ""}`}
        aria-label={`Jawaban ${value}, sangkar berisi ${birdCount} burung`}
      >
        <span className="shooting-cage-box__label">🏠 Sangkar Jawaban</span>
        <div className="shooting-cage-box__birds" aria-hidden="true">
          {Array.from({ length: birdCount }, (_, index) => (
            <span key={index} className="cage-bird">
              🐦
            </span>
          ))}
          {birdCount === 0 && (
            <span className="shooting-cage-box__empty-hint">
              Taruh burung hasil bidikan di sini...
            </span>
          )}
        </div>
        <output>{value}</output>
      </div>

      {/* 4. Set Bidikan / Burung yang Melayang Mengikuti Gerakan Kursor/Jari */}
      {isDragging && dragPosition && (
        <div
          className="dragging-slingshot-set"
          style={{ left: dragPosition.x, top: dragPosition.y }}
          aria-hidden="true"
        >
          {hasHitBird ? (
            <>
              <span className="dragging-flying-bird">🐦</span>
              <span className="hit-status-badge">Burung Didapat! 🐦</span>
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
          onClick={() => changeBirdCount(birdCount - 1)}
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
