/**
 * Global search across chapters and formulas
 */
const Search = (function () {
  "use strict";

  let input = null;
  let resultsEl = null;
  let debounceTimer = null;
  let index = [];

  function buildIndex() {
    index = [];
    CHAPTERS.forEach((ch) => {
      index.push({
        type: "chapter",
        id: ch.id,
        title: ch.title,
        text: `${ch.title} ${ch.summary}`.toLowerCase(),
        href: `#/chapter/${ch.id}`,
      });
      ch.formulas.forEach((f) => {
        index.push({
          type: "formula",
          id: f.id,
          title: f.title,
          chapter: ch.title,
          chapterId: ch.id,
          text: `${f.title} ${f.plainText} ${f.explanation} ${f.example || ""} ${ch.title}`.toLowerCase(),
          href: `#/chapter/${ch.id}?formula=${f.id}`,
        });
      });
    });
  }

  function search(query) {
    const q = query.toLowerCase().trim();
    if (!q || q.length < 2) return [];
    return index.filter((item) => item.text.includes(q)).slice(0, 12);
  }

  function renderResults(items) {
    if (!resultsEl) return;
    if (!items.length) {
      resultsEl.innerHTML = '<div class="search-no-results">No formulas found</div>';
      resultsEl.classList.add("open");
      return;
    }

    resultsEl.innerHTML = items.map((item) => {
      if (item.type === "chapter") {
        return `<a href="${item.href}" class="search-result-item" role="option">
          <div class="search-result-title">${escapeHtml(item.title)}</div>
          <div class="search-result-chapter">Chapter ${item.id}</div>
        </a>`;
      }
      return `<a href="${item.href}" class="search-result-item" role="option">
        <div class="search-result-title">${escapeHtml(item.title)}</div>
        <div class="search-result-chapter">${escapeHtml(item.chapter)}</div>
      </a>`;
    }).join("");
    resultsEl.classList.add("open");
  }

  function escapeHtml(str) {
    const div = document.createElement("div");
    div.textContent = str;
    return div.innerHTML;
  }

  function closeResults() {
    if (resultsEl) resultsEl.classList.remove("open");
  }

  function init() {
    input = document.getElementById("globalSearch");
    resultsEl = document.getElementById("searchResults");
    if (!input) return;

    buildIndex();

    input.addEventListener("input", () => {
      clearTimeout(debounceTimer);
      debounceTimer = setTimeout(() => {
        const q = input.value;
        if (q.length < 2) { closeResults(); return; }
        renderResults(search(q));
      }, 200);
    });

    input.addEventListener("focus", () => {
      if (input.value.length >= 2) renderResults(search(input.value));
    });

    document.addEventListener("click", (e) => {
      if (!e.target.closest("#searchWrap")) closeResults();
    });

    input.addEventListener("keydown", (e) => {
      if (e.key === "Escape") { closeResults(); input.blur(); }
    });
  }

  return { init, search, buildIndex, closeResults };
})();
