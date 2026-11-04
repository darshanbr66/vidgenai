import React from "react";
import { AbsoluteFill, Easing, useCurrentFrame } from "remotion";
import timeline from "./timeline.json";
import cues from "./cues.json";
import { blinkAt, Lumi } from "../story/characters";
import { Draco, Ep4Defs } from "../ep04/props";
import { BoboRider, EASE, EndCard, EpisodeFrame, fontFamily, ip, lumiHand, makeMouthAt, OUT, SparkBurst, XF } from "../kit";
import { Cam3, World3D } from "../kit3d/World";
import { camAt, CharLayer, place, screen, V3 } from "../kit3d/overlay";
import { LightRing, SparkleBurst3D } from "../kit3d/magic";
import { Ep5Defs, MoonPendant } from "../ep05/props";
import { Ep6Defs } from "../ep06/props";
import { Ep7Defs } from "../ep07/props";
import { BoboBigEyes, DracoBlush, Ep8Defs, Kiko, kikoHand, SmokePuff, SweatDrop } from "../ep08/props";
import { DizzyStars, Ep9Defs, IconBubble, ShakeLines } from "../ep09/props";
import { Ep10Defs } from "../ep10/props";
import { Ep11Defs } from "../ep11/props";
import { Ep12Defs } from "../ep12/props";
import { BRIDGE_H, CHAMBER_Z, HEART_AT, MusicBoxHologram, onBridge, RainbowSky, SkyState } from "../ep13/world";
import { colorPath, Ep13Defs, Pico, PICO_FLASH, PICO_GREEN, ThoughtBubble, TinyFlame } from "../ep13/props";
import { bellAt, BOX_AT, CUSHIONS_AT, DRUM_AT, FROZEN_AT, GardenHologram, HIGH_NOTE, instAt, InstrumentHall, HallProps, MusicCastle, symAt, SYM_COLORS } from "./world";
import {
  BananaBox,
  Baton,
  BoomRings,
  Cushions,
  Ep14Defs,
  Fluff,
  GiantDrum,
  GlowNote,
  HeadCushion,
  InvisiblePiano,
  Melody,
  MelodyMood,
  melodyTailTip,
  NoEcho,
  NOTE_BLUE,
  NOTE_GOLD,
  NOTE_PINK,
  RisingNotes,
  SilentClap,
  SingingStatue,
  SymbolGlyph,
  TootBlast,
  TummyWaves,
} from "./props";

// Episode 14: The Mystery of the Magical Music Box
// Every timed moment comes from cues.json, written by scripts/ep14_audio.py from the measured voice lines.

const mouthAt = makeMouthAt(timeline);
const F = (s: number) => Math.round(s * 30);
const K: Record<string, number> = {};
for (const [k, v] of Object.entries(cues as Record<string, number>)) K[k] = F(v);
export const CUTS = [0, K.CUT_1, K.CUT_2, K.CUT_3, K.CUT_4, K.CUT_5, K.CUT_6, K.DUR];
export const EP14_FRAMES = K.DUR;

const lerp = (a: number, b: number, k: number) => a + (b - a) * k;
const lerp3 = (a: V3, b: V3, k: number): V3 => [lerp(a[0], b[0], k), lerp(a[1], b[1], k), lerp(a[2], b[2], k)];
const up = (p: V3, h: number): V3 => [p[0], p[1] + h, p[2]];
const clamp1 = (v: number) => Math.max(-1, Math.min(1, v));
const lookAtPt = (who: { x: number; y: number }, p: { x: number; y: number }, h = 300) => ({ x: clamp1((p.x - who.x) / 260), y: clamp1((p.y - (who.y - h)) / 300) });
const talk = (who: string, g: number) => Math.sin(g / 4.3 + who.length) * 4.5 * Math.min(1, mouthAt(who, g) * 3);
const hopArc = (k: number, h: number) => Math.sin(Math.max(0, Math.min(1, k)) * Math.PI) * h;
const pulse = (g: number, at: number, len = 10) => ip(g, [at, at + 2, at + len], [0, 1, 0]);
const within = (g: number, a: number, b: number) => g >= a && g < b;
type Pt = { x: number; y: number; scale: number };

const LUMI_S = 1;
const BOBO_S = 0.91;
const DRACO_S = 1.05;
const KIKO_S = 0.8;
const PICO_S = 0.55;
const MEL_S = 0.6;

const singing = (g: number) => within(g, K.SING1, K.SING1_END + 2) || within(g, K.SING2, K.SING2_END + 2) || within(g, K.SING3, K.SING3_END + 2);
const melMood = (g: number, other: MelodyMood): MelodyMood => (singing(g) ? "sing" : other);

// the castle's magic over the episode: beautiful but fading, until the music box plays again
const alivePre = (g: number) => ip(g, [CUTS[1], CUTS[5]], [0.42, 0.2]);
const hallAlive = (g: number) => (g < K.RESTORE ? alivePre(g) : ip(g, [K.RESTORE, K.RESTORE + 36], [alivePre(K.RESTORE), 1]));

const Worn: React.FC<{ L: Pt; g: number; glow?: number }> = ({ L, g, glow = 0.4 }) => <MoonPendant x={L.x + 4 * L.scale} y={L.y - 262 * L.scale} scale={0.62 * L.scale} g={g} glow={glow} />;
const Defs: React.FC<{ alive?: number }> = ({ alive = 1 }) => (
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
    <Ep13Defs lit={1} />
    <Ep14Defs alive={alive} />
  </>
);

const Fade: React.FC<{ f: number; children: React.ReactNode; bg: string; shake?: number; fade?: boolean }> = ({ f, children, bg, shake = 0, fade = true }) => {
  const jx = shake ? Math.sin(f * 2.7) * 12 * shake : 0;
  const jy = shake ? Math.cos(f * 3.3) * 9 * shake : 0;
  return <AbsoluteFill style={{ background: bg, opacity: fade ? ip(f, [0, XF], [0, 1]) : 1, transform: `translate(${jx}px, ${jy}px)` }}>{children}</AbsoluteFill>;
};

const CastleShot: React.FC<{ cam: Cam3; g: number; alive: number; flow?: number; door?: { lit: number[]; open: number; wrong?: number }; world?: React.ReactNode; over?: React.ReactNode; shake?: number; fade?: boolean; children: React.ReactNode }> = ({
  cam,
  g,
  alive,
  flow = 0,
  door,
  world,
  over,
  shake = 0,
  fade = true,
  children,
}) => {
  const f = useCurrentFrame();
  return (
    <Fade f={f} bg="#d8c8e8" shake={shake} fade={fade}>
      <AbsoluteFill style={{ filter: `saturate(${1.05 + alive * 0.25}) contrast(1.06)` }}>
        <World3D cam={cam} bloom={0.4 + alive * 0.25} threshold={0.82}>
          <MusicCastle t={g / 30} alive={alive} flow={flow} door={door} />
          {world}
        </World3D>
      </AbsoluteFill>
      <CharLayer defs={<Defs alive={alive} />} filter="castleLit">
        {children}
      </CharLayer>
      {over}
    </Fade>
  );
};

const HallShot: React.FC<{ cam: Cam3; g: number; hall: Omit<HallProps, "t" | "alive">; alive?: number; world?: React.ReactNode; over?: React.ReactNode; shake?: number; children: React.ReactNode }> = ({ cam, g, hall, alive, world, over, shake = 0, children }) => {
  const f = useCurrentFrame();
  const a = alive ?? hallAlive(g);
  return (
    <Fade f={f} bg="#2a1e38" shake={shake}>
      <AbsoluteFill style={{ filter: `saturate(${1.05 + a * 0.22}) contrast(1.05)` }}>
        <World3D cam={cam} bloom={0.45 + a * 0.3} threshold={0.8}>
          <InstrumentHall t={g / 30} alive={a} {...hall} />
          {world}
        </World3D>
      </AbsoluteFill>
      <CharLayer defs={<Defs alive={a} />} filter="hallLit">
        {children}
      </CharLayer>
      {over}
    </Fade>
  );
};

// ======================================================================================
// Scene 0: the Rainbow Heart's image of the music box, exactly where Episode 13 ended
// ======================================================================================
const RESTORED: SkyState = {
  amt: 1,
  drift: 0,
  bridge: { sat: [1, 1, 1, 1, 1, 1, 1], flick: [0, 0, 0, 0, 0, 0, 0], hole: [0, 0, 0, 0, 0, 0, 0], holeZ: -1.3, holeR: 1.6, fillR: 0.52, fillOn: 1, bright: 1.15 },
  cloudsGone: 0.6,
  cloudsBack: 1,
  isleCol: { flower: 1, falls: 1, sun: 1 },
  rainFalls: 1,
  threads: 1,
};
const W_DRACO = onBridge(-1.85, -45.6);
const W_LUMI = onBridge(-0.95, -45.0);
const W_BOBO = onBridge(0.5, -44.8);
const W_KIKO = onBridge(1.6, -45.4);
const W_PICO = onBridge(2.35, -46.2);
const MBOX: V3 = [0, BRIDGE_H + 5.4, CHAMBER_Z - 0.6];

const Scene0: React.FC = () => {
  const f = useCurrentFrame();
  const g = f;
  const t = g / 30;
  const cam = camAt(g, [
    [0, { pos: [0.25, 21.2, -37.4], target: [0.2, 23.8, -49], fov: 62 }],
    [K.L1 - 4, { pos: [0.25, 21.1, -37.9], target: [0.2, 23.6, -49], fov: 62 }],
    [K.L1 - 3, { pos: [2.75, 20.85, -43.4], target: [2.4, 20.65, -46.2], fov: 40 }],
    [K.L2 - 4, { pos: [2.75, 20.85, -43.7], target: [2.4, 20.65, -46.2], fov: 40 }],
    [K.L2 - 3, { pos: [-0.3, 20.95, -40.9], target: [-0.4, 20.95, -45.0], fov: 48 }],
    [K.JUMP - 1, { pos: [-0.3, 20.95, -41.2], target: [-0.4, 20.95, -45.0], fov: 48 }],
    [K.JUMP, { pos: [0.25, 21.0, -38.2], target: MBOX, fov: 60 }],
    [CUTS[1] + XF, { pos: [0.25, 23.0, -43.5], target: MBOX, fov: 52 }],
  ]);
  const jk = ip(g, [K.JUMP, K.JUMP + 26], [0, 1], Easing.in(Easing.quad));
  const jumpTo = (p: V3, dx: number): V3 => up(lerp3(p, [MBOX[0] + dx, MBOX[1] - 1.0, MBOX[2] + 1.2], jk), hopArc(jk, 1.4));
  const shrink = 1 - jk * 0.65;
  const L = place(cam, jumpTo(W_LUMI, -0.4), LUMI_S * shrink);
  const D = place(cam, jumpTo(W_DRACO, -0.9), DRACO_S * shrink);
  const B = place(cam, jumpTo(W_BOBO, 0.4), BOBO_S * shrink);
  const Kk = place(cam, jumpTo(W_KIKO, 0.9), KIKO_S * shrink);
  const P = place(cam, up(W_PICO, 0), PICO_S);
  const Ms = screen(cam, MBOX);
  const Hs = screen(cam, HEART_AT);
  const look = (w: Pt) => lookAtPt(w, Ms, 400);
  const lookP = (w: Pt) => lookAtPt(w, { x: P.x, y: P.y - 150 * P.scale }, 300);
  const jumping = g >= K.JUMP;
  const pTalk = within(g, K.L1, K.L1_END + 4);
  const pStartle = ip(g, [K.JUMP, K.JUMP + 24], [0, 1]);
  const pColor = jumping && pStartle < 1 ? colorPath(PICO_FLASH, pStartle * 7) : PICO_GREEN;
  const holoScale = 1.3 + ip(g, [0, 18], [0.3, 0], OUT) + ip(g, [K.JUMP + 6, CUTS[1] + XF], [0, 2.6], Easing.in(Easing.quad));
  const lumiTalk = mouthAt("lumi", g) > 0.06;
  return (
    <AbsoluteFill style={{ background: "#c8d4f0" }}>
      <AbsoluteFill style={{ filter: "saturate(1.28) contrast(1.07)" }}>
        <World3D cam={cam} bloom={0.4} threshold={0.86}>
          <RainbowSky t={t} s={RESTORED} chamber={{ lit: 1, pedestal: 1 }} heart={{ sat: 1, glow: 1.25 }} />
          <MusicBoxHologram position={MBOX} t={t + 3} on={1} lid={1} scale={holoScale} />
          <SparkleBurst3D position={MBOX} age={ip(g, [0, 40], [0, 1])} reach={8} count={160} seed={141} size={18} colors={["#ffe0a0", "#ff9fe0", "#b88aff", "#ffffff"]} />
          <LightRing position={MBOX} age={ip(g, [0, 28], [0, 1])} radius={7} flat={false} color="#fff0f8" />
        </World3D>
      </AbsoluteFill>
      <CharLayer defs={<Defs />} filter="rainbowLit">
        <path d={`M ${Hs.x - 20} ${Hs.y} L ${Ms.x - 240} ${Ms.y + 220} L ${Ms.x + 240} ${Ms.y + 220} L ${Hs.x + 20} ${Hs.y} Z`} fill="#fff0ff" opacity={0.14} />
        <Pico
          x={P.x}
          y={P.y}
          scale={P.scale}
          g={g}
          uid="p0"
          color={pColor}
          mood={jumping ? (pStartle < 0.6 ? "surprised" : "joy") : pTalk ? (mouthAt("pico", g) > 0.06 ? "happy" : "joy") : "joy"}
          mouth={mouthAt("pico", g)}
          look={pTalk ? lookAtPt(P, { x: L.x, y: L.y - 300 * L.scale }, 150) : lookAtPt(P, Ms, 200)}
          blink={blinkAt(g, 19)}
          armsUp={jumping ? 0.95 : 0.55 + Math.sin(g / 3) * 0.35}
          hop={jumping ? hopArc(pStartle, 140) : Math.abs(Math.sin(g / 6)) * 30}
          headTilt={talk("pico", g)}
        />
        <Draco x={D.x} y={D.y} scale={D.scale} g={g} mood={jumping ? "joy" : "happy"} look={pTalk ? lookP(D) : look(D)} blink={blinkAt(g, 5)} wing={jumping ? 1 : 0.6} flap={jumping ? Math.sin(g * 0.8) * 24 : 0} armsUp={jumping ? 0.9 : 0.3} glow={0.5} />
        <Lumi x={L.x} y={L.y} scale={L.scale} look={pTalk ? lookP(L) : look(L)} expr={lumiTalk ? "happy" : "excited"} mouth={mouthAt("lumi", g)} armR={g >= K.L2 ? -130 : -22} armL={jumping ? 150 : 22} headTilt={talk("lumi", g)} blink={blinkAt(g, 1)} />
        <Worn L={L} g={g} glow={0.9} />
        <BoboRider g={g} x={B.x} y={B.y} scale={B.scale} look={pTalk ? lookP(B) : look(B)} expr={jumping ? "excited" : "happy"} armL={jumping ? 150 : 20} armR={jumping ? -150 : pTalk ? -140 + Math.sin(g / 3) * 20 : -20} blink={blinkAt(g, 3)} riderArmsUp={jumping} />
        <Kiko x={Kk.x} y={Kk.y} scale={Kk.scale} g={g} mood={jumping ? "joy" : "excited"} look={pTalk ? lookP(Kk) : look(Kk)} blink={blinkAt(g, 11)} armL={jumping ? 150 : 30} armR={jumping ? -150 : -30} legs={jumping ? 0.7 : 0} tailSwish={1.2} />
        <SparkBurst f={f} at={0} x={Ms.x} y={Ms.y} reach={460} count={26} size={20} life={34} />
        {pTalk && <IconBubble x={P.x - 170 * P.scale} y={P.y - 560 * P.scale} scale={0.5} kind="hearts" on={ip(g, [K.L1 + 20, K.L1 + 28], [0, 1])} g={g} />}
      </CharLayer>
      <AbsoluteFill style={{ background: "radial-gradient(circle at 50% 40%, #ffffff 0%, #fff0f8 45%, #e0d0ff 100%)", opacity: ip(g, [K.JUMP + 14, CUTS[1] + XF], [0, 1], EASE) }} />
    </AbsoluteFill>
  );
};

