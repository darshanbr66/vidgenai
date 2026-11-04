import React from "react";
import { random } from "remotion";
import { Sparkle } from "../story/scenery";

// Episode 12 characters and props in the series' 2D style.

export const Ep12Defs: React.FC<{ lit?: number }> = ({ lit = 1 }) => {
  // Warm amber clock-tower light on the 2D characters
  const k = Math.max(0.75, Math.min(1.15, lit));
  return (
    <>
      <filter id="clockLit" colorInterpolationFilters="sRGB" x="-20%" y="-20%" width="140%" height="140%">
        <feColorMatrix type="matrix" values={`${1.04 * k} 0 0 0 0.03  0 ${0.98 * k} 0 0 0.015  0 0 ${0.9 * k} 0 0  0 0 0 1 0`} />
      </filter>
      <radialGradient id="tockFeathers" cx="40%" cy="30%" r="78%">
        <stop offset="0%" stopColor="#e8bc7a" />
        <stop offset="60%" stopColor="#c48a48" />
        <stop offset="100%" stopColor="#9a6430" />
      </radialGradient>
      <radialGradient id="tockFace" cx="45%" cy="40%" r="70%">
        <stop offset="0%" stopColor="#fff4e0" />
        <stop offset="100%" stopColor="#f2d6a8" />
      </radialGradient>
      <radialGradient id="tockIris" cx="45%" cy="38%" r="62%">
        <stop offset="0%" stopColor="#c8fff4" />
        <stop offset="50%" stopColor="#2fd0c8" />
        <stop offset="100%" stopColor="#0f7a80" />
      </radialGradient>
      <linearGradient id="goldMetal" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stopColor="#fff2b0" />
        <stop offset="50%" stopColor="#ffc840" />
        <stop offset="100%" stopColor="#b8800c" />
      </linearGradient>
      <radialGradient id="timeGlow" cx="50%" cy="50%" r="50%">
        <stop offset="0%" stopColor="#fffbe8" stopOpacity="1" />
        <stop offset="40%" stopColor="#ffe08a" stopOpacity="0.6" />
        <stop offset="100%" stopColor="#ffb030" stopOpacity="0" />
      </radialGradient>
    </>
  );
};

// ---------- Tock, the tiny owl guardian of the clock tower. (0, 0) at his feet; about 300 tall at scale 1 ----------
export type TockMood = "happy" | "joy" | "proud" | "surprised" | "nervous" | "panic" | "brave";

