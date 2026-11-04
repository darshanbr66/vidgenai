import React, { useMemo } from "react";
import * as THREE from "three";
import { rng } from "../kit3d/World";
import { FloatingIsland, Halo } from "../kit3d/sky";
import { Motes } from "../kit3d/magic";
import { Cloud } from "../ep10/world";

// Episode 13: the Rainbow Bridge above the clouds, its floating islands, the Rainbow Gate and the
// chamber of the Rainbow Heart. Everything depends only on props, so every render of a frame is identical.
//
// The bridge is seven bands of light (red on the left, violet on the right as seen from the arrival island).
// Each band has its own saturation, flicker and see-through patch, so single colours can fade.

export type V3 = [number, number, number];
export const RAINBOW7 = ["#ff4d5e", "#ff9a3c", "#ffd83a", "#4fd66a", "#3f9dff", "#5a5cf0", "#b05cff"];
export const COLOR_NAMES = ["red", "orange", "yellow", "green", "blue", "indigo", "violet"];

// ---------- the bridge's shape ----------
export const BRIDGE_Z0 = 1; // starts on the arrival island
export const BRIDGE_LEN = 100;
export const BRIDGE_H = 20; // height of the flat crown
export const BAND_W = 0.9;
export const BRIDGE_W = BAND_W * 7;
const RISE = 0.38; // the first 38% rises, the middle 24% is flat, the rest falls
export const uOfZ = (z: number) => (BRIDGE_Z0 - z) / BRIDGE_LEN;
export const zOfU = (u: number) => BRIDGE_Z0 - u * BRIDGE_LEN;
export const bridgeYu = (u: number) => {
  const k = u < RISE ? u / RISE : u > 1 - RISE ? (1 - u) / RISE : 1;
  return (BRIDGE_H * (1 - Math.cos(Math.PI * Math.max(0, Math.min(1, k))))) / 2;
};
export const bridgeY = (z: number) => bridgeYu(uOfZ(z));
// a point standing on the bridge at (x, z)
export const onBridge = (x: number, z: number): V3 => [x, bridgeY(z) + 0.02, z];
export const bandX = (i: number) => -BRIDGE_W / 2 + (i + 0.5) * BAND_W;

export const CROWN_Z0 = zOfU(RISE); // where the flat crown begins (-37)
export const GATE_Z = CROWN_Z0 - 3.5; // the Rainbow Gate across the bridge
export const CHAMBER_Z = zOfU(0.5); // centre of the Rainbow Heart's chamber (-49)
export const HEART_AT: V3 = [0, BRIDGE_H + 2.5, CHAMBER_Z];
export const PEDESTAL: V3 = [0, BRIDGE_H, CHAMBER_Z];

// ---------- islands ----------
export const ARRIVE: V3 = [0, 0, 8]; // arrival island; its top is y = 0
export const ARRIVE_R = 8;
type IsleDef = { at: V3; r: number; dir: V3; seed: number };
export const ISLES: Record<"flower" | "falls" | "sun" | "far", IsleDef> = {
  flower: { at: [-17, 5, -20], r: 5.5, dir: [-1, 0, 0.25], seed: 31 },
  falls: { at: [18, 9, -30], r: 6, dir: [1, 0, -0.1], seed: 32 },
  sun: { at: [-19, 14, -52], r: 5.5, dir: [-1, 0.1, -0.2], seed: 33 },
  far: { at: [0, 0, -108], r: 8, dir: [0, 0, -1], seed: 34 },
};
// where an island's top centre is once it has drifted `drift` (0..1) away from the bridge
export const isleAt = (k: keyof typeof ISLES, drift: number): V3 => {
  const d = ISLES[k];
  return [d.at[0] + d.dir[0] * drift * 5, d.at[1] + d.dir[1] * drift * 5, d.at[2] + d.dir[2] * drift * 5];
};
export const FALLS_POOL: V3 = [4.2, 0, -0.6]; // the pool on the waterfall island, relative to its centre
const add3 = (a: V3, b: V3): V3 => [a[0] + b[0], a[1] + b[1], a[2] + b[2]];
export const onIsle = (k: keyof typeof ISLES, drift: number, dx: number, dz: number): V3 => add3(isleAt(k, drift), [dx, 0.02, dz]);

const grey = (c: string, k: number) => {
  const a = new THREE.Color(c);
  const l = a.r * 0.299 + a.g * 0.587 + a.b * 0.114;
  const g = new THREE.Color(l * 0.75 + 0.2, l * 0.75 + 0.21, l * 0.75 + 0.25);
  return g.lerp(a, Math.max(0, Math.min(1, k))).getStyle();
};

// ---------- the bridge bands ----------
const BAND_VERT = /* glsl */ `varying vec2 vUv; varying float vSide; attribute float side;
void main(){ vUv = uv; vSide = side; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`;
const BAND_FRAG = /* glsl */ `uniform vec3 uCol; uniform float uSat; uniform float uFlick; uniform float uT; uniform float uHoleU; uniform float uHoleR; uniform float uHoleOn;
uniform float uFillR; uniform float uFillOn; uniform float uBright; uniform float uSeed;
varying vec2 vUv; varying float vSide;
float h1(float n){ return fract(sin(n * 12.9898 + uSeed) * 43758.5453); }
void main(){
  float dC = abs(vUv.y - 0.5);
  float fill = uFillOn * smoothstep(uFillR + 0.012, uFillR - 0.012, dC);
  float s = mix(uSat, 1.0, fill);
  float blink = step(0.45, h1(floor(uT * 11.0))) * (0.6 + 0.4 * sin(uT * 47.0));
  s *= 1.0 - uFlick * (1.0 - fill) * blink * 0.9;
  float lum = dot(uCol, vec3(0.299, 0.587, 0.114));
  vec3 pale = mix(vec3(lum), vec3(0.86, 0.88, 0.94), 0.6);
  vec3 col = mix(pale, uCol, s);
  float edge = smoothstep(0.0, 0.1, vUv.x) * smoothstep(1.0, 0.9, vUv.x);
  float sh = sin(vUv.y * 520.0 - uT * 3.0 + vUv.x * 2.0) * 0.5 + 0.5;
  col *= 0.8 + 0.22 * edge + 0.12 * sh * s;
  col *= uBright * (0.78 + 0.5 * s);
  float wf = uFillOn * exp(-pow((dC - uFillR) / 0.018, 2.0)) * step(0.001, uFillR) * (1.0 - smoothstep(0.48, 0.52, uFillR));
  col += wf * vec3(1.0, 0.96, 0.88) * 1.6;
  col *= mix(1.0, 0.55, vSide);
  float d = abs(vUv.y - uHoleU) / max(uHoleR, 1e-4);
  float hole = uHoleOn * smoothstep(1.0, 0.55, d);
  float a = mix(0.96, 0.1, hole);
  float rim = uHoleOn * exp(-pow((d - 0.8) / 0.12, 2.0));
  col += rim * vec3(1.0) * (0.9 + 0.4 * sin(uT * 12.0 + vUv.x * 9.0));
  a = max(a, rim * 0.9);
  col += hole * vec3(0.7, 0.85, 1.0) * (0.25 + 0.25 * sin(uT * 9.0 + vUv.y * 300.0));
  gl_FragColor = vec4(col, a);
}`;

