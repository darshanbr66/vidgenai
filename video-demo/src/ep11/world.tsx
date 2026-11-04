import React, { useMemo } from "react";
import * as THREE from "three";
import { rng } from "../kit3d/World";
import { Halo } from "../kit3d/sky";
import { Motes } from "../kit3d/magic";

// Episode 11: inside the Whispering Underwater Cave. Everything depends only on props.
// `alive` 0..1: how lit the cave is (dim and blue while the Whisper Crystal is dark, glowing and colorful after).

export type V3 = [number, number, number];

// ---------- where things are (world units; Lumi is about 1.3 tall; the cave floor is y = 0) ----------
export const WC_AT: V3 = [0, 0, -4.2]; // the Whisper Crystal's pedestal
export const WC_CRYSTAL: V3 = [0, 2.15, -4.2];
export const LEDGE: V3 = [-3.6, 2.5, -2.6]; // first piece, on a ledge in the wall
export const PIECE2_AT: V3 = [-1.5, 0.25, 0.4]; // second piece, under a jellyfish
export const PILLAR: V3 = [4.2, 0, -2.6]; // the tall rock with the last piece on top
export const PILLAR_H = 5.4;
export const PIECE3_AT: V3 = [PILLAR[0], PILLAR_H + 0.35, PILLAR[2]];
export const BLOOP_CORAL: V3 = [1.7, 0, 1.4];

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

const rockTex = () =>
  canvasTex(512, 512, (x) => {
    const r = rng(19);
    x.fillStyle = "#3a4f78";
    x.fillRect(0, 0, 512, 512);
    for (let k = 0; k < 1600; k++) {
      const v = r();
      x.fillStyle = v > 0.6 ? `rgba(120,150,200,${0.12 + r() * 0.2})` : `rgba(20,30,60,${0.15 + r() * 0.25})`;
      x.beginPath();
      x.ellipse(r() * 512, r() * 512, 3 + r() * 16, 2 + r() * 8, r() * 3, 0, Math.PI * 2);
      x.fill();
    }
  }, [6, 3]);

const sandTex = () =>
  canvasTex(512, 512, (x) => {
    const r = rng(23);
    x.fillStyle = "#c8b48a";
    x.fillRect(0, 0, 512, 512);
    for (let k = 0; k < 40; k++) {
      x.strokeStyle = k % 2 ? "rgba(240,225,190,0.45)" : "rgba(150,125,90,0.3)";
      x.lineWidth = 4;
      x.beginPath();
      for (let px = 0; px <= 512; px += 16) x.lineTo(px, (k / 40) * 512 + Math.sin(px * 0.03 + k) * 6);
      x.stroke();
    }
    for (let k = 0; k < 4000; k++) {
      x.fillStyle = r() > 0.5 ? "rgba(255,245,220,0.35)" : "rgba(110,90,60,0.25)";
      x.fillRect(r() * 512, r() * 512, 2, 2);
    }
  }, [8, 8]);

// The cave shell: a lumpy dome around the chamber, seen from inside
const CaveShell: React.FC<{ alive: number }> = ({ alive }) => {
  const geo = useMemo(() => {
    const g = new THREE.SphereGeometry(15, 64, 40, 0, Math.PI * 2, 0, Math.PI * 0.62);
    const p = g.attributes.position as THREE.BufferAttribute;
    for (let i = 0; i < p.count; i++) {
      const x = p.getX(i);
      const y = p.getY(i);
      const z = p.getZ(i);
      const n = Math.sin(x * 0.6) * Math.cos(z * 0.5) * 0.9 + Math.sin(y * 0.9 + x * 0.3) * 0.6 + Math.sin(z * 1.7) * 0.25;
      const k = 1 + n * 0.06;
      p.setXYZ(i, x * k, y * 0.8 * k, z * k);
    }
    g.computeVertexNormals();
    return g;
  }, []);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const map = useMemo(() => rockTex(), []);
  return (
    <mesh geometry={geo} position={[0, -1.5, -2]}>
      <meshStandardMaterial map={map} color={new THREE.Color("#7f95c8").lerp(new THREE.Color("#a8b8f0"), alive)} roughness={0.95} side={THREE.BackSide} emissive={new THREE.Color("#1a2a5a").lerp(new THREE.Color("#3a2a7a"), alive)} emissiveIntensity={0.6} />
    </mesh>
  );
};

