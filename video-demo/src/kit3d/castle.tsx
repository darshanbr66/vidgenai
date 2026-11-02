import React, { useMemo } from "react";
import "@react-three/fiber";
import * as THREE from "three";

// The silver Moon Castle and glowing bridges, built from simple solids.
// `lightAt(d)` returns how lit (0..1+) something is at distance d from the castle's crown,
// so a restoration can spread outward as a wave.

export type LightAt = (d: number) => number;

const WALL = "#e2e6fb";
const ROOF = "#5f69d6";
const GOLD = "#ffd36e";
const WARM = new THREE.Color("#ffc773");
const COOL = new THREE.Color("#9fdcff");

export const CROWN_Y = 25.6; // height of the crystal socket above the castle's ground

const archShape = (() => {
  const s = new THREE.Shape();
  s.moveTo(-0.5, -0.7);
  s.lineTo(0.5, -0.7);
  s.lineTo(0.5, 0.2);
  s.absarc(0, 0.2, 0.5, 0, Math.PI, false);
  s.lineTo(-0.5, -0.7);
  return s;
})();

type Win = { p: THREE.Vector3; ry: number; s: number; d: number };

const crescentShape = (r: number, cut: number) => {
  const s = new THREE.Shape();
  s.absarc(0, 0, r, Math.PI * 0.15, Math.PI * 1.85, false);
  s.absarc(cut, 0, r * 0.82, Math.PI * 1.75, Math.PI * 0.25, true);
  return s;
};

export const Crescent: React.FC<{ position: [number, number, number]; r: number; color?: string; glow?: number; rotation?: [number, number, number] }> = ({
  position,
  r,
  color = GOLD,
  glow = 0.6,
  rotation = [0, 0, Math.PI / 2],
}) => {
  const geo = useMemo(() => new THREE.ExtrudeGeometry(crescentShape(r, r * 0.45), { depth: r * 0.25, bevelEnabled: true, bevelSize: r * 0.06, bevelThickness: r * 0.06, bevelSegments: 2, curveSegments: 24 }), [r]);
  return (
    <mesh geometry={geo} position={position} rotation={rotation}>
      <meshStandardMaterial color={color} emissive={color} emissiveIntensity={glow} metalness={0.6} roughness={0.3} />
    </mesh>
  );
};

type Tower = { x: number; z: number; r: number; h: number; roofH: number; finial: "ball" | "moon"; tier?: boolean };

const TOWERS: Tower[] = (() => {
  const t: Tower[] = [];
  for (let i = 0; i < 8; i++) {
    const a = (i / 8) * Math.PI * 2 + Math.PI / 8;
    t.push({ x: Math.sin(a) * 8.6, z: Math.cos(a) * 8.6, r: 0.95, h: 6.4, roofH: 3, finial: "ball" });
  }
  for (let i = 0; i < 4; i++) {
    const a = (i / 4) * Math.PI * 2 + Math.PI / 4;
    t.push({ x: Math.sin(a) * 4.6, z: Math.cos(a) * 4.6, r: 1.35, h: 11 + (i % 2) * 2, roofH: 4.6, finial: "moon" });
  }
  return t;
})();

