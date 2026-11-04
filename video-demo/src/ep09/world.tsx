import React, { useMemo } from "react";
import * as THREE from "three";
import { rng } from "../kit3d/World";
import { Halo } from "../kit3d/sky";

// Episode 9: the Golden Desert, built procedurally in Three.js. Everything depends only on props.
//
// All desert materials share GOLD: base 0..1 how vivid the desert is (the oasis is pale until the
// Golden Sun Crystal wakes), and a golden wave spreading from the crystal (waveR / waveOn).

export type V3 = [number, number, number];
export type GoldState = { base: number; waveR: number; waveOn: number };

// ---------- where things are (world units; Lumi is about 1.3 tall; the ground is y = 0 where the action is) ----------
export const PLAZA: V3 = [0, 0, 10];
export const CACTUS: V3 = [-4.6, 0, 3.6];
export const OASIS: V3 = [-11.5, 0, -2.5];
export const OASIS_R = 4.2;
export const GREAT: V3 = [0, 0, -42]; // the great pyramid
export const GREAT_HW = 19; // half its base width
export const GREAT_H = 24;
export const DOOR_Z = GREAT[2] + GREAT_HW + 1.0; // front of the door slab
export const DOOR: V3 = [0, 0, DOOR_Z];
export const SYMBOLS: V3[] = [-1.0, 0, 1.0].map((x) => [x, 2.15, DOOR_Z + 0.3] as V3); // sun, leaf, eye
export const CRYSTAL_HOME: V3 = [0, 9.5, DOOR_Z - 1];

const GOLD = {
  uT: { value: 0 },
  uBase: { value: 1 },
  uWaveR: { value: 0 },
  uWaveOn: { value: 0 },
  uCenter: { value: new THREE.Vector3(...CRYSTAL_HOME) },
};
const setGold = (t: number, s: GoldState) => {
  GOLD.uT.value = t;
  GOLD.uBase.value = s.base;
  GOLD.uWaveR.value = s.waveR;
  GOLD.uWaveOn.value = s.waveOn;
};
export const goldAt = (s: GoldState, p: V3) => {
  const d = Math.hypot(p[0] - CRYSTAL_HOME[0], p[1] - CRYSTAL_HOME[1], p[2] - CRYSTAL_HOME[2]);
  return Math.max(0, Math.min(1, s.base + s.waveOn * Math.max(0, Math.min(1, (s.waveR - d) / 12))));
};

// A desert material. `dull` says how pale it is before the crystal wakes (0 = always vivid);
// `glint` adds sparkling grains of sand; `glow` lights its emissive map up with the wave.
const goldMat = <T extends THREE.MeshStandardMaterial>(m: T, o: { dull?: number; glint?: number; glow?: number; sway?: number } = {}) => {
  const dull = o.dull ?? 0.25;
  const glint = o.glint ?? 0;
  const glow = o.glow ?? 0;
  const sway = o.sway ?? 0;
  m.onBeforeCompile = (shader) => {
    Object.assign(shader.uniforms, GOLD, { uDull: { value: dull }, uGlint: { value: glint }, uGlowW: { value: glow }, uSway: { value: sway } });
    shader.vertexShader = shader.vertexShader
      .replace("#include <common>", "#include <common>\nuniform float uT; uniform float uSway; varying vec3 vGdW;")
      .replace(
        "#include <begin_vertex>",
        `#include <begin_vertex>
        if (uSway > 0.0) {
          vec3 ip = vec3(0.0);
          #ifdef USE_INSTANCING
          ip = instanceMatrix[3].xyz;
          #endif
          float sh = max(position.y, 0.0);
          transformed.x += sin(uT * 1.6 + ip.x * 0.7 + ip.z * 0.3) * sh * sh * uSway;
          transformed.z += cos(uT * 1.3 + ip.z * 0.5) * sh * sh * uSway * 0.5;
        }`,
      )
      .replace(
        "#include <project_vertex>",
        `#include <project_vertex>
        vec4 gdW = vec4(transformed, 1.0);
        #ifdef USE_INSTANCING
        gdW = instanceMatrix * gdW;
        #endif
        vGdW = (modelMatrix * gdW).xyz;`,
      );
    shader.fragmentShader = shader.fragmentShader
      .replace(
        "#include <common>",
        `#include <common>
        uniform float uT; uniform float uBase; uniform float uWaveR; uniform float uWaveOn; uniform vec3 uCenter;
        uniform float uDull; uniform float uGlint; uniform float uGlowW; varying vec3 vGdW;
        float gHash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }`,
      )
      .replace(
        "#include <emissivemap_fragment>",
        `#include <emissivemap_fragment>
        {
          float gd = distance(vGdW, uCenter);
          float amt0 = clamp(uBase + uWaveOn * clamp((uWaveR - gd) / 12.0, 0.0, 1.0), 0.0, 1.0);
          totalEmissiveRadiance *= mix(0.25, 1.0, amt0) + uGlowW * amt0 * 2.5;
        }`,
      )
      .replace(
        "#include <tonemapping_fragment>",
        `float gD = distance(vGdW, uCenter);
        float amt = clamp(uBase + uWaveOn * clamp((uWaveR - gD) / 12.0, 0.0, 1.0), 0.0, 1.0);
        float lum = dot(gl_FragColor.rgb, vec3(0.299, 0.587, 0.114));
        gl_FragColor.rgb = mix(vec3(lum) * vec3(1.0, 0.9, 0.75), gl_FragColor.rgb, 1.0 - uDull * (1.0 - amt));
        if (uGlint > 0.0) {
          vec2 cell = floor(vGdW.xz * 26.0);
          float h = gHash(cell);
          float tw = 0.5 + 0.5 * sin(uT * (3.0 + h * 5.0) + h * 40.0);
          float s = step(0.985, h) * tw * tw;
          gl_FragColor.rgb += vec3(1.0, 0.9, 0.6) * s * uGlint * (0.35 + 0.9 * amt);
        }
        float front = uWaveOn * exp(-pow((gD - uWaveR) / 5.0, 2.0));
        gl_FragColor.rgb += front * vec3(1.0, 0.78, 0.3) * 0.9;
        #include <tonemapping_fragment>`,
      );
  };
  m.customProgramCacheKey = () => `gold-v1-${dull}-${glint}-${glow}-${sway}`;
  return m;
};

