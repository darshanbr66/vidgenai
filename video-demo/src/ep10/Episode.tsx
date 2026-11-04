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
import { Ep6Defs, GlowShell } from "../ep06/props";
import { Ep7Defs } from "../ep07/props";
import { BoboBigEyes, DracoBlush, Ep8Defs, Kiko, kikoHand, SmokePuff, SweatDrop } from "../ep08/props";
import { CRYSTAL_HOME, floorY, GoldenDesert, SkyCityHologram, SunCrystal } from "../ep09/world";
import { DizzyStars, Ep9Defs, GoldenCompass, IconBubble, SandBurst, SandPile, Zuzu } from "../ep09/props";
import { CaveHologram, CEIL_Y, CHAMBER_Y, CityState, CloudStairs, CRYSTAL_AT, DistantCity, GRAV, platformAt, PLAZA, SkyCity, SkyCrystal, STEP, TOWER } from "./world";
import { BananaCloud, BasketBack, BasketFront, CloudLayer, Ep10Defs, LeafFan, Nimbus, nimbusMouth, Shiver, SkyBanana, SmokeRing, SneezeGust, SpinLines, WindRibbon } from "./props";

// Episode 10: The Secret of the Floating Sky City

const mouthAt = makeMouthAt(timeline);
export const CUTS = [0, 90, 474, 702, 960, 1137, 1380, 1722];
const BACK = (s: number) => Easing.out(Easing.back(s));
const lerp = (a: number, b: number, k: number) => a + (b - a) * k;
const lerp3 = (a: V3, b: V3, k: number): V3 => [lerp(a[0], b[0], k), lerp(a[1], b[1], k), lerp(a[2], b[2], k)];
const up = (p: V3, h: number): V3 => [p[0], p[1] + h, p[2]];
const clamp1 = (v: number) => Math.max(-1, Math.min(1, v));
const lookAtPt = (who: { x: number; y: number }, p: { x: number; y: number }, h = 300) => ({ x: clamp1((p.x - who.x) / 260), y: clamp1((p.y - (who.y - h)) / 300) });
// small natural head movement while a character talks
const talk = (who: string, g: number) => Math.sin(g / 4.3 + who.length) * 4.5 * Math.min(1, mouthAt(who, g) * 3);

const LUMI_S = 1;
const BOBO_S = 0.91;
const DRACO_S = 1.05;
const KIKO_S = 0.8;
const ZUZU_S = 0.62;
const NIMBUS_S = 0.85;

// ---- timed moments in frames; the same numbers (in seconds) are in scripts/ep10_audio.py ----
const L1 = 15;
const L2 = 96;
const L3 = 165;
const DROP = 198;
const L4 = 208;
const L5 = 229;
const L6 = 273;
const TAKEOFF = 318;
const SPIN = 333;
const CRASH = 370;
const L7 = 388;
const PEEK = 477;
const L8 = 492;
const TICKLE = 532;
const CHOO = 559;
const L10 = 577;
const HELP = 588;
const LAND = 618;
const L11 = 630;
const FLIP = 720;
const REACH1 = 747;
const REACH2 = 766;
const L12 = 780;
const FADE = 810;
const L13 = 816;
const L14 = 879;
const FIRE = 973;
const RING = 987;
const KIKO_MOVE = 1017;
const POP = 1032;
const PLAT_LAND = 1056;
const L15 = 1068;
const L16 = 1143;
const L17 = 1192;
const BREATH = 1270;
const BLOW = 1288;
const BLOWN = 1302;
const BASKET = 1324;
const FREE = 1338;
const LIGHT = 1356;
const CLOUD = 1407;
const L18 = 1419;
const SWIPE = 1461;
const CHOMP = 1464;
const LAUGH = 1468;
const SHELL = 1503;
const PROJECT = 1518;
const L19 = 1527;
const END = 1614;

const cityState = (G: number): CityState => ({
  base: G < FADE ? 0.78 : G < LIGHT ? ip(G, [FADE, FADE + 30], [0.78, 0.3]) : 0.3,
  waveOn: G >= LIGHT ? 1 : 0,
  waveR: ip(G, [LIGHT, LIGHT + 70], [0, 180]),
});
const charLit = (G: number) => (G < FADE ? 1.02 : G < LIGHT ? ip(G, [FADE, FADE + 30], [1.02, 0.92]) : ip(G, [LIGHT, LIGHT + 20], [0.92, 1.08]));

const Worn: React.FC<{ L: { x: number; y: number; scale: number }; g: number; glow?: number }> = ({ L, g, glow = 0.4 }) => (
  <MoonPendant x={L.x + 4 * L.scale} y={L.y - 262 * L.scale} scale={0.62 * L.scale} g={g} glow={glow} />
);

const Defs: React.FC<{ G: number }> = ({ G }) => (
  <>
    <Ep4Defs />
    <Ep5Defs lit={1} />
    <Ep6Defs />
    <Ep7Defs />
    <Ep8Defs />
    <Ep9Defs />
    <Ep10Defs lit={charLit(G)} />
  </>
);

const SkyShot: React.FC<{ cam: Cam3; G: number; fade?: boolean; stairs?: number; swirl?: number; vortex?: number; ceiling?: boolean; world?: React.ReactNode; children: React.ReactNode; over?: React.ReactNode }> = ({
  cam,
  G,
  fade = true,
  stairs = 1,
  swirl = 1,
  vortex = 1,
  ceiling = true,
  world,
  children,
  over,
}) => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill style={{ opacity: fade ? ip(f, [0, XF], [0, 1]) : 1, background: "#cfe0ff" }}>
      <World3D cam={cam} bloom={0.45} threshold={0.9}>
        <SkyCity t={G / 30} s={cityState(G)} stairs={stairs} swirl={swirl} vortex={vortex} ceiling={ceiling} />
        {world}
      </World3D>
      <CharLayer defs={<Defs G={G} />} filter="skyLit">
        {children}
      </CharLayer>
      {over}
    </AbsoluteFill>
  );
};

// ---------- Scene 1 (0-3s): the golden desert, the compass hologram, and a staircase of clouds ----------
const gp = (x: number, z: number): V3 => [x, floorY(x, z), z];
const D_LUMI = gp(-0.75, -18.6);
const D_ZUZU = gp(0.35, -18.15);
const D_KIKO = gp(-2.0, -18.9);
const D_DRACO = gp(1.4, -18.6);
const D_BOBO = gp(2.45, -18.9);
const D_HOLO: V3 = [0.2, 3.05, -20.2];

const Scene1: React.FC = () => {
  const f = useCurrentFrame();
  const g = f;
  const t = g / 30;
  const cam = camAt(f, [
    [0, { pos: [0.2, 1.5, -10.3], target: [0, 2.9, -19.5], fov: 60 }],
    [36, { pos: [0.2, 1.4, -10.8], target: [0.6, 3.6, -19.5], fov: 60 }],
    [90 + XF, { pos: [0.0, 1.0, -11.6], target: [1.6, 9.0, -14.5], fov: 66 }],
  ]);
  const L = place(cam, D_LUMI, LUMI_S);
  const Z = place(cam, D_ZUZU, ZUZU_S);
  const K = place(cam, D_KIKO, KIKO_S);
  const D = place(cam, D_DRACO, DRACO_S);
  const B = place(cam, D_BOBO, BOBO_S);
  const lumiArm = -95;
  const lh = lumiHand(L.x, L.y, L.scale, lumiArm);
  const comp = { x: lh.x, y: lh.y + 20 * L.scale };
  const Hs = screen(cam, up(D_HOLO, 0.6));
  const stairs = ip(f, [8, 48], [0, 1], OUT);
  const looking = f >= 30;
  const sky = screen(cam, [1.8, 8, -11]);
  const lookUp = (who: { x: number; y: number }) => (looking ? lookAtPt(who, sky, 400) : lookAtPt(who, Hs, 380));
  const shake = f >= 54 && f < 66;
  return (
    <AbsoluteFill style={{ background: "#e8c890" }}>
      <World3D cam={cam} bloom={0.55} threshold={0.82}>
        <GoldenDesert t={t} s={{ base: 1, waveR: 0, waveOn: 0 }} open={1} lit={[1, 1, 1]} light={0.5} />
        <SunCrystal position={CRYSTAL_HOME} t={t} glow={1.2} scale={1.3} spin={1} />
        <SkyCityHologram position={D_HOLO} t={t} on={ip(f, [0, 20, 40], [1, 1.25, 0.6])} scale={0.72 + ip(f, [0, 25], [0, 0.12])} />
        <group position={[1.9, 0.25, -14.6]} rotation={[0, Math.PI, 0]}>
          <CloudStairs t={t} reveal={stairs} />
        </group>
        <DistantCity t={t} position={[9, 24, -26]} scale={0.7} />
        <SparkleBurst3D position={[-2, 2, -17]} age={ip(f, [8, 48], [0, 1])} reach={6} count={140} seed={21} colors={["#ffffff", "#cfe8ff", "#ffe8b0"]} />
      </World3D>
      <CharLayer defs={<Defs G={g} />} filter="desertLit">
        <path d={`M ${comp.x - 10} ${comp.y} L ${Hs.x - 170} ${Hs.y + 140} L ${Hs.x + 170} ${Hs.y + 140} L ${comp.x + 10} ${comp.y} Z`} fill="#ffe8a0" opacity={0.18 * ip(f, [30, 60], [1, 0.3])} />
        <Kiko x={K.x} y={K.y} scale={K.scale} g={g} mood="excited" look={lookUp(K)} blink={blinkAt(g, 11)} armL={looking ? 120 : 30} armR={-30} tailSwish={1.2} />
        <Lumi x={L.x} y={L.y} scale={L.scale} look={lookUp(L)} expr={mouthAt("lumi", g) > 0.06 ? "excited" : "surprised"} mouth={mouthAt("lumi", g)} armR={lumiArm} armL={looking ? 60 : 22} headTilt={-4 + talk("lumi", g)} blink={blinkAt(g, 1)} />
        <Worn L={L} g={g} glow={0.8} />
        <GoldenCompass x={comp.x} y={comp.y} scale={0.5 * L.scale} g={g} open={1} glow={1} />
        <Zuzu x={Z.x} y={Z.y} scale={Z.scale} g={g} mood="happy" look={lookUp(Z)} blink={blinkAt(g, 13)} armR={-150 + Math.sin(g / 3) * 25} armL={14} tailWag={1.4} />
        <Draco x={D.x} y={D.y} scale={D.scale} g={g} mood={shake ? "effort" : "excited"} look={lookUp(D)} blink={shake ? 0.2 : blinkAt(g, 5)} wing={0.8} flap={shake ? Math.sin(f * 2) * 20 : Math.sin(f / 3) * 8} armsUp={0.5} headTilt={shake ? Math.sin(f * 1.8) * 14 : 0} glow={0.5} />
        <SandPile x={D.x} y={D.y} scale={D.scale} amount={ip(f, [54, 60], [0.55, 0])} g={g} />
        <SandBurst f={f} at={56} x={D.x} y={D.y - 300 * D.scale} scale={D.scale} reach={300} count={30} life={20} />
        <BoboRider g={g} x={B.x} y={B.y} scale={B.scale} look={lookUp(B)} expr="surprised" armL={30} armR={-30} blink={blinkAt(g, 3)} riderLook={lookUp(B)} />
      </CharLayer>
      <AbsoluteFill style={{ background: "radial-gradient(circle at 40% 30%, #ffffff 0%, #eaf4ff 55%, #cfe0ff 100%)", opacity: ip(f, [78, 90 + XF], [0, 1], EASE) }} />
    </AbsoluteFill>
  );
};

