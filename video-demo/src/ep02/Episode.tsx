import React from "react";
import { AbsoluteFill, Audio, Easing, interpolate, Sequence, staticFile, useCurrentFrame } from "remotion";
import { loadLocalFont } from "../fonts";
import { blinkAt, Bobo, CharacterDefs, Lumi } from "../story/characters";
import { Fireflies, Mushroom, SceneryDefs, Sparkle } from "../story/scenery";
import timeline from "./timeline.json";
import {
  GiantTree,
  GoldenKey,
  HANDLE,
  HOLLOW_DOORWAY,
  LeafFall,
  LittleDoor,
  MagicMap,
  PropDefs,
  TinySprite,
  TinyWorldBack,
  TinyWorldFloor,
  Woods,
} from "./props";

const fontFamily = loadLocalFont("Fredoka", "fredoka.woff2");

// Scene boundaries in frames (30fps); XF is the crossfade overlap
const S = { s1: 0, s2: 180, s3: 390, s4: 630, s5: 930, s6: 1170, end: 1350 };
const XF = 12;
const EASE = Easing.inOut(Easing.cubic);
const OUT = Easing.out(Easing.cubic);

const ip = (f: number, input: number[], output: number[], easing?: (t: number) => number) =>
  interpolate(f, input, output, { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing });

type Speaker = "lumi" | "bobo";
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
          <PropDefs />
        </defs>
        {children}
      </svg>
    </AbsoluteFill>
  );
};

// The door stands at the foot of the giant tree
const DOOR = { x: 1120, y: 1700 };
const KNOCK_FRAMES = [6, 27, 48];

// Where Lumi's raised right hand is, so the key can sit in it exactly
const lumiHand = (x: number, y: number, scale: number, angle: number) => {
  const a = (angle * Math.PI) / 180;
  return { x: x + (84 - 128 * Math.sin(a)) * scale, y: y + (-290 + 128 * Math.cos(a)) * scale };
};

const StarTrail: React.FC<{ f: number; from: number; pos: (f: number) => { x: number; y: number }; len?: number; size?: number }> = ({ f, from, pos, len = 40, size = 50 }) => (
  <g>
    {Array.from({ length: len }, (_, k) => {
      const t = f - (k + 1) * 1.3;
      if (t < from) return null;
      const p = pos(t);
      return (
        <Sparkle
          key={k}
          x={p.x + Math.sin(k * 2.3) * 18}
          y={p.y + Math.cos(k * 1.7) * 18}
          size={size * (1 - k / len)}
          opacity={1 - k / len}
          color={["#fff3b0", "#bfe9ff", "#ffc4ec"][k % 3]}
          rotate={k * 24 + f * 2}
        />
      );
    })}
  </g>
);

const SparkBurst: React.FC<{ f: number; at: number; x: number; y: number; reach?: number; count?: number; size?: number; life?: number }> = ({
  f,
  at,
  x,
  y,
  reach = 300,
  count = 22,
  size = 18,
  life = 34,
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
            color={i % 2 ? "#fff1a8" : "#aee8ff"}
            rotate={f * 3 + i * 25}
          />
        );
      })}
    </g>
  );
};

