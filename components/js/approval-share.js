/* One recipient, version and round per request. Email delivery is simulated in this prototype. */
(function (root) {
  'use strict';
  var Store = root.FrantzApprovals, attachments = [];
  var TITLES = { plan: 'kampanjeplanen', material: 'annonsene' };
  function el(tag, className, text) { var node = document.createElement(tag); if (className) node.className = className; if (text) node.textContent = text; return node; }
  function disclosureLabel(text) {
    var label = el('summary', '', text), icon = el('span', 'icon-lucide icon-lucide--chevron-down icon-lucide--md');
    icon.setAttribute('aria-hidden', 'true'); label.append(icon); return label;
  }
  function button(text, className) { var node = el('button', className || 'btn btn--secondary btn--sm', text); node.type = 'button'; return node; }
  function date(value) { return new Date(value).toLocaleString('nb-NO', { dateStyle: 'short', timeStyle: 'short', timeZone: 'Europe/Oslo' }); }
  function url(request, email) { var link = new URL('godkjenning.html', location.href); link.searchParams.set('request', request.id); if (email) link.searchParams.set('email', '1'); return link.href; }
  function attach(trigger, options) {
    var summary = el('section', 'approval-summary'); summary.hidden = true; summary.setAttribute('aria-label', 'Godkjenningsforespørsler'); summary.setAttribute('aria-live', 'polite');
    var editor = el('section', 'approval-inline'); editor.hidden = true;
    editor.id = 'approval-inline-' + root.crypto.randomUUID();
    (options.host || trigger.parentElement).insertAdjacentElement('afterend', editor);
    editor.insertAdjacentElement('afterend', summary);
    trigger.classList.add('approval-trigger'); trigger.removeAttribute('aria-haspopup'); trigger.setAttribute('aria-expanded', 'false'); trigger.setAttribute('aria-controls', editor.id);
    trigger.lastChild.textContent = trigger.dataset.approvalLabel || (options.round === 'plan' || options.rounds[0] === 'plan' ? ' Send planen til godkjenning' : ' Send annonsene til godkjenning');
    var context = { trigger: trigger, options: options, editor: editor, summary: summary, records: [] }; attachments.push(context);
    async function refresh() {
      try {
        context.records = await Store.list(options.campaign);
        var latest = ['plan', 'material'].map(function (round) { return context.records.find(function (item) { return item.round === round; }); }).filter(Boolean);
        // Focus refreshes must not replace the button between pointerdown and click.
        var signature = JSON.stringify([editor.hidden, latest.map(function (item) { return [item.id, Store.status(item), item.answered, item.comment]; })]);
        if (signature === context.renderedSignature) {
          if (options.onChange) options.onChange(context.records);
          return;
        }
        summary.replaceChildren(); summary.hidden = !latest.length || !editor.hidden;
        trigger.hidden = context.records.some(function (item) { return item.round === (options.round || options.rounds[0]); });
        latest.forEach(function (request) {
          var state = Store.status(request), row = el('div', 'approval-summary__row'), head = el('div', 'approval-summary__head');
          head.append(el('b', '', request.round === 'plan' ? 'Kampanjeplan' : 'Annonsemateriell'), el('span', 'badge ' + (state === 'approved' ? 'badge--active' : 'badge--setup'), Store.labels[state]));
          row.append(head, el('p', 'form-hint', request.name + ' · ' + request.email + ' · versjon ' + request.version));
          if (request.answered) row.append(el('p', 'form-hint', 'Svar registrert ' + date(request.answered) + '.'));
          if (request.comment) row.append(el('blockquote', 'approval-comment', request.comment));
          if (state === 'approved') row.append(el('p', 'form-hint', request.round === 'plan' ? (options.ordered ? 'Kampanjeplanen ble godkjent før bestilling.' : 'Planen er godkjent. Bestill kampanjen når dere er klare.') : 'Materiellet er godkjent. Frantz kan følge opp publisering.'));
          if (state === 'superseded') row.append(el('p', 'form-hint', 'Innholdet er endret. Send en ny forespørsel.'));
          var actions = el('div', 'del-panel__knapper'), open = el('a', 'link', 'Se forespørselen'); open.href = url(request); open.target = '_blank'; open.rel = 'noopener'; actions.append(open);
          var prototype = el('details', 'approval-test'), testLabel = disclosureLabel('Test i prototypen'), testLinks = el('div', 'del-panel__knapper'), testEmail = el('a', 'link', 'Se e-posten');
          testEmail.href = url(request, true); testEmail.target = '_blank'; testEmail.rel = 'noopener'; testLinks.append(testEmail); prototype.append(testLabel, testLinks);
          if (state === 'pending') { var revoke = button('Trekk tilbake', 'btn btn--ghost btn--sm'); revoke.addEventListener('click', async function () { revoke.disabled = true; try { await Store.revoke(request.id); } catch (e) { revoke.disabled = false; } await refresh(); }); actions.append(revoke); }
          if (['approved', 'changes', 'expired', 'superseded', 'revoked'].includes(state)) { var again = button('Send ny forespørsel'); again.addEventListener('click', function () { openInline(context, request.round); }); actions.append(again); }
          row.append(actions, prototype); summary.append(row);
        });
        context.renderedSignature = signature;
        if (options.onChange) options.onChange(context.records);
      } catch (e) { summary.hidden = false; summary.textContent = 'Kunne ikke hente godkjenningene. Prøv å laste siden på nytt.'; }
    }
    context.refresh = refresh;
    trigger.addEventListener('click', function () { if (editor.hidden) openInline(context); else closeInline(context); }); refresh();
    return { refresh: refresh, invalidate: async function (content) { await Store.invalidate(options.campaign, content); await refresh(); }, latest: function (round) { return context.records.find(function (item) { return item.round === round; }); } };
  }
  async function closeInline(context) {
    context.editor.hidden = true;
    context.editor.querySelectorAll('input, textarea, button').forEach(function (field) { field.disabled = true; });
    context.trigger.setAttribute('aria-expanded', 'false');
    await context.refresh();
    var target = context.trigger.hidden ? context.summary : context.trigger;
    if (target === context.summary) target.tabIndex = -1;
    target.focus({ preventScroll: true });
  }
  function openInline(context, selectedRound) {
    var options = context.options, round = selectedRound || options.round || options.rounds[0], editor = context.editor;
    editor.replaceChildren(); editor.hidden = false; context.summary.hidden = true;
    context.trigger.setAttribute('aria-expanded', 'true');
    var head = el('div', 'approval-inline__head'), title = el('h3', '', 'Send ' + TITLES[round] + ' til godkjenning'), cancel = button('Avbryt', 'btn btn--ghost btn--sm');
    title.id = editor.id + '-title'; editor.setAttribute('aria-labelledby', title.id); head.append(title, cancel); editor.append(head);
    cancel.addEventListener('click', function () { closeInline(context); });
    var form = el('div', 'approval-form'); form.setAttribute('role', 'group'); form.setAttribute('aria-label', 'Mottaker av godkjenningsforespørselen');
    form.append(el('p', 'form-hint', round === 'plan' ? 'Mottakeren ser budsjett, kanaler og periode. Annonseutkast vises til orientering.' : (options.includeLanding ? 'Alle annonsene og kampanjesiden' : 'Alle annonsene i de valgte kanalene') + ' sendes samlet. Mottakeren kan be om endringer i tilbakemeldingen.'));
    function input(labelText, suffix, type, optional) {
      var group = el('div', 'form-group'), label = el('label', 'form-label', labelText), field = el(type === 'textarea' ? 'textarea' : 'input', type === 'textarea' ? 'form-textarea' : 'form-input');
      label.htmlFor = editor.id + suffix; field.id = label.htmlFor;
      if (type !== 'textarea') field.type = type;
      field.required = !optional; field.autocomplete = 'off'; if (type === 'textarea') field.rows = 3;
      group.append(label, field); return { group: group, field: field };
    }
    var fields = el('div', 'del-panel__to'), name = input('Navn på den som skal godkjenne', '-name', 'text'), email = input('E-postadresse', '-email', 'email');
    fields.append(name.group, email.group); form.append(fields);
    var previous = context.records.find(function (item) { return item.round === round; });
    if (previous) { name.field.value = previous.name; email.field.value = previous.email; }
    var message = input('Melding (valgfritt)', '-message', 'textarea', true), messageDetails = el('details', 'approval-message');
    messageDetails.append(disclosureLabel('Legg til en melding'), message.group); form.append(messageDetails);
    var error = el('p', 'del-panel__feil'); error.hidden = true; error.setAttribute('role', 'alert'); form.append(error);
    var actions = el('div', 'approval-inline__actions'), send = button('Send forespørsel', 'btn btn--primary');
    actions.append(send, el('span', 'form-hint', 'Ingen innlogging for mottakeren.')); form.append(actions); editor.append(form);
    var prototype = el('details', 'approval-test'); prototype.append(disclosureLabel('Om prototypen'), el('p', 'form-hint', 'E-postsending simuleres. Lenken og materiellet kan testes i samme nettleser.')); editor.append(prototype);
    async function submit() {
      error.hidden = true;
      if (!name.field.value.trim()) name.field.setCustomValidity('Skriv navnet på den som skal godkjenne.');
      if (!name.field.reportValidity() || !email.field.reportValidity()) return;
      send.disabled = true;
      try {
        var content = await options.readContent(round);
        if (round === 'material' && !(content.ads && content.ads.length) && (!content.material || content.material.modus === 'hjelp' || !content.material.bilde)) throw new Error('material-unavailable');
        await Store.create({ campaign: options.campaign, round: round, name: name.field.value, email: email.field.value, message: message.field.value, sender: options.sender, company: options.company, content: content });
        editor.hidden = true; editor.querySelectorAll('input, textarea, button').forEach(function (field) { field.disabled = true; });
        context.trigger.setAttribute('aria-expanded', 'false'); await context.refresh();
        context.summary.tabIndex = -1; context.summary.focus({ preventScroll: true });
      } catch (e) {
        error.hidden = false; error.textContent = e.message === 'material-unavailable' ? 'Ferdig annonsemateriell mangler. Legg ved annonsene før du sender dem til godkjenning.' : 'Kunne ikke opprette forespørselen. Kontroller opplysningene og prøv igjen.';
      } finally { send.disabled = false; }
    }
    send.addEventListener('click', submit);
    form.addEventListener('keydown', function (event) { if (event.key === 'Enter' && event.target.tagName === 'INPUT') { event.preventDefault(); submit(); } });
    name.field.addEventListener('input', function () { name.field.setCustomValidity(''); });
    editor.scrollIntoView({ block: 'nearest' }); name.field.focus({ preventScroll: true });
  }
  // These existing demo campaigns have explicitly labelled example material.
  document.querySelectorAll('[data-del-godkjenning]').forEach(function (trigger) {
    var panel = document.getElementById(trigger.dataset.delGodkjenning); if (!panel) return; panel.hidden = true;
    var data = panel.dataset;
    attach(trigger, { campaign: data.id, rounds: ['material'], round: 'material', host: panel, includeLanding: true, sender: data.fra, company: data.firma,
      onChange: function (records) {
        var approvalButton = document.getElementById('approve-campaign-material');
        if (!approvalButton) return;
        var latest = records.find(function (item) { return item.round === 'material'; });
        var state = latest && Store.status(latest);
        approvalButton.disabled = !!latest && !['approved', 'revoked'].includes(state);
        if (!document.getElementById('material-customer-status').hidden) approvalButton.disabled = true;
        approvalButton.textContent = state === 'approved' ? 'Gi Frantz klarsignal' : 'Godkjenn annonsene';
      },
      readContent: function () {
        var ads = Array.from(document.querySelectorAll('.ad-card a[href*="annonse.html"]')).map(function (link) {
          var values = new URL(link.href).searchParams;
          return { name: values.get('navn'), channel: values.get('kanal'), type: values.get('type'),
            material: { avsender: data.arbeidsgiver, modus: 'bygg', tittel: '«' + values.get('navn') + '»', tekst: 'Vi søker deg som vil gjøre en forskjell hver dag. Fast stilling, gode vilkår og et fagmiljø som tar vare på hverandre.', knapp: 'Søk nå', demoOnly: true, demoType: values.get('type'), utseende: { bg: 'var(--color-navy)', tekst: 'var(--text-on-dark)' } }
          };
        });
        return { title: data.tittel, employer: data.arbeidsgiver, location: data.sted, period: data.periode, budget: Number(data.budsjett), extras: 0, channels: data.kanaler.split(',').map(function (name) { return name.trim(); }), example: true, ads: ads,
          landing: { title: data.tittel + ' i ' + data.sted, body: 'Vi søker ' + data.tittel.toLowerCase() + ' til ' + data.arbeidsgiver + '. Les om arbeidsplassen og stillingen før du søker.', employer: data.arbeidsgiver }
        };
      }
    });
  });
  function refreshAll() { attachments.forEach(function (context) { context.refresh(); }); }
  root.addEventListener('frantz:approval-change', refreshAll);
  root.addEventListener('storage', function (event) { if (event.key === 'fzApprovalChanged') refreshAll(); });
  root.addEventListener('focus', refreshAll);
  root.FrantzApprovalShare = { attach: attach };
})(window);