export const Tock: React.FC<{
  x: number;
  y: number;
  scale?: number;
  g: number;
  look?: { x: number; y: number };
  mood?: TockMood;
  mouth?: number;
  blink?: number;
  wingL?: number; // 0 folded .. 1 raised/flapping
  wingR?: number;
  flap?: number; // 0..1 how fast the wings beat (flying)
  hop?: number; // lift in units (flying/hopping)
  squash?: number;
  tilt?: number;
  headTilt?: number;
}> = ({ x, y, scale = 1, g, look = { x: 0, y: 0 }, mood = "happy", mouth = 0, blink = 1, wingL = 0, wingR = 0, flap = 0, hop = 0, squash = 1, tilt = 0, headTilt = 0 }) => {
  const talking = mouth > 0.06;
  const big = mood === "surprised" || mood === "panic" ? 1.12 : 1;
  const beat = flap > 0 ? Math.sin(g * 1.6) * 35 * flap : 0;
  const eye = (side: -1 | 1) => {
    const cx = side * 40;
    if (mood === "joy" && !talking && blink > 0.5) return <path key={side} d={`M ${cx - 20} 2 Q ${cx} -18 ${cx + 20} 2`} stroke="#2a1a08" strokeWidth={7} strokeLinecap="round" fill="none" />;
    return (
      <g key={side} transform={`translate(${cx} -4) scale(${big} ${big * blink})`}>
        <ellipse rx={30} ry={32} fill="#fff" />
        <g transform={`translate(${look.x * 7} ${look.y * 8})`}>
          <circle r={23} fill="url(#tockIris)" />
          <circle r={11} fill="#0a2a2a" />
          <circle cx={-8} cy={-9} r={8} fill="#fff" />
          <circle cx={7} cy={8} r={3.5} fill="#fff" opacity={0.9} />
        </g>
        {(mood === "nervous" || mood === "panic") && <path d="M -24 -42 Q 0 -32 24 -44" stroke="#7a4a20" strokeWidth={4} fill="none" strokeLinecap="round" transform={`rotate(${side * 10})`} />}
      </g>
    );
  };
  const beak = talking ? (
    <g>
      <path d="M -11 20 L 11 20 L 0 32 Z" fill="#ffb030" stroke="#c87a10" strokeWidth={2} strokeLinejoin="round" />
      <path d={`M -9 24 L 9 24 L 0 ${30 + mouth * 16} Z`} fill="#e88a20" stroke="#c87a10" strokeWidth={2} strokeLinejoin="round" />
    </g>
  ) : mood === "panic" || mood === "surprised" ? (
    <g>
      <path d="M -11 20 L 11 20 L 0 30 Z" fill="#ffb030" stroke="#c87a10" strokeWidth={2} strokeLinejoin="round" />
      <path d="M -8 26 L 8 26 L 0 42 Z" fill="#e88a20" stroke="#c87a10" strokeWidth={2} strokeLinejoin="round" />
    </g>
  ) : (
    <path d="M -11 20 L 11 20 L 0 36 Z" fill="#ffb030" stroke="#c87a10" strokeWidth={2} strokeLinejoin="round" />
  );
  const wing = (side: -1 | 1, up: number) => (
    <g key={side} transform={`translate(${side * 58} -130) rotate(${side * (8 + up * 95 + (side === -1 ? beat : -beat))})`}>
      <path d={`M 0 0 C ${side * 34} 10 ${side * 46} 60 ${side * 30} 108 C ${side * 18} 96 ${side * 8} 100 0 104 C ${side * -4} 70 ${side * -6} 30 0 0 Z`} fill="url(#tockFeathers)" stroke="#8a5420" strokeWidth={3} strokeLinejoin="round" />
      {[30, 55, 80].map((yy, i) => (
        <path key={i} d={`M ${side * 6} ${yy} q ${side * 14} 6 ${side * 26} 2`} stroke="#f2d6a8" strokeWidth={3} fill="none" opacity={0.7} strokeLinecap="round" />
      ))}
    </g>
  );
  return (
    <g transform={`translate(${x} ${y}) scale(${scale})`}>
      <ellipse cx={0} cy={4} rx={66} ry={12} fill="url(#shadow)" opacity={1 - Math.min(1, hop / 200) * 0.7} />
      <g transform={`translate(0 ${-hop}) rotate(${tilt}) scale(${1 / Math.sqrt(squash)} ${squash})`}>
        {/* cute feet */}
        {[-1, 1].map((sd) => (
          <g key={sd} transform={`translate(${sd * 24} -10)`}>
            {[-12, 0, 12].map((dx) => (
              <ellipse key={dx} cx={dx} cy={6} rx={6} ry={10} fill="#ffb030" stroke="#c87a10" strokeWidth={2} />
            ))}
          </g>
        ))}
        {wing(-1, wingL)}
        {wing(1, wingR)}
        {/* round fluffy body */}
        <ellipse cx={0} cy={-118} rx={74} ry={108} fill="url(#tockFeathers)" stroke="#8a5420" strokeWidth={3} />
        <ellipse cx={0} cy={-92} rx={46} ry={66} fill="#f6e0b8" />
        {Array.from({ length: 9 }, (_, i) => (
          <path key={i} d={`M ${-30 + (i % 3) * 30 - 8} ${-120 + Math.floor(i / 3) * 26} q 8 8 16 0`} stroke="#d8a868" strokeWidth={3} fill="none" strokeLinecap="round" />
        ))}
        {/* the golden clock pendant */}
        <g transform={`translate(0 -150) rotate(${Math.sin(g / 8) * 8})`}>
          <path d="M -18 -22 Q 0 -10 18 -22" stroke="#c8962c" strokeWidth={3} fill="none" />
          <circle cy={0} r={16} fill="url(#goldMetal)" stroke="#a8781c" strokeWidth={2.5} />
          <circle cy={0} r={11} fill="#fff8e0" />
          <path d={`M 0 0 L 0 -8 M 0 0 L ${6 * Math.cos(g / 10)} ${6 * Math.sin(g / 10)}`} stroke="#3a2408" strokeWidth={2} strokeLinecap="round" />
        </g>
        {/* head with ear tufts */}
        <g transform={`translate(0 -232) rotate(${headTilt})`}>
          {[-1, 1].map((sd) => (
            <path key={sd} d={`M ${sd * 40} -64 L ${sd * 72} -112 L ${sd * 76} -52 Z`} fill="url(#tockFeathers)" stroke="#8a5420" strokeWidth={3} strokeLinejoin="round" />
          ))}
          <ellipse rx={92} ry={80} fill="url(#tockFeathers)" stroke="#8a5420" strokeWidth={3} />
          {/* the heart-shaped face disc */}
          <path d="M 0 -40 C -30 -66 -86 -50 -80 2 C -76 40 -30 60 0 50 C 30 60 76 40 80 2 C 86 -50 30 -66 0 -40 Z" fill="url(#tockFace)" />
          <ellipse cx={-60} cy={30} rx={13} ry={8} fill="#ffa088" opacity={0.6} />
          <ellipse cx={60} cy={30} rx={13} ry={8} fill="#ffa088" opacity={0.6} />
          {eye(-1)}
          {eye(1)}
          {/* tiny golden spectacles */}
          {[-1, 1].map((sd) => (
            <circle key={sd} cx={sd * 40} cy={-4} r={37} fill="none" stroke="#e8b030" strokeWidth={5} />
          ))}
          <path d="M -6 -8 Q 0 -14 6 -8" stroke="#e8b030" strokeWidth={5} fill="none" />
          {beak}
        </g>
      </g>
    </g>
  );
};

