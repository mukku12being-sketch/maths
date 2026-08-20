/**
 * MCQ Quiz engine
 */
const Quiz = (function () {
  "use strict";

  let state = {
    questions: [],
    current: 0,
    score: 0,
    answered: false,
    chapterKey: "mixed",
  };

  function escapeHtml(str) {
    const div = document.createElement("div");
    div.textContent = str;
    return div.innerHTML;
  }

  function getQuestions(chapterId) {
    if (chapterId === "mixed") {
      return [...QUIZ_DATA].sort(() => Math.random() - 0.5).slice(0, 10);
    }
    return QUIZ_DATA.filter((q) => q.chapterId === Number(chapterId));
  }

  function renderSetup(container) {
    const scores = Storage.getQuizScores();
    container.innerHTML = `
      <div class="card quiz-setup" style="padding:1.25rem">
        <label for="quizChapter">Select Chapter</label>
        <select id="quizChapter">
          <option value="mixed">Mixed (10 random questions)</option>
          ${CHAPTERS.map((ch) => `<option value="${ch.id}">Chapter ${ch.id}: ${escapeHtml(ch.title)}</option>`).join("")}
        </select>
        <button class="btn btn-primary" id="startQuiz" type="button">Start Quiz</button>
      </div>
      <div id="quizBestScores">
        ${Object.keys(scores).length ? renderBestScores(scores) : ""}
      </div>
      <div id="quizArea"></div>
    `;

    container.querySelector("#startQuiz").addEventListener("click", () => {
      const chapterId = container.querySelector("#quizChapter").value;
      startQuiz(container.querySelector("#quizArea"), chapterId);
    });
  }

  function renderBestScores(scores) {
    let html = '<div class="section-title" style="margin-top:1.5rem">Best Scores</div><div style="display:flex;flex-wrap:wrap;gap:0.5rem">';
    Object.entries(scores).forEach(([key, val]) => {
      const label = key === "mixed" ? "Mixed" : `Chapter ${key}`;
      html += `<span class="badge badge-count">${label}: ${val.score}/${val.total}</span>`;
    });
    html += "</div>";
    return html;
  }

  function startQuiz(area, chapterId) {
    state = {
      questions: getQuestions(chapterId),
      current: 0,
      score: 0,
      answered: false,
      chapterKey: String(chapterId),
    };

    if (!state.questions.length) {
      area.innerHTML = '<div class="empty-state"><h3>No questions available</h3></div>';
      return;
    }

    renderQuestion(area);
  }

  function renderQuestion(area) {
    const q = state.questions[state.current];
    const total = state.questions.length;
    const ch = CHAPTERS.find((c) => c.id === q.chapterId);

    area.innerHTML = `
      <div class="card quiz-question">
        <p class="quiz-question-num">Question ${state.current + 1} of ${total}${ch ? ` · ${escapeHtml(ch.title)}` : ""}</p>
        <p class="quiz-question-text">${escapeHtml(q.question)}</p>
        <div class="quiz-options" id="quizOptions">
          ${q.options.map((opt, i) =>
            `<button class="quiz-option" data-index="${i}" type="button">${escapeHtml(opt)}</button>`
          ).join("")}
        </div>
        <div id="quizFeedback"></div>
      </div>
      <div id="quizNav"></div>
    `;

    area.querySelectorAll(".quiz-option").forEach((btn) => {
      btn.addEventListener("click", () => selectAnswer(area, Number(btn.dataset.index)));
    });
  }

  function selectAnswer(area, index) {
    if (state.answered) return;
    state.answered = true;

    const q = state.questions[state.current];
    const options = area.querySelectorAll(".quiz-option");
    const feedback = area.querySelector("#quizFeedback");
    const isCorrect = index === q.correct;

    if (isCorrect) state.score++;

    options.forEach((opt, i) => {
      opt.classList.add("disabled");
      if (i === q.correct) opt.classList.add("correct");
      else if (i === index) opt.classList.add("incorrect");
    });

    feedback.innerHTML = `
      <div class="quiz-feedback ${isCorrect ? "correct" : "incorrect"}">
        ${isCorrect ? "✓ Correct!" : "✗ Incorrect."} ${escapeHtml(q.explanation)}
      </div>
    `;

    const nav = area.querySelector("#quizNav");
    if (state.current < state.questions.length - 1) {
      nav.innerHTML = `<button class="btn btn-primary" id="nextQ" type="button" style="margin-top:0.5rem">Next Question</button>`;
      nav.querySelector("#nextQ").addEventListener("click", () => {
        state.current++;
        state.answered = false;
        renderQuestion(area);
      });
    } else {
      showResults(area);
    }
  }

  function showResults(area) {
    const total = state.questions.length;
    const pct = Math.round((state.score / total) * 100);
    Storage.saveQuizScore(state.chapterKey, state.score, total);

    area.innerHTML = `
      <div class="card quiz-score-card">
        <div class="quiz-score-value">${state.score}/${total}</div>
        <div class="quiz-score-label">${pct}% — ${pct >= 70 ? "Great job!" : pct >= 50 ? "Good effort! Keep practicing." : "Keep revising the formulas!"}</div>
        <div class="quiz-best-score">Score saved for this chapter</div>
      </div>
      <button class="btn btn-primary" id="retryQuiz" type="button">Try Again</button>
      <a href="#/quiz" class="btn btn-secondary" style="margin-left:0.5rem">New Quiz</a>
    `;

    area.querySelector("#retryQuiz").addEventListener("click", () => {
      startQuiz(area, state.chapterKey);
    });
  }

  return { renderSetup, startQuiz };
})();
