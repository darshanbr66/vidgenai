import React from "react";
import { AbsoluteFill, Audio, Easing, interpolate, random, Sequence, staticFile, useCurrentFrame } from "remotion";
import { loadLocalFont } from "../fonts";
import timeline from "./timeline.json";
import { blinkAt, Bobo, CharacterDefs, LittleStar, Lumi } from "./characters";
import {
  BushBack,
  BushFront,
  Constellation,
  Cottage,
  Fireflies,
  Flower,
  GAP,
  Moon,
  Mushroom,
  Sky,
  Sparkle,
  SceneryDefs,
  StarField,
  Tree,
} from "./scenery";

const fontFamily = loadLocalFont("Fredoka", "fredoka.woff2");

// Scene boundaries in frames (30fps); XF is the crossfade overlap
const S = { s1: 0, s2: 180, s3: 360, s4: 570, s5: 870, s6: 1080, end: 1200 };
const XF = 12;
const EASE = Easing.inOut(Easing.cubic);

const ip = (f: number, input: number[], output: number[], easing?: (t: number) => number) =>
  interpolate(f, input, output, { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing });

type Speaker = "lumi" | "bobo" | "narrator";
const mouthAt = (who: Speaker, g: number) => {
  const m = timeline.mouth[who];
  return ((m[g] ?? 0) + (m[g - 1] ?? 0)) / 2;
};

const Cam: React.FC<{ cx: number; cy: number; z: number; children: React.ReactNode }> = ({ cx, cy, z, children }) => (
  <g transform={`translate(540 960) scale(${z}) translate(${-cx} ${-cy})`}>{children}</g>
);

const Frame: React.FC<{ children: React.ReactNode; fadeIn?: boolean }> = ({ children, fadeIn = true }) => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill style={{ opacity: fadeIn ? ip(f, [0, XF], [0, 1]) : 1 }}>
      <svg viewBox="0 0 1080 1920" width={1080} height={1920}>
        <defs>
          <CharacterDefs />
          <SceneryDefs />
        </defs>
        {children}
      </svg>
    </AbsoluteFill>
  );
};

// A star with a shrinking sparkle trail behind it; pos(f) gives its position at any frame
const Trail: React.FC<{ f: number; from: number; pos: (f: number) => { x: number; y: number }; len?: number }> = ({ f, from, pos, len = 16 }) => (
  <g>
    {Array.from({ length: len }, (_, k) => {
      const t = f - (k + 1) * 1.5;
      if (t < from) return null;
      const p = pos(t);
      return (
        <Sparkle
          key={k}
          x={p.x + Math.sin(k * 2.3) * 10}
          y={p.y + Math.cos(k * 1.7) * 10}
          size={18 * (1 - k / len)}
          opacity={1 - k / len}
          color={k % 2 ? "#fff3b0" : "#bfe9ff"}
        />
      );
    })}
  </g>
);

