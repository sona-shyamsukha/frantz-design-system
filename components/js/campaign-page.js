/* Campaign page behaviour. All workflow changes here remain local design demonstrations. */
(function (root) {
  'use strict';
  var page = document.body.dataset.campaignPage;
  var params = new URLSearchParams(location.search);
  document.querySelectorAll('[data-open-details]').forEach(function (link) {
    link.addEventListener('click', function () { var details = document.getElementById(link.dataset.openDetails); if (details) details.open = true; });
  });
  document.querySelectorAll('[data-contact-adviser]').forEach(function (button) {
    button.removeAttribute('onclick');
    button.addEventListener('click', function () { if (root.FrantzAssist) root.FrantzAssist.open(); });
  });
  if (page === 'ordered') {
    // An order that cannot be found must remain an error, with no conflicting next step.
    var cols = document.querySelector('.cols');
    var alert = document.getElementById('status-alert');
    var checkOrder = function () { if (cols.hidden || (alert && !alert.hidden)) { if (cols.hidden) alert.hidden = false; } };
    if (cols) new MutationObserver(checkOrder).observe(cols, { attributes: true, attributeFilter: ['hidden'] });
    checkOrder();
    return;
  }
  if (page === 'production') {
    var approve = document.getElementById('approve-campaign-material');
    var actions = approve.closest('.handlinger');
    var creativeCard = document.getElementById('creative-heading').closest('.card');
    var stage = params.get('fase') || 'godkjenning';
    var statuses = {
      produksjon: { badge: 'Frantz lager annonsene', owner: 'Frantz', title: 'Vi klargjør annonser og målretting', description: 'Du får en e-post når utkastene er klare. Det er ingenting du trenger å godkjenne ennå.' },
      godkjenning: { badge: 'Venter på din godkjenning', owner: 'Deg', title: 'Se gjennom annonsene', description: 'Godkjenn de tre utkastene innen 02.10, slik at Frantz kan gjøre klart til planlagt start 05.10.' },
      publisering: { badge: 'Klar til publisering', owner: 'Frantz', title: 'Annonsene er godkjent', description: 'Frantz følger opp publisering. Planlagt start er 05.10. Du får beskjed når kampanjen er aktiv.' }
    };
    function renderStage(nextStage) {
      stage = statuses[nextStage] ? nextStage : 'godkjenning';
      var state = statuses[stage];
      document.getElementById('campaign-stage').textContent = state.badge;
      document.getElementById('production-title').textContent = state.title;
      document.getElementById('production-description').textContent = state.description;
      document.querySelector('.campaign-next .campaign-eyebrow').textContent = 'Neste steg · ' + state.owner;
      actions.hidden = stage !== 'godkjenning';
      creativeCard.hidden = stage === 'produksjon';
      document.getElementById('material-customer-status').hidden = stage !== 'publisering';
      var panel = document.getElementById('del-panel');
      if (stage !== 'godkjenning') panel.hidden = true;
      if (stage === 'publisering') {
        document.getElementById('creative-heading').textContent = 'Godkjente annonser';
        creativeCard.querySelectorAll('.tag--overlay').forEach(function (tag) { tag.textContent = tag.textContent.replace('utkast', 'godkjent'); });
        creativeCard.querySelectorAll('a[href*="annonse.html"]').forEach(function (link) { var url = new URL(link.href); url.searchParams.delete('utkast'); link.href = url.href; });
      }
    }
    approve.addEventListener('click', function () {
      if (approve.disabled) return;
      document.getElementById('material-customer-status').hidden = false;
      approve.disabled = true;
      try { sessionStorage.setItem('fzCampaignMaterialApproved129072', 'yes'); } catch (error) { /* The visible handoff still works without browser storage. */ }
      renderStage('publisering');
      var title = document.getElementById('production-title'); title.tabIndex = -1; title.focus({ preventScroll: true });
      document.getElementById('production-status').scrollIntoView({ block: 'start' });
    });
    if (!params.has('fase')) { try { if (sessionStorage.getItem('fzCampaignMaterialApproved129072') === 'yes') stage = 'publisering'; } catch (error) {} }
    renderStage(stage);
    return;
  }
  if (page !== 'results') return;
  var View = root.FrantzReportView;
  var script = document.querySelector('script[data-default-campaign]');
  var id = params.get('id') || script.dataset.defaultCampaign;
  var report = root.FZ_REPORTS[id];
  if (!report) {
    var campaign = root.FZ_KAMPANJER.finn(id);
    var title = campaign ? campaign.tittel : 'Fant ikke kampanjen';
    document.querySelector('.campaign-header').innerHTML = '<div><p class="campaign-eyebrow">' + View.escape(campaign ? campaign.arbeidsgiver : '') + '</p><h1>' + View.escape(title) + '</h1></div>';
    document.querySelector('.campaign-layout').innerHTML = View.empty(campaign ? 'Rapporttall er ikke lagt inn for denne eksempelkampanjen' : 'Ukjent kampanje', campaign ? 'Denne prototypen har komplette eksempelrapporter for Sykepleier Oslo og Sykepleier Bodø. Hver kampanje har sin egen adresse; vi viser ikke tall fra en annen kampanje.' : 'Gå tilbake til kampanjene og velg en kampanje.', 2) + '<a class="link" href="campaigns.html">Tilbake til kampanjene</a>';
    document.querySelector('.breadcrumb__item:last-child').innerHTML = '<span aria-current="page">' + View.escape(title) + '</span>';
    document.title = title + ' — Frantz kampanjeportal';
    return;
  }
  // An ID from a different report type must never display the current template's figures.
  var expected = report.active ? 'campaign.html' : 'rapport.html';
  if (location.pathname.split('/').pop() !== expected) { location.replace(expected + '?id=' + encodeURIComponent(id)); return; }
  document.getElementById('campaign-overview').innerHTML = View.overview(report, { internal: true, costs: true });
  root.FrantzReportSharing.attach(document.querySelector('[data-report-share]'), report);
  var tabs = Array.from(document.querySelectorAll('[data-fane]'));
  function showTab(name, focus) {
    if (!tabs.some(function (tab) { return tab.dataset.fane === name; })) name = 'oversikt';
    tabs.forEach(function (tab) {
      var selected = tab.dataset.fane === name;
      tab.setAttribute('aria-selected', String(selected)); tab.tabIndex = selected ? 0 : -1;
      document.getElementById(tab.getAttribute('aria-controls')).hidden = !selected;
      if (selected && focus) tab.focus();
    });
    history.replaceState(null, '', '#' + name);
  }
  tabs.forEach(function (tab) { tab.addEventListener('click', function () { showTab(tab.dataset.fane); }); });
  document.querySelector('.campaign-tabs').addEventListener('keydown', function (event) {
    var current = tabs.indexOf(event.target), index;
    if (current < 0) return;
    if (event.key === 'ArrowRight') index = (current + 1) % tabs.length;
    if (event.key === 'ArrowLeft') index = (current - 1 + tabs.length) % tabs.length;
    if (event.key === 'Home') index = 0;
    if (event.key === 'End') index = tabs.length - 1;
    if (index == null) return;
    event.preventDefault(); tabs[index].click(); tabs[index].focus();
  });
  document.querySelectorAll('[data-open-tab]').forEach(function (button) { button.addEventListener('click', function () { showTab(button.dataset.openTab, true); }); });
  root.addEventListener('hashchange', function () { showTab(location.hash.slice(1)); });
  showTab(location.hash.slice(1) || 'oversikt');
  // Follow-up state is scoped to a campaign and kept across page reloads in this local demo.
  var key = 'fzCampaignInterestReview-' + id;
  var table = document.querySelector('.prospekt');
  var handled = {};
  try { handled = JSON.parse(localStorage.getItem(key) || '{}'); } catch (error) {}
  var count = document.querySelector('[data-handtert]') || document.querySelector('.prospekt-teller > :last-child');
  function updateInterests() {
    table.querySelectorAll('input[role="switch"]').forEach(function (input) {
      var name = input.getAttribute('aria-label');
      if (Object.prototype.hasOwnProperty.call(handled, name)) input.checked = handled[name];
      input.closest('tr').classList.toggle('er-handtert', input.checked);
    });
    var loaded = new Set();
    var checked = 0;
    table.querySelectorAll('input[role="switch"]').forEach(function (input) { var name = input.getAttribute('aria-label'); loaded.add(name); if (input.checked) checked++; });
    Object.keys(handled).forEach(function (name) { if (!loaded.has(name) && handled[name]) checked++; });
    if (count) count.textContent = checked + ' av ' + report.interest + ' håndtert';
  }
  table.addEventListener('change', function (event) {
    if (!event.target.matches('input[role="switch"]')) return;
    handled[event.target.getAttribute('aria-label')] = event.target.checked;
    try { localStorage.setItem(key, JSON.stringify(handled)); } catch (error) {}
    updateInterests();
  });
  var body = table.querySelector('tbody');
  if (body) new MutationObserver(updateInterests).observe(body, { childList: true });
  updateInterests();
})(window);