// ---------- Scene 2 (3-15.8s): up the cloud staircase; Kiko's fake fall; Draco's crash landing ----------
// characters climb step by step: a short hop from step to step, no sliding
const climb = (f: number, from: number, to: number, f0: number, f1: number, hop = 0.28): V3 => {
  const k = ip(f, [f0, f1], [from, to]);
  const i = Math.floor(k);
  const frac = k - i;
  const e = EASE(Math.min(1, frac * 1.6));
  const a = STEP(Math.min(i, 14));
  const b = STEP(Math.min(i + 1, 14));
  return up(lerp3(a, b, frac >= 1 ? 1 : e), frac > 0 && frac < 0.625 ? Math.sin((frac / 0.625) * Math.PI) * hop : 0);
};
const S2 = { l2: L2 - CUTS[1], l3: L3 - CUTS[1], drop: DROP - CUTS[1], l4: L4 - CUTS[1], l5: L5 - CUTS[1], l6: L6 - CUTS[1], takeoff: TAKEOFF - CUTS[1], spin: SPIN - CUTS[1], crash: CRASH - CUTS[1], l7: L7 - CUTS[1] };
const stepOff = (i: number, dx: number): V3 => [STEP(i)[0] + dx, STEP(i)[1], STEP(i)[2]];

const Scene2: React.FC = () => {
  const f = useCurrentFrame();
  const g = f + CUTS[1];
  const t = g / 30;
  const cam = camAt(f, [
    [0, { pos: [-2.6, 2.6, 9.4], target: [0.25, 2.3, 3.0], fov: 54 }],
    [39, { pos: [-2.4, 2.9, 8.8], target: [0.25, 2.6, 2.6], fov: 54 }],
    [40, { pos: [-1.35, 2.25, 8.3], target: [0.1, 1.9, 4.4], fov: 46 }],
    [77, { pos: [-1.3, 2.2, 8.1], target: [0.1, 1.85, 4.4], fov: 46 }],
    [78, { pos: [-2.4, 3.0, 8.6], target: [0.25, 2.75, 2.4], fov: 54 }],
    [278, { pos: [-2.5, 3.1, 8.9], target: [0.25, 2.85, 2.4], fov: 54 }],
    [279, { pos: [-1.6, 2.5, 8.4], target: [0.15, 2.4, 3.2], fov: 50 }],
    [384 + XF, { pos: [-1.55, 2.5, 8.2], target: [0.15, 2.4, 3.2], fov: 50 }],
  ]);
  // positions: Lumi leads, Bobo trails nervously
  const lumiP = climb(f, 4, 7, 0, 75);
  const dracoP = f < S2.takeoff ? climb(f, 3, 5, 0, 60) : STEP(5);
  const kikoP = f < S2.l6 ? climb(f, 2, 3, 0, 40) : climb(f, 3, 4, S2.l6 - 20, S2.l6);
  const boboP = climb(f, 0, 2, 4, 60, 0.18);
  // Kiko's fake fall: he wobbles at the edge, drops out of sight, then pops back up hanging upside down by his tail
  const kEdge = stepOff(3, -0.7);
  const kp = f < S2.l3 - 4 || f >= S2.l6 - 20 ? kikoP : kEdge;
  const falling = f >= S2.drop && f < S2.l5;
  const hanging = f >= S2.l5 && f < S2.l6 - 20;
  const kDrop = ip(f, [S2.drop, S2.drop + 8], [0, 1.6], Easing.in(Easing.quad));
  const Kp = place(cam, up(kp, falling ? -kDrop : 0), KIKO_S);
  // Draco: takes off, spins like a top, crashes onto Bobo
  const fly = ip(f, [S2.takeoff, S2.spin], [0, 1], OUT);
  const spinK = ip(f, [S2.spin, S2.crash], [0, 1]);
  const bHead = up(STEP(2), 1.0);
  const dFlying: V3 = f < S2.spin ? up(STEP(5), fly * 1.4) : lerp3(up(STEP(5), 1.4), bHead, Easing.in(Easing.quad)(spinK));
  const crashed = f >= S2.crash;
  const D = place(cam, crashed ? bHead : f >= S2.takeoff ? dFlying : dracoP, DRACO_S);
  const spinAng = f >= S2.spin && !crashed ? spinK * 1080 : 0;
  const L = place(cam, lumiP, LUMI_S);
  const B = place(cam, boboP, BOBO_S);
  const scream = f >= S2.l4 && f < S2.l4 + 20;
  const nervous = f >= S2.l2 && f < S2.l3 + 10;
  const bSquash = crashed ? ip(f, [S2.crash, S2.crash + 3, S2.crash + 10], [1, 0.72, 0.84]) : scream ? 1.06 : 1;
  const lMouth = mouthAt("lumi", g);
  const show = true;
  return (
    <SkyShot cam={cam} G={g} over={<AbsoluteFill style={{ background: "radial-gradient(circle at 40% 30%, #ffffff 0%, #eaf4ff 55%, #cfe0ff 100%)", opacity: ip(f, [0, 14], [1, 0], EASE) }} />} fade={false}>
      {show && (
        <>
          <Lumi
            x={L.x}
            y={L.y}
            scale={L.scale}
            look={f < 90 ? { x: -0.4, y: -0.6 } : scream ? { x: 0.8, y: 0.3 } : lookAtPt(L, B, 300)}
            expr={scream ? "surprised" : lMouth > 0.06 ? "excited" : "happy"}
            mouth={lMouth}
            walk={f < 75 ? f * 0.32 : null}
            armR={f < 90 ? -130 : -20}
            armL={22}
            headTilt={talk("lumi", g)}
            blink={blinkAt(g, 1)}
          />
          <Worn L={L} g={g} />
          {!hanging && (
            <Kiko
              x={Kp.x}
              y={Kp.y}
              scale={Kp.scale}
              g={g}
              mood={f >= S2.l3 - 4 ? "surprised" : "excited"}
              mouth={mouthAt("kiko", g)}
              look={{ x: 0.3, y: 0.4 }}
              blink={blinkAt(g, 11)}
              armL={f >= S2.l3 - 4 ? 120 + Math.sin(f * 0.9) * 50 : 30}
              armR={f >= S2.l3 - 4 ? -120 - Math.sin(f * 0.9 + 1) * 50 : -30}
              lean={f >= S2.l3 - 4 && !falling ? Math.sin(f * 0.45) * 16 + 8 : 0}
              legs={falling ? 1 : 0}
              tailSwish={1.5}
            />
          )}
          {hanging && (
            <g transform={`rotate(180 ${place(cam, up(kEdge, -0.3), 1).x} ${place(cam, up(kEdge, -0.3), 1).y})`}>
              <Kiko
                x={place(cam, up(kEdge, -0.3), KIKO_S).x}
                y={place(cam, up(kEdge, -0.3), KIKO_S).y}
                scale={place(cam, up(kEdge, -0.3), KIKO_S).scale}
                g={g}
                mood={mouthAt("kiko", g) > 0.06 ? "excited" : "joy"}
                mouth={mouthAt("kiko", g)}
                look={{ x: -0.6, y: 0.8 }}
                blink={blinkAt(g, 11)}
                armL={140}
                armR={-60 + Math.sin(f / 2) * 20}
                legs={0.3}
                squash={ip(f, [S2.l5, S2.l5 + 4, S2.l5 + 10], [1, 0.85, 1])}
                tailSwish={0.3}
              />
            </g>
          )}
          <BoboRider
            g={g}
            x={B.x}
            y={B.y}
            scale={B.scale}
            look={crashed ? { x: 0, y: -0.7 } : nervous ? { x: 0.2, y: 1 } : scream ? { x: 0.9, y: 0.4 } : { x: 0.4, y: -0.5 }}
            expr={scream ? "surprised" : crashed ? "neutral" : nervous ? "effort" : "surprised"}
            mouth={scream ? 0.9 : mouthAt("bobo", g)}
            walk={f > 4 && f < 60 ? f * 0.22 : null}
            armL={scream ? 160 : crashed ? 10 : nervous ? 40 : 30}
            armR={scream ? -160 : crashed ? -10 : nervous ? -40 : -30}
            lean={nervous ? Math.sin(f * 2.2) * 2 : 0}
            squash={bSquash}
            headTilt={talk("bobo", g)}
            blink={crashed ? 0.45 : blinkAt(g, 3)}
            riderLook={crashed ? { x: 0, y: -1 } : { x: 0.3, y: 0.5 }}
            riderArmsUp={scream}
          />
          <Shiver x={B.x} y={B.y - 220 * B.scale} scale={B.scale} on={nervous ? 1 : 0} g={g} />
          {nervous && <SweatDrop x={B.x - 110 * B.scale} y={B.y - 380 * B.scale} scale={B.scale} g={g} />}
          <BoboBigEyes x={B.x} y={B.y} scale={B.scale} g={g} amount={scream ? 1 : 0} />
          {scream && <IconBubble x={B.x + 160 * B.scale} y={B.y - 560 * B.scale} scale={B.scale * 0.8} kind="bang" on={ip(f, [S2.l4, S2.l4 + 6], [0, 1])} g={g} />}
          <g transform={`rotate(${spinAng} ${D.x} ${D.y - 180 * D.scale})`}>
            <Draco
              x={D.x}
              y={crashed ? D.y + 0 : D.y}
              scale={D.scale}
              g={g}
              mood={crashed ? (f > S2.crash + 40 ? "happy" : "surprised") : f >= S2.spin ? "surprised" : f >= S2.takeoff ? "joy" : mouthAt("draco", g) > 0.06 ? "excited" : "happy"}
              mouth={mouthAt("draco", g)}
              look={crashed ? { x: -0.3, y: 0.3 } : { x: 0, y: -0.2 }}
              blink={blinkAt(g, 5)}
              wing={f >= S2.takeoff && !crashed ? 1 : 0.6}
              flap={f >= S2.takeoff && !crashed ? Math.sin(f * 1.4) * 30 : 0}
              armsUp={f >= S2.l6 && f < S2.takeoff ? 0.9 : crashed ? 0.1 : 0.5}
              breath={f >= S2.l6 && f < S2.takeoff ? 0.7 : 0}
              squash={crashed ? ip(f, [S2.crash, S2.crash + 3, S2.crash + 9], [1, 0.8, 1]) : 1}
              headTilt={talk("draco", g) + (crashed ? 6 : 0)}
              glow={0.45}
            />
          </g>
          <SpinLines x={D.x} y={D.y - 180 * D.scale} scale={D.scale} on={f >= S2.spin && !crashed ? 1 : 0} g={g} />
          {crashed && f > S2.crash + 40 && <DracoBlush x={D.x} y={D.y} scale={D.scale} amount={ip(f, [S2.crash + 40, S2.crash + 60], [0, 0.8])} />}
          <DizzyStars x={B.x} y={B.y - 360 * B.scale} scale={B.scale} on={ip(f, [S2.crash, S2.crash + 4, S2.crash + 60, S2.crash + 70], [0, 1, 1, 0])} g={g} />
          <SparkBurst f={f} at={S2.crash} x={D.x} y={D.y} reach={220} count={14} size={14} life={18} />
        </>
      )}
    </SkyShot>
  );
};

