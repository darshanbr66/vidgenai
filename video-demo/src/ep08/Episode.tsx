import React from "react";
import { AbsoluteFill, Easing, useCurrentFrame } from "remotion";
import timeline from "./timeline.json";
import { blinkAt, Lumi } from "../story/characters";
import { Sparkle } from "../story/scenery";
import { Draco, Ep4Defs } from "../ep04/props";
import { BoboRider, EASE, EndCard, EpisodeFrame, ip, lumiHand, makeMouthAt, OUT, SparkBurst, XF } from "../kit";
import { Cam3, World3D } from "../kit3d/World";
import { camAt, CharLayer, place, screen, V3 } from "../kit3d/overlay";
import { LightRing, SparkleBurst3D } from "../kit3d/magic";
import { Ep5Defs, MoonPendant } from "../ep05/props";
import { Ep6Defs } from "../ep06/props";
import { CASTLE as SNOW_CASTLE, SnowflakeKingdom } from "../ep07/world";
import { BoboWinter, Ep7Defs, Niva } from "../ep07/props";
import { CAGE, DesertHologram, EnchantedJungle, HEART_IN, HeartOfJungle, LifeState, SOCKET, TEMPLE, TEMPLE_DOOR, TempleChamber } from "./world";
import {
  Banana,
  BananaBunch,
  BoboBigEyes,
  BoboFrown,
  Branch,
  ChangingPendant,
  DotsBubble,
  DracoBlush,
  DustPuffs,
  Ep8Defs,
  FallingLeaf,
  GreenBeam,
  JungleMap,
  Kiko,
  kikoHand,
  LeafPendant,
  SmokePuff,
  SpeedLines,
  SweatDrop,
  TinyFireball,
  Vine,
} from "./props";

// Episode 8, comedy version: The Secret of the Enchanted Jungle

const mouthAt = makeMouthAt(timeline);
export const CUTS = [0, 180, 420, 750, 978, 1272, 1500];
const BACK = (s: number) => Easing.out(Easing.back(s));
const lerp = (a: number, b: number, k: number) => a + (b - a) * k;
const lerp3 = (a: V3, b: V3, k: number): V3 => [lerp(a[0], b[0], k), lerp(a[1], b[1], k), lerp(a[2], b[2], k)];
const up = (p: V3, h: number): V3 => [p[0], p[1] + h, p[2]];
const clamp1 = (v: number) => Math.max(-1, Math.min(1, v));
const P2 = (a: { x: number; y: number }, b: { x: number; y: number }, k: number) => ({ x: lerp(a.x, b.x, k), y: lerp(a.y, b.y, k) });

// Relative sizes, the same as Episodes 5 to 7
const LUMI_S = 1;
const BOBO_S = 0.91;
const DRACO_S = 1.05;
const NIVA_S = 0.78;
const KIKO_S = 0.8;

// ---- timed moments in frames; the same numbers (in seconds) are in scripts/ep08_audio.py ----
const GREEN = 12;
const MAP = 18;
const DRACO_JUMP = 21;
const LEAF = 74;
const LEAF_LAND = 87;
const FIRE = 113; // ah-CHOO
const BOBO_JUMP = 116;
const WIPE = 168;
const EYES = 246;
const RUN = 276;
const SWOOP = 294;
const GRAB = 303;
const SKID = 308;
const HANG = 315;
const FADE = 588;
const DEADPAN = 731;
const POSE = 762;
const INHALE = 828;
const POOF = 852;
const BLUSH = 918;
const SYMBOLS = 930;
const PEND_GREEN = 957;
const RAISE = 984;
const LIGHT = 999;
const SYM_FIRST = 1008;
const SYM_STEP = 9;
const OPEN = 1059;
const RISE = 1071;
const HOME = 1119;
const BLOOM = 1125;
const TOSS = 1155;
const BITE = 1173;
const TURN = 1197;
const GIVE = 1275;
const DESERT = 1334;
const SULK = 1407;
const END = 1428;

const spot = (base: V3, fwd: [number, number], dx: number, d: number, h = 0): V3 => {
  const len = Math.hypot(fwd[0], fwd[1]);
  const fx = fwd[0] / len;
  const fz = fwd[1] / len;
  return [base[0] - fx * d - fz * dx, base[1] + h, base[2] - fz * d + fx * dx];
};

const lifeState = (G: number): LifeState => ({
  base: ip(G, [FADE, FADE + 75], [1, 0.18], EASE),
  waveOn: G >= BLOOM ? 1 : 0,
  waveR: ip(G, [BLOOM, BLOOM + 100], [0, 220], Easing.out(Easing.quad)),
});
const charLit = (G: number) => (G < BLOOM ? ip(G, [FADE, FADE + 75], [1, 0.9]) : ip(G, [BLOOM, BLOOM + 30], [0.9, 1.04]));

const lumiHandL = (x: number, y: number, s: number, angle: number) => {
  const a = (angle * Math.PI) / 180;
  return { x: x + (-84 - 128 * Math.sin(a)) * s, y: y + (-290 + 128 * Math.cos(a)) * s };
};
const boboHandR = (x: number, y: number, s: number, angle: number) => {
  const a = (angle * Math.PI) / 180;
  return { x: x + (86 - 94 * Math.sin(a)) * s, y: y + (-196 + 94 * Math.cos(a)) * s };
};
const Worn: React.FC<{ L: { x: number; y: number; scale: number }; g: number; glow?: number }> = ({ L, g, glow = 0.4 }) => (
  <MoonPendant x={L.x + 4 * L.scale} y={L.y - 262 * L.scale} scale={0.62 * L.scale} g={g} glow={glow} />
);
const HeldFlake: React.FC<{ L: { x: number; y: number; scale: number }; g: number; glow?: number }> = ({ L, g, glow = 0.5 }) => {
  const h = lumiHandL(L.x, L.y, L.scale, 22);
  return <ChangingPendant x={h.x} y={h.y + 26 * L.scale} scale={0.62 * L.scale} g={g} green={1} glow={glow} />;
};
// Kiko hanging upside down by his feet from a point
const KikoUpsideDown: React.FC<React.ComponentProps<typeof Kiko> & { banana?: boolean }> = ({ banana, ...p }) => {
  const h = kikoHand(p.x, p.y, p.scale ?? 1, p.armR ?? -14);
  return (
    <g transform={`rotate(180 ${p.x} ${p.y})`}>
      <Kiko {...p} />
      {banana && <Banana x={h.x} y={h.y + 14 * (p.scale ?? 1)} scale={0.7 * (p.scale ?? 1)} rot={150} />}
    </g>
  );
};

const Layer: React.FC<{ G: number; children: React.ReactNode }> = ({ G, children }) => (
  <CharLayer defs={<><Ep4Defs /><Ep5Defs lit={1} /><Ep6Defs /><Ep7Defs /><Ep8Defs lit={charLit(G)} /></>} filter="jungleLit">
    {children}
  </CharLayer>
);

const JungleShot: React.FC<{ cam: Cam3; G: number; fade?: boolean; world?: React.ReactNode; children: React.ReactNode; over?: React.ReactNode; heartHome?: number }> = ({ cam, G, fade = true, world, children, over, heartHome = 0 }) => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill style={{ opacity: fade ? ip(f, [0, XF], [0, 1]) : 1, background: "#2a4a2a" }}>
      <World3D cam={cam} bloom={0.75} threshold={0.75}>
        <EnchantedJungle t={G / 30} s={lifeState(G)} camPos={cam.pos} heartHome={heartHome} />
        {world}
      </World3D>
      <Layer G={G}>{children}</Layer>
      {over}
    </AbsoluteFill>
  );
};

// The banana branch on the big tree by the clearing (world points)
const TRUNK_PT: V3 = [-5.5, 2.5, 5.6];
const BRANCH_END: V3 = [-2.6, 2.75, 9.25];
const BUNCH: V3 = [-3.75, 2.55, 7.9];
const HANG_AT: V3 = [-2.75, 2.7, 9.2];

const BananaBranch: React.FC<{ cam: Cam3; g: number; swap?: number; taken?: number }> = ({ cam, g, swap = 0, taken = 0 }) => {
  const a = screen(cam, TRUNK_PT);
  const b = screen(cam, BRANCH_END);
  const bunch = place(cam, BUNCH, 1);
  return (
    <>
      <Branch from={a} to={b} scale={bunch.scale * 1.6} g={g} />
      <BananaBunch x={bunch.x} y={bunch.y} scale={bunch.scale * 1.7} g={g} swap={swap} taken={taken} />
    </>
  );
};

