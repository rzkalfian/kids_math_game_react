import { useEffect, useRef, useState } from "react";
import { TIMINGS } from "../constants.js";

function isPointInside(element, x, y) {
  const bounds = element?.getBoundingClientRect();
  return Boolean(
    bounds &&
      x >= bounds.left &&
      x <= bounds.right &&
      y >= bounds.top &&
      y <= bounds.bottom,
  );
}

export function useBirdShooting({
  value,
  onChange,
  onShootGun,
  onStopShootGun,
  onHitBird,
}) {
  const birdCount = Math.max(0, value);
  const treeRef = useRef(null);
  const cageRef = useRef(null);
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

  function finishShoot() {
    setHasHitBird(true);
    setIsAiming(false);
    if (onHitBird) onHitBird();
  }

  function triggerShoot() {
    setIsAiming(true);
    setHasHitBird(false);
    if (onShootGun) {
      onShootGun(finishShoot, TIMINGS.DRAG_ACTION_MS);
      return;
    }
    if (shootTimerRef.current) clearTimeout(shootTimerRef.current);
    shootTimerRef.current = setTimeout(finishShoot, TIMINGS.DRAG_ACTION_MS);
  }

  function cancelAiming() {
    setIsAiming(false);
    if (shootTimerRef.current) clearTimeout(shootTimerRef.current);
    if (onStopShootGun) onStopShootGun();
  }

  function resetDrag() {
    setDragPosition(null);
    setIsDragging(false);
    setIsAiming(false);
    setHasHitBird(false);
    setIsOverTarget(false);
    setIsOverCage(false);
  }

  function handleStartDrag(event, startWithBird = false) {
    event.currentTarget.setPointerCapture(event.pointerId);
    setIsDragging(true);
    setDragPosition({ x: event.clientX, y: event.clientY });

    if (startWithBird) {
      triggerShoot();
      return;
    }
    setHasHitBird(false);
    setIsAiming(false);
  }

  function handlePointerMove(event) {
    if (!isDragging) return;
    const { clientX: x, clientY: y } = event;
    setDragPosition({ x, y });

    const overTarget = isPointInside(treeRef.current, x, y);
    setIsOverTarget(overTarget);
    if (overTarget && !hasHitBird && !isAiming) {
      triggerShoot();
    } else if (!overTarget && isAiming && !hasHitBird) {
      cancelAiming();
    }

    setIsOverCage(isPointInside(cageRef.current, x, y));
  }

  function handlePointerUp(event) {
    if (!isDragging) return;
    if (shootTimerRef.current) clearTimeout(shootTimerRef.current);

    const droppedInCage = isPointInside(
      cageRef.current,
      event.clientX,
      event.clientY,
    );
    if (droppedInCage && hasHitBird) changeBirdCount(birdCount + 1);

    resetDrag();
  }

  function handlePointerCancel() {
    cancelAiming();
    resetDrag();
  }

  // Aksi klik langsung (ramah anak 3-4 tahun)
  function handleDirectShoot() {
    if (isAiming) return;
    triggerShoot();
    setTimeout(() => {
      changeBirdCount(birdCount + 1);
      setHasHitBird(false);
      setIsAiming(false);
    }, TIMINGS.DRAG_ACTION_MS);
  }

  return {
    birdCount,
    treeRef,
    cageRef,
    dragPosition,
    isDragging,
    isAiming,
    hasHitBird,
    isOverTarget,
    isOverCage,
    changeBirdCount,
    handleStartDrag,
    handlePointerMove,
    handlePointerUp,
    handlePointerCancel,
    handleDirectShoot,
  };
}