const useMat = (p: THREE.MeshStandardMaterialParameters, o?: { dull?: number; glint?: number; glow?: number; sway?: number }) =>
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useMemo(() => goldMat(new THREE.MeshStandardMaterial(p), o), []);

// ---------- painted textures ----------
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

const sandTex = () =>
  canvasTex(
    1024,
    1024,
    (x) => {
      const r = rng(91);
      x.fillStyle = "#d9a85e";
      x.fillRect(0, 0, 1024, 1024);
      // wind ripples
      for (let k = 0; k < 70; k++) {
        const y0 = (k / 70) * 1024 + r() * 6;
        x.strokeStyle = k % 2 ? "rgba(250,214,150,0.55)" : "rgba(170,118,60,0.35)";
        x.lineWidth = 3 + r() * 4;
        x.beginPath();
        for (let px = 0; px <= 1024; px += 16) {
          const y = y0 + Math.sin(px * 0.012 + k * 0.7) * 9 + Math.sin(px * 0.031 + k) * 3;
          if (px === 0) x.moveTo(px, y);
          else x.lineTo(px, y);
        }
        x.stroke();
      }
      for (let k = 0; k < 9000; k++) {
        const v = r();
        x.fillStyle = v > 0.6 ? `rgba(255,236,190,${0.25 + r() * 0.3})` : `rgba(150,96,44,${0.12 + r() * 0.2})`;
        x.fillRect(r() * 1024, r() * 1024, 1 + r() * 2, 1 + r() * 2);
      }
    },
    [34, 34],
  );

const blockTex = (seed: number, base: [number, number, number], rows = 10, cols = 8) =>
  canvasTex(
    512,
    512,
    (x) => {
      const r = rng(seed);
      x.fillStyle = `rgb(${base[0] * 0.55},${base[1] * 0.55},${base[2] * 0.55})`;
      x.fillRect(0, 0, 512, 512);
      const rh = 512 / rows;
      const cw = 512 / cols;
      for (let row = 0; row < rows; row++) {
        const off = row % 2 ? cw / 2 : 0;
        for (let col = -1; col <= cols; col++) {
          const v = 0.85 + r() * 0.22;
          x.fillStyle = `rgb(${Math.floor(base[0] * v)},${Math.floor(base[1] * v)},${Math.floor(base[2] * v)})`;
          x.fillRect(col * cw + off + 2, row * rh + 2, cw - 4, rh - 4);
          x.fillStyle = "rgba(255,240,200,0.18)";
          x.fillRect(col * cw + off + 2, row * rh + 2, cw - 4, 3);
          for (let k = 0; k < 10; k++) {
            x.fillStyle = `rgba(90,60,30,${0.08 + r() * 0.12})`;
            x.fillRect(col * cw + off + 2 + r() * (cw - 8), row * rh + 2 + r() * (rh - 8), 2 + r() * 5, 2 + r() * 4);
          }
        }
      }
    },
    [1, 1],
  );

// Glyphs drawn in gold: original simple symbols (sun, leaf, eye, waves, star, moon, fox ears, crystal)
const drawGlyph = (x: CanvasRenderingContext2D, kind: number, cx: number, cy: number, s: number) => {
  x.save();
  x.translate(cx, cy);
  x.lineWidth = s * 0.09;
  x.lineCap = "round";
  x.lineJoin = "round";
  x.beginPath();
  switch (kind % 8) {
    case 0: // sun
      x.arc(0, 0, s * 0.22, 0, Math.PI * 2);
      for (let i = 0; i < 8; i++) {
        const a = (i / 8) * Math.PI * 2;
        x.moveTo(Math.cos(a) * s * 0.32, Math.sin(a) * s * 0.32);
        x.lineTo(Math.cos(a) * s * 0.44, Math.sin(a) * s * 0.44);
      }
      break;
    case 1: // leaf
      x.moveTo(0, -s * 0.42);
      x.bezierCurveTo(-s * 0.32, -s * 0.2, -s * 0.32, s * 0.2, 0, s * 0.42);
      x.bezierCurveTo(s * 0.32, s * 0.2, s * 0.32, -s * 0.2, 0, -s * 0.42);
      x.moveTo(0, -s * 0.3);
      x.lineTo(0, s * 0.36);
      x.moveTo(0, 0);
      x.lineTo(-s * 0.13, -s * 0.1);
      x.moveTo(0, 0);
      x.lineTo(s * 0.13, -s * 0.1);
      break;
    case 2: // eye
      x.moveTo(-s * 0.42, 0);
      x.quadraticCurveTo(0, -s * 0.36, s * 0.42, 0);
      x.quadraticCurveTo(0, s * 0.36, -s * 0.42, 0);
      x.moveTo(s * 0.12, 0);
      x.arc(0, 0, s * 0.12, 0, Math.PI * 2);
      break;
    case 3: // waves
      for (let k = -1; k <= 1; k++) {
        x.moveTo(-s * 0.4, k * s * 0.2);
        x.bezierCurveTo(-s * 0.2, k * s * 0.2 - s * 0.12, 0, k * s * 0.2 + s * 0.12, s * 0.2, k * s * 0.2);
        x.quadraticCurveTo(s * 0.3, k * s * 0.2 - s * 0.06, s * 0.4, k * s * 0.2);
      }
      break;
    case 4: // star
      for (let i = 0; i < 10; i++) {
        const a = (i / 10) * Math.PI * 2 - Math.PI / 2;
        const rr = i % 2 ? s * 0.17 : s * 0.42;
        if (i === 0) x.moveTo(Math.cos(a) * rr, Math.sin(a) * rr);
        else x.lineTo(Math.cos(a) * rr, Math.sin(a) * rr);
      }
      x.closePath();
      break;
    case 5: // moon
      x.arc(0, 0, s * 0.38, Math.PI * 0.35, Math.PI * 1.65);
      x.quadraticCurveTo(-s * 0.05, 0, Math.cos(Math.PI * 0.35) * s * 0.38, Math.sin(Math.PI * 0.35) * s * 0.38);
      break;
    case 6: // fox ears
      x.moveTo(-s * 0.36, s * 0.3);
      x.lineTo(-s * 0.26, -s * 0.4);
      x.lineTo(-s * 0.04, s * 0.05);
      x.lineTo(s * 0.04, s * 0.05);
      x.lineTo(s * 0.26, -s * 0.4);
      x.lineTo(s * 0.36, s * 0.3);
      x.closePath();
      break;
    default: // crystal
      x.moveTo(0, -s * 0.42);
      x.lineTo(s * 0.26, 0);
      x.lineTo(0, s * 0.42);
      x.lineTo(-s * 0.26, 0);
      x.closePath();
      x.moveTo(-s * 0.26, 0);
      x.lineTo(s * 0.26, 0);
  }
  x.stroke();
  x.restore();
};

