from audio_kit import *
from score_kit import *

# Episode 9: The Mystery of the Golden Desert
# A NEW score: six original cues, each with its own key, tempo and instruments (see score_kit.py).
t = Soundtrack("ep09", duration=50.0, seed=909)

# ---- timed moments (seconds); src/ep09/Episode.tsx uses the same numbers ----
L1_T = 0.3
GUST_T = 2.1          # sand blows out of the hologram into Draco's face
L2_T = 2.35
FIRE_T = 2.95         # ...CHOO: a tiny fireball
FRAZZLE_T = 3.3       # it singes Bobo's fur
L3_T = 3.6
L4_T = 5.22
WIPE_T = 5.45
CUT1 = 6.0
LAND_T = 6.55
SPOT_T = 7.3          # Bobo spots the "banana tree"
L5_T = 7.5
RUN_T = 8.4
MIRAGE_T = 9.7        # the mirage melts: it's a cactus
POKE_T = 10.45        # one spine boops his nose
L6_T = 10.9
L7_T = 11.95
TROMBONE_T = 12.82
CUT2 = 13.3
EARS_T = 13.75        # two huge ears rise out of the sand
POP_T = 14.5          # Zuzu pops out
L8_T = 14.95
L9_T = 17.55
L10_T = 18.78
THINK_T = 20.9
L11_T = 21.45
BUZZ_T = 22.2
L12_T = 22.75
L13_T = 23.42
RUMBLE_T = 24.15
L14_T = 24.3
CUT3 = 25.6
SYM_GLOW_T = 26.0
MATCH_T = 26.6
KIKO_PUSH_T = 27.0
BOBO_PUSH_T = 27.7
BOUNCE_T = 28.05
SIT_T = 28.35
L16_T = 28.6
INHALE_T = 30.3
FIRE2_T = 30.75
FIZZ_T = 30.95
SAND_T = 31.45
BWOMP_T = 31.7
L17_T = 32.35
L18_T = 33.45
CUT4 = 36.1
L19_T = 36.2
TOUCH_T = 37.1
SYM1_T, SYM2_T, SYM3_T = 37.35, 37.6, 37.85
OPEN_T = 38.15
RISE_T = 38.6
BURST_T = 39.8
L20_T = 40.45
L21_T = 42.05
BANANA_T = 43.25
HUG_T = 43.5
CUT5 = 44.2
GIVE_T = 44.3
PROJECT_T = 44.75
L23_T = 44.95
CLINK_T = 47.0
L24_T = 47.15
END_T = 47.3

# ---- voices ----
t.line("l1", "draco", L1_T)
t.line("l2", "draco", L2_T)
t.line("l3", "bobo", L3_T)
t.line("l4", "kiko", L4_T)
t.line("l5", "bobo", L5_T)
t.line("l6", "kiko", L6_T)
t.line("l7", "bobo", L7_T)
t.line("l8", "zuzu", L8_T)
t.line("l9", "lumi", L9_T)
t.line("l10", "zuzu", L10_T)
t.line("l11", "draco", L11_T)
t.line("l12", "kiko", L12_T)
t.line("l13", "zuzu", L13_T)
t.line("l14", "bobo", L14_T)
t.line("l16", "draco", L16_T)
t.line("l17", "kiko", L17_T)
t.line("l18", "zuzu", L18_T)
t.line("l19", "lumi", L19_T)
t.line("l20", "zuzu", L20_T)
t.line("l21", "bobo", L21_T)
t.line("l23", "draco", L23_T)
t.line("l24", "narrator", L24_T)

M = t.music
n = note

