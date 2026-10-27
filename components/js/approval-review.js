/* The URL only identifies a stored snapshot. Opening a link never submits an approval. */
(function () {
  'use strict';
  var Store = window.FrantzApprovals, params = new URLSearchParams(location.search), requestId = params.get('request'), current, renderedId, expiryTimer;
  var $ = function (id) { return document.getElementById(id); };
  var responseSections = Array.from(document.querySelectorAll('[data-approval-response]'));
  var submitting = false;
  var money = function (n) { return Math.round(Number(n) || 0).toLocaleString('nb-NO') + ' kr'; };
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
    var content = request.content, plan = request.round === 'plan', what = plan ? 'kampanjeplanen' : 'annonsemateriellet';
    document.title = 'Godkjenn ' + what + ': ' + content.title + ' — Frantz';
    $('approval-unavailable').hidden = true;
    if (params.get('email') === '1') {
      $('approval-email').hidden = false; $('approval-review').hidden = true;
      $('email-to').textContent = 'Til: ' + request.name + ' · ' + request.email;
      $('email-title').textContent = request.sender + ' ber deg godkjenne ' + what;
      $('email-greeting').textContent = 'Hei, ' + request.name + '.';
      $('email-copy').textContent = request.sender + ' i ' + request.company + ' ber deg se over ' + what + ' for «' + content.title + '». ' + (plan ? 'Godkjenningen gjelder budsjett, kanaler og periode.' : 'Godkjenningen gjelder annonsene og eventuell kampanjeside i forespørselen.');
      $('email-message').hidden = !request.message; $('email-message').textContent = request.message;
      var link = new URL(location.href); link.searchParams.delete('email'); $('email-open').href = link.href; $('email-open').textContent = 'Se og godkjenn ' + what;
      return;
    }
    $('approval-email').hidden = true; $('approval-review').hidden = false;
    $('request-status').textContent = Store.labels[state]; $('request-status').className = 'badge ' + (state === 'approved' ? 'badge--active' : 'badge--setup');
    $('request-title').textContent = 'Godkjenn ' + what;
    $('request-intro').textContent = request.sender + ' i ' + request.company + ' ber deg se over «' + content.title + '». ' + (plan ? 'Se over budsjett, kanaler og kampanjeperiode.' : 'Se gjennom annonsene i hver kanal og alle formatene.');
    $('request-recipient').textContent = 'Til ' + request.name + ' · ' + request.email;
    $('request-expiry').textContent = 'Versjon ' + request.version + ' · lenken er gyldig til ' + date(request.expires);
    $('request-message').hidden = !request.message; $('request-message').textContent = request.message;
    $('request-plan').hidden = !plan;
    $('plan-job').textContent = content.title; $('plan-period').textContent = content.period;
    // Empty rows look unfinished to the approver, so they are left out.
    $('plan-employer').textContent = content.employer || ''; $('plan-employer').parentElement.hidden = !content.employer;
    $('plan-location').textContent = content.location || ''; $('plan-location').parentElement.hidden = !content.location;
    FZ_KANALER.tegn($('plan-channels'), content.channels); $('plan-budget').textContent = money(content.budget); $('plan-extras-row').hidden = !content.extras; $('plan-extras').textContent = money(content.extras); $('plan-total').textContent = money(Number(content.budget) + Number(content.extras || 0));
    $('ads-status').textContent = plan ? 'Utkast · til orientering' : 'Til godkjenning · versjon ' + request.version;
    $('ads-hint').textContent = plan ? 'Du godkjenner kampanjeplanen nå. Ferdige annonser godkjennes i en egen runde før publisering.' : 'Godkjenningen gjelder alt materiellet i denne forespørselen, på tvers av kanaler og formater.';
    if (content.ads && content.ads.length) {
      $('ads-hint').textContent = 'Alle ' + content.ads.length + ' annonser nedenfor inngår i forespørselen. Hvis noe må endres, skriv hvilken annonse det gjelder i tilbakemeldingen.';
      responseSections.forEach(function (section) { section.querySelector('[data-change-comment]').placeholder = 'F.eks. I «' + content.ads[Math.min(1, content.ads.length - 1)].name + '» vil vi endre …'; });
    }
    if (content.example) $('ads-hint').textContent += ' Dette er eksempelinnhold i prototypen.';
    if (renderedId !== request.id) { window.FrantzApprovalPreview.mount($('request-preview'), content); renderedId = request.id; }
    $('request-landing').hidden = plan || !content.landing;
    if (content.landing) { $('landing-employer').textContent = content.landing.employer || content.employer; $('landing-heading').textContent = content.landing.title; $('landing-body').textContent = content.landing.body; }
    responseSections.forEach(function (section) {
      section.hidden = state !== 'pending';
      section.querySelector('[data-response-effect]').textContent = plan ? 'Du godkjenner planen som vises her. Godkjenningen sender ikke bestillingen. ' + request.sender + ' bestiller i et eget steg.' : 'Du godkjenner materiellet som vises her. Frantz følger opp publisering etterpå.';
      section.querySelector('[data-approve-request]').textContent = 'Godkjenn ' + what;
    });
    $('request-receipt').hidden = state === 'pending';
    if (state === 'approved' || state === 'changes') {
      $('receipt-title').textContent = state === 'approved' ? 'Takk! Du har godkjent ' + what + '.' : 'Endringsønsket er registrert';
      $('receipt-body').textContent = state === 'approved' ? 'Godkjenningen gjelder versjon ' + request.version + '. Avsenderen kan se svaret i portalen.' : 'Avsenderen kan se kommentaren din i portalen. Du får en ny forespørsel når innholdet er endret.';
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
  async function respond(state, section) {
    if (submitting) return;
    var error = section.querySelector('[data-response-error]'), field = section.querySelector('[data-change-comment]');
    error.hidden = true;
    var comment = field.value.trim();
    if (state === 'changes' && !comment) { error.hidden = false; error.textContent = 'Skriv hva som må endres.'; field.focus(); return; }
    submitting = true;
    var buttons = document.querySelectorAll('[data-approval-response] button'); buttons.forEach(function (button) { button.disabled = true; });
    try { var saved = await Store.respond(requestId, state, comment); render(saved); $('receipt-title').focus(); }
    catch (e) {
      if (e.message === 'closed') await load();
      else { error.hidden = false; error.textContent = 'Kunne ikke lagre svaret. Prøv igjen. Svaret er ikke registrert.'; }
    } finally { submitting = false; buttons.forEach(function (button) { button.disabled = false; }); }
  }
  responseSections.forEach(function (section) {
    var change = section.querySelector('[data-request-change]'), form = section.querySelector('[data-change-form]');
    section.querySelector('[data-approve-request]').addEventListener('click', function () { respond('approved', section); });
    change.addEventListener('click', function () { var open = form.hidden; form.hidden = !open; change.setAttribute('aria-expanded', String(open)); if (open) section.querySelector('[data-change-comment]').focus(); });
    form.addEventListener('submit', function (event) { event.preventDefault(); respond('changes', section); });
  });
  window.addEventListener('storage', function (event) { if (event.key === 'fzApprovalChanged') load(); });
  window.addEventListener('focus', load);
  window.addEventListener('pagehide', function () { clearTimeout(expiryTimer); });
  load();
})();
