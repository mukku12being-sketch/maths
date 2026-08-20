/**
 * App bootstrap and global UI handlers
 */
const App = (function () {
  "use strict";

  function updateProgress() {
    const completed = Storage.getCompleted().length;
    const total = CHAPTERS.length;
    const pct = Storage.getProgressPercent();

    const label = document.getElementById("progressRingLabel");
    const ring = document.getElementById("progressRingFill");
    if (label) label.textContent = `${completed}/${total}`;
    if (ring) {
      const offset = 100 - pct;
      ring.style.strokeDashoffset = offset;
    }
  }

  function openSidebar() {
    document.getElementById("sidebar")?.classList.add("open");
    document.getElementById("sidebarOverlay")?.classList.add("visible");
  }

  function closeSidebar() {
    document.getElementById("sidebar")?.classList.remove("open");
    document.getElementById("sidebarOverlay")?.classList.remove("visible");
  }

  function initSidebar() {
    document.getElementById("menuBtn")?.addEventListener("click", openSidebar);
    document.getElementById("sidebarClose")?.addEventListener("click", closeSidebar);
    document.getElementById("sidebarOverlay")?.addEventListener("click", closeSidebar);
  }

  function initBackToTop() {
    const btn = document.getElementById("backToTop");
    if (!btn) return;

    window.addEventListener("scroll", () => {
      btn.classList.toggle("visible", window.scrollY > 300);
    }, { passive: true });

    btn.addEventListener("click", () => {
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
  }

  function initBookmarks() {
    document.addEventListener("click", (e) => {
      const btn = e.target.closest("[data-bookmark]");
      if (!btn) return;
      const id = btn.getAttribute("data-bookmark");
      Storage.toggleBookmark(id);
      const active = Storage.isBookmarked(id);
      btn.classList.toggle("active", active);
      btn.innerHTML = `
        <svg viewBox="0 0 24 24" fill="${active ? "currentColor" : "none"}" stroke="currentColor" stroke-width="2"><path d="M19 21l-7-5-7 5V5a2 2 0 012-2h10a2 2 0 012 2z"/></svg>
        ${active ? "Bookmarked" : "Bookmark"}
      `;
      Copy.showToast(active ? "Formula bookmarked!" : "Bookmark removed.");
      if (window.location.hash.includes("/bookmarks")) {
        Router.navigate();
      }
    });
  }

  function init() {
    Theme.init();
    Copy.init();
    Print.init();
    Search.init();
    Render.sidebarChapters();
    initSidebar();
    initBackToTop();
    initBookmarks();
    updateProgress();
    Router.init();

    window.addEventListener("hashchange", updateProgress);
  }

  return { init, updateProgress, openSidebar, closeSidebar };
})();

document.addEventListener("DOMContentLoaded", App.init);
