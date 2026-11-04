import React from "react";
import { mixC, shade } from "../ep13/props";

// Episode 14: Melody the musical fox, and the 2D props of the Enchanted Music Castle.
// Everything is drawn with (0, 0) at the feet / base, so `place()` from kit3d puts it on the 3D ground.
// At scale 1, 330 units = 1 world unit (Lumi is about 1.3 world units tall).

export const MELODY_PINK = "#ffb4d4";
export const NOTE_GOLD = "#ffd36a";
export const NOTE_PINK = "#ff8ac8";
export const NOTE_BLUE = "#7ad0ff";
export const RB7 = ["#ff4d5e", "#ff9a3c", "#ffd83a", "#4fd66a", "#3f9dff", "#5a5cf0", "#b05cff"];

export const Ep14Defs: React.FC<{ alive?: number }> = ({ alive = 1 }) => {
  const k = 0.92 + alive * 0.12;
  return (
    <>
      <filter id="castleLit" colorInterpolationFilters="sRGB" x="-20%" y="-20%" width="140%" height="140%">
        <feColorMatrix type="matrix" values={`${1.02 * k} 0 0 0 0.03  0 ${0.99 * k} 0 0 0.02  0 0 ${1.02 * k} 0 0.04  0 0 0 1 0`} />
      </filter>
      <filter id="hallLit" colorInterpolationFilters="sRGB" x="-20%" y="-20%" width="140%" height="140%">
        <feColorMatrix type="matrix" values={`${1.04 * k} 0 0 0 0.03  0 ${0.98 * k} 0 0 0.015  0 0 ${0.98 * k} 0 0.03  0 0 0 1 0`} />
      </filter>
      <radialGradient id="melFur" cx="40%" cy="30%" r="78%">
        <stop offset="0%" stopColor="#ffe4f0" />
        <stop offset="55%" stopColor={MELODY_PINK} />
        <stop offset="100%" stopColor="#f08ab8" />
      </radialGradient>
      <radialGradient id="melCream" cx="50%" cy="40%" r="65%">
        <stop offset="0%" stopColor="#ffffff" />
        <stop offset="100%" stopColor="#ffe6f2" />
      </radialGradient>
      <radialGradient id="melIris" cx="45%" cy="38%" r="62%">
        <stop offset="0%" stopColor="#efd8ff" />
        <stop offset="50%" stopColor="#a060f0" />
        <stop offset="100%" stopColor="#5a24a8" />
      </radialGradient>
      <linearGradient id="melTail" x1="0" y1="1" x2="1" y2="0">
        <stop offset="0%" stopColor={MELODY_PINK} />
        <stop offset="35%" stopColor="#ffc8a8" />
        <stop offset="52%" stopColor="#fff0a8" />
        <stop offset="68%" stopColor="#b8f0d0" />
        <stop offset="82%" stopColor="#b0dcff" />
        <stop offset="100%" stopColor="#d8c0ff" />
      </linearGradient>
      <radialGradient id="noteGlow" cx="50%" cy="50%" r="50%">
        <stop offset="0%" stopColor="#ffffff" stopOpacity="0.95" />
        <stop offset="40%" stopColor="#ffffff" stopOpacity="0.35" />
        <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
      </radialGradient>
      <linearGradient id="stoneStatue" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stopColor="#eeeaf2" />
        <stop offset="100%" stopColor="#a8a2b4" />
      </linearGradient>
      <linearGradient id="drumBody" x1="0" y1="0" x2="1" y2="0">
        <stop offset="0%" stopColor="#e8b020" />
        <stop offset="45%" stopColor="#ffe070" />
        <stop offset="100%" stopColor="#c88a10" />
      </linearGradient>
      <radialGradient id="drumSkin" cx="45%" cy="40%" r="70%">
        <stop offset="0%" stopColor="#fffaf0" />
        <stop offset="100%" stopColor="#f0dcc0" />
      </radialGradient>
      <linearGradient id="goldBox" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#fff0a0" />
        <stop offset="60%" stopColor="#f2c040" />
        <stop offset="100%" stopColor="#b8820e" />
      </linearGradient>
    </>
  );
};

// ---------- small shapes ----------
const star4 = (r: number) => `M 0 ${-r} Q ${r * 0.18} ${-r * 0.18} ${r} 0 Q ${r * 0.18} ${r * 0.18} 0 ${r} Q ${-r * 0.18} ${r * 0.18} ${-r} 0 Q ${-r * 0.18} ${-r * 0.18} 0 ${-r} Z`;
/** an eighth note, about 60 tall, head at (0, 0) */
export const NOTE_PATH = "M -12 -4 a 14 10 -25 1 0 26 -6 L 14 -58 Q 30 -50 34 -36 Q 30 -44 18 -46 L 18 -10 Z";
export const SingleNote: React.FC<{ color: string; glow?: number; wobble?: number; crooked?: number }> = ({ color, glow = 1, wobble = 0, crooked = 0 }) => (
  <g transform={`rotate(${wobble}) skewX(${crooked * 18})`}>
    {glow > 0.02 && <circle cx={6} cy={-24} r={52} fill="url(#noteGlow)" opacity={0.75 * glow} />}
    <path d={NOTE_PATH} fill={color} stroke={shade(color, -0.45)} strokeWidth={3} strokeLinejoin="round" />
    <ellipse cx={-4} cy={-8} rx={5} ry={3} fill="#ffffff" opacity={0.7} transform="rotate(-25)" />
  </g>
);

/** a glowing music note at (x, y) */
export const GlowNote: React.FC<{ x: number; y: number; scale: number; color: string; glow?: number; rot?: number; crooked?: number; opacity?: number }> = ({ x, y, scale, color, glow = 1, rot = 0, crooked = 0, opacity = 1 }) => (
  <g transform={`translate(${x} ${y}) scale(${scale})`} opacity={opacity}>
    <SingleNote color={color} glow={glow} wobble={rot} crooked={crooked} />
  </g>
);

