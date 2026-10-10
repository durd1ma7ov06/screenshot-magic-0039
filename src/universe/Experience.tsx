import { Canvas } from "@react-three/fiber";
import { AnimatePresence, motion as m } from "framer-motion";
import { Check, ChevronLeft, ChevronRight, Heart, Play, RotateCcw, Share2, Volume2, VolumeX, X } from "lucide-react";
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
  const scene: SceneId = SCENES[idx] ?? "intro";
  const [leaving, setLeaving] = useState(false);
  const [webgl, setWebgl] = useState(true);
  const [copied, setCopied] = useState(false);
  const [watchModal, setWatchModal] = useState(false);
  const music = useAmbientMusic();

  // per-scene state with localStorage persistence for Parizoda's custom memories
  const [gardenStep, setGardenStep] = useState(0);
  const [galleryReady, setGalleryReady] = useState(false);
  const [photos] = useState<(string | null)[]>(story.gallery.photos);

  const [selected, setSelected] = useState<number | null>(null);
  const [heartBroken, setHeartBroken] = useState(false);
  const [heartOpen, setHeartOpen] = useState(false);
  const [letterStage, setLetterStage] = useState(0);
  const [letterFinished, setLetterFinished] = useState(false);
  const [choice, setChoice] = useState<"none" | "yes">("none");

  // Runaway "Yo'q" button state and playful error alert
  const [noHidden, setNoHidden] = useState(false);
  const [noAttempts, setNoAttempts] = useState(0);
  const [noOffset, setNoOffset] = useState({ x: 0, y: 0 });
  const [errorToast, setErrorToast] = useState<string | null>(null);

  // Duck background music when video modal is open
  useEffect(() => {
    music.duck(watchModal);
  }, [watchModal, music]);

  useEffect(() => { setWebgl(hasWebGL()); const t = setTimeout(() => setLoading(false), 1800); return () => clearTimeout(t); }, []);

  const go = useCallback((n: number) => {
    const next = Math.max(0, Math.min(SCENES.length - 1, n));
    setSelected(null);
    setWatchModal(false);
    setErrorToast(null);
    if (next === 0) {
      setLetterStage(0);
      setLetterFinished(false);
      setHeartOpen(false);
      setHeartBroken(false);
      setChoice("none");
      setNoHidden(false);
      setNoAttempts(0);
      setNoOffset({ x: 0, y: 0 });
    }
    setIdx(next);
    music.playChime();
  }, [music]);

  // keyboard + wheel + multi-directional touch swipe navigation (except intro)
  const lock = useRef(0);
  useEffect(() => {
    const nav = (dir: number) => {
      if (idx === 0 || Date.now() - lock.current < 1100) return;
      lock.current = Date.now();
      go(idx + dir);
    };
    const onKey = (e: KeyboardEvent) => { if (e.key === "ArrowRight" || e.key === "PageDown") nav(1); if (e.key === "ArrowLeft" || e.key === "PageUp") nav(-1); };
    const onWheel = (e: WheelEvent) => { if (Math.abs(e.deltaY) > 40 && !(e.target as HTMLElement).closest("[data-scroll]")) nav(e.deltaY > 0 ? 1 : -1); };

    let sx = 0;
    let sy = 0;
    const ts = (e: TouchEvent) => {
      sx = e.touches[0]?.clientX ?? 0;
      sy = e.touches[0]?.clientY ?? 0;
    };
    const te = (e: TouchEvent) => {
      const dx = sx - (e.changedTouches[0]?.clientX ?? 0);
      const dy = sy - (e.changedTouches[0]?.clientY ?? 0);
      if ((e.target as HTMLElement).closest("[data-scroll]")) return;
      if (Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > 50) {
        nav(dx > 0 ? 1 : -1);
      } else if (Math.abs(dy) > 70) {
        nav(dy > 0 ? 1 : -1);
      }
    };

    window.addEventListener("keydown", onKey);
    window.addEventListener("wheel", onWheel);
    window.addEventListener("touchstart", ts);
    window.addEventListener("touchend", te);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("wheel", onWheel);
      window.removeEventListener("touchstart", ts);
      window.removeEventListener("touchend", te);
    };
  }, [idx, go]);

  // Timed reveals for garden text lines
  useEffect(() => {
    if (scene !== "garden") return;
    setGardenStep(0);
    const ids = [1, 2, 3, 4].map((s) => setTimeout(() => setGardenStep(s), 1400 + s * 1600));
    return () => ids.forEach(clearTimeout);
  }, [scene]);

  // Timed reveal for gallery proceed button after reading caption
  useEffect(() => {
    if (scene !== "gallery") {
      setGalleryReady(false);
      return;
    }
    const t = setTimeout(() => setGalleryReady(true), 2400);
    return () => clearTimeout(t);
  }, [scene]);

  const enter = () => {
    music.start();
    music.playSparkle();
    setLeaving(true);
    setTimeout(() => { setLeaving(false); go(1); }, 2200);
  };

  const openHeart = () => {
    music.playHeartbeat();
    music.playSparkle();
    setHeartBroken(true);
    setTimeout(() => { setHeartBroken(false); setHeartOpen(true); }, 1800);
  };

  const openLetter = () => {
    music.playUnfold();
    music.playSparkle();
    setLetterStage(1);
    setTimeout(() => setLetterStage(2), 1100);
    setTimeout(() => setLetterStage(3), 2300);
    const duration = 2300 + story.letter.paragraphs.length * 1300 + 1600;
    setTimeout(() => setLetterFinished(true), duration);
  };

  // Runaway dodge on hover/touch: playful jumping around with sound & error toast
  const handleNoDodge = useCallback(() => {
    music.playError();
    setNoAttempts((prev) => {
      const next = prev + 1;
      const msg = story.final.errors[(next - 1) % story.final.errors.length] ?? "";
      setErrorToast(msg);
      if (next >= 4) {
        setNoHidden(true);
      }
      return next;
    });
    const angle = Math.random() * Math.PI * 2;
    const dist = 75 + Math.random() * 85;
    setNoOffset({
      x: Math.round(Math.cos(angle) * dist),
      y: Math.round(Math.sin(angle) * 45),
    });
  }, [music]);

  // "Yo'q" button disappears on click/tap, error toast shows, "Ha" grows bigger
  const handleNoClick = useCallback((e?: React.SyntheticEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    music.playError();
    setNoAttempts((prev) => {
      const next = prev + 1;
      const msg = story.final.errors[(next - 1) % story.final.errors.length] ?? "";
      setErrorToast(msg);
      return next;
    });
    // Hide the "Yo'q" button completely
    setNoHidden(true);
  }, [music]);

  const handleYes = useCallback(() => {
    music.playCelebration();
    music.playSparkle();
    setChoice("yes");
    setErrorToast(null);
  }, [music]);

  const copyLink = () => {
    if (typeof window !== "undefined") {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  // When clicking a frame in the 3D gallery
  const onSelectFrame = (i: number | null) => {
    setSelected(i);
    if (i !== null && photos[i]) {
      const isVid = Boolean(photos[i]?.endsWith(".mp4") || photos[i]?.endsWith(".webm") || photos[i]?.includes("video"));
      if (isVid) {
        setWatchModal(true);
      }
    }
  };

  const selectedIsVideo = selected !== null && photos[selected] ? Boolean(photos[selected]?.endsWith(".mp4") || photos[selected]?.endsWith(".webm") || photos[selected]?.includes("video")) : false;

  return (
    <div className="universe fixed inset-0 overflow-hidden">
      {webgl ? (
        <Canvas dpr={[1, Math.min(2, typeof window !== "undefined" && window.innerWidth < 768 ? 1.5 : 2)]} camera={{ position: [0, 1, 10], fov: 50 }}
          gl={{ antialias: true, toneMapping: THREE.ACESFilmicToneMapping, powerPreference: "high-performance" }}
          onCreated={({ scene: s }) => { s.background = new THREE.Color("#120818"); s.fog = new THREE.Fog("#120818", 10, 40); }}>
          <Suspense fallback={null}>
            {scene === "intro" && <IntroScene leaving={leaving} />}
            {scene === "garden" && <GardenScene />}
            {scene === "gallery" && <GalleryScene photos={photos} selected={selected} onSelect={onSelectFrame} />}
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
            <m.div key="intro" {...fade} transition={{ duration: 1.4, ease, delay: 0.4 }} className="mt-[44vh] flex flex-col items-center gap-6 max-w-2xl">
              <div className="space-y-3">
                <h1 className="font-display text-4xl text-ivory text-glow md:text-6xl">{story.intro.title}</h1>
                <p className="font-display text-lg italic text-ivory/80 md:text-xl">{story.intro.subtitle}</p>
              </div>
              <button onClick={enter} className="glass-btn pointer-events-auto shadow-2xl flex items-center gap-2 cursor-pointer hover:scale-105 active:scale-95 transition-transform">
                <span>{story.intro.button}</span>
                <ChevronRight size={18} />
              </button>
            </m.div>
          )}

          {scene === "garden" && (
            <m.div key="garden" {...fade} transition={{ duration: 1.2, ease }} className="glass-panel max-w-xl">
              <m.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 1.6, delay: 0.6 }} className="font-display text-3xl italic text-ivory md:text-4xl">
                {story.garden.first}
              </m.p>
              <div className="mt-6 space-y-3.5">
                {story.garden.lines.map((l, i) => gardenStep > i && (
                  <m.p key={i} initial={{ opacity: 0, y: 12, filter: "blur(6px)" }} animate={{ opacity: 1, y: 0, filter: "blur(0)" }} transition={{ duration: 1.4, ease }} className="text-lg text-ivory/90 leading-relaxed md:text-xl">{l}</m.p>
                ))}
              </div>
              {/* Proceed button appears only once garden lines have appeared */}
              {gardenStep >= story.garden.lines.length && (
                <m.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.9, delay: 0.6 }} className="mt-8 flex justify-center">
                  <button onClick={() => go(2)} className="glass-btn btn-proceed-glow !py-2.5 !px-7 text-sm flex items-center gap-2 pointer-events-auto cursor-pointer">
                    <span>Xotiralarimiz olamiga o‘tish ✨</span>
                    <ChevronRight size={16} />
                  </button>
                </m.div>
              )}
            </m.div>
          )}

          {scene === "gallery" && (
            <m.div key="gallery" {...fade} transition={{ duration: 1.2, ease }} className="absolute bottom-24 max-w-2xl px-4 flex flex-col items-center">
              <p className="font-display text-2xl italic text-ivory text-glow md:text-3xl">{story.gallery.caption}</p>
              <p className="mt-3 text-xs tracking-[0.25em] text-ivory/70 uppercase">Videolarni tomosha qilish uchun ramkaga bosing 🎬</p>
              {galleryReady && (
                <m.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.9 }} className="mt-6 flex justify-center">
                  <button onClick={() => go(3)} className="glass-btn btn-proceed-glow !py-2.5 !px-7 text-sm flex items-center gap-2 pointer-events-auto cursor-pointer">
                    <span>Yurak sirlariga o‘tish 💖</span>
                    <ChevronRight size={16} />
                  </button>
                </m.div>
              )}
            </m.div>
          )}

          {scene === "heart" && (
            <m.div key="heart" {...fade} transition={{ duration: 1.2, ease }} className="flex h-full w-full flex-col items-center justify-between py-24">
              <h2 className="font-display text-3xl italic text-ivory text-glow md:text-5xl">{story.heart.title}</h2>
              <AnimatePresence mode="wait">
                {heartOpen ? (
                  <div className="flex flex-col items-center gap-4">
                    <m.p key="msg" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1.6, ease }} className="glass-panel max-w-xl text-lg leading-relaxed text-ivory md:text-xl">{story.heart.message}</m.p>
                    <m.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1.2, duration: 0.8 }} className="flex justify-center">
                      <button onClick={() => go(4)} className="glass-btn btn-proceed-glow !py-2.5 !px-7 text-sm flex items-center gap-2 pointer-events-auto shadow-xl cursor-pointer">
                        <span>Parizodaga atalgan maktubga o‘tish ✉</span>
                        <ChevronRight size={16} />
                      </button>
                    </m.div>
                  </div>
                ) : (
                  <m.button key="btn" exit={{ opacity: 0 }} onClick={openHeart} disabled={heartBroken} className="glass-btn pointer-events-auto cursor-pointer">{story.heart.button}</m.button>
                )}
              </AnimatePresence>
            </m.div>
          )}

          {scene === "letter" && (
            <m.div key="letter" {...fade} transition={{ duration: 1, ease }} className="flex h-full w-full items-center justify-center px-4">
              {letterStage === 0 && (
                <p className="absolute bottom-28 text-sm tracking-[0.3em] text-ivory/80 uppercase animate-pulse">
                  {story.letter.hint}
                </p>
              )}
              {letterStage >= 3 && (
                <m.article data-scroll initial={{ opacity: 0, scaleY: 0.2, y: 60 }} animate={{ opacity: 1, scaleY: 1, y: 0 }} transition={{ duration: 1.4, ease }}
                  className="letter-paper pointer-events-auto max-h-[78vh] w-full max-w-xl origin-top overflow-y-auto text-left">
                  <p className="font-display text-2xl italic font-semibold mb-4 text-rose-950">{story.letter.salutation}</p>
                  {story.letter.paragraphs.map((p, i) => (
                    <m.p key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1 + i * 1.3, duration: 1.2 }} className="mb-4 font-display text-lg leading-relaxed text-rose-950/95">{p}</m.p>
                  ))}
                  <m.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.5 + story.letter.paragraphs.length * 1.3, duration: 1.5 }} className="font-script mt-6 text-right text-3xl md:text-4xl text-rose-900">{story.letter.signature}</m.p>
                  {/* Proceed button appears only once the entire letter has animated in */}
                  {letterFinished && (
                    <m.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.9 }} className="mt-8 pt-5 border-t border-rose-950/20 flex justify-center">
                      <button onClick={() => go(5)} className="glass-btn btn-proceed-glow !bg-rose-950/20 !text-rose-950 hover:!text-ivory !border-rose-900/30 !py-2.5 !px-7 text-sm flex items-center gap-2 shadow-lg cursor-pointer">
                        <span>Yulduzlar osmoniga o‘tish ✨</span>
                        <ChevronRight size={16} />
                      </button>
                    </m.div>
                  )}
                </m.article>
              )}
            </m.div>
          )}

          {scene === "sky" && <SkyText key="sky" onProceed={() => go(6)} />}

          {scene === "final" && (
            <m.div key="final" {...fade} transition={{ duration: 1.2, ease }} className="flex h-full w-full flex-col items-center justify-between pt-16 pb-24 px-4">
              <div className="max-w-xl">
                <h2 className="font-display text-4xl text-ivory text-glow md:text-5xl">{story.final.question}</h2>
                <p className="mt-3 text-ivory/85 md:text-lg italic font-display">{story.final.subtitle}</p>
              </div>

              <div className="flex flex-col items-center gap-6 w-full max-w-lg">
                {/* Playful Error toast alert when trying to touch/hover "Yo'q" */}
                <AnimatePresence>
                  {errorToast && choice !== "yes" && (
                    <m.div
                      key={errorToast}
                      initial={{ opacity: 0, scale: 0.85, y: -10 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.85, y: 10 }}
                      transition={{ type: "spring", stiffness: 450, damping: 25 }}
                      className="error-toast pointer-events-auto flex items-center gap-2 text-sm sm:text-base text-center shadow-2xl"
                    >
                      <span>{errorToast}</span>
                    </m.div>
                  )}
                </AnimatePresence>

                {/* Celebratory message when "Ha, sizni sevaman" is pressed */}
                <AnimatePresence mode="wait">
                  {choice === "yes" && (
                    <m.div
                      key="yes-message"
                      initial={{ opacity: 0, scale: 0.9, y: 16 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      transition={{ duration: 1.4, ease }}
                      className="glass-panel w-full !py-6 text-ivory text-xl md:text-2xl leading-relaxed text-glow space-y-3"
                    >
                      <p className="font-display">{story.final.yesReply}</p>
                      <p className="font-script text-3xl text-rose-300">Cheksiz muhabbat ila, bir umrga... ❤️</p>
                    </m.div>
                  )}
                </AnimatePresence>

                {/* Two buttons: Sevaman grows bigger; Yo'q dodges on hover and disappears completely when clicked */}
                {choice !== "yes" ? (
                  <div className="relative pointer-events-auto flex flex-col items-center justify-center gap-5 w-full min-h-[140px]">
                    {/* The YES button: grows bigger with each runaway attempt and grows even larger when No disappears */}
                    <m.button
                      onClick={handleYes}
                      animate={{
                        scale: noHidden ? 1.28 : 1 + Math.min(noAttempts * 0.08, 0.25),
                        paddingLeft: noHidden ? "3.5rem" : noAttempts > 0 ? "2.6rem" : "2rem",
                        paddingRight: noHidden ? "3.5rem" : noAttempts > 0 ? "2.6rem" : "2rem",
                      }}
                      transition={{ type: "spring", stiffness: 350, damping: 20 }}
                      className={`glass-btn btn-proceed-glow !py-4 text-lg md:text-2xl !bg-rose-600/45 hover:!bg-rose-600/65 text-ivory font-semibold shadow-2xl flex items-center gap-2 cursor-pointer hover:scale-105 active:scale-95 transition-all ${
                        noHidden ? "ring-4 ring-rose-400/60 shadow-rose-500/50" : ""
                      }`}
                    >
                      <Heart size={22} className="text-rose-300 fill-rose-300 animate-pulse" />
                      <span>{story.final.yes}</span>
                    </m.button>

                    {/* The NO button: dodges on hover/touch, disappears on click with error toast */}
                    <AnimatePresence>
                      {!noHidden && (
                        <m.button
                          key="no-btn"
                          type="button"
                          onMouseEnter={handleNoDodge}
                          onTouchStart={handleNoDodge}
                          onClick={handleNoClick}
                          animate={{
                            x: noOffset.x,
                            y: noOffset.y,
                            scale: Math.max(0.7, 1 - noAttempts * 0.08),
                          }}
                          exit={{ opacity: 0, scale: 0.1, y: 35, filter: "blur(12px)" }}
                          transition={{ type: "spring", stiffness: 420, damping: 22 }}
                          className="glass-btn btn-runaway !py-2.5 !px-6 text-sm !bg-white/5 hover:!bg-white/10 text-ivory/70 border-dashed border-rose-400/30 cursor-pointer select-none"
                        >
                          <span>{story.final.no}</span>
                        </m.button>
                      )}
                    </AnimatePresence>
                  </div>
                ) : (
                  /* Replay & Share actions upon yes */
                  <m.div
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.8, duration: 0.8 }}
                    className="pointer-events-auto flex items-center justify-center gap-4 mt-2"
                  >
                    <button
                      onClick={() => go(0)}
                      className="glass-btn !py-2.5 !px-6 text-sm flex items-center gap-2 cursor-pointer"
                      title="Boshidan qayta ko‘rish"
                    >
                      <RotateCcw size={16} />
                      <span>Qayta ko‘rish</span>
                    </button>
                    <button
                      onClick={copyLink}
                      className="glass-btn !py-2.5 !px-6 text-sm flex items-center gap-2 cursor-pointer"
                      title="Havolani nusxalash"
                    >
                      {copied ? <Check size={16} className="text-emerald-400" /> : <Share2 size={16} />}
                      <span>{copied ? "Nusxalandi ✨" : "Havolani nusxalash"}</span>
                    </button>
                  </m.div>
                )}
              </div>
            </m.div>
          )}
        </AnimatePresence>
      </div>

      {/* Chrome Controls */}
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

      {/* Music button with visual playing indicator */}
      <button onClick={music.toggle} className={`icon-btn pointer-events-auto absolute top-5 right-5 ${music.on ? "music-playing" : ""}`} aria-label={music.on ? "Musiqani o‘chirish" : "Musiqani yoqish"}>
        {music.on ? <Volume2 size={18} /> : <VolumeX size={18} />}
      </button>

      {idx > 0 && <p className="absolute top-6 left-6 text-[11px] tracking-[0.35em] text-ivory/60 uppercase">{idx} / {SCENES.length - 1} · {SCENE_LABELS[scene]}</p>}

      <AnimatePresence>
        {loading && (
          <m.div key="loader" exit={{ opacity: 0 }} transition={{ duration: 1 }} className="loader absolute inset-0 z-50 flex flex-col items-center justify-center gap-6">
            <div className="crystal" />
            <p className="text-xs tracking-[0.4em] text-ivory/70 uppercase">Parizodaning olami tayyorlanmoqda ✨</p>
          </m.div>
        )}
      </AnimatePresence>

      {/* Video preview modal for Parizoda's videos: pure video only, NO subtitles and NO tags */}
      {watchModal && selected !== null && photos[selected] && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md pointer-events-auto"
          onClick={() => { setWatchModal(false); setSelected(null); }}
        >
          <div
            className="relative max-w-2xl w-full rounded-2xl overflow-hidden border border-rose-300/30 shadow-2xl bg-black flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => { setWatchModal(false); setSelected(null); }}
              className="absolute top-3 right-3 z-30 icon-btn !bg-black/60 hover:!bg-black/90 !w-10 !h-10 text-ivory border border-white/20 shadow-lg cursor-pointer"
              aria-label="Yopish"
            >
              <X size={20} />
            </button>

            <div className="relative bg-black flex items-center justify-center max-h-[82vh]">
              <video
                src={photos[selected]!}
                controls
                autoPlay
                playsInline
                className="w-full max-h-[82vh] object-contain rounded-2xl"
              />
            </div>
          </div>
        </div>
      )}

      {/* Pure Photo preview modal: NO subtitles and NO tags */}
      {!watchModal && selected !== null && photos[selected] && !selectedIsVideo && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md pointer-events-auto"
          onClick={() => setSelected(null)}
        >
          <div
            className="relative max-w-xl w-full rounded-2xl overflow-hidden border border-rose-300/30 shadow-2xl bg-black"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setSelected(null)}
              className="absolute top-3 right-3 z-30 icon-btn !bg-black/60 hover:!bg-black/90 !w-10 !h-10 text-ivory border border-white/20 shadow-lg cursor-pointer"
              aria-label="Yopish"
            >
              <X size={20} />
            </button>
            <img
              src={photos[selected]!}
              alt="Xotira"
              className="w-full max-h-[80vh] object-contain rounded-2xl"
            />
          </div>
        </div>
      )}
    </div>
  );
}

