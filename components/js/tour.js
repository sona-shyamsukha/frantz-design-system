/* Omvisning: viser nye brukere rundt på siden, ett lite vindu om gangen.
   FrantzTour.start(steg)  starter med en liste steg. Uten liste brukes stegene siden har registrert.
   Et steg: { mal: 'CSS-velger', tittel: '...', tekst: '...', hvisSkjult: 'hopp' | 'Ekstra setning' }
     hvisSkjult: 'hopp'  tar bort steget når målet ikke vises (f.eks. på mobil).
     hvisSkjult: tekst   legges til teksten når målet ikke vises. Vinduet står da midt på skjermen.
   FrantzTour.registrer(steg, { auto: true })  gir siden en standardliste og starter selv første gang.
   FrantzTour.nullstill()  glemmer at omvisningen er sett (localStorage "fzTurSett"). ?tur i adressen starter den uansett. */
(function () {
  var NOKKEL = 'fzTurSett';
  var MARG = 16;     // minste avstand til kanten av skjermen
  var LUFT = 6;      // luft mellom målet og ringen
  var AVSTAND = 12;  // avstand mellom ringen og vinduet

  var sideSteg = null;
  var steg = [], indeks = 0, gjeldende = null, fra = null, aktiv = false, ramme = 0;
  var lag, ring, boks, elSteg, elTittel, elTekst, knappHopp, knappTilbake, knappNeste;

  // Lagring kan være skrudd av (privat vindu, blokkerte data), så alt går gjennom try/catch
  function erSett() { try { return window.localStorage.getItem(NOKKEL) === '1'; } catch (e) { return false; } }
  function merkSett() { try { window.localStorage.setItem(NOKKEL, '1'); } catch (e) {} }
  function nullstill() { try { window.localStorage.removeItem(NOKKEL); } catch (e) {} }

  function treff(sporring) { return window.matchMedia ? window.matchMedia(sporring).matches : false; }
  function rolig() { return treff('(prefers-reduced-motion: reduce)'); }
  function liten() { return treff('(max-width: 640px)'); }

  function finn(velger) {
    try { return velger ? document.querySelector(velger) : null; } catch (e) { return null; }
  }

  // Synlig = har en boks, står innenfor skjermen i bredden og er ikke gjemt. Menyen på mobil står utenfor til venstre.
  function synlig(el) {
    if (!el || !el.getClientRects().length) return false;
    var r = el.getBoundingClientRect();
    if (r.width < 1 || r.height < 1) return false;
    if (r.right <= 0 || r.left >= window.innerWidth) return false;
    var s = window.getComputedStyle(el);
    return s.visibility !== 'hidden' && s.opacity !== '0';
  }

  function iVisning(el) {
    var r = el.getBoundingClientRect();
    return r.top >= MARG && r.bottom <= window.innerHeight - MARG;
  }

  function begrens(v, min, maks) { return Math.max(min, Math.min(v, maks)); }

  function bygg() {
    if (boks) return;
    lag = document.createElement('div');
    lag.className = 'tour-lag';
    lag.hidden = true;

    ring = document.createElement('div');
    ring.className = 'tour-ring';
    ring.hidden = true;
    ring.setAttribute('aria-hidden', 'true');

    boks = document.createElement('div');
    boks.className = 'tour';
    boks.hidden = true;
    boks.tabIndex = -1;
    boks.setAttribute('role', 'dialog');
    boks.setAttribute('aria-modal', 'true');
    boks.setAttribute('aria-labelledby', 'tour-tittel');
    boks.setAttribute('aria-describedby', 'tour-steg tour-tekst');
    boks.innerHTML =
      '<p class="tour__steg" id="tour-steg"></p>' +
      '<h2 class="tour__tittel" id="tour-tittel"></h2>' +
      '<p class="tour__tekst" id="tour-tekst"></p>' +
      '<div class="tour__handlinger">' +
        '<button type="button" class="btn btn--ghost btn--sm" data-tur="hopp">Hopp over</button>' +
        '<span class="tour__nav">' +
          '<button type="button" class="btn btn--secondary btn--sm" data-tur="tilbake">Tilbake</button>' +
          '<button type="button" class="btn btn--primary btn--sm" data-tur="neste">Neste</button>' +
        '</span>' +
      '</div>';

    document.body.appendChild(lag);
    document.body.appendChild(ring);
    document.body.appendChild(boks);

    elSteg = boks.querySelector('.tour__steg');
    elTittel = boks.querySelector('.tour__tittel');
    elTekst = boks.querySelector('.tour__tekst');
    knappHopp = boks.querySelector('[data-tur="hopp"]');
    knappTilbake = boks.querySelector('[data-tur="tilbake"]');
    knappNeste = boks.querySelector('[data-tur="neste"]');

    knappHopp.addEventListener('click', lukk);
    knappTilbake.addEventListener('click', tilbake);
    knappNeste.addEventListener('click', neste);

    document.addEventListener('keydown', tast, true);
    window.addEventListener('resize', planlegg);
    document.addEventListener('scroll', planlegg, true); // true: fanger også rulling inne i menyen og andre bokser
  }

  function start(liste) {
    if (!(liste && liste.length)) liste = sideSteg;
    if (!liste || !liste.length) return;
    var erSidensTur = liste === sideSteg; // bare sidens egen omvisning teller som «sett», ikke demoer
    bygg();

    steg = liste.filter(function (s) {
      return !(s.hvisSkjult === 'hopp' && !synlig(finn(s.mal)));
    });
    if (!steg.length) return;

    if (!aktiv) {
      var a = document.activeElement;
      fra = a && a !== document.body && !boks.contains(a) ? a : null;
    }
    aktiv = true;
    if (erSidensTur) merkSett();
    lag.hidden = false;
    boks.hidden = false;
    vis(0);
  }

  function vis(i) {
    indeks = i;
    var s = steg[i];
    var mal = finn(s.mal);
    var harMal = synlig(mal);
    var ekstra = !harMal && typeof s.hvisSkjult === 'string' && s.hvisSkjult !== 'hopp' ? ' ' + s.hvisSkjult : '';
    var sist = i === steg.length - 1;

    elSteg.textContent = (i + 1) + ' av ' + steg.length;
    elTittel.textContent = s.tittel || '';
    elTekst.textContent = (s.tekst || '') + ekstra;
    knappTilbake.hidden = i === 0;
    knappHopp.hidden = sist;
    knappNeste.textContent = sist ? 'Ferdig' : 'Neste';

    gjeldende = harMal ? mal : null;
    if (gjeldende && !iVisning(gjeldende)) {
      gjeldende.scrollIntoView({ block: 'center', inline: 'nearest', behavior: rolig() ? 'auto' : 'smooth' });
    }
    plasser();

    // Spill av inngangen på nytt for hvert steg
    boks.style.animation = 'none';
    void boks.offsetWidth;
    boks.style.animation = '';

    boks.focus({ preventScroll: true });
  }

  function neste() {
    if (indeks < steg.length - 1) vis(indeks + 1);
    else lukk();
  }

  function tilbake() {
    if (indeks > 0) vis(indeks - 1);
  }

  function lukk() {
    if (!aktiv) return;
    aktiv = false;
    gjeldende = null;
    lag.hidden = true;
    ring.hidden = true;
    boks.hidden = true;
    if (fra && document.contains(fra) && fra.focus) fra.focus();
    fra = null;
  }

  function planlegg() {
    if (aktiv && !ramme) ramme = window.requestAnimationFrame(plasser);
  }

  function plasser() {
    ramme = 0;
    if (!aktiv) return;

    var mal = gjeldende && synlig(gjeldende) ? gjeldende : null;
    boks.classList.remove('tour--midt', 'tour--topp');
    boks.style.top = '';
    boks.style.left = '';

    // Ikke noe å peke på: dim hele siden og sett vinduet i midten
    if (!mal) {
      ring.hidden = true;
      lag.classList.add('tour-lag--dim');
      boks.classList.add('tour--midt');
      return;
    }

    lag.classList.remove('tour-lag--dim');
    ring.hidden = false;

    var r = mal.getBoundingClientRect();
    var rb = r.width + LUFT * 2;
    var rh = r.height + LUFT * 2;
    var radius = parseFloat(window.getComputedStyle(mal).borderTopLeftRadius) || 0;
    ring.style.width = rb + 'px';
    ring.style.height = rh + 'px';
    ring.style.transform = 'translate(' + (r.left - LUFT) + 'px, ' + (r.top - LUFT) + 'px)';
    ring.style.borderRadius = Math.min(radius + LUFT, rh / 2) + 'px';

    var vb = window.innerWidth;
    var vh = window.innerHeight;
    var bb = boks.offsetWidth;
    var bh = boks.offsetHeight;

    // Mobil: CSS legger vinduet nederst. Står målet der, flytter vi vinduet til toppen.
    if (liten()) {
      if (r.bottom + LUFT > vh - bh - MARG * 2) boks.classList.add('tour--topp');
      return;
    }

    var ytre = LUFT + AVSTAND;
    var plass = {
      under: vh - r.bottom - ytre - MARG >= bh,
      over: r.top - ytre - MARG >= bh,
      hoyre: vb - r.right - ytre - MARG >= bb,
      venstre: r.left - ytre - MARG >= bb
    };
    // Mål langt til venstre (menyen) får vinduet ved siden av seg
    var rekkefolge = r.right < vb * 0.3 ? ['hoyre', 'under', 'over', 'venstre'] : ['under', 'over', 'venstre', 'hoyre'];
    var side = null;
    for (var i = 0; i < rekkefolge.length; i++) {
      if (plass[rekkefolge[i]]) { side = rekkefolge[i]; break; }
    }

    var topp, venstre;
    if (side === 'under' || side === 'over') {
      topp = side === 'under' ? r.bottom + ytre : r.top - ytre - bh;
      venstre = r.left + r.width / 2 - bb / 2;
    } else if (side === 'hoyre' || side === 'venstre') {
      venstre = side === 'hoyre' ? r.right + ytre : r.left - ytre - bb;
      topp = r.top + r.height / 2 - bh / 2;
    } else {
      topp = vh - bh - MARG;
      venstre = vb / 2 - bb / 2;
    }

    boks.style.top = begrens(topp, MARG, vh - bh - MARG) + 'px';
    boks.style.left = begrens(venstre, MARG, vb - bb - MARG) + 'px';
  }

  function tast(e) {
    if (!aktiv) return;
    var k = e.key;
    var paKnapp = e.target && e.target.closest && e.target.closest('button, a');

    if (k === 'Escape') {
      e.preventDefault();
      e.stopPropagation();
      lukk();
    } else if (k === 'ArrowRight' || k === 'ArrowDown' || (k === 'Enter' && !paKnapp)) {
      e.preventDefault();
      neste();
    } else if (k === 'ArrowLeft' || k === 'ArrowUp') {
      e.preventDefault();
      tilbake();
    } else if (k === 'Tab') {
      // Hold fokus inne i vinduet
      var knapper = Array.prototype.filter.call(boks.querySelectorAll('button'), function (b) { return !b.hidden; });
      if (!knapper.length) return;
      var forste = knapper[0];
      var siste = knapper[knapper.length - 1];
      var her = document.activeElement;
      if (!boks.contains(her)) { e.preventDefault(); forste.focus(); }
      else if (e.shiftKey && (her === forste || her === boks)) { e.preventDefault(); siste.focus(); }
      else if (!e.shiftKey && her === siste) { e.preventDefault(); forste.focus(); }
    }
  }

  function registrer(liste, valg) {
    sideSteg = liste;
    if (!valg || !valg.auto) return;
    var tving = /[?&]tur(=|&|$)/.test(window.location.search);
    if (!tving && erSett()) return;
    var kjor = function () { setTimeout(function () { if (!aktiv) start(); }, 400); };
    if (document.readyState === 'complete') kjor();
    else window.addEventListener('load', kjor);
  }

  window.FrantzTour = { start: start, lukk: lukk, registrer: registrer, nullstill: nullstill };
})();
