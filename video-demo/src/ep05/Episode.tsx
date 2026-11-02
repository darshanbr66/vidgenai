import React from "react";
import { AbsoluteFill, Easing, useCurrentFrame } from "remotion";
import timeline from "./timeline.json";
import { blinkAt, Lumi } from "../story/characters";
import { Sparkle } from "../story/scenery";
import { GoldenClue } from "../ep03/props";
import { CastleMap, Draco, Ep4Defs } from "../ep04/props";
import { BoboRider, EASE, EndCard, EpisodeFrame, ip, lumiHand, makeMouthAt, OUT, SparkBurst, XF } from "../kit";
import { Cam3, World3D } from "../kit3d/World";
import { camAt, CharLayer, place, screen, V3 } from "../kit3d/overlay";
import { LightRing, MagicBubble, MoonCrystal, MoonFlower, MoonPortal, OceanHologram, SparkleBurst3D } from "../kit3d/magic";
import { LightAt } from "../kit3d/castle";
import { CROWN, FLOWER, Meadow, MoonKingdom } from "./world";
import { Ep5Defs, GoldBeam, Moonia, mooniaHand, MoonPendant } from "./props";

const mouthAt = makeMouthAt(timeline);
export const CUTS = [0, 180, 405, 675, 945, 1245, 1500];
const BACK = (s: number) => Easing.out(Easing.back(s));
const lerp = (a: number, b: number, k: number) => a + (b - a) * k;
const lerp3 = (a: V3, b: V3, k: number): V3 => [lerp(a[0], b[0], k), lerp(a[1], b[1], k), lerp(a[2], b[2], k)];
const up = (p: V3, h: number): V3 => [p[0], p[1] + h, p[2]];

// Relative sizes, matching Episode 4 (Lumi 0.86, Bobo 0.78, Draco 0.9)
const LUMI_S = 1;
const BOBO_S = 0.91;
const DRACO_S = 1.05;
const MOONIA_S = 0.74;

// Places characters around a point: `fwd` is the camera's looking direction on the ground,
// dx is sideways (screen right is positive) and d is toward the camera.
const spot = (base: V3, fwd: [number, number], dx: number, d: number, h = 0): V3 => {
  const len = Math.hypot(fwd[0], fwd[1]);
  const fx = fwd[0] / len;
  const fz = fwd[1] / len;
  return [base[0] - fx * d - fz * dx, base[1] + h, base[2] - fz * d + fx * dx];
};

// How lit the kingdom is at global frame G. Returns light by distance from the castle crown.
const DIM_A = 612;
const DIM_B = 666;
const LIGHTUP = 1104;
const kingdomLight = (G: number): { at: LightAt; base: number } => {
  if (G < LIGHTUP) {
    const base = ip(G, [DIM_A, DIM_B], [0.45, 0.08], EASE);
    return { at: () => base, base };
  }
  const R = ip(G, [LIGHTUP, LIGHTUP + 72], [0, 150], Easing.out(Easing.quad));
  return { at: (d) => 0.08 + 1.25 * Math.max(0, Math.min(1, (R - d) / 12)), base: ip(G, [LIGHTUP, LIGHTUP + 50], [0.08, 1.3]) };
};
const charLight = (G: number) => {
  if (G < 180) return 0.85;
  if (G < LIGHTUP) return ip(G, [DIM_A, DIM_B], [0.75, 0.4]);
  return ip(G, [LIGHTUP, LIGHTUP + 40], [0.4, 1.05]);
};

// A scene in the Moon Kingdom: 3D world below, the 2D characters above
const KingdomShot: React.FC<{ cam: Cam3; G: number; fade?: boolean; world?: React.ReactNode; terrace?: boolean; children: React.ReactNode; over?: React.ReactNode }> = ({
  cam,
  G,
  fade = true,
  world,
  children,
  over,
}) => {
  const f = useCurrentFrame();
  const light = kingdomLight(G);
  return (
    <AbsoluteFill style={{ opacity: fade ? ip(f, [0, XF], [0, 1]) : 1, background: "#0a1238" }}>
      <World3D cam={cam}>
        <MoonKingdom t={G / 30} lightAt={light.at} amb={0.55 + 0.45 * Math.min(1, light.base)} camPos={cam.pos} />
        {world}
      </World3D>
      <CharLayer defs={<><Ep4Defs /><Ep5Defs lit={charLight(G)} /></>} filter="moonLit">
        {children}
      </CharLayer>
      {over}
    </AbsoluteFill>
  );
};

// ---------- Scene 1 (0-6s): the castle map, the golden star opens a moon portal ----------
const S1_STAR_GLOW = 24;
const S1_PORTAL = 30;
const S1_ENTER = 144;
const S1_FLASH = 162;
const PORTAL1: V3 = [1.75, 1.15, -2.6];
const meadowY = (x: number, z: number) => -(x * x + (z + 6) * (z + 6)) / 180;
const onMeadow = (x: number, z: number): V3 => [x, meadowY(x, z), z];
const S1_BOBO = onMeadow(-1.0, 1.0);
const S1_LUMI = onMeadow(-0.12, 1.45);
const S1_DRACO = onMeadow(0.78, 1.15);

