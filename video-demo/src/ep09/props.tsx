import React from "react";
import { random } from "remotion";
import { Sparkle } from "../story/scenery";

// Episode 9 characters and props in the series' 2D style, drawn over the 3D desert.

export const Ep9Defs: React.FC<{ lit?: number }> = ({ lit = 1 }) => {
  // Warm golden desert light on the 2D characters
  const k = Math.max(0.7, Math.min(1.15, lit));
  return (
    <>
      <filter id="desertLit" colorInterpolationFilters="sRGB" x="-20%" y="-20%" width="140%" height="140%">
        <feColorMatrix type="matrix" values={`${1.03 * k} 0 0 0 0.03  0 ${0.99 * k} 0 0 0.015  0 0 ${0.9 * k} 0 0  0 0 0 1 0`} />
      </filter>
      <radialGradient id="zuzuFur" cx="40%" cy="30%" r="78%">
        <stop offset="0%" stopColor="#ffdc98" />
        <stop offset="60%" stopColor="#f0b860" />
        <stop offset="100%" stopColor="#cf8f3e" />
      </radialGradient>
      <radialGradient id="zuzuCream" cx="45%" cy="35%" r="70%">
        <stop offset="0%" stopColor="#fffaf0" />
        <stop offset="100%" stopColor="#fbe6c4" />
      </radialGradient>
      <radialGradient id="zuzuIris" cx="45%" cy="38%" r="62%">
        <stop offset="0%" stopColor="#ffe08a" />
        <stop offset="45%" stopColor="#f5a623" />
        <stop offset="100%" stopColor="#a8560a" />
      </radialGradient>
      <linearGradient id="zuzuEarIn" x1="0" y1="1" x2="0" y2="0">
        <stop offset="0%" stopColor="#ffc8a8" />
        <stop offset="100%" stopColor="#ff9f86" />
      </linearGradient>
      <linearGradient id="zuzuScarf" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#ff4a4a" />
        <stop offset="100%" stopColor="#c81f2c" />
      </linearGradient>
      <radialGradient id="sunGlow" cx="50%" cy="50%" r="50%">
        <stop offset="0%" stopColor="#fffbe8" stopOpacity="1" />
        <stop offset="35%" stopColor="#ffd36a" stopOpacity="0.7" />
        <stop offset="100%" stopColor="#ffb020" stopOpacity="0" />
      </radialGradient>
      <linearGradient id="goldBody" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stopColor="#fff4b0" />
        <stop offset="45%" stopColor="#ffcc3a" />
        <stop offset="100%" stopColor="#c8860c" />
      </linearGradient>
      <linearGradient id="sandMound" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#f2c884" />
        <stop offset="100%" stopColor="#d49a52" />
      </linearGradient>
      <linearGradient id="cactusG" x1="0" y1="0" x2="1" y2="0">
        <stop offset="0%" stopColor="#3f9a4a" />
        <stop offset="50%" stopColor="#6fcf6a" />
        <stop offset="100%" stopColor="#2f7a3a" />
      </linearGradient>
      <linearGradient id="mirageG" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#fff6a0" />
        <stop offset="100%" stopColor="#ffc840" />
      </linearGradient>
    </>
  );
};

// ---------- Zuzu, the little fennec fox. Standing, facing forward, (0, 0) at his feet;
// about 330 tall at scale 1 without his ears, 520 with them ----------
export type ZuzuMood = "happy" | "joy" | "sly" | "surprised" | "excited" | "neutral" | "wink";