// ---------- Scene 1: knock... knock... knock... ----------
const Scene1: React.FC = () => {
  const f = useCurrentFrame();
  const g = f + S.s1;
  const knockAt = KNOCK_FRAMES.map((k) => (f >= k ? Math.exp(-(f - k) / 6) : 0));
  const shake = KNOCK_FRAMES.reduce((sum, k, i) => sum + knockAt[i] * Math.sin((f - k) * 1.5), 0);
  const flash = Math.max(...knockAt);
  const lumiX = ip(f, [0, 54], [300, 470], Easing.out(Easing.quad));
  const boboX = ip(f, [0, 54], [550, 725], Easing.out(Easing.quad));
  const walking = f < 54;
  const startled = f >= 30;
  const jump = f >= 48 && f < 62 ? Math.sin(((f - 48) / 14) * Math.PI) * 42 : 0;
  const push = ip(f, [108, 152], [0, 1], EASE);
  const cx = ip(push, [0, 1], [700, DOOR.x]) + shake * 4;
  const cy = ip(push, [0, 1], [1250, DOOR.y - 120]) + shake * 3;
  const z = ip(push, [0, 1], [1, 2.25]);
  return (
    <Frame fadeIn={false}>
      <Cam cx={cx} cy={cy} z={z}>
        <Woods g={g} />
        <GiantTree x={DOOR.x} y={DOOR.y} g={g} shake={shake * 9}>
          <LittleDoor glow={0.25 + flash * 0.75 + push * 0.45} frame={g} />
        </GiantTree>
        {KNOCK_FRAMES.map((k) =>
          f >= k && f < k + 28 ? (
            <circle key={k} cx={DOOR.x} cy={DOOR.y - 120} r={ip(f, [k, k + 28], [40, 620], OUT)} fill="none" stroke="#ffe9a8" strokeWidth={9} opacity={ip(f, [k, k + 28], [0.9, 0])} />
          ) : null,
        )}
        {KNOCK_FRAMES.map((k, i) => (
          <LeafFall key={k} f={f} start={k} x={DOOR.x} top={500} seed={`k${i}`} />
        ))}
        {push > 0.3 &&
          Array.from({ length: 12 }, (_, i) => {
            const a = (i / 12) * Math.PI * 2 + g / 40;
            const r = 130 + (i % 3) * 34;
            return <Sparkle key={i} x={DOOR.x + Math.cos(a) * r} y={DOOR.y - 125 + Math.sin(a) * r * 1.1} size={9 + (i % 3) * 4} opacity={(push - 0.3) * (0.55 + 0.45 * Math.sin(g / 5 + i))} color="#fff1a8" />;
          })}
        <Bobo
          x={boboX}
          y={1780 - jump}
          scale={0.72}
          look={startled ? { x: 1, y: 0 } : { x: 0.3, y: 0 }}
          expr={startled ? "surprised" : "neutral"}
          walk={walking ? f * 0.45 : null}
          armL={f >= 48 ? 44 : 14}
          armR={f >= 48 ? -44 : -14}
          squash={jump > 0 ? 1.03 : 1}
          blink={blinkAt(g, 3)}
        />
        <Lumi
          x={lumiX}
          y={1800}
          scale={0.78}
          look={startled ? { x: 1, y: f > 66 ? 0.1 : 0 } : { x: 0.5, y: 0 }}
          expr={startled ? "surprised" : "neutral"}
          mouth={mouthAt("lumi", g)}
          walk={walking ? f * 0.4 : null}
          armL={startled ? 24 : 8}
          armR={startled ? -24 : -8}
          lean={startled ? ip(f, [30, 44], [0, -3]) : 0}
          headTilt={startled ? 3 : 0}
          blink={startled ? 1 : blinkAt(g, 1)}
        />
      </Cam>
    </Frame>
  );
};

