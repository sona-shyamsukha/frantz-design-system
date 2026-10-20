/* «Del for godkjenning». A free-standing share link (design review 20.10.2026).
   Works in every status: a draft, a campaign Frantz has set up, or an active one in a new round.
   The user picks what to approve: the campaign plan, the ads, the campaign page, or some of them.
   The person who gets the link does not log in. Sharing does not change the campaign status.

   Markup:
     <button type="button" class="btn btn--secondary" data-del-godkjenning="del-panel-1"
       aria-expanded="false" aria-controls="del-panel-1">Del for godkjenning</button>
     <div class="del-panel" id="del-panel-1" hidden
       data-deler="plan annonser side" data-valgt="annonser side"
       data-id="129072" data-status="setup" data-tittel="Helsefagarbeider" data-sted="Tromsø" …></div>
   Every other data-* value on the panel goes into the link as it is. */
(function () {
  var NAVN = {
    plan: ['Kampanjeplanen', 'Budsjett, periode og kanaler'],
    annonser: ['Annonsene', 'Slik annonsene ser ut i hver kanal'],
    side: ['Kampanjesiden', 'Siden søkerne kommer til']
  };
  var EGNE = ['deler', 'valgt'];
  var teller = 0;

  function el(tag, klasse, tekst) {
    var e = document.createElement(tag);
    if (klasse) e.className = klasse;
    if (tekst) e.textContent = tekst;
    return e;
  }
  function ikon(navn) { var i = el('span', 'icon-lucide icon-lucide--' + navn); i.setAttribute('aria-hidden', 'true'); return i; }
  function knapp(klasse, ikonNavn, tekst) {
    var b = el('button', klasse); b.type = 'button';
    if (ikonNavn) b.appendChild(ikon(ikonNavn));
    b.appendChild(document.createTextNode((ikonNavn ? ' ' : '') + tekst));
    return b;
  }
  function liste(navn) { return navn.length > 1 ? navn.slice(0, -1).join(', ') + ' og ' + navn[navn.length - 1] : navn[0]; }

  function bygg(panel) {
    var n = ++teller;
    var deler = (panel.dataset.deler || 'plan annonser').split(/\s+/).filter(function (d) { return NAVN[d]; });
    var valgt = (panel.dataset.valgt || deler.join(' ')).split(/\s+/);
    panel.textContent = '';

    panel.appendChild(el('h3', 'del-panel__tittel', 'Del for godkjenning'));
    panel.appendChild(el('p', 'del-panel__tekst', 'Send en lenke til den som skal godkjenne, for eksempel en leder eller kunden deres. De trenger ikke logge inn.'));

    var felt = el('fieldset', 'del-panel__deler');
    felt.appendChild(el('legend', 'form-label', 'Hva skal godkjennes?'));
    deler.forEach(function (d) {
      var lbl = el('label', 'form-check');
      var inp = el('input', 'form-check__input'); inp.type = 'checkbox'; inp.value = d; inp.checked = valgt.indexOf(d) !== -1;
      var tekst = el('span', 'form-check__label');
      tekst.appendChild(el('b', null, NAVN[d][0]));
      tekst.appendChild(el('small', null, NAVN[d][1]));
      lbl.appendChild(inp); lbl.appendChild(el('span', 'form-check__box')); lbl.lastChild.setAttribute('aria-hidden', 'true'); lbl.appendChild(tekst);
      felt.appendChild(lbl);
    });
    panel.appendChild(felt);

    var to = el('div', 'del-panel__to');
    function inn(id, etikett, type, auto) {
      var g = el('div', 'form-group');
      var l = el('label', 'form-label', etikett); l.htmlFor = id;
      l.appendChild(el('span', 'valgfri', ' (valgfritt)'));
      var i = el('input', 'form-input'); i.id = id; i.type = type; i.autocomplete = auto;
      g.appendChild(l); g.appendChild(i); to.appendChild(g);
      return i;
    }
    var navn = inn('del-navn-' + n, 'Hvem skal godkjenne?', 'text', 'off');
    var epost = inn('del-epost-' + n, 'E-posten deres', 'email', 'off');
    panel.appendChild(to);

    var feil = el('p', 'feil del-panel__feil'); feil.setAttribute('role', 'alert'); feil.hidden = true;
    panel.appendChild(feil);
    var lag = knapp('btn btn--primary btn--sm del-panel__lag', 'link', 'Lag lenke');
    panel.appendChild(lag);

    var resultat = el('div', 'del-panel__resultat'); resultat.hidden = true;
    var lenke = el('code', 'del-panel__lenke');
    var rad = el('div', 'del-panel__knapper');
    var kopier = knapp('btn btn--secondary btn--sm', 'copy', 'Kopier lenke');
    var se = el('a', 'btn btn--ghost btn--sm', 'Se siden'); se.target = '_blank'; se.rel = 'noopener';
    se.appendChild(el('span', 'chat__sr', ' (åpnes i ny fane)'));
    var send = el('a', 'link link--xs', 'Send på e-post');
    rad.appendChild(kopier); rad.appendChild(se); rad.appendChild(send);
    resultat.appendChild(lenke); resultat.appendChild(rad);
    resultat.appendChild(el('p', 'form-hint del-panel__merk', 'Lenken endrer ikke status på kampanjen. Du får beskjed når de har svart.'));
    var status = el('p', 'chat__sr'); status.setAttribute('role', 'status');
    resultat.appendChild(status);
    panel.appendChild(resultat);

    function valgte() { return Array.prototype.filter.call(felt.querySelectorAll('input'), function (i) { return i.checked; }).map(function (i) { return i.value; }); }
    function lagLenke() {
      var d = valgte();
      if (!d.length) { feil.textContent = 'Velg minst én ting som skal godkjennes.'; feil.hidden = false; felt.querySelector('input').focus(); return; }
      feil.hidden = true;
      var q = { deler: d.join(','), til: navn.value.trim() };
      Object.keys(panel.dataset).forEach(function (k) { if (EGNE.indexOf(k) === -1) q[k] = panel.dataset[k]; });
      var url = 'godkjenning.html?' + Object.keys(q).filter(function (k) { return q[k]; }).map(function (k) { return k + '=' + encodeURIComponent(q[k]); }).join('&');
      var full = location.href.replace(/[?#].*$/, '').replace(/[^\/]*$/, '') + url;
      var hva = liste(d.map(function (x) { return NAVN[x][0].toLowerCase(); }));
      // A real link is short: one ID per share. The demo carries the values in the address, so copy and open use that.
      lenke.textContent = 'frantz.no/godkjenn/' + (panel.dataset.id || 'ny') + '-' + Math.random().toString(36).slice(2, 6);
      lenke.dataset.full = full;
      se.href = url;
      send.href = 'mailto:' + encodeURIComponent(epost.value.trim()) + '?subject=' + encodeURIComponent('Kan du godkjenne ' + hva + '? ' + (panel.dataset.tittel || '')) +
        '&body=' + encodeURIComponent('Hei' + (navn.value.trim() ? ' ' + navn.value.trim().split(/\s+/)[0] : '') + '!\n\nKan du se over ' + hva + ', og svare med «Godkjenn» eller «Be om endring»?\n\n' + full + '\n\nDu trenger ikke logge inn.\n\nHilsen ' + (panel.dataset.fra || 'Kari Hansen').split(/\s+/)[0]);
      resultat.hidden = false;
      lag.lastChild.textContent = ' Lag ny lenke';
      status.textContent = 'Lenken er laget.';
    }
    lag.addEventListener('click', lagLenke);
    felt.addEventListener('change', function () { if (!resultat.hidden) lagLenke(); });
    kopier.addEventListener('click', function () {
      try { navigator.clipboard.writeText(lenke.dataset.full).catch(function () {}); } catch (e) {}
      kopier.lastChild.textContent = ' Kopiert';
      setTimeout(function () { kopier.lastChild.textContent = ' Kopier lenke'; }, 2000);
    });
    panel._fokus = function () { (felt.querySelector('input:checked') || felt.querySelector('input')).focus(); };
  }

  document.addEventListener('click', function (e) {
    var b = e.target.closest('[data-del-godkjenning]');
    if (!b) return;
    var panel = document.getElementById(b.getAttribute('data-del-godkjenning'));
    if (!panel) return;
    if (!panel._bygget) { bygg(panel); panel._bygget = true; }
    var apne = panel.hidden;
    panel.hidden = !apne;
    b.setAttribute('aria-expanded', String(apne));
    if (apne) { panel.scrollIntoView({ block: 'nearest', behavior: 'smooth' }); panel._fokus(); }
  });
})();
