/* Mon-Tech Racing — motore prospettico condiviso (hero + pagina modello)
   Dai 4 punti di contatto delle ruote (in px della foto) si calcola
   un'omografia "terreno -> schermo": pavimento, scie e ombra vengono
   proiettati con la stessa prospettiva della foto del body.
   Unità del terreno: 1 = carreggiata, WB = passo.                         */
(() => {
  const WB = 1.6;
  const GROUND = [[0, 0], [WB, 0], [0, 1], [WB, 1]];   // fn, rn, ff, rf
  const CU = WB / 2, CV = 0.5;                         // centro dell'auto sul terreno

  function solveH(src, dst) {               // 4 punti -> 8 coefficienti (Gauss con pivot)
    const A = [], b = [];
    for (let i = 0; i < 4; i++) {
      const [x, y] = src[i], [X, Y] = dst[i];
      A.push([x, y, 1, 0, 0, 0, -X * x, -X * y]); b.push(X);
      A.push([0, 0, 0, x, y, 1, -Y * x, -Y * y]); b.push(Y);
    }
    for (let c = 0; c < 8; c++) {
      let p = c;
      for (let r = c + 1; r < 8; r++) if (Math.abs(A[r][c]) > Math.abs(A[p][c])) p = r;
      [A[c], A[p]] = [A[p], A[c]]; [b[c], b[p]] = [b[p], b[c]];
      for (let r = c + 1; r < 8; r++) {
        const f = A[r][c] / A[c][c];
        for (let k = c; k < 8; k++) A[r][k] -= f * A[c][k];
        b[r] -= f * b[c];
      }
    }
    const h = new Array(8);
    for (let r = 7; r >= 0; r--) {
      let s = b[r];
      for (let k = r + 1; k < 8; k++) s -= A[r][k] * h[k];
      h[r] = s / A[r][r];
    }
    return h;
  }
  function P(h, u, v) {                     // terreno -> schermo (+ w per l'orizzonte)
    const w = h[6] * u + h[7] * v + 1;
    return [(h[0] * u + h[1] * v + h[2]) / w, (h[3] * u + h[4] * v + h[5]) / w, w];
  }
  // dove finisce l'immagine (object-fit: contain, ancorata in basso) in un box bw x bh
  function imageFrame(m, bw, bh) {
    const s = Math.min(bw / m.nat[0], bh / m.nat[1]);
    return { s, ox: (bw - m.nat[0] * s) / 2, oy: bh - m.nat[1] * s };
  }
  function contactsIn(m, bw, bh, x0 = 0, y0 = 0) {
    const f = imageFrame(m, bw, bh), c = m.contact;
    return [c.fn, c.rn, c.ff, c.rf].map(([x, y]) => [x0 + f.ox + x * f.s, y0 + f.oy + y * f.s]);
  }
  function axis(m) {                        // versore ruota posteriore -> anteriore (direzione del muso)
    const dx = m.contact.fn[0] - m.contact.rn[0], dy = m.contact.fn[1] - m.contact.rn[1];
    const l = Math.hypot(dx, dy);
    return [dx / l, dy / l];
  }
  const ellipse = (cu, cv, ru, rv, n = 40) =>
    Array.from({ length: n }, (_, i) => { const t = (i / n) * Math.PI * 2; return [cu + Math.cos(t) * ru, cv + Math.sin(t) * rv]; });

  /* ------------------------------------------------ pavimento animato */
  // studio: 0..1, intensità dell'area chiara da studio fotografico dietro e sotto l'auto
  function createFloor(canvas, { debug = false, reduce = false, studio = 0, vivid = 1, gridOnLight = 0 } = {}) {
    const ctx = canvas.getContext("2d");
    let W = 0, H = 0, DPR = 1;
    const bg = { speed: 1, target: 1, travel: 0, accent: [82, 170, 50], accentT: [82, 170, 50] };
    const R = 15;
    const fade = (u, v) => { const d = Math.hypot(u - CU, (v - CV) * 1.15) / R; return d >= 1 ? 0 : (1 - d) ** 1.7; };
    const spawn = (any) => {
      let v;
      do v = CV + (Math.random() * 2 - 1) * 9; while (Math.abs(v - CV) < 1.3);
      const r = Math.random();
      return {
        v, u: any ? CU - R + Math.random() * 2 * R : CU - R - Math.random() * 4,
        len: 0.8 + Math.random() * 3, mul: 0.6 + Math.random() * 1.1,
        kind: r < 0.45 ? "accent" : r < 0.62 ? "alt" : "white",
      };
    };
    const streaks = Array.from({ length: 60 }, () => spawn(true));
    const dust = Array.from({ length: 70 }, () => ({ x: Math.random(), y: Math.random(), s: Math.random() }));

    function resize() {
      DPR = Math.min(devicePixelRatio || 1, 2);
      W = canvas.clientWidth; H = canvas.clientHeight;
      canvas.width = W * DPR; canvas.height = H * DPR;
      ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
      return DPR;
    }
    function polyline(h, pts, alphaFn, color) {
      for (let i = 0; i < pts.length - 1; i++) {
        const [u1, v1] = pts[i], [u2, v2] = pts[i + 1];
        const a = alphaFn((u1 + u2) / 2, (v1 + v2) / 2);
        if (a < 0.004) continue;
        const A = P(h, u1, v1), B = P(h, u2, v2);
        if (A[2] <= 0.05 || B[2] <= 0.05) continue;       // oltre l'orizzonte
        ctx.strokeStyle = `rgba(${color},${a})`; ctx.lineWidth = 1;
        ctx.beginPath(); ctx.moveTo(A[0], A[1]); ctx.lineTo(B[0], B[1]); ctx.stroke();
      }
    }
    function groundPoly(h, pts) {
      ctx.beginPath();
      pts.forEach(([u, v], i) => { const [x, y] = P(h, u, v); i ? ctx.lineTo(x, y) : ctx.moveTo(x, y); });
      ctx.closePath();
    }

    // h: omografia terreno->canvas · box: dove sta l'auto (per la luce alle spalle)
    function draw(dt, h, box, floorPts) {
      for (let i = 0; i < 3; i++) bg.accent[i] += (bg.accentT[i] - bg.accent[i]) * Math.min(dt * 2, 1);
      bg.speed += (bg.target - bg.speed) * Math.min(dt * 3, 1);
      const [ar, ag, ab] = bg.accent.map(Math.round), acc = `${ar},${ag},${ab}`;
      const v = reduce ? 0 : bg.speed;
      bg.travel += dt * v * 1.6;

      ctx.globalCompositeOperation = "source-over";
      let g = ctx.createLinearGradient(0, 0, 0, H);
      g.addColorStop(0, "#040507"); g.addColorStop(1, "#0a0c10");
      ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
      const gx = box.x + box.w * 0.55, gy = box.y + box.h * 0.25;
      g = ctx.createRadialGradient(gx, gy, 0, gx, gy, Math.max(W, H) * 0.6);
      g.addColorStop(0, `rgba(${acc},.16)`); g.addColorStop(0.45, `rgba(${acc},.04)`); g.addColorStop(1, "rgba(0,0,0,0)");
      ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);

      ctx.globalCompositeOperation = "lighter";
      // pozza di luce da studio (fa "leggere" l'ombra) + alone nel colore del modello
      for (let i = 0; i < 16; i++) {
        groundPoly(h, ellipse(CU, CV, 1.5 + i * 0.22, 1.0 + i * 0.17));
        ctx.fillStyle = "rgba(190,200,215,0.022)"; ctx.fill();
      }
      for (let i = 0; i < 12; i++) {
        groundPoly(h, ellipse(CU, CV, 2.0 + i * 0.4, 1.4 + i * 0.32));
        ctx.fillStyle = `rgba(${acc},0.024)`; ctx.fill();
      }

      // griglia (scorre con la pista); mask: 0..1 per punto del terreno
      const gs = 0.8, step = 0.6;
      const grid = (k, color, mask = () => 1) => {
        for (let kk = -18; kk <= 18; kk++) {
          const vv = CV + kk * gs, pts = [];
          for (let u = CU - R; u <= CU + R; u += step) pts.push([u, vv]);
          polyline(h, pts, (u, w) => 0.16 * k * fade(u, w) * mask(u, w), color);
        }
        const off = ((bg.travel % gs) + gs) % gs;
        for (let kk = -19; kk <= 19; kk++) {
          const uu = CU + kk * gs + off, pts = [];
          for (let w = CV - R; w <= CV + R; w += step) pts.push([uu, w]);
          polyline(h, pts, (u, w) => 0.11 * k * fade(u, w) * mask(u, w), color);
        }
      };
      grid(vivid, "255,255,255");

      // scie parallele all'auto
      const alt = bg.accentT[0] > 150 ? "82,170,50" : "225,27,34";
      for (const s of streaks) {
        s.u += dt * v * 2.2 * s.mul * (1 + v * 0.2);
        if (s.u - s.len > CU + R) Object.assign(s, spawn(false));
        const A = P(h, s.u, s.v), B = P(h, s.u - s.len * (0.6 + v * 0.25), s.v);
        if (A[2] <= 0.05 || B[2] <= 0.05) continue;
        const a = Math.min(1, fade(s.u, s.v) * (s.kind === "white" ? 0.5 : 1) * vivid);
        if (a < 0.01) continue;
        const c = s.kind === "accent" ? acc : s.kind === "alt" ? alt : "255,255,255";
        const lg = ctx.createLinearGradient(A[0], A[1], B[0], B[1]);
        lg.addColorStop(0, `rgba(${c},${a})`); lg.addColorStop(1, `rgba(${c},0)`);
        const C = P(h, s.u, s.v + 1), sc = Math.hypot(C[0] - A[0], C[1] - A[1]);
        ctx.strokeStyle = lg; ctx.lineWidth = Math.max(0.8, sc * 0.014); ctx.lineCap = "round";
        ctx.beginPath(); ctx.moveTo(A[0], A[1]); ctx.lineTo(B[0], B[1]); ctx.stroke();
      }

      // area chiara da studio: fondale curvo dietro l'auto + pavimento chiaro in prospettiva.
      // Sta sopra griglia e scie (che ci "entrano" sfumando) e sotto pulviscolo e vignetta.
      const st = typeof bg.studio === "number" ? bg.studio : studio;
      if (st > 0) {
        ctx.globalCompositeOperation = "source-over";
        // su schermi verticali (telefono) la luce è più alta e scende verso i testi
        const tall = H > W * 1.15;
        const bx = box.x + box.w * 0.5, by = box.y + box.h * (tall ? 0.75 : 0.42);
        const rr = tall ? Math.max(box.w * 1.05, H * 0.52) : box.w * 1.08, sy = tall ? 1.15 : 0.8;
        g = ctx.createRadialGradient(bx, by, 0, bx, by, rr);
        g.addColorStop(0, `rgba(249,250,251,${Math.min(1, 1.0 * st)})`);
        g.addColorStop(0.4, `rgba(242,244,246,${0.92 * st})`);
        g.addColorStop(0.68, `rgba(222,226,231,${0.5 * st})`);
        g.addColorStop(0.88, `rgba(188,194,202,${0.14 * st})`);
        g.addColorStop(1, "rgba(160,166,175,0)");
        ctx.save(); ctx.translate(bx, by); ctx.scale(1, sy); ctx.translate(-bx, -by);
        ctx.fillStyle = g; ctx.fillRect(bx - rr, by - rr, rr * 2, rr * 2); ctx.restore();
        for (let i = 0; i < 28; i++) {                      // pavimento: strati che si sommano verso il centro
          groundPoly(h, ellipse(CU, CV, 1.0 + i * 0.26, 0.8 + i * 0.2));
          ctx.fillStyle = `rgba(244,246,248,${0.08 * st})`; ctx.fill();
        }
        // un velo del colore del modello sul bordo dell'area chiara
        g = ctx.createRadialGradient(bx, by, rr * 0.55, bx, by, rr * 1.05);
        g.addColorStop(0, `rgba(${acc},0)`); g.addColorStop(0.6, `rgba(${acc},${0.08 * st})`); g.addColorStop(1, `rgba(${acc},0)`);
        ctx.save(); ctx.translate(bx, by); ctx.scale(1, sy * 0.9); ctx.translate(-bx, -by);
        ctx.fillStyle = g; ctx.fillRect(bx - rr * 1.1, by - rr * 1.1, rr * 2.2, rr * 2.2); ctx.restore();
        // la griglia continua, scura, anche sulla zona chiara sotto l'auto (sfuma verso il buio)
        if (gridOnLight > 0) {
          const lit = (u, w) => { const d = ((u - CU) / 7.5) ** 2 + ((w - CV) / 5.8) ** 2; return d >= 1 ? 0 : (1 - d) ** 1.2; };
          grid(gridOnLight * st, "38,42,50", lit);
        }
        ctx.globalCompositeOperation = "lighter";
      }

      // pulviscolo
      for (const d of dust) {
        d.y -= dt * (0.004 + d.s * 0.01); d.x += dt * 0.002 * v;
        if (d.y < 0) { d.y = 1; d.x = Math.random(); }
        if (d.x > 1) d.x = 0;
        ctx.fillStyle = `rgba(255,255,255,${0.12 + d.s * 0.3})`;
        ctx.fillRect(d.x * W, d.y * H, 1.3, 1.3);
      }

      ctx.globalCompositeOperation = "source-over";
      g = ctx.createRadialGradient(W / 2, H * 0.5, Math.min(W, H) * 0.3, W / 2, H * 0.5, Math.max(W, H) * 0.78);
      // vignetta: più leggera con lo studio su schermi verticali, dove sopra e sotto c'è tanto spazio
      g.addColorStop(0, "rgba(0,0,0,0)"); g.addColorStop(1, `rgba(0,0,0,${st > 0 && H > W * 1.15 ? .45 : .8})`);
      ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);

      if (debug && floorPts) {
        ctx.strokeStyle = "#0ff"; ctx.lineWidth = 2;
        groundPoly(h, [[0, 0], [WB, 0], [WB, 1], [0, 1]]); ctx.stroke();
        floorPts.forEach(([x, y]) => { ctx.fillStyle = "#0ff"; ctx.fillRect(x - 4, y - 4, 8, 8); });
      }
    }
    return { bg, resize, draw };
  }

  /* --------------------------------------------- ombra sotto l'auto */
  // canvas che sporge del 30% per lato dal box dell'auto (bw x bh)
  function paintShadow(canvas, m, bw, bh, DPR, debug = false) {
    const ctx = canvas.getContext("2d"), PAD = 0.3;
    const cw = bw * (1 + 2 * PAD), ch = bh * (1 + 2 * PAD);
    canvas.width = cw * DPR; canvas.height = ch * DPR;
    ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
    ctx.clearRect(0, 0, cw, ch);
    const pts = contactsIn(m, bw, bh, bw * PAD, bh * PAD), h = solveH(GROUND, pts);
    const fill = (poly, a) => {
      ctx.beginPath();
      poly.forEach(([u, v], i) => { const [x, y] = P(h, u, v); i ? ctx.lineTo(x, y) : ctx.moveTo(x, y); });
      ctx.closePath(); ctx.fillStyle = `rgba(0,0,0,${a})`; ctx.fill();
    };
    const rrect = (u0, u1, v0, v1, r, n = 10) => {
      const out = [], arc = (cu, cv, a0) => { for (let i = 0; i <= n; i++) { const t = a0 + (i / n) * Math.PI / 2; out.push([cu + Math.cos(t) * r, cv + Math.sin(t) * r]); } };
      arc(u1 - r, v1 - r, 0); arc(u0 + r, v1 - r, Math.PI / 2); arc(u0 + r, v0 + r, Math.PI); arc(u1 - r, v0 + r, Math.PI * 1.5);
      return out;
    };
    for (let i = 0; i < 18; i++) {                      // ombra d'ambiente sotto la scocca
      const e = -0.18 + i * 0.045;
      fill(rrect(-0.42 - e, WB + 0.48 + e, -0.05 - e, 1.05 + e, Math.max(0.05, 0.3 + e)), 0.07);
    }
    for (const [u, v] of [[0, 0.07], [WB, 0.07], [0, 0.93], [WB, 0.93]]) {   // contatto gomme
      for (let i = 0; i < 9; i++) fill(ellipse(u, v, 0.1 + i * 0.022, 0.06 + i * 0.016, 28), 0.15);
    }
    // sfuma tutto a zero prima dei bordi del canvas: con prospettive marcate
    // gli strati esterni escono dal riquadro e verrebbero tagliati di netto
    ctx.save();
    ctx.globalCompositeOperation = "destination-in";
    ctx.translate(cw / 2, ch / 2); ctx.scale(cw / 2, ch / 2);
    const fadeEdge = ctx.createRadialGradient(0, 0, 0, 0, 0, 1);
    fadeEdge.addColorStop(0, "#000"); fadeEdge.addColorStop(0.62, "#000"); fadeEdge.addColorStop(0.97, "rgba(0,0,0,0)");
    ctx.fillStyle = fadeEdge; ctx.fillRect(-1, -1, 2, 2);
    ctx.restore();
    if (debug) { ctx.fillStyle = "#f0f"; pts.forEach(([x, y]) => ctx.fillRect(x - 3, y - 3, 6, 6)); }
  }

  window.MTStage = { WB, GROUND, solveH, P, imageFrame, contactsIn, axis, ellipse, createFloor, paintShadow };
})();
