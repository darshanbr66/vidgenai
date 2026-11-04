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
import { Ep7Defs } from "../ep07/props";
import { DesertHologram, EnchantedJungle } from "../ep08/world";
import { DustPuffs, DracoBlush, Ep8Defs, Kiko, kikoHand, LeafPendant, SmokePuff, SpeedLines, SweatDrop, TinyFireball, BoboBigEyes, BoboFrown } from "../ep08/props";
import { CACTUS, CRYSTAL_HOME, DOOR_Z, floorY, GoldenDesert, GoldState, SkyCityHologram, SunCrystal, SYMBOLS } from "./world";
import {
  BananaCactus,
  BoboFrazzle,
  BoboPucker,
  DizzyStars,
  Ep9Defs,
  GoldBeam,
  GoldenBanana,
  GoldenCompass,
  IconBubble,
  MirageTree,
  RedNose,
  SandBurst,
  SandFall,
  SandMound,
  SandPile,
  SandStream,
  SandyFace,
  ShakeLines,
  TummyRumble,
  Tumbleweed,
  Zuzu,
  zuzuHand,
} from "./props";

// Episode 9: The Mystery of the Golden Desert

const mouthAt = makeMouthAt(timeline);
export const CUTS = [0, 180, 399, 768, 1083, 1326, 1500];
const BACK = (s: number) => Easing.out(Easing.back(s));
const lerp = (a: number, b: number, k: number) => a + (b - a) * k;
const lerp3 = (a: V3, b: V3, k: number): V3 => [lerp(a[0], b[0], k), lerp(a[1], b[1], k), lerp(a[2], b[2], k)];
const up = (p: V3, h: number): V3 => [p[0], p[1] + h, p[2]];
const clamp1 = (v: number) => Math.max(-1, Math.min(1, v));
const gp = (x: number, z: number): V3 => [x, floorY(x, z), z];
const lookAtPt = (who: { x: number; y: number }, p: { x: number; y: number }, h = 300) => ({ x: clamp1((p.x - who.x) / 260), y: clamp1((p.y - (who.y - h)) / 300) });

// Relative sizes, the same as Episodes 5 to 8
const LUMI_S = 1;
const BOBO_S = 0.91;
const DRACO_S = 1.05;
const KIKO_S = 0.8;
const ZUZU_S = 0.62;

// ---- timed moments in frames; the same numbers (in seconds) are in scripts/ep09_audio.py ----
const GUST = 63;
const FIRE = 88; // ...CHOO
const FRAZZLE = 99;
const WIPE = 164;
const LAND = 196;
const SPOT = 219;
const RUN = 252;
const MIRAGE = 291;
const POKE = 313;
const TROMBONE = 385;
const EARS = 412;
const POP = 435;
const THINK = 627;
const L11 = 643;
const BUZZ = 666;
const L12 = 682;
const L13 = 703;
const RUMBLE = 724;
const SYM_GLOW = 780;
const MATCH = 798;
const KIKO_PUSH = 810;
const BOBO_PUSH = 831;
const BOUNCE = 841;
const SIT = 850;
const HERO = 858;
const INHALE = 909;
const FIRE2 = 922;
const FIZZ = 928;
const SAND = 943;
const BWOMP = 951;
const KIKO_LAUGH = 970;
const TEAM = 1003;
const TOUCH = 1113;
const SYM1 = 1120;
const SYM2 = 1128;
const SYM3 = 1135;
const OPEN = 1144;
const RISE = 1158;
const BURST = 1194;
const SNACK = 1261;
const BANANA = 1297;
const HUG = 1305;
const GIVE = 1329;
const PROJECT = 1342;
const CLINK = 1410;
const END = 1419;

const goldState = (G: number): GoldState => ({ base: 0, waveOn: G >= BURST ? 1 : 0, waveR: ip(G, [BURST, BURST + 80], [0, 170]) });
const SANDY_DRACO = (G: number) => (G < SAND ? 0 : ip(G, [SAND, SAND + 12], [0, 1]) * (G < CUTS[4] ? 1 : 0.55));

const Worn: React.FC<{ L: { x: number; y: number; scale: number }; g: number; glow?: number }> = ({ L, g, glow = 0.4 }) => (
  <MoonPendant x={L.x + 4 * L.scale} y={L.y - 262 * L.scale} scale={0.62 * L.scale} g={g} glow={glow} />
);
// the leaf pendant from Episode 8, held in Lumi's raised right hand
const heldAt = (L: { x: number; y: number; scale: number }, armR: number) => {
  const h = lumiHand(L.x, L.y, L.scale, armR);
  return { x: h.x, y: h.y + 24 * L.scale };
};

const Defs: React.FC = () => (
  <>
    <Ep4Defs />
    <Ep5Defs lit={1} />
    <Ep7Defs />
    <Ep8Defs />
    <Ep9Defs />
  </>
);

const DesertShot: React.FC<{
  cam: Cam3;
  G: number;
  fade?: boolean;
  open?: number;
  lit?: [number, number, number];
  light?: number;
  world?: React.ReactNode;
  children: React.ReactNode;
  over?: React.ReactNode;
}> = ({ cam, G, fade = true, open = 0, lit = [0, 0, 0], light = 0, world, children, over }) => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill style={{ opacity: fade ? ip(f, [0, XF], [0, 1]) : 1, background: "#e8c890" }}>
      <World3D cam={cam} bloom={0.55} threshold={0.82}>
        <GoldenDesert t={G / 30} s={goldState(G)} open={open} lit={lit} light={light} />
        {world}
      </World3D>
      <CharLayer defs={<Defs />} filter="desertLit">
        {children}
      </CharLayer>
      {over}
    </AbsoluteFill>
  );
};

// ---------- Scene 1 (0-6s): the leaf pendant, the desert hologram, a gust of sand and a sneeze ----------
const J_BOBO: V3 = [-1.95, 0, 9.8];
const J_LUMI: V3 = [-0.85, 0, 10.2];
const J_KIKO: V3 = [0.15, 0, 10.4];
const J_DRACO: V3 = [1.05, 0, 10.1];
const J_HOLO: V3 = [-0.6, 2.25, 7.9];
const JUNGLE_LIFE = { base: 1, waveR: 0, waveOn: 0 };

