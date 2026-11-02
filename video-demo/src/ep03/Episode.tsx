import React from "react";
import { AbsoluteFill, Audio, Easing, interpolate, Sequence, staticFile, useCurrentFrame } from "remotion";
import { loadLocalFont } from "../fonts";
import { blinkAt, Bobo, CharacterDefs, CharProps, Lumi } from "../story/characters";
import { SceneryDefs, Sparkle } from "../story/scenery";
import { GiantTree, GoldenKey, LittleDoor, MagicMap, PropDefs, TinySprite, Woods } from "../ep02/props";
import timeline from "./timeline.json";
import {
  Butterfly,
  ButterflyMood,
  DriftLights,
  Ep3Defs,
  FLOWER_HEART_Y,
  FrontBed,
  Gift,
  GiftOrb,
  GiftTracker,
  GoldenClue,
  Ladybug,
  MagicFlower,
  RAINBOW,
  RainbowTree,
  RainbowWorld,
  RestingBloom,
} from "./props";

const fontFamily = loadLocalFont("Fredoka", "fredoka.woff2");

// Scene boundaries in frames (30fps); XF is the crossfade overlap
const S = { s1: 0, s2: 180, s3: 390, s4: 630, s5: 930, s6: 1170, end: 1350 };
const XF = 12;
const EASE = Easing.inOut(Easing.cubic);
const OUT = Easing.out(Easing.cubic);

const ip = (f: number, input: number[], output: number[], easing?: (t: number) => number) =>
  interpolate(f, input, output, { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing });

const mouthAt = (who: "lumi" | "butterfly", g: number) => {
  const m = timeline.mouth[who];
  return ((m[g] ?? 0) + (m[g - 1] ?? 0)) / 2;
};

const Defs: React.FC = () => (
  <defs>
    <CharacterDefs />
    <SceneryDefs />
    <PropDefs />
    <Ep3Defs />
  </defs>
);

type CamView = { cx: number; cy: number; z: number };
const Cam: React.FC<CamView & { children: React.ReactNode }> = ({ cx, cy, z, children }) => (
  <g transform={`translate(540 960) scale(${z}) translate(${-cx} ${-cy})`}>{children}</g>
);
const toScreen = (c: CamView, x: number, y: number) => ({ x: (x - c.cx) * c.z + 540, y: (y - c.cy) * c.z + 960 });

// Before the rainbow returns the forest is washed out; `wave` is how far the color has spread back
const MUTED = "saturate(0.62) brightness(0.8)";
type Wave = { x: number; y: number; r: number };

