import React from "react";
import {
  AbsoluteFill,
  Easing,
  Img,
  interpolate,
  random,
  spring,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { loadLocalFont } from "./fonts";

const fontFamily = loadLocalFont("Montserrat", "montserrat.woff2");

// Source image is 1672x941; all overlay coordinates below are in source-image pixels.
const IMG_W = 1672;
const IMG_H = 941;
const OUT_W = 1920;
const OUT_H = 1080;
const FIT = OUT_W / IMG_W;

const NAVY = "#070d1f";
const BLUE = "#3b9dff";
const SUNSET = "#ff9a4d";

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const ease = Easing.inOut(Easing.cubic);

// Camera keyframes: [frame, focusX, focusY, zoom]
const SHOTS: [number, number, number, number][] = [
  [0, 1150, 470, 1.35], // open on the workspace
  [150, 1215, 455, 1.75], // slow push toward the monitor
  [255, 420, 230, 1.55], // glide to the name
  [290, 440, 240, 1.58], // hold while the light sweeps
  [345, 836, 470, 1.0], // pull back to the full frame
  [450, 836, 470, 1.07], // gentle drift under the end card
];

const useCamera = (frame: number) => {
  const frames = SHOTS.map((s) => s[0]);
  const ch = (i: number) => interpolate(frame, frames, SHOTS.map((s) => s[i]), { ...clamp, easing: ease });
  const zoom = ch(3);
  const scale = FIT * zoom;
  // Keep the view inside the image so edges never show
  const halfW = OUT_W / 2 / scale;
  const halfH = OUT_H / 2 / scale;
  const fx = Math.min(Math.max(ch(1), halfW), IMG_W - halfW);
  const fy = Math.min(Math.max(ch(2), halfH), IMG_H - halfH);
  return { scale, tx: OUT_W / 2 - fx * scale, ty: OUT_H / 2 - fy * scale };
};

// Positioned element in image coordinates
const At: React.FC<{ x: number; y: number; w: number; h: number; style?: React.CSSProperties; children?: React.ReactNode }> = ({
  x,
  y,
  w,
  h,
  style,
  children,
}) => <div style={{ position: "absolute", left: x, top: y, width: w, height: h, ...style }}>{children}</div>;

// New code typed into the bottom of the editor, over a patch matching its background
const CODE_LINES: { indent: number; tokens: [number, string][] }[] = [
  { indent: 0, tokens: [[22, "#c792ea"], [40, "#82aaff"], [10, "#89ddff"], [34, "#ffcb6b"], [8, "#89ddff"]] },
  { indent: 14, tokens: [[28, "#c792ea"], [46, "#f78c6c"], [12, "#89ddff"], [30, "#c3e88d"]] },
  { indent: 14, tokens: [[34, "#82aaff"], [8, "#89ddff"], [52, "#c3e88d"], [8, "#89ddff"]] },
];
const LINE_Y = [550, 560, 570];
const LINE_START = [18, 58, 98];
const LINE_DUR = 34;

const lineWidth = (l: (typeof CODE_LINES)[number]) => l.tokens.reduce((a, [w]) => a + w + 4, 0);

const Editor: React.FC<{ frame: number }> = ({ frame }) => {
  let cursorX = 1112;
  let cursorY = LINE_Y[0];
  const lines = CODE_LINES.map((line, i) => {
    const p = interpolate(frame, [LINE_START[i], LINE_START[i] + LINE_DUR], [0, 1], clamp);
    const shown = lineWidth(line) * p;
    if (frame >= LINE_START[i]) {
      cursorX = 1112 + line.indent + shown;
      cursorY = LINE_Y[i];
    }
    let x = 0;
    return (
      <div key={i} style={{ position: "absolute", left: 1112 + line.indent, top: LINE_Y[i] - 1.5, height: 3, width: shown, overflow: "hidden" }}>
        {line.tokens.map(([w, c], j) => {
          const el = <div key={j} style={{ position: "absolute", left: x, width: w, height: 3, borderRadius: 1.5, background: c, opacity: 0.85 }} />;
          x += w + 4;
          return el;
        })}
      </div>
    );
  });
  const typing = CODE_LINES.some((_, i) => frame >= LINE_START[i] && frame < LINE_START[i] + LINE_DUR);
  const cursorOn = typing || Math.floor(frame / 15) % 2 === 0;

  return (
    <>
      <At x={1106} y={543} w={178} h={36} style={{ background: "#141c2c", filter: "blur(1.5px)" }} />
      <At x={1092} y={cursorY - 5} w={192} h={10} style={{ background: "rgba(120,160,255,0.07)" }} />
      {lines}
      <At x={cursorX + 1} y={cursorY - 4} w={1.5} h={8} style={{ background: "#e6edff", opacity: cursorOn ? 0.9 : 0 }} />
      {/* soft screen glow that breathes with the activity */}
      <At
        x={960}
        y={300}
        w={520}
        h={330}
        style={{
          background: `radial-gradient(ellipse at 50% 55%, rgba(59,157,255,0.16), transparent 65%)`,
          mixBlendMode: "screen",
          opacity: 0.7 + Math.sin(frame / 9) * 0.15,
        }}
      />
    </>
  );
};

// Warm sun bloom with an anamorphic streak, plus the desk-lamp glow
const Lights: React.FC<{ frame: number }> = ({ frame }) => {
  const pulse = 0.85 + Math.sin(frame / 22) * 0.1;
  return (
    <>
      <At
        x={1297 - 220}
        y={237 - 220}
        w={440}
        h={440}
        style={{ background: `radial-gradient(circle, rgba(255,190,120,0.55), rgba(255,140,60,0.18) 35%, transparent 70%)`, mixBlendMode: "screen", opacity: pulse }}
      />
      <At
        x={1297 - 420}
        y={237 - 5}
        w={840}
        h={10}
        style={{ background: `linear-gradient(90deg, transparent, rgba(255,200,150,0.5), transparent)`, filter: "blur(4px)", mixBlendMode: "screen", opacity: pulse * 0.6 }}
      />
      {/* sunset light spilling through the window across the room */}
      <At
        x={700}
        y={0}
        w={700}
        h={941}
        style={{
          background: `linear-gradient(${200 + Math.sin(frame / 60) * 4}deg, rgba(255,150,80,0.16), transparent 60%)`,
          mixBlendMode: "screen",
        }}
      />
      <At
        x={-150}
        y={230}
        w={330}
        h={330}
        style={{ background: `radial-gradient(circle, rgba(255,200,100,0.35), transparent 65%)`, mixBlendMode: "screen", opacity: 0.8 + Math.sin(frame / 17) * 0.12 }}
      />
      {/* laptop screen shimmer */}
      <At
        x={1280}
        y={500}
        w={340}
        h={260}
        style={{ background: `radial-gradient(ellipse, rgba(120,180,255,0.12), transparent 70%)`, mixBlendMode: "screen", opacity: 0.6 + Math.sin(frame / 13) * 0.25 }}
      />
    </>
  );
};

// A band of light passing over the name and tagline already in the image
const Sweep: React.FC<{ frame: number }> = ({ frame }) => {
  const p = interpolate(frame, [232, 292], [-0.3, 1.3], { ...clamp, easing: Easing.inOut(Easing.quad) });
  const glow = interpolate(frame, [225, 255, 300, 340], [0, 1, 1, 0], clamp);
  return (
    <At
      x={130}
      y={40}
      w={540}
      h={250}
      style={{
        overflow: "hidden",
        maskImage: "radial-gradient(closest-side, black 35%, transparent 100%)",
        WebkitMaskImage: "radial-gradient(closest-side, black 35%, transparent 100%)",
      }}
    >
      <div style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse, rgba(59,157,255,0.10), transparent 75%)", mixBlendMode: "screen", opacity: glow }} />
      <div
        style={{
          position: "absolute",
          top: -100,
          left: p * 540 - 90,
          width: 180,
          height: 450,
          transform: "rotate(18deg)",
          background: "linear-gradient(90deg, transparent, rgba(255,235,210,0.45), transparent)",
          mixBlendMode: "overlay",
        }}
      />
    </At>
  );
};

