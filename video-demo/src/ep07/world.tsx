import React, { useMemo } from "react";
import { useThree } from "@react-three/fiber";
import * as THREE from "three";
import { rng } from "../kit3d/World";
import { Halo, SkyDome, Stars } from "../kit3d/sky";
import { Motes } from "../kit3d/magic";

// Episode 7: the Snowflake Kingdom, built procedurally in Three.js. Everything depends only on props.
//
// Like Episode 6's sea, the kingdom can lose and regain its colors. All kingdom materials share SNOW:
//   base 0..1 how colorful and bright things are; waveR/waveOn a wave of color spreading from the castle crown.

export type V3 = [number, number, number];
export type SnowState = { base: number; waveR: number; waveOn: number };

// ---------- where things are (world units; Lumi is about 1.3 tall; snow is y = 0 near the middle) ----------
export const PLAZA: V3 = [0, 0, 10];
export const CASTLE: V3 = [0, 0, -42];
export const CROWN: V3 = [CASTLE[0], 27.6, CASTLE[2]]; // where the Aurora Crystal belongs
export const TREE: V3 = [-6.5, 0, 4.5]; // Niva's tree
export const CAVE_EXT: V3 = [15, 0, -9]; // the ice cave's entrance
export const STREAM_Z = -19;
export const FALLS: V3 = [-21, 0, -38];

const SNOW = {
  uT: { value: 0 },
  uBase: { value: 1 },
  uWaveR: { value: 0 },
  uWaveOn: { value: 0 },
  uCenter: { value: new THREE.Vector3(...CROWN) },
};

const setSnow = (t: number, s: SnowState) => {
  SNOW.uT.value = t;
  SNOW.uBase.value = s.base;
  SNOW.uWaveR.value = s.waveR;
  SNOW.uWaveOn.value = s.waveOn;
};

export const colorAt = (s: SnowState, p: V3) => {
  const d = Math.hypot(p[0] - CROWN[0], p[1] - CROWN[1], p[2] - CROWN[2]);
  return Math.max(0, Math.min(1, s.base + s.waveOn * Math.max(0, Math.min(1, (s.waveR - d) / 10))));
};

// A kingdom material: glinting snow sparkles, optional sway, and the shared color fade / aurora wave
const snowMat = <T extends THREE.MeshStandardMaterial>(m: T, opts: { sparkle?: number; sway?: number } = {}) => {
  const sparkle = opts.sparkle ?? 0;
  const sway = opts.sway ?? 0;
  m.onBeforeCompile = (shader) => {
    Object.assign(shader.uniforms, SNOW, { uSparkle: { value: sparkle }, uSway: { value: sway } });
    shader.vertexShader = shader.vertexShader
      .replace("#include <common>", "#include <common>\nuniform float uT; uniform float uSway; varying vec3 vSnW;")
      .replace(
        "#include <begin_vertex>",
        `#include <begin_vertex>
        if (uSway > 0.0) {
          vec3 ip = vec3(0.0);
          #ifdef USE_INSTANCING
          ip = instanceMatrix[3].xyz;
          #endif
          float sh = max(position.y, 0.0);
          transformed.x += sin(uT * 0.9 + ip.x * 0.5 + ip.z * 0.3) * sh * sh * uSway;
        }`,
      )
      .replace(
        "#include <project_vertex>",
        `#include <project_vertex>
        vec4 snW = vec4(transformed, 1.0);
        #ifdef USE_INSTANCING
        snW = instanceMatrix * snW;
        #endif
        vSnW = (modelMatrix * snW).xyz;`,
      );
    shader.fragmentShader = shader.fragmentShader
      .replace(
        "#include <common>",
        `#include <common>
        uniform float uT; uniform float uBase; uniform float uWaveR; uniform float uWaveOn; uniform vec3 uCenter; uniform float uSparkle;
        varying vec3 vSnW;
        float snHash(vec3 p) { p = fract(p * 0.3183099 + 0.1); p *= 17.0; return fract(p.x * p.y * p.z * (p.x + p.y + p.z)); }`,
      )
      .replace(
        "#include <emissivemap_fragment>",
        `#include <emissivemap_fragment>
        if (uSparkle > 0.0) {
          vec3 cell = floor(vSnW * 26.0);
          float h = snHash(cell);
          float tw = step(0.975, h) * pow(0.5 + 0.5 * sin(uT * 2.6 + h * 80.0 + dot(cameraPosition, vec3(0.9, 0.4, 0.7))), 6.0);
          totalEmissiveRadiance += vec3(0.85, 0.95, 1.0) * tw * uSparkle * 2.5;
        }`,
      )
      .replace(
        "#include <tonemapping_fragment>",
        `float snD = distance(vSnW, uCenter);
        float amt = clamp(uBase + uWaveOn * clamp((uWaveR - snD) / 10.0, 0.0, 1.0), 0.0, 1.0);
        float lum = dot(gl_FragColor.rgb, vec3(0.299, 0.587, 0.114));
        gl_FragColor.rgb = mix(vec3(lum) * vec3(0.58, 0.64, 0.78), gl_FragColor.rgb, amt);
        float front = uWaveOn * exp(-pow((snD - uWaveR) / 4.0, 2.0));
        vec3 aur = mix(vec3(0.3, 1.0, 0.65), vec3(0.75, 0.45, 1.0), 0.5 + 0.5 * sin(snD * 0.08 + vSnW.x * 0.05));
        gl_FragColor.rgb += front * aur * 0.9;
        #include <tonemapping_fragment>`,
      );
  };
  m.customProgramCacheKey = () => "snow-v1";
  return m;
};

const useStd = (p: THREE.MeshStandardMaterialParameters, o?: { sparkle?: number; sway?: number }) =>
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useMemo(() => snowMat(new THREE.MeshStandardMaterial(p), o), []);
const usePhys = (p: THREE.MeshPhysicalMaterialParameters, o?: { sparkle?: number }) =>
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useMemo(() => snowMat(new THREE.MeshPhysicalMaterial(p), o), []);

// ---------- reflections: a soft winter-night environment map made from a painted gradient ----------
export const IceEnv: React.FC = () => {
  const { gl, scene } = useThree();
  const env = useMemo(() => {
    const c = document.createElement("canvas");
    c.width = 512;
    c.height = 256;
    const x = c.getContext("2d")!;
    const g = x.createLinearGradient(0, 0, 0, 256);
    g.addColorStop(0, "#0a1240");
    g.addColorStop(0.3, "#2a3c8a");
    g.addColorStop(0.48, "#6f8fd8");
    g.addColorStop(0.52, "#a8bce8");
    g.addColorStop(1, "#5a6aa8");
    x.fillStyle = g;
    x.fillRect(0, 0, 512, 256);
    // aurora bands
    for (let i = 0; i < 4; i++) {
      const a = x.createLinearGradient(0, 30 + i * 12, 0, 110);
      a.addColorStop(0, "rgba(120,255,190,0)");
      a.addColorStop(0.5, i % 2 ? "rgba(160,120,255,0.55)" : "rgba(100,255,180,0.55)");
      a.addColorStop(1, "rgba(120,255,190,0)");
      x.fillStyle = a;
      x.fillRect(i * 128, 30, 140, 80);
    }
    const tex = new THREE.CanvasTexture(c);
    tex.mapping = THREE.EquirectangularReflectionMapping;
    tex.colorSpace = THREE.SRGBColorSpace;
    const pm = new THREE.PMREMGenerator(gl);
    const rt = pm.fromEquirectangular(tex);
    pm.dispose();
    return rt.texture;
  }, [gl]);
  scene.environment = env;
  return null;
};

