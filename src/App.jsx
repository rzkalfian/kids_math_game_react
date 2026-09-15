import { useState } from "react";
import {
  ArrowRight,
  Bird,
  Download,
  Fish,
  Grid3X3,
  Heart,
  QrCode,
  Rocket,
  Spade,
  Target,
  Volume2,
  VolumeX,
  X,
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
  {
    id: "fishing",
    title: "Pancing Ikan",
    description: "Mancing ikan dengan joran dan kail.",
    icon: Fish,
    color: "cyan",
  },
  {
    id: "shooting",
    title: "Tembak Burung",
    description: "Bidik burung di pohon hijau.",
    icon: Target,
    color: "yellow",
  },
  {
    id: "space",
    title: "Jelajah Angkasa",
    description: "Ajak para astronot naik ke dalam roket luar angkasa.",
    icon: Rocket,
    color: "purple",
  },
];

function App() {
  const [mode, setMode] = useState(null);
  const [showSupportModal, setShowSupportModal] = useState(false);
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
          <div className="header-nav-actions">
            <button
              className="support-dev-btn"
              type="button"
              onClick={() => setShowSupportModal(true)}
              title="Dukung Pengembang"
              aria-label="Dukung Pengembang"
            >
              <Heart className="support-dev-heart" aria-hidden="true" />
              <span>Dukung Developer</span>
            </button>
            <button
              className="home-audio-button"
              type="button"
              onClick={toggleMenuAudio}
              title={gameAudio.isMuted ? "Nyalakan musik" : "Matikan musik"}
              aria-label={gameAudio.isMuted ? "Nyalakan musik" : "Matikan musik"}
            >
              {gameAudio.isMuted ? <VolumeX /> : <Volume2 />}
            </button>
          </div>
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
          <span>Untuk penjelajah angka usia 3 - 6 tahun</span>
          <button
            className="footer-support-link"
            type="button"
            onClick={() => setShowSupportModal(true)}
          >
            <QrCode size={16} aria-hidden="true" />
            <span>Support Developer (QRIS)</span>
          </button>
          <div className="progress-dots" aria-hidden="true">
            <i />
            <i />
            <i />
          </div>
        </footer>
      </div>

      {/* Modal QRIS Support */}
      {showSupportModal && (
        <div
          className="modal-backdrop"
          onClick={() => setShowSupportModal(false)}
          role="dialog"
          aria-modal="true"
          aria-labelledby="support-modal-title"
        >
          <div
            className="modal-content support-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              className="modal-close-btn"
              type="button"
              onClick={() => setShowSupportModal(false)}
              aria-label="Tutup modal"
            >
              <X />
            </button>
            <div className="support-modal__header">
              <span className="support-modal__badge">☕ Dukung Pengembang</span>
              <h2 id="support-modal-title">Dukung Math Lab</h2>
              <p>
                Scan QRIS di bawah ini untuk mendukung kami membuat lebih banyak game edukasi seru untuk anak-anak!
              </p>
            </div>
            <div className="support-qris-container">
              <img
                src="/qris-support.jpeg"
                alt="QRIS Support Pengembang"
                className="support-qris-image"
              />
            </div>
            <div className="support-modal__actions">
              <a
                href="/qris-support.jpeg"
                download="QRIS-Support-MathLab.jpeg"
                className="support-download-btn"
                title="Download Gambar QRIS"
              >
                <Download size={16} aria-hidden="true" />
                <span>Download QRIS</span>
              </a>
            </div>
            <div className="support-modal__footer">
              <p>Terima kasih banyak atas dukungan & kebaikan Anda! ❤️</p>
              <button
                className="primary-button"
                type="button"
                onClick={() => setShowSupportModal(false)}
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}

export default App;
