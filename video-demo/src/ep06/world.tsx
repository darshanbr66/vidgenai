import React, { useMemo } from "react";
import "@react-three/fiber";
import * as THREE from "three";
import { mergeGeometries } from "three/examples/jsm/utils/BufferGeometryUtils.js";
import { rng } from "../kit3d/World";
import { Halo } from "../kit3d/sky";
import { Motes } from "../kit3d/magic";

// Episode 6: the Underwater Kingdom, built procedurally in Three.js.
// Every value comes from the props (t = seconds, frame based), so each frame renders the same every time.
//
// The kingdom can lose and regain its colors. All kingdom materials share the uniforms in SEA:
//   base   0..1  how colorful everything is (1 = full color, low = grey-blue)
//   waveR        radius of the color wave spreading out from the castle's pearl shell
//   waveOn 0..1  whether the wave is running

export type V3 = [number, number, number];

// ---------- where things are (world units; Lumi is about 1.3 tall; the sea floor is y = 0 near the middle) ----------
export const PLAZA: V3 = [0, 0, 0];
export const CASTLE: V3 = [0, 0, -34];
export const SOCKET: V3 = [CASTLE[0], 20.2, CASTLE[2] + 0.4]; // where the Ocean Pearl sits, in the open shell on top
export const PEARL_SPOT: V3 = [-17.5, 1.45, -12.5]; // the pearl, trapped in the giant bubble near the cave
export const CAVE: V3 = [-21.2, 0, -16.6];
const SURFACE_Y = 52;

export type SeaState = { base: number; waveR: number; waveOn: number };

const SEA = {
  uT: { value: 0 },
  uBase: { value: 1 },
  uWaveR: { value: 0 },
  uWaveOn: { value: 0 },
  uCenter: { value: new THREE.Vector3(...SOCKET) },
};

// How colorful a world point is, on the CPU (for glows that are not lit materials)
export const colorAt = (s: SeaState, p: V3) => {
  const d = Math.hypot(p[0] - SOCKET[0], p[1] - SOCKET[1], p[2] - SOCKET[2]);
  return Math.max(0, Math.min(1, s.base + s.waveOn * Math.max(0, Math.min(1, (s.waveR - d) / 8))));
};

const CAUSTIC_GLSL = /* glsl */ `
float seaCaustic(vec2 uv, float time) {
  vec2 p = mod(uv * 6.28318, 6.28318) - 250.0;
  vec2 i = p;
  float c = 1.0;
  float inten = 0.005;
  for (int n = 0; n < 4; n++) {
    float t = time * (1.0 - (3.5 / float(n + 1)));
    i = p + vec2(cos(t - i.x) + sin(t + i.y), sin(t - i.y) + cos(t + i.x));
    c += 1.0 / length(vec2(p.x / (sin(i.x + t) / inten), p.y / (cos(i.y + t) / inten)));
  }
  c /= 4.0;
  c = 1.17 - pow(c, 1.4);
  return pow(abs(c), 8.0);
}`;

// A lit material for the kingdom: caustic light on top, optional sway (for plants), and the shared color fade.
const seaMat = (params: THREE.MeshStandardMaterialParameters, opts: { caustic?: number; sway?: number; glowKeep?: number } = {}) => {
  const m = new THREE.MeshStandardMaterial(params);
  const caustic = opts.caustic ?? 0.9;
  const sway = opts.sway ?? 0;
  m.onBeforeCompile = (shader) => {
    Object.assign(shader.uniforms, SEA, { uCaustic: { value: caustic }, uSway: { value: sway } });
    shader.vertexShader = shader.vertexShader
      .replace("#include <common>", "#include <common>\nuniform float uT; uniform float uSway; varying vec3 vSeaW; varying float vSeaUp;")
      .replace(
        "#include <begin_vertex>",
        `#include <begin_vertex>
        if (uSway > 0.0) {
          vec3 ip = vec3(0.0);
          #ifdef USE_INSTANCING
          ip = instanceMatrix[3].xyz;
          #endif
          float sh = max(position.y, 0.0);
          transformed.x += sin(uT * 1.1 + ip.x * 0.7 + ip.z * 0.5 + position.y * 0.9) * sh * sh * uSway;
          transformed.z += cos(uT * 0.9 + ip.z * 0.6 + ip.x * 0.3 + position.y * 0.7) * sh * sh * uSway * 0.6;
        }`,
      )
      .replace(
        "#include <project_vertex>",
        `#include <project_vertex>
        vec4 seaW = vec4(transformed, 1.0);
        #ifdef USE_INSTANCING
        seaW = instanceMatrix * seaW;
        #endif
        seaW = modelMatrix * seaW;
        vSeaW = seaW.xyz;
        vSeaUp = normalize(mat3(modelMatrix) * objectNormal).y;`,
      );
    shader.fragmentShader = shader.fragmentShader
      .replace(
        "#include <common>",
        `#include <common>
        uniform float uT; uniform float uBase; uniform float uWaveR; uniform float uWaveOn; uniform vec3 uCenter; uniform float uCaustic;
        varying vec3 vSeaW; varying float vSeaUp;
        ${CAUSTIC_GLSL}`,
      )
      .replace(
        "#include <emissivemap_fragment>",
        `#include <emissivemap_fragment>
        float cz = seaCaustic(vSeaW.xz * 0.11 + vec2(vSeaW.y * 0.03), uT * 0.55 + 23.0);
        totalEmissiveRadiance += diffuseColor.rgb * cz * uCaustic * (0.3 + 0.7 * clamp(vSeaUp, 0.0, 1.0));`,
      )
      .replace(
        "#include <tonemapping_fragment>",
        `float seaD = distance(vSeaW, uCenter);
        float amt = clamp(uBase + uWaveOn * clamp((uWaveR - seaD) / 8.0, 0.0, 1.0), 0.0, 1.0);
        float lum = dot(gl_FragColor.rgb, vec3(0.299, 0.587, 0.114));
        gl_FragColor.rgb = mix(vec3(lum) * vec3(0.5, 0.6, 0.76), gl_FragColor.rgb, amt);
        gl_FragColor.rgb += uWaveOn * exp(-pow((seaD - uWaveR) / 3.0, 2.0)) * vec3(0.55, 0.85, 1.0) * 0.9;
        #include <tonemapping_fragment>`,
      );
  };
  m.customProgramCacheKey = () => "sea-v1";
  return m;
};

const useMat = (params: THREE.MeshStandardMaterialParameters, opts?: { caustic?: number; sway?: number }) =>
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useMemo(() => seaMat(params, opts), []);

// The height of the sea floor: flat where the friends walk, rolling dunes and hills further out
export const floorY = (x: number, z: number) => {
  const r = Math.hypot(x + 6, z + 12);
  const far = Math.min(1, Math.max(0, (r - 34) / 26));
  const dunes = Math.sin(x * 0.19) * Math.cos(z * 0.16) * 0.9 + Math.sin(x * 0.07 + z * 0.11) * 1.4;
  return far * (dunes + Math.max(0, r - 60) * 0.35) + Math.sin(x * 1.3 + z * 0.4) * 0.02;
};

// ---------- the water all around: a deep-blue dome with a bright, rippling surface far above ----------
const DOME_VERT = /* glsl */ `varying vec3 vDir; void main(){ vDir = normalize(position); gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`;
const DOME_FRAG = /* glsl */ `
uniform float uT; uniform float uVivid; varying vec3 vDir;
${CAUSTIC_GLSL}
void main() {
  float h = vDir.y;
  vec3 deep = vec3(0.01, 0.06, 0.20);
  vec3 mid = vec3(0.02, 0.26, 0.50);
  vec3 high = vec3(0.14, 0.60, 0.78);
  vec3 c = mix(deep, mid, smoothstep(-0.35, 0.12, h));
  c = mix(c, high, smoothstep(0.12, 0.85, h));
  // the bright surface far above, seen through the water
  if (h > 0.2) {
    vec2 uv = vDir.xz / h * 1.4;
    float rip = seaCaustic(uv * 0.35, uT * 0.4 + 3.0);
    c += vec3(0.65, 0.95, 1.0) * rip * smoothstep(0.25, 0.9, h) * 0.7;
  }
  c += vec3(0.9, 1.0, 0.95) * pow(max(h, 0.0), 10.0) * 0.8;
  float lum = dot(c, vec3(0.3, 0.59, 0.11));
  c = mix(vec3(lum) * vec3(0.7, 0.85, 1.0), c, 0.55 + 0.45 * uVivid);
  gl_FragColor = vec4(c, 1.0);
}`;

