"""Generates the raw voice lines for Episode 2 with Kokoro, a free offline voice model.

Setup (one time, no account or API key):
  python -m venv <venv>
  <venv>/Scripts/python -m pip install kokoro-onnx soundfile
  download kokoro-v1.0.onnx and voices-v1.0.bin from
  https://github.com/thewh1teagle/kokoro-onnx/releases/tag/model-files-v1.0

Usage: <venv>/Scripts/python scripts/ep02_voices.py <model-dir>
Output: audio-src/ep02/raw/<id>.wav
"""
import os
import sys

import soundfile as sf
from kokoro_onnx import Kokoro

ROOT = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..")
OUT = os.path.join(ROOT, "audio-src", "ep02", "raw")

# id, voice, speed, text
LINES = [
    ("l1", "af_bella", 0.88, "Bobo! Did you hear that?"),
    ("b1", "am_puck", 0.78, "What's inside?"),
    ("n1", "af_heart", 0.88, "But they never expected what was waiting on the other side..."),
    ("l2", "af_bella", 0.8, "Hello, little friend!"),
    ("n2", "af_heart", 0.88, "Sometimes, the smallest doors lead to the biggest adventures."),
    ("l3", "af_bella", 0.85, "Bobo... where does this map lead?"),
]

model_dir = sys.argv[1]
kokoro = Kokoro(os.path.join(model_dir, "kokoro-v1.0.onnx"), os.path.join(model_dir, "voices-v1.0.bin"))
os.makedirs(OUT, exist_ok=True)
for lid, voice, speed, text in LINES:
    samples, sr = kokoro.create(text, voice=voice, speed=speed, lang="en-us" if voice[0] == "a" else "en-gb")
    sf.write(os.path.join(OUT, f"{lid}.wav"), samples, sr, subtype="PCM_16")
    print(f"{lid} {voice} {len(samples) / sr:.2f}s")
