// Runs episode jobs: a background Claude writes the episode, then this file renders it,
// checks the result itself, and only publishes a video that passes. Failed runs are undone.
import { execFile, spawn, spawnSync } from "node:child_process";
import { createHash, randomUUID } from "node:crypto";
import { EventEmitter } from "node:events";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

export const STUDIO = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
export const VIDEO = path.resolve(STUDIO, "..", "video-demo");
export const OUT = path.join(VIDEO, "out");
const DATA = path.join(STUDIO, "data");
const JOBS = path.join(DATA, "jobs");
const TEST_RENDERS = path.join(DATA, "test-renders");
const SERIES = path.join(VIDEO, "series.json");
const GUIDE = path.join(STUDIO, "worker", "guide.md");
const REVIEW_GUIDE = path.join(STUDIO, "worker", "review.md");
const PYTHON = path.join(STUDIO, "engine", "venv", "Scripts", "python.exe");
const MODEL_DIR = path.join(STUDIO, "engine", "model");
const FFMPEG_DIR = path.join(VIDEO, "node_modules", "@remotion", "compositor-win32-x64-msvc");

const MODEL = process.env.LUMI_MODEL ?? "opus";
const MAX_PASSES = 4;
const WORKER_TIMEOUT_MS = 90 * 60 * 1000;
const RENDER_TIMEOUT_MS = 90 * 60 * 1000;
const REVIEW_TIMEOUT_MS = 10 * 60 * 1000;
const ACTIVITY_LIMIT = 300;

export const STAGES = [
  { id: "story", label: "Writing the story" },
  { id: "voices", label: "Recording the voices" },
  { id: "sound", label: "Making music and sound" },
  { id: "animate", label: "Animating the scenes" },
  { id: "preview", label: "Checking the frames" },
  { id: "render", label: "Rendering the video" },
  { id: "review", label: "Final quality check" },
];

export const events = new EventEmitter();
events.setMaxListeners(50);

const jobs = new Map();
let active = null;

// ---------- files ----------
const readJson = (file, fallback) => {
  try {
    return JSON.parse(fs.readFileSync(file, "utf8"));
  } catch {
    return fallback;
  }
};
const jobDir = (job) => path.join(JOBS, job.id);
const publicJob = ({ child, cancelled, ...job }) => job;

const save = (job) => {
  fs.mkdirSync(jobDir(job), { recursive: true });
  const file = path.join(jobDir(job), "job.json");
  fs.writeFileSync(`${file}.tmp`, JSON.stringify(publicJob(job), null, 1));
  fs.renameSync(`${file}.tmp`, file);
};
const update = (job, changes = {}) => {
  Object.assign(job, changes);
  save(job);
  events.emit("job", publicJob(job));
};
const log = (job, text, kind = "step") => {
  job.activity.push({ at: Date.now(), kind, text: String(text).slice(0, 600) });
  if (job.activity.length > ACTIVITY_LIMIT) job.activity.splice(0, job.activity.length - ACTIVITY_LIMIT);
  update(job);
};
const walk = (dir, base = dir, found = []) => {
  if (!fs.existsSync(dir)) return found;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.name === "__pycache__") continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full, base, found);
    else found.push(path.relative(base, full));
  }
  return found;
};
const hashFile = (file) => createHash("sha1").update(fs.readFileSync(file)).digest("hex");

// ---------- the series ----------
export const readSeries = () => readJson(SERIES, { episodes: [] });

export const listEpisodes = () => {
  const series = readSeries();
  const made = [...jobs.values()].filter((j) => j.status === "done" && !j.test);
  return fs
    .readdirSync(OUT)
    .map((file) => file.match(/^ep(\d{2})-(.+)\.mp4$/))
    .filter(Boolean)
    .map(([file, number, slug]) => {
      const n = Number(number);
      const info = series.episodes.find((e) => e.number === n) ?? {};
      const latest = made.filter((j) => j.number === n).sort((a, b) => b.finishedAt - a.finishedAt)[0];
      const stat = fs.statSync(path.join(OUT, file));
      return { number: n, file, slug, title: info.title ?? slug, synopsis: info.synopsis ?? "", ending: info.ending ?? "", prompt: latest?.prompt ?? null, notes: latest?.notes ?? [], revisable: Boolean(latest?.sessionId), size: stat.size, modified: stat.mtimeMs };
    })
    .sort((a, b) => a.number - b.number);
};
const isTestNumber = (n) => n >= 90;
export const nextEpisodeNumber = () => Math.max(0, ...fs.readdirSync(OUT).map((f) => Number(f.match(/^ep(\d{2})-/)?.[1] ?? 0)).filter((n) => !isTestNumber(n))) + 1;

