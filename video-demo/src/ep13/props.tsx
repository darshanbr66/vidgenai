import React from "react";
import { Sparkle } from "../story/scenery";
import { Banana } from "../ep08/props";

// Episode 13 characters and props in the series' 2D style.

export const RB7 = ["#ff4d5e", "#ff9a3c", "#ffd83a", "#4fd66a", "#3f9dff", "#5a5cf0", "#b05cff"];
export const COLOR_WORDS = ["Courage", "Friendship", "Happiness", "Kindness", "Trust", "Imagination", "Hope"];

// ---------- colour helpers ----------
const hex = (c: string) => [parseInt(c.slice(1, 3), 16), parseInt(c.slice(3, 5), 16), parseInt(c.slice(5, 7), 16)];
const toHex = (v: number[]) => "#" + v.map((x) => Math.round(Math.max(0, Math.min(255, x))).toString(16).padStart(2, "0")).join("");
export const mixC = (a: string, b: string, k: number) => {
  const A = hex(a);
  const B = hex(b);
  return toHex(A.map((x, i) => x + (B[i] - x) * Math.max(0, Math.min(1, k))));
};
export const shade = (c: string, k: number) => (k >= 0 ? mixC(c, "#ffffff", k) : mixC(c, "#000000", -k));
// a smooth path through a list of colours; k in [0, n-1]
export const colorPath = (cols: string[], k: number) => {
  const i = Math.max(0, Math.min(cols.length - 2, Math.floor(k)));
  const f = Math.max(0, Math.min(1, k - i));
  const e = f * f * (3 - 2 * f);
  return mixC(cols[i], cols[i + 1], e);
};
// Pico's own colour: a soft mint green
export const PICO_GREEN = "#5fd8a0";

export const Ep13Defs: React.FC<{ lit?: number }> = ({ lit = 1 }) => {
  // Bright, soft high-sky light on the 2D characters; a touch cool while the rainbow is pale
  const k = Math.max(0.8, Math.min(1.15, lit));
  return (
    <>
      <filter id="rainbowLit" colorInterpolationFilters="sRGB" x="-20%" y="-20%" width="140%" height="140%">
        <feColorMatrix type="matrix" values={`${1.01 * k} 0 0 0 0.025  0 ${1.0 * k} 0 0 0.02  0 0 ${1.02 * k} 0 0.035  0 0 0 1 0`} />
      </filter>
      {/* colourize filters: whatever is drawn takes the hue of one rainbow colour (Bobo's seven-colour moment) */}
      {RB7.map((c, i) => {
        const [r, g, b] = hex(c).map((v) => v / 255);
        const m = (w: number) => `${0.3 * w} ${0.59 * w} ${0.11 * w}`;
        return (
          <filter key={i} id={`tint${i}`} colorInterpolationFilters="sRGB">
            <feColorMatrix type="matrix" values={`${m(r * 1.9)} 0 ${r * 0.12}  ${m(g * 1.9)} 0 ${g * 0.12}  ${m(b * 1.9)} 0 ${b * 0.12}  0 0 0 1 0`} />
          </filter>
        );
      })}
      {RB7.map((c, i) => (
        <radialGradient key={i} id={`orb${i}`} cx="38%" cy="32%" r="70%">
          <stop offset="0%" stopColor="#ffffff" />
          <stop offset="28%" stopColor={shade(c, 0.35)} />
          <stop offset="75%" stopColor={c} />
          <stop offset="100%" stopColor={shade(c, -0.35)} />
        </radialGradient>
      ))}
      <radialGradient id="orbGlow" cx="50%" cy="50%" r="50%">
        <stop offset="0%" stopColor="#ffffff" stopOpacity="0.9" />
        <stop offset="45%" stopColor="#ffffff" stopOpacity="0.35" />
        <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
      </radialGradient>
      <radialGradient id="stoneG" cx="38%" cy="32%" r="70%">
        <stop offset="0%" stopColor="#d8d4dc" />
        <stop offset="70%" stopColor="#9a96a4" />
        <stop offset="100%" stopColor="#6a6674" />
      </radialGradient>
      <linearGradient id="rainbowV" x1="0" y1="0" x2="0" y2="1">
        {RB7.map((c, i) => (
          <stop key={i} offset={`${(i / 6) * 100}%`} stopColor={c} />
        ))}
      </linearGradient>
      <linearGradient id="rainbowH" x1="0" y1="0" x2="1" y2="0">
        {RB7.map((c, i) => (
          <stop key={i} offset={`${(i / 6) * 100}%`} stopColor={c} />
        ))}
      </linearGradient>
      <radialGradient id="pastelCloud" cx="40%" cy="35%" r="75%">
        <stop offset="0%" stopColor="#ffffff" />
        <stop offset="55%" stopColor="#ffe6f6" />
        <stop offset="100%" stopColor="#d8c8ff" />
      </radialGradient>
      <radialGradient id="picoIris" cx="45%" cy="38%" r="62%">
        <stop offset="0%" stopColor="#d8fffa" />
        <stop offset="50%" stopColor="#2fd8cc" />
        <stop offset="100%" stopColor="#0c8a8a" />
      </radialGradient>
    </>
  );
};

