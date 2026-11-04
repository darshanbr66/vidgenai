from audio_kit import *

t = Soundtrack("ep06", duration=50.0, seed=606)

DRACO_PITCH = 1.2  # same as Episodes 4 and 5
CORALIE_PITCH = 1.16

# ---- timed moments (seconds); Episode.tsx uses the same numbers ----
PENDANT_T = 0.0      # the pendant flares blue on frame 0
MAP_T = 0.5          # the underwater map unfolds in the air
BUBBLE_T = 4.3       # the magic bubble wraps around the three friends
DIVE_T = 4.9         # the bubble drops away
SPLASH_T = 5.5       # into the water
SCENE2_T = 6.0
LAND_T = 9.6         # the bubble settles on the sand and splits into three
SCENE3_T = 14.0
CORALIE_T = 14.1     # Coralie swims in
FADE_T = 21.0        # the castle and reef start losing their colors
SCENE4_T = 24.0
BIG_BUBBLE_T = 25.2  # the giant bubble with the pearl is found
DRACO_FLAP_T = 26.3
BOBO_PUSH_T = 27.6
GLINT_T = 29.0       # the moon symbol on the pearl glows
SCENE5_T = 32.0
RAISE_T = 32.3       # Lumi holds up the pendant
BEAM_T = 33.3        # blue and gold light joins pendant and pearl
POP_T = 34.7         # the giant bubble vanishes
RISE_T = 35.1        # the pearl floats home
HOME_T = 37.0        # the pearl settles in the castle's shell
COLOR_T = 37.2       # the kingdom's colors come rushing back
SCENE6_T = 42.0
SHELL_T = 42.2       # Coralie gives Lumi the seashell
PROJECT_T = 44.5     # the shell shows a snowy mountain
END_T = 47.4


def blip(freq, vol=0.05, dur=0.09):
    """One small bubble: a quick upward chirp."""
    n = int(dur * SR)
    tt = np.arange(n) / SR
    f = freq * (1 + 1.6 * (tt / dur) ** 1.5)
    return (np.sin(2 * np.pi * np.cumsum(f) / SR) * np.sin(np.pi * tt / dur) ** 0.6 * np.exp(-tt * 18) * vol).astype(np.float32)


def bubbles(t0, dur, density=6, vol=0.03, lo=300, hi=900):
    for _ in range(int(dur * density)):
        add(t.sfx, blip(rng.uniform(lo, hi), vol * rng.uniform(0.4, 1.0), rng.uniform(0.05, 0.12)), t0 + rng.uniform(0, dur))


def deep_water(t0, t1, vol=0.012):
    """The soft hush of being underwater: low rolling noise that swells slowly."""
    d = t1 - t0
    x = noise_band(d, 60, 420, vol)
    tt = np.arange(len(x)) / SR
    sw = 0.65 + 0.35 * np.sin(2 * np.pi * tt / 5.3) * np.sin(2 * np.pi * tt / 3.1 + 1)
    edge = np.minimum(tt / 1.2, 1) * np.minimum((d - tt) / 1.0, 1)
    add(t.sfx, (x * sw * np.clip(edge, 0, 1)).astype(np.float32), t0)


def plunge(vol=0.12):
    """Diving into the sea: a soft splash that turns into a muffled whoosh."""
    n = int(1.4 * SR)
    tt = np.arange(n) / SR
    hi = noise_band(1.4, 800, 6000, 1.0) * np.exp(-tt * 9)
    lo = noise_band(1.4, 80, 600, 1.0) * np.exp(-tt * 2.2) * np.minimum(tt / 0.05, 1)
    return ((hi * 0.6 + lo) * vol).astype(np.float32)


def pop(vol=0.12):
    n = int(0.25 * SR)
    tt = np.arange(n) / SR
    f = 900 * np.exp(-tt * 25) + 200
    x = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-tt * 30)
    return ((x + noise_band(0.25, 1500, 6000, 0.6)[:n] * np.exp(-tt * 40)) * vol).astype(np.float32)


def boing(vol=0.05):
    n = int(0.5 * SR)
    tt = np.arange(n) / SR
    f = 220 + 300 * np.exp(-tt * 5) * (1 + 0.3 * np.sin(2 * np.pi * 11 * tt))
    return (np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-tt * 6) * np.minimum(tt / 0.005, 1) * vol).astype(np.float32)