export const health = () => {
  const checks = [
    { id: "claude", label: "Claude Code", ok: Boolean(findClaude()), fix: "Install Claude Code, then restart the app." },
    { id: "voices", label: "Voice engine", ok: fs.existsSync(PYTHON) && fs.existsSync(path.join(MODEL_DIR, "kokoro-v1.0.onnx")) && fs.existsSync(path.join(MODEL_DIR, "voices-v1.0.bin")), fix: "Run lumi-studio\\setup.ps1." },
    { id: "remotion", label: "Video renderer", ok: fs.existsSync(path.join(VIDEO, "node_modules", "@remotion", "cli")) && fs.existsSync(path.join(FFMPEG_DIR, "ffprobe.exe")), fix: "Run npm install in video-demo." },
  ];
  return { ok: checks.every((c) => c.ok), checks };
};

// ---------- finding Claude ----------
let claudeBin;
const findClaude = () => {
  if (process.env.LUMI_CLAUDE_BIN) return process.env.LUMI_CLAUDE_BIN;
  if (claudeBin !== undefined) return claudeBin;
  claudeBin = null;
  const where = spawnSync("where.exe", ["claude"], { encoding: "utf8", windowsHide: true });
  for (const hit of (where.stdout ?? "").split(/\r?\n/).filter(Boolean)) {
    // npm's launcher scripts need a shell, and the program behind them does not
    const native = path.join(path.dirname(hit), "node_modules", "@anthropic-ai", "claude-code", "bin", "claude.exe");
    if (fs.existsSync(native)) return (claudeBin = native);
    if (hit.toLowerCase().endsWith(".exe")) return (claudeBin = hit);
  }
  return claudeBin;
};

const claudeEnv = () => {
  const env = { ...process.env, BASH_DEFAULT_TIMEOUT_MS: "900000", BASH_MAX_TIMEOUT_MS: "1800000", PYTHONUTF8: "1" };
  for (const key of Object.keys(env)) if (key === "CLAUDECODE" || key.startsWith("CLAUDE_CODE_")) delete env[key];
  return env;
};

const spawnClaude = (args) => {
  const bin = findClaude();
  if (!bin) throw new Error("Claude Code was not found on this PC.");
  const [cmd, full] = bin.endsWith(".mjs") ? [process.execPath, [bin, ...args]] : [bin, args];
  return spawn(cmd, full, { cwd: VIDEO, stdio: ["pipe", "pipe", "pipe"], env: claudeEnv(), windowsHide: true });
};

const killTree = (pid) => {
  if (pid) spawnSync("taskkill", ["/PID", String(pid), "/T", "/F"], { windowsHide: true });
};

// ---------- snapshot and undo: a failed run leaves the project exactly as it was ----------
const episodePaths = (ep) => [`public/${ep}`, `audio-src/${ep}`];
const SNAPSHOT_TREES = ["src", "scripts", "tools"];

const takeSnapshot = (job) => {
  const dest = path.join(jobDir(job), "snapshot");
  fs.rmSync(dest, { recursive: true, force: true });
  fs.mkdirSync(dest, { recursive: true });
  for (const tree of SNAPSHOT_TREES) fs.cpSync(path.join(VIDEO, tree), path.join(dest, tree), { recursive: true });
  fs.copyFileSync(path.join(VIDEO, "package.json"), path.join(dest, "package.json"));
  fs.copyFileSync(SERIES, path.join(dest, "series.json"));
  // When revising, this episode's audio already exists and has to come back too
  for (const rel of episodePaths(job.episode)) {
    if (fs.existsSync(path.join(VIDEO, rel))) fs.cpSync(path.join(VIDEO, rel), path.join(dest, rel), { recursive: true });
  }
};

const removeEmptyDirs = (dir) => {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (!entry.isDirectory()) continue;
    const full = path.join(dir, entry.name);
    removeEmptyDirs(full);
    if (!fs.readdirSync(full).length) fs.rmdirSync(full);
  }
};

