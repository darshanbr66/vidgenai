"""Builds the full soundtrack for Episode 2, "The Mysterious Door in the Forest".

Voices (from ep02_voices.py) are trimmed, pitched per character and placed on the
timeline; music and sound effects are synthesized here. Writes:
  public/ep02/audio.wav      - final stereo mix
  src/ep02/timeline.json     - where each line landed + per-frame mouth levels
"""
import json
import os
import wave

import numpy as np
from scipy import signal

ROOT = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..")
SR = 44100
FPS = 30
DURATION = 45.0
N = int(SR * DURATION)
rng = np.random.default_rng(22)

# id, speaker, pitch factor, start (s)
LINES = [
    ("l1", "lumi", 1.14, 2.25),
    ("b1", "bobo", 1.18, 9.4),
    ("n1", "narrator", 1.0, 16.7),
    ("l2", "lumi", 1.14, 26.3),
    ("n2", "narrator", 1.0, 33.5),
    ("l3", "lumi", 1.14, 40.8),
]
KNOCKS = (0.2, 0.9, 1.6)
TOUCH_T = 8.4  # Bobo touches the door
HANDLE_T = 14.1  # the handle clicks
OPEN_T = 15.0  # the door swings open
REVEAL_T = 21.0  # the tiny world appears
PEEK_T = 24.0  # the little creature peeks out
JUMP_T = 28.0  # it jumps, leaving stars
KEY_T = 33.0  # Lumi receives the key
GLOW_T = 39.5  # the key lights up
MAP_T = 40.0  # the map opens in the air
END_T = 43.1  # the closing text


# ---------- helpers ----------
def read_wav(path):
    with wave.open(path) as w:
        sr = w.getframerate()
        x = np.frombuffer(w.readframes(w.getnframes()), dtype=np.int16).astype(np.float32) / 32768
    return signal.resample_poly(x, SR, sr)


def trim(x, edge=0.03):
    env = np.convolve(np.abs(x), np.ones(441) / 441, mode="same")
    idx = np.flatnonzero(env > 0.008)
    return x[max(idx[0] - int(edge * SR), 0) : idx[-1] + int(edge * SR)]


def pitch_up(x, factor):
    """Raise pitch (and tempo) by resampling."""
    if factor == 1.0:
        return x
    return signal.resample(x, int(len(x) / factor)).astype(np.float32)


def reverb(x, seconds=1.4, mix=0.15):
    n = int(seconds * SR)
    ir = rng.standard_normal(n).astype(np.float32) * np.exp(-np.linspace(0, 7, n)).astype(np.float32)
    b, a = signal.butter(2, 4000 / (SR / 2))
    ir = signal.lfilter(b, a, ir)
    ir /= np.sqrt(np.sum(ir**2))
    wet = signal.fftconvolve(x, ir)[: len(x)]
    return x * (1 - mix) + wet * mix


def add(track, x, t):
    i = int(t * SR)
    if i >= len(track):
        return
    x = x[: len(track) - i]
    track[i : i + len(x)] += x


def note_hz(midi):
    return 440.0 * 2 ** ((midi - 69) / 12)


# ---------- instruments ----------
def music_box(freq, dur=2.2, vol=0.18):
    n = int(dur * SR)
    t = np.arange(n) / SR
    partials = [(1, 1.0), (2, 0.35), (3, 0.12), (4.2, 0.08), (5.4, 0.04)]
    x = sum(a * np.sin(2 * np.pi * freq * m * t) * np.exp(-t * (2.4 + m * 0.9)) for m, a in partials)
    return (x * np.minimum(t / 0.003, 1) * vol).astype(np.float32)


def pad(freqs, dur, vol=0.035):
    n = int(dur * SR)
    t = np.arange(n) / SR
    x = np.zeros(n, dtype=np.float32)
    for f in freqs:
        for d in (-0.003, 0, 0.003):
            x += np.sin(2 * np.pi * f * (1 + d) * t + rng.uniform(0, 6.28))
    shape = np.minimum(t / 1.0, 1) * np.minimum((dur - t) / 1.0, 1)
    return (x * np.clip(shape, 0, 1) * vol / len(freqs)).astype(np.float32)


def bass(freq, dur=3.0, vol=0.1):
    n = int(dur * SR)
    t = np.arange(n) / SR
    x = np.sin(2 * np.pi * freq * t) + 0.3 * np.sin(4 * np.pi * freq * t)
    return (x * np.minimum(t / 0.02, 1) * np.exp(-t * 1.2) * vol).astype(np.float32)