// ---------- Scene 1: the window, the moon, a missing star ----------
const Scene1: React.FC = () => {
  const f = useCurrentFrame();
  const g = f + S.s1;
  const cy = ip(f, [0, 75, 118, 142], [900, 1650, 1650, 1990], EASE);
  const z = ip(f, [0, 75, 118, 142], [1.08, 1, 1.02, 1.5], EASE);
  const surprised = f >= 98;
  const hands = ip(f, [118, 132], [8, 166], EASE);
  return (
    <Frame fadeIn={false}>
      <Cam cx={540} cy={cy} z={z}>
        <Sky w={1080} h={1700} />
        <StarField frame={g} w={1080} h={1500} count={120} seed="s1" />
        <Moon x={790} y={430} r={120} frame={g} />
        <Constellation x={300} y={1080} frame={g} gapPulse={ip(f, [92, 110], [0, 1])} />
        {/* house wall and lit window */}
        <rect x={-100} y={1500} width={1280} height={1300} fill="url(#wall)" />
        <rect x={-100} y={1480} width={1280} height={46} fill="#241c48" />
        <circle cx={540} cy={2000} r={620} fill="url(#warmGlow)" opacity={0.35} />
        <rect x={220} y={1640} width={640} height={780} rx={40} fill="url(#window)" />
        <circle cx={700} cy={1800} r={260} fill="url(#softGlow)" opacity={0.25} />
        <Lumi
          x={540}
          y={2560}
          scale={1.15}
          look={f < 135 ? { x: -0.45, y: -1 } : { x: 0, y: -0.2 }}
          expr={surprised ? "surprised" : "neutral"}
          mouth={mouthAt("lumi", g)}
          armL={hands}
          armR={-hands}
          blink={surprised ? 1 : blinkAt(g, 1)}
          headTilt={Math.sin(f / 25) * 2}
        />
        <path d="M 220 1640 Q 330 1700 300 2000 Q 280 2250 330 2380 L 220 2380 Z" fill="#88aef5" />
        <path d="M 860 1640 Q 750 1700 780 2000 Q 800 2250 750 2380 L 860 2380 Z" fill="#88aef5" />
        <rect x={220} y={1640} width={640} height={780} rx={40} fill="none" stroke="#6b5aa6" strokeWidth={28} />
        <rect x={-100} y={2410} width={1280} height={400} fill="url(#wall)" />
        <rect x={180} y={2370} width={720} height={56} rx={14} fill="#7b68b8" />
        {[250, 320, 760, 830].map((fx, i) => (
          <Flower key={fx} x={fx} y={2375} color={i % 2 ? "#ff9ad5" : "#ffd36e"} frame={g} seed={i} scale={0.7} />
        ))}
      </Cam>
    </Frame>
  );
};

// ---------- Scene 2: the glowing trail through the garden ----------
const Scene2: React.FC = () => {
  const f = useCurrentFrame();
  const g = f + S.s2;
  const running = f >= 85;
  const lumiX = ip(f, [85, 192], [470, 1580], Easing.in(Easing.quad));
  const cx = Math.min(Math.max(lumiX + 130, 540), 2260);
  const trailY = (x: number) => 1590 + Math.sin(x / 140) * 14;
  return (
    <Frame>
      <Cam cx={cx} cy={960} z={1}>
        <Sky w={2800} h={1600} />
        <StarField frame={g} w={2800} h={1300} count={200} seed="s2" />
        <Moon x={2050} y={380} r={110} frame={g} />
        <path d="M -200 1420 Q 500 1250 1200 1400 Q 1900 1300 3000 1420 L 3000 1700 L -200 1700 Z" fill="#1d2f5c" />
        {[1950, 2150, 2350, 2550, 2750].map((tx, i) => (
          <Tree key={tx} x={tx} y={1500} scale={0.55 + (i % 2) * 0.1} tint={0.9} />
        ))}
        <circle cx={2350} cy={1250} r={300} fill="url(#cyanGlow)" opacity={0.25} />
        <path d="M -200 1520 Q 700 1470 1400 1530 Q 2100 1490 3000 1520 L 3000 2100 L -200 2100 Z" fill="url(#grass)" />
        <Cottage x={300} y={1560} frame={g} />
        {/* the sparkling trail */}
        {Array.from({ length: 62 }, (_, i) => {
          const x = 470 + i * 38;
          const reveal = ip(f, [i * 0.5, i * 0.5 + 10], [0, 1]);
          const wave = 0.35 + 0.65 * Math.max(0, Math.sin(x / 110 - f * 0.22));
          return (
            <Sparkle
              key={i}
              x={x}
              y={trailY(x) + Math.sin(i * 1.3) * 6}
              size={7 + (i % 3) * 3}
              opacity={reveal * wave}
              color={i % 2 ? "#fff1a8" : "#aee8ff"}
              rotate={f * 2 + i * 20}
            />
          );
        })}
        <Fireflies frame={g} count={18} x={0} y={1150} w={2800} h={350} seed="g" />
        <Lumi
          x={lumiX}
          y={1575}
          scale={0.85}
          look={{ x: 0.9, y: f < 30 ? 0.4 : 0 }}
          expr={f < 40 ? "surprised" : "neutral"}
          mouth={mouthAt("lumi", g)}
          armR={ip(f, [44, 54, 84, 92], [-8, -128, -128, -8], EASE)}
          walk={running ? f * 0.42 : null}
          lean={running ? 4 : 0}
          blink={blinkAt(g, 2)}
        />
        {[
          [80, "#ff9ad5"],
          [260, "#ffd36e"],
          [640, "#a8b8ff"],
          [900, "#ff9ad5"],
          [1150, "#ffd36e"],
          [1420, "#a8b8ff"],
          [1700, "#ff9ad5"],
          [1980, "#ffd36e"],
          [2250, "#a8b8ff"],
        ].map(([fx, c], i) => (
          <Flower key={i} x={fx as number} y={1800 + (i % 3) * 40} color={c as string} frame={g} seed={i} scale={1.1} />
        ))}
      </Cam>
    </Frame>
  );
};