const Floor: React.FC = () => {
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const map = useMemo(() => sandTex(), []);
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
      <circleGeometry args={[16, 64]} />
      <meshStandardMaterial map={map} color="#e8dcc0" roughness={0.95} />
    </mesh>
  );
};

// Glowing crystal clusters on the floor and the walls
const CRYSTAL_COLORS = ["#7fffe8", "#ff8fd8", "#b48aff", "#8fd8ff"];
const Crystals: React.FC<{ t: number; alive: number }> = ({ t, alive }) => {
  const items = useMemo(() => {
    const r = rng(31);
    const out: { p: V3; s: number; rz: number; rx: number; c: string; ph: number }[] = [];
    for (let i = 0; i < 26; i++) {
      const a = r() * Math.PI * 2;
      const wall = r() > 0.45;
      const d = wall ? 10 + r() * 2.5 : 5.5 + r() * 4;
      if (!wall && Math.sin(a) > 0.2 && Math.abs(Math.cos(a)) < 0.6) continue; // keep the front clear
      out.push({ p: [Math.cos(a) * d, wall ? 0.5 + r() * 6 : 0, Math.sin(a) * d - 2], s: 0.3 + r() * 0.6, rz: (r() - 0.5) * 1.2, rx: (r() - 0.5) * 0.6, c: CRYSTAL_COLORS[i % 4], ph: r() * 6 });
    }
    return out;
  }, []);
  return (
    <>
      {items.map((it, i) => {
        const glow = 0.7 + alive * (1.2 + 0.3 * Math.sin(t * 2 + it.ph));
        return (
          <group key={i} position={it.p} rotation={[it.rx, i, it.rz]}>
            {[0, 1, 2].map((k) => (
              <mesh key={k} position={[(k - 1) * 0.35 * it.s, 0.6 * it.s, (k % 2) * 0.2 * it.s]} rotation={[0, 0, (k - 1) * 0.35]} scale={[0.22 * it.s, (0.9 - Math.abs(k - 1) * 0.3) * it.s * 1.6, 0.22 * it.s]}>
                <octahedronGeometry args={[1, 0]} />
                <meshStandardMaterial color={it.c} emissive={it.c} emissiveIntensity={glow} flatShading roughness={0.2} toneMapped={false} />
              </mesh>
            ))}
            <Halo position={[0, 0.7 * it.s, 0]} size={2.8 * it.s} color={it.c} opacity={0.25 + alive * 0.4} />
          </group>
        );
      })}
    </>
  );
};

// Coral: branching tubes and round brain coral, pale while the cave is dim
const CORAL_COLORS = ["#ff7fa8", "#ffb060", "#c88aff", "#7fe0c8", "#ff9f80"];
const Coral: React.FC<{ alive: number }> = ({ alive }) => {
  const items = useMemo(() => {
    const r = rng(41);
    return Array.from({ length: 22 }, (_, i) => {
      const a = r() * Math.PI * 2;
      const d = 4.5 + r() * 6;
      return { x: Math.cos(a) * d, z: Math.sin(a) * d - 3, c: CORAL_COLORS[i % 5], tube: r() > 0.4, s: 0.5 + r() * 0.7, ry: r() * 6 };
    }).filter((c) => !(c.z > -1.5 && Math.abs(c.x) < 3.5));
  }, []);
  const grey = new THREE.Color("#7a8098");
  return (
    <>
      {items.map((c, i) => {
        const col = grey.clone().lerp(new THREE.Color(c.c), 0.5 + 0.5 * alive);
        return (
          <group key={i} position={[c.x, 0, c.z]} rotation={[0, c.ry, 0]} scale={c.s}>
            {c.tube ? (
              [0, 1, 2, 3].map((k) => (
                <mesh key={k} position={[Math.sin(k * 1.7) * 0.3, 0.5 + k * 0.05, Math.cos(k * 1.7) * 0.3]} rotation={[Math.sin(k) * 0.4, 0, Math.cos(k) * 0.4]} castShadow>
                  <cylinderGeometry args={[0.12, 0.16, 1.1 + (k % 2) * 0.4, 10]} />
                  <meshStandardMaterial color={col} emissive={c.c} emissiveIntensity={alive * 0.5} roughness={0.7} />
                </mesh>
              ))
            ) : (
              <mesh position={[0, 0.35, 0]} scale={[1, 0.7, 1]} castShadow>
                <sphereGeometry args={[0.6, 18, 12]} />
                <meshStandardMaterial color={col} emissive={c.c} emissiveIntensity={alive * 0.4} roughness={0.9} />
              </mesh>
            )}
          </group>
        );
      })}
    </>
  );
};