export const Zuzu: React.FC<{
  x: number;
  y: number;
  scale?: number;
  g: number;
  look?: { x: number; y: number };
  mood?: ZuzuMood;
  mouth?: number;
  blink?: number;
  armL?: number; // positive raises his left (screen-left) arm
  armR?: number; // negative raises his right arm
  legs?: number; // 0 standing .. 1 tucked (jumping)
  squash?: number;
  lean?: number;
  headTilt?: number;
  headTurn?: number; // -1..1 a quick "no" shake shifts the face
  earL?: number; // extra ear angles (twitching, swiveling)
  earR?: number;
  tailWag?: number;
  scarfWind?: number;
}> = ({ x, y, scale = 1, g, look = { x: 0, y: 0 }, mood = "happy", mouth = 0, blink = 1, armL = 12, armR = -12, legs = 0, squash = 1, lean = 0, headTilt = 0, headTurn = 0, earL = 0, earR = 0, tailWag = 0.8, scarfWind = 1 }) => {
  const talking = mouth > 0.06;
  const sly = mood === "sly";
  const big = mood === "surprised" || mood === "excited" ? 1.1 : 1;
  const wag = Math.sin(g / 5) * 12 * tailWag;
  const twitchL = Math.max(0, Math.sin(g / 23 + 1) - 0.92) * 120;
  const twitchR = Math.max(0, Math.sin(g / 19 + 3) - 0.93) * 120;
  const fx = headTurn * 18;
  const eye = (side: -1 | 1) => {
    const cx = side * 38 + fx;
    if ((mood === "joy" && !talking && blink > 0.5) || (mood === "wink" && side === 1)) {
      return <path key={side} d={`M ${cx - 20} 0 Q ${cx} -22 ${cx + 20} 0`} stroke="#4a2408" strokeWidth={7} strokeLinecap="round" fill="none" />;
    }
    const lid = sly ? 0.26 : 0;
    return (
      <g key={side} transform={`translate(${cx} -4) scale(${big} ${big * blink})`}>
        <ellipse rx={26} ry={31} fill="#fff" stroke="#c8925a" strokeWidth={2} />
        <g transform={`translate(${look.x * 7 + headTurn * 4} ${look.y * 8})`}>
          <circle r={20} fill="url(#zuzuIris)" />
          <circle r={9.5} fill="#2a1406" />
          <circle cx={-7} cy={-8} r={7} fill="#fff" />
          <circle cx={6} cy={7} r={3} fill="#fff" opacity={0.9} />
        </g>
        {lid > 0 && <path d={`M -29 -34 L 29 -34 L 29 ${-31 + lid * 62} Q 0 ${-24 + lid * 62} -29 ${-31 + lid * 62} Z`} fill="url(#zuzuFur)" />}
        {/* lashes */}
        <path d={`M ${side * 14} ${sly ? -31 + lid * 62 - 2 : -30} q ${side * 12} -4 ${side * 20} -14`} stroke="#4a2408" strokeWidth={4} strokeLinecap="round" fill="none" />
      </g>
    );
  };
  const brow = (side: -1 | 1) => {
    const raised = sly && side === -1;
    const by = mood === "surprised" || mood === "excited" || raised ? -50 : -42;
    return <path key={side} d={`M ${side * 38 - 13 + fx} ${by} Q ${side * 38 + fx} ${by - 8} ${side * 38 + 13 + fx} ${by}`} transform={`rotate(${sly && side === 1 ? 14 : 0} ${side * 38 + fx} ${by})`} stroke="#a8692a" strokeWidth={5} strokeLinecap="round" fill="none" />;
  };
  const mouthShape = talking ? (
    <g>
      <path d={`M ${-12 + fx} 40 Q ${fx} 36 ${12 + fx} 40 Q ${10 + fx} ${44 + mouth * 13} ${fx} ${46 + mouth * 15} Q ${-10 + fx} ${44 + mouth * 13} ${-12 + fx} 40 Z`} fill="#6a2018" />
      <ellipse cx={fx} cy={43 + mouth * 10} rx={6} ry={2.4 + mouth * 2.4} fill="#ff8f8f" />
    </g>
  ) : sly ? (
    <path d={`M ${-16 + fx} 36 Q ${-2 + fx} 52 ${18 + fx} 30`} stroke="#5a2a10" strokeWidth={5} strokeLinecap="round" fill="none" />
  ) : mood === "surprised" ? (
    <ellipse cx={fx} cy={44} rx={7} ry={9} fill="#6a2018" />
  ) : mood === "joy" || mood === "excited" || mood === "wink" ? (
    <path d={`M ${-16 + fx} 36 Q ${fx} 58 ${16 + fx} 36 Z`} fill="#6a2018" stroke="#6a2018" strokeWidth={3} strokeLinejoin="round" />
  ) : mood === "neutral" ? (
    <path d={`M ${-9 + fx} 42 L ${9 + fx} 42`} stroke="#5a2a10" strokeWidth={4.5} strokeLinecap="round" />
  ) : (
    <path d={`M ${-14 + fx} 37 Q ${-7 + fx} 46 ${fx} 38 Q ${7 + fx} 46 ${14 + fx} 37`} stroke="#5a2a10" strokeWidth={4.5} strokeLinecap="round" fill="none" />
  );
  const ear = (side: -1 | 1, extra: number, tw: number) => (
    <g key={side} transform={`translate(${side * 54} -58) rotate(${side * 24 + extra + side * Math.sin(g / 15 + side) * 2 - side * tw})`}>
      <path d="M -50 22 C -54 -80 -26 -170 0 -205 C 26 -170 54 -80 50 22 Z" fill="url(#zuzuFur)" stroke="#c88a40" strokeWidth={3} strokeLinejoin="round" />
      <path d="M -32 10 C -34 -66 -16 -136 0 -168 C 16 -136 34 -66 32 10 Z" fill="url(#zuzuEarIn)" />
      <path d="M -14 0 C -14 -50 -6 -96 0 -120 M 14 0 C 14 -50 6 -96 0 -120" stroke="#fff3e6" strokeWidth={5} strokeLinecap="round" fill="none" opacity={0.85} />
      <path d="M -10 -186 C -5 -196 0 -205 0 -205 C 0 -205 5 -196 10 -186 Z" fill="#b8742e" />
    </g>
  );
  const arm = (side: -1 | 1, angle: number) => (
    <g transform={`translate(${side * 44} -150) rotate(${angle})`}>
      <rect x={-12} y={-6} width={24} height={86} rx={12} fill="url(#zuzuFur)" stroke="#d29a52" strokeWidth={2} />
      <ellipse cx={0} cy={82} rx={15} ry={13} fill="#c98a44" />
    </g>
  );
  const leg = (side: -1 | 1) => (
    <g transform={`translate(${side * 24} ${-62 + legs * 22}) rotate(${side * legs * -50})`}>
      <rect x={-14} y={0} width={28} height={58 - legs * 16} rx={14} fill="url(#zuzuFur)" stroke="#d29a52" strokeWidth={2} />
      <ellipse cx={side * 5} cy={58 - legs * 16} rx={20} ry={11} fill="#c98a44" />
    </g>
  );
  const sw = Math.sin(g / 4) * 10 * scarfWind;
  return (
    <g transform={`translate(${x} ${y}) scale(${scale}) rotate(${lean}) scale(${1 / Math.sqrt(squash)} ${squash})`}>
      <ellipse cx={0} cy={4} rx={74} ry={13} fill="url(#shadow)" opacity={1 - legs * 0.6} />
      {/* the small fluffy tail */}
      <g transform={`translate(34 -64) rotate(${-24 + wag})`}>
        <path d="M 0 0 C 40 -6 76 -40 70 -86 C 66 -110 40 -112 34 -94 C 42 -60 28 -30 -6 -20 Z" fill="url(#zuzuFur)" stroke="#c88a40" strokeWidth={3} strokeLinejoin="round" />
        <path d="M 70 -86 C 66 -110 40 -112 34 -94 C 44 -84 56 -80 70 -86 Z" fill="#fff6e6" />
      </g>
      {leg(-1)}
      {leg(1)}
      {arm(-1, armL)}
      {arm(1, armR)}
      <ellipse cx={0} cy={-108} rx={56} ry={66} fill="url(#zuzuFur)" stroke="#d29a52" strokeWidth={2} />
      <ellipse cx={0} cy={-98} rx={34} ry={44} fill="url(#zuzuCream)" />
      {/* the tiny red desert scarf */}
      <g>
        <path d={`M 16 -176 C 40 -168 ${56 + sw} -150 ${74 + sw * 1.4} -136 L ${62 + sw * 1.3} -124 C ${48 + sw} -138 32 -150 10 -160 Z`} fill="url(#zuzuScarf)" stroke="#9a1420" strokeWidth={2} strokeLinejoin="round" />
        <rect x={-50} y={-188} width={100} height={26} rx={13} fill="url(#zuzuScarf)" stroke="#9a1420" strokeWidth={2} />
        <path d="M -40 -176 L 40 -176" stroke="#ffd36a" strokeWidth={3} strokeDasharray="6 8" opacity={0.85} />
        <circle cx={18} cy={-172} r={11} fill="#e52a35" stroke="#9a1420" strokeWidth={2} />
      </g>
      {/* head */}
      <g transform={`translate(0 -262) rotate(${headTilt})`}>
        {ear(-1, earL, twitchL)}
        {ear(1, earR, twitchR)}
        {[-1, 1].map((sd) => (
          <path key={sd} d={`M ${sd * 72} -6 L ${sd * 110} 26 L ${sd * 82} 28 L ${sd * 100} 50 L ${sd * 64} 44 Z`} fill="url(#zuzuFur)" stroke="#d29a52" strokeWidth={2} strokeLinejoin="round" />
        ))}
        <ellipse rx={92} ry={80} fill="url(#zuzuFur)" stroke="#d29a52" strokeWidth={2.5} />
        {/* the cream mask around his eyes and muzzle */}
        <path d={`M ${-70 + fx} 6 C ${-66 + fx} -30 ${-30 + fx} -36 ${fx} -14 C ${30 + fx} -36 ${66 + fx} -30 ${70 + fx} 6 C ${66 + fx} 50 ${30 + fx} 70 ${fx} 70 C ${-30 + fx} 70 ${-66 + fx} 50 ${-70 + fx} 6 Z`} fill="url(#zuzuCream)" />
        <ellipse cx={-60 + fx} cy={26} rx={15} ry={9} fill="#ffa08a" opacity={0.6} />
        <ellipse cx={60 + fx} cy={26} rx={15} ry={9} fill="#ffa08a" opacity={0.6} />
        {eye(-1)}
        {eye(1)}
        {brow(-1)}
        {brow(1)}
        <ellipse cx={fx} cy={22} rx={11} ry={8} fill="#2a1406" />
        <ellipse cx={-3 + fx} cy={19} rx={4} ry={2.4} fill="#fff" opacity={0.7} />
        {[-1, 1].map((sd) => (
          <g key={sd} stroke="#a8692a" strokeWidth={2.2} strokeLinecap="round" opacity={0.8}>
            <path d={`M ${sd * 30 + fx} 34 L ${sd * 74 + fx} 26`} />
            <path d={`M ${sd * 30 + fx} 40 L ${sd * 76 + fx} 42`} />
          </g>
        ))}
        {mouthShape}
      </g>
    </g>
  );
};