// ---------- Scene 1 (0-6s): the green pendant, a jungle map, and a sneeze ----------
const SB: V3 = [12.3, 0, -5.6];
const SF: [number, number] = [SNOW_CASTLE[0] - SB[0], SNOW_CASTLE[2] - SB[2]];
const S_BOBO = spot(SB, SF, -1.3, -0.1);
const S_LUMI = spot(SB, SF, -0.35, 0.15);
const S_NIVA = spot(SB, SF, 0.55, 0.3);
const S_DRACO = spot(SB, SF, 1.45, 0.0);
const FULL_SNOW = { base: 1, waveR: 0, waveOn: 0 };

const Scene1: React.FC = () => {
  const f = useCurrentFrame();
  const g = f;
  const closeUp = f >= 70 && f < BOBO_JUMP;
  const cam = camAt(f, [
    [0, { pos: spot(SB, SF, 0.1, 6.4, 1.0), target: spot(SB, SF, 0.1, -2, 1.9), fov: 46 }],
    [69, { pos: spot(SB, SF, 0.1, 6.1, 1.0), target: spot(SB, SF, 0.1, -2, 1.9), fov: 46 }],
    [70, { pos: spot(S_DRACO, SF, 0, 3.0, 0.8), target: spot(S_DRACO, SF, 0, 0, 0.88), fov: 40 }],
    [BOBO_JUMP - 1, { pos: spot(S_DRACO, SF, 0, 2.6, 0.8), target: spot(S_DRACO, SF, 0, 0, 0.88), fov: 40 }],
    [BOBO_JUMP, { pos: spot(SB, SF, 0.0, 7.8, 1.0), target: spot(SB, SF, 0.0, -2, 1.5), fov: 50 }],
    [180, { pos: spot(SB, SF, 0.0, 7.4, 1.0), target: spot(SB, SF, 0.0, -2, 1.5), fov: 50 }],
  ]);
  // Draco's excited hops
  const hop = Math.abs(Math.sin(((f - DRACO_JUMP) / 12) * Math.PI)) * ip(f, [DRACO_JUMP, DRACO_JUMP + 2, DRACO_JUMP + 22, DRACO_JUMP + 24], [0, 0.3, 0.3, 0]);
  // Bobo leaps backwards away from the fireball
  const leap = ip(f, [BOBO_JUMP, BOBO_JUMP + 14], [0, 1], Easing.out(Easing.quad));
  const boboP = up(spot(S_BOBO, SF, -0.55 * leap, -0.2 * leap), Math.sin(leap * Math.PI) * 0.55);
  const B = place(cam, boboP, BOBO_S);
  const L = place(cam, S_LUMI, LUMI_S);
  const D = place(cam, up(S_DRACO, hop), DRACO_S);
  const N = place(cam, S_NIVA, NIVA_S);
  const armR = f < 70 ? -128 : -60;
  const hand = lumiHand(L.x, L.y, L.scale, armR);
  const pend = { x: hand.x, y: hand.y + 24 * L.scale };
  const green = ip(f, [GREEN, GREEN + 20], [0, 1], EASE);
  const mapOn = ip(f, [MAP, MAP + 18], [0, 1], OUT) * ip(f, [WIPE - 10, WIPE], [1, 0]);
  // the leaf: flutters down onto Draco's nose, then the sneeze blows it away
  const nose = { x: D.x, y: D.y - 214 * D.scale };
  const mouth = { x: D.x, y: D.y - 168 * D.scale };
  const fall = ip(f, [LEAF, LEAF_LAND], [0, 1]);
  const blown = ip(f, [FIRE, FIRE + 14], [0, 1], OUT);
  const leafX = f < LEAF_LAND ? nose.x + Math.sin(fall * 9) * 90 * (1 - fall) * D.scale : nose.x + blown * 260 * D.scale;
  const leafY = f < LEAF_LAND ? lerp(nose.y - 700 * D.scale, nose.y - 6 * D.scale, fall) : nose.y - 6 * D.scale - blown * 380 * D.scale;
  const windUp = ip(f, [LEAF_LAND + 2, FIRE - 2], [0, 1]);
  const sneezing = f >= FIRE && f < FIRE + 8;
  // the fireball flies from Draco toward Bobo and fizzles just before reaching him
  const fireAge = ip(f, [FIRE, FIRE + 22], [0, 1]);
  const bAim = { x: B.x + 120 * B.scale, y: B.y - 260 * B.scale };
  const fire = closeUp ? { x: mouth.x - fireAge * 700, y: mouth.y + fireAge * 40 } : P2(mouth, bAim, ip(f, [BOBO_JUMP, FIRE + 18], [0.15, 0.85]));
  const lookMap = (who: { x: number }) => ({ x: clamp1((540 - who.x) / 300), y: -1 });
  const afterJump = f >= BOBO_JUMP;
  const scolding = f >= BOBO_JUMP + 18;
  return (
    <AbsoluteFill style={{ background: "#0a1238" }}>
      <World3D cam={cam} bloom={0.9} threshold={0.7}>
        <SnowflakeKingdom t={g / 30} s={FULL_SNOW} aurora={1.2} camPos={cam.pos} sparkle={1} />
      </World3D>
      <CharLayer defs={<><Ep4Defs /><Ep5Defs lit={1} /><Ep6Defs /><Ep7Defs lit={1.05} /><Ep8Defs /></>} filter="snowLit">
        {!closeUp && mapOn > 0 && (
          <g opacity={mapOn}>
            <path d={`M ${pend.x - 12} ${pend.y} L ${280} ${600} L ${800} ${600} L ${pend.x + 12} ${pend.y} Z`} fill="#9fff8f" opacity={0.12} />
            <JungleMap x={540} y={430} s={0.9} g={g} reveal={ip(f, [MAP, MAP + 18], [0, 1], OUT)} />
          </g>
        )}
        <Niva x={N.x} y={N.y} scale={N.scale} g={g} mood={afterJump ? "surprised" : "excited"} look={afterJump ? { x: -1, y: 0 } : lookMap(N)} blink={blinkAt(g, 9)} tailWag={1.2} />
        <BoboWinter
          g={g}
          x={B.x}
          y={B.y}
          scale={B.scale}
          look={afterJump ? { x: 1, y: -0.1 } : lookMap(B)}
          expr={afterJump ? "surprised" : "happy"}
          mouth={mouthAt("bobo", g)}
          armL={afterJump ? (scolding ? 30 : 150) : 30}
          armR={afterJump ? (scolding ? -95 + Math.sin(f / 3) * 12 : -150) : -30}
          lean={afterJump && !scolding ? -12 : 0}
          squash={ip(f, [BOBO_JUMP + 13, BOBO_JUMP + 16, BOBO_JUMP + 22], [1, 0.84, 1])}
          blink={blinkAt(g, 3)}
          riderLook={afterJump ? { x: 1, y: 0 } : lookMap(B)}
          riderArmsUp={afterJump && !scolding}
        />
        <Lumi x={L.x} y={L.y} scale={L.scale} look={afterJump ? { x: 0.6, y: -0.1 } : lookMap(L)} expr={afterJump ? "surprised" : "excited"} armR={armR} armL={22} blink={blinkAt(g, 1)} />
        <Worn L={L} g={g} />
        <circle cx={pend.x} cy={pend.y} r={(90 + 40 * Math.sin(g / 4)) * L.scale} fill={green > 0.5 ? "url(#leafGlow)" : "url(#iceGlow)"} opacity={0.5} />
        <ChangingPendant x={pend.x} y={pend.y} scale={1.0 * L.scale} g={g} green={green} glow={1} />
        <Draco
          x={D.x}
          y={D.y}
          scale={D.scale}
          g={g}
          mood={sneezing ? "effort" : afterJump ? "happy" : f >= LEAF_LAND ? "surprised" : "excited"}
          mouth={sneezing ? 0.9 : mouthAt("draco", g)}
          look={f >= LEAF_LAND && f < FIRE ? { x: 0, y: -0.15 } : afterJump ? { x: -0.8, y: 0 } : lookMap(D)}
          blink={f >= LEAF_LAND && f < FIRE ? 0.85 : blinkAt(g, 5)}
          wing={f < LEAF_LAND ? 0.9 : 0.6}
          flap={f < LEAF_LAND && f > DRACO_JUMP ? Math.sin(f / 3) * 14 : 0}
          armsUp={f < LEAF_LAND ? 0.8 : 0.2}
          headTilt={sneezing ? 8 : afterJump ? 10 : -12 * windUp}
          squash={sneezing ? 0.86 : 1 + 0.08 * windUp}
          lean={sneezing ? -6 : 0}
          glow={0.45}
        />
        {afterJump && <SweatDrop x={D.x + 110 * D.scale} y={D.y - 300 * D.scale} scale={D.scale * 1.2} g={g} />}
        {f >= LEAF && f < FIRE + 14 && <FallingLeaf x={leafX} y={leafY} rot={f < LEAF_LAND ? Math.sin(fall * 9) * 50 : 20 + blown * 300} scale={D.scale * 1.3} />}
        <TinyFireball x={fire.x} y={fire.y} scale={(closeUp ? 1.2 : 0.7) * D.scale} age={fireAge} />
        <circle cx={pend.x} cy={pend.y} r={ip(f, [0, 22], [120, 900], OUT)} fill="url(#iceGlow)" opacity={ip(f, [0, 4, 30], [1, 1, 0])} />
        <circle cx={pend.x} cy={pend.y} r={ip(f, [GREEN, GREEN + 24], [80, 600], OUT)} fill="url(#leafGlow)" opacity={ip(f, [GREEN, GREEN + 4, GREEN + 30], [0, 0.9, 0])} />
        <SparkBurst f={f} at={0} x={pend.x} y={pend.y} reach={620} count={32} size={22} life={36} />
        {/* a swirl of leaves carries everyone into the jungle */}
        {f >= WIPE &&
          Array.from({ length: 40 }, (_, i) => {
            const k = ip(f, [WIPE, 180], [0, 1]);
            const a = i * 2.4 + k * 6;
            const r = (1 - k) * 900 + 80;
            return <FallingLeaf key={i} x={540 + Math.cos(a) * r} y={960 + Math.sin(a) * r * 1.4} rot={a * 60} scale={2 + (i % 3)} />;
          })}
      </CharLayer>
      <AbsoluteFill style={{ background: "radial-gradient(circle at 50% 50%, #ffffff 0%, #eaffd8 50%, #8fe07f 100%)", opacity: ip(f, [WIPE + 2, 180], [0, 1], EASE) }} />
    </AbsoluteFill>
  );
};

