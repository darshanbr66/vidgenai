import React from "react";
import { random } from "remotion";
import { Sparkle } from "../story/scenery";
import { SnowflakePendant } from "../ep07/props";

// Episode 8 characters and props in the series' 2D style, drawn over the 3D jungle.

export const Ep8Defs: React.FC<{ lit?: number }> = ({ lit = 1 }) => {
  // Warm, leafy daylight on the 2D characters; a little duller while the jungle loses its life
  const k = Math.max(0.6, Math.min(1.12, lit));
  return (
    <>
      <filter id="jungleLit" colorInterpolationFilters="sRGB" x="-20%" y="-20%" width="140%" height="140%">
        <feColorMatrix type="matrix" values={`${1.0 * k} 0 0 0 0.02  0 ${1.0 * k} 0 0 0.03  0 0 ${0.93 * k} 0 0.0  0 0 0 1 0`} />
      </filter>
      <filter id="toGreen" colorInterpolationFilters="sRGB">
        <feColorMatrix type="hueRotate" values="-95" />
        <feColorMatrix type="saturate" values="1.4" />
      </filter>
      <radialGradient id="kikoFur" cx="40%" cy="30%" r="75%">
        <stop offset="0%" stopColor="#f0b860" />
        <stop offset="65%" stopColor="#d08a3a" />
        <stop offset="100%" stopColor="#a8682a" />
      </radialGradient>
      <radialGradient id="kikoFace" cx="45%" cy="35%" r="70%">
        <stop offset="0%" stopColor="#fff0d8" />
        <stop offset="100%" stopColor="#f2cc9a" />
      </radialGradient>
      <radialGradient id="kikoIris" cx="45%" cy="40%" r="60%">
        <stop offset="0%" stopColor="#a8703a" />
        <stop offset="100%" stopColor="#4a2a12" />
      </radialGradient>
      <radialGradient id="leafGlow" cx="50%" cy="50%" r="50%">
        <stop offset="0%" stopColor="#f4fff0" stopOpacity="1" />
        <stop offset="35%" stopColor="#9fff8f" stopOpacity="0.65" />
        <stop offset="100%" stopColor="#5fd860" stopOpacity="0" />
      </radialGradient>
      <linearGradient id="mapJungle" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#2f7a4a" />
        <stop offset="100%" stopColor="#14482a" />
      </linearGradient>
      <linearGradient id="greenBeam" x1="0" y1="0" x2="1" y2="0">
        <stop offset="0%" stopColor="#d8ffc8" stopOpacity="0.9" />
        <stop offset="100%" stopColor="#ffd86f" stopOpacity="0.45" />
      </linearGradient>
    </>
  );
};

// ---------- Kiko, the little golden monkey. Facing forward, (0, 0) at his feet; about 420 tall at scale 1 ----------
export type KikoMood = "happy" | "joy" | "worried" | "surprised" | "excited" | "neutral";

