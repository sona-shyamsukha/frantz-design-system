/* Private order prices. Missing allocations stay unknown; report costs are not order prices. */
(function (root) {
  'use strict';
  function amount(value) { return typeof value === 'number' && Number.isFinite(value) && value >= 0 ? value : null; }
  function escape(value) { return String(value == null ? '' : value).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
  function money(value) { return amount(value) === null ? 'Ikke registrert' : 'kr ' + value.toLocaleString('nb-NO'); }
  function model(submission, report) {
    var order = submission.order || {}, campaign = submission.campaign || {}, prices = order.prislinjer || {};
    var channels = prices.kanaler || campaign.leveranser;
    if (!Array.isArray(channels)) {
      var names = order.kanaler || campaign.kanaler || (report && report.channels || []).map(function (channel) { return channel.name; });
      channels = Array.isArray(names) ? names : String(names || '').split(',').map(function (name) { return name.trim(); }).filter(Boolean);
    }
    function line(item) {
      var result = typeof item === 'string' ? { name: item, price: null, quantity: null, unitPrice: null } : {
        name: item.name || '', strategy: item.strategy || '', period: item.period || '',
        price: amount(item.price), quantity: amount(item.quantity), unitPrice: amount(item.unitPrice)
      };
      var channel = root.FZ_KANALER && root.FZ_KANALER.finn(result.name);
      if (channel) result.name = channel.navn;
      return result;
    }
    var extras = prices.tillegg || order.tillegg || [];
    var budget = amount(order.budsjett);
    if (budget === null) budget = amount(campaign.budsjett);
    if (budget === null && report) budget = amount(report.budget);
    var extrasTotal = amount(order.tilleggSum), total = amount(order.total);
    if (total === null && budget !== null && extrasTotal !== null) total = budget + extrasTotal;
    return { budget: budget, extrasTotal: extrasTotal, total: total, channels: channels.map(line),
      extras: (Array.isArray(extras) ? extras : [extras]).map(line),
      designPending: !!(submission.material && submission.material.modus === 'hjelp') };
  }
  function render(submission, report) {
    var data = model(submission, report);
    var description = submission.hasSubmission === false ? 'Registrert kampanjebudsjett. Originalbestilling og full prisfordeling er ikke tilgjengelig.' : 'Registrerte priser fra bestillingen. Endringer avklares med Frantz.';
    function fact(label, value) { return '<dl class="summary-row"><dt>' + label + '</dt><dd>' + money(value) + '</dd></dl>'; }
    function table(lines, label) {
      if (!lines.length) return '<p class="form-hint">Ingen ' + label.toLowerCase() + ' er registrert.</p>';
      if (lines.every(function (item) { return item.price === null && item.quantity === null && item.unitPrice === null; })) {
        return '<p>' + lines.map(function (item) { return escape(item.name); }).join(' · ') + '</p>';
      }
      return '<div class="results__scroll" role="region" aria-label="' + label + '" tabindex="0"><table class="campaign-price-table"><thead><tr><th scope="col">Leveranse</th><th scope="col">Antall</th><th scope="col">Enhetspris</th><th scope="col">Pris</th></tr></thead><tbody>' + lines.map(function (item) {
        return '<tr><th scope="row">' + escape(item.name) + (item.strategy ? '<small>' + escape(item.strategy) + '</small>' : '') + (item.period ? '<small>' + escape(item.period) + '</small>' : '') + '</th><td data-label="Antall">' + (item.quantity === null ? '—' : item.quantity) + '</td><td data-label="Enhetspris">' + (item.unitPrice === null ? '—' : money(item.unitPrice)) + '</td><td data-label="Pris">' + money(item.price) + '</td></tr>';
      }).join('') + '</tbody></table></div>';
    }
    return '<div class="card__head"><div><h2 class="card__title">Priser og bestilling</h2><p class="form-hint">' + description + '</p></div></div><div class="campaign-price-summary">' + fact('Kampanjebudsjett', data.budget) + (data.extrasTotal !== null ? fact('Tillegg', data.extrasTotal) : '') + (data.total !== null ? fact('Totalsum ved bestilling', data.total) : '') + '</div><h3 class="text-h4">Kanaler og leveranser</h3>' + table(data.channels, 'Kanalpriser') + (data.channels.some(function (line) { return line.price === null; }) ? '<p class="form-hint">Prisfordelingen per kanal er ikke fullstendig registrert. Kostnad per «Søk» i rapporten er ikke en bestillingspris.</p>' : '') + '<h3 class="text-h4 mt-6">Tillegg</h3>' + table(data.extras, 'Tillegg') + (data.designPending ? '<p class="form-hint mt-4">Design fra Frantz kommer i tillegg. Estimat må avklares før arbeidet starter.</p>' : '');
  }
  root.FrantzCampaignPricing = Object.freeze({ model: model, render: render });
})(window);
