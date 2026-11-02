import React from "react";

// Episode 5 characters and props drawn in the series' 2D style, to sit over the 3D world.

export const Ep5Defs: React.FC<{ lit: number }> = ({ lit }) => {
  // Moonlight on the 2D characters: cool and dim when the kingdom is dark, warm and bright when it is lit
  const k = Math.max(0, Math.min(1.3, lit));
  const r = 0.66 + 0.3 * k;
  const g = 0.7 + 0.27 * k;
  const b = 0.9 + 0.1 * k;
  return (
    <>
      <filter id="moonLit" colorInterpolationFilters="sRGB" x="-20%" y="-20%" width="140%" height="140%">
        <feColorMatrix type="matrix" values={`${r} 0 0 0 ${0.01 + 0.03 * k}  0 ${g} 0 0 ${0.02 + 0.02 * k}  0 0 ${b} 0 ${0.07 - 0.02 * k}  0 0 0 1 0`} />
      </filter>
      <radialGradient id="mooniaBody" cx="40%" cy="30%" r="75%">
        <stop offset="0%" stopColor="#ffffff" />
        <stop offset="45%" stopColor="#d6e8ff" />
        <stop offset="100%" stopColor="#8fb0f0" />
      </radialGradient>
      <radialGradient id="mooniaAura" cx="50%" cy="50%" r="50%">
        <stop offset="0%" stopColor="#bfe0ff" stopOpacity="0.75" />
        <stop offset="55%" stopColor="#8fb8ff" stopOpacity="0.25" />
        <stop offset="100%" stopColor="#8fb8ff" stopOpacity="0" />
      </radialGradient>
      <linearGradient id="mooniaTail" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#c6dcff" />
        <stop offset="100%" stopColor="#c6dcff" stopOpacity="0" />
      </linearGradient>
      <linearGradient id="silverMoon" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stopColor="#ffffff" />
        <stop offset="50%" stopColor="#fff3c4" />
        <stop offset="100%" stopColor="#ffd36e" />
      </linearGradient>
      <radialGradient id="beamCore" cx="50%" cy="50%" r="50%">
        <stop offset="0%" stopColor="#fff8d0" stopOpacity="1" />
        <stop offset="100%" stopColor="#ffd36e" stopOpacity="0" />
      </radialGradient>
      <linearGradient id="goldBeam" x1="0" y1="0" x2="1" y2="0">
        <stop offset="0%" stopColor="#fff3b0" stopOpacity="0.95" />
        <stop offset="100%" stopColor="#ffd36e" stopOpacity="0.55" />
      </linearGradient>
    </>
  );
};

const starPath = (r: number, inner = 0.45) =>
  Array.from({ length: 10 }, (_, i) => {
    const a = -Math.PI / 2 + (i * Math.PI) / 5;
    const rr = i % 2 ? r * inner : r;
    return `${i ? "L" : "M"} ${(Math.cos(a) * rr).toFixed(1)} ${(Math.sin(a) * rr).toFixed(1)}`;
  }).join(" ") + " Z";

export type MooniaMood = "happy" | "worried" | "joy" | "surprised" | "neutral";

