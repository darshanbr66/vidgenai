import React, { useMemo } from "react";
import "@react-three/fiber";
import * as THREE from "three";
import { rng } from "./World";
import { Halo } from "./sky";

// Magical effects. Every component takes `t` (seconds) and is fully determined by its props.

const PORTAL_FRAG = /* glsl */ `
uniform float uT; uniform float uOpen; varying vec2 vUv;
void main() {
  vec2 p = vUv - 0.5;
  float r = length(p) * 2.0;
  float a = atan(p.y, p.x);
  float swirl = sin(a * 5.0 + r * 9.0 - uT * 4.0) * 0.5 + 0.5;
  float swirl2 = sin(a * 3.0 - r * 14.0 + uT * 2.5) * 0.5 + 0.5;
  vec3 deep = vec3(0.16, 0.12, 0.55);
  vec3 lilac = vec3(0.75, 0.55, 1.0);
  vec3 gold = vec3(1.0, 0.85, 0.45);
  vec3 c = mix(deep, lilac, swirl * (1.0 - r));
  c = mix(c, gold, pow(swirl2, 6.0) * 0.6);
  c += vec3(1.0, 0.95, 0.85) * pow(1.0 - r, 4.0) * 1.8;
  float edge = smoothstep(1.0, 0.86, r);
  gl_FragColor = vec4(c * (0.6 + uOpen * 1.2), edge * uOpen);
}`;
const UV_VERT = /* glsl */ `varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`;

// A round moon portal: swirling disc inside a golden crescent frame. open: 0..1
export const MoonPortal: React.FC<{ position: [number, number, number]; t: number; open: number; size?: number; rotationY?: number }> = ({ position, t, open, size = 2.2, rotationY = 0 }) => {
  const uniforms = useMemo(() => ({ uT: { value: 0 }, uOpen: { value: 0 } }), []);
  uniforms.uT.value = t;
  uniforms.uOpen.value = open;
  const s = Math.max(0.001, open);
  return (
    <group position={position} rotation={[0, rotationY, 0]} scale={[s, s, s]}>
      <Halo position={[0, 0, -0.2]} size={size * 4.5} color="#b9a4ff" opacity={0.8 * open} />
      <mesh>
        <circleGeometry args={[size, 64]} />
        <shaderMaterial vertexShader={UV_VERT} fragmentShader={PORTAL_FRAG} uniforms={uniforms} transparent depthWrite={false} toneMapped={false} side={THREE.DoubleSide} />
      </mesh>
      <mesh rotation={[0, 0, t * 0.6]}>
        <torusGeometry args={[size * 1.02, size * 0.05, 12, 96]} />
        <meshBasicMaterial color={new THREE.Color("#ffe39a").multiplyScalar(2.2)} toneMapped={false} />
      </mesh>
      {/* the crescent frame hugging the left side */}
      <mesh rotation={[0, 0, Math.PI * 0.62]}>
        <torusGeometry args={[size * 1.16, size * 0.11, 16, 96, Math.PI * 1.15]} />
        <meshStandardMaterial color="#ffd36e" emissive="#ffc04a" emissiveIntensity={1.2} metalness={0.6} roughness={0.3} />
      </mesh>
      {Array.from({ length: 10 }, (_, i) => {
        const a = (i / 10) * Math.PI * 2 + t * 0.8;
        return (
          <mesh key={i} position={[Math.cos(a) * size * 1.3, Math.sin(a) * size * 1.3, 0.1]}>
            <octahedronGeometry args={[0.08 + (i % 3) * 0.03, 0]} />
            <meshBasicMaterial color={new THREE.Color(i % 2 ? "#fff1a8" : "#cfe0ff").multiplyScalar(3)} toneMapped={false} />
          </mesh>
        );
      })}
    </group>
  );
};

