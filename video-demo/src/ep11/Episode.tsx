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
import { AirBubble, BUBBLE_FIT, Coralie, Ep6Defs, GlowShell } from "../ep06/props";
import { floorY as seaFloorY, UnderwaterKingdom } from "../ep06/world";
import { Ep7Defs } from "../ep07/props";
import { BoboBigEyes, BoboFrown, DracoBlush, Ep8Defs, Kiko, kikoHand, SweatDrop } from "../ep08/props";
import { DizzyStars, Ep9Defs, IconBubble } from "../ep09/props";
import { CaveHologram, CHAMBER_Y, SkyCity, SkyCrystal, TOWER, CRYSTAL_AT } from "../ep10/world";
import { Ep10Defs, Nimbus } from "../ep10/props";
import { ClockTowerHologram, CrystalPiece3D, LEDGE, PIECE2_AT, PIECE3_AT, PILLAR, WC_CRYSTAL, WhisperCave, WhisperCrystal } from "./world";
import { BananaFish, Bloop, CrystalPiece2D, CurrentLines, Ep11Defs, GlowCoral, Jelly2D, KIKO_FIT, MagicBubble2D, Pop2D, RisingBubbles, SeaBanana, SteamBubble } from "./props";

// Episode 11: The Secret of the Whispering Underwater Cave

const mouthAt = makeMouthAt(timeline);
export const CUTS = [0, 111, 462, 814, 1054, 1402, 1727, 2112];
const BACK = (s: number) => Easing.out(Easing.back(s));
const lerp = (a: number, b: number, k: number) => a + (b - a) * k;
const lerp3 = (a: V3, b: V3, k: number): V3 => [lerp(a[0], b[0], k), lerp(a[1], b[1], k), lerp(a[2], b[2], k)];
const up = (p: V3, h: number): V3 => [p[0], p[1] + h, p[2]];
const clamp1 = (v: number) => Math.max(-1, Math.min(1, v));
const lookAtPt = (who: { x: number; y: number }, p: { x: number; y: number }, h = 300) => ({ x: clamp1((p.x - who.x) / 260), y: clamp1((p.y - (who.y - h)) / 300) });
// natural head movement while talking (as in Episode 10)
const talk = (who: string, g: number) => Math.sin(g / 4.3 + who.length) * 4.5 * Math.min(1, mouthAt(who, g) * 3);
// a gentle underwater bob for everyone standing in the sea
const bob = (g: number, ph: number) => Math.sin(g / 14 + ph) * 0.04;

const LUMI_S = 1;
const BOBO_S = 0.91;
const DRACO_S = 1.05;
const KIKO_S = 0.8;
const NIMBUS_S = 0.85;
const CORALIE_S = 0.82;
const BLOOP_S = 0.85;
const PIECE_COLORS = ["#ff9fe0", "#a0ffd8", "#c8a0ff"];

// ---- timed moments in frames; the same numbers (in seconds) are in scripts/ep11_audio.py ----
const BUBBLE = 9;
const DEPART = 78;
const FISH = 144;
const GRAB = 198;
const L3 = 211;
const L4 = 274;
const L5 = 351;
const SPIN = 400;
const L6 = 480;
const L7 = 609;
const HIDE = 622;
const L8 = 682;
const L9 = 745;
const PEEK = 823;
const L10 = 838;
const HIC1 = 893;
const KIKO_JUMP = 926;
const KIKO_BOING = 936;
const L11 = 953;
const L12 = 1060;
const LIFT = 1178;
const PIECE1 = 1217;
const L13 = 1232;
const L14 = 1297;
const PIECE2 = 1335;
const STEAM = 1357;
const STEAM_POP = 1381;
const L15 = 1408;
const L16 = 1483;
const BREATH = 1552;
const BUBBLES = 1566;
const BOBO_LIFT = 1578;
const BOBO_DROP = 1602;
const PIECE3 = 1620;
const L17 = 1623;
const COMBINE = 1706;
const L18 = 1739;
const BANANA = 1821;
const SNATCH = 1842;
const PROJECT = 1869;
const L19 = 1881;
const END = 1982;

const Worn: React.FC<{ L: { x: number; y: number; scale: number }; g: number; glow?: number }> = ({ L, g, glow = 0.4 }) => (
  <MoonPendant x={L.x + 4 * L.scale} y={L.y - 262 * L.scale} scale={0.62 * L.scale} g={g} glow={glow} />
);
const Defs: React.FC<{ lit?: number }> = ({ lit = 1 }) => (
  <>
    <Ep4Defs />
    <Ep5Defs lit={1} />
    <Ep6Defs />
    <Ep7Defs />
    <Ep8Defs />
    <Ep9Defs />
    <Ep10Defs />
    <Ep11Defs lit={lit} />
  </>
);
type Pt = { x: number; y: number; scale: number };
// everyone's personal air bubble underwater (as in Episode 6)
const Bubbles4: React.FC<{ L?: Pt; B?: Pt; D?: Pt; K?: Pt; g: number; op?: number }> = ({ L, B, D, K, g, op = 0.55 }) => (
  <>
    {K && <AirBubble x={K.x} y={K.y} scale={K.scale} g={g} fit={KIKO_FIT} ph={4} opacity={op} />}
    {L && <AirBubble x={L.x} y={L.y} scale={L.scale} g={g} fit={BUBBLE_FIT.lumi} ph={2} opacity={op} />}
    {B && <AirBubble x={B.x} y={B.y} scale={B.scale} g={g} fit={BUBBLE_FIT.bobo} ph={1} opacity={op} />}
    {D && <AirBubble x={D.x} y={D.y} scale={D.scale} g={g} fit={BUBBLE_FIT.draco} ph={3} opacity={op} />}
  </>
);

// ---------- Scene 1a (0-3.5s): the Sky Crystal chamber; the seashell's bubble; goodbye, Nimbus ----------
const Cp = (x: number, z: number): V3 => [TOWER[0] + x, CHAMBER_Y + 0.4, TOWER[2] + z];
const A_KIKO = Cp(-1.4, 3.2);
const A_LUMI = Cp(-0.6, 3.4);
const A_BOBO = Cp(0.4, 3.6);
const A_DRACO = Cp(1.4, 3.2);
const A_NIMBUS = Cp(2.2, 4.1);
const SKY_DONE = { base: 1, waveR: 0, waveOn: 0 };

