import React, { useMemo } from "react";
import * as THREE from "three";
import { rng } from "../kit3d/World";
import { Halo } from "../kit3d/sky";
import { Motes } from "../kit3d/magic";
import { Butterflies, EnchantedJungle, floorY } from "../ep08/world";

// Episode 12: the Enchanted Forest where time runs strangely, the Ancient Clock Tower and its insides.
// Everything depends only on props. `fixed` 0..1: how much time has been put right (golden light, ticking hands).

export type V3 = [number, number, number];

export const TOWER: V3 = [0, floorY(0, -40), -40];
export const TOWER_FACE_Y = 17; // height of the outside clock face
export const PROJ_FROM: V3 = [0, 5.2, -8.6]; // the Master Clock's center (inside), for the final projection

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

const ROMAN = ["XII", "I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX", "X", "XI"];
const clockFaceTex = () =>
  canvasTex(512, 512, (x) => {
    const g = x.createRadialGradient(256, 256, 20, 256, 256, 256);
    g.addColorStop(0, "#fff8e0");
    g.addColorStop(0.85, "#f4e2b0");
    g.addColorStop(1, "#c89a40");
    x.fillStyle = g;
    x.beginPath();
    x.arc(256, 256, 252, 0, Math.PI * 2);
    x.fill();
    x.strokeStyle = "#a8781c";
    x.lineWidth = 14;
    x.stroke();
    x.lineWidth = 3;
    x.beginPath();
    x.arc(256, 256, 200, 0, Math.PI * 2);
    x.stroke();
    x.fillStyle = "#5a3a10";
    x.font = "bold 46px serif";
    x.textAlign = "center";
    x.textBaseline = "middle";
    ROMAN.forEach((r, i) => {
      const a = (i / 12) * Math.PI * 2 - Math.PI / 2;
      x.fillText(r, 256 + Math.cos(a) * 168, 256 + Math.sin(a) * 168);
    });
    for (let i = 0; i < 60; i++) {
      const a = (i / 60) * Math.PI * 2;
      const r0 = i % 5 ? 222 : 212;
      x.beginPath();
      x.moveTo(256 + Math.cos(a) * r0, 256 + Math.sin(a) * r0);
      x.lineTo(256 + Math.cos(a) * 236, 256 + Math.sin(a) * 236);
      x.stroke();
    }
  });

const stoneTex = (seed: number, base: [number, number, number]) =>
  canvasTex(512, 512, (x) => {
    const r = rng(seed);
    x.fillStyle = `rgb(${base[0] * 0.6},${base[1] * 0.6},${base[2] * 0.6})`;
    x.fillRect(0, 0, 512, 512);
    for (let row = 0; row < 10; row++)
      for (let col = -1; col < 6; col++) {
        const v = 0.82 + r() * 0.25;
        x.fillStyle = `rgb(${Math.floor(base[0] * v)},${Math.floor(base[1] * v)},${Math.floor(base[2] * v)})`;
        x.fillRect(col * 96 + (row % 2) * 48 + 3, row * 51 + 3, 90, 45);
      }
  }, [3, 4]);

// A toothed gear shape, extruded
const gearGeo = (r: number, teeth: number, thick: number, hole = 0.3) => {
  const s = new THREE.Shape();
  const n = teeth * 4;
  for (let i = 0; i <= n; i++) {
    const a = (i / n) * Math.PI * 2;
    const rr = i % 4 < 2 ? r : r * 0.86;
    if (i === 0) s.moveTo(Math.cos(a) * rr, Math.sin(a) * rr);
    else s.lineTo(Math.cos(a) * rr, Math.sin(a) * rr);
  }
  const h = new THREE.Path();
  h.absarc(0, 0, r * hole, 0, Math.PI * 2, true);
  s.holes.push(h);
  for (let k = 0; k < 5; k++) {
    const a = (k / 5) * Math.PI * 2;
    const p = new THREE.Path();
    p.absarc(Math.cos(a) * r * 0.58, Math.sin(a) * r * 0.58, r * 0.14, 0, Math.PI * 2, true);
    s.holes.push(p);
  }
  const g = new THREE.ExtrudeGeometry(s, { depth: thick, bevelEnabled: true, bevelThickness: thick * 0.15, bevelSize: r * 0.02, bevelSegments: 2, curveSegments: 6 });
  g.translate(0, 0, -thick / 2);
  return g;
};