// Floating dust motes in screen space, with mild parallax against the camera
const PARTICLES = Array.from({ length: 55 }, (_, i) => ({
  x: random(`x${i}`) * OUT_W,
  y: random(`y${i}`) * OUT_H,
  size: 1.5 + random(`s${i}`) * 4,
  speed: 0.15 + random(`v${i}`) * 0.4,
  phase: random(`p${i}`) * Math.PI * 2,
  warm: random(`c${i}`) > 0.45,
}));

const Particles: React.FC<{ frame: number; tx: number; ty: number }> = ({ frame, tx, ty }) => (
  <AbsoluteFill style={{ pointerEvents: "none" }}>
    {PARTICLES.map((p, i) => {
      const depth = p.size / 5.5;
      const x = (((p.x + Math.sin(frame / 40 + p.phase) * 20 + tx * depth * 0.08) % OUT_W) + OUT_W) % OUT_W;
      const y = (((p.y - frame * p.speed + ty * depth * 0.08) % OUT_H) + OUT_H) % OUT_H;
      const twinkle = 0.25 + 0.5 * (0.5 + 0.5 * Math.sin(frame / 12 + p.phase));
      return (
        <div
          key={i}
          style={{
            position: "absolute",
            left: x,
            top: y,
            width: p.size,
            height: p.size,
            borderRadius: "50%",
            background: p.warm ? "#ffd3a1" : "#8cc8ff",
            boxShadow: `0 0 ${p.size * 3}px ${p.warm ? "#ff9a4d" : BLUE}`,
            filter: p.size > 4 ? "blur(1.5px)" : undefined,
            opacity: twinkle * 0.7,
          }}
        />
      );
    })}
  </AbsoluteFill>
);

