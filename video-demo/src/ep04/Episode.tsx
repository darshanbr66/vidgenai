import React from "react";
import { AbsoluteFill, Easing, useCurrentFrame } from "remotion";
import timeline from "./timeline.json";
import { blinkAt, Lumi } from "../story/characters";
import { Sparkle } from "../story/scenery";
import { GoldenClue, RainbowWorld } from "../ep03/props";
import { BoboRider, CamView, EASE, EpisodeFrame, fontFamily, ip, makeMouthAt, OUT, SparkBurst, Stage, XF } from "../kit";
import { Boulder, BOULDER_TOP, Breeze, CastleMap, Draco, DustCloud, Ep4Defs, GrassHill, HILL_H, HoloMountain, MountainWorld } from "./props";

const mouthAt = makeMouthAt(timeline);
const CUTS = [0, 180, 390, 630, 930, 1170, 1350];
const BACK = (s: number) => Easing.out(Easing.back(s));

// Lerp helper for positions
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

// A mountain shot: fades in over the previous scene
const Mtn: React.FC<{ cam: CamView; g: number; fade?: boolean; drift?: number; children: React.ReactNode }> = ({ cam, g, fade = true, drift = 0, children }) => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill style={{ opacity: fade ? ip(f, [0, XF], [0, 1]) : 1 }}>
      <Stage cam={cam} defs={<Ep4Defs />}>
        <MountainWorld g={g} drift={drift} />
        {children}
      </Stage>
    </AbsoluteFill>
  );
};

// Sparkles that trail behind something moving along `pos`
const Trail: React.FC<{ f: number; from: number; pos: (f: number) => { x: number; y: number }; len?: number; size?: number; colors?: string[] }> = ({
  f,
  from,
  pos,
  len = 26,
  size = 20,
  colors = ["#fff1a8", "#d9b8ff", "#ffffff"],
}) => (
  <g>
    {Array.from({ length: len }, (_, k) => {
      const t = f - (k + 1) * 1.1;
      if (t < from) return null;
      const p = pos(t);
      return <Sparkle key={k} x={p.x + Math.sin(k * 2.3) * 14} y={p.y + Math.cos(k * 1.7) * 14} size={size * (1 - k / len)} opacity={1 - k / len} color={colors[k % colors.length]} rotate={k * 24 + f * 3} />;
    })}
  </g>
);

// ---------- Scene 1 (0-6s): the golden star clue shows a mountain ----------
const S1_LUMI = { x: 890, y: 1790, s: 0.86 };
const S1_BOBO = { x: 1410, y: 1776, s: 0.78 };
const S1_STAR = { x: 1150, y: 1330 };
const HOLO_AT = 36; // 1.2s
const STAR_LEAVE = 111; // 3.7s
const WALK1 = 126;

