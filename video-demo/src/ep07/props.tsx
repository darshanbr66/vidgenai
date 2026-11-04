import React from "react";
import { Sparkle } from "../story/scenery";
import { CharProps } from "../story/characters";
import { BoboRider } from "../kit";

// Episode 7 characters and props in the series' 2D style, drawn over the 3D snow.

export const Ep7Defs: React.FC<{ lit?: number }> = ({ lit = 1 }) => {
  // Cool winter light on the 2D characters, a little brighter when the northern lights are back
  const k = Math.max(0.6, Math.min(1.15, lit));
  return (
    <>
      <filter id="snowLit" colorInterpolationFilters="sRGB" x="-20%" y="-20%" width="140%" height="140%">
        <feColorMatrix type="matrix" values={`${0.9 * k} 0 0 0 0.02  0 ${0.94 * k} 0 0 0.03  0 0 ${1.02 * k} 0 0.06  0 0 0 1 0`} />
      </filter>
      <radialGradient id="nivaFur" cx="40%" cy="30%" r="75%">
        <stop offset="0%" stopColor="#ffffff" />
        <stop offset="70%" stopColor="#f2f6ff" />
        <stop offset="100%" stopColor="#d6e2f6" />
      </radialGradient>
      <radialGradient id="nivaIris" cx="45%" cy="40%" r="60%">
        <stop offset="0%" stopColor="#c8f6ff" />
        <stop offset="55%" stopColor="#5fc8f0" />
        <stop offset="100%" stopColor="#1f6fb8" />
      </radialGradient>
      <radialGradient id="iceGlow" cx="50%" cy="50%" r="50%">
        <stop offset="0%" stopColor="#ffffff" stopOpacity="1" />
        <stop offset="30%" stopColor="#bfeaff" stopOpacity="0.75" />
        <stop offset="100%" stopColor="#7fc8ff" stopOpacity="0" />
      </radialGradient>
      <radialGradient id="warmGlow" cx="50%" cy="50%" r="50%">
        <stop offset="0%" stopColor="#fff4d0" stopOpacity="1" />
        <stop offset="40%" stopColor="#ffb860" stopOpacity="0.6" />
        <stop offset="100%" stopColor="#ff8a40" stopOpacity="0" />
      </radialGradient>
      <linearGradient id="auroraBeam" x1="0" y1="0" x2="1" y2="0">
        <stop offset="0%" stopColor="#bff4ff" stopOpacity="0.9" />
        <stop offset="50%" stopColor="#b89bff" stopOpacity="0.6" />
        <stop offset="100%" stopColor="#7fffc0" stopOpacity="0.45" />
      </linearGradient>
    </>
  );
};

// ---------- Niva, the little snow fox. Sitting, facing forward, (0, 0) at her feet; about 390 tall at scale 1 ----------
export type NivaMood = "happy" | "joy" | "sad" | "surprised" | "excited" | "neutral";

const flake = (r: number) =>
  Array.from({ length: 6 }, (_, i) => {
    const a = (i * Math.PI) / 3 - Math.PI / 2;
    const x = Math.cos(a) * r;
    const y = Math.sin(a) * r;
    const bx = Math.cos(a) * r * 0.55;
    const by = Math.sin(a) * r * 0.55;
    const s = r * 0.32;
    return `M 0 0 L ${x.toFixed(1)} ${y.toFixed(1)} M ${bx.toFixed(1)} ${by.toFixed(1)} L ${(bx + Math.cos(a + 0.8) * s).toFixed(1)} ${(by + Math.sin(a + 0.8) * s).toFixed(1)} M ${bx.toFixed(1)} ${by.toFixed(1)} L ${(bx + Math.cos(a - 0.8) * s).toFixed(1)} ${(by + Math.sin(a - 0.8) * s).toFixed(1)}`;
  }).join(" ");

// A fluffy outline: an ellipse whose edge is made of little round tufts
const fluffy = (rx: number, ry: number, tufts: number, depth: number) => {
  const pts: string[] = [];
  for (let i = 0; i < tufts; i++) {
    const a0 = (i / tufts) * Math.PI * 2;
    const a1 = ((i + 1) / tufts) * Math.PI * 2;
    const am = (a0 + a1) / 2;
    const p0 = [Math.cos(a0) * rx, Math.sin(a0) * ry];
    const p1 = [Math.cos(a1) * rx, Math.sin(a1) * ry];
    const c = [Math.cos(am) * (rx + depth), Math.sin(am) * (ry + depth)];
    pts.push(`${i ? "" : `M ${p0[0].toFixed(1)} ${p0[1].toFixed(1)} `}Q ${c[0].toFixed(1)} ${c[1].toFixed(1)} ${p1[0].toFixed(1)} ${p1[1].toFixed(1)}`);
  }
  return pts.join(" ") + " Z";
};