const Scene1a: React.FC = () => {
  const f = useCurrentFrame();
  const g = f;
  const t = g / 30;
  const cam = camAt(f, [
    [0, { pos: [TOWER[0] + 0.6, CHAMBER_Y + 1.6, TOWER[2] + 11.4], target: [TOWER[0] + 0.5, CHAMBER_Y + 1.6, TOWER[2] + 2.6], fov: 60 }],
    [105 + XF, { pos: [TOWER[0] + 0.6, CHAMBER_Y + 1.9, TOWER[2] + 11.0], target: [TOWER[0] + 0.5, CHAMBER_Y + 0.6, TOWER[2] + 2.6], fov: 60 }],
  ]);
  const drop = ip(f, [DEPART, DEPART + 28], [0, 1], Easing.in(Easing.quad));
  const lift = Math.sin(ip(f, [DEPART - 10, DEPART], [0, 1]) * Math.PI) * 0.15;
  const off = (p: V3): V3 => up(p, lift - drop * 9);
  const L = place(cam, off(A_LUMI), LUMI_S);
  const K = place(cam, off(A_KIKO), KIKO_S);
  const B = place(cam, off(A_BOBO), BOBO_S);
  const D = place(cam, off(A_DRACO), DRACO_S);
  const N = place(cam, A_NIMBUS, NIMBUS_S);
  const grow = ip(f, [BUBBLE, BUBBLE + 18], [0, 1], BACK(1.6));
  const mid = { x: (K.x + D.x) / 2, y: (L.y + B.y) / 2 };
  const lh = lumiHand(L.x, L.y, L.scale, -100);
  const nMouth = mouthAt("nimbus", g);
  return (
    <AbsoluteFill style={{ background: "#cfe0ff" }}>
      <World3D cam={cam} bloom={0.45} threshold={0.9}>
        <SkyCity t={t} s={SKY_DONE} vortex={0} />
        <SkyCrystal position={up(CRYSTAL_AT, 0.6)} t={t} glow={1.6} scale={1.2} />
        <CaveHologram position={[TOWER[0] - 0.6, CHAMBER_Y + 2.6, TOWER[2] + 1.9]} t={t} on={ip(f, [0, 20], [1, 0])} scale={0.6} />
        <SparkleBurst3D position={[TOWER[0] - 0.3, CHAMBER_Y + 1.6, TOWER[2] + 3.4]} age={ip(f, [BUBBLE, BUBBLE + 34], [0, 1])} reach={3} count={140} seed={51} colors={["#7fe8ff", "#ffffff", "#ff9fe0"]} />
      </World3D>
      <CharLayer defs={<Defs />} filter="skyLit">
        <Kiko x={K.x} y={K.y} scale={K.scale} g={g} mood={drop > 0 ? "surprised" : "excited"} look={{ x: 0.8, y: 0 }} blink={blinkAt(g, 11)} armL={drop > 0 ? 150 : 40} armR={-40} tailSwish={1.2} />
        <Lumi x={L.x} y={L.y} scale={L.scale} look={{ x: 0.6, y: -0.2 }} expr={drop > 0 ? "surprised" : "excited"} armR={-100} armL={drop > 0 ? 150 : 22} blink={blinkAt(g, 1)} />
        <Worn L={L} g={g} glow={0.8} />
        <GlowShell x={lh.x} y={lh.y + 18 * L.scale} scale={0.95 * L.scale} g={g} glow={1} />
        <BoboRider g={g} x={B.x} y={B.y} scale={B.scale} look={{ x: 0.5, y: -0.3 }} expr={drop > 0 ? "surprised" : "happy"} armL={drop > 0 ? 150 : 30} armR={drop > 0 ? -150 : -30} blink={blinkAt(g, 3)} riderArmsUp={drop > 0} />
        <Draco x={D.x} y={D.y} scale={D.scale} g={g} mood={drop > 0 ? "surprised" : "happy"} look={{ x: 0.6, y: 0 }} blink={blinkAt(g, 5)} wing={0.7} armsUp={drop > 0 ? 0.9 : 0.3} glow={0.45} />
        <AirBubble x={mid.x} y={mid.y} scale={L.scale} g={g} grow={grow} fit={{ cy: -300, rx: (D.x - K.x) / 2 / L.scale + 230, ry: 420 }} />
        <Nimbus x={N.x} y={N.y} scale={N.scale} g={g} mood={nMouth > 0.06 ? "happy" : "joy"} mouth={nMouth} look={{ x: -0.8, y: drop > 0.3 ? 0.8 : 0 }} blink={blinkAt(g, 7)} float={150} wave={1} tilt={talk("nimbus", g)} />
      </CharLayer>
      <AbsoluteFill style={{ background: "radial-gradient(circle at 50% 60%, #e8fbff 0%, #6fc8f0 60%, #1f78b8 100%)", opacity: ip(f, [88, 105 + XF], [0, 1], EASE) }} />
    </AbsoluteFill>
  );
};

// ---------- Scene 1b (3.5-14.6s): through the sea in the bubble; the banana fish; Draco's big swim ----------
const SEA_FULL = { base: 1, waveR: 0, waveOn: 0 };
const S1 = { fish: FISH - CUTS[1], grab: GRAB - CUTS[1], l3: L3 - CUTS[1], l4: L4 - CUTS[1], l5: L5 - CUTS[1], spin: SPIN - CUTS[1] };
const travel = (f: number): V3 => lerp3([9, 4.6, 10], [-6, 3.4, -1], ip(f, [0, 333], [0, 1]));

const Scene1b: React.FC = () => {
  const f = useCurrentFrame();
  const g = f + CUTS[1];
  const t = g / 30;
  const c = travel(f);
  const cam: Cam3 = { pos: [c[0] + 0.9, c[1] + 0.7, c[2] + 7.6], target: [c[0] - 0.05, c[1] - 0.15, c[2]], fov: 52 };
  const rel = (dx: number, dy: number, dz = 0): V3 => [c[0] + dx, c[1] + dy, c[2] + dz];
  const swimK = f >= S1.l5 && f < S1.spin ? Math.sin(f / 2) : 0;
  const K = place(cam, rel(-1.3, -0.9 + Math.sin(g / 12) * 0.05, -0.1), KIKO_S);
  const L = place(cam, rel(-0.45, -0.95 + Math.sin(g / 12 + 1) * 0.05), LUMI_S);
  const lunge = ip(f, [S1.grab - 6, S1.grab, S1.grab + 18, S1.grab + 30], [0, 1, 1, 0]);
  const B = place(cam, rel(0.45 + lunge * 0.35, -0.95 + Math.sin(g / 12 + 2) * 0.05, 0.1), BOBO_S);
  const D = place(cam, rel(1.35, -0.9 + Math.sin(g / 12 + 3) * 0.05 + swimK * 0.05, -0.1), DRACO_S);
  const ctr = screen(cam, rel(0, -0.95));
  const spinAng = ip(f, [S1.spin, S1.spin + 50], [0, 360], EASE);
  const dizzy = f >= S1.spin + 50;
  const fishK = ip(f, [S1.fish, S1.grab], [0, 1]);
  const fishX = f < S1.grab ? lerp(ctr.x + 760, B.x + 230 * B.scale, fishK) : lerp(B.x + 230 * B.scale, ctr.x - 900, ip(f, [S1.grab, S1.grab + 14], [0, 1], Easing.in(Easing.quad)));
  const fishY = B.y - 300 * B.scale + Math.sin(f / 5) * 20;
  const reaching = f >= S1.fish + 8 && f < S1.grab + 20;
  const squish = ip(f, [S1.grab, S1.grab + 3, S1.grab + 14], [1, 0.82, 1]);
  const kLaugh = f >= S1.l3 && f < S1.l4 + 10;
  const grumpy = f >= S1.l4 && f < S1.l5;
  return (
    <AbsoluteFill style={{ background: "#0b4f86" }}>
      <World3D cam={cam} bloom={0.6} threshold={0.82}>
        <UnderwaterKingdom t={t} s={SEA_FULL} camPos={cam.pos} pearlHome={1} fishHappy={1} jellySparkle={0.6} />
      </World3D>
      <CharLayer defs={<Defs />} filter="caveLit">
        <g transform={`rotate(${spinAng} ${ctr.x} ${ctr.y - 300 * L.scale})`}>
          <Kiko
            x={K.x}
            y={K.y}
            scale={K.scale}
            g={g}
            mood={kLaugh ? "joy" : dizzy ? "surprised" : "excited"}
            mouth={kLaugh ? 0 : mouthAt("kiko", g)}
            look={{ x: 0.8, y: -0.2 }}
            blink={blinkAt(g, 11)}
            armL={kLaugh ? 70 + Math.sin(f) * 14 : 30}
            armR={kLaugh ? -70 - Math.sin(f) * 14 : f >= S1.l3 - 4 && f < S1.l3 + 20 ? -100 : -30}
            lean={kLaugh ? Math.sin(f * 1.3) * 8 : 0}
            squash={kLaugh ? 1 + Math.sin(f * 2.2) * 0.04 : 1}
            tailSwish={1.2}
          />
          <Lumi x={L.x} y={L.y} scale={L.scale} look={reaching ? lookAtPt(L, { x: fishX, y: fishY }, 300) : { x: 0.3, y: -0.2 }} expr={dizzy ? "surprised" : kLaugh ? "happy" : "excited"} armR={-30} armL={22} headTilt={kLaugh ? -5 : 0} blink={blinkAt(g, 1)} />
          <Worn L={L} g={g} />
          <BoboRider
            g={g}
            x={B.x}
            y={B.y}
            scale={B.scale}
            look={reaching ? lookAtPt(B, { x: fishX, y: fishY }, 300) : grumpy ? { x: -0.7, y: 0 } : { x: 0.3, y: -0.2 }}
            expr={grumpy ? (mouthAt("bobo", g) > 0.06 ? "effort" : "neutral") : f >= S1.grab && f < S1.grab + 20 ? "surprised" : reaching ? "excited" : "happy"}
            mouth={mouthAt("bobo", g)}
            armL={reaching ? 40 : grumpy ? 20 : 30}
            armR={reaching ? -120 - lunge * 30 : grumpy ? -20 : -30}
            lean={lunge * 14}
            squash={squish}
            headTilt={talk("bobo", g)}
            blink={blinkAt(g, 3)}
            riderLook={{ x: 0.6, y: -0.2 }}
          />
          <BoboBigEyes x={B.x} y={B.y} scale={B.scale} g={g} amount={reaching && f < S1.grab ? 0.8 : 0} />
          {grumpy && <BoboFrown x={B.x} y={B.y} scale={B.scale} tilt={6} />}
          <Draco
            x={D.x}
            y={D.y}
            scale={D.scale}
            g={g}
            mood={dizzy ? "surprised" : f >= S1.l5 ? "excited" : "happy"}
            mouth={mouthAt("draco", g)}
            look={{ x: -0.4, y: -0.2 }}
            blink={blinkAt(g, 5)}
            wing={f >= S1.l5 ? 1 : 0.5}
            flap={f >= S1.l5 && f < S1.spin + 50 ? Math.sin(f * 0.9) * 28 : 0}
            armsUp={f >= S1.l5 && f < S1.spin + 50 ? 0.5 + swimK * 0.4 : 0.3}
            headTilt={talk("draco", g)}
            glow={0.45}
          />
          <AirBubble x={ctr.x} y={ctr.y} scale={L.scale} g={g} fit={{ cy: -300, rx: (D.x - K.x) / 2 / L.scale + 230, ry: 420 }} />
        </g>
        {dizzy && <DizzyStars x={D.x} y={D.y - 420 * D.scale} scale={D.scale} on={ip(f, [S1.spin + 50, S1.spin + 56], [0, 1])} g={g} />}
        {f >= S1.fish && f < S1.grab + 16 && <BananaFish x={fishX} y={fishY} scale={B.scale * 1.8} g={g} dir={-1} />}
        <RisingBubbles x={ctr.x} y={ctr.y + 80} g={g} scale={L.scale} count={10} spread={700} seed="trip" />
      </CharLayer>
      <AbsoluteFill style={{ background: "radial-gradient(circle at 50% 40%, #e8fbff 0%, #6fc8f0 60%, #1f78b8 100%)", opacity: ip(f, [0, 16], [1, 0], EASE) }} />
    </AbsoluteFill>
  );
};