export const MoonCastle: React.FC<{ position: [number, number, number]; t: number; lightAt: LightAt; rotationY?: number }> = ({ position, t, lightAt, rotationY = 0 }) => {
  const crown = new THREE.Vector3(0, CROWN_Y, 0);
  const { windows, wallGeo, crenels } = useMemo(() => {
    const windows: Win[] = [];
    const add = (x: number, y: number, z: number, r: number, a: number, s: number) => {
      const p = new THREE.Vector3(x + Math.sin(a) * (r + 0.03), y, z + Math.cos(a) * (r + 0.03));
      windows.push({ p, ry: a, s, d: p.distanceTo(new THREE.Vector3(0, CROWN_Y, 0)) });
    };
    TOWERS.forEach((tw, i) => {
      const levels = tw.h > 8 ? [tw.h * 0.45, tw.h * 0.75] : [tw.h * 0.6];
      levels.forEach((y, k) => {
        for (let j = 0; j < 3; j++) add(tw.x, y, tw.z, tw.r, Math.atan2(tw.x, tw.z) + (j - 1) * 0.9 + k * 0.4 + i, tw.r * 0.32);
      });
    });
    // the keep
    for (let j = 0; j < 8; j++) {
      const a = (j / 8) * Math.PI * 2;
      add(0, 5.4, 0, 3.1, a, 0.75);
      add(0, 12.4, 0, 2.3, a + 0.4, 0.6);
      if (j % 2 === 0) add(0, 18, 0, 1.5, a + 0.2, 0.42);
    }
    // the outer wall: 8 segments between the corner towers
    const wallGeo: { x: number; z: number; ry: number; len: number }[] = [];
    const crenels: { x: number; z: number; ry: number }[] = [];
    for (let i = 0; i < 8; i++) {
      const a0 = (i / 8) * Math.PI * 2 + Math.PI / 8;
      const a1 = ((i + 1) / 8) * Math.PI * 2 + Math.PI / 8;
      const x0 = Math.sin(a0) * 8.6, z0 = Math.cos(a0) * 8.6, x1 = Math.sin(a1) * 8.6, z1 = Math.cos(a1) * 8.6;
      const len = Math.hypot(x1 - x0, z1 - z0);
      const ry = Math.atan2(x1 - x0, z1 - z0) + Math.PI / 2;
      wallGeo.push({ x: (x0 + x1) / 2, z: (z0 + z1) / 2, ry, len });
      for (let k = 1; k < 6; k++) {
        const u = k / 6;
        crenels.push({ x: x0 + (x1 - x0) * u, z: z0 + (z1 - z0) * u, ry });
      }
      // two windows per wall segment, but not on the gate wall facing +z
      if (i !== 7 && i !== 0) {
        const mx = (x0 + x1) / 2, mz = (z0 + z1) / 2;
        const out = Math.atan2(mx, mz);
        [-0.28, 0.28].forEach((u) => {
          const px = mx + (x1 - x0) * u, pz = mz + (z1 - z0) * u;
          windows.push({ p: new THREE.Vector3(px + Math.sin(out) * 0.45, 2.2, pz + Math.cos(out) * 0.45), ry: out, s: 0.38, d: Math.hypot(px, 2.2 - CROWN_Y, pz) });
        });
      }
    }
    return { windows, wallGeo, crenels };
  }, []);

  const winMesh = useMemo(() => {
    const m = new THREE.InstancedMesh(new THREE.ShapeGeometry(archShape, 12), new THREE.MeshBasicMaterial({ toneMapped: false, side: THREE.DoubleSide }), windows.length);
    const o = new THREE.Object3D();
    windows.forEach((w, i) => {
      o.position.copy(w.p);
      o.rotation.set(0, w.ry, 0);
      o.scale.setScalar(w.s);
      o.updateMatrix();
      m.setMatrixAt(i, o.matrix);
      m.setColorAt(i, new THREE.Color());
    });
    m.frustumCulled = false;
    return m;
  }, [windows]);
  const col = new THREE.Color();
  windows.forEach((w, i) => {
    const l = lightAt(w.d);
    const flick = 1 + 0.06 * Math.sin(t * 3 + i * 1.7);
    col.copy(WARM).multiplyScalar(0.08 + l * 2.4 * flick);
    winMesh.setColorAt(i, col);
  });
  if (winMesh.instanceColor) winMesh.instanceColor.needsUpdate = true;

  const crownLight = lightAt(0);
  const finialGlow = (x: number, y: number, z: number) => 0.15 + lightAt(crown.distanceTo(new THREE.Vector3(x, y, z))) * 1.4;

  return (
    <group position={position} rotation={[0, rotationY, 0]}>
      {/* outer wall with crenellations */}
      {wallGeo.map((w, i) => (
        <mesh key={i} position={[w.x, 1.8, w.z]} rotation={[0, w.ry, 0]} castShadow receiveShadow>
          <boxGeometry args={[w.len, 3.6, 0.8]} />
          <meshStandardMaterial color={WALL} roughness={0.55} metalness={0.15} />
        </mesh>
      ))}
      {crenels.map((c, i) => (
        <mesh key={i} position={[c.x, 3.85, c.z]} rotation={[0, c.ry, 0]} castShadow>
          <boxGeometry args={[0.55, 0.6, 0.9]} />
          <meshStandardMaterial color={WALL} roughness={0.55} metalness={0.15} />
        </mesh>
      ))}
      {/* the gate */}
      <mesh position={[0, 1.5, 8.62]}>
        <shapeGeometry args={[archShape, 12]} />
        <meshBasicMaterial color={WARM.clone().multiplyScalar(0.15 + lightAt(CROWN_Y) * 1.6)} toneMapped={false} side={THREE.DoubleSide} />
      </mesh>
      {/* towers */}
      {TOWERS.map((tw, i) => (
        <group key={i} position={[tw.x, 0, tw.z]}>
          <mesh position={[0, tw.h / 2, 0]} castShadow receiveShadow>
            <cylinderGeometry args={[tw.r, tw.r * 1.08, tw.h, 28]} />
            <meshStandardMaterial color={WALL} roughness={0.5} metalness={0.2} />
          </mesh>
          <mesh position={[0, tw.h + 0.12, 0]}>
            <cylinderGeometry args={[tw.r * 1.22, tw.r * 1.22, 0.3, 28]} />
            <meshStandardMaterial color={GOLD} metalness={0.6} roughness={0.35} emissive={GOLD} emissiveIntensity={0.15} />
          </mesh>
          <mesh position={[0, tw.h + 0.27 + tw.roofH / 2, 0]} castShadow>
            <coneGeometry args={[tw.r * 1.3, tw.roofH, 28]} />
            <meshStandardMaterial color={ROOF} roughness={0.35} metalness={0.35} />
          </mesh>
          {tw.finial === "ball" ? (
            <mesh position={[0, tw.h + tw.roofH + 0.45, 0]}>
              <sphereGeometry args={[0.22, 16, 12]} />
              <meshStandardMaterial color={GOLD} emissive={GOLD} emissiveIntensity={finialGlow(tw.x, tw.h + tw.roofH, tw.z)} />
            </mesh>
          ) : (
            <Crescent position={[0, tw.h + tw.roofH + 0.9, 0]} r={0.6} glow={finialGlow(tw.x, tw.h + tw.roofH, tw.z)} rotation={[0, Math.atan2(tw.x, tw.z), Math.PI / 2]} />
          )}
        </group>
      ))}
      {/* the keep, in three tiers, with balconies */}
      <mesh position={[0, 4.5, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[3.1, 3.3, 9, 40]} />
        <meshStandardMaterial color={WALL} roughness={0.5} metalness={0.2} />
      </mesh>
      <mesh position={[0, 12.5, 0]} castShadow>
        <cylinderGeometry args={[2.3, 2.5, 7, 40]} />
        <meshStandardMaterial color={WALL} roughness={0.5} metalness={0.2} />
      </mesh>
      <mesh position={[0, 18, 0]} castShadow>
        <cylinderGeometry args={[1.5, 1.6, 4, 32]} />
        <meshStandardMaterial color={WALL} roughness={0.5} metalness={0.2} />
      </mesh>
      {[9.1, 16.1, 20.1].map((y, i) => (
        <mesh key={i} position={[0, y, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[[3.5, 2.7, 1.8][i], 0.16, 10, 48]} />
          <meshStandardMaterial color={GOLD} metalness={0.6} roughness={0.3} emissive={GOLD} emissiveIntensity={0.1 + lightAt(Math.abs(CROWN_Y - y)) * 0.9} />
        </mesh>
      ))}
      <mesh position={[0, 22.2, 0]} castShadow>
        <coneGeometry args={[1.9, 4.4, 32]} />
        <meshStandardMaterial color={ROOF} roughness={0.35} metalness={0.35} />
      </mesh>
      {/* the crescent cradle that holds the Moon Crystal */}
      <Crescent position={[0, CROWN_Y - 0.3, -0.15]} r={1.5} glow={0.3 + crownLight * 1.2} rotation={[0, 0, -Math.PI / 2]} />
      <pointLight position={[0, CROWN_Y, 1.5]} color={COOL} intensity={crownLight * 120} distance={40} decay={1.6} />
      <pointLight position={[0, 6, 10]} color={WARM} intensity={10 + lightAt(CROWN_Y) * 80} distance={22} decay={1.6} />
      <primitive object={winMesh} />
    </group>
  );
};

// An arched bridge from a to b with glowing lamp posts. Lamps light up with lightAt(distance to `from`).
export const Bridge: React.FC<{ a: [number, number, number]; b: [number, number, number]; arch?: number; width?: number; lamps?: number; lightAt: LightAt; lightOrigin?: [number, number, number] }> = ({
  a,
  b,
  arch = 1.6,
  width = 2.2,
  lamps = 6,
  lightAt,
  lightOrigin = [0, CROWN_Y, -34],
}) => {
  const { curve, planks, posts, rails } = useMemo(() => {
    const A = new THREE.Vector3(...a), B = new THREE.Vector3(...b);
    const M = A.clone().lerp(B, 0.5).add(new THREE.Vector3(0, arch, 0));
    const curve = new THREE.QuadraticBezierCurve3(A, M, B);
    const len = curve.getLength();
    const n = Math.round(len / 0.45);
    const planks = Array.from({ length: n }, (_, i) => {
      const u = (i + 0.5) / n;
      const p = curve.getPointAt(u);
      const tng = curve.getTangentAt(u);
      return { p, ry: Math.atan2(tng.x, tng.z), rx: -Math.asin(tng.y) };
    });
    const side = new THREE.Vector3().subVectors(B, A).cross(new THREE.Vector3(0, 1, 0)).normalize();
    const posts = Array.from({ length: lamps * 2 }, (_, i) => {
      const u = (Math.floor(i / 2) + 0.5) / lamps;
      const p = curve.getPointAt(u).add(side.clone().multiplyScalar((i % 2 ? 1 : -1) * width * 0.5));
      return p;
    });
    const rails = [-1, 1].map((sd) => {
      const pts = Array.from({ length: 24 }, (_, i) => curve.getPointAt(i / 23).add(side.clone().multiplyScalar(sd * width * 0.5)).add(new THREE.Vector3(0, 0.75, 0)));
      return new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 48, 0.06, 6, false);
    });
    return { curve, planks, posts, rails };
  }, [a, b, arch, width, lamps]);
  const origin = new THREE.Vector3(...lightOrigin);
  const glowStrip = useMemo(() => new THREE.TubeGeometry(curve, 48, 0.07, 6, false), [curve]);
  return (
    <group>
      {planks.map((pl, i) => (
        <mesh key={i} position={pl.p} rotation={[pl.rx, pl.ry, 0, "YXZ"]} receiveShadow castShadow>
          <boxGeometry args={[width, 0.16, 0.4]} />
          <meshStandardMaterial color={i % 2 ? "#d9dcf6" : "#c9cdf0"} roughness={0.6} metalness={0.2} />
        </mesh>
      ))}
      {rails.map((g, i) => (
        <mesh key={i} geometry={g}>
          <meshStandardMaterial color={GOLD} metalness={0.6} roughness={0.35} emissive={GOLD} emissiveIntensity={0.15} />
        </mesh>
      ))}
      {posts.map((p, i) => {
        const l = lightAt(p.distanceTo(origin));
        return (
          <group key={i} position={p}>
            <mesh position={[0, 0.4, 0]}>
              <cylinderGeometry args={[0.05, 0.06, 0.8, 8]} />
              <meshStandardMaterial color={GOLD} metalness={0.6} roughness={0.35} />
            </mesh>
            <mesh position={[0, 0.92, 0]}>
              <sphereGeometry args={[0.16, 14, 10]} />
              <meshBasicMaterial color={COOL.clone().lerp(WARM, 0.35).multiplyScalar(0.12 + l * 3)} toneMapped={false} />
            </mesh>
          </group>
        );
      })}
      {/* underside glow strip */}
      <mesh geometry={glowStrip} position={[0, -0.12, 0]}>
        <meshBasicMaterial color={COOL.clone().multiplyScalar(0.1 + lightAt(origin.distanceTo(curve.getPointAt(0.5))) * 1.8)} toneMapped={false} />
      </mesh>
    </group>
  );
};