export const Kiko: React.FC<{
  x: number;
  y: number;
  scale?: number;
  g: number;
  look?: { x: number; y: number };
  mood?: KikoMood;
  mouth?: number;
  blink?: number;
  armL?: number; // like Lumi: positive raises the left arm
  armR?: number; // negative raises the right arm
  legs?: number; // 0 standing .. 1 tucked up (swinging, jumping)
  squash?: number;
  lean?: number;
  headTilt?: number;
  tailSwish?: number;
}> = ({ x, y, scale = 1, g, look = { x: 0, y: 0 }, mood = "happy", mouth = 0, blink = 1, armL = 14, armR = -14, legs = 0, squash = 1, lean = 0, headTilt = 0, tailSwish = 0.7 }) => {
  const talking = mouth > 0.06;
  const worried = mood === "worried";
  const big = mood === "surprised" || mood === "excited" ? 1.1 : 1;
  const sw = Math.sin(g / 8) * 10 * tailSwish;
  const eye = (side: -1 | 1) => {
    const cx = side * 36;
    if (mood === "joy" && !talking && blink > 0.5) return <path key={side} d={`M ${cx - 20} 4 Q ${cx} -20 ${cx + 20} 4`} stroke="#3a2010" strokeWidth={7} strokeLinecap="round" fill="none" />;
    return (
      <g key={side} transform={`translate(${cx} -4) scale(${big} ${big * blink})`}>
        <ellipse rx={24} ry={29} fill="#fff" />
        <g transform={`translate(${look.x * 6} ${look.y * 8})`}>
          <circle r={19} fill="url(#kikoIris)" />
          <circle r={9.5} fill="#1c0f06" />
          <circle cx={-6} cy={-8} r={6.5} fill="#fff" />
          <circle cx={6} cy={7} r={3} fill="#fff" opacity={0.9} />
        </g>
      </g>
    );
  };
  const brow = (side: -1 | 1) => {
    const by = mood === "surprised" || mood === "excited" ? -44 : -37;
    return <path key={side} d={`M ${side * 36 - 14} ${by} Q ${side * 36} ${by - 7} ${side * 36 + 14} ${by}`} transform={`rotate(${worried ? side * -16 : 0} ${side * 36} ${by})`} stroke="#7a4a20" strokeWidth={5} strokeLinecap="round" fill="none" />;
  };
  const mouthShape = talking ? (
    <g>
      <path d={`M -14 40 Q 0 36 14 40 Q 11 ${44 + mouth * 15} 0 ${46 + mouth * 17} Q -11 ${44 + mouth * 15} -14 40 Z`} fill="#7a2a28" />
      <ellipse cx={0} cy={43 + mouth * 12} rx={7} ry={2.6 + mouth * 2.6} fill="#ff8f8f" />
    </g>
  ) : worried ? (
    <path d="M -11 46 Q 0 38 11 46" stroke="#7a2a28" strokeWidth={4.5} strokeLinecap="round" fill="none" />
  ) : mood === "surprised" ? (
    <ellipse cx={0} cy={44} rx={7} ry={9} fill="#7a2a28" />
  ) : mood === "neutral" ? (
    <path d="M -10 42 Q 0 48 10 42" stroke="#7a2a28" strokeWidth={4.5} strokeLinecap="round" fill="none" />
  ) : (
    <path d="M -17 38 Q 0 60 17 38 Z" fill="#7a2a28" stroke="#7a2a28" strokeWidth={3} strokeLinejoin="round" />
  );
  const arm = (side: -1 | 1, angle: number) => (
    <g transform={`translate(${side * 52} -178) rotate(${angle})`}>
      <rect x={-15} y={-6} width={30} height={108} rx={15} fill="url(#kikoFur)" />
      <ellipse cx={0} cy={106} rx={17} ry={15} fill="#f0c08a" />
    </g>
  );
  const leg = (side: -1 | 1) => (
    <g transform={`translate(${side * 26} ${-70 + legs * 26}) rotate(${side * legs * -55})`}>
      <rect x={-15} y={0} width={30} height={64 - legs * 18} rx={15} fill="url(#kikoFur)" />
      <ellipse cx={side * 6} cy={64 - legs * 18} rx={21} ry={12} fill="#f0c08a" />
    </g>
  );
  return (
    <g transform={`translate(${x} ${y}) scale(${scale}) rotate(${lean}) scale(${1 / Math.sqrt(squash)} ${squash})`}>
      <ellipse cx={0} cy={4} rx={80} ry={15} fill="url(#shadow)" opacity={1 - legs * 0.6} />
      {/* the long curly tail */}
      <path
        d={`M 30 -90 C 110 -80 ${130 + sw} -170 ${110 + sw * 1.4} -240 C ${100 + sw * 1.6} -280 ${60 + sw * 1.5} -285 ${62 + sw * 1.4} -250 C ${64 + sw * 1.3} -225 ${90 + sw * 1.3} -230 ${88 + sw * 1.4} -252`}
        stroke="#c07a34"
        strokeWidth={17}
        strokeLinecap="round"
        fill="none"
      />
      <path d={`M 30 -90 C 110 -80 ${130 + sw} -170 ${110 + sw * 1.4} -240`} stroke="#e8a85a" strokeWidth={5} strokeLinecap="round" fill="none" opacity={0.6} />
      {leg(-1)}
      {leg(1)}
      {arm(-1, armL)}
      {arm(1, armR)}
      <ellipse cx={0} cy={-128} rx={62} ry={72} fill="url(#kikoFur)" />
      <ellipse cx={0} cy={-118} rx={40} ry={50} fill="url(#kikoFace)" />
      {/* head */}
      <g transform={`translate(0 -292) rotate(${headTilt})`}>
        {[-1, 1].map((sd) => (
          <g key={sd} transform={`translate(${sd * 94} -2)`}>
            <circle r={31} fill="url(#kikoFur)" />
            <circle r={18} fill="#f2c494" />
          </g>
        ))}
        <circle r={96} fill="url(#kikoFur)" />
        {/* tuft of fur on top */}
        <path d="M -22 -88 Q -14 -122 0 -96 Q 10 -128 18 -94 Q 32 -116 30 -86 Z" fill="url(#kikoFur)" />
        {/* the light face: two rounded eye areas and a muzzle */}
        <ellipse cx={-34} cy={-6} rx={42} ry={46} fill="url(#kikoFace)" />
        <ellipse cx={34} cy={-6} rx={42} ry={46} fill="url(#kikoFace)" />
        <ellipse cx={0} cy={36} rx={56} ry={40} fill="url(#kikoFace)" />
        <ellipse cx={-62} cy={30} rx={15} ry={9} fill="#ff9f8f" opacity={worried ? 0.3 : 0.55} />
        <ellipse cx={62} cy={30} rx={15} ry={9} fill="#ff9f8f" opacity={worried ? 0.3 : 0.55} />
        {eye(-1)}
        {eye(1)}
        {brow(-1)}
        {brow(1)}
        <ellipse cx={-7} cy={24} rx={4.5} ry={3.5} fill="#5a3418" />
        <ellipse cx={7} cy={24} rx={4.5} ry={3.5} fill="#5a3418" />
        {mouthShape}
        {/* his tiny green leaf */}
        <g transform={`translate(44 -86) rotate(${28 + Math.sin(g / 11) * 6})`}>
          <path d="M 0 0 C -18 -14 -16 -44 0 -58 C 16 -44 18 -14 0 0 Z" fill="#4fc04a" stroke="#2f8a2f" strokeWidth={3} strokeLinejoin="round" />
          <path d="M 0 -2 L 0 -50 M 0 -16 L -9 -26 M 0 -16 L 9 -26 M 0 -32 L -7 -40 M 0 -32 L 7 -40" stroke="#2f8a2f" strokeWidth={2.5} strokeLinecap="round" />
        </g>
      </g>
    </g>
  );
};

