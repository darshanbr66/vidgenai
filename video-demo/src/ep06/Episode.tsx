import React from "react";
import { AbsoluteFill, Easing, useCurrentFrame } from "remotion";
import timeline from "./timeline.json";
import { blinkAt, Lumi } from "../story/characters";
import { Sparkle } from "../story/scenery";
import { Draco, Ep4Defs } from "../ep04/props";
import { BoboRider, EASE, EndCard, EpisodeFrame, ip, lumiHand, makeMouthAt, OUT, SparkBurst, XF } from "../kit";
import { Cam3, World3D } from "../kit3d/World";
import { camAt, CharLayer, place, screen, V3 } from "../kit3d/overlay";
import { LightRing, MagicBubble, SparkleBurst3D } from "../kit3d/magic";
import { MoonKingdom } from "../ep05/world";
import { Ep5Defs, MoonPendant } from "../ep05/props";
import { colorAt, OceanPearl, PEARL_SPOT, SeaState, SnowHologram, SOCKET, UnderwaterKingdom } from "./world";
import { AirBubble, BUBBLE_FIT, BubblePop, Coralie, coralieHand, CoralieMood, Ep6Defs, GlowShell, SeaBeam, SeaMap } from "./props";

const mouthAt = makeMouthAt(timeline);
export const CUTS = [0, 180, 420, 720, 960, 1260, 1500];
const BACK = (s: number) => Easing.out(Easing.back(s));
const lerp = (a: number, b: number, k: number) => a + (b - a) * k;
const lerp3 = (a: V3, b: V3, k: number): V3 => [lerp(a[0], b[0], k), lerp(a[1], b[1], k), lerp(a[2], b[2], k)];
const up = (p: V3, h: number): V3 => [p[0], p[1] + h, p[2]];
const clamp1 = (v: number) => Math.max(-1, Math.min(1, v));

// Relative sizes, the same as Episode 5
const LUMI_S = 1;
const BOBO_S = 0.91;
const DRACO_S = 1.05;
const CORALIE_S = 0.82;

// ---- timed moments in frames; the same numbers (in seconds) are in scripts/ep06_audio.py ----
const BUBBLE = 129;
const DIVE = 147;
const SPLASH = 165;
const LAND = 288;
const CORALIE_IN = 423;
const FADE = 630;
const BIG_BUBBLE = 756;
const DRACO_FLAP = 789;
const BOBO_PUSH = 828;
const GLINT = 870;
const RAISE = 969;
const BEAM = 999;
const POP = 1041;
const RISE = 1053;
const HOME = 1110;
const COLOR = 1116;
const SHELL = 1266;
const PROJECT = 1335;
const END = 1422;

// Places characters around a point: `fwd` is the camera's looking direction on the ground,
// dx is sideways (screen right is positive) and d is toward the camera.
const spot = (base: V3, fwd: [number, number], dx: number, d: number, h = 0): V3 => {
  const len = Math.hypot(fwd[0], fwd[1]);
  const fx = fwd[0] / len;
  const fz = fwd[1] / len;
  return [base[0] - fx * d - fz * dx, base[1] + h, base[2] - fz * d + fx * dx];
};

// How colorful the kingdom is at global frame G: full, then fading, then a wave of color from the castle
const seaState = (G: number): SeaState => ({
  base: ip(G, [FADE, FADE + 75], [1, 0.12], EASE),
  waveOn: G >= COLOR ? 1 : 0,
  waveR: ip(G, [COLOR, COLOR + 90], [0, 170], Easing.out(Easing.quad)),
});
const charLit = (G: number) => (G < COLOR ? ip(G, [FADE, FADE + 75], [1, 0.86]) : ip(G, [COLOR, COLOR + 30], [0.86, 1.05]));

// The pendant worn at Lumi's neck
const Worn: React.FC<{ L: { x: number; y: number; scale: number }; g: number; glow?: number }> = ({ L, g, glow = 0.4 }) => (
  <MoonPendant x={L.x + 4 * L.scale} y={L.y - 262 * L.scale} scale={0.62 * L.scale} g={g} glow={glow} />
);

// A shot in the Underwater Kingdom: 3D sea below, the 2D characters above
const SeaShot: React.FC<{ cam: Cam3; G: number; fade?: boolean; world?: React.ReactNode; children: React.ReactNode; over?: React.ReactNode; pearlHome?: number; fishHappy?: number; jellySparkle?: number }> = ({
  cam,
  G,
  fade = true,
  world,
  children,
  over,
  pearlHome = 0,
  fishHappy = 0,
  jellySparkle = 0,
}) => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill style={{ opacity: fade ? ip(f, [0, XF], [0, 1]) : 1, background: "#0a3a66" }}>
      <World3D cam={cam} bloom={0.8} threshold={0.72}>
        <UnderwaterKingdom t={G / 30} s={seaState(G)} camPos={cam.pos} pearlHome={pearlHome} fishHappy={fishHappy} jellySparkle={jellySparkle} />
        {world}
      </World3D>
      <CharLayer defs={<><Ep4Defs /><Ep5Defs lit={1} /><Ep6Defs lit={charLit(G)} /></>} filter="seaLit">
        {children}
      </CharLayer>
      {over}
    </AbsoluteFill>
  );
};

// ---------- Scene 1 (0-6s): the pendant glows, a sea map appears, a bubble carries the friends away ----------
const T_BOBO: V3 = [-1.15, 0, 1.2];
const T_LUMI: V3 = [0, 0, 1.6];
const T_DRACO: V3 = [1.1, 0, 1.3];

