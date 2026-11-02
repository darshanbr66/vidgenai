import React from "react";
import { random } from "remotion";
import { Flower, Moon, Mushroom, Sparkle, StarField } from "../story/scenery";
import { CurlyPlant } from "../ep02/props";

export const RAINBOW = ["#ff6b6b", "#ff9f43", "#ffd93d", "#6bdc7a", "#4f9df0", "#b27bff"];
const TREE_COLORS = ["#ff6b6b", "#ff9f43", "#ffd93d", "#6bdc7a", "#4fd8e8", "#5e8bff", "#b27bff"]; // the same seven as the trees on the map

const hexToRgb = (h: string) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16));
export const mix = (a: string, b: string, t: number) => {
  const A = hexToRgb(a);
  const B = hexToRgb(b);
  const c = A.map((v, i) => Math.round(v + (B[i] - v) * Math.max(0, Math.min(1, t))));
  return `rgb(${c[0]}, ${c[1]}, ${c[2]})`;
};

export const Ep3Defs: React.FC = () => (
  <>
    <linearGradient id="dawnSky" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stopColor="#1f2266" />
      <stop offset="38%" stopColor="#5a48a4" />
      <stop offset="62%" stopColor="#c978b4" />
      <stop offset="82%" stopColor="#ffb98e" />
      <stop offset="100%" stopColor="#ffe0a0" />
    </linearGradient>
    <linearGradient id="forestFloor" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stopColor="#59c98b" />
      <stop offset="45%" stopColor="#2f9c80" />
      <stop offset="100%" stopColor="#1b5f60" />
    </linearGradient>
    <linearGradient id="forestHill" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stopColor="#8fd0a8" />
      <stop offset="100%" stopColor="#4aa58f" />
    </linearGradient>
    <linearGradient id="flowerStem" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0%" stopColor="#2f8f6a" />
      <stop offset="100%" stopColor="#57c08a" />
    </linearGradient>
    <radialGradient id="flowerBurst">
      <stop offset="0%" stopColor="#fffbe0" stopOpacity="1" />
      <stop offset="35%" stopColor="#fff0a8" stopOpacity="0.7" />
      <stop offset="100%" stopColor="#ffd36e" stopOpacity="0" />
    </radialGradient>
    <radialGradient id="butterflyHead" cx="42%" cy="35%" r="70%">
      <stop offset="0%" stopColor="#fffdf6" />
      <stop offset="100%" stopColor="#f2e4d6" />
    </radialGradient>
    <linearGradient id="clueGold" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stopColor="#fff8cc" />
      <stop offset="50%" stopColor="#ffd34f" />
      <stop offset="100%" stopColor="#f0a020" />
    </linearGradient>
  </>
);

// ---------- a rainbow tree: the same shape as the trees on the magical map ----------
export const RainbowTree: React.FC<{ x: number; y: number; s: number; c: string; frame: number; seed: number; glow?: number }> = ({ x, y, s, c, frame, seed, glow = 0.3 }) => (
  <g transform={`translate(${x} ${y}) rotate(${Math.sin(frame / 34 + seed) * 1.2}) scale(${s})`}>
    <circle cy={-60} r={96} fill="url(#softGlow)" opacity={glow * (0.8 + Math.sin(frame / 16 + seed) * 0.2)} />
    <rect x={-8} y={-26} width={16} height={38} rx={4} fill="#5b4a78" />
    <path d="M 0 -76 L 46 -20 L -46 -20 Z" fill={mix(c, "#2a1c66", 0.2)} stroke={mix(c, "#2a1c66", 0.2)} strokeWidth={5} strokeLinejoin="round" />
    <path d="M 0 -76 L -46 -20 L 0 -20 Z" fill="#fff" opacity={0.12} />
    <path d="M 0 -116 L 38 -60 L -38 -60 Z" fill={c} stroke={c} strokeWidth={5} strokeLinejoin="round" />
    <path d="M 0 -116 L -38 -60 L 0 -60 Z" fill="#fff" opacity={0.14} />
    {[
      [-10, -86, 2.4],
      [12, -72, 2],
      [-24, -38, 2.6],
      [8, -46, 2.2],
      [28, -30, 2.4],
    ].map(([bx, by, r], i) => (
      <circle key={i} cx={bx} cy={by} r={r} fill="#fff8d0" opacity={0.55 + Math.sin(frame / 9 + seed + i * 1.7) * 0.4} />
    ))}
  </g>
);

