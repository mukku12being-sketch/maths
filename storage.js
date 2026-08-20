/**
 * localStorage helpers for progress, bookmarks, and quiz scores
 */
const Storage = (function () {
  "use strict";

  const KEYS = {
    theme: "maths-hub-theme",
    completed: "maths-hub-completed",
    bookmarks: "maths-hub-bookmarks",
    quizScores: "maths-hub-quiz-scores",
  };

  function read(key, fallback) {
    try {
      const raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) : fallback;
    } catch {
      return fallback;
    }
  }

  function write(key, value) {
    localStorage.setItem(key, JSON.stringify(value));
  }

  return {
    getCompleted() {
      return read(KEYS.completed, []);
    },

    isChapterComplete(id) {
      return this.getCompleted().includes(Number(id));
    },

    toggleChapterComplete(id) {
      const numId = Number(id);
      const list = this.getCompleted();
      const idx = list.indexOf(numId);
      if (idx >= 0) list.splice(idx, 1);
      else list.push(numId);
      write(KEYS.completed, list);
      return list;
    },

    getBookmarks() {
      return read(KEYS.bookmarks, []);
    },

    isBookmarked(formulaId) {
      return this.getBookmarks().includes(formulaId);
    },

    toggleBookmark(formulaId) {
      const list = this.getBookmarks();
      const idx = list.indexOf(formulaId);
      if (idx >= 0) list.splice(idx, 1);
      else list.push(formulaId);
      write(KEYS.bookmarks, list);
      return list;
    },

    getQuizScores() {
      return read(KEYS.quizScores, {});
    },

    saveQuizScore(chapterKey, score, total) {
      const scores = this.getQuizScores();
      const prev = scores[chapterKey];
      if (!prev || score > prev.score) {
        scores[chapterKey] = { score, total, date: Date.now() };
        write(KEYS.quizScores, scores);
      }
      return scores[chapterKey];
    },

    getProgressPercent() {
      const completed = this.getCompleted().length;
      const total = CHAPTERS.length;
      return Math.round((completed / total) * 100);
    },
  };
})();
