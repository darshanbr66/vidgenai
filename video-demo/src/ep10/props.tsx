import React from "react";
import { random } from "remotion";
import { Sparkle } from "../story/scenery";

// Episode 10 characters and props in the series' 2D style, drawn over the 3D sky city.

export const Ep10Defs: React.FC<{ lit?: number }> = ({ lit = 1 }) => {
  // Soft, bright high-altitude light on the 2D characters: a touch cool before the crystal wakes
  const k = Math.max(0.75, Math.min(1.12, lit));
  return (
    <>
      <filter id="skyLit" colorInterpolationFilters="sRGB" x="-20%" y="-20%" width="140%" height="140%">
        <feColorMatrix type="matrix" values={`${1.0 * k} 0 0 0 0.02  0 ${1.0 * k} 0 0 0.025  0 0 ${1.02 * k} 0 0.035  0 0 0 1 0`} />
      </filter>
      <radialGradient id="nimbusBody" cx="40%" cy="32%" r="75%">
        <stop offset="0%" stopColor="#ffffff" />
        <stop offset="70%" stopColor="#f2f7ff" />
        <stop offset="100%" stopColor="#d4e2fb" />
      </radialGradient>
      <radialGradient id="nimbusIris" cx="45%" cy="38%" r="62%">
        <stop offset="0%" stopColor="#bff0ff" />
        <stop offset="50%" stopColor="#3fa8f5" />
        <stop offset="100%" stopColor="#1458b8" />
      </radialGradient>
      <radialGradient id="windGlow" cx="50%" cy="50%" r="50%">
        <stop offset="0%" stopColor="#ffffff" stopOpacity="1" />
        <stop offset="40%" stopColor="#cfe8ff" stopOpacity="0.6" />
        <stop offset="100%" stopColor="#9fd0ff" stopOpacity="0" />
      </radialGradient>
      <linearGradient id="basketWeave" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#e8b878" />
        <stop offset="100%" stopColor="#b07a3e" />
      </linearGradient>
      <radialGradient id="bananaCloud" cx="40%" cy="35%" r="75%">
        <stop offset="0%" stopColor="#fffff0" />
        <stop offset="100%" stopColor="#ffe98a" />
      </radialGradient>
    </>
  );
};

// A fluffy outline: an ellipse whose edge is a ring of round bumps
const fluffy = (rx: number, ry: number, bumps: number, depth: number) => {
  const pts: string[] = [];
  for (let i = 0; i < bumps; i++) {
    const a0 = (i / bumps) * Math.PI * 2;
    const a1 = ((i + 1) / bumps) * Math.PI * 2;
    const am = (a0 + a1) / 2;
    const p0 = [Math.cos(a0) * rx, Math.sin(a0) * ry];
    const p1 = [Math.cos(a1) * rx, Math.sin(a1) * ry];
    const c = [Math.cos(am) * (rx + depth), Math.sin(am) * (ry + depth)];
    pts.push(`${i ? "" : `M ${p0[0].toFixed(1)} ${p0[1].toFixed(1)} `}Q ${c[0].toFixed(1)} ${c[1].toFixed(1)} ${p1[0].toFixed(1)} ${p1[1].toFixed(1)}`);
  }
  return pts.join(" ") + " Z";
};

// ---------- Nimbus, the tiny cloud creature. Floats; (0, 0) is the point under it on the ground.
// About 300 tall at scale 1 ----------
export type NimbusMood = "shy" | "happy" | "joy" | "surprised" | "scared" | "windup" | "sneeze" | "puff" | "blow" | "brave";

