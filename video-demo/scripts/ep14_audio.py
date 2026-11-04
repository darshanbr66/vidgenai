from audio_kit import *
from score_kit import *
import json
import subprocess

# Episode 14: The Mystery of the Magical Music Box
# Six new cues in keys, meters and instruments not used in Episodes 9-13 (B-flat minor 3/4, G mixolydian 6/8,
# A dorian, A-flat major march, B minor -> A major, B-flat major), plus a short C-sharp minor bridge from
# Episode 13's teaser and an E lydian garden teaser. Dialogue was calibrated per line to about 4.4 syllables/s.
#
# The timing is laid out here, line by line, from the measured length of every line. Every named moment is
# written to src/ep14/cues.json, which src/ep14/Episode.tsx reads, so the picture and the sound share one clock.

HERE = os.path.dirname(os.path.abspath(__file__))
subprocess.run([sys.executable, os.path.join(HERE, "ep14_songs.py")], check=True)  # Melody's sung clips

DUR_MAX = 130.0
t = Soundtrack("ep14", duration=DUR_MAX, seed=1414)
T = {}            # named moments, in seconds
cur = [0.0]       # the end of the last thing laid out


def say(lid, who, gap, name=None):
    """Places a line `gap` seconds after the cursor; records its start as T[name or LID]."""
    s = cur[0] + gap
    cur[0] = t.line(lid, who, s)
    T[name or lid.upper()] = s
    T[(name or lid.upper()) + "_END"] = cur[0]
    return s


def ev(name, gap, hold=0.0):
    """A moment `gap` after the cursor; the cursor then moves `hold` past it."""
    T[name] = cur[0] + gap
    cur[0] = T[name] + hold
    return T[name]


def mark(name, at):
    T[name] = at
    return at


# ---------------- Scene 0: the Rainbow Heart's image of the music box (where Episode 13 ended) ----------------
mark("FLARE", 0.0)
say("l1", "pico", 0.45)                     # "Bye, friends! Good luck with the music box!"
say("l2", "lumi", 0.35)                     # "Thank you, Pico! To the music castle!"
ev("JUMP", -0.35)
ev("CUT_1", 1.15)
# ---------------- Scene 1: the silent castle ----------------
mark("REVEAL", T["CUT_1"] + 0.2)            # out of the clouds: the castle
ev("LAND", 2.3)                             # landing in the courtyard
say("l3", "lumi", 0.55)                     # "Wow... but why is it so quiet?"
ev("CLAP", 0.45, 1.05)                      # Bobo claps three times: no sound at all
say("l4", "bobo", 0.2)                      # "Hello-o! ...Hey! Where's my echo?"
mark("PIANO", cur[0] + 0.15)
say("l5", "kiko", 0.4)                      # "Plink, plonk! Kiko's invisible piano!"
say("l6", "draco", 0.45)                    # "Stand back! Dragon music magic!"
ev("SQUEAK", 0.4, 0.85)                     # ...one tiny squeak
say("l7", "bobo", 0.2)                      # "Even my stomach makes more music than this castle!"
ev("TUMMY", 0.25, 1.2)                     # the loudest sound in the castle
ev("CUT_2", 0.0)
# ---------------- Scene 2: meeting Melody ----------------
say("sing1", "melody", 0.35, "SING1")       # off-key "la la laaa" from behind the fountain
ev("LOOK", 0.25, 0.95)                      # everyone turns to the fountain and tiptoes closer
ev("PEEK", 0.25, 0.4)                       # Melody pops up over the rim
say("l9", "melody", 0.0)                    # "Oh! Visitors! Hello, hello! I'm Melody!"
say("l10", "melody", 0.35)                  # "I guard the Magical Music Box, but its melody is lost!"
say("l11", "melody", 0.35)                  # "Let me show you how it goes. Ahem!"
say("sing2", "melody", 0.3, "SING2")        # the proud, very off-key demo
mark("EARS", T["SING2"] + 0.45)             # Bobo covers his ears
mark("CRACK", T["SING2"] + 0.78)            # the voice crack
mark("STATUE", T["SING2"] + 0.95)           # the singing statue looks confused
ev("HOLD", 0.75)                            # Kiko trying not to laugh
say("l12", "kiko", 0.0)                     # "Was that a song or a sleepy dinosaur?"
say("l13", "melody", 0.4)                   # "It was supposed to be a beautiful melody!"
ev("CUT_3", 0.45)
# ---------------- Scene 3: the musical door ----------------
say("l15", "lumi", 0.6)                     # "Look! The symbols glow in a pattern!"
mark("PATTERN", T["L15"] + 0.25)            # the five symbols glow one after another
ev("TAIL", 0.3, 1.45)                       # Melody's tail sends three glowing notes: three symbols ring true
ev("TRICK", 0.15, 1.7)                     # Kiko sneaks in and taps out a silly tune
ev("BUZZ", 0.0, 0.6)                        # the door blows a raspberry and resets
say("l16", "draco", 0.1)                    # "Step aside! I'm a natural!"
ev("HONK", 0.35, 0.95)                      # a goose-like honk
mark("DANCE", cur[0] - 0.1)
say("l17", "bobo", 0.2)                     # "I don't know the song, but my feet definitely do!"
ev("TOGETHER", 0.45, 0.4)                   # Lumi waves everyone in: follow the glow
ev("NOTES5", 0.0, 1.9)                     # the five true notes
ev("OPEN", 0.0, 1.2)                        # the golden door swings open
ev("CUT_4", 0.0)
# ---------------- Scene 4: the Hall of Instruments ----------------
say("l19", "melody", 0.6)                   # "The Hall of Instruments! Touch one, and it sings!"
ev("TAPS", 0.3, 1.7)                        # Kiko sets off five instruments at once
say("l20", "draco", 0.15)                   # "Maestro Draco will conduct! Orchestra, follow me!"
ev("CONDUCT", 0.05, 1.1)                    # Draco's wild conducting
ev("TOOT", 0.0, 0.6)                        # a trumpet toots right in his face
ev("BACK", 0.0, 0.75)                       # Bobo backs away from the noise...
ev("SIT", 0.0, 0.6)                         # ...and sits on the giant drum. Pause.
ev("BOOM", 0.0, 1.15)                       # BOOM! Everyone jumps
say("l21", "bobo", 0.0)                     # "I think I just played the world's biggest banana drum!"
say("l22", "melody", 0.45)                  # "Oh no! Three notes are missing from the music box!"
ev("CUT_5", 0.35)
# ---------------- Scene 5: restoring the lost melody ----------------
say("l23", "lumi", 0.45)                    # "These bells go low to high, like little stairs!"
ev("BELLS", 0.15, 1.15)                     # five bells, low to high
ev("NOTE1", 0.0, 0.5)
ev("BOUNCE", 0.15, 0.85)                    # Kiko bounces off the giant drum...
ev("NOTE2", 0.0, 0.6)                       # ...and catches the floating note
ev("PREP", 0.2, 0.55)                       # Draco's careful, tiny puff on the frozen bell
ev("PUFF", 0.0, 0.85)
ev("NOTE3", 0.0, 0.45)
say("l26", "draco", 0.1)                    # "I knew my musical talent would help!"
say("l27", "kiko", 0.35)                    # "You were making sounds like a broken trumpet!"
ev("PLACE", 0.45, 1.05)                     # the three notes float into the music box
say("l28", "melody", 0.15)                  # "The last note must be sung... what if I ruin it?"
say("l29", "lumi", 0.4)                     # "Sing from your heart, Melody. We believe in you!"
ev("BREATH", 0.35, 0.55)                    # a deep breath
say("sing3", "melody", 0.0, "SING3")        # the beautiful note
mark("COMBINE", T["SING3"] + 1.4)           # the three notes join her voice
ev("RESTORE", -0.25, 1.3)                   # the music box plays
ev("CUT_6", 0.0)
# ---------------- Scene 6: the castle comes alive ----------------
mark("ALIVE", T["CUT_6"] + 0.1)             # colour and light sweep over the castle, the fountains flow
ev("DANCE2", 2.4)                           # back inside: Bobo can't stop dancing, Kiko joins
ev("SPIN", 1.2, 0.7)                        # Draco's dramatic spin...
ev("CUSHION", 0.0, 0.7)                     # ...into the cushions; he pops up dizzy, a cushion on his head
ev("LAUGH", 0.0, 1.0)
say("l32", "bobo", 0.1)                     # "Ooh! A tiny golden banana music box!"
ev("BTUNE", 0.2, 1.85)                      # its silly little tune
ev("PROJECT", 0.15, 0.45)                   # the music box projects a floating flower garden
say("l33", "lumi", 0.0)                     # "Another magical mystery! Let's discover where that garden leads!"
ev("END", 0.25)                             # end card
say("l34", "narrator", 0.25)                # "Next time... the secret of the floating flower garden!"
DUR = round(cur[0] + 1.7, 1)
mark("DUR", DUR)