// Moonia, the little glowing guardian of the Moon Kingdom. Drawn with (0,0) at the tip of her wispy tail.
export const Moonia: React.FC<{
  x: number;
  y: number;
  scale?: number;
  g: number;
  look?: { x: number; y: number };
  mood?: MooniaMood;
  mouth?: number;
  blink?: number;
  armL?: number; // degrees, positive raises
  armR?: number;
  glow?: number;
  tilt?: number;
  appear?: number; // 0..1
}> = ({ x, y, scale = 1, g, look = { x: 0, y: 0 }, mood = "happy", mouth = 0, blink = 1, armL = 10, armR = 10, glow = 1, tilt = 0, appear = 1 }) => {
  const talking = mouth > 0.06;
  const worried = mood === "worried";
  const surprised = mood === "surprised";
  const sway = Math.sin(g / 14) * 4;
  const eye = (side: -1 | 1) => {
    const cx = side * 34;
    if (mood === "joy" && !talking && blink > 0.5) return <path key={side} d={`M ${cx - 18} -4 Q ${cx} -28 ${cx + 18} -4`} stroke="#26306e" strokeWidth={7} strokeLinecap="round" fill="none" />;
    const big = surprised ? 1.1 : 1;
    return (
      <g key={side} transform={`translate(${cx} -8) scale(${big} ${big * blink})`}>
        <ellipse rx={25} ry={30} fill="#fff" stroke="#5a74c8" strokeWidth={3} />
        <ellipse cx={look.x * 7} cy={look.y * 8} rx={18} ry={22} fill="#26306e" />
        <ellipse cx={look.x * 7} cy={look.y * 8 + 4} rx={11} ry={13} fill="#4f6ad8" />
        <circle cx={-7 + look.x * 5} cy={-10 + look.y * 5} r={8} fill="#fff" />
        <circle cx={7 + look.x * 5} cy={8 + look.y * 5} r={3.5} fill="#fff" opacity={0.9} />
      </g>
    );
  };
  const brow = (side: -1 | 1) => {
    const by = surprised ? -54 : -46;
    const t = worried ? side * -18 : 0;
    return <path key={side} d={`M ${side * 34 - 13} ${by} Q ${side * 34} ${by - 7} ${side * 34 + 13} ${by}`} transform={`rotate(${t} ${side * 34} ${by})`} stroke="#5a74c8" strokeWidth={5} strokeLinecap="round" fill="none" />;
  };
  const mouthShape = talking ? (
    <g>
      <path d={`M -16 40 Q 0 35 16 40 Q 13 ${44 + mouth * 18} 0 ${46 + mouth * 20} Q -13 ${44 + mouth * 18} -16 40 Z`} fill="#4a2a6e" />
      <ellipse cx={0} cy={44 + mouth * 14} rx={7} ry={3 + mouth * 3} fill="#ff9fc4" />
    </g>
  ) : worried ? (
    <path d="M -12 48 Q 0 39 12 48" stroke="#4a2a6e" strokeWidth={5} strokeLinecap="round" fill="none" />
  ) : surprised ? (
    <ellipse cx={0} cy={44} rx={8} ry={10} fill="#4a2a6e" />
  ) : mood === "neutral" ? (
    <path d="M -10 42 Q 0 49 10 42" stroke="#4a2a6e" strokeWidth={5} strokeLinecap="round" fill="none" />
  ) : (
    <path d="M -18 38 Q 0 60 18 38 Z" fill="#4a2a6e" stroke="#4a2a6e" strokeWidth={3} strokeLinejoin="round" />
  );
  const arm = (side: -1 | 1, angle: number) => (
    <g transform={`translate(${side * 82} 10) rotate(${side * -(20 + angle)})`}>
      <ellipse cy={20} rx={15} ry={26} fill="url(#mooniaBody)" stroke="#a8c4f4" strokeWidth={2} />
    </g>
  );
  const s = scale * (0.2 + 0.8 * appear);
  return (
    <g transform={`translate(${x} ${y}) scale(${s}) rotate(${tilt + sway * 0.3})`} opacity={Math.min(1, appear * 1.5)}>
      <circle cy={-150} r={230} fill="url(#mooniaAura)" opacity={0.55 + 0.25 * glow + Math.sin(g / 8) * 0.06} />
      {/* wispy tail */}
      <path d={`M -46 -84 Q ${-30 + sway} -20 ${8 + sway * 2} 0 Q ${-6 + sway} -40 46 -84 Z`} fill="url(#mooniaTail)" />
      <g transform="translate(0 -150)">
        {/* rounded ears */}
        {[-1, 1].map((side) => (
          <g key={side} transform={`translate(${side * 64} -66) rotate(${side * 24})`}>
            <ellipse rx={22} ry={34} fill="url(#mooniaBody)" stroke="#a8c4f4" strokeWidth={2} />
            <ellipse rx={11} ry={20} fill="#d8c8ff" />
          </g>
        ))}
        {/* the crescent crest on a tiny stalk */}
        <path d="M 0 -96 Q -4 -120 2 -134" stroke="#c8dcff" strokeWidth={6} strokeLinecap="round" fill="none" />
        <g transform={`translate(4 -150) rotate(${-20 + Math.sin(g / 10) * 6})`}>
          <circle r={34} fill="#fff3c4" opacity={0.25 + 0.15 * glow} />
          <path d="M 6 -22 A 22 22 0 1 0 6 22 A 17 17 0 1 1 6 -22 Z" fill="url(#silverMoon)" stroke="#e8b84a" strokeWidth={2} />
        </g>
        {arm(-1, armL)}
        {arm(1, armR)}
        {/* round glowing body */}
        <ellipse rx={92} ry={98} fill="url(#mooniaBody)" stroke="#a8c4f4" strokeWidth={3} />
        <ellipse cx={-30} cy={-50} rx={30} ry={16} fill="#fff" opacity={0.55} transform="rotate(-22 -30 -50)" />
        {/* tiny stars on her body */}
        {[
          [-58, 46, 11],
          [54, 52, 9],
          [-12, 80, 7],
          [66, -30, 7],
        ].map(([sx, sy, r], i) => (
          <path key={i} d={starPath(r)} transform={`translate(${sx} ${sy}) scale(${0.85 + 0.25 * Math.sin(g / 6 + i * 2)}) rotate(${i * 20})`} fill="#ffd96e" stroke="#f0b840" strokeWidth={1.5} />
        ))}
        <ellipse cx={-60} cy={26} rx={15} ry={9} fill="#ffa8d0" opacity={worried ? 0.35 : 0.7} />
        <ellipse cx={60} cy={26} rx={15} ry={9} fill="#ffa8d0" opacity={worried ? 0.35 : 0.7} />
        {eye(-1)}
        {eye(1)}
        {brow(-1)}
        {brow(1)}
        {mouthShape}
      </g>
    </g>
  );
};