// ======================================================================================
// Scene 1: the silent castle
// ======================================================================================
const SKY_PORTAL: V3 = [0, 8, 3];
const A_LUMI: V3 = [-0.9, 0.02, 5.2];
const A_BOBO: V3 = [0.5, 0.02, 5.5];
const A_DRACO: V3 = [-2.3, 0.02, 5.9];
const A_KIKO: V3 = [1.9, 0.02, 5.9];

const Scene1: React.FC = () => {
  const f = useCurrentFrame();
  const g = f + CUTS[1];
  const t = g / 30;
  const alive = alivePre(g);
  const cam = camAt(g, [
    [CUTS[1], { pos: [0, 15, 40], target: [0, 9, -12], fov: 50 }],
    [K.LAND - 6, { pos: [0, 3.0, 17.5], target: [0, 4.4, -8], fov: 54 }],
    [K.L3 - 4, { pos: [0, 1.9, 14.2], target: [0, 2.8, -6], fov: 52 }],
    [K.L3 - 3, { pos: [-0.5, 1.5, 9.0], target: [-0.6, 1.25, 5.2], fov: 42 }],
    [K.CLAP - 7, { pos: [-0.5, 1.45, 8.7], target: [-0.6, 1.3, 5.2], fov: 42 }],
    [K.CLAP - 6, { pos: [0.6, 1.25, 8.6], target: [0.5, 1.05, 5.5], fov: 42 }],
    [K.L4 + 32, { pos: [0.6, 1.2, 8.4], target: [0.5, 1.05, 5.5], fov: 42 }],
    [K.L4 + 33, { pos: [7.5, 7.0, 16.5], target: [0, 1.2, -1], fov: 52 }],
    [K.L5 - 7, { pos: [6.5, 6.4, 15.5], target: [0, 1.2, -1], fov: 52 }],
    [K.L5 - 6, { pos: [2.2, 1.05, 9.1], target: [1.9, 0.9, 5.9], fov: 42 }],
    [K.L6 - 7, { pos: [2.2, 1.05, 8.8], target: [1.9, 0.9, 5.9], fov: 42 }],
    [K.L6 - 6, { pos: [-2.8, 0.55, 9.6], target: [-2.3, 1.3, 5.9], fov: 46 }],
    [K.SQUEAK + 13, { pos: [-2.8, 0.6, 9.2], target: [-2.3, 1.3, 5.9], fov: 46 }],
    [K.SQUEAK + 14, { pos: [0, 1.5, 11.8], target: [0, 1.05, 5.3], fov: 46 }],
    [K.TUMMY - 3, { pos: [0, 1.5, 11.4], target: [0, 1.05, 5.3], fov: 46 }],
    [K.TUMMY - 2, { pos: [0.55, 1.05, 8.6], target: [0.5, 0.8, 5.5], fov: 42 }],
    [CUTS[2] + XF, { pos: [0.55, 1.05, 8.3], target: [0.5, 0.8, 5.5], fov: 42 }],
  ]);
  // falling out of the sky portal onto the courtyard
  const fallK = (d: number) => ip(g, [K.REVEAL + 14 + d, K.LAND + d * 0.3], [0, 1], Easing.inOut(Easing.quad));
  const route = (land: V3, d: number): V3 => {
    const k = fallK(d);
    return up(lerp3(SKY_PORTAL, land, k), hopArc(k, 1.2) * 0.6);
  };
  const landed = g >= K.LAND + 6;
  const L = place(cam, route(A_LUMI, 0), LUMI_S);
  const B = place(cam, route(A_BOBO, 4), BOBO_S);
  const D = place(cam, route(A_DRACO, 8), DRACO_S);
  const Kk = place(cam, route(A_KIKO, 2), KIKO_S);
  const portal = screen(cam, SKY_PORTAL);
  const portalOn = ip(g, [K.REVEAL, K.REVEAL + 10, K.LAND, K.LAND + 16], [0, 1, 1, 0]);
  const clapping = within(g, K.CLAP, K.CLAP + 28);
  const clapK = clapping ? Math.abs(Math.sin(((g - K.CLAP) / 28) * Math.PI * 3)) : 0;
  const hello = within(g, K.L4, K.L4 + 30);
  const piano = within(g, K.PIANO, K.L5_END + 6);
  const heroic = within(g, K.L6, K.SQUEAK);
  const deadpan = within(g, K.SQUEAK + 6, K.L7);
  const tummy = within(g, K.TUMMY, CUTS[2] + XF);
  const bMouth = mouthAt("bobo", g);
  const dMouth = mouthAt("draco", g);
  const kMouth = mouthAt("kiko", g);
  const castleS = screen(cam, [0, 9, -14]);
  const lookCastle = (w: Pt) => lookAtPt(w, castleS, 400);
  const lookB = (w: Pt) => lookAtPt(w, { x: B.x, y: B.y - (tummy ? 120 : 260) * B.scale }, 300);
  const lookD = (w: Pt) => lookAtPt(w, { x: D.x, y: D.y - 250 * D.scale }, 300);
  const lookK = (w: Pt) => lookAtPt(w, { x: Kk.x, y: Kk.y - 200 * Kk.scale }, 300);
  const noteUp = (w: Pt, ph: number) => ({ x: Math.sin(g / 30 + ph) * 0.6, y: -0.8 });
  const focus = (w: Pt, ph: number) =>
    tummy ? lookB(w) : heroic || deadpan ? lookD(w) : piano ? lookK(w) : within(g, K.CLAP, K.L4_END) ? lookB(w) : within(g, K.L3, K.CLAP) ? noteUp(w, ph) : lookCastle(w);
  const mouthPt = { x: D.x - 10 * D.scale, y: D.y - 175 * D.scale };
  const sq = ip(g, [K.SQUEAK, K.SQUEAK + 30], [0, 1]);
  return (
    <CastleShot cam={cam} g={g} alive={alive} fade={false} over={<AbsoluteFill style={{ background: "radial-gradient(circle at 50% 40%, #ffffff 0%, #fff0f8 45%, #e0d0ff 100%)", opacity: ip(f, [0, 16], [1, 0], EASE) }} />}>
      {portalOn > 0.01 && (
        <g opacity={portalOn}>
          <circle cx={portal.x} cy={portal.y} r={150 * portalOn} fill="url(#noteGlow)" />
          <SparkBurst f={f} at={K.REVEAL - CUTS[1] + 8} x={portal.x} y={portal.y} reach={260} count={18} size={16} life={30} rainbow />
        </g>
      )}
      <Draco
        x={D.x}
        y={D.y}
        scale={D.scale}
        g={g}
        mood={deadpan ? "neutral" : heroic ? (dMouth > 0.06 ? "excited" : "effort") : tummy ? "joy" : !landed ? "joy" : "happy"}
        mouth={dMouth}
        look={deadpan ? { x: 0, y: 0.35 } : heroic ? { x: 0.3, y: -0.6 } : focus(D, 3)}
        blink={deadpan ? 0.45 : blinkAt(g, 5)}
        wing={heroic || !landed ? 1 : 0.45}
        flap={!landed ? Math.sin(g * 0.8) * 22 : 0}
        armsUp={heroic ? 0.9 : !landed ? 0.6 : 0.2}
        breath={ip(g, [K.SQUEAK - 14, K.SQUEAK - 2, K.SQUEAK + 2], [0, 1, 0])}
        squash={deadpan ? 0.94 : 1}
        headTilt={talk("draco", g)}
        glow={0.45}
      />
      {deadpan && <DracoBlush x={D.x} y={D.y} scale={D.scale} amount={ip(g, [K.SQUEAK + 8, K.SQUEAK + 18], [0, 0.85])} />}
      {sq > 0 && sq < 1 && <GlowNote x={mouthPt.x - 40 * sq * D.scale * 3} y={mouthPt.y - 60 * D.scale - sq * 80 * D.scale} scale={D.scale * (0.35 + sq * 0.2)} color="#c8b8e8" glow={0.3} rot={-30 + sq * 70} crooked={0.6} opacity={1 - sq} />}
      {deadpan && <IconBubble x={D.x + 190 * D.scale} y={D.y - 540 * D.scale} scale={D.scale * 0.6} kind="dots" on={ip(g, [K.SQUEAK + 10, K.SQUEAK + 18], [0, 1])} g={g} />}
      <Lumi
        x={L.x}
        y={L.y}
        scale={L.scale}
        look={focus(L, 1)}
        expr={mouthAt("lumi", g) > 0.06 ? "happy" : deadpan ? "neutral" : tummy ? "happy" : !landed ? "excited" : within(g, K.CLAP, K.L4_END) ? "surprised" : "happy"}
        mouth={mouthAt("lumi", g)}
        armL={!landed ? 150 : 22}
        armR={!landed ? -150 : within(g, K.L3, K.L3_END) ? -110 : -22}
        headTilt={talk("lumi", g) + (deadpan ? 6 : 0)}
        blink={deadpan ? 0.45 : blinkAt(g, 1)}
      />
      <Worn L={L} g={g} />
      <BoboRider
        g={g}
        x={B.x}
        y={B.y}
        scale={B.scale}
        look={hello ? { x: 0.5, y: -0.7 } : tummy ? { x: 0, y: 0.8 } : focus(B, 2)}
        expr={tummy ? (bMouth > 0.06 ? "happy" : "surprised") : bMouth > 0.06 ? "excited" : clapping ? "excited" : within(g, K.CLAP + 28, K.L4) ? "surprised" : !landed ? "excited" : deadpan ? "neutral" : "happy"}
        mouth={bMouth}
        armL={clapping ? 140 + clapK * 38 : hello ? 120 : !landed ? 150 : 20}
        armR={clapping ? -140 - clapK * 38 : hello ? -120 : !landed ? -150 : within(g, K.L7, K.L7_END) ? -40 : -20}
        headTilt={talk("bobo", g) + (within(g, K.CLAP + 28, K.L4) ? 10 : 0)}
        blink={deadpan ? 0.45 : blinkAt(g, 3)}
        squash={tummy ? 1 + Math.sin(g * 1.6) * 0.03 : 1}
        riderArmsUp={!landed}
      />
      <SilentClap x={B.x} y={B.y - 460 * B.scale} scale={B.scale} on={clapping ? clapK : 0} g={g} />
      {within(g, K.CLAP + 26, K.L4 + 4) && <IconBubble x={B.x + 190 * B.scale} y={B.y - 560 * B.scale} scale={B.scale * 0.6} kind="dots" on={ip(g, [K.CLAP + 26, K.CLAP + 32], [0, 1])} g={g} />}
      <NoEcho x={B.x + 120 * B.scale} y={B.y - 520 * B.scale} on={ip(g, [K.L4 + 18, K.L4 + 24], [0, 1])} age={ip(g, [K.L4 + 18, K.L4 + 70], [0, 1])} />
      {within(g, K.L4 + 34, K.L5 - 6) && <IconBubble x={540} y={560} scale={0.9} kind="question" on={ip(g, [K.L4 + 40, K.L4 + 48], [0, 1])} g={g} />}
      <TummyWaves x={B.x} y={B.y - 130 * B.scale} scale={B.scale} on={ip(g, [K.TUMMY, K.TUMMY + 4, K.TUMMY + 36, K.TUMMY + 44], [0, 1, 1, 0])} g={g} />
      <BoboBigEyes x={B.x} y={B.y} scale={B.scale} g={g} amount={within(g, K.TUMMY, K.TUMMY + 30) ? 0.9 : 0} />
      <Kiko
        x={Kk.x}
        y={Kk.y}
        scale={Kk.scale}
        g={g}
        mood={piano ? (kMouth > 0.06 ? "excited" : "joy") : tummy ? "joy" : deadpan ? "neutral" : !landed ? "joy" : "happy"}
        mouth={kMouth}
        look={piano ? { x: -0.1, y: 0.7 } : focus(Kk, 4)}
        blink={deadpan ? 0.5 : blinkAt(g, 11)}
        armL={piano ? 70 + Math.sin(g * 1.3) * 18 : !landed ? 150 : 20}
        armR={piano ? -70 - Math.sin(g * 1.3 + 1.5) * 18 : !landed ? -150 : -20}
        legs={!landed ? 0.6 : 0}
        lean={piano ? Math.sin(g / 5) * 6 : tummy ? Math.sin(g * 1.3) * 6 : 0}
        headTilt={talk("kiko", g) + (piano ? Math.sin(g / 6) * 8 : 0)}
        tailSwish={1.3}
      />
      <InvisiblePiano x={Kk.x} y={Kk.y - 150 * Kk.scale} scale={Kk.scale * 0.9} on={piano ? ip(g, [K.PIANO, K.PIANO + 10], [0, 1]) : 0} g={g} />
    </CastleShot>
  );
};

