import React from "react";
import "@react-three/fiber";
import * as THREE from "three";
import { CloudSea, FloatingIsland, Halo, Moon, SkyDome, Stars } from "../kit3d/sky";
import { Bridge, CROWN_Y, LightAt, MoonCastle } from "../kit3d/castle";
import { GlowGarden, Motes } from "../kit3d/magic";

// Where things are in Episode 5's 3D world (world units; characters stand on y = 0 surfaces)
export const MOON_POS: [number, number, number] = [30, 78, -300];
export const CASTLE: [number, number, number] = [0, 0, -36];
export const CROWN: [number, number, number] = [CASTLE[0], CROWN_Y, CASTLE[2]];
export const TERRACE: [number, number, number] = [0, 0, 0];
export const GARDEN: [number, number, number] = [-17, 1.5, -14];
export const FLOWER: [number, number, number] = [GARDEN[0], GARDEN[1], GARDEN[2] - 1];
const MOON_DIR: [number, number, number] = [MOON_POS[0] / 300, MOON_POS[1] / 300, MOON_POS[2] / 300];

const Lights: React.FC<{ amb?: number }> = ({ amb = 1 }) => (
  <>
    <hemisphereLight args={["#a9bcff", "#4a3a8a", 0.95 * amb]} />
    <directionalLight
      position={[MOON_POS[0] * 0.2, MOON_POS[1] * 0.2, MOON_POS[2] * 0.2 + 30]}
      intensity={1.7 * amb}
      color="#d6e2ff"
      castShadow
      shadow-mapSize={[2048, 2048]}
      shadow-camera-left={-40}
      shadow-camera-right={40}
      shadow-camera-top={40}
      shadow-camera-bottom={-40}
      shadow-camera-near={1}
      shadow-camera-far={160}
      shadow-bias={-0.0006}
    />
    <directionalLight position={[-30, 12, 40]} intensity={0.55 * amb} color="#ffb8e0" />
  </>
);

// The floating Moon Kingdom. lightAt(d) = how lit things are at distance d from the castle crown.
export const MoonKingdom: React.FC<{ t: number; lightAt: LightAt; amb?: number; showTerrace?: boolean; camPos?: [number, number, number] }> = ({ t, lightAt, amb = 1, showTerrace = true, camPos }) => {
  const kingdomGlow = lightAt(0);
  return (
    <>
      <fogExp2 attach="fog" args={["#30307e", 0.0055]} />
      <SkyDome t={t} moonDir={MOON_DIR} />
      <Stars t={t} bright={0.8 + kingdomGlow * 0.3} />
      <Moon position={MOON_POS} radius={52} glow={1.5} />
      <Lights amb={amb} />
      <CloudSea t={t} y={-15} inner={4} outer={170} count={360} center={[0, -30]} />
      {/* the castle island */}
      <FloatingIsland position={[CASTLE[0], 0, CASTLE[2] + 1]} radius={14} seed={2} t={0} bob={0} crystals={9} glow={0.4 + kingdomGlow} />
      <MoonCastle position={CASTLE} t={t} lightAt={lightAt} />
      {/* the terrace where friends arrive */}
      {showTerrace && <FloatingIsland position={TERRACE} radius={5.6} seed={4} t={0} bob={0} crystals={4} glow={0.4 + kingdomGlow} />}
      <Bridge a={[0, 0.02, -5.3]} b={[0, 0.02, CASTLE[2] + 14.6]} arch={1.4} lamps={6} lightAt={lightAt} lightOrigin={CROWN} />
      {/* the moon garden */}
      <FloatingIsland position={GARDEN} radius={6.2} seed={6} t={0} bob={0} crystals={5} crystalColor="#ffc8f0" glow={0.4 + kingdomGlow} grass="#86d8b8" />
      <GlowGarden t={t} radius={6} count={60} position={GARDEN} glow={0.45 + kingdomGlow * 0.8} clear={2.4} camPos={camPos} />
      <Bridge a={[-4.3, 0.02, -3.4]} b={[GARDEN[0] + 4.9, GARDEN[1] + 0.02, GARDEN[2] + 3.9]} arch={1.0} width={1.8} lamps={4} lightAt={lightAt} lightOrigin={CROWN} />
      {/* little islands drifting around */}
      <FloatingIsland position={[17, 4, -18]} radius={3} seed={8} t={t} crystals={3} glow={0.4 + kingdomGlow} />
      <FloatingIsland position={[24, -2, -44]} radius={4.2} seed={9} t={t} crystals={4} glow={0.4 + kingdomGlow} />
      <FloatingIsland position={[-26, 7, -48]} radius={3.6} seed={10} t={t} crystals={3} crystalColor="#ffc8f0" glow={0.4 + kingdomGlow} />
      <FloatingIsland position={[9, 11, -66]} radius={2.6} seed={12} t={t} crystals={2} glow={0.4 + kingdomGlow} />
      <FloatingIsland position={[13, -4, 4]} radius={2.2} seed={13} t={t} crystals={2} glow={0.4 + kingdomGlow} />
      <FloatingIsland position={[-12, 9, -30]} radius={2} seed={14} t={t} crystals={2} crystalColor="#fff1a8" glow={0.4 + kingdomGlow} />
      <Motes t={t} center={[0, 6, -20]} size={[50, 20, 50]} count={260} bright={0.5 + kingdomGlow * 0.6} />
      <Halo position={[CASTLE[0], 12, CASTLE[2]]} size={60} color="#7f9cff" opacity={0.12 + kingdomGlow * 0.25} />
    </>
  );
};

