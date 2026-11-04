import React from "react";
import { random } from "remotion";
import { Sparkle } from "../story/scenery";

// Episode 6 characters and props in the series' 2D style, drawn over the 3D sea.

export const Ep6Defs: React.FC<{ lit?: number }> = ({ lit = 1 }) => {
  // Sea light on the 2D characters: a gentle aqua tint, brighter when the kingdom has its colors
  const k = Math.max(0.6, Math.min(1.15, lit));
  return (
    <>
      <filter id="seaLit" colorInterpolationFilters="sRGB" x="-20%" y="-20%" width="140%" height="140%">
        <feColorMatrix type="matrix" values={`${0.84 * k} 0 0 0 0.01  0 ${0.95 * k} 0 0 0.035  0 0 ${1.0 * k} 0 0.07  0 0 0 1 0`} />
      </filter>
      <linearGradient id="coralieTail" x1="0" y1="0" x2="0.3" y2="1">
        <stop offset="0%" stopColor="#3fe0d0" />
        <stop offset="55%" stopColor="#1fb8c8" />
        <stop offset="100%" stopColor="#5fd8f0" />
      </linearGradient>
      <linearGradient id="coralieFin" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#4fd8d8" />
        <stop offset="100%" stopColor="#b8fff4" stopOpacity="0.9" />
      </linearGradient>
      <linearGradient id="coralieTop" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#7ff0e4" />
        <stop offset="100%" stopColor="#26b4c6" />
      </linearGradient>
      <radialGradient id="coralieHair" cx="40%" cy="20%" r="85%">
        <stop offset="0%" stopColor="#4aa8ff" />
        <stop offset="60%" stopColor="#2a6ae0" />
        <stop offset="100%" stopColor="#1c46b0" />
      </radialGradient>
      <radialGradient id="coralieIris" cx="45%" cy="40%" r="60%">
        <stop offset="0%" stopColor="#5ff0f0" />
        <stop offset="100%" stopColor="#0e6a9e" />
      </radialGradient>
      <radialGradient id="coralieAura" cx="50%" cy="50%" r="50%">
        <stop offset="0%" stopColor="#bff8ff" stopOpacity="0.55" />
        <stop offset="60%" stopColor="#7fe8ff" stopOpacity="0.18" />
        <stop offset="100%" stopColor="#7fe8ff" stopOpacity="0" />
      </radialGradient>
      <radialGradient id="airBubble" cx="50%" cy="50%" r="50%">
        <stop offset="0%" stopColor="#ffffff" stopOpacity="0" />
        <stop offset="72%" stopColor="#bff6ff" stopOpacity="0.05" />
        <stop offset="92%" stopColor="#9fe8ff" stopOpacity="0.2" />
        <stop offset="100%" stopColor="#eaffff" stopOpacity="0.5" />
      </radialGradient>
      <linearGradient id="mapSea" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#1a5fa8" />
        <stop offset="100%" stopColor="#0a2f66" />
      </linearGradient>
      <radialGradient id="pendantBlue" cx="50%" cy="50%" r="50%">
        <stop offset="0%" stopColor="#ffffff" stopOpacity="1" />
        <stop offset="30%" stopColor="#9fe8ff" stopOpacity="0.75" />
        <stop offset="100%" stopColor="#4fb8ff" stopOpacity="0" />
      </radialGradient>
      <radialGradient id="shellGlow" cx="50%" cy="50%" r="50%">
        <stop offset="0%" stopColor="#fff4fa" stopOpacity="1" />
        <stop offset="40%" stopColor="#ffc8e8" stopOpacity="0.5" />
        <stop offset="100%" stopColor="#ffc8e8" stopOpacity="0" />
      </radialGradient>
      <linearGradient id="blueBeam" x1="0" y1="0" x2="1" y2="0">
        <stop offset="0%" stopColor="#bff4ff" stopOpacity="0.9" />
        <stop offset="100%" stopColor="#5fc8ff" stopOpacity="0.45" />
      </linearGradient>
    </>
  );
};

