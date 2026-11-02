import React from "react";
import { random } from "remotion";
import { Flower, Mushroom, Sparkle, StarField, Moon, Tree, Fireflies } from "../story/scenery";

export const PropDefs: React.FC = () => (
  <>
    <linearGradient id="ancientBark" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0%" stopColor="#2e2a55" />
      <stop offset="45%" stopColor="#4d4478" />
      <stop offset="100%" stopColor="#262248" />
    </linearGradient>
    <linearGradient id="rootBark" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stopColor="#4f4679" />
      <stop offset="100%" stopColor="#2f2a56" />
    </linearGradient>
    <linearGradient id="doorWood" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0%" stopColor="#7a4a2a" />
      <stop offset="50%" stopColor="#9a6236" />
      <stop offset="100%" stopColor="#6a3e22" />
    </linearGradient>
    <radialGradient id="doorLight" cx="50%" cy="60%" r="70%">
      <stop offset="0%" stopColor="#fffbe0" />
      <stop offset="55%" stopColor="#ffe08a" />
      <stop offset="100%" stopColor="#ffb648" />
    </radialGradient>
    <radialGradient id="goldFlood">
      <stop offset="0%" stopColor="#fff0b8" stopOpacity="0.95" />
      <stop offset="45%" stopColor="#ffcf6e" stopOpacity="0.45" />
      <stop offset="100%" stopColor="#ffb648" stopOpacity="0" />
    </radialGradient>
    <linearGradient id="goldRay" x1="0" y1="1" x2="0" y2="0">
      <stop offset="0%" stopColor="#fff0b8" stopOpacity="0.75" />
      <stop offset="100%" stopColor="#ffd36e" stopOpacity="0" />
    </linearGradient>
    <linearGradient id="hollowWall" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stopColor="#2c1c4e" />
      <stop offset="45%" stopColor="#5b3468" />
      <stop offset="70%" stopColor="#a65f62" />
      <stop offset="100%" stopColor="#e0a35e" />
    </linearGradient>
    <linearGradient id="tinyGround" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stopColor="#3fa37e" />
      <stop offset="100%" stopColor="#14584f" />
    </linearGradient>
    <linearGradient id="tinyGroundFar" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stopColor="#6a8f8a" />
      <stop offset="100%" stopColor="#2b6a60" />
    </linearGradient>
    <linearGradient id="tinyStream" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0%" stopColor="#7ff6ff" />
      <stop offset="100%" stopColor="#b59bff" />
    </linearGradient>
    <linearGradient id="nightOutside" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stopColor="#0c1a3a" />
      <stop offset="100%" stopColor="#1b4a5a" />
    </linearGradient>
    <radialGradient id="spriteBody" cx="42%" cy="35%" r="70%">
      <stop offset="0%" stopColor="#f3fff4" />
      <stop offset="55%" stopColor="#a9f5d0" />
      <stop offset="100%" stopColor="#62d6b4" />
    </radialGradient>
    <radialGradient id="spriteGlow">
      <stop offset="0%" stopColor="#c9ffe4" stopOpacity="0.85" />
      <stop offset="45%" stopColor="#8df2cf" stopOpacity="0.3" />
      <stop offset="100%" stopColor="#8df2cf" stopOpacity="0" />
    </radialGradient>
    <linearGradient id="keyGold" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stopColor="#fff4b8" />
      <stop offset="50%" stopColor="#ffd34f" />
      <stop offset="100%" stopColor="#e89a1e" />
    </linearGradient>
    <linearGradient id="mapPanel" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stopColor="#2b2a6e" stopOpacity="0.95" />
      <stop offset="100%" stopColor="#4a3a7c" stopOpacity="0.92" />
    </linearGradient>
    <linearGradient id="mapBeam" x1="0" y1="1" x2="0" y2="0">
      <stop offset="0%" stopColor="#fff0b8" stopOpacity="0.8" />
      <stop offset="100%" stopColor="#ffd36e" stopOpacity="0.12" />
    </linearGradient>
    <clipPath id="doorArch">
      <path d="M -85 0 L -85 -165 A 85 85 0 0 1 85 -165 L 85 0 Z" />
    </clipPath>
    <clipPath id="hollowDoorway">
      <path d={HOLLOW_DOORWAY} />
    </clipPath>
  </>
);

