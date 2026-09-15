import { useEffect, useRef, useState } from "react";
import {
  ArrowLeft,
  Check,
  ChevronDown,
  Minus,
  Plus,
  RefreshCw,
  Rocket,
  Star,
  Trash2,
  Volume2,
  VolumeX,
  X,
} from "lucide-react";
import { calculateAnswer, GAME_STATUS, OPERATIONS } from "../../domain/game.js";
import { useGame } from "../../application/useGame.js";
import { BirdShootingAnswer } from "./BirdShootingAnswer.jsx";
import { Dice } from "./Dice.jsx";
import { FishingAnswer } from "./FishingAnswer.jsx";
import { NumberPad } from "./NumberPad.jsx";
import { SpaceExplorerAnswer } from "./SpaceExplorerAnswer.jsx";

const LEVELS = [
  { id: 1, label: "Level 1", minimum: 1, maximum: 10 },
  { id: 2, label: "Level 2", minimum: 11, maximum: 20 },
];

function PlayingPiece({ mode, value, slot, rolling, onClick, disabled }) {
  if (mode === "dice") {
    return (
      <Dice
        value={value}
        rolling={rolling}
        onClick={onClick}
        disabled={disabled}
        label={`Kocok dadu ${slot}`}
      />
    );
  }

  if (mode === "cards") {
    return (
      <button
        className={`number-card ${rolling ? "number-card--flipping" : ""}`}
        type="button"
        onClick={onClick}
        disabled={disabled}
      >
        <span>{value || "?"}</span>
        <small>{value ? "KARTU ANGKA" : `BUKA ${slot.toUpperCase()}`}</small>
      </button>
    );
  }

  if (mode === "fishing") {
    return (
      <button
        className={`aquarium-piece ${rolling ? "aquarium-piece--swimming" : ""}`}
        type="button"
        onClick={onClick}
        disabled={disabled}
      >
        <span className="aquarium-piece__fishes" aria-hidden="true">
          {value ? "🐟".repeat(value) : "❓"}
        </span>
        <small>{value ? `${value} ekor ikan` : `Pancing ${slot}`}</small>
      </button>
    );
  }

  if (mode === "shooting") {
    return (
      <button
        className={`tree-piece ${rolling ? "tree-piece--rustling" : ""}`}
        type="button"
        onClick={onClick}
        disabled={disabled}
      >
        <span className="tree-piece__birds" aria-hidden="true">
          {value ? "🐦".repeat(value) : "❓"}
        </span>
        <small>{value ? `${value} ekor burung` : `Buka ${slot}`}</small>
      </button>
    );
  }

  if (mode === "space") {
    return (
      <button
        className={`planet-piece ${rolling ? "planet-piece--orbiting" : ""}`}
        type="button"
        onClick={onClick}
        disabled={disabled}
      >
        <span className="planet-piece__astronauts" aria-hidden="true">
          {value ? "👨‍🚀".repeat(value) : "❓"}
        </span>
        <small>{value ? `${value} astronot` : `Buka ${slot}`}</small>
      </button>
    );
  }

  return (
    <button
      className={`nest ${rolling ? "nest--rolling" : ""}`}
      type="button"
      onClick={onClick}
      disabled={disabled}
    >
      <span className="nest__chicks" aria-hidden="true">
        {value ? "🐥".repeat(value) : "?"}
      </span>
      <small>{value ? `${value} anak ayam` : `Buka ${slot}`}</small>
    </button>
  );
}

