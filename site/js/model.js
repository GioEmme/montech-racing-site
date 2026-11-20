/* Mon-Tech Racing — pagina modello: model.html?m=<id> */
(() => {
  const MODELS = window.MT_MODELS;
  const { GROUND, solveH, contactsIn, axis, createFloor, paintShadow } = window.MTStage;
  const params = new URLSearchParams(location.search);
  const DEBUG = params.has("debug");
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const $ = (id) => document.getElementById(id);
  const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
  const letters = (t) => [...t].map((c) => `<span>${c === " " ? "&nbsp;" : esc(c)}</span>`).join("");

  let idx = MODELS.findIndex((m) => m.id === params.get("m"));
  if (idx < 0) idx = 0;
  const m = MODELS[idx];
  const next = MODELS[(idx + 1) % MODELS.length], prev = MODELS[(idx - 1 + MODELS.length) % MODELS.length];

  /* ------------------------------------------------------- contenuti */
  document.title = `${m.name} — Mon-Tech Racing`;
  const [r, g, b] = m.accent;
  document.documentElement.style.setProperty("--accent", `rgb(${r},${g},${b})`);
  document.documentElement.style.setProperty("--accent-rgb", `${r}, ${g}, ${b}`);

  const bigName = $("bigName");
  bigName.innerHTML = letters(m.name);
  bigName.style.fontSize = `${Math.min(21, 150 / m.name.length)}vw`;
  $("title").innerHTML = letters(m.name);
  $("title").style.fontSize = `clamp(34px, min(5.4vw, ${Math.round(560 / m.name.length)}px), 88px)`;  // nomi lunghi più piccoli
  $("tag").textContent = m.tag;
  $("lead").textContent = m.lead;
  $("carBody").src = m.img; $("carBody").alt = `Carrozzeria ${m.name}`;
  $("carLines").src = m.lines;

  // striscia dati nell'hero: le prime voci della scheda
  $("stats").innerHTML = m.specs.slice(0, 4).map(([k, v]) => `<div><dt>${esc(k)}</dt><dd>${esc(v)}</dd></div>`).join("");

  // storia (la Huracan non ha testi pubblicati: sezione nascosta)
  if (m.story.length) {
    $("storyEyebrow").textContent = m.name;
    $("storyTitle").textContent = m.title;
    $("storyText").innerHTML = m.story.map((p) => `<p>${esc(p)}</p>`).join("");
    $("storyPoints").innerHTML = m.highlights.map(([t, d]) => `<li class="reveal"><b>${esc(t)}</b><span>${esc(d)}</span></li>`).join("");
  } else $("storia").hidden = true;

  // scheda tecnica
  $("specGrid").innerHTML = m.specs.map(([k, v, wide]) =>
    `<div class="${wide ? "wide" : ""}"><dt>${esc(k)}</dt><dd>${esc(v)}</dd></div>`).join("");
  if (m.specs.length % 2 && !m.specs[m.specs.length - 1][2]) $("specGrid").lastElementChild.classList.add("wide");
  $("kitList").innerHTML = m.kit.map((k) => `<li>${esc(k)}</li>`).join("");
  $("kitBox").querySelector("h3").hidden = !m.kit.length;
  $("specNote").textContent = m.note || "";

  // galleria
  $("galTrack").innerHTML = m.photos.map((src, i) =>
    `<button class="gallery__item" data-i="${i}" aria-label="Apri foto ${i + 1}"><img src="${src}" alt="${esc(m.name)}, foto ${i + 1}" loading="lazy"><span>${String(i + 1).padStart(2, "0")} / ${String(m.photos.length).padStart(2, "0")}</span></button>`).join("");

  // prossimo / precedente
  $("nextCard").href = next.page;
  $("nextCard").style.setProperty("--next-rgb", next.accent.join(","));
  $("nextName").textContent = next.name;
  $("nextTag").textContent = next.tag;
  $("nextImg").src = next.img;
  $("prevLink").href = prev.page;
  $("prevName").textContent = prev.name;

  /* ------------------------------------------- hero: pista + ombra */
  const hero = $("mhero"), car = $("car"), spin = $("carSpin"), shCv = $("carShadow");
  const floor = createFloor($("mheroBg"), { debug: DEBUG, reduce });
  floor.bg.accent = m.accent.slice(); floor.bg.accentT = m.accent.slice();
  floor.bg.speed = floor.bg.target = 0.6;               // qui la pista scorre più lenta
  let DPR = 1;
  const resize = () => { DPR = floor.resize(); paintShadow(shCv, m, car.offsetWidth, car.offsetHeight, DPR, DEBUG); };
  addEventListener("resize", resize);

  const mouse = { x: 0, y: 0, sx: 0, sy: 0 };
  hero.addEventListener("pointermove", (e) => {
    const rc = hero.getBoundingClientRect();
    mouse.x = (e.clientX - rc.left) / rc.width * 2 - 1;
    mouse.y = (e.clientY - rc.top) / rc.height * 2 - 1;
  });
  hero.addEventListener("pointerleave", () => { mouse.x = mouse.y = 0; });

  let heroVisible = true;
  new IntersectionObserver(([e]) => { heroVisible = e.isIntersecting; }).observe(hero);

  let last = performance.now();
  function frame(now) {
    const dt = Math.min((now - last) / 1000, 0.05); last = now;
    if (heroVisible) {                                  // fuori vista non si disegna nulla
      mouse.sx += (mouse.x - mouse.sx) * Math.min(dt * 4, 1);
      mouse.sy += (mouse.y - mouse.sy) * Math.min(dt * 4, 1);
      const px = mouse.sx * 16, py = mouse.sy * 8;
      car.style.transform = `translate(calc(-50% + ${px}px), calc(-50% + ${py}px))`;
      bigName.style.transform = `translate(calc(-50% + ${mouse.sx * -34}px), calc(-50% + ${mouse.sy * -14}px))`;
      const w = car.offsetWidth, h = car.offsetHeight;
      const box = { x: car.offsetLeft - w / 2, y: car.offsetTop - h / 2, w, h };
      const pts = contactsIn(m, w, h, box.x + px, box.y + py);
      floor.draw(dt, solveH(GROUND, pts), box, pts);
    }
    requestAnimationFrame(frame);
  }

  // ingresso: arriva lungo il suo asse, poi la scansione la "termoforma"
  const anim = (el, kf, o) => el.animate(kf, { fill: "both", ...o });
  async function intro() {
    const body = $("carBody"), lines = $("carLines"), scan = $("carScan");
    const [fx, fy] = axis(m), ease = "cubic-bezier(.65,0,.35,1)", S = reduce ? 1 : 1300;
    anim(body, [{ clipPath: "inset(0 100% 0 0)" }, { clipPath: "inset(0 100% 0 0)" }], { duration: 1 });
    anim(shCv, [{ opacity: 0 }, { opacity: 0 }], { duration: 1 });
    anim(lines, [{ opacity: 0 }, { opacity: 1 }], { duration: 400 });
    [...bigName.children].forEach((s, i) => anim(s, [{ transform: "translateY(35%) scaleY(1.3)", opacity: 0 }, { transform: "none", opacity: 1 }], { duration: 1100, delay: 200 + i * 55, easing: "cubic-bezier(.16,1,.3,1)" }));
    [...$("title").children].forEach((s, i) => anim(s, [{ transform: "translateY(60%)", opacity: 0 }, { transform: "none", opacity: 1 }], { duration: 800, delay: 400 + i * 35, easing: "cubic-bezier(.16,1,.3,1)" }));
    document.querySelectorAll(".crumb, .mhero__tag, .mhero__lead, .mhero__actions, .mhero__stats > div").forEach((el, i) =>
      anim(el, [{ transform: "translateY(12px)", opacity: 0 }, { transform: "none", opacity: 1 }], { duration: 800, delay: 300 + i * 90, easing: "cubic-bezier(.16,1,.3,1)" }));
    floor.bg.speed = 7;
    const arrive = anim(spin, [
      { transform: `translate3d(${-fx * 40}vw, ${-fy * 40}vw, -1400px)`, filter: "blur(6px)", opacity: 0, offset: 0 },
      { opacity: 1, offset: 0.25 },
      { transform: `translate3d(${fx * 1.2}vw, ${fy * 1.2}vw, 30px)`, filter: "blur(0)", offset: 0.8 },
      { transform: "none", filter: "blur(0)", opacity: 1, offset: 1 },
    ], { duration: reduce ? 1 : 1500, easing: "cubic-bezier(.12,.8,.25,1)" });
    await new Promise((res) => setTimeout(res, reduce ? 0 : 1050));
    anim(scan, [{ left: "0%", opacity: 0 }, { opacity: 1, offset: 0.08 }, { opacity: 1, offset: 0.9 }, { left: "100%", opacity: 0 }], { duration: S, easing: ease });
    anim(body, [{ clipPath: "inset(0 100% 0 0)" }, { clipPath: "inset(0 0% 0 0)" }], { duration: S, easing: ease });
    anim(lines, [{ clipPath: "inset(0 0 0 0%)" }, { clipPath: "inset(0 0 0 100%)" }], { duration: S, easing: ease });
    anim(shCv, [{ opacity: 0 }, { opacity: 1 }], { duration: S * 1.1, easing: "ease-out" });
    await arrive.finished;
    countUps($("stats"));
  }

  // numeri che si contano fino al valore ("260 mm", "0,75 mm", "≈ 85 g")
  function countUps(root) {
    root.querySelectorAll("dd").forEach((dd, k) => {
      const txt = dd.textContent, mm = txt.match(/^(≈\s*)?(\d+(?:,\d+)?)(\s.*)?$/);
      if (!mm || txt.includes("/") || reduce) return;
      const dec = (mm[2].split(",")[1] || "").length, target = parseFloat(mm[2].replace(",", "."));
      const t0 = performance.now() + k * 90, D = 1000;
      const step = (now) => {
        const p = Math.min(Math.max((now - t0) / D, 0), 1), e = 1 - (1 - p) ** 3;
        dd.textContent = `${mm[1] || ""}${(target * e).toFixed(dec).replace(".", ",")}${mm[3] || ""}`;
        if (p < 1) requestAnimationFrame(step);
      };
      requestAnimationFrame(step);
    });
  }

  /* ------------------------------------------ comparsa allo scroll */
  const io = new IntersectionObserver((es) => es.forEach((e) => {
    if (!e.isIntersecting) return;
    e.target.classList.add("is-in");
    if (e.target.id === "specGrid") countUps(e.target);
    io.unobserve(e.target);
  }), { threshold: 0.2 });
  document.querySelectorAll(".reveal").forEach((el, i) => { el.style.transitionDelay = `${(i % 3) * 90}ms`; io.observe(el); });

  /* ------------------------------------------------------- galleria */
  const track = $("galTrack");
  const pageBy = (d) => track.scrollBy({ left: d * track.clientWidth * 0.8, behavior: "smooth" });
  $("galPrev").addEventListener("click", () => pageBy(-1));
  $("galNext").addEventListener("click", () => pageBy(1));

  const lb = $("lightbox"), lbImg = $("lbImg");
  let lbI = 0, lastFocus = null;
  const show = (i) => {
    lbI = (i + m.photos.length) % m.photos.length;
    lbImg.src = m.photos[lbI]; lbImg.alt = `${m.name}, foto ${lbI + 1}`;
    $("lbCount").textContent = `${lbI + 1} / ${m.photos.length}`;
  };
  const openLb = (i) => { lastFocus = document.activeElement; show(i); lb.hidden = false; $("lbClose").focus(); document.body.style.overflow = "hidden"; };
  const closeLb = () => { lb.hidden = true; document.body.style.overflow = ""; lastFocus && lastFocus.focus(); };
  track.addEventListener("click", (e) => { const it = e.target.closest(".gallery__item"); if (it) openLb(+it.dataset.i); });
  $("lbClose").addEventListener("click", closeLb);
  $("lbPrev").addEventListener("click", () => show(lbI - 1));
  $("lbNext").addEventListener("click", () => show(lbI + 1));
  lb.addEventListener("click", (e) => { if (e.target === lb) closeLb(); });
  addEventListener("keydown", (e) => {
    if (lb.hidden) return;
    if (e.key === "Escape") closeLb();
    if (e.key === "ArrowLeft") show(lbI - 1);
    if (e.key === "ArrowRight") show(lbI + 1);
  });

  const nav = document.querySelector(".nav");
  const onScroll = () => nav.classList.toggle("is-scrolled", scrollY > 40);
  addEventListener("scroll", onScroll, { passive: true }); onScroll();

  /* ------------------------------------------------------------ via */
  resize();
  requestAnimationFrame(frame);
  intro();
})();