/** notes rising and drifting from a point; `sour` makes them wobbly, crooked and grey-green */
export const RisingNotes: React.FC<{ x: number; y: number; scale: number; g: number; from: number; on: number; count?: number; sour?: number; colors?: string[]; spread?: number }> = ({ x, y, scale, g, from, on, count = 6, sour = 0, colors = [NOTE_GOLD, NOTE_PINK, NOTE_BLUE, "#b890ff"], spread = 1 }) => {
  if (on <= 0.01) return null;
  return (
    <g opacity={on}>
      {Array.from({ length: count }, (_, i) => {
        const life = 46;
        const age = (g - from + i * (life / count)) % life;
        if (g - from + i * (life / count) < 0) return null;
        const k = age / life;
        const side = i % 2 ? 1 : -1;
        const nx = x + side * (30 + 110 * k) * spread * scale + Math.sin(k * 9 + i) * 26 * scale * (1 + sour * 2);
        const ny = y - 260 * k * scale;
        const col = sour > 0.5 ? ["#a8b878", "#c8a070", "#9a9ab0"][i % 3] : colors[i % colors.length];
        return <GlowNote key={i} x={nx} y={ny} scale={scale * (0.55 + 0.45 * Math.sin(k * Math.PI)) * 1.1} color={col} glow={sour > 0.5 ? 0.2 : 0.9} rot={side * 12 + Math.sin(g / 3 + i) * (8 + sour * 30)} crooked={sour * Math.sin(g / 4 + i)} opacity={Math.min(1, (1 - k) * 3)} />;
      })}
    </g>
  );
};

// ---------- Melody, the tiny musical fox, guardian of the Magical Music Box ----------
export type MelodyMood = "happy" | "joy" | "surprised" | "embarrassed" | "nervous" | "proud" | "sing" | "sad" | "determined";