const bandGeo = (i: number) => {
  const N = 260;
  const x0 = -BRIDGE_W / 2 + i * BAND_W;
  const x1 = x0 + BAND_W;
  const pos: number[] = [];
  const uv: number[] = [];
  const side: number[] = [];
  const idx: number[] = [];
  const TH = 0.22;
  // top surface (side 0), underside (side 1)
  for (const [yo, sd] of [
    [0, 0],
    [-TH, 1],
  ] as const) {
    const base = pos.length / 3;
    for (let s = 0; s <= N; s++) {
      const u = s / N;
      const y = bridgeYu(u) + yo;
      const z = zOfU(u);
      pos.push(x0, y, z, x1, y, z);
      uv.push(0, u, 1, u);
      side.push(sd, sd);
    }
    for (let s = 0; s < N; s++) {
      const a = base + s * 2;
      idx.push(a, a + 1, a + 2, a + 1, a + 3, a + 2);
    }
  }
  // the outer edge walls of the first and last band
  if (i === 0 || i === 6) {
    const x = i === 0 ? x0 : x1;
    const base = pos.length / 3;
    for (let s = 0; s <= N; s++) {
      const u = s / N;
      const y = bridgeYu(u);
      const z = zOfU(u);
      pos.push(x, y, z, x, y - TH, z);
      uv.push(0.5, u, 0.5, u);
      side.push(0.5, 0.5);
    }
    for (let s = 0; s < N; s++) {
      const a = base + s * 2;
      idx.push(a, a + 1, a + 2, a + 1, a + 3, a + 2);
    }
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3));
  g.setAttribute("uv", new THREE.Float32BufferAttribute(uv, 2));
  g.setAttribute("side", new THREE.Float32BufferAttribute(side, 1));
  g.setIndex(idx);
  return g;
};

// sat/flick/hole are per band (7 numbers). hole is the see-through amount at holeZ.
export type BridgeState = { sat: number[]; flick?: number[]; hole?: number[]; holeZ?: number; holeR?: number; fillR?: number; fillOn?: number; bright?: number };

const Band: React.FC<{ i: number; t: number; s: BridgeState }> = ({ i, t, s }) => {
  const geo = useMemo(() => bandGeo(i), [i]);
  const uniforms = useMemo(
    () => ({
      uCol: { value: new THREE.Color(RAINBOW7[i]) },
      uSat: { value: 1 },
      uFlick: { value: 0 },
      uT: { value: 0 },
      uHoleU: { value: 0 },
      uHoleR: { value: 0.012 },
      uHoleOn: { value: 0 },
      uFillR: { value: 0 },
      uFillOn: { value: 0 },
      uBright: { value: 1 },
      uSeed: { value: i * 7.13 },
    }),
    [i],
  );
  uniforms.uSat.value = s.sat[i];
  uniforms.uFlick.value = s.flick?.[i] ?? 0;
  uniforms.uT.value = t;
  uniforms.uHoleU.value = uOfZ(s.holeZ ?? 0);
  uniforms.uHoleR.value = (s.holeR ?? 1.3) / BRIDGE_LEN;
  uniforms.uHoleOn.value = s.hole?.[i] ?? 0;
  uniforms.uFillR.value = s.fillR ?? 0;
  uniforms.uFillOn.value = s.fillOn ?? 0;
  uniforms.uBright.value = s.bright ?? 1.15;
  return (
    <mesh geometry={geo} renderOrder={2}>
      <shaderMaterial vertexShader={BAND_VERT} fragmentShader={BAND_FRAG} uniforms={uniforms} transparent side={THREE.DoubleSide} toneMapped={false} />
    </mesh>
  );
};

// small clouds along both edges of the bridge; `gone` 0..1 makes them pop away one by one
const BridgeClouds: React.FC<{ t: number; gone: number; back: number }> = ({ t, gone, back }) => {
  const items = useMemo(() => {
    const r = rng(141);
    return Array.from({ length: 26 }, (_, i) => {
      const sd = i % 2 ? 1 : -1;
      const u = 0.03 + (i / 26) * 0.94 + r() * 0.02;
      return { sd, u, s: 0.6 + r() * 0.5, seed: 200 + i, order: r() };
    });
  }, []);
  return (
    <>
      {items.map((c, i) => {
        // which clouds are gone: in random order; `back` brings them all back
        const k = Math.max(0, Math.min(1, (0.05 + c.order * 0.95 - gone) * 20));
        const vis = Math.max(k, back);
        if (vis <= 0.01) return null;
        const z = zOfU(c.u);
        return <Cloud key={i} position={[c.sd * (BRIDGE_W / 2 + 0.3), bridgeYu(c.u) - 0.45, z]} size={c.s * vis} seed={c.seed} t={t} glow={0.4} flat={0.5} />;
      })}
    </>
  );
};

export const RainbowBridge: React.FC<{ t: number; s: BridgeState; cloudsGone?: number; cloudsBack?: number }> = ({ t, s, cloudsGone = 0, cloudsBack = 0 }) => (
  <group>
    {RAINBOW7.map((_, i) => (
      <Band key={i} i={i} t={t} s={s} />
    ))}
    <BridgeClouds t={t} gone={cloudsGone} back={cloudsBack} />
  </group>
);

