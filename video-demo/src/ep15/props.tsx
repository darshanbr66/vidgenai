import React from "react";
import { mixC, shade } from "../ep13/props";

// Episode 15: Petal the flower fairy, and the 2D props of the Floating Flower Garden.
// Everything is drawn with (0, 0) at the feet / base, so `place()` from kit3d puts it on the 3D ground.
// At scale 1, 330 units = 1 world unit (Lumi is about 1.3 world units tall).

export const PETAL_PINK = "#ffb8d8";
export const PETAL_LAV = "#c8a8f4";
export const PETAL_EMERALD = "#1fae6a";
export const ORB_COLS = ["#ff7ac0", "#ffd84a", "#6ac8ff", "#b47aff"];
const TAU = Math.PI * 2;

const star4 = (r: number) => `M 0 ${-r} Q ${r * 0.18} ${-r * 0.18} ${r} 0 Q ${r * 0.18} ${r * 0.18} 0 ${r} Q ${-r * 0.18} ${r * 0.18} ${-r} 0 Q ${-r * 0.18} ${-r * 0.18} 0 ${-r} Z`;
/** a single petal shape, base at (0, 0), pointing up, length L, width W */
const petalPath = (L: number, W: number) => `M 0 0 C ${W * 0.9} ${-L * 0.2} ${W * 0.8} ${-L * 0.8} 0 ${-L} C ${-W * 0.8} ${-L * 0.8} ${-W * 0.9} ${-L * 0.2} 0 0 Z`;
const hash = (i: number) => {
  const s = Math.sin(i * 127.1 + 311.7) * 43758.5453;
  return s - Math.floor(s);
};
const PETAL_COLS = ["#ffb0d8", "#ff8ac0", "#e0c0ff", "#fff0a8", "#ffffff", "#ffc8e0", "#c8a8f4"];

export const Ep15Defs: React.FC<{ bloom?: number }> = ({ bloom = 1 }) => {
  const k = 0.94 + bloom * 0.1;
  return (
    <>
      <filter id="gardenLit" colorInterpolationFilters="sRGB" x="-20%" y="-20%" width="140%" height="140%">
        <feColorMatrix type="matrix" values={`${1.03 * k} 0 0 0 0.03  0 ${1.0 * k} 0 0 0.02  0 0 ${0.98 * k} 0 0.03  0 0 0 1 0`} />
      </filter>
      <filter id="chamberLit" colorInterpolationFilters="sRGB" x="-20%" y="-20%" width="140%" height="140%">
        <feColorMatrix type="matrix" values={`${0.9 * k} 0 0 0 0.02  0 ${0.98 * k} 0 0 0.04  0 0 ${1.06 * k} 0 0.07  0 0 0 1 0`} />
      </filter>
      <radialGradient id="ptSkin" cx="40%" cy="32%" r="75%">
        <stop offset="0%" stopColor="#fff2f8" />
        <stop offset="60%" stopColor="#ffd8ea" />
        <stop offset="100%" stopColor="#f6b8d4" />
      </radialGradient>
      <radialGradient id="ptIris" cx="45%" cy="38%" r="62%">
        <stop offset="0%" stopColor="#c8ffe0" />
        <stop offset="50%" stopColor="#2ec27e" />
        <stop offset="100%" stopColor="#0a6a40" />
      </radialGradient>
      <linearGradient id="ptDress" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#ffc8e4" />
        <stop offset="100%" stopColor="#ff8ac0" />
      </linearGradient>
      <linearGradient id="ptDressIn" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#ecdcff" />
        <stop offset="100%" stopColor="#b896f0" />
      </linearGradient>
      <linearGradient id="ptHair" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stopColor="#e8d4ff" />
        <stop offset="100%" stopColor="#b08ae8" />
      </linearGradient>
      <radialGradient id="ptWing" cx="20%" cy="80%" r="100%">
        <stop offset="0%" stopColor="#ffffff" stopOpacity="0.85" />
        <stop offset="40%" stopColor="#ffd0ec" stopOpacity="0.55" />
        <stop offset="75%" stopColor="#d8c0ff" stopOpacity="0.45" />
        <stop offset="100%" stopColor="#b8f0e0" stopOpacity="0.4" />
      </radialGradient>
      <radialGradient id="softGlow" cx="50%" cy="50%" r="50%">
        <stop offset="0%" stopColor="#ffffff" stopOpacity="0.95" />
        <stop offset="40%" stopColor="#ffffff" stopOpacity="0.35" />
        <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
      </radialGradient>
      <radialGradient id="pollen" cx="50%" cy="45%" r="55%">
        <stop offset="0%" stopColor="#fff8c0" />
        <stop offset="70%" stopColor="#ffe060" />
        <stop offset="100%" stopColor="#f0b820" stopOpacity="0" />
      </radialGradient>
      <linearGradient id="budYellow" x1="0" y1="0" x2="1" y2="0">
        <stop offset="0%" stopColor="#e8b818" />
        <stop offset="45%" stopColor="#fff070" />
        <stop offset="100%" stopColor="#d8a010" />
      </linearGradient>
      <linearGradient id="budGold" x1="0" y1="0" x2="1" y2="0">
        <stop offset="0%" stopColor="#d89810" />
        <stop offset="45%" stopColor="#fff4a0" />
        <stop offset="100%" stopColor="#c88a10" />
      </linearGradient>
      <linearGradient id="stemGreen" x1="0" y1="0" x2="1" y2="0">
        <stop offset="0%" stopColor="#3f9a5a" />
        <stop offset="50%" stopColor="#7ad88a" />
        <stop offset="100%" stopColor="#3f9a5a" />
      </linearGradient>
    </>
  );
};