export const Melody: React.FC<{
  x: number;
  y: number;
  scale?: number;
  g: number;
  look?: { x: number; y: number };
  mood?: MelodyMood;
  mouth?: number;
  blink?: number;
  armL?: number; // degrees; positive raises the screen-left paw
  armR?: number; // negative raises the screen-right paw
  hop?: number; // in body units
  squash?: number;
  lean?: number;
  headTilt?: number;
  earL?: number; // extra ear angle; positive tilts outward / droops
  earR?: number;
  tailSwish?: number; // 0.. how much the tail sways
  tailUp?: number; // 0 resting .. 1 raised high (playing notes)
  tailGlow?: number; // the glowing tip that draws notes
  blush?: number;
  glow?: number;
  flip?: boolean;
}> = ({ x, y, scale = 1, g, look = { x: 0, y: 0 }, mood = "happy", mouth = 0, blink = 1, armL = 18, armR = -18, hop = 0, squash = 1, lean = 0, headTilt = 0, earL = 0, earR = 0, tailSwish = 1, tailUp = 0, tailGlow = 0, blush = 0, glow = 0, flip = false }) => {
  const talking = mouth > 0.06;
  const singing = mood === "sing";
  const big = mood === "surprised" ? 1.12 : 1;
  const line = "#c8508a";
  const sw = Math.sin(g / 8) * 10 * tailSwish;
  const droop = mood === "embarrassed" || mood === "sad" || mood === "nervous" ? 22 : 0;
  const twitch = Math.max(0, Math.sin(g / 21 + 2) - 0.93) * 140;
  const eye = (side: -1 | 1) => {
    const cx = side * 40;
    const closed = (mood === "joy" && !talking) || (mood === "proud" && !talking) || (singing && mood === "sing" && mouth < 0.06 && false);
    if (closed || (singing && blink < 0.5)) {
      return <path key={side} d={`M ${cx - 20} 2 Q ${cx} -20 ${cx + 20} 2`} stroke="#5a2050" strokeWidth={7} strokeLinecap="round" fill="none" />;
    }
    const lookDown = mood === "embarrassed" ? 0.7 : 0;
    const lid = mood === "proud" ? 0.35 : singing ? 0.18 : 0;
    return (
      <g key={side} transform={`translate(${cx} -2) scale(${big} ${big * blink})`}>
        <ellipse rx={27} ry={32} fill="#ffffff" stroke="#e090b8" strokeWidth={2} />
        <g transform={`translate(${look.x * 7} ${look.y * 8 + lookDown * 8})`}>
          <circle r={22} fill="url(#melIris)" />
          <circle r={10.5} fill="#2a0a3a" />
          <circle cx={-7} cy={-9} r={7.5} fill="#fff" />
          <circle cx={7} cy={8} r={3.4} fill="#fff" opacity={0.9} />
          <path d={star4(4)} transform="translate(-10 6)" fill="#fff" opacity={0.85} />
        </g>
        {lid > 0 && <path d={`M -30 -34 L 30 -34 L 30 ${-32 + lid * 64} Q 0 ${-24 + lid * 64} -30 ${-32 + lid * 64} Z`} fill="url(#melFur)" />}
        {/* lashes */}
        <path d={`M ${side * 16} -30 q ${side * 12} -6 ${side * 20} -16 M ${side * 24} -24 q ${side * 10} -2 ${side * 18} -8`} stroke="#5a2050" strokeWidth={3.5} strokeLinecap="round" fill="none" />
      </g>
    );
  };
  const brow = (side: -1 | 1) => {
    const worried = mood === "nervous" || mood === "sad" || mood === "embarrassed";
    const det = mood === "determined";
    const by = mood === "surprised" ? -52 : -44;
    const tilt = worried ? side * -14 : det ? side * 12 : 0;
    return <path key={side} d={`M ${side * 40 - 13} ${by} Q ${side * 40} ${by - 7} ${side * 40 + 13} ${by}`} transform={`rotate(${tilt} ${side * 40} ${by})`} stroke="#d0609a" strokeWidth={4.5} strokeLinecap="round" fill="none" />;
  };
  let mouthEl: React.ReactNode;
  if (singing) {
    const o = 0.25 + Math.min(1, mouth) * 0.9;
    mouthEl = (
      <g>
        <ellipse cx={0} cy={40} rx={9 + o * 4} ry={6 + o * 12} fill="#7a1840" stroke={line} strokeWidth={2.5} />
        <ellipse cx={0} cy={44 + o * 6} rx={6} ry={2 + o * 3} fill="#ff8aa8" />
      </g>
    );
  } else if (talking) {
    mouthEl = (
      <g>
        <path d={`M -14 36 Q 0 32 14 36 Q 11 ${41 + mouth * 14} 0 ${44 + mouth * 16} Q -11 ${41 + mouth * 14} -14 36 Z`} fill="#7a1840" />
        <ellipse cx={0} cy={41 + mouth * 11} rx={6} ry={2.2 + mouth * 2.4} fill="#ff8aa8" />
      </g>
    );
  } else if (mood === "surprised") {
    mouthEl = <ellipse cx={0} cy={41} rx={8} ry={10} fill="#7a1840" />;
  } else if (mood === "joy" || mood === "proud") {
    mouthEl = <path d="M -18 34 Q 0 58 18 34 Z" fill="#7a1840" stroke="#7a1840" strokeWidth={3} strokeLinejoin="round" />;
  } else if (mood === "embarrassed" || mood === "nervous") {
    mouthEl = <path d="M -14 40 Q -7 35 0 40 Q 7 45 14 40" stroke={line} strokeWidth={4} strokeLinecap="round" fill="none" />;
  } else if (mood === "sad") {
    mouthEl = <path d="M -12 44 Q 0 34 12 44" stroke={line} strokeWidth={4} strokeLinecap="round" fill="none" />;
  } else if (mood === "determined") {
    mouthEl = <path d="M -12 39 Q 0 46 12 39" stroke={line} strokeWidth={4.5} strokeLinecap="round" fill="none" />;
  } else {
    mouthEl = <path d="M -15 35 Q -7 44 0 37 Q 7 44 15 35" stroke={line} strokeWidth={4.5} strokeLinecap="round" fill="none" />;
  }
  const ear = (side: -1 | 1, extra: number) => (
    <g key={side} transform={`translate(${side * 52} -56) rotate(${side * (18 + droop + extra) - side * twitch * (side > 0 ? 1 : 0) + Math.sin(g / 13 + side) * 2 * side})`}>
      <path d="M -40 18 C -44 -50 -22 -110 0 -132 C 22 -110 44 -50 40 18 Z" fill="url(#melFur)" stroke="#e080b0" strokeWidth={3} strokeLinejoin="round" />
      <path d="M -24 8 C -26 -40 -12 -86 0 -104 C 12 -86 26 -40 24 8 Z" fill="#ffe0ee" />
      <path d="M -8 -116 C -4 -126 0 -132 0 -132 C 0 -132 4 -126 8 -116 Z" fill="#c890ff" />
    </g>
  );
  const arm = (side: -1 | 1, angle: number) => (
    <g transform={`translate(${side * 38} -128) rotate(${angle})`}>
      <rect x={-11} y={-6} width={22} height={66} rx={11} fill="url(#melFur)" stroke="#e890bc" strokeWidth={2} />
      <ellipse cx={0} cy={60} rx={13} ry={11} fill="#fff2f8" stroke="#e890bc" strokeWidth={2} />
    </g>
  );
  const tailRot = -18 + sw - tailUp * 52;
  const tw = (g / 3) % 6.28;
  return (
    <g transform={`translate(${x} ${y}) scale(${scale * (flip ? -1 : 1)} ${scale})`}>
      {glow > 0.01 && <circle cx={0} cy={-150} r={230} fill="url(#noteGlow)" opacity={glow} />}
      <ellipse cx={0} cy={4} rx={64} ry={11} fill="url(#shadow)" opacity={1 - Math.min(1, hop / 200) * 0.7} />
      {/* tiny glowing stars around the paws */}
      {[0, 1, 2, 3, 4].map((i) => {
        const a = tw + i * 1.26;
        const tws = 0.5 + 0.5 * Math.sin(g / 5 + i * 2);
        return <path key={i} d={star4(7 + tws * 5)} transform={`translate(${Math.cos(a) * 58} ${-8 - hop + Math.sin(a) * 10 - (i % 2) * 14})`} fill={["#fff6b0", "#ffd8f4", "#d8f0ff"][i % 3]} opacity={0.5 + tws * 0.5} />;
      })}
      <g transform={`translate(0 ${-hop}) rotate(${lean}) scale(${1 / Math.sqrt(squash)} ${squash})`}>
        {/* the big fluffy rainbow tail */}
        <g transform={`translate(30 -60) rotate(${tailRot})`}>
          <path d="M -6 0 C 40 -6 104 -20 132 -72 C 152 -110 138 -160 104 -170 C 76 -178 62 -150 78 -130 C 94 -108 84 -70 40 -46 C 20 -36 4 -30 -10 -24 Z" fill="url(#melTail)" stroke="#e8a0c8" strokeWidth={3} strokeLinejoin="round" />
          <path d="M 104 -170 C 76 -178 62 -150 78 -130 C 92 -138 104 -154 104 -170 Z" fill="#ffffff" />
          {/* fluff strokes */}
          <path d="M 70 -46 q 14 -10 26 -6 M 100 -82 q 12 -14 24 -10 M 50 -30 q 10 -8 20 -6" stroke="#ffffff" strokeWidth={3} strokeLinecap="round" fill="none" opacity={0.7} />
          {tailGlow > 0.01 && (
            <g transform="translate(92 -156)">
              <circle r={60 + tailGlow * 30} fill="url(#noteGlow)" opacity={tailGlow} />
              <path d={star4(16 + 6 * Math.sin(g / 2))} fill="#fffbe0" opacity={tailGlow} />
            </g>
          )}
        </g>
        {/* legs */}
        {[-1, 1].map((sd) => (
          <g key={sd} transform={`translate(${sd * 22} -50)`}>
            <rect x={-13} y={0} width={26} height={46} rx={13} fill="url(#melFur)" stroke="#e890bc" strokeWidth={2} />
            <ellipse cx={sd * 4} cy={46} rx={18} ry={10} fill="#fff2f8" stroke="#e890bc" strokeWidth={2} />
          </g>
        ))}
        {arm(-1, armL)}
        {arm(1, armR)}
        <ellipse cx={0} cy={-96} rx={50} ry={58} fill="url(#melFur)" stroke="#e890bc" strokeWidth={2} />
        <ellipse cx={0} cy={-86} rx={30} ry={40} fill="url(#melCream)" />
        {/* a little golden bell-collar */}
        <path d="M -40 -142 Q 0 -126 40 -142" stroke="#f2c040" strokeWidth={8} strokeLinecap="round" fill="none" />
        <circle cx={0} cy={-131} r={9} fill="#ffd860" stroke="#b8820e" strokeWidth={2} />
        {/* head */}
        <g transform={`translate(0 -226) rotate(${headTilt})`}>
          {ear(-1, earL)}
          {ear(1, earR)}
          {/* cheek fluff */}
          {[-1, 1].map((sd) => (
            <path key={sd} d={`M ${sd * 70} -4 L ${sd * 104} 30 L ${sd * 78} 30 L ${sd * 94} 52 L ${sd * 58} 46 Z`} fill="url(#melFur)" stroke="#e890bc" strokeWidth={2} strokeLinejoin="round" />
          ))}
          <ellipse rx={88} ry={76} fill="url(#melFur)" stroke="#e890bc" strokeWidth={2.5} />
          {/* the cream mask */}
          <path d="M -66 8 C -62 -26 -28 -32 0 -12 C 28 -32 62 -26 66 8 C 62 50 30 68 0 68 C -30 68 -62 50 -66 8 Z" fill="url(#melCream)" />
          {/* the golden music-note marking on the forehead */}
          <g transform="translate(-4 -40) scale(0.42)">
            <path d={NOTE_PATH} fill="#ffc83a" stroke="#c88a10" strokeWidth={4} strokeLinejoin="round" />
          </g>
          {blush > 0.01 ? (
            <g opacity={blush}>
              <ellipse cx={-58} cy={26} rx={22} ry={12} fill="#ff5a8a" opacity={0.6} />
              <ellipse cx={58} cy={26} rx={22} ry={12} fill="#ff5a8a" opacity={0.6} />
              {[-1, 1].map((sd) => (
                <path key={sd} d={`M ${sd * 48} 20 l -6 10 M ${sd * 58} 20 l -6 10 M ${sd * 68} 20 l -6 10`} stroke="#ff3a70" strokeWidth={2.5} strokeLinecap="round" />
              ))}
            </g>
          ) : null}
          <ellipse cx={-56} cy={26} rx={14} ry={8} fill="#ff8ab0" opacity={0.55} />
          <ellipse cx={56} cy={26} rx={14} ry={8} fill="#ff8ab0" opacity={0.55} />
          {eye(-1)}
          {eye(1)}
          {brow(-1)}
          {brow(1)}
          <path d="M -10 18 Q 0 12 10 18 Q 6 28 0 29 Q -6 28 -10 18 Z" fill="#c8407a" />
          <ellipse cx={-3} cy={18} rx={3.5} ry={2} fill="#fff" opacity={0.75} />
          {mouthEl}
        </g>
      </g>
    </g>
  );
};
/** where Melody's tail tip is (for notes leaving it), relative to her feet, in her scaled units */
export const melodyTailTip = (x: number, y: number, scale: number, tailUp: number, g: number, tailSwish = 1, hop = 0) => {
  const a = ((-18 + Math.sin(g / 8) * 10 * tailSwish - tailUp * 52) * Math.PI) / 180;
  const tx = 92;
  const ty = -156;
  return { x: x + (30 + tx * Math.cos(a) - ty * Math.sin(a)) * scale, y: y + (-60 - hop + tx * Math.sin(a) + ty * Math.cos(a)) * scale };
};