// ---------- the enchanted forest set, shared by scenes 3 and 4 ----------
const ForestSet: React.FC<{ g: number; children?: React.ReactNode; front?: React.ReactNode }> = ({ g, children, front }) => (
  <>
    <rect x={-400} y={-1200} width={2200} height={3800} fill="url(#forestBg)" />
    <StarField frame={g} w={1400} h={900} count={90} seed="f" />
    <Moon x={1150} y={180} r={80} frame={g} />
    {[0, 1, 2].map((i) => (
      <polygon key={i} points={`${900 + i * 120},300 ${1000 + i * 120},300 ${500 + i * 160},2200 ${300 + i * 160},2200`} fill="url(#moonbeam)" />
    ))}
    {[100, 480, 860, 1240].map((tx, i) => (
      <Tree key={tx} x={tx} y={1380} scale={0.75} tint={0.45 + (i % 2) * 0.1} />
    ))}
    <path d="M -400 1500 Q 300 1430 700 1470 Q 1100 1430 1800 1500 L 1800 2600 L -400 2600 Z" fill="#163a4a" />
    <Tree x={-30} y={1560} scale={1.05} />
    <Mushroom x={150} y={1760} color="cyan" frame={g} seed={1} />
    <Mushroom x={1210} y={1740} color="pink" frame={g} seed={2} />
    <Mushroom x={960} y={1800} color="cyan" frame={g} seed={3} scale={0.65} />
    <Mushroom x={300} y={1900} color="pink" frame={g} seed={4} scale={0.7} />
    {children}
    <Tree x={1300} y={1560} scale={1.05} />
    {front}
    <Fireflies frame={g} count={22} x={0} y={700} w={1400} h={1200} seed="ff" />
  </>
);

const STAR = { x: 700, y: 1372 };