// ---------- Petal, the tiny flower fairy, guardian of the Floating Flower Garden ----------
export type PetalMood = "happy" | "joy" | "surprised" | "embarrassed" | "sad" | "worried" | "determined" | "ah" | "achoo" | "magic";

/** a five-petal flower glyph, for crowns, forehead marks and hand sparkles */
const Flower5: React.FC<{ r: number; color: string; center?: string; rot?: number; glow?: number }> = ({ r, color, center = "#fff2a0", rot = 0, glow = 0 }) => (
  <g transform={`rotate(${rot})`}>
    {glow > 0.01 && <circle r={r * 3} fill="url(#softGlow)" opacity={glow} />}
    {[0, 1, 2, 3, 4].map((i) => (
      <ellipse key={i} cx={0} cy={-r * 0.62} rx={r * 0.48} ry={r * 0.62} fill={color} stroke={shade(color, -0.25)} strokeWidth={r * 0.08} transform={`rotate(${i * 72})`} />
    ))}
    <circle r={r * 0.38} fill={center} stroke={shade(center, -0.3)} strokeWidth={r * 0.06} />
  </g>
);

export const Petal: React.FC<{
  x: number;
  y: number;
  scale?: number;
  g: number;
  look?: { x: number; y: number };
  mood?: PetalMood;
  mouth?: number;
  blink?: number;
  armL?: number; // degrees; positive raises the screen-left arm
  armR?: number; // negative raises the screen-right arm
  fly?: number; // hover height in body units (she floats on her wings)
  flap?: number; // wing beat speed multiplier (0 folded still .. 1 normal .. 2 fast)
  squash?: number;
  lean?: number;
  headTilt?: number;
  blush?: number;
  handGlow?: number; // the glowing floral patterns around her hands
  glow?: number;
  facePaws?: number; // 0..1 both hands up to her cheeks (embarrassed)
  shadow?: number;
}> = ({ x, y, scale = 1, g, look = { x: 0, y: 0 }, mood = "happy", mouth = 0, blink = 1, armL = 20, armR = -20, fly = 0, flap = 1, squash = 1, lean = 0, headTilt = 0, blush = 0, handGlow = 0.4, glow = 0, facePaws = 0, shadow = 1 }) => {
  const talking = mouth > 0.06;
  const line = "#b0407a";
  const big = mood === "surprised" ? 1.12 : 1;
  const sneezeUp = mood === "ah";
  const achoo = mood === "achoo";
  const beat = Math.sin(g * 0.9 * Math.max(0.2, flap)) * (flap > 0.05 ? 1 : 0);
  const bob = fly > 0 ? Math.sin(g / 7) * 8 : 0;
  const eye = (side: -1 | 1) => {
    const cx = side * 34;
    if (achoo) return <path key={side} d={`M ${cx - 18} -8 L ${cx + 2 * side} 0 L ${cx - 18} 8`} transform={side > 0 ? `translate(${2 * cx} 0) scale(-1 1)` : undefined} stroke="#3a1a40" strokeWidth={6} strokeLinecap="round" strokeLinejoin="round" fill="none" />;
    if ((mood === "joy" && !talking) || (blink < 0.5 && mood !== "surprised")) return <path key={side} d={`M ${cx - 18} 2 Q ${cx} -18 ${cx + 18} 2`} stroke="#3a1a40" strokeWidth={6} strokeLinecap="round" fill="none" />;
    const lid = sneezeUp ? 0.45 : mood === "sad" || mood === "worried" ? 0.18 : 0;
    const down = mood === "embarrassed" ? 0.7 : 0;
    return (
      <g key={side} transform={`translate(${cx} -2) scale(${big} ${big * Math.max(0.1, blink)})`}>
        <ellipse rx={25} ry={30} fill="#ffffff" stroke="#e8a0c8" strokeWidth={2} />
        <g transform={`translate(${look.x * 7} ${look.y * 8 + down * 8 - (sneezeUp ? 6 : 0)})`}>
          <circle r={21} fill="url(#ptIris)" />
          <circle r={10} fill="#063a22" />
          <circle cx={-7} cy={-9} r={7.5} fill="#fff" />
          <circle cx={7} cy={8} r={3.2} fill="#fff" opacity={0.9} />
          <path d={star4(4)} transform="translate(-10 6)" fill="#fff" opacity={0.85} />
        </g>
        {lid > 0 && <path d={`M -28 -32 L 28 -32 L 28 ${-30 + lid * 60} Q 0 ${-22 + lid * 60} -28 ${-30 + lid * 60} Z`} fill="url(#ptSkin)" />}
        <path d={`M ${side * 14} -28 q ${side * 12} -6 ${side * 20} -16 M ${side * 22} -22 q ${side * 10} -2 ${side * 17} -8`} stroke="#3a1a40" strokeWidth={3.5} strokeLinecap="round" fill="none" />
      </g>
    );
  };
  const brow = (side: -1 | 1) => {
    const worried = mood === "sad" || mood === "worried" || mood === "embarrassed";
    const by = mood === "surprised" ? -50 : sneezeUp ? -50 : -42;
    const tilt = worried || sneezeUp ? side * -16 : mood === "determined" ? side * 12 : 0;
    return <path key={side} d={`M ${side * 34 - 12} ${by} Q ${side * 34} ${by - 7} ${side * 34 + 12} ${by}`} transform={`rotate(${tilt} ${side * 34} ${by})`} stroke="#b47ad8" strokeWidth={4.5} strokeLinecap="round" fill="none" />;
  };
  let mouthEl: React.ReactNode;
  if (achoo) mouthEl = <ellipse cx={0} cy={42} rx={16} ry={13} fill="#7a1840" />;
  else if (sneezeUp) mouthEl = <ellipse cx={0} cy={40} rx={8} ry={9 + Math.max(mouth, 0.3) * 6} fill="#7a1840" />;
  else if (talking)
    mouthEl = (
      <g>
        <path d={`M -13 34 Q 0 30 13 34 Q 10 ${39 + mouth * 13} 0 ${42 + mouth * 15} Q -10 ${39 + mouth * 13} -13 34 Z`} fill="#7a1840" />
        <ellipse cx={0} cy={39 + mouth * 10} rx={5.5} ry={2 + mouth * 2.2} fill="#ff8aa8" />
      </g>
    );
  else if (mood === "surprised") mouthEl = <ellipse cx={0} cy={39} rx={7} ry={9} fill="#7a1840" />;
  else if (mood === "joy" || mood === "magic") mouthEl = <path d="M -16 32 Q 0 54 16 32 Z" fill="#7a1840" />;
  else if (mood === "embarrassed" || mood === "worried") mouthEl = <path d="M -12 38 Q -6 33 0 38 Q 6 43 12 38" stroke={line} strokeWidth={4} strokeLinecap="round" fill="none" />;
  else if (mood === "sad") mouthEl = <path d="M -11 42 Q 0 33 11 42" stroke={line} strokeWidth={4} strokeLinecap="round" fill="none" />;
  else if (mood === "determined") mouthEl = <path d="M -11 37 Q 0 44 11 37" stroke={line} strokeWidth={4.5} strokeLinecap="round" fill="none" />;
  else mouthEl = <path d="M -14 33 Q 0 46 14 33" stroke={line} strokeWidth={4.5} strokeLinecap="round" fill="none" />;
  const arm = (side: -1 | 1, angle: number) => {
    const handA = facePaws > 0 ? angle + (side * 155 - angle) * facePaws : angle;
    return (
      <g transform={`translate(${side * 28} -136) rotate(${handA})`}>
        <rect x={-8} y={-4} width={16} height={58} rx={8} fill="url(#ptSkin)" stroke="#f0a8c8" strokeWidth={2} />
        <circle cx={0} cy={56} r={10} fill="#ffe8f2" stroke="#f0a8c8" strokeWidth={2} />
        {handGlow > 0.02 &&
          [0, 1, 2].map((i) => {
            const a = g / 9 + (i * TAU) / 3;
            return (
              <g key={i} transform={`translate(${Math.cos(a) * 22} ${56 + Math.sin(a) * 22})`} opacity={handGlow * (0.6 + 0.4 * Math.sin(g / 4 + i))}>
                <Flower5 r={6} color={["#ff9ad8", "#fff0a0", "#c8b0ff"][i]} rot={g * 4} glow={0.5} />
              </g>
            );
          })}
      </g>
    );
  };
  const wing = (side: -1 | 1) => {
    const open = 0.75 + beat * 0.25;
    return (
      <g key={side} transform={`translate(${side * 10} -150) scale(${side * open} 1) rotate(${-8 + beat * 10})`}>
        <path d="M 0 0 C 30 -90 120 -150 160 -110 C 190 -78 150 -20 0 0 Z" fill="url(#ptWing)" stroke="#e8b0e0" strokeWidth={3} strokeOpacity={0.8} />
        <path d="M 0 0 C 50 30 120 60 110 100 C 96 130 40 90 0 0 Z" fill="url(#ptWing)" stroke="#e8b0e0" strokeWidth={3} strokeOpacity={0.8} />
        <path d="M 8 -6 C 50 -60 110 -100 150 -104 M 20 -10 C 70 -40 120 -60 150 -70 M 8 6 C 40 30 80 60 100 92" stroke="#ffffff" strokeWidth={2.5} strokeOpacity={0.7} fill="none" />
        <circle cx={130} cy={-100} r={8} fill="#ffffff" opacity={0.6} />
        <circle cx={96} cy={86} r={6} fill="#ffffff" opacity={0.55} />
      </g>
    );
  };
  return (
    <g transform={`translate(${x} ${y}) scale(${scale})`}>
      {glow > 0.01 && <circle cx={0} cy={-160 - fly} r={260} fill="url(#softGlow)" opacity={glow} />}
      {shadow > 0.01 && <ellipse cx={0} cy={4} rx={52} ry={10} fill="url(#shadow)" opacity={shadow * (1 - Math.min(1, fly / 260) * 0.75)} />}
      <g transform={`translate(0 ${-fly - bob}) rotate(${lean}) scale(${1 / Math.sqrt(squash)} ${squash})`}>
        {wing(-1)}
        {wing(1)}
        {/* legs with petal slippers */}
        {[-1, 1].map((sd) => (
          <g key={sd} transform={`translate(${sd * 14} -46) rotate(${fly > 20 ? sd * 8 + Math.sin(g / 6 + sd) * 6 : 0})`}>
            <rect x={-7} y={0} width={14} height={40} rx={7} fill="url(#ptSkin)" stroke="#f0a8c8" strokeWidth={2} />
            <path d={`M ${-12} 44 Q 0 30 ${16 * sd + (sd < 0 ? 0 : 0)} 44 Q ${sd * 20} 50 ${sd * 22} 40 Q 0 56 -12 44 Z`} fill="#ff9ac8" stroke="#d8609a" strokeWidth={2} />
          </g>
        ))}
        {arm(-1, armL)}
        {arm(1, armR)}
        {/* the petal dress: inner lavender petals, then pink outer petals */}
        <g transform="translate(0 -112)">
          {[-2, -1, 0, 1, 2].map((i) => (
            <path key={`i${i}`} d={petalPath(-76, 34)} transform={`translate(${i * 14} 0) rotate(${i * 16})`} fill="url(#ptDressIn)" stroke="#a080d8" strokeWidth={2} />
          ))}
          {[-2, -1, 0, 1, 2].map((i) => (
            <path key={`o${i}`} d={petalPath(-66, 30)} transform={`translate(${i * 17} 2) rotate(${i * 20 + Math.sin(g / 10 + i) * 3})`} fill="url(#ptDress)" stroke="#e070a8" strokeWidth={2.2} />
          ))}
        </g>
        <path d="M -26 -150 Q 0 -160 26 -150 L 30 -110 Q 0 -102 -30 -110 Z" fill="url(#ptDressIn)" stroke="#a080d8" strokeWidth={2.2} />
        <path d="M -24 -142 Q 0 -134 24 -142" stroke="#ffffff" strokeWidth={3} fill="none" opacity={0.7} />
        {/* head */}
        <g transform={`translate(0 -232) rotate(${headTilt + (achoo ? 14 : sneezeUp ? -10 : 0)})`}>
          {/* petal hair at the back */}
          {[-3, -2, -1, 0, 1, 2, 3].map((i) => (
            <path key={i} d={petalPath(70, 36)} transform={`translate(${i * 20} 30) rotate(${180 + i * 24})`} fill="url(#ptHair)" stroke="#9a78d8" strokeWidth={2} />
          ))}
          {/* little pointed ears */}
          {[-1, 1].map((sd) => (
            <path key={sd} d={`M ${sd * 70} -6 Q ${sd * 104} -34 ${sd * 98} -48 Q ${sd * 84} -22 ${sd * 62} -20 Z`} fill="url(#ptSkin)" stroke="#f0a8c8" strokeWidth={2} />
          ))}
          <ellipse rx={74} ry={68} fill="url(#ptSkin)" stroke="#f0a8c8" strokeWidth={2.5} />
          {/* fringe of petals */}
          {[-2, -1, 0, 1, 2].map((i) => (
            <path key={`f${i}`} d={petalPath(46, 26)} transform={`translate(${i * 26} -44) rotate(${180 + i * 14})`} fill="url(#ptHair)" stroke="#9a78d8" strokeWidth={2} />
          ))}
          {/* the flower-shaped crown */}
          <g transform="translate(0 -70)">
            {[-2, -1, 0, 1, 2].map((i) => (
              <g key={i} transform={`translate(${i * 22} ${Math.abs(i) * 7}) rotate(${i * 16})`}>
                <path d={petalPath(34 - Math.abs(i) * 4, 14)} fill={i % 2 ? "#ffd8ec" : "#ff9ac8"} stroke="#e070a8" strokeWidth={2} />
              </g>
            ))}
            <circle cx={0} cy={-2} r={7} fill="#ffe070" stroke="#d8a020" strokeWidth={2} />
          </g>
          {/* the tiny glowing flower on her forehead */}
          <g transform="translate(0 -34)">
            <Flower5 r={8} color="#ffffff" center="#ffd8f0" glow={0.35 + 0.25 * Math.sin(g / 6)} rot={g} />
          </g>
          {blush > 0.01 && (
            <g opacity={blush}>
              {[-1, 1].map((sd) => (
                <g key={sd}>
                  <ellipse cx={sd * 50} cy={24} rx={20} ry={11} fill="#ff5a8a" opacity={0.6} />
                  <path d={`M ${sd * 42} 18 l -5 9 M ${sd * 51} 18 l -5 9 M ${sd * 60} 18 l -5 9`} stroke="#ff3a70" strokeWidth={2.5} strokeLinecap="round" />
                </g>
              ))}
            </g>
          )}
          <ellipse cx={-50} cy={24} rx={13} ry={7} fill="#ff8ab0" opacity={0.5} />
          <ellipse cx={50} cy={24} rx={13} ry={7} fill="#ff8ab0" opacity={0.5} />
          {eye(-1)}
          {eye(1)}
          {brow(-1)}
          {brow(1)}
          {/* the tiny nose, scrunching before a sneeze */}
          <ellipse cx={0} cy={18} rx={sneezeUp ? 7 : 5} ry={sneezeUp ? 4 : 3.5} fill="#f08ab0" />
          {sneezeUp && <path d="M -10 12 q 4 -4 8 0 M 2 12 q 4 -4 8 0" stroke="#d0608a" strokeWidth={2} fill="none" />}
          {mouthEl}
        </g>
      </g>
    </g>
  );
};
/** where Petal's hands are (for magic and orbs), relative to her feet */
export const petalHands = (x: number, y: number, scale: number, fly = 0) => ({ x, y: y - (136 - 30 + fly) * scale });

