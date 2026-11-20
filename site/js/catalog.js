/* Mon-Tech Racing — catalogo accessori (BlacKollection / Option Parts)
   La pagina indica la linea con <body data-line="black|option">.
   Filtri per sotto-categoria (?cat=), scheda prodotto a pannello (?p=<id>).  */
(() => {
  const line = document.body.dataset.line;
  const ITEMS = window.MT_ACCESSORIES[line];
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const $ = (id) => document.getElementById(id);
  const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
  const code = (i) => `${line === "black" ? "BK" : "OP"}-${String(i + 1).padStart(2, "0")}`;

  /* ------------------------------------------------------------ filtri */
  const cats = [...new Set(ITEMS.map((p) => p.cat))];
  const filters = $("filters");
  const chip = (label, value, n) => `<button class="chip" data-cat="${esc(value)}" aria-pressed="false">${esc(label)} <small>${n}</small></button>`;
  filters.innerHTML = chip("Tutti", "", ITEMS.length) + cats.map((c) => chip(c, c, ITEMS.filter((p) => p.cat === c).length)).join("");
  const countAll = $("countAll"); if (countAll) countAll.textContent = ITEMS.length;

  /* --------------------------------------------------------------- card */
  const grid = $("grid");
  grid.innerHTML = ITEMS.map((p, i) => {
    const media = p.cut
      ? `<img class="pcard__cut" src="${p.cut}" alt="${esc(p.name)}" loading="lazy" draggable="false">`
      : `<img class="pcard__photo" src="${p.img}" alt="${esc(p.name)}" loading="lazy" draggable="false">`;
    const spec = (p.specs || [])[0];
    return `
    <button class="pcard" data-i="${i}" data-cat="${esc(p.cat)}" style="--vt: p-${p.id}" aria-label="Apri ${esc(p.name)}">
      <span class="pcard__media">${media}<i class="pcard__mark" aria-hidden="true"></i></span>
      <span class="pcard__meta"><span class="pcard__code">${code(i)}</span><span class="pcard__cat">${esc(p.cat)}</span></span>
      <span class="pcard__name">${esc(p.name)}</span>
      ${spec ? `<span class="pcard__spec">${esc(spec[0])} · <b>${esc(spec[1])}</b></span>` : `<span class="pcard__spec">${p.photos.length} foto</span>`}
      <span class="pcard__go" aria-hidden="true">+</span>
    </button>`;
  }).join("");
  const cards = [...grid.children];

  function apply(cat, animate) {
    const run = () => {
      filters.querySelectorAll(".chip").forEach((b) => b.setAttribute("aria-pressed", b.dataset.cat === cat));
      let n = 0;
      cards.forEach((c) => {
        const show = !cat || c.dataset.cat === cat;
        c.hidden = !show;
        if (show) c.style.setProperty("--d", `${n++ * 55}ms`);
      });
      $("listCount").textContent = `${n} ${n === 1 ? "prodotto" : "prodotti"}${cat ? ` · ${cat}` : ""}`;
    };
    setParam("cat", cat);
    if (animate && document.startViewTransition && !reduce) document.startViewTransition(run); else run();
  }
  filters.addEventListener("click", (e) => { const b = e.target.closest(".chip"); if (b) apply(b.dataset.cat, true); });

  function setParam(k, v) {
    const url = new URL(location.href);
    v ? url.searchParams.set(k, v) : url.searchParams.delete(k);
    history.replaceState(null, "", url);
  }

  // riflesso che segue il mouse sulle card (solo dispositivi con puntatore)
  if (matchMedia("(hover: hover)").matches) {
    grid.addEventListener("pointermove", (e) => {
      const c = e.target.closest(".pcard"); if (!c) return;
      const r = c.getBoundingClientRect();
      c.style.setProperty("--mx", `${((e.clientX - r.left) / r.width) * 100}%`);
      c.style.setProperty("--my", `${((e.clientY - r.top) / r.height) * 100}%`);
    });
  }

  /* ---------------------------------------------- scheda a pannello */
  const drawer = $("drawer"), panel = drawer.querySelector(".drawer__panel");
  let cur = -1, photo = 0, lastFocus = null;

  function render() {
    const p = ITEMS[cur];
    $("dCode").textContent = `${code(cur)} · ${p.cat}`;
    $("dName").textContent = p.name;
    $("dText").innerHTML = p.text.length ? p.text.map((t) => `<p>${esc(t)}</p>`).join("")
      : `<p class="drawer__empty">Descrizione non ancora pubblicata sulla scheda del sito.</p>`;
    $("dSpecs").innerHTML = (p.specs || []).map(([k, v]) => `<div><dt>${esc(k)}</dt><dd>${esc(v)}</dd></div>`).join("");
    $("dSpecs").hidden = !(p.specs || []).length;
    $("dFeatTitle").textContent = p.featuresTitle || "Caratteristiche";
    $("dFeat").innerHTML = p.features.map((f) => `<li>${esc(f)}</li>`).join("");
    $("dFeatWrap").hidden = !p.features.length;
    $("dThumbs").innerHTML = p.photos.length > 1
      ? p.photos.map((s, k) => `<button data-k="${k}" aria-label="Foto ${k + 1}"><img src="${s}" alt=""></button>`).join("") : "";
    show(0);
  }
  function show(k) {
    const p = ITEMS[cur];
    photo = (k + p.photos.length) % p.photos.length;
    const img = $("dImg");
    img.classList.remove("is-in"); void img.offsetWidth;
    img.src = p.photos[photo]; img.alt = `${p.name}, foto ${photo + 1}`;
    img.classList.add("is-in");
    $("dThumbs").querySelectorAll("button").forEach((b, i) => b.setAttribute("aria-current", i === photo));
    $("dCount").textContent = `${photo + 1} / ${p.photos.length}`;
    drawer.querySelector(".drawer__nav").hidden = p.photos.length < 2;
  }
  function open(i) {
    cur = i; lastFocus = document.activeElement; render();
    drawer.hidden = false;
    requestAnimationFrame(() => drawer.classList.add("is-open"));
    document.body.classList.add("menu-open");
    setParam("p", ITEMS[i].id);
    $("dClose").focus();
  }
  function close() {
    drawer.classList.remove("is-open");
    document.body.classList.remove("menu-open");
    setParam("p", "");
    setTimeout(() => { if (!drawer.classList.contains("is-open")) drawer.hidden = true; }, 450);
    lastFocus && lastFocus.focus();
  }
  grid.addEventListener("click", (e) => { const c = e.target.closest(".pcard"); if (c) open(+c.dataset.i); });
  $("dClose").addEventListener("click", close);
  drawer.addEventListener("click", (e) => { if (e.target === drawer) close(); });
  $("dPrev").addEventListener("click", () => show(photo - 1));
  $("dNext").addEventListener("click", () => show(photo + 1));
  $("dThumbs").addEventListener("click", (e) => { const b = e.target.closest("button"); if (b) show(+b.dataset.k); });
  $("dOther").addEventListener("click", () => { const n = (cur + 1) % ITEMS.length; cur = n; render(); setParam("p", ITEMS[n].id); });
  addEventListener("keydown", (e) => {
    if (drawer.hidden) return;
    if (e.key === "Escape") close();
    if (e.key === "ArrowLeft") show(photo - 1);
    if (e.key === "ArrowRight") show(photo + 1);
  });
  // scorrimento col dito sulla foto
  let sx = null;
  $("dImgWrap").addEventListener("pointerdown", (e) => (sx = e.clientX));
  $("dImgWrap").addEventListener("pointerup", (e) => { if (sx !== null && Math.abs(e.clientX - sx) > 40) show(photo + (e.clientX < sx ? 1 : -1)); sx = null; });

  /* ------------------------------------------------------------- avvio */
  const q = new URLSearchParams(location.search);
  apply(cats.includes(q.get("cat")) ? q.get("cat") : "", false);
  cards.forEach((c) => c.classList.add("is-new"));
  const pi = ITEMS.findIndex((p) => p.id === q.get("p"));
  if (pi >= 0) open(pi);

  /* --------------------------------- intestazione: profondità e pulviscolo */
  const hero = document.querySelector(".chero");
  const layers = [...document.querySelectorAll("[data-depth]")];
  if (hero && layers.length && !reduce) {
    hero.addEventListener("pointermove", (e) => {
      const r = hero.getBoundingClientRect(), x = (e.clientX - r.left) / r.width - .5, y = (e.clientY - r.top) / r.height - .5;
      layers.forEach((l) => { const d = +l.dataset.depth; l.style.translate = `${x * d}px ${y * d * .6}px`; });
    });
    hero.addEventListener("pointerleave", () => layers.forEach((l) => (l.style.translate = "0 0")));
  }
  const dust = $("dust");
  if (dust && !reduce) {
    const ctx = dust.getContext("2d");
    let W = 0, H = 0, visible = true;
    const fit = () => { const d = Math.min(devicePixelRatio || 1, 2); W = dust.clientWidth; H = dust.clientHeight; dust.width = W * d; dust.height = H * d; ctx.setTransform(d, 0, 0, d, 0, 0); };
    fit(); addEventListener("resize", fit);
    new IntersectionObserver(([e]) => (visible = e.isIntersecting)).observe(dust);
    // granelli d'oro: più fitti e luminosi dentro il fascio di luce
    const P = Array.from({ length: 110 }, () => ({ x: Math.random(), y: Math.random(), r: .4 + Math.random() * 1.4, s: .2 + Math.random(), t: Math.random() * 6 }));
    let last = performance.now();
    (function tick(now) {
      const dt = Math.min((now - last) / 1000, .05); last = now;
      if (visible) {
        ctx.clearRect(0, 0, W, H);
        const bx = W * (W < 860 ? .5 : .68);
        for (const p of P) {
          p.y -= dt * .012 * p.s; p.x += Math.sin((now / 1000 + p.t) * .6) * dt * .004; p.t += dt;
          if (p.y < -.02) { p.y = 1.02; p.x = Math.random(); }
          const x = p.x * W, y = p.y * H, beam = Math.max(0, 1 - Math.abs(x - bx) / (W * .22));
          const tw = .5 + .5 * Math.sin(p.t * 2.2);
          ctx.fillStyle = `rgba(246,222,160,${(.08 + beam * .55) * tw})`;
          ctx.beginPath(); ctx.arc(x, y, p.r * (1 + beam * .6), 0, 6.283); ctx.fill();
        }
      }
      requestAnimationFrame(tick);
    })(last);
  }

  const nav = document.querySelector(".nav");
  const onScroll = () => {
    nav.classList.toggle("is-scrolled", scrollY > 40);
    filters.classList.toggle("is-stuck", filters.getBoundingClientRect().top <= 63);
  };
  addEventListener("scroll", onScroll, { passive: true }); onScroll();
})();