// ---------- the rainbow forest: everything behind the characters ----------
export const RainbowWorld: React.FC<{ g: number; arc?: number }> = ({ g, arc = 0 }) => (
  <>
    <rect x={-1200} y={-1400} width={5600} height={3400} fill="url(#dawnSky)" />
    <StarField frame={g} w={3400} h={760} count={130} seed="dawn" />
    <Moon x={2520} y={210} r={70} frame={g} />
    {arc > 0 && (
      <g opacity={arc * 0.8} transform="translate(2005 1400)">
        {RAINBOW.map((c, i) => (
          <path key={c} d={`M ${-(860 - i * 42)} 0 A ${860 - i * 42} ${860 - i * 42} 0 0 1 ${860 - i * 42} 0`} stroke={c} strokeWidth={42} fill="none" strokeDasharray={`${arc * 2800} 4000`} />
        ))}
      </g>
    )}
    <path d="M -1200 1360 Q -300 1190 500 1320 Q 1300 1180 2100 1310 Q 2900 1190 4400 1360 L 4400 2000 L -1200 2000 Z" fill="url(#forestHill)" />
    {Array.from({ length: 24 }, (_, i) => (
      <RainbowTree key={i} x={-260 + i * 170} y={1390 + (i % 3) * 12} s={2 + (i % 2) * 0.3} c={TREE_COLORS[(i * 3) % 7]} frame={g} seed={i} glow={0.18} />
    ))}
    <path d="M -1200 1480 Q 0 1420 1000 1490 Q 2000 1410 3000 1490 Q 3700 1430 4400 1480 L 4400 3000 L -1200 3000 Z" fill="url(#forestFloor)" />
    {Array.from({ length: 13 }, (_, i) => {
      const x = -100 + i * 322 + (i % 2) * 44;
      return <RainbowTree key={i} x={x} y={1590 + (i % 2) * 30} s={4.3 + (i % 3) * 0.55} c={TREE_COLORS[i % 7]} frame={g} seed={i + 40} glow={0.28} />;
    })}
    {[
      [120, 1640, "#7ff6ff", 1.3],
      [560, 1650, "#ff9ad5", 1.4],
      [1460, 1640, "#b59bff", 1.3],
      [1820, 1640, "#7ff6ff", 1.2],
      [2200, 1650, "#ffd36e", 1.3],
      [2720, 1640, "#ff9ad5", 1.4],
    ].map(([x, y, c, s], i) => (
      <CurlyPlant key={i} x={x as number} y={y as number} color={c as string} scale={s as number} frame={g} seed={i} />
    ))}
    {[
      [330, 1680, "cyan", 1],
      [880, 1670, "pink", 0.9],
      [1300, 1700, "cyan", 1],
      [1560, 1690, "pink", 1.1],
      [2470, 1680, "cyan", 1],
      [2860, 1700, "pink", 1.1],
    ].map(([x, y, c, s], i) => (
      <Mushroom key={i} x={x as number} y={y as number} color={c as "cyan" | "pink"} scale={s as number} frame={g} seed={i} />
    ))}
    {Array.from({ length: 34 }, (_, i) => {
      const x = -80 + i * 96 + (i % 3) * 24;
      const y = 1730 + ((i * 53) % 90) + ((i * 17) % 3 === 0 ? 170 : 0);
      return <Flower key={i} x={x} y={y} color={["#ff8fa0", "#ffc75e", "#fff08a", "#8fe39c", "#7fc8ff", "#c9a0ff"][i % 6]} frame={g} seed={i} scale={0.85 + (i % 3) * 0.16} />;
    })}
  </>
);