const Scene1: React.FC = () => {
  const f = useCurrentFrame();
  const g = f;
  const shot = f < 56 ? 0 : f < 100 ? 1 : 2;
  const cam = camAt(f, [
    [0, { pos: [-0.45, 1.55, 18.2], target: [-0.45, 1.75, 8.6], fov: 50 }],
    [55, { pos: [-0.45, 1.5, 17.2], target: [-0.45, 1.7, 8.6], fov: 50 }],
    [56, { pos: [0.35, 1.15, 13.4], target: [0.75, 1.15, 9.9], fov: 42 }],
    [99, { pos: [0.4, 1.1, 13.0], target: [0.8, 1.12, 9.9], fov: 42 }],
    [100, { pos: [-1.1, 1.2, 15.2], target: [-1.05, 1.0, 9.9], fov: 48 }],
    [180, { pos: [-1.1, 1.2, 14.6], target: [-1.05, 1.0, 9.9], fov: 48 }],
  ]);
  const hop = f < GUST ? Math.abs(Math.sin((f - 6) / 6)) * ip(f, [6, 10, 52, 58], [0, 0.28, 0.28, 0]) : 0;
  const L = place(cam, J_LUMI, LUMI_S);
  const B = place(cam, J_BOBO, BOBO_S);
  const K = place(cam, J_KIKO, KIKO_S);
  const D = place(cam, up(J_DRACO, hop), DRACO_S);
  const armR = -128;
  const pend = heldAt(L, armR);
  const H = screen(cam, up(J_HOLO, 0.6));
  const face = { x: D.x, y: D.y - 228 * D.scale };
  const mouth = { x: D.x, y: D.y - 168 * D.scale };
  const gust = ip(f, [GUST, GUST + 4, GUST + 22, GUST + 30], [0, 1, 1, 0]);
  const sandy = f < FIRE ? ip(f, [GUST + 2, GUST + 16], [0, 1]) : ip(f, [FIRE, FIRE + 4], [1, 0]);
  const windUp = ip(f, [72, FIRE - 1], [0, 1]);
  const sneezing = f >= FIRE && f < FIRE + 8;
  const frazzled = f >= FRAZZLE;
  const laughing = f >= 154;
  // the fireball: out of Draco's mouth to the left in the close-up, then into Bobo's fur
  const fireAge = shot === 1 ? ip(f, [FIRE, FIRE + 12], [0, 0.6]) : ip(f, [FIRE + 4, FRAZZLE + 2], [0.4, 0.74]);
  const bHead = { x: B.x, y: B.y - 360 * B.scale };
  const fire = shot === 1 ? { x: mouth.x - ip(f, [FIRE, FIRE + 12], [0, 700]), y: mouth.y } : { x: lerp(1200, bHead.x + 30, ip(f, [100, FRAZZLE + 2], [0.7, 1])), y: bHead.y };
  const lookHolo = (who: { x: number; y: number }) => lookAtPt(who, H, 380);
  const kMouth = mouthAt("kiko", g);
  return (
    <AbsoluteFill style={{ background: "#2a4a2a" }}>
      <World3D cam={cam} bloom={0.75} threshold={0.75}>
        <EnchantedJungle t={g / 30} s={JUNGLE_LIFE} camPos={cam.pos} heartHome={1} />
        <DesertHologram position={J_HOLO} t={g / 30} on={ip(f, [0, 14], [0.35, 1], OUT)} scale={0.66 + ip(f, [GUST - 4, GUST + 4, GUST + 20], [0, 0.1, 0])} />
        <SparkleBurst3D position={up(J_HOLO, 0.6)} age={ip(f, [0, 30], [0, 1])} reach={2.6} count={120} seed={9} colors={["#ffd86f", "#ffffff", "#9fff8f", "#ffb860"]} />
      </World3D>
      <CharLayer defs={<Defs />} filter="jungleLit">
        {shot !== 1 && <path d={`M ${pend.x - 10} ${pend.y} L ${H.x - 190} ${H.y + 150} L ${H.x + 190} ${H.y + 150} L ${pend.x + 10} ${pend.y} Z`} fill="#ffe8a0" opacity={0.18 * (0.8 + 0.2 * Math.sin(g / 3))} />}
        {shot !== 1 && (
          <>
            <BoboRider
              g={g}
              x={B.x}
              y={B.y}
              scale={B.scale}
              look={frazzled ? (f < 108 ? { x: 0, y: -0.2 } : { x: 0.7, y: 0 }) : lookHolo(B)}
              expr={frazzled ? (f < 106 ? "surprised" : "neutral") : "excited"}
              mouth={mouthAt("bobo", g)}
              armL={frazzled ? (f < 106 ? 120 : 20) : 40}
              armR={frazzled ? (f < 106 ? -120 : -20) : -40}
              squash={ip(f, [FRAZZLE, FRAZZLE + 3, FRAZZLE + 9], [1, 0.86, 1])}
              blink={frazzled && f >= 106 ? 0.5 : blinkAt(g, 3)}
              riderLook={frazzled ? { x: 0.3, y: -1 } : lookHolo(B)}
              riderArmsUp={frazzled && f < 115}
            />
            <BoboFrazzle x={B.x} y={B.y} scale={B.scale} squash={ip(f, [FRAZZLE, FRAZZLE + 3, FRAZZLE + 9], [1, 0.86, 1])} amount={ip(f, [FRAZZLE, FRAZZLE + 5], [0, 1], BACK(2))} g={g} />
            <Lumi x={L.x} y={L.y} scale={L.scale} look={frazzled ? { x: -0.9, y: 0 } : lookHolo(L)} expr={frazzled ? (f < 110 ? "surprised" : "happy") : "excited"} armR={armR} armL={frazzled ? 60 : 22} headTilt={frazzled && f > 110 ? -6 : 0} blink={blinkAt(g, 1)} />
            <Worn L={L} g={g} />
            <LeafPendant x={pend.x} y={pend.y} scale={0.9 * L.scale} g={g} glow={1} />
            <Kiko
              x={K.x}
              y={K.y}
              scale={K.scale}
              g={g}
              mood={laughing ? "joy" : frazzled ? "surprised" : "excited"}
              mouth={laughing ? 0 : kMouth}
              look={frazzled ? { x: -1, y: 0 } : lookHolo(K)}
              blink={blinkAt(g, 11)}
              armL={laughing ? 70 + Math.sin(f) * 14 : 30}
              armR={laughing ? -70 - Math.sin(f) * 14 : -30}
              legs={laughing ? 0.8 : 0}
              lean={laughing ? ip(f, [154, 162], [0, -72], EASE) + Math.sin(f * 1.4) * 4 : 0}
              squash={laughing ? 1 + Math.sin(f * 2.2) * 0.05 : 1}
              tailSwish={1.4}
            />
          </>
        )}
        <Draco
          x={D.x}
          y={D.y}
          scale={D.scale}
          g={g}
          mood={sneezing ? "effort" : f >= GUST && f < FIRE ? "effort" : f >= FRAZZLE ? "surprised" : "excited"}
          mouth={sneezing ? 0.9 : mouthAt("draco", g)}
          look={f >= FRAZZLE ? { x: -1, y: 0 } : lookHolo(D)}
          blink={f >= GUST && f < FIRE ? 0.25 : blinkAt(g, 5)}
          wing={f < GUST ? 0.95 : 0.5}
          flap={f < GUST ? Math.sin(f / 3) * 16 : 0}
          armsUp={f < GUST ? 0.85 : 0.2}
          headTilt={sneezing ? 10 : f >= GUST && f < FIRE ? -6 - 10 * windUp : 0}
          squash={sneezing ? 0.84 : 1 + 0.07 * windUp}
          lean={sneezing ? -8 : f >= GUST && f < GUST + 20 ? 6 : 0}
          glow={0.45}
        />
        <SandyFace x={D.x} y={D.y} scale={D.scale} amount={sandy} />
        {f >= FRAZZLE && f < 150 && shot === 2 && <SweatDrop x={D.x + 110 * D.scale} y={D.y - 300 * D.scale} scale={D.scale * 1.2} g={g} />}
        <SandStream from={{ x: H.x + 40, y: H.y + 60 }} to={face} on={gust} g={g} width={110 * D.scale + 20} />
        <SandBurst f={f} at={FIRE} x={face.x} y={face.y} scale={D.scale} reach={360} count={30} life={18} />
        <TinyFireball x={fire.x} y={fire.y} scale={(shot === 1 ? 1.3 : 0.75) * D.scale} age={fireAge} />
        {shot === 2 && <SparkBurst f={f} at={FRAZZLE} x={bHead.x} y={bHead.y} reach={180} count={14} size={14} life={18} />}
        <circle cx={pend.x} cy={pend.y} r={ip(f, [0, 20], [100, 900], OUT)} fill="url(#leafGlow)" opacity={ip(f, [0, 3, 26], [1, 1, 0])} />
        <SparkBurst f={f} at={0} x={H.x} y={H.y} reach={560} count={28} size={20} life={32} />
        {/* the golden sand swirl that carries everyone to the desert */}
        {f >= WIPE &&
          Array.from({ length: 70 }, (_, i) => {
            const k = ip(f, [WIPE, 180], [0, 1]);
            const a = i * 2.4 + k * 7;
            const r = (1 - k) * 1000 + 60 + (i % 5) * 20;
            return <circle key={i} cx={540 + Math.cos(a) * r} cy={900 + Math.sin(a) * r * 1.5} r={8 + (i % 4) * 5} fill={i % 3 ? "#f0c27a" : "#fff2cc"} />;
          })}
      </CharLayer>
      <AbsoluteFill style={{ background: "radial-gradient(circle at 50% 47%, #fffbe8 0%, #ffe2a0 45%, #e8b060 100%)", opacity: ip(f, [WIPE + 4, 180], [0, 1], EASE) }} />
    </AbsoluteFill>
  );
};

// ---------- Scene 2 (6-13.3s): the Golden Desert, and the banana mirage ----------
const P_LUMI = gp(0.0, 10.4);
const P_BOBO = gp(-1.25, 10.1);
const P_DRACO = gp(1.25, 10.2);
const P_KIKO = gp(2.3, 10.5);
const B_STOP = gp(-3.72, 4.35);
const N_LUMI = gp(-1.85, 5.25);
const N_DRACO = gp(-0.8, 5.05);
const N_KIKO = gp(-2.85, 5.0);
const S2 = { land: LAND - CUTS[1], spot: SPOT - CUTS[1], run: RUN - CUTS[1], mirage: MIRAGE - CUTS[1], poke: POKE - CUTS[1], trombone: TROMBONE - CUTS[1] };

