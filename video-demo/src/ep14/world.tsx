import React, { useMemo } from "react";
import * as THREE from "three";
import { rng } from "../kit3d/World";
import { CloudSea, FloatingIsland, Halo, Stars } from "../kit3d/sky";
import { Motes } from "../kit3d/magic";
import { Cloud } from "../ep10/world";

// Episode 14: the Enchanted Music Castle on a floating island above the clouds (courtyard, silent fountain,
// golden Music Door with five symbols) and, inside, the Hall of Instruments with the golden Music Box.
// `alive` (0..1) is the castle's magic: pale and silent at 0, full colour and light at 1.
// Everything depends only on props, so every render of a frame is identical.

export type V3 = [number, number, number];
const TAU = Math.PI * 2;

// ---------- places (world units; Lumi is about 1.3 tall) ----------
export const FOUNTAIN: V3 = [0, 0, -3];
export const DOOR_Z = -16;
export const DOOR: V3 = [0, 0, DOOR_Z];
export const DOOR_W = 3.6;
export const DOOR_H = 5.4;
export const symAt = (i: number): V3 => [(i - 2) * 1.12, 6.55 + Math.cos(((i - 2) / 2.6) * Math.PI * 0.5) * 0.55 - 0.1, DOOR_Z + 0.16];
// the hall (its own room; the doorway is at z = 6)
export const HALL_W = 9;
export const BOX_AT: V3 = [0, 0.75, -15]; // the music box sits on the dais here
export const DRUM_AT: V3 = [-3.6, 0, -5.4]; // the giant banana drum (drawn in 2D)
export const BELLS_AT: V3 = [3.4, 0, -9.0]; // the bell stairs
export const FROZEN_AT: V3 = [-4.3, 0, -11.2]; // the frozen bell
export const HIGH_NOTE: V3 = [-3.2, 4.4, -5.2]; // the floating note above the drum
export const CUSHIONS_AT: V3 = [3.2, 0, -4.9];
export const bellAt = (i: number): V3 => [BELLS_AT[0] - 1.0 + i * 0.5, 0.55 + i * 0.22, BELLS_AT[2]];

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
const GREY = new THREE.Color("#b4aec4");
/** a colour faded toward a pale lavender grey while the castle's magic is gone */
export const live = (c: string, alive: number, floor = 0.3) => new THREE.Color(c).lerp(GREY, (1 - alive) * (1 - floor));
const lit = (c: string, k: number) => new THREE.Color(c).multiplyScalar(k);

const stoneTex = (seed: number, base: [number, number, number], repeat: [number, number] = [3, 4]) =>
  canvasTex(512, 512, (x) => {
    const r = rng(seed);
    x.fillStyle = `rgb(${base[0] * 0.78},${base[1] * 0.78},${base[2] * 0.78})`;
    x.fillRect(0, 0, 512, 512);
    for (let row = 0; row < 10; row++)
      for (let col = -1; col < 6; col++) {
        const v = 0.9 + r() * 0.16;
        x.fillStyle = `rgb(${Math.floor(base[0] * v)},${Math.floor(base[1] * v)},${Math.floor(base[2] * v)})`;
        x.fillRect(col * 96 + (row % 2) * 48 + 3, row * 51 + 3, 90, 45);
      }
  }, repeat);

// paving with a ring of music notes around the fountain
const pavingTex = () =>
  canvasTex(1024, 1024, (x) => {
    x.fillStyle = "#e9e0f2";
    x.fillRect(0, 0, 1024, 1024);
    const r = rng(77);
    for (let ring = 0; ring < 12; ring++) {
      const r0 = 60 + ring * 40;
      const n = 10 + ring * 6;
      for (let i = 0; i < n; i++) {
        const a0 = (i / n) * TAU + ring * 0.2;
        const a1 = a0 + TAU / n - 0.015;
        const v = 0.9 + r() * 0.1;
        x.fillStyle = ring % 3 === 2 ? `rgb(${Math.floor(214 * v)},${Math.floor(196 * v)},${Math.floor(236 * v)})` : `rgb(${Math.floor(240 * v)},${Math.floor(232 * v)},${Math.floor(244 * v)})`;
        x.beginPath();
        x.arc(512, 512, r0 + 37, a0, a1);
        x.arc(512, 512, r0, a1, a0, true);
        x.closePath();
        x.fill();
      }
    }
    x.strokeStyle = "#d8b860";
    x.lineWidth = 5;
    for (const rr of [170, 330, 490]) {
      x.beginPath();
      x.arc(512, 512, rr, 0, TAU);
      x.stroke();
    }
    x.fillStyle = "#cfa850";
    x.font = "bold 44px serif";
    x.textAlign = "center";
    x.textBaseline = "middle";
    for (let i = 0; i < 16; i++) {
      const a = (i / 16) * TAU;
      x.save();
      x.translate(512 + Math.cos(a) * 410, 512 + Math.sin(a) * 410);
      x.rotate(a + Math.PI / 2);
      x.fillText(i % 2 ? "♪" : "♫", 0, 0);
      x.restore();
    }
  });

// marble checker for the hall floor
const hallFloorTex = () =>
  canvasTex(512, 512, (x) => {
    for (let i = 0; i < 8; i++)
      for (let j = 0; j < 8; j++) {
        x.fillStyle = (i + j) % 2 ? "#e8dcf0" : "#f8f2f6";
        x.fillRect(i * 64, j * 64, 64, 64);
      }
    x.strokeStyle = "rgba(200,170,90,0.6)";
    x.lineWidth = 2;
    for (let i = 0; i <= 8; i++) {
      x.beginPath();
      x.moveTo(i * 64, 0);
      x.lineTo(i * 64, 512);
      x.moveTo(0, i * 64);
      x.lineTo(512, i * 64);
      x.stroke();
    }
  }, [4, 8]);

// a wall band of music staff lines and notes: it glows when the castle is alive
const staffTex = () =>
  canvasTex(1024, 256, (x) => {
    x.fillStyle = "#000";
    x.fillRect(0, 0, 1024, 256);
    x.strokeStyle = "#fff";
    x.lineWidth = 4;
    for (let i = 0; i < 5; i++) {
      x.beginPath();
      for (let k = 0; k <= 1024; k += 16) {
        const y = 70 + i * 26 + Math.sin(k / 120) * 18;
        if (k === 0) x.moveTo(k, y);
        else x.lineTo(k, y);
      }
      x.stroke();
    }
    x.fillStyle = "#fff";
    x.font = "bold 92px serif";
    x.textBaseline = "middle";
    const glyphs = ["♪", "♫", "♩", "♬"];
    for (let i = 0; i < 9; i++) x.fillText(glyphs[i % 4], 40 + i * 112, 110 + Math.sin(i * 1.7) * 30);
  }, [3, 1]);

const roseTex = () =>
  canvasTex(512, 512, (x) => {
    x.fillStyle = "#000";
    x.fillRect(0, 0, 512, 512);
    const cols = ["#ff8ab8", "#ffd36a", "#8ad8ff", "#b49aff", "#8affc8", "#ffb07a"];
    for (let i = 0; i < 12; i++) {
      const a0 = (i / 12) * TAU;
      x.fillStyle = cols[i % 6];
      x.beginPath();
      x.moveTo(256, 256);
      x.arc(256, 256, 240, a0 + 0.04, a0 + TAU / 12 - 0.04);
      x.closePath();
      x.fill();
    }
    x.fillStyle = "#000";
    x.beginPath();
    x.arc(256, 256, 110, 0, TAU);
    x.fill();
    x.fillStyle = "#ffe9a0";
    x.font = "bold 170px serif";
    x.textAlign = "center";
    x.textBaseline = "middle";
    x.fillText("♫", 256, 262);
  });

// ---------- shared 3D pieces ----------
/** a music note: oval head, stem and flag */
export const Note3D: React.FC<{ position: V3; color: string; size?: number; rotY?: number; tilt?: number; glow?: number; opacity?: number }> = ({ position, color, size = 1, rotY = 0, tilt = 0, glow = 1, opacity = 1 }) => {
  const mat = <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.35 + glow * 0.9} roughness={0.35} metalness={0.15} transparent={opacity < 1} opacity={opacity} />;
  return (
    <group position={position} rotation={[0, rotY, tilt]} scale={size}>
      <mesh rotation={[0, 0, 0.45]} scale={[1.25, 0.9, 0.6]}>
        <sphereGeometry args={[0.22, 18, 12]} />
        {mat}
      </mesh>
      <mesh position={[0.22, 0.48, 0]}>
        <cylinderGeometry args={[0.035, 0.035, 0.95, 8]} />
        {mat}
      </mesh>
      <mesh position={[0.36, 0.82, 0]} rotation={[0, 0, -0.9]} scale={[1, 0.45, 0.5]}>
        <sphereGeometry args={[0.2, 12, 8]} />
        {mat}
      </mesh>
    </group>
  );
};

const NOTE_COLS = ["#ffd36a", "#ff9ad0", "#9ad8ff", "#c8a8ff", "#9affc8"];
/** slowly drifting notes in a box of space */
export const DriftNotes: React.FC<{ t: number; center: V3; size: V3; count: number; seed: number; alive: number; scale?: number; speed?: number }> = ({ t, center, size, count, seed, alive, scale = 1, speed = 1 }) => {
  const pts = useMemo(() => {
    const r = rng(seed);
    return Array.from({ length: count }, () => ({ p: [r() - 0.5, r(), r() - 0.5] as V3, ph: r() * TAU, sp: 0.4 + r() * 0.6, c: Math.floor(r() * 5), s: 0.6 + r() * 0.6 }));
  }, [count, seed]);
  return (
    <>
      {pts.map((q, i) => {
        const yy = (q.p[1] + t * 0.03 * q.sp * speed) % 1;
        const fadeIn = Math.min(1, yy * 5, (1 - yy) * 5);
        return (
          <Note3D
            key={i}
            position={[center[0] + q.p[0] * size[0] + Math.sin(t * 0.5 * q.sp + q.ph) * 0.4, center[1] + yy * size[1], center[2] + q.p[2] * size[2]]}
            color={live(NOTE_COLS[q.c], alive, 0.45).getStyle()}
            size={0.55 * q.s * scale * fadeIn}
            rotY={Math.sin(t * 0.7 * q.sp + q.ph) * 0.8}
            tilt={Math.sin(t * 0.9 + q.ph) * 0.25}
            glow={0.3 + alive * 0.8}
          />
        );
      })}
    </>
  );
};

