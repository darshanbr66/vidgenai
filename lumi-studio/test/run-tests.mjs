// End-to-end tests of the app using the stand-in Claude. Uses no Claude usage.
// Usage: node test/run-tests.mjs [scenario...]
import { spawn, spawnSync } from "node:child_process";
import { createHash } from "node:crypto";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

const HERE = path.dirname(fileURLToPath(import.meta.url));
const STUDIO = path.resolve(HERE, "..");
const VIDEO = path.resolve(STUDIO, "..", "video-demo");
const PORT = 4179;
const BASE = `http://127.0.0.1:${PORT}`;
const MARK = path.join(os.tmpdir(), `lumi-fake-${process.pid}`);

const hashTree = (rel) => {
  const out = {};
  const visit = (dir) => {
    if (!fs.existsSync(dir)) return;
    for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
      if (e.name === "__pycache__") continue;
      const full = path.join(dir, e.name);
      if (e.isDirectory()) visit(full);
      else out[path.relative(VIDEO, full)] = createHash("sha1").update(fs.readFileSync(full)).digest("hex");
    }
  };
  visit(path.join(VIDEO, rel));
  return out;
};
const fingerprint = () => {
  const out = { ...hashTree("src"), ...hashTree("scripts"), ...hashTree("tools") };
  for (const f of ["package.json", "series.json"]) out[f] = createHash("sha1").update(fs.readFileSync(path.join(VIDEO, f))).digest("hex");
  for (const f of fs.readdirSync(path.join(VIDEO, "out"))) if (f.endsWith(".mp4")) out[`out/${f}`] = String(fs.statSync(path.join(VIDEO, "out", f)).mtimeMs);
  for (const d of ["public", "audio-src"]) for (const e of fs.readdirSync(path.join(VIDEO, d))) if (/^ep\d\d$/.test(e)) out[`${d}/${e}/`] = "present";
  return JSON.stringify(out, Object.keys(out).sort());
};

