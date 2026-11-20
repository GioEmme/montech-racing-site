# Mon-Tech Racing — sito

Sito statico (HTML, CSS e JavaScript, senza build) per Mon-Tech Racing, produttore di carrozzerie RC a Scandiano.

## Pagine (`site/`)

| Pagina | File |
|---|---|
| Home con hero prospettico | `index.html` |
| Tutte le carrozzerie, filtri per categoria | `carrozzerie.html` |
| Pagina prodotto (`?m=<id>`) | `model.html` |
| BlacKollection (tema nero e oro) | `blackollection.html` |
| Option Parts | `optionparts.html` |
| Distributori con mappa | `distributori.html` |
| Chi siamo e contatti | `chisiamo.html` |

Dati: `js/models.js` (carrozzerie), `js/accessories.js` (BlacKollection e Option Parts), `js/distributors.js` (distributori).

## Provarlo in locale

```bash
cd site && python3 -m http.server 5173
```

Poi apri http://localhost:5173

## Pubblicazione

Vercel pubblica la cartella `site` (vedi `vercel.json`). Ogni push sul ramo `main` aggiorna il sito.

## Strumenti (`tools/`, `body_cutout.py`)

- `body_cutout.py` — scontorno di una foto su fondo chiaro: `python body_cutout.py foto.jpg out.png`
  (richiede `rembg`, `pymatting`, `scipy`, `pillow`)
- `tools/make_web_assets.py` — da PNG scontornato a WebP + versione "disegno tecnico"
- `tools/make_world_dots.py` — planisfero a puntini della pagina Distributori

Gli scontorni originali in PNG sono in `sources/bodies/` (non vengono pubblicati).
