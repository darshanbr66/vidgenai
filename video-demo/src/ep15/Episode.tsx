import React from "react";
import { AbsoluteFill, Easing, useCurrentFrame } from "remotion";
import timeline from "./timeline.json";
import cues from "./cues.json";
import { blinkAt, Lumi } from "../story/characters";
import { Draco, Ep4Defs } from "../ep04/props";
import { BoboRider, boboHand, EASE, EndCard, EpisodeFrame, fontFamily, ip, lumiHand, makeMouthAt, OUT, SparkBurst, XF } from "../kit";
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
import { Ep13Defs, ThoughtBubble, TinyFlame } from "../ep13/props";
import { Ep14Defs, Melody, RisingNotes } from "../ep14/props";
import { GardenHologram, InstrumentHall } from "../ep14/world";
import {
  carveAt,
  ChamberState,
  CRYSTAL,
  CrystalChamber,
  FlowerGarden,
  GardenState,
  GateState,
  giantsCenter,
  LAKE_Y,
  PAD,
  pedestalAt,
  socketAt,
  StarlightHologram,
  stepAt,
  STEPS,
} from "./world";
import {
  BananaFlower,
  BigFlower,
  Boop,
  Ep15Defs,
  FallingPetals,
  FloatAura,
  FlowerCrown,
  LightStream,
  MagicBloom,
  ORB_COLS,
  Petal,
  PetalCoat,
  PetalHeap,
  petalHands,
  PetalMood,
  PetalStorm,
  PollenDust,
  PollenOrb,
  PollenPuff,
  TinyFlower,
} from "./props";

// Episode 15: The Secret of the Floating Flower Garden
// Every timed moment comes from cues.json, written by scripts/ep15_audio.py from the measured voice lines.

const mouthAt = makeMouthAt(timeline);
const F = (s: number) => Math.round(s * 30);
const K: Record<string, number> = {};
for (const [k, v] of Object.entries(cues as Record<string, number>)) K[k] = F(v);
export const CUTS = [0, K.CUT_1, K.CUT_2, K.CUT_3, K.CUT_4, K.CUT_5, K.CUT_6, K.DUR];
export const EP15_FRAMES = K.DUR;

const lerp = (a: number, b: number, k: number) => a + (b - a) * k;
const lerp3 = (a: V3, b: V3, k: number): V3 => [lerp(a[0], b[0], k), lerp(a[1], b[1], k), lerp(a[2], b[2], k)];
const up = (p: V3, h: number): V3 => [p[0], p[1] + h, p[2]];
const add3 = (a: V3, b: V3): V3 => [a[0] + b[0], a[1] + b[1], a[2] + b[2]];
const clamp1 = (v: number) => Math.max(-1, Math.min(1, v));
const lookAtPt = (who: { x: number; y: number }, p: { x: number; y: number }, h = 300) => ({ x: clamp1((p.x - who.x) / 260), y: clamp1((p.y - (who.y - h)) / 300) });
const talk = (who: string, g: number) => Math.sin(g / 4.3 + who.length) * 4.5 * Math.min(1, mouthAt(who, g) * 3);
const hopArc = (k: number, h: number) => Math.sin(Math.max(0, Math.min(1, k)) * Math.PI) * h;
const within = (g: number, a: number, b: number) => g >= a && g < b;
const talking = (who: string, g: number) => mouthAt(who, g) > 0.06;
type Pt = { x: number; y: number; scale: number };

const LUMI_S = 1;
const BOBO_S = 0.91;
const DRACO_S = 1.05;
const KIKO_S = 0.8;
const MEL_S = 0.6;
const PETAL_S = 0.7;

const Worn: React.FC<{ L: Pt; g: number; glow?: number }> = ({ L, g, glow = 0.4 }) => <MoonPendant x={L.x + 4 * L.scale} y={L.y - 262 * L.scale} scale={0.62 * L.scale} g={g} glow={glow} />;
const Defs: React.FC<{ bloom?: number }> = ({ bloom = 1 }) => (
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
    <Ep14Defs alive={1} />
    <Ep15Defs bloom={bloom} />
  </>
);

const Fade: React.FC<{ f: number; children: React.ReactNode; bg: string; fade?: boolean }> = ({ f, children, bg, fade = true }) => (
  <AbsoluteFill style={{ background: bg, opacity: fade ? ip(f, [0, XF], [0, 1]) : 1 }}>{children}</AbsoluteFill>
);

const GardenShot: React.FC<{ cam: Cam3; g: number; s: GardenState; gate?: GateState; world?: React.ReactNode; over?: React.ReactNode; fade?: boolean; children: React.ReactNode }> = ({ cam, g, s, gate, world, over, fade = true, children }) => {
  const f = useCurrentFrame();
  return (
    <Fade f={f} bg="#e8dcf0" fade={fade}>
      <AbsoluteFill style={{ filter: `saturate(${0.95 + s.bloom * 0.35}) contrast(1.05)` }}>
        <World3D cam={cam} bloom={0.4 + s.bloom * 0.3} threshold={0.8}>
          <FlowerGarden t={g / 30} s={s} gate={gate} />
          {world}
        </World3D>
      </AbsoluteFill>
      <CharLayer defs={<Defs bloom={s.bloom} />} filter="gardenLit">
        {children}
      </CharLayer>
      {over}
    </Fade>
  );
};

const ChamberShot: React.FC<{ cam: Cam3; g: number; s: ChamberState; world?: React.ReactNode; over?: React.ReactNode; children: React.ReactNode }> = ({ cam, g, s, world, over, children }) => {
  const f = useCurrentFrame();
  return (
    <Fade f={f} bg="#123048">
      <AbsoluteFill style={{ filter: `saturate(${1.0 + s.bloom * 0.25}) contrast(1.06)` }}>
        <World3D cam={cam} bloom={0.55 + s.glow * 0.4} threshold={0.72}>
          <CrystalChamber t={g / 30} s={s} />
          {world}
        </World3D>
      </AbsoluteFill>
      <CharLayer defs={<Defs bloom={0.6 + s.bloom * 0.4} />} filter="chamberLit">
        {children}
      </CharLayer>
      {over}
    </Fade>
  );
};

const flash = (g: number, a: number, b: number) => <AbsoluteFill style={{ background: "radial-gradient(circle at 50% 40%, #ffffff 0%, #fff4fa 45%, #f0e0ff 100%)", opacity: ip(g, [a, b], [0, 1], EASE) }} />;

// ======================================================================================
// Scene 0: the music box's image of the garden, exactly where Episode 14 ended
// ======================================================================================
const H_LUMI: V3 = [-1.1, 0.02, -6.1];
const H_MEL: V3 = [0.1, 0.02, -6.7];
const H_BOBO: V3 = [1.2, 0.02, -5.8];
const H_KIKO: V3 = [-2.1, 0.02, -6.3];
const H_DRACO: V3 = [2.4, 0.02, -6.1];
const HOLO: V3 = [0, 5.3, -14.6];

const Scene0: React.FC = () => {
  const f = useCurrentFrame();
  const g = f;
  const t = g / 30;
  const cam = camAt(g, [
    [0, { pos: [0, 1.6, -0.9], target: [0, 4.0, -15], fov: 60 }],
    [K.L1 - 4, { pos: [0, 1.55, -1.1], target: [0, 3.9, -15], fov: 60 }],
    [K.L1 - 3, { pos: [0.1, 1.0, -3.7], target: [0.1, 0.72, -6.7], fov: 44 }],
    [K.L2 - 4, { pos: [0.1, 1.0, -3.9], target: [0.1, 0.72, -6.7], fov: 44 }],
    [K.L2 - 3, { pos: [-0.8, 1.3, -2.4], target: [-0.9, 1.0, -6.1], fov: 46 }],
    [K.JUMP - 1, { pos: [-0.8, 1.3, -2.6], target: [-0.9, 1.0, -6.1], fov: 46 }],
    [K.JUMP, { pos: [0, 1.6, -0.9], target: HOLO, fov: 60 }],
    [CUTS[1] + XF, { pos: [0, 3.6, -8.5], target: HOLO, fov: 50 }],
  ]);
  const jk = ip(g, [K.JUMP, K.JUMP + 26], [0, 1], Easing.in(Easing.quad));
  const jumpTo = (p: V3, dx: number): V3 => up(lerp3(p, [HOLO[0] + dx, HOLO[1] - 1.0, HOLO[2] + 1.4], jk), hopArc(jk, 1.4));
  const shrink = 1 - jk * 0.65;
  const L = place(cam, jumpTo(H_LUMI, -0.4), LUMI_S * shrink);
  const B = place(cam, jumpTo(H_BOBO, 0.4), BOBO_S * shrink);
  const D = place(cam, jumpTo(H_DRACO, 0.9), DRACO_S * shrink);
  const Kk = place(cam, jumpTo(H_KIKO, -0.9), KIKO_S * shrink);
  const M = place(cam, H_MEL, MEL_S);
  const Hs = screen(cam, HOLO);
  const Bx = screen(cam, [0, 2.3, -15]);
  const jumping = g >= K.JUMP;
  const mTalk = within(g, K.L1, K.L1_END + 4);
  const look = (w: Pt) => lookAtPt(w, Hs, 420);
  const lookM = (w: Pt) => lookAtPt(w, { x: M.x, y: M.y - 200 * M.scale }, 300);
  const holoScale = 1.7 + ip(g, [K.JUMP + 6, CUTS[1] + XF], [0, 2.4], Easing.in(Easing.quad));
  const lumiTalk = talking("lumi", g);
  return (
    <AbsoluteFill style={{ background: "#2a1e38" }}>
      <AbsoluteFill style={{ filter: "saturate(1.27) contrast(1.05)" }}>
        <World3D cam={cam} bloom={0.75} threshold={0.8}>
          <InstrumentHall t={t} alive={1} kick={[0, 1, 2, 3, 4, 5, 6, 7].map((i) => Math.abs(Math.sin(g / 6 + i)) * 0.25)} frozen={0} box={{ lid: 1, play: 1, glow: 0.8, slots: [1, 1, 1] }} bells={[0.3, 0.3, 0.3, 0.3, 0.3]} moved={{ 0: [-6.2, 6.6, -12], 1: [-6.0, 3.8, -8.5], 2: [6.0, 4.2, -9], 4: [6.2, 6.4, -12.5], 7: [-5.8, 5.2, -6] }} />
          <GardenHologram position={HOLO} t={t + 6} on={1} scale={holoScale} />
          <SparkleBurst3D position={HOLO} age={ip(g, [0, 40], [0, 1])} reach={7} count={140} seed={151} size={16} colors={["#ffd0ec", "#fff0a0", "#a8ffd8", "#ffffff"]} />
        </World3D>
      </AbsoluteFill>
      <CharLayer defs={<Defs />} filter="hallLit">
        <path d={`M ${Bx.x - 20} ${Bx.y} L ${Hs.x - 260} ${Hs.y + 220} L ${Hs.x + 260} ${Hs.y + 220} L ${Bx.x + 20} ${Bx.y} Z`} fill="#f0fff4" opacity={0.15} />
        <Melody
          x={M.x}
          y={M.y}
          scale={M.scale}
          g={g}
          mood={jumping ? "joy" : mTalk ? (talking("melody", g) ? "happy" : "joy") : "joy"}
          mouth={mouthAt("melody", g)}
          look={mTalk ? lookAtPt(M, { x: L.x, y: L.y - 300 * L.scale }, 150) : jumping ? lookAtPt(M, Hs, 300) : lookAtPt(M, Hs, 300)}
          blink={blinkAt(g, 23)}
          armL={jumping ? 150 + Math.sin(g / 3) * 20 : 30}
          armR={mTalk || jumping ? -150 + Math.sin(g / 2.5) * 25 : -30}
          hop={mTalk ? Math.abs(Math.sin(g / 5)) * 20 : 0}
          tailSwish={2}
          tailUp={0.3}
          tailGlow={0.6}
          headTilt={talk("melody", g)}
        />
        {mTalk && <RisingNotes x={M.x} y={M.y - 300 * M.scale} scale={M.scale} g={g} from={K.L1} on={1} count={4} />}
        <Draco x={D.x} y={D.y} scale={D.scale} g={g} mood={jumping ? "joy" : "happy"} look={mTalk ? lookM(D) : look(D)} blink={blinkAt(g, 5)} wing={jumping ? 1 : 0.5} flap={jumping ? Math.sin(g * 0.8) * 24 : 0} armsUp={jumping ? 0.9 : 0.3} glow={0.5} />
        <Lumi x={L.x} y={L.y} scale={L.scale} look={mTalk ? lookM(L) : look(L)} expr={lumiTalk ? "happy" : "excited"} mouth={mouthAt("lumi", g)} armR={g >= K.L2 ? -130 : -22} armL={jumping ? 150 : 22} headTilt={talk("lumi", g)} blink={blinkAt(g, 1)} />
        <Worn L={L} g={g} glow={0.9} />
        <BoboRider g={g} x={B.x} y={B.y} scale={B.scale} look={mTalk ? lookM(B) : look(B)} expr={jumping ? "excited" : "happy"} armL={jumping ? 150 : 20} armR={jumping ? -150 : mTalk ? -140 + Math.sin(g / 3) * 20 : -20} blink={blinkAt(g, 3)} riderArmsUp={jumping} />
        <Kiko x={Kk.x} y={Kk.y} scale={Kk.scale} g={g} mood={jumping ? "joy" : "excited"} look={mTalk ? lookM(Kk) : look(Kk)} blink={blinkAt(g, 11)} armL={jumping ? 150 : 30} armR={jumping ? -150 : -30} legs={jumping ? 0.7 : 0} tailSwish={1.2} />
        <SparkBurst f={f} at={0} x={Hs.x} y={Hs.y} reach={420} count={24} size={18} life={32} />
        {mTalk && <IconBubble x={M.x - 170 * M.scale} y={M.y - 640 * M.scale} scale={0.5} kind="hearts" on={ip(g, [K.L1 + 24, K.L1 + 32], [0, 1])} g={g} />}
      </CharLayer>
      {flash(g, K.JUMP + 12, CUTS[1] + XF)}
    </AbsoluteFill>
  );
};

