/* Mon-Tech Racing — menu a schermo intero per tablet e telefono (sotto i 1100 px) */
(() => {
  const toggle = document.querySelector(".nav__toggle"), panel = document.getElementById("mnav");
  if (!toggle || !panel) return;
  let lastFocus = null;

  const open = () => {
    lastFocus = document.activeElement;
    panel.hidden = false;
    requestAnimationFrame(() => panel.classList.add("is-open"));
    toggle.setAttribute("aria-expanded", "true");
    toggle.setAttribute("aria-label", "Chiudi menu");
    document.body.classList.add("menu-open");
    panel.querySelector("a").focus();
  };
  const close = (restore = true) => {
    panel.classList.remove("is-open");
    toggle.setAttribute("aria-expanded", "false");
    toggle.setAttribute("aria-label", "Apri menu");
    document.body.classList.remove("menu-open");
    setTimeout(() => { if (!panel.classList.contains("is-open")) panel.hidden = true; }, 400);
    if (restore && lastFocus) lastFocus.focus();
  };

  toggle.addEventListener("click", () => (panel.classList.contains("is-open") ? close() : open()));
  panel.addEventListener("click", (e) => { if (e.target.closest("a")) close(false); });
  addEventListener("keydown", (e) => { if (e.key === "Escape" && panel.classList.contains("is-open")) close(); });
  // se lo schermo torna largo, il menu a pannello non serve più
  matchMedia("(min-width: 1101px)").addEventListener("change", (e) => e.matches && close(false));
})();