const Scene1: React.FC = () => {
  const f = useCurrentFrame();
  const g = f;
  const cam = camAt(f, [
    [0, { pos: [0.05, 1.5, 9.4], target: [0.2, 1.4, -1], fov: 44 }],
    [S1_ENTER, { pos: [0.15, 1.45, 8.6], target: [0.35, 1.35, -1.2], fov: 44 }],
    [S1_FLASH + 18, { pos: [1.5, 1.2, -0.6], target: [PORTAL1[0], PORTAL1[1], PORTAL1[2]], fov: 40 }],
  ]);
  const open = ip(f, [S1_PORTAL, S1_PORTAL + 22], [0, 1], BACK(1.6)) * ip(f, [S1_FLASH + 6, S1_FLASH + 18], [1, 1.6]);
  const go = (p: V3, delay: number) => {
    const k = ip(f, [S1_ENTER + delay, S1_ENTER + delay + 22], [0, 1], Easing.in(Easing.quad));
    return { p: lerp3(p, [PORTAL1[0], PORTAL1[1] - 0.5, PORTAL1[2]], k), k };
  };
  const bobo = go(S1_BOBO, 6);
  const lumi = go(S1_LUMI, 3);
  const draco = go(S1_DRACO, 0);
  const B = place(cam, bobo.p, BOBO_S * (1 - bobo.k * 0.6));
  const L = place(cam, lumi.p, LUMI_S * (1 - lumi.k * 0.6));
  const D = place(cam, draco.p, DRACO_S * (1 - draco.k * 0.6));
  const P = screen(cam, PORTAL1);
  const entering = f >= S1_ENTER;
  const portalOpen = f >= S1_PORTAL;
  const mapOn = ip(f, [0, 10], [0.6, 1], OUT) * ip(f, [S1_ENTER - 6, S1_ENTER + 10], [1, 0]);
  const star = { x: 850 + Math.sin(g / 9) * 8, y: 330 + Math.cos(g / 11) * 6 };
  const starGlow = ip(f, [S1_STAR_GLOW, S1_STAR_GLOW + 8, S1_STAR_GLOW + 30], [0, 1, 0.3]);
  const lookPortal = { x: 1, y: 0.2 };
  return (
    <AbsoluteFill style={{ background: "#0a1238" }}>
      <World3D cam={cam}>
        <Meadow t={g / 30} glow={open} />
        <MoonPortal position={PORTAL1} t={g / 30} open={open} size={1.05} rotationY={-0.25} />
        <SparkleBurst3D position={PORTAL1} age={ip(f, [S1_PORTAL, S1_PORTAL + 36], [0, 1])} reach={2.6} count={140} />
      </World3D>
      <CharLayer defs={<><Ep4Defs /><Ep5Defs lit={charLight(f)} /></>} filter="moonLit">
        {/* the map from the end of Episode 4, and the golden star clue */}
        {mapOn > 0 && (
          <g opacity={mapOn}>
            <circle cx={540} cy={560} r={ip(f, [0, 22], [100, 820], OUT)} fill="url(#flowerBurst)" opacity={ip(f, [0, 6, 40], [1, 1, 0])} />
            <CastleMap x={540} y={560} s={0.95} g={g} reveal={ip(f, [0, 14], [0.75, 1], OUT)} />
            {portalOpen && f < S1_PORTAL + 30 && <path d={`M ${star.x} ${star.y} L ${P.x - 40} ${P.y} L ${P.x + 40} ${P.y} Z`} fill="url(#beamGold)" opacity={ip(f, [S1_PORTAL - 6, S1_PORTAL, S1_PORTAL + 30], [0, 0.9, 0])} />}
            <circle cx={star.x} cy={star.y} r={60 + starGlow * 140} fill="url(#beamCore)" opacity={0.4 + starGlow * 0.6} />
            <GoldenClue x={star.x} y={star.y} scale={0.42 + starGlow * 0.12} frame={g} />
          </g>
        )}
        <BoboRider
          g={g}
          x={B.x}
          y={B.y}
          scale={B.scale}
          look={entering ? { x: 1, y: 0 } : portalOpen ? lookPortal : { x: 0.6, y: -1 }}
          expr={portalOpen ? "excited" : "surprised"}
          walk={entering ? f * 0.5 : null}
          armL={entering ? 20 : portalOpen ? 40 : 30}
          armR={entering ? -20 : portalOpen ? -40 : -30}
          blink={blinkAt(g, 3)}
          riderLook={portalOpen ? lookPortal : { x: 0.6, y: -1 }}
          riderArmsUp={portalOpen && !entering}
        />
        <Lumi
          x={L.x}
          y={L.y}
          scale={L.scale}
          look={entering ? { x: 1, y: 0 } : portalOpen ? (f > 110 ? { x: -0.6, y: 0.1 } : lookPortal) : { x: 0.3, y: -1 }}
          expr={portalOpen ? "excited" : "surprised"}
          mouth={mouthAt("lumi", g)}
          armR={entering ? -10 : f > 110 ? -70 : portalOpen ? -50 : -20}
          armL={entering ? 10 : 24}
          walk={entering ? f * 0.45 : null}
          headTilt={entering ? 0 : 3 + Math.sin(f / 10) * 2}
          blink={blinkAt(g, 1)}
        />
        <Draco
          x={D.x}
          y={D.y}
          scale={D.scale}
          g={g}
          mood={portalOpen ? "excited" : "surprised"}
          mouth={mouthAt("draco", g)}
          look={portalOpen ? (f > 100 && f < S1_ENTER ? { x: -0.7, y: 0 } : lookPortal) : { x: -0.2, y: -1 }}
          blink={blinkAt(g, 5)}
          wing={portalOpen ? 0.85 : 0.4}
          flap={portalOpen ? Math.sin(f / 3) * 14 : 0}
          armsUp={portalOpen && !entering ? 0.7 : 0.2}
          step={entering ? f * 0.6 : null}
          glow={0.45}
        />
        <SparkBurst f={f} at={0} x={540} y={560} reach={600} count={32} size={22} life={36} />
        <SparkBurst f={f} at={S1_STAR_GLOW} x={star.x} y={star.y} reach={260} count={18} size={16} life={26} />
      </CharLayer>
      {/* the bright flash of going through the portal */}
      <AbsoluteFill style={{ background: "radial-gradient(circle at 60% 55%, #ffffff 0%, #fff3c4 40%, #d8c8ff 100%)", opacity: ip(f, [S1_FLASH, S1_FLASH + 18], [0, 1], EASE) }} />
    </AbsoluteFill>
  );
};

