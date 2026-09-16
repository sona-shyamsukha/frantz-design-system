(function () {
  function setMenu(open) {
    document.body.classList.toggle("meny-apen", open);
    var burger = document.getElementById("burger");
    var backdrop = document.getElementById("backdrop");
    if (burger) burger.setAttribute("aria-expanded", String(open));
    if (backdrop) backdrop.hidden = !open;
  }

  function initNav() {
    var burger = document.getElementById("burger");
    var closeBtn = document.getElementById("menylukk");
    var backdrop = document.getElementById("backdrop");
    if (burger) burger.addEventListener("click", function () { setMenu(true); });
    if (closeBtn) closeBtn.addEventListener("click", function () { setMenu(false); });
    if (backdrop) backdrop.addEventListener("click", function () { setMenu(false); });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initNav);
  } else {
    initNav();
  }
})();
