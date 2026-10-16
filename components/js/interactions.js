(function () {
  function setMenu(open) {
    document.body.classList.toggle("meny-apen", open);
    var burger = document.getElementById("burger");
    var backdrop = document.getElementById("backdrop");
    if (burger) burger.setAttribute("aria-expanded", String(open));
    if (backdrop) backdrop.hidden = !open;
    // Flytt fokus inn i menyen når den åpnes, og tilbake til burgeren når den lukkes.
    var closeBtn = document.getElementById("menylukk");
    if (open && closeBtn) closeBtn.focus();
    var rail = document.getElementById("rail");
    if (!open && burger && rail && rail.contains(document.activeElement)) burger.focus();
  }

  function initNav() {
    var burger = document.getElementById("burger");
    var closeBtn = document.getElementById("menylukk");
    var backdrop = document.getElementById("backdrop");
    if (burger) burger.addEventListener("click", function () { setMenu(true); });
    if (closeBtn) closeBtn.addEventListener("click", function () { setMenu(false); });
    if (backdrop) backdrop.addEventListener("click", function () { setMenu(false); });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && document.body.classList.contains("meny-apen")) setMenu(false);
    });
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

  // Same day in the next or previous month. 31 March + 1 month is 30 April.
  function sameDayInMonth(d, step) {
    var last = new Date(d.getFullYear(), d.getMonth() + step + 1, 0).getDate();
    return new Date(d.getFullYear(), d.getMonth() + step, Math.min(d.getDate(), last));
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

  function longDate(d) {
    return d.getDate() + ". " + MONTHS[d.getMonth()] + " " + d.getFullYear();
  }

  function addDays(d, n) {
    return new Date(d.getFullYear(), d.getMonth(), d.getDate() + n);
  }

  /* Datepicker. Keyboard:
     - Enter, Space or Arrow down in the field opens the calendar. Focus moves to the chosen day.
     - Arrows move one day or one week. Home/End go to the start or end of the week.
       Page up/Page down change the month. Enter or Space picks the day.
     - Escape closes the calendar. Focus goes back to the field.
     - Tab stays inside the calendar while it is open. */
  function createDatepicker(root) {
    var mode = root.getAttribute("data-mode") || "single";
    var inputs = root.querySelectorAll(".datepicker__input");
    var startInput = inputs[0];
    var endInput = inputs[1] || null;
    var view = parseDate(startInput && startInput.value) || new Date();
    var focusDay = null;
    var opener = startInput;
    var panel = document.createElement("div");
    panel.className = "datepicker__panel datepicker__panel--float";
    panel.hidden = true;
    panel.setAttribute("role", "dialog");
    panel.setAttribute("aria-modal", "false");
    panel.setAttribute("aria-label", mode === "range" ? "Velg periode" : "Velg dato");
    panel.id = (startInput && startInput.id ? startInput.id : "dato" + Math.random().toString(36).slice(2, 7)) + "-kalender";
    root.appendChild(panel);
    // The month is read out from here. It stays in the page, because render() rebuilds the panel.
    var monthLive = document.createElement("span");
    monthLive.className = "sr-only";
    monthLive.setAttribute("aria-live", "polite");
    root.appendChild(monthLive);
    var shownMonth = null;

    function selected() {
      return {
        start: startInput ? parseDate(startInput.value) : null,
        end: endInput ? parseDate(endInput.value) : null
      };
    }

    function setExpanded(open) {
      Array.prototype.forEach.call(inputs, function (input) {
        input.setAttribute("aria-expanded", String(open));
      });
    }

    function close(returnFocus) {
      if (panel.hidden) return;
      panel.hidden = true;
      root.classList.remove("is-open");
      setExpanded(false);
      if (returnFocus && opener) opener.focus();
    }

    function open(input, moveFocus) {
      closeOpenDatepickers(root);
      opener = input || startInput;
      var cur = selected();
      var mine = opener === endInput ? (cur.end || cur.start) : cur.start;
      focusDay = startOfDay(mine || new Date());
      view = new Date(focusDay.getFullYear(), focusDay.getMonth(), 1);
      render();
      panel.hidden = false;
      root.classList.add("is-open");
      setExpanded(true);
      if (moveFocus) focusCurrent();
    }

    function focusCurrent() {
      var btn = panel.querySelector('[data-date="' + formatDate(focusDay) + '"]');
      if (btn) btn.focus();
    }

    function moveTo(day) {
      focusDay = startOfDay(day);
      if (focusDay.getMonth() !== view.getMonth() || focusDay.getFullYear() !== view.getFullYear()) {
        view = new Date(focusDay.getFullYear(), focusDay.getMonth(), 1);
        render();
      } else {
        panel.querySelectorAll("[data-date]").forEach(function (b) {
          b.tabIndex = b.getAttribute("data-date") === formatDate(focusDay) ? 0 : -1;
        });
      }
      focusCurrent();
    }

    function announce(input) {
      input.dispatchEvent(new Event("input", { bubbles: true }));
      input.dispatchEvent(new Event("change", { bubbles: true }));
    }

    function setRange(start, end) {
      if (startInput) { startInput.value = start ? formatDate(start) : ""; announce(startInput); }
      if (endInput) { endInput.value = end ? formatDate(end) : ""; announce(endInput); }
    }

    function pick(day) {
      if (mode !== "range" || !endInput) {
        setRange(day, null);
        close(true);
        return;
      }
      var cur = selected();
      if (!cur.start || cur.end) {
        setRange(day, null);
        focusDay = startOfDay(day);
        view = new Date(day.getFullYear(), day.getMonth(), 1);
        render();
        focusCurrent();
        return;
      }
      if (startOfDay(day).getTime() < startOfDay(cur.start).getTime()) {
        setRange(day, cur.start);
      } else {
        setRange(cur.start, day);
      }
      close(true);
    }

    function render() {
      var year = view.getFullYear();
      var month = view.getMonth();
      var first = new Date(year, month, 1);
      var startDow = first.getDay() === 0 ? 6 : first.getDay() - 1;
      var cur = selected();
      var rangeEnd = cur.end;
      if (!focusDay || focusDay.getMonth() !== month || focusDay.getFullYear() !== year) focusDay = first;
      var html = "";
      html += '<div class="datepicker__nav">';
      html += '<button class="datepicker__nav-btn" type="button" data-nav="-1" aria-label="Forrige måned"><span class="icon-lucide icon-lucide--chevron-left" aria-hidden="true"></span></button>';
      html += '<span class="datepicker__month">' + MONTHS[month] + " " + year + "</span>";
      html += '<button class="datepicker__nav-btn" type="button" data-nav="1" aria-label="Neste måned"><span class="icon-lucide icon-lucide--chevron-right" aria-hidden="true"></span></button>';
      html += "</div>";
      html += '<div class="datepicker__week" aria-hidden="true">';
      DOW.forEach(function (d) { html += '<span class="datepicker__dow">' + d + "</span>"; });
      html += "</div><div class=\"datepicker__grid\">";
      var today = new Date();
      for (var i = 0; i < 42; i++) {
        var dateObj = new Date(year, month, i - startDow + 1);
        var extra = "";
        var chosen = false;
        if (dateObj.getMonth() !== month) extra = " datepicker__day--muted";
        var isToday = sameDay(dateObj, today);
        if (isToday) extra += " datepicker__day--today";
        if (mode === "range") {
          if (cur.start && sameDay(dateObj, cur.start)) { extra += " datepicker__day--start"; chosen = true; }
          if (rangeEnd && sameDay(dateObj, rangeEnd)) { extra += " datepicker__day--end"; chosen = true; }
          if (cur.start && rangeEnd && between(dateObj, cur.start, rangeEnd)) extra += " datepicker__day--in";
          if (cur.start && rangeEnd && sameDay(cur.start, rangeEnd) && sameDay(dateObj, cur.start)) extra += " datepicker__day--selected";
        } else if (cur.start && sameDay(dateObj, cur.start)) {
          extra += " datepicker__day--selected";
          chosen = true;
        }
        var label = longDate(dateObj) + (isToday ? ", i dag" : "");
        html += '<button class="datepicker__day' + extra + '" type="button" data-date="' + formatDate(dateObj) + '"' +
          ' aria-label="' + label + '" aria-pressed="' + chosen + '"' + (isToday ? ' aria-current="date"' : "") +
          ' tabindex="' + (sameDay(dateObj, focusDay) ? 0 : -1) + '">' + dateObj.getDate() + "</button>";
      }
      html += "</div>";
      html += '<div class="datepicker__foot">';
      html += '<button class="datepicker__today" type="button">I dag</button>';
      html += '<button class="datepicker__clear" type="button">Tøm</button>';
      html += "</div>";
      panel.innerHTML = html;
      var monthText = MONTHS[month] + " " + year;
      if (!panel.hidden && shownMonth !== null && shownMonth !== monthText) monthLive.textContent = monthText;
      shownMonth = monthText;
    }

    Array.prototype.forEach.call(inputs, function (input) {
      input.setAttribute("readonly", "readonly");
      input.setAttribute("aria-haspopup", "dialog");
      input.setAttribute("aria-expanded", "false");
      input.setAttribute("aria-controls", panel.id);
      input.addEventListener("click", function () { open(input, false); });
      input.addEventListener("keydown", function (e) {
        if (e.key === "Enter" || e.key === " " || e.key === "ArrowDown") {
          e.preventDefault();
          open(input, true);
        } else if (e.key === "Escape" && !panel.hidden) {
          e.stopPropagation();
          close(false);
        }
      });
    });

    panel.addEventListener("keydown", function (e) {
      if (e.key === "Escape") {
        e.preventDefault();
        e.stopPropagation();
        close(true);
        return;
      }
      if (e.key === "Tab") {
        var focusable = Array.prototype.filter.call(panel.querySelectorAll("button"), function (b) { return b.tabIndex !== -1; });
        var firstEl = focusable[0];
        var lastEl = focusable[focusable.length - 1];
        if (e.shiftKey && document.activeElement === firstEl) { e.preventDefault(); lastEl.focus(); }
        else if (!e.shiftKey && document.activeElement === lastEl) { e.preventDefault(); firstEl.focus(); }
        return;
      }
      if (!e.target.closest("[data-date]")) return;
      var dow = focusDay.getDay() === 0 ? 6 : focusDay.getDay() - 1;
      var next = null;
      switch (e.key) {
        case "ArrowLeft": next = addDays(focusDay, -1); break;
        case "ArrowRight": next = addDays(focusDay, 1); break;
        case "ArrowUp": next = addDays(focusDay, -7); break;
        case "ArrowDown": next = addDays(focusDay, 7); break;
        case "Home": next = addDays(focusDay, -dow); break;
        case "End": next = addDays(focusDay, 6 - dow); break;
        case "PageUp": next = sameDayInMonth(focusDay, -1); break;
        case "PageDown": next = sameDayInMonth(focusDay, 1); break;
      }
      if (next) {
        e.preventDefault();
        moveTo(next);
      }
    });

    panel.addEventListener("click", function (e) {
      var nav = e.target.closest("[data-nav]");
      if (nav) {
        view = new Date(view.getFullYear(), view.getMonth() + Number(nav.getAttribute("data-nav")), 1);
        focusDay = null;
        render();
        panel.querySelector('[data-nav="' + nav.getAttribute("data-nav") + '"]').focus();
        return;
      }
      if (e.target.closest(".datepicker__today")) {
        pick(new Date());
        return;
      }
      if (e.target.closest(".datepicker__clear")) {
        setRange(null, null);
        render();
        panel.querySelector(".datepicker__clear").focus();
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
    document.addEventListener("focusin", function (e) {
      if (!e.target.closest || !e.target.closest("[data-datepicker]")) closeOpenDatepickers(null);
    });
  }

  /* Tooltip. The text in data-tooltip is drawn with CSS, so screen readers miss it.
     Here each .tooltip gets a hidden copy of the text and points to it with aria-describedby.
     If aria-label already holds the text, nothing is added.
     Escape hides the open tooltip until the pointer or focus leaves it. */
  var tipCount = 0;

  function syncTooltip(btn) {
    var text = btn.getAttribute("data-tooltip") || "";
    var label = btn.getAttribute("aria-label") || "";
    var desc = btn.querySelector(".tooltip__tekst");
    if (!text || label.indexOf(text) !== -1) {
      if (desc) {
        desc.remove();
        btn.removeAttribute("aria-describedby");
      }
      return;
    }
    if (!desc) {
      desc = document.createElement("span");
      desc.className = "tooltip__tekst";
      desc.hidden = true;
      desc.id = "tooltip-tekst-" + (++tipCount);
      btn.appendChild(desc);
      btn.setAttribute("aria-describedby", desc.id);
    }
    if (desc.textContent !== text) desc.textContent = text;
  }

  function initTooltips() {
    document.querySelectorAll(".tooltip[data-tooltip]").forEach(syncTooltip);
    document.addEventListener("focusin", function (e) {
      var tip = e.target.closest && e.target.closest(".tooltip[data-tooltip]");
      if (tip) syncTooltip(tip);
    });
    document.addEventListener("keydown", function (e) {
      if (e.key !== "Escape") return;
      document.querySelectorAll(".tooltip[data-tooltip]").forEach(function (tip) {
        if (tip === document.activeElement || tip.matches(":hover")) tip.classList.add("is-lukket");
      });
    });
    function reopen(e) {
      if (e.target.classList && e.target.classList.contains("tooltip")) e.target.classList.remove("is-lukket");
    }
    document.addEventListener("focusout", reopen);
    document.addEventListener("pointerleave", reopen, true);
    if (window.MutationObserver) {
      new MutationObserver(function (list) {
        list.forEach(function (m) {
          if (m.target.classList && m.target.classList.contains("tooltip")) syncTooltip(m.target);
        });
      }).observe(document.body, { subtree: true, attributes: true, attributeFilter: ["data-tooltip", "aria-label"] });
    }
  }

  /* Clickable table row: <tr tabindex="0" onclick="…"> or a click handler on the table.
     Enter and Space on the focused row do the same as a click. */
  function initTableRows() {
    document.addEventListener("keydown", function (e) {
      if (e.key !== "Enter" && e.key !== " ") return;
      var row = e.target;
      if (!row.matches || !row.matches("tr[tabindex]") || e.defaultPrevented) return;
      e.preventDefault();
      row.click();
    });
  }

  /* Selectable cards. Put data-velg on the group:
     data-velg="flere" — each .select-card turns on and off by itself.
     data-velg="en"    — one .choice-card is chosen. The others turn off.
     A card with aria-disabled="true" is locked. It can get focus, but a click does nothing.
     The group sends the event "kortvalg" when the choice changes. */
  function initCardGroups() {
    document.addEventListener("click", function (e) {
      var card = e.target.closest(".select-card, .choice-card");
      if (!card) return;
      var group = card.closest("[data-velg]");
      if (!group) return;
      if (card.getAttribute("aria-disabled") === "true") return;
      var cards = group.querySelectorAll(".select-card, .choice-card");
      if (group.getAttribute("data-velg") === "en") {
        cards.forEach(function (c) { c.setAttribute("aria-pressed", String(c === card)); });
      } else {
        card.setAttribute("aria-pressed", String(card.getAttribute("aria-pressed") !== "true"));
      }
      group.dispatchEvent(new CustomEvent("kortvalg", { bubbles: true, detail: { kort: card } }));
    });
  }

  /* Budget slider: screen readers read «kr 36 500», not «36500».
     An <output for="slider-id"> next to it shows the same text. */
  function kroner(n) {
    return "kr " + Math.round(Number(n)).toLocaleString("nb-NO").replace(/[\u00a0\u202f]/g, " ");
  }

  function syncSlider(slider) {
    var text = kroner(slider.value);
    slider.setAttribute("aria-valuetext", text);
    if (slider.id) {
      document.querySelectorAll('output[for="' + slider.id + '"]').forEach(function (o) { o.textContent = text; });
    }
  }

  function initSliders() {
    // A slider that already has a text (set in HTML or by picker.js) keeps it until it moves
    document.querySelectorAll(".budsjett-slider").forEach(function (slider) {
      if (!slider.hasAttribute("aria-valuetext")) syncSlider(slider);
    });
    document.addEventListener("input", function (e) {
      if (e.target.classList && e.target.classList.contains("budsjett-slider")) syncSlider(e.target);
    });
  }
  window.FrantzSlider = { sync: syncSlider };

  function init() {
    initNav();
    initDatepickers();
    initTooltips();
    initTableRows();
    initCardGroups();
    initSliders();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