const glyphTex = (seed: number, cols: number, rows: number, color = "#ffd36a") =>
  canvasTex(cols * 96, rows * 96, (x) => {
    const r = rng(seed);
    x.fillStyle = "#000";
    x.fillRect(0, 0, cols * 96, rows * 96);
    x.strokeStyle = color;
    x.shadowColor = color;
    x.shadowBlur = 8;
    for (let j = 0; j < rows; j++) for (let i = 0; i < cols; i++) drawGlyph(x, Math.floor(r() * 8), i * 96 + 48, j * 96 + 48, 80);
    x.strokeRect(6, 6, cols * 96 - 12, rows * 96 - 12);
  });

// ---------- the ground ----------
const smooth = (a: number, b: number, v: number) => {
  const k = Math.max(0, Math.min(1, (v - a) / (b - a)));
  return k * k * (3 - 2 * k);
};
const segDist = (x: number, z: number, a: [number, number], b: [number, number]) => {
  const dx = b[0] - a[0];
  const dz = b[1] - a[1];
  const k = Math.max(0, Math.min(1, ((x - a[0]) * dx + (z - a[1]) * dz) / (dx * dx + dz * dz)));
  return Math.hypot(x - a[0] - dx * k, z - a[1] - dz * k);
};
// how far a point is from where the characters walk
const actionDist = (x: number, z: number) =>
  Math.min(
    segDist(x, z, [0, 14], [0, DOOR_Z + 1]) - 3.5,
    Math.hypot(x - PLAZA[0], z - PLAZA[2]) - 7,
    Math.hypot(x - CACTUS[0], z - CACTUS[2]) - 5,
    Math.hypot(x - OASIS[0], z - OASIS[2]) - OASIS_R - 3,
    segDist(x, z, [-14, DOOR_Z + 2], [14, DOOR_Z + 2]) - 4,
  );

export const floorY = (x: number, z: number) => {
  const far = smooth(2, 16, actionDist(x, z));
  const warp = Math.sin(z * 0.035) * 1.4 + Math.sin(x * 0.02) * 0.8;
  const crest = 1 - Math.abs(Math.sin(x * 0.055 + z * 0.028 + warp));
  const dunes = 3.2 * Math.pow(crest, 2.4) + 1.7 * (0.5 + 0.5 * Math.sin(x * 0.021 + 1.3) * Math.cos(z * 0.026 - 0.4)) + 0.6;
  const r = Math.hypot(x, z + 30);
  const rim = Math.max(0, r - 110) * 0.22;
  return far * (dunes + rim) + Math.sin(x * 0.9 + z * 0.6) * 0.03;
};

const Ground: React.FC = () => {
  const geo = useMemo(() => {
    const g = new THREE.PlaneGeometry(520, 520, 260, 260);
    g.rotateX(-Math.PI / 2);
    g.translate(0, 0, -40);
    const p = g.attributes.position as THREE.BufferAttribute;
    for (let i = 0; i < p.count; i++) p.setY(i, floorY(p.getX(i), p.getZ(i)));
    g.computeVertexNormals();
    return g;
  }, []);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const map = useMemo(() => sandTex(), []);
  const mat = useMat({ map, color: "#ffe0b0", roughness: 0.92, metalness: 0 }, { dull: 0.18, glint: 1.4 });
  return <mesh geometry={geo} material={mat} receiveShadow />;
};

// ---------- pyramids ----------
const Pyramid: React.FC<{ at: V3; hw: number; h: number; seed: number; glyphs?: boolean; capGlow: number }> = ({ at, hw, h, seed, glyphs = false, capGlow }) => {
  const map = useMemo(() => {
    const t = blockTex(seed, [226, 182, 118], 12, 10);
    t.repeat.set(6, 7);
    return t;
  }, [seed]);
  const mat = useMat({ map, color: "#f2d6a8", roughness: 0.88, flatShading: true }, { dull: 0.25 });
  const capMat = useMemo(() => goldMat(new THREE.MeshStandardMaterial({ color: "#ffcf5a", metalness: 0.8, roughness: 0.25, emissive: "#ffb020", emissiveIntensity: 0.4 }), { dull: 0.1, glow: 1 }), []);
  const glyphMap = useMemo(() => (glyphs ? glyphTex(seed + 7, 6, 3) : null), [glyphs, seed]);
  const glyphMat = useMemo(
    () => (glyphMap ? goldMat(new THREE.MeshStandardMaterial({ color: "#000000", emissive: "#ffc860", emissiveMap: glyphMap, emissiveIntensity: 1.2, transparent: true, opacity: 0.95, blending: THREE.AdditiveBlending, depthWrite: false }), { dull: 0, glow: 1 }) : null),
    [glyphMap],
  );
  const slope = Math.atan(hw / h);
  const capH = h * 0.08;
  return (
    <group position={at}>
      <mesh material={mat} position={[0, h / 2, 0]} rotation={[0, Math.PI / 4, 0]} castShadow receiveShadow>
        <coneGeometry args={[hw * Math.SQRT2, h, 4, 1]} />
      </mesh>
      <mesh material={capMat} position={[0, h - capH / 2 + 0.02, 0]} rotation={[0, Math.PI / 4, 0]}>
        <coneGeometry args={[hw * Math.SQRT2 * 0.08 * 1.04, capH, 4, 1]} />
      </mesh>
      <Halo position={[0, h + 0.4, 0]} size={hw * 0.8 * (0.4 + capGlow)} color="#ffd070" opacity={0.25 + 0.6 * capGlow} />
      {glyphMat &&
        [0.42, 0.62].map((k, i) => (
          <mesh key={i} material={glyphMat} position={[0, h * k, hw * (1 - k) + 0.06]} rotation={[-slope, 0, 0]}>
            <planeGeometry args={[hw * (1 - k) * 1.3, h * 0.07]} />
          </mesh>
        ))}
    </group>
  );
};