def hum(f0, dur, vol=0.02):
    n = int(dur * SR)
    tt = np.arange(n) / SR
    x = sum(np.sin(2 * np.pi * f0 * k * tt + k) / k for k in (1, 2, 3)) * (0.7 + 0.3 * np.sin(2 * np.pi * 0.7 * tt))
    edge = np.minimum(tt / 0.5, 1) * np.minimum((dur - tt) / 0.6, 1)
    return (x * np.clip(edge, 0, 1) * vol).astype(np.float32)


def swell(dur, lo, hi, vol):
    x = noise_band(dur, lo, hi, vol)
    tt = np.arange(len(x)) / SR
    return (x * (tt / dur) ** 2).astype(np.float32)


def swish(vol=0.04):
    """A tail flick through the water."""
    x = whoosh(0.7, 1.0)
    b, a = signal.butter(2, 1400 / (SR / 2))
    return (signal.lfilter(b, a, x) * vol).astype(np.float32)


def crystal(t0, notes, step, vol):
    """Glassy pearl chimes: a music box note with a high shimmer partial."""
    for k, m in enumerate(notes):
        add(t.sfx, music_box(note_hz(m), 1.8, vol), t0 + k * step)
        add(t.sfx, ping(note_hz(m + 24), vol * 0.35, 5.0, 1.2), t0 + k * step + 0.01)


# ---- voices ----
t.line("l1", "draco", 0.9, pitch=DRACO_PITCH)
t.line("l2", "lumi", 3.15)
t.line("l3", "bobo", 10.6)
t.line("l4", "coralie", 14.6, pitch=CORALIE_PITCH)
t.line("l5", "lumi", 17.55)
t.line("l6", "coralie", 18.55, pitch=CORALIE_PITCH)
t.line("l7", "lumi", 29.5)
t.line("l8", "coralie", 39.5, pitch=CORALIE_PITCH)
t.line("l9", "coralie", 42.0, pitch=CORALIE_PITCH)
t.line("l10", "lumi", 44.75)
t.line("l11", "narrator", 45.95)

# ---- music: wonder, worry, the search, then the big colorful moment ----
run(t, HOPE, 0.0, SCENE2_T, 0.07)
run(t, JOY, SCENE2_T, SCENE3_T, 0.07)
run(t, HOPE, SCENE3_T, FADE_T, 0.05)
run(t, TENDER, FADE_T, SCENE5_T, 0.045)
run(t, TENDER, SCENE5_T, COLOR_T, 0.04)
run(t, JOY, COLOR_T, SCENE6_T, 0.095)
run(t, JOY, SCENE6_T, SCENE6_T + 2.4, 0.07)
run(t, HOPE, SCENE6_T + 2.4, END_T, 0.04)
ending_chord(t, END_T - 0.4)

# ---- ambience: night air above the water, then the deep sea ----
forest_air(t, vol=0.003)
crickets(t.sfx, 0.0, SPLASH_T, vol=0.005)
deep_water(SPLASH_T, 50.0, vol=0.016)
bubbles(SCENE2_T, 44.0, density=1.6, vol=0.018)

# ---- scene 1: the pendant, the map, the bubble, the dive ----
gliss(t.sfx, PENDANT_T, (72, 76, 79, 84, 88), step=0.06, vol=0.07)
add(t.sfx, boom(0.1), PENDANT_T)
sparkle(t.sfx, PENDANT_T, 1.3, density=16, vol=0.03)
add(t.sfx, swell(0.5, 300, 3000, 0.05), MAP_T - 0.4)
for k in range(5):
    add(t.sfx, water_drop(0.045), MAP_T + 0.1 + k * 0.3)
crystal(MAP_T + 0.4, (79, 84, 88), 0.2, 0.035)
add(t.sfx, blip(500, 0.08, 0.16), BUBBLE_T)
add(t.sfx, hum(98, 1.4, 0.016), BUBBLE_T)
gliss(t.sfx, BUBBLE_T + 0.05, (67, 72, 76, 79), step=0.07, vol=0.05)
add(t.sfx, whoosh(1.0, 0.12), DIVE_T)
add(t.sfx, plunge(0.16), SPLASH_T)
bubbles(SPLASH_T, 1.2, density=30, vol=0.04, lo=350, hi=1200)

