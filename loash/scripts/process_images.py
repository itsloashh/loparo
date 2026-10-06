# Generates responsive WebP renditions + tiny blur placeholders.
# Resize/encode only; artwork pixels are not edited.
from PIL import Image
import glob, os, json, io, base64, sys
src, out = '.assets/cropped', 'public/work'
mapping = json.load(open('scripts/slugs.json'))
meta = {}
for name, slug in mapping.items():
    im = Image.open(os.path.join(src, name + '.png')).convert('RGB')
    w, h = im.size
    for tw in (480, 828, 1170):
        r = im if tw >= w else im.resize((tw, round(h * tw / w)), Image.LANCZOS)
        r.save(f'{out}/{slug}-{tw}.webp', 'WEBP', quality=82, method=6)
    t = im.copy(); t.thumbnail((16, 16)); b = io.BytesIO(); t.save(b, 'WEBP', quality=40)
    avg = im.resize((1, 1), Image.LANCZOS).getpixel((0, 0))
    meta[slug] = dict(width=w, height=h, blur='data:image/webp;base64,' + base64.b64encode(b.getvalue()).decode(),
                      tone='#%02x%02x%02x' % avg, source=name)
json.dump(meta, open('scripts/image-meta.json', 'w'), indent=1)
print(json.dumps({k: (v['width'], v['height'], v['tone']) for k, v in meta.items()}, indent=0))
