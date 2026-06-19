from PIL import Image, ImageDraw, ImageFont
import os

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
PUBLIC = os.path.join(ROOT, 'public')
SRC = os.path.join(PUBLIC, 'logo-circle.png')

img = Image.open(SRC).convert('RGBA')
w, h = img.size
px = img.load()
min_x, min_y, max_x, max_y = w, h, 0, 0
for y in range(h):
    for x in range(w):
        r, g, b, a = px[x, y]
        if a < 40:
            continue
        lum = r + g + b
        is_logo = (g > 90 and g > r + 20) or lum > 170
        if is_logo:
            min_x = min(min_x, x)
            min_y = min(min_y, y)
            max_x = max(max_x, x)
            max_y = max(max_y, y)

pad = 2
img = img.crop((max(0, min_x - pad), max(0, min_y - pad), min(w, max_x + pad), min(h, max_y + pad)))
side = max(img.size)
square = Image.new('RGBA', (side, side), (0, 0, 0, 0))
ox = (side - img.size[0]) // 2
oy = (side - img.size[1]) // 2
square.paste(img, (ox, oy), img)
mask = Image.new('L', (side, side), 0)
draw = ImageDraw.Draw(mask)
draw.ellipse((0, 0, side - 1, side - 1), fill=255)
circle = Image.new('RGBA', (side, side), (0, 0, 0, 0))
circle.paste(square, (0, 0), mask)
circle.save(os.path.join(PUBLIC, 'logo-circle.png'), optimize=True)

for size, name in [(32, 'favicon-32x32.png'), (180, 'apple-touch-icon.png'), (192, 'favicon-192x192.png'), (512, 'logo-512.png')]:
    out = circle.resize((size, size), Image.Resampling.LANCZOS)
    out.save(os.path.join(PUBLIC, name), optimize=True)

ico = circle.resize((32, 32), Image.Resampling.LANCZOS)
ico.save(os.path.join(PUBLIC, 'favicon.ico'), sizes=[(32, 32)])

og = Image.new('RGBA', (1200, 630), (5, 5, 5, 255))
logo_size = 420
logo_og = circle.resize((logo_size, logo_size), Image.Resampling.LANCZOS)
og.paste(logo_og, ((1200 - logo_size) // 2, (630 - logo_size) // 2 - 30), logo_og)
og.convert('RGB').save(os.path.join(PUBLIC, 'og-image.jpg'), quality=92)
print('Brand assets generated')