// ---------- Scene 2 (14.6-25.5s): Coralie at the cave mouth; the whispers; Draco's "dancing" wings ----------
const sp = (x: number, z: number): V3 => [x, seaFloorY(x, z), z];
const M_KIKO = sp(-19.3, -10.4);
const M_LUMI = sp(-18.3, -10.1);
const M_BOBO = sp(-17.3, -10.0);
const M_DRACO = sp(-16.3, -10.3);
const M_CORALIE: V3 = up(sp(-17.8, -11.6), 0.75);
const M_BOBO_HIDE = sp(-16.45, -10.65);
const S2 = { l6: L6 - CUTS[2], l7: L7 - CUTS[2], hide: HIDE - CUTS[2], l8: L8 - CUTS[2], l9: L9 - CUTS[2] };

const Scene2: React.FC = () => {
  const f = useCurrentFrame();
  const g = f + CUTS[2];
  const t = g / 30;
  const cam = camAt(f, [
    [0, { pos: [-17.0, 1.7, -3.2], target: [-18.4, 1.6, -13.5], fov: 50 }],
    [S2.l7 - 4, { pos: [-17.1, 1.65, -3.8], target: [-18.4, 1.6, -13.5], fov: 50 }],
    [S2.l7 + 40, { pos: [-17.3, 1.9, -4.6], target: [-18.6, 1.6, -14.0], fov: 50 }],
    [S2.l8 - 1, { pos: [-17.3, 1.9, -4.8], target: [-18.6, 1.6, -14.0], fov: 50 }],
    [S2.l8, { pos: [-16.6, 1.2, -5.9], target: [-16.9, 1.1, -10.3], fov: 46 }],
    [327 + XF, { pos: [-16.6, 1.2, -6.2], target: [-16.9, 1.1, -10.3], fov: 46 }],
  ]);
  const swimIn = ip(f, [0, 30], [0, 1], Easing.out(Easing.cubic));
  const C = place(cam, lerp3(up(M_CORALIE, 1.5), M_CORALIE, swimIn), CORALIE_S);
  const L = place(cam, up(M_LUMI, bob(g, 1)), LUMI_S);
  const K = place(cam, lerp3(up(M_KIKO, bob(g, 2)), sp(-17.25, -10.0), ip(f, [S2.l8 - 14, S2.l8 + 2], [0, 1], EASE)), KIKO_S);
  const hidK = ip(f, [S2.hide, S2.hide + 10], [0, 1], EASE);
  const B = place(cam, lerp3(up(M_BOBO, bob(g, 3)), M_BOBO_HIDE, hidK), BOBO_S);
  const D = place(cam, up(M_DRACO, bob(g, 4)), DRACO_S);
  const scared = f >= S2.l7;
  const shake = scared ? Math.sin(f * 2.4) * 22 : 0;
  const cave = screen(cam, [-21.2, 1.5, -16.6]);
  const whisper = ip(f, [S2.l7 - 6, S2.l7 + 6, S2.l8 - 6, S2.l8 + 6], [0, 1, 1, 0]);
  const cMouth = mouthAt("coralie", g);
  const lookCave = (who: Pt) => lookAtPt(who, cave, 330);
  const lookD = (who: Pt) => lookAtPt(who, { x: D.x, y: D.y - 250 * D.scale }, 300);
  return (
    <AbsoluteFill style={{ background: "#0b4f86", opacity: ip(f, [0, XF], [0, 1]) }}>
      <World3D cam={cam} bloom={0.6} threshold={0.82}>
        <UnderwaterKingdom t={t} s={SEA_FULL} camPos={cam.pos} pearlHome={1} fishHappy={0.6} jellySparkle={0.4} />
      </World3D>
      <CharLayer defs={<Defs />} filter="caveLit">
        {/* the whispers drifting out of the cave */}
        {whisper > 0 &&
          [0, 1, 2].map((i) => {
            const k = (f / 40 + i / 3) % 1;
            return <path key={i} d={`M ${cave.x - 60} ${cave.y + i * 30} q ${80 + k * 200} ${-40} ${160 + k * 300} ${20} t ${160} 0`} stroke="#c8f0ff" strokeWidth={6} fill="none" strokeLinecap="round" opacity={whisper * (1 - k) * 0.8} />;
          })}
        {whisper > 0 && <circle cx={cave.x} cy={cave.y} r={120} fill="url(#pieceGlow)" opacity={whisper * 0.35 * (0.7 + 0.3 * Math.sin(f / 4))} />}
        <Coralie x={C.x} y={C.y} scale={C.scale} g={g} mood={scared ? "worried" : cMouth > 0.06 ? "happy" : "joy"} mouth={cMouth} look={scared ? lookCave(C) : { x: 0.6, y: 0 }} blink={blinkAt(g, 9)} armL={f < S2.l7 && f >= S2.l6 ? 40 + Math.sin(f / 5) * 15 : 12} armR={f < 30 ? -120 : -12} swim={1} headTilt={talk("coralie", g)} />
        <Kiko x={K.x} y={K.y} scale={K.scale} g={g} mood={f >= S2.l8 ? "happy" : scared ? "surprised" : "excited"} mouth={mouthAt("kiko", g)} look={f >= S2.l8 ? lookD(K) : scared ? lookCave(K) : { x: -0.5, y: 0 }} blink={blinkAt(g, 11)} armL={f >= S2.l8 && f < S2.l9 ? 140 : 20} armR={-20} lean={f >= S2.l8 && f < S2.l9 ? 10 : 0} headTilt={talk("kiko", g)} tailSwish={1} />
        <Lumi x={L.x} y={L.y} scale={L.scale} look={scared ? lookCave(L) : { x: -0.7, y: 0 }} expr={scared ? "surprised" : "happy"} armR={-22} armL={22} blink={blinkAt(g, 1)} />
        <Worn L={L} g={g} />
        {/* Bobo slips behind Draco: drawn first so Draco covers him, ears and eyes peeking */}
        <BoboRider g={g} x={B.x} y={B.y} scale={B.scale} look={scared ? lookCave(B) : { x: -0.6, y: 0 }} expr={scared ? "surprised" : "happy"} mouth={0} armL={hidK > 0.5 ? 150 : 20} armR={hidK > 0.5 ? -150 : -20} blink={blinkAt(g, 3)} riderArmsUp={hidK > 0.5} />
        {hidK > 0.5 && f < S2.l9 && <SweatDrop x={B.x - 120 * B.scale} y={B.y - 380 * B.scale} scale={B.scale} g={g} />}
        <Draco
          x={D.x}
          y={D.y}
          scale={D.scale}
          g={g}
          mood={f >= S2.l9 ? "excited" : scared ? "surprised" : "happy"}
          mouth={mouthAt("draco", g)}
          look={f >= S2.l9 ? { x: -0.3, y: -0.2 } : scared ? lookCave(D) : { x: -0.6, y: 0 }}
          blink={blinkAt(g, 5)}
          wing={scared ? 0.9 : 0.5}
          flap={shake}
          armsUp={f >= S2.l9 ? 0.9 : 0.2}
          breath={f >= S2.l9 ? 0.7 : 0}
          lean={scared ? Math.sin(f * 2.4) * 2 : 0}
          headTilt={talk("draco", g)}
          glow={0.45}
        />
        {f >= S2.l9 + 20 && <DracoBlush x={D.x} y={D.y} scale={D.scale} amount={0.7} />}
        <Bubbles4 L={L} B={B} D={D} K={K} g={g} />
        {f >= S2.l8 && f < S2.l9 && <IconBubble x={D.x + 170 * D.scale} y={D.y - 560 * D.scale} scale={D.scale * 0.7} kind="music" on={ip(f, [S2.l8 + 8, S2.l8 + 14], [0, 1])} g={g} />}
        <RisingBubbles x={540} y={1500} g={g} scale={1} count={8} spread={900} seed="mouth" />
      </CharLayer>
    </AbsoluteFill>
  );
};

