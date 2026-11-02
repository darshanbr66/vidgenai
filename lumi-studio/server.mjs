// Lumi Studio's local web server. It only listens on this PC and only answers its own page.
import fs from "node:fs";
import http from "node:http";
import path from "node:path";
import { exec } from "node:child_process";
import * as jobs from "./lib/jobs.mjs";

const PORT = Number(process.env.LUMI_PORT ?? 4173);
const WEB = path.join(jobs.STUDIO, "public");
const FONTS = path.join(jobs.VIDEO, "public", "fonts");
const MAX_BODY = 64 * 1024;
const MAX_PROMPT = 20000;
const STATIC = {
  "/": [path.join(WEB, "index.html"), "text/html; charset=utf-8"],
  "/app.js": [path.join(WEB, "app.js"), "text/javascript; charset=utf-8"],
  "/style.css": [path.join(WEB, "style.css"), "text/css; charset=utf-8"],
  "/fonts/fredoka.woff2": [path.join(FONTS, "fredoka.woff2"), "font/woff2"],
};

const hosts = new Set([`localhost:${PORT}`, `127.0.0.1:${PORT}`]);

const sendJson = (res, status, body) => {
  res.writeHead(status, { "Content-Type": "application/json; charset=utf-8", "Cache-Control": "no-store" });
  res.end(JSON.stringify(body));
};

const readBody = (req) =>
  new Promise((resolve, reject) => {
    let raw = "";
    req.on("data", (chunk) => {
      raw += chunk;
      if (raw.length > MAX_BODY) reject(Object.assign(new Error("That is too long."), { status: 413 }));
    });
    req.on("end", () => {
      try {
        resolve(JSON.parse(raw || "{}"));
      } catch {
        reject(Object.assign(new Error("Could not read the request."), { status: 400 }));
      }
    });
    req.on("error", reject);
  });

const state = () => ({
  stages: jobs.STAGES,
  health: jobs.health(),
  series: jobs.readSeries().series,
  active: jobs.busy() || null,
  nextEpisode: jobs.nextEpisodeNumber(),
  episodes: jobs.listEpisodes(),
  history: jobs.listJobs().filter((j) => !j.test && j.status !== "running").slice(0, 20),
});

const serveVideo = (req, res, name) => {
  if (!/^ep\d{2}-[a-z0-9-]+\.mp4$/.test(name)) return sendJson(res, 404, { error: "Not found" });
  const file = path.join(jobs.OUT, name);
  if (!fs.existsSync(file)) return sendJson(res, 404, { error: "Not found" });
  const { size } = fs.statSync(file);
  const download = new URL(req.url, "http://x").searchParams.has("download");
  const headers = { "Content-Type": "video/mp4", "Accept-Ranges": "bytes", ...(download && { "Content-Disposition": `attachment; filename="${name}"` }) };
  const range = /^bytes=(\d*)-(\d*)$/.exec(req.headers.range ?? "");
  if (range && (range[1] || range[2])) {
    const start = range[1] ? Number(range[1]) : Math.max(0, size - Number(range[2]));
    const end = range[1] && range[2] ? Math.min(Number(range[2]), size - 1) : size - 1;
    if (start >= size || start > end) {
      res.writeHead(416, { "Content-Range": `bytes */${size}` });
      return res.end();
    }
    res.writeHead(206, { ...headers, "Content-Range": `bytes ${start}-${end}/${size}`, "Content-Length": end - start + 1 });
    return fs.createReadStream(file, { start, end }).pipe(res);
  }
  res.writeHead(200, { ...headers, "Content-Length": size });
  fs.createReadStream(file).pipe(res);
};

const serveEvents = (req, res) => {
  res.writeHead(200, { "Content-Type": "text/event-stream", "Cache-Control": "no-store", Connection: "keep-alive" });
  res.write("retry: 2000\n\n");
  const send = (job) => res.write(`event: job\ndata: ${JSON.stringify(job)}\n\n`);
  const beat = setInterval(() => res.write(": beat\n\n"), 20000);
  jobs.events.on("job", send);
  req.on("close", () => {
    clearInterval(beat);
    jobs.events.off("job", send);
  });
};

const route = async (req, res) => {
  // Stops other websites open in a browser from reaching this app
  if (!hosts.has(req.headers.host)) return sendJson(res, 403, { error: "Forbidden" });
  if (req.method !== "GET" && req.method !== "HEAD") {
    const origin = req.headers.origin;
    if (origin && !hosts.has(origin.replace(/^https?:\/\//, ""))) return sendJson(res, 403, { error: "Forbidden" });
    if (!String(req.headers["content-type"]).startsWith("application/json")) return sendJson(res, 415, { error: "Send JSON" });
  }

  const url = new URL(req.url, `http://${req.headers.host}`);
  const { pathname } = url;

  if (req.method === "GET") {
    if (STATIC[pathname]) {
      const [file, type] = STATIC[pathname];
      res.writeHead(200, { "Content-Type": type, "Cache-Control": "no-cache" });
      return fs.createReadStream(file).pipe(res);
    }
    if (pathname === "/api/state") return sendJson(res, 200, state());
    if (pathname === "/api/events") return serveEvents(req, res);
    if (pathname.startsWith("/video/")) return serveVideo(req, res, decodeURIComponent(pathname.slice(7)));
  }

  if (req.method === "POST") {
    if (pathname === "/api/jobs") {
      const { prompt, mode, test } = await readBody(req);
      const text = String(prompt ?? "").trim();
      if (text.length < 3) return sendJson(res, 400, { error: "Tell me what should happen in the episode." });
      if (text.length > MAX_PROMPT) return sendJson(res, 400, { error: `Please keep it under ${MAX_PROMPT} characters.` });
      if (!jobs.health().ok) return sendJson(res, 503, { error: "Something the app needs is missing. See the warning on the page." });
      return sendJson(res, 201, jobs.startEpisode({ prompt: text, mode, test: test === true }));
    }
    const cancel = pathname.match(/^\/api\/jobs\/([\w-]+)\/cancel$/);
    if (cancel) return sendJson(res, 200, jobs.cancelJob(cancel[1]));
    const revise = pathname.match(/^\/api\/episodes\/(\d+)\/revise$/);
    if (revise) {
      const { note } = await readBody(req);
      const text = String(note ?? "").trim();
      if (text.length < 3) return sendJson(res, 400, { error: "Tell me what to change." });
      if (text.length > MAX_PROMPT) return sendJson(res, 400, { error: `Please keep it under ${MAX_PROMPT} characters.` });
      return sendJson(res, 201, jobs.reviseEpisode(Number(revise[1]), text));
    }
  }
  sendJson(res, 404, { error: "Not found" });
};

jobs.loadJobs();

const server = http.createServer((req, res) => {
  route(req, res).catch((error) => {
    if (res.headersSent) return res.destroy();
    sendJson(res, error.status ?? 500, { error: error.message });
  });
});

server.on("error", (error) => {
  if (error.code === "EADDRINUSE") {
    console.log(`Lumi Studio is already running at http://localhost:${PORT}`);
    if (process.argv.includes("--open")) exec(`start "" http://localhost:${PORT}`);
    process.exit(0);
  }
  throw error;
});

server.listen(PORT, "127.0.0.1", () => {
  console.log(`Lumi Studio is running at http://localhost:${PORT}`);
  console.log("Keep this window open while you make videos. Close it to stop the app.");
  if (process.argv.includes("--open")) exec(`start "" http://localhost:${PORT}`);
});