const WaterDome: React.FC<{ t: number; vivid: number }> = ({ t, vivid }) => {
  const uniforms = useMemo(() => ({ uT: { value: 0 }, uVivid: { value: 1 } }), []);
  uniforms.uT.value = t;
  uniforms.uVivid.value = vivid;
  return (
    <mesh renderOrder={-10}>
      <sphereGeometry args={[400, 48, 32]} />
      <shaderMaterial vertexShader={DOME_VERT} fragmentShader={DOME_FRAG} uniforms={uniforms} side={THREE.BackSide} depthWrite={false} fog={false} />
    </mesh>
  );
};

// ---------- sunlight shafts coming down from the surface ----------
const RAY_VERT = /* glsl */ `varying vec2 vUv; varying vec3 vN; varying vec3 vV;
void main(){ vUv = uv; vec4 mv = modelViewMatrix * vec4(position, 1.0); vN = normalMatrix * normal; vV = -mv.xyz; gl_Position = projectionMatrix * mv; }`;
const RAY_FRAG = /* glsl */ `
uniform float uT; uniform float uPh; uniform float uOn; varying vec2 vUv; varying vec3 vN; varying vec3 vV;
void main() {
  float face = pow(abs(dot(normalize(vN), normalize(vV))), 2.5);
  float len = smoothstep(0.0, 0.75, vUv.y) * (1.0 - smoothstep(0.92, 1.0, vUv.y) * 0.5);
  float flick = 0.65 + 0.35 * sin(uT * 0.9 + uPh) * sin(uT * 0.53 + uPh * 2.0);
  gl_FragColor = vec4(vec3(0.75, 0.97, 1.0), face * len * flick * 0.16 * uOn);
}`;

const GodRays: React.FC<{ t: number; on?: number; count?: number; seed?: number; center?: V3; spread?: number }> = ({ t, on = 1, count = 16, seed = 3, center = [0, 0, -14], spread = 40 }) => {
  const rays = useMemo(() => {
    const r = rng(seed);
    return Array.from({ length: count }, () => ({ x: center[0] + (r() - 0.5) * spread, z: center[2] + (r() - 0.5) * spread, w: 0.8 + r() * 1.8, tilt: 0.12 + r() * 0.12, rot: r() * 6.28, ph: r() * 9 }));
  }, [count, seed, center, spread]);
  const mats = useMemo(
    () => rays.map((ry) => new THREE.ShaderMaterial({ vertexShader: RAY_VERT, fragmentShader: RAY_FRAG, uniforms: { uT: { value: 0 }, uPh: { value: ry.ph }, uOn: { value: 1 } }, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, side: THREE.DoubleSide, fog: false })),
    [rays],
  );
  mats.forEach((m) => {
    m.uniforms.uT.value = t;
    m.uniforms.uOn.value = on;
  });
  return (
    <>
      {rays.map((ry, i) => (
        <group key={i} position={[ry.x, SURFACE_Y - 4, ry.z]} rotation={[ry.tilt * Math.cos(ry.rot), 0, ry.tilt * Math.sin(ry.rot) + 0.08]}>
          <mesh position={[0, -SURFACE_Y / 2 - 6, 0]} material={mats[i]}>
            <cylinderGeometry args={[ry.w * 0.5, ry.w * 1.6, SURFACE_Y + 14, 20, 1, true]} />
          </mesh>
        </group>
      ))}
    </>
  );
};

// ---------- rising bubbles ----------
const BUB_VERT = /* glsl */ `
attribute float aSize; uniform float uScale; varying float vA;
void main(){ vec4 mv = modelViewMatrix * vec4(position, 1.0); gl_PointSize = aSize * uScale / -mv.z; vA = 1.0; gl_Position = projectionMatrix * mv; }`;
const BUB_FRAG = /* glsl */ `
uniform float uAlpha;
void main(){
  vec2 p = gl_PointCoord - 0.5; float d = length(p);
  float rim = smoothstep(0.5, 0.42, d) * smoothstep(0.28, 0.44, d);
  float fill = smoothstep(0.5, 0.3, d) * 0.12;
  float hi = smoothstep(0.12, 0.0, length(p - vec2(-0.16, -0.16)));
  gl_FragColor = vec4(vec3(0.85, 1.0, 1.0), (rim * 0.85 + fill + hi) * uAlpha);
}`;

export const Bubbles: React.FC<{ t: number; center: V3; size: [number, number, number]; count?: number; seed?: number; speed?: number; scale?: number; alpha?: number; columns?: number }> = ({
  t,
  center,
  size,
  count = 160,
  seed = 4,
  speed = 1,
  scale = 1,
  alpha = 1,
  columns = 0,
}) => {
  const base = useMemo(() => {
    const r = rng(seed);
    const cols = Array.from({ length: columns }, () => [r() - 0.5, r() - 0.5]);
    return Array.from({ length: count }, (_, i) => {
      const c = columns ? cols[i % columns] : null;
      return { x: c ? c[0] + (r() - 0.5) * 0.04 : r() - 0.5, z: c ? c[1] + (r() - 0.5) * 0.04 : r() - 0.5, y: r(), v: 0.6 + r() * 0.8, ph: r() * 6.28, s: 0.5 + r() };
    });
  }, [count, seed, columns]);
  const geo = useMemo(() => {
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.BufferAttribute(new Float32Array(count * 3), 3));
    g.setAttribute("aSize", new THREE.BufferAttribute(new Float32Array(base.map((b) => b.s * 26)), 1));
    return g;
  }, [count, base]);
  const uniforms = useMemo(() => ({ uScale: { value: 1 }, uAlpha: { value: 1 } }), []);
  uniforms.uScale.value = 40 * scale;
  uniforms.uAlpha.value = alpha * 0.75;
  const pos = geo.attributes.position as THREE.BufferAttribute;
  base.forEach((b, i) => {
    const y = ((b.y + (t * 0.06 * speed * b.v) / Math.max(1, size[1] / 10)) % 1) * size[1];
    pos.setXYZ(i, center[0] + b.x * size[0] + Math.sin(t * 2.2 + b.ph) * 0.12, center[1] + y, center[2] + b.z * size[2] + Math.cos(t * 1.8 + b.ph) * 0.1);
  });
  pos.needsUpdate = true;
  return (
    <points geometry={geo} frustumCulled={false}>
      <shaderMaterial vertexShader={BUB_VERT} fragmentShader={BUB_FRAG} uniforms={uniforms} transparent depthWrite={false} />
    </points>
  );
};

// ---------- geometry makers ----------
const lathe = (pts: [number, number][], seg = 32) => new THREE.LatheGeometry(pts.map(([x, y]) => new THREE.Vector2(x, y)), seg);

const branchCoral = (seed: number) => {
  const r = rng(seed);
  const parts: THREE.BufferGeometry[] = [];
  const grow = (from: THREE.Vector3, dir: THREE.Vector3, len: number, rad: number, depth: number) => {
    const to = from.clone().add(dir.clone().multiplyScalar(len));
    const g = new THREE.CylinderGeometry(rad * 0.72, rad, len, 7, 1);
    g.translate(0, len / 2, 0);
    g.applyQuaternion(new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir));
    g.translate(from.x, from.y, from.z);
    parts.push(g);
    if (depth === 0) {
      const tip = new THREE.SphereGeometry(rad * 1.05, 8, 6);
      tip.translate(to.x, to.y, to.z);
      parts.push(tip);
      return;
    }
    const n = 2 + (r() > 0.5 ? 1 : 0);
    for (let i = 0; i < n; i++) {
      const a = r() * Math.PI * 2;
      const d = new THREE.Vector3(Math.cos(a) * 0.55, 1, Math.sin(a) * 0.55).add(dir.clone().multiplyScalar(0.6)).normalize();
      grow(to, d, len * (0.65 + r() * 0.2), rad * 0.72, depth - 1);
    }
  };
  grow(new THREE.Vector3(0, 0, 0), new THREE.Vector3(0, 1, 0), 0.45, 0.09, 3);
  return mergeGeometries(parts.map((p) => p.toNonIndexed()))!;
};

const brainCoral = () => {
  const g = new THREE.SphereGeometry(1, 48, 32, 0, Math.PI * 2, 0, Math.PI * 0.62);
  const p = g.attributes.position as THREE.BufferAttribute;
  for (let i = 0; i < p.count; i++) {
    const v = new THREE.Vector3().fromBufferAttribute(p, i);
    const th = Math.atan2(v.z, v.x);
    const ph = Math.acos(Math.max(-1, Math.min(1, v.y)));
    const k = 1 + 0.05 * Math.sin(th * 14 + Math.sin(ph * 9) * 3) * Math.sin(ph * 2.5);
    v.multiplyScalar(k);
    p.setXYZ(i, v.x, (v.y - 0.35) * 0.75, v.z);
  }
  g.computeVertexNormals();
  return g;
};

