import React, { useMemo } from "react";
import "@react-three/fiber";
import * as THREE from "three";
import { rng } from "./World";

// Sky, stars, moon and the sea of clouds. `t` is the time in seconds (frame / fps).

const SKY_VERT = /* glsl */ `
varying vec3 vDir;
void main() {
  vDir = normalize(position);
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}`;
const SKY_FRAG = /* glsl */ `
uniform vec3 uTop; uniform vec3 uMid; uniform vec3 uLow; uniform vec3 uMoonDir; uniform vec3 uMoonTint; uniform float uT;
varying vec3 vDir;
float hash(vec3 p){ p = fract(p * 0.3183099 + 0.1); p *= 17.0; return fract(p.x * p.y * p.z * (p.x + p.y + p.z)); }
float noise(vec3 x){ vec3 i = floor(x); vec3 f = fract(x); f = f*f*(3.0-2.0*f);
  return mix(mix(mix(hash(i+vec3(0,0,0)),hash(i+vec3(1,0,0)),f.x), mix(hash(i+vec3(0,1,0)),hash(i+vec3(1,1,0)),f.x),f.y),
             mix(mix(hash(i+vec3(0,0,1)),hash(i+vec3(1,0,1)),f.x), mix(hash(i+vec3(0,1,1)),hash(i+vec3(1,1,1)),f.x),f.y), f.z); }
void main() {
  float h = vDir.y;
  vec3 c = mix(uLow, uMid, smoothstep(-0.15, 0.18, h));
  c = mix(c, uTop, smoothstep(0.18, 0.75, h));
  // soft painted nebula bands
  float n = noise(vDir * 3.0 + vec3(uT * 0.01, 0.0, 0.0)) * 0.6 + noise(vDir * 7.0) * 0.4;
  c += vec3(0.16, 0.08, 0.22) * smoothstep(0.55, 0.9, n) * smoothstep(-0.1, 0.5, h);
  // glow around the moon
  float m = max(dot(vDir, uMoonDir), 0.0);
  c += uMoonTint * (pow(m, 24.0) * 0.55 + pow(m, 5.0) * 0.18);
  gl_FragColor = vec4(c, 1.0);
}`;

export const SkyDome: React.FC<{ t: number; top?: string; mid?: string; low?: string; moonDir?: [number, number, number]; moonTint?: string }> = ({
  t,
  top = "#0b1446",
  mid = "#2b2f86",
  low = "#8a6cc8",
  moonDir = [0.05, 0.35, -1],
  moonTint = "#bcd2ff",
}) => {
  const uniforms = useMemo(
    () => ({
      uTop: { value: new THREE.Color(top) },
      uMid: { value: new THREE.Color(mid) },
      uLow: { value: new THREE.Color(low) },
      uMoonDir: { value: new THREE.Vector3(...moonDir).normalize() },
      uMoonTint: { value: new THREE.Color(moonTint) },
      uT: { value: 0 },
    }),
    [top, mid, low, moonDir, moonTint],
  );
  uniforms.uT.value = t;
  return (
    <mesh renderOrder={-10}>
      <sphereGeometry args={[480, 48, 32]} />
      <shaderMaterial vertexShader={SKY_VERT} fragmentShader={SKY_FRAG} uniforms={uniforms} side={THREE.BackSide} depthWrite={false} fog={false} />
    </mesh>
  );
};

const STAR_VERT = /* glsl */ `
attribute float aSize; attribute float aPhase; attribute vec3 aColor;
uniform float uT; uniform float uBright;
varying vec3 vColor; varying float vTw;
void main() {
  vTw = (0.55 + 0.45 * sin(uT * (1.2 + aPhase * 2.5) + aPhase * 40.0)) * uBright;
  vColor = aColor;
  vec4 mv = modelViewMatrix * vec4(position, 1.0);
  gl_PointSize = aSize;
  gl_Position = projectionMatrix * mv;
}`;
const STAR_FRAG = /* glsl */ `
varying vec3 vColor; varying float vTw;
void main() {
  vec2 p = gl_PointCoord - 0.5;
  float d = length(p);
  float core = smoothstep(0.5, 0.0, d);
  float cross = max(smoothstep(0.06, 0.0, abs(p.x)), smoothstep(0.06, 0.0, abs(p.y))) * smoothstep(0.5, 0.1, d);
  float a = pow(core, 3.0) + cross * 0.5;
  gl_FragColor = vec4(vColor * vTw * 1.6, a);
}`;