// Tock's tiny golden pocket clock, held up; (x, y) its center
export const PocketClock: React.FC<{ x: number; y: number; scale: number; g: number; hour?: number; min?: number; spin?: number }> = ({ x, y, scale, g, hour = 0.3, min = 0.0, spin = 0 }) => (
  <g transform={`translate(${x} ${y}) scale(${scale})`}>
    <circle r={60} fill="url(#timeGlow)" opacity={0.5} />
    <circle cy={-40} r={8} fill="none" stroke="#c8962c" strokeWidth={4} />
    <circle r={34} fill="url(#goldMetal)" stroke="#a8781c" strokeWidth={4} />
    <circle r={26} fill="#fff8e0" />
    {Array.from({ length: 12 }, (_, i) => (
      <path key={i} d="M 0 -22 l 0 4" stroke="#8a5a20" strokeWidth={2} transform={`rotate(${i * 30})`} />
    ))}
    <path d={`M 0 0 L 0 -12`} stroke="#3a2408" strokeWidth={3} strokeLinecap="round" transform={`rotate(${hour * 360 + spin * 3})`} />
    <path d={`M 0 0 L 0 -19`} stroke="#3a2408" strokeWidth={2} strokeLinecap="round" transform={`rotate(${min * 360 + spin * 36})`} />
    <circle r={3} fill="#c8962c" />
  </g>
);