// ---------- the night forest, drawn once and shared by every outdoor shot ----------
export const Woods: React.FC<{ g: number; fireflies?: boolean }> = ({ g, fireflies = true }) => (
  <>
    <rect x={-1000} y={-1200} width={4400} height={4800} fill="url(#forestBg)" />
    <StarField frame={g} w={2400} h={1000} count={130} seed="w2" />
    <Moon x={330} y={300} r={85} frame={g} />
    {[0, 1, 2].map((i) => (
      <polygon key={i} points={`330,300 ${900 + i * 170},2200 ${640 + i * 170},2200`} fill="url(#moonbeam)" />
    ))}
    {[-180, 170, 520, 1640, 1990, 2340].map((tx, i) => (
      <Tree key={tx} x={tx} y={1420} scale={0.78} tint={0.45 + (i % 2) * 0.12} />
    ))}
    <path d="M -1000 1540 Q 300 1470 1120 1520 Q 1900 1470 3400 1540 L 3400 3000 L -1000 3000 Z" fill="#163a4a" />
    <path d="M -1000 1800 Q 300 1730 1120 1745 Q 1900 1730 3400 1800 L 3400 1900 Q 1900 1830 1120 1850 Q 300 1830 -1000 1900 Z" fill="#1f4c58" opacity={0.75} />
    {[
      [20, 1660, "pink", 0.8],
      [330, 1930, "cyan", 0.85],
      [640, 1610, "cyan", 0.6],
      [1700, 1640, "pink", 0.8],
      [1900, 1900, "cyan", 0.9],
    ].map(([x, y, c, s], i) => (
      <Mushroom key={i} x={x as number} y={y as number} color={c as "pink" | "cyan"} scale={s as number} frame={g} seed={i} />
    ))}
    {[
      [120, 1880, "#ff9ad5"],
      [480, 1910, "#ffd36e"],
      [780, 1930, "#a8b8ff"],
      [1480, 1920, "#ff9ad5"],
      [1760, 1880, "#ffd36e"],
    ].map(([x, y, c], i) => (
      <Flower key={i} x={x as number} y={y as number} color={c as string} frame={g} seed={i} scale={0.9} />
    ))}
    {fireflies && <Fireflies frame={g} count={26} x={-100} y={700} w={2500} h={1100} seed="w2f" />}
  </>
);

// ---------- the giant ancient tree: origin at the base of the door ----------
export const GiantTree: React.FC<{ x: number; y: number; g: number; shake?: number; children?: React.ReactNode }> = ({ x, y, g, shake = 0, children }) => (
  <g transform={`translate(${x + shake} ${y})`}>
    {[
      [-640, -1520, 330, "#1d4c55"],
      [640, -1560, 340, "#1d4c55"],
      [-330, -1760, 390, "#22585d"],
      [340, -1790, 400, "#22585d"],
      [0, -1960, 430, "#1d4c55"],
      [-240, -2020, 240, "#2a6a6a"],
    ].map(([cx, cy, r, c], i) => (
      <circle key={i} cx={cx as number} cy={cy as number} r={r as number} fill={c as string} />
    ))}
    <path d="M -650 44 Q -470 -30 -395 -210 Q -335 -500 -330 -900 Q -320 -1300 -300 -1820 L 300 -1820 Q 320 -1300 330 -900 Q 335 -500 395 -210 Q 470 -30 650 44 Z" fill="url(#ancientBark)" />
    {/* bark */}
    {[
      "M -250 -1700 Q -220 -1200 -255 -760 Q -270 -520 -318 -300",
      "M -130 -1760 Q -160 -1300 -120 -900 Q -96 -640 -150 -430",
      "M 40 -1780 Q 10 -1400 50 -1040 Q 76 -760 30 -520",
      "M 170 -1730 Q 200 -1300 160 -880 Q 140 -620 190 -420",
      "M 270 -1680 Q 245 -1200 275 -760 Q 290 -520 335 -290",
    ].map((d, i) => (
      <path key={i} d={d} stroke="#262148" strokeWidth={11} strokeLinecap="round" fill="none" opacity={0.7} />
    ))}
    <ellipse cx={-120} cy={-1020} rx={52} ry={74} fill="#2a2550" stroke="#5f5590" strokeWidth={9} />
    <ellipse cx={-120} cy={-1020} rx={24} ry={38} fill="#17142f" />
    {/* glowing moss */}
    {[
      [-300, -640, 54],
      [-340, -420, 40],
      [300, -760, 46],
      [350, -360, 56],
      [220, -1180, 40],
    ].map(([cx, cy, r], i) => (
      <g key={i}>
        <circle cx={cx} cy={cy} r={r * 2.2} fill="url(#cyanGlow)" opacity={0.2 + Math.sin(g / 18 + i) * 0.07} />
        <ellipse cx={cx} cy={cy} rx={r} ry={r * 0.6} fill="#4fb07a" opacity={0.7} />
      </g>
    ))}
    {/* hanging vines with little lights */}
    {[-420, -210, 250, 470].map((vx, i) => {
      const len = 300 + (i % 2) * 180;
      const sway = Math.sin(g / 28 + i) * 16;
      return (
        <g key={vx}>
          <path d={`M ${vx} -1500 Q ${vx + sway} ${-1500 + len / 2} ${vx + sway * 1.6} ${-1500 + len}`} stroke="#2f7a6a" strokeWidth={8} fill="none" strokeLinecap="round" />
          <circle cx={vx + sway * 1.6} cy={-1500 + len} r={46} fill="url(#warmGlow)" opacity={0.55} />
          <circle cx={vx + sway * 1.6} cy={-1500 + len} r={10} fill="#fff1a8" />
        </g>
      );
    })}
    {/* the hollow the little door sits in */}
    <path d="M -125 20 L -125 -170 A 125 125 0 0 1 125 -170 L 125 20 Z" fill="#17142f" />
    {children}
    {/* roots that hide the door until you are close */}
    <path d="M -96 40 Q -118 -60 -128 -160 Q -150 -270 -300 -330 Q -240 -240 -252 -110 Q -262 -10 -400 54 Z" fill="url(#rootBark)" stroke="#1f1b40" strokeWidth={6} />
    <path d="M 96 40 Q 118 -60 128 -160 Q 150 -270 300 -330 Q 240 -240 252 -110 Q 262 -10 400 54 Z" fill="url(#rootBark)" stroke="#1f1b40" strokeWidth={6} />
    <path d="M -180 -210 Q -196 -110 -210 -30 M 180 -210 Q 196 -110 210 -30" stroke="#6a60a0" strokeWidth={7} strokeLinecap="round" fill="none" opacity={0.65} />
    <path d="M -420 58 Q -520 -10 -620 54 Z M 420 58 Q 520 -10 620 54 Z" fill="#37315f" />
  </g>
);