// ---------- the singing statue by the fountain: a stone songbird on a pedestal ----------
export type StatueMood = "serene" | "confused" | "delighted";
export const SingingStatue: React.FC<{ x: number; y: number; scale: number; g: number; mood: StatueMood; alive?: number; lean?: number }> = ({ x, y, scale, g, mood, alive = 0, lean = 0 }) => {
  const stone = "url(#stoneStatue)";
  const bird = mixC("#c8c4d0", "#8ac8ff", alive);
  const wing = mixC("#b4aec0", "#b48aff", alive);
  const belly = mixC("#e4e0ea", "#fff0c8", alive);
  const ink = "#5a5468";
  const confused = mood === "confused";
  return (
    <g transform={`translate(${x} ${y}) scale(${scale})`}>
      <ellipse cx={0} cy={6} rx={120} ry={18} fill="url(#shadow)" />
      {/* pedestal */}
      <path d="M -100 0 L 100 0 L 86 -40 L -86 -40 Z" fill={stone} stroke="#8a8498" strokeWidth={3} />
      <rect x={-64} y={-230} width={128} height={192} fill={stone} stroke="#8a8498" strokeWidth={3} />
      <path d="M -88 -230 L 88 -230 L 76 -262 L -76 -262 Z" fill={stone} stroke="#8a8498" strokeWidth={3} />
      {/* a carved staff with notes */}
      {[0, 1, 2, 3].map((i) => (
        <line key={i} x1={-48} x2={48} y1={-170 + i * 14} y2={-170 + i * 14} stroke="#8a8498" strokeWidth={2.5} />
      ))}
      <g transform="translate(-14 -132) scale(0.5)">
        <path d={NOTE_PATH} fill="#9a94a8" />
      </g>
      <g transform="translate(22 -146) scale(0.5)">
        <path d={NOTE_PATH} fill="#9a94a8" />
      </g>
      {/* the bird */}
      <g transform={`translate(0 -262) rotate(${lean})`}>
        <path d="M 40 -60 L 120 -30 L 118 -6 L 46 -30 Z" fill={wing} stroke={ink} strokeWidth={3} strokeLinejoin="round" />
        <ellipse cx={0} cy={-72} rx={62} ry={70} fill={bird} stroke={ink} strokeWidth={3} />
        <ellipse cx={-6} cy={-58} rx={36} ry={46} fill={belly} />
        <path d="M 30 -98 Q 76 -78 58 -34 Q 34 -54 30 -98 Z" fill={wing} stroke={ink} strokeWidth={3} />
        {/* head */}
        <g transform={`translate(-10 -150) rotate(${confused ? -12 + Math.sin(g / 6) * 3 : Math.sin(g / 20) * 3})`}>
          <circle r={50} fill={bird} stroke={ink} strokeWidth={3} />
          <path d="M -6 -50 Q 4 -76 20 -70 Q 8 -62 10 -48" fill={wing} stroke={ink} strokeWidth={3} />
          {/* beak: open in song, crooked when confused */}
          {mood === "serene" || mood === "delighted" ? (
            <g>
              <path d="M -40 2 L -84 -6 L -42 -12 Z" fill="#e8c070" stroke={ink} strokeWidth={3} strokeLinejoin="round" />
              <path d="M -40 6 L -78 12 L -42 14 Z" fill="#d8a858" stroke={ink} strokeWidth={3} strokeLinejoin="round" />
            </g>
          ) : (
            <path d="M -40 0 L -80 10 L -66 -4 L -82 -14 L -42 -10 Z" fill="#e8c070" stroke={ink} strokeWidth={3} strokeLinejoin="round" />
          )}
          {/* eyes */}
          {mood === "serene" && <path d="M -26 -12 Q -14 -22 -2 -12" stroke={ink} strokeWidth={5} strokeLinecap="round" fill="none" />}
          {mood === "delighted" && <path d="M -28 -10 Q -14 -26 0 -10" stroke={ink} strokeWidth={5} strokeLinecap="round" fill="none" />}
          {confused && (
            <g>
              <circle cx={-16} cy={-12} r={14} fill="#ffffff" stroke={ink} strokeWidth={3} />
              <circle cx={-20} cy={-10} r={6} fill={ink} />
              <path d="M -34 -38 Q -18 -48 -2 -34" stroke={ink} strokeWidth={5} strokeLinecap="round" fill="none" />
              <path d="M 8 -14 L 26 -12" stroke={ink} strokeWidth={5} strokeLinecap="round" />
              <path d="M 8 -30 L 28 -22" stroke={ink} strokeWidth={5} strokeLinecap="round" />
            </g>
          )}
          {mood === "delighted" && <ellipse cx={-30} cy={14} rx={10} ry={6} fill="#ff8ab0" opacity={0.6} />}
        </g>
        {/* feet */}
        <path d="M -20 -4 l -8 6 M -20 -4 l 4 8 M 14 -4 l -6 8 M 14 -4 l 8 6" stroke={ink} strokeWidth={4} strokeLinecap="round" />
      </g>
    </g>
  );
};