const tubeCoral = (seed: number) => {
  const r = rng(seed);
  const parts: THREE.BufferGeometry[] = [];
  for (let i = 0; i < 6; i++) {
    const a = (i / 6) * Math.PI * 2 + r();
    const d = i === 0 ? 0 : 0.18 + r() * 0.12;
    const h = 0.35 + r() * 0.55;
    const g = new THREE.CylinderGeometry(0.09, 0.07, h, 12, 1, true);
    g.translate(Math.cos(a) * d, h / 2, Math.sin(a) * d);
    parts.push(g.toNonIndexed());
    const lip = new THREE.TorusGeometry(0.085, 0.025, 6, 14);
    lip.rotateX(Math.PI / 2);
    lip.translate(Math.cos(a) * d, h, Math.sin(a) * d);
    parts.push(lip.toNonIndexed());
  }
  return mergeGeometries(parts)!;
};

const anemone = (seed: number) => {
  const r = rng(seed);
  const parts: THREE.BufferGeometry[] = [];
  const base = new THREE.CylinderGeometry(0.22, 0.28, 0.25, 14);
  base.translate(0, 0.12, 0);
  parts.push(base.toNonIndexed());
  for (let i = 0; i < 26; i++) {
    const a = r() * Math.PI * 2;
    const d = r() * 0.2;
    const h = 0.4 + r() * 0.35;
    const g = new THREE.CylinderGeometry(0.018, 0.035, h, 5, 4);
    g.translate(0, h / 2, 0);
    g.rotateZ(-(0.25 + d * 1.6));
    g.rotateY(a);
    g.translate(Math.cos(a) * d, 0.24, Math.sin(a) * d);
    parts.push(g.toNonIndexed());
    const tip = new THREE.SphereGeometry(0.035, 6, 4);
    tip.translate(0, h, 0);
    tip.rotateZ(-(0.25 + d * 1.6));
    tip.rotateY(a);
    tip.translate(Math.cos(a) * d, 0.24, Math.sin(a) * d);
    parts.push(tip.toNonIndexed());
  }
  return mergeGeometries(parts)!;
};

const kelpClump = (seed: number) => {
  const r = rng(seed);
  const parts: THREE.BufferGeometry[] = [];
  for (let i = 0; i < 4; i++) {
    const g = new THREE.PlaneGeometry(0.22, 1, 1, 14);
    g.translate(0, 0.5, 0);
    const p = g.attributes.position as THREE.BufferAttribute;
    for (let k = 0; k < p.count; k++) {
      const y = p.getY(k);
      p.setX(k, p.getX(k) * (1 - y * 0.5) + Math.sin(y * 7 + i) * 0.06);
      p.setZ(k, Math.cos(y * 5 + i * 2) * 0.05);
    }
    g.scale(1, 0.75 + r() * 0.5, 1);
    g.rotateY(r() * Math.PI);
    g.translate((r() - 0.5) * 0.3, 0, (r() - 0.5) * 0.3);
    g.computeVertexNormals();
    parts.push(g);
  }
  return mergeGeometries(parts)!;
};

const fishGeo = () => {
  const body = new THREE.SphereGeometry(1, 12, 8);
  body.scale(0.09, 0.13, 0.26);
  const tail = new THREE.ConeGeometry(0.11, 0.16, 3);
  tail.rotateX(-Math.PI / 2);
  tail.scale(0.3, 1, 1);
  tail.translate(0, 0, -0.3);
  const fin = new THREE.ConeGeometry(0.06, 0.12, 3);
  fin.scale(0.25, 1, 1.4);
  fin.translate(0, 0.14, -0.02);
  return mergeGeometries([body.toNonIndexed(), tail.toNonIndexed(), fin.toNonIndexed()])!;
};

const rockGeo = (seed: number, detail = 2) => {
  const r = rng(seed);
  const g = new THREE.IcosahedronGeometry(1, detail);
  const p = g.attributes.position as THREE.BufferAttribute;
  const bumps = Array.from({ length: 6 }, () => [new THREE.Vector3(r() - 0.5, r() - 0.5, r() - 0.5).normalize(), 0.1 + r() * 0.2] as const);
  for (let i = 0; i < p.count; i++) {
    const v = new THREE.Vector3().fromBufferAttribute(p, i);
    let k = 1;
    for (const [d, a] of bumps) k += a * Math.max(0, v.dot(d)) ** 3;
    v.multiplyScalar(k);
    p.setXYZ(i, v.x, v.y, v.z);
  }
  g.computeVertexNormals();
  return g;
};

// ---------- the reef: many corals as a few instanced meshes ----------
const CORAL_COLORS = ["#ff6f91", "#ff9f45", "#ffd166", "#9b7bff", "#3fd0c9", "#ff4f8b", "#c084fc", "#ff7a59", "#5ee0a0"];

type Keep = (x: number, z: number) => boolean;
// Places that stay clear of reef: the plaza, the path to the castle, the garden and the castle itself
const clearOf: Keep = (x, z) => {
  if (Math.hypot(x - PLAZA[0], z - PLAZA[2]) < 5.5) return false;
  if (Math.abs(x) < 3.2 && z < 4 && z > -26) return false;
  if (Math.hypot(x - CASTLE[0], z - CASTLE[2]) < 12.5) return false;
  if (Math.hypot(x - PEARL_SPOT[0], z - PEARL_SPOT[2]) < 6.5) return false;
  if (Math.hypot(x - CAVE[0], z - CAVE[2]) < 6) return false;
  // the walk from the plaza to the garden
  const t = Math.max(0, Math.min(1, (x * PEARL_SPOT[0] + z * PEARL_SPOT[2]) / (PEARL_SPOT[0] ** 2 + PEARL_SPOT[2] ** 2)));
  if (Math.hypot(x - PEARL_SPOT[0] * t, z - PEARL_SPOT[2] * t) < 2.6) return false;
  return true;
};

type Item = { x: number; z: number; s: number; ry: number; c: string; sy?: number };

const scatter = (seed: number, count: number, rMin: number, rMax: number, keep: Keep, center: [number, number] = [-4, -14], sMin = 0.6, sMax = 1.4, colors = CORAL_COLORS): Item[] => {
  const r = rng(seed);
  const out: Item[] = [];
  let guard = 0;
  while (out.length < count && guard++ < count * 40) {
    const a = r() * Math.PI * 2;
    const d = rMin + Math.sqrt(r()) * (rMax - rMin);
    const x = center[0] + Math.cos(a) * d;
    const z = center[1] + Math.sin(a) * d;
    if (!keep(x, z)) continue;
    out.push({ x, z, s: sMin + r() * (sMax - sMin), ry: r() * 6.28, c: colors[Math.floor(r() * colors.length)] });
  }
  return out;
};

const Instanced: React.FC<{ geo: THREE.BufferGeometry; mat: THREE.Material; items: Item[]; camPos?: V3; clear?: number; yOff?: number; shadow?: boolean }> = ({ geo, mat, items, camPos, clear = 2.2, yOff = 0, shadow = false }) => {
  const mesh = useMemo(() => {
    const m = new THREE.InstancedMesh(geo, mat, items.length);
    items.forEach((it, i) => m.setColorAt(i, new THREE.Color(it.c)));
    m.frustumCulled = false;
    m.castShadow = shadow;
    m.receiveShadow = true;
    return m;
  }, [geo, mat, items, shadow]);
  const o = new THREE.Object3D();
  items.forEach((it, i) => {
    // anything right in front of the camera shrinks away so it never fills the frame
    const near = camPos ? Math.hypot(it.x - camPos[0], it.z - camPos[2]) : 99;
    const k = Math.max(0, Math.min(1, (near - clear) / 1.5));
    o.position.set(it.x, floorY(it.x, it.z) + yOff, it.z);
    o.rotation.set(0, it.ry, 0);
    o.scale.set(it.s * k, it.s * (it.sy ?? 1) * k, it.s * k);
    o.updateMatrix();
    mesh.setMatrixAt(i, o.matrix);
  });
  mesh.instanceMatrix.needsUpdate = true;
  return <primitive object={mesh} />;
};

