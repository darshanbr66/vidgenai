import React, { useMemo } from "react";
import * as THREE from "three";
import { rng } from "../kit3d/World";
import { Halo } from "../kit3d/sky";

// Episode 10: the Floating Sky City, built procedurally in Three.js. Everything depends only on props.
//
// The city's colors depend on the Sky Crystal. Shared uniforms (CITY) drive every city material:
// base 0..1 how colorful the city is, plus a wave of color spreading from the crystal (waveR / waveOn).

export type V3 = [number, number, number];
export type CityState = { base: number; waveR: number; waveOn: number };

// ---------- where things are (world units; Lumi is about 1.3 tall) ----------
export const STEP = (i: number): V3 => [0, i * 0.68, 6.5 - i * 0.95];
export const STEPS = 15;
export const PLAZA: V3 = [0, 9.3, -16]; // top of the staircase, where Nimbus hides
export const CLOUD_BED: V3 = [4.6, 9.3, -15.2]; // the giant cloud Bobo lands in
export const GRAV: V3 = [18, 9.3, -30]; // the gravity garden floor
export const CEIL_Y = GRAV[1] + 3.3; // the underside of the upside-down island above it
export const TOWER: V3 = [-9, 9.3, -46];
export const TOWER_H = 16;
export const CHAMBER_Y = TOWER[1] + TOWER_H; // floor of the crystal chamber
export const CRYSTAL_AT: V3 = [TOWER[0], CHAMBER_Y + 1.7, TOWER[2]];

const CITY = {
  uT: { value: 0 },
  uBase: { value: 1 },
  uWaveR: { value: 0 },
  uWaveOn: { value: 0 },
  uCenter: { value: new THREE.Vector3(...CRYSTAL_AT) },
};
const setCity = (t: number, s: CityState) => {
  CITY.uT.value = t;
  CITY.uBase.value = s.base;
  CITY.uWaveR.value = s.waveR;
  CITY.uWaveOn.value = s.waveOn;
};
export const cityAt = (s: CityState, p: V3) => {
  const d = Math.hypot(p[0] - CRYSTAL_AT[0], p[1] - CRYSTAL_AT[1], p[2] - CRYSTAL_AT[2]);
  return Math.max(0, Math.min(1, s.base + s.waveOn * Math.max(0, Math.min(1, (s.waveR - d) / 12))));
};

// A city material: pale and grey-blue while the crystal is weak, full color when it shines
const cityMat = <T extends THREE.MeshStandardMaterial>(m: T, dull = 0.75, glow = 0) => {
  m.onBeforeCompile = (shader) => {
    Object.assign(shader.uniforms, CITY, { uDull: { value: dull }, uGlowW: { value: glow } });
    shader.vertexShader = shader.vertexShader
      .replace("#include <common>", "#include <common>\nvarying vec3 vCtW;")
      .replace(
        "#include <project_vertex>",
        `#include <project_vertex>
        vec4 ctW = vec4(transformed, 1.0);
        #ifdef USE_INSTANCING
        ctW = instanceMatrix * ctW;
        #endif
        vCtW = (modelMatrix * ctW).xyz;`,
      );
    shader.fragmentShader = shader.fragmentShader
      .replace("#include <common>", "#include <common>\nuniform float uBase; uniform float uWaveR; uniform float uWaveOn; uniform vec3 uCenter; uniform float uDull; uniform float uGlowW; varying vec3 vCtW;")
      .replace(
        "#include <emissivemap_fragment>",
        `#include <emissivemap_fragment>
        { float d0 = distance(vCtW, uCenter); float a0 = clamp(uBase + uWaveOn * clamp((uWaveR - d0) / 12.0, 0.0, 1.0), 0.0, 1.0);
          totalEmissiveRadiance *= (0.15 + 0.85 * a0) * (1.0 + uGlowW * a0 * 2.0); }`,
      )
      .replace(
        "#include <tonemapping_fragment>",
        `float cD = distance(vCtW, uCenter);
        float amt = clamp(uBase + uWaveOn * clamp((uWaveR - cD) / 12.0, 0.0, 1.0), 0.0, 1.0);
        float lum = dot(gl_FragColor.rgb, vec3(0.299, 0.587, 0.114));
        gl_FragColor.rgb = mix(vec3(lum) * vec3(0.9, 0.93, 1.02), gl_FragColor.rgb, 1.0 - uDull * (1.0 - amt));
        gl_FragColor.rgb = mix(vec3(dot(gl_FragColor.rgb, vec3(0.299, 0.587, 0.114))), gl_FragColor.rgb, 1.0 + 0.3 * uWaveOn * amt);
        float front = uWaveOn * exp(-pow((cD - uWaveR) / 5.0, 2.0));
        gl_FragColor.rgb += front * vec3(0.7, 0.85, 1.0) * 0.8;
        #include <tonemapping_fragment>`,
      );
  };
  m.customProgramCacheKey = () => `city-v1-${dull}-${glow}`;
  return m;
};
const useCityMat = (p: THREE.MeshStandardMaterialParameters, dull = 0.75, glow = 0) =>
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useMemo(() => cityMat(new THREE.MeshStandardMaterial(p), dull, glow), []);

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