// ---------- Scene 3: Bobo and the star in the bush ----------
const Scene3: React.FC = () => {
  const f = useCurrentFrame();
  const g = f + S.s3;
  const lumiX = ip(f, [0, 50], [-120, 430], Easing.out(Easing.quad));
  const boboX = ip(f, [40, 58], [1340, 1050], Easing.out(Easing.back(1.4)));
  const hop = f > 58 && f < 96 ? Math.abs(Math.sin((f - 58) * 0.33)) * 34 : 0;
  const starOn = ip(f, [30, 46], [0, 1]);
  const lumiLook = f < 50 ? { x: 0.7, y: 0 } : f < 66 ? { x: -0.6, y: -0.2 } : f < 92 ? { x: 1, y: 0 } : { x: 0.8, y: 0.4 };
  return (
    <Frame>
      <Cam cx={ip(f, [0, 210], [620, 720])} cy={ip(f, [0, 210], [1250, 1330])} z={ip(f, [0, 210], [1, 1.18])}>
        <ForestSet g={g}>
          <BushBack x={700} y={1560} />
          <LittleStar x={STAR.x} y={STAR.y} scale={0.72} mood="worried" glow={starOn * (1 + 0.35 * Math.sin(f / 3.5))} blink={blinkAt(g, 5)} />
          <BushFront x={700} y={1560} shake={Math.sin(f / 2) * starOn * 1.5} />
          <Bobo
            x={boboX}
            y={1700 - hop}
            scale={0.72}
            look={{ x: -1, y: 0.3 }}
            expr={f < 58 ? "surprised" : f < 100 ? "excited" : "neutral"}
            mouth={mouthAt("bobo", g)}
            armL={ip(f, [60, 68, 110, 120], [14, 108, 108, 14], EASE)}
            blink={blinkAt(g, 3)}
          />
          <Lumi
            x={lumiX}
            y={1710}
            scale={0.78}
            look={lumiLook}
            expr={f > 92 ? "surprised" : "neutral"}
            mouth={mouthAt("lumi", g)}
            walk={f < 50 ? f * 0.4 : null}
            blink={blinkAt(g, 1)}
          />
        </ForestSet>
      </Cam>
    </Frame>
  );
};

// ---------- Scene 4: pulling together, then POP ----------
const POP = 210; // local frame of the pop (global 780 = 26.0s)
const starPos = (f: number) =>
  f < POP
    ? STAR
    : { x: STAR.x + Math.sin((f - POP) / 6) * 30 * ip(f, [POP, POP + 20], [0, 1]), y: ip(f, [POP, POP + 12, 300], [STAR.y, 1190, -520], EASE) };