// ---------- the door in the great pyramid ----------
const symTex = (kind: number) =>
  canvasTex(256, 256, (x) => {
    x.fillStyle = "#000";
    x.fillRect(0, 0, 256, 256);
    x.strokeStyle = kind === 1 ? "#b8ff9a" : "#ffd36a";
    x.shadowColor = x.strokeStyle;
    x.shadowBlur = 14;
    x.lineWidth = 9;
    x.beginPath();
    x.arc(128, 128, 112, 0, Math.PI * 2);
    x.stroke();
    drawGlyph(x, kind, 128, 128, 190);
  });

export const DoorGate: React.FC<{ t: number; open: number; lit: [number, number, number]; light: number }> = ({ t, open, lit, light }) => {
  const stone = useMemo(() => {
    const tx = blockTex(55, [214, 170, 112], 6, 4);
    tx.repeat.set(1, 2);
    return tx;
  }, []);
  const mat = useMat({ map: stone, color: "#ffe6bc", roughness: 0.9 }, { dull: 0.2 });
  const slabTex = useMemo(() => blockTex(77, [196, 152, 98], 5, 3), []);
  const slabMat = useMat({ map: slabTex, color: "#ffe2b4", roughness: 0.85 }, { dull: 0.2 });
  const syms = useMemo(() => [0, 1, 2].map((k) => symTex(k === 0 ? 0 : k === 1 ? 1 : 2)), []);
  const band = useMemo(() => glyphTex(13, 8, 1), []);
  const z = DOOR_Z;
  const drop = open * 5.1;
  return (
    <group>
      {/* gatehouse: two pillars, a lintel with a glyph band, a cap */}
      {[-1, 1].map((sd) => (
        <mesh key={sd} material={mat} position={[sd * 2.75, 3.1, z - 1.0]} castShadow receiveShadow>
          <boxGeometry args={[2.0, 6.2, 2.4]} />
        </mesh>
      ))}
      <mesh material={mat} position={[0, 5.75, z - 1.0]} castShadow>
        <boxGeometry args={[7.5, 1.3, 2.6]} />
      </mesh>
      <mesh material={mat} position={[0, 6.7, z - 1.2]} castShadow>
        <boxGeometry args={[8.4, 0.6, 3.0]} />
      </mesh>
      <mesh position={[0, 5.75, z + 0.31]}>
        <planeGeometry args={[6.6, 0.85]} />
        <meshBasicMaterial map={band} color={new THREE.Color("#ffc860").multiplyScalar(0.8 + light * 2.5)} transparent blending={THREE.AdditiveBlending} depthWrite={false} toneMapped={false} />
      </mesh>
      {/* the golden light inside */}
      <mesh position={[0, 2.55, z - 1.6]}>
        <planeGeometry args={[3.5, 5.1]} />
        <meshBasicMaterial color={new THREE.Color("#ffc860").multiplyScalar(0.12 + light * 1.25)} toneMapped={false} />
      </mesh>
      {light > 0.01 &&
        [0, 1, 2, 3, 4].map((i) => (
          <mesh key={i} position={[(i - 2) * 0.55, 2.4, z + 2.5]} rotation={[Math.PI / 2 + 0.12, 0, (i - 2) * 0.12]}>
            <coneGeometry args={[0.9 + (i % 2) * 0.4, 7, 16, 1, true]} />
            <meshBasicMaterial color={new THREE.Color("#ffd27a").multiplyScalar(light * (0.25 + 0.1 * Math.sin(t * 3 + i)))} transparent blending={THREE.AdditiveBlending} depthWrite={false} side={THREE.DoubleSide} toneMapped={false} />
          </mesh>
        ))}
      {/* the stone door slab, sinking into the sand when it opens */}
      <group position={[0, -drop, 0]}>
        <mesh material={slabMat} position={[0, 2.55, z - 0.25]} castShadow receiveShadow>
          <boxGeometry args={[3.5, 5.1, 0.5]} />
        </mesh>
        {SYMBOLS.map((p, i) => (
          <group key={i} position={[p[0], p[1], z + 0.02]}>
            <mesh>
              <circleGeometry args={[0.46, 40]} />
              <meshStandardMaterial color="#8a6a40" roughness={0.6} metalness={0.3} />
            </mesh>
            <mesh position={[0, 0, 0.01]}>
              <planeGeometry args={[0.9, 0.9]} />
              <meshBasicMaterial map={syms[i]} color={new THREE.Color(i === 1 ? "#a8ff8a" : "#ffd36a").multiplyScalar(0.35 + lit[i] * 3.2)} transparent blending={THREE.AdditiveBlending} depthWrite={false} toneMapped={false} />
            </mesh>
            {lit[i] > 0.05 && <Halo position={[0, 0, 0.1]} size={1.6 + lit[i] * 1.6} color={i === 1 ? "#9fff8f" : "#ffd070"} opacity={0.5 * lit[i]} />}
          </group>
        ))}
      </group>
    </group>
  );
};

// ---------- rocks: mesas, a natural arch, scattered boulders ----------
const rockTex = () =>
  canvasTex(256, 512, (x) => {
    const r = rng(31);
    for (let y = 0; y < 512; y += 4) {
      const band = Math.sin(y * 0.05) * 0.5 + Math.sin(y * 0.13) * 0.3;
      const v = 0.8 + band * 0.15 + r() * 0.05;
      x.fillStyle = `rgb(${Math.floor(214 * v)},${Math.floor(128 * v)},${Math.floor(78 * v)})`;
      x.fillRect(0, y, 256, 4);
    }
    for (let k = 0; k < 900; k++) {
      x.fillStyle = `rgba(80,40,20,${0.08 + r() * 0.1})`;
      x.fillRect(r() * 256, r() * 512, 2 + r() * 8, 1 + r() * 2);
    }
  });