const marbleTex = () =>
  canvasTex(512, 512, (x) => {
    const r = rng(5);
    x.fillStyle = "#f4f1ff";
    x.fillRect(0, 0, 512, 512);
    for (let i = 0; i < 8; i++)
      for (let j = 0; j < 8; j++) {
        x.fillStyle = (i + j) % 2 ? "#ead8ff" : "#ffe6f2";
        x.fillRect(i * 64 + 2, j * 64 + 2, 60, 60);
      }
    x.strokeStyle = "rgba(160,150,220,0.25)";
    x.lineWidth = 2;
    for (let k = 0; k < 18; k++) {
      x.beginPath();
      let px = r() * 512;
      let py = r() * 512;
      x.moveTo(px, py);
      for (let s = 0; s < 6; s++) {
        px += (r() - 0.5) * 80;
        py += (r() - 0.5) * 80;
        x.lineTo(px, py);
      }
      x.stroke();
    }
  }, [3, 3]);

// ---------- clouds ----------
const PUFF_GEO = new THREE.SphereGeometry(1, 24, 16);

// Fluffy cloud made of a cluster of soft spheres. (x, y, z) is the center of its flat-ish base.
export const Cloud: React.FC<{ position: V3; size: number; seed?: number; t: number; tint?: string; flat?: number; glow?: number }> = ({ position, size, seed = 1, t, tint = "#ffffff", flat = 0.55, glow = 0.18 }) => {
  const puffs = useMemo(() => {
    const r = rng(seed);
    return Array.from({ length: 9 }, (_, i) => {
      const a = (i / 9) * Math.PI * 2 + r();
      const d = i === 0 ? 0 : 0.45 + r() * 0.45;
      return { x: Math.cos(a) * d, z: Math.sin(a) * d * 0.7, y: (i === 0 ? 0.35 : r() * 0.3) * flat, s: i === 0 ? 0.75 : 0.42 + r() * 0.3 };
    });
  }, [seed, flat]);
  const mat = useMemo(() => new THREE.MeshStandardMaterial({ color: tint, roughness: 1, emissive: new THREE.Color("#cfe0ff"), emissiveIntensity: glow }), [tint, glow]);
  const bob = Math.sin(t * 0.8 + seed) * 0.05 * size;
  return (
    <group position={[position[0], position[1] + bob, position[2]]} scale={size}>
      {puffs.map((p, i) => (
        <mesh key={i} geometry={PUFF_GEO} material={mat} position={[p.x, p.y, p.z]} scale={[p.s, p.s * flat * 1.4, p.s]} castShadow receiveShadow />
      ))}
    </group>
  );
};

// A sea of clouds far below, instanced
const CloudSea: React.FC<{ t: number; y: number; count?: number; seed?: number; inner?: number; outer?: number }> = ({ t, y, count = 260, seed = 3, inner = 10, outer = 220 }) => {
  const puffs = useMemo(() => {
    const r = rng(seed);
    return Array.from({ length: count }, () => {
      const a = r() * Math.PI * 2;
      const d = inner + Math.sqrt(r()) * (outer - inner);
      return { x: Math.cos(a) * d, z: -30 + Math.sin(a) * d, y: y + (r() - 0.5) * 4, s: 5 + r() * 9 + d * 0.04, ph: r() * 6 };
    });
  }, [count, seed, y, inner, outer]);
  const mesh = useMemo(() => {
    const m = new THREE.InstancedMesh(PUFF_GEO, new THREE.MeshStandardMaterial({ color: "#ffffff", roughness: 1, emissive: new THREE.Color("#bcd4ff"), emissiveIntensity: 0.3 }), count);
    m.frustumCulled = false;
    return m;
  }, [count]);
  const o = new THREE.Object3D();
  puffs.forEach((p, i) => {
    o.position.set(p.x + Math.sin(t * 0.04 + p.ph) * 2, p.y + Math.sin(t * 0.3 + p.ph) * 0.3, p.z);
    o.scale.set(p.s, p.s * 0.42, p.s);
    o.updateMatrix();
    mesh.setMatrixAt(i, o.matrix);
  });
  mesh.instanceMatrix.needsUpdate = true;
  return <primitive object={mesh} />;
};

// ---------- the cloud staircase ----------
export const CloudStairs: React.FC<{ t: number; reveal?: number; offset?: V3; glow?: number }> = ({ t, reveal = 1, offset = [0, 0, 0], glow = 1 }) => (
  <group position={offset}>
    {Array.from({ length: STEPS }, (_, i) => {
      const k = Math.max(0, Math.min(1, reveal * STEPS - i));
      if (k <= 0) return null;
      const p = STEP(i);
      return (
        <group key={i}>
          <Cloud position={[p[0], p[1] - 0.26, p[2]]} size={0.62 * (0.4 + 0.6 * k)} seed={40 + i} t={0} flat={0.32} glow={0.3 + 0.25 * glow} />
          <Halo position={[p[0], p[1] - 0.2, p[2]]} size={2.6} color="#d8ecff" opacity={0.18 * k * glow} />
        </group>
      );
    })}
  </group>
);