// The swirls and the moon-and-star on the door. Each is traced in gold as `glow` rises.
const PATTERN = [
  "M -44 -38 Q -62 -70 -40 -84 Q -18 -92 -20 -68 Q -24 -54 -36 -62",
  "M 44 -38 Q 62 -70 40 -84 Q 18 -92 20 -68 Q 24 -54 36 -62",
  "M -58 -128 Q -66 -168 -38 -188 Q -16 -200 -16 -176 Q -20 -160 -34 -168",
  "M 58 -128 Q 66 -168 38 -188 Q 16 -200 16 -176 Q 20 -160 34 -168",
  "M -66 -18 L 66 -18",
  "M 0 -218 L 0 -196",
  "M -48 -108 Q 0 -86 48 -108",
];
const DOOR_MOON = "M -8 -158 A 26 26 0 1 0 -8 -106 A 34 34 0 0 1 -8 -158 Z";
const DOOR_STAR = "M 16 -146 l 4 9 l 10 1.5 l -7 7 l 2 10 l -9 -5 l -9 5 l 2 -10 l -7 -7 l 10 -1.5 Z";

export const LittleDoor: React.FC<{ x?: number; y?: number; open?: number; glow?: number; lever?: number; light?: number; frame: number }> = ({
  x = 0,
  y = 0,
  open = 0,
  glow = 0,
  lever = 0,
  light = 1,
  frame,
}) => {
  const swing = Math.cos((open * 104 * Math.PI) / 180);
  const pulse = 0.92 + Math.sin(frame / 7) * 0.08;
  const shine = Math.min(1, glow) * pulse;
  return (
    <g transform={`translate(${x} ${y})`}>
      <circle cy={-125} r={190 + shine * 160} fill="url(#warmGlow)" opacity={0.2 + shine * 0.6} />
      {/* stone arch */}
      <path d="M -106 6 L -106 -165 A 106 106 0 0 1 106 -165 L 106 6 Z" fill="#4c4375" stroke="#2a2550" strokeWidth={5} />
      {[-150, -115, -80, -45, -10].map((sy) => (
        <path key={sy} d={`M -106 ${sy} L -85 ${sy} M 85 ${sy} L 106 ${sy}`} stroke="#2a2550" strokeWidth={4} />
      ))}
      <path d="M -85 0 L -85 -165 A 85 85 0 0 1 85 -165 L 85 0 Z" fill="url(#doorLight)" opacity={Math.min(1, open * 3) * light} />
      <path d="M -85 0 L -85 -165 A 85 85 0 0 1 85 -165 L 85 0 Z" fill="#1c1838" opacity={open < 0.02 ? 1 : 1 - light} />
      {/* the swinging leaf, hinged on its left side */}
      <g transform={`translate(-85 0) scale(${swing} 1) translate(85 0)`}>
        <g clipPath="url(#doorArch)">
          <rect x={-85} y={-260} width={170} height={270} fill="url(#doorWood)" />
          {[-51, -17, 17, 51].map((px) => (
            <line key={px} x1={px} y1={-260} x2={px} y2={10} stroke="#5a3218" strokeWidth={4} />
          ))}
          <rect x={-85} y={-44} width={170} height={12} fill="#4f2c14" opacity={0.75} />
          <rect x={-85} y={-214} width={170} height={10} fill="#4f2c14" opacity={0.6} />
        </g>
        {/* soft halo behind the gold lines */}
        <g opacity={shine} filter="url(#blur6)">
          {PATTERN.map((d) => (
            <path key={d} d={d} stroke="#ffd36e" strokeWidth={9} fill="none" strokeLinecap="round" />
          ))}
          <path d={DOOR_MOON} fill="#ffd36e" />
          <path d={DOOR_STAR} fill="#ffd36e" />
        </g>
        {PATTERN.map((d) => (
          <path key={d} d={d} stroke={glow > 0.5 ? "#fff4b8" : "#f0bb4e"} strokeWidth={4.5} fill="none" strokeLinecap="round" opacity={0.6 + shine * 0.4} />
        ))}
        <path d={DOOR_MOON} fill="#ffd75e" opacity={0.65 + shine * 0.35} />
        <path d={DOOR_STAR} fill="#fff1a8" opacity={0.65 + shine * 0.35} />
        {/* tiny golden handle */}
        <circle cx={58} cy={-96} r={15} fill="#b77e1e" />
        <g transform={`translate(58 -96) rotate(${lever})`}>
          <rect x={-5} y={-3} width={10} height={32} rx={5} fill="url(#keyGold)" />
          <circle r={10} fill="url(#keyGold)" stroke="#a86f18" strokeWidth={2} />
        </g>
      </g>
    </g>
  );
};

