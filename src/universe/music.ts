import { useCallback, useRef, useState } from "react";

/** Soft generated ambient pad. Starts only on explicit user click. */
export function useAmbientMusic() {
  const [on, setOn] = useState(false);
  const ctx = useRef<AudioContext | null>(null);
  const gain = useRef<GainNode | null>(null);

  const start = () => {
    const ac = new AudioContext();
    const master = ac.createGain();
    master.gain.value = 0;
    master.connect(ac.destination);
    const chords = [[220, 277.18, 329.63], [196, 246.94, 329.63], [174.61, 220, 261.63], [196, 246.94, 293.66]];
    const oscs = [0, 1, 2].map(() => {
      const o = ac.createOscillator(); o.type = "sine";
      const g = ac.createGain(); g.gain.value = 0.12;
      o.connect(g).connect(master); o.start(); return o;
    });
    let c = 0;
    const step = () => {
      chords[c % 4]!.forEach((f, i) => oscs[i]!.frequency.setTargetAtTime(f, ac.currentTime, 1.2));
      c++;
    };
    step();
    setInterval(step, 6000);
    ctx.current = ac; gain.current = master;
  };

  const toggle = useCallback(() => {
    if (!ctx.current) start();
    const g = gain.current!, ac = ctx.current!;
    const next = !on;
    if (next) void ac.resume();
    g.gain.setTargetAtTime(next ? 0.18 : 0, ac.currentTime, 0.8);
    setOn(next);
  }, [on]);

  return { on, toggle };
}