// Where Zuzu's paws are (side 1 = his right, on screen right)
export const zuzuHand = (x: number, y: number, scale: number, angle: number, side: -1 | 1 = 1) => {
  const a = (angle * Math.PI) / 180;
  return { x: x + (side * 44 - 84 * Math.sin(a)) * scale, y: y + (-150 + 84 * Math.cos(a)) * scale };
};

// ---------- sand ----------
// A mound of sand drawn in front of something half-buried. (x, y) is its base center.
export const SandMound: React.FC<{ x: number; y: number; w: number; h: number; seed?: number }> = ({ x, y, w, h, seed = 1 }) => (
  <g>
    <path d={`M ${x - w} ${y + 6} C ${x - w * 0.6} ${y - h * 0.4} ${x - w * 0.35} ${y - h} ${x} ${y - h} C ${x + w * 0.35} ${y - h} ${x + w * 0.6} ${y - h * 0.4} ${x + w} ${y + 6} Z`} fill="url(#sandMound)" />
    {Array.from({ length: 22 }, (_, i) => (
      <circle key={i} cx={x + (random(`m${seed}${i}`) - 0.5) * w * 1.4} cy={y - random(`n${seed}${i}`) * h * 0.6} r={2 + random(`r${seed}${i}`) * 3} fill={i % 2 ? "#fff0c8" : "#b88044"} opacity={0.6} />
    ))}
  </g>
);

