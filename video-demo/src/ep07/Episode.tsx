import React from "react";
import { AbsoluteFill, Easing, useCurrentFrame } from "remotion";
import timeline from "./timeline.json";
import { blinkAt, Lumi } from "../story/characters";
import { Sparkle } from "../story/scenery";
import { Draco, Ep4Defs } from "../ep04/props";
import { EASE, EndCard, EpisodeFrame, ip, lumiHand, makeMouthAt, OUT, SparkBurst, XF } from "../kit";
import { Cam3, World3D } from "../kit3d/World";
import { camAt, CharLayer, place, screen, V3 } from "../kit3d/overlay";
import { LightRing, SparkleBurst3D } from "../kit3d/magic";
import { Ep5Defs, MoonPendant } from "../ep05/props";
import { SnowHologram, UnderwaterKingdom } from "../ep06/world";
import { AirBubble, BUBBLE_FIT, Coralie, Ep6Defs, GlowShell } from "../ep06/props";
import { AuroraCrystal, CAVE_BLOCK, CAVE_EXT, CASTLE, CROWN, FlakePath, IceBlock, IceCave, JungleHologram, PLAZA, SnowflakeKingdom, SnowState } from "./world";
import { AuroraBeam, BoboWinter, BreathPuff, dracoMouth, Ep7Defs, lumiMouth, Niva, NivaMood, SnowflakePendant, SnowPath, WarmBreath } from "./props";

const mouthAt = makeMouthAt(timeline);
export const CUTS = [0, 180, 420, 705, 960, 1260, 1500];
const BACK = (s: number) => Easing.out(Easing.back(s));
const lerp = (a: number, b: number, k: number) => a + (b - a) * k;
const lerp3 = (a: V3, b: V3, k: number): V3 => [lerp(a[0], b[0], k), lerp(a[1], b[1], k), lerp(a[2], b[2], k)];
const up = (p: V3, h: number): V3 => [p[0], p[1] + h, p[2]];
const clamp1 = (v: number) => Math.max(-1, Math.min(1, v));

// Relative sizes, the same as Episodes 5 and 6
const LUMI_S = 1;
const BOBO_S = 0.91;
const DRACO_S = 1.05;
const CORALIE_S = 0.82;
const NIVA_S = 0.78;

// ---- timed moments in frames; the same numbers (in seconds) are in scripts/ep07_audio.py ----
const PATH = 132;
const STEP = 147;
const FLASH = 165;
const LAND = 219;
const CRY = 372;
const FADE = 594;
const BREATH = 756;
const PUSH = 804;
const SHELL_GLOW = 852;
const PROJECT = 927;
const RAISE = 969;
const LIGHT = 996;
const MELT = 1020;
const FREE = 1065;
const RISE = 1071;
const HOME = 1128;
const AURORA = 1134;
const GIVE = 1266;
const JUNGLE = 1341;
const END = 1422;

const spot = (base: V3, fwd: [number, number], dx: number, d: number, h = 0): V3 => {
  const len = Math.hypot(fwd[0], fwd[1]);
  const fx = fwd[0] / len;
  const fz = fwd[1] / len;
  return [base[0] - fx * d - fz * dx, base[1] + h, base[2] - fz * d + fx * dx];
};

// The kingdom's colors: full, fading, then a wave of color and light from the castle crown
const snowState = (G: number): SnowState => ({
  base: ip(G, [FADE, FADE + 75], [1, 0.15], EASE),
  waveOn: G >= AURORA ? 1 : 0,
  waveR: ip(G, [AURORA, AURORA + 100], [0, 230], Easing.out(Easing.quad)),
});
const auroraOn = (G: number) => (G < AURORA ? ip(G, [FADE, FADE + 90], [1, 0.06], EASE) : ip(G, [AURORA, AURORA + 50], [0.06, 1.35], Easing.out(Easing.quad)));
const charLit = (G: number) => (G < AURORA ? ip(G, [FADE, FADE + 75], [1, 0.88]) : ip(G, [AURORA, AURORA + 30], [0.88, 1.05]));

// Lumi's left hand, where she keeps the seashell when she isn't holding it up
const lumiHandL = (x: number, y: number, s: number, angle: number) => {
  const a = (angle * Math.PI) / 180;
  return { x: x + (-84 - 128 * Math.sin(a)) * s, y: y + (-290 + 128 * Math.cos(a)) * s };
};
const Worn: React.FC<{ L: { x: number; y: number; scale: number }; g: number; glow?: number }> = ({ L, g, glow = 0.4 }) => (
  <MoonPendant x={L.x + 4 * L.scale} y={L.y - 262 * L.scale} scale={0.62 * L.scale} g={g} glow={glow} />
);
const Shell: React.FC<{ at: { x: number; y: number }; s: number; g: number; glow: number }> = ({ at, s, g, glow }) => (
  <>
    <circle cx={at.x} cy={at.y} r={(70 + glow * 90) * s} fill="url(#iceGlow)" opacity={0.25 + glow * 0.6} />
    <GlowShell x={at.x} y={at.y} scale={0.8 * s} g={g} glow={glow} />
  </>
);

const Layer: React.FC<{ G: number; children: React.ReactNode }> = ({ G, children }) => (
  <CharLayer defs={<><Ep4Defs /><Ep5Defs lit={1} /><Ep6Defs /><Ep7Defs lit={charLit(G)} /></>} filter="snowLit">
    {children}
  </CharLayer>
);

// A shot in the Snowflake Kingdom: 3D world below, the 2D characters above
const SnowShot: React.FC<{ cam: Cam3; G: number; fade?: boolean; world?: React.ReactNode; children: React.ReactNode; over?: React.ReactNode; sparkle?: number }> = ({ cam, G, fade = true, world, children, over, sparkle = 0 }) => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill style={{ opacity: fade ? ip(f, [0, XF], [0, 1]) : 1, background: "#0a1238" }}>
      <World3D cam={cam} bloom={0.9} threshold={0.7}>
        <SnowflakeKingdom t={G / 30} s={snowState(G)} aurora={auroraOn(G)} camPos={cam.pos} sparkle={sparkle} />
        {world}
      </World3D>
      <Layer G={G}>{children}</Layer>
      {over}
    </AbsoluteFill>
  );
};

// ---------- Scene 1 (0-6s): under the sea, the seashell shows a snowy mountain and a path of snow ----------
const U_BOBO: V3 = [-1.32, 0, 1.2];
const U_LUMI: V3 = [0, 0, 1.6];
const U_DRACO: V3 = [1.28, 0, 1.3];
const U_CORALIE: V3 = [2.45, 0.32, 1.85];
const U_HOLO: V3 = [0.4, 2.7, -0.8];
const FULL_SEA = { base: 1, waveR: 0, waveOn: 0 };

