import { useFrame } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import * as THREE from "three";
import { count, motion } from "./common";
import { heartVolume, randomSphere } from "./shapes";

const vert = /* glsl */ `
  uniform float uTime; uniform float uMix; uniform float uSize; uniform float uPulse;
  attribute vec3 aFrom; attribute vec3 aTo; attribute float aRand;
  varying float vRand;
  void main(){
    vRand = aRand;
    float m = smoothstep(0.0, 1.0, clamp(uMix * 1.3 - aRand * 0.3, 0.0, 1.0));
    vec3 p = mix(aFrom, aTo, m);
    float beat = pow(abs(sin(uTime * 1.4)), 6.0) * uPulse;
    p *= 1.0 + beat * 0.06;
    p += 0.03 * vec3(sin(uTime + aRand * 30.0), cos(uTime * 0.8 + aRand * 20.0), sin(uTime * 0.6 + aRand * 10.0));
    vec4 mv = modelViewMatrix * vec4(p, 1.0);
    gl_PointSize = uSize * (0.6 + aRand) * (12.0 / -mv.z);
    gl_Position = projectionMatrix * mv;
  }`;
const frag = /* glsl */ `
  uniform vec3 uColorA; uniform vec3 uColorB; uniform float uAlpha;
  varying float vRand;
  void main(){
    float d = length(gl_PointCoord - 0.5);
    float a = smoothstep(0.5, 0.0, d);
    vec3 c = mix(uColorA, uColorB, vRand);
    gl_FragColor = vec4(c * (1.0 + a), a * uAlpha);
  }`;

/**
 * Particle cloud that morphs between "from" and "to" layouts.
 * `target` = 1 → heart formation, 0 → scattered.
 */
export function MorphParticles({
  n = 4000, scale = 2, target = 1, size = 1.6, colorA = "#ff8fa8", colorB = "#ffe2c4", pulse = 1, alpha = 1, scatterRadius = 9, speed = 1.2,
}: { n?: number; scale?: number; target?: number; size?: number; colorA?: string; colorB?: string; pulse?: number; alpha?: number; scatterRadius?: number; speed?: number }) {
  const total = count(n);
  const ref = useRef<THREE.Points>(null);
  const { geo, mat } = useMemo(() => {
    const g = new THREE.BufferGeometry();
    const to = heartVolume(total, scale);
    const from = randomSphere(total, scatterRadius, 2);
    const rand = new Float32Array(total).map(() => Math.random());
    g.setAttribute("position", new THREE.BufferAttribute(to.slice(), 3));
    g.setAttribute("aFrom", new THREE.BufferAttribute(from, 3));
    g.setAttribute("aTo", new THREE.BufferAttribute(to, 3));
    g.setAttribute("aRand", new THREE.BufferAttribute(rand, 1));
    const m = new THREE.ShaderMaterial({
      vertexShader: vert, fragmentShader: frag, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
      uniforms: {
        uTime: { value: 0 }, uMix: { value: 0 }, uSize: { value: size }, uPulse: { value: pulse }, uAlpha: { value: alpha },
        uColorA: { value: new THREE.Color(colorA) }, uColorB: { value: new THREE.Color(colorB) },
      },
    });
    return { geo: g, mat: m };
  }, [total, scale, scatterRadius]); // eslint-disable-line react-hooks/exhaustive-deps

  useFrame((st, d) => {
    const dt = Math.min(d, 0.05);
    mat.uniforms.uTime.value = st.clock.elapsedTime * motion;
    mat.uniforms.uMix.value += (target - mat.uniforms.uMix.value) * (1 - Math.exp(-speed * dt));
    mat.uniforms.uAlpha.value += (alpha - mat.uniforms.uAlpha.value) * (1 - Math.exp(-2 * dt));
    mat.uniforms.uPulse.value = pulse;
    (mat.uniforms.uColorA.value as THREE.Color).lerp(new THREE.Color(colorA), dt);
  });
  return <points ref={ref} geometry={geo} material={mat} frustumCulled={false} />;
}

/** Simple ambient dust */
export function Dust({ n = 600, radius = 14, color = "#ffd9c7", size = 0.05, rise = 0.05 }: { n?: number; radius?: number; color?: string; size?: number; rise?: number }) {
  const total = count(n);
  const ref = useRef<THREE.Points>(null);
  const geo = useMemo(() => {
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.BufferAttribute(randomSphere(total, radius), 3));
    return g;
  }, [total, radius]);
  useFrame((_, d) => {
    if (!ref.current) return;
    const dt = Math.min(d, 0.05) * motion;
    ref.current.rotation.y += dt * 0.02;
    const pos = geo.attributes.position as THREE.BufferAttribute;
    for (let i = 0; i < total; i++) {
      let y = pos.getY(i) + rise * dt * (1 + (i % 5) * 0.3);
      if (y > radius * 0.6) y = -radius * 0.6;
      pos.setY(i, y);
    }
    pos.needsUpdate = true;
  });
  return (
    <points ref={ref} geometry={geo}>
      <pointsMaterial color={color} size={size} transparent opacity={0.8} depthWrite={false} blending={THREE.AdditiveBlending} sizeAttenuation />
    </points>
  );
}