// ---------- Scene 2: the tiny wooden door ----------
const Scene2: React.FC = () => {
  const f = useCurrentFrame();
  const g = f + S.s2;
  const closeUp = f >= 132;
  const lumiX = ip(f, [0, 50], [640, 862], Easing.out(Easing.quad));
  const boboX = ip(f, [8, 54], [1520, 1296], Easing.out(Easing.quad));
  const touch = ip(f, [58, 72], [0, 1], EASE);
  const touched = f >= 72;
  const glow = closeUp ? ip(f, [132, 205], [0.5, 1]) : touched ? ip(f, [72, 88], [0.25, 0.55]) : 0.25;
  const camZ = closeUp ? ip(f, [132, 222], [2.9, 3.5]) : ip(f, [0, 130], [1.3, 1.5], EASE);
  const camX = closeUp ? DOOR.x : ip(f, [0, 130], [1080, 1090], EASE);
  const camY = closeUp ? DOOR.y - 135 : ip(f, [0, 130], [1480, 1470], EASE);
  return (
    <Frame>
      <Cam cx={camX} cy={camY} z={camZ}>
        <Woods g={g} />
        <GiantTree x={DOOR.x} y={DOOR.y} g={g}>
          <LittleDoor glow={glow} frame={g} />
        </GiantTree>
        <SparkBurst f={f} at={72} x={DOOR.x + 60} y={DOOR.y - 95} reach={190} size={11} count={14} life={26} />
        {closeUp &&
          Array.from({ length: 18 }, (_, i) => {
            const t = (f - 132 + i * 7) % 60;
            const a = i * 1.9;
            const spread = 40 + t * 2.2;
            return <Sparkle key={i} x={DOOR.x + Math.cos(a) * spread} y={DOOR.y - 110 + Math.sin(a) * spread * 0.9 - t * 0.6} size={5 + (i % 3) * 2.5} opacity={ip(t, [0, 12, 60], [0, 1, 0]) * (glow - 0.3)} color="#fff1a8" />;
          })}
        {!closeUp && (
          <>
            <Bobo
              x={boboX}
              y={1760}
              scale={0.72}
              look={{ x: -1, y: 0.5 }}
              expr={touched && f < 100 ? "surprised" : "neutral"}
              mouth={mouthAt("bobo", g)}
              walk={f >= 8 && f < 54 ? f * 0.45 : null}
              armL={ip(touch, [0, 1], [14, 65])}
              lean={touch * -3}
              headTilt={f >= 100 ? Math.sin(f / 9) * 6 - 5 : -3}
              blink={blinkAt(g, 3)}
            />
            <Lumi
              x={lumiX}
              y={1790}
              scale={0.78}
              look={f < 50 ? { x: 1, y: 0.2 } : f >= 100 ? { x: 0.9, y: 0.3 } : { x: 1, y: 0.75 }}
              expr={touched ? "surprised" : "neutral"}
              walk={f < 50 ? f * 0.4 : null}
              lean={f >= 50 ? 3 : 0}
              armL={18}
              armR={f >= 50 ? -30 : -8}
              blink={blinkAt(g, 1)}
            />
          </>
        )}
      </Cam>
    </Frame>
  );
};

