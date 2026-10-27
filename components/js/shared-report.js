/* Read-only aggregate report prototype. Never import portal/account/candidate data here. */
(function (root) {
  'use strict';
  var params = new URLSearchParams(location.search);
  var container = document.getElementById('shared-report-content');
  var View = root.FrantzReportView;
  var Sharing = root.FrantzReportSharing;
  var preview = params.get('forhandsvis') === '1';
  var signature = '';
  function disclosure(title, html, id) { return '<details class="approval-message campaign-disclosure"' + (id ? ' id="' + id + '"' : '') + '><summary>' + View.escape(title) + '</summary><div class="card card--les campaign-disclosure__body">' + html + '</div></details>'; }
  function fact(label, value) { return '<dl class="summary-row"><dt>' + View.escape(label) + '</dt><dd>' + View.escape(value) + '</dd></dl>'; }
  function render() {
    var link = preview ? null : Sharing.resolve(params.get('lenke'));
    var status = preview ? 'preview' : Sharing.state(link);
    var report = root.FZ_REPORTS[preview ? params.get('kampanje') : link && link.campaign];
    var costs = preview ? params.get('kostnader') === '1' : !!(link && link.costs);
    var nextSignature = JSON.stringify([status, report && report.id, costs]);
    if (nextSignature === signature) return;
    signature = nextSignature;
    if ((!preview && status !== 'active') || !report) {
      var expired = link && status === 'expired';
      container.innerHTML = View.empty(expired ? 'Rapportlenken har utløpt' : 'Rapporten er ikke tilgjengelig', 'Be den som delte rapporten om en ny lenke. I denne prototypen virker delte lenker bare i nettleseren der de ble opprettet.');
      document.title = 'Rapporten er ikke tilgjengelig — Frantz';
      return;
    }
    var dates = report.daily[0].map(function (_, index) { var date = new Date(report.start + 'T12:00:00'); date.setDate(date.getDate() + index); return String(date.getDate()).padStart(2, '0') + '.' + String(date.getMonth() + 1).padStart(2, '0'); });
    var dailyTable = '<details class="approval-message"><summary>Vis daglige tall som tabell</summary><div class="results__scroll"><table class="table table--inset"><thead><tr><th scope="col">Dato</th><th scope="col">Visninger</th><th scope="col">Trykket «Søk»</th></tr></thead><tbody>' + dates.map(function (date, index) { return '<tr><td data-label="Dato">' + date + '</td><td data-label="Visninger">' + View.number(report.daily[0][index]) + '</td><td data-label="Trykket Søk">' + View.number(report.daily[1][index]) + '</td></tr>'; }).join('') + '</tbody></table></div></details>';
    var details = disclosure('Dag for dag', '<p class="form-hint">' + (report.active ? 'Tallene viser utviklingen frem til siste oppdatering.' : 'Daglige tall for hele kampanjeperioden.') + '</p><div id="shared-daily-chart"></div>' + dailyTable, 'shared-daily') +
      disclosure('Visninger og lesing', '<div class="shared-report__facts">' + fact('Annonsevisninger', View.number(report.impressions)) + fact('Leste hele stillingsteksten', View.number(report.read)) + fact('Gjennomsnittlig lesetid', report.readTime) + '</div><p class="form-hint">Visninger teller hvor mange ganger annonsene ble vist. Det er ikke antall unike personer.</p>');
    if (report.ads) details += disclosure('Annonsene', '<div class="results__scroll"><table class="table table--inset"><thead><tr><th scope="col">Annonse</th><th scope="col">Klikk</th><th scope="col">Trykket «Søk»</th></tr></thead><tbody>' + report.ads.map(function (ad) { return '<tr><td data-label="Annonse">' + View.escape(ad.name) + '<br><span class="form-hint">' + View.escape(ad.channel) + ' · ' + View.escape(ad.type) + '</span></td><td data-label="Klikk">' + View.number(ad.clicks) + '</td><td data-label="Trykket Søk">' + View.number(ad.applications) + '</td></tr>'; }).join('') + '</tbody></table></div>');
    if (report.placements) details += disclosure('Nettsteder og aviser', '<div class="results__scroll"><table class="table table--inset"><thead><tr><th scope="col">Nettsted</th><th scope="col">Visninger</th><th scope="col">Klikk</th></tr></thead><tbody>' + report.placements.map(function (placement) { return '<tr><td data-label="Nettsted">' + View.escape(placement.name) + '</td><td data-label="Visninger">' + View.number(placement.impressions) + '</td><td data-label="Klikk">' + View.number(placement.clicks) + '</td></tr>'; }).join('') + '</tbody></table></div>');
    if (report.geography) details += disclosure('Hvor ble annonsene vist?', '<p class="form-hint">Samlede visninger fra kanalene, fordelt på fylke.</p><div class="results__scroll"><table class="table table--inset"><thead><tr><th scope="col">Fylke</th><th scope="col">Visninger</th><th scope="col">Klikk</th></tr></thead><tbody>' + report.geography.map(function (region) { return '<tr><td data-label="Fylke">' + View.escape(region.name) + '</td><td data-label="Visninger">' + View.number(region.impressions) + '</td><td data-label="Klikk">' + View.number(region.clicks) + '</td></tr>'; }).join('') + '</tbody></table></div>');
    container.innerHTML = '<header class="campaign-header"><div><p class="campaign-eyebrow">' + View.escape(report.employer) + '</p><div class="campaign-title"><h1 class="text-h2">' + View.escape(report.title) + '</h1><span class="badge ' + (report.active ? 'badge--active' : 'badge--ended') + '">' + (report.active ? 'Aktiv' : 'Avsluttet') + '</span></div><p class="form-hint campaign-meta">' + View.escape(report.period) + '</p></div><button type="button" class="btn btn--secondary" data-print-report><span class="icon-lucide icon-lucide--download" aria-hidden="true"></span>Last ned PDF</button></header>' +
      View.overview(report, { costs: costs }) +
      (costs ? '<section class="card card--les report-channel-section"><h2 class="card__title">Budsjett og forbruk</h2><div class="shared-report__facts">' + fact('Avtalt budsjett', View.money(report.budget)) + fact('Faktisk forbruk', report.spend == null ? 'Ikke oppgitt' : View.money(report.spend)) + '</div></section>' : '') +
      '<div class="shared-report__details">' + details + '</div><footer class="shared-report__footer"><span>' + (report.active ? 'Resultater så langt · samme lenke brukes når kampanjen er ferdig.' : 'Sluttrapport · oppdatert ' + View.escape(report.updated)) + '</span>' + (preview ? '<a class="link" href="kampanje-designreview.html">Tilbake til designforslagene</a>' : '') + '</footer>' +
      '<p class="form-hint shared-report__prototype">Eksempelrapport for designgjennomgang. Tallene er hentet fra prototypen og er ikke faktiske kampanjeresultater. Deling og deaktivering demonstreres lokalt.</p>';
    document.title = report.title + ' — Kampanjerapport — Frantz';
    root.tegnUkegraf(document.getElementById('shared-daily-chart'), { enhet: 'dag', uker: dates, serier: [
      { navn: 'Visninger', farge: 'var(--color-navy)', v: report.daily[0] },
      { navn: 'Trykket «Søk»', farge: 'var(--color-green)', v: report.daily[1] }
    ] });
    container.querySelector('[data-print-report]').addEventListener('click', function () {
      // Print every detail section, then restore the reader's previous expansion state.
      container.querySelectorAll('details').forEach(function (details) { details.dataset.wasOpen = String(details.open); details.open = true; });
      window.print();
    });
  }
  root.addEventListener('afterprint', function () { container.querySelectorAll('details[data-was-open]').forEach(function (details) { details.open = details.dataset.wasOpen === 'true'; delete details.dataset.wasOpen; }); });
  root.addEventListener('storage', function (event) { if (event.key === Sharing.key) render(); });
  root.addEventListener('focus', render);
  root.addEventListener('frantz:report-sharing-change', render);
  // Expiry is also reflected while the read-only report remains open.
  var expiryTimer = setInterval(render, 30000);
  root.addEventListener('pagehide', function () { clearInterval(expiryTimer); });
  render();
})(window);