# =====================================================================
# CUE 1 "Sandy Hop" (0-6.2 s): playful desert-adventure opening.
# D Phrygian dominant, 116 BPM, hand drums, oud riff, pizzicato bass.
# =====================================================================
c1 = Cue(0.0, CUT1 + 0.1, bpm=116, fade_in=0.01, fade_out=0.5)
E = c1.beat / 2
groove = "DT.TD.TT"
for bar in range(4):
    for k, s in enumerate(groove):
        at = bar * 8 * E + k * E
        if s == "D":
            c1.put(dum(0.15), at)
        elif s == "T":
            c1.put(tek(0.06), at)
    for k in range(16):
        c1.put(shaker(0.018 if k % 2 else 0.028), bar * 8 * E + k * E / 2)
    for k, m in enumerate(("D2", "D2", "A1", "D2")):
        c1.put(pizz(hz(m), 0.5, 0.16), bar * 8 * E + (0, 3, 4, 6)[k] * E)
riff = ["D4", "F#4", "G4", "A4", "Bb4", "A4", "G4", "F#4", "G4", "F#4", "Eb4", "D4", "Eb4", "F#4", "D4", None,
        "A4", "Bb4", "A4", "G4", "F#4", "G4", "A4", "D5", "C5", "Bb4", "A4", "G4", "F#4", "Eb4", "D4", None]
for k, m in enumerate(riff):
    if m:
        c1.put(oud(hz(m), 0.8, 0.075), k * E)
# frame-0 hook: a brass "ta-da" and a finger cymbal
c1.put(brass(hz("D4"), 0.25, 0.05), 0.0)
c1.put(brass(hz("A4"), 0.5, 0.05), 0.12)
c1.put(brass(hz("F#4"), 0.5, 0.035), 0.12)
c1.put(zill(0.03), 0.0)
c1.put(brass(hz("D4"), 0.35, 0.045), GUST_T)            # a stab as the gust hits
c1.put(brass(hz("Eb4"), 0.35, 0.03), GUST_T)
c1.mute(FIRE_T - 0.02, FIRE_T + 0.3)                     # the music hiccups with the sneeze
harp_gliss(M, WIPE_T, [n(x) for x in ("D4", "F#4", "A4", "D5", "F#5", "A5", "D6")], step=0.06, vol=0.04)
c1.render(M)

# =====================================================================
# CUE 2 "Banana Dash" (6-13.6 s): bouncy comedy. G major, 132 BPM oom-pah.
# Tuba, marimba, xylophone, woodblock gallop; a hard stop for the mirage; sad trombone.
# =====================================================================
c2 = Cue(CUT1 - 0.15, CUT2 + 0.25, bpm=132, fade_in=0.3, fade_out=0.5)
# the big reveal: shimmering strings and a brass swell over the dunes
c2.put(strings([hz(x) for x in ("G3", "D4", "B4", "D5")], 1.6, 0.05, attack=0.4, release=0.5), 0.0)
c2.put(brass(hz("G3"), 1.2, 0.04), 0.25)
c2.put(brass(hz("D4"), 1.2, 0.035), 0.25)
harp_gliss(M, CUT1 + 0.05, [n(x) for x in ("G3", "B3", "D4", "G4", "B4", "D5", "G5", "B5")], step=0.05, vol=0.035)
q = c2.beat
s0 = SPOT_T - c2.t0
bass_line = ["G2", "D2", "G2", "D2", "C2", "G2", "D2", "A1"]
mel = ["B4", "D5", "G5", "D5", "E5", "D5", "B4", "G4", "A4", "B4", "C5", "D5", "B4", None, "G4", None]
for k in range(int((RUN_T - SPOT_T) / q) + 1):
    at = s0 + k * q
    c2.put(tuba(hz(bass_line[k % 8]), 0.3, 0.13), at)
    c2.put(marimba(hz("B3"), 0.4, 0.05), at + q / 2)
    c2.put(marimba(hz("D4"), 0.4, 0.05), at + q / 2)
for k, m in enumerate(mel):
    if m and s0 + k * q / 2 < RUN_T - c2.t0:
        c2.put(xylo(hz(m), 0.5, 0.07), s0 + k * q / 2)