// Thousands of twinkling stars on the sky dome
export const Stars: React.FC<{ t: number; count?: number; seed?: number; bright?: number; radius?: number }> = ({ t, count = 2600, seed = 7, bright = 1, radius = 420 }) => {
  const geo = useMemo(() => {
    const r = rng(seed);
    const pos = new Float32Array(count * 3);
    const size = new Float32Array(count);
    const phase = new Float32Array(count);
    const col = new Float32Array(count * 3);
    const palette = [new THREE.Color("#ffffff"), new THREE.Color("#fff1b8"), new THREE.Color("#cfe0ff"), new THREE.Color("#ffd6f4")];
    for (let i = 0; i < count; i++) {
      const u = r() * 2 - 1;
      const y = 0.97 * Math.abs(u) - 0.12;
      const a = r() * Math.PI * 2;
      const s = Math.sqrt(1 - y * y);
      pos.set([Math.cos(a) * s * radius, y * radius, Math.sin(a) * s * radius], i * 3);
      const big = r() < 0.06;
      size[i] = big ? 9 + r() * 9 : 2.5 + r() * 4.5;
      phase[i] = r();
      col.set(palette[Math.floor(r() * palette.length)].toArray(), i * 3);
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.BufferAttribute(pos, 3));
    g.setAttribute("aSize", new THREE.BufferAttribute(size, 1));
    g.setAttribute("aPhase", new THREE.BufferAttribute(phase, 1));
    g.setAttribute("aColor", new THREE.BufferAttribute(col, 3));
    return g;
  }, [count, seed, radius]);
  const uniforms = useMemo(() => ({ uT: { value: 0 }, uBright: { value: 1 } }), []);
  uniforms.uT.value = t;
  uniforms.uBright.value = bright;
  return (
    <points geometry={geo} renderOrder={-9} frustumCulled={false}>
      <shaderMaterial vertexShader={STAR_VERT} fragmentShader={STAR_FRAG} uniforms={uniforms} transparent depthWrite={false} blending={THREE.AdditiveBlending} fog={false} />
    </points>
  );
};

const MOON_FRAG = /* glsl */ `
uniform float uGlow; varying vec3 vN; varying vec3 vP;
float hash(vec3 p){ p = fract(p * 0.3183099 + 0.1); p *= 17.0; return fract(p.x * p.y * p.z * (p.x + p.y + p.z)); }
float noise(vec3 x){ vec3 i = floor(x); vec3 f = fract(x); f = f*f*(3.0-2.0*f);
  return mix(mix(mix(hash(i+vec3(0,0,0)),hash(i+vec3(1,0,0)),f.x), mix(hash(i+vec3(0,1,0)),hash(i+vec3(1,1,0)),f.x),f.y),
             mix(mix(hash(i+vec3(0,0,1)),hash(i+vec3(1,0,1)),f.x), mix(hash(i+vec3(0,1,1)),hash(i+vec3(1,1,1)),f.x),f.y), f.z); }
void main() {
  vec3 n = normalize(vN);
  float m = noise(vP * 1.6) * 0.6 + noise(vP * 4.0) * 0.3 + noise(vP * 9.0) * 0.1;
  vec3 base = mix(vec3(1.0, 0.97, 0.86), vec3(0.78, 0.8, 0.95), smoothstep(0.45, 0.75, m));
  float rim = pow(1.0 - abs(n.z), 2.0);
  gl_FragColor = vec4(base * (uGlow + rim * 0.4), 1.0);
}`;
const MOON_VERT = /* glsl */ `
varying vec3 vN; varying vec3 vP;
void main() { vN = normalMatrix * normal; vP = position / 10.0; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`;

// A soft glowing disc that always faces the camera, for halos and light blooms
export const Halo: React.FC<{ position: [number, number, number]; size: number; color: string; opacity?: number }> = ({ position, size, color, opacity = 1 }) => {
  const tex = useMemo(() => {
    const c = document.createElement("canvas");
    c.width = c.height = 128;
    const x = c.getContext("2d")!;
    const g = x.createRadialGradient(64, 64, 0, 64, 64, 64);
    g.addColorStop(0, "rgba(255,255,255,1)");
    g.addColorStop(0.25, "rgba(255,255,255,0.45)");
    g.addColorStop(0.6, "rgba(255,255,255,0.1)");
    g.addColorStop(1, "rgba(255,255,255,0)");
    x.fillStyle = g;
    x.fillRect(0, 0, 128, 128);
    return new THREE.CanvasTexture(c);
  }, []);
  return (
    <sprite position={position} scale={[size, size, 1]}>
      <spriteMaterial map={tex} color={color} opacity={opacity} transparent depthWrite={false} blending={THREE.AdditiveBlending} fog={false} />
    </sprite>
  );
};

export const Moon: React.FC<{ position: [number, number, number]; radius?: number; glow?: number }> = ({ position, radius = 40, glow = 1.6 }) => {
  const uniforms = useMemo(() => ({ uGlow: { value: glow } }), []);
  uniforms.uGlow.value = glow;
  return (
    <group position={position}>
      <Halo position={[0, 0, -2]} size={radius * 6} color="#a9c4ff" opacity={0.55} />
      <mesh>
        <sphereGeometry args={[radius, 64, 48]} />
        <shaderMaterial vertexShader={MOON_VERT} fragmentShader={MOON_FRAG} uniforms={uniforms} fog={false} />
      </mesh>
    </group>
  );
};