// ---------- the five door symbols' glyphs ----------
export const SymbolGlyph: React.FC<{ x: number; y: number; scale: number; i: number; on: number; wrong?: number }> = ({ x, y, scale, i, on, wrong = 0 }) => {
  const col = mixC(mixC("#fff8e0", "#ffffff", on), "#ffb0b0", wrong);
  const sw = 7;
  const s = { stroke: col, strokeWidth: sw, strokeLinecap: "round" as const, strokeLinejoin: "round" as const, fill: "none" };
  const glyphs = [
    <path key={0} d={NOTE_PATH} fill={col} transform="translate(-10 26) scale(0.85)" />,
    <g key={1} transform="translate(0 4)">
      <path d="M -22 14 a 10 7 -25 1 0 18 -4 L -4 -26 L 26 -34 L 26 6 M 26 6 a 10 7 -25 1 1 -18 4" {...s} fill="none" />
      <ellipse cx={-14} cy={12} rx={11} ry={8} fill={col} transform="rotate(-25 -14 12)" />
      <ellipse cx={16} cy={4} rx={11} ry={8} fill={col} transform="rotate(-25 16 4)" />
    </g>,
    <g key={2}>
      <path d="M -10 -30 L -14 30 M 12 -34 L 8 26 M -26 -6 L 28 -16 M -28 14 L 26 4" {...s} />
    </g>,
    <g key={3}>
      <path d="M 0 -30 C 24 -30 26 -4 0 6 C -26 16 -20 40 4 36 M 0 -30 C -16 -30 -18 -12 -4 -8" {...s} />
      <circle cx={4} cy={36} r={6} fill={col} />
    </g>,
    <g key={4}>
      <path d="M -12 -34 L -12 26 C 8 18 24 8 22 -4 C 20 -16 4 -16 -12 -4" {...s} />
    </g>,
  ];
  return (
    <g transform={`translate(${x} ${y}) scale(${scale})`} opacity={0.75 + on * 0.25}>
      {glyphs[i]}
    </g>
  );
};