// Where Kiko's hands are (side 1 = his right, on screen right)
export const kikoHand = (x: number, y: number, scale: number, angle: number, side: -1 | 1 = 1) => {
  const a = (angle * Math.PI) / 180;
  return { x: x + (side * 52 - 106 * Math.sin(a)) * scale, y: y + (-178 + 106 * Math.cos(a)) * scale };
};

// ---------- a hanging jungle vine from a point up in the trees to a hand ----------
export const Vine: React.FC<{ top: { x: number; y: number }; end: { x: number; y: number }; g: number; scale: number }> = ({ top, end, g, scale }) => {
  const mx = (top.x + end.x) / 2 + Math.sin(g / 6) * 20;
  const my = (top.y + end.y) / 2;
  return (
    <g>
      <path d={`M ${top.x} ${top.y} Q ${mx} ${my} ${end.x} ${end.y}`} stroke="#3f7f2f" strokeWidth={9 * scale + 3} fill="none" strokeLinecap="round" />
      {[0.25, 0.5, 0.75].map((k, i) => {
        const x = (1 - k) * (1 - k) * top.x + 2 * (1 - k) * k * mx + k * k * end.x;
        const y = (1 - k) * (1 - k) * top.y + 2 * (1 - k) * k * my + k * k * end.y;
        return <ellipse key={i} cx={x + (i % 2 ? 14 : -14) * scale} cy={y} rx={14 * scale + 4} ry={7 * scale + 2} transform={`rotate(${i % 2 ? 30 : -30} ${x} ${y})`} fill="#5fc04a" />;
      })}
    </g>
  );
};

// ---------- the snowflake pendant turning green ----------
export const ChangingPendant: React.FC<{ x: number; y: number; scale: number; g: number; green: number; glow?: number }> = ({ x, y, scale, g, green, glow = 0.8 }) => (
  <>
    {green < 1 && (
      <g opacity={1 - green}>
        <SnowflakePendant x={x} y={y} scale={scale} g={g} glow={glow} />
      </g>
    )}
    {green > 0 && (
      <g opacity={green} filter="url(#toGreen)">
        <SnowflakePendant x={x} y={y} scale={scale} g={g} glow={glow} />
      </g>
    )}
    {green > 0 && <circle cx={x} cy={y} r={70 * scale} fill="url(#leafGlow)" opacity={green * 0.5 * glow} />}
  </>
);