// ======================================================================================
// Scene 1: the floating flower garden (fading)
// ======================================================================================
const PORTAL: V3 = [0, 7, 2];
const A_LUMI: V3 = [-0.7, 0.02, 3.3];
const A_BOBO: V3 = [0.55, 0.02, 3.6];
const A_DRACO: V3 = [-1.8, 0.02, 3.9];
const A_KIKO: V3 = [1.75, 0.02, 4.1];
const BANANA_F: V3 = [1.3, 0.02, 1.5];
const PINK_F: V3 = [-2.75, 0.02, 1.7];
const BOBO_SNIFF: V3 = [1.05, 0.02, 2.05];
const BOBO_HIDE: V3 = [-0.55, 0.02, 2.55];
const DRACO_SNIFF: V3 = [-2.35, 0.02, 2.45];

const Scene1: React.FC = () => {
  const f = useCurrentFrame();
  const g = f + CUTS[1];
  const fadeK = ip(g, [K.FADE, K.L8_END], [0, 1], EASE);
  const s: GardenState = { bloom: lerp(0.52, 0.32, fadeK), drift: lerp(0.22, 0.4, fadeK), flow: lerp(0.35, 0.15, fadeK), waves: lerp(0.35, 0.1, fadeK), bfly: lerp(0.45, 0.15, fadeK), open: lerp(0.68, 0.32, fadeK) };
  const cam = camAt(g, [
    [CUTS[1], { pos: [16, 11, 28], target: [0, 0, -8], fov: 56 }],
    [K.LAND - 4, { pos: [2.5, 3.2, 13], target: [0, 1.2, 0], fov: 52 }],
    [K.L3 - 4, { pos: [0.4, 2.2, 10.4], target: [0, 1.2, 1.5], fov: 50 }],
    [K.L3 - 3, { pos: [-0.5, 1.45, 7.2], target: [-0.6, 1.15, 3.3], fov: 44 }],
    [K.BANANA - 2, { pos: [-0.5, 1.4, 7.0], target: [-0.6, 1.15, 3.3], fov: 44 }],
    [K.BANANA - 1, { pos: [0.95, 1.35, 7.8], target: [0.95, 1.0, 2.4], fov: 46 }],
    [K.L5 - 3, { pos: [0.95, 1.3, 7.3], target: [0.95, 1.0, 2.2], fov: 46 }],
    [K.L5 - 2, { pos: [2.0, 1.05, 7.2], target: [1.7, 0.9, 4.1], fov: 42 }],
    [K.JUMPBACK - 3, { pos: [2.0, 1.05, 7.0], target: [1.7, 0.9, 4.1], fov: 42 }],
    [K.JUMPBACK - 2, { pos: [0, 1.9, 10.6], target: [0, 1.0, 2.8], fov: 50 }],
    [K.L6 - 3, { pos: [0, 1.85, 10.3], target: [0, 1.0, 2.8], fov: 50 }],
    [K.L6 - 2, { pos: [-1.6, 1.2, 7.6], target: [-1.85, 1.15, 3.6], fov: 44 }],
    [K.DSNIFF - 2, { pos: [-1.6, 1.2, 7.4], target: [-1.85, 1.15, 3.6], fov: 44 }],
    [K.DSNIFF - 1, { pos: [-1.8, 1.35, 6.6], target: [-2.4, 1.3, 2.3], fov: 44 }],
    [K.FADE - 2, { pos: [-1.8, 1.3, 6.3], target: [-2.4, 1.3, 2.3], fov: 44 }],
    [K.FADE - 1, { pos: [0, 1.65, 9.4], target: [0, 2.2, -6], fov: 58 }],
    [CUTS[2] + XF, { pos: [0, 1.7, 9.1], target: [0, 2.1, -6], fov: 58 }],
  ]);
  // falling out of the portal onto the meadow
  const fallK = (d: number) => ip(g, [K.REVEAL + 22 + d, K.LAND + d * 0.3], [0, 1], Easing.inOut(Easing.quad));
  const route = (land: V3, d: number): V3 => up(lerp3(PORTAL, land, fallK(d)), hopArc(fallK(d), 1.2) * 0.6);
  const landed = g >= K.LAND + 6;
  // Bobo: tiptoe to the banana flower, then leap behind Draco
  let bP = route(A_BOBO, 4);
  if (g >= K.SNIFF) bP = lerp3(A_BOBO, BOBO_SNIFF, ip(g, [K.SNIFF, K.SNIFF + 22], [0, 1], EASE));
  if (g >= K.JUMPBACK + 3) {
    const k = ip(g, [K.JUMPBACK + 3, K.JUMPBACK + 18], [0, 1], Easing.out(Easing.quad));
    bP = up(lerp3(BOBO_SNIFF, BOBO_HIDE, k), hopArc(k, 0.9));
  }
  let dP = route(A_DRACO, 8);
  if (g >= K.DSNIFF - 14) dP = lerp3(A_DRACO, DRACO_SNIFF, ip(g, [K.DSNIFF - 14, K.DSNIFF + 6], [0, 1], EASE));
  const L = place(cam, route(A_LUMI, 0), LUMI_S);
  const B = place(cam, bP, BOBO_S);
  const D = place(cam, dP, DRACO_S);
  const Kk = place(cam, route(A_KIKO, 2), KIKO_S);
  const BF = place(cam, BANANA_F, BOBO_S * 1.45);
  const PF = place(cam, PINK_F, 0.85);
  const portal = screen(cam, PORTAL);
  const portalOn = ip(g, [K.REVEAL, K.REVEAL + 10, K.LAND, K.LAND + 16], [0, 1, 1, 0]);
  const tiptoe = within(g, K.SNIFF, K.L5);
  const sniffing = within(g, K.SNIFF + 22, K.JUMPBACK + 3);
  const hiding = g >= K.JUMPBACK + 18;
  const twitch = ip(g, [K.JUMPBACK, K.JUMPBACK + 3, K.JUMPBACK + 14, K.JUMPBACK + 22], [0, 1, 1, 0]);
  const dSniff = within(g, K.DSNIFF + 6, K.L7);
  const sneezeUp = within(g, K.L7, K.ACHOO);
  const dusty = g >= K.ACHOO;
  const deadpan = within(g, K.DUSTY, K.FADE);
  const fading = g >= K.FADE;
  const bMouth = mouthAt("bobo", g);
  const dMouth = mouthAt("draco", g);
  const kMouth = mouthAt("kiko", g);
  const lookB = (w: Pt) => lookAtPt(w, { x: B.x, y: B.y - 260 * B.scale }, 300);
  const lookD = (w: Pt) => lookAtPt(w, { x: D.x, y: D.y - 250 * D.scale }, 300);
  const lookK = (w: Pt) => lookAtPt(w, { x: Kk.x, y: Kk.y - 200 * Kk.scale }, 300);
  const lookUpOut = (w: Pt, ph: number) => ({ x: Math.sin(g / 30 + ph) * 0.5, y: -0.7 });
  const focus = (w: Pt, ph: number) =>
    fading ? { x: Math.sin(ph) * 0.2, y: -0.6 } : within(g, K.L6, K.FADE) ? lookD(w) : within(g, K.L5, K.L5_END) ? lookK(w) : within(g, K.BANANA, K.L5) ? lookB(w) : landed ? lookUpOut(w, ph) : { x: 0, y: 0.6 };
  const nose = { x: D.x - 10 * D.scale, y: D.y - 200 * D.scale };
  const bud = { x: BF.x, y: BF.y - 260 * BF.scale };
  const petalDrop = ip(g, [K.DUSTY + 4, K.DUSTY + 30], [0, 1], EASE);
    const boboEl = (
      <>
        <BoboRider
          g={g}
          x={B.x}
          y={B.y}
          scale={B.scale}
          look={sniffing ? lookAtPt(B, bud, 300) : hiding && !fading ? lookD(B) : within(g, K.BANANA, K.SNIFF) ? lookAtPt(B, bud, 300) : focus(B, 2)}
          expr={hiding && within(g, K.JUMPBACK, K.L6) ? "surprised" : bMouth > 0.06 ? "excited" : sniffing ? "happy" : fading ? "surprised" : !landed ? "excited" : "happy"}
          mouth={bMouth}
          armL={!landed ? 150 : tiptoe ? 50 : hiding && g < K.L6 ? 150 : 20}
          armR={!landed ? -150 : within(g, K.L4, K.L4_END) ? -120 : tiptoe ? -50 : hiding && g < K.L6 ? -150 : -20}
          walk={within(g, K.SNIFF, K.SNIFF + 22) ? g * 0.22 : null}
          lean={sniffing ? 12 : 0}
          squash={hiding && within(g, K.JUMPBACK + 18, K.L6 + 20) ? 0.92 + Math.sin(g * 1.8) * 0.03 : 1}
          headTilt={talk("bobo", g) + (sniffing ? 10 : 0)}
          blink={sniffing ? 0.2 : blinkAt(g, 3)}
          riderArmsUp={!landed}
        />
        <BoboBigEyes x={B.x} y={B.y} scale={B.scale} g={g} amount={within(g, K.BANANA, K.L4) ? 0.9 : 0} />
      </>
    );
  return (
    <GardenShot cam={cam} g={g} s={s} fade={false} over={<AbsoluteFill style={{ background: "radial-gradient(circle at 50% 40%, #ffffff 0%, #fff4fa 45%, #f0e0ff 100%)", opacity: ip(f, [0, 18], [1, 0], EASE) }} />}>
      {portalOn > 0.01 && (
        <g opacity={portalOn}>
          <circle cx={portal.x} cy={portal.y} r={170 * portalOn} fill="url(#softGlow)" />
          <SparkBurst f={f} at={K.REVEAL - CUTS[1] + 10} x={portal.x} y={portal.y} reach={260} count={18} size={16} life={30} rainbow />
        </g>
      )}
      {/* the giant pink flower Draco sniffs, and the banana-shaped flower */}
      <BigFlower x={PF.x} y={PF.y} scale={PF.scale} g={g} color="#ff8ac0" open={lerp(0.8, 0.45, fadeK)} layer="back" stem={240} wiggle={ip(g, [K.ACHOO - 2, K.ACHOO, K.ACHOO + 12], [0, 1, 0])} />
      <BigFlower x={PF.x} y={PF.y} scale={PF.scale} g={g} color="#ff8ac0" open={lerp(0.8, 0.45, fadeK)} layer="front" stem={240} wiggle={ip(g, [K.ACHOO - 2, K.ACHOO, K.ACHOO + 12], [0, 1, 0])} />
      <BananaFlower x={BF.x} y={BF.y} scale={BF.scale} g={g} stem={130} twitch={twitch} lean={twitch * -12} />
      <Draco
        x={D.x}
        y={D.y}
        scale={D.scale}
        g={g}
        mood={deadpan ? "neutral" : sneezeUp ? "effort" : dSniff ? "joy" : within(g, K.L6, K.L6_END) ? (dMouth > 0.06 ? "excited" : "happy") : fading ? "surprised" : !landed ? "joy" : "happy"}
        mouth={dMouth}
        look={deadpan ? { x: 0, y: 0 } : sneezeUp ? { x: 0, y: -0.6 } : focus(D, 3)}
        blink={deadpan ? 0.45 : dSniff ? 0.2 : blinkAt(g, 5)}
        wing={!landed || within(g, K.L6, K.DSNIFF) ? 1 : 0.4}
        flap={!landed ? Math.sin(g * 0.8) * 22 : 0}
        armsUp={within(g, K.L6, K.L6_END) ? 0.8 : !landed ? 0.6 : 0.2}
        breath={dSniff ? ip(g, [K.DSNIFF + 6, K.L7], [0, 1]) : sneezeUp ? 1 : 0}
        lean={sneezeUp ? -8 + Math.sin(g * 0.9) * 2 : g >= K.ACHOO && g < K.ACHOO + 6 ? 14 : 0}
        step={within(g, K.DSNIFF - 14, K.DSNIFF + 6) ? g * 0.35 : null}
        headTilt={talk("draco", g)}
        glow={0.4}
      />
      <PollenDust x={D.x} y={D.y} scale={D.scale} amount={dusty ? ip(g, [K.ACHOO, K.ACHOO + 6, CUTS[2] + XF], [0, 1, 0.8]) : 0} />
      {deadpan && <DracoBlush x={D.x} y={D.y} scale={D.scale} amount={ip(g, [K.DUSTY + 10, K.DUSTY + 22], [0, 0.6])} />}
      <PollenPuff x={nose.x - 60 * D.scale} y={nose.y - 120 * D.scale} scale={D.scale * 0.9} age={ip(g, [K.ACHOO, K.ACHOO + 40], [0, 1])} />
      {deadpan && <TinyFlower x={lerp(D.x + 120 * D.scale, D.x + 10 * D.scale, petalDrop)} y={lerp(D.y - 900 * D.scale, D.y - 330 * D.scale, petalDrop) + Math.sin(petalDrop * 12) * 10} scale={D.scale * 0.9} rot={petalDrop * 200} />}
      {deadpan && <IconBubble x={D.x + 190 * D.scale} y={D.y - 560 * D.scale} scale={D.scale * 0.6} kind="dots" on={ip(g, [K.DUSTY + 14, K.DUSTY + 22], [0, 1])} g={g} />}
      {hiding && boboEl}
      <Lumi
        x={L.x}
        y={L.y}
        scale={L.scale}
        look={focus(L, 1)}
        expr={talking("lumi", g) ? (fading ? "surprised" : "excited") : deadpan ? "happy" : fading ? "surprised" : !landed ? "excited" : "happy"}
        mouth={mouthAt("lumi", g)}
        armL={!landed ? 150 : within(g, K.L3, K.L3_END) ? 120 : 22}
        armR={!landed ? -150 : within(g, K.L3, K.L3_END) ? -120 : fading && g >= K.L8 ? -100 : -22}
        headTilt={talk("lumi", g) + (deadpan ? 6 : 0)}
        blink={blinkAt(g, 1)}
      />
      <Worn L={L} g={g} />
      {!hiding && boboEl}
      {hiding && within(g, K.JUMPBACK + 18, K.L6 + 30) && <ShakeLines x={B.x} y={B.y - 260 * B.scale} scale={B.scale} on={1} g={g} />}
      {hiding && within(g, K.JUMPBACK + 14, K.L6) && <SweatDrop x={B.x + 110 * B.scale} y={B.y - 400 * B.scale} scale={B.scale} g={g} />}
      {within(g, K.JUMPBACK, K.JUMPBACK + 12) && <IconBubble x={B.x - 160 * B.scale} y={B.y - 560 * B.scale} scale={B.scale * 0.6} kind="bang" on={ip(g, [K.JUMPBACK, K.JUMPBACK + 5], [0, 1])} g={g} tail={1} />}
      <Kiko
        x={Kk.x}
        y={Kk.y}
        scale={Kk.scale}
        g={g}
        mood={within(g, K.L5, K.L5_END) ? (kMouth > 0.06 ? "worried" : "surprised") : deadpan ? "joy" : fading ? "surprised" : !landed ? "joy" : "happy"}
        mouth={kMouth}
        look={within(g, K.L5, K.L5_END) ? lookB(Kk) : focus(Kk, 4)}
        blink={blinkAt(g, 11)}
        armL={!landed ? 150 : within(g, K.L5, K.L5_END) ? 100 : 20}
        armR={!landed ? -150 : within(g, K.L5, K.L5_END) ? -60 : -20}
        legs={!landed ? 0.6 : 0}
        lean={deadpan ? Math.sin(g * 1.3) * 6 : 0}
        headTilt={talk("kiko", g)}
        tailSwish={1.3}
      />
      {within(g, K.SNIFF + 26, K.JUMPBACK) && <path d={`M ${bud.x - 70 * B.scale} ${bud.y + 60 * B.scale} q -20 -20 0 -40 q 20 -20 0 -40`} stroke="#fff6c0" strokeWidth={6} fill="none" strokeLinecap="round" opacity={0.8} />}
      {fading && <FallingPetals g={g} count={14} seed={15} on={ip(g, [K.FADE, K.FADE + 20], [0, 0.7])} speed={0.6} />}
    </GardenShot>
  );
};

