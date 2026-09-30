/* Konto: adds the notifications bell and the "Min profil" drawer to the portal topbar. */
(function () {
  var topbar = document.querySelector('.topbar');
  if (!topbar) return;

  var varsler = [
    { ikon: 'users', tittel: '3 nye interessenter på Sykepleier Oslo', tid: 'I dag kl. 07:12', href: 'campaign.html', ulest: true },
    { ikon: 'file-text', tittel: 'Ny status fra rådgiver: «Leverer svært bra sammenlignet med lignende kampanjer»', tid: '24.09.2026', href: 'campaign.html', ulest: true },
    { ikon: 'pause', tittel: 'Helsefagarbeider Tromsø er satt på pause', tid: '22.09.2026', href: 'campaigns.html', ulest: true },
    { ikon: 'circle-check', tittel: 'Rapporten for Sykepleier Bodø er klar', tid: '31.07.2026', href: 'rapport.html', ulest: false }
  ];

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
    return '<div style="display:flex;justify-content:flex-end;margin-bottom:var(--space-8)">' +
      '<button type="button" class="btn btn--ghost" data-alle-lest><span class="icon-lucide icon-lucide--check-check" aria-hidden="true"></span> Merk alle som lest</button></div>' +
      varsler.map(function (v) {
        return '<a class="varsel' + (v.ulest ? ' varsel--ulest' : '') + '" href="' + v.href + '">' +
          '<span class="varsel__ikon"><span class="icon-lucide icon-lucide--' + v.ikon + '" aria-hidden="true"></span></span>' +
          '<span><span class="varsel__tittel"><span class="varsel__prikk" aria-hidden="true"></span>' + v.tittel + '</span>' +
          '<span class="varsel__tid" style="display:block">' + v.tid + '</span></span></a>';
      }).join('');
  };

  var profilHtml =
    '<div class="drawer__section" style="display:flex;align-items:center;gap:var(--space-12)">' +
      '<span class="avatar" aria-hidden="true">SS</span>' +
      '<div><b style="display:block;color:var(--text-heading)">Sona Shyamsukha</b><small style="color:var(--text-muted)">ss@vokser.no · Vokser AS</small></div>' +
    '</div>' +
    '<form class="drawer__section" onsubmit="event.preventDefault(); this.querySelector(\'[data-lagret]\').hidden = false;">' +
      '<h3>Kontaktinformasjon</h3>' +
      '<div class="form-grid form-grid--2" style="display:grid;grid-template-columns:1fr 1fr;gap:var(--space-12)">' +
        '<div class="form-group"><label class="form-label" for="p-fornavn">Fornavn</label><input class="form-input" id="p-fornavn" value="Sona" autocomplete="given-name"></div>' +
        '<div class="form-group"><label class="form-label" for="p-etternavn">Etternavn</label><input class="form-input" id="p-etternavn" value="Shyamsukha" autocomplete="family-name"></div>' +
      '</div>' +
      '<div class="form-group" style="margin-top:var(--space-12)"><label class="form-label" for="p-tlf">Telefon</label><input class="form-input" id="p-tlf" type="tel" placeholder="F.eks. 912 34 567" autocomplete="tel"></div>' +
      '<div class="form-group" style="margin-top:var(--space-12)"><span class="form-label">E-post</span><div>ss@vokser.no</div><p class="form-hint">E-posten er brukernavnet ditt. Kontakt Frantz for å endre den.</p></div>' +
      '<div style="display:flex;align-items:center;gap:var(--space-12);margin-top:var(--space-16)"><button class="btn btn--primary" type="submit">Lagre</button><span data-lagret hidden style="font-size:var(--text-sm);color:var(--text-success-strong)">Lagret</span></div>' +
    '</form>' +
    '<div class="drawer__section">' +
      '<h3>Språk</h3>' +
      '<div class="form-select-wrap"><select class="form-select" aria-label="Språk"><option selected>Norsk (bokmål)</option><option>English</option></select></div>' +
    '</div>' +
    '<div class="drawer__section">' +
      '<h3>Passord</h3>' +
      '<p style="margin:0 0 var(--space-12);font-size:var(--text-sm);color:var(--text-muted)">Vi sender deg en lenke på e-post for å lage et nytt passord.</p>' +
      '<button class="btn btn--secondary" type="button" onclick="this.textContent=\'Lenke sendt til ss@vokser.no\'; this.disabled=true;">Endre passord</button>' +
    '</div>';

  var backdrop = document.createElement('div');
  backdrop.className = 'drawer-backdrop';
  backdrop.hidden = true;
  document.body.appendChild(backdrop);

  var dVarsler = lagDrawer('drawer-varsler', 'Varsler', varselHtml());
  var dProfil = lagDrawer('drawer-profil', 'Min profil', profilHtml);

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
    knapp.setAttribute('aria-label', 'Min profil');
    knapp.innerHTML = who.innerHTML;
    who.replaceWith(knapp);
    topbar.insertBefore(bjelle, knapp);
    knapp.addEventListener('click', function () { apne(dProfil, knapp); });
  } else {
    topbar.insertBefore(bjelle, topbar.firstChild);
  }
  bjelle.addEventListener('click', function () { apne(dVarsler, bjelle); });

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
  [dVarsler, dProfil].forEach(function (d) {
    d.querySelector('[data-lukk]').addEventListener('click', lukk);
  });
  dVarsler.addEventListener('click', function (e) {
    if (!e.target.closest('[data-alle-lest]')) return;
    varsler.forEach(function (v) { v.ulest = false; });
    dVarsler.querySelectorAll('.varsel--ulest').forEach(function (a) { a.classList.remove('varsel--ulest'); });
    oppdaterTeller();
  });

  window.FrantzKonto = { apneProfil: function () { apne(dProfil, null); }, apneVarsler: function () { apne(dVarsler, null); } };
})();
