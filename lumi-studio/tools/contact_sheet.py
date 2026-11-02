"""Combines frames into one labelled sheet that can be reviewed in a single look.

Usage: python contact_sheet.py <out.png> <frame.png> <label> [<frame.png> <label> ...]
"""
import sys

from PIL import Image, ImageDraw, ImageFont

TILE_W, TILE_H = 300, 533


def build(out, items, columns=4):
    rows = (len(items) + columns - 1) // columns
    sheet = Image.new("RGB", (columns * TILE_W + (columns + 1) * 8, rows * TILE_H + (rows + 1) * 8), "#101018")
    draw = ImageDraw.Draw(sheet)
    try:
        font = ImageFont.truetype("arial.ttf", 22)
    except OSError:
        font = ImageFont.load_default()
    for i, (path, label) in enumerate(items):
        x = 8 + (i % columns) * (TILE_W + 8)
        y = 8 + (i // columns) * (TILE_H + 8)
        with Image.open(path) as frame:
            sheet.paste(frame.convert("RGB").resize((TILE_W, TILE_H)), (x, y))
        box = draw.textbbox((x + 8, y + 6), label, font=font)
        draw.rectangle((box[0] - 5, box[1] - 4, box[2] + 5, box[3] + 4), fill="#000000")
        draw.text((x + 8, y + 6), label, fill="#ffffff", font=font)
    sheet.save(out)


if __name__ == "__main__":
    args = sys.argv[2:]
    build(sys.argv[1], list(zip(args[0::2], args[1::2])))