// ---------- the ground: rolling snow, flat where the friends walk, mountains around ----------
export const floorY = (x: number, z: number) => {
  const r = Math.hypot(x * 0.9, (z + 16) * 0.8);
  const far = Math.min(1, Math.max(0, (r - 36) / 30));
  const hills = Math.sin(x * 0.11) * Math.cos(z * 0.09) * 2.4 + Math.sin(x * 0.05 + z * 0.07) * 3;
  const near = Math.sin(x * 0.4 + z * 0.3) * 0.08 * Math.min(1, Math.max(0, (r - 8) / 10));
  // the gentle bowl of the frozen stream
  const stream = -0.35 * Math.exp(-Math.pow((z - STREAM_Z) / 2.6, 2)) * (1 - far);
  return far * (hills + Math.max(0, r - 60) * 0.9) + near + stream;
};

const Ground: React.FC = () => {
  const geo = useMemo(() => {
    const g = new THREE.PlaneGeometry(400, 400, 220, 220);
    g.rotateX(-Math.PI / 2);
    g.translate(0, 0, -16);
    const p = g.attributes.position as THREE.BufferAttribute;
    for (let i = 0; i < p.count; i++) p.setY(i, floorY(p.getX(i), p.getZ(i)));
    g.computeVertexNormals();
    return g;
  }, []);
  const snow = useStd({ color: "#c9d6f4", roughness: 0.85, emissive: "#1a2660", emissiveIntensity: 0.18 }, { sparkle: 1 });
  const ice = usePhys({ color: "#9fd4ff", roughness: 0.04, metalness: 0.2, clearcoat: 1, envMapIntensity: 1.6, emissive: "#2a6ab0", emissiveIntensity: 0.25 });
  const stone = useStd({ color: "#bfe0ff", roughness: 0.3, emissive: "#6fb8ff", emissiveIntensity: 0.35 });
  const path = useMemo(() => {
    const out: { x: number; z: number; s: number; r: number }[] = [];
    const r = rng(71);
    for (let z = 13; z > -34; z -= 1.25) if (Math.abs(z - STREAM_Z) > 3.4) out.push({ x: Math.sin(z * 0.2) * 0.4 + (r() - 0.5) * 0.2, z, s: 0.48 + r() * 0.12, r: r() * 6 });
    // toward the cave
    for (let k = 0.15; k < 0.9; k += 0.07) out.push({ x: PLAZA[0] + (CAVE_EXT[0] - PLAZA[0]) * k + (r() - 0.5) * 0.3, z: PLAZA[2] + (CAVE_EXT[2] - PLAZA[2]) * k, s: 0.42 + r() * 0.1, r: r() * 6 });
    return out;
  }, []);
  return (
    <>
      <mesh geometry={geo} material={snow} receiveShadow />
      {/* the frozen stream */}
      <mesh position={[0, -0.28, STREAM_Z]} rotation={[-Math.PI / 2, 0, 0]} material={ice} receiveShadow>
        <planeGeometry args={[120, 4.2]} />
      </mesh>
      {path.map((p, i) => (
        <mesh key={i} position={[p.x, floorY(p.x, p.z) + 0.03, p.z]} rotation={[0, p.r, 0]} scale={[p.s, 0.05, p.s * 0.85]} material={stone}>
          <cylinderGeometry args={[1, 1, 1, 6]} />
        </mesh>
      ))}
    </>
  );
};

// ---------- northern lights: tall glowing curtains far away in the sky ----------
const AUR_VERT = /* glsl */ `varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`;
const AUR_FRAG = /* glsl */ `
uniform float uT; uniform float uOn; uniform float uSat; uniform float uPh; varying vec2 vUv;
float h1(float n){ return fract(sin(n) * 43758.5453); }
float n1(float x){ float i = floor(x); float f = fract(x); return mix(h1(i), h1(i + 1.0), f * f * (3.0 - 2.0 * f)); }
void main() {
  float x = vUv.x * 14.0 + uPh;
  float wave = n1(x * 1.3 + uT * 0.35) * 0.6 + n1(x * 3.7 - uT * 0.6) * 0.4;
  float rays = 0.55 + 0.45 * n1(x * 22.0 + uT * 1.2);
  float y = vUv.y;
  float base = 0.12 + wave * 0.18;
  float body = smoothstep(base - 0.02, base + 0.06, y) * (1.0 - smoothstep(base + 0.12, 0.98, y));
  vec3 green = vec3(0.25, 1.0, 0.6);
  vec3 teal = vec3(0.2, 0.85, 1.0);
  vec3 purple = vec3(0.7, 0.35, 1.0);
  vec3 pink = vec3(1.0, 0.45, 0.8);
  vec3 c = mix(green, teal, smoothstep(0.2, 0.45, y));
  c = mix(c, purple, smoothstep(0.45, 0.8, y));
  c = mix(c, pink, smoothstep(0.75, 1.0, y) * 0.6 + 0.25 * sin(x * 0.5 + uT * 0.3) * smoothstep(0.3, 0.9, y));
  float lum = dot(c, vec3(0.3, 0.59, 0.11));
  c = mix(vec3(lum) * vec3(0.6, 0.7, 0.85), c, uSat);
  float edge = smoothstep(0.0, 0.08, vUv.x) * smoothstep(1.0, 0.92, vUv.x);
  gl_FragColor = vec4(c * 1.7, min(1.0, body * rays * edge * uOn));
}`;

const AURORAS = [
  { r: 170, h: 70, y: 38, a0: -2.5, a1: -0.6, ph: 0 },
  { r: 150, h: 60, y: 30, a0: -1.6, a1: 0.1, ph: 7 },
  { r: 190, h: 80, y: 48, a0: -2.1, a1: -1.0, ph: 13 },
];

export const Aurora: React.FC<{ t: number; on: number; sat: number }> = ({ t, on, sat }) => {
  const parts = useMemo(
    () =>
      AURORAS.map((a) => {
        const g = new THREE.PlaneGeometry(1, 1, 120, 1);
        const p = g.attributes.position as THREE.BufferAttribute;
        for (let i = 0; i < p.count; i++) {
          const u = p.getX(i) + 0.5;
          const v = p.getY(i) + 0.5;
          const ang = a.a0 + (a.a1 - a.a0) * u;
          const rr = a.r + Math.sin(u * 9 + a.ph) * 12;
          p.setXYZ(i, Math.cos(ang) * rr, a.y + v * a.h, Math.sin(ang) * rr - 30);
        }
        const m = new THREE.ShaderMaterial({ vertexShader: AUR_VERT, fragmentShader: AUR_FRAG, uniforms: { uT: { value: 0 }, uOn: { value: 1 }, uSat: { value: 1 }, uPh: { value: a.ph } }, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, side: THREE.DoubleSide, fog: false });
        return { g, m };
      }),
    [],
  );
  parts.forEach(({ m }) => {
    m.uniforms.uT.value = t;
    m.uniforms.uOn.value = on;
    m.uniforms.uSat.value = sat;
  });
  return (
    <>
      {parts.map(({ g, m }, i) => (
        <mesh key={i} geometry={g} material={m} renderOrder={-5} frustumCulled={false} />
      ))}
    </>
  );
};

// ---------- falling snow ----------
const FLAKE_VERT = /* glsl */ `attribute float aSize; uniform float uScale; void main(){ vec4 mv = modelViewMatrix * vec4(position, 1.0); gl_PointSize = aSize * uScale / -mv.z; gl_Position = projectionMatrix * mv; }`;
const FLAKE_FRAG = /* glsl */ `uniform float uAlpha; uniform vec3 uColor; void main(){ vec2 p = gl_PointCoord - 0.5; float d = length(p); float a = smoothstep(0.5, 0.0, d); gl_FragColor = vec4(uColor, a * a * uAlpha); }`;