const Scene1: React.FC = () => {
  const f = useCurrentFrame();
  const g = f;
  const wide: Cam3 = { pos: [0.1, 1.5, 7.6], target: [0.1, 1.5, 0], fov: 44 };
  const cam = camAt(f, [
    [0, { pos: [0.15, 1.45, 8.2], target: [0.1, 1.55, 0], fov: 44 }],
    [84, wide],
    [85, { pos: [0.3, 1.25, 4.9], target: [0.3, 1.2, 1.6], fov: 42 }],
    [125, { pos: [0.3, 1.25, 4.6], target: [0.3, 1.2, 1.6], fov: 42 }],
    [126, { pos: [0.1, 1.6, 8.6], target: [0.1, 1.4, 0], fov: 44 }],
    [DIVE, { pos: [0.1, 1.7, 8.8], target: [0.1, 1.5, 0], fov: 44 }],
    [SPLASH + 15, { pos: [0.1, 2.2, 9.6], target: [0.1, -1.0, 0], fov: 46 }],
  ]);
  const B = place(cam, T_BOBO, BOBO_S);
  const L = place(cam, T_LUMI, LUMI_S);
  const D = place(cam, T_DRACO, DRACO_S);
  const closeUp = f >= 85 && f < 126;
  // Lumi holds the pendant up from the very first frame
  const armR = closeUp ? -115 : f < BUBBLE ? -132 : ip(f, [BUBBLE, BUBBLE + 10], [-132, -40], EASE);
  const hand = lumiHand(L.x, L.y, L.scale, armR);
  const pendant = { x: hand.x, y: hand.y + 30 * L.scale };
  const mapOn = ip(f, [15, 35], [0, 1], OUT) * ip(f, [BUBBLE - 6, BUBBLE + 8], [1, 0]);
  // the bubble wraps all three, lifts a little, then dives away
  const grow = ip(f, [BUBBLE, BUBBLE + 14], [0, 1], BACK(1.8));
  const lift = ip(f, [DIVE - 10, DIVE + 4], [0, -60], EASE) + ip(f, [DIVE + 4, SPLASH + 4], [0, 1500], Easing.in(Easing.cubic));
  const mid = { x: (B.x + D.x) / 2, y: Math.max(B.y, L.y, D.y) };
  const wrapped = f >= BUBBLE;
  const lookMap = { x: 0, y: -1 };
  const pulse = 0.5 + 0.5 * Math.sin(g / 4);
  return (
    <AbsoluteFill style={{ background: "#0a1238" }}>
      <World3D cam={cam}>
        <MoonKingdom t={g / 30} lightAt={() => 1.3} amb={1} camPos={cam.pos} />
        <SparkleBurst3D position={[0, 2.4, 1.2]} age={ip(f, [0, 34], [0, 1])} reach={3.2} count={140} seed={61} colors={["#9fe8ff", "#ffffff", "#5fc8ff", "#fff1a8"]} />
      </World3D>
      <CharLayer defs={<><Ep4Defs /><Ep5Defs lit={1.05} /><Ep6Defs /></>} filter="moonLit">
        {/* the glowing sea map in the air */}
        {mapOn > 0 && !closeUp && (
          <g opacity={mapOn}>
            <path d={`M ${pendant.x - 14} ${pendant.y} L ${540 - 250} ${700} L ${540 + 250} ${700} L ${pendant.x + 14} ${pendant.y} Z`} fill="#7fe8ff" opacity={0.14 + 0.05 * pulse} />
            <SeaMap x={540} y={500} s={0.95} g={g} reveal={ip(f, [15, 32], [0, 1], OUT)} />
          </g>
        )}
        <g transform={`translate(0 ${lift})`}>
          <BoboRider
            g={g}
            x={B.x}
            y={B.y}
            scale={B.scale}
            look={wrapped ? { x: 0.4, y: -0.3 } : lookMap}
            expr={wrapped ? "excited" : "surprised"}
            armL={wrapped ? 120 : 35}
            armR={wrapped ? -120 : -35}
            blink={blinkAt(g, 3)}
            riderLook={lookMap}
            riderArmsUp={wrapped}
          />
          <Lumi
            x={L.x}
            y={L.y}
            scale={L.scale}
            look={closeUp ? { x: 0.25, y: -0.2 } : wrapped ? { x: 0, y: -0.4 } : f > 70 ? { x: 0.6, y: -0.2 } : lookMap}
            expr={closeUp || wrapped ? "excited" : "surprised"}
            mouth={mouthAt("lumi", g)}
            armR={armR}
            armL={closeUp ? 60 : wrapped ? 70 : 22}
            headTilt={closeUp ? 4 : 0}
            blink={blinkAt(g, 1)}
          />
          <Draco
            x={D.x}
            y={D.y}
            scale={D.scale}
            g={g}
            mood={f > 22 ? "excited" : "surprised"}
            mouth={mouthAt("draco", g)}
            look={f > 80 && f < BUBBLE ? { x: -0.7, y: -0.2 } : lookMap}
            blink={blinkAt(g, 5)}
            wing={f > 22 ? 0.9 : 0.5}
            flap={f > 22 ? Math.sin(f / 3) * 14 : 0}
            armsUp={f > 22 ? 0.75 : 0.3}
            glow={0.45}
          />
          {!closeUp && f < BUBBLE + 8 && <MoonPendant x={pendant.x} y={pendant.y} scale={1.25 * L.scale} g={g} glow={1} />}
          {closeUp && <MoonPendant x={pendant.x} y={pendant.y} scale={1.25 * L.scale} g={g} glow={1} />}
          <circle cx={pendant.x} cy={pendant.y} r={(90 + 40 * pulse) * L.scale} fill="url(#pendantBlue)" opacity={f < BUBBLE + 8 ? 0.55 : 0} />
          <AirBubble x={mid.x} y={mid.y} scale={L.scale} g={g} grow={grow} fit={{ cy: -300, rx: (D.x - B.x) / 2 / L.scale + 230, ry: 400 }} />
        </g>
        {/* the opening flare from the pendant */}
        <circle cx={pendant.x} cy={pendant.y} r={ip(f, [0, 22], [120, 900], OUT)} fill="url(#pendantBlue)" opacity={ip(f, [0, 4, 30], [1, 1, 0])} />
        <SparkBurst f={f} at={0} x={pendant.x} y={pendant.y} reach={620} count={32} size={22} life={36} />
        <SparkBurst f={f} at={BUBBLE} x={mid.x} y={mid.y - 280 * L.scale} reach={480} count={22} size={16} life={30} />
      </CharLayer>
      {/* into the sea */}
      <AbsoluteFill style={{ background: "radial-gradient(circle at 50% 60%, #f4ffff 0%, #9fe8ff 45%, #2a8ac8 100%)", opacity: ip(f, [SPLASH - 6, SPLASH + 12], [0, 1], EASE) }} />
    </AbsoluteFill>
  );
};

// ---------- Scene 2 (6-14s): sinking down into the Underwater Kingdom ----------
const P_BOBO: V3 = [-1.32, 0, 1.2];
const P_LUMI: V3 = [0, 0, 1.6];
const P_DRACO: V3 = [1.28, 0, 1.3];
const S2_LAND = LAND - CUTS[1];
const DESCENT_FROM: V3 = [2.2, 24, 12];
const DESCENT_TO: V3 = [0, 0, 1.4];