// ---------- the little glowing leaf pendant Kiko gives Lumi ----------
export const LeafPendant: React.FC<{ x: number; y: number; scale?: number; g: number; glow?: number }> = ({ x, y, scale = 1, g, glow = 0.5 }) => (
  <g transform={`translate(${x} ${y}) scale(${scale}) rotate(${Math.sin(g / 9) * 6})`}>
    <circle r={80} fill="url(#leafGlow)" opacity={0.3 + glow * 0.6} />
    <circle cy={-48} r={7} fill="none" stroke="#f0ffe8" strokeWidth={4} />
    <path d="M 0 -40 C -30 -24 -30 22 0 42 C 30 22 30 -24 0 -40 Z" fill="#6fe06a" stroke="#2f9a3a" strokeWidth={4} strokeLinejoin="round" />
    <path d="M 0 -34 L 0 36 M 0 -10 L -14 -20 M 0 -10 L 14 -20 M 0 10 L -14 0 M 0 10 L 14 0" stroke="#2f9a3a" strokeWidth={3} strokeLinecap="round" />
    <ellipse cx={-9} cy={-14} rx={5} ry={9} fill="#fff" opacity={0.55} transform="rotate(20 -9 -14)" />
  </g>
);

// ---------- the magic map of the ancient jungle; origin at its center ----------
export const JungleMap: React.FC<{ x: number; y: number; s?: number; g: number; reveal: number }> = ({ x, y, s = 1, g, reveal }) => {
  const W = 620;
  const H = 400;
  const tree = (tx: number, ty: number, k: number, i: number) => (
    <g key={i} transform={`translate(${tx} ${ty}) scale(${k})`}>
      <rect x={-8} y={-10} width={16} height={60} rx={6} fill="#a8783a" />
      <circle cx={-22} cy={-18} r={30} fill="#5fd06a" />
      <circle cx={22} cy={-20} r={30} fill="#4fc05a" />
      <circle cx={0} cy={-42} r={34} fill="#6fe07a" />
    </g>
  );
  return (
    <g transform={`translate(${x} ${y}) scale(${s * (0.4 + 0.6 * reveal)})`} opacity={reveal}>
      <circle r={430} fill="url(#leafGlow)" opacity={0.3} />
      <rect x={-W / 2} y={-H / 2} width={W} height={H} rx={40} fill="url(#mapJungle)" opacity={0.94} stroke="#b8ff8f" strokeWidth={10} />
      <rect x={-W / 2 + 18} y={-H / 2 + 18} width={W - 36} height={H - 36} rx={28} fill="none" stroke="#ffe39a" strokeWidth={3} strokeDasharray="10 12" opacity={0.75} />
      <circle cx={210} cy={-120} r={34} fill="#fff1a0" opacity={0.9} />
      {tree(-210, 30, 1.1, 0)}
      {tree(-120, 60, 0.8, 1)}
      {tree(200, 60, 0.9, 2)}
      {/* the temple */}
      <g transform="translate(40 70)">
        {[0, 1, 2, 3].map((k) => (
          <rect key={k} x={-110 + k * 22} y={-28 - k * 28} width={220 - k * 44} height={28} fill="#d8c08a" stroke="#fff3c0" strokeWidth={3} />
        ))}
        <rect x={-14} y={-140} width={28} height={28} fill="#d8c08a" stroke="#fff3c0" strokeWidth={3} />
        <circle cx={0} cy={-150} r={12} fill="#7fff8f" opacity={0.6 + 0.4 * Math.sin(g / 5)} />
      </g>
      {/* the waterfall */}
      <path d="M 250 -60 L 250 70" stroke="#bff4ff" strokeWidth={14} strokeDasharray="12 8" strokeDashoffset={-g * 2} />
      {Array.from({ length: 8 }, (_, i) => (
        <circle key={i} cx={-260 + random(`jm${i}`) * 520} cy={-150 + random(`jn${i}`) * 80} r={3 + (i % 3)} fill="#fff8c0" opacity={0.5 + 0.5 * Math.sin(g / 6 + i)} />
      ))}
      <path d="M -260 170 Q -170 120 -100 150 Q -40 176 20 120" stroke="#ffd34f" strokeWidth={6} strokeDasharray="4 14" strokeLinecap="round" fill="none" />
      <Sparkle x={20} y={120} size={16} color="#ffd34f" rotate={g * 3} />
    </g>
  );
};