// ---------- Scene 2 (6-14s): the jungle, and the banana incident ----------
const P_BOBO: V3 = [-1.3, 0, 10.2];
const P_LUMI: V3 = [0, 0, 10.6];
const P_DRACO: V3 = [1.25, 0, 10.3];
const B_UNDER: V3 = [-3.3, 0, 9.3];
const S2 = { eyes: EYES - CUTS[1], run: RUN - CUTS[1], swoop: SWOOP - CUTS[1], grab: GRAB - CUTS[1], skid: SKID - CUTS[1], hang: HANG - CUTS[1] };
const SWOOP_FROM: V3 = [1.5, 6.5, 6.5];

const kikoSwoop = (f: number): { p: V3; flip: number } => {
  if (f < S2.grab) {
    const k = ip(f, [S2.swoop, S2.grab], [0, 1], Easing.in(Easing.quad));
    return { p: lerp3(SWOOP_FROM, up(BUNCH, -0.9), k), flip: 0 };
  }
  const k = ip(f, [S2.grab, S2.hang], [0, 1], Easing.out(Easing.quad));
  return { p: up(lerp3(up(BUNCH, -0.9), HANG_AT, k), Math.sin(k * Math.PI) * 0.8), flip: k };
};

const Scene2: React.FC = () => {
  const f = useCurrentFrame();
  const g = f + CUTS[1];
  const cam = camAt(f, [
    [0, { pos: [0.8, 3.0, 21.5], target: [0, 7, -44], fov: 52 }],
    [55, { pos: [0.4, 2.4, 19.0], target: [0, 6, -44], fov: 50 }],
    [56, { pos: [-1.6, 1.35, 13.4], target: up(BUNCH, -0.35), fov: 40 }],
    [S2.eyes - 1, { pos: [-1.7, 1.4, 13.0], target: up(BUNCH, -0.35), fov: 38 }],
    [S2.eyes, { pos: [-1.3, 1.15, 13.4], target: [-1.3, 1.05, 10.2], fov: 42 }],
    [93, { pos: [-1.3, 1.15, 12.9], target: [-1.3, 1.05, 10.2], fov: 42 }],
    [94, { pos: [1.4, 1.75, 16.0], target: [-2.4, 1.4, 8.6], fov: 48 }],
    [164, { pos: [1.2, 1.7, 15.4], target: [-2.5, 1.45, 8.6], fov: 48 }],
    [165, { pos: [-3.0, 1.3, 12.6], target: [-3.0, 1.25, 9.2], fov: 42 }],
    [240 + XF, { pos: [-3.0, 1.3, 12.2], target: [-3.0, 1.25, 9.2], fov: 42 }],
  ]);
  // the friends drop in from the leafy swirl
  const drop = (p: V3, delay: number) => up(p, (1 - ip(f, [delay, delay + 16], [0, 1], Easing.in(Easing.quad))) * 3);
  const run = ip(f, [S2.run, S2.skid], [0, 1], Easing.in(Easing.quad));
  const boboP = f < S2.run ? drop(P_BOBO, 6) : lerp3(P_BOBO, B_UNDER, run);
  const B = place(cam, boboP, BOBO_S);
  const L = place(cam, drop(P_LUMI, 0), LUMI_S);
  const D = place(cam, drop(P_DRACO, 3), DRACO_S);
  const ks = kikoSwoop(f);
  const K = place(cam, ks.p, KIKO_S);
  const Ksw = screen(cam, SWOOP_FROM);
  const hanging = f >= S2.hang;
  const grabbed = f >= S2.grab;
  const charging = f >= S2.run && f < S2.skid;
  const frozen = f >= S2.skid;
  const eyes = ip(f, [S2.eyes, S2.eyes + 6], [0, 1], BACK(2)) * ip(f, [S2.run + 4, S2.run + 10], [1, 0]);
  const kMouth = mouthAt("kiko", g);
  const laughing = g >= 321 && g < 349;
  const Bs = screen(cam, BUNCH);
  const lookBunch = (who: { x: number }) => ({ x: clamp1((Bs.x - who.x) / 260), y: -1 });
  const twitch = frozen && f > 200 ? (Math.floor(f / 4) % 6 === 0 ? 3 : 0) : 0;
  const glint = screen(cam, up(BUNCH, -0.4));
  const grabPt = screen(cam, up(BUNCH, -0.7));
  return (
    <JungleShot
      cam={cam}
      G={g}
      fade={false}
      over={<AbsoluteFill style={{ background: "radial-gradient(circle at 50% 50%, #ffffff 0%, #eaffd8 50%, #8fe07f 100%)", opacity: ip(f, [0, 16], [1, 0], EASE) }} />}
    >
      <BananaBranch cam={cam} g={g} taken={grabbed ? 1 : 0} />
      {f >= 56 && f < S2.eyes && <Sparkle x={glint.x + 60} y={glint.y} size={ip(f, [56, 62, 66], [10, 70, 30])} color="#fff3a0" rotate={f * 5} />}
      <Lumi x={L.x} y={L.y} scale={L.scale} look={charging || frozen ? { x: -1, y: -0.2 } : { x: 0.1, y: -1 }} expr={frozen ? "surprised" : "happy"} armL={22} armR={-30} headTilt={frozen ? -6 : 0} blink={blinkAt(g, 1)} />
      <Worn L={L} g={g} />
      <HeldFlake L={L} g={g} />
      <Draco x={D.x} y={D.y} scale={D.scale} g={g} mood={frozen ? "surprised" : "excited"} look={charging || frozen ? { x: -1, y: -0.2 } : { x: -0.2, y: -1 }} blink={blinkAt(g, 5)} wing={0.7} flap={Math.sin(f / 5) * 6} armsUp={0.4} glow={0.4} />
      <DustPuffs x={B.x} y={B.y} scale={B.scale} g={g} on={charging ? 1 : ip(f, [S2.skid, S2.skid + 14], [1, 0])} dir={-1} />
      <BoboRider
        g={g}
        x={B.x}
        y={B.y}
        scale={B.scale}
        look={frozen ? { x: 0.6, y: -0.6 } : lookBunch(B)}
        expr={frozen ? "surprised" : "excited"}
        mouth={frozen && kMouth < 0.06 && !laughing ? 0.55 : mouthAt("bobo", g)}
        walk={charging ? f * 1.4 : null}
        armL={charging ? 120 : frozen ? 140 : 40}
        armR={charging ? -120 : frozen ? -140 : -40}
        lean={charging ? -14 : frozen ? ip(f, [S2.skid, S2.skid + 6, S2.skid + 14], [0, 16, 6]) : 0}
        headTilt={twitch}
        squash={ip(f, [S2.skid, S2.skid + 4, S2.skid + 12], [1, 0.86, 1])}
        blink={frozen ? 1 : blinkAt(g, 3)}
        riderLook={frozen ? { x: 0.6, y: -0.6 } : lookBunch(B)}
        riderArmsUp={charging}
      />
      <BoboBigEyes x={B.x} y={B.y} scale={B.scale} g={g} amount={eyes} />
      <SpeedLines x={B.x} y={B.y - 200 * B.scale} scale={B.scale} on={charging ? 1 : 0} dir={-1} />
      {/* Kiko swoops in, steals the banana and lands upside down on the branch */}
      {f >= S2.swoop && !hanging && (
        <>
          <Vine top={{ x: Ksw.x + 120, y: -60 }} end={kikoHand(K.x, K.y, K.scale, -170)} g={g} scale={K.scale} />
          <g transform={`rotate(${ks.flip * 180} ${K.x} ${K.y - 200 * K.scale})`}>
            <Kiko x={K.x} y={K.y} scale={K.scale} g={g} mood="excited" armR={-170} armL={grabbed ? 120 : 40} legs={1} blink={1} tailSwish={1.5} />
            {grabbed && <Banana x={kikoHand(K.x, K.y, K.scale, 120, -1).x} y={kikoHand(K.x, K.y, K.scale, 120, -1).y} scale={0.7 * K.scale} rot={-30} />}
          </g>
        </>
      )}
      {hanging && (
        <KikoUpsideDown
          x={K.x}
          y={K.y}
          scale={K.scale}
          g={g}
          mood={laughing ? "joy" : kMouth > 0.06 ? "excited" : "happy"}
          mouth={laughing ? 0 : kMouth}
          look={{ x: 0.4, y: 0.6 }}
          blink={blinkAt(g, 11)}
          armL={laughing ? 60 + Math.sin(f) * 10 : 150}
          armR={-60}
          legs={0}
          squash={ip(f, [S2.hang, S2.hang + 4, S2.hang + 12], [1, 0.86, 1])}
          lean={laughing ? Math.sin(f * 1.3) * 6 : Math.sin(f / 9) * 4}
          tailSwish={1.2}
          banana
        />
      )}
      <SparkBurst f={f} at={S2.grab} x={grabPt.x} y={grabPt.y} reach={200} count={14} size={12} life={20} />
    </JungleShot>
  );
};

