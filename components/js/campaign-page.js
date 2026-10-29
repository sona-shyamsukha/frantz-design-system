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
      link.title = 'Åpner en e-post til Frantz';
      button.replaceWith(link);
    });
  }
  bindContacts();
  var sections = null;
  if (page === 'ordered') {
    sections = root.FrantzCampaignSections.init({ defaultTab: 'kampanje' });
    root.FrantzCampaignDetails.init({ id: params.get('id') || '129074' });
    return;
  }
  if (page === 'production') {
    var approve = document.getElementById('approve-campaign-material');
    var actions = approve.closest('[data-campaign-approval-actions]');
    var creativeCard = document.getElementById('creative-heading').closest('.card');
    var stage = params.get('fase') || 'godkjenning';
    // The approval note names the campaign's real start date.
    var approvalNote = document.getElementById('approval-note');
    var productionCampaign = root.FZ_KAMPANJER.finn(params.get('id') || '129072');
    if (approvalNote) approvalNote.textContent = productionCampaign && productionCampaign.fra
      ? 'Når dere godkjenner, publiserer Frantz annonsene fra ' + root.FZ_KAMPANJER.dato(productionCampaign.fra) + '. Vil dere endre noe, trykk «Be om endring».'
      : 'Når dere godkjenner, publiserer Frantz annonsene fra planlagt startdato. Vil dere endre noe, trykk «Be om endring».';
    var statuses = {
      produksjon: { badge: 'Frantz lager annonsene', owner: 'Frantz', title: 'Vi klargjør annonser og målretting', description: 'Dere får en e-post når utkastene er klare. Det er ingenting dere trenger å godkjenne ennå.' },
      godkjenning: { badge: 'Venter på deres godkjenning', owner: 'Dere', title: 'Se gjennom annonsene', description: 'Godkjenn de tre utkastene innen 02.10, slik at Frantz kan gjøre klart til planlagt start 05.10.' },
      publisering: { badge: 'Klar til publisering', owner: 'Frantz', title: 'Annonsene er godkjent', description: 'Frantz følger opp publisering. Planlagt start er 05.10. Dere får beskjed når kampanjen er aktiv.' }
    };
    function renderStage(nextStage) {
      stage = statuses[nextStage] ? nextStage : 'godkjenning';
      var state = statuses[stage];
      document.getElementById('campaign-stage').textContent = 'Under arbeid';
      document.getElementById('production-title').textContent = state.title;
      document.getElementById('production-description').textContent = state.description;
      document.getElementById('production-empty').hidden = stage !== 'produksjon';
      document.getElementById('production-ad-link').hidden = stage === 'produksjon';
      actions.hidden = stage !== 'godkjenning';
      creativeCard.hidden = stage === 'produksjon';
      document.getElementById('material-customer-status').hidden = stage !== 'publisering';
      if (approvalNote) approvalNote.hidden = stage !== 'godkjenning';
      var approvalStep = document.querySelector('.checklist li:last-child');
      if (approvalStep) {
        var done = stage === 'publisering';
        approvalStep.classList.toggle('er-ok', done); approvalStep.classList.toggle('mangler', !done);
        approvalStep.querySelector('b').textContent = done ? 'Annonsene er godkjent' : 'Dere godkjenner annonsene';
        approvalStep.querySelector('.sr-only').textContent = done ? 'Fullført: ' : 'Gjenstår: ';
        approvalStep.querySelector('.icon-lucide').className = 'icon-lucide icon-lucide--' + (done ? 'circle-check' : 'clock');
        if (done) approvalStep.querySelector('small').textContent = 'Frantz følger opp publisering.';
      }
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
      try { root.FrantzCampaignActivity.append(params.get('id') || '129072', { key: 'material-approved:current', kind: 'material-approved', title: 'Annonsene er godkjent', body: 'Godkjent i portalen. Frantz følger opp publisering.' }); } catch (error) { document.getElementById('material-customer-status').textContent = 'Annonsene er godkjent i denne visningen, men historikken kunne ikke lagres.'; }
      sections.select('kampanje');
      var title = document.getElementById('production-title'); title.tabIndex = -1; title.focus({ preventScroll: true });
      document.getElementById('production-status').scrollIntoView({ block: 'start' });
    });
    if (!params.has('fase')) { try { if (sessionStorage.getItem('fzCampaignMaterialApproved129072') === 'yes') stage = 'publisering'; } catch (error) {} }
    if (!params.has('fase') && root.FrantzCampaignActivity.read(params.get('id') || '129072').some(function (event) { return event.kind === 'material-approved'; })) stage = 'publisering';
    renderStage(stage);
    sections = root.FrantzCampaignSections.init({ defaultTab: stage === 'godkjenning' ? 'annonser' : 'kampanje' });
    root.FrantzCampaignDetails.init({ id: params.get('id') || '129072' });
    return;
  }
  if (page !== 'results') return;
  var View = root.FrantzReportView;
  var script = document.querySelector('script[data-default-campaign]');
  var id = params.get('id') || script.dataset.defaultCampaign;
  var report = root.FZ_REPORTS[id];
  var hasReport = !!report;
  var knownCampaign = root.FZ_KAMPANJER.finn(id);
  if (!report && knownCampaign && ['Bestilt', 'Under arbeid'].includes(knownCampaign.status)) { location.replace(knownCampaign.side); return; }
  if (!report && knownCampaign) report = {
    id: id, title: knownCampaign.tittel, employer: knownCampaign.arbeidsgiver,
    period: knownCampaign.periode, active: knownCampaign.status === 'Aktiv',
    day: knownCampaign.dag, totalDays: knownCampaign.lengde, budget: knownCampaign.budsjett
  };
  if (!report) {
    document.querySelector('.campaign-header').innerHTML = '<h1 class="text-h2">Fant ikke kampanjen</h1>';
    document.querySelector('.campaign-layout').innerHTML = View.empty('Kampanjen er ikke tilgjengelig', 'Gå tilbake til kampanjene og velg en kampanje.', 2) + '<a class="link" href="campaigns.html">Tilbake til kampanjene</a>';
    document.querySelector('.breadcrumb__item:last-child').textContent = 'Fant ikke kampanjen';
    return;
  }
  // An ID from a different report type must never display the current template's figures.
  var expected = report.active ? 'campaign.html' : 'rapport.html';
  if (location.pathname.split('/').pop() !== expected) { location.replace(expected + '?id=' + encodeURIComponent(id)); return; }
  var header = document.querySelector('.campaign-header');
  header.innerHTML = View.header(report);
  header.querySelector('.campaign-eyebrow').remove();
  header.querySelector('.campaign-meta').remove();
  document.title = report.title + ' — Frantz kampanjeportal';
  document.querySelector('.breadcrumb__item:last-child').innerHTML = '<span aria-current="page">' + View.escape(report.title) + '</span>';
  var campaign = root.FZ_KAMPANJER.finn(id);
  if (!report.daily) {
    document.getElementById('panel-innsikt').innerHTML = '<div id="campaign-overview" class="flow"></div>';
    document.querySelector('[data-current-ads]').innerHTML = View.empty('Annonser', 'Annonsemateriell er ikke tilgjengelig for denne kampanjen.', 2);
    var history = document.querySelector('[data-campaign-history]');
    history.querySelectorAll('.journey, .journey__by').forEach(function (node) { node.remove(); });
  }
  if (!report.interest) {
    document.getElementById('panel-interessenter').innerHTML = View.empty('Ingen registrerte interessenter', 'Det er ikke registrert noen interessenter for denne kampanjen.', 2);
    document.getElementById('fane-interessenter').textContent = 'Interessenter';
  }
  document.getElementById('campaign-overview').innerHTML = hasReport ? View.overview(report, { internal: true, costs: true }) : View.empty('Innsikt er ikke tilgjengelig ennå', 'De lagrede stillingsopplysningene, bestillingen og kampanjeforløpet er tilgjengelige i de andre fanene.', 2);
  sections = root.FrantzCampaignSections.init({ defaultTab: 'innsikt' });
  root.FrantzCampaignDetails.init({ id: id, report: report });
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