// ======================================================================================
// Scene 2: meeting Melody at the silent fountain
// ======================================================================================
const RIM: V3 = [0.25, 0.68, -0.78];
const STATUE: V3 = [-3.7, 0.02, -2.2];
const F_LUMI: [V3, V3] = [[-1.5, 0.02, 1.9], [-1.3, 0.02, 1.2]];
const F_DRACO: [V3, V3] = [[-2.5, 0.02, 2.4], [-2.35, 0.02, 1.7]];
const F_BOBO: [V3, V3] = [[1.5, 0.02, 2.1], [1.35, 0.02, 1.4]];
const F_KIKO: [V3, V3] = [[2.5, 0.02, 2.5], [2.35, 0.02, 1.8]];

const Scene2: React.FC = () => {
  const f = useCurrentFrame();
  const g = f + CUTS[2];
  const alive = alivePre(g);
  const cam = camAt(g, [
    [CUTS[2], { pos: [0, 2.0, 10.6], target: [0, 1.3, -2.5], fov: 56 }],
    [K.PEEK - 4, { pos: [0, 1.8, 9.6], target: [0, 1.2, -2.2], fov: 56 }],
    [K.PEEK - 3, { pos: [0.25, 1.4, 2.9], target: [0.25, 1.15, -0.8], fov: 40 }],
    [K.L10 - 4, { pos: [0.25, 1.4, 2.7], target: [0.25, 1.15, -0.8], fov: 40 }],
    [K.L10 - 3, { pos: [-0.55, 1.35, 4.6], target: [-0.55, 1.05, -0.4], fov: 44 }],
    [K.L11 - 4, { pos: [-0.55, 1.35, 4.4], target: [-0.55, 1.05, -0.4], fov: 44 }],
    [K.L11 - 3, { pos: [0.25, 1.35, 2.7], target: [0.25, 1.15, -0.8], fov: 40 }],
    [K.EARS - 4, { pos: [0.25, 1.4, 2.9], target: [0.25, 1.15, -0.8], fov: 40 }],
    [K.EARS - 3, { pos: [0, 1.7, 7.8], target: [0, 1.15, -1.2], fov: 50 }],
    [K.STATUE - 3, { pos: [0, 1.7, 7.5], target: [0, 1.15, -1.2], fov: 50 }],
    [K.STATUE - 2, { pos: [-2.5, 1.55, 0.9], target: [-3.6, 1.35, -2.2], fov: 38 }],
    [K.HOLD - 6, { pos: [-2.6, 1.55, 0.7], target: [-3.6, 1.35, -2.2], fov: 38 }],
    [K.HOLD - 5, { pos: [2.4, 1.05, 4.9], target: [2.5, 0.85, 1.6], fov: 42 }],
    [K.L13 - 5, { pos: [2.4, 1.05, 4.6], target: [2.5, 0.85, 1.6], fov: 42 }],
    [K.L13 - 4, { pos: [0.25, 1.35, 2.6], target: [0.25, 1.12, -0.8], fov: 40 }],
    [CUTS[3] + XF, { pos: [0.25, 1.35, 2.3], target: [0.25, 1.12, -0.8], fov: 40 }],
  ]);
  const closer = ip(g, [K.LOOK, K.LOOK + 26], [0, 1], EASE);
  const tip = within(g, K.LOOK, K.LOOK + 26);
  const L = place(cam, lerp3(F_LUMI[0], F_LUMI[1], closer), LUMI_S);
  const D = place(cam, lerp3(F_DRACO[0], F_DRACO[1], closer), DRACO_S);
  const B = place(cam, lerp3(F_BOBO[0], F_BOBO[1], closer), BOBO_S);
  const Kk = place(cam, lerp3(F_KIKO[0], F_KIKO[1], closer), KIKO_S);
  // Melody behind the rim, then up on it
  const pop = ip(g, [K.PEEK, K.PEEK + 9, K.PEEK + 14], [0, 1.12, 1], EASE);
  const earsOnly = g < K.PEEK ? (within(g, K.LOOK, K.LOOK + 26) ? 1.0 + Math.sin(g / 4) * 0.03 : 1.08) : 0;
  const M = place(cam, RIM, MEL_S);
  const rimY = screen(cam, RIM).y + 4 * M.scale;
  const sink = g < K.PEEK ? 300 * earsOnly : (1 - pop) * 330;
  const mTalk = mouthAt("melody", g);
  const embarrassed = g >= K.L12 + 20;
  const proud = within(g, K.L11, K.SING2);
  const mood: MelodyMood = melMood(g, embarrassed ? (g >= K.L13 && mTalk > 0.06 ? "embarrassed" : "embarrassed") : proud ? "proud" : g < K.PEEK + 16 ? "surprised" : mTalk > 0.06 ? "happy" : "joy");
  const sour = within(g, K.SING1, K.SING1_END + 20) || within(g, K.SING2, K.SING2_END + 10);
  const ears = within(g, K.EARS, K.SING2_END + 8);
  const holding = within(g, K.SING2 + 10, K.L12);
  const Ss = place(cam, STATUE, 1);
  const statueMood = within(g, K.STATUE, K.L13) ? "confused" : "serene";
  const lookM = (w: Pt) => lookAtPt(w, { x: M.x, y: M.y - 200 * M.scale }, 300);
  const fountainS = screen(cam, [0, 1.6, -3]);
  const lookF = (w: Pt) => lookAtPt(w, fountainS, 360);
  const focus = (w: Pt) => (g < K.PEEK ? lookF(w) : lookM(w));
  const bMouth = mouthAt("bobo", g);
  const kMouth = mouthAt("kiko", g);
  const tailTip = melodyTailTip(M.x, M.y + sink * M.scale, M.scale, 0, g);
  return (
    <CastleShot cam={cam} g={g} alive={alive}>
      <SingingStatue x={Ss.x} y={Ss.y} scale={Ss.scale * 1.05} g={g} mood={statueMood} alive={alive * 0.3} lean={statueMood === "confused" ? -6 : 0} />
      {within(g, K.STATUE + 4, K.L13) && <IconBubble x={Ss.x + 140 * Ss.scale} y={Ss.y - 720 * Ss.scale} scale={Ss.scale * 0.9} kind="question" on={ip(g, [K.STATUE + 4, K.STATUE + 10], [0, 1])} g={g} />}
      {/* Melody: clipped by the fountain's rim while she is behind it */}
      <defs>
        <clipPath id="melRim">
          <rect x={0} y={0} width={1080} height={rimY} />
        </clipPath>
      </defs>
      <g clipPath={g < K.PEEK + 10 ? "url(#melRim)" : undefined}>
        <Melody
          x={M.x}
          y={M.y + sink * M.scale}
          scale={M.scale}
          g={g}
          mood={mood}
          mouth={mTalk}
          look={g < K.PEEK ? { x: 0, y: -0.2 } : singing(g) ? { x: 0, y: -0.6 } : embarrassed ? { x: 0.3, y: 0.7 } : lookAtPt(M, { x: L.x, y: L.y - 330 * L.scale }, 150)}
          blink={singing(g) ? (within(g, K.SING2, K.SING2_END) ? 0.3 : 1) : blinkAt(g, 23)}
          armL={proud ? 120 : singing(g) ? 150 : embarrassed ? 60 : g < K.PEEK + 20 ? 140 : 30}
          armR={proud ? -60 : singing(g) ? -150 : embarrassed ? -70 : g < K.PEEK + 20 ? -140 : -30}
          hop={g >= K.PEEK && g < K.PEEK + 16 ? hopArc(ip(g, [K.PEEK, K.PEEK + 16], [0, 1]), 60) : within(g, K.L9, K.L9_END) ? Math.abs(Math.sin(g / 5)) * 20 : 0}
          squash={within(g, K.SING2, K.SING2_END) ? 1.05 + Math.sin(g / 2) * 0.03 : 1}
          headTilt={talk("melody", g) + (embarrassed ? -10 : 0) + (within(g, K.SING2, K.SING2_END) ? Math.sin(g / 3) * 8 : 0)}
          earL={embarrassed ? 20 : 0}
          earR={embarrassed ? 20 : 0}
          tailSwish={1.2}
          tailUp={singing(g) ? 0.6 : 0}
          tailGlow={singing(g) ? 0.5 : 0}
          blush={embarrassed ? ip(g, [K.L12 + 20, K.L12 + 32], [0, 1]) : 0}
        />
      </g>
      <RisingNotes x={M.x} y={rimY - 40} scale={M.scale * 1.2} g={g} from={K.SING1} on={ip(g, [K.SING1, K.SING1 + 5, K.SING1_END + 10, K.SING1_END + 22], [0, 1, 1, 0])} count={5} sour={1} />
      <RisingNotes x={M.x} y={M.y - 300 * M.scale} scale={M.scale * 1.3} g={g} from={K.SING2} on={ip(g, [K.SING2, K.SING2 + 5, K.SING2_END + 8, K.SING2_END + 20], [0, 1, 1, 0])} count={7} sour={1} spread={1.6} />
      {within(g, K.CRACK, K.CRACK + 12) && <SparkBurst f={g} at={K.CRACK} x={M.x} y={M.y - 300 * M.scale} reach={160} count={10} size={12} life={12} />}
      {sour && <ShakeLines x={M.x} y={M.y - 200 * M.scale} scale={M.scale * 1.3} on={within(g, K.SING2, K.SING2_END) ? 1 : 0} g={g} />}
      <Draco
        x={D.x}
        y={D.y}
        scale={D.scale}
        g={g}
        mood={ears ? "effort" : g >= K.PEEK && g < K.PEEK + 20 ? "surprised" : "happy"}
        look={focus(D)}
        blink={ears ? 0.25 : blinkAt(g, 5)}
        wing={ears ? 0.9 : 0.4}
        armsUp={ears ? 0.85 : 0.2}
        squash={ears ? 0.95 : 1}
        step={tip ? g * 0.3 : null}
        glow={0.4}
      />
      <Lumi
        x={L.x}
        y={L.y}
        scale={L.scale}
        look={focus(L)}
        expr={mouthAt("lumi", g) > 0.06 ? "happy" : ears ? "effort" : g >= K.PEEK && g < K.PEEK + 20 ? "surprised" : g < K.PEEK ? "surprised" : "happy"}
        mouth={mouthAt("lumi", g)}
        armL={tip ? 60 : 22}
        armR={tip ? -60 : -22}
        walk={tip ? g * 0.25 : null}
        headTilt={talk("lumi", g) + (g < K.PEEK ? 6 : 0)}
        blink={ears ? 0.3 : blinkAt(g, 1)}
      />
      <Worn L={L} g={g} />
      <BoboRider
        g={g}
        x={B.x}
        y={B.y}
        scale={B.scale}
        look={ears ? { x: 0, y: 0 } : focus(B)}
        expr={ears ? "effort" : bMouth > 0.06 ? "excited" : g >= K.PEEK && g < K.PEEK + 20 ? "surprised" : "happy"}
        mouth={bMouth}
        armL={ears ? 168 : tip ? 60 : 20}
        armR={ears ? -168 : tip ? -60 : -20}
        walk={tip ? g * 0.25 : null}
        squash={ears ? 0.94 + Math.sin(g * 1.4) * 0.02 : 1}
        headTilt={talk("bobo", g) + (ears ? Math.sin(g / 2) * 5 : 0)}
        blink={ears ? 0.2 : blinkAt(g, 3)}
        riderHappy={false}
      />
      {ears && <ShakeLines x={B.x} y={B.y - 300 * B.scale} scale={B.scale} on={1} g={g} />}
      <Kiko
        x={Kk.x}
        y={Kk.y}
        scale={Kk.scale}
        g={g}
        mood={holding ? "happy" : g >= K.L12 && kMouth > 0.06 ? "excited" : g >= K.L12 ? "joy" : g >= K.PEEK && g < K.PEEK + 20 ? "surprised" : "happy"}
        mouth={kMouth}
        look={holding ? { x: -0.5, y: 0.5 } : focus(Kk)}
        blink={holding ? 0.25 : blinkAt(g, 11)}
        armL={holding ? 120 : 20}
        armR={holding ? -150 : -20}
        lean={holding ? Math.sin(g * 1.7) * 5 : tip ? -6 : 0}
        squash={holding ? 0.94 + Math.sin(g * 2.1) * 0.03 : 1}
        legs={tip ? Math.abs(Math.sin(g / 5)) * 0.25 : 0}
        headTilt={talk("kiko", g)}
        tailSwish={holding ? 2 : 1.3}
      />
      {holding && <SweatDrop x={Kk.x + 100 * Kk.scale} y={Kk.y - 380 * Kk.scale} scale={Kk.scale} g={g} />}
      {holding && <ShakeLines x={Kk.x} y={Kk.y - 200 * Kk.scale} scale={Kk.scale} on={1} g={g} />}
      {/* Melody pictures the music box that stopped */}
      <ThoughtBubble x={Math.min(820, M.x + 240 * M.scale)} y={Math.max(300, M.y - 900 * M.scale)} scale={M.scale * 1.4} on={ip(g, [K.L10 + 40, K.L10 + 50, K.L11 - 6, K.L11], [0, 1, 1, 0])} tail={-1}>
        <g transform="scale(0.9)">
          <rect x={-70} y={-40} width={140} height={80} rx={10} fill="#c8b890" stroke="#8a7a50" strokeWidth={5} />
          <rect x={-74} y={-58} width={148} height={22} rx={8} fill="#d8c8a0" stroke="#8a7a50" strokeWidth={5} />
          <g transform="translate(20 -72) rotate(20) scale(0.7)" opacity={0.6}>
            <path d="M -12 -4 a 14 10 -25 1 0 26 -6 L 14 -58 L 18 -58 L 18 -10 Z" fill="#9a9a9a" />
          </g>
          <path d="M -30 -100 L 60 -10 M 60 -100 L -30 -10" stroke="#e05a6a" strokeWidth={9} strokeLinecap="round" opacity={0.85} />
        </g>
      </ThoughtBubble>
      {g >= K.PEEK && g < K.PEEK + 14 && <SparkBurst f={g} at={K.PEEK} x={M.x} y={M.y - 200 * M.scale} reach={220} count={14} size={14} life={14} rainbow />}
      {within(g, K.PEEK + 4, K.PEEK + 30) && <IconBubble x={B.x - 170 * B.scale} y={B.y - 560 * B.scale} scale={B.scale * 0.6} kind="bang" on={ip(g, [K.PEEK + 4, K.PEEK + 10], [0, 1])} g={g} tail={1} />}
      <GlowNote x={tailTip.x} y={tailTip.y} scale={M.scale * 0.6} color={NOTE_PINK} glow={0.6} opacity={within(g, K.L9, K.L9_END) ? 0.9 : 0} rot={Math.sin(g / 3) * 20} />
    </CastleShot>
  );
};