const Forest: React.FC<{ cam: CamView; g: number; fadeIn?: boolean; wave?: Wave | "full"; arc?: number; soft?: boolean; children: React.ReactNode }> = ({ cam, g, fadeIn = true, wave, arc = 0, soft = false, children }) => {
  const f = useCurrentFrame();
  const blur = soft ? "blur(9px)" : "";
  const grow = soft ? "scale(1.04)" : undefined;
  return (
    <AbsoluteFill style={{ opacity: fadeIn ? ip(f, [0, XF], [0, 1]) : 1 }}>
      {wave !== "full" && (
        <AbsoluteFill style={{ filter: `${MUTED} ${blur}`, transform: grow }}>
          <svg viewBox="0 0 1080 1920" width={1080} height={1920}>
            <Defs />
            <Cam {...cam}>
              <RainbowWorld g={g} />
            </Cam>
          </svg>
        </AbsoluteFill>
      )}
      {wave && (
        <AbsoluteFill style={{ clipPath: wave === "full" ? undefined : `circle(${wave.r}px at ${wave.x}px ${wave.y}px)`, filter: blur || undefined, transform: grow }}>
          <svg viewBox="0 0 1080 1920" width={1080} height={1920}>
            <Defs />
            <Cam {...cam}>
              <RainbowWorld g={g} arc={arc} />
            </Cam>
          </svg>
        </AbsoluteFill>
      )}
      <AbsoluteFill>
        <svg viewBox="0 0 1080 1920" width={1080} height={1920}>
          <Defs />
          <Cam {...cam}>{children}</Cam>
        </svg>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

// Bobo with the tiny creature from Episode 2 still riding on his head
const BoboRider: React.FC<CharProps & { g: number; riderLook?: { x: number; y: number }; riderArmsUp?: boolean; riderHappy?: boolean }> = ({ g, riderLook = { x: 0, y: 0 }, riderArmsUp = false, riderHappy = false, ...p }) => {
  const bob = p.walk == null ? 0 : Math.abs(Math.cos(p.walk)) * 12;
  return (
    <>
      <Bobo {...p} />
      <g transform={`translate(${p.x} ${p.y}) scale(${p.scale ?? 1}) rotate(${p.lean ?? 0})`}>
        <TinySprite x={0} y={-404 - bob} scale={0.7} frame={g} look={riderLook} armsUp={riderArmsUp} happy={riderHappy} blink={blinkAt(g, 2)} />
      </g>
    </>
  );
};

const lumiHand = (x: number, y: number, scale: number, angle: number) => {
  const a = (angle * Math.PI) / 180;
  return { x: x + (84 - 128 * Math.sin(a)) * scale, y: y + (-290 + 128 * Math.cos(a)) * scale };
};
const boboHand = (x: number, y: number, scale: number, angle: number) => {
  const a = (angle * Math.PI) / 180;
  return { x: x + (86 - 94 * Math.sin(a)) * scale, y: y + (-196 + 94 * Math.cos(a)) * scale };
};

const SparkBurst: React.FC<{ f: number; at: number; x: number; y: number; reach?: number; count?: number; size?: number; life?: number; rainbow?: boolean }> = ({
  f,
  at,
  x,
  y,
  reach = 300,
  count = 22,
  size = 18,
  life = 34,
  rainbow = false,
}) => {
  if (f < at || f > at + life) return null;
  const d = ip(f, [at, at + life], [0, reach], OUT);
  return (
    <g>
      {Array.from({ length: count }, (_, i) => {
        const a = (i / count) * Math.PI * 2;
        const r = d * (0.65 + ((i * 37) % 10) / 20);
        return (
          <Sparkle
            key={i}
            x={x + Math.cos(a) * r}
            y={y + Math.sin(a) * r}
            size={size * (0.65 + (i % 3) * 0.3)}
            opacity={ip(f, [at + life * 0.45, at + life], [1, 0])}
            color={rainbow ? RAINBOW[i % 6] : i % 2 ? "#fff1a8" : "#aee8ff"}
            rotate={f * 3 + i * 25}
          />
        );
      })}
    </g>
  );
};

const RainbowTrail: React.FC<{ f: number; from: number; pos: (f: number) => { x: number; y: number }; len?: number; size?: number }> = ({ f, from, pos, len = 48, size = 28 }) => (
  <g>
    {Array.from({ length: len }, (_, k) => {
      const t = f - (k + 1) * 0.9;
      if (t < from) return null;
      const p = pos(t);
      return <Sparkle key={k} x={p.x + Math.sin(k * 2.3) * 13} y={p.y + Math.cos(k * 1.7) * 13} size={size * (1 - k / len)} opacity={1 - k / len} color={RAINBOW[k % 6]} rotate={k * 24 + f * 2} />;
    })}
  </g>
);

// A sparkling path along the ground; `head` is how far it has run
const SparkPath: React.FC<{ f: number; g: number; from: number; to: number; y: number; head: number }> = ({ f, g, from, to, y, head }) => (
  <g>
    {Array.from({ length: Math.ceil((to - from) / 34) }, (_, i) => {
      const x = from + i * 34;
      if (x > head) return null;
      const wave = 0.4 + 0.6 * Math.max(0, Math.sin(x / 90 - f * 0.26));
      return <Sparkle key={i} x={x} y={y + Math.sin(x / 120) * 13 + Math.sin(i * 1.3) * 6} size={8 + (i % 3) * 4} opacity={wave} color={RAINBOW[i % 6]} rotate={g * 2 + i * 20} />;
    })}
  </g>
);

// ---------- Scene 1: the map lights up and shows the way ----------
const S1_LUMI = { x: 930, y: 1790, s: 0.86 };
const S1_BOBO = { x: 1330, y: 1776, s: 0.78 };
const MAP_C = { x: 1120, y: 765 };

const Scene1: React.FC = () => {
  const f = useCurrentFrame();
  const g = f + S.s1;
  const FOLD = 104;
  const WALK = 122;
  const reveal = ip(f, [FOLD, FOLD + 14], [1, 0], EASE);
  const flare = ip(f, [0, 8, 40, 90], [1.25, 1, 0.55, 0.3]);
  const walking = f >= WALK;
  const walked = ip(f, [WALK, 192], [0, 420]);
  const lumiX = S1_LUMI.x + walked;
  const boboX = S1_BOBO.x + walked;
  const ARM = ip(f, [FOLD + 2, WALK - 2], [-82, -10], EASE);
  const hand = lumiHand(S1_LUMI.x, S1_LUMI.y, S1_LUMI.s, ARM);
  const keyAway = ip(f, [FOLD + 6, WALK], [0, 1], EASE);
  const chest = { x: S1_LUMI.x, y: S1_LUMI.y - 240 * S1_LUMI.s };
  const key = { x: hand.x + 2 + (chest.x - hand.x - 2) * keyAway, y: hand.y - 36 + (chest.y - hand.y + 36) * keyAway };
  const cam: CamView = {
    cx: 1120 + ip(f, [WALK - 6, 192], [0, 520], EASE),
    cy: ip(f, [0, 90, FOLD, WALK + 20], [1202, 1190, 1190, 1330], EASE),
    z: ip(f, [0, 90, FOLD, WALK + 20], [1.12, 1.17, 1.17, 1.05], EASE),
  };
  const pathHead = ip(f, [FOLD + 10, 180], [1000, 3200]);
  const excited = f >= 8;
  return (
    <AbsoluteFill>
      <svg viewBox="0 0 1080 1920" width={1080} height={1920}>
        <Defs />
        <Cam {...cam}>
          <Woods g={g} />
          <GiantTree x={1120} y={1700} g={g}>
            <LittleDoor open={1} glow={1} light={0.45} frame={g} />
          </GiantTree>
          {/* the rainbow forest shining in the distance */}
          {[
            [1880, 3, "#ff6b6b"],
            [1990, 3.6, "#ffd93d"],
            [2110, 3.1, "#6bdc7a"],
            [2230, 3.7, "#5e8bff"],
          ].map(([tx, ts, c], i) => (
            <RainbowTree key={i} x={tx as number} y={1650} s={ts as number} c={c as string} frame={g} seed={i} glow={0.45} />
          ))}
          <circle cx={2120} cy={1520} r={620} fill="url(#flowerBurst)" opacity={ip(f, [WALK, 180], [0, 0.55])} />
          {f >= FOLD && <SparkPath f={f} g={g} from={1000} to={3200} y={1840} head={pathHead} />}
          {reveal > 0 && (
            <path d={`M ${key.x - 16} ${key.y} L ${MAP_C.x - 330} ${MAP_C.y + 280} L ${MAP_C.x + 330} ${MAP_C.y + 280} L ${key.x + 16} ${key.y} Z`} fill="url(#mapBeam)" opacity={reveal * (0.55 + Math.sin(g / 5) * 0.08)} />
          )}
          <g transform={`translate(${MAP_C.x} ${MAP_C.y + Math.sin(g / 24) * 7})`}>
            <MagicMap frame={g} reveal={reveal} pathOn={1} forestOn={1} />
            {/* the forest on the map flares up: the opening hook */}
            {reveal > 0 && (
              <g transform="translate(190 -130)" opacity={reveal}>
                <circle r={330} fill="url(#flowerBurst)" opacity={flare * 0.85} />
                {f < 36 && <circle r={ip(f, [0, 36], [70, 560], OUT)} fill="none" stroke="#fff4b8" strokeWidth={10} opacity={ip(f, [0, 36], [0.95, 0])} />}
                {[0, 1, 2].map((k) => {
                  const at = 2 + k * 11;
                  return f >= at && f < at + 34 ? (
                    <circle key={k} r={ip(f, [at, at + 34], [50, 520], OUT)} fill="none" stroke={RAINBOW[k * 2]} strokeWidth={14} opacity={ip(f, [at, at + 34], [0.85, 0])} />
                  ) : null;
                })}
              </g>
            )}
          </g>
          <SparkBurst f={f} at={0} x={MAP_C.x + 190} y={MAP_C.y - 130} reach={520} count={30} size={22} life={34} rainbow />
          <SparkBurst f={f} at={WALK - 2} x={chest.x} y={chest.y} reach={130} count={12} size={10} life={22} />
          <BoboRider
            g={g}
            x={boboX}
            y={S1_BOBO.y}
            scale={S1_BOBO.s}
            look={walking ? { x: 1, y: 0 } : { x: -0.35, y: -1 }}
            expr={walking ? "happy" : "excited"}
            walk={walking ? f * 0.45 : null}
            armL={walking ? 14 : 40}
            armR={walking ? -14 : -40}
            blink={blinkAt(g, 3)}
            riderLook={{ x: walking ? 1 : -0.35, y: walking ? 0 : -1 }}
          />
          <Lumi
            x={lumiX}
            y={S1_LUMI.y}
            scale={S1_LUMI.s}
            look={walking ? { x: 1, y: 0 } : f >= 26 && f < 54 ? { x: 1, y: 0 } : { x: 0.45, y: -1 }}
            expr={walking ? "happy" : excited ? "happy" : "surprised"}
            mouth={mouthAt("lumi", g)}
            armR={walking ? -10 : ARM}
            armL={walking ? 8 : 26}
            walk={walking ? f * 0.4 : null}
            headTilt={walking ? 0 : 4 + Math.sin(f / 10) * 2}
            blink={blinkAt(g, 1)}
          />
          {keyAway < 1 && <GoldenKey x={key.x} y={key.y} scale={0.95 * (1 - keyAway * 0.7)} rotate={10} glow={1.2 - keyAway} />}
        </Cam>
      </svg>
    </AbsoluteFill>
  );
};

// ---------- Scene 2: the colorless butterfly ----------
const BLOOM = { x: 1040, y: 1790 };
const PERCH = { x: BLOOM.x, y: BLOOM.y - 278 };
const LUMI_K = { x: 770, s: 0.86 };
const BOBO_K = { x: 1250, y: 1776, s: 0.78 };

const Scene2: React.FC = () => {
  const f = useCurrentFrame();
  const g = f + S.s2;
  const CUT = 66;
  const CLOSE = 150;
  if (f < CUT) {
    const lumiX = ip(f, [0, CUT], [270, 660]);
    const boboX = lumiX + 300;
    const cam: CamView = { cx: ip(f, [0, CUT], [520, 930]), cy: ip(f, [0, CUT], [1290, 1320]), z: ip(f, [0, CUT], [1, 1.1], EASE) };
    return (
      <Forest cam={cam} g={g}>
        <SparkPath f={f} g={g} from={-100} to={1300} y={1850} head={1300} />
        <DriftLights frame={g} x={0} y={700} w={1800} h={800} count={18} />
        <RestingBloom x={BLOOM.x + 300} y={BLOOM.y} frame={g} />
        <Butterfly x={PERCH.x + 300} y={PERCH.y} scale={0.55} frame={g} mood="sad" droop={1} flapRate={0.12} blink={blinkAt(g, 4)} />
        <BoboRider g={g} x={boboX} y={1776} scale={0.78} look={{ x: 1, y: 0.1 }} expr="happy" walk={f * 0.45} blink={blinkAt(g, 3)} riderLook={{ x: 1, y: 0 }} />
        <Lumi x={lumiX} y={1790} scale={0.86} look={{ x: 1, y: 0.2 }} expr={f > 44 ? "surprised" : "happy"} walk={f * 0.4} blink={blinkAt(g, 1)} />
      </Forest>
    );
  }
  if (f < CLOSE) {
    const kneel = ip(f, [CUT + 4, CUT + 26], [0, 1], EASE);
    const cam: CamView = { cx: ip(f, [CUT, CLOSE], [1000, 985]), cy: ip(f, [CUT, CLOSE], [1440, 1470]), z: ip(f, [CUT, CLOSE], [1.34, 1.45], EASE) };
    return (
      <Forest cam={cam} g={g} fadeIn={false}>
        <RestingBloom x={BLOOM.x} y={BLOOM.y} frame={g} />
        <BoboRider g={g} x={BOBO_K.x} y={BOBO_K.y} scale={BOBO_K.s} look={{ x: -1, y: 0.35 }} expr="neutral" armL={18} blink={blinkAt(g, 3)} riderLook={{ x: -1, y: 0.4 }} />
        <Butterfly x={PERCH.x} y={PERCH.y} scale={0.55} frame={g} mood="sad" droop={1} flapRate={0.12} look={{ x: -0.7, y: 0 }} blink={blinkAt(g, 4)} rotate={Math.sin(g / 22) * 2} />
        <Lumi
          x={LUMI_K.x}
          y={1790 + kneel * 118}
          scale={LUMI_K.s}
          look={{ x: 1, y: 0.25 }}
          expr="neutral"
          mouth={mouthAt("lumi", g)}
          lean={kneel * 4}
          armR={-8 - kneel * 34}
          armL={12}
          headTilt={4 + Math.sin(f / 15) * 2}
          blink={blinkAt(g, 1)}
        />
        <FrontBed x={LUMI_K.x + 200} y={1716} width={1900} g={g} />
      </Forest>
    );
  }
  // close on the butterfly: "I've lost all my colors!"
  const cam: CamView = { cx: PERCH.x, cy: ip(f, [CLOSE, 222], [PERCH.y - 4, PERCH.y - 18]), z: ip(f, [CLOSE, 222], [3.3, 3.75]) };
  return (
    <Forest cam={cam} g={g} fadeIn={false} soft>
      <RestingBloom x={BLOOM.x} y={BLOOM.y} frame={g} />
      <Butterfly x={PERCH.x} y={PERCH.y} scale={0.55} frame={g} mood="sad" droop={1} flapRate={0.14} mouth={mouthAt("butterfly", g)} look={{ x: -0.4, y: 0.2 }} blink={blinkAt(g, 4)} rotate={Math.sin(g / 18) * 2.5} />
      {/* one little tear */}
      {f >= 178 && <ellipse cx={PERCH.x + 16} cy={PERCH.y - 8 + ip(f, [178, 212], [0, 34])} rx={3.2} ry={4.6} fill="#a8e0ff" opacity={ip(f, [178, 186, 205, 214], [0, 1, 1, 0])} />}
    </Forest>
  );
};

// ---------- Scene 3: the mystery ----------
const MF = { x: 2005, y: 1760, s: 1.1 };
const HEART = { x: MF.x, y: MF.y + FLOWER_HEART_Y * MF.s };

const Scene3: React.FC = () => {
  const f = useCurrentFrame();
  const g = f + S.s3;
  const FLOWER_SHOT = 76;
  const BACK = 168;
  if (f < FLOWER_SHOT) {
    const tilt = ip(f, [18, 62], [0, 1], EASE);
    const cam: CamView = { cx: ip(tilt, [0, 1], [1180, 1200]), cy: ip(tilt, [0, 1], [1480, 1050]), z: ip(tilt, [0, 1], [1.6, 1.1]) };
    const noticed = f >= 8;
    return (
      <Forest cam={cam} g={g} fadeIn>
        <RestingBloom x={BLOOM.x} y={BLOOM.y} frame={g} />
        <DriftLights frame={g} x={760} y={480} w={1000} h={900} count={30} size={1.25} />
        <BoboRider
          g={g}
          x={BOBO_K.x}
          y={BOBO_K.y}
          scale={BOBO_K.s}
          look={noticed ? { x: -0.25, y: -1 } : { x: -1, y: 0.35 }}
          expr={noticed ? "excited" : "neutral"}
          armR={ip(f, [10, 24], [-14, -150], EASE)}
          armL={ip(f, [10, 24], [14, 30], EASE)}
          headTilt={noticed ? -5 : 0}
          blink={blinkAt(g, 3)}
          riderLook={{ x: -0.25, y: -1 }}
          riderArmsUp={noticed}
        />
        <Butterfly x={PERCH.x} y={PERCH.y} scale={0.55} frame={g} mood="talk" droop={0.8} flapRate={0.2} mouth={mouthAt("butterfly", g)} look={{ x: 0.7, y: -0.5 }} blink={blinkAt(g, 4)} />
      </Forest>
    );
  }
  if (f < BACK) {
    // the magical flower: faded petals, a dark center
    const k = f - FLOWER_SHOT;
    const cam: CamView = { cx: MF.x, cy: ip(k, [0, 92], [1420, 1310], EASE), z: ip(k, [0, 92], [1.05, 1.6], EASE) };
    const bx = ip(k, [0, 70], [1610, 1790], EASE);
    const by = HEART.y + 100 + Math.sin(k / 8) * 22;
    return (
      <Forest cam={cam} g={g} fadeIn={false}>
        <DriftLights frame={g} x={1500} y={700} w={1000} h={800} count={14} />
        <MagicFlower x={MF.x} y={MF.y} scale={MF.s} life={0} frame={g} />
        <Butterfly x={bx} y={by} scale={0.46} frame={g} mood="talk" flapRate={0.34} droop={0.5} mouth={mouthAt("butterfly", g)} look={{ x: 0.9, y: -0.4 }} rotate={8} blink={blinkAt(g, 4)} />
      </Forest>
    );
  }
  // "Let's help you!"
  const rise = ip(f, [BACK + 2, BACK + 24], [1, 0], EASE);
  const cam: CamView = { cx: 985, cy: ip(f, [BACK, 240], [1460, 1400]), z: ip(f, [BACK, 240], [1.45, 1.35], EASE) };
  const pump = f >= 182 ? Math.sin((f - 182) * 0.42) * 10 : 0;
  const by = PERCH.y - 22 + Math.sin(g / 7) * 12 - ip(f, [BACK + 20, 200], [0, 50], EASE);
  return (
    <Forest cam={cam} g={g} fadeIn={false}>
      <RestingBloom x={BLOOM.x} y={BLOOM.y} frame={g} />
      <BoboRider
        g={g}
        x={BOBO_K.x}
        y={BOBO_K.y - (f >= 192 ? Math.abs(Math.sin((f - 192) * 0.22)) * 26 : 0)}
        scale={BOBO_K.s}
        look={{ x: -1, y: -0.1 }}
        expr={f >= 186 ? "happy" : "neutral"}
        armL={f >= 192 ? 118 : 18}
        armR={f >= 192 ? -118 : -14}
        blink={blinkAt(g, 3)}
        riderHappy={f >= 186}
        riderLook={{ x: -1, y: 0 }}
      />
      <Butterfly x={PERCH.x} y={by} scale={0.55} frame={g} mood={f >= 200 ? "surprised" : "sad"} droop={ip(f, [BACK + 20, 205], [0.9, 0.2])} flapRate={ip(f, [BACK, 205], [0.2, 0.55])} look={{ x: -0.85, y: -0.1 }} blink={blinkAt(g, 4)} />
      <Lumi
        x={LUMI_K.x}
        y={1790 + rise * 118}
        scale={LUMI_K.s}
        look={{ x: 1, y: -0.15 }}
        expr={f >= 176 ? "happy" : "neutral"}
        mouth={mouthAt("lumi", g)}
        armR={ip(f, [BACK + 6, 182], [-30, -140], EASE) + pump}
        armL={12}
        headTilt={3}
        blink={blinkAt(g, 1)}
      />
      <FrontBed x={LUMI_K.x + 200} y={1716} width={1900} g={g} />
    </Forest>
  );
};

// ---------- Scene 4: the rescue. Three gifts for the flower ----------
const LUMI_F = { x: 1720, y: 1790, s: 0.86 };
const BOBO_F = { x: 2290, y: 1776, s: 0.78 };
const HOVER = { x: 2005, y: 1078 };
const S4 = { dewCatch: 52, dewOrb: 72, ladybug: 100, safe: 178, smile: 190, smiled: 215, smileOrb: 225, wide: 252, end: 300 };

const Scene4: React.FC = () => {
  const f = useCurrentFrame();
  const g = f + S.s4;
  const filled: Record<Gift, number> = {
    dew: ip(f, [S4.dewOrb, S4.dewOrb + 12], [0, 1], OUT),
    kind: ip(f, [S4.safe, S4.safe + 12], [0, 1], OUT),
    smile: ip(f, [S4.smileOrb, S4.smileOrb + 12], [0, 1], OUT),
  };
  const tracker = ip(f, [6, 22], [0, 1], EASE) * ip(f, [S4.wide - 2, S4.wide + 16], [1, 0], EASE);
  let shot: React.ReactNode;

  if (f < S4.ladybug) {
    // a sparkling drop of morning dew
    const LX = 1400;
    const LS = 0.86;
    const arm = ip(f, [8, 34], [-8, -65], EASE);
    const hand = lumiHand(LX, 1790, LS, -65);
    const tip = { x: hand.x, y: hand.y - 92 };
    const fall = ip(f, [40, S4.dewCatch], [0, 1], Easing.in(Easing.quad));
    const swell = ip(f, [0, 38], [0.6, 1.1]);
    const caught = f >= S4.dewCatch;
    const rise = ip(f, [S4.dewCatch + 6, 96], [0, 1], EASE);
    const drop = { x: hand.x, y: tip.y + 14 + (hand.y - 20 - tip.y - 14) * fall };
    const orb = { x: hand.x + rise * 90, y: hand.y - 44 - rise * 340 };
    const cam: CamView = { cx: ip(f, [0, 100], [1480, 1505]), cy: ip(f, [0, 100], [1500, 1470]), z: ip(f, [0, 100], [1.75, 2.15], EASE) };
    shot = (
      <Forest cam={cam} g={g} fadeIn={true} soft>
        {/* the big dewy leaf */}
        <path d={`M ${hand.x + 170} 1800 Q ${hand.x + 180} ${tip.y - 40} ${hand.x + 90} ${tip.y - 58}`} stroke="#2f8f6a" strokeWidth={15} fill="none" strokeLinecap="round" />
        <path d={`M ${hand.x + 140} ${tip.y - 60} Q ${hand.x + 60} ${tip.y - 104} ${tip.x} ${tip.y} Q ${hand.x + 80} ${tip.y + 12} ${hand.x + 140} ${tip.y - 60} Z`} fill="#4cc58a" stroke="#2f7f62" strokeWidth={4} />
        <path d={`M ${hand.x + 138} ${tip.y - 58} Q ${hand.x + 70} ${tip.y - 50} ${tip.x + 8} ${tip.y - 3}`} stroke="#2f7f62" strokeWidth={3} fill="none" />
        <Lumi
          x={LX}
          y={1790}
          scale={LS}
          look={f < S4.dewCatch + 6 ? { x: 1, y: f >= 40 ? 0.2 : -0.1 } : { x: 0.9, y: -0.6 }}
          expr={caught ? "happy" : "surprised"}
          armR={arm}
          armL={12}
          headTilt={4}
          blink={blinkAt(g, 1)}
        />
        {!caught && (
          <g transform={`translate(${drop.x} ${drop.y}) scale(${swell})`}>
            <circle r={36} fill="url(#softGlow)" opacity={0.7} />
            <path d="M 0 -16 C 8 -6 13 0 13 7 A 13 13 0 0 1 -13 7 C -13 0 -8 -6 0 -16 Z" fill="#a8ecff" stroke="#fff" strokeWidth={2} />
          </g>
        )}
        <SparkBurst f={f} at={S4.dewCatch} x={hand.x} y={hand.y - 22} reach={120} count={16} size={9} life={24} />
        {caught && <GiftOrb x={orb.x} y={orb.y} type="dew" scale={ip(f, [S4.dewCatch, S4.dewCatch + 12], [0.15, 0.62], OUT)} opacity={ip(f, [88, 98], [1, 0])} frame={g} />}
      </Forest>
    );
  } else if (f < S4.smile) {
    // a little act of kindness
    const k = f - S4.ladybug;
    const BX = 2460;
    const BS = 0.78;
    const lift = ip(k, [34, 62], [0, 1], EASE);
    const reach = ip(k, [10, 30], [0, 1], EASE);
    const arm = reach < 1 ? ip(reach, [0, 1], [-14, -28]) : ip(lift, [0, 1], [-28, -82]);
    const by = 1868 - lift * 70;
    const hand = boboHand(BX, by, BS, arm);
    const leaf = { x: boboHand(BX, 1798, BS, -82).x + 28, y: boboHand(BX, 1798, BS, -82).y - 8 };
    const bug = { x: hand.x, y: hand.y - 26 };
    const ground = { x: boboHand(BX, 1868, BS, -28).x, y: boboHand(BX, 1868, BS, -28).y - 22 };
    const onLeaf = lift >= 1;
    const walkOn = ip(k, [64, 88], [0, 20]);
    const cam: CamView = { cx: ip(k, [0, 90], [2510, 2535]), cy: ip(k, [0, 90], [1590, 1550]), z: ip(k, [0, 90], [1.72, 2.05], EASE) };
    shot = (
      <Forest cam={cam} g={g} fadeIn={false} soft>
        <path d={`M ${leaf.x + 110} 1880 Q ${leaf.x + 104} ${leaf.y + 70} ${leaf.x + 76} ${leaf.y + 2}`} stroke="#2f8f6a" strokeWidth={13} fill="none" strokeLinecap="round" />
        <path d={`M ${leaf.x + 90} ${leaf.y + 8} Q ${leaf.x + 10} ${leaf.y - 30} ${leaf.x - 58} ${leaf.y + 5} Q ${leaf.x + 10} ${leaf.y + 36} ${leaf.x + 90} ${leaf.y + 8} Z`} fill="#4cc58a" stroke="#2f7f62" strokeWidth={4} />
        <BoboRider
          g={g}
          x={BX}
          y={by}
          scale={BS}
          look={onLeaf ? { x: 1, y: 0.1 } : { x: 1, y: 0.8 }}
          expr={onLeaf ? "happy" : "neutral"}
          armR={arm}
          armL={14}
          headTilt={onLeaf ? 3 : 6}
          blink={blinkAt(g, 3)}
          riderLook={{ x: 1, y: 0.7 }}
          riderHappy={onLeaf}
        />
        {!onLeaf && k < 34 ? (
          <Ladybug x={ground.x} y={ground.y + 14} scale={0.72} frame={g} onBack />
        ) : onLeaf ? (
          <Ladybug x={leaf.x - walkOn} y={leaf.y - 20} scale={0.72} frame={g} happy />
        ) : (
          <Ladybug x={bug.x} y={bug.y} scale={0.72} frame={g} rotate={ip(lift, [0, 0.5], [0, -10])} />
        )}
        <SparkBurst f={k} at={78} x={leaf.x} y={leaf.y - 20} reach={110} count={12} size={8} life={18} />
        <FrontBed x={BX} y={1824} width={1900} g={g} />
      </Forest>
    );
  } else if (f < S4.wide) {
    // and a friendly smile
    const LX = 1400;
    const smiled = f >= S4.smiled;
    const cam: CamView = { cx: ip(f, [S4.smile, S4.wide], [1450, 1480]), cy: ip(f, [S4.smile, S4.wide], [1450, 1430]), z: ip(f, [S4.smile, S4.wide], [2, 2.3]) };
    const bx = 1610 + Math.sin(g / 16) * 7;
    const by = 1440 + Math.sin(g / 8) * 10;
    const orb = ip(f, [S4.smiled + 2, S4.wide], [0, 1], EASE);
    shot = (
      <Forest cam={cam} g={g} fadeIn={false} soft>
        <Lumi x={LX} y={1790} scale={0.86} look={{ x: 1, y: 0.1 }} expr="happy" armL={12} armR={-22} headTilt={5} blink={blinkAt(g, 1)} />
        <Butterfly x={bx} y={by} scale={0.48} frame={g} mood={smiled ? "happy" : "sad"} droop={smiled ? 0 : 0.5} flapRate={smiled ? 0.6 : 0.3} look={{ x: -1, y: 0 }} blink={blinkAt(g, 4)} />
        <SparkBurst f={f} at={S4.smiled} x={bx} y={by - 16} reach={140} count={16} size={9} life={22} />
        {smiled && <GiftOrb x={bx + orb * 30} y={by - 90 - orb * 240} type="smile" scale={ip(f, [S4.smiled, S4.smiled + 12], [0.15, 0.5], OUT)} opacity={ip(f, [240, 250], [1, 0])} frame={g} />}
      </Forest>
    );
  } else {
    // the gifts spiral in around the flower
    const k = f - S4.wide;
    const n = S4.end - S4.wide;
    const t = k / n;
    const cam: CamView = { cx: 2005, cy: ip(k, [0, n], [1370, 1360]), z: ip(k, [0, n], [1.1, 1], EASE) };
    const radius = ip(t, [0, 0.55, 1], [520, 300, 0], EASE);
    const angle = t * Math.PI * 3.4;
    const gifts: Gift[] = ["dew", "kind", "smile"];
    shot = (
      <Forest cam={cam} g={g} fadeIn={true}>
        <DriftLights frame={g} x={1460} y={650} w={1100} h={900} count={14} />
        <MagicFlower x={MF.x} y={MF.y} scale={MF.s} life={ip(t, [0.5, 1], [0, 0.22])} frame={g} />
        <Butterfly x={HOVER.x} y={HOVER.y + Math.sin(g / 8) * 8} scale={0.5} frame={g} mood="happy" flapRate={0.7} look={{ x: 0, y: 1 }} blink={blinkAt(g, 4)} />
        {gifts.map((type, i) => {
          const a = angle + (i / 3) * Math.PI * 2;
          return <GiftOrb key={type} x={HEART.x + Math.cos(a) * radius} y={HEART.y + Math.sin(a) * radius * 0.82} type={type} scale={ip(t, [0, 0.85, 1], [0.72, 0.62, 0.15])} frame={g} />;
        })}
        <BoboRider g={g} x={BOBO_F.x} y={BOBO_F.y} scale={BOBO_F.s} look={{ x: -1, y: -0.3 }} expr="excited" armL={36} armR={-20} blink={blinkAt(g, 3)} riderLook={{ x: -1, y: -0.3 }} />
        <Lumi x={LUMI_F.x} y={LUMI_F.y} scale={LUMI_F.s} look={{ x: 1, y: -0.35 }} expr="surprised" armL={18} armR={-30} blink={blinkAt(g, 1)} />
      </Forest>
    );
  }
  return (
    <>
      {shot}
      <AbsoluteFill>
        <svg viewBox="0 0 1080 1920" width={1080} height={1920}>
          <Defs />
          <GiftTracker frame={g} filled={filled} opacity={tracker} />
        </svg>
      </AbsoluteFill>
    </>
  );
};

// ---------- Scene 5: the rainbow returns ----------
const FILL_AT = 40;
const FILL_END = 72;
const ORBIT_AT = 112;

const orbitPos = (f: number) => {
  const t = (f - ORBIT_AT) / 48;
  return { x: 2005 + Math.cos(t * Math.PI * 2 + Math.PI / 2) * 450, y: 1440 + Math.sin(t * Math.PI * 2 + Math.PI / 2) * 180 + Math.sin(f / 5) * 18 };
};

const Scene5: React.FC = () => {
  const f = useCurrentFrame();
  const g = f + S.s5;
  const life = ip(f, [0, 18], [0.22, 1], Easing.out(Easing.back(1.3)));
  const shake = f < 20 ? Math.sin(f * 2.2) * (20 - f) * 0.7 : 0;
  if (f < FILL_AT) {
    // the wave leaves the heart of the flower and rolls over the whole forest
    const cam: CamView = { cx: 2005 + shake, cy: 1360 + shake * 0.6, z: ip(f, [0, FILL_AT], [1, 0.92], OUT) };
    const c = toScreen(cam, HEART.x, HEART.y);
    const r = ip(f, [2, 34], [0, 2300], Easing.in(Easing.quad));
    return (
      <>
        <Forest cam={cam} g={g} fadeIn={false} wave={{ x: c.x, y: c.y, r }} arc={ip(f, [18, 40], [0, 0.35])}>
          <MagicFlower x={MF.x} y={MF.y} scale={MF.s} life={life} frame={g} />
          <circle cx={HEART.x} cy={HEART.y} r={ip(f, [0, 14], [90, 900], OUT)} fill="url(#flowerBurst)" opacity={ip(f, [0, 6, 36], [1, 1, 0])} />
          <Butterfly x={HOVER.x} y={HOVER.y + Math.sin(g / 8) * 8} scale={0.5} frame={g} mood="surprised" flapRate={0.8} look={{ x: 0, y: 1 }} />
          <BoboRider g={g} x={BOBO_F.x} y={BOBO_F.y} scale={BOBO_F.s} look={{ x: -1, y: -0.3 }} expr="excited" armL={ip(f, [2, 12], [36, 150])} armR={ip(f, [2, 12], [-20, -150])} blink={blinkAt(g, 3)} riderArmsUp riderLook={{ x: -1, y: -0.3 }} />
          <Lumi x={LUMI_F.x} y={LUMI_F.y} scale={LUMI_F.s} look={{ x: 1, y: -0.35 }} expr="surprised" armL={ip(f, [2, 12], [18, 120])} armR={ip(f, [2, 12], [-30, -120])} blink={blinkAt(g, 1)} />
          <SparkBurst f={f} at={0} x={HEART.x} y={HEART.y} reach={760} count={44} size={26} life={36} rainbow />
        </Forest>
        <AbsoluteFill>
          <svg viewBox="0 0 1080 1920" width={1080} height={1920}>
            {r > 0 &&
              RAINBOW.map((rc, i) => (
                <circle key={rc} cx={c.x} cy={c.y} r={Math.max(1, r - i * 52)} fill="none" stroke={rc} strokeWidth={54} opacity={ip(f, [26, 36], [0.95, 0])} />
              ))}
          </svg>
        </AbsoluteFill>
      </>
    );
  }
  if (f < ORBIT_AT) {
    // close on the wings as the colors come back, one band at a time
    const color = ip(f, [FILL_AT, FILL_END], [0, 1]);
    const cam: CamView = { cx: HOVER.x, cy: ip(f, [FILL_AT, ORBIT_AT], [HOVER.y - 6, HOVER.y - 16]), z: ip(f, [FILL_AT, ORBIT_AT], [3, 3.4]) };
    return (
      <Forest cam={cam} g={g} fadeIn={false} wave="full" arc={0.6} soft>
        <Butterfly x={HOVER.x} y={HOVER.y + Math.sin(g / 8) * 6} scale={0.5} frame={g} color={color} mood={f >= FILL_END - 4 ? "happy" : "surprised"} flapRate={0.5 + color * 0.28} mouth={mouthAt("butterfly", g)} blink={blinkAt(g, 4)} />
        <SparkBurst f={f} at={FILL_END - 4} x={HOVER.x} y={HOVER.y} reach={240} count={24} size={14} life={30} rainbow />
        {Array.from({ length: 14 }, (_, i) => {
          const t = (f - FILL_AT + i * 9) % 60;
          return <Sparkle key={i} x={HOVER.x - 170 + ((i * 89) % 340)} y={HOVER.y + 150 - t * 5} size={6 + (i % 3) * 3} opacity={ip(t, [0, 10, 60], [0, 1, 0])} color={RAINBOW[i % 6]} rotate={g * 2 + i * 30} />;
        })}
      </Forest>
    );
  }
  // happily around them both
  const p = orbitPos(f);
  const behind = Math.sin((((f - ORBIT_AT) / 48) * Math.PI * 2 + Math.PI / 2)) < 0;
  const dir = -Math.sin(((f - ORBIT_AT) / 48) * Math.PI * 2 + Math.PI / 2);
  const cam: CamView = { cx: ip(f, [ORBIT_AT, 144, 200], [2005, 1960, 1940], EASE), cy: ip(f, [ORBIT_AT, 240], [1370, 1395]), z: ip(f, [ORBIT_AT, 144, 200], [1, 1.1, 1.18], EASE) };
  const bf = <Butterfly x={p.x} y={p.y} scale={0.42} frame={g} color={1} mood={mouthAt("butterfly", g) > 0.06 ? "talk" : "happy"} flapRate={1.05} mouth={mouthAt("butterfly", g)} rotate={dir * 16} blink={blinkAt(g, 4)} />;
  const jump = Math.abs(Math.sin(f * 0.17)) * 30;
  return (
    <Forest cam={cam} g={g} fadeIn wave="full" arc={1}>
      <DriftLights frame={g} x={1420} y={560} w={1200} h={900} count={18} />
      <MagicFlower x={MF.x} y={MF.y} scale={MF.s} life={1} frame={g} />
      {behind && (
        <>
          <RainbowTrail f={f} from={ORBIT_AT} pos={orbitPos} />
          {bf}
        </>
      )}
      <BoboRider g={g} x={BOBO_F.x} y={BOBO_F.y - jump} scale={BOBO_F.s} look={{ x: -0.6, y: -0.4 }} expr="happy" armL={140 + Math.sin(f * 0.34) * 8} armR={-140 - Math.sin(f * 0.34) * 8} blink={blinkAt(g, 3)} riderArmsUp riderHappy />
      <Lumi x={LUMI_F.x} y={LUMI_F.y - (f < 144 ? jump * 0.7 : 0)} scale={LUMI_F.s} look={{ x: 0.5, y: -0.15 }} expr="happy" mouth={mouthAt("lumi", g)} armL={120 + Math.sin(f * 0.3) * 7} armR={-120 - Math.sin(f * 0.3) * 7} headTilt={Math.sin(f / 9) * 3} blink={blinkAt(g, 1)} />
      {!behind && (
        <>
          <RainbowTrail f={f} from={ORBIT_AT} pos={orbitPos} />
          {bf}
        </>
      )}
    </Forest>
  );
};

// ---------- Scene 6: the next clue ----------
const CLUE = { x: 2005, y: 770 };
const RING_R = 235;
const RING_END = 50;
const SHRINK_END = 78;

const Scene6: React.FC = () => {
  const f = useCurrentFrame();
  const g = f + S.s6;
  const TEXT = 66 + 66; // 43.4s
  const cam: CamView = { cx: 2005, cy: ip(f, [0, 40], [1300, 1240], EASE), z: ip(f, [0, 40], [1.05, 1.12], EASE) };
  const ringT = ip(f, [0, RING_END], [0, 1]);
  const angleAt = (t: number) => -Math.PI / 2 + t * Math.PI * 2;
  const ringPos = (fr: number) => {
    const a = angleAt(Math.min(1, Math.max(0, fr) / RING_END));
    return { x: CLUE.x + Math.cos(a) * RING_R, y: CLUE.y + Math.sin(a) * RING_R };
  };
  const away = ip(f, [RING_END, RING_END + 22], [0, 1], EASE);
  const hoverAt = { x: CLUE.x + 320, y: CLUE.y - 12 };
  const onRing = ringPos(f);
  const butterfly = { x: onRing.x + (hoverAt.x - onRing.x) * away, y: onRing.y + (hoverAt.y - onRing.y) * away + Math.sin(g / 8) * 9 };
  const heading = angleAt(ringT) * (180 / Math.PI) + 90;
  const shrink = ip(f, [RING_END + 4, SHRINK_END], [1, 0], Easing.in(Easing.cubic));
  const star = f >= SHRINK_END;
  const pop = ip(f, [SHRINK_END, SHRINK_END + 12], [0.2, 1], Easing.out(Easing.back(1.8)));
  const noticed = f >= SHRINK_END - 2;
  const hop = noticed && f < SHRINK_END + 18 ? Math.sin(((f - SHRINK_END + 2) / 20) * Math.PI) * 54 : 0;
  const text = ip(f, [TEXT, TEXT + 16], [0, 1], EASE);
  const sub = ip(f, [TEXT + 8, TEXT + 26], [0, 1], EASE);
  const circ = 2 * Math.PI * RING_R;
  const shadow = "0 0 8px rgba(30, 20, 90, 1), 0 3px 12px rgba(30, 20, 90, 1), 0 0 34px rgba(30, 20, 90, 0.9)";
  return (
    <>
      <Forest cam={cam} g={g} fadeIn wave="full" arc={1}>
        <MagicFlower x={MF.x} y={MF.y} scale={MF.s} life={1} frame={g} />
        {/* the rainbow circle it draws in the air */}
        {shrink > 0 && (
          <g transform={`translate(${CLUE.x} ${CLUE.y}) scale(${shrink}) rotate(-90)`} opacity={f > RING_END ? 0.6 + 0.4 * shrink : 1}>
            <circle r={RING_R + 30} fill="none" stroke="#fff" strokeWidth={84} opacity={0.22 * ringT} />
            {RAINBOW.map((c, i) => (
              <circle key={c} r={RING_R + 35 - i * 14} fill="none" stroke={c} strokeWidth={15} strokeLinecap="round" strokeDasharray={`${ringT * circ * ((RING_R + 35 - i * 14) / RING_R)} ${circ * 2}`} />
            ))}
          </g>
        )}
        {f >= RING_END - 2 && !star && <circle cx={CLUE.x} cy={CLUE.y} r={ip(f, [RING_END, SHRINK_END], [30, 170])} fill="url(#flowerBurst)" opacity={ip(f, [RING_END, SHRINK_END], [0.2, 1])} />}
        {star && (
          <>
            <circle cx={CLUE.x} cy={CLUE.y} r={ip(f, [SHRINK_END, SHRINK_END + 18], [120, 900], OUT)} fill="url(#flowerBurst)" opacity={ip(f, [SHRINK_END, SHRINK_END + 20], [1, 0])} />
            <GoldenClue x={CLUE.x} y={CLUE.y} scale={pop} frame={g} />
            <SparkBurst f={f} at={SHRINK_END} x={CLUE.x} y={CLUE.y} reach={500} count={32} size={20} life={32} />
          </>
        )}
        <RainbowTrail f={f} from={0} pos={(t) => (t < RING_END ? ringPos(t) : butterfly)} len={22} size={22} />
        <BoboRider
          g={g}
          x={BOBO_F.x}
          y={BOBO_F.y - hop}
          scale={BOBO_F.s}
          look={{ x: -0.5, y: -1 }}
          expr={noticed ? "excited" : "happy"}
          armL={noticed && f < SHRINK_END + 18 ? 120 : noticed ? 42 : 26}
          armR={noticed && f < SHRINK_END + 18 ? -120 : noticed ? -42 : -26}
          headTilt={0}
          blink={noticed ? 1 : blinkAt(g, 3)}
          riderArmsUp={noticed}
          riderLook={{ x: -0.5, y: -1 }}
        />
        <Lumi x={LUMI_F.x} y={LUMI_F.y} scale={LUMI_F.s} look={{ x: 0.55, y: -1 }} expr={noticed ? "surprised" : "happy"} armL={noticed ? 26 : 14} armR={noticed ? -26 : -14} headTilt={noticed ? 2 : 0} blink={blinkAt(g, 1)} />
        <Butterfly x={butterfly.x} y={butterfly.y} scale={0.4} frame={g} color={1} mood={noticed ? "surprised" : "happy"} flapRate={1.05} look={{ x: -1, y: 0 }} rotate={f < RING_END ? heading * 0.12 : -8} blink={blinkAt(g, 4)} />
      </Forest>
      <AbsoluteFill style={{ alignItems: "center", fontFamily }}>
        <div style={{ position: "absolute", top: 790, fontSize: 74, fontWeight: 600, color: "#fff6dc", opacity: text, transform: `translateY(${(1 - text) * 20}px)`, textShadow: shadow }}>To Be Continued... ✨</div>
        <div style={{ position: "absolute", top: 880, fontSize: 48, fontWeight: 500, color: "#e4ecff", opacity: sub, transform: `translateY(${(1 - sub) * 16}px)`, textShadow: shadow }}>Little Moon Story World 🌙</div>
      </AbsoluteFill>
    </>
  );
};

const scenes: [number, number, React.FC][] = [
  [S.s1, S.s2, Scene1],
  [S.s2, S.s3, Scene2],
  [S.s3, S.s4, Scene3],
  [S.s4, S.s5, Scene4],
  [S.s5, S.s6, Scene5],
  [S.s6, S.end, Scene6],
];

export const Episode3: React.FC = () => (
  <AbsoluteFill style={{ background: "#0a1238" }}>
    {scenes.map(([from, to, C], i) => (
      <Sequence key={i} from={from} durationInFrames={to - from + (to === S.end ? 0 : XF)}>
        <C />
      </Sequence>
    ))}
    <AbsoluteFill style={{ background: "radial-gradient(ellipse at center, transparent 62%, rgba(5, 8, 30, 0.4) 100%)" }} />
    <Audio src={staticFile("ep03/audio.wav")} />
  </AbsoluteFill>
);
