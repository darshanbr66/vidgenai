import React from "react";
import { AbsoluteFill, Easing, useCurrentFrame } from "remotion";
import timeline from "./timeline.json";
import { blinkAt, Lumi } from "../story/characters";
import { Sparkle } from "../story/scenery";
import { Draco, Ep4Defs } from "../ep04/props";
import { BoboRider, EASE, EndCard, EpisodeFrame, fontFamily, ip, lumiHand, makeMouthAt, OUT, SparkBurst, XF } from "../kit";
import { Cam3, World3D } from "../kit3d/World";
import { camAt, CharLayer, place, screen, V3 } from "../kit3d/overlay";
import { LightRing, SparkleBurst3D } from "../kit3d/magic";
import { Ep5Defs, MoonPendant } from "../ep05/props";
import { Ep6Defs } from "../ep06/props";
import { Ep7Defs } from "../ep07/props";
import { Banana, BoboBigEyes, DracoBlush, Ep8Defs, Kiko, kikoHand, SmokePuff, SweatDrop } from "../ep08/props";
import { floorY } from "../ep08/world";
import { DizzyStars, Ep9Defs, IconBubble, ShakeLines } from "../ep09/props";
import { Ep10Defs } from "../ep10/props";
import { Cloud } from "../ep10/world";
import { Ep11Defs } from "../ep11/props";
import { RainbowBridgeHologram, TimeForest } from "../ep12/world";
import { Ep12Defs, PocketClock, Tock } from "../ep12/props";
import { BRIDGE_H, CHAMBER_Z, FALLS_POOL, HEART_AT, isleAt, MusicBoxHologram, onBridge, RainbowSky, SkyState, socketAt } from "./world";
import {
  BananaRailThought,
  CloudFluff,
  ColorOrb,
  colorPath,
  ColorWord,
  Ep13Defs,
  HeartPic,
  mixC,
  MusicNotes,
  Pico,
  PICO_FLASH,
  PICO_GREEN,
  PuffCloud,
  RainbowBanana,
  RainbowFlower,
  SevenColors,
  Stone,
  ThoughtBubble,
  TinyFlame,
} from "./props";

// Episode 13: The Mystery of the Rainbow Bridge

const mouthAt = makeMouthAt(timeline);
const F = (s: number) => Math.round(s * 30);
export const CUTS = [0, F(6.4), F(24.2), F(40.8), F(58.4), F(77.6), F(93.8), F(115.6)];
const lerp = (a: number, b: number, k: number) => a + (b - a) * k;
const lerp3 = (a: V3, b: V3, k: number): V3 => [lerp(a[0], b[0], k), lerp(a[1], b[1], k), lerp(a[2], b[2], k)];
const up = (p: V3, h: number): V3 => [p[0], p[1] + h, p[2]];
const add3 = (a: V3, b: V3): V3 => [a[0] + b[0], a[1] + b[1], a[2] + b[2]];
const clamp1 = (v: number) => Math.max(-1, Math.min(1, v));
const lookAtPt = (who: { x: number; y: number }, p: { x: number; y: number }, h = 300) => ({ x: clamp1((p.x - who.x) / 260), y: clamp1((p.y - (who.y - h)) / 300) });
const talk = (who: string, g: number) => Math.sin(g / 4.3 + who.length) * 4.5 * Math.min(1, mouthAt(who, g) * 3);
const hopArc = (k: number, h: number) => Math.sin(Math.max(0, Math.min(1, k)) * Math.PI) * h;
type Pt = { x: number; y: number; scale: number };

const LUMI_S = 1;
const BOBO_S = 0.91;
const DRACO_S = 1.05;
const KIKO_S = 0.8;
const TOCK_S = 0.62;
const PICO_S = 0.55;

// ---- timed moments in frames; the same numbers (in seconds) are in scripts/ep13_audio.py ----
const L1 = F(0.7);
const L2 = F(3.3);
const JUMP = F(5.2);
const LAND = F(6.9);
const RED_PALE = F(9.0);
const BOBO_STEP = F(10.4);
const HOLE = F(10.9);
const L3 = F(11.3);
const KIKO_JUMP = F(13.6);
const KIKO_UP = F(14.6);
const BLUE_GREY = F(15.6);
const L5 = F(16.2);
const PUFF = F(18.9);
const L6 = F(20.0);
const WIGGLE = F(24.6);
const PEEK = F(25.3);
const L7 = F(25.8);
const L8 = F(28.1);
const KIKO_SNEAK = F(32.0);
const L9 = F(33.0);
const FLASH = F(33.4);
const FLASH_LEN = 45;
const L10 = F(35.4);
const L11 = F(38.8);
const L12 = F(41.2);
const FLOWER = F(44.1);
const ORB_RED = F(44.9);
const FALLS = F(45.9);
const ORB_BLUE = F(46.7);
const SUN = F(47.6);
const L13 = F(48.0);
const SWAP = F(49.7);
const BITE = F(50.3);
const L14 = F(51.4);
const FLY = F(53.5);
const CATCH = F(54.3);
const L15 = F(55.2);
const L16 = F(56.7);
const L17 = F(59.0);
const WORDS = [1.63, 2.24, 2.68, 3.23, 3.84, 4.25, 5.15].map((w) => L17 + F(w));
const L18 = F(65.1);
const ORBS = F(67.5);
const ORB_STEP = 9;
const BANANA = F(69.4);
const GOLD = F(69.6);
const L19 = F(70.3);
const L20 = F(72.7);
const KIKO_ORANGE = F(74.6);
const OPEN = F(75.2);
const L21 = F(75.6);
const L22 = F(78.2);
const L23 = F(80.8);
const RING = F(83.5);
const FLAME = F(84.3);
const TRIP = F(85.3);
const BURST = F(85.6);
const GLOW = F(86.0);
const L24 = F(86.4);
const RESTORE = F(87.9);
const L25 = F(89.9);
const PRANK = F(96.8);
const HIDE = F(97.3);
const L26 = F(97.9);
const RBANANA = F(100.2);
const L27 = F(100.5);
const STEAL = F(103.1);
const L28 = F(103.5);
const LAUGH = F(104.1);
const PROJECT = F(105.7);
const L29 = F(106.3);
const END = F(110.3);

const Worn: React.FC<{ L: Pt; g: number; glow?: number }> = ({ L, g, glow = 0.4 }) => <MoonPendant x={L.x + 4 * L.scale} y={L.y - 262 * L.scale} scale={0.62 * L.scale} g={g} glow={glow} />;
const Defs: React.FC<{ lit?: number }> = ({ lit = 1 }) => (
  <>
    <Ep4Defs />
    <Ep5Defs lit={1} />
    <Ep6Defs />
    <Ep7Defs />
    <Ep8Defs />
    <Ep9Defs />
    <Ep10Defs />
    <Ep11Defs />
    <Ep12Defs />
    <Ep13Defs lit={lit} />
  </>
);

// ---------- the state of the rainbow over the whole episode (global frame g) ----------
const skyAt = (g: number): SkyState => {
  const later = ip(g, [CUTS[4], CUTS[5] + 200], [1, 0.75]);
  const sat = [
    ip(g, [RED_PALE, RED_PALE + 40], [1, 0.2]),
    ip(g, [RED_PALE, CUTS[4]], [1, 0.55]) * later,
    ip(g, [BLUE_GREY, BLUE_GREY + 30], [1, 0.75]) * later,
    ip(g, [RED_PALE, CUTS[4]], [1, 0.6]) * later,
    ip(g, [BLUE_GREY, BLUE_GREY + 40], [1, 0.12]),
    ip(g, [RED_PALE, CUTS[4]], [1, 0.5]) * later,
    ip(g, [RED_PALE, CUTS[4]], [1, 0.55]) * later,
  ];
  const holeK = g < CUTS[2] ? ip(g, [HOLE, HOLE + 15], [0, 1]) : 0;
  const restored = g >= RESTORE;
  return {
    amt: restored ? ip(g, [RESTORE, CUTS[6] + 60], [0.4, 1]) : ip(g, [CUTS[1], CUTS[3]], [0.8, 0.4]),
    drift: restored ? ip(g, [CUTS[6], CUTS[6] + 80], [1, 0], EASE) : ip(g, [CUTS[1] + 60, CUTS[3] + 60], [0, 1], EASE),
    bridge: {
      sat,
      flick: [0, 0, ip(g, [BLUE_GREY, BLUE_GREY + 10], [0, 1]), 0, 0, 0, 0],
      hole: [0, 0, holeK * 0.4, holeK, holeK, holeK * 0.4, 0],
      holeZ: -1.3,
      holeR: 1.6,
      fillR: ip(g, [RESTORE, CUTS[6] + 80], [0, 0.52], Easing.inOut(Easing.quad)),
      fillOn: restored ? 1 : 0,
      bright: 1.15,
    },
    cloudsGone: ip(g, [RED_PALE, CUTS[4]], [0, 0.6]),
    cloudsBack: ip(g, [CUTS[6] + 10, CUTS[6] + 70], [0, 1]),
    isleCol: { flower: ip(g, [CUTS[6], CUTS[6] + 60], [0.12, 1]), falls: ip(g, [CUTS[6], CUTS[6] + 60], [0.12, 1]), sun: ip(g, [CUTS[6], CUTS[6] + 60], [0.12, 1]) },
    rainFalls: ip(g, [CUTS[6] + 20, CUTS[6] + 70], [0, 1]),
    threads: restored ? ip(g, [CUTS[6], CUTS[6] + 60], [0.1, 1]) : ip(g, [CUTS[1], CUTS[3]], [0.7, 0.1]),
  };
};

// Pico's body colour over the episode: it changes whenever Pico is startled
const picoLook = (g: number): { color: string; rainbow: number } => {
  if (g >= PEEK && g < PEEK + 12) return { color: colorPath([PICO_GREEN, "#ff7a9a", "#ffd04a", "#ff7a9a"], ((g - PEEK) / 12) * 3), rainbow: 0 };
  if (g >= PEEK + 12 && g < L7 + 40) return { color: mixC("#ff7a9a", PICO_GREEN, ip(g, [L7 + 22, L7 + 40], [0, 1])), rainbow: 0 };
  if (g >= FLASH && g < FLASH + FLASH_LEN) return { color: colorPath(PICO_FLASH, ((g - FLASH) / FLASH_LEN) * 7), rainbow: 0 };
  if (g >= FLASH + FLASH_LEN && g < L11) {
    // during Bobo's question Pico drifts through blue, green and purple, then goes full rainbow
    const c = colorPath(["#5aa8ff", "#5aa8ff", PICO_GREEN, "#c07aff", "#c07aff"], ip(g, [FLASH + FLASH_LEN, L10 + 14, L10 + 30, L10 + 46, L10 + 60], [0, 1, 2, 3, 4]));
    return { color: c, rainbow: ip(g, [L10 + 58, L10 + 66, L11 - 4, L11 + 6], [0, 1, 1, 0]) };
  }
  if (g >= CUTS[5] && g < GLOW) return { color: mixC(PICO_GREEN, "#8aa4c8", ip(g, [CUTS[5], CUTS[5] + 20], [0.4, 1])), rainbow: 0 };
  if (g >= GLOW && g < CUTS[6]) return { color: PICO_GREEN, rainbow: ip(g, [GLOW, GLOW + 12, RESTORE + 30, RESTORE + 60], [0, 1, 1, 0.25]) };
  if (g >= HIDE - 4) return { color: PICO_GREEN, rainbow: ip(g, [HIDE - 4, HIDE + 6], [0, 1]) };
  return { color: PICO_GREEN, rainbow: 0 };
};

const SkyShot: React.FC<{
  cam: Cam3;
  G: number;
  gate?: { filled: number[]; open: number; banana?: number };
  chamber?: { lit: number; pedestal: number };
  heart?: { sat: number; glow: number };
  portal?: number;
  world?: React.ReactNode;
  children: React.ReactNode;
  over?: React.ReactNode;
  fade?: boolean;
  shake?: number;
}> = ({ cam, G, gate, chamber, heart, portal = 0, world, children, over, fade = true, shake = 0 }) => {
  const f = useCurrentFrame();
  const jx = shake ? Math.sin(f * 2.7) * 9 * shake : 0;
  const jy = shake ? Math.cos(f * 3.3) * 7 * shake : 0;
  return (
    <AbsoluteFill style={{ background: "#c8d4f0", opacity: fade ? ip(f, [0, XF], [0, 1]) : 1, transform: `translate(${jx}px, ${jy}px)` }}>
      <AbsoluteFill style={{ filter: "saturate(1.28) contrast(1.07)" }}>
        <World3D cam={cam} bloom={0.32} threshold={0.88}>
          <RainbowSky t={G / 30} s={skyAt(G)} gate={gate} chamber={chamber} heart={heart} arrivePortal={portal} />
          {world}
        </World3D>
      </AbsoluteFill>
      <CharLayer defs={<Defs />} filter="rainbowLit">
        {children}
      </CharLayer>
      {over}
    </AbsoluteFill>
  );
};