// ---------- Scene 3 (15.8-23.4s): Nimbus, a sneeze, and a cloud sandwich ----------
const P = (x: number, z: number): V3 => [x, PLAZA[1], z];
const C_LUMI = P(0.1, -14.8);
const C_BOBO = P(0.95, -14.4);
const C_DRACO = P(1.8, -15.0);
const C_KIKO = P(-0.75, -14.3);
const C_NIMBUS = P(-1.6, -15.2);
const C_BED = P(2.9, -14.6);
const S3 = { peek: PEEK - CUTS[2], l8: L8 - CUTS[2], tickle: TICKLE - CUTS[2], choo: CHOO - CUTS[2], l10: L10 - CUTS[2], help: HELP - CUTS[2], land: LAND - CUTS[2], l11: L11 - CUTS[2] };

const Scene3: React.FC = () => {
  const f = useCurrentFrame();
  const g = f + CUTS[2];
  const cam = camAt(f, [
    [0, { pos: [-0.85, 10.35, -10.6], target: [-0.8, 10.2, -15.0], fov: 54 }],
    [S3.choo - 1, { pos: [-0.85, 10.35, -11.0], target: [-0.8, 10.2, -15.0], fov: 54 }],
    [S3.choo, { pos: [0.75, 10.9, -8.0], target: [0.75, 10.45, -14.8], fov: 66 }],
    [S3.land + 4, { pos: [0.85, 10.9, -8.3], target: [0.95, 10.45, -14.8], fov: 66 }],
    [S3.land + 5, { pos: [2.6, 10.25, -11.7], target: [2.85, 10.05, -14.6], fov: 46 }],
    [228 + XF, { pos: [2.6, 10.25, -12.0], target: [2.85, 10.05, -14.6], fov: 46 }],
  ]);
  const N0 = place(cam, C_NIMBUS, NIMBUS_S);
  const rise = ip(f, [S3.peek, S3.peek + 8, S3.l8 + 2, S3.l8 + 12], [0, 0.35, 0.35, 1], EASE);
  const L = place(cam, f >= S3.help ? lerp3(C_LUMI, P(2.4, -14.6), ip(f, [S3.help, S3.help + 18], [0, 1], EASE)) : C_LUMI, LUMI_S);
  const K = place(cam, C_KIKO, KIKO_S);
  const D = place(cam, C_DRACO, DRACO_S);
  // Bobo's flight: blown up and away, spinning, then into the cloud
  const flyK = ip(f, [S3.choo + 2, S3.land], [0, 1]);
  const boboP: V3 = f < S3.choo + 2 ? C_BOBO : up(lerp3(C_BOBO, C_BED, Easing.inOut(Easing.quad)(flyK)), Math.sin(flyK * Math.PI) * 2.2);
  const B = place(cam, boboP, BOBO_S);
  const Bed = place(cam, C_BED, BOBO_S);
  const flying = f >= S3.choo + 2 && f < S3.land;
  const landed = f >= S3.land;
  const spin = flying ? flyK * 900 : 0;
  const windup = f >= S3.tickle && f < S3.choo;
  const sneeze = f >= S3.choo && f < S3.choo + 10;
  const nMouth = mouthAt("nimbus", g);
  const nMood = sneeze ? "sneeze" : windup ? "windup" : f >= S3.choo + 10 ? "surprised" : nMouth > 0.06 ? "shy" : rise < 0.9 ? "shy" : "happy";
  const nFloat = 30 + rise * 120;
  const nm = nimbusMouth(N0.x, N0.y, N0.scale, nFloat);
  const kLaugh = f >= S3.l10 && f < S3.l11 + 20;
  // the cloud Lumi pushes under Bobo
  const push = ip(f, [S3.help, S3.help + 26], [0, 1], EASE);
  const pushCloud = { x: lerp(L.x + 60 * L.scale, Bed.x, push), y: Bed.y - 40 * Bed.scale };
  const showMain = f < S3.land + 5;
  return (
    <SkyShot cam={cam} G={g}>
      {showMain && (
        <>
          <Kiko
            x={K.x}
            y={K.y}
            scale={K.scale}
            g={g}
            mood={kLaugh ? "joy" : f >= S3.choo ? "surprised" : "happy"}
            mouth={kLaugh ? 0 : mouthAt("kiko", g)}
            look={{ x: f >= S3.choo ? 1 : -0.6, y: f >= S3.choo ? -0.4 : 0 }}
            blink={blinkAt(g, 11)}
            armL={kLaugh ? 70 + Math.sin(f) * 14 : 20}
            armR={kLaugh ? -70 - Math.sin(f) * 14 : -20}
            legs={kLaugh ? 0.9 : 0}
            lean={kLaugh ? ip(f, [S3.l10, S3.l10 + 8], [0, -74]) + Math.sin(f * 1.4) * 4 : 0}
            tailSwish={1.2}
          />
          <Draco x={D.x} y={D.y} scale={D.scale} g={g} mood={f >= S3.choo ? "surprised" : "happy"} look={{ x: f >= S3.choo ? 0.8 : -1, y: f >= S3.choo ? -0.5 : 0 }} blink={blinkAt(g, 5)} wing={f >= S3.choo && f < S3.choo + 20 ? 1 : 0.5} lean={f >= S3.choo && f < S3.choo + 14 ? 10 : 0} glow={0.45} />
          <Lumi
            x={L.x}
            y={L.y}
            scale={L.scale}
            look={f >= S3.choo ? lookAtPt(L, B, 300) : { x: -0.8, y: 0 }}
            expr={f >= S3.choo ? (f >= S3.help ? "effort" : "surprised") : "happy"}
            walk={f >= S3.help && f < S3.help + 18 ? f * 0.5 : null}
            armR={f >= S3.help ? -90 : -20}
            armL={f >= S3.help ? 60 : 22}
            lean={f >= S3.help && f < S3.land ? 12 : 0}
            headTilt={talk("lumi", g)}
            blink={blinkAt(g, 1)}
          />
          <Worn L={L} g={g} />
          {f >= S3.help && <CloudLayer x={pushCloud.x} y={pushCloud.y} w={170 * Bed.scale} h={70 * Bed.scale} seed={3} />}
          {!landed && (
            <g transform={`rotate(${spin} ${B.x} ${B.y - 200 * B.scale})`}>
              <BoboRider g={g} x={B.x} y={B.y} scale={B.scale} look={flying ? { x: 0, y: 0 } : { x: -0.7, y: 0 }} expr={flying ? "surprised" : "happy"} mouth={flying ? 0.7 : mouthAt("bobo", g)} armL={flying ? 160 : 20} armR={flying ? -160 : -20} blink={blinkAt(g, 3)} riderArmsUp={flying} />
            </g>
          )}
          <SpinLines x={B.x} y={B.y - 200 * B.scale} scale={B.scale} on={flying ? 1 : 0} g={g} />
          <Nimbus x={N0.x} y={N0.y} scale={N0.scale} g={g} mood={nMood} mouth={nMouth} look={f >= S3.choo + 10 ? lookAtPt(N0, B, 300) : { x: 0.6, y: 0.1 }} blink={blinkAt(g, 7)} float={nFloat} squash={sneeze ? ip(f, [S3.choo, S3.choo + 3, S3.choo + 10], [1, 0.75, 1]) : 1} tilt={sneeze ? -14 : windup ? 8 : 0} wave={f >= S3.l8 + 6 && f < S3.l8 + 34 ? 1 : 0} />
          {rise < 1 && <CloudLayer x={N0.x} y={N0.y + 20 * N0.scale} w={200 * N0.scale} h={60 * N0.scale} seed={1} />}
          <SneezeGust x={nm.x + 40 * N0.scale} y={nm.y} scale={N0.scale * 1.6} age={ip(f, [S3.choo, S3.choo + 30], [0, 1])} dir={1} />
          {windup && <Sparkle x={nm.x} y={nm.y - 30 * N0.scale} size={10 + (f % 6) * 2} color="#ffffff" />}
        </>
      )}
      {landed && (
        <>
          {/* Bobo, sandwiched in the big cloud */}
          <CloudLayer x={Bed.x} y={Bed.y - 60 * Bed.scale} w={260 * Bed.scale} h={100 * Bed.scale} seed={4} />
          <BoboRider g={g} x={Bed.x} y={Bed.y - 30 * Bed.scale} scale={Bed.scale} look={{ x: 0.2, y: 0 }} expr={mouthAt("bobo", g) > 0.06 ? "happy" : "surprised"} mouth={mouthAt("bobo", g)} armL={70} armR={-70} headTilt={talk("bobo", g)} blink={blinkAt(g, 3)} riderLook={{ x: 0, y: -1 }} />
          <CloudLayer x={Bed.x} y={Bed.y - 160 * Bed.scale} w={240 * Bed.scale} h={90 * Bed.scale} seed={5} squash={ip(f, [S3.land, S3.land + 4, S3.land + 12], [1, 0.7, 1])} />
          <CloudLayer x={Bed.x + 10 * Bed.scale} y={Bed.y - (470 - ip(f, [S3.land + 4, S3.land + 12], [160, 0], Easing.in(Easing.quad))) * Bed.scale} w={150 * Bed.scale} h={70 * Bed.scale} seed={6} />
          <IconBubble x={Bed.x + 230 * Bed.scale} y={Bed.y - 600 * Bed.scale} scale={Bed.scale * 0.8} kind="dots" on={ip(f, [S3.land + 2, S3.land + 6, S3.l11 - 2, S3.l11 + 2], [0, 1, 1, 0])} g={g} />
        </>
      )}
      <SparkBurst f={f} at={S3.land} x={Bed.x} y={Bed.y - 150 * Bed.scale} reach={260} count={18} size={16} life={22} />
    </SkyShot>
  );
};