// ---------- Scenes 3-6 take place inside the Whispering Cave ----------
const cv = (x: number, z: number): V3 => [x, 0, z];
const K0 = cv(-2.4, 2.3);
const L0 = cv(-1.2, 2.7);
const D0 = cv(0.0, 2.5);
const B0 = cv(1.1, 3.0);
const BL0 = cv(2.35, 2.2);
const CO0: V3 = [-0.55, 0.65, 1.3];

const CaveShot: React.FC<{ cam: Cam3; G: number; alive: number; world?: React.ReactNode; children: React.ReactNode; over?: React.ReactNode; fade?: boolean }> = ({ cam, G, alive, world, children, over, fade = true }) => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill style={{ background: "#0a2048", opacity: fade ? ip(f, [0, XF], [0, 1]) : 1 }}>
      <World3D cam={cam} bloom={0.75} threshold={0.75}>
        <WhisperCave t={G / 30} alive={alive} />
        {world}
      </World3D>
      <CharLayer defs={<Defs lit={0.92 + alive * 0.16} />} filter="caveLit">
        {children}
      </CharLayer>
      {over}
    </AbsoluteFill>
  );
};

// ---------- Scene 3 (25.5-33.1s): Bloop; a hiccup; Bobo in a bubble ----------
const S3 = { peek: PEEK - CUTS[3], l10: L10 - CUTS[3], hic: HIC1 - CUTS[3], jump: KIKO_JUMP - CUTS[3], boing: KIKO_BOING - CUTS[3], l11: L11 - CUTS[3] };

const Scene3: React.FC = () => {
  const f = useCurrentFrame();
  const g = f + CUTS[3];
  const cam = camAt(f, [
    [0, { pos: [1.6, 0.85, 6.6], target: [1.6, 0.8, 2.4], fov: 48 }],
    [S3.hic - 1, { pos: [1.55, 0.85, 6.4], target: [1.6, 0.8, 2.4], fov: 48 }],
    [S3.hic, { pos: [0.2, 1.5, 8.6], target: [0.3, 1.5, 2.2], fov: 54 }],
    [228 + XF, { pos: [0.2, 1.7, 8.2], target: [0.3, 1.9, 2.2], fov: 54 }],
  ]);
  const L = place(cam, up(L0, bob(g, 1)), LUMI_S);
  const D = place(cam, up(D0, bob(g, 4)), DRACO_S);
  const BLb = place(cam, BL0, BLOOP_S);
  const rise = ip(f, [S3.peek, S3.peek + 12], [0, 1], BACK(1.4));
  // Bobo, swallowed by the hiccup bubble, floats up and turns upside down
  const trap = ip(f, [S3.hic + 4, S3.hic + 12], [0, 1]);
  const floatK = ip(f, [S3.hic + 12, S3.hic + 45], [0, 1], EASE);
  const bP = up(B0, floatK * 1.5 + (floatK > 0 ? Math.sin(f / 9) * 0.06 : 0));
  const B = place(cam, bP, BOBO_S);
  const flip = ip(f, [S3.hic + 14, S3.hic + 34], [0, 180], EASE);
  const bubC = { x: B.x, y: B.y - 220 * B.scale };
  const bubR = 330 * B.scale * ip(f, [S3.hic, S3.hic + 10], [0.1, 1], BACK(1.5));
  const bubFrom = { x: BLb.x, y: BLb.y - 130 * BLb.scale };
  const bubPos = f < S3.hic + 10 ? { x: lerp(bubFrom.x, bubC.x, ip(f, [S3.hic, S3.hic + 10], [0, 1])), y: lerp(bubFrom.y, bubC.y, ip(f, [S3.hic, S3.hic + 10], [0, 1])) } : bubC;
  // Kiko leaps at the bubble, boings off and tumbles back
  const kJump = ip(f, [S3.jump, S3.boing], [0, 1], Easing.out(Easing.quad));
  const kBack = ip(f, [S3.boing, S3.boing + 18], [0, 1], Easing.out(Easing.quad));
  const kP: V3 = f < S3.jump ? up(K0, bob(g, 2)) : f < S3.boing ? up(lerp3(K0, [B0[0] - 0.7, 0, B0[2]], kJump), Math.sin(kJump * Math.PI * 0.5) * 1.2) : up(lerp3([B0[0] - 0.7, 0, B0[2]], [K0[0] - 0.6, 0, K0[2]], kBack), Math.sin((1 - kBack) * Math.PI * 0.5) * 1.2 * (1 - kBack));
  const K = place(cam, kP, KIKO_S);
  const kTumble = f >= S3.boing && f < S3.boing + 18 ? kBack * 360 : 0;
  const bMouth = mouthAt("bloop", g);
  const hic = f >= S3.hic - 2 && f < S3.hic + 6;
  const bloopMood = hic ? "hic" : f >= S3.hic + 6 ? "nervous" : bMouth > 0.06 ? "shy" : rise < 1 ? "shy" : "happy";
  const lookBub = (who: Pt) => (f >= S3.hic ? lookAtPt(who, bubPos, 300) : lookAtPt(who, { x: BLb.x, y: BLb.y - 150 * BLb.scale }, 300));
  return (
    <CaveShot cam={cam} G={g} alive={0.15}>
      <Lumi x={L.x} y={L.y} scale={L.scale} look={lookBub(L)} expr={f >= S3.hic ? "surprised" : "excited"} armR={-30} armL={f >= S3.hic + 10 ? 120 : 22} blink={blinkAt(g, 1)} />
      <Worn L={L} g={g} />
      <Draco x={D.x} y={D.y} scale={D.scale} g={g} mood={f >= S3.hic ? "surprised" : "happy"} look={lookBub(D)} blink={blinkAt(g, 5)} wing={0.6} glow={0.45} />
      <Bubbles4 L={L} D={D} g={g} />
      <g transform={`rotate(${kTumble} ${K.x} ${K.y - 200 * K.scale})`}>
        <Kiko x={K.x} y={K.y} scale={K.scale} g={g} mood={f >= S3.boing ? "surprised" : f >= S3.jump ? "excited" : f >= S3.hic ? "joy" : "happy"} look={lookBub(K)} blink={blinkAt(g, 11)} armL={f >= S3.jump && f < S3.boing + 18 ? 160 : 30} armR={f >= S3.jump && f < S3.boing + 18 ? -160 : -30} legs={f >= S3.jump && f < S3.boing + 18 ? 1 : 0} tailSwish={1.4} />
        <AirBubble x={K.x} y={K.y} scale={K.scale} g={g} fit={KIKO_FIT} ph={4} opacity={0.55} />
      </g>
      {/* Bobo: in his air bubble until the hiccup bubble swallows him */}
      <g transform={`rotate(${flip} ${B.x} ${B.y - 200 * B.scale})`}>
        <BoboRider
          g={g}
          x={B.x}
          y={B.y}
          scale={B.scale}
          look={f >= S3.l11 ? { x: 0, y: 0.6 } : lookBub(B)}
          expr={f >= S3.hic ? (mouthAt("bobo", g) > 0.06 ? "effort" : "surprised") : "happy"}
          mouth={mouthAt("bobo", g)}
          armL={f >= S3.hic + 10 ? 140 + Math.sin(f / 2) * 20 : 20}
          armR={f >= S3.hic + 10 ? -140 - Math.sin(f / 2) * 20 : -20}
          headTilt={talk("bobo", g)}
          blink={blinkAt(g, 3)}
          riderArmsUp={f >= S3.hic + 10}
        />
      </g>
      {trap < 0.5 && <AirBubble x={B.x} y={B.y} scale={B.scale} g={g} fit={BUBBLE_FIT.bobo} ph={1} opacity={0.55} />}
      {f >= S3.hic && <MagicBubble2D x={bubPos.x} y={bubPos.y} rx={bubR} g={g} wobble={f >= S3.boing && f < S3.boing + 10 ? 6 : 1.5} />}
      <Bloop x={BLb.x} y={BLb.y} scale={BLb.scale} g={g} mood={bloopMood} mouth={bMouth} look={f >= S3.hic ? lookBub(BLb) : { x: -0.7, y: 0 }} blink={blinkAt(g, 15)} float={20 + rise * 110} squash={hic ? 0.85 : 1} tilt={talk("bloop", g)} wave={f >= S3.l10 && f < S3.l10 + 30 ? 1 : 0} />
      {rise < 1 && <GlowCoral x={BLb.x} y={BLb.y} scale={BLb.scale * 1.1} g={g} glow={0.8} />}
      {f >= S3.boing && f < S3.boing + 12 && <Sparkle x={bubPos.x - bubR} y={bubPos.y} size={50} color="#ffffff" rotate={f * 8} />}
      {f >= S3.hic && f < S3.hic + 20 && <IconBubble x={BLb.x + 120 * BLb.scale} y={BLb.y - 420 * BLb.scale} scale={0.5} kind="bang" on={ip(f, [S3.hic, S3.hic + 5], [0, 1])} g={g} />}
    </CaveShot>
  );
};