// ---------- the sky ----------
const SKY_VERT = /* glsl */ `varying vec3 vDir; void main(){ vDir = normalize(position); gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`;
const SKY_FRAG = /* glsl */ `uniform float uAmt; uniform float uT; varying vec3 vDir;
void main(){ float h = vDir.y;
  vec3 low = mix(vec3(0.74, 0.77, 0.9), vec3(0.96, 0.78, 0.9), uAmt);
  vec3 mid = mix(vec3(0.48, 0.6, 0.86), vec3(0.36, 0.64, 0.98), uAmt);
  vec3 top = mix(vec3(0.24, 0.34, 0.66), vec3(0.12, 0.32, 0.88), uAmt);
  vec3 c = mix(low, mid, smoothstep(-0.2, 0.22, h)); c = mix(c, top, smoothstep(0.22, 0.85, h));
  vec3 sun = normalize(vec3(-0.45, 0.42, -0.78)); float s = max(dot(vDir, sun), 0.0);
  c += vec3(1.0, 0.92, 0.75) * (pow(s, 380.0) * 2.4 + pow(s, 16.0) * 0.32);
  // faint aurora-like colour veils that grow with the rainbow's magic
  float band = sin(vDir.x * 6.0 + vDir.z * 3.0 + uT * 0.1) * 0.5 + 0.5;
  c += uAmt * 0.07 * vec3(band, 0.5 - 0.5 * band, 1.0 - band) * smoothstep(0.1, 0.6, h);
  gl_FragColor = vec4(c, 1.0); }`;
const DaySky: React.FC<{ amt: number; t: number }> = ({ amt, t }) => {
  const uniforms = useMemo(() => ({ uAmt: { value: 0 }, uT: { value: 0 } }), []);
  uniforms.uAmt.value = amt;
  uniforms.uT.value = t;
  return (
    <mesh renderOrder={-10}>
      <sphereGeometry args={[480, 48, 32]} />
      <shaderMaterial vertexShader={SKY_VERT} fragmentShader={SKY_FRAG} uniforms={uniforms} side={THREE.BackSide} depthWrite={false} fog={false} />
    </mesh>
  );
};

const PUFF_GEO = new THREE.SphereGeometry(1, 20, 14);
const CloudSea: React.FC<{ t: number; y: number; amt: number }> = ({ t, y, amt }) => {
  const count = 300;
  const puffs = useMemo(() => {
    const r = rng(1313);
    return Array.from({ length: count }, () => {
      const a = r() * Math.PI * 2;
      const d = 6 + Math.sqrt(r()) * 230;
      return { x: Math.cos(a) * d, z: -50 + Math.sin(a) * d, y: y + (r() - 0.5) * 4, s: 5 + r() * 9 + d * 0.04, ph: r() * 6, tint: r() };
    });
  }, [y]);
  const mesh = useMemo(() => {
    const m = new THREE.InstancedMesh(PUFF_GEO, new THREE.MeshStandardMaterial({ color: "#ffffff", roughness: 1, emissive: new THREE.Color("#c8d4ff"), emissiveIntensity: 0.32 }), count);
    m.frustumCulled = false;
    return m;
  }, []);
  const o = new THREE.Object3D();
  const col = new THREE.Color();
  const tints = RAINBOW7.map((c) => new THREE.Color(c));
  puffs.forEach((p, i) => {
    o.position.set(p.x + Math.sin(t * 0.04 + p.ph) * 2, p.y + Math.sin(t * 0.3 + p.ph) * 0.3, p.z);
    o.scale.set(p.s, p.s * 0.42, p.s);
    o.updateMatrix();
    mesh.setMatrixAt(i, o.matrix);
    col.set("#ffffff").lerp(tints[Math.floor(p.tint * 7)], 0.12 * amt);
    mesh.setColorAt(i, col);
  });
  mesh.instanceMatrix.needsUpdate = true;
  if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
  return <primitive object={mesh} />;
};

const Lights: React.FC<{ amt: number }> = ({ amt }) => (
  <>
    <hemisphereLight args={["#eef4ff", "#c0b0e8", 1.0 + amt * 0.2]} />
    <directionalLight
      position={[-40, 60, 20]}
      intensity={1.9 + amt * 0.4}
      color="#fff4e6"
      castShadow
      shadow-mapSize={[2048, 2048]}
      shadow-camera-left={-40}
      shadow-camera-right={40}
      shadow-camera-top={40}
      shadow-camera-bottom={-40}
      shadow-camera-near={1}
      shadow-camera-far={200}
      shadow-bias={-0.0006}
    />
    <directionalLight position={[30, 20, -40]} intensity={0.45} color="#e0d0ff" />
  </>
);

// ---------- island features ----------
const FlowerPatch: React.FC<{ at: V3; t: number; col: number; r: number }> = ({ at, t, col, r }) => {
  const items = useMemo(() => {
    const q = rng(77);
    return Array.from({ length: 22 }, (_, i) => {
      const a = q() * Math.PI * 2;
      const d = 1.2 + q() * (r - 1.8);
      return { x: Math.cos(a) * d, z: Math.sin(a) * d, s: 0.35 + q() * 0.3, ph: q() * 6, c: ["#ff3a52", "#ff5f7a", "#ff2a3a"][i % 3] };
    });
  }, [r]);
  return (
    <group position={at}>
      {items.map((it, i) => {
        const open = 0.45 + 0.55 * col;
        const c = grey(it.c, col);
        return (
          <group key={i} position={[it.x, 0, it.z]} scale={it.s} rotation={[Math.sin(t + it.ph) * 0.05, 0, Math.sin(t * 0.8 + it.ph) * 0.06]}>
            <mesh position={[0, 0.6, 0]}>
              <cylinderGeometry args={[0.05, 0.06, 1.2, 6]} />
              <meshStandardMaterial color={grey("#3faa48", 0.3 + 0.7 * col)} />
            </mesh>
            {Array.from({ length: 6 }, (_, k) => (
              <mesh key={k} position={[0, 1.25, 0]} rotation={[0, (k / 6) * Math.PI * 2, 0]}>
                <mesh rotation={[-(0.25 + open * 1.0), 0, 0]}>
                  <mesh position={[0, 0.34, 0]} scale={[0.6, 1, 0.14]}>
                    <sphereGeometry args={[0.34, 10, 8]} />
                    <meshStandardMaterial color={c} emissive={c} emissiveIntensity={0.15 + 0.3 * col} />
                  </mesh>
                </mesh>
              </mesh>
            ))}
            <mesh position={[0, 1.25, 0]}>
              <sphereGeometry args={[0.14, 10, 8]} />
              <meshStandardMaterial color={grey("#ffe060", col)} emissive={grey("#ffb020", col)} emissiveIntensity={0.4 * col} />
            </mesh>
          </group>
        );
      })}
    </group>
  );
};

