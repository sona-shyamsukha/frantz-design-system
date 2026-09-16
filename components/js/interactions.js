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

  var MONTHS = ["januar", "februar", "mars", "april", "mai", "juni", "juli", "august", "september", "oktober", "november", "desember"];
  var DOW = ["Ma", "Ti", "On", "To", "Fr", "Lø", "Sø"];

  function pad(n) {
    return n < 10 ? "0" + n : String(n);
  }

  function formatDate(d) {
    return pad(d.getDate()) + "." + pad(d.getMonth() + 1) + "." + d.getFullYear();
  }

  function parseDate(str) {
    var m = /^(\d{2})\.(\d{2})\.(\d{4})$/.exec(str || "");
    if (!m) return null;
    var d = new Date(Number(m[3]), Number(m[2]) - 1, Number(m[1]));
    return isNaN(d.getTime()) ? null : d;
  }

  function sameDay(a, b) {
    return a && b && a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
  }

  function startOfDay(d) {
    return new Date(d.getFullYear(), d.getMonth(), d.getDate());
  }

  function between(day, a, b) {
    if (!a || !b) return false;
    var t = startOfDay(day).getTime();
    var x = startOfDay(a).getTime();
    var y = startOfDay(b).getTime();
    return t > Math.min(x, y) && t < Math.max(x, y);
  }

  function createDatepicker(root) {
    var mode = root.getAttribute("data-mode") || "single";
    var inputs = root.querySelectorAll(".datepicker__input");
    var startInput = inputs[0];
    var endInput = inputs[1] || null;
    var view = parseDate(startInput && startInput.value) || new Date();
    var panel = document.createElement("div");
    panel.className = "datepicker__panel datepicker__panel--float";
    panel.hidden = true;
    panel.setAttribute("role", "dialog");
    panel.setAttribute("aria-label", "Velg dato");
    root.appendChild(panel);

    function selected() {
      return {
        start: startInput ? parseDate(startInput.value) : null,
        end: endInput ? parseDate(endInput.value) : null
      };
    }

    function close() {
      panel.hidden = true;
      root.classList.remove("is-open");
    }

    function open() {
      closeOpenDatepickers(root);
      var cur = selected().start || new Date();
      view = new Date(cur.getFullYear(), cur.getMonth(), 1);
      render();
      panel.hidden = false;
      root.classList.add("is-open");
    }

    function setRange(start, end) {
      if (startInput) startInput.value = start ? formatDate(start) : "";
      if (endInput) endInput.value = end ? formatDate(end) : "";
    }

    function pick(day) {
      if (mode !== "range" || !endInput) {
        setRange(day, null);
        close();
        return;
      }
      var cur = selected();
      if (!cur.start || cur.end) {
        setRange(day, null);
        render();
        return;
      }
      if (startOfDay(day).getTime() < startOfDay(cur.start).getTime()) {
        setRange(day, cur.start);
      } else {
        setRange(cur.start, day);
      }
      close();
    }

    function render() {
      var year = view.getFullYear();
      var month = view.getMonth();
      var first = new Date(year, month, 1);
      var startDow = first.getDay() === 0 ? 6 : first.getDay() - 1;
      var daysInMonth = new Date(year, month + 1, 0).getDate();
      var prevDays = new Date(year, month, 0).getDate();
      var cur = selected();
      var rangeEnd = cur.end;
      var html = "";
      html += '<div class="datepicker__nav">';
      html += '<button class="datepicker__nav-btn" type="button" data-nav="-1" aria-label="Forrige måned"><span class="icon-lucide icon-lucide--chevron-left" aria-hidden="true"></span></button>';
      html += '<span class="datepicker__month">' + MONTHS[month] + " " + year + "</span>";
      html += '<button class="datepicker__nav-btn" type="button" data-nav="1" aria-label="Neste måned"><span class="icon-lucide icon-lucide--chevron-right" aria-hidden="true"></span></button>';
      html += "</div>";
      html += '<div class="datepicker__week">';
      DOW.forEach(function (d) { html += '<span class="datepicker__dow">' + d + "</span>"; });
      html += "</div><div class=\"datepicker__grid\">";
      var total = 42;
      var today = new Date();
      for (var i = 0; i < total; i++) {
        var dateNum;
        var dateObj;
        var extra = "";
        if (i < startDow) {
          dateNum = prevDays - startDow + i + 1;
          dateObj = new Date(year, month - 1, dateNum);
          extra = " datepicker__day--muted";
        } else if (i >= startDow + daysInMonth) {
          dateNum = i - startDow - daysInMonth + 1;
          dateObj = new Date(year, month + 1, dateNum);
          extra = " datepicker__day--muted";
        } else {
          dateNum = i - startDow + 1;
          dateObj = new Date(year, month, dateNum);
        }
        if (sameDay(dateObj, today)) extra += " datepicker__day--today";
        if (mode === "range") {
          if (cur.start && sameDay(dateObj, cur.start)) extra += " datepicker__day--start";
          if (rangeEnd && sameDay(dateObj, rangeEnd)) extra += " datepicker__day--end";
          if (cur.start && rangeEnd && between(dateObj, cur.start, rangeEnd)) extra += " datepicker__day--in";
          if (cur.start && rangeEnd && sameDay(cur.start, rangeEnd) && sameDay(dateObj, cur.start)) extra += " datepicker__day--selected";
        } else if (cur.start && sameDay(dateObj, cur.start)) {
          extra += " datepicker__day--selected";
        }
        html += '<button class="datepicker__day' + extra + '" type="button" data-date="' + formatDate(dateObj) + '">' + dateNum + "</button>";
      }
      html += "</div>";
      html += '<div class="datepicker__foot">';
      html += '<button class="datepicker__today" type="button">I dag</button>';
      html += '<button class="datepicker__clear" type="button">Tøm</button>';
      html += "</div>";
      panel.innerHTML = html;
    }

    Array.prototype.forEach.call(inputs, function (input) {
      input.setAttribute("readonly", "readonly");
      input.addEventListener("click", function () { open(); });
      input.addEventListener("focus", function () { open(); });
    });

    panel.addEventListener("click", function (e) {
      var nav = e.target.closest("[data-nav]");
      if (nav) {
        view = new Date(view.getFullYear(), view.getMonth() + Number(nav.getAttribute("data-nav")), 1);
        render();
        return;
      }
      if (e.target.closest(".datepicker__today")) {
        pick(new Date());
        return;
      }
      if (e.target.closest(".datepicker__clear")) {
        setRange(null, null);
        render();
        return;
      }
      var dayBtn = e.target.closest("[data-date]");
      if (dayBtn) pick(parseDate(dayBtn.getAttribute("data-date")));
    });

    root._frantzCloseDatepicker = close;
  }

  function closeOpenDatepickers(except) {
    document.querySelectorAll("[data-datepicker].is-open").forEach(function (root) {
      if (root !== except && typeof root._frantzCloseDatepicker === "function") {
        root._frantzCloseDatepicker();
      }
    });
  }

  function initDatepickers() {
    document.querySelectorAll("[data-datepicker]").forEach(function (root) {
      if (root.getAttribute("data-ready") === "true") return;
      root.setAttribute("data-ready", "true");
      createDatepicker(root);
    });
    document.addEventListener("pointerdown", function (e) {
      var host = e.target.closest("[data-datepicker]");
      if (!host) closeOpenDatepickers(null);
    });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape") closeOpenDatepickers(null);
    });
  }

  function init() {
    initNav();
    initDatepickers();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
