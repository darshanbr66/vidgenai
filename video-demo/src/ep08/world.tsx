import React, { useMemo } from "react";
import * as THREE from "three";
import { rng } from "../kit3d/World";
import { Halo, SkyDome } from "../kit3d/sky";
import { Motes } from "../kit3d/magic";

// Episode 8: the Enchanted Jungle, built procedurally in Three.js. Everything depends only on props.
//
// The jungle can lose and regain its life. All jungle materials share LIFE:
//   base 0..1 how alive and colorful things are; waveR/waveOn a wave of green light spreading from the temple top.

export type V3 = [number, number, number];
export type LifeState = { base: number; waveR: number; waveOn: number };

// ---------- where things are (world units; Lumi is about 1.3 tall; the ground is y = 0 near the middle) ----------
export const PLAZA: V3 = [0, 0, 10];
export const TEMPLE: V3 = [0, 0, -44];
export const SOCKET: V3 = [TEMPLE[0], 16.6, TEMPLE[2]]; // where the Heart of the Jungle belongs, in the top shrine
export const TEMPLE_DOOR: V3 = [0, 1.6, TEMPLE[2] + 12.2];
export const KIKO_TREE: V3 = [-6.2, 0, 4.5];
export const FALLS: V3 = [17, 0, -20];

const LIFE = {
  uT: { value: 0 },
  uBase: { value: 1 },
  uWaveR: { value: 0 },
  uWaveOn: { value: 0 },
  uCenter: { value: new THREE.Vector3(...SOCKET) },
};
const setLife = (t: number, s: LifeState) => {
  LIFE.uT.value = t;
  LIFE.uBase.value = s.base;
  LIFE.uWaveR.value = s.waveR;
  LIFE.uWaveOn.value = s.waveOn;
};

export const lifeAt = (s: LifeState, p: V3) => {
  const d = Math.hypot(p[0] - SOCKET[0], p[1] - SOCKET[1], p[2] - SOCKET[2]);
  return Math.max(0, Math.min(1, s.base + s.waveOn * Math.max(0, Math.min(1, (s.waveR - d) / 10))));
};

// A jungle material: optional sway for plants, and the shared fade to dry, dull colors / the wave of green life
const lifeMat = <T extends THREE.MeshStandardMaterial>(m: T, opts: { sway?: number } = {}) => {
  const sway = opts.sway ?? 0;
  m.onBeforeCompile = (shader) => {
    Object.assign(shader.uniforms, LIFE, { uSway: { value: sway } });
    shader.vertexShader = shader.vertexShader
      .replace("#include <common>", "#include <common>\nuniform float uT; uniform float uSway; varying vec3 vLfW;")
      .replace(
        "#include <begin_vertex>",
        `#include <begin_vertex>
        if (uSway > 0.0) {
          vec3 ip = vec3(0.0);
          #ifdef USE_INSTANCING
          ip = instanceMatrix[3].xyz;
          #endif
          float sh = max(position.y, 0.0);
          transformed.x += sin(uT * 1.3 + ip.x * 0.6 + ip.z * 0.4 + position.y * 0.8) * sh * sh * uSway;
          transformed.z += cos(uT * 1.1 + ip.z * 0.5 + position.y * 0.6) * sh * sh * uSway * 0.6;
        }`,
      )
      .replace(
        "#include <project_vertex>",
        `#include <project_vertex>
        vec4 lfW = vec4(transformed, 1.0);
        #ifdef USE_INSTANCING
        lfW = instanceMatrix * lfW;
        #endif
        vLfW = (modelMatrix * lfW).xyz;`,
      );
    shader.fragmentShader = shader.fragmentShader
      .replace("#include <common>", "#include <common>\nuniform float uT; uniform float uBase; uniform float uWaveR; uniform float uWaveOn; uniform vec3 uCenter; varying vec3 vLfW;")
      .replace(
        "#include <tonemapping_fragment>",
        `float lfD = distance(vLfW, uCenter);
        float amt = clamp(uBase + uWaveOn * clamp((uWaveR - lfD) / 10.0, 0.0, 1.0), 0.0, 1.0);
        float lum = dot(gl_FragColor.rgb, vec3(0.299, 0.587, 0.114));
        gl_FragColor.rgb = mix(vec3(lum) * vec3(0.86, 0.78, 0.64) * 0.78, gl_FragColor.rgb, amt);
        float front = uWaveOn * exp(-pow((lfD - uWaveR) / 4.0, 2.0));
        gl_FragColor.rgb += front * mix(vec3(0.35, 1.0, 0.45), vec3(1.0, 0.85, 0.35), 0.5 + 0.5 * sin(lfD * 0.1)) * 0.8;
        #include <tonemapping_fragment>`,
      );
  };
  m.customProgramCacheKey = () => "life-v1";
  return m;
};

const useMat = (p: THREE.MeshStandardMaterialParameters, o?: { sway?: number }) =>
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useMemo(() => lifeMat(new THREE.MeshStandardMaterial(p), o), []);

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
  tex.anisotropy = 4;
  return tex;
};

const stoneTex = (seed: number, moss = 0.35) =>
  canvasTex(512, 512, (x) => {
    const r = rng(seed);
    x.fillStyle = "#6f6a5a";
    x.fillRect(0, 0, 512, 512);
    for (let row = 0; row < 8; row++) {
      const off = row % 2 ? 32 : 0;
      for (let col = -1; col < 8; col++) {
        const v = 0.82 + r() * 0.3;
        x.fillStyle = `rgb(${Math.floor(170 * v)},${Math.floor(160 * v)},${Math.floor(128 * v)})`;
        x.fillRect(col * 64 + off + 3, row * 64 + 3, 58, 58);
        for (let k = 0; k < 14; k++) {
          x.fillStyle = `rgba(60,55,40,${0.08 + r() * 0.12})`;
          x.fillRect(col * 64 + off + 3 + r() * 54, row * 64 + 3 + r() * 54, 2 + r() * 6, 2 + r() * 6);
        }
      }
    }
    for (let k = 0; k < 60 * moss; k++) {
      const g = x.createRadialGradient(0, 0, 0, 0, 0, 40);
      g.addColorStop(0, "rgba(80,150,60,0.75)");
      g.addColorStop(1, "rgba(80,150,60,0)");
      x.save();
      x.translate(r() * 512, r() * 512);
      x.scale(1 + r() * 2, 0.6 + r());
      x.fillStyle = g;
      x.beginPath();
      x.arc(0, 0, 40, 0, Math.PI * 2);
      x.fill();
      x.restore();
    }
  });

const barkTex = () =>
  canvasTex(
    256,
    512,
    (x) => {
      const r = rng(4);
      const g = x.createLinearGradient(0, 0, 256, 0);
      g.addColorStop(0, "#5a4030");
      g.addColorStop(0.5, "#7a5a40");
      g.addColorStop(1, "#5a4030");
      x.fillStyle = g;
      x.fillRect(0, 0, 256, 512);
      for (let k = 0; k < 70; k++) {
        x.strokeStyle = `rgba(${r() > 0.5 ? "40,28,18" : "140,110,80"},${0.25 + r() * 0.35})`;
        x.lineWidth = 2 + r() * 5;
        const sx = r() * 256;
        x.beginPath();
        x.moveTo(sx, 0);
        x.bezierCurveTo(sx + (r() - 0.5) * 40, 170, sx + (r() - 0.5) * 40, 340, sx + (r() - 0.5) * 30, 512);
        x.stroke();
      }
      for (let k = 0; k < 18; k++) {
        x.fillStyle = `rgba(90,160,70,${0.3 + r() * 0.3})`;
        x.beginPath();
        x.ellipse(r() * 256, r() * 512, 10 + r() * 30, 20 + r() * 50, 0, 0, Math.PI * 2);
        x.fill();
      }
    },
    [2, 1],
  );