const restoreTree = (from, to) => {
  const keep = new Set(walk(from));
  for (const rel of walk(to)) if (!keep.has(rel)) fs.rmSync(path.join(to, rel), { force: true });
  for (const rel of keep) {
    const target = path.join(to, rel);
    if (!fs.existsSync(target) || hashFile(target) !== hashFile(path.join(from, rel))) {
      fs.mkdirSync(path.dirname(target), { recursive: true });
      fs.copyFileSync(path.join(from, rel), target);
    }
  }
  removeEmptyDirs(to);
};

const restoreSnapshot = (job) => {
  const snap = path.join(jobDir(job), "snapshot");
  if (!fs.existsSync(snap)) return;
  for (const tree of SNAPSHOT_TREES) restoreTree(path.join(snap, tree), path.join(VIDEO, tree));
  fs.copyFileSync(path.join(snap, "package.json"), path.join(VIDEO, "package.json"));
  fs.copyFileSync(path.join(snap, "series.json"), SERIES);
  for (const rel of episodePaths(job.episode)) {
    fs.rmSync(path.join(VIDEO, rel), { recursive: true, force: true });
    if (fs.existsSync(path.join(snap, rel))) fs.cpSync(path.join(snap, rel), path.join(VIDEO, rel), { recursive: true });
  }
  fs.rmSync(path.join(VIDEO, "build", job.episode), { recursive: true, force: true });
};

const dropSnapshot = (job) => fs.rmSync(path.join(jobDir(job), "snapshot"), { recursive: true, force: true });

// Keeps what a failed run wrote, for looking into it later
const keepFailedWork = (job) => {
  const dest = path.join(jobDir(job), "failed-work");
  for (const rel of [`src/${job.episode}`, `audio-src/${job.episode}`]) {
    const from = path.join(VIDEO, rel);
    if (fs.existsSync(from)) fs.cpSync(from, path.join(dest, rel), { recursive: true });
  }
  const script = path.join(VIDEO, "scripts", `${job.episode}_audio.py`);
  if (fs.existsSync(script)) {
    fs.mkdirSync(path.join(dest, "scripts"), { recursive: true });
    fs.copyFileSync(script, path.join(dest, "scripts", path.basename(script)));
  }
};

// Puts back anything outside this episode's own files that the worker changed
const guardProtectedFiles = (job) => {
  const snap = path.join(jobDir(job), "snapshot");
  const problems = [];
  const own = (rel) => rel.startsWith(path.join("src", job.episode) + path.sep) || rel === path.join("src", "Root.tsx") || rel === path.join("scripts", `${job.episode}_audio.py`);
  for (const tree of SNAPSHOT_TREES) {
    const liveDir = path.join(VIDEO, tree);
    const snapDir = path.join(snap, tree);
    const before = new Set(walk(snapDir).map((rel) => path.join(tree, rel)));
    for (const rel of walk(liveDir).map((r) => path.join(tree, r))) {
      if (own(rel) || before.has(rel)) continue;
      fs.rmSync(path.join(VIDEO, rel), { force: true });
      problems.push(`${rel} is outside this episode's files, so it was removed.`);
    }
    for (const rel of before) {
      if (own(rel)) continue;
      const live = path.join(VIDEO, rel);
      if (!fs.existsSync(live) || hashFile(live) !== hashFile(path.join(snap, rel))) {
        fs.mkdirSync(path.dirname(live), { recursive: true });
        fs.copyFileSync(path.join(snap, rel), live);
        problems.push(`${rel} belongs to the series and must not change, so it was put back.`);
      }
    }
  }
  for (const name of ["package.json", "series.json"]) {
    const live = path.join(VIDEO, name);
    if (hashFile(live) !== hashFile(path.join(snap, name))) {
      fs.copyFileSync(path.join(snap, name), live);
      problems.push(`${name} must not change, so it was put back.`);
    }
  }
  const root = fs.readFileSync(path.join(VIDEO, "src", "Root.tsx"), "utf8");
  const original = fs.readFileSync(path.join(snap, "src", "Root.tsx"), "utf8");
  const missing = original.split(/\r?\n/).filter((line) => line.trim() && !root.includes(line.trim()));
  if (missing.length) {
    fs.copyFileSync(path.join(snap, "src", "Root.tsx"), path.join(VIDEO, "src", "Root.tsx"));
    problems.push("src/Root.tsx lost existing lines, so it was put back. Only add this episode's import and Composition line.");
  }
  return problems;
};

