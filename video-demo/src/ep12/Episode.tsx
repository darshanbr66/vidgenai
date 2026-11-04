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
import { AirBubble, BUBBLE_FIT, Ep6Defs } from "../ep06/props";
import { Ep7Defs, WarmBreath } from "../ep07/props";
import { BoboBigEyes, Branch, DracoBlush, Ep8Defs, FallingLeaf, Kiko, kikoHand, SweatDrop } from "../ep08/props";
import { floorY } from "../ep08/world";
import { DizzyStars, Ep9Defs, GoldenBanana, IconBubble, ShakeLines } from "../ep09/props";
import { Ep10Defs } from "../ep10/props";
import { Bloop, Ep11Defs, KIKO_FIT } from "../ep11/props";
import { ClockTowerHologram, WC_CRYSTAL, WhisperCave, WhisperCrystal } from "../ep11/world";
import { BUTTON, ClockInterior, CRANK, FROZEN_GEAR, Gear, GEAR_GARDEN, MASTER, PENDULUMS, PORTAL_A, PORTAL_B, RainbowBridgeHologram, TimeForest, TOWER, TOWER_FACE_Y } from "./world";
import { Apple, BananaPeel, ClockBox, ClockHand2D, DracoBack, Ep12Defs, LoopButton, LoopCount, PocketClock, RewindOverlay, Tock } from "./props";

// Episode 12: The Secret of the Ancient Clock Tower

const mouthAt = makeMouthAt(timeline);
export const CUTS = [0, 66, 477, 861, 1233, 1662, 2043, 2514];
const BACK = (s: number) => Easing.out(Easing.back(s));
const lerp = (a: number, b: number, k: number) => a + (b - a) * k;
const lerp3 = (a: V3, b: V3, k: number): V3 => [lerp(a[0], b[0], k), lerp(a[1], b[1], k), lerp(a[2], b[2], k)];
const up = (p: V3, h: number): V3 => [p[0], p[1] + h, p[2]];
const clamp1 = (v: number) => Math.max(-1, Math.min(1, v));
const lookAtPt = (who: { x: number; y: number }, p: { x: number; y: number }, h = 300) => ({ x: clamp1((p.x - who.x) / 260), y: clamp1((p.y - (who.y - h)) / 300) });
const talk = (who: string, g: number) => Math.sin(g / 4.3 + who.length) * 4.5 * Math.min(1, mouthAt(who, g) * 3);
type Pt = { x: number; y: number; scale: number };

const LUMI_S = 1;
const BOBO_S = 0.91;
const DRACO_S = 1.05;
const KIKO_S = 0.8;
const TOCK_S = 0.62;
const BLOOP_S = 0.85;

// ---- timed moments in frames; the same numbers (in seconds) are in scripts/ep12_audio.py ----
const APPLE_FALL = 96;
const APPLE_UP = 117;
const KIKO_BACK = 192;
const PEEL_GONE = 216;
const PEEL_BACK = 234;
const L2 = 264;
const SPIN = 345;
const L3 = 390;
const TOCK_FLY = 558;
const L5 = 606;
const L6 = 717;
const L7 = 763;
const L8 = 813;
const LOOP1 = 885;
const LOOP_LEN = 30;
const REWIND_LEN = 9;
const DANCE = 999;
const DANCE_LEN = 26;
const L9 = 1065;
const PORTAL_IN = 1137;
const PORTAL_OUT = 1158;
const L10 = 1167;
const L11 = 1239;
const L12 = 1380;
const SPLIT = 1434;
const KIKO_GEAR = 1458;
const HAND1 = 1506;
const BITE = 1542;
const L13 = 1551;
const L14 = 1608;
const L15 = 1671;
const L16 = 1762;
const FIRE = 1824;
const CRANK_T = 1848;
const BUTTON_T = 1869;
const L17 = 1914;
const HANDS = 1938;
const TICK = 1959;
const L18 = 1974;
const PRANK = 2094;
const L19 = 2109;
const BOX = 2190;
const KIKO_GRAB = 2217;
const CATCH = 2226;
const L20 = 2232;
const PROJECT = 2286;
const L21 = 2298;
const END = 2406;

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
    <Ep12Defs lit={lit} />
  </>
);

// ---------- Scene 0 (0-2.2s): the Whisper Crystal's hologram of the clock tower (where Episode 11 ended) ----------
const Scene0: React.FC = () => {
  const f = useCurrentFrame();
  const g = f;
  const t = g / 30;
  const cam = camAt(f, [
    [0, { pos: [-0.2, 1.8, 9.4], target: [-0.1, 2.6, -1.0], fov: 58 }],
    [66 + XF, { pos: [-0.1, 3.0, 1.6], target: [0, 3.3, -3.6], fov: 50 }],
  ]);
  const cv = (x: number, z: number): V3 => [x, 0, z];
  const L = place(cam, cv(-1.3, 2.6), LUMI_S);
  const D = place(cam, cv(1.1, 2.4), DRACO_S);
  const B = place(cam, cv(2.2, 2.8), BOBO_S);
  const K = place(cam, cv(-2.5, 2.2), KIKO_S);
  const BL = place(cam, cv(0.45, 3.2), BLOOP_S);
  const Hs = screen(cam, [0, 3.6, -3.6]);
  const look = (w: Pt) => lookAtPt(w, Hs, 380);
  return (
    <AbsoluteFill style={{ background: "#0a2048" }}>
      <World3D cam={cam} bloom={0.75} threshold={0.75}>
        <WhisperCave t={t} alive={1} />
        <WhisperCrystal t={t} glow={1.4} pieces={3} />
        <ClockTowerHologram position={[0, 3.3, -3.6]} t={t} on={1} scale={0.75 + ip(f, [20, 66], [0, 0.5], Easing.in(Easing.quad))} />
      </World3D>
      <CharLayer defs={<Defs />} filter="caveLit">
        <Kiko x={K.x} y={K.y} scale={K.scale} g={g} mood="surprised" look={look(K)} blink={blinkAt(g, 11)} armL={30} armR={-30} tailSwish={1} />
        <Lumi x={L.x} y={L.y} scale={L.scale} look={look(L)} expr="excited" armR={-120} armL={22} blink={blinkAt(g, 1)} />
        <Worn L={L} g={g} />
        <Draco x={D.x} y={D.y} scale={D.scale} g={g} mood="surprised" look={look(D)} blink={blinkAt(g, 5)} wing={0.7} glow={0.45} />
        <BoboRider g={g} x={B.x} y={B.y} scale={B.scale} look={look(B)} expr="surprised" armL={30} armR={-30} blink={blinkAt(g, 3)} />
        <Bloop x={BL.x} y={BL.y} scale={BL.scale} g={g} mood="joy" look={look(BL)} blink={blinkAt(g, 15)} float={120} wave={1} />
        {[K, L, D, B].map((p, i) => (
          <AirBubble key={i} x={p.x} y={p.y} scale={p.scale} g={g} fit={[KIKO_FIT, BUBBLE_FIT.lumi, BUBBLE_FIT.draco, BUBBLE_FIT.bobo][i]} ph={i} opacity={0.5} />
        ))}
      </CharLayer>
      <AbsoluteFill style={{ background: "radial-gradient(circle at 50% 40%, #fffbe0 0%, #c8ffc8 55%, #4fa86a 100%)", opacity: ip(f, [44, 66 + XF], [0, 1], EASE) }} />
    </AbsoluteFill>
  );
};

// ---------- Scene 1 (2.2-15.9s): the forest where time runs backward ----------
const gp = (x: number, z: number): V3 => [x, floorY(x, z), z];
const S1 = { fall: APPLE_FALL - CUTS[1], upT: APPLE_UP - CUTS[1], kiko: KIKO_BACK - CUTS[1], gone: PEEL_GONE - CUTS[1], back: PEEL_BACK - CUTS[1], l2: L2 - CUTS[1], spin: SPIN - CUTS[1], l3: L3 - CUTS[1] };

const ForestShot: React.FC<{ cam: Cam3; G: number; fixed?: number; world?: React.ReactNode; children: React.ReactNode; over?: React.ReactNode; fade?: boolean }> = ({ cam, G, fixed = 0, world, children, over, fade = true }) => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill style={{ background: "#2a4a2a", opacity: fade ? ip(f, [0, XF], [0, 1]) : 1 }}>
      <World3D cam={cam} bloom={0.7} threshold={0.78}>
        <TimeForest t={G / 30} fixed={fixed} camPos={cam.pos} />
        {world}
      </World3D>
      <CharLayer defs={<Defs />} filter="jungleLit">
        {children}
      </CharLayer>
      {over}
    </AbsoluteFill>
  );
};