// ======================================================================================
// Scene 2: meeting Petal
// ======================================================================================
const HOME: V3 = [0, 0.02, -0.2];
const M_LUMI: V3 = [-1.05, 0.02, 2.3];
const M_DRACO: V3 = [-1.95, 0.02, 2.85];
const M_BOBO: V3 = [1.05, 0.02, 2.35];
const M_KIKO: V3 = [1.95, 0.02, 2.95];
const HOME_S = 1.15;
const CUP_H = (230 * HOME_S) / 330; // the height of the flower's cup, in world units

const Scene2: React.FC = () => {
  const f = useCurrentFrame();
  const g = f + CUTS[2];
  const s: GardenState = { bloom: 0.32, drift: 0.4, flow: 0.15, waves: 0.1, bfly: 0.15, open: 0.32 };
  const cam = camAt(g, [
    [CUTS[2], { pos: [0, 2.0, 10.0], target: [0, 1.3, 0], fov: 52 }],
    [K.PEEK - 3, { pos: [0, 1.95, 9.6], target: [0, 1.3, 0], fov: 52 }],
    [K.PEEK - 2, { pos: [0, 1.55, 3.7], target: [0, 1.35, -0.2], fov: 44 }],
    [K.L10 - 3, { pos: [0, 1.55, 3.5], target: [0, 1.35, -0.2], fov: 44 }],
    [K.L10 - 2, { pos: [0.5, 1.45, 6.0], target: [-0.45, 1.2, 0.8], fov: 50 }],
    [K.L11 - 3, { pos: [0.5, 1.45, 5.8], target: [-0.45, 1.2, 0.8], fov: 50 }],
    [K.L11 - 2, { pos: [0, 1.75, 8.4], target: [0, 1.3, 0.6], fov: 52 }],
    [K.CHOO1, { pos: [0, 1.7, 7.9], target: [0, 1.35, 0.6], fov: 52 }],
    [K.STORMEND + 6, { pos: [0, 1.8, 9.4], target: [0, 1.2, 0.8], fov: 58 }],
    [K.COVERED - 2, { pos: [0, 1.8, 9.2], target: [0, 1.2, 0.8], fov: 58 }],
    [K.COVERED - 1, { pos: [1.5, 1.2, 6.9], target: [1.5, 1.0, 2.6], fov: 46 }],
    [K.BLUSH - 2, { pos: [1.5, 1.2, 6.7], target: [1.5, 1.0, 2.6], fov: 46 }],
    [K.BLUSH - 1, { pos: [0, 1.5, 3.6], target: [0, 1.3, 0.3], fov: 44 }],
    [CUTS[3] + XF, { pos: [0, 1.5, 3.4], target: [0, 1.3, 0.3], fov: 44 }],
  ]);
  const L = place(cam, M_LUMI, LUMI_S);
  const D = place(cam, M_DRACO, DRACO_S);
  const B = place(cam, M_BOBO, BOBO_S);
  const Kk = place(cam, M_KIKO, KIKO_S);
  const HF = place(cam, HOME, HOME_S);
  const flowerOpen = ip(g, [K.PEEK - 8, K.PEEK + 6], [0, 1], OUT);
  // Petal: hidden in the cup, pops up, then flies out in front of it
  const pop = ip(g, [K.PEEK, K.PEEK + 9], [0, 1], OUT);
  const flyOut = ip(g, [K.L9 + 30, K.L9 + 60], [0, 1], EASE);
  const inCup = up(HOME, CUP_H - 0.32 + pop * 0.6);
  const pPos = lerp3(inCup, [HOME[0], CUP_H + 0.22, HOME[2] + 0.55], flyOut);
  const P = place(cam, pPos, PETAL_S);
  const out = flyOut > 0;
  const pFly = 1;
  const pTalk = talking("petal", g);
  const ahh = within(g, K.L11 + F(1.15), K.CHOO1 + 6);
  const choo = within(g, K.CHOO1 + 6, K.STORM + 16);
  const embarrassed = g >= K.BLUSH;
  const pMood: PetalMood = choo ? "achoo" : ahh ? "ah" : embarrassed ? "embarrassed" : within(g, K.L10, K.L10_END) ? "sad" : within(g, K.L11, K.L11 + F(1.15)) ? "magic" : g < K.PEEK + 14 ? "surprised" : pTalk ? "happy" : g >= K.L13 ? "embarrassed" : "joy";
  const handsUp = within(g, K.L11, K.CHOO1 + 6);
  const storm = ip(g, [K.STORM, K.STORMEND + 40], [0, 1]);
  const covered = g >= K.STORM + 10;
  const coat = covered ? ip(g, [K.STORM + 10, K.STORM + 30], [0, 1]) : 0;
  const shake = within(g, K.BLUSH + 6, K.BLUSH + 30);
  const coatAmt = shake ? ip(g, [K.BLUSH + 6, K.BLUSH + 30], [1, 0.15]) : g >= K.BLUSH + 30 ? 0.15 : coat;
  const lookP = (w: Pt) => lookAtPt(w, { x: P.x, y: P.y - (200 + pFly) * P.scale }, 300);
  const lookB = (w: Pt) => lookAtPt(w, { x: B.x, y: B.y - 300 * B.scale }, 300);
  const homeS = screen(cam, up(HOME, CUP_H * 1.2));
  const focus = (w: Pt) => (g < K.PEEK ? lookAtPt(w, homeS, 300) : within(g, K.L13, K.BLUSH) ? lookB(w) : lookP(w));
  const leanIn = within(g, K.HOLDS - 6, K.CHOO1 + 6) ? 8 : 0;
  const blown = within(g, K.STORM, K.STORMEND + 30);
  const hands = petalHands(P.x, P.y, P.scale, pFly);
  const kLaugh = within(g, K.L13, K.L14_END + 20);
  const bMouth = mouthAt("bobo", g);
    const petalEl = (
          <Petal
            x={P.x}
            y={P.y}
            scale={P.scale}
            g={g}
            mood={pMood}
            mouth={mouthAt("petal", g)}
            look={g < K.PEEK + 10 ? { x: 0, y: 0 } : embarrassed ? { x: 0.3, y: 0.7 } : lookAtPt(P, { x: L.x, y: L.y - 330 * L.scale }, 150 + pFly)}
            blink={blinkAt(g, 29)}
            armL={handsUp ? 150 + Math.sin(g / 3) * 8 : g < K.PEEK + 14 ? 140 : within(g, K.L9, K.L9_END) ? 110 : 25}
            armR={handsUp ? -150 - Math.sin(g / 3) * 8 : g < K.PEEK + 14 ? -140 : -25}
            fly={pFly}
            flap={g < K.PEEK ? 0.2 : 1}
            lean={choo ? 14 : 0}
            squash={ahh ? 1 + ip(g, [K.L11 + F(1.15), K.CHOO1], [0, 0.08]) : choo ? 0.9 : 1}
            headTilt={talk("petal", g)}
            handGlow={handsUp ? 1 : 0.4}
            blush={embarrassed ? ip(g, [K.BLUSH, K.BLUSH + 10], [0, 1]) : 0}
            facePaws={embarrassed ? ip(g, [K.BLUSH, K.BLUSH + 10], [0, 1]) : 0}
          />
    );
  return (
    <GardenShot cam={cam} g={g} s={s}>
      <BigFlower x={HF.x} y={HF.y} scale={HF.scale} g={g} color="#ff9ac8" open={flowerOpen} layer="back" wiggle={within(g, K.RUSTLE, K.PEEK) ? 1 : 0} stem={230} />
      {/* Petal: clipped by the cup while she is inside it */}
      <defs>
        <clipPath id="ptCup">
          <rect x={0} y={0} width={1080} height={HF.y - 230 * HF.scale + 6} />
        </clipPath>
      </defs>
      {!out && <g clipPath="url(#ptCup)">{petalEl}</g>}
      <BigFlower x={HF.x} y={HF.y} scale={HF.scale} g={g} color="#ff9ac8" open={flowerOpen} layer="front" wiggle={within(g, K.RUSTLE, K.PEEK) ? 1 : 0} stem={230} />
      {out && petalEl}
      {within(g, K.RUSTLE + 6, K.PEEK) && <IconBubble x={homeS.x + 150} y={homeS.y - 150} scale={0.55} kind="question" on={ip(g, [K.RUSTLE + 6, K.RUSTLE + 12], [0, 1])} g={g} />}
      {within(g, K.PEEK, K.PEEK + 16) && <SparkBurst f={g} at={K.PEEK} x={P.x} y={P.y - (200 + pFly) * P.scale} reach={240} count={16} size={14} life={16} rainbow />}
      {handsUp && <circle cx={hands.x} cy={hands.y} r={70} fill="url(#softGlow)" opacity={0.7} />}
      {/* Petal pictures the Bloom Crystal growing dark */}
      <ThoughtBubble x={Math.min(800, P.x + 260 * P.scale)} y={Math.max(320, P.y - (700 + pFly) * P.scale)} scale={0.95} on={ip(g, [K.L10 + 20, K.L10 + 30, K.L11 - 6, K.L11], [0, 1, 1, 0])} tail={-1}>
        <g transform="scale(0.9)">
          <path d="M 0 -95 L 34 -40 L 0 15 L -34 -40 Z" fill={`rgb(${Math.round(lerp(230, 120, ip(g, [K.L10 + 30, K.L10_END], [0, 1])))},${Math.round(lerp(190, 115, ip(g, [K.L10 + 30, K.L10_END], [0, 1])))},${Math.round(lerp(255, 135, ip(g, [K.L10 + 30, K.L10_END], [0, 1])))})`} stroke="#6a5a8a" strokeWidth={4} />
          <path d="M -40 30 Q -30 0 -10 25 M 40 30 Q 30 0 10 25" stroke="#8a9a8a" strokeWidth={6} fill="none" strokeLinecap="round" />
          <path d="M -60 40 L 60 40" stroke="#8a7a6a" strokeWidth={8} strokeLinecap="round" />
        </g>
      </ThoughtBubble>
      <Draco
        x={D.x}
        y={D.y}
        scale={D.scale}
        g={g}
        mood={blown ? "surprised" : within(g, K.PEEK, K.PEEK + 20) ? "surprised" : kLaugh ? "joy" : "happy"}
        look={focus(D)}
        blink={blinkAt(g, 5)}
        wing={blown ? 1 : 0.4}
        armsUp={blown ? 0.9 : 0.2}
        lean={leanIn * 0.6 + (blown ? -10 : 0)}
        glow={0.35}
      />
      <PollenDust x={D.x} y={D.y} scale={D.scale} amount={0.7} />
      <Lumi
        x={L.x}
        y={L.y}
        scale={L.scale}
        look={focus(L)}
        expr={blown ? "surprised" : within(g, K.PEEK, K.PEEK + 20) ? "surprised" : within(g, K.L10, K.L10_END + 10) ? "neutral" : kLaugh ? "happy" : "happy"}
        mouth={mouthAt("lumi", g)}
        armL={blown ? 150 : 22}
        armR={blown ? -150 : -22}
        headTilt={talk("lumi", g) + leanIn * 0.6}
        blink={blown ? 0.2 : blinkAt(g, 1)}
      />
      <Worn L={L} g={g} />
      <BoboRider
        g={g}
        x={B.x}
        y={B.y}
        scale={B.scale}
        look={within(g, K.COVERED, K.L14) ? { x: Math.sin(g / 6) * 0.8, y: 0 } : within(g, K.L14, K.L14_END + 10) ? { x: 0, y: 0.5 } : focus(B)}
        expr={blown ? "surprised" : bMouth > 0.06 ? "excited" : within(g, K.L14_END, K.BLUSH + 30) ? "happy" : within(g, K.PEEK, K.PEEK + 20) ? "surprised" : "happy"}
        mouth={bMouth}
        armL={blown ? 150 : within(g, K.L14, K.L14_END) ? 60 : 20}
        armR={blown ? -150 : within(g, K.L14, K.L14_END) ? -60 : -20}
        lean={shake ? Math.sin(g * 2.4) * 12 : 0}
        squash={shake ? 1 + Math.sin(g * 2.4) * 0.04 : 1}
        headTilt={talk("bobo", g) + leanIn + (within(g, K.L14, K.L14_END) ? 12 : 0) + (shake ? Math.sin(g * 2.4) * 10 : 0)}
        blink={blown ? 0.2 : within(g, K.COVERED + 5, K.COVERED + 9) ? 0.1 : blinkAt(g, 3)}
        riderArmsUp={blown}
      />
      <PetalCoat x={B.x} y={B.y} scale={B.scale} amount={coatAmt} g={g} lean={shake ? Math.sin(g * 2.4) * 12 : 0} />
      {shake && <ShakeLines x={B.x} y={B.y - 260 * B.scale} scale={B.scale * 1.2} on={1} g={g} />}
      <Kiko
        x={Kk.x}
        y={Kk.y}
        scale={Kk.scale}
        g={g}
        mood={blown ? "surprised" : kLaugh ? (talking("kiko", g) ? "excited" : "joy") : within(g, K.PEEK, K.PEEK + 20) ? "surprised" : "happy"}
        mouth={mouthAt("kiko", g)}
        look={kLaugh ? lookB(Kk) : focus(Kk)}
        blink={blinkAt(g, 11)}
        armL={blown ? 150 : kLaugh ? 120 : 20}
        armR={blown ? -150 : kLaugh ? -100 + Math.sin(g / 2) * 20 : -20}
        lean={kLaugh ? Math.sin(g * 1.2) * 7 : leanIn * -0.6}
        squash={kLaugh ? 0.95 + Math.sin(g * 1.9) * 0.03 : 1}
        headTilt={talk("kiko", g)}
        tailSwish={kLaugh ? 2 : 1.3}
      />
      {/* the petal storm */}
      <PetalStorm x={P.x} y={P.y - (200 + pFly) * P.scale} scale={1.1} age={storm} count={110} reach={1000} />
      {g >= K.STORMEND && <FallingPetals g={g} count={22} seed={21} on={ip(g, [K.STORMEND, K.STORMEND + 20, CUTS[3], CUTS[3] + XF], [1, 0.8, 0.8, 0.5])} speed={0.8} />}
    </GardenShot>
  );
};