// A burst of sand grains from a point; f/at in frames
export const SandBurst: React.FC<{ f: number; at: number; x: number; y: number; scale: number; reach?: number; count?: number; life?: number; up?: number }> = ({ f, at, x, y, scale, reach = 260, count = 34, life = 26, up = 1 }) => {
  if (f < at || f > at + life) return null;
  const k = (f - at) / life;
  return (
    <g opacity={1 - k * k}>
      {Array.from({ length: count }, (_, i) => {
        const a = -Math.PI * (0.08 + 0.84 * random(`sa${i}`));
        const sp = (0.5 + random(`sb${i}`) * 0.6) * reach * scale;
        const px = x + Math.cos(a) * sp * k;
        const py = y + Math.sin(a) * sp * k * up + 900 * scale * k * k * 0.35;
        return <circle key={i} cx={px} cy={py} r={(4 + random(`sc${i}`) * 6) * scale} fill={i % 3 ? "#e8b870" : "#fff0c8"} />;
      })}
    </g>
  );
};

// A gust of sand streaming from one point to another; on 0..1
export const SandStream: React.FC<{ from: { x: number; y: number }; to: { x: number; y: number }; on: number; g: number; width?: number }> = ({ from, to, on, g, width = 80 }) => {
  if (on <= 0) return null;
  const dx = to.x - from.x;
  const dy = to.y - from.y;
  const len = Math.hypot(dx, dy);
  const nx = -dy / len;
  const ny = dx / len;
  return (
    <g opacity={Math.min(1, on * 2)}>
      {Array.from({ length: 90 }, (_, i) => {
        const k = (random(`k${i}`) + g * 0.07) % 1;
        const off = (random(`o${i}`) - 0.5) * width * (0.4 + k);
        const px = from.x + dx * k + nx * off;
        const py = from.y + dy * k + ny * off;
        return <circle key={i} cx={px} cy={py} r={3 + random(`r${i}`) * 5} fill={i % 3 ? "#f0c27a" : "#fff2cc"} opacity={0.85 * on} />;
      })}
      {[0, 1, 2].map((i) => {
        const k = (g * 0.05 + i / 3) % 1;
        const ox = nx * (i - 1) * width * 0.3;
        const oy = ny * (i - 1) * width * 0.3;
        return <path key={`w${i}`} d={`M ${from.x + dx * k + ox} ${from.y + dy * k + oy} l ${dx * 0.25} ${dy * 0.25}`} stroke="#fff6e0" strokeWidth={5} strokeLinecap="round" opacity={0.6 * on} />;
      })}
    </g>
  );
};

// Sand speckles all over Draco's face; amount 0..1
export const SandyFace: React.FC<{ x: number; y: number; scale: number; amount: number }> = ({ x, y, scale, amount }) => {
  if (amount <= 0) return null;
  return (
    <g transform={`translate(${x} ${y}) scale(${scale})`} opacity={amount}>
      {Array.from({ length: 40 }, (_, i) => (
        <circle key={i} cx={(random(`fx${i}`) - 0.5) * 190} cy={-228 + (random(`fy${i}`) - 0.5) * 150} r={2.5 + random(`fr${i}`) * 3.5} fill={i % 2 ? "#e0aa62" : "#f6d496"} />
      ))}
    </g>
  );
};

// A pile of sand on Draco's head, with grains still trickling; amount 0..1 (0 = gone)
export const SandPile: React.FC<{ x: number; y: number; scale: number; amount: number; g: number; trickle?: number }> = ({ x, y, scale, amount, g, trickle = 0 }) => {
  if (amount <= 0) return null;
  return (
    <g transform={`translate(${x} ${y}) scale(${scale})`}>
      <path d={`M -112 -282 C -96 ${-312 - 70 * amount} 96 ${-312 - 70 * amount} 112 -282 C 80 -262 -80 -262 -112 -282 Z`} fill="url(#sandMound)" />
      {Array.from({ length: 14 }, (_, i) => (
        <circle key={i} cx={(random(`px${i}`) - 0.5) * 180} cy={-300 - random(`py${i}`) * 50 * amount} r={3 + random(`pr${i}`) * 3} fill={i % 2 ? "#fff0c8" : "#b88044"} opacity={0.7} />
      ))}
      {trickle > 0 &&
        [-1, 1].map((sd) =>
          Array.from({ length: 8 }, (_, i) => {
            const k = (g * 0.09 + i / 8) % 1;
            return <circle key={`${sd}${i}`} cx={sd * (104 + k * 10)} cy={-280 + k * 150} r={4} fill="#e8b870" opacity={trickle * (1 - k)} />;
          }),
        )}
    </g>
  );
};