export const Gear: React.FC<{ position: V3; r: number; teeth?: number; angle: number; rotation?: [number, number, number]; color?: string; glow?: number; thick?: number }> = ({
  position,
  r,
  teeth = 14,
  angle,
  rotation = [0, 0, 0],
  color = "#e8b840",
  glow = 0.2,
  thick = 0.25,
}) => {
  const geo = useMemo(() => gearGeo(r, teeth, thick), [r, teeth, thick]);
  return (
    <group position={position} rotation={rotation}>
      <mesh geometry={geo} rotation={[0, 0, angle]} castShadow>
        <meshStandardMaterial color={color} metalness={0.85} roughness={0.28} emissive="#ffb030" emissiveIntensity={glow} />
      </mesh>
    </group>
  );
};

// A clock with a face and two hands. hour/min are angles in turns (0..1)
export const Clock3D: React.FC<{ position: V3; r: number; hour: number; min: number; rotation?: [number, number, number]; glow?: number; showHands?: boolean }> = ({ position, r, hour, min, rotation = [0, 0, 0], glow = 0.3, showHands = true }) => {
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const face = useMemo(() => clockFaceTex(), []);
  return (
    <group position={position} rotation={rotation}>
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[r * 1.08, r * 1.08, r * 0.12, 48]} />
        <meshStandardMaterial color="#c8962c" metalness={0.85} roughness={0.3} />
      </mesh>
      <mesh position={[0, 0, r * 0.065]}>
        <circleGeometry args={[r, 48]} />
        <meshStandardMaterial map={face} emissive="#fff0c0" emissiveMap={face} emissiveIntensity={glow} roughness={0.6} />
      </mesh>
      {showHands && (
        <>
          <mesh position={[0, 0, r * 0.09]} rotation={[0, 0, -hour * Math.PI * 2]}>
            <mesh position={[0, r * 0.28, 0]}>
              <boxGeometry args={[r * 0.07, r * 0.56, r * 0.03]} />
              <meshStandardMaterial color="#3a2408" metalness={0.5} roughness={0.4} />
            </mesh>
          </mesh>
          <mesh position={[0, 0, r * 0.1]} rotation={[0, 0, -min * Math.PI * 2]}>
            <mesh position={[0, r * 0.4, 0]}>
              <boxGeometry args={[r * 0.045, r * 0.8, r * 0.03]} />
              <meshStandardMaterial color="#3a2408" metalness={0.5} roughness={0.4} />
            </mesh>
          </mesh>
        </>
      )}
      <mesh position={[0, 0, r * 0.12]}>
        <sphereGeometry args={[r * 0.06, 12, 8]} />
        <meshStandardMaterial color="#ffd060" metalness={0.9} roughness={0.2} />
      </mesh>
    </group>
  );
};

// Glowing numbers floating in the air
const numTex = (s: string) =>
  canvasTex(128, 128, (x) => {
    x.fillStyle = "rgba(0,0,0,0)";
    x.fillRect(0, 0, 128, 128);
    x.fillStyle = "#ffe8a0";
    x.shadowColor = "#ffc040";
    x.shadowBlur = 16;
    x.font = "bold 84px serif";
    x.textAlign = "center";
    x.textBaseline = "middle";
    x.fillText(s, 64, 68);
  });
