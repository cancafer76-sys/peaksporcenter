from PIL import Image
import os

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
PUBLIC = os.path.join(ROOT, 'public')

sources = [
    os.path.join(PUBLIC, 'logo-brand.png'),
    os.path.join(PUBLIC, 'logo-icon.png'),
    os.path.join(PUBLIC, 'logo-circle.png'),
    os.path.join(PUBLIC, 'logo-full.png'),
]
src_path = next((p for p in sources if os.path.exists(p)), None)
if not src_path:
    raise SystemExit('No logo source found in public/')

img = Image.open(src_path).convert('RGBA')
side = max(img.size)
square = Image.new('RGBA', (side, side), (0, 0, 0, 0))
ox = (side - img.size[0]) // 2
oy = (side - img.size[1]) // 2
square.paste(img, (ox, oy), img)

outputs = [
    (16, 'favicon-16x16.png'),
    (32, 'favicon-32x32.png'),
    (48, 'favicon-48x48.png'),
    (32, 'favicon.png'),
    (180, 'apple-touch-icon.png'),
    (192, 'favicon-192x192.png'),
    (512, 'pwa-icon.png'),
    (512, 'logo-512.png'),
]

for size, name in outputs:
    out = square.resize((size, size), Image.Resampling.LANCZOS)
    if name == 'pwa-icon.png':
        canvas = Image.new('RGBA', (size, size), (5, 5, 5, 255))
        canvas.paste(out, (0, 0), out)
        canvas.save(os.path.join(PUBLIC, name), optimize=True)
    else:
        out.save(os.path.join(PUBLIC, name), optimize=True)

maskable_size = 512
inner = int(maskable_size * 0.72)
resized = square.resize((inner, inner), Image.Resampling.LANCZOS)
maskable = Image.new('RGBA', (maskable_size, maskable_size), (5, 5, 5, 255))
offset = (maskable_size - inner) // 2
maskable.paste(resized, (offset, offset), resized)
maskable.save(os.path.join(PUBLIC, 'pwa-icon-maskable.png'), optimize=True)

ico = square.resize((32, 32), Image.Resampling.LANCZOS)
ico.save(os.path.join(PUBLIC, 'favicon.ico'), sizes=[(32, 32)])

print('Favicons generated from', os.path.basename(src_path))
