/* Each person's own packages. Ny kampanje and Min profil share this list.
   A package fills in everything that is not about the stilling itself.
   A package belongs to the person who made it (eier). Nobody else sees it.
   The demo keeps the list in this browser only. */
window.FZ_PAKKER = (function () {
  var LAGER = 'fzPakkerListe7';
  var MEG = 'Kari Hansen'; // the logged-in user in the demo
  // Dummy data. A bigger package always gives more: more channels and a longer period.
  // The period is fixed in the package. To pick another period, the user fills in the order by hand.
  // [ANTAGELSE: price follows the period. Frantz has not confirmed how price, period and reach are linked.]
  var STANDARD = [
    { navn: 'Liten', uker: 3, budsjett: 15000, kanaler: ['Meta', 'Nettsteder og aviser'], eier: 'Kari Hansen' },
    { navn: 'Mellom', uker: 4, budsjett: 30000, kanaler: ['Meta', 'LinkedIn', 'Nettsteder og aviser'], eier: 'Kari Hansen' },
    { navn: 'Stor', uker: 6, budsjett: 50000, kanaler: ['Meta', 'LinkedIn', 'Snapchat', 'Nettsteder og aviser'], eier: 'Kari Hansen' },
    // Ingrid's own package. Kari never sees it.
    { navn: 'Barnehage Drammen', uker: 4, budsjett: 25000, kanaler: ['Meta'], eier: 'Ingrid Moe' }
  ];
  var KANALER = [
    { navn: 'Meta', k: 'meta' }, { navn: 'LinkedIn', k: 'linkedin' }, { navn: 'Snapchat', k: 'snapchat' },
    { navn: 'TikTok', k: 'tiktok' }, { navn: 'Nettsteder og aviser', k: 'nettsteder' }
  ];
  var TILLEGG = [
    { navn: 'Tekstproduksjon', pris: 0, tekst: 'Frantz skriver annonseteksten og teksten på kampanjesiden.' },
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
  function synlige() { return liste.filter(function (p) { return p.eier === MEG; }); }
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
    var ikke = p.kanaler ? KANALER.filter(function (c) { return p.kanaler.indexOf(c.navn) === -1; }).map(function (c) { return c.navn; }) : [];
    return '<' + tag + ' class="pakke-kort' + (opt.valg ? ' pakke-kort--valg' : '') + (opt.ny ? ' er-ny' : '') + '"' + attr + '>' +
      '<span class="pakke-kort__hode"><span class="pakke-kort__navn">' + esc(p.navn) + '</span>' +
      (opt.valg ? '<span class="pakke-kort__markor" aria-hidden="true"><span class="icon-lucide icon-lucide--check"></span></span>' : '') + '</span>' +
      '<span class="pakke-kort__pris"><b>kr ' + esc(pris) + '</b><span class="pakke-kort__periode">' + (p.uker ? 'for ' + esc(p.uker) + ' uker' : 'Periode velges på kampanjen') + '</span></span>' +
      '<span class="pakke-kort__kanaler"><span class="pakke-kort__etikett">Kanaler</span><span class="pakke-kort__kanalliste">' + kanaler + '</span></span>' +
      '<span class="pakke-kort__ikke">' + (ikke.length ? 'Ikke inkludert: ' + esc(ikke.join(', ').replace(/, ([^,]*)$/, ' og $1')) : '') + '</span></' + tag + '>';
  }

  return {
    kort: kort,
    KANALER: KANALER,
    TILLEGG: TILLEGG,
    alle: synlige,
    MEG: MEG,
    finn: finn,
    // Returns an error text, or '' when the package is saved
    leggTil: function (p) {
      if (!p.navn) return 'Gi pakken et navn.';
      if (finn(p.navn)) return 'Du har allerede en pakke med dette navnet.';
      if (!(p.budsjett > 0)) return 'En pakke må ha et budsjett.';
      if (p.uker !== undefined && p.uker !== null && !(p.uker > 0)) return 'Velg hvor mange uker pakken varer.';
      p.eier = MEG;
      liste.push(p); lagre();
      return '';
    },
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