// ---------- floating islands with buildings ----------
const Island: React.FC<{ at: V3; r: number; seed: number; t: number; towers?: number; falls?: boolean; top?: "marble" | "grass" }> = ({ at, r, seed, t, towers = 3, falls = true, top = "marble" }) => {
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const map = useMemo(() => marbleTex(), []);
  const topMat = useCityMat(top === "marble" ? { map, color: "#ffffff", roughness: 0.6 } : { color: "#8fe0a0", roughness: 0.85 }, 0.6);
  const rockMat = useCityMat({ color: "#b8a6e8", roughness: 0.9, flatShading: true }, 0.7);
  const wall = useCityMat({ color: "#fff6ea", roughness: 0.55 }, 0.5);
  const roofs = ["#ff8fb0", "#7fc8ff", "#ffcf5a", "#a88aff", "#6fe0c0"];
  const roofMats = useMemo(() => roofs.map((c) => cityMat(new THREE.MeshStandardMaterial({ color: c, roughness: 0.4, metalness: 0.2 }), 0.85)), []); // eslint-disable-line react-hooks/exhaustive-deps
  const winMat = useMemo(() => cityMat(new THREE.MeshStandardMaterial({ color: "#fff0b0", emissive: "#ffd870", emissiveIntensity: 1.2 }), 0.6, 1), []);
  const { under, bld } = useMemo(() => {
    const rr = rng(seed);
    const under = new THREE.ConeGeometry(r * 0.98, r * 1.5, 12, 5, true);
    under.rotateX(Math.PI);
    under.translate(0, -r * 0.75 - 0.4, 0);
    const p = under.attributes.position as THREE.BufferAttribute;
    for (let i = 0; i < p.count; i++) {
      const vy = p.getY(i);
      const k = 0.2 * r * (rr() - 0.5) * Math.min(1, -vy / r);
      p.setXYZ(i, p.getX(i) + k, vy, p.getZ(i) + k);
    }
    under.computeVertexNormals();
    const bld = Array.from({ length: towers }, (_, i) => {
      const a = (i / Math.max(1, towers)) * Math.PI * 2 + rr() * 0.6;
      const d = towers === 1 ? 0 : r * (0.35 + rr() * 0.3);
      return { x: Math.cos(a) * d, z: Math.sin(a) * d, h: 1.6 + rr() * r * 0.9, w: 0.5 + rr() * 0.5, roof: Math.floor(rr() * 5), dome: rr() > 0.5 };
    });
    return { under, bld };
  }, [r, seed, towers]);
  const dy = Math.sin(t * 0.5 + seed) * 0.12;
  return (
    <group position={[at[0], at[1] + dy, at[2]]}>
      <mesh material={topMat} position={[0, -0.3, 0]} receiveShadow castShadow>
        <cylinderGeometry args={[r, r * 0.96, 0.6, 40]} />
      </mesh>
      <mesh geometry={under} material={rockMat} castShadow />
      {bld.map((b, i) => (
        <group key={i} position={[b.x, 0, b.z]}>
          <mesh material={wall} position={[0, b.h / 2, 0]} castShadow receiveShadow>
            <cylinderGeometry args={[b.w, b.w * 1.08, b.h, 18]} />
          </mesh>
          {b.dome ? (
            <mesh material={roofMats[b.roof]} position={[0, b.h, 0]} castShadow>
              <sphereGeometry args={[b.w * 1.1, 20, 12, 0, Math.PI * 2, 0, Math.PI / 2]} />
            </mesh>
          ) : (
            <mesh material={roofMats[b.roof]} position={[0, b.h + b.w * 0.8, 0]} castShadow>
              <coneGeometry args={[b.w * 1.25, b.w * 1.6, 18]} />
            </mesh>
          )}
          {[0, 1, 2].map((k) => (
            <mesh key={k} material={winMat} position={[Math.sin(k * 2.1) * b.w * 1.01, b.h * (0.35 + k * 0.2), Math.cos(k * 2.1) * b.w * 1.01]} rotation={[0, k * 2.1, 0]}>
              <planeGeometry args={[b.w * 0.35, b.w * 0.55]} />
            </mesh>
          ))}
        </group>
      ))}
      {falls && <Waterfall at={[r * 0.7, -0.3, r * 0.68]} h={r * 2.2} w={r * 0.25} t={t} />}
    </group>
  );
};

// A waterfall pouring off an island edge: scrolling streaks plus a mist halo at the bottom
const FALL_VERT = /* glsl */ `varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`;
const FALL_FRAG = /* glsl */ `uniform float uT; varying vec2 vUv;
float h(float x){ return fract(sin(x * 91.7) * 43758.5); }
void main(){ float col = floor(vUv.x * 24.0); float s = fract(vUv.y * 3.0 + uT * (1.2 + h(col) * 0.8) + h(col));
  float streak = smoothstep(0.0, 0.3, s) * (1.0 - smoothstep(0.6, 1.0, s));
  float edge = smoothstep(0.0, 0.15, vUv.x) * smoothstep(1.0, 0.85, vUv.x);
  float fade = smoothstep(0.0, 0.35, vUv.y);
  vec3 c = mix(vec3(0.65, 0.85, 1.0), vec3(1.0), streak);
  gl_FragColor = vec4(c, (0.45 + 0.4 * streak) * edge * fade); }`;
