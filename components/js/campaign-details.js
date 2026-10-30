/* Private campaign details: original submission, developments, and copyable links. */
(function (root) {
  'use strict';
  var current, availability, activityRevision = 0;
  function element(tag, className, text) {
    var node = document.createElement(tag);
    if (className) node.className = className;
    if (text != null) node.textContent = text;
    return node;
  }
  function safeUrl(value) {
    try { var url = new URL(value); return /^https?:$/.test(url.protocol) ? url.href : ''; }
    catch (error) { return ''; }
  }
  function displayDate(value) {
    return new Date(value).toLocaleString('nb-NO', { dateStyle: 'short', timeStyle: 'short', timeZone: 'Europe/Oslo' });
  }
  function renderFields(model, group) {
    var host = document.querySelector('[data-submitted-' + group + ']');
    host.replaceChildren();
    model.fields.filter(function (field) { return field.group === group; }).forEach(function (field) {
      var row = element('dl', 'summary-row');
      row.appendChild(element('dt', '', field.label.replace('Kampanjenavn/deres referansekode', 'Kampanjenavn / referanse')));
      var value = element('dd', '');
      value.style.whiteSpace = 'pre-line';
      if (field.id === 'kanaler' && field.value) value.innerHTML = root.FZ_KANALER.html(field.value);
      else value.textContent = field.value || (['pakke', 'produkter', 'fil'].includes(field.id) ? 'Ikke valgt' : 'Ikke oppgitt');
      row.appendChild(value); host.appendChild(row);
    });
    if (!host.children.length) host.appendChild(element('p', 'form-hint', 'Ingen opplysninger er registrert.'));
  }
  function renderSource(model) {
    var source = document.querySelector('[data-submitted-source]');
    var url = safeUrl(model.source.url);
    source.hidden = !url && !model.source.text && !(model.material && model.material.kilder && model.material.kilder.length);
    var linkHost = source.querySelector('[data-source-url]'); linkHost.replaceChildren();
    if (url) {
      linkHost.appendChild(element('p', 'form-hint', 'Lenke brukt ved bestilling'));
      var link = element('a', 'link campaign-source-link', url); link.href = url; link.target = '_blank'; link.rel = 'noopener';
      linkHost.appendChild(link);
    }
    var text = source.querySelector('[data-source-text]'); text.textContent = model.source.text;
    text.closest('[data-source-text-block]').hidden = !model.source.text;
  }
  function campaignUrl(model) {
    var side = model.campaign.side || location.pathname.split('/').pop() + '?id=' + model.id;
    var url = new URL(side, location.href); url.hash = ''; return url.href;
  }
  function renderOverview(model) {
    var host = document.querySelector('[data-campaign-facts]'); host.replaceChildren();
    function fact(label, value) {
      if (!value) return;
      var row = element('div', 'grid gap-2');
      row.append(element('span', 'form-hint', label), element('strong', '', value)); host.appendChild(row);
    }
    function field(id) { var value = model.fields.find(function (item) { return item.id === id; }); return value && value.value; }
    fact(model.status === 'Bestilt' || model.status === 'Under arbeid' ? 'Planlagt periode' : 'Periode', model.campaign.periode || field('periode') || 'Avklares med Frantz');
    fact('Bestilt av', model.campaign.bestiller);
    fact('Arbeidsgiver', model.campaign.arbeidsgiver || field('arbeidsgiver'));
    fact('Annonseavsender', model.material && model.material.avsender || field('avsender'));
    fact('Fakturamottaker', field('faktura'));
    fact('Frantz-rådgiver', model.campaign.radgiver || model.order.radgiver || 'Tildeles av Frantz');
  }
  function renderLinks() {
    if (!current) return;
    var model = current, host = document.querySelector('[data-campaign-links]'); host.replaceChildren();
    function row(label, value, url, pending) {
      var group = element('div', 'grid gap-2'); group.appendChild(element('span', 'form-hint', label));
      if (value) group.appendChild(root.FrantzCopyField.create(value, { label: label, url: url }));
      else group.appendChild(element('p', 'form-hint', pending));
      host.appendChild(group);
    }
    row('Kampanjenummer', '#' + model.id);
    var pixel = document.querySelector('[data-piksel]');
    if (pixel && root.FrantzPiksel) {
      var tracking = element('div', 'grid gap-2');
      tracking.appendChild(element('span', 'form-hint', 'Sporingskode'));
      var status = pixel.querySelector('.piksel__status');
      if (status) {
        var shortStatus = element('p', 'form-hint', { aktiv: 'Aktiv', avsluttet: 'Målingen er avsluttet' }[pixel.dataset.status] || 'Ikke funnet på stillingssiden ennå');
        shortStatus.title = status.textContent; tracking.appendChild(shortStatus);
      }
      tracking.appendChild(root.FrantzCopyField.create(root.FrantzPiksel.kode(pixel.dataset.connect || pixel.dataset.piksel), { label: 'sporingskode' }));
      var setup = element('a', 'link', 'Se kode og oppsett'); setup.href = '#tracking-details';
      setup.addEventListener('click', function (event) {
        event.preventDefault();
        root.FrantzCampaignSections.init().select('kampanje');
        var details = document.getElementById('tracking-details');
        details.open = true;
        details.querySelector('summary').focus({ preventScroll: true });
        details.scrollIntoView({ block: 'center' });
      });
      tracking.appendChild(setup); host.appendChild(tracking);
    }
    var portal = campaignUrl(model); row('Kampanje i portalen', portal, portal);
    var landing = safeUrl(model.campaign.kampanjelenke || (model.status !== 'Bestilt' ? 'https://frantz.no/k/' + model.id : ''));
    row('Kampanjeside', landing, landing, 'Lenken kommer når kampanjesiden er klar.');
    var source = safeUrl(model.source.url); if (source) row('Stillingsannonse', source, source);
    // The shareable report only exists once the campaign is live.
    if (model.status === 'Aktiv' || model.status === 'Avsluttet') {
      var reportUrl = root.FrantzReportSharing.linkFor(model.id);
      row('Rapport uten innlogging', reportUrl, reportUrl, 'Rapportdeling er ikke tilgjengelig.');
    }
    var social = element('div', 'grid gap-2');
    social.appendChild(element('span', 'form-hint', 'Annonser i sosiale medier'));
    var links = Array.isArray(model.campaign.annonselenker) ? model.campaign.annonselenker : [];
    var seen = new Set();
    links.forEach(function (ad) {
      var url = ad && safeUrl(ad.url);
      if (!url || seen.has(url)) return;
      seen.add(url);
      var label = [ad.kanal, ad.navn].filter(Boolean).join(' · ') || 'Publisert annonse';
      var group = element('div', 'grid gap-2');
      group.append(element('span', 'form-hint', label), root.FrantzCopyField.create(url, { label: label, url: url }));
      social.appendChild(group);
    });
    if (!seen.size) social.appendChild(element('p', 'form-hint', model.status === 'Bestilt' || model.status === 'Under arbeid' ? 'Lenkene kommer når annonsene er publisert.' : 'Lenker til publiserte annonser er ikke tilgjengelige ennå.'));
    host.appendChild(social);
  }
  function activityRow(event) {
    var li = element('li', 'journey__step'); li.dataset.localActivity = '';
    var dot = element('span', 'journey__dot'); dot.setAttribute('aria-hidden', 'true');
    var body = element('div', 'journey__body');
    var head = element('div', 'journey__head');
    if (event.at) { var time = element('time', '', displayDate(event.at)); time.dateTime = event.at; head.appendChild(time); }
    body.append(head, element('h4', '', event.title));
    if (event.body) body.appendChild(element('p', '', event.body));
    li.append(dot, body); return li;
  }
  async function renderActivity() {
    if (!current) return;
    var revision = ++activityRevision;
    var model = current, host = document.querySelector('[data-campaign-history]');
    var list = host.querySelector('ol.journey');
    if (!list) { list = element('ol', host.querySelector('.checklist') ? 'journey card__footer' : 'journey'); host.appendChild(list); }

    var events = root.FrantzCampaignActivity.read(model.id);
    if (model.submittedAt) events.push({ at: model.submittedAt, title: 'Bestillingen er mottatt', body: 'Opplysningene og materiellet fra bestillingen er lagret på kampanjen.' });
    if (root.FrantzApprovals) {
      try {
        var requests = await root.FrantzApprovals.list(model.approvalKey);
        requests.forEach(function (request) {
          var type = request.round === 'plan' ? 'kampanjeplan' : 'annonser';
          events.push({ at: request.created, title: 'Godkjenning av ' + type + ' opprettet', body: 'Til ' + request.name + ' · ' + request.email + (request.message ? '\n' + request.message : '') });
          if (request.answered) events.push({ at: request.answered, title: request.comment ? 'Endringer ønsket i ' + type : 'Godkjenning av ' + type + ' mottatt', body: request.comment || request.name + ' har godkjent versjon ' + request.version + '.' });
          if (request.revoked) events.push({ at: request.revoked, title: 'Godkjenningsforespørselen er trukket tilbake', body: 'Versjon ' + request.version + ' av ' + type + '.' });
        });
      } catch (error) { /* Other recorded developments remain visible if approval storage is unavailable. */ }
    }
    if (current !== model || revision !== activityRevision) return;
    list.querySelectorAll('[data-local-activity]').forEach(function (node) { node.remove(); });
    events.sort(function (a, b) { return Date.parse(a.at) - Date.parse(b.at); }).forEach(function (event) { list.appendChild(activityRow(event)); });
    var empty = host.querySelector('[data-history-empty]');
    if (!empty) { empty = element('p', 'form-hint', 'Ingen endringer er registrert ennå.'); empty.dataset.historyEmpty = ''; host.appendChild(empty); }
    list.hidden = !list.children.length;
    empty.hidden = !!list.children.length || !!host.querySelector('.checklist li');
    // Bestilt: no empty history card before anything has happened.
    if (document.body.dataset.campaignPage === 'ordered') host.hidden = !list.children.length;
  }
  // Bestilt: dates in the next steps, the tracking-code email and the missing-material choice.
  function shortDate(iso, daysBefore) {
    var match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso || '');
    if (!match) return '';
    var day = new Date(+match[1], match[2] - 1, +match[3] - (daysBefore || 0));
    return String(day.getDate()).padStart(2, '0') + '.' + String(day.getMonth() + 1).padStart(2, '0') + (daysBefore ? '' : '.' + day.getFullYear());
  }
  var MATERIAL_DONE = {
    frantz: 'Frantz lager annonsene. Dere godkjenner dem før noe publiseres.',
    upload: 'Annonsene er lastet opp. Frantz ser gjennom dem og sier fra hvis noe mangler.'
  };
  function renderOrderedStatus(model, campaign) {
    var status = document.getElementById('ordered-status');
    if (!status) return;
    var approve = document.getElementById('ordered-step-approve');
    approve.textContent = 'Når annonsene er klare.'; approve.hidden = false;
    document.getElementById('ordered-step-start').textContent = 'Oppstart bekreftes av Frantz';
    var note = document.getElementById('ordered-step-start-note');
    note.textContent = 'Etter at materiell, godkjenning og dato er avklart.'; note.hidden = false;
    var mail = document.getElementById('tracking-mail');
    if (mail && root.FrantzPiksel) mail.href = root.FrantzPiksel.epost(model.order.connect || campaign && campaign.connect || model.id, model.title);
    var banner = document.getElementById('material-missing');
    var missing = !model.material || !model.material.modus;
    banner.hidden = !missing;
    var actions = document.getElementById('material-missing-actions'); actions.replaceChildren();
    [['ferdig', 'Last opp annonser'], ['hjelp', 'La Frantz lage annonsene']].forEach(function (choice) {
      var link = element('a', 'btn btn--secondary btn--sm', choice[1]);
      link.href = 'ny-kampanje.html?redigerMateriell=' + encodeURIComponent(model.id) + '&valg=' + choice[0]; actions.appendChild(link);
    });
    var materialCard = document.querySelector('[data-submitted-material]');
    // The existing order editor opens the same controls and validation in both journeys.
    var edit = element('a', 'btn btn--secondary btn--sm', 'Endre materiell og filer');
    edit.href = 'ny-kampanje.html?redigerMateriell=' + encodeURIComponent(model.id);
    materialCard.querySelector('.card__head').appendChild(edit);
    materialCard.hidden = false;
  }
  function updateHeader(model) {
    var title = document.querySelector('h1'); title.textContent = model.title;
    document.title = model.title + ' — Frantz kampanjeportal';
    document.querySelector('.breadcrumb__item:last-child span').textContent = model.title;
    document.body.dataset.campaignId = model.id;
  }
  async function init(options) {
    var id = options.id, campaign = root.FZ_KAMPANJER.finn(id);
    var panel = document.querySelector('.campaign-links');
    var desktop = matchMedia('(min-width: 1181px)');
    panel.open = desktop.matches;
    desktop.addEventListener('change', function () { panel.open = desktop.matches; });
    var model = await root.FrantzCampaignSubmission.load(id, campaign);
    if (!model.found) {
      document.querySelector('h1').textContent = 'Fant ikke kampanjen';
      document.querySelector('.campaign-layout').hidden = true;
      var error = document.getElementById('status-alert');
      if (error) { error.hidden = false; error.textContent = 'Vi finner ikke denne kampanjen. Gå tilbake til Kampanjer og velg en kampanje.'; }
      return;
    }
    current = model; updateHeader(model); renderOverview(model);
    try { root.FrantzReportSharing.ensure(model.id); } catch (error) { /* Show an unavailable link rather than an unsaved URL. */ }
    renderFields(model, 'stilling'); renderFields(model, 'kampanje'); renderSource(model);
    document.querySelectorAll('[data-submitted-date]').forEach(function (node) { node.textContent = model.submittedAt ? 'Bestilt ' + displayDate(model.submittedAt) : ''; });
    document.querySelectorAll('[data-submitted-note]').forEach(function (node) { node.hidden = model.hasSubmission; node.textContent = model.hasSubmission ? '' : 'Viser opplysningene som er lagret for kampanjen. Originalbestillingen er ikke tilgjengelig.'; });
    var materialCard = document.querySelector('[data-submitted-material]');
    materialCard.hidden = !model.material;
    root.FrantzCampaignMaterialView.render(model.record);
    if (model.record && model.material) {
      var actions = document.getElementById('ordered-approval-actions');
      actions.hidden = model.material.modus === 'hjelp' || !model.material.bilde;
      root.FrantzApprovalShare.attach(document.getElementById('ordered-share'), {
        campaign: model.approvalKey, rounds: ['material'], host: actions, ordered: true,
        readContent: function () { return { title: model.order.stilling || model.title, employer: model.material.avsender, location: model.order.sted, period: model.order.periodeTekst, budget: model.order.budsjett, extras: model.order.tilleggSum || 0, channels: model.material.kanaler, material: model.material }; }
      });
    }
    document.querySelectorAll('[data-piksel]').forEach(function (node) { node.dataset.piksel = model.id; node.dataset.connect = model.order.connect || campaign && campaign.connect || ''; node.dataset.tid = model.status === 'Aktiv' ? options.report && options.report.updated || '' : model.status === 'Avsluttet' ? root.FrantzCampaignSubmission.date(campaign && campaign.til || '') : ''; });
    root.FrantzPiksel.render();
    var contact = document.querySelector('[data-campaign-contact]');
    contact.href = 'mailto:post@frantz.no?subject=' + encodeURIComponent('[Kampanje #' + model.id + '] ' + model.title) + '&body=' + encodeURIComponent('Hei,\n\nJeg har et spørsmål om kampanjen:\n\n');
    renderOrderedStatus(model, campaign);
    renderLinks(); await renderActivity();
    var report = root.FZ_REPORTS && root.FZ_REPORTS[model.id];
    var material = model.material;
    var submittedAds = !!(material && (material.bilde || material.logo || (material.filer || []).length || material.designbrief || material.tekst || material.tittel));
    var creative = document.getElementById('creative-heading');
    var currentAds = !!(report && report.ads && report.ads.length) || !!(creative && !creative.closest('.card').hidden);
    availability = {
      stilling: model.fields.some(function (field) { return field.group === 'stilling' && field.value; }) || !!model.source.text || !!model.source.url || !!(material && (material.kilder || []).length),
      kampanje: true, annonser: model.status === 'Bestilt' || submittedAds || currentAds, innsikt: !!report, interessenter: !!(report && report.interest > 0)
    };
    root.FrantzCampaignSections.init().setAvailable(availability);
    document.body.dataset.submissionReady = 'true';
    root.addEventListener('focus', renderLinks);
    root.addEventListener('frantz:report-sharing-change', renderLinks);
    root.addEventListener('frantz:campaign-activity', renderActivity);
    root.addEventListener('frantz:approval-change', renderActivity);
    root.addEventListener('storage', function (event) {
      if (event.key === root.FrantzCampaignActivity.key || event.key === 'fzApprovalChanged') renderActivity();
      if (root.FrantzReportSharing && event.key === root.FrantzReportSharing.key) renderLinks();
    });
    document.dispatchEvent(new CustomEvent('frantz:campaign-loaded'));
  }
  root.FrantzCampaignDetails = Object.freeze({ init: init });
})(window);