const leafTex = () =>
  canvasTex(128, 256, (x) => {
    x.clearRect(0, 0, 128, 256);
    x.fillStyle = "#ffffff";
    x.beginPath();
    x.moveTo(64, 250);
    x.bezierCurveTo(-10, 180, 0, 40, 64, 6);
    x.bezierCurveTo(128, 40, 138, 180, 64, 250);
    x.fill();
    x.strokeStyle = "rgba(0,0,0,0.25)";
    x.lineWidth = 4;
    x.beginPath();
    x.moveTo(64, 250);
    x.lineTo(64, 20);
    x.stroke();
    x.lineWidth = 2;
    for (let i = 0; i < 7; i++) {
      const y = 200 - i * 26;
      x.beginPath();
      x.moveTo(64, y);
      x.lineTo(20, y - 22);
      x.moveTo(64, y);
      x.lineTo(108, y - 22);
      x.stroke();
    }
  });

const glyphTex = (i: number) =>
  canvasTex(128, 128, (x) => {
    x.clearRect(0, 0, 128, 128);
    x.strokeStyle = "#ffffff";
    x.lineWidth = 9;
    x.lineCap = "round";
    x.beginPath();
    // six original glyphs: leaf, sun, wave, spiral, eye, star
    if (i === 0) {
      x.moveTo(64, 108);
      x.bezierCurveTo(20, 80, 30, 30, 64, 18);
      x.bezierCurveTo(98, 30, 108, 80, 64, 108);
      x.moveTo(64, 108);
      x.lineTo(64, 40);
    } else if (i === 1) {
      x.arc(64, 64, 20, 0, Math.PI * 2);
      for (let k = 0; k < 8; k++) {
        const a = (k / 8) * Math.PI * 2;
        x.moveTo(64 + Math.cos(a) * 32, 64 + Math.sin(a) * 32);
        x.lineTo(64 + Math.cos(a) * 48, 64 + Math.sin(a) * 48);
      }
    } else if (i === 2) {
      for (let k = 0; k < 3; k++) {
        x.moveTo(16, 40 + k * 24);
        x.bezierCurveTo(40, 24 + k * 24, 56, 56 + k * 24, 80, 40 + k * 24);
        x.bezierCurveTo(96, 28 + k * 24, 104, 44 + k * 24, 112, 40 + k * 24);
      }
    } else if (i === 3) {
      for (let a = 0; a < Math.PI * 5; a += 0.2) {
        const rr = 4 + a * 2.6;
        a === 0 ? x.moveTo(64 + rr, 64) : x.lineTo(64 + Math.cos(a) * rr, 64 + Math.sin(a) * rr);
      }
    } else if (i === 4) {
      x.moveTo(14, 64);
      x.quadraticCurveTo(64, 18, 114, 64);
      x.quadraticCurveTo(64, 110, 14, 64);
      x.moveTo(78, 64);
      x.arc(64, 64, 14, 0, Math.PI * 2);
    } else {
      for (let k = 0; k < 5; k++) {
        const a = -Math.PI / 2 + (k * 4 * Math.PI) / 5;
        k ? x.lineTo(64 + Math.cos(a) * 48, 64 + Math.sin(a) * 48) : x.moveTo(64 + Math.cos(a) * 48, 64 + Math.sin(a) * 48);
      }
      x.closePath();
    }
    x.stroke();
  });

// ---------- the ground ----------
export const floorY = (x: number, z: number) => {
  const r = Math.hypot(x * 0.9, (z + 16) * 0.75);
  const far = Math.min(1, Math.max(0, (r - 32) / 30));
  const hills = Math.sin(x * 0.12) * Math.cos(z * 0.1) * 2 + Math.sin(x * 0.05 + z * 0.06) * 2.5;
  return far * (hills + Math.max(0, r - 55) * 0.8) + Math.sin(x * 0.7 + z * 0.5) * 0.06;
};

const keepClear = (x: number, z: number) => {
  if (Math.abs(x) < 4.8 && z < 16 && z > -32) return false; // the path to the temple
  if (Math.hypot(x - PLAZA[0], z - PLAZA[2]) < 6.5) return false;
  if (Math.hypot(x - TEMPLE[0], z - TEMPLE[2]) < 18) return false;
  if (Math.hypot(x - FALLS[0], z - FALLS[2]) < 7) return false;
  if (Math.hypot(x - KIKO_TREE[0], z - KIKO_TREE[2]) < 3.5) return false;
  return true;
};

type Item = { x: number; z: number; s: number; ry: number; c?: string };
const scatter = (seed: number, count: number, rMin: number, rMax: number, center: [number, number], sMin: number, sMax: number, keep = keepClear, colors?: string[]): Item[] => {
  const r = rng(seed);
  const out: Item[] = [];
  let guard = 0;
  while (out.length < count && guard++ < count * 60) {
    const a = r() * Math.PI * 2;
    const d = rMin + Math.sqrt(r()) * (rMax - rMin);
    const x = center[0] + Math.cos(a) * d;
    const z = center[1] + Math.sin(a) * d;
    if (!keep(x, z)) continue;
    out.push({ x, z, s: sMin + r() * (sMax - sMin), ry: r() * 6.28, c: colors ? colors[Math.floor(r() * colors.length)] : undefined });
  }
  return out;
};

const Ground: React.FC = () => {
  const geo = useMemo(() => {
    const g = new THREE.PlaneGeometry(380, 380, 200, 200);
    g.rotateX(-Math.PI / 2);
    g.translate(0, 0, -16);
    const p = g.attributes.position as THREE.BufferAttribute;
    for (let i = 0; i < p.count; i++) p.setY(i, floorY(p.getX(i), p.getZ(i)));
    g.computeVertexNormals();
    return g;
  }, []);
  const tex = useMemo(
    () =>
      canvasTex(
        512,
        512,
        (x) => {
          const r = rng(2);
          x.fillStyle = "#4f8a3a";
          x.fillRect(0, 0, 512, 512);
          for (let k = 0; k < 1400; k++) {
            x.fillStyle = r() > 0.75 ? `rgba(140,110,60,${0.3 + r() * 0.3})` : `rgba(${50 + r() * 60},${110 + r() * 70},${40 + r() * 30},0.5)`;
            x.beginPath();
            x.ellipse(r() * 512, r() * 512, 2 + r() * 7, 1 + r() * 3, r() * 3, 0, Math.PI * 2);
            x.fill();
          }
        },
        [70, 70],
      ),
    [],
  );
  const ground = useMat({ map: tex, roughness: 0.95 });
  const stone = useMemo(() => stoneTex(9, 0.6), []);
  const pathMat = useMat({ map: stone, roughness: 0.85 });
  const stones = useMemo(() => {
    const r = rng(71);
    const out: { x: number; z: number; s: number; ry: number }[] = [];
    for (let z = 14; z > -32; z -= 1.3) out.push({ x: Math.sin(z * 0.18) * 0.5 + (r() - 0.5) * 0.25, z, s: 0.55 + r() * 0.12, ry: r() * 6 });
    return out;
  }, []);
  return (
    <>
      <mesh geometry={geo} material={ground} receiveShadow />
      {stones.map((p, i) => (
        <mesh key={i} position={[p.x, 0.03, p.z]} rotation={[0, p.ry, 0]} scale={[p.s, 0.07, p.s * 0.85]} material={pathMat} receiveShadow>
          <cylinderGeometry args={[1, 1, 1, 7]} />
        </mesh>
      ))}
    </>
  );
};

// ---------- giant ancient trees ----------
const trunkGeo = (h: number, r: number) => {
  const pts: THREE.Vector2[] = [];
  for (let i = 0; i <= 20; i++) {
    const k = i / 20;
    pts.push(new THREE.Vector2(r * (0.55 + 0.45 * Math.exp(-k * 9) * 2.2 + (1 - k) * 0.25), k * h));
  }
  const g = new THREE.LatheGeometry(pts, 24);
  const p = g.attributes.position as THREE.BufferAttribute;
  for (let i = 0; i < p.count; i++) {
    const x = p.getX(i), z = p.getZ(i), y = p.getY(i);
    const a = Math.atan2(z, x);
    const k = 1 + 0.12 * Math.sin(a * 5 + y * 0.4) * Math.exp(-y / h * 2) + 0.04 * Math.sin(a * 11);
    p.setXYZ(i, x * k, y, z * k);
  }
  g.computeVertexNormals();
  return g;
};
const blobGeo = (seed: number) => {
  const g = new THREE.IcosahedronGeometry(1, 2);
  const r = rng(seed);
  const p = g.attributes.position as THREE.BufferAttribute;
  const bumps = Array.from({ length: 8 }, () => [new THREE.Vector3(r() - 0.5, r() - 0.5, r() - 0.5).normalize(), 0.12 + r() * 0.2] as const);
  for (let i = 0; i < p.count; i++) {
    const v = new THREE.Vector3().fromBufferAttribute(p, i);
    let k = 1;
    for (const [d, a] of bumps) k += a * Math.max(0, v.dot(d)) ** 3;
    v.multiplyScalar(k);
    p.setXYZ(i, v.x, v.y * 0.62, v.z);
  }
  g.computeVertexNormals();
  return g;
};

