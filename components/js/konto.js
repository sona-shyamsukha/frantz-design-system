/* Konto: adds the notifications bell and the account menu to the portal topbar.
   Your own settings live on Min profil (min-profil.html). The firm's live on Innstillinger. The menu links to both. */
(function () {
  var topbar = document.querySelector('.topbar');
  if (!topbar) return;

  var varsler = [
    { ikon: 'users', tittel: '3 nye interessenter på Sykepleier Oslo', tid: '27.09.2026', href: 'campaign.html', ulest: true },
    { ikon: 'file-text', tittel: 'Ny status fra rådgiver: «Leverer svært bra sammenlignet med lignende kampanjer»', tid: '24.09.2026', href: 'campaign.html', ulest: true },
    { ikon: 'clock', tittel: 'Annonsene for Helsefagarbeider Tromsø er klare. Godkjenn dem innen 02.10.', tid: '29.09.2026', href: 'kampanje-under-arbeid.html', ulest: true },
    { ikon: 'circle-check', tittel: 'Rapporten for Sykepleier Bodø er klar', tid: '31.07.2026', href: 'rapport.html', ulest: false }
  ];

  // A new customer has ordered nothing yet, so there is nothing to tell them about
  if (window.FZ_BRUKER && FZ_BRUKER.ny) varsler = [];

  function lagDrawer(id, tittel, innhold) {
    var d = document.createElement('aside');
    d.className = 'drawer';
    d.id = id;
    d.hidden = true;
    d.setAttribute('role', 'dialog');
    d.setAttribute('aria-modal', 'true');
    d.setAttribute('aria-labelledby', id + '-tittel');
    d.innerHTML =
      '<div class="drawer__head"><h2 class="drawer__title" id="' + id + '-tittel">' + tittel + '</h2>' +
      '<button type="button" class="btn btn--ghost" data-lukk aria-label="Lukk"><span class="icon-lucide icon-lucide--x" aria-hidden="true"></span></button></div>' +
      '<div class="drawer__body">' + innhold + '</div>';
    document.body.appendChild(d);
    return d;
  }

  var varselHtml = function () {
    var innst = '<p style="margin:var(--space-16) 0 0"><a class="link" href="min-profil.html#varsler">Velg hvilke varsler du får på e-post</a></p>';
    if (!varsler.length) return '<p style="margin:0;color:var(--text-muted)">Ingen varsler ennå. Her kommer nye interessenter, annonser som venter på deg og svar fra Frantz.</p>' + innst;
    return '<div style="display:flex;justify-content:flex-end;margin-bottom:var(--space-8)">' +
      '<button type="button" class="btn btn--ghost" data-alle-lest><span class="icon-lucide icon-lucide--check-check" aria-hidden="true"></span> Merk alle som lest</button></div>' +
      varsler.map(function (v) {
        return '<a class="varsel' + (v.ulest ? ' varsel--ulest' : '') + '" href="' + v.href + '">' +
          '<span class="varsel__ikon"><span class="icon-lucide icon-lucide--' + v.ikon + '" aria-hidden="true"></span></span>' +
          '<span><span class="varsel__tittel"><span class="varsel__prikk" aria-hidden="true"></span>' + v.tittel + '</span>' +
          '<span class="varsel__tid" style="display:block">' + v.tid + '</span></span></a>';
      }).join('') + innst;
  };

  var backdrop = document.createElement('div');
  backdrop.className = 'drawer-backdrop';
  backdrop.hidden = true;
  document.body.appendChild(backdrop);

  var dVarsler = lagDrawer('drawer-varsler', 'Varsler', varselHtml());
  // Topbar: bell + clickable account name
  var who = topbar.querySelector('.topbar__who');
  var bjelle = document.createElement('button');
  bjelle.type = 'button';
  bjelle.className = 'topbar__knapp';
  bjelle.setAttribute('aria-label', 'Varsler');
  bjelle.innerHTML = '<span class="icon-lucide icon-lucide--bell" aria-hidden="true"></span><span class="topbar__teller"></span>';
  var teller = bjelle.querySelector('.topbar__teller');
  function oppdaterTeller() {
    var n = varsler.filter(function (v) { return v.ulest; }).length;
    teller.textContent = n;
    teller.hidden = n === 0;
    bjelle.setAttribute('aria-label', n ? 'Varsler, ' + n + ' uleste' : 'Varsler');
  }
  oppdaterTeller();

  if (who) {
    var knapp = document.createElement('button');
    knapp.type = 'button';
    knapp.className = 'topbar__who';
    knapp.setAttribute('aria-haspopup', 'menu');
    knapp.setAttribute('aria-expanded', 'false');
    knapp.setAttribute('aria-controls', 'konto-meny');
    knapp.innerHTML = who.innerHTML + '<span class="icon-lucide icon-lucide--chevron-down topbar__pil" aria-hidden="true"></span>';
    // A cut name still shows in full on hover
    var navnEl = knapp.querySelector('.topbar__navn b');
    if (navnEl) knapp.title = navnEl.textContent;
    knapp.setAttribute('aria-label', 'Konto: ' + (navnEl ? navnEl.textContent : ''));
    var konto = document.createElement('div');
    konto.className = 'topbar__konto';
    who.replaceWith(konto);
    konto.appendChild(knapp);
    var meny = document.createElement('div');
    meny.className = 'konto-meny';
    meny.id = 'konto-meny';
    meny.setAttribute('role', 'menu');
    meny.hidden = true;
    meny.innerHTML =
      '<div class="konto-meny__hvem"><b>' + (navnEl ? navnEl.textContent : '') + '</b><small>Nordlys Rekruttering AS</small></div>' +
      [['min-profil.html', 'user', 'Min profil'],
       ['innstillinger.html', 'briefcase', 'Innstillinger for firmaet']].map(function (m) {
        return '<a class="konto-meny__valg" role="menuitem" href="' + m[0] + '"><span class="icon-lucide icon-lucide--' + m[1] + '" aria-hidden="true"></span>' + m[2] + '</a>';
      }).join('') +
      '<a class="konto-meny__valg konto-meny__valg--ut" role="menuitem" href="login.html"><span class="icon-lucide icon-lucide--log-out" aria-hidden="true"></span>Logg ut</a>';
    konto.appendChild(meny);
    topbar.insertBefore(bjelle, konto);
    function visMeny(pa) {
      meny.hidden = !pa;
      knapp.setAttribute('aria-expanded', String(pa));
      if (pa) meny.querySelector('[role="menuitem"]').focus();
    }
    knapp.addEventListener('click', function (e) { e.stopPropagation(); visMeny(meny.hidden); });
    document.addEventListener('click', function (e) { if (!meny.hidden && !konto.contains(e.target)) visMeny(false); });
    // Escape closes, arrows move between the choices
    meny.addEventListener('keydown', function (e) {
      var valg = Array.prototype.slice.call(meny.querySelectorAll('[role="menuitem"]'));
      var i = valg.indexOf(document.activeElement);
      if (e.key === 'Escape') { e.preventDefault(); visMeny(false); knapp.focus(); return; }
      var ny = { ArrowDown: i + 1, ArrowUp: i - 1, Home: 0, End: valg.length - 1 }[e.key];
      if (ny === undefined) return;
      e.preventDefault();
      valg[(ny + valg.length) % valg.length].focus();
    });
    meny.addEventListener('focusout', function (e) { if (!konto.contains(e.relatedTarget)) visMeny(false); });
  } else {
    topbar.insertBefore(bjelle, topbar.firstChild);
  }
  bjelle.addEventListener('click', function () { apne(dVarsler, bjelle); });

  // «Ny kampanje» is the main action, so it sits in the same place on every page: top right,
  // left of the bell. On a phone it sits in the top row, left of the menu button.
  // Not on Ny kampanje itself, where it would only start the form over.
  if (!/ny-kampanje\.html$/.test(location.pathname)) {
    var ny = document.createElement('a');
    ny.className = 'btn btn--accent topbar__ny'; // yellow: the main action, the same on desktop and phone
    ny.href = 'ny-kampanje.html';
    ny.innerHTML = '<span class="icon-lucide icon-lucide--plus" aria-hidden="true"></span>Ny kampanje';
    topbar.insertBefore(ny, bjelle);
    var mobil = document.querySelector('.mobiltopp');
    var burger = mobil && mobil.querySelector('.burger');
    if (burger) {
      var nyMobil = ny.cloneNode(true);
      nyMobil.classList.add('btn--sm');
      var gruppe = document.createElement('span');
      gruppe.className = 'mobiltopp__hoyre';
      burger.parentNode.insertBefore(gruppe, burger);
      gruppe.appendChild(nyMobil);
      gruppe.appendChild(burger);
    }
  }

  var apen = null, fra = null;
  function apne(d, kilde) {
    lukk();
    apen = d; fra = kilde;
    d.hidden = false;
    backdrop.hidden = false;
    var f = d.querySelector('[data-lukk]');
    if (f) f.focus();
  }
  function lukk() {
    if (!apen) return;
    apen.hidden = true;
    backdrop.hidden = true;
    if (fra) fra.focus();
    apen = null;
  }
  backdrop.addEventListener('click', lukk);
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape') lukk(); });
  dVarsler.querySelector('[data-lukk]').addEventListener('click', lukk);
  dVarsler.addEventListener('click', function (e) {
    if (!e.target.closest('[data-alle-lest]')) return;
    varsler.forEach(function (v) { v.ulest = false; });
    dVarsler.querySelectorAll('.varsel--ulest').forEach(function (a) { a.classList.remove('varsel--ulest'); });
    oppdaterTeller();
  });

  window.FrantzKonto = { apneVarsler: function () { apne(dVarsler, null); } };
})();