# the charge: double time, a galloping woodblock and a marimba run up the scale
r0 = RUN_T - c2.t0
run_scale = [n(x) for x in ("G4", "A4", "B4", "C5", "D5", "E5", "F#5", "G5")]
for k in range(int((MIRAGE_T - RUN_T) / (q / 2))):
    at = r0 + k * q / 2
    c2.put(tuba(hz("G2" if k % 2 == 0 else "D2"), 0.18, 0.12), at)
    c2.put(woodblock(1050 if k % 2 else 820, 0.05), at)
    c2.put(woodblock(940, 0.03), at + q / 4)
    c2.put(marimba(note_hz(run_scale[k % 8]), 0.35, 0.06), at)
    c2.put(marimba(note_hz(run_scale[(k + 2) % 8]), 0.35, 0.04), at + q / 4)
c2.mute(MIRAGE_T, L6_T - 0.05)                         # dead stop: the mirage melts
# Kiko's laugh: a giggling bassoon and light pizzicato
for k, m in enumerate(("D4", "D4", "C4", "B3", "C4", "D4")):
    c2.put_at(bassoon(hz(m), 0.12, 0.06), L6_T + 0.05 + k * q / 2)
for k in range(5):
    c2.put_at(pizz(hz(("G2", "D3", "G2", "D3", "G2")[k]), 0.4, 0.1), L6_T + k * q)
c2.mute(L7_T - 0.1, TROMBONE_T - 0.02)                  # a beat of quiet for "That's NOT a banana!"
c2.render(M)
sad_trombone(M, TROMBONE_T, notes=("G3", "F#3", "F3", "E3"), vol=0.06)

# =====================================================================
# CUE 3 "Riddle of the Sands" (13.3-25.9 s): playful mystery. A minor, 96 BPM.
# Sneaky pizzicato walking bass, finger snaps, celesta questions, a low flute; a clock ticking.
# =====================================================================
c3 = Cue(CUT2 + 0.35, CUT3 + 0.3, bpm=96, fade_in=0.2, fade_out=0.45)
q = c3.beat
# the ears rising: lonely plucks
for k, m in enumerate(("A2", "E3", "A2", "C3")):
    c3.put_at(pizz(hz(m), 0.5, 0.1), EARS_T - 0.1 + k * 0.2)
c3.put_at(celesta(hz("A5"), 1.0, 0.05), POP_T)
for k, m in enumerate(("C6", "E6", "A6")):
    c3.put_at(celesta(hz(m), 1.0, 0.045), POP_T + 0.07 * (k + 1))
walk = ["A2", "C3", "E3", "G#2", "A2", "E2", "F2", "E2", "D2", "F2", "A2", "C3", "B2", "G#2", "E2", "E2"]
g0 = POP_T + 0.35
k = 0
while g0 + k * q / 2 < THINK_T:
    at = g0 + k * q / 2
    c3.put_at(pizz(hz(walk[k % 16]), 0.35, 0.11), at)
    if k % 4 == 2:
        c3.put_at(snap(0.04), at)
    k += 1
qmotif = ["E5", "A5", "C6", "B5", "G#5"]
for rep, start in enumerate((POP_T + 0.4 + 4 * q, L9_T)):
    for j, m in enumerate(qmotif):
        c3.put_at(celesta(hz(m), 1.0, 0.04), start + j * q / 2)
c3.put_at(flute(hz("A4"), 1.1, 0.04), L10_T + 0.1)            # "What has a face..."
c3.put_at(flute(hz("G#4"), 1.0, 0.04), L10_T + 1.25)
# thinking: only a clock is left, tick... tock...
c3.mute(THINK_T, L12_T - 0.2)
for k in range(5):
    add(t.sfx, woodblock(1250 if k % 2 == 0 else 900, 0.06), THINK_T + 0.05 + k * 0.25)
add(t.sfx, buzzer(0.035), BUZZ_T)                             # wrong!
add(t.sfx, bwomp(hz("A1"), 0.11, 0.6), BUZZ_T + 0.05)
add(t.sfx, snap(0.03), L12_T - 0.17)                          # "psst"
for k, m in enumerate(("E5", "E5", "A5")):                    # tiptoe plucks under the whisper
    c3.put_at(pizz(hz(m), 0.25, 0.06), L12_T + k * 0.18)