// Glowing jellyfish drifting through the cave
export const Jelly3D: React.FC<{ position: V3; t: number; color: string; glow: number; scale?: number; ph?: number }> = ({ position, t, color, glow, scale = 1, ph = 0 }) => {
  const pulse = 1 + 0.12 * Math.sin(t * 3 + ph);
  return (
    <group position={[position[0], position[1] + Math.sin(t * 0.9 + ph) * 0.25, position[2]]} scale={scale}>
      <mesh scale={[pulse, 1 / pulse, pulse]}>
        <sphereGeometry args={[0.32, 20, 12, 0, Math.PI * 2, 0, Math.PI / 2]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.3 + glow * 1.4} transparent opacity={0.75} toneMapped={false} />
      </mesh>
      {[0, 1, 2, 3, 4].map((k) => (
        <mesh key={k} position={[Math.cos(k * 1.26) * 0.18, -0.35, Math.sin(k * 1.26) * 0.18]} rotation={[0, 0, Math.sin(t * 2 + k + ph) * 0.2]}>
          <cylinderGeometry args={[0.012, 0.02, 0.6, 5]} />
          <meshBasicMaterial color={new THREE.Color(color).multiplyScalar(0.6 + glow)} transparent opacity={0.7} toneMapped={false} />
        </mesh>
      ))}
      <Halo position={[0, 0, 0]} size={1.4} color={color} opacity={0.15 + glow * 0.4} />
    </group>
  );
};

const JELLY_SPOTS: { p: V3; c: string }[] = [
  { p: [-5.5, 3.2, -5], c: "#ff9fe0" },
  { p: [5.8, 4.0, -6], c: "#9fe8ff" },
  { p: [-2.5, 5.2, -8], c: "#c8a0ff" },
  { p: [3.0, 2.8, -7.5], c: "#a0ffd8" },
  { p: [-7.5, 5.0, -2], c: "#ffd08f" },
  { p: [7.5, 2.2, -1.5], c: "#ff9fe0" },
];

// Small fish swimming in loose circles
const Fish: React.FC<{ t: number; alive: number }> = ({ t, alive }) => {
  const fish = useMemo(() => {
    const r = rng(53);
    return Array.from({ length: 34 }, (_, i) => ({ r: 4 + r() * 6, y: 1.5 + r() * 4.5, sp: 0.2 + r() * 0.25, ph: r() * 6, c: ["#ffb040", "#ff6f9f", "#5fd0ff", "#ffe060", "#a0ff8a"][i % 5], s: 0.12 + r() * 0.1 }));
  }, []);
  const grey = new THREE.Color("#8890a8");
  return (
    <>
      {fish.map((f, i) => {
        const a = t * f.sp * (i % 2 ? 1 : -1) + f.ph;
        return (
          <group key={i} position={[Math.cos(a) * f.r, f.y + Math.sin(t + f.ph) * 0.2, Math.sin(a) * f.r * 0.6 - 4]} rotation={[0, -a + (i % 2 ? 0 : Math.PI), 0]}>
            <mesh scale={[f.s * 1.8, f.s, f.s * 0.6]}>
              <sphereGeometry args={[1, 12, 8]} />
              <meshStandardMaterial color={grey.clone().lerp(new THREE.Color(f.c), 0.35 + 0.65 * alive)} emissive={f.c} emissiveIntensity={alive * 0.35} />
            </mesh>
            <mesh position={[-f.s * 1.9, 0, 0]} rotation={[0, 0, Math.PI / 2]} scale={[f.s * 0.8, f.s * 0.5, f.s * 0.3]}>
              <coneGeometry args={[1, 1.2, 4]} />
              <meshStandardMaterial color={grey.clone().lerp(new THREE.Color(f.c), 0.35 + 0.65 * alive)} />
            </mesh>
          </group>
        );
      })}
    </>
  );
};

