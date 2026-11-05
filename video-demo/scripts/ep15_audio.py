from audio_kit import *
from score_kit import *
import json

# Episode 15: The Secret of the Floating Flower Garden
# Six new cues, each with its own key, metre, tempo and instruments, none of them used for a scene in Episodes 9-14:
#   1 Garden arrival   D-flat major, 6/8, 69 BPM   harp arpeggios, flute melody, soft high strings
#   2 Meeting Petal    E-flat major, 2/4, 112 BPM  oboe and clarinet duet, bassoon bass, celesta and glockenspiel bells
#   3 Flower islands   D major, 6/8, 138 BPM       marimba ostinato, pizzicato bass, xylophone answers, woodblock
#   4 Missing crystal  F-sharp minor, 84 BPM       frame drum and shaker, glass harmonica tones, celesta, low strings
#   5 Bloom Crystal    E minor -> C -> G major, 64 BPM: strings, horn, harp, choir, timpani roll, full climax
#   6 Celebration      F major, 126 BPM            flute and brass tune, string chords, glockenspiel, tambourine, walking pizz
# plus an E lydian bridge from Episode 14's teaser and a F-sharp lydian Starlight Island teaser.
# Dialogue was calibrated per line to about 4.45 syllables/s (build/ep15/calib.py).
#
# The timing is laid out here from the measured length of every line. Every named moment is written to
# src/ep15/cues.json, which src/ep15/Episode.tsx reads, so the picture and the sound share one clock.

DUR_MAX = 150.0
t = Soundtrack("ep15", duration=DUR_MAX, seed=1515)
T = {}
cur = [0.0]


def say(lid, who, gap, name=None):
    s = cur[0] + gap
    cur[0] = t.line(lid, who, s)
    T[name or lid.upper()] = s
    T[(name or lid.upper()) + "_END"] = cur[0]
    return s


def ev(name, gap, hold=0.0):
    T[name] = cur[0] + gap
    cur[0] = T[name] + hold
    return T[name]


def mark(name, at):
    T[name] = at
    return at


