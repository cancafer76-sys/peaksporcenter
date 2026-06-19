from PIL import Image, ImageDraw, ImageFilter, ImageEnhance
import os

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
PUBLIC = os.path.join(ROOT, 'public')
SOURCE = r'C:\Users\ALPARSLAN\.cursor\projects\c-Users-ALPARSLAN-Desktop-cafer\assets\c__Users_ALPARSLAN_AppData_Roaming_Cursor_User_workspaceStorage_empty-window_images__8FCE31A5-860F-45A6-9FD6-A701A2AD33B4_-3c2ee4f2-f6b0-4300-bc84-e98f22444de1.png'

SIZE = 1024

if not os.path.exists(SOURCE):
    raise SystemExit(f'Logo source not found: {SOURCE}')


def crop_perfect_circle(img, size=SIZE):
    img = img.convert('RGBA')
    w, h = img.size
    side = min(w, h)
    left = (w - side) // 2
    top = (h - side) // 2
    square = img.crop((left, top, left + side, top + side))
    square = square.resize((size, size), Image.Resampling.LANCZOS)
    square = square.filter(ImageFilter.UnsharpMask(radius=1.0, percent=210, threshold=1))
    square = ImageEnhance.Contrast(square).enhance(1.06)
    square = ImageEnhance.Sharpness(square).enhance(1.2)

    mask = Image.new('L', (size, size), 0)
    ImageDraw.Draw(mask).ellipse((0, 0, size - 1, size - 1), fill=255)
    final = Image.new('RGBA', (size, size), (0, 0, 0, 0))
    final.paste(square, (0, 0), mask)
    return final


def save_assets(final):
    os.makedirs(PUBLIC, exist_ok=True)
    final.save(os.path.join(PUBLIC, 'logo-circle.png'), compress_level=3)

    for out_size, name in [(32, 'favicon-32x32.png'), (180, 'apple-touch-icon.png'), (192, 'favicon-192x192.png'), (512, 'logo-512.png')]:
        resized = final.resize((out_size, out_size), Image.Resampling.LANCZOS)
        if out_size >= 180:
            resized = resized.filter(ImageFilter.UnsharpMask(radius=0.8, percent=160, threshold=2))
        resized.save(os.path.join(PUBLIC, name), compress_level=3)

    final.resize((32, 32), Image.Resampling.LANCZOS).save(os.path.join(PUBLIC, 'favicon.ico'), sizes=[(32, 32)])

    og = Image.new('RGBA', (1200, 630), (5, 5, 5, 255))
    logo_og = final.resize((380, 380), Image.Resampling.LANCZOS)
    og.paste(logo_og, ((1200 - 380) // 2, (630 - 380) // 2 - 20), logo_og)
    og.convert('RGB').save(os.path.join(PUBLIC, 'og-image.jpg'), quality=95)


raw = Image.open(SOURCE)
final_logo = crop_perfect_circle(raw)
save_assets(final_logo)
print('Logo ready:', final_logo.size)