// ---------- Scene 3: the door opens ----------
const OPEN_AT = 60;
const Scene3: React.FC = () => {
  const f = useCurrentFrame();
  const g = f + S.s3;
  if (f < 100) {
    const lever = ip(f, [22, 34], [0, -52], EASE);
    const open = ip(f, [OPEN_AT, OPEN_AT + 24], [0, 1], OUT);
    const handIn = ip(f, [0, 20], [0, 1], OUT) * ip(f, [44, 58], [1, 0], EASE);
    const knob = { x: DOOR.x + HANDLE.x, y: DOOR.y + HANDLE.y };
    const a = (lever * Math.PI) / 180;
    const grip = { x: knob.x - 24 * Math.sin(a), y: knob.y + 24 * Math.cos(a) };
    const off = { x: knob.x + 210, y: knob.y + 260 };
    const hand = { x: off.x + (grip.x - off.x) * handIn, y: off.y + (grip.y - off.y) * handIn };
    const armAngle = (Math.atan2(off.y - knob.y, off.x - knob.x) * 180) / Math.PI - 90;
    const flood = ip(f, [OPEN_AT, OPEN_AT + 22], [0, 1], OUT);
    return (
      <Frame>
        <Cam cx={ip(f, [OPEN_AT - 6, OPEN_AT + 34], [DOOR.x + 34, DOOR.x], EASE)} cy={ip(f, [OPEN_AT - 6, OPEN_AT + 34], [knob.y, DOOR.y - 140], EASE)} z={ip(f, [OPEN_AT - 6, OPEN_AT + 34], [3.5, 2.2], EASE)}>
          <Woods g={g} fireflies={false} />
          <GiantTree x={DOOR.x} y={DOOR.y} g={g}>
            <LittleDoor glow={1} open={open} lever={lever} frame={g} />
          </GiantTree>
          {flood > 0 && (
            <g opacity={flood}>
              {[-52, -32, -13, 6, 24, 46].map((r, i) => (
                <rect key={r} x={-40 - (i % 2) * 18} y={-1000} width={80 + (i % 2) * 36} height={1000} fill="url(#goldRay)" transform={`translate(${DOOR.x} ${DOOR.y - 110}) rotate(${r + Math.sin(g / 18 + i) * 3})`} />
              ))}
              <circle cx={DOOR.x} cy={DOOR.y - 110} r={420} fill="url(#goldFlood)" />
            </g>
          )}
          <SparkBurst f={f} at={OPEN_AT} x={DOOR.x} y={DOOR.y - 120} reach={480} count={30} size={18} life={38} />
          {handIn > 0 && (
            <g transform={`translate(${hand.x} ${hand.y}) rotate(${armAngle})`}>
              <rect x={-17} y={22} width={34} height={420} rx={16} fill="url(#pj)" />
              <rect x={-17} y={16} width={34} height={8} fill="#e9efff" opacity={0.85} />
              <circle r={17} fill="url(#skin)" />
            </g>
          )}
        </Cam>
      </Frame>
    );
  }
  // reverse shot: the light from the doorway on both amazed faces
  const k = f - 100;
  const toGold = ip(f, [216, 240], [0, 1], Easing.in(Easing.quad));
  const breathe = Math.sin(g / 14);
  return (
    <>
      <Frame fadeIn={false}>
        <Cam cx={540} cy={ip(k, [0, 140], [1210, 1180])} z={ip(k, [0, 140], [1.1, 1.22])}>
          <Woods g={g} fireflies={false} />
          <Bobo x={778} y={1700} scale={1.6} look={{ x: -0.2, y: 0.5 }} expr="excited" armL={30} armR={-30} blink={blinkAt(g, 3)} />
          <Lumi x={345} y={1700} scale={1.6} look={{ x: 0.25, y: 0.55 }} expr="surprised" armL={22} armR={-22} headTilt={2} blink={blinkAt(g, 1)} />
          {/* gold on their faces, from below */}
          <rect x={-300} y={200} width={1680} height={2200} fill="url(#goldFlood)" opacity={0.3 + breathe * 0.04} style={{ mixBlendMode: "soft-light" }} />
          <ellipse cx={540} cy={2120} rx={1050} ry={1050} fill="url(#goldFlood)" opacity={0.75 + breathe * 0.05} />
          {[-34, -16, 2, 19, 36].map((r, i) => (
            <rect key={r} x={-55} y={-1900} width={110} height={1900} fill="url(#goldRay)" opacity={0.42} transform={`translate(540 2140) rotate(${r + Math.sin(g / 22 + i) * 2.5})`} />
          ))}
          {Array.from({ length: 26 }, (_, i) => {
            const t = (k + i * 11) % 120;
            const x = 40 + ((i * 197) % 1000) + Math.sin(t / 12 + i) * 24;
            return <Sparkle key={i} x={x} y={1880 - t * 11} size={9 + (i % 3) * 6} opacity={ip(t, [0, 16, 95, 120], [0, 1, 1, 0])} color={i % 2 ? "#fff1a8" : "#fff"} rotate={g + i * 30} />;
          })}
        </Cam>
      </Frame>
      <AbsoluteFill style={{ background: "#ffe6a4", opacity: toGold }} />
    </>
  );
};