// ---------- Scene 2 (6-13.5s): flying out over the clouds to the Moon Kingdom ----------
const S2_ARRIVE = 96;
const PORTAL2: V3 = [0, 1.25, -1.6];
const S2_BOBO: V3 = [-0.95, 0, 1.25];
const S2_LUMI: V3 = [-0.05, 0, 1.6];
const S2_DRACO: V3 = [0.85, 0, 1.3];

const Scene2: React.FC = () => {
  const f = useCurrentFrame();
  const g = f + CUTS[1];
  const cam = camAt(f, [
    [0, { pos: [12, 28, 74], target: [0, 10, -36], fov: 52 }],
    [92, { pos: [5, 7.5, 17], target: [0, 3, -10], fov: 48 }],
    [150, { pos: [0.3, 1.9, 8.6], target: [0, 1.45, -1.5], fov: 44 }],
    [240, { pos: [0.2, 1.8, 7.9], target: [0, 1.5, -1.5], fov: 44 }],
  ]);
  const open = ip(f, [S2_ARRIVE - 18, S2_ARRIVE - 4], [0, 1], OUT) * ip(f, [S2_ARRIVE + 24, S2_ARRIVE + 40], [1, 0], EASE);
  const out = (p: V3, delay: number) => {
    const k = ip(f, [S2_ARRIVE + delay, S2_ARRIVE + delay + 16], [0, 1], OUT);
    const pos = lerp3(PORTAL2, p, k);
    return { p: up(pos, Math.sin(k * Math.PI) * 0.7), k, landed: f >= S2_ARRIVE + delay + 16 };
  };
  const draco = out(S2_DRACO, 0);
  const lumi = out(S2_LUMI, 4);
  const bobo = out(S2_BOBO, 8);
  const B = place(cam, bobo.p, BOBO_S);
  const L = place(cam, lumi.p, LUMI_S);
  const D = place(cam, draco.p, DRACO_S);
  const amazed = f >= S2_ARRIVE + 30;
  const talking = f >= 140;
  const shown = f >= S2_ARRIVE;
  return (
    <KingdomShot
      cam={cam}
      G={g}
      fade={false}
      world={
        <>
          <MoonPortal position={PORTAL2} t={g / 30} open={open} size={1.0} />
          <SparkleBurst3D position={PORTAL2} age={ip(f, [S2_ARRIVE - 6, S2_ARRIVE + 30], [0, 1])} reach={2.4} count={120} seed={8} />
        </>
      }
      over={<AbsoluteFill style={{ background: "radial-gradient(circle at 50% 50%, #ffffff 0%, #fff3c4 40%, #d8c8ff 100%)", opacity: ip(f, [0, 22], [1, 0], EASE) }} />}
    >
      {shown && (
        <>
          <BoboRider
            g={g}
            x={B.x}
            y={B.y}
            scale={B.scale}
            look={amazed ? { x: 0.3, y: -1 } : { x: 0.5, y: -0.4 }}
            expr={talking ? "excited" : amazed ? "surprised" : "happy"}
            mouth={mouthAt("bobo", g)}
            armL={talking ? 140 : bobo.landed ? 40 : 90}
            armR={talking ? -140 : bobo.landed ? -40 : -90}
            squash={bobo.landed ? ip(f, [S2_ARRIVE + 24, S2_ARRIVE + 28, S2_ARRIVE + 36], [1, 0.86, 1]) : 1}
            blink={blinkAt(g, 3)}
            riderLook={{ x: 0.3, y: -1 }}
            riderArmsUp={talking}
          />
          <Lumi
            x={L.x}
            y={L.y}
            scale={L.scale}
            look={amazed ? { x: 0.1, y: -1 } : { x: 0.4, y: -0.3 }}
            expr={amazed ? "surprised" : "happy"}
            armL={lumi.landed ? 30 : 80}
            armR={lumi.landed ? -30 : -80}
            headTilt={amazed ? -4 : 0}
            blink={blinkAt(g, 1)}
          />
          <Draco
            x={D.x}
            y={D.y}
            scale={D.scale}
            g={g}
            mood={amazed ? "surprised" : "joy"}
            look={amazed ? { x: -0.2, y: -1 } : { x: -0.3, y: -0.3 }}
            blink={blinkAt(g, 5)}
            wing={draco.landed ? 0.6 : 1}
            flap={draco.landed ? Math.sin(f / 5) * 6 : Math.sin(f * 0.8) * 26}
            armsUp={amazed ? 0.4 : 0.6}
            glow={0.4}
          />
        </>
      )}
    </KingdomShot>
  );
};

// ---------- Scene 3 (13.5-22.5s): meeting Moonia; the lights grow dim ----------
const S3_MOONIA = 9;
const S3_BOBO: V3 = [-1.15, 0, 1.2];
const S3_LUMI: V3 = [-0.3, 0, 1.6];
const S3_DRACO: V3 = [0.55, 0, 1.35];
const S3_MOONIA_AT: V3 = [1.3, 0.45, 1.8];