const Scene1: React.FC = () => {
  const f = useCurrentFrame();
  const g = f;
  const wide: Cam3 = { pos: [0.6, 1.7, 8.6], target: [0.6, 1.75, 0], fov: 46 };
  const cam = camAt(f, [
    [0, { pos: [0.6, 1.6, 7.6], target: [0.5, 1.7, 0], fov: 46 }],
    [29, { pos: [0.6, 1.62, 7.9], target: [0.5, 1.72, 0], fov: 46 }],
    [30, { pos: [1.28, 1.1, 4.6], target: [1.2, 0.95, 1.3], fov: 42 }],
    [86, { pos: [1.28, 1.1, 4.3], target: [1.2, 0.95, 1.3], fov: 42 }],
    [87, { pos: [0.25, 1.25, 4.8], target: [0.25, 1.2, 1.6], fov: 42 }],
    [127, { pos: [0.25, 1.25, 4.5], target: [0.25, 1.2, 1.6], fov: 42 }],
    [128, wide],
    [180, { pos: [0.6, 2.0, 9.4], target: [0.6, 2.4, 0], fov: 46 }],
  ]);
  const B = place(cam, U_BOBO, BOBO_S);
  const L = place(cam, U_LUMI, LUMI_S);
  const D = place(cam, U_DRACO, DRACO_S);
  const C = place(cam, up(U_CORALIE, Math.sin(g / 12) * 0.05), CORALIE_S);
  const Hs = screen(cam, up(U_HOLO, 0.7));
  const armR = f < 87 ? -128 : f < 128 ? -115 : -95;
  const hand = lumiHand(L.x, L.y, L.scale, armR);
  const shellAt = { x: hand.x, y: hand.y + 18 * L.scale };
  const holo = ip(f, [6, 22], [0, 1], OUT);
  const reveal = ip(f, [PATH, PATH + 16], [0, 1], OUT);
  // the friends float up the snowy path
  const go = ip(f, [STEP, FLASH + 8], [0, 1], Easing.in(Easing.cubic));
  const mid = { x: (B.x + D.x) / 2, y: Math.max(B.y, L.y, D.y) - 150 * L.scale };
  const fly = (p: { x: number; y: number; scale: number }, delay: number) => {
    const k = ip(go, [delay, 1], [0, 1]);
    return { x: lerp(p.x, Hs.x, k), y: lerp(p.y, Hs.y + 120, k), scale: p.scale * (1 - 0.75 * k) };
  };
  const b = fly(B, 0.1);
  const l = fly(L, 0);
  const d = fly(D, 0.05);
  const lookHolo = (who: { x: number }) => ({ x: clamp1((Hs.x - who.x) / 300), y: -1 });
  const flying = f >= STEP;
  const pulse = 0.5 + 0.5 * Math.sin(g / 4);
  return (
    <AbsoluteFill style={{ background: "#0a3a66" }}>
      <World3D cam={cam} bloom={0.8} threshold={0.72}>
        <UnderwaterKingdom t={g / 30} s={FULL_SEA} camPos={cam.pos} fishHappy={1} />
        <SnowHologram position={U_HOLO} t={g / 30} on={holo} scale={0.85} />
        <SparkleBurst3D position={up(U_HOLO, 0.8)} age={ip(f, [6, 40], [0, 1])} reach={2.6} count={120} seed={31} colors={["#ffffff", "#cfeaff", "#a8d8ff", "#e8f4ff"]} />
      </World3D>
      <CharLayer defs={<><Ep4Defs /><Ep5Defs lit={1} /><Ep6Defs lit={1} /><Ep7Defs /></>} filter="seaLit">
        {f >= 128 && <SnowPath from={{ x: mid.x, y: mid.y + 120 * L.scale }} to={{ x: Hs.x, y: Hs.y + 80 }} reveal={reveal} g={g} />}
        <Coralie x={C.x} y={C.y} scale={C.scale} g={g} mood={flying ? "joy" : "happy"} look={flying ? { x: -0.6, y: -0.8 } : { x: -0.5, y: -0.6 }} blink={blinkAt(g, 7)} armL={flying ? 120 + Math.sin(f / 3) * 25 : 20} armR={-20} swim={0.6} />
        <BoboWinter
          g={g}
          x={b.x}
          y={b.y}
          scale={b.scale}
          scarf={0}
          look={lookHolo(B)}
          expr={flying ? "excited" : "surprised"}
          armL={flying ? 120 : 35}
          armR={flying ? -120 : -35}
          blink={blinkAt(g, 3)}
          riderLook={lookHolo(B)}
          riderArmsUp={flying}
        />
        <Lumi x={l.x} y={l.y} scale={l.scale} look={f >= 87 && f < 128 ? { x: 0.3, y: -0.3 } : lookHolo(L)} expr={f >= 87 ? "excited" : "surprised"} mouth={mouthAt("lumi", g)} armR={armR} armL={flying ? 90 : 25} blink={blinkAt(g, 1)} />
        {!flying && <Worn L={L} g={g} />}
        <Draco
          x={d.x}
          y={d.y}
          scale={d.scale}
          g={g}
          mood={f > 20 ? "excited" : "surprised"}
          mouth={mouthAt("draco", g)}
          look={f >= 30 && f < 87 ? { x: -0.4, y: -0.6 } : lookHolo(D)}
          blink={blinkAt(g, 5)}
          wing={f > 20 ? 0.9 : 0.5}
          flap={f > 20 ? Math.sin(f / 3) * 14 : 0}
          armsUp={f > 20 ? 0.75 : 0.3}
          glow={0.45}
        />
        {!flying && (
          <>
            <AirBubble x={B.x} y={B.y} scale={B.scale} g={g} fit={BUBBLE_FIT.bobo} ph={1} />
            <AirBubble x={L.x} y={L.y} scale={L.scale} g={g} fit={BUBBLE_FIT.lumi} ph={2} />
            <AirBubble x={D.x} y={D.y} scale={D.scale} g={g} fit={BUBBLE_FIT.draco} ph={3} />
            <Shell at={shellAt} s={L.scale * 1.3} g={g} glow={0.7 + 0.3 * pulse} />
          </>
        )}
        <circle cx={shellAt.x} cy={shellAt.y} r={ip(f, [0, 22], [120, 900], OUT)} fill="url(#iceGlow)" opacity={ip(f, [0, 4, 30], [1, 1, 0])} />
        <SparkBurst f={f} at={0} x={shellAt.x} y={shellAt.y} reach={620} count={32} size={22} life={36} />
        <SparkBurst f={f} at={PATH} x={mid.x} y={mid.y} reach={420} count={22} size={16} life={30} />
      </CharLayer>
      <AbsoluteFill style={{ background: "radial-gradient(circle at 50% 40%, #ffffff 0%, #eaf6ff 50%, #bfe0ff 100%)", opacity: ip(f, [FLASH - 6, FLASH + 12], [0, 1], EASE) }} />
    </AbsoluteFill>
  );
};