type P = { x: number; y: number };
const smooth = (pts: P[], closed = true) => {
  const m = (a: P, b: P) => ({ x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 });
  const f = (n: number) => n.toFixed(1);
  const n = pts.length;
  const start = closed ? m(pts[n - 1], pts[0]) : pts[0];
  let d = `M ${f(start.x)} ${f(start.y)}`;
  for (let i = closed ? 0 : 1; i < (closed ? n : n - 1); i++) {
    const nx = m(pts[i], pts[(i + 1) % n]);
    d += ` Q ${f(pts[i].x)} ${f(pts[i].y)} ${f(nx.x)} ${f(nx.y)}`;
  }
  if (!closed) d += ` L ${f(pts[n - 1].x)} ${f(pts[n - 1].y)}`;
  return d + (closed ? " Z" : "");
};

// A tapered ribbon along a cubic curve: for the tail and the flowing locks of hair
const ribbon = (p0: P, p1: P, p2: P, p3: P, w0: number, w1: number, n = 16) => {
  const at = (u: number) => {
    const a = (1 - u) ** 3, b = 3 * (1 - u) ** 2 * u, c = 3 * (1 - u) * u * u, d = u ** 3;
    return { x: a * p0.x + b * p1.x + c * p2.x + d * p3.x, y: a * p0.y + b * p1.y + c * p2.y + d * p3.y };
  };
  const tan = (u: number) => {
    const a = -3 * (1 - u) ** 2, b = 3 * (1 - u) ** 2 - 6 * (1 - u) * u, c = 6 * (1 - u) * u - 3 * u * u, d = 3 * u * u;
    const x = a * p0.x + b * p1.x + c * p2.x + d * p3.x;
    const y = a * p0.y + b * p1.y + c * p2.y + d * p3.y;
    const l = Math.hypot(x, y) || 1;
    return { x: x / l, y: y / l };
  };
  const left: P[] = [];
  const right: P[] = [];
  for (let i = 0; i <= n; i++) {
    const u = i / n;
    const c = at(u);
    const t = tan(u);
    const w = w0 + (w1 - w0) * Math.pow(u, 0.9);
    left.push({ x: c.x - t.y * w, y: c.y + t.x * w });
    right.push({ x: c.x + t.y * w, y: c.y - t.x * w });
  }
  return { path: smooth([...left, ...right.reverse()]), at, tan };
};

export type CoralieMood = "happy" | "joy" | "worried" | "surprised" | "excited" | "neutral";

const CMouth: React.FC<{ m: number; mood: CoralieMood }> = ({ m, mood }) => {
  if (m > 0.06 || mood === "excited") {
    const open = Math.max(m, mood === "excited" ? 0.45 : 0);
    const rx = 12 + open * 6;
    const ry = 4 + open * 15;
    return (
      <g>
        <path d={`M ${-rx} 0 Q 0 ${-ry * 0.35} ${rx} 0 Q ${rx * 0.8} ${ry * 1.6} 0 ${ry * 1.7} Q ${-rx * 0.8} ${ry * 1.6} ${-rx} 0 Z`} fill="#86303d" />
        <ellipse cx={0} cy={ry * 1.25} rx={rx * 0.55} ry={ry * 0.4} fill="#e8737f" />
      </g>
    );
  }
  if (mood === "surprised") return <ellipse cx={0} cy={6} rx={8} ry={10} fill="#86303d" />;
  if (mood === "worried") return <path d="M -13 8 Q 0 -2 13 8" stroke="#86303d" strokeWidth={5.5} strokeLinecap="round" fill="none" />;
  if (mood === "happy" || mood === "joy") return <path d="M -20 0 Q 0 24 20 0 Z" fill="#86303d" stroke="#86303d" strokeWidth={4} strokeLinejoin="round" />;
  return <path d="M -15 0 Q 0 13 15 0" stroke="#86303d" strokeWidth={5.5} strokeLinecap="round" fill="none" />;
};

