/* Campaign page behaviour. All workflow changes here remain local design demonstrations. */
(function (root) {
  'use strict';
  var page = document.body.dataset.campaignPage;
  var params = new URLSearchParams(location.search);
  document.querySelectorAll('[data-open-details]').forEach(function (link) {
    link.addEventListener('click', function () { var details = document.getElementById(link.dataset.openDetails); if (details) details.open = true; });
  });
  function contactUrl(changes, message) {
    var id = document.body.dataset.campaignId || params.get('id') || (page === 'ordered' ? '129074' : page === 'production' ? '129072' : '');
    var title = document.querySelector('h1').textContent.trim();
    return 'mailto:post@frantz.no?subject=' + encodeURIComponent('[Kampanje #' + id + '] ' + title) + '&body=' + encodeURIComponent(message || ('Hei,\n\n' + (changes ? 'Jeg ønsker disse endringene i annonsene:\n\n' : 'Jeg har et spørsmål om kampanjen:\n\n')));
  }
  function bindContacts() {
    document.querySelectorAll('[data-contact-adviser], a[href="epost-visning.html"]').forEach(function (button) {
      var link = document.createElement('a');
      link.className = button.className;
      if (button.id) link.id = button.id;
      link.dataset.contactAdviser = '';
      link.dataset.kind = button.dataset.kind || '';
      function refreshContact() { link.href = contactUrl(link.dataset.kind === 'endring'); }
      link.addEventListener('click', refreshContact);
      document.addEventListener('frantz:campaign-loaded', refreshContact);
      link.innerHTML = button.innerHTML;
      link.href = contactUrl(button.dataset.kind === 'endring');
      link.title = 'Åpner e-posten din til Frantz';
      button.replaceWith(link);
    });
  }
  bindContacts();
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
    var comment = document.querySelector('.kommentar');
    if (comment) {
      comment.removeAttribute('onsubmit');
      comment.addEventListener('submit', function (event) {
        event.preventDefault();
        var message = comment.querySelector('textarea').value.trim();
        if (!message) { comment.querySelector('textarea').focus(); return; }
        location.href = contactUrl(true, 'Hei,\n\n' + message);
        comment.querySelector('[data-sendt]').textContent = 'E-postutkastet er åpnet. Send meldingen fra e-posten din.';
        comment.querySelector('[data-sendt]').hidden = false;
      });
    }
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
      document.getElementById('campaign-stage').textContent = 'Under arbeid';
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
    document.querySelector('.campaign-header').innerHTML = '<h1 class="text-h2">Fant ikke kampanjen</h1>';
    document.querySelector('.campaign-layout').innerHTML = View.empty('Kampanjen er ikke tilgjengelig', 'Gå tilbake til kampanjene og velg en kampanje.', 2) + '<a class="link" href="campaigns.html">Tilbake til kampanjene</a>';
    document.querySelector('.breadcrumb__item:last-child').textContent = 'Fant ikke kampanjen';
    document.querySelector('#report-sharing').remove();
    return;
  }
  // An ID from a different report type must never display the current template's figures.
  var expected = report.active ? 'campaign.html' : 'rapport.html';
  if (location.pathname.split('/').pop() !== expected) { location.replace(expected + '?id=' + encodeURIComponent(id)); return; }
  var share = document.querySelector('[data-report-share]');
  var header = document.querySelector('.campaign-header');
  var reportActions = share.outerHTML;
  if (!report.active) reportActions = '<div class="btn-row"><a class="btn btn--secondary" href="' + View.escape(root.FrantzReportSharing.previewUrl(report.id, true)) + '" target="_blank" rel="noopener">Åpne rapport <span class="sr-only">(ny fane)</span></a>' + reportActions + '</div>';
  header.innerHTML = View.header(report, reportActions);
  document.title = report.title + ' — Frantz kampanjeportal';
  document.querySelector('.breadcrumb__item:last-child').innerHTML = '<span aria-current="page">' + View.escape(report.title) + '</span>';
  var campaign = root.FZ_KAMPANJER.finn(id);
  var facts = View.fact('Kampanjenummer', '#' + id) + View.fact('Periode', report.period);
  if (campaign && campaign.kanaler) facts += View.fact('Kanaler', campaign.kanaler.join(', '));
  if (report.goal) facts += View.fact('Mål', View.number(report.goal) + ' klikk på «Søk»');
  facts += View.fact('Rådgiver', 'Martin Karlsen');
  var budget = View.fact('Avtalt budsjett', View.money(report.budget)) + View.fact('Faktisk forbruk', report.spend == null ? 'Ikke oppgitt' : View.money(report.spend));
  var tracking = campaign && campaign.connect ? '<div class="summary-panel__block piksel" data-piksel="' + View.escape(id) + '" data-connect="' + View.escape(campaign.connect) + '" data-status="' + (report.active ? 'aktiv' : 'avsluttet') + '" data-tid="' + View.escape(report.active ? report.updated : (campaign && campaign.til ? root.FZ_KAMPANJER.dato(campaign.til) : report.period.split(' – ').pop())) + '"></div>' : '';
  document.querySelector('.campaign-rail').innerHTML = '<section class="summary-panel campaign-brief"><div class="summary-panel__head"><h2>Om kampanjen</h2></div><div class="summary-panel__block">' + facts + '</div></section>' + View.disclosure('Budsjett og kostnader', budget) + View.disclosure('Kampanjeside og sporing', '<a class="link" href="https://frantz.no/k/' + encodeURIComponent(id) + '" target="_blank" rel="noopener">Åpne kampanjesiden <span class="sr-only">(ny fane)</span></a>' + tracking) + '<a class="btn btn--secondary" href="' + View.escape(contactUrl(false)) + '">Kontakt rådgiver</a><p class="form-hint">Martin Karlsen · Frantz<br>post@frantz.no<br>Åpner e-posten din. Du kan legge ved filer i e-posten.</p>';
  if (root.FrantzPiksel) root.FrantzPiksel.render();
  if (!report.active) document.querySelector('[data-fane="oversikt"]').textContent = 'Rapport';
  if (!report.daily) {
    // Never inherit Bodø's breakdown or personal contacts for another campaign.
    ['detaljer', 'interessenter'].forEach(function (name) {
      document.getElementById('panel-' + name).innerHTML = '';
      document.querySelector('[data-fane="' + name + '"]').remove();
    });
    document.querySelector('.sidefaner').hidden = true;
  }
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
  document.querySelector('.sidefaner').addEventListener('keydown', function (event) {
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
  if (!table) return;
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