// Where Moonia's raised right hand is, for things she holds
export const mooniaHand = (x: number, y: number, scale: number, angle: number) => {
  const a = ((20 + angle) * Math.PI) / 180;
  return { x: x + (82 + 46 * Math.sin(a)) * scale, y: y + (-140 + 46 * Math.cos(a)) * scale };
};

// The little glowing moon pendant Moonia gives Lumi
export const MoonPendant: React.FC<{ x: number; y: number; scale?: number; g: number; glow?: number }> = ({ x, y, scale = 1, g, glow = 0.5 }) => (
  <g transform={`translate(${x} ${y}) scale(${scale}) rotate(${Math.sin(g / 9) * 6})`}>
    <circle r={70} fill="url(#beamCore)" opacity={0.3 + glow * 0.6} />
    <path d="M -16 -44 Q 0 -60 16 -44" stroke="#e8eefc" strokeWidth={4} fill="none" strokeLinecap="round" />
    <circle cy={-36} r={7} fill="none" stroke="#e8eefc" strokeWidth={4} />
    <path d="M 8 -28 A 28 28 0 1 0 8 28 A 22 22 0 1 1 8 -28 Z" fill="#e8f2ff" stroke="#5a74c8" strokeWidth={4} />
    <circle cx={-6} cy={0} r={6} fill="#bfe8ff" opacity={0.6 + glow * 0.4} />
  </g>
);

// A golden beam of light between two screen points, with a shimmering core
export const GoldBeam: React.FC<{ from: { x: number; y: number }; to: { x: number; y: number }; on: number; g: number }> = ({ from, to, on, g }) => {
  if (on <= 0) return null;
  const dx = to.x - from.x;
  const dy = to.y - from.y;
  const len = Math.hypot(dx, dy);
  const ang = (Math.atan2(dy, dx) * 180) / Math.PI;
  const reach = len * Math.min(1, on * 1.4);
  const w = 36 + Math.sin(g / 2) * 5;
  return (
    <g transform={`translate(${from.x} ${from.y}) rotate(${ang})`} opacity={Math.min(1, on * 2)}>
      <path d={`M 0 ${-w} L ${reach} ${-w * 0.6} L ${reach} ${w * 0.6} L 0 ${w} Z`} fill="url(#goldBeam)" opacity={0.5} />
      <path d={`M 0 -12 L ${reach} -7 L ${reach} 7 L 0 12 Z`} fill="#fffbe6" />
      {Array.from({ length: 9 }, (_, i) => {
        const u = ((i / 9 + g / 40) % 1) * reach;
        return <circle key={i} cx={u} cy={Math.sin(i * 2.3 + g / 3) * w * 0.5} r={5 + (i % 3) * 2} fill="#fff6c8" />;
      })}
    </g>
  );
};