const Scene1: React.FC = () => {
  const f = useCurrentFrame();
  const g = f + CUTS[1];
  const walkK = ip(f, [0, 60], [0, 1], Easing.out(Easing.quad));
  const z = (z0: number) => lerp(z0 + 3.5, z0, walkK);
  const cam = camAt(f, [
    [0, { pos: [0.4, 1.6, 2.6], target: [0.2, 1.3, 10.5], fov: 54 }],
    [S1.l2 - 1, { pos: [0.4, 1.6, 3.4], target: [0.2, 1.3, 10.5], fov: 54 }],
    [S1.l2, { pos: [1.4, 1.2, 4.6], target: [1.3, 1.1, 8.4], fov: 46 }],
    [S1.l3 - 1, { pos: [1.4, 1.2, 4.9], target: [1.3, 1.1, 8.4], fov: 46 }],
    [S1.l3, { pos: [-0.3, 1.25, 4.4], target: [-0.6, 1.1, 8.5], fov: 48 }],
    [411 + XF, { pos: [-0.3, 1.25, 4.7], target: [-0.6, 1.1, 8.5], fov: 48 }],
  ]);
  const walking = f < 60;
  // Kiko strolls backward (away from us) as if nothing is unusual
  const kBack = ip(f, [S1.kiko, S1.kiko + 60], [0, 1]);
  const L = place(cam, gp(-0.1, z(8.6)), LUMI_S);
  const K = place(cam, gp(-1.3, z(8.9) + kBack * 2.4), KIKO_S);
  const B = place(cam, gp(-0.6, z(9.6)), BOBO_S);
  const spinning = f >= S1.spin && f < S1.spin + 36;
  const D = place(cam, gp(1.3, z(9.0)), DRACO_S);
  // the apple: falls from its branch, lands, then jumps back up
  const branchA = { x: L.x + 90 * L.scale, y: L.y - 980 * L.scale };
  const branchB = { x: L.x + 520 * L.scale, y: L.y - 940 * L.scale };
  const hang = { x: L.x + 290 * L.scale, y: L.y - 900 * L.scale };
  const ground = { x: L.x + 290 * L.scale, y: L.y - 20 * L.scale };
  const fallK = ip(f, [S1.fall, S1.fall + 12], [0, 1], Easing.in(Easing.quad));
  const upK = ip(f, [S1.upT, S1.upT + 12], [0, 1], Easing.out(Easing.quad));
  const appleY = f < S1.upT ? lerp(hang.y, ground.y, fallK) : lerp(ground.y, hang.y, upK);
  const peelOn = f < S1.gone ? 1 : f < S1.back ? 0 : ip(f, [S1.back, S1.back + 6], [0, 1], BACK(2));
  const peel = { x: B.x + 170 * B.scale, y: B.y + 10 * B.scale };
  const bDouble = f >= S1.gone && f < S1.l2;
  const dMouth = mouthAt("draco", g);
  const lMouth = mouthAt("lumi", g);
  return (
    <ForestShot cam={cam} G={g} fade={false} over={<AbsoluteFill style={{ background: "radial-gradient(circle at 50% 40%, #fffbe0 0%, #c8ffc8 55%, #4fa86a 100%)", opacity: ip(f, [0, 14], [1, 0], EASE) }} />}>
      {/* leaves drifting UP back to the branches */}
      {f < S1.l2 &&
        Array.from({ length: 8 }, (_, i) => {
          const k = ((f / 70 + i / 8) % 1);
          return <FallingLeaf key={i} x={120 + i * 120 + Math.sin(k * 9 + i) * 40} y={1500 - k * 1300} rot={-k * 300 + i * 40} scale={1.6} />;
        })}
      {f < S1.l2 && (
        <>
          <Branch from={branchA} to={branchB} scale={L.scale * 1.4} g={g} />
          <path d={`M ${hang.x} ${branchA.y + 10} L ${hang.x} ${hang.y - 30 * L.scale}`} stroke="#5a3a1a" strokeWidth={5} />
          <Apple x={hang.x} y={appleY} scale={L.scale * 1.3} rot={f >= S1.upT ? -upK * 360 : fallK * 200} />
        </>
      )}
      <Lumi
        x={L.x}
        y={L.y}
        scale={L.scale}
        look={f >= S1.fall && f < S1.kiko ? lookAtPt(L, { x: hang.x, y: appleY }, 330) : { x: 0.2, y: -0.2 }}
        expr={lMouth > 0.06 ? "surprised" : f >= S1.fall && f < S1.kiko ? "surprised" : "happy"}
        mouth={lMouth}
        walk={walking ? f * 0.32 : null}
        armR={f >= S1.upT && f < S1.kiko ? -120 : -22}
        armL={22}
        headTilt={talk("lumi", g)}
        blink={blinkAt(g, 1)}
      />
      <Worn L={L} g={g} />
      <Kiko x={K.x} y={K.y} scale={K.scale} g={g} mood={f >= S1.kiko ? "happy" : "excited"} look={{ x: 0.3, y: 0 }} blink={f >= S1.kiko && f < S1.kiko + 60 ? 0.5 : blinkAt(g, 11)} armL={f >= S1.kiko && f < S1.kiko + 60 ? 30 + Math.sin(f / 4) * 25 : 20} armR={f >= S1.kiko && f < S1.kiko + 60 ? -30 - Math.sin(f / 4) * 25 : -20} legs={f >= S1.kiko && f < S1.kiko + 60 ? Math.abs(Math.sin(f / 4)) * 0.3 : 0} lean={f >= S1.kiko && f < S1.kiko + 60 ? -4 : 0} tailSwish={1.3} />
      {f >= S1.kiko && f < S1.kiko + 60 && <IconBubble x={K.x + 140 * K.scale} y={K.y - 560 * K.scale} scale={K.scale * 0.6} kind="music" on={1} g={g} />}
      <BananaPeel x={peel.x} y={peel.y} scale={B.scale * 1.2} on={peelOn} />
      {(f >= S1.gone && f < S1.gone + 6) || (f >= S1.back && f < S1.back + 6) ? <Sparkle x={peel.x} y={peel.y - 30} size={60} color="#ffffff" rotate={f * 10} /> : null}
      <BoboRider
        g={g}
        x={B.x}
        y={B.y}
        scale={B.scale}
        look={bDouble ? { x: 0.7, y: 0.9 } : f >= S1.l3 ? { x: 0, y: -0.2 } : { x: 0.3, y: -0.4 }}
        expr={bDouble ? "surprised" : mouthAt("bobo", g) > 0.06 ? "happy" : "excited"}
        mouth={mouthAt("bobo", g)}
        walk={walking ? f * 0.3 : null}
        armL={f >= S1.back && f < S1.back + 20 ? 150 : f >= S1.l3 ? 40 : 20}
        armR={f >= S1.back && f < S1.back + 20 ? -150 : f >= S1.l3 ? -40 : -20}
        headTilt={talk("bobo", g) + (bDouble ? 10 : 0)}
        blink={blinkAt(g, 3)}
      />
      <BoboBigEyes x={B.x} y={B.y} scale={B.scale} g={g} amount={f >= S1.back && f < S1.back + 24 ? 1 : 0} />
      <g transform={spinning ? `rotate(${ip(f, [S1.spin, S1.spin + 36], [0, 1080], Easing.inOut(Easing.quad))} ${D.x} ${D.y - 180 * D.scale})` : undefined}>
        <Draco
          x={D.x}
          y={D.y}
          scale={D.scale}
          g={g}
          mood={spinning ? "surprised" : f >= S1.spin + 36 ? "neutral" : dMouth > 0.06 ? "excited" : "happy"}
          mouth={dMouth}
          look={f >= S1.spin + 36 ? { x: Math.sin(f / 3), y: 0 } : { x: -0.3, y: -0.2 }}
          blink={blinkAt(g, 5)}
          wing={f >= S1.l2 ? 1 : 0.5}
          armsUp={f >= S1.l2 && f < S1.spin + 36 ? 0.9 : 0.2}
          breath={f >= S1.l2 && f < S1.spin ? 0.6 : 0}
          squash={f >= S1.spin + 36 ? ip(f, [S1.spin + 36, S1.spin + 40, S1.spin + 48], [1, 0.82, 0.92]) : 1}
          headTilt={talk("draco", g)}
          glow={0.45}
        />
      </g>
      {f >= S1.spin + 36 && <DizzyStars x={D.x} y={D.y - 420 * D.scale} scale={D.scale} on={ip(f, [S1.spin + 36, S1.spin + 42, S1.l3 + 40, S1.l3 + 50], [0, 1, 1, 0])} g={g} />}
      {spinning && <SparkBurst f={f} at={S1.spin} x={D.x} y={D.y - 200 * D.scale} reach={300} count={16} size={14} life={30} />}
    </ForestShot>
  );
};