const Waterfall: React.FC<{ at: V3; h: number; w: number; t: number }> = ({ at, h, w, t }) => {
  const uniforms = useMemo(() => ({ uT: { value: 0 } }), []);
  uniforms.uT.value = t;
  return (
    <group position={at}>
      <mesh position={[0, -h / 2, 0]}>
        <cylinderGeometry args={[w, w * 1.6, h, 16, 1, true, -0.6, 1.2]} />
        <shaderMaterial vertexShader={FALL_VERT} fragmentShader={FALL_FRAG} uniforms={uniforms} transparent depthWrite={false} side={THREE.DoubleSide} />
      </mesh>
      <Halo position={[0, -h, 0]} size={w * 9} color="#ffffff" opacity={0.6} />
    </group>
  );
};

// ---------- a bridge of light between two islands ----------
const Bridge: React.FC<{ a: V3; b: V3 }> = ({ a, b }) => {
  const mat = useCityMat({ color: "#f6f0ff", roughness: 0.5 }, 0.5);
  const mid: V3 = [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2 - 0.4, (a[2] + b[2]) / 2];
  const len = Math.hypot(b[0] - a[0], b[2] - a[2]);
  const yaw = Math.atan2(b[0] - a[0], b[2] - a[2]);
  return (
    <mesh material={mat} position={mid} rotation={[0, yaw, 0]} castShadow receiveShadow>
      <boxGeometry args={[1.4, 0.25, len]} />
    </mesh>
  );
};

// ---------- the city plaza at the top of the stairs ----------
const Plaza: React.FC<{ t: number }> = ({ t }) => {
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const map = useMemo(() => marbleTex(), []);
  const mat = useCityMat({ map, color: "#ffffff", roughness: 0.55 }, 0.5);
  const col = useCityMat({ color: "#fffaf0", roughness: 0.5 }, 0.5);
  const gold = useCityMat({ color: "#ffd36a", metalness: 0.7, roughness: 0.3 }, 0.8);
  return (
    <group>
      <mesh material={mat} position={[PLAZA[0], PLAZA[1] - 0.3, PLAZA[2] - 3]} receiveShadow castShadow>
        <cylinderGeometry args={[9, 8.6, 0.6, 48]} />
      </mesh>
      <mesh position={[PLAZA[0], PLAZA[1] - 5, PLAZA[2] - 3]} rotation={[Math.PI, 0, 0]}>
        <coneGeometry args={[8.6, 9, 12]} />
        <meshStandardMaterial color="#c8b8f0" roughness={0.9} flatShading />
      </mesh>
      {/* an arch gate with columns */}
      {[-1, 1].map((sd) => (
        <group key={sd}>
          <mesh material={col} position={[PLAZA[0] + sd * 2.6, PLAZA[1] + 2.1, PLAZA[2] - 7]} castShadow>
            <cylinderGeometry args={[0.32, 0.38, 4.2, 18]} />
          </mesh>
          <mesh material={gold} position={[PLAZA[0] + sd * 2.6, PLAZA[1] + 4.35, PLAZA[2] - 7]}>
            <sphereGeometry args={[0.42, 16, 12]} />
          </mesh>
        </group>
      ))}
      <mesh material={col} position={[PLAZA[0], PLAZA[1] + 4.6, PLAZA[2] - 7]} rotation={[0, 0, 0]} castShadow>
        <torusGeometry args={[2.6, 0.3, 12, 40, Math.PI]} />
      </mesh>
      <Cloud position={[PLAZA[0] - 3.6, PLAZA[1] + 0.2, PLAZA[2] - 0.6]} size={1.7} seed={7} t={t} />
      <Cloud position={[CLOUD_BED[0], CLOUD_BED[1] + 0.15, CLOUD_BED[2] - 0.2]} size={2.6} seed={9} t={t} flat={0.65} />
    </group>
  );
};