// A stream of sand pouring down from above onto (x, y); on 0..1
export const SandFall: React.FC<{ x: number; top: number; y: number; on: number; g: number; width: number }> = ({ x, top, y, on, g, width }) => {
  if (on <= 0) return null;
  return (
    <g opacity={on}>
      <path d={`M ${x - width * 0.3} ${top} L ${x + width * 0.3} ${top} L ${x + width * 0.5} ${y} L ${x - width * 0.5} ${y} Z`} fill="#e8b870" opacity={0.55} />
      {Array.from({ length: 50 }, (_, i) => {
        const k = (random(`fk${i}`) + g * 0.08) % 1;
        return <circle key={i} cx={x + (random(`fo${i}`) - 0.5) * width * (0.6 + k * 0.4)} cy={top + (y - top) * k} r={3 + random(`fr${i}`) * 4} fill={i % 3 ? "#e8b870" : "#fff0c8"} />;
      })}
    </g>
  );
};

// ---------- Bobo's comic overlays (drawn with the same body transform as Bobo) ----------
const boboT = (x: number, y: number, scale: number, lean = 0, squash = 1) => `translate(${x} ${y}) scale(${scale}) rotate(${lean}) scale(${1 / Math.sqrt(squash)} ${squash})`;

// Singed, frizzy fur after the fireball: tufts, soot smudges and a little curl of smoke
export const BoboFrazzle: React.FC<{ x: number; y: number; scale: number; lean?: number; squash?: number; amount: number; g: number; smoke?: number }> = ({ x, y, scale, lean = 0, squash = 1, amount, g, smoke = 1 }) => {
  if (amount <= 0) return null;
  const tuft = (cx: number, cy: number, rot: number, s: number, i: number) => (
    <path key={i} d="M -18 0 L -10 -40 L -2 -8 L 6 -46 L 12 -6 L 22 -34 L 20 4 Z" transform={`translate(${cx} ${cy}) rotate(${rot + Math.sin(g / 3 + i) * 4}) scale(${s * amount})`} fill="#8a5a34" stroke="#5a361e" strokeWidth={3} strokeLinejoin="round" />
  );
  return (
    <g transform={boboT(x, y, scale, lean, squash)}>
      {tuft(-70, -372, -30, 1.1, 0)}
      {tuft(-34, -392, -12, 0.9, 1)}
      {tuft(40, -390, 14, 1.0, 2)}
      {tuft(78, -366, 34, 1.2, 3)}
      {tuft(-104, -300, -70, 0.9, 4)}
      {tuft(106, -298, 70, 0.9, 5)}
      <ellipse cx={-52} cy={-286} rx={22} ry={12} fill="#3a2a22" opacity={0.45 * amount} />
      <ellipse cx={58} cy={-342} rx={16} ry={9} fill="#3a2a22" opacity={0.4 * amount} />
      <ellipse cx={20} cy={-200} rx={26} ry={12} fill="#3a2a22" opacity={0.3 * amount} />
      {smoke > 0 &&
        [0, 1, 2].map((i) => {
          const k = (g / 40 + i / 3) % 1;
          return <circle key={i} cx={10 + Math.sin(k * 8 + i) * 16} cy={-420 - k * 140} r={10 + k * 22} fill="#9a96a8" opacity={(1 - k) * 0.6 * smoke * amount} />;
        })}
    </g>
  );
};

// Bobo's puckered "kiss the banana" lips, drawn over his mouth
export const BoboPucker: React.FC<{ x: number; y: number; scale: number; lean?: number; squash?: number; amount: number }> = ({ x, y, scale, lean = 0, squash = 1, amount }) => {
  if (amount <= 0) return null;
  return (
    <g transform={boboT(x, y, scale, lean, squash)} opacity={amount}>
      <ellipse cx={0} cy={-264} rx={30} ry={17} fill="#ecc69c" />
      <ellipse cx={0} cy={-258} rx={15 * amount} ry={13} fill="#ff7a8a" stroke="#c8405a" strokeWidth={3} />
      <path d="M -6 -258 Q 0 -262 6 -258" stroke="#c8405a" strokeWidth={2.5} fill="none" />
    </g>
  );
};

// Bobo's nose turned red from the cactus poke
export const RedNose: React.FC<{ x: number; y: number; scale: number; lean?: number; squash?: number; amount: number }> = ({ x, y, scale, lean = 0, squash = 1, amount }) => {
  if (amount <= 0) return null;
  return (
    <g transform={boboT(x, y, scale, lean, squash)} opacity={amount}>
      <circle cx={0} cy={-284} r={20} fill="#ff5f6a" />
      <circle cx={-6} cy={-290} r={6} fill="#fff" opacity={0.7} />
    </g>
  );
};