// ---------- Scene 2 (6-14s): arriving in the Snowflake Kingdom ----------
const P_BOBO: V3 = [-1.3, 0, 10.2];
const P_LUMI: V3 = [0, 0, 10.6];
const P_DRACO: V3 = [1.25, 0, 10.3];
const SKY_START: V3 = [5, 7, 20];
const S2_LAND = LAND - CUTS[1];
const S2_CRY = CRY - CUTS[1];

const Scene2: React.FC = () => {
  const f = useCurrentFrame();
  const g = f + CUTS[1];
  const cam = camAt(f, [
    [0, { pos: [0.8, 3.0, 21.5], target: [0, 6.5, -30], fov: 52 }],
    [95, { pos: [0.3, 2.3, 18.6], target: [0, 5.2, -30], fov: 50 }],
    [96, { pos: [0.3, 1.6, 15.8], target: [0, 1.5, 6], fov: 46 }],
    [119, { pos: [0.3, 1.6, 15.4], target: [0, 1.5, 6], fov: 46 }],
    [120, { pos: [-1.3, 1.1, 13.9], target: [-1.3, 0.95, 10.2], fov: 42 }],
    [151, { pos: [-1.3, 1.1, 13.6], target: [-1.3, 0.95, 10.2], fov: 42 }],
    [152, { pos: [-4, 2.6, -2], target: [-21, 6.5, -38], fov: 48 }],
    [S2_CRY - 1, { pos: [-5, 2.8, -4], target: [-21, 7, -38], fov: 48 }],
    [S2_CRY, { pos: [1.2, 1.7, 16.5], target: [-2.2, 1.3, 7.5], fov: 46 }],
    [240 + XF, { pos: [1.0, 1.65, 16.0], target: [-2.4, 1.3, 7.5], fov: 46 }],
  ]);
  const slide = (p: V3, delay: number) => {
    const k = ip(f, [delay, S2_LAND + delay * 0.3], [0, 1], Easing.inOut(Easing.quad));
    return { p: up(lerp3(lerp3(SKY_START, p, 0.15), p, k), (1 - k) * 4 + Math.sin(k * Math.PI) * 0.6), landed: k >= 1 };
  };
  const bo = slide(P_BOBO, 8);
  const lu = slide(P_LUMI, 0);
  const dr = slide(P_DRACO, 4);
  const B = place(cam, bo.p, BOBO_S);
  const L = place(cam, lu.p, LUMI_S);
  const D = place(cam, dr.p, DRACO_S);
  const landed = f >= S2_LAND + 4;
  const scarf = ip(f, [S2_LAND + 12, S2_LAND + 24], [0, 1], BACK(2));
  const amazed = f >= S2_LAND + 16;
  const heard = f >= S2_CRY + 4;
  const lookTree = { x: -1, y: 0.1 };
  const showFriends = f < 152 || f >= S2_CRY;
  const shiver = Math.sin(f * 2.1) * 2.5 * D.scale;
  const hand = lumiHandL(L.x, L.y, L.scale, 22);
  return (
    <SnowShot
      cam={cam}
      G={g}
      fade={false}
      world={<FlakePath t={g / 30} on={ip(f, [0, 20], [0.2, 1]) * ip(f, [S2_LAND + 20, S2_LAND + 60], [1, 0])} from={SKY_START} to={PLAZA} />}
      over={<AbsoluteFill style={{ background: "radial-gradient(circle at 50% 40%, #ffffff 0%, #eaf6ff 50%, #bfe0ff 100%)", opacity: ip(f, [0, 20], [1, 0], EASE) }} />}
    >
      {showFriends && (
        <>
          <BoboWinter
            g={g}
            x={B.x}
            y={B.y}
            scale={B.scale}
            scarf={scarf}
            look={heard ? lookTree : amazed ? { x: 0.2, y: -1 } : { x: 0.4, y: 0.4 }}
            expr={heard ? "surprised" : f >= 120 && f < 152 ? "excited" : amazed ? "surprised" : "happy"}
            mouth={mouthAt("bobo", g)}
            armL={f >= 120 && f < 152 ? 140 : landed ? 30 : 100}
            armR={f >= 120 && f < 152 ? -140 : landed ? -30 : -100}
            blink={blinkAt(g, 3)}
            riderLook={heard ? lookTree : { x: 0.3, y: -1 }}
            riderArmsUp={f >= 120 && f < 152}
            squash={ip(f, [S2_LAND + 4, S2_LAND + 8, S2_LAND + 14], [1, 0.88, 1])}
          />
          <Lumi x={L.x} y={L.y} scale={L.scale} look={heard ? lookTree : amazed ? { x: 0.1, y: -1 } : { x: 0.3, y: 0.4 }} expr={heard ? "surprised" : amazed ? "surprised" : "excited"} armL={22} armR={landed ? -30 : -100} headTilt={heard ? -6 : amazed ? -4 : 0} blink={blinkAt(g, 1)} />
          <Worn L={L} g={g} />
          <Shell at={hand} s={L.scale} g={g} glow={0.35} />
          <Draco
            x={D.x + (landed ? shiver : 0)}
            y={D.y}
            scale={D.scale}
            g={g}
            mood={heard ? "surprised" : amazed ? "surprised" : "joy"}
            look={heard ? lookTree : amazed ? { x: -0.2, y: -1 } : { x: -0.3, y: 0.4 }}
            blink={blinkAt(g, 5)}
            wing={landed ? 0.25 : 1}
            flap={landed ? 0 : Math.sin(f * 0.6) * 18}
            armsUp={landed ? 0.05 : 0.7}
            glow={0.4}
          />
          {landed && (
            <>
              <BreathPuff {...dracoMouth(D.x, D.y, D.scale)} scale={D.scale} g={g} />
              <BreathPuff {...lumiMouth(L.x, L.y, L.scale)} scale={L.scale * 0.8} g={g} ph={20} side={-1} every={70} />
            </>
          )}
          <SparkBurst f={f} at={S2_LAND + 12} x={B.x} y={B.y - 220 * B.scale} reach={200} count={16} size={12} life={24} />
        </>
      )}
    </SnowShot>
  );
};

