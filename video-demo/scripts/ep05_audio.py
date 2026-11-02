from audio_kit import *

t = Soundtrack("ep05", duration=50.0, seed=505)

DRACO_PITCH = 1.2  # same as Episode 4
MOONIA_PITCH = 1.1

# ---- timed moments (seconds); Episode.tsx uses the same numbers ----
MAP_BURST_T = 0.0
STAR_GLOW1_T = 0.8
PORTAL_T = 1.0
ENTER_T = 4.8
FLASH_T = 5.4
SCENE2_T = 6.0
ARRIVE_T = 9.2
SCENE3_T = 13.5
MOONIA_T = 13.8
DIM_T = 20.4
SCENE4_T = 22.5
FLOWER_T = 23.4
DRACO_REACH_T = 24.8
BOBO_PUSH_T = 26.2
GLINT_T = 27.5
SCENE5_T = 31.5
STAR_GLOW_T = 31.8
BEAM_T = 32.8
POP_T = 34.2
RISE_T = 34.6
ARRIVE_CROWN_T = 36.6
LIGHTUP_T = 36.8
SCENE6_T = 41.5
PENDANT_T = 41.8
PROJECT_T = 44.6
END_T = 47.2


def boing(vol=0.05):
    n = int(0.45 * SR)
    tt = np.arange(n) / SR
    f = 260 + 380 * np.exp(-tt * 5) * (1 + 0.25 * np.sin(2 * np.pi * 14 * tt))
    return (np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-tt * 6) * np.minimum(tt / 0.005, 1) * vol).astype(np.float32)


def pop(vol=0.12):
    n = int(0.25 * SR)
    tt = np.arange(n) / SR
    f = 900 * np.exp(-tt * 25) + 200
    x = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-tt * 30)
    return ((x + noise_band(0.25, 1500, 6000, 0.6)[:n] * np.exp(-tt * 40)) * vol).astype(np.float32)


def hum(f0, dur, vol=0.02):
    """The low magical hum of the portal."""
    n = int(dur * SR)
    tt = np.arange(n) / SR
    x = sum(np.sin(2 * np.pi * f0 * k * tt + k) / k for k in (1, 2, 3)) * (0.7 + 0.3 * np.sin(2 * np.pi * 0.7 * tt))
    edge = np.minimum(tt / 0.5, 1) * np.minimum((dur - tt) / 0.6, 1)
    return (x * np.clip(edge, 0, 1) * vol).astype(np.float32)


def swell(dur, lo, hi, vol):
    x = noise_band(dur, lo, hi, vol)
    tt = np.arange(len(x)) / SR
    return (x * (tt / dur) ** 2).astype(np.float32)


def sky_wind(t0, t1, vol=0.01):
    d = t1 - t0
    x = noise_band(d, 150, 900, vol)
    tt = np.arange(len(x)) / SR
    sw = 0.6 + 0.4 * np.sin(2 * np.pi * tt / 6.1) * np.sin(2 * np.pi * tt / 3.7 + 1)
    edge = np.minimum(tt / 1.5, 1) * np.minimum((d - tt) / 1.0, 1)
    add(t.sfx, (x * sw * np.clip(edge, 0, 1)).astype(np.float32), t0)


def chime_cascade(t0, notes, step, vol):
    for k, m in enumerate(notes):
        add(t.sfx, music_box(note_hz(m), 1.6, vol), t0 + k * step)


# ---- voices ----
t.line("l1", "draco", 1.5, pitch=DRACO_PITCH)
t.line("l2", "lumi", 3.8)
t.line("l3", "bobo", 10.9)
t.line("l4", "moonia", 14.5, pitch=MOONIA_PITCH)
t.line("l5", "lumi", 17.3)
t.line("l6", "moonia", 18.4, pitch=MOONIA_PITCH)
t.line("l7", "lumi", 28.2)
t.line("l8", "moonia", 39.4, pitch=MOONIA_PITCH)
t.line("l9", "moonia", 42.0, pitch=MOONIA_PITCH)
t.line("l10", "lumi", 45.0)
t.line("l11", "narrator", 46.5)

# ---- music: wonder, then worry, then the big bright moment ----
run(t, HOPE, 0.0, SCENE2_T, 0.07)
run(t, JOY, SCENE2_T, SCENE3_T, 0.075)
run(t, TENDER, SCENE3_T, SCENE4_T, 0.05)
run(t, HOPE, SCENE4_T, SCENE5_T, 0.05)
run(t, TENDER, SCENE5_T, LIGHTUP_T, 0.045)
run(t, JOY, LIGHTUP_T, SCENE6_T + 2.5, 0.1)
run(t, HOPE, SCENE6_T + 2.5, END_T, 0.06)
ending_chord(t, END_T - 0.4)