// ======================================================================================
// Scene 3: the golden Music Door
// ======================================================================================
const SEQ = [2, 0, 3, 1, 4]; // the order the symbols glow: the castle's melody
const D_LUMI: V3 = [-0.9, 0.02, -12.6];
const D_MEL: V3 = [0.15, 0.02, -13.1];
const D_BOBO: V3 = [1.1, 0.02, -12.5];
const D_DRACO: V3 = [-1.95, 0.02, -12.2];
const D_KIKO: V3 = [1.95, 0.02, -12.4];

const doorAt = (g: number) => {
  const lit = [0, 0, 0, 0, 0];
  let wrong = 0;
  // the pattern: each symbol flashes in turn
  SEQ.forEach((s, n) => {
    lit[s] = Math.max(lit[s], ip(g, [K.PATTERN + n * 13, K.PATTERN + n * 13 + 3, K.PATTERN + n * 13 + 12, K.PATTERN + n * 13 + 18], [0, 1, 1, 0.1]));
  });
  // Melody's three right notes stay lit until Kiko's trick
  for (let n = 0; n < 3; n++) {
    const at = K.TAIL + 6 + n * 14 + 8;
    if (g < K.BUZZ) lit[SEQ[n]] = Math.max(lit[SEQ[n]], ip(g, [at, at + 3], [0, 1]));
  }
  // Kiko's silly taps
  [3, 1, 4, 0, 2].forEach((s, n) => {
    const at = K.TRICK + n * 9;
    if (g >= at && g < K.BUZZ) lit[s] = Math.max(lit[s] * 0.5, ip(g, [at, at + 2, at + 9], [0, 1, 0.4]));
  });
  if (g >= K.BUZZ && g < K.NOTES5) {
    wrong = ip(g, [K.BUZZ, K.BUZZ + 3, K.BUZZ + 16, K.BUZZ + 20], [0, 1, 1, 0]);
    for (let i = 0; i < 5; i++) lit[i] = wrong;
  }
  // Draco's honk makes one symbol blush red
  if (within(g, K.HONK, K.HONK + 20)) {
    wrong = Math.max(wrong, ip(g, [K.HONK, K.HONK + 3, K.HONK + 20], [0, 0.6, 0]));
  }
  // together: the five true notes
  SEQ.forEach((s, n) => {
    const at = K.NOTES5 + n * 11 + 8;
    if (g >= K.NOTES5) lit[s] = ip(g, [at, at + 3], [0, 1]);
  });
  const open = ip(g, [K.OPEN, K.OPEN + 40], [0, 1], Easing.inOut(Easing.quad));
  return { lit, open, wrong };
};

const Scene3: React.FC = () => {
  const f = useCurrentFrame();
  const g = f + CUTS[3];
  const alive = alivePre(g);
  const cam = camAt(g, [
    [CUTS[3], { pos: [0, 1.5, -5.7], target: [0, 4.6, -16], fov: 64 }],
    [K.TAIL - 4, { pos: [0, 1.45, -6.0], target: [0, 4.6, -16], fov: 64 }],
    [K.TAIL - 3, { pos: [0.3, 2.2, -6.8], target: [0.15, 3.6, -16], fov: 58 }],
    [K.TRICK - 4, { pos: [0.3, 2.2, -7.0], target: [0.15, 3.6, -16], fov: 58 }],
    [K.TRICK - 3, { pos: [0, 5.6, -9.4], target: [0, 6.0, -16], fov: 50 }],
    [K.BUZZ + 14, { pos: [0, 5.7, -9.7], target: [0, 6.0, -16], fov: 50 }],
    [K.BUZZ + 15, { pos: [-1.4, 1.1, -8.2], target: [-1.8, 1.25, -12.2], fov: 46 }],
    [K.DANCE - 4, { pos: [-1.4, 1.1, -8.4], target: [-1.8, 1.25, -12.2], fov: 46 }],
    [K.DANCE - 3, { pos: [1.0, 1.2, -9.0], target: [1.05, 0.95, -12.5], fov: 46 }],
    [K.TOGETHER - 4, { pos: [1.0, 1.2, -9.2], target: [1.05, 0.95, -12.5], fov: 46 }],
    [K.TOGETHER - 3, { pos: [0, 1.6, -5.8], target: [0, 4.4, -16], fov: 64 }],
    [K.OPEN, { pos: [0, 1.6, -6.6], target: [0, 4.0, -16], fov: 64 }],
    [CUTS[4] + XF, { pos: [0, 1.8, -9.8], target: [0, 3.0, -16], fov: 58 }],
  ]);
  const door = doorAt(g);
  const L = place(cam, D_LUMI, LUMI_S);
  const M = place(cam, D_MEL, MEL_S);
  const B = place(cam, D_BOBO, BOBO_S);
  const D = place(cam, D_DRACO, DRACO_S);
  // Kiko hops up to the symbols and taps a silly tune
  const kikoSym = (n: number): V3 => {
    const s = symAt([3, 1, 4, 0, 2][n]);
    return [s[0], s[1] - 0.85, s[2] + 0.35];
  };
  let kP: V3 = D_KIKO;
  if (g >= K.TRICK - 8 && g < K.BUZZ + 14) {
    const n = Math.max(0, Math.min(4, Math.floor((g - K.TRICK) / 9)));
    if (g < K.TRICK) kP = up(lerp3(D_KIKO, kikoSym(0), ip(g, [K.TRICK - 8, K.TRICK], [0, 1], EASE)), hopArc(ip(g, [K.TRICK - 8, K.TRICK], [0, 1]), 1.5));
    else if (g < K.TRICK + 45) {
      const k = ((g - K.TRICK) % 9) / 9;
      kP = up(lerp3(kikoSym(n), kikoSym(Math.min(4, n + 1)), n < 4 ? EASE(k) : 0), hopArc(k, 0.35));
    } else kP = up(lerp3(kikoSym(4), D_KIKO, ip(g, [K.BUZZ + 2, K.BUZZ + 14], [0, 1], EASE)), hopArc(ip(g, [K.BUZZ + 2, K.BUZZ + 14], [0, 1]), 0.8));
  }
  const Kk = place(cam, kP, KIKO_S);
  const kikoUp = g >= K.TRICK - 8 && g < K.BUZZ + 14;
  const trick = within(g, K.TRICK, K.BUZZ);
  const buzz = within(g, K.BUZZ, K.BUZZ + 20);
  const dHero = within(g, K.L16, K.HONK);
  const honk = within(g, K.HONK, K.HONK + 26);
  const dance = within(g, K.DANCE, K.L17_END + 8);
  const together = g >= K.TOGETHER;
  const notesOn = within(g, K.TAIL, K.TAIL + 50) || within(g, K.NOTES5, K.OPEN + 6);
  const mTalk = mouthAt("melody", g);
  const symS = [0, 1, 2, 3, 4].map((i) => screen(cam, symAt(i)));
  const symScale = place(cam, symAt(2), 1).scale;
  const doorS = screen(cam, [0, 4.5, -16]);
  const lookDoor = (w: Pt) => lookAtPt(w, doorS, 420);
  const lookKk = (w: Pt) => lookAtPt(w, { x: Kk.x, y: Kk.y - 200 * Kk.scale }, 300);
  const lookD = (w: Pt) => lookAtPt(w, { x: D.x, y: D.y - 250 * D.scale }, 300);
  const lookB = (w: Pt) => lookAtPt(w, { x: B.x, y: B.y - 250 * B.scale }, 300);
  const focus = (w: Pt) => (trick || buzz ? lookKk(w) : dHero || honk ? lookD(w) : dance ? lookB(w) : lookDoor(w));
  const tailUp = notesOn ? 1 : 0;
  const tip = melodyTailTip(M.x, M.y, M.scale, tailUp, g, 2.5);
  // notes flying from Melody's tail to the symbols
  const flying: React.ReactNode[] = [];
  const fly = (start: number, n: number, key: string) => {
    const k = ip(g, [start, start + 9], [0, 1], EASE);
    if (g < start || g > start + 12) return;
    const to = symS[SEQ[n]];
    flying.push(<GlowNote key={key} x={lerp(tip.x, to.x, k)} y={lerp(tip.y, to.y, k) - hopArc(k, 120)} scale={0.9 * M.scale * 1.6} color={SYM_COLORS[SEQ[n]]} glow={1} rot={k * 360} opacity={1 - Math.max(0, k - 0.9) * 10} />);
  };
  for (let n = 0; n < 3; n++) fly(K.TAIL + 6 + n * 14, n, `t${n}`);
  for (let n = 0; n < 5; n++) fly(K.NOTES5 + n * 11, n, `n${n}`);
  const dMouth = mouthAt("draco", g);
  const bMouth = mouthAt("bobo", g);
  const mouthPt = { x: D.x - 10 * D.scale, y: D.y - 175 * D.scale };
  const hk = ip(g, [K.HONK, K.HONK + 26], [0, 1]);
  return (
    <CastleShot cam={cam} g={g} alive={alive} door={{ lit: door.lit, open: door.open, wrong: door.wrong }} shake={buzz ? 0.35 : 0}>
      {symS.map((s, i) => (
        <SymbolGlyph key={i} x={s.x} y={s.y} scale={symScale * 1.55} i={i} on={door.lit[i]} wrong={door.wrong} />
      ))}
      {within(g, K.OPEN, CUTS[4] + XF) && <SparkBurst f={g} at={K.OPEN} x={doorS.x} y={doorS.y} reach={520} count={26} size={18} life={40} rainbow />}
      <Draco
        x={D.x}
        y={D.y}
        scale={D.scale}
        g={g}
        mood={honk ? (hk < 0.4 ? "surprised" : "neutral") : dHero ? (dMouth > 0.06 ? "excited" : "effort") : buzz ? "surprised" : together ? "joy" : "happy"}
        mouth={dMouth}
        look={honk ? { x: 0, y: 0.4 } : dHero ? { x: 0.2, y: -0.8 } : focus(D)}
        blink={honk && hk > 0.4 ? 0.45 : blinkAt(g, 5)}
        wing={dHero ? 1 : 0.45}
        armsUp={dHero ? 0.9 : together ? 0.6 : 0.2}
        breath={ip(g, [K.HONK - 12, K.HONK - 2, K.HONK + 2], [0, 1, 0])}
        headTilt={talk("draco", g)}
        glow={0.45}
      />
      {honk && <DracoBlush x={D.x} y={D.y} scale={D.scale} amount={ip(g, [K.HONK + 8, K.HONK + 16], [0, 0.85])} />}
      {honk && <GlowNote x={mouthPt.x + 40 * D.scale + hk * 160 * D.scale} y={mouthPt.y - hk * 260 * D.scale} scale={D.scale * 1.0} color="#a87a5a" glow={0.2} rot={-20 + Math.sin(g) * 20} crooked={1} opacity={1 - hk} />}
      <Lumi
        x={L.x}
        y={L.y}
        scale={L.scale}
        look={focus(L)}
        expr={mouthAt("lumi", g) > 0.06 ? "excited" : buzz ? "surprised" : together ? "excited" : "happy"}
        mouth={mouthAt("lumi", g)}
        armR={within(g, K.L15, K.TAIL) || together ? -150 : -22}
        armL={together ? 120 : 22}
        headTilt={talk("lumi", g)}
        blink={blinkAt(g, 1)}
      />
      <Worn L={L} g={g} glow={0.6} />
      <BoboRider
        g={g}
        x={B.x}
        y={B.y - (dance ? Math.abs(Math.sin(g / 3.4 + 0.7)) * 26 * B.scale : 0)}
        scale={B.scale}
        look={dance ? { x: Math.sin(g / 5), y: 0.2 } : focus(B)}
        expr={dance ? (bMouth > 0.06 ? "excited" : "happy") : buzz ? "surprised" : together ? "excited" : "happy"}
        mouth={bMouth}
        armL={dance ? 90 + Math.sin(g / 2.6) * 70 : 20}
        armR={dance ? -90 + Math.sin(g / 3.1 + 2) * 70 : -20}
        lean={dance ? Math.sin(g / 4.1) * 10 : 0}
        squash={dance ? 1 + Math.sin(g / 1.7) * 0.05 : 1}
        walk={dance ? g * 0.45 : null}
        headTilt={talk("bobo", g) + (dance ? Math.sin(g / 3) * 8 : 0)}
        blink={blinkAt(g, 3)}
        riderArmsUp={dance}
      />
      <Melody
        x={M.x}
        y={M.y}
        scale={M.scale}
        g={g}
        mood={melMood(g, notesOn ? "determined" : buzz ? "surprised" : mTalk > 0.06 ? "happy" : together ? "joy" : "happy")}
        mouth={mTalk}
        look={notesOn ? { x: 0, y: -0.8 } : focus(M)}
        blink={blinkAt(g, 23)}
        armL={notesOn ? 140 : 30}
        armR={notesOn ? -40 : -30}
        tailSwish={notesOn ? 2.5 : 1}
        tailUp={tailUp}
        tailGlow={notesOn ? 1 : 0}
        hop={together && g >= K.OPEN ? Math.abs(Math.sin(g / 5)) * 30 : 0}
      />
      {flying}
      <Kiko
        x={Kk.x}
        y={Kk.y}
        scale={Kk.scale}
        g={g}
        mood={trick ? "joy" : buzz ? "surprised" : within(g, K.BUZZ + 20, K.L16) ? "worried" : together ? "joy" : "happy"}
        mouth={mouthAt("kiko", g)}
        look={trick ? { x: 0, y: -0.7 } : focus(Kk)}
        blink={blinkAt(g, 11)}
        armL={kikoUp ? 150 : 20}
        armR={kikoUp ? -150 : within(g, K.BUZZ + 20, K.L16) ? -100 : -20}
        legs={kikoUp ? 0.6 : 0}
        headTilt={talk("kiko", g)}
        tailSwish={1.5}
      />
      {within(g, K.BUZZ + 16, K.L16 + 10) && <IconBubble x={Kk.x + 160 * Kk.scale} y={Kk.y - 540 * Kk.scale} scale={Kk.scale * 0.65} kind="x" on={ip(g, [K.BUZZ + 16, K.BUZZ + 22], [0, 1])} g={g} />}
      {within(g, K.L15, K.TAIL) && <IconBubble x={L.x - 170 * L.scale} y={L.y - 560 * L.scale} scale={0.5} kind="music" on={ip(g, [K.L15 + 10, K.L15 + 16], [0, 1])} g={g} tail={1} />}
    </CastleShot>
  );
};