const Scene3: React.FC = () => {
  const f = useCurrentFrame();
  const g = f + CUTS[2];
  const cam = camAt(f, [
    [0, { pos: [0.1, 1.55, 9.0], target: [0.1, 1.15, 0], fov: 44 }],
    [108, { pos: [0.1, 1.45, 8.3], target: [0.1, 1.1, 0.2], fov: 44 }],
    [109, { pos: [-0.25, 1.05, 5.6], target: [-0.3, 0.75, 1.2], fov: 40 }],
    [140, { pos: [-0.25, 1.05, 5.4], target: [-0.3, 0.75, 1.2], fov: 40 }],
    [141, { pos: [1.0, 1.0, 5.4], target: [1.0, 0.95, 1.5], fov: 40 }],
    [196, { pos: [1.0, 1.0, 5.0], target: [1.0, 0.95, 1.5], fov: 40 }],
    [197, { pos: [0.4, 2.3, 9.6], target: [0.2, 5.5, -14], fov: 48 }],
    [282, { pos: [0.4, 2.2, 8.8], target: [0.2, 5.3, -14], fov: 48 }],
  ]);
  const arrive = ip(f, [S3_MOONIA, S3_MOONIA + 26], [0, 1], OUT);
  const mPos = lerp3([0.3, 2.6, -3.5], S3_MOONIA_AT, arrive);
  const bob = Math.sin(g / 12) * 0.05;
  const B = place(cam, S3_BOBO, BOBO_S);
  const L = place(cam, S3_LUMI, LUMI_S);
  const D = place(cam, S3_DRACO, DRACO_S);
  const M = place(cam, up(mPos, bob), MOONIA_S);
  const seen = f >= S3_MOONIA + 6;
  const dimming = f >= 205;
  const look = (who: { x: number }) => ({ x: Math.max(-1, Math.min(1, (M.x - who.x) / 300)), y: dimming ? -1 : -0.1 });
  const worried = f >= 60;
  return (
    <KingdomShot cam={cam} G={g}>
      <BoboRider
        g={g}
        x={B.x}
        y={B.y}
        scale={B.scale}
        look={seen ? look(B) : { x: 0.3, y: -1 }}
        expr={worried ? "neutral" : "surprised"}
        armL={20}
        armR={-20}
        blink={blinkAt(g, 3)}
        riderLook={seen ? look(B) : { x: 0, y: -1 }}
      />
      <Lumi
        x={L.x}
        y={L.y}
        scale={L.scale}
        look={seen ? look(L) : { x: 0.2, y: -1 }}
        expr={f > 105 && f < 140 ? "surprised" : seen ? "happy" : "surprised"}
        mouth={mouthAt("lumi", g)}
        armL={f > 105 && f < 140 ? 40 : 20}
        armR={f > 105 && f < 140 ? -40 : -20}
        headTilt={f > 105 && f < 140 ? 6 : 0}
        blink={blinkAt(g, 1)}
      />
      <Draco x={D.x} y={D.y} scale={D.scale} g={g} mood={worried ? "sad" : "surprised"} look={seen ? look(D) : { x: 0, y: -1 }} blink={blinkAt(g, 5)} wing={0.4} glow={0.35} />
      {f >= S3_MOONIA - 2 && (
        <>
          <Moonia
            x={M.x}
            y={M.y}
            scale={M.scale}
            g={g}
            appear={ip(f, [S3_MOONIA, S3_MOONIA + 16], [0, 1], OUT)}
            mood={f < 60 ? "happy" : f > 205 ? "worried" : mouthAt("moonia", g) > 0.06 ? "worried" : "worried"}
            mouth={mouthAt("moonia", g)}
            look={dimming ? { x: -0.4, y: -1 } : { x: -1, y: 0 }}
            blink={blinkAt(g, 7)}
            armL={f < 60 ? 70 + Math.sin(f / 4) * 20 : 15}
            armR={f < 60 ? 20 : f > 150 && f < 200 ? 80 : 15}
            glow={0.6 + 0.4 * (1 - ip(f, [205, 260], [0, 1]))}
          />
          <SparkBurst f={f} at={S3_MOONIA} x={M.x} y={M.y - 100 * M.scale} reach={260} count={20} size={14} life={28} />
        </>
      )}
    </KingdomShot>
  );
};

// ---------- Scene 4 (22.5-31.5s): the moon garden; the crystal in its bubble ----------
const GFWD: [number, number] = [-0.42, -0.9]; // looking into the garden, toward the flower
const FLOWER_S = 0.62;
const S4_LUMI = spot(FLOWER, GFWD, -1.0, 1.25);
const S4_BOBO = spot(FLOWER, GFWD, -1.85, 0.7);
const S4_DRACO = spot(FLOWER, GFWD, 0.85, 0.95);
const S4_MOONIA = spot(FLOWER, GFWD, 1.55, 0.8, 0.95);
const BUBBLE: V3 = up(FLOWER, 1.12);
const BUB_R = 0.5;
const S4_FLOWER = 27;
const S4_REACH = 69;
const S4_PUSH = 111;
const S4_GLINT = 150;
const RIGHT: V3 = [0.9, 0, -0.42];