export const HANDLE = { x: 58, y: -96 };

// ---------- the tiny friendly creature: feet at (0, 0), about 140 tall at scale 1 ----------
export const TinySprite: React.FC<{
  x: number;
  y: number;
  scale?: number;
  frame: number;
  wave?: number; // right-arm raise, 0..1, oscillates while > 0
  armsUp?: boolean;
  look?: { x: number; y: number };
  happy?: boolean;
  squash?: number;
  blink?: number;
  rotate?: number;
}> = ({ x, y, scale = 1, frame, wave = 0, armsUp = false, look = { x: 0, y: 0 }, happy = false, squash = 1, blink = 1, rotate = 0 }) => {
  const sway = Math.sin(frame / 9) * 6;
  const waveAngle = wave > 0 ? -60 * wave - 58 * wave + Math.sin(frame * 0.6) * 24 * wave : -22;
  const leftAngle = armsUp ? 118 : 22;
  const rightAngle = armsUp ? -118 + Math.sin(frame * 0.5) * 8 : waveAngle;
  return (
    <g transform={`translate(${x} ${y}) rotate(${rotate}) scale(${scale * (2 - squash)} ${scale * squash})`}>
      <circle cy={-70} r={135} fill="url(#spriteGlow)" opacity={0.8 + Math.sin(frame / 8) * 0.2} />
      <ellipse cx={-20} cy={-5} rx={17} ry={10} fill="#62d6b4" />
      <ellipse cx={20} cy={-5} rx={17} ry={10} fill="#62d6b4" />
      <g transform="translate(-42 -62)">
        <rect x={-8} y={0} width={16} height={36} rx={8} fill="#7fe6c4" transform={`rotate(${leftAngle})`} />
      </g>
      <g transform="translate(42 -62)">
        <rect x={-8} y={0} width={16} height={36} rx={8} fill="#7fe6c4" transform={`rotate(${rightAngle})`} />
      </g>
      <path d="M -50 -8 Q -62 -112 0 -116 Q 62 -112 50 -8 Q 0 2 -50 -8 Z" fill="url(#spriteBody)" />
      {/* sprout with a glowing bud */}
      <g transform={`translate(0 -114) rotate(${sway})`}>
        <path d="M 0 0 Q -2 -16 0 -30" stroke="#3fa37e" strokeWidth={5} fill="none" strokeLinecap="round" />
        <ellipse cx={-12} cy={-22} rx={11} ry={6} fill="#5fd18e" transform="rotate(25 -12 -22)" />
        <circle cy={-36} r={22} fill="url(#warmGlow)" opacity={0.9} />
        <circle cy={-36} r={8} fill="#fff1a8" />
      </g>
      <ellipse cx={-29} cy={-48} rx={10} ry={6} fill="#ff97a6" opacity={0.6} />
      <ellipse cx={29} cy={-48} rx={10} ry={6} fill="#ff97a6" opacity={0.6} />
      {happy && blink > 0.5 ? (
        <>
          <path d="M -32 -68 Q -21 -82 -10 -68" stroke="#1f4a42" strokeWidth={5} strokeLinecap="round" fill="none" />
          <path d="M 10 -68 Q 21 -82 32 -68" stroke="#1f4a42" strokeWidth={5} strokeLinecap="round" fill="none" />
        </>
      ) : (
        [-21, 21].map((ex) => (
          <g key={ex} transform={`translate(${ex} -70) scale(1 ${blink})`}>
            <ellipse rx={12} ry={14} fill="#173a35" />
            <circle cx={-3 + look.x * 3} cy={-5 + look.y * 3} r={4.5} fill="#fff" />
            <circle cx={4 + look.x * 3} cy={4 + look.y * 3} r={2} fill="#fff" opacity={0.85} />
          </g>
        ))
      )}
      <path d={happy ? "M -11 -48 Q 0 -32 11 -48 Z" : "M -9 -48 Q 0 -40 9 -48"} fill={happy ? "#86303d" : "none"} stroke={happy ? "#86303d" : "#1f4a42"} strokeWidth={4} strokeLinecap="round" strokeLinejoin="round" />
    </g>
  );
};