// ======================================================================================
// Scene 3: the garden of giant flowers
// ======================================================================================
const DRIFT3 = 0.42;
const GC = giantsCenter(DRIFT3);
const gi = (x: number, z: number): V3 => [GC[0] + x, GC[1] + 0.02, GC[2] + z];
const G_LUMI = gi(-0.75, 2.5);
const G_BOBO = gi(1.3, 2.4);
const G_DRACO = gi(-1.75, 2.9);
const G_KIKO = gi(0.3, 3.0);
const G_PETAL = gi(0.0, 1.9);
const G_BUD = gi(2.0, 1.45);
const G_HUG = gi(1.95, 1.75);
const START: V3 = [5.2, 0.02, -3.0];

const Scene3: React.FC = () => {
  const f = useCurrentFrame();
  const g = f + CUTS[3];
  const s: GardenState = { bloom: 0.3, drift: DRIFT3, flow: 0.15, waves: 0.1, bfly: 0.15, open: 0.32 };
  const hopSide: Cam3 = { pos: [GC[0] - 2, 3.6, 7], target: [GC[0] - 6.5, 0.6, -6.5], fov: 54 };
  const cam = camAt(g, [
    [CUTS[3], { pos: [GC[0], GC[1] + 1.5, GC[2] + 8.8], target: [GC[0], GC[1] + 1.0, GC[2] + 2.0], fov: 58 }],
    [K.HOPS - 2, { pos: [GC[0], GC[1] + 1.45, GC[2] + 8.5], target: [GC[0], GC[1] + 1.0, GC[2] + 2.0], fov: 58 }],
    [K.HOPS - 1, hopSide],
    [K.BUD - 3, { pos: [hopSide.pos[0] + 1, hopSide.pos[1] - 0.3, hopSide.pos[2] - 1.2], target: hopSide.target, fov: 54 }],
    [K.BUD - 2, { pos: [GC[0] + 1.45, GC[1] + 1.3, GC[2] + 7.4], target: [GC[0] + 1.6, GC[1] + 1.0, GC[2] + 1.8], fov: 48 }],
    [K.PRANK - 3, { pos: [GC[0] + 1.45, GC[1] + 1.25, GC[2] + 7.1], target: [GC[0] + 1.6, GC[1] + 1.0, GC[2] + 1.8], fov: 48 }],
    [K.PRANK - 2, { pos: [GC[0] - 1.45, GC[1] + 1.3, GC[2] + 7.8], target: [GC[0] - 1.5, GC[1] + 1.1, GC[2] + 2.7], fov: 48 }],
    [K.L17 - 3, { pos: [GC[0] - 1.45, GC[1] + 1.3, GC[2] + 7.6], target: [GC[0] - 1.5, GC[1] + 1.1, GC[2] + 2.7], fov: 48 }],
    [K.L17 - 2, { pos: [GC[0] - 1.75, GC[1] + 0.55, GC[2] + 6.9], target: [GC[0] - 1.75, GC[1] + 1.45, GC[2] + 2.9], fov: 50 }],
    [K.FLIP + 6, { pos: [GC[0] - 1.75, GC[1] + 0.6, GC[2] + 7.2], target: [GC[0] - 1.75, GC[1] + 1.45, GC[2] + 2.9], fov: 52 }],
    [K.FLIP + 7, { pos: [GC[0], GC[1] + 1.6, GC[2] + 8.9], target: [GC[0], GC[1] + 1.2, GC[2] + 2.0], fov: 58 }],
    [K.FLOAT, { pos: [GC[0], GC[1] + 1.6, GC[2] + 8.7], target: [GC[0], GC[1] + 1.3, GC[2] + 2.0], fov: 58 }],
    [CUTS[4] + XF, { pos: [GC[0], GC[1] + 2.4, GC[2] + 9.2], target: [GC[0], GC[1] + 2.2, GC[2] + 2.0], fov: 60 }],
  ]);
  const hopping = within(g, K.HOPS - 1, K.BUD - 2);
  // the hop across the lily pads: each character follows the pads with a delay
  const path = (d: number, end: V3): V3 => {
    const k = ip(g, [K.HOPS + d, K.HOPS + d + 46], [0, STEPS + 1]);
    const i = Math.floor(k);
    const fr = k - i;
    const pts = [START, ...Array.from({ length: STEPS }, (_, j) => stepAt(j)), end];
    const a = pts[Math.min(i, pts.length - 1)];
    const b = pts[Math.min(i + 1, pts.length - 1)];
    return up(lerp3(a, b, EASE(fr)), hopArc(fr, 0.55) * (i < pts.length - 1 ? 1 : 0));
  };
  const onIsland = (p: V3, d: number) => (hopping ? path(d, p) : p);
  // Bobo and the bud
  let bP = onIsland(G_BOBO, 8);
  if (g >= K.HUG - 4) bP = lerp3(G_BOBO, G_HUG, ip(g, [K.HUG - 4, K.HUG + 4], [0, 1], EASE));
  // Kiko's prank: he tiptoes over behind Draco and back
  const behindD = gi(-1.35, 2.5);
  let kP = onIsland(G_KIKO, 14);
  if (g >= K.PRANK - 20 && g < K.FLOAT) {
    const k1 = ip(g, [K.PRANK - 20, K.PRANK + 10], [0, 1], EASE);
    const k2 = ip(g, [K.PRANK + 30, K.L17], [0, 1], EASE);
    kP = lerp3(lerp3(gi(0.1, 3.2), behindD, k1), gi(-0.15, 3.3), k2);
  }
  // Draco's sneeze somersault
  let dP = onIsland(G_DRACO, 4);
  const flipK = ip(g, [K.DSNEEZE, K.FLIP + 10], [0, 1], Easing.out(Easing.quad));
  if (g >= K.DSNEEZE) dP = up(lerp3(G_DRACO, gi(-1.95, 2.45), flipK), hopArc(flipK, 0.9));
  // Petal's sneeze lifts everyone
  const floatK = ip(g, [K.FLOAT, K.FLOAT + 30], [0, 1], EASE) * ip(g, [CUTS[4] - 20, CUTS[4] + XF], [1, 0.2], EASE);
  const fl = (ph: number) => floatK * (1.3 + Math.sin(g / 9 + ph) * 0.2);
  const L = place(cam, up(onIsland(G_LUMI, 0), fl(0)), LUMI_S);
  const B = place(cam, up(bP, fl(1)), BOBO_S);
  const D = place(cam, up(dP, fl(2)), DRACO_S);
  const Kk = place(cam, up(g >= K.PRANK - 20 && g < K.FLOAT ? kP : onIsland(G_KIKO, 14), fl(3)), KIKO_S);
  const P = place(cam, onIsland(G_PETAL, -10), PETAL_S);
  const BUD = place(cam, G_BUD, BOBO_S * 1.45);
  const pFly = 200 + Math.sin(g / 8) * 20 + floatK * 150;
  const pTalk = talking("petal", g);
  const ahh = within(g, K.CHOO2, K.FLOAT - 2);
  const choo = within(g, K.FLOAT - 2, K.FLOAT + 14);
  const budOpen = ip(g, [K.BLOOM1, K.BLOOM1 + 14], [0, 1], OUT);
  const hugging = within(g, K.HUG, K.PRANK);
  const deadpanB = within(g, K.BLOOM1 + 14, K.PRANK);
  const crownOn = within(g, K.PRANK + 28, K.DSNEEZE + 4);
  const behold = within(g, K.L17, K.NOSE);
  const noseK = ip(g, [K.NOSE - 4, K.NOSE + 14], [0, 1], EASE);
  const onNose = within(g, K.NOSE + 14, K.DSNEEZE + 2);
  const dUp = within(g, K.L18, K.DSNEEZE);
  const flipping = within(g, K.DSNEEZE, K.FLIP + 10);
  const sitDazed = within(g, K.FLIP + 10, K.FLOAT);
  const floating = g >= K.FLOAT;
  const nose = { x: D.x - 8 * D.scale, y: D.y - 205 * D.scale };
  const lookD = (w: Pt) => lookAtPt(w, { x: D.x, y: D.y - 250 * D.scale }, 300);
  const lookB = (w: Pt) => lookAtPt(w, { x: B.x, y: B.y - 260 * B.scale }, 300);
  const lookP = (w: Pt) => lookAtPt(w, { x: P.x, y: P.y - (200 + pFly) * P.scale }, 300);
  const focus = (w: Pt, ph: number) => (floating ? { x: Math.sin(g / 7 + ph) * 0.7, y: Math.cos(g / 9 + ph) * 0.5 } : g >= K.L17 ? lookD(w) : within(g, K.BUD, K.PRANK) ? lookB(w) : lookP(w));
  const bMouth = mouthAt("bobo", g);
  const dMouth = mouthAt("draco", g);
  const upside = floating ? ip(g, [K.FLOAT + 6, K.FLOAT + 30], [0, 180], EASE) * ip(g, [CUTS[4] - 20, CUTS[4] + 4], [1, 0]) : 0;
  const orbPts = [gi(-3.4, -0.5), gi(3.0, -1.4), gi(-1.4, -2.6), gi(0.8, -3.6), gi(4.4, 0.4), gi(-4.6, 1.0)].map((p) => screen(cam, up(p, 0.9 + Math.sin(g / 12) * 0.1)));
  return (
    <GardenShot cam={cam} g={g} s={s}>
      {/* glowing pollen orbs scattered through the flowers */}
      {orbPts.map((p, i) => (
        <PollenOrb key={i} x={p.x} y={p.y} scale={0.7 * place(cam, gi(0, 0), 1).scale} color={ORB_COLS[i % 4]} g={g + i * 10} glow={0.8} />
      ))}
      <BananaFlower x={BUD.x} y={BUD.y} scale={BUD.scale} g={g} stem={110} open={budOpen} layer="all" twitch={hugging && !deadpanB ? 0.4 : 0} />
      <Petal
        x={P.x}
        y={P.y}
        scale={P.scale}
        g={g}
        mood={choo ? "achoo" : ahh ? "ah" : floating ? "embarrassed" : pTalk ? "happy" : within(g, K.L17, K.CHOO2) ? "joy" : "happy"}
        mouth={mouthAt("petal", g)}
        look={floating ? { x: 0, y: 0.5 } : within(g, K.L15, K.L15_END) ? { x: 0.6, y: -0.2 } : focus(P, 5)}
        blink={blinkAt(g, 29)}
        armL={within(g, K.L15, K.L15_END) ? 120 : 25}
        armR={within(g, K.L15, K.L15_END) ? -140 + Math.sin(g / 3) * 15 : -25}
        fly={pFly}
        lean={choo ? 16 : 0}
        headTilt={talk("petal", g)}
        blush={floating ? ip(g, [K.FLOAT + 10, K.FLOAT + 20], [0, 1]) : 0}
        facePaws={floating ? ip(g, [K.FLOAT + 10, K.FLOAT + 20], [0, 0.8]) : 0}
        handGlow={0.4}
      />
      <g transform={flipping ? `rotate(${-flipK * 360} ${D.x} ${D.y - 160 * D.scale})` : undefined}>
        <Draco
          x={D.x}
          y={D.y}
          scale={D.scale}
          g={g}
          mood={dUp ? "effort" : flipping ? "surprised" : sitDazed ? "neutral" : behold ? (dMouth > 0.06 ? "excited" : "joy") : onNose || within(g, K.NOSE, K.L18) ? "surprised" : floating ? "surprised" : "happy"}
          mouth={dMouth}
          look={within(g, K.NOSE + 6, K.DSNEEZE) ? { x: 0, y: 0.9 } : sitDazed ? { x: Math.sin(g / 3), y: -0.3 } : focus(D, 3)}
          blink={blinkAt(g, 5)}
          wing={behold || floating ? 1 : 0.4}
          flap={floating ? Math.sin(g * 0.6) * 18 : 0}
          armsUp={behold ? 1 : floating ? 0.8 : 0.2}
          breath={behold ? 1 : dUp ? ip(g, [K.L18, K.DSNEEZE], [0.3, 1]) : 0}
          lean={dUp ? -10 : 0}
          squash={sitDazed ? 0.9 : 1}
          step={hopping ? g * 0.3 : null}
          headTilt={talk("draco", g)}
          glow={behold ? 0.7 : 0.35}
        />
        {crownOn && <FlowerCrown x={D.x} y={D.y - 345 * D.scale} scale={D.scale * 0.95} g={g} rot={Math.sin(g / 8) * 4} />}
      </g>
      <PollenDust x={D.x} y={D.y} scale={D.scale} amount={0.4} />
      {within(g, K.FLIP + 10, K.FLOAT + 20) && <DizzyStars x={D.x} y={D.y - 340 * D.scale} scale={D.scale} on={ip(g, [K.FLIP + 10, K.FLIP + 16], [0, 1])} g={g} />}
      {within(g, K.DSNEEZE, K.FLIP + 30) && <FlowerCrown x={D.x + flipK * 260 * D.scale} y={D.y - 345 * D.scale - hopArc(flipK, 500) * D.scale} scale={D.scale * 0.95} g={g} rot={flipK * 300} />}
      {/* the little flower drifting down onto his nose */}
      {within(g, K.NOSE - 4, K.DSNEEZE + 2) && <TinyFlower x={lerp(nose.x + 160 * D.scale, nose.x, noseK) + Math.sin(noseK * 10) * 14} y={lerp(nose.y - 600 * D.scale, nose.y, noseK)} scale={D.scale * 0.7} rot={noseK * 160} color="#ffd060" />}
      <Boop x={nose.x} y={nose.y} scale={D.scale} age={ip(g, [K.NOSE + 14, K.NOSE + 24], [0, 1])} />
      {within(g, K.DSNEEZE, K.DSNEEZE + 30) && <SmokePuff x={nose.x - 30 * D.scale} y={nose.y} scale={D.scale * 1.2} age={ip(g, [K.DSNEEZE, K.DSNEEZE + 30], [0, 1])} />}
      {behold && <SparkBurst f={g} at={K.L17 + 2} x={D.x} y={D.y - 300 * D.scale} reach={260} count={14} size={14} life={22} rainbow />}
      <Lumi
        x={L.x}
        y={L.y}
        scale={L.scale}
        look={focus(L, 1)}
        expr={floating ? "excited" : within(g, K.BLOOM1, K.PRANK) ? "happy" : sitDazed ? "happy" : "happy"}
        mouth={mouthAt("lumi", g)}
        armL={floating ? 150 : hopping ? 120 : 22}
        armR={floating ? -150 : hopping ? -120 : -22}
        lean={floating ? Math.sin(g / 8) * 10 : 0}
        headTilt={talk("lumi", g)}
        blink={blinkAt(g, 1)}
      />
      <Worn L={L} g={g} />
      <g transform={upside > 0 ? `rotate(${upside} ${B.x} ${B.y - 200 * B.scale})` : undefined}>
        <BoboRider
          g={g}
          x={B.x}
          y={B.y}
          scale={B.scale}
          look={hugging ? lookAtPt(B, { x: BUD.x, y: BUD.y - 300 * BUD.scale }, 300) : deadpanB ? { x: 0, y: 0 } : within(g, K.BUD, K.HUG) ? lookAtPt(B, { x: BUD.x, y: BUD.y - 300 * BUD.scale }, 300) : focus(B, 2)}
          expr={deadpanB ? "neutral" : hugging ? "effort" : bMouth > 0.06 ? "excited" : floating ? "surprised" : "happy"}
          mouth={bMouth}
          armL={hugging || deadpanB ? 70 : within(g, K.L16, K.L16_END) ? 140 : floating ? 150 : hopping ? 120 : 20}
          armR={hugging || deadpanB ? -70 : within(g, K.L16, K.L16_END) ? -140 : floating ? -150 : hopping ? -120 : -20}
          lean={hugging ? 10 + Math.sin(g * 1.4) * 4 : 0}
          squash={hugging ? 0.96 + Math.sin(g * 1.4) * 0.03 : 1}
          headTilt={talk("bobo", g) + (deadpanB ? -4 : 0)}
          blink={deadpanB ? 0.45 : blinkAt(g, 3)}
          riderArmsUp={floating}
          riderHappy={floating}
        />
        <PetalCoat x={B.x} y={B.y} scale={B.scale} amount={0.12} g={g} />
      </g>
      <BoboBigEyes x={B.x} y={B.y} scale={B.scale} g={g} amount={within(g, K.BUD, K.L16_END) ? 0.9 : 0} />
      {deadpanB && <IconBubble x={B.x - 180 * B.scale} y={B.y - 560 * B.scale} scale={B.scale * 0.6} kind="dots" on={ip(g, [K.BLOOM1 + 16, K.BLOOM1 + 24], [0, 1])} g={g} tail={1} />}
      {within(g, K.BLOOM1, K.BLOOM1 + 14) && <SparkBurst f={g} at={K.BLOOM1} x={BUD.x} y={BUD.y - 300 * BUD.scale} reach={200} count={12} size={13} life={14} />}
      <Kiko
        x={Kk.x}
        y={Kk.y}
        scale={Kk.scale}
        g={g}
        mood={within(g, K.PRANK - 20, K.L17) ? "joy" : floating ? "excited" : within(g, K.BLOOM1, K.PRANK) ? "joy" : "happy"}
        mouth={mouthAt("kiko", g)}
        look={within(g, K.PRANK - 20, K.L17) ? lookD(Kk) : focus(Kk, 4)}
        blink={within(g, K.PRANK + 30, K.L17) ? 0.3 : blinkAt(g, 11)}
        armL={within(g, K.PRANK, K.PRANK + 30) ? 150 : floating ? 150 : 20}
        armR={within(g, K.PRANK, K.PRANK + 30) ? -60 : within(g, K.PRANK + 30, K.L17) ? -120 : floating ? -150 : -20}
        legs={hopping || floating ? 0.5 : within(g, K.PRANK - 20, K.L17) ? Math.abs(Math.sin(g / 4)) * 0.3 : 0}
        lean={within(g, K.PRANK + 30, K.L17) ? Math.sin(g * 1.3) * 6 : floating ? Math.sin(g / 7) * 14 : 0}
        headTilt={talk("kiko", g)}
        tailSwish={1.6}
      />
      {within(g, K.PRANK + 34, K.L17) && <ShakeLines x={Kk.x} y={Kk.y - 200 * Kk.scale} scale={Kk.scale} on={1} g={g} />}
      {/* the crown in Kiko's hands on the way over */}
      {within(g, K.PRANK - 20, K.PRANK + 28) && <FlowerCrown x={kikoHand(Kk.x, Kk.y, Kk.scale, 150, -1).x} y={kikoHand(Kk.x, Kk.y, Kk.scale, 150, -1).y - 10} scale={Kk.scale * 0.8} g={g} rot={-10} />}
      {/* Petal's sneeze: a gentle gust of petals lifts everyone */}
      <PetalStorm x={P.x} y={P.y - (200 + pFly) * P.scale} scale={0.9} age={ip(g, [K.FLOAT - 2, K.FLOAT + 50], [0, 1])} count={70} reach={800} seed={7} />
      {floating &&
        [L, B, D, Kk].map((w, i) => <FloatAura key={i} x={w.x} y={w.y} scale={w.scale} on={floatK} g={g + i * 20} />)}
    </GardenShot>
  );
};

