from audio_kit import *

t = Soundtrack("ep07", duration=50.0, seed=707)

DRACO_PITCH = 1.2  # same as Episodes 4 to 6
NIVA_PITCH = 1.2

# ---- timed moments (seconds); Episode.tsx uses the same numbers ----
SHELL_T = 0.0        # the seashell flares icy blue on frame 0
HOLO_T = 0.4         # the snowy mountain appears in the air
PATH_T = 4.4         # a glowing snowy pathway unrolls toward it
STEP_T = 4.9         # the friends float up the path
FLASH_T = 5.5        # a burst of snow carries them away
SCENE2_T = 6.0
LAND_T = 7.3         # they land in the snow; Bobo gets his scarf
CRY_T = 12.4         # a tiny cry behind a snowy tree
SCENE3_T = 14.0
FADE_T = 19.8        # the castle dulls and the northern lights fade
SCENE4_T = 23.5
BREATH_T = 25.2      # Draco's warm breath on the ice
PUSH_T = 26.8        # Bobo pushes the ice block
SHELL_GLOW_T = 28.4  # the seashell starts to glow
PROJECT_T = 30.9     # the shell paints northern lights onto the ice
SCENE5_T = 32.0
RAISE_T = 32.3       # Lumi holds the shell to the ice
LIGHT_T = 33.2       # blue, purple and golden light wraps the crystal
MELT_T = 34.0        # the ice melts into sparkling drops
FREE_T = 35.5
RISE_T = 35.7        # the crystal rises
HOME_T = 37.6        # it settles on top of the castle
AURORA_T = 37.8      # a wave of northern lights sweeps the kingdom
SCENE6_T = 42.0
GIVE_T = 42.2        # Niva gives Lumi the snowflake pendant
JUNGLE_T = 44.7      # the snowflake shows a jungle
END_T = 47.4


def crunch(vol=0.05):
    """One footstep in fresh snow: a short, crisp, filtered crackle."""
    n = int(0.16 * SR)
    tt = np.arange(n) / SR
    x = noise_band(0.16, 900, 5000, 1.0) * (0.5 + 0.5 * (rng.random(n) > 0.6))
    return (x * np.exp(-tt * 28) * np.minimum(tt / 0.004, 1) * vol).astype(np.float32)


def steps(t0, t1, every=0.32, vol=0.04):
    s = t0
    while s < t1:
        add(t.sfx, crunch(vol * rng.uniform(0.7, 1.0)), s)
        s += every * rng.uniform(0.9, 1.1)


def wind(t0, t1, vol=0.014):
    """Soft winter wind: airy noise that rises and falls."""
    d = t1 - t0
    x = noise_band(d, 250, 2200, vol)
    tt = np.arange(len(x)) / SR
    sw = 0.5 + 0.5 * np.sin(2 * np.pi * tt / 6.7) * np.sin(2 * np.pi * tt / 4.3 + 1.2)
    edge = np.minimum(tt / 1.5, 1) * np.minimum((d - tt) / 1.0, 1)
    add(t.sfx, (x * (0.4 + 0.6 * sw) * np.clip(edge, 0, 1)).astype(np.float32), t0)


def whimper(vol=0.05):
    """A tiny sad cry from a little fox: two soft falling squeaks."""
    out = []
    for f0, f1, dur in ((1100, 820, 0.22), (1000, 700, 0.32)):
        n = int(dur * SR)
        tt = np.arange(n) / SR
        f = np.linspace(f0, f1, n) * (1 + 0.02 * np.sin(2 * np.pi * 9 * tt))
        x = np.sin(2 * np.pi * np.cumsum(f) / SR) + 0.3 * np.sin(4 * np.pi * np.cumsum(f) / SR)
        out.append(x * np.sin(np.pi * tt / dur) ** 0.8)
        out.append(np.zeros(int(0.08 * SR)))
    return (np.concatenate(out) * vol).astype(np.float32)


def ice_crack(vol=0.08):
    """A gentle crackle of ice: a few sharp ticks over a short low creak."""
    n = int(0.5 * SR)
    tt = np.arange(n) / SR
    x = np.zeros(n)
    for k in range(7):
        i = int(rng.uniform(0, 0.35) * SR)
        m = int(0.02 * SR)
        x[i : i + m] += rng.standard_normal(m) * np.exp(-np.arange(m) / (0.003 * SR))
    creak = np.sin(2 * np.pi * np.cumsum(180 + 60 * np.sin(2 * np.pi * 7 * tt)) / SR) * np.exp(-tt * 6) * 0.3
    return ((x + creak) * vol).astype(np.float32)