// Coralie, the little mermaid who guards the Underwater Kingdom.
// Drawn facing forward with (0, 0) at the tip of her tail fin; about 590 units tall at scale 1.
export const Coralie: React.FC<{
  x: number;
  y: number;
  scale?: number;
  g: number;
  look?: { x: number; y: number };
  mood?: CoralieMood;
  mouth?: number;
  blink?: number;
  armL?: number; // like Lumi: positive raises the left arm
  armR?: number; // negative raises the right arm
  tilt?: number;
  headTilt?: number;
  swim?: number; // how hard the tail is swishing, 0..1.5
  appear?: number; // 0..1
}> = ({ x, y, scale = 1, g, look = { x: 0, y: 0 }, mood = "happy", mouth = 0, blink = 1, armL = 12, armR = -12, tilt = 0, headTilt = 0, swim = 0.5, appear = 1 }) => {
  const talking = mouth > 0.06;
  const worried = mood === "worried";
  const big = mood === "surprised" || mood === "excited" ? 1.1 : 1;
  const c = Math.sin(g / 9) * 14 * swim + Math.sin(g / 23) * 5;
  const tail = ribbon({ x: 0, y: -250 }, { x: 6 + c * 0.2, y: -190 }, { x: -30 + c * 0.8, y: -130 }, { x: 12 + c * 1.3, y: -74 }, 60, 13, 18);
  const tipT = tail.tan(1);
  const tip = tail.at(1);
  const finAng = (Math.atan2(tipT.y, tipT.x) * 180) / Math.PI - 90 + Math.sin(g / 9 + 1.2) * 12 * swim;
  const hairW = (k: number) => Math.sin(g / 13 + k) * 16;
  const lock = (side: -1 | 1, len: number, k: number, w: number) =>
    ribbon(
      { x: side * 96, y: -470 },
      { x: side * (138 + hairW(k) * 0.3), y: -400 },
      { x: side * (118 - hairW(k + 1)), y: -330 + len * 0.3 },
      { x: side * (132 + hairW(k + 2) * 1.4), y: -300 + len },
      w,
      6,
      14,
    ).path;
  const eye = (side: -1 | 1) => {
    const cx = side * 44;
    if (mood === "joy" && !talking && blink > 0.5) return <path key={side} d={`M ${cx - 22} 20 Q ${cx} -6 ${cx + 22} 20`} stroke="#123a6e" strokeWidth={8} strokeLinecap="round" fill="none" />;
    return (
      <g key={side} transform={`translate(${cx} 14) scale(${big} ${big * blink})`}>
        <ellipse rx={28} ry={34} fill="#fff" />
        <g transform={`translate(${look.x * 7} ${look.y * 9})`}>
          <circle r={22} fill="url(#coralieIris)" />
          <circle r={11} fill="#0b2a4a" />
          <circle cx={-8} cy={-9} r={7.5} fill="#fff" />
          <circle cx={7} cy={8} r={3.5} fill="#fff" opacity={0.9} />
        </g>
        <path d={`M ${22 * side} -24 L ${34 * side} -35 M ${28 * side} -14 L ${41 * side} -21 M ${12 * side} -31 L ${19 * side} -43`} stroke="#123a6e" strokeWidth={4.5} fill="none" strokeLinecap="round" />
      </g>
    );
  };
  const brow = (side: -1 | 1) => {
    const by = mood === "surprised" || mood === "excited" ? -50 : -42;
    const tiltB = worried ? side * -16 : 0;
    return <path key={side} d={`M ${side * 44 - 17} ${by} Q ${side * 44} ${by - 8} ${side * 44 + 17} ${by}`} transform={`rotate(${tiltB} ${side * 44} ${by})`} stroke="#2a5ec8" strokeWidth={6} strokeLinecap="round" fill="none" />;
  };
  const arm = (side: -1 | 1, angle: number) => (
    <g transform={`translate(${side * 52} -338) rotate(${angle})`}>
      <rect x={-15} y={-6} width={30} height={98} rx={15} fill="url(#skin)" />
      <rect x={-15} y={70} width={30} height={9} rx={4} fill="#fff1f6" opacity={0.95} />
      <circle cx={-7} cy={74} r={4} fill="#ffb8cf" />
      <circle cx={0} cy={104} r={17} fill="url(#skin)" />
    </g>
  );
  // scales on the tail: little U-shaped arcs in rows
  const scales: React.ReactNode[] = [];
  for (let r = 0; r < 10; r++) {
    const u = 0.06 + r * 0.085;
    const p = tail.at(u);
    const t = tail.tan(u);
    const w = 60 + (13 - 60) * Math.pow(u, 0.9);
    const across = u < 0.35 ? 3 : u < 0.7 ? 2 : 1;
    for (let i = 0; i < across; i++) {
      const o = across === 1 ? 0 : (i / (across - 1) - 0.5) * 1.1 + (r % 2 ? 0.12 : -0.12) * (across > 1 ? 1 : 0);
      const cx = p.x - t.y * w * o;
      const cy = p.y + t.x * w * o;
      const s = Math.min(16, w * 0.36);
      scales.push(
        <path
          key={`${r}-${i}`}
          d={`M ${cx + t.y * s} ${cy - t.x * s} Q ${cx + t.x * s * 1.3} ${cy + t.y * s * 1.3} ${cx - t.y * s} ${cy + t.x * s}`}
          stroke="#b8fff4"
          strokeWidth={3}
          fill="none"
          opacity={0.6}
          strokeLinecap="round"
        />,
      );
    }
  }
  const s = scale * (0.3 + 0.7 * appear);
  return (
    <g transform={`translate(${x} ${y}) scale(${s}) rotate(${tilt})`} opacity={Math.min(1, appear * 1.6)}>
      <ellipse cx={0} cy={-330} rx={260} ry={330} fill="url(#coralieAura)" opacity={0.7 + Math.sin(g / 8) * 0.1} />
      {/* long ocean-blue hair flowing behind */}
      <g transform={`rotate(${headTilt * 0.5} 0 -455)`}>
        <ellipse cx={0} cy={-462} rx={132} ry={128} fill="url(#coralieHair)" />
        <path d={lock(-1, 90, 0, 46)} fill="url(#coralieHair)" />
        <path d={lock(1, 90, 2, 46)} fill="url(#coralieHair)" />
        <path d={lock(-1, 30, 4, 34)} fill="#2a6ae0" />
        <path d={lock(1, 30, 6, 34)} fill="#2a6ae0" />
      </g>
      {/* the tail and its fin */}
      <g transform={`translate(${tip.x} ${tip.y}) rotate(${finAng})`}>
        <path d="M 0 -8 C -24 8 -66 26 -92 62 C -64 56 -38 52 -14 60 C -8 44 -2 34 0 28 C 2 34 8 44 14 60 C 38 52 64 56 92 62 C 66 26 24 8 0 -8 Z" fill="url(#coralieFin)" stroke="#2ab3c4" strokeWidth={3} strokeLinejoin="round" />
        {[-1, 1].map((sd) => (
          <path key={sd} d={`M 0 4 Q ${sd * 30} 24 ${sd * 62} 50 M 0 8 Q ${sd * 20} 30 ${sd * 34} 52`} stroke="#e8fffb" strokeWidth={3} fill="none" opacity={0.7} strokeLinecap="round" />
        ))}
      </g>
      <path d={tail.path} fill="url(#coralieTail)" stroke="#1a9aa8" strokeWidth={3} />
      {scales}
      <path d={`M -40 -236 Q -36 -170 -22 -120`} stroke="#ffffff" strokeWidth={9} strokeLinecap="round" fill="none" opacity={0.25} />
      {/* arms, body and her sea-green top */}
      {arm(-1, armL)}
      {arm(1, armR)}
      <path d="M -48 -352 Q -58 -300 -60 -250 L 60 -250 Q 58 -300 48 -352 Q 0 -364 -48 -352 Z" fill="url(#skin)" />
      <path d="M -50 -350 Q -58 -322 -57 -298 Q -47 -284 -38 -298 Q -28 -284 -19 -298 Q -9 -284 0 -298 Q 9 -284 19 -298 Q 28 -284 38 -298 Q 47 -284 57 -298 Q 58 -322 50 -350 Q 0 -366 -50 -350 Z" fill="url(#coralieTop)" stroke="#1fa0b4" strokeWidth={2.5} />
      <path d="M -30 -344 Q 0 -354 30 -344" stroke="#d8fffb" strokeWidth={5} fill="none" strokeLinecap="round" opacity={0.7} />
      {/* a belt of tiny pearls where the tail begins */}
      {Array.from({ length: 9 }, (_, i) => (
        <g key={i}>
          <circle cx={-56 + i * 14} cy={-250 + Math.abs(i - 4) * 0.6} r={7.5} fill="#fff6f8" stroke="#f0c8d8" strokeWidth={1.5} />
          <circle cx={-58 + i * 14} cy={-252 + Math.abs(i - 4) * 0.6} r={2.4} fill="#fff" />
        </g>
      ))}
      <rect x={-12} y={-372} width={24} height={26} rx={10} fill="#f2c4a6" />
      {/* head */}
      <g transform={`translate(0 -455) rotate(${headTilt})`}>
        {/* little fin-shaped ears */}
        {[-1, 1].map((sd) => (
          <g key={sd} transform={`translate(${sd * 104} 22) scale(${sd} 1) rotate(${Math.sin(g / 11 + sd) * 4})`}>
            <path d="M 0 -24 Q 36 -34 50 -6 Q 32 -2 40 22 Q 16 14 0 22 Z" fill="#6fe6e0" stroke="#26b4c6" strokeWidth={3} strokeLinejoin="round" />
            <path d="M 4 -10 L 34 -10 M 4 4 L 30 10" stroke="#d8fffb" strokeWidth={2.5} strokeLinecap="round" opacity={0.8} />
          </g>
        ))}
        <ellipse cx={0} cy={8} rx={108} ry={104} fill="url(#skin)" />
        <ellipse cx={-70} cy={56} rx={20} ry={11} fill="#ff97a6" opacity={worried ? 0.35 : 0.6} />
        <ellipse cx={70} cy={56} rx={20} ry={11} fill="#ff97a6" opacity={worried ? 0.35 : 0.6} />
        {eye(-1)}
        {eye(1)}
        {brow(-1)}
        {brow(1)}
        <ellipse cx={0} cy={48} rx={7} ry={5} fill="#e9a283" />
        <g transform="translate(0 72)">
          <CMouth m={mouth} mood={mood} />
        </g>
        {/* wavy bangs and two strands framing her face */}
        <path d="M -118 8 Q -128 -104 -30 -128 Q 72 -148 122 -46 Q 128 -16 118 12 Q 100 -40 70 -54 Q 52 -20 18 -50 Q -4 -18 -34 -52 Q -62 -22 -84 -50 Q -102 -18 -118 8 Z" fill="url(#coralieHair)" />
        <path d="M -64 -104 Q -6 -126 56 -108" stroke="#7fc8ff" strokeWidth={8} strokeLinecap="round" fill="none" opacity={0.7} />
        {[-1, 1].map((sd) => (
          <path key={sd} d={`M ${sd * 100} -20 Q ${sd * (122 + hairW(sd) * 0.3)} 50 ${sd * (106 + hairW(sd + 3) * 0.4)} 128 Q ${sd * 98} 70 ${sd * 86} -10 Z`} fill="#2a6ae0" />
        ))}
        {/* her little sparkling seashell clip */}
        <g transform="translate(-80 -88) rotate(-22)">
          <path d="M 0 18 L -26 -6 Q -28 -26 -12 -32 Q 0 -37 12 -32 Q 28 -26 26 -6 Z" fill="#ffc2d6" stroke="#ff7fa8" strokeWidth={3} strokeLinejoin="round" />
          {[-18, -9, 0, 9, 18].map((dx) => (
            <path key={dx} d={`M 0 16 L ${dx} -28`} stroke="#ff8fb4" strokeWidth={2.5} strokeLinecap="round" />
          ))}
          <rect x={-8} y={14} width={16} height={9} rx={3} fill="#ffb0c8" stroke="#ff7fa8" strokeWidth={2} />
          <circle cx={20} cy={14} r={6} fill="#fff8fb" stroke="#f0c8d8" strokeWidth={1.5} />
        </g>
        <Sparkle x={-46} y={-122} size={12 + 9 * Math.max(0, Math.sin(g / 7))} color="#ffffff" rotate={g * 3} opacity={0.9} />
      </g>
    </g>
  );
};