add(t.sfx, ding(0.06), L13_T + 0.05)                          # correct!
harp_gliss(M, L13_T + 0.05, [n(x) for x in ("A3", "C#4", "E4", "A4", "C#5", "E5", "A5")], step=0.04, vol=0.04)
for k, m in enumerate(("A2", "E2", "A2", "C#3")):
    c3.put_at(pizz(hz(m), 0.4, 0.09), L13_T + 0.8 + k * q / 2)
add(t.sfx, tummy_rumble(0.1), RUMBLE_T)
c3.put_at(pizz(hz("E2"), 0.4, 0.13), L14_T + 1.0)            # the button: bom-bom
c3.put_at(pizz(hz("A2"), 0.5, 0.15), L14_T + 1.0 + q / 2)
c3.render(M)

# =====================================================================
# CUE 4 "The Pyramid Door" (25.6-36.5 s): suspense with comic pauses. D minor, 80 BPM.
# Low string tremolo, frame-drum heartbeat, timpani, oud ostinato; a heroic build that collapses.
# =====================================================================
c4 = Cue(CUT3 - 0.1, CUT4 + 0.3, bpm=80, fade_in=0.4, fade_out=0.5)
q = c4.beat
c4.put(timpani(hz("D2"), 0.13), 0.1)
c4.put(strings([hz("D2"), hz("A2"), hz("D3")], L16_T - CUT3 + 0.3, 0.055, attack=0.5, release=0.3, tone=1400, trem=7.0), 0.0)
for k in range(int((L16_T - CUT3) / q)):
    at = 0.1 + k * q
    c4.put(frame_drum(0.12), at)
    c4.put(frame_drum(0.06), at + q * 0.28)
    c4.put(oud(hz(("D3", "Eb3", "D3", "A2")[k % 4]), 0.7, 0.06), at + q / 2)
c4.put_at(choir([hz("D5"), hz("A5")], 1.6, 0.03, attack=0.2), SYM_GLOW_T)   # the symbols glow
# Draco: "Stand back!" -- a heroic fanfare, snare and timpani building... to nothing
fan = [("D4", 0.0, 0.2), ("F4", 0.2, 0.2), ("A4", 0.4, 0.2), ("D5", 0.6, 0.9), ("C5", 1.55, 0.2), ("D5", 1.75, 0.6)]
for m, at, d in fan:
    c4.put_at(brass(hz(m), d, 0.06), L16_T + at)
    c4.put_at(brass(hz(m) / 2, d, 0.04), L16_T + at)
c4.put_at(strings([hz(x) for x in ("D3", "F3", "A3", "D4")], 2.3, 0.05, attack=0.6, release=0.1, tone=2600, trem=11), L16_T)
c4.put_at(timp_roll(hz("A1"), FIRE2_T - L16_T - 0.6, 0.08), L16_T + 0.6)
c4.put_at(snare_roll(FIRE2_T - INHALE_T + 0.4, 0.05), INHALE_T - 0.4)
c4.put_at(cymbal_swell(FIRE2_T - INHALE_T + 0.2, 0.04), INHALE_T - 0.2)
c4.mute(FIRE2_T - 0.01, L17_T - 0.05, ramp=0.015)   # ...the tiny fireball; dead silence
# Kiko laughs, Zuzu explains: light pizzicato, soft tremolo, and a cheeky flute flourish
c4.put_at(strings([hz("D3"), hz("F3"), hz("A3")], CUT4 - L17_T + 0.4, 0.035, attack=0.4, release=0.4, tone=1800, trem=6), L17_T)
k = 0
while L17_T + k * q / 2 < CUT4:
    c4.put_at(pizz(hz(("D3", "A2", "F3", "A2")[k % 4]), 0.35, 0.08), L17_T + k * q / 2)
    k += 1
for j, m in enumerate(("A5", "Bb5", "A5", "Bb5", "A5", "D6")):
    c4.put_at(flute(hz(m), 0.12 if j < 5 else 0.5, 0.035), L18_T + 2.5 + j * 0.07)
c4.render(M)

