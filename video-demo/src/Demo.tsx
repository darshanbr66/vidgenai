import React from "react";
import {
  AbsoluteFill,
  Sequence,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";

const BG = "#0b1020";
const ACCENT = "#7c5cff";
const ACCENT2 = "#22d3ee";
const FONT = "Segoe UI, Inter, system-ui, sans-serif";

// Slowly drifting gradient blobs behind every scene
const Background: React.FC = () => {
  const frame = useCurrentFrame();
  const t = frame / 30;
  return (
    <AbsoluteFill style={{ background: BG, overflow: "hidden" }}>
      <div
        style={{
          position: "absolute",
          width: 900,
          height: 900,
          borderRadius: "50%",
          background: ACCENT,
          filter: "blur(160px)",
          opacity: 0.35,
          left: 200 + Math.sin(t * 0.6) * 150,
          top: -200 + Math.cos(t * 0.5) * 100,
        }}
      />
      <div
        style={{
          position: "absolute",
          width: 800,
          height: 800,
          borderRadius: "50%",
          background: ACCENT2,
          filter: "blur(160px)",
          opacity: 0.25,
          right: 100 + Math.cos(t * 0.7) * 150,
          bottom: -250 + Math.sin(t * 0.4) * 100,
        }}
      />
    </AbsoluteFill>
  );
};

// Scene 1: title words pop in one by one
const Title: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const words = ["This", "video", "is", "pure", "code."];
  const exit = interpolate(frame, [60, 75], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  return (
    <AbsoluteFill style={{ justifyContent: "center", alignItems: "center", opacity: exit }}>
      <div style={{ display: "flex", gap: 36, fontFamily: FONT, fontSize: 140, fontWeight: 800, color: "white" }}>
        {words.map((w, i) => {
          const s = spring({ frame: frame - i * 6, fps, config: { damping: 12 } });
          const isCode = w === "code.";
          return (
            <span
              key={w}
              style={{
                transform: `translateY(${(1 - s) * 80}px) scale(${0.6 + s * 0.4})`,
                opacity: s,
                background: isCode ? `linear-gradient(90deg, ${ACCENT}, ${ACCENT2})` : undefined,
                WebkitBackgroundClip: isCode ? "text" : undefined,
                color: isCode ? "transparent" : "white",
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

// Scene 2: code being typed on the left, the result it describes on the right
const CODE = `const frame = useCurrentFrame();
const size = spring({ frame, fps });

return <Circle scale={size} />;`;

const Typing: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const chars = Math.floor(interpolate(frame, [0, 50], [0, CODE.length], { extrapolateRight: "clamp" }));
  const cursorOn = Math.floor(frame / 8) % 2 === 0;
  const enter = spring({ frame, fps, config: { damping: 15 } });
  const exit = interpolate(frame, [90, 105], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  return (
    <AbsoluteFill
      style={{ flexDirection: "row", justifyContent: "center", alignItems: "center", gap: 120, opacity: exit }}
    >
      <div
        style={{
          width: 900,
          padding: 48,
          borderRadius: 24,
          background: "rgba(15, 23, 42, 0.85)",
          border: "1px solid rgba(255,255,255,0.12)",
          boxShadow: "0 30px 80px rgba(0,0,0,0.5)",
          transform: `translateX(${(1 - enter) * -200}px)`,
          opacity: enter,
        }}
      >
        <div style={{ display: "flex", gap: 12, marginBottom: 32 }}>
          {["#ff5f57", "#febc2e", "#28c840"].map((c) => (
            <div key={c} style={{ width: 18, height: 18, borderRadius: 9, background: c }} />
          ))}
        </div>
        <pre style={{ margin: 0, fontFamily: "Consolas, monospace", fontSize: 36, lineHeight: 1.6, color: "#e2e8f0" }}>
          {CODE.slice(0, chars)}
          <span style={{ opacity: cursorOn ? 1 : 0, color: ACCENT2 }}>▌</span>
        </pre>
      </div>
      <Circles startFrame={50} />
    </AbsoluteFill>
  );
};

const Circles: React.FC<{ startFrame: number }> = ({ startFrame }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  return (
    <div style={{ position: "relative", width: 420, height: 420 }}>
      {[0, 1, 2].map((i) => {
        const s = spring({ frame: frame - startFrame - i * 5, fps, config: { damping: 8 } });
        const size = 420 - i * 120;
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: (420 - size) / 2,
              top: (420 - size) / 2,
              width: size,
              height: size,
              borderRadius: "50%",
              background: i % 2 === 0 ? `linear-gradient(135deg, ${ACCENT}, ${ACCENT2})` : BG,
              transform: `scale(${s})`,
            }}
          />
        );
      })}
    </div>
  );
};

// Scene 3: animated bar chart
const Chart: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const bars = [
    { label: "Idea", value: 0.35 },
    { label: "Code", value: 0.6 },
    { label: "Render", value: 0.8 },
    { label: "Video", value: 1 },
  ];
  const exit = interpolate(frame, [45, 60], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  return (
    <AbsoluteFill style={{ justifyContent: "center", alignItems: "center", opacity: exit, fontFamily: FONT }}>
      <div style={{ display: "flex", alignItems: "flex-end", gap: 60, height: 560 }}>
        {bars.map((b, i) => {
          const s = spring({ frame: frame - i * 8, fps, config: { damping: 14 } });
          return (
            <div key={b.label} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 20 }}>
              <div
                style={{
                  width: 180,
                  height: 460 * b.value * s,
                  borderRadius: 20,
                  background: `linear-gradient(180deg, ${ACCENT2}, ${ACCENT})`,
                }}
              />
              <div style={{ color: "white", fontSize: 40, fontWeight: 600, opacity: s }}>{b.label}</div>
            </div>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};

// Scene 4: outro
const Outro: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const s = spring({ frame, fps, config: { damping: 12 } });
  const sub = interpolate(frame, [15, 30], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  return (
    <AbsoluteFill style={{ justifyContent: "center", alignItems: "center", fontFamily: FONT }}>
      <div style={{ fontSize: 130, fontWeight: 800, color: "white", transform: `scale(${s})` }}>
        Made with <span style={{ color: ACCENT2 }}>Remotion</span>
      </div>
      <div style={{ marginTop: 30, fontSize: 48, color: "#94a3b8", opacity: sub }}>
        React components → MP4
      </div>
    </AbsoluteFill>
  );
};

export const Demo: React.FC = () => (
  <AbsoluteFill>
    <Background />
    <Sequence from={0} durationInFrames={75}>
      <Title />
    </Sequence>
    <Sequence from={75} durationInFrames={105}>
      <Typing />
    </Sequence>
    <Sequence from={180} durationInFrames={60}>
      <Chart />
    </Sequence>
    <Sequence from={240} durationInFrames={60}>
      <Outro />
    </Sequence>
  </AbsoluteFill>
);
