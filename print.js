/**
 * Print / Download formula sheet
 */
const Print = (function () {
  "use strict";

  function printPage() {
    window.print();
  }

  function init() {
    document.addEventListener("click", (e) => {
      const btn = e.target.closest("[data-print]");
      if (btn) printPage();
    });
  }

  return { init, printPage };
})();