// ---------- Draco seen from behind (for the portal gag): same colors and proportions as the front view ----------
export const DracoBack: React.FC<{ x: number; y: number; scale: number; g: number; flap?: number }> = ({ x, y, scale, g, flap = 0 }) => {
  const w = Math.sin(g / 2.5) * 14 * flap;
  return (
    <g transform={`translate(${x} ${y}) scale(${scale})`}>
      <ellipse cx={0} cy={4} rx={90} ry={15} fill="url(#shadow)" />
      {/* wings, seen from behind */}
      {[-1, 1].map((sd) => (
        <path key={sd} d={`M ${sd * 30} -200 C ${sd * 90} ${-280 - w} ${sd * 170} ${-250 - w} ${sd * 175} ${-180 - w} C ${sd * 140} -190 ${sd * 120} -170 ${sd * 100} -160 C ${sd * 80} -170 ${sd * 50} -160 ${sd * 30} -150 Z`} fill="#b48ae8" stroke="#7a52b8" strokeWidth={4} strokeLinejoin="round" />
      ))}
      {/* tail curling out to the side */}
      <path d={`M 20 -60 C 90 -40 ${120 + w} -100 ${100 + w} -140`} stroke="#9a6ad8" strokeWidth={26} fill="none" strokeLinecap="round" />
      <path d={`M ${100 + w} -140 l 18 -18 l 6 26 Z`} fill="#ffd060" />
      {/* feet and body */}
      {[-1, 1].map((sd) => (
        <ellipse key={sd} cx={sd * 34} cy={-12} rx={30} ry={16} fill="#9a6ad8" />
      ))}
      <ellipse cx={0} cy={-120} rx={82} ry={100} fill="#a77ae0" stroke="#7a52b8" strokeWidth={4} />
      {/* back spikes */}
      {[-190, -150, -110, -70].map((yy, i) => (
        <path key={i} d={`M -10 ${yy} L 0 ${yy - 22} L 10 ${yy} Z`} fill="#ffd060" stroke="#c89a10" strokeWidth={2} />
      ))}
      {/* the back of the head, horns and ear frills */}
      <g transform="translate(0 -232)">
        {[-1, 1].map((sd) => (
          <path key={sd} d={`M ${sd * 34} -62 Q ${sd * 44} -110 ${sd * 30} -128 Q ${sd * 58} -100 ${sd * 56} -56 Z`} fill="#ffd060" stroke="#c89a10" strokeWidth={3} />
        ))}
        <ellipse rx={100} ry={86} fill="#a77ae0" stroke="#7a52b8" strokeWidth={4} />
        <path d="M -6 -84 C -20 -110 10 -122 14 -100" stroke="#8a5ad0" strokeWidth={8} fill="none" strokeLinecap="round" />
        <ellipse cx={-30} cy={-30} rx={30} ry={14} fill="#c8a8f0" opacity={0.5} />
      </g>
    </g>
  );
};

// An apple; age for a little bounce
export const Apple: React.FC<{ x: number; y: number; scale: number; rot?: number }> = ({ x, y, scale, rot = 0 }) => (
  <g transform={`translate(${x} ${y}) scale(${scale}) rotate(${rot})`}>
    <path d="M 0 -26 C -36 -44 -48 6 -24 30 C -12 40 -4 34 0 30 C 4 34 12 40 24 30 C 48 6 36 -44 0 -26 Z" fill="#ff4a4a" stroke="#b81a2a" strokeWidth={3} />
    <ellipse cx={-14} cy={-10} rx={7} ry={12} fill="#ffffff" opacity={0.45} transform="rotate(20 -14 -10)" />
    <path d="M 0 -26 q 2 -14 8 -20" stroke="#6a4a20" strokeWidth={4} strokeLinecap="round" fill="none" />
    <path d="M 4 -36 c 12 -12 26 -8 30 -2 c -12 6 -22 8 -30 2 Z" fill="#5fc04a" />
  </g>
);

export const BananaPeel: React.FC<{ x: number; y: number; scale: number; on: number }> = ({ x, y, scale, on }) => {
  if (on <= 0) return null;
  return (
    <g transform={`translate(${x} ${y}) scale(${scale * on})`} opacity={on}>
      <ellipse cx={0} cy={4} rx={60} ry={10} fill="url(#shadow)" />
      <path d="M -6 0 C -50 -2 -60 -20 -58 -34 C -40 -20 -22 -14 -6 -14 Z" fill="#ffe24a" stroke="#c89a10" strokeWidth={3} />
      <path d="M 6 0 C 50 -2 60 -20 58 -34 C 40 -20 22 -14 6 -14 Z" fill="#ffe24a" stroke="#c89a10" strokeWidth={3} />
      <path d="M -8 -10 C -12 -40 -2 -56 4 -60 C 6 -40 8 -22 8 -10 Z" fill="#ffd030" stroke="#c89a10" strokeWidth={3} />
      <circle cx={2} cy={-62} r={4} fill="#6a4a10" />
    </g>
  );
};