const Scene2: React.FC = () => {
  const f = useCurrentFrame();
  const g = f + CUTS[1];
  const k = ip(f, [0, S2_LAND], [0, 1], Easing.inOut(Easing.sin));
  const sway = Math.sin(f / 14) * 0.5 * (1 - k);
  const center: V3 = [lerp(DESCENT_FROM[0], DESCENT_TO[0], k) + sway, lerp(DESCENT_FROM[1], DESCENT_TO[1], Easing.out(Easing.quad)(k)), lerp(DESCENT_FROM[2], DESCENT_TO[2], k)];
  // follow the bubble down from just behind and above it, then settle into the landing shot
  const settle = ip(k, [0.45, 1], [0, 1], EASE);
  const follow: Cam3 = {
    pos: lerp3([center[0] + 1.0, center[1] + 2.1, center[2] + 7.8], [2.6, 2.6, 9.6], settle),
    target: lerp3([center[0] - 0.1, center[1] - 2.4, center[2] - 9], [0, 1.9, -4], settle),
    fov: lerp(50, 46, settle),
  };
  const cam =
    f < S2_LAND
      ? follow
      : camAt(f, [
          [S2_LAND, { pos: [2.6, 2.6, 9.6], target: [0, 1.9, -4], fov: 46 }],
          [129, { pos: [2.2, 2.4, 9.2], target: [0, 1.9, -4], fov: 46 }],
          [130, { pos: [-1.3, 1.15, 4.7], target: [-1.3, 0.95, 1.2], fov: 42 }],
          [189, { pos: [-1.3, 1.15, 4.4], target: [-1.3, 0.95, 1.2], fov: 42 }],
          [190, { pos: [11, 3.5, -6], target: [0, 10, -34], fov: 50 }],
          [252, { pos: [7, 4.5, -10], target: [0, 10.5, -34], fov: 50 }],
        ]);
  const landed = f >= S2_LAND;
  const split = ip(f, [S2_LAND + 6, S2_LAND + 20], [0, 1], BACK(1.6));
  const offs = (p: V3): V3 => [center[0] + (p[0] - DESCENT_TO[0]), center[1], center[2] + (p[2] - DESCENT_TO[2])];
  const bob = landed ? 0 : Math.sin(f / 9) * 0.06;
  const B = place(cam, up(landed ? P_BOBO : offs(P_BOBO), bob), BOBO_S);
  const L = place(cam, up(landed ? P_LUMI : offs(P_LUMI), bob), LUMI_S);
  const D = place(cam, up(landed ? P_DRACO : offs(P_DRACO), bob), DRACO_S);
  const showFriends = f < 190;
  const amazed = f >= S2_LAND + 20;
  const talking = f >= 130 && f < 190;
  const groupMid = place(cam, up(center, bob), LUMI_S);
  const squash = ip(f, [S2_LAND - 2, S2_LAND + 3, S2_LAND + 8], [1, 0.9, 1]);
  return (
    <SeaShot cam={cam} G={g} fade={false} over={<AbsoluteFill style={{ background: "radial-gradient(circle at 50% 50%, #f4ffff 0%, #9fe8ff 45%, #2a8ac8 100%)", opacity: ip(f, [0, 20], [1, 0], EASE) }} />}>
      {showFriends && (
        <>
          <BoboRider
            g={g}
            x={B.x}
            y={B.y}
            scale={B.scale}
            look={amazed ? { x: 0.3, y: -1 } : { x: 0.5, y: 0.6 }}
            expr={talking ? "excited" : amazed ? "surprised" : "happy"}
            mouth={mouthAt("bobo", g)}
            armL={talking ? 140 : landed ? 40 : 100}
            armR={talking ? -140 : landed ? -40 : -100}
            blink={blinkAt(g, 3)}
            riderLook={{ x: 0.3, y: -1 }}
            riderArmsUp={talking}
          />
          <Lumi
            x={L.x}
            y={L.y}
            scale={L.scale}
            look={amazed ? { x: 0.15, y: -1 } : { x: 0.3, y: 0.5 }}
            expr={amazed ? "surprised" : "excited"}
            armL={landed ? 30 : 90}
            armR={landed ? -30 : -90}
            headTilt={amazed ? -4 : 0}
            blink={blinkAt(g, 1)}
          />
          <Worn L={L} g={g} />
          <Draco
            x={D.x}
            y={D.y}
            scale={D.scale}
            g={g}
            mood={amazed ? "surprised" : "joy"}
            look={amazed ? { x: -0.2, y: -1 } : { x: -0.3, y: 0.5 }}
            blink={blinkAt(g, 5)}
            wing={landed ? 0.6 : 1}
            flap={landed ? Math.sin(f / 5) * 6 : Math.sin(f * 0.5) * 18}
            armsUp={amazed ? 0.4 : 0.7}
            glow={0.4}
          />
          {/* one big bubble on the way down, then one for each friend */}
          {!landed || f < S2_LAND + 8 ? (
            <AirBubble x={groupMid.x} y={groupMid.y} scale={groupMid.scale} g={g} fit={{ cy: -300 * squash, rx: 640 / squash, ry: 400 * squash }} />
          ) : (
            <>
              <AirBubble x={B.x} y={B.y} scale={B.scale} g={g} fit={BUBBLE_FIT.bobo} ph={1} grow={0.6 + 0.4 * split} />
              <AirBubble x={L.x} y={L.y} scale={L.scale} g={g} fit={BUBBLE_FIT.lumi} ph={2} grow={0.6 + 0.4 * split} />
              <AirBubble x={D.x} y={D.y} scale={D.scale} g={g} fit={BUBBLE_FIT.draco} ph={3} grow={0.6 + 0.4 * split} />
            </>
          )}
          <BubblePop x={groupMid.x} y={groupMid.y - 300 * groupMid.scale} r={640 * groupMid.scale} age={ip(f, [S2_LAND + 8, S2_LAND + 26], [0, 1])} />
          <SparkBurst f={f} at={S2_LAND + 8} x={groupMid.x} y={groupMid.y - 300 * groupMid.scale} reach={420} count={22} size={16} life={30} />
        </>
      )}
    </SeaShot>
  );
};

// ---------- Scene 3 (14-24s): meeting Coralie; the kingdom loses its colors ----------
const C_AT: V3 = [2.45, 0.32, 1.85];
const C_FROM: V3 = [4.5, 2.6, -2.5];
const S3_IN = CORALIE_IN - CUTS[2];
const S3_FADE = FADE - CUTS[2];