# =====================================================================
# CUE 5 "The Golden Sun Crystal" (36.1-44.6 s): magical orchestral celebration. E-flat major, 72 BPM.
# Harp, choir, strings, brass chorale, timpani roll, cymbal swell, then a full tutti climax.
# =====================================================================
c5 = Cue(CUT4 - 0.15, CUT5 + 0.25, bpm=72, fade_in=0.4, fade_out=0.6)
q = c5.beat
c5.put(strings([hz(x) for x in ("C3", "G3", "Eb4")], 1.2, 0.04, attack=0.5, release=0.3), 0.1)
c5.put_at(strings([hz(x) for x in ("Ab2", "Eb3", "C4", "Ab4")], BURST_T - TOUCH_T + 0.3, 0.05, attack=0.5, release=0.2), TOUCH_T)
for k, m in enumerate(("C4", "Eb4", "G4", "C5", "Eb5", "G5")):
    c5.put(harp(hz(m), 1.6, 0.04), 0.15 + k * 0.11)
c5.put_at(choir([hz("Eb4"), hz("Bb4")], BURST_T - TOUCH_T + 0.2, 0.035, attack=0.8, release=0.2), TOUCH_T)
for at, m in ((SYM1_T, "Eb5"), (SYM2_T, "G5"), (SYM3_T, "Bb5")):
    add(t.sfx, glock(hz(m), 1.4, 0.05), at)
    add(t.sfx, celesta(hz(m) * 2, 1.0, 0.03), at + 0.01)
c5.put_at(timp_roll(hz("Bb1"), BURST_T - OPEN_T - 0.05, 0.08), OPEN_T)
for m, d in (("Bb2", 0.0), ("F3", 0.0), ("D4", 0.0)):
    c5.put_at(brass(hz(m), BURST_T - OPEN_T, 0.035), OPEN_T + 0.3)
c5.put_at(cymbal_swell(1.0, 0.05), BURST_T - 1.0)
# BURST: the tutti
tutti = ("Eb2", "Eb3", "G3", "Bb3", "Eb4")
c5.put_at(timpani(hz("Eb2"), 0.2), BURST_T)
c5.put_at(crash(0.06), BURST_T)
c5.put_at(strings([hz(x) for x in tutti[1:]] + [hz("G4"), hz("Bb4"), hz("Eb5")], 2.2, 0.075, attack=0.05, release=0.9), BURST_T)
c5.put_at(choir([hz("G4"), hz("Bb4"), hz("Eb5")], 2.4, 0.05, attack=0.15, release=1.0), BURST_T)
for m in tutti[1:4]:
    c5.put_at(brass(hz(m), 1.8, 0.05), BURST_T)
melody = [("Eb4", 0.0, 0.35), ("G4", 0.35, 0.35), ("Bb4", 0.7, 0.35), ("Eb5", 1.05, 0.9), ("D5", 1.95, 0.3), ("C5", 2.25, 0.3), ("Bb4", 2.55, 0.8)]
for m, at, d in melody:
    c5.put_at(brass(hz(m), d, 0.055), BURST_T + at)
    c5.put_at(flute(hz(m) * 2, d, 0.03), BURST_T + at)
harp_gliss(M, BURST_T, [n(x) for x in ("Eb3", "G3", "Bb3", "Eb4", "G4", "Bb4", "Eb5", "G5", "Bb5", "Eb6")], step=0.04, vol=0.04)
# under Zuzu and Bobo: warm sustain Ab - Bb - Eb, then a pizzicato question
c5.put_at(strings([hz(x) for x in ("Ab3", "C4", "Eb4")], 1.6, 0.035, attack=0.5, release=0.5), L20_T + 0.2)
c5.put_at(strings([hz(x) for x in ("Bb3", "D4", "F4")], 1.4, 0.035, attack=0.5, release=0.5), L20_T + 1.6)
for k, m in enumerate(("Bb3", "C4", "D4", "F4")):
    c5.put_at(pizz(hz(m), 0.3, 0.07), L21_T + 0.1 + k * 0.26)