// ---------- Scene 0 (0-6.4s): the Master Clock's image of the Rainbow Bridge, where Episode 12 ended ----------
const gp = (x: number, z: number): V3 => [x, floorY(x, z), z];
const C_KIKO = gp(-1.9, -24.6);
const C_LUMI = gp(-0.8, -24.3);
const C_TOCK = gp(0.25, -24.0);
const C_DRACO = gp(1.3, -24.5);
const C_BOBO = gp(2.4, -24.2);
const HOLO: V3 = [0.3, 5.2, -29.5];

const Scene0: React.FC = () => {
  const f = useCurrentFrame();
  const g = f;
  const t = g / 30;
  const cam = camAt(f, [
    [0, { pos: [0.3, 4.6, -23.0], target: HOLO, fov: 48 }],
    [40, { pos: [0.3, 1.8, -17.2], target: [0.3, 2.9, -30], fov: 56 }],
    [L2 - 4, { pos: [0.3, 1.7, -17.6], target: [0.3, 2.8, -30], fov: 56 }],
    [L2 - 3, { pos: [-0.3, 1.15, -20.4], target: [-0.3, 1.0, -24.3], fov: 48 }],
    [JUMP - 1, { pos: [-0.3, 1.15, -20.7], target: [-0.3, 1.0, -24.3], fov: 48 }],
    [JUMP, { pos: [0.3, 1.9, -17.0], target: [0.3, 3.6, -30], fov: 58 }],
    [CUTS[1] + XF, { pos: [0.3, 4.0, -24.0], target: HOLO, fov: 54 }],
  ]);
  const jk = ip(f, [JUMP, JUMP + 26], [0, 1], Easing.in(Easing.quad));
  const jumpTo = (p: V3, dx: number): V3 => up(lerp3(p, [HOLO[0] + dx, HOLO[1] - 1.2, HOLO[2] + 1.5], jk), hopArc(jk, 1.2));
  const shrink = 1 - jk * 0.6;
  const L = place(cam, jumpTo(C_LUMI, -0.4), LUMI_S * shrink);
  const K = place(cam, jumpTo(C_KIKO, -0.9), KIKO_S * shrink);
  const D = place(cam, jumpTo(C_DRACO, 0.4), DRACO_S * shrink);
  const B = place(cam, jumpTo(C_BOBO, 0.9), BOBO_S * shrink);
  const T = place(cam, up(C_TOCK, 0.55 + Math.sin(f / 7) * 0.08), TOCK_S);
  const Hs = screen(cam, HOLO);
  const look = (w: Pt) => lookAtPt(w, Hs, 380);
  const lookT = (w: Pt) => lookAtPt(w, { x: T.x, y: T.y - 200 * T.scale }, 300);
  const talkingT = f >= L1 && f < L2;
  const holoScale = 1.25 + ip(f, [0, 22], [0.5, 0], OUT) + ip(f, [JUMP + 6, CUTS[1] + XF], [0, 3], Easing.in(Easing.quad));
  const jumping = f >= JUMP;
  return (
    <AbsoluteFill style={{ background: "#2a4a2a" }}>
      <World3D cam={cam} bloom={0.8} threshold={0.74}>
        <TimeForest t={t} fixed={1} camPos={cam.pos} />
        <RainbowBridgeHologram position={HOLO} t={t} on={1} scale={holoScale} />
        <SparkleBurst3D position={HOLO} age={ip(f, [0, 40], [0, 1])} reach={9} count={200} seed={131} size={18} colors={["#ff6a6a", "#ffb040", "#ffe060", "#7fe07f", "#6fb8ff", "#b88aff", "#ffffff"]} />
        <LightRing position={HOLO} age={ip(f, [0, 30], [0, 1])} radius={10} flat={false} color="#fff0c8" />
      </World3D>
      <CharLayer defs={<Defs />} filter="jungleLit">
        <Kiko x={K.x} y={K.y} scale={K.scale} g={g} mood={jumping ? "joy" : "excited"} look={talkingT ? lookT(K) : look(K)} blink={blinkAt(g, 11)} armL={jumping ? 150 : 30} armR={jumping ? -150 : -30} legs={jumping ? 0.7 : 0} tailSwish={1.2} />
        <Lumi x={L.x} y={L.y} scale={L.scale} look={talkingT ? lookT(L) : look(L)} expr={mouthAt("lumi", g) > 0.06 ? "happy" : "excited"} mouth={mouthAt("lumi", g)} armR={f >= L2 ? -120 : -22} armL={jumping ? 150 : 22} headTilt={talk("lumi", g)} blink={blinkAt(g, 1)} />
        <Worn L={L} g={g} glow={0.8} />
        <Draco x={D.x} y={D.y} scale={D.scale} g={g} mood={jumping ? "joy" : "happy"} look={talkingT ? lookT(D) : look(D)} blink={blinkAt(g, 5)} wing={jumping ? 1 : 0.6} flap={jumping ? Math.sin(f * 0.8) * 24 : 0} armsUp={jumping ? 0.9 : 0.3} glow={0.5} />
        <BoboRider g={g} x={B.x} y={B.y} scale={B.scale} look={talkingT ? lookT(B) : look(B)} expr={jumping ? "excited" : "happy"} armL={jumping ? 150 : 20} armR={jumping ? -150 : -20} blink={blinkAt(g, 3)} riderArmsUp={jumping} />
        <Tock
          x={T.x}
          y={T.y}
          scale={T.scale}
          g={g}
          mood={talkingT ? (mouthAt("tock", g) > 0.06 ? "happy" : "proud") : "joy"}
          mouth={mouthAt("tock", g)}
          look={talkingT ? { x: 0, y: -0.1 } : look(T)}
          blink={blinkAt(g, 17)}
          wingL={1}
          wingR={1}
          flap={1}
          hop={0}
          headTilt={talk("tock", g)}
        />
        <PocketClock x={T.x + 110 * T.scale} y={T.y - 230 * T.scale} scale={T.scale * 1.1} g={g} hour={0.62} min={0.5} spin={talkingT ? (f - L1) * 2 : 0} />
        {talkingT && f > L1 + 30 && <IconBubble x={T.x + 220 * T.scale} y={T.y - 520 * T.scale} scale={0.55} kind="clock" on={ip(f, [L1 + 30, L1 + 38], [0, 1])} g={g} />}
        <SparkBurst f={f} at={0} x={Hs.x} y={Hs.y} reach={520} count={30} size={20} life={34} rainbow />
      </CharLayer>
      <AbsoluteFill style={{ background: "radial-gradient(circle at 50% 40%, #ffffff 0%, #ffe8f8 45%, #c8d8ff 100%)", opacity: ip(f, [JUMP + 14, CUTS[1] + XF], [0, 1], EASE) }} />
    </AbsoluteFill>
  );
};

// ---------- Scene 1 (6.4-24.2s): the Rainbow Bridge; the colours begin to fade ----------
const isl = (x: number, z: number): V3 => [x, 0.02, z];
const PORTAL: V3 = [0, 1.6, 12];
const S1 = { land: LAND - CUTS[1], pale: RED_PALE - CUTS[1], step: BOBO_STEP - CUTS[1], hole: HOLE - CUTS[1], l3: L3 - CUTS[1], kj: KIKO_JUMP - CUTS[1], ku: KIKO_UP - CUTS[1], grey: BLUE_GREY - CUTS[1], l5: L5 - CUTS[1], puff: PUFF - CUTS[1], l6: L6 - CUTS[1] };

