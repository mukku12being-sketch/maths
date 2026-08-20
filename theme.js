/**
 * Dark / Light theme toggle
 */
const Theme = (function () {
  "use strict";

  let toggleBtn = null;

  function getTheme() {
    return document.documentElement.getAttribute("data-theme") === "dark" ? "dark" : "light";
  }

  function setTheme(theme) {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("maths-hub-theme", theme);
  }

  function toggle() {
    setTheme(getTheme() === "dark" ? "light" : "dark");
  }

  function init() {
    toggleBtn = document.getElementById("themeToggle");
    if (toggleBtn) toggleBtn.addEventListener("click", toggle);
  }

  return { init, toggle, getTheme, setTheme };
})();