const Scene4: React.FC = () => {
  const f = useCurrentFrame();
  const g = f + CUTS[3];
  const t = g / 30;
  const towardCam = (d: number, dx = 0, h = 0) => spot(BUBBLE, GFWD, dx, d, h);
  const cam = camAt(f, [
    [0, { pos: towardCam(11.5, 3.0, 1.6), target: spot(FLOWER, GFWD, -0.15, 0, 0.8), fov: 46 }],
    [34, { pos: towardCam(9.4, -0.1, 0.45), target: spot(FLOWER, GFWD, -0.15, 0, 0.75), fov: 44 }],
    [64, { pos: towardCam(8.8, -0.1, 0.4), target: spot(FLOWER, GFWD, -0.15, 0, 0.75), fov: 44 }],
    [65, { pos: towardCam(4.8, 0.55, -0.3), target: lerp3(BUBBLE, up(S4_DRACO, 0.6), 0.5), fov: 42 }],
    [106, { pos: towardCam(4.5, 0.55, -0.3), target: lerp3(BUBBLE, up(S4_DRACO, 0.6), 0.5), fov: 42 }],
    [107, { pos: towardCam(4.6, -0.35, -0.3), target: lerp3(BUBBLE, up(S4_BOBO, 0.6), 0.4), fov: 42 }],
    [146, { pos: towardCam(4.3, -0.35, -0.3), target: lerp3(BUBBLE, up(S4_BOBO, 0.6), 0.4), fov: 42 }],
    [147, { pos: towardCam(2.5, 0, 0.05), target: BUBBLE, fov: 38 }],
    [168, { pos: towardCam(2.2, 0, 0.05), target: BUBBLE, fov: 38 }],
    [169, { pos: towardCam(5.3, -0.75, -0.25), target: lerp3(BUBBLE, up(S4_LUMI, 0.7), 0.5), fov: 42 }],
    [282, { pos: towardCam(5.0, -0.75, -0.25), target: lerp3(BUBBLE, up(S4_LUMI, 0.7), 0.5), fov: 42 }],
  ]);
  const walkIn = ip(f, [0, 34], [1, 0], EASE);
  const fromBridge = (p: V3, k: number) => lerp3(p, spot(p, GFWD, 2.5, 2.5), k);
  const open = ip(f, [S4_FLOWER, S4_FLOWER + 28], [0.08, 1], EASE);
  const emerge = ip(f, [S4_FLOWER + 10, S4_FLOWER + 34], [0, 1], BACK(1.4));
  // Draco hops up and taps the bubble, then bounces back
  const reachUp = ip(f, [S4_REACH, S4_REACH + 14], [0, 1], OUT) * ip(f, [S4_REACH + 15, S4_REACH + 30], [1, 0], Easing.in(Easing.quad));
  const dracoPos = lerp3(S4_DRACO, spot(BUBBLE, GFWD, 0.55, 0.2, -1.12), reachUp * 0.6);
  const dracoP = up(dracoPos, reachUp * 0.45);
  const dTap = ip(f, [S4_REACH + 12, S4_REACH + 15, S4_REACH + 30], [0, 0.55, 0]);
  // Bobo walks up and pushes, the bubble pushes back
  const bWalk = ip(f, [S4_PUSH, S4_PUSH + 14], [0, 1], EASE) * ip(f, [S4_PUSH + 30, S4_PUSH + 38], [1, 0.25], Easing.out(Easing.quad));
  const boboP = lerp3(fromBridge(S4_BOBO, walkIn), spot(BUBBLE, GFWD, -0.62, 0.05, -1.12), bWalk * 0.9);
  const bPush = ip(f, [S4_PUSH + 14, S4_PUSH + 28, S4_PUSH + 32, S4_PUSH + 44], [0, 0.6, 0.65, 0]);
  const push: V3 = [RIGHT[0] * (dTap - bPush), 0, RIGHT[2] * (dTap - bPush)];
  const wobble = 0.15 + dTap * 1.2 + bPush * 1.2;
  const glint = ip(f, [S4_GLINT, S4_GLINT + 8, S4_GLINT + 40], [0.2, 1, 0.75]);
  const aside = ip(f, [S4_PUSH - 14, S4_PUSH], [0, 1], EASE) * ip(f, [S4_GLINT + 2, S4_GLINT + 16], [1, 0], EASE);
  const lumiP = lerp3(fromBridge(S4_LUMI, walkIn), spot(FLOWER, GFWD, -2.6, -0.4), aside);
  const B = place(cam, boboP, BOBO_S);
  const L = place(cam, lumiP, LUMI_S);
  const D = place(cam, f < 40 ? fromBridge(S4_DRACO, walkIn) : dracoP, DRACO_S);
  const M = place(cam, up(fromBridge(S4_MOONIA, walkIn), Math.sin(g / 12) * 0.05), MOONIA_S);
  const Bub = screen(cam, BUBBLE);
  const lookAt = (who: { x: number; y: number }) => ({ x: Math.max(-1, Math.min(1, (Bub.x - who.x) / 260)), y: Math.max(-1, Math.min(1, (Bub.y - (who.y - 300)) / 260)) });
  const walking = f < 34;
  const pointing = f >= 176;
  return (
    <KingdomShot
      cam={cam}
      G={g}
      world={
        <>
          <MoonFlower position={FLOWER} t={t} open={open} glow={0.6 + open * 0.6} scale={FLOWER_S} />
          {emerge > 0 && (
            <>
              <MoonCrystal position={BUBBLE} t={t} glow={0.25} scale={0.34 * emerge} star={glint} spin={0.4} />
              <MagicBubble position={BUBBLE} t={t} radius={BUB_R} wobble={wobble} push={push} scale={emerge} />
            </>
          )}
          <SparkleBurst3D position={BUBBLE} age={ip(f, [S4_FLOWER + 16, S4_FLOWER + 50], [0, 1])} reach={1.8} count={90} seed={14} size={6} />
        </>
      }
    >
      <BoboRider
        g={g}
        x={B.x}
        y={B.y}
        scale={B.scale}
        look={lookAt(B)}
        expr={bPush > 0.1 ? "effort" : f > S4_PUSH + 32 && f < S4_PUSH + 60 ? "surprised" : "happy"}
        walk={walking || (f > S4_PUSH && f < S4_PUSH + 14) ? f * 0.45 : null}
        armL={bPush > 0 ? 95 : 20}
        armR={bPush > 0 ? -95 : -20}
        squash={ip(f, [S4_PUSH + 30, S4_PUSH + 34, S4_PUSH + 44], [1, 0.86, 1])}
        lean={-bPush * 10 + ip(f, [S4_PUSH + 30, S4_PUSH + 36, S4_PUSH + 48], [0, 8, 0])}
        blink={blinkAt(g, 3)}
        riderLook={lookAt(B)}
      />
      <Lumi
        x={L.x}
        y={L.y}
        scale={L.scale}
        look={lookAt(L)}
        expr={f >= S4_GLINT ? "excited" : f > S4_FLOWER + 10 ? "surprised" : "happy"}
        mouth={mouthAt("lumi", g)}
        walk={walking || (aside > 0.02 && aside < 0.98) ? f * 0.4 : null}
        armR={pointing ? -62 : -20}
        armL={20}
        headTilt={pointing ? 5 : 0}
        blink={blinkAt(g, 1)}
      />
      <Draco
        x={D.x}
        y={D.y}
        scale={D.scale}
        g={g}
        mood={reachUp > 0.05 ? "effort" : f > S4_REACH + 30 && f < S4_REACH + 60 ? "surprised" : "happy"}
        look={lookAt(D)}
        blink={blinkAt(g, 5)}
        wing={reachUp > 0 ? 1 : 0.45}
        flap={reachUp > 0 ? Math.sin(f * 0.9) * 28 : 0}
        armsUp={reachUp > 0 ? 0.9 : 0.15}
        step={walking ? f * 0.55 : null}
        squash={ip(f, [S4_REACH + 30, S4_REACH + 33, S4_REACH + 42], [1, 0.84, 1])}
        glow={0.4}
      />
      <Moonia x={M.x} y={M.y} scale={M.scale} g={g} mood="worried" look={lookAt(M)} blink={blinkAt(g, 7)} armL={15} armR={15} glow={0.6} />
      {f >= S4_GLINT && f < S4_GLINT + 30 && <Sparkle x={Bub.x} y={Bub.y} size={ip(f, [S4_GLINT, S4_GLINT + 8, S4_GLINT + 30], [10, 70, 0])} color="#fff1a8" rotate={f * 4} />}
    </KingdomShot>
  );
};