const Scene3: React.FC = () => {
  const f = useCurrentFrame();
  const g = f + CUTS[2];
  const cam = camAt(f, [
    [0, { pos: [0.7, 1.6, 8.8], target: [0.7, 1.3, 0], fov: 44 }],
    [27, { pos: [0.7, 1.55, 8.4], target: [0.7, 1.3, 0], fov: 44 }],
    [28, { pos: [2.45, 1.35, 5.3], target: [2.45, 1.12, 1.8], fov: 40 }],
    [99, { pos: [2.45, 1.35, 4.9], target: [2.45, 1.12, 1.8], fov: 40 }],
    [100, { pos: [0.05, 1.18, 4.4], target: [0.02, 1.02, 1.6], fov: 40 }],
    [129, { pos: [0.05, 1.18, 4.2], target: [0.02, 1.02, 1.6], fov: 40 }],
    [130, { pos: [1.9, 1.3, 6.7], target: [1.88, 1.08, 1.5], fov: 42 }],
    [S3_FADE - 1, { pos: [1.9, 1.3, 6.3], target: [1.88, 1.08, 1.5], fov: 42 }],
    [S3_FADE, { pos: [-4, 2.6, 3], target: [0, 8.5, -34], fov: 48 }],
    [300 + XF, { pos: [-2.6, 3.4, 0.5], target: [0, 9.5, -34], fov: 48 }],
  ]);
  const arrive = ip(f, [S3_IN, S3_IN + 30], [0, 1], OUT);
  const arc = Math.sin(arrive * Math.PI) * 0.6;
  const cPos = up(lerp3(C_FROM, C_AT, arrive), arc + Math.sin(g / 12) * 0.05);
  const B = place(cam, P_BOBO, BOBO_S);
  const L = place(cam, P_LUMI, LUMI_S);
  const D = place(cam, P_DRACO, DRACO_S);
  const C = place(cam, cPos, CORALIE_S);
  const seen = f >= S3_IN + 8;
  const worried = f >= 62;
  const look = (who: { x: number }) => ({ x: clamp1((C.x - who.x) / 300), y: -0.15 });
  const wideCastle = f >= S3_FADE;
  const cMood: CoralieMood = f < 62 ? "happy" : "worried";
  return (
    <SeaShot cam={cam} G={g}>
      {!wideCastle && (
        <>
          <BoboRider
            g={g}
            x={B.x}
            y={B.y}
            scale={B.scale}
            look={seen ? look(B) : { x: 0.3, y: -1 }}
            expr={worried ? "neutral" : seen ? "happy" : "surprised"}
            armL={20}
            armR={-20}
            blink={blinkAt(g, 3)}
            riderLook={seen ? look(B) : { x: 0, y: -1 }}
          />
          <Lumi
            x={L.x}
            y={L.y}
            scale={L.scale}
            look={seen ? look(L) : { x: 0.3, y: -0.6 }}
            expr={f > 100 && f < 130 ? "surprised" : worried ? "neutral" : seen ? "happy" : "surprised"}
            mouth={mouthAt("lumi", g)}
            armL={f > 100 && f < 130 ? 40 : 20}
            armR={f > 100 && f < 130 ? -40 : -20}
            headTilt={f > 100 && f < 130 ? 6 : 0}
            blink={blinkAt(g, 1)}
          />
          <Worn L={L} g={g} />
          <Draco x={D.x} y={D.y} scale={D.scale} g={g} mood={worried ? "sad" : seen ? "happy" : "surprised"} look={seen ? look(D) : { x: 0, y: -1 }} blink={blinkAt(g, 5)} wing={0.45} glow={0.35} />
          <AirBubble x={B.x} y={B.y} scale={B.scale} g={g} fit={BUBBLE_FIT.bobo} ph={1} />
          <AirBubble x={L.x} y={L.y} scale={L.scale} g={g} fit={BUBBLE_FIT.lumi} ph={2} />
          <AirBubble x={D.x} y={D.y} scale={D.scale} g={g} fit={BUBBLE_FIT.draco} ph={3} />
          {f >= S3_IN && (
            <>
              <Coralie
                x={C.x}
                y={C.y}
                scale={C.scale}
                g={g}
                appear={ip(f, [S3_IN, S3_IN + 14], [0, 1], OUT)}
                tilt={ip(f, [S3_IN, S3_IN + 30], [-25, 0], OUT)}
                swim={ip(f, [S3_IN, S3_IN + 30, S3_IN + 50], [1.5, 1.2, 0.5])}
                mood={mouthAt("coralie", g) > 0.06 ? cMood : worried ? "worried" : "happy"}
                mouth={mouthAt("coralie", g)}
                look={{ x: -0.9, y: 0.05 }}
                blink={blinkAt(g, 7)}
                armL={f < 62 ? 95 + Math.sin(f / 4) * 25 : f > 150 && f < 200 ? 60 : 15}
                armR={f < 62 ? -30 : f > 200 ? -25 : -15}
                headTilt={worried ? -5 : 4}
              />
              <SparkBurst f={f} at={S3_IN + 6} x={C.x} y={C.y - 300 * C.scale} reach={300} count={20} size={14} life={28} />
            </>
          )}
        </>
      )}
      {/* a trail of bubbles as she swims in */}
      {!wideCastle &&
        f >= S3_IN &&
        f < S3_IN + 50 &&
        Array.from({ length: 14 }, (_, k) => {
          const tt = f - (k + 1) * 2;
          if (tt < S3_IN) return null;
          const a = ip(tt, [S3_IN, S3_IN + 30], [0, 1], OUT);
          const p = screen(cam, up(lerp3(C_FROM, C_AT, a), Math.sin(a * Math.PI) * 0.6 + 0.3));
          return <circle key={k} cx={p.x + Math.sin(k * 2.1) * 24} cy={p.y - k * 4} r={(14 - k * 0.6) * C.scale * 1.4} fill="none" stroke="#eaffff" strokeWidth={3} opacity={1 - k / 14} />;
        })}
    </SeaShot>
  );
};

// ---------- Scene 4 (24-32s): the sea garden; the Ocean Pearl in a giant bubble ----------
const PEARL0: V3 = [PEARL_SPOT[0], 0, PEARL_SPOT[2]];
const GFWD: [number, number] = [PEARL_SPOT[0], PEARL_SPOT[2]]; // looking from the plaza toward the pearl
const S4_LUMI = spot(PEARL0, GFWD, -1.05, 1.55);
const S4_BOBO = spot(PEARL0, GFWD, -2.05, 1.0);
const S4_DRACO = spot(PEARL0, GFWD, 1.15, 1.35);
const S4_CORALIE = spot(PEARL0, GFWD, 2.1, 1.05, 0.3);
const BIG_R = 0.92;
const S4 = {
  glimmer: BIG_BUBBLE - CUTS[3],
  flap: DRACO_FLAP - CUTS[3],
  push: BOBO_PUSH - CUTS[3],
  glint: GLINT - CUTS[3],
};
const RIGHT: V3 = (() => {
  const l = Math.hypot(GFWD[0], GFWD[1]);
  return [-GFWD[1] / l, 0, GFWD[0] / l];
})();
const pearlYaw = Math.atan2(-GFWD[0], -GFWD[1]);