// ---------- a storm of petals bursting out of a sneeze; age 0..1 ----------
export const PetalStorm: React.FC<{ x: number; y: number; scale: number; age: number; count?: number; reach?: number; seed?: number }> = ({ x, y, scale, age, count = 90, reach = 900, seed = 1 }) => {
  if (age <= 0 || age >= 1) return null;
  return (
    <g>
      {Array.from({ length: count }, (_, i) => {
        const a = hash(i + seed) * TAU;
        const sp = 0.35 + hash(i * 3 + seed) * 0.65;
        const swirl = a + age * (2 + hash(i * 7) * 3) * (i % 2 ? 1 : -1);
        const d = reach * sp * Math.min(1, age * 2.2) ** 0.6;
        const fall = age * age * 380 * hash(i * 11);
        const px = x + Math.cos(swirl) * d;
        const py = y + Math.sin(swirl) * d * 0.8 + fall;
        const s = scale * (0.7 + hash(i * 5) * 0.9);
        const op = Math.min(1, (1 - age) * 3);
        return <path key={i} d={petalPath(34, 16)} transform={`translate(${px} ${py}) rotate(${hash(i) * 360 + age * 700 * (i % 2 ? 1 : -1)}) scale(${s})`} fill={PETAL_COLS[i % PETAL_COLS.length]} stroke="#e890c0" strokeWidth={1.5} opacity={op} />;
      })}
    </g>
  );
};