# ---- scene 2: sinking down to the Underwater Kingdom ----
add(t.sfx, whoosh(2.4, 0.06), SCENE2_T)
crystal(SCENE2_T + 1.0, (72, 76, 79, 84, 88), 0.35, 0.04)
add(t.sfx, boing(0.05), LAND_T)
add(t.sfx, pop(0.06), LAND_T + 0.35)
bubbles(LAND_T + 0.35, 0.5, density=20, vol=0.03)
sparkle(t.sfx, LAND_T + 0.35, 0.8, density=12, vol=0.025)

# ---- scene 3: Coralie, and the colors fading ----
add(t.sfx, swish(0.05), CORALIE_T)
gliss(t.sfx, CORALIE_T + 0.4, (84, 88, 91, 96), step=0.08, vol=0.045)
sparkle(t.sfx, CORALIE_T + 0.4, 1.2, density=12, vol=0.025)
add(t.sfx, swish(0.035), CORALIE_T + 1.9)
for k, m in enumerate((76, 72, 69, 64, 60)):
    add(t.sfx, music_box(note_hz(m), 2.0, 0.04), FADE_T + k * 0.5)

# ---- scene 4: the sea garden, the giant bubble, the moon symbol ----
add(t.sfx, swish(0.04), SCENE4_T + 0.2)
add(t.sfx, hum(73, 3.0, 0.012), BIG_BUBBLE_T)
crystal(BIG_BUBBLE_T, (79, 83, 86), 0.14, 0.035)
add(t.sfx, flutter(0.9, rate=11, vol=0.045), DRACO_FLAP_T)
bubbles(DRACO_FLAP_T, 0.9, density=14, vol=0.025)
add(t.sfx, boing(0.06), DRACO_FLAP_T + 0.7)
add(t.sfx, boing(0.075), BOBO_PUSH_T + 0.45)
bubbles(BOBO_PUSH_T + 0.4, 0.5, density=12, vol=0.025)
add(t.sfx, ping(note_hz(96), 0.06), GLINT_T)
add(t.sfx, ping(note_hz(100), 0.04), GLINT_T + 0.12)

# ---- scene 5: pendant and pearl, the bubble vanishes, the kingdom's colors return ----
gliss(t.sfx, RAISE_T, (76, 79, 84, 88), step=0.08, vol=0.05)
add(t.sfx, hum(110, POP_T - BEAM_T + 0.2, 0.02), BEAM_T)
sparkle(t.sfx, BEAM_T, POP_T - BEAM_T, density=18, vol=0.03)
add(t.sfx, swell(POP_T - BEAM_T, 600, 6000, 0.05), BEAM_T)
add(t.sfx, pop(0.14), POP_T)
bubbles(POP_T, 0.8, density=30, vol=0.035, lo=500, hi=1500)
add(t.sfx, whoosh(2.0, 0.12), RISE_T)
crystal(RISE_T + 0.2, (67, 71, 74, 79, 83, 86), 0.3, 0.035)
add(t.sfx, boom(0.26), COLOR_T)
gliss(t.sfx, COLOR_T, (65, 69, 72, 77, 81, 84, 89, 93), step=0.07, vol=0.08)
sparkle(t.sfx, COLOR_T, 2.2, density=22, vol=0.04)
crystal(COLOR_T + 0.6, (84, 88, 91, 96, 91, 96, 100), 0.18, 0.03)
bubbles(COLOR_T + 0.3, 1.9, density=10, vol=0.025, lo=500, hi=1400)

# ---- scene 6: the seashell and the snowy mountain ----
add(t.sfx, ping(note_hz(88), 0.05), SHELL_T)
sparkle(t.sfx, SHELL_T, 0.8, density=10, vol=0.022)
add(t.sfx, swell(0.6, 300, 3000, 0.045), PROJECT_T - 0.5)
gliss(t.sfx, PROJECT_T - 0.15, (79, 84, 88, 91, 96), step=0.05, vol=0.04)
sparkle(t.sfx, PROJECT_T, 0.2, density=14, vol=0.02, lo=3500, hi=7000)
sparkle(t.sfx, PROJECT_T + 1.2, 1.0, density=10, vol=0.016, lo=3500, hi=7000)
sparkle(t.sfx, END_T, 1.5, density=10, vol=0.022)

t.finish()