// ======================================================================================
// Scene 4: the flower gate on the lake
// ======================================================================================
const PY = PAD[1];
const pd = (x: number, z: number): V3 => [PAD[0] + x, PY + 0.01, PAD[2] + z];
const P_LUMI = pd(-0.7, -0.2);
const P_PETAL = pd(0.3, -0.6);
const P_BOBO = pd(1.2, 0.2);
const P_DRACO = pd(-1.8, 0.4);
const P_KIKO = pd(2.1, 0.6);
const LAUNCHER = pd(1.2, 0.2);
const CLOUD: V3 = pd(1.5, -1.2);
const CLOUD_Y = 3.1;
const SNAPPER = pd(-2.75, -0.6);

const gateAt = (g: number): GateState => {
  const carve = [0, 1, 2, 3].map((i) => {
    const at = K.GATE + 3 + i * 12;
    const flashK = ip(g, [at, at + 3, at + 14, at + 20], [0, 1, 1, 0.25]);
    return g >= K.L21 ? Math.max(0.25, ip(g, [K.L21 + 10 + i * 12, K.L21 + 14 + i * 12], [0.25, 1])) : flashK;
  });
  const sockets = [0, 1, 2, 3].map((i) => {
    if (i === 0) return ip(g, [K.ORB1 + 10, K.ORB1 + 14], [0, 1]);
    const at = K.ORBS + F(0.25 + (i - 1) * 0.45);
    return ip(g, [at, at + 4], [0, 1]);
  });
  const open = ip(g, [K.OPENGATE + 10, K.OPENGATE + 46], [0, 1], Easing.inOut(Easing.quad));
  return { carve: open > 0 ? [1, 1, 1, 1] : carve, sockets, open };
};