def ping(freq, vol=0.06, decay=9.0, dur=0.6):
    n = int(dur * SR)
    t = np.arange(n) / SR
    x = np.sin(2 * np.pi * freq * t) + 0.25 * np.sin(2 * np.pi * freq * 2.76 * t)
    return (x * np.minimum(t / 0.002, 1) * np.exp(-t * decay) * vol).astype(np.float32)


def sparkle(track, t0, dur, density=14, vol=0.04, lo=2200, hi=5200):
    for _ in range(int(dur * density)):
        add(track, ping(rng.uniform(lo, hi), vol * rng.uniform(0.4, 1.0)), t0 + rng.uniform(0, dur))


def gliss(track, t0, notes, step=0.07, vol=0.07, decay=3.0):
    for i, m in enumerate(notes):
        add(track, ping(note_hz(m), vol, decay, 2.0), t0 + i * step)


def noise_band(dur, lo, hi, vol):
    n = int(dur * SR)
    b, a = signal.butter(2, [lo / (SR / 2), hi / (SR / 2)], btype="band")
    return (signal.lfilter(b, a, rng.standard_normal(n)) * vol).astype(np.float32)


def whoosh(dur=1.2, vol=0.2):
    n = int(dur * SR)
    noise = rng.standard_normal(n)
    out = np.zeros(n)
    hop = 512
    for i in range(0, n, hop):
        fc = 400 + 3500 * i / n
        b, a = signal.butter(2, [fc * 0.6 / (SR / 2), fc * 1.4 / (SR / 2)], btype="band")
        out[i : i + hop] = signal.lfilter(b, a, noise[i : i + hop])
    return (out * np.sin(np.pi * np.linspace(0, 1, n)) ** 1.5 * vol).astype(np.float32)


def knock(vol=0.42):
    """A knuckle on hollow wood: a pitched thump, a resonant body and a click."""
    n = int(0.42 * SR)
    t = np.arange(n) / SR
    f = 95 + 150 * np.exp(-t * 55)
    thump = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t * 15)
    wood = sum(a * np.sin(2 * np.pi * h * t) * np.exp(-t * d) for h, a, d in [(310, 0.5, 30), (505, 0.3, 42), (830, 0.14, 60)])
    b, a = signal.butter(2, [900 / (SR / 2), 4200 / (SR / 2)], btype="band")
    click = signal.lfilter(b, a, rng.standard_normal(n)) * np.exp(-t * 260) * 0.8
    return ((thump + wood + click) * vol).astype(np.float32)


def click(vol=0.3):
    n = int(0.09 * SR)
    t = np.arange(n) / SR
    x = np.sin(2 * np.pi * 2400 * t) * np.exp(-t * 90) + 0.6 * np.sin(2 * np.pi * 1250 * t) * np.exp(-t * 70)
    return (x * vol).astype(np.float32)


def creak(dur=0.9, vol=0.06):
    """A soft wooden door swinging: rapid little ticks rising in pitch."""
    n = int(dur * SR)
    t = np.arange(n) / SR
    f = 170 + 130 * t / dur
    tone = signal.sawtooth(2 * np.pi * np.cumsum(f) / SR)
    b, a = signal.butter(2, [500 / (SR / 2), 2400 / (SR / 2)], btype="band")
    return (signal.lfilter(b, a, tone) * np.sin(np.pi * t / dur) * vol).astype(np.float32)


def chirp(start, end, dur=0.14, vol=0.1):
    """A friendly little squeak from the creature."""
    n = int(dur * SR)
    t = np.arange(n) / SR
    f = np.linspace(start, end, n)
    x = np.sin(2 * np.pi * np.cumsum(f) / SR) + 0.2 * np.sin(4 * np.pi * np.cumsum(f) / SR)
    return (x * np.sin(np.pi * t / dur) ** 0.7 * vol).astype(np.float32)


def crickets(track, t0, t1, vol=0.012):
    t = t0
    while t < t1:
        n = int(0.12 * SR)
        tt = np.arange(n) / SR
        c = np.sin(2 * np.pi * 4600 * tt) * (np.sin(2 * np.pi * 32 * tt) > 0.2) * np.sin(np.pi * tt / 0.12)
        for k in range(rng.integers(2, 4)):
            add(track, (c * vol).astype(np.float32), t + k * 0.16)
        t += rng.uniform(0.7, 1.4)


def owl(track, t0, vol=0.035):
    for i, (dur, f) in enumerate([(0.3, 340), (0.55, 320)]):
        n = int(dur * SR)
        t = np.arange(n) / SR
        x = np.sin(2 * np.pi * (f + 14 * np.sin(np.pi * t / dur)) * t) * np.sin(np.pi * t / dur) ** 2
        add(track, (x * vol).astype(np.float32), t0 + i * 0.42)