const Scene1: React.FC = () => {
  const f = useCurrentFrame();
  const g = f + CUTS[0];
  const rise = ip(f, [0, 30], [0, 1], OUT);
  const leave = (t: number) => ip(t, [STAR_LEAVE, 150], [0, 1], Easing.in(Easing.cubic));
  const starAt = (t: number) => ({
    x: S1_STAR.x + leave(t) * 1500,
    y: S1_STAR.y - 400 * ip(t, [0, 30], [0, 1], OUT) + Math.sin((t + CUTS[0]) / 12) * 10 - leave(t) * 520,
  });
  const star = starAt(f);
  const pop = ip(f, [0, 12], [0.3, 0.7], BACK(2.2));
  const holo = ip(f, [HOLO_AT, HOLO_AT + 24], [0, 1], OUT) * ip(f, [STAR_LEAVE, STAR_LEAVE + 22], [1, 0]);
  const walking = f >= WALK1;
  const walked = ip(f, [WALK1, 192], [0, 430]);
  const pointing = f >= HOLO_AT + 6 && f < STAR_LEAVE;
  const cam: CamView = {
    cx: S1_STAR.x + ip(f, [WALK1 - 10, 192], [0, 380], EASE),
    cy: ip(f, [0, 100, WALK1 + 20], [1160, 1190, 1260], EASE),
    z: ip(f, [0, 100, WALK1 + 20], [1.17, 1.1, 1.0], EASE),
  };
  const lumiLook = walking ? { x: 1, y: -0.3 } : f >= STAR_LEAVE ? { x: 1, y: -1 } : pointing ? { x: 1, y: 0.5 } : { x: 0.6, y: -1 };
  const boboLook = walking ? { x: 1, y: -0.3 } : f >= STAR_LEAVE ? { x: 1, y: -1 } : pointing ? { x: -1, y: 0.5 } : { x: -0.5, y: -1 };
  return (
    <Stage cam={cam} defs={<Ep4Defs />}>
      <RainbowWorld g={g} arc={1} />
      {/* the golden beam projecting the mountain onto the ground */}
      {holo > 0 && (
        <path d={`M ${star.x - 18} ${star.y + 30} L ${S1_STAR.x - 300} 1830 L ${S1_STAR.x + 300} 1830 L ${star.x + 18} ${star.y + 30} Z`} fill="url(#beamGold)" opacity={holo * (0.6 + Math.sin(g / 5) * 0.08)} />
      )}
      <HoloMountain x={S1_STAR.x} y={1830} s={1.3} g={g} reveal={holo} />
      <BoboRider
        g={g}
        x={S1_BOBO.x + walked}
        y={S1_BOBO.y}
        scale={S1_BOBO.s}
        look={boboLook}
        expr={walking ? "happy" : "excited"}
        walk={walking ? f * 0.45 : null}
        armL={walking ? 14 : 44}
        armR={walking ? -14 : -44}
        blink={blinkAt(g, 3)}
        riderLook={boboLook}
        riderArmsUp={!walking}
      />
      <Lumi
        x={S1_LUMI.x + walked}
        y={S1_LUMI.y}
        scale={S1_LUMI.s}
        look={lumiLook}
        expr={f < 14 ? "surprised" : "excited"}
        mouth={mouthAt("lumi", g)}
        armR={walking ? -10 : pointing ? ip(f, [HOLO_AT + 6, HOLO_AT + 16], [-20, -72], EASE) : -20}
        armL={walking ? 8 : 30}
        walk={walking ? f * 0.4 : null}
        headTilt={walking ? 0 : 4 + Math.sin(f / 10) * 2}
        blink={blinkAt(g, 1)}
      />
      {/* the opening burst */}
      <circle cx={star.x} cy={star.y} r={ip(f, [0, 20], [80, 700], OUT)} fill="url(#flowerBurst)" opacity={ip(f, [0, 6, 40], [1, 1, 0])} />
      {[0, 1, 2].map((k) => {
        const at = k * 9;
        return f >= at && f < at + 30 ? <circle key={k} cx={star.x} cy={star.y} r={ip(f, [at, at + 30], [60, 520], OUT)} fill="none" stroke={["#fff4b8", "#ffd34f", "#ffffff"][k]} strokeWidth={12} opacity={ip(f, [at, at + 30], [0.9, 0])} /> : null;
      })}
      {f >= STAR_LEAVE && <Trail f={f} from={STAR_LEAVE} pos={starAt} len={30} size={22} />}
      <GoldenClue x={star.x} y={star.y} scale={pop * (1 - leave(f) * 0.6)} frame={g} />
      <SparkBurst f={f} at={0} x={S1_STAR.x} y={S1_STAR.y - 200} reach={560} count={32} size={22} life={36} />
      <SparkBurst f={f} at={HOLO_AT} x={S1_STAR.x} y={1700} reach={300} count={18} size={14} life={28} />
    </Stage>
  );
};

// ---------- Scene 2 (6-13s): the little dragon on the rock ----------
const ROCK = { x: 1980, y: 1800 };
const D2 = { x: ROCK.x, y: ROCK.y - BOULDER_TOP + 6, s: 0.9 };
const S2_SAD = 30;
const S2_TURN = 96;
const S2_CLOSE = 140;