// Where Coralie's right hand is (side 1) or her left hand (side -1), for things she holds
export const coralieHand = (x: number, y: number, scale: number, angle: number, side: -1 | 1 = 1) => {
  const a = (angle * Math.PI) / 180;
  return { x: x + (side * 52 - 104 * Math.sin(a)) * scale, y: y + (-338 + 104 * Math.cos(a)) * scale };
};

// A magical air bubble around a character. Sizes are in the character's own units (feet at 0, 0).
export const BUBBLE_FIT = {
  lumi: { cy: -300, rx: 212, ry: 318 },
  bobo: { cy: -248, rx: 198, ry: 268 },
  draco: { cy: -212, rx: 202, ry: 246 },
};
export const AirBubble: React.FC<{ x: number; y: number; scale: number; g: number; fit: { cy: number; rx: number; ry: number }; ph?: number; opacity?: number; grow?: number }> = ({
  x,
  y,
  scale,
  g,
  fit,
  ph = 0,
  opacity = 1,
  grow = 1,
}) => {
  if (opacity <= 0 || grow <= 0) return null;
  const w = Math.sin(g / 7 + ph) * 0.025;
  const rx = fit.rx * (1 + w) * grow;
  const ry = fit.ry * (1 - w) * grow;
  return (
    <g transform={`translate(${x} ${y}) scale(${scale})`} opacity={opacity}>
      <g transform={`translate(0 ${fit.cy})`}>
        <ellipse rx={rx} ry={ry} fill="url(#airBubble)" stroke="#eaffff" strokeWidth={4} strokeOpacity={0.55} />
        <path d={`M ${-rx * 0.86} ${-ry * 0.3} A ${rx * 0.92} ${ry * 0.92} 0 0 1 ${-rx * 0.1} ${-ry * 0.91}`} stroke="#ffb0e8" strokeWidth={7} fill="none" opacity={0.35} strokeLinecap="round" />
        <path d={`M ${rx * 0.88} ${ry * 0.2} A ${rx * 0.92} ${ry * 0.92} 0 0 1 ${rx * 0.2} ${ry * 0.88}`} stroke="#7fe8ff" strokeWidth={7} fill="none" opacity={0.4} strokeLinecap="round" />
        <ellipse cx={-rx * 0.48} cy={-ry * 0.6} rx={rx * 0.2} ry={ry * 0.07} transform={`rotate(-38 ${-rx * 0.48} ${-ry * 0.6})`} fill="#fff" opacity={0.7} />
        <circle cx={-rx * 0.66} cy={-ry * 0.36} r={rx * 0.04} fill="#fff" opacity={0.7} />
      </g>
    </g>
  );
};