const Scene1: React.FC = () => {
  const f = useCurrentFrame();
  const g = f + CUTS[1];
  const cam = camAt(f, [
    [0, { pos: [0, 1.7, 18.6], target: [0, 1.5, 9], fov: 52 }],
    [24, { pos: [0, 2.0, 18.0], target: [0, 1.7, 8.5], fov: 54 }],
    [96, { pos: [8.5, 6.5, 19.5], target: [-1.0, 10.5, -40], fov: 60 }],
    [S1.step - 7, { pos: [9.2, 6.9, 19.8], target: [-1.0, 10.5, -40], fov: 60 }],
    [S1.step - 6, { pos: [1.0, 1.4, 4.8], target: [0.4, 0.4, -1.4], fov: 50 }],
    [S1.kj - 7, { pos: [1.0, 1.35, 4.5], target: [0.4, 0.4, -1.4], fov: 50 }],
    [S1.kj - 6, { pos: [0.4, 2.1, 6.2], target: [0, -0.3, -1.6], fov: 58 }],
    [S1.grey - 7, { pos: [0.4, 2.2, 6.4], target: [0, -0.3, -1.6], fov: 58 }],
    [S1.grey - 6, { pos: [0.5, 2.8, 7.2], target: [0.2, 2.6, -8], fov: 58 }],
    [S1.l5 + 10, { pos: [0.5, 2.6, 6.6], target: [0.4, 2.2, -8], fov: 58 }],
    [S1.l5 + 11, { pos: [2.4, 1.3, 3.6], target: [1.5, 1.0, -0.4], fov: 46 }],
    [S1.l6 - 7, { pos: [2.4, 1.3, 3.2], target: [1.5, 1.0, -0.4], fov: 46 }],
    [S1.l6 - 6, { pos: [0.9, 1.3, 4.2], target: [0.7, 1.1, 0.6], fov: 44 }],
    [534 + XF, { pos: [0.9, 1.3, 3.8], target: [0.7, 1.1, 0.6], fov: 44 }],
  ]);
  // out of the portal, landing, then walking to the foot of the bridge
  const outK = ip(f, [0, S1.land - CUTS[1] + CUTS[1]], [0, 1], Easing.out(Easing.quad));
  const walkK = ip(f, [40, 110], [0, 1], EASE);
  const walking = f >= 40 && f < 110;
  const route = (land: V3, foot: V3): V3 => (f < S1.land ? up(lerp3(PORTAL, land, outK), hopArc(outK, 0.8) - outK * 1.6) : lerp3(land, foot, walkK));
  const kStart = route(isl(-2.0, 9.6), isl(-1.9, 1.3));
  // Kiko's fake fall: hop into the see-through patch, drop below the bridge, bounce back up on a cloud
  const jk = ip(f, [S1.kj, S1.kj + 10], [0, 1], EASE);
  const fall = ip(f, [S1.kj + 10, S1.kj + 26], [0, 1], Easing.in(Easing.quad));
  const bounce = ip(f, [S1.ku, S1.ku + 14], [0, 1], Easing.out(Easing.quad));
  const backK = ip(f, [S1.ku + 14, S1.ku + 28], [0, 1], EASE);
  const HOLE_P: V3 = onBridge(-0.2, -1.6);
  let kP: V3 = kStart;
  if (f >= S1.kj) kP = up(lerp3(isl(-1.9, 1.3), HOLE_P, jk), hopArc(jk, 0.6));
  if (f >= S1.kj + 10) kP = up(HOLE_P, -fall * 2.6);
  if (f >= S1.ku) kP = up(HOLE_P, lerp(-2.6, 1.0, bounce));
  if (f >= S1.ku + 14) kP = up(lerp3(HOLE_P, isl(-1.6, 1.1), backK), lerp(1.0, 0, backK) + hopArc(backK, 0.3));
  const K = place(cam, kP, KIKO_S);
  const L = place(cam, route(isl(-0.8, 9.2), isl(-0.8, 1.6)), LUMI_S);
  // Bobo steps onto the bridge, then hurries back after Kiko's prank
  const bStep = ip(f, [S1.step, S1.step + 18], [0, 1], EASE);
  const bBack = ip(f, [S1.grey, S1.grey + 18], [0, 1], EASE);
  const bP: V3 = f < S1.step ? route(isl(0.5, 9.6), isl(0.5, 1.0)) : f < S1.grey ? lerp3(isl(0.5, 1.0), onBridge(0.5, -1.2), bStep) : lerp3(onBridge(0.5, -1.2), isl(0.6, 0.8), bBack);
  const B = place(cam, bP, BOBO_S);
  // Draco steps forward for his big magic
  const dFwd = ip(f, [S1.l5, S1.l5 + 20], [0, 1], EASE);
  const D = place(cam, f < S1.l5 ? route(isl(1.8, 9.2), isl(2.0, 1.4)) : lerp3(isl(2.0, 1.4), isl(1.5, 0.5), dFwd), DRACO_S);
  const bMouth = mouthAt("bobo", g);
  const dMouth = mouthAt("draco", g);
  const holeS = screen(cam, HOLE_P);
  const seeThrough = f >= S1.hole && f < S1.kj;
  const kFalling = f >= S1.kj + 10 && f < S1.ku + 14;
  const heroic = f >= S1.l5 && f < S1.puff;
  const deadpan = f >= S1.puff + 6 && f < S1.l6;
  const puffAge = ip(f, [S1.puff, S1.puff + 34], [0, 1]);
  const dm = { x: D.x - 10 * D.scale, y: D.y - 170 * D.scale };
  const bridgeS = screen(cam, onBridge(0, -18));
  const lookBr = (w: Pt) => lookAtPt(w, bridgeS, 380);
  const lookKh = (w: Pt) => lookAtPt(w, { x: K.x, y: K.y - 150 * K.scale }, 300);
  const lookD = (w: Pt) => lookAtPt(w, { x: D.x, y: D.y - 200 * D.scale }, 300);
  const watchK = f >= S1.kj && f < S1.ku + 40;
  const lookFor = (w: Pt) => (watchK ? lookKh(w) : heroic || deadpan ? lookD(w) : f < 110 ? lookBr(w) : lookBr(w));
  return (
    <SkyShot cam={cam} G={g} fade={false} portal={ip(g, [CUTS[1], CUTS[1] + 8, LAND + 16, LAND + 36], [1, 1, 1, 0])} over={<AbsoluteFill style={{ background: "radial-gradient(circle at 50% 40%, #ffffff 0%, #ffe8f8 45%, #c8d8ff 100%)", opacity: ip(f, [0, 14], [1, 0], EASE) }} />}>
      {/* the cloud Kiko bounces on, under the bridge */}
      {f >= S1.ku - 8 && f < S1.ku + 16 && <PuffCloud x={holeS.x} y={screen(cam, up(HOLE_P, -2.7)).y} w={300 * K.scale} g={g} wobble={1} opacity={ip(f, [S1.ku - 8, S1.ku - 2, S1.ku + 10, S1.ku + 16], [0, 1, 1, 0])} />}
      <Kiko
        x={K.x}
        y={K.y}
        scale={K.scale}
        g={g}
        mood={f >= S1.ku ? "joy" : kFalling ? "surprised" : "excited"}
        mouth={mouthAt("kiko", g)}
        look={kFalling ? { x: 0, y: -0.8 } : lookFor(K)}
        blink={blinkAt(g, 11)}
        armL={kFalling ? 160 + Math.sin(f) * 15 : f >= S1.ku && f < S1.ku + 40 ? 150 : 30}
        armR={kFalling ? -160 - Math.sin(f) * 15 : f >= S1.ku && f < S1.ku + 40 ? -150 : -30}
        legs={kFalling || (f >= S1.kj && f < S1.kj + 10) ? 0.6 : walking ? Math.abs(Math.sin(f / 4)) * 0.3 : 0}
        lean={kFalling ? Math.sin(f / 2) * 12 : 0}
        headTilt={talk("kiko", g)}
        tailSwish={1.3}
      />
      <Lumi
        x={L.x}
        y={L.y}
        scale={L.scale}
        look={lookFor(L)}
        expr={watchK && f < S1.ku ? "surprised" : f >= 24 && f < 110 ? "excited" : deadpan ? "neutral" : f >= S1.grey && f < S1.l5 ? "surprised" : "happy"}
        walk={walking ? f * 0.32 : null}
        armR={watchK && f < S1.ku ? -60 : f >= 30 && f < 70 ? -130 : -22}
        armL={watchK && f < S1.ku ? 60 : 22}
        blink={deadpan ? 0.45 : blinkAt(g, 1)}
      />
      <Worn L={L} g={g} />
      <Draco
        x={D.x}
        y={D.y}
        scale={D.scale}
        g={g}
        mood={deadpan ? "neutral" : heroic ? (dMouth > 0.06 ? "excited" : "effort") : watchK && f < S1.ku ? "surprised" : "happy"}
        mouth={dMouth}
        look={deadpan ? { x: 0, y: 0.3 } : heroic ? { x: -0.5, y: -0.3 } : lookFor(D)}
        blink={deadpan ? 0.5 : blinkAt(g, 5)}
        wing={heroic ? 1 : 0.5}
        armsUp={heroic ? 0.9 : 0.2}
        breath={ip(f, [S1.puff - 16, S1.puff - 2, S1.puff + 2], [0, 1, 0])}
        step={walking || (f >= S1.l5 && f < S1.l5 + 20) ? f * 0.35 : null}
        headTilt={talk("draco", g)}
        glow={0.45}
      />
      {deadpan && <DracoBlush x={D.x} y={D.y} scale={D.scale} amount={ip(f, [S1.puff + 10, S1.puff + 20], [0, 0.8])} />}
      <g filter="url(#tint5)"><SmokePuff x={dm.x} y={dm.y} scale={D.scale * 2.4} age={puffAge} /></g>
      {deadpan && <IconBubble x={D.x + 190 * D.scale} y={D.y - 540 * D.scale} scale={D.scale * 0.6} kind="dots" on={ip(f, [S1.puff + 10, S1.puff + 18], [0, 1])} g={g} />}
      <BoboRider
        g={g}
        x={B.x}
        y={B.y}
        scale={B.scale}
        look={seeThrough ? { x: 0, y: 1 } : f >= S1.l6 ? { x: -0.3, y: -0.2 } : lookFor(B)}
        expr={seeThrough || (watchK && f < S1.ku) ? "surprised" : f >= S1.l6 ? (bMouth > 0.06 ? "excited" : "surprised") : bMouth > 0.06 ? "happy" : f >= 24 && f < 110 ? "excited" : "happy"}
        mouth={bMouth}
        walk={walking || (f >= S1.step && f < S1.step + 18) || (f >= S1.grey && f < S1.grey + 18) ? f * 0.3 : null}
        armL={seeThrough ? 60 + Math.sin(f / 2) * 8 : f >= S1.l6 ? 100 : 20}
        armR={seeThrough ? -60 - Math.sin(f / 2) * 8 : f >= S1.l6 ? -40 : -20}
        lean={seeThrough ? Math.sin(f / 1.5) * 3 : 0}
        headTilt={talk("bobo", g) + (seeThrough ? 8 : 0)}
        blink={blinkAt(g, 3)}
        riderArmsUp={seeThrough}
      />
      <BoboBigEyes x={B.x} y={B.y} scale={B.scale} g={g} amount={(watchK && f < S1.ku) || seeThrough ? 0.9 : 0} />
      {seeThrough && <SweatDrop x={B.x + 110 * B.scale} y={B.y - 380 * B.scale} scale={B.scale} g={g} />}
      {seeThrough && <ShakeLines x={B.x} y={B.y - 60 * B.scale} scale={B.scale} on={1} g={g} />}
      <BananaRailThought x={Math.max(250, B.x - 200 * B.scale)} y={B.y - 760 * B.scale} scale={B.scale * 0.9} on={ip(f, [S1.l6 + 14, S1.l6 + 24, 534 + XF - 6, 534 + XF], [0, 1, 1, 0])} g={g} />
      {f >= S1.l3 + 50 && f < S1.kj + 30 && <IconBubble x={B.x + 190 * B.scale} y={B.y - 560 * B.scale} scale={B.scale * 0.6} kind="bang" on={ip(f, [S1.l3 + 50, S1.l3 + 56], [0, 1])} g={g} />}
    </SkyShot>
  );
};

// ---------- Scene 2 (24.2-40.8s): meeting Pico behind a colourful cloud ----------
const S2 = { wig: WIGGLE - CUTS[2], peek: PEEK - CUTS[2], l7: L7 - CUTS[2], l8: L8 - CUTS[2], sneak: KIKO_SNEAK - CUTS[2], l9: L9 - CUTS[2], flash: FLASH - CUTS[2], l10: L10 - CUTS[2], l11: L11 - CUTS[2] };
const P2_HIDE = isl(2.4, 5.0);
const P2 = isl(1.8, 5.6);

const Scene2: React.FC = () => {
  const f = useCurrentFrame();
  const g = f + CUTS[2];
  const cam = camAt(f, [
    [0, { pos: [0.4, 1.5, 11.4], target: [0.9, 0.9, 5.6], fov: 50 }],
    [S2.l7 - 5, { pos: [0.5, 1.45, 10.8], target: [0.9, 0.9, 5.6], fov: 50 }],
    [S2.l7 - 4, { pos: [1.6, 0.9, 8.3], target: [1.8, 0.62, 5.6], fov: 38 }],
    [S2.l8 - 7, { pos: [1.6, 0.9, 8.1], target: [1.8, 0.62, 5.6], fov: 38 }],
    [S2.l8 - 6, { pos: [1.3, 1.15, 11.0], target: [1.3, 0.75, 5.8], fov: 42 }],
    [S2.sneak - 8, { pos: [1.3, 1.15, 10.6], target: [1.3, 0.75, 5.8], fov: 42 }],
    [S2.sneak - 7, { pos: [0.0, 1.45, 11.6], target: [0.1, 0.8, 5.4], fov: 58 }],
    [S2.l9 - 4, { pos: [0.3, 1.45, 11.2], target: [0.5, 0.8, 5.4], fov: 58 }],
    [S2.l9 - 3, { pos: [1.8, 1.0, 8.5], target: [2.0, 0.7, 5.3], fov: 42 }],
    [S2.l10 - 7, { pos: [1.8, 1.0, 8.3], target: [2.0, 0.7, 5.3], fov: 42 }],
    [S2.l10 - 6, { pos: [0.4, 1.25, 9.8], target: [0.55, 0.95, 6.2], fov: 46 }],
    [S2.l11 - 8, { pos: [0.4, 1.25, 9.5], target: [0.55, 0.95, 6.2], fov: 46 }],
    [S2.l11 - 7, { pos: [1.6, 0.9, 8.1], target: [1.8, 0.6, 5.6], fov: 36 }],
    [498 + XF, { pos: [1.6, 0.9, 7.8], target: [1.8, 0.6, 5.6], fov: 36 }],
  ]);
  const L = place(cam, isl(0.75, 6.1), LUMI_S);
  const D = place(cam, isl(-1.7, 6.0), DRACO_S);
  const B = place(cam, isl(-0.4, 6.6), BOBO_S);
  // Kiko tip-toes round behind Pico
  const sneakK = ip(f, [S2.sneak, S2.l9 - 2], [0, 1], Easing.inOut(Easing.sin));
  const kP: V3 = f < S2.sneak ? isl(-2.7, 6.6) : f < S2.l10 ? lerp3(isl(-2.7, 6.6), isl(2.6, 5.0), sneakK) : isl(2.6, 5.0);
  const K = place(cam, kP, KIKO_S);
  const sneaking = f >= S2.sneak && f < S2.l9 - 2;
  // Pico: hiding, peeking over the cloud, popping out
  const out = ip(f, [S2.peek, S2.peek + 16], [0, 1], EASE);
  const P = place(cam, lerp3(P2_HIDE, P2, out), PICO_S);
  const peeking = f >= S2.wig + 6 && f < S2.peek;
  const pHop = f < S2.peek ? (peeking ? 70 + Math.sin(f / 3) * 6 : 0) : hopArc(ip(f, [S2.peek, S2.peek + 16], [0, 1]), 160) + (f >= S2.flash && f < S2.flash + FLASH_LEN ? hopArc(ip(f, [S2.flash, S2.flash + 20], [0, 1]), 260) : 0);
  const pl = picoLook(g);
  const pMouth = mouthAt("pico", g);
  const startled = (f >= S2.peek && f < S2.l7 + 22) || (f >= S2.l9 && f < S2.flash + FLASH_LEN + 6);
  const brave = f >= S2.l7 + 30 && f < S2.l8;
  const cloud = screen(cam, up(P2_HIDE, 0.3));
  const cloudW = 520 * P.scale;
  const behind = f < S2.peek + 8;
  const lookP = (w: Pt) => lookAtPt(w, { x: P.x, y: P.y - 150 * P.scale }, 300);
  const boo = f >= S2.l9 - 2 && f < S2.l9 + 24;
  const kMouth = mouthAt("kiko", g);
  const bMouth = mouthAt("bobo", g);
  const pico = (
    <Pico
      x={P.x}
      y={P.y}
      scale={P.scale}
      g={g}
      uid="p2"
      color={pl.color}
      rainbow={pl.rainbow}
      mood={startled ? (pMouth > 0.06 ? "scared" : "surprised") : brave ? "brave" : f >= S2.l11 - 4 ? (pMouth > 0.06 ? "happy" : "giggle") : f >= S2.l10 ? "surprised" : pMouth > 0.06 ? "happy" : "happy"}
      mouth={pMouth}
      look={peeking ? { x: -0.6, y: 0.1 } : f >= S2.l9 && f < S2.l10 ? { x: 0.8, y: -0.2 } : f >= S2.l10 && f < S2.l11 ? lookAtPt(P, { x: B.x, y: B.y - 300 * B.scale }, 150) : lookAtPt(P, { x: L.x, y: L.y - 330 * L.scale }, 150)}
      blink={blinkAt(g, 19)}
      armsUp={startled ? 0.95 : brave ? 0.55 : f >= S2.l11 ? 0.45 + Math.sin(f / 4) * 0.1 : 0.15}
      hop={pHop}
      squash={brave ? 1.06 : 1}
      tilt={f >= S2.flash && f < S2.flash + FLASH_LEN ? Math.sin(f * 1.3) * 10 : 0}
      headTilt={talk("pico", g) + (f >= S2.l11 ? -8 : 0)}
    />
  );
  return (
    <SkyShot cam={cam} G={g}>
      <Draco x={D.x} y={D.y} scale={D.scale} g={g} mood={f >= S2.peek && f < S2.l8 ? "surprised" : f >= S2.l11 + 30 ? "joy" : "happy"} look={lookP(D)} blink={blinkAt(g, 5)} wing={0.5} glow={0.45} />
      <Lumi x={L.x} y={L.y} scale={L.scale} look={lookP(L)} expr={f >= S2.peek && f < S2.l8 ? "surprised" : f >= S2.l9 && f < S2.l10 ? "surprised" : "excited"} armR={f >= S2.l8 && f < S2.l8 + 30 ? -60 : -22} armL={22} blink={blinkAt(g, 1)} />
      <Worn L={L} g={g} />
      {behind && (
        <>
          {pico}
          <PuffCloud x={cloud.x} y={cloud.y} w={cloudW} g={g} wobble={f >= S2.wig && f < S2.peek + 10 ? 1 : 0.2} tint={1} />
        </>
      )}
      {!behind && <PuffCloud x={cloud.x} y={cloud.y} w={cloudW} g={g} wobble={0.2} tint={1} />}
      <Kiko
        x={K.x}
        y={K.y}
        scale={K.scale}
        g={g}
        mood={boo ? "excited" : f >= S2.flash && f < S2.l10 + 40 ? "joy" : sneaking ? "happy" : "happy"}
        mouth={kMouth}
        look={sneaking ? { x: 0.6, y: 0.3 } : lookP(K)}
        blink={sneaking ? 0.5 : blinkAt(g, 11)}
        armL={boo ? 160 : sneaking ? 60 : 20}
        armR={boo ? -160 : sneaking ? -60 : -20}
        legs={sneaking ? Math.abs(Math.sin(f / 5)) * 0.25 : 0}
        lean={sneaking ? -8 + Math.sin(f / 5) * 3 : f >= S2.flash && f < S2.l10 + 40 ? Math.sin(f * 1.2) * 6 : 0}
        headTilt={talk("kiko", g)}
        tailSwish={1.4}
      />
      {sneaking && <IconBubble x={K.x + 150 * K.scale} y={K.y - 540 * K.scale} scale={K.scale * 0.55} kind="dots" on={1} g={g} />}
      {!behind && pico}
      <BoboRider
        g={g}
        x={B.x}
        y={B.y}
        scale={B.scale}
        look={lookP(B)}
        expr={f >= S2.peek && f < S2.l7 + 20 ? "surprised" : f >= S2.l10 ? (bMouth > 0.06 ? "surprised" : "neutral") : "happy"}
        mouth={bMouth}
        armL={f >= S2.l10 && f < S2.l11 ? 60 + Math.sin(f / 4) * 20 : 20}
        armR={f >= S2.l10 && f < S2.l11 ? -90 : -20}
        headTilt={talk("bobo", g) + (f >= S2.l10 && f < S2.l11 + 20 ? -10 : 0)}
        blink={blinkAt(g, 3)}
      />
      {f >= S2.l10 + 20 && f < S2.l11 + 20 && <IconBubble x={B.x - 180 * B.scale} y={B.y - 560 * B.scale} scale={B.scale * 0.6} kind="question" on={ip(f, [S2.l10 + 20, S2.l10 + 28], [0, 1])} g={g} tail={1} />}
      {/* Pico pictures the fading Rainbow Heart */}
      <ThoughtBubble x={Math.min(860, P.x + 120 * P.scale)} y={Math.max(260, P.y - 760 * P.scale)} scale={P.scale * 1.5} on={ip(f, [S2.l8 + 64, S2.l8 + 74, S2.sneak + 4, S2.sneak + 12], [0, 1, 1, 0])} tail={1}>
        <HeartPic x={0} y={0} scale={1.1} sat={ip(f, [S2.l8 + 70, S2.l8 + 120], [0.9, 0.15])} g={g} />
      </ThoughtBubble>
      {f >= S2.l9 && f < S2.l9 + 20 && <IconBubble x={K.x - 160 * K.scale} y={K.y - 560 * K.scale} scale={K.scale * 0.7} kind="bang" on={ip(f, [S2.l9, S2.l9 + 5], [0, 1])} g={g} />}
      {f >= S2.flash && f < S2.flash + FLASH_LEN && <SparkBurst f={f} at={S2.flash} x={P.x} y={P.y - 150 * P.scale - pHop * P.scale} reach={260} count={16} size={14} life={30} rainbow />}
    </SkyShot>
  );
};

