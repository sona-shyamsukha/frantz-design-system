/* Demo controls live here, outside the customer task. No emails or publishing are performed. */
(function () {
  'use strict';
  var bar, tools, requests = [];
  function link(label, href) { var a = document.createElement('a'); a.textContent = label; a.href = href; return a; }
  function showRequests(records) { requests = records; renderRequests(); }
  function renderRequests() {
    if (!tools) return;
    tools.querySelectorAll('[data-demo-email]').forEach(function (node) { node.remove(); });
    requests.filter(function (request) { return request.kind !== 'self'; }).filter(function (request, i, list) { return list.findIndex(function (item) { return item.round === request.round; }) === i; }).forEach(function (request) {
      var a = link('Test e-post: ' + (request.round === 'plan' ? 'plan' : 'annonser'), 'godkjenning-approval-b.html?request=' + encodeURIComponent(request.id) + '&email=1');
      a.dataset.demoEmail = ''; a.target = '_blank'; a.rel = 'noopener'; tools.append(a);
    });
  }
  function init() {
    bar = document.createElement('aside'); bar.className = 'approval-demo'; bar.setAttribute('aria-label', 'Demoverktøy');
    var label = document.createElement('b'); label.textContent = 'Variant B';
    var details = document.createElement('details'), summary = document.createElement('summary'); summary.textContent = 'Demoverktøy';
    tools = document.createElement('div'); tools.className = 'approval-demo__tools';
    var note = document.createElement('p'); note.textContent = 'Lokal prototype. Ingen e-post sendes. Lenker og svar virker bare i samme nettleser. Publisering simuleres. Eksempelkampanjer bruker demodato 30.09.2026.';
    tools.append(note, link('Sammenlign A og B', 'godkjenning-sammenligning.html'), link('Ny kampanje i B', 'ny-kampanje-approval-b.html?kladd=' + crypto.randomUUID()), link('Frantz har klargjort annonser', 'kampanje-under-arbeid-approval-b.html' + (new URLSearchParams(location.search).get('id') ? '?id=' + encodeURIComponent(new URLSearchParams(location.search).get('id')) : '')), link('Vis aktiv eksempelkampanje', 'campaign-approval-b.html'));
    details.append(summary, tools); bar.append(label, details);
    var main = document.querySelector('main, .main');
    (main || document.body).prepend(bar); renderRequests();
    document.querySelectorAll('a[href]').forEach(function (a) {
      var url = new URL(a.href);
      if (url.origin === location.origin && /\/(ny-kampanje|kampanje-bestilt|kampanje-under-arbeid|campaign|godkjenning)\.html$/.test(url.pathname)) { url.pathname = url.pathname.replace(/\.html$/, '-approval-b.html'); a.href = url.href; }
    });
  }
  window.FrantzApprovalDemo = { showRequests: showRequests };
  if (document.readyState !== 'complete') document.addEventListener('DOMContentLoaded', init); else init();
})();
