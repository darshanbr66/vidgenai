import React from "react";
import { random } from "remotion";
import { Sparkle } from "../story/scenery";

// Episode 11 characters and props in the series' 2D style, drawn over the 3D sea and cave.

export const Ep11Defs: React.FC<{ lit?: number }> = ({ lit = 1 }) => {
  // Cool, watery light on the 2D characters; warmer and brighter once the cave comes alive
  const k = Math.max(0.75, Math.min(1.12, lit));
  return (
    <>
      <filter id="caveLit" colorInterpolationFilters="sRGB" x="-20%" y="-20%" width="140%" height="140%">
        <feColorMatrix type="matrix" values={`${0.92 * k} 0 0 0 0.01  0 ${0.98 * k} 0 0 0.03  0 0 ${1.06 * k} 0 0.06  0 0 0 1 0`} />
      </filter>
      <radialGradient id="bloopBody" cx="40%" cy="30%" r="75%">
        <stop offset="0%" stopColor="#9ff6f0" />
        <stop offset="60%" stopColor="#3fd4d8" />
        <stop offset="100%" stopColor="#1fa0b8" />
      </radialGradient>
      <radialGradient id="bloopIris" cx="45%" cy="38%" r="62%">
        <stop offset="0%" stopColor="#e8c8ff" />
        <stop offset="50%" stopColor="#9a5af0" />
        <stop offset="100%" stopColor="#5a2aa8" />
      </radialGradient>
      <radialGradient id="bubbleFill" cx="35%" cy="30%" r="70%">
        <stop offset="0%" stopColor="#ffffff" stopOpacity="0.35" />
        <stop offset="60%" stopColor="#bff4ff" stopOpacity="0.08" />
        <stop offset="92%" stopColor="#9fe8ff" stopOpacity="0.25" />
        <stop offset="100%" stopColor="#e8fbff" stopOpacity="0.7" />
      </radialGradient>
      <radialGradient id="pieceGlow" cx="50%" cy="50%" r="50%">
        <stop offset="0%" stopColor="#ffffff" stopOpacity="1" />
        <stop offset="40%" stopColor="#bff4ff" stopOpacity="0.6" />
        <stop offset="100%" stopColor="#7fe8ff" stopOpacity="0" />
      </radialGradient>
      <linearGradient id="seaBanana" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stopColor="#fff6b0" />
        <stop offset="50%" stopColor="#ffd040" />
        <stop offset="100%" stopColor="#d89010" />
      </linearGradient>
    </>
  );
};

// ---------- Bloop, the tiny baby octopus. Floats; (0, 0) is the point under it. About 260 tall at scale 1 ----------
export type BloopMood = "shy" | "happy" | "joy" | "surprised" | "nervous" | "hic" | "brave" | "puff";