// ---------- Scene 3 (14-23.5s): Niva under the tree; the kingdom loses its colors ----------
const NIVA_AT: V3 = [-5.3, 0, 8.4];
const T_LUMI: V3 = [-3.85, 0, 9.0];
const T_DRACO: V3 = [-2.65, 0, 8.9];
const T_BOBO: V3 = [-1.45, 0, 9.3];
const S3_FADE = FADE - CUTS[2];

const Scene3: React.FC = () => {
  const f = useCurrentFrame();
  const g = f + CUTS[2];
  const cam = camAt(f, [
    [0, { pos: [-1.9, 1.7, 16.4], target: [-3.9, 1.1, 8], fov: 46 }],
    [45, { pos: [-2.8, 1.5, 15.4], target: [-4.1, 1.0, 8.2], fov: 46 }],
    [46, { pos: [-4.55, 1.05, 12.8], target: [-4.55, 0.85, 8.7], fov: 44 }],
    [97, { pos: [-4.55, 1.05, 12.4], target: [-4.55, 0.85, 8.7], fov: 44 }],
    [98, { pos: [-5.3, 0.8, 11.3], target: [-5.3, 0.62, 8.4], fov: 40 }],
    [S3_FADE - 1, { pos: [-5.3, 0.8, 11.0], target: [-5.3, 0.62, 8.4], fov: 40 }],
    [S3_FADE, { pos: [-2.6, 3, 4], target: [0, 12, -42], fov: 52 }],
    [239, { pos: [-2.0, 3.6, 1.5], target: [0, 13, -42], fov: 52 }],
    [240, { pos: [-2.65, 0.95, 11.6], target: [-2.65, 0.8, 8.9], fov: 42 }],
    [285 + XF, { pos: [-2.65, 0.95, 11.2], target: [-2.65, 0.8, 8.9], fov: 42 }],
  ]);
  const walk = ip(f, [0, 40], [0, 1], EASE);
  const walking = f < 40;
  const lu = lerp3(P_LUMI, T_LUMI, walk);
  const dr = lerp3(P_DRACO, T_DRACO, walk);
  const bo = lerp3(P_BOBO, T_BOBO, walk);
  const L = place(cam, lu, LUMI_S);
  const D = place(cam, dr, DRACO_S);
  const B = place(cam, bo, BOBO_S);
  const N = place(cam, NIVA_AT, NIVA_S);
  const toNiva = (who: { x: number }) => ({ x: clamp1((N.x - who.x) / 260), y: 0.3 });
  const nMouth = mouthAt("niva", g);
  const nMood: NivaMood = f < 50 ? "sad" : nMouth > 0.06 ? "sad" : "sad";
  const wideCastle = f >= S3_FADE && f < 240;
  const dracoSays = f >= 240;
  const handL = lumiHandL(L.x, L.y, L.scale, 22);
  return (
    <SnowShot cam={cam} G={g}>
      {!wideCastle && (
        <>
          <Niva x={N.x} y={N.y} scale={N.scale} g={g} mood={nMood} mouth={nMouth} look={f < 30 ? { x: 0, y: 0.4 } : { x: 0.7, y: -0.3 }} blink={blinkAt(g, 9)} tailWag={0.3} headTilt={f < 30 ? 0 : 8} />
          <BoboWinter g={g} x={B.x} y={B.y} scale={B.scale} look={toNiva(B)} expr="neutral" walk={walking ? f * 0.45 : null} armL={20} armR={-20} blink={blinkAt(g, 3)} riderLook={toNiva(B)} />
          <Draco
            x={D.x}
            y={D.y}
            scale={D.scale}
            g={g}
            mood={dracoSays ? (mouthAt("draco", g) > 0.06 ? "excited" : "happy") : f > 130 ? "sad" : "surprised"}
            mouth={mouthAt("draco", g)}
            look={dracoSays ? { x: -0.5, y: -0.2 } : toNiva(D)}
            blink={blinkAt(g, 5)}
            wing={dracoSays ? 0.8 : 0.3}
            flap={dracoSays ? Math.sin(f / 3) * 12 : 0}
            armsUp={dracoSays ? 0.6 : 0.1}
            step={walking ? f * 0.55 : null}
            glow={0.4}
          />
          <Lumi
            x={L.x}
            y={L.y}
            scale={L.scale}
            look={toNiva(L)}
            expr={f < 48 ? "neutral" : f < 100 ? "happy" : f > 130 ? "neutral" : "surprised"}
            mouth={mouthAt("lumi", g)}
            walk={walking ? f * 0.4 : null}
            armR={f >= 48 && f < 100 ? -40 : -15}
            armL={22}
            headTilt={f >= 48 ? 7 : 0}
            blink={blinkAt(g, 1)}
          />
          <Worn L={L} g={g} />
          <Shell at={handL} s={L.scale} g={g} glow={0.35} />
          <BreathPuff {...dracoMouth(D.x, D.y, D.scale)} scale={D.scale} g={g} ph={10} />
        </>
      )}
    </SnowShot>
  );
};

// ---------- Scene 4 (23.5-32s): inside the ice cave; the Aurora Crystal in a block of ice ----------
const C_NIVA: V3 = [-2.0, 0, 2.1];
const C_LUMI: V3 = [-0.95, 0, 2.5];
const C_DRACO: V3 = [0.9, 0, 2.35];
const C_BOBO: V3 = [2.05, 0, 2.05];
const S4 = { breath: BREATH - CUTS[3], push: PUSH - CUTS[3], glow: SHELL_GLOW - CUTS[3], project: PROJECT - CUTS[3] };
const caveLight = (G: number) => (G < AURORA ? 0.3 : 1);

