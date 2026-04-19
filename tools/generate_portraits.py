#!/usr/bin/env python3
"""
Generate medieval-illumination / tarot-style portrait cards for each
Dark Tetrad archetype. Outputs 10 PNG files into ../assets/villains/.

No AI. Pure procedural rendering with Pillow:
 - aged parchment background (layered gradients + speckled noise)
 - double gilt frame with corner fleurons
 - a large Roman numeral (illuminated-initial style)
 - a heraldic sigil specific to each archetype
 - bilingual archetype name + Latin motto

Re-run if you want to tweak the look:
   python3 tools/generate_portraits.py
"""
from __future__ import annotations
import math
import os
import random
from pathlib import Path
from PIL import Image, ImageDraw, ImageFilter, ImageFont

# --------------------------------------------------------------------
# Configuration
# --------------------------------------------------------------------
OUT_DIR = Path(__file__).resolve().parent.parent / "assets" / "villains"
OUT_DIR.mkdir(parents=True, exist_ok=True)

W, H = 600, 800

FONT_SERIF_BOLD   = "/usr/share/fonts/truetype/liberation/LiberationSerif-Bold.ttf"
FONT_SERIF_ITALIC = "/usr/share/fonts/truetype/liberation/LiberationSerif-Italic.ttf"
FONT_SERIF        = "/usr/share/fonts/truetype/liberation/LiberationSerif-Regular.ttf"
FONT_JP           = "/usr/share/fonts/truetype/fonts-japanese-gothic.ttf"
FONT_DECO         = "/usr/share/fonts/truetype/freefont/FreeSerif.ttf"

# Palette
GOLD_LIGHT = (232, 208, 138)
GOLD       = (201, 169, 110)
GOLD_DARK  = (140, 106,  54)
INK        = ( 58,  40,  24)
INK_DEEP   = ( 30,  18,  10)
RED_INK    = (122,  32,  32)

# --------------------------------------------------------------------
# Archetype data
# --------------------------------------------------------------------
ARCHETYPES = [
    {
        "id": "puppeteer",            "numeral": "IX",
        "name_jp": "策謀家の公爵",     "name_en": "THE PUPPETEER DUKE",
        "motto":   "QUI DOCET TACET",
        "sigil":   "puppeteer",
        "accent":  (130,  50,  50),  # burgundy
    },
    {
        "id": "vain_tyrant",          "numeral": "IV",
        "name_jp": "虚栄の王",         "name_en": "THE VAIN TYRANT",
        "motto":   "IN SPECULO REGNO",
        "sigil":   "crown",
        "accent":  (180, 130,  50),  # amber
    },
    {
        "id": "cold_executioner",     "numeral": "XIII",
        "name_jp": "氷血の執行者",     "name_en": "THE COLD EXECUTIONER",
        "motto":   "SINE IRA SINE SPE",
        "sigil":   "hourglass_skull",
        "accent":  ( 70,  80, 100),  # cold steel
    },
    {
        "id": "gleeful_tormentor",    "numeral": "XV",
        "name_jp": "歓喜の拷問者",     "name_en": "THE GLEEFUL TORMENTOR",
        "motto":   "PER RISUM, SANGUIS",
        "sigil":   "horned_mask",
        "accent":  (150,  40,  60),  # crimson
    },
    {
        "id": "dark_sovereign",       "numeral": "XVI",
        "name_jp": "闇の帝王",         "name_en": "THE DARK SOVEREIGN",
        "motto":   "UMBRA SUPER OMNIA",
        "sigil":   "tower_lightning",
        "accent":  ( 60,  50,  90),  # midnight violet
    },
    {
        "id": "mirror_tyrant",        "numeral": "VII",
        "name_jp": "鏡の暴君",         "name_en": "THE MIRROR TYRANT",
        "motto":   "FRAGILIS CORONA",
        "sigil":   "cracked_mirror",
        "accent":  (140,  60,  90),  # dusty rose
    },
    {
        "id": "silver_serpent",       "numeral": "II",
        "name_jp": "銀舌の蛇",         "name_en": "THE SILVER-TONGUED SERPENT",
        "motto":   "LINGUA ARGENTEA",
        "sigil":   "serpent",
        "accent":  ( 80, 110,  90),  # moss
    },
    {
        "id": "black_charismatic",    "numeral": "I",
        "name_jp": "黒のカリスマ",     "name_en": "THE BLACK CHARISMATIC",
        "motto":   "LUX QUAE FALLIT",
        "sigil":   "flame",
        "accent":  ( 70,  40, 110),  # arcane purple
    },
    {
        "id": "innocent_seeker",      "numeral": "XIX",
        "name_jp": "無垢の探究者",     "name_en": "THE INNOCENT SEEKER",
        "motto":   "LUMEN IN MANIBUS",
        "sigil":   "sun",
        "accent":  (210, 170,  80),  # daylight gold
    },
    {
        "id": "grey_pilgrim",         "numeral": "XI",
        "name_jp": "灰色の巡礼者",     "name_en": "THE GREY PILGRIM",
        "motto":   "INTER LUCEM ET NOCTEM",
        "sigil":   "scales",
        "accent":  (110, 110, 120),  # ash grey
    },
]