const Scene2: React.FC = () => {
  const f = useCurrentFrame();
  const g = f + CUTS[1];
  const cam = camAt(f, [
    [0, { pos: [12, 15, 36], target: [-4, 4, -40], fov: 52 }],
    [36, { pos: [2.2, 2.4, 18.0], target: [0, 1.4, 8.5], fov: 50 }],
    [37, { pos: [-0.75, 1.0, 13.3], target: [-1.25, 1.0, 10.1], fov: 40 }],
    [57, { pos: [-0.75, 1.0, 13.0], target: [-1.25, 1.0, 10.1], fov: 40 }],
    [58, { pos: [-3.0, 1.25, 9.6], target: up(CACTUS, 1.25), fov: 44 }],
    [71, { pos: [-3.15, 1.25, 9.3], target: up(CACTUS, 1.25), fov: 44 }],
    [72, { pos: [1.2, 1.4, 13.5], target: [-1.5, 1.0, 8.6], fov: 50 }],
    [110, { pos: [-1.2, 1.25, 10.4], target: [-3.6, 1.0, 5.0], fov: 46 }, ],
    [111, { pos: [-3.05, 1.05, 8.0], target: [-4.15, 1.1, 3.95], fov: 42 }],
    [146, { pos: [-3.1, 1.05, 7.75], target: [-4.15, 1.1, 3.95], fov: 42 }],
    [147, { pos: [-2.85, 1.0, 8.9], target: [-3.05, 0.75, 4.75], fov: 50 }],
    [177, { pos: [-2.85, 1.0, 8.6], target: [-3.05, 0.75, 4.75], fov: 50 }],
    [178, { pos: [-3.0, 1.0, 7.7], target: [-4.1, 1.05, 4.0], fov: 42 }],
    [219 + XF, { pos: [-3.05, 1.0, 7.4], target: [-4.1, 1.05, 4.0], fov: 42 }],
  ]);
  const drop = (p: V3, delay: number) => up(p, (1 - ip(f, [delay, delay + 14], [0, 1], Easing.in(Easing.quad))) * 4);
  const run = ip(f, [S2.run, S2.mirage], [0, 1], Easing.in(Easing.sin));
  const near = f >= 147;
  const jump = ip(f, [S2.poke, S2.poke + 6, S2.poke + 13], [0, 0.55, 0], Easing.inOut(Easing.quad));
  const boboP = f < S2.run ? drop(P_BOBO, S2.land - 14 + 3) : up(lerp3(P_BOBO, B_STOP, run), f >= S2.poke ? jump : 0);
  const B = place(cam, boboP, BOBO_S);
  const L = place(cam, near ? N_LUMI : f >= S2.run ? lerp3(P_LUMI, gp(-1.0, 8.6), run) : drop(P_LUMI, S2.land - 14), LUMI_S);
  const D = place(cam, near ? N_DRACO : drop(P_DRACO, S2.land - 14 + 2), DRACO_S);
  const K = place(cam, near ? N_KIKO : drop(P_KIKO, S2.land - 14 + 5), KIKO_S);
  const C = place(cam, CACTUS, 1.45);
  const charging = f >= S2.run && f < S2.mirage;
  const arrived = f >= S2.mirage;
  const poked = f >= S2.poke;
  const melt = ip(f, [S2.mirage, S2.mirage + 14], [0, 1]);
  const eyes = ip(f, [S2.spot, S2.spot + 6], [0, 1], BACK(2)) * ip(f, [S2.run + 30, S2.run + 38], [1, 0]);
  const pucker = ip(f, [S2.mirage - 8, S2.mirage - 3], [0, 1]) * ip(f, [S2.poke - 2, S2.poke], [1, 0]);
  const pointing = f >= 178;
  const sulk = f >= S2.trombone;
  const kLaugh = f >= 147;
  const Cs = screen(cam, up(CACTUS, 1.2));
  const bSquash = ip(f, [S2.land - 1 + 3, S2.land + 2 + 3, S2.land + 8 + 3], [1, 0.84, 1]) * ip(f, [S2.poke + 13, S2.poke + 15, S2.poke + 22], [1, 0.84, 1]);
  const showOthers = f < 37 || f >= 72;
  const bLook = arrived ? (poked ? { x: 0, y: -0.2 } : { x: -0.6, y: -0.3 }) : lookAtPt(B, Cs, 330);
  const landing = (p: { x: number; y: number; scale: number }, d: number) => <SandBurst f={f} at={S2.land + d} x={p.x} y={p.y} scale={p.scale} reach={240} count={18} life={18} />;
  return (
    <DesertShot cam={cam} G={g} fade={false} over={<AbsoluteFill style={{ background: "radial-gradient(circle at 50% 47%, #fffbe8 0%, #ffe2a0 45%, #e8b060 100%)", opacity: ip(f, [0, 14], [1, 0], EASE) }} />}>
      {/* the banana tree: a shimmering mirage that melts into a cactus */}
      <BananaCactus x={C.x} y={C.y} scale={C.scale} g={g} show={ip(f, [S2.mirage, S2.mirage + 10], [0, 1])} poke={ip(f, [S2.poke - 2, S2.poke, S2.poke + 8], [0, 1, 0])} />
      <MirageTree x={C.x} y={C.y} scale={C.scale * 1.05} g={g} melt={melt} />
      {arrived && f < 150 && <Tumbleweed x={lerp(1250, -250, ip(f, [S2.mirage + 4, S2.mirage + 40], [0, 1]))} y={C.y + 40 * C.scale} scale={C.scale * 0.8} g={g} />}
      {showOthers && (
        <>
          <Lumi x={L.x} y={L.y} scale={L.scale} look={kLaugh ? { x: -0.7, y: 0 } : arrived || charging ? { x: -1, y: -0.2 } : { x: 0, y: -0.6 }} expr={kLaugh ? "happy" : charging ? "surprised" : "excited"} armL={22} armR={-60} headTilt={kLaugh ? -5 : 0} walk={f >= S2.run && f < S2.mirage ? f * 0.45 : null} blink={blinkAt(g, 1)} />
          <Worn L={L} g={g} />
          <LeafPendant {...heldAt(L, -60)} scale={0.7 * L.scale} g={g} glow={0.7} />
          <Draco x={D.x} y={D.y} scale={D.scale} g={g} mood={kLaugh ? "joy" : "excited"} look={kLaugh ? { x: -1, y: 0 } : { x: -0.6, y: -0.6 }} blink={blinkAt(g, 5)} wing={0.8} flap={Math.sin(f / 4) * 10} armsUp={kLaugh ? 0.7 : 0.5} squash={kLaugh ? 1 + Math.sin(f * 1.9) * 0.04 : 1} glow={0.4} />
          <Kiko
            x={K.x}
            y={K.y}
            scale={K.scale}
            g={g}
            mood={kLaugh ? "joy" : "excited"}
            mouth={kLaugh ? 0 : mouthAt("kiko", g)}
            look={{ x: -0.8, y: -0.3 }}
            blink={blinkAt(g, 11)}
            armL={kLaugh ? 80 + Math.sin(f * 1.1) * 20 : 60}
            armR={kLaugh ? -80 - Math.sin(f * 1.1) * 20 : -60}
            legs={kLaugh ? 0.9 + Math.sin(f * 1.3) * 0.1 : 0}
            lean={kLaugh ? -76 + Math.sin(f * 1.3) * 5 : 0}
            squash={kLaugh ? 1 + Math.sin(f * 2.4) * 0.05 : 1}
            tailSwish={1.6}
          />
          {f < 37 && (
            <>
              {landing(L, 0)}
              {landing(D, 2)}
              {landing(K, 5)}
            </>
          )}
        </>
      )}
      <DustPuffs x={B.x} y={B.y} scale={B.scale} g={g} on={charging ? 1 : 0} dir={-1} />
      <BoboRider
        g={g}
        x={B.x}
        y={B.y}
        scale={B.scale}
        look={pointing ? { x: -0.9, y: -0.2 } : bLook}
        expr={sulk ? "neutral" : pointing ? "effort" : poked ? "surprised" : arrived ? "excited" : "excited"}
        mouth={pucker > 0.1 ? 0 : mouthAt("bobo", g)}
        walk={charging ? f * 1.5 : null}
        armL={sulk ? 6 : pointing ? 95 : poked ? 150 : arrived ? 105 : charging ? 120 : f >= S2.spot ? 140 : 40}
        armR={sulk ? -6 : pointing ? -20 : poked ? -150 : arrived ? -105 : charging ? -120 : f >= S2.spot ? -140 : -40}
        lean={sulk ? 4 : charging ? -12 : arrived && !poked ? -8 : 0}
        squash={bSquash}
        headTilt={sulk ? 10 : 0}
        blink={sulk ? 0.55 : pucker > 0.5 ? 0.15 : blinkAt(g, 3)}
        riderLook={arrived ? { x: -0.6, y: -0.3 } : lookAtPt(B, Cs, 420)}
        riderArmsUp={charging || (poked && f < S2.poke + 30)}
      />
      <BoboPucker x={B.x} y={B.y} scale={B.scale} lean={arrived && !poked ? -8 : 0} amount={pucker} />
      <RedNose x={B.x} y={B.y} scale={B.scale} squash={bSquash} amount={ip(f, [S2.poke, S2.poke + 3], [0, 1])} />
      {sulk && <BoboFrown x={B.x} y={B.y} scale={B.scale} tilt={10} />}
      <BoboBigEyes x={B.x} y={B.y} scale={B.scale} g={g} amount={eyes} />
      <SpeedLines x={B.x} y={B.y - 200 * B.scale} scale={B.scale} on={charging ? 1 : 0} dir={-1} />
      {poked && f < S2.poke + 26 && <IconBubble x={B.x + 170 * B.scale} y={B.y - 560 * B.scale} scale={B.scale * 0.9} kind="bang" on={ip(f, [S2.poke, S2.poke + 8], [0, 1])} g={g} />}
      {f >= S2.spot && f < 57 && <Sparkle x={B.x - 40 * B.scale} y={B.y - 340 * B.scale} size={50} color="#fff3a0" rotate={f * 6} />}
      <SandBurst f={f} at={S2.land + 3} x={B.x} y={B.y} scale={B.scale} reach={240} count={18} life={18} />
      <SandBurst f={f} at={S2.mirage} x={B.x} y={B.y} scale={B.scale} reach={300} count={26} life={20} />
    </DesertShot>
  );
};

// ---------- Scene 3 (13.3-25.6s): Zuzu and the riddle ----------
const Z_AT = gp(-1.55, 8.0);
const LUMI3 = gp(-2.75, 6.4);
const BOBO3 = gp(-3.95, 5.7);
const DRACO3 = gp(-1.45, 6.1);
const KIKO3 = gp(-0.45, 6.5);
const S3 = { ears: EARS - CUTS[2], pop: POP - CUTS[2], think: THINK - CUTS[2], l11: L11 - CUTS[2], buzz: BUZZ - CUTS[2], l12: L12 - CUTS[2], l13: L13 - CUTS[2], rumble: RUMBLE - CUTS[2] };

