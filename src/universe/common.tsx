import { useFrame, useThree } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import * as THREE from "three";
import { heartGeometry } from "./shapes";

export const palette = {
  burgundy: "#5a0f24",
  plum: "#1a0b26",
  blush: "#f4b6c2",
  ivory: "#fff4e6",
  rose: "#e8a598",
  gold: "#f2c48d",
};

export const quality = {
  low: typeof window !== "undefined" && (window.innerWidth < 768 || (navigator.hardwareConcurrency ?? 8) <= 4),
  reduced: typeof window !== "undefined" && window.matchMedia?.("(prefers-reduced-motion: reduce)").matches,
};
export const count = (n: number) => Math.round(n * (quality.low ? 0.45 : 1) * (quality.reduced ? 0.6 : 1));
export const motion = quality.reduced ? 0.3 : 1;

/** Camera that eases toward a target + mouse parallax */
export function CameraRig({ position, lookAt, strength = 0.6 }: { position: [number, number, number]; lookAt: [number, number, number]; strength?: number }) {
  const { camera, pointer } = useThree();
  const look = useRef(new THREE.Vector3(...lookAt));
  useFrame((_, d) => {
    const dt = Math.min(d, 0.05);
    const k = 1 - Math.exp(-1.6 * dt);
    const tx = position[0] + pointer.x * strength * motion;
    const ty = position[1] + pointer.y * strength * 0.5 * motion;
    camera.position.lerp(new THREE.Vector3(tx, ty, position[2]), k);
    look.current.lerp(new THREE.Vector3(...lookAt), k);
    camera.lookAt(look.current);
  });
  return null;
}

/** Instanced drifting rose petals */
export function Petals({ n = 120, spread = 14, color = palette.rose, fall = 0.3 }: { n?: number; spread?: number; color?: string; fall?: number }) {
  const ref = useRef<THREE.InstancedMesh>(null);
  const total = count(n);
  const geo = useMemo(() => {
    const g = new THREE.SphereGeometry(0.12, 10, 6, 0, Math.PI * 0.8, 0, Math.PI * 0.6);
    g.scale(1, 1.3, 0.5);
    return g;
  }, []);
  const data = useMemo(
    () => Array.from({ length: total }, () => ({
      p: new THREE.Vector3((Math.random() - 0.5) * spread, (Math.random() - 0.5) * spread * 0.7, (Math.random() - 0.5) * spread),
      r: new THREE.Euler(Math.random() * 6, Math.random() * 6, Math.random() * 6),
      s: 0.6 + Math.random() * 0.8, sp: 0.4 + Math.random(),
    })), [total, spread]);
  const dummy = useMemo(() => new THREE.Object3D(), []);
  useFrame((st, d) => {
    const dt = Math.min(d, 0.05) * motion;
    const t = st.clock.elapsedTime;
    data.forEach((o, i) => {
      o.p.y -= fall * o.sp * dt;
      o.p.x += Math.sin(t * 0.5 + i) * 0.15 * dt;
      if (o.p.y < -spread * 0.35) o.p.y = spread * 0.35;
      o.r.x += dt * o.sp; o.r.z += dt * 0.6;
      dummy.position.copy(o.p); dummy.rotation.copy(o.r); dummy.scale.setScalar(o.s);
      dummy.updateMatrix();
      ref.current?.setMatrixAt(i, dummy.matrix);
    });
    if (ref.current) ref.current.instanceMatrix.needsUpdate = true;
  });
  return (
    <instancedMesh ref={ref} args={[geo, undefined, total]}>
      <meshStandardMaterial color={color} roughness={0.55} side={THREE.DoubleSide} emissive={palette.burgundy} emissiveIntensity={0.25} />
    </instancedMesh>
  );
}