// ---------- Pico, the tiny rainbow chameleon, guardian of the Rainbow Bridge. (0, 0) at the feet; about 250 tall at scale 1 ----------
export type PicoMood = "happy" | "joy" | "surprised" | "scared" | "brave" | "sad" | "giggle" | "proud" | "shine";

export const Pico: React.FC<{
  x: number;
  y: number;
  scale?: number;
  g: number;
  color?: string; // body colour
  rainbow?: number; // 0..1 striped rainbow body (camouflage, shining)
  look?: { x: number; y: number };
  mood?: PicoMood;
  mouth?: number;
  blink?: number;
  armsUp?: number; // 0..1
  hop?: number;
  squash?: number;
  tilt?: number;
  headTilt?: number;
  glow?: number; // 0..1 glowing light around the body
  uid?: string;
  flip?: boolean;
}> = ({ x, y, scale = 1, g, color = PICO_GREEN, rainbow = 0, look = { x: 0, y: 0 }, mood = "happy", mouth = 0, blink = 1, armsUp = 0, hop = 0, squash = 1, tilt = 0, headTilt = 0, glow = 0, uid = "pico", flip = false }) => {
  const talking = mouth > 0.06;
  const big = mood === "surprised" || mood === "scared" ? 1.14 : 1;
  const light = shade(color, 0.45);
  const dark = shade(color, -0.35);
  const line = shade(color, -0.55);
  const bodyId = `${uid}-body`;
  const rbId = `${uid}-rb`;
  const fill = `url(#${bodyId})`;
  const sw = Math.sin(g / 9) * 6;
  const eye = (side: -1 | 1) => {
    const cx = side * 44;
    const closedJoy = (mood === "joy" || mood === "giggle") && !talking && blink > 0.5;
    return (
      <g key={side} transform={`translate(${cx} -6)`}>
        {/* chameleon turret: a round scaly cone around each eye */}
        <circle r={40 * big} fill={fill} stroke={line} strokeWidth={3} />
        {rainbow > 0.01 && <circle r={40 * big} fill={`url(#${rbId})`} opacity={rainbow} />}
        {closedJoy ? (
          <path d="M -20 4 Q 0 -16 20 4" stroke="#1a3a30" strokeWidth={7} strokeLinecap="round" fill="none" />
        ) : (
          <g transform={`scale(${big} ${big * blink})`}>
            <circle r={31} fill="#ffffff" />
            <g transform={`translate(${look.x * 8} ${look.y * 8})`}>
              <circle r={23} fill="url(#picoIris)" />
              <circle r={11} fill="#0a2a2a" />
              <circle cx={-8} cy={-9} r={8} fill="#fff" />
              <circle cx={7} cy={8} r={3.5} fill="#fff" opacity={0.9} />
            </g>
          </g>
        )}
        {(mood === "scared" || mood === "sad") && <path d={`M ${-22 * side - 4} -40 Q 0 ${mood === "sad" ? -34 : -48} ${22 * side + 4} -38`} stroke={line} strokeWidth={4} fill="none" strokeLinecap="round" />}
        {mood === "brave" && <path d={`M ${-24 * side} -44 L ${20 * side} -34`} stroke={line} strokeWidth={5} fill="none" strokeLinecap="round" />}
      </g>
    );
  };
  const mouthEl = talking ? (
    <path d={`M -26 26 Q 0 ${30 + mouth * 26} 26 26 Q 0 ${36 + mouth * 8} -26 26 Z`} fill="#c8405a" stroke={line} strokeWidth={3} strokeLinejoin="round" />
  ) : mood === "surprised" || mood === "scared" ? (
    <ellipse cx={0} cy={32} rx={10} ry={13} fill="#c8405a" stroke={line} strokeWidth={3} />
  ) : mood === "sad" ? (
    <path d="M -18 34 Q 0 22 18 34" stroke={line} strokeWidth={4.5} fill="none" strokeLinecap="round" />
  ) : mood === "giggle" || mood === "joy" || mood === "shine" ? (
    <path d="M -28 22 Q 0 52 28 22 Q 0 34 -28 22 Z" fill="#c8405a" stroke={line} strokeWidth={3} strokeLinejoin="round" />
  ) : (
    <path d="M -28 24 Q 0 42 28 24" stroke={line} strokeWidth={4.5} fill="none" strokeLinecap="round" />
  );
  const arm = (side: -1 | 1) => {
    const a = side * (20 + armsUp * 120);
    return (
      <g key={side} transform={`translate(${side * 40} -96) rotate(${-a})`}>
        <path d={`M 0 0 Q ${side * 18} 14 ${side * 20} 40`} stroke={fill} strokeWidth={15} strokeLinecap="round" fill="none" />
        <path d={`M 0 0 Q ${side * 18} 14 ${side * 20} 40`} stroke={line} strokeWidth={15} strokeLinecap="round" fill="none" opacity={0.25} />
        <circle cx={side * 16} cy={44} r={6} fill={light} stroke={line} strokeWidth={2} />
        <circle cx={side * 26} cy={40} r={6} fill={light} stroke={line} strokeWidth={2} />
      </g>
    );
  };
  return (
    <g transform={`translate(${x} ${y}) scale(${scale * (flip ? -1 : 1)} ${scale})`}>
      <defs>
        <radialGradient id={bodyId} cx="40%" cy="30%" r="78%">
          <stop offset="0%" stopColor={light} />
          <stop offset="60%" stopColor={color} />
          <stop offset="100%" stopColor={dark} />
        </radialGradient>
        <linearGradient id={rbId} x1="0" y1="0" x2="1" y2="1">
          {RB7.map((c, i) => (
            <stop key={i} offset={`${(i / 6) * 100}%`} stopColor={c} />
          ))}
        </linearGradient>
      </defs>
      {glow > 0.01 && <circle cx={0} cy={-130} r={190 + glow * 60} fill="url(#orbGlow)" opacity={glow} />}
      <ellipse cx={0} cy={4} rx={60} ry={11} fill="url(#shadow)" opacity={1 - Math.min(1, hop / 200) * 0.7} />
      <g transform={`translate(0 ${-hop}) rotate(${tilt}) scale(${1 / Math.sqrt(squash)} ${squash})`}>
        {/* the curled tail */}
        <g transform={`rotate(${sw} 40 -40)`}>
          <path d="M 36 -46 C 96 -40 118 -100 88 -122 C 64 -138 44 -112 58 -96 C 68 -86 82 -94 78 -106" stroke={line} strokeWidth={26} strokeLinecap="round" fill="none" />
          <path d="M 36 -46 C 96 -40 118 -100 88 -122 C 64 -138 44 -112 58 -96 C 68 -86 82 -94 78 -106" stroke={fill} strokeWidth={20} strokeLinecap="round" fill="none" />
          {rainbow > 0.01 && <path d="M 36 -46 C 96 -40 118 -100 88 -122 C 64 -138 44 -112 58 -96 C 68 -86 82 -94 78 -106" stroke={`url(#${rbId})`} strokeWidth={20} strokeLinecap="round" fill="none" opacity={rainbow} />}
        </g>
        {/* tiny feet */}
        {[-1, 1].map((sd) => (
          <g key={sd} transform={`translate(${sd * 26} -8)`}>
            <ellipse cx={-6} cy={4} rx={10} ry={8} fill={fill} stroke={line} strokeWidth={2.5} />
            <ellipse cx={8} cy={4} rx={10} ry={8} fill={fill} stroke={line} strokeWidth={2.5} />
          </g>
        ))}
        {arm(-1)}
        {arm(1)}
        {/* body with soft scales */}
        <ellipse cx={0} cy={-72} rx={56} ry={66} fill={fill} stroke={line} strokeWidth={3} />
        {rainbow > 0.01 && <ellipse cx={0} cy={-72} rx={56} ry={66} fill={`url(#${rbId})`} opacity={rainbow} />}
        <ellipse cx={0} cy={-58} rx={32} ry={42} fill={light} opacity={0.75} />
        {Array.from({ length: 6 }, (_, i) => (
          <path key={i} d={`M ${-20 + (i % 3) * 20 - 7} ${-78 + Math.floor(i / 3) * 24} q 7 7 14 0`} stroke={shade(color, -0.15)} strokeWidth={3} fill="none" strokeLinecap="round" opacity={0.8} />
        ))}
        {/* head */}
        <g transform={`translate(0 -172) rotate(${headTilt})`}>
          {/* a little crest */}
          <path d="M -30 -58 Q 0 -96 30 -58 Z" fill={fill} stroke={line} strokeWidth={3} strokeLinejoin="round" />
          <ellipse rx={84} ry={66} fill={fill} stroke={line} strokeWidth={3} />
          {rainbow > 0.01 && (
            <>
              <path d="M -30 -58 Q 0 -96 30 -58 Z" fill={`url(#${rbId})`} opacity={rainbow} />
              <ellipse rx={84} ry={66} fill={`url(#${rbId})`} opacity={rainbow} />
            </>
          )}
          {/* the glowing rainbow mark on the forehead */}
          <g transform="translate(0 -40)">
            <circle r={16} fill="#ffffff" opacity={0.35 + 0.4 * Math.max(glow, rainbow)} />
            {[0, 1, 2].map((k) => (
              <path key={k} d={`M ${-14 + k * 4} 4 A ${14 - k * 4} ${14 - k * 4} 0 0 1 ${14 - k * 4} 4`} stroke={[RB7[0], RB7[2], RB7[4]][k]} strokeWidth={4} fill="none" strokeLinecap="round" />
            ))}
          </g>
          <ellipse cx={-62} cy={26} rx={13} ry={8} fill="#ff8aa0" opacity={0.55} />
          <ellipse cx={62} cy={26} rx={13} ry={8} fill="#ff8aa0" opacity={0.55} />
          {eye(-1)}
          {eye(1)}
          {mouthEl}
        </g>
      </g>
    </g>
  );
};

