/* Rendering shared by the portal overview and its read-only, aggregate report. */
(function (root) {
  'use strict';
  function escape(value) { return String(value == null ? '' : value).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
  function number(value) { return Number(value).toLocaleString('nb-NO').replace(/[\u00a0\u202f]/g, ' '); }
  function money(value) { return 'kr ' + number(value); }
  function metric(label, value, hint) { return '<div class="report-metric"><dt>' + escape(label) + '</dt><dd>' + escape(value) + '</dd>' + (hint ? '<small>' + escape(hint) + '</small>' : '') + '</div>'; }
  function overview(report, options) {
    options = options || {};
    var costs = options.costs !== false;
    var metrics = metric('Besøk på kampanjesiden', number(report.visits)) + metric('Trykket «Søk»', number(report.applications));
    if (costs) metrics += metric('Kostnad per «Søk»', money(report.cost));
    if (report.interest != null) metrics += metric('Meldte interesse', number(report.interest));
    var heading = report.active ? 'Resultater så langt' : 'Sluttresultater';
    var progress = Math.min(report.applications, report.goal);
    return '<section class="report-summary" aria-labelledby="result-summary-title"><div class="report-summary__heading"><h2 id="result-summary-title">' + heading + '</h2><p>Oppdatert ' + escape(report.updated) + '</p></div>' +
      '<dl class="report-metrics' + (!costs ? ' report-metrics--three' : '') + '">' + metrics + '</dl>' +
      '<p class="report-explanation">«Trykket Søk» er klikk videre til søknadsskjemaet. Det er ikke antall innsendte søknader. «Meldte interesse» telles separat.</p>' +
      '<div class="report-goal"><div class="report-goal__text"><span>' + number(report.applications) + ' av ' + number(report.goal) + ' planlagte klikk på «Søk»</span><b>' + (report.applications >= report.goal ? 'Målet er nådd' : (report.active ? (report.totalDays - report.day) + ' dager igjen' : 'Målet ble ikke nådd')) + '</b></div><progress value="' + progress + '" max="' + report.goal + '" aria-label="Klikk på Søk sammenlignet med kampanjemålet"></progress></div>' +
      '<div class="report-assessment"><div class="report-assessment__by"><span class="avatar avatar--sm" aria-hidden="true">MK</span><span>Martin Karlsen · Rådgiver i Frantz</span></div><p>' + escape(report.assessment) + '</p></div></section>' +
      '<section class="report-channel-section" aria-labelledby="report-channel-title"><h2 id="report-channel-title">Hva ga kanalene?</h2><table class="report-channel-table"><thead><tr><th scope="col">Kanal</th><th scope="col">Trykket «Søk»</th>' + (costs ? '<th scope="col">Kostnad per «Søk»</th>' : '') + '</tr></thead><tbody>' + report.channels.map(function (channel, index) { return '<tr><td><span class="kanal-prikk kanal-prikk--' + (index === 0 ? 'meta' : 'nettsteder') + '" aria-hidden="true"></span>' + escape(channel.name) + '</td><td>' + number(channel.applications) + '</td>' + (costs ? '<td>' + money(channel.cost) + '</td>' : '') + '</tr>'; }).join('') + '</tbody></table></section>' +
      (options.internal && report.interest != null ? '<div class="report-interest-link"><span>Følg opp de som har meldt interesse.</span><button type="button" class="link" data-open-tab="interessenter">Åpne interessenter (' + number(report.interest) + ')</button></div>' : '');
  }
  function empty(title, message, level) { var heading = level === 2 ? 'h2' : 'h1'; return '<section class="report-empty"><' + heading + '>' + escape(title) + '</' + heading + '><p>' + escape(message) + '</p></section>'; }
  root.FrantzReportView = Object.freeze({ escape: escape, number: number, money: money, overview: overview, empty: empty });
})(window);