// ---------- the gravity garden: a floor, an upside-down island above it, floating stones ----------
const GravityGarden: React.FC<{ t: number; swirl: number; ceiling?: boolean }> = ({ t, swirl, ceiling = true }) => {
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const map = useMemo(() => marbleTex(), []);
  const floor = useCityMat({ map, color: "#ffffff", roughness: 0.6 }, 0.55);
  const ceil = useCityMat({ color: "#a8e0ff", roughness: 0.7, emissive: "#7fc0ff", emissiveIntensity: 0.45 }, 0.55);
  const grass = useCityMat({ color: "#b8f0c0", roughness: 0.85, emissive: "#9fe0b0", emissiveIntensity: 0.55 }, 0.6);
  const rock = useCityMat({ color: "#c0aef0", roughness: 0.9, flatShading: true }, 0.7);
  const stones = useMemo(() => {
    const r = rng(81);
    return Array.from({ length: 14 }, () => { const sd = r() > 0.5 ? 1 : -1; return { x: sd * (3.2 + r() * 3), y: 0.5 + r() * 2.4, z: -1 - r() * 5, s: 0.08 + r() * 0.16, ph: r() * 6 }; });
  }, []);
  return (
    <group>
      <mesh material={floor} position={[GRAV[0], GRAV[1] - 0.3, GRAV[2]]} receiveShadow castShadow>
        <cylinderGeometry args={[7, 6.6, 0.6, 40]} />
      </mesh>
      <mesh material={rock} position={[GRAV[0], GRAV[1] - 4.5, GRAV[2]]} rotation={[Math.PI, 0, 0]}>
        <coneGeometry args={[6.6, 8, 12]} />
      </mesh>
      {/* the upside-down island: its grassy "floor" faces down */}
      <group position={[GRAV[0], CEIL_Y, GRAV[2] - 0.5]} visible={ceiling}>
        <mesh material={grass} position={[0, 0.3, 0]} receiveShadow>
          <cylinderGeometry args={[6.5, 6.5, 0.6, 40]} />
        </mesh>
        <mesh material={rock} position={[0, 4.4, 0]}>
          <coneGeometry args={[6.4, 8, 12]} />
        </mesh>
        {[-3, 0.5, 3.4].map((x, i) => (
          <group key={i} position={[x, 0, -1.5 + i]}>
            <mesh material={ceil} position={[0, -0.7, 0]}>
              <coneGeometry args={[0.5, 1.4, 14]} />
            </mesh>
          </group>
        ))}
      </group>
      {stones.map((s, i) => (
        <mesh key={i} material={rock} position={[GRAV[0] + s.x + Math.sin(t * 0.9 + s.ph) * 0.2 * swirl, GRAV[1] + s.y + Math.sin(t * 1.3 + s.ph) * 0.3, GRAV[2] + s.z]} rotation={[t * 0.4 + s.ph, t * 0.3, 0]} scale={s.s} castShadow>
          <dodecahedronGeometry args={[1, 0]} />
        </mesh>
      ))}
      {/* swirling arrows of light showing the strange gravity */}
      {Array.from({ length: 6 }, (_, i) => {
        const a = t * 1.2 + (i / 6) * Math.PI * 2;
        return (
          <mesh key={i} position={[GRAV[0] + Math.cos(a) * 4.5, GRAV[1] + 1.6 + Math.sin(a * 2) * 0.8, GRAV[2] + Math.sin(a) * 2.5]} rotation={[0, 0, a]}>
            <coneGeometry args={[0.12, 0.4, 8]} />
            <meshBasicMaterial color={new THREE.Color("#bfe6ff").multiplyScalar(1.6 * swirl)} toneMapped={false} transparent opacity={0.8 * swirl} />
          </mesh>
        );
      })}
    </group>
  );
};

// ---------- the wind tower and its crystal chamber ----------
export const platformAt = (i: number, t: number): V3 => {
  // three cloud platforms climbing toward the tower, drifting up and down
  const base: V3[] = [
    [TOWER[0] + 5.5, TOWER[1] + 1.0, TOWER[2] + 7.5],
    [TOWER[0] + 3.0, TOWER[1] + 2.4, TOWER[2] + 6.5],
    [TOWER[0] + 0.6, TOWER[1] + 3.6, TOWER[2] + 6.8],
  ];
  const b = base[i];
  return [b[0], b[1] + Math.sin(t * 1.4 + i * 2) * 0.25, b[2]];
};