# --------------------------------------------------------------------
# Drawing helpers
# --------------------------------------------------------------------
def _lerp(a, b, t):
    return tuple(int(a[i] + (b[i] - a[i]) * t) for i in range(3))


def parchment_background(accent):
    """Aged parchment with subtle vignette and speckled texture."""
    bg = Image.new("RGB", (W, H))
    px = bg.load()

    # vertical parchment gradient
    top    = _lerp((70, 52, 38), accent, 0.18)
    mid    = _lerp((60, 44, 30), accent, 0.08)
    bottom = (28, 20, 14)
    for y in range(H):
        t = y / (H - 1)
        if t < 0.55:
            c = _lerp(top, mid, t / 0.55)
        else:
            c = _lerp(mid, bottom, (t - 0.55) / 0.45)
        for x in range(W):
            px[x, y] = c

    # add radial vignette + speckle
    overlay = Image.new("L", (W, H), 0)
    od = ImageDraw.Draw(overlay)
    cx, cy = W // 2, int(H * 0.45)
    for r in range(max(W, H), 0, -8):
        a = max(0, 220 - int(220 * (r / max(W, H)) ** 1.4))
        od.ellipse([cx - r, cy - r, cx + r, cy + r], fill=a)
    overlay = overlay.filter(ImageFilter.GaussianBlur(40))
    bg = Image.composite(bg,
                         Image.new("RGB", (W, H), INK_DEEP),
                         overlay)

    # speckle noise
    rnd = random.Random(1337)
    speck = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    sd = ImageDraw.Draw(speck)
    for _ in range(1200):
        x = rnd.randrange(W); y = rnd.randrange(H)
        a = rnd.randrange(8, 40)
        sd.point((x, y), fill=(20, 10, 4, a))
    for _ in range(200):
        x = rnd.randrange(W); y = rnd.randrange(H)
        a = rnd.randrange(10, 30)
        sd.point((x, y), fill=(240, 220, 170, a))
    bg = Image.alpha_composite(bg.convert("RGBA"), speck)

    return bg