// ---------- Scene 2 (15.9-28.7s): the Ancient Clock Tower; Tock; "Banana o'clock!" ----------
const C_KIKO = gp(-1.9, -24.6);
const C_LUMI = gp(-0.8, -24.3);
const C_TOCK = gp(0.25, -24.0);
const C_DRACO = gp(1.3, -24.5);
const C_BOBO = gp(2.4, -24.2);
const WINDOW: V3 = [TOWER[0], TOWER[1] + 9.0, TOWER[2] + 4.3];
const S2 = { fly: TOCK_FLY - CUTS[2], l5: L5 - CUTS[2], l6: L6 - CUTS[2], l7: L7 - CUTS[2], l8: L8 - CUTS[2] };

const Scene2: React.FC = () => {
  const f = useCurrentFrame();
  const g = f + CUTS[2];
  const cam = camAt(f, [
    [0, { pos: [0.6, 1.6, -10.5], target: [0, TOWER_FACE_Y - 4, -40], fov: 60 }],
    [50, { pos: [0.4, 1.7, -16.0], target: [0.2, 6.5, -36], fov: 60 }],
    [S2.l6 - 1, { pos: [0.4, 1.6, -17.0], target: [0.2, 5.0, -36], fov: 60 }],
    [S2.l6, { pos: [-0.8, 1.15, -19.7], target: [-0.8, 1.0, -24.3], fov: 52 }],
    [S2.l8 - 1, { pos: [-0.8, 1.15, -19.9], target: [-0.8, 1.0, -24.3], fov: 52 }],
    [S2.l8, { pos: [2.2, 1.1, -21.0], target: [2.2, 1.0, -24.2], fov: 44 }],
    [384 + XF, { pos: [2.2, 1.1, -21.2], target: [2.2, 1.0, -24.2], fov: 44 }],
  ]);
  const flyK = ip(f, [S2.fly, S2.fly + 40], [0, 1], Easing.inOut(Easing.sin));
  const tp: V3 = f < S2.fly ? WINDOW : lerp3(WINDOW, C_TOCK, flyK);
  const flying = f >= S2.fly && f < S2.fly + 40;
  const T = place(cam, f < S2.fly + 40 ? up(tp, Math.sin(flyK * Math.PI) * 1.2) : C_TOCK, TOCK_S);
  const L = place(cam, C_LUMI, LUMI_S);
  const K = place(cam, C_KIKO, KIKO_S);
  const D = place(cam, C_DRACO, DRACO_S);
  const B = place(cam, C_BOBO, BOBO_S);
  const tMouth = mouthAt("tock", g);
  const proud = f >= S2.l7 && f < S2.l7 + 40;
  const bananaTime = f >= S2.l7 + 20;
  const th = { x: T.x + 110 * T.scale, y: T.y - 230 * T.scale };
  const lookT = (w: Pt) => lookAtPt(w, { x: T.x, y: T.y - 250 * T.scale }, 300);
  const Ws = screen(cam, WINDOW);
  return (
    <ForestShot cam={cam} G={g}>
      {f >= S2.fly - 20 && f < S2.fly && <circle cx={Ws.x} cy={Ws.y} r={40} fill="url(#timeGlow)" opacity={0.8} />}
      <Kiko x={K.x} y={K.y} scale={K.scale} g={g} mood={mouthAt("kiko", g) > 0.06 ? "happy" : proud ? "surprised" : "happy"} mouth={mouthAt("kiko", g)} look={f >= S2.fly ? lookT(K) : { x: 0.2, y: -1 }} blink={blinkAt(g, 11)} armL={f >= S2.l6 && f < S2.l6 + 30 ? 120 : 20} armR={-20} headTilt={talk("kiko", g)} tailSwish={1.1} />
      <Lumi x={L.x} y={L.y} scale={L.scale} look={f >= S2.fly ? lookT(L) : { x: 0, y: -1 }} expr={f < S2.fly ? "surprised" : proud ? "surprised" : "happy"} armR={-22} armL={22} blink={blinkAt(g, 1)} />
      <Worn L={L} g={g} />
      <Draco x={D.x} y={D.y} scale={D.scale} g={g} mood={proud ? "surprised" : "happy"} look={f >= S2.fly ? lookT(D) : { x: 0, y: -1 }} blink={blinkAt(g, 5)} wing={0.5} glow={0.45} />
      <BoboRider
        g={g}
        x={B.x}
        y={B.y}
        scale={B.scale}
        look={bananaTime ? lookT(B) : f >= S2.fly ? lookT(B) : { x: 0, y: -1 }}
        expr={bananaTime ? "excited" : "surprised"}
        mouth={mouthAt("bobo", g)}
        armL={bananaTime ? 150 : 20}
        armR={bananaTime ? -150 : -20}
        squash={bananaTime ? ip(f, [S2.l7 + 20, S2.l7 + 24, S2.l7 + 30], [1, 1.1, 1]) : 1}
        headTilt={talk("bobo", g)}
        blink={blinkAt(g, 3)}
        riderArmsUp={bananaTime}
      />
      <BoboBigEyes x={B.x} y={B.y} scale={B.scale} g={g} amount={bananaTime ? 1 : 0} />
      <Tock
        x={T.x}
        y={T.y}
        scale={T.scale}
        g={g}
        mood={flying ? "surprised" : proud ? "proud" : tMouth > 0.06 ? "happy" : "joy"}
        mouth={tMouth}
        look={proud ? { x: 0, y: -0.3 } : { x: -0.3, y: 0 }}
        blink={blinkAt(g, 17)}
        wingL={flying || f < S2.fly ? 1 : proud ? 0.2 : 0.3}
        wingR={proud ? 1 : flying ? 1 : 0.4}
        flap={flying || f < S2.fly ? 1 : 0}
        hop={0}
        headTilt={talk("tock", g) + (proud ? -8 : 0)}
      />
      {f >= S2.fly && <PocketClock x={th.x} y={th.y} scale={T.scale * 1.1} g={g} spin={proud ? f - S2.l7 : 0} />}
      {proud && f >= S2.l7 + 10 && <IconBubble x={T.x + 200 * T.scale} y={T.y - 560 * T.scale} scale={0.6} kind="music" on={1} g={g} />}
      <SparkBurst f={f} at={S2.fly + 40} x={T.x} y={T.y - 150 * T.scale} reach={220} count={14} size={12} life={22} />
    </ForestShot>
  );
};

// ---------- the tower inside ----------
const InsideShot: React.FC<{ cam: Cam3; G: number; fixed?: number; spinMad?: number; frozen?: number; buttonDown?: number; crank?: number; masterHands?: number; world?: React.ReactNode; children: React.ReactNode; over?: React.ReactNode; shake?: number }> = ({
  cam,
  G,
  fixed = 0,
  spinMad = 0,
  frozen = 1,
  buttonDown = 0,
  crank = 0,
  masterHands = 0,
  world,
  children,
  over,
  shake = 0,
}) => {
  const f = useCurrentFrame();
  const jx = shake ? Math.sin(f * 2.7) * 10 * shake : 0;
  const jy = shake ? Math.cos(f * 3.3) * 8 * shake : 0;
  return (
    <AbsoluteFill style={{ background: "#1a1008", opacity: ip(f, [0, XF], [0, 1]), transform: `translate(${jx}px, ${jy}px)` }}>
      <World3D cam={cam} bloom={0.7} threshold={0.78}>
        <ClockInterior t={G / 30} fixed={fixed} spinMad={spinMad} frozen={frozen} buttonDown={buttonDown} crank={crank} masterHands={masterHands} />
        {world}
      </World3D>
      <CharLayer defs={<Defs lit={0.95 + fixed * 0.15} />} filter="clockLit">
        {children}
      </CharLayer>
      {over}
    </AbsoluteFill>
  );
};
const iv = (x: number, z: number): V3 => [x, 0, z];

