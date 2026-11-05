import React, { useMemo } from "react";
import * as THREE from "three";
import { rng } from "../kit3d/World";
import { FloatingIsland, Halo, SkyDome } from "../kit3d/sky";
import { GlowGarden, Motes } from "../kit3d/magic";
import { Cloud } from "../ep10/world";

// Episode 15: the Floating Flower Garden. Flower islands float above a huge crystal lake; crystal waterfalls
// pour from the islands; giant flowers, butterflies and pollen motes. Under the lake is the Bloom Crystal's
// chamber. `bloom` (0..1) is the garden's magic: pale, closing flowers, still water and few butterflies at
// low values, full colour and life at 1. Everything depends only on props, so every render of a frame is identical.

export type V3 = [number, number, number];
const TAU = Math.PI * 2;

// ---------- places (world units; Lumi is about 1.3 tall) ----------
export const LAKE_Y = -9;
export const MEADOW: V3 = [0, 0, 0]; // the arrival island (scenes 1, 2, 6)
export const MEADOW_R = 8.5;
export const GIANTS: V3 = [17, 1.2, -15]; // the island of giant flowers (scene 3)
export const GIANTS_R = 7;
/** islands drift outward from the middle while the magic fades */
export const awayFrom = (p: V3, drift: number, k: number): V3 => {
  const len = Math.hypot(p[0], p[2]) || 1;
  return [p[0] + (p[0] / len) * drift * k, p[1] - drift * k * 0.15, p[2] + (p[2] / len) * drift * k];
};
export const giantsCenter = (drift: number) => awayFrom(GIANTS, drift, 4);
export const PAD: V3 = [-4, LAKE_Y + 0.08, -36]; // the great lily pad on the lake, with the flower gate (scene 4)
export const PAD_R = 6;
export const GATE: V3 = [PAD[0], PAD[1], PAD[2] - 3.6]; // the gate arch stands here, facing +z
export const GATE_W = 2.6; // half-width of the arch
export const GATE_H = 4.6;
/** the four flower sockets on the gate pedestal (pink, yellow, blue, purple), left to right */
export const socketAt = (i: number): V3 => [GATE[0] - 1.5 + i * 1.0, GATE[1] + 1.15, GATE[2] + 1.15];
/** the four carvings on the arch that glow in order */
export const carveAt = (i: number): V3 => {
  const a = Math.PI * (0.82 - i * 0.213);
  return [GATE[0] + Math.cos(a) * GATE_W, GATE[1] + GATE_H - 1.0 + Math.sin(a) * 1.0, GATE[2] + 0.25];
};
export const ORB_COLORS = ["#ff7ac0", "#ffd84a", "#6ac8ff", "#b47aff"];
/** stepping lily pads from the meadow to the giants' island */
export const stepAt = (i: number): V3 => {
  const k = (i + 1) / 6;
  const a: V3 = [6.2, -0.1, -4.6];
  const b: V3 = [GIANTS[0] - 5.4, GIANTS[1] - 0.1, GIANTS[2] + 3.6];
  return [a[0] + (b[0] - a[0]) * k, a[1] + (b[1] - a[1]) * k + Math.sin(k * Math.PI) * 0.5, a[2] + (b[2] - a[2]) * k + Math.sin(k * Math.PI * 2) * 0.6];
};
export const STEPS = 5;
// the crystal chamber under the lake (its own room, centred at the origin)
export const CRYSTAL: V3 = [0, 1.3, -4];
export const pedestalAt = (i: number): V3 => {
  const a = Math.PI * (0.15 + i * 0.233) + Math.PI;
  return [CRYSTAL[0] + Math.cos(a) * 2.4, 0.62, CRYSTAL[2] - Math.sin(a) * 1.4];
};

// ---------- helpers ----------
const canvasTex = (w: number, h: number, draw: (x: CanvasRenderingContext2D) => void, repeat: [number, number] = [1, 1]) => {
  const c = document.createElement("canvas");
  c.width = w;
  c.height = h;
  draw(c.getContext("2d")!);
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(...repeat);
  tex.anisotropy = 8;
  return tex;
};
const GREY = new THREE.Color("#b8b4c2");
/** a colour faded toward a soft grey while the garden's magic is weak */
export const live = (c: string, bloom: number, floor = 0.25) => new THREE.Color(c).lerp(GREY, (1 - bloom) * (1 - floor));
const lit = (c: string, k: number) => new THREE.Color(c).multiplyScalar(k);

const meadowTex = (seed: number, base: string, dots: string[]) =>
  canvasTex(1024, 1024, (x) => {
    const r = rng(seed);
    x.fillStyle = base;
    x.fillRect(0, 0, 1024, 1024);
    // soft mottling
    for (let i = 0; i < 260; i++) {
      x.fillStyle = `rgba(${r() > 0.5 ? "255,255,220" : "40,110,70"},${0.05 + r() * 0.06})`;
      x.beginPath();
      x.arc(r() * 1024, r() * 1024, 20 + r() * 70, 0, TAU);
      x.fill();
    }
    // grass strokes
    for (let i = 0; i < 2600; i++) {
      const px = r() * 1024;
      const py = r() * 1024;
      x.strokeStyle = `rgba(${r() > 0.5 ? "60,140,80" : "160,230,150"},${0.25 + r() * 0.3})`;
      x.lineWidth = 2;
      x.beginPath();
      x.moveTo(px, py);
      x.lineTo(px + (r() - 0.5) * 6, py - 8 - r() * 8);
      x.stroke();
    }
    // tiny flowers
    for (let i = 0; i < 420; i++) {
      const px = r() * 1024;
      const py = r() * 1024;
      const c = dots[Math.floor(r() * dots.length)];
      x.fillStyle = c;
      for (let k = 0; k < 5; k++) {
        const a = (k / 5) * TAU;
        x.beginPath();
        x.arc(px + Math.cos(a) * 4, py + Math.sin(a) * 4, 3.4, 0, TAU);
        x.fill();
      }
      x.fillStyle = "#fff6b0";
      x.beginPath();
      x.arc(px, py, 2.4, 0, TAU);
      x.fill();
    }
  }, [3, 3]);

const padTex = () =>
  canvasTex(1024, 1024, (x) => {
    const g = x.createRadialGradient(512, 512, 40, 512, 512, 512);
    g.addColorStop(0, "#c8f0a0");
    g.addColorStop(0.7, "#7ccf7a");
    g.addColorStop(1, "#4fa868");
    x.fillStyle = g;
    x.fillRect(0, 0, 1024, 1024);
    x.strokeStyle = "rgba(230,255,200,0.55)";
    x.lineWidth = 6;
    for (let i = 0; i < 18; i++) {
      const a = (i / 18) * TAU;
      x.beginPath();
      x.moveTo(512, 512);
      x.quadraticCurveTo(512 + Math.cos(a + 0.15) * 260, 512 + Math.sin(a + 0.15) * 260, 512 + Math.cos(a) * 500, 512 + Math.sin(a) * 500);
      x.stroke();
    }
    const r = rng(5);
    for (let i = 0; i < 160; i++) {
      x.fillStyle = `rgba(255,255,255,${0.05 + r() * 0.08})`;
      x.beginPath();
      x.arc(r() * 1024, r() * 1024, 4 + r() * 16, 0, TAU);
      x.fill();
    }
  });