// ---------- Scene 3 (40.8-58.4s): the islands of missing colours ----------
const S3 = { l12: L12 - CUTS[3], flower: FLOWER - CUTS[3], red: ORB_RED - CUTS[3], falls: FALLS - CUTS[3], blue: ORB_BLUE - CUTS[3], sun: SUN - CUTS[3], l13: L13 - CUTS[3], swap: SWAP - CUTS[3], bite: BITE - CUTS[3], l14: L14 - CUTS[3], fly: FLY - CUTS[3], catch: CATCH - CUTS[3], l15: L15 - CUTS[3], l16: L16 - CUTS[3] };
const D1 = 1; // the islands have drifted away by now

// cloud stepping stones from the arrival island out to the flower island
const Steps: React.FC<{ t: number }> = ({ t }) => {
  const fl = isleAt("flower", D1);
  return (
    <>
      {Array.from({ length: 5 }, (_, i) => {
        const k = (i + 1) / 6;
        return <Cloud key={i} position={[lerp(-7.2, fl[0] + 4.8, k), lerp(-0.4, fl[1] - 0.4, k) + Math.sin(t * 1.3 + i) * 0.12, lerp(2.5, fl[2] + 1.5, k)]} size={1.0} seed={400 + i} t={0} flat={0.35} glow={0.45} />;
      })}
    </>
  );
};