# ---------------- Scene 0: the music box's image of the garden (where Episode 14 ended) ----------------
mark("FLARE", 0.0)
say("l1", "melody", 0.45)                   # "Bye, friends! Say hello to the flowers for me!"
say("l2", "lumi", 0.35)                     # "Thank you, Melody! To the flower garden!"
ev("JUMP", -0.3)
ev("CUT_1", 1.2)
# ---------------- Scene 1: the floating flower garden ----------------
mark("REVEAL", T["CUT_1"] + 0.15)           # out of the glow: the whole garden above the lake
ev("LAND", 3.0)                             # soft landing on the big meadow island
say("l3", "lumi", 0.45)                     # "Wow! A whole garden, floating above a lake!"
ev("BANANA", 0.25, 0.55)                    # Bobo spots the banana-shaped flower: big eyes
say("l4", "bobo", 0.0)                      # "This garden is beautiful! Do they grow banana trees here?"
ev("SNIFF", 0.2, 1.05)                      # he tiptoes up and leans in to sniff it
say("l5", "kiko", 0.0)                      # "Careful, Bobo! That flower might bite!"
ev("JUMPBACK", 0.05, 0.95)                  # the flower twitches; Bobo leaps behind Draco
say("l6", "draco", 0.15)                    # "Relax! I know everything about flowers!"
ev("DSNIFF", 0.2, 1.15)                     # a long, proud sniff of a giant pink flower
say("l7", "draco", 0.0)                     # "Ah... ahh... ah-CHOO!"
mark("ACHOO", T["L7_END"] - 0.3)            # a pollen cloud: Draco stands there, yellow
ev("DUSTY", 0.15, 1.05)                     # deadpan, dusty, one petal drifts down
ev("FADE", 0.15, 0.55)                      # the flowers are closing, colours draining
say("l8", "lumi", 0.0)                      # "Oh no... the flowers are closing, and losing their colours!"
ev("CUT_2", 0.45)
# ---------------- Scene 2: meeting Petal ----------------
ev("RUSTLE", 0.35, 0.95)                    # a giant pink flower wiggles and giggles
ev("PEEK", 0.0, 0.45)                       # its petals open: Petal pops up
say("l9", "petal", 0.0)                     # "Hello! I'm Petal, guardian of the Floating Flower Garden!"
say("l10", "petal", 0.35)                   # "Our Bloom Crystal stopped shining. The whole garden is fading!"
say("l11", "petal", 0.45)                   # "Watch my flower magic! Ah... ahh..."
ev("HOLDS", 0.1, 0.55)                      # everyone leans in... the nose twitches...
say("l12", "petal", 0.0, "CHOO1")           # "ah-CHOO!"
mark("STORM", T["CHOO1_END"] - 0.35)            # a petal storm fills the screen
ev("STORMEND", 0.0, 1.45)
ev("COVERED", 0.0, 0.55)                    # Bobo, completely covered in petals, blinks
say("l13", "kiko", 0.0)                     # "Bobo, I think you've become a walking flower!"
say("l14", "bobo", 0.35)                    # "At least I smell delicious!"
ev("BLUSH", 0.15, 1.0)                      # Petal blushes and hides behind her wings
ev("CUT_3", 0.0)
# ---------------- Scene 3: the garden of giant flowers ----------------
say("l15", "petal", 0.55)                   # "Follow me! Every island has its own magic flower!"
ev("HOPS", 0.15, 1.75)                      # hopping across the lily-pad stepping stones; pollen orbs everywhere
ev("BUD", 0.1, 0.35)                        # Bobo sees a giant yellow bud
say("l16", "bobo", 0.0)                     # "Ooh! A giant banana!"
ev("HUG", 0.1, 0.85)                        # he hugs it and tries to peel it
ev("BLOOM1", 0.0, 1.35)                     # it blooms open into a flower in his arms. Deadpan.
ev("PRANK", 0.15, 1.35)                     # Kiko sneaks a big petal crown onto Draco's head
say("l17", "draco", 0.05)                   # "Behold! I am the Flower Dragon!"
ev("NOSE", 0.2, 0.75)                       # a flower drifts down onto his nose; cross-eyed
say("l18", "draco", 0.0)                    # "Ah... ah-CHOO!"
mark("DSNEEZE", T["L18_END"] - 0.3)         # he sneezes himself into a backward somersault
ev("FLIP", 0.0, 0.55)
say("l19", "petal", 0.3, "CHOO2")           # "Ahh... ah-CHOO!"
mark("FLOAT", T["CHOO2_END"] - 0.25)        # her sneeze lifts everyone gently into the air
ev("FLOATING", 0.0, 2.5)
ev("CUT_4", 0.0)
# ---------------- Scene 4: the missing Bloom Crystal ----------------
say("l20", "petal", 0.55)                   # "The Bloom Crystal is under the lake, behind the flower gate!"
ev("GATE", 0.15, 0.9)                       # the flower gate: four empty flower sockets, four carvings glowing in turn
say("l21", "lumi", 0.0)                     # "The flowers glow in order: pink, yellow, blue, purple!"
ev("ORB1", 0.2, 0.75)                       # Lumi places the pink orb
ev("KTAP", 0.15, 0.55)                      # Kiko "helps" and taps a giant flower...
ev("LAUNCH", 0.0, 1.35)                     # ...which springs open and launches Bobo into a petal cloud
say("l22", "bobo", 0.0)                     # "I came to save a garden, not become gardening equipment!"
ev("DFIRE", 0.3, 0.6)                       # Draco warms a flower with a tiny flame...
ev("SNAP", 0.0, 0.85)                       # ...it snaps shut in a huff
ev("ORBS", 0.15, 1.65)                      # yellow, blue, purple: the orbs go in
ev("OPENGATE", 0.0, 1.7)                    # the gate blooms open; the water parts into a stair
ev("CUT_5", 0.0)
# ---------------- Scene 5: restoring the Bloom Crystal ----------------
say("l23", "petal", 0.8)                    # "The crystal is so dark... What if my magic is gone?"
say("l24", "lumi", 0.45)                    # "Your magic is still inside you, Petal. We believe in you!"
ev("POSITION", 0.3, 1.7)                    # Bobo, Draco and Kiko set the four pollen orbs around the crystal
ev("BREATH", 0.15, 0.75)                    # Petal takes a deep breath
ev("CREATE", 0.0, 1.6)                      # a glowing flower grows in her hands
ev("STREAM", 0.0, 1.0)                      # a stream of colourful light
ev("RESTORE", 0.0, 1.9)                     # the Bloom Crystal blazes; the chamber blooms
ev("BOING", 0.0, 0.85)                      # a giant flower opens under Bobo and bounces him up
say("l25", "bobo", 0.0)                     # "I think the flowers are trying to eat me!"
ev("CUT_6", 0.45)
# ---------------- Scene 6: the garden celebration ----------------
mark("ALIVE", T["CUT_6"] + 0.1)             # the whole garden blooms: waterfalls, butterflies, sparkling lake
ev("PARTY", 3.3)                            # back with the friends: dancing, Petal flying loops
ev("KHIDE", 1.05, 0.45)                     # a giant flower wiggles...
say("l26", "kiko", 0.0)                     # "Surprise!"
mark("JUMP2", T["L26"] + 0.1)               # everyone jumps
ev("JUMPED", 0.0, 0.5)
say("l27", "draco", 0.1)                    # "Time for my heroic landing!"
ev("DIVE", 0.1, 0.85)                       # up, a pose, a dive...
ev("PLOP", 0.0, 1.05)                       # ...into a pile of soft petals; only his tail sticks out
say("l28", "bobo", 0.15)                    # "Ooh! A golden banana flower!"
ev("PICK", 0.15, 0.6)                       # he reaches to pick it
ev("CLOSE", 0.0, 1.15)                      # it closes gently around his paw. He looks at us.
ev("LAUGH", 0.0, 1.2)                       # everyone laughs
ev("PROJECT", 0.1, 0.5)                     # the Bloom Crystal's light projects the Starlight Island
say("l29", "lumi", 0.0)                     # "An island in the stars? I wonder what magic is waiting there!"
ev("END", 0.25)
say("l30", "narrator", 0.25)                # "Next time... the secret of the Starlight Island!"
DUR = round(cur[0] + 1.7, 1)
mark("DUR", DUR)

t.duration = DUR
t.n = int(SR * DUR)
t.music = t.music[: t.n]
t.sfx = t.sfx[: t.n]
for k in t.voice:
    t.voice[k] = t.voice[k][: t.n]

M = t.music
S = t.sfx
n = note
X = T


# ---------------- the episode's own sound effects ----------------
def slide(f0, f1, dur, vol=0.04):
    """A slide whistle."""
    tt = np.arange(int(dur * SR)) / SR
    f = np.geomspace(f0, f1, len(tt)) * (1 + 0.012 * np.sin(2 * np.pi * 7 * tt))
    ph = 2 * np.pi * np.cumsum(f) / SR
    return ((np.sin(ph) + 0.25 * np.sin(2 * ph)) * np.minimum(tt / 0.03, 1) * np.minimum((dur - tt) / 0.05, 1) * vol).astype(np.float32)


def bloom_open(vol=0.04, dur=0.9, lo=300, hi=2600):
    """A flower opening: a soft, rising, papery swell with a breathy top."""
    tt = np.arange(int(dur * SR)) / SR
    x = np.random.default_rng(int(lo + hi)).standard_normal(len(tt))
    out = np.zeros_like(x)
    hop = 512
    for i in range(0, len(x), hop):
        fc = lo + (hi - lo) * (i / len(x)) ** 0.7
        b, a = signal.butter(2, [fc * 0.7 / (SR / 2), min(fc * 1.5, SR / 2 - 100) / (SR / 2)], "band")
        out[i : i + hop] = signal.lfilter(b, a, x[i : i + hop])
    env = np.sin(np.pi * np.minimum(tt / dur, 1)) ** 1.2
    return (out / (np.abs(out).max() + 1e-9) * env * vol).astype(np.float32)


