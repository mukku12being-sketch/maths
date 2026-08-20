/**
 * Copy formula to clipboard + toast notification
 */
const Copy = (function () {
  "use strict";

  let toastEl = null;
  let toastTimer = null;

  function showToast(message) {
    if (!toastEl) toastEl = document.getElementById("toast");
    if (!toastEl) return;
    toastEl.textContent = message;
    toastEl.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toastEl.classList.remove("show"), 2500);
  }

  async function copyText(text) {
    try {
      await navigator.clipboard.writeText(text);
      showToast("Formula copied to clipboard!");
      return true;
    } catch {
      const ta = document.createElement("textarea");
      ta.value = text;
      ta.style.position = "fixed";
      ta.style.opacity = "0";
      document.body.appendChild(ta);
      ta.select();
      try {
        document.execCommand("copy");
        showToast("Formula copied to clipboard!");
        return true;
      } catch {
        showToast("Could not copy. Please select manually.");
        return false;
      } finally {
        document.body.removeChild(ta);
      }
    }
  }

  function init() {
    document.addEventListener("click", (e) => {
      const btn = e.target.closest("[data-copy]");
      if (!btn) return;
      const text = btn.getAttribute("data-copy");
      if (text) copyText(text);
    });
  }

  return { init, copyText, showToast };
})();
