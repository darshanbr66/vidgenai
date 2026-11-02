import React from "react";
import { random } from "remotion";
import { Flower, Moon, Sparkle, StarField } from "../story/scenery";
import { RainbowTree } from "../ep03/props";

// ---------- gradients used by Episode 4 (pass as <Stage defs={<Ep4Defs />}>) ----------
export const Ep4Defs: React.FC = () => (
  <>
    <radialGradient id="dracoBody" cx="40%" cy="32%" r="75%">
      <stop offset="0%" stopColor="#cfa9ff" />
      <stop offset="55%" stopColor="#a074ee" />
      <stop offset="100%" stopColor="#7a4cd0" />
    </radialGradient>
    <radialGradient id="dracoBelly" cx="45%" cy="35%" r="70%">
      <stop offset="0%" stopColor="#fff6fd" />
      <stop offset="100%" stopColor="#f0d2ff" />
    </radialGradient>
    <linearGradient id="dracoWing" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stopColor="#e6d0ff" />
      <stop offset="100%" stopColor="#b48cf2" />
    </linearGradient>
    <linearGradient id="dracoHorn" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stopColor="#fff8cc" />
      <stop offset="50%" stopColor="#ffd34f" />
      <stop offset="100%" stopColor="#f0a020" />
    </linearGradient>
    <linearGradient id="mtnSky" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stopColor="#121a52" />
      <stop offset="45%" stopColor="#2a2d7c" />
      <stop offset="62%" stopColor="#5a4ea8" />
      <stop offset="74%" stopColor="#a67cc6" />
      <stop offset="84%" stopColor="#f5b0b8" />
      <stop offset="100%" stopColor="#ffe0ae" />
    </linearGradient>
    <linearGradient id="mtnRock" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stopColor="#9a88e0" />
      <stop offset="55%" stopColor="#6a5cbc" />
      <stop offset="100%" stopColor="#463d92" />
    </linearGradient>
    <linearGradient id="meadow" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stopColor="#7fdc9a" />
      <stop offset="35%" stopColor="#47b487" />
      <stop offset="100%" stopColor="#1f6e66" />
    </linearGradient>
    <linearGradient id="greenHill" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stopColor="#9fe6a8" />
      <stop offset="100%" stopColor="#4fae8c" />
    </linearGradient>
    <radialGradient id="dustCloud" cx="45%" cy="40%" r="65%">
      <stop offset="0%" stopColor="#fff4ff" />
      <stop offset="60%" stopColor="#f6c8f2" />
      <stop offset="100%" stopColor="#d6a6f4" />
    </radialGradient>
    <linearGradient id="beamGold" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stopColor="#fff3b0" stopOpacity="0.85" />
      <stop offset="100%" stopColor="#ffd36e" stopOpacity="0.08" />
    </linearGradient>
    <linearGradient id="mapNight" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stopColor="#141c56" />
      <stop offset="100%" stopColor="#3a3a8c" />
    </linearGradient>
  </>
);

// ---------- Draco, the little purple dragon: front-facing, feet at (0, 0), about 370 tall at scale 1 ----------
export type DracoMood = "neutral" | "happy" | "joy" | "sad" | "surprised" | "excited" | "effort";
export const DRACO_HEAD_Y = -228;

const WING = "M 0 0 C 30 -62 92 -104 146 -92 C 132 -64 136 -42 124 -20 C 108 -28 98 -10 88 0 C 74 -10 62 6 48 10 C 34 4 18 12 0 14 Z";

