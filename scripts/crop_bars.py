# Removes ONLY the solid black letterbox bars from phone screenshots.
# Tattoo pixels are never altered: this is a pure crop.
from PIL import Image
import numpy as np, glob, os, json, sys
src, out = sys.argv[1], sys.argv[2]
os.makedirs(out, exist_ok=True)
res = {}
for f in sorted(glob.glob(os.path.join(src, 'IMG_*.png'))):
    a = np.asarray(Image.open(f).convert('RGB')).astype(int)
    rowmax = a.max(axis=(1, 2))
    rowmean = a.mean(axis=(1, 2))
    content = np.where((rowmax > 40) | (rowmean > 12))[0]
    top, bot = int(content[0]), int(content[-1]) + 1
    colmax = a[top:bot].max(axis=(0, 2))
    cc = np.where(colmax > 40)[0]
    left, right = int(cc[0]), int(cc[-1]) + 1
    im = Image.open(f).crop((left, top, right, bot))
    name = os.path.splitext(os.path.basename(f))[0]
    im.save(os.path.join(out, name + '.png'))
    res[name] = dict(box=[left, top, right, bot], size=im.size)
    print(name, res[name])
json.dump(res, open(os.path.join(out, 'crops.json'), 'w'), indent=1)