export const Snowfall: React.FC<{ t: number; center: V3; size: [number, number, number]; count?: number; seed?: number; speed?: number; glow?: number; scale?: number }> = ({ t, center, size, count = 2400, seed = 3, speed = 1, glow = 0, scale = 1 }) => {
  const base = useMemo(() => {
    const r = rng(seed);
    return Array.from({ length: count }, () => ({ x: r() - 0.5, y: r(), z: r() - 0.5, v: 0.5 + r() * 0.8, ph: r() * 6.28, s: 0.5 + r() }));
  }, [count, seed]);
  const geo = useMemo(() => {
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.BufferAttribute(new Float32Array(count * 3), 3));
    g.setAttribute("aSize", new THREE.BufferAttribute(new Float32Array(base.map((b) => b.s * 10)), 1));
    return g;
  }, [count, base]);
  const uniforms = useMemo(() => ({ uScale: { value: 40 }, uAlpha: { value: 0.9 }, uColor: { value: new THREE.Color() } }), []);
  uniforms.uScale.value = 40 * scale;
  uniforms.uColor.value.set("#ffffff").lerp(new THREE.Color("#bfe6ff"), glow * 0.5).multiplyScalar(1 + glow * 1.5);
  const pos = geo.attributes.position as THREE.BufferAttribute;
  base.forEach((b, i) => {
    const y = 1 - ((b.y + (t * 0.05 * speed * b.v * 10) / size[1]) % 1);
    pos.setXYZ(i, center[0] + b.x * size[0] + Math.sin(t * 0.8 + b.ph) * 0.6 + t * 0.15, center[1] + (y - 0.5) * size[1], center[2] + b.z * size[2] + Math.cos(t * 0.6 + b.ph) * 0.4);
  });
  pos.needsUpdate = true;
  return (
    <points geometry={geo} frustumCulled={false}>
      <shaderMaterial vertexShader={FLAKE_VERT} fragmentShader={FLAKE_FRAG} uniforms={uniforms} transparent depthWrite={false} />
    </points>
  );
};