// ---------- Scene 4 (23.4-32s): the gravity garden; the floating banana; the fading crystal ----------
const Gp = (x: number, z: number): V3 => [GRAV[0] + x, GRAV[1], GRAV[2] + z];
const Gc = (x: number, z: number): V3 => [GRAV[0] + x, CEIL_Y, GRAV[2] + z];
const S4 = { flip: FLIP - CUTS[3], r1: REACH1 - CUTS[3], r2: REACH2 - CUTS[3], l12: L12 - CUTS[3], fade: FADE - CUTS[3], l13: L13 - CUTS[3], l14: L14 - CUTS[3] };

const Scene4: React.FC = () => {
  const f = useCurrentFrame();
  const g = f + CUTS[3];
  const t = g / 30;
  const cam = camAt(f, [
    [0, { pos: [GRAV[0] - 0.1, GRAV[1] + 1.9, GRAV[2] + 11.0], target: [GRAV[0] - 0.1, GRAV[1] + 1.8, GRAV[2] + 1.6], fov: 60 }],
    [40, { pos: [GRAV[0] - 0.1, GRAV[1] + 1.9, GRAV[2] + 10.4], target: [GRAV[0] - 0.1, GRAV[1] + 1.8, GRAV[2] + 1.6], fov: 60 }],
    [41, { pos: [GRAV[0] + 0.7, GRAV[1] + 2.2, GRAV[2] + 5.9], target: [GRAV[0] + 0.4, GRAV[1] + 2.4, GRAV[2] + 1.4], fov: 52 }],
    [107, { pos: [GRAV[0] + 0.7, GRAV[1] + 2.2, GRAV[2] + 5.6], target: [GRAV[0] + 0.4, GRAV[1] + 2.4, GRAV[2] + 1.4], fov: 52 }],
    [108, { pos: [GRAV[0] + 1.9, GRAV[1] + 1.5, GRAV[2] + 8.4], target: [GRAV[0] - 6.0, GRAV[1] + 3.1, GRAV[2] + 1.6], fov: 54 }],
    [258 + XF, { pos: [GRAV[0] + 1.9, GRAV[1] + 1.55, GRAV[2] + 8.0], target: [GRAV[0] - 6.0, GRAV[1] + 3.1, GRAV[2] + 1.6], fov: 54 }],
  ]);
  const flipK = ip(f, [S4.flip, S4.flip + 7], [0, 1], Easing.in(Easing.quad));
  const flipped = f >= S4.flip + 7;
  // Bobo: walks in, then gravity yanks his feet up to the ceiling
  const bFloor = Gp(0.6, 2.0);
  const bCeil = Gc(0.6, 1.5);
  const Bf = place(cam, f < S4.flip ? lerp3(Gp(-1.2, 3.2), bFloor, ip(f, [0, 16], [0, 1], EASE)) : bFloor, BOBO_S);
  const Bc = place(cam, bCeil, BOBO_S);
  const B = flipped ? Bc : { x: lerp(Bf.x, Bc.x, flipK), y: lerp(Bf.y, Bc.y + 400 * Bc.scale, flipK), scale: Bf.scale };
  const bRot = flipped ? 180 : flipK * 180;
  // Kiko strolls along the ceiling, upside down, as if it's normal
  const kWalk = ip(f, [S4.flip + 6, 110], [0, 1]);
  const K = place(cam, lerp3(Gc(-2.6, 1.4), Gc(-0.6, 1.0), kWalk), KIKO_S);
  const L = place(cam, f < 108 ? lerp3(Gp(-1.8, 3.4), Gp(-0.9, 2.4), ip(f, [0, 20], [0, 1], EASE)) : Gp(-2.7, 4.1), LUMI_S);
  const N = place(cam, f < 108 ? Gp(-2.0, 2.1) : Gp(-1.6, 4.8), NIMBUS_S);
  // Draco floats around helplessly, slowly tumbling
  const dFloat = f >= S4.flip ? ip(f, [S4.flip, S4.flip + 30], [0, 1.2], EASE) + Math.sin(f / 9) * 0.25 : 0;
  const D = place(cam, up(Gp(2.0, 2.4), dFloat), DRACO_S);
  const tumble = f >= S4.flip + 10 ? Math.sin((f - S4.flip) / 14) * 70 + (f - S4.flip) * 1.2 : 0;
  // the floating banana, bobbing away from Bobo's paw
  const bananaWorld = (): V3 => {
    const base: V3 = [GRAV[0] + 0.0, CEIL_Y - 1.35, GRAV[2] + 1.5];
    const away1 = ip(f, [S4.r1, S4.r1 + 10], [0, 0.6], OUT);
    const away2 = ip(f, [S4.r2, S4.r2 + 10], [0, 0.6], OUT);
    const drift = ip(f, [S4.l12, S4.l12 + 40], [0, 1.4]);
    return [base[0] - away1 - away2 - drift * 0.4, base[1] + Math.sin(f / 7) * 0.08 - drift * 0.3, base[2]];
  };
  const Bn = screen(cam, bananaWorld());
  const reaching = (f >= S4.r1 - 4 && f < S4.r1 + 8) || (f >= S4.r2 - 4 && f < S4.r2 + 8);
  const fading = f >= S4.fade;
  const showCeil = f < 108;
  const Ts = screen(cam, CRYSTAL_AT);
  const lMouth = mouthAt("lumi", g);
  const nMouth = mouthAt("nimbus", g);
  const pointing = f >= S4.l13 - 4;
  return (
    <SkyShot cam={cam} G={g} swirl={1} ceiling={showCeil}>
      {/* upside-down Kiko on the ceiling, whistling */}
      <g transform={`rotate(180 ${K.x} ${K.y})`}>
        <Kiko x={K.x} y={K.y} scale={K.scale} g={g} mood={f >= S4.flip + 6 ? "happy" : "surprised"} look={{ x: -0.4, y: 0.2 }} blink={blinkAt(g, 11)} armL={30 + Math.sin(f / 4) * 20} armR={-30 + Math.sin(f / 4) * 20} legs={0} tailSwish={1} lean={Math.sin(f / 6) * 3} />
      </g>
      {f >= S4.flip + 8 && f < 110 && <IconBubble x={K.x - 150 * K.scale} y={K.y + 380 * K.scale} scale={K.scale * 0.7} kind="music" on={1} g={g} tail={1} />}
      <Lumi
        x={L.x}
        y={L.y}
        scale={L.scale}
        look={pointing ? { x: -0.6, y: -1 } : f >= S4.flip ? lookAtPt(L, B, -100) : { x: 0.3, y: -0.3 }}
        expr={pointing ? (lMouth > 0.06 ? "surprised" : "neutral") : f >= S4.flip ? "surprised" : "happy"}
        mouth={lMouth}
        walk={f < 20 ? f * 0.4 : null}
        armL={pointing ? 140 : 22}
        armR={-22}
        headTilt={talk("lumi", g)}
        blink={blinkAt(g, 1)}
      />
      <Worn L={L} g={g} />
      <Nimbus x={N.x} y={N.y} scale={N.scale} g={g} mood={f >= S4.l14 ? (nMouth > 0.06 ? "scared" : "surprised") : f >= S4.flip ? "joy" : "happy"} mouth={nMouth} look={{ x: f >= S4.l14 ? 0 : 0.6, y: -0.3 }} blink={blinkAt(g, 7)} float={130} tilt={talk("nimbus", g)} />
      <g transform={`rotate(${tumble} ${D.x} ${D.y - 180 * D.scale})`}>
        <Draco x={D.x} y={D.y} scale={D.scale} g={g} mood={f < S4.flip ? "happy" : f < S4.flip + 20 ? "excited" : "surprised"} look={{ x: -0.3, y: -0.2 }} blink={blinkAt(g, 5)} wing={1} flap={Math.sin(f / 2) * 26} armsUp={f >= S4.flip ? 0.6 + Math.sin(f / 3) * 0.4 : 0.3} glow={0.45} />
      </g>
      {f >= S4.flip + 10 && f < S4.flip + 40 && <IconBubble x={D.x + 160 * D.scale} y={D.y - 520 * D.scale} scale={D.scale * 0.65} kind="bang" on={ip(f, [S4.flip + 10, S4.flip + 16], [0, 1])} g={g} />}
      {/* Bobo, stuck to the ceiling, reaching for the banana */}
      <g transform={`rotate(${bRot} ${B.x} ${B.y})`}>
        <BoboRider
          g={g}
          x={B.x}
          y={B.y}
          scale={B.scale}
          look={reaching || f >= S4.r1 - 10 ? { x: -0.5, y: -0.9 } : { x: 0, y: 0 }}
          expr={f >= S4.l12 ? "effort" : reaching ? "excited" : f >= S4.flip ? "surprised" : "happy"}
          mouth={mouthAt("bobo", g)}
          walk={f < 16 ? f * 0.35 : null}
          armL={reaching ? 165 : f >= S4.flip ? 150 : 20}
          armR={reaching ? -40 : f >= S4.flip ? -150 : -20}
          squash={ip(f, [S4.flip + 7, S4.flip + 10, S4.flip + 16], [1, 0.85, 1])}
          headTilt={talk("bobo", g)}
          blink={blinkAt(g, 3)}
          riderLook={{ x: -0.5, y: -0.9 }}
          riderArmsUp={f >= S4.flip}
        />
      </g>
      {f < CUTS[4] - CUTS[3] && <SkyBanana x={Bn.x} y={Bn.y} scale={B.scale * 0.85} rot={Math.sin(f / 8) * 20 + 180} g={g} />}
      {fading && f < 114 && <Sparkle x={Ts.x} y={Ts.y} size={30} color="#bfe8ff" opacity={0.6} rotate={g * 2} />}
      {f >= S4.l13 && (
        <>
          <circle cx={Ts.x} cy={Ts.y} r={40 + 10 * Math.sin(f / 3)} fill="url(#windGlow)" opacity={ip(f, [S4.l13, S4.l13 + 30], [0.8, 0.25])} />
          <IconBubble x={Ts.x + 90} y={Ts.y - 90} scale={0.55} kind="question" on={ip(f, [S4.l13 + 10, S4.l13 + 18], [0, 1])} g={g} />
        </>
      )}
    </SkyShot>
  );
};