export const Reef: React.FC<{ t: number; camPos?: V3 }> = ({ camPos }) => {
  const geos = useMemo(() => ({ b1: branchCoral(3), b2: branchCoral(8), brain: brainCoral(), tube: tubeCoral(5), anem: anemone(7), kelp: kelpClump(9), rock: rockGeo(12, 1) }), []);
  const coralMat = useMat({ color: "#ffffff", roughness: 0.6, emissive: "#301028", emissiveIntensity: 0.25 }, { caustic: 0.8 });
  const brainMat = useMat({ color: "#ffffff", roughness: 0.75, emissive: "#201018", emissiveIntensity: 0.2 }, { caustic: 0.9 });
  const tubeMat = useMat({ color: "#ffffff", roughness: 0.5, side: THREE.DoubleSide, emissive: "#402060", emissiveIntensity: 0.35 }, { caustic: 0.6 });
  const anemMat = useMat({ color: "#ffffff", roughness: 0.5, emissive: "#ff70c0", emissiveIntensity: 0.35 }, { caustic: 0.4, sway: 0.25 });
  const kelpMat = useMat({ color: "#ffffff", roughness: 0.7, side: THREE.DoubleSide, emissive: "#0b3a20", emissiveIntensity: 0.3 }, { caustic: 0.5, sway: 0.18 });
  const rockMat = useMat({ color: "#ffffff", roughness: 0.95, flatShading: true }, { caustic: 1.0 });
  const sets = useMemo(() => {
    const kelpKeep: Keep = (x, z) => clearOf(x, z) && Math.hypot(x - CASTLE[0], z - CASTLE[2]) > 15;
    const near: [number, number] = [-6, -14];
    return {
      b1: scatter(11, 120, 4, 40, clearOf, near, 0.9, 2.2),
      b2: scatter(12, 110, 4, 44, clearOf, near, 0.9, 2.4),
      brain: scatter(13, 70, 4, 42, clearOf, near, 0.35, 0.9, ["#ff9f45", "#ffd166", "#c084fc", "#5ee0a0", "#ff6f91"]),
      tube: scatter(14, 80, 4, 42, clearOf, near, 0.8, 1.8, ["#9b7bff", "#ff7a59", "#3fd0c9", "#ffd166"]),
      anem: scatter(15, 70, 4, 40, clearOf, near, 0.8, 1.6, ["#ff6fd0", "#b47bff", "#ff9fb0", "#7fd8ff"]),
      kelp: scatter(16, 110, 14, 70, kelpKeep, near, 0.8, 1.3, ["#4fbf6a", "#6fd07a", "#3aa58a", "#8fd86a"]).map((k, i) => ({ ...k, sy: 4 + ((i * 37) % 10) * 0.7 })),
      rock: scatter(17, 60, 6, 60, clearOf, near, 0.5, 1.8, ["#8a7ca8", "#7a8aa0", "#9a8a9a", "#6f7f9a"]).map((k) => ({ ...k, sy: 0.6 })),
    };
  }, []);
  return (
    <>
      <Instanced geo={geos.b1} mat={coralMat} items={sets.b1} camPos={camPos} />
      <Instanced geo={geos.b2} mat={coralMat} items={sets.b2} camPos={camPos} />
      <Instanced geo={geos.brain} mat={brainMat} items={sets.brain} camPos={camPos} yOff={0.1} />
      <Instanced geo={geos.tube} mat={tubeMat} items={sets.tube} camPos={camPos} />
      <Instanced geo={geos.anem} mat={anemMat} items={sets.anem} camPos={camPos} />
      <Instanced geo={geos.kelp} mat={kelpMat} items={sets.kelp} camPos={camPos} clear={3.5} />
      <Instanced geo={geos.rock} mat={rockMat} items={sets.rock} camPos={camPos} yOff={-0.2} />
    </>
  );
};

// ---------- the sandy sea floor and the pale stone paths ----------
export const SeaFloor: React.FC = () => {
  const geo = useMemo(() => {
    const g = new THREE.PlaneGeometry(320, 320, 200, 200);
    g.rotateX(-Math.PI / 2);
    g.translate(-6, 0, -14);
    const p = g.attributes.position as THREE.BufferAttribute;
    for (let i = 0; i < p.count; i++) p.setY(i, floorY(p.getX(i), p.getZ(i)));
    g.computeVertexNormals();
    return g;
  }, []);
  const sand = useMat({ color: "#c4a676", roughness: 0.95 }, { caustic: 0.9 });
  const stone = useMat({ color: "#e6cfa8", roughness: 0.7 }, { caustic: 0.7 });
  const stones = useMemo(() => {
    const r = rng(41);
    const out: { x: number; z: number; s: number; ry: number }[] = [];
    // to the castle gate
    for (let z = 3; z > -24; z -= 1.15) out.push({ x: Math.sin(z * 0.3) * 0.35 + (r() - 0.5) * 0.2, z, s: 0.5 + r() * 0.15, ry: r() * 6 });
    // to the garden
    for (let k = 0.18; k < 0.92; k += 0.055) out.push({ x: PEARL_SPOT[0] * k + (r() - 0.5) * 0.3, z: PEARL_SPOT[2] * k + (r() - 0.5) * 0.3, s: 0.45 + r() * 0.15, ry: r() * 6 });
    return out;
  }, []);
  return (
    <>
      <mesh geometry={geo} material={sand} receiveShadow />
      {stones.map((s, i) => (
        <mesh key={i} position={[s.x, 0.02, s.z]} rotation={[0, s.ry, 0]} scale={[s.s, 0.06, s.s * 0.8]} material={stone} receiveShadow>
          <cylinderGeometry args={[1, 1, 1, 10]} />
        </mesh>
      ))}
    </>
  );
};

// ---------- the coral castle ----------
const fluted = (g: THREE.LatheGeometry, ribs: number, depth = 0.05) => {
  const p = g.attributes.position as THREE.BufferAttribute;
  for (let i = 0; i < p.count; i++) {
    const x = p.getX(i), z = p.getZ(i);
    const k = 1 + depth * Math.abs(Math.sin(Math.atan2(z, x) * ribs));
    p.setXYZ(i, x * k, p.getY(i), z * k);
  }
  g.computeVertexNormals();
  return g;
};
const towerProfile = (r: number, h: number): [number, number][] => [
  [0, 0],
  [r * 1.12, 0],
  [r * 1.05, h * 0.06],
  [r * 0.96, h * 0.3],
  [r * 0.92, h * 0.7],
  [r * 0.98, h * 0.9],
  [r * 1.14, h * 0.93],
  [r * 1.14, h * 0.98],
  [r * 0.9, h],
  [0, h],
];
const domeProfile = (r: number, d: number): [number, number][] => {
  const out: [number, number][] = [];
  for (let i = 0; i <= 16; i++) {
    const k = i / 16;
    // an onion dome: bulges out, then draws to a point
    const rad = r * (1 + 0.35 * Math.sin(k * Math.PI * 0.9)) * (1 - Math.pow(k, 1.6));
    out.push([Math.max(0.001, rad), k * d]);
  }
  return out;
};
const spiral = (r: number, h: number, turns = 5) => {
  const g = lathe(
    Array.from({ length: 30 }, (_, i): [number, number] => {
      const k = i / 29;
      return [Math.max(0.001, r * (1 - k) ** 1.2), k * h];
    }),
    36,
  );
  const p = g.attributes.position as THREE.BufferAttribute;
  for (let i = 0; i < p.count; i++) {
    const x = p.getX(i), y = p.getY(i), z = p.getZ(i);
    const a = Math.atan2(z, x);
    const k = 1 + 0.14 * Math.max(0, Math.sin(a - (y / h) * turns * Math.PI * 2)) ** 2;
    p.setXYZ(i, x * k, y, z * k);
  }
  g.computeVertexNormals();
  return g;
};
const scallop = (r: number, ribs = 11) => {
  const g = new THREE.SphereGeometry(r, 48, 16, 0, Math.PI, 0, Math.PI / 2);
  const p = g.attributes.position as THREE.BufferAttribute;
  for (let i = 0; i < p.count; i++) {
    const v = new THREE.Vector3().fromBufferAttribute(p, i);
    const a = Math.atan2(v.z, v.x);
    const k = 1 + 0.07 * Math.abs(Math.sin(a * ribs));
    p.setXYZ(i, v.x * k, v.y * 0.42 * k, v.z * k);
  }
  g.computeVertexNormals();
  return g;
};

const SIDE_TOWERS: { x: number; z: number; r: number; h: number; dome: string; body: string }[] = [
  { x: -7.2, z: 2.6, r: 1.6, h: 8.5, dome: "#4fd8d0", body: "#ffb39a" },
  { x: 7.2, z: 2.6, r: 1.6, h: 8.5, dome: "#b9a0ff", body: "#ffb39a" },
  { x: -5.2, z: -4.5, r: 1.9, h: 11, dome: "#ff8fb8", body: "#ffc7a8" },
  { x: 5.2, z: -4.5, r: 1.9, h: 11, dome: "#5fc8ff", body: "#ffc7a8" },
  { x: -10.5, z: -1, r: 1.1, h: 5.5, dome: "#ffd27a", body: "#ff9fae" },
  { x: 10.5, z: -1, r: 1.1, h: 5.5, dome: "#5ee0a0", body: "#ff9fae" },
];