# shorten the soundtrack to the laid-out length
t.duration = DUR
t.n = int(SR * DUR)
t.music = t.music[: t.n]
t.sfx = t.sfx[: t.n]
for k in t.voice:
    t.voice[k] = t.voice[k][: t.n]

M = t.music
S = t.sfx
n = note
X = T  # short alias


def slide(f0, f1, dur, vol=0.04):
    """A slide whistle."""
    tt = np.arange(int(dur * SR)) / SR
    f = np.geomspace(f0, f1, len(tt)) * (1 + 0.012 * np.sin(2 * np.pi * 7 * tt))
    ph = 2 * np.pi * np.cumsum(f) / SR
    return ((np.sin(ph) + 0.25 * np.sin(2 * ph)) * np.minimum(tt / 0.03, 1) * np.minimum((dur - tt) / 0.05, 1) * vol).astype(np.float32)


def honk(vol=0.06):
    """Draco's goose-like honk: a buzzy, bent low reed."""
    d = 0.42
    tt = np.arange(int(d * SR)) / SR
    f = hz("A#3") * (1 + 0.18 * np.exp(-tt * 9)) * (1 - 0.06 * tt)
    ph = 2 * np.pi * np.cumsum(f) / SR
    x = np.sign(np.sin(ph)) * 0.5 + 0.5 * np.sin(2 * ph)
    b, a = signal.butter(2, [500 / (SR / 2), 2400 / (SR / 2)], "band")
    x = signal.lfilter(b, a, x) * np.minimum(tt / 0.02, 1) * np.minimum((d - tt) / 0.08, 1)
    return (x / (np.abs(x).max() + 1e-9) * vol).astype(np.float32)