export const Niva: React.FC<{
  x: number;
  y: number;
  scale?: number;
  g: number;
  look?: { x: number; y: number };
  mood?: NivaMood;
  mouth?: number;
  blink?: number;
  tailWag?: number; // 0..1.5
  squash?: number;
  headTilt?: number;
  pawUp?: number; // 0..1 lifts her right front paw
  lean?: number;
}> = ({ x, y, scale = 1, g, look = { x: 0, y: 0 }, mood = "happy", mouth = 0, blink = 1, tailWag = 0.6, squash = 1, headTilt = 0, pawUp = 0, lean = 0 }) => {
  const talking = mouth > 0.06;
  const sad = mood === "sad";
  const big = mood === "surprised" || mood === "excited" ? 1.1 : 1;
  const wag = Math.sin(g / (sad ? 14 : 5)) * 10 * tailWag;
  const earDroop = sad ? 22 : 0;
  const eye = (side: -1 | 1) => {
    const cx = side * 40;
    if (mood === "joy" && !talking && blink > 0.5) return <path key={side} d={`M ${cx - 20} 2 Q ${cx} -20 ${cx + 20} 2`} stroke="#1d3a6e" strokeWidth={7} strokeLinecap="round" fill="none" />;
    return (
      <g key={side} transform={`translate(${cx} -6) scale(${big} ${big * blink})`}>
        <ellipse rx={26} ry={31} fill="#fff" stroke="#9fb8d8" strokeWidth={2.5} />
        <g transform={`translate(${look.x * 7} ${look.y * 8})`}>
          <circle r={20} fill="url(#nivaIris)" />
          <circle r={10} fill="#123058" />
          <circle cx={-7} cy={-8} r={7} fill="#fff" />
          <circle cx={6} cy={7} r={3} fill="#fff" opacity={0.9} />
        </g>
        <path d={`M ${21 * side} -22 L ${32 * side} -31 M ${26 * side} -12 L ${38 * side} -17`} stroke="#5a7aa8" strokeWidth={4} strokeLinecap="round" />
        {sad && <path d={`M ${-18} -30 Q 0 ${-36} 18 -30`} transform={`rotate(${side * -14})`} stroke="#8aa0c8" strokeWidth={4} strokeLinecap="round" fill="none" />}
      </g>
    );
  };
  const mouthShape = talking ? (
    <g>
      <path d={`M -12 30 Q 0 26 12 30 Q 10 ${34 + mouth * 14} 0 ${36 + mouth * 16} Q -10 ${34 + mouth * 14} -12 30 Z`} fill="#7a3048" />
      <ellipse cx={0} cy={33 + mouth * 11} rx={6} ry={2.5 + mouth * 2.5} fill="#ff9fb8" />
    </g>
  ) : sad ? (
    <path d="M -11 36 Q 0 28 11 36" stroke="#5a3048" strokeWidth={4.5} strokeLinecap="round" fill="none" />
  ) : mood === "surprised" ? (
    <ellipse cx={0} cy={34} rx={7} ry={9} fill="#7a3048" />
  ) : mood === "excited" || mood === "joy" ? (
    <path d="M -15 28 Q 0 48 15 28 Z" fill="#7a3048" stroke="#7a3048" strokeWidth={3} strokeLinejoin="round" />
  ) : (
    <path d="M -14 28 Q -7 36 0 29 Q 7 36 14 28" stroke="#5a3048" strokeWidth={4.5} strokeLinecap="round" fill="none" />
  );
  const ear = (side: -1 | 1) => (
    <g key={side} transform={`translate(${side * 58} -66) rotate(${side * (16 + earDroop) + Math.sin(g / 17 + side) * 3})`}>
      <path d="M -28 18 Q -24 -40 0 -78 Q 24 -40 28 18 Z" fill="url(#nivaFur)" stroke="#c8d6ee" strokeWidth={3} strokeLinejoin="round" />
      <path d="M -15 10 Q -12 -30 0 -56 Q 12 -30 15 10 Z" fill="#cfe6ff" />
    </g>
  );
  return (
    <g transform={`translate(${x} ${y}) scale(${scale}) rotate(${lean}) scale(${1 / Math.sqrt(squash)} ${squash})`}>
      <ellipse cx={0} cy={4} rx={100} ry={18} fill="url(#shadow)" />
      {/* the big fluffy tail curling up beside her */}
      <g transform={`translate(54 -38) rotate(${-10 + wag})`}>
        <path d="M 0 0 C 70 -10 118 -70 96 -150 C 88 -182 58 -190 48 -168 C 76 -120 50 -70 -6 -40 Z" fill="url(#nivaFur)" stroke="#c8d6ee" strokeWidth={3} strokeLinejoin="round" />
        <path d="M 96 -150 C 88 -182 58 -190 48 -168 C 58 -150 74 -142 96 -150 Z" fill="#dff0ff" />
        <path d="M 40 -30 Q 78 -70 74 -120" stroke="#e2ecfb" strokeWidth={6} fill="none" strokeLinecap="round" />
      </g>
      {/* back legs and body */}
      {[-1, 1].map((sd) => (
        <ellipse key={sd} cx={sd * 56} cy={-24} rx={36} ry={26} fill="url(#nivaFur)" stroke="#d2def2" strokeWidth={2} />
      ))}
      <path d={fluffy(74, 88, 18, 9)} transform="translate(0 -100)" fill="url(#nivaFur)" stroke="#d2def2" strokeWidth={2} />
      <path d={fluffy(40, 46, 10, 7)} transform="translate(0 -128)" fill="#ffffff" />
      {/* front paws */}
      <g>
        <rect x={-46} y={-80} width={30} height={72} rx={15} fill="url(#nivaFur)" stroke="#d2def2" strokeWidth={2} />
        <ellipse cx={-31} cy={-10} rx={21} ry={14} fill="#ffffff" stroke="#d2def2" strokeWidth={2} />
      </g>
      <g transform={`translate(31 -76) rotate(${-pawUp * 110})`}>
        <rect x={-15} y={-4} width={30} height={72} rx={15} fill="url(#nivaFur)" stroke="#d2def2" strokeWidth={2} />
        <ellipse cx={0} cy={66} rx={21} ry={14} fill="#ffffff" stroke="#d2def2" strokeWidth={2} />
      </g>
      {/* head */}
      <g transform={`translate(0 -228) rotate(${headTilt})`}>
        {ear(-1)}
        {ear(1)}
        {/* cheek tufts */}
        {[-1, 1].map((sd) => (
          <path key={sd} d={`M ${sd * 70} -10 L ${sd * 112} 18 L ${sd * 84} 22 L ${sd * 106} 44 L ${sd * 70} 40 Z`} fill="url(#nivaFur)" stroke="#d2def2" strokeWidth={2} strokeLinejoin="round" />
        ))}
        <ellipse rx={98} ry={86} fill="url(#nivaFur)" stroke="#d2def2" strokeWidth={2.5} />
        <ellipse cx={0} cy={26} rx={46} ry={32} fill="#ffffff" />
        <ellipse cx={-62} cy={24} rx={17} ry={10} fill="#ffb0c4" opacity={sad ? 0.3 : 0.55} />
        <ellipse cx={62} cy={24} rx={17} ry={10} fill="#ffb0c4" opacity={sad ? 0.3 : 0.55} />
        {eye(-1)}
        {eye(1)}
        <ellipse cx={0} cy={14} rx={11} ry={8} fill="#2a3450" />
        <ellipse cx={-3} cy={11} rx={4} ry={2.5} fill="#fff" opacity={0.7} />
        {mouthShape}
        {/* the tiny blue snowflake on her forehead */}
        <g transform={`translate(0 -54) rotate(${Math.sin(g / 20) * 4})`}>
          <circle r={18} fill="#9fdcff" opacity={0.25 + 0.12 * Math.sin(g / 6)} />
          <path d={flake(13)} stroke="#3a9ae8" strokeWidth={3.2} strokeLinecap="round" fill="none" />
          <circle r={3} fill="#3a9ae8" />
        </g>
      </g>
    </g>
  );
};

