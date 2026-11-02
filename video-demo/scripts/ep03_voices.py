"""Generates the raw voice lines for Episode 3 with Kokoro, a free offline voice model.

Same setup as scripts/ep02_voices.py.
Usage: <venv>/Scripts/python scripts/ep03_voices.py <model-dir>
Output: audio-src/ep03/raw/<id>.wav
"""
import os
import sys

import soundfile as sf
from kokoro_onnx import Kokoro

ROOT = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..")
OUT = os.path.join(ROOT, "audio-src", "ep03", "raw")

# id, voice, speed, text
LINES = [
    ("l1", "af_bella", 0.95, "Bobo! I think this is where the map wants us to go!"),
    ("l2", "af_bella", 0.85, "Hello, little butterfly. Why are you sad?"),
    ("f1", "af_sky", 0.78, "I've lost all my colors!"),
    ("f2", "af_sky", 0.85, "The rainbow colors disappeared when the magical flower stopped glowing!"),
    ("l3", "af_bella", 0.85, "Let's help you!"),
    ("n1", "af_heart", 0.88, "A sparkling drop of morning dew..."),
    ("n2", "af_heart", 0.88, "A little act of kindness..."),
    ("n3", "af_heart", 0.88, "And a friendly smile."),
    ("f3", "af_sky", 0.82, "My colors are back! Thank you!"),
    ("l4", "af_bella", 0.85, "Kindness makes the world brighter!"),
    ("n4", "af_heart", 0.88, "But this little butterfly had one more secret..."),
]

model_dir = sys.argv[1]
kokoro = Kokoro(os.path.join(model_dir, "kokoro-v1.0.onnx"), os.path.join(model_dir, "voices-v1.0.bin"))
os.makedirs(OUT, exist_ok=True)
for lid, voice, speed, text in LINES:
    samples, sr = kokoro.create(text, voice=voice, speed=speed, lang="en-us")
    sf.write(os.path.join(OUT, f"{lid}.wav"), samples, sr, subtype="PCM_16")
    print(f"{lid} {voice} {len(samples) / sr:.2f}s")