export const Nimbus: React.FC<{
  x: number;
  y: number;
  scale?: number;
  g: number;
  look?: { x: number; y: number };
  mood?: NimbusMood;
  mouth?: number;
  blink?: number;
  float?: number; // hover height above the ground point, in units
  puff?: number; // 0..1 inflates with a big breath
  squash?: number;
  tilt?: number;
  wave?: number; // 0..1 a little wing wave
}> = ({ x, y, scale = 1, g, look = { x: 0, y: 0 }, mood = "happy", mouth = 0, blink = 1, float = 120, puff = 0, squash = 1, tilt = 0, wave = 0 }) => {
  const talking = mouth > 0.06;
  const hover = float + Math.sin(g / 9) * 12;
  const big = mood === "surprised" || mood === "scared" ? 1.12 : 1;
  const flap = Math.sin(g / 2.2) * 22;
  const inflate = 1 + puff * 0.55;
  const eye = (side: -1 | 1) => {
    const cx = side * 38;
    if ((mood === "joy" && !talking && blink > 0.5) || mood === "sneeze") {
      return <path key={side} d={mood === "sneeze" ? `M ${cx - 18} -12 L ${cx + 14} -2 L ${cx - 18} 8` : `M ${cx - 18} 2 Q ${cx} -18 ${cx + 18} 2`} transform={mood === "sneeze" && side === 1 ? `scale(-1 1) translate(${-2 * cx} 0)` : undefined} stroke="#1d3a6e" strokeWidth={7} strokeLinecap="round" strokeLinejoin="round" fill="none" />;
    }
    const squint = mood === "windup" ? 0.45 : 1;
    return (
      <g key={side} transform={`translate(${cx} -6) scale(${big} ${big * blink * squint})`}>
        <ellipse rx={27} ry={32} fill="#fff" stroke="#b8cce8" strokeWidth={2} />
        <g transform={`translate(${look.x * 7} ${look.y * 8 + (mood === "windup" ? -6 : 0)})`}>
          <circle r={22} fill="url(#nimbusIris)" />
          <circle r={10} fill="#0e2a5a" />
          <circle cx={-8} cy={-9} r={8} fill="#fff" />
          <circle cx={7} cy={8} r={3.5} fill="#fff" opacity={0.9} />
        </g>
        {mood === "scared" && <path d="M -22 -40 Q 0 -30 22 -42" stroke="#8aa0c8" strokeWidth={4} fill="none" strokeLinecap="round" transform={`rotate(${side * 10})`} />}
      </g>
    );
  };
  const mouthShape =
    mood === "blow" ? (
      <ellipse cx={0} cy={36} rx={9} ry={11} fill="#3a2a5a" />
    ) : mood === "puff" ? (
      <path d="M -8 34 L 8 34" stroke="#3a2a5a" strokeWidth={5} strokeLinecap="round" />
    ) : mood === "sneeze" ? (
      <ellipse cx={0} cy={38} rx={22} ry={18} fill="#3a2a5a" />
    ) : talking ? (
      <g>
        <path d={`M -12 30 Q 0 26 12 30 Q 10 ${34 + mouth * 13} 0 ${36 + mouth * 15} Q -10 ${34 + mouth * 13} -12 30 Z`} fill="#3a2a5a" />
        <ellipse cx={0} cy={33 + mouth * 10} rx={6} ry={2.4 + mouth * 2.4} fill="#ff9fb8" />
      </g>
    ) : mood === "scared" ? (
      <path d="M -12 38 Q -6 32 0 38 Q 6 32 12 38" stroke="#3a2a5a" strokeWidth={4.5} fill="none" strokeLinecap="round" />
    ) : mood === "surprised" || mood === "windup" ? (
      <ellipse cx={0} cy={34} rx={6} ry={mood === "windup" ? 4 : 8} fill="#3a2a5a" />
    ) : mood === "shy" ? (
      <path d="M -9 32 Q 0 38 9 32" stroke="#3a2a5a" strokeWidth={4.5} fill="none" strokeLinecap="round" />
    ) : (
      <path d="M -15 28 Q 0 48 15 28 Z" fill="#3a2a5a" stroke="#3a2a5a" strokeWidth={3} strokeLinejoin="round" />
    );
  const wing = (side: -1 | 1) => (
    <g key={side} transform={`translate(${side * 88} -20) rotate(${side * (-20 + flap - (side === 1 ? wave * 50 * Math.abs(Math.sin(g / 3)) : 0))})`}>
      <path d={`M 0 0 C ${side * 30} -40 ${side * 70} -36 ${side * 66} -6 C ${side * 50} -10 ${side * 46} 6 ${side * 30} 4 C ${side * 22} 14 ${side * 8} 10 0 8 Z`} fill="#ffffff" stroke="#c8d8f2" strokeWidth={3} strokeLinejoin="round" />
    </g>
  );
  return (
    <g transform={`translate(${x} ${y}) scale(${scale})`}>
      <ellipse cx={0} cy={4} rx={70} ry={12} fill="url(#shadow)" opacity={0.6} />
      <g transform={`translate(0 ${-hover}) rotate(${tilt}) scale(${inflate / Math.sqrt(squash)} ${inflate * squash})`}>
        {/* the little cloud-shaped tail */}
        <g transform={`translate(78 40) rotate(${Math.sin(g / 6) * 12})`}>
          <path d={fluffy(22, 15, 6, 7)} transform="translate(18 6)" fill="url(#nimbusBody)" stroke="#c8d8f2" strokeWidth={2.5} />
          <path d={fluffy(13, 9, 5, 5)} transform="translate(46 -8)" fill="url(#nimbusBody)" stroke="#c8d8f2" strokeWidth={2.5} />
        </g>
        {wing(-1)}
        {wing(1)}
        <path d={fluffy(96, 82, 14, 18)} fill="url(#nimbusBody)" stroke="#c8d8f2" strokeWidth={3} />
        {/* a tiny swirl of cloud on top of the head */}
        <path d="M -8 -96 C -18 -122 12 -132 14 -110 C 15 -100 2 -100 2 -108" stroke="#d8e6fb" strokeWidth={7} fill="none" strokeLinecap="round" />
        <ellipse cx={-56} cy={22} rx={16} ry={10} fill="#ffb0c8" opacity={mood === "shy" ? 0.85 : 0.55} />
        <ellipse cx={56} cy={22} rx={16} ry={10} fill="#ffb0c8" opacity={mood === "shy" ? 0.85 : 0.55} />
        {puff > 0.2 && [-1, 1].map((sd) => <circle key={sd} cx={sd * 46} cy={30} r={18 * puff} fill="#ffd0e0" opacity={0.6} />)}
        {eye(-1)}
        {eye(1)}
        {mouthShape}
        {mood === "windup" && <path d="M -6 18 l 0 -4 M 6 18 l 0 -4" stroke="#3a2a5a" strokeWidth={3} strokeLinecap="round" />}
      </g>
    </g>
  );
};