// ---------- Scene 5 (32-37.9s): the cloud platforms; Draco's smoke ring; Kiko's sneaky push ----------
const S5 = { fire: FIRE - CUTS[4], ring: RING - CUTS[4], move: KIKO_MOVE - CUTS[4], pop: POP - CUTS[4], land: PLAT_LAND - CUTS[4], l15: L15 - CUTS[4] };
const WHEEL: V3 = [TOWER[0] + 1.6, TOWER[1] + 2.4 + 1.1, TOWER[2] + 5.4];

const Scene5: React.FC = () => {
  const f = useCurrentFrame();
  const g = f + CUTS[4];
  const t = g / 30;
  const cam = camAt(f, [
    [0, { pos: [TOWER[0] + 4.6, TOWER[1] + 3.3, TOWER[2] + 10.6], target: [TOWER[0] + 2.4, TOWER[1] + 3.0, TOWER[2] + 6.5], fov: 46 }],
    [49, { pos: [TOWER[0] + 4.5, TOWER[1] + 3.35, TOWER[2] + 10.3], target: [TOWER[0] + 2.4, TOWER[1] + 3.0, TOWER[2] + 6.5], fov: 46 }],
    [50, { pos: [TOWER[0] + 7.2, TOWER[1] + 3.2, TOWER[2] + 12.6], target: [TOWER[0] + 3.8, TOWER[1] + 2.4, TOWER[2] + 7.0], fov: 54 }],
    [95, { pos: [TOWER[0] + 7.0, TOWER[1] + 3.3, TOWER[2] + 12.2], target: [TOWER[0] + 3.6, TOWER[1] + 2.6, TOWER[2] + 7.0], fov: 54 }],
    [96, { pos: [TOWER[0] + 4.4, TOWER[1] + 3.6, TOWER[2] + 9.9], target: [TOWER[0] + 3.0, TOWER[1] + 3.4, TOWER[2] + 6.5], fov: 44 }],
    [177 + XF, { pos: [TOWER[0] + 4.3, TOWER[1] + 3.65, TOWER[2] + 9.6], target: [TOWER[0] + 3.0, TOWER[1] + 3.4, TOWER[2] + 6.5], fov: 44 }],
  ]);
  const p0 = platformAt(0, t);
  const p1 = platformAt(1, t);
  const p2 = platformAt(2, t);
  // Kiko's sneaky push makes Bobo's platform spring up and launch him onto the next one
  const spring = ip(f, [S5.pop - 4, S5.pop, S5.pop + 8], [0, -0.2, 0.5], Easing.out(Easing.quad));
  const launchK = ip(f, [S5.pop, S5.land], [0, 1]);
  const bFrom = up(p0, 0.0);
  const bTo = up([p1[0] + 0.35, p1[1], p1[2] + 0.2], 0);
  const boboP: V3 = f < S5.pop ? up(p0, spring) : f < S5.land ? up(lerp3(bFrom, bTo, launchK), Math.sin(launchK * Math.PI) * 2.0) : bTo;
  const B = place(cam, boboP, BOBO_S);
  const K = place(cam, f < S5.move - 16 ? [p0[0] - 0.6, p0[1], p0[2] + 0.1] : [p0[0] + 0.55, p0[1], p0[2] - 0.2], KIKO_S);
  const D = place(cam, [p1[0] - 0.45, p1[1], p1[2]], DRACO_S);
  const L = place(cam, [p2[0], p2[1], p2[2]], LUMI_S);
  const N = place(cam, [p2[0] + 0.9, p2[1], p2[2] + 0.3], NIMBUS_S);
  const W = screen(cam, WHEEL);
  const dm = { x: D.x, y: D.y - 168 * D.scale };
  const flying = f >= S5.pop && f < S5.land;
  const sneaky = f >= S5.move - 16 && f < S5.pop + 6;
  return (
    <SkyShot cam={cam} G={g}>
      {/* the wind wheel Draco tries to start */}
      <g transform={`translate(${W.x} ${W.y}) scale(${place(cam, WHEEL, 1).scale})`}>
        <rect x={-8} y={0} width={16} height={260} fill="#c8b8f0" />
        <g transform={`rotate(${f >= 95 ? 0 : Math.sin(f / 30) * 4})`}>
          {[0, 90, 180, 270].map((a) => (
            <path key={a} d="M 0 0 L 70 -20 Q 90 0 70 20 Z" fill={a % 180 ? "#7fc8ff" : "#ff8fb0"} stroke="#ffffff" strokeWidth={4} transform={`rotate(${a})`} />
          ))}
          <circle r={14} fill="#ffd36a" />
        </g>
      </g>
      <Lumi x={L.x} y={L.y} scale={L.scale} look={flying ? lookAtPt(L, B, 300) : { x: 0.6, y: 0.4 }} expr={flying ? "surprised" : "happy"} armR={-60} armL={22} blink={blinkAt(g, 1)} />
      <Worn L={L} g={g} />
      <Nimbus x={N.x} y={N.y} scale={N.scale} g={g} mood={flying ? "surprised" : "happy"} look={{ x: -0.6, y: 0.3 }} blink={blinkAt(g, 7)} float={110} />
      <Draco
        x={D.x}
        y={D.y}
        scale={D.scale}
        g={g}
        mood={f >= S5.fire - 12 && f < S5.fire ? "effort" : f >= S5.fire && f < S5.ring + 20 ? "surprised" : f >= S5.ring + 20 && f < 95 ? "joy" : "happy"}
        look={f < 95 ? { x: -0.8, y: -0.3 } : lookAtPt(D, B, 300)}
        blink={blinkAt(g, 5)}
        wing={0.7}
        armsUp={f >= S5.fire - 12 && f < S5.fire ? 0.8 : 0.3}
        breath={ip(f, [S5.fire - 12, S5.fire - 1, S5.fire], [0, 1, 0])}
        headTilt={f >= S5.ring + 20 && f < 95 ? -8 : 0}
        glow={0.45}
      />
      <SmokePuff x={dm.x - 30 * D.scale} y={dm.y} scale={D.scale * 0.6} age={ip(f, [S5.fire, S5.fire + 20], [0, 1])} />
      <SmokeRing from={{ x: dm.x - 40 * D.scale, y: dm.y }} head={{ x: D.x, y: D.y - 300 * D.scale }} scale={D.scale} age={ip(f, [S5.fire + 2, S5.ring + 26], [0, 1])} g={g} />
      <Kiko
        x={K.x}
        y={K.y}
        scale={K.scale}
        g={g}
        mood={f >= S5.pop + 4 ? "joy" : sneaky ? "happy" : "excited"}
        look={sneaky ? { x: 0.8, y: 0.2 } : flying ? lookAtPt(K, B, 300) : { x: 0.4, y: -0.2 }}
        blink={sneaky ? 0.55 : blinkAt(g, 11)}
        armL={sneaky ? 150 : 20}
        armR={f >= S5.pop - 6 && f < S5.pop + 4 ? -95 : -20}
        legs={0}
        lean={f >= S5.pop + 4 ? Math.sin(f * 1.2) * 6 : sneaky ? -8 : 0}
        tailSwish={1.2}
      />
      <g transform={`rotate(${flying ? Math.sin(launchK * 8) * 25 : 0} ${B.x} ${B.y - 200 * B.scale})`}>
        <BoboRider
          g={g}
          x={B.x}
          y={B.y}
          scale={B.scale}
          look={flying ? { x: 0, y: -0.3 } : f >= S5.l15 ? { x: -0.6, y: 0 } : { x: -0.3, y: 0.3 }}
          expr={flying ? "surprised" : f >= S5.land ? "effort" : "happy"}
          mouth={flying ? 0.75 : mouthAt("bobo", g)}
          armL={flying ? 150 + Math.sin(f) * 25 : f >= S5.l15 ? 100 : 20}
          armR={flying ? -150 - Math.sin(f) * 25 : f >= S5.l15 ? -100 : -20}
          squash={ip(f, [S5.land, S5.land + 3, S5.land + 9], [1, 0.82, 1])}
          headTilt={talk("bobo", g)}
          blink={blinkAt(g, 3)}
          riderArmsUp={flying}
        />
      </g>
      {flying && <IconBubble x={B.x + 160 * B.scale} y={B.y - 560 * B.scale} scale={B.scale * 0.75} kind="bang" on={ip(f, [S5.pop, S5.pop + 6], [0, 1])} g={g} />}
    </SkyShot>
  );
};