// ---------- petals drifting down across the frame ----------
export const FallingPetals: React.FC<{ g: number; count?: number; seed?: number; on?: number; w?: number; h?: number; speed?: number }> = ({ g, count = 24, seed = 3, on = 1, w = 1080, h = 1920, speed = 1 }) => {
  if (on <= 0.01) return null;
  return (
    <g opacity={on}>
      {Array.from({ length: count }, (_, i) => {
        const fall = (hash(i + seed) * h + g * (2.2 + hash(i * 3 + seed) * 2.5) * speed) % (h + 80);
        const px = hash(i * 7 + seed) * w + Math.sin(g / 20 + i) * 40;
        return <path key={i} d={petalPath(26, 13)} transform={`translate(${px} ${fall - 40}) rotate(${g * (2 + (i % 3)) + i * 40}) scale(${0.7 + hash(i * 2) * 0.8})`} fill={PETAL_COLS[i % PETAL_COLS.length]} opacity={0.85} />;
      })}
    </g>
  );
};

// ---------- petals stuck all over Bobo (amount 1 = completely covered, a walking flower) ----------
const COAT = Array.from({ length: 64 }, (_, i) => {
  // spread over Bobo's head (0,-305) r 102 and body (0,-138) 110x120, avoiding his eyes
  const onHead = i < 30;
  const a = hash(i * 13) * TAU;
  const r = Math.sqrt(hash(i * 17 + 3));
  let px = onHead ? Math.cos(a) * r * 108 : Math.cos(a) * r * 118;
  let py = onHead ? -305 + Math.sin(a) * r * 104 : -138 + Math.sin(a) * r * 128;
  if (onHead && Math.abs(py + 323) < 26 && Math.abs(Math.abs(px) - 40) < 26) py -= 40;
  if (onHead && Math.abs(px) < 22 && py > -330 && py < -280) px += 30;
  return { x: px, y: py, rot: hash(i * 5) * 360, c: PETAL_COLS[i % PETAL_COLS.length], s: 0.9 + hash(i * 23) * 0.8, order: hash(i * 29) };
});
export const PetalCoat: React.FC<{ x: number; y: number; scale: number; amount: number; g: number; lean?: number }> = ({ x, y, scale, amount, g, lean = 0 }) => {
  if (amount <= 0.01) return null;
  return (
    <g transform={`translate(${x} ${y}) scale(${scale}) rotate(${lean})`}>
      {/* ears and a big flower on top */}
      {COAT.map((p, i) => {
        if (p.order > amount) return null;
        return <path key={i} d={petalPath(46, 24)} transform={`translate(${p.x} ${p.y}) rotate(${p.rot + Math.sin(g / 9 + i) * 4}) scale(${p.s})`} fill={p.c} stroke="#e890c0" strokeWidth={2} />;
      })}
      {amount > 0.6 && (
        <g transform="translate(-10 -420)" opacity={Math.min(1, (amount - 0.6) * 3)}>
          <Flower5 r={34} color="#ff9ac8" rot={g * 0.5} />
        </g>
      )}
    </g>
  );
};