// ---------- Scene 4: the tiny world inside the tree ----------
const CAP = { x: 1500, y: 1226 };
const LEFT = { x: 1228, y: 1454 };
const RIGHT = { x: 1772, y: 1454 };
const PEEK = 90;
const HOP = 108;
const JUMPS = [210, 238.5, 267];
const hopArc = (f: number, a: number, b: number, from: { x: number; y: number }, to: { x: number; y: number }, h: number) => {
  const t = ip(f, [a, b], [0, 1]);
  return { x: from.x + (to.x - from.x) * t, y: from.y + (to.y - from.y) * t - Math.sin(t * Math.PI) * h };
};
const spritePos = (f: number) => {
  if (f < HOP) return { x: ip(f, [PEEK, PEEK + 14], [1500, 1596], OUT), y: 1560 };
  if (f < JUMPS[0]) return hopArc(f, HOP, HOP + 14, { x: 1596, y: 1560 }, CAP, 170);
  if (f < JUMPS[1]) return hopArc(f, JUMPS[0], JUMPS[1], CAP, LEFT, 300);
  if (f < JUMPS[2]) return hopArc(f, JUMPS[1], JUMPS[2], LEFT, RIGHT, 440);
  return hopArc(f, JUMPS[2], JUMPS[2] + 28, RIGHT, CAP, 300);
};

const Scene4: React.FC = () => {
  const f = useCurrentFrame();
  const g = f + S.s4;
  const fromGold = ip(f, [0, 22], [1, 0], OUT);
  const tilt = ip(f, [114, 150], [0, 1], EASE);
  const cx = ip(f, [0, 96], [560, 1500], EASE);
  const cy = ip(tilt, [0, 1], [ip(f, [0, 96], [1380, 1330], EASE), 960]);
  const z = ip(tilt, [0, 1], [ip(f, [0, 96], [1.22, 1.14], EASE), 1]);
  const p = spritePos(f);
  const landed = JUMPS.map((j, i) => (f >= j + (i === 2 ? 28 : 28.5) ? Math.exp(-(f - (j + 28)) / 5) : 0));
  const land = Math.max(...landed);
  const inAir = f >= JUMPS[0] && f < JUMPS[2] + 28;
  const onGround = f < HOP;
  const talking = f >= 156 && f < 195;
  const cheer = f >= JUMPS[0];
  const lumiWave = f >= 150 && f < 206;
  return (
    <>
      <Frame fadeIn={false}>
        <Cam cx={cx} cy={cy} z={z}>
          <TinyWorldBack g={g} />
          {/* looking back out through the door at two giant friends */}
          <path d={HOLLOW_DOORWAY} fill="url(#nightOutside)" />
          <g clipPath="url(#hollowDoorway)">
            <Fireflies frame={g} count={10} x={1080} y={280} w={840} h={620} seed="door" />
            <Bobo
              x={1712}
              y={1120}
              scale={1.4}
              look={cheer ? { x: 0, y: -0.2 } : { x: -0.25, y: 0.8 }}
              expr={cheer ? "excited" : "surprised"}
              armL={cheer ? 120 : 30}
              armR={cheer ? -120 : -30}
              blink={blinkAt(g, 3)}
              headTilt={cheer ? Math.sin(f / 6) * 5 : 0}
            />
            <Lumi
              x={1312}
              y={1238}
              scale={1.4}
              look={{ x: 0.3, y: 0.85 }}
              expr={f < 150 ? "surprised" : cheer ? "happy" : "neutral"}
              mouth={mouthAt("lumi", g)}
              armL={lumiWave ? 108 + Math.sin(f * 0.5) * 12 : 20}
              headTilt={talking ? Math.sin(f / 10) * 3 : 2}
              blink={blinkAt(g, 1)}
            />
            <path d={HOLLOW_DOORWAY} fill="#ffcf6e" opacity={0.18} />
          </g>
          <path d={HOLLOW_DOORWAY} fill="none" stroke="#ffd36e" strokeWidth={22} />
          <path d={HOLLOW_DOORWAY} fill="none" stroke="#fff1a8" strokeWidth={5} opacity={0.75} />
          <TinyWorldFloor g={g} />
          {onGround && f >= PEEK && <TinySprite x={p.x} y={p.y} scale={1.2} frame={g} look={{ x: -0.6, y: -0.6 }} blink={blinkAt(g, 2)} />}
          <Mushroom x={1500} y={1560} color="cyan" frame={g} seed={9} scale={3} />
          <Mushroom x={LEFT.x} y={1640} color="pink" frame={g} seed={7} scale={1.67} />
          <Mushroom x={RIGHT.x} y={1640} color="pink" frame={g} seed={8} scale={1.67} />
          <Fireflies frame={g} count={46} x={0} y={980} w={2400} h={950} seed="tiny" />
          {f >= JUMPS[0] && <StarTrail f={f} from={JUMPS[0]} pos={spritePos} />}
          {!onGround && (
            <TinySprite
              x={p.x}
              y={p.y}
              scale={1.2}
              frame={g}
              wave={f >= HOP + 14 && f < JUMPS[0] ? ip(f, [HOP + 14, HOP + 22], [0, 1]) : 0}
              armsUp={inAir}
              happy={f >= HOP + 14}
              look={{ x: 0, y: -1 }}
              squash={1 - land * 0.22}
              rotate={inAir ? Math.sin(((f - JUMPS[0]) / 28.5) * Math.PI) * 14 : 0}
              blink={blinkAt(g, 2)}
            />
          )}
          {JUMPS.map((j, i) => (
            <SparkBurst key={j} f={f} at={j + 28} x={[LEFT, RIGHT, CAP][i].x} y={[LEFT, RIGHT, CAP][i].y} reach={200} count={14} size={16} life={22} />
          ))}
        </Cam>
      </Frame>
      <AbsoluteFill style={{ background: "#ffe6a4", opacity: fromGold }} />
    </>
  );
};