const CaveShot: React.FC<{ cam: Cam3; G: number; fade?: boolean; world?: React.ReactNode; children: React.ReactNode; over?: React.ReactNode }> = ({ cam, G, fade = true, world, children, over }) => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill style={{ opacity: fade ? ip(f, [0, XF], [0, 1]) : 1, background: "#0a1238" }}>
      <World3D cam={cam} bloom={0.9} threshold={0.7}>
        <IceCave t={G / 30} glow={caveLight(G)} s={snowState(G)} />
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
    [0, { pos: [0, 2.6, 10.5], target: [0, 1.5, 0], fov: 48 }],
    [45, { pos: [0, 1.9, 8.2], target: [0, 1.4, 0.4], fov: 46 }],
    [46, { pos: [3.4, 1.1, 5.0], target: [0.35, 1.1, 0.9], fov: 42 }],
    [96, { pos: [3.2, 1.1, 4.7], target: [0.35, 1.1, 0.9], fov: 42 }],
    [97, { pos: [3.0, 1.05, 5.4], target: [1.05, 0.95, 0.7], fov: 42 }],
    [146, { pos: [2.8, 1.05, 5.1], target: [1.05, 0.95, 0.7], fov: 42 }],
    [147, { pos: [-0.75, 1.15, 5.4], target: [-0.75, 1.05, 1.6], fov: 42 }],
    [S4.project - 1, { pos: [-0.75, 1.15, 5.1], target: [-0.75, 1.05, 1.6], fov: 42 }],
    [S4.project, { pos: [-0.3, 1.9, 7.2], target: [-0.1, 1.25, 0.6], fov: 46 }],
    [255 + XF, { pos: [-0.3, 1.8, 6.6], target: [-0.1, 1.25, 0.6], fov: 46 }],
  ]);
  const walkIn = ip(f, [0, 40], [1, 0], EASE);
  const walking = f < 40;
  const enter = (p: V3, k: number): V3 => [p[0] * (1 + k * 0.3), 0, p[2] + k * 6];
  // Bobo walks up to the block and pushes, the ice doesn't budge
  const bWalk = ip(f, [S4.push - 14, S4.push], [0, 1], EASE) * ip(f, [S4.push + 30, S4.push + 42], [1, 0.25], Easing.out(Easing.quad));
  const boboP = lerp3(enter(C_BOBO, walkIn), [1.15, 0, 0.75], bWalk);
  const bPush = ip(f, [S4.push, S4.push + 10, S4.push + 22, S4.push + 30], [0, 0.6, 0.65, 0]);
  const breath = ip(f, [S4.breath, S4.breath + 6, S4.breath + 30, S4.breath + 38], [0, 1, 1, 0]);
  const warm = ip(f, [S4.breath + 6, S4.breath + 30, S4.breath + 60], [0, 0.7, 0]);
  const shellGlow = ip(f, [S4.glow, S4.glow + 14], [0.3, 1], OUT);
  const showing = f >= S4.glow;
  const projecting = ip(f, [S4.project, S4.project + 16], [0, 1], OUT);
  const L = place(cam, enter(C_LUMI, walkIn), LUMI_S);
  const D = place(cam, enter(C_DRACO, walkIn), DRACO_S);
  const B = place(cam, boboP, BOBO_S);
  const N = place(cam, enter(C_NIVA, walkIn), NIVA_S);
  const Bk = screen(cam, CAVE_BLOCK);
  const lookAt = (who: { x: number; y: number }) => ({ x: clamp1((Bk.x - who.x) / 260), y: clamp1((Bk.y - (who.y - 300)) / 300) });
  const armR = showing ? ip(f, [S4.glow, S4.glow + 10], [-15, -70], EASE) : -15;
  const hand = lumiHand(L.x, L.y, L.scale, armR);
  const shellAt = showing ? { x: hand.x, y: hand.y + 16 * L.scale } : lumiHandL(L.x, L.y, L.scale, 22);
  return (
    <CaveShot
      cam={cam}
      G={g}
      world={
        <>
          <AuroraCrystal position={CAVE_BLOCK} t={t} glow={0.15 + projecting * 0.25} sat={0.25 + projecting * 0.5} scale={0.62} spin={0.2} />
          <IceBlock position={CAVE_BLOCK} t={t} melt={0} aurora={projecting} warm={warm} push={bPush} />
        </>
      }
    >
      <Niva x={N.x} y={N.y} scale={N.scale} g={g} mood={projecting > 0.3 ? "surprised" : "neutral"} look={lookAt(N)} blink={blinkAt(g, 9)} tailWag={walking ? 1 : 0.5} squash={walking ? 1 + Math.sin(f * 0.6) * 0.04 : 1} />
      <Lumi x={L.x} y={L.y} scale={L.scale} look={showing && f < S4.project ? { x: 0.6, y: -0.2 } : lookAt(L)} expr={showing ? "excited" : "surprised"} mouth={mouthAt("lumi", g)} walk={walking ? f * 0.4 : null} armR={armR} armL={22} headTilt={showing ? 5 : 0} blink={blinkAt(g, 1)} />
      <Worn L={L} g={g} />
      <Shell at={shellAt} s={L.scale * (showing ? 1.2 : 1)} g={g} glow={showing ? shellGlow * (0.8 + 0.2 * Math.sin(g / 3)) : 0.3} />
      <Draco
        x={D.x}
        y={D.y}
        scale={D.scale}
        g={g}
        mood={breath > 0.1 ? "effort" : f > S4.breath + 40 && f < S4.breath + 70 ? "surprised" : "happy"}
        mouth={breath > 0.1 ? 0.6 : 0}
        look={lookAt(D)}
        blink={blinkAt(g, 5)}
        wing={breath > 0 ? 0.8 : 0.35}
        breath={ip(f, [S4.breath - 14, S4.breath], [0, 1]) * ip(f, [S4.breath, S4.breath + 8], [1, 0])}
        step={walking ? f * 0.55 : null}
        glow={0.45}
      />
      <BoboWinter
        g={g}
        x={B.x}
        y={B.y}
        scale={B.scale}
        look={lookAt(B)}
        expr={bPush > 0.1 ? "effort" : f > S4.push + 28 && f < S4.push + 56 ? "surprised" : "happy"}
        walk={walking || (f > S4.push - 14 && f < S4.push) ? f * 0.45 : null}
        armL={bPush > 0 ? 95 : 20}
        armR={bPush > 0 ? -95 : -20}
        lean={-bPush * 10 + ip(f, [S4.push + 28, S4.push + 34, S4.push + 46], [0, 8, 0])}
        squash={ip(f, [S4.push + 28, S4.push + 32, S4.push + 42], [1, 0.86, 1])}
        blink={blinkAt(g, 3)}
        riderLook={lookAt(B)}
      />
      <WarmBreath from={{ x: lerp(dracoMouth(D.x, D.y, D.scale).x, Bk.x, 0.18), y: lerp(dracoMouth(D.x, D.y, D.scale).y, Bk.y, 0.18) }} to={Bk} on={breath} g={g} scale={D.scale} />
      {projecting > 0 && <AuroraBeam from={shellAt} to={Bk} on={projecting} g={g} width={60} />}
      {f >= S4.glow && f < S4.glow + 26 && <Sparkle x={shellAt.x} y={shellAt.y} size={ip(f, [S4.glow, S4.glow + 8, S4.glow + 26], [10, 90, 0])} color="#e8f8ff" rotate={f * 4} />}
    </CaveShot>
  );
};

