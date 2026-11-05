# Lumi's Magical Adventures — production notes

Children's YouTube Shorts series for the channel "Little Moon Story World", built in code with
Remotion (React/SVG), Three.js (`@remotion/three`), synthesized audio and FFmpeg, inside `video-demo/`.

**Before any episode work, read every note in `memory/` (index: `memory/MEMORY.md`).** They hold the
series rules learned from the user's feedback (comedy, dialogue pace, original score per scene,
singing, safe rendering, 3D upgrade) and must be followed.

Existing workflow (unchanged, reuse it):

- Series rules, how to build an episode, and files per episode: `lumi-studio/worker/guide.md`
  (`audio-src/epNN/lines.json`, `scripts/epNN_audio.py`, `src/epNN/Episode.tsx` + `props.tsx`,
  `src/epNN/episode.json`, one `<Composition>` line in `src/Root.tsx`).
- Story so far and cast: `video-demo/series.json` (append the new episode after it is complete).
- Tools: `node tools/studio.mjs voices|audio|typecheck|stills epNN ...` (run from `video-demo/`).
- Render: add a `render:epNN` script to `video-demo/package.json` that uses `tools/render_chunks.sh`
  (resumable chunks), like `render:ep14`.
- Output: `video-demo/out/epNN-<kebab-title>.mp4`.
- Validate: `python lumi-studio/tools/inspect_video.py` (size, fps, length, blank/frozen frames, silence),
  plus a contact sheet of the final frames.

## Episode prompt files: `video-demo/prompt/`

The user writes one Markdown file per episode: `video-demo/prompt/15.md`, `16.md`, `17.md`, ...
Each file is the complete production brief for that episode. Claude never creates, edits or
invents these files.

### When the user asks to continue production

1. Find the latest successfully completed episode: the highest `epNN-*.mp4` in `video-demo/out/`
   that is also recorded in `video-demo/series.json` (Episode 14 was the latest when this was set up).
2. The next episode is that number + 1. Look for `video-demo/prompt/<N>.md`
   (plain number, no zero padding, e.g. `15.md`).
3. If it exists, read the whole file and follow its instructions exactly.
4. Build the episode with the existing workflow above (story/lines, voices, score, animation,
   composition, stills review).
5. Render the final video with the existing chunked render and save it as
   `video-demo/out/epNN-<title>.mp4`.
6. Validate the MP4 (inspect_video + final contact sheet). Only a validated video counts as complete.
   Then append the episode to `series.json` and report the result.
7. Check for the next numbered prompt file. If it exists, continue with that episode.
8. Repeat, one episode at a time, in order.

### If the next prompt file is missing

- Stop production.
- Do not invent a story or make an episode without the user's prompt.
- Tell the user exactly which file is missing (e.g. `video-demo/prompt/16.md`).
- Wait for the user's instruction before continuing.

### Production rules

- Process episodes sequentially. Never skip an episode number.
- Never overwrite, re-render or modify a completed episode (its `out/` MP4, `src/epNN/`,
  `audio-src/epNN/`, `scripts/epNN_*.py`, `public/epNN/`).
- Follow the episode's prompt file exactly; where it is silent, follow the series rules
  (character consistency, story continuity with `series.json`, comedy, pacing, original score).
- Use the existing Remotion, Three.js, FFmpeg and rendering architecture. Do not build a new
  production system or refactor the existing one.
- No paid APIs or services without the user's approval.
- Actually run voice generation, audio, rendering and validation. Do not stop after writing code.
- Do not move, rename or delete existing files or folders.