const Scene4: React.FC = () => {
  const f = useCurrentFrame();
  const g = f + S.s4;
  const popped = f >= POP;
  const soloPull = f >= 18 && f < 86;
  const teamPull = f >= 122 && f < POP;
  const strain = teamPull ? ip(f, [122, 205], [1, 4]) : soloPull ? 1.5 : 0;
  const wobble = Math.sin(f * 1.9) * strain;
  const leanPull = teamPull ? ip(f, [122, 200], [-6, -15]) : soloPull ? -8 : 0;
  const tumble = popped ? ip(f, [POP, POP + 10, POP + 34], [-15, -30, 0], EASE) : leanPull + wobble;
  const cheer = f > POP + 34;
  const star = starPos(f);
  const pullArms = soloPull || teamPull;
  const lumiArmL = pullArms ? -96 : cheer ? ip(f, [POP + 34, POP + 44], [8, 150], EASE) : 8;
  const lumiArmR = pullArms ? -112 : cheer ? ip(f, [POP + 34, POP + 44], [-8, -150], EASE) : f >= 86 && f < 122 ? -8 : -8;
  const boboX = ip(f, [84, 108], [120, 400], Easing.out(Easing.quad));
  const boboHug = f >= 116 && !cheer;
  const camCy = ip(f, [POP + 12, 300], [1420, 360], EASE);
  const camZ = ip(f, [POP + 12, 300], [1.4, 1.0], EASE);

  return (
    <Frame>
      <Cam cx={ip(f, [POP + 12, 300], [640, 640])} cy={camCy} z={camZ}>
        <ForestSet
          g={g}
          front={
            popped && (
              <g>
                <circle cx={STAR.x} cy={STAR.y} r={ip(f, [POP, POP + 14], [0, 650])} fill="url(#softGlow)" opacity={ip(f, [POP, POP + 16], [0.95, 0])} />
                {Array.from({ length: 26 }, (_, i) => {
                  const a = (i / 26) * Math.PI * 2;
                  const d = ip(f, [POP, POP + 30], [0, 340], Easing.out(Easing.cubic)) * (0.7 + random(`b${i}`) * 0.5);
                  return (
                    <Sparkle
                      key={i}
                      x={STAR.x + Math.cos(a) * d}
                      y={STAR.y + Math.sin(a) * d}
                      size={14 + random(`bs${i}`) * 12}
                      opacity={ip(f, [POP + 14, POP + 40], [1, 0])}
                      color={i % 2 ? "#fff1a8" : "#aee8ff"}
                    />
                  );
                })}
                {Array.from({ length: 12 }, (_, i) => {
                  const a = -Math.PI * (0.1 + 0.8 * random(`l${i}`));
                  const t = f - POP;
                  const lx = STAR.x + Math.cos(a) * t * 9;
                  const ly = STAR.y + 60 + Math.sin(a) * t * 9 + t * t * 0.35;
                  return <ellipse key={i} cx={lx} cy={ly} rx={16} ry={8} fill="#5fbf86" opacity={ip(t, [20, 45], [1, 0])} transform={`rotate(${t * 12 + i * 30} ${lx} ${ly})`} />;
                })}
                <Trail f={f} from={POP} pos={starPos} />
                <LittleStar x={star.x} y={star.y} scale={0.72} mood="happy" rotate={(f - POP) * 6} />
              </g>
            )
          }
        >
          <BushBack x={700} y={1560} shake={pullArms ? wobble * 1.5 : 0} />
          {!popped && (
            <LittleStar
              x={STAR.x + wobble * 1.2}
              y={STAR.y - (teamPull ? ip(f, [122, POP], [0, 10]) : 0)}
              scale={0.72}
              mood="worried"
              glow={0.75 + 0.25 * Math.sin(f / 3.5)}
              rotate={wobble * 2}
              blink={blinkAt(g, 5)}
            />
          )}
          <BushFront x={700} y={1560} shake={pullArms ? -wobble * 2 : popped ? ip(f, [POP, POP + 20], [12, 0]) * Math.sin(f) : 0} />
          {f >= 84 && (
            <Bobo
              x={boboX}
              y={1700}
              scale={0.72}
              look={cheer ? { x: 0.3, y: -1 } : f < 116 ? { x: 1, y: 0 } : { x: 1, y: 0.2 }}
              expr={cheer ? "happy" : f >= 100 && f < 120 ? "excited" : teamPull ? "effort" : "neutral"}
              mouth={mouthAt("bobo", g)}
              armL={boboHug ? -78 : cheer ? 150 : f >= 100 && f < 116 ? 14 : 14}
              armR={boboHug ? -96 : cheer ? -150 : f >= 100 && f < 116 ? -165 : -14}
              walk={f < 108 ? f * 0.45 : null}
              lean={teamPull ? leanPull + Math.sin(f * 1.9 + 1) * strain : popped ? tumble : 0}
              blink={blinkAt(g, 3)}
            />
          )}
          <Lumi
            x={ip(f, [0, 16], [470, 545], Easing.out(Easing.quad))}
            y={1712}
            scale={0.78}
            look={cheer || (popped && f > POP + 14) ? { x: 0.3, y: -1 } : f >= 86 && f < 122 ? { x: -1, y: 0 } : { x: 1, y: -0.3 }}
            expr={popped ? (f > POP + 6 ? "happy" : "surprised") : pullArms ? "effort" : f >= 100 ? "happy" : "neutral"}
            mouth={mouthAt("lumi", g)}
            armL={lumiArmL}
            armR={lumiArmR}
            lean={tumble}
            squash={pullArms ? 1 - Math.abs(wobble) * 0.006 : 1}
            blink={blinkAt(g, 1)}
          />
        </ForestSet>
      </Cam>
    </Frame>
  );
};