// Little rumble lines around Bobo's tummy
export const TummyRumble: React.FC<{ x: number; y: number; scale: number; on: number; g: number }> = ({ x, y, scale, on, g }) => {
  if (on <= 0) return null;
  return (
    <g transform={`translate(${x} ${y}) scale(${scale})`} opacity={on} stroke="#7a4a2a" strokeWidth={6} strokeLinecap="round" fill="none">
      {[-1, 1].map((sd) => (
        <g key={sd} transform={`translate(${sd * (118 + Math.sin(g * 1.3) * 5)} -140)`}>
          <path d={`M 0 -26 q ${sd * 14} 13 0 26`} />
          <path d={`M ${sd * 16} -40 q ${sd * 22} 40 0 80`} opacity={0.7} />
        </g>
      ))}
    </g>
  );
};

// ---------- the banana mirage and the cactus it really is. (x, y) at the base ----------
export const MirageTree: React.FC<{ x: number; y: number; scale: number; g: number; melt: number }> = ({ x, y, scale, g, melt }) => {
  if (melt >= 1) return null;
  const wob = (i: number) => Math.sin(g / 2.5 + i * 0.9) * (6 + melt * 40);
  return (
    <g transform={`translate(${x} ${y}) scale(${scale})`} opacity={(1 - melt) * (0.82 + 0.12 * Math.sin(g / 3))}>
      <ellipse cx={0} cy={-300} rx={260} ry={300} fill="url(#sunGlow)" opacity={0.45} />
      {/* trunk */}
      <path d={`M -22 0 C ${-30 + wob(1)} -120 ${-10 + wob(2)} -260 ${wob(3)} -380 L ${24 + wob(3)} -380 C ${18 + wob(2)} -260 ${30 + wob(1)} -120 26 0 Z`} fill="url(#mirageG)" />
      {/* leaves */}
      {[-150, -110, -60, -20, 30, 70].map((a, i) => (
        <path key={i} d="M 0 0 C 60 -40 150 -30 200 20 C 140 0 70 0 0 10 Z" transform={`translate(${wob(3)} -380) rotate(${a + Math.sin(g / 6 + i) * 5})`} fill="url(#mirageG)" opacity={0.9} />
      ))}
      {/* the bananas! */}
      {Array.from({ length: 7 }, (_, i) => (
        <path key={`b${i}`} d="M 0 0 C 16 30 18 70 4 100 C 24 72 30 30 14 -2 Z" transform={`translate(${wob(4) - 50 + i * 16} ${-372 + (i % 2) * 10}) rotate(${-30 + i * 10})`} fill="#ffe24a" stroke="#d0a010" strokeWidth={3} />
      ))}
      {/* heat-wave lines */}
      {[0, 1, 2, 3].map((i) => (
        <path key={`h${i}`} d={`M -200 ${-40 - i * 110} q 50 ${-18 + wob(i) * 0.3} 100 0 t 100 0 t 100 0 t 100 0`} stroke="#fff8d8" strokeWidth={5} fill="none" opacity={0.5} />
      ))}
    </g>
  );
};

// A saguaro whose arms curve exactly like bananas, with a smug little flower on top
export const BananaCactus: React.FC<{ x: number; y: number; scale: number; g: number; show: number; poke?: number }> = ({ x, y, scale, g, show, poke = 0 }) => {
  if (show <= 0) return null;
  const spines = (pts: [number, number, number][]) =>
    pts.map(([sx, sy, a], i) => <path key={i} d={`M ${sx} ${sy} l ${Math.cos(a) * 14} ${Math.sin(a) * 14}`} stroke="#fff8e0" strokeWidth={2.5} strokeLinecap="round" />);
  const sp: [number, number, number][] = [];
  for (let k = 0; k < 9; k++) {
    sp.push([-40, -40 - k * 44, Math.PI]);
    sp.push([40, -40 - k * 44, 0]);
  }
  return (
    <g transform={`translate(${x} ${y}) scale(${scale})`} opacity={show}>
      <ellipse cx={0} cy={6} rx={120} ry={16} fill="url(#shadow)" />
      {/* banana-curved arms */}
      <path d="M -36 -170 C -110 -170 -150 -230 -136 -330 C -134 -350 -104 -352 -104 -330 C -112 -260 -90 -214 -36 -214 Z" fill="url(#cactusG)" stroke="#2a6a30" strokeWidth={4} strokeLinejoin="round" />
      <path d="M 36 -250 C 110 -250 146 -300 132 -400 C 130 -420 100 -422 100 -400 C 108 -340 88 -294 36 -294 Z" fill="url(#cactusG)" stroke="#2a6a30" strokeWidth={4} strokeLinejoin="round" />
      <path d="M -136 -330 l -6 -20 M 132 -400 l 6 -20" stroke="#6a4a20" strokeWidth={8} strokeLinecap="round" />
      <rect x={-44} y={-440} width={88} height={440} rx={44} fill="url(#cactusG)" stroke="#2a6a30" strokeWidth={4} />
      {[-18, 0, 18].map((dx) => (
        <path key={dx} d={`M ${dx} -420 L ${dx} -10`} stroke="#2f8a3a" strokeWidth={4} opacity={0.6} />
      ))}
      {spines(sp)}
      {/* the one spine that pokes */}
      <path d={`M 44 -300 l ${30 + poke * 40} -4`} stroke="#fff8e0" strokeWidth={4} strokeLinecap="round" />
      {/* the smug little flower */}
      <g transform={`translate(0 -446) rotate(${Math.sin(g / 7) * 8})`}>
        {[0, 72, 144, 216, 288].map((a) => (
          <ellipse key={a} cx={0} cy={-18} rx={12} ry={20} fill="#ff6fa8" transform={`rotate(${a})`} />
        ))}
        <circle r={10} fill="#ffd93f" />
      </g>
    </g>
  );
};

