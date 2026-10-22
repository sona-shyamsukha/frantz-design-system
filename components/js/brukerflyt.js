/* Brukerflyt: the demo shows two kinds of user.
   ?bruker=ny            a new customer. No campaigns yet, no Connect, the pages explain more.
   ?bruker=eksisterende  Kari at Nordlys Rekruttering AS, with history and Connect. This is the default.
   The choice is kept for the rest of the visit (this browser tab).
   Load it in <head>, so the page never flashes the wrong flow.

   In the HTML:
   data-vis="ny"            shows only to a new customer
   data-vis="eksisterende"  shows only to an existing customer */
(function () {
  var NOKKEL = 'fzBruker';
  var fraUrl = new URLSearchParams(location.search).get('bruker');
  var verdi = null;
  if (fraUrl === 'ny' || fraUrl === 'eksisterende') {
    verdi = fraUrl;
    try { sessionStorage.setItem(NOKKEL, verdi); } catch (e) {}
  } else {
    try { verdi = sessionStorage.getItem(NOKKEL); } catch (e) {}
  }
  if (verdi !== 'ny') verdi = 'eksisterende';
  var ny = verdi === 'ny';
  document.documentElement.setAttribute('data-bruker', verdi);

  var css = document.createElement('style');
  css.textContent =
    'html[data-bruker="ny"] [data-vis="eksisterende"],' +
    'html[data-bruker="eksisterende"] [data-vis="ny"] { display: none !important; }' +
    // Connect is only for some customers. A new customer does not have it.
    'html[data-bruker="ny"] .nav__item[href="connect.html"] { display: none !important; }' +
    '.flytbytte { display: inline-flex; align-items: center; gap: var(--space-6); margin-right: auto; padding: var(--space-4) var(--space-12);' +
    ' border: 1px dashed var(--border-strong); border-radius: var(--radius-full); color: var(--text-muted); font-size: var(--text-xs); text-decoration: none; }' +
    '.flytbytte:hover { color: var(--text-heading); border-color: var(--text-heading); }' +
    '.flytbytte b { color: var(--text-heading); }';
  document.head.appendChild(css);

  function lenke(til) { return location.pathname.split('/').pop() + '?bruker=' + til; }

  window.FZ_BRUKER = { ny: ny, harConnect: !ny, verdi: verdi, lenke: lenke };

  // Connect belongs only to the existing-customer demo, including direct links.
  if (ny && /^connect(?:-detalj(?:-uten-kampanje)?)?\.html$/.test(location.pathname.split('/').pop())) {
    location.replace('dashboard.html?bruker=ny');
    return;
  }

  // A small demo switch in the top bar, so you can flip between the two flows on any page
  document.addEventListener('DOMContentLoaded', function () {
    var topbar = document.querySelector('.topbar');
    if (!topbar) return;
    var a = document.createElement('a');
    a.className = 'flytbytte';
    a.href = lenke(ny ? 'eksisterende' : 'ny');
    a.innerHTML = '<span class="icon-lucide icon-lucide--users" aria-hidden="true"></span>Demo: <b>' + (ny ? 'Ny kunde' : 'Eksisterende kunde') + '</b> · Bytt';
    a.title = 'Bytt mellom flyten for ny og eksisterende kunde';
    topbar.insertBefore(a, topbar.firstChild);
    // The desktop top bar is hidden on phones; keep the demo switch in the menu.
    var nav = document.querySelector('.rail .nav');
    if (nav) {
      var mobil = a.cloneNode(true);
      mobil.classList.add('flytbytte--mobil');
      nav.insertAdjacentElement('afterend', mobil);
    }
  });
})();