// The soft colored lights that drift between the trees
export const DriftLights: React.FC<{ frame: number; x: number; y: number; w: number; h: number; count?: number; seed?: string; size?: number }> = ({ frame, x, y, w, h, count = 22, seed = "lights", size = 1 }) => (
  <g>
    {Array.from({ length: count }, (_, i) => {
      const px = x + random(`${seed}x${i}`) * w + Math.sin(frame / 32 + i * 1.3) * 56;
      const py = y + random(`${seed}y${i}`) * h + Math.cos(frame / 27 + i * 2.1) * 44 - ((frame * 0.7) % 90);
      const c = RAINBOW[i % 6];
      const on = 0.55 + 0.45 * Math.sin(frame / 11 + i * 1.9);
      return (
        <g key={i} opacity={on}>
          <circle cx={px} cy={py} r={46 * size} fill={c} opacity={0.32} />
          <circle cx={px} cy={py} r={20 * size} fill={c} opacity={0.7} />
          <circle cx={px} cy={py} r={7 * size} fill="#fff" />
        </g>
      );
    })}
  </g>
);

// ---------- the little butterfly: origin at the middle of its body ----------
const UPPER = "M 6 -10 C 28 -84 112 -122 146 -78 C 172 -38 124 18 70 18 C 42 18 18 10 6 0 Z";
const LOWER = "M 6 6 C 42 8 96 18 104 58 C 110 92 72 110 46 92 C 22 74 8 40 6 12 Z";
const PEARL = "#fbf6f0";
const PEARL_DARK = "#e7dfe8";

const Wing: React.FC<{ path: string; color: number; rootY: number }> = ({ path, color, rootY }) => (
  <g>
    <path d={path} fill={PEARL} stroke="#b9acd0" strokeWidth={4.5} strokeLinejoin="round" />
    {RAINBOW.map((c, i) => {
      const k = 0.96 - i * 0.15;
      // each band arrives in turn, so color spreads across the wing
      const t = Math.max(0, Math.min(1, color * 6 - i * 0.85));
      return <path key={c} d={path} fill={mix(i % 2 ? PEARL : PEARL_DARK, c, t)} transform={`translate(6 ${rootY}) scale(${k}) translate(-6 ${-rootY})`} />;
    })}
  </g>
);

export type ButterflyMood = "sad" | "happy" | "talk" | "surprised";