// ---------- the tiny golden key: origin at the middle of its shaft ----------
export const GoldenKey: React.FC<{ x: number; y: number; scale?: number; rotate?: number; glow?: number }> = ({ x, y, scale = 1, rotate = 0, glow = 0.5 }) => (
  <g transform={`translate(${x} ${y}) rotate(${rotate}) scale(${scale})`}>
    <circle r={100 + glow * 40} fill="url(#starGlow)" opacity={0.45 + glow * 0.55} />
    <circle cy={-50} r={25} fill="none" stroke="#5a3208" strokeWidth={17} />
    <rect x={-9} y={-32} width={18} height={84} rx={7} fill="#5a3208" />
    <rect x={2} y={21} width={26} height={15} rx={3} fill="#5a3208" />
    <rect x={2} y={35} width={21} height={15} rx={3} fill="#5a3208" />
    <rect x={-6} y={-30} width={12} height={78} rx={5} fill="url(#keyGold)" />
    <rect x={4} y={24} width={20} height={9} rx={2} fill="url(#keyGold)" stroke="#b77e1e" strokeWidth={2} />
    <rect x={4} y={38} width={15} height={9} rx={2} fill="url(#keyGold)" stroke="#b77e1e" strokeWidth={2} />
    <circle cy={-50} r={25} fill="none" stroke="url(#keyGold)" strokeWidth={11} />
    <path d="M 0 -64 l 4 9 l 10 1.5 l -7 7 l 2 10 l -9 -5 l -9 5 l 2 -10 l -7 -7 l 10 -1.5 Z" fill="#fff4b8" />
  </g>
);

// ---------- inside the tree: the tiny magical world ----------
export const HOLLOW_DOORWAY = "M 1070 930 L 1070 680 A 430 430 0 0 1 1930 680 L 1930 930 Z";

const TinyHouse: React.FC<{ x: number; y: number; scale?: number; roof: string; frame: number; seed: number }> = ({ x, y, scale = 1, roof, frame, seed }) => {
  const lit = 0.85 + Math.sin(frame / 11 + seed) * 0.15;
  return (
    <g transform={`translate(${x} ${y}) scale(${scale})`}>
      <circle cy={-90} r={190} fill="url(#warmGlow)" opacity={0.28 * lit} />
      <rect x={38} y={-214} width={22} height={60} rx={4} fill="#8b6b57" />
      {[0, 1, 2].map((i) => {
        const t = ((frame + i * 30 + seed * 11) % 90) / 90;
        return <circle key={i} cx={49 + Math.sin(t * 6 + i) * 10} cy={-222 - t * 90} r={7 + t * 12} fill="#fff" opacity={(1 - t) * 0.22} />;
      })}
      <path d="M -70 0 Q -84 -80 -66 -130 L 66 -130 Q 84 -80 70 0 Z" fill="#f6e6c8" />
      <path d="M -112 -118 Q -104 -214 0 -218 Q 104 -214 112 -118 Q 0 -94 -112 -118 Z" fill={roof} />
      {[
        [-52, -152, 13],
        [8, -182, 15],
        [58, -146, 11],
      ].map(([cx, cy, r], i) => (
        <circle key={i} cx={cx} cy={cy} r={r} fill="#fff" opacity={0.75} />
      ))}
      <path d="M -24 0 L -24 -52 A 24 24 0 0 1 24 -52 L 24 0 Z" fill="#8b4f2a" />
      <circle cx={13} cy={-30} r={4} fill="#ffd75e" />
      <circle cx={-44} cy={-78} r={14} fill="#ffcf6e" opacity={lit} stroke="#8b6b57" strokeWidth={4} />
      <circle cx={44} cy={-78} r={14} fill="#ffcf6e" opacity={lit} stroke="#8b6b57" strokeWidth={4} />
    </g>
  );
};

