/* Packages. Ny kampanje and Lagrede pakker share this list.
   A package holds a budget and channels. It has no period: the user picks the period on each campaign,
   and Frantz spreads the budget over it (decided in the design review 20.10.2026).
   Packages are always made by the user. Each channel has a minimum spend. A package below it gets a warning. A package belongs to the person who made it (eier). Nobody else sees it.
   A new customer (?bruker=ny) has made none yet, so Kari's demo packages are hidden for them.
   The demo keeps the list in this browser only. */
window.FZ_PAKKER = (function () {
  var LAGER = 'fzPakkerListe9';
  var MEG = 'Kari Hansen'; // the logged-in user in the demo
  // Dummy data. A bigger package always gives more channels.
  var STANDARD = [
    { navn: 'Liten', budsjett: 18000, kanaler: ['Meta', 'Nettsteder og aviser'], eier: 'Kari Hansen', demo: true },
    { navn: 'Mellom', budsjett: 30000, kanaler: ['Meta', 'LinkedIn', 'Nettsteder og aviser'], eier: 'Kari Hansen', demo: true },
    { navn: 'Stor', budsjett: 50000, kanaler: ['Meta', 'LinkedIn', 'Snapchat', 'Nettsteder og aviser'], eier: 'Kari Hansen', demo: true },
    // Ingrid's own package. Kari never sees it.
    { navn: 'Barnehage Drammen', budsjett: 25000, kanaler: ['Meta'], eier: 'Ingrid Moe' }
  ];
  // Minimum and maximum spend per channel, from Tore's mail «Maks min kanaler» (13.10.2026).
  // [ANTAGELSE: «Nettsteder og aviser» is BidTheatre in Frantz's system. Confirm with Tore.]
  var KANALER = [
    { navn: 'Meta', k: 'meta', min: 6000, maks: 15000 },
    { navn: 'LinkedIn', k: 'linkedin', min: 3000, maks: 10000 },
    { navn: 'Snapchat', k: 'snapchat', min: 5000, maks: 9000 },
    { navn: 'TikTok', k: 'tiktok', min: 5000, maks: 12000 },
    { navn: 'Nettsteder og aviser', k: 'nettsteder', min: 8000, maks: 65000 }
  ];
  // Sum of the minimum (and maximum) spend for the picked channels. No channels: Frantz picks, so no minimum here.
  function rad(kanaler) {
    var valgte = KANALER.filter(function (c) { return (kanaler || []).indexOf(c.navn) !== -1; });
    return {
      min: valgte.reduce(function (s, c) { return s + c.min; }, 0),
      maks: valgte.reduce(function (s, c) { return s + c.maks; }, 0),
      kanaler: valgte
    };
  }
  var TILLEGG = [
    { navn: 'Strategisk rådgivning', pris: 8000, tekst: 'En rådgiver går gjennom målgruppe, kanaler og budsjett med dere før start.' }
  ];

  function les() {
    try {
      var liste = JSON.parse(localStorage.getItem(LAGER) || 'null');
      if (Array.isArray(liste)) return liste;
    } catch (e) {}
    return STANDARD.slice();
  }
  var liste = les();
  function lagre() { try { localStorage.setItem(LAGER, JSON.stringify(liste)); } catch (e) {} }
  // Only the packages this person made
  var NY = !!(window.FZ_BRUKER && window.FZ_BRUKER.ny);
  function synlige() { return liste.filter(function (p) { return p.eier === MEG && !(NY && p.demo); }); }
  function finn(navn) {
    var n = String(navn).trim().toLowerCase();
    return synlige().filter(function (p) { return p.navn.toLowerCase() === n; })[0];
  }

  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
  // One layout for the same package wherever it appears. Only selection is contextual.
  function kort(p, opt) {
    opt = opt || {};
    var tag = opt.valg ? 'button' : 'article';
    var attr = opt.valg ? ' type="button" data-pakke="' + Number(opt.indeks) + '" aria-pressed="' + !!opt.valgt + '"' : '';
    var pris = Math.round(p.budsjett).toLocaleString('nb-NO').replace(/[\u00a0\u202f]/g, ' ');
    var kanaler = p.kanaler && p.kanaler.length ? p.kanaler.map(function (n) {
      var k = KANALER.filter(function (c) { return c.navn === n; })[0];
      return '<span class="pakke-kort__kanal">' + (k ? '<span class="kanal-logo kanal-logo--sm kanal-logo--' + k.k + '" aria-hidden="true"></span>' : '') + esc(n) + '</span>';
    }).join('') : '<span>Kanalene Frantz anbefaler</span>';
    return '<' + tag + ' class="pakke-kort' + (opt.valg ? ' pakke-kort--valg' : '') + (opt.ny ? ' er-ny' : '') + '"' + attr + '>' +
      '<span class="pakke-kort__hode"><span class="pakke-kort__navn">' + esc(p.navn) + '</span>' +
      (opt.valg ? '<span class="pakke-kort__markor" aria-hidden="true"><span class="icon-lucide icon-lucide--check"></span></span>' : '') +
      (opt.slett ? '<button type="button" class="pakke-kort__slett" data-slett-pakke="' + esc(p.navn) + '" aria-label="Slett pakken ' + esc(p.navn) + '" title="Slett pakken"><span class="icon-lucide icon-lucide--trash-2" aria-hidden="true"></span></button>' : '') + '</span>' +
      '<span class="pakke-kort__pris"><b>kr ' + esc(pris) + '</b>' + (p.uker ? '<span class="pakke-kort__periode">for ' + esc(p.uker) + ' uker</span>' : '') + '</span>' +
      '<span class="pakke-kort__kanaler"><span class="pakke-kort__etikett">Kanaler</span><span class="pakke-kort__kanalliste">' + kanaler + '</span></span></' + tag + '>';
  }

  return {
    kort: kort,
    KANALER: KANALER,
    TILLEGG: TILLEGG,
    rad: rad,
    alle: synlige,
    MEG: MEG,
    finn: finn,
    // Returns an error text, or '' when the package is saved
    leggTil: function (p) {
      if (!p.navn) return 'Gi pakken et navn.';
      if (finn(p.navn)) return 'Du har allerede en pakke med dette navnet.';
      if (!(p.budsjett > 0)) return 'En pakke må ha et budsjett.';
      var r = rad(p.kanaler);
      if (p.budsjett < r.min) return 'Budsjettet må være minst kr ' + Math.round(r.min).toLocaleString('nb-NO').replace(/[\u00a0\u202f]/g, ' ') + ' for kanalene du har valgt.';
      p.eier = MEG;
      liste.push(p); lagre();
      return '';
    },
    // Removes one of this person's packages. Returns it, so the page can offer «Angre».
    fjern: function (navn) {
      var p = finn(navn); if (!p) return null;
      p._plass = liste.indexOf(p);
      liste.splice(p._plass, 1); lagre();
      return p;
    },
    // Puts a removed package back where it was
    tilbake: function (p) { var i = p._plass; delete p._plass; liste.splice(i >= 0 ? i : liste.length, 0, p); lagre(); },
    pris: function (p) { return p.budsjett; },
    kanalTekst: function (p) {
      return p.kanaler ? p.kanaler.join(', ').replace(/, ([^,]*)$/, ' og $1') : 'Kanalene Frantz anbefaler';
    },
    // The channels this package does not include, so a smaller package is an informed choice
    ikkeMed: function (p) {
      if (!p.kanaler) return [];
      return KANALER.filter(function (c) { return p.kanaler.indexOf(c.navn) === -1; }).map(function (c) { return c.navn; });
    },
    linjer: function (p) { return (p.uker ? [p.uker + ' uker'] : []).concat([this.kanalTekst(p)]); },
    logoer: function (p) {
      return (p.kanaler || []).map(function (n) {
        var k = KANALER.filter(function (c) { return c.navn === n; })[0];
        return k ? '<span class="kanal-logo kanal-logo--' + k.k + '"></span>' : '';
      }).join('');
    }
  };
})();
