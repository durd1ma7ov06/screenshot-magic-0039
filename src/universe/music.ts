import { useCallback, useEffect, useRef, useState } from "react";

const BG_MUSIC_SRC = "/sound/bg-music.mp3";

/** Plays background music from the sound folder with ducking and procedural SFX. */
export function useAmbientMusic() {
  const [on, setOn] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const ctx = useRef<AudioContext | null>(null);

  // Initialize background audio element
  useEffect(() => {
    if (typeof window === "undefined") return;

    const audio = new Audio(BG_MUSIC_SRC);
    audio.loop = true;
    audio.preload = "auto";
    audio.volume = 0.55;
    audioRef.current = audio;

    const handlePlay = () => setOn(true);
    const handlePause = () => setOn(false);

    audio.addEventListener("play", handlePlay);
    audio.addEventListener("pause", handlePause);

    return () => {
      audio.removeEventListener("play", handlePlay);
      audio.removeEventListener("pause", handlePause);
      audio.pause();
      audio.src = "";
    };
  }, []);

  const getAudioContext = () => {
    if (!ctx.current && typeof window !== "undefined") {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        ctx.current = new AudioCtx();
      }
    }
    return ctx.current;
  };

  const start = useCallback(() => {
    const audio = audioRef.current;
    if (audio) {
      audio.volume = 0.55;
      audio.play().catch(() => {});
    }
    const ac = getAudioContext();
    if (ac && ac.state === "suspended") {
      void ac.resume();
    }
    setOn(true);
  }, []);

  const toggle = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;

    if (audio.paused) {
      audio.play().catch(() => {});
      setOn(true);
    } else {
      audio.pause();
      setOn(false);
    }
    const ac = getAudioContext();
    if (ac && ac.state === "suspended") {
      void ac.resume();
    }
  }, []);

  const duck = useCallback((isDucked: boolean) => {
    const audio = audioRef.current;
    if (!audio) return;
    if (isDucked) {
      audio.volume = 0.08;
    } else {
      audio.volume = 0.55;
    }
  }, []);

  // Interactive synthesized sound effects
  const playSparkle = useCallback(() => {
    const ac = getAudioContext();
    if (!ac || ac.state === "suspended") return;
    const notes = [1046.5, 1318.51, 1567.98, 2093.0]; // C6, E6, G6, C7
    notes.forEach((freq, idx) => {
      const o = ac.createOscillator();
      const g = ac.createGain();
      o.type = "sine";
      o.frequency.value = freq;
      const startTime = ac.currentTime + idx * 0.06;
      g.gain.setValueAtTime(0, startTime);
      g.gain.linearRampToValueAtTime(0.035, startTime + 0.02);
      g.gain.exponentialRampToValueAtTime(0.0001, startTime + 0.6);
      o.connect(g).connect(ac.destination);
      o.start(startTime);
      o.stop(startTime + 0.65);
    });
  }, []);

  const playChime = useCallback(() => {
    const ac = getAudioContext();
    if (!ac || ac.state === "suspended") return;
    const notes = [587.33, 739.99, 880.0, 1174.66]; // D5, F#5, A5, D6
    notes.forEach((freq, idx) => {
      const o = ac.createOscillator();
      const g = ac.createGain();
      o.type = "sine";
      o.frequency.value = freq;
      const startTime = ac.currentTime + idx * 0.08;
      g.gain.setValueAtTime(0, startTime);
      g.gain.linearRampToValueAtTime(0.03, startTime + 0.03);
      g.gain.exponentialRampToValueAtTime(0.0001, startTime + 0.9);
      o.connect(g).connect(ac.destination);
      o.start(startTime);
      o.stop(startTime + 0.95);
    });
  }, []);

  const playHeartbeat = useCallback(() => {
    const ac = getAudioContext();
    if (!ac || ac.state === "suspended") return;
    [0, 0.24].forEach((delay, i) => {
      const o = ac.createOscillator();
      const g = ac.createGain();
      o.type = "sine";
      const start = ac.currentTime + delay;
      o.frequency.setValueAtTime(i === 0 ? 82 : 72, start);
      o.frequency.exponentialRampToValueAtTime(42, start + 0.18);
      g.gain.setValueAtTime(0.09, start);
      g.gain.exponentialRampToValueAtTime(0.001, start + 0.22);
      o.connect(g).connect(ac.destination);
      o.start(start);
      o.stop(start + 0.25);
    });
  }, []);

  const playUnfold = useCallback(() => {
    const ac = getAudioContext();
    if (!ac || ac.state === "suspended") return;
    const o = ac.createOscillator();
    const g = ac.createGain();
    o.type = "triangle";
    const start = ac.currentTime;
    o.frequency.setValueAtTime(320, start);
    o.frequency.exponentialRampToValueAtTime(640, start + 0.35);
    g.gain.setValueAtTime(0.03, start);
    g.gain.exponentialRampToValueAtTime(0.0001, start + 0.4);
    o.connect(g).connect(ac.destination);
    o.start(start);
    o.stop(start + 0.45);
  }, []);

  const playError = useCallback(() => {
    const ac = getAudioContext();
    if (!ac || ac.state === "suspended") return;
    // Playful cute cartoon boing / rejection sound
    const o = ac.createOscillator();
    const g = ac.createGain();
    o.type = "sawtooth";
    const start = ac.currentTime;
    o.frequency.setValueAtTime(320, start);
    o.frequency.exponentialRampToValueAtTime(140, start + 0.22);
    g.gain.setValueAtTime(0.04, start);
    g.gain.exponentialRampToValueAtTime(0.0001, start + 0.25);
    o.connect(g).connect(ac.destination);
    o.start(start);
    o.stop(start + 0.26);
  }, []);

  const playCelebration = useCallback(() => {
    const ac = getAudioContext();
    if (!ac || ac.state === "suspended") return;
    // Triumphant ascending arpeggio for "Ha, sizni sevaman"
    const notes = [523.25, 659.25, 783.99, 1046.5, 1318.51, 1567.98, 2093.0]; // C5, E5, G5, C6, E6, G6, C7
    notes.forEach((freq, idx) => {
      const o = ac.createOscillator();
      const g = ac.createGain();
      o.type = "sine";
      o.frequency.value = freq;
      const startTime = ac.currentTime + idx * 0.08;
      g.gain.setValueAtTime(0, startTime);
      g.gain.linearRampToValueAtTime(0.04, startTime + 0.02);
      g.gain.exponentialRampToValueAtTime(0.0001, startTime + 1.2);
      o.connect(g).connect(ac.destination);
      o.start(startTime);
      o.stop(startTime + 1.25);
    });
  }, []);

  return { on, toggle, start, duck, playSparkle, playChime, playHeartbeat, playUnfold, playError, playCelebration };
}