// ---------- the night sky + clearing, shared by scenes 5 and 6 ----------
const Aurora: React.FC<{ g: number; boost: number }> = ({ g, boost }) => (
  <g opacity={boost * 0.55} filter="url(#blur20)">
    {[0, 1, 2].map((i) => (
      <path
        key={i}
        d={`M -100 ${360 + i * 90 + Math.sin(g / 30 + i) * 30} Q 300 ${220 + i * 80} 540 ${380 + i * 70 + Math.sin(g / 24 + i) * 40} T 1200 ${300 + i * 90}`}
        stroke={["#7ff6ff", "#b59bff", "#ff9ee0"][i]}
        strokeWidth={60}
        fill="none"
        opacity={0.5}
      />
    ))}
  </g>
);

const CONST = { x: 540, y: 760 };

// ---------- Scene 5: the star goes home ----------
const Scene5: React.FC = () => {
  const f = useCurrentFrame();
  const g = f + S.s5;
  const arrive = 40;
  const boost = ip(f, [42, 100], [0, 1]);
  const flyPos = (t: number) => ({
    x: CONST.x + GAP.x + Math.sin(t / 5) * 40 * (1 - t / arrive),
    y: ip(t, [0, arrive], [1800, CONST.y + GAP.y], Easing.out(Easing.cubic)),
  });
  const star = f < arrive ? flyPos(f) : { x: CONST.x + GAP.x, y: CONST.y + GAP.y };
  const cy = ip(f, [0, 40, 58, 92, 210], [1050, 820, 820, 2280, 2200], EASE);
  const z = ip(f, [0, 40, 58, 92], [1, 1.08, 1.08, 1], EASE);
  const talking = f >= 58 && f < 132;
  return (
    <Frame>
      <Cam cx={540} cy={cy} z={z}>
        <Sky w={1080} h={2400} />
        <StarField frame={g} w={1080} h={2000} count={170} seed="s5" boost={boost} />
        <Aurora g={g} boost={boost} />
        <Moon x={850} y={380} r={100} frame={g} bright={boost} />
        <Constellation x={CONST.x} y={CONST.y} frame={g} gapPulse={ip(f, [0, 10, 36, 42], [0, 0.8, 0.8, 0])} lines={ip(f, [44, 70], [0, 1])} />
        <circle cx={star.x} cy={star.y} r={ip(f, [arrive, arrive + 30], [20, 460])} fill="none" stroke="#fff3b0" strokeWidth={6} opacity={f >= arrive ? ip(f, [arrive, arrive + 30], [0.9, 0]) : 0} />
        <Trail f={Math.min(f, arrive + 16)} from={0} pos={flyPos} />
        <LittleStar x={star.x} y={star.y} scale={ip(f, [0, arrive], [0.75, 0.42])} mood="happy" rotate={ip(f, [0, arrive], [360, 0])} glow={1 + boost * 0.4} />
        {/* forest clearing below */}
        <Tree x={-60} y={2520} scale={1.1} />
        <Tree x={1150} y={2520} scale={1.1} />
        <path d="M -200 2450 Q 540 2380 1280 2450 L 1280 3400 L -200 3400 Z" fill="#163a4a" />
        <Mushroom x={140} y={2760} color="cyan" frame={g} seed={1} scale={0.8} />
        <Mushroom x={960} y={2780} color="pink" frame={g} seed={2} scale={0.8} />
        <Fireflies frame={g} count={14} x={0} y={2000} w={1080} h={700} seed="s5f" />
        <Bobo
          x={720}
          y={2640}
          scale={0.78}
          look={f > 140 ? { x: -0.2, y: -1 } : { x: -0.6, y: 0 }}
          expr="happy"
          armL={talking ? 32 : 14}
          armR={talking ? -32 : -14}
          squash={talking ? 0.96 : 1}
          headTilt={talking ? Math.sin(f / 8) * 5 : 0}
          blink={blinkAt(g, 3)}
        />
        <Lumi
          x={420}
          y={2650}
          scale={0.92}
          look={f > 140 ? { x: 0.2, y: -1 } : { x: 0, y: 0 }}
          expr={talking ? "neutral" : "happy"}
          mouth={mouthAt("lumi", g)}
          armR={ip(f, [62, 74, 124, 134], [-8, -52, -52, -8], EASE)}
          headTilt={talking ? Math.sin(f / 14) * 3 : 0}
          blink={blinkAt(g, 1)}
        />
      </Cam>
    </Frame>
  );
};