// Light shafts falling from the cave's opening above
const Shafts: React.FC<{ t: number; on: number }> = ({ t, on }) => (
  <>
    {[-2.4, -0.6, 1.2, 2.8].map((x, i) => (
      <mesh key={i} position={[x, 6.5, -5 + (i % 2) * 1.2]} rotation={[0, 0, 0.18 - i * 0.08]}>
        <coneGeometry args={[0.9 + (i % 2) * 0.5, 13, 16, 1, true]} />
        <meshBasicMaterial color={new THREE.Color("#9fd8ff").multiplyScalar(on * (0.07 + 0.03 * Math.sin(t * 0.8 + i)))} transparent blending={THREE.AdditiveBlending} depthWrite={false} side={THREE.DoubleSide} toneMapped={false} />
      </mesh>
    ))}
  </>
);

// The tall rock and the wall ledge
const Rocks: React.FC = () => {
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const map = useMemo(() => rockTex(), []);
  const geo = useMemo(() => {
    const g = new THREE.CylinderGeometry(0.55, 1.2, PILLAR_H, 12, 8);
    const p = g.attributes.position as THREE.BufferAttribute;
    for (let i = 0; i < p.count; i++) {
      const y = p.getY(i);
      const k = 1 + 0.12 * Math.sin(y * 2.3 + p.getX(i) * 3);
      p.setXYZ(i, p.getX(i) * k, y, p.getZ(i) * k);
    }
    g.computeVertexNormals();
    return g;
  }, []);
  return (
    <>
      <mesh geometry={geo} position={[PILLAR[0], PILLAR_H / 2, PILLAR[2]]} castShadow receiveShadow>
        <meshStandardMaterial map={map} color="#a8b8e0" roughness={0.9} flatShading />
      </mesh>
      <mesh position={[LEDGE[0] - 0.4, LEDGE[1] - 0.35, LEDGE[2] - 0.4]} scale={[1.4, 0.5, 1]} castShadow receiveShadow>
        <dodecahedronGeometry args={[1, 0]} />
        <meshStandardMaterial map={map} color="#a8b8e0" roughness={0.9} flatShading />
      </mesh>
      {[-1, 1].map((sd) => (
        <mesh key={sd} position={[sd * 6.5, 0.6, 1.5]} scale={[1.6, 1.0, 1.2]} castShadow receiveShadow>
          <dodecahedronGeometry args={[1, 0]} />
          <meshStandardMaterial map={map} color="#94a6d0" roughness={0.9} flatShading />
        </mesh>
      ))}
    </>
  );
};