const Scene3: React.FC = () => {
  const f = useCurrentFrame();
  const g = f + CUTS[3];
  const t = g / 30;
  const shot = f < S3.flower ? 0 : f < S3.falls ? 1 : f < S3.sun ? 2 : 3;
  const fl = isleAt("flower", D1);
  const fa = isleAt("falls", D1);
  const su = isleAt("sun", D1);
  const pl = picoLook(g);
  const pMouth = mouthAt("pico", g);
  const bMouth = mouthAt("bobo", g);
  const dMouth = mouthAt("draco", g);
  const kMouth = mouthAt("kiko", g);

  if (shot === 0) {
    const cam = camAt(f, [
      [0, { pos: [-3.0, 2.3, 12.8], target: [-8.5, 3.0, -10], fov: 58 }],
      [S3.flower + XF, { pos: [-3.4, 2.5, 12.2], target: [-9.5, 3.2, -10], fov: 58 }],
    ]);
    const L = place(cam, isl(-4.3, 4.4), LUMI_S);
    const P = place(cam, isl(-5.1, 3.8), PICO_S);
    const B = place(cam, isl(-3.4, 5.0), BOBO_S);
    const K = place(cam, isl(-2.7, 4.3), KIKO_S);
    const D = place(cam, isl(-5.8, 5.0), DRACO_S);
    const flS = screen(cam, up(fl, 1));
    const lookI = (w: Pt) => lookAtPt(w, flS, 400);
    return (
      <SkyShot cam={cam} G={g} world={<Steps t={t} />}>
        <Kiko x={K.x} y={K.y} scale={K.scale} g={g} mood="excited" look={lookI(K)} blink={blinkAt(g, 11)} armL={20} armR={-20} tailSwish={1.2} />
        <Lumi x={L.x} y={L.y} scale={L.scale} look={lookI(L)} expr="excited" armR={-22} armL={22} blink={blinkAt(g, 1)} />
        <Worn L={L} g={g} />
        <Pico x={P.x} y={P.y} scale={P.scale} g={g} uid="p3a" color={pl.color} mood={pMouth > 0.06 ? "happy" : "proud"} mouth={pMouth} look={lookI(P)} blink={blinkAt(g, 19)} armsUp={0.9} hop={Math.abs(Math.sin(f / 8)) * 20} headTilt={talk("pico", g)} flip />
        <Draco x={D.x} y={D.y} scale={D.scale} g={g} mood="happy" look={lookI(D)} blink={blinkAt(g, 5)} wing={0.6} glow={0.45} />
        <BoboRider g={g} x={B.x} y={B.y} scale={B.scale} look={lookI(B)} expr="surprised" armL={20} armR={-20} blink={blinkAt(g, 3)} />
        {[0, 1, 2].map((i) => {
          const s = screen(cam, up(isleAt((["flower", "falls", "sun"] as const)[i], D1), 2.2));
          return <IconBubble key={i} x={s.x} y={s.y} scale={0.45} kind="question" on={ip(f, [S3.l12 + 30 + i * 12, S3.l12 + 38 + i * 12], [0, 1])} g={g} />;
        })}
      </SkyShot>
    );
  }

  if (shot === 1) {
    // the red flower island: Lumi finds the red orb among the pale flowers
    const lf = f - S3.flower;
    const cam = camAt(lf, [
      [0, { pos: [fl[0] + 0.8, fl[1] + 1.5, fl[2] + 6.4], target: [fl[0] + 0.2, fl[1] + 0.9, fl[2] + 0.8], fov: 50 }],
      [66, { pos: [fl[0] + 0.5, fl[1] + 1.3, fl[2] + 5.6], target: [fl[0] + 0.2, fl[1] + 0.9, fl[2] + 0.8], fov: 50 }],
    ]);
    const land = ip(lf, [0, 10], [0, 1], Easing.out(Easing.quad));
    const L = place(cam, up(add3(fl, [0.5, 0.02, 1.8]), hopArc(land, 0.6) * (1 - land)), LUMI_S);
    const P = place(cam, add3(fl, [-0.3, 0.02, 2.4]), PICO_S);
    const B = place(cam, up(add3(fl, [1.25, 0.02, 1.5]), hopArc(ip(lf, [3, 13], [0, 1]), 0.6)), BOBO_S);
    const orbW = screen(cam, add3(fl, [0.15, 0.8, 1.1]));
    const grab = ip(f, [S3.red - 6, S3.red + 4], [0, 1], EASE);
    const lh = lumiHand(L.x, L.y, L.scale, -150);
    const orb = { x: lerp(orbW.x, lh.x, grab), y: lerp(orbW.y, lh.y - 30 * L.scale, grab) - hopArc(grab, 80) };
    return (
      <SkyShot cam={cam} G={g}>
        <ColorOrb x={orb.x} y={orb.y + Math.sin(f / 6) * 6 * (1 - grab)} scale={L.scale * 0.8} i={0} g={g} />
        <Pico x={P.x} y={P.y} scale={P.scale} g={g} uid="p3b" color={pl.color} mood="joy" look={lookAtPt(P, orb, 120)} blink={blinkAt(g, 19)} armsUp={grab > 0.5 ? 0.9 : 0.3} hop={grab > 0.5 ? Math.abs(Math.sin(f / 4)) * 50 : 0} />
        <Lumi x={L.x} y={L.y} scale={L.scale} look={lookAtPt(L, orb, 330)} expr={grab > 0.5 ? "excited" : "happy"} armR={grab > 0 ? -150 : -22} armL={22} blink={blinkAt(g, 1)} />
        <Worn L={L} g={g} />
        <BoboRider g={g} x={B.x} y={B.y} scale={B.scale} look={lookAtPt(B, orb, 300)} expr="excited" armL={20} armR={-20} blink={blinkAt(g, 3)} />
        <SparkBurst f={f} at={S3.red} x={lh.x} y={lh.y} reach={200} count={14} size={14} life={24} />
      </SkyShot>
    );
  }

  if (shot === 2) {
    // the blue waterfall island: Kiko swings in and grabs the blue orb above the grey pool
    const lf = f - S3.falls;
    const cam = camAt(lf, [
      [0, { pos: [fa[0] + 3.0, fa[1] + 1.6, fa[2] + 5.8], target: [fa[0] + 4.2, fa[1] + 0.9, fa[2] - 0.4], fov: 52 }],
      [63, { pos: [fa[0] + 3.3, fa[1] + 1.5, fa[2] + 5.3], target: [fa[0] + 4.3, fa[1] + 0.9, fa[2] - 0.4], fov: 52 }],
    ]);
    const swing = ip(f, [S3.falls + 2, S3.blue], [0, 1], Easing.inOut(Easing.sin));
    const K = place(cam, up(lerp3(add3(fa, [2.4, 0.02, 1.8]), add3(fa, [3.7, 0.02, 0.5]), swing), hopArc(swing, 1.2)), KIKO_S);
    const L = place(cam, add3(fa, [2.6, 0.02, 1.4]), LUMI_S);
    const D = place(cam, add3(fa, [1.7, 0.02, 0.6]), DRACO_S);
    const orbW = screen(cam, add3(fa, [FALLS_POOL[0], 1.1 + Math.sin(f / 7) * 0.08, FALLS_POOL[2]]));
    const got = f >= S3.blue;
    const kh = kikoHand(K.x, K.y, K.scale, -150);
    const orb = got ? { x: kh.x, y: kh.y - 20 * K.scale } : orbW;
    const lh = lumiHand(L.x, L.y, L.scale, -120);
    return (
      <SkyShot cam={cam} G={g}>
        <Draco x={D.x} y={D.y} scale={D.scale} g={g} mood="excited" look={lookAtPt(D, orb, 300)} blink={blinkAt(g, 5)} wing={0.7} glow={0.45} />
        <Lumi x={L.x} y={L.y} scale={L.scale} look={lookAtPt(L, orb, 330)} expr={got ? "excited" : "surprised"} armR={-120} armL={22} blink={blinkAt(g, 1)} />
        <Worn L={L} g={g} />
        <ColorOrb x={lh.x} y={lh.y - 20 * L.scale} scale={L.scale * 0.7} i={0} g={g} />
        {!got && <ColorOrb x={orb.x} y={orb.y} scale={K.scale * 0.85} i={4} g={g} />}
        <Kiko x={K.x} y={K.y} scale={K.scale} g={g} mood={got ? "joy" : "excited"} look={lookAtPt(K, orbW, 300)} blink={blinkAt(g, 11)} armL={swing < 1 ? 150 : 30} armR={-150} legs={swing > 0 && swing < 1 ? 0.7 : 0} tailSwish={1.5} />
        {got && <ColorOrb x={orb.x} y={orb.y} scale={K.scale * 0.85} i={4} g={g} />}
        <SparkBurst f={f} at={S3.blue} x={orbW.x} y={orbW.y} reach={200} count={14} size={14} life={24} />
      </SkyShot>
    );
  }

  // the golden sunshine island: the "giant orange", Kiko's swap, Draco's flight into a cloud
  const lf = f - S3.sun;
  const fly = f >= S3.l14 - 2;
  const inCloud = f >= S3.catch;
  const kikoShot = f >= S3.l16 - 4;
  const cam = kikoShot
    ? camAt(f, [
        [S3.l16 - 4, { pos: [su[0] - 0.5, su[1] + 1.05, su[2] + 5.4], target: [su[0] - 0.7, su[1] + 0.75, su[2] + 2.2], fov: 40 }],
        [528 + XF, { pos: [su[0] - 0.5, su[1] + 1.05, su[2] + 5.1], target: [su[0] - 0.7, su[1] + 0.75, su[2] + 2.2], fov: 40 }],
      ])
    : inCloud && f >= S3.l15 - 6
      ? camAt(f, [
          [S3.l15 - 6, { pos: [su[0] + 2.8, su[1] + 1.9, su[2] + 6.2], target: [su[0] + 3.5, su[1] + 2.1, su[2] + 1.2], fov: 46 }],
          [S3.l16 - 4, { pos: [su[0] + 2.8, su[1] + 1.9, su[2] + 5.9], target: [su[0] + 3.5, su[1] + 2.1, su[2] + 1.2], fov: 46 }],
        ])
      : fly
        ? camAt(f, [
            [S3.l14 - 2, { pos: [su[0] + 1.6, su[1] + 1.4, su[2] + 6.8], target: [su[0] + 2.7, su[1] + 1.5, su[2] + 1.0], fov: 54 }],
            [S3.l15 - 6, { pos: [su[0] + 1.8, su[1] + 1.6, su[2] + 6.4], target: [su[0] + 3.1, su[1] + 1.8, su[2] + 1.0], fov: 54 }],
          ])
        : camAt(lf, [
            [0, { pos: [su[0] + 0.2, su[1] + 1.3, su[2] + 7.2], target: [su[0] + 0.3, su[1] + 0.9, su[2] + 1.6], fov: 50 }],
            [S3.l13 - S3.sun + 20, { pos: [su[0] + 0.6, su[1] + 1.15, su[2] + 5.6], target: [su[0] + 0.8, su[1] + 0.85, su[2] + 1.6], fov: 44 }],
            [S3.l14 - S3.sun, { pos: [su[0] + 0.6, su[1] + 1.15, su[2] + 5.3], target: [su[0] + 0.8, su[1] + 0.85, su[2] + 1.6], fov: 44 }],
          ]);
  const land = ip(lf, [0, 10], [0, 1], Easing.out(Easing.quad));
  const L = place(cam, up(add3(su, [-2.2, 0.02, 1.6]), hopArc(land, 0.6) * (1 - land)), LUMI_S);
  const P = place(cam, add3(su, [-1.5, 0.02, 2.4]), PICO_S);
  const ORB_P = add3(su, [1.5, 0.26, 1.9]);
  // Bobo trots to the orb...
  const bWalk = ip(f, [S3.l13, S3.swap + 4], [0, 1], EASE);
  const B = place(cam, lerp3(add3(su, [0.4, 0.02, 1.6]), add3(su, [1.0, 0.02, 1.7]), bWalk), BOBO_S);
  // ...Kiko zips over, swaps it for a stone and zips back
  const zip = ip(f, [S3.swap, S3.swap + 6, S3.swap + 10, S3.swap + 16], [0, 1, 1, 0], EASE);
  const K = place(cam, lerp3(add3(su, [-0.6, 0.02, 2.5]), add3(su, [1.9, 0.02, 2.3]), zip), KIKO_S);
  const swapped = f >= S3.swap + 8;
  const orbS = screen(cam, ORB_P);
  const lift = ip(f, [S3.swap + 14, S3.bite - 2], [0, 1], EASE);
  const bh = { x: B.x + 30 * B.scale, y: B.y - 250 * B.scale };
  const stoneAt = { x: lerp(orbS.x, bh.x, lift), y: lerp(orbS.y, bh.y, lift) };
  const biting = f >= S3.bite - 4 && f < S3.bite + 30;
  const clonk = f >= S3.bite && f < S3.bite + 40;
  // Draco flies off... into a colourful cloud
  const CLOUD_P = add3(su, [3.6, 1.9, 1.2]);
  const flyK = ip(f, [S3.fly, S3.catch], [0, 1], Easing.inOut(Easing.sin));
  const dP: V3 = f < S3.fly ? add3(su, [2.6, 0.02, 1.2]) : f < S3.catch ? up(lerp3(add3(su, [2.6, 0.02, 1.2]), up(CLOUD_P, -0.2), flyK), hopArc(flyK, 1.0)) : up(CLOUD_P, -0.15);
  const D = place(cam, dP, DRACO_S);
  const cS = screen(cam, CLOUD_P);
  const lookB = (w: Pt) => lookAtPt(w, { x: B.x, y: B.y - 200 * B.scale }, 300);
  const lookD = (w: Pt) => lookAtPt(w, { x: D.x, y: D.y - 200 * D.scale }, 300);
  const watchD = f >= S3.l14;
  const kh = kikoHand(K.x, K.y, K.scale, -40, -1);
  const kOrb = { x: K.x - 100 * K.scale, y: K.y - 150 * K.scale };
  return (
    <SkyShot cam={cam} G={g}>
      {/* the orange orb Kiko hides behind his back */}
      {swapped && <ColorOrb x={kOrb.x} y={kOrb.y} scale={K.scale * 0.6} i={1} g={g} glow={0.5} />}
      <Kiko
        x={K.x}
        y={K.y}
        scale={K.scale}
        g={g}
        mood={kikoShot ? (kMouth > 0.06 ? "happy" : "neutral") : f >= S3.bite ? "joy" : zip > 0 ? "excited" : "happy"}
        mouth={kMouth}
        look={kikoShot ? { x: 0.7, y: -0.3 } : watchD ? lookD(K) : lookB(K)}
        blink={kikoShot && kMouth < 0.06 ? 0.45 : blinkAt(g, 11)}
        armL={zip > 0 && zip < 1 ? 120 : 20}
        armR={swapped ? 30 : -20}
        legs={zip > 0 && zip < 1 ? 0.5 : 0}
        lean={f >= S3.bite && f < S3.bite + 40 ? Math.sin(f * 1.3) * 7 : 0}
        headTilt={talk("kiko", g) + (kikoShot ? 6 : 0)}
        tailSwish={1.4}
      />
      {zip > 0.2 && zip < 0.95 && <Sparkle x={kh.x} y={kh.y} size={30} color="#ffffff" rotate={f * 10} />}
      <Lumi x={L.x} y={L.y} scale={L.scale} look={watchD ? lookD(L) : lookB(L)} expr={clonk ? "surprised" : inCloud ? "surprised" : "happy"} armR={-22} armL={clonk ? 60 : 22} blink={blinkAt(g, 1)} />
      <Worn L={L} g={g} />
      <Pico x={P.x} y={P.y} scale={P.scale} g={g} uid="p3d" color={pl.color} mood={clonk || inCloud ? "surprised" : "happy"} look={watchD ? lookD(P) : lookB(P)} blink={blinkAt(g, 19)} armsUp={clonk ? 0.8 : 0.2} />
      {!swapped && <ColorOrb x={orbS.x} y={orbS.y} scale={B.scale * 0.95} i={1} g={g} />}
      {swapped && !biting && f < S3.bite - 4 && <Stone x={stoneAt.x} y={stoneAt.y} scale={B.scale * 0.95} />}
      <BoboRider
        g={g}
        x={B.x}
        y={B.y}
        scale={B.scale}
        look={clonk ? { x: Math.sin(f / 2) * 0.6, y: 0.2 } : watchD ? lookD(B) : lookAtPt(B, orbS, 300)}
        expr={clonk ? "effort" : bMouth > 0.06 ? "excited" : "excited"}
        mouth={biting && f < S3.bite ? 1 : bMouth}
        walk={bWalk > 0 && bWalk < 1 ? f * 0.3 : null}
        armL={lift > 0 ? 70 : 20}
        armR={lift > 0 ? -70 : -20}
        lean={clonk ? Math.sin(f * 2) * 4 : 0}
        squash={ip(f, [S3.bite, S3.bite + 3, S3.bite + 10], [1, 0.88, 1])}
        headTilt={talk("bobo", g)}
        blink={clonk && f < S3.bite + 12 ? 0.15 : blinkAt(g, 3)}
      />
      {biting && <Stone x={B.x + 4 * B.scale} y={B.y - 262 * B.scale} scale={B.scale * 0.8} />}
      <BoboBigEyes x={B.x} y={B.y} scale={B.scale} g={g} amount={f >= S3.l13 && f < S3.bite - 4 ? 0.9 : 0} />
      <ShakeLines x={B.x} y={B.y - 262 * B.scale} scale={B.scale} on={ip(f, [S3.bite, S3.bite + 2, S3.bite + 20, S3.bite + 26], [0, 1, 1, 0])} g={g} />
      {clonk && <DizzyStars x={B.x} y={B.y - 470 * B.scale} scale={B.scale} on={ip(f, [S3.bite + 4, S3.bite + 10, S3.bite + 34, S3.bite + 40], [0, 1, 1, 0])} g={g} />}
      {/* Draco: before, flying, and stuck in the cloud */}
      {!inCloud && (
        <Draco
          x={D.x}
          y={D.y}
          scale={D.scale}
          g={g}
          mood={f >= S3.fly ? "excited" : dMouth > 0.06 ? "excited" : clonk ? "surprised" : "happy"}
          mouth={dMouth}
          look={f >= S3.fly ? { x: 0.8, y: -0.3 } : watchD ? { x: 0.5, y: -0.3 } : lookB(D)}
          blink={blinkAt(g, 5)}
          wing={f >= S3.fly ? 1 : 0.7}
          flap={f >= S3.fly ? Math.sin(f * 0.9) * 26 : 0}
          armsUp={f >= S3.l14 ? 0.8 : 0.2}
          breath={f >= S3.l14 && f < S3.fly ? 0.6 : 0}
          headTilt={talk("draco", g)}
          glow={0.45}
        />
      )}
      {inCloud && (
        <>
          <Draco x={D.x} y={D.y + ip(f, [S3.catch, S3.l15 - 4], [200, -110], OUT) * D.scale} scale={D.scale} g={g} mood={f >= S3.l15 ? (dMouth > 0.06 ? "happy" : "neutral") : "surprised"} mouth={dMouth} look={f >= S3.l15 ? { x: -0.6, y: 0 } : { x: Math.sin(f / 3), y: 0 }} blink={blinkAt(g, 5)} wing={0.3} headTilt={talk("draco", g) - 8} glow={0.45} />
          <PuffCloud x={cS.x} y={cS.y + 30 * D.scale} w={620 * D.scale} g={g} wobble={ip(f, [S3.catch, S3.catch + 30], [1.6, 0.4])} tint={1} />
          <CloudFluff x={D.x + 10 * D.scale} y={D.y + ip(f, [S3.catch, S3.l15 - 4], [200, -110], OUT) * D.scale - 360 * D.scale} scale={D.scale * 0.9} on={ip(f, [S3.l15 - 10, S3.l15 - 4], [0, 1])} />
          <DracoBlush x={D.x} y={D.y + 60 * D.scale} scale={D.scale} amount={ip(f, [S3.l15, S3.l15 + 10], [0, 0.8])} />
        </>
      )}
      {!inCloud && f < S3.catch + 2 && <PuffCloud x={cS.x} y={cS.y + 30 * D.scale} w={620 * D.scale} g={g} wobble={0.3} tint={1} />}
      <SparkBurst f={f} at={S3.catch} x={cS.x} y={cS.y} reach={360} count={18} size={16} life={26} rainbow />
    </SkyShot>
  );
};