const lumpy = (geo: THREE.BufferGeometry, seed: number, amt: number) => {
  const r = rng(seed);
  const p = geo.attributes.position as THREE.BufferAttribute;
  const off = Array.from({ length: 6 }, () => r() * 10);
  for (let i = 0; i < p.count; i++) {
    const x = p.getX(i);
    const y = p.getY(i);
    const z = p.getZ(i);
    const n = Math.sin(x * 1.3 + off[0]) * Math.cos(z * 1.1 + off[1]) + Math.sin(y * 2.2 + off[2]) * 0.5;
    const len = Math.hypot(x, z) || 1;
    p.setXYZ(i, x + (x / len) * n * amt, y, z + (z / len) * n * amt);
  }
  geo.computeVertexNormals();
  return geo;
};

const Rocks: React.FC = () => {
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const map = useMemo(() => rockTex(), []);
  const mat = useMat({ map, color: "#ffffff", roughness: 0.95, flatShading: true }, { dull: 0.3 });
  const mesas = useMemo(
    () =>
      [
        { at: [-52, 0, -28] as V3, r: 9, h: 14, s: 1 },
        { at: [-64, 0, -60] as V3, r: 12, h: 19, s: 2 },
        { at: [58, 0, -44] as V3, r: 10, h: 16, s: 3 },
        { at: [80, 0, -92] as V3, r: 15, h: 22, s: 4 },
        { at: [-30, 0, -110] as V3, r: 13, h: 18, s: 5 },
        { at: [-26, 0, -58] as V3, r: 8, h: 13, s: 6 },
        { at: [24, 0, -52] as V3, r: 7, h: 11, s: 7 },
        { at: [-20, 0, -20] as V3, r: 5, h: 8, s: 8 },
      ].map((m) => ({ ...m, geo: lumpy(new THREE.CylinderGeometry(m.r * 0.82, m.r, m.h, 22, 6), m.s, m.r * 0.08) })),
    [],
  );
  const archGeo = useMemo(() => lumpy(new THREE.TorusGeometry(7, 1.6, 12, 40, Math.PI), 11, 0.35), []);
  const boulders = useMemo(() => {
    const r = rng(17);
    const out: { p: V3; s: number; ry: number }[] = [];
    while (out.length < 40) {
      const x = (r() - 0.5) * 120;
      const z = 20 - r() * 120;
      if (actionDist(x, z) < 3) continue;
      out.push({ p: [x, floorY(x, z) - 0.2, z], s: 0.4 + r() * 1.4, ry: r() * 6 });
    }
    return out;
  }, []);
  return (
    <>
      {mesas.map((m, i) => (
        <mesh key={i} geometry={m.geo} material={mat} position={[m.at[0], floorY(m.at[0], m.at[2]) + m.h / 2 - 1, m.at[2]]} castShadow receiveShadow />
      ))}
      <mesh geometry={archGeo} material={mat} position={[15, floorY(15, -10) - 1.2, -10]} rotation={[0, -0.35, 0]} castShadow receiveShadow />
      {boulders.map((b, i) => (
        <mesh key={i} material={mat} position={b.p} rotation={[0.3, b.ry, 0.2]} scale={[b.s, b.s * 0.7, b.s]} castShadow receiveShadow>
          <dodecahedronGeometry args={[1, 0]} />
        </mesh>
      ))}
    </>
  );
};

// ---------- obelisks along the path ----------
const Obelisks: React.FC = () => {
  const map = useMemo(() => {
    const t = blockTex(66, [222, 178, 118], 8, 2);
    return t;
  }, []);
  const mat = useMat({ map, color: "#f0d4a4", roughness: 0.85 }, { dull: 0.25 });
  const gmap = useMemo(() => glyphTex(21, 1, 5), []);
  const gmat = useMemo(() => goldMat(new THREE.MeshStandardMaterial({ color: "#000", emissive: "#ffc860", emissiveMap: gmap, emissiveIntensity: 1, transparent: true, blending: THREE.AdditiveBlending, depthWrite: false }), { dull: 0, glow: 1 }), [gmap]);
  const spots: V3[] = [
    [-4.6, 0, -6],
    [4.6, 0, -6],
    [-5.2, 0, DOOR_Z + 5],
    [5.2, 0, DOOR_Z + 5],
  ];
  return (
    <>
      {spots.map((p, i) => (
        <group key={i} position={p}>
          <mesh material={mat} position={[0, 2.6, 0]} castShadow receiveShadow>
            <boxGeometry args={[0.9, 5.2, 0.9]} />
          </mesh>
          <mesh material={mat} position={[0, 5.5, 0]} rotation={[0, Math.PI / 4, 0]} castShadow>
            <coneGeometry args={[0.64, 0.7, 4]} />
          </mesh>
          <mesh material={gmat} position={[0, 2.8, 0.46]}>
            <planeGeometry args={[0.6, 3.6]} />
          </mesh>
        </group>
      ))}
    </>
  );
};

// ---------- the oasis: water, palms, reeds and flowers (pale until the crystal wakes) ----------
const WATER_VERT = /* glsl */ `varying vec3 vW; void main(){ vec4 w = modelMatrix * vec4(position, 1.0); vW = w.xyz; gl_Position = projectionMatrix * viewMatrix * w; }`;
const WATER_FRAG = /* glsl */ `uniform float uT; uniform float uAmt; uniform vec3 uC; varying vec3 vW;
float h(vec2 p){ return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453); }
void main(){
  float r = distance(vW.xz, uC.xz);
  float ripple = sin(r * 6.0 - uT * 2.5) * 0.5 + 0.5;
  vec3 deep = mix(vec3(0.24, 0.3, 0.31), vec3(0.02, 0.4, 0.62), uAmt);
  vec3 shallow = mix(vec3(0.4, 0.43, 0.4), vec3(0.2, 0.82, 0.8), uAmt);
  vec3 c = mix(deep, shallow, smoothstep(0.0, 4.2, r) * 0.8 + ripple * 0.12);
  vec2 cell = floor(vW.xz * 9.0);
  float s = step(0.97, h(cell)) * pow(0.5 + 0.5 * sin(uT * 4.0 + h(cell) * 30.0), 6.0);
  c += vec3(1.0, 0.95, 0.8) * s * (0.4 + uAmt);
  gl_FragColor = vec4(c, 0.94);
}`;

