from audio_kit import *
from score_kit import *

# Episode 12: The Secret of the Ancient Clock Tower
# Six new cues in keys, meters and instruments not used for Episodes 9-11. Dialogue at Episode 11's measured pace.
DUR = 83.8
t = Soundtrack("ep12", duration=DUR, seed=1212)

# ---- timed moments (seconds); src/ep12/Episode.tsx uses the same numbers ----
CUT_1 = 2.2          # from the Whisper Crystal's hologram into the forest
APPLE_FALL_T = 3.2
APPLE_UP_T = 3.9     # the apple jumps back onto its branch
L1_T = 4.3
KIKO_BACK_T = 6.4    # Kiko strolls backward as if it's normal
PEEL_GONE_T = 7.2    # a banana peel vanishes...
PEEL_BACK_T = 7.8    # ...and comes back
L2_T = 8.8
SPIN_T = 11.5        # Draco's "time magic": he spins in circles
L3_T = 13.0
CUT_2 = 15.9
L4_T = 17.6          # "You're late! You're early!..."
TOCK_FLY_T = 18.6    # Tock flies out of the tower
L5_T = 20.2
L6_T = 23.9
L7_T = 25.45         # "Banana o'clock!"
L8_T = 27.1
CUT_3 = 28.7
LOOP1_T = 29.5       # Bobo's time loop: the same slip, three times
LOOP_LEN = 1.0
REWIND_LEN = 0.3
DANCE_T = 33.3       # Kiko's loop button: a dance, twice
DANCE_LEN = 0.85
L9_T = 35.5
PORTAL_IN_T = 37.9
PORTAL_OUT_T = 38.6  # Draco comes out facing the wrong way
L10_T = 38.9
CUT_4 = 41.1
L11_T = 41.3
L12_T = 46.0         # "It's half past Thursday!"
SPLIT_T = 47.8
KIKO_GEAR_T = 48.6   # Kiko nudges a gear; Draco goes round and round
HAND1_T = 50.2
BITE_T = 51.4        # Bobo bites the second clock hand: clink
L13_T = 51.7
L14_T = 53.6
CUT_5 = 55.4
L15_T = 55.7
L16_T = 58.75
FIRE_T = 60.8        # Draco's warm puff melts the frozen gear
CRANK_T = 61.6
BUTTON_T = 62.3      # Bobo leans on the giant golden button
L17_T = 63.8
HANDS_T = 64.6
TICK_T = 65.3        # the Master Clock starts again
L18_T = 65.8
CUT_6 = 68.1
PRANK_T = 69.8       # Kiko moves Tock's clock forward
L19_T = 70.3
BOX_T = 73.0
KIKO_GRAB_T = 73.9
CATCH_T = 74.2
L20_T = 74.4
PROJECT_T = 76.2
L21_T = 76.6
END_T = 80.2
L22_T = 80.6

for lid, who, at in [("l1", "lumi", L1_T), ("l2", "draco", L2_T), ("l3", "bobo", L3_T), ("l4", "tock", L4_T), ("l5", "tock", L5_T), ("l6", "kiko", L6_T), ("l7", "tock", L7_T), ("l8", "bobo", L8_T),
                     ("l9", "bobo", L9_T), ("l10", "draco", L10_T), ("l11", "tock", L11_T), ("l12", "tock", L12_T), ("l13", "lumi", L13_T), ("l14", "bobo", L14_T), ("l15", "tock", L15_T),
                     ("l16", "lumi", L16_T), ("l17", "tock", L17_T), ("l18", "bobo", L18_T), ("l19", "tock", L19_T), ("l20", "bobo", L20_T), ("l21", "lumi", L21_T), ("l22", "narrator", L22_T)]:
    t.line(lid, who, at)

M = t.music
S = t.sfx
n = note


def slide(f0, f1, dur, vol=0.04):
    tt = np.arange(int(dur * SR)) / SR
    f = np.geomspace(f0, f1, len(tt)) * (1 + 0.012 * np.sin(2 * np.pi * 7 * tt))
    ph = 2 * np.pi * np.cumsum(f) / SR
    return ((np.sin(ph) + 0.25 * np.sin(2 * ph)) * np.minimum(tt / 0.03, 1) * np.minimum((dur - tt) / 0.05, 1) * vol).astype(np.float32)


def reversed_(x):
    return np.ascontiguousarray(x[::-1]).astype(np.float32)