const GIANTS: { x: number; z: number; h: number; r: number; seed: number }[] = [
  { x: KIKO_TREE[0], z: KIKO_TREE[2], h: 15, r: 1.1, seed: 1 },
  { x: 7.5, z: 2, h: 17, r: 1.2, seed: 2 },
  { x: -8, z: -12, h: 19, r: 1.4, seed: 3 },
  { x: 8.5, z: -14, h: 18, r: 1.3, seed: 4 },
  { x: -11, z: 14, h: 16, r: 1.2, seed: 5 },
  { x: 11, z: 16, h: 15, r: 1.1, seed: 6 },
  { x: -15, z: -28, h: 22, r: 1.6, seed: 7 },
  { x: 14, z: -36, h: 21, r: 1.5, seed: 8 },
];

export const GiantTrees: React.FC<{ t: number; s: LifeState; camPos?: V3 }> = ({ t, s, camPos }) => {
  const bark = useMemo(() => barkTex(), []);
  const barkMat = useMat({ map: bark, roughness: 0.95 });
  const leafA = useMat({ color: "#3f9a3a", roughness: 0.75, flatShading: true, emissive: "#0a3a10", emissiveIntensity: 0.35 });
  const leafB = useMat({ color: "#2f7f4a", roughness: 0.75, flatShading: true, emissive: "#0a3020", emissiveIntensity: 0.35 });
  const lt = useMemo(() => leafTex(), []);
  const cardMat = useMat({ map: lt, color: "#5fbf4a", alphaTest: 0.5, side: THREE.DoubleSide, roughness: 0.7, emissive: "#1a5010", emissiveIntensity: 0.3 }, { sway: 0.05 });
  const vineMat = useMat({ color: "#4f8f3a", roughness: 0.8 });
  const geos = useMemo(() => GIANTS.map((g) => ({ trunk: trunkGeo(g.h, g.r), blobs: [blobGeo(g.seed * 3), blobGeo(g.seed * 3 + 1), blobGeo(g.seed * 3 + 2)] })), []);
  // leaf cards around each canopy for detail
  const cards = useMemo(() => {
    const r = rng(33);
    const out: { p: V3; ry: number; rx: number; s: number }[] = [];
    GIANTS.forEach((g) => {
      for (let i = 0; i < 70; i++) {
        const a = r() * Math.PI * 2;
        const d = 2 + r() * 4.5;
        out.push({ p: [g.x + Math.cos(a) * d, g.h - 0.5 + (r() - 0.6) * 3, g.z + Math.sin(a) * d], ry: a + Math.PI / 2, rx: -0.6 - r() * 0.8, s: 0.9 + r() * 0.8 });
      }
    });
    return out;
  }, []);
  const cardMesh = useMemo(() => {
    const g = new THREE.PlaneGeometry(0.7, 1.4);
    g.translate(0, 0.7, 0);
    const m = new THREE.InstancedMesh(g, cardMat, cards.length);
    const o = new THREE.Object3D();
    cards.forEach((c, i) => {
      o.position.set(...c.p);
      o.rotation.set(c.rx, c.ry, 0, "YXZ");
      o.scale.setScalar(c.s);
      o.updateMatrix();
      m.setMatrixAt(i, o.matrix);
    });
    m.frustumCulled = false;
    return m;
  }, [cards, cardMat]);
  return (
    <>
      {GIANTS.map((g, i) => {
        if (camPos && Math.hypot(g.x - camPos[0], g.z - camPos[2]) < 2.2) return null;
        const glow = lifeAt(s, [g.x, g.h, g.z]);
        return (
          <group key={i} position={[g.x, floorY(g.x, g.z) - 0.1, g.z]}>
            <mesh geometry={geos[i].trunk} material={barkMat} castShadow receiveShadow />
            {/* buttress roots */}
            {Array.from({ length: 6 }, (_, k) => {
              const a = (k / 6) * Math.PI * 2 + g.seed;
              return (
                <mesh key={k} position={[Math.cos(a) * g.r * 1.3, 0.6, Math.sin(a) * g.r * 1.3]} rotation={[0, -a, 0.55]} material={barkMat} castShadow>
                  <boxGeometry args={[0.3, 2.4 * g.r, 1.2 * g.r]} />
                </mesh>
              );
            })}
            {geos[i].blobs.map((b, k) => (
              <mesh key={k} geometry={b} material={k % 2 ? leafA : leafB} position={[Math.cos(k * 2.1 + g.seed) * 2.4, g.h + (k - 1) * 0.6, Math.sin(k * 2.1 + g.seed) * 2.4]} scale={4.2 - k * 0.5} castShadow />
            ))}
            {/* hanging vines */}
            {Array.from({ length: 5 }, (_, k) => {
              const a = k * 1.3 + g.seed;
              const len = 4 + (k % 3) * 2.5;
              return (
                <group key={`v${k}`} position={[Math.cos(a) * 3, g.h - 1, Math.sin(a) * 3]} rotation={[Math.sin(t * 0.9 + k) * 0.06, 0, Math.cos(t * 0.7 + k) * 0.06]}>
                  <mesh position={[0, -len / 2, 0]} material={vineMat}>
                    <cylinderGeometry args={[0.05, 0.04, len, 5]} />
                  </mesh>
                </group>
              );
            })}
            {glow > 0.6 && <Halo position={[0, g.h, 0]} size={14} color="#bfff9f" opacity={(glow - 0.6) * 0.12} />}
          </group>
        );
      })}
      <primitive object={cardMesh} />
    </>
  );
};