const Scene3: React.FC = () => {
  const f = useCurrentFrame();
  const g = f + CUTS[2];
  const cam = camAt(f, [
    [0, { pos: [-1.9, 0.8, 12.6], target: [-2.1, 0.75, 6.6], fov: 48 }],
    [47, { pos: [-1.9, 0.8, 12.2], target: [-2.1, 0.75, 6.6], fov: 48 }],
    [48, { pos: [-1.0, 0.72, 10.55], target: [-1.6, 0.78, 8.0], fov: 40 }],
    [127, { pos: [-1.05, 0.72, 10.3], target: [-1.6, 0.78, 8.0], fov: 40 }],
    [128, { pos: [-3.75, 1.15, 10.0], target: [-2.75, 1.0, 6.4], fov: 42 }],
    [163, { pos: [-3.7, 1.15, 9.7], target: [-2.75, 1.0, 6.4], fov: 42 }],
    [164, { pos: [-1.2, 0.6, 10.1], target: [-1.55, 0.72, 8.0], fov: 38 }],
    [227, { pos: [-1.2, 0.62, 9.8], target: [-1.55, 0.72, 8.0], fov: 36 }],
    [228, { pos: [-2.0, 1.2, 12.4], target: [-2.1, 0.85, 6.8], fov: 48 }],
    [244, { pos: [-2.0, 1.2, 12.1], target: [-2.1, 0.85, 6.8], fov: 48 }],
    [245, { pos: [-0.85, 1.05, 9.0], target: [-1.45, 1.0, 6.1], fov: 42 }],
    [266, { pos: [-0.85, 1.05, 8.8], target: [-1.45, 1.0, 6.1], fov: 42 }],
    [267, { pos: [-1.2, 0.95, 11.4], target: [-1.5, 0.85, 7.0], fov: 44 }],
    [282, { pos: [-1.2, 0.95, 11.2], target: [-1.5, 0.85, 7.0], fov: 44 }],
    [283, { pos: [0.15, 1.0, 9.6], target: [-0.6, 0.9, 6.6], fov: 42 }],
    [303, { pos: [0.15, 1.0, 9.4], target: [-0.6, 0.9, 6.6], fov: 42 }],
    [304, { pos: [-1.3, 0.9, 11.4], target: [-1.5, 0.8, 7.5], fov: 44 }],
    [325, { pos: [-1.3, 0.9, 11.2], target: [-1.5, 0.8, 7.5], fov: 44 }],
    [326, { pos: [-3.3, 1.05, 9.2], target: [-3.75, 0.95, 5.7], fov: 42 }],
    [369 + XF, { pos: [-3.3, 1.05, 8.9], target: [-3.75, 0.95, 5.7], fov: 42 }],
  ]);
  // Zuzu: ears rise out of the sand, swivel like little radars, then he pops out
  const buried = f < S3.pop;
  const rise = ip(f, [S3.ears, S3.ears + 9], [0, 1], BACK(1.6));
  const popK = ip(f, [S3.pop, S3.pop + 11], [0, 1]);
  const zY = buried ? -1.05 + rise * 0.42 : -0.63 * (1 - popK) + Math.sin(popK * Math.PI) * 0.75;
  const clipped = buried || popK < 0.35;
  const correct = f >= S3.l13 && f < S3.l13 + 24;
  const zHop = correct ? Math.abs(Math.sin((f - S3.l13) / 4)) * 0.3 : 0;
  const Z = place(cam, up(Z_AT, zY + zHop), ZUZU_S);
  const Zbase = place(cam, Z_AT, ZUZU_S);
  const startle = ip(f, [S3.pop, S3.pop + 4, S3.pop + 14], [0, 1, 0]);
  const L = place(cam, LUMI3, LUMI_S);
  const B = place(cam, up(BOBO3, startle * 0.35), BOBO_S);
  const confident = f >= S3.l11 && f < S3.buzz;
  const D = place(cam, confident ? gp(-1.35, 6.5) : DRACO3, DRACO_S);
  const K = place(cam, KIKO3, KIKO_S);
  const zMouth = mouthAt("zuzu", g);
  const swivel = f >= S3.ears + 9 && buried ? Math.sin((f - S3.ears - 9) / 2.2) * 26 : 0;
  const shake = f >= S3.buzz && f < S3.buzz + 16 ? Math.sin((f - S3.buzz) * 1.2) : 0;
  const thinking = f >= S3.think && f < S3.l11 + 4;
  const mystery = ip(f, [164, 172, 222, 228], [0, 1, 1, 0]);
  const zMood = correct ? "joy" : f >= S3.buzz && f < S3.l12 ? "neutral" : f >= 164 && f < 228 ? "sly" : f >= 48 && f < 127 ? (zMouth > 0.06 ? "sly" : "wink") : thinking ? "sly" : f >= S3.l12 ? "happy" : "excited";
  const lookZ = (who: { x: number; y: number }) => lookAtPt(who, { x: Zbase.x, y: Zbase.y - 250 * Zbase.scale }, 330);
  const sadDraco = f >= S3.buzz && f < S3.l13 + 10;
  const lunch = f >= S3.rumble;
  const whisper = f >= S3.l12 - 4 && f < S3.l13;
  const showZ = !(f >= 128 && f < 164) && !(f >= 245 && f < 267) && !(f >= 283 && f < 303) && !(f >= 326);
  const zArmR = f >= 48 && f < 127 ? -150 + Math.sin(f / 3) * 15 : f >= 164 && f < 228 ? -70 : correct ? -160 : -14;
  const zArmL = f >= 164 && f < 228 ? 70 : correct ? 160 : f >= 48 && f < 127 ? 20 : 14;
  const zh = zuzuHand(Z.x, Z.y, Z.scale, zArmR);
  return (
    <DesertShot
      cam={cam}
      G={g}
      over={<AbsoluteFill style={{ background: "radial-gradient(ellipse at 50% 45%, transparent 35%, rgba(70, 30, 90, 0.55) 100%)", opacity: mystery }} />}
    >
      {!(f >= 164 && f < 228) && <Lumi
        x={L.x}
        y={L.y}
        scale={L.scale}
        look={whisper ? { x: 0.8, y: 0 } : lookZ(L)}
        expr={startle > 0.1 ? "surprised" : thinking ? "neutral" : lunch ? "happy" : f >= 128 && f < 164 ? "excited" : "happy"}
        mouth={mouthAt("lumi", g)}
        armL={thinking ? 120 : 22}
        armR={f >= 128 && f < 164 ? -70 : -40}
        headTilt={thinking ? 8 : lunch ? -6 : 0}
        blink={blinkAt(g, 1)}
      />}
      {!(f >= 164 && f < 228) && <Worn L={L} g={g} />}
      {!(f >= 164 && f < 228) && <LeafPendant {...heldAt(L, f >= 128 && f < 164 ? -70 : -40)} scale={0.7 * L.scale} g={g} glow={0.6} />}
      {f < 326 && (
        <BoboRider
          g={g}
          x={B.x}
          y={B.y}
          scale={B.scale}
          look={thinking ? { x: 0.3, y: -0.9 } : lookZ(B)}
          expr={startle > 0.1 ? "surprised" : thinking ? "effort" : "happy"}
          mouth={mouthAt("bobo", g)}
          armL={startle > 0.1 ? 150 : 20}
          armR={startle > 0.1 ? -150 : thinking ? -165 + Math.sin(f / 2) * 8 : -20}
          blink={blinkAt(g, 3)}
          riderLook={lookZ(B)}
          riderArmsUp={startle > 0.1}
        />
      )}
      {lunch && (
        <>
          <BoboRider
            g={g}
            x={B.x}
            y={B.y}
            scale={B.scale}
            look={{ x: 0.5, y: -0.1 }}
            expr={mouthAt("bobo", g) > 0.06 ? "happy" : "excited"}
            mouth={mouthAt("bobo", g)}
            armL={-12}
            armR={12}
            headTilt={8}
            squash={f < S3.rumble + 16 ? 1 + Math.sin(f * 2.5) * 0.03 : 1}
            blink={blinkAt(g, 3)}
            riderLook={{ x: 0.4, y: 0.6 }}
          />
          <TummyRumble x={B.x} y={B.y} scale={B.scale} on={ip(f, [S3.rumble, S3.rumble + 3, S3.rumble + 18, S3.rumble + 24], [0, 1, 1, 0])} g={g} />
          <BoboBigEyes x={B.x} y={B.y} scale={B.scale} g={g} amount={ip(f, [340, 346], [0, 0.55])} />
        </>
      )}
      <Draco
        x={D.x}
        y={D.y}
        scale={D.scale}
        g={g}
        mood={confident ? "excited" : sadDraco ? "sad" : startle > 0.1 ? "surprised" : thinking ? "neutral" : "happy"}
        mouth={mouthAt("draco", g)}
        look={thinking ? { x: -0.2, y: -1 } : lookZ(D)}
        blink={blinkAt(g, 5)}
        wing={confident ? 1 : sadDraco ? 0.15 : 0.5}
        flap={confident ? Math.sin(f / 3) * 10 : 0}
        armsUp={confident ? 0.95 : 0.2}
        breath={confident ? 0.8 : 0}
        headTilt={confident ? -8 : sadDraco ? 8 : 0}
        squash={sadDraco ? ip(f, [S3.buzz, S3.buzz + 6], [1, 0.9]) : 1}
        glow={0.4}
      />
      <Kiko
        x={K.x}
        y={K.y}
        scale={K.scale}
        g={g}
        mood={whisper ? "happy" : correct ? "joy" : thinking ? "neutral" : startle > 0.1 ? "surprised" : "happy"}
        mouth={mouthAt("kiko", g)}
        look={whisper ? { x: -0.9, y: 0 } : lookZ(K)}
        blink={blinkAt(g, 11)}
        armL={whisper ? 150 : thinking ? 140 : correct ? 140 : 20}
        armR={correct ? -140 : -20}
        lean={whisper ? -14 : 0}
        headTilt={thinking ? -10 : whisper ? -8 : 0}
        tailSwish={1.1}
      />
      {thinking && (
        <>
          <IconBubble x={L.x + 140 * L.scale} y={L.y - 640 * L.scale} scale={L.scale * 0.7} kind="question" on={ip(f, [S3.think, S3.think + 5], [0, 1])} g={g} />
          <IconBubble x={B.x - 110 * B.scale} y={B.y - 600 * B.scale} scale={B.scale * 0.7} kind="question" on={ip(f, [S3.think + 1, S3.think + 6], [0, 1])} g={g} tail={1} />
          <IconBubble x={K.x + 120 * K.scale} y={K.y - 560 * K.scale} scale={K.scale * 0.7} kind="dots" on={ip(f, [S3.think + 2, S3.think + 10], [0, 1])} g={g} />
          <IconBubble x={D.x + 130 * D.scale} y={D.y - 520 * D.scale} scale={D.scale * 0.7} kind="question" on={ip(f, [S3.think + 3, S3.think + 8], [0, 1])} g={g} />
        </>
      )}
      {f >= S3.buzz && f < S3.l12 && <IconBubble x={D.x - 150 * D.scale} y={D.y - 520 * D.scale} scale={D.scale * 0.75} kind="x" on={ip(f, [S3.buzz, S3.buzz + 6], [0, 1])} g={g} tail={1} />}
      {f >= S3.l12 + 4 && f < S3.l13 + 20 && <IconBubble x={K.x - 140 * K.scale} y={K.y - 560 * K.scale} scale={K.scale * 0.8} kind="clock" on={ip(f, [S3.l12 + 4, S3.l12 + 12], [0, 1])} g={g} tail={1} />}
      {showZ && (
        <>
          <clipPath id="zuzuGround">
            <rect x={0} y={0} width={1080} height={clipped ? Zbase.y - 60 * Zbase.scale : 1920} />
          </clipPath>
          <g clipPath="url(#zuzuGround)">
          <Zuzu
            x={Z.x}
            y={Z.y}
            scale={Z.scale}
            g={g}
            mood={buried ? "surprised" : zMood}
            mouth={zMouth}
            look={buried ? { x: Math.sin(f / 3), y: 0 } : f >= 48 && f < 228 ? { x: 0, y: 0 } : { x: -0.5, y: -0.2 }}
            blink={blinkAt(g, 13)}
            armL={buried ? 14 : popK < 1 ? 150 : zArmL}
            armR={buried ? -14 : popK < 1 ? -150 : zArmR}
            legs={popK > 0 && popK < 1 ? 1 : correct ? 0.6 : 0}
            squash={ip(f, [S3.pop + 11, S3.pop + 14, S3.pop + 20], [1, 0.84, 1])}
            headTilt={f >= 164 && f < 228 ? -6 : f >= 48 && f < 127 ? 6 : 0}
            headTurn={shake}
            earL={swivel}
            earR={swivel}
            tailWag={correct ? 1.8 : 0.9}
          />
          </g>
          {(buried || popK < 0.35) && <SandMound x={Zbase.x} y={Zbase.y} w={200 * Zbase.scale} h={110 * Zbase.scale} />}
          {f >= 48 && f < 127 && <Sparkle x={zh.x} y={zh.y - 10} size={20 + 10 * Math.sin(f / 3)} color="#fff3a0" rotate={f * 5} />}
          {mystery > 0 &&
            Array.from({ length: 12 }, (_, i) => {
              const a = (i / 12) * Math.PI * 2 + f / 18;
              return <Sparkle key={i} x={Zbase.x + Math.cos(a) * 280 * Zbase.scale} y={Zbase.y - 260 * Zbase.scale + Math.sin(a) * 90 * Zbase.scale} size={14 + (i % 3) * 6} opacity={mystery} color="#ffe8a0" rotate={f * 3 + i * 30} />;
            })}
        </>
      )}
      <SandBurst f={f} at={S3.pop} x={Zbase.x} y={Zbase.y} scale={Zbase.scale} reach={420} count={40} life={24} />
      {correct && <SparkBurst f={f} at={S3.l13} x={Z.x} y={Z.y - 300 * Z.scale} reach={300} count={22} size={16} life={26} rainbow />}
    </DesertShot>
  );
};