// ---------- Kiko's invisible piano: you can only see where it isn't ----------
export const InvisiblePiano: React.FC<{ x: number; y: number; scale: number; on: number; g: number }> = ({ x, y, scale, on, g }) => {
  if (on <= 0.01) return null;
  return (
    <g transform={`translate(${x} ${y}) scale(${scale})`} opacity={on * 0.55}>
      <rect x={-170} y={-40} width={340} height={80} rx={10} fill="none" stroke="#ffffff" strokeWidth={4} strokeDasharray="10 12" />
      {Array.from({ length: 9 }, (_, i) => (
        <line key={i} x1={-170 + (i + 1) * 34} x2={-170 + (i + 1) * 34} y1={-40} y2={40} stroke="#ffffff" strokeWidth={3} strokeDasharray="6 10" />
      ))}
      {[0, 1, 3, 4, 5, 7, 8].map((i) => (
        <rect key={i} x={-170 + (i + 1) * 34 - 9} y={-40} width={18} height={44} fill="#ffffff" opacity={0.4} />
      ))}
      {/* tiny "pressed" sparkles where his fingers land */}
      {[0, 1, 2].map((k) => {
        const ph = (g / 4 + k * 2.1) % 6;
        return ph < 1 ? <path key={k} d={star4(10)} transform={`translate(${-100 + k * 90 + Math.sin(g + k) * 20} -50)`} fill="#ffffff" opacity={1 - ph} /> : null;
      })}
    </g>
  );
};

// ---------- the clap that makes no sound ----------
export const SilentClap: React.FC<{ x: number; y: number; scale: number; on: number; g: number }> = ({ x, y, scale, on, g }) => {
  if (on <= 0.01) return null;
  const k = (g % 10) / 10;
  return (
    <g transform={`translate(${x} ${y}) scale(${scale})`} opacity={on}>
      {[-1, 1].map((s) =>
        [0, 1, 2].map((i) => (
          <line key={`${s}${i}`} x1={s * (30 + k * 20)} y1={-20 + i * 20} x2={s * (60 + k * 30)} y2={-30 + i * 24} stroke="#ffffff" strokeWidth={6} strokeLinecap="round" opacity={0.8 * (1 - k)} />
        )),
      )}
    </g>
  );
};

// ---------- the giant banana drum (Bobo sits on it). Draw `back`, then Bobo, then `front` ----------
export const GiantDrum: React.FC<{ x: number; y: number; scale: number; g: number; layer: "back" | "front"; hit?: number; alive?: number }> = ({ x, y, scale, g, layer, hit = 0, alive = 1 }) => {
  const W = 300; // half-width
  const H = 400; // height
  const ry = 70;
  const wob = Math.sin(g * 1.9) * 18 * hit;
  const body = mixC("#c8b890", "#ffe070", alive);
  if (layer === "back") {
    return (
      <g transform={`translate(${x} ${y}) scale(${scale})`}>
        <ellipse cx={0} cy={8} rx={W * 1.05} ry={46} fill="url(#shadow)" />
        {/* the top: a cream drum skin with a ring */}
        <ellipse cx={0} cy={-H} rx={W + 12} ry={ry + 6} fill="#c88a10" />
        <ellipse cx={0} cy={-H + 4 * hit} rx={W} ry={ry + wob * 0.2} fill="url(#drumSkin)" />
        {hit > 0.02 &&
          [0, 1, 2].map((i) => {
            const k = ((g / 6 + i / 3) % 1) * hit;
            return <ellipse key={i} cx={0} cy={-H + 4} rx={W * (0.2 + k * 0.8)} ry={ry * (0.2 + k * 0.8)} fill="none" stroke="#d8b890" strokeWidth={4} opacity={1 - k} />;
          })}
        <g transform={`translate(0 ${-H}) scale(1 0.24)`} opacity={0.75}>
          <path d="M -120 40 Q 0 120 120 40 Q 0 90 -120 40 Z" fill="#ffd040" stroke="#8a5a10" strokeWidth={8} />
        </g>
      </g>
    );
  }
  return (
    <g transform={`translate(${x} ${y}) scale(${scale})`}>
      <path d={`M ${-W} ${-H} L ${-W} ${-ry * 0.1} A ${W} ${ry} 0 0 0 ${W} ${-ry * 0.1} L ${W} ${-H} A ${W} ${ry} 0 0 1 ${-W} ${-H} Z`} fill="url(#drumBody)" stroke="#9a6a08" strokeWidth={5} style={{ fill: alive < 1 ? body : undefined }} />
      {/* golden rims */}
      <path d={`M ${-W - 6} ${-H} A ${W + 6} ${ry + 6} 0 0 0 ${W + 6} ${-H}`} stroke="#c8460a" strokeWidth={30} fill="none" />
      <path d={`M ${-W - 6} ${-24} A ${W + 6} ${ry + 6} 0 0 0 ${W + 6} ${-24}`} stroke="#c8460a" strokeWidth={30} fill="none" />
      {/* zig-zag ropes */}
      <path d={Array.from({ length: 13 }, (_, i) => `${i ? "L" : "M"} ${-W + (i * 2 * W) / 12} ${i % 2 ? -60 : -H + 30}`).join(" ")} stroke="#fff4d0" strokeWidth={8} fill="none" strokeLinejoin="round" transform={`translate(0 ${ry * 0.55})`} />
      {/* the banana emblem */}
      <g transform={`translate(0 ${-H / 2 + 20}) rotate(-12)`}>
        <circle r={78} fill="#7a3a8a" stroke="#ffffff" strokeWidth={6} />
        <path d="M -50 -6 Q 0 70 52 -16 Q 0 32 -50 -6 Z" fill="#ffd83a" stroke="#6a4a08" strokeWidth={6} strokeLinejoin="round" />
        <path d="M 52 -16 l 12 -14" stroke="#6a4a08" strokeWidth={8} strokeLinecap="round" />
      </g>
      {hit > 0.02 && (
        <g opacity={hit}>
          {[0, 1, 2].map((i) => {
            const k = (g / 8 + i / 3) % 1;
            return <ellipse key={i} cx={0} cy={-H / 2} rx={W * (1.1 + k * 1.6)} ry={H * (0.7 + k * 1.1)} fill="none" stroke="#ffffff" strokeWidth={10 - k * 8} opacity={(1 - k) * 0.8} />;
          })}
        </g>
      )}
    </g>
  );
};

