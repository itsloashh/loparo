# Crops the LOASH wordmark from the supplied logo card and lifts it off the
# stone background using a luminance key. Letterforms are not redrawn.
from PIL import Image, ImageFilter
import numpy as np, sys
im = Image.open(sys.argv[1]).convert('RGB')
box = (286, 112, 884, 482)
c = im.crop(box)
a = np.asarray(c).astype(float)
l = a.mean(axis=2)
alpha = np.clip((l - 48) / (115 - 48), 0, 1)
alpha = alpha * alpha * (3 - 2 * alpha)
# suppress isolated stone specks: require neighbourhood support
m = Image.fromarray((alpha * 255).astype('uint8'))
support = np.asarray(m.filter(ImageFilter.BoxBlur(6))).astype(float) / 255
alpha = alpha * np.clip((support - 0.06) / 0.12, 0, 1)
rgba = np.dstack([a, alpha * 255]).astype('uint8')
out = Image.fromarray(rgba, 'RGBA')
out = out.crop(out.getbbox())
out.save('public/brand/loash-wordmark.png', optimize=True)
w, h = out.size
for tw in (240, 640):
    out.resize((tw, round(h * tw / w)), Image.LANCZOS).save(f'public/brand/loash-wordmark-{tw}.webp', 'WEBP', quality=90)
print(out.size)
# preview
pv = Image.new('RGB', (w, h * 2), (14, 14, 15)); pv.paste(out, (0, 0), out)
pv2 = Image.new('RGB', (w, h), (60, 60, 64)); pv2.paste(out, (0, 0), out); pv.paste(pv2, (0, h))
pv.save(sys.argv[2])