const Scene4: React.FC = () => {
  const f = useCurrentFrame();
  const g = f + CUTS[3];
  const t = g / 30;
  const towardCam = (d: number, dx = 0, h = 0) => spot(PEARL_SPOT, GFWD, dx, d, h);
  const cam = camAt(f, [
    [0, { pos: towardCam(11.5, 2.8, 1.9), target: spot(PEARL0, GFWD, -0.2, 0, 1.1), fov: 46 }],
    [40, { pos: towardCam(8.8, 0, 0.5), target: spot(PEARL0, GFWD, -0.2, 0, 1.0), fov: 44 }],
    [65, { pos: towardCam(8.4, 0, 0.45), target: spot(PEARL0, GFWD, -0.2, 0, 1.0), fov: 44 }],
    [66, { pos: towardCam(4.6, 0.75, -0.25), target: lerp3(PEARL_SPOT, up(S4_DRACO, 0.8), 0.5), fov: 42 }],
    [104, { pos: towardCam(4.3, 0.75, -0.25), target: lerp3(PEARL_SPOT, up(S4_DRACO, 0.8), 0.5), fov: 42 }],
    [105, { pos: towardCam(5.2, -1.0, -0.3), target: lerp3(PEARL_SPOT, up(S4_BOBO, 0.6), 0.32), fov: 42 }],
    [146, { pos: towardCam(4.9, -1.0, -0.3), target: lerp3(PEARL_SPOT, up(S4_BOBO, 0.6), 0.32), fov: 42 }],
    [147, { pos: towardCam(2.7, 0, 0.0), target: PEARL_SPOT, fov: 38 }],
    [164, { pos: towardCam(2.4, 0, 0.0), target: PEARL_SPOT, fov: 38 }],
    [165, { pos: towardCam(5.5, -1.05, -0.2), target: lerp3(PEARL_SPOT, up(S4_LUMI, 0.75), 0.62), fov: 42 }],
    [240 + XF, { pos: towardCam(5.2, -1.05, -0.2), target: lerp3(PEARL_SPOT, up(S4_LUMI, 0.75), 0.62), fov: 42 }],
  ]);
  const walkIn = ip(f, [0, 38], [1, 0], EASE);
  const fromPath = (p: V3, k: number) => lerp3(p, spot(p, GFWD, 0.5, 3.2), k);
  // Draco flutters up inside his air bubble and bumps the giant bubble, which bounces him back
  const flyUp = ip(f, [S4.flap, S4.flap + 16], [0, 1], OUT) * ip(f, [S4.flap + 22, S4.flap + 40], [1, 0], Easing.inOut(Easing.quad));
  const dracoP = up(lerp3(S4_DRACO, spot(PEARL0, GFWD, 0.85, 0.5), flyUp * 0.75), flyUp * 0.75);
  const dTap = ip(f, [S4.flap + 16, S4.flap + 21, S4.flap + 36], [0, 0.55, 0]);
  // Bobo walks up and pushes; the bubble pushes back
  const bWalk = ip(f, [S4.push - 18, S4.push], [0, 1], EASE) * ip(f, [S4.push + 30, S4.push + 40], [1, 0.3], Easing.out(Easing.quad));
  const boboP = lerp3(fromPath(S4_BOBO, walkIn), spot(PEARL0, GFWD, -1.1, 0.35), bWalk);
  const bPush = ip(f, [S4.push, S4.push + 12, S4.push + 16, S4.push + 28], [0, 0.6, 0.65, 0]);
  const push: V3 = [RIGHT[0] * (dTap - bPush), 0, RIGHT[2] * (dTap - bPush)];
  const wobble = 0.15 + dTap * 1.2 + bPush * 1.2;
  const symbol = ip(f, [S4.glint, S4.glint + 8, S4.glint + 40], [0.15, 1, 0.8]);
  const B = place(cam, boboP, BOBO_S);
  // Lumi steps aside to the front left while Bobo has his turn, and is back for her line
  const aside = ip(f, [S4.push - 34, S4.push - 16], [0, 1], EASE) * ip(f, [S4.glint, S4.glint + 12], [1, 0], EASE);
  const L = place(cam, lerp3(fromPath(S4_LUMI, walkIn), spot(PEARL0, GFWD, -2.7, 3.0), aside), LUMI_S);
  const D = place(cam, f < 40 ? fromPath(S4_DRACO, walkIn) : dracoP, DRACO_S);
  const C = place(cam, up(fromPath(S4_CORALIE, walkIn), Math.sin(g / 12) * 0.05), CORALIE_S);
  const Pp = screen(cam, PEARL_SPOT);
  const lookAt = (who: { x: number; y: number }) => ({ x: clamp1((Pp.x - who.x) / 260), y: clamp1((Pp.y - (who.y - 300)) / 260) });
  const walking = f < 38;
  const showing = f >= 172;
  const lumiArm = showing ? ip(f, [172, 182], [-20, -70], EASE) : -20;
  const hand = lumiHand(L.x, L.y, L.scale, lumiArm);
  return (
    <SeaShot
      cam={cam}
      G={g}
      world={
        <>
          <OceanPearl position={PEARL_SPOT} t={t} glow={0.25 + symbol * 0.3} symbol={symbol} scale={0.62} faceYaw={pearlYaw} />
          <MagicBubble position={PEARL_SPOT} t={t} radius={BIG_R} wobble={wobble} push={push} />
          <SparkleBurst3D position={PEARL_SPOT} age={ip(f, [S4.glimmer, S4.glimmer + 34], [0, 1])} reach={1.8} count={90} seed={14} size={6} colors={["#bff4ff", "#ffffff", "#ffd8f0"]} />
        </>
      }
    >
      <BoboRider
        g={g}
        x={B.x}
        y={B.y}
        scale={B.scale}
        look={lookAt(B)}
        expr={bPush > 0.1 ? "effort" : f > S4.push + 26 && f < S4.push + 56 ? "surprised" : "happy"}
        walk={walking || (f > S4.push - 18 && f < S4.push) ? f * 0.45 : null}
        armL={bPush > 0 ? 95 : 20}
        armR={bPush > 0 ? -95 : -20}
        squash={ip(f, [S4.push + 28, S4.push + 32, S4.push + 42], [1, 0.86, 1])}
        lean={-bPush * 10 + ip(f, [S4.push + 28, S4.push + 34, S4.push + 46], [0, 8, 0])}
        blink={blinkAt(g, 3)}
        riderLook={lookAt(B)}
      />
      <Lumi
        x={L.x}
        y={L.y}
        scale={L.scale}
        look={showing ? { x: 0.5, y: -0.2 } : lookAt(L)}
        expr={f >= S4.glint ? "excited" : f > S4.glimmer ? "surprised" : "happy"}
        mouth={mouthAt("lumi", g)}
        walk={walking || (aside > 0.02 && aside < 0.98) ? f * 0.4 : null}
        armR={lumiArm}
        armL={20}
        headTilt={showing ? 5 : 0}
        blink={blinkAt(g, 1)}
      />
      {showing ? <MoonPendant x={hand.x} y={hand.y + 26 * L.scale} scale={1.05 * L.scale} g={g} glow={0.6 + 0.3 * Math.sin(g / 4)} /> : <Worn L={L} g={g} />}
      <Draco
        x={D.x}
        y={D.y}
        scale={D.scale}
        g={g}
        mood={flyUp > 0.05 ? "effort" : f > S4.flap + 36 && f < S4.flap + 66 ? "surprised" : "happy"}
        look={lookAt(D)}
        blink={blinkAt(g, 5)}
        wing={flyUp > 0 ? 1 : 0.45}
        flap={flyUp > 0 ? Math.sin(f * 0.9) * 26 : 0}
        armsUp={flyUp > 0 ? 0.9 : 0.15}
        step={walking ? f * 0.55 : null}
        squash={ip(f, [S4.flap + 40, S4.flap + 43, S4.flap + 52], [1, 0.86, 1])}
        glow={0.4}
      />
      <Coralie x={C.x} y={C.y} scale={C.scale} g={g} mood="worried" look={lookAt(C)} blink={blinkAt(g, 7)} armL={15} armR={-15} swim={walking ? 1.2 : 0.5} tilt={walking ? -8 : 0} />
      <AirBubble x={B.x} y={B.y} scale={B.scale} g={g} fit={BUBBLE_FIT.bobo} ph={1} />
      <AirBubble x={L.x} y={L.y} scale={L.scale} g={g} fit={BUBBLE_FIT.lumi} ph={2} />
      <AirBubble x={D.x} y={D.y} scale={D.scale} g={g} fit={BUBBLE_FIT.draco} ph={3} />
      {f >= S4.glint && f < S4.glint + 30 && <Sparkle x={Pp.x} y={Pp.y} size={ip(f, [S4.glint, S4.glint + 8, S4.glint + 30], [10, 80, 0])} color="#fff1a8" rotate={f * 4} />}
    </SeaShot>
  );
};

