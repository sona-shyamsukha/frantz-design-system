/* Rendering shared by the portal overview and its read-only, aggregate report. */
(function (root) {
  'use strict';
  function escape(value) { return String(value == null ? '' : value).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
  function number(value) { return Number(value).toLocaleString('nb-NO').replace(/[\u00a0\u202f]/g, ' '); }
  function money(value) { return 'kr ' + number(value); }
  function metric(label, value, icon) {
    return '<div class="metric"><span class="metric__icon"><span class="icon-lucide icon-lucide--' + icon + '" aria-hidden="true"></span></span>' +
      '<div class="metric__value">' + escape(value) + '</div><div class="metric__label">' + escape(label) + '</div></div>';
  }
  function overview(report, options) {
    options = options || {};
    var costs = options.costs !== false;
    var metrics = metric('Besøk på kampanjesiden', number(report.visits), 'eye') + metric('Trykket «Søk»', number(report.applications), 'target');
    if (costs) metrics += metric('Kostnad per «Søk»', money(report.cost), 'wallet');
    if (report.interest != null) metrics += metric('Meldte interesse', number(report.interest), 'users');
    var heading = report.active ? 'Resultater så langt' : 'Sluttresultater';
    var progress = Math.min(report.applications, report.goal);
    return '<section class="card card--betjen report-summary" aria-labelledby="result-summary-title"><div class="card__head"><div><h2 class="card__title" id="result-summary-title">' + heading + '</h2><p class="form-hint">Oppdatert ' + escape(report.updated) + '</p></div></div>' +
      '<div class="metrics' + (costs ? ' metrics--fire' : '') + '">' + metrics + '</div>' +
      '<p class="form-hint mt-4">«Trykket Søk» er klikk videre til søknadsskjemaet. Det er ikke antall innsendte søknader. «Meldte interesse» telles separat.</p>' +
      '<div class="report-goal mt-6"><div class="flex-between flex-wrap gap-2 text-sm"><span>' + number(report.applications) + ' av ' + number(report.goal) + ' planlagte klikk på «Søk»</span><b>' + (report.applications >= report.goal ? 'Målet er nådd' : (report.active ? (report.totalDays - report.day) + ' dager igjen' : 'Målet ble ikke nådd')) + '</b></div>' +
      '<div class="meter meter--sm mt-4" role="progressbar" aria-valuemin="0" aria-valuenow="' + progress + '" aria-valuemax="' + report.goal + '" aria-label="Klikk på Søk sammenlignet med kampanjemålet"><div class="meter__track"><span class="meter__bar" style="width:' + Math.round(progress / report.goal * 100) + '%"></span></div></div></div>' +
      '<blockquote class="quote mt-6"><p>' + escape(report.assessment) + '</p><footer><span class="avatar avatar--sm avatar--data" aria-hidden="true">MK</span>Martin Karlsen · Rådgiver i Frantz</footer></blockquote></section>' +
      '<section class="card card--betjen report-channel-section" aria-labelledby="report-channel-title"><div class="card__head"><h2 class="card__title" id="report-channel-title">Hva ga kanalene?</h2></div><div class="metrics metrics--channel">' + report.channels.map(function (channel, index) {
        return '<div class="metric"><div class="metric__channel"><span class="kanal-prikk kanal-prikk--' + (index === 0 ? 'meta' : 'nettsteder') + '" aria-hidden="true"></span>' + escape(channel.name) + '</div>' +
          '<div class="metric__value">' + (costs ? money(channel.cost) : number(channel.applications)) + '</div><div class="metric__label">' + (costs ? 'per «Søk»' : 'Trykket «Søk»') + '</div>' +
          (costs ? '<div class="metric__foot">' + number(channel.applications) + ' klikk på «Søk»</div>' : '') + '</div>';
      }).join('') + '</div></section>' +
      (options.internal && report.interest != null ? '<div class="report-interest-link"><span>Følg opp de som har meldt interesse.</span><button type="button" class="link" data-open-tab="interessenter">Åpne interessenter (' + number(report.interest) + ')</button></div>' : '');
  }
  function empty(title, message, level) { var heading = level === 2 ? 'h2' : 'h1'; return '<section class="card card--les"><' + heading + ' class="card__title">' + escape(title) + '</' + heading + '><p class="card__hint">' + escape(message) + '</p></section>'; }
  root.FrantzReportView = Object.freeze({ escape: escape, number: number, money: money, overview: overview, empty: empty });
})(window);