// ---------- Scene 4 (25.6-36.1s): the pyramid door; pushing, and Draco's big moment ----------
const R_KIKO = gp(-1.9, -17.6);
const R_LUMI = gp(-0.7, -17.6);
const R_ZUZU = gp(0.45, -17.1);
const R_DRACO = gp(1.55, -17.8);
const R_BOBO = gp(2.75, -17.6);
const K_DOOR = gp(-0.95, -21.2);
const B_DOOR = gp(0.75, -21.0);
const B_SIT = gp(-1.1, -19.2);
const D_HERO = gp(2.25, -20.6);
const Z_TEAM = gp(1.0, -19.1);
const S4 = {
  glow: SYM_GLOW - CUTS[3],
  match: MATCH - CUTS[3],
  kpush: KIKO_PUSH - CUTS[3],
  bpush: BOBO_PUSH - CUTS[3],
  bounce: BOUNCE - CUTS[3],
  sit: SIT - CUTS[3],
  hero: HERO - CUTS[3],
  inhale: INHALE - CUTS[3],
  fire: FIRE2 - CUTS[3],
  fizz: FIZZ - CUTS[3],
  sand: SAND - CUTS[3],
  bwomp: BWOMP - CUTS[3],
  laugh: KIKO_LAUGH - CUTS[3],
  team: TEAM - CUTS[3],
};