const FALL_FRAG = /* glsl */ `uniform float uT; uniform float uCol; uniform float uRain; uniform float uOn; varying vec2 vUv;
void main(){
  float flow = fract(vUv.y * 6.0 + uT * 1.6 + sin(vUv.x * 20.0) * 0.05);
  float streak = 0.55 + 0.45 * sin(vUv.x * 60.0 + sin(vUv.y * 9.0 + uT) * 2.0);
  vec3 blue = vec3(0.35, 0.7, 1.0);
  vec3 g = vec3(0.78, 0.8, 0.86);
  vec3 c = mix(g, blue, uCol);
  // rainbow light falls (celebration): hue across the fall's width
  vec3 rb = 0.5 + 0.5 * cos(6.2831 * (vUv.x * 1.0 + vec3(0.0, 0.33, 0.67)));
  c = mix(c, rb * 1.3, uRain);
  c *= (0.75 + 0.35 * streak) * (0.85 + 0.3 * smoothstep(0.6, 1.0, flow));
  float edge = smoothstep(0.0, 0.15, vUv.x) * smoothstep(1.0, 0.85, vUv.x) * smoothstep(0.0, 0.25, vUv.y);
  gl_FragColor = vec4(c * (1.0 + uRain * 0.6), edge * uOn * (0.75 + 0.2 * streak));
}`;
const FALL_VERT = /* glsl */ `varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`;

// A waterfall (or a fall of rainbow light) pouring from `top` down `len` units
export const LightFall: React.FC<{ top: V3; len: number; width: number; t: number; col?: number; rain?: number; on?: number; rotY?: number }> = ({ top, len, width, t, col = 1, rain = 0, on = 1, rotY = 0 }) => {
  const uniforms = useMemo(() => ({ uT: { value: 0 }, uCol: { value: 1 }, uRain: { value: 0 }, uOn: { value: 1 } }), []);
  uniforms.uT.value = t;
  uniforms.uCol.value = col;
  uniforms.uRain.value = rain;
  uniforms.uOn.value = on;
  if (on <= 0.001) return null;
  return (
    <group position={top} rotation={[0, rotY, 0]}>
      <mesh position={[0, -len / 2, 0]}>
        <planeGeometry args={[width, len, 1, 1]} />
        <shaderMaterial vertexShader={FALL_VERT} fragmentShader={FALL_FRAG} uniforms={uniforms} transparent depthWrite={false} side={THREE.DoubleSide} toneMapped={false} />
      </mesh>
    </group>
  );
};

const Pool: React.FC<{ at: V3; r: number; col: number; t: number }> = ({ at, r, col, t }) => (
  <group position={at}>
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.03, 0]}>
      <circleGeometry args={[r, 40]} />
      <meshStandardMaterial color={grey("#3aa8ff", col)} emissive={grey("#2a80ff", col)} emissiveIntensity={0.25 + 0.35 * col + 0.05 * Math.sin(t * 3)} roughness={0.1} metalness={0.2} />
    </mesh>
    {/* rocks around the pool */}
    {Array.from({ length: 9 }, (_, i) => {
      const a = (i / 9) * Math.PI * 2;
      return (
        <mesh key={i} position={[Math.cos(a) * r, 0.12, Math.sin(a) * r]} scale={[0.4, 0.25, 0.35]}>
          <dodecahedronGeometry args={[1, 0]} />
          <meshStandardMaterial color="#b8b0d8" roughness={0.9} flatShading />
        </mesh>
      );
    })}
  </group>
);

const SunFlower: React.FC<{ at: V3; col: number; t: number }> = ({ at, col, t }) => {
  const gold = grey("#ffc828", col);
  return (
    <group position={at}>
      <mesh position={[0, 1.4, 0]}>
        <cylinderGeometry args={[0.12, 0.16, 2.8, 8]} />
        <meshStandardMaterial color={grey("#58b048", 0.3 + 0.7 * col)} />
      </mesh>
      <group position={[0, 3.0, 0]} rotation={[0.2, 0, t * 0.15]}>
        <mesh>
          <sphereGeometry args={[0.7, 24, 16]} />
          <meshStandardMaterial color={gold} emissive={grey("#ffb000", col)} emissiveIntensity={0.2 + 1.2 * col} />
        </mesh>
        {Array.from({ length: 12 }, (_, i) => (
          <mesh key={i} rotation={[0, 0, (i / 12) * Math.PI * 2]}>
            <mesh position={[0, 1.15, 0]}>
              <coneGeometry args={[0.22, 0.8, 8]} />
              <meshStandardMaterial color={gold} emissive={grey("#ffa000", col)} emissiveIntensity={0.15 + 0.9 * col} />
            </mesh>
          </mesh>
        ))}
      </group>
      <Halo position={[0, 3.0, 0.3]} size={3 + 5 * col} color="#ffe080" opacity={0.1 + 0.55 * col} />
    </group>
  );
};

// a glowing thread of light tying an island to the bridge; thin and dim while the magic is weak
const Thread: React.FC<{ a: V3; b: V3; on: number; color?: string }> = ({ a, b, on, color = "#fff0c0" }) => {
  const va = new THREE.Vector3(...a);
  const vb = new THREE.Vector3(...b);
  const mid = va.clone().add(vb).multiplyScalar(0.5);
  const len = va.distanceTo(vb);
  const q = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), vb.clone().sub(va).normalize());
  return (
    <mesh position={mid.toArray()} quaternion={q}>
      <cylinderGeometry args={[0.05 + 0.08 * on, 0.05 + 0.08 * on, len, 6]} />
      <meshBasicMaterial color={new THREE.Color(color).multiplyScalar(0.6 + 1.6 * on)} transparent opacity={0.25 + 0.6 * on} toneMapped={false} depthWrite={false} />
    </mesh>
  );
};

// ---------- the Rainbow Gate ----------
export const GATE_R = 2.5;
// socket i (0 = red, on the left) in world space
export const socketAt = (i: number): V3 => {
  const a = Math.PI * (0.88 - (i / 6) * 0.76);
  return [Math.cos(a) * GATE_R, BRIDGE_H + Math.sin(a) * GATE_R + 0.4, GATE_Z + 0.25];
};