// ---------- Scene 4 (33.1-44.2s): the Whisper Crystal; the first piece; a jellyfish; a steam bubble ----------
const S4 = { l12: L12 - CUTS[4], lift: LIFT - CUTS[4], p1: PIECE1 - CUTS[4], l13: L13 - CUTS[4], l14: L14 - CUTS[4], p2: PIECE2 - CUTS[4], steam: STEAM - CUTS[4], pop: STEAM_POP - CUTS[4] };

const Scene4: React.FC = () => {
  const f = useCurrentFrame();
  const g = f + CUTS[4];
  const t = g / 30;
  const cam = camAt(f, [
    [0, { pos: [0.2, 1.7, 8.6], target: [0, 1.5, -1.2], fov: 54 }],
    [S4.lift - 1, { pos: [0.1, 1.7, 8.2], target: [0, 1.5, -1.2], fov: 54 }],
    [S4.lift, { pos: [-1.6, 1.8, 5.4], target: [-2.8, 2.0, -0.8], fov: 54 }],
    [S4.l13 - 1, { pos: [-1.7, 2.3, 5.2], target: [-3.0, 2.4, -1.2], fov: 54 }],
    [S4.l13, { pos: [-2.1, 1.05, 6.4], target: [-2.4, 0.95, 2.0], fov: 46 }],
    [S4.steam - 3, { pos: [-2.1, 1.05, 6.2], target: [-2.4, 0.95, 2.0], fov: 46 }],
    [S4.steam - 2, { pos: [0.4, 1.1, 5.6], target: [0.1, 1.1, 2.5], fov: 44 }],
    [333 + XF, { pos: [0.4, 1.1, 5.4], target: [0.1, 1.1, 2.5], fov: 44 }],
  ]);
  // Lumi rides a hiccup bubble up to the ledge and takes the first piece
  const liftK = ip(f, [S4.lift + 4, S4.p1], [0, 1], EASE);
  const lumiP: V3 = f < S4.lift ? up(L0, bob(g, 1)) : lerp3(L0, [LEDGE[0] + 0.6, LEDGE[1] - 0.2, LEDGE[2] + 0.9], liftK);
  const L = place(cam, lumiP, LUMI_S);
  const K = place(cam, up(f >= S4.l13 ? cv(-2.6, 2.0) : K0, bob(g, 2)), KIKO_S);
  const D = place(cam, up(D0, bob(g, 4)), DRACO_S);
  const B = place(cam, up(B0, bob(g, 3)), BOBO_S);
  const C = place(cam, CO0, CORALIE_S);
  const BLb = place(cam, BL0, BLOOP_S);
  const lh = lumiHand(L.x, L.y, L.scale, -130);
  const haveP1 = f >= S4.p1;
  const kh = kikoHand(K.x, K.y, K.scale, -150);
  const jellyHeld = f >= S4.l13 - 6 && f < S4.p2;
  const jellyAway = ip(f, [S4.p2, S4.p2 + 20], [0, 1], EASE);
  const p2 = screen(cam, PIECE2_AT);
  const haveP2 = f >= S4.p2 + 6;
  const dm = { x: D.x, y: D.y - 168 * D.scale };
  const steamAge = ip(f, [S4.steam, S4.pop], [0, 0.98]);
  const popped = f >= S4.pop;
  const cMouth = mouthAt("coralie", g);
  const kMouth = mouthAt("kiko", g);
  const WCs = screen(cam, WC_CRYSTAL);
  return (
    <CaveShot
      cam={cam}
      G={g}
      alive={0.15}
      world={
        <>
          <WhisperCrystal t={t} glow={0.05} pieces={0} />
          {!haveP1 && <CrystalPiece3D position={LEDGE} t={t} color={PIECE_COLORS[0]} />}
          <CrystalPiece3D position={PIECE3_AT} t={t} color={PIECE_COLORS[2]} glow={0.8} />
        </>
      }
    >
      {f < S4.l13 && (
        <>
          <Coralie x={C.x} y={C.y} scale={C.scale} g={g} mood={cMouth > 0.06 ? "worried" : "happy"} mouth={cMouth} look={lookAtPt(C, WCs, 300)} blink={blinkAt(g, 9)} armR={f >= S4.l12 + 20 && f < S4.lift ? -110 : -12} swim={0.6} headTilt={talk("coralie", g)} />
          <BoboRider g={g} x={B.x} y={B.y} scale={B.scale} look={lookAtPt(B, L, 300)} expr="surprised" armL={20} armR={-20} blink={blinkAt(g, 3)} />
          <Draco x={D.x} y={D.y} scale={D.scale} g={g} mood="surprised" look={lookAtPt(D, L, 300)} blink={blinkAt(g, 5)} wing={0.6} glow={0.45} />
          <Bloop x={BLb.x} y={BLb.y} scale={BLb.scale} g={g} mood={f >= S4.lift - 2 && f < S4.lift + 6 ? "hic" : "happy"} look={lookAtPt(BLb, L, 300)} blink={blinkAt(g, 15)} float={110} />
          <Bubbles4 B={B} D={D} g={g} />
        </>
      )}
      {(f < S4.l13 || f >= S4.steam - 2) && f < S4.steam - 2 && (
        <>
          <Lumi x={L.x} y={L.y} scale={L.scale} look={f >= S4.lift ? { x: -0.6, y: -0.5 } : lookAtPt(L, WCs, 300)} expr={haveP1 ? "excited" : f >= S4.lift ? "surprised" : "happy"} armR={haveP1 || liftK > 0.7 ? -130 : -30} armL={22} blink={blinkAt(g, 1)} />
          <Worn L={L} g={g} />
          {f >= S4.lift ? <MagicBubble2D x={L.x} y={L.y - 240 * L.scale} rx={300 * L.scale} ry={360 * L.scale} g={g} /> : <AirBubble x={L.x} y={L.y} scale={L.scale} g={g} fit={BUBBLE_FIT.lumi} ph={2} opacity={0.55} />}
          {haveP1 && <CrystalPiece2D x={lh.x} y={lh.y} scale={L.scale * 0.8} g={g} color={PIECE_COLORS[0]} />}
          <SparkBurst f={f} at={S4.p1} x={lh.x} y={lh.y} reach={180} count={14} size={12} life={20} />
        </>
      )}
      {f >= S4.l13 && f < S4.steam - 2 && (
        <>
          {/* Kiko proudly shows off his "crystal" */}
          <Coralie x={place(cam, [-1.4, 0.3, 1.4], CORALIE_S).x} y={place(cam, [-1.4, 0.3, 1.4], CORALIE_S).y} scale={place(cam, [-1.4, 0.3, 1.4], CORALIE_S).scale} g={g} mood={f >= S4.l14 ? (cMouth > 0.06 ? "surprised" : "happy") : "surprised"} mouth={cMouth} look={{ x: -0.8, y: -0.3 }} blink={blinkAt(g, 9)} armR={f >= S4.l14 && f < S4.p2 ? -100 : -12} armL={12} swim={0.6} headTilt={talk("coralie", g)} />
          <Kiko x={K.x} y={K.y} scale={K.scale} g={g} mood={f >= S4.l14 + 10 && f < S4.p2 ? "surprised" : haveP2 ? "joy" : kMouth > 0.06 ? "excited" : "happy"} mouth={kMouth} look={{ x: 0.6, y: -0.4 }} blink={blinkAt(g, 11)} armL={20} armR={jellyHeld ? -150 : haveP2 ? -140 : -20} headTilt={talk("kiko", g)} tailSwish={1.3} />
          <AirBubble x={K.x} y={K.y} scale={K.scale} g={g} fit={KIKO_FIT} ph={4} opacity={0.55} />
          {f < S4.p2 + 20 && <Jelly2D x={jellyHeld ? kh.x : lerp(kh.x, kh.x + 400, jellyAway)} y={jellyHeld ? kh.y - 150 * K.scale : lerp(kh.y - 150 * K.scale, kh.y - 700, jellyAway)} scale={K.scale * 2.0} g={g} />}
          {f >= S4.l14 + 10 && f < S4.p2 && <Sparkle x={K.x} y={K.y - 470 * K.scale} size={30} color="#ff9fe0" rotate={f * 9} />}
          {!haveP2 && f >= S4.p2 && <CrystalPiece2D x={p2.x} y={p2.y} scale={0.5} g={g} color={PIECE_COLORS[1]} />}
          {haveP2 && <CrystalPiece2D x={kh.x} y={kh.y} scale={K.scale * 0.8} g={g} color={PIECE_COLORS[1]} />}
          <SparkBurst f={f} at={S4.p2 + 6} x={kh.x} y={kh.y} reach={180} count={14} size={12} life={20} />
          {f >= S4.l14 && f < S4.p2 && <IconBubble x={K.x + 150 * K.scale} y={K.y - 600 * K.scale} scale={K.scale * 0.7} kind="x" on={ip(f, [S4.l14 + 4, S4.l14 + 10], [0, 1])} g={g} />}
        </>
      )}
      {f >= S4.steam - 2 && (
        <>
          {/* Draco shows off: his mighty fireball is one tiny steam bubble */}
          <Draco
            x={D.x}
            y={D.y}
            scale={D.scale}
            g={g}
            mood={popped ? (f > S4.pop + 6 ? "neutral" : "surprised") : f < S4.steam + 4 ? "effort" : "excited"}
            look={popped ? { x: 0, y: -0.4 } : { x: -0.2, y: -0.8 }}
            blink={popped && f < S4.pop + 4 ? 0.1 : blinkAt(g, 5)}
            wing={popped ? 0.3 : 1}
            armsUp={popped ? 0.1 : 0.9}
            breath={f < S4.steam + 2 ? 0.9 : 0}
            squash={popped ? ip(f, [S4.pop, S4.pop + 3, S4.pop + 8], [1, 0.88, 1]) : 1}
            glow={0.45}
          />
          <AirBubble x={D.x} y={D.y} scale={D.scale} g={g} fit={BUBBLE_FIT.draco} ph={3} opacity={0.55} />
          <SteamBubble from={dm} scale={D.scale} age={steamAge} g={g} />
          <Pop2D x={dm.x - 20 * D.scale} y={dm.y - 60 * D.scale} r={30 * D.scale} age={ip(f, [S4.pop, S4.pop + 10], [0, 1])} />
          {popped && <DracoBlush x={D.x} y={D.y} scale={D.scale} amount={ip(f, [S4.pop + 6, S4.pop + 16], [0, 0.8])} />}
        </>
      )}
    </CaveShot>
  );
};