const Scene4: React.FC = () => {
  const f = useCurrentFrame();
  const g = f + CUTS[4];
  const gate = gateAt(g);
  const bl = 0.28 + gate.open * 0.12;
  const s: GardenState = { bloom: bl, drift: 0.45, flow: 0.12, waves: 0.08 + gate.open * 0.3, bfly: 0.12, open: 0.3 };
  const GX = PAD[0];
  const GZ = PAD[2] - 3.6;
  const cam = camAt(g, [
    [CUTS[4], { pos: [GX + 1.5, PY + 2.6, PAD[2] + 9.5], target: [GX, PY + 2.8, GZ - 2], fov: 54 }],
    [K.GATE - 2, { pos: [GX + 1.0, PY + 2.2, PAD[2] + 8.2], target: [GX, PY + 2.4, GZ], fov: 52 }],
    [K.GATE - 1, { pos: [GX, PY + 2.4, PAD[2] + 5.6], target: [GX, PY + 2.6, GZ], fov: 52 }],
    [K.L21 - 3, { pos: [GX, PY + 2.4, PAD[2] + 5.3], target: [GX, PY + 2.6, GZ], fov: 52 }],
    [K.L21 - 2, { pos: [GX - 0.3, PY + 1.35, PAD[2] + 3.6], target: [GX - 0.5, PY + 1.15, PAD[2] - 0.3], fov: 42 }],
    [K.ORB1 - 2, { pos: [GX - 0.3, PY + 1.3, PAD[2] + 3.4], target: [GX - 0.5, PY + 1.15, PAD[2] - 0.3], fov: 42 }],
    [K.ORB1 - 1, { pos: [GX - 1.7, PY + 1.7, PAD[2] + 3.4], target: [GX - 1.0, PY + 1.35, GZ + 1.1], fov: 50 }],
    [K.KTAP - 2, { pos: [GX - 1.7, PY + 1.7, PAD[2] + 3.2], target: [GX - 1.0, PY + 1.35, GZ + 1.1], fov: 50 }],
    [K.KTAP - 1, { pos: [GX + 1.6, PY + 1.4, PAD[2] + 5.6], target: [GX + 1.6, PY + 1.2, PAD[2]], fov: 48 }],
    [K.LAUNCH + 2, { pos: [GX + 1.6, PY + 1.4, PAD[2] + 5.6], target: [GX + 1.6, PY + 1.3, PAD[2]], fov: 48 }],
    [K.LAUNCH + 20, { pos: [GX + 1.6, PY + 2.6, PAD[2] + 6.0], target: [GX + 1.5, PY + CLOUD_Y - 0.2, PAD[2] - 1.2], fov: 48 }],
    [K.DFIRE - 2, { pos: [GX + 1.6, PY + 2.7, PAD[2] + 5.8], target: [GX + 1.5, PY + CLOUD_Y - 0.2, PAD[2] - 1.2], fov: 48 }],
    [K.DFIRE - 1, { pos: [GX - 2.1, PY + 1.3, PAD[2] + 4.8], target: [GX - 2.3, PY + 1.1, PAD[2] - 0.2], fov: 46 }],
    [K.ORBS - 2, { pos: [GX - 2.1, PY + 1.3, PAD[2] + 4.6], target: [GX - 2.3, PY + 1.1, PAD[2] - 0.2], fov: 46 }],
    [K.ORBS - 1, { pos: [GX, PY + 2.4, PAD[2] + 7.4], target: [GX, PY + 2.0, GZ], fov: 54 }],
    [K.OPENGATE, { pos: [GX, PY + 2.3, PAD[2] + 6.8], target: [GX, PY + 2.0, GZ], fov: 54 }],
    [CUTS[5] + XF, { pos: [GX, PY + 1.6, PAD[2] + 0.4], target: [GX, PY + 0.4, GZ - 2], fov: 50 }],
  ]);
  const L = place(cam, P_LUMI, LUMI_S);
  // Bobo: launched into the petal cloud and stuck there
  const launchK = ip(g, [K.LAUNCH, K.LAUNCH + 22], [0, 1], Easing.out(Easing.quad));
  const inCloud = g >= K.LAUNCH + 22;
  let bP = P_BOBO;
  if (g >= K.LAUNCH) bP = up(lerp3(P_BOBO, CLOUD, launchK), launchK * (CLOUD_Y - 1.05) + hopArc(launchK, 0.8));
  const B = place(cam, bP, BOBO_S);
  const D = place(cam, P_DRACO, DRACO_S);
  const kP = within(g, K.KTAP - 10, K.LAUNCH + 20) ? lerp3(P_KIKO, pd(2.35, 0.1), ip(g, [K.KTAP - 10, K.KTAP], [0, 1], EASE)) : P_KIKO;
  const Kk = place(cam, kP, KIKO_S);
  const P = place(cam, P_PETAL, PETAL_S);
  const LN = place(cam, LAUNCHER, 0.85);
  const SN = place(cam, SNAPPER, 0.8);
  const CL = place(cam, up(CLOUD, CLOUD_Y - 0.62), 1.1);
  const pFly = 220 + Math.sin(g / 8) * 20;
  const lumiTalk = within(g, K.L21, K.L21_END);
  const sock = (i: number) => screen(cam, up(socketAt(i), 0.14));
  // orbs: pink from Lumi; yellow from Kiko, blue from Draco, purple dropped by Bobo from the cloud
  const fromHands = [lumiHand(L.x, L.y, L.scale, -120), kikoHand(Kk.x, Kk.y, Kk.scale, -120), { x: D.x + 90 * D.scale, y: D.y - 250 * D.scale }, { x: B.x + 40 * B.scale, y: B.y - 160 * B.scale }];
  const orbAt = (i: number) => {
    const go = i === 0 ? K.ORB1 : K.ORBS + F(0.25 + (i - 1) * 0.45) - 12;
    const k = ip(g, [go, go + (i === 0 ? 12 : 12)], [0, 1], EASE);
    if (k >= 1) return null;
    const a = fromHands[i];
    const b = sock(i);
    return { x: lerp(a.x, b.x, k), y: lerp(a.y, b.y, k) - hopArc(k, i === 3 ? -40 : 160), k };
  };
  const snapOpen = g < K.SNAP ? 1 : ip(g, [K.SNAP, K.SNAP + 4], [1, 0], OUT);
  const flame = ip(g, [K.DFIRE + 2, K.DFIRE + 5, K.SNAP, K.SNAP + 3], [0, 1, 1, 0]);
  const dm = { x: D.x + 50 * D.scale, y: D.y - 175 * D.scale };
  const huff = within(g, K.SNAP, K.ORBS);
  const launchOpen = g < K.LAUNCH - 2 ? 0 : ip(g, [K.LAUNCH - 2, K.LAUNCH + 3], [0, 1], OUT);
  const lookGate = (w: Pt) => lookAtPt(w, screen(cam, [GX, PY + 3, GZ]), 420);
  const bMouth = mouthAt("bobo", g);
  const opening = g >= K.OPENGATE;
  return (
    <GardenShot cam={cam} g={g} s={s} gate={gate} world={opening ? <SparkleBurst3D position={[GX, PY + 2.4, GZ]} age={ip(g, [K.OPENGATE + 10, K.OPENGATE + 50], [0, 1])} reach={5} count={120} seed={44} size={14} colors={["#ff9ad8", "#fff0a0", "#a8e8ff", "#d0b0ff"]} /> : undefined} over={flash(g, CUTS[5] - 8, CUTS[5] + XF)}>
      {/* the snapping flower and the launching flower */}
      <BigFlower x={SN.x} y={SN.y} scale={SN.scale} g={g} color="#b47aff" open={snapOpen} layer="back" stem={150} wiggle={huff ? ip(g, [K.SNAP, K.SNAP + 20], [1, 0]) : 0} />
      <BigFlower x={SN.x} y={SN.y} scale={SN.scale} g={g} color="#b47aff" open={snapOpen} layer="front" stem={150} wiggle={huff ? ip(g, [K.SNAP, K.SNAP + 20], [1, 0]) : 0} />
      {huff && <IconBubble x={SN.x + 120 * SN.scale} y={SN.y - 520 * SN.scale} scale={SN.scale * 0.7} kind="x" on={ip(g, [K.SNAP + 4, K.SNAP + 10], [0, 1])} g={g} />}
      {launchOpen > 0 && <BigFlower x={LN.x} y={LN.y} scale={LN.scale} g={g} color="#ffa070" open={launchOpen} layer="back" stem={20} fling={ip(g, [K.LAUNCH - 2, K.LAUNCH + 2, K.LAUNCH + 14], [0, 1, 0])} />}
      {g < K.LAUNCH - 2 && <BigFlower x={LN.x} y={LN.y} scale={LN.scale * 0.6} g={g} color="#ffa070" open={0} layer="back" stem={20} wiggle={within(g, K.KTAP, K.LAUNCH) ? 1 : 0} />}
      {/* Bobo's petal cloud */}
      {g >= K.LAUNCH && <PetalHeap x={CL.x} y={CL.y} scale={CL.scale} g={g} layer="back" cloud squish={ip(g, [K.LAUNCH + 20, K.LAUNCH + 24, K.LAUNCH + 36], [0, 1, 0])} />}
      <Petal x={P.x} y={P.y} scale={P.scale} g={g} mood={talking("petal", g) ? "happy" : opening ? "joy" : within(g, K.LAUNCH, K.L22_END) ? "surprised" : "happy"} mouth={mouthAt("petal", g)} look={lookGate(P)} blink={blinkAt(g, 29)} armL={within(g, K.L20, K.L20_END) ? 120 : 25} armR={-25} fly={pFly} headTilt={talk("petal", g)} handGlow={0.4} />
      <Lumi
        x={L.x}
        y={L.y}
        scale={L.scale}
        look={lumiTalk ? lookGate(L) : within(g, K.ORB1, K.ORB1 + 14) ? lookAtPt(L, sock(0), 300) : lookGate(L)}
        expr={lumiTalk ? "excited" : opening ? "excited" : within(g, K.LAUNCH, K.L22_END) ? "surprised" : "happy"}
        mouth={mouthAt("lumi", g)}
        armL={opening ? 150 : 22}
        armR={within(g, K.L21, K.L21_END) ? -100 - Math.sin(g / 4) * 20 : within(g, K.ORB1 - 6, K.ORB1 + 12) ? -120 : opening ? -150 : -22}
        headTilt={talk("lumi", g)}
        blink={blinkAt(g, 1)}
      />
      <Worn L={L} g={g} />
      {g < K.ORB1 && <PollenOrb x={lumiHand(L.x, L.y, L.scale, -22).x} y={lumiHand(L.x, L.y, L.scale, -22).y + 10 * L.scale} scale={L.scale * 0.55} color={ORB_COLS[0]} g={g} />}
      <Draco
        x={D.x}
        y={D.y}
        scale={D.scale}
        g={g}
        mood={huff ? "surprised" : flame > 0 ? "effort" : opening ? "joy" : "happy"}
        look={flame > 0 || huff ? lookAtPt(D, { x: SN.x, y: SN.y - 200 * SN.scale }, 250) : lookGate(D)}
        blink={blinkAt(g, 5)}
        wing={opening ? 1 : 0.4}
        armsUp={opening ? 0.9 : 0.2}
        breath={within(g, K.DFIRE - 6, K.DFIRE + 2) ? 0.8 : 0}
        lean={huff ? 8 : 0}
        glow={0.35}
      />
      <PollenDust x={D.x} y={D.y} scale={D.scale} amount={0.3} />
      {huff && <DracoBlush x={D.x} y={D.y} scale={D.scale} amount={ip(g, [K.SNAP + 6, K.SNAP + 14], [0, 0.7])} />}
      <TinyFlame from={dm} to={{ x: SN.x, y: SN.y - 180 * SN.scale }} on={flame} g={g} scale={D.scale * 1.6} />
      {within(g, K.SNAP, K.SNAP + 28) && <SmokePuff x={SN.x} y={SN.y - 180 * SN.scale} scale={SN.scale * 1.2} age={ip(g, [K.SNAP, K.SNAP + 28], [0, 1])} />}
      {g < K.ORBS && <PollenOrb x={fromHands[2].x} y={fromHands[2].y} scale={D.scale * 0.5} color={ORB_COLS[2]} g={g} />}
      {/* Bobo */}
      {inCloud ? (
        <>
          <BoboRider g={g} x={B.x} y={B.y} scale={B.scale} look={bMouth > 0.06 ? { x: 0, y: 0 } : { x: Math.sin(g / 8) * 0.6, y: 0.4 }} expr={bMouth > 0.06 ? "excited" : "surprised"} mouth={bMouth} armL={110 + Math.sin(g / 3) * 20} armR={-110 - Math.sin(g / 3) * 20} headTilt={talk("bobo", g)} blink={blinkAt(g, 3)} />
          <PetalHeap x={CL.x} y={CL.y} scale={CL.scale} g={g} layer="front" cloud />
        </>
      ) : (
        <BoboRider
          g={g}
          x={B.x}
          y={B.y}
          scale={B.scale}
          look={g >= K.LAUNCH ? { x: 0, y: -0.8 } : within(g, K.KTAP, K.LAUNCH) ? { x: 0, y: 0.8 } : lookGate(B)}
          expr={g >= K.LAUNCH ? "surprised" : within(g, K.KTAP, K.LAUNCH) ? "surprised" : "happy"}
          armL={g >= K.LAUNCH ? 160 : 20}
          armR={g >= K.LAUNCH ? -160 : -20}
          blink={blinkAt(g, 3)}
          riderArmsUp={g >= K.LAUNCH}
        />
      )}
      {within(g, K.LAUNCH, K.LAUNCH + 20) && <SparkBurst f={g} at={K.LAUNCH} x={LN.x} y={LN.y - 60 * LN.scale} reach={220} count={14} size={14} life={18} rainbow />}
      {g < K.ORBS + F(1.15) && inCloud && <PollenOrb x={fromHands[3].x} y={fromHands[3].y} scale={B.scale * 0.5} color={ORB_COLS[3]} g={g} />}
      <Kiko
        x={Kk.x}
        y={Kk.y}
        scale={Kk.scale}
        g={g}
        mood={within(g, K.KTAP, K.LAUNCH) ? "excited" : within(g, K.LAUNCH, K.L22_END + 10) ? "joy" : opening ? "joy" : "happy"}
        look={within(g, K.KTAP - 10, K.LAUNCH + 6) ? lookAtPt(Kk, { x: LN.x, y: LN.y - 60 * LN.scale }, 200) : within(g, K.LAUNCH + 6, K.L22_END) ? lookB(Kk, B) : lookGate(Kk)}
        blink={blinkAt(g, 11)}
        armL={opening ? 150 : 20}
        armR={within(g, K.KTAP, K.KTAP + 10) || within(g, K.KTAP + 12, K.KTAP + 20) ? -70 : opening ? -150 : within(g, K.LAUNCH + 6, K.L22_END) ? -120 : -20}
        lean={within(g, K.KTAP, K.LAUNCH) ? 10 : within(g, K.LAUNCH + 6, K.L22_END) ? Math.sin(g * 1.3) * 6 : 0}
        headTilt={talk("kiko", g)}
        tailSwish={1.5}
      />
      {g < K.ORBS && <PollenOrb x={kikoHand(Kk.x, Kk.y, Kk.scale, -20).x} y={kikoHand(Kk.x, Kk.y, Kk.scale, -20).y} scale={Kk.scale * 0.5} color={ORB_COLS[1]} g={g} />}
      {/* the orbs flying into their sockets */}
      {[0, 1, 2, 3].map((i) => {
        const o = orbAt(i);
        if (!o || o.k <= 0) return null;
        return <PollenOrb key={i} x={o.x} y={o.y} scale={0.55 * L.scale} color={ORB_COLS[i]} g={g} />;
      })}
      {[0, 1, 2, 3].map((i) => {
        const at = i === 0 ? K.ORB1 + 12 : K.ORBS + F(0.25 + (i - 1) * 0.45);
        return within(g, at, at + 14) ? <SparkBurst key={`b${i}`} f={g} at={at} x={sock(i).x} y={sock(i).y} reach={120} count={10} size={10} life={14} /> : null;
      })}
      {within(g, K.GATE, K.GATE + 52) && <IconBubble x={540} y={1450} scale={0.8} kind="question" on={ip(g, [K.GATE + 30, K.GATE + 36], [0, 1])} g={g} />}
    </GardenShot>
  );
};
const lookB = (w: Pt, B: Pt) => lookAtPt(w, { x: B.x, y: B.y - 260 * B.scale }, 300);

// ======================================================================================
// Scene 5: restoring the Bloom Crystal
// ======================================================================================
const C_LUMI: V3 = [-1.3, 0.02, -1.0];
const C_PETAL: V3 = [0.0, 0.02, -1.7];
const C_BOBO: V3 = [1.4, 0.02, -0.8];
const C_DRACO: V3 = [-2.5, 0.02, -0.5];
const C_KIKO: V3 = [2.6, 0.02, -0.4];