// ---------- snowy pines ----------
const pineGeo = (snowy: boolean) => {
  const parts: THREE.BufferGeometry[] = [];
  const trunk = new THREE.CylinderGeometry(0.12, 0.16, 0.7, 7);
  trunk.translate(0, 0.35, 0);
  if (!snowy) parts.push(trunk.toNonIndexed());
  for (let k = 0; k < 4; k++) {
    const r = 1.05 - k * 0.22;
    const h = 1.0 - k * 0.12;
    const c = new THREE.ConeGeometry(snowy ? r * 0.82 : r, snowy ? h * 0.42 : h, 9, 1);
    c.translate(0, 0.6 + k * 0.62 + (snowy ? h * 0.36 : h / 2), 0);
    parts.push(c.toNonIndexed());
  }
  const merged = mergeAll(parts);
  merged.computeVertexNormals();
  return merged;
};
const mergeAll = (parts: THREE.BufferGeometry[]) => {
  const total = parts.reduce((a, p) => a + p.attributes.position.count, 0);
  const pos = new Float32Array(total * 3);
  const nor = new Float32Array(total * 3);
  let o = 0;
  for (const p of parts) {
    pos.set(p.attributes.position.array as Float32Array, o * 3);
    nor.set(p.attributes.normal.array as Float32Array, o * 3);
    o += p.attributes.position.count;
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute("position", new THREE.BufferAttribute(pos, 3));
  g.setAttribute("normal", new THREE.BufferAttribute(nor, 3));
  return g;
};

type Item = { x: number; z: number; s: number; ry: number };
const keepClear = (x: number, z: number) => {
  if (Math.abs(x) < 4.5 && z < 16 && z > -32) return false; // the main path
  if (Math.hypot(x - CASTLE[0], z - CASTLE[2]) < 17) return false;
  if (Math.hypot(x - PLAZA[0], z - PLAZA[2]) < 6) return false;
  if (Math.hypot(x - TREE[0], z - TREE[2]) < 4.5) return false;
  if (Math.hypot(x - CAVE_EXT[0], z - CAVE_EXT[2]) < 9) return false;
  if (Math.hypot(x - FALLS[0], z - FALLS[2]) < 7) return false;
  if (Math.abs(z - STREAM_Z) < 3) return false;
  const k = Math.max(0, Math.min(1, ((x - PLAZA[0]) * (CAVE_EXT[0] - PLAZA[0]) + (z - PLAZA[2]) * (CAVE_EXT[2] - PLAZA[2])) / ((CAVE_EXT[0] - PLAZA[0]) ** 2 + (CAVE_EXT[2] - PLAZA[2]) ** 2)));
  if (Math.hypot(x - (PLAZA[0] + (CAVE_EXT[0] - PLAZA[0]) * k), z - (PLAZA[2] + (CAVE_EXT[2] - PLAZA[2]) * k)) < 3) return false;
  return true;
};

export const Forest: React.FC<{ t: number; camPos?: V3; sparkle?: number }> = ({ camPos }) => {
  const geos = useMemo(() => ({ green: pineGeo(false), snow: pineGeo(true) }), []);
  const green = useStd({ color: "#2f7a6a", roughness: 0.8, flatShading: true, emissive: "#0a2a30", emissiveIntensity: 0.3 });
  const snowCap = useStd({ color: "#f4f8ff", roughness: 0.7, flatShading: true, emissive: "#405090", emissiveIntensity: 0.15 }, { sparkle: 1.2 });
  const items = useMemo(() => {
    const r = rng(19);
    const out: Item[] = [];
    let guard = 0;
    while (out.length < 230 && guard++ < 20000) {
      const a = r() * Math.PI * 2;
      const d = 7 + Math.sqrt(r()) * 70;
      const x = Math.cos(a) * d;
      const z = -14 + Math.sin(a) * d;
      if (!keepClear(x, z)) continue;
      out.push({ x, z, s: 1.4 + r() * 2.2, ry: r() * 6.28 });
    }
    // Niva's big tree
    out.push({ x: TREE[0], z: TREE[2], s: 3.4, ry: 0.3 });
    return out;
  }, []);
  const meshes = useMemo(
    () =>
      [geos.green, geos.snow].map((g, k) => {
        const m = new THREE.InstancedMesh(g, k ? snowCap : green, items.length);
        m.castShadow = true;
        m.receiveShadow = true;
        m.frustumCulled = false;
        return m;
      }),
    [geos, items, green, snowCap],
  );
  const o = new THREE.Object3D();
  items.forEach((it, i) => {
    const near = camPos ? Math.hypot(it.x - camPos[0], it.z - camPos[2]) : 99;
    const k = Math.max(0, Math.min(1, (near - 2.5 * it.s * 0.5) / 2));
    o.position.set(it.x, floorY(it.x, it.z) - 0.05, it.z);
    o.rotation.set(0, it.ry, 0);
    o.scale.setScalar(it.s * k);
    o.updateMatrix();
    meshes.forEach((m) => m.setMatrixAt(i, o.matrix));
  });
  meshes.forEach((m) => (m.instanceMatrix.needsUpdate = true));
  return (
    <>
      {meshes.map((m, i) => (
        <primitive key={i} object={m} />
      ))}
    </>
  );
};

// ---------- the ice castle ----------
const prism = (r: number, h: number, sides = 6) => {
  const g = new THREE.CylinderGeometry(r * 0.94, r, h, sides, 1);
  g.translate(0, h / 2, 0);
  return g;
};
const spire = (r: number, h: number, sides = 6) => {
  const g = new THREE.ConeGeometry(r, h, sides, 1);
  g.translate(0, h / 2, 0);
  return g;
};
const TOWERS: { x: number; z: number; r: number; h: number; sh: number }[] = [
  { x: -8, z: 3, r: 1.7, h: 10, sh: 5.5 },
  { x: 8, z: 3, r: 1.7, h: 10, sh: 5.5 },
  { x: -8.5, z: -6, r: 1.5, h: 12.5, sh: 5 },
  { x: 8.5, z: -6, r: 1.5, h: 12.5, sh: 5 },
  { x: -13, z: -1, r: 1.1, h: 7, sh: 3.6 },
  { x: 13, z: -1, r: 1.1, h: 7, sh: 3.6 },
];

export const IceCastle: React.FC<{ t: number; s: SnowState }> = ({ t, s }) => {
  const ice = usePhys({ color: "#9fd0ff", roughness: 0.06, metalness: 0.15, clearcoat: 1, clearcoatRoughness: 0.05, flatShading: true, envMapIntensity: 1.3, emissive: "#2a6ae0", emissiveIntensity: 0.5 });
  const iceDeep = usePhys({ color: "#7fa8ff", roughness: 0.08, metalness: 0.2, clearcoat: 1, flatShading: true, envMapIntensity: 1.4, emissive: "#5a4ae8", emissiveIntensity: 0.55 });
  const snowCap = useStd({ color: "#f6faff", roughness: 0.7, emissive: "#405090", emissiveIntensity: 0.15 }, { sparkle: 1 });
  const base = useStd({ color: "#dfe9f8", roughness: 0.75, flatShading: true }, { sparkle: 0.8 });
  const glow = colorAt(s, [CASTLE[0], 10, CASTLE[2]]);
  const win = new THREE.Color("#bfe8ff").lerp(new THREE.Color("#ffd890"), 0.65).multiplyScalar(0.3 + glow * 1.3);
  const trim = new THREE.Color("#7fe0ff").lerp(new THREE.Color("#c89bff"), 0.5 + 0.5 * Math.sin(t * 0.6)).multiplyScalar(0.25 + glow * 1.6);
  const windows = (r: number, h: number, rows: number, per: number, key: string, sides = 6) =>
    Array.from({ length: rows }, (_, row) =>
      Array.from({ length: per }, (_, i) => {
        const a = ((i + 0.5) / sides) * Math.PI * 2 + (sides === 6 ? 0 : Math.PI / sides);
        const y = h * (0.3 + (row / Math.max(1, rows)) * 0.55);
        const rr = r * Math.cos(Math.PI / sides) * 0.97 + 0.03;
        return (
          <group key={`${key}-${row}-${i}`} position={[Math.sin(a) * rr, y, Math.cos(a) * rr]} rotation={[0, a, 0]}>
            <mesh position={[0, 0.15, 0]}>
              <circleGeometry args={[r * 0.17, 14, 0, Math.PI]} />
              <meshBasicMaterial color={win} toneMapped={false} />
            </mesh>
            <mesh position={[0, -0.1 * r, 0]}>
              <planeGeometry args={[r * 0.34, r * 0.5]} />
              <meshBasicMaterial color={win} toneMapped={false} />
            </mesh>
          </group>
        );
      }),
    );
  return (
    <group position={CASTLE}>
      {/* snowy rock base and the wall ring */}
      <mesh position={[0, 0.9, -1]} material={base} receiveShadow castShadow>
        <cylinderGeometry args={[15, 16.5, 1.8, 12]} />
      </mesh>
      <mesh position={[0, 3.6, -1.5]} material={ice} castShadow>
        <cylinderGeometry args={[11, 11.2, 3.6, 12, 1, true]} />
      </mesh>
      {Array.from({ length: 24 }, (_, i) => {
        const a = (i / 24) * Math.PI * 2;
        return (
          <mesh key={i} position={[Math.cos(a) * 11.1, 5.4 + (i % 2) * 0.25, Math.sin(a) * 11.1 - 1.5]} material={iceDeep}>
            <octahedronGeometry args={[0.45 + (i % 2) * 0.15, 0]} />
          </mesh>
        );
      })}
      {/* the gate */}
      <group position={[0, 1.8, 9.7]}>
        <mesh position={[0, 1.6, 0]}>
          <circleGeometry args={[1.6, 32, 0, Math.PI]} />
          <meshBasicMaterial color={win} toneMapped={false} />
        </mesh>
        <mesh position={[0, 0.8, 0]}>
          <planeGeometry args={[3.2, 1.6]} />
          <meshBasicMaterial color={win} toneMapped={false} />
        </mesh>
        <mesh position={[0, 1.6, 0.1]} material={iceDeep}>
          <torusGeometry args={[1.75, 0.2, 6, 24, Math.PI]} />
        </mesh>
      </group>
      {/* the great keep */}
      <mesh geometry={useMemo(() => prism(4.2, 18), [])} material={ice} position={[0, 1.8, -2]} castShadow />
      <group position={[0, 1.8, -2]}>{windows(4.2, 18, 4, 3, "k")}</group>
      <mesh geometry={useMemo(() => spire(4.9, 1.2, 6), [])} material={snowCap} position={[0, 19.7, -2]} />
      <mesh geometry={useMemo(() => prism(2.6, 4.5), [])} material={iceDeep} position={[0, 20.8, -2]} castShadow />
      {/* the crown of ice shards that holds the Aurora Crystal */}
      {Array.from({ length: 8 }, (_, i) => {
        const a = (i / 8) * Math.PI * 2;
        return (
          <mesh key={i} position={[Math.cos(a) * 2.1, 25.6, Math.sin(a) * 2.1 - 2]} rotation={[Math.sin(a) * 0.35, 0, -Math.cos(a) * 0.35]} material={iceDeep}>
            <coneGeometry args={[0.35, 2.4 + (i % 2) * 0.8, 5]} />
          </mesh>
        );
      })}
      <mesh position={[0, 25.35, -2]}>
        <torusGeometry args={[2.2, 0.12, 8, 48]} />
        <meshBasicMaterial color={trim} toneMapped={false} />
      </mesh>
      {/* towers with crystal spires and snow-capped roofs */}
      {TOWERS.map((tw, i) => (
        <group key={i} position={[tw.x, 1.8, tw.z]}>
          <mesh geometry={useMemo(() => prism(tw.r, tw.h, 8), [])} material={ice} castShadow />
          {windows(tw.r, tw.h, 2, 2, `t${i}`, 8)}
          <mesh position={[0, tw.h, 0]} material={snowCap}>
            <cylinderGeometry args={[tw.r * 1.18, tw.r * 1.05, 0.4, 8]} />
          </mesh>
          <mesh geometry={useMemo(() => spire(tw.r * 1.05, tw.sh, 8), [])} material={iceDeep} position={[0, tw.h + 0.2, 0]} castShadow />
          <mesh position={[0, tw.h + 0.15, 0]}>
            <torusGeometry args={[tw.r * 1.15, 0.06, 6, 32]} />
            <meshBasicMaterial color={trim} toneMapped={false} />
          </mesh>
        </group>
      ))}
      {/* glowing ice bridges between the keep and the tall towers */}
      {[-1, 1].map((side) => (
        <group key={side}>
          {Array.from({ length: 12 }, (_, i) => {
            const k = i / 11;
            const x = side * (3.6 + k * 3.8);
            const y = 12.5 - k * 0.9 + Math.sin(k * Math.PI) * 1.1;
            const z = -2 - k * 4;
            return (
              <mesh key={i} position={[x, y, z]} rotation={[0, side * 0.81, 0]} material={ice}>
                <boxGeometry args={[0.75, 0.22, 1.8]} />
              </mesh>
            );
          })}
          {Array.from({ length: 7 }, (_, i) => {
            const k = i / 6;
            return (
              <mesh key={`l${i}`} position={[side * (3.6 + k * 3.8), 13.3 - k * 0.9 + Math.sin(k * Math.PI) * 1.1, -2 - k * 4]}>
                <sphereGeometry args={[0.13, 8, 6]} />
                <meshBasicMaterial color={trim} toneMapped={false} />
              </mesh>
            );
          })}
        </group>
      ))}
      <Halo position={[0, 12, -2]} size={44} color="#9fd0ff" opacity={0.08 + glow * 0.22} />
      <pointLight position={[0, 8, 10]} color="#bfe0ff" intensity={20 + glow * 90} distance={40} decay={1.4} />
    </group>
  );
};

// ---------- the bridge over the frozen stream ----------
export const IceBridge: React.FC<{ s: SnowState; t: number }> = ({ s, t }) => {
  const ice = usePhys({ color: "#9fd0ff", roughness: 0.06, metalness: 0.15, clearcoat: 1, flatShading: true, envMapIntensity: 1.3, emissive: "#2a6ae0", emissiveIntensity: 0.5 });
  const glow = colorAt(s, [0, 2, STREAM_Z]);
  const lamp = new THREE.Color("#8fe8ff").lerp(new THREE.Color("#d0a0ff"), 0.5 + 0.5 * Math.sin(t)).multiplyScalar(0.4 + glow * 2.2);
  const n = 11;
  return (
    <group position={[0, 0, STREAM_Z]}>
      {Array.from({ length: n }, (_, i) => {
        const k = i / (n - 1);
        const z = (k - 0.5) * 7;
        const y = Math.sin(k * Math.PI) * 1.0 + 0.05;
        const ang = Math.cos(k * Math.PI) * 0.42;
        return (
          <mesh key={i} position={[0, y, z]} rotation={[ang, 0, 0]} material={ice} receiveShadow>
            <boxGeometry args={[2.4, 0.2, 0.7]} />
          </mesh>
        );
      })}
      {[-1, 1].map((side) =>
        Array.from({ length: 5 }, (_, i) => {
          const k = i / 4;
          const z = (k - 0.5) * 7;
          const y = Math.sin(k * Math.PI) * 1.0;
          return (
            <group key={`${side}-${i}`} position={[side * 1.2, y, z]}>
              <mesh position={[0, 0.45, 0]} material={ice}>
                <cylinderGeometry args={[0.06, 0.08, 0.9, 6]} />
              </mesh>
              <mesh position={[0, 0.98, 0]}>
                <octahedronGeometry args={[0.16, 0]} />
                <meshBasicMaterial color={lamp} toneMapped={false} />
              </mesh>
            </group>
          );
        }),
      )}
    </group>
  );
};

// ---------- the frozen waterfall on a cliff ----------
const FALL_VERT = /* glsl */ `varying vec2 vUv; varying vec3 vN; varying vec3 vV; void main(){ vUv = uv; vec4 mv = modelViewMatrix * vec4(position, 1.0); vN = normalMatrix * normal; vV = -mv.xyz; gl_Position = projectionMatrix * mv; }`;
const FALL_FRAG = /* glsl */ `
uniform float uT; uniform float uGlow; varying vec2 vUv; varying vec3 vN; varying vec3 vV;
float h1(float n){ return fract(sin(n) * 43758.5453); }
float n1(float x){ float i = floor(x); float f = fract(x); return mix(h1(i), h1(i + 1.0), f * f * (3.0 - 2.0 * f)); }
void main() {
  float streaks = n1(vUv.x * 40.0) * 0.6 + n1(vUv.x * 90.0 + 3.0) * 0.4;
  float flow = 0.5 + 0.5 * sin(vUv.y * 30.0 + uT * 1.5 + streaks * 6.0);
  float f = pow(1.0 - abs(dot(normalize(vN), normalize(vV))), 1.5);
  vec3 c = mix(vec3(0.55, 0.78, 1.0), vec3(0.92, 0.98, 1.0), streaks);
  c *= 0.55 + 0.25 * flow + f * 0.6;
  c += vec3(0.5, 0.85, 1.0) * uGlow * (0.4 + 0.6 * flow) * streaks;
  gl_FragColor = vec4(c, 0.92);
}`;

export const FrozenFalls: React.FC<{ t: number; s: SnowState }> = ({ t, s }) => {
  const rock = useStd({ color: "#8f9cc8", roughness: 0.9, flatShading: true }, { sparkle: 0.3 });
  const snowTop = useStd({ color: "#f2f7ff", roughness: 0.8 }, { sparkle: 1 });
  const fallGeo = useMemo(() => {
    const g = new THREE.CylinderGeometry(3.2, 4.2, 15, 32, 20, true, -0.9, 1.8);
    const p = g.attributes.position as THREE.BufferAttribute;
    for (let i = 0; i < p.count; i++) {
      const y = p.getY(i);
      const k = 1 + 0.05 * Math.sin(y * 2.3 + p.getX(i) * 3);
      p.setXYZ(i, p.getX(i) * k, y, p.getZ(i) * k);
    }
    g.computeVertexNormals();
    g.translate(0, 7.5, -3.2);
    return g;
  }, []);
  const uniforms = useMemo(() => ({ uT: { value: 0 }, uGlow: { value: 0 } }), []);
  uniforms.uT.value = t;
  uniforms.uGlow.value = colorAt(s, FALLS) * 1.1;
  return (
    <group position={FALLS} rotation={[0, 0.55, 0]}>
      {[
        [-5, 6, -5, 6, 9, 4],
        [5, 6, -5, 6, 9, 4],
        [0, 11, -7, 8, 6, 4],
        [-8, 3, -3, 4, 5, 3],
        [8, 3, -3, 4, 5, 3],
      ].map(([x, y, z, sx, sy, sz], i) => (
        <mesh key={i} position={[x, y, z]} scale={[sx, sy, sz]} material={rock} castShadow>
          <dodecahedronGeometry args={[1, 1]} />
        </mesh>
      ))}
      <mesh position={[0, 16, -6]} scale={[11, 2, 5]} material={snowTop}>
        <sphereGeometry args={[1, 24, 12]} />
      </mesh>
      <mesh geometry={fallGeo}>
        <shaderMaterial vertexShader={FALL_VERT} fragmentShader={FALL_FRAG} uniforms={uniforms} transparent side={THREE.DoubleSide} />
      </mesh>
      {/* the frozen pool at its foot */}
      <mesh position={[0, 0.05, 1.2]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[4.6, 40]} />
        <meshPhysicalMaterial color="#a8d8ff" roughness={0.03} clearcoat={1} envMapIntensity={1.8} emissive="#3a7ad0" emissiveIntensity={0.25 + uniforms.uGlow.value * 0.4} />
      </mesh>
      <Halo position={[0, 7, 0]} size={18} color="#9fe0ff" opacity={0.08 + uniforms.uGlow.value * 0.18} />
    </group>
  );
};

// ---------- the ice cave's entrance in a snowy hill ----------
export const CaveEntrance: React.FC<{ t: number }> = ({ t }) => {
  const snow = useStd({ color: "#eef4ff", roughness: 0.85, flatShading: true }, { sparkle: 1 });
  const ice = usePhys({ color: "#9fd4ff", roughness: 0.05, metalness: 0.2, clearcoat: 1, flatShading: true, envMapIntensity: 1.6, emissive: "#3a7ae0", emissiveIntensity: 0.45 });
  const toPlaza = Math.atan2(PLAZA[0] - CAVE_EXT[0], PLAZA[2] - CAVE_EXT[2]);
  return (
    <group position={CAVE_EXT} rotation={[0, toPlaza, 0]}>
      <mesh position={[0, 0.5, -3.5]} scale={[7, 5.5, 5.5]} material={snow} castShadow receiveShadow>
        <icosahedronGeometry args={[1, 2]} />
      </mesh>
      <mesh position={[0, 1.5, 1.85]}>
        <circleGeometry args={[1.7, 32, 0, Math.PI]} />
        <meshBasicMaterial color="#1a3a7a" />
      </mesh>
      <mesh position={[0, 0.75, 1.85]}>
        <planeGeometry args={[3.4, 1.5]} />
        <meshBasicMaterial color="#1a3a7a" />
      </mesh>
      <mesh position={[0, 1.5, 1.95]} material={ice}>
        <torusGeometry args={[1.9, 0.32, 6, 18, Math.PI]} />
      </mesh>
      {[-1, 1].map((sd) => (
        <mesh key={sd} position={[sd * 1.9, 0.75, 1.95]} material={ice}>
          <cylinderGeometry args={[0.3, 0.36, 1.5, 6]} />
        </mesh>
      ))}
      {Array.from({ length: 7 }, (_, i) => (
        <mesh key={i} position={[-1.2 + i * 0.4, 2.95 - Math.abs(i - 3) * 0.12, 2.0]} rotation={[Math.PI, 0, 0]} material={ice}>
          <coneGeometry args={[0.1, 0.5 + (i % 3) * 0.2, 5]} />
        </mesh>
      ))}
      <Halo position={[0, 1.4, 2.2]} size={6} color="#7fc8ff" opacity={0.25 + 0.05 * Math.sin(t * 2)} />
    </group>
  );
};

// ---------- the Aurora Crystal ----------
const CRYS_VERT = /* glsl */ `varying vec3 vN; varying vec3 vV; varying vec3 vP; void main(){ vP = position; vec4 mv = modelViewMatrix * vec4(position, 1.0); vN = normalMatrix * normal; vV = -mv.xyz; gl_Position = projectionMatrix * mv; }`;
const CRYS_FRAG = /* glsl */ `
uniform float uT; uniform float uGlow; uniform float uSat; varying vec3 vN; varying vec3 vV; varying vec3 vP;
void main() {
  float f = pow(1.0 - abs(dot(normalize(vN), normalize(vV))), 1.4);
  float band = 0.5 + 0.5 * sin(vP.y * 5.0 - uT * 2.0 + vP.x * 3.0);
  vec3 a = mix(vec3(0.3, 1.0, 0.65), vec3(0.3, 0.8, 1.0), band);
  a = mix(a, vec3(0.8, 0.45, 1.0), smoothstep(0.3, 1.0, sin(vP.y * 3.0 + uT * 1.3) * 0.5 + 0.5));
  vec3 c = a * (0.35 + f * 1.2) * (0.3 + uGlow * 1.6) + vec3(1.0) * pow(f, 4.0) * 0.5 * uGlow;
  float lum = dot(c, vec3(0.3, 0.59, 0.11));
  c = mix(vec3(lum) * vec3(0.75, 0.82, 0.95), c, uSat);
  gl_FragColor = vec4(c, 1.0);
}`;

export const AuroraCrystal: React.FC<{ position: V3; t: number; glow: number; sat?: number; scale?: number; spin?: number }> = ({ position, t, glow, sat = 1, scale = 1, spin = 0.5 }) => {
  const uniforms = useMemo(() => ({ uT: { value: 0 }, uGlow: { value: 1 }, uSat: { value: 1 } }), []);
  uniforms.uT.value = t;
  uniforms.uGlow.value = glow;
  uniforms.uSat.value = sat;
  const mat = useMemo(() => new THREE.ShaderMaterial({ vertexShader: CRYS_VERT, fragmentShader: CRYS_FRAG, uniforms }), [uniforms]);
  const halo = new THREE.Color("#7fffc8").lerp(new THREE.Color("#b88fff"), 0.5 + 0.5 * Math.sin(t)).lerp(new THREE.Color("#c0c8d8"), 1 - sat);
  return (
    <group position={position} scale={scale}>
      <Halo position={[0, 0, 0]} size={2.4 + glow * 4.5} color={`#${halo.getHexString()}`} opacity={0.15 + glow * 0.55} />
      <group rotation={[0, t * spin, 0]}>
        <mesh scale={[0.42, 1.0, 0.42]} material={mat}>
          <octahedronGeometry args={[1, 0]} />
        </mesh>
        {[0, 1, 2].map((i) => {
          const a = (i / 3) * Math.PI * 2;
          return (
            <mesh key={i} position={[Math.cos(a) * 0.32, -0.35, Math.sin(a) * 0.32]} rotation={[Math.sin(a) * 0.5, 0, -Math.cos(a) * 0.5]} scale={[0.17, 0.45, 0.17]} material={mat}>
              <octahedronGeometry args={[1, 0]} />
            </mesh>
          );
        })}
      </group>
      <pointLight color={halo} intensity={3 + glow * 28} distance={10} decay={1.5} />
    </group>
  );
};

// ---------- the thick block of magical ice around the crystal ----------
const BLOCK_VERT = /* glsl */ `varying vec3 vN; varying vec3 vV; varying vec3 vP; void main(){ vP = position; vec4 mv = modelViewMatrix * vec4(position, 1.0); vN = normalMatrix * normal; vV = -mv.xyz; gl_Position = projectionMatrix * mv; }`;
const BLOCK_FRAG = /* glsl */ `
uniform float uT; uniform float uAurora; uniform float uWarm; uniform float uAlpha; varying vec3 vN; varying vec3 vV; varying vec3 vP;
float hash(vec3 p){ p = fract(p * 0.3183099 + 0.1); p *= 17.0; return fract(p.x * p.y * p.z * (p.x + p.y + p.z)); }
float noise(vec3 x){ vec3 i = floor(x); vec3 f = fract(x); f = f*f*(3.0-2.0*f);
  return mix(mix(mix(hash(i),hash(i+vec3(1,0,0)),f.x), mix(hash(i+vec3(0,1,0)),hash(i+vec3(1,1,0)),f.x),f.y),
             mix(mix(hash(i+vec3(0,0,1)),hash(i+vec3(1,0,1)),f.x), mix(hash(i+vec3(0,1,1)),hash(i+vec3(1,1,1)),f.x),f.y), f.z); }
void main() {
  float f = pow(1.0 - abs(dot(normalize(vN), normalize(vV))), 1.6);
  float frost = noise(vP * 4.0) * 0.6 + noise(vP * 11.0) * 0.4;
  float crack = smoothstep(0.48, 0.5, noise(vP * 3.0 + 7.0)) * smoothstep(0.52, 0.5, noise(vP * 3.0 + 7.0));
  vec3 c = mix(vec3(0.45, 0.7, 1.0), vec3(0.85, 0.94, 1.0), frost) * (0.22 + f * 0.75);
  c += vec3(1.0) * crack * 0.8;
  // northern lights painted across the ice by the seashell
  float bands = 0.5 + 0.5 * sin(vP.y * 6.0 + sin(vP.x * 3.0 + uT * 1.5) * 1.5 - uT * 1.2);
  vec3 aur = mix(vec3(0.3, 1.0, 0.65), vec3(0.75, 0.4, 1.0), bands);
  aur = mix(aur, vec3(1.0, 0.85, 0.4), 0.25 * (0.5 + 0.5 * sin(vP.x * 5.0 - uT)));
  c += aur * uAurora * (0.7 + 1.0 * bands);
  c += vec3(1.0, 0.6, 0.25) * uWarm * (0.3 + f);
  gl_FragColor = vec4(c, (0.22 + f * 0.5 + frost * 0.12 + uAurora * 0.2) * uAlpha);
}`;

export const IceBlock: React.FC<{ position: V3; t: number; melt: number; aurora: number; warm?: number; push?: number }> = ({ position, t, melt, aurora, warm = 0, push = 0 }) => {
  const uniforms = useMemo(() => ({ uT: { value: 0 }, uAurora: { value: 0 }, uWarm: { value: 0 }, uAlpha: { value: 1 } }), []);
  uniforms.uT.value = t;
  uniforms.uAurora.value = aurora;
  uniforms.uWarm.value = warm;
  uniforms.uAlpha.value = 1 - melt;
  const geo = useMemo(() => {
    const g = new THREE.BoxGeometry(1.5, 1.9, 1.5, 6, 6, 6);
    const p = g.attributes.position as THREE.BufferAttribute;
    const r = rng(5);
    const seen = new Map<string, [number, number, number]>();
    for (let i = 0; i < p.count; i++) {
      const key = `${p.getX(i).toFixed(3)},${p.getY(i).toFixed(3)},${p.getZ(i).toFixed(3)}`;
      if (!seen.has(key)) seen.set(key, [(r() - 0.5) * 0.12, (r() - 0.5) * 0.12, (r() - 0.5) * 0.12]);
      const [a, b, c] = seen.get(key)!;
      p.setXYZ(i, p.getX(i) + a, p.getY(i) + b, p.getZ(i) + c);
    }
    g.computeVertexNormals();
    return g;
  }, []);
  if (melt >= 1) return null;
  const s = 1 - melt * 0.45;
  return (
    <mesh position={[position[0], position[1] - melt * 0.4, position[2]]} scale={[s * (1 - push * 0.05), s * (1 - melt * 0.3), s]} geometry={geo} renderOrder={2}>
      <shaderMaterial vertexShader={BLOCK_VERT} fragmentShader={BLOCK_FRAG} uniforms={uniforms} transparent depthWrite={false} side={THREE.DoubleSide} />
    </mesh>
  );
};

// ---------- the ice cave inside ----------
export const CAVE_BLOCK: V3 = [0, 1.45, 0]; // the ice block on its pedestal, in the cave's own coordinates

export const IceCave: React.FC<{ t: number; glow: number; s: SnowState }> = ({ t, glow, s }) => {
  setSnow(t, s);
  const walls = usePhys({ color: "#3f6fc8", roughness: 0.25, metalness: 0.1, clearcoat: 0.3, flatShading: true, side: THREE.BackSide, envMapIntensity: 0.35, emissive: "#18308a", emissiveIntensity: 0.55 });
  const floor = useStd({ color: "#8fa6e0", roughness: 0.75, emissive: "#18286a", emissiveIntensity: 0.25 }, { sparkle: 1.2 });
  const ice = usePhys({ color: "#bfe2ff", roughness: 0.05, metalness: 0.15, clearcoat: 1, flatShading: true, envMapIntensity: 1.6, emissive: "#4a8af0", emissiveIntensity: 0.4 });
  const domeGeo = useMemo(() => {
    const g = new THREE.IcosahedronGeometry(13, 3);
    const p = g.attributes.position as THREE.BufferAttribute;
    const r = rng(8);
    const seen = new Map<string, number>();
    for (let i = 0; i < p.count; i++) {
      const key = `${p.getX(i).toFixed(2)},${p.getY(i).toFixed(2)},${p.getZ(i).toFixed(2)}`;
      if (!seen.has(key)) seen.set(key, 1 + (r() - 0.5) * 0.12);
      const k = seen.get(key)!;
      p.setXYZ(i, p.getX(i) * k * 1.1, Math.max(-0.5, p.getY(i) * k * 0.62), p.getZ(i) * k);
    }
    g.computeVertexNormals();
    return g;
  }, []);
  const crystals = useMemo(() => {
    const r = rng(12);
    return Array.from({ length: 34 }, () => {
      const a = r() * Math.PI * 2;
      const d = 8 + r() * 4;
      return { x: Math.cos(a) * d, z: Math.sin(a) * d, s: 0.5 + r() * 1.3, tx: (r() - 0.5) * 0.8, tz: (r() - 0.5) * 0.8, c: r() > 0.6 ? "#b89bff" : "#7fd8ff" };
    }).filter((c) => c.z < 4);
  }, []);
  const icicles = useMemo(() => {
    const r = rng(14);
    return Array.from({ length: 60 }, () => {
      const a = r() * Math.PI * 2;
      const d = 2 + r() * 9;
      return { x: Math.cos(a) * d, z: Math.sin(a) * d, h: 0.6 + r() * 1.8, y: 7.4 * Math.sqrt(Math.max(0, 1 - (d / 14.3) ** 2)) };
    });
  }, []);
  return (
    <>
      <IceEnv />
      <fogExp2 attach="fog" args={["#0e1c4a", 0.035]} />
      <hemisphereLight args={["#7fb0ff", "#1a2460", 0.5]} />
      <pointLight position={[0, 6, 2]} color="#bfe0ff" intensity={28} distance={22} decay={1.4} />
      <pointLight position={[-6, 2, -5]} color="#b89bff" intensity={25} distance={16} decay={1.5} />
      <pointLight position={[6, 2, -4]} color="#7fe8ff" intensity={25} distance={16} decay={1.5} />
      <mesh geometry={domeGeo} material={walls} />
      <mesh rotation={[-Math.PI / 2, 0, 0]} material={floor} receiveShadow>
        <circleGeometry args={[15, 48]} />
      </mesh>
      {/* the light falling through a hole in the roof */}
      <mesh position={[0, 4.5, 0]}>
        <cylinderGeometry args={[0.8, 2.4, 9, 24, 1, true]} />
        <meshBasicMaterial color={new THREE.Color("#bfe8ff").multiplyScalar(0.25 + glow * 0.2)} transparent opacity={0.22} depthWrite={false} blending={THREE.AdditiveBlending} side={THREE.DoubleSide} toneMapped={false} />
      </mesh>
      {/* the pedestal */}
      <mesh position={[0, 0.25, 0]} material={ice}>
        <cylinderGeometry args={[1.1, 1.35, 0.5, 6]} />
      </mesh>
      {crystals.map((c, i) => (
        <mesh key={i} position={[c.x, c.s * 0.6, c.z]} rotation={[c.tx, i, c.tz]} scale={[c.s * 0.35, c.s, c.s * 0.35]}>
          <octahedronGeometry args={[1, 0]} />
          <meshStandardMaterial color={c.c} emissive={c.c} emissiveIntensity={0.5 + 0.3 * Math.sin(t * 1.5 + i)} roughness={0.15} flatShading envMapIntensity={1.5} />
        </mesh>
      ))}
      {icicles.map((ic, i) => (
        <mesh key={i} position={[ic.x, ic.y - ic.h / 2, ic.z]} rotation={[Math.PI, 0, 0]} material={ice}>
          <coneGeometry args={[0.12 + ic.h * 0.05, ic.h, 5]} />
        </mesh>
      ))}
      <Motes t={t} center={[0, 3, 0]} size={[16, 6, 14]} count={160} color="#cfe8ff" bright={0.6} />
    </>
  );
};

// ---------- the jungle hologram the snowflake shows at the end ----------
const HOLO_VERT = /* glsl */ `varying vec2 vUv; varying vec3 vN; varying vec3 vV; void main(){ vUv = uv; vec4 mv = modelViewMatrix * vec4(position, 1.0); vN = normalMatrix * normal; vV = -mv.xyz; gl_Position = projectionMatrix * mv; }`;
const HOLO_FRAG = /* glsl */ `uniform float uT; uniform float uOn; varying vec2 vUv; varying vec3 vN; varying vec3 vV;
void main() { float f = pow(1.0 - abs(dot(normalize(vN), normalize(vV))), 1.6); float lines = 0.75 + 0.25 * sin(vUv.y * 140.0 - uT * 6.0);
  vec3 c = vec3(0.3, 1.0, 0.45) * (0.12 + f * 1.1) * lines; gl_FragColor = vec4(c, (0.1 + f * 0.6) * uOn); }`;

export const JungleHologram: React.FC<{ position: V3; t: number; on: number; scale?: number }> = ({ position, t, on, scale = 1 }) => {
  const uniforms = useMemo(() => ({ uT: { value: 0 }, uOn: { value: 0 } }), []);
  uniforms.uT.value = t;
  uniforms.uOn.value = on;
  if (on <= 0.001) return null;
  const green = (k: number) => new THREE.Color("#7fff9f").multiplyScalar(k * on);
  const s = scale * (0.3 + 0.7 * on);
  const trees: [number, number, number, number][] = [
    [0, 1.7, -0.2, 0.75],
    [-0.9, 1.25, 0.1, 0.55],
    [0.95, 1.35, 0.05, 0.6],
    [-1.4, 0.8, -0.3, 0.4],
    [1.45, 0.85, -0.3, 0.42],
  ];
  return (
    <group position={position} scale={s}>
      <Halo position={[0, 1.0, 0]} size={8} color="#5fe880" opacity={0.25 * on} />
      <mesh>
        <sphereGeometry args={[2, 48, 24, 0, Math.PI * 2, 0, Math.PI / 2]} />
        <shaderMaterial vertexShader={HOLO_VERT} fragmentShader={HOLO_FRAG} uniforms={uniforms} transparent depthWrite={false} side={THREE.DoubleSide} blending={THREE.AdditiveBlending} />
      </mesh>
      {trees.map(([x, h, z, r], i) => (
        <group key={i} position={[x, 0, z]} rotation={[0, 0, Math.sin(t * 0.8 + i) * 0.03]}>
          <mesh position={[0, h / 2, 0]}>
            <cylinderGeometry args={[r * 0.12, r * 0.2, h, 7]} />
            <meshBasicMaterial color={new THREE.Color("#c8a070").multiplyScalar(1.3 * on)} transparent opacity={0.85} toneMapped={false} blending={THREE.AdditiveBlending} depthWrite={false} />
          </mesh>
          {[0, 1, 2].map((k) => (
            <mesh key={k} position={[(k - 1) * r * 0.45, h + (k === 1 ? r * 0.25 : 0), 0]}>
              <sphereGeometry args={[r * (k === 1 ? 0.6 : 0.45), 14, 10]} />
              <meshBasicMaterial color={new THREE.Color("#3fd860").multiplyScalar(0.8 * on)} transparent opacity={0.75} toneMapped={false} blending={THREE.AdditiveBlending} depthWrite={false} />
            </mesh>
          ))}
          {/* hanging vines */}
          {[-1, 1].map((sd) => (
            <mesh key={sd} position={[sd * r * 0.4, h - r * 0.45, 0.05]}>
              <cylinderGeometry args={[0.012, 0.012, r * 0.9, 4]} />
              <meshBasicMaterial color={green(2)} toneMapped={false} />
            </mesh>
          ))}
        </group>
      ))}
      {Array.from({ length: 14 }, (_, i) => (
        <mesh key={i} position={[Math.sin(i * 2.3 + t * 0.6) * 1.4, 0.4 + ((i * 0.37 + t * 0.15) % 1.4), Math.cos(i * 1.7 + t * 0.5) * 0.7]}>
          <sphereGeometry args={[0.035, 6, 4]} />
          <meshBasicMaterial color={new THREE.Color("#fff3a0").multiplyScalar(2.5 * on)} toneMapped={false} />
        </mesh>
      ))}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, 0]}>
        <ringGeometry args={[1.95, 2.1, 64]} />
        <meshBasicMaterial color={green(3)} toneMapped={false} transparent />
      </mesh>
    </group>
  );
};

