/* LOCAL DESIGN PROTOTYPE ONLY.
   Sharing records live in this browser. Production requires a server that authorizes each
   read, applies field visibility before sending data, expires links and enforces revocation.
   Never use this local store as access control for real reports or candidate data. */
(function (root) {
  'use strict';
  var KEY = 'fzReportSharingReviewV1';
  function read() {
    try {
      var value = JSON.parse(localStorage.getItem(KEY) || '{}');
      return value && typeof value === 'object' && !Array.isArray(value) ? value : {};
    } catch (error) { return {}; }
  }
  function save(records) {
    // Fail visibly if storage is unavailable; do not report a link as created.
    localStorage.setItem(KEY, JSON.stringify(records));
    root.dispatchEvent(new Event('frantz:report-sharing-change'));
  }
  function state(record) {
    if (!record || record.revoked) return 'revoked';
    if (record.expires && Date.now() >= new Date(record.expires).getTime()) return 'expired';
    return 'active';
  }
  function resolve(token) {
    return Object.values(read()).find(function (record) { return record.token === token; }) || null;
  }
  function url(record) {
    var target = new URL('delt-rapport.html', location.href);
    target.searchParams.set('lenke', record.token);
    return target.href;
  }
  function previewUrl(id, costs) {
    var target = new URL('delt-rapport.html', location.href);
    target.searchParams.set('kampanje', id);
    target.searchParams.set('forhandsvis', '1');
    if (costs) target.searchParams.set('kostnader', '1');
    return target.href;
  }
  function attach(trigger, report) {
    var panel = document.getElementById('report-sharing');
    if (!trigger || !panel) return;
    var record = read()[report.id] || null;
    panel.innerHTML = '<div class="report-sharing__heading"><div><h2 class="card__title" id="sharing-heading">Del rapport uten innlogging</h2><p>Alle med lenken kan se rapporten. Kontaktopplysninger følger ikke med.</p></div><button type="button" class="btn btn--ghost btn--sm" data-close-sharing>Lukk</button></div>' +
      '<div class="report-sharing__options"><label class="form-check"><input class="form-check__input" type="checkbox" id="share-costs"><span class="form-check__box" aria-hidden="true"></span><span class="form-check__label">Vis budsjett og kostnader</span></label><div class="form-group"><label class="form-label" for="share-expiry">Lenken utløper</label><select class="form-select" id="share-expiry"><option value="7">Om 7 dager</option><option value="30" selected>Om 30 dager</option><option value="never">Ingen utløpsdato</option><option value="custom">Velg dato</option></select></div><div class="form-group" id="share-custom-group" hidden><label class="form-label" for="share-custom-date">Utløpsdato</label><input type="date" class="form-input" id="share-custom-date"></div></div>' +
      '<div class="report-sharing__link" id="share-link-row" hidden><label class="sr-only" for="share-url">Rapportlenke</label><input class="form-input" id="share-url" type="url" readonly><button type="button" class="btn btn--secondary" id="share-copy">Kopier lenke</button></div>' +
      '<div class="btn-row report-sharing__actions"><button type="button" class="btn btn--primary" id="share-save">Opprett rapportlenke</button><a class="link" id="share-preview" target="_blank" rel="noopener">Forhåndsvis rapport <span class="sr-only">(ny fane)</span></a><button type="button" class="btn btn--ghost" id="share-revoke" hidden>Slå av deling</button></div><p class="report-sharing__status" id="share-status" role="status"></p>' +
      '<details class="approval-test report-sharing__prototype"><summary>Om denne prototypen<span class="icon-lucide icon-lucide--chevron-down icon-lucide--md" aria-hidden="true"></span></summary><p>Lenker, utløpsdato og deaktivering kan testes i samme nettleser på samme adresse. Lenken virker ikke på en annen enhet. Ingen rapport er publisert eller sendt. En ferdig løsning trenger lagring og tilgangskontroll på serveren.</p></details>';
    var costs = panel.querySelector('#share-costs');
    var expiry = panel.querySelector('#share-expiry');
    var customDate = panel.querySelector('#share-custom-date');
    var saveButton = panel.querySelector('#share-save');
    var revoke = panel.querySelector('#share-revoke');
    var linkRow = panel.querySelector('#share-link-row');
    var urlField = panel.querySelector('#share-url');
    var preview = panel.querySelector('#share-preview');
    var message = panel.querySelector('#share-status');
    customDate.min = new Date(Date.now() + 86400000).toLocaleDateString('sv-SE');
    function updatePreview() { preview.href = previewUrl(report.id, costs.checked); }
    function refresh() {
      record = read()[report.id] || null;
      var active = state(record) === 'active';
      linkRow.hidden = !active;
      revoke.hidden = !active;
      saveButton.textContent = active ? 'Lagre delingsvalg' : 'Opprett rapportlenke';
      urlField.value = active ? url(record) : '';
      if (active) {
        costs.checked = !!record.costs;
        expiry.value = record.expiryChoice || '30';
        if (record.expires && expiry.value === 'custom') customDate.value = record.expires.slice(0, 10);
        message.textContent = record.expires ? 'Deling er på. Utløper ' + new Date(record.expires).toLocaleDateString('nb-NO') + '. Kun i denne nettleseren i prototypen.' : 'Deling er på uten utløpsdato. Kun i denne nettleseren i prototypen.';
      } else message.textContent = record ? 'Deling er av eller lenken har utløpt.' : 'Ingen rapportlenke er opprettet.';
      panel.querySelector('#share-custom-group').hidden = expiry.value !== 'custom';
      updatePreview();
    }
    function close() { panel.hidden = true; trigger.setAttribute('aria-expanded', 'false'); trigger.focus(); }
    trigger.addEventListener('click', function () {
      panel.hidden = !panel.hidden;
      trigger.setAttribute('aria-expanded', String(!panel.hidden));
      if (!panel.hidden) { refresh(); panel.querySelector('[data-close-sharing]').focus({ preventScroll: true }); }
    });
    panel.querySelector('[data-close-sharing]').addEventListener('click', close);
    panel.addEventListener('keydown', function (event) { if (event.key === 'Escape') close(); });
    costs.addEventListener('change', function () { updatePreview(); message.textContent = 'Forhåndsvisningen viser valget ditt. Lagre for å oppdatere den delte lenken.'; });
    expiry.addEventListener('change', function () { panel.querySelector('#share-custom-group').hidden = expiry.value !== 'custom'; message.textContent = 'Lagre for å oppdatere utløpsdatoen.'; });
    saveButton.addEventListener('click', function () {
      if (expiry.value === 'custom' && (!customDate.value || !customDate.reportValidity() || customDate.value < customDate.min)) { message.textContent = 'Velg en utløpsdato fra i morgen.'; customDate.focus(); return; }
      try {
        var records = read();
        var expires = expiry.value === 'never' ? null : expiry.value === 'custom' ? new Date(customDate.value + 'T23:59:59').toISOString() : new Date(Date.now() + Number(expiry.value) * 86400000).toISOString();
        records[report.id] = { campaign: report.id, token: state(record) === 'active' ? record.token : crypto.randomUUID(), costs: costs.checked, expires: expires, expiryChoice: expiry.value, revoked: false };
        save(records); refresh();
      } catch (error) { message.textContent = 'Kunne ikke lagre rapportlenken i nettleseren. Prøv igjen.'; }
    });
    panel.querySelector('#share-copy').addEventListener('click', async function () {
      try { await navigator.clipboard.writeText(urlField.value); message.textContent = 'Rapportlenken er kopiert. I prototypen virker den bare i denne nettleseren.'; }
      catch (error) { message.textContent = 'Kunne ikke kopiere automatisk. Marker og kopier lenken i feltet.'; urlField.focus(); urlField.select(); }
    });
    revoke.addEventListener('click', function () {
      try { var records = read(); if (records[report.id]) records[report.id].revoked = true; save(records); refresh(); message.textContent = 'Deling er slått av. Den gamle lenken kan ikke brukes i prototypen.'; saveButton.focus(); }
      catch (error) { message.textContent = 'Kunne ikke slå av deling. Prøv igjen.'; }
    });
    root.addEventListener('storage', function (event) { if (event.key === KEY && !panel.hidden) refresh(); });
    refresh();
  }
  root.FrantzReportSharing = Object.freeze({ attach: attach, state: state, resolve: resolve, previewUrl: previewUrl, key: KEY });
})(window);