const Scene5: React.FC = () => {
  const f = useCurrentFrame();
  const g = f + CUTS[5];
  const restored = g >= K.RESTORE;
  const glow = restored ? ip(g, [K.RESTORE, K.RESTORE + 12], [0.15, 1], OUT) : ip(g, [K.STREAM, K.RESTORE], [0.05, 0.2]);
  const orbs = [0, 1, 2, 3].map((i) => ip(g, [K.POSITION + F(0.25 + i * 0.38), K.POSITION + F(0.25 + i * 0.38) + 4], [0, 1]));
  const s: ChamberState = { glow, orbs, bloom: restored ? ip(g, [K.RESTORE, K.RESTORE + 40], [0.3, 1]) : 0.3, open: restored ? ip(g, [K.RESTORE + 18, K.RESTORE + 60], [0, 1], EASE) : 0 };
  const cam = camAt(g, [
    [CUTS[5], { pos: [0, 2.6, 6.0], target: [0, 1.4, -4], fov: 54 }],
    [K.L23 - 3, { pos: [0, 2.3, 5.2], target: [0, 1.3, -3], fov: 52 }],
    [K.L23 - 2, { pos: [0.05, 1.2, 1.1], target: [0.0, 1.05, -1.7], fov: 40 }],
    [K.L24 - 3, { pos: [0.05, 1.2, 0.95], target: [0.0, 1.05, -1.7], fov: 40 }],
    [K.L24 - 2, { pos: [-0.8, 1.4, 2.9], target: [-1.1, 1.15, -1.0], fov: 44 }],
    [K.POSITION - 3, { pos: [-0.8, 1.35, 2.75], target: [-1.1, 1.15, -1.0], fov: 44 }],
    [K.POSITION - 2, { pos: [0, 2.9, 4.6], target: [0, 0.8, -3.4], fov: 52 }],
    [K.BREATH - 2, { pos: [0, 2.8, 4.3], target: [0, 0.8, -3.4], fov: 52 }],
    [K.BREATH - 1, { pos: [0.0, 1.3, 1.3], target: [0.0, 1.15, -1.7], fov: 42 }],
    [K.STREAM - 2, { pos: [0.0, 1.32, 1.1], target: [0.0, 1.2, -1.7], fov: 42 }],
    [K.STREAM - 1, { pos: [0.5, 1.9, 3.9], target: [0, 1.3, -3.0], fov: 52 }],
    [K.RESTORE, { pos: [0.45, 1.95, 3.7], target: [0, 1.3, -3.0], fov: 52 }],
    [K.RESTORE + 50, { pos: [0, 2.6, 5.6], target: [0, 1.6, -3.6], fov: 56 }],
    [K.BOING - 2, { pos: [0, 2.6, 5.6], target: [0, 1.6, -3.6], fov: 56 }],
    [K.BOING - 1, { pos: [1.6, 1.7, 3.6], target: [1.4, 1.6, -0.8], fov: 48 }],
    [CUTS[6] + XF, { pos: [1.6, 1.75, 3.3], target: [1.4, 1.6, -0.8], fov: 48 }],
  ]);
  // Bobo, Draco, Kiko (and Lumi) carry the orbs to the pedestals and back
  const carry = (home: V3, i: number) => {
    const at = K.POSITION + F(0.25 + i * 0.38);
    const ped = pedestalAt(i);
    const near: V3 = [ped[0] + (home[0] - ped[0]) * 0.3, 0.02, ped[2] + 0.55];
    const goK = ip(g, [at - 18, at - 2], [0, 1], EASE);
    const backK = ip(g, [at + 8, at + 26], [0, 1], EASE);
    return lerp3(lerp3(home, near, goK), home, backK);
  };
  const L = place(cam, carry(C_LUMI, 0), LUMI_S);
  const D = place(cam, carry(C_DRACO, 1), DRACO_S);
  const Kk = place(cam, carry(C_KIKO, 2), KIKO_S);
  const boingK = ip(g, [K.BOING, K.BOING + 26], [0, 1]);
  const bHome = carry(C_BOBO, 3);
  const B = place(cam, up(bHome, hopArc(boingK, 1.3)), BOBO_S);
  const BF = place(cam, C_BOBO, 0.75);
  const P = place(cam, C_PETAL, PETAL_S);
  const Cs = screen(cam, CRYSTAL);
  const pDoubt = within(g, K.L23, K.L24_END + 10);
  const breathe = within(g, K.BREATH, K.CREATE);
  const creating = within(g, K.CREATE, K.RESTORE + 20);
  const pFly = breathe || creating ? 120 + ip(g, [K.BREATH, K.CREATE], [0, 40]) : pDoubt ? 50 : 140 + Math.sin(g / 8) * 15;
  const hands = petalHands(P.x, P.y, P.scale, pFly);
  const grow = ip(g, [K.CREATE, K.STREAM], [0, 1], OUT);
  const streamOn = ip(g, [K.STREAM, K.STREAM + 18], [0, 1], EASE) * ip(g, [K.RESTORE + 8, K.RESTORE + 24], [1, 0]);
  const lookC = (w: Pt) => lookAtPt(w, Cs, 400);
  const lookP = (w: Pt) => lookAtPt(w, { x: P.x, y: P.y - (200 + pFly) * P.scale }, 300);
  const focus = (w: Pt) => (pDoubt || breathe || creating ? lookP(w) : lookC(w));
  const joy = restored && g < K.BOING;
  const handOrb = (who: Pt, i: number, hand: { x: number; y: number }) => {
    const at = K.POSITION + F(0.25 + i * 0.38);
    if (g >= at) return null;
    return <PollenOrb x={hand.x} y={hand.y} scale={who.scale * 0.5} color={ORB_COLS[i]} g={g} />;
  };
  const bouncing = g >= K.BOING;
  return (
    <ChamberShot
      cam={cam}
      g={g}
      s={s}
      world={
        <>
          <LightRing position={CRYSTAL} age={ip(g, [K.RESTORE, K.RESTORE + 30], [0, 1])} radius={9} flat={false} color="#ffe0f8" />
          <SparkleBurst3D position={CRYSTAL} age={ip(g, [K.RESTORE, K.RESTORE + 50], [0, 1])} reach={8} count={180} seed={515} size={18} colors={["#ff9ad8", "#fff0a0", "#a8e8ff", "#d0b0ff", "#ffffff"]} />
        </>
      }
      over={
        <>
          {restored && <AbsoluteFill style={{ background: "#fff4fc", opacity: ip(g, [K.RESTORE, K.RESTORE + 3, K.RESTORE + 16], [0, 0.8, 0]) }} />}
          {restored && <FallingPetals g={g} count={26} seed={55} on={ip(g, [K.RESTORE + 10, K.RESTORE + 30], [0, 1])} speed={0.7} />}
        </>
      }
    >
      {bouncing && <BigFlower x={BF.x} y={BF.y} scale={BF.scale} g={g} color="#ff8ac0" open={ip(g, [K.BOING - 4, K.BOING + 2], [0, 1], OUT)} layer="back" stem={15} fling={ip(g, [K.BOING - 2, K.BOING + 2, K.BOING + 12], [0, 1, 0])} />}
      <Petal
        x={P.x}
        y={P.y}
        scale={P.scale}
        g={g}
        mood={talking("petal", g) ? (pDoubt ? "sad" : "happy") : pDoubt ? "worried" : breathe ? "determined" : creating ? "magic" : joy ? "joy" : "happy"}
        mouth={mouthAt("petal", g)}
        look={pDoubt ? { x: 0, y: 0.6 } : creating || breathe ? lookAtPt(P, Cs, 200 + pFly) : lookAtPt(P, { x: L.x, y: L.y - 300 * L.scale }, 200 + pFly)}
        blink={breathe ? 0.1 : blinkAt(g, 29)}
        armL={creating ? 130 : breathe ? 60 : pDoubt ? 40 : joy ? 160 : 25}
        armR={creating ? -130 : breathe ? -60 : pDoubt ? -40 : joy ? -160 : -25}
        fly={pFly}
        flap={pDoubt ? 0.4 : creating ? 1.6 : 1}
        squash={breathe ? 1 + ip(g, [K.BREATH, K.CREATE], [0, 0.1]) : 1}
        headTilt={talk("petal", g)}
        handGlow={creating ? 1 : pDoubt ? 0.05 : 0.4}
        glow={creating ? 0.5 + 0.2 * Math.sin(g / 3) : 0}
      />
      <MagicBloom x={hands.x} y={hands.y - 150 * P.scale} scale={P.scale * 0.75} grow={creating ? grow : 0} g={g} />
      <LightStream from={{ x: hands.x, y: hands.y - 150 * P.scale }} to={Cs} on={streamOn} g={g} width={70} />
      <Draco x={D.x} y={D.y} scale={D.scale} g={g} mood={joy ? "joy" : creating ? "surprised" : "happy"} look={focus(D)} blink={blinkAt(g, 5)} wing={joy ? 1 : 0.4} flap={joy ? Math.sin(g * 0.8) * 20 : 0} armsUp={joy ? 0.9 : 0.25} step={within(g, K.POSITION, K.POSITION + 60) ? g * 0.3 : null} glow={0.4} />
      {handOrb(D, 1, { x: D.x + 80 * D.scale, y: D.y - 240 * D.scale })}
      <Lumi
        x={L.x}
        y={L.y}
        scale={L.scale}
        look={within(g, K.L24, K.L24_END) ? lookP(L) : focus(L)}
        expr={talking("lumi", g) ? "happy" : joy ? "excited" : creating ? "surprised" : pDoubt ? "neutral" : "happy"}
        mouth={mouthAt("lumi", g)}
        armL={joy ? 150 : 22}
        armR={within(g, K.L24, K.L24_END) ? -70 : joy ? -150 : -22}
        walk={within(g, K.POSITION - 18, K.POSITION + 30) ? g * 0.3 : null}
        headTilt={talk("lumi", g)}
        blink={blinkAt(g, 1)}
      />
      <Worn L={L} g={g} glow={0.4 + glow * 0.6} />
      {handOrb(L, 0, lumiHand(L.x, L.y, L.scale, -22))}
      {bouncing ? (
        <BoboRider g={g} x={B.x} y={B.y} scale={B.scale} look={{ x: 0, y: 0.6 }} expr={talking("bobo", g) ? "excited" : "surprised"} mouth={mouthAt("bobo", g)} armL={150 + Math.sin(g / 2) * 10} armR={-150 - Math.sin(g / 2) * 10} squash={ip(g, [K.BOING, K.BOING + 4, K.BOING + 10], [0.85, 1.1, 1])} headTilt={talk("bobo", g)} blink={blinkAt(g, 3)} riderArmsUp />
      ) : (
        <BoboRider g={g} x={B.x} y={B.y} scale={B.scale} look={focus(B)} expr={joy ? "excited" : creating ? "surprised" : "happy"} armL={joy ? 150 : 20} armR={joy ? -150 : -20} walk={within(g, K.POSITION + 30, K.POSITION + 80) ? g * 0.3 : null} blink={blinkAt(g, 3)} riderArmsUp={joy} riderHappy={creating} />
      )}
      {handOrb(B, 3, boboHand(B.x, B.y, B.scale, -20))}
      {bouncing && <ShakeLines x={B.x} y={B.y - 260 * B.scale} scale={B.scale} on={ip(g, [K.BOING, K.BOING + 6], [0, 1])} g={g} />}
      {bouncing && <BigFlower x={BF.x} y={BF.y} scale={BF.scale} g={g} color="#ff8ac0" open={ip(g, [K.BOING - 4, K.BOING + 2], [0, 1], OUT)} layer="front" stem={15} fling={ip(g, [K.BOING - 2, K.BOING + 2, K.BOING + 12], [0, 1, 0])} />}
      <Kiko x={Kk.x} y={Kk.y} scale={Kk.scale} g={g} mood={joy ? "joy" : creating ? "surprised" : "happy"} look={focus(Kk)} blink={blinkAt(g, 11)} armL={joy ? 150 : 20} armR={joy ? -150 : -20} legs={joy ? Math.abs(Math.sin(g / 4)) * 0.5 : 0} headTilt={talk("kiko", g)} tailSwish={1.4} />
      {handOrb(Kk, 2, kikoHand(Kk.x, Kk.y, Kk.scale, -20))}
      {within(g, K.L24 + 20, K.POSITION) && <IconBubble x={P.x + 170 * P.scale} y={P.y - (560 + pFly) * P.scale} scale={0.5} kind="hearts" on={ip(g, [K.L24 + 20, K.L24 + 28], [0, 1])} g={g} />}
      {[0, 1, 2, 3].map((i) => {
        const at = K.POSITION + F(0.25 + i * 0.38);
        const ps = screen(cam, up(pedestalAt(i), 0.16));
        return within(g, at, at + 14) ? <SparkBurst key={i} f={g} at={at} x={ps.x} y={ps.y} reach={110} count={10} size={10} life={14} /> : null;
      })}
    </ChamberShot>
  );
};

// ======================================================================================
// Scene 6: the garden celebration; the next mystery
// ======================================================================================
const E_LUMI: V3 = [-1.2, 0.02, 2.2];
const E_PETAL: V3 = [0.0, 0.02, 2.0];
const E_BOBO: V3 = [1.25, 0.02, 2.3];
const E_DRACO: V3 = [-2.0, 0.02, 2.6];
const E_KIKO: V3 = [0.35, 0.02, 3.0];
const HIDE_F: V3 = [0.6, 0.02, 0.2];
const HEAP: V3 = [-2.5, 0.02, 1.3];
const GOLD_F: V3 = [2.35, 0.02, 1.35];
const BOBO_GOLD: V3 = [1.75, 0.02, 1.75];
const STAR_HOLO: V3 = [0, 7.8, -16];
const BEAM_FROM: V3 = [0, LAKE_Y, -22];