// A smooth series of colour flashes when Pico is startled; returns the body colour at local frame k
export const PICO_FLASH = ["#5fd8a0", "#ff7a9a", "#ffd04a", "#5aa8ff", "#c07aff", "#ff9a4a", "#4ad8e8", "#5fd8a0"];

// ---------- colour orbs ----------
export const ColorOrb: React.FC<{ x: number; y: number; scale: number; i: number; g: number; glow?: number; grey?: number }> = ({ x, y, scale, i, g, glow = 1, grey = 0 }) => (
  <g transform={`translate(${x} ${y}) scale(${scale})`}>
    <circle r={90 + 10 * Math.sin(g / 6 + i)} fill="url(#orbGlow)" opacity={0.7 * glow} />
    <circle r={42} fill={grey > 0.5 ? "url(#stoneG)" : `url(#orb${i})`} stroke={shade(RB7[i], -0.4)} strokeWidth={3} />
    <ellipse cx={-14} cy={-16} rx={12} ry={8} fill="#ffffff" opacity={0.75} />
    {glow > 0.3 && <Sparkle x={24} y={-26} size={18} color="#ffffff" rotate={g * 4 + i * 30} opacity={0.6 + 0.4 * Math.sin(g / 4 + i)} />}
  </g>
);

export const Stone: React.FC<{ x: number; y: number; scale: number }> = ({ x, y, scale }) => (
  <g transform={`translate(${x} ${y}) scale(${scale})`}>
    <path d="M -40 6 Q -44 -30 -8 -40 Q 30 -44 42 -10 Q 48 26 10 38 Q -34 42 -40 6 Z" fill="url(#stoneG)" stroke="#5a5664" strokeWidth={3} />
    <path d="M -18 -22 q 10 -6 20 -2" stroke="#ffffff" strokeWidth={4} opacity={0.5} fill="none" strokeLinecap="round" />
    <path d="M 4 10 q 10 4 16 -4" stroke="#6a6674" strokeWidth={3} fill="none" strokeLinecap="round" />
  </g>
);