// ---------- Scene 5 (31.5-41.5s): the golden star frees the crystal; the kingdom lights up ----------
const S5_STAR = 9;
const S5_BEAM = 39;
const S5_POP = 81;
const S5_RISE = 93;
const S5_ARRIVE = 153;
const S5_LIGHT = 159;
const S5_GROUP = 232;
const CROWN_AT: V3 = up(CROWN, 1.25);
// the group shot faces the castle, so it stands behind everyone
const CFWD: [number, number] = [CROWN[0] - FLOWER[0], CROWN[2] - FLOWER[2]];
const GROUP_BASE: V3 = spot(FLOWER, CFWD, -2.3, -1.2);
const G_LUMI = spot(GROUP_BASE, CFWD, -0.2, 0.15);
const G_BOBO = spot(GROUP_BASE, CFWD, -1.05, -0.15);
const G_DRACO = spot(GROUP_BASE, CFWD, 0.72, -0.05);
const G_MOONIA = spot(GROUP_BASE, CFWD, 1.35, 0.1, 1.0);

const crystalPath = (f: number): V3 => {
  const rise = ip(f, [S5_RISE, S5_RISE + 16], [0, 1.6], OUT);
  const k = ip(f, [S5_RISE + 14, S5_ARRIVE], [0, 1], Easing.inOut(Easing.sin));
  const a = up(BUBBLE, rise);
  const ctrl: V3 = [-9, 20, -18];
  const b1 = lerp3(a, ctrl, k);
  const b2 = lerp3(ctrl, CROWN_AT, k);
  return lerp3(b1, b2, k);
};