export const Tumbleweed: React.FC<{ x: number; y: number; scale: number; g: number }> = ({ x, y, scale, g }) => (
  <g transform={`translate(${x} ${y - 60 * scale - Math.abs(Math.sin(g / 4)) * 30 * scale}) scale(${scale}) rotate(${g * 14})`}>
    {Array.from({ length: 9 }, (_, i) => (
      <ellipse key={i} rx={60} ry={24 + (i % 3) * 8} transform={`rotate(${i * 20})`} fill="none" stroke={i % 2 ? "#a87a44" : "#c89a5a"} strokeWidth={4} />
    ))}
  </g>
);

// ---------- treasure ----------
export const GoldenBanana: React.FC<{ x: number; y: number; scale?: number; rot?: number; g: number; shine?: number }> = ({ x, y, scale = 1, rot = 0, g, shine = 1 }) => (
  <g transform={`translate(${x} ${y}) scale(${scale}) rotate(${rot})`}>
    <circle r={90} fill="url(#sunGlow)" opacity={0.35 + 0.3 * shine} />
    <path d="M -50 -30 C -40 30 10 52 56 30 C 60 26 58 18 52 18 C 12 30 -20 10 -32 -32 Z" fill="url(#goldBody)" stroke="#a86a08" strokeWidth={4} strokeLinejoin="round" />
    <path d="M -50 -30 l -6 -12 l 14 2 Z" fill="#8a5a08" />
    <path d="M -34 -14 C -26 14 0 30 34 26" stroke="#fffbe0" strokeWidth={5} strokeLinecap="round" fill="none" opacity={0.8} />
    <Sparkle x={30 + Math.sin(g / 5) * 6} y={-6} size={16 + 8 * Math.sin(g / 3)} color="#ffffff" rotate={g * 4} />
  </g>
);

// The tiny golden compass Zuzu gives Lumi; open 0..1 lifts the lid
export const GoldenCompass: React.FC<{ x: number; y: number; scale?: number; g: number; open?: number; glow?: number }> = ({ x, y, scale = 1, g, open = 0, glow = 0.5 }) => {
  const needle = open > 0 ? g * 18 * (1 - open) + Math.sin(g / 4) * 14 * open - 20 : 0;
  return (
    <g transform={`translate(${x} ${y}) scale(${scale})`}>
      <circle r={110} fill="url(#sunGlow)" opacity={0.3 + glow * 0.5} />
      <circle cy={-60} r={9} fill="none" stroke="#c8860c" strokeWidth={5} />
      {/* the lid, swinging up */}
      <g transform={`translate(0 -48) scale(1 ${1 - open * 0.75}) translate(0 48)`} opacity={1 - open * 0.25}>
        <circle r={50} fill="url(#goldBody)" stroke="#a86a08" strokeWidth={5} transform={`translate(0 ${-open * 70})`} />
      </g>
      {open > 0.1 && (
        <g>
          <circle r={50} fill="url(#goldBody)" stroke="#a86a08" strokeWidth={5} />
          <circle r={38} fill="#fff6dc" stroke="#c8860c" strokeWidth={3} />
          {[0, 90, 180, 270].map((a) => (
            <path key={a} d="M 0 -34 l 0 8" stroke="#a86a08" strokeWidth={3} transform={`rotate(${a})`} />
          ))}
          <g transform={`rotate(${needle})`}>
            <path d="M 0 -30 L 7 0 L 0 6 L -7 0 Z" fill="#e52a35" />
            <path d="M 0 30 L 7 0 L 0 -6 L -7 0 Z" fill="#5a6a8a" />
          </g>
          <circle r={4} fill="#a86a08" />
        </g>
      )}
      <Sparkle x={26} y={-30} size={12 + 8 * Math.sin(g / 4)} color="#ffffff" rotate={g * 3} />
    </g>
  );
};

// A light beam from a held treasure to a point; on 0..1
export const GoldBeam: React.FC<{ from: { x: number; y: number }; to: { x: number; y: number }; on: number; g: number; width?: number; color?: string }> = ({ from, to, on, g, width = 40, color = "#ffe08a" }) => {
  if (on <= 0) return null;
  const dx = to.x - from.x;
  const dy = to.y - from.y;
  const len = Math.hypot(dx, dy);
  const ang = (Math.atan2(dy, dx) * 180) / Math.PI;
  const w = width * (0.85 + 0.15 * Math.sin(g / 2));
  return (
    <g transform={`translate(${from.x} ${from.y}) rotate(${ang})`} opacity={on}>
      <path d={`M 0 ${-w * 0.25} L ${len} ${-w / 2} L ${len} ${w / 2} L 0 ${w * 0.25} Z`} fill={color} opacity={0.4} />
      <path d={`M 0 -4 L ${len} -8 L ${len} 8 L 0 4 Z`} fill="#ffffff" opacity={0.85} />
      {[0, 1, 2, 3, 4].map((i) => (
        <circle key={i} cx={((g * 14 + i * len * 0.2) % len) || 0} cy={Math.sin(g / 3 + i) * w * 0.25} r={5} fill="#fffbe0" />
      ))}
    </g>
  );
};

