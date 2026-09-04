import { useState } from "react";
import {
  ArrowRight,
  Bird,
  Grid3X3,
  Spade,
  Volume2,
  VolumeX,
} from "lucide-react";
import { createRandomNumberRepository } from "./features/game/data/randomNumberRepository.js";
import { GameBoard } from "./features/game/presentation/components/GameBoard.jsx";
import { useGameAudio } from "./features/game/presentation/useGameAudio.js";
import "./App.css";

const randomNumberRepository = createRandomNumberRepository();

const GAMES = [
  {
    id: "dice",
    title: "Dadu Ceria",
    description: "Kocok dua dadu dan hitung hasilnya.",
    icon: Grid3X3,
    color: "coral",
  },
  {
    id: "cards",
    title: "Kartu Pintar",
    description: "Buka kartu angka satu per satu.",
    icon: Spade,
    color: "blue",
  },
  {
    id: "farmer",
    title: "Ternak Ayam",
    description: "Belajar berhitung bersama anak ayam.",
    icon: Bird,
    color: "green",
  },
];

function App() {
  const [mode, setMode] = useState(null);
  const gameAudio = useGameAudio();

  function selectMode(nextMode) {
    gameAudio.startBackgroundMusic(nextMode);
    setMode(nextMode);
  }

  function returnHome() {
    gameAudio.startBackgroundMusic("menu");
    setMode(null);
  }

  function toggleMenuAudio() {
    if (gameAudio.isMuted || gameAudio.isMusicPlaying) gameAudio.toggleAudio();
    else gameAudio.startBackgroundMusic("menu");
  }

  if (mode) {
    return (
      <GameBoard
        mode={mode}
        randomNumberRepository={randomNumberRepository}
        onBack={returnHome}
        audio={gameAudio}
      />
    );
  }

  return (
    <main className="home-screen">
      <div className="sun" aria-hidden="true" />
      <div className="home-content">
        <header className="brand">
          <span className="brand__mark" aria-hidden="true">
            1+2
          </span>
          <span>Math Lab</span>
          <button
            className="home-audio-button"
            type="button"
            onClick={toggleMenuAudio}
            title={gameAudio.isMuted ? "Nyalakan musik" : "Matikan musik"}
            aria-label={gameAudio.isMuted ? "Nyalakan musik" : "Matikan musik"}
          >
            {gameAudio.isMuted ? <VolumeX /> : <Volume2 />}
          </button>
        </header>

        <section className="welcome">
          <p className="eyebrow">Waktunya bermain dan berhitung</p>
          <h1>
            Petualangan angka
            <br />
            <span>dimulai di sini.</span>
          </h1>
          <p className="welcome__copy">
            Pilih permainan favoritmu. Setiap jawaban benar membuat kemampuan
            matematikamu semakin kuat.
          </p>
        </section>

        <section className="game-picker" aria-labelledby="game-picker-title">
          <h2 id="game-picker-title">Mau bermain apa?</h2>
          <div className="game-grid">
            {GAMES.map(
              ({ id, title, description, icon: Icon, color }, index) => (
                <button
                  className={`game-option game-option--${color}`}
                  type="button"
                  key={id}
                  onClick={() => selectMode(id)}
                >
                  <span className="game-option__number">0{index + 1}</span>
                  <span className="game-option__icon">
                    <Icon aria-hidden="true" />
                  </span>
                  <span className="game-option__text">
                    <strong>{title}</strong>
                    <small>{description}</small>
                  </span>
                  <span className="game-option__arrow">
                    <ArrowRight aria-hidden="true" />
                  </span>
                </button>
              ),
            )}
          </div>
        </section>

        <footer className="home-footer">
          <span>Untuk penjelajah angka usia 5+</span>
          <div className="progress-dots" aria-hidden="true">
            <i />
            <i />
            <i />
          </div>
        </footer>
      </div>
    </main>
  );
}

export default App;