// ---------- Scene 4 (58.4-77.6s): the Rainbow Gate puzzle ----------
const S4 = { l17: L17 - CUTS[4], l18: L18 - CUTS[4], orbs: ORBS - CUTS[4], banana: BANANA - CUTS[4], gold: GOLD - CUTS[4], l19: L19 - CUTS[4], l20: L20 - CUTS[4], ko: KIKO_ORANGE - CUTS[4], open: OPEN - CUTS[4], l21: L21 - CUTS[4] };
const G_LUMI = onBridge(-1.1, -36.8);
const G_PICO = onBridge(-0.35, -37.5);
const G_BOBO = onBridge(0.45, -36.6);
const G_DRACO = onBridge(1.35, -36.9);
const G_KIKO = onBridge(2.15, -36.5);
const orbStart = (i: number) => (i < 1 ? ORBS + i * ORB_STEP : ORBS + (i - 1) * ORB_STEP);

const Scene4: React.FC = () => {
  const f = useCurrentFrame();
  const g = f + CUTS[4];
  const cam = camAt(f, [
    [0, { pos: [0.5, 20.8, -27.0], target: [0.2, 22.4, -41], fov: 60 }],
    [S4.l17 + 8, { pos: [0.4, 21.0, -30.6], target: [0.2, 22.2, -41], fov: 58 }],
    [S4.l18 - 7, { pos: [0.4, 21.0, -31.2], target: [0.2, 22.2, -41], fov: 58 }],
    [S4.l18 - 6, { pos: [-1.0, 21.0, -33.4], target: [-1.0, 20.8, -36.8], fov: 44 }],
    [S4.orbs - 7, { pos: [-1.0, 21.0, -33.7], target: [-1.0, 20.8, -36.8], fov: 44 }],
    [S4.orbs - 6, { pos: [0.4, 21.0, -30.8], target: [0.2, 22.1, -41], fov: 58 }],
    [S4.l19 - 7, { pos: [0.4, 21.0, -31.2], target: [0.2, 22.1, -41], fov: 58 }],
    [S4.l19 - 6, { pos: [-0.3, 20.9, -32.4], target: [-0.3, 20.8, -36.7], fov: 50 }],
    [S4.ko - 9, { pos: [-0.3, 20.9, -32.8], target: [-0.3, 20.8, -36.7], fov: 50 }],
    [S4.ko - 8, { pos: [0.4, 21.0, -30.8], target: [0.2, 22.1, -41], fov: 58 }],
    [S4.l21 - 5, { pos: [0.4, 21.0, -31.2], target: [0.2, 22.1, -41], fov: 58 }],
    [S4.l21 - 4, { pos: [1.75, 21.0, -32.6], target: [1.75, 20.8, -36.7], fov: 48 }],
    [576 + XF, { pos: [1.75, 21.0, -32.9], target: [1.75, 20.8, -36.7], fov: 48 }],
  ]);
  const L = place(cam, G_LUMI, LUMI_S);
  const P = place(cam, G_PICO, PICO_S);
  const B = place(cam, up(G_BOBO, hopArc(ip(g, [BANANA - 10, BANANA + 6], [0, 1]), 1.2)), BOBO_S);
  const K = place(cam, G_KIKO, KIKO_S);
  const D = place(cam, G_DRACO, DRACO_S);
  // the gate's sockets: named ones glow faintly, filled ones fully
  const filled = [0, 1, 2, 3, 4, 5, 6].map((i) => {
    if (i === 1) return g >= KIKO_ORANGE + 12 ? 1 : 0;
    const s = orbStart(i) + 10;
    return g >= s ? 1 : ip(g, [WORDS[i], WORDS[i] + 6, ORBS - 10], [0, 0.55, 0.3]) * (g >= WORDS[i] ? 1 : 0);
  });
  const bananaGlow = ip(g, [GOLD, GOLD + 6, KIKO_ORANGE, KIKO_ORANGE + 8], [0, 1, 1, 0]);
  const open = ip(g, [OPEN, OPEN + 34], [0, 1], EASE);
  const sock = (i: number) => screen(cam, socketAt(i));
  // the six orbs Pico has gathered float around Pico until they fly to the gate
  const ring = (i: number) => {
    const a = (i / 7) * Math.PI * 2 + g / 25;
    return { x: P.x + Math.cos(a) * 300 * P.scale, y: P.y - 420 * P.scale - Math.sin(a) * 110 * P.scale };
  };
  const lh = lumiHand(L.x, L.y, L.scale, -150);
  const lookG = (w: Pt) => lookAtPt(w, sock(3), 400);
  const bMouth = mouthAt("bobo", g);
  const proudBobo = g >= GOLD && g < KIKO_ORANGE;
  const kLaugh = g >= L20 + 20 && g < L21 + 60;
  const bananaOut = ip(g, [KIKO_ORANGE + 12, KIKO_ORANGE + 30], [0, 1]);
  const kThrow = ip(g, [KIKO_ORANGE, KIKO_ORANGE + 12], [0, 1], EASE);
  const kh = kikoHand(K.x, K.y, K.scale, -150);
  return (
    <SkyShot cam={cam} G={g} gate={{ filled, open, banana: bananaGlow }}>
      {/* the colour words, each appearing as Pico names it */}
      {WORDS.map((w, i) => {
        const s = sock(i);
        const c = screen(cam, [0, BRIDGE_H + 0.4, socketAt(0)[2]]);
        const dx = s.x - c.x;
        const dy = s.y - c.y;
        const dl = Math.hypot(dx, dy) || 1;
        const on = ip(g, [w, w + 6, ORBS + 60, ORBS + 80], [0, 1, 1, 0]);
        return <ColorWord key={i} x={s.x + (dx / dl) * 95} y={s.y + (dy / dl) * 75 + 14} i={i} on={on} size={46} />;
      })}
      {/* orbs flying to their sockets in rainbow order */}
      {[0, 2, 3, 4, 5, 6].map((i) => {
        const s0 = orbStart(i);
        const k = ip(g, [s0, s0 + 10], [0, 1], Easing.inOut(Easing.quad));
        if (g >= s0 + 10) return null;
        const r = ring(i);
        const s = sock(i);
        const from = g < s0 ? r : { x: lerp(r.x, lh.x, 0), y: r.y };
        return <ColorOrb key={i} x={lerp(from.x, s.x, k)} y={lerp(from.y, s.y, k) - hopArc(k, 100)} scale={P.scale * 1.5 * (1 - k * 0.3)} i={i} g={g} />;
      })}
      {/* Bobo's banana in the orange socket, then knocked out when the real orb arrives */}
      {g >= BANANA - 4 && bananaOut < 1 && (() => {
        const s = sock(1);
        const k = ip(g, [BANANA - 4, BANANA + 2], [0, 1], EASE);
        const bh = { x: B.x + 120 * B.scale, y: B.y - 330 * B.scale };
        return <Banana x={lerp(bh.x, s.x, k) + bananaOut * 200} y={lerp(bh.y, s.y, k) + bananaOut * 500 - hopArc(bananaOut, 160)} scale={0.6 * L.scale * (cam.fov! < 50 ? 1.4 : 1)} rot={-30 + bananaOut * 400} />;
      })()}
      {g >= KIKO_ORANGE && g < KIKO_ORANGE + 12 && <ColorOrb x={lerp(kh.x, sock(1).x, kThrow)} y={lerp(kh.y, sock(1).y, kThrow) - hopArc(kThrow, 160)} scale={K.scale * 0.6} i={1} g={g} />}
      {g < KIKO_ORANGE && <ColorOrb x={K.x - 100 * K.scale} y={K.y - 150 * K.scale} scale={K.scale * 0.6} i={1} g={g} glow={0.4} />}
      <Kiko
        x={K.x}
        y={K.y}
        scale={K.scale}
        g={g}
        mood={kLaugh || (g >= GOLD && g < L19) ? "joy" : "happy"}
        look={kLaugh ? { x: 0.8, y: 0 } : lookG(K)}
        blink={blinkAt(g, 11)}
        armL={kLaugh ? 60 + Math.sin(f / 2) * 10 : 20}
        armR={g >= KIKO_ORANGE - 6 && g < KIKO_ORANGE + 12 ? -150 : g < KIKO_ORANGE ? 30 : -20}
        lean={kLaugh || (g >= GOLD && g < L19) ? Math.sin(f * 1.2) * 7 : 0}
        tailSwish={1.4}
      />
      <Lumi
        x={L.x}
        y={L.y}
        scale={L.scale}
        look={g >= L19 && g < L20 + 50 ? lookAtPt(L, { x: B.x, y: B.y - 250 * B.scale }, 330) : lookG(L)}
        expr={mouthAt("lumi", g) > 0.06 ? (g >= L19 ? "surprised" : "excited") : g >= OPEN ? "excited" : "happy"}
        mouth={mouthAt("lumi", g)}
        armR={g >= L18 && g < ORBS + 60 ? -150 : g >= L19 && g < L20 ? -80 : -22}
        armL={g >= L18 && g < ORBS + 60 ? 60 : g >= OPEN ? 150 : 22}
        headTilt={talk("lumi", g)}
        blink={blinkAt(g, 1)}
      />
      <Worn L={L} g={g} glow={0.6} />
      <Pico
        x={P.x}
        y={P.y}
        scale={P.scale}
        g={g}
        uid="p4"
        mood={mouthAt("pico", g) > 0.06 ? "happy" : g >= OPEN ? "joy" : g >= GOLD && g < L20 + 40 ? "surprised" : "proud"}
        mouth={mouthAt("pico", g)}
        look={lookG(P)}
        blink={blinkAt(g, 19)}
        armsUp={g >= L17 && g < L18 ? 0.9 : g >= OPEN ? 0.9 : 0.3}
        hop={g >= OPEN ? Math.abs(Math.sin(f / 5)) * 40 : 0}
        headTilt={talk("pico", g)}
      />
      {g < ORBS + 6 * ORB_STEP + 10 &&
        [0, 2, 3, 4, 5, 6].map((i) => {
          if (g >= orbStart(i)) return null;
          const r = ring(i);
          return <ColorOrb key={`r${i}`} x={r.x} y={r.y} scale={P.scale * 1.5} i={i} g={g} glow={ip(g, [WORDS[i], WORDS[i] + 6], [0.5, 1])} />;
        })}
      <Draco
        x={D.x}
        y={D.y}
        scale={D.scale}
        g={g}
        mood={g >= L21 ? (mouthAt("draco", g) > 0.06 ? "happy" : "joy") : g >= GOLD && g < L20 ? "surprised" : "happy"}
        mouth={mouthAt("draco", g)}
        look={g >= L21 ? { x: 0, y: -0.7 } : lookG(D)}
        blink={g >= L21 + 10 ? 0.4 : blinkAt(g, 5)}
        wing={g >= L21 ? 0.9 : 0.5}
        armsUp={g >= L21 ? 0.4 : 0.2}
        breath={g >= L21 ? 0.7 : 0}
        headTilt={talk("draco", g) + (g >= L21 ? -10 : 0)}
        glow={0.45}
      />
      {g >= L21 + 10 && <IconBubble x={D.x + 200 * D.scale} y={D.y - 540 * D.scale} scale={D.scale * 0.6} kind="hearts" on={ip(g, [L21 + 10, L21 + 18], [0, 1])} g={g} />}
      <BoboRider
        g={g}
        x={B.x}
        y={B.y}
        scale={B.scale}
        look={proudBobo ? { x: -0.5, y: -0.3 } : lookG(B)}
        expr={proudBobo ? (bMouth > 0.06 ? "happy" : "excited") : g >= OPEN ? "excited" : "happy"}
        mouth={bMouth}
        armL={proudBobo ? 120 : 20}
        armR={g >= BANANA - 10 && g < BANANA + 6 ? -150 : proudBobo ? -100 : -20}
        headTilt={talk("bobo", g) + (proudBobo ? -6 : 0)}
        blink={blinkAt(g, 3)}
        riderArmsUp={g >= OPEN}
      />
      {g >= BANANA - 14 && g < BANANA - 4 && <Banana x={B.x + 120 * B.scale} y={B.y - 330 * B.scale} scale={0.6 * B.scale} rot={-30} />}
      {g >= GOLD && g < GOLD + 20 && <SparkBurst f={g} at={GOLD} x={sock(1).x} y={sock(1).y} reach={260} count={16} size={16} life={20} />}
      {g >= OPEN && <SparkBurst f={g} at={OPEN} x={sock(3).x} y={sock(3).y + 200} reach={520} count={26} size={18} life={30} rainbow />}
    </SkyShot>
  );
};

// ---------- Scene 5 (77.6-93.8s): restoring the Rainbow Heart ----------
const S5 = { l22: L22 - CUTS[5], l23: L23 - CUTS[5], ring: RING - CUTS[5], flame: FLAME - CUTS[5], trip: TRIP - CUTS[5], burst: BURST - CUTS[5], glow: GLOW - CUTS[5], l24: L24 - CUTS[5], restore: RESTORE - CUTS[5], l25: L25 - CUTS[5] };
const H_DRACO = onBridge(-2.0, -45.4);
const H_LUMI = onBridge(-1.15, -44.8);
const H_PICO = onBridge(-0.35, -45.6);
const H_BOBO = onBridge(0.9, -44.7);
const H_KIKO = onBridge(1.9, -45.3);
const ringP = (i: number): V3 => {
  const a = (i / 7) * Math.PI * 2 + Math.PI / 2;
  return [Math.cos(a) * 1.9, BRIDGE_H + 1.0, CHAMBER_Z + Math.sin(a) * 1.9];
};