const checkOwnFiles = (job) => {
  const ep = job.episode;
  const problems = [];
  const info = readJson(path.join(VIDEO, "src", ep, "episode.json"), null);
  if (!info) problems.push(`src/${ep}/episode.json is missing or is not valid JSON.`);
  else for (const key of ["title", "slug", "synopsis", "ending"]) if (typeof info[key] !== "string" || !info[key].trim()) problems.push(`src/${ep}/episode.json needs "${key}".`);
  if (info?.slug && !/^[a-z0-9]+(-[a-z0-9]+)*$/.test(info.slug)) problems.push(`The slug "${info.slug}" must be lowercase words joined by hyphens.`);
  const source = walk(path.join(VIDEO, "src", ep)).filter((f) => f.endsWith(".tsx")).map((f) => fs.readFileSync(path.join(VIDEO, "src", ep, f), "utf8")).join("\n");
  if (!source) problems.push(`src/${ep}/Episode.tsx is missing.`);
  if (/const\s+(Lumi|Bobo)\b/.test(source)) problems.push("Lumi and Bobo must be imported from src/story/characters.tsx, not redrawn.");
  if (source && !/\bLumi\b/.test(source)) problems.push("Lumi does not appear in this episode.");
  if (source && !/\bBobo(Rider)?\b/.test(source)) problems.push("Bobo does not appear in this episode.");
  if (/Math\.random|Date\.now|new Date/.test(source)) problems.push("Animation must depend only on the frame: use random(seed) from remotion, not Math.random or the clock.");
  return problems;
};

// ---------- running the background Claude ----------
const describeTool = (job, name, input = {}) => {
  const ep = job.episode;
  const file = String(input.file_path ?? "").replace(/\\/g, "/");
  const short = file.split("/").slice(-2).join("/");
  if (name === "Bash") {
    const cmd = String(input.command ?? "");
    if (/studio\.mjs voices/.test(cmd)) return { stage: "voices", text: "Recording the voice lines" };
    if (/studio\.mjs audio/.test(cmd)) return { stage: "sound", text: "Mixing music, effects and dialogue" };
    if (/studio\.mjs typecheck/.test(cmd)) return { text: "Checking the code for mistakes" };
    if (/studio\.mjs stills/.test(cmd)) return { stage: "preview", text: "Rendering preview frames" };
    return { text: `Running ${cmd.slice(0, 80)}` };
  }
  if (name === "Read") {
    if (file.endsWith(".png")) return { stage: "preview", text: "Looking closely at the preview frames" };
    return { text: `Reading ${short}` };
  }
  if (name === "Write" || name === "Edit") {
    const verb = name === "Write" ? "Writing" : "Adjusting";
    if (file.endsWith("lines.json")) return { stage: "story", text: `${verb} the script` };
    if (file.endsWith("_audio.py")) return { stage: "sound", text: `${verb} the soundtrack` };
    if (file.includes(`/src/${ep}/`) && file.endsWith(".tsx")) return { stage: "animate", text: `${verb} ${short}` };
    if (file.endsWith("episode.json")) return { text: "Writing the episode details" };
    return { text: `${verb} ${short}` };
  }
  return { text: name };
};