// ---------- a pile of soft cushions (Draco lands in it). Draw `back`, Draco, `front` ----------
export const Cushions: React.FC<{ x: number; y: number; scale: number; g: number; layer: "back" | "front"; squish?: number }> = ({ x, y, scale, g, layer, squish = 0 }) => {
  const cush = (cx: number, cy: number, w: number, h: number, col: string, rot: number, k: number) => (
    <g key={`${cx}${cy}`} transform={`translate(${cx} ${cy}) rotate(${rot}) scale(${1 + squish * 0.12} ${1 - squish * 0.18})`}>
      <path d={`M ${-w} 0 Q ${-w - 14} ${-h} ${-w * 0.2} ${-h - 10} Q ${w * 0.2} ${-h - 18} ${w} ${-h + 4} Q ${w + 16} ${-h * 0.4} ${w} 0 Q 0 ${16} ${-w} 0 Z`} fill={col} stroke={shade(col, -0.35)} strokeWidth={4} />
      <circle cx={0} cy={-h / 2} r={7} fill={shade(col, -0.25)} />
      <path d={`M ${w} 0 l 10 18 M ${-w} 0 l -10 18`} stroke="#f2c040" strokeWidth={6} strokeLinecap="round" />
      <ellipse cx={-w * 0.4} cy={-h * 0.7} rx={w * 0.3} ry={h * 0.14} fill="#ffffff" opacity={0.35 + 0.05 * Math.sin(g / 7 + k)} />
    </g>
  );
  return (
    <g transform={`translate(${x} ${y}) scale(${scale})`}>
      {layer === "back" ? (
        <>
          <ellipse cx={0} cy={6} rx={300} ry={36} fill="url(#shadow)" />
          {cush(-120, -110, 120, 100, "#b49aff", -14, 1)}
          {cush(110, -120, 130, 110, "#7ad8c0", 12, 2)}
          {cush(0, -170, 120, 90, "#ffd36a", 4, 3)}
        </>
      ) : (
        <>
          {cush(-150, 0, 150, 110, "#ff8ac8", -6, 4)}
          {cush(140, 0, 150, 100, "#ffb07a", 6, 5)}
          {cush(0, 10, 140, 90, "#9ad0ff", 0, 6)}
        </>
      )}
    </g>
  );
};

/** a single cushion sitting on someone's head */
export const HeadCushion: React.FC<{ x: number; y: number; scale: number; rot?: number }> = ({ x, y, scale, rot = 0 }) => (
  <g transform={`translate(${x} ${y}) scale(${scale}) rotate(${rot})`}>
    <path d="M -90 0 Q -100 -60 -20 -66 Q 20 -72 90 -56 Q 104 -24 90 0 Q 0 14 -90 0 Z" fill="#ffd36a" stroke="#b8920a" strokeWidth={4} />
    <circle cx={0} cy={-32} r={6} fill="#d8a820" />
    <path d="M 90 0 l 12 16 M -90 0 l -12 16" stroke="#f2c040" strokeWidth={6} strokeLinecap="round" />
  </g>
);

/** feathers / fluff flying out of the cushions */
export const Fluff: React.FC<{ x: number; y: number; scale: number; age: number }> = ({ x, y, scale, age }) => {
  if (age <= 0 || age >= 1) return null;
  return (
    <g transform={`translate(${x} ${y}) scale(${scale})`} opacity={1 - age}>
      {Array.from({ length: 10 }, (_, i) => {
        const a = (i / 10) * Math.PI * 2;
        const r = 80 + age * 260;
        return <ellipse key={i} cx={Math.cos(a) * r} cy={Math.sin(a) * r * 0.6 - age * 120 + age * age * 160} rx={14} ry={6} transform={`rotate(${i * 40 + age * 200} ${Math.cos(a) * r} ${Math.sin(a) * r * 0.6})`} fill={["#ffffff", "#ffe0f0", "#fff6c8"][i % 3]} />;
      })}
    </g>
  );
};

// ---------- Draco's conductor's baton ----------
export const Baton: React.FC<{ x: number; y: number; scale: number; angle: number; sparkle?: number; g: number }> = ({ x, y, scale, angle, sparkle = 0, g }) => (
  <g transform={`translate(${x} ${y}) scale(${scale}) rotate(${angle})`}>
    <line x1={0} y1={0} x2={0} y2={-150} stroke="#fffaf0" strokeWidth={7} strokeLinecap="round" />
    <ellipse cx={0} cy={6} rx={9} ry={14} fill="#8a4a20" />
    {sparkle > 0.01 && <path d={star4(18 + Math.sin(g) * 5)} transform="translate(0 -156)" fill="#fff6b0" opacity={sparkle} />}
  </g>
);

/** blast lines from a trumpet toot */
export const TootBlast: React.FC<{ x: number; y: number; scale: number; dir: number; age: number }> = ({ x, y, scale, dir, age }) => {
  if (age <= 0 || age >= 1) return null;
  return (
    <g transform={`translate(${x} ${y}) scale(${scale * dir} ${scale})`} opacity={1 - age}>
      {[-1, 0, 1].map((i) => (
        <line key={i} x1={20 + age * 40} y1={i * 26} x2={90 + age * 120} y2={i * 46} stroke="#fff6c0" strokeWidth={9} strokeLinecap="round" />
      ))}
      <GlowNote x={130 + age * 140} y={-40 - age * 40} scale={0.9} color={NOTE_GOLD} glow={0.5} rot={20} />
    </g>
  );
};