# ---------- voices ----------
voice = {s: np.zeros(N, dtype=np.float32) for s in ("narrator", "lumi", "bobo")}
placed = []
for lid, speaker, factor, start in LINES:
    x = pitch_up(trim(read_wav(os.path.join(ROOT, "audio-src", "ep02", "raw", f"{lid}.wav"))), factor)
    x = x / (np.max(np.abs(x)) + 1e-9) * 0.85
    add(voice[speaker], x, start)
    end = start + len(x) / SR
    placed.append({"id": lid, "speaker": speaker, "start": round(start, 3), "end": round(end, 3)})
    print(f"{lid:3} {speaker:9} {start:6.2f} -> {end:6.2f}  ({end - start:.2f}s)")

voice_mix = reverb(sum(voice.values()), 0.9, 0.1)

# ---------- music: a hushed minor mystery that opens into warm major for the tiny world ----------
music = np.zeros(N, dtype=np.float32)
BEAT = 60 / 76
BAR = BEAT * 4
ARP = [0, 2, 1, 3, 2, 4, 3, 1]


def play_bar(t0, chord, vol, arp=True):
    add(music, pad([note_hz(m) for m in chord], BAR + 1.0), t0)
    add(music, bass(note_hz(chord[0] - 12)), t0)
    if not arp:
        return
    tones = [chord[0] + 12, chord[1] + 12, chord[2] + 12, chord[0] + 24, chord[1] + 24]
    for k, step in enumerate(ARP):
        add(music, music_box(note_hz(tones[step]), vol=vol), t0 + k * BEAT / 2)


MYSTERY = [[50, 53, 57], [46, 50, 53], [43, 46, 50], [45, 49, 52]]  # Dm Bb Gm A
WONDER = [[53, 57, 60], [48, 52, 55], [50, 53, 57], [46, 50, 53]]  # F C Dm Bb
b = 0
t = 2.6  # the knocks play alone over ambience first
while t < OPEN_T - 0.3:
    play_bar(t, MYSTERY[b % 4], 0.055 + 0.03 * (t / OPEN_T))
    t += BAR
    b += 1
# a held, rising shimmer across the door opening
add(music, pad([note_hz(m) for m in (53, 57, 60, 65)], REVEAL_T - OPEN_T + 1.0, 0.05), OPEN_T - 0.3)
for i, m in enumerate((65, 69, 72, 77, 81, 84)):
    add(music, music_box(note_hz(m), dur=3.0, vol=0.05 + i * 0.006), OPEN_T + 1.4 + i * 0.75)
t = REVEAL_T
b = 0
while t < GLOW_T - 0.4:
    play_bar(t, WONDER[b % 4], 0.1)
    t += BAR
    b += 1
# back to the unanswered question; ends on a suspended chord so it feels unfinished
add(music, pad([note_hz(m) for m in (50, 55, 57, 62)], DURATION - GLOW_T + 0.4, 0.05), GLOW_T - 0.4)
for i, m in enumerate((62, 67, 69, 74, 79, 81)):
    add(music, music_box(note_hz(m), dur=2.6, vol=0.075), GLOW_T + i * 0.42)
for m in (62, 67, 69, 74):
    add(music, music_box(note_hz(m), dur=3.0, vol=0.08), END_T)
music = reverb(music, 2.2, 0.3)

# ---------- sound effects ----------
sfx = np.zeros(N, dtype=np.float32)
for k in KNOCKS:
    add(sfx, knock(), k)
