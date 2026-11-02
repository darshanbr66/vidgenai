import React from "react";
import { AbsoluteFill, Audio, Easing, interpolate, Sequence, staticFile, useCurrentFrame } from "remotion";
import { loadLocalFont } from "../fonts";
import { blinkAt, Bobo, CharacterDefs, CharProps } from "../story/characters";
import { SceneryDefs, Sparkle } from "../story/scenery";
import { PropDefs, TinySprite } from "../ep02/props";
import { Ep3Defs, RAINBOW } from "../ep03/props";

// Shared building blocks for episodes made by Lumi Studio, taken from Episode 3.

export const fontFamily = loadLocalFont("Fredoka", "fredoka.woff2");
export const XF = 12; // crossfade between scenes, in frames
export const EASE = Easing.inOut(Easing.cubic);
export const OUT = Easing.out(Easing.cubic);

export const ip = (f: number, input: number[], output: number[], easing?: (t: number) => number) =>
  interpolate(f, input, output, { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing });

// Pass the episode's timeline.json: const mouthAt = makeMouthAt(timeline);
export const makeMouthAt = (timeline: { mouth: Record<string, number[]> }) => (who: string, g: number) => {
  const m = timeline.mouth[who] ?? [];
  return ((m[g] ?? 0) + (m[g - 1] ?? 0)) / 2;
};

export const Defs: React.FC<{ children?: React.ReactNode }> = ({ children }) => (
  <defs>
    <CharacterDefs />
    <SceneryDefs />
    <PropDefs />
    <Ep3Defs />
    {children}
  </defs>
);

export type CamView = { cx: number; cy: number; z: number };

export const Cam: React.FC<CamView & { children: React.ReactNode }> = ({ cx, cy, z, children }) => (
  <g transform={`translate(540 960) scale(${z}) translate(${-cx} ${-cy})`}>{children}</g>
);

// A full-frame 1080x1920 drawing surface with the shared gradients and a camera
export const Stage: React.FC<{ cam: CamView; defs?: React.ReactNode; children: React.ReactNode }> = ({ cam, defs, children }) => (
  <AbsoluteFill>
    <svg viewBox="0 0 1080 1920" width={1080} height={1920}>
      <Defs>{defs}</Defs>
      <Cam {...cam}>{children}</Cam>
    </svg>
  </AbsoluteFill>
);

// Bobo with the tiny creature from Episode 2 riding on his head. Use this instead of plain Bobo.
export const BoboRider: React.FC<CharProps & { g: number; riderLook?: { x: number; y: number }; riderArmsUp?: boolean; riderHappy?: boolean }> = ({ g, riderLook = { x: 0, y: 0 }, riderArmsUp = false, riderHappy = false, ...p }) => {
  const bob = p.walk == null ? 0 : Math.abs(Math.cos(p.walk)) * 12;
  return (
    <>
      <Bobo {...p} />
      <g transform={`translate(${p.x} ${p.y}) scale(${p.scale ?? 1}) rotate(${p.lean ?? 0})`}>
        <TinySprite x={0} y={-404 - bob} scale={0.7} frame={g} look={riderLook} armsUp={riderArmsUp} happy={riderHappy} blink={blinkAt(g, 2)} />
      </g>
    </>
  );
};

// Where a raised right hand ends up, for placing things a character holds
export const lumiHand = (x: number, y: number, scale: number, angle: number) => {
  const a = (angle * Math.PI) / 180;
  return { x: x + (84 - 128 * Math.sin(a)) * scale, y: y + (-290 + 128 * Math.cos(a)) * scale };
};
export const boboHand = (x: number, y: number, scale: number, angle: number) => {
  const a = (angle * Math.PI) / 180;
  return { x: x + (86 - 94 * Math.sin(a)) * scale, y: y + (-196 + 94 * Math.cos(a)) * scale };
};

export const SparkBurst: React.FC<{ f: number; at: number; x: number; y: number; reach?: number; count?: number; size?: number; life?: number; rainbow?: boolean }> = ({
  f,
  at,
  x,
  y,
  reach = 300,
  count = 22,
  size = 18,
  life = 34,
  rainbow = false,
}) => {
  if (f < at || f > at + life) return null;
  const d = ip(f, [at, at + life], [0, reach], OUT);
  return (
    <g>
      {Array.from({ length: count }, (_, i) => {
        const a = (i / count) * Math.PI * 2;
        const r = d * (0.65 + ((i * 37) % 10) / 20);
        return (
          <Sparkle
            key={i}
            x={x + Math.cos(a) * r}
            y={y + Math.sin(a) * r}
            size={size * (0.65 + (i % 3) * 0.3)}
            opacity={ip(f, [at + life * 0.45, at + life], [1, 0])}
            color={rainbow ? RAINBOW[i % 6] : i % 2 ? "#fff1a8" : "#aee8ff"}
            rotate={f * 3 + i * 25}
          />
        );
      })}
    </g>
  );
};

// The closing text every episode ends on; `at` is the local frame it starts fading in
export const EndCard: React.FC<{ at: number; top?: number }> = ({ at, top = 790 }) => {
  const f = useCurrentFrame();
  const text = ip(f, [at, at + 16], [0, 1], EASE);
  const sub = ip(f, [at + 8, at + 26], [0, 1], EASE);
  const shadow = "0 0 8px rgba(30, 20, 90, 1), 0 3px 12px rgba(30, 20, 90, 1), 0 0 34px rgba(30, 20, 90, 0.9)";
  return (
    <AbsoluteFill style={{ alignItems: "center", fontFamily }}>
      <div style={{ position: "absolute", top, fontSize: 74, fontWeight: 600, color: "#fff6dc", opacity: text, transform: `translateY(${(1 - text) * 20}px)`, textShadow: shadow }}>To Be Continued... ✨</div>
      <div style={{ position: "absolute", top: top + 90, fontSize: 48, fontWeight: 500, color: "#e4ecff", opacity: sub, transform: `translateY(${(1 - sub) * 16}px)`, textShadow: shadow }}>Little Moon Story World 🌙</div>
    </AbsoluteFill>
  );
};

// Plays scenes with crossfade overlap, a soft vignette and the episode's soundtrack.
// `cuts` are the scene boundaries in frames, one more than there are scenes.
export const EpisodeFrame: React.FC<{ audio: string; cuts: number[]; scenes: React.FC[] }> = ({ audio, cuts, scenes }) => (
  <AbsoluteFill style={{ background: "#0a1238" }}>
    {scenes.map((C, i) => (
      <Sequence key={i} from={cuts[i]} durationInFrames={cuts[i + 1] - cuts[i] + (i === scenes.length - 1 ? 0 : XF)}>
        <C />
      </Sequence>
    ))}
    <AbsoluteFill style={{ background: "radial-gradient(ellipse at center, transparent 62%, rgba(5, 8, 30, 0.4) 100%)" }} />
    <Audio src={staticFile(audio)} />
  </AbsoluteFill>
);