const Scene5: React.FC = () => {
  const f = useCurrentFrame();
  const g = f + CUTS[4];
  const t = g / 30;
  const crys = crystalPath(f);
  const towardCam = (d: number, dx = 0, h = 0) => spot(BUBBLE, GFWD, dx, d, h);
  const follow = ip(f, [S5_RISE, S5_ARRIVE], [0, 1], EASE);
  let cam: Cam3;
  if (f < S5_RISE) {
    cam = camAt(f, [
      [0, { pos: towardCam(5.0, -0.75, -0.25), target: lerp3(BUBBLE, up(S4_LUMI, 0.75), 0.5), fov: 42 }],
      [S5_POP, { pos: towardCam(4.6, -0.75, -0.2), target: lerp3(BUBBLE, up(S4_LUMI, 0.75), 0.5), fov: 42 }],
    ]);
    const shake = f > S5_POP && f < S5_POP + 10 ? Math.sin(f * 3) * 0.03 * (S5_POP + 10 - f) / 10 : 0;
    cam = { ...cam, pos: [cam.pos[0] + shake, cam.pos[1] + shake, cam.pos[2]] };
  } else if (f < S5_LIGHT) {
    const from = towardCam(4.6, -0.75, -0.2);
    cam = { pos: lerp3(from, [-24, 13, 6], follow), target: lerp3(crys, lerp3(crys, CROWN, 0.5), follow), fov: lerp(42, 52, follow) };
  } else if (f < S5_GROUP) {
    const k = ip(f, [S5_LIGHT, S5_GROUP], [0, 1]);
    cam = { pos: lerp3([-24, 13, 6], [-14, 9, 16], k), target: lerp3(lerp3(CROWN, CROWN, 0.5), [0, 12, -36], k), fov: 52 };
  } else {
    cam = camAt(f, [
      [S5_GROUP, { pos: spot(GROUP_BASE, CFWD, 0.15, 7.4, 1.0), target: spot(GROUP_BASE, CFWD, 0.15, -3, 2.2), fov: 46 }],
      [300, { pos: spot(GROUP_BASE, CFWD, 0.15, 6.9, 0.95), target: spot(GROUP_BASE, CFWD, 0.15, -3, 2.2), fov: 46 }],
    ]);
  }
  const group = f >= S5_GROUP;
  const raise = ip(f, [S5_STAR, S5_STAR + 14], [0, 1], BACK(1.5));
  const armR = lerp(-20, -150, raise);
  const L = place(cam, group ? G_LUMI : S4_LUMI, LUMI_S);
  const B = place(cam, group ? G_BOBO : S4_BOBO, BOBO_S);
  const D = place(cam, group ? up(G_DRACO, Math.abs(Math.sin(f / 7)) * 0.25) : S4_DRACO, DRACO_S);
  const M = place(cam, up(group ? G_MOONIA : S4_MOONIA, Math.sin(g / 12) * 0.05), MOONIA_S);
  const hand = lumiHand(L.x, L.y, L.scale, armR);
  const Bub = screen(cam, BUBBLE);
  const beam = ip(f, [S5_BEAM, S5_BEAM + 16], [0, 1], OUT) * ip(f, [S5_POP, S5_POP + 6], [1, 0]);
  const popped = f >= S5_POP;
  const lit = f >= S5_LIGHT;
  const cheer = group;
  const lookAt = (who: { x: number; y: number }) => (popped ? { x: 0.2, y: -1 } : { x: Math.max(-1, Math.min(1, (Bub.x - who.x) / 260)), y: -0.6 });
  const crownGlow = f >= S5_ARRIVE ? ip(f, [S5_ARRIVE, S5_LIGHT + 10], [0.3, 1.6]) : 0.5;
  const C = screen(cam, CROWN_AT);
  return (
    <KingdomShot
      cam={cam}
      G={g}
      world={
        <>
          <MoonFlower position={FLOWER} t={t} open={1} glow={1.2} scale={FLOWER_S} />
          <MoonCrystal position={crys} t={t} glow={popped ? crownGlow : 0.25 + beam * 0.8} scale={popped ? lerp(0.34, 1.1, follow) : 0.34} star={1} spin={popped ? 1.4 : 0.4} />
          <MagicBubble
            position={BUBBLE}
            t={t}
            radius={BUB_R}
            wobble={0.15 + beam * 0.7}
            alpha={ip(f, [S5_POP, S5_POP + 5], [1, 0])}
            scale={ip(f, [S5_POP - 4, S5_POP + 5], [1, 1.35])}
          />
          <SparkleBurst3D position={BUBBLE} age={ip(f, [S5_POP, S5_POP + 30], [0, 1])} reach={2.2} count={150} seed={21} size={7} />
          <SparkleBurst3D position={CROWN_AT} age={ip(f, [S5_LIGHT, S5_LIGHT + 50], [0, 1])} reach={22} count={260} seed={23} size={26} gravity={2} />
          <LightRing position={CROWN_AT} age={ip(f, [S5_LIGHT, S5_LIGHT + 60], [0, 1])} radius={60} />
          <LightRing position={[CROWN[0], 0.5, CROWN[2]]} age={ip(f, [S5_LIGHT + 8, S5_LIGHT + 70], [0, 1])} radius={90} color="#ffe39a" />
          <LightRing position={CROWN_AT} age={ip(f, [S5_LIGHT + 4, S5_LIGHT + 54], [0, 1])} radius={40} flat={false} color="#ffffff" />
        </>
      }
      over={lit && f < S5_LIGHT + 20 ? <AbsoluteFill style={{ background: "#fff6dc", opacity: ip(f, [S5_LIGHT, S5_LIGHT + 3, S5_LIGHT + 20], [0, 0.55, 0]) }} /> : undefined}
    >
      {(f < S5_RISE + 20 || group) && (
        <>
          <BoboRider
            g={g}
            x={B.x}
            y={B.y}
            scale={B.scale}
            look={group ? { x: 0.2, y: -0.2 } : lookAt(B)}
            expr={cheer ? "excited" : popped ? "surprised" : "happy"}
            armL={cheer ? 140 : 25}
            armR={cheer ? -140 : -25}
            blink={blinkAt(g, 3)}
            riderLook={lookAt(B)}
            riderArmsUp={cheer}
          />
          <Lumi
            x={L.x}
            y={L.y}
            scale={L.scale}
            look={group ? { x: 0.4, y: -0.1 } : lookAt(L)}
            expr={cheer ? "excited" : popped ? "surprised" : beam > 0 ? "excited" : "happy"}
            armR={group ? -140 : armR}
            armL={group ? 140 : raise > 0.5 ? 40 : 20}
            headTilt={group ? 3 : -4 * raise}
            blink={blinkAt(g, 1)}
          />
          {!group && (
            <>
              <circle cx={hand.x} cy={hand.y} r={(70 + beam * 80) * L.scale} fill="url(#beamCore)" opacity={raise * (0.6 + 0.3 * Math.sin(g / 3))} />
              <GoldBeam from={hand} to={Bub} on={beam} g={g} />
              <GoldenClue x={hand.x} y={hand.y} scale={0.3 * L.scale * (0.6 + raise * 0.4)} frame={g} opacity={raise} />
            </>
          )}
          <Draco
            x={D.x}
            y={D.y}
            scale={D.scale}
            g={g}
            mood={cheer ? "joy" : popped ? "surprised" : "excited"}
            look={group ? { x: -0.3, y: -0.2 } : lookAt(D)}
            blink={blinkAt(g, 5)}
            wing={cheer ? 1 : 0.5}
            flap={cheer ? Math.sin(f * 0.9) * 26 : 0}
            armsUp={cheer ? 0.9 : 0.2}
            glow={0.5}
          />
          <Moonia
            x={M.x}
            y={M.y}
            scale={M.scale}
            g={g}
            mood={group ? (mouthAt("moonia", g) > 0.06 ? "happy" : "joy") : popped ? "surprised" : "worried"}
            mouth={mouthAt("moonia", g)}
            look={group ? { x: -1, y: 0 } : lookAt(M)}
            blink={blinkAt(g, 7)}
            armL={group ? 120 : 15}
            armR={group ? 120 : 15}
            glow={lit ? 1.3 : 0.6}
          />
        </>
      )}
      {f >= S5_RISE &&
        f < S5_ARRIVE + 4 &&
        Array.from({ length: 22 }, (_, k) => {
          const tt = f - (k + 1) * 1.2;
          if (tt < S5_RISE) return null;
          const p = screen(cam, crystalPath(tt));
          return <Sparkle key={k} x={p.x + Math.sin(k * 2.1) * 12} y={p.y + Math.cos(k * 1.7) * 12} size={26 * (1 - k / 22)} opacity={1 - k / 22} color={k % 2 ? "#bfe8ff" : "#fff1a8"} rotate={k * 30 + f * 4} />;
        })}
      {f >= S5_RISE && f < S5_LIGHT + 10 && <circle cx={C.x} cy={C.y} r={ip(f, [S5_ARRIVE, S5_LIGHT + 10], [0, 500])} fill="url(#beamCore)" opacity={ip(f, [S5_ARRIVE, S5_LIGHT, S5_LIGHT + 10], [0, 0.8, 0])} />}
      {group && <SparkBurst f={f} at={S5_GROUP} x={540} y={700} reach={520} count={26} size={18} life={36} />}
    </KingdomShot>
  );
};

