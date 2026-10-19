/* The firm's ConnectIDs. One ConnectID = one job ad that Frantz can measure.
   Connect, the ConnectID page and Ny kampanje all read this list, so the details match everywhere.
   Changes made on the ConnectID page are kept in this browser only (demo). */
window.FZ_CONNECT = (function () {
  var LAGER = 'fzConnectEndringer2', NYE = 'fzConnectNye2'; // new names: older demo edits do not hide the new data
  // kampanje.side: the page that shows the campaign. Avsluttet opens the report.
  var LISTE = [
    { id: '777845', stilling: 'Helsesykepleier', sted: 'Kristiansand', arbeidsgiver: 'Sørlandet Helse', prosjekt: 'Oppdrag 22 52',
      lenke: 'https://jobb.sorlandethelse.no/stilling/777845-helsesykepleier-kristiansand', frist: '2026-11-08',
      kategori: 'Helse og sosial', isco: '2221', interessenter: false, verifisering: 'epost', opprettet: '23.09.2026 kl. 08.32', start: '2026-09-23',
      beskrivelse: 'Helsesykepleier til skolehelsetjenesten i Kristiansand. 100 % fast stilling, dagtid. Krav: autorisasjon som sykepleier og videreutdanning i helsesykepleie.' },
    { id: '777851', stilling: 'Spesialsykepleier', sted: 'Bergen', arbeidsgiver: 'Vestlandet Helse', prosjekt: 'Nyåpnet post 4',
      lenke: 'https://jobb.vestlandethelse.no/stilling/777851-spesialsykepleier-bergen', frist: '2026-11-14',
      kategori: 'Helse og sosial', isco: '2221', interessenter: true, verifisering: 'epost', opprettet: '22.09.2026 kl. 14.05', start: '2026-09-22',
      beskrivelse: 'Spesialsykepleier til nyåpnet post 4, medisinsk avdeling. Flere faste stillinger, turnus. Intensiv- eller anestesierfaring er en fordel.' },
    { id: '777848', stilling: 'Jordmor', sted: 'Tromsø', arbeidsgiver: 'Nord-Norge Helse', prosjekt: '',
      lenke: 'https://jobb.nordnorgehelse.no/stilling/777848-jordmor-tromso', frist: '2026-11-05',
      kategori: 'Helse og sosial', isco: '2222', interessenter: false, verifisering: 'epost', opprettet: '21.09.2026 kl. 10.47', start: '2026-09-21',
      beskrivelse: 'Jordmor til fødeavdelingen i Tromsø. 80–100 % fast stilling i turnus. Vi tilbyr flytteordning og god opplæring.' },
    { id: '777860', stilling: 'Helsefagarbeider', sted: 'Tromsø', arbeidsgiver: 'Nord-Norge Helse', prosjekt: 'Oppdrag 22 40',
      lenke: 'https://jobb.nordnorgehelse.no/stilling/777860-helsefagarbeider-tromso', frist: '2026-11-15',
      kategori: 'Helse og sosial', isco: '5321', interessenter: true, verifisering: 'epost', opprettet: '24.09.2026 kl. 09.20', start: '2026-09-24',
      beskrivelse: 'Helsefagarbeidere til hjemmetjenesten i Tromsø. Faste stillinger, 75–100 %, turnus.' },
    { id: '777731', stilling: 'Anestesisykepleier', sted: 'Stavanger', arbeidsgiver: 'Vestlandet Helse', prosjekt: 'Rekruttering Stavanger',
      lenke: 'https://jobb.vestlandethelse.no/stilling/777731-anestesisykepleier-stavanger', frist: '2026-10-20',
      kategori: 'Helse og sosial', isco: '2221', interessenter: true, verifisering: 'epost', opprettet: '08.09.2026 kl. 09.12', start: '2026-09-10',
      besok: 260, sisteBesok: '27.09.2026', interesserte: 4 },
    { id: '777689', stilling: 'Sykepleier', sted: 'Oslo', arbeidsgiver: 'Oslo Sykehusdrift', prosjekt: 'Oppdrag 22 31',
      lenke: 'https://jobb.oslosykehusdrift.no/stilling/777689-sykepleier-oslo', frist: '2026-10-15',
      kategori: 'Helse og sosial', isco: '2221', interessenter: true, verifisering: 'epost', opprettet: '28.08.2026 kl. 11.46', start: '2026-09-03',
      besok: 2020, sisteBesok: 'i dag 09.14', interesserte: 9 },
    { id: '777112', stilling: 'Sykepleier', sted: 'Trondheim', arbeidsgiver: 'Trøndelag Helse', prosjekt: 'Nybygg Trondheim',
      lenke: 'https://jobb.trondelaghelse.no/stilling/777112-sykepleier-trondheim', frist: '2026-09-25',
      kategori: 'Helse og sosial', isco: '2221', interessenter: false, verifisering: 'epost', opprettet: '26.08.2026 kl. 13.30', start: '2026-08-28',
      besok: 1150, sisteBesok: '22.09.2026' },
    { id: '777702', stilling: 'Intensivsykepleier', sted: 'Bergen', arbeidsgiver: 'Vestlandet Helse', prosjekt: 'Rekruttering Bergen',
      lenke: 'https://jobb.vestlandethelse.no/stilling/777702-intensivsykepleier-bergen', frist: '2026-09-30',
      kategori: 'Helse og sosial', isco: '2221', interessenter: true, verifisering: 'telefon', opprettet: '12.08.2026 kl. 15.20', start: '2026-08-14',
      besok: 440, sisteBesok: '04.09.2026', interesserte: 3 },
    { id: '777301', stilling: 'Sykepleier', sted: 'Bodø', arbeidsgiver: 'Nordland Sykehjem', prosjekt: 'Rekruttering Bodø',
      lenke: 'https://jobb.nordlandsykehjem.no/stilling/777301-sykepleier-bodo', frist: '2026-08-05',
      kategori: 'Helse og sosial', isco: '2221', interessenter: true, verifisering: 'epost', opprettet: '30.06.2026 kl. 10.05', start: '2026-07-02',
      besok: 640, sisteBesok: '30.07.2026', interesserte: 18 },
    { id: '777544', stilling: 'Jordmor', sted: 'Ålesund', arbeidsgiver: 'Vestlandet Helse', prosjekt: 'Sommervikarer',
      lenke: 'https://jobb.vestlandethelse.no/stilling/777544-jordmor-alesund', frist: '2026-06-25',
      kategori: 'Helse og sosial', isco: '2222', interessenter: false, verifisering: 'epost', opprettet: '05.06.2026 kl. 08.50', start: '2026-06-08',
      besok: 140, sisteBesok: '22.06.2026' }
  ];

  function nye() { try { return JSON.parse(localStorage.getItem(NYE) || '[]'); } catch (e) { return []; } }
  function hele() { return nye().concat(LISTE); }
  function endringer() { try { return JSON.parse(localStorage.getItem(LAGER) || '{}'); } catch (e) { return {}; } }
  function medEndringer(c) {
    var e = endringer()[c.id], ut = {};
    Object.keys(c).forEach(function (k) { ut[k] = c[k]; });
    if (e) Object.keys(e).forEach(function (k) { ut[k] = e[k]; });
    ut.tittel = ut.stilling + ' ' + ut.sted;
    // The campaign comes from kampanjer.js, so it matches the campaign list
    var k = window.FZ_KAMPANJER && FZ_KAMPANJER.forConnect(c.id);
    ut.kampanje = k ? { id: k.id, status: k.status, fra: k.fra ? FZ_KAMPANJER.dato(k.fra).slice(0, 5) : '', til: FZ_KAMPANJER.dato(k.til), side: k.side } : null;
    ut.status = k ? k.status : 'Uten kampanje';
    return ut;
  }

  return {
    alle: function () { return hele().map(medEndringer); },
    finn: function (id) { var c = hele().filter(function (x) { return x.id === String(id); })[0]; return c ? medEndringer(c) : null; },
    // A new ConnectID made by hand. Returns its id.
    opprett: function (felt) {
      var liste = nye(), id = String(777900 + liste.length + 1), d = new Date();
      var to = function (n) { return (n < 10 ? '0' : '') + n; };
      felt.id = id;
      felt.opprettet = to(d.getDate()) + '.' + to(d.getMonth() + 1) + '.' + d.getFullYear() + ' kl. ' + to(d.getHours()) + '.' + to(d.getMinutes());
      felt.start = d.getFullYear() + '-' + to(d.getMonth() + 1) + '-' + to(d.getDate());
      liste.unshift(felt);
      try { localStorage.setItem(NYE, JSON.stringify(liste)); } catch (e) {}
      return id;
    },
    // Saves the fields a user can edit on the ConnectID page
    lagre: function (id, felt) {
      var alle = endringer();
      alle[id] = felt;
      try { localStorage.setItem(LAGER, JSON.stringify(alle)); } catch (e) {}
    },
    // What the status means, in one sentence
    statusTekst: function (c) {
      if (!c.kampanje) return 'Måler ikke ennå. Målingen starter når kampanjen starter.';
      if (c.status === 'Aktiv') return 'Måler besøk på stillingsannonsen nå.';
      if (c.status === 'Avsluttet') return 'Målingen stoppet da kampanjen sluttet ' + c.kampanje.til + '.';
      return 'Måler ikke ennå. Målingen starter når kampanjen starter.';
    },
    badge: function (status) {
      return window.FZ_KAMPANJER ? FZ_KAMPANJER.badge(status) : 'badge--default';
    }
  };
})();
