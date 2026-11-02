const $ = (id) => document.getElementById(id);
const els = Object.fromEntries(["banner", "count", "compose", "composeTitle", "prompt", "continueHint", "makeBtn", "formError", "progress", "progressTitle", "progressHeadline", "progressPrompt", "steps", "renderMeter", "renderBar", "elapsed", "cancelBtn", "activity", "result", "phone", "player", "now", "shelf", "pastWrap", "past"].map((id) => [id, $(id)]));

let state = null;
let job = null;
let finished = null; // the job whose result panel is showing
let playing = null;
let lastActivityCount = 0;

const el = (tag, props = {}, ...children) => {
  const node = Object.assign(document.createElement(tag), props);
  node.append(...children.filter((c) => c != null));
  return node;
};

const api = async (url, body) => {
  const res = await fetch(url, body ? { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) } : undefined);
  const data = await res.json();
  if (!res.ok) throw new Error(data.error ?? "Something went wrong.");
  return data;
};

const clock = (ms) => {
  const s = Math.max(0, Math.floor(ms / 1000));
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = String(s % 60).padStart(2, "0");
  return h ? `${h}h ${String(m).padStart(2, "0")}m` : `${m}:${sec}`;
};

const jobLabel = (j) => (j.kind === "revise" ? `Changing episode ${j.number}` : `Episode ${j.number}`);

// ---------- player ----------
const play = (episode, autoplay = false) => {
  playing = episode;
  els.player.src = `/video/${encodeURIComponent(episode.file)}`;
  els.phone.classList.add("has-video");
  if (autoplay) els.player.play().catch(() => {});
  renderNow();
  renderShelf();
};

const renderNow = () => {
  els.now.replaceChildren();
  if (!playing) return;
  const download = el("a", { className: "small-btn", href: `/video/${encodeURIComponent(playing.file)}?download`, textContent: "Download" });
  const row = el("div", { className: "row" }, download);
  els.now.append(el("b", { textContent: `${playing.number}. ${playing.title}` }));
  if (playing.synopsis) els.now.append(el("p", { textContent: playing.synopsis }));
  if (playing.revisable) {
    const form = el("form", { className: "revise", hidden: true });
    const note = el("textarea", { rows: 3, maxLength: 20000, placeholder: "Make Bobo's scene funnier, and slow down the ending...", ariaLabel: "What to change" });
    const send = el("button", { className: "small-btn", type: "submit", textContent: "Make this change" });
    const problem = el("p", { className: "hint", role: "alert" });
    form.append(note, el("div", { className: "row" }, send), problem);
    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      try {
        setJob(await api(`/api/episodes/${playing.number}/revise`, { note: note.value }));
      } catch (error) {
        problem.textContent = error.message;
      }
    });
    const toggle = el("button", { className: "small-btn", type: "button", textContent: "Change something" });
    toggle.addEventListener("click", () => {
      form.hidden = !form.hidden;
      if (!form.hidden) note.focus();
    });
    toggle.disabled = Boolean(job);
    row.append(toggle);
    els.now.append(row, form);
  } else {
    els.now.append(row);
  }
};

// ---------- library ----------
const renderShelf = () => {
  els.shelf.replaceChildren();
  if (!state.episodes.length) {
    els.shelf.append(el("p", { className: "empty", textContent: "No episodes yet." }));
    return;
  }
  for (const episode of state.episodes) {
    const card = el("button", { className: `card${playing?.file === episode.file ? " playing" : ""}`, type: "button" });
    card.append(
      el("video", { src: `/video/${encodeURIComponent(episode.file)}#t=2`, preload: "metadata", muted: true, tabIndex: -1 }),
      el("span", { className: "meta" }, el("span", { className: "num", textContent: `Episode ${episode.number}` }), el("span", { className: "name", textContent: episode.title })),
    );
    card.addEventListener("click", () => play(episode, true));
    els.shelf.append(card);
  }
};

const renderPast = () => {
  const failed = state.history.filter((j) => j.status === "failed").slice(0, 5);
  els.pastWrap.hidden = !failed.length;
  els.past.replaceChildren(
    ...failed.map((j) => {
      const again = el("button", { className: "small-btn", type: "button", textContent: "Use this prompt" });
      again.addEventListener("click", () => {
        els.prompt.value = j.prompt;
        els.prompt.focus();
        scrollTo({ top: 0, behavior: "smooth" });
      });
      return el("li", {}, el("span", { className: "what", textContent: j.prompt }), again, el("span", { className: "why", textContent: j.error ?? "" }));
    }),
  );
};

// ---------- progress ----------
const renderSteps = () => {
  const at = state.stages.findIndex((s) => s.id === job.stage);
  els.steps.replaceChildren(
    ...state.stages.map((stage, i) => {
      const status = i < at ? "done" : i === at ? "now" : "";
      return el("li", { className: status }, el("span", { className: "dot", textContent: status === "done" ? "✓" : "" }), el("span", { textContent: stage.label }));
    }),
  );
};

const renderActivity = () => {
  if (job.activity.length === lastActivityCount) return;
  lastActivityCount = job.activity.length;
  const list = els.activity;
  const pinned = list.scrollHeight - list.scrollTop - list.clientHeight < 30;
  list.replaceChildren(...job.activity.map((a) => el("li", { className: a.kind, textContent: a.text })));
  if (pinned) list.scrollTop = list.scrollHeight;
};