const ChamberShot: React.FC<{ cam: Cam3; G: number; children: React.ReactNode; over?: React.ReactNode; world?: React.ReactNode; shake?: number }> = ({ cam, G, children, over, world, shake = 0 }) => {
  const restored = ip(G, [RESTORE, RESTORE + 24], [0, 1]);
  return (
    <SkyShot
      cam={cam}
      G={G}
      chamber={{ lit: 0.2 + 0.8 * restored, pedestal: G >= RESTORE ? 1 : ip(G, [FLAME + 8, FLAME + 24], [0, 0.8]) }}
      heart={{ sat: G >= PROJECT ? 1 : 0.12 + 0.88 * restored, glow: 0.15 + 1.1 * restored + ip(G, [GLOW, L24], [0, 0.2]) * (1 - restored) }}
      world={world}
      over={over}
      shake={shake}
    >
      {children}
    </SkyShot>
  );
};

const Scene5: React.FC = () => {
  const f = useCurrentFrame();
  const g = f + CUTS[5];
  const cam = camAt(f, [
    [0, { pos: [0.4, 20.75, -41.9], target: [-0.25, 20.6, -45.6], fov: 38 }],
    [S5.l23 - 7, { pos: [0.4, 20.75, -42.3], target: [-0.25, 20.6, -45.6], fov: 38 }],
    [S5.l23 - 6, { pos: [-0.8, 20.95, -41.4], target: [-0.85, 20.75, -45.2], fov: 46 }],
    [S5.ring - 7, { pos: [-0.8, 20.95, -41.7], target: [-0.85, 20.75, -45.2], fov: 46 }],
    [S5.ring - 6, { pos: [0, 22.0, -36.4], target: [0, 21.4, -49], fov: 56 }],
    [S5.glow - 7, { pos: [0, 21.9, -37.0], target: [0, 21.4, -49], fov: 56 }],
    [S5.glow - 6, { pos: [-0.3, 20.7, -42.4], target: [-0.4, 21.0, -45.6], fov: 46 }],
    [S5.restore - 4, { pos: [-0.3, 20.65, -42.7], target: [-0.4, 21.1, -45.6], fov: 46 }],
    [S5.restore - 3, { pos: [0, 21.9, -37.0], target: [0, 22.0, -49], fov: 58 }],
    [S5.l25 - 7, { pos: [0, 21.8, -37.6], target: [0, 22.0, -49], fov: 58 }],
    [S5.l25 - 6, { pos: [0.85, 20.95, -41.5], target: [0.9, 20.8, -44.7], fov: 44 }],
    [486 + XF, { pos: [0.85, 20.95, -41.2], target: [0.9, 20.8, -44.7], fov: 44 }],
  ]);
  const L = place(cam, H_LUMI, LUMI_S);
  const P = place(cam, H_PICO, PICO_S);
  const tripK = ip(f, [S5.trip, S5.trip + 8], [0, 1], EASE);
  const B = place(cam, lerp3(H_BOBO, onBridge(0.9, -45.5), ip(f, [S5.trip - 8, S5.trip + 6], [0, 1])), BOBO_S);
  const K = place(cam, H_KIKO, KIKO_S);
  const D = place(cam, H_DRACO, DRACO_S);
  const Hs = screen(cam, HEART_AT);
  const pedS = screen(cam, [0, BRIDGE_H + 0.95, CHAMBER_Z]);
  const lookH = (w: Pt) => lookAtPt(w, Hs, 400);
  const lookP = (w: Pt) => lookAtPt(w, { x: P.x, y: P.y - 150 * P.scale }, 300);
  const pl = picoLook(g);
  const pMouth = mouthAt("pico", g);
  const sad = f < S5.l23 + 40;
  const restored = f >= S5.restore;
  const pGlow = ip(f, [S5.glow, S5.l24, S5.restore + 20, S5.restore + 60], [0, 0.8, 1, 0.4]);
  const rainbowBobo = ip(f, [S5.restore + 2, S5.restore + 10], [0, 1]);
  const kh = kikoHand(K.x, K.y, K.scale, -120);
  const dm = { x: D.x + 30 * D.scale, y: D.y - 170 * D.scale };
  const tripping = f >= S5.trip && f < S5.trip + 30;
  const bMouth = mouthAt("bobo", g);
  const into = ip(f, [S5.restore - 10, S5.restore], [0, 1], Easing.in(Easing.quad));
  return (
    <ChamberShot
      cam={cam}
      G={g}
      shake={f >= S5.restore && f < S5.restore + 14 ? 0.8 : 0}
      world={
        <>
          <SparkleBurst3D position={HEART_AT} age={ip(f, [S5.restore, S5.restore + 46], [0, 1])} reach={14} count={260} seed={137} size={18} colors={["#ff4d5e", "#ff9a3c", "#ffd83a", "#4fd66a", "#3f9dff", "#5a5cf0", "#b05cff", "#ffffff"]} />
          <LightRing position={HEART_AT} age={ip(f, [S5.restore, S5.restore + 40], [0, 1])} radius={18} flat={false} color="#fff0ff" />
        </>
      }
      over={f >= S5.restore && f < S5.restore + 18 ? <AbsoluteFill style={{ background: "#fff8ff", opacity: ip(f, [S5.restore, S5.restore + 2, S5.restore + 18], [0, 0.6, 0]) }} /> : undefined}
    >
      {/* the seven orbs around the pedestal, placed by Kiko, then pulled into the heart */}
      {f >= S5.ring &&
        f < S5.restore &&
        [0, 1, 2, 3, 4, 5, 6].map((i) => {
          const at = S5.ring + i * 4;
          const k = ip(f, [at, at + 10], [0, 1], EASE);
          if (f < at) return null;
          const s = screen(cam, ringP(i));
          const pos = { x: lerp(lerp(kh.x, s.x, k), Hs.x, into), y: lerp(lerp(kh.y, s.y, k) - hopArc(k, 60), Hs.y, into) + Math.sin(f / 6 + i) * 6 };
          return <ColorOrb key={i} x={pos.x} y={pos.y} scale={L.scale * 0.55 * (1 - into * 0.6)} i={i} g={g} />;
        })}
      <Draco
        x={D.x}
        y={D.y}
        scale={D.scale}
        g={g}
        mood={f >= S5.flame - 6 && f < S5.flame + 24 ? "effort" : restored ? "joy" : sad ? "sad" : "happy"}
        look={f >= S5.flame - 6 && f < S5.flame + 24 ? lookAtPt(D, pedS, 300) : sad ? lookP(D) : lookH(D)}
        blink={blinkAt(g, 5)}
        wing={restored ? 1 : 0.5}
        armsUp={restored ? 0.9 : 0.2}
        breath={ip(f, [S5.flame - 8, S5.flame - 1, S5.flame], [0, 0.8, 0.3])}
        glow={0.5}
      />
      <TinyFlame from={dm} to={pedS} on={ip(f, [S5.flame, S5.flame + 3, S5.flame + 18, S5.flame + 22], [0, 1, 1, 0])} g={g} scale={D.scale * 2.4} />
      <SparkBurst f={f} at={S5.flame + 18} x={pedS.x} y={pedS.y} reach={160} count={12} size={12} life={20} />
      <Lumi
        x={L.x}
        y={L.y}
        scale={L.scale}
        look={f < S5.ring ? lookP(L) : lookH(L)}
        expr={mouthAt("lumi", g) > 0.06 ? "happy" : restored ? "excited" : sad ? "neutral" : "happy"}
        mouth={mouthAt("lumi", g)}
        armR={f >= S5.l23 && f < S5.ring ? -60 + Math.sin(f / 5) * 8 : restored ? -150 : -22}
        armL={restored ? 150 : 22}
        headTilt={talk("lumi", g) + (f >= S5.l23 && f < S5.ring ? 8 : 0)}
        blink={blinkAt(g, 1)}
      />
      <Worn L={L} g={g} glow={restored ? 1 : 0.4} />
      <Pico
        x={P.x}
        y={P.y}
        scale={P.scale}
        g={g}
        uid="p5"
        color={pl.color}
        rainbow={pl.rainbow}
        glow={pGlow}
        mood={sad ? (pMouth > 0.06 ? "sad" : "sad") : f >= S5.glow && f < S5.restore ? (pMouth > 0.06 ? "brave" : "brave") : restored ? "joy" : "happy"}
        mouth={pMouth}
        look={sad ? (f >= S5.l23 ? lookAtPt(P, { x: L.x, y: L.y - 330 * L.scale }, 150) : { x: 0, y: 0.6 }) : lookH(P)}
        blink={blinkAt(g, 19)}
        armsUp={f >= S5.glow ? 0.95 : sad ? 0 : 0.3}
        hop={f >= S5.glow && f < S5.restore ? 40 + Math.sin(f / 4) * 10 : restored ? 60 + Math.abs(Math.sin(f / 5)) * 60 : 0}
        squash={sad ? 0.92 : 1}
        headTilt={talk("pico", g) + (sad ? 10 : 0)}
      />
      <Kiko x={K.x} y={K.y} scale={K.scale} g={g} mood={restored ? "joy" : sad ? "worried" : "happy"} look={f >= S5.ring && f < S5.ring + 30 ? lookAtPt(K, pedS, 300) : sad ? lookP(K) : lookH(K)} blink={blinkAt(g, 11)} armL={restored ? 150 : 20} armR={f >= S5.ring - 4 && f < S5.ring + 30 ? -120 : restored ? -150 : -20} tailSwish={1.2} />
      <SevenColors x={B.x} y={B.y} scale={B.scale} on={rainbowBobo} uid="b5">
        <BoboRider
          g={g}
          x={B.x}
          y={B.y}
          scale={B.scale}
          look={f >= S5.l25 - 10 ? { x: -0.2, y: 0.8 } : tripping ? { x: 0, y: 0.6 } : sad ? lookP(B) : lookH(B)}
          expr={tripping ? "surprised" : f >= S5.l25 - 10 ? (bMouth > 0.06 ? "happy" : "surprised") : restored ? "surprised" : "happy"}
          mouth={bMouth}
          armL={f >= S5.l25 - 10 ? 70 + Math.sin(f / 5) * 10 : tripping ? 150 : 20}
          armR={f >= S5.l25 - 10 ? -70 - Math.sin(f / 5) * 10 : tripping ? -150 : -20}
          lean={tripping ? -22 * tripK * (1 - ip(f, [S5.trip + 16, S5.trip + 30], [0, 1])) : 0}
          squash={ip(f, [S5.trip + 6, S5.trip + 9, S5.trip + 16], [1, 0.86, 1])}
          headTilt={talk("bobo", g)}
          blink={blinkAt(g, 3)}
          riderArmsUp={tripping || restored}
        />
      </SevenColors>
      <SparkBurst f={f} at={S5.burst} x={pedS.x} y={pedS.y} reach={200} count={12} size={12} life={22} rainbow />
      {restored && <SparkBurst f={f} at={S5.restore} x={Hs.x} y={Hs.y} reach={700} count={32} size={22} life={36} rainbow />}
      {f >= S5.restore + 26 && f < S5.l25 && <IconBubble x={B.x + 190 * B.scale} y={B.y - 560 * B.scale} scale={B.scale * 0.6} kind="bang" on={ip(f, [S5.restore + 26, S5.restore + 32], [0, 1])} g={g} />}
    </ChamberShot>
  );
};

// ---------- Scene 6 (93.8-115.6s): the rainbow celebration; the music box teaser ----------
const S6 = { prank: PRANK - CUTS[6], hide: HIDE - CUTS[6], l26: L26 - CUTS[6], rb: RBANANA - CUTS[6], l27: L27 - CUTS[6], steal: STEAL - CUTS[6], l28: L28 - CUTS[6], laugh: LAUGH - CUTS[6], project: PROJECT - CUTS[6], l29: L29 - CUTS[6], end: END - CUTS[6] };
const W_DRACO = onBridge(-1.85, -45.6);
const W_LUMI = onBridge(-0.95, -45.0);
const W_BOBO = onBridge(0.5, -44.8);
const W_KIKO = onBridge(1.6, -45.4);
const W_PICO = onBridge(2.35, -46.2);
const FLOWER_P = onBridge(2.8, -46.6);
const MBOX: V3 = [0, BRIDGE_H + 5.4, CHAMBER_Z - 0.6];