// ---------- smaller jungle trees, ferns, big leaves, flowers and glowing mushrooms ----------
const smallTreeGeo = () => {
  const g = new THREE.CylinderGeometry(0.18, 0.28, 5, 7);
  g.translate(0, 2.5, 0);
  return g;
};
const palmGeo = () => {
  // a fan of long leaves for palms and ferns
  const parts: THREE.BufferGeometry[] = [];
  for (let i = 0; i < 9; i++) {
    const p = new THREE.PlaneGeometry(0.45, 2.2, 1, 6);
    p.translate(0, 1.1, 0);
    const pp = p.attributes.position as THREE.BufferAttribute;
    for (let k = 0; k < pp.count; k++) {
      const y = pp.getY(k);
      pp.setZ(k, -y * y * 0.18);
      pp.setX(k, pp.getX(k) * Math.sin((y / 2.2) * Math.PI) * 1.4);
    }
    p.rotateX(-0.9 + (i % 3) * 0.2);
    p.rotateY((i / 9) * Math.PI * 2);
    parts.push(p.toNonIndexed());
  }
  const out = mergeSimple(parts);
  out.computeVertexNormals();
  return out;
};
const mergeSimple = (parts: THREE.BufferGeometry[]) => {
  const total = parts.reduce((a, p) => a + p.attributes.position.count, 0);
  const pos = new Float32Array(total * 3);
  const uv = new Float32Array(total * 2);
  let o = 0;
  for (const p of parts) {
    pos.set(p.attributes.position.array as Float32Array, o * 3);
    if (p.attributes.uv) uv.set(p.attributes.uv.array as Float32Array, o * 2);
    o += p.attributes.position.count;
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute("position", new THREE.BufferAttribute(pos, 3));
  g.setAttribute("uv", new THREE.BufferAttribute(uv, 2));
  return g;
};
const petalGeo = () => {
  const parts: THREE.BufferGeometry[] = [];
  for (let i = 0; i < 5; i++) {
    const p = new THREE.SphereGeometry(1, 10, 6);
    p.scale(0.28, 0.05, 0.5);
    p.translate(0, 0, 0.44);
    p.rotateX(-0.35);
    p.rotateY((i / 5) * Math.PI * 2);
    parts.push(p.toNonIndexed());
  }
  const out = mergeSimple(parts);
  out.computeVertexNormals();
  return out;
};
const mushroomGeo = () => {
  const stem = new THREE.CylinderGeometry(0.06, 0.08, 0.35, 8);
  stem.translate(0, 0.17, 0);
  const cap = new THREE.SphereGeometry(0.2, 14, 8, 0, Math.PI * 2, 0, Math.PI / 2);
  cap.scale(1, 0.7, 1);
  cap.translate(0, 0.33, 0);
  const out = mergeSimple([stem.toNonIndexed(), cap.toNonIndexed()]);
  out.computeVertexNormals();
  return out;
};

const FLOWER_COLORS = ["#ff4f8b", "#ff9f2f", "#ffd23f", "#ff5f5f", "#c060ff", "#ff7fd0", "#4fc0ff"];
const MUSH_COLORS = ["#5ff0ff", "#ff7fe8", "#9fff7f", "#ffd06f"];

export const Undergrowth: React.FC<{ t: number; s: LifeState; camPos?: V3; bloomAt?: (p: V3) => number }> = ({ t, s, camPos }) => {
  const lt = useMemo(() => leafTex(), []);
  const fernMat = useMat({ map: lt, color: "#4fae3f", alphaTest: 0.45, side: THREE.DoubleSide, roughness: 0.75, emissive: "#103a10", emissiveIntensity: 0.3 }, { sway: 0.08 });
  const trunkMat = useMat({ color: "#6a4a32", roughness: 0.9 });
  const petalMat = useMat({ color: "#ffffff", roughness: 0.45, emissive: "#ffffff", emissiveIntensity: 0.06, side: THREE.DoubleSide });
  const centerMat = useMat({ color: "#ffe066", roughness: 0.5, emissive: "#ffc020", emissiveIntensity: 0.4 });
  const mushMats = useMemo(() => MUSH_COLORS.map((c) => lifeMat(new THREE.MeshStandardMaterial({ color: c, roughness: 0.4, emissive: c, emissiveIntensity: 0.8 }))), []);
  const sets = useMemo(() => {
    const c: [number, number] = [0, -10];
    const flowerKeep = (x: number, z: number) => keepClear(x, z) || (Math.abs(x) > 2.2 && Math.abs(x) < 4.8 && z < 14 && z > -30);
    return {
      palms: scatter(41, 90, 6, 70, c, 1.2, 2.2),
      ferns: scatter(42, 260, 5, 60, c, 0.5, 1.1),
      flowers: [
        ...scatter(43, 220, 3, 50, c, 0.5, 0.9, flowerKeep, FLOWER_COLORS),
        ...scatter(45, 80, 0, 7, [3.5, 6], 0.38, 0.6, (x) => x > 2.3 && x < 5.2, FLOWER_COLORS),
        ...scatter(46, 60, 0, 7, [-3.6, 4], 0.38, 0.6, (x) => x < -2.4 && x > -5.2, FLOWER_COLORS),
      ],
      mush: [...scatter(44, 120, 3, 45, c, 0.8, 1.8, flowerKeep, MUSH_COLORS), ...scatter(47, 30, 0, 7, [3.6, 5], 0.8, 1.5, (x) => x > 2.4 && x < 5.2, MUSH_COLORS)],
    };
  }, []);
  const geos = useMemo(() => ({ palm: palmGeo(), trunk: smallTreeGeo(), petal: petalGeo(), center: new THREE.SphereGeometry(0.14, 10, 8), mush: mushroomGeo() }), []);
  const meshes = useMemo(() => {
    const mk = (g: THREE.BufferGeometry, m: THREE.Material, n: number, items?: Item[]) => {
      const im = new THREE.InstancedMesh(g, m, n);
      if (items) items.forEach((it, i) => it.c && im.setColorAt(i, new THREE.Color(it.c)));
      im.frustumCulled = false;
      im.castShadow = false;
      im.receiveShadow = true;
      return im;
    };
    return {
      palmTrunk: mk(geos.trunk, trunkMat, sets.palms.length),
      palmTop: mk(geos.palm, fernMat, sets.palms.length),
      fern: mk(geos.palm, fernMat, sets.ferns.length),
      petal: mk(geos.petal, petalMat, sets.flowers.length, sets.flowers),
      center: mk(geos.center, centerMat, sets.flowers.length),
      mush: MUSH_COLORS.map((c, ci) => mk(geos.mush, mushMats[ci], sets.mush.length)),
    };
  }, [geos, sets, trunkMat, fernMat, petalMat, centerMat, mushMats]);
  const o = new THREE.Object3D();
  const vis = (x: number, z: number, clear = 2) => (camPos ? Math.max(0, Math.min(1, (Math.hypot(x - camPos[0], z - camPos[2]) - clear) / 1.5)) : 1);
  sets.palms.forEach((it, i) => {
    const k = vis(it.x, it.z, 3) * it.s;
    const y = floorY(it.x, it.z);
    o.position.set(it.x, y, it.z);
    o.rotation.set(0, it.ry, Math.sin(t * 0.5 + i) * 0.02);
    o.scale.setScalar(k);
    o.updateMatrix();
    meshes.palmTrunk.setMatrixAt(i, o.matrix);
    o.position.set(it.x, y + 5 * k, it.z);
    o.updateMatrix();
    meshes.palmTop.setMatrixAt(i, o.matrix);
  });
  sets.ferns.forEach((it, i) => {
    const k = vis(it.x, it.z) * it.s;
    o.position.set(it.x, floorY(it.x, it.z), it.z);
    o.rotation.set(0, it.ry, 0);
    o.scale.set(k, k * 0.7, k);
    o.updateMatrix();
    meshes.fern.setMatrixAt(i, o.matrix);
  });
  sets.flowers.forEach((it, i) => {
    const life = lifeAt(s, [it.x, 0.5, it.z]);
    const open = 0.3 + 0.7 * life;
    const k = vis(it.x, it.z, 1.5) * it.s;
    const y = floorY(it.x, it.z) + 0.22 * k;
    o.position.set(it.x, y, it.z);
    o.rotation.set(0, it.ry + Math.sin(t + i) * 0.05, 0);
    o.scale.set(k * open, k * (0.6 + open), k * open);
    o.updateMatrix();
    meshes.petal.setMatrixAt(i, o.matrix);
    o.scale.setScalar(k * (0.6 + 0.4 * open));
    o.updateMatrix();
    meshes.center.setMatrixAt(i, o.matrix);
  });
  sets.mush.forEach((it, i) => {
    const ci = MUSH_COLORS.indexOf(it.c ?? MUSH_COLORS[0]);
    const k = vis(it.x, it.z, 1.5) * it.s;
    o.position.set(it.x, floorY(it.x, it.z), it.z);
    o.rotation.set(0, it.ry, 0);
    meshes.mush.forEach((m, mi) => {
      o.scale.setScalar(mi === ci ? k : 0);
      o.updateMatrix();
      m.setMatrixAt(i, o.matrix);
    });
  });
  const all = [meshes.palmTrunk, meshes.palmTop, meshes.fern, meshes.petal, meshes.center, ...meshes.mush];
  all.forEach((m) => (m.instanceMatrix.needsUpdate = true));
  // mushrooms glow less as the jungle loses its life
  mushMats.forEach((m) => (m.emissiveIntensity = 0.1 + 0.7 * lifeAt(s, [0, 0, 0]) + (s.waveOn ? 0.35 * Math.max(0, Math.sin(t * 3)) : 0)));
  return (
    <>
      {all.map((m, i) => (
        <primitive key={i} object={m} />
      ))}
    </>
  );
};

// ---------- the waterfall ----------
const FALL_VERT = /* glsl */ `varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`;
const FALL_FRAG = /* glsl */ `
uniform float uT; uniform float uLife; varying vec2 vUv;
float h1(float n){ return fract(sin(n) * 43758.5453); }
float n1(float x){ float i = floor(x); float f = fract(x); return mix(h1(i), h1(i + 1.0), f * f * (3.0 - 2.0 * f)); }
void main() {
  float s1 = n1(vUv.x * 30.0);
  float flow = n1(vUv.x * 60.0 + floor((vUv.y + uT * 1.6) * 8.0) * 3.1) * 0.5 + 0.5 * sin((vUv.y + uT * 1.8) * 40.0 + s1 * 8.0);
  vec3 c = mix(vec3(0.55, 0.85, 0.95), vec3(0.95, 1.0, 1.0), flow * 0.7 + s1 * 0.3);
  c *= 0.75 + 0.35 * uLife;
  c += vec3(0.6, 1.0, 0.9) * uLife * 0.25 * step(0.92, h1(floor(vUv.x * 80.0) + floor((vUv.y + uT) * 30.0)));
  float edge = smoothstep(0.0, 0.08, vUv.x) * smoothstep(1.0, 0.92, vUv.x);
  gl_FragColor = vec4(c, (0.7 + 0.25 * flow) * edge);
}`;

export const Waterfall: React.FC<{ t: number; s: LifeState }> = ({ t, s }) => {
  const stone = useMemo(() => stoneTex(14, 0.9), []);
  const rock = useMat({ map: stone, roughness: 0.9, flatShading: true });
  const leaf = useMat({ color: "#3f9a3a", roughness: 0.75, flatShading: true });
  const life = lifeAt(s, FALLS);
  const uniforms = useMemo(() => ({ uT: { value: 0 }, uLife: { value: 1 } }), []);
  uniforms.uT.value = t;
  uniforms.uLife.value = life;
  const fallGeo = useMemo(() => {
    const g = new THREE.PlaneGeometry(4.5, 14, 1, 20);
    const p = g.attributes.position as THREE.BufferAttribute;
    for (let i = 0; i < p.count; i++) {
      const y = p.getY(i);
      p.setZ(i, Math.pow((7 - y) / 14, 2) * 1.6);
    }
    g.translate(0, 7, 0);
    return g;
  }, []);
  return (
    <group position={FALLS} rotation={[0, -0.7, 0]}>
      {[
        [-4, 6, -2, 3.5, 7, 3],
        [4, 6, -2, 3.5, 7, 3],
        [0, 13, -3.5, 6, 3, 3.5],
        [-6.5, 3, -1, 3, 4, 3],
        [6.5, 3, -1, 3, 4, 3],
      ].map(([x, y, z, sx, sy, sz], i) => (
        <mesh key={i} position={[x, y, z]} scale={[sx, sy, sz]} material={rock} castShadow>
          <dodecahedronGeometry args={[1, 1]} />
        </mesh>
      ))}
      {[-4.5, 0, 4.5].map((x, i) => (
        <mesh key={i} position={[x, 15 + (i % 2), -3]} scale={[3.4, 2, 2.6]} material={leaf}>
          <icosahedronGeometry args={[1, 1]} />
        </mesh>
      ))}
      <mesh geometry={fallGeo} position={[0, 0, -0.6]}>
        <shaderMaterial vertexShader={FALL_VERT} fragmentShader={FALL_FRAG} uniforms={uniforms} transparent depthWrite={false} side={THREE.DoubleSide} />
      </mesh>
      <mesh position={[0, 0.06, 2.5]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[5, 40]} />
        <meshPhysicalMaterial color="#3fa0b8" roughness={0.08} clearcoat={1} emissive="#1a6a80" emissiveIntensity={0.2 + life * 0.25} />
      </mesh>
      <Motes t={t} center={[0, 1.2, 1.6]} size={[5, 2.4, 2]} count={160} color="#ffffff" bright={0.6 + life * 0.5} />
      {life > 0.5 && <Halo position={[0, 6, 0]} size={16} color="#bfffef" opacity={(life - 0.5) * 0.25} />}
    </group>
  );
};

// ---------- butterflies and birds ----------
const BF_COLORS = ["#ff7fd0", "#ffd23f", "#4fc0ff", "#ff9f2f", "#c060ff", "#7fff9f"];
export const Butterflies: React.FC<{ t: number; count: number; center?: V3; spread?: number; camPos?: V3 }> = ({ t, count, center = [0, 2, 0], spread = 14, camPos }) => {
  const data = useMemo(() => {
    const r = rng(61);
    return Array.from({ length: 40 }, () => ({ x: (r() - 0.5) * spread, z: (r() - 0.5) * spread, y: 0.8 + r() * 3, rr: 1 + r() * 2.5, sp: 0.4 + r() * 0.6, ph: r() * 6.28, c: BF_COLORS[Math.floor(r() * BF_COLORS.length)] }));
  }, [spread]);
  const wing = useMemo(() => {
    const g = new THREE.CircleGeometry(0.09, 12);
    g.scale(1, 1.3, 1);
    g.translate(0.085, 0.03, 0);
    return g;
  }, []);
  return (
    <>
      {data.slice(0, count).map((b, i) => {
        const a = t * b.sp + b.ph;
        const x = center[0] + b.x + Math.cos(a) * b.rr;
        const z = center[2] + b.z + Math.sin(a * 1.3) * b.rr;
        const y = center[1] + b.y + Math.sin(t * 2 + b.ph) * 0.4;
        if (camPos && Math.hypot(x - camPos[0], y - camPos[1], z - camPos[2]) < 1.2) return null;
        const flap = Math.sin(t * 14 + b.ph) * 0.9;
        const col = new THREE.Color(b.c).multiplyScalar(1.3);
        return (
          <group key={i} position={[x, y, z]} rotation={[0, -a, 0]}>
            {[-1, 1].map((sd) => (
              <mesh key={sd} geometry={wing} rotation={[Math.PI / 2 - 0.4, 0, sd > 0 ? flap : Math.PI - flap]}>
                <meshBasicMaterial color={col} side={THREE.DoubleSide} toneMapped={false} />
              </mesh>
            ))}
          </group>
        );
      })}
    </>
  );
};

export const Birds: React.FC<{ t: number; count: number }> = ({ t, count }) => {
  const data = useMemo(() => {
    const r = rng(81);
    return Array.from({ length: 14 }, () => ({ cx: (r() - 0.5) * 40, cz: -10 + (r() - 0.5) * 40, y: 9 + r() * 8, rr: 6 + r() * 10, sp: 0.25 + r() * 0.25, ph: r() * 6.28, c: ["#ff5f3f", "#3fa0ff", "#ffd23f", "#3fd08f"][Math.floor(r() * 4)] }));
  }, []);
  return (
    <>
      {data.slice(0, count).map((b, i) => {
        const a = t * b.sp + b.ph;
        const flap = Math.sin(t * 10 + b.ph) * 0.7;
        return (
          <group key={i} position={[b.cx + Math.cos(a) * b.rr, b.y + Math.sin(a * 2) * 0.8, b.cz + Math.sin(a) * b.rr]} rotation={[0, -a, 0]} scale={0.8}>
            <mesh scale={[0.12, 0.12, 0.35]}>
              <sphereGeometry args={[1, 10, 8]} />
              <meshStandardMaterial color={b.c} roughness={0.6} />
            </mesh>
            {[-1, 1].map((sd) => (
              <mesh key={sd} position={[sd * 0.05, 0.02, 0]} rotation={[0, 0, sd * flap]}>
                <boxGeometry args={[0.55, 0.02, 0.18]} />
                <meshStandardMaterial color={b.c} roughness={0.6} />
              </mesh>
            ))}
          </group>
        );
      })}
    </>
  );
};

// ---------- sunbeams through the canopy ----------
const RAY_VERT = /* glsl */ `varying vec2 vUv; varying vec3 vN; varying vec3 vV; void main(){ vUv = uv; vec4 mv = modelViewMatrix * vec4(position, 1.0); vN = normalMatrix * normal; vV = -mv.xyz; gl_Position = projectionMatrix * mv; }`;
const RAY_FRAG = /* glsl */ `uniform float uT; uniform float uPh; uniform float uOn; varying vec2 vUv; varying vec3 vN; varying vec3 vV;
void main(){ float face = pow(abs(dot(normalize(vN), normalize(vV))), 2.5); float len = smoothstep(0.0, 0.7, vUv.y);
  float flick = 0.7 + 0.3 * sin(uT * 0.8 + uPh); gl_FragColor = vec4(vec3(1.0, 0.95, 0.75), face * len * flick * 0.18 * uOn); }`;

const SunRays: React.FC<{ t: number; on: number }> = ({ t, on }) => {
  const rays = useMemo(() => {
    const r = rng(5);
    return Array.from({ length: 14 }, () => ({ x: (r() - 0.5) * 36, z: -12 + (r() - 0.5) * 40, w: 0.6 + r() * 1.2, ph: r() * 9 }));
  }, []);
  const mats = useMemo(() => rays.map((ry) => new THREE.ShaderMaterial({ vertexShader: RAY_VERT, fragmentShader: RAY_FRAG, uniforms: { uT: { value: 0 }, uPh: { value: ry.ph }, uOn: { value: 1 } }, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, side: THREE.DoubleSide, fog: false })), [rays]);
  mats.forEach((m) => {
    m.uniforms.uT.value = t;
    m.uniforms.uOn.value = on;
  });
  return (
    <>
      {rays.map((ry, i) => (
        <group key={i} position={[ry.x, 22, ry.z]} rotation={[0.18, 0, 0.3]}>
          <mesh position={[0, -12, 0]} material={mats[i]}>
            <cylinderGeometry args={[ry.w * 0.5, ry.w * 1.4, 26, 16, 1, true]} />
          </mesh>
        </group>
      ))}
    </>
  );
};

// ---------- the ancient stone temple ----------
const TIERS = [
  { w: 24, d: 24, h: 3 },
  { w: 19, d: 19, h: 3 },
  { w: 14.5, d: 14.5, h: 3 },
  { w: 10.5, d: 10.5, h: 3 },
];
export const Temple: React.FC<{ t: number; s: LifeState; heartHome?: number }> = ({ t, s, heartHome = 0 }) => {
  const tex = useMemo(() => {
    const x = stoneTex(21, 0.55);
    x.repeat.set(3, 1);
    return x;
  }, []);
  const stone = useMat({ map: tex, roughness: 0.9 });
  const stairs = useMat({ color: "#a89a78", roughness: 0.85, flatShading: true });
  const vineMat = useMat({ color: "#3f8f3a", roughness: 0.8 }, { sway: 0.02 });
  const life = lifeAt(s, SOCKET);
  const glyphs = useMemo(() => [0, 1, 2, 3, 4, 5].map((i) => glyphTex(i)), []);
  const glow = new THREE.Color("#7fff8f").lerp(new THREE.Color("#ffd86f"), 0.4).multiplyScalar(0.25 + life * 1.6 + heartHome * 0.6);
  let y = 0;
  return (
    <group position={TEMPLE}>
      {TIERS.map((tr, i) => {
        const y0 = y;
        y += tr.h;
        return (
          <group key={i}>
            <mesh position={[0, y0 + tr.h / 2, 0]} material={stone} castShadow receiveShadow>
              <boxGeometry args={[tr.w, tr.h, tr.d]} />
            </mesh>
            {/* glowing carved symbols along each tier */}
            {[-1, 1].map((sd) => (
              <mesh key={sd} position={[sd * tr.w * 0.3, y0 + tr.h / 2, tr.d / 2 + 0.02]}>
                <planeGeometry args={[1.5, 1.5]} />
                <meshBasicMaterial map={glyphs[(i * 2 + (sd > 0 ? 1 : 0)) % 6]} color={glow} transparent toneMapped={false} />
              </mesh>
            ))}
          </group>
        );
      })}
      {/* the great stair up the front */}
      {Array.from({ length: 24 }, (_, k) => (
        <mesh key={k} position={[0, k * 0.5 + 0.25, TIERS[0].d / 2 - k * 0.56 + 0.6]} material={stairs} receiveShadow>
          <boxGeometry args={[4.4, 0.5, 0.6]} />
        </mesh>
      ))}
      {/* the doorway into the temple at the foot of the stair */}
      <mesh position={[-3.6, 1.6, TIERS[0].d / 2 + 0.03]}>
        <planeGeometry args={[2.2, 3.2]} />
        <meshBasicMaterial color="#15140f" />
      </mesh>
      <mesh position={[3.6, 1.6, TIERS[0].d / 2 + 0.03]}>
        <planeGeometry args={[2.2, 3.2]} />
        <meshBasicMaterial color="#15140f" />
      </mesh>
      {/* the top shrine where the Heart belongs */}
      <group position={[0, y, 0]}>
        {[-1, 1].map((sx) =>
          [-1, 1].map((sz) => (
            <mesh key={`${sx}${sz}`} position={[sx * 2.6, 2, sz * 2.6]} material={stone} castShadow>
              <boxGeometry args={[1.1, 4, 1.1]} />
            </mesh>
          )),
        )}
        <mesh position={[0, 4.5, 0]} material={stone} castShadow>
          <boxGeometry args={[7, 1, 7]} />
        </mesh>
        <mesh position={[0, 5.6, 0]} material={stone} castShadow>
          <coneGeometry args={[3.6, 2.2, 4]} />
        </mesh>
        <mesh position={[0, 0.5, 0]} material={stone}>
          <cylinderGeometry args={[1.2, 1.4, 1, 8]} />
        </mesh>
        <mesh position={[0, 1.05, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[0.8, 1.15, 32]} />
          <meshBasicMaterial color={glow} toneMapped={false} />
        </mesh>
        <Halo position={[0, 1.6, 0]} size={6 + life * 14} color="#9fff9f" opacity={0.08 + life * 0.3 + heartHome * 0.2} />
      </group>
      {/* vines draped over the stones */}
      {Array.from({ length: 16 }, (_, k) => {
        const tier = k % 4;
        const tr = TIERS[tier];
        const side = k % 2 ? 1 : -1;
        const len = 2 + (k % 3);
        const yy = tier * 3 + 3;
        return (
          <mesh key={k} position={[side * (tr.w / 2 - 1 - (k % 5)), yy - len / 2, tr.d / 2 + 0.06]} rotation={[0, 0, Math.sin(t * 0.8 + k) * 0.04]} material={vineMat}>
            <cylinderGeometry args={[0.07, 0.05, len, 5]} />
          </mesh>
        );
      })}
      <pointLight position={[0, y + 2, 4]} color="#bfffb0" intensity={10 + life * 60} distance={30} decay={1.5} />
    </group>
  );
};

// ---------- the Heart of the Jungle: a glowing emerald heart wrapped in a golden vine ----------
export const HeartOfJungle: React.FC<{ position: V3; t: number; glow: number; scale?: number; spin?: number }> = ({ position, t, glow, scale = 1, spin = 0.6 }) => {
  const geo = useMemo(() => {
    const s = new THREE.Shape();
    s.moveTo(0, -0.55);
    s.bezierCurveTo(-0.15, -0.35, -0.6, -0.15, -0.6, 0.18);
    s.bezierCurveTo(-0.6, 0.45, -0.3, 0.6, 0, 0.35);
    s.bezierCurveTo(0.3, 0.6, 0.6, 0.45, 0.6, 0.18);
    s.bezierCurveTo(0.6, -0.15, 0.15, -0.35, 0, -0.55);
    const g = new THREE.ExtrudeGeometry(s, { depth: 0.22, bevelEnabled: true, bevelThickness: 0.12, bevelSize: 0.1, bevelSegments: 4, curveSegments: 24 });
    g.center();
    return g;
  }, []);
  return (
    <group position={position} scale={scale}>
      <Halo position={[0, 0, 0]} size={2.4 + glow * 4} color="#8fff9f" opacity={0.2 + glow * 0.55} />
      <group rotation={[0, Math.sin(t * spin) * 0.6, 0]}>
        <mesh geometry={geo}>
          <meshPhysicalMaterial color="#2fd86a" emissive="#1fb050" emissiveIntensity={0.4 + glow * 1.8} roughness={0.12} metalness={0.1} clearcoat={1} transmission={0} />
        </mesh>
        <mesh rotation={[Math.PI / 2, 0, t * 0.8]}>
          <torusGeometry args={[0.78, 0.035, 8, 64]} />
          <meshStandardMaterial color="#ffd86f" emissive="#ffb030" emissiveIntensity={0.5 + glow} metalness={0.7} roughness={0.3} />
        </mesh>
        {Array.from({ length: 6 }, (_, i) => {
          const a = (i / 6) * Math.PI * 2 + t * 0.8;
          return (
            <mesh key={i} position={[Math.cos(a) * 0.78, 0, Math.sin(a) * 0.78]} rotation={[0, -a, 0.8]} scale={[0.07, 0.14, 0.02]}>
              <sphereGeometry args={[1, 8, 6]} />
              <meshStandardMaterial color="#5fe070" emissive="#3fc050" emissiveIntensity={0.6 + glow} />
            </mesh>
          );
        })}
      </group>
      <pointLight color="#9fffb0" intensity={3 + glow * 26} distance={10} decay={1.5} />
    </group>
  );
};

// ---------- inside the temple: the stone cage and its symbols ----------
export const CAGE: V3 = [0, 0, 0];
export const HEART_IN: V3 = [0, 1.35, 0];
export const GLYPH_SPOTS: V3[] = Array.from({ length: 6 }, (_, i) => {
  const a = Math.PI * (0.15 + (i / 5) * 0.7);
  return [-Math.cos(a) * 2.3, 0.02, 1.05 + Math.sin(a) * 0.45];
});

export const TempleChamber: React.FC<{ t: number; s: LifeState; lit: number; open: number; doorLift?: number; push?: number; shimmer?: number; light?: number }> = ({ t, s, lit, open, doorLift = 0, push = 0, shimmer = 0, light = 0 }) => {
  setLife(t, s);
  const wallTex = useMemo(() => {
    const x = stoneTex(31, 0.5);
    x.repeat.set(4, 2);
    return x;
  }, []);
  const floorTex = useMemo(() => {
    const x = stoneTex(32, 0.2);
    x.repeat.set(5, 5);
    return x;
  }, []);
  const walls = useMat({ map: wallTex, roughness: 0.9, side: THREE.BackSide });
  const floor = useMat({ map: floorTex, roughness: 0.9 });
  const stone = useMat({ map: wallTex, roughness: 0.85 });
  const vineMat = useMat({ color: "#3f8f3a", roughness: 0.8 });
  const glyphs = useMemo(() => [0, 1, 2, 3, 4, 5].map((i) => glyphTex(i)), []);
  const cageGlow = new THREE.Color("#7fff8f").lerp(new THREE.Color("#ffd86f"), 0.5).multiplyScalar(0.2 + light * 2.2);
  return (
    <>
      <fogExp2 attach="fog" args={["#20281a", 0.04]} />
      <hemisphereLight args={["#ffe8c0", "#2a3020", 0.55]} />
      <pointLight position={[0, 6, 3]} color="#ffe0b0" intensity={26} distance={20} decay={1.4} />
      <pointLight position={[-4, 2.5, 2]} color="#ffb060" intensity={8} distance={10} decay={1.5} />
      <pointLight position={[4, 2.5, 2]} color="#ffb060" intensity={8} distance={10} decay={1.5} />
      <mesh position={[0, 4, -1]} material={walls}>
        <boxGeometry args={[16, 8, 16]} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} material={floor} receiveShadow>
        <planeGeometry args={[16, 16]} />
      </mesh>
      {/* a shaft of daylight from a gap in the roof */}
      <mesh position={[0.5, 4, 0.5]} rotation={[0, 0, 0.15]}>
        <cylinderGeometry args={[0.7, 1.8, 8, 20, 1, true]} />
        <meshBasicMaterial color="#fff2c0" transparent opacity={0.1} depthWrite={false} blending={THREE.AdditiveBlending} side={THREE.DoubleSide} toneMapped={false} />
      </mesh>
      {/* carved pillars and hanging vines */}
      {[-5.5, -3, 3, 5.5].map((x, i) => (
        <mesh key={i} position={[x, 3.5, -4.5]} material={stone}>
          <boxGeometry args={[1.1, 7, 1.1]} />
        </mesh>
      ))}
      {Array.from({ length: 12 }, (_, k) => (
        <mesh key={k} position={[-6 + k * 1.1, 6.3, -6.8 + (k % 3) * 0.3]} rotation={[0, 0, Math.sin(t * 0.7 + k) * 0.05]} material={vineMat}>
          <cylinderGeometry args={[0.05, 0.04, 3 + (k % 4), 5]} />
        </mesh>
      ))}
      {/* torches: little glowing amber crystals */}
      {[-4.2, 4.2].map((x, i) => (
        <mesh key={i} position={[x, 2.4, -4]}>
          <octahedronGeometry args={[0.22, 0]} />
          <meshBasicMaterial color={new THREE.Color("#ffb860").multiplyScalar(1.8 + 0.3 * Math.sin(t * 7 + i))} toneMapped={false} />
        </mesh>
      ))}
      {/* the stone cage: pedestal, four pillars, a heavy lid and a front door */}
      <group position={CAGE}>
        <mesh position={[0, 0.35, 0]} material={stone}>
          <boxGeometry args={[1.9, 0.7, 1.9]} />
        </mesh>
        {[-1, 1].map((sx) =>
          [-1, 1].map((sz) => (
            <mesh key={`${sx}${sz}`} position={[sx * 0.82, 0.7 + 1.1 * (1 - open * 0.98), sz * 0.82]} material={stone}>
              <boxGeometry args={[0.32, 2.2, 0.32]} />
            </mesh>
          )),
        )}
        <mesh position={[0 + push * 0.03, 2.95 + open * 1.6, 0]} material={stone}>
          <boxGeometry args={[2.1, 0.4, 2.1]} />
        </mesh>
        {/* bars on the sides and back */}
        {open < 0.98 &&
          [-0.4, 0, 0.4].map((b) => (
            <group key={b}>
              <mesh position={[b, 1.8 - open * 1.1, -0.82]} material={stone}>
                <cylinderGeometry args={[0.06, 0.06, 2.1 * (1 - open), 6]} />
              </mesh>
              <mesh position={[-0.82, 1.8 - open * 1.1, b]} material={stone}>
                <cylinderGeometry args={[0.06, 0.06, 2.1 * (1 - open), 6]} />
              </mesh>
              <mesh position={[0.82, 1.8 - open * 1.1, b]} material={stone}>
                <cylinderGeometry args={[0.06, 0.06, 2.1 * (1 - open), 6]} />
              </mesh>
            </group>
          ))}
        {/* the front stone door */}
        <group position={[push * 0.02, 1.8 + doorLift * 0.25 + open * 2.4, 0.86]}>
          <mesh position={[0, 0.98, 0]} material={stone}>
            <boxGeometry args={[1.5, 0.22, 0.2]} />
          </mesh>
          <mesh position={[0, -0.98, 0]} material={stone}>
            <boxGeometry args={[1.5, 0.22, 0.2]} />
          </mesh>
          {[-0.5, -0.17, 0.17, 0.5].map((b) => (
            <mesh key={b} position={[b, 0, 0]} material={stone}>
              <cylinderGeometry args={[0.065, 0.065, 1.8, 6]} />
            </mesh>
          ))}
          <mesh position={[0, 0.98, 0.11]}>
            <planeGeometry args={[0.36, 0.2]} />
            <meshBasicMaterial color={cageGlow} toneMapped={false} />
          </mesh>
        </group>
        <mesh position={[0, 3.18 + open * 1.6, 0.6]} rotation={[-0.6, 0, 0]}>
          <planeGeometry args={[0.8, 0.8]} />
          <meshBasicMaterial map={glyphs[0]} color={cageGlow} transparent toneMapped={false} />
        </mesh>
        <Halo position={[0, 1.6, 0.4]} size={3 + light * 6} color="#bfff9f" opacity={light * 0.6} />
      </group>
      {/* six glyph stones in an arc in front of the cage */}
      {GLYPH_SPOTS.map((p, i) => {
        const on = Math.max(0, Math.min(1, lit - i));
        const col = new THREE.Color("#7fff8f").lerp(new THREE.Color("#ffd86f"), (i % 2) * 0.6).multiplyScalar(0.25 + shimmer * 0.4 * (0.5 + 0.5 * Math.sin(t * 4 + i)) + on * 2.4);
        return (
          <group key={i} position={p}>
            <mesh position={[0, 0.08, 0]} material={stone}>
              <cylinderGeometry args={[0.42, 0.48, 0.16, 12]} />
            </mesh>
            <mesh position={[0, 0.17, 0]} rotation={[-Math.PI / 2, 0, 0]}>
              <planeGeometry args={[0.65, 0.65]} />
              <meshBasicMaterial map={glyphs[i]} color={col} transparent toneMapped={false} />
            </mesh>
            {on > 0 && <Halo position={[0, 0.4, 0]} size={1.6} color="#bfff9f" opacity={on * 0.6} />}
          </group>
        );
      })}
      <Motes t={t} center={[0, 2.5, 0]} size={[12, 5, 10]} count={140} color="#fff2c0" bright={0.5} />
    </>
  );
};

// ---------- the desert hologram the leaf shows at the end ----------
const HOLO_VERT = /* glsl */ `varying vec2 vUv; varying vec3 vN; varying vec3 vV; void main(){ vUv = uv; vec4 mv = modelViewMatrix * vec4(position, 1.0); vN = normalMatrix * normal; vV = -mv.xyz; gl_Position = projectionMatrix * mv; }`;
const HOLO_FRAG = /* glsl */ `uniform float uT; uniform float uOn; varying vec2 vUv; varying vec3 vN; varying vec3 vV;
void main() { float f = pow(1.0 - abs(dot(normalize(vN), normalize(vV))), 1.6); float lines = 0.75 + 0.25 * sin(vUv.y * 140.0 - uT * 6.0);
  vec3 c = vec3(1.0, 0.78, 0.35) * (0.12 + f * 1.1) * lines; gl_FragColor = vec4(c, (0.1 + f * 0.6) * uOn); }`;

export const DesertHologram: React.FC<{ position: V3; t: number; on: number; scale?: number }> = ({ position, t, on, scale = 1 }) => {
  const uniforms = useMemo(() => ({ uT: { value: 0 }, uOn: { value: 0 } }), []);
  uniforms.uT.value = t;
  uniforms.uOn.value = on;
  if (on <= 0.001) return null;
  const gold = (k: number) => new THREE.Color("#ffc860").multiplyScalar(k * on);
  const s = scale * (0.3 + 0.7 * on);
  return (
    <group position={position} scale={s}>
      <Halo position={[0, 1.0, 0]} size={8} color="#ffd080" opacity={0.25 * on} />
      <mesh>
        <sphereGeometry args={[2, 48, 24, 0, Math.PI * 2, 0, Math.PI / 2]} />
        <shaderMaterial vertexShader={HOLO_VERT} fragmentShader={HOLO_FRAG} uniforms={uniforms} transparent depthWrite={false} side={THREE.DoubleSide} blending={THREE.AdditiveBlending} />
      </mesh>
      {[
        [0, 1.25, -0.3],
        [-0.95, 0.85, 0.1],
        [0.9, 0.7, 0.2],
      ].map(([x, h, z], i) => (
        <mesh key={i} position={[x, h / 2, z]} rotation={[0, Math.PI / 4, 0]}>
          <coneGeometry args={[h * 0.78, h, 4]} />
          <meshBasicMaterial color={gold(1.1)} transparent opacity={0.8} toneMapped={false} blending={THREE.AdditiveBlending} depthWrite={false} />
        </mesh>
      ))}
      {/* dunes */}
      {[-1.2, 0.2, 1.3].map((x, i) => (
        <mesh key={i} position={[x, 0, 0.9 - i * 0.2]} scale={[0.9, 0.22, 0.4]}>
          <sphereGeometry args={[1, 20, 10, 0, Math.PI * 2, 0, Math.PI / 2]} />
          <meshBasicMaterial color={gold(0.7)} transparent opacity={0.6} toneMapped={false} blending={THREE.AdditiveBlending} depthWrite={false} />
        </mesh>
      ))}
      <mesh position={[1.1, 1.55, -0.6]}>
        <circleGeometry args={[0.28, 24]} />
        <meshBasicMaterial color={new THREE.Color("#fff0b0").multiplyScalar(2 * on)} toneMapped={false} />
      </mesh>
      {Array.from({ length: 12 }, (_, i) => (
        <mesh key={i} position={[Math.sin(i * 2.3 + t * 0.5) * 1.4, 0.3 + ((i * 0.31 + t * 0.12) % 1.3), Math.cos(i * 1.7 + t * 0.4) * 0.7]}>
          <sphereGeometry args={[0.025, 6, 4]} />
          <meshBasicMaterial color={gold(2.5)} toneMapped={false} />
        </mesh>
      ))}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, 0]}>
        <ringGeometry args={[1.95, 2.1, 64]} />
        <meshBasicMaterial color={gold(3)} toneMapped={false} transparent />
      </mesh>
    </group>
  );
};