// ---------- Scene 3 (14-25s): Kiko, the missing Heart, and Bobo's banana question ----------
const K_AT: V3 = [-2.1, 0, 9.9];
const LUMI3: V3 = [-0.55, 0, 10.4];
const S3 = { fade: FADE - CUTS[2], deadpan: DEADPAN - CUTS[2] };

const Scene3: React.FC = () => {
  const f = useCurrentFrame();
  const g = f + CUTS[2];
  const cam = camAt(f, [
    [0, { pos: [-1.95, 1.65, 17.6], target: [-1.95, 1.3, 9.6], fov: 46 }],
    [42, { pos: [-1.95, 1.6, 17.2], target: [-1.95, 1.25, 9.6], fov: 46 }],
    [43, { pos: [-0.55, 1.15, 13.6], target: [-0.55, 1.05, 10.4], fov: 42 }],
    [112, { pos: [-0.55, 1.15, 13.3], target: [-0.55, 1.05, 10.4], fov: 42 }],
    [113, { pos: [-2.1, 0.9, 12.6], target: [-2.1, 0.75, 9.9], fov: 42 }],
    [S3.fade - 1, { pos: [-2.1, 0.9, 12.3], target: [-2.1, 0.75, 9.9], fov: 42 }],
    [S3.fade, { pos: [3.7, 1.2, 10.4], target: [3.7, 0.2, 4.5], fov: 46 }],
    [212, { pos: [3.7, 1.1, 9.6], target: [3.7, 0.2, 4.0], fov: 46 }],
    [213, { pos: [-2.65, 1.1, 14.2], target: [-2.65, 0.95, 9.6], fov: 42 }],
    [305, { pos: [-2.65, 1.1, 13.7], target: [-2.65, 0.95, 9.6], fov: 42 }],
    [306, { pos: [-0.55, 1.2, 12.9], target: [-0.55, 1.15, 10.4], fov: 40 }],
    [330 + XF, { pos: [-0.55, 1.2, 12.5], target: [-0.55, 1.15, 10.4], fov: 40 }],
  ]);
  // Kiko flips down from the branch and lands beside the friends
  const k = ip(f, [0, 14], [0, 1], Easing.inOut(Easing.quad));
  const kp: V3 = up(lerp3(HANG_AT, K_AT, k), k < 1 ? Math.sin(k * Math.PI) * 0.6 - (1 - k) * 0.95 : 0);
  const K = place(cam, kp, KIKO_S);
  const B = place(cam, B_UNDER, BOBO_S);
  const L = place(cam, lerp3(P_LUMI, LUMI3, ip(f, [0, 22], [0, 1], EASE)), LUMI_S);
  const D = place(cam, P_DRACO, DRACO_S);
  const kMouth = mouthAt("kiko", g);
  const showChars = f < S3.fade || f >= 213;
  const hideBanana = ip(f, [270, 282], [0, 1], EASE); // Kiko slowly hides it behind his back
  const kArmR = f < 213 ? -40 : lerp(-115, 30, hideBanana);
  const kh = kikoHand(K.x, K.y, K.scale, kArmR);
  const toKiko = (who: { x: number }) => ({ x: clamp1((K.x - who.x) / 260), y: 0 });
  const bananaLook = { x: clamp1((kh.x - B.x) / 200), y: clamp1((kh.y - (B.y - 330 * B.scale)) / 200) };
  const deadpan = f >= S3.deadpan - 6;
  const askBanana = f >= 213 && f < 306;
  return (
    <JungleShot cam={cam} G={g}>
      {showChars && (
        <>
          <BoboRider
            g={g}
            x={B.x}
            y={B.y}
            scale={B.scale}
            look={askBanana ? bananaLook : toKiko(B)}
            expr={askBanana ? (mouthAt("bobo", g) > 0.06 ? "happy" : "excited") : "surprised"}
            mouth={mouthAt("bobo", g)}
            armL={askBanana ? 40 : 20}
            armR={askBanana ? -40 : -20}
            headTilt={askBanana ? 8 : 0}
            blink={blinkAt(g, 3)}
            riderLook={askBanana ? bananaLook : toKiko(B)}
          />
          {askBanana && f < 282 && <BoboBigEyes x={B.x} y={B.y} scale={B.scale} g={g} amount={0.55} />}
          <Lumi
            x={L.x}
            y={L.y}
            scale={L.scale}
            look={deadpan ? { x: -0.25, y: 0.05 } : toKiko(L)}
            expr={deadpan ? "neutral" : f >= 43 && f < 113 ? "happy" : "surprised"}
            mouth={mouthAt("lumi", g)}
            armL={22}
            armR={f >= 43 && f < 80 ? -60 : -20}
            headTilt={deadpan ? -4 : f >= 43 && f < 113 ? 6 : 0}
            blink={deadpan ? 0.42 : blinkAt(g, 1)}
          />
          <Worn L={L} g={g} />
          <HeldFlake L={L} g={g} />
          {deadpan && <DotsBubble x={Math.min(L.x + 170 * L.scale, 830)} y={Math.max(L.y - 690 * L.scale, 270)} scale={Math.min(1.1, L.scale * 0.9)} on={ip(f, [S3.deadpan - 4, S3.deadpan + 14], [0, 1])} />}
          <Draco x={D.x} y={D.y} scale={D.scale} g={g} mood={f > 160 ? "sad" : "surprised"} look={toKiko(D)} blink={blinkAt(g, 5)} wing={0.4} glow={0.4} />
          <Kiko
            x={K.x}
            y={K.y}
            scale={K.scale}
            g={g}
            mood={f >= 113 ? "worried" : kMouth > 0.06 ? "excited" : "happy"}
            mouth={kMouth}
            look={askBanana ? { x: -0.7, y: -0.1 } : f >= 43 ? { x: 0.6, y: -0.1 } : { x: 0.3, y: 0 }}
            blink={blinkAt(g, 11)}
            armL={f < 40 ? 120 + Math.sin(f / 3) * 25 : f >= 113 && f < 168 ? 50 : 15}
            armR={kArmR}
            legs={ip(f, [12, 16], [0.8, 0])}
            squash={ip(f, [14, 17, 24], [1, 0.86, 1])}
            headTilt={f >= 113 ? -5 : 5}
            tailSwish={0.9}
          />
          {(f < 213 || hideBanana < 1) && <Banana x={kh.x} y={kh.y + 8 * K.scale} scale={0.7 * K.scale} rot={-30 + hideBanana * 60} />}
          <SparkBurst f={f} at={14} x={K.x} y={K.y - 200 * K.scale} reach={220} count={16} size={12} life={24} />
        </>
      )}
    </JungleShot>
  );
};

