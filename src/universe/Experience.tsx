import { Canvas } from "@react-three/fiber";
import { AnimatePresence, motion as m } from "framer-motion";
import { ChevronLeft, ChevronRight, ImagePlus, Volume2, VolumeX, X } from "lucide-react";
import { Suspense, useCallback, useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { SCENES, SCENE_LABELS, story, type SceneId } from "./config";
import { FinalScene, GalleryScene, GardenScene, HeartScene, IntroScene, LetterScene, SkyScene } from "./Scenes";
import { useAmbientMusic } from "./music";

const fade = { initial: { opacity: 0, y: 24, filter: "blur(8px)" }, animate: { opacity: 1, y: 0, filter: "blur(0px)" }, exit: { opacity: 0, y: -16, filter: "blur(8px)" } };
const ease = [0.22, 1, 0.36, 1] as const;

function hasWebGL() {
  try { const c = document.createElement("canvas"); return !!(c.getContext("webgl2") || c.getContext("webgl")); } catch { return false; }
}

export function Experience() {
  const [loading, setLoading] = useState(true);
  const [idx, setIdx] = useState(0);
  const scene: SceneId = SCENES[idx];
  const [leaving, setLeaving] = useState(false);
  const [webgl, setWebgl] = useState(true);
  const music = useAmbientMusic();

  // per-scene state
  const [gardenStep, setGardenStep] = useState(0);
  const [photos, setPhotos] = useState<(string | null)[]>(() => story.gallery.captions.map((_, i) => story.gallery.photos[i] ?? null));
  const [captions, setCaptions] = useState(story.gallery.captions);
  const [selected, setSelected] = useState<number | null>(null);
  const [heartBroken, setHeartBroken] = useState(false);
  const [heartOpen, setHeartOpen] = useState(false);
  const [letterStage, setLetterStage] = useState(0);
  const [choice, setChoice] = useState<"none" | "yes" | "time">("none");

  useEffect(() => { setWebgl(hasWebGL()); const t = setTimeout(() => setLoading(false), 1800); return () => clearTimeout(t); }, []);

  const go = useCallback((n: number) => {
    const next = Math.max(0, Math.min(SCENES.length - 1, n));
    setSelected(null);
    setIdx(next);
  }, []);

  // keyboard + wheel/swipe navigation (except intro)
  const lock = useRef(0);
  useEffect(() => {
    const nav = (dir: number) => {
      if (idx === 0 || Date.now() - lock.current < 1200) return;
      lock.current = Date.now();
      go(idx + dir);
    };
    const onKey = (e: KeyboardEvent) => { if (e.key === "ArrowRight" || e.key === "PageDown") nav(1); if (e.key === "ArrowLeft" || e.key === "PageUp") nav(-1); };
    const onWheel = (e: WheelEvent) => { if (Math.abs(e.deltaY) > 40 && !(e.target as HTMLElement).closest("[data-scroll]")) nav(e.deltaY > 0 ? 1 : -1); };
    let sy = 0;
    const ts = (e: TouchEvent) => { sy = e.touches[0].clientY; };
    const te = (e: TouchEvent) => { const dy = sy - e.changedTouches[0].clientY; if (Math.abs(dy) > 70 && !(e.target as HTMLElement).closest("[data-scroll]")) nav(dy > 0 ? 1 : -1); };
    window.addEventListener("keydown", onKey); window.addEventListener("wheel", onWheel); window.addEventListener("touchstart", ts); window.addEventListener("touchend", te);
    return () => { window.removeEventListener("keydown", onKey); window.removeEventListener("wheel", onWheel); window.removeEventListener("touchstart", ts); window.removeEventListener("touchend", te); };
  }, [idx, go]);

  // timed reveals
  useEffect(() => {
    if (scene !== "garden") return;
    setGardenStep(0);
    const ids = [1, 2, 3, 4].map((s) => setTimeout(() => setGardenStep(s), 1400 + s * 1500));
    return () => ids.forEach(clearTimeout);
  }, [scene]);

  const enter = () => {
    setLeaving(true);
    setTimeout(() => { setLeaving(false); go(1); }, 2200);
  };
  const openHeart = () => {
    setHeartBroken(true);
    setTimeout(() => { setHeartBroken(false); setHeartOpen(true); }, 1800);
  };
  const openLetter = () => {
    setLetterStage(1);
    setTimeout(() => setLetterStage(2), 1100);
    setTimeout(() => setLetterStage(3), 2300);
  };

  const fileRef = useRef<HTMLInputElement>(null);
  const onFile = (f?: File) => {
    if (!f || selected === null) return;
    const url = URL.createObjectURL(f);
    setPhotos((p) => p.map((x, i) => (i === selected ? url : x)));
  };

  return (
    <div className="universe fixed inset-0 overflow-hidden">
      {webgl ? (
        <Canvas dpr={[1, Math.min(2, typeof window !== "undefined" && window.innerWidth < 768 ? 1.5 : 2)]} camera={{ position: [0, 1, 10], fov: 50 }}
          gl={{ antialias: true, toneMapping: THREE.ACESFilmicToneMapping, powerPreference: "high-performance" }}
          onCreated={({ scene: s }) => { s.background = new THREE.Color("#120818"); s.fog = new THREE.Fog("#120818", 10, 40); }}>
          <Suspense fallback={null}>
            {scene === "intro" && <IntroScene leaving={leaving} />}
            {scene === "garden" && <GardenScene />}
            {scene === "gallery" && <GalleryScene photos={photos} selected={selected} onSelect={setSelected} />}
            {scene === "heart" && <HeartScene broken={heartBroken} opened={heartOpen} />}
            {scene === "letter" && <LetterScene stage={letterStage} onOpen={openLetter} />}
            {scene === "sky" && <SkyScene />}
            {scene === "final" && <FinalScene choice={choice} />}
          </Suspense>
        </Canvas>
      ) : (
        <div className="fallback-bg absolute inset-0" />
      )}
      <div className="vignette pointer-events-none absolute inset-0" />

      {/* Overlay */}
      <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center px-6 text-center">
        <AnimatePresence mode="wait">
          {scene === "intro" && !leaving && (
            <m.div key="intro" {...fade} transition={{ duration: 1.4, ease, delay: 0.4 }} className="mt-[42vh] flex flex-col items-center gap-8">
              <h1 className="font-display text-4xl text-ivory text-glow md:text-6xl">{story.intro.title}</h1>
              <button onClick={enter} className="glass-btn pointer-events-auto">{story.intro.button}</button>
            </m.div>
          )}

          {scene === "garden" && (
            <m.div key="garden" {...fade} transition={{ duration: 1.2, ease }} className="glass-panel max-w-xl">
              <m.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 1.6, delay: 0.6 }} className="font-display text-3xl italic text-ivory md:text-4xl">
                {story.garden.first}
              </m.p>
              <div className="mt-6 space-y-3">
                {story.garden.lines.map((l, i) => gardenStep > i && (
                  <m.p key={i} initial={{ opacity: 0, y: 12, filter: "blur(6px)" }} animate={{ opacity: 1, y: 0, filter: "blur(0)" }} transition={{ duration: 1.4, ease }} className="text-lg text-ivory/85 md:text-xl">{l}</m.p>
                ))}
              </div>
            </m.div>
          )}

          {scene === "gallery" && (
            <m.div key="gallery" {...fade} transition={{ duration: 1.2, ease }} className="absolute bottom-28 max-w-2xl px-4">
              {selected === null ? (
                <>
                  <p className="font-display text-2xl italic text-ivory text-glow md:text-3xl">{story.gallery.caption}</p>
                  <p className="mt-3 text-xs tracking-[0.3em] text-ivory/50 uppercase">Ramkaga bosing</p>
                </>
              ) : (
                <div className="glass-panel pointer-events-auto flex items-center gap-3 !p-3">
                  <input aria-label="Izoh" value={captions[selected]} onChange={(e) => setCaptions((c) => c.map((x, i) => (i === selected ? e.target.value : x)))}
                    className="min-w-0 flex-1 bg-transparent px-2 font-display text-xl italic text-ivory outline-none" />
                  <button className="icon-btn" onClick={() => fileRef.current?.click()} aria-label="Rasm qo‘shish"><ImagePlus size={18} /></button>
                  <button className="icon-btn" onClick={() => setSelected(null)} aria-label="Yopish"><X size={18} /></button>
                  <input ref={fileRef} type="file" accept="image/*" hidden onChange={(e) => onFile(e.target.files?.[0])} />
                </div>
              )}
            </m.div>
          )}

          {scene === "heart" && (
            <m.div key="heart" {...fade} transition={{ duration: 1.2, ease }} className="flex h-full w-full flex-col items-center justify-between py-24">
              <h2 className="font-display text-3xl italic text-ivory text-glow md:text-5xl">{story.heart.title}</h2>
              <AnimatePresence mode="wait">
                {heartOpen ? (
                  <m.p key="msg" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1.6, ease }} className="glass-panel max-w-xl text-lg text-ivory md:text-xl">{story.heart.message}</m.p>
                ) : (
                  <m.button key="btn" exit={{ opacity: 0 }} onClick={openHeart} disabled={heartBroken} className="glass-btn pointer-events-auto">{story.heart.button}</m.button>
                )}
              </AnimatePresence>
            </m.div>
          )}

          {scene === "letter" && (
            <m.div key="letter" {...fade} transition={{ duration: 1, ease }} className="flex h-full w-full items-center justify-center">
              {letterStage === 0 && <p className="absolute bottom-32 text-sm tracking-[0.3em] text-ivory/70 uppercase">{story.letter.hint} ✉</p>}
              {letterStage >= 3 && (
                <m.article data-scroll initial={{ opacity: 0, scaleY: 0.2, y: 60 }} animate={{ opacity: 1, scaleY: 1, y: 0 }} transition={{ duration: 1.4, ease }}
                  className="letter-paper pointer-events-auto max-h-[72vh] w-full max-w-lg origin-top overflow-y-auto text-left">
                  {story.letter.paragraphs.map((p, i) => (
                    <m.p key={i} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1 + i * 1.1, duration: 1.2 }} className="mb-4 font-display text-lg leading-relaxed">{p}</m.p>
                  ))}
                  <m.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.4 + story.letter.paragraphs.length * 1.1, duration: 1.5 }} className="font-script mt-6 text-right text-3xl">{story.letter.signature}</m.p>
                </m.article>
              )}
            </m.div>
          )}

          {scene === "sky" && <SkyText key="sky" />}

          {scene === "final" && (
            <m.div key="final" {...fade} transition={{ duration: 1.2, ease }} className="flex h-full w-full flex-col items-center justify-between py-20">
              <div className="max-w-xl">
                <h2 className="font-display text-4xl text-ivory text-glow md:text-5xl">{story.final.question}</h2>
                <p className="mt-4 text-ivory/80 md:text-lg">{story.final.subtitle}</p>
              </div>
              <div className="flex flex-col items-center gap-5">
                <AnimatePresence mode="wait">
                  {choice !== "none" && (
                    <m.p key={choice} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 1.4, ease }} className="glass-panel max-w-lg !py-4 text-ivory md:text-lg">
                      {choice === "yes" ? story.final.yesReply : story.final.timeReply}
                    </m.p>
                  )}
                </AnimatePresence>
                <div className="pointer-events-auto grid w-full max-w-md grid-cols-1 gap-3 sm:grid-cols-2">
                  <button onClick={() => setChoice("yes")} aria-pressed={choice === "yes"} className="glass-btn">{story.final.yes}</button>
                  <button onClick={() => setChoice("time")} aria-pressed={choice === "time"} className="glass-btn">{story.final.time}</button>
                </div>
              </div>
            </m.div>
          )}
        </AnimatePresence>
      </div>

      {/* Chrome */}
      {idx > 0 && (
        <nav className="pointer-events-auto absolute bottom-6 left-1/2 flex -translate-x-1/2 items-center gap-3">
          <button className="icon-btn" onClick={() => go(idx - 1)} aria-label="Oldingi"><ChevronLeft size={18} /></button>
          <div className="flex items-center gap-2">
            {SCENES.map((s, i) => (
              <button key={s} onClick={() => i > 0 && go(i)} aria-label={SCENE_LABELS[s]} title={SCENE_LABELS[s]} className={`progress-dot ${i === idx ? "is-active" : i < idx ? "is-done" : ""}`} />
            ))}
          </div>
          <button className="icon-btn" onClick={() => go(idx + 1)} disabled={idx === SCENES.length - 1} aria-label="Keyingi"><ChevronRight size={18} /></button>
        </nav>
      )}
      <button onClick={music.toggle} className="icon-btn pointer-events-auto absolute top-5 right-5" aria-label={music.on ? "Musiqani o‘chirish" : "Musiqani yoqish"}>
        {music.on ? <Volume2 size={18} /> : <VolumeX size={18} />}
      </button>
      {idx > 0 && <p className="absolute top-6 left-6 text-[11px] tracking-[0.35em] text-ivory/50 uppercase">{idx} / {SCENES.length - 1} · {SCENE_LABELS[scene]}</p>}

      <AnimatePresence>
        {loading && (
          <m.div key="loader" exit={{ opacity: 0 }} transition={{ duration: 1 }} className="loader absolute inset-0 z-50 flex flex-col items-center justify-center gap-6">
            <div className="crystal" />
            <p className="text-xs tracking-[0.4em] text-ivory/60 uppercase">Olam tayyorlanmoqda</p>
          </m.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function SkyText() {
  const [step, setStep] = useState(0);
  useEffect(() => {
    const ids = [setTimeout(() => setStep(1), 1500), setTimeout(() => setStep(2), 6500)];
    return () => ids.forEach(clearTimeout);
  }, []);
  return (
    <m.div {...fade} className="absolute bottom-32 max-w-2xl">
      <AnimatePresence mode="wait">
        {step > 0 && (
          <m.p key={step} initial={{ opacity: 0, letterSpacing: "0.2em", filter: "blur(10px)" }} animate={{ opacity: 1, letterSpacing: "0em", filter: "blur(0)" }}
            exit={{ opacity: 0, scale: 1.08, filter: "blur(14px)" }} transition={{ duration: 2, ease }} className="font-display text-2xl italic text-ivory text-glow md:text-4xl">
            {story.sky.lines[step - 1]}
          </m.p>
        )}
      </AnimatePresence>
    </m.div>
  );
}
