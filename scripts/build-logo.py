from PIL import Image, ImageDraw, ImageFilter, ImageEnhance
import os

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
PUBLIC = os.path.join(ROOT, 'public')
ALT_SRC = r'C:\Users\ALPARSLAN\.cursor\projects\c-Users-ALPARSLAN-Desktop-cafer\assets\c__Users_ALPARSLAN_AppData_Roaming_Cursor_User_workspaceStorage_empty-window_images__FA9EBFA9-E659-4978-8F14-03D6236F0256_-999e146c-028d-42e7-827f-fb0b35284e17.png'

source = ALT_SRC
if not os.path.exists(source):
    raise SystemExit(f'Logo source not found: {source}')

SIZE = 1024


def luminance(r, g, b):
    return 0.299 * r + 0.587 * g + 0.114 * b


def extract_logo_rgba(img):
    """Remove dark square background; keep embossed logo pixels only."""
    img = img.convert('RGBA')
    w, h = img.size
    out = Image.new('RGBA', (w, h), (0, 0, 0, 0))
    src = img.load()
    dst = out.load()

    min_x, min_y, max_x, max_y = w, h, 0, 0
    for y in range(h):
        for x in range(w):
            r, g, b, a = src[x, y]
            lum = luminance(r, g, b)
            if lum < 52:
                continue
            alpha = min(255, int((lum - 52) * 4.2))
            if alpha < 18:
                continue
            dst[x, y] = (r, g, b, alpha)
            min_x = min(min_x, x)
            min_y = min(min_y, y)
            max_x = max(max_x, x)
            max_y = max(max_y, y)

    pad = 6
    cropped = out.crop((
        max(0, min_x - pad),
        max(0, min_y - pad),
        min(w, max_x + pad),
        min(h, max_y + pad)
    ))
    return cropped


def build_circular_logo(logo_rgba, size=SIZE):
    canvas = Image.new('RGBA', (size, size), (0, 0, 0, 0))
    draw = ImageDraw.Draw(canvas)

    # Pure circular background — no square
    draw.ellipse((0, 0, size - 1, size - 1), fill=(6, 6, 6, 255))
    draw.ellipse((10, 10, size - 11, size - 11), fill=(14, 14, 14, 255))
    draw.ellipse((18, 18, size - 19, size - 19), fill=(10, 10, 10, 255))

    lw, lh = logo_rgba.size
    inner = size - 48
    scale = inner / max(lw, lh)
    nw, nh = int(lw * scale), int(lh * scale)
    logo = logo_rgba.resize((nw, nh), Image.Resampling.LANCZOS)
    logo = logo.filter(ImageFilter.UnsharpMask(radius=1.4, percent=220, threshold=1))
    logo = ImageEnhance.Contrast(logo).enhance(1.18)
    logo = ImageEnhance.Sharpness(logo).enhance(1.5)

    ox = (size - nw) // 2
    oy = (size - nh) // 2
    canvas.paste(logo, (ox, oy), logo)

    # Hard circular clip — corners fully transparent
    mask = Image.new('L', (size, size), 0)
    ImageDraw.Draw(mask).ellipse((0, 0, size - 1, size - 1), fill=255)
    final = Image.new('RGBA', (size, size), (0, 0, 0, 0))
    final.paste(canvas, (0, 0), mask)
    return final


def save_assets(final):
    os.makedirs(PUBLIC, exist_ok=True)
    final.save(os.path.join(PUBLIC, 'logo-circle.png'), compress_level=3)

    for out_size, name in [(32, 'favicon-32x32.png'), (180, 'apple-touch-icon.png'), (192, 'favicon-192x192.png'), (512, 'logo-512.png')]:
        resized = final.resize((out_size, out_size), Image.Resampling.LANCZOS)
        if out_size >= 180:
            resized = resized.filter(ImageFilter.UnsharpMask(radius=0.8, percent=140, threshold=2))
        resized.save(os.path.join(PUBLIC, name), compress_level=3)

    final.resize((32, 32), Image.Resampling.LANCZOS).save(os.path.join(PUBLIC, 'favicon.ico'), sizes=[(32, 32)])

    og = Image.new('RGBA', (1200, 630), (5, 5, 5, 255))
    logo_og = final.resize((380, 380), Image.Resampling.LANCZOS)
    og.paste(logo_og, ((1200 - 380) // 2, (630 - 380) // 2 - 20), logo_og)
    og.convert('RGB').save(os.path.join(PUBLIC, 'og-image.jpg'), quality=95)


raw = Image.open(source)
logo_only = extract_logo_rgba(raw)
final_logo = build_circular_logo(logo_only)
save_assets(final_logo)
print('Circular sharp logo ready:', final_logo.size)