// ---------- Scene 5 (32-42s): pendant and pearl; the bubble vanishes; the colors come back ----------
const S5 = { raise: RAISE - CUTS[4], beam: BEAM - CUTS[4], pop: POP - CUTS[4], rise: RISE - CUTS[4], home: HOME - CUTS[4], color: COLOR - CUTS[4], group: 222 };
const CFWD: [number, number] = [SOCKET[0] - PEARL_SPOT[0], SOCKET[2] - PEARL_SPOT[2]]; // facing the castle
const GROUP_BASE: V3 = spot(PEARL0, CFWD, 2.6, -0.6); // on the open side of the pearl, away from the cave
const G_LUMI = spot(GROUP_BASE, CFWD, -0.15, 0.15);
const G_BOBO = spot(GROUP_BASE, CFWD, -1.05, -0.15);
const G_DRACO = spot(GROUP_BASE, CFWD, 1.62, -0.05);
const G_CORALIE = spot(GROUP_BASE, CFWD, 0.74, 0.12, 0.3);
const SOCKET_AT: V3 = up(SOCKET, 0.55);

const pearlPath = (f: number): V3 => {
  const rise = ip(f, [S5.rise, S5.rise + 16], [0, 1.4], OUT);
  const k = ip(f, [S5.rise + 14, S5.home], [0, 1], Easing.inOut(Easing.sin));
  const a = up(PEARL_SPOT, rise);
  const ctrl: V3 = [-12, 15, -22];
  return lerp3(lerp3(a, ctrl, k), lerp3(ctrl, SOCKET_AT, k), k);
};

