from PIL import Image, ImageDraw, ImageFilter
import os

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
PUBLIC = os.path.join(ROOT, 'public')
SRC = os.path.join(
    ROOT,
    '.cursor',
    'projects',
    'c-Users-ALPARSLAN-Desktop-cafer',
    'assets',
    'c__Users_ALPARSLAN_AppData_Roaming_Cursor_User_workspaceStorage_empty-window_images__FA9EBFA9-E659-4978-8F14-03D6236F0256_-999e146c-028d-42e7-827f-fb0b35284e17.png'
)

# Fallback: asset path from workspace cursor folder
ALT_SRC = r'C:\Users\ALPARSLAN\.cursor\projects\c-Users-ALPARSLAN-Desktop-cafer\assets\c__Users_ALPARSLAN_AppData_Roaming_Cursor_User_workspaceStorage_empty-window_images__FA9EBFA9-E659-4978-8F14-03D6236F0256_-999e146c-028d-42e7-827f-fb0b35284e17.png'

source = SRC if os.path.exists(SRC) else ALT_SRC
if not os.path.exists(source):
    raise SystemExit(f'Logo source not found: {source}')

img = Image.open(source).convert('RGBA')
w, h = img.size
px = img.load()

min_x, min_y, max_x, max_y = w, h, 0, 0
for y in range(h):
    for x in range(w):
        r, g, b, a = px[x, y]
        lum = r + g + b
        if lum > 95 and max(r, g, b) - min(r, g, b) < 40:
            min_x = min(min_x, x)
            min_y = min(min_y, y)
            max_x = max(max_x, x)
            max_y = max(max_y, y)

pad = 8
trimmed = img.crop((
    max(0, min_x - pad),
    max(0, min_y - pad),
    min(w, max_x + pad),
    min(h, max_y + pad)
))

size = 512
canvas = Image.new('RGBA', (size, size), (0, 0, 0, 0))
draw = ImageDraw.Draw(canvas)
draw.ellipse((8, 8, size - 9, size - 9), fill=(8, 8, 8, 255))
draw.ellipse((8, 8, size - 9, size - 9), outline=(60, 60, 60, 180), width=3)

tw, th = trimmed.size
scale = (size - 96) / max(tw, th)
nw, nh = int(tw * scale), int(th * scale)
logo = trimmed.resize((nw, nh), Image.Resampling.LANCZOS)
ox = (size - nw) // 2
oy = (size - nh) // 2
canvas.paste(logo, (ox, oy), logo)

mask = Image.new('L', (size, size), 0)
ImageDraw.Draw(mask).ellipse((0, 0, size - 1, size - 1), fill=255)
final = Image.new('RGBA', (size, size), (0, 0, 0, 0))
final.paste(canvas, (0, 0), mask)

os.makedirs(PUBLIC, exist_ok=True)
final.save(os.path.join(PUBLIC, 'logo-circle.png'), optimize=True)

for out_size, name in [(32, 'favicon-32x32.png'), (180, 'apple-touch-icon.png'), (192, 'favicon-192x192.png'), (512, 'logo-512.png')]:
    final.resize((out_size, out_size), Image.Resampling.LANCZOS).save(os.path.join(PUBLIC, name), optimize=True)

final.resize((32, 32), Image.Resampling.LANCZOS).save(os.path.join(PUBLIC, 'favicon.ico'), sizes=[(32, 32)])

og = Image.new('RGBA', (1200, 630), (5, 5, 5, 255))
logo_og = final.resize((360, 360), Image.Resampling.LANCZOS)
og.paste(logo_og, ((1200 - 360) // 2, (630 - 360) // 2 - 20), logo_og)
og.convert('RGB').save(os.path.join(PUBLIC, 'og-image.jpg'), quality=92)
print('Logo built from', source)