// The faceted Moon Crystal, with a golden star symbol on its face
export const MoonCrystal: React.FC<{ position: [number, number, number]; t: number; glow: number; scale?: number; star?: number; spin?: number }> = ({
  position,
  t,
  glow,
  scale = 1,
  star = 0,
  spin = 0.6,
}) => {
  const starGeo = useMemo(() => {
    const s = new THREE.Shape();
    for (let i = 0; i < 10; i++) {
      const a = Math.PI / 2 + (i * Math.PI) / 5;
      const r = i % 2 ? 0.11 : 0.26;
      i ? s.lineTo(Math.cos(a) * r, Math.sin(a) * r) : s.moveTo(Math.cos(a) * r, Math.sin(a) * r);
    }
    return new THREE.ShapeGeometry(s);
  }, []);
  return (
    <group position={position} scale={scale}>
      <Halo position={[0, 0, 0]} size={3.2 + glow * 4} color="#a6e6ff" opacity={0.35 + glow * 0.5} />
      <group rotation={[0, t * spin, 0]}>
        <mesh scale={[0.62, 1.15, 0.62]}>
          <octahedronGeometry args={[1, 0]} />
          <meshStandardMaterial color="#d8f6ff" emissive="#7fd8ff" emissiveIntensity={0.5 + glow * 1.6} roughness={0.12} metalness={0.1} flatShading transparent opacity={0.92} />
        </mesh>
        <mesh scale={[0.32, 0.7, 0.32]}>
          <octahedronGeometry args={[1, 0]} />
          <meshBasicMaterial color={new THREE.Color("#ffffff").multiplyScalar(1 + glow * 2.5)} toneMapped={false} />
        </mesh>
      </group>
      {/* the star symbol stays facing forward */}
      <mesh geometry={starGeo} position={[0, 0.05, 0.42]}>
        <meshBasicMaterial color={new THREE.Color("#ffd34f").multiplyScalar(0.8 + star * 3)} toneMapped={false} transparent opacity={0.35 + star * 0.65} />
      </mesh>
      <pointLight color="#9fe2ff" intensity={4 + glow * 30} distance={8} decay={1.5} />
    </group>
  );
};

const BUBBLE_VERT = /* glsl */ `
uniform float uT; uniform float uWob; uniform vec3 uPush;
varying vec3 vN; varying vec3 vV; varying vec3 vP;
void main() {
  vec3 p = position;
  float w = sin(p.y * 4.0 + uT * 9.0) * sin(p.x * 3.0 + uT * 7.0) * uWob;
  float dent = max(dot(normalize(position), normalize(uPush + vec3(0.0001))), 0.0);
  p += normal * (w * 0.12 - pow(dent, 3.0) * length(uPush) * 0.35);
  vP = p;
  vec4 mv = modelViewMatrix * vec4(p, 1.0);
  vN = normalize(normalMatrix * normal);
  vV = normalize(-mv.xyz);
  gl_Position = projectionMatrix * mv;
}`;
const BUBBLE_FRAG = /* glsl */ `
uniform float uT; uniform float uAlpha;
varying vec3 vN; varying vec3 vV; varying vec3 vP;
void main() {
  float f = pow(1.0 - abs(dot(vN, vV)), 2.2);
  float h = vP.y * 1.5 + vP.x * 0.8 + uT * 0.6 + f * 2.0;
  vec3 iri = 0.5 + 0.5 * cos(6.2831 * (h + vec3(0.0, 0.33, 0.67)));
  vec3 c = mix(vec3(0.75, 0.9, 1.0), iri, 0.55) * (0.25 + f * 1.6);
  float spec = pow(max(dot(reflect(-vV, vN), normalize(vec3(-0.5, 0.7, 0.6))), 0.0), 40.0);
  gl_FragColor = vec4(c + spec * 1.5, (0.08 + f * 0.75 + spec) * uAlpha);
}`;