// ---------- Scene 5 (32-42s): the ice melts, the crystal flies home, the northern lights return ----------
const S5 = { raise: RAISE - CUTS[4], light: LIGHT - CUTS[4], melt: MELT - CUTS[4], free: FREE - CUTS[4], rise: RISE - CUTS[4], out: 126, home: HOME - CUTS[4], aurora: AURORA - CUTS[4], group: 196 };
const EXIT: V3 = up([CAVE_EXT[0] - 0.9, 0, CAVE_EXT[2] + 1.6], 2.0);
const GROUP_BASE: V3 = [12.3, 0, -5.6];
const CFWD: [number, number] = [CASTLE[0] - GROUP_BASE[0], CASTLE[2] - GROUP_BASE[2]];
const G_BOBO = spot(GROUP_BASE, CFWD, -1.3, -0.1);
const G_LUMI = spot(GROUP_BASE, CFWD, -0.35, 0.15);
const G_NIVA = spot(GROUP_BASE, CFWD, 0.55, 0.3);
const G_DRACO = spot(GROUP_BASE, CFWD, 1.45, 0.0);
const CROWN_AT: V3 = up(CROWN, 1.3);

const crystalPath = (f: number): V3 => {
  const k = ip(f, [S5.out, S5.home], [0, 1], Easing.inOut(Easing.sin));
  const ctrl: V3 = [10, 26, -22];
  return lerp3(lerp3(EXIT, ctrl, k), lerp3(ctrl, CROWN_AT, k), k);
};