export const Bloop: React.FC<{
  x: number;
  y: number;
  scale?: number;
  g: number;
  look?: { x: number; y: number };
  mood?: BloopMood;
  mouth?: number;
  blink?: number;
  float?: number;
  squash?: number;
  tilt?: number;
  puff?: number; // 0..1 cheeks full of air
  wave?: number; // 0..1 waves a front tentacle
}> = ({ x, y, scale = 1, g, look = { x: 0, y: 0 }, mood = "happy", mouth = 0, blink = 1, float = 90, squash = 1, tilt = 0, puff = 0, wave = 0 }) => {
  const talking = mouth > 0.06;
  const hover = float + Math.sin(g / 8) * 10;
  const hic = mood === "hic";
  const big = mood === "surprised" || hic || mood === "nervous" ? 1.12 : 1;
  const eye = (side: -1 | 1) => {
    const cx = side * 34;
    if (mood === "joy" && !talking && blink > 0.5) return <path key={side} d={`M ${cx - 17} 0 Q ${cx} -18 ${cx + 17} 0`} stroke="#3a1a6a" strokeWidth={6} strokeLinecap="round" fill="none" />;
    return (
      <g key={side} transform={`translate(${cx} -2) scale(${big} ${big * blink})`}>
        <ellipse rx={25} ry={29} fill="#fff" stroke="#7fd0d8" strokeWidth={2} />
        <g transform={`translate(${look.x * 6} ${look.y * 7})`}>
          <circle r={19} fill="url(#bloopIris)" />
          <circle r={9} fill="#2a0e4a" />
          <circle cx={-7} cy={-8} r={7} fill="#fff" />
          <circle cx={6} cy={7} r={3} fill="#fff" opacity={0.9} />
        </g>
        {mood === "nervous" && <path d="M -20 -36 Q 0 -28 20 -38" stroke="#1f8a9a" strokeWidth={4} fill="none" strokeLinecap="round" transform={`rotate(${side * 10})`} />}
      </g>
    );
  };
  const mouthShape = hic ? (
    <ellipse cx={0} cy={34} rx={9} ry={11} fill="#5a1a4a" />
  ) : mood === "puff" ? (
    <path d="M -7 32 L 7 32" stroke="#5a1a4a" strokeWidth={5} strokeLinecap="round" />
  ) : talking ? (
    <g>
      <path d={`M -11 28 Q 0 24 11 28 Q 9 ${32 + mouth * 12} 0 ${34 + mouth * 14} Q -9 ${32 + mouth * 12} -11 28 Z`} fill="#5a1a4a" />
      <ellipse cx={0} cy={31 + mouth * 9} rx={5} ry={2.2 + mouth * 2} fill="#ff9fb8" />
    </g>
  ) : mood === "nervous" ? (
    <path d="M -10 34 Q -5 28 0 34 Q 5 28 10 34" stroke="#5a1a4a" strokeWidth={4} fill="none" strokeLinecap="round" />
  ) : mood === "surprised" ? (
    <ellipse cx={0} cy={32} rx={6} ry={8} fill="#5a1a4a" />
  ) : mood === "shy" ? (
    <path d="M -8 30 Q 0 36 8 30" stroke="#5a1a4a" strokeWidth={4} fill="none" strokeLinecap="round" />
  ) : (
    <path d="M -14 27 Q 0 46 14 27 Z" fill="#5a1a4a" stroke="#5a1a4a" strokeWidth={3} strokeLinejoin="round" />
  );
  const tentacle = (i: number) => {
    const bx = (i - 3.5) * 19;
    const sw = Math.sin(g / 5 + i * 0.9) * 14;
    const lift = i === 6 ? wave * 70 * Math.abs(Math.sin(g / 3)) : 0;
    return (
      <path
        key={i}
        d={`M ${bx - 9} 40 C ${bx - 10 + sw * 0.4} 70 ${bx + sw} ${92 - lift} ${bx + sw * 1.3 + (i < 4 ? -12 : 12)} ${102 - lift} C ${bx + sw * 1.3 + (i < 4 ? -2 : 2)} ${108 - lift} ${bx + 10 + sw * 0.6} 80 ${bx + 9} 40 Z`}
        fill="url(#bloopBody)"
        stroke="#1f9aa8"
        strokeWidth={2.5}
        strokeLinejoin="round"
      />
    );
  };
  const sq = squash * (hic ? 0.9 : 1);
  return (
    <g transform={`translate(${x} ${y}) scale(${scale})`}>
      <ellipse cx={0} cy={4} rx={60} ry={10} fill="url(#shadow)" opacity={0.5} />
      <g transform={`translate(0 ${-hover}) rotate(${tilt}) scale(${(1 + puff * 0.25) / Math.sqrt(sq)} ${(1 + puff * 0.2) * sq})`}>
        {[0, 1, 2, 3, 4, 5, 6, 7].map(tentacle)}
        {/* the round head */}
        <ellipse cx={0} cy={-6} rx={84} ry={78} fill="url(#bloopBody)" stroke="#1f9aa8" strokeWidth={3} />
        <ellipse cx={-28} cy={-46} rx={26} ry={14} fill="#ffffff" opacity={0.35} transform="rotate(-20 -28 -46)" />
        {/* tiny glowing spots */}
        {[
          [-44, -58, 7],
          [-14, -72, 5],
          [22, -70, 6],
          [48, -52, 5],
          [60, -24, 4],
        ].map(([sx, sy, r], i) => (
          <g key={i}>
            <circle cx={sx} cy={sy} r={r + 5} fill="#e8fff8" opacity={0.25 + 0.2 * Math.sin(g / 6 + i)} />
            <circle cx={sx} cy={sy} r={r} fill="#d8fff0" />
          </g>
        ))}
        <ellipse cx={-52} cy={20} rx={15} ry={9} fill="#ff9fc8" opacity={0.7} />
        <ellipse cx={52} cy={20} rx={15} ry={9} fill="#ff9fc8" opacity={0.7} />
        {puff > 0.2 && [-1, 1].map((sd) => <circle key={sd} cx={sd * 44} cy={26} r={16 * puff} fill="#ffc8e0" opacity={0.6} />)}
        {eye(-1)}
        {eye(1)}
        {mouthShape}
      </g>
    </g>
  );
};