// ---------- Bobo's little winter scarf, drawn over him with the same body transform ----------
export const BoboScarf: React.FC<CharProps & { g: number; appear?: number }> = ({ x, y, scale = 1, lean = 0, squash = 1, walk = null, g, appear = 1 }) => {
  if (appear <= 0) return null;
  const bob = walk == null ? 0 : Math.abs(Math.cos(walk)) * 12;
  const sw = Math.sin(g / 9) * 5;
  return (
    <g transform={`translate(${x} ${y}) scale(${scale}) rotate(${lean}) scale(${1 / Math.sqrt(squash)} ${squash})`}>
      <g transform={`translate(0 ${-bob - 208}) scale(${appear})`}>
        {/* the hanging end */}
        <g transform={`translate(44 4) rotate(${-8 + sw})`}>
          <rect x={-17} y={0} width={34} height={92} rx={8} fill="#e8564e" />
          {[24, 52].map((sy) => (
            <rect key={sy} x={-17} y={sy} width={34} height={9} fill="#fff1d6" />
          ))}
          {[-12, -4, 4, 12].map((fx) => (
            <path key={fx} d={`M ${fx} 92 L ${fx + sw * 0.3} 108`} stroke="#e8564e" strokeWidth={5} strokeLinecap="round" />
          ))}
        </g>
        {/* the wrap */}
        <path d="M -84 -14 Q 0 14 84 -14 L 86 16 Q 0 46 -86 16 Z" fill="#e8564e" stroke="#c8443e" strokeWidth={3} strokeLinejoin="round" />
        {[-60, -30, 0, 30, 60].map((sx) => (
          <path key={sx} d={`M ${sx} ${-6 + Math.abs(sx) * -0.12 + 16} l 0 18`} stroke="#c8443e" strokeWidth={3} strokeLinecap="round" opacity={0.7} />
        ))}
        <path d="M -80 0 Q 0 26 80 0" stroke="#fff1d6" strokeWidth={7} fill="none" />
      </g>
    </g>
  );
};

