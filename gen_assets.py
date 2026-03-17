"""
GoLynk asset generator — creates OG image, app icon, and favicons.
Run once then delete this script.
"""
import os
import math
from PIL import Image, ImageDraw, ImageFont

OUT = os.path.join(os.path.dirname(__file__), "public")
os.makedirs(OUT, exist_ok=True)

# ── Brand palette ──────────────────────────────────────────────────────────────
PRIMARY    = (105, 65, 198)        # #6941c6
PRIMARY_DK = (66,  48, 125)        # #42307d
TEXT       = (24,  29,  39)        # #181d27
TEXT_SEC   = (83,  88,  98)        # #535862
BG         = (255, 255, 255)       # white
BG_LIGHT   = (249, 249, 250)       # near-white for OG
LINE_FAINT = (220, 210, 240)       # very light purple lines
LINE_MED   = (185, 165, 225)       # medium corridor lines


def try_font(size, bold=False):
    """Try to load a clean system font, fall back to default."""
    candidates_bold = [
        "C:/Windows/Fonts/segoeui.ttf",
        "C:/Windows/Fonts/arial.ttf",
        "C:/Windows/Fonts/calibri.ttf",
    ]
    candidates_reg = [
        "C:/Windows/Fonts/segoeuil.ttf",
        "C:/Windows/Fonts/segoeui.ttf",
        "C:/Windows/Fonts/arial.ttf",
        "C:/Windows/Fonts/calibri.ttf",
    ]
    candidates = candidates_bold if bold else candidates_reg
    for path in candidates:
        if os.path.exists(path):
            try:
                return ImageFont.truetype(path, size)
            except Exception:
                continue
    return ImageFont.load_default()


# ── 1. OG image  1200 × 630 ────────────────────────────────────────────────────
def make_og():
    W, H = 1200, 630
    img = Image.new("RGB", (W, H), BG_LIGHT)
    d = ImageDraw.Draw(img)

    # ── light grid backdrop (very subtle, institutional) ──
    for x in range(0, W + 1, 60):
        d.line([(x, 0), (x, H)], fill=(240, 237, 248), width=1)
    for y in range(0, H + 1, 60):
        d.line([(0, y), (W, y)], fill=(240, 237, 248), width=1)

    # ── corridor motif — thin angled lines (right half) ──
    # Main horizontal corridor
    mx, my = 750, 315
    d.line([(mx - 180, my), (mx + 220, my)], fill=LINE_MED, width=2)
    # Branch lines
    for offset_y, length in [(-60, 140), (-120, 90), (60, 140), (120, 90)]:
        d.line([(mx - 50, my), (mx + length, my + offset_y)], fill=LINE_FAINT, width=1)

    # Node circles
    nodes = [
        (mx - 180, my), (mx + 220, my),
        (mx + 140, my - 60), (mx + 90, my - 120),
        (mx + 140, my + 60), (mx + 90, my + 120),
        (mx - 50, my),
    ]
    for nx, ny in nodes:
        r = 5
        d.ellipse([(nx-r, ny-r), (nx+r, ny+r)], fill=BG, outline=LINE_MED, width=2)

    # Origin node (filled primary)
    ox, oy = mx - 180, my
    r = 7
    d.ellipse([(ox-r, oy-r), (ox+r, oy+r)], fill=PRIMARY, outline=None)

    # Destination node (outlined primary, larger)
    dx2, dy2 = mx + 220, my
    r = 9
    d.ellipse([(dx2-r, dy2-r), (dx2+r, dy2+r)], fill=BG, outline=PRIMARY, width=2)

    # ── thin top accent bar ──
    d.rectangle([(0, 0), (W, 4)], fill=PRIMARY)

    # ── bottom-left small label GOLYNK mark as wordmark bar ──
    d.rectangle([(60, H - 48), (60 + 6, H - 16)], fill=PRIMARY)

    # ── text ──
    font_brand  = try_font(88, bold=True)
    font_sub    = try_font(26, bold=False)
    font_tag    = try_font(18, bold=False)

    # "GoLynk" — left column
    d.text((76, 200), "GoLynk", font=font_brand, fill=TEXT)

    # Subtitle
    d.text((78, 308), "Logistics coordination infrastructure for Europe",
           font=font_sub, fill=TEXT_SEC)

    # Thin rule under subtitle
    d.rectangle([(78, 348), (78 + 320, 350)], fill=LINE_MED)

    # Tagline
    d.text((78, 362), "golynk.de", font=font_tag, fill=(*PRIMARY, 255))

    path = os.path.join(OUT, "og-golynk.jpg")
    img.save(path, "JPEG", quality=92, optimize=True)
    print(f"  ✓  {path}  ({W}×{H})")


