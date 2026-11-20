"""Workflow: foto body RC su fondo chiaro -> PNG con fondo trasparente ritagliato sul body.

Uso:  python body_cutout.py input.jpg output.png [--pad 10]

Passi:
 1. Segmentazione del soggetto con rembg (modello isnet-general-use, gestisce
    bene le carrozzerie argento/bianche dove una soglia sul colore fallisce).
 2. Rinforzo: parti scure e sottili (minigonne, splitter) che il modello lascia
    semitrasparenti tornano body. Si prendono solo pixel SCURI vicini al body e
    non collegati al fondo chiaro, cosi' l'ombra grigia a terra resta fuori.
 3. Trimap: zona sicuramente body, sicuramente fondo e una fascia sottile di
    incertezza lungo il contorno.
 4. Alpha matting (pymatting, closed-form) nella fascia: trasparenza graduale
    sul bordo invece di scalini.
 5. Decontaminazione colore: stima il colore reale dei pixel di bordo togliendo
    il bianco dello sfondo, cosi' niente alone chiaro su fondi scuri.
 6. Ritaglio al riquadro del body + piccolo margine.
"""
import argparse

import numpy as np
from PIL import Image
from pymatting import estimate_alpha_cf, estimate_foreground_ml
from rembg import new_session, remove
from scipy import ndimage


def cutout(src: str, dst: str, pad: int = 10, model: str = "isnet-general-use",
           bg_lum: int = 200, dark_lum: int = 65, band: int = 3,
           smooth: float = 2.0) -> None:
    img = Image.open(src).convert("RGB")
    rgb = np.asarray(img)

    # 1. segmentazione
    m = np.asarray(remove(img, session=new_session(model)))[..., 3]

    # 2. rinforzo parti scure
    lum = rgb.mean(axis=2)
    sat = rgb.max(axis=2).astype(int) - rgb.min(axis=2)
    lab, _ = ndimage.label((lum > bg_lum) & (sat < 40))
    border = np.unique(np.concatenate([lab[0], lab[-1], lab[:, 0], lab[:, -1]]))
    background = np.isin(lab, border[border > 0])
    # zone scure intere (anche se alte decine di px) purche' collegate al body:
    # si prende ogni componente scura che tocca l'intorno del body del modello
    near_body = ndimage.binary_dilation(m > 25, iterations=15)
    dark_all = (lum < dark_lum) & ~background
    lab_d, _ = ndimage.label(dark_all)
    touching = np.unique(lab_d[near_body & dark_all])
    dark = np.isin(lab_d, touching[touching > 0])
    body = ndimage.binary_fill_holes((m >= 128) | dark)  # riempie scritte chiare
    body = ndimage.binary_opening(body, iterations=2)     # via puntini isolati
    lab, n = ndimage.label(body)                          # tiene solo il pezzo
    if n > 1:                                             # principale (+ grandi)
        sizes = ndimage.sum(body, lab, range(1, n + 1))
        body = np.isin(lab, 1 + np.flatnonzero(sizes >= 0.01 * sizes.max()))
    if smooth > 0:                                        # contorno levigato:
        body = ndimage.gaussian_filter(body.astype(np.float32), smooth) > 0.5

    # 3. trimap: 1 = body, 0 = fondo, 0.5 = incerto
    sure_fg = ndimage.binary_erosion(body, iterations=band)
    maybe = ndimage.binary_dilation(body, iterations=band)
    trimap = np.where(sure_fg, 1.0, np.where(maybe, 0.5, 0.0))

    # 4-5. matting + decontaminazione, calcolati solo nel riquadro del body
    ys, xs = np.nonzero(maybe)
    h, w = m.shape
    m2 = band + 5
    ya, yb = max(ys.min() - m2, 0), min(ys.max() + m2 + 1, h)
    xa, xb = max(xs.min() - m2, 0), min(xs.max() + m2 + 1, w)
    im = rgb[ya:yb, xa:xb].astype(np.float64) / 255.0
    tri = trimap[ya:yb, xa:xb]
    alpha = estimate_alpha_cf(im, tri)
    # il matting segue il rumore JPEG -> bordo puntinato: mediano + leggera
    # sfocatura, applicati solo nella fascia incerta
    soft = ndimage.gaussian_filter(ndimage.median_filter(alpha, size=5), 0.8)
    alpha = np.where(tri == 0.5, soft, alpha)
    alpha[alpha < 0.03] = 0
    alpha[alpha > 0.97] = 1
    fg = estimate_foreground_ml(im, alpha)
    rgba = np.dstack([fg, alpha])
    rgba = (np.clip(rgba, 0, 1) * 255 + 0.5).astype(np.uint8)

    # 6. ritaglio al body
    ys, xs = np.nonzero(rgba[..., 3] > 0)
    y0, y1 = max(ys.min() - pad, 0), min(ys.max() + pad + 1, rgba.shape[0])
    x0, x1 = max(xs.min() - pad, 0), min(xs.max() + pad + 1, rgba.shape[1])
    out = Image.fromarray(rgba[y0:y1, x0:x1])
    out.save(dst, optimize=True)
    print(f"{src} {w}x{h} -> {dst} {out.width}x{out.height}")


if __name__ == "__main__":
    p = argparse.ArgumentParser()
    p.add_argument("src")
    p.add_argument("dst")
    p.add_argument("--pad", type=int, default=10)
    p.add_argument("--model", default="isnet-general-use")
    p.add_argument("--band", type=int, default=3,
                   help="mezza larghezza in px della fascia di bordo per il matting")
    p.add_argument("--dark", type=int, default=65,
                   help="luminosita' max (0-255) delle parti scure da recuperare")
    p.add_argument("--smooth", type=float, default=2.0,
                   help="levigatura del contorno prima del matting (0 = off)")
    args = p.parse_args()
    cutout(args.src, args.dst, args.pad, args.model, dark_lum=args.dark,
           band=args.band, smooth=args.smooth)