const Scene4: React.FC = () => {
  const f = useCurrentFrame();
  const g = f + CUTS[3];
  const cam = camAt(f, [
    [0, { pos: [0.4, 7.0, -7.0], target: [0, 9.5, -40], fov: 54 }],
    [29, { pos: [0.6, 1.4, -11.4], target: [0, 1.9, -20], fov: 50 }],
    [30, { pos: [-0.85, 1.2, -14.9], target: [-0.7, 1.35, -17.6], fov: 42 }],
    [41, { pos: [-0.85, 1.2, -15.1], target: [-0.7, 1.35, -17.6], fov: 42 }],
    [42, { pos: [2.3, 1.0, -17.2], target: [-0.15, 1.15, -21.2], fov: 48 }],
    [89, { pos: [2.2, 1.0, -17.4], target: [-0.15, 1.15, -21.2], fov: 48 }],
    [90, { pos: [3.2, 0.5, -16.9], target: [2.25, 1.2, -20.6], fov: 46 }],
    [153, { pos: [3.05, 0.55, -17.3], target: [2.25, 1.15, -20.6], fov: 44 }],
    [154, { pos: [3.7, 1.25, -16.3], target: [1.3, 1.55, -21.2], fov: 46 }],
    [201, { pos: [3.65, 1.25, -16.5], target: [1.3, 1.55, -21.2], fov: 46 }],
    [202, { pos: [1.05, 1.0, -15.4], target: [1.0, 1.0, -20.2], fov: 54 }],
    [234, { pos: [1.05, 1.0, -15.7], target: [1.0, 1.0, -20.2], fov: 54 }],
    [235, { pos: [1.65, 0.8, -15.5], target: [1.6, 0.9, -19.8], fov: 50 }],
    [315 + XF, { pos: [1.65, 0.8, -15.8], target: [1.6, 0.9, -19.8], fov: 50 }],
  ]);
  const t = g / 30;
  const symGlow = ip(f, [S4.glow, S4.glow + 14], [0, 0.35]);
  const match = f >= S4.match ? 0.35 + 0.65 * Math.max(0, Math.sin(((f - S4.match) / 10) * Math.PI)) : 0;
  // positions over the scene
  const pushing = f >= 42 && f < 154;
  const kp = pushing ? K_DOOR : f >= 154 ? gp(0.0, -20.3) : R_KIKO;
  const bRun = ip(f, [S4.bpush - 8, S4.bounce], [0, 1], Easing.in(Easing.quad));
  const bBack = ip(f, [S4.bounce, S4.sit], [0, 1]);
  const bp = !pushing ? (f >= 154 ? B_SIT : R_BOBO) : f < S4.bounce ? lerp3(B_SIT, B_DOOR, bRun) : up(lerp3(B_DOOR, B_SIT, bBack), Math.sin(bBack * Math.PI) * 0.7);
  const dp = f >= 90 ? D_HERO : R_DRACO;
  const zp = f >= 154 ? Z_TEAM : R_ZUZU;
  const L = place(cam, f >= 42 ? gp(-2.2, -18.4) : R_LUMI, LUMI_S);
  const K = place(cam, kp, KIKO_S);
  const B = place(cam, bp, BOBO_S);
  const D = place(cam, dp, DRACO_S);
  const Z = place(cam, zp, ZUZU_S);
  const kStrain = f >= S4.kpush && f < S4.kpush + 22;
  const sitting = f >= S4.sit;
  const posing = f >= S4.hero && f < S4.fire;
  const inhale = ip(f, [S4.inhale, S4.fire - 2], [0, 1]);
  const fired = f >= S4.fire;
  const deflate = ip(f, [S4.fire, S4.fire + 10], [0, 1], OUT);
  const sandOn = SANDY_DRACO(g);
  const dMouth = { x: D.x, y: D.y - 168 * D.scale };
  const leafSym = screen(cam, SYMBOLS[1]);
  const sunSym = screen(cam, SYMBOLS[2]);
  const fbK = ip(f, [S4.fire, S4.fizz], [0, 1]);
  const fb = { x: lerp(dMouth.x, sunSym.x + 40, fbK), y: lerp(dMouth.y, sunSym.y, fbK) - Math.sin(fbK * Math.PI) * 40 };
  const blinkDeadpan = f >= S4.bwomp + 6 && f < S4.bwomp + 9 ? 0.1 : f >= S4.bwomp + 12 && f < S4.bwomp + 15 ? 0.1 : 1;
  const pillarTop = screen(cam, [2.75, 6.4, -21.6]);
  const kLaugh = f >= S4.laugh && f < S4.team + 20;
  const zTalk = f >= S4.team;
  const flex = f >= 290 && f < 315;
  const pendArm = f >= 30 && f < 42 ? -105 : -40;
  const pend = heldAt(L, pendArm);
  const lookDoor = (who: { x: number; y: number }) => lookAtPt(who, leafSym, 330);
  const lookD = (who: { x: number; y: number }) => lookAtPt(who, { x: D.x, y: D.y - 250 * D.scale }, 300);
  return (
    <DesertShot cam={cam} G={g} lit={[symGlow, Math.max(symGlow, match), symGlow]}>
      {!(f >= 42 && f < 90) && (<>
      <Lumi
        x={L.x}
        y={L.y}
        scale={L.scale}
        look={f >= 154 && f < 235 ? lookD(L) : lookDoor(L)}
        expr={f >= 30 && f < 42 ? "excited" : kLaugh ? "happy" : fired && f < S4.laugh ? "surprised" : "happy"}
        armR={pendArm}
        armL={22}
        headTilt={f >= 30 && f < 42 ? -5 : 0}
        walk={null}
        blink={blinkAt(g, 1)}
      />
      <Worn L={L} g={g} />
      <LeafPendant x={pend.x} y={pend.y} scale={(f >= 30 && f < 42 ? 1.0 : 0.7) * L.scale} g={g} glow={0.5 + match * 0.5} />
      {f >= 30 && f < 42 && <circle cx={pend.x} cy={pend.y} r={120 * L.scale * (0.6 + match)} fill="url(#leafGlow)" opacity={0.6 * match} />}
      </>)}
      <Kiko
        x={K.x}
        y={K.y}
        scale={K.scale}
        g={g}
        mood={kLaugh ? "joy" : kStrain ? "worried" : f >= S4.kpush + 22 && f < 90 ? "surprised" : "happy"}
        mouth={mouthAt("kiko", g)}
        look={kStrain ? { x: 0, y: 0.3 } : lookD(K)}
        blink={kStrain ? 0.3 : blinkAt(g, 11)}
        armL={kStrain ? 95 : kLaugh ? 40 + Math.sin(f) * 10 : 20}
        armR={kStrain ? -40 : kLaugh ? -40 - Math.sin(f) * 10 : -20}
        lean={kStrain ? -16 + Math.sin(f * 2.5) * 2 : kLaugh ? Math.sin(f * 1.3) * 7 : 0}
        squash={kStrain ? 0.94 : kLaugh ? 1 + Math.sin(f * 2.2) * 0.05 : 1}
        tailSwish={1}
      />
      {kStrain && <SweatDrop x={K.x - 100 * K.scale} y={K.y - 380 * K.scale} scale={K.scale} g={g} />}
      <BoboRider
        g={g}
        x={B.x}
        y={B.y}
        scale={B.scale}
        look={sitting ? (f < 154 ? { x: 0, y: 0 } : lookD(B)) : { x: -0.8, y: 0 }}
        expr={kLaugh ? "excited" : sitting ? (f < 154 ? "surprised" : "happy") : f >= S4.bpush - 8 ? "effort" : "happy"}
        mouth={mouthAt("bobo", g)}
        walk={f >= S4.bpush - 8 && f < S4.bounce ? f * 1.3 : null}
        armL={sitting && f < 154 ? 150 : f >= S4.bpush - 8 && f < S4.bounce ? 70 : 20}
        armR={sitting && f < 154 ? -150 : -20}
        lean={f >= S4.bpush - 8 && f < S4.bounce ? -18 : f >= S4.bounce && f < S4.sit ? 20 : kLaugh ? Math.sin(f) * 5 : 0}
        squash={ip(f, [S4.bounce, S4.bounce + 3, S4.bounce + 8], [1, 0.82, 1]) * (sitting ? ip(f, [S4.sit, S4.sit + 3, S4.sit + 10], [1, 0.72, 0.88]) : 1)}
        blink={blinkAt(g, 3)}
        riderLook={{ x: -0.5, y: 0 }}
        riderArmsUp={sitting && f < 154}
      />
      {sitting && f < 120 && <DizzyStars x={B.x} y={B.y - 420 * B.scale * 0.88} scale={B.scale} on={1} g={g} />}
      {!(f >= 42 && f < 90) && <Draco
        x={D.x}
        y={D.y}
        scale={D.scale}
        g={g}
        mood={fired ? (sandOn > 0 ? (kLaugh ? "sad" : "neutral") : "surprised") : posing ? (inhale > 0 ? "effort" : "excited") : f >= S4.bpush ? "joy" : "happy"}
        mouth={fired && f < S4.fire + 6 ? 0.5 : mouthAt("draco", g)}
        look={posing && inhale <= 0 ? { x: 0, y: -0.2 } : fired ? { x: 0, y: 0 } : lookDoor(D)}
        blink={sandOn > 0 ? blinkDeadpan * (kLaugh ? 0.6 : 1) : blinkAt(g, 5)}
        wing={posing ? 1 : fired ? lerp(1, 0.15, deflate) : 0.5}
        flap={posing ? Math.sin(f / 4) * 8 : 0}
        armsUp={posing ? 0.95 : fired ? lerp(0.95, 0, deflate) : 0.3}
        breath={posing ? Math.max(0.7, inhale) : fired ? lerp(1, 0, deflate) : 0}
        lean={posing ? -4 : 0}
        headTilt={posing ? -8 : 0}
        squash={posing ? 1 + inhale * 0.14 : fired ? lerp(0.9, 1, deflate) * (f >= S4.sand && f < S4.sand + 8 ? 0.9 : 1) : 1}
        glow={0.45}
      />}
      <TinyFireball x={fb.x} y={fb.y} scale={0.45 * D.scale} age={ip(f, [S4.fire, S4.fizz + 6], [0.05, 0.99])} dir={1} />
      <SmokePuff x={sunSym.x + 40} y={sunSym.y} scale={D.scale} age={ip(f, [S4.fizz, S4.fizz + 30], [0, 1])} />
      <SandFall x={D.x} top={pillarTop.y} y={D.y - 300 * D.scale} on={ip(f, [S4.sand - 4, S4.sand, S4.sand + 12, S4.sand + 18], [0, 1, 1, 0])} g={g} width={170 * D.scale} />
      <SandPile x={D.x} y={D.y} scale={D.scale} amount={sandOn} g={g} trickle={ip(f, [S4.sand + 10, S4.sand + 40], [1, 0])} />
      <DracoBlush x={D.x} y={D.y} scale={D.scale} amount={ip(f, [S4.laugh + 10, S4.laugh + 30], [0, 1])} />
      {posing && f < S4.hero + 30 && <SparkBurst f={f} at={S4.hero} x={D.x} y={D.y - 220 * D.scale} reach={340} count={18} size={16} life={28} />}
      <Zuzu
        x={Z.x}
        y={Z.y}
        scale={Z.scale}
        g={g}
        mood={zTalk ? (mouthAt("zuzu", g) > 0.06 ? "sly" : "wink") : kLaugh ? "joy" : "happy"}
        mouth={mouthAt("zuzu", g)}
        look={zTalk ? { x: 0, y: 0 } : lookD(Z)}
        blink={blinkAt(g, 13)}
        armR={zTalk && !flex ? -165 : -14}
        armL={flex ? 135 + Math.sin(f / 2) * 10 : 14}
        headTilt={zTalk ? 6 : 0}
        tailWag={1.1}
      />
      {f >= S4.match && f < 42 && <Sparkle x={leafSym.x} y={leafSym.y} size={40 + match * 60} color="#d8ffc8" rotate={f * 4} />}
    </DesertShot>
  );
};

// ---------- Scene 5 (36.1-44.2s): teamwork, the door opens, the Golden Sun Crystal and a golden banana ----------
const T_KIKO = gp(-2.25, -20.5);
const T_LUMI = gp(-0.75, -20.3);
const T_ZUZU = gp(-1.45, -19.4);
const T_DRACO = gp(0.85, -19.8);
const T_BOBO = gp(2.05, -20.2);
const CRYSTAL_IN: V3 = [0, 1.9, DOOR_Z + 0.2];
const S5 = { touch: TOUCH - CUTS[4], s1: SYM1 - CUTS[4], s2: SYM2 - CUTS[4], s3: SYM3 - CUTS[4], open: OPEN - CUTS[4], rise: RISE - CUTS[4], burst: BURST - CUTS[4], snack: SNACK - CUTS[4], banana: BANANA - CUTS[4], hug: HUG - CUTS[4] };