// ---------- the magic green path of leaves (2D, scene 1) ----------
export const LeafPath: React.FC<{ from: { x: number; y: number }; to: { x: number; y: number }; reveal: number; g: number }> = ({ from, to, reveal, g }) => {
  if (reveal <= 0) return null;
  const c1 = { x: from.x - 380, y: from.y - 120 };
  const c2 = { x: to.x + 360, y: to.y + 260 };
  const d = `M ${from.x} ${from.y} C ${c1.x} ${c1.y} ${c2.x} ${c2.y} ${to.x} ${to.y}`;
  const at = (u: number) => {
    const a = (1 - u) ** 3, b = 3 * (1 - u) ** 2 * u, c = 3 * (1 - u) * u * u, e = u ** 3;
    return { x: a * from.x + b * c1.x + c * c2.x + e * to.x, y: a * from.y + b * c1.y + c * c2.y + e * to.y };
  };
  return (
    <g>
      <path d={d} pathLength={1} strokeDasharray={`${reveal} 1`} stroke="#9fff8f" strokeWidth={90} strokeLinecap="round" fill="none" opacity={0.22} />
      <path d={d} pathLength={1} strokeDasharray={`${reveal} 1`} stroke="#e8ffd8" strokeWidth={30} strokeLinecap="round" fill="none" opacity={0.75} />
      {Array.from({ length: 16 }, (_, i) => {
        const u = ((i / 16 + g / 90) % 1) * reveal;
        const p = at(u);
        return (
          <g key={i} transform={`translate(${p.x} ${p.y}) rotate(${g * 3 + i * 40}) scale(${0.5 + (i % 3) * 0.2})`}>
            <path d="M 0 -26 C -16 -14 -16 12 0 24 C 16 12 16 -14 0 -26 Z" fill={i % 2 ? "#6fe06a" : "#b8ff8f"} />
          </g>
        );
      })}
    </g>
  );
};

// ---------- green and golden light from the pendant ----------
export const GreenBeam: React.FC<{ from: { x: number; y: number }; to: { x: number; y: number }; on: number; g: number; width?: number }> = ({ from, to, on, g, width = 40 }) => {
  if (on <= 0) return null;
  const dx = to.x - from.x;
  const dy = to.y - from.y;
  const len = Math.hypot(dx, dy);
  const ang = (Math.atan2(dy, dx) * 180) / Math.PI;
  const reach = len * Math.min(1, on * 1.4);
  const w = width + Math.sin(g / 2) * 5;
  const strand = (ph: number, amp: number) =>
    Array.from({ length: 25 }, (_, i) => {
      const u = (i / 24) * reach;
      return `${i ? "L" : "M"} ${u.toFixed(1)} ${(Math.sin(u / 40 + g / 3 + ph) * amp * Math.min(1, u / 60)).toFixed(1)}`;
    }).join(" ");
  return (
    <g transform={`translate(${from.x} ${from.y}) rotate(${ang})`} opacity={Math.min(1, on * 2)}>
      <path d={`M 0 ${-w * 0.5} L ${reach} ${-w} L ${reach} ${w} L 0 ${w * 0.5} Z`} fill="url(#greenBeam)" opacity={0.4} />
      <path d={strand(0, 18)} stroke="#8fff7f" strokeWidth={7} fill="none" strokeLinecap="round" />
      <path d={strand(Math.PI, 18)} stroke="#ffe39a" strokeWidth={7} fill="none" strokeLinecap="round" />
      <path d={`M 0 -7 L ${reach} -4 L ${reach} 4 L 0 7 Z`} fill="#f6fff0" />
      {Array.from({ length: 10 }, (_, i) => {
        const u = ((i / 10 + g / 36) % 1) * reach;
        return <circle key={i} cx={u} cy={Math.sin(i * 2.3 + g / 3) * w * 0.5} r={5 + (i % 3) * 2} fill={i % 2 ? "#fff3c0" : "#d8ffc8"} />;
      })}
    </g>
  );
};