// ---------- Scene 6 (37.9-46s): the crystal chamber; Nimbus's brave, controlled wind ----------
const Cp = (x: number, z: number): V3 => [TOWER[0] + x, CHAMBER_Y + 0.4, TOWER[2] + z];
const T_LUMI = Cp(-0.6, 3.3);
const T_NIMBUS = Cp(0.25, 3.6);
const T_DRACO = Cp(1.65, 3.0);
const T_KIKO = Cp(-1.5, 3.0);
const T_BOBO = Cp(0.95, 3.9);
const BASKET_AT = Cp(1.4, 1.8);
const S6 = { l16: L16 - CUTS[5], l17: L17 - CUTS[5], breath: BREATH - CUTS[5], blow: BLOW - CUTS[5], blown: BLOWN - CUTS[5], basket: BASKET - CUTS[5], free: FREE - CUTS[5], light: LIGHT - CUTS[5] };

const Scene6: React.FC = () => {
  const f = useCurrentFrame();
  const g = f + CUTS[5];
  const t = g / 30;
  const aerial = f >= S6.light - 6;
  const cam = aerial
    ? { pos: lerp3([TOWER[0] + 12, CHAMBER_Y + 4, TOWER[2] + 24], [TOWER[0] + 26, CHAMBER_Y + 8, TOWER[2] + 40], ip(f, [S6.light - 6, 243 + XF], [0, 1], EASE)), target: lerp3([TOWER[0], CHAMBER_Y + 1, TOWER[2]], [TOWER[0] + 12, CHAMBER_Y - 9, TOWER[2] + 4], ip(f, [S6.light - 6, 243 + XF], [0, 1], EASE)), fov: 60 }
    : camAt(f, [
        [0, { pos: [TOWER[0] + 0.7, CHAMBER_Y + 1.35, TOWER[2] + 7.0], target: [TOWER[0] + 0.3, CHAMBER_Y + 1.2, TOWER[2] + 3.6], fov: 44 }],
        [56, { pos: [TOWER[0] + 0.7, CHAMBER_Y + 1.35, TOWER[2] + 6.7], target: [TOWER[0] + 0.3, CHAMBER_Y + 1.2, TOWER[2] + 3.6], fov: 44 }],
        [57, { pos: [TOWER[0] - 0.1, CHAMBER_Y + 1.35, TOWER[2] + 7.3], target: [TOWER[0] - 0.2, CHAMBER_Y + 1.3, TOWER[2] + 3.4], fov: 48 }],
        [S6.breath - 1, { pos: [TOWER[0] - 0.1, CHAMBER_Y + 1.35, TOWER[2] + 7.0], target: [TOWER[0] - 0.2, CHAMBER_Y + 1.3, TOWER[2] + 3.4], fov: 48 }],
        [S6.breath, { pos: [TOWER[0] + 0.1, CHAMBER_Y + 1.6, TOWER[2] + 9.2], target: [TOWER[0] + 0.1, CHAMBER_Y + 1.6, TOWER[2] + 2.2], fov: 56 }],
        [S6.light - 7, { pos: [TOWER[0] + 0.1, CHAMBER_Y + 1.7, TOWER[2] + 9.6], target: [TOWER[0] + 0.1, CHAMBER_Y + 1.8, TOWER[2] + 2.2], fov: 56 }],
      ]);
  const L = place(cam, T_LUMI, LUMI_S);
  const N = place(cam, T_NIMBUS, NIMBUS_S);
  const D = place(cam, T_DRACO, DRACO_S);
  const K = place(cam, T_KIKO, KIKO_S);
  const blownK = ip(f, [S6.blown, S6.basket], [0, 1]);
  const bp: V3 = f < S6.blown ? T_BOBO : up(lerp3(T_BOBO, up(BASKET_AT, 0.45), blownK), Math.sin(blownK * Math.PI) * 1.3);
  const B = place(cam, bp, BOBO_S);
  const Bk = place(cam, BASKET_AT, BOBO_S * 0.9);
  const inBasket = f >= S6.basket;
  const puff = ip(f, [S6.breath, S6.blow - 2, S6.blow + 6], [0, 1, 0.2]);
  const blowing = f >= S6.blow && f < S6.free + 8;
  const freed = f >= S6.free;
  const nMouth = mouthAt("nimbus", g);
  const nMood = blowing ? "blow" : puff > 0.3 ? "puff" : f >= S6.l17 ? (f >= S6.l17 + 40 ? "brave" : "surprised") : nMouth > 0.06 || f < S6.l17 ? "scared" : "happy";
  const nm = nimbusMouth(N.x, N.y, N.scale, 140);
  const Cs = screen(cam, CRYSTAL_AT);
  const guide = ip(f, [S6.blow + 6, S6.blow + 16], [0, 1]);
  const kf = kikoHand(K.x, K.y, K.scale, -130);
  const lMouth = mouthAt("lumi", g);
  return (
    <SkyShot
      cam={cam}
      G={g}
      vortex={ip(f, [S6.free - 4, S6.free + 4], [1, 0])}
      world={
        <>
          <SkyCrystal position={freed ? up(CRYSTAL_AT, ip(f, [S6.free, S6.free + 20], [0, 0.6], OUT)) : CRYSTAL_AT} t={t} glow={freed ? ip(f, [S6.free, S6.light], [0.6, 2.2]) : 0.25 + 0.1 * Math.sin(t * 3)} scale={freed ? 1.2 : 0.9} />
          <SparkleBurst3D position={CRYSTAL_AT} age={ip(f, [S6.free, S6.free + 40], [0, 1])} reach={8} count={220} seed={33} size={16} colors={["#bfe8ff", "#ffffff", "#ffb0e0", "#c8a8ff", "#a8ffe0"]} />
          <LightRing position={CRYSTAL_AT} age={ip(f, [S6.light, S6.light + 60], [0, 1])} radius={140} color="#cfe8ff" />
          <LightRing position={CRYSTAL_AT} age={ip(f, [S6.light + 6, S6.light + 66], [0, 1])} radius={120} flat={false} color="#ffd0f0" />
        </>
      }
      over={f >= S6.free && f < S6.free + 16 ? <AbsoluteFill style={{ background: "#f0f8ff", opacity: ip(f, [S6.free, S6.free + 2, S6.free + 16], [0, 0.45, 0]) }} /> : undefined}
    >
      {!aerial && (
        <>
          {inBasket && <BasketBack x={Bk.x} y={Bk.y} scale={Bk.scale} g={g} bounce={ip(f, [S6.basket, S6.basket + 4, S6.basket + 20], [0, 1, 0])} />}
          {!inBasket && f >= S6.breath && <BasketBack x={Bk.x} y={Bk.y} scale={Bk.scale} g={g} />}
          <Kiko
            x={K.x}
            y={K.y}
            scale={K.scale}
            g={g}
            mood={blowing ? "excited" : freed ? "joy" : f >= S6.blown && f < S6.basket + 20 ? "joy" : "worried"}
            look={blowing ? lookAtPt(K, Cs, 300) : { x: 0.6, y: 0 }}
            blink={blinkAt(g, 11)}
            armL={20}
            armR={blowing ? -130 + Math.sin(f * 0.7) * 30 : -20}
            tailSwish={1.3}
          />
          {blowing && <LeafFan x={kf.x} y={kf.y} scale={K.scale * 1.1} rot={-40 + Math.sin(f * 0.7) * 30} />}
          <Lumi
            x={L.x}
            y={L.y}
            scale={L.scale}
            look={f >= S6.l17 && f < S6.breath ? lookAtPt(L, { x: N.x, y: N.y - 140 * N.scale }, 300) : lookAtPt(L, Cs, 300)}
            expr={freed ? "excited" : lMouth > 0.06 ? "happy" : f >= S6.l17 ? "happy" : "neutral"}
            mouth={lMouth}
            armR={f >= S6.l17 && f < S6.breath ? -70 + Math.sin(f / 5) * 8 : freed ? -150 : -22}
            armL={freed ? 150 : 22}
            headTilt={talk("lumi", g) + (f >= S6.l17 && f < S6.breath ? 6 : 0)}
            blink={blinkAt(g, 1)}
          />
          <Worn L={L} g={g} />
          <Draco
            x={D.x}
            y={D.y}
            scale={D.scale}
            g={g}
            mood={blowing ? "effort" : freed ? "joy" : "surprised"}
            look={blowing ? lookAtPt(D, Cs, 300) : { x: -0.6, y: 0 }}
            blink={blinkAt(g, 5)}
            wing={blowing ? 1 : 0.5}
            flap={blowing ? Math.sin(f * 1.3) * 30 : 0}
            armsUp={blowing ? 0.6 : freed ? 0.9 : 0.2}
            glow={0.45}
          />
          {!inBasket && (
            <g transform={`rotate(${f >= S6.blown ? blownK * 200 : 0} ${B.x} ${B.y - 200 * B.scale})`}>
              <BoboRider g={g} x={B.x} y={B.y} scale={B.scale} look={{ x: -0.4, y: -0.2 }} expr={f >= S6.blown ? "surprised" : "happy"} mouth={f >= S6.blown ? 0.7 : 0} armL={f >= S6.blown ? 150 : 25} armR={f >= S6.blown ? -150 : -25} blink={blinkAt(g, 3)} riderArmsUp={f >= S6.blown} />
            </g>
          )}
          {inBasket && (
            <>
              <BoboRider g={g} x={Bk.x} y={Bk.y - 40 * Bk.scale} scale={B.scale} look={{ x: -0.4, y: -0.6 }} expr={f < S6.basket + 25 ? "surprised" : "happy"} armL={110} armR={-110} squash={ip(f, [S6.basket, S6.basket + 3, S6.basket + 10], [1, 0.8, 1])} blink={blinkAt(g, 3)} riderLook={{ x: 0, y: -1 }} riderHappy />
              <BasketFront x={Bk.x} y={Bk.y} scale={Bk.scale} />
            </>
          )}
          <Nimbus x={N.x} y={N.y} scale={N.scale} g={g} mood={nMood} mouth={blowing ? 0 : nMouth} look={blowing || puff > 0.3 ? lookAtPt(N, Cs, 300) : f >= S6.l17 ? { x: -0.7, y: 0 } : { x: 0, y: 0.2 }} blink={blinkAt(g, 7)} float={140} puff={puff} tilt={f < S6.l17 ? Math.sin(f * 1.7) * 3 : talk("nimbus", g)} squash={blowing ? 0.94 + Math.sin(f) * 0.02 : 1} />
          <WindRibbon from={nm} to={Cs} on={blowing ? ip(f, [S6.blow, S6.blow + 6], [0, 1]) : 0} g={g} width={80 * N.scale + 30} bend={guide * Math.sin(f / 6) * 60} />
          {blowing && <SneezeGust x={nm.x} y={nm.y} scale={N.scale * 1.2} age={ip(f, [S6.blown - 4, S6.blown + 14], [0, 1])} dir={1} />}
          {freed && <SparkBurst f={f} at={S6.free} x={Cs.x} y={Cs.y} reach={420} count={28} size={20} life={30} rainbow />}
        </>
      )}
    </SkyShot>
  );
};