/** Translucent crystal heart with inner glow */
export function GlassHeart({ scale = 1, glow = 1, spin = 0.3 }: { scale?: number; glow?: number; spin?: number }) {
  const ref = useRef<THREE.Group>(null);
  const geo = useMemo(() => heartGeometry(1, 0.45), []);
  const inner = useMemo(() => heartGeometry(0.45, 0.2), []);
  useFrame((st, d) => {
    if (!ref.current) return;
    ref.current.rotation.y += Math.min(d, 0.05) * spin * motion;
    const b = 1 + Math.sin(st.clock.elapsedTime * 1.6) * 0.025 * motion;
    ref.current.scale.setScalar(scale * b);
  });
  return (
    <group ref={ref}>
      <mesh geometry={geo} rotation={[0, 0, 0]}>
        <meshPhysicalMaterial
          color={palette.blush} transmission={0.92} thickness={1.2} roughness={0.08} ior={1.45}
          clearcoat={1} clearcoatRoughness={0.05} attenuationColor="#ff7f9b" attenuationDistance={1.5}
          emissive="#ff6f8e" emissiveIntensity={0.08 * glow} transparent opacity={0.95}
        />
      </mesh>
      <mesh geometry={inner}>
        <meshBasicMaterial color="#ffd6c8" transparent opacity={0.55 * glow} />
      </mesh>
      <pointLight color="#ff9fae" intensity={6 * glow} distance={8} />
    </group>
  );
}

/** One procedural rose (petal spiral + stem + leaves) */
const petalGeo = (() => {
  const g = new THREE.SphereGeometry(0.22, 14, 10, 0, Math.PI * 0.9, 0, Math.PI * 0.55);
  g.translate(0, -0.05, 0);
  return g;
})();
export function Rose({ color = "#8c1630", bloom = 1, stem = true }: { color?: string; bloom?: number; stem?: boolean }) {
  const petals = useMemo(() => {
    const out: { rot: [number, number, number]; s: number; y: number }[] = [];
    for (let i = 0; i < 18; i++) {
      const ring = i / 18;
      out.push({ rot: [0, i * 2.4, 0], s: 0.45 + ring * 0.8, y: 0.05 - ring * 0.08 });
    }
    return out;
  }, []);
  const stemGeo = useMemo(() => {
    const c = new THREE.CatmullRomCurve3([
      new THREE.Vector3(0, 0, 0), new THREE.Vector3(0.08, -0.6, 0.05), new THREE.Vector3(-0.06, -1.3, 0), new THREE.Vector3(0.05, -2.1, -0.04),
    ]);
    return new THREE.TubeGeometry(c, 24, 0.025, 6);
  }, []);
  return (
    <group>
      {petals.map((p, i) => (
        <group key={i} rotation={p.rot} position={[0, p.y, 0]}>
          <mesh geometry={petalGeo} scale={p.s} rotation={[-0.25 - (i / 18) * 0.9 * bloom, 0, 0]}>
            <meshStandardMaterial color={color} roughness={0.5} side={THREE.DoubleSide} emissive={color} emissiveIntensity={0.12} />
          </mesh>
        </group>
      ))}
      {stem && (
        <>
          <mesh geometry={stemGeo}><meshStandardMaterial color="#2f4a2a" roughness={0.8} /></mesh>
          {[-0.7, -1.3].map((y, i) => (
            <mesh key={i} position={[i ? -0.15 : 0.15, y, 0]} rotation={[0.3, 0, i ? 0.9 : -0.9]} scale={[0.12, 0.25, 0.04]}>
              <sphereGeometry args={[1, 10, 8]} />
              <meshStandardMaterial color="#3e5f35" roughness={0.7} />
            </mesh>
          ))}
        </>
      )}
    </group>
  );
}

export function Float({ children, speed = 1, amp = 0.15, offset = 0 }: { children: React.ReactNode; speed?: number; amp?: number; offset?: number }) {
  const ref = useRef<THREE.Group>(null);
  useFrame((st) => {
    if (!ref.current) return;
    const t = st.clock.elapsedTime * speed * motion + offset;
    ref.current.position.y = Math.sin(t) * amp;
    ref.current.rotation.z = Math.sin(t * 0.7) * 0.05;
  });
  return <group ref={ref}>{children}</group>;
}