// ---------- bananas ----------
export const RainbowBanana: React.FC<{ x: number; y: number; scale?: number; rot?: number; g: number; bitten?: number }> = ({ x, y, scale = 1, rot = 0, g, bitten = 0 }) => (
  <g transform={`translate(${x} ${y}) scale(${scale}) rotate(${rot})`}>
    <circle r={80} fill="url(#orbGlow)" opacity={0.6 + 0.2 * Math.sin(g / 5)} />
    <path d="M -46 -30 Q -40 34 30 40 Q 44 38 46 30 Q 0 26 -30 -32 Z" fill="url(#rainbowH)" stroke="#8a5ad8" strokeWidth={4} strokeLinejoin="round" />
    <path d="M -36 -18 Q -26 24 26 32" stroke="#ffffff" strokeWidth={5} fill="none" strokeLinecap="round" opacity={0.6} />
    <path d="M -46 -30 L -50 -42" stroke="#7a5a20" strokeWidth={7} strokeLinecap="round" />
    {bitten > 0 && (
      <g>
        <circle cx={44} cy={32} r={18 * bitten} fill="#fff8f0" />
        <circle cx={34} cy={40} r={13 * bitten} fill="#fff8f0" />
      </g>
    )}
    <Sparkle x={-10} y={-10} size={16} color="#ffffff" rotate={g * 5} opacity={0.8} />
  </g>
);