// ---------- a puff of pollen (a sneeze); age 0..1 ----------
export const PollenPuff: React.FC<{ x: number; y: number; scale: number; age: number }> = ({ x, y, scale, age }) => {
  if (age <= 0 || age >= 1) return null;
  const k = Math.min(1, age * 3);
  return (
    <g transform={`translate(${x} ${y}) scale(${scale})`} opacity={Math.min(1, (1 - age) * 2.2)}>
      {[
        [0, 0, 120],
        [-110, 20, 90],
        [110, 10, 95],
        [-50, -80, 85],
        [60, -90, 80],
        [0, 70, 80],
      ].map(([cx, cy, r], i) => (
        <g key={i}>
          <circle cx={cx * k} cy={cy * k - age * 40} r={r * (0.4 + 0.6 * k) * (1 + age * 0.3) * 0.8} fill="#ffe680" stroke="#f0c040" strokeWidth={4} opacity={0.5} />
          <circle cx={cx * k - r * 0.2} cy={cy * k - age * 40 - r * 0.25} r={r * 0.3 * k} fill="#fff8d0" opacity={0.8} />
        </g>
      ))}
      {Array.from({ length: 22 }, (_, i) => {
        const a = hash(i * 3) * TAU;
        const d = (60 + hash(i * 7) * 220) * k;
        return <path key={i} d={star4(6 + hash(i) * 8)} transform={`translate(${Math.cos(a) * d} ${Math.sin(a) * d * 0.8 - age * 60})`} fill="#fff6b0" opacity={0.9} />;
      })}
    </g>
  );
};