export const RainbowGate: React.FC<{ t: number; filled: number[]; open: number; banana?: number; col?: number }> = ({ t, filled, open, banana = 0, col = 0.3 }) => (
  <group>
    {/* the arch */}
    <mesh position={[0, BRIDGE_H + 0.4, GATE_Z]}>
      <torusGeometry args={[GATE_R, 0.26, 16, 64, Math.PI]} />
      <meshStandardMaterial color="#e8dcff" roughness={0.35} metalness={0.3} emissive="#b89cff" emissiveIntensity={0.15 + 0.5 * open} />
    </mesh>
    {[-1, 1].map((sd) => (
      <mesh key={sd} position={[sd * GATE_R, BRIDGE_H + 0.2, GATE_Z]}>
        <cylinderGeometry args={[0.42, 0.5, 0.8, 16]} />
        <meshStandardMaterial color="#e8deff" roughness={0.4} />
      </mesh>
    ))}
    {/* seven sockets */}
    {RAINBOW7.map((c, i) => {
      const p = socketAt(i);
      const k = filled[i] ?? 0;
      const cc = new THREE.Color(grey(c, 0.15 + 0.85 * k));
      return (
        <group key={i} position={p}>
          <mesh>
            <torusGeometry args={[0.3, 0.06, 10, 24]} />
            <meshStandardMaterial color="#ffe6a0" metalness={0.8} roughness={0.25} emissive="#ffb040" emissiveIntensity={0.2} />
          </mesh>
          <mesh scale={0.24 + 0.04 * k}>
            <sphereGeometry args={[1, 20, 14]} />
            <meshBasicMaterial color={cc.multiplyScalar(0.7 + 1.5 * k)} toneMapped={false} />
          </mesh>
          {k > 0.05 && <Halo position={[0, 0, 0.1]} size={1.6 * k} color={c} opacity={0.6 * k} />}
        </group>
      );
    })}
    {banana > 0.01 && <Halo position={add3(socketAt(1), [0, 0, 0.3])} size={2.5 + 3 * banana} color="#ffd040" opacity={0.75 * banana} />}
    {/* the shimmering veil inside the arch, which parts when the gate opens */}
    {open < 0.99 &&
      [-1, 1].map((sd) => (
        <mesh key={sd} position={[sd * (GATE_R / 2) * (1 + open * 1.2), BRIDGE_H + 0.4 + GATE_R * 0.42, GATE_Z - 0.05]} scale={[1 - open, 1, 1]}>
          <planeGeometry args={[GATE_R, GATE_R * 1.1]} />
          <meshBasicMaterial color={new THREE.Color("#e8dcff").multiplyScalar(1.1 + 0.2 * Math.sin(t * 3 + sd))} transparent opacity={(0.35 + 0.15 * col) * (1 - open)} side={THREE.DoubleSide} toneMapped={false} depthWrite={false} />
        </mesh>
      ))}
  </group>
);

// ---------- the chamber of the Rainbow Heart ----------
const heartGeo = () => {
  const s = new THREE.Shape();
  s.moveTo(0, -1.0);
  s.bezierCurveTo(-0.3, -0.7, -1.1, -0.25, -1.05, 0.35);
  s.bezierCurveTo(-1.0, 0.95, -0.25, 1.05, 0, 0.55);
  s.bezierCurveTo(0.25, 1.05, 1.0, 0.95, 1.05, 0.35);
  s.bezierCurveTo(1.1, -0.25, 0.3, -0.7, 0, -1.0);
  const g = new THREE.ExtrudeGeometry(s, { depth: 0.36, bevelEnabled: true, bevelThickness: 0.22, bevelSize: 0.16, bevelSegments: 6, curveSegments: 28 });
  g.translate(0, 0, -0.18);
  g.computeVertexNormals();
  return g;
};
const HEART_VERT = /* glsl */ `varying vec3 vP; varying vec3 vN; varying vec3 vV;
void main(){ vP = position; vec4 mv = modelViewMatrix * vec4(position, 1.0); vN = normalize(normalMatrix * normal); vV = normalize(-mv.xyz); gl_Position = projectionMatrix * mv; }`;
const HEART_FRAG = /* glsl */ `uniform float uSat; uniform float uGlow; uniform float uT; varying vec3 vP; varying vec3 vN; varying vec3 vV;
vec3 rb(float k){ k = clamp(k, 0.0, 0.999) * 7.0; int i = int(floor(k));
  vec3 c[7]; c[0]=vec3(1.0,0.3,0.37); c[1]=vec3(1.0,0.6,0.24); c[2]=vec3(1.0,0.85,0.23); c[3]=vec3(0.31,0.84,0.42); c[4]=vec3(0.25,0.62,1.0); c[5]=vec3(0.35,0.36,0.94); c[6]=vec3(0.69,0.36,1.0);
  vec3 a = c[0]; vec3 b = c[0];
  for (int j = 0; j < 7; j++) { if (j == i) a = c[j]; if (j == min(i + 1, 6)) b = c[j]; }
  return mix(a, b, smoothstep(0.3, 0.7, fract(k))); }
void main(){
  float k = 1.0 - (vP.y + 1.05) / 2.15;
  vec3 c = rb(k + 0.03 * sin(uT * 2.0 + vP.x * 3.0));
  float lum = dot(c, vec3(0.299, 0.587, 0.114));
  c = mix(vec3(lum) * vec3(0.85, 0.87, 0.95), c, uSat);
  vec3 L = normalize(vec3(-0.4, 0.7, 0.6));
  float d = 0.55 + 0.45 * max(dot(vN, L), 0.0);
  float rim = pow(1.0 - max(dot(vN, vV), 0.0), 2.2);
  float spec = pow(max(dot(reflect(-L, vN), vV), 0.0), 30.0);
  vec3 col = c * d * (0.8 + uGlow * 0.45) + rim * mix(vec3(0.6), c * 0.6 + 0.4, uSat) * (0.3 + 0.3 * uGlow) + spec * 0.5;
  gl_FragColor = vec4(col, 1.0);
}`;
export const RainbowHeart: React.FC<{ position: V3; t: number; sat: number; glow: number; scale?: number }> = ({ position, t, sat, glow, scale = 1 }) => {
  const geo = useMemo(() => heartGeo(), []);
  const uniforms = useMemo(() => ({ uSat: { value: 0 }, uGlow: { value: 0 }, uT: { value: 0 } }), []);
  uniforms.uSat.value = sat;
  uniforms.uGlow.value = glow;
  uniforms.uT.value = t;
  const beat = 1 + 0.04 * glow * Math.max(0, Math.sin(t * 6)) ** 8;
  return (
    <group position={[position[0], position[1] + Math.sin(t * 1.3) * 0.12, position[2]]}>
      <Halo position={[0, 0, -0.9]} size={3 + glow * 7} color={sat > 0.5 ? "#ffd8f4" : "#d8dce8"} opacity={0.15 + 0.35 * glow} />
      <mesh geometry={geo} rotation={[0, Math.sin(t * 0.6) * 0.5, 0]} scale={scale * 0.85 * beat}>
        <shaderMaterial vertexShader={HEART_VERT} fragmentShader={HEART_FRAG} uniforms={uniforms} toneMapped={false} />
      </mesh>
    </group>
  );
};