export const CoralCastle: React.FC<{ t: number; s: SeaState; pearlHome: number }> = ({ t, s, pearlHome }) => {
  const g = useMemo(
    () => ({
      plinth: lathe([[0, 0], [10.5, 0], [10.2, 0.8], [9.4, 1.6], [8.8, 2.0], [0, 2.0]], 48),
      main: fluted(lathe(towerProfile(3.2, 12.5), 96), 12, 0.06),
      mainDome: lathe(domeProfile(3.4, 4.2), 40),
      spire: spiral(1.3, 5.5),
      wall: new THREE.CylinderGeometry(8.6, 8.9, 3.2, 64, 1, true),
      shellBottom: scallop(2.0),
      sideTower: SIDE_TOWERS.map((st) => fluted(lathe(towerProfile(st.r, st.h), 64), 8, 0.07)),
      sideDome: SIDE_TOWERS.map((st) => lathe(domeProfile(st.r * 1.05, st.r * 2.3), 28)),
    }),
    [],
  );
  const coral = useMat({ color: "#ff8fa3", roughness: 0.55, emissive: "#3a1020", emissiveIntensity: 0.3 }, { caustic: 0.9 });
  const rock = useMat({ color: "#f4a58a", roughness: 0.9, flatShading: true }, { caustic: 1.1 });
  const wall = useMat({ color: "#ffd0b8", roughness: 0.7, side: THREE.DoubleSide }, { caustic: 0.9 });
  const pearlWhite = useMat({ color: "#fff4f0", roughness: 0.25, metalness: 0.1, emissive: "#ffe0f0", emissiveIntensity: 0.25 }, { caustic: 0.3 });
  const gold = useMat({ color: "#ffd27a", roughness: 0.3, metalness: 0.6, emissive: "#ffb040", emissiveIntensity: 0.35 }, { caustic: 0.3 });
  const shellMat = useMat({ color: "#ffd6e4", roughness: 0.35, metalness: 0.15, side: THREE.DoubleSide, emissive: "#ff9fc8", emissiveIntensity: 0.25 }, { caustic: 0.4 });
  const sideBodies = useMemo(() => SIDE_TOWERS.map((st) => seaMat({ color: st.body, roughness: 0.6 }, { caustic: 0.9 })), []);
  const sideDomes = useMemo(() => SIDE_TOWERS.map((st) => seaMat({ color: st.dome, roughness: 0.35, metalness: 0.15, emissive: st.dome, emissiveIntensity: 0.18 }, { caustic: 0.5 })), []);
  const glow = colorAt(s, [CASTLE[0], 8, CASTLE[2]]);
  const win = new THREE.Color("#ffc870").multiplyScalar(0.45 + glow * 1.1);
  const pearlsOnWall = 40;
  return (
    <group position={CASTLE}>
      <mesh geometry={g.plinth} material={rock} receiveShadow castShadow />
      {/* the round outer wall with pearls along its top */}
      <mesh geometry={g.wall} material={wall} position={[0, 3.6, 0]} castShadow />
      {Array.from({ length: pearlsOnWall }, (_, i) => {
        const a = (i / pearlsOnWall) * Math.PI * 2;
        return (
          <mesh key={i} position={[Math.cos(a) * 8.75, 5.35, Math.sin(a) * 8.75]} material={pearlWhite}>
            <sphereGeometry args={[0.32, 12, 8]} />
          </mesh>
        );
      })}
      {/* the gate */}
      <mesh position={[0, 3.2, 9.05]}>
        <circleGeometry args={[1.5, 32, 0, Math.PI]} />
        <meshBasicMaterial color={new THREE.Color("#4a7ad8").multiplyScalar(0.5 + glow * 0.7)} />
      </mesh>
      <mesh position={[0, 2.0, 9.05]}>
        <planeGeometry args={[3, 2.4]} />
        <meshBasicMaterial color={new THREE.Color("#4a7ad8").multiplyScalar(0.5 + glow * 0.7)} />
      </mesh>
      <mesh position={[0, 3.2, 9.12]} material={gold}>
        <torusGeometry args={[1.6, 0.16, 10, 40, Math.PI]} />
      </mesh>
      {/* the main tower, its dome and the conch spire */}
      <mesh geometry={g.main} material={coral} position={[0, 2, 0]} castShadow />
      {Array.from({ length: 3 }, (_, row) =>
        Array.from({ length: 6 }, (_, i) => {
          const a = (i / 6) * Math.PI * 2 + row * 0.5 + Math.PI / 2;
          const y = 5.0 + row * 3.0;
          const rr = 3.2 * 0.95 + 0.2;
          return (
            <group key={`${row}-${i}`} position={[Math.cos(a) * rr, y, Math.sin(a) * rr]} rotation={[0, -a + Math.PI / 2, 0]}>
              <mesh position={[0, 0.2, 0]}>
                <circleGeometry args={[0.3, 16, 0, Math.PI]} />
                <meshBasicMaterial color={win} toneMapped={false} />
              </mesh>
              <mesh position={[0, -0.05, 0]}>
                <planeGeometry args={[0.6, 0.5]} />
                <meshBasicMaterial color={win} toneMapped={false} />
              </mesh>
            </group>
          );
        }),
      )}
      <mesh geometry={g.mainDome} material={sideDomes[1]} position={[0, 14.4, 0]} castShadow />
      {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => {
        const a = (i / 8) * Math.PI * 2;
        return (
          <mesh key={i} position={[Math.cos(a) * 3.55, 14.25, Math.sin(a) * 3.55]} material={pearlWhite}>
            <sphereGeometry args={[0.28, 12, 8]} />
          </mesh>
        );
      })}
      <mesh geometry={g.spire} material={shellMat} position={[0, 17.6, -1.2]} rotation={[-0.1, 0, 0]} />
      {/* the open shell on top where the Ocean Pearl belongs */}
      <group position={[SOCKET[0] - CASTLE[0], SOCKET[1] - 1.05, SOCKET[2] - CASTLE[2]]}>
        <mesh geometry={g.shellBottom} material={shellMat} rotation={[Math.PI, 0, 0]} scale={[0.85, 0.85, 0.85]} />
        <mesh geometry={g.shellBottom} material={shellMat} position={[0, 0.1, -0.5]} rotation={[-0.25 - pearlHome * 0.1, Math.PI, 0]} scale={[0.85, 0.85, 0.85]} />
        <Halo position={[0, 1.0, 0.2]} size={6 + glow * 10} color="#bfefff" opacity={0.15 + glow * 0.35} />
      </group>
      {/* the smaller towers */}
      {SIDE_TOWERS.map((st, i) => (
        <group key={i} position={[st.x, 0.8, st.z]}>
          <mesh geometry={g.sideTower[i]} material={sideBodies[i]} castShadow />
          <mesh geometry={g.sideDome[i]} material={sideDomes[i]} position={[0, st.h, 0]} castShadow />
          <mesh position={[0, st.h + st.r * 2.4, 0]} material={pearlWhite}>
            <sphereGeometry args={[st.r * 0.22, 12, 8]} />
          </mesh>
          {[0, 1].map((k) => (
            <mesh key={k} position={[0, st.h * (0.45 + k * 0.28), st.r * 0.94 + 0.02]}>
              <circleGeometry args={[st.r * 0.24, 14]} />
              <meshBasicMaterial color={win} toneMapped={false} />
            </mesh>
          ))}
          <mesh position={[0, st.h * 0.93, 0]} material={gold}>
            <torusGeometry args={[st.r * 1.08, 0.07, 6, 32]} />
          </mesh>
        </group>
      ))}
      <pointLight position={[0, 9, 9]} color="#ffd8b0" intensity={10 + glow * 70} distance={30} decay={1.4} />
    </group>
  );
};

// ---------- fish schools ----------
type School = { c: V3; rx: number; rz: number; h: number; speed: number; n: number; spread: number; colors: string[]; size: number; ph: number };
const SCHOOLS: School[] = [
  { c: [0, 6, -18], rx: 16, rz: 9, h: 2, speed: 0.22, n: 42, spread: 1.6, colors: ["#ffd23f", "#ffe680", "#ffb000"], size: 1.0, ph: 0 },
  { c: [-6, 3.2, -6], rx: 9, rz: 6, h: 1, speed: -0.3, n: 30, spread: 1.2, colors: ["#ff7a59", "#ffffff", "#ff9f45"], size: 0.9, ph: 2 },
  { c: [4, 9, -30], rx: 20, rz: 12, h: 3, speed: 0.17, n: 46, spread: 2.0, colors: ["#5fd8ff", "#9fe8ff", "#3fa0ff"], size: 1.1, ph: 4 },
  { c: [-14, 4.5, -18], rx: 7, rz: 5, h: 1.2, speed: 0.36, n: 26, spread: 1.0, colors: ["#ff6fd0", "#c084fc", "#ffb8e6"], size: 0.8, ph: 1 },
  { c: [10, 4, -10], rx: 8, rz: 7, h: 1.5, speed: -0.26, n: 28, spread: 1.3, colors: ["#5ee0a0", "#ffd166", "#3fd0c9"], size: 0.95, ph: 3 },
];