const Oasis: React.FC<{ t: number; amt: number }> = ({ t, amt }) => {
  const uniforms = useMemo(() => ({ uT: { value: 0 }, uAmt: { value: 0 }, uC: { value: new THREE.Vector3(...OASIS) } }), []);
  uniforms.uT.value = t;
  uniforms.uAmt.value = amt;
  const trunk = useMat({ color: "#a2763e", roughness: 0.9, flatShading: true }, { dull: 0.5 });
  const frond = useMat({ color: "#3fae4a", roughness: 0.7, side: THREE.DoubleSide }, { dull: 0.5, sway: 0.03 });
  const reed = useMat({ color: "#5bbf4a", roughness: 0.8 }, { dull: 0.5, sway: 0.08 });
  const wet = useMat({ color: "#8a6a3a", roughness: 0.6 }, { dull: 0.4 });
  const palms = useMemo(
    () =>
      [
        [OASIS[0] - 4.6, OASIS[2] - 2.4, 6.2, 0.5, 0.25],
        [OASIS[0] - 1.8, OASIS[2] - 5.0, 7.4, -0.3, 0.2],
        [OASIS[0] + 3.2, OASIS[2] - 4.4, 5.6, 0.2, -0.3],
        [OASIS[0] - 5.6, OASIS[2] + 2.0, 5.0, 0.6, 0.1],
        [OASIS[0] + 4.9, OASIS[2] - 0.6, 4.6, -0.2, -0.35],
      ].map(([x, z, h, lx, lz]) => ({ x, z, h, lx, lz })),
    [],
  );
  const flowers = useMemo(() => {
    const r = rng(42);
    return Array.from({ length: 70 }, () => {
      const a = r() * Math.PI * 2;
      const d = OASIS_R + 0.3 + r() * 2.2;
      return { p: [OASIS[0] + Math.cos(a) * d, 0.12, OASIS[2] + Math.sin(a) * d] as V3, c: ["#ff5f8a", "#ffb03a", "#c86bff", "#ff7a3a", "#ffe04a", "#5fd0ff"][Math.floor(r() * 6)], s: 0.1 + r() * 0.1 };
    });
  }, []);
  const reeds = useMemo(() => {
    const r = rng(43);
    return Array.from({ length: 60 }, () => {
      const a = r() * Math.PI * 2;
      const d = OASIS_R - 0.2 + r() * 1.6;
      return { p: [OASIS[0] + Math.cos(a) * d, 0, OASIS[2] + Math.sin(a) * d] as V3, h: 0.5 + r() * 0.9, ry: r() * 6 };
    });
  }, []);
  const grey = new THREE.Color("#b8ab94");
  return (
    <group>
      <mesh position={[OASIS[0], 0.03, OASIS[2]]} rotation={[-Math.PI / 2, 0, 0]} material={wet} receiveShadow>
        <circleGeometry args={[OASIS_R + 0.9, 48]} />
      </mesh>
      <mesh position={[OASIS[0], 0.06, OASIS[2]]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[OASIS_R, 64]} />
        <shaderMaterial vertexShader={WATER_VERT} fragmentShader={WATER_FRAG} uniforms={uniforms} transparent />
      </mesh>
      {palms.map((p, i) => (
        <group key={i} position={[p.x, 0, p.z]}>
          {Array.from({ length: 8 }, (_, k) => {
            const kk = k / 8;
            const bend = kk * kk;
            return (
              <mesh key={k} material={trunk} position={[p.lx * bend * p.h * 0.5, (k + 0.5) * (p.h / 8), p.lz * bend * p.h * 0.5]} rotation={[p.lz * kk * 0.6, 0, -p.lx * kk * 0.6]} castShadow>
                <cylinderGeometry args={[0.2 - kk * 0.06, 0.24 - kk * 0.06, p.h / 8 + 0.05, 8]} />
              </mesh>
            );
          })}
          <group position={[p.lx * p.h * 0.5, p.h, p.lz * p.h * 0.5]}>
            {Array.from({ length: 8 }, (_, k) => (
              <group key={k} rotation={[0, (k / 8) * Math.PI * 2 + i, 0]}>
                <mesh material={frond} position={[1.3, -0.35, 0]} rotation={[0, 0, -0.45 - (k % 2) * 0.2]} scale={[1.6, 0.06, 0.4]} castShadow>
                  <sphereGeometry args={[1, 12, 6]} />
                </mesh>
              </group>
            ))}
            <mesh position={[0, -0.25, 0]} material={trunk}>
              <sphereGeometry args={[0.35, 10, 8]} />
            </mesh>
          </group>
        </group>
      ))}
      {reeds.map((r, i) => (
        <mesh key={i} material={reed} position={[r.p[0], r.h / 2, r.p[2]]} rotation={[0.1, r.ry, 0.08]} castShadow>
          <coneGeometry args={[0.05, r.h, 5]} />
        </mesh>
      ))}
      {flowers.map((f, i) => (
        <mesh key={i} position={f.p} scale={f.s * (0.55 + 0.45 * amt)}>
          <sphereGeometry args={[1, 8, 6]} />
          <meshStandardMaterial color={grey.clone().lerp(new THREE.Color(f.c), amt)} emissive={f.c} emissiveIntensity={amt * 0.35} roughness={0.6} />
        </mesh>
      ))}
    </group>
  );
};

// ---------- drifting sand ----------
export const SandDrift: React.FC<{ t: number; center: V3; size: [number, number, number]; count?: number; seed?: number; speed?: number; bright?: number }> = ({ t, center, size, count = 500, seed = 3, speed = 1.6, bright = 1 }) => {
  const base = useMemo(() => {
    const r = rng(seed);
    return Array.from({ length: count }, () => [r(), r(), r(), r()]);
  }, [count, seed]);
  const geo = useMemo(() => {
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.BufferAttribute(new Float32Array(count * 3), 3));
    return g;
  }, [count]);
  const pos = geo.attributes.position as THREE.BufferAttribute;
  base.forEach(([a, b, c, d], i) => {
    const x = ((a + (t * speed * (0.6 + d * 0.8)) / size[0]) % 1) * size[0];
    const y = Math.pow(b, 2.2) * size[1] + Math.sin(t * 2 + d * 20) * 0.08;
    pos.setXYZ(i, center[0] - size[0] / 2 + x, center[1] + y, center[2] + (c - 0.5) * size[2]);
  });
  pos.needsUpdate = true;
  return (
    <points geometry={geo} frustumCulled={false}>
      <pointsMaterial size={0.05} color={new THREE.Color("#ffe2a8").multiplyScalar(1.3 * bright)} transparent opacity={0.75} depthWrite={false} sizeAttenuation toneMapped={false} />
    </points>
  );
};