// ---------- the glowing snowflake path the friends arrive on ----------
export const FlakePath: React.FC<{ t: number; on: number; from: V3; to: V3; count?: number }> = ({ t, on, from, to, count = 26 }) => {
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
          <group key={i} position={[x, y + 0.05, z]} rotation={[-Math.PI / 2, 0, t * 0.6 + i]}>
            <mesh>
              <circleGeometry args={[0.32, 6]} />
              <meshBasicMaterial color={new THREE.Color("#bfefff").multiplyScalar(1.6 + 0.6 * Math.sin(t * 4 + i))} toneMapped={false} transparent opacity={0.85} depthWrite={false} />
            </mesh>
          </group>
        );
      })}
    </>
  );
};

// ---------- lights ----------
const SnowLights: React.FC<{ vivid: number }> = ({ vivid }) => (
  <>
    <hemisphereLight args={["#8fa8ff", "#2a3a7a", 0.45 + vivid * 0.2]} />
    <directionalLight
      position={[-30, 50, 25]}
      intensity={0.85 + vivid * 0.4}
      color="#c8d8ff"
      castShadow
      shadow-mapSize={[2048, 2048]}
      shadow-camera-left={-50}
      shadow-camera-right={50}
      shadow-camera-top={50}
      shadow-camera-bottom={-50}
      shadow-camera-near={1}
      shadow-camera-far={160}
      shadow-bias={-0.0006}
    />
    <directionalLight position={[30, 12, -60]} intensity={0.25 + vivid * 0.55} color="#9fffd0" />
  </>
);