const mossTex = () =>
  canvasTex(1024, 1024, (x) => {
    const r = rng(31);
    x.fillStyle = "#3f7a6a";
    x.fillRect(0, 0, 1024, 1024);
    for (let i = 0; i < 900; i++) {
      x.fillStyle = `rgba(${r() > 0.5 ? "120,200,160" : "30,80,70"},${0.12 + r() * 0.2})`;
      x.beginPath();
      x.arc(r() * 1024, r() * 1024, 6 + r() * 30, 0, TAU);
      x.fill();
    }
    // a ring of pale stones around the middle
    for (let i = 0; i < 28; i++) {
      const a = (i / 28) * TAU;
      x.fillStyle = "rgba(220,235,240,0.8)";
      x.beginPath();
      x.ellipse(512 + Math.cos(a) * 300, 512 + Math.sin(a) * 300, 34, 22, a, 0, TAU);
      x.fill();
    }
  }, [1, 1]);

const wingTex = () =>
  canvasTex(256, 256, (x) => {
    x.clearRect(0, 0, 256, 256);
    const g = x.createLinearGradient(0, 0, 256, 256);
    g.addColorStop(0, "#ffffff");
    g.addColorStop(1, "#d8d8d8");
    x.fillStyle = g;
    x.beginPath();
    x.moveTo(8, 128);
    x.bezierCurveTo(30, 10, 200, -10, 240, 60);
    x.bezierCurveTo(250, 110, 150, 128, 8, 128);
    x.moveTo(8, 128);
    x.bezierCurveTo(60, 140, 200, 170, 190, 220);
    x.bezierCurveTo(170, 250, 60, 220, 8, 128);
    x.fill();
    x.fillStyle = "rgba(60,30,80,0.5)";
    x.beginPath();
    x.arc(170, 60, 18, 0, TAU);
    x.arc(130, 190, 12, 0, TAU);
    x.fill();
  });

// ---------- sky ----------
export const GardenSky: React.FC<{ t: number; bloom: number }> = ({ t, bloom }) => {
  const top = new THREE.Color("#a8b4d0").lerp(new THREE.Color("#6aa8ff"), bloom).getStyle();
  const mid = new THREE.Color("#d8c8dc").lerp(new THREE.Color("#ffc4e4"), bloom).getStyle();
  const low = new THREE.Color("#e8dcd4").lerp(new THREE.Color("#ffe6c4"), bloom).getStyle();
  return (
    <>
      <SkyDome t={t} top={top} mid={mid} low={low} moonDir={[0.5, 0.22, -0.84]} moonTint="#fff2c8" />
      <Halo position={[0.5 * 400, 0.22 * 400, -0.84 * 400]} size={180} color="#fff0c8" opacity={0.45 + bloom * 0.3} />
      {[
        [-60, 14, -120, 9],
        [70, 20, -140, 11],
        [-110, 6, -60, 8],
        [120, 8, -40, 9],
        [10, 26, -170, 12],
        [-40, 4, 60, 7],
        [80, 2, 40, 8],
      ].map(([x, y, z, s], i) => (
        <Cloud key={i} position={[x, y, z]} size={s} seed={1500 + i} t={t} flat={0.45} glow={0.25 + bloom * 0.15} tint="#fff8fc" />
      ))}
    </>
  );
};

