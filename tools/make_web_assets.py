"""Da PNG scontornato -> asset web per l'hero.

Uso: python make_web_assets.py body.png out_dir nome

Crea:
  <nome>.webp        body con trasparenza, ottimizzato per il web
  <nome>-lines.webp  versione "disegno tecnico": solo i contorni, linee bianche
"""
import sys
from pathlib import Path

import numpy as np
from PIL import Image
from scipy import ndimage

src, out, name = sys.argv[1], Path(sys.argv[2]), sys.argv[3]
out.mkdir(parents=True, exist_ok=True)
im = Image.open(src).convert("RGBA")
im.save(out / f"{name}.webp", quality=88, method=6)

a = np.asarray(im).astype(np.float32) / 255
alpha = a[..., 3]
lum = (0.299 * a[..., 0] + 0.587 * a[..., 1] + 0.114 * a[..., 2]) * alpha
lum = ndimage.gaussian_filter(lum, 1.0)
g = np.hypot(ndimage.sobel(lum, 0), ndimage.sobel(lum, 1))
inner = ndimage.binary_erosion(alpha > 0.5, iterations=2)
g = g * inner
g = np.clip((g - 0.06) / 0.25, 0, 1) ** 0.8            # solo i bordi netti
sil = np.hypot(ndimage.sobel(alpha, 0), ndimage.sobel(alpha, 1))
sil = np.clip(sil / 1.5, 0, 1)                            # sagoma esterna
lines = np.maximum(g * 0.75, sil)
rgba = np.zeros(alpha.shape + (4,), np.uint8)
rgba[..., :3] = 255
rgba[..., 3] = (lines * 255).astype(np.uint8)
Image.fromarray(rgba).save(out / f"{name}-lines.webp", quality=90, method=6)
print(name, im.size)