// ---------- bubbles ----------
// A soap-like magic bubble (the hiccup bubble, the group travel bubble). (x, y) is its center
export const MagicBubble2D: React.FC<{ x: number; y: number; rx: number; ry?: number; g: number; wobble?: number; opacity?: number }> = ({ x, y, rx, ry, g, wobble = 1, opacity = 1 }) => {
  const r2 = ry ?? rx;
  const wx = 1 + 0.03 * wobble * Math.sin(g / 4);
  const wy = 1 + 0.03 * wobble * Math.sin(g / 4 + 1.6);
  return (
    <g transform={`translate(${x} ${y}) scale(${wx} ${wy})`} opacity={opacity}>
      <ellipse rx={rx} ry={r2} fill="url(#bubbleFill)" stroke="#e8fbff" strokeWidth={Math.max(3, rx * 0.012)} />
      <ellipse rx={rx * 0.97} ry={r2 * 0.97} fill="none" stroke="#ff9fe0" strokeWidth={Math.max(1.5, rx * 0.006)} opacity={0.45} transform={`rotate(${g * 2})`} />
      <ellipse cx={-rx * 0.42} cy={-r2 * 0.5} rx={rx * 0.22} ry={r2 * 0.1} fill="#ffffff" opacity={0.75} transform={`rotate(-30 ${-rx * 0.42} ${-r2 * 0.5})`} />
      <circle cx={rx * 0.5} cy={-r2 * 0.6} r={rx * 0.04} fill="#ffffff" opacity={0.8} />
    </g>
  );
};

// Burst of droplets when a bubble pops; age 0..1
export const Pop2D: React.FC<{ x: number; y: number; r: number; age: number }> = ({ x, y, r, age }) => {
  if (age <= 0 || age >= 1) return null;
  return (
    <g opacity={1 - age}>
      {Array.from({ length: 14 }, (_, i) => {
        const a = (i / 14) * Math.PI * 2;
        const d = r * (0.8 + age * 0.8);
        return <circle key={i} cx={x + Math.cos(a) * d} cy={y + Math.sin(a) * d} r={Math.max(2, r * 0.05 * (1 - age))} fill="#e8fbff" />;
      })}
    </g>
  );
};

// Little rising bubbles; seed keeps them steady
export const RisingBubbles: React.FC<{ x: number; y: number; g: number; scale: number; count?: number; spread?: number; seed?: string; on?: number }> = ({ x, y, g, scale, count = 8, spread = 120, seed = "rb", on = 1 }) => {
  if (on <= 0) return null;
  return (
    <g opacity={on}>
      {Array.from({ length: count }, (_, i) => {
        const k = (g / 50 + random(`${seed}${i}`)) % 1;
        const r = (4 + random(`${seed}r${i}`) * 8) * scale + 1;
        return <circle key={i} cx={x + (random(`${seed}x${i}`) - 0.5) * spread * scale + Math.sin(g / 6 + i) * 6 * scale} cy={y - k * 400 * scale} r={r} fill="none" stroke="#e8fbff" strokeWidth={2} opacity={1 - k} />;
      })}
    </g>
  );
};

// ---------- a yellow fish that looks just like a banana ----------
export const BananaFish: React.FC<{ x: number; y: number; scale: number; g: number; dir?: number }> = ({ x, y, scale, g, dir = -1 }) => (
  <g transform={`translate(${x} ${y}) scale(${scale * -dir} ${scale}) rotate(${Math.sin(g / 3) * 6})`}>
    <path d="M -60 -10 C -30 22 30 26 64 -4 C 60 8 30 30 -10 26 C -40 22 -58 6 -60 -10 Z" fill="#ffe24a" stroke="#c89a10" strokeWidth={4} strokeLinejoin="round" />
    <path d={`M 62 -2 L ${86} ${-18 + Math.sin(g / 2) * 8} L ${84} ${14 + Math.sin(g / 2) * 8} Z`} fill="#ffd030" stroke="#c89a10" strokeWidth={3} strokeLinejoin="round" />
    <path d="M -60 -10 l -10 -10 l 14 2 Z" fill="#6a4a10" />
    <circle cx={-38} cy={2} r={7} fill="#2a1a08" />
    <circle cx={-40} cy={0} r={2.5} fill="#fff" />
    <path d="M -30 14 Q -24 18 -18 14" stroke="#6a4a10" strokeWidth={3} fill="none" strokeLinecap="round" />
    <path d="M -10 -2 C 0 8 20 10 40 2" stroke="#fff6c0" strokeWidth={4} fill="none" strokeLinecap="round" opacity={0.8} />
  </g>
);