// =====================================================================
// Comedy props (Episode 8 comedy version)
// =====================================================================

// One banana; (0, 0) at its middle. bitten 0..1 takes a bite out of the top
export const Banana: React.FC<{ x: number; y: number; scale?: number; rot?: number; bitten?: number }> = ({ x, y, scale = 1, rot = 0, bitten = 0 }) => (
  <g transform={`translate(${x} ${y}) scale(${scale}) rotate(${rot})`}>
    <path d="M -46 -30 Q -40 34 30 40 Q 44 38 46 30 Q 0 26 -30 -32 Z" fill="#ffd93f" stroke="#c89a1a" strokeWidth={4} strokeLinejoin="round" />
    <path d="M -36 -18 Q -26 24 26 32" stroke="#fff0a0" strokeWidth={5} fill="none" strokeLinecap="round" opacity={0.8} />
    <path d="M -46 -30 L -50 -42" stroke="#7a5a20" strokeWidth={7} strokeLinecap="round" />
    <circle cx={46} cy={32} r={4} fill="#5a4010" />
    {bitten > 0 && (
      <g>
        <circle cx={-44} cy={-28} r={16 * bitten} fill="#fff8e0" />
        <circle cx={-34} cy={-36} r={12 * bitten} fill="#fff8e0" />
      </g>
    )}
  </g>
);

// A hanging bunch of bananas, or (swap = 1) the bunch of green leaves Kiko left in its place.
// (x, y) is the stem at the top. taken: how many bananas are missing.
export const BananaBunch: React.FC<{ x: number; y: number; scale?: number; g: number; swap?: number; taken?: number }> = ({ x, y, scale = 1, g, swap = 0, taken = 0 }) => {
  const sway = Math.sin(g / 14) * 3;
  const spots: [number, number, number][] = [
    [-40, 70, -30],
    [-14, 82, -12],
    [14, 82, 12],
    [40, 70, 30],
    [-28, 120, -22],
    [0, 130, 0],
    [28, 120, 22],
  ];
  return (
    <g transform={`translate(${x} ${y}) scale(${scale}) rotate(${sway})`}>
      <path d="M 0 0 L 0 60" stroke="#6a8a30" strokeWidth={12} strokeLinecap="round" />
      {swap < 1 && (
        <g opacity={1 - swap}>
          {spots.map(([dx, dy, r], i) => (i >= spots.length - taken ? null : <Banana key={i} x={dx} y={dy} scale={0.9} rot={r + 90} />))}
        </g>
      )}
      {swap > 0 && (
        <g opacity={swap}>
          {spots.map(([dx, dy, r], i) => (
            <path key={i} d="M 0 -34 C -20 -16 -18 18 0 34 C 18 18 20 -16 0 -34 Z" transform={`translate(${dx} ${dy}) rotate(${r})`} fill={i % 2 ? "#5fc04a" : "#4aa83f"} stroke="#2f7a2f" strokeWidth={3} />
          ))}
          <path d="M -30 58 Q 0 72 30 58" stroke="#6a8a30" strokeWidth={6} fill="none" />
        </g>
      )}
    </g>
  );
};

// A leafy branch drawn between two screen points
export const Branch: React.FC<{ from: { x: number; y: number }; to: { x: number; y: number }; scale: number; g: number }> = ({ from, to, scale, g }) => (
  <g>
    <path d={`M ${from.x} ${from.y} Q ${(from.x + to.x) / 2} ${(from.y + to.y) / 2 - 30 * scale} ${to.x} ${to.y}`} stroke="#6a4a2e" strokeWidth={34 * scale} strokeLinecap="round" fill="none" />
    <path d={`M ${from.x} ${from.y - 8 * scale} Q ${(from.x + to.x) / 2} ${(from.y + to.y) / 2 - 38 * scale} ${to.x} ${to.y - 8 * scale}`} stroke="#8a6a46" strokeWidth={8 * scale} strokeLinecap="round" fill="none" opacity={0.6} />
    {[0.2, 0.45, 0.7, 0.95].map((k, i) => {
      const x = from.x + (to.x - from.x) * k;
      const y = from.y + (to.y - from.y) * k - 20 * scale;
      return <path key={i} d="M 0 0 C -30 -14 -30 -54 0 -70 C 30 -54 30 -14 0 0 Z" transform={`translate(${x} ${y}) rotate(${(i % 2 ? 30 : -30) + Math.sin(g / 10 + i) * 5}) scale(${scale})`} fill={i % 2 ? "#5fc04a" : "#4aa83f"} />;
    })}
  </g>
);

