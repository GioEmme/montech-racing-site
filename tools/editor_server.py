"""Server locale per l'editor dei punti ruota.

Uso:  .venv/bin/python tools/editor_server.py   ->  http://localhost:5174/editor.html

Serve la cartella site/ senza cache e accetta POST /api/contacts, che riscrive
site/js/contacts-fix.js con i punti segnati nell'editor (li usa tutto il sito).
"""
import io
import json
import re
import shutil
import sys
import time
from functools import partial
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
SITE = ROOT / "site"
BODIES = ROOT / "sources" / "bodies"
UNDO = BODIES / ".undo"
ORIG = ROOT / "sources" / "originals"
sys.path.insert(0, str(ROOT / "tools"))
OUT = SITE / "js" / "contacts-fix.js"
CROPS = SITE / "js" / "crops-fix.js"
KEYS = ("fn", "rn", "ff", "rf")
ID = re.compile(r"^[a-z0-9-]{1,40}$")


def clean_contact(c):
    if c is None:
        return None
    out = {k: [round(float(c[k][0]), 1), round(float(c[k][1]), 1)] for k in KEYS}
    ext = c.get("ext") or {}
    ext = {k: round(max(-0.6, min(3.0, float(ext[k]))), 3) for k in ("f", "r", "n", "o") if k in ext}
    if any(ext.values()):
        out["ext"] = ext
    return out


def original_crop(mid):
    """Foto originale ritagliata esattamente come il ritaglio attuale (stessa misura e posizione)."""
    from PIL import Image
    f, meta = ORIG / f"{mid}.png", ORIG / f"{mid}.json"
    if not f.exists() or not meta.exists():
        return None
    o = json.loads(meta.read_text())
    w, h = Image.open(BODIES / f"{mid}.png").size
    return Image.open(f).convert("RGB").crop((o["ox"], o["oy"], o["ox"] + w, o["oy"] + h))


def crop_of(mid):
    return json.loads(CROPS.read_text().split("=", 1)[1].rstrip().rstrip(";")).get(mid) if CROPS.exists() else None