def draw_frame(canvas):
    """Double gilded frame with corner fleurons."""
    d = ImageDraw.Draw(canvas)

    # outer thick bar
    outer = 24
    d.rectangle([outer, outer, W - outer, H - outer],
                outline=GOLD, width=3)

    # inner thin line
    inner = 36
    d.rectangle([inner, inner, W - inner, H - inner],
                outline=GOLD_DARK, width=1)

    # faint innermost
    inner2 = 46
    d.rectangle([inner2, inner2, W - inner2, H - inner2],
                outline=(GOLD_DARK[0] // 2 + GOLD[0] // 2,
                         GOLD_DARK[1] // 2 + GOLD[1] // 2,
                         GOLD_DARK[2] // 2 + GOLD[2] // 2), width=1)

    # corner fleurons (small diamond + radiating petals)
    for cx, cy in [(outer + 10, outer + 10),
                   (W - outer - 10, outer + 10),
                   (outer + 10, H - outer - 10),
                   (W - outer - 10, H - outer - 10)]:
        # diamond
        d.polygon([(cx, cy - 6), (cx + 6, cy),
                   (cx, cy + 6), (cx - 6, cy)], fill=GOLD)
        # petals
        for dx, dy in [(12, 0), (-12, 0), (0, 12), (0, -12)]:
            d.line([(cx, cy), (cx + dx, cy + dy)], fill=GOLD, width=1)
            d.ellipse([(cx + dx - 2, cy + dy - 2),
                       (cx + dx + 2, cy + dy + 2)], fill=GOLD)

    # top-centre and bottom-centre crest pips
    for cx, cy in [(W // 2, outer + 6), (W // 2, H - outer - 6)]:
        d.polygon([(cx, cy - 5), (cx + 5, cy),
                   (cx, cy + 5), (cx - 5, cy)], fill=GOLD)
        d.line([(cx - 30, cy), (cx - 8, cy)], fill=GOLD, width=1)
        d.line([(cx + 8, cy), (cx + 30, cy)], fill=GOLD, width=1)


def draw_numeral(canvas, numeral):
    d = ImageDraw.Draw(canvas)
    # large illuminated numeral
    sizes = {1: 180, 2: 160, 3: 130, 4: 110}
    size = sizes.get(len(numeral), 110)
    font = ImageFont.truetype(FONT_SERIF_BOLD, size)
    bbox = d.textbbox((0, 0), numeral, font=font)
    w = bbox[2] - bbox[0]; h = bbox[3] - bbox[1]
    x = (W - w) // 2 - bbox[0]
    y = 110 - bbox[1]

    # shadow
    d.text((x + 3, y + 3), numeral, font=font, fill=INK_DEEP)
    # body
    d.text((x, y), numeral, font=font, fill=GOLD_LIGHT)
    # subtle outline by drawing slightly offset in dark
    d.text((x - 1, y - 1), numeral, font=font, fill=GOLD_DARK)

    # under-numeral line
    cx = W // 2
    line_y = y + h + 28
    d.line([(cx - 90, line_y), (cx - 14, line_y)], fill=GOLD, width=1)
    d.line([(cx + 14, line_y), (cx + 90, line_y)], fill=GOLD, width=1)
    # diamond
    d.polygon([(cx, line_y - 5), (cx + 5, line_y),
               (cx, line_y + 5), (cx - 5, line_y)], fill=GOLD)
    return line_y + 20


def draw_labels(canvas, name_jp, name_en, motto):
    d = ImageDraw.Draw(canvas)
    cx = W // 2

    # Japanese name, large
    f_jp = ImageFont.truetype(FONT_JP, 36)
    bbox = d.textbbox((0, 0), name_jp, font=f_jp)
    w = bbox[2] - bbox[0]
    d.text(((W - w) // 2, 600), name_jp, font=f_jp, fill=GOLD_LIGHT)

    # English name, small, letter-spaced
    f_en = ImageFont.truetype(FONT_SERIF_BOLD, 16)
    spaced = " ".join(list(name_en))
    bbox = d.textbbox((0, 0), spaced, font=f_en)
    w = bbox[2] - bbox[0]
    d.text(((W - w) // 2, 656), spaced, font=f_en, fill=GOLD_DARK)

    # bottom ornament line
    line_y = 700
    d.line([(cx - 120, line_y), (cx - 10, line_y)], fill=GOLD, width=1)
    d.polygon([(cx, line_y - 5), (cx + 5, line_y),
               (cx, line_y + 5), (cx - 5, line_y)], fill=GOLD)
    d.line([(cx + 10, line_y), (cx + 120, line_y)], fill=GOLD, width=1)

    # Latin motto at very bottom
    f_motto = ImageFont.truetype(FONT_SERIF_ITALIC, 15)
    bbox = d.textbbox((0, 0), motto, font=f_motto)
    w = bbox[2] - bbox[0]
    d.text(((W - w) // 2, 720), motto, font=f_motto, fill=GOLD)


# --------------------------------------------------------------------
# Sigil drawing - heraldic devices for each archetype
# --------------------------------------------------------------------
SIGIL_BOX = (100, 270, 500, 570)   # where the sigil occupies (left, top, right, bottom)


def _sigil_center():
    return ( (SIGIL_BOX[0] + SIGIL_BOX[2]) // 2,
             (SIGIL_BOX[1] + SIGIL_BOX[3]) // 2 )


def sigil_puppeteer(d, accent):
    cx, cy = _sigil_center()
    # control bar
    d.rectangle([cx - 90, cy - 90, cx + 90, cy - 80], fill=GOLD_DARK)
    d.line([(cx - 90, cy - 85), (cx + 90, cy - 85)], fill=GOLD, width=2)
    # three strings descending
    for i, offset in enumerate([-60, 0, 60]):
        x = cx + offset
        d.line([(x, cy - 80), (x, cy + 60)], fill=GOLD, width=1)
        # small diamond nailhead
        d.polygon([(x, cy + 62), (x + 5, cy + 68),
                   (x, cy + 74), (x - 5, cy + 68)], fill=GOLD)
        # top tie
        d.ellipse([x - 3, cy - 82, x + 3, cy - 76], fill=GOLD)
    # surrounding wreath
    for ang in range(0, 360, 30):
        a = math.radians(ang)
        r1, r2 = 110, 120
        x1 = cx + r1 * math.cos(a); y1 = cy + r1 * math.sin(a)
        x2 = cx + r2 * math.cos(a); y2 = cy + r2 * math.sin(a)
        d.line([(x1, y1), (x2, y2)], fill=GOLD_DARK, width=1)
    d.ellipse([cx - 130, cy - 130, cx + 130, cy + 130],
              outline=GOLD_DARK, width=1)


def sigil_crown(d, accent):
    cx, cy = _sigil_center()
    # crown base
    base_top = cy + 10
    base_bot = cy + 50
    d.rectangle([cx - 95, base_top, cx + 95, base_bot],
                fill=accent, outline=GOLD, width=2)
    # decorate base
    for i in range(-80, 81, 40):
        d.ellipse([cx + i - 6, base_top + 14, cx + i + 6, base_top + 26],
                  fill=GOLD_LIGHT, outline=GOLD_DARK)
    # five points
    pts = [-80, -40, 0, 40, 80]
    for i, x in enumerate(pts):
        height = 70 if i in (0, 2, 4) else 50
        # triangle point
        d.polygon([(cx + x - 18, base_top),
                   (cx + x + 18, base_top),
                   (cx + x, base_top - height)],
                  fill=accent, outline=GOLD, width=2)
        # gem on top
        d.ellipse([cx + x - 6, base_top - height - 6,
                   cx + x + 6, base_top - height + 6], fill=GOLD_LIGHT)
    # halo rays above center
    for ang in range(-60, 61, 15):
        a = math.radians(ang - 90)
        x1 = cx + 130 * math.cos(a); y1 = base_top - 110 + 130 * math.sin(a)
        x2 = cx + 160 * math.cos(a); y2 = base_top - 110 + 160 * math.sin(a)
        d.line([(x1, y1), (x2, y2)], fill=GOLD_DARK, width=1)


def sigil_hourglass_skull(d, accent):
    cx, cy = _sigil_center()
    # stylised skull: circle + jaw
    d.ellipse([cx - 60, cy - 90, cx + 60, cy + 20],
              outline=GOLD, width=2)
    # eye sockets
    d.ellipse([cx - 35, cy - 60, cx - 15, cy - 30], fill=INK_DEEP)
    d.ellipse([cx + 15, cy - 60, cx + 35, cy - 30], fill=INK_DEEP)
    # nose
    d.polygon([(cx, cy - 20), (cx - 6, cy - 5), (cx + 6, cy - 5)],
              fill=INK_DEEP)
    # teeth row
    d.rectangle([cx - 40, cy + 5, cx + 40, cy + 25],
                outline=GOLD, width=1)
    for i in range(-32, 33, 8):
        d.line([(cx + i, cy + 5), (cx + i, cy + 25)], fill=GOLD, width=1)
    # hourglass below
    gy = cy + 50
    d.polygon([(cx - 40, gy), (cx + 40, gy),
               (cx, gy + 40)], outline=GOLD, width=2)
    d.polygon([(cx - 40, gy + 80), (cx + 40, gy + 80),
               (cx, gy + 40)], outline=GOLD, width=2)
    # sand
    d.polygon([(cx - 36, gy + 2), (cx + 36, gy + 2),
               (cx, gy + 36)], fill=(180, 140, 80))
    # crossed bones behind (decorative)
    for ang, sign in [(25, -1), (-25, 1)]:
        a = math.radians(ang)
        ex = cx + 160 * math.cos(a); ey = cy + 160 * math.sin(a) * sign


def sigil_horned_mask(d, accent):
    cx, cy = _sigil_center()
    # mask oval
    d.ellipse([cx - 80, cy - 30, cx + 80, cy + 90],
              outline=GOLD, width=2)
    # horns
    d.polygon([(cx - 70, cy - 20),
               (cx - 120, cy - 110),
               (cx - 55, cy - 40)], fill=accent, outline=GOLD)
    d.polygon([(cx + 70, cy - 20),
               (cx + 120, cy - 110),
               (cx + 55, cy - 40)], fill=accent, outline=GOLD)
    # eye slits (upturned, manic)
    d.polygon([(cx - 50, cy + 10), (cx - 20, cy), (cx - 20, cy + 14)],
              fill=INK_DEEP)
    d.polygon([(cx + 50, cy + 10), (cx + 20, cy), (cx + 20, cy + 14)],
              fill=INK_DEEP)
    # grin - zig-zag toothy smile
    xs = [cx - 50, cx - 35, cx - 22, cx - 8, cx + 8, cx + 22, cx + 35, cx + 50]
    ys = [cy + 55, cy + 65, cy + 55, cy + 65, cy + 55, cy + 65, cy + 55, cy + 65]
    d.line(list(zip(xs, ys)), fill=GOLD, width=2)
    # tiny bells on the horns
    for bx, by in [(cx - 115, cy - 115), (cx + 115, cy - 115)]:
        d.ellipse([bx - 8, by - 8, bx + 8, by + 8], fill=GOLD_LIGHT, outline=GOLD_DARK)
        d.line([(bx, by + 5), (bx, by + 10)], fill=GOLD_DARK, width=1)


def sigil_tower_lightning(d, accent):
    cx, cy = _sigil_center()
    # tower body (tapered rectangle)
    d.polygon([(cx - 50, cy + 110), (cx + 50, cy + 110),
               (cx + 40, cy - 40), (cx - 40, cy - 40)],
              fill=accent, outline=GOLD, width=2)
    # battlements
    for i in range(-35, 36, 20):
        d.rectangle([cx + i - 6, cy - 55, cx + i + 6, cy - 40], fill=accent,
                    outline=GOLD, width=1)
    # windows
    for yy in [cy + 20, cy + 65]:
        d.rectangle([cx - 8, yy, cx + 8, yy + 20], fill=INK_DEEP, outline=GOLD)
    # lightning bolt striking top
    bolt = [(cx - 10, cy - 140), (cx + 10, cy - 100),
            (cx - 4, cy - 100), (cx + 12, cy - 70),
            (cx - 6, cy - 70), (cx + 8, cy - 45)]
    d.line(bolt, fill=GOLD_LIGHT, width=5)
    d.line(bolt, fill=(255, 240, 180), width=2)
    # shattered stones flying
    for off in [(-60, -20), (60, -30), (-80, 40), (80, 30)]:
        x, y = cx + off[0], cy + off[1]
        d.polygon([(x, y - 6), (x + 8, y), (x, y + 6), (x - 8, y)],
                  fill=accent, outline=GOLD)


def sigil_cracked_mirror(d, accent):
    cx, cy = _sigil_center()
    # ornate oval mirror
    d.ellipse([cx - 80, cy - 100, cx + 80, cy + 100],
              outline=GOLD, width=3)
    d.ellipse([cx - 72, cy - 92, cx + 72, cy + 92],
              fill=(40, 28, 40))
    # crown on top
    for i, x in enumerate([-30, 0, 30]):
        d.polygon([(cx + x - 10, cy - 100),
                   (cx + x + 10, cy - 100),
                   (cx + x, cy - 130)], fill=accent, outline=GOLD)
    # base
    d.rectangle([cx - 30, cy + 100, cx + 30, cy + 120],
                fill=accent, outline=GOLD)
    d.polygon([(cx - 50, cy + 120), (cx + 50, cy + 120),
               (cx + 30, cy + 150), (cx - 30, cy + 150)],
              fill=accent, outline=GOLD)
    # crack - jagged white line
    cracks = [(cx, cy - 70), (cx - 15, cy - 30), (cx + 10, cy + 10),
              (cx - 20, cy + 50), (cx + 5, cy + 80)]
    d.line(cracks, fill=GOLD_LIGHT, width=2)
    # smaller cracks
    d.line([(cx - 15, cy - 30), (cx - 50, cy - 10)], fill=GOLD_LIGHT, width=1)
    d.line([(cx + 10, cy + 10), (cx + 40, cy + 40)], fill=GOLD_LIGHT, width=1)


def sigil_serpent(d, accent):
    cx, cy = _sigil_center()
    # ouroboros ring
    d.ellipse([cx - 120, cy - 120, cx + 120, cy + 120],
              outline=GOLD, width=4)
    d.ellipse([cx - 112, cy - 112, cx + 112, cy + 112],
              outline=GOLD_DARK, width=1)
    # scales pattern around ring
    for ang in range(0, 360, 12):
        a = math.radians(ang)
        x = cx + 116 * math.cos(a); y = cy + 116 * math.sin(a)
        dx = 8 * math.cos(a); dy = 8 * math.sin(a)
        d.line([(x - dx, y - dy), (x + dx, y + dy)], fill=GOLD_DARK, width=1)
    # head (upper left)
    head_cx, head_cy = cx - 90, cy - 80
    d.polygon([(head_cx - 18, head_cy - 8),
               (head_cx + 22, head_cy - 14),
               (head_cx + 30, head_cy),
               (head_cx + 22, head_cy + 14),
               (head_cx - 18, head_cy + 8)], fill=accent, outline=GOLD)
    # eye
    d.ellipse([head_cx + 10, head_cy - 5, head_cx + 18, head_cy + 3], fill=GOLD_LIGHT)
    d.ellipse([head_cx + 13, head_cy - 3, head_cx + 15, head_cy + 1], fill=INK_DEEP)
    # tongue
    d.line([(head_cx + 30, head_cy), (head_cx + 50, head_cy)],
           fill=RED_INK, width=2)
    d.line([(head_cx + 50, head_cy), (head_cx + 60, head_cy - 5)],
           fill=RED_INK, width=2)
    d.line([(head_cx + 50, head_cy), (head_cx + 60, head_cy + 5)],
           fill=RED_INK, width=2)


def sigil_flame(d, accent):
    cx, cy = _sigil_center()
    # flame triangle base
    d.polygon([(cx - 80, cy + 110),
               (cx + 80, cy + 110),
               (cx, cy - 130)],
              outline=GOLD, width=2)
    # inner flame shape (scalloped)
    flame = [
        (cx, cy - 120),
        (cx - 20, cy - 80),
        (cx - 50, cy - 40),
        (cx - 45, cy + 20),
        (cx - 60, cy + 60),
        (cx - 30, cy + 100),
        (cx + 30, cy + 100),
        (cx + 60, cy + 60),
        (cx + 45, cy + 20),
        (cx + 50, cy - 40),
        (cx + 20, cy - 80),
    ]
    d.polygon(flame, fill=accent, outline=GOLD)
    inner = [(x, y - 8) if y < cy else (x, y) for x, y in flame]
    # core - brighter
    core = [(cx, cy - 80), (cx - 30, cy - 20), (cx - 20, cy + 60),
            (cx + 20, cy + 60), (cx + 30, cy - 20)]
    d.polygon(core, fill=GOLD_LIGHT)
    # small embers around
    for off in [(-110, 30), (110, 30), (-90, 80), (90, 80), (0, -150)]:
        x, y = cx + off[0], cy + off[1]
        d.polygon([(x, y - 5), (x + 4, y), (x, y + 5), (x - 4, y)],
                  fill=GOLD)


def sigil_sun(d, accent):
    cx, cy = _sigil_center()
    # rays
    for ang in range(0, 360, 15):
        a = math.radians(ang)
        r1, r2 = (140 if ang % 30 == 0 else 120), 70
        x1 = cx + r1 * math.cos(a); y1 = cy + r1 * math.sin(a)
        x2 = cx + r2 * math.cos(a); y2 = cy + r2 * math.sin(a)
        d.line([(x1, y1), (x2, y2)], fill=GOLD, width=2 if ang % 30 == 0 else 1)
    # disc
    d.ellipse([cx - 70, cy - 70, cx + 70, cy + 70],
              fill=accent, outline=GOLD_LIGHT, width=3)
    d.ellipse([cx - 62, cy - 62, cx + 62, cy + 62],
              outline=GOLD_DARK, width=1)
    # stylised face (calm smile)
    d.ellipse([cx - 30, cy - 20, cx - 16, cy - 6], fill=GOLD_LIGHT)
    d.ellipse([cx + 16, cy - 20, cx + 30, cy - 6], fill=GOLD_LIGHT)
    d.arc([cx - 26, cy - 4, cx + 26, cy + 32], 0, 180, fill=GOLD_LIGHT, width=2)


def sigil_scales(d, accent):
    cx, cy = _sigil_center()
    # central pillar
    d.rectangle([cx - 4, cy - 70, cx + 4, cy + 90],
                fill=GOLD, outline=GOLD_DARK)
    # base
    d.rectangle([cx - 60, cy + 90, cx + 60, cy + 110],
                fill=accent, outline=GOLD, width=2)
    # crossbeam
    d.line([(cx - 110, cy - 70), (cx + 110, cy - 70)], fill=GOLD, width=3)
    # chains
    for x in (-100, 100):
        for yy in range(cy - 68, cy + 10, 10):
            d.line([(cx + x, yy), (cx + x, yy + 8)], fill=GOLD_DARK, width=1)
    # left pan
    pan_y = cy + 10
    d.polygon([(cx - 140, pan_y), (cx - 60, pan_y),
               (cx - 80, pan_y + 30), (cx - 120, pan_y + 30)],
              fill=accent, outline=GOLD, width=2)
    # right pan - slightly higher (balanced but off a touch)
    d.polygon([(cx + 60, pan_y - 5), (cx + 140, pan_y - 5),
               (cx + 120, pan_y + 25), (cx + 80, pan_y + 25)],
              fill=accent, outline=GOLD, width=2)
    # finial on top
    d.polygon([(cx, cy - 90), (cx + 10, cy - 70),
               (cx - 10, cy - 70)], fill=GOLD)


SIGILS = {
    "puppeteer":        sigil_puppeteer,
    "crown":            sigil_crown,
    "hourglass_skull":  sigil_hourglass_skull,
    "horned_mask":      sigil_horned_mask,
    "tower_lightning":  sigil_tower_lightning,
    "cracked_mirror":   sigil_cracked_mirror,
    "serpent":          sigil_serpent,
    "flame":            sigil_flame,
    "sun":              sigil_sun,
    "scales":           sigil_scales,
}


# --------------------------------------------------------------------
# Compose
# --------------------------------------------------------------------
def render_card(spec):
    canvas = parchment_background(spec["accent"])
    draw_frame(canvas)
    draw_numeral(canvas, spec["numeral"])

    # heraldic sigil
    sig_layer = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    sd = ImageDraw.Draw(sig_layer)
    SIGILS[spec["sigil"]](sd, spec["accent"])
    # slight soft glow behind the sigil
    glow = sig_layer.filter(ImageFilter.GaussianBlur(6))
    canvas = Image.alpha_composite(canvas, glow)
    canvas = Image.alpha_composite(canvas, sig_layer)

    draw_labels(canvas, spec["name_jp"], spec["name_en"], spec["motto"])

    return canvas.convert("RGB")


def main():
    for spec in ARCHETYPES:
        img = render_card(spec)
        out = OUT_DIR / f"{spec['id']}.png"
        img.save(out, "PNG", optimize=True)
        print(f"  wrote {out.relative_to(OUT_DIR.parent.parent)}  "
              f"({out.stat().st_size // 1024} KiB)")


if __name__ == "__main__":
    main()