// ---------- Scene 3 (28.7-41.1s): the time glitch; Kiko's loop button; Draco through the portal ----------
const S3 = { loop: LOOP1 - CUTS[3], dance: DANCE - CUTS[3], l9: L9 - CUTS[3], pin: PORTAL_IN - CUTS[3], pout: PORTAL_OUT - CUTS[3], l10: L10 - CUTS[3] };
const I_KIKO = iv(-2.3, 1.4);
const I_LUMI = iv(-1.2, 1.7);
const I_TOCK = iv(-0.1, 1.2);
const I_DRACO = iv(1.3, 1.6);
const I_BOBO = iv(0.35, 2.7);
// one take of Bobo's slip: 0..1 over the loop. returns forward step, lean, squash, arms, mouth
const slipPose = (k: number) => {
  const step = ip(k, [0, 0.35], [0, 0.45], EASE);
  const slip = ip(k, [0.3, 0.55], [0, 1]);
  const sit = ip(k, [0.6, 0.72, 0.85], [0, 1, 0.85]);
  return { step, lean: slip * -22 + sit * 10, arms: slip > 0 ? 150 + Math.sin(k * 40) * 20 : 30, squash: 1 - sit * 0.22, hop: Math.sin(slip * Math.PI) * 0.35 };
};

const Scene3: React.FC = () => {
  const f = useCurrentFrame();
  const g = f + CUTS[3];
  const cam = camAt(f, [
    [0, { pos: [0.2, 2.2, 9.6], target: [0, 2.6, -3.5], fov: 58 }],
    [S3.loop - 1, { pos: [0.2, 1.8, 8.4], target: [0, 1.6, -2.0], fov: 56 }],
    [S3.loop, { pos: [0.0, 1.35, 7.6], target: [0.1, 1.1, 1.8], fov: 50 }],
    [S3.pin - 1, { pos: [0.0, 1.35, 7.3], target: [0.1, 1.1, 1.8], fov: 50 }],
    [S3.pin, { pos: [0.0, 1.8, 8.6], target: [0.0, 1.6, -1.8], fov: 58 }],
    [372 + XF, { pos: [-0.6, 1.6, 7.6], target: [-1.6, 1.5, -1.8], fov: 54 }],
  ]);
  // the loop: three identical slips, each followed by a short rewind
  const cyc = LOOP_LEN + REWIND_LEN;
  const lf = f - S3.loop;
  const loopN = lf >= 0 ? Math.min(2, Math.floor(lf / cyc)) : -1;
  let k = 0;
  let rewinding = false;
  if (lf >= 0 && lf < 3 * cyc - REWIND_LEN) {
    const p = lf - loopN * cyc;
    if (p < LOOP_LEN) k = p / LOOP_LEN;
    else {
      rewinding = true;
      k = 1 - (p - LOOP_LEN) / REWIND_LEN;
    }
  } else if (lf >= 3 * cyc - REWIND_LEN) k = 1;
  const pose = slipPose(lf >= 0 ? k : 0);
  // Kiko's dance loop
  const df = f - S3.dance;
  const dancing = df >= 0 && df < 2 * (DANCE_LEN + 4);
  const dk = dancing ? (df % (DANCE_LEN + 4)) / DANCE_LEN : 0;
  const danceRewind = dancing && df % (DANCE_LEN + 4) >= DANCE_LEN;
  const inLoopScene = f >= S3.loop && f < S3.l9;
  const bP: V3 = up(lerp3(I_BOBO, iv(0.35, 3.25), dancing || f >= S3.dance ? 1 : pose.step), dancing ? Math.abs(Math.sin(dk * Math.PI * 2)) * 0.12 : pose.hop);
  const B = place(cam, bP, BOBO_S);
  const L = place(cam, I_LUMI, LUMI_S);
  const K = place(cam, I_KIKO, KIKO_S);
  const T = place(cam, I_TOCK, TOCK_S);
  // Draco flies into portal A and comes out of portal B facing the wrong way
  const inK = ip(f, [S3.pin, S3.pin + 14], [0, 1], Easing.in(Easing.quad));
  const outK = ip(f, [S3.pout, S3.pout + 12], [0, 1], Easing.out(Easing.quad));
  const turned = f >= S3.l10 + 50;
  const dP: V3 = f < S3.pin ? I_DRACO : f < S3.pout ? lerp3(I_DRACO, up(PORTAL_A, -0.6), inK) : lerp3(up(PORTAL_B, -0.6), [PORTAL_B[0] + 0.5, 0.35, PORTAL_B[2] + 1.3], outK);
  const D = place(cam, dP, DRACO_S * (f >= S3.pin && f < S3.pout ? 1 - inK * 0.7 : f >= S3.pout ? 0.3 + outK * 0.7 : 1));
  const showDraco = !(f >= S3.pin + 14 && f < S3.pout);
  const lookB = (w: Pt) => lookAtPt(w, B, 300);
  const kh = kikoHand(K.x, K.y, K.scale, -100);
  const pressed = (df >= 0 && df < 4) || (df >= DANCE_LEN + 4 && df < DANCE_LEN + 8) ? 1 : 0;
  const bMouth = mouthAt("bobo", g);
  const watching = inLoopScene || (f >= S3.l9 && f < S3.pin);
  return (
    <InsideShot cam={cam} G={g} over={<CharLayer defs={<Defs />}><RewindOverlay on={rewinding || danceRewind ? 1 : 0} g={g} /></CharLayer>}>
      <Kiko x={K.x} y={K.y} scale={K.scale} g={g} mood={dancing || (f >= S3.loop && f < S3.dance) ? "joy" : "happy"} look={watching ? lookB(K) : { x: 0.3, y: -0.4 }} blink={blinkAt(g, 11)} armL={dancing ? 20 : 20} armR={f >= S3.dance - 10 && f < S3.dance + 2 * (DANCE_LEN + 4) ? -100 : -20} lean={dancing ? Math.sin(f) * 6 : 0} tailSwish={1.4} />
      {f >= S3.dance - 10 && f < S3.l9 && <LoopButton x={kh.x + 20} y={kh.y + 10} scale={K.scale * 0.8} g={g} pressed={pressed} />}
      <Lumi x={L.x} y={L.y} scale={L.scale} look={watching ? lookB(L) : { x: 0.3, y: -0.4 }} expr={inLoopScene ? "surprised" : "happy"} armR={-22} armL={f >= S3.loop + cyc && f < S3.dance ? 60 : 22} headTilt={inLoopScene ? -6 : 0} blink={blinkAt(g, 1)} />
      <Worn L={L} g={g} />
      <Tock x={T.x} y={T.y} scale={T.scale} g={g} mood={inLoopScene ? "surprised" : "happy"} look={watching ? lookB(T) : { x: 0.3, y: -0.3 }} blink={blinkAt(g, 17)} wingL={inLoopScene ? 0.6 : 0.1} wingR={inLoopScene ? 0.6 : 0.1} />
      {showDraco &&
        (f >= S3.pout && !turned ? (
          <DracoBack x={D.x} y={D.y} scale={D.scale} g={g} flap={1} />
        ) : (
          <Draco x={D.x} y={D.y} scale={D.scale} g={g} mood={turned ? "surprised" : f >= S3.pin ? "excited" : inLoopScene ? "surprised" : "happy"} mouth={mouthAt("draco", g)} look={watching ? lookB(D) : { x: 0.6, y: -0.3 }} blink={blinkAt(g, 5)} wing={f >= S3.pin ? 1 : 0.5} flap={f >= S3.pin ? Math.sin(f) * 24 : 0} armsUp={f >= S3.pin ? 0.8 : 0.2} glow={0.45} />
        ))}
      {turned && <DracoBlush x={D.x} y={D.y} scale={D.scale} amount={0.8} />}
      {f >= S3.pout + 12 && !turned && <IconBubble x={D.x + 200 * D.scale} y={D.y - 520 * D.scale} scale={D.scale * 0.7} kind="question" on={ip(f, [S3.pout + 12, S3.pout + 18], [0, 1])} g={g} />}
      <BoboRider
        g={g}
        x={B.x}
        y={B.y}
        scale={B.scale}
        look={f >= S3.l9 ? { x: -0.7, y: 0 } : dancing ? { x: 0, y: -0.3 } : { x: 0, y: 0.5 }}
        expr={f >= S3.l9 ? (bMouth > 0.06 ? "effort" : "surprised") : dancing ? "happy" : pose.lean < -5 ? "surprised" : "happy"}
        mouth={bMouth}
        walk={!dancing && f >= S3.loop && f < S3.dance && k < 0.35 ? k * 12 : null}
        armL={dancing ? 150 * (dk < 0.5 ? 1 : 0.2) : f >= S3.l9 ? 70 : f >= S3.loop && f < S3.dance ? pose.arms : 20}
        armR={dancing ? -150 * (dk >= 0.5 ? 1 : 0.2) : f >= S3.l9 ? -70 : f >= S3.loop && f < S3.dance ? -pose.arms : -20}
        lean={dancing ? Math.sin(dk * Math.PI * 4) * 14 : f >= S3.loop && f < S3.dance ? pose.lean : 0}
        squash={dancing ? 1 + Math.sin(dk * Math.PI * 4) * 0.05 : f >= S3.loop && f < S3.dance ? pose.squash : 1}
        headTilt={talk("bobo", g)}
        blink={blinkAt(g, 3)}
        riderArmsUp={dancing}
      />
      {lf >= 0 && f < S3.dance && <circle cx={B.x + 60 * B.scale} cy={B.y + 6} r={30 * B.scale} fill="#ffd060" stroke="#a8781c" strokeWidth={4} />}
      {loopN >= 1 && f < S3.dance && <LoopCount x={B.x + 200 * B.scale} y={B.y - 520 * B.scale} n={loopN + 1} on={ip(lf - loopN * cyc, [0, 6], [0, 1])} />}
      {dancing && <LoopCount x={B.x - 200 * B.scale} y={B.y - 520 * B.scale} n={df >= DANCE_LEN + 4 ? 2 : 1} on={1} />}
    </InsideShot>
  );
};