const runWorker = (job, prompt, resume) =>
  new Promise((resolve, reject) => {
    const args = [
      "-p",
      "--output-format", "stream-json",
      "--verbose",
      "--model", MODEL,
      "--setting-sources", "project",
      "--strict-mcp-config",
      // dontAsk denies everything not listed. acceptEdits would also let through shell file commands.
      "--permission-mode", "dontAsk",
      "--tools", "Read,Write,Edit,Bash",
      "--allowedTools", "Read(./**),Edit(./src/**),Edit(./scripts/**),Edit(./audio-src/**),Bash(node tools/studio.mjs:*)",
      "--append-system-prompt-file", GUIDE,
    ];
    if (resume) args.push("--resume", job.sessionId);
    else args.push("--session-id", job.sessionId);

    const child = spawnClaude(args);
    job.child = child;
    update(job, { pid: child.pid });
    const transcript = fs.createWriteStream(path.join(jobDir(job), "transcript.jsonl"), { flags: "a" });
    let pending = "";
    let result = null;
    let stderr = "";

    const handle = (line) => {
      let event;
      try {
        event = JSON.parse(line);
      } catch {
        return;
      }
      if (event.type === "assistant") {
        for (const block of event.message?.content ?? []) {
          if (block.type === "text" && block.text?.trim()) log(job, block.text.trim(), "note");
          if (block.type === "tool_use") {
            const { stage, text } = describeTool(job, block.name, block.input);
            if (stage) job.stage = stage;
            log(job, text);
          }
        }
      } else if (event.type === "result") {
        result = event;
      }
    };
    child.stdout.on("data", (chunk) => {
      transcript.write(chunk);
      pending += chunk;
      const lines = pending.split("\n");
      pending = lines.pop();
      lines.filter((l) => l.trim()).forEach(handle);
    });
    child.stderr.on("data", (chunk) => (stderr = (stderr + chunk).slice(-3000)));
    const timer = setTimeout(() => {
      stderr += "\nThe writing step ran too long and was stopped.";
      killTree(child.pid);
    }, WORKER_TIMEOUT_MS);
    child.on("error", (e) => {
      clearTimeout(timer);
      reject(e);
    });
    child.on("close", (code) => {
      clearTimeout(timer);
      transcript.end();
      job.child = null;
      if (pending.trim()) handle(pending);
      const ok = code === 0 && result && !result.is_error;
      const message = result?.result || result?.subtype || stderr.trim() || `Claude stopped with exit code ${code}`;
      resolve({ ok, message: String(message) });
    });
    child.stdin.end(prompt);
  });

// Problems that retrying cannot fix: there is no point spending another pass on them
const isAccountProblem = (message) => /usage limit|rate limit|limit reached|hit your .*limit|credit balance|not logged in|please run \/login|authentication|invalid api key|overloaded/i.test(message);

// ---------- rendering and checking ----------
const runRender = (job) =>
  new Promise((resolve) => {
    const dir = path.join(VIDEO, "build", job.episode);
    const progressFile = path.join(dir, "progress.json");
    const child = spawn(process.execPath, ["tools/studio.mjs", "render", job.episode], { cwd: VIDEO, stdio: ["ignore", "pipe", "pipe"], windowsHide: true });
    job.child = child;
    update(job, { pid: child.pid, renderProgress: { done: 0, total: 0, phase: "starting" } });
    let tail = "";
    const collect = (chunk) => (tail = (tail + chunk).slice(-4000));
    child.stdout.on("data", collect);
    child.stderr.on("data", collect);
    const poll = setInterval(() => {
      const progress = readJson(progressFile, null);
      if (progress && progress.done !== job.renderProgress?.done) update(job, { renderProgress: progress });
    }, 1500);
    const timer = setTimeout(() => killTree(child.pid), RENDER_TIMEOUT_MS);
    child.on("close", (code) => {
      clearInterval(poll);
      clearTimeout(timer);
      job.child = null;
      update(job, { renderProgress: null });
      resolve({ ok: code === 0 && fs.existsSync(path.join(dir, "draft.mp4")), tail });
    });
  });

const inspectVideo = (job) =>
  new Promise((resolve) => {
    const draft = path.join(VIDEO, "build", job.episode, "draft.mp4");
    const audio = path.join(VIDEO, "public", job.episode, "audio.wav");
    const script = path.join(STUDIO, "tools", "inspect_video.py");
    execFile(PYTHON, [script, draft, audio, path.join(jobDir(job), "inspect"), FFMPEG_DIR], { windowsHide: true, maxBuffer: 4 * 1024 * 1024 }, (error, stdout, stderr) => {
      if (error) return resolve({ problems: [`The video could not be inspected: ${String(stderr || error.message).slice(-500)}`], warnings: [], facts: {} });
      resolve(JSON.parse(stdout));
    });
  });

const parseReview = (raw) => {
  try {
    const outer = JSON.parse(raw);
    const match = String(outer.result ?? "").match(/\{[\s\S]*\}/);
    return match ? JSON.parse(match[0]) : null;
  } catch {
    return null;
  }
};