// ---------- Scene 4 (25-32.6s): the temple; Draco's big moment ----------
const C_KIKO: V3 = [-2.05, 0, 2.4];
const C_LUMI: V3 = [-0.95, 0, 2.65];
const C_DRACO: V3 = [0.95, 0, 2.5];
const C_BOBO: V3 = [2.1, 0, 2.25];
const D_FRONT: V3 = [0.15, 0, 1.75];
const S4 = { pose: POSE - CUTS[3], inhale: INHALE - CUTS[3], poof: POOF - CUTS[3], blush: BLUSH - CUTS[3], sym: SYMBOLS - CUTS[3], green: PEND_GREEN - CUTS[3] };

const TempleShot: React.FC<{ cam: Cam3; G: number; fade?: boolean; lit?: number; open?: number; shimmer?: number; light?: number; world?: React.ReactNode; children: React.ReactNode; over?: React.ReactNode }> = ({
  cam,
  G,
  fade = true,
  lit = 0,
  open = 0,
  shimmer = 0,
  light = 0,
  world,
  children,
  over,
}) => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill style={{ opacity: fade ? ip(f, [0, XF], [0, 1]) : 1, background: "#1a1a10" }}>
      <World3D cam={cam} bloom={0.85} threshold={0.7}>
        <TempleChamber t={G / 30} s={lifeState(G)} lit={lit} open={open} shimmer={shimmer} light={light} />
        {world}
      </World3D>
      <Layer G={G}>{children}</Layer>
      {over}
    </AbsoluteFill>
  );
};

const Scene4: React.FC = () => {
  const f = useCurrentFrame();
  const g = f + CUTS[3];
  const t = g / 30;
  const cam = camAt(f, [
    [0, { pos: [0, 2.2, 9.2], target: [0, 1.25, 0.5], fov: 46 }],
    [11, { pos: [0, 2.1, 8.8], target: [0, 1.25, 0.5], fov: 46 }],
    [12, { pos: [0.3, 0.6, 5.3], target: [0.15, 1.05, 1.4], fov: 44 }],
    [125, { pos: [0.3, 0.62, 4.8], target: [0.15, 1.0, 1.4], fov: 44 }],
    [126, { pos: [2.1, 1.0, 5.0], target: [2.1, 0.95, 2.25], fov: 42 }],
    [165, { pos: [2.1, 1.0, 4.7], target: [2.1, 0.95, 2.25], fov: 42 }],
    [166, { pos: [0.15, 0.85, 3.9], target: [0.15, 0.8, 1.75], fov: 42 }],
    [S4.sym + 5, { pos: [0.15, 0.85, 3.7], target: [0.15, 0.8, 1.75], fov: 42 }],
    [S4.sym + 6, { pos: [-2.2, 1.45, 5.4], target: [-1.75, 0.5, 1.6], fov: 46 }],
    [S4.green - 1, { pos: [-2.1, 1.4, 5.1], target: [-1.75, 0.5, 1.6], fov: 46 }],
    [S4.green, { pos: [-0.9, 1.35, 5.4], target: [-0.9, 0.85, 1.6], fov: 44 }],
    [228 + XF, { pos: [-0.9, 1.3, 5.1], target: [-0.9, 0.85, 1.6], fov: 44 }],
  ]);
  const step = ip(f, [S4.pose - 6, S4.pose + 10], [0, 1], EASE);
  const D = place(cam, lerp3(C_DRACO, D_FRONT, step), DRACO_S);
  const L = place(cam, C_LUMI, LUMI_S);
  const B = place(cam, C_BOBO, BOBO_S);
  const K = place(cam, C_KIKO, KIKO_S);
  const posing = f >= S4.pose && f < S4.poof;
  const inhale = ip(f, [S4.inhale, S4.poof - 2], [0, 1]);
  const poofed = f >= S4.poof;
  const deflate = ip(f, [S4.poof, S4.poof + 10], [0, 1], OUT);
  const blush = ip(f, [S4.blush - 30, S4.blush], [0, 1]);
  const laughing = g >= 876 && g < 912;
  const shimmer = ip(f, [S4.sym - 4, S4.sym + 14], [0, 1]);
  const pendGlow = ip(f, [S4.green, S4.green + 14], [0.4, 1], OUT);
  const armR = f >= S4.green ? ip(f, [S4.green, S4.green + 10], [-15, -70], EASE) : -15;
  const hand = lumiHand(L.x, L.y, L.scale, armR);
  const Cg = screen(cam, up(CAGE, 1.4));
  const lookAt = (who: { x: number; y: number }) => ({ x: clamp1((Cg.x - who.x) / 260), y: clamp1((Cg.y - (who.y - 300)) / 300) });
  const lookDraco = (who: { x: number }) => ({ x: clamp1((D.x - who.x) / 260), y: 0 });
  const mouth = { x: D.x, y: D.y - 168 * D.scale };
  return (
    <TempleShot cam={cam} G={g} shimmer={shimmer} world={<HeartOfJungle position={HEART_IN} t={t} glow={0.15} scale={0.62} spin={0.3} />}>
      <Kiko x={K.x} y={K.y} scale={K.scale} g={g} mood={f >= S4.sym ? "surprised" : laughing ? "joy" : "happy"} look={f >= S4.sym ? { x: 0.4, y: 1 } : lookDraco(K)} blink={blinkAt(g, 11)} armL={f >= S4.sym ? 70 : 15} armR={-15} tailSwish={0.8} />
      <Lumi
        x={L.x}
        y={L.y}
        scale={L.scale}
        look={f >= S4.green ? lookAt(L) : lookDraco(L)}
        expr={f >= S4.green ? "excited" : poofed ? "surprised" : "happy"}
        armR={armR}
        armL={22}
        headTilt={f >= S4.green ? 5 : 0}
        blink={blinkAt(g, 1)}
      />
      <Worn L={L} g={g} />
      {f >= S4.green ? (
        <>
          <circle cx={hand.x} cy={hand.y + 24 * L.scale} r={(70 + pendGlow * 90) * L.scale} fill="url(#leafGlow)" opacity={0.3 + pendGlow * 0.6} />
          <ChangingPendant x={hand.x} y={hand.y + 24 * L.scale} scale={0.95 * L.scale} g={g} green={1} glow={pendGlow} />
        </>
      ) : (
        <HeldFlake L={L} g={g} />
      )}
      <BoboRider
        g={g}
        x={B.x}
        y={B.y}
        scale={B.scale}
        look={lookDraco(B)}
        expr={laughing ? "excited" : poofed ? "happy" : "neutral"}
        mouth={mouthAt("bobo", g)}
        armL={laughing ? 50 : 20}
        armR={laughing ? -50 : -20}
        lean={laughing ? Math.sin(f * 0.9) * 7 : 0}
        squash={laughing ? 1 + Math.sin(f * 1.8) * 0.04 : 1}
        blink={laughing ? 0.5 : blinkAt(g, 3)}
        riderLook={lookDraco(B)}
      />
      <Draco
        x={D.x}
        y={D.y}
        scale={D.scale}
        g={g}
        mood={poofed ? (f > S4.poof + 30 ? "sad" : "surprised") : posing ? (inhale > 0 ? "effort" : "excited") : "happy"}
        mouth={poofed && f < S4.poof + 8 ? 0.5 : mouthAt("draco", g)}
        look={posing && inhale <= 0 ? { x: -0.2, y: -0.4 } : poofed && f > S4.poof + 30 ? { x: -0.5, y: 0.5 } : { x: 0, y: 0 }}
        blink={blinkAt(g, 5)}
        wing={posing ? 1 : lerp(1, 0.15, deflate)}
        flap={posing ? Math.sin(f / 4) * 6 : 0}
        armsUp={posing ? 0.9 : lerp(0.9, 0, deflate)}
        breath={posing ? Math.max(0.6, inhale) : lerp(1, 0, deflate)}
        lean={posing ? -6 : 0}
        headTilt={posing ? -8 : poofed && f > S4.poof + 30 ? 8 : 0}
        squash={posing ? 1 + inhale * 0.12 : lerp(0.9, 1, deflate)}
        glow={0.45}
      />
      <SmokePuff x={mouth.x} y={mouth.y} scale={D.scale} age={ip(f, [S4.poof, S4.poof + 40], [0, 1])} />
      <DracoBlush x={D.x} y={D.y} scale={D.scale} amount={blush} />
      {blush > 0.5 && <SweatDrop x={D.x + 110 * D.scale} y={D.y - 300 * D.scale} scale={D.scale * 1.2} g={g} />}
      {posing && f < S4.pose + 30 && <SparkBurst f={f} at={S4.pose} x={D.x} y={D.y - 220 * D.scale} reach={320} count={18} size={14} life={26} />}
      {f >= S4.green && f < S4.green + 26 && <Sparkle x={hand.x} y={hand.y + 24 * L.scale} size={ip(f, [S4.green, S4.green + 8, S4.green + 26], [10, 90, 0])} color="#e8ffd8" rotate={f * 4} />}
    </TempleShot>
  );
};