export const Chamber: React.FC<{ t: number; lit: number; pedestal: number }> = ({ t, lit, pedestal }) => {
  const y = BRIDGE_H;
  const R = 5.4;
  return (
    <group>
      {/* a round crystal floor laid on the bridge */}
      <mesh position={[0, y + 0.03, CHAMBER_Z]} rotation={[-Math.PI / 2, 0, 0]} renderOrder={3}>
        <circleGeometry args={[R + 0.4, 64]} />
        <meshStandardMaterial color="#d8d0f0" roughness={0.25} metalness={0.2} transparent opacity={0.92} emissive="#c8b8ff" emissiveIntensity={0.05 + 0.3 * lit} />
      </mesh>
      {[0, 1, 2].map((k) => (
        <mesh key={k} position={[0, y + 0.05, CHAMBER_Z]} rotation={[-Math.PI / 2, 0, 0]} renderOrder={4}>
          <ringGeometry args={[1.6 + k * 1.2, 1.7 + k * 1.2, 64]} />
          <meshBasicMaterial color={new THREE.Color(RAINBOW7[(k * 2 + 1) % 7]).multiplyScalar(0.4 + 1.2 * lit)} transparent opacity={0.3 + 0.5 * lit} toneMapped={false} />
        </mesh>
      ))}
      {/* columns, open toward the gate */}
      {Array.from({ length: 10 }, (_, i) => {
        const a = (i / 10) * Math.PI * 2 + Math.PI / 10;
        if (Math.cos(a - Math.PI / 2) > 0.75) return null; // the front (toward +z) stays open
        const c = RAINBOW7[i % 7];
        return (
          <group key={i} position={[Math.cos(a) * R, y, CHAMBER_Z + Math.sin(a) * R]}>
            <mesh position={[0, 2.8, 0]} castShadow>
              <cylinderGeometry args={[0.24, 0.3, 5.6, 16]} />
              <meshStandardMaterial color="#f8f4ff" roughness={0.3} emissive="#ffffff" emissiveIntensity={0.08} />
            </mesh>
            <mesh position={[0, 5.7, 0]}>
              <sphereGeometry args={[0.36, 16, 12]} />
              <meshBasicMaterial color={new THREE.Color(grey(c, 0.2 + 0.8 * lit)).multiplyScalar(0.6 + 1.1 * lit)} toneMapped={false} />
            </mesh>
          </group>
        );
      })}
      {/* glassy dome */}
      <mesh position={[0, y + 5.9, CHAMBER_Z]}>
        <sphereGeometry args={[R + 0.3, 48, 20, 0, Math.PI * 2, 0, Math.PI / 2.6]} />
        <meshStandardMaterial color="#efe6ff" transparent opacity={0.16} roughness={0.1} side={THREE.DoubleSide} emissive="#d8c8ff" emissiveIntensity={0.1 + 0.4 * lit} depthWrite={false} />
      </mesh>
      <mesh position={[0, y + 5.9, CHAMBER_Z]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[R + 0.3, 0.14, 10, 64]} />
        <meshStandardMaterial color="#ffe6a0" metalness={0.8} roughness={0.25} emissive="#ffb040" emissiveIntensity={0.2 + 0.4 * lit} />
      </mesh>
      {/* the pedestal */}
      <group position={PEDESTAL}>
        <mesh position={[0, 0.2, 0]} castShadow receiveShadow>
          <cylinderGeometry args={[1.25, 1.4, 0.4, 32]} />
          <meshStandardMaterial color="#efe8ff" roughness={0.35} />
        </mesh>
        <mesh position={[0, 0.65, 0]} castShadow>
          <cylinderGeometry args={[0.7, 0.9, 0.5, 32]} />
          <meshStandardMaterial color="#f6f0ff" roughness={0.3} emissive="#ffd8a0" emissiveIntensity={0.1 + 1.2 * pedestal} />
        </mesh>
        {RAINBOW7.map((c, i) => {
          const a = (i / 7) * Math.PI * 2;
          return (
            <mesh key={i} position={[Math.cos(a) * 1.05, 0.42, Math.sin(a) * 1.05]}>
              <sphereGeometry args={[0.09, 10, 8]} />
              <meshBasicMaterial color={new THREE.Color(grey(c, pedestal)).multiplyScalar(0.5 + 1.5 * pedestal)} toneMapped={false} />
            </mesh>
          );
        })}
        <Halo position={[0, 0.95, 0]} size={1 + 3 * pedestal} color="#ffe0a0" opacity={0.6 * pedestal} />
      </group>
      <Motes t={t} center={[0, y + 3, CHAMBER_Z]} size={[10, 6, 10]} count={120} color="#fff0ff" bright={0.3 + 0.7 * lit} />
    </group>
  );
};

// ---------- the whole place ----------
export type SkyState = { amt: number; drift: number; bridge: BridgeState; cloudsGone?: number; cloudsBack?: number; isleCol?: { flower: number; falls: number; sun: number }; rainFalls?: number; threads?: number };

