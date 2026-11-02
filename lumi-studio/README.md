# Lumi Studio

A private app on this PC: type a prompt, get a finished episode of Lumi's Magical Adventures.

**To start:** double-click `Lumi Studio.bat` in the project folder. Keep its window open while making videos, and close it to stop the app.

Finished episodes go in `video-demo/out/`. When an episode is changed, the old version moves to `video-demo/out/versions/`.

## What happens to a prompt

1. A background Claude Code session (`claude -p`, on your Claude plan) writes the story, voices, soundtrack and animation, following `worker/guide.md`, and checks preview frames.
2. The app renders the video and measures it with `tools/inspect_video.py`: size, frame rate, length, blank or frozen pictures, silence.
3. A second Claude session that did not write the episode reviews the finished frames, following `worker/review.md`. It can send the episode back once.
4. Only then is the video published. After 4 failed attempts, or if you cancel, the project is restored exactly as it was.

## Changing how episodes turn out

- `worker/guide.md` holds the series rules and how to build an episode. Edit it to change every future episode.
- `video-demo/series.json` holds the story so far. The app adds to it automatically.

## If something goes wrong

- Details of each run are in `data/jobs/<run>/`: `job.json`, `transcript.jsonl`, and `failed-work/` if it failed.
- Voice engine missing: run `setup.ps1`.
- Test the app without using any Claude usage: `node test/run-tests.mjs`.