// ---------- yellow pollen dusted over Draco's face and tummy; amount 0..1 ----------
export const PollenDust: React.FC<{ x: number; y: number; scale: number; amount: number }> = ({ x, y, scale, amount }) => {
  if (amount <= 0.01) return null;
  return (
    <g transform={`translate(${x} ${y}) scale(${scale})`} opacity={amount}>
      <ellipse cx={0} cy={-215} rx={98} ry={80} fill="#ffe050" opacity={0.6} />
      <ellipse cx={0} cy={-90} rx={70} ry={66} fill="#ffe050" opacity={0.45} />
      {Array.from({ length: 40 }, (_, i) => (
        <circle key={i} cx={(hash(i * 3) - 0.5) * 190} cy={-250 + hash(i * 7) * 220} r={3 + hash(i) * 4} fill="#f0c020" opacity={0.8} />
      ))}
    </g>
  );
};

// ---------- a giant banana-shaped flower: a curved yellow bud that can bloom, twitch, or close around a paw ----------
export const BananaFlower: React.FC<{ x: number; y: number; scale: number; g: number; open?: number; twitch?: number; gold?: boolean; layer?: "back" | "front" | "all"; stem?: number; lean?: number }> = ({
  x,
  y,
  scale,
  g,
  open = 0,
  twitch = 0,
  gold = false,
  layer = "all",
  stem = 200,
  lean = 0,
}) => {
  const fill = gold ? "url(#budGold)" : "url(#budYellow)";
  const edge = gold ? "#a87008" : "#b88a10";
  const shake = twitch * Math.sin(g * 2.6) * 8;
  const sway = Math.sin(g / 14) * 3 + lean;
  const back = layer !== "front";
  const front = layer !== "back";
  // the bud: 5 long curved petals hugging together; open spreads them into a flower
  const petals = [-2, -1, 0, 1, 2];
  return (
    <g transform={`translate(${x} ${y}) scale(${scale}) rotate(${sway + shake * 0.3})`}>
      {back && (
        <>
          <path d={`M -10 0 Q -18 ${-stem * 0.5} -4 ${-stem} L 8 ${-stem} Q 0 ${-stem * 0.5} 10 0 Z`} fill="url(#stemGreen)" stroke="#2f7a46" strokeWidth={3} />
          {[-1, 1].map((sd) => (
            <path key={sd} d={`M 0 ${-stem * 0.3} Q ${sd * 70} ${-stem * 0.45} ${sd * 110} ${-stem * 0.25} Q ${sd * 60} ${-stem * 0.2} 0 ${-stem * 0.3} Z`} fill="#6ad08a" stroke="#2f7a46" strokeWidth={3} />
          ))}
        </>
      )}
      <g transform={`translate(${shake} ${-stem})`}>
        {petals.map((i) => {
          const isBack = Math.abs(i) === 2 || i === 0;
          if ((isBack && !back) || (!isBack && !front)) return null;
          const spread = open * (i * 30);
          const curl = (1 - open) * 18; // the banana curve
          const L = 230 - Math.abs(i) * 20;
          const W = 34 + open * 10;
          return (
            <g key={i} transform={`rotate(${spread + curl + i * (1 - open) * 4})`}>
              <path d={`M ${-W * 0.6} 0 C ${-W} ${-L * 0.35} ${-W * 0.4 + curl} ${-L * 0.85} ${curl * 1.6} ${-L} C ${W * 0.6 + curl} ${-L * 0.8} ${W} ${-L * 0.35} ${W * 0.6} 0 Z`} fill={fill} stroke={edge} strokeWidth={3.5} strokeLinejoin="round" />
              <path d={`M 0 -12 Q ${curl * 0.6} ${-L * 0.5} ${curl * 1.4} ${-L * 0.92}`} stroke="#fff8c0" strokeWidth={4} fill="none" opacity={0.6} />
            </g>
          );
        })}
        {front && <ellipse cx={0} cy={6} rx={34} ry={16} fill="#5ab878" stroke="#2f7a46" strokeWidth={3} />}
        {front && open > 0.3 && <circle cx={0} cy={-40} r={22 * open} fill="#fff4b0" stroke="#e0b020" strokeWidth={3} opacity={open} />}
      </g>
    </g>
  );
};