// where Nimbus's mouth is on screen
export const nimbusMouth = (x: number, y: number, scale: number, float = 120) => ({ x, y: y + (-float + 36) * scale });

// ---------- wind ----------
// A sudden sneeze gust: swirling streaks bursting from a point in a direction (dir: 1 right, -1 left). age 0..1
export const SneezeGust: React.FC<{ x: number; y: number; scale: number; age: number; dir?: number }> = ({ x, y, scale, age, dir = 1 }) => {
  if (age <= 0 || age >= 1) return null;
  const reach = 1100 * scale * Math.pow(age, 0.6);
  return (
    <g opacity={1 - age * age}>
      <ellipse cx={x + dir * reach * 0.25} cy={y} rx={reach * 0.4} ry={reach * 0.22} fill="url(#windGlow)" opacity={0.5} />
      {Array.from({ length: 12 }, (_, i) => {
        const off = (i - 5.5) * 30 * scale * (0.6 + age);
        const len = reach * (0.5 + random(`gl${i}`) * 0.5);
        const x0 = x + dir * len * 0.15;
        const yy = y + off;
        return <path key={i} d={`M ${x0} ${yy} q ${dir * len * 0.4} ${-30 * scale} ${dir * len * 0.8} ${off * 0.3} t ${dir * len * 0.2} ${10 * scale}`} stroke="#ffffff" strokeWidth={(5 + (i % 3) * 3) * scale + 2} strokeLinecap="round" fill="none" opacity={0.85} />;
      })}
      {Array.from({ length: 4 }, (_, i) => (
        <path key={`s${i}`} d={`M ${x + dir * reach * (0.3 + i * 0.15)} ${y - 40 * scale} a ${30 * scale} ${30 * scale} 0 1 ${dir > 0 ? 1 : 0} ${dir * 10} ${50 * scale}`} stroke="#e8f4ff" strokeWidth={5 * scale + 2} fill="none" strokeLinecap="round" />
      ))}
    </g>
  );
};