// ---------- the green path of leaves the friends arrive on ----------
export const LeafTrail: React.FC<{ t: number; on: number; from: V3; to: V3; count?: number }> = ({ t, on, from, to, count = 26 }) => {
  if (on <= 0) return null;
  return (
    <>
      {Array.from({ length: count }, (_, i) => {
        const k = i / (count - 1);
        if (k > on) return null;
        const x = from[0] + (to[0] - from[0]) * k + Math.sin(k * 7) * 0.4;
        const z = from[2] + (to[2] - from[2]) * k;
        const y = from[1] + (to[1] - from[1]) * k + Math.sin(k * Math.PI) * 1.5;
        return (
          <mesh key={i} position={[x, y + 0.05, z]} rotation={[-Math.PI / 2, 0, t * 0.6 + i]} scale={[0.22, 0.42, 1]}>
            <circleGeometry args={[1, 12]} />
            <meshBasicMaterial color={new THREE.Color("#8fff7f").multiplyScalar(1.4 + 0.5 * Math.sin(t * 4 + i))} toneMapped={false} transparent opacity={0.85} depthWrite={false} />
          </mesh>
        );
      })}
    </>
  );
};

// ---------- lights ----------
const JungleLights: React.FC<{ life: number }> = ({ life }) => (
  <>
    <hemisphereLight args={["#bfe8ff", "#3a6a2a", 0.55 + life * 0.25]} />
    <directionalLight
      position={[25, 50, 20]}
      intensity={1.1 + life * 0.8}
      color="#fff0d0"
      castShadow
      shadow-mapSize={[2048, 2048]}
      shadow-camera-left={-45}
      shadow-camera-right={45}
      shadow-camera-top={45}
      shadow-camera-bottom={-45}
      shadow-camera-near={1}
      shadow-camera-far={150}
      shadow-bias={-0.0006}
    />
    <directionalLight position={[-30, 12, -20]} intensity={0.3} color="#bfffd0" />
  </>
);

