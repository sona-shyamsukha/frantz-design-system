/* Demo model for reach and expected results. Real numbers come from Frantz.
   Tuned so sykepleier i Kristiansand with kr 36 305 matches Frantz' campaign
   strategy page: 27 041 candidates and about 24 «Søk» clicks.
   Used by the reach calculator and Ny kampanje. */

(function () {
  var BASIS = 27041;
  var BASIS_BUDSJETT = 36305;

  // Size of the job group, compared with «Sykepleier»
  var ROLLE = {
    'sykepleier': 1, 'sykepleiere': 1, 'spesialsykepleier': 0.35, 'spesialsykepleiere': 0.35, 'intensivsykepleier': 0.23,
    'anestesisykepleier': 0.15, 'helsesykepleier': 0.26, 'jordmor': 0.2, 'jordmødre': 0.2, 'lege': 0.44, 'bioingeniør': 0.14,
    'helsefagarbeider': 1.3, 'oversykepleier': 0.08, 'psykiatrisk sykepleier': 0.18
  };
  // Size of the area, compared with Kristiansand
  var STED = {
    'oslo': 3.2, 'bergen': 1.9, 'trondheim': 1.6, 'stavanger': 1.4, 'kristiansand': 1, 'drammen': 0.9, 'fredrikstad': 0.8,
    'tromsø': 0.8, 'sandnes': 0.7, 'ålesund': 0.7, 'bodø': 0.6, 'sandefjord': 0.55, 'arendal': 0.5, 'tønsberg': 0.55,
    'hamar': 0.5, 'haugesund': 0.5, 'larvik': 0.45, 'moss': 0.45, 'gjøvik': 0.4, 'lillehammer': 0.4, 'molde': 0.35, 'harstad': 0.3
  };
  var TYPE = { fylke: 2.2, kommune: 0.4, by: 0.3, tettsted: 0.08, landsdekkende: 12, fjernarbeid: 1.5 };

  var KANALER = [
    { navn: 'Meta', k: 'meta', fra: 0 },
    { navn: 'Nettsteder og aviser', k: 'nettsteder', fra: 25000 },
    { navn: 'Gjenmarkedsføring', k: 'remarketing', fra: 45000 },
    { navn: 'Utvidet nasjonal dekning', k: 'nasjonal', fra: 60000 }
  ];

  function delSted(s) {
    var m = /^(.*) \((.*)\)$/.exec(s || '');
    return m ? { navn: m[1], type: m[2] } : { navn: s || '', type: '' };
  }
  function hash(t) {
    var h = 0;
    for (var i = 0; i < t.length; i++) h = (h * 31 + t.charCodeAt(i)) % 997;
    return h / 997;
  }

  function rolleFaktor(rolle) {
    var r = (rolle || '').toLowerCase();
    if (ROLLE[r] !== undefined) return ROLLE[r];
    return r ? 0.08 + hash(r) * 0.5 : 0.3;
  }
  function stedFaktor(steder) {
    if (!steder || !steder.length) return 1;
    if (steder.some(function (s) { return delSted(s).type === 'landsdekkende'; })) return TYPE.landsdekkende;
    return steder.reduce(function (sum, s) {
      var d = delSted(s), n = d.navn.toLowerCase();
      var f = STED[n] !== undefined && d.type !== 'fylke' ? STED[n] : (TYPE[d.type] || 0.3);
      return sum + f;
    }, 0);
  }

  function beregn(valg) {
    var mg = Math.max(40, BASIS * rolleFaktor(valg.rolle) * stedFaktor(valg.steder));
    var anbefalt = Math.round(Math.min(120000, Math.max(12000, BASIS_BUDSJETT * Math.sqrt(mg / BASIS))) / 100) * 100;
    var budsjett = valg.budsjett === undefined || valg.budsjett === null ? anbefalt : valg.budsjett;

    // More budget reaches deeper into the target group, with less gain at the top
    var dybde = 1 - Math.exp(-budsjett / (anbefalt / 0.916));
    var naadd = mg * dybde;
    var frekvens = 3 + Math.min(3, budsjett / anbefalt * 1.5);
    var visninger = naadd * frekvens;
    var klikk = visninger * 0.015 * (budsjett < 15000 ? 0.8 : 1);
    var besok = klikk * 0.853;
    var sok = besok * 0.0257;

    return {
      malgruppe: mg, anbefalt: anbefalt, budsjett: budsjett, dybde: dybde,
      visninger: visninger, klikk: klikk, besok: besok, sok: sok,
      kanaler: KANALER.map(function (c) { return { navn: c.navn, k: c.k, fra: c.fra, med: budsjett >= c.fra }; })
    };
  }

  function tall(n) { return Math.round(n).toLocaleString('nb-NO').replace(/[  ]/g, ' '); }
  function kort(n) {
    if (n >= 1000000) return (n / 1000000).toFixed(1).replace('.', ',') + ' mill.';
    if (n >= 10000) return Math.round(n / 1000) + 'k';
    if (n >= 1000) return (n / 1000).toFixed(1).replace('.', ',') + 'k';
    return String(Math.round(n));
  }
  function spenn(n) {
    var lav = n * 0.85, hoy = n * 1.15;
    if (hoy < 10) return Math.max(0, Math.floor(lav)) + '–' + Math.ceil(hoy);
    return kort(lav) + '–' + kort(hoy);
  }

  window.FrantzRekkevidde = { beregn: beregn, tall: tall, spenn: spenn, KANALER: KANALER };
})();
