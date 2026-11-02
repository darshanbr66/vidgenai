from audio_kit import *

t = Soundtrack("ep04", duration=45.0, seed=404)

DRACO_PITCH = 1.2

# ---- timed moments (seconds); Episode.tsx uses the same numbers ----
STAR_BURST_T = 0.0
STAR_LEAVE_T = 3.7
SCENE2_T = 6.0
SAD_T = 7.0
SCENE3_T = 13.0
FLAP1_T = 13.3
HOP_T = 14.7
HOP_LAND_T = 15.5
SCENE4_T = 21.0
BOBO_JUMP_T = 24.0
FLAP2_T = 24.9
RUN_T = 25.7
LIFT_T = 26.7
CLOUD_LAND_T = 28.0
SCENE5_T = 31.0
BREATH_T = 33.3
FLY_T = 34.2
SCENE6_T = 39.0
LAND6_T = 39.6
STAR2_T = 40.1
MAP_T = 40.6


def wingbeats(dur, rate=5.0, vol=0.06):
    """Little dragon wings: soft low whumps, one per flap."""
    x = noise_band(dur, 180, 1400, 1.0)
    tt = np.arange(len(x)) / SR
    beats = np.maximum(np.sin(2 * np.pi * rate * tt), 0) ** 3
    edge = np.minimum(tt / 0.05, 1) * np.minimum((dur - tt) / 0.1, 1)
    return (x * beats * np.clip(edge, 0, 1) * vol).astype(np.float32)


def glide(f0, f1, dur, vol, vib=0.0):
    n = int(dur * SR)
    tt = np.arange(n) / SR
    f = np.linspace(f0, f1, n) * (1 + vib * np.sin(2 * np.pi * 6 * tt))
    env = np.sin(np.pi * tt / dur) ** 1.2
    return (np.sin(2 * np.pi * np.cumsum(f) / SR) * env * vol).astype(np.float32)


def thump(vol=0.12):
    n = int(0.35 * SR)
    tt = np.arange(n) / SR
    f = 90 + 80 * np.exp(-tt * 18)
    return (np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-tt * 14) * np.minimum(tt / 0.004, 1) * vol).astype(np.float32)


def poof(vol=0.08):
    x = noise_band(0.6, 300, 2500, 1.0)
    tt = np.arange(len(x)) / SR
    return (x * np.exp(-tt * 7) * np.minimum(tt / 0.01, 1) * vol).astype(np.float32)


def mountain_wind(t0, t1, vol=0.012):
    d = t1 - t0
    x = noise_band(d, 120, 700, vol)
    tt = np.arange(len(x)) / SR
    swell = 0.6 + 0.4 * np.sin(2 * np.pi * tt / 5.3) * np.sin(2 * np.pi * tt / 3.1 + 1)
    edge = np.minimum(tt / 1.5, 1) * np.minimum((d - tt) / 1.0, 1)
    add(t.sfx, (x * swell * np.clip(edge, 0, 1)).astype(np.float32), t0)


# ---- voices ----
t.line("l1", "lumi", 0.6)
t.line("l2", "lumi", 8.3)
t.line("l3", "draco", 10.8, pitch=DRACO_PITCH)
t.line("l4", "draco", 16.1, pitch=DRACO_PITCH)
t.line("l5", "bobo", 18.9)
t.line("l6", "lumi", 21.3)
t.line("l7", "bobo", 23.4)
t.line("l8", "draco", 28.4, pitch=DRACO_PITCH)
t.line("l9", "lumi", 31.6)
t.line("l10", "draco", 36.0, pitch=DRACO_PITCH)
t.line("l11", "narrator", 40.8)

# ---- music ----
run(t, HOPE, 0.0, 6.0, 0.07)
run(t, TENDER, 6.0, 21.0, 0.05)
run(t, HOPE, 21.0, 31.0, 0.055)
run(t, TENDER, 31.0, 34.0, 0.045)
run(t, JOY, FLY_T, 40.0, 0.1)
ending_chord(t, 40.2)

# ---- ambience ----
forest_air(t, vol=0.006)
mountain_wind(SCENE2_T, 45.0)

# ---- scene 1: the star bursts, projects the mountain, flies away ----
gliss(t.sfx, STAR_BURST_T, (72, 76, 79, 84, 88), step=0.06, vol=0.07)
sparkle(t.sfx, STAR_BURST_T, 1.4, density=16, vol=0.035)
add(t.sfx, boom(0.12), STAR_BURST_T)
gliss(t.sfx, 1.2, (67, 72, 76, 79), step=0.1, vol=0.04)  # the mountain appears on the ground
add(t.sfx, whoosh(1.3, 0.12), STAR_LEAVE_T)
sparkle(t.sfx, STAR_LEAVE_T, 1.2, density=10, vol=0.025)
bird(t.sfx, 2.2)

# ---- scene 2: arrival, the little sad sound ----
add(t.sfx, whoosh(1.0, 0.06), SCENE2_T)
add(t.sfx, glide(760, 560, 0.45, 0.05, vib=0.02), SAD_T)
add(t.sfx, glide(640, 470, 0.6, 0.045, vib=0.02), SAD_T + 0.55)

# ---- scene 3: flapping, the tiny hop ----
add(t.sfx, wingbeats(1.3, rate=6.0, vol=0.07), FLAP1_T)
add(t.sfx, glide(400, 700, 0.3, 0.035), HOP_T)
add(t.sfx, thump(0.12), HOP_LAND_T)
add(t.sfx, glide(520, 380, 0.5, 0.03), HOP_LAND_T + 0.2)

# ---- scene 4: training ----
add(t.sfx, glide(220, 660, 0.35, 0.05, vib=0.06), BOBO_JUMP_T)  # boing
add(t.sfx, thump(0.1), BOBO_JUMP_T + 0.65)
add(t.sfx, wingbeats(0.8, rate=6.0, vol=0.06), FLAP2_T)
for k in range(6):
    add(t.sfx, thump(0.03), RUN_T + k * 0.17)  # little running feet
add(t.sfx, wingbeats(1.4, rate=7.0, vol=0.07), LIFT_T)
gliss(t.sfx, LIFT_T, (67, 71, 74), step=0.12, vol=0.04)
add(t.sfx, poof(0.08), CLOUD_LAND_T)
sparkle(t.sfx, CLOUD_LAND_T, 1.0, density=14, vol=0.03)

# ---- scene 5: the breeze and the first real flight ----
add(t.sfx, whoosh(2.2, 0.1), SCENE5_T)
add(t.sfx, noise_band(1.0, 300, 1200, 0.012) * np.hanning(SR), BREATH_T)  # a deep breath
add(t.sfx, boom(0.22), FLY_T)
add(t.sfx, whoosh(1.6, 0.18), FLY_T)
gliss(t.sfx, FLY_T, (65, 69, 72, 77, 81, 84, 89), step=0.07, vol=0.07)
sparkle(t.sfx, FLY_T, 2.0, density=18, vol=0.035)
add(t.sfx, wingbeats(4.6, rate=4.0, vol=0.05), FLY_T + 0.1)

# ---- scene 6: landing, the star returns with the castle map ----
add(t.sfx, wingbeats(0.6, rate=5.0, vol=0.05), SCENE6_T)
add(t.sfx, thump(0.09), LAND6_T)
gliss(t.sfx, STAR2_T, (76, 79, 84, 88), step=0.07, vol=0.06)
sparkle(t.sfx, STAR2_T, 1.2, density=14, vol=0.03)
add(t.sfx, boom(0.1), MAP_T)
sparkle(t.sfx, MAP_T, 1.5, density=10, vol=0.025)

t.finish()