// The whole Enchanted Jungle. s = the life state for this frame.
export const EnchantedJungle: React.FC<{ t: number; s: LifeState; camPos?: V3; heartHome?: number; wildlife?: number; temple?: boolean }> = ({ t, s, camPos, heartHome = 0, wildlife = 1, temple = true }) => {
  setLife(t, s);
  const life = lifeAt(s, [0, 0, 0]);
  return (
    <>
      <fogExp2 attach="fog" args={[new THREE.Color("#8ac0b0").lerp(new THREE.Color("#8a8878"), 1 - life).getStyle(), 0.0085]} />
      <SkyDome t={t} top="#3a8ae8" mid="#8fd0f0" low="#e8f8e0" moonDir={[0.4, 0.6, -0.7]} moonTint="#fff2c0" />
      <Halo position={[120, 140, -260]} size={120} color="#fff2c0" opacity={0.6} />
      <JungleLights life={life} />
      <Ground />
      <GiantTrees t={t} s={s} camPos={camPos} />
      <Undergrowth t={t} s={s} camPos={camPos} />
      <Waterfall t={t} s={s} />
      {temple && <Temple t={t} s={s} heartHome={heartHome} />}
      <SunRays t={t} on={0.4 + 0.6 * life} />
      <Butterflies t={t} count={Math.round((8 + 24 * life) * wildlife)} center={[0, 0, 4]} spread={22} camPos={camPos} />
      <Butterflies t={t + 7} count={Math.round(10 * life * wildlife)} center={[0, 0, -24]} spread={20} camPos={camPos} />
      <Birds t={t} count={Math.round((2 + 10 * life) * wildlife)} />
      <Motes t={t} center={[0, 4, -10]} size={[50, 10, 50]} count={240} color="#fff8d0" bright={0.35 + 0.5 * life} />
    </>
  );
};