def warm_breath(dur, vol=0.05):
    """Draco's warm breath: a soft low whoosh with a little sparkle on top."""
    x = noise_band(dur, 120, 1200, 1.0)
    tt = np.arange(len(x)) / SR
    shape = np.sin(np.pi * tt / dur) ** 1.2
    return (x * shape * vol).astype(np.float32)


def shimmer(dur, notes, vol=0.02):
    """The shimmering hum of the northern lights: a high detuned pad that swells."""
    n = int(dur * SR)
    tt = np.arange(n) / SR
    x = np.zeros(n)
    for m in notes:
        f = note_hz(m)
        for d in (-0.004, 0.0, 0.004):
            x += np.sin(2 * np.pi * f * (1 + d) * tt + rng.uniform(0, 6.28))
    x *= 0.6 + 0.4 * np.sin(2 * np.pi * 0.35 * tt)
    edge = np.minimum(tt / 0.8, 1) * np.minimum((dur - tt) / 1.2, 1)
    return (x * np.clip(edge, 0, 1) * vol / len(notes)).astype(np.float32)


def swell(dur, lo, hi, vol):
    x = noise_band(dur, lo, hi, vol)
    tt = np.arange(len(x)) / SR
    return (x * (tt / dur) ** 2).astype(np.float32)


def hum(f0, dur, vol=0.02):
    n = int(dur * SR)
    tt = np.arange(n) / SR
    x = sum(np.sin(2 * np.pi * f0 * k * tt + k) / k for k in (1, 2, 3)) * (0.7 + 0.3 * np.sin(2 * np.pi * 0.7 * tt))
    edge = np.minimum(tt / 0.5, 1) * np.minimum((dur - tt) / 0.6, 1)
    return (x * np.clip(edge, 0, 1) * vol).astype(np.float32)


def crystal(t0, notes, step, vol):
    for k, m in enumerate(notes):
        add(t.sfx, music_box(note_hz(m), 1.8, vol), t0 + k * step)
        add(t.sfx, ping(note_hz(m + 24), vol * 0.35, 5.0, 1.2), t0 + k * step + 0.01)


# ---- voices ----
t.line("l1", "draco", 0.9, pitch=DRACO_PITCH)
t.line("l2", "lumi", 3.15)
t.line("l3", "bobo", 10.2)
t.line("l4", "lumi", 15.6)
t.line("l5", "niva", 17.55, pitch=NIVA_PITCH)
t.line("l6", "draco", 22.2, pitch=DRACO_PITCH)
t.line("l7", "lumi", 28.7)
t.line("l8", "niva", 38.6, pitch=NIVA_PITCH)
t.line("l9", "lumi", 40.2)
t.line("l10", "niva", 41.95, pitch=NIVA_PITCH)
t.line("l11", "draco", 44.65, pitch=DRACO_PITCH)
t.line("l12", "narrator", 46.15)

# ---- music: wonder, worry, the search, then the northern lights return ----
run(t, HOPE, 0.0, SCENE2_T, 0.065)
run(t, JOY, SCENE2_T, 12.0, 0.065)
run(t, TENDER, 12.0, FADE_T, 0.045)
run(t, TENDER, FADE_T, SCENE5_T, 0.04)
run(t, HOPE, SCENE5_T, AURORA_T, 0.04)
run(t, JOY, AURORA_T, SCENE6_T, 0.085)
run(t, JOY, SCENE6_T, SCENE6_T + 2.4, 0.06)
run(t, HOPE, SCENE6_T + 2.4, END_T, 0.04)
ending_chord(t, END_T - 0.4)

# ---- ambience ----
deep = noise_band(SCENE2_T, 60, 420, 0.012)  # still underwater at the start
add(t.sfx, (deep * np.minimum(np.linspace(SCENE2_T, 0, len(deep)) / 0.6, 1)).astype(np.float32), 0.0)
wind(SCENE2_T - 0.3, 50.0, vol=0.014)
add(t.sfx, shimmer(FADE_T + 1.5 - SCENE2_T, (88, 91, 95), 0.012), SCENE2_T)
add(t.sfx, shimmer(50.0 - AURORA_T, (84, 88, 91, 95), 0.016), AURORA_T)

# ---- scene 1: the shell, the snowy mountain, the path ----
gliss(t.sfx, SHELL_T, (76, 79, 84, 88, 91), step=0.06, vol=0.07)
add(t.sfx, boom(0.1), SHELL_T)
sparkle(t.sfx, SHELL_T, 1.3, density=16, vol=0.03, lo=3000, hi=7000)
crystal(HOLO_T + 0.2, (79, 84, 88), 0.2, 0.035)
add(t.sfx, swell(0.5, 800, 6000, 0.05), PATH_T - 0.4)
gliss(t.sfx, PATH_T, (72, 76, 79, 83, 86, 91), step=0.07, vol=0.05)
sparkle(t.sfx, PATH_T, 1.0, density=20, vol=0.025, lo=3500, hi=7500)
add(t.sfx, whoosh(1.2, 0.14), STEP_T)
add(t.sfx, boom(0.12), FLASH_T)