const Scene5: React.FC = () => {
  const f = useCurrentFrame();
  const g = f + CUTS[4];
  const t = g / 30;
  const pearl = pearlPath(f);
  const towardCam = (d: number, dx = 0, h = 0) => spot(PEARL_SPOT, GFWD, dx, d, h);
  const follow = ip(f, [S5.rise, S5.home], [0, 1], EASE);
  let cam: Cam3;
  if (f < S5.rise) {
    cam = camAt(f, [
      [0, { pos: towardCam(5.2, -1.05, -0.2), target: lerp3(PEARL_SPOT, up(S4_LUMI, 0.75), 0.62), fov: 42 }],
      [S5.pop, { pos: towardCam(4.8, -1.05, -0.15), target: lerp3(PEARL_SPOT, up(S4_LUMI, 0.75), 0.62), fov: 42 }],
    ]);
    const shake = f > S5.pop && f < S5.pop + 10 ? (Math.sin(f * 3) * 0.03 * (S5.pop + 10 - f)) / 10 : 0;
    cam = { ...cam, pos: [cam.pos[0] + shake, cam.pos[1] + shake, cam.pos[2]] };
  } else if (f < S5.color) {
    const from = towardCam(4.8, -1.05, -0.15);
    cam = { pos: lerp3(from, [-24, 9, 8], follow), target: lerp3(pearl, lerp3(pearl, SOCKET, 0.5), follow), fov: lerp(42, 52, follow) };
  } else if (f < S5.group) {
    const k = ip(f, [S5.color, S5.group], [0, 1]);
    cam = { pos: lerp3([-24, 9, 8], [-15, 6, 16], k), target: lerp3(SOCKET, [0, 9, -34], k), fov: 52 };
  } else {
    cam = camAt(f, [
      [S5.group, { pos: spot(GROUP_BASE, CFWD, 0.26, 8.6, 1.1), target: spot(GROUP_BASE, CFWD, 0.26, -3, 2.3), fov: 46 }],
      [300 + XF, { pos: spot(GROUP_BASE, CFWD, 0.26, 8.1, 1.05), target: spot(GROUP_BASE, CFWD, 0.26, -3, 2.3), fov: 46 }],
    ]);
  }
  const group = f >= S5.group;
  const raise = ip(f, [S5.raise, S5.raise + 14], [0, 1], BACK(1.5));
  const armR = lerp(-70, -150, raise);
  const L = place(cam, group ? G_LUMI : S4_LUMI, LUMI_S);
  const B = place(cam, group ? G_BOBO : S4_BOBO, BOBO_S);
  const D = place(cam, group ? up(G_DRACO, Math.abs(Math.sin(f / 7)) * 0.25) : S4_DRACO, DRACO_S);
  const C = place(cam, up(group ? G_CORALIE : S4_CORALIE, Math.sin(g / 12) * 0.05 + (group ? Math.abs(Math.sin(f / 9)) * 0.12 : 0)), CORALIE_S);
  const hand = lumiHand(L.x, L.y, L.scale, armR);
  const pend = { x: hand.x, y: hand.y + 26 * L.scale };
  const Pp = screen(cam, PEARL_SPOT);
  const beam = ip(f, [S5.beam, S5.beam + 16], [0, 1], OUT) * ip(f, [S5.pop, S5.pop + 6], [1, 0]);
  const popped = f >= S5.pop;
  const lit = f >= S5.color;
  const lookAt = (who: { x: number; y: number }) => (popped ? { x: 0.2, y: -1 } : { x: clamp1((Pp.x - who.x) / 260), y: -0.6 });
  const pearlGlow = popped ? ip(f, [S5.home, S5.color + 10], [0.6, 1.8]) : 0.3 + beam * 0.7;
  const So = screen(cam, SOCKET_AT);
  const s = seaState(g);
  const cMouth = mouthAt("coralie", g);
  return (
    <SeaShot
      cam={cam}
      G={g}
      pearlHome={ip(f, [S5.home, S5.color], [0, 1])}
      fishHappy={lit ? ip(f, [S5.color, S5.color + 30], [0, 1]) : 0}
      jellySparkle={lit ? ip(f, [S5.color, S5.color + 20, 300], [0, 1, 0.4]) : 0}
      world={
        <>
          <OceanPearl position={pearl} t={t} glow={pearlGlow} symbol={popped ? 1 : 0.8 + beam * 0.2} scale={popped ? lerp(0.62, 1.5, follow) : 0.62} faceYaw={pearlYaw} />
          <MagicBubble position={PEARL_SPOT} t={t} radius={BIG_R} wobble={0.15 + beam * 0.7} alpha={ip(f, [S5.pop, S5.pop + 5], [1, 0])} scale={ip(f, [S5.pop - 4, S5.pop + 5], [1, 1.35])} />
          <SparkleBurst3D position={PEARL_SPOT} age={ip(f, [S5.pop, S5.pop + 30], [0, 1])} reach={2.4} count={150} seed={21} size={7} colors={["#bff4ff", "#ffffff", "#ffe39a", "#9fe8ff"]} />
          <SparkleBurst3D position={SOCKET_AT} age={ip(f, [S5.color, S5.color + 50], [0, 1])} reach={24} count={260} seed={23} size={26} gravity={2} colors={["#ff9fd0", "#ffe39a", "#7fe8ff", "#b8ffb0", "#c8a8ff"]} />
          <LightRing position={SOCKET_AT} age={ip(f, [S5.color, S5.color + 60], [0, 1])} radius={60} color="#bff4ff" />
          <LightRing position={[SOCKET[0], 1.0, SOCKET[2]]} age={ip(f, [S5.color + 8, S5.color + 80], [0, 1])} radius={110} color="#ffd8f0" />
          <LightRing position={SOCKET_AT} age={ip(f, [S5.color + 4, S5.color + 54], [0, 1])} radius={40} flat={false} color="#ffffff" />
        </>
      }
      over={lit && f < S5.color + 20 ? <AbsoluteFill style={{ background: "#eafcff", opacity: ip(f, [S5.color, S5.color + 3, S5.color + 20], [0, 0.55, 0]) }} /> : undefined}
    >
      {(f < S5.rise + 20 || group) && (
        <>
          <BoboRider
            g={g}
            x={B.x}
            y={B.y}
            scale={B.scale}
            look={group ? { x: 0.3, y: -0.3 } : lookAt(B)}
            expr={group ? "excited" : popped ? "surprised" : "happy"}
            armL={group ? 140 : 25}
            armR={group ? -140 : -25}
            blink={blinkAt(g, 3)}
            riderLook={lookAt(B)}
            riderArmsUp={group}
          />
          <Lumi
            x={L.x}
            y={L.y}
            scale={L.scale}
            look={group ? { x: 0.5, y: -0.1 } : lookAt(L)}
            expr={group ? "excited" : popped ? "surprised" : "excited"}
            armR={group ? -140 : armR}
            armL={group ? 140 : raise > 0.5 ? 40 : 20}
            headTilt={group ? 3 : -4 * raise}
            blink={blinkAt(g, 1)}
          />
          {!group && (
            <>
              <circle cx={pend.x} cy={pend.y} r={(80 + beam * 110) * L.scale} fill="url(#pendantBlue)" opacity={raise * (0.6 + 0.3 * Math.sin(g / 3))} />
              <circle cx={pend.x} cy={pend.y} r={(50 + beam * 70) * L.scale} fill="url(#beamCore)" opacity={raise * 0.7} />
              <SeaBeam from={pend} to={Pp} on={beam} g={g} />
              <MoonPendant x={pend.x} y={pend.y} scale={1.1 * L.scale} g={g} glow={0.6 + raise * 0.4} />
            </>
          )}
          {group && <Worn L={L} g={g} glow={1} />}
          <Draco
            x={D.x}
            y={D.y}
            scale={D.scale}
            g={g}
            mood={group ? "joy" : popped ? "surprised" : "excited"}
            look={group ? { x: -0.6, y: -0.2 } : lookAt(D)}
            blink={blinkAt(g, 5)}
            wing={group ? 1 : 0.5}
            flap={group ? Math.sin(f * 0.9) * 26 : 0}
            armsUp={group ? 0.9 : 0.2}
            glow={0.5}
          />
          <Coralie
            x={C.x}
            y={C.y}
            scale={C.scale}
            g={g}
            mood={group ? (cMouth > 0.06 ? "excited" : "joy") : popped ? "surprised" : "worried"}
            mouth={cMouth}
            look={group ? { x: -0.8, y: -0.05 } : lookAt(C)}
            blink={blinkAt(g, 7)}
            armL={group ? 140 : 15}
            armR={group ? -140 : -15}
            swim={group ? 1.1 : 0.5}
          />
          <AirBubble x={B.x} y={B.y} scale={B.scale} g={g} fit={BUBBLE_FIT.bobo} ph={1} />
          <AirBubble x={L.x} y={L.y} scale={L.scale} g={g} fit={BUBBLE_FIT.lumi} ph={2} />
          <AirBubble x={D.x} y={D.y} scale={D.scale} g={g} fit={BUBBLE_FIT.draco} ph={3} />
          {!group && <BubblePop x={Pp.x} y={Pp.y} r={BIG_R * 420 * L.scale} age={ip(f, [S5.pop, S5.pop + 18], [0, 1])} />}
        </>
      )}
      {/* sparkles trailing behind the pearl as it flies home */}
      {f >= S5.rise &&
        f < S5.home + 4 &&
        Array.from({ length: 22 }, (_, k) => {
          const tt = f - (k + 1) * 1.2;
          if (tt < S5.rise) return null;
          const p = screen(cam, pearlPath(tt));
          return <Sparkle key={k} x={p.x + Math.sin(k * 2.1) * 12} y={p.y + Math.cos(k * 1.7) * 12} size={26 * (1 - k / 22)} opacity={1 - k / 22} color={k % 2 ? "#bff4ff" : "#ffd8f0"} rotate={k * 30 + f * 4} />;
        })}
      {f >= S5.rise && f < S5.color + 10 && <circle cx={So.x} cy={So.y} r={ip(f, [S5.home, S5.color + 10], [0, 520])} fill="url(#pendantBlue)" opacity={ip(f, [S5.home, S5.color, S5.color + 10], [0, 0.85, 0]) * colorAt(s, SOCKET) + 0.0001} />}
      {group && <SparkBurst f={f} at={S5.group} x={540} y={700} reach={520} count={26} size={18} life={36} rainbow />}
    </SeaShot>
  );
};

// ---------- Scene 6 (42-50s): the seashell shows a snowy mountain ----------
const S6 = { shell: SHELL - CUTS[5], give: 40, project: PROJECT - CUTS[5], end: END - CUTS[5] };
const HOLO: V3 = spot(GROUP_BASE, CFWD, 0.3, -1.8, 2.3);