const Scene6: React.FC = () => {
  const f = useCurrentFrame();
  const g = f + CUTS[6];
  const t = g / 30;
  const wide = f < 86;
  const cam = wide
    ? camAt(f, [
        [0, { pos: [16, 26, -14], target: [0, 18, -52], fov: 60 }],
        [86 + XF, { pos: [11, 23, -22], target: [0, 19, -50], fov: 60 }],
      ])
    : camAt(f, [
        [86, { pos: [0.3, 21.3, -39.0], target: [0.4, 21.0, -47], fov: 56 }],
        [S6.l26 - 4, { pos: [0.35, 21.3, -39.4], target: [0.45, 21.0, -47], fov: 56 }],
        [S6.l26 - 3, { pos: [1.9, 21.0, -41.8], target: [2.2, 20.9, -46.2], fov: 44 }],
        [S6.rb - 7, { pos: [1.9, 21.0, -42.1], target: [2.2, 20.9, -46.2], fov: 44 }],
        [S6.rb - 6, { pos: [0.9, 21.0, -41.4], target: [1.0, 20.9, -45.0], fov: 46 }],
        [S6.laugh - 5, { pos: [0.9, 21.0, -41.7], target: [1.0, 20.9, -45.0], fov: 46 }],
        [S6.laugh - 4, { pos: [0.25, 21.5, -38.6], target: [0.3, 21.3, -47], fov: 58 }],
        [S6.project - 1, { pos: [0.25, 21.5, -38.9], target: [0.3, 21.3, -47], fov: 58 }],
        [S6.project, { pos: [0.25, 21.0, -38.2], target: [0.2, 23.6, -49], fov: 62 }],
        [654, { pos: [0.25, 21.2, -37.4], target: [0.2, 23.8, -49], fov: 62 }],
      ]);
  const party = f < S6.prank;
  const hop = (ph: number) => (party ? Math.abs(Math.sin((f + ph) / 6)) * 0.22 : 0);
  const laugh = f >= S6.laugh && f < S6.project + 10;
  const lh2 = (ph: number) => (laugh ? Math.abs(Math.sin((f + ph) / 4)) * 0.12 : 0);
  const L = place(cam, up(W_LUMI, hop(0) + lh2(1)), LUMI_S);
  const D = place(cam, up(W_DRACO, hop(2) + lh2(3)), DRACO_S);
  const B = place(cam, up(W_BOBO, hop(4) + lh2(5)), BOBO_S);
  // Kiko sneaks up on Pico... later zips in for the first bite
  const sneakK = ip(f, [S6.prank, S6.hide], [0, 1], EASE);
  const stealK = ip(f, [S6.steal - 8, S6.steal], [0, 1], EASE);
  const backK = ip(f, [S6.steal + 6, S6.steal + 18], [0, 1], EASE);
  let kP: V3 = up(W_KIKO, hop(6));
  if (f >= S6.prank) kP = lerp3(W_KIKO, onBridge(2.4, -46.0), sneakK);
  if (f >= S6.rb) kP = onBridge(2.4, -46.0);
  if (f >= S6.steal - 8) kP = lerp3(onBridge(2.4, -46.0), onBridge(1.2, -44.9), stealK);
  if (f >= S6.steal + 6) kP = lerp3(onBridge(1.2, -44.9), onBridge(1.9, -45.4), backK);
  if (f >= S6.laugh) kP = up(onBridge(1.9, -45.4), lh2(7));
  const K = place(cam, kP, KIKO_S);
  const P = place(cam, f >= S6.laugh ? up(W_PICO, lh2(9)) : f < S6.hide ? up(W_PICO, hop(8)) : lerp3(W_PICO, up(FLOWER_P, 0.75), ip(f, [S6.hide, S6.hide + 10], [0, 1], EASE)), PICO_S);
  const flS = screen(cam, FLOWER_P);
  const flScale = place(cam, FLOWER_P, 1).scale;
  const hidden = f >= S6.hide + 4 && f < S6.laugh;
  const peek = hidden && f >= S6.l26 + 50 && f < S6.l26 + 80;
  const pl = picoLook(g);
  const project = ip(f, [S6.project, S6.project + 24], [0, 1], OUT);
  const Hs = screen(cam, HEART_AT);
  const Ms = screen(cam, MBOX);
  const lookUp = (w: Pt) => (f >= S6.project ? lookAtPt(w, Ms, 420) : lookAtPt(w, Hs, 380));
  const bananaOn = f >= S6.rb;
  const caughtBite = f >= S6.steal;
  const bh = { x: B.x + 150 * B.scale, y: B.y - (f >= S6.l27 + 20 && f < S6.steal ? 420 : 320) * B.scale };
  const bMouth = mouthAt("bobo", g);
  const kMouth = mouthAt("kiko", g);
  const rainbowBobo = ip(f, [86, 116], [1, 0]);
  const lookK = (w: Pt) => lookAtPt(w, { x: K.x, y: K.y - 150 * K.scale }, 300);
  return (
    <ChamberShot
      cam={cam}
      G={g}
      world={
        <>
          <MusicBoxHologram position={MBOX} t={t} on={project} lid={ip(f, [S6.project + 10, S6.project + 40], [0, 1], EASE)} scale={1.3} />
          {wide && <SparkleBurst3D position={HEART_AT} age={ip(f, [0, 60], [0, 1])} reach={40} count={240} seed={139} size={26} gravity={2} colors={["#ff4d5e", "#ff9a3c", "#ffd83a", "#4fd66a", "#3f9dff", "#5a5cf0", "#b05cff"]} />}
        </>
      }
      over={
        <>
          <EndCard at={S6.end} top={250} />
          <AbsoluteFill style={{ alignItems: "center", fontFamily }}>
            <div style={{ position: "absolute", top: 410, fontSize: 40, fontWeight: 600, color: "#fff2ff", opacity: ip(f, [S6.end + 20, S6.end + 36], [0, 1]), textShadow: "0 0 8px rgba(40, 20, 70, 1), 0 3px 12px rgba(40, 20, 70, 1)" }}>Next: The Mystery of the Magical Music Box 🎵</div>
          </AbsoluteFill>
        </>
      }
    >
      {!wide && (
        <>
          {f >= S6.project && <path d={`M ${Hs.x - 20} ${Hs.y} L ${Ms.x - 220 * project} ${Ms.y + 200} L ${Ms.x + 220 * project} ${Ms.y + 200} L ${Hs.x + 20} ${Hs.y} Z`} fill="#fff0ff" opacity={0.16 * project} />}
          <MusicNotes x={Ms.x} y={Ms.y + 120} scale={0.9} g={g} on={ip(f, [S6.project + 20, S6.project + 40], [0, 1])} count={7} />
          <RainbowFlower x={flS.x} y={flS.y} scale={flScale * 0.85} g={g} layer="back" />
          {!hidden && (
            <Pico
              x={P.x}
              y={P.y}
              scale={P.scale}
              g={g}
              uid="p6a"
              color={pl.color}
              rainbow={pl.rainbow}
              mood={f >= S6.laugh ? (f >= S6.project ? "surprised" : "joy") : f >= S6.prank + 8 ? "surprised" : "joy"}
              look={f >= S6.prank + 8 && f < S6.laugh ? lookK(P) : lookUp(P)}
              blink={blinkAt(g, 19)}
              armsUp={party ? 0.9 : 0.6}
              hop={party ? 30 + Math.abs(Math.sin(f / 5)) * 50 : f >= S6.laugh ? hopArc(ip(f, [S6.laugh, S6.laugh + 12], [0, 1]), 200) : hopArc(ip(f, [S6.hide, S6.hide + 10], [0, 1]), 160)}
            />
          )}
          {hidden && (
            <Pico x={P.x} y={P.y + (peek ? -30 : 40) * P.scale} scale={P.scale} g={g} uid="p6b" color={pl.color} rainbow={1} mood={peek ? "giggle" : "happy"} look={peek ? lookK(P) : lookUp(P)} blink={blinkAt(g, 19)} />
          )}
          <RainbowFlower x={flS.x} y={flS.y} scale={flScale * 0.85} g={g} layer="front" />
          <Draco x={D.x} y={D.y} scale={D.scale} g={g} mood={party || laugh ? "joy" : f >= S6.project ? "surprised" : "happy"} look={f >= S6.prank && f < S6.project ? lookK(D) : lookUp(D)} blink={blinkAt(g, 5)} wing={party ? 1 : 0.6} flap={party ? Math.sin(f * 0.8) * 24 : 0} armsUp={party ? 0.9 : 0.3} squash={laugh ? 1 + Math.sin(f * 2) * 0.04 : 1} glow={0.5} />
          <Lumi
            x={L.x}
            y={L.y}
            scale={L.scale}
            look={f >= S6.prank && f < S6.project ? lookK(L) : lookUp(L)}
            expr={mouthAt("lumi", g) > 0.06 ? "excited" : laugh ? "happy" : f >= S6.project ? "surprised" : "excited"}
            mouth={mouthAt("lumi", g)}
            armR={party ? -150 : f >= S6.l29 ? -100 : -22}
            armL={party ? 150 : 22}
            headTilt={talk("lumi", g) + (laugh ? -5 : 0)}
            blink={blinkAt(g, 1)}
          />
          <Worn L={L} g={g} glow={0.9} />
          {bananaOn && !caughtBite && <RainbowBanana x={bh.x} y={bh.y} scale={B.scale * 1.7} rot={20} g={g} />}
          {f >= S6.rb && f < S6.rb + 16 && <SparkBurst f={f} at={S6.rb} x={bh.x} y={bh.y} reach={200} count={14} size={14} life={16} rainbow />}
          <SevenColors x={B.x} y={B.y} scale={B.scale} on={rainbowBobo} uid="b6">
            <BoboRider
              g={g}
              x={B.x}
              y={B.y}
              scale={B.scale}
              look={bananaOn && !caughtBite ? lookAtPt(B, bh, 300) : caughtBite && f < S6.laugh ? lookK(B) : lookUp(B)}
              expr={caughtBite && f < S6.laugh ? (bMouth > 0.06 ? "surprised" : "surprised") : laugh ? "happy" : bananaOn ? "excited" : "excited"}
              mouth={bMouth}
              armL={caughtBite && f < S6.laugh ? 60 : party ? 150 : 20}
              armR={bananaOn && !caughtBite ? (f >= S6.l27 + 20 ? -150 : -110) : party ? -150 : caughtBite && f < S6.laugh ? -60 : -20}
              headTilt={talk("bobo", g)}
              blink={blinkAt(g, 3)}
              riderHappy={laugh}
              riderArmsUp={party}
            />
          </SevenColors>
          <BoboBigEyes x={B.x} y={B.y} scale={B.scale} g={g} amount={bananaOn && !caughtBite ? 0.8 : 0} />
          <Kiko
            x={K.x}
            y={K.y}
            scale={K.scale}
            g={g}
            mood={laugh ? "joy" : caughtBite ? "joy" : f >= S6.hide + 4 && f < S6.rb ? (kMouth > 0.06 ? "surprised" : "surprised") : f >= S6.prank ? "happy" : "joy"}
            mouth={caughtBite && f < S6.steal + 10 ? 1 : kMouth}
            look={f >= S6.hide + 4 && f < S6.rb ? { x: Math.sin(f / 6), y: 0 } : f >= S6.steal - 8 && f < S6.steal + 18 ? lookAtPt(K, bh, 300) : lookUp(K)}
            blink={f >= S6.prank && f < S6.hide ? 0.5 : blinkAt(g, 11)}
            armL={party ? 140 : f >= S6.hide - 2 && f < S6.hide + 10 ? 160 : 20}
            armR={party ? -140 : f >= S6.hide - 2 && f < S6.hide + 10 ? -160 : f >= S6.steal + 6 && f < S6.laugh ? -120 : -20}
            legs={(f >= S6.prank && f < S6.hide) || (stealK > 0 && backK < 1) ? Math.abs(Math.sin(f / 3)) * 0.35 : 0}
            lean={laugh ? Math.sin(f * 1.3) * 7 : f >= S6.prank && f < S6.hide ? -6 : 0}
            headTilt={talk("kiko", g)}
            tailSwish={1.5}
          />
          {caughtBite && f < S6.laugh + 30 && <RainbowBanana x={kikoHand(K.x, K.y, K.scale, -120).x} y={kikoHand(K.x, K.y, K.scale, -120).y} scale={K.scale * 1.9} rot={10} g={g} bitten={1} />}
          {f >= S6.hide + 4 && f < S6.rb && <IconBubble x={K.x + 170 * K.scale} y={K.y - 540 * K.scale} scale={K.scale * 0.65} kind="question" on={ip(f, [S6.hide + 4, S6.hide + 10], [0, 1])} g={g} />}
          {caughtBite && f < S6.laugh && <IconBubble x={B.x - 180 * B.scale} y={B.y - 560 * B.scale} scale={B.scale * 0.65} kind="bang" on={ip(f, [S6.steal + 2, S6.steal + 8], [0, 1])} g={g} tail={1} />}
          {party && <SparkBurst f={f} at={90} x={540} y={760} reach={540} count={28} size={18} life={36} rainbow />}
          {f >= S6.hide && f < S6.hide + 14 && <SparkBurst f={f} at={S6.hide} x={P.x} y={P.y - 100 * P.scale} reach={200} count={14} size={14} life={14} rainbow />}
        </>
      )}
    </ChamberShot>
  );
};

export const Episode: React.FC = () => <EpisodeFrame audio="ep13/audio.wav" cuts={CUTS} scenes={[Scene0, Scene1, Scene2, Scene3, Scene4, Scene5, Scene6]} />;