export const Butterfly: React.FC<{
  x: number;
  y: number;
  scale?: number;
  frame: number;
  color?: number; // 0 = white, 1 = full rainbow
  mood?: ButterflyMood;
  flapRate?: number; // radians per frame
  mouth?: number;
  look?: { x: number; y: number };
  rotate?: number;
  droop?: number; // 0..1 how far the wings sag
  blink?: number;
}> = ({ x, y, scale = 1, frame, color = 0, mood = "sad", flapRate = 0.16, mouth = 0, look = { x: 0, y: 0 }, rotate = 0, droop = 0, blink = 1 }) => {
  const beat = Math.cos(frame * flapRate);
  const open = flapRate < 0.4 ? 0.8 + beat * 0.12 : 0.66 + beat * 0.3;
  const sag = droop * 15;
  const wings = (side: -1 | 1) => (
    <g transform={`scale(${side * open} 1) rotate(${sag})`}>
      <Wing path={LOWER} color={color} rootY={8} />
      <Wing path={UPPER} color={color} rootY={-4} />
      <circle cx={92} cy={-52} r={9} fill="#fff" opacity={0.85} />
      <circle cx={64} cy={-40} r={5} fill="#fff" opacity={0.7} />
      <circle cx={62} cy={66} r={7} fill="#fff" opacity={0.75} />
    </g>
  );
  const happy = mood === "happy";
  const surprised = mood === "surprised";
  const sadFace = mood === "sad";
  const talking = mouth > 0.06;
  const eye = (side: -1 | 1) => {
    if (happy && !talking && blink > 0.5)
      return <path key={side} d={`M ${side * 19 - 13} -42 Q ${side * 19} -58 ${side * 19 + 13} -42`} stroke="#3a2b55" strokeWidth={5.5} strokeLinecap="round" fill="none" />;
    return (
      <g key={side} transform={`translate(${side * 19} -44) scale(${surprised ? 1.14 : 1} ${(surprised ? 1.14 : 1) * blink})`}>
        <ellipse rx={15} ry={18} fill="#3a2b55" />
        <circle cx={look.x * 3} cy={look.y * 3} r={9} fill="#57407f" />
        <circle cx={-5 + look.x * 2} cy={-7 + look.y * 2} r={6} fill="#fff" />
        <circle cx={5 + look.x * 2} cy={6 + look.y * 2} r={2.6} fill="#fff" opacity={0.9} />
        {sadFace && <path d={`M -18 -22 L 18 -22 L 18 ${side === 1 ? -3 : -13} L -18 ${side === 1 ? -13 : -3} Z`} fill="#f9f1e6" />}
      </g>
    );
  };
  return (
    <g transform={`translate(${x} ${y}) rotate(${rotate}) scale(${scale})`}>
      <circle r={180 + color * 30} fill={color > 0.5 ? "url(#flowerBurst)" : "url(#softGlow)"} opacity={0.14 + color * 0.26} />
      {wings(-1)}
      {wings(1)}
      {/* round fluffy body */}
      <ellipse cy={32} rx={21} ry={38} fill={mix("#d6cce0", "#8e6fd8", color)} />
      {[14, 32, 50].map((by) => (
        <path key={by} d={`M -19 ${by} Q 0 ${by + 7} 19 ${by}`} stroke="#fff" strokeOpacity={0.55} strokeWidth={4} fill="none" strokeLinecap="round" />
      ))}
      {/* antennae curled like question marks */}
      {[-1, 1].map((s) => (
        <g key={s}>
          <path d={`M ${s * 10} -70 Q ${s * 14} -106 ${s * 38} -110 Q ${s * 58} -108 ${s * 50} -92`} stroke="#6d5a91" strokeWidth={5} strokeLinecap="round" fill="none" />
          <circle cx={s * 50} cy={-92} r={8} fill={mix("#efe6d8", "#ffd34f", color)} />
        </g>
      ))}
      {/* big round head */}
      <circle cy={-36} r={40} fill="url(#butterflyHead)" stroke="#d8c9d0" strokeWidth={2.5} />
      <ellipse cx={-26} cy={-22} rx={9} ry={6} fill="#ff97a6" opacity={sadFace ? 0.3 : 0.65} />
      <ellipse cx={26} cy={-22} rx={9} ry={6} fill="#ff97a6" opacity={sadFace ? 0.3 : 0.65} />
      {eye(-1)}
      {eye(1)}
      {[-1, 1].map((s) => (
        <path
          key={s}
          d={sadFace ? `M ${s * 28} -62 Q ${s * 18} -72 ${s * 8} -70` : `M ${s * 28} -70 Q ${s * 18} -76 ${s * 8} -70`}
          stroke="#6d5a91"
          strokeWidth={4}
          strokeLinecap="round"
          fill="none"
          transform={sadFace ? `rotate(${s * -12} ${s * 18} -68)` : undefined}
        />
      ))}
      {talking && sadFace ? (
        <ellipse cy={-17} rx={6 + mouth * 2} ry={2.5 + mouth * 7} fill="#86303d" />
      ) : talking ? (
        <path d={`M -9 -21 Q 0 -24 9 -21 Q 8 ${-20 + mouth * 15} 0 ${-20 + mouth * 16} Q -8 ${-20 + mouth * 15} -9 -21 Z`} fill="#86303d" />
      ) : happy ? (
        <path d="M -11 -23 Q 0 -8 11 -23 Z" fill="#86303d" stroke="#86303d" strokeWidth={2.5} strokeLinejoin="round" />
      ) : surprised ? (
        <ellipse cy={-18} rx={5} ry={6.5} fill="#86303d" />
      ) : sadFace ? (
        <path d="M -8 -15 Q 0 -24 8 -15" stroke="#6d5a91" strokeWidth={4} strokeLinecap="round" fill="none" />
      ) : (
        <path d="M -8 -21 Q 0 -13 8 -21" stroke="#86303d" strokeWidth={4} strokeLinecap="round" fill="none" />
      )}
    </g>
  );
};

