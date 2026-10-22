/* The URL only identifies a stored snapshot. Opening a link never submits an approval. */
(function () {
  'use strict';
  var Store = window.FrantzApprovals, params = new URLSearchParams(location.search), requestId = params.get('request'), current, renderedId, expiryTimer;
  var $ = function (id) { return document.getElementById(id); };
  var money = function (n) { return 'kr ' + Math.round(Number(n) || 0).toLocaleString('nb-NO').replace(/[\u00a0\u202f]/g, ' '); };
  var date = function (value) { return new Date(value).toLocaleString('nb-NO', { dateStyle: 'short', timeStyle: 'short', timeZone: 'Europe/Oslo' }); };
  function unavailable(state) {
    $('approval-review').hidden = true; $('approval-email').hidden = true; $('approval-unavailable').hidden = false;
    var copy = {
      missing: ['Lenken er ikke tilgjengelig', 'Be avsenderen om en ny forespørsel. I prototypen må lenken åpnes i samme nettleser som den ble laget i.'],
      expired: ['Lenken har utløpt', 'Be avsenderen om en ny godkjenningsforespørsel.'],
      revoked: ['Forespørselen er trukket tilbake', 'Avsenderen har trukket tilbake forespørselen. Du kan ikke lenger svare.'],
      superseded: ['Denne forespørselen er erstattet', 'Innholdet er endret. Bruk lenken i den nyeste forespørselen, eller be avsenderen sende en ny.'],
      storage: ['Kunne ikke åpne forespørselen', 'Prøv å laste siden på nytt. Svaret ditt er ikke registrert.']
    }[state];
    $('unavailable-title').textContent = copy[0]; $('unavailable-text').textContent = copy[1];
  }
  function render(request) {
    clearTimeout(expiryTimer); current = request;
    var state = Store.status(request);
    if (['missing', 'expired', 'revoked', 'superseded'].includes(state)) { unavailable(state); return; }
    var content = request.content, plan = request.round === 'plan', combined = plan && FrantzApprovalRules.includesMaterial(content), what = combined ? 'planen og annonsene' : plan ? 'kampanjeplanen' : 'annonsene';
    document.title = 'Godkjenn ' + what + ': ' + content.title + ' — Frantz';
    $('approval-unavailable').hidden = true;
    var design = plan && content.material && content.material.modus === 'hjelp', designNote = 'Design fra Frantz kommer i tillegg, fra kr 2 180 / time. Tidsbruk må avtales med Frantz.';
    $('email-design-note').hidden = !design; $('email-design-note').textContent = designNote;
    $('plan-design-note').hidden = !design; $('plan-design-note').textContent = designNote;
    if (params.get('email') === '1') {
      $('approval-email').hidden = false; $('approval-review').hidden = true;
      $('email-summary').textContent = money(Number(content.budget) + Number(content.extras || 0)) + ' eks. mva · ' + content.period + ' · ' + content.channels.join(', ');
      $('email-to').textContent = 'Til: ' + request.name + ' · ' + request.email;
      $('email-title').textContent = request.sender + ' ber deg godkjenne ' + what;
      $('email-greeting').textContent = 'Hei, ' + request.name + '.';
      $('email-copy').textContent = request.sender + ' i ' + request.company + ' ber deg se over ' + what + ' for «' + content.title + '». ' + (plan ? 'Godkjenningen gjelder budsjett, kanaler og periode.' + (combined ? ' Annonsene i forhåndsvisningen inngår også.' : '') : 'Godkjenningen gjelder annonsene og eventuell kampanjeside i forespørselen.');
      $('email-message').hidden = !request.message; $('email-message').textContent = request.message;
      var link = new URL(location.href); link.searchParams.delete('email'); $('email-open').href = link.href; $('email-open').textContent = 'Se og godkjenn ' + what;
      return;
    }
    $('approval-email').hidden = true; $('approval-review').hidden = false;
    $('request-status').textContent = Store.labels[state]; $('request-status').className = 'badge ' + (state === 'approved' ? 'badge--active' : 'badge--setup');
    $('request-title').textContent = 'Godkjenn ' + what;
    $('request-intro').textContent = request.sender + ' i ' + request.company + ' ber deg se over «' + content.title + '». ' + (plan ? 'Se over budsjett, kanaler og kampanjeperiode.' : 'Se gjennom annonsene i hver kanal og alle formatene.');
    $('request-recipient').textContent = 'Til ' + request.name + ' · ' + request.email;
    $('request-expiry').textContent = 'Sendt ' + date(request.created) + ' · gyldig til ' + date(request.expires);
    $('request-message').hidden = !request.message; $('request-message').textContent = request.message;
    $('request-plan').hidden = !plan;
    $('plan-package-row').hidden = !content.packageName; $('plan-package').textContent = content.packageName || '';
    $('plan-forecast-row').hidden = !content.forecast; $('plan-forecast').textContent = content.forecast ? content.forecast + ' · estimat, ikke en garanti' : '';
    $('plan-job').textContent = content.title; $('plan-period').textContent = content.period;
    // Empty rows look unfinished to the approver, so they are left out.
    $('plan-employer').textContent = content.employer || ''; $('plan-employer').parentElement.hidden = !content.employer;
    $('plan-location').textContent = content.location || ''; $('plan-location').parentElement.hidden = !content.location;
    FZ_KANALER.tegn($('plan-channels'), content.channels); $('plan-budget').textContent = money(content.budget); $('plan-extras-row').hidden = !content.extras; $('plan-extras').textContent = money(content.extras); $('plan-total').textContent = money(Number(content.budget) + Number(content.extras || 0));
    $('ads-status').textContent = plan && !combined ? 'Utkast · til orientering' : 'Til godkjenning';
    $('ads-hint').textContent = combined ? 'Både planen og annonsene nedenfor inngår i denne godkjenningen. Du får ingen ny forespørsel om uendret materiell.' : plan ? 'Du godkjenner kampanjeplanen nå. Ferdige annonser godkjennes i en egen runde før publisering.' : 'Godkjenningen gjelder alt materiellet i denne forespørselen, på tvers av kanaler og formater.';
    if (content.ads && content.ads.length) {
      $('ads-hint').textContent = 'Alle ' + content.ads.length + ' annonser nedenfor inngår i forespørselen. Hvis noe må endres, skriv hvilken annonse det gjelder i tilbakemeldingen.';
      $('change-comment').placeholder = 'F.eks. I «' + content.ads[Math.min(1, content.ads.length - 1)].name + '» vil vi endre …';
    }
    if (content.example) $('ads-hint').textContent += ' Dette er eksempelinnhold i prototypen.';
    if (renderedId !== request.id) { window.FrantzApprovalPreview.mount($('request-preview'), content); renderedId = request.id; }
    var hasPreview = !!(content.ads && content.ads.length || content.material && content.material.bilde && content.material.modus !== 'hjelp');
    $('review-ads-link').hidden = !hasPreview;
    $('review-ads-link').textContent = state === 'pending' ? 'Se annonsene før du svarer ↓' : 'Se annonsene i forespørselen ↓';
    var back = $('request-ads').querySelector('.approval-jump');
    back.href = state === 'pending' ? '#request-response' : '#request-receipt'; back.textContent = state === 'pending' ? 'Tilbake til svaret ditt ↑' : 'Tilbake til bekreftelsen ↑';
    if (state === 'approved' && (!plan || combined)) { $('ads-status').textContent = 'Godkjent'; $('ads-status').className = 'badge badge--active'; } $('request-ads').hidden = !hasPreview;
    $('request-landing').hidden = (plan && !combined) || !content.landing;
    if (content.landing) { $('landing-employer').textContent = content.landing.employer || content.employer; $('landing-heading').textContent = content.landing.title; $('landing-body').textContent = content.landing.body; }
    $('request-response').hidden = state !== 'pending'; $('request-receipt').hidden = state === 'pending';
    $('response-effect').textContent = combined ? 'Du godkjenner både kampanjeplanen og annonsene nedenfor. Bestillingen sendes av ' + request.sender + ' i portalen, uavhengig av svaret ditt. Frantz sjekker oppsettet før publisering.' : plan ? 'Du godkjenner planen som vises her. Godkjenningen sender ikke bestillingen. ' + request.sender + ' kan bestille uavhengig av svaret ditt.' : 'Du godkjenner materiellet som vises her. Frantz følger opp publisering etterpå.';
    $('approve-request').textContent = 'Godkjenn ' + what;
    if (state === 'approved' || state === 'changes') {
      $('receipt-title').textContent = state === 'approved' ? 'Takk! Du har godkjent ' + what + '.' : 'Endringsønsket er registrert';
      $('receipt-body').textContent = state === 'approved' ? 'Avsenderen kan se svaret i portalen. ' + (plan ? 'Godkjenningen sender ingen bestilling. Avsenderen håndterer bestillingen i portalen.' : 'Frantz kontrollerer oppsettet før kampanjen publiseres.') : 'Avsenderen kan se kommentaren din i portalen. Svaret endrer ingen bestilling. Avsenderen følger opp eventuelle endringer.';
      $('receipt-time').textContent = 'Registrert ' + date(request.answered) + ' fra lenken sendt til ' + request.email + '.';
      $('receipt-comment').hidden = !request.comment; $('receipt-comment').textContent = request.comment;
    }
    if (state === 'pending') expiryTimer = setTimeout(load, Math.max(0, Date.parse(request.expires) - Date.now()) + 50);
  }
  async function load() {
    try { render(requestId ? await Store.read(requestId) : null); }
    catch (e) { unavailable('storage'); }
    finally { $('approval-loading').hidden = true; }
  }
  async function respond(state) {
    $('response-error').hidden = true;
    var comment = $('change-comment').value.trim();
    if (state === 'changes' && !comment) { $('response-error').hidden = false; $('response-error').textContent = 'Skriv hva som må endres.'; $('change-comment').focus(); return; }
    var buttons = $('request-response').querySelectorAll('button'); buttons.forEach(function (button) { button.disabled = true; });
    try { var saved = await Store.respond(requestId, state, comment); render(saved); $('receipt-title').focus(); }
    catch (e) {
      if (e.message === 'closed') await load();
      else { $('response-error').hidden = false; $('response-error').textContent = 'Kunne ikke lagre svaret. Prøv igjen. Svaret er ikke registrert.'; }
    } finally { buttons.forEach(function (button) { button.disabled = false; }); }
  }
  $('approve-request').addEventListener('click', function () { respond('approved'); });
  $('request-change').addEventListener('click', function () { var open = $('change-form').hidden; $('change-form').hidden = !open; $('request-change').setAttribute('aria-expanded', String(open)); if (open) $('change-comment').focus(); });
  $('change-form').addEventListener('submit', function (event) { event.preventDefault(); respond('changes'); });
  window.addEventListener('storage', function (event) { if (event.key === 'fzApprovalBChanged') load(); });
  window.addEventListener('focus', load);
  window.addEventListener('pagehide', function () { clearTimeout(expiryTimer); });
  load();
})();