// ---------- Scene 5 (44.2-54.6s): the current; Bloop's brave bubbles; Bobo lands on Draco ----------
const S5 = { l15: L15 - CUTS[5], l16: L16 - CUTS[5], breath: BREATH - CUTS[5], bubbles: BUBBLES - CUTS[5], lift: BOBO_LIFT - CUTS[5], drop: BOBO_DROP - CUTS[5], p3: PIECE3 - CUTS[5], l17: L17 - CUTS[5], combine: COMBINE - CUTS[5] };
const P5_LUMI = cv(1.5, 1.6);
const P5_BLOOP = cv(2.45, 1.3);
const P5_DRACO = cv(0.4, 1.8);
const P5_KIKO = cv(-0.7, 1.5);
const P5_BOBO = cv(-0.2, 2.6);

const Scene5: React.FC = () => {
  const f = useCurrentFrame();
  const g = f + CUTS[5];
  const t = g / 30;
  const cam = camAt(f, [
    [0, { pos: [2.2, 1.0, 5.2], target: [2.0, 0.9, 1.4], fov: 44 }],
    [S5.breath - 1, { pos: [2.2, 1.0, 5.0], target: [2.0, 0.9, 1.4], fov: 44 }],
    [S5.breath, { pos: [1.5, 2.3, 7.6], target: [2.2, 3.0, 0.0], fov: 56 }],
    [S5.drop + 4, { pos: [1.4, 2.4, 7.3], target: [2.1, 3.1, 0.0], fov: 56 }],
    [S5.drop + 5, { pos: [0.4, 1.3, 5.6], target: [0.3, 1.3, 1.8], fov: 46 }],
    [S5.combine - 1, { pos: [0.4, 1.3, 5.3], target: [0.3, 1.3, 1.8], fov: 46 }],
    [S5.combine, { pos: [0.0, 1.6, 7.6], target: [0.0, 1.7, -2.5], fov: 50 }],
    [312 + XF, { pos: [0.0, 1.6, 7.3], target: [0.0, 1.7, -2.5], fov: 50 }],
  ]);
  const L = place(cam, up(P5_LUMI, bob(g, 1)), LUMI_S);
  const BLb = place(cam, P5_BLOOP, BLOOP_S);
  const D = place(cam, up(P5_DRACO, bob(g, 4)), DRACO_S);
  const K = place(cam, up(P5_KIKO, bob(g, 2)), KIKO_S);
  // Bobo: a bubble lifts him, pops, and he lands on Draco's head
  const liftK = ip(f, [S5.lift, S5.drop - 4], [0, 1], EASE);
  const fallK = ip(f, [S5.drop - 4, S5.drop], [0, 1], Easing.in(Easing.quad));
  const onDraco = f >= S5.drop;
  const bHigh: V3 = [P5_DRACO[0], 2.6, P5_DRACO[2] + 0.05];
  const bP: V3 = f < S5.lift ? up(P5_BOBO, bob(g, 3)) : f < S5.drop - 4 ? lerp3(P5_BOBO, bHigh, liftK) : f < S5.drop ? lerp3(bHigh, up(P5_DRACO, 1.0), fallK) : up(P5_DRACO, 1.0);
  const B = place(cam, bP, BOBO_S);
  const P3 = screen(cam, PIECE3_AT);
  const bMouth = mouthAt("bloop", g);
  const nervous = f < S5.l16 + 30;
  const puff = ip(f, [S5.breath, S5.bubbles - 2, S5.bubbles + 4], [0, 1, 0.2]);
  const blowing = f >= S5.bubbles && f < S5.p3 + 10;
  const from = { x: BLb.x, y: BLb.y - 140 * BLb.scale };
  const chain = (i: number) => {
    const k = ((f - S5.bubbles) / 40 + i / 6) % 1;
    const tgt = { x: P3.x, y: P3.y };
    return { x: lerp(from.x, tgt.x, k) + Math.sin(k * 6 + i) * 30, y: lerp(from.y, tgt.y, k), r: (60 + i * 8) * BLb.scale + 18, k };
  };
  const p3k = ip(f, [S5.p3, S5.p3 + 30], [0, 1], EASE);
  const p3Pos = { x: lerp(P3.x, L.x + 60 * L.scale, p3k), y: lerp(P3.y, L.y - 330 * L.scale, p3k) };
  const combineK = ip(f, [S5.combine - 18, S5.combine], [0, 1], Easing.in(Easing.quad));
  const WCs = screen(cam, WC_CRYSTAL);
  const lMouth = mouthAt("lumi", g);
  return (
    <CaveShot
      cam={cam}
      G={g}
      alive={ip(f, [S5.combine, S5.combine + 20], [0.15, 0.6])}
      world={
        <>
          <WhisperCrystal t={t} glow={ip(f, [S5.combine, S5.combine + 15], [0.05, 1.2])} pieces={f >= S5.combine ? 3 : 0} />
          {f < S5.p3 && <CrystalPiece3D position={PIECE3_AT} t={t} color={PIECE_COLORS[2]} glow={1} />}
          <SparkleBurst3D position={WC_CRYSTAL} age={ip(f, [S5.combine, S5.combine + 34], [0, 1])} reach={5} count={180} seed={61} colors={["#bff4ff", "#ffffff", "#ff9fe0", "#a0ffd8", "#c8a0ff"]} />
          <LightRing position={WC_CRYSTAL} age={ip(f, [S5.combine, S5.combine + 40], [0, 1])} radius={16} flat={false} color="#bff4ff" />
        </>
      }
      over={f >= S5.combine && f < S5.combine + 14 ? <AbsoluteFill style={{ background: "#e8fbff", opacity: ip(f, [S5.combine, S5.combine + 2, S5.combine + 14], [0, 0.5, 0]) }} /> : undefined}
    >
      <CurrentLines x={P3.x} y={P3.y + 120} w={700} h={300} g={g} on={f < S5.p3 ? 1 : ip(f, [S5.p3, S5.p3 + 20], [1, 0])} dir={1} />
      {f < S5.combine && (
        <>
          <Kiko x={K.x} y={K.y} scale={K.scale} g={g} mood={blowing ? "excited" : onDraco && f < S5.l17 + 20 ? "joy" : "happy"} look={blowing ? lookAtPt(K, P3, 300) : onDraco ? lookAtPt(K, B, 300) : { x: 0.6, y: 0 }} blink={blinkAt(g, 11)} armL={blowing ? 150 : 20} armR={blowing ? -150 + Math.sin(f / 3) * 20 : -20} tailSwish={1.3} />
          <AirBubble x={K.x} y={K.y} scale={K.scale} g={g} fit={KIKO_FIT} ph={4} opacity={0.55} />
          <Draco
            x={D.x}
            y={D.y + (onDraco ? 30 * D.scale : 0)}
            scale={D.scale}
            g={g}
            mood={onDraco ? (f < S5.drop + 30 ? "surprised" : "neutral") : blowing ? "effort" : "happy"}
            look={onDraco ? { x: 0, y: -0.9 } : blowing ? lookAtPt(D, P3, 300) : { x: 0.6, y: 0 }}
            blink={blinkAt(g, 5)}
            wing={blowing || onDraco ? 1 : 0.5}
            flap={blowing ? Math.sin(f * 1.2) * 28 : 0}
            armsUp={blowing ? 0.7 : onDraco ? 0.9 : 0.2}
            squash={onDraco ? ip(f, [S5.drop, S5.drop + 3, S5.drop + 10], [1, 0.72, 0.86]) : 1}
            glow={0.45}
          />
          {!onDraco && <AirBubble x={D.x} y={D.y} scale={D.scale} g={g} fit={BUBBLE_FIT.draco} ph={3} opacity={0.55} />}
          <BoboRider
            g={g}
            x={B.x}
            y={B.y}
            scale={B.scale}
            look={onDraco ? { x: 0.4, y: 0 } : f >= S5.lift ? { x: 0, y: 0.6 } : { x: 0.6, y: -0.2 }}
            expr={onDraco ? (mouthAt("bobo", g) > 0.06 ? "happy" : "excited") : f >= S5.lift ? "surprised" : "happy"}
            mouth={mouthAt("bobo", g)}
            armL={f >= S5.lift && !onDraco ? 150 : onDraco ? 80 : 20}
            armR={f >= S5.lift && !onDraco ? -150 : onDraco ? -80 : -20}
            squash={onDraco ? ip(f, [S5.drop, S5.drop + 3, S5.drop + 9], [1, 0.85, 1]) : 1}
            headTilt={talk("bobo", g)}
            blink={blinkAt(g, 3)}
            riderArmsUp={f >= S5.lift}
          />
          {f >= S5.lift && f < S5.drop - 4 && <MagicBubble2D x={B.x} y={B.y - 220 * B.scale} rx={330 * B.scale} g={g} />}
          <Pop2D x={B.x} y={B.y - 220 * B.scale} r={330 * B.scale} age={ip(f, [S5.drop - 4, S5.drop + 6], [0, 1])} />
          {!(f >= S5.lift && f < S5.drop - 4) && <AirBubble x={B.x} y={B.y} scale={B.scale} g={g} fit={BUBBLE_FIT.bobo} ph={1} opacity={0.55} />}
          <DizzyStars x={D.x} y={D.y - 160 * D.scale} scale={D.scale} on={ip(f, [S5.drop, S5.drop + 4, S5.drop + 40, S5.drop + 50], [0, 1, 1, 0])} g={g} />
          <Lumi x={L.x} y={L.y} scale={L.scale} look={f >= S5.l16 - 4 && f < S5.breath ? lookAtPt(L, { x: BLb.x, y: BLb.y - 140 * BLb.scale }, 300) : lookAtPt(L, P3, 300)} expr={lMouth > 0.06 ? "happy" : f >= S5.p3 ? "excited" : "neutral"} mouth={lMouth} armR={f >= S5.l16 && f < S5.breath ? -60 + Math.sin(f / 5) * 8 : f >= S5.p3 + 20 ? -130 : -22} armL={22} headTilt={talk("lumi", g) + (f >= S5.l16 && f < S5.breath ? 6 : 0)} blink={blinkAt(g, 1)} />
          <Worn L={L} g={g} />
          <AirBubble x={L.x} y={L.y} scale={L.scale} g={g} fit={BUBBLE_FIT.lumi} ph={2} opacity={0.55} />
          <Bloop x={BLb.x} y={BLb.y} scale={BLb.scale} g={g} mood={blowing ? "puff" : puff > 0.3 ? "puff" : nervous ? (bMouth > 0.06 ? "nervous" : f >= S5.l16 ? "surprised" : "nervous") : "brave"} mouth={blowing || puff > 0.3 ? 0 : bMouth} look={f >= S5.l16 && f < S5.breath ? lookAtPt(BLb, L, 300) : lookAtPt(BLb, P3, 300)} blink={blinkAt(g, 15)} float={120} puff={Math.max(puff, blowing ? 0.4 : 0)} tilt={f < S5.l16 ? Math.sin(f * 1.6) * 3 : talk("bloop", g)} />
          {blowing &&
            Array.from({ length: 6 }, (_, i) => {
              const c = chain(i);
              return <MagicBubble2D key={i} x={c.x} y={c.y} rx={c.r} g={g + i * 5} opacity={Math.sin(c.k * Math.PI)} />;
            })}
          {f >= S5.p3 && <MagicBubble2D x={p3Pos.x} y={p3Pos.y} rx={70} g={g} opacity={1 - p3k * 0.6} />}
          {f >= S5.p3 && <CrystalPiece2D x={p3Pos.x} y={p3Pos.y} scale={0.6} g={g} color={PIECE_COLORS[2]} />}
        </>
      )}
      {f >= S5.combine - 18 && f < S5.combine &&
        PIECE_COLORS.map((c, i) => <CrystalPiece2D key={i} x={lerp(240 + i * 300, WCs.x, combineK)} y={lerp(1300, WCs.y, combineK)} scale={0.5} g={g} color={c} />)}
    </CaveShot>
  );
};