const Scene2: React.FC = () => {
  const f = useCurrentFrame();
  const g = f + CUTS[1];
  const lumiX = f < 60 ? ip(f, [0, 58], [1050, 1420]) : ip(f, [62, 110], [1420, 1610], EASE);
  const lumiWalking = f < 58 || (f > 62 && f < 110);
  // Bobo walks up beside Lumi so he stays fully in the two-shot
  const boboX = f < 60 ? ip(f, [0, 58], [800, 1180]) : ip(f, [62, 110], [1180, 1390], EASE);
  const boboWalking = f < 58 || (f > 62 && f < 110);
  const close = f >= S2_CLOSE;
  const cam: CamView = close
    ? { cx: 1975, cy: ip(f, [S2_CLOSE, 210], [1480, 1468]), z: ip(f, [S2_CLOSE, 210], [2.3, 2.45]) }
    : { cx: ip(f, [0, 40, 84, S2_CLOSE], [1500, 1500, 1715, 1730], EASE), cy: ip(f, [0, 40, 84], [1060, 1080, 1385], EASE), z: ip(f, [0, 40, 84, S2_CLOSE], [0.62, 0.66, 1.18, 1.22], EASE) };
  const talking = mouthAt("draco", g);
  const dracoLook = close ? (f > 192 ? { x: 0.3, y: -1 } : { x: -0.7, y: 0.1 }) : f >= S2_TURN ? { x: -1, y: 0 } : { x: 0.25, y: -1 };
  const starFade = ip(f, [30, 56], [1, 0]);
  return (
    <Mtn cam={cam} g={g}>
      <Boulder x={ROCK.x} y={ROCK.y} />
      <Draco
        x={D2.x}
        y={D2.y}
        scale={D2.s}
        g={g}
        mood={f >= S2_TURN && f < S2_CLOSE && talking < 0.06 ? "surprised" : "sad"}
        look={dracoLook}
        mouth={talking}
        blink={blinkAt(g, 5)}
        wing={0.12}
        flap={Math.sin(g / 14) * 3}
        squash={0.95}
        headTilt={f < S2_TURN ? 6 : -4}
      />
      {starFade > 0 && <GoldenClue x={ROCK.x + Math.cos(g / 9) * 160} y={1330 + Math.sin(g / 9) * 50} scale={0.35 + (1 - starFade) * 0.2} frame={g} opacity={starFade} />}
      {f >= S2_SAD && f < S2_SAD + 40 && !close && (
        <g opacity={ip(f, [S2_SAD, S2_SAD + 8, S2_SAD + 40], [0, 1, 0])}>
          {[0, 1].map((k) => (
            <path key={k} d={`M ${D2.x + 70 + k * 40} ${D2.y - 330 - k * 50 - (f - S2_SAD) * 1.5} q 10 -20 0 -34`} stroke="#e8ddff" strokeWidth={6} fill="none" strokeLinecap="round" />
          ))}
        </g>
      )}
      <BoboRider g={g} x={boboX} y={1776} scale={0.78} look={{ x: 1, y: -0.2 }} expr="neutral" walk={boboWalking ? f * (f < 60 ? 0.45 : 0.32) : null} blink={blinkAt(g, 3)} riderLook={{ x: 1, y: 0 }} />
      <Lumi
        x={lumiX}
        y={1790}
        scale={0.86}
        look={f < 30 ? { x: 0.5, y: -0.6 } : { x: 1, y: -0.15 }}
        expr={f < 30 ? "excited" : "neutral"}
        mouth={mouthAt("lumi", g)}
        walk={lumiWalking ? f * (f < 60 ? 0.4 : 0.28) : null}
        armL={18}
        armR={f > 70 ? -34 : -10}
        headTilt={f > 62 ? 7 : 0}
        blink={blinkAt(g, 1)}
      />
    </Mtn>
  );
};

// ---------- Scene 3 (13-21s): flapping, a tiny hop, a sad little dragon ----------
const HILL = { x: 2500, y: 1800 };
const D3 = { x: HILL.x, y: HILL.y - HILL_H + 6, s: 0.9 };
const S3_FLAP = 9;
const S3_HOP = 51;
const S3_LAND = 75;
const S3_CLOSE = 88;
const S3_BOBO = 170;