export const FishSchools: React.FC<{ t: number; happy?: number; camPos?: V3 }> = ({ t, happy = 0, camPos }) => {
  const geo = useMemo(() => fishGeo(), []);
  const mat = useMat({ color: "#ffffff", roughness: 0.35, metalness: 0.2, emissive: "#ffffff", emissiveIntensity: 0.22 }, { caustic: 0.5 });
  const data = useMemo(() => {
    const r = rng(77);
    return SCHOOLS.map((sc) => Array.from({ length: sc.n }, () => ({ o: [(r() - 0.5) * 2, (r() - 0.5) * 1.2, (r() - 0.5) * 2] as V3, ph: r() * 6.28, sz: 0.7 + r() * 0.6, c: sc.colors[Math.floor(r() * sc.colors.length)] })));
  }, []);
  const total = SCHOOLS.reduce((a, s) => a + s.n, 0);
  const mesh = useMemo(() => {
    const m = new THREE.InstancedMesh(geo, mat, total);
    let k = 0;
    data.forEach((fish) => fish.forEach((f) => m.setColorAt(k++, new THREE.Color(f.c))));
    m.frustumCulled = false;
    return m;
  }, [geo, mat, data, total]);
  const o = new THREE.Object3D();
  let k = 0;
  SCHOOLS.forEach((sc, si) => {
    const sp = sc.speed * (1 + happy * 0.6);
    data[si].forEach((f, i) => {
      const a = t * sp + sc.ph + f.o[0] * 0.08;
      const lag = i * 0.004;
      const x = sc.c[0] + Math.cos(a - lag) * (sc.rx + f.o[2] * sc.spread);
      const z = sc.c[2] + Math.sin(a - lag) * (sc.rz + f.o[2] * sc.spread);
      const y = sc.c[1] + Math.sin(a * 2 + sc.ph) * sc.h + f.o[1] * sc.spread + Math.sin(t * 3 + f.ph) * 0.05 + happy * Math.sin(t * 4 + f.ph) * 0.3;
      const vx = -Math.sin(a) * sc.rx * Math.sign(sp);
      const vz = Math.cos(a) * sc.rz * Math.sign(sp);
      const near = camPos ? Math.hypot(x - camPos[0], y - camPos[1], z - camPos[2]) : 99;
      const vis = Math.max(0, Math.min(1, (near - 1.2) / 1.0));
      o.position.set(x + f.o[0] * sc.spread * 0.5, y, z);
      o.rotation.set(0, Math.atan2(vx, vz) + Math.sin(t * 14 + f.ph) * 0.18, 0);
      const s = sc.size * f.sz * vis;
      o.scale.set(s, s, s);
      o.updateMatrix();
      mesh.setMatrixAt(k++, o.matrix);
    });
  });
  mesh.instanceMatrix.needsUpdate = true;
  return <primitive object={mesh} />;
};

// ---------- jellyfish ----------
const JELLY_VERT = /* glsl */ `uniform float uPulse; varying vec3 vN; varying vec3 vV; varying float vY;
void main(){ vec3 p = position; float k = 1.0 + uPulse * (0.12 - p.y * 0.25); p.xz *= k; p.y *= 1.0 - uPulse * 0.12; vY = position.y;
  vec4 mv = modelViewMatrix * vec4(p, 1.0); vN = normalMatrix * normal; vV = -mv.xyz; gl_Position = projectionMatrix * mv; }`;
const JELLY_FRAG = /* glsl */ `uniform vec3 uColor; uniform float uGlow; varying vec3 vN; varying vec3 vV; varying float vY;
void main(){ float f = pow(1.0 - abs(dot(normalize(vN), normalize(vV))), 1.8);
  vec3 c = uColor * (0.35 + f * 1.6) * uGlow + vec3(1.0) * pow(f, 4.0) * 0.4 * uGlow;
  float stripes = 0.8 + 0.2 * sin(atan(vN.z, vN.x) * 8.0);
  gl_FragColor = vec4(c * stripes, 0.28 + f * 0.55); }`;
const TENT_VERT = /* glsl */ `uniform float uT; uniform float uPh; varying float vK;
void main(){ vec3 p = position; float k = -p.y; vK = k; p.x += sin(uT * 2.0 + k * 3.0 + uPh) * 0.12 * k; p.z += cos(uT * 1.6 + k * 2.4 + uPh) * 0.09 * k;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.0); }`;
const TENT_FRAG = /* glsl */ `uniform vec3 uColor; uniform float uGlow; uniform float uLen; varying float vK;
void main(){ gl_FragColor = vec4(uColor * 1.6 * uGlow, (1.0 - vK / uLen) * 0.75); }`;

const JELLIES: { p: V3; s: number; c: string; ph: number }[] = [
  { p: [-6, 7, -22], s: 1.0, c: "#ff8fe0", ph: 0 },
  { p: [7, 9, -24], s: 1.2, c: "#8fb8ff", ph: 1.3 },
  { p: [-11, 12, -30], s: 1.3, c: "#c49bff", ph: 2.1 },
  { p: [12, 13, -38], s: 1.4, c: "#ff8fe0", ph: 3.3 },
  { p: [3, 15, -28], s: 1.0, c: "#7fe8ff", ph: 4.1 },
  { p: [-15, 5, -9], s: 0.7, c: "#7fe8ff", ph: 5.2 },
  { p: [-21, 6.5, -13], s: 0.8, c: "#ff8fe0", ph: 0.7 },
  { p: [-13, 3.4, -18], s: 0.55, c: "#c49bff", ph: 2.7 },
  { p: [5, 4.5, -6], s: 0.6, c: "#8fb8ff", ph: 3.9 },
  { p: [-3, 10, -12], s: 0.9, c: "#ffb8e6", ph: 1.9 },
  { p: [16, 7, -18], s: 1.0, c: "#c49bff", ph: 4.6 },
];

const Jelly: React.FC<{ p: V3; s: number; c: string; ph: number; t: number; glow: number; camPos?: V3 }> = ({ p, s, c, ph, t, glow, camPos }) => {
  const bell = useMemo(() => lathe(Array.from({ length: 14 }, (_, i): [number, number] => {
    const a = (i / 13) * Math.PI * 0.5;
    return [Math.max(0.001, Math.cos(a) * 0.55 * (i === 0 ? 1.05 : 1)), Math.sin(a) * 0.5];
  }).reverse(), 32), []);
  const mats = useMemo(() => {
    const color = new THREE.Color(c);
    const bellM = new THREE.ShaderMaterial({ vertexShader: JELLY_VERT, fragmentShader: JELLY_FRAG, uniforms: { uPulse: { value: 0 }, uColor: { value: color }, uGlow: { value: 1 } }, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, side: THREE.DoubleSide });
    const tents = Array.from({ length: 7 }, (_, i) => new THREE.ShaderMaterial({ vertexShader: TENT_VERT, fragmentShader: TENT_FRAG, uniforms: { uT: { value: 0 }, uPh: { value: ph + i * 0.9 }, uColor: { value: color }, uGlow: { value: 1 }, uLen: { value: 1.6 } }, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending }));
    return { bellM, tents };
  }, [c, ph]);
  const pulse = Math.max(0, Math.sin(t * 2.2 + ph)) ** 2;
  mats.bellM.uniforms.uPulse.value = pulse;
  mats.bellM.uniforms.uGlow.value = glow;
  mats.tents.forEach((m) => {
    m.uniforms.uT.value = t;
    m.uniforms.uGlow.value = glow;
  });
  const y = p[1] + ((t * 0.18 + ph) % 3) * 0.25 + Math.sin(t * 2.2 + ph) * 0.15;
  const near = camPos ? Math.hypot(p[0] - camPos[0], y - camPos[1], p[2] - camPos[2]) : 99;
  if (near < 2.5 * s) return null;
  return (
    <group position={[p[0] + Math.sin(t * 0.3 + ph) * 0.5, y, p[2]]} scale={s}>
      <mesh geometry={bell} material={mats.bellM} />
      <mesh position={[0, 0.18, 0]}>
        <sphereGeometry args={[0.2, 12, 8]} />
        <meshBasicMaterial color={new THREE.Color(c).multiplyScalar(1.4 * glow)} transparent opacity={0.6} toneMapped={false} depthWrite={false} blending={THREE.AdditiveBlending} />
      </mesh>
      {mats.tents.map((m, i) => {
        const a = (i / mats.tents.length) * Math.PI * 2;
        return (
          <mesh key={i} position={[Math.cos(a) * 0.3, 0.02, Math.sin(a) * 0.3]} material={m}>
            <cylinderGeometry args={[0.018, 0.006, 1.6, 4, 16, true]} />
          </mesh>
        );
      })}
      <Halo position={[0, 0.2, 0]} size={2.4} color={c} opacity={0.18 * glow} />
    </group>
  );
};

