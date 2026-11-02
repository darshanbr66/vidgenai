import React from "react";
import { AbsoluteFill, Easing } from "remotion";
import { Defs } from "../kit";
import { Cam3, project } from "./World";

// Puts the series' 2D characters into a 3D shot. Characters are anchored to world points,
// so they keep their place on the 3D ground while the camera moves.

export type V3 = [number, number, number];

// SVG units per world unit at scale 1: Lumi stands about 1.3 world units tall
export const CHAR_UNIT = 330;

const EASE = Easing.inOut(Easing.cubic);
const mix = (a: number, b: number, k: number) => a + (b - a) * k;
const mix3 = (a: V3, b: V3, k: number): V3 => [mix(a[0], b[0], k), mix(a[1], b[1], k), mix(a[2], b[2], k)];

// Camera keyframes: [frame, camera]. Holds before the first and after the last key.
export const camAt = (f: number, keys: [number, Cam3][], ease: (t: number) => number = EASE): Cam3 => {
  if (f <= keys[0][0]) return keys[0][1];
  for (let i = 0; i < keys.length - 1; i++) {
    const [f0, c0] = keys[i];
    const [f1, c1] = keys[i + 1];
    if (f <= f1) {
      const k = ease((f - f0) / Math.max(1, f1 - f0));
      return { pos: mix3(c0.pos, c1.pos, k), target: mix3(c0.target, c1.target, k), fov: mix(c0.fov ?? 40, c1.fov ?? 40, k) };
    }
  }
  return keys[keys.length - 1][1];
};

// Screen position and character scale for a character whose feet are at world point p
export const place = (cam: Cam3, p: V3, size = 1) => {
  const s = project(cam, p);
  return { x: s.x, y: s.y, scale: (s.ppu / CHAR_UNIT) * size };
};

// Screen position only (for beams, sparkles and things pinned to 3D objects)
export const screen = (cam: Cam3, p: V3) => {
  const s = project(cam, p);
  return { x: s.x, y: s.y };
};

// The 2D layer over the 3D world: shared gradients, plus `defs`, and an optional light filter id
export const CharLayer: React.FC<{ defs?: React.ReactNode; filter?: string; children: React.ReactNode }> = ({ defs, filter, children }) => (
  <AbsoluteFill>
    <svg viewBox="0 0 1080 1920" width={1080} height={1920}>
      <Defs>{defs}</Defs>
      <g filter={filter ? `url(#${filter})` : undefined}>{children}</g>
    </svg>
  </AbsoluteFill>
);