// ---------- scenes 5 & 6: outside again, with the door standing open ----------
const LUMI = { x: 930, y: 1790, s: 0.86 };
const BOBO = { x: 1330, y: 1776, s: 0.78 };

const OutdoorSet: React.FC<{ g: number }> = ({ g }) => (
  <>
    <Woods g={g} />
    <GiantTree x={DOOR.x} y={DOOR.y} g={g}>
      <LittleDoor open={1} lever={0} glow={1} light={0.45} frame={g} />
    </GiantTree>
    <circle cx={DOOR.x} cy={DOOR.y - 120} r={340} fill="url(#goldFlood)" opacity={0.22} />
  </>
);

const Scene5: React.FC = () => {
  const f = useCurrentFrame();
  const g = f + S.s5;
  const GIVE = 60;
  const ARM = -65;
  const armR = ip(f, [14, 44], [-8, ARM], EASE);
  const hand = lumiHand(LUMI.x, LUMI.y, LUMI.s, ARM);
  const keyRest = { x: hand.x + 2, y: hand.y - 36 };
  // the creature flies out of the door carrying the key above its head...
  const flyT = ip(f, [0, GIVE - 6], [0, 1], Easing.inOut(Easing.quad));
  const fly = { x: DOOR.x + (hand.x + 44 - DOOR.x) * flyT, y: DOOR.y - 30 + (hand.y + 66 - (DOOR.y - 30)) * flyT - Math.sin(flyT * Math.PI) * 130 };
  // ...then, its job done, hops over and lands on Bobo's head
  const HOPAT = 196;
  const head = { x: BOBO.x, y: BOBO.y - 405 * BOBO.s };
  const hopT = ip(f, [HOPAT, HOPAT + 18], [0, 1], Easing.inOut(Easing.quad));
  const sprite = { x: fly.x + (head.x - fly.x) * hopT, y: fly.y + (head.y - fly.y) * hopT - Math.sin(hopT * Math.PI) * 120 };
  const hover = f < HOPAT ? Math.sin(g / 9) * 7 : 0;
  const key = f < GIVE ? { x: sprite.x - 2, y: sprite.y + hover - 112 } : { x: keyRest.x, y: keyRest.y + Math.sin(g / 16) * 3 };
  const keyMove = ip(f, [GIVE - 8, GIVE], [0, 1], EASE);
  const keyX = f < GIVE ? key.x + (keyRest.x - key.x) * keyMove : key.x;
  const keyY = f < GIVE ? key.y + (keyRest.y - key.y) * keyMove : key.y;
  const given = f >= GIVE;
  const hop = f >= GIVE + 4 && f < 120 ? Math.abs(Math.sin((f - GIVE - 4) * 0.2)) * 44 : 0;
  const push = ip(f, [GIVE, 200], [0, 1], EASE);
  return (
    <Frame>
      <Cam cx={1120} cy={ip(push, [0, 1], [1430, 1400])} z={ip(f, [0, 60, 200], [1.32, 1.42, 1.6], EASE)}>
        <OutdoorSet g={g} />
        <Bobo
          x={BOBO.x}
          y={BOBO.y - hop}
          scale={BOBO.s}
          look={f < GIVE ? { x: -1, y: 0.1 } : { x: -1, y: 0.15 }}
          expr={given && f < 150 ? "excited" : given ? "happy" : "surprised"}
          armL={given ? (f < 120 ? 130 : 26) : 14}
          armR={given ? (f < 120 ? -130 : -26) : -14}
          headTilt={given ? Math.sin(f / 7) * 4 : 0}
          blink={blinkAt(g, 3)}
        />
        <Lumi
          x={LUMI.x}
          y={LUMI.y}
          scale={LUMI.s}
          look={{ x: 0.75, y: 0.55 }}
          expr={given ? "happy" : "surprised"}
          armR={armR}
          armL={12}
          lean={given ? 1.5 : 0}
          headTilt={given ? 4 + Math.sin(f / 18) * 2 : 0}
          blink={blinkAt(g, 1)}
        />
        <GoldenKey x={keyX} y={keyY} scale={0.95} rotate={f < GIVE ? ip(f, [0, GIVE - 8], [0, 10]) : 10} glow={given ? 0.65 + Math.sin(g / 8) * 0.2 : 0.5} />
        <SparkBurst f={f} at={GIVE} x={keyRest.x} y={keyRest.y} reach={210} count={22} size={15} life={34} />
        <TinySprite
          x={sprite.x}
          y={sprite.y + hover}
          scale={0.55}
          frame={g}
          armsUp={f < GIVE}
          happy={given}
          look={{ x: -0.6, y: 0 }}
          wave={given && f < HOPAT ? 0.8 : 0}
          squash={1 - (f >= HOPAT + 18 ? Math.exp(-(f - HOPAT - 18) / 5) * 0.2 : 0)}
          blink={blinkAt(g, 2)}
        />
      </Cam>
    </Frame>
  );
};

