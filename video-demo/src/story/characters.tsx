import React from "react";

// All characters are drawn front-facing with their feet at (0, 0).
// Arm angles are raw SVG rotations of an arm that hangs straight down:
// left arm (screen-left) raises with positive values, right arm with negative.

export type Expr = "neutral" | "happy" | "surprised" | "excited" | "effort";

type Look = { x: number; y: number };

export type CharProps = {
  x: number;
  y: number;
  scale?: number;
  look?: Look;
  expr?: Expr;
  mouth?: number; // 0..1 openness while talking
  armL?: number;
  armR?: number;
  walk?: number | null; // walk cycle phase in radians
  lean?: number; // whole-body rotation (deg) around the feet
  squash?: number; // 1 = normal, <1 squashed
  blink?: number; // 1 = open, 0 = closed
  headTilt?: number;
};

// Eyelids close for a few frames every couple of seconds
export const blinkAt = (frame: number, seed: number) => {
  const cycle = 105 + seed * 17;
  const t = (frame + seed * 41) % cycle;
  return t < 6 ? Math.max(0.08, Math.abs(t - 3) / 3) : 1;
};

export const CharacterDefs: React.FC = () => (
  <>
    <radialGradient id="skin" cx="40%" cy="35%" r="70%">
      <stop offset="0%" stopColor="#ffe6d2" />
      <stop offset="75%" stopColor="#f9cdb0" />
      <stop offset="100%" stopColor="#eeb594" />
    </radialGradient>
    <linearGradient id="pj" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stopColor="#6aa0f2" />
      <stop offset="100%" stopColor="#3c67c0" />
    </linearGradient>
    <linearGradient id="pjDark" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0%" stopColor="#4c7fd6" />
      <stop offset="100%" stopColor="#355daf" />
    </linearGradient>
    <radialGradient id="hair" cx="40%" cy="25%" r="80%">
      <stop offset="0%" stopColor="#6b4129" />
      <stop offset="100%" stopColor="#3b2216" />
    </radialGradient>
    <radialGradient id="iris" cx="45%" cy="40%" r="60%">
      <stop offset="0%" stopColor="#8a5a34" />
      <stop offset="100%" stopColor="#3d2414" />
    </radialGradient>
    <radialGradient id="fur" cx="38%" cy="30%" r="75%">
      <stop offset="0%" stopColor="#b47a52" />
      <stop offset="70%" stopColor="#8c5a3b" />
      <stop offset="100%" stopColor="#6b4129" />
    </radialGradient>
    <radialGradient id="furLight" cx="45%" cy="35%" r="70%">
      <stop offset="0%" stopColor="#f3d2ad" />
      <stop offset="100%" stopColor="#d9a87c" />
    </radialGradient>
    <radialGradient id="starBody" cx="45%" cy="40%" r="65%">
      <stop offset="0%" stopColor="#fffbe0" />
      <stop offset="60%" stopColor="#ffe27a" />
      <stop offset="100%" stopColor="#ffc53d" />
    </radialGradient>
    <radialGradient id="starGlow">
      <stop offset="0%" stopColor="#fff3b0" stopOpacity="0.9" />
      <stop offset="40%" stopColor="#ffd86b" stopOpacity="0.35" />
      <stop offset="100%" stopColor="#ffd86b" stopOpacity="0" />
    </radialGradient>
    <radialGradient id="shadow">
      <stop offset="0%" stopColor="#000" stopOpacity="0.35" />
      <stop offset="100%" stopColor="#000" stopOpacity="0" />
    </radialGradient>
  </>
);