// A steady, controlled ribbon of wind from one point to another; on 0..1
export const WindRibbon: React.FC<{ from: { x: number; y: number }; to: { x: number; y: number }; on: number; g: number; width?: number; bend?: number }> = ({ from, to, on, g, width = 70, bend = 0 }) => {
  if (on <= 0) return null;
  const mx = (from.x + to.x) / 2 + bend;
  const my = (from.y + to.y) / 2;
  const pt = (k: number) => ({ x: (1 - k) * (1 - k) * from.x + 2 * (1 - k) * k * mx + k * k * to.x, y: (1 - k) * (1 - k) * from.y + 2 * (1 - k) * k * my + k * k * to.y });
  const d = `M ${from.x} ${from.y} Q ${mx} ${my} ${to.x} ${to.y}`;
  return (
    <g opacity={on}>
      <path d={d} stroke="#cfe8ff" strokeWidth={width} strokeLinecap="round" fill="none" opacity={0.28} />
      <path d={d} stroke="#ffffff" strokeWidth={width * 0.35} strokeLinecap="round" fill="none" opacity={0.5} />
      {Array.from({ length: 14 }, (_, i) => {
        const k = (i / 14 + g * 0.045) % 1;
        const p = pt(k);
        return <path key={i} d={`M ${p.x - 18} ${p.y + Math.sin(i * 2 + g / 3) * width * 0.3} q 18 -14 36 0`} stroke="#ffffff" strokeWidth={5} strokeLinecap="round" fill="none" />;
      })}
      {Array.from({ length: 6 }, (_, i) => {
        const p = pt((i / 6 + g * 0.03) % 1);
        return <Sparkle key={`k${i}`} x={p.x} y={p.y + Math.cos(i * 3 + g / 4) * width * 0.4} size={12} color="#ffffff" rotate={g * 5} />;
      })}
    </g>
  );
};

// Little wind swirl marks around a spinning character
export const SpinLines: React.FC<{ x: number; y: number; scale: number; on: number; g: number }> = ({ x, y, scale, on, g }) => {
  if (on <= 0) return null;
  return (
    <g opacity={on} stroke="#ffffff" strokeWidth={6 * scale + 2} strokeLinecap="round" fill="none">
      {[0, 1, 2].map((i) => {
        const a = g * 0.6 + i * 2.1;
        return <path key={i} d={`M ${x + Math.cos(a) * 170 * scale} ${y + Math.sin(a) * 60 * scale} A ${170 * scale} ${60 * scale} 0 0 1 ${x + Math.cos(a + 1.2) * 170 * scale} ${y + Math.sin(a + 1.2) * 60 * scale}`} />;
      })}
    </g>
  );
};

// ---------- the cloud sandwich: a fluffy cloud layer drawn over Bobo's body, another squashed on his head ----------
export const CloudLayer: React.FC<{ x: number; y: number; w: number; h: number; seed?: number; squash?: number }> = ({ x, y, w, h, seed = 1, squash = 1 }) => (
  <g transform={`translate(${x} ${y}) scale(1 ${squash})`}>
    <path d={fluffy(w, h, 11, h * 0.45)} fill="#ffffff" stroke="#d8e4f8" strokeWidth={3} />
    <path d={fluffy(w * 0.6, h * 0.5, 8, h * 0.3)} transform={`translate(${-w * 0.2} ${-h * 0.25})`} fill="#ffffff" opacity={0.9} />
    {Array.from({ length: 3 }, (_, i) => (
      <ellipse key={i} cx={(random(`cl${seed}${i}`) - 0.5) * w} cy={-h * 0.2} rx={w * 0.12} ry={h * 0.12} fill="#eef4ff" />
    ))}
  </g>
);