const crystalAt = (G: number): V3 => {
  const k = ip(G, [RISE, BURST], [0, 1], Easing.inOut(Easing.sin));
  return up(lerp3(CRYSTAL_IN, CRYSTAL_HOME, k), G >= BURST ? Math.sin(G / 14) * 0.15 : 0);
};

const Scene5: React.FC = () => {
  const f = useCurrentFrame();
  const g = f + CUTS[4];
  const t = g / 30;
  const aerial = f >= S5.burst && f < 140;
  const cam = aerial
    ? { pos: lerp3([-20, floorY(-20, 14) + 2.4, 14], [-19, floorY(-19, 12) + 3.2, 12], ip(f, [S5.burst, 140], [0, 1])), target: [-6, 3.5, -22] as V3, fov: 58 }
    : camAt(f, [
        [0, { pos: [0.1, 1.35, -12.4], target: [0, 1.75, -21], fov: 56 }],
        [S5.open, { pos: [0.1, 1.35, -12.1], target: [0, 1.8, -21], fov: 56 }],
        [S5.burst - 1, { pos: [0.1, 1.6, -11.4], target: [0, 5.0, -21], fov: 58 }],
        [140, { pos: [0.3, 1.5, -11.0], target: [0, 3.6, -20.5], fov: 56 }],
        [177, { pos: [0.3, 1.5, -11.4], target: [0, 3.6, -20.5], fov: 56 }],
        [178, { pos: [2.65, 1.0, -16.6], target: [2.05, 0.95, -20.2], fov: 42 }],
        [243 + XF, { pos: [2.6, 1.0, -16.9], target: [2.05, 0.95, -20.2], fov: 42 }],
      ]);
  const lit: [number, number, number] = [ip(f, [S5.s1, S5.s1 + 6], [0.35, 1]), ip(f, [S5.s2 - 12, S5.s2 + 6], [0.35, 1]), ip(f, [S5.s3, S5.s3 + 6], [0.35, 1])];
  const open = ip(f, [S5.open, S5.open + 26], [0, 1], EASE);
  const light = ip(f, [S5.open, S5.open + 14], [0, 1]) * ip(f, [S5.burst + 30, S5.burst + 60], [1, 0.5]);
  const celebrate = f >= 140 && f < 178;
  const hop = (ph: number) => (celebrate ? Math.abs(Math.sin((f + ph) / 5)) * 0.3 : 0);
  const L = place(cam, up(T_LUMI, hop(0)), LUMI_S);
  const K = place(cam, up(T_KIKO, hop(3)), KIKO_S);
  const Z = place(cam, up(T_ZUZU, hop(1)), ZUZU_S);
  const D = place(cam, up(T_DRACO, hop(2)), DRACO_S);
  const B = place(cam, up(T_BOBO, hop(4)), BOBO_S);
  const touching = f >= S5.touch && f < S5.burst;
  const armR = touching ? -100 : -40;
  const pend = heldAt(L, armR);
  const leafSym = screen(cam, SYMBOLS[1]);
  const Cs = screen(cam, crystalAt(g));
  const awe = f >= S5.open && !aerial;
  const lookC = (who: { x: number; y: number }) => (awe ? lookAtPt(who, Cs, 330) : lookAtPt(who, leafSym, 330));
  const snack = f >= S5.snack - CUTS[4] + CUTS[4] && f >= 178;
  const bananaIn = ip(f, [S5.banana, S5.banana + 8], [0, 1], OUT);
  const hugging = f >= S5.hug;
  const bananaPos = { x: B.x + 6 * B.scale, y: lerp(B.y - 760 * B.scale, B.y - 205 * B.scale, bananaIn) };
  const zMouth = mouthAt("zuzu", g);
  return (
    <DesertShot
      cam={cam}
      G={g}
      open={open}
      lit={lit}
      light={light}
      world={
        <>
          {f >= S5.rise - 2 && <SunCrystal position={crystalAt(g)} t={t} glow={ip(f, [S5.rise, S5.burst, S5.burst + 10], [0.4, 1, 1.6])} scale={ip(f, [S5.rise, S5.burst], [0.6, 1.3])} spin={1.2} />}
          <SparkleBurst3D position={CRYSTAL_HOME} age={ip(f, [S5.burst, S5.burst + 50], [0, 1])} reach={30} count={280} seed={29} size={22} gravity={2} colors={["#ffd86f", "#ffffff", "#ffb040", "#fff0b0"]} />
          <LightRing position={[0, 0.3, CRYSTAL_HOME[2]]} age={ip(f, [S5.burst, S5.burst + 70], [0, 1])} radius={140} color="#ffd060" />
          <LightRing position={CRYSTAL_HOME} age={ip(f, [S5.burst, S5.burst + 40], [0, 1])} radius={30} flat={false} color="#ffffff" />
          <SparkleBurst3D position={[0, 2.2, DOOR_Z]} age={ip(f, [S5.open, S5.open + 30], [0, 1])} reach={4} count={140} seed={12} colors={["#ffd86f", "#ffffff", "#fff0b0"]} />
        </>
      }
      over={f >= S5.burst && f < S5.burst + 18 ? <AbsoluteFill style={{ background: "#fff6d8", opacity: ip(f, [S5.burst, S5.burst + 2, S5.burst + 18], [0, 0.4, 0]) }} /> : undefined}
    >
      {!aerial && (
        <>
          <Kiko x={K.x} y={K.y} scale={K.scale} g={g} mood={celebrate ? "joy" : awe ? "surprised" : "excited"} look={lookC(K)} blink={blinkAt(g, 11)} armL={celebrate ? 150 : touching ? 100 : 30} armR={celebrate ? -150 : -30} legs={celebrate && hop(3) > 0.05 ? 0.7 : 0} tailSwish={1.4} />
          <Lumi x={L.x} y={L.y} scale={L.scale} look={lookC(L)} expr={celebrate ? "excited" : awe ? "surprised" : "excited"} mouth={mouthAt("lumi", g)} armR={celebrate ? -150 : armR} armL={celebrate ? 150 : 30} blink={blinkAt(g, 1)} />
          <Worn L={L} g={g} glow={0.8} />
          {!celebrate && <LeafPendant x={pend.x} y={pend.y} scale={0.95 * L.scale} g={g} glow={1} />}
          <GoldBeam from={pend} to={leafSym} on={ip(f, [S5.touch, S5.touch + 8], [0, 1]) * ip(f, [S5.open, S5.open + 10], [1, 0])} g={g} width={50} color="#c8ffb0" />
          <Draco x={D.x} y={D.y} scale={D.scale} g={g} mood={celebrate ? "joy" : awe ? "surprised" : "excited"} look={lookC(D)} blink={blinkAt(g, 5)} wing={celebrate || awe ? 1 : 0.6} flap={celebrate ? Math.sin(f * 0.8) * 24 : 0} armsUp={touching || celebrate ? 0.9 : 0.3} glow={0.5} />
          <SandPile x={D.x} y={D.y} scale={D.scale} amount={SANDY_DRACO(g)} g={g} />
          {f < 178 && (
            <BoboRider g={g} x={B.x} y={B.y} scale={B.scale} look={lookC(B)} expr={celebrate ? "excited" : awe ? "surprised" : "excited"} armL={celebrate ? 150 : touching ? 100 : 25} armR={celebrate ? -150 : -25} blink={blinkAt(g, 3)} riderLook={lookC(B)} riderArmsUp={celebrate} />
          )}
          <Zuzu
            x={Z.x}
            y={Z.y}
            scale={Z.scale}
            g={g}
            mood={celebrate ? (zMouth > 0.06 ? "excited" : "joy") : awe ? "surprised" : "happy"}
            mouth={zMouth}
            look={lookC(Z)}
            blink={blinkAt(g, 13)}
            armL={celebrate ? 160 : 20}
            armR={celebrate ? -160 : -20}
            legs={celebrate && hop(1) > 0.05 ? 0.8 : 0}
            earL={awe ? -8 : 0}
            earR={awe ? 8 : 0}
            tailWag={celebrate ? 2 : 1}
          />
          {celebrate && <SparkBurst f={f} at={140} x={540} y={760} reach={520} count={26} size={18} life={36} />}
          {snack && (
            <>
              <BoboRider
                g={g}
                x={B.x}
                y={B.y}
                scale={B.scale}
                look={hugging ? { x: 0, y: 0.3 } : f >= S5.banana ? { x: 0, y: -0.8 } : { x: -0.3, y: -0.2 }}
                expr={hugging ? "happy" : f >= S5.banana ? "surprised" : "excited"}
                mouth={mouthAt("bobo", g)}
                armL={hugging ? -38 : f >= S5.banana ? 60 : 40}
                armR={hugging ? 38 : f >= S5.banana ? -60 : -40}
                headTilt={hugging ? Math.sin(f / 5) * 6 : 6}
                squash={ip(f, [S5.hug, S5.hug + 3, S5.hug + 9], [1, 0.9, 1])}
                blink={hugging ? 0.08 : blinkAt(g, 3)}
                riderLook={{ x: 0, y: -0.6 }}
                riderHappy={hugging}
              />
              <BoboBigEyes x={B.x} y={B.y} scale={B.scale} g={g} amount={f < S5.banana ? 0.6 : 0} />
              {f >= S5.banana && <GoldenBanana x={bananaPos.x} y={bananaPos.y} scale={B.scale * 1.05} rot={hugging ? -10 : Math.sin(f / 3) * 20} g={g} />}
              <SparkBurst f={f} at={S5.banana} x={B.x} y={B.y - 600 * B.scale} reach={240} count={18} size={16} life={22} />
              {hugging && <IconBubble x={B.x + 170 * B.scale} y={B.y - 560 * B.scale} scale={B.scale * 0.8} kind="hearts" on={ip(f, [S5.hug, S5.hug + 8], [0, 1])} g={g} />}
            </>
          )}
        </>
      )}
    </DesertShot>
  );
};