// A single leaf, fluttering down
export const FallingLeaf: React.FC<{ x: number; y: number; rot: number; scale?: number }> = ({ x, y, rot, scale = 1 }) => (
  <g transform={`translate(${x} ${y}) rotate(${rot}) scale(${scale})`}>
    <path d="M 0 -26 C -16 -12 -16 12 0 26 C 16 12 16 -12 0 -26 Z" fill="#6fe06a" stroke="#2f9a3a" strokeWidth={3} />
    <path d="M 0 -22 L 0 22" stroke="#2f9a3a" strokeWidth={2.5} />
  </g>
);

// The tiny sneeze fireball; age 0..1, it fizzles into sparks at the end
export const TinyFireball: React.FC<{ x: number; y: number; scale: number; age: number; dir?: number }> = ({ x, y, scale, age, dir = -1 }) => {
  if (age <= 0 || age >= 1) return null;
  const fizz = age > 0.75 ? (age - 0.75) / 0.25 : 0;
  const r = (22 + age * 14) * scale * (1 - fizz);
  return (
    <g>
      {Array.from({ length: 6 }, (_, i) => (
        <circle key={i} cx={x - dir * (i + 1) * 16 * scale} cy={y + Math.sin(i * 2 + age * 20) * 6 * scale} r={r * (0.8 - i * 0.12)} fill={i % 2 ? "#ffb040" : "#ffe070"} opacity={(0.6 - i * 0.09) * (1 - fizz)} />
      ))}
      <circle cx={x} cy={y} r={r * 1.6} fill="url(#warmGlow)" opacity={1 - fizz} />
      <circle cx={x} cy={y} r={r} fill="#ffb03a" opacity={1 - fizz} />
      <circle cx={x} cy={y} r={r * 0.55} fill="#fff4b0" opacity={1 - fizz} />
      {fizz > 0 &&
        Array.from({ length: 10 }, (_, i) => {
          const a = (i / 10) * Math.PI * 2;
          return <circle key={`s${i}`} cx={x + Math.cos(a) * fizz * 60 * scale} cy={y + Math.sin(a) * fizz * 60 * scale} r={5 * scale * (1 - fizz) + 1} fill="#ffd060" />;
        })}
    </g>
  );
};

// A sad little puff of smoke; age 0..1
export const SmokePuff: React.FC<{ x: number; y: number; scale: number; age: number }> = ({ x, y, scale, age }) => {
  if (age <= 0 || age >= 1) return null;
  return (
    <g opacity={1 - age * 0.9}>
      {[0, 1, 2, 3].map((i) => (
        <circle key={i} cx={x + Math.sin(i * 1.7 + age * 4) * 14 * scale} cy={y - age * 110 * scale - i * 14 * scale} r={(10 + age * 26 - i * 3) * scale} fill="#b8b4c4" />
      ))}
    </g>
  );
};

// Bobo's enormous, sparkling banana eyes, drawn over his face. amount 0..1
export const BoboBigEyes: React.FC<{ x: number; y: number; scale: number; g: number; amount: number }> = ({ x, y, scale, g, amount }) => {
  if (amount <= 0) return null;
  const s = 0.4 + amount * 0.6;
  return (
    <g transform={`translate(${x} ${y}) scale(${scale})`}>
      {[-1, 1].map((sd) => (
        <g key={sd} transform={`translate(${sd * 40} -323) scale(${s})`}>
          <ellipse rx={38} ry={44} fill="#fff" stroke="#2a1a12" strokeWidth={4} />
          <circle r={28} fill="#24150d" />
          <path d="M -14 -6 Q -8 14 12 14 Q 4 8 -6 -10 Z" fill="#ffd93f" />
          <circle cx={-12} cy={-14} r={9} fill="#fff" />
          <circle cx={12} cy={12} r={4} fill="#fff" />
          <path d="M 30 -40 l 4 9 l 10 1 l -7 7 l 2 10 l -9 -5 l -9 5 l 2 -10 l -7 -7 l 10 -1 Z" fill="#fff3a0" transform={`rotate(${g * 6} 34 -30)`} />
        </g>
      ))}
    </g>
  );
};

