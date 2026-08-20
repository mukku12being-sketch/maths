/**
 * DOM rendering for all views
 */
const Render = (function () {
  "use strict";

  const ICONS = {
    hash: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 9h16M4 15h16M10 3L8 21M16 3l-2 18"/></svg>',
    poly: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/></svg>',
    linear: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 20V10M12 20V4M6 20v-6"/></svg>',
    quad: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 18c4-8 12-8 16 0"/><circle cx="12" cy="8" r="2"/></svg>',
    ap: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 12h4l3-9 4 18 3-9h4"/></svg>',
    triangle: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2L2 22h20L12 2z"/></svg>',
    coord: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M12 2v20M2 12h20"/></svg>',
    trig: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 20h18M6 20V8l6-5 6 5v12"/></svg>',
    "trig-app": '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M2 20h20M12 4v16M7 20l5-16 5 16"/></svg>',
    circle: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/></svg>',
    area: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2a10 10 0 100 20 10 10 0 000-20z"/><path d="M12 2v20"/></svg>',
    volume: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z"/></svg>',
    stats: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 20V10M12 20V4M6 20v-6"/></svg>',
    prob: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="2" width="20" height="20" rx="3"/><circle cx="8" cy="8" r="1.5" fill="currentColor"/><circle cx="16" cy="16" r="1.5" fill="currentColor"/><circle cx="16" cy="8" r="1.5" fill="currentColor"/></svg>',
  };

  function escapeHtml(str) {
    const div = document.createElement("div");
    div.textContent = str;
    return div.innerHTML;
  }

  function getChapter(id) {
    return CHAPTERS.find((c) => c.id === Number(id));
  }

  function getFormulaById(formulaId) {
    for (const ch of CHAPTERS) {
      const f = ch.formulas.find((x) => x.id === formulaId);
      if (f) return { formula: f, chapter: ch };
    }
    return null;
  }

  function renderMath(container) {
    if (typeof renderMathInElement === "function") {
      renderMathInElement(container, {
        delimiters: [
          { left: "$$", right: "$$", display: true },
          { left: "\\(", right: "\\)", display: false },
          { left: "\\[", right: "\\]", display: true },
        ],
        throwOnError: false,
      });
    }
  }

  function buildFormulaCard(formula, chapter, opts) {
    opts = opts || {};
    const isImportant = formula.important || IMPORTANT_FORMULA_IDS.includes(formula.id);
    const bookmarked = Storage.isBookmarked(formula.id);
    const varsHtml = formula.variables && formula.variables.length
      ? `<div class="formula-variables">
          <p class="formula-variables-title">Variables</p>
          <ul class="variable-list">${formula.variables.map((v) =>
            `<li><strong>${escapeHtml(v.symbol)}</strong> — ${escapeHtml(v.meaning)}</li>`
          ).join("")}</ul>
        </div>`
      : "";

    const exampleHtml = formula.example
      ? `<div class="formula-example"><strong>Example:</strong> ${escapeHtml(formula.example)}</div>`
      : "";

    const card = document.createElement("article");
    card.className = `card formula-card${isImportant ? " important" : ""}`;
    card.id = `formula-${formula.id}`;
    card.dataset.formulaId = formula.id;
    card.dataset.type = formula.type;

    card.innerHTML = `
      <div class="formula-card-header">
        <h3 class="formula-card-title">${escapeHtml(formula.title)}</h3>
        <div class="formula-card-badges">
          <span class="badge badge-type">${escapeHtml(formula.type)}</span>
          ${isImportant ? '<span class="badge badge-important">Important</span>' : ""}
        </div>
      </div>
      <div class="formula-latex">\\(${formula.latex}\\)</div>
      ${varsHtml}
      <p class="formula-explanation">${escapeHtml(formula.explanation)}</p>
      ${exampleHtml}
      ${opts.compact ? "" : `
      <div class="formula-actions">
        <button class="btn btn-secondary btn-sm" data-copy="${formula.plainText.replace(/"/g, "&quot;")}" type="button">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"/></svg>
          Copy Formula
        </button>
        <button class="btn btn-ghost btn-sm bookmark-btn${bookmarked ? " active" : ""}" data-bookmark="${formula.id}" type="button" aria-label="${bookmarked ? "Remove bookmark" : "Bookmark formula"}">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M19 21l-7-5-7 5V5a2 2 0 012-2h10a2 2 0 012 2z"/></svg>
          ${bookmarked ? "Bookmarked" : "Bookmark"}
        </button>
      </div>`}
    `;
    return card;
  }

  function home() {
    const pct = Storage.getProgressPercent();
    const completed = Storage.getCompleted().length;

    const container = document.createElement("div");
    container.innerHTML = `
      <div class="print-header">
        <h1>Class 10 Maths Formula Hub</h1>
        <p>CBSE Board Examination — Complete Formula Sheet</p>
      </div>
      <section class="hero">
        <span class="hero-badge">CBSE Class 10 Mathematics</span>
        <h1 class="page-title">Class 10 Maths Formula Hub</h1>
        <p class="page-subtitle">All Important Formulas at One Place</p>
      </section>

      <div class="progress-bar-wrap">
        <div class="progress-bar-header">
          <span>Your Progress</span>
          <span>${completed} of ${CHAPTERS.length} chapters completed</span>
        </div>
        <div class="progress-bar"><div class="progress-bar-fill" style="width:${pct}%"></div></div>
      </div>

      <div class="quick-links">
        <a href="#/important" class="card quick-link-card">
          <div class="quick-link-icon gold"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg></div>
          <div class="quick-link-text"><h3>Most Important</h3><p>Board exam must-know formulas</p></div>
        </a>
        <a href="#/revision" class="card quick-link-card">
          <div class="quick-link-icon teal"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg></div>
          <div class="quick-link-text"><h3>Last Minute Revision</h3><p>Quick scan before exams</p></div>
        </a>
        <a href="#/quiz" class="card quick-link-card">
          <div class="quick-link-icon indigo"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11"/></svg></div>
          <div class="quick-link-text"><h3>Formula Quiz</h3><p>Test your knowledge with MCQs</p></div>
        </a>
      </div>

      <h2 class="section-title">All Chapters</h2>
      <div class="chapter-grid" id="chapterGrid"></div>
    `;

    const grid = container.querySelector("#chapterGrid");
    CHAPTERS.forEach((ch) => {
      const card = document.createElement("article");
      card.className = "card chapter-card";
      const done = Storage.isChapterComplete(ch.id);
      card.innerHTML = `
        <div class="chapter-card-header">
          <div class="chapter-icon">${ICONS[ch.icon] || ICONS.hash}</div>
          <div>
            <p class="chapter-card-num">Chapter ${ch.id}${done ? " ✓" : ""}</p>
            <h3 class="chapter-card-title">${escapeHtml(ch.title)}</h3>
          </div>
        </div>
        <p class="chapter-card-summary">${escapeHtml(ch.summary)}</p>
        <div class="chapter-card-footer">
          <span class="badge badge-count">${ch.formulas.length} formulas</span>
          <a href="#/chapter/${ch.id}" class="btn btn-primary btn-sm">View Formulas</a>
        </div>
      `;
      grid.appendChild(card);
    });

    return container;
  }

  function chapter(id, filter) {
    const ch = getChapter(id);
    if (!ch) return notFound();

    const isComplete = Storage.isChapterComplete(ch.id);
    const container = document.createElement("div");

    container.innerHTML = `
      <div class="print-header">
        <h1>Chapter ${ch.id}: ${escapeHtml(ch.title)}</h1>
        <p>Class 10 Maths Formula Hub — CBSE</p>
      </div>
      <nav class="breadcrumb">
        <a href="#/">Home</a><span class="breadcrumb-sep">›</span>
        <span>${escapeHtml(ch.title)}</span>
      </nav>
      <div class="chapter-header">
        <div>
          <h1 class="page-title">Chapter ${ch.id}: ${escapeHtml(ch.title)}</h1>
          <p class="page-subtitle">${escapeHtml(ch.summary)}</p>
        </div>
        <div class="chapter-header-actions">
          <label class="checkbox-label">
            <input type="checkbox" id="markComplete" ${isComplete ? "checked" : ""} data-chapter="${ch.id}">
            Mark as complete
          </label>
          <button class="btn btn-secondary btn-sm" data-print type="button">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 9V2h12v7M6 18H4a2 2 0 01-2-2v-5a2 2 0 012-2h16a2 2 0 012 2v5a2 2 0 01-2 2h-2"/><rect x="6" y="14" width="12" height="8"/></svg>
            Print Sheet
          </button>
        </div>
      </div>
      <div class="filter-bar" id="chapterFilter">
        <button class="filter-pill active" data-filter="all" type="button">All</button>
        <button class="filter-pill" data-filter="definition" type="button">Definitions</button>
        <button class="filter-pill" data-filter="formula" type="button">Formulas</button>
        <button class="filter-pill" data-filter="theorem" type="button">Theorems</button>
        <button class="filter-pill" data-filter="identity" type="button">Identities</button>
        <button class="filter-pill" data-filter="important" type="button">Important</button>
      </div>
      <div class="chapter-search search-wrap">
        <svg class="search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/></svg>
        <input type="search" class="search-input" id="chapterSearchInput" placeholder="Filter formulas in this chapter..." aria-label="Filter chapter formulas">
      </div>
      <div id="formulaList" style="margin-top:1.25rem"></div>
    `;

    const list = container.querySelector("#formulaList");
    ch.formulas.forEach((f) => list.appendChild(buildFormulaCard(f, ch)));

    container.querySelector("#markComplete").addEventListener("change", (e) => {
      Storage.toggleChapterComplete(ch.id);
      App.updateProgress();
    });

    const activeFilter = filter || "all";
    applyChapterFilter(container, activeFilter, "");

    container.querySelectorAll("#chapterFilter .filter-pill").forEach((pill) => {
      pill.addEventListener("click", () => {
        container.querySelectorAll("#chapterFilter .filter-pill").forEach((p) => p.classList.remove("active"));
        pill.classList.add("active");
        const q = container.querySelector("#chapterSearchInput").value;
        applyChapterFilter(container, pill.dataset.filter, q);
      });
    });

    const searchInput = container.querySelector("#chapterSearchInput");
    searchInput.addEventListener("input", () => {
      const active = container.querySelector("#chapterFilter .filter-pill.active");
      applyChapterFilter(container, active ? active.dataset.filter : "all", searchInput.value);
    });

    return container;
  }

  function applyChapterFilter(container, filter, query) {
    const cards = container.querySelectorAll(".formula-card");
    const q = query.toLowerCase().trim();
    cards.forEach((card) => {
      const type = card.dataset.type;
      const isImportant = card.classList.contains("important");
      let show = filter === "all" || type === filter || (filter === "important" && isImportant);
      if (show && q) {
        const text = card.textContent.toLowerCase();
        show = text.includes(q);
      }
      card.style.display = show ? "" : "none";
    });

    const visible = [...cards].some((c) => c.style.display !== "none");
    let emptyEl = container.querySelector("#chapterEmpty");
    if (!visible && cards.length) {
      if (!emptyEl) {
        emptyEl = document.createElement("div");
        emptyEl.id = "chapterEmpty";
        emptyEl.className = "empty-state";
        emptyEl.innerHTML = "<h3>No matching formulas</h3><p>Try a different filter or search term.</p>";
        container.querySelector("#formulaList").after(emptyEl);
      }
      emptyEl.style.display = "";
    } else if (emptyEl) {
      emptyEl.style.display = "none";
    }
  }

  function important() {
    const container = document.createElement("div");
    container.innerHTML = `
      <div class="print-header">
        <h1>Most Important Formulas</h1>
        <p>Class 10 CBSE Maths — Board Exam Essentials</p>
      </div>
      <h1 class="page-title">Most Important Formulas</h1>
      <p class="page-subtitle">Must-know formulas for CBSE Class 10 board examination</p>
      <div class="page-actions">
        <button class="btn btn-secondary btn-sm" data-print type="button">Print Sheet</button>
      </div>
      <div id="importantList"></div>
    `;

    const list = container.querySelector("#importantList");
    IMPORTANT_FORMULA_IDS.forEach((fid) => {
      const found = getFormulaById(fid);
      if (found) list.appendChild(buildFormulaCard(found.formula, found.chapter));
    });

    if (!list.children.length) {
      list.innerHTML = '<div class="empty-state"><h3>No formulas found</h3><p>Important formula list is empty.</p></div>';
    }

    return container;
  }

  function revision() {
    const container = document.createElement("div");
    container.innerHTML = `
      <div class="print-header">
        <h1>Last Minute Revision</h1>
        <p>Class 10 CBSE Maths — Quick Formula Reference</p>
      </div>
      <h1 class="page-title">Last Minute Revision</h1>
      <p class="page-subtitle">Condensed formulas for quick scanning before your exam</p>
      <div class="page-actions">
        <button class="btn btn-secondary btn-sm" data-print type="button">Print Sheet</button>
      </div>
      <div id="revisionContent"></div>
    `;

    const content = container.querySelector("#revisionContent");
    CHAPTERS.forEach((ch) => {
      const importantFormulas = ch.formulas.filter((f) => f.important || IMPORTANT_FORMULA_IDS.includes(f.id));
      const formulas = importantFormulas.length ? importantFormulas : ch.formulas.slice(0, 5);
      const group = document.createElement("section");
      group.className = "revision-group";
      group.innerHTML = `<h2 class="revision-group-title"><span>Ch ${ch.id}</span> ${escapeHtml(ch.title)}</h2>`;

      formulas.forEach((f) => {
        const item = document.createElement("div");
        item.className = "revision-item";
        item.innerHTML = `
          <span class="revision-item-title">${escapeHtml(f.title)}</span>
          <span class="revision-item-latex">\\(${f.latex}\\)</span>
        `;
        group.appendChild(item);
      });
      content.appendChild(group);
    });

    return container;
  }

  function bookmarks() {
    const ids = Storage.getBookmarks();
    const container = document.createElement("div");
    container.innerHTML = `
      <h1 class="page-title">Bookmarked Formulas</h1>
      <p class="page-subtitle">Your saved formulas for quick access</p>
      <div id="bookmarkContent"></div>
    `;

    const content = container.querySelector("#bookmarkContent");
    if (!ids.length) {
      content.innerHTML = `
        <div class="empty-state">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M19 21l-7-5-7 5V5a2 2 0 012-2h10a2 2 0 012 2z"/></svg>
          <h3>No bookmarks yet</h3>
          <p>Click the bookmark button on any formula to save it here.</p>
        </div>`;
      return container;
    }

    CHAPTERS.forEach((ch) => {
      const chapterBookmarks = ch.formulas.filter((f) => ids.includes(f.id));
      if (!chapterBookmarks.length) return;
      const group = document.createElement("section");
      group.className = "bookmark-group";
      group.innerHTML = `<h2 class="bookmark-group-title">Chapter ${ch.id}: ${escapeHtml(ch.title)}</h2>`;
      chapterBookmarks.forEach((f) => group.appendChild(buildFormulaCard(f, ch)));
      content.appendChild(group);
    });

    return container;
  }

  function quiz() {
    const container = document.createElement("div");
    container.innerHTML = `
      <h1 class="page-title">Formula Quiz</h1>
      <p class="page-subtitle">Test your knowledge with multiple choice questions</p>
      <div id="quizContainer"></div>
    `;
    Quiz.renderSetup(container.querySelector("#quizContainer"));
    return container;
  }

  function notFound() {
    const el = document.createElement("div");
    el.className = "empty-state";
    el.innerHTML = `
      <h3>Page not found</h3>
      <p>The page you're looking for doesn't exist.</p>
      <a href="#/" class="btn btn-primary" style="margin-top:1rem;display:inline-flex">Go Home</a>`;
    return el;
  }

  function sidebarChapters() {
    const list = document.getElementById("sidebarChapterList");
    if (!list) return;
    list.innerHTML = CHAPTERS.map((ch) =>
      `<a href="#/chapter/${ch.id}" class="chapter-nav-link" data-chapter="${ch.id}">${ch.id}. ${escapeHtml(ch.title)}</a>`
    ).join("");
  }

  function mount(viewFn) {
    const main = document.getElementById("mainContent");
    if (!main) return;
    main.innerHTML = "";
    const content = viewFn();
    main.appendChild(content);
    renderMath(main);
    main.focus();
    window.scrollTo(0, 0);
    return content;
  }

  function highlightFormula(formulaId) {
    setTimeout(() => {
      const el = document.getElementById(`formula-${formulaId}`);
      if (el) {
        el.scrollIntoView({ behavior: "smooth", block: "center" });
        el.classList.add("highlight-flash");
        setTimeout(() => el.classList.remove("highlight-flash"), 1500);
      }
    }, 100);
  }

  return {
    home: () => mount(home),
    chapter: (id, filter) => mount(() => chapter(id, filter)),
    important: () => mount(important),
    revision: () => mount(revision),
    bookmarks: () => mount(bookmarks),
    quiz: () => mount(quiz),
    sidebarChapters,
    highlightFormula,
    getFormulaById,
    getChapter,
    buildFormulaCard,
    renderMath,
  };
})();
