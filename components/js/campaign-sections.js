/* One navigation behaviour for every campaign state; visuals reuse the shared filter tabs. */
(function (root) {
  'use strict';
  var navigation;
  function init(options) {
    if (navigation) return navigation;
    var defaultTab = options && options.defaultTab || 'innsikt';
    var list = document.querySelector('[data-campaign-sections] [role="tablist"]');
    if (!list) return null;
    var tabs = Array.from(list.querySelectorAll('[data-fane]'));
    function availableTabs() { return tabs.filter(function (tab) { return !tab.hidden; }); }
    function fallback() { return availableTabs().find(function (tab) { return tab.dataset.fane === defaultTab; }) || availableTabs()[0]; }
    var aliases = { oversikt: defaultTab, resultater: 'innsikt', detaljer: 'innsikt', rapport: 'innsikt' };
    function select(name, options) {
      options = options || {};
      name = aliases[name] || name || defaultTab;
      if (!availableTabs().some(function (tab) { return tab.dataset.fane === name; })) {
        name = fallback() && fallback().dataset.fane;
        options.updateHash = true;
      }
      tabs.forEach(function (tab) {
        var chosen = tab.dataset.fane === name;
        tab.setAttribute('aria-selected', String(chosen));
        tab.tabIndex = chosen ? 0 : -1;
        document.getElementById(tab.getAttribute('aria-controls')).hidden = !chosen;
        if (chosen && options.focus) tab.focus();
        if (chosen && list.scrollWidth > list.clientWidth) {
          var a = tab.getBoundingClientRect(), b = list.getBoundingClientRect();
          if (a.left < b.left) list.scrollLeft += a.left - b.left;
          if (a.right > b.right) list.scrollLeft += a.right - b.right;
        }
      });
      if (options.updateHash !== false) history.replaceState(null, '', '#' + name);
      document.dispatchEvent(new CustomEvent('frantz:campaign-tab', { detail: { name: name } }));
    }
    function followHash() {
      var name = location.hash.slice(1);
      var target = document.getElementById(name);
      if (target && target.tagName === 'DETAILS') target.open = true;
      var panel = target && target.closest('[role="tabpanel"]');
      select(panel ? panel.id.replace('panel-', '') : name, { updateHash: !target });
    }
    tabs.forEach(function (tab) { tab.addEventListener('click', function () { select(tab.dataset.fane); }); });
    list.addEventListener('keydown', function (event) {
      var visible = availableTabs();
      var current = visible.indexOf(event.target), next;
      if (current < 0) return;
      if (event.key === 'ArrowRight') next = (current + 1) % visible.length;
      if (event.key === 'ArrowLeft') next = (current - 1 + visible.length) % visible.length;
      if (event.key === 'Home') next = 0;
      if (event.key === 'End') next = visible.length - 1;
      if (next == null) return;
      event.preventDefault();
      select(visible[next].dataset.fane, { focus: true });
    });
    document.addEventListener('click', function (event) {
      var trigger = event.target.closest('[data-open-tab]');
      if (!trigger) return;
      event.preventDefault();
      select(trigger.dataset.openTab, { focus: true });
    });
    root.addEventListener('hashchange', followHash);
    function setAvailable(content) {
      tabs.forEach(function (tab) { tab.hidden = content[tab.dataset.fane] === false; });
      followHash();
    }
    navigation = Object.freeze({ select: select, setAvailable: setAvailable });
    followHash();
    return navigation;
  }
  root.FrantzCampaignSections = Object.freeze({ init: init });
})(window);