// A fresh Claude, who did not write the episode, looks at the finished frames
const reviewVideo = (job, sheet) =>
  new Promise((resolve) => {
    const script = fs.readFileSync(path.join(VIDEO, "audio-src", job.episode, "lines.json"), "utf8");
    const prompt = [
      `The user's request for this episode:\n${job.prompt}`,
      job.revisions?.length ? `Later changes they asked for:\n${job.revisions.join("\n")}` : "",
      `The spoken script, as JSON:\n${script}`,
      `Frames sampled across the finished video, with their times: ${sheet}`,
      "Open that image with Read, review it as instructed, and reply with the JSON only.",
    ].filter(Boolean).join("\n\n");
    const child = spawnClaude(["-p", "--output-format", "json", "--model", MODEL, "--setting-sources", "project", "--strict-mcp-config", "--permission-mode", "dontAsk", "--tools", "Read", "--allowedTools", "Read", "--add-dir", path.dirname(sheet), "--append-system-prompt-file", REVIEW_GUIDE, "--no-session-persistence"]);
    job.child = child;
    update(job, { pid: child.pid });
    let out = "";
    child.stdout.on("data", (chunk) => (out += chunk));
    child.stderr.resume();
    const timer = setTimeout(() => killTree(child.pid), REVIEW_TIMEOUT_MS);
    const skipped = (why) => resolve({ pass: true, issues: [], skipped: why });
    child.on("error", () => skipped("the review could not start"));
    child.on("close", () => {
      clearTimeout(timer);
      job.child = null;
      const verdict = parseReview(out);
      if (!verdict) return skipped("the review gave no readable answer");
      resolve({ pass: Boolean(verdict.pass), issues: Array.isArray(verdict.issues) ? verdict.issues : [] });
    });
    child.stdin.end(prompt);
  });

// ---------- publishing ----------
const nextVersionPath = (file) => {
  const dir = path.join(OUT, "versions");
  fs.mkdirSync(dir, { recursive: true });
  const stem = file.replace(/\.mp4$/, "");
  let v = 1;
  while (fs.existsSync(path.join(dir, `${stem}-v${v}.mp4`))) v++;
  return path.join(dir, `${stem}-v${v}.mp4`);
};

const publish = (job) => {
  const ep = job.episode;
  const info = readJson(path.join(VIDEO, "src", ep, "episode.json"), {});
  const draft = path.join(VIDEO, "build", ep, "draft.mp4");
  const file = `${ep}-${info.slug}.mp4`;

  if (job.test) {
    fs.mkdirSync(TEST_RENDERS, { recursive: true });
    const dest = path.join(TEST_RENDERS, `${job.id}-${info.slug}.mp4`);
    fs.copyFileSync(draft, dest);
    restoreSnapshot(job);
    return { output: dest, title: info.title };
  }

  fs.mkdirSync(OUT, { recursive: true });
  // A revision keeps the version it replaces, so nothing the user has seen is ever lost
  for (const old of fs.readdirSync(OUT).filter((f) => f.startsWith(`${ep}-`) && f.endsWith(".mp4"))) {
    fs.renameSync(path.join(OUT, old), nextVersionPath(old));
  }
  const temp = path.join(OUT, `.${file}.tmp`);
  fs.copyFileSync(draft, temp);
  fs.renameSync(temp, path.join(OUT, file));

  const pkgFile = path.join(VIDEO, "package.json");
  const pkg = JSON.parse(fs.readFileSync(pkgFile, "utf8"));
  const composition = ep[0].toUpperCase() + ep.slice(1);
  pkg.scripts[`render:${ep}`] = `remotion render ${composition} out/${file}`;
  fs.writeFileSync(pkgFile, `${JSON.stringify(pkg, null, 2)}\n`);

  const series = readSeries();
  const entry = { number: job.number, title: info.title, slug: info.slug, synopsis: info.synopsis, ending: info.ending, newCharacters: Array.isArray(info.newCharacters) ? info.newCharacters : [] };
  const at = series.episodes.findIndex((e) => e.number === job.number);
  if (at >= 0) series.episodes[at] = entry;
  else series.episodes.push(entry);
  fs.writeFileSync(SERIES, `${JSON.stringify(series, null, 2)}\n`);

  fs.rmSync(path.join(VIDEO, "build", ep), { recursive: true, force: true });
  return { output: file, title: info.title };
};