# ---- ambience ----
forest_air(t, vol=0.004)
sky_wind(SCENE2_T, 50.0, vol=0.011)
crickets(t.sfx, 0.0, SCENE2_T, vol=0.006)

# ---- scene 1: the map glows, the star opens a portal, everyone jumps in ----
gliss(t.sfx, MAP_BURST_T, (72, 76, 79, 84, 88), step=0.06, vol=0.07)
sparkle(t.sfx, MAP_BURST_T, 1.4, density=16, vol=0.035)
add(t.sfx, boom(0.1), MAP_BURST_T)
gliss(t.sfx, STAR_GLOW1_T, (79, 84, 88, 91), step=0.05, vol=0.05)
add(t.sfx, whoosh(1.0, 0.1), PORTAL_T)
add(t.sfx, boom(0.16), PORTAL_T + 0.3)
add(t.sfx, hum(55, ENTER_T + 1.2 - PORTAL_T, 0.022), PORTAL_T + 0.2)
sparkle(t.sfx, PORTAL_T + 0.3, 3.5, density=8, vol=0.02)
add(t.sfx, swell(0.7, 400, 4000, 0.08), ENTER_T)
add(t.sfx, whoosh(1.4, 0.2), FLASH_T - 0.2)
gliss(t.sfx, FLASH_T, (67, 72, 76, 79, 84, 88, 91), step=0.05, vol=0.07)

# ---- scene 2: flying out over the clouds to the Moon Kingdom ----
add(t.sfx, whoosh(2.4, 0.12), SCENE2_T)
chime_cascade(SCENE2_T + 0.8, (72, 76, 79, 84), 0.35, 0.05)
add(t.sfx, boom(0.08), ARRIVE_T)
sparkle(t.sfx, ARRIVE_T, 1.2, density=14, vol=0.03)

# ---- scene 3: Moonia appears; the lights grow dim ----
gliss(t.sfx, MOONIA_T, (84, 88, 91, 96), step=0.08, vol=0.05)
sparkle(t.sfx, MOONIA_T, 1.5, density=12, vol=0.03)
for k, m in enumerate((76, 72, 69, 64)):
    add(t.sfx, music_box(note_hz(m), 1.8, 0.045), DIM_T + k * 0.45)

# ---- scene 4: the garden, the flower opens, the bubble won't budge ----
add(t.sfx, whoosh(1.4, 0.1), SCENE4_T)
gliss(t.sfx, FLOWER_T, (67, 71, 74, 79, 83), step=0.12, vol=0.045)
sparkle(t.sfx, FLOWER_T + 0.3, 1.2, density=10, vol=0.025)
add(t.sfx, flutter(0.6, rate=16, vol=0.05), DRACO_REACH_T - 0.4)
add(t.sfx, boing(0.06), DRACO_REACH_T + 0.25)
add(t.sfx, boing(0.07), BOBO_PUSH_T + 0.35)
add(t.sfx, ping(note_hz(96), 0.06), GLINT_T)
add(t.sfx, ping(note_hz(100), 0.04), GLINT_T + 0.12)

# ---- scene 5: the golden star, the beam, the crystal flies home, the kingdom lights up ----
gliss(t.sfx, STAR_GLOW_T, (76, 79, 84, 88), step=0.08, vol=0.05)
add(t.sfx, hum(110, POP_T - BEAM_T + 0.2, 0.02), BEAM_T)
sparkle(t.sfx, BEAM_T, POP_T - BEAM_T, density=18, vol=0.03)
add(t.sfx, swell(POP_T - BEAM_T, 600, 6000, 0.05), BEAM_T)
add(t.sfx, pop(0.14), POP_T)
add(t.sfx, whoosh(2.0, 0.16), RISE_T)
gliss(t.sfx, RISE_T, (67, 71, 74, 79, 83, 86), step=0.3, vol=0.04)
add(t.sfx, boom(0.26), LIGHTUP_T)
gliss(t.sfx, LIGHTUP_T, (65, 69, 72, 77, 81, 84, 89, 93), step=0.07, vol=0.08)
sparkle(t.sfx, LIGHTUP_T, 3.0, density=22, vol=0.04)
chime_cascade(LIGHTUP_T + 0.6, (84, 88, 91, 96, 91, 96, 100), 0.18, 0.04)

# ---- scene 6: the pendant and the ocean hologram ----
add(t.sfx, ping(note_hz(88), 0.05), PENDANT_T)
sparkle(t.sfx, PENDANT_T, 0.8, density=10, vol=0.025)
add(t.sfx, swell(0.6, 300, 3000, 0.05), PROJECT_T - 0.5)
gliss(t.sfx, PROJECT_T, (72, 76, 79, 83, 86), step=0.07, vol=0.06)
for k in range(5):
    add(t.sfx, water_drop(0.05), PROJECT_T + 0.3 + k * 0.38)
sparkle(t.sfx, END_T, 1.5, density=10, vol=0.025)

t.finish()