// ---------- Scene 7 (46-57.4s): celebration; the banana cloud; the seashell and a glimpse of Episode 11 ----------
const S7 = { cloud: CLOUD - CUTS[6], l18: L18 - CUTS[6], swipe: SWIPE - CUTS[6], chomp: CHOMP - CUTS[6], laugh: LAUGH - CUTS[6], shell: SHELL - CUTS[6], project: PROJECT - CUTS[6], l19: L19 - CUTS[6], end: END - CUTS[6] };
const SHELL_AT = Cp(-0.4, 1.8);
const CAVE_HOLO: V3 = [TOWER[0] - 0.6, CHAMBER_Y + 2.6, TOWER[2] + 1.9];

const Scene7: React.FC = () => {
  const f = useCurrentFrame();
  const g = f + CUTS[6];
  const t = g / 30;
  const cam = camAt(f, [
    [0, { pos: [TOWER[0] + 0.2, CHAMBER_Y + 1.9, TOWER[2] + 10.4], target: [TOWER[0] + 0.1, CHAMBER_Y + 2.1, TOWER[2] + 1.8], fov: 58 }],
    [26, { pos: [TOWER[0] + 0.2, CHAMBER_Y + 1.85, TOWER[2] + 10.0], target: [TOWER[0] + 0.1, CHAMBER_Y + 2.0, TOWER[2] + 1.8], fov: 58 }],
    [27, { pos: [TOWER[0] + 1.2, CHAMBER_Y + 1.3, TOWER[2] + 7.0], target: [TOWER[0] + 0.8, CHAMBER_Y + 1.25, TOWER[2] + 3.5], fov: 46 }],
    [122, { pos: [TOWER[0] + 1.2, CHAMBER_Y + 1.3, TOWER[2] + 6.7], target: [TOWER[0] + 0.8, CHAMBER_Y + 1.25, TOWER[2] + 3.5], fov: 46 }],
    [123, { pos: [TOWER[0] - 0.5, CHAMBER_Y + 1.25, TOWER[2] + 6.4], target: [TOWER[0] - 0.6, CHAMBER_Y + 1.5, TOWER[2] + 2.6], fov: 48 }],
    [S7.l19 + 10, { pos: [TOWER[0] - 0.4, CHAMBER_Y + 1.3, TOWER[2] + 6.6], target: [TOWER[0] - 0.6, CHAMBER_Y + 1.7, TOWER[2] + 2.6], fov: 50 }],
    [342, { pos: [TOWER[0] - 0.1, CHAMBER_Y + 1.6, TOWER[2] + 9.8], target: [TOWER[0] - 0.4, CHAMBER_Y + 2.4, TOWER[2] + 1.8], fov: 58 }],
  ]);
  const hop = (ph: number) => (f < 26 ? Math.abs(Math.sin((f + ph) / 5)) * 0.3 : 0);
  const L = place(cam, up(T_LUMI, hop(0)), LUMI_S);
  const N = place(cam, T_NIMBUS, NIMBUS_S);
  const D = place(cam, up(T_DRACO, hop(2)), DRACO_S);
  const K0 = place(cam, up(T_KIKO, hop(3)), KIKO_S);
  const B = place(cam, up(Cp(1.0, 3.6), hop(4)), BOBO_S);
  // the banana cloud floats down; Bobo holds it up to his mouth; Kiko swings past and steals it
  const bc0 = place(cam, up(Cp(1.6, 3.4), 1.9), 1);
  const caught = f >= S7.l18 - 4;
  const toMouth = ip(f, [S7.swipe - 12, S7.swipe - 4], [0, 1], EASE);
  const bh = { x: B.x + lerp(170, 60, toMouth) * B.scale, y: B.y - lerp(430, 280, toMouth) * B.scale };
  const swiped = f >= S7.swipe;
  const swipeK = ip(f, [S7.swipe - 4, S7.swipe + 6], [0, 1], Easing.inOut(Easing.quad));
  const kSwing = f >= S7.swipe - 8 && f < S7.swipe + 14;
  const K = kSwing ? { x: lerp(B.x - 300 * B.scale, B.x + 380 * B.scale, ip(f, [S7.swipe - 8, S7.swipe + 14], [0, 1])), y: B.y - 80 * B.scale - Math.sin(ip(f, [S7.swipe - 8, S7.swipe + 14], [0, 1]) * Math.PI) * 140 * B.scale, scale: K0.scale } : swiped ? place(cam, Cp(2.4, 3.3), KIKO_S) : K0;
  const kh = kikoHand(K.x, K.y, K.scale, -140);
  const bcPos = !caught ? { x: bc0.x, y: lerp(bc0.y - 300, bc0.y, ip(f, [S7.cloud - CUTS[6] + CUTS[6], S7.l18], [0, 1])) } : swiped ? { x: lerp(bh.x, kh.x, swipeK), y: lerp(bh.y, kh.y, swipeK) } : bh;
  const laughing = f >= S7.laugh && f < S7.shell - 6;
  const chomped = f >= S7.chomp && f < S7.chomp + 24;
  const project = ip(f, [S7.project, S7.project + 22], [0, 1], OUT);
  const shellOn = f >= S7.shell;
  const Sh = screen(cam, SHELL_AT);
  const lFind = shellOn;
  const lh = lumiHand(L.x, L.y, L.scale, lFind ? ip(f, [S7.shell, S7.shell + 10], [-20, -100], EASE) : -22);
  const shellPos = f < S7.shell + 10 ? Sh : { x: lh.x, y: lh.y + 18 * L.scale };
  const Hs = screen(cam, up(CAVE_HOLO, 0.6));
  const lookH = (who: { x: number; y: number }) => (f >= S7.project ? lookAtPt(who, Hs, 380) : lookAtPt(who, Sh, 300));
  const lMouth = mouthAt("lumi", g);
  return (
    <SkyShot
      cam={cam}
      G={g}
      vortex={0}
      world={
        <>
          <SkyCrystal position={up(CRYSTAL_AT, 0.6)} t={t} glow={1.6} scale={1.2} />
          <CaveHologram position={CAVE_HOLO} t={t} on={project} scale={0.6} />
          <SparkleBurst3D position={up(CAVE_HOLO, 0.4)} age={ip(f, [S7.project, S7.project + 34], [0, 1])} reach={2.4} count={120} seed={44} colors={["#7fe8ff", "#ffffff", "#bff4ff", "#ff9fd0"]} />
        </>
      }
      over={
        <>
          <EndCard at={S7.end} top={250} />
          <AbsoluteFill style={{ alignItems: "center", fontFamily }}>
            <div style={{ position: "absolute", top: 410, fontSize: 40, fontWeight: 600, color: "#bff4ff", opacity: ip(f, [S7.end + 20, S7.end + 36], [0, 1]), textShadow: "0 0 8px rgba(10, 40, 90, 1), 0 3px 12px rgba(10, 40, 90, 1)" }}>Next: The Secret of the Underwater Cave 🐚</div>
          </AbsoluteFill>
        </>
      }
    >
      {shellOn && (
        <path d={`M ${shellPos.x - 10} ${shellPos.y} L ${Hs.x - 170 * project} ${Hs.y + 130} L ${Hs.x + 170 * project} ${Hs.y + 130} L ${shellPos.x + 10} ${shellPos.y} Z`} fill="#9fe8ff" opacity={0.2 * project} />
      )}
      {!kSwing && <Kiko
        x={K.x}
        y={K.y}
        scale={K.scale}
        g={g}
        mood={laughing || (swiped && f < S7.shell) ? "joy" : kSwing ? "excited" : f >= S7.project ? "surprised" : "excited"}
        look={f >= S7.shell ? lookH(K) : { x: -0.6, y: 0 }}
        blink={blinkAt(g, 11)}
        armL={kSwing ? 150 : laughing ? 60 : f < 26 ? 140 : 20}
        armR={kSwing || (swiped && f < S7.shell) ? -140 : f < 26 ? -140 : -20}
        legs={kSwing ? 1 : f < 26 && hop(3) > 0.05 ? 0.6 : 0}
        lean={laughing ? Math.sin(f * 1.3) * 7 : 0}
        tailSwish={1.6}
      />}
      <Lumi
        x={L.x}
        y={L.y}
        scale={L.scale}
        look={f >= S7.shell ? lookH(L) : laughing ? { x: 0.7, y: 0 } : { x: 0.3, y: -0.4 }}
        expr={lMouth > 0.06 ? "excited" : f >= S7.project ? "surprised" : laughing ? "happy" : "excited"}
        mouth={lMouth}
        armR={lFind ? ip(f, [S7.shell, S7.shell + 10], [-20, -100], EASE) : f < 26 ? -150 : -22}
        armL={f < 26 ? 150 : 22}
        headTilt={talk("lumi", g) + (laughing ? -5 : 0)}
        blink={blinkAt(g, 1)}
      />
      <Worn L={L} g={g} glow={0.9} />
      {shellOn && <GlowShell x={shellPos.x} y={shellPos.y} scale={0.95 * L.scale * ip(f, [S7.shell, S7.shell + 8], [0.4, 1], BACK(2))} g={g} glow={0.5 + project * 0.5} />}
      <Draco x={D.x} y={D.y} scale={D.scale} g={g} mood={laughing ? "joy" : f >= S7.project ? "surprised" : "joy"} look={f >= S7.shell ? lookH(D) : { x: -0.5, y: 0 }} blink={blinkAt(g, 5)} wing={f < 26 ? 1 : 0.6} flap={f < 26 ? Math.sin(f * 0.8) * 24 : 0} armsUp={f < 26 ? 0.9 : 0.3} squash={laughing ? 1 + Math.sin(f * 2) * 0.04 : 1} glow={0.5} />
      <BoboRider
        g={g}
        x={B.x}
        y={B.y}
        scale={B.scale}
        look={chomped ? { x: 0.9, y: 0 } : caught && !swiped ? { x: 0.3, y: -0.5 } : f >= S7.shell ? lookH(B) : { x: 0.5, y: -0.7 }}
        expr={chomped ? "surprised" : laughing ? "happy" : caught ? "excited" : "excited"}
        mouth={chomped && f < S7.chomp + 4 ? 0.95 : mouthAt("bobo", g)}
        armL={caught && !swiped ? 40 : f < 26 ? 150 : 20}
        armR={caught && !swiped ? -150 : f < 26 ? -150 : -20}
        headTilt={talk("bobo", g)}
        blink={caught && !swiped && f > S7.l18 + 20 ? 0.1 : blinkAt(g, 3)}
        riderLook={{ x: 0.2, y: -0.8 }}
        riderHappy={laughing}
      />
      {f >= S7.cloud && f < S7.shell && <BananaCloud x={bcPos.x} y={bcPos.y} scale={B.scale * 0.95} rot={swiped ? 20 : -10} g={g} />}
      {kSwing && <Kiko x={K.x} y={K.y} scale={K.scale} g={g} mood="excited" look={{ x: 0.6, y: 0.4 }} blink={1} armL={150} armR={-140} legs={1} tailSwish={2} />}
      {chomped && <IconBubble x={B.x - 170 * B.scale} y={B.y - 560 * B.scale} scale={B.scale * 0.75} kind="bang" on={ip(f, [S7.chomp, S7.chomp + 6], [0, 1])} g={g} tail={1} />}
      <Nimbus x={N.x} y={N.y} scale={N.scale} g={g} mood={laughing ? "joy" : f >= S7.project ? "surprised" : "joy"} look={f >= S7.shell ? lookH(N) : { x: 0, y: 0 }} blink={blinkAt(g, 7)} float={f < 26 ? 150 + Math.sin(f / 4) * 40 : 140} tilt={f < 26 ? Math.sin(f / 3) * 20 : 0} />
      {f < 26 && <SparkBurst f={f} at={0} x={540} y={700} reach={520} count={26} size={18} life={30} rainbow />}
      {shellOn && f < S7.shell + 20 && <Sparkle x={Sh.x} y={Sh.y} size={ip(f, [S7.shell, S7.shell + 6, S7.shell + 20], [10, 70, 0])} color="#bff4ff" rotate={f * 4} />}
    </SkyShot>
  );
};

export const Episode: React.FC = () => <EpisodeFrame audio="ep10/audio.wav" cuts={CUTS} scenes={[Scene1, Scene2, Scene3, Scene4, Scene5, Scene6, Scene7]} />;