// ---------- Scene 4 (41.1-55.4s): the missing hands; the gear ride; "it looks delicious!" ----------
const S4 = { l11: L11 - CUTS[4], l12: L12 - CUTS[4], split: SPLIT - CUTS[4], gear: KIKO_GEAR - CUTS[4], hand1: HAND1 - CUTS[4], bite: BITE - CUTS[4], l13: L13 - CUTS[4], l14: L14 - CUTS[4] };
const TURN: V3 = [4.6, 0.05, -1.6]; // the floor gear Draco ends up riding

const Scene4: React.FC = () => {
  const f = useCurrentFrame();
  const g = f + CUTS[4];
  const t = g / 30;
  const pend = f >= S4.split && f < S4.hand1;
  const garden = f >= S4.hand1;
  const cam = pend
    ? camAt(f, [
        [S4.split, { pos: [3.1, 1.4, 4.6], target: [4.3, 1.4, -1.8], fov: 54 }],
        [S4.hand1, { pos: [3.2, 1.5, 4.2], target: [4.3, 1.5, -1.8], fov: 54 }],
      ])
    : garden
      ? camAt(f, [
          [S4.hand1, { pos: [-3.3, 1.1, 4.1], target: [-4.3, 0.95, -0.8], fov: 50 }],
          [429 + XF, { pos: [-3.3, 1.1, 3.8], target: [-4.3, 0.95, -0.8], fov: 50 }],
        ])
      : camAt(f, [
          [0, { pos: [0.0, 2.6, 8.4], target: [0, 3.6, -6], fov: 58 }],
          [S4.split, { pos: [0.0, 2.3, 7.8], target: [0, 3.0, -6], fov: 58 }],
        ]);
  const handsTalk = f < S4.split;
  const L = place(cam, garden ? iv(-5.1, -0.7) : I_LUMI, LUMI_S);
  const T = place(cam, garden ? iv(-5.9, -1.0) : I_TOCK, TOCK_S);
  const K = place(cam, pend ? iv(3.4, 0.0) : I_KIKO, KIKO_S);
  // Draco rides the turning floor gear round and round
  const ride = pend && f >= S4.gear;
  const ang = ride ? ip(f, [S4.gear, S4.hand1], [0, 1]) * Math.PI * 5 : 0;
  const D = place(cam, pend ? (ride ? [TURN[0] + Math.cos(ang) * 1.0, 0.1, TURN[2] + Math.sin(ang) * 0.6] : iv(4.5, -0.4)) : I_DRACO, DRACO_S);
  // Bobo sniffs his way to the second hand, which looks like a banana
  const sniff = garden && f < S4.bite;
  const B = place(cam, garden ? lerp3(iv(-2.8, 0.9), iv(-3.6, 0.7), ip(f, [S4.hand1, S4.bite - 6], [0, 1], EASE)) : I_BOBO, BOBO_S);
  const handOnGround = { x: B.x - 140 * B.scale, y: B.y - 40 * B.scale };
  const biting = f >= S4.bite - 4 && f < S4.l13;
  const holding = f >= S4.bite - 4;
  const bh = { x: B.x + (biting ? 10 : 120) * B.scale, y: B.y - (biting ? 270 : 300) * B.scale };
  const Ms = screen(cam, MASTER);
  const gardenS = screen(cam, [GEAR_GARDEN[0], 1.2, GEAR_GARDEN[2]]);
  const pendS = screen(cam, [PENDULUMS[0], 1.2, PENDULUMS[2]]);
  const tMouth = mouthAt("tock", g);
  const deadpan = f >= S4.l12 + 50 && f < S4.split;
  const kh = kikoHand(K.x, K.y, K.scale, -150);
  const pb = screen(cam, [PENDULUMS[0], 2.2, PENDULUMS[2]]);
  return (
    <InsideShot cam={cam} G={g} world={pend ? <Gear position={TURN} r={1.4} teeth={16} angle={ang} rotation={[-Math.PI / 2, 0, 0]} glow={0.4} thick={0.12} /> : undefined}>
      {handsTalk && (
        <>
          {f >= S4.l11 + 50 && f < S4.l12 && (
            <>
              <path d={`M ${Ms.x - 60} ${Ms.y + 120} Q ${(Ms.x + gardenS.x) / 2} ${Ms.y + 60} ${gardenS.x} ${gardenS.y}`} stroke="#ffe08a" strokeWidth={8} strokeDasharray="20 16" fill="none" opacity={0.8} />
              <path d={`M ${Ms.x + 60} ${Ms.y + 120} Q ${(Ms.x + pendS.x) / 2} ${Ms.y + 60} ${pendS.x} ${pendS.y}`} stroke="#ffe08a" strokeWidth={8} strokeDasharray="20 16" fill="none" opacity={0.8} />
              <IconBubble x={gardenS.x} y={gardenS.y - 120} scale={0.55} kind="question" on={1} g={g} />
              <IconBubble x={pendS.x} y={pendS.y - 120} scale={0.55} kind="question" on={1} g={g} />
            </>
          )}
          <Kiko x={K.x} y={K.y} scale={K.scale} g={g} mood={deadpan ? "neutral" : "surprised"} look={{ x: 0.4, y: -0.4 }} blink={deadpan ? 0.5 : blinkAt(g, 11)} armL={20} armR={-20} tailSwish={0.8} />
          <Lumi x={L.x} y={L.y} scale={L.scale} look={deadpan ? { x: 0.6, y: 0 } : { x: 0.2, y: -0.6 }} expr={deadpan ? "neutral" : "surprised"} armR={-22} armL={22} blink={deadpan ? 0.45 : blinkAt(g, 1)} />
          <Worn L={L} g={g} />
          <Draco x={D.x} y={D.y} scale={D.scale} g={g} mood={deadpan ? "neutral" : "surprised"} look={deadpan ? { x: -0.8, y: 0 } : { x: -0.2, y: -0.6 }} blink={deadpan ? 0.45 : blinkAt(g, 5)} wing={0.5} glow={0.45} />
          <BoboRider g={g} x={B.x} y={B.y} scale={B.scale} look={deadpan ? { x: -0.5, y: 0 } : { x: 0, y: -0.6 }} expr={deadpan ? "neutral" : "surprised"} armL={20} armR={-20} blink={deadpan ? 0.45 : blinkAt(g, 3)} />
          <Tock x={T.x} y={T.y} scale={T.scale} g={g} mood={f >= S4.l12 ? (tMouth > 0.06 ? "panic" : "proud") : tMouth > 0.06 ? "nervous" : "happy"} mouth={tMouth} look={{ x: 0, y: -0.2 }} blink={blinkAt(g, 17)} wingL={f >= S4.l11 + 50 && f < S4.l12 ? 1 : f >= S4.l12 ? 0.8 : 0.2} wingR={f >= S4.l11 + 50 && f < S4.l12 ? 1 : f >= S4.l12 ? 0.8 : 0.2} flap={f >= S4.l12 && f < S4.l12 + 50 ? 1 : 0} hop={f >= S4.l12 && f < S4.l12 + 50 ? 60 + Math.sin(f / 3) * 20 : 0} headTilt={talk("tock", g)} />
          {deadpan && <IconBubble x={L.x + 160 * L.scale} y={L.y - 600 * L.scale} scale={0.6} kind="dots" on={ip(f, [S4.l12 + 50, S4.l12 + 60], [0, 1])} g={g} />}
        </>
      )}
      {pend && (
        <>
          {/* the first hand, glowing on a pendulum's bob */}
          {f < S4.hand1 - 8 && <ClockHand2D x={pb.x} y={pb.y + Math.sin(t * 1.8) * 40} scale={0.6} g={g} rot={30} />}
          <Kiko x={K.x} y={K.y} scale={K.scale} g={g} mood={ride ? "joy" : "happy"} look={ride ? lookAtPt(K, D, 300) : { x: 0.6, y: -0.3 }} blink={blinkAt(g, 11)} armL={20} armR={f >= S4.gear - 10 && f < S4.gear + 4 ? -100 : f >= S4.hand1 - 8 ? -150 : -20} lean={ride ? Math.sin(f) * 5 : 0} tailSwish={1.3} />
          {f >= S4.hand1 - 8 && <ClockHand2D x={kh.x} y={kh.y - 40 * K.scale} scale={0.6} g={g} rot={-20} />}
          <g transform={ride ? `rotate(${Math.sin(ang * 2) * 12} ${D.x} ${D.y - 180 * D.scale})` : undefined}>
            <Draco x={D.x} y={D.y} scale={D.scale} g={g} mood={ride ? "surprised" : "excited"} look={ride ? { x: Math.sin(ang), y: 0 } : { x: 0, y: -0.3 }} blink={blinkAt(g, 5)} wing={ride ? 0.4 : 1} armsUp={ride ? 0.9 : 0.9} breath={ride ? 0 : 0.8} squash={1} glow={0.45} />
          </g>
          {ride && <DizzyStars x={D.x} y={D.y - 420 * D.scale} scale={D.scale} on={1} g={g} />}
        </>
      )}
      {garden && (
        <>
          <Lumi x={L.x} y={L.y} scale={L.scale} look={lookAtPt(L, B, 300)} expr={f >= S4.l13 ? "surprised" : "happy"} mouth={mouthAt("lumi", g)} armR={f >= S4.l13 && f < S4.l14 ? -80 : -22} armL={22} headTilt={talk("lumi", g)} blink={blinkAt(g, 1)} />
          <Worn L={L} g={g} />
          <Tock x={T.x} y={T.y} scale={T.scale} g={g} mood={f >= S4.bite ? "surprised" : "happy"} look={lookAtPt(T, B, 300)} blink={blinkAt(g, 17)} wingL={f >= S4.bite ? 0.8 : 0.1} wingR={f >= S4.bite ? 0.8 : 0.1} />
          {!holding && <ClockHand2D x={handOnGround.x} y={handOnGround.y} scale={B.scale * 0.8} g={g} rot={70} />}
          <BoboRider
            g={g}
            x={B.x}
            y={B.y}
            scale={B.scale}
            look={sniff ? { x: -0.8, y: 0.4 } : f >= S4.l14 ? { x: -0.5, y: -0.2 } : { x: 0, y: 0 }}
            expr={biting && f >= S4.bite ? "effort" : f >= S4.l14 ? "happy" : "excited"}
            mouth={biting && f < S4.bite ? 0.9 : mouthAt("bobo", g)}
            walk={sniff ? f * 0.25 : null}
            armL={holding ? 40 : 30}
            armR={holding ? (biting ? -150 : -120) : -30}
            lean={sniff ? -8 + Math.sin(f / 3) * 4 : 0}
            headTilt={talk("bobo", g) + (sniff ? Math.sin(f / 2) * 6 : 0)}
            blink={biting && f >= S4.bite && f < S4.bite + 15 ? 0.1 : blinkAt(g, 3)}
          />
          {sniff && [0, 1, 2].map((i) => <path key={i} d={`M ${handOnGround.x + 30} ${handOnGround.y - 40 - i * 30} q 40 -30 ${80 + i * 10} ${-10}`} stroke="#ffe08a" strokeWidth={5} fill="none" opacity={0.7 - i * 0.2} strokeLinecap="round" />)}
          {holding && <ClockHand2D x={bh.x} y={bh.y} scale={B.scale * 0.8} g={g} rot={biting ? 80 : 30} />}
          <ShakeLines x={B.x} y={B.y - 262 * B.scale} scale={B.scale} on={ip(f, [S4.bite, S4.bite + 2, S4.bite + 14, S4.bite + 20], [0, 1, 1, 0])} g={g} />
          <BoboBigEyes x={B.x} y={B.y} scale={B.scale} g={g} amount={sniff ? 0.7 : 0} />
        </>
      )}
    </InsideShot>
  );
};