const bellGeo = (() => {
  const pts: THREE.Vector2[] = [];
  const prof = [
    [0.02, 1.0],
    [0.16, 0.98],
    [0.28, 0.9],
    [0.34, 0.72],
    [0.38, 0.45],
    [0.46, 0.2],
    [0.58, 0.04],
    [0.6, 0.0],
    [0.54, 0.02],
  ];
  for (const [r, y] of prof) pts.push(new THREE.Vector2(r, y));
  return new THREE.LatheGeometry(pts, 40);
})();
export const Bell3D: React.FC<{ position: V3; size: number; color?: string; glow?: number; swing?: number; rotZ?: number }> = ({ position, size, color = "#f0c050", glow = 0, swing = 0, rotZ = 0 }) => (
  <group position={position} rotation={[0, 0, rotZ + swing]} scale={size}>
    <mesh geometry={bellGeo} position={[0, -1, 0]} castShadow>
      <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.12 + glow * 1.4} roughness={0.28} metalness={0.35} side={THREE.DoubleSide} />
    </mesh>
    <mesh position={[0, -0.92, 0]}>
      <sphereGeometry args={[0.1, 12, 8]} />
      <meshStandardMaterial color="#c89030" roughness={0.4} />
    </mesh>
    <mesh position={[0, 0.06, 0]}>
      <torusGeometry args={[0.09, 0.03, 8, 16]} />
      <meshStandardMaterial color="#c89030" roughness={0.4} />
    </mesh>
  </group>
);