// A sea of soft clouds below the floating world
export const CloudSea: React.FC<{ t: number; y?: number; inner?: number; outer?: number; count?: number; seed?: number; color?: string; center?: [number, number] }> = ({
  t,
  y = -12,
  inner = 6,
  outer = 140,
  count = 320,
  seed = 3,
  color = "#d9d2ff",
  center = [0, -20],
}) => {
  const puffs = useMemo(() => {
    const r = rng(seed);
    return Array.from({ length: count }, () => {
      const a = r() * Math.PI * 2;
      const d = inner + Math.sqrt(r()) * (outer - inner);
      return { x: center[0] + Math.cos(a) * d, z: center[1] + Math.sin(a) * d, y: y + (r() - 0.5) * 3, s: 3 + r() * 6 + d * 0.04, sq: 0.45 + r() * 0.2, ph: r() * 6.28 };
    });
  }, [count, seed, inner, outer, y, center]);
  const mesh = useMemo(() => {
    const m = new THREE.InstancedMesh(new THREE.SphereGeometry(1, 20, 14), new THREE.MeshStandardMaterial({ color, roughness: 1, metalness: 0, emissive: new THREE.Color("#3b3277"), emissiveIntensity: 0.35 }), count);
    m.frustumCulled = false;
    return m;
  }, [count, color]);
  const o = new THREE.Object3D();
  puffs.forEach((p, i) => {
    o.position.set(p.x + Math.sin(t * 0.05 + p.ph) * 1.5, p.y + Math.sin(t * 0.3 + p.ph) * 0.25, p.z);
    o.scale.set(p.s, p.s * p.sq, p.s);
    o.updateMatrix();
    mesh.setMatrixAt(i, o.matrix);
  });
  mesh.instanceMatrix.needsUpdate = true;
  return <primitive object={mesh} />;
};

// Low-poly floating island: grassy top at y=0 (local), rocky underside, glowing crystals
export const FloatingIsland: React.FC<{
  position: [number, number, number];
  radius: number;
  seed?: number;
  t: number;
  bob?: number;
  grass?: string;
  rock?: string;
  crystals?: number;
  crystalColor?: string;
  glow?: number;
}> = ({ position, radius, seed = 1, t, bob = 0.15, grass = "#8fe0b0", rock = "#7c6cc4", crystals = 5, crystalColor = "#9fe8ff", glow = 1 }) => {
  const { under, top, gems } = useMemo(() => {
    const r = rng(seed);
    const under = new THREE.ConeGeometry(radius * 0.98, radius * 1.4, 14, 5, true);
    under.rotateX(Math.PI);
    under.translate(0, -radius * 0.7 - 0.35, 0);
    const p = under.attributes.position as THREE.BufferAttribute;
    for (let i = 0; i < p.count; i++) {
      const vy = p.getY(i);
      const k = 0.18 * radius * (r() - 0.5) * Math.min(1, -vy / radius);
      p.setXYZ(i, p.getX(i) + k, vy + (r() - 0.5) * 0.3, p.getZ(i) + k * 0.8);
    }
    under.computeVertexNormals();
    const top = new THREE.CylinderGeometry(radius, radius * 0.98, 0.7, 40, 1);
    top.translate(0, -0.35, 0);
    const gems = Array.from({ length: crystals }, () => {
      const a = r() * Math.PI * 2;
      const d = radius * (0.25 + r() * 0.5);
      const depth = 0.6 + r() * radius * 0.6;
      return { x: Math.cos(a) * d, z: Math.sin(a) * d, y: -depth, s: 0.3 + r() * 0.5, rz: (r() - 0.5) * 0.6, ph: r() * 6 };
    });
    return { under, top, gems };
  }, [radius, seed, crystals]);
  const dy = Math.sin(t * 0.6 + seed) * bob;
  return (
    <group position={[position[0], position[1] + dy, position[2]]}>
      <mesh geometry={top} receiveShadow castShadow>
        <meshStandardMaterial color={grass} roughness={0.85} />
      </mesh>
      <mesh geometry={under} castShadow>
        <meshStandardMaterial color={rock} roughness={0.9} flatShading />
      </mesh>
      {gems.map((g, i) => (
        <mesh key={i} position={[g.x, g.y, g.z]} rotation={[Math.PI, 0, g.rz]} scale={[g.s, g.s * 2.2, g.s]}>
          <octahedronGeometry args={[1, 0]} />
          <meshStandardMaterial color={crystalColor} emissive={crystalColor} emissiveIntensity={(0.9 + 0.3 * Math.sin(t * 2 + g.ph)) * glow} roughness={0.3} flatShading />
        </mesh>
      ))}
    </group>
  );
};