crickets(sfx, 0.0, 21.0)
crickets(sfx, 31.0, 45.0, vol=0.009)
add(sfx, noise_band(21.0, 200, 900, 0.009) * np.sin(np.pi * np.linspace(0, 1, int(21.0 * SR))) ** 0.5, 0.0)
add(sfx, noise_band(14.0, 200, 900, 0.008) * np.sin(np.pi * np.linspace(0, 1, int(14.0 * SR))) ** 0.5, 31.0)
owl(sfx, 4.6)
owl(sfx, 32.0, 0.02)
sparkle(sfx, 4.2, 1.6, density=7, vol=0.03)  # the hidden door twinkles
add(sfx, ping(note_hz(84), 0.09, 4.0, 1.5), TOUCH_T)  # Bobo's touch
add(sfx, ping(note_hz(88), 0.07, 4.0, 1.5), TOUCH_T + 0.12)
gliss(sfx, 10.6, (69, 72, 74, 76, 79, 81, 84, 86), step=0.28, vol=0.045)  # patterns brighten
add(sfx, click(), HANDLE_T)
add(sfx, click(0.2), HANDLE_T + 0.28)
add(sfx, creak(), OPEN_T)
gliss(sfx, OPEN_T, (72, 76, 79, 84, 88, 91, 96, 100), step=0.08, vol=0.085)  # magical sparkle
sparkle(sfx, OPEN_T, 1.6, density=34, vol=0.05)
add(sfx, whoosh(1.2, 0.09), OPEN_T)
sparkle(sfx, 17.0, 4.0, density=6, vol=0.022)
add(sfx, whoosh(1.2, 0.14), REVEAL_T - 0.7)
gliss(sfx, REVEAL_T, (77, 81, 84, 89, 93), step=0.1, vol=0.05)
sparkle(sfx, REVEAL_T, 3.0, density=8, vol=0.025)
add(sfx, chirp(1100, 1900), PEEK_T)
for i, (a, z) in enumerate([(1300, 2100), (2100, 1500), (1400, 2300)]):  # waving hello
    add(sfx, chirp(a, z, vol=0.09), 25.0 + i * 0.2)
for i in range(3):  # three happy jumps
    add(sfx, chirp(900 + i * 200, 2600 + i * 300, 0.2, 0.09), JUMP_T + i * 0.95)
sparkle(sfx, JUMP_T, 3.0, density=20, vol=0.04)
add(sfx, whoosh(0.9, 0.08), 31.0)
gliss(sfx, KEY_T, (76, 79, 84, 88), step=0.1, vol=0.09, decay=2.5)  # the key lands in Lumi's hand
sparkle(sfx, KEY_T, 0.9, density=18, vol=0.04)
add(sfx, chirp(1200, 2200, 0.16, 0.08), 37.6)  # it hops onto Bobo's head
add(sfx, ping(note_hz(74), 0.07, 2.0, 2.0), GLOW_T)
add(sfx, whoosh(1.0, 0.14), MAP_T - 0.2)
gliss(sfx, MAP_T, (74, 79, 81, 86, 91, 93), step=0.09, vol=0.07)
sparkle(sfx, MAP_T, 1.5, density=18, vol=0.035)
sparkle(sfx, END_T, 1.4, density=9, vol=0.025)

# ---------- mix with ducking so dialogue always sits on top ----------
venv = np.abs(voice_mix)
b_, a_ = signal.butter(1, 6 / (SR / 2))
venv = signal.filtfilt(b_, a_, venv)
duck = 1 - 0.6 * np.clip(venv / 0.04, 0, 1)
mix = voice_mix + music * duck * 0.9 + sfx * (0.55 + 0.45 * duck)
fade = np.ones(N)
fade[-int(0.8 * SR) :] = np.linspace(1, 0, int(0.8 * SR))
mix *= fade
gain = 0.89 / np.max(np.abs(mix))
mix = mix * gain

side = signal.lfilter([1, -0.9], [1], music + sfx) * 0.04 * gain
stereo = np.clip(np.stack([mix + side, mix - side], axis=1), -1, 1)

os.makedirs(os.path.join(ROOT, "public", "ep02"), exist_ok=True)
with wave.open(os.path.join(ROOT, "public", "ep02", "audio.wav"), "wb") as w:
    w.setnchannels(2)
    w.setsampwidth(2)
    w.setframerate(SR)
    w.writeframes((stereo * 32767).astype(np.int16).tobytes())

# ---------- lip sync: per-frame mouth openness per speaker ----------
mouth = {}
spf = SR // FPS
frames = int(DURATION * FPS)
for s, x in voice.items():
    rms = np.array([np.sqrt(np.mean(x[i * spf : (i + 1) * spf] ** 2)) for i in range(frames)])
    mouth[s] = [round(float(v), 2) for v in np.clip(rms / 0.12, 0, 1) ** 0.7]

os.makedirs(os.path.join(ROOT, "src", "ep02"), exist_ok=True)
with open(os.path.join(ROOT, "src", "ep02", "timeline.json"), "w") as f:
    json.dump({"lines": placed, "mouth": mouth}, f)

# ---------- level check: dialogue must clearly beat the music underneath it ----------
speech = venv > 0.02
bed = (music * duck * 0.9 + sfx * (0.55 + 0.45 * duck)) * gain
print(f"dialogue vs bed while speaking: {20 * np.log10(np.sqrt(np.mean((voice_mix[speech] * gain) ** 2)) / np.sqrt(np.mean(bed[speech] ** 2))):.1f} dB")
print(f"peak {np.max(np.abs(stereo)):.2f}")
print("wrote public/ep02/audio.wav and src/ep02/timeline.json")