# =====================================================================
# CUE 1 "The Backward Forest" (0-16.1 s): magical, curious orchestra with gentle bells. E dorian, 88 BPM.
# Strings, tubular bells, harp and flute; a backwards swell every time time runs backwards.
# =====================================================================
c1 = Cue(0.0, CUT_2 + 0.2, bpm=88, fade_in=0.05, fade_out=0.6)
q = c1.beat
prog = [("E3", "B3", "G4"), ("A2", "E3", "C#4"), ("D3", "A3", "F#4"), ("E3", "B3", "D4")]
for b in range(int((CUT_2 + 0.2) / (4 * q)) + 1):
    at = 0.1 + b * 4 * q
    ch = prog[b % 4]
    c1.put(strings([hz(x) for x in ch], 4 * q + 0.4, 0.035, attack=0.6, release=0.5, tone=2400), at)
    for k in range(8):
        c1.put(harp(hz(ch[k % 3]) * 2, 1.4, 0.025), at + k * q / 2)
for k, (m, at) in enumerate((("B5", 0.2), ("E6", 1.6), ("G5", 3.0), ("F#5", 5.6), ("E5", 9.0), ("B5", 13.2))):
    c1.put(tubular(hz(m), 3.0, 0.03), at)
for m, b, d in (("B4", 4, 2), ("D5", 6, 1), ("E5", 7, 3), ("F#5", 10, 1), ("D5", 11, 1), ("B4", 12, 4)):
    c1.put(flute(hz(m), d * q * 0.95, 0.03), 0.1 + b * q)
for at in (APPLE_UP_T, PEEL_BACK_T):
    add(M, reversed_(tubular(hz("E6"), 1.2, 0.04)), at - 1.2)          # a bell played backwards
for k, m in enumerate(("E5", "D5", "B4", "A4")):                       # Kiko's backwards stroll
    c1.put_at(pizz(hz(m), 0.3, 0.06), KIKO_BACK_T + 0.1 + k * 0.4)
for k in range(12):                                                     # Draco's spin
    c1.put_at(clarinet(hz("E5") * 2 ** (((k * 7) % 12) / 12), 0.08, 0.03), SPIN_T + k * 0.1)
c1.mute(SPIN_T + 1.25, L3_T - 0.05)
c1.render(M)

# =====================================================================
# CUE 2 "Tock!" (15.9-28.9 s): playful woodwinds, pizzicato, whimsical rhythm. B major, 120 BPM, 2/4.
# Bassoon and oboe chatter over pizzicato; a hush and a glockenspiel for "Banana o'clock!".
# =====================================================================
c2 = Cue(CUT_2 - 0.15, CUT_3 + 0.2, bpm=120, fade_in=0.4, fade_out=0.5)
q = c2.beat
c2.put(strings([hz(x) for x in ("B2", "F#3", "D#4")], 1.8, 0.035, attack=0.3, release=0.5), 0.0)
c2.put(brass(hz("F#3"), 1.2, 0.035), 0.15)
c2.put(brass(hz("B3"), 1.2, 0.035), 0.15)
k = 0
while c2.t0 + 0.2 + k * q / 2 < CUT_3:
    at = 0.2 + k * q / 2
    c2.put(pizz(hz(("B2", "F#3", "D#3", "F#3", "E3", "B2", "C#3", "F#3")[k % 8]), 0.25, 0.07), at)
    k += 1
wind = [("D#5", 0, 1), ("F#5", 1, 1), ("B5", 2, 2), ("A#5", 4, 1), ("G#5", 5, 1), ("F#5", 6, 2), ("D#5", 8, 1), ("E5", 9, 1), ("F#5", 10, 2)]
for m, b, d in wind:
    c2.put_at(oboe(hz(m), d * q * 0.45, 0.035), TOCK_FLY_T + 0.2 + b * q / 2)
for k, m in enumerate(("B3", "B3", "A#3", "G#3", "A#3", "B3")):
    c2.put_at(bassoon(hz(m), 0.14, 0.05), L5_T + 0.1 + k * q / 2)
c2.mute(L7_T - 0.15, L7_T + 1.25)
for k, m in enumerate(("B6", "D#7", "F#7")):
    add(S, glock(hz(m), 1.0, 0.03), L7_T + 1.25 + k * 0.08)
c2.render(M)

