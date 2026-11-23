/* Editor dei punti ruota: si segnano le 4 ruote (8 con due auto) e si vedono
   subito pavimento prospettico e ombra. Salva via POST su tools/editor_server.py. */
(() => {
  const MODELS = window.MT_MODELS;
  const { GROUND, solveH, P, contactsIn, createFloor, paintShadow, SHADOW_BOX: SB, WB } = window.MTStage;
  const $ = (id) => document.getElementById(id);
  const KEYS = ["fn", "rn", "ff", "rf"];
  const LABEL = { fn: "Anteriore vicina", rn: "Posteriore vicina", ff: "Anteriore lontana", rf: "Posteriore lontana" };
  const COLOR = { fn: "var(--fn)", rn: "var(--rn)", ff: "var(--ff)", rf: "var(--rf)" };
  const clone = (o) => JSON.parse(JSON.stringify(o));

  const edits = clone(window.MT_CONTACTS || {});
  const start = Object.fromEntries(MODELS.map((m) => [m.id, { contact: clone(m.contact), contact2: m.contact2 ? clone(m.contact2) : null, nat: m.nat.slice() }]));
  let m = null, sel = { car: 1, k: "fn" }, view = null, showCar = true;

  /* ------------------------------------------------------------ elenco */
  const list = $("list");
  function renderList() {
    const q = $("q").value.trim().toLowerCase();
    list.innerHTML = MODELS.filter((x) => !q || x.name.toLowerCase().includes(q) || x.id.includes(q))
      .map((x) => `<button data-id="${x.id}" class="${x === m ? "on" : ""} ${edits[x.id] ? "done" : ""}">${x.name}<small>${edits[x.id] ? "✓ segnata" : x.category || ""}</small></button>`).join("");
  }
  $("q").addEventListener("input", renderList);
  list.addEventListener("click", (e) => { const b = e.target.closest("button"); if (b) select(b.dataset.id); });

  /* --------------------------------------------------- scelta del punto */
  function renderPoints() {
    const cars = m.contact2 ? [1, 2] : [1];
    $("points").innerHTML = cars.map((car) => KEYS.map((k) =>
      `<button class="pt ${car === 2 ? "c2" : ""} ${sel.car === car && sel.k === k ? "sel" : ""}" data-car="${car}" data-k="${k}" style="color:${COLOR[k]}"><i style="background:${COLOR[k]}"></i><span style="color:var(--ink)">${car === 2 ? "Auto 2 · " : m.contact2 ? "Auto 1 · " : ""}${LABEL[k]}</span></button>`
    ).join("")).join("");
  }
  $("points").addEventListener("click", (e) => {
    const b = e.target.closest(".pt"); if (!b) return;
    sel = { car: +b.dataset.car, k: b.dataset.k }; renderPoints(); renderHandles();
  });
  const next = () => {
    const order = (m.contact2 ? [1, 2] : [1]).flatMap((car) => KEYS.map((k) => ({ car, k })));
    const i = order.findIndex((o) => o.car === sel.car && o.k === sel.k);
    sel = order[(i + 1) % order.length];
  };

  /* -------------------------------------------------------------- vista */
  const stage = $("stage"), img = $("img"), shCv = $("shadow");
  const floor = createFloor($("floor"), { studio: 1 });
  floor.bg.speed = floor.bg.target = 0.6;
  function layout() {
    const W = stage.clientWidth, H = stage.clientHeight;
    const s = Math.min(W * 0.74 / m.nat[0], H * 0.72 / m.nat[1]);
    const bw = m.nat[0] * s, bh = m.nat[1] * s;
    view = { s, bw, bh, x: (W - bw) / 2, y: (H - bh) / 2 + H * 0.03 };
    // l'immagine web può essere ritagliata rispetto al file di lavoro (dopo "Allarga tela")
    const c = (window.MT_CROPS || {})[m.id] || [0, 0, m.nat[0], m.nat[1]];
    Object.assign(img.style, { left: view.x + c[0] * s + "px", top: view.y + c[1] * s + "px", width: c[2] * s + "px", height: c[3] * s + "px" });
    Object.assign(shCv.style, { left: view.x - bw * 0.3 + "px", top: view.y - bh * 0.3 + "px", width: bw * 1.6 + "px", height: bh * 1.6 + "px" });
    floor.resize();
    placeOrig();
    repaint();
  }
  function repaint() {
    paintShadow(shCv, m, view.bw, view.bh, Math.min(devicePixelRatio || 1, 2));
    renderHandles();
  }
  let last = performance.now();
  (function frame(now) {
    const dt = Math.min((now - last) / 1000, 0.05); last = now;
    if (view) {
      const pts = contactsIn(m, view.bw, view.bh, view.x, view.y);
      floor.draw(dt, solveH(GROUND, pts), { x: view.x, y: view.y, w: view.bw, h: view.bh }, pts);
    }
    requestAnimationFrame(frame);
  })(last);
  addEventListener("resize", () => m && layout());

  /* ------------------------------------------------------------ pallini */
  let handles = [];
  function renderHandles() {
    handles.forEach((h) => h.remove());
    handles = [];
    [[1, m.contact], [2, m.contact2]].forEach(([car, c]) => {
      if (!c) return;
      KEYS.forEach((k) => {
        const h = document.createElement("div");
        h.className = `h ${car === 2 ? "c2" : ""} ${sel.car === car && sel.k === k ? "sel" : ""}`;
        h.dataset.k = (car === 2 ? "2·" : "") + k.toUpperCase();
        h.style.cssText = `left:${view.x + c[k][0] * view.s}px;top:${view.y + c[k][1] * view.s}px;background:${COLOR[k]};border-color:${car === 2 ? COLOR[k] : "#fff"}`;
        h.addEventListener("pointerdown", (e) => startDrag(e, car, k));
        stage.appendChild(h);
        handles.push(h);
      });
      // maniglie per allungare l'ombra: avanti, dietro, lato vicino, lato lontano
      const h = solveH(GROUND, contactsIn(m, view.bw, view.bh, view.x, view.y, c)), x = { f: 0, r: 0, n: 0, o: 0, ...(c.ext || {}) };
      const spots = { f: [SB.f - x.f, 0.5], r: [SB.r + x.r, 0.5], n: [WB / 2, SB.n - x.n], o: [WB / 2, SB.o + x.o] };
      for (const [k, [u, v]] of Object.entries(spots)) {
        const [px, py] = P(h, u, v);
        const e = document.createElement("div");
        e.className = "x";
        e.dataset.k = (car === 2 ? "2·" : "") + EXT[k];
        e.style.cssText = `left:${px}px;top:${py + view.bh * 0.012}px`;
        e.addEventListener("pointerdown", (ev) => dragExt(ev, car, k));
        stage.appendChild(e);
        handles.push(e);
      }
    });
  }
  const EXT = { f: "Ombra avanti", r: "Ombra dietro", n: "Ombra lato vicino", o: "Ombra lato lontano" };
  function dragExt(e, car, k) {
    e.preventDefault(); e.stopPropagation();
    const c = car === 2 ? m.contact2 : m.contact;
    const inv = solveH(contactsIn(m, view.bw, view.bh, view.x, view.y, c), GROUND);   // schermo -> terreno
    const move = (ev) => {
      const r = stage.getBoundingClientRect();
      const [u, v] = P(inv, ev.clientX - r.left, ev.clientY - r.top - view.bh * 0.012);
      const val = { f: SB.f - u, r: u - SB.r, n: SB.n - v, o: v - SB.o }[k];
      c.ext = { ...(c.ext || {}), [k]: Math.round(Math.max(-0.6, Math.min(3, val)) * 1000) / 1000 };
      repaint();
    };
    const up = () => { removeEventListener("pointermove", move); removeEventListener("pointerup", up); save(); };
    addEventListener("pointermove", move); addEventListener("pointerup", up);
  }
  const toImg = (e) => {
    const r = stage.getBoundingClientRect();
    return [(e.clientX - r.left - view.x) / view.s, (e.clientY - r.top - view.y) / view.s].map((v) => Math.round(v * 10) / 10);
  };
  const setPoint = (car, k, p) => { (car === 2 ? m.contact2 : m.contact)[k] = p; };
  function startDrag(e, car, k) {
    e.preventDefault(); e.stopPropagation();
    sel = { car, k }; renderPoints();
    const move = (ev) => { setPoint(car, k, toImg(ev)); repaint(); };
    const up = () => { removeEventListener("pointermove", move); removeEventListener("pointerup", up); save(); };
    addEventListener("pointermove", move); addEventListener("pointerup", up);
  }
  /* -------------------------------- strumenti foto: bacchetta e pennelli */
  let tool = null;                          // null = punti ruota · "wand" · "restore" · "erase"
  const paint = $("paint"), pctx = paint.getContext("2d"), orig = $("orig");
  document.querySelectorAll(".tool").forEach((b) => b.addEventListener("click", () => {
    tool = tool === b.dataset.tool ? null : b.dataset.tool;
    document.querySelectorAll(".tool").forEach((x) => x.classList.toggle("on", x.dataset.tool === tool));
    stage.classList.toggle("wand", tool === "wand");
    stage.classList.toggle("brush", tool === "restore" || tool === "erase");
    $("tolBox").hidden = tool !== "wand";
    $("sizeBox").hidden = !(tool === "restore" || tool === "erase");
    $("undo").hidden = !tool;
    clearPaint(); lastPt = null;
  }));
  // fondo fucsia pieno (senza pavimento né ombra) per vedere i residui di sfondo
  $("fuchsia").addEventListener("click", () => stage.classList.toggle("check", $("fuchsia").classList.toggle("on")));
  $("showOrig").addEventListener("click", () => { orig.hidden = !$("showOrig").classList.toggle("on"); placeOrig(); });
  $("tol").addEventListener("input", () => { $("tolV").textContent = $("tol").value; });
  $("size").addEventListener("input", () => { $("sizeV").textContent = $("size").value; });
  function placeOrig() {
    if (orig.hidden || !view) return;
    orig.src = `/api/original/${m.id}.png?w=${m.nat[0]}&t=${m._t || Date.now()}`;
    orig.onerror = () => { $("status").textContent = "Foto originale non disponibile"; };
    Object.assign(orig.style, { left: view.x + "px", top: view.y + "px", width: view.bw + "px", height: view.bh + "px" });
  }
  const reloadImg = () => {
    const t = Date.now(), base = (u) => u.split("?")[0] + "?t=" + t;
    m.img = base(m.img); m.lines = base(m.lines);
    img.src = $("showLines").classList.contains("on") ? m.lines : m.img;
  };
  async function post(url, body) {
    $("status").textContent = "Lavoro…";
    try {
      const r = await fetch(url, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
      const j = await r.json();
      $("status").textContent = j.ok ? "Fatto ✓" : (j.msg || "Errore");
      if (j.ok) { if (j.crop) (window.MT_CROPS = window.MT_CROPS || {})[m.id] = j.crop; reloadImg(); m._t = Date.now(); layout(); }
    } catch { $("status").textContent = "Server dell'editor non attivo"; }
    clearPaint();
  }
  $("undo").addEventListener("click", () => post("/api/undo", { id: m.id }));
  // allarga la tela di 80 px per lato: la foto si sposta, quindi si spostano anche i punti ruota
  $("pad").addEventListener("click", async () => {
    $("status").textContent = "Allargo…";
    try {
      const r = await fetch("/api/pad", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id: m.id, px: 80 }) });
      const j = await r.json();
      if (!j.ok) { $("status").textContent = j.msg || "Errore"; return; }
      for (const c of [m.contact, m.contact2].filter(Boolean)) KEYS.forEach((k) => { c[k] = [c[k][0] + j.px, c[k][1] + j.px]; });
      m.nat = j.nat;
      if (j.crop) (window.MT_CROPS = window.MT_CROPS || {})[m.id] = j.crop;
      reloadImg(); m._t = Date.now(); layout(); save();
      $("status").textContent = `Tela allargata di ${j.px} px ✓`;
    } catch { $("status").textContent = "Server dell'editor non attivo"; }
  });

  // anteprima del pennello mentre si dipinge
  function clearPaint() {
    paint.width = stage.clientWidth * devicePixelRatio; paint.height = stage.clientHeight * devicePixelRatio;
    pctx.setTransform(devicePixelRatio, 0, 0, devicePixelRatio, 0, 0);
  }
  const brushR = () => +$("size").value;                 // raggio in px dello schermo
  // Shift + clic: linea retta dall'ultimo punto dipinto (come nei programmi di grafica)
  let lastPt = null;                                     // in coordinate della foto
  const toScreen = ([x, y]) => [view.x + x * view.s, view.y + y * view.s];
  stage.addEventListener("pointermove", (e) => {
    if (!(tool === "restore" || tool === "erase") || stroke) return;
    const r = stage.getBoundingClientRect(), p = [e.clientX - r.left, e.clientY - r.top];
    clearPaint();
    const col = tool === "restore" ? "62,224,122" : "255,63,90";
    if (e.shiftKey && lastPt) {                          // anteprima del tratto dritto
      pctx.strokeStyle = `rgba(${col},.45)`; pctx.lineCap = "round"; pctx.lineWidth = brushR() * 2;
      pctx.beginPath(); pctx.moveTo(...toScreen(lastPt)); pctx.lineTo(...p); pctx.stroke();
    }
    pctx.strokeStyle = `rgb(${col})`; pctx.lineWidth = 2;
    pctx.beginPath(); pctx.arc(p[0], p[1], brushR(), 0, Math.PI * 2); pctx.stroke();
  });
  addEventListener("keyup", (e) => { if (e.key === "Shift" && stroke == null) clearPaint(); });
  let stroke = null;
  function startStroke(e) {
    const r = stage.getBoundingClientRect();
    if (e.shiftKey && lastPt) {                          // segmento dritto: niente trascinamento
      const end = toImg(e);
      post("/api/brush", { id: m.id, mode: tool, r: brushR() / view.s, pts: [lastPt, end] });
      lastPt = end;
      return;
    }
    stroke = { pts: [toImg(e)], last: [e.clientX - r.left, e.clientY - r.top] };
    clearPaint();
    pctx.fillStyle = pctx.strokeStyle = tool === "restore" ? "rgba(62,224,122,.45)" : "rgba(255,63,90,.45)";
    pctx.lineCap = pctx.lineJoin = "round"; pctx.lineWidth = brushR() * 2;
    pctx.beginPath(); pctx.arc(stroke.last[0], stroke.last[1], brushR(), 0, Math.PI * 2); pctx.fill();
    const move = (ev) => {
      const p = [ev.clientX - r.left, ev.clientY - r.top];
      pctx.beginPath(); pctx.moveTo(...stroke.last); pctx.lineTo(...p); pctx.stroke();
      stroke.last = p; stroke.pts.push(toImg(ev));
    };
    const up = () => {
      removeEventListener("pointermove", move); removeEventListener("pointerup", up);
      const pts = stroke.pts; stroke = null; lastPt = pts[pts.length - 1];
      post("/api/brush", { id: m.id, mode: tool, r: brushR() / view.s, pts });
    };
    addEventListener("pointermove", move); addEventListener("pointerup", up);
  }

  stage.addEventListener("pointerdown", (e) => {
    if (tool === "restore" || tool === "erase") { e.preventDefault(); startStroke(e); return; }
    if (tool === "wand") {
      const [x, y] = toImg(e);
      post("/api/erase", { id: m.id, x: Math.round(x), y: Math.round(y), tol: +$("tol").value });
      return;
    }
    if (e.target.closest(".h, .x")) return;
    setPoint(sel.car, sel.k, toImg(e));
    next(); renderPoints(); repaint(); save();
  });

  /* ----------------------------------------------------------- comandi */
  $("two").addEventListener("click", () => {
    if (m.contact2) { m.contact2 = null; if (sel.car === 2) sel = { car: 1, k: "fn" }; }
    else {                                  // auto 2: si parte da una copia spostata a sinistra
      m.contact2 = Object.fromEntries(KEYS.map((k) => [k, [m.contact[k][0] - m.nat[0] * 0.25, m.contact[k][1] - m.nat[1] * 0.1]]));
      sel = { car: 2, k: "fn" };
    }
    $("two").classList.toggle("on", !!m.contact2);
    renderPoints(); repaint(); save();
  });
  $("showCar").addEventListener("click", () => {
    showCar = !showCar; $("showCar").classList.toggle("on", showCar);
    img.style.opacity = showCar ? 1 : 0.15;
  });
  $("showLines").addEventListener("click", () => {
    const on = $("showLines").classList.toggle("on");
    img.src = on ? m.lines : m.img; img.style.filter = on ? "invert(1) brightness(.3)" : "";
  });
  $("reset").addEventListener("click", () => {
    m.contact = clone(start[m.id].contact); m.contact2 = start[m.id].contact2 ? clone(start[m.id].contact2) : null;
    const d = (m.nat[0] - start[m.id].nat[0]) / 2;    // se la tela è stata allargata, i punti di partenza si spostano
    for (const c of [m.contact, m.contact2].filter(Boolean)) KEYS.forEach((k) => { c[k] = [c[k][0] + d, c[k][1] + d]; });
    $("two").classList.toggle("on", !!m.contact2);
    sel = { car: 1, k: "fn" }; renderPoints(); repaint(); save();
  });

  /* ---------------------------------------------------------- salvataggio */
  let timer = null;
  function save() {
    edits[m.id] = { contact: clone(m.contact), contact2: m.contact2 ? clone(m.contact2) : null, nat: m.nat.slice() };
    $("status").textContent = "Salvo…";
    clearTimeout(timer);
    timer = setTimeout(async () => {
      try {
        const r = await fetch("/api/contacts", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ [m.id]: edits[m.id] }) });   // solo la carrozzeria modificata
        $("status").textContent = r.ok ? "Salvato ✓" : "Errore nel salvataggio";
      } catch { $("status").textContent = "Server dell'editor non attivo"; }
      renderList();
    }, 300);
  }

  /* ------------------------------------------------------------ avvio */
  function select(id) {
    m = MODELS.find((x) => x.id === id) || MODELS[0];
    history.replaceState(null, "", `?m=${m.id}`);
    sel = { car: 1, k: "fn" }; lastPt = null;
    $("two").classList.toggle("on", !!m.contact2);
    $("showLines").classList.remove("on"); img.style.filter = "";
    $("open").href = m.page;
    floor.bg.accent = m.accent.slice(); floor.bg.accentT = m.accent.slice();
    $("status").textContent = edits[m.id] ? "Segnata ✓" : "";
    m.img = m.img.split("?")[0] + "?t=" + Date.now(); m.lines = m.lines.split("?")[0] + "?t=" + Date.now();   // sempre l'immagine appena salvata
    img.src = m.img;
    renderList(); renderPoints();
    if (img.complete) layout(); else img.onload = layout;
    layout();
  }
  select(new URLSearchParams(location.search).get("m") || MODELS[0].id);
})();