const Mouth: React.FC<{ m: number; expr: Expr; scale?: number }> = ({ m, expr, scale = 1 }) => {
  if (m > 0.06 || expr === "excited") {
    const open = Math.max(m, expr === "excited" ? 0.45 : 0);
    const rx = (13 + open * 7) * scale;
    const ry = (4 + open * 17) * scale;
    return (
      <g>
        <path d={`M ${-rx} 0 Q 0 ${-ry * 0.35} ${rx} 0 Q ${rx * 0.8} ${ry * 1.6} 0 ${ry * 1.7} Q ${-rx * 0.8} ${ry * 1.6} ${-rx} 0 Z`} fill="#86303d" />
        <ellipse cx={0} cy={ry * 1.25} rx={rx * 0.55} ry={ry * 0.4} fill="#e8737f" />
      </g>
    );
  }
  if (expr === "surprised") return <ellipse cx={0} cy={6 * scale} rx={9 * scale} ry={11 * scale} fill="#86303d" />;
  if (expr === "effort") return <path d={`M ${-16 * scale} 4 L ${16 * scale} 4`} stroke="#86303d" strokeWidth={6 * scale} strokeLinecap="round" />;
  if (expr === "happy")
    return <path d={`M ${-22 * scale} 0 Q 0 ${26 * scale} ${22 * scale} 0 Z`} fill="#86303d" stroke="#86303d" strokeWidth={4 * scale} strokeLinejoin="round" />;
  return <path d={`M ${-18 * scale} 0 Q 0 ${15 * scale} ${18 * scale} 0`} stroke="#86303d" strokeWidth={6 * scale} strokeLinecap="round" fill="none" />;
};

const LumiEye: React.FC<{ side: -1 | 1; look: Look; expr: Expr; blink: number }> = ({ side, look, expr, blink }) => {
  const cx = side * 48;
  if (expr === "happy" && blink > 0.5)
    return <path d={`M ${cx - 24} 22 Q ${cx} -6 ${cx + 24} 22`} stroke="#3b2216" strokeWidth={8} strokeLinecap="round" fill="none" />;
  if (expr === "effort")
    // squeezed-shut ">  <" eyes
    return (
      <path
        d={`M ${cx - side * 20} -2 L ${cx + side * 14} 15 L ${cx - side * 20} 32`}
        stroke="#3b2216"
        strokeWidth={8}
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
    );
  const big = expr === "surprised" || expr === "excited" ? 1.12 : 1;
  return (
    <g transform={`translate(${cx} 15) scale(${big} ${big * blink})`}>
      <ellipse rx={30} ry={36} fill="#fff" />
      <g transform={`translate(${look.x * 8} ${look.y * 10})`}>
        <circle r={23} fill="url(#iris)" />
        <circle r={12} fill="#1c0f08" />
        <circle cx={-8} cy={-10} r={8} fill="#fff" />
        <circle cx={8} cy={8} r={3.5} fill="#fff" opacity={0.9} />
      </g>
      {/* two little lashes at the outer corner */}
      <path d={`M ${24 * side} -22 L ${36 * side} -32 M ${29 * side} -12 L ${42 * side} -18`} stroke="#2a160c" strokeWidth={5} fill="none" strokeLinecap="round" />
    </g>
  );
};