const Scene6: React.FC = () => {
  const f = useCurrentFrame();
  const g = f + CUTS[6];
  const t = g / 30;
  const wide = g < K.PARTY;
  const bloomK = ip(g, [K.ALIVE, K.ALIVE + 50], [0.3, 1], EASE);
  const s: GardenState = { bloom: bloomK, drift: ip(g, [K.ALIVE + 10, K.ALIVE + 80], [0.45, 0], EASE), flow: ip(g, [K.ALIVE + 15, K.ALIVE + 45], [0.15, 1]), waves: ip(g, [K.ALIVE, K.ALIVE + 40], [0.1, 1]), bfly: ip(g, [K.ALIVE + 20, K.ALIVE + 70], [0.1, 1]), open: ip(g, [K.ALIVE + 5, K.ALIVE + 55], [0.3, 1], EASE) };
  const project = ip(g, [K.PROJECT, K.PROJECT + 24], [0, 1], OUT);
  if (wide) {
    const cam = camAt(g, [
      [CUTS[6], { pos: [-18, 7, 24], target: [2, 0, -12], fov: 56 }],
      [K.PARTY, { pos: [12, 4.5, 19], target: [-1, 0.5, -10], fov: 54 }],
    ]);
    return (
      <GardenShot cam={cam} g={g} s={s} world={<LightRing position={[0, LAKE_Y + 0.2, -20]} age={ip(g, [K.ALIVE, K.ALIVE + 45], [0, 1])} radius={60} color="#ffe0f8" />}>
        <SparkBurst f={g} at={K.ALIVE + 4} x={540} y={900} reach={600} count={30} size={18} life={40} rainbow />
        <FallingPetals g={g} count={20} seed={61} on={ip(g, [K.ALIVE + 20, K.ALIVE + 40], [0, 1])} />
      </GardenShot>
    );
  }
  const cam = camAt(g, [
    [K.PARTY, { pos: [0, 1.9, 9.6], target: [0, 1.2, 0.6], fov: 54 }],
    [K.KHIDE - 1, { pos: [0.2, 1.8, 9.0], target: [0.2, 1.2, 0.8], fov: 54 }],
    [K.L27 - 2, { pos: [0.2, 1.8, 8.8], target: [0.2, 1.2, 0.8], fov: 54 }],
    [K.L27 - 1, { pos: [-1.9, 1.5, 7.2], target: [-2.1, 1.6, 1.8], fov: 50 }],
    [K.DIVE + 8, { pos: [-1.9, 2.1, 7.4], target: [-2.2, 2.6, 1.8], fov: 52 }],
    [K.PLOP, { pos: [-2.0, 1.4, 6.4], target: [-2.4, 0.9, 1.5], fov: 48 }],
    [K.L28 - 2, { pos: [-2.0, 1.4, 6.2], target: [-2.4, 0.9, 1.5], fov: 48 }],
    [K.L28 - 1, { pos: [2.0, 1.3, 6.5], target: [2.05, 1.0, 1.6], fov: 46 }],
    [K.LAUGH - 2, { pos: [2.0, 1.25, 6.3], target: [2.05, 1.0, 1.6], fov: 46 }],
    [K.LAUGH - 1, { pos: [0, 1.8, 9.4], target: [0, 1.2, 0.8], fov: 54 }],
    [K.PROJECT - 2, { pos: [0, 1.75, 9.2], target: [0, 1.25, 0.8], fov: 54 }],
    [K.PROJECT - 1, { pos: [0, 1.2, 9.4], target: [0, 5.0, -16], fov: 60 }],
    [K.DUR, { pos: [0, 1.3, 9.8], target: [0, 5.2, -16], fov: 60 }],
  ]);
  const party = g < K.KHIDE;
  const dance = (ph: number, amt = 0.2) => (party ? Math.abs(Math.sin((g + ph) / 5)) * amt : 0);
  const laugh = within(g, K.LAUGH, K.PROJECT + 6);
  const lh = (ph: number) => (laugh ? Math.abs(Math.sin((g + ph) / 4)) * 0.08 : 0);
  const jumped = (ph: number) => hopArc(ip(g, [K.JUMP2 + ph, K.JUMP2 + 14 + ph], [0, 1]), 0.45);
  const startled = within(g, K.JUMP2, K.JUMP2 + 26);
  // Kiko hides in the flower, then pops out
  const kikoHidden = g < K.L26;
  const popK = ip(g, [K.L26, K.L26 + 8], [0, 1], OUT);
  const kBack = ip(g, [K.L27 - 10, K.L27 + 6], [0, 1], EASE);
  const kP: V3 = kikoHidden ? HIDE_F : lerp3(up(HIDE_F, (270 * 1.1) / 330 * (1 - kBack) + hopArc(popK, 0.3)), E_KIKO, kBack);
  // Draco's heroic landing
  const riseK = ip(g, [K.L27, K.DIVE + 4], [0, 1], EASE);
  const diveK = ip(g, [K.DIVE + 4, K.PLOP], [0, 1], Easing.in(Easing.quad));
  let dP: V3 = up(E_DRACO, dance(3));
  if (g >= K.L27) dP = up(lerp3(E_DRACO, [-2.7, 0.02, 1.9], riseK), riseK * 1.8);
  if (g >= K.DIVE + 4) dP = up(lerp3([-2.7, 0.02, 1.9], HEAP, diveK), (1 - diveK) * 1.8);
  const sunk = within(g, K.PLOP, K.PLOP + 22);
  const popD = ip(g, [K.PLOP + 22, K.PLOP + 30], [0, 1], OUT);
  if (g >= K.PLOP) dP = up(HEAP, sunk ? -0.75 : -0.75 + popD * 0.45);
  // Bobo and the golden banana flower
  const toGold = ip(g, [K.L28 - 10, K.L28 + 10], [0, 1], EASE);
  const bP = g >= K.L28 - 10 ? lerp3(E_BOBO, BOBO_GOLD, toGold) : up(E_BOBO, dance(4, 0.26) + lh(3));
  const L = place(cam, up(E_LUMI, dance(0) + lh(1) + jumped(0)), LUMI_S);
  const B = place(cam, up(bP, jumped(2)), BOBO_S);
  const D = place(cam, dP, DRACO_S);
  const Kk = place(cam, kP, KIKO_S);
  const P = place(cam, E_PETAL, PETAL_S);
  const HF = place(cam, HIDE_F, 1.1);
  const HP = place(cam, HEAP, 0.8);
  const GF = place(cam, GOLD_F, 0.9);
  const goldClose = ip(g, [K.CLOSE, K.CLOSE + 12], [1, 0.12], EASE);
  const goldOpen = g < K.CLOSE ? 1 : goldClose;
  const caught = g >= K.CLOSE + 4;
  // Bobo's right paw reaches into the golden flower's cup
  const cup = { x: GF.x, y: GF.y - 175 * GF.scale };
  const reachA = (Math.atan2(-(cup.x - (B.x + 86 * B.scale)), cup.y - (B.y - 196 * B.scale)) * 180) / Math.PI;
  const pFly = party ? 260 + Math.sin(g / 6) * 60 : 220 + Math.sin(g / 8) * 20 + jumped(4) * 200;
  const pLoop = party ? { x: Math.sin(g / 9) * 120, y: 0 } : { x: 0, y: 0 };
  const Hs = screen(cam, STAR_HOLO);
  const Ls = screen(cam, BEAM_FROM);
  const lookUp = (w: Pt, ph: number) => (g >= K.PROJECT ? lookAtPt(w, Hs, 420) : party ? { x: Math.sin(g / 9 + ph) * 0.5, y: -0.2 } : within(g, K.L27, K.L28 - 10) ? lookAtPt(w, { x: D.x, y: D.y - 250 * D.scale }, 300) : within(g, K.L28 - 10, K.LAUGH) ? lookAtPt(w, { x: B.x, y: B.y - 250 * B.scale }, 300) : within(g, K.KHIDE, K.L27) ? lookAtPt(w, { x: HF.x, y: HF.y - 300 * HF.scale }, 300) : { x: 0, y: 0 });
  const bMouth = mouthAt("bobo", g);
  const paw = { x: B.x + 100 * B.scale, y: B.y - 230 * B.scale };
  return (
    <GardenShot
      cam={cam}
      g={g}
      s={s}
      world={<StarlightHologram position={STAR_HOLO} t={t} on={project} scale={3.0} />}
      over={
        <>
          <EndCard at={K.END - CUTS[6]} top={250} />
          <AbsoluteFill style={{ alignItems: "center", fontFamily }}>
            <div style={{ position: "absolute", top: 410, fontSize: 42, fontWeight: 600, color: "#fff4ff", opacity: ip(f, [K.END - CUTS[6] + 20, K.END - CUTS[6] + 36], [0, 1]), textShadow: "0 0 8px rgba(40, 20, 70, 1), 0 3px 12px rgba(40, 20, 70, 1)" }}>
              Next: The Secret of the Starlight Island ⭐
            </div>
          </AbsoluteFill>
        </>
      }
    >
      {g >= K.PROJECT && <path d={`M ${Ls.x - 30} ${Ls.y} L ${Hs.x - 300 * project} ${Hs.y + 240} L ${Hs.x + 300 * project} ${Hs.y + 240} L ${Ls.x + 30} ${Ls.y} Z`} fill="#f0f0ff" opacity={0.16 * project} />}
      {/* Kiko's hiding flower, the petal heap, the golden banana flower */}
      <BigFlower x={HF.x} y={HF.y} scale={HF.scale} g={g} color="#ffd060" open={ip(g, [K.L26 - 3, K.L26 + 3], [0.25, 1], OUT)} layer="back" stem={270} wiggle={within(g, K.KHIDE, K.L26) ? 1 : 0} />
      {!kikoHidden && kBack < 1 && (
        <Kiko x={Kk.x} y={Kk.y} scale={Kk.scale} g={g} mood="excited" mouth={mouthAt("kiko", g)} look={{ x: 0, y: 0.2 }} blink={1} armL={160} armR={-160} legs={0.6} headTilt={talk("kiko", g)} tailSwish={2} />
      )}
      <BigFlower x={HF.x} y={HF.y} scale={HF.scale} g={g} color="#ffd060" open={ip(g, [K.L26 - 3, K.L26 + 3], [0.25, 1], OUT)} layer="front" stem={270} wiggle={within(g, K.KHIDE, K.L26) ? 1 : 0} />
      {within(g, K.L26, K.L26 + 14) && <SparkBurst f={g} at={K.L26} x={Kk.x} y={Kk.y - 200 * Kk.scale} reach={300} count={18} size={16} life={16} rainbow />}
      <PetalHeap x={HP.x} y={HP.y} scale={HP.scale} g={g} layer="back" squish={ip(g, [K.PLOP, K.PLOP + 3, K.PLOP + 16], [0, 1, 0])} />
      <Draco
        x={D.x}
        y={D.y}
        scale={D.scale}
        g={g}
        mood={g >= K.PLOP + 22 ? "joy" : sunk ? "surprised" : within(g, K.L27, K.DIVE + 4) ? (talking("draco", g) ? "excited" : "joy") : g >= K.DIVE + 4 ? "excited" : startled ? "surprised" : laugh ? "joy" : "happy"}
        mouth={mouthAt("draco", g)}
        look={g >= K.PLOP + 22 && g < K.L28 ? { x: Math.sin(g / 3), y: -0.3 } : lookUp(D, 3)}
        blink={blinkAt(g, 5)}
        wing={party || within(g, K.L27, K.PLOP) ? 1 : 0.5}
        flap={party || within(g, K.L27, K.PLOP) ? Math.sin(g * 0.8) * 24 : 0}
        armsUp={party || within(g, K.L27, K.PLOP) ? 0.95 : 0.3}
        lean={g >= K.DIVE + 4 && g < K.PLOP ? -25 : 0}
        breath={within(g, K.L27, K.DIVE + 4) ? 1 : 0}
        headTilt={talk("draco", g)}
        glow={0.5}
      />
      <PetalHeap x={HP.x} y={HP.y} scale={HP.scale} g={g} layer="front" squish={ip(g, [K.PLOP, K.PLOP + 3, K.PLOP + 16], [0, 1, 0])} />
      {g >= K.PLOP + 22 && <TinyFlower x={D.x + 20 * D.scale} y={D.y - 340 * D.scale} scale={D.scale * 1.2} rot={Math.sin(g / 6) * 10} color="#ff8ac0" />}
      {within(g, K.PLOP, K.PLOP + 20) && <PetalStorm x={HP.x} y={HP.y - 100 * HP.scale} scale={0.7} age={ip(g, [K.PLOP, K.PLOP + 30], [0, 1])} count={40} reach={340} seed={9} />}
      <DizzyStars x={D.x} y={D.y - 360 * D.scale} scale={D.scale} on={ip(g, [K.PLOP + 22, K.PLOP + 28, K.L28, K.L28 + 8], [0, 1, 1, 0])} g={g} />
      <Petal
        x={P.x + pLoop.x}
        y={P.y}
        scale={P.scale}
        g={g}
        mood={laugh || party ? "joy" : startled ? "surprised" : g >= K.PROJECT ? "surprised" : "happy"}
        look={lookUp(P, 5)}
        blink={blinkAt(g, 29)}
        armL={party ? 150 : 25}
        armR={party ? -150 : -25}
        fly={pFly}
        lean={party ? Math.sin(g / 9) * 18 : 0}
        flap={party ? 1.4 : 1}
        handGlow={party ? 1 : 0.5}
      />
      {party && <FallingPetals g={g} count={10} seed={66} w={300} h={600} />}
      <Lumi
        x={L.x}
        y={L.y}
        scale={L.scale}
        look={lookUp(L, 1)}
        expr={talking("lumi", g) ? "excited" : laugh ? "happy" : startled ? "surprised" : g >= K.PROJECT ? "surprised" : "excited"}
        mouth={mouthAt("lumi", g)}
        armL={party || startled ? 150 + Math.sin(g / 3) * 15 : 22}
        armR={party || startled ? -150 - Math.sin(g / 3) * 15 : g >= K.L29 ? -120 : -22}
        walk={party ? g * 0.35 : null}
        headTilt={talk("lumi", g) + (laugh ? -5 : 0)}
        blink={blinkAt(g, 1)}
      />
      <Worn L={L} g={g} glow={1} />
      <BoboRider
        g={g}
        x={B.x}
        y={B.y}
        scale={B.scale}
        look={caught && g < K.LAUGH ? { x: 0, y: 0 } : within(g, K.L28 - 10, K.CLOSE) ? lookAtPt(B, { x: GF.x, y: GF.y - 300 * GF.scale }, 300) : lookUp(B, 2)}
        expr={caught && g < K.LAUGH ? "neutral" : bMouth > 0.06 ? "excited" : laugh ? "happy" : startled ? "surprised" : party ? "excited" : "happy"}
        mouth={bMouth}
        armL={party || startled ? 100 + Math.sin(g / 2.2) * 75 : 20}
        armR={g >= K.PICK ? reachA + (caught && g >= K.LAUGH ? Math.sin(g / 2) * 6 : 0) : party || startled ? -100 + Math.sin(g / 2.7 + 1) * 75 : -20}
        lean={party ? Math.sin(g / 3.3) * 14 : g >= K.PICK && g < K.CLOSE ? 8 : 0}
        squash={party ? 1 + Math.sin(g / 1.6) * 0.06 : 1}
        walk={party ? g * 0.5 : within(g, K.L28 - 10, K.L28 + 10) ? g * 0.3 : null}
        headTilt={talk("bobo", g) + (party ? Math.sin(g / 2.5) * 10 : 0)}
        blink={caught && g < K.LAUGH ? 0.45 : blinkAt(g, 3)}
        riderArmsUp={party}
        riderHappy={laugh}
      />
      <BananaFlower x={GF.x} y={GF.y} scale={GF.scale} g={g} gold open={goldOpen} stem={120} layer="all" twitch={within(g, K.CLOSE, K.CLOSE + 12) ? 0.5 : 0} />
      <BoboBigEyes x={B.x} y={B.y} scale={B.scale} g={g} amount={within(g, K.L28 - 6, K.PICK) ? 0.9 : 0} />
      {caught && g < K.LAUGH && <IconBubble x={B.x - 180 * B.scale} y={B.y - 560 * B.scale} scale={B.scale * 0.6} kind="dots" on={ip(g, [K.CLOSE + 8, K.CLOSE + 16], [0, 1])} g={g} tail={1} />}
      {within(g, K.CLOSE, K.CLOSE + 14) && <SparkBurst f={g} at={K.CLOSE} x={paw.x} y={paw.y} reach={140} count={10} size={11} life={14} />}
      {kBack >= 1 && (
        <Kiko
          x={Kk.x}
          y={Kk.y}
          scale={Kk.scale}
          g={g}
          mood={laugh ? "joy" : g >= K.PROJECT ? "surprised" : "happy"}
          look={lookUp(Kk, 4)}
          blink={blinkAt(g, 11)}
          armL={laugh ? 120 : 20}
          armR={laugh ? -120 : -20}
          lean={laugh ? Math.sin(g * 1.3) * 7 : 0}
          headTilt={talk("kiko", g)}
          tailSwish={2}
        />
      )}
      {party && <SparkBurst f={g} at={K.PARTY + 6} x={540} y={760} reach={540} count={26} size={18} life={36} rainbow />}
      {startled && <IconBubble x={540} y={520} scale={0.9} kind="bang" on={ip(g, [K.JUMP2, K.JUMP2 + 5], [0, 1])} g={g} />}
    </GardenShot>
  );
};

export const Episode: React.FC = () => <EpisodeFrame audio="ep15/audio.wav" cuts={CUTS} scenes={[Scene0, Scene1, Scene2, Scene3, Scene4, Scene5, Scene6]} />;