const Scene3: React.FC = () => {
  const f = useCurrentFrame();
  const g = f + CUTS[2];
  const hopping = f >= S3_HOP && f <= S3_LAND;
  const hop = hopping ? Math.sin((Math.PI * (f - S3_HOP)) / (S3_LAND - S3_HOP)) * 80 : 0;
  const squash = f >= 44 && f < S3_HOP ? ip(f, [44, S3_HOP], [1, 0.86]) : f >= S3_LAND && f < S3_LAND + 12 ? ip(f, [S3_LAND, S3_LAND + 12], [0.8, 1], BACK(2)) : f >= S3_LAND + 12 ? 0.95 : 1;
  const flapping = f >= S3_FLAP && f < S3_LAND;
  const mood = f < S3_FLAP ? "neutral" : f < S3_LAND ? "effort" : f < 205 ? "sad" : f < 222 ? "neutral" : "happy";
  const dracoLook = f < S3_LAND ? { x: 0, y: -1 } : f < 200 ? { x: 0, y: 0.6 } : { x: -1, y: 0.2 };
  const boboX = ip(f, [100, 165], [1810, 2250]);
  const cam: CamView =
    f < S3_CLOSE
      ? { cx: ip(f, [0, S3_CLOSE], [2228, 2248]), cy: ip(f, [0, S3_CLOSE], [1300, 1285]), z: ip(f, [0, S3_CLOSE], [0.97, 1.0]) }
      : f < S3_BOBO
        ? { cx: 2490, cy: ip(f, [S3_CLOSE, S3_BOBO], [1452, 1432]), z: ip(f, [S3_CLOSE, S3_BOBO], [1.95, 2.12]) }
        : { cx: ip(f, [S3_BOBO, 240], [2490, 2475]), cy: 1430, z: ip(f, [S3_BOBO, 240], [1.6, 1.7]) };
  return (
    <Mtn cam={cam} g={g}>
      <GrassHill x={HILL.x} y={HILL.y} g={g} />
      <Draco
        x={D3.x}
        y={D3.y - hop}
        scale={D3.s}
        g={g}
        mood={mood}
        look={dracoLook}
        mouth={mouthAt("draco", g)}
        blink={blinkAt(g, 5)}
        wing={flapping ? 0.9 : ip(f, [S3_LAND, S3_LAND + 25, 215, 235], [0.8, 0.02, 0.02, 0.35])}
        flap={flapping ? Math.sin(f * 1.3) * 30 : 0}
        squash={squash}
        armsUp={flapping ? 0.3 : 0}
        headTilt={f >= S3_LAND && f < 205 ? -6 : 0}
      />
      {f >= S3_LAND && f < S3_LAND + 20 &&
        [-1, 1].map((s) => <ellipse key={s} cx={D3.x + s * ip(f, [S3_LAND, S3_LAND + 20], [60, 150])} cy={D3.y - 6} rx={30} ry={14} fill="#d8f7dc" opacity={ip(f, [S3_LAND, S3_LAND + 20], [0.8, 0])} />)}
      <Lumi
        x={2010}
        y={1790}
        scale={0.86}
        look={hopping ? { x: 1, y: -0.8 } : { x: 1, y: -0.35 }}
        expr={hopping ? "surprised" : f >= S3_LAND ? "neutral" : "happy"}
        mouth={mouthAt("lumi", g)}
        armL={hopping ? 40 : 14}
        armR={hopping ? -40 : -14}
        headTilt={f >= S3_LAND ? 6 : 0}
        blink={blinkAt(g, 1)}
      />
      <BoboRider
        g={g}
        x={boboX}
        y={1776}
        scale={0.78}
        look={{ x: 1, y: -0.4 }}
        expr={f >= S3_BOBO ? "happy" : hopping ? "surprised" : "neutral"}
        mouth={mouthAt("bobo", g)}
        walk={f >= 100 && f < 165 ? f * 0.45 : null}
        armL={f >= S3_BOBO ? 30 : 14}
        armR={f >= S3_BOBO ? ip(f, [S3_BOBO, S3_BOBO + 12], [-14, -62], EASE) : -14}
        headTilt={f >= S3_BOBO ? 8 : 0}
        blink={blinkAt(g, 3)}
        riderLook={{ x: 1, y: -0.4 }}
        riderHappy={f >= 215}
      />
    </Mtn>
  );
};

// ---------- Scene 4 (21-31s): training together, and a soft landing ----------
const DUST = { x: 1480, y: 1770, s: 0.85 };
const S4 = { bobo: 330, lumi: 700, draco: 980 };
const S4_B = 68;
const BJUMP = 90; // 24.0s
const BLAND = 110;
const S4_C = 112;
const FLAP2 = 117;
const RUN = 141;
const LIFT = 171;
const CLOUD_LAND = 210; // 28.0s
const S4_D = 218;
const D4_LAND_Y = 1694;

const dracoS4 = (f: number) => {
  if (f < RUN) return { x: S4.draco, y: 1790 };
  if (f < LIFT) return { x: ip(f, [RUN, LIFT], [S4.draco, 1260]), y: 1790 };
  if (f < CLOUD_LAND) {
    const t = (f - LIFT) / (CLOUD_LAND - LIFT);
    return { x: lerp(1260, DUST.x, t), y: lerp(1790, D4_LAND_Y, t) - Math.sin(Math.PI * t) * 240 };
  }
  return { x: DUST.x, y: D4_LAND_Y };
};