export const Draco: React.FC<{
  x: number;
  y: number;
  scale?: number;
  g: number;
  look?: { x: number; y: number };
  mood?: DracoMood;
  mouth?: number;
  blink?: number;
  wing?: number; // 0 folded .. 1 spread wide
  flap?: number; // extra wing angle in degrees
  lean?: number;
  squash?: number;
  armsUp?: number; // 0..1
  step?: number | null; // walk/run phase in radians
  breath?: number; // 0..1 chest puffed up
  headTilt?: number;
  glow?: number;
}> = ({ x, y, scale = 1, g, look = { x: 0, y: 0 }, mood = "neutral", mouth = 0, blink = 1, wing = 0.3, flap = 0, lean = 0, squash = 1, armsUp = 0, step = null, breath = 0, headTilt = 0, glow = 0.25 }) => {
  const talking = mouth > 0.06;
  const s = step === null ? 0 : Math.sin(step);
  const bob = step === null ? 0 : Math.abs(Math.cos(step)) * 14;
  const wingAngle = 58 - 66 * wing + flap;
  const wingScale = 0.62 + 0.4 * wing;
  const sad = mood === "sad";
  const surprised = mood === "surprised" || mood === "excited";
  const tailWag = Math.sin(g / (sad ? 20 : 7)) * (sad ? 3 : 9);
  const eye = (side: -1 | 1) => {
    const cx = side * 40;
    if (mood === "joy" && !talking && blink > 0.5)
      return <path key={side} d={`M ${cx - 20} -6 Q ${cx} -32 ${cx + 20} -6`} stroke="#3b1f6e" strokeWidth={8} strokeLinecap="round" fill="none" />;
    const big = surprised ? 1.1 : 1;
    const squint = mood === "effort" ? 0.55 : 1;
    return (
      <g key={side} transform={`translate(${cx} -10) scale(${big} ${big * blink * squint})`}>
        <ellipse rx={29} ry={34} fill="#fff" stroke="#5a3496" strokeWidth={3} />
        <ellipse cx={look.x * 8} cy={look.y * 9} rx={21} ry={25} fill="#3b1f6e" />
        <ellipse cx={look.x * 8} cy={look.y * 9 + 4} rx={13} ry={15} fill="#7a4fd0" />
        <circle cx={-8 + look.x * 6} cy={-11 + look.y * 6} r={9} fill="#fff" />
        <circle cx={8 + look.x * 6} cy={9 + look.y * 6} r={4} fill="#fff" opacity={0.9} />
        {sad && <path d={`M -34 -40 L 34 -40 L 34 ${side === 1 ? -14 : -24} L -34 ${side === 1 ? -24 : -14} Z`} fill="#b088f2" />}
      </g>
    );
  };
  const brow = (side: -1 | 1) => {
    const by = surprised ? -62 : -52;
    const tilt = sad ? side * -16 : mood === "effort" ? side * 14 : 0;
    return <path key={side} d={`M ${side * 40 - 16} ${by} Q ${side * 40} ${by - 8} ${side * 40 + 16} ${by}`} transform={`rotate(${tilt} ${side * 40} ${by})`} stroke="#5a3496" strokeWidth={6} strokeLinecap="round" fill="none" />;
  };
  const mouthShape = talking && sad ? (
    <g>
      <ellipse cx={0} cy={58} rx={9 + mouth * 4} ry={4 + mouth * 11} fill="#6b2350" />
      <path d="M -24 60 Q -18 52 -12 56 M 24 60 Q 18 52 12 56" stroke="#5a2a60" strokeWidth={4} strokeLinecap="round" fill="none" />
    </g>
  ) : talking ? (
    <g>
      <path d={`M -20 52 Q 0 46 20 52 Q 16 ${56 + mouth * 22} 0 ${58 + mouth * 24} Q -16 ${56 + mouth * 22} -20 52 Z`} fill="#6b2350" />
      <ellipse cx={0} cy={56 + mouth * 18} rx={9} ry={4 + mouth * 3} fill="#ff8fb0" />
    </g>
  ) : sad ? (
    <path d="M -14 62 Q 0 52 14 62" stroke="#5a2a60" strokeWidth={5} strokeLinecap="round" fill="none" />
  ) : surprised ? (
    <ellipse cx={0} cy={58} rx={9} ry={11} fill="#6b2350" />
  ) : mood === "effort" ? (
    <path d="M -16 56 Q -8 50 0 56 Q 8 62 16 56" stroke="#5a2a60" strokeWidth={5} strokeLinecap="round" fill="none" />
  ) : mood === "neutral" ? (
    <path d="M -12 54 Q 0 62 12 54" stroke="#5a2a60" strokeWidth={5} strokeLinecap="round" fill="none" />
  ) : (
    <g>
      <path d="M -22 50 Q 0 76 22 50 Z" fill="#6b2350" stroke="#6b2350" strokeWidth={3} strokeLinejoin="round" />
      <path d="M 6 51 L 10 59 L 14 51 Z" fill="#fff" />
    </g>
  );
  const arm = (side: -1 | 1) => (
    <g transform={`translate(${side * 64} -132) rotate(${side * -(12 + armsUp * 140) + (step === null ? 0 : side * s * 22)})`}>
      <ellipse cy={22} rx={16} ry={30} fill="url(#dracoBody)" />
      <circle cy={48} r={15} fill="#b890f6" />
    </g>
  );
  return (
    <g transform={`translate(${x} ${y}) scale(${scale}) rotate(${lean}) scale(${1 / Math.sqrt(squash)} ${squash})`}>
      <ellipse cx={0} cy={6} rx={96} ry={18} fill="url(#shadow)" />
      <g transform={`translate(0 ${-bob})`}>
        <circle cy={-180} r={260} fill="url(#softGlow)" opacity={glow * 0.5} />
        {/* tail with a golden tip */}
        <g transform={`rotate(${tailWag} 34 -54)`}>
          <path d="M 30 -78 Q 124 -66 132 -118 Q 136 -150 110 -156 Q 120 -118 98 -96 Q 72 -70 30 -40 Z" fill="#8f5fe0" />
          <path d="M 110 -156 Q 132 -178 128 -146 Q 142 -150 130 -132 Q 124 -142 110 -156 Z" fill="url(#dracoHorn)" />
        </g>
        {/* small rounded wings */}
        {[-1, 1].map((side) => (
          <g key={side} transform={`translate(${side * 46} -152) scale(${side} 1) rotate(${wingAngle}) scale(${wingScale})`}>
            <path d={WING} fill="url(#dracoWing)" stroke="#7a4cd0" strokeWidth={5} strokeLinejoin="round" />
            <path d="M 0 0 C 30 -62 92 -104 146 -92" stroke="#7a4cd0" strokeWidth={10} strokeLinecap="round" fill="none" />
            <path d="M 8 6 Q 70 -46 124 -20 M 8 8 Q 56 -22 88 0" stroke="#9f78e6" strokeWidth={4} fill="none" strokeLinecap="round" />
            <circle cx={146} cy={-92} r={8} fill="#7a4cd0" />
          </g>
        ))}
        {/* feet */}
        {[-1, 1].map((side) => (
          <g key={side} transform={`translate(${side * 36} ${-14 - (step === null ? 0 : Math.max(0, side * s) * 20)})`}>
            <ellipse rx={32} ry={19} fill="#7a4cd0" />
            {[-14, 0, 14].map((tx) => (
              <circle key={tx} cx={tx} cy={10} r={6} fill="#f6e6ff" />
            ))}
          </g>
        ))}
        {/* round body and striped belly */}
        <g transform={`translate(0 -96) scale(${1 + breath * 0.07})`}>
          <ellipse cy={-4} rx={76} ry={86} fill="url(#dracoBody)" />
          <ellipse cy={8} rx={50} ry={64} fill="url(#dracoBelly)" />
          {[-24, 0, 24].map((by) => (
            <path key={by} d={`M ${-44 + Math.abs(by) * 0.3} ${by + 8} Q 0 ${by + 18} ${44 - Math.abs(by) * 0.3} ${by + 8}`} stroke="#e4bdf6" strokeWidth={4} fill="none" strokeLinecap="round" />
          ))}
        </g>
        {arm(-1)}
        {arm(1)}
        {/* head */}
        <g transform={`translate(0 ${DRACO_HEAD_Y}) rotate(${headTilt})`}>
          {[-1, 1].map((side) => (
            <path key={side} d={`M ${side * 82} -30 Q ${side * 132} -48 ${side * 128} -8 Q ${side * 112} 6 ${side * 86} 10 Z`} fill="url(#dracoWing)" stroke="#7a4cd0" strokeWidth={4} strokeLinejoin="round" />
          ))}
          {[-1, 1].map((side) => (
            <g key={side} transform={`translate(${side * 42} -76) scale(${side} 1)`}>
              <path d="M -15 6 Q -14 -36 8 -52 Q 2 -24 15 6 Z" fill="url(#dracoHorn)" stroke="#d08a18" strokeWidth={3} strokeLinejoin="round" />
            </g>
          ))}
          <ellipse rx={102} ry={92} fill="url(#dracoBody)" />
          <path d="M -8 -90 Q -20 -116 4 -120 Q 20 -118 12 -104" stroke="#8f5fe0" strokeWidth={9} strokeLinecap="round" fill="none" />
          <ellipse cx={-38} cy={-56} rx={34} ry={18} fill="#fff" opacity={0.22} transform="rotate(-18 -38 -56)" />
          <ellipse cx={0} cy={44} rx={58} ry={38} fill="#dcc0ff" />
          <ellipse cx={-14} cy={32} rx={5} ry={3.5} fill="#7a4cd0" />
          <ellipse cx={14} cy={32} rx={5} ry={3.5} fill="#7a4cd0" />
          <ellipse cx={-74} cy={36} rx={17} ry={11} fill="#ff94c4" opacity={sad ? 0.35 : 0.65} />
          <ellipse cx={74} cy={36} rx={17} ry={11} fill="#ff94c4" opacity={sad ? 0.35 : 0.65} />
          {eye(-1)}
          {eye(1)}
          {brow(-1)}
          {brow(1)}
          {mouthShape}
        </g>
      </g>
    </g>
  );
};

