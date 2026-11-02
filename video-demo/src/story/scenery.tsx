import React from "react";
import { random } from "remotion";

export const SceneryDefs: React.FC = () => (
  <>
    <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stopColor="#0a1238" />
      <stop offset="45%" stopColor="#1f2266" />
      <stop offset="80%" stopColor="#3a3a8c" />
      <stop offset="100%" stopColor="#5b5aa8" />
    </linearGradient>
    <radialGradient id="moonGlow">
      <stop offset="0%" stopColor="#fff6d8" stopOpacity="0.55" />
      <stop offset="35%" stopColor="#ffe9b0" stopOpacity="0.18" />
      <stop offset="100%" stopColor="#ffe9b0" stopOpacity="0" />
    </radialGradient>
    <radialGradient id="moonBody" cx="40%" cy="38%" r="70%">
      <stop offset="0%" stopColor="#fffdf2" />
      <stop offset="70%" stopColor="#fff0c4" />
      <stop offset="100%" stopColor="#f3d98f" />
    </radialGradient>
    <radialGradient id="softGlow">
      <stop offset="0%" stopColor="#fff" stopOpacity="0.9" />
      <stop offset="100%" stopColor="#fff" stopOpacity="0" />
    </radialGradient>
    <radialGradient id="warmGlow">
      <stop offset="0%" stopColor="#ffd38a" stopOpacity="0.8" />
      <stop offset="100%" stopColor="#ffb35c" stopOpacity="0" />
    </radialGradient>
    <radialGradient id="cyanGlow">
      <stop offset="0%" stopColor="#7ff6ff" stopOpacity="0.75" />
      <stop offset="100%" stopColor="#7ff6ff" stopOpacity="0" />
    </radialGradient>
    <radialGradient id="pinkGlow">
      <stop offset="0%" stopColor="#ff9ee0" stopOpacity="0.7" />
      <stop offset="100%" stopColor="#ff9ee0" stopOpacity="0" />
    </radialGradient>
    <linearGradient id="window" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stopColor="#ffcf8a" />
      <stop offset="100%" stopColor="#f59e5b" />
    </linearGradient>
    <linearGradient id="wall" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stopColor="#3d3470" />
      <stop offset="100%" stopColor="#2a2452" />
    </linearGradient>
    <linearGradient id="grass" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stopColor="#2f6e6a" />
      <stop offset="100%" stopColor="#173b45" />
    </linearGradient>
    <linearGradient id="forestBg" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stopColor="#0c1a3a" />
      <stop offset="60%" stopColor="#123552" />
      <stop offset="100%" stopColor="#1b4a5a" />
    </linearGradient>
    <linearGradient id="trunk" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0%" stopColor="#2a2a4a" />
      <stop offset="60%" stopColor="#3b3a62" />
      <stop offset="100%" stopColor="#23223f" />
    </linearGradient>
    <radialGradient id="bush" cx="45%" cy="30%" r="70%">
      <stop offset="0%" stopColor="#4fb07a" />
      <stop offset="100%" stopColor="#1f6a4f" />
    </radialGradient>
    <linearGradient id="moonbeam" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stopColor="#cfe4ff" stopOpacity="0.22" />
      <stop offset="100%" stopColor="#cfe4ff" stopOpacity="0" />
    </linearGradient>
    <filter id="blur6" x="-50%" y="-50%" width="200%" height="200%">
      <feGaussianBlur stdDeviation="6" />
    </filter>
    <filter id="blur20" x="-50%" y="-50%" width="200%" height="200%">
      <feGaussianBlur stdDeviation="20" />
    </filter>
  </>
);

export const sparklePath = (s: number) => `M 0 ${-s} Q 0 0 ${s} 0 Q 0 0 0 ${s} Q 0 0 ${-s} 0 Q 0 0 0 ${-s} Z`;

export const Sparkle: React.FC<{ x: number; y: number; size: number; opacity?: number; color?: string; rotate?: number }> = ({
  x,
  y,
  size,
  opacity = 1,
  color = "#fff8dc",
  rotate = 0,
}) => (
  <g transform={`translate(${x} ${y}) rotate(${rotate})`} opacity={opacity}>
    <circle r={size * 1.4} fill="url(#softGlow)" opacity={0.35} />
    <path d={sparklePath(size)} fill={color} />
  </g>
);

export const Sky: React.FC<{ w: number; h: number }> = ({ w, h }) => <rect x={-200} y={-200} width={w + 400} height={h + 400} fill="url(#sky)" />;

