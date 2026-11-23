/* Mon-Tech Racing — hero carousel prospettico
   - il pavimento (griglia, scie, luce) è proiettato con la STESSA prospettiva
     della foto del body: dai 4 punti di contatto delle ruote si calcola
     un'omografia "terreno -> schermo", così auto e pista combaciano
   - ombra d'ambiente + ombre di contatto sotto le 4 ruote, nella stessa
     prospettiva: l'auto poggia davvero sul pavimento
   - ingresso: arriva dal fondo e frena, poi la scansione "termoforma" il body
     dal disegno tecnico alla carrozzeria vera
   - uscita: sfreccia via con mosso, la pista accelera
   Aggiungi ?debug all'URL per vedere impronta e punti di contatto.       */
(() => {
  const MODELS = window.MT_MODELS.filter((m) => m.hero);   // solo i 9 della home
  const { WB, GROUND, solveH, P, contactsIn, axis } = window.MTStage;
  const AUTOPLAY_MS = 8000;
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const DEBUG = new URLSearchParams(location.search).has("debug");

  const $ = (id) => document.getElementById(id);
  const hero = $("hero"), car = $("car"), spin = $("carSpin");
  const imgBody = $("carBody"), imgLines = $("carLines"), scan = $("carScan");
  const shCv = $("carShadow");
  const bigName = $("bigName"), title = $("modelName"), tag = $("modelTag"), lead = $("modelLead");
  const link = $("modelLink"), dock = $("dock"), idxCur = $("idxCur"), idxTot = $("idxTot");
  const spec = $("spec"), specCard = $("specCard"), callout = $("callout");
  const calloutLine = $("calloutLine"), calloutDot = $("calloutDot"), calloutRing = $("calloutRing");
  const compact = matchMedia("(max-width: 1100px)");

  MODELS.forEach((m) => { [m.img, m.lines].forEach((s) => { const i = new Image(); i.src = s; }); });

  /* ------------------------------------------------------------ sfondo */
  // area chiara da studio dietro i modelli (?light=0 per confrontare con la versione tutta scura)
  const STUDIO = new URLSearchParams(location.search).get("light") === "0" ? 0 : 1;
  const floor = window.MTStage.createFloor($("heroBg"), { debug: DEBUG, reduce, studio: STUDIO });
  hero.classList.toggle("hero--studio", STUDIO > 0);      // linee e scansione scure sul fondo chiaro
  const bg = floor.bg;                      // velocità e colore della pista
  bg.accent = MODELS[0].accent.slice(); bg.accentT = MODELS[0].accent.slice();
  const mouse = { x: 0, y: 0, sx: 0, sy: 0 };
  let model = MODELS[0], floorPts = null, DPR = 1;

  function resize() { DPR = floor.resize(); drawShadow(); }
  addEventListener("resize", resize);

  function carBox() {                               // box di layout (senza transform)
    const w = car.offsetWidth, h = car.offsetHeight;
    return { x: car.offsetLeft - w / 2, y: car.offsetTop - h / 2, w, h };
  }

  let last = performance.now();
  function frame(now) {
    const dt = Math.min((now - last) / 1000, 0.05); last = now;
    mouse.sx += (mouse.x - mouse.sx) * Math.min(dt * 4, 1);
    mouse.sy += (mouse.y - mouse.sy) * Math.min(dt * 4, 1);

    // pan "camera": auto e pavimento si muovono insieme, il nome gigante in controfase
    const px = mouse.sx * 16, py = mouse.sy * 8;
    car.style.transform = `translate(calc(-50% + ${px}px), calc(-50% + ${py}px))`;
    bigName.style.transform = `translate(calc(-50% + ${mouse.sx * -34}px), calc(-50% + ${mouse.sy * -14}px))`;

    // il pavimento insegue (morbido) la prospettiva del modello corrente
    const b = carBox();
    const target = contactsIn(model, b.w, b.h, b.x + px, b.y + py);
    if (!floorPts) floorPts = target;
    const k = Math.min(dt * 3.5, 1);
    floorPts = floorPts.map((p, i) => [p[0] + (target[i][0] - p[0]) * k, p[1] + (target[i][1] - p[1]) * k]);

    floor.draw(dt, solveH(GROUND, floorPts), b, floorPts);
    updateSpecFx(b);
    requestAnimationFrame(frame);
  }

  /* --------------------------------------- scheda tecnica flottante */
  // la card si inclina verso l'auto e segue il mouse; la linea di richiamo
  // parte dal bordo della card e arriva sulla fiancata (sopra le ruote visibili)
  function updateSpecFx(b) {
    if (compact.matches) { specCard.style.transform = ""; return; }
    specCard.style.transform = `rotateY(${-5 + mouse.sx * 6}deg) rotateX(${mouse.sy * -4}deg)`;
    if (!callout.classList.contains("is-on")) return;
    const hr = hero.getBoundingClientRect(), cr = specCard.getBoundingClientRect();
    const sx = cr.left - hr.left, sy = cr.top - hr.top + 30;
    // aggancio sulla fiancata, spostato verso la ruota più vicina alla card
    const [fn, rn] = floorPts, [p, q] = fn[0] > rn[0] ? [fn, rn] : [rn, fn];
    const ax = p[0] * 0.72 + q[0] * 0.28, ay = p[1] * 0.72 + q[1] * 0.28 - b.h * 0.3;
    const ex = sx - 40;
    calloutLine.setAttribute("points", `${sx},${sy} ${ex},${sy} ${ax},${ay}`);
    for (const c of [calloutDot, calloutRing]) { c.setAttribute("cx", ax); c.setAttribute("cy", ay); }
  }

  const esc = (s) => s.replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
  function renderSpec(m, i) {
    $("specCode").textContent = `${String(i + 1).padStart(2, "0")} / ${String(MODELS.length).padStart(2, "0")}`;
    $("specName").textContent = m.name;
    $("specTag").textContent = m.tag;
    $("specGrid").innerHTML = m.specs.map(([k, v, wide]) =>
      `<div class="spec__row${wide ? " spec__row--wide" : ""}"><dt>${esc(k)}</dt><dd>${esc(v)}</dd></div>`).join("");
    $("specKit").innerHTML = m.kit.map((k) => `<li>${esc(k)}</li>`).join("");
    $("specKitWrap").hidden = !m.kit.length;
    $("specNote").textContent = m.note || "";
    $("specLink").href = m.page;
  }

  // numeri che "si contano" fino al valore (solo valori semplici tipo "260 mm", "≈ 85 g")
  function countUp(dd, delay) {
    const txt = dd.textContent, mm = txt.match(/^(≈\s*)?(\d+(?:,\d+)?)(\s.*)?$/);
    if (!mm || txt.includes("/") || reduce) return;
    const dec = (mm[2].split(",")[1] || "").length, target = parseFloat(mm[2].replace(",", "."));
    const t0 = performance.now() + delay, D = 900;
    const step = (now) => {
      const p = Math.min(Math.max((now - t0) / D, 0), 1), e = 1 - (1 - p) ** 3;
      dd.textContent = `${mm[1] || ""}${(target * e).toFixed(dec).replace(".", ",")}${mm[3] || ""}`;
      if (p < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }

  function specOut() {
    callout.classList.remove("is-on");
    spec.getAnimations().forEach((a) => a.cancel());
    return spec.animate([{ opacity: 1, translate: "0 0" }, { opacity: 0, translate: "24px 0" }],
      { duration: reduce ? 1 : 350, easing: "ease-in", fill: "forwards" }).finished;
  }
  function specIn() {
    spec.getAnimations().forEach((a) => a.cancel());
    spec.animate([{ opacity: 0, translate: "30px 0" }, { opacity: 1, translate: "0 0" }],
      { duration: reduce ? 1 : 700, easing: "cubic-bezier(.16,1,.3,1)", fill: "forwards" });
    const items = specCard.querySelectorAll(".spec__name, .spec__tag, .spec__row, .spec__kit li, .spec__note, .spec__foot");
    items.forEach((el, k) => el.animate([{ opacity: 0, transform: "translateY(8px)" }, { opacity: 1, transform: "none" }],
      { duration: 500, delay: 120 + k * 55, easing: "cubic-bezier(.16,1,.3,1)", fill: "backwards" }));
    specCard.querySelectorAll(".spec__row dd").forEach((dd, k) => countUp(dd, 200 + k * 80));
    setTimeout(() => callout.classList.add("is-on"), reduce ? 0 : 450);
  }

  // tablet/telefono: la scheda è un pannello che si apre con "Specifiche"
  let sheetOpen = false, specHover = false;
  spec.animate([{ opacity: 0 }], { duration: 0, fill: "forwards" });   // vuota finché non arriva il primo modello
  spec.addEventListener("pointerenter", () => (specHover = true));    // mentre la si legge, l'autoplay aspetta
  spec.addEventListener("pointerleave", () => (specHover = false));
  $("specOpen").addEventListener("click", () => { sheetOpen = true; spec.classList.add("is-open"); });
  $("specClose").addEventListener("click", () => { sheetOpen = false; spec.classList.remove("is-open"); });

  /* -------------------------------------------- ombra sotto l'auto */
  // canvas dentro .car__spin: si muove con l'auto in tutte le animazioni
  function drawShadow() {
    window.MTStage.paintShadow(shCv, model, car.offsetWidth, car.offsetHeight, DPR, DEBUG);
  }

  hero.addEventListener("pointermove", (e) => {
    const r = hero.getBoundingClientRect();
    mouse.x = (e.clientX - r.left) / r.width * 2 - 1;
    mouse.y = (e.clientY - r.top) / r.height * 2 - 1;
  });
  hero.addEventListener("pointerleave", () => { mouse.x = 0; mouse.y = 0; });

  /* -------------------------------------------------------- carousel */
  let cur = -1, busy = false, t0 = 0, paused = false, progress = 0;
  idxTot.textContent = String(MODELS.length).padStart(2, "0");

  MODELS.forEach((m, i) => {
    const b = document.createElement("button");
    b.className = "dock__item"; b.setAttribute("role", "tab");
    b.innerHTML = `<img src="${m.img}" alt=""><b>${m.name}</b><small>${m.tag.split(" · ")[0]}</small><span class="dock__bar"></span>`;
    b.addEventListener("click", () => go(i));
    dock.appendChild(b);
  });
  const dockItems = [...dock.children];
  const letters = (txt) => [...txt].map((c) => `<span>${c === " " ? "&nbsp;" : c}</span>`).join("");

  function setContent(m) {
    model = m;
    imgBody.src = m.img; imgLines.src = m.lines;
    imgBody.alt = `Carrozzeria ${m.name}`;
    bigName.innerHTML = letters(m.name);
    title.innerHTML = letters(m.name);
    // nomi lunghi (es. MUSTANG GT3): il testo si restringe per non invadere l'auto
    const n = m.name.length;
    bigName.style.fontSize = `${Math.min(21, 150 / n)}vw`;
    title.style.fontSize = `clamp(28px, min(4.4vw, ${Math.round(430 / n)}px), 64px)`;
    tag.textContent = m.tag; lead.textContent = m.lead; link.href = m.page;
    const [r, g, b] = m.accent;
    document.documentElement.style.setProperty("--accent", `rgb(${r},${g},${b})`);
    document.documentElement.style.setProperty("--accent-rgb", `${r}, ${g}, ${b}`);
    bg.accentT = m.accent.slice();
    drawShadow();
  }

  const wait = (ms) => new Promise((r) => setTimeout(r, ms));
  const anim = (el, kf, opt) => el.animate(kf, { fill: "forwards", ...opt });

  async function exit(dir) {
    bg.target = 9;
    const D = reduce ? 1 : 650;
    [...bigName.children].forEach((s, i) =>
      anim(s, [{ transform: "none", opacity: 1 }, { transform: `translateX(${-dir * 60}px)`, opacity: 0 }], { duration: D * .7, delay: i * 25, easing: "ease-in" }));
    [...title.children].forEach((s, i) =>
      anim(s, [{ transform: "none", opacity: 1 }, { transform: "translateY(-30%)", opacity: 0 }], { duration: D * .5, delay: i * 18, easing: "ease-in" }));
    // riparte in avanti lungo il proprio asse (verso il muso)
    const [fx, fy] = axis(model);
    await anim(spin, [
      { transform: "none", filter: "blur(0)", opacity: 1 },
      { transform: `translate3d(${fx * 80}vw, ${fy * 80}vw, 120px) skewX(${-Math.sign(fx) * 12}deg)`, filter: "blur(10px)", opacity: 0 },
    ], { duration: D, easing: "cubic-bezier(.6,0,.9,.4)" }).finished;
  }


  async function enter(dir) {
    [spin, imgBody, imgLines, scan, shCv, tag, lead].forEach((el) => el.getAnimations().forEach((a) => a.cancel()));
    hero.scrollLeft = hero.scrollTop = 0;
    anim(imgBody, [{ clipPath: "inset(0 100% 0 0)" }], { duration: 0 });
    anim(imgLines, [{ clipPath: "inset(0 0 0 0)", opacity: 0 }], { duration: 0 });
    anim(shCv, [{ opacity: 0 }], { duration: 0 });

    [...bigName.children].forEach((s, i) =>
      anim(s, [{ transform: "translateY(35%) scaleY(1.3)", opacity: 0 }, { transform: "none", opacity: 1 }],
        { duration: 1100, delay: 250 + i * 55, easing: "cubic-bezier(.16,1,.3,1)" }));
    [...title.children].forEach((s, i) =>
      anim(s, [{ transform: "translateY(60%)", opacity: 0 }, { transform: "none", opacity: 1 }],
        { duration: 800, delay: 500 + i * 35, easing: "cubic-bezier(.16,1,.3,1)" }));
    [tag, lead].forEach((el, i) =>
      anim(el, [{ transform: "translateY(10px)", opacity: 0 }, { transform: "none", opacity: 1 }],
        { duration: 700, delay: 650 + i * 120, easing: "ease-out" }));

    // arriva lungo il proprio asse (dal fondo, alle sue spalle) e frena
    const [fx, fy] = axis(model);
    anim(imgLines, [{ opacity: 0 }, { opacity: 1 }], { duration: 400 });
    const arrive = anim(spin, [
      { transform: `translate3d(${-fx * 40}vw, ${-fy * 40}vw, -1400px)`, filter: "blur(6px)", opacity: 0, offset: 0 },
      { opacity: 1, offset: 0.25 },
      { transform: `translate3d(${fx * 1.2}vw, ${fy * 1.2}vw, 30px)`, filter: "blur(0)", offset: 0.8 },
      { transform: "none", filter: "blur(0)", opacity: 1, offset: 1 },
    ], { duration: reduce ? 1 : 1500, easing: "cubic-bezier(.12,.8,.25,1)" });
    setTimeout(() => (bg.target = 1), 300);
    await wait(reduce ? 0 : 1050);

    // scansione: il disegno tecnico diventa carrozzeria, l'ombra "si posa"
    const S = reduce ? 1 : 1300, ease = "cubic-bezier(.65,0,.35,1)";
    anim(scan, [{ left: "0%", opacity: 0 }, { opacity: 1, offset: 0.08 }, { opacity: 1, offset: 0.9 }, { left: "100%", opacity: 0 }], { duration: S, easing: ease });
    anim(imgBody, [{ clipPath: "inset(0 100% 0 0)" }, { clipPath: "inset(0 0% 0 0)" }], { duration: S, easing: ease });
    anim(imgLines, [{ clipPath: "inset(0 0 0 0%)", opacity: 1 }, { clipPath: "inset(0 0 0 100%)", opacity: 1 }], { duration: S, easing: ease });
    anim(shCv, [{ opacity: 0 }, { opacity: 1 }], { duration: reduce ? 1 : 550, delay: S, easing: "ease-out", fill: "both" });   // ombra solo a scansione finita
    await arrive.finished;
    await wait(reduce ? 0 : S - 450);
  }

  async function go(i, dir) {
    if (busy || i === cur) return;
    busy = true;
    if (dir === undefined) dir = cur === -1 || i > cur ? 1 : -1;
    if (cur !== -1) await Promise.all([exit(dir), specOut()]);
    cur = (i + MODELS.length) % MODELS.length;
    setContent(MODELS[cur]);
    renderSpec(MODELS[cur], cur);
    setTimeout(specIn, reduce ? 0 : 1500);          // la scheda arriva mentre il body si "forma"
    idxCur.textContent = String(cur + 1).padStart(2, "0");
    dockItems.forEach((b, k) => b.setAttribute("aria-selected", k === cur));
    // porta in vista il modello attivo nel selettore (solo scroll del dock)
    const it = dockItems[cur];
    dock.scrollLeft = it.offsetLeft - (dock.clientWidth - it.offsetWidth) / 2;
    await enter(dir);
    busy = false;
    t0 = performance.now();
  }
  const next = () => go((cur + 1) % MODELS.length, 1);
  const prev = () => go((cur - 1 + MODELS.length) % MODELS.length, -1);
  $("next").addEventListener("click", next);
  $("prev").addEventListener("click", prev);
  addEventListener("keydown", (e) => { if (e.key === "ArrowRight") next(); if (e.key === "ArrowLeft") prev(); });

  let px0 = null;
  hero.addEventListener("pointerdown", (e) => { if (!e.target.closest("a,button")) px0 = e.clientX; });
  addEventListener("pointerup", (e) => {
    if (px0 === null) return;
    const dx = e.clientX - px0; px0 = null;
    if (Math.abs(dx) > 60) (dx < 0 ? next : prev)();
  });

  dock.addEventListener("pointerenter", () => (paused = true));
  dock.addEventListener("pointerleave", () => { paused = false; });
  const idxBar = document.querySelector(".hud__index i");
  function tick(now) {
    if (!busy && cur !== -1) {
      if (paused || specHover || sheetOpen || document.hidden || DEBUG) t0 = now - progress * AUTOPLAY_MS;
      progress = Math.min((now - t0) / AUTOPLAY_MS, 1);
      if (progress >= 1 && !reduce) { progress = 0; next(); }
    } else progress = 0;
    dockItems.forEach((b, k) => b.style.setProperty("--progress", k === cur ? progress : 0));
    idxBar.style.setProperty("--progress", progress);
    requestAnimationFrame(tick);
  }

  if (DEBUG) shCv.style.zIndex = 5;           // in debug ombra e punti sopra l'auto
  resize();
  requestAnimationFrame(frame);
  requestAnimationFrame(tick);
  const startId = new URLSearchParams(location.search).get("m");   // es. ?m=a-6r
  go(Math.max(0, MODELS.findIndex((m) => m.id === startId)), 1);
})();