// ---------- the sky: warm gradient, a bright sun and soft painted clouds ----------
const SKY_VERT = /* glsl */ `varying vec3 vDir; void main(){ vDir = normalize(position); gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`;
const SKY_FRAG = /* glsl */ `uniform float uT; uniform vec3 uSun; uniform float uGold; varying vec3 vDir;
float hash(vec3 p){ p = fract(p * 0.3183099 + 0.1); p *= 17.0; return fract(p.x * p.y * p.z * (p.x + p.y + p.z)); }
float noise(vec3 x){ vec3 i = floor(x); vec3 f = fract(x); f = f*f*(3.0-2.0*f);
  return mix(mix(mix(hash(i),hash(i+vec3(1,0,0)),f.x), mix(hash(i+vec3(0,1,0)),hash(i+vec3(1,1,0)),f.x),f.y),
             mix(mix(hash(i+vec3(0,0,1)),hash(i+vec3(1,0,1)),f.x), mix(hash(i+vec3(0,1,1)),hash(i+vec3(1,1,1)),f.x),f.y), f.z); }
void main(){
  float h = vDir.y;
  vec3 low = mix(vec3(1.0, 0.86, 0.6), vec3(1.0, 0.8, 0.45), uGold);
  vec3 mid = vec3(0.42, 0.7, 0.95);
  vec3 top = vec3(0.1, 0.34, 0.8);
  vec3 c = mix(low, mid, smoothstep(-0.05, 0.22, h));
  c = mix(c, top, smoothstep(0.22, 0.8, h));
  float n = noise(vec3(vDir.x * 4.0 + uT * 0.02, vDir.y * 10.0, vDir.z * 4.0)) * 0.65 + noise(vDir * 11.0) * 0.35;
  float cl = smoothstep(0.55, 0.85, n) * smoothstep(0.03, 0.18, h) * (1.0 - smoothstep(0.45, 0.7, h));
  c = mix(c, vec3(1.0, 0.97, 0.92), cl * 0.75);
  float s = max(dot(vDir, normalize(uSun)), 0.0);
  c += vec3(1.0, 0.85, 0.55) * (pow(s, 600.0) * 3.0 + pow(s, 30.0) * 0.45 + pow(s, 6.0) * 0.18);
  gl_FragColor = vec4(c, 1.0);
}`;
export const SUN_DIR: V3 = [-0.45, 0.32, -0.83];

const DesertSky: React.FC<{ t: number; gold: number }> = ({ t, gold }) => {
  const uniforms = useMemo(() => ({ uT: { value: 0 }, uSun: { value: new THREE.Vector3(...SUN_DIR) }, uGold: { value: 0 } }), []);
  uniforms.uT.value = t;
  uniforms.uGold.value = gold;
  return (
    <mesh renderOrder={-10}>
      <sphereGeometry args={[480, 48, 32]} />
      <shaderMaterial vertexShader={SKY_VERT} fragmentShader={SKY_FRAG} uniforms={uniforms} side={THREE.BackSide} depthWrite={false} fog={false} />
    </mesh>
  );
};

// ---------- the Golden Sun Crystal ----------
export const SunCrystal: React.FC<{ position: V3; t: number; glow: number; scale?: number; spin?: number }> = ({ position, t, glow, scale = 1, spin = 0.6 }) => (
  <group position={position} scale={scale} rotation={[0.15 * Math.sin(t), t * spin, 0]}>
    <Halo position={[0, 0, 0]} size={3.5 + glow * 5} color="#ffc850" opacity={0.35 + glow * 0.5} />
    <mesh>
      <octahedronGeometry args={[0.62, 0]} />
      <meshStandardMaterial color="#ffd85a" emissive="#ffb020" emissiveIntensity={0.6 + glow * 2.2} metalness={0.6} roughness={0.15} flatShading toneMapped={false} />
    </mesh>
    <mesh scale={0.62}>
      <icosahedronGeometry args={[0.7, 0]} />
      <meshBasicMaterial color={new THREE.Color("#fff4c0").multiplyScalar(1.5 + glow * 2)} toneMapped={false} />
    </mesh>
    {Array.from({ length: 12 }, (_, i) => {
      const a = (i / 12) * Math.PI * 2;
      const long = i % 2 ? 0.55 : 0.85;
      return (
        <mesh key={i} position={[Math.cos(a) * (0.62 + long / 2), Math.sin(a) * (0.62 + long / 2), 0]} rotation={[0, 0, a - Math.PI / 2]}>
          <coneGeometry args={[0.09, long, 6]} />
          <meshBasicMaterial color={new THREE.Color("#ffd060").multiplyScalar(1.2 + glow * 2.2)} toneMapped={false} />
        </mesh>
      );
    })}
  </group>
);

// ---------- the hologram of a floating sky city, from Zuzu's compass ----------
const HOLO_VERT = /* glsl */ `varying vec2 vUv; varying vec3 vN; varying vec3 vV; void main(){ vUv = uv; vec4 mv = modelViewMatrix * vec4(position, 1.0); vN = normalMatrix * normal; vV = -mv.xyz; gl_Position = projectionMatrix * mv; }`;
const HOLO_FRAG = /* glsl */ `uniform float uT; uniform float uOn; varying vec2 vUv; varying vec3 vN; varying vec3 vV;
void main(){ float f = pow(1.0 - abs(dot(normalize(vN), normalize(vV))), 1.5); float lines = 0.75 + 0.25 * sin(vUv.y * 120.0 - uT * 6.0);
  vec3 c = vec3(0.45, 0.75, 1.0) * (0.25 + f * 1.1) * lines; gl_FragColor = vec4(c, (0.04 + f * 0.45) * uOn); }`;

