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

export function letterPShape(scale = 1) {
  const s = new THREE.Shape();
  // Outer boundary of letter P
  s.moveTo(-0.25 * scale, -0.6 * scale);
  s.lineTo(-0.25 * scale, 0.6 * scale);
  s.lineTo(0.12 * scale, 0.6 * scale);
  s.bezierCurveTo(0.48 * scale, 0.6 * scale, 0.48 * scale, 0.0 * scale, 0.12 * scale, 0.0 * scale);
  s.lineTo(-0.06 * scale, 0.0 * scale);
  s.lineTo(-0.06 * scale, -0.6 * scale);
  s.closePath();

  // Inner counter hole of P
  const hole = new THREE.Path();
  hole.moveTo(-0.06 * scale, 0.16 * scale);
  hole.lineTo(0.1 * scale, 0.16 * scale);
  hole.bezierCurveTo(0.26 * scale, 0.16 * scale, 0.26 * scale, 0.44 * scale, 0.1 * scale, 0.44 * scale);
  hole.lineTo(-0.06 * scale, 0.44 * scale);
  hole.closePath();
  s.holes.push(hole);

  return s;
}

/** Star points forming the constellation letter 'P' */
export function letterPPoints(scale = 1.3, offset: [number, number, number] = [0, 2.6, -6]) {
  return [
    new THREE.Vector3(-0.35 * scale + offset[0], -0.65 * scale + offset[1], offset[2]),
    new THREE.Vector3(-0.35 * scale + offset[0], -0.1 * scale + offset[1], offset[2]),
    new THREE.Vector3(-0.35 * scale + offset[0], 0.55 * scale + offset[1], offset[2]),
    new THREE.Vector3(0.05 * scale + offset[0], 0.55 * scale + offset[1], offset[2]),
    new THREE.Vector3(0.38 * scale + offset[0], 0.32 * scale + offset[1], offset[2]),
    new THREE.Vector3(0.05 * scale + offset[0], 0.08 * scale + offset[1], offset[2]),
    new THREE.Vector3(-0.35 * scale + offset[0], 0.08 * scale + offset[1], offset[2]),
  ];
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
  c.width = 420;
  c.height = 560;
  const ctx = c.getContext("2d")!;

  // Dreamy celestial palettes
  const palettes = [
    { bg1: "#1d0728", bg2: "#4a0e35", accent: "#ffb3c6", gold: "#ffd79e", label: "Parizodam bilan ilk tabassum" },
    { bg1: "#0b1028", bg2: "#2d164d", accent: "#9ac5ff", gold: "#ffd4aa", label: "Ko‘zlaringdagi sehr" },
    { bg1: "#280718", bg2: "#571832", accent: "#ff8fa8", gold: "#ffdfa9", label: "Birga yurgan yo‘limiz" },
    { bg1: "#13082a", bg2: "#381a52", accent: "#d5a4ff", gold: "#ffe6b3", label: "Samimiy kulgularimiz" },
    { bg1: "#071724", bg2: "#19354a", accent: "#a8e6cf", gold: "#ffd3b6", label: "Sokin lahzalar" },
    { bg1: "#22081f", bg2: "#6b1442", accent: "#ff9ebe", gold: "#ffebbb", label: "Bizning taronamiz" },
    { bg1: "#1b0a2a", bg2: "#481545", accent: "#fca3cc", gold: "#ffd599", label: "Porloq kelajak" },
  ];

  const p = palettes[(seed - 1 + palettes.length) % palettes.length]!;

  // Deep starlit gradient
  const bg = ctx.createRadialGradient(210, 200, 40, 210, 280, 360);
  bg.addColorStop(0, p.bg2);
  bg.addColorStop(1, p.bg1);
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, 420, 560);

  // Soft glowing aurora or nebula clouds
  for (let i = 0; i < 9; i++) {
    const rx = 100 + ((seed * 73 + i * 97) % 240);
    const ry = 120 + ((seed * 47 + i * 83) % 300);
    const rad = 70 + ((seed * 31 + i * 41) % 110);
    const g = ctx.createRadialGradient(rx, ry, 0, rx, ry, rad);
    g.addColorStop(0, i % 2 === 0 ? "rgba(255, 179, 198, 0.35)" : "rgba(255, 215, 158, 0.28)");
    g.addColorStop(1, "rgba(0,0,0,0)");
    ctx.globalCompositeOperation = "screen";
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.arc(rx, ry, rad, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.globalCompositeOperation = "source-over";

  // Sparkling golden stars
  let r = seed * 19301 + 49297;
  const rnd = () => ((r = (r * 19301 + 49297) % 233280) / 233280);
  for (let i = 0; i < 60; i++) {
    const sx = rnd() * 420;
    const sy = rnd() * 560;
    const sz = rnd() * 2.2 + 0.5;
    ctx.fillStyle = rnd() > 0.4 ? p.gold : p.accent;
    ctx.beginPath();
    ctx.arc(sx, sy, sz, 0, Math.PI * 2);
    ctx.fill();
  }

  // Romantic central emblem (crescent or heart silhouette)
  ctx.save();
  ctx.translate(210, 250);
  const heartGrad = ctx.createLinearGradient(-60, -60, 60, 60);
  heartGrad.addColorStop(0, p.accent);
  heartGrad.addColorStop(1, p.gold);

  ctx.strokeStyle = "rgba(255, 220, 180, 0.5)";
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  for (let t = 0; t <= Math.PI * 2; t += 0.05) {
    const hx = 16 * Math.pow(Math.sin(t), 3) * 4.2;
    const hy = -(13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t)) * 4.2;
    if (t === 0) ctx.moveTo(hx, hy);
    else ctx.lineTo(hx, hy);
  }
  ctx.stroke();

  // Gentle monogram "P" in the heart center
  ctx.fillStyle = "rgba(255, 245, 235, 0.85)";
  ctx.font = "italic 32px 'Cormorant Garamond', serif";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText("P", 0, -4);

  ctx.restore();

  // Subtle golden decorative vintage border
  ctx.strokeStyle = "rgba(255, 215, 160, 0.35)";
  ctx.lineWidth = 1.2;
  ctx.strokeRect(18, 18, 384, 524);
  ctx.strokeStyle = "rgba(255, 215, 160, 0.15)";
  ctx.strokeRect(24, 24, 372, 512);

  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}