// ---------- the Whisper Crystal on its shell pedestal; `pieces` 0..3 how many pieces are back ----------
export const WhisperCrystal: React.FC<{ t: number; glow: number; pieces: number }> = ({ t, glow, pieces }) => (
  <group position={WC_AT}>
    <mesh position={[0, 0.5, 0]} castShadow receiveShadow>
      <cylinderGeometry args={[0.55, 0.85, 1.0, 20]} />
      <meshStandardMaterial color="#e8d8ff" roughness={0.5} />
    </mesh>
    <mesh position={[0, 1.05, 0]} rotation={[-Math.PI / 2, 0, 0]}>
      <torusGeometry args={[0.62, 0.08, 10, 32]} />
      <meshStandardMaterial color="#ffd8f0" metalness={0.4} roughness={0.3} />
    </mesh>
    <group position={[0, 2.15 - WC_AT[1], 0]} rotation={[0, t * 0.5, 0]}>
      <Halo position={[0, 0, 0]} size={1.5 + glow * 5} color="#bff4ff" opacity={0.15 + glow * 0.6} />
      <mesh scale={[0.42, 0.85, 0.42]}>
        <octahedronGeometry args={[1, 0]} />
        <meshStandardMaterial color={glow > 0.3 ? "#bff4ff" : "#7a88a8"} emissive="#7fe8ff" emissiveIntensity={0.05 + glow * 2} flatShading roughness={0.15} toneMapped={false} />
      </mesh>
      {[0, 1, 2].map((k) => (
        <mesh key={k} position={[Math.cos((k * 2 * Math.PI) / 3) * 0.48, -0.25, Math.sin((k * 2 * Math.PI) / 3) * 0.48]} rotation={[0, -k * 2.1, 0.5]} scale={[0.14, 0.34, 0.14]} visible={pieces > k}>
          <octahedronGeometry args={[1, 0]} />
          <meshStandardMaterial color={["#ff9fe0", "#a0ffd8", "#c8a0ff"][k]} emissive={["#ff7fd0", "#5fffc0", "#a07fff"][k]} emissiveIntensity={0.6 + glow * 1.5} flatShading toneMapped={false} />
        </mesh>
      ))}
    </group>
  </group>
);

// A floating crystal piece (for the three pieces before they are collected)
export const CrystalPiece3D: React.FC<{ position: V3; t: number; color: string; glow?: number; scale?: number }> = ({ position, t, color, glow = 1, scale = 1 }) => (
  <group position={[position[0], position[1] + Math.sin(t * 2) * 0.06, position[2]]} rotation={[0, t * 1.5, 0.3]} scale={scale}>
    <mesh scale={[0.14, 0.34, 0.14]}>
      <octahedronGeometry args={[1, 0]} />
      <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.8 + glow} flatShading toneMapped={false} />
    </mesh>
    <Halo position={[0, 0, 0]} size={1.2} color={color} opacity={0.5 * glow} />
  </group>
);

// ---------- the hologram for Episode 12: an ancient clock tower in a magical forest ----------
const HOLO_VERT = /* glsl */ `varying vec2 vUv; varying vec3 vN; varying vec3 vV; void main(){ vUv = uv; vec4 mv = modelViewMatrix * vec4(position, 1.0); vN = normalMatrix * normal; vV = -mv.xyz; gl_Position = projectionMatrix * mv; }`;
const HOLO_FRAG = /* glsl */ `uniform float uT; uniform float uOn; varying vec2 vUv; varying vec3 vN; varying vec3 vV;
void main(){ float f = pow(1.0 - abs(dot(normalize(vN), normalize(vV))), 1.5); float lines = 0.75 + 0.25 * sin(vUv.y * 120.0 - uT * 6.0);
  vec3 c = vec3(0.6, 1.0, 0.75) * (0.3 + f * 1.2) * lines; gl_FragColor = vec4(c, (0.06 + f * 0.5) * uOn); }`;