# ---- scene 2: landing in the Snowflake Kingdom ----
add(t.sfx, whoosh(1.6, 0.08), SCENE2_T)
crystal(SCENE2_T + 0.4, (72, 76, 79, 84, 88), 0.3, 0.035)
add(t.sfx, crunch(0.08), LAND_T)
add(t.sfx, crunch(0.07), LAND_T + 0.08)
add(t.sfx, crunch(0.07), LAND_T + 0.15)
add(t.sfx, ping(note_hz(91), 0.04), LAND_T + 0.35)
sparkle(t.sfx, LAND_T + 0.3, 0.6, density=14, vol=0.022)
add(t.sfx, whimper(0.06), CRY_T)

# ---- scene 3: Niva; the colors fade ----
steps(SCENE3_T + 0.1, SCENE3_T + 1.4, vol=0.045)
for k, m in enumerate((76, 72, 69, 64, 60)):
    add(t.sfx, music_box(note_hz(m), 2.0, 0.04), FADE_T + k * 0.5)

# ---- scene 4: the ice cave ----
steps(SCENE4_T, SCENE4_T + 1.2, vol=0.04)
add(t.sfx, hum(73, 3.0, 0.012), SCENE4_T + 0.3)
crystal(SCENE4_T + 0.6, (79, 83, 86), 0.14, 0.03)
add(t.sfx, warm_breath(1.2, 0.06), BREATH_T)
sparkle(t.sfx, BREATH_T + 0.2, 0.9, density=12, vol=0.02, lo=1500, hi=4000)
add(t.sfx, ice_crack(0.05), BREATH_T + 1.0)
add(t.sfx, crunch(0.05), PUSH_T - 0.4)
add(t.sfx, ice_crack(0.07), PUSH_T + 0.35)
gliss(t.sfx, SHELL_GLOW_T, (84, 88, 91), step=0.08, vol=0.04)
add(t.sfx, swell(0.6, 400, 5000, 0.04), PROJECT_T - 0.5)
add(t.sfx, shimmer(1.5, (79, 83, 86, 91), 0.02), PROJECT_T)

# ---- scene 5: the ice melts, the crystal flies home, the northern lights return ----
gliss(t.sfx, RAISE_T, (76, 79, 84, 88), step=0.08, vol=0.045)
add(t.sfx, hum(110, MELT_T - LIGHT_T + 1.6, 0.02), LIGHT_T)
sparkle(t.sfx, LIGHT_T, FREE_T - LIGHT_T, density=16, vol=0.025)
add(t.sfx, swell(FREE_T - LIGHT_T, 600, 6000, 0.04), LIGHT_T)
add(t.sfx, ice_crack(0.06), MELT_T)
for k in range(9):
    add(t.sfx, water_drop(0.045), MELT_T + 0.15 + k * 0.16)
add(t.sfx, ping(note_hz(96), 0.05), FREE_T)
add(t.sfx, whoosh(2.0, 0.12), RISE_T)
crystal(RISE_T + 0.2, (67, 71, 74, 79, 83, 86), 0.3, 0.032)
add(t.sfx, boom(0.26), AURORA_T)
gliss(t.sfx, AURORA_T, (65, 69, 72, 77, 81, 84, 89, 93), step=0.07, vol=0.08)
sparkle(t.sfx, AURORA_T, 2.2, density=22, vol=0.035)
crystal(AURORA_T + 0.6, (84, 88, 91, 96, 91, 96, 100), 0.18, 0.028)
steps(38.4, 38.9, every=0.25, vol=0.035)  # Niva's happy hops

# ---- scene 6: the snowflake pendant and the jungle ----
add(t.sfx, ping(note_hz(88), 0.05), GIVE_T)
sparkle(t.sfx, GIVE_T, 0.8, density=10, vol=0.02)
add(t.sfx, swell(0.6, 300, 3000, 0.04), JUNGLE_T - 0.5)
gliss(t.sfx, JUNGLE_T - 0.15, (72, 76, 79, 84), step=0.05, vol=0.035)
sparkle(t.sfx, JUNGLE_T, 0.2, density=14, vol=0.018)
sparkle(t.sfx, END_T, 1.5, density=10, vol=0.02)

t.finish()