for k, m in enumerate(("Eb6", "G6", "Bb6", "Eb7")):              # ta-da! a golden banana
    c5.put_at(glock(hz(m), 1.2, 0.04), BANANA_T + k * 0.06)
c5.put_at(strings([hz(x) for x in ("Ab3", "C4", "Eb4", "Ab4")], 1.2, 0.04, attack=0.2, release=0.6), HUG_T)
c5.render(M)

# =====================================================================
# CUE 6 "Above the Clouds" (44.2-50 s): whimsical and curious. F Lydian waltz, 108 BPM, 3/4.
# Flute melody, harp arpeggios, celesta, soft strings; ends on an unresolved chord.
# =====================================================================
c6 = Cue(CUT5 - 0.1, 50.0, bpm=108, fade_in=0.4, fade_out=0.05)
q = c6.beat
bars = [("F2", ("F3", "A3", "C4", "E4")), ("G2", ("G3", "B3", "D4", "G4")), ("F2", ("F3", "A3", "C4", "E4")), ("G2", ("G3", "B3", "D4", "G4")), ("F2", ("A3", "C4", "E4", "B4"))]
for b, (root, arp) in enumerate(bars):
    at = 0.15 + b * 3 * q
    c6.put(pizz(hz(root), 0.6, 0.1), at)
    for k in range(6):
        c6.put(harp(hz(arp[k % 4]), 1.4, 0.035), at + k * q / 2)
c6.put(strings([hz(x) for x in ("F3", "C4", "E4")], 5.8, 0.03, attack=0.8, release=0.5, tone=2400), 0.1)
wmel = [("C5", 0, 1), ("E5", 1, 1), ("G5", 2, 1), ("B5", 3, 2), ("A5", 5, 1), ("G5", 6, 1), ("A5", 7, 1), ("B5", 8, 1), ("C6", 9, 3)]
for m, beat, d in wmel:
    c6.put(flute(hz(m), d * q * 0.95, 0.04), 0.15 + beat * q)
for k in range(10):
    c6.put(celesta(hz(("C6", "E6", "G6", "B6")[k % 4]), 0.8, 0.022), 0.4 + k * q * 1.5)
# the end: an unresolved F-Lydian chord and a rising harp
c6.put_at(strings([hz(x) for x in ("F3", "A3", "B3", "E4")], 50.0 - END_T + 0.3, 0.04, attack=0.6, release=0.3), END_T)
harp_gliss(M, END_T + 0.1, [n(x) for x in ("F4", "A4", "B4", "C5", "E5", "F5", "A5", "B5", "E6")], step=0.08, vol=0.03)
c6.render(M)

# =====================================================================
# Sound effects and ambience
# =====================================================================
S = t.sfx
# scene 1 (jungle): air, the hologram, the gust, the sneeze, the singe
add(S, noise_band(CUT1, 250, 1400, 0.006), 0.0)
gliss(S, 0.0, (74, 78, 81, 86, 90), step=0.05, vol=0.05)
sparkle(S, 0.0, 1.2, density=14, vol=0.025)
add(S, whoosh(1.0, 0.1), GUST_T - 0.3)
add(S, sand_hiss(1.1, 0.06), GUST_T - 0.05)
add(S, achoo(0.07), FIRE_T)
add(S, whoosh(0.4, 0.08), FIRE_T + 0.02)
add(S, pop(0.08), FRAZZLE_T)
add(S, boom(0.05), FRAZZLE_T)
add(S, fizzle(0.04, 0.5), FRAZZLE_T + 0.02)
add(S, squeak(0.035), FRAZZLE_T + 0.12)
for k in range(4):
    add(S, tek(0.02), L4_T + k * 0.13)                              # Kiko slapping the ground laughing
add(S, sand_hiss(0.9, 0.05), WIPE_T)
add(S, whoosh(0.8, 0.1), WIPE_T)
# desert wind for the rest of the episode
add(S, desert_wind(50.0 - CUT1, 0.011), CUT1)
# scene 2: landing, the dash, the mirage, the poke
for k in range(3):
    add(S, pomf(0.08), LAND_T + k * 0.1)
