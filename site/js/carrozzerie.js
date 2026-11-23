/* Mon-Tech Racing — landing Carrozzerie: tutte le carrozzerie, filtrabili per categoria */
(() => {
  const MODELS = window.MT_MODELS;
  const { GROUND, solveH, contactsIn, axis, createFloor, paintShadow } = window.MTStage;
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const $ = (id) => document.getElementById(id);
  const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));

  // stesso ordine del menu "Bodies" del sito attuale; si mostrano solo le categorie presenti
  const ORDER = ["Touring 1/10", "Mini 1/10", "Oval", "GT", "GT12", "LMH", "Formula 1", "Gas Powered 200mm",
    "Off Road", "FWD 1/10", "Rally", "Scaler", "Truck", "Pan Car", "Pan Car 1/12"];
  const cats = ORDER.filter((c) => MODELS.some((m) => m.category === c));
  $("countAll").textContent = MODELS.length;

  /* ------------------------------------------------------------ filtri */
  const filters = $("filters");
  const chip = (label, value, n) =>
    `<button class="chip" data-cat="${esc(value)}" aria-pressed="false">${esc(label)} <small>${n}</small></button>`;
  filters.innerHTML = chip("Tutte", "", MODELS.length) +
    cats.map((c) => chip(c, c, MODELS.filter((m) => m.category === c).length)).join("");

  /* ------------------------------------------------------------- card */
  const grid = $("grid");
  grid.innerHTML = MODELS.map((m, i) => {
    const [fx, fy] = axis(m);
    const specs = m.specs.filter(([, , wide]) => !wide).slice(0, 2);
    return `
    <a class="card" href="${m.page}" data-cat="${esc(m.category)}" data-i="${i}"
       style="--a:${m.accent.join(",")}; --vt: card-${m.id}; --mx:${(fx * 14).toFixed(1)}px; --my:${(fy * 14).toFixed(1)}px">
      <div class="card__stage">
        <canvas class="card__bg" aria-hidden="true"></canvas>
        <div class="card__glow" aria-hidden="true"></div>
        <div class="card__car"><div class="card__move">
          <canvas class="card__shadow" aria-hidden="true"></canvas>
          <img class="card__img" src="${m.img}" alt="Carrozzeria ${esc(m.name)}" loading="lazy" draggable="false">
        </div></div>
        <span class="card__cat">${esc(m.category)}</span>
        <span class="card__idx">${String(i + 1).padStart(2, "0")}</span>
      </div>
      <div class="card__info">
        <div>
          <h2 class="card__name">${esc(m.name)}</h2>
          <p class="card__tag">${esc(m.tag)}</p>
        </div>
        <span class="card__go" aria-hidden="true">→</span>
        ${specs.length ? `<div class="card__specs">${specs.map(([k, v]) => `<div>${esc(k)}<b>${esc(v)}</b></div>`).join("")}</div>` : ""}
      </div>
    </a>`;
  }).join("");
  const cards = [...grid.children];

  // pavimento (statico) e ombra di ogni card, nella prospettiva della sua foto
  function paintCard(card) {
    const m = MODELS[+card.dataset.i];
    const stage = card.querySelector(".card__stage"), box = card.querySelector(".card__car");
    if (!stage.clientWidth) return;
    const key = `${stage.clientWidth}x${stage.clientHeight}`;
    if (card._painted === key) return;
    card._painted = key;
    const floor = card._floor || (card._floor = createFloor(card.querySelector(".card__bg"), { reduce: true, studio: 1 }));
    floor.bg.accent = m.accent.slice(); floor.bg.accentT = m.accent.slice();
    const dpr = floor.resize();
    const w = box.offsetWidth, h = box.offsetHeight;
    const b = { x: box.offsetLeft - w / 2, y: box.offsetTop - h / 2, w, h };
    const pts = contactsIn(m, w, h, b.x, b.y);
    floor.draw(0, solveH(GROUND, pts), b, pts);
    paintShadow(card.querySelector(".card__shadow"), m, w, h, dpr);
  }
  // disegna quando la card entra in vista (e di nuovo se cambia misura)
  const vis = new IntersectionObserver((es) => es.forEach((e) => e.isIntersecting && paintCard(e.target)), { rootMargin: "200px" });
  cards.forEach((c) => vis.observe(c));
  let rt = 0;
  addEventListener("resize", () => { clearTimeout(rt); rt = setTimeout(() => cards.forEach((c) => !c.hidden && paintCard(c)), 150); });

  /* --------------------------------------------------- applica filtro */
  function apply(cat, animate) {
    const run = () => {
      filters.querySelectorAll(".chip").forEach((b) => b.setAttribute("aria-pressed", b.dataset.cat === cat));
      let n = 0;
      cards.forEach((c) => {
        const show = !cat || c.dataset.cat === cat;
        c.hidden = !show;
        c.classList.remove("is-new");
        if (show) { c.style.setProperty("--d", `${Math.min(n, 9) * 60}ms`); n++; }   // cascata solo sulle prime card
      });
      $("listCount").textContent = `${n} ${n === 1 ? "carrozzeria" : "carrozzerie"}${cat ? ` · ${cat}` : ""}`;
      cards.forEach((c) => !c.hidden && paintCard(c));
    };
    const url = new URL(location.href);
    cat ? url.searchParams.set("cat", cat) : url.searchParams.delete("cat");
    history.replaceState(null, "", url);
    if (animate && document.startViewTransition && !reduce) document.startViewTransition(run);
    else run();
  }
  filters.addEventListener("click", (e) => {
    const b = e.target.closest(".chip");
    if (b) apply(b.dataset.cat, true);
  });

  const start = new URLSearchParams(location.search).get("cat") || "";
  apply(cats.includes(start) ? start : "", false);
  cards.forEach((c) => c.classList.add("is-new"));       // comparsa iniziale a cascata

  /* ------------------------------------- intestazione con pista animata */
  const head = $("lhead"), ref = MODELS[0];
  const hFloor = createFloor($("lheadBg"), { reduce });
  hFloor.bg.speed = hFloor.bg.target = 0.5;
  const accents = MODELS.map((m) => m.accent);
  let ai = 0;
  hFloor.bg.accent = accents[0].slice(); hFloor.bg.accentT = accents[0].slice();
  setInterval(() => { ai = (ai + 1) % accents.length; hFloor.bg.accentT = accents[ai].slice(); }, 3500);   // verde/rosso alternati
  addEventListener("resize", () => hFloor.resize()); hFloor.resize();
  let headVisible = true;
  new IntersectionObserver(([e]) => { headVisible = e.isIntersecting; }).observe(head);
  let last = performance.now();
  (function frame(now) {
    const dt = Math.min(Math.max((now - last) / 1000, 0), 0.05); last = now;
    if (headVisible && head.clientWidth > 0) {
      // un'auto "virtuale" a destra: il pavimento ha la stessa prospettiva delle foto
      const W = head.clientWidth, H = head.clientHeight;
      const w = Math.min(W * 0.5, 820), h = w / 1.85;
      const b = { x: W * 0.68 - w / 2, y: H * 0.42 - h / 2, w, h };
      const pts = contactsIn(ref, w, h, b.x, b.y);
      hFloor.draw(dt, solveH(GROUND, pts), b, pts);
    }
    requestAnimationFrame(frame);
  })(last);

  /* -------------------------------------- barra e filtri durante lo scroll */
  const nav = document.querySelector(".nav");
  const onScroll = () => {
    nav.classList.toggle("is-scrolled", scrollY > 40);
    filters.classList.toggle("is-stuck", filters.getBoundingClientRect().top <= 63);
  };
  addEventListener("scroll", onScroll, { passive: true }); onScroll();
})();