const WindTower: React.FC<{ t: number; vortex: number; amt: number }> = ({ t, vortex, amt }) => {
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const map = useMemo(() => marbleTex(), []);
  const stone = useCityMat({ map, color: "#f4ecff", roughness: 0.5 }, 0.55);
  const trim = useCityMat({ color: "#7fc8ff", roughness: 0.4, metalness: 0.3 }, 0.85);
  const gold = useCityMat({ color: "#ffd36a", metalness: 0.7, roughness: 0.3, emissive: "#ffb040", emissiveIntensity: 0.3 }, 0.8, 1);
  const H = TOWER_H;
  return (
    <group position={TOWER}>
      <mesh material={stone} position={[0, -0.3, 0]} receiveShadow castShadow>
        <cylinderGeometry args={[7, 6.6, 0.6, 40]} />
      </mesh>
      <mesh position={[0, -5, 0]} rotation={[Math.PI, 0, 0]}>
        <coneGeometry args={[6.6, 9, 12]} />
        <meshStandardMaterial color="#c0aef0" roughness={0.9} flatShading />
      </mesh>
      <mesh material={stone} position={[0, H / 2, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[1.6, 2.4, H, 28]} />
      </mesh>
      {/* a spiral ribbon around the tower */}
      {Array.from({ length: 40 }, (_, i) => {
        const a = i * 0.45;
        const y = 0.6 + i * (H - 1.5) / 40;
        const rad = 2.4 - (y / H) * 0.8 + 0.15;
        return (
          <mesh key={i} material={trim} position={[Math.cos(a) * rad, y, Math.sin(a) * rad]} rotation={[0, -a, 0.25]}>
            <boxGeometry args={[0.18, 0.18, 0.9]} />
          </mesh>
        );
      })}
      {/* the chamber on top: floor, columns, dome */}
      <mesh material={stone} position={[0, H + 0.15, 0]} receiveShadow castShadow>
        <cylinderGeometry args={[4.4, 3.2, 0.5, 40]} />
      </mesh>
      {Array.from({ length: 8 }, (_, i) => {
        const a = (i / 8) * Math.PI * 2 + Math.PI / 8;
        if (Math.sin(a) > 0.6) return null; // leave the front open toward the camera
        return (
          <mesh key={i} material={stone} position={[Math.cos(a) * 3.9, H + 2.2, Math.sin(a) * 3.9]} castShadow>
            <cylinderGeometry args={[0.22, 0.26, 3.8, 14]} />
          </mesh>
        );
      })}
      <mesh material={trim} position={[0, H + 4.4, 0]} castShadow>
        <sphereGeometry args={[4.2, 32, 16, 0, Math.PI * 2, 0, Math.PI / 2.4]} />
      </mesh>
      <mesh material={gold} position={[0, H + 8.4, 0]}>
        <coneGeometry args={[0.35, 1.2, 12]} />
      </mesh>
      {/* the wind vortex trapping the crystal */}
      {vortex > 0.01 &&
        Array.from({ length: 5 }, (_, i) => (
          <mesh key={i} position={[0, H + 0.8 + i * 0.45, 0]} rotation={[Math.PI / 2 + Math.sin(t * 2 + i) * 0.15, 0, t * (5 + i)]}>
            <torusGeometry args={[1.0 + i * 0.12, 0.05, 6, 48, Math.PI * 1.4]} />
            <meshBasicMaterial color={new THREE.Color("#dff2ff").multiplyScalar(1.4)} transparent opacity={0.65 * vortex} toneMapped={false} depthWrite={false} />
          </mesh>
        ))}
      <Halo position={[0, H + 8.6, 0]} size={4 + 6 * amt} color="#ffe6a0" opacity={0.2 + 0.6 * amt} />
    </group>
  );
};

// ---------- the Sky Crystal ----------
export const SkyCrystal: React.FC<{ position: V3; t: number; glow: number; scale?: number }> = ({ position, t, glow, scale = 1 }) => (
  <group position={position} scale={scale} rotation={[0, t * 0.8, 0]}>
    <Halo position={[0, 0, 0]} size={2.5 + glow * 5} color="#bfe8ff" opacity={0.25 + glow * 0.55} />
    <mesh scale={[0.5, 0.95, 0.5]}>
      <octahedronGeometry args={[1, 0]} />
      <meshStandardMaterial color="#9fe0ff" emissive="#6fb8ff" emissiveIntensity={0.3 + glow * 1.8} metalness={0.3} roughness={0.1} flatShading toneMapped={false} />
    </mesh>
    {[0, 1, 2, 3].map((i) => (
      <mesh key={i} position={[Math.cos(i * 1.57) * 0.42, -0.25, Math.sin(i * 1.57) * 0.42]} rotation={[0, i * 1.57, (i % 2 ? 0.4 : -0.4)]} scale={[0.18, 0.45, 0.18]}>
        <octahedronGeometry args={[1, 0]} />
        <meshStandardMaterial color={["#ffb0e0", "#c8a8ff", "#a8ffe0", "#ffe0a0"][i]} emissive={["#ff7fc8", "#a07fff", "#5fe0b0", "#ffc860"][i]} emissiveIntensity={0.2 + glow * 1.4} flatShading toneMapped={false} />
      </mesh>
    ))}
  </group>
);

// ---------- the underwater cave hologram from the seashell ----------
const HOLO_VERT = /* glsl */ `varying vec2 vUv; varying vec3 vN; varying vec3 vV; void main(){ vUv = uv; vec4 mv = modelViewMatrix * vec4(position, 1.0); vN = normalMatrix * normal; vV = -mv.xyz; gl_Position = projectionMatrix * mv; }`;
const HOLO_FRAG = /* glsl */ `uniform float uT; uniform float uOn; varying vec2 vUv; varying vec3 vN; varying vec3 vV;
void main(){ float f = pow(1.0 - abs(dot(normalize(vN), normalize(vV))), 1.5); float lines = 0.75 + 0.25 * sin(vUv.y * 120.0 - uT * 6.0);
  vec3 c = vec3(0.25, 0.85, 1.0) * (0.45 + f * 1.3) * lines; gl_FragColor = vec4(c, (0.08 + f * 0.55) * uOn); }`;

export const CaveHologram: React.FC<{ position: V3; t: number; on: number; scale?: number }> = ({ position, t, on, scale = 1 }) => {
  const uniforms = useMemo(() => ({ uT: { value: 0 }, uOn: { value: 0 } }), []);
  uniforms.uT.value = t;
  uniforms.uOn.value = on;
  if (on <= 0.001) return null;
  const s = scale * (0.3 + 0.7 * on);
  const m = (c: string, k = 1, op = 0.9) => <meshBasicMaterial color={new THREE.Color(c).multiplyScalar(k)} transparent opacity={op * on} toneMapped={false} depthWrite={false} />;
  return (
    <group position={position} scale={s}>
      <Halo position={[0, 1, 0]} size={8} color="#5fd0ff" opacity={0.35 * on} />
      <mesh>
        <sphereGeometry args={[2.2, 48, 24]} />
        <shaderMaterial vertexShader={HOLO_VERT} fragmentShader={HOLO_FRAG} uniforms={uniforms} transparent depthWrite={false} side={THREE.DoubleSide} />
      </mesh>
      {/* the cave: a rocky arch over a glowing pool */}
      <mesh position={[0, -0.2, 0]} rotation={[0, 0, 0]}>
        <torusGeometry args={[1.3, 0.38, 10, 30, Math.PI]} />
        {m("#4f7fd0", 1.5)}
      </mesh>
      <mesh position={[0, -0.6, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[1.5, 32]} />
        {m("#1fa8d8", 1.3, 0.7)}
      </mesh>
      {/* glowing crystals inside the cave */}
      {[-0.7, -0.25, 0.3, 0.75].map((x, i) => (
        <mesh key={i} position={[x, -0.35 + (i % 2) * 0.12, -0.2]} rotation={[0, 0, (i - 1.5) * 0.25]} scale={[0.12, 0.35 + (i % 2) * 0.15, 0.12]}>
          <octahedronGeometry args={[1, 0]} />
          {m(["#7fffe0", "#ff8fd0", "#9fd8ff", "#ffe08a"][i], 2.2)}
        </mesh>
      ))}
      {/* little fish swimming around */}
      {Array.from({ length: 5 }, (_, i) => {
        const a = t * (0.9 + i * 0.15) + i * 1.3;
        return (
          <group key={i} position={[Math.cos(a) * (1.1 + i * 0.12), 0.5 + (i % 3) * 0.3, Math.sin(a) * 0.7]} rotation={[0, -a, 0]}>
            <mesh scale={[0.16, 0.08, 0.06]}>
              <sphereGeometry args={[1, 10, 8]} />
              {m(["#ffb060", "#ff7fb0", "#7fe0ff", "#ffe060", "#a0ff9a"][i], 2)}
            </mesh>
          </group>
        );
      })}
      {Array.from({ length: 12 }, (_, i) => (
        <mesh key={`b${i}`} position={[Math.sin(i * 2.3) * 1.4, -0.4 + ((i * 0.27 + t * 0.35) % 2.4), Math.cos(i * 1.7) * 0.8]}>
          <sphereGeometry args={[0.04 + (i % 3) * 0.015, 8, 6]} />
          {m("#e8fbff", 2, 0.8)}
        </mesh>
      ))}
    </group>
  );
};

// ---------- the sky ----------
const SKY_VERT = /* glsl */ `varying vec3 vDir; void main(){ vDir = normalize(position); gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`;
const SKY_FRAG = /* glsl */ `uniform float uAmt; varying vec3 vDir;
void main(){ float h = vDir.y;
  vec3 low = mix(vec3(0.82, 0.84, 0.92), vec3(1.0, 0.82, 0.9), uAmt);
  vec3 mid = mix(vec3(0.55, 0.66, 0.84), vec3(0.45, 0.72, 1.0), uAmt);
  vec3 top = mix(vec3(0.3, 0.42, 0.68), vec3(0.14, 0.38, 0.92), uAmt);
  vec3 c = mix(low, mid, smoothstep(-0.2, 0.2, h)); c = mix(c, top, smoothstep(0.2, 0.85, h));
  vec3 sun = normalize(vec3(0.5, 0.45, -0.75)); float s = max(dot(vDir, sun), 0.0);
  c += vec3(1.0, 0.9, 0.7) * (pow(s, 400.0) * 2.5 + pow(s, 20.0) * 0.35);
  gl_FragColor = vec4(c, 1.0); }`;
const DaySky: React.FC<{ amt: number }> = ({ amt }) => {
  const uniforms = useMemo(() => ({ uAmt: { value: 0 } }), []);
  uniforms.uAmt.value = amt;
  return (
    <mesh renderOrder={-10}>
      <sphereGeometry args={[480, 48, 32]} />
      <shaderMaterial vertexShader={SKY_VERT} fragmentShader={SKY_FRAG} uniforms={uniforms} side={THREE.BackSide} depthWrite={false} fog={false} />
    </mesh>
  );
};

// a scattering of islands making up the city
const ISLANDS: { at: V3; r: number; towers: number; falls?: boolean; top?: "marble" | "grass" }[] = [
  { at: [-14, 12, -24], r: 5, towers: 4 },
  { at: [12, 14, -48], r: 6, towers: 5 },
  { at: [-26, 16, -60], r: 7, towers: 5 },
  { at: [28, 11, -14], r: 4, towers: 2, top: "grass" },
  { at: [-30, 8, -20], r: 4.5, towers: 3, top: "grass" },
  { at: [2, 20, -70], r: 8, towers: 6 },
  { at: [34, 18, -70], r: 6, towers: 4 },
  { at: [-12, 5, 2], r: 3.5, towers: 1, top: "grass" },
  { at: [14, 4, 0], r: 3, towers: 1, top: "grass" },
  { at: [-40, 22, -90], r: 9, towers: 6 },
];

const Lights: React.FC<{ amt: number }> = ({ amt }) => (
  <>
    <hemisphereLight args={["#e8f2ff", "#b8a8e0", 0.9 + amt * 0.2]} />
    <directionalLight
      position={[40, 60, 30]}
      intensity={1.9 + amt * 0.5}
      color="#fff4e6"
      castShadow
      shadow-mapSize={[2048, 2048]}
      shadow-camera-left={-60}
      shadow-camera-right={60}
      shadow-camera-top={60}
      shadow-camera-bottom={-60}
      shadow-camera-near={1}
      shadow-camera-far={200}
      shadow-bias={-0.0006}
    />
    <directionalLight position={[-30, 20, -40]} intensity={0.5} color="#d8c8ff" />
  </>
);

// The whole Floating Sky City
export const SkyCity: React.FC<{ t: number; s: CityState; stairs?: number; swirl?: number; vortex?: number; ceiling?: boolean }> = ({ t, s, stairs = 1, swirl = 1, vortex = 1, ceiling = true }) => {
  setCity(t, s);
  const amt = cityAt(s, PLAZA);
  return (
    <>
      <fogExp2 attach="fog" args={[new THREE.Color("#cfdcf6").lerp(new THREE.Color("#e8dcff"), amt).getStyle(), 0.0024]} />
      <DaySky amt={amt} />
      <Halo position={[0.5 * 400, 0.45 * 400, -0.75 * 400]} size={160} color="#fff4d8" opacity={0.6} />
      <Lights amt={amt} />
      <CloudSea t={t} y={-14} />
      <CloudStairs t={t} reveal={stairs} />
      <Plaza t={t} />
      <GravityGarden t={t} swirl={swirl} ceiling={ceiling} />
      <WindTower t={t} vortex={vortex} amt={cityAt(s, CRYSTAL_AT)} />
      {[0, 1, 2].map((i) => (
        <Cloud key={i} position={[platformAt(i, t)[0], platformAt(i, t)[1] - 0.35, platformAt(i, t)[2]]} size={1.0} seed={60 + i} t={0} flat={0.35} glow={0.35} />
      ))}
      {ISLANDS.map((isl, i) => (
        <Island key={i} at={isl.at} r={isl.r} seed={i + 3} t={t} towers={isl.towers} falls={isl.falls ?? true} top={isl.top} />
      ))}
      <CityLanterns t={t} s={s} />
      <Bridge a={[PLAZA[0] + 7, PLAZA[1], PLAZA[2] - 6]} b={[GRAV[0] - 6, GRAV[1], GRAV[2] + 2]} />
      <Bridge a={[PLAZA[0] - 5, PLAZA[1], PLAZA[2] - 9]} b={[TOWER[0] + 4, TOWER[1], TOWER[2] + 6]} />
      {Array.from({ length: 10 }, (_, i) => i === 4 || i === 5 ? null : (
        <Cloud key={`c${i}`} position={[-40 + i * 9, 2 + (i % 3) * 7, -20 - (i % 4) * 18]} size={3 + (i % 3)} seed={100 + i} t={t} glow={0.25} />
      ))}
    </>
  );
};

// The city seen from far away (from the desert): a cluster of islands lit and colorful
export const DistantCity: React.FC<{ t: number; position: V3; scale?: number }> = ({ t, position, scale = 1 }) => {
  setCity(t, { base: 0.75, waveR: 0, waveOn: 0 });
  return (
    <group position={position} scale={scale}>
      <Island at={[0, 0, 0]} r={8} seed={11} t={t} towers={6} />
      <Island at={[-12, -4, 4]} r={5} seed={12} t={t} towers={3} />
      <Island at={[11, -2, -3]} r={6} seed={13} t={t} towers={4} />
      <Island at={[3, 7, -10]} r={4} seed={14} t={t} towers={2} />
      <Cloud position={[0, -6, 2]} size={9} seed={15} t={t} glow={0.3} />
      <Cloud position={[-12, -9, 6]} size={6} seed={16} t={t} glow={0.3} />
      <Halo position={[0, 4, 0]} size={30} color="#ffffff" opacity={0.25} />
    </group>
  );
};

// Floating lanterns all over the city: dim and grey while the crystal is weak, glowing in many colors once it shines
const LANTERN_COLORS = ["#ff7fb8", "#ffd060", "#7fe0ff", "#b88aff", "#7fffc0", "#ff9f60"];
const CityLanterns: React.FC<{ t: number; s: CityState }> = ({ t, s }) => {
  const items = useMemo(() => {
    const r = rng(77);
    return Array.from({ length: 140 }, () => {
      const a = r() * Math.PI * 2;
      const d = 6 + r() * 60;
      return { p: [Math.cos(a) * d - 6, 4 + r() * 26, -30 + Math.sin(a) * d * 0.9] as V3, c: LANTERN_COLORS[Math.floor(r() * 6)], s: 0.12 + r() * 0.2, ph: r() * 6 };
    });
  }, []);
  const grey = new THREE.Color("#c8ccd8");
  return (
    <>
      {items.map((it, i) => {
        const k = cityAt(s, it.p);
        const lit = s.waveOn * k;
        const col = grey.clone().lerp(new THREE.Color(it.c), 0.25 + 0.75 * lit).multiplyScalar(0.6 + 1.8 * lit);
        return (
          <mesh key={i} position={[it.p[0], it.p[1] + Math.sin(t * 0.8 + it.ph) * 0.3, it.p[2]]} scale={it.s * (1 + 0.4 * lit)}>
            <sphereGeometry args={[1, 10, 8]} />
            <meshBasicMaterial color={col} toneMapped={false} />
          </mesh>
        );
      })}
    </>
  );
};