export const StarField: React.FC<{ frame: number; w: number; h: number; count: number; seed: string; boost?: number }> = ({
  frame,
  w,
  h,
  count,
  seed,
  boost = 0,
}) => (
  <g>
    {Array.from({ length: count }, (_, i) => {
      const x = random(`${seed}x${i}`) * w;
      const y = random(`${seed}y${i}`) * h;
      const s = 1.2 + random(`${seed}s${i}`) ** 3 * 4;
      const tw = 0.45 + 0.55 * (0.5 + 0.5 * Math.sin(frame / (6 + random(`${seed}t${i}`) * 10) + i));
      const late = random(`${seed}l${i}`) > 0.6; // these only appear once the sky brightens
      const op = late ? boost * tw : tw;
      return s > 3.6 ? (
        <Sparkle key={i} x={x} y={y} size={s * 2.4} opacity={op} />
      ) : (
        <circle key={i} cx={x} cy={y} r={s} fill="#fdf6ff" opacity={op} />
      );
    })}
  </g>
);

export const Moon: React.FC<{ x: number; y: number; r: number; frame: number; bright?: number }> = ({ x, y, r, frame, bright = 0 }) => (
  <g transform={`translate(${x} ${y})`}>
    <circle r={r * 3.4} fill="url(#moonGlow)" opacity={0.85 + Math.sin(frame / 30) * 0.08 + bright * 0.3} />
    <circle r={r} fill="url(#moonBody)" />
    <circle cx={-r * 0.3} cy={-r * 0.15} r={r * 0.16} fill="#ecd69a" opacity={0.45} />
    <circle cx={r * 0.25} cy={r * 0.3} r={r * 0.11} fill="#ecd69a" opacity={0.4} />
    <circle cx={r * 0.35} cy={-r * 0.35} r={r * 0.07} fill="#ecd69a" opacity={0.35} />
  </g>
);

// The little constellation the missing star belongs to. `GAP` is where it goes.
const CLUSTER = [
  [-95, -40],
  [10, -105],
  [105, -30],
  [70, 85],
  [-60, 90],
];
export const GAP = { x: 0, y: 5 };

export const Constellation: React.FC<{ x: number; y: number; frame: number; gapPulse?: number; lines?: number }> = ({
  x,
  y,
  frame,
  gapPulse = 0,
  lines = 0,
}) => (
  <g transform={`translate(${x} ${y})`}>
    {lines > 0 &&
      CLUSTER.map(([cx, cy], i) => (
        <line key={i} x1={cx} y1={cy} x2={GAP.x} y2={GAP.y} stroke="#cfe0ff" strokeWidth={2.5} strokeDasharray="6 10" opacity={lines * 0.5} />
      ))}
    {CLUSTER.map(([cx, cy], i) => (
      <Sparkle key={i} x={cx} y={cy} size={20 + Math.sin(frame / 8 + i) * 3} rotate={Math.sin(frame / 40 + i) * 8} />
    ))}
    {gapPulse > 0 && (
      <g opacity={gapPulse}>
        <circle cx={GAP.x} cy={GAP.y} r={34 + Math.sin(frame / 5) * 5} stroke="#fff3b0" strokeWidth={3} strokeDasharray="5 8" fill="none" />
        <circle cx={GAP.x} cy={GAP.y} r={60} fill="url(#softGlow)" opacity={0.15} />
      </g>
    )}
  </g>
);

export const Fireflies: React.FC<{ frame: number; count: number; x: number; y: number; w: number; h: number; seed: string }> = ({
  frame,
  count,
  x,
  y,
  w,
  h,
  seed,
}) => (
  <g>
    {Array.from({ length: count }, (_, i) => {
      const px = x + random(`${seed}fx${i}`) * w + Math.sin(frame / 25 + i * 1.7) * 30;
      const py = y + random(`${seed}fy${i}`) * h + Math.cos(frame / 31 + i * 2.3) * 24;
      const on = 0.35 + 0.65 * (0.5 + 0.5 * Math.sin(frame / 9 + i * 2.1));
      return (
        <g key={i} opacity={on}>
          <circle cx={px} cy={py} r={18} fill="url(#warmGlow)" />
          <circle cx={px} cy={py} r={4} fill="#fff6c2" />
        </g>
      );
    })}
  </g>
);

export const Tree: React.FC<{ x: number; y: number; scale?: number; tint?: number }> = ({ x, y, scale = 1, tint = 1 }) => (
  <g transform={`translate(${x} ${y}) scale(${scale})`} opacity={tint}>
    <path d="M -55 0 Q -40 -300 -38 -700 L 38 -700 Q 40 -300 55 0 Q 80 10 95 25 L -95 25 Q -80 10 -55 0 Z" fill="url(#trunk)" />
    {[
      [-130, -760, 150],
      [120, -780, 160],
      [0, -900, 190],
      [-60, -1020, 140],
      [80, -1010, 130],
    ].map(([cx, cy, r], i) => (
      <circle key={i} cx={cx} cy={cy} r={r} fill={i % 2 ? "#1d4c55" : "#22585d"} />
    ))}
    <circle cx={-40} cy={-960} r={60} fill="#3a7f7a" opacity={0.35} />
  </g>
);