// ---------- Scene 6: looking up, and the ending ----------
const Scene6: React.FC = () => {
  const f = useCurrentFrame();
  const g = f + S.s6;
  const text = ip(f, [66, 86], [0, 1], EASE);
  const sub = ip(f, [76, 96], [0, 1], EASE);
  return (
    <>
      <Frame>
        <Cam cx={540} cy={ip(f, [0, 120], [1240, 1000], EASE)} z={ip(f, [0, 120], [1.06, 1], EASE)}>
          <Sky w={1080} h={2300} />
          <StarField frame={g} w={1080} h={1800} count={170} seed="s5" boost={1} />
          <Aurora g={g} boost={1} />
          <Moon x={830} y={360} r={95} frame={g} bright={1} />
          <Constellation x={CONST.x} y={CONST.y} frame={g} lines={0.8} />
          <g transform={`translate(${CONST.x + GAP.x} ${CONST.y + GAP.y}) rotate(${g * 0.8})`} opacity={0.6 + 0.4 * Math.sin(g / 6)}>
            {[0, 45, 90, 135].map((a) => (
              <rect key={a} x={-2} y={-110} width={4} height={220} fill="#fff3b0" opacity={0.35} transform={`rotate(${a})`} />
            ))}
          </g>
          <LittleStar x={CONST.x + GAP.x} y={CONST.y + GAP.y} scale={0.42 + Math.sin(g / 6) * 0.02} mood="happy" glow={1.4} />
          <path d="M -200 1760 Q 540 1540 1280 1760 L 1280 2400 L -200 2400 Z" fill="#14304a" />
          <path d="M -200 1760 Q 540 1540 1280 1760" stroke="#7d9be0" strokeWidth={6} fill="none" opacity={0.35} />
          <Fireflies frame={g} count={10} x={0} y={1500} w={1080} h={500} seed="s6f" />
          <Bobo x={630} y={1676} scale={0.5} look={{ x: -0.2, y: -1 }} expr="happy" blink={blinkAt(g, 3)} />
          <Lumi x={455} y={1684} scale={0.58} look={{ x: 0.2, y: -1 }} expr="happy" armR={-30} blink={blinkAt(g, 1)} />
        </Cam>
      </Frame>
      <AbsoluteFill style={{ alignItems: "center", fontFamily, color: "#fff6dc" }}>
        <div
          style={{
            position: "absolute",
            top: 1170,
            fontSize: 62,
            fontWeight: 600,
            letterSpacing: "0.01em",
            opacity: text,
            transform: `translateY(${(1 - text) * 20}px)`,
            textShadow: "0 0 30px rgba(255, 220, 140, 0.6)",
          }}
        >
          Little Moon Story World 🌙✨
        </div>
        <div
          style={{
            position: "absolute",
            top: 1262,
            fontSize: 42,
            fontWeight: 400,
            color: "#d4e2ff",
            opacity: sub,
            transform: `translateY(${(1 - sub) * 16}px)`,
            textShadow: "0 0 20px rgba(150, 190, 255, 0.5)",
          }}
        >
          See you in the next story!
        </div>
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

export const LittleStarStory: React.FC = () => (
  <AbsoluteFill style={{ background: "#0a1238" }}>
    {scenes.map(([from, to, C], i) => (
      <Sequence key={i} from={from} durationInFrames={to - from + (to === S.end ? 0 : XF)}>
        <C />
      </Sequence>
    ))}
    <AbsoluteFill style={{ background: "radial-gradient(ellipse at center, transparent 55%, rgba(5, 8, 30, 0.55) 100%)" }} />
    <Audio src={staticFile("story/audio.wav")} />
  </AbsoluteFill>
);