// ---------- Scene 5 (32.6-42.4s): the cage opens, the jungle blooms, and the bananas are gone ----------
const S5 = { raise: RAISE - CUTS[4], light: LIGHT - CUTS[4], sym: SYM_FIRST - CUTS[4], open: OPEN - CUTS[4], rise: RISE - CUTS[4], out: 108, home: HOME - CUTS[4], bloom: BLOOM - CUTS[4], group: 165, toss: TOSS - CUTS[4], bite: BITE - CUTS[4], turn: TURN - CUTS[4] };
const G_BOBO: V3 = [-1.95, 0, 9.8];
const G_LUMI: V3 = [-0.85, 0, 10.2];
const G_KIKO: V3 = [0.15, 0, 10.4];
const G_DRACO: V3 = [1.05, 0, 10.1];
const SOCKET_AT: V3 = up(SOCKET, 1.3);
const DOOR_OUT: V3 = [TEMPLE_DOOR[0] - 3.6, TEMPLE_DOOR[1], TEMPLE_DOOR[2] + 0.5];
const groupCam = (k: number): Cam3 => ({ pos: [-0.45, 1.65, lerp(18.3, 17.8, k)], target: [-0.45, 1.4, 8], fov: 48 });

const heartPath = (f: number): V3 => {
  const k = ip(f, [S5.out, S5.home], [0, 1], Easing.inOut(Easing.sin));
  const ctrl: V3 = [-6, 22, -30];
  return lerp3(lerp3(DOOR_OUT, ctrl, k), lerp3(ctrl, SOCKET_AT, k), k);
};