// ---------- Scene 6 (44.2-50s): the golden compass, the sky city, and a very hard banana ----------
const F_LUMI = gp(-0.75, -18.6);
const F_ZUZU = gp(0.35, -18.15);
const F_KIKO = gp(-2.0, -18.9);
const F_DRACO = gp(1.4, -18.6);
const F_BOBO = gp(2.45, -18.9);
const HOLO: V3 = [0.2, 3.05, -20.2];
const S6 = { give: GIVE - CUTS[5], project: PROJECT - CUTS[5], clink: CLINK - CUTS[5], end: END - CUTS[5] };

const Scene6: React.FC = () => {
  const f = useCurrentFrame();
  const g = f + CUTS[5];
  const t = g / 30;
  const cam = camAt(f, [
    [0, { pos: [-0.15, 1.0, -14.3], target: [-0.2, 1.0, -18.4], fov: 50 }],
    [21, { pos: [-0.15, 1.05, -14.5], target: [-0.2, 1.05, -18.4], fov: 50 }],
    [22, { pos: [1.6, 0.95, -15.2], target: [1.45, 1.45, -18.6], fov: 54 }],
    [77, { pos: [1.6, 0.95, -15.5], target: [1.45, 1.45, -18.6], fov: 54 }],
    [78, { pos: [2.85, 1.0, -15.9], target: [2.45, 0.95, -18.9], fov: 40 }],
    [94, { pos: [2.85, 1.0, -16.1], target: [2.45, 0.95, -18.9], fov: 40 }],
    [95, { pos: [0.2, 1.3, -11.0], target: [0, 2.7, -19.5], fov: 60 }],
    [174, { pos: [0.2, 1.5, -10.3], target: [0, 2.9, -19.5], fov: 60 }],
  ]);
  const L = place(cam, F_LUMI, LUMI_S);
  const Z = place(cam, F_ZUZU, ZUZU_S);
  const K = place(cam, F_KIKO, KIKO_S);
  const D = place(cam, F_DRACO, DRACO_S);
  const B = place(cam, F_BOBO, BOBO_S);
  const lumiArm = ip(f, [S6.give + 4, S6.give + 12], [-30, -95], EASE);
  const lh = lumiHand(L.x, L.y, L.scale, lumiArm);
  const zArm = f < S6.give + 14 ? ip(f, [0, S6.give + 4], [-30, -95]) : ip(f, [S6.give + 14, S6.give + 24], [-95, -14]);
  const zh = zuzuHand(Z.x, Z.y, Z.scale, zArm, -1);
  const give = ip(f, [S6.give + 4, S6.give + 13], [0, 1], EASE);
  const comp = { x: lerp(zh.x, lh.x, give), y: lerp(zh.y, lh.y + 20 * L.scale, give) };
  const project = ip(f, [S6.project, S6.project + 22], [0, 1], OUT);
  const projecting = f >= S6.project;
  const Hs = screen(cam, up(HOLO, 0.6));
  const lookH = (who: { x: number; y: number }) => (projecting ? lookAtPt(who, Hs, 380) : { x: 0, y: 0 });
  const dMouth = mouthAt("draco", g);
  const clinked = f >= S6.clink;
  const biting = f >= S6.clink - 6 && f < S6.clink + 12;
  const bMouthPt = { x: B.x, y: B.y - 262 * B.scale };
  return (
    <DesertShot
      cam={cam}
      G={g}
      open={1}
      lit={[1, 1, 1]}
      light={0.5}
      world={
        <>
          <SunCrystal position={crystalAt(g)} t={t} glow={1.2} scale={1.3} spin={1} />
          <SkyCityHologram position={HOLO} t={t} on={project} scale={0.72} />
          <SparkleBurst3D position={up(HOLO, 0.6)} age={ip(f, [S6.project, S6.project + 34], [0, 1])} reach={2.4} count={120} seed={36} colors={["#bfe6ff", "#ffffff", "#ffe8b0", "#ffd36a"]} />
        </>
      }
      over={<EndCard at={S6.end} top={250} />}
    >
      {projecting && <path d={`M ${comp.x - 10} ${comp.y} L ${Hs.x - 190 * project} ${Hs.y + 150} L ${Hs.x + 190 * project} ${Hs.y + 150} L ${comp.x + 10} ${comp.y} Z`} fill="#ffe8a0" opacity={0.2 * project * (0.8 + 0.2 * Math.sin(g / 3))} />}
      <Kiko x={K.x} y={K.y} scale={K.scale} g={g} mood={clinked && f < 120 ? "joy" : projecting ? "surprised" : "happy"} look={clinked && f < 120 ? { x: 1, y: 0 } : lookH(K)} blink={blinkAt(g, 11)} armL={projecting ? 60 : 20} armR={-20} tailSwish={1.1} />
      <Lumi x={L.x} y={L.y} scale={L.scale} look={projecting ? lookH(L) : { x: 0.8, y: 0.2 }} expr={projecting ? "surprised" : "happy"} armR={lumiArm} armL={22} headTilt={projecting ? -4 : 4} blink={blinkAt(g, 1)} />
      <Worn L={L} g={g} glow={0.8} />
      <Zuzu x={Z.x} y={Z.y} scale={Z.scale} g={g} mood={projecting ? "sly" : "happy"} mouth={mouthAt("zuzu", g)} look={projecting ? lookH(Z) : { x: -0.8, y: -0.2 }} blink={blinkAt(g, 13)} armL={zArm * -1 > 0 && f < S6.give + 24 ? -zArm : 14} armR={-14} tailWag={1.2} />
      <GoldenCompass x={comp.x} y={comp.y} scale={0.5 * L.scale} g={g} open={project} glow={0.5 + project * 0.5} />
      <Draco
        x={D.x}
        y={D.y}
        scale={D.scale}
        g={g}
        mood={dMouth > 0.06 ? (f > 50 ? "surprised" : "excited") : projecting ? "excited" : "happy"}
        mouth={dMouth}
        look={projecting ? lookH(D) : { x: -0.5, y: -0.2 }}
        blink={blinkAt(g, 5)}
        wing={projecting ? 0.95 : 0.5}
        flap={projecting ? Math.sin(f / 2.5) * 14 : 0}
        armsUp={projecting ? 0.7 : 0.2}
        headTilt={f > 50 && f < 78 ? 8 : 0}
        glow={0.5}
      />
      <SandPile x={D.x} y={D.y} scale={D.scale} amount={0.55} g={g} trickle={f > 46 && f < 80 ? 1 : 0} />
      <BoboRider
        g={g}
        x={B.x}
        y={B.y}
        scale={B.scale}
        look={clinked ? { x: 0, y: 0 } : f >= 78 ? { x: 0, y: 0.5 } : lookH(B)}
        expr={clinked ? "effort" : f >= 78 ? "excited" : projecting ? "surprised" : "happy"}
        mouth={biting && !clinked ? 0.8 : mouthAt("bobo", g)}
        armL={f >= 78 ? -30 : 20}
        armR={f >= 78 ? 30 : -20}
        squash={ip(f, [S6.clink, S6.clink + 2, S6.clink + 8], [1, 0.9, 1])}
        lean={clinked && f < S6.clink + 14 ? Math.sin(f * 3) * 3 : 0}
        blink={clinked && f < S6.clink + 20 ? 0.08 : blinkAt(g, 3)}
        riderLook={projecting ? lookH(B) : { x: 0, y: 0 }}
        riderArmsUp={clinked && f < S6.clink + 30}
      />
      <GoldenBanana x={f >= 78 ? (biting ? bMouthPt.x + 8 * B.scale : B.x + 4 * B.scale) : B.x + 4 * B.scale} y={f >= 78 ? (biting ? bMouthPt.y + 16 * B.scale : B.y - 215 * B.scale) : B.y - 205 * B.scale} scale={B.scale * 1.0} rot={biting ? 70 : -10} g={g} shine={clinked ? 1 : 0.5} />
      <ShakeLines x={bMouthPt.x} y={bMouthPt.y} scale={B.scale} on={ip(f, [S6.clink, S6.clink + 2, S6.clink + 14, S6.clink + 20], [0, 1, 1, 0])} g={g} />
      <DizzyStars x={B.x} y={B.y - 430 * B.scale} scale={B.scale} on={ip(f, [S6.clink + 2, S6.clink + 6, S6.clink + 30, S6.clink + 40], [0, 1, 1, 0])} g={g} />
      <SparkBurst f={f} at={S6.give + 4} x={zh.x} y={zh.y} reach={140} count={14} size={10} life={22} />
    </DesertShot>
  );
};

export const Episode: React.FC = () => <EpisodeFrame audio="ep09/audio.wav" cuts={CUTS} scenes={[Scene1, Scene2, Scene3, Scene4, Scene5, Scene6]} />;
