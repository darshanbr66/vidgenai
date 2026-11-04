"""Episode 14: Melody's three sung clips, made from her own voice with sing_kit (TD-PSOLA).
Writes audio-src/ep14/raw/sing1.wav (off-key, behind the fountain), sing2.wav (the off-key "demo"),
sing3.wav (the beautiful final note). They are placed with t.line(..., "melody", ...), which pitches them
up by Melody's 1.3 like her speech, so the notes here are written at the heard pitch / 1.3."""
import os, sys
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import numpy as np
from audio_kit import ROOT, SR
from sing_kit import load_syllable, sing, write_wav

RAW = os.path.join(ROOT, "audio-src", "ep14", "raw")
P = 1.3
la = load_syllable(os.path.join(RAW, "src_la.wav"))
ah = load_syllable(os.path.join(RAW, "src_ah.wav"))
S = [la, ah]
hz = lambda m: 440.0 * 2 ** ((m - 69) / 12) / P          # MIDI note at the heard pitch
A4, Cs5, D5, E5, Fs5, A5 = 69, 73, 74, 76, 78, 81

def slide(m0, m1, d, wob=0.0, wr=7.0):
    return lambda t: hz(m0 + (m1 - m0) * min(1, t / d)) * (1 + wob * np.sin(2 * np.pi * wr * t))

# 1. heard from behind the fountain: three wobbly "la"s, the last one droops
s1 = sing(S, [(hz(A4) * 1.05, 0.34, 0), (hz(Cs5) * 0.94, 0.34, 0), (slide(E5 + 0.6, E5 - 2.2, 0.9, 0.035, 6), 1.0, 0)], vib=(6.5, 0.03))
# 2. Melody's proud "demo" of the castle tune (A C# E F# E), every note off: sharp, flat, a voice crack, a sour slide
crack = lambda t: hz(E5 + 0.7) if t < 0.12 or t > 0.24 else hz(E5 + 12.4)
s2 = sing(S, [(hz(A4 + 0.8), 0.32, 0), (hz(Cs5 - 0.9), 0.32, 0), (crack, 0.42, 0), (slide(Fs5 - 1.1, Fs5 - 0.4, 0.3, 0.05, 9), 0.42, 0), (slide(E5 + 0.4, E5 - 3.5, 1.1, 0.06, 5), 1.35, 0)], vib=(7.5, 0.035))
# 3. the beautiful last note: a gentle "la" leading into a long, pure, steady "aah" with soft vibrato
s3 = sing(S, [(hz(Cs5), 0.42, 0), (slide(E5 - 0.05, E5, 0.2), 2.6, 1)], vib=(5.2, 0.011), gap=0.0, breath=0.02)
for name, x in (("sing1", s1), ("sing2", s2), ("sing3", s3)):
    write_wav(os.path.join(RAW, f"{name}.wav"), x)
    print(f"{name}: {len(x) / SR:.2f}s")