// ---------- the crystal lake ----------
const LAKE_VERT = /* glsl */ `varying vec3 vW; void main(){ vec4 w = modelMatrix * vec4(position, 1.0); vW = w.xyz; gl_Position = projectionMatrix * viewMatrix * w; }`;
const LAKE_FRAG = /* glsl */ `
uniform float uT; uniform float uWaves; uniform float uBloom; uniform vec3 uDeep; uniform vec3 uShallow; uniform vec3 uSky; uniform vec3 uTint;
varying vec3 vW;
float hash(vec2 p){ return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
float noise(vec2 p){ vec2 i = floor(p); vec2 f = fract(p); f = f*f*(3.0-2.0*f);
  return mix(mix(hash(i), hash(i+vec2(1,0)), f.x), mix(hash(i+vec2(0,1)), hash(i+vec2(1,1)), f.x), f.y); }
void main(){
  vec3 v = normalize(cameraPosition - vW);
  float fres = pow(1.0 - max(v.y, 0.0), 2.6);
  float d = length(vW.xz - vec2(0.0, -20.0));
  vec3 base = mix(uShallow, uDeep, smoothstep(10.0, 90.0, d));
  vec2 p = vW.xz;
  float n1 = noise(p * 0.32 + vec2(uT * 0.18, uT * 0.07));
  float n2 = noise(p * 0.9 - vec2(uT * 0.25, -uT * 0.15));
  float waves = (n1 * 0.6 + n2 * 0.4);
  vec3 c = mix(base, uSky, clamp(fres * 0.85 + (waves - 0.5) * 0.25 * uWaves, 0.0, 1.0));
  // rings of gentle magic waves spreading from the middle of the lake
  float ring = 0.5 + 0.5 * sin(d * 1.3 - uT * 2.2);
  c += uTint * pow(ring, 10.0) * 0.18 * uWaves * smoothstep(80.0, 10.0, d);
  // sparkles: bright glints on the wave crests
  float g = noise(p * 3.5 + vec2(uT * 0.8, -uT * 0.6)) * noise(p * 5.0 - uT * 0.5);
  c += vec3(1.0, 0.98, 0.9) * pow(g, 6.0) * 9.0 * (0.25 + uWaves);
  float grey = dot(c, vec3(0.299, 0.587, 0.114));
  c = mix(vec3(grey) * vec3(0.95, 0.97, 1.0), c, 0.35 + 0.65 * uBloom);
  gl_FragColor = vec4(c, 1.0);
}`;
export const CrystalLake: React.FC<{ t: number; bloom: number; waves: number }> = ({ t, bloom, waves }) => {
  const uniforms = useMemo(
    () => ({
      uT: { value: 0 },
      uWaves: { value: 0 },
      uBloom: { value: 0 },
      uDeep: { value: new THREE.Color("#1a6a9a") },
      uShallow: { value: new THREE.Color("#5ad8e0") },
      uSky: { value: new THREE.Color("#ffe8f4") },
      uTint: { value: new THREE.Color("#ffb8ff") },
    }),
    [],
  );
  uniforms.uT.value = t;
  uniforms.uWaves.value = waves;
  uniforms.uBloom.value = bloom;
  return (
    <mesh position={[0, LAKE_Y, -20]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
      <circleGeometry args={[300, 96]} />
      <shaderMaterial vertexShader={LAKE_VERT} fragmentShader={LAKE_FRAG} uniforms={uniforms} />
    </mesh>
  );
};

// ---------- a crystal waterfall from an island edge to the lake ----------
const FALL_VERT = /* glsl */ `varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`;
const FALL_FRAG = /* glsl */ `
uniform float uT; uniform float uFlow; uniform float uBloom; varying vec2 vUv;
float hash(vec2 p){ return fract(sin(dot(p, vec2(41.3, 289.1))) * 43758.5453); }
float noise(vec2 p){ vec2 i = floor(p); vec2 f = fract(p); f = f*f*(3.0-2.0*f);
  return mix(mix(hash(i), hash(i+vec2(1,0)), f.x), mix(hash(i+vec2(0,1)), hash(i+vec2(1,1)), f.x), f.y); }
void main(){
  float edge = smoothstep(0.0, 0.18, vUv.x) * smoothstep(1.0, 0.82, vUv.x);
  float fall = uT * (0.25 + 1.6 * uFlow);
  float s = noise(vec2(vUv.x * 18.0, vUv.y * 4.0 + fall * 3.0)) * 0.6 + noise(vec2(vUv.x * 40.0, vUv.y * 9.0 + fall * 5.0)) * 0.4;
  float streak = smoothstep(0.35, 0.85, s);
  vec3 c = mix(vec3(0.55, 0.85, 1.0), vec3(1.0), streak);
  c = mix(vec3(0.75, 0.78, 0.85), c, 0.4 + 0.6 * uBloom);
  float a = edge * (0.25 + 0.55 * streak) * (0.35 + 0.65 * uFlow) * smoothstep(0.0, 0.08, vUv.y);
  gl_FragColor = vec4(c * (1.1 + 0.5 * uFlow), a);
}`;
export const Waterfall: React.FC<{ position: V3; rotY: number; width: number; height: number; t: number; flow: number; bloom: number }> = ({ position, rotY, width, height, t, flow, bloom }) => {
  const uniforms = useMemo(() => ({ uT: { value: 0 }, uFlow: { value: 0 }, uBloom: { value: 0 } }), []);
  uniforms.uT.value = t;
  uniforms.uFlow.value = flow;
  uniforms.uBloom.value = bloom;
  return (
    <group position={position} rotation={[0, rotY, 0]}>
      <mesh position={[0, -height / 2, 0]}>
        <planeGeometry args={[width, height, 1, 1]} />
        <shaderMaterial vertexShader={FALL_VERT} fragmentShader={FALL_FRAG} uniforms={uniforms} transparent depthWrite={false} side={THREE.DoubleSide} toneMapped={false} />
      </mesh>
      {/* mist where it meets the lake */}
      {flow > 0.05 &&
        [0, 1, 2].map((i) => (
          <mesh key={i} position={[(i - 1) * width * 0.3, -height + 0.3, 0.3]} scale={(0.8 + 0.25 * Math.sin(t * 2 + i)) * width * 0.35 * flow}>
            <sphereGeometry args={[1, 12, 8]} />
            <meshBasicMaterial color="#ffffff" transparent opacity={0.22} depthWrite={false} />
          </mesh>
        ))}
    </group>
  );
};

// ---------- a giant flower ----------
const PETAL_GEO = new THREE.SphereGeometry(1, 18, 12);
export const GiantFlower3D: React.FC<{ position: V3; t: number; open: number; bloom: number; color: string; inner?: string; size?: number; stem?: number; petals?: number; rotY?: number; tilt?: number; seed?: number }> = ({
  position,
  t,
  open,
  bloom,
  color,
  inner = "#fff4fa",
  size = 1,
  stem = 1.6,
  petals = 8,
  rotY = 0,
  tilt = 0.5,
  seed = 0,
}) => {
  const c = live(color, bloom, 0.5);
  const ci = live(inner, bloom, 0.5);
  const glow = 0.3 + 0.5 * bloom;
  const sway = Math.sin(t * 0.9 + seed) * 0.04;
  const lift = (1 - open) * 1.25 + 0.12;
  return (
    <group position={position} rotation={[0, rotY, sway]}>
      <mesh position={[0, stem / 2, 0]} castShadow>
        <cylinderGeometry args={[0.07 * size, 0.11 * size, stem, 8]} />
        <meshStandardMaterial color={live("#5fbf7f", bloom, 0.4)} roughness={0.7} />
      </mesh>
      {[-1, 1].map((s) => (
        <mesh key={s} position={[s * 0.32 * size, stem * 0.35, 0]} rotation={[0, 0, s * -0.85]} scale={[0.42 * size, 0.07 * size, 0.2 * size]} castShadow>
          <sphereGeometry args={[1, 14, 10]} />
          <meshStandardMaterial color={live("#6ad08c", bloom, 0.4)} roughness={0.7} />
        </mesh>
      ))}
      <group position={[0, stem, 0]} rotation={[tilt, 0, 0]} scale={size}>
        {Array.from({ length: petals }, (_, i) => (
          <group key={i} rotation={[0, (i / petals) * TAU + seed, 0]}>
            <group rotation={[-lift - Math.sin(t * 1.3 + i + seed) * 0.03, 0, 0]}>
              <mesh geometry={PETAL_GEO} position={[0, 0, 0.62]} scale={[0.34, 0.06, 0.66]} castShadow>
                <meshStandardMaterial color={c} emissive={c} emissiveIntensity={glow * 0.6} roughness={0.5} side={THREE.DoubleSide} />
              </mesh>
            </group>
          </group>
        ))}
        {Array.from({ length: Math.max(5, petals - 3) }, (_, i) => (
          <group key={`i${i}`} rotation={[0, (i / Math.max(5, petals - 3)) * TAU + seed + 0.4, 0]}>
            <group rotation={[-lift - 0.35, 0, 0]}>
              <mesh geometry={PETAL_GEO} position={[0, 0.05, 0.36]} scale={[0.22, 0.05, 0.4]}>
                <meshStandardMaterial color={ci} emissive={ci} emissiveIntensity={glow * 0.5} roughness={0.5} side={THREE.DoubleSide} />
              </mesh>
            </group>
          </group>
        ))}
        <mesh position={[0, 0.08, 0]}>
          <sphereGeometry args={[0.2, 16, 12]} />
          <meshBasicMaterial color={lit("#fff0a0", 0.7 + bloom * 1.3)} toneMapped={false} />
        </mesh>
      </group>
    </group>
  );
};

// ---------- butterflies ----------
export const Butterflies: React.FC<{ t: number; center: V3; radius: number; count: number; amount: number; seed?: number; height?: number }> = ({ t, center, radius, count, amount, seed = 1, height = 2.5 }) => {
  const tex = useMemo(() => wingTex(), []);
  const items = useMemo(() => {
    const r = rng(seed);
    const cols = ["#ff9ad8", "#ffd060", "#8ad8ff", "#c8a0ff", "#8affc8", "#ffb08a"];
    return Array.from({ length: count }, () => ({ a: r() * TAU, r: radius * (0.3 + r() * 0.7), h: 0.6 + r() * height, sp: (0.15 + r() * 0.25) * (r() > 0.5 ? 1 : -1), ph: r() * 6.28, c: cols[Math.floor(r() * cols.length)], s: 0.16 + r() * 0.12, k: r() }));
  }, [count, radius, seed, height]);
  return (
    <group position={center}>
      {items.map((b, i) => {
        const vis = Math.max(0, Math.min(1, (amount - b.k) * 6));
        if (vis <= 0.01) return null;
        const a = b.a + t * b.sp;
        const flap = Math.sin(t * 14 + b.ph) * 1.0;
        const pos: V3 = [Math.cos(a) * b.r, b.h + Math.sin(t * 1.7 + b.ph) * 0.3, Math.sin(a) * b.r];
        const col = lit(b.c, 1.1);
        return (
          <group key={i} position={pos} rotation={[0.3, -a + (b.sp > 0 ? 0 : Math.PI), 0]} scale={b.s * vis}>
            {[-1, 1].map((sd) => (
              <group key={sd} rotation={[0, 0, sd * (0.15 + flap * 0.85)]}>
                <mesh position={[sd * 0.5, 0, 0]} scale={[sd, 1, 1]} rotation={[-Math.PI / 2, 0, 0]}>
                  <planeGeometry args={[1, 1]} />
                  <meshBasicMaterial map={tex} color={col} transparent alphaTest={0.3} side={THREE.DoubleSide} toneMapped={false} />
                </mesh>
              </group>
            ))}
          </group>
        );
      })}
    </group>
  );
};

// ---------- small glowing pollen orbs scattered in the flowers ----------
export const PollenOrbs3D: React.FC<{ t: number; points: V3[]; glow: number; colors?: string[] }> = ({ t, points, glow, colors = ORB_COLORS }) => (
  <>
    {points.map((p, i) => (
      <group key={i} position={[p[0], p[1] + Math.sin(t * 1.6 + i) * 0.08, p[2]]}>
        <mesh>
          <sphereGeometry args={[0.13, 14, 10]} />
          <meshBasicMaterial color={lit(colors[i % colors.length], 1.2 + glow * 1.3)} toneMapped={false} />
        </mesh>
        <Halo position={[0, 0, 0]} size={0.9} color={colors[i % colors.length]} opacity={0.35 * glow} />
      </group>
    ))}
  </>
);

// ---------- a lily pad ----------
const LilyPad: React.FC<{ position: V3; r: number; tex: THREE.Texture; bloom: number; rotY?: number }> = ({ position, r, tex, bloom, rotY = 0 }) => (
  <group position={position} rotation={[0, rotY, 0]}>
    <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow castShadow>
      <circleGeometry args={[r, 40, 0.25, TAU - 0.5]} />
      <meshStandardMaterial map={tex} color={live("#ffffff", bloom, 0.5)} roughness={0.6} side={THREE.DoubleSide} />
    </mesh>
    <mesh position={[0, -0.06, 0]} rotation={[-Math.PI / 2, 0, 0]}>
      <ringGeometry args={[r * 0.97, r * 1.02, 40, 1, 0.25, TAU - 0.5]} />
      <meshStandardMaterial color={live("#3f9a5a", bloom, 0.4)} side={THREE.DoubleSide} />
    </mesh>
  </group>
);

export type GardenState = {
  bloom: number; // 0 pale and closing .. 1 full colour
  drift: number; // 0 islands together .. 1 drifting apart
  flow: number; // waterfalls 0 still .. 1 flowing
  waves: number; // the lake's sparkling waves 0 .. 1
  bfly: number; // how many butterflies are left 0..1
  open?: number; // how open the big flowers are (default from bloom)
};

const MEADOW_FLOWERS: { p: V3; c: string; s: number; stem: number; seed: number }[] = [
  { p: [-5.0, 0, -3.6], c: "#ff8ac8", s: 1.5, stem: 2.4, seed: 1 },
  { p: [4.9, 0, -4.0], c: "#ffcf5a", s: 1.35, stem: 2.0, seed: 2 },
  { p: [-6.4, 0, 1.4], c: "#a890ff", s: 1.15, stem: 1.6, seed: 3 },
  { p: [6.2, 0, 0.8], c: "#7ae8c8", s: 1.2, stem: 1.7, seed: 4 },
  { p: [-2.4, 0, -6.2], c: "#ff7aa0", s: 1.7, stem: 3.0, seed: 5 },
  { p: [2.6, 0, -6.4], c: "#c88aff", s: 1.5, stem: 2.6, seed: 6 },
  { p: [0, 0, -7.4], c: "#ffb0e0", s: 2.0, stem: 3.6, seed: 7 },
];
const GIANT_FLOWERS: { p: V3; c: string; s: number; stem: number; seed: number }[] = [
  { p: [-4.0, 0, -2.6], c: "#ff6aa8", s: 2.2, stem: 3.4, seed: 11 },
  { p: [3.6, 0, -3.4], c: "#ffd04a", s: 2.0, stem: 3.0, seed: 12 },
  { p: [0.2, 0, -5.2], c: "#6ab8ff", s: 2.6, stem: 4.4, seed: 13 },
  { p: [-5.4, 0, 1.6], c: "#b47aff", s: 1.6, stem: 2.2, seed: 14 },
  { p: [5.4, 0, 1.2], c: "#ff8a5a", s: 1.7, stem: 2.4, seed: 15 },
];

/** The whole floating garden above the lake. Characters stand on MEADOW (y 0) or GIANTS or PAD. */
export const FlowerGarden: React.FC<{ t: number; s: GardenState; gate?: GateState; hideMeadowFlowers?: boolean }> = ({ t, s, gate, hideMeadowFlowers = false }) => {
  const meadow = useMemo(() => meadowTex(151, "#7fd08a", ["#ffb0d8", "#fff0a0", "#b8c8ff", "#e0b8ff", "#ffffff"]), []);
  const giants = useMemo(() => meadowTex(157, "#86d6a0", ["#ffd0e8", "#ffe890", "#a8e0ff", "#ffffff"]), []);
  const pad = useMemo(() => padTex(), []);
  const open = s.open ?? 0.3 + 0.7 * s.bloom;
  const away = (p: V3, k: number): V3 => awayFrom(p, s.drift, k);
  const giantsAt = giantsCenter(s.drift);
  const islands: { p: V3; r: number; seed: number; grass: string; gem: string }[] = [
    { p: [-18, 3.5, -22], r: 5, seed: 71, grass: "#90e0b0", gem: "#ff9fe0" },
    { p: [-26, -2.5, -6], r: 4, seed: 73, grass: "#a0e8a0", gem: "#9fd8ff" },
    { p: [30, 5, -40], r: 6, seed: 75, grass: "#90e0b8", gem: "#ffe08f" },
    { p: [-8, 7, -52], r: 7, seed: 77, grass: "#98e4a8", gem: "#c8a0ff" },
    { p: [22, -3, 6], r: 3.5, seed: 79, grass: "#a8eab0", gem: "#ff9fe0" },
  ];
  return (
    <>
      <fogExp2 attach="fog" args={[new THREE.Color("#e4dce4").lerp(new THREE.Color("#ffe8f0"), s.bloom).getStyle(), 0.0042]} />
      <GardenSky t={t} bloom={s.bloom} />
      <hemisphereLight args={["#fff4ff", "#88b8a8", 0.95 + s.bloom * 0.3]} />
      <directionalLight
        position={[40, 40, -10]}
        intensity={1.5 + s.bloom * 0.7}
        color="#fff0d8"
        castShadow
        shadow-mapSize={[2048, 2048]}
        shadow-camera-left={-28}
        shadow-camera-right={28}
        shadow-camera-top={28}
        shadow-camera-bottom={-28}
        shadow-camera-near={1}
        shadow-camera-far={160}
        shadow-bias={-0.0006}
      />
      <directionalLight position={[-30, 18, 30]} intensity={0.55} color="#e8d8ff" />
      <CrystalLake t={t} bloom={s.bloom} waves={s.waves} />
      {/* the meadow island */}
      <FloatingIsland position={MEADOW} radius={MEADOW_R} seed={151} t={0} bob={0} grass={live("#7fd08a", s.bloom, 0.45).getStyle()} rock="#b0a0d0" crystals={0} crystalColor={live("#ff9fe0", s.bloom, 0.4).getStyle()} glow={0.4 + s.bloom * 0.5} />
      <mesh position={[0, 0.015, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <circleGeometry args={[MEADOW_R - 0.05, 72]} />
        <meshStandardMaterial map={meadow} color={live("#ffffff", s.bloom, 0.6)} roughness={0.9} />
      </mesh>
      {!hideMeadowFlowers && MEADOW_FLOWERS.map((f, i) => <GiantFlower3D key={i} position={f.p} t={t} open={open} bloom={s.bloom} color={f.c} size={f.s} stem={f.stem} seed={f.seed} />)}
      <GlowGarden t={t} radius={MEADOW_R - 0.4} count={70} seed={152} glow={0.2 + s.bloom * 0.9} clear={4.2} />
      <Waterfall position={[-3.5, 0, MEADOW_R * 0.92]} rotY={0.4} width={2.2} height={9} t={t} flow={s.flow} bloom={s.bloom} />
      <Waterfall position={[MEADOW_R * 0.9, 0, -3]} rotY={-1.2} width={1.6} height={9} t={t + 3} flow={s.flow} bloom={s.bloom} />
      <Waterfall position={[-MEADOW_R * 0.9, 0, -3.5]} rotY={1.25} width={1.8} height={9} t={t + 5} flow={s.flow} bloom={s.bloom} />
      {/* the island of giant flowers */}
      <group position={giantsAt}>
        <FloatingIsland position={[0, 0, 0]} radius={GIANTS_R} seed={161} t={0} bob={0} grass={live("#86d6a0", s.bloom, 0.45).getStyle()} rock="#a898d8" crystals={0} crystalColor={live("#9fd8ff", s.bloom, 0.4).getStyle()} glow={0.4 + s.bloom * 0.5} />
        <mesh position={[0, 0.015, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
          <circleGeometry args={[GIANTS_R - 0.05, 64]} />
          <meshStandardMaterial map={giants} color={live("#ffffff", s.bloom, 0.6)} roughness={0.9} />
        </mesh>
        {GIANT_FLOWERS.map((f, i) => (
          <GiantFlower3D key={i} position={f.p} t={t} open={open} bloom={s.bloom} color={f.c} size={f.s} stem={f.stem} seed={f.seed} />
        ))}
        <GlowGarden t={t} radius={GIANTS_R - 0.4} count={50} seed={162} glow={0.2 + s.bloom * 0.9} clear={3.4} />
        <Waterfall position={[0, 0, -GIANTS_R * 0.92]} rotY={Math.PI} width={2.4} height={10.2} t={t + 1} flow={s.flow} bloom={s.bloom} />
        <Waterfall position={[GIANTS_R * 0.9, 0, 1]} rotY={-1.4} width={1.8} height={10.2} t={t + 2} flow={s.flow} bloom={s.bloom} />
      </group>
      {/* the stepping lily pads, floating in the air between the two islands */}
      {Array.from({ length: STEPS }, (_, i) => (
        <LilyPad key={i} position={stepAt(i)} r={0.85} tex={pad} bloom={s.bloom} rotY={i * 1.3} />
      ))}
      {/* more islands around, drifting apart while the magic fades */}
      {islands.map((il, i) => {
        const p = away(il.p, 5 + i);
        return (
          <group key={i}>
            <FloatingIsland position={p} radius={il.r} seed={il.seed} t={t} bob={0.2} grass={live(il.grass, s.bloom, 0.45).getStyle()} rock="#b0a0d8" crystals={3} crystalColor={live(il.gem, s.bloom, 0.4).getStyle()} glow={0.4 + s.bloom * 0.5} />
            <GiantFlower3D position={[p[0] + il.r * 0.2, p[1] + Math.sin(t * 0.6 + il.seed) * 0.2, p[2]]} t={t} open={open} bloom={s.bloom} color={["#ff8ac8", "#ffd060", "#8ad8ff", "#c8a0ff", "#ff9a7a"][i]} size={il.r * 0.35} stem={il.r * 0.6} seed={il.seed} />
            <Waterfall position={[p[0], p[1] + Math.sin(t * 0.6 + il.seed) * 0.2, p[2] + il.r * 0.9]} rotY={0} width={il.r * 0.3} height={p[1] - LAKE_Y} t={t + i} flow={s.flow} bloom={s.bloom} />
          </group>
        );
      })}
      {/* the great lily pad on the lake and its flower gate */}
      <LilyPad position={PAD} r={PAD_R} tex={pad} bloom={s.bloom} rotY={-0.3} />
      <FlowerGate t={t} bloom={s.bloom} g={gate ?? { carve: [0, 0, 0, 0], sockets: [0, 0, 0, 0], open: 0 }} />
      {/* lake lilies */}
      {Array.from({ length: 14 }, (_, i) => {
        const r = rng(400 + i);
        const a = r() * TAU;
        const d = 12 + r() * 40;
        const p: V3 = [Math.cos(a) * d, LAKE_Y + 0.05, -20 + Math.sin(a) * d];
        if (Math.hypot(p[0] - PAD[0], p[2] - PAD[2]) < PAD_R + 2) return null;
        return <LilyPad key={`l${i}`} position={p} r={1.2 + r() * 1.6} tex={pad} bloom={s.bloom} rotY={a} />;
      })}
      <Butterflies t={t} center={[0, 0, 0]} radius={MEADOW_R} count={18} amount={s.bfly} seed={153} />
      <Butterflies t={t} center={giantsAt} radius={GIANTS_R} count={14} amount={s.bfly} seed={163} height={4} />
      <Butterflies t={t} center={[PAD[0], PAD[1], PAD[2]]} radius={PAD_R + 4} count={10} amount={s.bfly} seed={173} height={3} />
      <Motes t={t} center={[0, 2.5, -4]} size={[22, 6, 20]} count={120} seed={154} color="#fff0a0" bright={0.4 + s.bloom * 0.8} />
      <Motes t={t} center={[giantsAt[0], giantsAt[1] + 3, giantsAt[2]]} size={[14, 7, 14]} count={90} seed={164} color="#ffd8f0" bright={0.4 + s.bloom * 0.8} />
    </>
  );
};

// ---------- the flower gate on the lily pad ----------
export type GateState = { carve: number[]; sockets: number[]; open: number };
const FLOWER_EMBLEM = (c: string, k: number, size = 0.32) => (
  <group scale={size}>
    {Array.from({ length: 5 }, (_, i) => (
      <mesh key={i} position={[Math.cos((i / 5) * TAU) * 0.55, Math.sin((i / 5) * TAU) * 0.55, 0]} scale={[0.5, 0.5, 0.15]}>
        <sphereGeometry args={[1, 14, 10]} />
        <meshStandardMaterial color={c} emissive={c} emissiveIntensity={0.15 + k * 2.2} roughness={0.4} toneMapped={k < 0.5} />
      </mesh>
    ))}
    <mesh position={[0, 0, 0.1]} scale={[0.4, 0.4, 0.2]}>
      <sphereGeometry args={[1, 14, 10]} />
      <meshStandardMaterial color="#fff0b0" emissive="#fff0b0" emissiveIntensity={0.3 + k * 2} />
    </mesh>
  </group>
);
const CURTAIN_FRAG = /* glsl */ `
uniform float uT; uniform float uOpen; varying vec2 vUv;
float hash(vec2 p){ return fract(sin(dot(p, vec2(41.3, 289.1))) * 43758.5453); }
float noise(vec2 p){ vec2 i = floor(p); vec2 f = fract(p); f = f*f*(3.0-2.0*f);
  return mix(mix(hash(i), hash(i+vec2(1,0)), f.x), mix(hash(i+vec2(0,1)), hash(i+vec2(1,1)), f.x), f.y); }
void main(){
  float s = noise(vec2(vUv.x * 22.0, vUv.y * 5.0 + uT * 4.0)) * 0.6 + noise(vec2(vUv.x * 50.0, vUv.y * 11.0 + uT * 7.0)) * 0.4;
  float streak = smoothstep(0.3, 0.9, s);
  // it parts from the middle
  float gap = uOpen * 0.55;
  float m = smoothstep(gap - 0.04, gap + 0.04, abs(vUv.x - 0.5));
  vec3 c = mix(vec3(0.35, 0.75, 0.95), vec3(0.95, 1.0, 1.0), streak);
  gl_FragColor = vec4(c, m * (0.55 + 0.35 * streak));
}`;
export const FlowerGate: React.FC<{ t: number; bloom: number; g: GateState }> = ({ t, bloom, g }) => {
  const uniforms = useMemo(() => ({ uT: { value: 0 }, uOpen: { value: 0 } }), []);
  uniforms.uT.value = t;
  uniforms.uOpen.value = g.open;
  const vine = live("#4fae6a", bloom, 0.5);
  const stone = live("#e8e0f0", bloom, 0.6);
  const archFlowers = 14;
  return (
    <group>
      {/* the arch: a curved vine trunk covered in flowers */}
      <group position={[GATE[0], GATE[1], GATE[2]]}>
        {[-1, 1].map((sd) => (
          <mesh key={sd} position={[sd * GATE_W, (GATE_H - 1) / 2, 0]} castShadow>
            <cylinderGeometry args={[0.2, 0.28, GATE_H - 1, 10]} />
            <meshStandardMaterial color={vine} roughness={0.7} />
          </mesh>
        ))}
        <mesh position={[0, GATE_H - 1, 0]} castShadow>
          <torusGeometry args={[GATE_W, 0.2, 10, 40, Math.PI]} />
          <meshStandardMaterial color={vine} roughness={0.7} />
        </mesh>
        {Array.from({ length: archFlowers }, (_, i) => {
          const k = i / (archFlowers - 1);
          let p: V3;
          if (k < 0.25) p = [-GATE_W, (k / 0.25) * (GATE_H - 1), 0.2];
          else if (k > 0.75) p = [GATE_W, ((1 - k) / 0.25) * (GATE_H - 1), 0.2];
          else {
            const a = Math.PI * (1 - (k - 0.25) / 0.5);
            p = [Math.cos(a) * GATE_W, GATE_H - 1 + Math.sin(a) * GATE_W * 0.98, 0.2];
          }
          const col = ["#ff8ac8", "#ffd060", "#8ad8ff", "#c8a0ff"][i % 4];
          return (
            <group key={i} position={p} rotation={[0, 0, i]}>
              {FLOWER_EMBLEM(live(col, bloom).getStyle(), 0.15 + 0.35 * bloom * (0.5 + 0.5 * Math.sin(t * 2 + i)) + g.open * 0.6, 0.26)}
            </group>
          );
        })}
        {/* the water curtain filling the arch, and the glowing stair below it */}
        <mesh position={[0, (GATE_H - 0.6) / 2 + 0.05, -0.05]}>
          <planeGeometry args={[GATE_W * 2 - 0.3, GATE_H + 1.2 - 0.6]} />
          <shaderMaterial vertexShader={FALL_VERT} fragmentShader={CURTAIN_FRAG} uniforms={uniforms} transparent depthWrite={false} side={THREE.DoubleSide} toneMapped={false} />
        </mesh>
        {g.open > 0.01 &&
          Array.from({ length: 6 }, (_, i) => (
            <mesh key={i} position={[0, 0.05 - i * 0.28, -0.6 - i * 0.55]} receiveShadow>
              <boxGeometry args={[1.8 - i * 0.08, 0.12, 0.5]} />
              <meshStandardMaterial color="#e8f8ff" emissive="#9ae8ff" emissiveIntensity={(0.6 + 0.6 * Math.sin(t * 3 - i)) * g.open} transparent opacity={g.open} />
            </mesh>
          ))}
        {g.open > 0.01 && (
          <mesh position={[0, -0.2, -1.6]} rotation={[-Math.PI / 2, 0, 0]}>
            <circleGeometry args={[1.6 * g.open, 32]} />
            <meshBasicMaterial color={lit("#9ae8ff", 1.2)} transparent opacity={0.5 * g.open} toneMapped={false} />
          </mesh>
        )}
      </group>
      {/* the four carvings that glow in order */}
      {ORB_COLORS.map((c, i) => (
        <group key={i} position={carveAt(i)}>
          <mesh position={[0, 0, -0.1]}>
            <circleGeometry args={[0.36, 24]} />
            <meshStandardMaterial color={stone} roughness={0.6} />
          </mesh>
          {FLOWER_EMBLEM(live(c, Math.max(bloom, g.carve[i])).getStyle(), g.carve[i], 0.28)}
          {g.carve[i] > 0.05 && <Halo position={[0, 0, 0.2]} size={1.6} color={c} opacity={0.5 * g.carve[i]} />}
        </group>
      ))}
      {/* the pedestal with four flower sockets */}
      <mesh position={[GATE[0], GATE[1] + 0.5, GATE[2] + 1.15]} castShadow receiveShadow>
        <boxGeometry args={[4.4, 1.0, 0.7]} />
        <meshStandardMaterial color={stone} roughness={0.6} />
      </mesh>
      {ORB_COLORS.map((c, i) => {
        const p = socketAt(i);
        const k = g.sockets[i];
        return (
          <group key={`s${i}`} position={p}>
            {Array.from({ length: 6 }, (_, j) => (
              <group key={j} rotation={[0, (j / 6) * TAU, 0]}>
                <group rotation={[-0.9 + k * 0.5, 0, 0]}>
                  <mesh position={[0, 0, 0.18]} scale={[0.12, 0.03, 0.22]}>
                    <sphereGeometry args={[1, 12, 8]} />
                    <meshStandardMaterial color={live(c, 0.3 + k * 0.7)} emissive={c} emissiveIntensity={0.1 + k * 0.6} roughness={0.5} />
                  </mesh>
                </group>
              </group>
            ))}
            {k > 0.01 && (
              <>
                <mesh position={[0, 0.14, 0]} scale={k}>
                  <sphereGeometry args={[0.14, 14, 10]} />
                  <meshBasicMaterial color={lit(c, 2.4)} toneMapped={false} />
                </mesh>
                <Halo position={[0, 0.14, 0]} size={1.1} color={c} opacity={0.5 * k} />
              </>
            )}
          </group>
        );
      })}
    </group>
  );
};

// ---------- the Bloom Crystal's chamber under the lake ----------
const DOME_FRAG = /* glsl */ `
uniform float uT; uniform float uGlow; varying vec2 vUv;
float hash(vec2 p){ return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453); }
float noise(vec2 p){ vec2 i = floor(p); vec2 f = fract(p); f = f*f*(3.0-2.0*f);
  return mix(mix(hash(i), hash(i+vec2(1,0)), f.x), mix(hash(i+vec2(0,1)), hash(i+vec2(1,1)), f.x), f.y); }
void main(){
  // water seen through the glass dome: deep blue, lighter toward the surface, with dancing caustic light
  float h = vUv.y;
  vec3 deep = vec3(0.05, 0.18, 0.32);
  vec3 up = vec3(0.25, 0.6, 0.75);
  vec3 c = mix(deep, up, smoothstep(0.1, 0.95, h));
  vec2 p = vUv * vec2(18.0, 8.0);
  float n = noise(p + vec2(uT * 0.4, uT * 0.2)) * noise(p * 1.7 - vec2(uT * 0.3, 0.0));
  c += vec3(0.5, 0.9, 1.0) * pow(n, 3.0) * 1.4 * (0.35 + 0.65 * smoothstep(0.3, 1.0, h));
  // the light rays from the surface far above
  float ray = pow(0.5 + 0.5 * sin(vUv.x * 60.0 + sin(vUv.x * 7.0 + uT * 0.3) * 3.0), 18.0) * smoothstep(0.35, 1.0, h);
  c += vec3(0.7, 0.95, 1.0) * ray * 0.35;
  c = mix(c, c * vec3(1.3, 1.0, 1.35) + vec3(0.25, 0.05, 0.25), uGlow * 0.5);
  gl_FragColor = vec4(c, 1.0);
}`;
export type ChamberState = { glow: number; orbs: number[]; bloom: number; open: number };
export const CrystalChamber: React.FC<{ t: number; s: ChamberState }> = ({ t, s }) => {
  const moss = useMemo(() => mossTex(), []);
  const uniforms = useMemo(() => ({ uT: { value: 0 }, uGlow: { value: 0 } }), []);
  uniforms.uT.value = t;
  uniforms.uGlow.value = s.glow;
  const crystalCol = new THREE.Color("#c8a8ff").lerp(new THREE.Color("#ffd8f8"), s.glow);
  const floorFlowers: { p: V3; c: string; sz: number; st: number }[] = [
    { p: [-3.6, 0, -6.2], c: "#ff8ac8", sz: 1.0, st: 1.4 },
    { p: [3.8, 0, -6.6], c: "#ffd060", sz: 1.1, st: 1.6 },
    { p: [-5.2, 0, -3.0], c: "#8ad8ff", sz: 0.9, st: 1.1 },
    { p: [5.0, 0, -2.6], c: "#c8a0ff", sz: 0.95, st: 1.2 },
    { p: [-1.8, 0, -8.0], c: "#ff9a7a", sz: 1.2, st: 2.0 },
    { p: [1.9, 0, -8.2], c: "#7ae8c8", sz: 1.15, st: 1.9 },
  ];
  return (
    <>
      <fogExp2 attach="fog" args={["#1a4a6a", 0.02 - s.glow * 0.008]} />
      <hemisphereLight args={["#bfe8ff", "#2a4a5a", 0.7 + s.glow * 0.6]} />
      <directionalLight position={[4, 12, 6]} intensity={0.9 + s.glow * 0.4} color="#d8f4ff" castShadow shadow-mapSize={[1024, 1024]} />
      <pointLight position={[CRYSTAL[0], CRYSTAL[1] + 1.2, CRYSTAL[2]]} intensity={2 + s.glow * 60} distance={18} color="#ffc8f0" />
      {/* the dome of water around and above */}
      <mesh position={[0, 0, -4]}>
        <sphereGeometry args={[14, 48, 24, 0, TAU, 0, Math.PI / 2]} />
        <shaderMaterial vertexShader={FALL_VERT} fragmentShader={DOME_FRAG} uniforms={uniforms} side={THREE.BackSide} />
      </mesh>
      {/* the glass dome's ribs */}
      {Array.from({ length: 10 }, (_, i) => (
        <mesh key={i} position={[0, 0, -4]} rotation={[0, (i / 10) * Math.PI, 0]}>
          <torusGeometry args={[13.6, 0.06, 6, 64, Math.PI]} />
          <meshStandardMaterial color="#d8f0ff" emissive="#9ad8ff" emissiveIntensity={0.3 + s.glow * 0.6} transparent opacity={0.5} />
        </mesh>
      ))}
      {/* the floor */}
      <mesh position={[0, 0, -4]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <circleGeometry args={[14, 64]} />
        <meshStandardMaterial map={moss} color={new THREE.Color("#c8e0d8").lerp(new THREE.Color("#ffffff"), s.bloom)} roughness={0.9} />
      </mesh>
      {Array.from({ length: 16 }, (_, i) => {
        const a = (i / 16) * TAU;
        const r = rng(600 + i);
        if (Math.sin(a) > -0.2) return null; // only behind the crystal, never next to the camera
        return (
          <mesh key={i} position={[Math.cos(a) * 8.6, 0.3, -4 + Math.sin(a) * 8.6]} rotation={[r(), r(), r()]} scale={[0.8 + r(), 0.5 + r() * 0.8, 0.8 + r()]} castShadow>
            <dodecahedronGeometry args={[0.7, 0]} />
            <meshStandardMaterial color="#6a8a9a" roughness={0.9} flatShading />
          </mesh>
        );
      })}
      {floorFlowers.map((f, i) => (
        <GiantFlower3D key={i} position={f.p} t={t} open={0.1 + 0.9 * s.open} bloom={0.3 + 0.7 * s.bloom} color={f.c} size={f.sz} stem={f.st} seed={i * 3} />
      ))}
      {/* the pedestal and the Bloom Crystal */}
      <mesh position={[CRYSTAL[0], 0.3, CRYSTAL[2]]} castShadow receiveShadow>
        <cylinderGeometry args={[0.9, 1.1, 0.6, 24]} />
        <meshStandardMaterial color="#e0e8f0" roughness={0.5} />
      </mesh>
      <group position={CRYSTAL} rotation={[0, t * 0.25, 0]}>
        <mesh scale={[0.55, 1.05, 0.55]} castShadow>
          <octahedronGeometry args={[1, 0]} />
          <meshStandardMaterial color={crystalCol} emissive={crystalCol} emissiveIntensity={0.08 + s.glow * 2.4} roughness={0.15} metalness={0.1} flatShading transparent opacity={0.92} />
        </mesh>
        {[0, 1, 2, 3, 4].map((i) => (
          <mesh key={i} position={[Math.cos((i / 5) * TAU) * 0.55, -0.55, Math.sin((i / 5) * TAU) * 0.55]} rotation={[0, 0, (i % 2 ? 1 : -1) * 0.5]} scale={[0.16, 0.42, 0.16]}>
            <octahedronGeometry args={[1, 0]} />
            <meshStandardMaterial color={crystalCol} emissive={crystalCol} emissiveIntensity={0.05 + s.glow * 1.8} roughness={0.2} flatShading />
          </mesh>
        ))}
      </group>
      {s.glow > 0.02 && <Halo position={CRYSTAL} size={3 + s.glow * 6} color="#ffd0f4" opacity={0.6 * s.glow} />}
      {/* the four orb pedestals */}
      {ORB_COLORS.map((c, i) => {
        const p = pedestalAt(i);
        const k = s.orbs[i];
        return (
          <group key={i}>
            <mesh position={[p[0], p[1] / 2, p[2]]} castShadow receiveShadow>
              <cylinderGeometry args={[0.18, 0.26, p[1], 12]} />
              <meshStandardMaterial color="#e0e8f0" roughness={0.5} />
            </mesh>
            {k > 0.01 && (
              <>
                <mesh position={[p[0], p[1] + 0.16, p[2]]} scale={k}>
                  <sphereGeometry args={[0.16, 14, 10]} />
                  <meshBasicMaterial color={lit(c, 2.2 + s.glow)} toneMapped={false} />
                </mesh>
                <Halo position={[p[0], p[1] + 0.16, p[2]]} size={1.3} color={c} opacity={0.5 * k} />
              </>
            )}
          </group>
        );
      })}
      {/* bubbles and drifting light */}
      <Motes t={t} center={[0, 3, -4]} size={[14, 7, 12]} count={110} seed={611} color={s.glow > 0.5 ? "#ffd8f8" : "#bfe8ff"} bright={0.4 + s.glow} />
    </>
  );
};

// ---------- the next mystery: the Starlight Island, surrounded by stars and floating lanterns ----------
const HOLO_VERT = /* glsl */ `varying vec3 vN; varying vec3 vV; void main(){ vec4 w = modelViewMatrix * vec4(position, 1.0); vN = normalize(normalMatrix * normal); vV = normalize(-w.xyz); gl_Position = projectionMatrix * w; }`;
const HOLO_FRAG = /* glsl */ `uniform float uOn; varying vec3 vN; varying vec3 vV;
void main(){ float f = pow(1.0 - abs(dot(vN, vV)), 2.2); gl_FragColor = vec4(vec3(0.85, 0.85, 1.0) * (0.4 + f * 1.4), (0.08 + f * 0.55) * uOn); }`;
export const StarlightHologram: React.FC<{ position: V3; t: number; on: number; scale?: number }> = ({ position, t, on, scale = 1 }) => {
  const uniforms = useMemo(() => ({ uOn: { value: 0 } }), []);
  uniforms.uOn.value = on;
  const stars = useMemo(() => {
    const r = rng(1777);
    return Array.from({ length: 40 }, () => ({ p: [(r() - 0.5) * 3.6, (r() - 0.3) * 3.2, (r() - 0.5) * 3.0] as V3, s: 0.03 + r() * 0.05, ph: r() * 6 }));
  }, []);
  if (on <= 0.001) return null;
  const s = scale * (0.3 + 0.7 * on);
  const m = (c: string, k = 1.4, op = 0.9) => <meshBasicMaterial color={lit(c, k)} transparent opacity={op * on} toneMapped={false} depthWrite={false} side={THREE.DoubleSide} />;
  return (
    <group position={position} scale={s}>
      <Halo position={[0, 0, 0]} size={8} color="#d8d8ff" opacity={0.3 * on} />
      <mesh>
        <sphereGeometry args={[2.25, 40, 20]} />
        <meshBasicMaterial color="#10123a" transparent opacity={0.6 * on} side={THREE.BackSide} depthWrite={false} />
      </mesh>
      <mesh>
        <sphereGeometry args={[2.3, 48, 24]} />
        <shaderMaterial vertexShader={HOLO_VERT} fragmentShader={HOLO_FRAG} uniforms={uniforms} transparent depthWrite={false} />
      </mesh>
      {/* the island */}
      <group position={[0, -0.3 + Math.sin(t * 0.8) * 0.06, 0]} rotation={[0, t * 0.2, 0]}>
        <mesh position={[0, -0.35, 0]} rotation={[Math.PI, 0, 0]}>
          <coneGeometry args={[1.0, 1.1, 9]} />
          {m("#8a7ad8", 1.1)}
        </mesh>
        <mesh position={[0, 0.02, 0]}>
          <cylinderGeometry args={[1.02, 1.0, 0.12, 24]} />
          {m("#8af0c0", 1.2)}
        </mesh>
        {/* a little star tower */}
        <mesh position={[0.15, 0.5, -0.1]}>
          <cylinderGeometry args={[0.14, 0.2, 0.9, 10]} />
          {m("#f0e8ff", 1.3)}
        </mesh>
        <mesh position={[0.15, 1.08, -0.1]}>
          <coneGeometry args={[0.24, 0.36, 10]} />
          {m("#b8a0ff", 1.4)}
        </mesh>
        <mesh position={[0.15, 1.36, -0.1]} rotation={[0, 0, t]}>
          <octahedronGeometry args={[0.1, 0]} />
          {m("#fff6b0", 2.4)}
        </mesh>
        {[-0.5, 0.55, -0.2].map((x, i) => (
          <mesh key={i} position={[x, 0.22, [0.4, 0.35, -0.55][i]]}>
            <sphereGeometry args={[0.16, 10, 8]} />
            {m(["#a0f0c0", "#b8f8d0", "#90e8b8"][i], 1.2)}
          </mesh>
        ))}
      </group>
      {/* floating lanterns rising around it */}
      {Array.from({ length: 9 }, (_, i) => {
        const k = (i * 0.37 + t * 0.07) % 1;
        const a = i * 2.1 + t * 0.15;
        return (
          <group key={i} position={[Math.cos(a) * (1.1 + (i % 3) * 0.25), -0.8 + k * 2.6, Math.sin(a) * 0.9]} scale={Math.sin(k * Math.PI)}>
            <mesh>
              <boxGeometry args={[0.13, 0.17, 0.13]} />
              {m("#ffb860", 2.0)}
            </mesh>
            <Halo position={[0, 0, 0]} size={0.6} color="#ffc070" opacity={0.6 * on} />
          </group>
        );
      })}
      {stars.map((st, i) => (
        <mesh key={`s${i}`} position={st.p} scale={st.s * (0.7 + 0.5 * Math.sin(t * 3 + st.ph))}>
          <octahedronGeometry args={[1, 0]} />
          {m("#ffffff", 2.4)}
        </mesh>
      ))}
    </group>
  );
};
