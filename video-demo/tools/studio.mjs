// The commands Lumi Studio's background worker is allowed to run, and the render the app runs.
// Usage: node tools/studio.mjs <voices|audio|typecheck|stills|render> [episode] [...]
import { spawn } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const VIDEO = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const STUDIO = path.resolve(VIDEO, "..", "lumi-studio");
const PYTHON = path.join(STUDIO, "engine", "venv", "Scripts", "python.exe");
const MODEL = path.join(STUDIO, "engine", "model");
const REMOTION = path.join(VIDEO, "node_modules", "@remotion", "cli", "remotion-cli.js");
// WebGL for 3D scenes: "angle" uses the graphics chip; set LUMI_GL=swangle to render on the CPU instead
const GL = process.env.LUMI_GL || "angle";

const [command, episode, ...rest] = process.argv.slice(2);

const fail = (message) => {
  console.error(message);
  process.exit(1);
};
const compositionId = (ep) => ep[0].toUpperCase() + ep.slice(1);
const buildDir = (ep) => {
  const dir = path.join(VIDEO, "build", ep);
  fs.mkdirSync(dir, { recursive: true });
  return dir;
};

const run = (bin, args, onLine) =>
  new Promise((resolve) => {
    const child = spawn(bin, args, { cwd: VIDEO, stdio: ["ignore", "pipe", "pipe"], env: { ...process.env, PYTHONIOENCODING: "utf-8", PYTHONUTF8: "1", PYTHONDONTWRITEBYTECODE: "1" } });
    for (const stream of [child.stdout, child.stderr]) {
      let pending = "";
      stream.on("data", (chunk) => {
        pending += chunk;
        const lines = pending.split(/\r\n|\r|\n/);
        pending = lines.pop();
        for (const line of lines) if (line.trim()) (onLine ?? console.log)(line);
      });
      stream.on("end", () => pending.trim() && (onLine ?? console.log)(pending));
    }
    child.on("error", (e) => fail(`Could not start ${bin}: ${e.message}`));
    child.on("close", (code) => resolve(code ?? 1));
  });

const requireEpisode = () => {
  if (!/^ep\d{2}$/.test(episode ?? "")) fail(`Expected an episode id like ep04, got "${episode ?? ""}"`);
};

const stills = async () => {
  const seconds = rest.map(Number);
  if (!seconds.length || seconds.some((s) => !Number.isFinite(s) || s < 0)) fail("Give the seconds to show, like: stills ep04 1 8 15 22");
  if (seconds.length > 12) fail("At most 12 frames per sheet");
  const dir = buildDir(episode);
  const bundle = path.join(dir, "bundle");
  const code = await run(process.execPath, [REMOTION, "bundle", "--out-dir", bundle, "--log", "error"]);
  if (code) fail("The project did not bundle. Fix the errors above.");

  const load = (name) => import(pathToFileURL(path.join(VIDEO, "node_modules", "@remotion", "renderer", "dist", name)).href);
  const { openBrowser, selectComposition, renderStill } = await load("index.js").then((m) => m.default ?? m);
  const browser = await openBrowser("chrome", { chromiumOptions: { gl: GL } });
  const files = [];
  try {
    const composition = await selectComposition({ serveUrl: bundle, id: compositionId(episode), puppeteerInstance: browser });
    for (const s of seconds) {
      const frame = Math.min(Math.round(s * composition.fps), composition.durationInFrames - 1);
      const output = path.join(dir, `still-${String(frame).padStart(4, "0")}.png`);
      await renderStill({ composition, serveUrl: bundle, output, frame, scale: 0.5, puppeteerInstance: browser, overwrite: true });
      files.push(output);
    }
  } finally {
    await browser.close({ silent: true });
  }
  const sheet = path.join(dir, "sheet.png");
  const made = await run(PYTHON, [path.join(STUDIO, "tools", "contact_sheet.py"), sheet, ...files.flatMap((f, i) => [f, `${seconds[i]}s`])]);
  if (made) fail("Could not build the contact sheet.");
  console.log(`Contact sheet: build/${episode}/sheet.png`);
};

const render = async () => {
  const dir = buildDir(episode);
  const progress = path.join(dir, "progress.json");
  let last = 0;
  const code = await run(process.execPath, [REMOTION, "render", compositionId(episode), path.join("build", episode, "draft.mp4"), "--overwrite", "--log", "info", `--gl=${GL}`], (line) => {
    const m = line.match(/(?:Rendered|Encoded|Rendering frames?)\D*(\d+)\s*\/\s*(\d+)/i);
    if (m && Date.now() - last > 1000) {
      last = Date.now();
      fs.writeFileSync(progress, JSON.stringify({ done: Number(m[1]), total: Number(m[2]), phase: /encod/i.test(line) ? "encoding" : "rendering" }));
    }
    console.log(line);
  });
  fs.rmSync(progress, { force: true });
  process.exit(code);
};

const main = async () => {
  switch (command) {
    case "voices":
      requireEpisode();
      process.exit(await run(PYTHON, ["scripts/voices.py", episode, MODEL]));
    case "audio":
      requireEpisode();
      process.exit(await run(PYTHON, [`scripts/${episode}_audio.py`]));
    case "typecheck":
      process.exit(await run(process.execPath, [path.join(VIDEO, "node_modules", "typescript", "bin", "tsc"), "--noEmit", "-p", "."]));
    case "stills":
      requireEpisode();
      return stills();
    case "render":
      requireEpisode();
      return render();
    default:
      fail("Commands: voices, audio, typecheck, stills, render");
  }
};

main().catch((e) => fail(e.stack ?? String(e)));