// ======================================================================================
// Scene 4: the Hall of Instruments
// ======================================================================================
const H_LUMI: V3 = [-1.0, 0.02, -1.0];
const H_MEL: V3 = [0.2, 0.02, -1.7];
const H_BOBO: V3 = [-2.0, 0.02, -2.4];
const H_DRACO: V3 = [1.3, 0.02, -1.4];
const H_KIKO: V3 = [2.4, 0.02, -2.0];
const DRUM_TOP_H = 1.21; // the giant drum's skin, in world units

const kickAt = (g: number) => {
  const kick = [0, 0, 0, 0, 0, 0, 0, 0];
  [0, 1, 2, 3].forEach((i, n) => (kick[i] = pulse(g, K.TAPS + n * 6, 12)));
  if (within(g, K.TAPS + 28, K.L20)) for (let i = 0; i < 8; i++) kick[i] = Math.max(kick[i], Math.abs(Math.sin((g - K.TAPS) / 2.2 + i * 1.3)) * ip(g, [K.TAPS + 28, K.TAPS + 32, K.L20 - 8, K.L20], [0, 1, 1, 0]));
  if (within(g, K.CONDUCT, K.BACK)) for (let i = 0; i < 8; i++) kick[i] = Math.max(kick[i], pulse(g, K.CONDUCT + ((i * 5) % 30), 10));
  if (g >= K.BOOM) for (let i = 0; i < 8; i++) kick[i] = Math.max(kick[i], ip(g, [K.BOOM, K.BOOM + 3, K.BOOM + 30], [0, 1, 0]));
  return kick;
};

const Scene4: React.FC = () => {
  const f = useCurrentFrame();
  const g = f + CUTS[4];
  const t = g / 30;
  const cam = camAt(g, [
    [CUTS[4], { pos: [0, 3.2, 6.8], target: [0, 4.0, -12], fov: 62 }],
    [K.L19, { pos: [0, 2.3, 4.6], target: [0, 3.0, -10], fov: 60 }],
    [K.TAPS - 4, { pos: [0, 2.2, 4.3], target: [0, 3.0, -10], fov: 60 }],
    [K.TAPS - 3, { pos: [0, 2.4, 5.2], target: [0, 3.2, -8], fov: 66 }],
    [K.L20 - 4, { pos: [0, 2.4, 5.0], target: [0, 3.2, -8], fov: 66 }],
    [K.L20 - 3, { pos: [1.3, 0.85, 2.6], target: [1.2, 2.2, -6], fov: 54 }],
    [K.TOOT - 4, { pos: [1.3, 0.9, 2.3], target: [1.2, 2.2, -6], fov: 54 }],
    [K.TOOT - 3, { pos: [1.6, 1.3, 1.7], target: [1.5, 1.1, -1.4], fov: 46 }],
    [K.BACK - 2, { pos: [1.6, 1.3, 1.6], target: [1.5, 1.1, -1.4], fov: 46 }],
    [K.BACK - 1, { pos: [-2.0, 1.6, 2.4], target: [-2.9, 1.3, -4.4], fov: 50 }],
    [K.BOOM - 1, { pos: [-2.0, 1.6, 2.2], target: [-2.9, 1.3, -4.4], fov: 50 }],
    [K.BOOM, { pos: [-0.4, 2.3, 4.2], target: [-1.2, 2.2, -6], fov: 62 }],
    [K.L21 - 3, { pos: [-0.4, 2.2, 4.0], target: [-1.2, 2.2, -6], fov: 62 }],
    [K.L21 - 2, { pos: [-3.1, 2.0, -1.2], target: [-3.5, 1.5, -5.4], fov: 44 }],
    [K.L22 - 4, { pos: [-3.1, 2.0, -1.4], target: [-3.5, 1.5, -5.4], fov: 44 }],
    [K.L22 - 3, { pos: [0.5, 0.8, 2.6], target: [0.1, 1.6, -15], fov: 30 }],
    [K.L22 + 40, { pos: [0.5, 0.8, 2.4], target: [0.1, 1.6, -15], fov: 30 }],
    [K.L22 + 64, { pos: [0, 2.3, -10.0], target: [0, 1.9, -15], fov: 40 }],
    [CUTS[5] + XF, { pos: [0, 2.2, -10.6], target: [0, 1.9, -15], fov: 40 }],
  ]);
  const enterK = ip(g, [CUTS[4], CUTS[4] + 50], [0, 1], EASE);
  const enter = (p: V3, d: number): V3 => lerp3([p[0] * 0.6, 0.02, 5.5 + d], p, enterK);
  const walking = g < CUTS[4] + 50;
  const kick = kickAt(g);
  const chaos = ip(g, [K.CONDUCT, K.CONDUCT + 10, K.BACK, K.BACK + 10], [0, 1, 1, 0]);
  const L = place(cam, enter(H_LUMI, 0), LUMI_S);
  const M = place(cam, enter(H_MEL, 0.6), MEL_S);
  const D = place(cam, enter(H_DRACO, 0.3), DRACO_S);
  // Bobo backs into the drum and sits on it
  const backK = ip(g, [K.BACK, K.SIT], [0, 1], Easing.inOut(Easing.sin));
  const sitK = ip(g, [K.SIT, K.SIT + 8], [0, 1], Easing.in(Easing.quad));
  const onDrum: V3 = [DRUM_AT[0] + 0.1, DRUM_TOP_H - 0.3, DRUM_AT[2] + 0.15];
  const preDrum: V3 = [DRUM_AT[0] + 0.3, 0.02, DRUM_AT[2] + 1.0];
  let bP: V3 = enter(H_BOBO, 0.9);
  if (g >= K.BACK) bP = lerp3(H_BOBO, preDrum, backK);
  if (g >= K.SIT) bP = up(lerp3(preDrum, onDrum, sitK), hopArc(sitK, 0.5));
  const boomUp = ip(g, [K.BOOM, K.BOOM + 8, K.BOOM + 20], [0, 1, 0], EASE);
  if (g >= K.BOOM) bP = up(onDrum, boomUp * 0.35 + hopArc(ip(g, [K.BOOM + 20, K.BOOM + 30], [0, 1]), 0.12));
  const B = place(cam, bP, BOBO_S);
  const sitting = g >= K.SIT + 6;
  // Kiko taps the instruments one by one, then everything at once
  let kP: V3 = enter(H_KIKO, 0.4);
  if (g >= K.TAPS - 6 && g < K.TAPS + 40) {
    const n = Math.max(0, Math.min(3, Math.floor((g - K.TAPS) / 6)));
    const at = (i: number) => { const p = instAt(i, t); return [p[0], p[1] - 0.95, p[2] + 0.4] as V3; };
    if (g < K.TAPS) kP = up(lerp3(H_KIKO, at(0), ip(g, [K.TAPS - 6, K.TAPS], [0, 1], EASE)), hopArc(ip(g, [K.TAPS - 6, K.TAPS], [0, 1]), 1));
    else if (g < K.TAPS + 24) kP = up(lerp3(at(n), at(Math.min(3, n + 1)), n < 3 ? EASE(((g - K.TAPS) % 6) / 6) : 0), hopArc(((g - K.TAPS) % 6) / 6, 0.3));
    else kP = up(lerp3(at(3), H_KIKO, ip(g, [K.TAPS + 24, K.TAPS + 40], [0, 1], EASE)), hopArc(ip(g, [K.TAPS + 24, K.TAPS + 40], [0, 1]), 0.6));
  }
  const Kk0 = place(cam, kP, KIKO_S);
  // everyone leaps at the BOOM
  const leap = (p: Pt, s: number, w: number) => ({ ...p, y: p.y - boomUp * w * s });
  const Ll = leap(L, L.scale, 380);
  const Mm = leap(M, M.scale, 520);
  const Dd = leap(D, D.scale, 420);
  const Kk = leap(Kk0, Kk0.scale, 480);
  const drumS = place(cam, DRUM_AT, 1);
  const trumpetFace: V3 = [H_DRACO[0] + 1.0, 1.55, H_DRACO[2] - 1.6];
  const tootK = ip(g, [K.TOOT - 12, K.TOOT - 2], [0, 1], EASE);
  const moved: Record<number, V3> = within(g, K.TOOT - 12, K.BACK + 4) ? { 1: lerp3(instAt(1, t), trumpetFace, tootK) } : {};
  const tootAge = ip(g, [K.TOOT, K.TOOT + 14], [0, 1]);
  const tooted = within(g, K.TOOT, K.BOOM);
  const taps = within(g, K.TAPS - 6, K.L20);
  const conduct = within(g, K.L20, K.TOOT);
  const boom = within(g, K.BOOM, K.L21 + 10);
  const pause = within(g, K.SIT + 8, K.BOOM);
  const mTalk = mouthAt("melody", g);
  const dMouth = mouthAt("draco", g);
  const bMouth = mouthAt("bobo", g);
  const boxS = screen(cam, [0, 2.3, -15]);
  const lookBox = (w: Pt) => lookAtPt(w, boxS, 400);
  const lookKk = (w: Pt) => lookAtPt(w, { x: Kk.x, y: Kk.y - 200 * Kk.scale }, 300);
  const lookD = (w: Pt) => lookAtPt(w, { x: D.x, y: D.y - 250 * D.scale }, 300);
  const lookB = (w: Pt) => lookAtPt(w, { x: B.x, y: B.y - 250 * B.scale }, 300);
  const upLook = { x: 0, y: -0.9 };
  const focus = (w: Pt) => (g >= K.L22 ? lookBox(w) : g >= K.SIT ? lookB(w) : conduct || tooted ? lookD(w) : taps ? lookKk(w) : upLook);
  const batonA = conduct || within(g, K.CONDUCT, K.TOOT) ? Math.sin(g / 2.2) * 60 : -20;
  const handD = { x: D.x + 90 * D.scale, y: Dd.y - 190 * D.scale };
  return (
    <HallShot cam={cam} g={g} hall={{ kick, chaos, box: { lid: 0, play: 0, glow: 0, slots: [0, 0, 0] }, moved }} shake={boom ? ip(g, [K.BOOM, K.BOOM + 4, K.BOOM + 24], [0, 1, 0]) : 0}>
      <GiantDrum x={drumS.x} y={drumS.y} scale={drumS.scale} g={g} layer="back" hit={ip(g, [K.BOOM, K.BOOM + 2, K.BOOM + 40], [0, 1, 0])} />
      <BoboRider
        g={g}
        x={B.x}
        y={B.y}
        scale={B.scale}
        look={pause ? { x: -0.4, y: 0.6 } : boom ? { x: 0, y: -0.2 } : g < K.SIT && g >= K.BACK ? lookD(B) : focus(B)}
        expr={boom ? (bMouth > 0.06 ? "excited" : g < K.BOOM + 20 ? "surprised" : "happy") : pause ? "neutral" : g >= K.BACK ? "surprised" : bMouth > 0.06 ? "happy" : "excited"}
        mouth={bMouth}
        armL={boom && g < K.BOOM + 20 ? 160 : g >= K.L21 ? 120 : g >= K.BACK ? 50 : 20}
        armR={boom && g < K.BOOM + 20 ? -160 : g >= K.BACK && g < K.SIT ? -50 : -20}
        walk={within(g, K.BACK, K.SIT) ? -g * 0.3 : walking ? g * 0.3 : null}
        squash={sitting && !boom ? 0.88 : 1}
        lean={within(g, K.BACK, K.SIT + 8) ? -6 : 0}
        headTilt={talk("bobo", g)}
        blink={pause ? 0.5 : blinkAt(g, 3)}
        riderArmsUp={boom && g < K.BOOM + 20}
      />
      <GiantDrum x={drumS.x} y={drumS.y} scale={drumS.scale} g={g} layer="front" hit={ip(g, [K.BOOM, K.BOOM + 2, K.BOOM + 40], [0, 1, 0])} />
      <BoomRings x={drumS.x} y={drumS.y - 400 * drumS.scale} scale={drumS.scale} age={ip(g, [K.BOOM, K.BOOM + 30], [0, 1])} />
      <BoboBigEyes x={B.x} y={B.y} scale={B.scale} g={g} amount={within(g, K.BACK, K.SIT) || within(g, K.BOOM, K.BOOM + 20) ? 0.9 : 0} />
      {within(g, K.BACK, K.SIT) && <SweatDrop x={B.x + 110 * B.scale} y={B.y - 380 * B.scale} scale={B.scale} g={g} />}
      <Lumi
        x={Ll.x}
        y={Ll.y}
        scale={Ll.scale}
        look={focus(L)}
        expr={mouthAt("lumi", g) > 0.06 ? "happy" : boom ? (g < K.BOOM + 20 ? "surprised" : "happy") : g >= K.L22 ? "surprised" : taps || conduct ? "surprised" : "excited"}
        mouth={mouthAt("lumi", g)}
        armL={boom && g < K.BOOM + 20 ? 160 : taps ? 120 : 22}
        armR={boom && g < K.BOOM + 20 ? -160 : taps ? -120 : -22}
        walk={walking ? g * 0.3 : null}
        headTilt={talk("lumi", g)}
        blink={blinkAt(g, 1)}
      />
      <Worn L={Ll} g={g} />
      <Melody
        x={Mm.x}
        y={Mm.y}
        scale={Mm.scale}
        g={g}
        mood={g >= K.L22 ? (mTalk > 0.06 ? "nervous" : "sad") : boom && g < K.BOOM + 20 ? "surprised" : conduct || taps ? "surprised" : mTalk > 0.06 ? "happy" : "joy"}
        mouth={mTalk}
        look={g >= K.L22 ? lookAtPt(M, boxS, 200) : focus(M)}
        blink={blinkAt(g, 23)}
        armL={g >= K.L22 ? 30 : within(g, K.L19, K.L19_END) ? 150 : boom && g < K.BOOM + 20 ? 160 : 30}
        armR={g >= K.L22 ? -110 : within(g, K.L19, K.L19_END) ? -150 : boom && g < K.BOOM + 20 ? -160 : -30}
        hop={within(g, K.L19, K.L19_END) ? Math.abs(Math.sin(g / 5)) * 26 : 0}
        earL={g >= K.L22 ? 14 : 0}
        earR={g >= K.L22 ? 14 : 0}
        tailSwish={1.2}
      />
      <Draco
        x={Dd.x}
        y={Dd.y}
        scale={D.scale}
        g={g}
        mood={tooted ? (g < K.TOOT + 10 ? "surprised" : "neutral") : conduct ? (dMouth > 0.06 ? "excited" : "joy") : boom && g < K.BOOM + 20 ? "surprised" : "happy"}
        mouth={dMouth}
        look={tooted ? { x: 0.6, y: 0 } : conduct ? { x: Math.sin(g / 6) * 0.5, y: -0.7 } : focus(D)}
        blink={tooted && g > K.TOOT + 10 ? 0.4 : blinkAt(g, 5)}
        wing={conduct ? 0.9 : boom ? 1 : 0.4}
        flap={boom && g < K.BOOM + 20 ? Math.sin(g * 0.8) * 24 : 0}
        armsUp={conduct ? 0.6 + Math.sin(g / 2.2) * 0.3 : boom && g < K.BOOM + 20 ? 0.9 : 0.2}
        lean={tooted ? -8 : conduct ? Math.sin(g / 3) * 5 : 0}
        step={walking ? g * 0.3 : null}
        headTilt={talk("draco", g) + (conduct ? Math.sin(g / 2.2) * 6 : 0)}
        glow={0.45}
      />
      {(conduct || within(g, K.CONDUCT, K.BACK)) && <Baton x={handD.x} y={handD.y} scale={D.scale} angle={batonA} sparkle={1} g={g} />}
      {tooted && <DracoBlush x={Dd.x} y={Dd.y} scale={D.scale} amount={ip(g, [K.TOOT + 8, K.TOOT + 16], [0, 0.8])} />}
      {tooted && <SmokePuff x={Dd.x} y={Dd.y - 300 * D.scale} scale={D.scale * 1.4} age={ip(g, [K.TOOT, K.TOOT + 30], [0, 1])} />}
      <TootBlast x={screen(cam, trumpetFace).x - 20} y={screen(cam, trumpetFace).y} scale={D.scale * 1.1} dir={-1} age={tootAge} />
      <Kiko
        x={Kk.x}
        y={Kk.y}
        scale={Kk.scale}
        g={g}
        mood={taps ? (g < K.TAPS + 26 ? "joy" : "worried") : boom && g < K.BOOM + 20 ? "surprised" : boom ? "joy" : "happy"}
        mouth={mouthAt("kiko", g)}
        look={taps && g < K.TAPS + 26 ? { x: 0, y: -0.8 } : focus(Kk)}
        blink={blinkAt(g, 11)}
        armL={(taps && g < K.TAPS + 26) || (boom && g < K.BOOM + 20) ? 160 : 20}
        armR={(taps && g < K.TAPS + 26) || (boom && g < K.BOOM + 20) ? -160 : -20}
        legs={taps && g < K.TAPS + 40 ? 0.6 : boom && g < K.BOOM + 20 ? 0.7 : 0}
        lean={within(g, K.BOOM + 20, K.L21 + 40) ? Math.sin(g * 1.3) * 6 : 0}
        headTilt={talk("kiko", g)}
        tailSwish={1.4}
      />
      {within(g, K.TAPS + 26, K.L20) && <IconBubble x={Kk.x + 160 * Kk.scale} y={Kk.y - 540 * Kk.scale} scale={Kk.scale * 0.6} kind="bang" on={ip(g, [K.TAPS + 26, K.TAPS + 30], [0, 1])} g={g} />}
      {[0, 1, 2, 3].map((i) => {
        const p = screen(cam, instAt(i, t));
        return within(g, K.TAPS + i * 6, K.TAPS + i * 6 + 14) ? <RisingNotes key={i} x={p.x} y={p.y} scale={0.6} g={g} from={K.TAPS + i * 6} on={1} count={3} /> : null;
      })}
      {within(g, K.TAPS + 28, K.L20) && <RisingNotes x={540} y={700} scale={1} g={g} from={K.TAPS + 28} on={1} count={8} sour={0.6} spread={3} />}
      {within(g, K.CONDUCT, K.TOOT) && <RisingNotes x={540} y={640} scale={0.9} g={g} from={K.CONDUCT} on={1} count={8} sour={0.8} spread={3} />}
      {pause && <IconBubble x={B.x + 190 * B.scale} y={B.y - 520 * B.scale} scale={B.scale * 0.6} kind="dots" on={ip(g, [K.SIT + 8, K.SIT + 12], [0, 1])} g={g} />}
    </HallShot>
  );
};