// ---------- the fruit basket Bobo lands in. Draw BasketBack before Bobo and BasketFront after him ----------
const FRUIT = [
  { c: "#ffb0d0", dx: -120, dy: -150, r: 42 },
  { c: "#b0e8ff", dx: -50, dy: -175, r: 46 },
  { c: "#ffe08a", dx: 40, dy: -170, r: 44 },
  { c: "#c8b0ff", dx: 120, dy: -150, r: 40 },
  { c: "#b8ffc8", dx: -10, dy: -205, r: 38 },
];
const CloudFruit: React.FC<{ x: number; y: number; r: number; c: string; rot?: number }> = ({ x, y, r, c, rot = 0 }) => (
  <g transform={`translate(${x} ${y}) rotate(${rot})`}>
    <path d={fluffy(r, r * 0.85, 7, r * 0.3)} fill={c} stroke="#ffffff" strokeWidth={4} />
    <ellipse cx={-r * 0.3} cy={-r * 0.3} rx={r * 0.25} ry={r * 0.16} fill="#ffffff" opacity={0.7} />
    <path d={`M 0 ${-r * 1.05} q 10 -16 24 -12`} stroke="#5fae4a" strokeWidth={6} strokeLinecap="round" fill="none" />
  </g>
);
export const BasketBack: React.FC<{ x: number; y: number; scale: number; g: number; bounce?: number }> = ({ x, y, scale, g, bounce = 0 }) => (
  <g transform={`translate(${x} ${y}) scale(${scale})`}>
    <ellipse cx={0} cy={6} rx={220} ry={26} fill="url(#shadow)" />
    <ellipse cx={0} cy={-150} rx={200} ry={44} fill="#8a5a2a" />
    {FRUIT.map((f, i) => (
      <CloudFruit key={i} x={f.dx + Math.sin(i * 2) * bounce * 30} y={f.dy - Math.abs(Math.sin(g / 3 + i)) * bounce * 90} r={f.r} c={f.c} rot={bounce * Math.sin(g + i) * 30} />
    ))}
  </g>
);
export const BasketFront: React.FC<{ x: number; y: number; scale: number }> = ({ x, y, scale }) => (
  <g transform={`translate(${x} ${y}) scale(${scale})`}>
    <path d="M -205 -150 Q -190 0 -150 0 L 150 0 Q 190 0 205 -150 Q 0 -110 -205 -150 Z" fill="url(#basketWeave)" stroke="#8a5a2a" strokeWidth={5} strokeLinejoin="round" />
    {[-110, -45, 20, 85].map((dy, i) => (
      <path key={i} d={`M ${-195 + i * 6} ${-120 + i * 30} Q 0 ${-90 + i * 30} ${195 - i * 6} ${-120 + i * 30}`} stroke="#9a6a32" strokeWidth={5} fill="none" opacity={0.6} />
    ))}
    {Array.from({ length: 9 }, (_, i) => (
      <path key={`v${i}`} d={`M ${-160 + i * 40} -128 L ${-140 + i * 36} -4`} stroke="#9a6a32" strokeWidth={4} opacity={0.45} />
    ))}
    <path d="M -205 -150 Q 0 -110 205 -150" stroke="#c88a48" strokeWidth={14} fill="none" strokeLinecap="round" />
  </g>
);

// ---------- a cloud shaped like a banana ----------
export const BananaCloud: React.FC<{ x: number; y: number; scale: number; rot?: number; g: number; bite?: number }> = ({ x, y, scale, rot = 0, g }) => (
  <g transform={`translate(${x} ${y + Math.sin(g / 7) * 6 * scale}) scale(${scale}) rotate(${rot})`}>
    <circle r={110} fill="url(#windGlow)" opacity={0.35} />
    {[-70, -40, -8, 26, 58].map((dx, i) => (
      <circle key={i} cx={dx} cy={Math.pow((dx + 6) / 70, 2) * -36 + 10} r={26 - Math.abs(i - 2) * 3} fill="url(#bananaCloud)" stroke="#f2d860" strokeWidth={3} />
    ))}
    <path d="M -96 -10 l -10 -14 l 16 2 Z" fill="#b89a3a" />
    <ellipse cx={-30} cy={-6} rx={22} ry={7} fill="#ffffff" opacity={0.7} />
  </g>
);