// A shimmering magic bubble. wobble 0..1, push = a dent direction * strength
export const MagicBubble: React.FC<{ position: [number, number, number]; t: number; radius?: number; wobble?: number; push?: [number, number, number]; alpha?: number; scale?: number }> = ({
  position,
  t,
  radius = 1.3,
  wobble = 0.2,
  push = [0, 0, 0],
  alpha = 1,
  scale = 1,
}) => {
  const uniforms = useMemo(() => ({ uT: { value: 0 }, uWob: { value: 0 }, uPush: { value: new THREE.Vector3() }, uAlpha: { value: 1 } }), []);
  uniforms.uT.value = t;
  uniforms.uWob.value = wobble;
  uniforms.uPush.value.set(...push);
  uniforms.uAlpha.value = alpha;
  if (alpha <= 0.001) return null;
  return (
    <mesh position={position} scale={scale}>
      <sphereGeometry args={[radius, 64, 48]} />
      <shaderMaterial vertexShader={BUBBLE_VERT} fragmentShader={BUBBLE_FRAG} uniforms={uniforms} transparent depthWrite={false} toneMapped={false} />
    </mesh>
  );
};

// A big glowing moon flower whose petals open (0..1)
export const MoonFlower: React.FC<{ position: [number, number, number]; t: number; open: number; scale?: number; color?: string; glow?: number }> = ({
  position,
  t,
  open,
  scale = 1,
  color = "#d9b8ff",
  glow = 1,
}) => (
  <group position={position} scale={scale}>
    <mesh position={[0, 0.55, 0]}>
      <cylinderGeometry args={[0.07, 0.11, 1.1, 8]} />
      <meshStandardMaterial color="#5fbf8f" roughness={0.7} />
    </mesh>
    {[-1, 1].map((s) => (
      <mesh key={s} position={[s * 0.35, 0.35, 0]} rotation={[0, 0, s * -0.9]} scale={[0.35, 0.08, 0.18]}>
        <sphereGeometry args={[1, 16, 10]} />
        <meshStandardMaterial color="#6fd09c" roughness={0.7} />
      </mesh>
    ))}
    <group position={[0, 1.15, 0]}>
      {Array.from({ length: 7 }, (_, i) => {
        const a = (i / 7) * Math.PI * 2;
        const tilt = 0.25 + open * 1.05 + Math.sin(t * 1.5 + i) * 0.03;
        return (
          <group key={i} rotation={[0, a, 0]}>
            <group rotation={[tilt, 0, 0]}>
              <mesh position={[0, 0.62, 0]} scale={[0.34, 0.66, 0.1]}>
                <sphereGeometry args={[1, 20, 14]} />
                <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.35 * glow} roughness={0.5} side={THREE.DoubleSide} transparent opacity={0.95} />
              </mesh>
            </group>
          </group>
        );
      })}
      <mesh>
        <sphereGeometry args={[0.22, 16, 12]} />
        <meshBasicMaterial color={new THREE.Color("#fff3b0").multiplyScalar(1 + glow)} toneMapped={false} />
      </mesh>
    </group>
  </group>
);

// A field of small glowing flowers and grass tufts for a garden island
export const GlowGarden: React.FC<{ t: number; radius: number; count?: number; seed?: number; glow?: number; position?: [number, number, number]; clear?: number; camPos?: [number, number, number] }> = ({
  t,
  radius,
  count = 70,
  seed = 11,
  glow = 1,
  position = [0, 0, 0],
  clear = 1.8,
  camPos,
}) => {
  const items = useMemo(() => {
    const r = rng(seed);
    const colors = ["#ffb8e6", "#b8d4ff", "#fff1a8", "#d9b8ff", "#a8ffe0"];
    const out: { x: number; z: number; h: number; c: string; ph: number; s: number }[] = [];
    while (out.length < count) {
      const a = r() * Math.PI * 2;
      const d = Math.sqrt(r()) * radius * 0.92;
      if (d < clear) continue;
      out.push({ x: Math.cos(a) * d, z: Math.sin(a) * d, h: 0.2 + r() * 0.35, c: colors[Math.floor(r() * colors.length)], ph: r() * 6.28, s: 0.45 + r() * 0.4 });
    }
    return out;
  }, [radius, count, seed, clear]);
  return (
    <group position={position}>
      {items.map((it, i) => {
        const near = camPos ? Math.hypot(position[0] + it.x - camPos[0], position[2] + it.z - camPos[2]) : 99;
        if (near < 1.6) return null;
        return (
        <group key={i} position={[it.x, 0, it.z]} rotation={[0, 0, Math.sin(t * 1.3 + it.ph) * 0.08]} scale={it.s * Math.min(1, (near - 1.6) / 1.2)}>
          <mesh position={[0, it.h / 2, 0]}>
            <cylinderGeometry args={[0.02, 0.03, it.h, 5]} />
            <meshStandardMaterial color="#4fae8c" />
          </mesh>
          <mesh position={[0, it.h + 0.08, 0]}>
            <sphereGeometry args={[0.11, 10, 8]} />
            <meshBasicMaterial color={new THREE.Color(it.c).multiplyScalar(0.6 + glow * (1.1 + 0.3 * Math.sin(t * 2 + it.ph)))} toneMapped={false} />
          </mesh>
        </group>
        );
      })}
    </group>
  );
};

