import { Line, MeshReflectorMaterial, RoundedBox, Sparkles, Stars, useCursor } from "@react-three/drei";
import { useFrame, useThree } from "@react-three/fiber";
import { useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";
import { CameraRig, Float, GlassHeart, Petals, Rose, count, motion, palette, quality } from "./common";
import { Dust, MorphParticles } from "./Particles";
import { abstractArt, heartShape, heartXY } from "./shapes";

function Bg({ color, fog }: { color: string; fog?: [number, number] }) {
  const { scene } = useThree();
  useFrame((_, d) => {
    const c = scene.background as THREE.Color;
    if (c?.isColor) c.lerp(new THREE.Color(color), 1 - Math.exp(-2 * Math.min(d, 0.05)));
    if (scene.fog) (scene.fog as THREE.Fog).color.copy(c);
  });
  useEffect(() => {
    if (fog && scene.fog) { (scene.fog as THREE.Fog).near = fog[0]; (scene.fog as THREE.Fog).far = fog[1]; }
  }, [fog, scene]);
  return null;
}

/* ---------- 1. Intro ---------- */
export function IntroScene({ leaving }: { leaving: boolean }) {
  return (
    <>
      <Bg color="#120818" fog={[10, 40]} />
      <CameraRig position={leaving ? [0, 0.6, 1.2] : [0, 1, 8]} lookAt={[0, 0.6, 0]} />
      <Stars radius={60} depth={40} count={count(3000)} factor={3} fade speed={0.4} />
      <Sparkles count={count(160)} scale={[12, 6, 12]} size={2.5} speed={0.3 * motion} color={palette.gold} />
      <Dust n={500} />
      <Petals n={70} />
      <group position={[0, 0.6, 0]}>
        {!leaving && <GlassHeart scale={1.2} />}
        <MorphParticles n={3500} scale={1.3} target={leaving ? 0 : 1} alpha={leaving ? 1 : 0.15} size={1.2} speed={leaving ? 2 : 0.5} scatterRadius={14} />
      </group>
      <OrbitingStars />
      <mesh rotation-x={-Math.PI / 2} position={[0, -1.2, 0]}>
        <planeGeometry args={[40, 40]} />
        {quality.low ? (
          <meshStandardMaterial color="#1c0c1e" roughness={0.3} metalness={0.6} />
        ) : (
          <MeshReflectorMaterial mirror={0.6} blur={[300, 80]} resolution={512} mixBlur={1} mixStrength={2} roughness={0.8} depthScale={1} color="#1a0a1c" metalness={0.5} />
        )}
      </mesh>
      <ambientLight intensity={0.25} color="#ffc9d6" />
      <spotLight position={[0, 8, 3]} angle={0.4} penumbra={1} intensity={60} color="#ffd6c9" />
    </>
  );
}

function OrbitingStars() {
  const ref = useRef<THREE.Group>(null);
  useFrame((_, d) => { if (ref.current) ref.current.rotation.y += Math.min(d, 0.05) * 0.25 * motion; });
  return (
    <group ref={ref} position={[0, 0.6, 0]} rotation-x={0.3}>
      {Array.from({ length: 10 }, (_, i) => {
        const a = (i / 10) * Math.PI * 2, r = 2.6 + (i % 3) * 0.4;
        return (
          <mesh key={i} position={[Math.cos(a) * r, Math.sin(i) * 0.4, Math.sin(a) * r]}>
            <octahedronGeometry args={[0.05 + (i % 3) * 0.02]} />
            <meshBasicMaterial color={palette.gold} />
          </mesh>
        );
      })}
    </group>
  );
}

/* ---------- 2. Garden ---------- */
export function GardenScene() {
  const roses = useMemo(
    () => Array.from({ length: quality.low ? 9 : 16 }, (_, i) => ({
      x: (i % 2 ? 1 : -1) * (1.8 + Math.random() * 3), y: Math.random() * 2 - 0.3, z: -i * 1.4 + 2,
      c: ["#8c1630", "#a3243f", "#c9566b", "#e8a598"][i % 4], s: 0.8 + Math.random() * 0.6, o: Math.random() * 6,
    })), []);
  const path = useMemo(() => {
    const pts = Array.from({ length: 40 }, (_, i) => new THREE.Vector3(Math.sin(i * 0.35) * 1.2, -1.5, 4 - i * 0.7));
    return new THREE.CatmullRomCurve3(pts);
  }, []);
  return (
    <>
      <Bg color="#2a0f22" fog={[4, 26]} />
      <CameraRig position={[0, 0.8, 7]} lookAt={[0, 0.4, -4]} strength={1} />
      <mesh position={[4, 6, -22]}>
        <sphereGeometry args={[2.2, 32, 32]} />
        <meshBasicMaterial color="#ffe6cc" fog={false} />
      </mesh>
      <mesh position={[4, 6, -22.5]}><circleGeometry args={[5, 32]} /><meshBasicMaterial color="#ffb38a" transparent opacity={0.12} fog={false} /></mesh>
      {roses.map((r, i) => (
        <group key={i} position={[r.x, r.y, r.z]} scale={r.s}>
          <Float offset={r.o} amp={0.25} speed={0.6}><Rose color={r.c} /></Float>
        </group>
      ))}
      <mesh>
        <tubeGeometry args={[path, 200, 0.06, 6]} />
        <meshBasicMaterial color={palette.gold} />
      </mesh>
      <mesh rotation-x={-Math.PI / 2} position={[0, -1.6, -8]}>
        <planeGeometry args={[60, 60]} />
        <meshStandardMaterial color="#2b0d1c" roughness={1} />
      </mesh>
      <Petals n={160} spread={18} fall={0.25} />
      <Sparkles count={count(120)} scale={[16, 6, 20]} size={6} speed={0.2} color="#ffcf9e" opacity={0.6} />
      <hemisphereLight args={["#ffb38a", "#2a0f22", 0.8]} />
      <directionalLight position={[4, 5, -10]} intensity={2.2} color="#ffb070" />
      <pointLight position={[0, 1, 3]} intensity={6} color="#ffd6b0" distance={10} />
    </>
  );
}

/* ---------- 3. Gallery ---------- */
function Frame({ i, total, art, selected, onSelect }: { i: number; total: number; art: THREE.Texture; selected: number | null; onSelect: (i: number) => void }) {
  const ref = useRef<THREE.Group>(null);
  const [hover, setHover] = useState(false);
  useCursor(hover);
  const a = ((i - (total - 1) / 2) / total) * Math.PI * 1.1;
  const R = 6;
  const home = useMemo(() => ({ p: new THREE.Vector3(Math.sin(a) * R, 0, -Math.cos(a) * R + 2), ry: -a }), [a]);
  useFrame((st, d) => {
    if (!ref.current) return;
    const k = 1 - Math.exp(-4 * Math.min(d, 0.05));
    const isSel = selected === i;
    const tp = isSel ? new THREE.Vector3(0, 0.3, 4.2) : home.p.clone().add(new THREE.Vector3(0, Math.sin(st.clock.elapsedTime * 0.8 + i) * 0.12, 0));
    ref.current.position.lerp(tp, k);
    ref.current.rotation.y += ((isSel ? 0 : home.ry + Math.sin(st.clock.elapsedTime * 0.4 + i) * 0.08) - ref.current.rotation.y) * k;
    const s = isSel ? 1.25 : hover ? 1.08 : selected !== null ? 0.9 : 1;
    ref.current.scale.lerp(new THREE.Vector3(s, s, s), k);
  });
  return (
    <group ref={ref} onPointerOver={(e) => { e.stopPropagation(); setHover(true); }} onPointerOut={() => setHover(false)} onClick={(e) => { e.stopPropagation(); onSelect(i); }}>
      <RoundedBox args={[1.9, 2.5, 0.08]} radius={0.06} smoothness={4}>
        <meshPhysicalMaterial color="#ffd9e0" transmission={0.6} roughness={0.15} thickness={0.4} transparent opacity={0.5} emissive={palette.rose} emissiveIntensity={hover ? 0.5 : 0.15} />
      </RoundedBox>
      <mesh position={[0, 0, 0.05]}>
        <planeGeometry args={[1.6, 2.15]} />
        <meshBasicMaterial map={art} toneMapped={false} />
      </mesh>
    </group>
  );
}

export function GalleryScene({ photos, selected, onSelect }: { photos: (string | null)[]; selected: number | null; onSelect: (i: number | null) => void }) {
  const textures = useMemo(() => photos.map((p, i) => {
    if (!p) return abstractArt(i + 1);
    const t = new THREE.TextureLoader().load(p);
    t.colorSpace = THREE.SRGBColorSpace;
    return t;
  }), [photos]);
  useEffect(() => () => textures.forEach((t) => t.dispose()), [textures]);
  return (
    <>
      <Bg color="#0e0714" fog={[6, 22]} />
      <CameraRig position={[0, 0.4, 8.5]} lookAt={[0, 0.2, 0]} strength={0.8} />
      <group onPointerMissed={() => onSelect(null)}>
        {textures.map((t, i) => <Frame key={i} i={i} total={textures.length} art={t} selected={selected} onSelect={onSelect} />)}
      </group>
      <mesh rotation-x={-Math.PI / 2} position={[0, -1.8, 0]}>
        <circleGeometry args={[12, 64]} />
        {quality.low ? <meshStandardMaterial color="#160a18" metalness={0.6} roughness={0.4} /> :
          <MeshReflectorMaterial mirror={0.5} blur={[200, 60]} resolution={512} mixStrength={1.5} color="#140916" metalness={0.5} roughness={0.9} />}
      </mesh>
      <Dust n={400} color="#ffcbd6" />
      <ambientLight intensity={0.4} />
      <spotLight position={[0, 6, 6]} intensity={40} angle={0.7} penumbra={1} color="#ffd8e0" />
    </>
  );
}

/* ---------- 4. Particle heart ---------- */
function Ring({ born }: { born: number }) {
  const ref = useRef<THREE.Mesh>(null);
  useFrame((st) => {
    if (!ref.current) return;
    const age = st.clock.elapsedTime - born;
    ref.current.scale.setScalar(1 + age * 4);
    (ref.current.material as THREE.MeshBasicMaterial).opacity = Math.max(0, 0.7 - age * 0.45);
  });
  return (
    <mesh ref={ref}><torusGeometry args={[1, 0.015, 8, 96]} /><meshBasicMaterial color="#ffd0c0" transparent blending={THREE.AdditiveBlending} /></mesh>
  );
}

export function HeartScene({ broken, opened }: { broken: boolean; opened: boolean }) {
  const group = useRef<THREE.Group>(null);
  const { pointer, clock } = useThree();
  const [rings, setRings] = useState<number[]>([]);
  useFrame((st, d) => {
    if (!group.current) return;
    const dt = Math.min(d, 0.05);
    group.current.rotation.y += dt * 0.3 * motion;
    group.current.rotation.x += (pointer.y * 0.4 - group.current.rotation.x) * dt * 2;
    group.current.rotation.z += (-pointer.x * 0.2 - group.current.rotation.z) * dt * 2;
    void st;
  });
  const tap = () => setRings((r) => [...r.slice(-4), clock.elapsedTime]);
  useEffect(() => { if (broken) tap(); }, [broken]); // eslint-disable-line react-hooks/exhaustive-deps
  return (
    <>
      <Bg color="#14081c" fog={[8, 30]} />
      <CameraRig position={opened ? [0, 0, 7.5] : [0, 0, 6.5]} lookAt={[0, 0, 0]} />
      <Stars radius={50} count={count(2000)} factor={3} fade />
      <group ref={group} onClick={(e) => { e.stopPropagation(); tap(); }}>
        <MorphParticles n={6000} scale={2} target={broken ? 0 : 1} size={1.8} pulse={1} scatterRadius={7} speed={broken ? 3 : 1.4} colorA={opened ? "#ffb0a0" : "#ff7f9f"} />
        <mesh visible={false}><sphereGeometry args={[2.2, 12, 12]} /></mesh>
      </group>
      {rings.map((b) => <Ring key={b} born={b} />)}
      {opened && <Petals n={140} spread={12} fall={0.9} />}
      <Dust n={300} />
    </>
  );
}

/* ---------- 5. Letter ---------- */
const flapGeo = (() => {
  const s = new THREE.Shape();
  s.moveTo(-1.5, 0); s.lineTo(1.5, 0); s.lineTo(0, -1.15); s.closePath();
  return new THREE.ShapeGeometry(s);
})();
const sealHeart = new THREE.ExtrudeGeometry(heartShape(0.09), { depth: 0.02, bevelEnabled: false });

export function LetterScene({ stage, onOpen }: { stage: number; onOpen: () => void }) {
  const flap = useRef<THREE.Group>(null);
  const paper = useRef<THREE.Mesh>(null);
  const seal = useRef<THREE.MeshStandardMaterial>(null);
  const env = useRef<THREE.Group>(null);
  const [hover, setHover] = useState(false);
  useCursor(hover && stage === 0);
  const paperTex = useMemo(() => {
    const c = document.createElement("canvas"); c.width = c.height = 256;
    const x = c.getContext("2d")!;
    x.fillStyle = "#f6e9d6"; x.fillRect(0, 0, 256, 256);
    for (let i = 0; i < 3000; i++) { x.fillStyle = `rgba(120,80,50,${Math.random() * 0.05})`; x.fillRect(Math.random() * 256, Math.random() * 256, 1.5, 1.5); }
    const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t;
  }, []);
  useFrame((st, d) => {
    const k = 1 - Math.exp(-3 * Math.min(d, 0.05));
    if (flap.current) flap.current.rotation.x += ((stage >= 1 ? -Math.PI * 0.95 : 0) - flap.current.rotation.x) * k;
    if (paper.current) paper.current.position.y += ((stage >= 2 ? 1.5 : 0) - paper.current.position.y) * k;
    if (seal.current) seal.current.emissiveIntensity = stage >= 1 ? 2.5 : 0.3 + Math.sin(st.clock.elapsedTime * 2) * 0.2;
    if (env.current) env.current.position.y = Math.sin(st.clock.elapsedTime * 0.9) * 0.12 * motion;
  });
  return (
    <>
      <Bg color="#1b0c16" fog={[6, 24]} />
      <CameraRig position={stage >= 2 ? [0, 1.2, 4.5] : [0, 0.4, 6.5]} lookAt={[0, stage >= 2 ? 0.8 : 0, 0]} strength={0.4} />
      <group ref={env} rotation-x={-0.12}
        onPointerOver={() => setHover(true)} onPointerOut={() => setHover(false)}
        onClick={(e) => { e.stopPropagation(); if (stage === 0) onOpen(); }}>
        <mesh ref={paper} position={[0, 0, 0.02]}>
          <planeGeometry args={[2.7, 1.8]} /><meshStandardMaterial map={paperTex} roughness={0.9} />
        </mesh>
        <mesh position={[0, -0.05, 0.06]}>
          <boxGeometry args={[3, 2, 0.06]} />
          <meshStandardMaterial map={paperTex} color="#e9cfb6" roughness={0.85} />
        </mesh>
        <group ref={flap} position={[0, 0.95, 0.1]}>
          <mesh geometry={flapGeo}><meshStandardMaterial map={paperTex} color="#dfc0a4" roughness={0.85} side={THREE.DoubleSide} /></mesh>
        </group>
        <group position={[0, -0.18, 0.13]} visible={stage < 2}>
          <mesh rotation-x={Math.PI / 2}>
            <cylinderGeometry args={[0.22, 0.24, 0.05, 32]} />
            <meshStandardMaterial ref={seal} color="#7a1022" emissive="#c2283f" roughness={0.35} metalness={0.2} />
          </mesh>
          <mesh geometry={sealHeart} position={[0, 0.02, 0.02]}><meshStandardMaterial color="#b52a40" emissive="#ff6070" emissiveIntensity={0.6} /></mesh>
        </group>
      </group>
      <Sparkles count={count(80)} scale={[8, 5, 6]} size={3} speed={0.2} color={palette.gold} />
      <Dust n={250} />
      <ambientLight intensity={0.35} />
      <spotLight position={[0, 4, 5]} intensity={30} angle={0.6} penumbra={1} color="#ffe0c0" />
      <pointLight position={[-3, 1, -2]} intensity={10} color="#ff8ca0" />
      <pointLight position={[3, 1, -2]} intensity={8} color="#f2c48d" />
    </>
  );
}

/* ---------- 6. Sky ---------- */
export function SkyScene() {
  const pts = useMemo(() => Array.from({ length: 28 }, (_, i) => {
    const [x, y] = heartXY((i / 28) * Math.PI * 2);
    return new THREE.Vector3(x * 4, y * 4 + 2.5, -6);
  }), []);
  const [shown, setShown] = useState(1);
  useEffect(() => {
    const id = setInterval(() => setShown((s) => (s >= pts.length + 1 ? s : s + 1)), 160);
    return () => clearInterval(id);
  }, [pts.length]);
  const [z, setZ] = useState(6);
  useEffect(() => { const t = setTimeout(() => setZ(13), 300); return () => clearTimeout(t); }, []);
  const linePts = [...pts, pts[0]].slice(0, shown);
  return (
    <>
      <Bg color="#07061a" fog={[20, 60]} />
      <CameraRig position={[0, 1, z]} lookAt={[0, 2, -6]} strength={0.7} />
      <Stars radius={80} depth={50} count={count(6000)} factor={4} fade speed={0.6} />
      {linePts.length > 1 && <Line points={linePts} color="#ffc6cf" lineWidth={1.5} transparent opacity={0.7} />}
      {pts.slice(0, shown).map((p, i) => (
        <mesh key={i} position={p}><sphereGeometry args={[0.07, 10, 10]} /><meshBasicMaterial color="#fff0e0" /></mesh>
      ))}
      <Sparkles count={count(60)} position={[0, 2.5, -6]} scale={[9, 8, 1]} size={8} color="#ffb6c4" speed={0.3} />
      <Trails />
      <mesh position={[0, -4, -30]}><planeGeometry args={[120, 14]} /><meshBasicMaterial color="#5a1f4a" transparent opacity={0.45} fog={false} /></mesh>
      <Dust n={400} radius={20} color="#cfd8ff" size={0.06} />
    </>
  );
}

function Trails() {
  const ref = useRef<THREE.Group>(null);
  useFrame((_, d) => {
    ref.current?.children.forEach((c, i) => {
      c.position.x += Math.min(d, 0.05) * (3 + i) * motion;
      c.position.y -= Math.min(d, 0.05) * (1 + i * 0.3) * motion;
      if (c.position.x > 25) { c.position.x = -25; c.position.y = 8 + i * 2; }
    });
  });
  return (
    <group ref={ref}>
      {[0, 1, 2].map((i) => (
        <mesh key={i} position={[-25 + i * 15, 8 + i * 2, -20]} rotation-z={-0.3}>
          <planeGeometry args={[3, 0.03]} /><meshBasicMaterial color="#ffffff" transparent opacity={0.6} blending={THREE.AdditiveBlending} />
        </mesh>
      ))}
    </group>
  );
}

/* ---------- 7. Final ---------- */
function Butterfly({ seed }: { seed: number }) {
  const ref = useRef<THREE.Group>(null);
  const l = useRef<THREE.Mesh>(null), r = useRef<THREE.Mesh>(null);
  useFrame((st) => {
    const t = st.clock.elapsedTime * motion + seed * 10;
    const f = Math.sin(t * 10) * 0.9;
    if (l.current) l.current.rotation.y = f;
    if (r.current) r.current.rotation.y = -f;
    if (ref.current) ref.current.position.set(Math.cos(t * 0.3 + seed) * (2.5 + seed * 0.3), 1 + Math.sin(t * 0.7) * 0.6, Math.sin(t * 0.3 + seed) * (2.5 + seed * 0.3));
  });
  return (
    <group ref={ref} scale={0.18}>
      <mesh ref={l} position={[0, 0, 0]}><circleGeometry args={[1, 3, 0, Math.PI]} /><meshBasicMaterial color="#ffc89a" transparent opacity={0.85} side={THREE.DoubleSide} /></mesh>
      <mesh ref={r}><circleGeometry args={[1, 3, Math.PI, Math.PI]} /><meshBasicMaterial color="#ffc89a" transparent opacity={0.85} side={THREE.DoubleSide} /></mesh>
    </group>
  );
}

function BloomRose({ bloom, ...p }: { bloom: number } & JSX.IntrinsicElements["group"]) {
  const ref = useRef<THREE.Group>(null);
  useFrame((_, d) => { if (ref.current) { const s = ref.current.scale.x + (bloom - ref.current.scale.x) * Math.min(d, 0.05); ref.current.scale.setScalar(s); } });
  return <group {...p}><group ref={ref} scale={0.6}><Rose stem={false} color="#a3243f" /></group></group>;
}

export function FinalScene({ choice }: { choice: "none" | "yes" | "time" }) {
  const roses = 10;
  const calm = choice === "time";
  return (
    <>
      <Bg color={calm ? "#080a1c" : "#1a0a1e"} fog={[8, 30]} />
      <CameraRig position={calm ? [0, 3, 10] : [0, 1.6, 7.5]} lookAt={[0, 0.8, 0]} />
      <Stars radius={60} count={count(3500)} factor={3} fade speed={calm ? 0.1 : 0.5} />
      <mesh position={[0, -0.6, 0]}>
        <cylinderGeometry args={[3, 3.2, 0.3, 64]} />
        <meshStandardMaterial color="#2a1222" metalness={0.6} roughness={0.25} />
      </mesh>
      <mesh position={[0, -0.44, 0]} rotation-x={-Math.PI / 2}><ringGeometry args={[2.85, 2.95, 96]} /><meshBasicMaterial color={palette.gold} /></mesh>
      <group position={[0, 1.2, 0]}>
        <Float amp={0.15} speed={calm ? 0.4 : 1}><GlassHeart scale={0.8} glow={choice === "yes" ? 2.2 : calm ? 0.6 : 1} spin={calm ? 0.1 : 0.35} /></Float>
        {choice === "yes" && <PulseRings />}
      </group>
      {Array.from({ length: roses }, (_, i) => {
        const a = (i / roses) * Math.PI * 2;
        return <BloomRose key={i} bloom={choice === "yes" ? 1.1 : 0.6} position={[Math.cos(a) * 2.5, -0.25, Math.sin(a) * 2.5]} rotation={[-0.3, -a, 0]} />;
      })}
      {Array.from({ length: quality.low ? 3 : 6 }, (_, i) => <Butterfly key={i} seed={i} />)}
      {choice === "yes" && <Dust n={500} radius={6} color="#ffd58a" rise={1.2} size={0.07} />}
      <Dust n={300} rise={calm ? 0.01 : 0.05} />
      <ambientLight intensity={calm ? 0.2 : 0.35} />
      <spotLight position={[0, 7, 3]} intensity={calm ? 15 : 40} angle={0.6} penumbra={1} color="#ffd6c9" />
    </>
  );
}

function PulseRings() {
  const { clock } = useThree();
  const [born, setBorn] = useState<number[]>([]);
  useEffect(() => {
    const add = () => setBorn((b) => [...b.slice(-3), clock.elapsedTime]);
    add();
    const id = setInterval(add, 1800);
    return () => clearInterval(id);
  }, [clock]);
  return <group rotation-x={Math.PI / 2}>{born.map((b) => <Ring key={b} born={b} />)}</group>;
}