// Draco's embarrassed blush, drawn over his cheeks. amount 0..1
export const DracoBlush: React.FC<{ x: number; y: number; scale: number; amount: number }> = ({ x, y, scale, amount }) => {
  if (amount <= 0) return null;
  return (
    <g transform={`translate(${x} ${y}) scale(${scale})`} opacity={amount}>
      {[-1, 1].map((sd) => (
        <g key={sd}>
          <ellipse cx={sd * 70} cy={-192} rx={30} ry={17} fill="#ff6fa8" opacity={0.75} />
          {[-12, 0, 12].map((dx) => (
            <path key={dx} d={`M ${sd * 70 + dx - 5} -184 l 7 -14`} stroke="#ff3f88" strokeWidth={3} strokeLinecap="round" />
          ))}
        </g>
      ))}
    </g>
  );
};

export const SweatDrop: React.FC<{ x: number; y: number; scale: number; g?: number }> = ({ x, y, scale, g = 0 }) => (
  <g transform={`translate(${x} ${y + Math.sin(g / 6) * 4}) scale(${scale})`}>
    <path d="M 0 -26 Q 16 0 12 12 Q 0 26 -12 12 Q -16 0 0 -26 Z" fill="#bfe8ff" stroke="#5fa8e0" strokeWidth={3} />
    <ellipse cx={-4} cy={4} rx={3} ry={6} fill="#fff" opacity={0.8} />
  </g>
);

// The deadpan "..." thought bubble. on 0..1 reveals the dots one by one
export const DotsBubble: React.FC<{ x: number; y: number; scale: number; on: number }> = ({ x, y, scale, on }) => {
  if (on <= 0) return null;
  return (
    <g transform={`translate(${x} ${y}) scale(${scale})`} opacity={Math.min(1, on * 3)}>
      <ellipse rx={92} ry={56} fill="#ffffff" stroke="#c8d0e0" strokeWidth={4} />
      <circle cx={-70} cy={60} r={12} fill="#ffffff" stroke="#c8d0e0" strokeWidth={3} />
      <circle cx={-92} cy={84} r={7} fill="#ffffff" stroke="#c8d0e0" strokeWidth={3} />
      {[0, 1, 2].map((i) => (on > 0.2 + i * 0.25 ? <circle key={i} cx={-38 + i * 38} cy={0} r={11} fill="#5a5a70" /> : null))}
    </g>
  );
};

// Little dust clouds kicked up by running feet
export const DustPuffs: React.FC<{ x: number; y: number; scale: number; g: number; on: number; dir?: number }> = ({ x, y, scale, g, on, dir = 1 }) => {
  if (on <= 0) return null;
  return (
    <g opacity={on}>
      {Array.from({ length: 5 }, (_, i) => {
        const k = (g / 8 + i / 5) % 1;
        return <circle key={i} cx={x - dir * (20 + k * 120) * scale} cy={y - k * 30 * scale} r={(12 + k * 26) * scale} fill="#d8c8a0" opacity={(1 - k) * 0.8} />;
      })}
    </g>
  );
};

// Speed lines behind something moving fast
export const SpeedLines: React.FC<{ x: number; y: number; scale: number; on: number; dir?: number }> = ({ x, y, scale, on, dir = 1 }) => {
  if (on <= 0) return null;
  return (
    <g opacity={on * 0.8}>
      {[-80, -30, 20, 70].map((dy, i) => (
        <path key={i} d={`M ${x - dir * 70 * scale} ${y + dy * scale} l ${-dir * (90 + (i % 2) * 40) * scale} 0`} stroke="#ffffff" strokeWidth={7 * scale + 2} strokeLinecap="round" />
      ))}
    </g>
  );
};

// Bobo's disappointed little frown, drawn over his usual smile
export const BoboFrown: React.FC<{ x: number; y: number; scale: number; tilt?: number }> = ({ x, y, scale, tilt = 0 }) => (
  <g transform={`translate(${x} ${y}) scale(${scale}) translate(0 -305) rotate(${tilt}) translate(0 305)`}>
    <ellipse cx={0} cy={-264} rx={26} ry={13} fill="#ecc69c" />
    <path d="M -17 -256 Q 0 -272 17 -256" stroke="#2e1b11" strokeWidth={5} strokeLinecap="round" fill="none" />
  </g>
);
