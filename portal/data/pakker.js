/* The firm's saved packages. Ny kampanje and Innstillinger share this list.
   A package fills in everything that is not about the stilling itself.
   The demo keeps the list in this browser only. */
window.FZ_PAKKER = (function () {
  var LAGER = 'fzPakkerListe', GAMMELT_LAGER = 'fzPakker';
  var STANDARD = [
    { navn: 'Sykepleier standard', budsjett: 15000, kanaler: ['Meta', 'Nettsteder og aviser'], uker: 4, materiell: 'ferdig', tillegg: [], meld: true, brukt: 14 },
    { navn: 'Helse stor', budsjett: 35000, kanaler: ['Meta', 'LinkedIn', 'Nettsteder og aviser'], uker: 6, materiell: 'hjelp', tillegg: ['Tekstproduksjon'], meld: true, brukt: 6 },
    { navn: 'Leder og spesialist', budsjett: 45000, kanaler: ['LinkedIn', 'Meta'], uker: 4, materiell: 'hjelp', tillegg: ['Strategisk rådgivning'], meld: false, brukt: 3 },
    { navn: 'Rask utlysning', budsjett: 8000, kanaler: null, uker: 2, materiell: 'ferdig', tillegg: [], meld: false, brukt: 9 }
  ];
  var KANALER = [
    { navn: 'Meta', k: 'meta' }, { navn: 'LinkedIn', k: 'linkedin' }, { navn: 'Snapchat', k: 'snapchat' },
    { navn: 'TikTok', k: 'tiktok' }, { navn: 'Nettsteder og aviser', k: 'nettsteder' }
  ];
  var TILLEGG = [{ navn: 'Tekstproduksjon', pris: 0 }, { navn: 'Strategisk rådgivning', pris: 8000 }];

  function les() {
    try {
      var liste = JSON.parse(localStorage.getItem(LAGER) || 'null');
      if (Array.isArray(liste)) return liste;
      // Packages saved before the list was shared
      return STANDARD.concat(JSON.parse(localStorage.getItem(GAMMELT_LAGER) || '[]'));
    } catch (e) { return STANDARD.slice(); }
  }
  var liste = les();
  function lagre() { try { localStorage.setItem(LAGER, JSON.stringify(liste)); } catch (e) {} }
  function finn(navn) {
    var n = String(navn).trim().toLowerCase();
    return liste.filter(function (p) { return p.navn.toLowerCase() === n; })[0];
  }

  return {
    KANALER: KANALER,
    TILLEGG: TILLEGG,
    alle: function () { return liste; },
    finn: finn,
    // Returns an error text, or '' when the package is saved
    leggTil: function (p) {
      if (!p.navn) return 'Gi pakken et navn.';
      if (finn(p.navn)) return 'Dere har allerede en pakke med dette navnet.';
      if (!(p.budsjett > 0)) return 'En pakke må ha et budsjett.';
      liste.push(p); lagre();
      return '';
    },
    pris: function (p) {
      return p.budsjett + TILLEGG.reduce(function (s, t) { return s + (p.tillegg.indexOf(t.navn) !== -1 ? t.pris : 0); }, 0);
    },
    kanalTekst: function (p) {
      return p.kanaler ? p.kanaler.join(', ').replace(/, ([^,]*)$/, ' og $1') : 'Kanalene Frantz anbefaler';
    },
    linjer: function (p) {
      return [this.kanalTekst(p), p.uker + ' uker', p.materiell === 'hjelp' ? 'Frantz lager annonsen' : 'Ferdig materiell']
        .concat(p.tillegg, p.meld ? ['Meld interesse'] : []);
    },
    logoer: function (p) {
      return (p.kanaler || []).map(function (n) {
        var k = KANALER.filter(function (c) { return c.navn === n; })[0];
        return k ? '<span class="kanal-logo kanal-logo--' + k.k + '"></span>' : '';
      }).join('');
    }
  };
})();