const trumpetBell = (() => {
  const pts: THREE.Vector2[] = [];
  for (let i = 0; i <= 16; i++) {
    const k = i / 16;
    pts.push(new THREE.Vector2(0.05 + Math.pow(k, 3.2) * 0.42, k * 0.9));
  }
  return new THREE.LatheGeometry(pts, 32);
})();
export const Trumpet3D: React.FC<{ position: V3; rot: V3; size: number; alive: number; glow?: number }> = ({ position, rot, size, alive, glow = 0 }) => {
  const gold = live("#f2c24a", alive, 0.55);
  const m = <meshStandardMaterial color={gold} emissive={gold} emissiveIntensity={0.1 + glow} roughness={0.25} metalness={0.4} side={THREE.DoubleSide} />;
  return (
    <group position={position} rotation={rot} scale={size}>
      <mesh geometry={trumpetBell} rotation={[0, 0, -Math.PI / 2]} position={[0.6, 0, 0]}>
        {m}
      </mesh>
      <mesh rotation={[0, 0, Math.PI / 2]} position={[0.05, 0, 0]}>
        <cylinderGeometry args={[0.05, 0.05, 1.2, 10]} />
        {m}
      </mesh>
      <mesh rotation={[0, 0, Math.PI / 2]} position={[0.1, -0.22, 0]}>
        <cylinderGeometry args={[0.045, 0.045, 0.9, 10]} />
        {m}
      </mesh>
      <mesh position={[-0.35, -0.11, 0]}>
        <torusGeometry args={[0.11, 0.045, 8, 16, Math.PI]} />
        {m}
      </mesh>
      {[-0.05, 0.12, 0.29].map((x, i) => (
        <mesh key={i} position={[x, 0.08, 0]}>
          <cylinderGeometry args={[0.045, 0.045, 0.28, 10]} />
          {m}
        </mesh>
      ))}
      <mesh position={[-0.6, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
        <coneGeometry args={[0.06, 0.16, 10]} />
        {m}
      </mesh>
    </group>
  );
};

const violinShape = (() => {
  const s = new THREE.Shape();
  s.moveTo(0, -0.62);
  s.bezierCurveTo(0.42, -0.62, 0.44, -0.18, 0.24, -0.08);
  s.bezierCurveTo(0.16, -0.02, 0.16, 0.06, 0.24, 0.12);
  s.bezierCurveTo(0.38, 0.22, 0.36, 0.5, 0, 0.52);
  s.bezierCurveTo(-0.36, 0.5, -0.38, 0.22, -0.24, 0.12);
  s.bezierCurveTo(-0.16, 0.06, -0.16, -0.02, -0.24, -0.08);
  s.bezierCurveTo(-0.44, -0.18, -0.42, -0.62, 0, -0.62);
  return new THREE.ExtrudeGeometry(s, { depth: 0.12, bevelEnabled: true, bevelThickness: 0.03, bevelSize: 0.03, bevelSegments: 3, curveSegments: 24 });
})();
export const Violin3D: React.FC<{ position: V3; rot: V3; size: number; alive: number; glow?: number }> = ({ position, rot, size, alive, glow = 0 }) => {
  const wood = live("#d8742c", alive, 0.5);
  return (
    <group position={position} rotation={rot} scale={size}>
      <mesh geometry={violinShape} position={[0, 0, -0.06]}>
        <meshStandardMaterial color={wood} emissive={wood} emissiveIntensity={0.08 + glow} roughness={0.3} metalness={0.05} />
      </mesh>
      <mesh position={[0, 0.82, 0.05]}>
        <boxGeometry args={[0.1, 0.62, 0.06]} />
        <meshStandardMaterial color="#3a2418" roughness={0.5} />
      </mesh>
      <mesh position={[0, 1.18, 0.05]} rotation={[0, Math.PI / 2, 0]}>
        <torusGeometry args={[0.07, 0.03, 8, 16]} />
        <meshStandardMaterial color="#3a2418" roughness={0.5} />
      </mesh>
      <mesh position={[0, 0.2, 0.12]}>
        <boxGeometry args={[0.07, 1.3, 0.01]} />
        <meshStandardMaterial color="#f8f0e0" emissive="#fff6e0" emissiveIntensity={0.3 + glow} />
      </mesh>
      <mesh position={[0, -0.2, 0.13]}>
        <boxGeometry args={[0.2, 0.05, 0.04]} />
        <meshStandardMaterial color="#2a1a10" />
      </mesh>
    </group>
  );
};

const drumSideTex = (col: string) =>
  canvasTex(512, 128, (x) => {
    x.fillStyle = col;
    x.fillRect(0, 0, 512, 128);
    x.strokeStyle = "#fff4d0";
    x.lineWidth = 6;
    x.beginPath();
    for (let i = 0; i <= 16; i++) x.lineTo(i * 32, i % 2 ? 108 : 20);
    x.stroke();
  });
export const Drum3D: React.FC<{ position: V3; rot: V3; size: number; alive: number; glow?: number; color?: string }> = ({ position, rot, size, alive, glow = 0, color = "#e0506e" }) => {
  const side = useMemo(() => drumSideTex(color), [color]);
  const gold = live("#f2c24a", alive, 0.5);
  return (
    <group position={position} rotation={rot} scale={size}>
      <mesh>
        <cylinderGeometry args={[0.5, 0.5, 0.55, 32, 1, true]} />
        <meshStandardMaterial map={side} color={live("#ffffff", alive, 0.6)} emissive={color} emissiveIntensity={0.06 + glow * 0.8} roughness={0.5} side={THREE.DoubleSide} />
      </mesh>
      {[0.28, -0.28].map((y, i) => (
        <group key={i}>
          <mesh position={[0, y, 0]} rotation={[Math.PI / 2, 0, 0]}>
            <torusGeometry args={[0.5, 0.045, 10, 36]} />
            <meshStandardMaterial color={gold} roughness={0.3} metalness={0.4} />
          </mesh>
          <mesh position={[0, y, 0]} rotation={[-Math.PI / 2, 0, 0]}>
            <circleGeometry args={[0.49, 32]} />
            <meshStandardMaterial color="#fff6e8" emissive="#fff0d0" emissiveIntensity={0.15 + glow} roughness={0.7} side={THREE.DoubleSide} />
          </mesh>
        </group>
      ))}
    </group>
  );
};

// ---------- the sky above the clouds ----------
const SKY_VERT = /* glsl */ `varying vec3 vDir; void main(){ vDir = normalize(position); gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`;
const SKY_FRAG = /* glsl */ `uniform float uAlive; uniform float uT; varying vec3 vDir;
void main(){ float h = vDir.y;
  vec3 low = mix(vec3(0.86, 0.74, 0.82), vec3(1.0, 0.72, 0.66), uAlive);
  vec3 mid = mix(vec3(0.6, 0.56, 0.78), vec3(0.78, 0.58, 0.92), uAlive);
  vec3 top = mix(vec3(0.26, 0.26, 0.5), vec3(0.24, 0.22, 0.62), uAlive);
  vec3 c = mix(low, mid, smoothstep(-0.15, 0.25, h)); c = mix(c, top, smoothstep(0.25, 0.9, h));
  vec3 sun = normalize(vec3(0.55, 0.16, -0.82)); float s = max(dot(vDir, sun), 0.0);
  c += vec3(1.0, 0.82, 0.6) * (pow(s, 300.0) * 2.2 + pow(s, 10.0) * 0.36);
  float band = sin(vDir.x * 5.0 - vDir.z * 3.0 + uT * 0.12) * 0.5 + 0.5;
  c += uAlive * 0.06 * vec3(band, 0.4, 1.0 - band) * smoothstep(0.15, 0.7, h);
  gl_FragColor = vec4(c, 1.0); }`;
const DuskSky: React.FC<{ alive: number; t: number }> = ({ alive, t }) => {
  const uniforms = useMemo(() => ({ uAlive: { value: 0 }, uT: { value: 0 } }), []);
  uniforms.uAlive.value = alive;
  uniforms.uT.value = t;
  return (
    <mesh renderOrder={-10}>
      <sphereGeometry args={[480, 48, 32]} />
      <shaderMaterial vertexShader={SKY_VERT} fragmentShader={SKY_FRAG} uniforms={uniforms} side={THREE.BackSide} depthWrite={false} fog={false} />
    </mesh>
  );
};

// ---------- the fountain ----------
const basinGeo = (() => {
  const prof = [
    [0, 0],
    [2.3, 0],
    [2.35, 0.1],
    [2.3, 0.62],
    [2.1, 0.68],
    [2.0, 0.3],
    [0.5, 0.3],
    [0.5, 0.31],
  ];
  return new THREE.LatheGeometry(
    prof.map(([r, y]) => new THREE.Vector2(r, y)),
    64,
  );
})();
const bowlGeo = (() => {
  const prof = [
    [0.18, 0],
    [0.3, 0.05],
    [0.9, 0.35],
    [1.15, 0.5],
    [1.12, 0.56],
    [0.9, 0.46],
    [0.2, 0.4],
  ];
  return new THREE.LatheGeometry(
    prof.map(([r, y]) => new THREE.Vector2(r, y)),
    48,
  );
})();
const SHEET_VERT = /* glsl */ `varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`;
const SHEET_FRAG = /* glsl */ `uniform float uT; uniform float uOn; varying vec2 vUv;
void main(){ float s = sin(vUv.x * 80.0) * 0.5 + 0.5; float f = fract(vUv.y * 3.0 + uT * 1.8 + s * 0.2);
  float a = (0.35 + 0.4 * smoothstep(0.6, 1.0, f) + 0.15 * s) * uOn * smoothstep(0.0, 0.15, vUv.y);
  gl_FragColor = vec4(mix(vec3(0.7, 0.9, 1.0), vec3(1.0), f * 0.6) * 1.3, a); }`;
const WaterSheet: React.FC<{ r0: number; r1: number; h: number; y: number; t: number; on: number }> = ({ r0, r1, h, y, t, on }) => {
  const uniforms = useMemo(() => ({ uT: { value: 0 }, uOn: { value: 0 } }), []);
  uniforms.uT.value = t;
  uniforms.uOn.value = on;
  if (on < 0.01) return null;
  return (
    <mesh position={[0, y - h / 2, 0]}>
      <cylinderGeometry args={[r0, r1, h, 48, 1, true]} />
      <shaderMaterial vertexShader={SHEET_VERT} fragmentShader={SHEET_FRAG} uniforms={uniforms} transparent depthWrite={false} side={THREE.DoubleSide} toneMapped={false} />
    </mesh>
  );
};
/** jets of water in arcs, made of glowing droplets */
const Jets: React.FC<{ t: number; on: number; at: V3; n: number; r: number; h: number; colors: string[] }> = ({ t, on, at, n, r, h, colors }) => {
  if (on < 0.01) return null;
  const drops: React.ReactNode[] = [];
  for (let j = 0; j < n; j++) {
    const a = (j / n) * TAU;
    for (let k = 0; k < 9; k++) {
      const u = (k / 9 + t * 0.9) % 1;
      const x = Math.cos(a) * r * u;
      const z = Math.sin(a) * r * u;
      const y = 4 * h * u * (1 - u) * on;
      drops.push(
        <mesh key={`${j}-${k}`} position={[at[0] + x, at[1] + y, at[2] + z]}>
          <sphereGeometry args={[0.06 + 0.03 * Math.sin(u * Math.PI), 8, 6]} />
          <meshBasicMaterial color={lit(colors[j % colors.length], 1.5)} transparent opacity={0.85 * on} toneMapped={false} />
        </mesh>,
      );
    }
  }
  return <>{drops}</>;
};

export const Fountain: React.FC<{ position: V3; t: number; alive: number; flow: number }> = ({ position, t, alive, flow }) => {
  const stone = live("#f4ecf6", alive, 0.6);
  const gold = live("#f0c050", alive, 0.5);
  const water = new THREE.Color("#8ab4c8").lerp(new THREE.Color("#5ac8ff"), flow);
  return (
    <group position={position}>
      <mesh geometry={basinGeo} castShadow receiveShadow>
        <meshStandardMaterial color={stone} roughness={0.6} side={THREE.DoubleSide} />
      </mesh>
      <mesh position={[0, 0.58, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[2.08, 48]} />
        <meshStandardMaterial color={water} emissive={water} emissiveIntensity={0.15 + flow * 0.5} roughness={0.05} metalness={0.2} transparent opacity={0.9} />
      </mesh>
      {/* ripples when it flows */}
      {flow > 0.01 &&
        [0, 1, 2].map((i) => {
          const k = (t * 0.5 + i / 3) % 1;
          return (
            <mesh key={i} position={[0, 0.6, 0]} rotation={[-Math.PI / 2, 0, 0]}>
              <ringGeometry args={[0.6 + k * 1.4, 0.66 + k * 1.4, 48]} />
              <meshBasicMaterial color="#ffffff" transparent opacity={0.4 * (1 - k) * flow} toneMapped={false} />
            </mesh>
          );
        })}
      <mesh position={[0, 0.9, 0]} castShadow>
        <cylinderGeometry args={[0.28, 0.42, 1.4, 20]} />
        <meshStandardMaterial color={stone} roughness={0.6} />
      </mesh>
      <mesh geometry={bowlGeo} position={[0, 1.55, 0]} castShadow>
        <meshStandardMaterial color={stone} roughness={0.55} side={THREE.DoubleSide} />
      </mesh>
      <mesh position={[0, 2.0, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[0.95, 32]} />
        <meshStandardMaterial color={water} emissive={water} emissiveIntensity={0.2 + flow * 0.6} roughness={0.05} />
      </mesh>
      {[0, 1, 2, 3, 4, 5].map((i) => (
        <mesh key={i} position={[Math.cos((i / 6) * TAU) * 1.13, 2.06, Math.sin((i / 6) * TAU) * 1.13]}>
          <sphereGeometry args={[0.07, 10, 8]} />
          <meshStandardMaterial color={gold} emissive={gold} emissiveIntensity={0.2 + alive * 0.6} roughness={0.3} />
        </mesh>
      ))}
      {/* the golden note on top */}
      <Note3D position={[-0.25, 2.25, 0]} color={gold.getStyle()} size={1.5} glow={0.1 + alive * 0.9} />
      {/* water: spilling from the bowl, jets into the basin */}
      <WaterSheet r0={1.12} r1={1.28} h={1.4} y={2.05} t={t} on={flow} />
      <Jets t={t} on={flow} at={[0, 0.6, 0]} n={10} r={1.9} h={1.2} colors={["#a8e8ff", "#ffffff", "#ffd8f4"]} />
      <Jets t={t + 0.33} on={flow} at={[0, 3.2, 0]} n={6} r={0.95} h={0.7} colors={["#ffffff", "#c8f0ff"]} />
      {flow > 0.01 && <Halo position={[0, 2.4, 0]} size={4 * flow} color="#d8f4ff" opacity={0.35 * flow} />}
    </group>
  );
};

// ---------- the castle ----------
const Tower: React.FC<{ at: V3; r: number; h: number; roof: string; stone: THREE.Texture; alive: number; t: number; windows?: number; seed?: number; ring?: boolean }> = ({ at, r, h, roof, stone, alive, t, windows = 3, seed = 1, ring = true }) => {
  const winC = lit("#ffd890", 0.35 + alive * 1.5);
  const roofC = live(roof, alive, 0.45);
  const gold = live("#f0c050", alive, 0.5);
  return (
    <group position={at}>
      <mesh position={[0, h / 2, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[r, r * 1.06, h, 28]} />
        <meshStandardMaterial map={stone} color={live("#fbf4ff", alive, 0.7)} roughness={0.85} />
      </mesh>
      <mesh position={[0, h + 0.25, 0]}>
        <cylinderGeometry args={[r * 1.18, r * 1.12, 0.5, 28]} />
        <meshStandardMaterial map={stone} color={live("#f4ecff", alive, 0.7)} roughness={0.85} />
      </mesh>
      <mesh position={[0, h + 0.5 + r * 1.35, 0]} castShadow>
        <coneGeometry args={[r * 1.3, r * 2.7, 28]} />
        <meshStandardMaterial color={roofC} emissive={roofC} emissiveIntensity={0.08 + alive * 0.1} roughness={0.5} />
      </mesh>
      <mesh position={[0, h + 0.5 + r * 2.7 + 0.25, 0]}>
        <sphereGeometry args={[0.18 * Math.max(1, r), 12, 8]} />
        <meshStandardMaterial color={gold} emissive={gold} emissiveIntensity={0.3 + alive * 0.9} roughness={0.3} />
      </mesh>
      {ring && (
        <mesh position={[0, h * 0.62, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[r * 1.04, 0.07, 8, 40]} />
          <meshStandardMaterial color={gold} emissive={gold} emissiveIntensity={0.2 + alive * 0.6} roughness={0.3} />
        </mesh>
      )}
      {Array.from({ length: windows }, (_, i) => {
        const a = ((i + 0.5) / windows) * Math.PI - Math.PI / 2 + (seed % 3) * 0.2;
        const y = h * (0.35 + 0.45 * ((i * 0.37 + seed * 0.13) % 1));
        const flick = 0.85 + 0.15 * Math.sin(t * 2 + i + seed);
        return (
          <mesh key={i} position={[Math.sin(a) * (r + 0.02), y, Math.cos(a) * (r + 0.02)]} rotation={[0, a, 0]}>
            <planeGeometry args={[Math.min(0.5, r * 0.4), Math.min(0.95, r * 0.75)]} />
            <meshBasicMaterial color={winC.clone().multiplyScalar(flick)} toneMapped={false} />
          </mesh>
        );
      })}
    </group>
  );
};

/** a giant golden harp sculpture */
const GiantHarp: React.FC<{ position: V3; rotY: number; alive: number; t: number; size?: number }> = ({ position, rotY, alive, t, size = 1 }) => {
  const gold = live("#f0c050", alive, 0.5);
  const frame = useMemo(() => {
    const c = new THREE.CatmullRomCurve3([new THREE.Vector3(0, 0, 0), new THREE.Vector3(0.2, 2.5, 0), new THREE.Vector3(0.6, 4.6, 0), new THREE.Vector3(1.6, 5.0, 0), new THREE.Vector3(2.4, 4.3, 0), new THREE.Vector3(2.9, 4.6, 0)]);
    return new THREE.TubeGeometry(c, 64, 0.16, 10, false);
  }, []);
  const strings = Array.from({ length: 9 }, (_, i) => {
    const x = 0.32 + i * 0.28;
    const top = 4.6 + Math.sin((i / 8) * Math.PI) * 0.3 - (i > 6 ? 0.2 : 0);
    return { x, top };
  });
  return (
    <group position={position} rotation={[0, rotY, 0]} scale={size}>
      <mesh geometry={frame} castShadow>
        <meshStandardMaterial color={gold} emissive={gold} emissiveIntensity={0.15 + alive * 0.5} roughness={0.3} metalness={0.35} />
      </mesh>
      <mesh position={[1.5, 0.15, 0]} rotation={[0, 0, -0.05]} castShadow>
        <boxGeometry args={[3.0, 0.3, 0.4]} />
        <meshStandardMaterial color={gold} roughness={0.35} metalness={0.3} />
      </mesh>
      {strings.map((s, i) => (
        <mesh key={i} position={[s.x, (0.3 + s.top) / 2, 0]}>
          <cylinderGeometry args={[0.015, 0.015, s.top - 0.3, 6]} />
          <meshBasicMaterial color={lit("#fff4d0", 0.6 + alive * 0.9 * (0.8 + 0.2 * Math.sin(t * 3 + i)))} toneMapped={false} />
        </mesh>
      ))}
    </group>
  );
};

const HornFlare: React.FC<{ position: V3; rot: V3; size: number; alive: number }> = ({ position, rot, size, alive }) => {
  const gold = live("#f0c050", alive, 0.5);
  return (
    <group position={position} rotation={rot} scale={size}>
      <mesh geometry={trumpetBell} rotation={[0, 0, -Math.PI / 2]} position={[0.5, 0, 0]}>
        <meshStandardMaterial color={gold} emissive={gold} emissiveIntensity={0.15 + alive * 0.5} roughness={0.3} metalness={0.35} side={THREE.DoubleSide} />
      </mesh>
      <mesh rotation={[0, 0, Math.PI / 2]} position={[-0.1, 0, 0]}>
        <cylinderGeometry args={[0.06, 0.08, 1.2, 10]} />
        <meshStandardMaterial color={gold} roughness={0.3} metalness={0.35} />
      </mesh>
    </group>
  );
};

/** organ pipes on either side of the door */
const Pipes: React.FC<{ position: V3; alive: number; flip?: boolean }> = ({ position, alive, flip }) => {
  const gold = live("#ecc058", alive, 0.5);
  return (
    <group position={position} scale={[flip ? -1 : 1, 1, 1]}>
      {Array.from({ length: 6 }, (_, i) => {
        const h = 3.2 + Math.sin((i / 5) * Math.PI) * 2.4 + (5 - i) * 0.25;
        return (
          <group key={i} position={[i * 0.42, 0, 0]}>
            <mesh position={[0, h / 2 + 0.6, 0]} castShadow>
              <cylinderGeometry args={[0.17, 0.17, h, 16]} />
              <meshStandardMaterial color={gold} emissive={gold} emissiveIntensity={0.1 + alive * 0.35} roughness={0.25} metalness={0.4} />
            </mesh>
            <mesh position={[0, 1.1, 0.16]}>
              <boxGeometry args={[0.18, 0.12, 0.04]} />
              <meshStandardMaterial color="#5a3a10" />
            </mesh>
            <mesh position={[0, h + 0.6, 0]}>
              <sphereGeometry args={[0.17, 12, 8, 0, TAU, 0, Math.PI / 2]} />
              <meshStandardMaterial color={gold} roughness={0.3} />
            </mesh>
          </group>
        );
      })}
      <mesh position={[1.05, 0.3, 0]}>
        <boxGeometry args={[2.8, 0.6, 0.6]} />
        <meshStandardMaterial color={live("#d8c8e8", alive, 0.6)} roughness={0.7} />
      </mesh>
    </group>
  );
};

/** the golden Music Door: an arch with two leaves that swing inwards */
const MusicDoor: React.FC<{ alive: number; open: number; t: number; wrong: number }> = ({ alive, open, t, wrong }) => {
  const gold = live("#f2c450", alive, 0.6);
  const goldDark = live("#c8902c", alive, 0.6);
  const arch = useMemo(() => new THREE.TorusGeometry(DOOR_W / 2 + 0.25, 0.32, 12, 40, Math.PI), []);
  const leaf = (side: -1 | 1) => (
    <group position={[side * (DOOR_W / 2), 0, 0]} rotation={[0, side * -open * 1.45 + Math.sin(t * 40) * wrong * 0.02, 0]}>
      <group position={[-side * (DOOR_W / 4), 0, 0]}>
        <mesh position={[0, DOOR_H / 2 - 0.25, 0]} castShadow>
          <boxGeometry args={[DOOR_W / 2 - 0.04, DOOR_H - 0.5, 0.22]} />
          <meshStandardMaterial color={gold} emissive={gold} emissiveIntensity={0.12 + alive * 0.3} roughness={0.3} metalness={0.35} />
        </mesh>
        {[1.0, 2.4, 3.8].map((y, i) => (
          <mesh key={i} position={[0, y, 0.12]}>
            <boxGeometry args={[DOOR_W / 2 - 0.42, 1.1, 0.06]} />
            <meshStandardMaterial color={goldDark} roughness={0.35} metalness={0.3} />
          </mesh>
        ))}
        <mesh position={[side * -0.62, 2.4, 0.18]} rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[0.16, 0.04, 8, 20]} />
          <meshStandardMaterial color={gold} roughness={0.3} metalness={0.4} />
        </mesh>
        <Note3D position={[0.05, 2.25, 0.2]} color={live("#fff0b0", alive, 0.5).getStyle()} size={0.75} glow={0.2 + alive * 0.6} rotY={0} />
      </group>
    </group>
  );
  return (
    <group position={DOOR}>
      {/* warm light inside */}
      <mesh position={[0, DOOR_H / 2, -0.6]}>
        <planeGeometry args={[DOOR_W, DOOR_H]} />
        <meshBasicMaterial color={lit("#ffe6b0", 0.3 + open * 1.6)} toneMapped={false} />
      </mesh>
      {open > 0.01 && <Halo position={[0, DOOR_H / 2, -0.3]} size={6 + open * 6} color="#fff0c8" opacity={0.6 * open} />}
      {leaf(-1)}
      {leaf(1)}
      {/* frame */}
      {[-1, 1].map((s) => (
        <mesh key={s} position={[s * (DOOR_W / 2 + 0.25), DOOR_H / 2 - 0.4, 0.05]} castShadow>
          <boxGeometry args={[0.55, DOOR_H - 0.8, 0.6]} />
          <meshStandardMaterial color={gold} roughness={0.3} metalness={0.3} />
        </mesh>
      ))}
      <mesh geometry={arch} position={[0, DOOR_H - 0.8, 0.05]} scale={[1, 0.62, 1]}>
        <meshStandardMaterial color={gold} emissive={gold} emissiveIntensity={0.15 + alive * 0.4} roughness={0.3} metalness={0.3} />
      </mesh>
      <mesh position={[0, DOOR_H - 0.8, -0.02]} scale={[1, 0.62, 1]}>
        <circleGeometry args={[DOOR_W / 2, 32, 0, Math.PI]} />
        <meshStandardMaterial color={goldDark} emissive={goldDark} emissiveIntensity={0.1} roughness={0.4} />
      </mesh>
      {/* a sunburst of light on the arch above the door, where the five symbols sit */}
      <mesh position={[0, 6.4, 0.06]}>
        <circleGeometry args={[3.4, 48, 0, Math.PI]} />
        <meshStandardMaterial color={live("#f8e8c8", alive, 0.6)} roughness={0.6} />
      </mesh>
      {[0, 1, 2, 3, 4, 5, 6, 7, 8].map((i) => {
        const a = (i / 8) * Math.PI;
        return (
          <mesh key={i} position={[Math.cos(a) * 2.6, 6.4 + Math.sin(a) * 2.6, 0.08]} rotation={[0, 0, a]}>
            <boxGeometry args={[1.4, 0.08, 0.04]} />
            <meshStandardMaterial color={gold} emissive={gold} emissiveIntensity={0.2 + alive * 0.4} roughness={0.3} />
          </mesh>
        );
      })}
    </group>
  );
};

const SYM_COLS = ["#ff7aa8", "#ffc84a", "#6ad8ff", "#a88aff", "#6af0b0"];
export const SYM_COLORS = SYM_COLS;
/** the five symbol discs; their glyphs are drawn in 2D on top */
const Symbols: React.FC<{ lit: number[]; wrong: number; alive: number }> = ({ lit: on, wrong, alive }) => (
  <>
    {on.map((v, i) => {
      const c = new THREE.Color(SYM_COLS[i]).lerp(new THREE.Color("#ff5050"), wrong);
      const base = live(SYM_COLS[i], alive, 0.35);
      return (
        <group key={i} position={symAt(i)}>
          <mesh rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.46, 0.46, 0.1, 32]} />
            <meshStandardMaterial color={base.clone().lerp(c, v)} emissive={c} emissiveIntensity={0.15 + v * 2.2 + wrong * 0.8} roughness={0.3} toneMapped={v < 0.5} />
          </mesh>
          <mesh position={[0, 0, -0.01]} rotation={[Math.PI / 2, 0, 0]}>
            <torusGeometry args={[0.5, 0.06, 8, 32]} />
            <meshStandardMaterial color="#f0c050" roughness={0.3} metalness={0.4} />
          </mesh>
          {v > 0.05 && <Halo position={[0, 0, 0.1]} size={1.8 + v * 1.6} color={SYM_COLS[i]} opacity={0.6 * v} />}
        </group>
      );
    })}
  </>
);

const Bush: React.FC<{ at: V3; r: number; alive: number; t: number; seed: number }> = ({ at, r, alive, t, seed }) => {
  const blobs = useMemo(() => {
    const q = rng(seed);
    return Array.from({ length: 5 }, () => ({ p: [(q() - 0.5) * r * 1.6, r * (0.4 + q() * 0.4), (q() - 0.5) * r] as V3, s: r * (0.55 + q() * 0.35), f: q() }));
  }, [r, seed]);
  const flowers = ["#ff8ac8", "#ffd060", "#a890ff", "#ff9a6a"];
  return (
    <group position={at}>
      {blobs.map((b, i) => (
        <mesh key={i} position={b.p} castShadow>
          <sphereGeometry args={[b.s, 16, 12]} />
          <meshStandardMaterial color={live("#6cc88a", alive, 0.45)} roughness={0.85} />
        </mesh>
      ))}
      {blobs.map((b, i) => (
        <mesh key={`f${i}`} position={[b.p[0] + b.s * 0.5, b.p[1] + b.s * 0.65, b.p[2] + b.s * 0.55]}>
          <sphereGeometry args={[0.13 + 0.03 * Math.sin(t * 2 + i), 10, 8]} />
          <meshStandardMaterial color={live(flowers[(i + seed) % 4], alive, 0.35)} emissive={live(flowers[(i + seed) % 4], alive, 0.35)} emissiveIntensity={0.1 + alive * 0.6} />
        </mesh>
      ))}
    </group>
  );
};

export type CastleProps = {
  t: number;
  alive: number; // 0 silent and pale .. 1 full of music
  flow?: number; // the fountain's water
  door?: { lit: number[]; open: number; wrong?: number };
  camPos?: V3;
  notes?: number; // how many floating notes drift around (0..1 of the set)
};

export const MusicCastle: React.FC<CastleProps> = ({ t, alive, flow = 0, door = { lit: [0, 0, 0, 0, 0], open: 0 }, notes = 1 }) => {
  const stone = useMemo(() => stoneTex(41, [246, 238, 252]), []);
  const stoneT = useMemo(() => stoneTex(43, [246, 238, 252], [2, 6]), []);
  const paving = useMemo(() => pavingTex(), []);
  const roofs = ["#9a7cff", "#ff8ac0", "#6ac0ff", "#9a7cff", "#ff8ac0"];
  const gold = live("#f0c050", alive, 0.5);
  return (
    <>
      <fogExp2 attach="fog" args={[new THREE.Color("#cdb8d8").lerp(new THREE.Color("#e8c0d0"), alive).getStyle(), 0.0055]} />
      <DuskSky alive={alive} t={t} />
      <Stars t={t} count={900} bright={0.35} radius={430} />
      <Halo position={[0.55 * 400, 0.16 * 400, -0.82 * 400]} size={160} color="#ffe2c0" opacity={0.6} />
      <hemisphereLight args={["#f4ecff", "#a090c8", 0.9 + alive * 0.35]} />
      <directionalLight
        position={[40, 34, -30]}
        intensity={1.5 + alive * 0.6}
        color="#ffe6cc"
        castShadow
        shadow-mapSize={[2048, 2048]}
        shadow-camera-left={-30}
        shadow-camera-right={30}
        shadow-camera-top={30}
        shadow-camera-bottom={-30}
        shadow-camera-near={1}
        shadow-camera-far={160}
        shadow-bias={-0.0006}
      />
      <directionalLight position={[-30, 20, 30]} intensity={0.55} color="#d8d0ff" />
      <pointLight position={[0, 4, -1]} intensity={6 + alive * 24} distance={16} color="#ffd8f0" />
      <CloudSea t={t} y={-14} color={new THREE.Color("#e8dcf4").lerp(new THREE.Color("#ffe0ec"), alive).getStyle()} />
      {/* distant islands */}
      <FloatingIsland position={[-48, -2, -70]} radius={6} seed={51} t={0} bob={0} grass={live("#8fe0a0", alive, 0.4).getStyle()} rock="#a898d8" crystals={3} crystalColor="#ff9fe0" glow={0.4} />
      <FloatingIsland position={[56, 4, -90]} radius={8} seed={53} t={0} bob={0} grass={live("#8fe0b0", alive, 0.4).getStyle()} rock="#a898d8" crystals={4} crystalColor="#9fd8ff" glow={0.4} />
      <FloatingIsland position={[38, -6, 30]} radius={5} seed={55} t={0} bob={0} grass={live("#8fe0a0", alive, 0.4).getStyle()} rock="#a898d8" crystals={2} crystalColor="#ffe08f" glow={0.4} />
      {[
        [-22, -3, 8],
        [24, -4, 4],
        [-16, -5, -30],
        [20, -2, -34],
        [0, -6, 22],
      ].map((p, i) => (
        <Cloud key={i} position={p as V3} size={2.6 + (i % 3)} seed={600 + i} t={t} flat={0.4} glow={0.3 + alive * 0.2} />
      ))}
      {/* the castle island */}
      <FloatingIsland position={[0, 0, -6]} radius={21} seed={61} t={0} bob={0} grass={live("#8fe0a8", alive, 0.45).getStyle()} rock="#a898d8" crystals={7} crystalColor={live("#ff9fe0", alive, 0.4).getStyle()} glow={0.4 + alive * 0.4} />
      <mesh position={[0, 0.02, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <circleGeometry args={[11, 72]} />
        <meshStandardMaterial map={paving} color={live("#ffffff", alive, 0.7)} roughness={0.75} />
      </mesh>
      {/* the path to the door */}
      <mesh position={[0, 0.025, -11]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[4.4, 10]} />
        <meshStandardMaterial map={stoneT} color={live("#f4ecf8", alive, 0.7)} roughness={0.8} />
      </mesh>
      {/* low courtyard wall with lanterns, open toward the castle and the arrival side */}
      {Array.from({ length: 22 }, (_, i) => {
        const a = (i / 22) * TAU;
        if (Math.abs(Math.sin(a)) < 0.25 && Math.cos(a) !== 0) {
          // keep openings at the front and back
        }
        const front = Math.abs(a - Math.PI / 2) < 0.4;
        const back = Math.abs(a - (3 * Math.PI) / 2) < 0.55;
        if (front || back) return null;
        const x = Math.cos(a) * 11.4;
        const z = Math.sin(a) * 11.4;
        return (
          <group key={i} position={[x, 0, z]} rotation={[0, -a, 0]}>
            <mesh position={[0, 0.5, 0]} castShadow receiveShadow>
              <boxGeometry args={[0.6, 1.0, 3.25]} />
              <meshStandardMaterial map={stone} color={live("#f4ecfa", alive, 0.7)} roughness={0.85} />
            </mesh>
            {i % 2 === 0 && (
              <>
                <mesh position={[0, 1.55, 0]}>
                  <cylinderGeometry args={[0.07, 0.07, 1.1, 8]} />
                  <meshStandardMaterial color={gold} roughness={0.3} />
                </mesh>
                <mesh position={[0, 2.2, 0]}>
                  <sphereGeometry args={[0.2, 14, 10]} />
                  <meshBasicMaterial color={lit("#ffe0a0", 0.5 + alive * 1.6)} toneMapped={false} />
                </mesh>
              </>
            )}
          </group>
        );
      })}
      <Bush at={[-6.4, 0, -6.2]} r={1.1} alive={alive} t={t} seed={1} />
      <Bush at={[6.6, 0, -6.4]} r={1.2} alive={alive} t={t} seed={2} />
      <Bush at={[-8.4, 0, 2.6]} r={1.0} alive={alive} t={t} seed={3} />
      <Bush at={[8.2, 0, 2.2]} r={1.1} alive={alive} t={t} seed={4} />
      <Fountain position={FOUNTAIN} t={t} alive={alive} flow={flow} />
      <GiantHarp position={[-8.6, 0, -4.6]} rotY={0.7} alive={alive} t={t} size={1.25} />
      {/* the castle keep: its front wall holds the Music Door */}
      <mesh position={[0, 5, DOOR_Z - 3]} castShadow receiveShadow>
        <boxGeometry args={[15, 10, 6]} />
        <meshStandardMaterial map={stone} color={live("#fbf5ff", alive, 0.7)} roughness={0.85} />
      </mesh>
      {Array.from({ length: 13 }, (_, i) => (
        <mesh key={i} position={[-7 + i * (14 / 12), 10.35, DOOR_Z - 0.2]} castShadow>
          <boxGeometry args={[0.6, 0.7, 0.6]} />
          <meshStandardMaterial map={stone} color={live("#f4ecfa", alive, 0.7)} roughness={0.85} />
        </mesh>
      ))}
      {/* a glowing band of music around the keep */}
      <WallBand y={8.6} z={DOOR_Z + 0.02} w={14.6} alive={alive} t={t} />
      <MusicDoor alive={alive} open={door.open} t={t} wrong={door.wrong ?? 0} />
      <Symbols lit={door.lit} wrong={door.wrong ?? 0} alive={alive} />
      <Pipes position={[-6.6, 0, DOOR_Z + 0.5]} alive={alive} />
      <Pipes position={[6.6, 0, DOOR_Z + 0.5]} alive={alive} flip />
      {/* arched windows on the keep */}
      {[-5.2, -3.4, 3.4, 5.2].map((x, i) => (
        <mesh key={i} position={[x, 7.3, DOOR_Z + 0.02]}>
          <planeGeometry args={[0.7, 1.3]} />
          <meshBasicMaterial color={lit("#ffd890", 0.35 + alive * 1.5)} toneMapped={false} />
        </mesh>
      ))}
      <Tower at={[-7.6, 0, DOOR_Z - 0.4]} r={1.7} h={13} roof={roofs[0]} stone={stoneT} alive={alive} t={t} seed={1} />
      <Tower at={[7.6, 0, DOOR_Z - 0.4]} r={1.7} h={13} roof={roofs[1]} stone={stoneT} alive={alive} t={t} seed={2} />
      <Tower at={[-4.4, 0, DOOR_Z - 6]} r={1.9} h={17} roof={roofs[2]} stone={stoneT} alive={alive} t={t} seed={3} windows={4} />
      <Tower at={[4.6, 0, DOOR_Z - 6]} r={1.9} h={16} roof={roofs[3]} stone={stoneT} alive={alive} t={t} seed={4} windows={4} />
      <Tower at={[0, 0, DOOR_Z - 8]} r={2.6} h={22} roof={roofs[4]} stone={stoneT} alive={alive} t={t} seed={5} windows={5} />
      <Tower at={[-11, 0, DOOR_Z - 10]} r={1.3} h={11} roof={roofs[3]} stone={stoneT} alive={alive} t={t} seed={6} windows={2} />
      <Tower at={[11.5, 0, DOOR_Z - 9]} r={1.3} h={12} roof={roofs[2]} stone={stoneT} alive={alive} t={t} seed={7} windows={2} />
      {/* giant golden horns on the towers */}
      <HornFlare position={[-6.0, 15.5, DOOR_Z - 6]} rot={[0, 0.4, 0.35]} size={2.2} alive={alive} />
      <HornFlare position={[6.2, 14.6, DOOR_Z - 6]} rot={[0, Math.PI - 0.4, 0.35]} size={2.2} alive={alive} />
      {/* a big rose window on the tall tower */}
      <RoseWindow position={[0, 17.2, DOOR_Z - 8 + 2.62]} r={1.25} alive={alive} t={t} />
      <DriftNotes t={t} center={[0, 1.2, -3]} size={[20, 12, 14]} count={Math.round(20 * notes)} seed={141} alive={alive} />
      <Motes t={t} center={[0, 4, -4]} size={[22, 10, 16]} count={120} seed={9} color="#ffe8ff" bright={0.6 + alive * 0.6} />
    </>
  );
};

const WallBand: React.FC<{ y: number; z: number; w: number; alive: number; t: number }> = ({ y, z, w, alive, t }) => {
  const tex = useMemo(() => staffTex(), []);
  tex.offset.x = t * 0.02;
  return (
    <mesh position={[0, y, z]}>
      <planeGeometry args={[w, 1.3]} />
      <meshBasicMaterial map={tex} color={lit("#ffe6a0", 0.15 + alive * 1.3)} transparent blending={THREE.AdditiveBlending} depthWrite={false} toneMapped={false} />
    </mesh>
  );
};

const RoseWindow: React.FC<{ position: V3; r: number; alive: number; t: number; rotY?: number }> = ({ position, r, alive, t, rotY = 0 }) => {
  const tex = useMemo(() => roseTex(), []);
  return (
    <group position={position} rotation={[0, rotY, 0]}>
      <mesh rotation={[0, 0, t * 0.05]}>
        <circleGeometry args={[r, 48]} />
        <meshBasicMaterial map={tex} color={lit("#ffffff", 0.25 + alive * 1.2)} toneMapped={false} />
      </mesh>
      <mesh position={[0, 0, 0.02]}>
        <torusGeometry args={[r, 0.12, 10, 48]} />
        <meshStandardMaterial color={live("#f0c050", alive, 0.5)} roughness={0.3} />
      </mesh>
    </group>
  );
};

// ---------- the golden music box ----------
export const MusicBox3D: React.FC<{ position: V3; t: number; lid: number; play: number; glow: number; slots: number[]; alive: number; scale?: number }> = ({ position, t, lid, play, glow, slots, alive, scale = 1 }) => {
  const gold = live("#f4c650", alive, 0.6);
  const pink = live("#ffb8dc", alive, 0.45);
  const W = 1.5;
  const D = 1.0;
  const H = 0.85;
  const m = (c: THREE.Color, e = 0.15) => <meshStandardMaterial color={c} emissive={c} emissiveIntensity={e + glow * 0.6} roughness={0.28} metalness={0.35} />;
  return (
    <group position={position} scale={scale}>
      {/* feet */}
      {[
        [-1, -1],
        [1, -1],
        [-1, 1],
        [1, 1],
      ].map(([sx, sz], i) => (
        <mesh key={i} position={[sx * (W / 2 - 0.1), 0.08, sz * (D / 2 - 0.1)]}>
          <sphereGeometry args={[0.1, 12, 8]} />
          {m(gold)}
        </mesh>
      ))}
      <mesh position={[0, 0.16 + H / 2, 0]} castShadow>
        <boxGeometry args={[W, H, D]} />
        {m(gold)}
      </mesh>
      {/* pink enamel panels with a golden note */}
      <mesh position={[0, 0.16 + H / 2, D / 2 + 0.005]}>
        <planeGeometry args={[W - 0.24, H - 0.24]} />
        <meshStandardMaterial color={pink} emissive={pink} emissiveIntensity={0.1 + glow * 0.5} roughness={0.4} />
      </mesh>
      {/* the three note slots on the front */}
      {slots.map((v, i) => (
        <group key={i} position={[(i - 1) * 0.4, 0.16 + H / 2, D / 2 + 0.03]}>
          <mesh>
            <torusGeometry args={[0.13, 0.03, 8, 24]} />
            {m(gold, 0.2)}
          </mesh>
          <mesh position={[0, 0, -0.01]}>
            <circleGeometry args={[0.12, 20]} />
            <meshBasicMaterial color={lit(["#ffd36a", "#ff9ad0", "#9ad8ff"][i], 0.2 + v * 1.8)} toneMapped={false} />
          </mesh>
          {v > 0.05 && <Halo position={[0, 0, 0.05]} size={0.9 * v} color={["#ffd36a", "#ff9ad0", "#9ad8ff"][i]} opacity={0.7 * v} />}
        </group>
      ))}
      {/* the lid, hinged at the back */}
      <group position={[0, 0.16 + H, -D / 2]} rotation={[-lid * 1.85, 0, 0]}>
        <mesh position={[0, 0.06, D / 2]} castShadow>
          <boxGeometry args={[W + 0.06, 0.12, D + 0.06]} />
          {m(gold)}
        </mesh>
        <mesh position={[0, 0.13, D / 2]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[W - 0.3, D - 0.3]} />
          <meshStandardMaterial color={pink} roughness={0.4} />
        </mesh>
        <mesh position={[0, -0.005, D / 2]} rotation={[Math.PI / 2, 0, 0]}>
          <planeGeometry args={[W - 0.2, D - 0.2]} />
          <meshBasicMaterial color={lit("#fff4ff", 0.5 + play * 0.9)} toneMapped={false} side={THREE.DoubleSide} />
        </mesh>
      </group>
      {/* the little dancer inside: a tiny fox spinning on her toes */}
      <group position={[0, 0.16 + H - 0.2 + lid * 0.42, 0]} rotation={[0, t * 2.4 * play, 0]} scale={0.25 + lid * 0.75}>
        <mesh position={[0, 0.12, 0]}>
          <coneGeometry args={[0.16, 0.3, 16]} />
          <meshStandardMaterial color={pink} emissive={pink} emissiveIntensity={0.3 + play * 0.6} roughness={0.4} />
        </mesh>
        <mesh position={[0, 0.34, 0]}>
          <sphereGeometry args={[0.1, 14, 10]} />
          <meshStandardMaterial color="#ffd8ec" emissive="#ffd8ec" emissiveIntensity={0.3 + play * 0.5} roughness={0.4} />
        </mesh>
        {[-1, 1].map((s) => (
          <mesh key={s} position={[s * 0.06, 0.45, 0]} rotation={[0, 0, -s * 0.3]}>
            <coneGeometry args={[0.04, 0.1, 8]} />
            <meshStandardMaterial color="#ffc0e0" roughness={0.4} />
          </mesh>
        ))}
        <mesh position={[0, -0.04, 0]}>
          <cylinderGeometry args={[0.02, 0.02, 0.12, 6]} />
          <meshStandardMaterial color={gold} />
        </mesh>
      </group>
      {/* the wind-up key on the side */}
      <group position={[W / 2 + 0.05, 0.16 + H / 2, 0]} rotation={[t * 3 * play, 0, 0]}>
        <mesh rotation={[0, 0, Math.PI / 2]} position={[0.08, 0, 0]}>
          <cylinderGeometry args={[0.03, 0.03, 0.16, 8]} />
          {m(gold)}
        </mesh>
        {[-1, 1].map((s) => (
          <mesh key={s} position={[0.18, s * 0.1, 0]} rotation={[0, Math.PI / 2, 0]}>
            <torusGeometry args={[0.08, 0.025, 8, 16]} />
            {m(gold)}
          </mesh>
        ))}
      </group>
      {glow > 0.02 && <Halo position={[0, 1.2, 0.2]} size={4 + glow * 4} color="#ffe6f6" opacity={0.45 * glow} />}
    </group>
  );
};

// ---------- the Hall of Instruments ----------
type Inst = { kind: "drum" | "trumpet" | "violin" | "bell"; p: V3; rot: V3; size: number; color?: string };
export const INSTRUMENTS: Inst[] = [
  { kind: "drum", p: [-1.4, 5.9, -12.0], rot: [0.3, 0, 0.2], size: 1.1, color: "#e0506e" },
  { kind: "trumpet", p: [-1.6, 4.4, -9.5], rot: [0, 0.3, 0.25], size: 1.2 },
  { kind: "violin", p: [1.6, 4.0, -8.4], rot: [0, -0.2, -0.5], size: 1.1 },
  { kind: "bell", p: [4.6, 3.4, -6.6], rot: [0, 0, 0.1], size: 0.7 },
  { kind: "drum", p: [4.0, 5.4, -12.5], rot: [0.4, 0, -0.25], size: 0.9, color: "#5a8ae8" },
  { kind: "trumpet", p: [-3.4, 5.8, -13.4], rot: [0, -0.4, -0.3], size: 1.1 },
  { kind: "violin", p: [-5.2, 4.8, -4.2], rot: [0, 0.4, 0.4], size: 1.0 },
  { kind: "bell", p: [0.4, 6.4, -6.0], rot: [0, 0, -0.15], size: 0.6 },
];
export const instAt = (i: number, t: number, kick = 0, chaos = 0): V3 => {
  const q = INSTRUMENTS[i];
  return [q.p[0] + Math.sin(t * 2.6 + i) * 0.4 * chaos, q.p[1] + Math.sin(t * 0.9 + i * 1.7) * 0.18 + kick * 0.5 + Math.sin(t * 3.1 + i) * 0.5 * chaos, q.p[2]];
};

const Instrument: React.FC<{ i: number; t: number; alive: number; kick: number; chaos: number; at?: V3 }> = ({ i, t, alive, kick, chaos, at }) => {
  const q = INSTRUMENTS[i];
  const p = at ?? instAt(i, t, kick, chaos);
  const wob = Math.sin(t * 22) * kick * 0.25 + Math.sin(t * 3 + i) * (0.08 + chaos * 0.6);
  const rot: V3 = at ? [0, Math.PI, 0.12 + wob * 0.3] : [q.rot[0] + wob * 0.5, q.rot[1] + Math.sin(t * 0.6 + i) * 0.25 + chaos * t * 2 * ((i % 2) * 2 - 1), q.rot[2] + wob];
  const size = q.size * (1 + kick * 0.18) * (at ? 0.75 : 1);
  const glow = 0.1 + kick * 0.9 + alive * 0.25;
  return (
    <>
      {q.kind === "drum" && <Drum3D position={p} rot={rot} size={size} alive={alive} glow={glow} color={q.color} />}
      {q.kind === "trumpet" && <Trumpet3D position={p} rot={rot} size={size} alive={alive} glow={glow} />}
      {q.kind === "violin" && <Violin3D position={p} rot={rot} size={size} alive={alive} glow={glow} />}
      {q.kind === "bell" && <Bell3D position={p} size={size} color={live("#f0c050", alive, 0.55).getStyle()} glow={glow} swing={wob} />}
      <Halo position={p} size={1.6 + kick * 2 + alive * 0.8} color="#fff0d8" opacity={0.18 + kick * 0.4 + alive * 0.12} />
    </>
  );
};

export type HallProps = {
  t: number;
  alive: number;
  kick?: number[]; // per instrument, 0..1
  chaos?: number;
  bells?: number[]; // the bell stairs, 0..1 each
  frozen?: number; // 1 frozen .. 0 melted
  frozenRing?: number;
  box: { lid: number; play: number; glow: number; slots: number[] };
  camPos?: V3;
  moved?: Record<number, V3>; // instruments pulled somewhere else (the trumpet in Draco's face)
};

export const InstrumentHall: React.FC<HallProps> = ({ t, alive, kick = [], chaos = 0, bells = [0, 0, 0, 0, 0], frozen = 1, frozenRing = 0, box, moved = {} }) => {
  const floor = useMemo(() => hallFloorTex(), []);
  const wall = useMemo(() => stoneTex(47, [236, 226, 246], [4, 2]), []);
  const gold = live("#f0c050", alive, 0.5);
  const winC = lit("#ffe0b0", 0.6 + alive * 1.4);
  const L = 30;
  return (
    <>
      <fogExp2 attach="fog" args={["#3a2a48", 0.018]} />
      <color attach="background" args={["#2a1e38"]} />
      <hemisphereLight args={["#fff0f8", "#6a5880", 1.0 + alive * 0.4]} />
      <directionalLight position={[6, 14, 8]} intensity={1.2 + alive * 0.5} color="#fff0e0" castShadow shadow-mapSize={[2048, 2048]} shadow-camera-left={-14} shadow-camera-right={14} shadow-camera-top={14} shadow-camera-bottom={-14} shadow-bias={-0.0006} />
      <pointLight position={[0, 7, -6]} intensity={30 + alive * 40} distance={26} color="#ffe0f0" />
      <pointLight position={[0, 3, -14]} intensity={10 + box.glow * 40} distance={12} color="#ffe6b0" />
      {/* floor */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, -9]} receiveShadow>
        <planeGeometry args={[HALL_W * 2, L]} />
        <meshStandardMaterial map={floor} color={live("#ffffff", alive, 0.75)} roughness={0.35} metalness={0.05} />
      </mesh>
      {/* a long carpet to the dais */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, -6]} receiveShadow>
        <planeGeometry args={[2.6, 18]} />
        <meshStandardMaterial color={live("#d84a7a", alive, 0.45)} roughness={0.9} />
      </mesh>
      {/* walls */}
      {[-1, 1].map((s) => (
        <mesh key={s} position={[s * HALL_W, 7, -9]} rotation={[0, -s * Math.PI / 2, 0]} receiveShadow>
          <planeGeometry args={[L, 14]} />
          <meshStandardMaterial map={wall} color={live("#f6eefc", alive, 0.7)} roughness={0.85} />
        </mesh>
      ))}
      <mesh position={[0, 7, -21]} receiveShadow>
        <planeGeometry args={[HALL_W * 2, 14]} />
        <meshStandardMaterial map={wall} color={live("#f6eefc", alive, 0.7)} roughness={0.85} />
      </mesh>
      <mesh position={[0, 14, -9]} rotation={[Math.PI / 2, 0, 0]}>
        <planeGeometry args={[HALL_W * 2, L]} />
        <meshStandardMaterial color={live("#b89ad8", alive, 0.6)} emissive="#4a3468" emissiveIntensity={0.6} roughness={0.9} side={THREE.DoubleSide} />
      </mesh>
      {/* glowing music bands on the walls */}
      {[-1, 1].map((s) => (
        <group key={s} position={[s * (HALL_W - 0.03), 8.6, -9]} rotation={[0, -s * Math.PI / 2, 0]}>
          <WallBand y={0} z={0} w={L - 2} alive={alive} t={t * (s > 0 ? 1 : -1)} />
        </group>
      ))}
      {/* tall arched windows */}
      {[-1, 1].map((s) =>
        [-1, -6, -11, -16].map((z, i) => (
          <group key={`${s}${i}`} position={[s * (HALL_W - 0.04), 4.6, z]} rotation={[0, -s * Math.PI / 2, 0]}>
            <mesh>
              <planeGeometry args={[1.5, 4.2]} />
              <meshBasicMaterial color={winC} toneMapped={false} />
            </mesh>
            <mesh position={[0, 2.1, 0]}>
              <circleGeometry args={[0.75, 24, 0, Math.PI]} />
              <meshBasicMaterial color={winC} toneMapped={false} />
            </mesh>
          </group>
        )),
      )}
      {/* columns */}
      {[-1, 1].map((s) =>
        [1.5, -3.5, -8.5, -13.5, -18].map((z, i) => (
          <group key={`c${s}${i}`} position={[s * (HALL_W - 1.0), 0, z]}>
            <mesh position={[0, 5, 0]} castShadow>
              <cylinderGeometry args={[0.45, 0.5, 10, 20]} />
              <meshStandardMaterial color={live("#f8f2fc", alive, 0.7)} roughness={0.6} />
            </mesh>
            <mesh position={[0, 10.1, 0]}>
              <boxGeometry args={[1.2, 0.3, 1.2]} />
              <meshStandardMaterial color={gold} emissive={gold} emissiveIntensity={0.15 + alive * 0.3} roughness={0.3} />
            </mesh>
            <mesh position={[0, 0.15, 0]}>
              <boxGeometry args={[1.2, 0.3, 1.2]} />
              <meshStandardMaterial color={gold} roughness={0.3} />
            </mesh>
          </group>
        )),
      )}
      {/* the rose window over the dais */}
      <RoseWindow position={[0, 8.6, -20.95]} r={2.4} alive={alive} t={t} />
      {/* chandeliers */}
      {[-4, -12].map((z, i) => (
        <group key={i} position={[0, 10.6, z]} rotation={[0, t * 0.2, 0]}>
          <mesh rotation={[Math.PI / 2, 0, 0]}>
            <torusGeometry args={[1.4, 0.06, 8, 40]} />
            <meshStandardMaterial color={gold} roughness={0.3} />
          </mesh>
          {Array.from({ length: 8 }, (_, k) => (
            <mesh key={k} position={[Math.cos((k / 8) * TAU) * 1.4, 0.15, Math.sin((k / 8) * TAU) * 1.4]}>
              <sphereGeometry args={[0.1, 10, 8]} />
              <meshBasicMaterial color={lit("#ffe0a0", 0.6 + alive * 1.6)} toneMapped={false} />
            </mesh>
          ))}
          <mesh position={[0, 1.8, 0]}>
            <cylinderGeometry args={[0.03, 0.03, 3.6, 6]} />
            <meshStandardMaterial color={gold} />
          </mesh>
        </group>
      ))}
      {/* the dais and the music box */}
      <mesh position={[0, 0.35, BOX_AT[2]]} receiveShadow castShadow>
        <cylinderGeometry args={[2.6, 2.9, 0.7, 48]} />
        <meshStandardMaterial color={live("#f4ecfa", alive, 0.7)} roughness={0.6} />
      </mesh>
      <mesh position={[0, 0.71, BOX_AT[2]]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[2.6, 0.05, 8, 64]} />
        <meshStandardMaterial color={gold} emissive={gold} emissiveIntensity={0.3 + alive * 0.6} roughness={0.3} />
      </mesh>
      <mesh position={[0, 1.15, BOX_AT[2]]} castShadow>
        <cylinderGeometry args={[0.7, 0.85, 0.8, 32]} />
        <meshStandardMaterial color={live("#d84a7a", alive, 0.5)} roughness={0.8} />
      </mesh>
      <MusicBox3D position={[0, 1.55, BOX_AT[2]]} t={t} lid={box.lid} play={box.play} glow={box.glow} slots={box.slots} alive={alive} scale={1.1} />
      {/* the bell stairs */}
      <group position={BELLS_AT}>
        {[0, 1, 2, 3, 4].map((i) => (
          <mesh key={i} position={[-1.0 + i * 0.5, 0.1 + i * 0.11, 0]} castShadow receiveShadow>
            <boxGeometry args={[0.5, 0.2 + i * 0.22, 0.7]} />
            <meshStandardMaterial color={live("#a8784a", alive, 0.55)} roughness={0.6} />
          </mesh>
        ))}
      </group>
      {[0, 1, 2, 3, 4].map((i) => (
        <Bell3D key={i} position={[bellAt(i)[0], bellAt(i)[1] + 0.62 - i * 0.04, bellAt(i)[2]]} size={0.6 - i * 0.065} color={live("#f0c050", alive, 0.55).getStyle()} glow={bells[i] ?? 0} swing={Math.sin(t * 18) * 0.12 * (bells[i] ?? 0)} />
      ))}
      {/* the frozen bell */}
      <group position={FROZEN_AT}>
        <mesh position={[0, 0.6, 0]} castShadow>
          <cylinderGeometry args={[0.3, 0.4, 1.2, 16]} />
          <meshStandardMaterial color={live("#f4ecfa", alive, 0.7)} roughness={0.6} />
        </mesh>
        <mesh position={[0, 2.6, 0]}>
          <boxGeometry args={[1.6, 0.12, 0.12]} />
          <meshStandardMaterial color={gold} roughness={0.3} />
        </mesh>
        {[-1, 1].map((s) => (
          <mesh key={s} position={[s * 0.75, 1.9, 0]}>
            <cylinderGeometry args={[0.05, 0.05, 1.4, 8]} />
            <meshStandardMaterial color={gold} roughness={0.3} />
          </mesh>
        ))}
        <Bell3D position={[0, 2.5, 0]} size={0.95} color={frozen > 0.5 ? "#bfe0f0" : live("#f0c050", alive, 0.55).getStyle()} glow={frozenRing} swing={Math.sin(t * 14) * 0.15 * frozenRing} />
        {frozen > 0.01 && (
          <mesh position={[0, 2.0, 0]} scale={[0.85 * frozen + 0.1, 0.95 * frozen + 0.1, 0.85 * frozen + 0.1]}>
            <icosahedronGeometry args={[1, 1]} />
            <meshStandardMaterial color="#cfefff" emissive="#8fd8ff" emissiveIntensity={0.5} transparent opacity={0.55 * Math.min(1, frozen * 1.4)} roughness={0.05} metalness={0.1} flatShading />
          </mesh>
        )}
      </group>
      {INSTRUMENTS.map((_, i) => (
        <Instrument key={i} i={i} t={t} alive={alive} kick={kick[i] ?? 0} chaos={chaos} at={moved[i]} />
      ))}
      <DriftNotes t={t} center={[0, 1.5, -9]} size={[14, 9, 18]} count={Math.round(6 + alive * 16)} seed={147} alive={alive} scale={0.7} />
      <Motes t={t} center={[0, 4, -8]} size={[16, 9, 22]} count={90} seed={19} color="#fff0d8" bright={0.5 + alive * 0.7} />
    </>
  );
};

// ---------- the next mystery: a floating flower garden above a lake ----------
const HOLO_VERT = /* glsl */ `varying vec3 vN; varying vec3 vV; void main(){ vec4 w = modelViewMatrix * vec4(position, 1.0); vN = normalize(normalMatrix * normal); vV = normalize(-w.xyz); gl_Position = projectionMatrix * w; }`;
const HOLO_FRAG = /* glsl */ `uniform float uOn; varying vec3 vN; varying vec3 vV;
void main(){ float f = pow(1.0 - abs(dot(vN, vV)), 2.2); gl_FragColor = vec4(vec3(0.8, 1.0, 0.9) * (0.4 + f * 1.4), (0.08 + f * 0.55) * uOn); }`;
export const GardenHologram: React.FC<{ position: V3; t: number; on: number; scale?: number }> = ({ position, t, on, scale = 1 }) => {
  const uniforms = useMemo(() => ({ uOn: { value: 0 } }), []);
  uniforms.uOn.value = on;
  if (on <= 0.001) return null;
  const s = scale * (0.3 + 0.7 * on);
  const m = (c: string, k = 1.4, op = 0.9) => <meshBasicMaterial color={lit(c, k)} transparent opacity={op * on} toneMapped={false} depthWrite={false} side={THREE.DoubleSide} />;
  const flowers = ["#ff8ac8", "#ffd060", "#a890ff", "#7af0c8", "#ff9a6a"];
  return (
    <group position={position} scale={s}>
      <Halo position={[0, 0, 0]} size={8} color="#e8fff0" opacity={0.3 * on} />
      <mesh>
        <sphereGeometry args={[2.25, 40, 20]} />
        <meshBasicMaterial color="#1a2a48" transparent opacity={0.55 * on} side={THREE.BackSide} depthWrite={false} />
      </mesh>
      <mesh>
        <sphereGeometry args={[2.3, 48, 24]} />
        <shaderMaterial vertexShader={HOLO_VERT} fragmentShader={HOLO_FRAG} uniforms={uniforms} transparent depthWrite={false} />
      </mesh>
      {/* the lake */}
      <mesh position={[0, -1.1, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[1.7, 40]} />
        {m("#6ad0ff", 1.1, 0.75)}
      </mesh>
      {[0, 1].map((i) => (
        <mesh key={i} position={[0, -1.08, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[0.6 + ((t * 0.3 + i / 2) % 1) * 1.0, 0.64 + ((t * 0.3 + i / 2) % 1) * 1.0, 40]} />
          {m("#ffffff", 1.2, 0.5 * (1 - ((t * 0.3 + i / 2) % 1)))}
        </mesh>
      ))}
      {/* giant glowing flowers floating above it */}
      {Array.from({ length: 5 }, (_, i) => {
        const a = (i / 5) * TAU + t * 0.15;
        const r = i === 0 ? 0 : 1.2;
        const y = -0.1 + Math.sin(t * 1.2 + i * 1.7) * 0.18 + (i === 0 ? 0.45 : 0);
        const sz = i === 0 ? 0.95 : 0.62;
        return (
          <group key={i} position={[Math.cos(a) * r, y, Math.sin(a) * r * 0.7]} rotation={[0.35, a, 0]} scale={sz}>
            {Array.from({ length: 6 }, (_, k) => (
              <mesh key={k} rotation={[0, (k / 6) * TAU, 0.5]} position={[Math.cos((k / 6) * TAU) * 0.45, 0, Math.sin((k / 6) * TAU) * 0.45]} scale={[1, 0.25, 0.55]}>
                <sphereGeometry args={[0.45, 14, 10]} />
                {m(flowers[i], 1.9, 1)}
              </mesh>
            ))}
            <mesh position={[0, 0.1, 0]}>
              <sphereGeometry args={[0.24, 14, 10]} />
              {m("#fff6c0", 2)}
            </mesh>
            <mesh position={[0, -0.7, 0]}>
              <cylinderGeometry args={[0.03, 0.03, 0.9, 6]} />
              {m("#9af0b0", 1.2, 0.6)}
            </mesh>
          </group>
        );
      })}
      {/* drifting petals */}
      {Array.from({ length: 10 }, (_, i) => {
        const k = (i * 0.29 + t * 0.12) % 1;
        return (
          <mesh key={`p${i}`} position={[Math.sin(i * 2.3 + t * 0.5) * 1.5, -0.8 + k * 2.4, Math.cos(i * 1.7) * 0.8]} rotation={[t + i, t * 0.7, 0]} scale={Math.sin(k * Math.PI)}>
            <planeGeometry args={[0.12, 0.08]} />
            {m(flowers[i % 5], 1.6)}
          </mesh>
        );
      })}
    </group>
  );
};