def meep(vol=0.04):
    """A tiny squeaky 'meep' (Draco's dragon music)."""
    d = 0.16
    tt = np.arange(int(d * SR)) / SR
    f = 1500 + 900 * np.sin(np.pi * tt / d)
    x = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.sin(np.pi * tt / d)
    return (x * vol).astype(np.float32)


def raspberry(vol=0.05, dur=0.6):
    """The door's rude 'pbbbt' when the wrong tune is played."""
    tt = np.arange(int(dur * SR)) / SR
    am = 0.5 + 0.5 * np.sign(np.sin(2 * np.pi * 32 * tt))
    x = np.random.default_rng(7).standard_normal(len(tt)) * am
    b, a = signal.butter(2, [120 / (SR / 2), 900 / (SR / 2)], "band")
    x = signal.lfilter(b, a, x) * np.minimum(tt / 0.02, 1) * np.minimum((dur - tt) / 0.1, 1)
    return (x / (np.abs(x).max() + 1e-9) * vol).astype(np.float32)


def big_boom(vol=0.2):
    """The giant drum: a deep pitched thump with a long, rattling ring."""
    d = 2.6
    tt = np.arange(int(d * SR)) / SR
    f = 42 + 50 * np.exp(-tt * 7)
    x = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-tt * 1.6)
    x += 0.4 * np.random.default_rng(5).standard_normal(len(tt)) * np.exp(-tt * 30)
    b, a = signal.butter(2, 1200 / (SR / 2))
    x = signal.lfilter(b, a, x)
    return (x / (np.abs(x).max() + 1e-9) * vol).astype(np.float32)