# =====================================================================
# CUE 3 "Time Glitch" (28.7-41.3 s): quirky clockwork rhythm. C-sharp minor, 132 BPM.
# Harpsichord, tick-tock woodblocks, ratchets; when time loops, the music itself rewinds.
# =====================================================================
c3 = Cue(CUT_3 - 0.1, CUT_4 + 0.2, bpm=132, fade_in=0.3, fade_out=0.5)
q = c3.beat
arp = ["C#4", "E4", "G#4", "C#5", "B4", "G#4", "E4", "G#4", "A3", "C#4", "E4", "A4", "G#4", "E4", "B3", "E4"]
k = 0
while c3.t0 + 0.1 + k * q / 2 < CUT_4:
    at = 0.1 + k * q / 2
    c3.put(harpsichord(hz(arp[k % 16]), 0.5, 0.045), at)
    if k % 2 == 0:
        c3.put(tick(0.04, (k // 2) % 2 == 0), at)
    if k % 8 == 0:
        c3.put(pizz(hz(("C#2", "A1", "E2", "G#1")[(k // 8) % 4]), 0.5, 0.11), at)
    k += 1
# the time loop: after each slip the last second of music plays backwards
for i in range(2):
    a = LOOP1_T + i * (LOOP_LEN + REWIND_LEN) - c3.t0
    seg = c3.buf[int(a * SR) : int((a + LOOP_LEN) * SR)].copy()
    rev = reversed_(seg)
    rev = signal.resample(rev, int(REWIND_LEN * SR)).astype(np.float32)
    c3.buf[int((a + LOOP_LEN) * SR) : int((a + LOOP_LEN) * SR) + len(rev)] = rev * 0.8
    add(S, rewind_fx(REWIND_LEN, 0.06), LOOP1_T + i * (LOOP_LEN + REWIND_LEN) + LOOP_LEN)
for i in range(3):                                                     # the slip: a tiny slide and a bump
    at = LOOP1_T + i * (LOOP_LEN + REWIND_LEN)
    add(S, slide(900, 400, 0.35, 0.035), at + 0.35)
    add(S, pomf(0.06), at + 0.7)
# Kiko's dance: a silly kazoo two-step, played twice
for i in range(2):
    at = DANCE_T + i * (DANCE_LEN + 0.15)
    for k, m in enumerate(("C#5", "E5", "C#5", "G#4", "A4", "C#5")):
        add(S, kazoo(hz(m), DANCE_LEN / 6 * 0.9, 0.03), at + k * DANCE_LEN / 6)
    add(S, rewind_fx(0.15, 0.05), at + DANCE_LEN)
    add(S, pop(0.05), at - 0.05)
c3.mute(L9_T - 0.1, L9_T + 2.3)
add(S, whoosh(0.5, 0.07), PORTAL_IN_T)
add(S, reversed_(whoosh(0.6, 0.08)), PORTAL_OUT_T - 0.3)               # a reverse whoosh out of the portal
c3.render(M)

# =====================================================================
# CUE 4 "The Missing Hands" (41.1-55.6 s): mysterious adventure with ticking percussion. F minor, 96 BPM.
# Low strings, horn calls, harp, a steady 16th-note tick; comic stops for the gear ride and the clink.
# =====================================================================
c4 = Cue(CUT_4 - 0.1, CUT_5 + 0.2, bpm=96, fade_in=0.5, fade_out=0.5)
q = c4.beat
c4.put(strings([hz("F2"), hz("C3"), hz("Ab3")], CUT_5 - CUT_4 + 0.2, 0.035, attack=0.6, release=0.4, tone=1400), 0.1)
k = 0
while c4.t0 + 0.1 + k * q / 4 < CUT_5:
    at = 0.1 + k * q / 4
    c4.put(tick(0.022 if k % 4 else 0.035, k % 8 < 4), at)
    if k % 8 == 0:
        c4.put(harp(hz(("F3", "Ab3", "C4", "Db4", "C4", "Ab3")[(k // 8) % 6]) * 2, 1.4, 0.03), at)
    k += 1
for m, at, d in (("C4", 0.5, 0.6), ("F4", 1.1, 0.6), ("Ab4", 1.7, 1.2), ("G4", 3.2, 0.5), ("Eb4", 3.7, 1.0)):
    c4.put(brass(hz(m), d, 0.035), at)
c4.mute(L12_T + 1.7, SPLIT_T)                                          # deadpan beat after "half past Thursday"
add(S, whoosh(0.6, 0.06), SPLIT_T)
add(S, gear_grind(1.6, 0.05), KIKO_GEAR_T)
add(S, whirl(1.5, 0.05), KIKO_GEAR_T + 0.2)
add(S, ding(0.05), HAND1_T)
add(S, clink(0.08), BITE_T)
c4.mute(BITE_T, L13_T + 1.5)
c4.render(M)

# =====================================================================
# CUE 5 "Fix the Master Clock" (55.4-68.3 s): energetic orchestral build with dramatic pauses. F-sharp minor -> F-sharp major, 150 BPM.
# Spiccato strings, timpani, snare, brass; the music freezes when the tower shakes and before the final TICK.
# =====================================================================
c5 = Cue(CUT_5 - 0.1, CUT_6 + 0.2, bpm=150, fade_in=0.4, fade_out=0.5)
q = c5.beat
c5.put_at(strings([hz("F#2"), hz("C#3"), hz("A3")], L16_T - CUT_5 + 0.4, 0.035, attack=0.4, release=0.3, trem=12), CUT_5)
add(S, gear_grind(L16_T - CUT_5, 0.025), CUT_5)
c5.put_at(strings([hz(x) for x in ("D3", "F#3", "A3")], 1.0, 0.04, attack=0.3, release=0.3), L16_T)
c5.put_at(strings([hz(x) for x in ("E3", "G#3", "B3")], 1.0, 0.04, attack=0.3, release=0.4), L16_T + 0.9)
k = 0
while FIRE_T - 0.2 + k * q / 2 < TICK_T:
    at = FIRE_T - 0.2 + k * q / 2
    c5.put_at(pizz(hz(("F#3", "F#3", "A3", "F#3", "C#4", "F#3", "B3", "A3")[k % 8]) * 2, 0.15, 0.055), at)
    if k % 2 == 0:
        c5.put_at(timpani(hz("F#2"), 0.06, 0.5), at)
    k += 1
c5.put_at(brass(hz("C#4"), 0.5, 0.04), FIRE_T)
c5.put_at(brass(hz("F#4"), 0.5, 0.04), CRANK_T)
add(S, fizzle(0.03, 0.6), FIRE_T + 0.1)
add(S, ratchet(0.6, 0.04), CRANK_T)
add(S, boom(0.12), BUTTON_T + 0.05)
add(S, gear_grind(1.0, 0.06), BUTTON_T + 0.05)
c5.mute(BUTTON_T, L17_T)
c5.put_at(snare_roll(TICK_T - L17_T, 0.045), L17_T)
c5.put_at(cymbal_swell(TICK_T - L17_T, 0.04), L17_T)
add(S, whoosh(0.7, 0.06), HANDS_T)
c5.mute(TICK_T - 0.25, TICK_T)
add(S, chime(note_hz(42), 0.1), TICK_T)                                 # the great clock chime
add(S, tick(0.06, True), TICK_T + 0.5)
add(S, tick(0.06, False), TICK_T + 1.0)
c5.put_at(strings([hz(x) for x in ("F#3", "A#3", "C#4", "F#4", "A#4")], 2.2, 0.06, attack=0.05, release=0.8), TICK_T)
for m, at, d in (("C#4", 0, 0.3), ("F#4", 0.3, 0.3), ("A#4", 0.6, 0.3), ("C#5", 0.9, 0.9)):
    c5.put_at(brass(hz(m), d, 0.05), TICK_T + at)
c5.render(M)

# =====================================================================
# CUE 6 "Time Is Right Again" (68.1-end): joyful magical orchestra. G major waltz, 112 BPM, 3/4; a rainbow shimmer teaser.
# Strings, bells, flute and celesta; a dead stop for the prank; a heroic sting when Bobo catches Kiko.
# =====================================================================
c6 = Cue(CUT_6 - 0.15, DUR, bpm=112, fade_in=0.4, fade_out=0.05)
q = c6.beat
bars = [("G2", ("G3", "B3", "D4")), ("C3", ("C4", "E4", "G4")), ("D3", ("D4", "F#4", "A4")), ("G2", ("G3", "B3", "D4"))]
for b in range(4):
    at = 0.15 + b * 3 * q
    root, ch = bars[b]
    c6.put(pizz(hz(root), 0.5, 0.1), at)
    c6.put(strings([hz(x) for x in ch], 3 * q + 0.2, 0.04, attack=0.2, release=0.3), at + q)
    c6.put(tubular(hz(ch[2]) * 2, 2.0, 0.025), at)
for m, b, d in (("D5", 0, 1), ("G5", 1, 2), ("F#5", 3, 1), ("E5", 4, 1), ("D5", 5, 1), ("B4", 6, 3), ("C5", 9, 1), ("D5", 10, 2)):
    c6.put(flute(hz(m), d * q * 0.95, 0.035), 0.15 + b * q)
c6.mute(PRANK_T, L19_T + 1.8)
add(S, ratchet(0.25, 0.04), PRANK_T + 0.1)
for k in range(5):
    c6.put_at(clap(0.03), L19_T + 1.85 + k * q / 2)
c6.put_at(strings([hz(x) for x in ("G3", "B3", "D4")], 1.4, 0.035, attack=0.3, release=0.5), L19_T + 1.8)
for k, m in enumerate(("G6", "B6", "D7")):                              # the golden banana
    add(S, glock(hz(m), 1.2, 0.035), BOX_T + 0.25 + k * 0.07)
add(S, ratchet(0.3, 0.03), BOX_T)
add(S, whoosh(0.3, 0.06), KIKO_GRAB_T)
add(S, boing(0.06, 240), CATCH_T)
for m, at, d in (("G4", 0, 0.15), ("B4", 0.15, 0.15), ("D5", 0.3, 0.45)):
    c6.put_at(brass(hz(m), d, 0.045), CATCH_T + at)
# the teaser: a rainbow shimmer, B lydian, left open
c6.mute(PROJECT_T - 0.2, PROJECT_T)
c6.put_at(strings([hz(x) for x in ("B2", "F#3", "C#4", "E#4")], DUR - PROJECT_T, 0.035, attack=0.8, release=0.3), PROJECT_T)
for k in range(int((DUR - PROJECT_T - 0.6) / 0.24)):
    c6.put_at(harp(hz(("B3", "D#4", "F#4", "A#4", "C#5", "E#5", "F#5", "C#5")[k % 8]) * 2, 1.4, 0.026), PROJECT_T + 0.1 + k * 0.24)
c6.put_at(choir([hz("F#4"), hz("C#5")], DUR - L22_T, 0.03, attack=0.6, release=0.2), L22_T - 0.2)
add(S, tubular(hz("F#5"), 3.0, 0.03), END_T)
c6.render(M)

# =====================================================================
# Sound effects and ambience
# =====================================================================
add(S, current(CUT_1 + 0.5, 0.03), 0.0)                                 # still in the cave
add(S, whoosh(1.0, 0.08), CUT_1 - 0.5)
add(S, noise_band(DUR - CUT_1, 200, 1400, 0.006), CUT_1)                # forest and tower air
k = 0
while CUT_1 + 0.4 + k * 0.5 < CUT_2:                                   # a forest that ticks quietly
    add(S, tick(0.012, k % 2 == 0), CUT_1 + 0.4 + k * 0.5)
    k += 1
add(S, whoosh(0.3, 0.05), APPLE_FALL_T)
add(S, pop(0.05), APPLE_FALL_T + 0.3)
add(S, reversed_(whoosh(0.4, 0.07)), APPLE_UP_T - 0.2)
add(S, pop(0.06), PEEL_GONE_T)
add(S, pop(0.06), PEEL_BACK_T)
add(S, boing(0.05, 300), PEEL_BACK_T + 0.1)
whistle_tune(S, KIKO_BACK_T + 0.2, [n(x) for x in ("B5", "A5", "G5", "E5", "G5", "A5")], step=0.2, vol=0.025)
add(S, whirl(1.2, 0.06), SPIN_T)
add(S, pomf(0.06), SPIN_T + 1.25)
add(S, gear_grind(1.2, 0.03), CUT_2)
add(S, flutter_wings(1.2, 0.05), TOCK_FLY_T)
add(S, tick(0.04, True), TOCK_FLY_T + 1.3)
add(S, gear_grind(DUR - CUT_3, 0.008), CUT_3)                            # the tower's gears, all the time
add(S, flutter_wings(0.8, 0.03), L11_T)
add(S, flutter_wings(0.8, 0.03), L15_T + 0.4)
add(S, flutter_wings(1.0, 0.04), L19_T)
add(S, boom(0.12), TICK_T)
sparkle(S, TICK_T, 2.0, density=18, vol=0.03)
add(S, whoosh(1.2, 0.06), CUT_6 + 0.2)
sparkle(S, CUT_6 + 0.2, 1.5, density=14, vol=0.025)
add(S, whoosh(0.6, 0.05), PROJECT_T - 0.2)
sparkle(S, END_T, 2.0, density=8, vol=0.015)

import wave as _wave
os.makedirs(os.path.join(ROOT, "build", "ep12"), exist_ok=True)
with _wave.open(os.path.join(ROOT, "build", "ep12", "music_stem.wav"), "wb") as w:
    w.setnchannels(1)
    w.setsampwidth(2)
    w.setframerate(SR)
    w.writeframes((np.clip(M / (np.max(np.abs(M)) + 1e-9), -1, 1) * 32767).astype(np.int16).tobytes())

t.finish(mouth_style="v2")