// ---------- the magical flower: origin at the ground, about 520 tall at scale 1 ----------
export const FLOWER_HEART_Y = -330;

export const MagicFlower: React.FC<{ x: number; y: number; scale?: number; life: number; frame: number }> = ({ x, y, scale = 1, life, frame }) => {
  const tilt = (1 - life) * -11 + Math.sin(frame / 30) * 1.4;
  const petalColor = (i: number) => mix("#b8b0c0", TREE_COLORS[i % 7], life);
  const openness = 0.72 + life * 0.28;
  return (
    <g transform={`translate(${x} ${y}) scale(${scale})`}>
      <path d={`M -14 0 Q -22 -170 ${tilt * 1.8 - 10} ${FLOWER_HEART_Y} L ${tilt * 1.8 + 10} ${FLOWER_HEART_Y} Q 22 -170 14 0 Z`} fill="url(#flowerStem)" />
      {[-1, 1].map((s) => (
        <path
          key={s}
          d={`M 0 -70 Q ${s * 90} -170 ${s * 196} ${-120 - life * 48} Q ${s * 130} -50 0 -40 Z`}
          fill={mix("#7fa08c", "#4cc58a", life)}
          stroke="#2f7f62"
          strokeWidth={3}
        />
      ))}
      <g transform={`translate(${tilt * 1.8} ${FLOWER_HEART_Y}) rotate(${tilt})`}>
        <circle r={180 + life * 240} fill="url(#flowerBurst)" opacity={0.08 + life * (0.68 + Math.sin(frame / 7) * 0.12)} />
        {Array.from({ length: 12 }, (_, i) => (
          <ellipse key={i} cy={-112 * openness} rx={40} ry={78 * openness} fill={petalColor(i)} stroke={mix("#8d8598", "#fff", life)} strokeOpacity={0.7} strokeWidth={3} transform={`rotate(${(i / 12) * 360 + 15})`} />
        ))}
        {Array.from({ length: 8 }, (_, i) => (
          <ellipse key={i} cy={-70 * openness} rx={32} ry={54 * openness} fill={petalColor(i + 3)} stroke={mix("#8d8598", "#fff", life)} strokeOpacity={0.6} strokeWidth={2.5} transform={`rotate(${(i / 8) * 360})`} />
        ))}
        <circle r={60} fill={mix("#231d38", "#ffd34f", life)} stroke={mix("#3a3350", "#fff4b8", life)} strokeWidth={7} />
        <circle r={32} fill={mix("#15112a", "#fffbe0", life)} />
        {Array.from({ length: 10 }, (_, i) => {
          const a = (i / 10) * Math.PI * 2;
          return <circle key={i} cx={Math.cos(a) * 46} cy={Math.sin(a) * 46} r={4.5} fill={mix("#4b4366", "#fff", life)} />;
        })}
      </g>
    </g>
  );
};

// The bloom the butterfly is found on: flat top at (0, -250)
export const RestingBloom: React.FC<{ x: number; y: number; frame: number }> = ({ x, y, frame }) => (
  <g transform={`translate(${x} ${y}) rotate(${Math.sin(frame / 34) * 0.8})`}>
    <path d="M -9 0 Q -16 -130 -5 -250 L 5 -250 Q 16 -130 9 0 Z" fill="url(#flowerStem)" />
    <path d="M 0 -80 Q 70 -150 136 -116 Q 80 -56 0 -54 Z" fill="#4cc58a" stroke="#2f7f62" strokeWidth={3} />
    <path d="M 0 -130 Q -66 -190 -130 -160 Q -80 -102 0 -104 Z" fill="#4cc58a" stroke="#2f7f62" strokeWidth={3} />
    <g transform="translate(0 -250)">
      {Array.from({ length: 9 }, (_, i) => (
        <ellipse key={i} cy={-46} rx={23} ry={46} fill={i % 2 ? "#ff9ad5" : "#ffb8e4"} stroke="#e070b0" strokeWidth={2.5} transform={`rotate(${(i / 9) * 180 - 90}) scale(1 ${0.9 + (i % 3) * 0.05})`} />
      ))}
      <ellipse rx={84} ry={25} fill="#ffb8e4" stroke="#e070b0" strokeWidth={2.5} />
      <ellipse rx={30} ry={13} fill="#fff08a" />
    </g>
  </g>
);

