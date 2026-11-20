/* Mon-Tech Racing — Chi siamo e contatti */
(() => {
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const $ = (id) => document.getElementById(id);

  /* disegno tecnico -> carrozzeria, in loop (la scansione va e torna) */
  const blue = document.querySelector(".ablue"), label = $("blueLabel");
  if (blue) {
    if (reduce) { blue.style.setProperty("--p", "100%"); label.textContent = "Carrozzeria"; }
    else {
      const T = 7000, t0 = performance.now();
      let visible = true;
      new IntersectionObserver(([e]) => (visible = e.isIntersecting)).observe(blue);
      (function tick(now) {
        if (visible) {
          const ph = ((now - t0) % T) / T;                         // 0..1
          // 0-.15 disegno · .15-.45 scansione · .45-.7 carrozzeria · .7-.95 ritorno
          let p = ph < .15 ? 0 : ph < .45 ? (ph - .15) / .3 : ph < .7 ? 1 : ph < .95 ? 1 - (ph - .7) / .25 : 0;
          p = p * p * (3 - 2 * p);
          blue.style.setProperty("--p", `${(p * 100).toFixed(2)}%`);
          label.textContent = p > .5 ? "Carrozzeria" : "Disegno";
        }
        requestAnimationFrame(tick);
      })(t0);
    }
  }

  /* numeri che si contano quando entrano in vista */
  const countUp = (dd) => {
    const to = +dd.dataset.to, suf = dd.dataset.suffix || "", plain = "plain" in dd.dataset;
    if (reduce) return;
    const from = plain ? to - 20 : 0, t0 = performance.now();
    (function step(now) {
      const p = Math.min((now - t0) / 1200, 1), e = 1 - (1 - p) ** 3;
      dd.textContent = `${Math.round(from + (to - from) * e)}${suf}`;
      if (p < 1) requestAnimationFrame(step);
    })(t0);
  };

  /* comparsa allo scroll */
  const io = new IntersectionObserver((es) => es.forEach((e) => {
    if (!e.isIntersecting) return;
    e.target.classList.add("is-in");
    e.target.querySelectorAll("[data-to]").forEach(countUp);
    io.unobserve(e.target);
  }), { threshold: .2 });
  document.querySelectorAll(".reveal").forEach((el, i) => { el.style.transitionDelay = `${(i % 5) * 80}ms`; io.observe(el); });

  /* modulo: niente server, si prepara la mail nel programma di posta di chi scrive */
  const form = $("cform"), err = $("fErr");
  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const name = $("fName"), mail = $("fMail"), msg = $("fMsg"), ok = $("fPrivacy");
    const bad = [];
    [[name, name.value.trim()], [mail, /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(mail.value.trim())], [msg, msg.value.trim()]]
      .forEach(([el, valid]) => { el.closest(".field").classList.toggle("is-bad", !valid); if (!valid) bad.push(el); });
    if (bad.length) { err.textContent = "Controlla i campi evidenziati."; bad[0].focus(); return; }
    if (!ok.checked) { err.textContent = "Per continuare accetta la privacy policy."; ok.focus(); return; }
    err.textContent = "";
    const subject = `[Sito] ${$("fTopic").value} — ${name.value.trim()}`;
    const body = `${msg.value.trim()}\n\n—\n${name.value.trim()}\n${mail.value.trim()}`;
    location.href = `mailto:a.montechracing@gmail.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  });

  const nav = document.querySelector(".nav");
  const onScroll = () => nav.classList.toggle("is-scrolled", scrollY > 40);
  addEventListener("scroll", onScroll, { passive: true }); onScroll();
})();