const startServer = (scenario, ep = "ep99") => {
  const child = spawn(process.execPath, ["server.mjs"], { cwd: STUDIO, stdio: "ignore", env: { ...process.env, LUMI_PORT: String(PORT), LUMI_CLAUDE_BIN: path.join(HERE, "fake-claude.mjs"), LUMI_FAKE: scenario, LUMI_FAKE_EP: ep, LUMI_FAKE_MARK: MARK } });
  return child;
};
const wait = (ms) => new Promise((r) => setTimeout(r, ms));
const until = async (fn, ms, what) => {
  const end = Date.now() + ms;
  while (Date.now() < end) {
    try {
      const v = await fn();
      if (v) return v;
    } catch {}
    await wait(500);
  }
  throw new Error(`Timed out waiting for ${what}`);
};
const post = (url, body) => fetch(BASE + url, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
const jobFile = (id) => JSON.parse(fs.readFileSync(path.join(STUDIO, "data", "jobs", id, "job.json"), "utf8"));
const waitDone = (id, ms) => until(() => { const j = jobFile(id); return j.status !== "running" && j; }, ms, `job ${id}`);
const ready = () => until(async () => (await fetch(`${BASE}/api/state`)).ok, 15000, "server");
const stop = (child) => spawnSync("taskkill", ["/PID", String(child.pid), "/T", "/F"], { windowsHide: true });
const check = (cond, label, detail = "") => {
  console.log(`${cond ? "  pass" : "  FAIL"}  ${label}${!cond && detail ? `\n        ${detail}` : ""}`);
  if (!cond) process.exitCode = 1;
};
const run = async (scenario, body, inner) => {
  console.log(`\n== ${body}`);
  const before = fingerprint();
  const server = startServer(scenario);
  try {
    await ready();
    await inner(before, server);
  } finally {
    stop(server);
    await wait(500);
  }
};
const startJob = async (extra = {}) => (await post("/api/jobs", { prompt: "A test episode", test: true, ...extra })).json();

const SCENARIOS = {
  security: () =>
    run("ok", "Other websites cannot reach the app", async () => {
      const r = await fetch(`${BASE}/api/jobs`, { method: "POST", headers: { "Content-Type": "application/json", Origin: "https://evil.example" }, body: "{}" });
      check(r.status === 403, "a request from another website is refused", `status ${r.status}`);
      const form = await fetch(`${BASE}/api/jobs`, { method: "POST", headers: { "Content-Type": "text/plain" }, body: "{}" });
      check(form.status === 415, "a non-JSON form post is refused", `status ${form.status}`);
      const trav = await fetch(`${BASE}/video/..%2f..%2fpackage.json`);
      check(trav.status === 404, "a path trick cannot read other files", `status ${trav.status}`);
      const empty = await post("/api/jobs", { prompt: " " });
      check(empty.status === 400, "an empty prompt is refused");
    }),
  ok: () =>
    run("ok", "A normal run publishes a checked video and leaves no test files", async (before) => {
      const job = await startJob();
      const again = await post("/api/jobs", { prompt: "Another", test: true });
      check(again.status === 409, "a second episode is refused while one is running");
      const done = await waitDone(job.id, 40 * 60000);
      check(done.status === "done", "the job finished", done.error);
      check(fs.existsSync(done.output ?? ""), "the video exists");
      check(done.facts?.width === 1080 && done.facts?.height === 1920 && done.facts?.fps === 30, "1080x1920 at 30 fps", JSON.stringify(done.facts));
      console.log(`        took ${Math.round((done.finishedAt - done.startedAt) / 1000)} s, ${JSON.stringify(done.facts)}`);
      check(fingerprint() === before, "the project is exactly as it was");
    }),
  tamper: () =>
    run("tamper", "Changing a finished episode's files gets undone and reported", async (before) => {
      const job = await startJob();
      const sawProblem = await until(() => jobFile(job.id).activity.some((a) => a.kind === "problem" && a.text.includes("ep03")) || jobFile(job.id).status !== "running", 8 * 60000, "guard");
      check(sawProblem && jobFile(job.id).activity.some((a) => a.text.includes("ep03")), "the change was caught");
      await post(`/api/jobs/${job.id}/cancel`, {});
      const done = await waitDone(job.id, 2 * 60000);
      check(done.status === "cancelled", "the job could be cancelled", done.status);
      check(fingerprint() === before, "the project is exactly as it was");
    }),
  broken: () =>
    run("broken", "Code that will not build fails cleanly after retries", async (before) => {
      const job = await startJob();
      const done = await waitDone(job.id, 15 * 60000);
      check(done.status === "failed", "the job failed", done.status);
      check(done.pass === 4, "it tried 4 times", `pass ${done.pass}`);
      check(fingerprint() === before, "the project is exactly as it was");
    }),
  limit: () =>
    run("limit", "A usage limit stops immediately with a clear message", async (before) => {
      const job = await startJob();
      const done = await waitDone(job.id, 60000);
      check(done.status === "failed" && done.pass === 1, "it stopped without retrying", `${done.status} pass ${done.pass}`);
      check(/usage limit/.test(done.error ?? ""), "the message says why", done.error);
      check(fingerprint() === before, "the project is exactly as it was");
    }),
  cancel: () =>
    run("slow", "Cancel stops the run and undoes it", async (before) => {
      const job = await startJob();
      await until(() => jobFile(job.id).pid, 15000, "worker");
      const pid = jobFile(job.id).pid;
      await post(`/api/jobs/${job.id}/cancel`, {});
      const done = await waitDone(job.id, 30000);
      check(done.status === "cancelled", "the job shows as cancelled", done.status);
      const alive = spawnSync("tasklist", ["/FI", `PID eq ${pid}`, "/NH"], { encoding: "utf8" }).stdout.includes(String(pid));
      check(!alive, "the worker process is gone");
      check(fingerprint() === before, "the project is exactly as it was");
    }),
  reject: () =>
    run("reject", "A rejection from the second reviewer gets one rework, then publishes", async (before) => {
      fs.rmSync(MARK, { force: true });
      const job = await startJob();
      const done = await waitDone(job.id, 15 * 60000);
      check(done.status === "done", "the job finished", done.error);
      check(done.pass === 2, "it took exactly one rework", `pass ${done.pass}`);
      check(done.activity.some((a) => a.text.includes("Lumi is cropped")), "the reviewer's finding was passed on");
      check(fingerprint() === before, "the project is exactly as it was");
    }),
  revise: async () => {
    console.log("\n== Revising keeps the old video, and a cancelled revision changes nothing");
    const backup = Object.fromEntries(["package.json", "series.json", "src/Root.tsx"].map((f) => [f, fs.readFileSync(path.join(VIDEO, f))]));
    const before = fingerprint();
    const n = Number(JSON.parse(backup["series.json"]).episodes.at(-1).number) + 1;
    const ep = `ep${String(n).padStart(2, "0")}`;
    const file = `${ep}-fake-revise.mp4`;
    const output = path.join(VIDEO, "out", file);
    const versions = path.join(VIDEO, "out", "versions");
    const hadVersions = fs.existsSync(versions);
    const ids = [];
    let server = startServer("revise", ep);
    try {
      await ready();
      const job = await (await post("/api/jobs", { prompt: "A test episode" })).json();
      ids.push(job.id);
      const first = await waitDone(job.id, 15 * 60000);
      check(first.status === "done" && fs.existsSync(output), "the episode was published", first.error);
      check(first.number === n, `it was numbered ${n}`, String(first.number));
      const series = JSON.parse(fs.readFileSync(path.join(VIDEO, "series.json"), "utf8"));
      check(series.episodes.at(-1).number === n, "the series record was updated");
      check(JSON.parse(fs.readFileSync(path.join(VIDEO, "package.json"), "utf8")).scripts[`render:${ep}`]?.includes(file), "a render script was added");
      const state = await (await fetch(`${BASE}/api/state`)).json();
      check(state.nextEpisode === n + 1 && state.episodes.at(-1).revisable, "the page offers it for revising");
      const firstStamp = fs.statSync(output).mtimeMs;

      const rev = await (await post(`/api/episodes/${n}/revise`, { note: "Make it funnier" })).json();
      ids.push(rev.id);
      const revised = await waitDone(rev.id, 15 * 60000);
      check(revised.status === "done", "the revision finished", revised.error);
      check(fs.existsSync(path.join(versions, `${ep}-fake-revise-v1.mp4`)), "the old version was kept");
      check(fs.statSync(output).mtimeMs > firstStamp, "the episode has the new video");
      check(fs.readFileSync(path.join(VIDEO, "src", ep, "Episode.tsx"), "utf8").includes("// revised"), "the change is in the source");
      check((await (await fetch(`${BASE}/api/state`)).json()).episodes.filter((e) => e.number === n).length === 1, "it is still listed once");
      const source = fs.readFileSync(path.join(VIDEO, "src", ep, "Episode.tsx"), "utf8");
      const stamp = fs.statSync(output).mtimeMs;

      stop(server);
      await wait(800);
      server = startServer("slow", ep);
      await ready();
      const old = await post("/api/episodes/1/revise", { note: "Change episode one" });
      check(old.status === 400, "an episode made before the app cannot be revised", `status ${old.status}`);
      const cancelled = await (await post(`/api/episodes/${n}/revise`, { note: "Another change" })).json();
      ids.push(cancelled.id);
      await until(() => jobFile(cancelled.id).pid, 15000, "worker");
      fs.appendFileSync(path.join(VIDEO, "src", ep, "Episode.tsx"), "\n// half finished\n");
      await post(`/api/jobs/${cancelled.id}/cancel`, {});
      const stopped = await waitDone(cancelled.id, 30000);
      check(stopped.status === "cancelled", "the second revision was cancelled", stopped.status);
      check(fs.readFileSync(path.join(VIDEO, "src", ep, "Episode.tsx"), "utf8") === source, "its half-finished change was undone");
      check(fs.statSync(output).mtimeMs === stamp, "the published video was untouched");
    } finally {
      stop(server);
      await wait(800);
      for (const [f, data] of Object.entries(backup)) fs.writeFileSync(path.join(VIDEO, f), data);
      for (const rel of [`src/${ep}`, `public/${ep}`, `audio-src/${ep}`, `build/${ep}`, `scripts/${ep}_audio.py`, `out/${file}`]) fs.rmSync(path.join(VIDEO, rel), { recursive: true, force: true });
      fs.rmSync(path.join(versions, `${ep}-fake-revise-v1.mp4`), { force: true });
      if (!hadVersions) fs.rmSync(versions, { recursive: true, force: true });
      for (const id of ids) fs.rmSync(path.join(STUDIO, "data", "jobs", id), { recursive: true, force: true });
    }
    check(fingerprint() === before, "cleaning up left the project as it was");
  },
  crash: async () => {
    console.log("\n== Closing the app mid-run undoes the run on next start");
    const before = fingerprint();
    let server = startServer("slowend");
    await ready();
    const job = await startJob();
    await until(() => fs.existsSync(path.join(VIDEO, "src", "ep99", "episode.json")), 8 * 60000, "episode files");
    check(fingerprint() !== before, "the run had changed the project");
    stop(server);
    await wait(1000);
    server = startServer("ok");
    await ready();
    const after = jobFile(job.id);
    check(after.status === "failed" && /closed/.test(after.error ?? ""), "the run is marked as interrupted", after.error);
    check(fingerprint() === before, "the project is exactly as it was");
    stop(server);
    await wait(500);
  },
};

const chosen = process.argv.slice(2);
for (const name of chosen.length ? chosen : Object.keys(SCENARIOS)) await SCENARIOS[name]();
fs.rmSync(MARK, { force: true });
console.log(process.exitCode ? "\nSome tests failed." : "\nAll tests passed.");
