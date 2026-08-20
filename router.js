/**
 * Hash-based client-side router
 */
const Router = (function () {
  "use strict";

  const routes = [
    { pattern: /^\/chapter\/(\d+)$/, handler: (m) => Render.chapter(m[1]) },
    { pattern: /^\/important$/, handler: () => Render.important() },
    { pattern: /^\/revision$/, handler: () => Render.revision() },
    { pattern: /^\/quiz$/, handler: () => Render.quiz() },
    { pattern: /^\/bookmarks$/, handler: () => Render.bookmarks() },
    { pattern: /^\/$/, handler: () => Render.home() },
  ];

  function parseHash() {
    const hash = window.location.hash.slice(1) || "/";
    const path = hash.split("?")[0];
    const query = hash.includes("?") ? hash.split("?")[1] : "";
    return { path, query };
  }

  function getFormulaFromQuery(query) {
    if (!query) return null;
    const params = new URLSearchParams(query);
    return params.get("formula");
  }

  function updateActiveNav(path) {
    document.querySelectorAll(".nav-link").forEach((link) => {
      const route = link.getAttribute("data-route");
      link.classList.toggle("active", route === path);
    });

    document.querySelectorAll(".chapter-nav-link").forEach((link) => {
      const match = path.match(/^\/chapter\/(\d+)/);
      link.classList.toggle("active", match && link.dataset.chapter === match[1]);
    });
  }

  function navigate() {
    const { path, query } = parseHash();
    let matched = false;

    for (const route of routes) {
      const m = path.match(route.pattern);
      if (m) {
        route.handler(m);
        matched = true;
        break;
      }
    }

    if (!matched) {
      const main = document.getElementById("mainContent");
      if (main) {
        main.innerHTML = "";
        const el = document.createElement("div");
        el.className = "empty-state";
        el.innerHTML = `<h3>Page not found</h3><p><a href="#/">Return home</a></p>`;
        main.appendChild(el);
      }
    }

    updateActiveNav(path);

    const formulaId = getFormulaFromQuery(query);
    if (formulaId) Render.highlightFormula(formulaId);

    App.closeSidebar();
  }

  function init() {
    window.addEventListener("hashchange", navigate);
    if (!window.location.hash) window.location.hash = "#/";
    else navigate();
  }

  function go(path) {
    window.location.hash = path;
  }

  return { init, navigate, go, parseHash };
})();
