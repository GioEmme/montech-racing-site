"""Da PNG scontornato -> asset web per l'hero.

Uso: python make_web_assets.py body.png out_dir nome [--lines-only]

Crea:
  <nome>.webp        body con trasparenza, ottimizzato per il web
  <nome>-lines.webp  versione "disegno tecnico": contorni a tratto sottile, linee bianche
                     (il colore finale, bianco o antracite, lo decide il CSS)

--lines-only rigenera solo il disegno tecnico.
"""
import sys
from pathlib import Path

import numpy as np
from PIL import Image
from scipy import ndimage


def thin_lines(rgba, width=1.2):
    """Tratto sottile: si tiene solo il crinale dei bordi (soppressione dei
    non-massimi + isteresi, come nel rilevatore di Canny) più la sagoma esterna."""
    a = rgba.astype(np.float32) / 255
    alpha = a[..., 3]
    lum = (0.299 * a[..., 0] + 0.587 * a[..., 1] + 0.114 * a[..., 2]) * alpha
    lum = ndimage.gaussian_filter(lum, 1.3)
    gx, gy = ndimage.sobel(lum, 1), ndimage.sobel(lum, 0)
    g = np.hypot(gx, gy) * ndimage.binary_erosion(alpha > 0.5, iterations=3)

    ang = (np.rad2deg(np.arctan2(gy, gx)) + 180) % 180
    pad, (H, W) = np.pad(g, 1), g.shape
    sh = lambda dy, dx: pad[1 + dy:1 + dy + H, 1 + dx:1 + dx + W]
    ridge = np.zeros_like(g, bool)
    for lo, hi, (dy, dx) in [(0, 22.5, (0, 1)), (157.5, 180, (0, 1)), (22.5, 67.5, (1, 1)),
                             (67.5, 112.5, (1, 0)), (112.5, 157.5, (1, -1))]:
        m = (ang >= lo) & (ang < hi)
        ridge |= m & (g >= sh(dy, dx)) & (g >= sh(-dy, -dx))
    nms = np.where(ridge, g, 0)

    lab, _ = ndimage.label(nms > 0.06, structure=np.ones((3, 3)))       # isteresi
    keep = np.isin(lab, np.unique(lab[nms > 0.16])) & (lab > 0)
    edge = keep.astype(np.float32) * np.clip(0.55 + nms * 1.6, 0, 1)

    body = alpha > 0.5
    sil = (body & ~ndimage.binary_erosion(body)).astype(np.float32)    # sagoma, 1 px
    lines = ndimage.gaussian_filter(np.maximum(edge * 0.85, sil), width * 0.5)
    return np.clip(lines * (2.2 / max(width, 0.6)), 0, 1)


if __name__ == "__main__":
    src, out, name = sys.argv[1], Path(sys.argv[2]), sys.argv[3]
    lines_only = "--lines-only" in sys.argv
    out.mkdir(parents=True, exist_ok=True)
    im = Image.open(src).convert("RGBA")
    if not lines_only:
        im.save(out / f"{name}.webp", quality=88, method=6)
    L = thin_lines(np.asarray(im))
    rgba = np.zeros(L.shape + (4,), np.uint8)
    rgba[..., :3] = 255
    rgba[..., 3] = (L * 255).astype(np.uint8)
    Image.fromarray(rgba).save(out / f"{name}-lines.webp", quality=90, method=6)
    print(name, im.size, "(solo disegno)" if lines_only else "")