def bloom_close(vol=0.04, dur=0.45):
    """A flower snapping shut: a falling papery swish and a soft 'thup'."""
    x = bloom_open(vol, dur, 2400, 400)
    tt = np.arange(int(0.18 * SR)) / SR
    thup = np.sin(2 * np.pi * np.cumsum(180 + 120 * np.exp(-tt * 40)) / SR) * np.exp(-tt * 28) * vol * 1.2
    out = np.zeros(len(x) + len(thup), dtype=np.float32)
    out[: len(x)] += x
    out[len(x) - int(0.05 * SR) : len(x) - int(0.05 * SR) + len(thup)] += thup.astype(np.float32)
    return out


def splash(vol=0.05, dur=0.8):
    """Water splash: a noisy burst, then droplets."""
    tt = np.arange(int(dur * SR)) / SR
    x = np.random.default_rng(9).standard_normal(len(tt))
    b, a = signal.butter(2, [500 / (SR / 2), 6000 / (SR / 2)], "band")
    x = signal.lfilter(b, a, x) * np.exp(-tt * 7) * np.minimum(tt / 0.005, 1)
    out = (x / (np.abs(x).max() + 1e-9) * vol).astype(np.float32)
    for k in range(5):
        add(out, water_drop(vol * 0.5), 0.12 + k * 0.11)
    return out


def sniff(vol=0.03, dur=0.9):
    """A long, proud sniff: rising breathy noise."""
    tt = np.arange(int(dur * SR)) / SR
    x = np.random.default_rng(3).standard_normal(len(tt))
    b, a = signal.butter(2, [1500 / (SR / 2), 7000 / (SR / 2)], "band")
    x = signal.lfilter(b, a, x) * (0.3 + 0.7 * tt / dur) * np.minimum((dur - tt) / 0.06, 1) * (0.8 + 0.2 * np.sin(2 * np.pi * 9 * tt))
    return (x / (np.abs(x).max() + 1e-9) * vol).astype(np.float32)


def giggle(vol=0.02):
    """A tiny hidden giggle (the wiggling flower)."""
    out = np.zeros(int(0.7 * SR), dtype=np.float32)
    for k in range(4):
        add(out, squeak(vol), k * 0.12)
    return out


PINK, YELLOW, BLUE, PURPLE = "A5", "C#6", "E6", "G#6"   # the four flower notes of the gate

# =====================================================================
# BRIDGE (0 - CUT_1): Episode 14's E lydian teaser, rising into the jump
# =====================================================================
b0 = Cue(0.0, X["CUT_1"] + 0.3, bpm=76, fade_in=0.01, fade_out=0.5)
add(S, boom(0.1), 0.0)
harp_gliss(S, 0.0, [n(x) for x in ("E5", "G#5", "A#5", "B5", "D#6", "E6")], step=0.045, vol=0.045)
b0.put(strings([hz(x) for x in ("E3", "B3", "G#4", "A#4")], X["JUMP"] + 0.3, 0.024, attack=0.5, release=0.5, tone=2000), 0.05)
for k, m in enumerate(("B5", "D#6", "E6", "F#6", "G#6", "A#6", "B6", "G#6")):
    b0.put(celesta(hz(m), 1.6, 0.03), 0.15 + k * 0.4)
for k, m in enumerate(("E5", "G#5", "A#5", "B5", "D#6", "E6", "G#6", "B6")):
    b0.put_at(harp(hz(m), 1.2, 0.03), X["JUMP"] + k * 0.07)
b0.render(M)

# =====================================================================
# CUE 1 "The Floating Garden" (CUT_1 - CUT_2): dreamy orchestral, harp, flute, gentle strings.
# D-flat major, 6/8 felt in two at 69 dotted-quarters (eighths at 207/min).
# =====================================================================
c1 = Cue(X["CUT_1"] - 0.2, X["CUT_2"] + 0.2, bpm=207, fade_in=0.5, fade_out=0.6)
e = c1.beat
bar = 6 * e
prog1 = [("Db2", ("Db4", "F4", "Ab4")), ("Bb1", ("Db4", "F4", "Bb4")), ("Gb2", ("Db4", "Gb4", "Bb4")), ("Ab2", ("C4", "Eb4", "Ab4"))]
nb = int((X["CUT_2"] - X["CUT_1"] + 0.4) / bar) + 1
for b in range(nb):
    at = 0.2 + b * bar
    root, ch = prog1[b % 4]
    c1.put(strings([hz(x) * 2 for x in ch], bar + 0.6, 0.016, attack=0.8, release=0.8, tone=4200, vib=4.8), at)
    c1.put(strings([hz(root) * 2], bar + 0.5, 0.026, attack=0.5, release=0.6, tone=900), at)
    arp = [ch[0], ch[1], ch[2], ch[1], ch[2], ch[0]]
    for j, m in enumerate(arp):
        c1.put(harp(hz(m) * (2 if j in (2, 4) else 1), 1.8, 0.017), at + j * e)
# the flute's dreamy theme over the reveal
theme1 = [("Ab5", 0, 3), ("F5", 3, 2), ("Gb5", 5, 1), ("Ab5", 6, 3), ("Bb5", 9, 2), ("Ab5", 11, 1), ("F5", 12, 3), ("Eb5", 15, 3), ("Db5", 18, 6)]
for m, b0_, d in theme1:
    c1.put_at(flute(hz(m), d * e * 0.95, 0.03), X["REVEAL"] + 0.3 + b0_ * e)
c1.put_at(cymbal_swell(1.2, 0.022), X["REVEAL"] - 1.0)
harp_gliss(S, X["REVEAL"], [n(x) for x in ("Db5", "F5", "Ab5", "Db6", "F6", "Ab6", "Db7")], step=0.06, vol=0.04)
wind_chimes(S, X["REVEAL"] + 0.4, 2.4, vol=0.014, seed=15)
add(S, flutter_wings(1.4, 0.02, 15), X["REVEAL"] + 1.0)                 # butterflies
add(S, flutter_wings(1.0, 0.015, 17), X["L3"] + 0.4)
# Bobo and the banana flower
for k2, m in enumerate(("Db6", "F6", "Ab6")):
    add(S, glock(hz(m), 0.9, 0.025), X["BANANA"] + k2 * 0.08)