// ---------- a soft cloud ----------
export const Cloud: React.FC<{ x: number; y: number; s?: number; opacity?: number; tint?: string }> = ({ x, y, s = 1, opacity = 0.9, tint = "#fff4fb" }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`} opacity={opacity}>
    {[
      [-110, 10, 62],
      [-50, -24, 80],
      [30, -36, 92],
      [110, -6, 70],
      [0, 20, 80],
    ].map(([cx, cy, r], i) => (
      <circle key={i} cx={cx} cy={cy} r={r} fill={tint} />
    ))}
    <ellipse cx={0} cy={44} rx={180} ry={26} fill="#d9c4ef" opacity={0.5} />
  </g>
);

// ---------- crystals that glow on the mountain ----------
const Crystal: React.FC<{ x: number; y: number; s: number; c: string; g: number; seed: number }> = ({ x, y, s, c, g, seed }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <circle cy={-40} r={90} fill={c} opacity={0.18 + Math.sin(g / 12 + seed) * 0.08} />
    <path d="M -18 0 L -22 -50 L 0 -86 L 20 -54 L 18 0 Z" fill={c} />
    <path d="M -22 -50 L 0 -86 L 0 0 L -18 0 Z" fill="#fff" opacity={0.35} />
    <path d="M 14 0 L 34 -36 L 44 -18 L 34 0 Z" fill={c} opacity={0.85} />
    <path d="M -14 0 L -40 -30 L -46 -10 L -34 0 Z" fill={c} opacity={0.85} />
  </g>
);

const FloatIsle: React.FC<{ x: number; y: number; s: number; g: number; seed: number }> = ({ x, y, s, g, seed }) => (
  <g transform={`translate(${x} ${y + Math.sin(g / 30 + seed) * 14}) scale(${s})`}>
    <path d="M -120 0 Q -80 110 0 150 Q 70 100 120 0 Z" fill="#5a4fa0" />
    <path d="M -60 40 Q -20 120 0 150 Q 20 100 40 40 Z" fill="#4a4090" />
    <ellipse cy={0} rx={128} ry={26} fill="#6fd39a" />
    <ellipse cy={-6} rx={110} ry={16} fill="#9ff0b6" opacity={0.7} />
    <RainbowTree x={-40} y={-4} s={0.9} c="#b27bff" frame={g} seed={seed} glow={0.3} />
    <RainbowTree x={44} y={-2} s={0.7} c="#4fd8e8" frame={g} seed={seed + 3} glow={0.3} />
  </g>
);

const PEAK = { x: 1500, y: 300 };

// ---------- the magical mountain world: ground runs about y=1560..3400, painted x=-1600..4600 ----------
export const MountainWorld: React.FC<{ g: number; drift?: number }> = ({ g, drift = 0 }) => (
  <>
    <rect x={-2400} y={-2600} width={8000} height={4400} fill="url(#mtnSky)" />
    <g transform="translate(-2400 -2600)">
      <StarField frame={g} w={8000} h={3000} count={300} seed="mtn" />
    </g>
    <Moon x={2750} y={60} r={86} frame={g} />
    {/* far ranges */}
    <path d="M -2400 1560 L -2400 1100 L -1800 820 L -1300 1120 L -800 860 L -300 1150 L 200 980 L 700 1240 L 2300 1240 L 2800 940 L 3300 1180 L 3800 860 L 4400 1120 L 5600 900 L 5600 1560 Z" fill="#8a7cc8" opacity={0.75} />
    <path d="M -1800 820 L -1640 900 L -1560 870 L -1490 930 L -1300 1120 L -1500 960 Z M 3800 860 L 3960 950 L 4050 920 L 4120 980 L 3900 920 Z" fill="#f2eaff" opacity={0.7} />
    <path d="M -2400 1560 L -2400 1250 L -1600 1080 L -1000 1300 L -500 1120 L 300 1400 L 2700 1400 L 3300 1150 L 3900 1330 L 4600 1140 L 5600 1300 L 5600 1560 Z" fill="#6a5eb2" opacity={0.85} />
    {/* the magical mountain */}
    <circle cx={PEAK.x} cy={PEAK.y + 40} r={520} fill="url(#flowerBurst)" opacity={0.28 + Math.sin(g / 20) * 0.06} />
    <path d="M -500 1560 L 600 980 Q 960 680 1250 520 Q 1420 300 1500 300 Q 1600 300 1760 520 Q 2060 680 2420 980 L 3500 1560 Z" fill="url(#mtnRock)" />
    <path d="M 1500 300 Q 1600 300 1760 520 Q 2060 680 2420 980 L 3500 1560 L 1900 1560 Q 1700 1100 1640 760 Q 1580 520 1500 300 Z" fill="#3a3280" opacity={0.35} />
    <path d="M 1270 510 Q 1420 300 1500 300 Q 1600 300 1740 510 Q 1690 486 1650 528 Q 1600 478 1550 536 Q 1500 476 1450 528 Q 1390 478 1340 520 Q 1310 496 1270 510 Z" fill="#f6efff" />
    <path d="M 1500 300 Q 1600 300 1740 510 Q 1690 486 1650 528 Q 1600 478 1560 520 Q 1560 420 1500 300 Z" fill="#d8ccf4" opacity={0.7} />
    {[
      [1180, 760, 0.9, "#7ff6ff"],
      [1800, 820, 1.0, "#ff9ad5"],
      [980, 980, 1.2, "#b59bff"],
      [2120, 1040, 1.1, "#7ff6ff"],
      [1460, 1080, 1.3, "#ffd36e"],
      [760, 1220, 1.1, "#ff9ad5"],
      [2420, 1260, 1.2, "#b59bff"],
    ].map(([cx, cy, s, c], i) => (
      <Crystal key={i} x={cx as number} y={cy as number} s={s as number} c={c as string} g={g} seed={i} />
    ))}
    <FloatIsle x={300} y={560} s={1.1} g={g} seed={1} />
    <FloatIsle x={2780} y={480} s={0.9} g={g} seed={5} />
    {/* drifting clouds */}
    {[
      [400, 1040, 1.4, 0.75],
      [1300, 920, 1.1, 0.7],
      [2300, 1080, 1.6, 0.75],
      [3300, 900, 1.2, 0.7],
      [-600, 900, 1.3, 0.7],
    ].map(([cx, cy, s, o], i) => (
      <Cloud key={i} x={cx + ((g * (0.6 + drift) + i * 300) % 600) - 300} y={cy} s={s} opacity={o} />
    ))}
    {/* rolling green hills */}
    <path d="M -2400 1500 Q -1400 1360 -400 1470 Q 400 1380 1200 1460 Q 2000 1370 2800 1460 Q 3600 1380 5600 1470 L 5600 2000 L -2400 2000 Z" fill="url(#greenHill)" />
    {Array.from({ length: 30 }, (_, i) => (
      <RainbowTree key={i} x={-1800 + i * 230} y={1500 + (i % 3) * 14} s={1.5 + (i % 2) * 0.3} c={["#b27bff", "#4fd8e8", "#ff9ad5", "#6bdc7a", "#5e8bff"][i % 5]} frame={g} seed={i} glow={0.2} />
    ))}
    {/* the meadow */}
    <path d="M -2400 1580 Q -1200 1530 0 1590 Q 1200 1530 2400 1590 Q 3600 1530 5600 1580 L 5600 3600 L -2400 3600 Z" fill="url(#meadow)" />
    {Array.from({ length: 60 }, (_, i) => {
      const x = -1600 + i * 104 + (i % 3) * 30;
      const y = 1660 + ((i * 53) % 110) + ((i * 17) % 4 === 0 ? 220 : 0);
      return <Flower key={i} x={x} y={y} color={["#ff8fa0", "#ffc75e", "#fff08a", "#c9a0ff", "#7fc8ff", "#ff9ad5"][i % 6]} frame={g} seed={i} scale={0.8 + (i % 3) * 0.15} />;
    })}
    {Array.from({ length: 70 }, (_, i) => {
      const x = -1600 + i * 90 + (i % 4) * 22;
      const y = 1640 + ((i * 37) % 300);
      const sway = Math.sin(g / 18 + i) * 4;
      return <path key={i} d={`M ${x - 10} ${y} Q ${x - 6 + sway} ${y - 26} ${x - 2 + sway * 1.5} ${y - 36} M ${x} ${y} Q ${x + 2 + sway} ${y - 30} ${x + 6 + sway * 1.5} ${y - 44} M ${x + 10} ${y} Q ${x + 10 + sway} ${y - 22} ${x + 16 + sway} ${y - 30}`} stroke="#2f8f6a" strokeWidth={4} fill="none" strokeLinecap="round" />;
    })}
  </>
);

// ---------- Draco's rock: flat top at (x, y - 120) ----------
export const BOULDER_TOP = 120;
export const Boulder: React.FC<{ x: number; y: number }> = ({ x, y }) => (
  <g transform={`translate(${x} ${y})`}>
    <ellipse cy={10} rx={190} ry={26} fill="#1b4f4c" opacity={0.5} />
    <path d="M -170 10 Q -190 -70 -120 -112 Q -40 -128 40 -124 Q 140 -126 168 -70 Q 190 -20 170 10 Z" fill="#9a93c8" />
    <path d="M 40 -124 Q 140 -126 168 -70 Q 190 -20 170 10 L 60 10 Q 110 -50 40 -124 Z" fill="#7c74ad" />
    <path d="M -120 -112 Q -40 -128 40 -124 Q 100 -124 130 -108 Q 40 -100 -40 -104 Q -100 -100 -120 -112 Z" fill="#7fd39a" />
    <ellipse cx={-80} cy={-70} rx={36} ry={14} fill="#fff" opacity={0.18} />
  </g>
);

// ---------- the small grassy hill Draco tries to jump from: top at (x, y - HILL_H) ----------
export const HILL_H = 150;
export const GrassHill: React.FC<{ x: number; y: number; g: number }> = ({ x, y, g }) => (
  <g transform={`translate(${x} ${y})`}>
    <path d={`M -380 20 Q -220 -${HILL_H} 0 -${HILL_H} Q 220 -${HILL_H} 380 20 Z`} fill="url(#greenHill)" />
    <path d={`M -200 -90 Q -100 -${HILL_H - 6} 0 -${HILL_H - 4} Q 60 -${HILL_H - 6} 90 -136`} stroke="#d6ffd8" strokeWidth={8} fill="none" strokeLinecap="round" opacity={0.5} />
    {[-220, -120, 120, 230].map((fx, i) => (
      <Flower key={fx} x={fx} y={-HILL_H * (1 - (fx / 380) ** 2) * 0.9 + 22} color={["#ff9ad5", "#fff08a", "#7fc8ff", "#c9a0ff"][i]} frame={g} seed={i + 9} scale={0.9} />
    ))}
  </g>
);

// ---------- the soft cloud of magical dust Draco lands on ----------
export const DustCloud: React.FC<{ x: number; y: number; s?: number; g: number; squish?: number; opacity?: number }> = ({ x, y, s = 1, g, squish = 0, opacity = 1 }) => (
  <g transform={`translate(${x} ${y}) scale(${s * (1 + squish * 0.1)} ${s * (1 - squish * 0.14)})`} opacity={opacity}>
    <ellipse cy={70} rx={200} ry={34} fill="#1b4f4c" opacity={0.3} />
    <circle cy={-10} r={230} fill="url(#pinkGlow)" opacity={0.45 + Math.sin(g / 8) * 0.1} />
    {[
      [-130, 20, 70],
      [-60, -18, 92],
      [40, -26, 100],
      [130, 14, 76],
      [0, 34, 90],
      [-90, 44, 60],
      [96, 46, 62],
    ].map(([cx, cy, r], i) => (
      <circle key={i} cx={cx + Math.sin(g / 14 + i) * 4} cy={cy + Math.cos(g / 16 + i) * 3} r={r} fill="url(#dustCloud)" />
    ))}
    {Array.from({ length: 9 }, (_, i) => (
      <Sparkle key={i} x={-150 + i * 38} y={-30 + Math.sin(g / 6 + i * 2) * 50} size={8 + (i % 3) * 4} opacity={0.5 + 0.5 * Math.sin(g / 5 + i)} color={i % 2 ? "#fff1a8" : "#ffffff"} rotate={g * 3 + i * 30} />
    ))}
  </g>
);

// ---------- the golden mountain the star projects onto the ground ----------
export const HoloMountain: React.FC<{ x: number; y: number; s?: number; g: number; reveal: number }> = ({ x, y, s = 1, g, reveal }) => (
  <g transform={`translate(${x} ${y}) scale(${s} ${s * reveal})`} opacity={Math.min(1, reveal * 1.4) * (0.85 + Math.sin(g / 5) * 0.08)}>
    <ellipse cy={0} rx={300} ry={44} fill="#ffe38a" opacity={0.55} />
    <ellipse cy={0} rx={220} ry={28} fill="#fff8d0" opacity={0.6} />
    <path d="M -260 0 L -120 -150 L -60 -110 L 30 -300 L 140 -120 L 180 -160 L 270 0 Z" fill="#ffe08a" opacity={0.4} stroke="#fff3b0" strokeWidth={8} strokeLinejoin="round" />
    <path d="M -10 -240 L 30 -300 L 72 -232 L 50 -220 L 30 -240 L 8 -222 Z" fill="#fffbe0" opacity={0.9} />
    {[
      [-80, -40],
      [60, -70],
      [120, -30],
      [-10, -120],
    ].map(([cx, cy], i) => (
      <Sparkle key={i} x={cx} y={cy} size={12} opacity={0.6 + 0.4 * Math.sin(g / 4 + i * 2)} color="#fff8d0" rotate={g * 2} />
    ))}
  </g>
);

// ---------- the glowing sky map of the moonlit castle; origin at its center ----------
export const CastleMap: React.FC<{ x: number; y: number; s?: number; g: number; reveal: number }> = ({ x, y, s = 1, g, reveal }) => {
  const W = 620;
  const H = 400;
  const tower = (tx: number, w: number, h: number, i: number) => (
    <g key={i}>
      <rect x={tx - w / 2} y={60 - h} width={w} height={h} fill="#2a2466" stroke="#ffe38a" strokeWidth={4} />
      <path d={`M ${tx - w / 2 - 10} ${60 - h} L ${tx} ${60 - h - w * 1.1} L ${tx + w / 2 + 10} ${60 - h} Z`} fill="#4a3c9a" stroke="#ffe38a" strokeWidth={4} strokeLinejoin="round" />
      <path d={`M ${tx} ${60 - h - w * 1.1} L ${tx} ${60 - h - w * 1.1 - 34} L ${tx + 22} ${60 - h - w * 1.1 - 26} L ${tx} ${60 - h - w * 1.1 - 18}`} fill="#ffd34f" stroke="#ffd34f" strokeWidth={3} />
      <rect x={tx - 8} y={60 - h + 26} width={16} height={24} rx={8} fill="#ffcf8a" opacity={0.7 + 0.3 * Math.sin(g / 9 + i)} />
    </g>
  );
  return (
    <g transform={`translate(${x} ${y}) scale(${s * (0.4 + 0.6 * reveal)})`} opacity={reveal}>
      <circle r={420} fill="url(#flowerBurst)" opacity={0.35} />
      <rect x={-W / 2} y={-H / 2} width={W} height={H} rx={40} fill="url(#mapNight)" opacity={0.92} stroke="#ffe38a" strokeWidth={10} />
      <rect x={-W / 2 + 18} y={-H / 2 + 18} width={W - 36} height={H - 36} rx={28} fill="none" stroke="#fff3b0" strokeWidth={3} strokeDasharray="10 12" opacity={0.7} />
      <g transform="translate(-170 -100)">
        <circle r={54} fill="url(#moonGlow)" />
        <path d="M 10 -40 A 40 40 0 1 0 10 40 A 32 32 0 1 1 10 -40 Z" fill="#fff4c8" />
      </g>
      {Array.from({ length: 12 }, (_, i) => (
        <circle key={i} cx={-260 + random(`cm${i}`) * 520} cy={-170 + random(`cn${i}`) * 140} r={2 + (i % 3)} fill="#fff" opacity={0.5 + 0.5 * Math.sin(g / 6 + i)} />
      ))}
      <g transform="translate(70 30)">
        {tower(-110, 50, 150, 0)}
        {tower(110, 50, 150, 1)}
        <rect x={-90} y={-60} width={180} height={120} fill="#2a2466" stroke="#ffe38a" strokeWidth={4} />
        <path d="M -20 60 L -20 10 A 20 20 0 0 1 20 10 L 20 60 Z" fill="#ffcf8a" opacity={0.85} />
        {tower(0, 66, 200, 2)}
        <ellipse cx={-120} cy={78} rx={110} ry={30} fill="#f6efff" opacity={0.9} />
        <ellipse cx={30} cy={86} rx={150} ry={34} fill="#fff" opacity={0.9} />
        <ellipse cx={150} cy={74} rx={90} ry={26} fill="#f6efff" opacity={0.9} />
      </g>
      <path d="M -270 160 Q -180 120 -120 150 Q -60 176 0 130" stroke="#ffd34f" strokeWidth={6} strokeDasharray="4 14" strokeLinecap="round" fill="none" />
      <Sparkle x={0} y={130} size={16} color="#ffd34f" rotate={g * 3} />
    </g>
  );
};

// ---------- the breeze: soft curling streaks and petals blowing past ----------
export const Breeze: React.FC<{ f: number; x: number; y: number; w: number; h: number; strength: number }> = ({ f, x, y, w, h, strength }) => {
  if (strength <= 0) return null;
  return (
    <g opacity={strength}>
      {Array.from({ length: 9 }, (_, i) => {
        const span = w + 600;
        const px = x - 300 + ((f * 22 + i * (span / 9)) % span);
        const py = y + random(`bz${i}`) * h + Math.sin(f / 9 + i) * 20;
        return <path key={i} d={`M ${px - 220} ${py} Q ${px - 110} ${py - 30} ${px} ${py} Q ${px + 50} ${py + 16} ${px + 60} ${py - 8}`} stroke="#ffffff" strokeWidth={6} strokeLinecap="round" fill="none" opacity={0.55} />;
      })}
      {Array.from({ length: 14 }, (_, i) => {
        const span = w + 400;
        const px = x - 200 + ((f * 16 + i * (span / 14)) % span);
        const py = y + random(`bp${i}`) * h + Math.sin(f / 7 + i * 2) * 40;
        return <ellipse key={i} cx={px} cy={py} rx={12} ry={7} fill={["#ff9ad5", "#fff08a", "#c9a0ff"][i % 3]} transform={`rotate(${f * 6 + i * 40} ${px} ${py})`} />;
      })}
    </g>
  );
};