export const Lumi: React.FC<CharProps> = ({
  x,
  y,
  scale = 1,
  look = { x: 0, y: 0 },
  expr = "neutral",
  mouth = 0,
  armL = 8,
  armR = -8,
  walk = null,
  lean = 0,
  squash = 1,
  blink = 1,
  headTilt = 0,
}) => {
  const step = walk === null ? 0 : Math.sin(walk);
  const bob = walk === null ? 0 : Math.abs(Math.cos(walk)) * 10;
  const browY = expr === "surprised" || expr === "excited" ? -62 : expr === "effort" ? -36 : -46;
  const browTilt = expr === "effort" ? 12 : 0;
  const leg = (side: -1 | 1) => (
    <g transform={`translate(${side * 34} -160) rotate(${walk === null ? 0 : side * step * 24})`}>
      <rect x={-25} y={0} width={50} height={140} rx={24} fill="url(#pjDark)" />
      <rect x={-25} y={112} width={50} height={12} fill="#e9efff" opacity={0.85} />
      <ellipse cx={0} cy={150} rx={31} ry={17} fill="#f4f1ff" />
    </g>
  );
  const arm = (side: -1 | 1, angle: number) => (
    <g transform={`translate(${side * 84} -290) rotate(${angle + (walk === null ? 0 : -side * step * 0)})`}>
      <rect x={-21} y={-8} width={42} height={124} rx={21} fill="url(#pj)" />
      <rect x={-21} y={100} width={42} height={10} fill="#e9efff" opacity={0.85} />
      <circle cx={0} cy={128} r={22} fill="url(#skin)" />
    </g>
  );
  return (
    <g transform={`translate(${x} ${y}) scale(${scale}) rotate(${lean}) scale(${1 / Math.sqrt(squash)} ${squash})`}>
      <ellipse cx={0} cy={6} rx={120} ry={22} fill="url(#shadow)" />
      <g transform={`translate(0 ${-bob})`}>
        {leg(-1)}
        {leg(1)}
        {arm(-1, armL + (walk === null ? 0 : step * 28))}
        {arm(1, armR + (walk === null ? 0 : step * 28))}
        {/* pajama top */}
        <path d="M -90 -302 Q -104 -220 -100 -146 Q 0 -132 100 -146 Q 104 -220 90 -302 Q 0 -326 -90 -302 Z" fill="url(#pj)" />
        <path d="M -40 -310 L 0 -268 L 40 -310" stroke="#e9efff" strokeWidth={9} fill="none" strokeLinejoin="round" strokeLinecap="round" />
        <path d="M -100 -158 Q 0 -142 100 -158" stroke="#e9efff" strokeWidth={9} fill="none" strokeLinecap="round" opacity={0.85} />
        {[-238, -204].map((by) => (
          <circle key={by} cx={0} cy={by} r={6} fill="#e9efff" />
        ))}
        {/* moon on the chest */}
        <path d="M -42 -258 A 20 20 0 1 0 -42 -218 A 15 15 0 1 1 -42 -258 Z" fill="#ffd75e" />
        {/* head */}
        <g transform={`translate(0 -440) rotate(${headTilt})`}>
          <path d="M -152 -10 Q -168 92 -112 112 L 112 112 Q 168 92 152 -10 A 152 150 0 0 0 -152 -10 Z" fill="url(#hair)" />
          <circle cx={-124} cy={20} r={20} fill="#f2bf9f" />
          <circle cx={124} cy={20} r={20} fill="#f2bf9f" />
          <ellipse cx={0} cy={10} rx={126} ry={122} fill="url(#skin)" />
          <ellipse cx={-82} cy={58} rx={23} ry={13} fill="#ff97a6" opacity={0.55} />
          <ellipse cx={82} cy={58} rx={23} ry={13} fill="#ff97a6" opacity={0.55} />
          <LumiEye side={-1} look={look} expr={expr} blink={blink} />
          <LumiEye side={1} look={look} expr={expr} blink={blink} />
          {[-1, 1].map((s) => (
            <path
              key={s}
              d={`M ${s * 48 - 20} ${browY} Q ${s * 48} ${browY - 9} ${s * 48 + 20} ${browY}`}
              transform={`rotate(${s * browTilt} ${s * 48} ${browY})`}
              stroke="#4a2a1a"
              strokeWidth={7}
              strokeLinecap="round"
              fill="none"
            />
          ))}
          <ellipse cx={0} cy={48} rx={8} ry={5.5} fill="#e9a283" />
          <g transform="translate(0 78)">
            <Mouth m={mouth} expr={expr} />
          </g>
          {/* bangs */}
          <path
            d="M -132 4 Q -140 -118 -40 -140 Q 66 -158 130 -62 Q 138 -24 128 6 Q 104 -46 64 -62 Q 34 -30 -6 -58 Q -48 -32 -84 -58 Q -110 -28 -132 4 Z"
            fill="url(#hair)"
          />
          <path d="M -70 -118 Q -10 -138 50 -122" stroke="#8a5a3a" strokeWidth={8} strokeLinecap="round" fill="none" opacity={0.6} />
          {/* little star hair clip */}
          <path
            d="M 92 -92 l 6 13 l 14 2 l -10 10 l 3 14 l -13 -7 l -13 7 l 3 -14 l -10 -10 l 14 -2 Z"
            fill="#ffd75e"
            stroke="#ffd75e"
            strokeWidth={4}
            strokeLinejoin="round"
          />
        </g>
      </g>
    </g>
  );
};