c1.mute(X["SNIFF"] + 0.1, X["L5"] + 0.1)                                 # silence for the sniff
for k2 in range(4):                                                       # tiptoe
    add(S, pizz(hz(("Ab3", "Bb3", "C4", "Db4")[k2]), 0.2, 0.04), X["SNIFF"] + k2 * 0.18)
add(S, sniff(0.025, 0.4), X["SNIFF"] + 0.7)
add(S, bloom_close(0.04, 0.3), X["JUMPBACK"])                              # the flower twitches "hmph"
add(S, slide(1600, 500, 0.35, 0.03), X["JUMPBACK"] + 0.15)
add(S, whoosh(0.4, 0.04), X["JUMPBACK"] + 0.2)
add(S, pomf(0.04), X["JUMPBACK"] + 0.55)
# Draco's proud sniff and the sneeze
c1.mute(X["DSNIFF"] + 0.2, X["DUSTY"] + 1.0)
for k2, m in enumerate(("Db4", "F4", "Ab4", "Db5")):
    add(S, brass(hz(m), 0.14 if k2 < 3 else 0.4, 0.03), X["L6_END"] - 0.5 + k2 * 0.13)
add(S, sniff(0.035, 1.0), X["DSNIFF"] + 0.1)
add(S, achoo(0.09), X["ACHOO"])
add(S, noise_band(1.0, 300, 3000, 0.03) * np.exp(-np.linspace(0, 4, int(SR * 1.0))).astype(np.float32), X["ACHOO"] + 0.05)
sparkle(S, X["ACHOO"], 0.8, density=16, vol=0.02, lo=2500, hi=6000)       # pollen sparkles
add(S, slide(900, 700, 0.6, 0.012), X["DUSTY"] + 0.3)                       # one petal drifting down
add(S, blink_ping(0.012), X["DUSTY"] + 0.85)
# the garden is fading: the music turns minor and thins out
c1.mute(X["FADE"] - 0.1, X["CUT_2"] + 0.3)
c1.put_at(strings([hz(x) for x in ("Bb3", "Db4", "F4")], X["CUT_2"] - X["FADE"] + 0.3, 0.02, attack=0.5, release=0.4, tone=1400), X["FADE"])
for k2, m in enumerate(("F5", "Eb5", "Db5", "C5")):
    add(S, celesta(hz(m), 1.2, 0.02), X["FADE"] + k2 * 0.5)
add(S, bloom_close(0.03, 0.9), X["FADE"] + 0.1)
c1.render(M)