// A bubble bursting into little droplets; age 0..1
export const BubblePop: React.FC<{ x: number; y: number; r: number; age: number }> = ({ x, y, r, age }) => {
  if (age <= 0 || age >= 1) return null;
  return (
    <g opacity={1 - age}>
      <circle cx={x} cy={y} r={r * (1 + age * 0.35)} fill="none" stroke="#eaffff" strokeWidth={6 * (1 - age)} strokeDasharray="20 26" />
      {Array.from({ length: 14 }, (_, i) => {
        const a = (i / 14) * Math.PI * 2;
        const d = r * (1 + age * 0.6);
        return <circle key={i} cx={x + Math.cos(a) * d} cy={y + Math.sin(a) * d} r={7 + (i % 3) * 3} fill="none" stroke="#dffaff" strokeWidth={3} />;
      })}
    </g>
  );
};

// ---------- the glowing underwater map the pendant shows; origin at its center ----------
export const SeaMap: React.FC<{ x: number; y: number; s?: number; g: number; reveal: number }> = ({ x, y, s = 1, g, reveal }) => {
  const W = 620;
  const H = 400;
  const tower = (tx: number, w: number, h: number, i: number, dome: string) => (
    <g key={i}>
      <rect x={tx - w / 2} y={70 - h} width={w} height={h} rx={w * 0.25} fill="#ff9fb4" stroke="#ffe0e8" strokeWidth={3} />
      <path d={`M ${tx - w * 0.62} ${70 - h} Q ${tx - w * 0.75} ${70 - h - w * 0.8} ${tx} ${70 - h - w * 1.35} Q ${tx + w * 0.75} ${70 - h - w * 0.8} ${tx + w * 0.62} ${70 - h} Z`} fill={dome} stroke="#e8ffff" strokeWidth={3} />
      <circle cx={tx} cy={70 - h - w * 1.42} r={5} fill="#fff6f8" />
      <rect x={tx - 6} y={70 - h + 22} width={12} height={18} rx={6} fill="#fff1b0" opacity={0.7 + 0.3 * Math.sin(g / 9 + i)} />
    </g>
  );
  const fish = (fx: number, fy: number, c: string, k: number) => (
    <g key={k} transform={`translate(${fx + Math.sin(g / 12 + k) * 14} ${fy}) scale(${k % 2 ? -1 : 1} 1)`}>
      <ellipse rx={16} ry={9} fill={c} />
      <path d="M 14 0 L 28 -9 L 28 9 Z" fill={c} />
      <circle cx={-8} cy={-2} r={2.5} fill="#123a6e" />
    </g>
  );
  return (
    <g transform={`translate(${x} ${y}) scale(${s * (0.4 + 0.6 * reveal)})`} opacity={reveal}>
      <circle r={430} fill="url(#pendantBlue)" opacity={0.3} />
      <rect x={-W / 2} y={-H / 2} width={W} height={H} rx={40} fill="url(#mapSea)" opacity={0.94} stroke="#8ff0ff" strokeWidth={10} />
      <rect x={-W / 2 + 18} y={-H / 2 + 18} width={W - 36} height={H - 36} rx={28} fill="none" stroke="#ffe39a" strokeWidth={3} strokeDasharray="10 12" opacity={0.75} />
      {/* waves at the surface */}
      {[0, 1].map((r) => (
        <path
          key={r}
          d={Array.from({ length: 9 }, (_, i) => `${i ? "Q" : "M"} ${-270 + i * 66 + (i ? -33 : 0)} ${i ? -150 + r * 22 - 14 + Math.sin(g / 8 + i) * 3 : -150 + r * 22} ${i ? -270 + i * 66 : ""} ${i ? -150 + r * 22 : ""}`).join(" ")}
          stroke="#bff4ff"
          strokeWidth={4}
          fill="none"
          opacity={0.75 - r * 0.25}
          strokeLinecap="round"
        />
      ))}
      {/* the moon symbol, like the pendant's */}
      <g transform="translate(-200 -78)">
        <circle r={44} fill="url(#pendantBlue)" opacity={0.7} />
        <path d="M 8 -30 A 30 30 0 1 0 8 30 A 24 24 0 1 1 8 -30 Z" fill="#e8f6ff" stroke="#8fd8ff" strokeWidth={3} />
      </g>
      {Array.from({ length: 10 }, (_, i) => (
        <circle key={i} cx={-250 + random(`smb${i}`) * 500} cy={130 - ((g * 1.5 + random(`smy${i}`) * 260) % 260)} r={4 + (i % 3) * 2} fill="none" stroke="#dffaff" strokeWidth={2} opacity={0.8} />
      ))}
      {fish(-150, 20, "#ffd23f", 0)}
      {fish(190, -60, "#ff9fb4", 1)}
      {fish(-60, -40, "#7fe8ff", 2)}
      {/* the coral castle on the sea floor */}
      <g transform="translate(90 40)">
        <ellipse cx={0} cy={78} rx={230} ry={30} fill="#f2d7a0" opacity={0.85} />
        {tower(-120, 40, 90, 0, "#5ee0d0")}
        {tower(120, 40, 90, 1, "#b9a0ff")}
        {tower(-62, 48, 130, 2, "#ff8fb8")}
        {tower(62, 48, 130, 3, "#5fc8ff")}
        {tower(0, 64, 180, 4, "#7ff0e0")}
        <path d="M -16 70 L -16 40 A 16 16 0 0 1 16 40 L 16 70 Z" fill="#2a5aa8" />
        {[-180, -160, 170, 195].map((cx, i) => (
          <path key={i} d={`M ${cx} 76 Q ${cx - 10 + Math.sin(g / 9 + i) * 6} 40 ${cx + 4} ${10 + (i % 2) * 14}`} stroke={i % 2 ? "#ff7a9a" : "#ffb347"} strokeWidth={9} fill="none" strokeLinecap="round" />
        ))}
      </g>
      <path d="M -250 168 Q -160 120 -90 150 Q -30 176 40 118" stroke="#ffd34f" strokeWidth={6} strokeDasharray="4 14" strokeLinecap="round" fill="none" />
      <Sparkle x={40} y={118} size={16} color="#ffd34f" rotate={g * 3} />
    </g>
  );
};

