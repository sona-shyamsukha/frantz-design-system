/* Read-only aggregate report prototype. Never import portal/account/candidate data here. */
(function (root) {
  'use strict';
  var params = new URLSearchParams(location.search);
  var container = document.getElementById('shared-report-content');
  var View = root.FrantzReportView;
  var Sharing = root.FrantzReportSharing;
  var preview = params.get('forhandsvis') === '1';
  var signature = '';
  function reportSection(title, html, id) { return '<section class="card card--betjen shared-report__section"' + (id ? ' id="' + id + '"' : '') + '><div class="card__head"><h2 class="card__title">' + View.escape(title) + '</h2></div><div class="shared-report__section-body">' + html + '</div></section>'; }
  function fact(label, value) { return '<dl class="summary-row"><dt>' + View.escape(label) + '</dt><dd>' + View.escape(value) + '</dd></dl>'; }
  function render() {
    var link = preview ? null : Sharing.resolve(params.get('lenke'));
    var status = preview ? 'preview' : Sharing.state(link);
    var report = root.FZ_REPORTS[preview ? params.get('kampanje') : link && link.campaign];
    var costs = preview ? params.get('kostnader') === '1' : !!(link && link.costs);
    var nextSignature = JSON.stringify([status, report && report.id, costs]);
    if (nextSignature === signature) return;
    signature = nextSignature;
    if (!preview && status === 'active' && !report) {
      container.innerHTML = View.empty('Rapporten kommer når kampanjen er aktiv', 'Denne lenken viser resultatene når annonseringen har startet.');
      document.title = 'Kampanjerapport — Frantz';
      return;
    }
    if ((!preview && status !== 'active') || !report) {
      var expired = link && status === 'expired';
      container.innerHTML = View.empty(expired ? 'Rapportlenken har utløpt' : 'Rapporten er ikke tilgjengelig', 'Be den som delte rapporten om en ny lenke.');
      document.title = 'Rapporten er ikke tilgjengelig — Frantz';
      return;
    }
    var dates = report.daily ? report.daily[0].map(function (_, index) { var date = new Date(report.start + 'T12:00:00'); date.setDate(date.getDate() + index); return String(date.getDate()).padStart(2, '0') + '.' + String(date.getMonth() + 1).padStart(2, '0'); }) : [];
    var dailyTable = '<h3 class="shared-report__table-heading">Daglige tall</h3><div class="results__scroll"><table class="table table--inset"><thead><tr><th scope="col">Dato</th><th scope="col">Visninger</th><th scope="col">Trykket «Søk»</th></tr></thead><tbody>' + dates.map(function (date, index) { return '<tr><td data-label="Dato">' + date + '</td><td data-label="Visninger">' + View.number(report.daily[0][index]) + '</td><td data-label="Trykket Søk">' + View.number(report.daily[1][index]) + '</td></tr>'; }).join('') + '</tbody></table></div>';
    var sections = report.daily ? reportSection('Dag for dag', '<p class="form-hint">' + (report.active ? 'Tallene viser utviklingen frem til siste oppdatering.' : 'Daglige tall for hele kampanjeperioden.') + '</p><div id="shared-daily-chart"></div>' + dailyTable, 'shared-daily') +
      reportSection('Visninger og lesing', '<div class="shared-report__facts">' + fact('Annonsevisninger', View.number(report.impressions)) + fact('Leste hele stillingsteksten', View.number(report.read)) + fact('Gjennomsnittlig lesetid', report.readTime) + '</div><p class="form-hint">Visninger teller hvor mange ganger annonsene ble vist. Det er ikke antall unike personer.</p>') : '';
    if (report.ads) sections += reportSection('Annonsene', '<div class="results__scroll"><table class="table table--inset"><thead><tr><th scope="col">Annonse</th><th scope="col">Klikk</th><th scope="col">Trykket «Søk»</th></tr></thead><tbody>' + report.ads.map(function (ad) { return '<tr><td data-label="Annonse">' + View.escape(ad.name) + '<br><span class="form-hint">' + View.escape(ad.channel) + ' · ' + View.escape(ad.type) + '</span></td><td data-label="Klikk">' + View.number(ad.clicks) + '</td><td data-label="Trykket Søk">' + View.number(ad.applications) + '</td></tr>'; }).join('') + '</tbody></table></div>');
    if (report.placements) sections += reportSection('Nettsteder og aviser', '<div class="results__scroll"><table class="table table--inset"><thead><tr><th scope="col">Nettsted</th><th scope="col">Visninger</th><th scope="col">Klikk</th></tr></thead><tbody>' + report.placements.map(function (placement) { return '<tr><td data-label="Nettsted">' + View.escape(placement.name) + '</td><td data-label="Visninger">' + View.number(placement.impressions) + '</td><td data-label="Klikk">' + View.number(placement.clicks) + '</td></tr>'; }).join('') + '</tbody></table></div>');
    if (report.geography) sections += reportSection('Hvor ble annonsene vist?', '<p class="form-hint">Samlede visninger fra kanalene, fordelt på fylke.</p><div class="results__scroll"><table class="table table--inset"><thead><tr><th scope="col">Fylke</th><th scope="col">Visninger</th><th scope="col">Klikk</th></tr></thead><tbody>' + report.geography.map(function (region) { return '<tr><td data-label="Fylke">' + View.escape(region.name) + '</td><td data-label="Visninger">' + View.number(region.impressions) + '</td><td data-label="Klikk">' + View.number(region.clicks) + '</td></tr>'; }).join('') + '</tbody></table></div>');
    container.innerHTML = '<header class="campaign-header">' + View.header(report, '<button type="button" class="btn btn--secondary" data-print-report><span class="icon-lucide icon-lucide--download" aria-hidden="true"></span>Last ned PDF</button>') + '</header>' +
      View.overview(report, { costs: costs }) +
      (costs ? '<section class="card card--les report-channel-section"><h2 class="card__title">Budsjett og forbruk</h2><div class="shared-report__facts">' + fact('Avtalt budsjett', View.money(report.budget)) + fact('Faktisk forbruk', report.spend == null ? 'Ikke oppgitt' : View.money(report.spend)) + '</div></section>' : '') +
      '<div class="shared-report__details">' + sections + '</div><footer class="shared-report__footer"><span>' + (report.active ? 'Resultater så langt · rapporten oppdateres mens kampanjen går.' : 'Sluttrapport' + (report.updated ? ' · oppdatert ' + View.escape(report.updated) : '')) + '</span></footer>';
    document.title = report.title + ' — Kampanjerapport — Frantz';
    if (report.daily) root.tegnUkegraf(document.getElementById('shared-daily-chart'), { enhet: 'dag', uker: dates, serier: [
      { navn: 'Visninger', farge: 'var(--color-navy)', v: report.daily[0] },
      { navn: 'Trykket «Søk»', farge: 'var(--color-green)', v: report.daily[1] }
    ] });
    container.querySelector('[data-print-report]').addEventListener('click', function () {
      window.print();
    });
  }
  root.addEventListener('storage', function (event) { if (event.key === Sharing.key) render(); });
  root.addEventListener('focus', render);
  root.addEventListener('frantz:report-sharing-change', render);
  // Expiry is also reflected while the read-only report remains open.
  var expiryTimer = setInterval(render, 30000);
  root.addEventListener('pagehide', function () { clearInterval(expiryTimer); });
  render();
})(window);
