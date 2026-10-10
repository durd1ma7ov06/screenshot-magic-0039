import * as THREE from "three";

export function heartXY(t: number) {
  const x = 16 * Math.pow(Math.sin(t), 3);
  const y = 13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t);
  return [x / 16, y / 16] as const;
}

export function heartShape(scale = 1) {
  const s = new THREE.Shape();
  const n = 80;
  for (let i = 0; i <= n; i++) {
    const [x, y] = heartXY((i / n) * Math.PI * 2);
    if (i === 0) s.moveTo(x * scale, y * scale);
    else s.lineTo(x * scale, y * scale);
  }
  return s;
}

export function heartGeometry(scale = 1, depth = 0.5) {
  const g = new THREE.ExtrudeGeometry(heartShape(scale), {
    depth, bevelEnabled: true, bevelThickness: 0.35 * scale, bevelSize: 0.25 * scale, bevelSegments: 8, curveSegments: 48,
  });
  g.center();
  g.computeVertexNormals();
  return g;
}

/** Points filling a 3D heart volume */
export function heartVolume(count: number, scale = 1) {
  const arr = new Float32Array(count * 3);
  for (let i = 0; i < count; i++) {
    const t = Math.random() * Math.PI * 2;
    const r = Math.sqrt(Math.random());
    const [x, y] = heartXY(t);
    const shell = Math.random() < 0.6 ? 1 : r;
    const zr = Math.sqrt(Math.max(0, 1 - shell * shell)) * 0.45 + 0.05;
    arr[i * 3] = x * shell * scale;
    arr[i * 3 + 1] = y * shell * scale + 0.15 * scale;
    arr[i * 3 + 2] = (Math.random() * 2 - 1) * zr * scale;
  }
  return arr;
}

export function randomSphere(count: number, radius: number, inner = 0) {
  const arr = new Float32Array(count * 3);
  for (let i = 0; i < count; i++) {
    const v = new THREE.Vector3().randomDirection().multiplyScalar(inner + Math.random() * (radius - inner));
    arr.set([v.x, v.y, v.z], i * 3);
  }
  return arr;
}

let glowTex: THREE.Texture | null = null;
export function glowTexture() {
  if (glowTex) return glowTex;
  const c = document.createElement("canvas");
  c.width = c.height = 64;
  const ctx = c.getContext("2d")!;
  const g = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
  g.addColorStop(0, "rgba(255,255,255,1)");
  g.addColorStop(0.25, "rgba(255,230,220,0.6)");
  g.addColorStop(1, "rgba(255,200,200,0)");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, 64, 64);
  glowTex = new THREE.CanvasTexture(c);
  return glowTex;
}

export function abstractArt(seed: number) {
  const c = document.createElement("canvas");
  c.width = 384; c.height = 512;
  const ctx = c.getContext("2d")!;
  const hues = [345, 330, 20, 300, 10, 280, 35];
  const h = hues[seed % hues.length];
  const bg = ctx.createLinearGradient(0, 0, 384, 512);
  bg.addColorStop(0, `hsl(${h},45%,14%)`);
  bg.addColorStop(1, `hsl(${(h + 40) % 360},40%,8%)`);
  ctx.fillStyle = bg; ctx.fillRect(0, 0, 384, 512);
  let r = seed * 9301 + 49297;
  const rnd = () => ((r = (r * 9301 + 49297) % 233280) / 233280);
  for (let i = 0; i < 14; i++) {
    const x = rnd() * 384, y = rnd() * 512, rad = 40 + rnd() * 160;
    const g = ctx.createRadialGradient(x, y, 0, x, y, rad);
    g.addColorStop(0, `hsla(${h + rnd() * 50 - 25},70%,${55 + rnd() * 20}%,0.55)`);
    g.addColorStop(1, "hsla(0,0%,0%,0)");
    ctx.globalCompositeOperation = "lighter";
    ctx.fillStyle = g; ctx.fillRect(0, 0, 384, 512);
  }
  ctx.globalCompositeOperation = "source-over";
  ctx.strokeStyle = "rgba(255,220,200,0.35)"; ctx.lineWidth = 1.5;
  for (let k = 0; k < 3; k++) {
    ctx.beginPath();
    for (let x = 0; x <= 384; x += 8) ctx.lineTo(x, 256 + Math.sin(x / 40 + seed + k) * (60 + k * 30) + k * 40 - 40);
    ctx.stroke();
  }
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}