// The low bed of leaves and flowers in front of the kneeling Lumi
export const FrontBed: React.FC<{ x: number; y: number; width: number; g: number }> = ({ x, y, width, g }) => {
  const n = Math.round(width / 72);
  return (
    <g>
      {Array.from({ length: n }, (_, i) => {
        const cx = x - width / 2 + (i + 0.5) * (width / n);
        return <circle key={i} cx={cx} cy={y + 60 + (i % 2) * 18} r={62 + (i % 3) * 13} fill={i % 2 ? "#41907f" : "#4c9f8b"} />;
      })}
      <rect x={x - width / 2 - 50} y={y + 86} width={width + 100} height={1100} fill="#41907f" />
      {[0, 1, 2, 3, 4].map((row) =>
        Array.from({ length: n }, (_, i) => {
          const cx = x - width / 2 + (i + 0.5 + (row % 2) * 0.5) * (width / n);
          return <Flower key={`${row}-${i}`} x={cx} y={y + 96 + row * 88 + (i % 2) * 26} color={["#e88f9c", "#e8bb68", "#efe391", "#94d6a0", "#8cc0ec", "#bda3e6"][(i + row * 2) % 6]} frame={g} seed={i + row * 5} scale={1.1 + row * 0.16} />;
        }),
      )}
    </g>
  );
};

// ---------- a tiny ladybug: origin at the middle of its back ----------
export const Ladybug: React.FC<{ x: number; y: number; scale?: number; frame: number; onBack?: boolean; happy?: boolean; rotate?: number }> = ({ x, y, scale = 1, frame, onBack = false, happy = false, rotate = 0 }) => {
  const kick = onBack ? Math.sin(frame * 0.9) * 26 : Math.sin(frame * 0.4) * 5;
  return (
    <g transform={`translate(${x} ${y}) rotate(${rotate + (onBack ? 180 : 0)}) scale(${scale})`}>
      {[-22, 0, 22].map((lx, i) => (
        <g key={lx}>
          <path d={`M ${lx} 14 L ${lx - 6 + (i % 2 ? kick : -kick) * 0.4} 34`} stroke="#2b1b28" strokeWidth={5} strokeLinecap="round" />
        </g>
      ))}
      <path d="M -40 14 A 40 36 0 0 1 40 14 Z" fill="#f04e4e" stroke="#a82828" strokeWidth={3} />
      <path d="M 0 -22 L 0 14" stroke="#2b1b28" strokeWidth={4} />
      {[
        [-20, -6, 7],
        [20, -6, 7],
        [-10, 6, 4.5],
        [11, 6, 4.5],
      ].map(([sx, sy, r], i) => (
        <circle key={i} cx={sx} cy={sy} r={r} fill="#2b1b28" />
      ))}
      {/* head: stays on the upper side so its face never turns upside-down */}
      <g transform={`translate(38 ${onBack ? 0 : 0}) rotate(${onBack ? 180 : 0})`}>
        <circle r={19} fill="#2b1b28" />
        <circle cx={-6} cy={-4} r={6} fill="#fff" />
        <circle cx={7} cy={-4} r={6} fill="#fff" />
        <circle cx={-5} cy={-3} r={3} fill="#111" />
        <circle cx={8} cy={-3} r={3} fill="#111" />
        <path d={happy ? "M -7 6 Q 1 13 9 6" : "M -6 10 Q 1 4 8 10"} stroke="#fff" strokeWidth={2.4} strokeLinecap="round" fill="none" />
      </g>
    </g>
  );
};

// ---------- the three gifts: a glowing orb with its symbol ----------
export type Gift = "dew" | "kind" | "smile";
const GIFT_COLOR: Record<Gift, string> = { dew: "#7fe0ff", kind: "#ff8fc0", smile: "#ffd34f" };