// A glowing jellyfish Kiko can hold; (x, y) is the top of its bell
export const Jelly2D: React.FC<{ x: number; y: number; scale: number; g: number; color?: string; glow?: number }> = ({ x, y, scale, g, color = "#ff9fe0", glow = 1 }) => (
  <g transform={`translate(${x} ${y}) scale(${scale})`}>
    <circle cx={0} cy={30} r={80} fill="url(#pieceGlow)" opacity={0.4 * glow} />
    {[-26, -10, 8, 24].map((tx, i) => (
      <path key={i} d={`M ${tx} 30 q ${Math.sin(g / 3 + i) * 10} 30 0 60 t 0 50`} stroke={color} strokeWidth={4} fill="none" strokeLinecap="round" opacity={0.8} />
    ))}
    <path d="M -46 34 C -46 -24 46 -24 46 34 Q 30 26 15 34 Q 0 26 -15 34 Q -30 26 -46 34 Z" fill={color} stroke="#ffffff" strokeWidth={3} opacity={0.9} />
    <ellipse cx={-14} cy={-2} rx={12} ry={6} fill="#ffffff" opacity={0.6} />
    <circle cx={-12} cy={14} r={4} fill="#5a1a4a" />
    <circle cx={12} cy={14} r={4} fill="#5a1a4a" />
    <path d="M -6 22 Q 0 26 6 22" stroke="#5a1a4a" strokeWidth={2.5} fill="none" strokeLinecap="round" />
  </g>
);

// A glowing crystal piece held or carried in 2D
export const CrystalPiece2D: React.FC<{ x: number; y: number; scale: number; g: number; color: string }> = ({ x, y, scale, g, color }) => (
  <g transform={`translate(${x} ${y}) scale(${scale}) rotate(${Math.sin(g / 6) * 10})`}>
    <circle r={70} fill="url(#pieceGlow)" opacity={0.6} />
    <path d="M 0 -48 L 20 -6 L 0 44 L -20 -6 Z" fill={color} stroke="#ffffff" strokeWidth={4} strokeLinejoin="round" />
    <path d="M 0 -48 L 6 -6 L 0 44" stroke="#ffffff" strokeWidth={3} fill="none" opacity={0.6} />
    <Sparkle x={18} y={-30} size={12 + 5 * Math.sin(g / 3)} color="#ffffff" rotate={g * 4} />
  </g>
);

// Draco's "fireball" underwater: a single tiny steam bubble; age 0..1, it pops at the end
export const SteamBubble: React.FC<{ from: { x: number; y: number }; scale: number; age: number; g: number }> = ({ from, scale, age, g }) => {
  if (age <= 0 || age >= 1) return null;
  const px = from.x + Math.sin(age * 9) * 14 * scale - age * 30 * scale;
  const py = from.y - age * 110 * scale;
  const r = (8 + age * 10) * scale;
  return (
    <g>
      <circle cx={px} cy={py} r={r} fill="#ffffff" opacity={0.35} stroke="#ffffff" strokeWidth={2} />
      <circle cx={px - r * 0.3} cy={py - r * 0.3} r={r * 0.25} fill="#ffffff" />
      {[0, 1].map((i) => (
        <path key={i} d={`M ${px - 8 * scale + i * 12 * scale} ${py - r - 6} q 4 -8 0 -16`} stroke="#ffffff" strokeWidth={2.5} fill="none" opacity={0.7} strokeLinecap="round" transform={`translate(0 ${-Math.sin(g / 3) * 2})`} />
      ))}
    </g>
  );
};