// ---------- the little glowing seashell Coralie gives Lumi ----------
export const GlowShell: React.FC<{ x: number; y: number; scale?: number; g: number; glow?: number }> = ({ x, y, scale = 1, g, glow = 0.5 }) => (
  <g transform={`translate(${x} ${y}) scale(${scale}) rotate(${Math.sin(g / 10) * 5})`}>
    <circle r={80} fill="url(#shellGlow)" opacity={0.35 + glow * 0.6} />
    <path d="M 0 26 L -38 -6 Q -42 -36 -18 -46 Q 0 -54 18 -46 Q 42 -36 38 -6 Z" fill="#ffe0ec" stroke="#ff8fb4" strokeWidth={4} strokeLinejoin="round" />
    {[-27, -14, 0, 14, 27].map((dx) => (
      <path key={dx} d={`M 0 22 L ${dx} -42`} stroke="#ff9fc0" strokeWidth={3} strokeLinecap="round" />
    ))}
    <rect x={-11} y={20} width={22} height={12} rx={4} fill="#ffc8dc" stroke="#ff8fb4" strokeWidth={3} />
    <ellipse cx={-12} cy={-28} rx={9} ry={5} fill="#fff" opacity={0.7} transform="rotate(-25 -12 -28)" />
  </g>
);