// ---------- Scene 6 (54.6-66.6s): the cave sings; Kiko steals the sea-banana; a clock tower in a forest ----------
const S6 = { l18: L18 - CUTS[6], banana: BANANA - CUTS[6], snatch: SNATCH - CUTS[6], project: PROJECT - CUTS[6], l19: L19 - CUTS[6], end: END - CUTS[6] };
const F_KIKO = cv(-2.5, 2.2);
const F_LUMI = cv(-1.3, 2.6);
const F_DRACO = cv(1.1, 2.4);
const F_BOBO = cv(2.2, 2.8);
const F_CORALIE: V3 = [-0.1, 0.45, 2.1];
const F_BLOOP = cv(0.45, 3.2);
const HOLO: V3 = [0, 3.3, -3.6];

const Scene6: React.FC = () => {
  const f = useCurrentFrame();
  const g = f + CUTS[6];
  const t = g / 30;
  const cam = camAt(f, [
    [0, { pos: [0.0, 1.9, 9.6], target: [0.0, 2.2, -1.5], fov: 58 }],
    [S6.banana - 1, { pos: [0.0, 1.7, 9.0], target: [0.0, 2.0, -1.5], fov: 58 }],
    [S6.banana, { pos: [2.0, 1.15, 6.4], target: [1.9, 1.1, 2.6], fov: 46 }],
    [S6.project - 1, { pos: [2.0, 1.15, 6.2], target: [1.9, 1.1, 2.6], fov: 46 }],
    [S6.project, { pos: [-0.2, 1.6, 8.4], target: [-0.1, 2.3, -1.0], fov: 56 }],
    [360, { pos: [-0.2, 1.8, 9.4], target: [-0.1, 2.6, -1.0], fov: 58 }],
  ]);
  const alive = ip(f, [0, 40], [0.6, 1], EASE);
  const party = f < S6.banana;
  const hop = (ph: number) => (party ? Math.abs(Math.sin((f + ph) / 6)) * 0.22 : 0);
  const L = place(cam, up(F_LUMI, hop(0)), LUMI_S);
  const D = place(cam, up(F_DRACO, hop(2)), DRACO_S);
  const B = place(cam, up(F_BOBO, hop(4)), BOBO_S);
  const C = place(cam, F_CORALIE, CORALIE_S);
  const BLb = place(cam, F_BLOOP, BLOOP_S);
  // Kiko swims past and snatches the sea-banana
  const swipe = ip(f, [S6.snatch - 8, S6.snatch + 14], [0, 1]);
  const kSwim = f >= S6.snatch - 8 && f < S6.snatch + 14;
  const Kbase = place(cam, up(F_KIKO, hop(3)), KIKO_S);
  const fruit0 = { x: B.x + 230 * B.scale, y: B.y - 330 * B.scale };
  const K = kSwim ? { x: lerp(B.x - 500 * B.scale, B.x + 700 * B.scale, swipe), y: fruit0.y + 200 * B.scale - Math.sin(swipe * Math.PI) * 60 * B.scale, scale: Kbase.scale * 1.15 } : f >= S6.snatch + 14 && f < S6.project ? place(cam, cv(3.1, 2.6), KIKO_S * 1.0) : Kbase;
  const kh = kikoHand(K.x, K.y, K.scale, -150);
  const taken = f >= S6.snatch;
  const fruit = taken ? { x: kh.x, y: kh.y } : fruit0;
  const laughing = f >= S6.snatch + 6 && f < S6.project;
  const reach = f >= S6.banana + 8 && f < S6.snatch + 4;
  const bit = f >= S6.snatch + 2 && f < S6.snatch + 20;
  const Hs = screen(cam, up(HOLO, 0.3));
  const project = ip(f, [S6.project, S6.project + 22], [0, 1], OUT);
  const WCs = screen(cam, WC_CRYSTAL);
  const lookH = (who: Pt) => (f >= S6.project ? lookAtPt(who, Hs, 380) : lookAtPt(who, WCs, 300));
  const cMouth = mouthAt("coralie", g);
  const lMouth = mouthAt("lumi", g);
  const showAll = f < S6.banana || f >= S6.project;
  return (
    <CaveShot
      cam={cam}
      G={g}
      alive={alive}
      world={
        <>
          <WhisperCrystal t={t} glow={1.4} pieces={3} />
          <ClockTowerHologram position={HOLO} t={t} on={project} scale={0.75} />
          <SparkleBurst3D position={up(HOLO, 0.4)} age={ip(f, [S6.project, S6.project + 34], [0, 1])} reach={2.4} count={120} seed={71} colors={["#9fffc8", "#ffffff", "#fff7a0", "#bff4ff"]} />
        </>
      }
      over={
        <>
          <EndCard at={S6.end} top={250} />
          <AbsoluteFill style={{ alignItems: "center", fontFamily }}>
            <div style={{ position: "absolute", top: 410, fontSize: 40, fontWeight: 600, color: "#c8ffd8", opacity: ip(f, [S6.end + 20, S6.end + 36], [0, 1]), textShadow: "0 0 8px rgba(10, 40, 50, 1), 0 3px 12px rgba(10, 40, 50, 1)" }}>Next: The Secret of the Ancient Clock Tower 🕰️</div>
          </AbsoluteFill>
        </>
      }
    >
      {f >= S6.project && <path d={`M ${WCs.x - 12} ${WCs.y} L ${Hs.x - 180 * project} ${Hs.y + 150} L ${Hs.x + 180 * project} ${Hs.y + 150} L ${WCs.x + 12} ${WCs.y} Z`} fill="#c8ffd8" opacity={0.2 * project} />}
      {showAll && (
        <>
          <Coralie x={C.x} y={C.y} scale={C.scale} g={g} mood={cMouth > 0.06 ? "happy" : f >= S6.project ? "surprised" : "joy"} mouth={cMouth} look={lookH(C)} blink={blinkAt(g, 9)} armL={party ? 120 : 12} armR={party ? -120 : -12} swim={1.2} headTilt={talk("coralie", g)} />
          <Lumi x={L.x} y={L.y} scale={L.scale} look={lookH(L)} expr={lMouth > 0.06 ? "excited" : f >= S6.project ? "surprised" : "excited"} mouth={lMouth} armR={party ? -150 : f >= S6.project ? -60 : -22} armL={party ? 150 : 22} headTilt={talk("lumi", g)} blink={blinkAt(g, 1)} />
          <Worn L={L} g={g} glow={0.9} />
          <AirBubble x={L.x} y={L.y} scale={L.scale} g={g} fit={BUBBLE_FIT.lumi} ph={2} opacity={0.5} />
          <Draco x={D.x} y={D.y} scale={D.scale} g={g} mood={party ? "joy" : "surprised"} look={lookH(D)} blink={blinkAt(g, 5)} wing={party ? 1 : 0.6} flap={party ? Math.sin(f * 0.8) * 24 : 0} armsUp={party ? 0.9 : 0.3} glow={0.5} />
          <AirBubble x={D.x} y={D.y} scale={D.scale} g={g} fit={BUBBLE_FIT.draco} ph={3} opacity={0.5} />
          <Bloop x={BLb.x} y={BLb.y} scale={BLb.scale} g={g} mood={party ? "joy" : "surprised"} look={lookH(BLb)} blink={blinkAt(g, 15)} float={party ? 140 + Math.sin(f / 4) * 40 : 120} tilt={party ? Math.sin(f / 3) * 18 : 0} />
        </>
      )}
      <BoboRider
        g={g}
        x={B.x}
        y={B.y}
        scale={B.scale}
        look={bit ? { x: 0.9, y: 0 } : reach ? lookAtPt(B, fruit0, 300) : f >= S6.project ? lookH(B) : { x: 0, y: -0.4 }}
        expr={bit ? "surprised" : laughing ? "happy" : reach ? "excited" : party ? "excited" : "surprised"}
        mouth={bit && f < S6.snatch + 6 ? 0.9 : mouthAt("bobo", g)}
        armL={party ? 150 : 20}
        armR={party ? -150 : reach ? -110 : -20}
        blink={blinkAt(g, 3)}
        riderHappy={laughing}
      />
      <AirBubble x={B.x} y={B.y} scale={B.scale} g={g} fit={BUBBLE_FIT.bobo} ph={1} opacity={0.5} />
      <BoboBigEyes x={B.x} y={B.y} scale={B.scale} g={g} amount={reach && !taken ? 0.8 : 0} />
      {f >= S6.banana && f < S6.project && <SeaBanana x={fruit.x} y={fruit.y} scale={B.scale * 0.9} g={g} rot={taken ? 30 : -10} />}
      <g transform={kSwim ? `rotate(-70 ${K.x} ${K.y - 200 * K.scale})` : undefined}>
        <Kiko x={K.x} y={K.y} scale={K.scale} g={g} mood={laughing || kSwim ? "joy" : f >= S6.project ? "surprised" : "excited"} look={f >= S6.project ? lookH(K) : { x: -0.6, y: 0 }} blink={blinkAt(g, 11)} armL={party ? 140 : 30} armR={kSwim || laughing ? -150 : party ? -140 : -30} legs={kSwim ? 1 : 0} lean={laughing ? Math.sin(f * 1.3) * 7 : 0} tailSwish={1.6} />
        <AirBubble x={K.x} y={K.y} scale={K.scale} g={g} fit={KIKO_FIT} ph={4} opacity={0.5} />
      </g>
      {f >= S6.snatch && f < S6.snatch + 16 && <IconBubble x={B.x - 170 * B.scale} y={B.y - 560 * B.scale} scale={B.scale * 0.75} kind="bang" on={ip(f, [S6.snatch + 2, S6.snatch + 7], [0, 1])} g={g} tail={1} />}
      {party && <SparkBurst f={f} at={4} x={540} y={760} reach={540} count={28} size={18} life={36} rainbow />}
      <RisingBubbles x={540} y={1500} g={g} scale={1} count={12} spread={900} seed="party" />
    </CaveShot>
  );
};

export const Episode: React.FC = () => <EpisodeFrame audio="ep11/audio.wav" cuts={CUTS} scenes={[Scene1a, Scene1b, Scene2, Scene3, Scene4, Scene5, Scene6]} />;