const renderProgress = () => {
  const stage = state.stages.find((s) => s.id === job.stage);
  els.progressTitle.textContent = jobLabel(job);
  els.progressHeadline.textContent = `${stage?.label ?? "Working"}...`;
  els.progressPrompt.textContent = job.revisions?.at(-1) && job.kind === "revise" ? job.revisions.at(-1) : job.prompt;
  renderSteps();
  renderActivity();
  const render = job.renderProgress;
  els.renderMeter.hidden = !(render && render.total);
  if (render?.total) els.renderBar.style.width = `${(render.done / render.total) * 100}%`;
  tick();
};

const tick = () => {
  if (!job) return;
  const passNote = job.pass > 1 ? `, attempt ${job.pass}` : "";
  const render = job.renderProgress;
  const frames = render?.total ? ` · frame ${render.done} of ${render.total}` : "";
  els.elapsed.textContent = `${clock(Date.now() - job.startedAt)} so far${passNote}${frames}`;
};
setInterval(tick, 1000);

// ---------- result ----------
const renderResult = () => {
  els.result.hidden = !finished;
  els.result.replaceChildren();
  if (!finished) return;
  const close = el("button", { className: "quiet", type: "button", textContent: "Close" });
  close.addEventListener("click", () => {
    finished = null;
    renderResult();
  });
  const row = el("div", { className: "row" }, close);
  if (finished.status === "done") {
    const took = clock(finished.finishedAt - finished.startedAt);
    els.result.append(el("p", { className: "eyebrow", textContent: "Finished" }), el("h2", { textContent: finished.title ?? `Episode ${finished.number}` }), el("p", { textContent: `Episode ${finished.number} took ${took}. It passed the video checks and is playing on the right.` }));
    if (finished.notes?.length) {
      els.result.append(el("div", { className: "notes" }, "Worth a look when you watch it:", el("ul", {}, ...finished.notes.map((n) => el("li", { textContent: n })))));
    }
  } else if (finished.status === "cancelled") {
    els.result.append(el("h2", { textContent: "Cancelled" }), el("p", { textContent: "Nothing was changed. Your prompt is still in the box." }));
  } else {
    els.result.append(el("p", { className: "eyebrow", textContent: "This one did not finish" }), el("h2", { textContent: "No video was made" }), el("p", { className: "error", textContent: finished.error ?? "Something went wrong." }), el("p", { textContent: "The project is back as it was. Your prompt is still in the box, so you can try again." }));
  }
  els.result.append(row);
};

// ---------- overall ----------
const renderFrame = () => {
  els.progress.hidden = !job;
  els.compose.hidden = Boolean(job);
  if (job) renderProgress();
  renderResult();
  renderNow();
};

const setJob = (next) => {
  job = next;
  finished = null;
  lastActivityCount = 0;
  renderFrame();
  if (job.status !== "running") finish(job);
};

const finish = async (done) => {
  const wasRevision = done.kind === "revise";
  job = null;
  finished = done;
  await refresh();
  if (done.status === "done") {
    els.prompt.value = "";
    const episode = state.episodes.find((e) => e.number === done.number);
    if (episode) play(episode, !wasRevision);
  } else if (!wasRevision && !els.prompt.value) {
    els.prompt.value = done.prompt;
  }
  renderFrame();
};

const refresh = async () => {
  state = await api("/api/state");
  if (state.active && !job) {
    job = state.active;
  }
  els.count.textContent = `${state.episodes.length} episode${state.episodes.length === 1 ? "" : "s"}`;
  els.composeTitle.textContent = `Episode ${state.nextEpisode}`;
  const last = state.episodes.at(-1);
  els.continueHint.textContent = last ? `Picks up from episode ${last.number}` : "Picks up from the last episode";
  const missing = state.health.checks.filter((c) => !c.ok);
  els.banner.hidden = !missing.length;
  els.banner.textContent = missing.map((c) => `${c.label} is missing. ${c.fix}`).join(" ");
  els.makeBtn.disabled = !state.health.ok;
  renderShelf();
  renderPast();
  renderFrame();
};

els.compose.addEventListener("submit", async (e) => {
  e.preventDefault();
  els.formError.textContent = "";
  els.makeBtn.disabled = true;
  try {
    const mode = els.compose.elements.mode.value;
    setJob(await api("/api/jobs", { prompt: els.prompt.value, mode }));
  } catch (error) {
    els.formError.textContent = error.message;
  } finally {
    els.makeBtn.disabled = !state.health.ok;
  }
});

els.cancelBtn.addEventListener("click", async () => {
  if (!job || !confirm("Stop making this episode? The work so far will be thrown away.")) return;
  try {
    await api(`/api/jobs/${job.id}/cancel`, {});
  } catch (error) {
    els.elapsed.textContent = error.message;
  }
});

const stream = new EventSource("/api/events");
stream.addEventListener("job", (e) => {
  const update = JSON.parse(e.data);
  if (update.test) return;
  if (update.status === "running") {
    job = update;
    els.progress.hidden = false;
    els.compose.hidden = true;
    renderProgress();
  } else if (job?.id === update.id) {
    finish(update);
  }
});
// After the app restarts or the connection drops, catch up with whatever happened meanwhile
stream.addEventListener("open", () => refresh().catch(() => {}));

refresh().catch((error) => {
  els.banner.hidden = false;
  els.banner.textContent = error.message;
});