// ---------- the beam joining the pendant and the pearl: blue light wrapped in gold ----------
export const SeaBeam: React.FC<{ from: P; to: P; on: number; g: number }> = ({ from, to, on, g }) => {
  if (on <= 0) return null;
  const dx = to.x - from.x;
  const dy = to.y - from.y;
  const len = Math.hypot(dx, dy);
  const ang = (Math.atan2(dy, dx) * 180) / Math.PI;
  const reach = len * Math.min(1, on * 1.4);
  const w = 40 + Math.sin(g / 2) * 5;
  const strand = (ph: number, amp: number) =>
    Array.from({ length: 25 }, (_, i) => {
      const u = (i / 24) * reach;
      return `${i ? "L" : "M"} ${u.toFixed(1)} ${(Math.sin(u / 38 + g / 3 + ph) * amp * Math.min(1, u / 60)).toFixed(1)}`;
    }).join(" ");
  return (
    <g transform={`translate(${from.x} ${from.y}) rotate(${ang})`} opacity={Math.min(1, on * 2)}>
      <path d={`M 0 ${-w} L ${reach} ${-w * 0.6} L ${reach} ${w * 0.6} L 0 ${w} Z`} fill="url(#blueBeam)" opacity={0.45} />
      <path d={strand(0, 18)} stroke="#ffe39a" strokeWidth={7} fill="none" strokeLinecap="round" opacity={0.95} />
      <path d={strand(Math.PI, 18)} stroke="#9fe8ff" strokeWidth={7} fill="none" strokeLinecap="round" opacity={0.95} />
      <path d={`M 0 -9 L ${reach} -5 L ${reach} 5 L 0 9 Z`} fill="#f4fdff" />
      {Array.from({ length: 10 }, (_, i) => {
        const u = ((i / 10 + g / 36) % 1) * reach;
        return <circle key={i} cx={u} cy={Math.sin(i * 2.3 + g / 3) * w * 0.5} r={5 + (i % 3) * 2} fill={i % 2 ? "#fff3c0" : "#d8f8ff"} />;
      })}
    </g>
  );
};