// ======================================================================================
// Scene 5: finding the three lost notes and singing the last one
// ======================================================================================
const B_LUMI: V3 = [2.0, 0.02, -7.5];
const B_MEL: V3 = [4.55, 0.02, -7.6];
const K_DRUM: V3 = [-1.9, 0.02, -4.4];
const R_DRACO: V3 = [-3.0, 0.02, -9.5];
const R_KIKO: V3 = [-1.9, 0.02, -8.6];
// gathered at the dais
const G_LUMI: V3 = [-1.35, 0.02, -11.2];
const G_MEL: V3 = [0.05, 0.02, -11.7];
const G_BOBO: V3 = [1.35, 0.02, -11.1];
const G_DRACO: V3 = [-2.6, 0.02, -10.8];
const G_KIKO: V3 = [2.6, 0.02, -10.9];
const slotAt = (i: number): V3 => [(i - 1) * 0.44, 1.55 + (0.16 + 0.425) * 1.1, BOX_AT[2] + 0.55 * 1.1 + 0.04];
const NOTE_COLS = [NOTE_GOLD, NOTE_PINK, NOTE_BLUE];

const Scene5: React.FC = () => {
  const f = useCurrentFrame();
  const g = f + CUTS[5];
  const t = g / 30;
  const bellsShot = g < K.BOUNCE - 4;
  const drumShot = within(g, K.BOUNCE - 4, K.PREP - 4);
  const bellShot = within(g, K.PREP - 4, K.PLACE - 4);
  const daisShot = g >= K.PLACE - 4;
  const cam = camAt(g, [
    [CUTS[5], { pos: [3.25, 1.7, -2.4], target: [3.3, 1.05, -9], fov: 54 }],
    [K.BOUNCE - 5, { pos: [3.25, 1.65, -2.9], target: [3.3, 1.05, -9], fov: 54 }],
    [K.BOUNCE - 4, { pos: [0.6, 2.2, -1.6], target: [-3.3, 2.4, -5.3], fov: 58 }],
    [K.NOTE2, { pos: [0.6, 3.2, -1.8], target: [-3.3, 3.4, -5.3], fov: 58 }],
    [K.PREP - 5, { pos: [0.6, 2.5, -1.7], target: [-3.3, 2.3, -5.3], fov: 58 }],
    [K.PREP - 4, { pos: [-2.2, 1.7, -5.2], target: [-3.6, 1.8, -11.2], fov: 48 }],
    [K.L26 - 4, { pos: [-2.2, 1.65, -5.4], target: [-3.6, 1.8, -11.2], fov: 48 }],
    [K.L26 - 3, { pos: [-2.3, 1.3, -5.2], target: [-2.5, 1.1, -9.2], fov: 46 }],
    [K.PLACE - 5, { pos: [-2.3, 1.3, -5.4], target: [-2.5, 1.1, -9.2], fov: 46 }],
    [K.PLACE - 4, { pos: [0, 1.7, -6.0], target: [0, 1.6, -15], fov: 50 }],
    [K.L28 - 4, { pos: [0, 1.7, -6.3], target: [0, 1.6, -15], fov: 50 }],
    [K.L28 - 3, { pos: [0.05, 0.95, -9.4], target: [0.05, 0.78, -11.7], fov: 40 }],
    [K.L29 - 4, { pos: [0.05, 0.95, -9.5], target: [0.05, 0.78, -11.7], fov: 40 }],
    [K.L29 - 3, { pos: [-0.6, 1.3, -7.0], target: [-0.6, 0.95, -11.4], fov: 46 }],
    [K.BREATH - 4, { pos: [-0.6, 1.3, -7.2], target: [-0.6, 0.95, -11.4], fov: 46 }],
    [K.BREATH - 3, { pos: [0.05, 0.9, -9.6], target: [0.05, 0.8, -11.7], fov: 40 }],
    [K.SING3 + 10, { pos: [0.05, 0.95, -9.3], target: [0.05, 0.85, -11.7], fov: 40 }],
    [K.RESTORE - 4, { pos: [0, 1.6, -7.2], target: [0, 1.7, -15], fov: 52 }],
    [CUTS[6] + XF, { pos: [0, 2.0, -6.6], target: [0, 2.2, -15], fov: 56 }],
  ]);
  const alive = hallAlive(g);
  const slots = [0, 1, 2].map((i) => ip(g, [K.PLACE + i * 9 + 9, K.PLACE + i * 9 + 12], [0, 1]) * (0.5 + 0.5 * ip(g, [K.COMBINE, K.RESTORE], [0, 1])));
  const bells = [0, 1, 2, 3, 4].map((i) => pulse(g, K.BELLS + i * 7, 14) + (i === 4 ? ip(g, [K.NOTE1 - 6, K.NOTE1, K.NOTE1 + 14], [0, 1, 0]) : 0));
  const frozen = ip(g, [K.PUFF, K.PUFF + 18], [1, 0]);
  const frozenRing = ip(g, [K.PUFF + 16, K.PUFF + 20, K.NOTE3 + 20], [0, 1, 0.2]);
  const lid = ip(g, [K.RESTORE - 4, K.RESTORE + 24], [0, 1], EASE);
  const play = ip(g, [K.RESTORE, K.RESTORE + 10], [0, 1]);
  const boxGlow = ip(g, [K.COMBINE, K.RESTORE, K.RESTORE + 20], [0, 0.6, 1]);
  const mTalk = mouthAt("melody", g);
  const dMouth = mouthAt("draco", g);
  const kMouth = mouthAt("kiko", g);
  // positions per shot
  let L = place(cam, B_LUMI, LUMI_S);
  let M = place(cam, B_MEL, MEL_S);
  let D = place(cam, R_DRACO, DRACO_S);
  let B = place(cam, G_BOBO, BOBO_S);
  // Kiko: bounces off the drum up to the floating note
  let kP: V3 = R_KIKO;
  if (drumShot) {
    const run = ip(g, [K.BOUNCE - 4, K.BOUNCE], [0, 1], EASE);
    const upK = ip(g, [K.BOUNCE, K.NOTE2], [0, 1], Easing.out(Easing.quad));
    const downK = ip(g, [K.NOTE2 + 2, K.NOTE2 + 18], [0, 1], Easing.in(Easing.quad));
    const top: V3 = [DRUM_AT[0], DRUM_TOP_H - 0.25, DRUM_AT[2] + 0.1];
    const high: V3 = [HIGH_NOTE[0], HIGH_NOTE[1] - 0.75, HIGH_NOTE[2] + 0.3];
    if (g < K.BOUNCE) kP = up(lerp3(K_DRUM, top, run), hopArc(run, 0.7));
    else if (g < K.NOTE2 + 2) kP = lerp3(top, high, upK);
    else if (g < K.NOTE2 + 18) kP = lerp3(high, top, downK);
    else kP = up(lerp3(top, K_DRUM, ip(g, [K.NOTE2 + 18, K.NOTE2 + 30], [0, 1], EASE)), hopArc(ip(g, [K.NOTE2 + 18, K.NOTE2 + 30], [0, 1]), 0.5));
  }
  let Kk = place(cam, kP, KIKO_S);
  if (daisShot) {
    L = place(cam, G_LUMI, LUMI_S);
    M = place(cam, G_MEL, MEL_S);
    D = place(cam, G_DRACO, DRACO_S);
    B = place(cam, G_BOBO, BOBO_S);
    Kk = place(cam, G_KIKO, KIKO_S);
  }
  const drumS = place(cam, DRUM_AT, 1);
  const bellTop = screen(cam, [bellAt(4)[0], bellAt(4)[1] + 1.0, bellAt(4)[2]]);
  const frozenS = screen(cam, [FROZEN_AT[0], 2.2, FROZEN_AT[2]]);
  const highS = screen(cam, HIGH_NOTE);
  const hand = lumiHand(L.x, L.y, L.scale, -120);
  const kHand = kikoHand(Kk.x, Kk.y, Kk.scale, -150);
  const dm = { x: D.x + 30 * D.scale, y: D.y - 170 * D.scale };
  const breathe = within(g, K.BREATH, K.SING3);
  const sing = within(g, K.SING3, K.RESTORE + 6);
  const restored = g >= K.RESTORE;
  const doubt = within(g, K.L28, K.L29 + 30);
  const mMood: MelodyMood = melMood(g, restored ? "joy" : breathe ? "determined" : doubt ? (mTalk > 0.06 ? "nervous" : "nervous") : within(g, K.L29 + 30, K.BREATH) ? "happy" : bellsShot && g >= K.NOTE1 ? "joy" : "happy");
  const boxS = screen(cam, [0, 2.2, BOX_AT[2]]);
  const lookBox = (w: Pt) => lookAtPt(w, boxS, 400);
  const lookM = (w: Pt) => lookAtPt(w, { x: M.x, y: M.y - 200 * M.scale }, 300);
  const lookD = (w: Pt) => lookAtPt(w, { x: D.x, y: D.y - 250 * D.scale }, 300);
  const lookKk = (w: Pt) => lookAtPt(w, { x: Kk.x, y: Kk.y - 200 * Kk.scale }, 300);
  // the three notes: where they are now
  const note1 = (() => {
    const k = ip(g, [K.NOTE1, K.NOTE1 + 14], [0, 1], EASE);
    return { x: lerp(bellTop.x, hand.x, k), y: lerp(bellTop.y, hand.y - 30, k) - hopArc(k, 60) };
  })();
  const slotS = [0, 1, 2].map((i) => screen(cam, slotAt(i)));
  const placing = (i: number, from: { x: number; y: number }) => {
    const k = ip(g, [K.PLACE + i * 9, K.PLACE + i * 9 + 12], [0, 1], EASE);
    return { x: lerp(from.x, slotS[i].x, k), y: lerp(from.y, slotS[i].y, k) - hopArc(k, 140), k };
  };
  const notesNode: React.ReactNode[] = [];
  if (bellsShot && g >= K.NOTE1) notesNode.push(<GlowNote key="n1" x={note1.x} y={note1.y} scale={0.9 * L.scale} color={NOTE_GOLD} glow={1} rot={Math.sin(g / 4) * 12} />);
  if (drumShot) {
    const held = g >= K.NOTE2;
    const p = held ? kHand : { x: highS.x, y: highS.y + Math.sin(g / 6) * 10 };
    notesNode.push(<GlowNote key="n2" x={p.x} y={p.y} scale={Kk.scale * 1.9} color={NOTE_PINK} glow={1.2} rot={Math.sin(g / 4) * 12} />);
  }
  if (bellShot && g >= K.NOTE3) {
    const k = ip(g, [K.NOTE3, K.NOTE3 + 14], [0, 1], EASE);
    const to = { x: D.x + 100 * D.scale, y: D.y - 300 * D.scale };
    notesNode.push(<GlowNote key="n3" x={lerp(frozenS.x, to.x, k)} y={lerp(frozenS.y, to.y, k) - hopArc(k, 80)} scale={0.9 * D.scale} color={NOTE_BLUE} glow={1} rot={Math.sin(g / 4) * 12} />);
  }
  if (bellShot && g >= K.L26) {
    // Kiko arrives with the pink note, Lumi's gold one is not in this shot
    notesNode.push(<GlowNote key="n2b" x={kHand.x} y={kHand.y} scale={0.9 * Kk.scale * 1.2} color={NOTE_PINK} glow={0.8} rot={Math.sin(g / 4) * 12} />);
  }
  if (daisShot && g < K.PLACE + 40) {
    const froms = [lumiHand(L.x, L.y, L.scale, -120), kikoHand(Kk.x, Kk.y, Kk.scale, -150), { x: D.x + 100 * D.scale, y: D.y - 300 * D.scale }];
    froms.forEach((fr, i) => {
      const p = placing(i, fr);
      if (p.k < 1) notesNode.push(<GlowNote key={`p${i}`} x={p.x} y={p.y} scale={0.9 * L.scale} color={NOTE_COLS[i]} glow={1} rot={p.k * 360} />);
    });
  }
  const placeHold = daisShot && g < K.PLACE + 30;
  const combineK = ip(g, [K.COMBINE, K.RESTORE], [0, 1], EASE);
  const sweepUp = ip(g, [K.RESTORE, CUTS[6] + XF], [0, 1]);
  return (
    <HallShot
      cam={cam}
      g={g}
      alive={alive}
      hall={{ kick: g >= K.RESTORE ? [0, 1, 2, 3, 4, 5, 6, 7].map((i) => Math.abs(Math.sin(g / 5 + i)) * 0.4 * sweepUp) : [], bells, frozen, frozenRing, box: { lid, play, glow: boxGlow, slots } }}
      world={
        <>
          {restored && <SparkleBurst3D position={[0, 2.6, BOX_AT[2]]} age={ip(g, [K.RESTORE, K.RESTORE + 50], [0, 1])} reach={10} count={180} seed={147} size={20} colors={[NOTE_GOLD, NOTE_PINK, NOTE_BLUE, "#ffffff", "#b890ff"]} />}
          {restored && <LightRing position={[0, 2.4, BOX_AT[2]]} age={ip(g, [K.RESTORE, K.RESTORE + 30], [0, 1])} radius={12} flat={false} color="#fff0d8" />}
        </>
      }
      over={restored ? <AbsoluteFill style={{ background: "radial-gradient(circle at 50% 45%, rgba(255,255,255,0.9), rgba(255,240,250,0) 70%)", opacity: ip(g, [K.RESTORE, K.RESTORE + 3, K.RESTORE + 24], [0, 0.85, 0]) }} /> : undefined}
    >
      {drumShot && <GiantDrum x={drumS.x} y={drumS.y} scale={drumS.scale} g={g} layer="back" hit={ip(g, [K.BOUNCE, K.BOUNCE + 2, K.BOUNCE + 24], [0, 0.6, 0])} />}
      {drumShot && <GiantDrum x={drumS.x} y={drumS.y} scale={drumS.scale} g={g} layer="front" hit={ip(g, [K.BOUNCE, K.BOUNCE + 2, K.BOUNCE + 24], [0, 0.6, 0])} />}
      {(bellsShot || daisShot) && (
        <Lumi
          x={L.x}
          y={L.y}
          scale={L.scale}
          look={bellsShot ? (g >= K.NOTE1 ? lookAtPt(L, note1, 300) : lookAtPt(L, bellTop, 300)) : doubt || breathe || sing ? lookM(L) : lookBox(L)}
          expr={mouthAt("lumi", g) > 0.06 ? "happy" : restored ? "excited" : bellsShot && g >= K.NOTE1 ? "excited" : sing ? "happy" : "happy"}
          mouth={mouthAt("lumi", g)}
          armR={bellsShot ? (g >= K.BELLS ? -120 : -90) : placeHold ? -120 : restored ? -150 : within(g, K.L29, K.L29_END) ? -60 : -22}
          armL={restored ? 150 : within(g, K.L29, K.L29_END) ? 60 : 22}
          headTilt={talk("lumi", g) + (within(g, K.L29, K.L29_END) ? 6 : 0)}
          blink={blinkAt(g, 1)}
        />
      )}
      {(bellsShot || daisShot) && <Worn L={L} g={g} glow={restored ? 1 : 0.5} />}
      {(bellShot || daisShot) && (
        <Draco
          x={D.x}
          y={D.y}
          scale={D.scale}
          g={g}
          mood={within(g, K.L27, K.PLACE) ? "neutral" : within(g, K.L26, K.L27) ? (dMouth > 0.06 ? "excited" : "joy") : within(g, K.PREP, K.PUFF + 14) ? "effort" : restored ? "joy" : "happy"}
          mouth={dMouth}
          look={within(g, K.PREP, K.NOTE3) ? { x: -0.7, y: -0.6 } : within(g, K.L27, K.PLACE) ? lookKk(D) : daisShot ? (doubt || sing ? lookM(D) : lookBox(D)) : { x: 0.2, y: -0.3 }}
          blink={within(g, K.L27 + 20, K.PLACE) ? 0.45 : blinkAt(g, 5)}
          wing={within(g, K.L26, K.L27) || restored ? 1 : 0.4}
          armsUp={within(g, K.L26, K.L27) ? 0.9 : restored ? 0.9 : 0.2}
          breath={ip(g, [K.PREP, K.PUFF - 2, K.PUFF + 2], [0, 0.6, 0])}
          squash={within(g, K.L27 + 20, K.PLACE) ? 0.95 : 1}
          headTilt={talk("draco", g)}
          glow={0.45}
        />
      )}
      {bellShot && within(g, K.L27 + 20, K.PLACE) && <DracoBlush x={D.x} y={D.y} scale={D.scale} amount={0.8} />}
      {bellShot && <TinyFlame from={dm} to={frozenS} on={ip(g, [K.PUFF, K.PUFF + 3, K.PUFF + 16, K.PUFF + 20], [0, 1, 1, 0])} g={g} scale={D.scale * 2.4} />}
      {bellShot && within(g, K.PREP, K.PUFF) && <SweatDrop x={D.x + 120 * D.scale} y={D.y - 380 * D.scale} scale={D.scale} g={g} />}
      {(drumShot || bellShot || daisShot) && (bellShot ? g >= K.L26 - 6 : true) && (
        <Kiko
          x={bellShot ? place(cam, R_KIKO, KIKO_S).x : Kk.x}
          y={bellShot ? place(cam, R_KIKO, KIKO_S).y : Kk.y}
          scale={bellShot ? place(cam, R_KIKO, KIKO_S).scale : Kk.scale}
          g={g}
          mood={drumShot ? (g < K.NOTE2 + 18 ? "excited" : "joy") : within(g, K.L27, K.PLACE) ? (kMouth > 0.06 ? "excited" : "joy") : restored ? "joy" : "happy"}
          mouth={kMouth}
          look={drumShot ? lookAtPt(Kk, highS, 200) : within(g, K.L26, K.PLACE) ? lookD(Kk) : daisShot ? (doubt || sing ? lookM(Kk) : lookBox(Kk)) : { x: 0, y: 0 }}
          blink={blinkAt(g, 11)}
          armL={drumShot && g < K.NOTE2 + 18 ? 150 : restored ? 150 : 20}
          armR={drumShot && g < K.NOTE2 + 18 ? -150 : placeHold || bellShot ? -150 : restored ? -150 : -20}
          legs={drumShot && g >= K.BOUNCE && g < K.NOTE2 + 18 ? 0.7 : 0}
          lean={within(g, K.L27, K.PLACE) ? Math.sin(g * 1.1) * 6 : 0}
          headTilt={talk("kiko", g)}
          tailSwish={1.5}
        />
      )}
      {(bellsShot || daisShot) && (
        <Melody
          x={M.x}
          y={M.y}
          scale={M.scale}
          g={g}
          mood={mMood}
          mouth={mTalk}
          look={sing ? { x: 0, y: -0.6 } : doubt ? { x: -0.2, y: 0.6 } : bellsShot ? lookAtPt(M, bellTop, 300) : lookBox(M)}
          blink={sing ? 0.35 : blinkAt(g, 23)}
          armL={sing ? 150 : breathe ? 90 : doubt ? 40 : restored ? 160 : 30}
          armR={sing ? -150 : breathe ? -90 : doubt ? -40 : restored ? -160 : -30}
          squash={breathe ? 1 + ip(g, [K.BREATH, K.SING3], [0, 0.1]) : 1}
          hop={restored ? Math.abs(Math.sin(g / 4)) * 40 : 0}
          earL={doubt ? 22 : 0}
          earR={doubt ? 22 : 0}
          tailSwish={sing ? 2 : 1}
          tailUp={sing ? 0.8 : 0}
          tailGlow={sing ? 1 : 0}
          glow={sing ? 0.5 + 0.3 * Math.sin(g / 3) : 0}
          headTilt={talk("melody", g)}
        />
      )}
      {daisShot && (
        <BoboRider
          g={g}
          x={B.x}
          y={B.y}
          scale={B.scale}
          look={doubt || sing ? lookM(B) : lookBox(B)}
          expr={restored ? "excited" : sing ? "happy" : "happy"}
          armL={restored ? 150 : 20}
          armR={restored ? -150 : -20}
          blink={blinkAt(g, 3)}
          riderArmsUp={restored}
          riderHappy={sing}
        />
      )}
      {notesNode}
      {/* her voice: pure, bright notes; the three slot notes rise and join them */}
      {daisShot && <RisingNotes x={M.x} y={M.y - 300 * M.scale} scale={M.scale * 1.5} g={g} from={K.SING3} on={ip(g, [K.SING3, K.SING3 + 8, K.RESTORE, K.RESTORE + 12], [0, 1, 1, 0])} count={7} colors={[NOTE_GOLD, NOTE_PINK, NOTE_BLUE, "#ffffff"]} spread={1.4} />}
      {daisShot &&
        combineK > 0 &&
        combineK < 1 &&
        [0, 1, 2].map((i) => {
          const a = combineK * Math.PI * 2 + (i * Math.PI * 2) / 3;
          const r = (1 - combineK) * 90;
          return <GlowNote key={`c${i}`} x={boxS.x + Math.cos(a) * r} y={boxS.y - 120 - combineK * 60 + Math.sin(a) * r * 0.5} scale={0.9 * L.scale} color={NOTE_COLS[i]} glow={1.2} rot={combineK * 400} />;
        })}
      {restored && <RisingNotes x={boxS.x} y={boxS.y - 60} scale={1.1} g={g} from={K.RESTORE} on={1} count={9} spread={2.4} />}
      {bellsShot && within(g, K.BELLS, K.NOTE1 + 10) && <SparkBurst f={g} at={K.NOTE1 - 2} x={bellTop.x} y={bellTop.y} reach={180} count={12} size={12} life={14} />}
      {bellShot && within(g, K.PUFF + 16, K.NOTE3 + 10) && <SparkBurst f={g} at={K.PUFF + 16} x={frozenS.x} y={frozenS.y} reach={240} count={16} size={14} life={18} />}
      {drumShot && within(g, K.NOTE2, K.NOTE2 + 14) && <SparkBurst f={g} at={K.NOTE2} x={highS.x} y={highS.y} reach={200} count={14} size={14} life={14} rainbow />}
      {daisShot && within(g, K.L29 + 10, K.BREATH) && <IconBubble x={M.x + 170 * M.scale} y={M.y - 620 * M.scale} scale={M.scale * 0.9} kind="hearts" on={ip(g, [K.L29 + 10, K.L29 + 18], [0, 1])} g={g} />}
    </HallShot>
  );
};