export const RainbowSky: React.FC<{ t: number; s: SkyState; gate?: { filled: number[]; open: number; banana?: number }; chamber?: { lit: number; pedestal: number }; heart?: { sat: number; glow: number }; arrivePortal?: number }> = ({
  t,
  s,
  gate,
  chamber,
  heart,
  arrivePortal = 0,
}) => {
  const ic = s.isleCol ?? { flower: 0.15, falls: 0.15, sun: 0.15 };
  const fl = isleAt("flower", s.drift);
  const fa = isleAt("falls", s.drift);
  const su = isleAt("sun", s.drift);
  const far = isleAt("far", s.drift);
  const rain = s.rainFalls ?? 0;
  const th = s.threads ?? 0.2;
  return (
    <>
      <fogExp2 attach="fog" args={[new THREE.Color("#b4c0e8").lerp(new THREE.Color("#c8c0f4"), s.amt).getStyle(), 0.0042]} />
      <DaySky amt={s.amt} t={t} />
      <Halo position={[-0.45 * 400, 0.42 * 400, -0.78 * 400]} size={150} color="#fff4d8" opacity={0.55} />
      <Lights amt={s.amt} />
      <CloudSea t={t} y={-16} amt={s.amt} />
      {/* the arrival island */}
      <FloatingIsland position={ARRIVE} radius={ARRIVE_R} seed={21} t={0} bob={0} grass={grey("#8fe0a0", 0.45 + 0.55 * s.amt)} rock="#a898d8" crystals={6} crystalColor={grey("#ff9fe0", 0.4 + 0.6 * s.amt)} glow={0.6} />
      <FlowerPatch at={[3.6, 0, 11]} t={t} col={0.3 + 0.7 * s.amt} r={3.2} />
      {arrivePortal > 0.01 && (
        <group position={[0, 1.8, 12]}>
          {RAINBOW7.map((c, i) => (
            <mesh key={i} rotation={[0, 0, t * (0.6 + i * 0.1)]}>
              <torusGeometry args={[(0.55 + i * 0.09) * arrivePortal, 0.04, 8, 48]} />
              <meshBasicMaterial color={new THREE.Color(c).multiplyScalar(1.6)} transparent opacity={0.85 * arrivePortal} toneMapped={false} />
            </mesh>
          ))}
          <Halo position={[0, 0, 0.1]} size={3 * arrivePortal} color="#ffffff" opacity={0.7 * arrivePortal} />
        </group>
      )}
      {/* the side islands, each with its own missing colour */}
      <FloatingIsland position={fl} radius={ISLES.flower.r} seed={ISLES.flower.seed} t={0} bob={0} grass={grey("#7fd88a", 0.3 + 0.7 * ic.flower)} rock="#b0a0d8" crystals={4} crystalColor={grey("#ff5a6a", ic.flower)} glow={0.3 + 0.7 * ic.flower} />
      <FlowerPatch at={fl} t={t} col={ic.flower} r={ISLES.flower.r} />
      <FloatingIsland position={fa} radius={ISLES.falls.r} seed={ISLES.falls.seed} t={0} bob={0} grass={grey("#7fd8b0", 0.3 + 0.7 * ic.falls)} rock="#a8a0d8" crystals={4} crystalColor={grey("#4fa8ff", ic.falls)} glow={0.3 + 0.7 * ic.falls} />
      <Pool at={[fa[0] + FALLS_POOL[0], fa[1], fa[2] + FALLS_POOL[2]]} r={1.6} col={ic.falls} t={t} />
      <mesh position={[fa[0] + FALLS_POOL[0] + 0.2, fa[1] + 1.3, fa[2] + FALLS_POOL[2] - 1.9]} scale={[1.5, 1.5, 0.9]} castShadow>
        <dodecahedronGeometry args={[1, 0]} />
        <meshStandardMaterial color="#a89cd0" roughness={0.9} flatShading />
      </mesh>
      <LightFall top={[fa[0] + FALLS_POOL[0] + 0.1, fa[1] + 2.5, fa[2] + FALLS_POOL[2] - 1.05]} len={2.5} width={1.3} t={t} col={ic.falls} rain={rain} />
      <LightFall top={[fa[0] + ISLES.falls.r + 0.1, fa[1] - 0.05, fa[2] - 0.6]} len={16} width={2.0} t={t} col={ic.falls} rain={rain} />
      <FloatingIsland position={su} radius={ISLES.sun.r} seed={ISLES.sun.seed} t={0} bob={0} grass={grey("#a8e070", 0.3 + 0.7 * ic.sun)} rock="#b8a8d0" crystals={4} crystalColor={grey("#ffc828", ic.sun)} glow={0.3 + 0.7 * ic.sun} />
      <SunFlower at={[su[0] - 1.8, su[1], su[2] - 1.5]} col={ic.sun} t={t} />
      <FloatingIsland position={far} radius={ISLES.far.r} seed={ISLES.far.seed} t={0} bob={0} grass={grey("#90e0c0", 0.45 + 0.55 * s.amt)} rock="#a898d8" crystals={6} crystalColor={grey("#b88aff", 0.4 + 0.6 * s.amt)} glow={0.6} />
      {/* rainbow light falls pouring off the islands (celebration) */}
      {rain > 0.01 && (
        <>
          <LightFall top={[fl[0] - 1, fl[1] + 0.02, fl[2] + ISLES.flower.r - 0.4]} len={18} width={2.2} t={t} rain={1} on={rain} />
          <LightFall top={[su[0], su[1] + 0.02, su[2] + ISLES.sun.r - 0.4]} len={22} width={2.4} t={t + 3} rain={1} on={rain} />
          <LightFall top={[-2.2, BRIDGE_H - 0.2, CHAMBER_Z + 3]} len={30} width={1.8} t={t + 5} rain={1} on={rain} rotY={Math.PI / 2} />
          <LightFall top={[2.2, BRIDGE_H - 0.2, CHAMBER_Z - 3]} len={30} width={1.8} t={t + 7} rain={1} on={rain} rotY={Math.PI / 2} />
        </>
      )}
      {/* threads of light tying the islands to the bridge */}
      <Thread a={[fl[0] + ISLES.flower.r * 0.8, fl[1] - 0.2, fl[2]]} b={[-BRIDGE_W / 2, bridgeY(-20) - 0.1, -20]} on={th} />
      <Thread a={[fa[0] - ISLES.falls.r * 0.8, fa[1] - 0.2, fa[2]]} b={[BRIDGE_W / 2, bridgeY(-30) - 0.1, -30]} on={th} />
      <Thread a={[su[0] + ISLES.sun.r * 0.8, su[1] - 0.2, su[2]]} b={[-BRIDGE_W / 2, bridgeY(-52) - 0.1, -52]} on={th} />
      {/* faraway decorative islands */}
      {[
        [-46, 18, -90, 7],
        [44, 22, -100, 8],
        [-60, 6, -40, 5],
        [58, 12, -40, 6],
        [26, 30, -140, 10],
        [-30, 34, -150, 9],
      ].map(([x, y, z, r], i) => (
        <FloatingIsland key={i} position={[x, y + Math.sin(t * 0.4 + i) * 0.3, z]} radius={r} seed={50 + i} t={0} bob={0} grass={grey(["#9fe0b0", "#ffd0e8", "#c8e8ff"][i % 3], 0.4 + 0.6 * s.amt)} rock="#b0a8d8" crystals={3} crystalColor={grey(RAINBOW7[(i * 3) % 7], 0.4 + 0.6 * s.amt)} glow={0.5} />
      ))}
      {Array.from({ length: 12 }, (_, i) => (
        <Cloud key={`c${i}`} position={[-60 + i * 11, 4 + (i % 4) * 8, -30 - (i % 5) * 22]} size={3 + (i % 3)} seed={300 + i} t={t} glow={0.3} />
      ))}
      <RainbowBridge t={t} s={s.bridge} cloudsGone={s.cloudsGone} cloudsBack={s.cloudsBack} />
      {gate && <RainbowGate t={t} filled={gate.filled} open={gate.open} banana={gate.banana} col={s.amt} />}
      {chamber && <Chamber t={t} lit={chamber.lit} pedestal={chamber.pedestal} />}
      {heart && <RainbowHeart position={HEART_AT} t={t} sat={heart.sat} glow={heart.glow} />}
      <Motes t={t} center={[0, 8, -20]} size={[30, 16, 50]} count={160} color="#fff4ff" bright={0.25 + 0.5 * s.amt} />
    </>
  );
};