// A golden clock hand (looks a little like a banana if you are hungry); (x, y) its middle
export const ClockHand2D: React.FC<{ x: number; y: number; scale: number; g: number; rot?: number; long?: boolean }> = ({ x, y, scale, g, rot = 0, long = true }) => {
  const L = long ? 120 : 90;
  return (
    <g transform={`translate(${x} ${y}) scale(${scale}) rotate(${rot})`}>
      <circle r={L * 0.7} fill="url(#timeGlow)" opacity={0.5} />
      <path d={`M 0 ${L / 2} C -14 ${L / 4} -16 ${-L / 4} -8 ${-L / 2 + 18} L 0 ${-L / 2} L 8 ${-L / 2 + 18} C 16 ${-L / 4} 14 ${L / 4} 0 ${L / 2} Z`} fill="url(#goldMetal)" stroke="#a8781c" strokeWidth={3} strokeLinejoin="round" />
      <circle cy={L / 2 - 6} r={9} fill="url(#goldMetal)" stroke="#a8781c" strokeWidth={3} />
      <Sparkle x={10} y={-L / 4} size={12 + 5 * Math.sin(g / 3)} color="#ffffff" rotate={g * 4} />
    </g>
  );
};

// A little clock-shaped treasure box; open 0..1
export const ClockBox: React.FC<{ x: number; y: number; scale: number; g: number; open: number }> = ({ x, y, scale, g, open }) => (
  <g transform={`translate(${x} ${y}) scale(${scale})`}>
    <ellipse cx={0} cy={4} rx={80} ry={12} fill="url(#shadow)" />
    {open > 0.2 && <circle cx={0} cy={-80} r={90 * open} fill="url(#timeGlow)" opacity={0.7} />}
    <rect x={-60} y={-70} width={120} height={70} rx={14} fill="url(#goldMetal)" stroke="#a8781c" strokeWidth={4} />
    <g transform={`translate(0 -70) rotate(${-open * 70} -60 0)`}>
      <path d="M -60 0 A 60 50 0 0 1 60 0 Z" fill="url(#goldMetal)" stroke="#a8781c" strokeWidth={4} />
      <circle cx={0} cy={-22} r={16} fill="#fff8e0" stroke="#a8781c" strokeWidth={3} />
      <path d="M 0 -22 l 0 -9 M 0 -22 l 7 3" stroke="#3a2408" strokeWidth={2.5} strokeLinecap="round" />
    </g>
    <circle cx={0} cy={-36} r={8} fill="#a8781c" />
  </g>
);

// A glowing button Kiko presses to loop time
export const LoopButton: React.FC<{ x: number; y: number; scale: number; g: number; pressed: number }> = ({ x, y, scale, g, pressed }) => (
  <g transform={`translate(${x} ${y}) scale(${scale})`}>
    <circle r={70} fill="url(#timeGlow)" opacity={0.4 + pressed * 0.5} />
    <circle r={38} fill="url(#goldMetal)" stroke="#a8781c" strokeWidth={4} />
    <circle r={28 - pressed * 4} fill="#ff8a3a" />
    <path d="M -12 -2 a 13 13 0 1 1 4 10" stroke="#ffffff" strokeWidth={5} fill="none" strokeLinecap="round" transform={`rotate(${-g * 8})`} />
  </g>
);

// The rewind effect laid over the whole frame during a time loop; on 0..1
export const RewindOverlay: React.FC<{ on: number; g: number }> = ({ on, g }) => {
  if (on <= 0) return null;
  return (
    <g opacity={on}>
      <rect x={0} y={0} width={1080} height={1920} fill="#ffe8a0" opacity={0.12} />
      {Array.from({ length: 14 }, (_, i) => {
        const yy = ((random(`rw${i}`) * 1920 + g * 90) % 1920 + 1920) % 1920;
        return <rect key={i} x={0} y={yy} width={1080} height={4 + (i % 3) * 3} fill="#ffffff" opacity={0.25} />;
      })}
      <g transform="translate(140 300)">
        <circle r={70} fill="#00000055" />
        <path d="M 30 -32 L -10 0 L 30 32 Z M -4 -32 L -44 0 L -4 32 Z" fill="#ffffff" />
      </g>
    </g>
  );
};

// A loop counter bubble ("x2", "x3")
export const LoopCount: React.FC<{ x: number; y: number; n: number; on: number }> = ({ x, y, n, on }) => {
  if (on <= 0) return null;
  return (
    <g transform={`translate(${x} ${y}) scale(${0.6 + on * 0.4})`} opacity={on}>
      <circle r={52} fill="#ffffff" stroke="#e8b030" strokeWidth={6} />
      <text x={0} y={18} textAnchor="middle" fontSize={50} fontWeight={800} fill="#c86a10" fontFamily="Fredoka, sans-serif">x{n}</text>
    </g>
  );
};
