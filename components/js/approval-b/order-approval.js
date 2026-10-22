/* A reply may arrive after ordering. It describes the shared snapshot and never amends the order. */
(function (root) {
  'use strict';
  function mount(order, record) {
    var $ = function (id) { return document.getElementById(id); }, latestRender = 0;
    var time = function (value) { return new Date(value).toLocaleString('nb-NO', { dateStyle: 'short', timeStyle: 'short', timeZone: 'Europe/Oslo' }); };
    async function refresh() {
      var renderId = ++latestRender, request;
      try { request = order.approvalId ? await FrantzApprovals.read(order.approvalId) : null; }
      catch (e) { $('order-approval-row').hidden = false; $('order-approval-copy').textContent = 'Kunne ikke hente godkjenningsstatus. Bestillingen er mottatt.'; return; }
      if (renderId !== latestRender) return;
      var state = request && FrantzApprovals.status(request), combined = request && FrantzApprovalRules.clearsMaterial(request, state);
      $('order-approval-row').hidden = !request;
      if (request) {
        var copy = $('order-approval-copy'); copy.replaceChildren();
        var label = document.createElement('span');
        label.textContent = state === 'approved' ? (combined ? 'Plan og annonser godkjent av ' : 'Plan godkjent av ') + request.name + ' · ' + time(request.answered)
          : state === 'pending' ? 'Venter på svar fra ' + request.name + '. Kampanjen er bestilt.'
          : state === 'changes' ? request.name + ' har bedt om endringer. Bestillingen er uendret. Avtal eventuelle endringer med Frantz.'
          : state === 'expired' ? 'Lenken har utløpt. Kampanjen er bestilt.'
          : state === 'revoked' ? 'Forespørselen er trukket tilbake. Kampanjen er bestilt.'
          : 'Forespørselen gjelder en tidligere utgave. Bestillingen er uendret.';
        copy.append(label);
        if (request.comment) { var comment = document.createElement('blockquote'); comment.className = 'approval-comment'; comment.textContent = request.comment; copy.append(comment); }
        if (['pending', 'approved', 'changes'].includes(state)) {
          var link = document.createElement('a'); link.className = 'link'; link.href = 'godkjenning-approval-b.html?request=' + encodeURIComponent(request.id); link.target = '_blank'; link.rel = 'noopener'; link.textContent = 'Se forespørselen'; copy.append(document.createElement('br'), link);
        }
      }
      if (record.materiell.modus === 'hjelp') return;
      $('status-alert').textContent = 'Frantz har fått bestillingen og annonsen. Martin Karlsen følger opp oppsett og publisering.';
      $('material-status').textContent = combined ? 'Innsendt · godkjenning registrert' : 'Innsendt ved bestilling';
      $('material-explanation').textContent = combined ? 'Dette er annonsen som er godkjent sammen med planen. Frantz sjekker oppsettet før publisering.' : state === 'pending' ? 'Annonsen er sendt inn. Forespørselen er fortsatt åpen, og svaret vises her når det kommer.' : 'Dette er annonsen og originalfilene dere sendte inn. Frantz ber om godkjenning hvis annonsen må endres.';
      var check = $('ordered-next-approval').closest('li');
      check.className = state === 'pending' || state === 'changes' ? 'mangler' : 'er-ok';
      check.querySelector('.sr-only').textContent = check.className === 'mangler' ? 'Gjenstår: ' : 'Fullført: ';
      check.querySelector('.icon-lucide').className = 'icon-lucide ' + (check.className === 'mangler' ? 'icon-lucide--clock' : 'icon-lucide--circle-check');
      $('ordered-preparation').textContent = 'Frantz sjekker annonsen og setter opp målrettingen';
      $('ordered-next-approval').textContent = combined ? 'Annonsen er godkjent' : state === 'pending' ? 'Godkjenningsforespørselen venter på svar' : state === 'changes' ? 'Tilbakemeldingen må følges opp' : 'Annonsen er levert sammen med bestillingen';
      $('ordered-next-approval-hint').textContent = combined ? 'Ingen ny forespørsel så lenge annonsen er uendret.' : state === 'pending' ? 'Bestillingen er mottatt. Svaret registreres når det kommer.' : state === 'changes' ? 'Bestillingen er uendret. Avtal eventuelle endringer med Frantz.' : 'Frantz ber om godkjenning hvis annonsen må endres.';
    }
    root.addEventListener('focus', refresh);
    root.addEventListener('frantz:approval-change', refresh);
    root.addEventListener('storage', function (event) { if (event.key === 'fzApprovalBChanged') refresh(); });
    refresh();
  }
  root.FrantzOrderApproval = { mount: mount };
})(window);