export const Jellies: React.FC<{ t: number; s: SeaState; sparkle?: number; camPos?: V3 }> = ({ t, s, sparkle = 0, camPos }) => (
  <>
    {JELLIES.map((j, i) => {
      const amt = colorAt(s, j.p);
      const glow = 0.35 + amt * 0.85 + sparkle * (0.5 + 0.5 * Math.sin(t * 9 + i * 2));
      return <Jelly key={i} {...j} t={t} glow={glow} camPos={camPos} />;
    })}
  </>
);

// ---------- the sea garden by the cave: big anemones, giant clams, glowing sea buds ----------
export const SeaGarden: React.FC<{ t: number; camPos?: V3 }> = ({ t, camPos }) => {
  const rockG = useMemo(() => rockGeo(31, 3), []);
  const anemG = useMemo(() => anemone(33), []);
  const clamG = useMemo(() => scallop(1, 9), []);
  const rock = useMat({ color: "#8f86b8", roughness: 0.95, flatShading: true }, { caustic: 1.1 });
  const anem = useMat({ color: "#ff8fd8", roughness: 0.5, emissive: "#ff60c0", emissiveIntensity: 0.45 }, { caustic: 0.3, sway: 0.3 });
  const anem2 = useMat({ color: "#9fb8ff", roughness: 0.5, emissive: "#6080ff", emissiveIntensity: 0.45 }, { caustic: 0.3, sway: 0.3 });
  const clam = useMat({ color: "#c9a8ff", roughness: 0.4, side: THREE.DoubleSide, emissive: "#8060c0", emissiveIntensity: 0.2 }, { caustic: 0.6 });
  const pedestal = useMat({ color: "#e8d8f0", roughness: 0.6 }, { caustic: 1.0 });
  // the cave: a big rock with a dark mouth facing the friends
  const toPlaza = new THREE.Vector2(PLAZA[0] - CAVE[0], PLAZA[2] - CAVE[2]).normalize();
  const yaw = Math.atan2(toPlaza.x, toPlaza.y);
  const buds = useMemo(() => {
    const r = rng(55);
    return Array.from({ length: 50 }, () => {
      const a = r() * Math.PI * 2;
      const d = 2.2 + Math.sqrt(r()) * 5;
      return { x: PEARL_SPOT[0] + Math.cos(a) * d, z: PEARL_SPOT[2] + Math.sin(a) * d, h: 0.25 + r() * 0.5, c: ["#7fe8ff", "#ffb8e6", "#fff1a8", "#b8a8ff"][Math.floor(r() * 4)], ph: r() * 6 };
    }).filter((b) => Math.hypot(b.x - CAVE[0], b.z - CAVE[2]) > 4.2);
  }, []);
  return (
    <>
      <group position={CAVE} rotation={[0, yaw, 0]}>
        <mesh geometry={rockG} material={rock} position={[0, 1.2, -0.8]} scale={[5.2, 4.2, 3.8]} castShadow receiveShadow />
        <mesh geometry={rockG} material={rock} position={[-4.2, 0.3, 0.3]} scale={[2.2, 1.8, 2]} rotation={[0, 1, 0]} />
        <mesh geometry={rockG} material={rock} position={[4.0, 0.2, 0.2]} scale={[2, 2.2, 1.8]} rotation={[0, 2, 0]} />
        {/* the cave mouth */}
        <mesh position={[0, 1.2, 3.75]} rotation={[-0.08, 0, 0]}>
          <circleGeometry args={[1.5, 40, 0, Math.PI]} />
          <meshBasicMaterial color="#081430" />
        </mesh>
        <mesh position={[0, 0.6, 3.75]} rotation={[-0.08, 0, 0]}>
          <planeGeometry args={[3.0, 1.2]} />
          <meshBasicMaterial color="#081430" />
        </mesh>
        {Array.from({ length: 9 }, (_, i) => {
          const a = (i / 8) * Math.PI;
          return <mesh key={i} geometry={rockG} material={rock} position={[Math.cos(a) * 1.85, 1.2 + Math.sin(a) * 1.85 - (i === 0 || i === 8 ? 0.5 : 0), 3.7]} scale={[0.55, 0.55, 0.5]} rotation={[i, i * 2, 0]} />;
        })}
        <mesh position={[0, 1.2, 3.8]} rotation={[-0.08, 0, 0]}>
          <ringGeometry args={[1.5, 1.62, 40, 1, 0, Math.PI]} />
          <meshBasicMaterial color={new THREE.Color("#7fe8ff").multiplyScalar(0.25 + 0.15 * Math.sin(t * 2))} transparent opacity={0.6} toneMapped={false} />
        </mesh>
      </group>
      {/* the rock where the pearl rests */}
      <mesh position={[PEARL_SPOT[0], 0.18, PEARL_SPOT[2]]} material={pedestal} receiveShadow>
        <cylinderGeometry args={[0.55, 0.75, 0.36, 18]} />
      </mesh>
      {[
        [-2.6, -1.2, 1.5, 0],
        [-4.2, -0.2, 1.2, 1],
        [-3.6, 1.8, 1.0, 1],
        [0.2, -4.4, 1.1, 0],
        [-1.4, -3.4, 1.2, 1],
        [1.6, -3.6, 1.0, 0],
      ].map(([dx, dz, s, m], i) => {
        const x = PEARL_SPOT[0] + dx;
        const z = PEARL_SPOT[2] + dz;
        if (camPos && Math.hypot(x - camPos[0], z - camPos[2]) < 2.2) return null;
        return <mesh key={i} geometry={anemG} material={m ? anem2 : anem} position={[x, 0, z]} scale={s} />;
      })}
      {[
        [-3.2, -2.8, 0.9, 0.6],
        [3.4, -2.4, 0.8, 2.4],
      ].map(([dx, dz, s, ry], i) => (
        <group key={i} position={[PEARL_SPOT[0] + dx, 0.05, PEARL_SPOT[2] + dz]} rotation={[0, ry, 0]} scale={s}>
          <mesh geometry={clamG} material={clam} rotation={[Math.PI, 0, 0]} />
          <mesh geometry={clamG} material={clam} rotation={[-0.5 - 0.1 * Math.sin(t * 0.8 + i), Math.PI, 0]} position={[0, 0.02, -0.1]} />
          <mesh position={[0, 0.25, 0.3]}>
            <sphereGeometry args={[0.18, 16, 12]} />
            <meshStandardMaterial color="#fff8f0" emissive="#ffe8f0" emissiveIntensity={0.6} roughness={0.2} />
          </mesh>
        </group>
      ))}
      {buds.map((b, i) => {
        if (camPos && Math.hypot(b.x - camPos[0], b.z - camPos[2]) < 3.2) return null;
        return (
          <group key={i} position={[b.x, 0, b.z]} rotation={[Math.sin(t * 1.1 + b.ph) * 0.12, 0, Math.cos(t * 0.9 + b.ph) * 0.12]}>
            <mesh position={[0, b.h / 2, 0]}>
              <cylinderGeometry args={[0.015, 0.025, b.h, 5]} />
              <meshStandardMaterial color="#3aa58a" />
            </mesh>
            <mesh position={[0, b.h + 0.07, 0]}>
              <sphereGeometry args={[0.09, 10, 8]} />
              <meshBasicMaterial color={new THREE.Color(b.c).multiplyScalar(1.3 + 0.4 * Math.sin(t * 2 + b.ph))} toneMapped={false} />
            </mesh>
          </group>
        );
      })}
      <Bubbles t={t} center={[CAVE[0] + 0.6, 2.4, CAVE[2] + 1.8]} size={[0.8, 14, 0.8]} count={40} seed={61} columns={2} speed={2.4} />
    </>
  );
};