// ---------- comic icons ----------
type Bubble = "question" | "clock" | "x" | "bang" | "hearts" | "dots" | "music";
export const IconBubble: React.FC<{ x: number; y: number; scale: number; kind: Bubble; on: number; g: number; tail?: -1 | 1 }> = ({ x, y, scale, kind, on, g, tail = -1 }) => {
  if (on <= 0) return null;
  const pop = Math.min(1, on * 1.6);
  const s = scale * (0.6 + 0.4 * pop) * (1 + (on < 0.6 ? Math.sin(on * 10) * 0.08 : 0));
  const body = (() => {
    switch (kind) {
      case "question":
        return <text x={0} y={30} textAnchor="middle" fontSize={96} fontWeight={800} fill="#6a4ad8" fontFamily="Fredoka, sans-serif">?</text>;
      case "bang":
        return <text x={0} y={34} textAnchor="middle" fontSize={100} fontWeight={800} fill="#ff4a4a" fontFamily="Fredoka, sans-serif">!</text>;
      case "x":
        return (
          <g stroke="#ff3a4a" strokeWidth={18} strokeLinecap="round">
            <path d="M -30 -30 L 30 30 M 30 -30 L -30 30" />
          </g>
        );
      case "clock":
        return (
          <g>
            <circle r={44} fill="#ffffff" stroke="#5a6a8a" strokeWidth={7} />
            {Array.from({ length: 12 }, (_, i) => (
              <path key={i} d="M 0 -36 l 0 7" stroke="#5a6a8a" strokeWidth={4} transform={`rotate(${i * 30})`} />
            ))}
            <path d={`M 0 0 L 0 -26`} stroke="#2a3450" strokeWidth={6} strokeLinecap="round" transform={`rotate(${g * 6})`} />
            <path d="M 0 0 L 18 0" stroke="#2a3450" strokeWidth={6} strokeLinecap="round" />
            <circle r={5} fill="#ff4a4a" />
          </g>
        );
      case "hearts":
        return (
          <g>
            {[-1, 1].map((sd) => (
              <path key={sd} d="M 0 12 C -30 -10 -22 -34 0 -20 C 22 -34 30 -10 0 12 Z" fill="#ff5f8a" transform={`translate(${sd * 24} ${sd * 6}) scale(${1 + Math.sin(g / 3 + sd) * 0.12})`} />
            ))}
          </g>
        );
      case "music":
        return <text x={0} y={30} textAnchor="middle" fontSize={84} fill="#3a7ad8">♪</text>;
      default:
        return (
          <g>
            {[0, 1, 2].map((i) => (on > 0.2 + i * 0.25 ? <circle key={i} cx={-34 + i * 34} cy={0} r={11} fill="#5a5a70" /> : null))}
          </g>
        );
    }
  })();
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`} opacity={Math.min(1, on * 3)}>
      <ellipse rx={78} ry={66} fill="#ffffff" stroke="#d8c8a8" strokeWidth={5} />
      <circle cx={tail * 54} cy={66} r={13} fill="#ffffff" stroke="#d8c8a8" strokeWidth={4} />
      <circle cx={tail * 74} cy={92} r={7} fill="#ffffff" stroke="#d8c8a8" strokeWidth={3} />
      {body}
    </g>
  );
};

// Vibration lines around something that just went CLINK
export const ShakeLines: React.FC<{ x: number; y: number; scale: number; on: number; g: number }> = ({ x, y, scale, on, g }) => {
  if (on <= 0) return null;
  return (
    <g transform={`translate(${x} ${y}) scale(${scale})`} opacity={on} stroke="#fff6c8" strokeWidth={6} strokeLinecap="round" fill="none">
      {[-1, 1].map((sd) => (
        <g key={sd} transform={`translate(${sd * (70 + Math.sin(g * 2) * 6)} 0)`}>
          <path d={`M 0 -30 l ${sd * 26} -14`} />
          <path d={`M 4 0 l ${sd * 30} 0`} />
          <path d={`M 0 30 l ${sd * 26} 14`} />
        </g>
      ))}
    </g>
  );
};

// Dizzy little stars circling a head
export const DizzyStars: React.FC<{ x: number; y: number; scale: number; on: number; g: number }> = ({ x, y, scale, on, g }) => {
  if (on <= 0) return null;
  return (
    <g opacity={on}>
      {[0, 1, 2].map((i) => {
        const a = g / 4 + (i * Math.PI * 2) / 3;
        return <Sparkle key={i} x={x + Math.cos(a) * 90 * scale} y={y + Math.sin(a) * 26 * scale} size={22 * scale + 6} color="#ffe04a" rotate={g * 6} />;
      })}
    </g>
  );
};