// ---------- prompts for the worker ----------
const firstPrompt = (job) => {
  const composition = job.episode[0].toUpperCase() + job.episode.slice(1);
  const previous = readSeries().episodes.at(-1);
  const place = job.mode === "standalone"
    ? "This is a standalone adventure. It can stand on its own, but Lumi, Bobo and the rest of the world stay the same."
    : `This continues the series. The last episode ended like this: "${previous?.ending ?? ""}". Pick up from there in the first scene unless the request below says otherwise.`;
  return [
    `Make episode ${job.number}. Episode id: ${job.episode}. Composition id: ${composition}.`,
    place,
    `What the user wants, in their own words:\n\n${job.prompt}`,
    "Follow their request closely, including anything specific they ask for. Where they leave things open, make the most delightful choice you can.",
  ].join("\n\n");
};

const revisePrompt = (job, note) =>
  [
    `The user watched ${job.episode} and wants this change:\n\n${note}`,
    `Keep everything else as it is. Change only what the request needs, then check the affected moments with stills. If timing or dialogue changes, redo the voices and audio. Keep src/${job.episode}/episode.json accurate.`,
  ].join("\n\n");

const fixPrompt = (problems) =>
  [
    "The app rendered and checked your episode. It cannot be published yet. Fix these, then finish as before:",
    problems.map((p) => `- ${p}`).join("\n"),
  ].join("\n\n");

// ---------- the job itself ----------
const stopIfCancelled = (job) => {
  if (job.cancelled) throw Object.assign(new Error("Cancelled"), { cancelled: true });
};

const execute = async (job, firstMessage, resumeFirst) => {
  takeSnapshot(job);
  let message = firstMessage;
  let resume = resumeFirst;
  let reworked = false;
  let lastProblems = [];

  for (let pass = 1; pass <= MAX_PASSES; pass++) {
    stopIfCancelled(job);
    update(job, { pass });
    if (pass > 1) log(job, `Fixing what the checks found (attempt ${pass} of ${MAX_PASSES})`, "attempt");

    const worker = await runWorker(job, message, resume);
    resume = true;
    stopIfCancelled(job);
    if (!worker.ok) {
      if (isAccountProblem(worker.message)) throw new Error(`Claude could not continue: ${worker.message}`);
      lastProblems = [`The previous attempt stopped early: ${worker.message.slice(0, 500)}`];
      log(job, lastProblems[0], "problem");
      message = fixPrompt(lastProblems);
      continue;
    }

    const fileProblems = [...guardProtectedFiles(job), ...checkOwnFiles(job)];
    if (fileProblems.length) {
      lastProblems = fileProblems;
      log(job, `Sent back: ${fileProblems.join(" ")}`, "problem");
      message = fixPrompt(fileProblems);
      continue;
    }

    update(job, { stage: "render" });
    log(job, "Rendering every frame of the video");
    const render = await runRender(job);
    stopIfCancelled(job);
    if (!render.ok) {
      lastProblems = ["The video would not render."];
      log(job, "The render failed, sending it back to be fixed", "problem");
      message = fixPrompt([`The render failed. End of its output:\n${render.tail.slice(-1500)}`]);
      continue;
    }

    update(job, { stage: "review" });
    log(job, "Measuring the video against the series rules");
    const inspection = await inspectVideo(job);
    update(job, { facts: inspection.facts });
    stopIfCancelled(job);
    if (inspection.problems.length) {
      lastProblems = inspection.problems;
      log(job, `Sent back: ${inspection.problems.join(" ")}`, "problem");
      message = fixPrompt(inspection.problems);
      continue;
    }

    log(job, "A second reviewer is looking over the finished frames");
    const review = await reviewVideo(job, inspection.sheet);
    stopIfCancelled(job);
    if (review.skipped) log(job, `The second review was skipped: ${review.skipped}`, "problem");
    const issues = review.issues.map((i) => (i.at ? `At ${i.at}: ${i.problem}` : i.problem)).filter(Boolean);
    if (!review.pass && !reworked && pass < MAX_PASSES) {
      reworked = true;
      lastProblems = issues;
      log(job, `The reviewer asked for changes: ${issues.join(" ")}`, "problem");
      message = fixPrompt(review.issues.map((i) => [i.at && `At ${i.at}:`, i.problem, i.fix && `Suggested fix: ${i.fix}`].filter(Boolean).join(" ")));
      continue;
    }

    const notes = [...inspection.warnings, ...(review.pass ? [] : issues), ...(review.skipped ? [`The second review was skipped: ${review.skipped}.`] : [])];
    fs.copyFileSync(inspection.sheet, path.join(jobDir(job), "final-sheet.png"));
    const published = publish(job);
    dropSnapshot(job);
    fs.rmSync(path.join(jobDir(job), "inspect"), { recursive: true, force: true });
    update(job, { status: "done", stage: null, finishedAt: Date.now(), notes, ...published, reviewPassed: review.pass, pid: null });
    log(job, `Finished: ${published.title}`, "done");
    return;
  }
  throw new Error(`The video still had problems after ${MAX_PASSES} attempts. ${lastProblems.join(" ")}`.slice(0, 1200));
};

