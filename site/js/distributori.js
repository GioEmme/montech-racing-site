/* Mon-Tech Racing — Distributori: "Da Scandiano al mondo"
   Planisfero a puntini (assets/world-dots.json, equirettangolare 1000 x 367),
   rotte animate dalla sede ai 12 distributori, elenco collegato alla mappa,
   filtri per continente e distributore più vicino (calcolato solo nella pagina). */
(() => {
  const HQ = window.MT_HQ, LIST = window.MT_DISTRIBUTORS;
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const $ = (id) => document.getElementById(id);
  const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
  const NS = "http://www.w3.org/2000/svg";
  const W = 1000, H = 367, LAT_MAX = 76, LAT_MIN = -56;            // come in tools/make_world_dots.py
  const proj = (lat, lng) => [(lng + 180) / 360 * W, (LAT_MAX - lat) / (LAT_MAX - LAT_MIN) * H];
  const CONT = ["Europa", "Americhe", "Africa", "Asia", "Oceania"].filter((c) => LIST.some((d) => d.continent === c));
  LIST.forEach((d, i) => { d.i = i; d.xy = proj(d.lat, d.lng); });
  const hq = proj(HQ.lat, HQ.lng);

  /* -------------------------------------------------------- numeri */
  const nums = { nDist: LIST.length, nCountry: new Set(LIST.map((d) => d.code)).size, nCont: CONT.length };
  function countUp() {
    Object.entries(nums).forEach(([id, n], k) => {
      const el = $(id), t0 = performance.now() + k * 150;
      if (reduce) { el.textContent = n; return; }
      (function step(now) {
        const p = Math.min(Math.max((now - t0) / 1100, 0), 1);
        el.textContent = Math.round(n * (1 - (1 - p) ** 3));
        if (p < 1) requestAnimationFrame(step);
      })(t0);
    });
  }

  /* ------------------------------------------------ elenco per continente */
  const maps = (d) => `https://www.google.com/maps/search/?api=1&query=${d.lat},${d.lng}`;
  $("list").innerHTML = CONT.map((c) => {
    const items = LIST.filter((d) => d.continent === c);
    return `<div class="dgroup" data-cont="${c}"><h2>${c} <small>${items.length} ${items.length === 1 ? "distributore" : "distributori"}</small></h2>
      <div class="dgrid">${items.map((d) => `
        <article class="dcard" id="d-${d.i}" data-i="${d.i}" tabindex="0" aria-label="${esc(d.name)}, ${esc(d.country)}">
          <div class="dcard__top"><span class="dcard__code">${d.code}</span><span class="dcard__country">${esc(d.country)}</span></div>
          <h3 class="dcard__name">${esc(d.name)}</h3>
          <p class="dcard__addr">${esc(d.address)}<br>${esc(d.city)}</p>
          <p class="dcard__dist" id="dist-${d.i}"></p>
          <div class="dcard__actions">
            <button type="button" data-show="${d.i}">Vedi sulla mappa</button>
            <a href="${maps(d)}" target="_blank" rel="noopener">Apri in Maps ↗</a>
          </div>
        </article>`).join("")}</div></div>`;
  }).join("");

  /* ------------------------------------------------------------- mappa */
  const svg = $("mapSvg"), gArcs = $("arcs"), gPins = $("pins"), gCom = $("comets"), tips = $("tips");
  const el = (tag, attrs) => { const n = document.createElementNS(NS, tag); for (const k in attrs) n.setAttribute(k, attrs[k]); return n; };

  // rotta: curva quadratica che si inarca verso l'alto, più alta per le destinazioni lontane
  const arcs = LIST.map((d) => {
    const [x2, y2] = d.xy, [x1, y1] = hq, dx = x2 - x1, dy = y2 - y1, len = Math.hypot(dx, dy);
    let nx = -dy / len, ny = dx / len;
    if (ny > 0) { nx = -nx; ny = -ny; }
    const lift = Math.min(len * .32, 120), cx = (x1 + x2) / 2 + nx * lift, cy = (y1 + y2) / 2 + ny * lift;
    const p = el("path", { d: `M${x1},${y1} Q${cx},${cy} ${x2},${y2}`, class: "arc" });
    gArcs.appendChild(p);
    const L = p.getTotalLength();
    p.style.strokeDasharray = L; p.style.strokeDashoffset = reduce ? 0 : L;
    const c = el("circle", { r: 1.8, class: "comet", opacity: 0 }); gCom.appendChild(c);
    return { p, L, c, phase: Math.random() };
  });

  LIST.forEach((d) => {
    const g = el("g", { class: "dpin", tabindex: 0, role: "button", "aria-label": `${d.name}, ${d.country}`, "data-i": d.i });
    g.appendChild(el("circle", { cx: d.xy[0], cy: d.xy[1], r: 3.6, class: "ring" }));
    g.appendChild(el("circle", { cx: d.xy[0], cy: d.xy[1], r: 3.6, class: "core" }));
    g.appendChild(el("circle", { cx: d.xy[0], cy: d.xy[1], r: 6, fill: "transparent" }));     // area di tocco (piccola: Malesia e Singapore sono vicine)
    g.style.opacity = reduce ? 1 : 0;
    gPins.appendChild(g);
    const t = document.createElement("div");
    t.className = "tip" + (d.xy[0] > W * .86 ? " tip--r" : d.xy[0] < W * .14 ? " tip--l" : ""); t.id = `tip-${d.i}`;
    t.style.left = `${d.xy[0] / W * 100}%`; t.style.top = `${d.xy[1] / H * 100}%`;
    t.innerHTML = `${esc(d.name)}<small>${esc(d.city.replace(/^\d+\s/, ""))} · ${d.code}</small>`;
    tips.appendChild(t);
  });
  const hqG = el("g", { class: "hq" });
  hqG.appendChild(el("circle", { cx: hq[0], cy: hq[1], r: 4.6, class: "ring" }));
  hqG.appendChild(el("circle", { cx: hq[0], cy: hq[1], r: 4.6, class: "core" }));
  $("hq").appendChild(hqG);
  const hqTip = document.createElement("div");
  hqTip.className = "tip tip--hq"; hqTip.style.left = `${hq[0] / W * 100}%`; hqTip.style.top = `${hq[1] / H * 100}%`;
  hqTip.innerHTML = `<b>Scandiano</b><small>Sede · Italia</small>`;
  tips.appendChild(hqTip);

  // puntini del planisfero: più luminosi vicino alla sede e ai distributori
  const cv = $("dots"), ctx = cv.getContext("2d");
  let DOTS = null, activeI = -1, nearI = -1;
  fetch("assets/world-dots.json").then((r) => r.json()).then((j) => { DOTS = j.dots; drawDots(); });
  function drawDots() {
    if (!DOTS) return;
    const dpr = Math.min(devicePixelRatio || 1, 2), w = cv.clientWidth, h = cv.clientHeight;
    cv.width = w * dpr; cv.height = h * dpr; ctx.setTransform(dpr, 0, 0, dpr, 0, 0); ctx.clearRect(0, 0, w, h);
    const s = w / W, r = Math.max(1, 1.25 * s);
    const lights = [{ xy: hq, c: [225, 27, 34], k: 1 }, ...LIST.map((d) => ({ xy: d.xy, c: [82, 170, 50], k: d.i === activeI || d.i === nearI ? 1.6 : .8 }))];
    for (const [x, y] of DOTS) {
      let a = .16, col = [200, 210, 220], best = 0;
      for (const L of lights) {
        const dd = Math.hypot(x - L.xy[0], y - L.xy[1]), f = Math.max(0, 1 - dd / (26 * L.k)) * L.k;
        if (f > best) { best = f; col = L.c; }
      }
      a += best * .55;
      ctx.fillStyle = best > .05 ? `rgba(${col[0]},${col[1]},${col[2]},${a})` : `rgba(200,210,220,${a})`;
      ctx.beginPath(); ctx.arc(x * s, y * s, r, 0, 6.283); ctx.fill();
    }
  }
  let rt = 0; addEventListener("resize", () => { clearTimeout(rt); rt = setTimeout(drawDots, 120); });

  // su schermi stretti la mappa scorre: si parte centrati su Scandiano
  const centerOnHQ = () => {
    const sc = $("mapScroll"), m = $("wmap");
    if (sc.scrollWidth > sc.clientWidth) sc.scrollLeft = hq[0] / W * m.clientWidth - sc.clientWidth * .45;
  };
  centerOnHQ();

  // partenza delle rotte quando la mappa entra in vista
  let launched = reduce;
  const launch = () => {
    if (launched) return; launched = true;
    arcs.forEach((a, i) => {
      a.p.animate([{ strokeDashoffset: a.L }, { strokeDashoffset: 0 }], { duration: 1300, delay: 300 + i * 170, easing: "cubic-bezier(.65,0,.35,1)", fill: "forwards" });
      gPins.children[i].animate([{ opacity: 0, transform: "scale(.4)" }, { opacity: 1, transform: "none" }],
        { duration: 500, delay: 300 + i * 170 + 1150, easing: "cubic-bezier(.16,1,.3,1)", fill: "forwards" });
    });
    setTimeout(() => { arcs.forEach((a) => (a.p.style.strokeDashoffset = 0)); gPins.querySelectorAll(".dpin").forEach((p) => (p.style.opacity = 1)); }, 300 + arcs.length * 170 + 1700);
    countUp();
  };
  new IntersectionObserver(([e]) => e.isIntersecting && launch(), { threshold: .25 }).observe($("wmap"));
  if (reduce) countUp();

  // scie che percorrono le rotte, di continuo
  let mapVisible = true;
  new IntersectionObserver(([e]) => (mapVisible = e.isIntersecting)).observe($("wmap"));
  const T0 = performance.now();
  (function tick(now) {
    if (mapVisible && launched && !reduce) {
      const t = (now - T0) / 1000;
      arcs.forEach((a, i) => {
        const p = ((t * .22 + a.phase) % 1), pt = a.p.getPointAtLength(p * a.L);
        a.c.setAttribute("cx", pt.x); a.c.setAttribute("cy", pt.y);
        a.c.setAttribute("opacity", (Math.sin(p * Math.PI) * .9).toFixed(2));
      });
    }
    requestAnimationFrame(tick);
  })(T0);

  /* ------------------------------------------ evidenziazione e filtri */
  let cont = "";
  function paint() {
    $("wmap").classList.toggle("has-active", activeI >= 0);
    LIST.forEach((d, i) => {
      const inCont = !cont || d.continent === cont, on = i === activeI;
      arcs[i].p.classList.toggle("is-on", on);
      arcs[i].p.classList.toggle("is-dim", !inCont || (activeI >= 0 && !on));
      arcs[i].c.classList.toggle("is-dim", !inCont || (activeI >= 0 && !on));
      const pin = gPins.children[i];
      pin.classList.toggle("is-on", on); pin.classList.toggle("is-dim", !inCont); pin.classList.toggle("is-near", i === nearI);
      $(`tip-${i}`).classList.toggle("is-on", on || (i === nearI && activeI < 0));
      $(`d-${i}`).classList.toggle("is-on", on);
    });
    drawDots();
  }
  function setActive(i, scrollMap) {
    activeI = i; paint();
    if (scrollMap && i >= 0) {
      const sc = $("mapScroll"), m = $("wmap");
      if (sc.scrollWidth > sc.clientWidth) sc.scrollTo({ left: LIST[i].xy[0] / W * m.clientWidth - sc.clientWidth / 2, behavior: reduce ? "auto" : "smooth" });
    }
  }
  const list = $("list");
  list.addEventListener("pointerover", (e) => { const c = e.target.closest(".dcard"); if (c) setActive(+c.dataset.i, false); });
  list.addEventListener("pointerleave", () => setActive(-1));
  list.addEventListener("focusin", (e) => { const c = e.target.closest(".dcard"); if (c) setActive(+c.dataset.i, true); });
  list.addEventListener("click", (e) => {
    const b = e.target.closest("[data-show]"); if (!b) return;
    const i = +b.dataset.show; setActive(i, true);
    $("wmap").scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "center" });
  });
  const pinTo = (e) => {
    const g = e.target.closest(".dpin"); if (!g) return;
    const i = +g.dataset.i; setActive(i, false);
    const card = $(`d-${i}`); card.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "center" });
  };
  gPins.addEventListener("click", pinTo);
  gPins.addEventListener("keydown", (e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); pinTo(e); } });
  gPins.addEventListener("pointerover", (e) => { const g = e.target.closest(".dpin"); if (g) setActive(+g.dataset.i, false); });
  gPins.addEventListener("pointerleave", () => setActive(-1));

  const filters = $("filters");
  const chip = (label, v, n) => `<button class="chip" data-cat="${v}" aria-pressed="false">${label} <small>${n}</small></button>`;
  filters.innerHTML = chip("Tutti", "", LIST.length) + CONT.map((c) => chip(c, c, LIST.filter((d) => d.continent === c).length)).join("");
  function applyCont(c) {
    cont = c;
    filters.querySelectorAll(".chip").forEach((b) => b.setAttribute("aria-pressed", b.dataset.cat === c));
    list.querySelectorAll(".dgroup").forEach((g) => (g.hidden = !!c && g.dataset.cont !== c));
    const url = new URL(location.href); c ? url.searchParams.set("cont", c) : url.searchParams.delete("cont"); history.replaceState(null, "", url);
    paint();
  }
  filters.addEventListener("click", (e) => { const b = e.target.closest(".chip"); if (b) applyCont(b.dataset.cat); });
  const startCont = new URLSearchParams(location.search).get("cont");
  applyCont(CONT.includes(startCont) ? startCont : "");

  /* --------------------------------------- distributore più vicino */
  const km = (a, b, c, d) => {                                   // distanza in linea d'aria (haversine)
    const R = 6371, r = Math.PI / 180, x = Math.sin((c - a) * r / 2) ** 2 + Math.cos(a * r) * Math.cos(c * r) * Math.sin((d - b) * r / 2) ** 2;
    return 2 * R * Math.asin(Math.sqrt(x));
  };
  const fmt = (n) => n.toLocaleString("it-IT", { maximumFractionDigits: 0 });
  const msg = $("nearMsg"), btn = $("near");
  btn.addEventListener("click", () => {
    if (!navigator.geolocation) { msg.textContent = "Il tuo browser non permette di rilevare la posizione."; return; }
    btn.setAttribute("aria-busy", "true"); msg.textContent = "Rilevo la tua posizione…";
    navigator.geolocation.getCurrentPosition((pos) => {
      btn.removeAttribute("aria-busy");
      const { latitude: la, longitude: lo } = pos.coords;
      LIST.forEach((d) => { d.km = km(la, lo, d.lat, d.lng); $(`dist-${d.i}`).textContent = `≈ ${fmt(d.km)} km da te`; });
      const best = LIST.reduce((a, b) => (b.km < a.km ? b : a));
      nearI = best.i;
      // il tuo punto sulla mappa
      gPins.querySelector(".me")?.remove();
      const [mx, my] = proj(la, lo), me = el("g", { class: "me" });
      me.appendChild(el("circle", { cx: mx, cy: my, r: 4 })); gPins.appendChild(me);
      applyCont(""); setActive(best.i, true);
      msg.innerHTML = `Il più vicino è <b>${esc(best.name)}</b> (${esc(best.country)}), a circa <b>${fmt(best.km)} km</b> in linea d'aria.`;
      $(`d-${best.i}`).scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "center" });
    }, (err) => {
      btn.removeAttribute("aria-busy");
      msg.textContent = err.code === 1 ? "Hai negato l'accesso alla posizione: puoi scegliere il continente qui sopra." : "Non riesco a rilevare la posizione in questo momento.";
    }, { enableHighAccuracy: false, timeout: 10000, maximumAge: 600000 });
  });

  /* ---------------------------------------------------------- scroll */
  const nav = document.querySelector(".nav"), tools = $("tools");
  const onScroll = () => {
    nav.classList.toggle("is-scrolled", scrollY > 40);
    tools.classList.toggle("is-stuck", tools.getBoundingClientRect().top <= 63);
  };
  addEventListener("scroll", onScroll, { passive: true }); onScroll();
})();