function FarmerDragAnswer({ value, onChange, onSubmit, onAddChick }) {
  const chickCount = Math.max(0, value);
  const coopRef = useRef(null);
  const [dragPosition, setDragPosition] = useState(null);

  function changeChickCount(nextCount) {
    onChange(Math.max(0, nextCount));
  }

  function finishDrag(event) {
    const coopBounds = coopRef.current?.getBoundingClientRect();
    const isOverCoop =
      coopBounds &&
      event.clientX >= coopBounds.left &&
      event.clientX <= coopBounds.right &&
      event.clientY >= coopBounds.top &&
      event.clientY <= coopBounds.bottom;

    setDragPosition(null);
    if (isOverCoop) {
      onAddChick();
      changeChickCount(chickCount + 1);
    }
  }

  return (
    <div className="farmer-answer">
      <div className="chick-source">
        <span>Seret anak ayam</span>
        <button
          type="button"
          className="draggable-chick"
          onPointerDown={(event) => {
            event.currentTarget.setPointerCapture(event.pointerId);
            setDragPosition({ x: event.clientX, y: event.clientY });
          }}
          onPointerMove={(event) =>
            dragPosition &&
            setDragPosition({ x: event.clientX, y: event.clientY })
          }
          onPointerUp={finishDrag}
          onPointerCancel={() => setDragPosition(null)}
          onKeyDown={(event) => {
            if (event.key === "Enter" || event.key === " ") {
              onAddChick();
              changeChickCount(chickCount + 1);
            }
          }}
          aria-label="Seret anak ayam ke kandang"
        >
          🐥
        </button>
        <small>Tambah sesuai jawaban</small>
      </div>

      <div
        ref={coopRef}
        className="chick-coop"
        aria-label={`Jawaban ${value}, kandang berisi ${chickCount} anak ayam`}
      >
        <span className="chick-coop__label">Kandang jawaban</span>
        <div className="chick-coop__chicks" aria-hidden="true">
          {Array.from({ length: chickCount }, (_, index) => (
            <span key={index}>🐥</span>
          ))}
        </div>
        <output>{value}</output>
      </div>

      {dragPosition && (
        <span
          className="dragging-chick"
          style={{ left: dragPosition.x, top: dragPosition.y }}
          aria-hidden="true"
        >
          🐥
        </span>
      )}

      <div className="farmer-answer__actions">
        <button
          type="button"
          disabled={chickCount === 0}
          onClick={() => changeChickCount(chickCount - 1)}
          title="Hapus satu anak ayam"
          aria-label="Hapus satu anak ayam"
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

export function GameBoard({ mode, randomNumberRepository, onBack, audio }) {
  const { state, rollingSlot, roll, submitAnswer, changeOperation, restart } =
    useGame(randomNumberRepository);
  const [input, setInput] = useState("");
  const [farmerAnswer, setFarmerAnswer] = useState(0);
  const [fishingAnswer, setFishingAnswer] = useState(0);
  const [shootingAnswer, setShootingAnswer] = useState(0);
  const [spaceAnswer, setSpaceAnswer] = useState(0);
  const [level, setLevel] = useState(LEVELS[0]);
  const answer = calculateAnswer(
    state.firstNumber,
    state.secondNumber,
    state.operation,
  );
  const isAnswered = state.status === GAME_STATUS.ANSWERED;
  const isCorrect = state.userAnswer === answer;
  const supportsLevels =
    mode === "cards" ||
    mode === "farmer" ||
    mode === "fishing" ||
    mode === "shooting" ||
    mode === "space";

  useEffect(() => {
    if (mode === "farmer" && state.status === GAME_STATUS.READY) {
      audio.startChickLoop();
    }

    return audio.stopChickLoop;
  }, [audio, mode, state.status]);

  function resetAnswers() {
    setInput("");
    setFarmerAnswer(0);
    setFishingAnswer(0);
    setShootingAnswer(0);
    setSpaceAnswer(0);
  }

  function submit(value) {
    if (mode === "farmer") audio.stopChickLoop();
    if (value === answer) audio.playCorrectSound();
    else audio.playTryAgainSound();
    submitAnswer(value);
    resetAnswers();
  }

  function handleRestart() {
    if (mode === "farmer") audio.stopChickLoop();
    restart();
    resetAnswers();
  }

  function handleOperationChange(nextOperation) {
    changeOperation(nextOperation);
    resetAnswers();
  }

  function handleRoll(slot) {
    const canRollFirst =
      slot === "first" && state.status === GAME_STATUS.INITIAL;
    const canRollSecond =
      slot === "second" && state.status === GAME_STATUS.FIRST_REVEALED;
    if (rollingSlot || (!canRollFirst && !canRollSecond)) return;

    if (slot === "first") {
      resetAnswers();
    }

    if (mode === "dice") audio.playDiceRollSound();
    if (mode === "cards") audio.playCardFlipSound();
    if (mode === "farmer") audio.playChickenSound();
    if (mode === "fishing") audio.playWaterSplashSound();
    if (mode === "shooting") audio.playBirdRustleSound();
    if (mode === "space") audio.playSpaceSound();

    let rollRange = supportsLevels ? level : undefined;
    if (slot === "second" && state.operation === OPERATIONS.SUBTRACT) {
      rollRange = {
        minimum: 1,
        maximum: Math.max(1, state.firstNumber),
      };
    }

    roll(
      slot,
      mode === "dice" ? audio.diceShakeDurationMs : 0,
      rollRange,
    );
  }

  function selectLevel(nextLevel) {
    setLevel(nextLevel);
    handleRestart();
  }

  return (
    <main className={`game-screen game-screen--${mode}`}>
      <header className="game-header">
        <button
          className="icon-button"
          type="button"
          onClick={onBack}
          title="Kembali"
        >
          <ArrowLeft />
        </button>
        <div className="score">
          <Star fill="currentColor" />
          <span>
            <strong>{state.score}</strong> dari {state.totalQuestions}
          </span>
        </div>
        <div className="game-settings">
          <div
            className="operation-switch"
            aria-label="Pilih operasi matematika"
          >
            <button
              className={state.operation === OPERATIONS.ADD ? "active" : ""}
              type="button"
              onClick={() => handleOperationChange(OPERATIONS.ADD)}
            >
              <Plus /> Tambah
            </button>
            <button
              className={
                state.operation === OPERATIONS.SUBTRACT ? "active" : ""
              }
              type="button"
              onClick={() => handleOperationChange(OPERATIONS.SUBTRACT)}
            >
              <Minus /> Kurang
            </button>
          </div>
          {supportsLevels && (
            <label className="level-select" title="Pilih level angka">
              <select
                value={level.id}
                onChange={(event) =>
                  selectLevel(
                    LEVELS.find(
                      (option) => option.id === Number(event.target.value),
                    ),
                  )
                }
                disabled={isAnswered}
              >
                {LEVELS.map((option) => (
                  <option value={option.id} key={option.id}>
                    {option.label} ({option.minimum}-{option.maximum})
                  </option>
                ))}
              </select>
              <ChevronDown aria-hidden="true" />
            </label>
          )}
        </div>
        <div className="header-actions">
          <button
            className="icon-button"
            type="button"
            onClick={audio.toggleAudio}
            title={audio.isMuted ? "Nyalakan suara" : "Matikan suara"}
            aria-label={audio.isMuted ? "Nyalakan suara" : "Matikan suara"}
          >
            {audio.isMuted ? <VolumeX /> : <Volume2 />}
          </button>
          <button
            className="icon-button"
            type="button"
            onClick={handleRestart}
            title="Mulai ulang"
            aria-label="Mulai ulang"
          >
            <RefreshCw />
          </button>
        </div>
      </header>

      <section className="game-stage">
        {isAnswered ? (
          <div
            className={`result ${isCorrect ? "result--correct" : "result--wrong"} result--${mode}`}
            role="status"
          >
            <span className="result__icon">
              {mode === "space" && isCorrect ? (
                <Rocket />
              ) : isCorrect ? (
                <Check />
              ) : (
                <X />
              )}
            </span>
            <h2>
              {mode === "space"
                ? isCorrect
                  ? "Hebat! Roket Siap Meluncur! 🚀"
                  : "Astronot Belum Lengkap! 👨‍🚀"
                : mode === "fishing"
                  ? isCorrect
                    ? "Hore, Ikan Tertangkap! 🐟"
                    : "Ikan Masih Kurang Pas! 🎣"
                  : mode === "shooting"
                    ? isCorrect
                      ? "Hebat, Burung Masuk Sangkar! 🐦"
                      : "Bidikan Belum Pas! 🎯"
                    : mode === "farmer"
                      ? isCorrect
                        ? "Hebat, Ayam Masuk Kandang! 🐥"
                        : "Jumlah Ayam Belum Pas! 🐥"
                      : isCorrect
                        ? "Hebat, benar!"
                        : "Hampir benar!"}
            </h2>
            <p>
              {state.firstNumber} {state.operation} {state.secondNumber} ={" "}
              <strong>{answer}</strong>
              {mode === "space" && isCorrect && " Astronot"}
            </p>
            {mode === "space" && isCorrect && (
              <div className="launch-celebration" aria-hidden="true">
                <span className="launch-rocket-animated">🚀</span>
                <span>Meluncur ke Luar Angkasa!</span>
              </div>
            )}
          </div>
        ) : (
          <>
            <div className="problem" aria-label="Soal matematika">
              <PlayingPiece
                mode={mode}
                slot="pertama"
                value={state.firstNumber}
                rolling={rollingSlot === "first"}
                onClick={() => handleRoll("first")}
                disabled={
                  state.status !== GAME_STATUS.INITIAL || Boolean(rollingSlot)
                }
              />
              <span className="operator">{state.operation}</span>
              <PlayingPiece
                mode={mode}
                slot="kedua"
                value={state.secondNumber}
                rolling={rollingSlot === "second"}
                onClick={() => handleRoll("second")}
                disabled={
                  state.status !== GAME_STATUS.FIRST_REVEALED ||
                  Boolean(rollingSlot)
                }
              />
              <span className="operator">=</span>
              <span className="question-mark">?</span>
            </div>
            {state.status === GAME_STATUS.READY &&
              (mode === "farmer" ? (
                <FarmerDragAnswer
                  value={farmerAnswer}
                  onChange={setFarmerAnswer}
                  onSubmit={() => submit(farmerAnswer)}
                  onAddChick={audio.playChickenSound}
                />
              ) : mode === "fishing" ? (
                <FishingAnswer
                  value={fishingAnswer}
                  onChange={setFishingAnswer}
                  onSubmit={() => submit(fishingAnswer)}
                  onFishStart={audio.playFishStartSound}
                  onGetFish={audio.playGetFishSound}
                />
              ) : mode === "shooting" ? (
                <BirdShootingAnswer
                  value={shootingAnswer}
                  onChange={setShootingAnswer}
                  onSubmit={() => submit(shootingAnswer)}
                  onShootGun={audio.playShootSound}
                  onStopShootGun={audio.stopShootSound}
                  onHitBird={audio.playHitBirdSound}
                />
              ) : mode === "space" ? (
                <SpaceExplorerAnswer
                  value={spaceAnswer}
                  onChange={setSpaceAnswer}
                  onSubmit={() => submit(spaceAnswer)}
                  onAddAstronaut={audio.playAstronautBoardSound}
                />
              ) : (
                <NumberPad
                  value={input}
                  onChange={setInput}
                  onSubmit={() => submit(Number(input))}
                />
              ))}
          </>
        )}
      </section>
      <footer className="instruction" aria-live="polite">
        {state.status === GAME_STATUS.INITIAL &&
          "Tekan benda pertama untuk memulai"}
        {state.status === GAME_STATUS.FIRST_REVEALED &&
          "Bagus! Sekarang tekan benda kedua"}
        {state.status === GAME_STATUS.READY &&
          (mode === "farmer"
            ? "Seret anak ayam ke kandang sesuai jawabanmu"
            : mode === "fishing"
              ? "Tarik kail ke Kolam Ikan, lalu bawa ikannya ke kotak Jawaban"
              : mode === "shooting"
                ? "Bidik burung di pohon dengan ketapel, lalu bawa ke Sangkar Jawaban"
                : mode === "space"
                  ? "Ajak astronot naik ke dalam kabin roket sesuai jawabanmu"
                  : "Hitung hasilnya, lalu masukkan jawabanmu")}
        {state.status === GAME_STATUS.ANSWERED &&
          "Soal berikutnya segera dimulai..."}
      </footer>
    </main>
  );
}