// ---------- a giant 2D flower, seen from the side: a big cup someone can hide in, pop out of, or be launched by ----------
export const BigFlower: React.FC<{ x: number; y: number; scale: number; g: number; color: string; open?: number; layer?: "back" | "front"; wiggle?: number; stem?: number; fling?: number }> = ({
  x,
  y,
  scale,
  g,
  color,
  open = 1,
  layer = "back",
  wiggle = 0,
  stem = 260,
  fling = 0,
}) => {
  const wob = wiggle * Math.sin(g * 1.9) * 7;
  const dark = shade(color, -0.25);
  const light = shade(color, 0.45);
  // open 0: a closed bud; 1: a wide cup. fling > 0 flicks the petals outward (launching something)
  const spreadAt = (i: number) => (i * (14 + open * 22) + Math.sign(i) * fling * 26) * 1;
  const rows = layer === "back" ? [-3, -2, 2, 3] : [-1, 0, 1];
  return (
    <g transform={`translate(${x} ${y}) scale(${scale}) rotate(${wob})`}>
      {layer === "back" && (
        <>
          <path d={`M -14 0 Q -24 ${-stem * 0.5} -8 ${-stem} L 10 ${-stem} Q 2 ${-stem * 0.5} 14 0 Z`} fill="url(#stemGreen)" stroke="#2f7a46" strokeWidth={3} />
          {[-1, 1].map((sd) => (
            <path key={sd} d={`M 0 ${-stem * 0.4} Q ${sd * 90} ${-stem * 0.55} ${sd * 150} ${-stem * 0.35} Q ${sd * 80} ${-stem * 0.28} 0 ${-stem * 0.4} Z`} fill="#6ad08a" stroke="#2f7a46" strokeWidth={3} />
          ))}
          <ellipse cx={0} cy={-stem - 10} rx={120 + open * 40} ry={36} fill={shade(color, -0.4)} opacity={0.55} />
        </>
      )}
      <g transform={`translate(0 ${-stem})`}>
        {rows.map((i) => {
          const L = 220 - Math.abs(i) * 14;
          const W = 74;
          return (
            <g key={i} transform={`rotate(${spreadAt(i)})`}>
              <path d={petalPath(L, W)} fill={layer === "back" ? dark : color} stroke={shade(color, -0.4)} strokeWidth={3.5} strokeLinejoin="round" />
              <path d={petalPath(L * 0.75, W * 0.45)} fill={light} opacity={0.5} />
            </g>
          );
        })}
        {layer === "front" && <ellipse cx={0} cy={4} rx={70} ry={22} fill="#5ab878" stroke="#2f7a46" strokeWidth={3} />}
      </g>
    </g>
  );
};

// ---------- a heap of soft petals (Draco's landing) or a fluffy petal cloud (Bobo's) ----------
export const PetalHeap: React.FC<{ x: number; y: number; scale: number; g: number; layer: "back" | "front"; squish?: number; cloud?: boolean }> = ({ x, y, scale, g, layer, squish = 0, cloud = false }) => {
  const sq = 1 - squish * 0.2;
  const items = Array.from({ length: 46 }, (_, i) => {
    const a = hash(i * 3 + 7) * Math.PI;
    const r = Math.sqrt(hash(i * 5 + 1));
    return { px: -Math.cos(a) * r * 230, py: -Math.sin(a) * r * 150 * sq - (cloud ? 60 : 0), rot: hash(i * 11) * 360, c: PETAL_COLS[i % PETAL_COLS.length], s: 1 + hash(i * 13) * 0.9, front: hash(i * 17) > 0.45 };
  });
  return (
    <g transform={`translate(${x} ${y}) scale(${scale * (1 + squish * 0.1)} ${scale})`}>
      {layer === "back" && <ellipse cx={0} cy={cloud ? -60 : -30} rx={240} ry={cloud ? 120 : 90} fill={cloud ? "#ffe0f0" : "#ffc8e0"} opacity={0.9} />}
      {items.map((p, i) => {
        if ((layer === "front") !== p.front) return null;
        if (layer === "front" && p.py < -110 * sq) return null;
        return <path key={i} d={petalPath(52, 28)} transform={`translate(${p.px} ${p.py + Math.sin(g / 8 + i) * 2}) rotate(${p.rot}) scale(${p.s})`} fill={p.c} stroke="#e890c0" strokeWidth={2} />;
      })}
    </g>
  );
};

// ---------- a glowing pollen orb ----------
export const PollenOrb: React.FC<{ x: number; y: number; scale: number; color: string; g: number; glow?: number }> = ({ x, y, scale, color, g, glow = 1 }) => (
  <g transform={`translate(${x} ${y}) scale(${scale})`}>
    <circle r={70} fill="url(#softGlow)" opacity={0.7 * glow} />
    <circle r={24} fill={color} stroke={shade(color, -0.3)} strokeWidth={3} />
    <circle r={24} fill="url(#softGlow)" opacity={0.6} />
    <circle cx={-8} cy={-8} r={7} fill="#fff" opacity={0.85} />
    <path d={star4(10)} transform={`translate(14 -16) rotate(${g * 3})`} fill="#fff" opacity={0.7 + 0.3 * Math.sin(g / 4)} />
  </g>
);

// ---------- Kiko's prank: a big flower crown (Draco's "Flower Dragon" look) ----------
export const FlowerCrown: React.FC<{ x: number; y: number; scale: number; rot?: number; g: number }> = ({ x, y, scale, rot = 0, g }) => (
  <g transform={`translate(${x} ${y}) scale(${scale}) rotate(${rot})`}>
    {[-2, -1, 0, 1, 2].map((i) => (
      <g key={i} transform={`translate(${i * 40} ${Math.abs(i) * 10})`}>
        <Flower5 r={22 + (i === 0 ? 10 : 0)} color={["#ff9ac8", "#fff0a0", "#ff6aa8", "#c8b0ff", "#ffb08a"][i + 2]} rot={i * 20 + Math.sin(g / 10 + i) * 6} />
      </g>
    ))}
    <path d="M -100 10 Q 0 30 100 10" stroke="#4fae6a" strokeWidth={8} fill="none" strokeLinecap="round" />
  </g>
);