export const Bobo: React.FC<CharProps> = ({
  x,
  y,
  scale = 1,
  look = { x: 0, y: 0 },
  expr = "neutral",
  mouth = 0,
  armL = 14,
  armR = -14,
  walk = null,
  lean = 0,
  squash = 1,
  blink = 1,
  headTilt = 0,
}) => {
  const step = walk === null ? 0 : Math.sin(walk);
  const bob = walk === null ? 0 : Math.abs(Math.cos(walk)) * 12;
  const arm = (side: -1 | 1, angle: number) => (
    <g transform={`translate(${side * 86} -196) rotate(${angle})`}>
      <ellipse cx={0} cy={48} rx={29} ry={58} fill="url(#fur)" />
      <ellipse cx={0} cy={94} rx={22} ry={18} fill="#e2b68c" />
    </g>
  );
  const eye = (side: -1 | 1) => {
    const cx = side * 38;
    if (expr === "happy" && blink > 0.5)
      return <path key={side} d={`M ${cx - 14} -12 Q ${cx} -30 ${cx + 14} -12`} stroke="#2a1a12" strokeWidth={7} strokeLinecap="round" fill="none" />;
    const big = expr === "surprised" || expr === "excited" ? 1.2 : 1;
    const squint = expr === "effort" ? 0.45 : 1;
    return (
      <g key={side} transform={`translate(${cx} -18) scale(${big} ${big * blink * squint})`}>
        <ellipse rx={13} ry={15} fill="#24150d" />
        <circle cx={-4 + look.x * 3} cy={-6 + look.y * 3} r={5} fill="#fff" />
        <circle cx={4 + look.x * 3} cy={4 + look.y * 3} r={2} fill="#fff" opacity={0.8} />
      </g>
    );
  };
  return (
    <g transform={`translate(${x} ${y}) scale(${scale}) rotate(${lean}) scale(${1 / Math.sqrt(squash)} ${squash})`}>
      <ellipse cx={0} cy={6} rx={130} ry={24} fill="url(#shadow)" />
      <g transform={`translate(0 ${-bob})`}>
        {[-1, 1].map((s) => (
          <g key={s} transform={`translate(${s * 50} ${-30 - (walk === null ? 0 : Math.max(0, s * step) * 16)})`}>
            <ellipse rx={42} ry={34} fill="url(#fur)" />
            <ellipse cy={8} rx={24} ry={16} fill="#e8c39b" />
          </g>
        ))}
        {arm(-1, armL + (walk === null ? 0 : step * 20))}
        {arm(1, armR + (walk === null ? 0 : step * 20))}
        <ellipse cx={0} cy={-138} rx={110} ry={120} fill="url(#fur)" />
        <ellipse cx={0} cy={-122} rx={68} ry={76} fill="url(#furLight)" />
        <g transform={`translate(0 -305) rotate(${headTilt})`}>
          {[-1, 1].map((s) => (
            <g key={s} transform={`translate(${s * 72} -70)`}>
              <circle r={35} fill="url(#fur)" />
              <circle r={19} fill="#e2b68c" />
            </g>
          ))}
          <circle r={102} fill="url(#fur)" />
          <ellipse cx={-60} cy={22} rx={18} ry={11} fill="#ff97a6" opacity={0.45} />
          <ellipse cx={60} cy={22} rx={18} ry={11} fill="#ff97a6" opacity={0.45} />
          <ellipse cx={0} cy={32} rx={52} ry={40} fill="url(#furLight)" />
          {eye(-1)}
          {eye(1)}
          {[-1, 1].map((s) => {
            const by = expr === "surprised" || expr === "excited" ? -52 : -42;
            return (
              <path
                key={s}
                d={`M ${s * 38 - 12} ${by} Q ${s * 38} ${by - 7} ${s * 38 + 12} ${by}`}
                stroke="#4a2a1a"
                strokeWidth={6}
                strokeLinecap="round"
                fill="none"
              />
            );
          })}
          <ellipse cx={0} cy={14} rx={18} ry={12} fill="#2e1b11" />
          <ellipse cx={-5} cy={9} rx={6} ry={3.5} fill="#fff" opacity={0.6} />
          <g transform="translate(0 40)">
            {mouth > 0.06 || expr === "excited" ? (
              <Mouth m={mouth} expr={expr} scale={0.85} />
            ) : (
              <path d="M -18 -4 Q -9 8 0 -2 Q 9 8 18 -4" stroke="#2e1b11" strokeWidth={5} strokeLinecap="round" fill="none" />
            )}
          </g>
        </g>
      </g>
    </g>
  );
};