const Scene4: React.FC = () => {
  const f = useCurrentFrame();
  const g = f + CUTS[3];
  const d = dracoS4(f);
  const flying = f >= LIFT && f < CLOUD_LAND;
  const flapping = (f >= FLAP2 && f < RUN) || flying;
  const running = f >= RUN && f < LIFT;
  const landed = f >= CLOUD_LAND;
  const bJump = f >= BJUMP && f < BLAND ? Math.sin((Math.PI * (f - BJUMP)) / (BLAND - BJUMP)) * 160 : 0;
  const bSquash = f >= BJUMP - 6 && f < BJUMP ? 0.86 : f >= BLAND && f < BLAND + 8 ? 0.85 : 1;
  const together = f >= 200;
  const boboX = ip(f, [200, 258], [S4.bobo, 980]);
  const lumiX = ip(f, [200, 258], [S4.lumi, 1210]);
  const walkingOver = f >= 200 && f < 258;
  const cam: CamView =
    f < S4_B
      ? { cx: ip(f, [0, S4_B], [820, 860]), cy: 1400, z: ip(f, [0, S4_B], [1.4, 1.5]) }
      : f < S4_C
        ? { cx: 640, cy: ip(f, [S4_B, S4_C], [1300, 1270]), z: 1.1 }
        : f < S4_D
          ? { cx: ip(f, [S4_C, RUN, LIFT, CLOUD_LAND], [960, 1000, 1260, 1400], EASE), cy: ip(f, [S4_C, LIFT, 195, S4_D], [1390, 1390, 1310, 1340], EASE), z: ip(f, [S4_C, LIFT, S4_D], [1.3, 1.2, 1.15]) }
          : { cx: ip(f, [S4_D, 300], [1270, 1330]), cy: ip(f, [S4_D, 300], [1380, 1400]), z: ip(f, [S4_D, 300], [1.1, 1.2]) };
  const squish = landed ? ip(f, [CLOUD_LAND, CLOUD_LAND + 6, CLOUD_LAND + 20], [0, 1, 0]) : 0;
  const dracoMood = f < 30 ? "neutral" : f < FLAP2 ? "happy" : f < CLOUD_LAND ? (flying ? "excited" : "effort") : "joy";
  const dracoLook = f < S4_B ? { x: -1, y: -0.1 } : f < S4_C ? { x: -1, y: -0.2 } : flying ? { x: 0.6, y: -0.4 } : landed ? { x: -0.8, y: 0 } : { x: 0.6, y: 0 };
  const cheer = f >= FLAP2;
  return (
    <Mtn cam={cam} g={g}>
      <DustCloud x={DUST.x} y={DUST.y} s={DUST.s} g={g} squish={squish} opacity={ip(f, [0, 150], [0.75, 1])} />
      <SparkBurst f={f} at={CLOUD_LAND} x={DUST.x} y={DUST.y - 80} reach={300} count={22} size={16} life={30} />
      <BoboRider
        g={g}
        x={boboX}
        y={1776 - bJump}
        scale={0.78}
        look={f < S4_B ? { x: 1, y: 0 } : { x: 1, y: -0.2 }}
        expr={bJump > 0 ? "excited" : together ? "happy" : "happy"}
        mouth={mouthAt("bobo", g)}
        squash={bSquash}
        walk={walkingOver ? f * 0.45 : null}
        armL={bJump > 0 ? 150 : cheer && !walkingOver ? 120 + Math.sin(f * 0.35) * 10 : 20}
        armR={bJump > 0 ? -150 : cheer && !walkingOver ? -120 - Math.sin(f * 0.35) * 10 : -20}
        blink={blinkAt(g, 3)}
        riderArmsUp={bJump > 0 || landed}
        riderHappy={landed}
        riderLook={{ x: 1, y: -0.2 }}
      />
      <Lumi
        x={lumiX}
        y={1790}
        scale={0.86}
        look={f < S4_B ? { x: 1, y: 0.1 } : f < S4_C ? { x: -1, y: -0.4 } : { x: 1, y: -0.3 }}
        expr={f < S4_B ? "excited" : landed ? "happy" : "excited"}
        mouth={mouthAt("lumi", g)}
        walk={walkingOver ? f * 0.4 : null}
        armL={f < S4_B ? 120 + Math.sin(f * 0.3) * 12 : f < S4_C ? 30 : walkingOver ? 10 : 120 + Math.sin(f * 0.3) * 10}
        armR={f < S4_B ? -120 - Math.sin(f * 0.3) * 12 : f < S4_C ? -30 : walkingOver ? -10 : -120 - Math.sin(f * 0.3) * 10}
        headTilt={Math.sin(f / 9) * 3}
        blink={blinkAt(g, 1)}
      />
      {flying && <Trail f={f} from={LIFT} pos={dracoS4} len={18} size={16} />}
      <Draco
        x={d.x}
        y={d.y}
        scale={0.9}
        g={g}
        mood={dracoMood}
        look={dracoLook}
        mouth={mouthAt("draco", g)}
        blink={blinkAt(g, 5)}
        wing={flapping ? 0.95 : running ? 0.55 : landed ? 0.55 : 0.3}
        flap={flapping ? Math.sin(f * 1.4) * 32 : running ? Math.sin(f * 0.9) * 12 : landed ? Math.sin(f / 5) * 6 : 0}
        step={running ? f * 0.9 : null}
        lean={flying ? Math.sin(f / 5) * 9 : running ? 6 : 0}
        squash={landed ? 1 - squish * 0.15 : 1}
        armsUp={landed && f > CLOUD_LAND + 10 ? 0.9 : flying ? 0.4 : 0}
        glow={landed ? 0.4 : 0.25}
      />
    </Mtn>
  );
};