// Streaks of a strong current flowing across a region; on 0..1
export const CurrentLines: React.FC<{ x: number; y: number; w: number; h: number; g: number; on: number; dir?: number }> = ({ x, y, w, h, g, on, dir = 1 }) => {
  if (on <= 0) return null;
  return (
    <g opacity={on * 0.7}>
      {Array.from({ length: 12 }, (_, i) => {
        const k = (g * 0.05 + random(`cl${i}`)) % 1;
        const yy = y - h / 2 + random(`cy${i}`) * h;
        const xx = x - w / 2 + (dir > 0 ? k : 1 - k) * w;
        return <path key={i} d={`M ${xx} ${yy} q ${dir * 40} -10 ${dir * 90} 0`} stroke="#e8fbff" strokeWidth={4} fill="none" strokeLinecap="round" opacity={Math.sin(k * Math.PI)} />;
      })}
    </g>
  );
};

// A golden sea-banana fruit growing on a little stem
export const SeaBanana: React.FC<{ x: number; y: number; scale: number; g: number; rot?: number }> = ({ x, y, scale, g, rot = 0 }) => (
  <g transform={`translate(${x} ${y}) scale(${scale}) rotate(${rot + Math.sin(g / 7) * 6})`}>
    <circle r={90} fill="url(#pieceGlow)" opacity={0.35} />
    <path d="M -50 -30 C -40 30 10 52 56 30 C 60 26 58 18 52 18 C 12 30 -20 10 -32 -32 Z" fill="url(#seaBanana)" stroke="#a86a08" strokeWidth={4} strokeLinejoin="round" />
    {[-20, 4, 26].map((dx, i) => (
      <circle key={i} cx={dx} cy={14 + i * 4} r={4} fill="#fff6c0" opacity={0.8} />
    ))}
    <path d="M -50 -30 l -6 -12 l 14 2 Z" fill="#5fae4a" />
    <Sparkle x={34} y={-6} size={14 + 6 * Math.sin(g / 3)} color="#ffffff" rotate={g * 4} />
  </g>
);

// Kiko's air-bubble fit, like BUBBLE_FIT in src/ep06/props.tsx for the others
export const KIKO_FIT = { cy: -236, rx: 196, ry: 262 };

// A clump of glowing coral drawn in front of something hiding behind it. (x, y) is its base
export const GlowCoral: React.FC<{ x: number; y: number; scale: number; g: number; glow?: number }> = ({ x, y, scale, g, glow = 0.6 }) => {
  const branch = (bx: number, h: number, lean: number, c: string, i: number) => (
    <g key={i} transform={`translate(${bx} 0) rotate(${lean + Math.sin(g / 12 + i) * 3})`}>
      <path d={`M -14 0 C -16 ${-h * 0.4} -6 ${-h * 0.7} -10 ${-h} Q 0 ${-h - 22} 10 ${-h} C 6 ${-h * 0.7} 16 ${-h * 0.4} 14 0 Z`} fill={c} stroke="#ffffff" strokeWidth={3} strokeOpacity={0.6} />
      <path d={`M 0 ${-h * 0.55} C 20 ${-h * 0.6} 26 ${-h * 0.75} 30 ${-h * 0.85} Q 40 ${-h * 0.9} 36 ${-h * 0.72} C 30 ${-h * 0.62} 18 ${-h * 0.5} 4 ${-h * 0.42} Z`} fill={c} />
      {[0.3, 0.6, 0.9].map((k, j) => (
        <circle key={j} cx={0} cy={-h * k} r={5} fill="#ffffff" opacity={0.3 + glow * 0.5} />
      ))}
    </g>
  );
  return (
    <g transform={`translate(${x} ${y}) scale(${scale})`}>
      <ellipse cx={0} cy={-90} rx={190} ry={140} fill="url(#pieceGlow)" opacity={0.35 * glow} />
      {branch(-90, 200, -14, "#ff8fc8", 0)}
      {branch(-30, 260, -4, "#ff6fb0", 1)}
      {branch(40, 230, 8, "#ffa0d8", 2)}
      {branch(100, 180, 18, "#ff8fc8", 3)}
      <ellipse cx={0} cy={-6} rx={150} ry={34} fill="#c86a9a" />
      <ellipse cx={-40} cy={-16} rx={60} ry={20} fill="#e88ab8" />
    </g>
  );
};