export const Mushroom: React.FC<{ x: number; y: number; scale?: number; color: "cyan" | "pink"; frame: number; seed: number }> = ({
  x,
  y,
  scale = 1,
  color,
  frame,
  seed,
}) => {
  const c = color === "cyan" ? "#6fe7f5" : "#ff8fd6";
  return (
    <g transform={`translate(${x} ${y}) scale(${scale})`}>
      <circle cy={-50} r={110} fill={`url(#${color}Glow)`} opacity={0.55 + Math.sin(frame / 14 + seed) * 0.2} />
      <path d="M -12 0 Q -16 -40 -10 -60 L 10 -60 Q 16 -40 12 0 Z" fill="#f3ead8" />
      <path d="M -50 -55 Q -48 -110 0 -112 Q 48 -110 50 -55 Q 0 -46 -50 -55 Z" fill={c} />
      <circle cx={-18} cy={-86} r={7} fill="#fff" opacity={0.75} />
      <circle cx={16} cy={-76} r={5} fill="#fff" opacity={0.75} />
    </g>
  );
};

export const BushBack: React.FC<{ x: number; y: number; scale?: number; shake?: number }> = ({ x, y, scale = 1, shake = 0 }) => (
  <g transform={`translate(${x + shake} ${y}) scale(${scale})`}>
    {[
      [-120, -110, 110],
      [0, -170, 130],
      [120, -110, 110],
    ].map(([cx, cy, r], i) => (
      <circle key={i} cx={cx} cy={cy} r={r} fill="#1d5e48" />
    ))}
  </g>
);

export const BushFront: React.FC<{ x: number; y: number; scale?: number; shake?: number }> = ({ x, y, scale = 1, shake = 0 }) => (
  <g transform={`translate(${x - shake} ${y}) scale(${scale})`}>
    {[
      [-170, -60, 95],
      [-60, -70, 110],
      [60, -70, 110],
      [170, -60, 95],
    ].map(([cx, cy, r], i) => (
      <circle key={i} cx={cx} cy={cy} r={r} fill="url(#bush)" />
    ))}
    {[
      [-120, -110],
      [-20, -140],
      [90, -120],
      [175, -95],
      [-175, -90],
    ].map(([lx, ly], i) => (
      <ellipse key={i} cx={lx} cy={ly} rx={22} ry={11} fill="#7fd39a" opacity={0.5} transform={`rotate(${-30 + i * 17} ${lx} ${ly})`} />
    ))}
  </g>
);

export const Flower: React.FC<{ x: number; y: number; color: string; frame: number; seed: number; scale?: number }> = ({
  x,
  y,
  color,
  frame,
  seed,
  scale = 1,
}) => (
  <g transform={`translate(${x} ${y}) scale(${scale}) rotate(${Math.sin(frame / 30 + seed) * 4})`}>
    <path d="M 0 0 Q 4 -30 0 -60" stroke="#3f8f6a" strokeWidth={6} fill="none" />
    <g transform="translate(0 -66)">
      <circle r={34} fill={color} opacity={0.18} />
      {[0, 72, 144, 216, 288].map((a) => (
        <ellipse key={a} cx={0} cy={-13} rx={9} ry={14} fill={color} transform={`rotate(${a})`} />
      ))}
      <circle r={8} fill="#fff4b8" />
    </g>
  </g>
);

export const Cottage: React.FC<{ x: number; y: number; frame: number }> = ({ x, y, frame }) => (
  <g transform={`translate(${x} ${y})`}>
    <rect x={-260} y={-420} width={520} height={420} rx={18} fill="url(#wall)" />
    <path d="M -310 -400 L 0 -640 L 310 -400 Z" fill="#5a3d6e" stroke="#4a3060" strokeWidth={20} strokeLinejoin="round" />
    <rect x={-60} y={-250} width={120} height={250} rx={60} fill="url(#window)" />
    <circle cx={0} cy={-120} r={260} fill="url(#warmGlow)" opacity={0.35 + Math.sin(frame / 20) * 0.04} />
    <rect x={-210} y={-330} width={110} height={110} rx={12} fill="url(#window)" />
    <rect x={100} y={-330} width={110} height={110} rx={12} fill="url(#window)" />
    <path d="M -155 -330 L -155 -220 M -210 -275 L -100 -275 M 155 -330 L 155 -220 M 100 -275 L 210 -275" stroke="#3d3470" strokeWidth={8} />
  </g>
);