// The whole Snowflake Kingdom. s = the color state for this frame; aurora = how bright the northern lights are.
export const SnowflakeKingdom: React.FC<{ t: number; s: SnowState; aurora: number; camPos?: V3; sparkle?: number }> = ({ t, s, aurora, camPos, sparkle = 0 }) => {
  setSnow(t, s);
  const vivid = colorAt(s, [0, 0, 0]);
  return (
    <>
      <IceEnv />
      <fogExp2 attach="fog" args={[new THREE.Color("#18245e").lerp(new THREE.Color("#2a3048"), 1 - vivid).getStyle(), 0.011]} />
      <SkyDome t={t} top="#060c34" mid="#1c2a6e" low="#5a6ab8" moonDir={[-0.3, 0.45, -1]} moonTint="#9fd8ff" />
      <Stars t={t} count={2400} bright={0.9} />
      <Aurora t={t} on={aurora} sat={0.25 + 0.75 * vivid} />
      <SnowLights vivid={vivid} />
      <Ground />
      <Forest t={t} camPos={camPos} sparkle={sparkle} />
      <IceCastle t={t} s={s} />
      <IceBridge t={t} s={s} />
      <FrozenFalls t={t} s={s} />
      <CaveEntrance t={t} />
      <Snowfall t={t} center={camPos ? [camPos[0], 8, camPos[2] - 14] : [0, 8, -10]} size={[44, 24, 40]} count={2600} glow={sparkle} />
      <Motes t={t} center={[0, 5, -16]} size={[60, 12, 50]} count={260} color="#e8f4ff" bright={0.35 + 0.4 * vivid + sparkle * 0.4} />
    </>
  );
};