const starPoints = (R: number, r: number) =>
  Array.from({ length: 10 }, (_, i) => {
    const a = -Math.PI / 2 + (i * Math.PI) / 5;
    const rad = i % 2 === 0 ? R : r;
    return `${(Math.cos(a) * rad).toFixed(1)},${(Math.sin(a) * rad).toFixed(1)}`;
  }).join(" ");

export const LittleStar: React.FC<{
  x: number;
  y: number;
  scale?: number;
  mood?: "worried" | "happy";
  glow?: number;
  rotate?: number;
  blink?: number;
}> = ({ x, y, scale = 1, mood = "happy", glow = 1, rotate = 0, blink = 1 }) => (
  <g transform={`translate(${x} ${y}) scale(${scale}) rotate(${rotate})`}>
    <circle r={150} fill="url(#starGlow)" opacity={glow} />
    <polygon points={starPoints(62, 30)} fill="url(#starBody)" stroke="#ffe27a" strokeWidth={18} strokeLinejoin="round" />
    {mood === "happy" ? (
      <>
        <path d="M -22 -2 Q -14 -12 -6 -2" stroke="#6b4300" strokeWidth={4.5} strokeLinecap="round" fill="none" />
        <path d="M 6 -2 Q 14 -12 22 -2" stroke="#6b4300" strokeWidth={4.5} strokeLinecap="round" fill="none" />
        <path d="M -9 10 Q 0 20 9 10" stroke="#6b4300" strokeWidth={4.5} strokeLinecap="round" fill="none" />
      </>
    ) : (
      <>
        <g transform={`scale(1 ${blink})`}>
          <ellipse cx={-14} cy={0} rx={5} ry={7} fill="#6b4300" />
          <ellipse cx={14} cy={0} rx={5} ry={7} fill="#6b4300" />
        </g>
        <path d="M -22 -11 L -8 -17" stroke="#6b4300" strokeWidth={4} strokeLinecap="round" />
        <path d="M 22 -11 L 8 -17" stroke="#6b4300" strokeWidth={4} strokeLinecap="round" />
        <path d="M -7 18 Q 0 12 7 18" stroke="#6b4300" strokeWidth={4} strokeLinecap="round" fill="none" />
      </>
    )}
    <ellipse cx={-26} cy={12} rx={7} ry={4} fill="#ff9a8a" opacity={0.6} />
    <ellipse cx={26} cy={12} rx={7} ry={4} fill="#ff9a8a" opacity={0.6} />
  </g>
);