# ── Icon builder (shared geometry) ────────────────────────────────────────────
def draw_icon(size: int) -> Image.Image:
    """
    Draw the GoLynk 'G-node' mark:
    Clean capital-G letterform built from rectangles + a corridor node dot.
    """
    scale = size / 180          # reference size 180 px
    img = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    d = ImageDraw.Draw(img)

    pad   = round(18 * scale)
    inner = size - 2 * pad

    # White rounded-rect background
    r_bg = round(36 * scale)
    d.rounded_rectangle([(0, 0), (size - 1, size - 1)],
                         radius=r_bg, fill=(255, 255, 255, 255))

    # ── Build the "G" letterform ──
    lw  = max(1, round(14 * scale))    # stroke weight
    cx  = size / 2
    cy  = size / 2
    rad = inner / 2 - round(4 * scale)  # circle radius

    # Draw the circular arc of 'G' (270° arc from top, going CW, stopping at 3 o'clock)
    bbox = [(cx - rad, cy - rad), (cx + rad, cy + rad)]
    arc_width = lw + round(2 * scale)
    d.arc(bbox, start=10, end=270, fill=PRIMARY, width=arc_width)

    # Horizontal bar of 'G' (the crossbar — right side)
    bar_y  = cy - round(2 * scale)
    bar_x0 = cx + round(4 * scale)
    bar_x1 = cx + rad - round(2 * scale)
    d.rectangle([(bar_x0, bar_y - lw // 2),
                 (bar_x1, bar_y + lw // 2 + round(2 * scale))],
                fill=PRIMARY)

    # Vertical right leg of 'G' (descends from crossbar to bottom of arc)
    leg_x  = bar_x1 - lw // 2
    leg_y0 = bar_y
    leg_y1 = cy + rad - round(2 * scale)
    d.rectangle([(leg_x, leg_y0),
                 (leg_x + lw + round(2 * scale), leg_y1)],
                fill=PRIMARY)

    # ── Corridor node dot (small circle bottom-right of G) ──
    dot_r  = max(2, round(9 * scale))
    dot_cx = cx + rad - round(2 * scale)
    dot_cy = cy + rad + round(2 * scale)
    # keep inside canvas
    dot_cx = min(dot_cx, size - pad - dot_r)
    dot_cy = min(dot_cy, size - pad - dot_r)
    d.ellipse([(dot_cx - dot_r, dot_cy - dot_r),
               (dot_cx + dot_r, dot_cy + dot_r)],
              fill=(*PRIMARY_DK, 255))

    return img


# ── 2. Apple touch icon  180 × 180 ────────────────────────────────────────────
def make_apple_touch():
    img = draw_icon(180)
    # Flatten RGBA → RGB with white background for PNG
    bg = Image.new("RGBA", img.size, (255, 255, 255, 255))
    bg.paste(img, mask=img.split()[3])
    path = os.path.join(OUT, "apple-touch-icon.png")
    bg.convert("RGB").save(path, "PNG", optimize=True)
    print(f"  ✓  {path}  (180×180)")


# ── 3 & 4. Favicons  32×32 and 16×16 ─────────────────────────────────────────
def make_favicon(px: int):
    img = draw_icon(px)
    bg = Image.new("RGBA", img.size, (255, 255, 255, 255))
    bg.paste(img, mask=img.split()[3])
    name = f"favicon-{px}x{px}.png"
    path = os.path.join(OUT, name)
    bg.convert("RGBA").save(path, "PNG", optimize=True)
    print(f"  ✓  {path}  ({px}×{px})")


if __name__ == "__main__":
    print("Generating GoLynk assets…")
    make_og()
    make_apple_touch()
    make_favicon(32)
    make_favicon(16)
    print("Done.")