const FloatingNumbers: React.FC<{ t: number; center: V3; spread: number; count?: number; glow?: number }> = ({ t, center, spread, count = 12, glow = 1 }) => {
  const texs = useMemo(() => ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12"].map(numTex), []);
  const items = useMemo(() => {
    const r = rng(77);
    return Array.from({ length: count }, (_, i) => ({ a: r() * 6.28, rr: spread * (0.5 + r() * 0.5), y: r() * spread * 0.8, sp: 0.1 + r() * 0.2, i }));
  }, [count, spread]);
  return (
    <>
      {items.map((it) => (
        <sprite key={it.i} position={[center[0] + Math.cos(it.a + t * it.sp) * it.rr, center[1] + it.y + Math.sin(t + it.i) * 0.3, center[2] + Math.sin(it.a + t * it.sp) * it.rr]} scale={[0.9, 0.9, 1]}>
          <spriteMaterial map={texs[it.i % 12]} transparent opacity={0.85 * glow} depthWrite={false} toneMapped={false} />
        </sprite>
      ))}
    </>
  );
};

// ---------- the Ancient Clock Tower, outside ----------
export const ClockTower: React.FC<{ t: number; fixed: number }> = ({ t, fixed }) => {
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const stone = useMemo(() => stoneTex(5, [240, 222, 196]), []);
  const minute = fixed > 0 ? t * 0.08 : 0.92;
  const hour = fixed > 0 ? t * 0.01 + 0.3 : 0.31;
  return (
    <group position={TOWER}>
      <mesh position={[0, 2.5, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[5.2, 5.8, 5, 8]} />
        <meshStandardMaterial map={stone} color="#efe0c8" roughness={0.85} />
      </mesh>
      <mesh position={[0, 11, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[3.4, 4.2, 13, 8]} />
        <meshStandardMaterial map={stone} color="#f4e6d0" roughness={0.85} />
      </mesh>
      {[5.0, 10.5, 13.6].map((y, i) => (
        <mesh key={i} position={[0, y, 0]}>
          <cylinderGeometry args={[i === 0 ? 5.5 : 4.1 - i * 0.25, i === 0 ? 5.5 : 4.1 - i * 0.25, 0.35, 8]} />
          <meshStandardMaterial color="#ffd060" metalness={0.85} roughness={0.25} emissive="#ffb030" emissiveIntensity={0.15 + fixed * 0.5} />
        </mesh>
      ))}
      {/* a door and a balcony window where Tock appears */}
      <mesh position={[0, 1.8, 5.6]}>
        <planeGeometry args={[2.2, 3.4]} />
        <meshStandardMaterial color="#3a2a18" emissive="#ffb050" emissiveIntensity={0.15 + fixed * 0.6} />
      </mesh>
      <mesh position={[0, 9.0, 3.95]}>
        <planeGeometry args={[1.4, 1.8]} />
        <meshStandardMaterial color="#2a1a10" emissive="#ffc060" emissiveIntensity={0.3 + fixed} />
      </mesh>
      {/* the clock storey */}
      <mesh position={[0, TOWER_FACE_Y, 0]} castShadow>
        <boxGeometry args={[8.2, 6.4, 8.2]} />
        <meshStandardMaterial map={stone} color="#f8ecd8" roughness={0.8} />
      </mesh>
      <Clock3D position={[0, TOWER_FACE_Y, 4.15]} r={2.6} hour={hour} min={minute} glow={0.25 + fixed * 0.9} />
      <Halo position={[0, TOWER_FACE_Y, 4.6]} size={8} color="#ffe0a0" opacity={0.15 + fixed * 0.5} />
      {/* golden gears on the corners, turning only when time works */}
      {[-1, 1].map((sd) => (
        <Gear key={sd} position={[sd * 4.2, TOWER_FACE_Y - 1.6, 3.6]} r={1.2} teeth={12} angle={sd * (fixed > 0 ? t * 0.8 : 0.2)} glow={0.2 + fixed * 0.6} />
      ))}
      <Gear position={[3.0, TOWER_FACE_Y + 2.4, 4.2]} r={0.7} teeth={9} angle={-(fixed > 0 ? t * 1.4 : 0.4)} glow={0.2 + fixed * 0.6} />
      {/* the roof and spire */}
      <mesh position={[0, TOWER_FACE_Y + 5.4, 0]} rotation={[0, Math.PI / 4, 0]} castShadow>
        <coneGeometry args={[6.4, 4.6, 4]} />
        <meshStandardMaterial color="#3f6fb8" roughness={0.5} metalness={0.2} />
      </mesh>
      <mesh position={[0, TOWER_FACE_Y + 8.6, 0]}>
        <coneGeometry args={[0.35, 2.4, 10]} />
        <meshStandardMaterial color="#ffd060" metalness={0.9} roughness={0.2} emissive="#ffb030" emissiveIntensity={0.3 + fixed} />
      </mesh>
      {/* the pendulum swinging in an arch below the clock (stopped while time is broken) */}
      <group position={[0, TOWER_FACE_Y - 3.3, 4.3]} rotation={[0, 0, fixed > 0 ? Math.sin(t * 2.2) * 0.35 : 0.28]}>
        <mesh position={[0, -1.6, 0]}>
          <boxGeometry args={[0.12, 3.2, 0.12]} />
          <meshStandardMaterial color="#c8962c" metalness={0.9} roughness={0.25} />
        </mesh>
        <mesh position={[0, -3.3, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.55, 0.55, 0.16, 32]} />
          <meshStandardMaterial color="#ffd060" metalness={0.9} roughness={0.2} emissive="#ffb030" emissiveIntensity={0.2 + fixed * 0.8} />
        </mesh>
      </group>
      {/* small clocks floating around the tower */}
      {Array.from({ length: 6 }, (_, i) => {
        const a = (i / 6) * Math.PI * 2 + t * 0.15;
        return <Clock3D key={i} position={[Math.cos(a) * 7.5, TOWER_FACE_Y - 4 + (i % 3) * 3 + Math.sin(t + i) * 0.3, Math.sin(a) * 7.5]} r={0.55} hour={(i * 0.13 + (fixed > 0 ? t * 0.02 : 0)) % 1} min={(i * 0.37 + (fixed > 0 ? t * 0.2 : Math.sin(t * 3 + i) * 0.5)) % 1} rotation={[0, -a + Math.PI / 2, 0]} glow={0.4 + fixed * 0.6} />;
      })}
      <FloatingNumbers t={t} center={[0, TOWER_FACE_Y - 6, 0]} spread={9} count={12} glow={0.6 + fixed * 0.4} />
    </group>
  );
};

// Flowers near the path that open and close in fast-forward while time is broken
const TimeFlowers: React.FC<{ t: number; fixed: number }> = ({ t, fixed }) => {
  const items = useMemo(() => {
    const r = rng(91);
    return Array.from({ length: 26 }, (_, i) => {
      const sd = i % 2 ? 1 : -1;
      const x = sd * (2.6 + r() * 2.2);
      const z = 12 - r() * 26;
      return { x, z, c: ["#ff7fb8", "#ffd060", "#b88aff", "#7fd8ff", "#ff9f60"][i % 5], ph: r() * 6, s: 0.25 + r() * 0.2 };
    });
  }, []);
  return (
    <>
      {items.map((it, i) => {
        const open = fixed > 0.5 ? 0.9 + 0.1 * Math.sin(t + it.ph) : 0.5 + 0.5 * Math.sin(t * 9 + it.ph);
        const y = floorY(it.x, it.z);
        return (
          <group key={i} position={[it.x, y, it.z]} scale={it.s}>
            <mesh position={[0, 0.6, 0]}>
              <cylinderGeometry args={[0.04, 0.05, 1.2, 6]} />
              <meshStandardMaterial color="#3f8f3a" />
            </mesh>
            {Array.from({ length: 6 }, (_, k) => (
              <mesh key={k} position={[0, 1.25, 0]} rotation={[0, (k / 6) * Math.PI * 2, 0]}>
                <mesh position={[0, 0, 0.0]} rotation={[-(0.15 + open * 1.2), 0, 0]}>
                  <mesh position={[0, 0.32, 0]} scale={[0.55, 1, 0.12]}>
                    <sphereGeometry args={[0.32, 10, 8]} />
                    <meshStandardMaterial color={it.c} emissive={it.c} emissiveIntensity={0.25} />
                  </mesh>
                </mesh>
              </mesh>
            ))}
            <mesh position={[0, 1.25, 0]}>
              <sphereGeometry args={[0.13, 10, 8]} />
              <meshStandardMaterial color="#ffe060" emissive="#ffc020" emissiveIntensity={0.4} />
            </mesh>
          </group>
        );
      })}
    </>
  );
};

// The whole forest: the Enchanted Forest from Episode 8 (without its temple), backward butterflies,
// fast-forward flowers and the clock tower where the temple stood. `rev` makes the butterflies fly backward.
export const TimeForest: React.FC<{ t: number; fixed: number; camPos?: V3 }> = ({ t, fixed, camPos }) => {
  const bt = fixed > 0.5 ? t : 100 - t; // butterflies run backward in time until the clock is fixed
  return (
    <>
      <EnchantedJungle t={t} s={{ base: 1, waveR: 0, waveOn: 0 }} camPos={camPos} heartHome={1} wildlife={0} temple={false} />
      <Butterflies t={bt} count={26} center={[0, 0, 4]} spread={22} camPos={camPos} />
      <Butterflies t={bt + 7} count={12} center={[0, 0, -24]} spread={20} camPos={camPos} />
      <TimeFlowers t={t} fixed={fixed} />
      <ClockTower t={t} fixed={fixed} />
      {fixed > 0 && <Halo position={[TOWER[0], TOWER_FACE_Y, TOWER[2] + 5]} size={20 + fixed * 30} color="#ffe6a0" opacity={0.35 * fixed} />}
    </>
  );
};

// ---------- inside the tower ----------
export const PORTAL_A: V3 = [3.4, 1.4, -2.2];
export const PORTAL_B: V3 = [-3.4, 1.4, -2.2];
export const GEAR_GARDEN: V3 = [-5.4, 0, -3.5];
export const PENDULUMS: V3 = [5.4, 0, -3.5];
export const FROZEN_GEAR: V3 = [-2.3, 2.6, -8.3];
export const CRANK: V3 = [2.6, 1.1, -7.6];
export const BUTTON: V3 = [1.2, 0, -6.2];
export const MASTER: V3 = [0, 5.2, -8.9];

const Portal: React.FC<{ position: V3; t: number; on: number }> = ({ position, t, on }) => (
  <group position={position}>
    <mesh>
      <torusGeometry args={[1.0, 0.1, 12, 48]} />
      <meshStandardMaterial color="#ffd060" metalness={0.9} roughness={0.2} emissive="#ffb030" emissiveIntensity={0.5} />
    </mesh>
    {[0, 1, 2].map((k) => (
      <mesh key={k} rotation={[0, 0, t * (2 + k) * (k % 2 ? -1 : 1)]} position={[0, 0, 0.02 * k]}>
        <ringGeometry args={[0.2 + k * 0.25, 0.32 + k * 0.25, 40, 1, 0, Math.PI * 1.3]} />
        <meshBasicMaterial color={new THREE.Color(["#9fe8ff", "#c8a0ff", "#ffe08a"][k]).multiplyScalar(1.5 * on)} transparent opacity={0.8 * on} side={THREE.DoubleSide} toneMapped={false} />
      </mesh>
    ))}
    <Halo position={[0, 0, 0.1]} size={3} color="#bfe0ff" opacity={0.4 * on} />
  </group>
);

export const ClockInterior: React.FC<{ t: number; fixed: number; spinMad?: number; frozen?: number; buttonDown?: number; crank?: number; masterHands?: number; portals?: number; gardenGear?: number }> = ({
  t,
  fixed,
  spinMad = 0,
  frozen = 1,
  buttonDown = 0,
  crank = 0,
  masterHands = 0,
  portals = 1,
  gardenGear = 0,
}) => {
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const wall = useMemo(() => stoneTex(13, [150, 120, 100]), []);
  const floorT = useMemo(
    () =>
      canvasTex(512, 512, (x) => {
        for (let i = 0; i < 8; i++)
          for (let j = 0; j < 8; j++) {
            x.fillStyle = (i + j) % 2 ? "#6a4a2a" : "#8a6238";
            x.fillRect(i * 64, j * 64, 64, 64);
          }
        x.strokeStyle = "rgba(255,210,120,0.25)";
        x.lineWidth = 3;
        x.beginPath();
        x.arc(256, 256, 200, 0, Math.PI * 2);
        x.stroke();
      }, [3, 3]),
    [],
  );
  const run = fixed > 0 ? t * 0.6 : spinMad > 0 ? t * 3.5 * spinMad : 0.1;
  return (
    <>
      <fogExp2 attach="fog" args={["#2a1a10", 0.03]} />
      <color attach="background" args={["#1a1008"]} />
      <hemisphereLight args={["#ffe0b0", "#3a2a1a", 0.8 + fixed * 0.4]} />
      <pointLight position={[0, 7, -2]} intensity={30 + fixed * 40} distance={22} color="#ffd8a0" castShadow />
      <pointLight position={[MASTER[0], MASTER[1], MASTER[2] + 2.5]} intensity={8 + fixed * 30} distance={12} color="#ffe6a0" />
      <pointLight position={[-6, 3, 1]} intensity={10} distance={12} color="#a0c8ff" />
      {/* floor and round walls */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <circleGeometry args={[12, 64]} />
        <meshStandardMaterial map={floorT} roughness={0.7} />
      </mesh>
      <mesh position={[0, 6, -1]}>
        <cylinderGeometry args={[11, 11, 14, 48, 1, true]} />
        <meshStandardMaterial map={wall} color="#d8b898" roughness={0.9} side={THREE.BackSide} emissive="#2a1a0a" emissiveIntensity={0.4} />
      </mesh>
      {/* tall windows with golden light */}
      {[-0.9, -0.45, 0.45, 0.9].map((a, i) => (
        <mesh key={i} position={[Math.sin(a) * 10.9, 6.5, -1 - Math.cos(a) * 10.9]} rotation={[0, -a, 0]}>
          <planeGeometry args={[1.4, 4]} />
          <meshBasicMaterial color={new THREE.Color("#ffd890").multiplyScalar(0.8 + fixed * 1.2)} toneMapped={false} />
        </mesh>
      ))}
      {/* the Master Clock on the back wall */}
      <Clock3D position={MASTER} r={2.8} hour={fixed > 0 ? 0.125 + t * 0.005 : 0} min={fixed > 0 ? t * 0.06 : 0} glow={0.2 + fixed * 1.0} showHands={masterHands > 0.99} />
      <Halo position={[MASTER[0], MASTER[1], MASTER[2] + 0.6]} size={7 + fixed * 6} color="#ffe0a0" opacity={0.15 + fixed * 0.5} />
      {/* big gears on the back wall, spinning wildly while broken */}
      <Gear position={[-4.6, 6.2, -8.4]} r={2.2} teeth={18} angle={run} glow={0.15 + fixed * 0.5} />
      <Gear position={[4.4, 6.8, -8.4]} r={1.8} teeth={15} angle={-run * 1.2} glow={0.15 + fixed * 0.5} />
      <Gear position={[3.2, 3.2, -8.5]} r={1.1} teeth={11} angle={run * 2} glow={0.15 + fixed * 0.5} />
      {/* the frozen gear: icy until Draco warms it */}
      <Gear position={FROZEN_GEAR} r={1.0} teeth={11} angle={frozen > 0.5 ? 0.3 : -run * 2} color={frozen > 0.5 ? "#bfe8ff" : "#e8b840"} glow={0.1} />
      {frozen > 0.01 && (
        <mesh position={[FROZEN_GEAR[0], FROZEN_GEAR[1], FROZEN_GEAR[2] + 0.15]} scale={[1.15 * frozen, 1.15 * frozen, 0.4]}>
          <icosahedronGeometry args={[1, 1]} />
          <meshStandardMaterial color="#bfefff" emissive="#7fd8ff" emissiveIntensity={0.6} transparent opacity={0.6 * frozen} roughness={0.05} metalness={0.1} flatShading />
        </mesh>
      )}
      {/* the crank and the giant golden button */}
      <group position={CRANK}>
        <mesh>
          <cylinderGeometry args={[0.3, 0.3, 0.4, 20]} />
          <meshStandardMaterial color="#c8962c" metalness={0.9} roughness={0.3} />
        </mesh>
        <mesh position={[0, 0.25, 0]} rotation={[0, crank * Math.PI * 2, 0]}>
          <mesh position={[0.35, 0, 0]}>
            <boxGeometry args={[0.7, 0.1, 0.1]} />
            <meshStandardMaterial color="#ffd060" metalness={0.9} roughness={0.2} />
          </mesh>
        </mesh>
      </group>
      <group position={BUTTON}>
        <mesh position={[0, 0.35, 0]}>
          <cylinderGeometry args={[0.6, 0.7, 0.7, 24]} />
          <meshStandardMaterial color="#8a5a2a" roughness={0.6} />
        </mesh>
        <mesh position={[0, 0.78 - buttonDown * 0.12, 0]}>
          <cylinderGeometry args={[0.45, 0.45, 0.18, 24]} />
          <meshStandardMaterial color="#ffd060" metalness={0.9} roughness={0.2} emissive="#ff9020" emissiveIntensity={0.4 + buttonDown} />
        </mesh>
      </group>
      {/* the Gear Garden: gears growing like flowers */}
      {Array.from({ length: 7 }, (_, i) => {
        const x = GEAR_GARDEN[0] + (i % 3) * 0.9 - 0.9;
        const z = GEAR_GARDEN[2] + Math.floor(i / 3) * 0.9 - 0.6;
        return (
          <group key={i}>
            <mesh position={[x, 0.45, z]}>
              <cylinderGeometry args={[0.04, 0.05, 0.9, 6]} />
              <meshStandardMaterial color="#8a6a3a" metalness={0.6} />
            </mesh>
            <Gear position={[x, 1.0 + (i % 2) * 0.2, z]} r={0.32 + (i % 3) * 0.08} teeth={8} angle={(i % 2 ? 1 : -1) * (run + i) + gardenGear} rotation={[0, i, 0]} glow={0.3} thick={0.08} />
          </group>
        );
      })}
      {/* the Pendulum Chamber: three big pendulums */}
      {[-1, 0, 1].map((k) => (
        <group key={k} position={[PENDULUMS[0] + k * 1.1, 8.5, PENDULUMS[2] + k * 0.4]} rotation={[0, 0, Math.sin(t * (1.6 + k * 0.2) + k) * (fixed > 0 ? 0.35 : 0.5)]}>
          <mesh position={[0, -3.1, 0]}>
            <boxGeometry args={[0.08, 6.2, 0.08]} />
            <meshStandardMaterial color="#c8962c" metalness={0.9} roughness={0.25} />
          </mesh>
          <mesh position={[0, -6.3, 0]} rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.42, 0.42, 0.14, 28]} />
            <meshStandardMaterial color="#ffd060" metalness={0.9} roughness={0.2} emissive="#ffb030" emissiveIntensity={0.3} />
          </mesh>
        </group>
      ))}
      {/* floating clocks and the two time portals */}
      {Array.from({ length: 7 }, (_, i) => {
        const a = (i / 7) * Math.PI * 2 + t * 0.1;
        return <Clock3D key={i} position={[Math.cos(a) * 6.5, 6 + (i % 3) * 1.2 + Math.sin(t + i) * 0.25, -2 + Math.sin(a) * 4]} r={0.45} hour={(i * 0.17) % 1} min={fixed > 0 ? (t * 0.3 + i * 0.1) % 1 : (Math.sin(t * 4 + i) * 0.5 + 1) % 1} rotation={[0, 0, Math.sin(t + i) * 0.2]} glow={0.5} />;
      })}
      <Portal position={PORTAL_A} t={t} on={portals} />
      <Portal position={PORTAL_B} t={t} on={portals} />
      <FloatingNumbers t={t} center={[0, 3, -3]} spread={6} count={10} glow={0.5 + fixed * 0.5} />
      <Motes t={t} center={[0, 3, -2]} size={[16, 8, 12]} count={180} color="#ffe6a0" bright={0.4 + fixed * 0.5} />
    </>
  );
};

// ---------- the Master Clock's projection: a rainbow bridge to a kingdom in the clouds ----------
const HOLO_VERT = /* glsl */ `varying vec2 vUv; varying vec3 vN; varying vec3 vV; void main(){ vUv = uv; vec4 mv = modelViewMatrix * vec4(position, 1.0); vN = normalMatrix * normal; vV = -mv.xyz; gl_Position = projectionMatrix * mv; }`;
const HOLO_FRAG = /* glsl */ `uniform float uT; uniform float uOn; varying vec2 vUv; varying vec3 vN; varying vec3 vV;
void main(){ float f = pow(1.0 - abs(dot(normalize(vN), normalize(vV))), 1.5); float lines = 0.75 + 0.25 * sin(vUv.y * 120.0 - uT * 6.0);
  vec3 c = vec3(1.0, 0.92, 0.75) * (0.3 + f * 1.2) * lines; gl_FragColor = vec4(c, (0.05 + f * 0.45) * uOn); }`;
const RAINBOW = ["#ff6a6a", "#ffb040", "#ffe060", "#7fe07f", "#6fb8ff", "#b88aff"];

export const RainbowBridgeHologram: React.FC<{ position: V3; t: number; on: number; scale?: number }> = ({ position, t, on, scale = 1 }) => {
  const uniforms = useMemo(() => ({ uT: { value: 0 }, uOn: { value: 0 } }), []);
  uniforms.uT.value = t;
  uniforms.uOn.value = on;
  if (on <= 0.001) return null;
  const s = scale * (0.3 + 0.7 * on);
  const m = (c: string, k = 1, op = 0.9) => <meshBasicMaterial color={new THREE.Color(c).multiplyScalar(k)} transparent opacity={op * on} toneMapped={false} depthWrite={false} side={THREE.DoubleSide} />;
  return (
    <group position={position} scale={s}>
      <Halo position={[0, 0.5, 0]} size={8} color="#fff0c8" opacity={0.3 * on} />
      <mesh>
        <sphereGeometry args={[2.2, 48, 24]} />
        <shaderMaterial vertexShader={HOLO_VERT} fragmentShader={HOLO_FRAG} uniforms={uniforms} transparent depthWrite={false} side={THREE.DoubleSide} />
      </mesh>
      {/* the rainbow bridge arching up to the right */}
      {RAINBOW.map((c, i) => (
        <mesh key={i} position={[0.1, -0.9, 0]} rotation={[0, 0, 0]}>
          <torusGeometry args={[1.25 - i * 0.07, 0.035, 8, 60, Math.PI]} />
          {m(c, 1.6)}
        </mesh>
      ))}
      {/* clouds and a castle at the far end */}
      {[[-1.2, -0.95], [1.35, -0.95], [1.3, 0.55], [0.95, 0.45]].map(([x, y], i) => (
        <mesh key={i} position={[x, y, 0]} scale={[0.5, 0.22, 0.3]}>
          <sphereGeometry args={[1, 14, 10]} />
          {m("#ffffff", 1.1, 0.75)}
        </mesh>
      ))}
      <group position={[1.15, 0.65, 0]}>
        {[-0.22, 0, 0.22].map((x, i) => (
          <group key={i} position={[x, i === 1 ? 0.3 : 0.18, 0]}>
            <mesh>
              <cylinderGeometry args={[0.07, 0.08, i === 1 ? 0.6 : 0.36, 10]} />
              {m("#e8f0ff", 1.3)}
            </mesh>
            <mesh position={[0, i === 1 ? 0.4 : 0.26, 0]}>
              <coneGeometry args={[0.11, 0.2, 10]} />
              {m(RAINBOW[(i * 2) % 6], 1.6)}
            </mesh>
          </group>
        ))}
      </group>
      {Array.from({ length: 10 }, (_, i) => (
        <mesh key={`s${i}`} position={[Math.sin(i * 2.3 + t * 0.5) * 1.5, -0.5 + ((i * 0.31 + t * 0.2) % 2), Math.cos(i * 1.7) * 0.7]}>
          <sphereGeometry args={[0.03, 6, 4]} />
          {m(RAINBOW[i % 6], 3)}
        </mesh>
      ))}
    </group>
  );
};