// ---------- Scene 5 (31-39s): believe in yourself, and he flies! ----------
const S5 = { bobo: 2560, lumi: 2960, draco: 3390 };
const S5_B = 64;
const BREATH = 69;
const FLY = 96; // 34.2s
const S5_D = 150;
const FLY_TOP = { x: 2100, y: 760 };
const LOOP = { cx: 2550, r: 450, rise: 180 };

const flyUp = (f: number) => {
  const u = ip(f, [FLY, S5_D], [0, 1], Easing.inOut(Easing.quad));
  const c = { x: 3360, y: 520 };
  return {
    x: (1 - u) ** 2 * S5.draco + 2 * (1 - u) * u * c.x + u * u * FLY_TOP.x,
    y: (1 - u) ** 2 * 1790 + 2 * (1 - u) * u * c.y + u * u * FLY_TOP.y,
  };
};
// a big happy arc right over Lumi and Bobo's heads
const flySky = (f: number) => {
  const a = (f - S5_D) / 30;
  return { x: LOOP.cx - LOOP.r * Math.cos(a), y: FLY_TOP.y - LOOP.rise * Math.sin(a) + Math.sin((f - S5_D) / 7) * 14 };
};
const flyPos = (f: number) => (f < S5_D ? flyUp(f) : flySky(f));