const BURST_VERT = /* glsl */ `
attribute vec3 aDir; attribute float aSize; attribute vec3 aColor;
uniform float uAge; uniform float uReach; uniform float uGravity;
varying vec3 vColor; varying float vFade;
void main() {
  float k = 1.0 - pow(1.0 - clamp(uAge, 0.0, 1.0), 3.0);
  vec3 p = aDir * uReach * k + vec3(0.0, -uGravity * uAge * uAge, 0.0);
  vec4 mv = modelViewMatrix * vec4(p, 1.0);
  gl_PointSize = aSize * (1.0 - uAge * 0.6) * (60.0 / -mv.z);
  vFade = 1.0 - smoothstep(0.45, 1.0, uAge);
  vColor = aColor;
  gl_Position = projectionMatrix * mv;
}`;
const BURST_FRAG = /* glsl */ `
varying vec3 vColor; varying float vFade;
void main() {
  vec2 p = gl_PointCoord - 0.5;
  float d = length(p);
  float a = pow(smoothstep(0.5, 0.0, d), 2.0) + max(smoothstep(0.05, 0.0, abs(p.x)), smoothstep(0.05, 0.0, abs(p.y))) * smoothstep(0.5, 0.0, d) * 0.6;
  gl_FragColor = vec4(vColor * 2.5, a * vFade);
}`;

// A burst of sparkles from a point. age 0..1 over its life.
export const SparkleBurst3D: React.FC<{ position: [number, number, number]; age: number; reach?: number; count?: number; seed?: number; size?: number; gravity?: number; colors?: string[] }> = ({
  position,
  age,
  reach = 3,
  count = 120,
  seed = 5,
  size = 7,
  gravity = 0.4,
  colors = ["#fff1a8", "#cfe0ff", "#ffffff", "#ffc8f0"],
}) => {
  const geo = useMemo(() => {
    const r = rng(seed);
    const dir = new Float32Array(count * 3);
    const sz = new Float32Array(count);
    const col = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      const u = r() * 2 - 1;
      const a = r() * Math.PI * 2;
      const s = Math.sqrt(1 - u * u);
      const m = 0.35 + r() * 0.65;
      dir.set([Math.cos(a) * s * m, u * m, Math.sin(a) * s * m], i * 3);
      sz[i] = size * (0.5 + r());
      col.set(new THREE.Color(colors[i % colors.length]).toArray(), i * 3);
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.BufferAttribute(new Float32Array(count * 3), 3));
    g.setAttribute("aDir", new THREE.BufferAttribute(dir, 3));
    g.setAttribute("aSize", new THREE.BufferAttribute(sz, 1));
    g.setAttribute("aColor", new THREE.BufferAttribute(col, 3));
    return g;
  }, [count, seed, size, colors]);
  const uniforms = useMemo(() => ({ uAge: { value: 0 }, uReach: { value: 1 }, uGravity: { value: 0 } }), []);
  uniforms.uAge.value = age;
  uniforms.uReach.value = reach;
  uniforms.uGravity.value = gravity;
  if (age <= 0 || age >= 1) return null;
  return (
    <points geometry={geo} position={position} frustumCulled={false}>
      <shaderMaterial vertexShader={BURST_VERT} fragmentShader={BURST_FRAG} uniforms={uniforms} transparent depthWrite={false} blending={THREE.AdditiveBlending} />
    </points>
  );
};