const Scene5: React.FC = () => {
  const f = useCurrentFrame();
  const g = f + CUTS[4];
  const t = g / 30;
  if (f < S5.out) {
    const cam = camAt(f, [
      [0, { pos: [-0.5, 1.5, 5.4], target: [-0.3, 1.0, 1.0], fov: 46 }],
      [S5.rise, { pos: [-0.4, 1.45, 5.0], target: [-0.2, 1.1, 0.9], fov: 46 }],
      [S5.out, { pos: [-0.3, 1.2, 4.6], target: [0, 4.0, 0], fov: 48 }],
    ]);
    const step = ip(f, [S5.raise, S5.raise + 16], [0, 1], EASE);
    const L = place(cam, lerp3(C_LUMI, [-0.8, 0, 2.05], step), LUMI_S);
    const K = place(cam, C_KIKO, KIKO_S);
    const D = place(cam, D_FRONT, DRACO_S);
    const B = place(cam, C_BOBO, BOBO_S);
    const armR = ip(f, [S5.raise, S5.raise + 14], [-70, -100], BACK(1.5));
    const hand = lumiHand(L.x, L.y, L.scale, armR);
    const pend = { x: hand.x, y: hand.y + 24 * L.scale };
    const light = ip(f, [S5.light, S5.light + 14], [0, 1], OUT);
    const lit = ip(f, [S5.sym, S5.sym + SYM_STEP * 6], [0, 6]);
    const open = ip(f, [S5.open, S5.open + 14], [0, 1], EASE);
    const riseY = ip(f, [S5.rise, S5.out], [0, 4], Easing.in(Easing.quad));
    const Hs = screen(cam, up(HEART_IN, riseY));
    const opened = f >= S5.open;
    const lookAt = (who: { x: number; y: number }) => ({ x: clamp1((Hs.x - who.x) / 260), y: opened ? -1 : -0.3 });
    return (
      <TempleShot
        cam={cam}
        G={g}
        lit={lit}
        open={open}
        light={light * (1 - open * 0.5)}
        shimmer={1}
        world={
          <>
            <HeartOfJungle position={up(HEART_IN, riseY)} t={t} glow={0.3 + light * 0.6 + open * 0.8} scale={0.62 + ip(f, [S5.open, S5.out], [0, 0.3])} spin={0.6 + open} />
            <LightRing position={up(CAGE, 1.4)} age={ip(f, [S5.light, S5.light + 40], [0, 1])} radius={3.2} flat={false} color="#9fff8f" />
            <LightRing position={up(CAGE, 0.2)} age={ip(f, [S5.light + 12, S5.light + 52], [0, 1])} radius={4} color="#ffd86f" />
            <SparkleBurst3D position={HEART_IN} age={ip(f, [S5.open, S5.open + 34], [0, 1])} reach={3} count={160} seed={43} size={8} colors={["#9fff8f", "#ffd86f", "#ffffff", "#5fe070"]} />
          </>
        }
        over={<AbsoluteFill style={{ background: "#f0ffe0", opacity: ip(f, [S5.out - 8, S5.out], [0, 0.85]) }} />}
      >
        <Kiko x={K.x} y={K.y} scale={K.scale} g={g} mood={opened ? "excited" : "surprised"} look={lookAt(K)} blink={blinkAt(g, 11)} armL={opened ? 140 : 40} armR={opened ? -140 : -15} tailSwish={opened ? 1.4 : 0.6} />
        <Draco x={D.x} y={D.y} scale={D.scale} g={g} mood={opened ? "excited" : "surprised"} look={lookAt(D)} blink={blinkAt(g, 5)} wing={opened ? 1 : 0.5} flap={opened ? Math.sin(f * 0.8) * 22 : 0} armsUp={opened ? 0.9 : 0.3} glow={0.5} />
        <BoboRider g={g} x={B.x} y={B.y} scale={B.scale} look={lookAt(B)} expr={opened ? "excited" : "surprised"} armL={opened ? 120 : 25} armR={opened ? -120 : -25} blink={blinkAt(g, 3)} riderLook={lookAt(B)} riderArmsUp={opened} />
        <Lumi x={L.x} y={L.y} scale={L.scale} look={lookAt(L)} expr={opened ? "excited" : "happy"} armR={armR} armL={30} headTilt={-4} walk={step > 0.02 && step < 0.98 ? f * 0.4 : null} blink={blinkAt(g, 1)} />
        <Worn L={L} g={g} glow={0.8} />
        <circle cx={pend.x} cy={pend.y} r={(90 + light * 120) * L.scale} fill="url(#leafGlow)" opacity={0.5 + light * 0.4} />
        <ChangingPendant x={pend.x} y={pend.y} scale={1.0 * L.scale} g={g} green={1} glow={1} />
        <GreenBeam from={pend} to={screen(cam, up(CAGE, 1.2))} on={light * (1 - open)} g={g} width={60} />
      </TempleShot>
    );
  }
  const heart = heartPath(f);
  const follow = ip(f, [S5.out, S5.home], [0, 1], EASE);
  let cam: Cam3;
  if (f < S5.bloom) {
    cam = { pos: lerp3([2, 3, -16], [14, 10, -10], follow), target: lerp3(heart, lerp3(heart, SOCKET, 0.5), follow), fov: lerp(50, 54, follow) };
  } else if (f < S5.group) {
    const k = Easing.inOut(Easing.cubic)(ip(f, [S5.bloom, S5.group], [0, 1]));
    cam = { pos: lerp3([14, 10, -10], [4.6, 1.4, 9.5], k), target: lerp3(SOCKET, [3.6, 0.4, 3.5], k), fov: lerp(56, 50, k) };
  } else {
    cam = camAt(f, [
      [S5.group, groupCam(0)],
      [S5.turn - 1, groupCam(1)],
      [S5.turn, { pos: [-2.9, 1.9, 11.9], target: up(BUNCH, -0.45), fov: 34 }],
      [S5.turn + 7, { pos: [-2.9, 1.9, 11.4], target: up(BUNCH, -0.45), fov: 34 }],
      [S5.turn + 8, { pos: [-1.95, 1.15, 13.4], target: [-1.95, 1.0, 9.8], fov: 42 }],
      [262, { pos: [-1.95, 1.15, 13.0], target: [-1.95, 1.0, 9.8], fov: 42 }],
      [263, { pos: [0.05, 0.9, 13.1], target: [0.05, 0.8, 10.4], fov: 42 }],
      [294 + XF, { pos: [0.05, 0.9, 12.8], target: [0.05, 0.8, 10.4], fov: 42 }],
    ]);
  }
  const group = f >= S5.group;
  const hop = group && f < S5.toss ? Math.abs(Math.sin((f - S5.group) / 5)) * 0.35 : 0;
  const L = place(cam, G_LUMI, LUMI_S);
  const B = place(cam, G_BOBO, BOBO_S);
  const D = place(cam, up(G_DRACO, group && f < S5.turn ? Math.abs(Math.sin(f / 7)) * 0.2 : 0), DRACO_S);
  const K = place(cam, up(G_KIKO, hop), KIKO_S);
  const So = screen(cam, SOCKET_AT);
  // the banana toss, the bite, the double take
  const caught = f >= S5.toss + 12;
  const kh = kikoHand(K.x, K.y, K.scale, -110);
  const eating = f >= S5.bite - 6 && f < S5.turn;
  const bArm = caught ? (eating ? -150 : -100) : -30;
  const bh = boboHandR(B.x, B.y, B.scale, bArm);
  const toss = ip(f, [S5.toss, S5.toss + 12], [0, 1]);
  const bananaAt = caught ? (eating ? { x: B.x + 20 * B.scale, y: B.y - 262 * B.scale } : bh) : { x: lerp(kh.x, bh.x, toss), y: lerp(kh.y, bh.y, toss) - Math.sin(toss * Math.PI) * 220 * B.scale };
  const bitten = f >= S5.bite ? 1 : 0;
  const bliss = f >= S5.bite + 4 && f < S5.turn;
  const outraged = f >= S5.turn + 8;
  const kikoLaughs = f >= 263;
  const bunchS = screen(cam, up(BUNCH, -0.4));
  return (
    <JungleShot
      cam={cam}
      G={g}
      fade={false}
      heartHome={ip(f, [S5.home, S5.bloom], [0, 1])}
      world={
        <>
          <HeartOfJungle position={f < S5.home ? heart : SOCKET_AT} t={t} glow={f < S5.home ? 1.2 : ip(f, [S5.home, S5.bloom + 10], [1.2, 2.2])} scale={lerp(0.9, 1.9, follow)} spin={1.2} />
          <SparkleBurst3D position={SOCKET_AT} age={ip(f, [S5.bloom, S5.bloom + 50], [0, 1])} reach={26} count={260} seed={23} size={26} gravity={2} colors={["#9fff8f", "#ffd86f", "#ff8fd0", "#7fd8ff", "#ffffff"]} />
          <LightRing position={SOCKET_AT} age={ip(f, [S5.bloom, S5.bloom + 60], [0, 1])} radius={70} color="#9fff8f" />
          <LightRing position={[TEMPLE[0], 1.0, TEMPLE[2]]} age={ip(f, [S5.bloom + 8, S5.bloom + 80], [0, 1])} radius={120} color="#ffd86f" />
          <LightRing position={SOCKET_AT} age={ip(f, [S5.bloom + 4, S5.bloom + 54], [0, 1])} radius={44} flat={false} color="#ffffff" />
        </>
      }
      over={
        <>
          <AbsoluteFill style={{ background: "#f0ffe0", opacity: ip(f, [S5.out, S5.out + 14], [0.85, 0]) }} />
          {f >= S5.bloom && f < S5.bloom + 20 && <AbsoluteFill style={{ background: "#f4ffe8", opacity: ip(f, [S5.bloom, S5.bloom + 3, S5.bloom + 20], [0, 0.5, 0]) }} />}
        </>
      }
    >
      {!group &&
        f < S5.home + 4 &&
        Array.from({ length: 22 }, (_, k) => {
          const tt = f - (k + 1) * 1.2;
          if (tt < S5.out) return null;
          const p = screen(cam, heartPath(tt));
          return <Sparkle key={k} x={p.x + Math.sin(k * 2.1) * 12} y={p.y + Math.cos(k * 1.7) * 12} size={28 * (1 - k / 22)} opacity={1 - k / 22} color={["#9fff8f", "#ffd86f", "#ffffff"][k % 3]} rotate={k * 30 + f * 4} />;
        })}
      {!group && f >= S5.home - 6 && f < S5.bloom + 10 && <circle cx={So.x} cy={So.y} r={ip(f, [S5.home, S5.bloom + 10], [0, 560])} fill="url(#leafGlow)" opacity={ip(f, [S5.home, S5.bloom, S5.bloom + 10], [0, 0.85, 0])} />}
      {group && (
        <>
          <BananaBranch cam={cam} g={g} swap={1} />
          {f >= S5.turn && f < S5.turn + 8 && <Sparkle x={bunchS.x + 70} y={bunchS.y} size={60} color="#ffffff" rotate={f * 6} />}
          <Lumi x={L.x} y={L.y} scale={L.scale} look={outraged ? { x: -0.8, y: 0 } : { x: 0.5, y: -0.4 }} expr={outraged ? "surprised" : "excited"} armR={outraged ? -30 : -140} armL={outraged ? 22 : 140} headTilt={3} blink={blinkAt(g, 1)} />
          <Worn L={L} g={g} glow={1} />
          <Draco x={D.x} y={D.y} scale={D.scale} g={g} mood={outraged ? "surprised" : "joy"} look={outraged ? { x: -1, y: 0 } : { x: -0.6, y: -0.2 }} blink={blinkAt(g, 5)} wing={1} flap={outraged ? 0 : Math.sin(f * 0.9) * 26} armsUp={outraged ? 0.3 : 0.9} glow={0.5} />
          <BoboRider
            g={g}
            x={B.x}
            y={B.y}
            scale={B.scale}
            look={outraged || (f >= S5.turn && f < S5.turn + 8) ? { x: -0.5, y: -1 } : caught ? { x: 0.5, y: -0.5 } : { x: 0.6, y: -0.4 }}
            expr={outraged ? (mouthAt("bobo", g) > 0.06 ? "surprised" : "effort") : bliss ? "happy" : "excited"}
            mouth={bliss ? 0 : mouthAt("bobo", g)}
            armL={outraged ? 150 + Math.sin(f / 2) * 15 : caught ? 30 : 120}
            armR={outraged ? -150 - Math.sin(f / 2) * 15 : bArm}
            squash={ip(f, [S5.turn + 8, S5.turn + 11, S5.turn + 18], [1, 0.82, 1.06])}
            lean={outraged ? Math.sin(f / 3) * 4 : 0}
            blink={bliss ? 0 : blinkAt(g, 3)}
            riderLook={{ x: -0.5, y: -1 }}
            riderArmsUp={outraged}
          />
          {f >= S5.toss && f < S5.turn + 30 && <Banana x={bananaAt.x} y={bananaAt.y} scale={0.75 * B.scale} rot={toss * 540 + (caught ? 40 : 0)} bitten={bitten} />}
          {bliss && [0, 1, 2].map((i) => <Sparkle key={i} x={B.x + (i - 1) * 90 * B.scale} y={B.y - (430 + i * 30) * B.scale} size={18 + (i % 2) * 8} color="#ffd93f" rotate={f * 4 + i * 40} />)}
          <Kiko
            x={K.x}
            y={K.y}
            scale={K.scale}
            g={g}
            mood={kikoLaughs ? "joy" : f >= S5.toss ? "happy" : "excited"}
            mouth={kikoLaughs ? 0 : mouthAt("kiko", g)}
            look={kikoLaughs ? { x: 0.2, y: 0 } : { x: -0.7, y: -0.1 }}
            blink={blinkAt(g, 11)}
            armL={kikoLaughs ? 20 : f < S5.toss ? 150 : 20}
            armR={f < S5.toss + 4 ? (f >= S5.toss - 8 ? -110 : -150) : -20}
            legs={hop > 0.05 ? 0.7 : 0}
            lean={kikoLaughs ? Math.sin(f * 1.3) * 7 : 0}
            squash={kikoLaughs ? 1 + Math.sin(f * 2.2) * 0.04 : 1}
            tailSwish={1.5}
          />
          {/* the real bananas, hidden behind Kiko's back */}
          {kikoLaughs && <BananaBunch x={K.x - 150 * K.scale} y={K.y - 330 * K.scale} scale={K.scale * 1.2} g={g} taken={1} />}
          {f < S5.toss && <SparkBurst f={f} at={S5.group} x={540} y={700} reach={520} count={26} size={18} life={36} rainbow />}
        </>
      )}
    </JungleShot>
  );
};