const launch = (job, firstMessage, resumeFirst) => {
  jobs.set(job.id, job);
  active = job;
  update(job);
  execute(job, firstMessage, resumeFirst)
    .catch((error) => {
      if (job.child?.pid) killTree(job.child.pid);
      try {
        keepFailedWork(job);
      } catch {}
      try {
        restoreSnapshot(job);
        dropSnapshot(job);
      } catch (e) {
        job.error = `Undoing the run also failed: ${e.message}`;
      }
      const status = error.cancelled ? "cancelled" : "failed";
      update(job, { status, stage: null, finishedAt: Date.now(), error: job.error ?? (error.cancelled ? null : error.message), pid: null, renderProgress: null });
      log(job, error.cancelled ? "Cancelled. The project is back as it was." : "This run failed. The project is back as it was.", "problem");
    })
    .finally(() => {
      active = null;
    });
};

const baseJob = (fields) => ({ id: `${new Date().toISOString().replace(/[-:T.Z]/g, "").slice(0, 14)}-${randomUUID().slice(0, 6)}`, sessionId: randomUUID(), status: "running", stage: "story", startedAt: Date.now(), activity: [], notes: [], pass: 1, revisions: [], ...fields });

export const busy = () => active && publicJob(active);

export const startEpisode = ({ prompt, mode = "continue", test = false }) => {
  if (active) throw Object.assign(new Error("An episode is already being made."), { status: 409 });
  const number = test ? 99 : nextEpisodeNumber();
  const episode = `ep${String(number).padStart(2, "0")}`;
  const job = baseJob({ kind: "new", test, number, episode, prompt, mode: mode === "standalone" ? "standalone" : "continue" });
  launch(job, firstPrompt(job), false);
  return publicJob(job);
};

export const reviseEpisode = (number, note) => {
  if (active) throw Object.assign(new Error("An episode is already being made."), { status: 409 });
  const previous = [...jobs.values()].filter((j) => j.number === number && j.status === "done" && !j.test).sort((a, b) => b.finishedAt - a.finishedAt)[0];
  if (!previous) throw Object.assign(new Error("Only episodes made in this app can be revised here."), { status: 400 });
  const job = baseJob({ kind: "revise", number, episode: previous.episode, prompt: previous.prompt, mode: previous.mode, sessionId: previous.sessionId, revisions: [...(previous.revisions ?? []), note], stage: "animate" });
  launch(job, revisePrompt(job, note), true);
  return publicJob(job);
};

export const cancelJob = (id) => {
  if (!active || active.id !== id) throw Object.assign(new Error("That job is not running."), { status: 404 });
  active.cancelled = true;
  log(active, "Cancelling...");
  if (active.child?.pid) killTree(active.child.pid);
  return publicJob(active);
};

export const listJobs = () => [...jobs.values()].map(publicJob).sort((a, b) => b.startedAt - a.startedAt);

// A job that was running when the app last closed cannot be picked up again, so it is undone
export const loadJobs = () => {
  fs.mkdirSync(JOBS, { recursive: true });
  for (const id of fs.readdirSync(JOBS)) {
    const job = readJson(path.join(JOBS, id, "job.json"), null);
    if (!job) continue;
    jobs.set(job.id, job);
    if (job.status === "running") {
      killTree(job.pid);
      keepFailedWork(job);
      restoreSnapshot(job);
      dropSnapshot(job);
      update(job, { status: "failed", stage: null, finishedAt: Date.now(), error: "The app closed while this was running, so it was undone.", pid: null, renderProgress: null });
    }
  }
};