const Scene6: React.FC = () => {
  const f = useCurrentFrame();
  const g = f + S.s6;
  const GLOW = 10; // the key lights up
  const MAP = 30; // the map opens
  const TEXT = 129; // 43.1s
  const ARM = ip(f, [4, 26], [-65, -82], EASE);
  const hand = lumiHand(LUMI.x, LUMI.y, LUMI.s, ARM);
  const key = { x: hand.x + 2, y: hand.y - 36 };
  const glow = ip(f, [GLOW, MAP], [0.65, 1.4], EASE) + (f >= MAP ? Math.sin(g / 6) * 0.15 : 0);
  const reveal = ip(f, [MAP, MAP + 22], [0, 1], Easing.out(Easing.back(1.25)));
  const pathOn = ip(f, [MAP + 16, MAP + 62], [0, 1], EASE);
  const forestOn = ip(f, [MAP + 40, MAP + 66], [0, 1], EASE);
  const pull = ip(f, [8, 54], [0, 1], EASE);
  const MAP_C = { x: 1120, y: 765 };
  const beam = ip(f, [MAP - 8, MAP + 6], [0, 1]);
  const amazed = f >= MAP - 4;
  const lumiTalks = f >= 52 && f < 112;
  const text = ip(f, [TEXT, TEXT + 18], [0, 1], EASE);
  const sub = ip(f, [TEXT + 10, TEXT + 28], [0, 1], EASE);
  const head = { x: BOBO.x, y: BOBO.y - 405 * BOBO.s };
  return (
    <>
      <Frame>
        <Cam cx={1120} cy={ip(pull, [0, 1], [1400, 1202])} z={ip(pull, [0, 1], [1.6, 1.12])}>
          <OutdoorSet g={g} />
          {beam > 0 && (
            <path
              d={`M ${key.x - 16} ${key.y} L ${MAP_C.x - 330} ${MAP_C.y + 280} L ${MAP_C.x + 330} ${MAP_C.y + 280} L ${key.x + 16} ${key.y} Z`}
              fill="url(#mapBeam)"
              opacity={beam * (0.5 + Math.sin(g / 5) * 0.08)}
            />
          )}
          <g transform={`translate(${MAP_C.x} ${MAP_C.y + Math.sin(g / 24) * 7})`}>
            <MagicMap frame={g} reveal={reveal} pathOn={pathOn} forestOn={forestOn} />
          </g>
          <Bobo
            x={BOBO.x}
            y={BOBO.y}
            scale={BOBO.s}
            look={amazed ? { x: -0.35, y: -1 } : { x: -1, y: 0.15 }}
            expr={amazed ? "excited" : "happy"}
            armL={amazed ? 40 : 26}
            armR={amazed ? -40 : -26}
            headTilt={0}
            blink={blinkAt(g, 3)}
          />
          <TinySprite x={head.x} y={head.y} scale={0.55} frame={g} look={{ x: -0.35, y: -1 }} blink={blinkAt(g, 2)} wave={0} />
          <Lumi
            x={LUMI.x}
            y={LUMI.y}
            scale={LUMI.s}
            look={amazed ? (lumiTalks && f < 74 ? { x: 1, y: -0.1 } : { x: 0.4, y: -1 }) : { x: 0.75, y: 0.55 }}
            expr={amazed ? "surprised" : "happy"}
            mouth={mouthAt("lumi", g)}
            armR={ARM}
            armL={amazed ? 20 : 12}
            headTilt={lumiTalks ? 4 + Math.sin(f / 12) * 2 : 2}
            blink={amazed ? blinkAt(g, 1) : blinkAt(g, 1)}
          />
          <GoldenKey x={key.x} y={key.y} scale={0.95} rotate={10} glow={glow} />
          <SparkBurst f={f} at={MAP} x={MAP_C.x} y={MAP_C.y} reach={520} count={30} size={18} life={36} />
        </Cam>
      </Frame>
      <AbsoluteFill style={{ alignItems: "center", fontFamily }}>
        <div
          style={{
            position: "absolute",
            top: 812,
            fontSize: 74,
            fontWeight: 600,
            color: "#fff6dc",
            opacity: text,
            transform: `translateY(${(1 - text) * 20}px)`,
            textShadow: "0 0 14px rgba(20, 16, 60, 0.95), 0 0 34px rgba(255, 210, 120, 0.7)",
          }}
        >
          To Be Continued... ✨
        </div>
        <div
          style={{
            position: "absolute",
            top: 904,
            fontSize: 48,
            fontWeight: 500,
            color: "#d4e2ff",
            opacity: sub,
            transform: `translateY(${(1 - sub) * 16}px)`,
            textShadow: "0 0 12px rgba(20, 16, 60, 0.95), 0 0 24px rgba(150, 190, 255, 0.6)",
          }}
        >
          Little Moon Story World 🌙
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

export const Episode2: React.FC = () => (
  <AbsoluteFill style={{ background: "#0a1238" }}>
    {scenes.map(([from, to, C], i) => (
      <Sequence key={i} from={from} durationInFrames={to - from + (to === S.end ? 0 : XF)}>
        <C />
      </Sequence>
    ))}
    <AbsoluteFill style={{ background: "radial-gradient(ellipse at center, transparent 55%, rgba(5, 8, 30, 0.55) 100%)" }} />
    <Audio src={staticFile("ep02/audio.wav")} />
  </AbsoluteFill>
);