export const CurlyPlant: React.FC<{ x: number; y: number; scale?: number; color: string; frame: number; seed: number }> = ({ x, y, scale = 1, color, frame, seed }) => (
  <g transform={`translate(${x} ${y}) scale(${scale}) rotate(${Math.sin(frame / 22 + seed) * 4})`}>
    <circle cy={-70} r={80} fill={color} opacity={0.14} />
    {[-1, 0, 1].map((s) => (
      <path
        key={s}
        d={`M 0 0 Q ${s * 22} -56 ${s * 40} -90 Q ${s * 54} -124 ${s * 26} -128 Q ${s * 8} -124 ${s * 20} -104`}
        stroke={color}
        strokeWidth={9}
        strokeLinecap="round"
        fill="none"
      />
    ))}
    {[-1, 0, 1].map((s) => (
      <circle key={s} cx={s * 20} cy={-104} r={6} fill="#fff6c2" />
    ))}
  </g>
);

const LANTERNS = [
  [300, 1040],
  [480, 1080],
  [660, 1096],
  [840, 1080],
  [1020, 1040],
];

export const TinyWorldBack: React.FC<{ g: number }> = ({ g }) => (
  <>
    <rect x={-400} y={-600} width={3400} height={3400} fill="url(#hollowWall)" />
    {/* growth rings of the inside of the tree */}
    {[0, 1, 2, 3, 4, 5].map((i) => (
      <ellipse key={i} cx={1500} cy={680} rx={560 + i * 190} ry={520 + i * 170} fill="none" stroke="#2c1c4e" strokeWidth={13} opacity={0.3} />
    ))}
    {/* glowing roots hanging from above */}
    {[140, 420, 760, 2060, 2300].map((rx, i) => {
      const sway = Math.sin(g / 26 + i) * 10;
      const len = 420 + (i % 3) * 120;
      return (
        <g key={rx}>
          <path d={`M ${rx} -100 Q ${rx + 40} ${len / 2} ${rx + sway} ${len}`} stroke="#3c2a5e" strokeWidth={22} fill="none" strokeLinecap="round" />
          <circle cx={rx + sway} cy={len} r={70} fill="url(#pinkGlow)" opacity={0.7} />
          <circle cx={rx + sway} cy={len} r={12} fill="#ffd6f2" />
        </g>
      );
    })}
  </>
);