/** shock rings from the drum BOOM */
export const BoomRings: React.FC<{ x: number; y: number; scale: number; age: number }> = ({ x, y, scale, age }) => {
  if (age <= 0 || age >= 1) return null;
  return (
    <g transform={`translate(${x} ${y}) scale(${scale})`}>
      {[0, 0.18, 0.36].map((d, i) => {
        const k = Math.max(0, Math.min(1, (age - d) / (1 - d)));
        if (k <= 0) return null;
        return <ellipse key={i} cx={0} cy={0} rx={200 + k * 1500} ry={90 + k * 650} fill="none" stroke="#fff6dc" strokeWidth={22 * (1 - k) + 2} opacity={(1 - k) * 0.85} />;
      })}
      <text x={0} y={-260 - age * 120} textAnchor="middle" fontSize={190 + age * 80} fontWeight={800} fill="#ffe070" stroke="#a8580a" strokeWidth={10} paintOrder="stroke" opacity={Math.min(1, (1 - age) * 2.5)} style={{ fontFamily: "Fredoka" }} transform={`rotate(${-6 + Math.sin(age * 30) * 3})`}>
        BOOM!
      </text>
    </g>
  );
};

// ---------- the tiny golden banana music box ----------
export const BananaBox: React.FC<{ x: number; y: number; scale: number; g: number; open: number; dance?: number; rot?: number }> = ({ x, y, scale, g, open, dance = 0, rot = 0 }) => (
  <g transform={`translate(${x} ${y}) scale(${scale}) rotate(${rot})`}>
    {/* the little banana dancer pops out */}
    {open > 0.05 && (
      <g transform={`translate(0 ${-40 - open * 70}) rotate(${Math.sin(g / 2.2) * 22 * dance}) scale(${open})`}>
        <path d="M -24 0 Q -30 -60 6 -90 Q -6 -50 18 0 Z" fill="#ffd83a" stroke="#8a6a08" strokeWidth={5} strokeLinejoin="round" />
        <circle cx={-6} cy={-46} r={5} fill="#3a2a10" />
        <circle cx={8} cy={-44} r={5} fill="#3a2a10" />
        <path d="M -8 -30 Q 2 -22 10 -30" stroke="#3a2a10" strokeWidth={4} strokeLinecap="round" fill="none" />
        <path d="M 6 -90 l 6 -12" stroke="#6a4a08" strokeWidth={6} strokeLinecap="round" />
        <path d={`M -26 -20 l ${-20 - Math.sin(g / 2) * 10} ${-12} M 18 -20 l ${20 + Math.sin(g / 2) * 10} ${-12}`} stroke="#8a6a08" strokeWidth={5} strokeLinecap="round" />
      </g>
    )}
    {/* the banana-shaped box */}
    <path d="M -110 -30 Q -60 30 0 30 Q 60 30 110 -30 Q 70 -10 0 -10 Q -70 -10 -110 -30 Z" fill="url(#goldBox)" stroke="#9a6a08" strokeWidth={5} strokeLinejoin="round" />
    <path d="M -110 -30 Q -60 30 0 30 Q 60 30 110 -30 L 104 -6 Q 60 54 0 56 Q -60 54 -104 -6 Z" fill="#d8a020" stroke="#9a6a08" strokeWidth={5} strokeLinejoin="round" />
    <path d="M 110 -30 l 18 -18" stroke="#6a4a08" strokeWidth={10} strokeLinecap="round" />
    <circle cx={0} cy={26} r={9} fill="#ff8ac8" stroke="#9a6a08" strokeWidth={3} />
    {/* the lid */}
    <g transform={`translate(-104 -26) rotate(${-open * 75})`}>
      <path d="M 0 0 Q 50 -30 104 -24 Q 158 -30 214 -4 Q 160 -50 104 -50 Q 48 -50 0 0 Z" fill="url(#goldBox)" stroke="#9a6a08" strokeWidth={5} strokeLinejoin="round" />
    </g>
  </g>
);

/** a rumbling tummy ring for Bobo's stomach */
export const TummyWaves: React.FC<{ x: number; y: number; scale: number; on: number; g: number }> = ({ x, y, scale, on, g }) => {
  if (on <= 0.01) return null;
  return (
    <g transform={`translate(${x} ${y}) scale(${scale})`} opacity={on}>
      {[0, 1, 2].map((i) => {
        const k = (g / 7 + i / 3) % 1;
        return <path key={i} d={`M ${-60 - k * 60} ${-30 - k * 20} Q ${-90 - k * 70} 0 ${-60 - k * 60} ${30 + k * 20} M ${60 + k * 60} ${-30 - k * 20} Q ${90 + k * 70} 0 ${60 + k * 60} ${30 + k * 20}`} stroke="#ffe8a0" strokeWidth={8 - k * 5} strokeLinecap="round" fill="none" opacity={1 - k} />;
      })}
      <text x={0} y={-90} textAnchor="middle" fontSize={64} fontWeight={700} fill="#fff2c8" stroke="#7a4a10" strokeWidth={6} paintOrder="stroke" style={{ fontFamily: "Fredoka" }} transform={`rotate(${Math.sin(g / 2) * 6})`}>
        GRRRUMBLE
      </text>
    </g>
  );
};

/** a dotted "nothing" echo that drifts away: "Hello-o!" with no answer */
export const NoEcho: React.FC<{ x: number; y: number; on: number; age: number }> = ({ x, y, on, age }) => {
  if (on <= 0.01) return null;
  return (
    <g transform={`translate(${x + age * 260} ${y - age * 60})`} opacity={on * (1 - age)}>
      <text x={0} y={0} textAnchor="middle" fontSize={54} fontWeight={600} fill="#ffffff" stroke="#5a4a7a" strokeWidth={5} paintOrder="stroke" style={{ fontFamily: "Fredoka" }} opacity={0.85}>
        ...
      </text>
    </g>
  );
};