// Bobo's daydream: a bridge with a railing made of bananas
export const BananaRailThought: React.FC<{ x: number; y: number; scale: number; on: number; g: number }> = ({ x, y, scale, on, g }) => {
  if (on <= 0.01) return null;
  const s = scale * (0.7 + 0.3 * Math.min(1, on * 1.5));
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`} opacity={Math.min(1, on * 2)}>
      <circle cx={-150} cy={190} r={14} fill="#ffffff" stroke="#c8b8e8" strokeWidth={4} />
      <circle cx={-118} cy={148} r={22} fill="#ffffff" stroke="#c8b8e8" strokeWidth={4} />
      <ellipse cx={0} cy={0} rx={190} ry={130} fill="#ffffff" stroke="#c8b8e8" strokeWidth={6} />
      <path d="M -130 60 Q 0 -40 130 60" stroke="url(#rainbowH)" strokeWidth={26} fill="none" strokeLinecap="round" />
      {Array.from({ length: 7 }, (_, i) => {
        const k = i / 6;
        const px = -120 + k * 240;
        const py = 50 - Math.sin(k * Math.PI) * 70;
        return <Banana key={i} x={px} y={py - 46 + Math.sin(g / 5 + i) * 3} scale={0.45} rot={-60 + k * 120} />;
      })}
      <path d="M -125 2 Q 0 -98 125 2" stroke="#e8b830" strokeWidth={6} fill="none" strokeLinecap="round" />
    </g>
  );
};

// ---------- clouds ----------
// A soft pastel cloud; wobble makes it jiggle (someone inside), tint mixes in rainbow colours
export const PuffCloud: React.FC<{ x: number; y: number; w: number; g: number; wobble?: number; tint?: number; opacity?: number }> = ({ x, y, w, g, wobble = 0, tint = 0, opacity = 1 }) => {
  const bumps: [number, number, number][] = [
    [-0.36, -0.06, 0.26],
    [-0.14, -0.22, 0.32],
    [0.14, -0.2, 0.3],
    [0.36, -0.04, 0.24],
    [0, 0.02, 0.36],
    [-0.24, 0.08, 0.24],
    [0.24, 0.08, 0.24],
  ];
  return (
    <g transform={`translate(${x} ${y})`} opacity={opacity}>
      {bumps.map(([bx, by, r], i) => {
        const j = wobble * Math.sin(g * 0.9 + i * 1.7) * 0.03;
        return <circle key={i} cx={bx * w + j * w} cy={by * w - Math.abs(j) * w} r={r * w * (1 + j)} fill="url(#pastelCloud)" />;
      })}
      {tint > 0.01 &&
        bumps.map(([bx, by, r], i) => <circle key={`t${i}`} cx={bx * w} cy={by * w} r={r * w * 0.8} fill={RB7[i % 7]} opacity={0.22 * tint} />)}
    </g>
  );
};

// fluffy bits of cloud stuck on whoever flew through one
export const CloudFluff: React.FC<{ x: number; y: number; scale: number; on: number }> = ({ x, y, scale, on }) => {
  if (on <= 0.01) return null;
  return (
    <g transform={`translate(${x} ${y}) scale(${scale})`} opacity={on}>
      {[
        [-50, -10, 34],
        [-10, -34, 40],
        [36, -14, 32],
        [70, 10, 22],
        [-80, 16, 20],
      ].map(([cx, cy, r], i) => (
        <circle key={i} cx={cx} cy={cy} r={r} fill={["#ffe0f4", "#ffffff", "#e0e8ff", "#fff0d8", "#e8ffe8"][i]} stroke="#d8c8f0" strokeWidth={2} />
      ))}
    </g>
  );
};

// ---------- the rainbow flower Pico hides in ----------
export const RainbowFlower: React.FC<{ x: number; y: number; scale: number; g: number; layer: "back" | "front"; open?: number }> = ({ x, y, scale, g, layer, open = 1 }) => {
  const petals = 7;
  const sway = Math.sin(g / 20) * 3;
  return (
    <g transform={`translate(${x} ${y}) scale(${scale}) rotate(${sway})`}>
      {layer === "back" && <path d="M 0 0 Q -10 -120 0 -230" stroke="#3faa48" strokeWidth={16} fill="none" strokeLinecap="round" />}
      {layer === "back" && <path d="M 0 -80 Q 60 -110 90 -70 Q 50 -60 0 -80 Z" fill="#4fc858" stroke="#2a8a38" strokeWidth={3} />}
      <g transform="translate(0 -260)">
        {Array.from({ length: petals }, (_, i) => {
          const a = (i / petals) * 360 - 90 + 360 / petals / 2;
          const front = Math.sin((a * Math.PI) / 180) > 0.1;
          if ((layer === "front") !== front) return null;
          return (
            <g key={i} transform={`rotate(${a}) translate(${70 + 30 * open} 0)`}>
              <ellipse rx={82} ry={50} fill={RB7[i]} stroke={shade(RB7[i], -0.35)} strokeWidth={3} />
              <ellipse cx={-14} rx={40} ry={20} fill={shade(RB7[i], 0.35)} opacity={0.6} />
            </g>
          );
        })}
        {layer === "back" && <circle r={64} fill="#ffe680" stroke="#d8a830" strokeWidth={3} />}
      </g>
    </g>
  );
};

// ---------- Bobo in seven colours: the children drawn seven times, each clipped to a band and tinted ----------
export const SevenColors: React.FC<{ x: number; y: number; scale: number; on: number; uid: string; children: React.ReactNode }> = ({ x, y, scale, on, uid, children }) => {
  if (on <= 0.01) return <>{children}</>;
  const top = y - 520 * scale;
  const h = (y + 20 * scale - top) / 7;
  return (
    <>
      <g opacity={1 - on}>{children}</g>
      <defs>
        {RB7.map((_, i) => (
          <clipPath key={i} id={`${uid}-c${i}`}>
            <path d={`M ${x - 400 * scale} ${top + i * h - 12 * scale} L ${x + 400 * scale} ${top + i * h + 12 * scale} L ${x + 400 * scale} ${top + (i + 1) * h + 13 * scale} L ${x - 400 * scale} ${top + (i + 1) * h - 11 * scale} Z`} />
          </clipPath>
        ))}
      </defs>
      {RB7.map((_, i) => (
        <g key={i} clipPath={`url(#${uid}-c${i})`} opacity={on}>
          <g filter={`url(#tint${i})`}>{children}</g>
        </g>
      ))}
    </>
  );
};