class Handler(SimpleHTTPRequestHandler):
    def end_headers(self):
        self.send_header("Cache-Control", "no-store")
        super().end_headers()

    def reply(self, obj, code=200):
        self.send_response(code)
        self.send_header("Content-Type", "application/json")
        self.end_headers()
        self.wfile.write(json.dumps(obj).encode())

    def read_json(self):
        return json.loads(self.rfile.read(int(self.headers.get("Content-Length", 0))))

    def do_GET(self):                      # foto originale allineata al ritaglio (per il pennello Ripristina)
        m = re.match(r"^/api/original/([a-z0-9-]{1,40})\.png", self.path)
        if not m:
            return super().do_GET()
        crop = original_crop(m.group(1))
        if crop is None:
            self.send_error(404)
            return
        buf = io.BytesIO()
        crop.save(buf, "PNG")
        data = buf.getvalue()
        self.send_response(200)
        self.send_header("Content-Type", "image/png")
        self.send_header("Content-Length", str(len(data)))
        self.end_headers()
        self.wfile.write(data)

    def do_POST(self):
        if self.path == "/api/pad":
            return self.pad()
        if self.path == "/api/brush":
            return self.brush()
        if self.path == "/api/erase":
            return self.erase()
        if self.path == "/api/undo":
            return self.undo()
        if self.path != "/api/contacts":
            self.send_error(404)
            return
        try:
            data = json.loads(self.rfile.read(int(self.headers.get("Content-Length", 0))))
            out = {}
            for mid, v in data.items():
                if not ID.match(mid):
                    raise ValueError(mid)
                out[mid] = {"contact": clean_contact(v["contact"]), "contact2": clean_contact(v.get("contact2"))}
        except Exception as e:  # dati non validi: non si tocca il file
            self.send_error(400, str(e))
            return
        # si fondono con quelli già salvati (più schede o sessioni non si cancellano a vicenda);
        # la misura della tela si prende sempre dal file di lavoro
        from PIL import Image
        cur = json.loads(OUT.read_text().split("=", 1)[1].rstrip().rstrip(";")) if OUT.exists() else {}
        for mid, v in out.items():
            f = BODIES / f"{mid}.png"
            if f.exists():
                v["nat"] = list(Image.open(f).size)
            cur[mid] = v
        body = json.dumps(cur, indent=1, sort_keys=True)
        OUT.write_text("/* Punti ruota segnati a mano con editor.html (generato: non modificare a mano). */\n"
                       f"window.MT_CONTACTS = {body};\n", encoding="utf-8")
        self.send_response(200)
        self.send_header("Content-Type", "application/json")
        self.end_headers()
        self.wfile.write(b'{"ok":true}')

    # bacchetta magica: rende trasparente l'area di colore simile collegata al punto cliccato
    def erase(self):
        try:
            d = self.read_json()
            mid, x, y, tol = d["id"], int(d["x"]), int(d["y"]), float(d.get("tol", 30))
            if not ID.match(mid):
                raise ValueError(mid)
            src = BODIES / f"{mid}.png"
            import numpy as np
            from PIL import Image
            from scipy import ndimage
            im = np.asarray(Image.open(src).convert("RGBA")).copy()
            H, W = im.shape[:2]
            if not (0 <= x < W and 0 <= y < H) or im[y, x, 3] < 10:
                return self.reply({"ok": False, "msg": "Lì è già trasparente"})
            rgb = im[..., :3].astype(np.float32)
            near = (np.linalg.norm(rgb - rgb[y, x], axis=2) <= tol) & (im[..., 3] > 0)
            lab, _ = ndimage.label(near)
            area = lab == lab[y, x]
            area = ndimage.binary_dilation(area, iterations=1)               # prende anche l'alone di bordo
            soft = ndimage.gaussian_filter(area.astype(np.float32), 0.8)
            UNDO.mkdir(parents=True, exist_ok=True)
            shutil.copy(src, UNDO / f"{mid}-{time.time_ns()}.png")
            im[..., 3] = (im[..., 3] * (1 - np.clip(soft * 1.5, 0, 1))).astype(np.uint8)
            Image.fromarray(im).save(src)
            self.rebuild(mid, src)
            self.reply({"ok": True, "px": int(area.sum()), "crop": crop_of(mid)})
        except Exception as e:
            self.reply({"ok": False, "msg": str(e)}, 400)

    # pennello: "restore" rimette la foto originale dove si passa, "erase" rende trasparente
    def brush(self):
        try:
            d = self.read_json()
            mid, mode, r = d["id"], d["mode"], max(1.0, float(d["r"]))
            pts = [(float(x), float(y)) for x, y in d["pts"]][:5000]
            if not ID.match(mid) or mode not in ("restore", "erase") or not pts:
                raise ValueError("dati non validi")
            import numpy as np
            from PIL import Image, ImageDraw, ImageFilter
            src = BODIES / f"{mid}.png"
            im = Image.open(src).convert("RGBA")
            orig = original_crop(mid) if mode == "restore" else None
            if mode == "restore" and orig is None:
                return self.reply({"ok": False, "msg": "Foto originale non disponibile per questa carrozzeria"})
            mask = Image.new("L", im.size, 0)
            dr = ImageDraw.Draw(mask)
            if len(pts) > 1:
                dr.line(pts, fill=255, width=int(r * 2), joint="curve")
            for x, y in pts:
                dr.ellipse((x - r, y - r, x + r, y + r), fill=255)
            k = np.asarray(mask.filter(ImageFilter.GaussianBlur(1.2)), np.float32)[..., None] / 255
            a = np.asarray(im).astype(np.float32)
            UNDO.mkdir(parents=True, exist_ok=True)
            shutil.copy(src, UNDO / f"{mid}-{time.time_ns()}.png")
            if mode == "erase":
                a[..., 3:] *= 1 - k
            else:
                o = np.asarray(orig, np.float32)
                hole = k * (1 - a[..., 3:] / 255)          # quanto manca in ogni pixel
                a[..., :3] = a[..., :3] * (1 - hole) + o * hole
                a[..., 3:] = np.maximum(a[..., 3:], k * 255)
            Image.fromarray(np.clip(a, 0, 255).astype(np.uint8)).save(src)
            self.rebuild(mid, src)
            self.reply({"ok": True})
        except Exception as e:
            self.reply({"ok": False, "msg": str(e)}, 400)

    # allarga la tela: spazio trasparente attorno al ritaglio (i punti ruota li sposta l'editor)
    def pad(self):
        try:
            d = self.read_json()
            mid, px = d["id"], int(d["px"])
            if not ID.match(mid) or not 1 <= px <= 400:
                raise ValueError("dati non validi")
            from PIL import Image
            meta = ORIG / f"{mid}.json"
            if meta.exists():
                o = json.loads(meta.read_text())
                px = min(px, o["ox"], o["oy"])
                if px < 1:
                    return self.reply({"ok": False, "msg": "La foto originale non ha altro margine"})
            src = BODIES / f"{mid}.png"
            im = Image.open(src).convert("RGBA")
            out = Image.new("RGBA", (im.width + 2 * px, im.height + 2 * px), (0, 0, 0, 0))
            out.paste(im, (px, px))
            out.save(src)
            if meta.exists():
                meta.write_text(json.dumps({"ox": o["ox"] - px, "oy": o["oy"] - px}))
            for b in UNDO.glob(f"{mid}-*.png") if UNDO.exists() else []:
                b.unlink()                 # gli annulla precedenti hanno un'altra misura
            self.rebuild(mid, src)
            self.reply({"ok": True, "px": px, "nat": [out.width, out.height], "crop": crop_of(mid)})
        except Exception as e:
            self.reply({"ok": False, "msg": str(e)}, 400)

    def undo(self):
        try:
            mid = self.read_json()["id"]
            if not ID.match(mid):
                raise ValueError(mid)
            backups = sorted(UNDO.glob(f"{mid}-*.png")) if UNDO.exists() else []
            if not backups:
                return self.reply({"ok": False, "msg": "Niente da annullare"})
            src = BODIES / f"{mid}.png"
            shutil.move(backups[-1], src)
            self.rebuild(mid, src)
            self.reply({"ok": True, "left": len(backups) - 1, "crop": crop_of(mid)})
        except Exception as e:
            self.reply({"ok": False, "msg": str(e)}, 400)

    @staticmethod
    def rebuild(mid, src):                 # stesse immagini web di tools/make_web_assets.py
        """Il file di lavoro può avere tela allargata: l'immagine del sito si ritaglia attorno all'auto
        e lo spostamento si scrive in site/js/crops-fix.js (così in scena l'auto resta della sua misura)."""
        import numpy as np
        from PIL import Image
        from make_web_assets import thin_lines
        im = Image.open(src).convert("RGBA")
        a = np.asarray(im)[..., 3] > 8
        ys, xs = np.nonzero(a)
        P = 10
        x0, y0 = max(int(xs.min()) - P, 0), max(int(ys.min()) - P, 0)
        x1, y1 = min(int(xs.max()) + P + 1, im.width), min(int(ys.max()) + P + 1, im.height)
        im = im.crop((x0, y0, x1, y1))
        crops = json.loads(CROPS.read_text().split("=", 1)[1].rstrip().rstrip(";")) if CROPS.exists() else {}
        crops[mid] = [x0, y0, x1 - x0, y1 - y0]
        CROPS.write_text("/* Ritaglio delle immagini web rispetto al file di lavoro (generato dall'editor). */\n"
                         f"window.MT_CROPS = {json.dumps(crops, sort_keys=True)};\n", encoding="utf-8")
        out = SITE / "assets" / "web"
        im.save(out / f"{mid}.webp", quality=88, method=6)
        L = thin_lines(np.asarray(im))
        rgba = np.zeros(L.shape + (4,), np.uint8)
        rgba[..., :3] = 255
        rgba[..., 3] = (L * 255).astype(np.uint8)
        Image.fromarray(rgba).save(out / f"{mid}-lines.webp", quality=90, method=6)

    def log_message(self, *a):
        pass


if __name__ == "__main__":
    srv = ThreadingHTTPServer(("127.0.0.1", 5174), partial(Handler, directory=str(SITE)))
    print("Editor: http://localhost:5174/editor.html")
    srv.serve_forever()