// Bobo (with the mint creature) in his scarf
export const BoboWinter: React.FC<React.ComponentProps<typeof BoboRider> & { scarf?: number }> = ({ scarf = 1, ...p }) => (
  <>
    <BoboRider {...p} />
    <BoboScarf {...p} appear={scarf} />
  </>
);

// Where each character's mouth is on screen, for breath clouds
export const dracoMouth = (x: number, y: number, s: number) => ({ x, y: y - 172 * s });
export const lumiMouth = (x: number, y: number, s: number) => ({ x, y: y - 360 * s });
export const boboMouth = (x: number, y: number, s: number) => ({ x, y: y - 262 * s });

// Little clouds of breath in the cold air
export const BreathPuff: React.FC<{ x: number; y: number; scale: number; g: number; ph?: number; side?: number; every?: number }> = ({ x, y, scale, g, ph = 0, side = 1, every = 54 }) => (
  <g>
    {[0, 0.5].map((o, i) => {
      const k = (((g + ph) / every + o) % 1 + 1) % 1;
      if (k > 0.75) return null;
      return (
        <g key={i} opacity={(1 - k / 0.75) * 0.75}>
          {[0, 1, 2].map((j) => (
            <circle key={j} cx={x + side * (24 + k * 80 + j * 12) * scale} cy={y - (k * 50 + j * 6) * scale} r={(10 + k * 26 - j * 4) * scale} fill="#f4faff" />
          ))}
        </g>
      );
    })}
  </g>
);

// Draco's warm magical breath: a golden, sparkly stream toward a point. on 0..1
export const WarmBreath: React.FC<{ from: { x: number; y: number }; to: { x: number; y: number }; on: number; g: number; scale: number }> = ({ from, to, on, g, scale }) => {
  if (on <= 0) return null;
  const dx = to.x - from.x;
  const dy = to.y - from.y;
  return (
    <g opacity={Math.min(1, on * 2)}>
      {Array.from({ length: 26 }, (_, i) => {
        const k = (i / 26 + g / 30) % 1;
        if (k > on * 1.2) return null;
        const wob = Math.sin(i * 1.7 + g / 4) * 26 * scale * k;
        const px = from.x + dx * k - (dy / Math.hypot(dx, dy)) * wob;
        const py = from.y + dy * k + (dx / Math.hypot(dx, dy)) * wob;
        const r = (14 + k * 34) * scale;
        return <circle key={i} cx={px} cy={py} r={r} fill="url(#warmGlow)" opacity={0.9 - k * 0.5} />;
      })}
      {Array.from({ length: 10 }, (_, i) => {
        const k = (i / 10 + g / 22) % 1;
        return <Sparkle key={`s${i}`} x={from.x + dx * k + Math.sin(i * 3 + g / 3) * 20 * scale} y={from.y + dy * k + Math.cos(i * 2 + g / 3) * 20 * scale} size={10 * scale + 6} color={i % 2 ? "#ffe39a" : "#fff8e0"} rotate={g * 4 + i * 30} opacity={0.9 - k * 0.4} />;
      })}
    </g>
  );
};