export const TinyWorldFloor: React.FC<{ g: number }> = ({ g }) => (
  <>
    {/* a string of lanterns over the village */}
    <path d={`M 170 960 Q 660 1180 1160 960`} stroke="#3c2a5e" strokeWidth={5} fill="none" />
    {LANTERNS.map(([lx, ly], i) => (
      <g key={i} transform={`translate(${lx} ${ly}) rotate(${Math.sin(g / 20 + i) * 6})`}>
        <circle cy={20} r={56} fill="url(#warmGlow)" opacity={0.7} />
        <rect x={-13} y={2} width={26} height={36} rx={11} fill={["#ff9ad5", "#ffd36e", "#7ff6ff", "#b59bff", "#ffd36e"][i]} />
      </g>
    ))}
    <path d="M -400 1270 Q 200 1110 760 1210 Q 1300 1090 1800 1200 Q 2300 1110 3000 1260 L 3000 2800 L -400 2800 Z" fill="url(#tinyGroundFar)" />
    {/* far houses */}
    <TinyHouse x={200} y={1290} scale={0.72} roof="#c98cf0" frame={g} seed={1} />
    <TinyHouse x={1090} y={1300} scale={0.62} roof="#7fc8ff" frame={g} seed={2} />
    <TinyHouse x={1910} y={1290} scale={0.66} roof="#ffb36b" frame={g} seed={3} />
    {/* steps from the door down to the village */}
    {[0, 1, 2].map((i) => (
      <rect key={i} x={1320 - i * 34} y={956 + i * 64} width={360 + i * 68} height={64} rx={14} fill={["#a06a52", "#8b5a48", "#764b40"][i]} stroke="#4f3048" strokeWidth={5} />
    ))}
    <path d="M -400 1420 Q 300 1310 900 1400 Q 1500 1290 2100 1400 Q 2600 1330 3000 1420 L 3000 2800 L -400 2800 Z" fill="url(#tinyGround)" />
    {/* the sparkling stream with a tiny bridge */}
    <path d="M -400 1700 Q 240 1620 560 1700 Q 880 1790 1100 1760 Q 1500 1720 2000 1810 Q 2500 1880 3000 1800 L 3000 1880 Q 2500 1960 2000 1890 Q 1500 1800 1100 1840 Q 880 1870 560 1780 Q 240 1700 -400 1780 Z" fill="url(#tinyStream)" opacity={0.75} />
    {Array.from({ length: 22 }, (_, i) => {
      const sx = (i * 141 + g * 2.2) % 2600 - 200;
      const sy = 1745 + Math.sin(sx / 240) * 44 + (i % 3) * 14;
      return <Sparkle key={i} x={sx} y={sy} size={7 + (i % 3) * 3} opacity={0.5 + 0.5 * Math.sin(g / 6 + i)} color="#fff" />;
    })}
    <path d="M 480 1830 Q 640 1610 800 1850" fill="none" stroke="#4f3048" strokeWidth={44} strokeLinecap="round" />
    <path d="M 480 1830 Q 640 1610 800 1850" fill="none" stroke="#a06a52" strokeWidth={34} strokeLinecap="round" />
    {/* near village */}
    <TinyHouse x={430} y={1530} roof="#ff8fb8" frame={g} seed={4} />
    <TinyHouse x={850} y={1500} scale={0.82} roof="#ffd36e" frame={g} seed={5} />
    <TinyHouse x={2190} y={1540} roof="#8fe39c" frame={g} seed={6} />
    {[
      [90, 1560, "#7ff6ff", 1.2],
      [650, 1540, "#ff9ad5", 1.05],
      [1060, 1520, "#ffd36e", 1.1],
      [1940, 1520, "#b59bff", 1.15],
      [2400, 1560, "#7ff6ff", 1.2],
      [1120, 1900, "#ff9ad5", 1.4],
      [1900, 1920, "#ffd36e", 1.3],
    ].map(([x, y, c, s], i) => (
      <CurlyPlant key={i} x={x as number} y={y as number} color={c as string} scale={s as number} frame={g} seed={i} />
    ))}
    {[
      [250, 1620, "cyan", 1.15],
      [1010, 1680, "pink", 1.2],
      [720, 2040, "pink", 1.6],
      [260, 1980, "cyan", 1.4],
      [2030, 1640, "cyan", 1.2],
      [2340, 1940, "pink", 1.55],
    ].map(([x, y, c, s], i) => (
      <Mushroom key={i} x={x as number} y={y as number} color={c as "pink" | "cyan"} scale={s as number} frame={g} seed={i + 4} />
    ))}
    {[
      [1160, 1980, "#ffd36e"],
      [1830, 1990, "#ff9ad5"],
      [1560, 2010, "#a8b8ff"],
    ].map(([x, y, c], i) => (
      <Flower key={i} x={x as number} y={y as number} color={c as string} frame={g} seed={i} scale={1.15} />
    ))}
  </>
);

// ---------- the map the key projects: drawn around (0, 0), about 820 x 590 ----------
const RAINBOW = ["#ff6b6b", "#ff9f43", "#ffd93d", "#6bdc7a", "#4fd8e8", "#5e8bff", "#b27bff"];

const route = (t: number) => {
  // from the old tree at the bottom left to the rainbow forest at the top right
  const x = -270 + t * 510 + Math.sin(t * 7.2) * 70 * (1 - t * 0.5);
  const y = 190 - t * 300 + Math.sin(t * 4.1) * 26;
  return { x, y };
};