export const ClockTowerHologram: React.FC<{ position: V3; t: number; on: number; scale?: number }> = ({ position, t, on, scale = 1 }) => {
  const uniforms = useMemo(() => ({ uT: { value: 0 }, uOn: { value: 0 } }), []);
  uniforms.uT.value = t;
  uniforms.uOn.value = on;
  if (on <= 0.001) return null;
  const s = scale * (0.3 + 0.7 * on);
  const m = (c: string, k = 1, op = 0.9) => <meshBasicMaterial color={new THREE.Color(c).multiplyScalar(k)} transparent opacity={op * on} toneMapped={false} depthWrite={false} />;
  return (
    <group position={position} scale={s}>
      <Halo position={[0, 1, 0]} size={8} color="#9fffc8" opacity={0.3 * on} />
      <mesh>
        <sphereGeometry args={[2.2, 48, 24]} />
        <shaderMaterial vertexShader={HOLO_VERT} fragmentShader={HOLO_FRAG} uniforms={uniforms} transparent depthWrite={false} side={THREE.DoubleSide} />
      </mesh>
      {/* the forest */}
      {[-1.4, -0.9, 0.95, 1.45, -0.4, 0.5].map((x, i) => (
        <group key={i} position={[x, -1.0, (i % 3) * 0.35 - 0.4]}>
          <mesh position={[0, 0.55, 0]}>
            <coneGeometry args={[0.32, 1.1 + (i % 2) * 0.3, 8]} />
            {m("#4fd88a", 1.3)}
          </mesh>
          <mesh position={[0, 0.0, 0]}>
            <cylinderGeometry args={[0.05, 0.06, 0.3, 6]} />
            {m("#a07a50", 1.2)}
          </mesh>
        </group>
      ))}
      {/* the clock tower */}
      <group position={[0, -1.0, -0.2]}>
        <mesh position={[0, 1.0, 0]}>
          <boxGeometry args={[0.6, 2.0, 0.6]} />
          {m("#d8c8a0", 1.2)}
        </mesh>
        <mesh position={[0, 2.35, 0]} rotation={[0, Math.PI / 4, 0]}>
          <coneGeometry args={[0.5, 0.7, 4]} />
          {m("#6f8fd8", 1.4)}
        </mesh>
        <mesh position={[0, 1.55, 0.31]}>
          <circleGeometry args={[0.22, 28]} />
          {m("#fff6d0", 2)}
        </mesh>
        <mesh position={[0, 1.55, 0.32]} rotation={[0, 0, -t * 2]}>
          <planeGeometry args={[0.03, 0.18]} />
          {m("#3a2a10", 1)}
        </mesh>
        <mesh position={[0, 1.55, 0.32]} rotation={[0, 0, -t * 0.3]}>
          <planeGeometry args={[0.035, 0.12]} />
          {m("#3a2a10", 1)}
        </mesh>
      </group>
      {Array.from({ length: 10 }, (_, i) => (
        <mesh key={`f${i}`} position={[Math.sin(i * 2.3 + t * 0.5) * 1.5, -0.4 + ((i * 0.31 + t * 0.2) % 2.2), Math.cos(i * 1.7) * 0.7]}>
          <sphereGeometry args={[0.03, 6, 4]} />
          {m("#fff7a0", 3)}
        </mesh>
      ))}
    </group>
  );
};

// The whole cave
export const WhisperCave: React.FC<{ t: number; alive: number }> = ({ t, alive }) => (
  <>
    <fogExp2 attach="fog" args={[new THREE.Color("#12386a").lerp(new THREE.Color("#2e2a80"), alive).getStyle(), 0.022 - alive * 0.008]} />
    <hemisphereLight args={[new THREE.Color("#a8d8ff"), new THREE.Color("#4a5a8a"), 1.0 + alive * 0.5]} />
    <directionalLight position={[2, 14, 6]} intensity={1.1 + alive * 0.5} color="#bfe6ff" castShadow shadow-mapSize={[1024, 1024]} shadow-camera-left={-12} shadow-camera-right={12} shadow-camera-top={12} shadow-camera-bottom={-12} />
    <pointLight position={[WC_CRYSTAL[0], WC_CRYSTAL[1] + 0.5, WC_CRYSTAL[2] + 1]} intensity={4 + alive * 30} distance={14} color="#9fe8ff" />
    <pointLight position={[-6, 3, -4]} intensity={alive * 18} distance={12} color="#ff8fd8" />
    <pointLight position={[6, 3, -4]} intensity={alive * 18} distance={12} color="#b48aff" />
    <color attach="background" args={["#0a2048"]} />
    <CaveShell alive={alive} />
    <Floor />
    <Rocks />
    <Crystals t={t} alive={alive} />
    <Coral alive={alive} />
    <Fish t={t} alive={alive} />
    {JELLY_SPOTS.map((j, i) => (
      <Jelly3D key={i} position={j.p} t={t} color={j.c} glow={0.25 + alive * 0.75} ph={i * 1.3} />
    ))}
    <Shafts t={t} on={0.6 + alive * 0.4} />
    <Motes t={t} center={[0, 3, -3]} size={[18, 7, 12]} count={200} color="#bff4ff" bright={0.35 + alive * 0.5} />
  </>
);
