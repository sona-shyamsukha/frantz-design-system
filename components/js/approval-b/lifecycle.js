/* Keep a newly ordered B campaign recognizable when demoing later service stages. */
(function () {
  'use strict';
  var id = new URLSearchParams(location.search).get('id'), campaign = id && FZ_KAMPANJER.finn(id), context = { campaign: campaign };
  context.ready = (async function () {
    if (id && !campaign) throw new Error('missing-campaign');
    if (!campaign) return;
    var record = campaign.materiellId && await FrantzCampaignMaterial.read(campaign.materiellId), o = record && record.ordre;
    context.record = record;
    document.title = campaign.tittel + ' — Frantz kampanjeportal';
    var heading = document.querySelector('h1'); if (heading) heading.textContent = campaign.tittel;
    var crumb = document.querySelector('.breadcrumb__item:last-child span'); if (crumb) crumb.textContent = campaign.tittel;
    var panel = document.getElementById('del-panel');
    if (panel) Object.assign(panel.dataset, { id: campaign.approvalKey, tittel: campaign.stilling, sted: campaign.sted, arbeidsgiver: campaign.arbeidsgiver, periode: o && o.periodeTekst || campaign.periode, kanaler: campaign.kanaler.join(', '), budsjett: String(campaign.budsjett) });
    document.querySelectorAll('.summary-row').forEach(function (row) {
      var label = row.querySelector('dt'), value = row.querySelector('dd'); if (!label || !value) return;
      if (/periode/i.test(label.textContent)) value.textContent = o && o.periodeTekst || campaign.periode;
      if (label.textContent.trim() === 'Budsjett') value.textContent = 'kr ' + campaign.budsjett.toLocaleString('nb-NO').replace(/[\u00a0\u202f]/g, ' ');
      if (label.textContent.trim() === 'Kanaler') FZ_KANALER.tegn(value, campaign.kanaler);
    });
    if (location.pathname.includes('kampanje-under-arbeid')) {
      var checks = document.querySelectorAll('.checklist li');
      if (checks[0] && record) checks[0].querySelector('small').textContent = new Date(record.innsendt).toLocaleString('nb-NO', { dateStyle: 'short', timeStyle: 'short' });
      if (checks[1]) checks[1].querySelector('small').textContent = campaign.stilling + ' i ' + campaign.sted + '.';
      if (checks[3]) checks[3].querySelector('small').textContent = 'Svar før planlagt start.';
      var pixel = document.getElementById('piksel'); if (pixel) { pixel.dataset.piksel = campaign.id; if (campaign.connect) pixel.dataset.connect = campaign.connect; else pixel.removeAttribute('data-connect'); if (window.FrantzPiksel) FrantzPiksel.render(); }
      document.querySelectorAll('.ad-card').forEach(function (card, i) {
        var name = [campaign.stilling + ' hos ' + campaign.arbeidsgiver, 'Bli med på laget i ' + campaign.sted, 'En hverdag med mening'][i];
        card.querySelector('.ad-card__name').textContent = '«' + name + '»';
        var a = card.querySelector('a'), url = new URL(a.href); url.searchParams.set('navn', name); url.searchParams.set('id', campaign.id); a.href = url.href;
        var sr = a.querySelector('.chat__sr'); if (sr) sr.textContent = ' «' + name + '» (åpnes i ny fane)';
      });
      var hint = document.querySelector('.card--betjen .card__hint');
      if (hint) hint.textContent = 'Se gjennom annonsene. Godkjenn dem, eller be om endringer, før Frantz publiserer.';
      var alert = document.querySelector('.status-alert'); if (alert) alert.textContent = 'Frantz trenger svar fra deg: se gjennom annonsene og godkjenn dem.';
    }
    if (record && record.materiell.modus !== 'hjelp') context.content = {
      title: campaign.stilling, employer: campaign.arbeidsgiver, location: campaign.sted,
      period: o.periodeTekst, budget: o.budsjett, extras: o.tilleggSum || 0,
      channels: record.materiell.kanaler, material: record.materiell
    };
  })().catch(function () {
    context.unavailable = true;
    var heading = document.querySelector('h1'); if (heading) heading.textContent = 'Fant ikke kampanjen';
    var cols = document.querySelector('.cols'); if (cols) cols.hidden = true;
    var alert = document.querySelector('.status-alert'); if (alert) alert.textContent = 'Kunne ikke hente denne B-bestillingen. Gå tilbake til sammenligningen og start en ny kampanje.';
  });
  window.FrantzApprovalContext = context;
})();