const Scene5: React.FC = () => {
  const f = useCurrentFrame();
  const g = f + CUTS[4];
  const t = g / 30;
  const inCave = f < S5.out;
  const melt = ip(f, [S5.melt, S5.free], [0, 1], Easing.inOut(Easing.quad));
  const glowC = ip(f, [S5.light, S5.free], [0.4, 1.0]) + ip(f, [S5.free, S5.free + 8], [0, 0.8]);
  const riseY = ip(f, [S5.rise, S5.out], [0, 4], Easing.in(Easing.quad));
  if (inCave) {
    const cam = camAt(f, [
      [0, { pos: [-0.45, 1.35, 5.0], target: [-0.3, 1.25, 0.9], fov: 44 }],
      [S5.rise, { pos: [-0.35, 1.3, 4.6], target: [-0.25, 1.3, 0.9], fov: 44 }],
      [S5.out, { pos: [-0.3, 1.0, 4.4], target: [0, 4.0, 0], fov: 46 }],
    ]);
    const step = ip(f, [S5.raise, S5.raise + 18], [0, 1], EASE);
    const L = place(cam, lerp3(C_LUMI, [-0.75, 0, 1.55], step), LUMI_S);
    const N = place(cam, C_NIVA, NIVA_S);
    const D = place(cam, C_DRACO, DRACO_S);
    const armR = ip(f, [S5.raise, S5.raise + 14], [-70, -100], BACK(1.5));
    const hand = lumiHand(L.x, L.y, L.scale, armR);
    const shellAt = { x: hand.x, y: hand.y + 16 * L.scale };
    const Bk = screen(cam, up(CAVE_BLOCK, riseY));
    const light = ip(f, [S5.light, S5.light + 16], [0, 1], OUT) * ip(f, [S5.free, S5.free + 10], [1, 0]);
    const freed = f >= S5.free;
    const lookAt = (who: { x: number; y: number }) => (freed ? { x: clamp1((Bk.x - who.x) / 260), y: -1 } : { x: clamp1((Bk.x - who.x) / 260), y: -0.3 });
    return (
      <CaveShot
        cam={cam}
        G={g}
        world={
          <>
            <AuroraCrystal position={up(CAVE_BLOCK, riseY)} t={t} glow={glowC} sat={0.6 + light * 0.4} scale={0.62 + ip(f, [S5.free, S5.out], [0, 0.3])} spin={0.4 + light * 1.2} />
            <IceBlock position={CAVE_BLOCK} t={t} melt={melt} aurora={1 - melt * 0.5} />
            <LightRing position={CAVE_BLOCK} age={ip(f, [S5.light, S5.light + 40], [0, 1])} radius={3} flat={false} color="#7fd8ff" />
            <LightRing position={CAVE_BLOCK} age={ip(f, [S5.light + 10, S5.light + 50], [0, 1])} radius={3.5} color="#c49bff" />
            <LightRing position={CAVE_BLOCK} age={ip(f, [S5.light + 20, S5.light + 60], [0, 1])} radius={4} flat={false} color="#ffe39a" />
            <SparkleBurst3D position={CAVE_BLOCK} age={ip(f, [S5.melt, S5.melt + 50], [0, 1])} reach={2.2} count={140} seed={41} size={7} gravity={2.2} colors={["#bff4ff", "#ffffff", "#9fd8ff", "#e8f8ff"]} />
            <SparkleBurst3D position={CAVE_BLOCK} age={ip(f, [S5.free, S5.free + 34], [0, 1])} reach={3} count={160} seed={43} size={8} colors={["#7fffc8", "#c49bff", "#ffe39a", "#7fd8ff"]} />
          </>
        }
        over={<AbsoluteFill style={{ background: "#eafcff", opacity: ip(f, [S5.out - 8, S5.out], [0, 0.85]) }} />}
      >
        <Niva x={N.x} y={N.y} scale={N.scale} g={g} mood={freed ? "excited" : "surprised"} look={lookAt(N)} blink={blinkAt(g, 9)} tailWag={freed ? 1.4 : 0.6} />
        <Draco x={D.x} y={D.y} scale={D.scale} g={g} mood={freed ? "excited" : "surprised"} look={lookAt(D)} blink={blinkAt(g, 5)} wing={freed ? 1 : 0.5} flap={freed ? Math.sin(f * 0.8) * 22 : 0} armsUp={freed ? 0.9 : 0.3} glow={0.5} />
        <Lumi x={L.x} y={L.y} scale={L.scale} look={lookAt(L)} expr={freed ? "excited" : "happy"} armR={armR} armL={30} headTilt={-4} walk={step > 0.02 && step < 0.98 ? f * 0.4 : null} blink={blinkAt(g, 1)} />
        <Worn L={L} g={g} glow={0.8} />
        <circle cx={shellAt.x} cy={shellAt.y} r={(90 + light * 120) * L.scale} fill="url(#iceGlow)" opacity={0.5 + light * 0.4} />
        <Shell at={shellAt} s={L.scale * 1.2} g={g} glow={1} />
        <AuroraBeam from={shellAt} to={Bk} on={light} g={g} width={70} />
        {melt > 0 &&
          melt < 1 &&
          Array.from({ length: 14 }, (_, i) => {
            const k = ((f - S5.melt) / 20 + i / 14) % 1;
            return <circle key={i} cx={Bk.x + Math.sin(i * 2.7) * 140 * L.scale} cy={Bk.y + 80 * L.scale + k * 260 * L.scale} r={(6 + (i % 3) * 3) * L.scale + 2} fill="#dff6ff" opacity={(1 - k) * 0.9} />;
          })}
      </CaveShot>
    );
  }
  // outside: the crystal flies from the cave to the castle; the northern lights come back
  const crys = crystalPath(f);
  const follow = ip(f, [S5.out, S5.home], [0, 1], EASE);
  let cam: Cam3;
  if (f < S5.aurora) {
    cam = { pos: lerp3([CAVE_EXT[0] - 6, 3, CAVE_EXT[2] + 12], [18, 9, 14], follow), target: lerp3(crys, lerp3(crys, CROWN, 0.5), follow), fov: lerp(48, 54, follow) };
  } else if (f < S5.group) {
    const k = ip(f, [S5.aurora, S5.group], [0, 1]);
    cam = { pos: lerp3([18, 9, 14], [10, 6, 18], k), target: lerp3(CROWN, [0, 16, -42], k), fov: 56 };
  } else {
    cam = camAt(f, [
      [S5.group, { pos: spot(GROUP_BASE, CFWD, 0.1, 7.6, 1.1), target: spot(GROUP_BASE, CFWD, 0.1, -3, 2.6), fov: 46 }],
      [300 + XF, { pos: spot(GROUP_BASE, CFWD, 0.1, 7.0, 1.0), target: spot(GROUP_BASE, CFWD, 0.1, -3, 2.6), fov: 46 }],
    ]);
  }
  const group = f >= S5.group;
  const lit = f >= S5.aurora;
  const hop = group ? Math.abs(Math.sin((f - S5.group) / 6)) * ip(f, [S5.group, S5.group + 6, 250, 262], [0, 0.32, 0.32, 0]) : 0;
  const L = place(cam, G_LUMI, LUMI_S);
  const B = place(cam, G_BOBO, BOBO_S);
  const D = place(cam, up(G_DRACO, Math.abs(Math.sin(f / 7)) * 0.2), DRACO_S);
  const N = place(cam, up(G_NIVA, hop), NIVA_S);
  const nMouth = mouthAt("niva", g);
  const C = screen(cam, CROWN_AT);
  const handL = lumiHandL(L.x, L.y, L.scale, 140);
  return (
    <SnowShot
      cam={cam}
      G={g}
      fade={false}
      sparkle={lit ? ip(f, [S5.aurora, S5.aurora + 40], [0, 1]) : 0}
      world={
        <>
          <AuroraCrystal position={f < S5.home ? crys : CROWN_AT} t={t} glow={f < S5.home ? 1.4 : ip(f, [S5.home, S5.aurora + 10], [1.4, 2.4])} scale={lerp(0.8, 1.9, follow)} spin={1.2} />
          <SparkleBurst3D position={CROWN_AT} age={ip(f, [S5.aurora, S5.aurora + 50], [0, 1])} reach={26} count={260} seed={23} size={26} gravity={2} colors={["#7fffc8", "#c49bff", "#ffe39a", "#7fd8ff", "#ff9fd8"]} />
          <LightRing position={CROWN_AT} age={ip(f, [S5.aurora, S5.aurora + 60], [0, 1])} radius={70} color="#7fffc8" />
          <LightRing position={[CASTLE[0], 1.0, CASTLE[2]]} age={ip(f, [S5.aurora + 8, S5.aurora + 80], [0, 1])} radius={120} color="#c49bff" />
          <LightRing position={CROWN_AT} age={ip(f, [S5.aurora + 4, S5.aurora + 54], [0, 1])} radius={44} flat={false} color="#ffffff" />
        </>
      }
      over={
        <>
          <AbsoluteFill style={{ background: "#eafcff", opacity: ip(f, [S5.out, S5.out + 14], [0.85, 0]) }} />
          {lit && f < S5.aurora + 20 && <AbsoluteFill style={{ background: "#eafff4", opacity: ip(f, [S5.aurora, S5.aurora + 3, S5.aurora + 20], [0, 0.5, 0]) }} />}
        </>
      }
    >
      {!group &&
        f < S5.home + 4 &&
        Array.from({ length: 22 }, (_, k) => {
          const tt = f - (k + 1) * 1.2;
          if (tt < S5.out) return null;
          const p = screen(cam, crystalPath(tt));
          return <Sparkle key={k} x={p.x + Math.sin(k * 2.1) * 12} y={p.y + Math.cos(k * 1.7) * 12} size={28 * (1 - k / 22)} opacity={1 - k / 22} color={["#7fffc8", "#c49bff", "#ffe39a"][k % 3]} rotate={k * 30 + f * 4} />;
        })}
      {!group && f >= S5.home - 6 && f < S5.aurora + 10 && <circle cx={C.x} cy={C.y} r={ip(f, [S5.home, S5.aurora + 10], [0, 560])} fill="url(#iceGlow)" opacity={ip(f, [S5.home, S5.aurora, S5.aurora + 10], [0, 0.85, 0])} />}
      {group && (
        <>
          <BoboWinter g={g} x={B.x} y={B.y} scale={B.scale} look={{ x: 0.3, y: -0.4 }} expr="excited" armL={140} armR={-140} blink={blinkAt(g, 3)} riderLook={{ x: 0.3, y: -1 }} riderArmsUp />
          <Lumi x={L.x} y={L.y} scale={L.scale} look={f > 240 ? { x: 0.2, y: 0 } : { x: 0.5, y: -0.2 }} expr={f > 240 ? "happy" : "excited"} mouth={mouthAt("lumi", g)} armR={-140} armL={140} headTilt={3} blink={blinkAt(g, 1)} />
          <Worn L={L} g={g} glow={1} />
          <Shell at={handL} s={L.scale} g={g} glow={0.8} />
          <Niva x={N.x} y={N.y} scale={N.scale} g={g} mood={nMouth > 0.06 ? "excited" : "joy"} mouth={nMouth} look={{ x: -0.6, y: -0.2 }} blink={blinkAt(g, 9)} tailWag={1.5} pawUp={0.6} squash={hop > 0.05 ? 1.04 : 1} />
          <Draco x={D.x} y={D.y} scale={D.scale} g={g} mood="joy" look={{ x: -0.6, y: -0.2 }} blink={blinkAt(g, 5)} wing={1} flap={Math.sin(f * 0.9) * 26} armsUp={0.9} glow={0.5} />
          <SparkBurst f={f} at={S5.group} x={540} y={700} reach={520} count={26} size={18} life={36} rainbow />
        </>
      )}
    </SnowShot>
  );
};

// ---------- Scene 6 (42-50s): the snowflake pendant shows a jungle ----------
const S6 = { give: GIVE - CUTS[5], jungle: JUNGLE - CUTS[5], end: END - CUTS[5] };
const HOLO: V3 = spot(GROUP_BASE, CFWD, 0.15, -1.9, 2.35);