const EndCard: React.FC<{ frame: number }> = ({ frame }) => {
  const { fps } = useVideoConfig();
  const f = frame - 345;
  const name = spring({ frame: f, fps, config: { damping: 200 }, durationInFrames: 30 });
  const line = interpolate(f, [12, 32], [0, 1], { ...clamp, easing: ease });
  const tag = interpolate(f, [18, 36], [0, 1], clamp);
  const words = ["Build.", "Learn.", "Improve.", "Repeat."];

  return (
    <AbsoluteFill style={{ justifyContent: "center", alignItems: "center", fontFamily, color: "white" }}>
      <div
        style={{
          fontSize: 150,
          fontWeight: 700,
          letterSpacing: "0.02em",
          opacity: name,
          transform: `translateY(${(1 - name) * 30}px)`,
          filter: `blur(${(1 - name) * 8}px)`,
          textShadow: "0 10px 60px rgba(59,157,255,0.35)",
        }}
      >
        Darshan
      </div>
      <div
        style={{
          width: 520 * line,
          height: 2,
          margin: "22px 0 30px",
          background: `linear-gradient(90deg, transparent, ${BLUE}, ${SUNSET}, transparent)`,
        }}
      />
      <div style={{ fontSize: 30, fontWeight: 300, letterSpacing: "0.42em", opacity: tag, transform: `translateY(${(1 - tag) * 12}px)` }}>
        DEVELOPER <span style={{ color: BLUE }}>|</span> CREATOR <span style={{ color: BLUE }}>|</span> LEARNER
      </div>
      <div style={{ display: "flex", gap: 26, marginTop: 70, fontSize: 46, fontWeight: 500 }}>
        {words.map((w, i) => {
          const s = interpolate(f, [24 + i * 5, 38 + i * 5], [0, 1], { ...clamp, easing: Easing.out(Easing.cubic) });
          const last = i === words.length - 1;
          return (
            <span
              key={w}
              style={{
                opacity: s,
                transform: `translateY(${(1 - s) * 18}px)`,
                background: last ? `linear-gradient(90deg, ${SUNSET}, #ff6a88)` : undefined,
                WebkitBackgroundClip: last ? "text" : undefined,
                color: last ? "transparent" : "rgba(255,255,255,0.92)",
              }}
            >
              {w}
            </span>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};

export const Brand: React.FC = () => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const { scale, tx, ty } = useCamera(frame);

  const blur = interpolate(frame, [340, 372], [0, 14], { ...clamp, easing: ease });
  const dim = interpolate(frame, [340, 372], [0, 0.72], { ...clamp, easing: ease });
  const fadeIn = interpolate(frame, [0, 30], [1, 0], clamp);
  const fadeOut = interpolate(frame, [durationInFrames - 12, durationInFrames], [0, 1], clamp);

  return (
    <AbsoluteFill style={{ background: NAVY, overflow: "hidden" }}>
      <div
        style={{
          position: "absolute",
          width: IMG_W,
          height: IMG_H,
          transformOrigin: "0 0",
          transform: `translate(${tx}px, ${ty}px) scale(${scale})`,
          filter: blur > 0.01 ? `blur(${blur / scale}px)` : undefined,
        }}
      >
        <Img src={staticFile("demo.png")} style={{ width: IMG_W, height: IMG_H, display: "block" }} />
        <Editor frame={frame} />
        <Lights frame={frame} />
        <Sweep frame={frame} />
      </div>

      {/* grade: navy shadows on the left, warm on the right, vignette */}
      <AbsoluteFill style={{ background: "linear-gradient(100deg, rgba(10,25,70,0.35), transparent 45%, rgba(255,140,70,0.12))", mixBlendMode: "soft-light" }} />
      <AbsoluteFill style={{ background: "radial-gradient(ellipse at center, transparent 50%, rgba(3,6,18,0.6) 100%)" }} />

      <Particles frame={frame} tx={tx} ty={ty} />

      <AbsoluteFill style={{ background: NAVY, opacity: dim }} />
      <EndCard frame={frame} />

      <AbsoluteFill style={{ background: "black", opacity: Math.max(fadeIn, fadeOut) }} />
    </AbsoluteFill>
  );
};