// ---------- the Rainbow Heart's projection: a music box in an enchanted castle ----------
const HOLO_VERT = /* glsl */ `varying vec2 vUv; varying vec3 vN; varying vec3 vV; void main(){ vUv = uv; vec4 mv = modelViewMatrix * vec4(position, 1.0); vN = normalMatrix * normal; vV = -mv.xyz; gl_Position = projectionMatrix * mv; }`;
const HOLO_FRAG = /* glsl */ `uniform float uT; uniform float uOn; varying vec2 vUv; varying vec3 vN; varying vec3 vV;
void main(){ float f = pow(1.0 - abs(dot(normalize(vN), normalize(vV))), 1.5); float lines = 0.75 + 0.25 * sin(vUv.y * 120.0 - uT * 6.0);
  vec3 c = vec3(0.92, 0.85, 1.0) * (0.3 + f * 1.2) * lines; gl_FragColor = vec4(c, (0.05 + f * 0.45) * uOn); }`;

export const MusicBoxHologram: React.FC<{ position: V3; t: number; on: number; lid: number; scale?: number }> = ({ position, t, on, lid, scale = 1 }) => {
  const uniforms = useMemo(() => ({ uT: { value: 0 }, uOn: { value: 0 } }), []);
  uniforms.uT.value = t;
  uniforms.uOn.value = on;
  if (on <= 0.001) return null;
  const s = scale * (0.3 + 0.7 * on);
  const m = (c: string, k = 1, op = 0.9) => <meshBasicMaterial color={new THREE.Color(c).multiplyScalar(k)} transparent opacity={op * on} toneMapped={false} depthWrite={false} side={THREE.DoubleSide} />;
  return (
    <group position={position} scale={s}>
      <Halo position={[0, 0.3, 0]} size={8} color="#f0e0ff" opacity={0.3 * on} />
      <mesh>
        <sphereGeometry args={[2.3, 48, 24]} />
        <shaderMaterial vertexShader={HOLO_VERT} fragmentShader={HOLO_FRAG} uniforms={uniforms} transparent depthWrite={false} side={THREE.DoubleSide} />
      </mesh>
      {/* the enchanted castle behind */}
      <group position={[0, 0.2, -0.8]}>
        {[-0.9, -0.45, 0, 0.45, 0.9].map((x, i) => {
          const h = [0.9, 1.3, 1.8, 1.3, 0.9][i];
          return (
            <group key={i} position={[x, -1.2 + h / 2, 0]}>
              <mesh>
                <cylinderGeometry args={[0.14, 0.16, h, 10]} />
                {m("#d8c8ff", 1.2, 0.8)}
              </mesh>
              <mesh position={[0, h / 2 + 0.18, 0]}>
                <coneGeometry args={[0.2, 0.36, 10]} />
                {m("#b88aff", 1.5)}
              </mesh>
            </group>
          );
        })}
      </group>
      {/* the music box in front, lid opening, a tiny dancer turning */}
      <group position={[0, -0.9, 0.6]}>
        <mesh>
          <boxGeometry args={[1.1, 0.5, 0.7]} />
          {m("#ffd8a0", 1.3, 0.85)}
        </mesh>
        <group position={[0, 0.25, -0.35]} rotation={[-lid * 1.6, 0, 0]}>
          <mesh position={[0, 0.02, 0.35]}>
            <boxGeometry args={[1.12, 0.08, 0.72]} />
            {m("#ffe8c0", 1.4, 0.85)}
          </mesh>
        </group>
        <group position={[0, 0.25 + lid * 0.25, 0]} rotation={[0, t * 2, 0]}>
          <mesh position={[0, 0.15, 0]}>
            <coneGeometry args={[0.12, 0.3, 10]} />
            {m("#ff9fe0", 1.6)}
          </mesh>
          <mesh position={[0, 0.36, 0]}>
            <sphereGeometry args={[0.06, 10, 8]} />
            {m("#ffe8f0", 1.6)}
          </mesh>
        </group>
      </group>
      {/* floating music notes */}
      {Array.from({ length: 8 }, (_, i) => {
        const k = (i * 0.37 + t * 0.25) % 1;
        return (
          <group key={`n${i}`} position={[Math.sin(i * 2.1 + t) * 1.3, -0.6 + k * 2.4, Math.cos(i * 1.3) * 0.6]} scale={0.8 * Math.sin(k * Math.PI)}>
            <mesh>
              <sphereGeometry args={[0.07, 10, 8]} />
              {m(RAINBOW7[i % 7], 2)}
            </mesh>
            <mesh position={[0.06, 0.12, 0]}>
              <boxGeometry args={[0.02, 0.25, 0.02]} />
              {m(RAINBOW7[i % 7], 2)}
            </mesh>
          </group>
        );
      })}
    </group>
  );
};