// ======================================================================================
// Scene 6: the castle comes alive; the celebration; the next mystery
// ======================================================================================
const P_LUMI: V3 = [-1.1, 0.02, -6.1];
const P_MEL: V3 = [0.1, 0.02, -6.7];
const P_BOBO: V3 = [1.2, 0.02, -5.8];
const P_KIKO: V3 = [-2.1, 0.02, -6.3];
const P_DRACO: V3 = [2.4, 0.02, -6.1];
const GARDEN: V3 = [0, 5.3, -14.6];

const Scene6: React.FC = () => {
  const f = useCurrentFrame();
  const g = f + CUTS[6];
  const t = g / 30;
  const outside = g < K.DANCE2;
  if (outside) {
    const alive = ip(g, [K.ALIVE, K.ALIVE + 55], [0.15, 1], EASE);
    const cam = camAt(g, [
      [CUTS[6], { pos: [10, 6.5, 18], target: [0, 6, -13], fov: 56 }],
      [K.DANCE2, { pos: [-7, 4.2, 16], target: [0, 6.5, -13], fov: 58 }],
    ]);
    const fountainTop = screen(cam, [0, 3.2, -3]);
    return (
      <CastleShot cam={cam} g={g} alive={alive} flow={ip(g, [K.ALIVE + 18, K.ALIVE + 50], [0, 1])} door={{ lit: [1, 1, 1, 1, 1], open: 1 }}>
        <RisingNotes x={fountainTop.x} y={fountainTop.y} scale={0.9} g={g} from={K.ALIVE} on={ip(g, [K.ALIVE + 20, K.ALIVE + 30], [0, 1])} count={8} spread={3} />
        <SparkBurst f={g} at={K.ALIVE + 4} x={540} y={760} reach={560} count={30} size={18} life={40} rainbow />
      </CastleShot>
    );
  }
  const cam = camAt(g, [
    [K.DANCE2, { pos: [0, 1.7, -0.6], target: [0.2, 1.2, -6], fov: 54 }],
    [K.SPIN - 3, { pos: [0.3, 1.7, -0.9], target: [0.4, 1.2, -6], fov: 54 }],
    [K.SPIN - 2, { pos: [2.4, 1.4, -1.2], target: [2.9, 0.85, -5.2], fov: 50 }],
    [K.LAUGH + 10, { pos: [2.4, 1.4, -1.4], target: [2.9, 0.85, -5.2], fov: 50 }],
    [K.LAUGH + 11, { pos: [0.6, 2.0, 2.4], target: [0.6, 1.0, -5.6], fov: 58 }],
    [K.L32 - 3, { pos: [0.6, 1.9, 2.0], target: [0.6, 1.0, -5.6], fov: 58 }],
    [K.L32 - 2, { pos: [1.35, 1.25, -2.9], target: [1.2, 1.0, -5.8], fov: 42 }],
    [K.PROJECT - 3, { pos: [1.35, 1.25, -3.1], target: [1.2, 1.0, -5.8], fov: 42 }],
    [K.PROJECT - 2, { pos: [0, 1.5, -0.6], target: [0, 3.9, -15], fov: 60 }],
    [K.DUR, { pos: [0, 1.6, -0.9], target: [0, 4.0, -15], fov: 60 }],
  ]);
  const party = g < K.L32 - 10;
  const dance = (ph: number, amt = 0.2) => (party ? Math.abs(Math.sin((g + ph) / 5)) * amt : 0);
  const laugh = within(g, K.LAUGH, K.L32) || within(g, K.BTUNE + 10, K.PROJECT + 6);
  const lh = (ph: number) => (laugh ? Math.abs(Math.sin((g + ph) / 4)) * 0.1 : 0);
  // Draco's dramatic spin into the cushions
  const spinK = ip(g, [K.SPIN, K.CUSHION], [0, 1], Easing.inOut(Easing.quad));
  const cushTop: V3 = [CUSHIONS_AT[0], 0.35, CUSHIONS_AT[2]];
  let dP: V3 = up(P_DRACO, dance(3));
  if (g >= K.SPIN) dP = up(lerp3(P_DRACO, cushTop, spinK), hopArc(spinK, 0.5));
  const sunk = within(g, K.CUSHION, K.LAUGH);
  const popUp = ip(g, [K.LAUGH, K.LAUGH + 8], [0, 1], OUT);
  if (g >= K.CUSHION) dP = up(cushTop, sunk ? -0.55 : -0.55 + popUp * 0.55);
  const D = place(cam, dP, DRACO_S);
  const spinning = within(g, K.SPIN, K.CUSHION);
  const L = place(cam, up(P_LUMI, dance(0) + lh(1)), LUMI_S);
  const M = place(cam, up(P_MEL, dance(2, 0.3) + lh(2)), MEL_S);
  const B = place(cam, up(P_BOBO, dance(4, 0.28) + lh(3)), BOBO_S);
  const Kk = place(cam, up(P_KIKO, dance(6, 0.3) + lh(4)), KIKO_S);
  const cushS = place(cam, CUSHIONS_AT, 1);
  // the banana music box pops out of the cushions and lands at Bobo's feet
  const flyK = ip(g, [K.CUSHION + 2, K.CUSHION + 22], [0, 1], Easing.inOut(Easing.quad));
  const boxFrom = screen(cam, [CUSHIONS_AT[0], 0.6, CUSHIONS_AT[2]]);
  const boxLand = screen(cam, [P_BOBO[0] + 0.45, 0.05, P_BOBO[2] + 0.3]);
  const held = g >= K.L32 - 6;
  const handB = { x: B.x + 130 * B.scale, y: B.y - 300 * B.scale };
  const bx = held ? handB : { x: lerp(boxFrom.x, boxLand.x, flyK), y: lerp(boxFrom.y, boxLand.y, flyK) - hopArc(flyK, 260) };
  const boxOn = g >= K.CUSHION + 2;
  const open = ip(g, [K.BTUNE - 6, K.BTUNE + 4], [0, 1], OUT);
  const project = ip(g, [K.PROJECT, K.PROJECT + 24], [0, 1], OUT);
  const Gs = screen(cam, GARDEN);
  const Bs = screen(cam, [0, 2.3, BOX_AT[2]]);
  const lookUp = (w: Pt) => (g >= K.PROJECT ? lookAtPt(w, Gs, 420) : party ? { x: Math.sin(g / 9 + w.x) * 0.5, y: -0.2 } : lookAtPt(w, { x: D.x, y: D.y - 250 * D.scale }, 300));
  const lookBox = (w: Pt) => lookAtPt(w, bx, 300);
  const watchBox = within(g, K.L32 - 10, K.PROJECT);
  const bMouth = mouthAt("bobo", g);
  const kicks = [0, 1, 2, 3, 4, 5, 6, 7].map((i) => Math.abs(Math.sin(g / 5 + i * 0.8)) * 0.5);
  return (
    <HallShot
      cam={cam}
      g={g}
      alive={1}
      hall={{ kick: kicks, frozen: 0, box: { lid: 1, play: 1, glow: 0.8, slots: [1, 1, 1] }, bells: [0.3, 0.3, 0.3, 0.3, 0.3], moved: g >= K.PROJECT - 4 ? { 0: [-6.2, 6.6, -12], 1: [-6.0, 3.8, -8.5], 2: [6.0, 4.2, -9], 4: [6.2, 6.4, -12.5], 7: [-5.8, 5.2, -6] } : {} }}
      world={<GardenHologram position={GARDEN} t={t} on={project} scale={1.7} />}
      over={
        <>
          <EndCard at={K.END - CUTS[6]} top={250} />
          <AbsoluteFill style={{ alignItems: "center", fontFamily }}>
            <div style={{ position: "absolute", top: 410, fontSize: 40, fontWeight: 600, color: "#fff2ff", opacity: ip(f, [K.END - CUTS[6] + 20, K.END - CUTS[6] + 36], [0, 1]), textShadow: "0 0 8px rgba(40, 20, 70, 1), 0 3px 12px rgba(40, 20, 70, 1)" }}>
              Next: The Secret of the Floating Flower Garden 🌸
            </div>
          </AbsoluteFill>
        </>
      }
    >
      {g >= K.PROJECT && <path d={`M ${Bs.x - 20} ${Bs.y} L ${Gs.x - 260 * project} ${Gs.y + 220} L ${Gs.x + 260 * project} ${Gs.y + 220} L ${Bs.x + 20} ${Bs.y} Z`} fill="#f0fff4" opacity={0.15 * project} />}
      <Cushions x={cushS.x} y={cushS.y} scale={cushS.scale * 0.85} g={g} layer="back" squish={ip(g, [K.CUSHION, K.CUSHION + 3, K.CUSHION + 16], [0, 1, 0])} />
      <g transform={spinning ? `rotate(${spinK * 720} ${D.x} ${D.y - 160 * D.scale})` : undefined}>
        <Draco
          x={D.x}
          y={D.y}
          scale={D.scale}
          g={g}
          mood={g >= K.LAUGH ? (laugh ? "joy" : "happy") : spinning ? "excited" : sunk ? "surprised" : "joy"}
          look={g >= K.LAUGH && g < K.LAUGH + 30 ? { x: Math.sin(g / 3), y: -0.3 } : lookUp(D)}
          blink={blinkAt(g, 5)}
          wing={party || spinning ? 1 : 0.6}
          flap={party ? Math.sin(g * 0.8) * 24 : 0}
          armsUp={party || spinning ? 0.9 : 0.3}
          glow={0.5}
        />
      </g>
      <Cushions x={cushS.x} y={cushS.y} scale={cushS.scale * 0.85} g={g} layer="front" squish={ip(g, [K.CUSHION, K.CUSHION + 3, K.CUSHION + 16], [0, 1, 0])} />
      <Fluff x={cushS.x} y={cushS.y - 160 * cushS.scale} scale={cushS.scale} age={ip(g, [K.CUSHION, K.CUSHION + 30], [0, 1])} />
      {g >= K.LAUGH && <HeadCushion x={D.x + 10 * D.scale} y={D.y - 330 * D.scale} scale={D.scale * 0.9} rot={-10 + Math.sin(g / 6) * 4} />}
      <DizzyStars x={D.x} y={D.y - 360 * D.scale} scale={D.scale} on={ip(g, [K.LAUGH, K.LAUGH + 6, K.L32, K.L32 + 8], [0, 1, 1, 0])} g={g} />
      <Lumi
        x={L.x}
        y={L.y}
        scale={L.scale}
        look={watchBox ? lookBox(L) : lookUp(L)}
        expr={mouthAt("lumi", g) > 0.06 ? "excited" : laugh ? "happy" : g >= K.PROJECT ? "surprised" : "excited"}
        mouth={mouthAt("lumi", g)}
        armL={party ? 150 + Math.sin(g / 3) * 15 : 22}
        armR={party ? -150 - Math.sin(g / 3) * 15 : g >= K.L33 ? -120 : -22}
        walk={party ? g * 0.35 : null}
        headTilt={talk("lumi", g) + (laugh ? -5 : 0)}
        blink={blinkAt(g, 1)}
      />
      <Worn L={L} g={g} glow={1} />
      <Melody
        x={M.x}
        y={M.y}
        scale={M.scale}
        g={g}
        mood={laugh || party ? "joy" : g >= K.PROJECT ? "surprised" : "happy"}
        look={watchBox ? lookBox(M) : lookUp(M)}
        blink={blinkAt(g, 23)}
        armL={party ? 150 : 30}
        armR={party ? -150 : -30}
        lean={party ? Math.sin(g / 4) * 12 : 0}
        hop={party ? Math.abs(Math.sin(g / 4)) * 50 : laugh ? Math.abs(Math.sin(g / 3)) * 20 : 0}
        tailSwish={2}
        tailUp={party ? 0.8 : 0.2}
        tailGlow={party ? 1 : 0.3}
      />
      {party && <RisingNotes x={melodyTailTip(M.x, M.y, M.scale, 0.8, g, 2).x} y={melodyTailTip(M.x, M.y, M.scale, 0.8, g, 2).y} scale={0.6} g={g} from={K.DANCE2} on={1} count={5} />}
      <BoboRider
        g={g}
        x={B.x}
        y={B.y}
        scale={B.scale}
        look={watchBox ? lookBox(B) : lookUp(B)}
        expr={bMouth > 0.06 ? "excited" : laugh ? "happy" : party ? "excited" : g >= K.PROJECT ? "surprised" : "happy"}
        mouth={bMouth}
        armL={party ? 100 + Math.sin(g / 2.2) * 75 : 20}
        armR={held && g < K.PROJECT ? -110 : party ? -100 + Math.sin(g / 2.7 + 1) * 75 : -20}
        lean={party ? Math.sin(g / 3.3) * 14 : within(g, K.BTUNE, K.PROJECT) ? Math.sin(g / 3) * 6 : 0}
        squash={party ? 1 + Math.sin(g / 1.6) * 0.06 : 1}
        walk={party ? g * 0.5 : null}
        headTilt={talk("bobo", g) + (party ? Math.sin(g / 2.5) * 10 : 0)}
        blink={blinkAt(g, 3)}
        riderArmsUp={party}
        riderHappy={laugh}
      />
      <BoboBigEyes x={B.x} y={B.y} scale={B.scale} g={g} amount={within(g, K.L32 - 6, K.BTUNE) ? 0.85 : 0} />
      {boxOn && <BananaBox x={bx.x} y={bx.y} scale={B.scale * (held ? 0.75 : 0.6)} g={g} open={open} dance={1} rot={held ? -8 : flyK * 360 * (1 - flyK)} />}
      {within(g, K.BTUNE, K.PROJECT) && <RisingNotes x={bx.x} y={bx.y - 60 * B.scale} scale={0.7} g={g} from={K.BTUNE} on={1} count={4} colors={["#ffd83a", "#ffe880"]} />}
      <Kiko
        x={Kk.x}
        y={Kk.y}
        scale={Kk.scale}
        g={g}
        mood={laugh || party ? "joy" : g >= K.PROJECT ? "surprised" : "happy"}
        look={watchBox ? lookBox(Kk) : lookUp(Kk)}
        blink={blinkAt(g, 11)}
        armL={party ? 150 + Math.sin(g / 2) * 20 : 20}
        armR={party ? -150 - Math.sin(g / 2) * 20 : -20}
        legs={party ? Math.abs(Math.sin(g / 4)) * 0.5 : 0}
        lean={party ? Math.sin(g / 3) * 12 : laugh ? Math.sin(g * 1.3) * 7 : 0}
        headTilt={talk("kiko", g)}
        tailSwish={2}
      />
      {party && <SparkBurst f={g} at={K.DANCE2 + 6} x={540} y={760} reach={540} count={26} size={18} life={36} rainbow />}
      {within(g, K.CUSHION, K.CUSHION + 14) && <SparkBurst f={g} at={K.CUSHION} x={cushS.x} y={cushS.y - 200 * cushS.scale} reach={240} count={12} size={14} life={14} />}
    </HallShot>
  );
};

export const Episode: React.FC = () => <EpisodeFrame audio="ep14/audio.wav" cuts={CUTS} scenes={[Scene0, Scene1, Scene2, Scene3, Scene4, Scene5, Scene6]} />;