const Scene6: React.FC = () => {
  const f = useCurrentFrame();
  const g = f + CUTS[5];
  const t = g / 30;
  const wideA: Cam3 = { pos: spot(GROUP_BASE, CFWD, 0.4, 5.4, 0.55), target: spot(GROUP_BASE, CFWD, 0.4, -2, 1.15), fov: 42 };
  const cam = camAt(f, [
    [0, wideA],
    [S6.project - 1, { ...wideA, pos: spot(GROUP_BASE, CFWD, 0.4, 5.0, 0.55) }],
    [S6.project, { pos: spot(G_LUMI, CFWD, 0.05, 3.4, 0.95), target: spot(G_LUMI, CFWD, 0.05, 0, 1.05), fov: 40 }],
    [S6.project + 34, { pos: spot(G_LUMI, CFWD, 0.05, 3.2, 0.95), target: spot(G_LUMI, CFWD, 0.05, 0, 1.05), fov: 40 }],
    [S6.project + 35, { pos: spot(G_DRACO, CFWD, 0.05, 3.1, 0.75), target: spot(G_DRACO, CFWD, 0.05, 0, 0.8), fov: 40 }],
    [S6.project + 62, { pos: spot(G_DRACO, CFWD, 0.05, 2.9, 0.75), target: spot(G_DRACO, CFWD, 0.05, 0, 0.8), fov: 40 }],
    [S6.project + 63, { pos: spot(GROUP_BASE, CFWD, 0.3, 7.4, 1.05), target: spot(GROUP_BASE, CFWD, 0.3, -2, 2.1), fov: 46 }],
    [240, { pos: spot(GROUP_BASE, CFWD, 0.3, 8.3, 1.2), target: spot(GROUP_BASE, CFWD, 0.3, -2, 2.25), fov: 46 }],
  ]);
  const toLumi = ip(f, [S6.shell, S6.shell + 24], [0, 1], EASE) * ip(f, [S6.give + 16, S6.give + 46], [1, 0.25], EASE);
  const cPos = up(lerp3(G_CORALIE, spot(GROUP_BASE, CFWD, 0.42, 0.3, 0.3), toLumi), Math.sin(g / 12) * 0.05);
  const L = place(cam, G_LUMI, LUMI_S);
  const B = place(cam, G_BOBO, BOBO_S);
  const D = place(cam, up(G_DRACO, f > S6.project + 35 && f < S6.project + 63 ? Math.abs(Math.sin(f / 6)) * 0.12 : 0), DRACO_S);
  const C = place(cam, cPos, CORALIE_S);
  const lumiArm = ip(f, [S6.give - 10, S6.give + 2], [-20, -112], EASE);
  const cArm = f < S6.give + 4 ? ip(f, [S6.shell, S6.shell + 14], [15, 72]) : ip(f, [S6.give + 4, S6.give + 18], [72, 15]);
  const ch = coralieHand(C.x, C.y, C.scale, cArm, -1);
  const lh = lumiHand(L.x, L.y, L.scale, lumiArm);
  const give = ip(f, [S6.give - 4, S6.give + 6], [0, 1], EASE);
  const shell = { x: lerp(ch.x, lh.x, give), y: lerp(ch.y, lh.y, give) + 22 * L.scale };
  const project = ip(f, [S6.project, S6.project + 26], [0, 1], OUT);
  const projecting = f >= S6.project;
  const Hs = screen(cam, up(HOLO, 0.45));
  const lookHolo = (who: { x: number }) => ({ x: clamp1((Hs.x - who.x) / 300), y: -1 });
  const cMouth = mouthAt("coralie", g);
  return (
    <SeaShot
      cam={cam}
      G={g}
      fishHappy={1}
      world={
        <>
          <SnowHologram position={HOLO} t={t} on={project} scale={0.72} />
          <SparkleBurst3D position={up(HOLO, 0.8)} age={ip(f, [S6.project, S6.project + 34], [0, 1])} reach={2.4} count={120} seed={31} colors={["#ffffff", "#cfeaff", "#a8d8ff", "#e8f4ff"]} />
        </>
      }
      over={<EndCard at={S6.end} top={250} />}
    >
      {projecting && (
        <path
          d={`M ${shell.x - 10} ${shell.y} L ${Hs.x - 170 * project} ${Hs.y + 130} L ${Hs.x + 170 * project} ${Hs.y + 130} L ${shell.x + 10} ${shell.y} Z`}
          fill="#cfeaff"
          opacity={0.2 * project * (0.8 + 0.2 * Math.sin(g / 3))}
        />
      )}
      <BoboRider
        g={g}
        x={B.x}
        y={B.y}
        scale={B.scale}
        look={projecting ? lookHolo(B) : { x: 0.8, y: -0.1 }}
        expr={projecting ? "surprised" : "happy"}
        armL={projecting ? 50 : 20}
        armR={projecting ? -50 : -20}
        blink={blinkAt(g, 3)}
        riderLook={projecting ? lookHolo(B) : { x: 0.8, y: 0 }}
        riderArmsUp={projecting}
      />
      <Lumi
        x={L.x}
        y={L.y}
        scale={L.scale}
        look={projecting ? lookHolo(L) : { x: 0.8, y: -0.2 }}
        expr={projecting ? "surprised" : "happy"}
        mouth={mouthAt("lumi", g)}
        armR={lumiArm}
        armL={projecting ? 40 : 20}
        headTilt={projecting ? -5 : 3}
        blink={blinkAt(g, 1)}
      />
      <Worn L={L} g={g} glow={0.8} />
      <Draco
        x={D.x}
        y={D.y}
        scale={D.scale}
        g={g}
        mood={projecting ? (f > S6.project + 35 && f < S6.project + 63 ? "joy" : "excited") : "happy"}
        look={projecting ? lookHolo(D) : { x: -0.5, y: -0.2 }}
        blink={blinkAt(g, 5)}
        wing={projecting ? 0.95 : 0.5}
        flap={projecting ? Math.sin(f / 2.5) * 16 : 0}
        armsUp={projecting ? 0.8 : 0.2}
        glow={0.5}
      />
      <Coralie
        x={C.x}
        y={C.y}
        scale={C.scale}
        g={g}
        mood={cMouth > 0.06 ? "happy" : projecting ? "surprised" : "joy"}
        mouth={cMouth}
        look={projecting ? lookHolo(C) : { x: -1, y: 0 }}
        blink={blinkAt(g, 7)}
        armL={cArm}
        armR={-15}
        swim={0.7}
      />
      <AirBubble x={B.x} y={B.y} scale={B.scale} g={g} fit={BUBBLE_FIT.bobo} ph={1} />
      <AirBubble x={L.x} y={L.y} scale={L.scale} g={g} fit={BUBBLE_FIT.lumi} ph={2} />
      <AirBubble x={D.x} y={D.y} scale={D.scale} g={g} fit={BUBBLE_FIT.draco} ph={3} />
      <GlowShell x={shell.x} y={shell.y} scale={0.95 * L.scale} g={g} glow={0.5 + project * 0.5} />
      <SparkBurst f={f} at={S6.shell + 14} x={ch.x} y={ch.y} reach={140} count={14} size={10} life={22} />
    </SeaShot>
  );
};

export const Episode: React.FC = () => <EpisodeFrame audio="ep06/audio.wav" cuts={CUTS} scenes={[Scene1, Scene2, Scene3, Scene4, Scene5, Scene6]} />;