// ---------- Scene 6 (41.5-50s): the moon pendant shows an underwater kingdom ----------
const S6_PENDANT = 9;
const S6_GIVE = 44;
const S6_PROJECT = 93;
const END_AT = 171;
const HOLO: V3 = spot(GROUP_BASE, CFWD, 0.15, -1.6, 2.15);

const Scene6: React.FC = () => {
  const f = useCurrentFrame();
  const g = f + CUTS[5];
  const t = g / 30;
  const cam = camAt(f, [
    [0, { pos: spot(GROUP_BASE, CFWD, 0.15, 5.4, 0.55), target: spot(GROUP_BASE, CFWD, 0.15, -2, 1.15), fov: 42 }],
    [S6_PROJECT - 4, { pos: spot(GROUP_BASE, CFWD, 0.15, 5.1, 0.55), target: spot(GROUP_BASE, CFWD, 0.15, -2, 1.15), fov: 42 }],
    [S6_PROJECT + 30, { pos: spot(GROUP_BASE, CFWD, 0.15, 7.6, 1.2), target: spot(GROUP_BASE, CFWD, 0.15, -2, 2.45), fov: 46 }],
    [255, { pos: spot(GROUP_BASE, CFWD, 0.15, 8.0, 1.25), target: spot(GROUP_BASE, CFWD, 0.15, -2, 2.5), fov: 46 }],
  ]);
  const toLumi = ip(f, [S6_PENDANT, S6_PENDANT + 26], [0, 1], EASE);
  const mPos = lerp3(G_MOONIA, spot(GROUP_BASE, CFWD, 0.2, 0.35, 1.15), toLumi * ip(f, [S6_GIVE + 20, S6_GIVE + 50], [1, 0.4], EASE));
  const L = place(cam, G_LUMI, LUMI_S);
  const B = place(cam, G_BOBO, BOBO_S);
  const D = place(cam, G_DRACO, DRACO_S);
  const M = place(cam, up(mPos, Math.sin(g / 12) * 0.05), MOONIA_S);
  const lumiArm = ip(f, [S6_GIVE - 8, S6_GIVE + 4], [-20, -128], EASE);
  const mArm = f < S6_GIVE + 6 ? ip(f, [S6_PENDANT, S6_PENDANT + 14], [15, 70]) : ip(f, [S6_GIVE + 6, S6_GIVE + 20], [70, 15]);
  const mh = mooniaHand(M.x, M.y, M.scale, mArm);
  const lh = lumiHand(L.x, L.y, L.scale, lumiArm);
  const give = ip(f, [S6_GIVE - 4, S6_GIVE + 6], [0, 1], EASE);
  const pend = { x: lerp(mh.x, lh.x, give), y: lerp(mh.y, lh.y, give) + 40 * L.scale };
  const project = ip(f, [S6_PROJECT, S6_PROJECT + 30], [0, 1], OUT);
  const projecting = f >= S6_PROJECT;
  const Hs = screen(cam, up(HOLO, 0.4));
  const lookHolo = (who: { x: number }) => ({ x: Math.max(-1, Math.min(1, (Hs.x - who.x) / 300)), y: -1 });
  return (
    <KingdomShot
      cam={cam}
      G={g}
      world={
        <>
          <MoonFlower position={FLOWER} t={t} open={1} glow={1.2} scale={FLOWER_S} />
          <OceanHologram position={HOLO} t={t} on={project} scale={0.68} />
          <SparkleBurst3D position={up(HOLO, 0.8)} age={ip(f, [S6_PROJECT, S6_PROJECT + 34], [0, 1])} reach={2.4} count={120} seed={31} colors={["#7fe8ff", "#ffffff", "#bfe0ff", "#ffb8e6"]} />
        </>
      }
      over={<EndCard at={END_AT} top={250} />}
    >
      {projecting && (
        <path
          d={`M ${pend.x - 10} ${pend.y} L ${Hs.x - 160 * project} ${Hs.y + 120} L ${Hs.x + 160 * project} ${Hs.y + 120} L ${pend.x + 10} ${pend.y} Z`}
          fill="#7fe8ff"
          opacity={0.18 * project * (0.8 + 0.2 * Math.sin(g / 3))}
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
        headTilt={projecting ? -4 : 3}
        blink={blinkAt(g, 1)}
      />
      <Draco
        x={D.x}
        y={D.y}
        scale={D.scale}
        g={g}
        mood={projecting ? "excited" : "happy"}
        look={projecting ? lookHolo(D) : { x: -0.5, y: -0.2 }}
        blink={blinkAt(g, 5)}
        wing={projecting ? 0.95 : 0.5}
        flap={projecting ? Math.sin(f / 2.5) * 16 : 0}
        armsUp={projecting ? 0.8 : 0.2}
        glow={0.5}
      />
      <Moonia
        x={M.x}
        y={M.y}
        scale={M.scale}
        g={g}
        mood={mouthAt("moonia", g) > 0.06 ? "happy" : projecting ? "surprised" : "joy"}
        mouth={mouthAt("moonia", g)}
        look={projecting ? lookHolo(M) : { x: -1, y: 0 }}
        blink={blinkAt(g, 7)}
        armR={mArm}
        armL={15}
        glow={1.2}
      />
      <MoonPendant x={pend.x} y={pend.y} scale={1.9 * L.scale} g={g} glow={0.4 + project * 0.6} />
      <SparkBurst f={f} at={S6_PENDANT + 14} x={mh.x} y={mh.y} reach={140} count={14} size={10} life={22} />
    </KingdomShot>
  );
};

export const Episode: React.FC = () => <EpisodeFrame audio="ep05/audio.wav" cuts={CUTS} scenes={[Scene1, Scene2, Scene3, Scene4, Scene5, Scene6]} />;