// ---------- Scene 1: the mountain meadow from Episode 4, now at nightfall ----------
const TREES: { x: number; z: number; h: number; c: string }[] = [
  { x: -5.5, z: -6, h: 3.2, c: "#7fd8a8" },
  { x: 6, z: -7, h: 2.6, c: "#ff9fd0" },
  { x: -9, z: -12, h: 3.6, c: "#7fb8ff" },
  { x: 10, z: -14, h: 3.4, c: "#8fe8e0" },
  { x: -3, z: -15, h: 2.8, c: "#c9a4ff" },
  { x: 4, z: -18, h: 3.8, c: "#7fd8a8" },
  { x: -14, z: -20, h: 3.3, c: "#ff9fd0" },
  { x: 15, z: -22, h: 3, c: "#7fb8ff" },
  { x: -7.5, z: 2.5, h: 2.4, c: "#8fe8e0" },
  { x: 8, z: 1.5, h: 2.6, c: "#c9a4ff" },
];

const MEADOW_MOON: [number, number, number] = [-90, 150, -320];
export const Meadow: React.FC<{ t: number; glow: number }> = ({ t, glow }) => (
  <>
    <fogExp2 attach="fog" args={["#3b3488", 0.012]} />
    <SkyDome t={t} top="#0e1550" mid="#3a2f8a" low="#c08ac8" moonDir={[MEADOW_MOON[0] / 370, MEADOW_MOON[1] / 370, MEADOW_MOON[2] / 370]} />
    <Stars t={t} count={2000} bright={0.85} />
    <Moon position={MEADOW_MOON} radius={40} glow={1.25} />
    <Lights amb={0.95} />
    <pointLight position={[0, 3, -2]} color="#ffdf9a" intensity={glow * 40} distance={16} decay={1.6} />
    {/* the rounded mountain top */}
    <mesh position={[0, -90, -6]} receiveShadow>
      <sphereGeometry args={[90, 96, 64]} />
      <meshStandardMaterial color="#58b892" roughness={0.9} />
    </mesh>
    {/* the big purple peak behind */}
    <mesh position={[-22, -30, -150]}>
      <coneGeometry args={[70, 120, 7]} />
      <meshStandardMaterial color="#6a5cbc" roughness={0.95} flatShading />
    </mesh>
    <mesh position={[60, -40, -190]}>
      <coneGeometry args={[60, 90, 6]} />
      <meshStandardMaterial color="#5a4ea8" roughness={0.95} flatShading />
    </mesh>
    {TREES.map((tr, i) => (
      <group key={i} position={[tr.x, -((tr.x * tr.x + (tr.z + 6) * (tr.z + 6)) / 180), tr.z]} rotation={[0, 0, Math.sin(t * 0.8 + i) * 0.02]}>
        <mesh position={[0, 0.3, 0]}>
          <cylinderGeometry args={[0.14, 0.18, 0.6, 8]} />
          <meshStandardMaterial color="#8a5a6a" />
        </mesh>
        {[0, 1, 2].map((k) => (
          <mesh key={k} position={[0, 0.6 + k * tr.h * 0.24 + tr.h * 0.2, 0]} castShadow>
            <coneGeometry args={[tr.h * (0.36 - k * 0.08), tr.h * 0.45, 7]} />
            <meshStandardMaterial color={tr.c} roughness={0.6} flatShading emissive={tr.c} emissiveIntensity={0.08} />
          </mesh>
        ))}
      </group>
    ))}
    <GlowGarden t={t} radius={9} count={60} seed={21} glow={0.6} position={[0, -0.35, -8.5]} clear={0} />
    <CloudSea t={t} y={-22} inner={30} outer={200} count={220} seed={4} center={[0, -10]} />
    <Motes t={t} center={[0, 3, -4]} size={[16, 6, 12]} count={120} color="#fff1a8" bright={0.7} />
  </>
);

export const lerp3 = (a: [number, number, number], b: [number, number, number], k: number): [number, number, number] => [a[0] + (b[0] - a[0]) * k, a[1] + (b[1] - a[1]) * k, a[2] + (b[2] - a[2]) * k];
export const add3 = (a: [number, number, number], b: [number, number, number]): [number, number, number] => [a[0] + b[0], a[1] + b[1], a[2] + b[2]];
export { THREE };