// ---------- Scene 5 (55.4-68.1s): fixing the Master Clock ----------
const S5 = { l15: L15 - CUTS[5], l16: L16 - CUTS[5], fire: FIRE - CUTS[5], crank: CRANK_T - CUTS[5], button: BUTTON_T - CUTS[5], l17: L17 - CUTS[5], hands: HANDS - CUTS[5], tick: TICK - CUTS[5], l18: L18 - CUTS[5] };
const M_LUMI = iv(-1.2, -4.3);
const M_TOCK = iv(-0.1, -4.6);
const M_DRACO = iv(-2.6, -5.6);
const M_KIKO = iv(2.2, -5.8);
const M_BOBO = iv(1.0, -5.0);

const Scene5: React.FC = () => {
  const f = useCurrentFrame();
  const g = f + CUTS[5];
  const t = g / 30;
  const cam = camAt(f, [
    [0, { pos: [-0.5, 1.25, 0.4], target: [-0.6, 1.15, -4.6], fov: 50 }],
    [S5.fire - 6, { pos: [-0.5, 1.25, 0.1], target: [-0.6, 1.15, -4.6], fov: 50 }],
    [S5.fire - 5, { pos: [0.2, 2.6, 1.6], target: [0.0, 3.0, -8.5], fov: 62 }],
    [S5.l18 - 1, { pos: [0.2, 2.5, 1.2], target: [0.0, 3.4, -8.5], fov: 62 }],
    [S5.l18, { pos: [1.2, 1.3, -2.0], target: [1.0, 1.2, -5.2], fov: 46 }],
    [381 + XF, { pos: [1.2, 1.3, -2.2], target: [1.0, 1.2, -5.2], fov: 46 }],
  ]);
  const L = place(cam, M_LUMI, LUMI_S);
  const T = place(cam, M_TOCK, TOCK_S);
  const D = place(cam, M_DRACO, DRACO_S);
  const K = place(cam, M_KIKO, KIKO_S);
  const lean = ip(f, [S5.button - 6, S5.button], [0, 1]);
  const B = place(cam, lerp3(M_BOBO, iv(BUTTON[0] - 0.2, BUTTON[2] + 0.55), lean), BOBO_S);
  const frozen = ip(f, [S5.fire + 6, S5.fire + 26], [1, 0]);
  const crank = ip(f, [S5.crank, S5.crank + 18], [0, 2]);
  const shaking = f >= S5.button && f < S5.button + 30;
  const fixed = f >= S5.tick ? 1 : 0;
  const Ms = screen(cam, MASTER);
  const Fs = screen(cam, FROZEN_GEAR);
  const dm = { x: D.x, y: D.y - 168 * D.scale };
  const handsK = ip(f, [S5.hands, S5.tick - 2], [0, 1], Easing.inOut(Easing.quad));
  const handFromK = kikoHand(K.x, K.y, K.scale, -150);
  const handFromB = { x: B.x + 120 * B.scale, y: B.y - 300 * B.scale };
  const tMouth = mouthAt("tock", g);
  const scared = f < S5.l16 + 40;
  const lookM = (w: Pt) => lookAtPt(w, Ms, 330);
  return (
    <InsideShot
      cam={cam}
      G={g}
      fixed={fixed}
      spinMad={fixed ? 0 : shaking ? 2.2 : 1}
      frozen={frozen}
      buttonDown={f >= S5.button && f < S5.button + 20 ? 1 : 0}
      crank={crank}
      masterHands={f >= S5.tick ? 1 : 0}
      shake={shaking ? 1 : 0}
      world={
        <>
          <SparkleBurst3D position={MASTER} age={ip(f, [S5.tick, S5.tick + 40], [0, 1])} reach={8} count={220} seed={81} size={16} colors={["#ffe08a", "#ffffff", "#ffb040", "#fff6c0"]} />
          <LightRing position={[MASTER[0], MASTER[1], MASTER[2] + 0.4]} age={ip(f, [S5.tick, S5.tick + 40], [0, 1])} radius={14} flat={false} color="#ffe08a" />
        </>
      }
      over={f >= S5.tick && f < S5.tick + 16 ? <AbsoluteFill style={{ background: "#fff6d8", opacity: ip(f, [S5.tick, S5.tick + 2, S5.tick + 16], [0, 0.5, 0]) }} /> : undefined}
    >
      <Lumi x={L.x} y={L.y} scale={L.scale} look={f >= S5.l16 - 4 && f < S5.fire ? lookAtPt(L, { x: T.x, y: T.y - 200 * T.scale }, 300) : lookM(L)} expr={mouthAt("lumi", g) > 0.06 ? "happy" : fixed ? "excited" : "surprised"} mouth={mouthAt("lumi", g)} armR={f >= S5.l16 && f < S5.fire ? -60 + Math.sin(f / 5) * 8 : fixed ? -150 : -22} armL={fixed ? 150 : 22} headTilt={talk("lumi", g)} blink={blinkAt(g, 1)} />
      <Worn L={L} g={g} />
      <Draco x={D.x} y={D.y} scale={D.scale} g={g} mood={f >= S5.fire - 8 && f < S5.fire + 26 ? "effort" : fixed ? "joy" : "surprised"} look={f >= S5.fire - 8 && f < S5.fire + 26 ? lookAtPt(D, Fs, 300) : lookM(D)} blink={blinkAt(g, 5)} wing={0.7} armsUp={fixed ? 0.9 : 0.3} breath={ip(f, [S5.fire - 8, S5.fire - 1, S5.fire], [0, 0.8, 0.3])} glow={0.45} />
      <WarmBreath from={dm} to={Fs} on={ip(f, [S5.fire, S5.fire + 4, S5.fire + 22, S5.fire + 28], [0, 1, 1, 0])} g={g} scale={D.scale} />
      <Kiko x={K.x} y={K.y} scale={K.scale} g={g} mood={fixed ? "joy" : shaking ? "surprised" : "excited"} look={lookM(K)} blink={blinkAt(g, 11)} armL={20} armR={f >= S5.crank && f < S5.crank + 18 ? -90 + Math.sin(f) * 40 : f >= S5.l17 && f < S5.hands ? -150 : -20} tailSwish={1.2} />
      <BoboRider
        g={g}
        x={B.x}
        y={B.y}
        scale={B.scale}
        look={shaking ? { x: Math.sin(f) * 0.8, y: 0 } : f >= S5.l18 ? lookM(B) : lookM(B)}
        expr={shaking ? "surprised" : f >= S5.l18 ? "excited" : "happy"}
        mouth={mouthAt("bobo", g)}
        armL={shaking ? 150 : f >= S5.l17 && f < S5.hands ? 120 : f >= S5.l18 ? 150 : 20}
        armR={shaking ? -150 : f >= S5.l17 && f < S5.hands ? -150 : f >= S5.l18 ? -150 : -20}
        lean={f >= S5.button - 6 && f < S5.button + 10 ? -10 : shaking ? Math.sin(f * 2.5) * 6 : 0}
        squash={ip(f, [S5.button, S5.button + 3, S5.button + 10], [1, 0.85, 1])}
        headTilt={talk("bobo", g)}
        blink={blinkAt(g, 3)}
        riderArmsUp={shaking || f >= S5.l18}
      />
      <BoboBigEyes x={B.x} y={B.y} scale={B.scale} g={g} amount={f >= S5.l18 + 10 ? 0.8 : 0} />
      {shaking && <IconBubble x={B.x + 170 * B.scale} y={B.y - 560 * B.scale} scale={B.scale * 0.75} kind="bang" on={1} g={g} />}
      <Tock
        x={T.x}
        y={T.y}
        scale={T.scale}
        g={g}
        mood={fixed ? "joy" : f >= S5.l17 ? "brave" : scared ? (tMouth > 0.06 ? "nervous" : "nervous") : shaking ? "panic" : "brave"}
        mouth={tMouth}
        look={f >= S5.l16 && f < S5.fire ? lookAtPt(T, L, 300) : lookM(T)}
        blink={blinkAt(g, 17)}
        wingL={f >= S5.l17 ? 1 : scared ? 0.3 : 0.5}
        wingR={f >= S5.l17 ? 1 : scared ? 0.3 : 0.5}
        flap={fixed ? 1 : f >= S5.l17 && f < S5.tick ? 0.6 : 0}
        hop={fixed ? 80 + Math.sin(f / 3) * 30 : f >= S5.l17 ? 40 : 0}
        tilt={scared ? Math.sin(f * 1.7) * 3 : 0}
        headTilt={talk("tock", g)}
      />
      {/* the two hands fly up into the Master Clock */}
      {f >= S5.l17 && f < S5.tick && (
        <>
          <ClockHand2D x={lerp(handFromK.x, Ms.x, handsK)} y={lerp(handFromK.y, Ms.y, handsK) - Math.sin(handsK * Math.PI) * 120} scale={0.6} g={g} rot={handsK * 360} />
          <ClockHand2D x={lerp(handFromB.x, Ms.x, handsK)} y={lerp(handFromB.y, Ms.y, handsK) - Math.sin(handsK * Math.PI) * 160} scale={0.6} g={g} rot={-handsK * 360} long={false} />
        </>
      )}
      {fixed > 0 && <SparkBurst f={f} at={S5.tick} x={Ms.x} y={Ms.y} reach={480} count={28} size={20} life={30} />}
    </InsideShot>
  );
};