const Scene6: React.FC = () => {
  const f = useCurrentFrame();
  const g = f + CUTS[5];
  const t = g / 30;
  const cam = camAt(f, [
    [0, { pos: spot(GROUP_BASE, CFWD, 0.1, 4.7, 0.6), target: spot(GROUP_BASE, CFWD, 0.1, -1, 0.95), fov: 42 }],
    [S6.jungle - 1, { pos: spot(GROUP_BASE, CFWD, 0.1, 4.4, 0.6), target: spot(GROUP_BASE, CFWD, 0.1, -1, 0.95), fov: 42 }],
    [S6.jungle, { pos: spot(GROUP_BASE, CFWD, 0.7, 5.8, 1.0), target: spot(GROUP_BASE, CFWD, 0.7, -1.5, 1.9), fov: 46 }],
    [117, { pos: spot(GROUP_BASE, CFWD, 0.7, 5.5, 1.0), target: spot(GROUP_BASE, CFWD, 0.7, -1.5, 1.9), fov: 46 }],
    [118, { pos: spot(G_DRACO, CFWD, 0, 3.0, 0.75), target: spot(G_DRACO, CFWD, 0, 0, 0.8), fov: 40 }],
    [149, { pos: spot(G_DRACO, CFWD, 0, 2.8, 0.75), target: spot(G_DRACO, CFWD, 0, 0, 0.8), fov: 40 }],
    [150, { pos: spot(GROUP_BASE, CFWD, 0.1, 7.6, 1.1), target: spot(GROUP_BASE, CFWD, 0.1, -2, 2.2), fov: 46 }],
    [240, { pos: spot(GROUP_BASE, CFWD, 0.1, 8.4, 1.25), target: spot(GROUP_BASE, CFWD, 0.1, -2, 2.35), fov: 46 }],
  ]);
  const L = place(cam, G_LUMI, LUMI_S);
  const B = place(cam, G_BOBO, BOBO_S);
  const D = place(cam, up(G_DRACO, f >= 118 && f < 150 ? Math.abs(Math.sin(f / 6)) * 0.14 : 0), DRACO_S);
  const N = place(cam, up(G_NIVA, Math.sin(g / 10) * 0.01), NIVA_S);
  const lumiArm = ip(f, [S6.give + 14, S6.give + 28], [-20, -105], EASE);
  const lh = lumiHand(L.x, L.y, L.scale, lumiArm);
  const brow = { x: N.x, y: N.y - (228 + 54) * N.scale };
  // the pendant lifts off the snowflake on Niva's forehead and floats into Lumi's hand
  const give = ip(f, [S6.give + 6, S6.give + 36], [0, 1], EASE);
  const pend = { x: lerp(brow.x, lh.x, give), y: lerp(brow.y, lh.y + 20 * L.scale, give) - Math.sin(give * Math.PI) * 120 * L.scale };
  const project = ip(f, [S6.jungle, S6.jungle + 24], [0, 1], OUT);
  const projecting = f >= S6.jungle;
  const Hs = screen(cam, up(HOLO, 0.45));
  const lookHolo = (who: { x: number }) => ({ x: clamp1((Hs.x - who.x) / 300), y: -1 });
  const nMouth = mouthAt("niva", g);
  const handL = lumiHandL(L.x, L.y, L.scale, projecting ? 30 : 22);
  return (
    <SnowShot
      cam={cam}
      G={g}
      sparkle={1}
      world={
        <>
          <JungleHologram position={HOLO} t={t} on={project} scale={0.7} />
          <SparkleBurst3D position={up(HOLO, 0.8)} age={ip(f, [S6.jungle, S6.jungle + 34], [0, 1])} reach={2.4} count={120} seed={33} colors={["#7fff9f", "#ffffff", "#c8ffb0", "#fff3a0"]} />
        </>
      }
      over={<EndCard at={S6.end} top={250} />}
    >
      {projecting && (
        <path d={`M ${pend.x - 10} ${pend.y} L ${Hs.x - 170 * project} ${Hs.y + 130} L ${Hs.x + 170 * project} ${Hs.y + 130} L ${pend.x + 10} ${pend.y} Z`} fill="#9fffb8" opacity={0.18 * project * (0.8 + 0.2 * Math.sin(g / 3))} />
      )}
      <BoboWinter g={g} x={B.x} y={B.y} scale={B.scale} look={projecting ? lookHolo(B) : { x: 0.8, y: -0.1 }} expr={projecting ? "surprised" : "happy"} armL={projecting ? 50 : 20} armR={projecting ? -50 : -20} blink={blinkAt(g, 3)} riderLook={projecting ? lookHolo(B) : { x: 0.8, y: 0 }} riderArmsUp={projecting} />
      <Lumi x={L.x} y={L.y} scale={L.scale} look={projecting ? lookHolo(L) : { x: 0.8, y: -0.2 }} expr={projecting ? "surprised" : "happy"} mouth={mouthAt("lumi", g)} armR={lumiArm} armL={projecting ? 30 : 22} headTilt={projecting ? -5 : 4} blink={blinkAt(g, 1)} />
      <Worn L={L} g={g} glow={0.8} />
      <Shell at={handL} s={L.scale} g={g} glow={0.6} />
      <Niva x={N.x} y={N.y} scale={N.scale} g={g} mood={nMouth > 0.06 ? "happy" : projecting ? "surprised" : "joy"} mouth={nMouth} look={projecting ? lookHolo(N) : { x: -0.8, y: -0.3 }} blink={blinkAt(g, 9)} tailWag={1.1} headTilt={projecting ? 0 : -6} />
      <Draco
        x={D.x}
        y={D.y}
        scale={D.scale}
        g={g}
        mood={mouthAt("draco", g) > 0.06 ? "excited" : projecting ? "joy" : "happy"}
        mouth={mouthAt("draco", g)}
        look={projecting ? lookHolo(D) : { x: -0.5, y: -0.2 }}
        blink={blinkAt(g, 5)}
        wing={projecting ? 1 : 0.5}
        flap={projecting ? Math.sin(f / 2.5) * 18 : 0}
        armsUp={projecting ? 0.9 : 0.2}
        glow={0.5}
      />
      <SnowflakePendant x={pend.x} y={pend.y} scale={0.75 * L.scale} g={g} glow={0.5 + project * 0.5} />
      <SparkBurst f={f} at={S6.give + 6} x={brow.x} y={brow.y} reach={160} count={14} size={10} life={22} />
    </SnowShot>
  );
};

export const Episode: React.FC = () => <EpisodeFrame audio="ep07/audio.wav" cuts={CUTS} scenes={[Scene1, Scene2, Scene3, Scene4, Scene5, Scene6]} />;
