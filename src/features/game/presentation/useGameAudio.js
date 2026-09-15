import { useEffect, useRef, useState } from "react";
import chickSound from "../../../assets/sounds/chick.mp3";
import diceShakeSound from "../../../assets/sounds/diceshake.mp3";
import failureSound from "../../../assets/sounds/failure.mp3";
import fishStartSound from "../../../assets/sounds/fish-start.mp3";
import getFishSound from "../../../assets/sounds/get-fish.mp3";
import shootGunSound from "../../../assets/sounds/shoot-gun.mp3";
import soundtrackFishSound from "../../../assets/sounds/soundtrack-fish.mp3";
import soundtrackPlanetSound from "../../../assets/sounds/soundtrack-planet.mp3";
import yaySound from "../../../assets/sounds/yay.mp3";

const AUDIO_PREFERENCE_KEY = "kids-math-game-audio-muted";
const DICE_SHAKE_DURATION_MS = 1000;

const BACKGROUND_MUSIC = {
  menu: [
    [523.25, 0, 0.16],
    [659.25, 0.32, 0.16],
    [783.99, 0.64, 0.22],
    [659.25, 1.04, 0.16],
    [587.33, 1.36, 0.16],
    [698.46, 1.68, 0.28],
  ],
  dice: [
    [392, 0, 0.14],
    [523.25, 0.22, 0.14],
    [659.25, 0.44, 0.18],
    [523.25, 0.78, 0.14],
    [440, 1, 0.14],
    [587.33, 1.22, 0.24],
  ],
  cards: [
    [659.25, 0, 0.22],
    [783.99, 0.36, 0.16],
    [1046.5, 0.68, 0.28],
    [880, 1.16, 0.16],
    [783.99, 1.48, 0.16],
    [987.77, 1.8, 0.24],
  ],
  farmer: [
    [392, 0, 0.18],
    [493.88, 0.3, 0.16],
    [587.33, 0.6, 0.22],
    [493.88, 1.02, 0.16],
    [440, 1.3, 0.16],
    [523.25, 1.62, 0.3],
  ],
  fishing: [
    [440, 0, 0.18],
    [554.37, 0.28, 0.16],
    [659.25, 0.58, 0.24],
    [880, 0.98, 0.2],
    [659.25, 1.34, 0.16],
    [554.37, 1.64, 0.26],
  ],
  shooting: [
    [523.25, 0, 0.16],
    [659.25, 0.24, 0.16],
    [783.99, 0.48, 0.2],
    [1046.5, 0.8, 0.24],
    [783.99, 1.18, 0.16],
    [880, 1.48, 0.26],
  ],
  space: [
    [196, 0, 0.28],      // G3 deep space drone
    [293.66, 0.3, 0.22], // D4
    [392, 0.6, 0.28],    // G4 cosmic pulse
    [587.33, 1.0, 0.24], // D5 planet glow
    [493.88, 1.35, 0.2], // B4 orbit
    [392, 1.65, 0.32],   // G4 return
  ],
};

function createTone(
  context,
  destination,
  frequency,
  startTime,
  duration,
  volume,
  type = "sine",
) {
  const oscillator = context.createOscillator();
  const gain = context.createGain();

  oscillator.type = type;
  oscillator.frequency.setValueAtTime(frequency, startTime);
  gain.gain.setValueAtTime(0, startTime);
  gain.gain.linearRampToValueAtTime(volume, startTime + 0.02);
  gain.gain.exponentialRampToValueAtTime(0.001, startTime + duration);
  oscillator.connect(gain);
  gain.connect(destination);
  oscillator.start(startTime);
  oscillator.stop(startTime + duration + 0.03);
}