export const GiftSymbol: React.FC<{ type: Gift; color?: string }> = ({ type, color }) => {
  const c = color ?? "#fff";
  if (type === "dew") return <path d="M 0 -32 C 14 -12 25 0 25 12 A 25 25 0 0 1 -25 12 C -25 0 -14 -12 0 -32 Z" fill={c} />;
  if (type === "kind") return <path d="M 0 28 C -40 0 -32 -28 -14 -28 C -6 -28 -2 -22 0 -16 C 2 -22 6 -28 14 -28 C 32 -28 40 0 0 28 Z" fill={c} />;
  return (
    <g fill="none" stroke={c} strokeWidth={7} strokeLinecap="round">
      <circle cx={-13} cy={-10} r={3} fill={c} />
      <circle cx={13} cy={-10} r={3} fill={c} />
      <path d="M -19 7 Q 0 28 19 7" />
    </g>
  );
};

export const GiftOrb: React.FC<{ x: number; y: number; type: Gift; scale?: number; opacity?: number; frame: number }> = ({ x, y, type, scale = 1, opacity = 1, frame }) => (
  <g transform={`translate(${x} ${y}) scale(${scale * (1 + Math.sin(frame / 6) * 0.05)})`} opacity={opacity}>
    <circle r={100} fill={GIFT_COLOR[type]} opacity={0.3} />
    <circle r={58} fill={GIFT_COLOR[type]} stroke="#fff" strokeWidth={5} />
    <GiftSymbol type={type} />
  </g>
);

// The row of three empty circles that fills as each gift is found
export const GiftTracker: React.FC<{ frame: number; filled: Record<Gift, number>; opacity: number }> = ({ frame, filled, opacity }) => (
  <g opacity={opacity}>
    {(["dew", "kind", "smile"] as Gift[]).map((t, i) => {
      const x = 540 + (i - 1) * 190;
      const on = filled[t];
      const pop = on > 0 && on < 1 ? 1 + Math.sin(on * Math.PI) * 0.35 : 1;
      return (
        <g key={t} transform={`translate(${x} 215) scale(${pop})`}>
          <circle r={72} fill="#1f2266" opacity={0.62} stroke="#fff" strokeWidth={4} strokeDasharray={on >= 1 ? undefined : "9 10"} />
          <g opacity={0.45}>
            <GiftSymbol type={t} color="#cfd4f4" />
          </g>
          {on > 0 && <GiftOrb x={0} y={0} type={t} scale={on} frame={frame} />}
        </g>
      );
    })}
  </g>
);

// ---------- the next clue: a golden star with a tiny keyhole ----------
export const GoldenClue: React.FC<{ x: number; y: number; scale?: number; frame: number; opacity?: number }> = ({ x, y, scale = 1, frame, opacity = 1 }) => {
  const pts = Array.from({ length: 10 }, (_, i) => {
    const a = -Math.PI / 2 + (i * Math.PI) / 5;
    const r = i % 2 === 0 ? 120 : 56;
    return `${(Math.cos(a) * r).toFixed(1)},${(Math.sin(a) * r).toFixed(1)}`;
  }).join(" ");
  return (
    <g transform={`translate(${x} ${y}) scale(${scale * (1 + Math.sin(frame / 7) * 0.04)})`} opacity={opacity}>
      <g transform={`rotate(${frame * 0.7})`}>
        {Array.from({ length: 10 }, (_, i) => (
          <path key={i} d="M -13 -60 L 0 -300 L 13 -60 Z" fill="#fff0a8" opacity={i % 2 ? 0.3 : 0.5} transform={`rotate(${i * 36})`} />
        ))}
      </g>
      <circle r={210} fill="url(#flowerBurst)" opacity={0.75} />
      <polygon points={pts} fill="url(#clueGold)" stroke="#fff3b0" strokeWidth={16} strokeLinejoin="round" />
      <polygon points={pts} fill="none" stroke="#c07c10" strokeWidth={3} strokeLinejoin="round" />
      {/* the keyhole: the golden key from Episode 2 must fit somewhere... */}
      <circle cy={-12} r={15} fill="#6d4308" />
      <path d="M -8 -6 L -14 28 L 14 28 L 8 -6 Z" fill="#6d4308" />
    </g>
  );
};
