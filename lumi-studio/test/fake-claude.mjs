// Stands in for Claude Code in tests, so the app's behaviour can be checked without using any
// Claude usage. LUMI_FAKE picks how it behaves: ok, tamper, broken, limit, slow, reject.
import { execFileSync } from "node:child_process";
import fs from "node:fs";

const scenario = process.env.LUMI_FAKE ?? "ok";
const args = process.argv.slice(2);
const prompt = fs.readFileSync(0, "utf8");
const emit = (event) => process.stdout.write(`${JSON.stringify(event)}\n`);
const say = (text) => emit({ type: "assistant", message: { content: [{ type: "text", text }] } });
const tool = (name, input) => emit({ type: "assistant", message: { content: [{ type: "tool_use", name, input }] } });
const studio = (...a) => execFileSync(process.execPath, ["tools/studio.mjs", ...a], { stdio: "pipe", encoding: "utf8" });

// The second reviewer
if (args.includes("json")) {
  const reject = scenario === "reject" && !fs.existsSync(process.env.LUMI_FAKE_MARK);
  if (reject) fs.writeFileSync(process.env.LUMI_FAKE_MARK, "1");
  const verdict = reject ? { pass: false, issues: [{ at: "3s", problem: "Lumi is cropped", fix: "Move the camera" }] } : { pass: true, issues: [] };
  process.stdout.write(JSON.stringify({ type: "result", result: JSON.stringify(verdict) }));
  process.exit(0);
}

const finish = () => {
  emit({ type: "result", subtype: "success", is_error: false, result: "Done." });
  process.exit(0);
};

if (scenario === "limit") {
  emit({ type: "result", subtype: "error", is_error: true, result: "You've hit your usage limit." });
  process.exit(1);
}
if (scenario === "slow") {
  say("Thinking for a long time...");
  setInterval(() => {}, 1000);
  await new Promise(() => {});
}

// A fix pass only has to answer, because the episode already exists
const resumed = args.includes("--resume");
const ep = resumed ? process.env.LUMI_FAKE_EP : prompt.match(/Episode id: (ep\d\d)/)[1];
const Comp = ep[0].toUpperCase() + ep.slice(1);
if (resumed && scenario !== "broken") {
  say("Fixing it.");
  if (scenario === "revise") fs.appendFileSync(`src/${ep}/Episode.tsx`, "\n// revised\n");
  finish();
}

say("Starting.");
tool("Write", { file_path: `audio-src/${ep}/lines.json` });
fs.mkdirSync(`audio-src/${ep}`, { recursive: true });
fs.writeFileSync(`audio-src/${ep}/lines.json`, JSON.stringify([{ id: "l1", speaker: "lumi", text: "Bobo! Did you see that?", speed: 0.9 }, { id: "b1", speaker: "bobo", text: "It is glowing!", speed: 0.85 }]));
tool("Bash", { command: `node tools/studio.mjs voices ${ep}` });
studio("voices", ep);
tool("Write", { file_path: `scripts/${ep}_audio.py` });
fs.writeFileSync(
  `scripts/${ep}_audio.py`,
  `from audio_kit import *
t = Soundtrack("${ep}", duration=40.0, seed=9)
t.line("l1", "lumi", 0.9)
t.line("b1", "bobo", 5.0)
run(t, HOPE, 0.0, 36.0, 0.08)
ending_chord(t, 36.0)
gliss(t.sfx, 0.0, (72, 76, 79), step=0.06, vol=0.07)
t.finish()
`,
);
tool("Bash", { command: `node tools/studio.mjs audio ${ep}` });
studio("audio", ep);
tool("Write", { file_path: `src/${ep}/Episode.tsx` });
const bad = scenario === "broken" ? `import { Missing } from "./does-not-exist";\nconsole.log(Missing);\n` : "";
fs.writeFileSync(
  `src/${ep}/Episode.tsx`,
  `${bad}import React from "react";
import { useCurrentFrame } from "remotion";
import timeline from "./timeline.json";
import { blinkAt, Lumi } from "../story/characters";
import { Woods } from "../ep02/props";
import { BoboRider, EndCard, EpisodeFrame, ip, makeMouthAt, SparkBurst, Stage } from "../kit";

const mouthAt = makeMouthAt(timeline);
const CUTS = [0, 600, 1200];

const One: React.FC = () => {
  const f = useCurrentFrame();
  return (
    <Stage cam={{ cx: 1120, cy: 1200, z: ip(f, [0, 600], [1.05, 1.3]) }}>
      <Woods g={f} />
      <BoboRider g={f} x={1330} y={1776} scale={0.78} expr="excited" mouth={mouthAt("bobo", f)} blink={blinkAt(f, 3)} />
      <Lumi x={930} y={1790} scale={0.86} expr="happy" mouth={mouthAt("lumi", f)} blink={blinkAt(f, 1)} />
      <SparkBurst f={f} at={0} x={1120} y={900} reach={520} count={30} size={22} rainbow />
    </Stage>
  );
};
const Two: React.FC = () => {
  const f = useCurrentFrame();
  return (
    <>
      <Stage cam={{ cx: 1120, cy: 1200, z: ip(f, [0, 600], [1.3, 1.05]) }}>
        <Woods g={f + 600} />
        <BoboRider g={f} x={1330} y={1776} scale={0.78} expr="happy" blink={blinkAt(f, 3)} />
        <Lumi x={930} y={1790} scale={0.86} expr="surprised" blink={blinkAt(f, 1)} />
      </Stage>
      <EndCard at={520} />
    </>
  );
};
export const Episode: React.FC = () => <EpisodeFrame audio="${ep}/audio.wav" cuts={CUTS} scenes={[One, Two]} />;
`,
);
const root = fs.readFileSync("src/Root.tsx", "utf8");
fs.writeFileSync(
  "src/Root.tsx",
  root
    .replace('import { LittleStarStory }', `import { Episode as ${Comp} } from "./${ep}/Episode";\nimport { LittleStarStory }`)
    .replace("  </>\n", `    <Composition id="${Comp}" component={${Comp}} durationInFrames={1200} fps={30} width={1080} height={1920} />\n  </>\n`),
);
if (scenario !== "broken") {
  tool("Bash", { command: `node tools/studio.mjs stills ${ep} 1 20 39` });
  studio("stills", ep, "1", "20", "39");
  tool("Read", { file_path: `build/${ep}/sheet.png` });
}
if (scenario === "tamper") fs.appendFileSync("src/ep03/props.tsx", "\n// tampered\n");
fs.writeFileSync(`src/${ep}/episode.json`, JSON.stringify({ title: `Fake ${scenario}`, slug: `fake-${scenario}`, synopsis: "A test.", ending: "A test ending.", newCharacters: [] }));
if (scenario === "slowend") {
  await new Promise(() => {});
}
finish();