export function useGameAudio() {
  const [isMuted, setIsMuted] = useState(
    () => localStorage.getItem(AUDIO_PREFERENCE_KEY) === "true",
  );
  const [isMusicPlaying, setIsMusicPlaying] = useState(false);
  const contextRef = useRef(null);
  const masterGainRef = useRef(null);
  const musicTimerRef = useRef(null);
  const isMusicPlayingRef = useRef(false);
  const musicThemeRef = useRef("menu");
  const mutedRef = useRef(isMuted);
  const soundEffectsRef = useRef({});

  useEffect(
    () => () => {
      clearTimeout(musicTimerRef.current);
      contextRef.current?.close();
      Object.values(soundEffectsRef.current).forEach((sound) => {
        sound.pause();
        sound.currentTime = 0;
      });
    },
    [],
  );

  function getAudioContext() {
    if (!contextRef.current) {
      const context = new AudioContext();
      const masterGain = context.createGain();
      masterGain.gain.value = mutedRef.current ? 0 : 1;
      masterGain.connect(context.destination);
      contextRef.current = context;
      masterGainRef.current = masterGain;
    }

    return contextRef.current;
  }

  function playBackgroundLoop() {
    if (!isMusicPlayingRef.current || mutedRef.current) return;

    const context = getAudioContext();
    const startTime = context.currentTime + 0.05;
    BACKGROUND_MUSIC[musicThemeRef.current].forEach(
      ([frequency, offset, duration]) => {
        createTone(
          context,
          masterGainRef.current,
          frequency,
          startTime + offset,
          duration,
          0.035,
          "triangle",
        );
      },
    );
    musicTimerRef.current = setTimeout(playBackgroundLoop, 2400);
  }

  function startBackgroundMusic(theme = "menu") {
    if (mutedRef.current) return;
    if (isMusicPlayingRef.current && musicThemeRef.current === theme) return;

    stopBackgroundMusic();
    musicThemeRef.current = theme;
    isMusicPlayingRef.current = true;
    setIsMusicPlaying(true);

    if (theme === "fishing") {
      if (!soundEffectsRef.current.soundtrackFish) {
        const sound = new Audio(soundtrackFishSound);
        sound.loop = true;
        sound.preload = "auto";
        sound.volume = 0.32;
        soundEffectsRef.current.soundtrackFish = sound;
      }
      const sound = soundEffectsRef.current.soundtrackFish;
      sound.currentTime = 0;
      sound.play().catch(() => {
        isMusicPlayingRef.current = false;
        setIsMusicPlaying(false);
      });
      return;
    }

    if (theme === "space") {
      if (!soundEffectsRef.current.soundtrackPlanet) {
        const sound = new Audio(soundtrackPlanetSound);
        sound.loop = true;
        sound.preload = "auto";
        sound.volume = 0.32;
        soundEffectsRef.current.soundtrackPlanet = sound;
      }
      const sound = soundEffectsRef.current.soundtrackPlanet;
      sound.currentTime = 0;
      sound.play().catch(() => {
        isMusicPlayingRef.current = false;
        setIsMusicPlaying(false);
      });
      return;
    }

    const context = getAudioContext();
    context
      .resume()
      .then(playBackgroundLoop)
      .catch(() => {
        isMusicPlayingRef.current = false;
        setIsMusicPlaying(false);
      });
  }

  function stopBackgroundMusic() {
    isMusicPlayingRef.current = false;
    setIsMusicPlaying(false);
    clearTimeout(musicTimerRef.current);
    if (soundEffectsRef.current.soundtrackFish) {
      soundEffectsRef.current.soundtrackFish.pause();
    }
    if (soundEffectsRef.current.soundtrackPlanet) {
      soundEffectsRef.current.soundtrackPlanet.pause();
    }
  }

  function playFeedback(notes) {
    if (mutedRef.current) return;

    const context = getAudioContext();
    const startTime = context.currentTime + 0.02;
    context
      .resume()
      .then(() => {
        notes.forEach(([frequency, offset, duration, volume]) => {
          createTone(
            context,
            masterGainRef.current,
            frequency,
            startTime + offset,
            duration,
            volume,
            "sine",
          );
        });
      })
      .catch(() => {});
  }

  function playSoundEffect(name, source, volume = 0.5, onEnded) {
    if (mutedRef.current) {
      if (onEnded) onEnded();
      return;
    }

    if (!soundEffectsRef.current[name]) {
      const sound = new Audio(source);
      sound.preload = "auto";
      sound.volume = volume;
      soundEffectsRef.current[name] = sound;
    }

    const sound = soundEffectsRef.current[name];
    sound.currentTime = 0;
    if (onEnded) {
      sound.onended = () => {
        sound.onended = null;
        onEnded();
      };
    } else {
      sound.onended = null;
    }
    sound.play().catch(() => {
      if (onEnded) onEnded();
    });
  }

  function startChickLoop() {
    if (mutedRef.current) return;

    if (!soundEffectsRef.current.chickLoop) {
      const sound = new Audio(chickSound);
      sound.loop = true;
      sound.preload = "auto";
      sound.volume = 0.18;
      soundEffectsRef.current.chickLoop = sound;
    }

    soundEffectsRef.current.chickLoop.play().catch(() => {});
  }

  function stopChickLoop() {
    const sound = soundEffectsRef.current.chickLoop;
    if (!sound) return;

    sound.pause();
    sound.currentTime = 0;
  }

  function playCorrectSound() {
    playSoundEffect("correct", yaySound, 0.28);
  }

  function playTryAgainSound() {
    playSoundEffect("wrong", failureSound, 0.24);
  }

  function playDiceRollSound() {
    playSoundEffect("dice-roll", diceShakeSound, 0.45);
  }

  function playCardFlipSound() {
    playFeedback([
      [783.99, 0, 0.1, 0.06],
      [1046.5, 0.1, 0.18, 0.07],
    ]);
  }

  function playChickenSound() {
    playFeedback([
      [740, 0, 0.08, 0.07],
      [510, 0.09, 0.11, 0.08],
      [680, 0.22, 0.1, 0.06],
    ]);
  }

  function playWaterSplashSound() {
    playFeedback([
      [320, 0, 0.06, 0.08],
      [580, 0.04, 0.09, 0.09],
      [880, 0.1, 0.14, 0.07],
      [1200, 0.18, 0.12, 0.05],
    ]);
  }

  function playFishStartSound() {
    playSoundEffect("fish-start", fishStartSound, 0.45);
  }

  function playGetFishSound() {
    playSoundEffect("get-fish", getFishSound, 0.45);
  }

  function playShootSound(onEnded, durationMs = 2000) {
    if (mutedRef.current) {
      if (onEnded) setTimeout(onEnded, durationMs);
      return;
    }

    if (!soundEffectsRef.current["shoot-gun"]) {
      const sound = new Audio(shootGunSound);
      sound.preload = "auto";
      sound.volume = 0.45;
      soundEffectsRef.current["shoot-gun"] = sound;
    }

    const sound = soundEffectsRef.current["shoot-gun"];
    sound.currentTime = 0;
    sound.play().catch(() => {});

    // Delay 2 detik sebelum callback onEnded dipanggil (dapat burung)
    if (onEnded) {
      setTimeout(() => {
        onEnded();
      }, durationMs);
    }

    // Hentikan suara tembakan setelah ~2.8 - 3 detik
    setTimeout(() => {
      if (!sound.paused) {
        sound.pause();
        sound.currentTime = 0;
      }
    }, 2800);
  }

  function stopShootSound() {
    const sound = soundEffectsRef.current["shoot-gun"];
    if (sound && !sound.paused) {
      sound.pause();
      sound.currentTime = 0;
    }
  }

  function playHitBirdSound() {
    playFeedback([
      [1200, 0, 0.08, 0.09],
      [1600, 0.06, 0.1, 0.1],
      [2000, 0.14, 0.16, 0.08],
    ]);
  }

  function playBirdRustleSound() {
    playFeedback([
      [1046.5, 0, 0.08, 0.07],
      [1318.5, 0.07, 0.1, 0.08],
      [1567.98, 0.16, 0.12, 0.06],
    ]);
  }

  function playSpaceSound() {
    playFeedback([
      [220, 0, 0.12, 0.08],
      [440, 0.06, 0.14, 0.09],
      [880, 0.15, 0.18, 0.08],
      [1760, 0.28, 0.28, 0.06],
    ]);
  }

  function playAstronautBoardSound() {
    // Futuristic sci-fi airlock & thruster chime
    playFeedback([
      [523.25, 0, 0.06, 0.08],
      [659.25, 0.05, 0.08, 0.09],
      [1046.5, 0.1, 0.14, 0.1],
      [1318.5, 0.18, 0.22, 0.07],
    ]);
  }

  function toggleAudio() {
    const nextMuted = !mutedRef.current;
    mutedRef.current = nextMuted;
    setIsMuted(nextMuted);
    localStorage.setItem(AUDIO_PREFERENCE_KEY, String(nextMuted));

    if (masterGainRef.current)
      masterGainRef.current.gain.value = nextMuted ? 0 : 1;
    if (nextMuted) {
      stopBackgroundMusic();
      Object.values(soundEffectsRef.current).forEach((sound) => sound.pause());
    } else startBackgroundMusic(musicThemeRef.current);
  }

  return {
    isMuted,
    isMusicPlaying,
    toggleAudio,
    startBackgroundMusic,
    stopBackgroundMusic,
    playCorrectSound,
    playTryAgainSound,
    playDiceRollSound,
    diceShakeDurationMs: DICE_SHAKE_DURATION_MS,
    startChickLoop,
    stopChickLoop,
    playCardFlipSound,
    playChickenSound,
    playWaterSplashSound,
    playFishStartSound,
    playGetFishSound,
    playShootSound,
    stopShootSound,
    playHitBirdSound,
    playBirdRustleSound,
    playSpaceSound,
    playAstronautBoardSound,
  };
}