gliss(S, SPOT_T, (84, 88, 91, 96, 100), step=0.04, vol=0.04)            # sparkly eyes
add(S, mirage_wobble(1.4, 0.02), SPOT_T)                                   # the shimmer in the distance
s_ = RUN_T
while s_ < MIRAGE_T:
    add(S, sand_step(0.04), s_)
    s_ += 0.09
add(S, record_scratch(0.06), MIRAGE_T)
add(S, mirage_wobble(0.9, 0.04), MIRAGE_T)
add(S, tumbleweed(1.1, 0.025), MIRAGE_T + 0.15)
add(S, boing(0.08, 220), POKE_T)
add(S, squeak(0.045), POKE_T + 0.02)
add(S, pomf(0.07), POKE_T + 0.38)
# scene 3: ears, pop, sand spray
add(S, sand_pour(0.5, 0.03), EARS_T)
add(S, radar_bloop(True), EARS_T + 0.35)
add(S, radar_bloop(False), EARS_T + 0.55)
add(S, radar_bloop(True), EARS_T + 0.75)
add(S, pomf(0.06), POP_T)
add(S, sand_hiss(0.5, 0.04), POP_T)
add(S, pomf(0.05), POP_T + 0.3)
# scene 4: steps, glow, pushes, the bounce, the fizzle, the sand
for k in range(8):
    add(S, sand_step(0.03), CUT3 + 0.05 + k * 0.14)
add(S, ping(note_hz(88), 0.04), MATCH_T)
add(S, ping(note_hz(88), 0.03), MATCH_T + 0.2)
add(S, strain(0.55, 0.05, hz("D3")), KIKO_PUSH_T)
add(S, strain(0.35, 0.05, hz("G2")), BOBO_PUSH_T)
add(S, pomf(0.05), BOBO_PUSH_T + 0.3)
add(S, boing(0.08, 160), BOUNCE_T)
add(S, pomf(0.09), SIT_T)
add(S, whoosh(0.5, 0.05), INHALE_T)
add(S, fizzle(0.045, 0.45), FIZZ_T - 0.15)
add(S, sand_pour(0.8, 0.06), SAND_T)
add(S, bwomp(hz("D2"), 0.11, 0.7), BWOMP_T)
add(S, blink_ping(0.03), BWOMP_T + 0.25)
add(S, blink_ping(0.03), BWOMP_T + 0.45)
# scene 5: the door and the crystal
add(S, stone_rumble(1.4, 0.08), OPEN_T)
add(S, whoosh(1.6, 0.08), RISE_T)
sparkle(S, RISE_T, 1.2, density=12, vol=0.02)
add(S, boom(0.18), BURST_T)
sparkle(S, BURST_T, 2.2, density=20, vol=0.03)
add(S, pop(0.08), BANANA_T)
sparkle(S, BANANA_T, 0.5, density=16, vol=0.025, lo=3000, hi=6000)
add(S, squeak(0.03), HUG_T)
# scene 6: compass, hologram, clink
add(S, ping(note_hz(91), 0.04), GIVE_T)
add(S, whoosh(0.7, 0.05), PROJECT_T - 0.2)
gliss(S, PROJECT_T, (79, 83, 86, 91), step=0.05, vol=0.03)
add(S, clink(0.07), CLINK_T)
sparkle(S, END_T, 1.6, density=8, vol=0.016)

# Save the music stem on its own so the score can be checked (build/ep09/music_stem.wav)
import wave as _wave
os.makedirs(os.path.join(ROOT, "build", "ep09"), exist_ok=True)
with _wave.open(os.path.join(ROOT, "build", "ep09", "music_stem.wav"), "wb") as w:
    w.setnchannels(1)
    w.setsampwidth(2)
    w.setframerate(SR)
    w.writeframes((np.clip(M / (np.max(np.abs(M)) + 1e-9), -1, 1) * 32767).astype(np.int16).tobytes())

t.finish()