def wind_up(dur=0.9, vol=0.03):
    """Music box being wound: a slowing ratchet."""
    out = np.zeros(int(dur * SR) + SR // 10, dtype=np.float32)
    k, at = 0, 0.0
    while at < dur:
        add(out, woodblock(2600 + (k % 2) * 380, vol), at)
        at += 0.045 + k * 0.004
        k += 1
    return out


CASTLE = ["A4", "C#5", "E5", "F#5", "E5"]  # the castle's melody (the door and the music box)

# =====================================================================
# BRIDGE (0 - CUT_1): Episode 13's music-box teaser in C-sharp minor, rising into the jump
# =====================================================================
b0 = Cue(0.0, X["CUT_1"] + 0.3, bpm=80, fade_in=0.01, fade_out=0.5)
add(S, boom(0.1), 0.0)                                                  # a sound on frame 0
harp_gliss(S, 0.0, [n(x) for x in ("C#5", "E5", "G#5", "C#6", "E6", "G#6")], step=0.045, vol=0.045)
b0.put(strings([hz(x) for x in ("C#3", "G#3", "E4")], X["JUMP"] + 0.2, 0.026, attack=0.4, release=0.4, tone=1800), 0.05)
for k, m in enumerate(("G#5", "C#6", "E6", "D#6", "C#6", "B5", "C#6", "E6")):
    b0.put(music_box(hz(m), 1.8, 0.04), 0.1 + k * 0.38)
for k, m in enumerate(("C#5", "E5", "G#5", "B5", "C#6", "E6", "G#6", "B6")):
    b0.put_at(celesta(hz(m), 0.9, 0.03), X["JUMP"] + k * 0.07)
b0.render(M)

# =====================================================================
# CUE 1 "The Silent Castle" (CUT_1 - CUT_2): mysterious orchestra, subtle bells, gentle strings.
# B-flat minor, 66 BPM, 3/4. Tubular bells, celesta, harp, high soft strings. Real silence for the jokes.
# =====================================================================
c1 = Cue(X["CUT_1"] - 0.2, X["CUT_2"] + 0.2, bpm=66, fade_in=0.4, fade_out=0.6)
q = c1.beat
bar = 3 * q
prog1 = [("Bb2", ("Db4", "F4", "Bb4")), ("Gb2", ("Db4", "Gb4", "Bb4")), ("Eb3", ("Eb4", "Gb4", "Bb4")), ("F2", ("C4", "F4", "A4"))]
nb = int((X["CUT_2"] - X["CUT_1"] + 0.4) / bar) + 1
for b in range(nb):
    at = 0.25 + b * bar
    root, ch = prog1[b % 4]
    c1.put(strings([hz(x) * 2 for x in ch], bar + 0.6, 0.017, attack=0.9, release=0.8, tone=5200, vib=4.6), at)
    c1.put(strings([hz(root)], bar + 0.4, 0.03, attack=0.6, release=0.6, tone=900), at)
    for k in range(3):
        c1.put(harp(hz(ch[(0, 2, 1)[k]]), 2.0, 0.018), at + k * q)
    if b % 2 == 0:
        c1.put(tubular(hz(ch[2]), 3.5, 0.02), at)
# the celesta "question" melody as the castle appears
for m, b0_, d in (("F5", 0, 2), ("Gb5", 2, 1), ("F5", 3, 2), ("Db5", 5, 1), ("Bb4", 6, 3), ("C5", 9, 1), ("Db5", 10, 1), ("Eb5", 11, 1), ("F5", 12, 3)):
    c1.put_at(celesta(hz(m), d * q * 1.2, 0.03), X["REVEAL"] + 0.4 + b0_ * q)
c1.put_at(cymbal_swell(1.2, 0.025), X["REVEAL"] - 1.0)
wind_chimes(S, X["REVEAL"] + 0.2, 2.2, vol=0.016, seed=14)
# the strange silence: the music fades almost out on landing and stays thin, then truly stops for the gags
c1.mute(X["CLAP"] - 0.15, X["L4"] + 1.9)                              # claps... nothing; "Hello-o!"... no echo
c1.mute(X["SQUEAK"] - 0.1, X["L7"] - 0.1)                             # Draco's squeak lands in silence
c1.mute(X["TUMMY"] - 0.05, X["CUT_2"] + 0.3)                          # the tummy is the loudest thing here
add(S, tummy_rumble(0.11, 1.1), X["TUMMY"])
add(S, bwomp(hz("F1"), 0.05, 0.6), X["TUMMY"] + 0.55)
add(S, meep(0.045), X["SQUEAK"])
add(S, squeak(0.02), X["SQUEAK"] + 0.18)
# Draco's build-up before the squeak
for k, m in enumerate(("Bb3", "Db4", "F4")):
    c1.put_at(brass(hz(m), 0.16 if k < 2 else 0.4, 0.035), X["L6_END"] - 0.55 + k * 0.15)
c1.put_at(snare_roll(0.45, 0.025), X["SQUEAK"] - 0.5)
c1.render(M)

# =====================================================================
# CUE 2 "Hello, Melody" (CUT_2 - CUT_3): cute, whimsical woodwinds and playful pizzicato.
# G mixolydian, 6/8 at 104 dotted-quarter... felt as a skipping 6/8 (eighths at 312/min).
# Clarinet, bassoon and flute chatter over pizzicato; hushes for her songs and the punchline.
# =====================================================================
c2 = Cue(X["CUT_2"] - 0.2, X["CUT_3"] + 0.2, bpm=104 * 3, fade_in=0.5, fade_out=0.5)
e = c2.beat
bar = 6 * e
bass2 = [("G2", "D3"), ("F2", "C3"), ("C3", "G3"), ("G2", "D3")]
k = 0
start2 = X["PEEK"] - c2.t0
while start2 + k * bar < X["CUT_3"] - c2.t0:
    r, fifth = bass2[k % 4]
    at = start2 + k * bar
    c2.put(pizz(hz(r), 0.35, 0.07), at)
    c2.put(pizz(hz(fifth), 0.3, 0.04), at + 3 * e)
    for j, m in enumerate(("B4", "D5", "B4") if k % 2 == 0 else ("A4", "C5", "A4")):
        c2.put(pizz(hz(m), 0.2, 0.025), at + (1 + j * 2) * e)
    k += 1
# Melody's theme on clarinet, answered by the bassoon and the flute
theme = [("D5", 0, 2), ("G5", 2, 1), ("F5", 3, 2), ("E5", 5, 1), ("D5", 6, 2), ("C5", 8, 1), ("B4", 9, 3)]
for m, b0_, d in theme:
    c2.put_at(clarinet(hz(m), d * e * 0.9, 0.03), X["PEEK"] + 0.1 + b0_ * e)
for m, b0_, d in (("G3", 0, 1), ("A3", 1, 1), ("B3", 2, 1), ("C4", 3, 3)):
    c2.put_at(bassoon(hz(m), d * e * 0.9, 0.04), X["L10"] + 0.4 + b0_ * e)
for m, b0_, d in (("B5", 0, 1), ("C6", 1, 1), ("D6", 2, 2), ("F6", 4, 1), ("E6", 5, 1), ("D6", 6, 3)):
    c2.put_at(flute(hz(m), d * e * 0.9, 0.022), X["L10"] + 2.0 + b0_ * e)
add(S, boing(0.05, 320), X["PEEK"])
for k2, m in enumerate(("G5", "B5", "D6")):
    add(S, glock(hz(m), 0.8, 0.03), X["PEEK"] + 0.05 + k2 * 0.07)
c2.mute(X["SING1"] - 0.2, X["PEEK"])                                # her singing is the only music
c2.mute(X["L11_END"] - 0.4, X["L12_END"] + 0.3)                       # the off-key demo, the held laugh, the punchline
add(S, squeak(0.03), X["STATUE"])                                     # the statue's eyebrow
add(S, record_scratch(0.025, 0.2), X["CRACK"] - 0.02)
for k2 in range(3):                                                   # Kiko's suppressed giggles
    add(S, squeak(0.012), X["HOLD"] + 0.15 + k2 * 0.2)
add(S, bwomp(hz("D2"), 0.04, 0.5), X["L13_END"] - 0.1)                # Melody deflates
c2.render(M)

# =====================================================================
# CUE 3 "The Music Door" (CUT_3 - CUT_4): curious, rhythmic plucked strings and musical notes.
# A dorian, 100 BPM. Harpsichord and pizzicato ostinato, woodblock ticks, harp answers; stops for each gag.
# =====================================================================
c3 = Cue(X["CUT_3"] - 0.2, X["CUT_4"] + 0.2, bpm=100, fade_in=0.4, fade_out=0.5)
q = c3.beat
ost = ["A3", "E4", "G4", "E4", "C4", "E4", "F#4", "E4"]
bass3 = ["A2", "A2", "G2", "D3"]
k = 0
while c3.t0 + 0.2 + k * q / 2 < X["CUT_4"]:
    at = 0.2 + k * q / 2
    c3.put(harpsichord(hz(ost[k % 8]), 0.4, 0.03), at)
    if k % 2 == 0:
        c3.put(pizz(hz(bass3[(k // 8) % 4]), 0.4, 0.06), at)
    if k % 4 == 3:
        c3.put(woodblock(820, 0.025), at)
    k += 1
SYM_NOTES = CASTLE
for i in range(5):                                                   # the pattern: each symbol rings its note
    add(S, glock(hz(SYM_NOTES[i]), 1.2, 0.04), X["PATTERN"] + i * 0.42)
    add(S, blink_ping(0.012), X["PATTERN"] + i * 0.42)
for i in range(3):                                                   # Melody's tail notes: three right notes
    add(S, whoosh(0.25, 0.015), X["TAIL"] + i * 0.45)
    add(S, harp(hz(SYM_NOTES[i]), 2.0, 0.05), X["TAIL"] + 0.2 + i * 0.45)
    add(S, glock(hz(SYM_NOTES[i]) * 2, 1.0, 0.025), X["TAIL"] + 0.2 + i * 0.45)
# Kiko's silly tune on the door: boing, squeak, kazoo, slide whistle, a cowbell-ish clonk
c3.mute(X["TRICK"] - 0.05, X["L16"])
silly = [(boing(0.05, 240), 0.0), (kazoo(hz("C5"), 0.16, 0.04), 0.25), (kazoo(hz("C5"), 0.16, 0.04), 0.45), (squeak(0.04), 0.65),
         (kazoo(hz("G4"), 0.2, 0.045), 0.8), (slide(500, 1300, 0.3, 0.03), 1.05), (woodblock(500, 0.05), 1.4), (woodblock(500, 0.05), 1.55)]
for x, dt in silly:
    add(S, x, X["TRICK"] + dt)
add(S, raspberry(0.06, 0.55), X["BUZZ"])
add(S, buzzer(0.02, 0.3), X["BUZZ"] + 0.05)
# Draco: a little fanfare, then a honk
c3.mute(X["HONK"] - 0.1, X["L17"] - 0.15)
add(S, honk(0.07), X["HONK"])
add(S, honk(0.05), X["HONK"] + 0.42)
# Bobo's dance: a wrong-footed oom-pah under his line (he's off the beat)
for k2 in range(int((X["L17_END"] - X["DANCE"]) / 0.3)):
    add(S, tuba(hz(("A1", "E2")[k2 % 2]), 0.2, 0.05), X["DANCE"] + k2 * 0.3)
    add(S, tek(0.012), X["DANCE"] + 0.13 + k2 * 0.3 * 1.07)           # his feet, never quite on the beat
# together: the five true notes, then the door opens
c3.mute(X["TOGETHER"] - 0.1, X["OPEN"] + 0.2)
for i in range(5):
    at = X["NOTES5"] + i * 0.38
    add(S, harp(hz(CASTLE[i]), 2.4, 0.06), at)
    add(S, glock(hz(CASTLE[i]) * 2, 1.4, 0.035), at)
    add(S, strings([hz(CASTLE[i])], 0.5, 0.02, attack=0.05, release=0.3), at)
harp_gliss(S, X["OPEN"], [n(x) for x in ("A4", "C#5", "E5", "A5", "C#6", "E6", "A6")], step=0.05, vol=0.045)
add(S, reverse_swell(0.6, 0.04), X["OPEN"] - 0.6)
add(S, noise_band(1.4, 60, 260, 0.03), X["OPEN"])                    # the heavy door rumbles open
c3.put_at(choir([hz("A4"), hz("E5")], 1.4, 0.03, attack=0.2, release=0.6), X["OPEN"])
c3.render(M)

# =====================================================================
# CUE 4 "The Hall of Instruments" (CUT_4 - CUT_5): funny orchestra with drums and trumpets, playful pauses.
# A-flat major oom-pah march, 2/4, 120 BPM. Tuba, trumpets, snare, xylophone, timpani; dead stops for the gags.
# =====================================================================
c4 = Cue(X["CUT_4"] - 0.2, X["CUT_5"] + 0.2, bpm=120, fade_in=0.3, fade_out=0.5)
q = c4.beat
march_b = [("Ab1", "Eb2"), ("Db2", "Ab2"), ("Eb2", "Bb2"), ("Ab1", "Eb2")]
march_c = [("C4", "Eb4", "Ab4"), ("Db4", "F4", "Ab4"), ("Db4", "G4", "Bb4"), ("C4", "Eb4", "Ab4")]
k = 0
while c4.t0 + 0.3 + k * q < X["CUT_5"]:
    at = 0.3 + k * q
    r = march_b[(k // 4) % 4]
    c4.put(tuba(hz(r[k % 2]), 0.25, 0.08), at)
    c4.put(strings([hz(x) for x in march_c[(k // 4) % 4]], q * 0.3, 0.02, attack=0.01, release=0.06), at + q / 2)
    if k % 2 == 1:
        c4.put(snap(0.02), at)
    k += 1
tune4 = [("Eb5", 0, 1), ("Ab5", 1, 1), ("C6", 2, 1), ("Ab5", 3, 1), ("Bb5", 4, 0.5), ("C6", 4.5, 0.5), ("Db6", 5, 1), ("C6", 6, 2)]
for m, b0_, d in tune4:
    c4.put_at(brass(hz(m) / 2, d * q * 0.85, 0.03), X["CUT_4"] + 0.3 + b0_ * q)
    c4.put_at(xylo(hz(m), 0.3, 0.025), X["CUT_4"] + 0.3 + b0_ * q)
# Kiko's taps: drum, trumpet, violin, bells, cymbal -> then everything at once
taps = [(tom(130, 0.1), 0.0), (brass(hz("Bb4"), 0.3, 0.05), 0.2), (strings([hz("E5")], 0.3, 0.04, attack=0.02, release=0.15, vib=7), 0.4), (tubular(hz("D5"), 1.4, 0.04), 0.6), (crash(0.03), 0.8)]
for x, dt in taps:
    add(S, x, X["TAPS"] + dt)
c4.mute(X["TAPS"] + 0.95, X["L20"] - 0.1)
for k2 in range(10):                                                 # the cacophony
    add(S, (brass(hz(("C5", "F#4", "Bb4", "D5")[k2 % 4]), 0.18, 0.035) if k2 % 3 == 0 else tom(90 + k2 * 17, 0.07) if k2 % 3 == 1 else strings([hz(("G#5", "D5", "B4")[k2 % 3])], 0.15, 0.03, attack=0.01, release=0.05, vib=9)), X["TAPS"] + 0.95 + k2 * 0.07)
add(S, tubular(hz("C#5"), 1.5, 0.03), X["TAPS"] + 1.2)
add(S, kazoo(hz("D4"), 0.25, 0.03), X["TAPS"] + 1.4)
# Maestro Draco: each flick of his baton makes a wrong noise
c4.mute(X["CONDUCT"] - 0.05, X["BOOM"] + 1.0)
cond = [(timpani(hz("C2"), 0.08, 1.0), 0.0), (brass(hz("G4"), 0.15, 0.05), 0.25), (strings([hz("F#5")], 0.2, 0.04, attack=0.01, release=0.1, vib=9), 0.5), (tom(160, 0.08), 0.7), (tubular(hz("A#4"), 1.0, 0.03), 0.9)]
for x, dt in cond:
    add(S, x, X["CONDUCT"] + dt)
add(S, brass(hz("D5"), 0.45, 0.09, wah=1.0), X["TOOT"])              # the trumpet toots in his face
add(S, slide(900, 300, 0.4, 0.02), X["TOOT"] + 0.35)
for k2 in range(3):                                                  # Bobo tip-toes backwards
    add(S, bassoon(hz(("Eb3", "D3", "Db3")[k2]), 0.14, 0.04), X["BACK"] + k2 * 0.24)
add(S, squeak(0.02), X["SIT"] - 0.05)
add(S, big_boom(0.22), X["BOOM"])                                    # THE BOOM
add(S, boom(0.12), X["BOOM"])
add(S, crash(0.04), X["BOOM"] + 0.05)
add(S, boing(0.05, 150), X["BOOM"] + 0.35)
for k2 in range(5):
    add(S, tubular(hz(("C5", "E5", "G5", "B5", "D6")[k2]), 1.0, 0.012), X["BOOM"] + 0.2 + k2 * 0.05)
c4.mute(X["L22"] - 0.2, X["CUT_5"] + 0.3)
c4.put_at(strings([hz("Ab3"), hz("Cb4"), hz("Eb4")], X["CUT_5"] - X["L22"] + 0.4, 0.02, attack=0.4, release=0.4, tone=1500), X["L22"])
add(S, glass(hz("Eb5"), 1.6, 0.03), X["L22"] + 0.4)
add(S, glass(hz("D5"), 1.6, 0.03), X["L22"] + 0.9)
add(S, glass(hz("Db5"), 1.6, 0.03), X["L22"] + 1.4)
c4.render(M)

# =====================================================================
# CUE 5 "The Lost Melody" (CUT_5 - CUT_6): emotional orchestral build to a musical climax.
# B minor -> E -> A major, 72 BPM. Strings, harp and horn; a hush for Melody's doubt; the climax plays
# the castle melody (A C# E F# E) in full orchestra when the music box starts.
# =====================================================================
c5 = Cue(X["CUT_5"] - 0.2, X["CUT_6"] + 0.2, bpm=72, fade_in=0.6, fade_out=0.6)
q = c5.beat
prog5 = [("B2", ("D4", "F#4", "B4")), ("G2", ("D4", "G4", "B4")), ("E2", ("E4", "G4", "B4")), ("F#2", ("C#4", "F#4", "A#4"))]
nb = int((X["BREATH"] - X["CUT_5"]) / (4 * q)) + 1
for b in range(nb):
    at = 0.25 + b * 4 * q
    root, ch = prog5[b % 4]
    c5.put(strings([hz(x) for x in ch], 4 * q + 0.5, 0.026, attack=0.6, release=0.6, tone=2400), at)
    c5.put(strings([hz(root)], 4 * q + 0.4, 0.03, attack=0.4, release=0.5, tone=800), at)
    for j in range(8):
        c5.put(harp(hz(ch[(0, 1, 2, 1)[j % 4]]) * (2 if j >= 4 else 1), 1.8, 0.016), at + j * q / 2)
# the notes being found: bells low to high, Kiko's bounce, the frozen bell
for i, m in enumerate(("A4", "B4", "C#5", "D5", "E5")):
    add(S, tubular(hz(m), 1.8, 0.035), X["BELLS"] + i * 0.22)
for at in (X["NOTE1"], X["NOTE2"], X["NOTE3"]):
    add(S, ding(0.04), at)
    harp_gliss(S, at, [n(x) for x in ("A5", "C#6", "E6")], step=0.05, vol=0.03)
add(S, big_boom(0.07), X["BOUNCE"])
add(S, boing(0.06, 220), X["BOUNCE"] + 0.05)
add(S, slide(400, 1400, 0.5, 0.025), X["BOUNCE"] + 0.1)
add(S, clink(0.04), X["PREP"] - 0.3)                                  # the frozen bell only clunks
add(S, fizzle(0.025, 0.5), X["PUFF"])
add(S, glass(hz("E6"), 1.0, 0.03), X["PUFF"] + 0.25)                  # ice melting
add(S, tubular(hz("E5"), 2.6, 0.05), X["PUFF"] + 0.55)                # it rings!
# the joke, between the finding and the singing
c5.mute(X["L27"] - 0.1, X["L27_END"] + 0.25)
add(S, brass(hz("F#3"), 0.35, 0.05, wah=1.0), X["L27_END"] - 0.05)
add(S, brass(hz("E3"), 0.5, 0.05, wah=1.0), X["L27_END"] + 0.3)
for i in range(3):
    add(S, harp(hz(("A5", "C#6", "E6")[i]), 1.6, 0.03), X["PLACE"] + i * 0.3)
    add(S, chime(hz(("A5", "C#6", "E6")[i]), 0.03), X["PLACE"] + i * 0.3)
# Melody's doubt and Lumi's encouragement: only soft strings and a horn
c5.mute(X["L28"] - 0.2, X["BREATH"] + 0.2, ramp=0.4)
c5.put_at(strings([hz(x) for x in ("B3", "D4", "F#4")], X["L29"] - X["L28"] + 0.3, 0.024, attack=0.8, release=0.5, tone=1800), X["L28"])
c5.put_at(strings([hz(x) for x in ("G3", "B3", "D4", "E4")], X["BREATH"] - X["L29"] + 0.5, 0.026, attack=0.6, release=0.5, tone=2000), X["L29"])
for m, at, d in (("D4", 0.3, 0.9), ("E4", 1.2, 0.6), ("F#4", 1.8, 1.4)):
    c5.put_at(brass(hz(m), d, 0.025, scoop=False), X["L29"] + at)
# the sung note: a hush, a held E pedal under her voice, rising strings and choir as the notes combine
c5.put_at(strings([hz("E3"), hz("B3"), hz("E4")], X["RESTORE"] - X["SING3"] + 0.2, 0.02, attack=1.0, release=0.2, tone=2200), X["SING3"])
c5.put_at(choir([hz("E4"), hz("G#4"), hz("B4")], X["RESTORE"] - X["COMBINE"], 0.025, attack=0.6, release=0.2), X["COMBINE"])
c5.put_at(timp_roll(hz("E2"), X["RESTORE"] - X["COMBINE"], 0.035), X["COMBINE"])
add(S, reverse_swell(1.0, 0.04), X["RESTORE"] - 1.0)
add(S, wind_up(0.9, 0.025), X["RESTORE"] - 0.95)                      # the music box winds itself
# RESTORE: the castle melody, music box + full orchestra in A major
add(S, boom(0.12), X["RESTORE"])
add(S, crash(0.05), X["RESTORE"])
c5.put_at(strings([hz(x) for x in ("A2", "E3", "A3", "C#4", "E4", "A4")], X["CUT_6"] - X["RESTORE"] + 0.4, 0.045, attack=0.05, release=0.8), X["RESTORE"])
c5.put_at(choir([hz("C#5"), hz("E5"), hz("A5")], 1.6, 0.03, attack=0.1, release=0.6), X["RESTORE"])
for i, m in enumerate(CASTLE):
    c5.put_at(music_box(hz(m) * 2, 2.0, 0.06), X["RESTORE"] + i * 0.26)
    c5.put_at(brass(hz(m), 0.3 if i < 4 else 0.8, 0.04), X["RESTORE"] + i * 0.26)
harp_gliss(S, X["RESTORE"], [n(x) for x in ("A5", "C#6", "E6", "A6", "C#7", "E7")], step=0.06, vol=0.04)
sparkle(S, X["RESTORE"], 1.6, density=22, vol=0.03)
c5.render(M)

# =====================================================================
# CUE 6 "The Castle Sings Again" (CUT_6 - PROJECT): joyful, energetic orchestra with a satisfying ending.
# B-flat major, 140 BPM, 4/4. Brass melody, strings, glockenspiel, tambourine and claps, a walking tuba.
# Dead stops for the cushion landing and the banana music box; a big final cadence before the teaser.
# =====================================================================
c6 = Cue(X["CUT_6"] - 0.2, X["PROJECT"], bpm=140, fade_in=0.2, fade_out=0.4)
q = c6.beat
prog6 = [("Bb1", ("D4", "F4", "Bb4")), ("G1", ("D4", "G4", "Bb4")), ("Eb2", ("Eb4", "G4", "Bb4")), ("F1", ("C4", "F4", "A4"))]
walk = ["Bb", "D", "F", "D"]
k = 0
while c6.t0 + 0.2 + k * q < X["PROJECT"]:
    at = 0.2 + k * q
    root, ch = prog6[(k // 4) % 4]
    c6.put(tuba(hz(root) * 2 * (1, 1.26, 1.5, 1.26)[k % 4], 0.25, 0.07), at)
    if k % 2 == 1:
        c6.put(clap(0.022), at)
        c6.put(strings([hz(x) for x in ch], q * 0.6, 0.026, attack=0.02, release=0.15), at)
    c6.put(tamb(0.01), at + q / 2)
    if k % 4 == 0:
        c6.put(glock(hz(ch[2]) * 2, 1.2, 0.02), at)
    k += 1
mel6 = [("F5", 0, 1), ("Bb5", 1, 1), ("D6", 2, 2), ("C6", 4, 1), ("Bb5", 5, 1), ("G5", 6, 2), ("A5", 8, 1), ("Bb5", 9, 1), ("C6", 10, 1), ("D6", 11, 1), ("F6", 12, 4)]
for m, b0_, d in mel6:
    c6.put(brass(hz(m) / 2, d * q * 0.9, 0.032), 0.3 + b0_ * q)
harp_gliss(S, X["CUT_6"], [n(x) for x in ("Bb4", "D5", "F5", "Bb5", "D6", "F6", "Bb6")], step=0.06, vol=0.04)
add(S, noise_band(3.0, 400, 5000, 0.012), X["ALIVE"] + 0.3)          # the fountains start flowing
wind_chimes(S, X["ALIVE"] + 0.4, 2.2, vol=0.02, seed=41)
sparkle(S, X["ALIVE"], 2.6, density=18, vol=0.025)
add(S, whirl(0.7, 0.04), X["SPIN"])
c6.mute(X["CUSHION"] - 0.05, X["LAUGH"])
add(S, pomf(0.1), X["CUSHION"])
add(S, pomf(0.05), X["CUSHION"] + 0.12)
for k2 in range(6):
    add(S, clap(0.018), X["LAUGH"] + k2 * 0.17)
# the banana music box: a wind-up, then a silly bouncy tune on kazoo and music box, ending with a boing
c6.mute(X["L32"] - 0.1, X["PROJECT"])
add(S, wind_up(0.4, 0.025), X["BTUNE"] - 0.2)
banana = [("D5", 0.0), ("F5", 0.18), ("D5", 0.36), ("Bb4", 0.54), ("C5", 0.72), ("D5", 0.9), ("F5", 1.08), ("Bb5", 1.3)]
for m, dt in banana:
    add(S, music_box(hz(m), 1.0, 0.05), X["BTUNE"] + dt)
    add(S, kazoo(hz(m), 0.14, 0.02), X["BTUNE"] + dt)
add(S, boing(0.05, 300), X["BTUNE"] + 1.55)
c6.render(M)

# the teaser: a floating flower garden over a lake, E lydian, unresolved
tz = Cue(X["PROJECT"] - 0.1, DUR, bpm=76, fade_in=0.2, fade_out=0.05)
q = tz.beat
tz.put(strings([hz(x) for x in ("E3", "B3", "G#4", "A#4")], DUR - X["PROJECT"], 0.026, attack=1.0, release=0.4, tone=2000), 0.1)
for k2, m in enumerate(("B5", "D#6", "E6", "F#6", "G#6", "A#6", "B6", "D#7")):
    tz.put(harp(hz(m), 2.2, 0.03), 0.15 + k2 * q / 2)
tz.put_at(choir([hz("G#4"), hz("D#5")], DUR - X["L34"], 0.02, attack=0.8, release=0.3), X["L34"] - 0.3)
for b0_, m in enumerate(("E6", "G#6", "A#6", "B6", "D#7")):
    tz.put_at(celesta(hz(m), 1.8, 0.03), X["END"] + b0_ * 0.4)
tz.render(M)
add(S, whoosh(0.6, 0.05), X["PROJECT"] - 0.2)
sparkle(S, X["PROJECT"], 1.5, density=10, vol=0.02)
sparkle(S, X["END"], 2.0, density=8, vol=0.015)

# =====================================================================
# Sound effects and ambience
# =====================================================================
add(S, whoosh(1.0, 0.08), X["JUMP"])
add(S, reverse_swell(0.8, 0.05), X["CUT_1"] - 0.8)
sparkle(S, X["CUT_1"] - 0.5, 1.2, density=20, vol=0.03)
add(S, whoosh(1.4, 0.05), X["CUT_1"] + 0.2)                          # through the clouds
add(S, pop(0.05), X["LAND"])
add(S, pomf(0.04), X["LAND"] + 0.12)
add(S, steady_wind(X["CUT_4"] - X["CUT_1"], 0.006), X["CUT_1"])       # thin high air outside the castle
add(S, whoosh(0.5, 0.04), X["CUT_3"])
add(S, whoosh(0.5, 0.04), X["CUT_4"])
add(S, whoosh(0.5, 0.04), X["CUT_5"])

with open(os.path.join(ROOT, "src", "ep14", "cues.json"), "w") as f:
    json.dump({k: round(v, 3) for k, v in sorted(T.items(), key=lambda kv: kv[1])}, f, indent=1)

import wave as _wave
os.makedirs(os.path.join(ROOT, "build", "ep14"), exist_ok=True)
with _wave.open(os.path.join(ROOT, "build", "ep14", "music_stem.wav"), "wb") as w:
    w.setnchannels(1)
    w.setsampwidth(2)
    w.setframerate(SR)
    w.writeframes((np.clip(M / (np.max(np.abs(M)) + 1e-9), -1, 1) * 32767).astype(np.int16).tobytes())

print(f"DUR {DUR}s")
t.finish(mouth_style="v2")