// ---------- the Rainbow Heart as a small picture (in a thought bubble) ----------
export const HeartPic: React.FC<{ x: number; y: number; scale: number; sat: number; g: number }> = ({ x, y, scale, sat, g }) => (
  <g transform={`translate(${x} ${y}) scale(${scale})`}>
    <defs>
      <linearGradient id="heartPicG" x1="0" y1="0" x2="0" y2="1">
        {RB7.map((c, i) => (
          <stop key={i} offset={`${(i / 6) * 100}%`} stopColor={mixC("#c8c8d4", c, sat)} />
        ))}
      </linearGradient>
    </defs>
    <path d="M 0 40 C -30 18 -66 -4 -62 -30 C -58 -56 -20 -60 0 -32 C 20 -60 58 -56 62 -30 C 66 -4 30 18 0 40 Z" fill="url(#heartPicG)" stroke="#8a7aa8" strokeWidth={4} />
    <path d="M -40 -30 q 6 -14 20 -12" stroke="#ffffff" strokeWidth={6} fill="none" strokeLinecap="round" opacity={0.6} />
    {sat < 0.5 && (
      <g opacity={0.8}>
        <path d="M 4 -30 l -8 18 l 10 6 l -8 18" stroke="#6a5a88" strokeWidth={4} fill="none" strokeLinecap="round" strokeLinejoin="round" />
      </g>
    )}
    <Sparkle x={44} y={-44} size={18} color="#ffffff" rotate={g * 4} opacity={0.4 + 0.6 * sat} />
  </g>
);