// Floating motes of light drifting slowly upward in a box around `center`
export const Motes: React.FC<{ t: number; center: [number, number, number]; size: [number, number, number]; count?: number; seed?: number; color?: string; bright?: number }> = ({
  t,
  center,
  size,
  count = 140,
  seed = 9,
  color = "#cfe0ff",
  bright = 1,
}) => {
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
    const y = ((b + t * (0.02 + d * 0.03)) % 1) * size[1];
    pos.setXYZ(i, center[0] + (a - 0.5) * size[0] + Math.sin(t * 0.7 + d * 9) * 0.3, center[1] + y - size[1] / 2, center[2] + (c - 0.5) * size[2]);
  });
  pos.needsUpdate = true;
  return (
    <points geometry={geo} frustumCulled={false}>
      <pointsMaterial size={0.09} color={new THREE.Color(color).multiplyScalar(2 * bright)} transparent opacity={0.9} depthWrite={false} blending={THREE.AdditiveBlending} toneMapped={false} sizeAttenuation />
    </points>
  );
};

// An expanding ring of light, for shockwaves when magic spreads. age 0..1
export const LightRing: React.FC<{ position: [number, number, number]; age: number; radius: number; color?: string; flat?: boolean }> = ({ position, age, radius, color = "#bfe6ff", flat = true }) => {
  if (age <= 0 || age >= 1) return null;
  const r = radius * (1 - Math.pow(1 - age, 2.5));
  return (
    <mesh position={position} rotation={flat ? [Math.PI / 2, 0, 0] : [0, 0, 0]}>
      <torusGeometry args={[Math.max(0.01, r), 0.08 + age * 0.2, 8, 96]} />
      <meshBasicMaterial color={new THREE.Color(color).multiplyScalar(3 * (1 - age))} toneMapped={false} transparent opacity={1 - age} depthWrite={false} blending={THREE.AdditiveBlending} />
    </mesh>
  );
};

const HOLO_FRAG = /* glsl */ `
uniform float uT; uniform float uOn; varying vec2 vUv; varying vec3 vN; varying vec3 vV;
void main() {
  float f = pow(1.0 - abs(dot(normalize(vN), normalize(vV))), 1.6);
  float lines = 0.75 + 0.25 * sin(vUv.y * 140.0 - uT * 6.0);
  vec3 c = vec3(0.35, 0.85, 1.0) * (0.15 + f * 1.4) * lines;
  gl_FragColor = vec4(c * 1.6, (0.12 + f * 0.7) * uOn);
}`;
const HOLO_VERT = /* glsl */ `varying vec2 vUv; varying vec3 vN; varying vec3 vV;
void main(){ vUv = uv; vec4 mv = modelViewMatrix * vec4(position, 1.0); vN = normalMatrix * normal; vV = -mv.xyz; gl_Position = projectionMatrix * mv; }`;

