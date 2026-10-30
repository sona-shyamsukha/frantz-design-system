/* Portal and public reports share the same aggregate rendering. Optional figures stay optional. */
(function (root) {
  'use strict';
  function escape(value) { return String(value == null ? '' : value).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
  function number(value) { return Number(value).toLocaleString('nb-NO').replace(/[\u00a0\u202f]/g, ' '); }
  function money(value) { return 'kr ' + number(value); }
  function metric(label, value, icon, foot, help, align) {
    var symbol = '<span class="metric__icon"><span class="icon-lucide icon-lucide--' + icon + '" aria-hidden="true"></span></span>';
    var tip = help ? '<button type="button" class="tooltip"' + (align ? ' data-tooltip-align="' + escape(align) + '"' : '') + ' data-tooltip="' + escape(help) + '" aria-label="' + escape('Hva betyr ' + label.toLocaleLowerCase('nb-NO') + '?') + '"><span class="icon-lucide icon-lucide--info" aria-hidden="true"></span></button>' : '';
    return '<div class="metric">' + symbol +
      '<div class="metric__value">' + escape(value) + '</div><div class="metric__label' + (help ? ' tooltip-label' : '') + '"><span>' + escape(label) + '</span>' + tip + '</div>' + (foot || '') + '</div>';
  }
  /* Dates in the fixtures are «dd.mm – dd.mm.yyyy». */
  function periodDates(report) {
    var match = /(\d{2})\.(\d{2})\s*–\s*(\d{2})\.(\d{2})\.(\d{4})/.exec(report.period || '');
    if (!match) return null;
    return { start: new Date(+match[5], +match[2] - 1, +match[1]), end: new Date(+match[5], +match[4] - 1, +match[3]) };
  }
  function role(report) { return String(report.title || '').split(' ')[0].toLocaleLowerCase('nb-NO'); }
  /* The customer's most recent finished campaign for the same role that ended before this one started.
     Never invented: no such campaign means no comparison. */
  function previousCampaign(report, reports) {
    var own = periodDates(report);
    if (!own || !reports) return null;
    return Object.keys(reports).map(function (key) { return reports[key]; }).filter(function (other) {
      var dates = periodDates(other);
      return other.id !== report.id && !other.active && dates && dates.end < own.start && role(other) === role(report) && other.applications != null;
    }).sort(function (a, b) { return periodDates(b).end - periodDates(a).end; })[0] || null;
  }
  /* One short line per card. Direction is said in words, so it never depends on colour. For cost, lower is better: «billigere».
     Which campaign «sist» means is said once, under the cards. */
  function comparison(previous, current, before, kind) {
    if (!previous || current == null || before == null) return '';
    var diff = current - before, change;
    if (kind === 'cost') change = diff === 0 ? 'Samme som sist' : money(Math.abs(diff)) + (diff < 0 ? ' billigere enn sist' : ' dyrere enn sist');
    else change = diff === 0 ? 'Like mange som sist' : number(Math.abs(diff)) + (diff > 0 ? ' flere enn sist' : ' færre enn sist');
    return '<p class="metric__compare">' + escape(keep(change)) + '</p>';
  }
  /* Keeps «kr 1 730» on one line in running text. */
  function keep(text) { return text.replace(/(kr|\d) (?=\d)/g, '$1 '); }
  function previousNote(previous, costs) {
    if (!previous) return '';
    var figures = keep(number(previous.applications) + ' trykket «Søk»' + (costs && previous.cost != null ? ', ' + money(previous.cost) + ' per «Søk»' : ''));
    return '<p class="form-hint mt-4">«Sist» er forrige kampanje, ' + escape(previous.title) + ' (' + escape(previous.period) + '): ' + escape(figures) + '.</p>';
  }
  function fact(label, value) { return '<dl class="summary-row"><dt>' + escape(label) + '</dt><dd>' + escape(value) + '</dd></dl>'; }
  function disclosure(title, html, id) { return '<details class="disclosure campaign-disclosure"' + (id ? ' id="' + escape(id) + '"' : '') + '><summary>' + escape(title) + '<span class="icon-lucide icon-lucide--chevron-down icon-lucide--md" aria-hidden="true"></span></summary><div class="disclosure__content campaign-disclosure__body">' + html + '</div></details>'; }
  function header(report, action) {
    return '<div><p class="campaign-eyebrow">' + escape(report.employer) + '</p><div class="campaign-title"><h1 class="text-h2">' + escape(report.title) + '</h1><span class="badge ' + (report.active ? 'badge--active' : 'badge--ended') + '">' + (report.active ? 'Aktiv' : 'Avsluttet') + '</span></div><p class="form-hint campaign-meta">' + escape(report.period) + ' <span aria-hidden="true">·</span> ' + (report.active ? 'Dag ' + number(report.day) + ' av ' + number(report.totalDays) : 'Kampanjen er ferdig') + '</p></div>' + (action || '');
  }
  function overview(report, options) {
    options = options || {};
    var costs = options.costs !== false;
    var metrics = [];
    // Comparisons use the customer's own campaigns, so they stay inside the portal.
    var previous = options.internal ? previousCampaign(report, root.FZ_REPORTS) : null;
    if (report.visits != null) metrics.push(metric('Besøk på kampanjesiden', number(report.visits), 'eye', '', options.internal && 'Besøk på siden Frantz lager for stillingen. Derfra kan kandidaten trykke «Søk».', 'end'));
    metrics.push(metric('Trykket «Søk»', number(report.applications), 'target', comparison(previous, report.applications, previous && previous.applications, 'count'), options.internal && ('Klikk videre til søknadsskjemaet, ikke innsendte søknader.' + (previous ? ' Forrige kampanje: ' + number(previous.applications) + ' klikk.' : ''))));
    if (costs && report.cost != null) metrics.push(metric('Kostnad per «Søk»', money(report.cost), 'wallet', comparison(previous, report.cost, previous && previous.cost, 'cost'), options.internal && ('Annonsekostnad delt på antall klikk på «Søk».' + (previous && previous.cost != null ? ' Forrige kampanje: ' + money(previous.cost) + ' per «Søk».' : ''))));
    if (report.interest != null) metrics.push(metric('Meldte interesse', number(report.interest), 'users', '', options.internal && 'Personer som la igjen kontaktinfo uten å søke. Dere kan følge dem opp under Interessenter.'));
    var assessment = report.assessment ? '<blockquote class="quote mt-6"><p>' + escape(report.assessment) + '</p><footer><span class="avatar avatar--sm avatar--data" aria-hidden="true">MK</span>Martin Karlsen · Rådgiver i Frantz</footer></blockquote>' : '';
    var explanation = options.internal ? '<p class="form-hint mt-4">«Søk» viser klikk, ikke innsendte søknader.</p>' + (previous ? '<p class="form-hint">«Sist»: ' + escape(previous.title) + ' (' + escape(previous.period) + ').</p>' : '') : previousNote(previous, costs) + '<p class="form-hint mt-4">' + (report.visits != null ? 'Kampanjesiden er siden Frantz lager for stillingen. Derfra trykker kandidaten «Søk». ' : '') + '«Trykket Søk» er klikk videre til søknadsskjemaet, ikke antall innsendte søknader.' + (report.interest != null ? ' Meldte interesse: kandidater som la igjen kontaktinfo uten å søke.' : '') + '</p>';
    var channels = report.channels ? '<section class="card card--betjen report-channel-section" aria-labelledby="report-channel-title"><div class="card__head"><h2 class="card__title" id="report-channel-title">Resultater per kanal</h2></div><div class="metrics metrics--channel">' + report.channels.map(function (channel, index) {
      return '<div class="metric"><div class="metric__channel"><span class="kanal-prikk kanal-prikk--' + (index === 0 ? 'meta' : 'nettsteder') + '" aria-hidden="true"></span>' + escape(channel.name) + '</div><div class="metric__value">' + number(channel.applications) + '</div><div class="metric__label">Trykket «Søk»</div>' + (costs && channel.cost != null ? '<div class="metric__foot">' + money(channel.cost) + ' per «Søk»</div>' : '') + '</div>';
    }).join('') + '</div></section>' : '';
    return '<section class="card card--betjen report-summary" aria-labelledby="result-summary-title"><div class="card__head"><div><h2 class="card__title" id="result-summary-title">' + (report.active ? 'Resultater så langt' : 'Kampanjerapport') + '</h2><p class="form-hint">' + (report.active ? 'Oppdatert ' + escape(report.updated) : 'Resultater for hele kampanjeperioden' + (report.updated ? ' · Oppdatert ' + escape(report.updated) : '')) + '</p></div></div><div class="' + (metrics.length === 1 ? 'mt-4' : 'metrics' + (metrics.length === 4 ? ' metrics--fire' : '')) + '">' + metrics.join('') + '</div>' + explanation + (!report.channels ? '<p class="form-hint mt-4">Annonsert i ' + escape((report.channelNames || []).join(', ')) + '. Detaljert fordeling per kanal er ikke tilgjengelig.</p>' : '') + assessment + '</section>' + channels +
      (options.internal && report.interest > 0 ? '<div class="report-interest-link"><span>Følg opp de som har meldt interesse.</span><button type="button" class="link" data-open-tab="interessenter">Åpne interessenter (' + number(report.interest) + ')</button></div>' : '');
  }
  function empty(title, message, level) { var heading = level === 2 ? 'h2' : 'h1'; return '<section class="card card--les"><' + heading + ' class="card__title">' + escape(title) + '</' + heading + '><p class="card__hint">' + escape(message) + '</p></section>'; }
  root.FrantzReportView = Object.freeze({ escape: escape, number: number, money: money, overview: overview, previousCampaign: previousCampaign, empty: empty, header: header, fact: fact, disclosure: disclosure });
})(window);