// ---------- the light from the seashell: blue, purple and gold strands ----------
export const AuroraBeam: React.FC<{ from: { x: number; y: number }; to: { x: number; y: number }; on: number; g: number; width?: number }> = ({ from, to, on, g, width = 40 }) => {
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
      <path d={`M 0 ${-w * 0.5} L ${reach} ${-w} L ${reach} ${w} L 0 ${w * 0.5} Z`} fill="url(#auroraBeam)" opacity={0.4} />
      <path d={strand(0, 18)} stroke="#9fe8ff" strokeWidth={7} fill="none" strokeLinecap="round" />
      <path d={strand(2.1, 18)} stroke="#c49bff" strokeWidth={7} fill="none" strokeLinecap="round" />
      <path d={strand(4.2, 18)} stroke="#ffe39a" strokeWidth={7} fill="none" strokeLinecap="round" />
      <path d={`M 0 -7 L ${reach} -4 L ${reach} 4 L 0 7 Z`} fill="#f6fdff" />
      {Array.from({ length: 10 }, (_, i) => {
        const u = ((i / 10 + g / 36) % 1) * reach;
        return <circle key={i} cx={u} cy={Math.sin(i * 2.3 + g / 3) * w * 0.5} r={5 + (i % 3) * 2} fill={["#d8f8ff", "#e8d8ff", "#fff3c0"][i % 3]} />;
      })}
    </g>
  );
};

// ---------- the glowing snowflake pendant Niva gives Lumi ----------
export const SnowflakePendant: React.FC<{ x: number; y: number; scale?: number; g: number; glow?: number }> = ({ x, y, scale = 1, g, glow = 0.5 }) => (
  <g transform={`translate(${x} ${y}) scale(${scale}) rotate(${Math.sin(g / 9) * 6})`}>
    <circle r={80} fill="url(#iceGlow)" opacity={0.3 + glow * 0.6} />
    <circle cy={-46} r={7} fill="none" stroke="#e8f4ff" strokeWidth={4} />
    <path d={flake(38)} stroke="#e8f8ff" strokeWidth={9} strokeLinecap="round" fill="none" />
    <path d={flake(38)} stroke="#5fc0ff" strokeWidth={4.5} strokeLinecap="round" fill="none" />
    <circle r={9} fill="#e8f8ff" stroke="#5fc0ff" strokeWidth={3} />
  </g>
);

// ---------- the magical snowy pathway rising from the seashell (2D, scene 1) ----------
export const SnowPath: React.FC<{ from: { x: number; y: number }; to: { x: number; y: number }; reveal: number; g: number }> = ({ from, to, reveal, g }) => {
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
      <path d={d} pathLength={1} strokeDasharray={`${reveal} 1`} stroke="#bfeaff" strokeWidth={90} strokeLinecap="round" fill="none" opacity={0.22} />
      <path d={d} pathLength={1} strokeDasharray={`${reveal} 1`} stroke="#eaf8ff" strokeWidth={34} strokeLinecap="round" fill="none" opacity={0.75} />
      {Array.from({ length: 16 }, (_, i) => {
        const u = ((i / 16 + g / 90) % 1) * reveal;
        const p = at(u);
        return (
          <g key={i} transform={`translate(${p.x} ${p.y}) rotate(${g * 2 + i * 25}) scale(${0.6 + (i % 3) * 0.25})`}>
            <path d={flake(18)} stroke="#ffffff" strokeWidth={4} strokeLinecap="round" fill="none" />
          </g>
        );
      })}
    </g>
  );
};