export const SkyCityHologram: React.FC<{ position: V3; t: number; on: number; scale?: number }> = ({ position, t, on, scale = 1 }) => {
  const uniforms = useMemo(() => ({ uT: { value: 0 }, uOn: { value: 0 } }), []);
  uniforms.uT.value = t;
  uniforms.uOn.value = on;
  if (on <= 0.001) return null;
  const col = (c: string, k: number) => new THREE.Color(c).multiplyScalar(k * on);
  const basic = (c: string, k: number, op = 0.85) => <meshBasicMaterial color={new THREE.Color(c).multiplyScalar(k)} transparent opacity={op * on} toneMapped={false} depthWrite={false} />;
  const s = scale * (0.3 + 0.7 * on);
  const islands: [number, number, number, number][] = [
    [0, 0.9, 0, 0.9],
    [-1.3, 0.45, 0.3, 0.5],
    [1.25, 1.35, -0.2, 0.55],
  ];
  return (
    <group position={position} scale={s}>
      <Halo position={[0, 1.0, 0]} size={8} color="#bfe6ff" opacity={0.25 * on} />
      <mesh>
        <sphereGeometry args={[2.2, 48, 24]} />
        <shaderMaterial vertexShader={HOLO_VERT} fragmentShader={HOLO_FRAG} uniforms={uniforms} transparent depthWrite={false} side={THREE.DoubleSide} />
      </mesh>
      {islands.map(([x, y, z, r], i) => (
        <group key={i} position={[x, y + Math.sin(t * 1.2 + i * 2) * 0.08, z]}>
          <mesh rotation={[Math.PI, 0, 0]} position={[0, -r * 0.55, 0]}>
            <coneGeometry args={[r, r * 1.3, 7]} />
            {basic("#b88a5a", 1.0)}
          </mesh>
          <mesh position={[0, 0.02, 0]}>
            <cylinderGeometry args={[r, r * 0.96, 0.1, 20]} />
            {basic("#7fd86a", 1.1)}
          </mesh>
          {Array.from({ length: i === 0 ? 4 : 2 }, (_, k) => {
            const h = (i === 0 ? 0.9 : 0.5) * (1 - k * 0.15);
            const px = (k - (i === 0 ? 1.5 : 0.5)) * r * 0.42;
            return (
              <group key={k} position={[px, h / 2, (k % 2) * 0.15]}>
                <mesh>
                  <cylinderGeometry args={[0.08, 0.1, h, 10]} />
                  {basic("#f4f8ff", 1.1)}
                </mesh>
                <mesh position={[0, h / 2 + 0.12, 0]}>
                  <coneGeometry args={[0.13, 0.26, 10]} />
                  {basic("#4a8af0", 1.2)}
                </mesh>
              </group>
            );
          })}
        </group>
      ))}
      {Array.from({ length: 7 }, (_, i) => (
        <mesh key={i} position={[Math.sin(i * 2.1 + t * 0.3) * 1.6, 0.2 + (i % 3) * 0.25, Math.cos(i * 1.3) * 0.6]} scale={[0.45, 0.16, 0.25]}>
          <sphereGeometry args={[1, 12, 8]} />
          {basic("#ffffff", 1.0, 0.75)}
        </mesh>
      ))}
      {Array.from({ length: 14 }, (_, i) => (
        <mesh key={`m${i}`} position={[Math.sin(i * 2.3 + t * 0.5) * 1.6, 0.2 + ((i * 0.31 + t * 0.15) % 1.8), Math.cos(i * 1.7 + t * 0.4) * 0.8]}>
          <sphereGeometry args={[0.025, 6, 4]} />
          <meshBasicMaterial color={col("#fff0b0", 3)} toneMapped={false} />
        </mesh>
      ))}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.6, 0]}>
        <ringGeometry args={[2.05, 2.2, 64]} />
        <meshBasicMaterial color={col("#ffd36a", 3)} toneMapped={false} transparent />
      </mesh>
    </group>
  );
};

// ---------- lights ----------
const DesertLights: React.FC<{ amt: number }> = ({ amt }) => (
  <>
    <hemisphereLight args={["#cfe6ff", "#c8904a", 0.75 + amt * 0.15]} />
    <directionalLight
      position={[34, 52, 30]}
      intensity={2.0 + amt * 0.4}
      color="#fff0d6"
      castShadow
      shadow-mapSize={[2048, 2048]}
      shadow-camera-left={-50}
      shadow-camera-right={50}
      shadow-camera-top={50}
      shadow-camera-bottom={-50}
      shadow-camera-near={1}
      shadow-camera-far={180}
      shadow-bias={-0.0006}
    />
    <directionalLight position={[-40, 18, -50]} intensity={0.45} color="#ffc890" />
  </>
);

// The whole Golden Desert. s = the gold state for this frame; open/lit/light drive the door.
export const GoldenDesert: React.FC<{ t: number; s: GoldState; open?: number; lit?: [number, number, number]; light?: number; drift?: number }> = ({
  t,
  s,
  open = 0,
  lit = [0, 0, 0],
  light = 0,
  drift = 1,
}) => {
  setGold(t, s);
  const amt = goldAt(s, OASIS);
  const pyrAmt = goldAt(s, [GREAT[0], GREAT_H, GREAT[2]]);
  return (
    <>
      <fogExp2 attach="fog" args={["#f0d2a0", 0.0034]} />
      <DesertSky t={t} gold={pyrAmt} />
      <Halo position={[SUN_DIR[0] * 400, SUN_DIR[1] * 400, SUN_DIR[2] * 400]} size={150} color="#fff0c0" opacity={0.7} />
      <DesertLights amt={amt} />
      <Ground />
      <Pyramid at={GREAT} hw={GREAT_HW} h={GREAT_H} seed={1} glyphs capGlow={0.2 + pyrAmt * 1.2} />
      <Pyramid at={[-42, floorY(-42, -82), -82]} hw={15} h={19} seed={2} glyphs capGlow={0.15 + pyrAmt} />
      <Pyramid at={[40, floorY(40, -74), -74]} hw={12} h={15} seed={3} capGlow={0.15 + pyrAmt} />
      <Pyramid at={[-8, floorY(-8, -150), -150]} hw={20} h={25} seed={4} capGlow={0.1 + pyrAmt * 0.6} />
      <DoorGate t={t} open={open} lit={lit} light={light} />
      <Rocks />
      <Obelisks />
      <Oasis t={t} amt={amt} />
      <SandDrift t={t} center={[0, 0.02, 2]} size={[44, 0.9, 40]} count={Math.round(700 * drift)} seed={5} />
      <SandDrift t={t + 3} center={[0, 0.02, DOOR_Z + 6]} size={[30, 0.7, 14]} count={Math.round(260 * drift)} seed={6} />
    </>
  );
};