// A glowing hologram of an underwater kingdom inside a dome. on: 0..1
export const OceanHologram: React.FC<{ position: [number, number, number]; t: number; on: number; scale?: number }> = ({ position, t, on, scale = 1 }) => {
  const uniforms = useMemo(() => ({ uT: { value: 0 }, uOn: { value: 0 } }), []);
  uniforms.uT.value = t;
  uniforms.uOn.value = on;
  const wave = useMemo(() => new THREE.PlaneGeometry(3.6, 3.6, 40, 40).rotateX(-Math.PI / 2), []);
  const wp = wave.attributes.position as THREE.BufferAttribute;
  for (let i = 0; i < wp.count; i++) {
    const x = wp.getX(i), z = wp.getZ(i);
    wp.setY(i, 1.9 + Math.sin(x * 2.2 + t * 2) * 0.07 + Math.cos(z * 2.6 + t * 1.6) * 0.06);
  }
  wp.needsUpdate = true;
  if (on <= 0.001) return null;
  const cyan = (k: number) => new THREE.Color("#7fe8ff").multiplyScalar(k * on);
  const s = scale * (0.3 + 0.7 * on);
  return (
    <group position={position} scale={s}>
      <Halo position={[0, 1.2, 0]} size={9} color="#5fd0ff" opacity={0.45 * on} />
      <mesh position={[0, 0, 0]}>
        <sphereGeometry args={[2, 48, 24, 0, Math.PI * 2, 0, Math.PI / 2]} />
        <shaderMaterial vertexShader={HOLO_VERT} fragmentShader={HOLO_FRAG} uniforms={uniforms} transparent depthWrite={false} side={THREE.DoubleSide} blending={THREE.AdditiveBlending} />
      </mesh>
      <mesh geometry={wave} scale={[0.55, 1, 0.55]} position={[0, -0.25, 0]}>
        <meshBasicMaterial color={cyan(1.2)} wireframe transparent opacity={0.55} toneMapped={false} blending={THREE.AdditiveBlending} depthWrite={false} />
      </mesh>
      {/* the coral palace on the sea floor */}
      {[
        [0, 0.65, 0.22],
        [-0.45, 0.42, 0.16],
        [0.45, 0.48, 0.16],
        [-0.8, 0.26, 0.12],
        [0.82, 0.3, 0.12],
      ].map(([x, h, r], i) => (
        <group key={i} position={[x, 0, -0.1]}>
          <mesh position={[0, h / 2, 0]}>
            <cylinderGeometry args={[r * 0.8, r, h, 12]} />
            <meshBasicMaterial color={cyan(1.6)} transparent opacity={0.8} toneMapped={false} blending={THREE.AdditiveBlending} depthWrite={false} />
          </mesh>
          <mesh position={[0, h + r * 0.9, 0]}>
            <coneGeometry args={[r * 1.1, r * 2.2, 12]} />
            <meshBasicMaterial color={new THREE.Color("#ffb8e6").multiplyScalar(1.8 * on)} transparent opacity={0.85} toneMapped={false} blending={THREE.AdditiveBlending} depthWrite={false} />
          </mesh>
        </group>
      ))}
      {/* fish swimming in circles */}
      {Array.from({ length: 5 }, (_, i) => {
        const a = t * (0.9 + i * 0.15) + i * 1.3;
        const rr = 0.8 + i * 0.18;
        return (
          <group key={i} position={[Math.cos(a) * rr, 0.6 + (i % 3) * 0.32 + Math.sin(t * 2 + i) * 0.05, Math.sin(a) * rr * 0.6]} rotation={[0, -a, 0]}>
            <mesh scale={[0.06, 0.07, 0.15]}>
              <sphereGeometry args={[1, 12, 8]} />
              <meshBasicMaterial color={new THREE.Color(i % 2 ? "#fff1a8" : "#ffb8e6").multiplyScalar(2 * on)} toneMapped={false} />
            </mesh>
            <mesh position={[0, 0, -0.17]} rotation={[Math.PI / 2, 0, 0]} scale={[0.07, 0.06, 0.07]}>
              <coneGeometry args={[1, 1, 3]} />
              <meshBasicMaterial color={new THREE.Color(i % 2 ? "#fff1a8" : "#ffb8e6").multiplyScalar(2 * on)} toneMapped={false} />
            </mesh>
          </group>
        );
      })}
      {/* rising bubbles */}
      {Array.from({ length: 14 }, (_, i) => {
        const y = ((t * 0.35 + i * 0.137) % 1) * 1.8;
        return (
          <mesh key={i} position={[Math.sin(i * 2.7) * 1.2, y, Math.cos(i * 1.9) * 0.6]}>
            <sphereGeometry args={[0.03 + (i % 3) * 0.015, 8, 6]} />
            <meshBasicMaterial color={cyan(2.4)} toneMapped={false} transparent opacity={1 - y / 1.8} />
          </mesh>
        );
      })}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, 0]}>
        <ringGeometry args={[1.95, 2.1, 64]} />
        <meshBasicMaterial color={cyan(3)} toneMapped={false} transparent />
      </mesh>
    </group>
  );
};