// ---------- Scene 6 (42.4-50s): the leaf pendant, the desert, and no bananas ----------
const S6 = { give: GIVE - CUTS[5], desert: DESERT - CUTS[5], sulk: SULK - CUTS[5], end: END - CUTS[5] };
const HOLO: V3 = [-0.6, 2.4, 7.9];

const Scene6: React.FC = () => {
  const f = useCurrentFrame();
  const g = f + CUTS[5];
  const t = g / 30;
  const cam = camAt(f, [
    [0, { pos: [-0.45, 1.15, 14.0], target: [-0.45, 1.0, 10.3], fov: 42 }],
    [S6.desert - 1, { pos: [-0.45, 1.15, 13.6], target: [-0.45, 1.0, 10.3], fov: 42 }],
    [S6.desert, { pos: [-0.5, 1.7, 16.6], target: [-0.5, 2.0, 8.5], fov: 46 }],
    [S6.desert + 7, { pos: [-0.5, 1.7, 16.5], target: [-0.5, 2.0, 8.5], fov: 46 }],
    [S6.desert + 8, { pos: [1.05, 0.9, 13.2], target: [1.05, 0.85, 10.1], fov: 40 }],
    [S6.sulk - 6, { pos: [1.05, 0.9, 12.9], target: [1.05, 0.85, 10.1], fov: 40 }],
    [S6.sulk - 5, { pos: [-1.95, 1.1, 13.1], target: [-1.95, 0.95, 9.8], fov: 42 }],
    [S6.sulk + 14, { pos: [-1.95, 1.1, 12.9], target: [-1.95, 0.95, 9.8], fov: 42 }],
    [S6.sulk + 15, { pos: [-0.5, 1.75, 17.0], target: [-0.5, 2.1, 8], fov: 46 }],
    [228, { pos: [-0.5, 1.9, 17.8], target: [-0.5, 2.25, 8], fov: 46 }],
  ]);
  const L = place(cam, G_LUMI, LUMI_S);
  const B = place(cam, G_BOBO, BOBO_S);
  const D = place(cam, G_DRACO, DRACO_S);
  const K = place(cam, G_KIKO, KIKO_S);
  const lumiArm = ip(f, [S6.give + 10, S6.give + 24], [-20, -105], EASE);
  const lh = lumiHand(L.x, L.y, L.scale, lumiArm);
  const kArm = f < S6.give + 30 ? ip(f, [S6.give, S6.give + 12], [15, 80]) : ip(f, [S6.give + 30, S6.give + 44], [80, 15]);
  const kh = kikoHand(K.x, K.y, K.scale, kArm, -1);
  const give = ip(f, [S6.give + 14, S6.give + 30], [0, 1], EASE);
  const leaf = { x: lerp(kh.x, lh.x, give), y: lerp(kh.y, lh.y + 22 * L.scale, give) };
  const project = ip(f, [S6.desert, S6.desert + 22], [0, 1], OUT);
  const projecting = f >= S6.desert;
  const Hs = screen(cam, up(HOLO, 0.45));
  const lookHolo = (who: { x: number }) => ({ x: clamp1((Hs.x - who.x) / 300), y: -1 });
  const sulking = f >= S6.sulk - 5;
  const dMouth = mouthAt("draco", g);
  const joke = g >= 1380 && g < 1404; // "...no giant bananas there!"
  return (
    <JungleShot
      cam={cam}
      G={g}
      world={
        <>
          <DesertHologram position={HOLO} t={t} on={project} scale={0.72} />
          <SparkleBurst3D position={up(HOLO, 0.8)} age={ip(f, [S6.desert, S6.desert + 34], [0, 1])} reach={2.4} count={120} seed={33} colors={["#ffd86f", "#ffffff", "#ffe8b0", "#ffb860"]} />
        </>
      }
      over={<EndCard at={S6.end} top={250} />}
    >
      <BananaBranch cam={cam} g={g} swap={1} />
      {projecting && <path d={`M ${leaf.x - 10} ${leaf.y} L ${Hs.x - 170 * project} ${Hs.y + 130} L ${Hs.x + 170 * project} ${Hs.y + 130} L ${leaf.x + 10} ${leaf.y} Z`} fill="#ffe8a0" opacity={0.18 * project * (0.8 + 0.2 * Math.sin(g / 3))} />}
      <BoboRider
        g={g}
        x={B.x}
        y={B.y}
        scale={B.scale}
        look={sulking ? { x: 0.2, y: 0.8 } : projecting ? lookHolo(B) : { x: 0.8, y: -0.1 }}
        expr={sulking ? "neutral" : projecting ? "surprised" : "happy"}
        armL={sulking ? 6 : projecting ? 50 : 20}
        armR={sulking ? -6 : projecting ? -50 : -20}
        headTilt={sulking ? 10 : 0}
        squash={sulking ? 0.95 : 1}
        blink={sulking ? 0.6 : blinkAt(g, 3)}
        riderLook={projecting ? lookHolo(B) : { x: 0.8, y: 0 }}
      />
      {sulking && <BoboFrown x={B.x} y={B.y} scale={B.scale} tilt={10} />}
      {sulking && f < S6.sulk + 40 && <SweatDrop x={B.x - 120 * B.scale} y={B.y - 360 * B.scale} scale={B.scale} g={g} />}
      <Lumi x={L.x} y={L.y} scale={L.scale} look={projecting ? lookHolo(L) : { x: 0.8, y: -0.2 }} expr={projecting ? "surprised" : "happy"} armR={lumiArm} armL={22} headTilt={projecting ? -5 : 4} blink={blinkAt(g, 1)} />
      <Worn L={L} g={g} glow={0.8} />
      <HeldFlake L={L} g={g} glow={0.6} />
      <Kiko x={K.x} y={K.y} scale={K.scale} g={g} mood={mouthAt("kiko", g) > 0.06 ? "happy" : projecting ? "surprised" : "joy"} mouth={mouthAt("kiko", g)} look={projecting ? lookHolo(K) : { x: -0.8, y: -0.2 }} blink={blinkAt(g, 11)} armL={kArm} armR={-15} tailSwish={1.1} />
      <Draco
        x={D.x}
        y={D.y}
        scale={D.scale}
        g={g}
        mood={joke ? "joy" : dMouth > 0.06 ? "excited" : projecting ? "surprised" : "happy"}
        mouth={dMouth}
        look={joke ? { x: -0.9, y: 0 } : projecting ? lookHolo(D) : { x: -0.5, y: -0.2 }}
        blink={blinkAt(g, 5)}
        wing={projecting ? 0.95 : 0.5}
        flap={projecting ? Math.sin(f / 2.5) * 14 : 0}
        armsUp={projecting ? 0.7 : 0.2}
        headTilt={joke ? -8 : 0}
        glow={0.5}
      />
      <LeafPendant x={leaf.x} y={leaf.y} scale={0.7 * L.scale} g={g} glow={0.5 + project * 0.5} />
      <SparkBurst f={f} at={S6.give + 10} x={kh.x} y={kh.y} reach={140} count={14} size={10} life={22} />
    </JungleShot>
  );
};

export const Episode: React.FC = () => <EpisodeFrame audio="ep08/audio.wav" cuts={CUTS} scenes={[Scene1, Scene2, Scene3, Scene4, Scene5, Scene6]} />;
