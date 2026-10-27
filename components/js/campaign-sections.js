/* One navigation behaviour for every campaign state; visuals reuse the shared filter tabs. */
(function (root) {
  'use strict';
  var navigation;
  function init() {
    if (navigation) return navigation;
    var list = document.querySelector('[data-campaign-sections] [role="tablist"]');
    if (!list) return null;
    var tabs = Array.from(list.querySelectorAll('[data-fane]'));
    var aliases = { detaljer: 'resultater', rapport: 'resultater' };
    function select(name, options) {
      options = options || {};
      name = aliases[name] || name;
      if (!tabs.some(function (tab) { return tab.dataset.fane === name; })) name = 'oversikt';
      tabs.forEach(function (tab) {
        var chosen = tab.dataset.fane === name;
        tab.setAttribute('aria-selected', String(chosen));
        tab.tabIndex = chosen ? 0 : -1;
        document.getElementById(tab.getAttribute('aria-controls')).hidden = !chosen;
        if (chosen && options.focus) tab.focus();
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
      var current = tabs.indexOf(event.target), next;
      if (current < 0) return;
      if (event.key === 'ArrowRight') next = (current + 1) % tabs.length;
      if (event.key === 'ArrowLeft') next = (current - 1 + tabs.length) % tabs.length;
      if (event.key === 'Home') next = 0;
      if (event.key === 'End') next = tabs.length - 1;
      if (next == null) return;
      event.preventDefault();
      select(tabs[next].dataset.fane, { focus: true });
    });
    document.addEventListener('click', function (event) {
      var trigger = event.target.closest('[data-open-tab]');
      if (!trigger) return;
      event.preventDefault();
      select(trigger.dataset.openTab, { focus: true });
    });
    root.addEventListener('hashchange', followHash);
    navigation = Object.freeze({ select: select });
    followHash();
    return navigation;
  }
  root.FrantzCampaignSections = Object.freeze({ init: init });
})(window);