export const ThoughtBubble: React.FC<{ x: number; y: number; scale: number; on: number; tail?: -1 | 1; children: React.ReactNode }> = ({ x, y, scale, on, tail = -1, children }) => {
  if (on <= 0.01) return null;
  const s = scale * (0.7 + 0.3 * Math.min(1, on * 1.5));
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`} opacity={Math.min(1, on * 2)}>
      <circle cx={tail * 110} cy={150} r={12} fill="#ffffff" stroke="#c8b8e8" strokeWidth={4} />
      <circle cx={tail * 84} cy={112} r={20} fill="#ffffff" stroke="#c8b8e8" strokeWidth={4} />
      <ellipse rx={130} ry={100} fill="#ffffff" stroke="#c8b8e8" strokeWidth={6} />
      {children}
    </g>
  );
};

// little music notes drifting up from (x, y)
export const MusicNotes: React.FC<{ x: number; y: number; scale: number; g: number; on: number; count?: number }> = ({ x, y, scale, g, on, count = 6 }) => {
  if (on <= 0.01) return null;
  return (
    <g opacity={on}>
      {Array.from({ length: count }, (_, i) => {
        const k = ((g / 60 + i / count) % 1);
        const px = x + Math.sin(k * 6 + i * 2) * 60 * scale + (i - count / 2) * 30 * scale;
        const py = y - k * 380 * scale;
        return (
          <g key={i} transform={`translate(${px} ${py}) scale(${scale * (0.7 + 0.3 * Math.sin(k * Math.PI))}) rotate(${Math.sin(k * 8 + i) * 15})`} opacity={Math.sin(k * Math.PI)}>
            <ellipse cx={0} cy={0} rx={16} ry={12} fill={RB7[i % 7]} transform="rotate(-20)" />
            <path d="M 13 -4 L 13 -56 Q 30 -50 34 -36" stroke={RB7[i % 7]} strokeWidth={6} fill="none" strokeLinecap="round" />
          </g>
        );
      })}
    </g>
  );
};

// a word label for each colour of the gate
export const ColorWord: React.FC<{ x: number; y: number; i: number; on: number; size?: number }> = ({ x, y, i, on, size = 44 }) => {
  if (on <= 0.01) return null;
  return (
    <text
      x={x}
      y={y + (1 - Math.min(1, on)) * 20}
      textAnchor="middle"
      fontSize={size}
      fontWeight={700}
      fontFamily="Fredoka, sans-serif"
      fill={shade(RB7[i], 0.25)}
      stroke={shade(RB7[i], -0.6)}
      strokeWidth={6}
      paintOrder="stroke"
      opacity={Math.min(1, on)}
    >
      {COLOR_WORDS[i]}
    </text>
  );
};

// a puff of fire, small and controlled (Draco lighting the pedestal)
export const TinyFlame: React.FC<{ from: { x: number; y: number }; to: { x: number; y: number }; on: number; g: number; scale: number }> = ({ from, to, on, g, scale }) => {
  if (on <= 0.01) return null;
  const n = 9;
  return (
    <g opacity={on}>
      {Array.from({ length: n }, (_, i) => {
        const k = ((g / 6 + i / n) % 1);
        const px = from.x + (to.x - from.x) * k + Math.sin(g + i) * 6 * scale;
        const py = from.y + (to.y - from.y) * k + Math.cos(g * 1.3 + i) * 6 * scale;
        return <circle key={i} cx={px} cy={py} r={(14 - k * 8) * scale} fill={k < 0.4 ? "#fff2a0" : k < 0.7 ? "#ffb040" : "#ff7a30"} opacity={1 - k * 0.7} />;
      })}
    </g>
  );
};
