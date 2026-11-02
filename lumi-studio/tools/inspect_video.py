"""Measures a rendered episode against the series rules, independently of whoever made it.

Usage: python inspect_video.py <video.mp4> <audio.wav> <work-dir> <bin-dir>
Prints JSON: {"problems": [...], "warnings": [...], "facts": {...}, "sheet": path}
"""
import json
import os
import subprocess
import sys
import wave

import numpy as np
from PIL import Image

from contact_sheet import build

BLANK_STD = 7.0  # below this a frame has almost no picture in it
FROZEN_DIFF = 0.2  # mean per-pixel change between samples that counts as no movement
HOOK_DIFF = 1.2  # mean per-pixel change expected within the first second
SILENT_DB = -45.0
SILENT_RUN_S = 3.0
SAMPLES = 12

video, audio, work, bin_dir = sys.argv[1:5]
ffprobe = os.path.join(bin_dir, "ffprobe.exe")
ffmpeg = os.path.join(bin_dir, "ffmpeg.exe")
os.makedirs(work, exist_ok=True)
problems, warnings, facts = [], [], {}

info = json.loads(subprocess.run([ffprobe, "-v", "error", "-show_streams", "-show_format", "-of", "json", video], capture_output=True, text=True, check=True).stdout)
streams = info["streams"]
v = next((s for s in streams if s["codec_type"] == "video"), None)
a = next((s for s in streams if s["codec_type"] == "audio"), None)
duration = float(info["format"]["duration"])
num, den = v["r_frame_rate"].split("/")
fps = float(num) / float(den)
facts.update(width=v["width"], height=v["height"], fps=round(fps, 2), duration=round(duration, 2), size=int(info["format"]["size"]), has_audio=bool(a))
if (v["width"], v["height"]) != (1080, 1920):
    problems.append(f'The video is {v["width"]}x{v["height"]}, it must be 1080x1920.')
if abs(fps - 30) > 0.01:
    problems.append(f"The video is {fps:.2f} fps, it must be 30.")
if not 39.9 <= duration <= 50.15:
    problems.append(f"The video is {duration:.1f} s long, it must be 40 to 50 s.")
if not a:
    problems.append("The video has no audio track.")


def grab(t, name):
    path = os.path.join(work, name)
    subprocess.run([ffmpeg, "-y", "-v", "error", "-ss", f"{t:.3f}", "-i", video, "-frames:v", "1", path], check=True, capture_output=True)
    return path


def gray(path):
    with Image.open(path) as im:
        return np.asarray(im.convert("L").resize((270, 480)), dtype=np.float32)


# ---------- pictures ----------
times = [0.1 + i * (duration - 0.3) / (SAMPLES - 1) for i in range(SAMPLES)]
paths = [grab(t, f"sample-{i:02}.png") for i, t in enumerate(times)]
frames = [gray(p) for p in paths]
for t, frame in zip(times, frames):
    if frame.std() < BLANK_STD:
        problems.append(f"The picture is nearly blank at {t:.1f} s.")
still_run = 0
for i in range(1, len(frames)):
    still_run = still_run + 1 if np.abs(frames[i] - frames[i - 1]).mean() < FROZEN_DIFF else 0
    if still_run >= 2:
        problems.append(f"The picture barely changes between {times[i - 2]:.1f} s and {times[i]:.1f} s.")
        break
hook = float(np.abs(gray(grab(1.0, "hook.png")) - frames[0]).mean())
facts["first_second_change"] = round(hook, 2)
if hook < HOOK_DIFF:
    warnings.append("There is little movement in the first second, so the opening hook may be weak.")
sheet = os.path.join(work, "final-sheet.png")
build(sheet, [(p, f"{t:.1f}s") for p, t in zip(paths, times)])

# ---------- sound ----------
with wave.open(audio) as w:
    sr = w.getframerate()
    x = np.frombuffer(w.readframes(w.getnframes()), dtype=np.int16).astype(np.float32) / 32768
    x = x.reshape(-1, w.getnchannels()).mean(axis=1)
facts["audio_duration"] = round(len(x) / sr, 2)
if abs(len(x) / sr - duration) > 0.5:
    problems.append(f"The soundtrack is {len(x) / sr:.1f} s but the video is {duration:.1f} s.")
peak = float(np.max(np.abs(x)))
facts["audio_peak"] = round(peak, 3)
if peak < 0.2:
    problems.append("The soundtrack is far too quiet.")
step = sr // 4
db = 20 * np.log10(np.array([np.sqrt(np.mean(x[i : i + step] ** 2)) for i in range(0, len(x) - step, step)]) + 1e-9)
run, longest = 0, 0
for value in db[:-4]:  # the closing fade is meant to go quiet
    run = run + 1 if value < SILENT_DB else 0
    longest = max(longest, run)
facts["longest_silence"] = round(longest / 4, 2)
if longest / 4 > SILENT_RUN_S:
    problems.append(f"The soundtrack goes silent for {longest / 4:.1f} s.")

print(json.dumps({"problems": problems, "warnings": warnings, "facts": facts, "sheet": sheet}))