/** a small flower, for landing on a nose */
export const TinyFlower: React.FC<{ x: number; y: number; scale: number; rot?: number; color?: string }> = ({ x, y, scale, rot = 0, color = "#ff9ac8" }) => (
  <g transform={`translate(${x} ${y}) scale(${scale})`}>
    <Flower5 r={22} color={color} rot={rot} />
  </g>
);

// ---------- the magic flower Petal grows in her hands, and its stream of light ----------
export const MagicBloom: React.FC<{ x: number; y: number; scale: number; grow: number; g: number; glow?: number }> = ({ x, y, scale, grow, g, glow = 1 }) => {
  if (grow <= 0.01) return null;
  const cols = ["#ff8ac8", "#ffd84a", "#6ac8ff", "#b47aff", "#7ae8b8", "#ffa07a"];
  return (
    <g transform={`translate(${x} ${y}) scale(${scale * (0.2 + 0.8 * Math.min(1, grow))}) rotate(${g * 0.8})`}>
      <circle r={220} fill="url(#softGlow)" opacity={glow} />
      {cols.map((c, i) => {
        const o = Math.min(1, Math.max(0, grow * 1.4 - i * 0.08));
        return (
          <g key={i} transform={`rotate(${i * 60})`}>
            <path d={petalPath(90 * o + 10, 40)} fill={c} stroke={shade(c, -0.25)} strokeWidth={3} opacity={0.95} />
            <path d={petalPath(60 * o + 6, 16)} fill="#ffffff" opacity={0.5} />
          </g>
        );
      })}
      <circle r={26} fill="#fff6c0" stroke="#e8c040" strokeWidth={3} />
      <path d={star4(22)} fill="#ffffff" opacity={0.9} />
    </g>
  );
};

export const LightStream: React.FC<{ from: { x: number; y: number }; to: { x: number; y: number }; on: number; g: number; width?: number }> = ({ from, to, on, g, width = 60 }) => {
  if (on <= 0.01) return null;
  const cols = ["#ff8ac8", "#ffd84a", "#7ae8b8", "#6ac8ff", "#b47aff"];
  const ex = from.x + (to.x - from.x) * Math.min(1, on);
  const ey = from.y + (to.y - from.y) * Math.min(1, on);
  return (
    <g>
      {cols.map((c, i) => {
        const off = (i - 2) * width * 0.22;
        const mx = (from.x + ex) / 2 + Math.sin(g / 5 + i) * 30 + off;
        const my = (from.y + ey) / 2 - 80 + Math.cos(g / 6 + i) * 20;
        return <path key={i} d={`M ${from.x} ${from.y} Q ${mx} ${my} ${ex} ${ey}`} stroke={c} strokeWidth={width * 0.28} strokeLinecap="round" fill="none" opacity={0.75} />;
      })}
      <path d={`M ${from.x} ${from.y} Q ${(from.x + ex) / 2} ${(from.y + ey) / 2 - 80} ${ex} ${ey}`} stroke="#ffffff" strokeWidth={width * 0.16} strokeLinecap="round" fill="none" opacity={0.9} />
      {Array.from({ length: 10 }, (_, i) => {
        const k = ((g / 20 + i / 10) % 1) * Math.min(1, on);
        const px = from.x + (to.x - from.x) * k;
        const py = from.y + (to.y - from.y) * k - Math.sin(k * Math.PI) * 80;
        return <path key={`s${i}`} d={star4(10 + (i % 3) * 5)} transform={`translate(${px} ${py})`} fill="#fffbe0" />;
      })}
    </g>
  );
};

// ---------- a little "boop" spark ----------
export const Boop: React.FC<{ x: number; y: number; scale: number; age: number }> = ({ x, y, scale, age }) => {
  if (age <= 0 || age >= 1) return null;
  return (
    <g transform={`translate(${x} ${y}) scale(${scale * (0.6 + age)})`} opacity={1 - age}>
      {[0, 1, 2, 3, 4, 5].map((i) => (
        <path key={i} d="M 0 -30 L 0 -52" transform={`rotate(${i * 60})`} stroke="#fff6b0" strokeWidth={6} strokeLinecap="round" />
      ))}
    </g>
  );
};

/** a soft ring of float magic around someone who is floating */
export const FloatAura: React.FC<{ x: number; y: number; scale: number; on: number; g: number }> = ({ x, y, scale, on, g }) => {
  if (on <= 0.01) return null;
  return (
    <g transform={`translate(${x} ${y}) scale(${scale})`} opacity={on}>
      {[0, 1, 2, 3, 4].map((i) => {
        const a = g / 10 + (i * TAU) / 5;
        return <path key={i} d={petalPath(30, 14)} transform={`translate(${Math.cos(a) * 170} ${-170 + Math.sin(a) * 50}) rotate(${g * 4 + i * 70})`} fill={PETAL_COLS[i]} opacity={0.9} />;
      })}
    </g>
  );
};

export { mixC };