export const MagicMap: React.FC<{ frame: number; reveal: number; pathOn: number; forestOn: number }> = ({ frame, reveal, pathOn, forestOn }) => {
  if (reveal <= 0) return null;
  const end = route(1);
  return (
    <g opacity={Math.min(1, reveal * 2)} transform={`scale(${0.25 + 0.75 * reveal} ${reveal})`}>
      <rect x={-410} y={-295} width={820} height={590} rx={46} fill="url(#mapPanel)" />
      <rect x={-410} y={-295} width={820} height={590} rx={46} fill="none" stroke="#ffd36e" strokeWidth={7} />
      <rect x={-386} y={-271} width={772} height={542} rx={30} fill="none" stroke="#ffd36e" strokeWidth={2.5} strokeDasharray="8 12" opacity={0.65} />
      {/* faint grid so it reads as a chart */}
      {[-240, -120, 0, 120, 240].map((gx) => (
        <line key={gx} x1={gx} y1={-262} x2={gx} y2={262} stroke="#cfe0ff" strokeWidth={1.5} opacity={0.14} />
      ))}
      {[-160, -60, 40, 140].map((gy) => (
        <line key={gy} x1={-378} y1={gy} x2={378} y2={gy} stroke="#cfe0ff" strokeWidth={1.5} opacity={0.14} />
      ))}
      {/* hills and a river */}
      <path d="M -378 70 Q -280 -30 -190 60 Q -110 -40 -10 70 Q 60 10 130 70" stroke="#ffe9a8" strokeWidth={4} fill="none" opacity={0.5} strokeLinecap="round" />
      <path d="M 60 262 Q 110 170 240 150 Q 330 130 378 60" stroke="#7ff6ff" strokeWidth={8} fill="none" opacity={0.45} strokeLinecap="round" />
      {/* the old tree and its door: where they are now */}
      <g transform="translate(-300 222)">
        <rect x={-20} y={-74} width={40} height={74} rx={8} fill="#7a6ea8" />
        <circle cx={-34} cy={-96} r={38} fill="#2f8f7c" />
        <circle cx={34} cy={-98} r={40} fill="#2f8f7c" />
        <circle cy={-128} r={46} fill="#3aa98f" />
        <path d="M -9 0 L -9 -20 A 9 9 0 0 1 9 -20 L 9 0 Z" fill="#fff1a8" />
        <circle cy={-14} r={26 + Math.sin(frame / 5) * 7} fill="none" stroke="#fff1a8" strokeWidth={3} opacity={0.75} />
      </g>
      {/* the dotted route draws itself */}
      {Array.from({ length: 34 }, (_, i) => {
        const t = i / 33;
        if (t > pathOn) return null;
        const p = route(t);
        return <circle key={i} cx={p.x} cy={p.y} r={6.5} fill="#fff4b8" opacity={0.95} />;
      })}
      {/* the distant rainbow-colored forest */}
      <g opacity={forestOn} transform={`translate(190 -130) scale(${0.7 + 0.3 * forestOn})`}>
        <circle r={240} fill="url(#softGlow)" opacity={0.18 + Math.sin(frame / 8) * 0.05} />
        {RAINBOW.map((c, i) => (
          <path key={c} d={`M -190 56 A 190 ${190 - i * 3} 0 0 1 190 56`} stroke={c} strokeWidth={9} fill="none" opacity={0.0} transform={`scale(${1 - i * 0.06})`} />
        ))}
        {RAINBOW.map((c, i) => {
          const tx = -162 + i * 54;
          const ty = 58 + (i % 2 ? -14 : 14);
          const sway = Math.sin(frame / 14 + i) * 3;
          return (
            <g key={c} transform={`translate(${tx} ${ty}) rotate(${sway}) scale(${0.95 + (i % 3) * 0.12})`}>
              <circle cy={-46} r={64} fill={c} opacity={0.22} />
              <rect x={-7} y={-26} width={14} height={38} rx={4} fill="#5b4a78" />
              <path d="M 0 -116 L 38 -60 L 22 -60 L 46 -20 L -46 -20 L -22 -60 L -38 -60 Z" fill={c} stroke="#fff" strokeWidth={2} strokeLinejoin="round" />
            </g>
          );
        })}
      </g>
      {/* a big twinkling star where the route ends */}
      {pathOn >= 1 && <Sparkle x={end.x} y={end.y + 6} size={30 + Math.sin(frame / 4) * 7} color="#fff4b8" rotate={frame * 2} />}
      {/* compass */}
      <g transform="translate(320 205)" opacity={0.85}>
        <circle r={36} fill="none" stroke="#ffd36e" strokeWidth={3} />
        <path d="M 0 -30 L 8 0 L 0 30 L -8 0 Z" fill="#ffd36e" transform={`rotate(${Math.sin(frame / 12) * 12})`} />
        <path d="M -30 0 L 0 -6 L 30 0 L 0 6 Z" fill="#ffe9a8" opacity={0.65} />
      </g>
    </g>
  );
};

export const LeafFall: React.FC<{ f: number; start: number; x: number; top: number; seed: string; count?: number }> = ({ f, start, x, top, seed, count = 9 }) => (
  <g>
    {Array.from({ length: count }, (_, i) => {
      const t = f - start - random(`${seed}d${i}`) * 8;
      if (t < 0 || t > 110) return null;
      const lx = x + (random(`${seed}x${i}`) - 0.5) * 900 + Math.sin(t / 9 + i) * 30;
      const ly = top + random(`${seed}y${i}`) * 200 + t * 7;
      return <ellipse key={i} cx={lx} cy={ly} rx={15} ry={7} fill="#5fbf86" opacity={Math.min(1, (110 - t) / 30)} transform={`rotate(${t * 7 + i * 40} ${lx} ${ly})`} />;
    })}
  </g>
);
