"""Scarica le foto originali (non scontornate) di ogni carrozzeria e le allinea al ritaglio.

Uso:  .venv/bin/python tools/fetch_originals.py [id ...]

Per ogni modello prova la foto in evidenza e quelle della pagina prodotto su
mon-techracing.net, trova quella (e la scala/posizione) che combacia con
sources/bodies/<id>.png e salva sources/originals/<id>.png: stessa misura del
ritaglio, pixel per pixel, con 200 px di margine (posizione in <id>.json). Serve al pennello "Ripristina" dell'editor.
"""
import io
import json
import re
import sys
import urllib.request
from pathlib import Path

import numpy as np
from PIL import Image
from scipy.signal import fftconvolve

ROOT = Path(__file__).resolve().parent.parent
BODIES, OUT = ROOT / "sources" / "bodies", ROOT / "sources" / "originals"
API = "https://mon-techracing.net/wp-json/wp/v2"
UA = {"User-Agent": "Mozilla/5.0"}
MARGIN = 200


def get(url):
    return urllib.request.urlopen(urllib.request.Request(url, headers=UA), timeout=60).read()


def candidates(slug):
    post = json.loads(get(f"{API}/posts?slug={slug}&_fields=featured_media,content"))[0]
    urls = []
    if post["featured_media"]:
        urls.append(json.loads(get(f"{API}/media/{post['featured_media']}?_fields=source_url"))["source_url"])
    for u in re.findall(r'(?:src|href)="(https://mon-techracing\.net/wp-content/uploads/[^"]+\.(?:jpe?g|png|webp))"',
                        post["content"]["rendered"], flags=re.I):
        u = re.sub(r"-\d+x\d+(\.\w+)$", r"\1", u)
        if u not in urls:
            urls.append(u)
    # anche le altre foto della libreria media con lo stesso nome (es. quelle usate in home)
    try:
        q = slug.split("-")[0]
        for it in json.loads(get(f"{API}/media?search={q}&per_page=30&_fields=source_url")):
            if it["source_url"] not in urls and re.search(r"\.(jpe?g|png|webp)$", it["source_url"], re.I):
                urls.append(it["source_url"])
    except Exception:
        pass
    return urls[:16]


def gray(a):
    return a[..., :3].astype(np.float32).mean(axis=2) / 255


def match(cut, photo):
    """Scala e spostamento che portano il ritaglio sulla foto (minimo errore sui pixel opachi)."""
    T, M = gray(cut), (cut[..., 3] > 200).astype(np.float32)
    best = None
    for k in np.geomspace(0.25, 1.6, 34):          # quante volte la foto va ridimensionata
        w, h = int(photo.width * k), int(photo.height * k)
        if w < cut.shape[1] or h < cut.shape[0]:
            continue
        f = 160 / cut.shape[1]                       # ricerca grossolana a bassa risoluzione
        I = gray(np.asarray(photo.resize((max(1, int(w * f)), max(1, int(h * f))))))
        t = np.asarray(Image.fromarray((T * 255).astype(np.uint8)).resize((160, max(1, int(cut.shape[0] * f))))) / 255
        m = np.asarray(Image.fromarray((M * 255).astype(np.uint8)).resize(t.shape[::-1])) / 255
        if I.shape[0] < t.shape[0] or I.shape[1] < t.shape[1]:
            continue
        flip = lambda a: a[::-1, ::-1]
        ssd = (fftconvolve(I * I, flip(m), "valid") - 2 * fftconvolve(I, flip(m * t), "valid") + (m * t * t).sum()) / m.sum()
        y, x = np.unravel_index(np.argmin(ssd), ssd.shape)
        if best is None or ssd[y, x] < best[0]:
            best = (float(ssd[y, x]), k, x / f, y / f)
    return best


def align(mid, slug):
    cut = np.asarray(Image.open(BODIES / f"{mid}.png").convert("RGBA"))
    results = []
    for u in candidates(slug):
        try:
            photo = Image.open(io.BytesIO(get(u))).convert("RGB")
        except Exception:
            continue
        r = match(cut, photo)
        if r:
            results.append((r, photo, u))
    (err, k, x, y), photo, u = min(results, key=lambda t: t[0][0])
    # rifinitura: scala fine (passi dello 0,25%) e posizione al pixel, su metà risoluzione
    T, M = gray(cut), cut[..., 3] > 200
    h2 = lambda a: a[::2, ::2]
    T2, M2 = h2(T), h2(M)
    best = None
    for kk in k * (1 + np.linspace(-0.06, 0.06, 49)):
        big = photo.resize((int(photo.width * kk), int(photo.height * kk)), Image.BILINEAR)
        G = gray(np.asarray(big))
        cx, cy = x * kk / k, y * kk / k
        for dy in range(-8, 9, 2):
            for dx in range(-8, 9, 2):
                X, Y = int(round(cx)) + dx, int(round(cy)) + dy
                if X < 0 or Y < 0 or X + cut.shape[1] > big.width or Y + cut.shape[0] > big.height:
                    continue
                e = float(((h2(G[Y:Y + cut.shape[0], X:X + cut.shape[1]]) - T2) ** 2)[M2].mean())
                if best is None or e < best[0]:
                    best = (e, kk, X, Y)
    _, k, X0, Y0 = best
    big = photo.resize((int(photo.width * k), int(photo.height * k)), Image.LANCZOS)
    G = gray(np.asarray(big))
    best = None
    for dy in range(-2, 3):
        for dx in range(-2, 3):
            X, Y = X0 + dx, Y0 + dy
            if X < 0 or Y < 0 or X + cut.shape[1] > big.width or Y + cut.shape[0] > big.height:
                continue
            e = float(((G[Y:Y + cut.shape[0], X:X + cut.shape[1]] - T) ** 2)[M].mean())
            if best is None or e < best[0]:
                best = (e, X, Y)
    e, X, Y = best
    # si salva con un margine attorno: serve per allargare la tela e ripristinare oltre il bordo del ritaglio
    M = MARGIN
    canvas = Image.new("RGB", (cut.shape[1] + 2 * M, cut.shape[0] + 2 * M), (255, 255, 255))
    canvas.paste(big, (M - X, M - Y))                     # fuori dalla foto resta bianco
    canvas.save(OUT / f"{mid}.png")
    (OUT / f"{mid}.json").write_text(json.dumps({"ox": M, "oy": M}))   # dove inizia il ritaglio nella foto salvata
    return e, u


if __name__ == "__main__":
    OUT.mkdir(parents=True, exist_ok=True)
    models = json.loads(sys.stdin.read())          # [[id, slug], ...]
    only = set(sys.argv[1:])
    for mid, slug in models:
        if only and mid not in only:
            continue
        try:
            e, u = align(mid, slug)
            print(f"{mid:16s} err {e:.4f}  {'OK' if e < 0.012 else 'DA CONTROLLARE'}  {u.split('/')[-1]}", flush=True)
        except Exception as ex:
            print(f"{mid:16s} ERRORE {ex}", flush=True)
