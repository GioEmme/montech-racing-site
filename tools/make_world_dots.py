"""Planisfero a puntini per la pagina Distributori.

Uso: python make_world_dots.py land-110m.json out.json

land-110m.json: terre emerse in TopoJSON (pacchetto npm world-atlas, Natural Earth 110m).
Uscita: {"w":1000,"h":..,"latMax":..,"latMin":..,"step":..,"dots":[[x,y],...]}
Proiezione equirettangolare: x = (lng+180)/360*w, y = (latMax-lat)/(latMax-latMin)*h
"""
import json
import sys

import numpy as np

W, LAT_MAX, LAT_MIN, STEP = 1000, 76.0, -56.0, 6.2
H = W * (LAT_MAX - LAT_MIN) / 360


def decode(topo):
    """Archi quantizzati (delta) -> coordinate lng/lat."""
    sx, sy = topo["transform"]["scale"]
    tx, ty = topo["transform"]["translate"]
    arcs = []
    for arc in topo["arcs"]:
        x = y = 0
        pts = []
        for dx, dy in arc:
            x += dx; y += dy
            pts.append((x * sx + tx, y * sy + ty))
        arcs.append(pts)
    return arcs


def ring(arcs, idx):
    out = []
    for i in idx:
        pts = arcs[i] if i >= 0 else arcs[~i][::-1]
        out.extend(pts[1:] if out else pts)
    return np.array(out)


def inside(px, py, poly):
    """Ray casting vettoriale: quali punti stanno dentro il poligono."""
    x, y = poly[:, 0], poly[:, 1]
    x2, y2 = np.roll(x, -1), np.roll(y, -1)
    res = np.zeros(px.shape, bool)
    for a, b, c, d in zip(x, y, x2, y2):
        cond = ((b > py) != (d > py)) & (px < (c - a) * (py - b) / (d - b + 1e-12) + a)
        res ^= cond
    return res


topo = json.load(open(sys.argv[1]))
arcs = decode(topo)
rings = []
for g in topo["objects"]["land"]["geometries"]:
    polys = g["arcs"] if g["type"] == "MultiPolygon" else [g["arcs"]]
    for poly in polys:
        rings.append([ring(arcs, r) for r in poly])  # [esterno, buchi...]

# griglia sfalsata (righe alterne spostate di mezzo passo)
pts = []
rows = int(H / STEP)
for r in range(rows + 1):
    yy = r * STEP
    off = STEP / 2 if r % 2 else 0
    for xx in np.arange(off, W, STEP):
        pts.append((xx, yy))
pts = np.array(pts)
lng = pts[:, 0] / W * 360 - 180
lat = LAT_MAX - pts[:, 1] / H * (LAT_MAX - LAT_MIN)

land = np.zeros(len(pts), bool)
for poly in rings:
    outer = poly[0]
    box = (lng >= outer[:, 0].min()) & (lng <= outer[:, 0].max()) & (lat >= outer[:, 1].min()) & (lat <= outer[:, 1].max())
    if not box.any():
        continue
    idx = np.flatnonzero(box)
    hit = inside(lng[idx], lat[idx], outer)
    for hole in poly[1:]:
        hit &= ~inside(lng[idx], lat[idx], hole)
    land[idx[hit]] = True

dots = [[round(float(x), 1), round(float(y), 1)] for x, y in pts[land]]
json.dump({"w": W, "h": round(H, 2), "latMax": LAT_MAX, "latMin": LAT_MIN, "step": STEP, "dots": dots},
          open(sys.argv[2], "w"), separators=(",", ":"))
print(f"{len(dots)} puntini su {len(pts)} · mappa {W}x{H:.0f}")