// ---------- Draco's smoke ring, floating up and settling on his head like a little halo; age 0..1 ----------
export const SmokeRing: React.FC<{ from: { x: number; y: number }; head: { x: number; y: number }; scale: number; age: number; g: number }> = ({ from, head, scale, age, g }) => {
  if (age <= 0) return null;
  const rise = Math.min(1, age / 0.6);
  const settle = Math.max(0, (age - 0.6) / 0.4);
  const px = from.x + (head.x - from.x) * rise + Math.sin(age * 12) * 20 * scale * (1 - settle);
  const py = from.y + (head.y - 120 * scale - from.y) * rise + settle * 60 * scale;
  return (
    <g opacity={Math.min(1, age * 5)}>
      <ellipse cx={px} cy={py} rx={(30 + rise * 30) * scale} ry={(12 + rise * 8) * scale} fill="none" stroke="#a8a4b8" strokeWidth={12 * scale + 2} opacity={0.85} />
      <ellipse cx={px} cy={py - 3 * scale} rx={(30 + rise * 30) * scale} ry={(12 + rise * 8) * scale} fill="none" stroke="#d8d4e4" strokeWidth={4 * scale + 1} />
      {settle > 0.9 && <Sparkle x={px + 50 * scale} y={py - 10 * scale} size={14 * scale + 4} color="#ffffff" rotate={g * 5} />}
    </g>
  );
};

// A big leaf Kiko fans the wind with
export const LeafFan: React.FC<{ x: number; y: number; scale: number; rot: number }> = ({ x, y, scale, rot }) => (
  <g transform={`translate(${x} ${y}) scale(${scale}) rotate(${rot})`}>
    <path d="M 0 0 L 0 -40" stroke="#4a8a3a" strokeWidth={8} strokeLinecap="round" />
    <path d="M 0 -30 C -70 -60 -70 -170 0 -210 C 70 -170 70 -60 0 -30 Z" fill="#5fc04a" stroke="#2f8a2f" strokeWidth={5} strokeLinejoin="round" />
    <path d="M 0 -36 L 0 -200 M 0 -80 L -36 -110 M 0 -80 L 36 -110 M 0 -130 L -30 -156 M 0 -130 L 30 -156" stroke="#2f8a2f" strokeWidth={4} strokeLinecap="round" />
  </g>
);

// Bobo's floating banana (a pastel sky banana) with a little glint
export const SkyBanana: React.FC<{ x: number; y: number; scale: number; rot: number; g: number }> = ({ x, y, scale, rot, g }) => (
  <g transform={`translate(${x} ${y}) scale(${scale}) rotate(${rot})`}>
    <path d="M -50 -30 C -40 30 10 52 56 30 C 60 26 58 18 52 18 C 12 30 -20 10 -32 -32 Z" fill="#ffe24a" stroke="#c89a10" strokeWidth={4} strokeLinejoin="round" />
    <path d="M -50 -30 l -6 -12 l 14 2 Z" fill="#6a4a10" />
    <path d="M -34 -14 C -26 14 0 30 34 26" stroke="#fff8c8" strokeWidth={5} strokeLinecap="round" fill="none" />
    <Sparkle x={36} y={-8} size={12 + 6 * Math.sin(g / 3)} color="#ffffff" rotate={g * 4} />
  </g>
);

// Shiver lines next to a nervous character
export const Shiver: React.FC<{ x: number; y: number; scale: number; on: number; g: number }> = ({ x, y, scale, on, g }) => {
  if (on <= 0) return null;
  return (
    <g opacity={on} stroke="#7a8ab8" strokeWidth={5 * scale + 1.5} strokeLinecap="round" fill="none">
      {[-1, 1].map((sd) => (
        <g key={sd} transform={`translate(${x + sd * (150 + Math.sin(g * 2.6) * 6) * scale} ${y})`}>
          <path d={`M 0 ${-40 * scale} l ${sd * 14 * scale} ${12 * scale} l ${-sd * 14 * scale} ${12 * scale} l ${sd * 14 * scale} ${12 * scale}`} />
        </g>
      ))}
    </g>
  );
};