const Scene5: React.FC = () => {
  const f = useCurrentFrame();
  const g = f + CUTS[4];
  const airborne = f >= FLY;
  const p = airborne ? flyPos(f) : { x: S5.draco, y: 1790 };
  let cam: CamView;
  if (f < S5_B) cam = { cx: S5.lumi + ip(f, [0, S5_B], [-20, 10]), cy: ip(f, [0, S5_B], [1440, 1415], EASE), z: ip(f, [0, S5_B], [2.2, 2.6], EASE) };
  else if (f < FLY) cam = { cx: S5.draco + 20, cy: ip(f, [S5_B, FLY], [1560, 1540]), z: ip(f, [S5_B, FLY], [1.9, 2.05]) };
  else if (f < S5_D) {
    const t = ip(f, [FLY, 142], [0, 1], EASE);
    cam = { cx: lerp(S5.draco, 2350, t), cy: lerp(1540, 1020, t), z: lerp(2.05, 0.68, t) };
  } else {
    const t = ip(f, [S5_D, 240], [0, 1], EASE);
    cam = { cx: lerp(2350, 2550, t), cy: lerp(1020, 1017, t), z: lerp(0.68, 0.88, t) };
  }
  const spread = ip(f, [S5_B, S5_B + 16], [0.3, 1], EASE);
  const breath = ip(f, [BREATH, 90, FLY], [0, 1, 0.3], EASE);
  const eyesShut = f >= 74 && f < 88;
  const launch = f >= FLY && f < FLY + 10 ? ip(f, [FLY, FLY + 4, FLY + 10], [0.8, 1.12, 1]) : 1;
  const cheering = f >= FLY;
  const jump = (k: number) => (cheering ? Math.abs(Math.sin(f * 0.2 + k)) * 46 : 0);
  const dracoMood = f < S5_B ? "neutral" : f < 88 ? "neutral" : f < FLY ? "excited" : "joy";
  const sky = f >= S5_D;
  return (
    <Mtn cam={cam} g={g} drift={sky ? 1.2 : 0}>
      <Breeze f={f} x={cam.cx - 1200} y={cam.cy - 500} w={2400} h={1000} strength={ip(f, [0, 10, FLY, FLY + 20], [0, 1, 1, 0.4])} />
      {(
        <>
          <BoboRider
            g={g}
            x={S5.bobo}
            y={1776 - jump(0)}
            scale={0.78}
            look={cheering ? { x: -0.6, y: -1 } : { x: 1, y: -0.2 }}
            expr={cheering ? "happy" : "excited"}
            armL={cheering ? 145 + Math.sin(f * 0.4) * 10 : 30}
            armR={cheering ? -145 - Math.sin(f * 0.4) * 10 : -30}
            blink={blinkAt(g, 3)}
            riderArmsUp={cheering}
            riderHappy={cheering}
            riderLook={{ x: -0.5, y: -1 }}
          />
          <Lumi
            x={S5.lumi}
            y={1790 - jump(1.3)}
            scale={0.86}
            look={cheering ? { x: -0.6, y: -1 } : { x: 1, y: 0.05 }}
            expr={cheering ? "happy" : "excited"}
            mouth={mouthAt("lumi", g)}
            armL={cheering ? 140 + Math.sin(f * 0.35) * 10 : 46}
            armR={cheering ? -140 - Math.sin(f * 0.35) * 10 : -46}
            headTilt={cheering ? 0 : 5 + Math.sin(f / 8) * 3}
            blink={blinkAt(g, 1)}
          />
        </>
      )}
      {airborne && <Trail f={f} from={FLY} pos={flyPos} len={36} size={sky ? 18 : 30} colors={["#fff1a8", "#d9b8ff", "#ffffff", "#ff9ad5"]} />}
      <SparkBurst f={f} at={FLY} x={S5.draco} y={1700} reach={420} count={28} size={20} life={32} />
      <Draco
        x={p.x}
        y={p.y}
        scale={ip(f, [S5_D - 10, S5_D + 20], [0.9, 1.1], EASE)}
        g={g}
        mood={dracoMood}
        look={airborne ? { x: 0.5, y: -0.3 } : f < S5_B ? { x: -1, y: 0 } : { x: 0, y: -0.6 }}
        mouth={mouthAt("draco", g)}
        blink={eyesShut ? 0.08 : blinkAt(g, 5)}
        wing={airborne ? 1 : spread}
        flap={airborne ? Math.sin(f * (sky ? 0.42 : 0.8)) * 34 : f >= S5_B ? Math.sin(f / 4) * 5 : 0}
        breath={breath}
        squash={!airborne && f >= 88 ? ip(f, [88, FLY], [1, 0.84]) : launch}
        lean={airborne ? (sky ? 12 + Math.sin(f / 9) * 4 : -8) : 0}
        armsUp={airborne ? 0.7 : 0}
        glow={airborne ? 0.6 : 0.25}
      />
    </Mtn>
  );
};

// The series end card, larger and on a dark glowing panel so it reads on a phone
const BigEndCard: React.FC<{ at: number; top?: number }> = ({ at, top = 735 }) => {
  const f = useCurrentFrame();
  const panel = ip(f, [at, at + 14], [0, 1], EASE);
  const text = ip(f, [at + 4, at + 20], [0, 1], EASE);
  const sub = ip(f, [at + 10, at + 28], [0, 1], EASE);
  const shadow = "0 0 6px rgba(20, 12, 70, 1), 0 3px 10px rgba(20, 12, 70, 1), 0 0 28px rgba(20, 12, 70, 0.9)";
  return (
    <AbsoluteFill style={{ alignItems: "center", fontFamily }}>
      <div
        style={{
          position: "absolute",
          top,
          width: 960,
          height: 270,
          borderRadius: 60,
          background: "rgba(22, 16, 74, 0.78)",
          border: "5px solid rgba(255, 227, 138, 0.85)",
          boxShadow: "0 0 50px rgba(255, 211, 110, 0.45)",
          opacity: panel,
          transform: `scale(${0.9 + panel * 0.1})`,
        }}
      />
      <div style={{ position: "absolute", top: top + 34, fontSize: 92, fontWeight: 600, color: "#fff6dc", opacity: text, transform: `translateY(${(1 - text) * 20}px)`, textShadow: shadow, whiteSpace: "nowrap" }}>To Be Continued... ✨</div>
      <div style={{ position: "absolute", top: top + 158, fontSize: 64, fontWeight: 500, color: "#ffffff", opacity: sub, transform: `translateY(${(1 - sub) * 16}px)`, textShadow: shadow, whiteSpace: "nowrap" }}>Little Moon Story World 🌙</div>
    </AbsoluteFill>
  );
};