function SkyText({ onProceed }: { onProceed: () => void }) {
  const [step, setStep] = useState(0);
  const [completed, setCompleted] = useState(false);

  useEffect(() => {
    const ids = [
      setTimeout(() => setStep(1), 1200),
      setTimeout(() => setStep(2), 6500),
      setTimeout(() => setStep(3), 11800),
      setTimeout(() => setCompleted(true), 15000),
    ];
    return () => ids.forEach(clearTimeout);
  }, []);

  return (
    <m.div {...fade} className="absolute bottom-24 max-w-2xl flex flex-col items-center">
      <AnimatePresence mode="wait">
        {step > 0 && (
          <m.p
            key={step}
            initial={{ opacity: 0, letterSpacing: "0.15em", filter: "blur(10px)", y: 15 }}
            animate={{ opacity: 1, letterSpacing: "0em", filter: "blur(0)", y: 0 }}
            exit={{ opacity: 0, scale: 1.05, filter: "blur(12px)" }}
            transition={{ duration: 1.8, ease }}
            className="font-display text-2xl italic text-ivory text-glow leading-relaxed md:text-4xl px-4"
          >
            {story.sky.lines[step - 1]}
          </m.p>
        )}
      </AnimatePresence>

      {completed && (
        <m.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, delay: 0.4 }}
          className="mt-8 pointer-events-auto"
        >
          <button
            onClick={onProceed}
            className="glass-btn btn-proceed-glow !py-2.5 !px-7 text-sm flex items-center gap-2 cursor-pointer"
          >
            <span>Muhim savolga o‘tish ❤️</span>
            <ChevronRight size={16} />
          </button>
        </m.div>
      )}
    </m.div>
  );
}