// ---------- Scene 6 (68.1-83.8s): time is right again; Kiko's prank; the golden banana; the rainbow bridge ----------
const S6 = { prank: PRANK - CUTS[6], l19: L19 - CUTS[6], box: BOX - CUTS[6], grab: KIKO_GRAB - CUTS[6], catch: CATCH - CUTS[6], l20: L20 - CUTS[6], project: PROJECT - CUTS[6], l21: L21 - CUTS[6], end: END - CUTS[6] };
const HOLO: V3 = [0.3, 5.2, -29.5];

const Scene6: React.FC = () => {
  const f = useCurrentFrame();
  const g = f + CUTS[6];
  const t = g / 30;
  const cam = camAt(f, [
    [0, { pos: [0.6, 2.0, -12.0], target: [0, TOWER_FACE_Y - 2, -40], fov: 58 }],
    [S6.prank - 6, { pos: [0.4, 1.6, -18.0], target: [0.2, 2.6, -36], fov: 56 }],
    [S6.prank - 5, { pos: [0.6, 1.1, -20.6], target: [0.5, 1.0, -24.2], fov: 46 }],
    [S6.box - 1, { pos: [0.6, 1.1, -20.9], target: [0.5, 1.0, -24.2], fov: 46 }],
    [S6.box, { pos: [2.75, 1.05, -20.6], target: [2.75, 1.0, -24.3], fov: 48 }],
    [S6.project - 1, { pos: [2.75, 1.05, -20.8], target: [2.75, 1.0, -24.3], fov: 48 }],
    [S6.project, { pos: [0.3, 1.5, -17.2], target: [0.3, 3.2, -30], fov: 58 }],
    [471, { pos: [0.3, 1.7, -16.4], target: [0.3, 3.6, -30], fov: 58 }],
  ]);
  const party = f < S6.prank;
  const hop = (ph: number) => (party ? Math.abs(Math.sin((f + ph) / 6)) * 0.25 : 0);
  const L = place(cam, up(C_LUMI, hop(0)), LUMI_S);
  const D = place(cam, up(C_DRACO, hop(2)), DRACO_S);
  const B = place(cam, up(C_BOBO, hop(4)), BOBO_S);
  const T = place(cam, C_TOCK, TOCK_S);
  const sneakK = ip(f, [S6.prank - 20, S6.prank], [0, 1], EASE);
  const grabK = ip(f, [S6.grab, S6.catch], [0, 1], EASE);
  const kP: V3 = f < S6.l19 + 40 ? lerp3(up(C_KIKO, hop(3)), [C_TOCK[0] - 0.55, C_TOCK[1], C_TOCK[2] + 0.2], sneakK) : f < S6.grab ? gp(3.6, -24.4) : lerp3(gp(3.6, -24.4), gp(3.05, -24.1), grabK);
  const K = place(cam, kP, KIKO_S);
  const tMouth = mouthAt("tock", g);
  const panic = f >= S6.l19 - 4 && f < S6.l19 + 70;
  const laugh = f >= S6.l19 + 50 && f < S6.box;
  const th = { x: T.x + 110 * T.scale, y: T.y - 230 * T.scale };
  const boxOpen = ip(f, [S6.box, S6.box + 10], [0, 1], BACK(1.5));
  const boxAt = { x: B.x + 210 * B.scale, y: B.y + 10 * B.scale };
  const bananaUp = ip(f, [S6.box + 8, S6.box + 20], [0, 1], OUT);
  const holding = f >= S6.box + 24;
  const caught = f >= S6.catch;
  const bananaPos = holding ? { x: B.x - (caught ? 170 : 110) * B.scale, y: B.y - (caught ? 470 : 300) * B.scale } : { x: boxAt.x, y: lerp(boxAt.y - 60 * B.scale, boxAt.y - 220 * B.scale, bananaUp) };
  const project = ip(f, [S6.project, S6.project + 24], [0, 1], OUT);
  const Hs = screen(cam, up(HOLO, 0.3));
  const towerS = screen(cam, [TOWER[0], TOWER[1] + TOWER_FACE_Y, TOWER[2] + 4.2]);
  const lookH = (w: Pt) => (f >= S6.project ? lookAtPt(w, Hs, 380) : lookAtPt(w, towerS, 330));
  const lMouth = mouthAt("lumi", g);
  return (
    <ForestShot
      cam={cam}
      G={g}
      fixed={1}
      world={
        <>
          <RainbowBridgeHologram position={HOLO} t={t} on={project} scale={1.25} />
          <SparkleBurst3D position={[TOWER[0], TOWER[1] + TOWER_FACE_Y, TOWER[2] + 4.4]} age={ip(f, [0, 50], [0, 1])} reach={24} count={240} seed={91} size={22} gravity={2} colors={["#ffe08a", "#ffffff", "#ff9fe0", "#9fe8ff", "#b8ff9a"]} />
          <LightRing position={[TOWER[0], 0.4, TOWER[2]]} age={ip(f, [0, 70], [0, 1])} radius={90} color="#ffe08a" />
        </>
      }
      over={
        <>
          <EndCard at={S6.end} top={250} />
          <AbsoluteFill style={{ alignItems: "center", fontFamily }}>
            <div style={{ position: "absolute", top: 410, fontSize: 42, fontWeight: 600, color: "#fff2b0", opacity: ip(f, [S6.end + 20, S6.end + 36], [0, 1]), textShadow: "0 0 8px rgba(40, 30, 10, 1), 0 3px 12px rgba(40, 30, 10, 1)" }}>Next: The Mystery of the Rainbow Bridge 🌈</div>
          </AbsoluteFill>
        </>
      }
    >
      {f >= S6.project && <path d={`M ${towerS.x - 20} ${towerS.y} L ${Hs.x - 200 * project} ${Hs.y + 170} L ${Hs.x + 200 * project} ${Hs.y + 170} L ${towerS.x + 20} ${towerS.y} Z`} fill="#fff2c0" opacity={0.18 * project} />}
      <Lumi x={L.x} y={L.y} scale={L.scale} look={lookH(L)} expr={lMouth > 0.06 ? "excited" : laugh ? "happy" : f >= S6.project ? "surprised" : "excited"} mouth={lMouth} armR={party ? -150 : f >= S6.l21 ? -100 : -22} armL={party ? 150 : 22} headTilt={talk("lumi", g) + (laugh ? -5 : 0)} blink={blinkAt(g, 1)} />
      <Worn L={L} g={g} glow={0.9} />
      <Draco x={D.x} y={D.y} scale={D.scale} g={g} mood={party || laugh ? "joy" : f >= S6.project ? "surprised" : "happy"} look={lookH(D)} blink={blinkAt(g, 5)} wing={party ? 1 : 0.6} flap={party ? Math.sin(f * 0.8) * 24 : 0} armsUp={party ? 0.9 : 0.3} squash={laugh ? 1 + Math.sin(f * 2) * 0.04 : 1} glow={0.5} />
      <Tock
        x={T.x}
        y={T.y}
        scale={T.scale}
        g={g}
        mood={panic ? (tMouth > 0.06 ? "panic" : "surprised") : laugh ? "joy" : f >= S6.project ? "surprised" : "joy"}
        mouth={tMouth}
        look={panic ? { x: 0.5, y: 0.6 } : lookH(T)}
        blink={blinkAt(g, 17)}
        wingL={party || panic ? 1 : 0.3}
        wingR={party || panic ? 1 : 0.3}
        flap={party || panic ? 1 : 0}
        hop={(90 + Math.sin(f / 4) * 40) * ip(f, [S6.prank - 10, S6.prank + 2], [1, 0], EASE) + (30 + Math.abs(Math.sin(f / 2)) * 60) * ip(f, [S6.l19 - 8, S6.l19, S6.l19 + 62, S6.l19 + 72], [0, 1, 1, 0], EASE)}
        tilt={party ? Math.sin(f / 3) * 15 : panic ? Math.sin(f) * 10 : 0}
        headTilt={talk("tock", g)}
      />
      <PocketClock x={th.x} y={th.y - (party ? (90 + Math.sin(f / 4) * 40) * T.scale : 0)} scale={T.scale * 1.1} g={g} spin={f >= S6.prank && f < S6.prank + 12 ? (f - S6.prank) * 3 : 0} />
      {panic && <SweatDrop x={T.x - 110 * T.scale} y={T.y - 380 * T.scale} scale={T.scale * 1.2} g={g} />}
      <Kiko x={K.x} y={K.y} scale={K.scale} g={g} mood={caught ? "surprised" : laugh || (f >= S6.prank && f < S6.l19) ? "joy" : f >= S6.prank - 20 && f < S6.prank ? "happy" : "excited"} look={f >= S6.grab ? lookAtPt(K, bananaPos, 300) : lookH(K)} blink={f >= S6.prank - 20 && f < S6.prank ? 0.5 : blinkAt(g, 11)} armL={caught ? 40 : f >= S6.prank - 20 && f < S6.prank + 10 ? ip(f, [S6.prank - 20, S6.prank - 12, S6.prank, S6.prank + 10], [140, 150, 150, 20], EASE) : party ? 140 : 20} armR={f >= S6.grab && !caught ? -100 : caught ? -150 : f >= S6.prank - 20 && f < S6.prank + 16 ? ip(f, [S6.prank - 20, S6.prank - 6, S6.prank + 6, S6.prank + 16], [-140, -110, -110, -20], EASE) : party ? -140 : -20} legs={caught ? 0.6 : 0} lean={laugh ? Math.sin(f * 1.3) * 7 : caught ? 10 : 0} tailSwish={1.5} />
      {caught && <SweatDrop x={K.x + 100 * K.scale} y={K.y - 400 * K.scale} scale={K.scale} g={g} />}
      {f >= S6.box && f < S6.project && <ClockBox x={boxAt.x} y={boxAt.y} scale={B.scale} g={g} open={boxOpen} />}
      <BoboRider
        g={g}
        x={B.x}
        y={B.y}
        scale={B.scale}
        look={caught ? { x: -0.8, y: -0.1 } : f >= S6.box ? lookAtPt(B, bananaPos, 300) : lookH(B)}
        expr={caught ? (mouthAt("bobo", g) > 0.06 ? "happy" : "excited") : f >= S6.box ? "excited" : laugh ? "happy" : "excited"}
        mouth={mouthAt("bobo", g)}
        armL={caught ? 150 : holding ? 120 : party ? 150 : 20}
        armR={caught ? -80 : party ? -150 : -20}
        headTilt={talk("bobo", g)}
        blink={blinkAt(g, 3)}
        riderHappy={laugh}
      />
      <BoboBigEyes x={B.x} y={B.y} scale={B.scale} g={g} amount={f >= S6.box + 8 && f < S6.grab ? 0.8 : 0} />
      {f >= S6.box + 8 && f < S6.project + 30 && <GoldenBanana x={bananaPos.x} y={bananaPos.y} scale={B.scale * 0.9} rot={-20} g={g} />}
      {f >= S6.prank && f < S6.prank + 14 && <Sparkle x={th.x} y={th.y} size={40} color="#ffffff" rotate={f * 8} />}
      {party && <SparkBurst f={f} at={6} x={540} y={760} reach={540} count={28} size={18} life={36} rainbow />}
    </ForestShot>
  );
};

export const Episode: React.FC = () => <EpisodeFrame audio="ep12/audio.wav" cuts={CUTS} scenes={[Scene0, Scene1, Scene2, Scene3, Scene4, Scene5, Scene6]} />;