// ---------- Scene 6 (39-45s): together again, and a moonlit castle ----------
const S6 = { bobo: 1250, lumi: 1760, draco: 1500 };
const LAND6 = 18;
const STAR2 = 33; // 40.1s
const MAP = 48; // 40.6s
const MAP_C = { x: 1500, y: 660 };
const END_AT = 128;

const Scene6: React.FC = () => {
  const f = useCurrentFrame();
  const g = f + CUTS[5];
  const down = ip(f, [0, LAND6], [0, 1], Easing.out(Easing.quad));
  const dx = lerp(1700, S6.draco, down);
  const dy = lerp(1180, 1790, down);
  const landed = f >= LAND6;
  const squash = landed ? ip(f, [LAND6, LAND6 + 4, LAND6 + 14], [1, 0.82, 1]) : 1;
  const seen = f >= STAR2;
  const starScale = ip(f, [STAR2, STAR2 + 12], [0.2, 0.55], BACK(2));
  const starMove = ip(f, [MAP, MAP + 16], [0, 1], EASE);
  const star = { x: lerp(MAP_C.x, MAP_C.x + 300, starMove), y: lerp(MAP_C.y, MAP_C.y - 210, starMove) + Math.sin(g / 9) * 6 };
  const mapReveal = ip(f, [MAP, MAP + 20], [0, 1], OUT);
  const cam: CamView = { cx: S6.draco + ip(f, [0, 180], [-20, 20]), cy: ip(f, [0, 50], [1240, 1150], EASE), z: ip(f, [0, 180], [1.0, 1.05]) };
  const cheer = landed && !seen;
  const up = { x: 0, y: -1 };
  return (
    <>
      <Mtn cam={cam} g={g}>
        {seen && (
          <>
            <circle cx={star.x} cy={star.y} r={ip(f, [STAR2, STAR2 + 18], [100, 800], OUT)} fill="url(#flowerBurst)" opacity={ip(f, [STAR2, STAR2 + 22], [1, 0])} />
            <CastleMap x={MAP_C.x} y={MAP_C.y} s={0.9} g={g} reveal={mapReveal} />
            <GoldenClue x={star.x} y={star.y} scale={starScale * (1 - starMove * 0.45)} frame={g} />
            <SparkBurst f={f} at={STAR2} x={MAP_C.x} y={MAP_C.y} reach={480} count={30} size={20} life={32} />
            <SparkBurst f={f} at={MAP} x={MAP_C.x} y={MAP_C.y} reach={380} count={20} size={14} life={30} />
          </>
        )}
        <BoboRider
          g={g}
          x={S6.bobo}
          y={1776}
          scale={0.78}
          look={seen ? { x: 0.4, y: -1 } : { x: 1, y: -0.3 }}
          expr={seen ? "surprised" : "happy"}
          armL={cheer ? 140 : seen ? 40 : 20}
          armR={cheer ? -140 : seen ? -40 : -20}
          blink={seen ? 1 : blinkAt(g, 3)}
          riderArmsUp={cheer}
          riderLook={seen ? { x: 0.4, y: -1 } : { x: 1, y: 0 }}
        />
        <Lumi
          x={S6.lumi}
          y={1790}
          scale={0.86}
          look={seen ? { x: -0.4, y: -1 } : { x: -1, y: -0.2 }}
          expr={seen ? "surprised" : "happy"}
          armL={cheer ? 130 : seen ? 26 : 20}
          armR={cheer ? -130 : seen ? -26 : -20}
          headTilt={seen ? -3 : 0}
          blink={blinkAt(g, 1)}
        />
        <Draco
          x={dx}
          y={dy}
          scale={0.9}
          g={g}
          mood={seen ? "surprised" : "joy"}
          look={seen ? up : { x: 0, y: 0 }}
          blink={blinkAt(g, 5)}
          wing={landed ? ip(f, [LAND6, LAND6 + 20], [1, 0.45]) : 1}
          flap={landed ? Math.sin(f / 4) * (seen ? 4 : 10) : Math.sin(f * 0.8) * 30}
          squash={squash}
          armsUp={cheer ? 0.9 : seen ? 0.2 : 0.6}
          lean={landed ? 0 : -6}
          glow={0.4}
        />
      </Mtn>
      <BigEndCard at={END_AT} />
    </>
  );
};

export const Episode: React.FC = () => <EpisodeFrame audio="ep04/audio.wav" cuts={CUTS} scenes={[Scene1, Scene2, Scene3, Scene4, Scene5, Scene6]} />;