// ---------- the Ocean Pearl ----------
export const OceanPearl: React.FC<{ position: V3; t: number; glow: number; symbol: number; scale?: number; faceYaw?: number }> = ({ position, t, glow, symbol, scale = 1, faceYaw = 0 }) => {
  const moon = useMemo(() => {
    const s = new THREE.Shape();
    s.absarc(0, 0, 0.2, Math.PI * 0.35, Math.PI * 1.65, false);
    s.absarc(0.09, 0, 0.16, Math.PI * 1.75, Math.PI * 0.25, true);
    return new THREE.ShapeGeometry(s, 24);
  }, []);
  return (
    <group position={position} scale={scale}>
      <Halo position={[0, 0, 0]} size={2.6 + glow * 4} color="#ffd8f0" opacity={0.3 + glow * 0.5} />
      <mesh rotation={[0, t * 0.4, 0]}>
        <sphereGeometry args={[0.5, 48, 32]} />
        <meshPhysicalMaterial color="#fff6f4" roughness={0.12} metalness={0.05} clearcoat={1} iridescence={1} iridescenceIOR={1.35} iridescenceThicknessRange={[200, 800]} sheen={1} sheenColor="#ffd0f0" emissive="#ffd8ec" emissiveIntensity={0.25 + glow * 0.9} />
      </mesh>
      {/* the little moon symbol on its face */}
      <group rotation={[0, faceYaw, 0]}>
        <mesh geometry={moon} position={[-0.02, 0.02, 0.505]}>
          <meshBasicMaterial color={new THREE.Color("#6fd8ff").lerp(new THREE.Color("#ffe39a"), symbol * 0.5).multiplyScalar(0.7 + symbol * 3.2)} toneMapped={false} transparent opacity={0.4 + symbol * 0.6} />
        </mesh>
      </group>
      <pointLight color="#ffe0f4" intensity={4 + glow * 30} distance={10} decay={1.5} />
    </group>
  );
};

// ---------- the snowy mountain hologram the seashell shows at the end ----------
const HOLO_VERT = /* glsl */ `varying vec2 vUv; varying vec3 vN; varying vec3 vV;
void main(){ vUv = uv; vec4 mv = modelViewMatrix * vec4(position, 1.0); vN = normalMatrix * normal; vV = -mv.xyz; gl_Position = projectionMatrix * mv; }`;
const HOLO_FRAG = /* glsl */ `uniform float uT; uniform float uOn; varying vec2 vUv; varying vec3 vN; varying vec3 vV;
void main() {
  float f = pow(1.0 - abs(dot(normalize(vN), normalize(vV))), 1.6);
  float lines = 0.75 + 0.25 * sin(vUv.y * 140.0 - uT * 6.0);
  vec3 c = vec3(0.7, 0.88, 1.0) * (0.15 + f * 1.4) * lines;
  gl_FragColor = vec4(c * 1.5, (0.1 + f * 0.65) * uOn);
}`;

export const SnowHologram: React.FC<{ position: V3; t: number; on: number; scale?: number }> = ({ position, t, on, scale = 1 }) => {
  const uniforms = useMemo(() => ({ uT: { value: 0 }, uOn: { value: 0 } }), []);
  uniforms.uT.value = t;
  uniforms.uOn.value = on;
  const flakes = useMemo(() => {
    const r = rng(91);
    return Array.from({ length: 60 }, () => [r() * 3.4 - 1.7, r(), r() * 3.4 - 1.7, r()]);
  }, []);
  const flakeGeo = useMemo(() => {
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.BufferAttribute(new Float32Array(flakes.length * 3), 3));
    return g;
  }, [flakes]);
  const fp = flakeGeo.attributes.position as THREE.BufferAttribute;
  flakes.forEach(([x, y, z, v], i) => {
    const yy = 2.0 - ((y + t * (0.12 + v * 0.1)) % 1) * 2.0;
    fp.setXYZ(i, x * 0.55 + Math.sin(t + i) * 0.05, yy, z * 0.4);
  });
  fp.needsUpdate = true;
  if (on <= 0.001) return null;
  const ice = (k: number) => new THREE.Color("#cfeaff").multiplyScalar(k * on);
  const s = scale * (0.3 + 0.7 * on);
  const peaks: [number, number, number][] = [
    [0, 1.6, 0.62],
    [-0.62, 1.05, 0.48],
    [0.64, 1.2, 0.5],
    [-1.05, 0.7, 0.36],
    [1.05, 0.72, 0.36],
  ];
  return (
    <group position={position} scale={s}>
      <Halo position={[0, 1.0, 0]} size={8} color="#a8d8ff" opacity={0.45 * on} />
      <mesh>
        <sphereGeometry args={[2, 48, 24, 0, Math.PI * 2, 0, Math.PI / 2]} />
        <shaderMaterial vertexShader={HOLO_VERT} fragmentShader={HOLO_FRAG} uniforms={uniforms} transparent depthWrite={false} side={THREE.DoubleSide} blending={THREE.AdditiveBlending} />
      </mesh>
      {peaks.map(([x, h, r], i) => (
        <group key={i} position={[x, 0, -0.15 - (i % 2) * 0.2]}>
          <mesh position={[0, h / 2, 0]}>
            <coneGeometry args={[r, h, 7]} />
            <meshBasicMaterial color={new THREE.Color("#6fa8ff").multiplyScalar(1.1 * on)} transparent opacity={0.75} toneMapped={false} blending={THREE.AdditiveBlending} depthWrite={false} />
          </mesh>
          <mesh position={[0, h * 0.82, 0]}>
            <coneGeometry args={[r * 0.38, h * 0.36, 7]} />
            <meshBasicMaterial color={ice(2.6)} transparent opacity={0.95} toneMapped={false} blending={THREE.AdditiveBlending} depthWrite={false} />
          </mesh>
        </group>
      ))}
      <points geometry={flakeGeo}>
        <pointsMaterial size={0.07} color={ice(3)} transparent opacity={0.95} depthWrite={false} blending={THREE.AdditiveBlending} toneMapped={false} sizeAttenuation />
      </points>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, 0]}>
        <ringGeometry args={[1.95, 2.1, 64]} />
        <meshBasicMaterial color={ice(3)} toneMapped={false} transparent />
      </mesh>
    </group>
  );
};

// ---------- lights ----------
const SeaLights: React.FC<{ vivid: number }> = ({ vivid }) => (
  <>
    <hemisphereLight args={["#8fdcff", "#1d3f70", 0.85]} />
    <directionalLight
      position={[12, 60, 20]}
      intensity={1.5 + vivid * 0.5}
      color="#e8fbff"
      castShadow
      shadow-mapSize={[2048, 2048]}
      shadow-camera-left={-45}
      shadow-camera-right={45}
      shadow-camera-top={45}
      shadow-camera-bottom={-45}
      shadow-camera-near={1}
      shadow-camera-far={140}
      shadow-bias={-0.0006}
    />
    <directionalLight position={[-30, 10, 30]} intensity={0.35} color="#9fd8ff" />
  </>
);

// The whole Underwater Kingdom. s = the color state for this frame.
export const UnderwaterKingdom: React.FC<{ t: number; s: SeaState; camPos?: V3; pearlHome?: number; fishHappy?: number; jellySparkle?: number }> = ({
  t,
  s,
  camPos,
  pearlHome = 0,
  fishHappy = 0,
  jellySparkle = 0,
}) => {
  SEA.uT.value = t;
  SEA.uBase.value = s.base;
  SEA.uWaveR.value = s.waveR;
  SEA.uWaveOn.value = s.waveOn;
  const vivid = colorAt(s, [0, 0, 0]);
  return (
    <>
      <fogExp2 attach="fog" args={[new THREE.Color("#0b4f86").lerp(new THREE.Color("#2c4a68"), 1 - vivid).getStyle(), 0.019]} />
      <WaterDome t={t} vivid={vivid} />
      <SeaLights vivid={vivid} />
      <SeaFloor />
      <Reef t={t} camPos={camPos} />
      <CoralCastle t={t} s={s} pearlHome={pearlHome} />
      <SeaGarden t={t} camPos={camPos} />
      <FishSchools t={t} happy={fishHappy} camPos={camPos} />
      <Jellies t={t} s={s} sparkle={jellySparkle} camPos={camPos} />
      <GodRays t={t} on={0.55 + 0.45 * vivid} />
      <Bubbles t={t} center={[-4, 0, -16]} size={[50, 26, 44]} count={170} seed={5} speed={1.4} />
      <Bubbles t={t} center={[CASTLE[0], 6, CASTLE[2]]} size={[16, 22, 16]} count={50} seed={7} columns={5} speed={2.5} />
      <Motes t={t} center={[-4, 6, -14]} size={[50, 14, 40]} count={320} color="#bff4ff" bright={0.45 + 0.25 * vivid} />
    </>
  );
};