# =====================================================================
# CUE 2 "Meeting Petal" (CUT_2 - CUT_3): cute, whimsical woodwinds and soft bells.
# E-flat major, 2/4 at 112. Oboe and clarinet duet over a bassoon bass, celesta and glockenspiel sparkles.
# =====================================================================
c2 = Cue(X["CUT_2"] - 0.2, X["CUT_3"] + 0.2, bpm=112, fade_in=0.4, fade_out=0.5)
q = c2.beat
bass2 = ["Eb2", "Bb2", "Ab2", "Bb2", "C3", "G2", "Ab2", "Bb2"]
k = 0
while c2.t0 + 0.2 + k * q < X["CUT_3"]:
    at = 0.2 + k * q
    c2.put(bassoon(hz(bass2[(k // 2) % 8]) * (1 if k % 2 == 0 else 1.5), 0.22, 0.045), at)
    if k % 2 == 1:
        c2.put(pizz(hz(("G4", "Bb4", "Ab4", "Bb4")[(k // 2) % 4]), 0.2, 0.022), at)
    k += 1
theme2 = [("Bb4", 0, 0.5), ("Eb5", 0.5, 0.5), ("G5", 1, 1), ("F5", 2, 0.5), ("Eb5", 2.5, 0.5), ("F5", 3, 1), ("G5", 4, 0.5), ("Ab5", 4.5, 0.5), ("Bb5", 5, 1.5)]
for m, b0_, d in theme2:
    c2.put_at(oboe(hz(m), d * q * 0.9, 0.03), X["PEEK"] + 0.15 + b0_ * q)
for m, b0_, d in (("G4", 0, 0.5), ("Bb4", 0.5, 0.5), ("Eb5", 1, 1), ("D5", 2, 0.5), ("C5", 2.5, 0.5), ("Bb4", 3, 2)):
    c2.put_at(clarinet(hz(m), d * q * 0.9, 0.028), X["L10"] + 0.3 + b0_ * q)
for k2 in range(8):
    c2.put_at(celesta(hz(("Eb6", "G6", "Bb6", "G6")[k2 % 4]), 1.0, 0.016), X["L9"] + 0.2 + k2 * q)
# the wiggling flower and the peek
for k2 in range(5):
    add(S, bloom_close(0.012, 0.2), X["RUSTLE"] + k2 * 0.18)
add(S, giggle(0.018), X["RUSTLE"] + 0.4)
add(S, bloom_open(0.05, 0.6), X["PEEK"] - 0.25)
add(S, boing(0.04, 360), X["PEEK"])
for k2, m in enumerate(("Eb6", "G6", "Bb6", "Eb7")):
    add(S, glock(hz(m), 0.9, 0.025), X["PEEK"] + 0.05 + k2 * 0.06)
add(S, flutter_wings(0.8, 0.02, 22), X["PEEK"] + 0.2)
# the sneeze build-up and the petal storm
c2.mute(X["L11"] + 1.1, X["STORMEND"] + 0.2)
c2.put_at(strings([hz("Bb4")], 1.3, 0.02, attack=0.6, release=0.1, trem=1.0), X["L11"] + 1.1)
c2.put_at(snare_roll(0.6, 0.02), X["HOLDS"])
add(S, achoo(0.1), X["CHOO1_END"] - 0.4)
add(S, whoosh(1.6, 0.1), X["STORM"])
add(S, whirl(1.3, 0.04), X["STORM"] + 0.1)
sparkle(S, X["STORM"], 1.4, density=20, vol=0.025)
for k2 in range(6):
    add(S, pop(0.02), X["STORMEND"] + 0.15 + k2 * 0.07)                    # petals settling
add(S, blink_ping(0.015), X["COVERED"] + 0.15)                             # the blink in the petal heap
add(S, blink_ping(0.015), X["COVERED"] + 0.4)
c2.mute(X["L14"] - 0.1, X["L14_END"] + 0.1)
add(S, sniff(0.02, 0.4), X["L14_END"] + 0.05)
add(S, bwomp(hz("Eb2"), 0.03, 0.4), X["BLUSH"] + 0.1)                      # Petal's embarrassed squeak
add(S, squeak(0.02), X["BLUSH"] + 0.05)
c2.render(M)

# =====================================================================
# CUE 3 "Islands of Giant Flowers" (CUT_3 - CUT_4): playful adventure, marimba and pizzicato.
# D major, 6/8 at 138 (eighths at 414/min felt as a skipping two). Marimba ostinato, pizz bass, xylophone, woodblock.
# =====================================================================
c3 = Cue(X["CUT_3"] - 0.2, X["CUT_4"] + 0.2, bpm=414, fade_in=0.3, fade_out=0.5)
e = c3.beat
bar = 6 * e
prog3 = [("D2", ("D4", "F#4", "A4")), ("G2", ("D4", "G4", "B4")), ("A2", ("C#4", "E4", "A4")), ("D2", ("D4", "F#4", "A4"))]
k = 0
while c3.t0 + 0.2 + k * bar < X["CUT_4"]:
    at = 0.2 + k * bar
    root, ch = prog3[k % 4]
    c3.put(pizz(hz(root), 0.4, 0.07), at)
    c3.put(pizz(hz(root) * 1.5, 0.3, 0.045), at + 3 * e)
    pat = [ch[0], ch[2], ch[1], ch[2], ch[0], ch[1]]
    for j, m in enumerate(pat):
        c3.put(marimba(hz(m) * 2, 0.5, 0.03 if j % 3 == 0 else 0.022), at + j * e)
    c3.put(woodblock(1100, 0.012), at + 5 * e)
    k += 1
tune3 = [("A5", 0, 1), ("B5", 1, 1), ("A5", 2, 1), ("F#5", 3, 2), ("D5", 5, 1), ("E5", 6, 2), ("F#5", 8, 1), ("A5", 9, 3)]
for m, b0_, d in tune3:
    c3.put_at(xylo(hz(m), 0.3, 0.026), X["CUT_3"] + 0.5 + b0_ * e * 2)
    c3.put_at(xylo(hz(m), 0.3, 0.02), X["HOPS"] + b0_ * e * 2)
for k2 in range(5):                                                          # lily-pad hops
    add(S, boing(0.025, 420 + k2 * 40), X["HOPS"] + 0.1 + k2 * 0.33)
    add(S, water_drop(0.03), X["HOPS"] + 0.18 + k2 * 0.33)
sparkle(S, X["HOPS"] + 0.2, 1.4, density=10, vol=0.02)                       # pollen orbs
# the banana bud
c3.mute(X["BUD"] - 0.05, X["PRANK"] - 0.1)
for k2, m in enumerate(("D6", "F#6", "A6", "D7")):
    add(S, glock(hz(m), 0.8, 0.025), X["BUD"] + k2 * 0.06)
add(S, chomp(0.03), X["HUG"] + 0.3)                                          # the "peel" tug
add(S, strain(0.4, 0.03), X["HUG"] + 0.4)
add(S, bloom_open(0.06, 0.8), X["BLOOM1"])
harp_gliss(S, X["BLOOM1"], [n(x) for x in ("D5", "F#5", "A5", "D6", "F#6")], step=0.05, vol=0.03)
sad_trombone(S, X["BLOOM1"] + 0.4, notes=("A3", "G#3", "G3", "F#3"), vol=0.045)
# Kiko's prank: tiptoe bassoon
c3.mute(X["PRANK"] - 0.05, X["L17"] - 0.1)
for k2 in range(5):
    add(S, bassoon(hz(("D3", "E3", "F#3", "E3", "D3")[k2]), 0.16, 0.035), X["PRANK"] + k2 * 0.2)
add(S, pop(0.035), X["PRANK"] + 1.0)
for k2 in range(3):
    add(S, squeak(0.012), X["PRANK"] + 1.1 + k2 * 0.12)
# "Behold!" fanfare
for k2, m in enumerate(("D4", "F#4", "A4", "D5")):
    add(S, brass(hz(m), 0.14 if k2 < 3 else 0.5, 0.035), X["L17"] - 0.55 + k2 * 0.13)
c3.mute(X["NOSE"] - 0.05, X["FLIP"] + 0.3)
add(S, slide(1300, 800, 0.6, 0.014), X["NOSE"] - 0.1)                        # the flower drifting down
add(S, blink_ping(0.02), X["NOSE"] + 0.45)                                  # boop
add(S, achoo(0.08), X["DSNEEZE"])
add(S, whoosh(0.5, 0.05), X["DSNEEZE"] + 0.05)
add(S, whirl(0.5, 0.03), X["DSNEEZE"] + 0.1)
add(S, pomf(0.06), X["FLIP"] + 0.35)
# Petal's sneeze lifts everyone: the cue comes back floaty
add(S, achoo(0.09), X["CHOO2_END"] - 0.4)
add(S, whoosh(1.4, 0.08), X["FLOAT"])
add(S, slide(500, 1500, 1.0, 0.02), X["FLOAT"] + 0.1)
for k2, m in enumerate(("D6", "A5", "F#6", "D6", "A6", "F#6", "D7")):
    add(S, celesta(hz(m), 1.2, 0.02), X["FLOAT"] + 0.2 + k2 * 0.3)
add(S, slide(1400, 600, 0.9, 0.015), X["FLOATING"] + 1.4)
add(S, pomf(0.03), X["CUT_4"] - 0.15)
c3.render(M)

# =====================================================================
# CUE 4 "The Missing Bloom Crystal" (CUT_4 - CUT_5): mysterious, gentle percussion and magical tones.
# F-sharp minor, 84 BPM. Frame drum and shaker, glass harmonica, celesta, low strings; stops for the gags.
# =====================================================================
c4 = Cue(X["CUT_4"] - 0.2, X["CUT_5"] + 0.2, bpm=84, fade_in=0.5, fade_out=0.5)
q = c4.beat
prog4 = [("F#2", ("F#3", "A3", "C#4")), ("D2", ("F#3", "A3", "D4")), ("B1", ("F#3", "B3", "D4")), ("C#2", ("E#3", "G#3", "C#4"))]
nb = int((X["CUT_5"] - X["CUT_4"] + 0.4) / (4 * q)) + 1
for b in range(nb):
    at = 0.2 + b * 4 * q
    root, ch = prog4[b % 4]
    c4.put(strings([hz(x) for x in ch], 4 * q + 0.4, 0.02, attack=0.7, release=0.5, tone=1600), at)
    c4.put(strings([hz(root)], 4 * q + 0.3, 0.03, attack=0.5, release=0.5, tone=600), at)
    for j in range(4):
        c4.put(frame_drum(0.03 if j == 0 else 0.016), at + j * q)
        c4.put(shaker(0.008), at + j * q + q / 2)
    c4.put(glass(hz(ch[2]) * 2, 2.4, 0.016), at + q)
    for j, m in enumerate((ch[0], ch[1], ch[2])):
        c4.put(celesta(hz(m) * 4, 1.0, 0.012), at + 2 * q + j * q / 3)
# the gate: four carvings glow in order, each ringing its flower note
for i, m in enumerate((PINK, YELLOW, BLUE, PURPLE)):
    add(S, glass(hz(m), 1.6, 0.03), X["GATE"] + 0.1 + i * 0.4)
    add(S, blink_ping(0.012), X["GATE"] + 0.1 + i * 0.4)
add(S, chime(hz(PINK), 0.04), X["ORB1"] + 0.4)
add(S, water_drop(0.03), X["ORB1"] + 0.3)
# Kiko's tap -> the launch
c4.mute(X["KTAP"] - 0.05, X["L22_END"] + 0.2)
add(S, woodblock(1400, 0.03), X["KTAP"] + 0.1)
add(S, woodblock(1600, 0.03), X["KTAP"] + 0.3)
add(S, bloom_open(0.06, 0.4), X["LAUNCH"] - 0.05)
add(S, boing(0.07, 160), X["LAUNCH"])
add(S, slide(400, 1800, 0.6, 0.03), X["LAUNCH"] + 0.05)
add(S, pomf(0.08), X["LAUNCH"] + 0.75)
add(S, whoosh(0.5, 0.03), X["LAUNCH"] + 0.7)
# Draco's tiny flame -> the flower snaps shut in a huff
c4.mute(X["DFIRE"] - 0.05, X["ORBS"])
add(S, fizzle(0.025, 0.5), X["DFIRE"])
add(S, bloom_close(0.06, 0.35), X["SNAP"])
add(S, woodblock(700, 0.04), X["SNAP"] + 0.3)
add(S, bwomp(hz("F#2"), 0.04, 0.5), X["SNAP"] + 0.45)
# the other three orbs, then the gate blooms open and the water parts
for i, m in enumerate((YELLOW, BLUE, PURPLE)):
    add(S, chime(hz(m), 0.04), X["ORBS"] + 0.25 + i * 0.45)
    add(S, glass(hz(m), 1.4, 0.025), X["ORBS"] + 0.25 + i * 0.45)
c4.mute(X["OPENGATE"] - 0.1, X["CUT_5"] + 0.3)
harp_gliss(S, X["OPENGATE"], [n(x) for x in ("A4", "C#5", "E5", "G#5", "A5", "C#6", "E6", "G#6")], step=0.05, vol=0.04)
add(S, bloom_open(0.06, 1.0, 250, 2200), X["OPENGATE"])
add(S, splash(0.05, 0.9), X["OPENGATE"] + 0.5)
add(S, noise_band(1.2, 200, 1500, 0.02), X["OPENGATE"] + 0.6)               # the water parting
c4.put_at(choir([hz("C#4"), hz("G#4")], 1.6, 0.025, attack=0.4, release=0.6), X["OPENGATE"] + 0.2)
c4.render(M)

# =====================================================================
# CUE 5 "Bloom Again" (CUT_5 - CUT_6): emotional orchestral build-up with a magical climax.
# E minor -> C -> D -> G major, 64 BPM. Strings, horn, harp, choir, timpani; full orchestra on RESTORE.
# =====================================================================
c5 = Cue(X["CUT_5"] - 0.2, X["CUT_6"] + 0.2, bpm=64, fade_in=0.8, fade_out=0.6)
q = c5.beat
prog5 = [("E2", ("E4", "G4", "B4")), ("C2", ("E4", "G4", "C5")), ("A1", ("E4", "A4", "C5")), ("B1", ("D#4", "F#4", "B4"))]
nb = int((X["BREATH"] - X["CUT_5"]) / (4 * q)) + 1
for b in range(nb):
    at = 0.3 + b * 4 * q
    root, ch = prog5[b % 4]
    c5.put(strings([hz(x) for x in ch], 4 * q + 0.5, 0.022, attack=0.9, release=0.6, tone=2000), at)
    c5.put(strings([hz(root)], 4 * q + 0.4, 0.028, attack=0.5, release=0.5, tone=700), at)
    for j in range(6):
        c5.put(harp(hz(ch[(0, 1, 2, 1, 2, 0)[j]]) * (2 if j >= 3 else 1), 1.8, 0.014), at + j * 4 * q / 6)
add(S, water_drop(0.02), X["CUT_5"] + 0.6)
add(S, water_drop(0.015), X["CUT_5"] + 1.7)
# Petal's doubt: almost nothing; Lumi's encouragement: a horn
c5.mute(X["L23"] - 0.1, X["L24"] - 0.1, ramp=0.4)
c5.put_at(strings([hz(x) for x in ("E3", "G3", "B3")], X["L24"] - X["L23"] + 0.2, 0.02, attack=0.8, release=0.5, tone=1400), X["L23"])
for m, at, d in (("G3", 0.4, 0.9), ("B3", 1.3, 0.6), ("D4", 1.9, 1.5)):
    c5.put_at(brass(hz(m), d, 0.025, scoop=False), X["L24"] + at)
# the four orbs set in place
for i, m in enumerate(("E5", "G5", "B5", "D6")):
    add(S, chime(hz(m), 0.035), X["POSITION"] + 0.25 + i * 0.38)
# the build: a hush, a deep breath, the flower grows, the stream of light
c5.mute(X["BREATH"] - 0.2, X["CUT_6"] + 0.3, ramp=0.3)
add(S, reverse_swell(0.7, 0.025), X["BREATH"])
c5.put_at(strings([hz("D3"), hz("A3"), hz("D4")], X["RESTORE"] - X["BREATH"] + 0.2, 0.02, attack=1.4, release=0.2, tone=2200), X["BREATH"])
c5.put_at(choir([hz("D4"), hz("F#4"), hz("A4")], X["RESTORE"] - X["CREATE"], 0.025, attack=0.8, release=0.2), X["CREATE"])
c5.put_at(timp_roll(hz("D2"), X["RESTORE"] - X["CREATE"], 0.035), X["CREATE"])
add(S, bloom_open(0.05, 1.4, 400, 3200), X["CREATE"] + 0.1)
for k2, m in enumerate(("D5", "F#5", "A5", "D6", "F#6", "A6")):
    add(S, celesta(hz(m), 1.4, 0.022), X["CREATE"] + 0.2 + k2 * 0.22)
add(S, whoosh(1.0, 0.05), X["STREAM"])
sparkle(S, X["STREAM"], 1.0, density=24, vol=0.025)
add(S, reverse_swell(0.6, 0.04), X["RESTORE"] - 0.6)
# RESTORE: G major, full orchestra
add(S, boom(0.12), X["RESTORE"])
add(S, crash(0.05), X["RESTORE"])
add(S, glass(hz("G6"), 2.4, 0.03), X["RESTORE"] + 0.05)
add(S, glass(hz("D7"), 2.4, 0.02), X["RESTORE"] + 0.2)
c5.put_at(strings([hz(x) for x in ("G2", "D3", "G3", "B3", "D4", "G4")], X["CUT_6"] - X["RESTORE"] + 0.4, 0.045, attack=0.05, release=0.8), X["RESTORE"])
c5.put_at(choir([hz("B4"), hz("D5"), hz("G5")], 1.8, 0.03, attack=0.1, release=0.6), X["RESTORE"])
for i, (m, d) in enumerate((("D5", 0.3), ("G5", 0.3), ("B5", 0.3), ("D6", 1.1))):
    c5.put_at(brass(hz(m) / 2, d, 0.04), X["RESTORE"] + i * 0.28)
    c5.put_at(flute(hz(m), d, 0.025), X["RESTORE"] + i * 0.28)
harp_gliss(S, X["RESTORE"], [n(x) for x in ("G5", "B5", "D6", "G6", "B6", "D7")], step=0.06, vol=0.04)
sparkle(S, X["RESTORE"], 1.8, density=22, vol=0.03)
for k2 in range(5):                                                         # the chamber's flowers popping open
    add(S, bloom_open(0.025, 0.4, 600 + k2 * 200, 3000), X["RESTORE"] + 0.6 + k2 * 0.22)
# the gentle launch: a flower opens under Bobo
add(S, bloom_open(0.05, 0.35), X["BOING"] - 0.1)
add(S, boing(0.06, 220), X["BOING"])
add(S, slide(500, 1300, 0.5, 0.02), X["BOING"] + 0.05)
add(S, pomf(0.04), X["BOING"] + 0.75)
c5.render(M)

# =====================================================================
# CUE 6 "The Garden Celebration" (CUT_6 - PROJECT): joyful, colourful orchestra with a satisfying ending.
# F major, 126 BPM, 4/4. Flute and brass tune, string chords, glockenspiel, tambourine, walking pizzicato bass.
# =====================================================================
c6 = Cue(X["CUT_6"] - 0.2, X["PROJECT"], bpm=126, fade_in=0.2, fade_out=0.4)
q = c6.beat
prog6 = [("F2", ("F4", "A4", "C5")), ("D2", ("F4", "A4", "D5")), ("Bb1", ("F4", "Bb4", "D5")), ("C2", ("E4", "G4", "C5"))]
k = 0
while c6.t0 + 0.2 + k * q < X["PROJECT"]:
    at = 0.2 + k * q
    root, ch = prog6[(k // 4) % 4]
    c6.put(pizz(hz(root) * (1, 1.25, 1.5, 1.68)[k % 4], 0.3, 0.07), at)
    if k % 2 == 1:
        c6.put(strings([hz(x) for x in ch], q * 0.7, 0.024, attack=0.02, release=0.15), at)
        c6.put(clap(0.016), at)
    c6.put(tamb(0.01), at + q / 2)
    if k % 4 == 0:
        c6.put(glock(hz(ch[2]) * 2, 1.2, 0.02), at)
    if k % 8 == 0:
        c6.put(timpani(hz(root) * 2, 0.04, 1.2), at)
    k += 1
mel6 = [("C5", 0, 1), ("F5", 1, 1), ("A5", 2, 1.5), ("G5", 3.5, 0.5), ("F5", 4, 1), ("D5", 5, 1), ("F5", 6, 2), ("Bb5", 8, 1), ("A5", 9, 1), ("G5", 10, 1), ("A5", 11, 1), ("C6", 12, 4)]
for rep in range(2):
    for m, b0_, d in mel6:
        at = 0.3 + (b0_ + rep * 16) * q
        c6.put(flute(hz(m), d * q * 0.9, 0.028), at)
        if rep == 0:
            c6.put(brass(hz(m) / 2, d * q * 0.85, 0.022), at)
harp_gliss(S, X["CUT_6"], [n(x) for x in ("F4", "A4", "C5", "F5", "A5", "C6", "F6")], step=0.06, vol=0.04)
add(S, noise_band(3.0, 500, 6000, 0.012), X["ALIVE"] + 0.4)               # waterfalls start flowing
add(S, flutter_wings(2.4, 0.025, 16), X["ALIVE"] + 0.6)                     # butterflies return
wind_chimes(S, X["ALIVE"] + 0.3, 2.4, vol=0.02, seed=51)
sparkle(S, X["ALIVE"], 2.8, density=16, vol=0.025)
add(S, splash(0.03, 0.8), X["ALIVE"] + 1.2)
# Kiko's surprise
c6.mute(X["KHIDE"] - 0.05, X["JUMPED"])
for k2 in range(3):
    add(S, bloom_close(0.012, 0.2), X["KHIDE"] + k2 * 0.15)
add(S, bloom_open(0.06, 0.3), X["L26"] - 0.1)
add(S, crash(0.03), X["L26"] + 0.05)
add(S, boing(0.05, 300), X["JUMP2"])
add(S, slide(600, 1600, 0.25, 0.02), X["JUMP2"])
# Draco's heroic landing
c6.mute(X["DIVE"] - 0.05, X["PLOP"] + 1.0)
for k2, m in enumerate(("C4", "F4", "A4", "C5")):
    add(S, brass(hz(m), 0.14 if k2 < 3 else 0.6, 0.035), X["DIVE"] - 0.1 + k2 * 0.13)
add(S, slide(1500, 300, 0.7, 0.03), X["DIVE"] + 0.2)
add(S, pomf(0.12), X["PLOP"])
add(S, pomf(0.05), X["PLOP"] + 0.12)
for k2 in range(5):
    add(S, pop(0.015), X["PLOP"] + 0.25 + k2 * 0.1)
# the golden banana flower closes around Bobo's paw
c6.mute(X["L28"] - 0.1, X["LAUGH"])
for k2, m in enumerate(("F6", "A6", "C7")):
    add(S, glock(hz(m), 1.0, 0.025), X["L28"] + k2 * 0.08)
for k2 in range(3):
    add(S, pizz(hz(("C5", "D5", "E5")[k2]), 0.2, 0.03), X["PICK"] + k2 * 0.17)
add(S, bloom_close(0.05, 0.5), X["CLOSE"])
add(S, kazoo(hz("C4"), 0.25, 0.03), X["CLOSE"] + 0.6)
for k2 in range(6):
    add(S, clap(0.018), X["LAUGH"] + k2 * 0.17)
c6.put_at(strings([hz(x) for x in ("F3", "A3", "C4", "F4")], 1.2, 0.03, attack=0.05, release=0.6), X["LAUGH"])
c6.put_at(brass(hz("F4"), 1.0, 0.03), X["LAUGH"])
c6.render(M)

# the teaser: the Starlight Island, F-sharp lydian, unresolved
tz = Cue(X["PROJECT"] - 0.1, DUR, bpm=72, fade_in=0.2, fade_out=0.05)
q = tz.beat
tz.put(strings([hz(x) for x in ("F#3", "C#4", "A#4", "B#4")], DUR - X["PROJECT"], 0.026, attack=1.0, release=0.4, tone=2000), 0.1)
for k2, m in enumerate(("C#6", "E#6", "F#6", "G#6", "A#6", "B#6", "C#7", "E#7")):
    tz.put(harp(hz(m), 2.2, 0.028), 0.15 + k2 * q / 2)
tz.put_at(choir([hz("A#4"), hz("E#5")], DUR - X["L30"], 0.02, attack=0.8, release=0.3), X["L30"] - 0.3)
for b0_, m in enumerate(("F#6", "A#6", "B#6", "C#7", "E#7")):
    tz.put_at(celesta(hz(m), 1.8, 0.03), X["END"] + b0_ * 0.4)
tz.render(M)
add(S, whoosh(0.6, 0.05), X["PROJECT"] - 0.2)
sparkle(S, X["PROJECT"], 1.5, density=10, vol=0.02)
sparkle(S, X["END"], 2.0, density=8, vol=0.015)

# =====================================================================
# Ambience and transitions
# =====================================================================
add(S, whoosh(1.0, 0.08), X["JUMP"])
add(S, reverse_swell(0.8, 0.05), X["CUT_1"] - 0.8)
sparkle(S, X["CUT_1"] - 0.5, 1.2, density=20, vol=0.03)
add(S, whoosh(1.6, 0.05), X["CUT_1"] + 0.2)
add(S, pomf(0.05), X["LAND"])
add(S, pomf(0.03), X["LAND"] + 0.15)
add(S, steady_wind(X["CUT_5"] - X["CUT_1"], 0.004), X["CUT_1"])            # soft open-air breeze
add(S, noise_band(X["CUT_5"] - X["CUT_1"], 300, 2500, 0.003), X["CUT_1"])  # far-off waterfall hush
for at in (X["CUT_3"], X["CUT_4"]):
    add(S, whoosh(0.5, 0.04), at)
add(S, splash(0.03, 0.6), X["CUT_5"] - 0.1)
add(S, current(X["CUT_6"] - X["CUT_5"], 0.006), X["CUT_5"])               # under the lake: a soft water hum

with open(os.path.join(ROOT, "src", "ep15", "cues.json"), "w") as f:
    json.dump({k: round(v, 3) for k, v in sorted(T.items(), key=lambda kv: kv[1])}, f, indent=1)

import wave as _wave
os.makedirs(os.path.join(ROOT, "build", "ep15"), exist_ok=True)
with _wave.open(os.path.join(ROOT, "build", "ep15", "music_stem.wav"), "wb") as w:
    w.setnchannels(1)
    w.setsampwidth(2)
    w.setframerate(SR)
    w.writeframes((np.clip(M / (np.max(np.abs(M)) + 1e-9), -1, 1) * 32767).astype(np.int16).tobytes())

print(f"DUR {DUR}s")
t.finish(mouth_style="v2")
