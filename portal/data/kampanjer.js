/* Every campaign the firm has. Kampanjer, Hjem and Stillinger all read this list,
   so a campaign shows the same name, period, budget and status everywhere.
   connect: the ConnectID (job) the campaign belongs to.
   sok: how many pressed «Søk». Ended campaigns, and the active one so far (30 + 14 + 8 on campaign.html). Bodø matches rapport.html.
   A new draft or order is kept in this browser only (demo). It shows first: a draft as «Kladd», an order as «Bestilt». */
window.FZ_KAMPANJER = (function () {
  var NYE = 'fzKampanjerNye';
  var MATERIAL = 'fzCampaignMaterialLinksV1';
  var SLETTEDE_KLADDER = 'fzKampanjerSlettedeKladder';
  var LISTE = [
    { id: '129072', radgiver: 'Martin Karlsen', connect: '777860', stilling: 'Helsefagarbeider', sted: 'Tromsø', arbeidsgiver: 'Nord-Norge Helse', ref: 'Oppdrag 22 40',
      kanaler: ['Meta', 'Nettsteder og aviser'], fra: '2026-10-05', til: '2026-11-02', budsjett: 28000, status: 'Under arbeid', bestiller: 'Kari Hansen', side: 'kampanje-under-arbeid.html' },
    { id: '129074', radgiver: 'Martin Karlsen', connect: '', stilling: 'Barnehagelærer', sted: 'Drammen', arbeidsgiver: 'Drammen Barnehager', ref: 'Oppdrag 22 41',
      kanaler: ['Meta', 'Nettsteder og aviser'], fra: '2026-10-07', til: '2026-11-04', budsjett: 32000, status: 'Bestilt', bestiller: 'Kari Hansen', side: 'kampanje-bestilt.html' },
    { id: '129041', radgiver: 'Martin Karlsen', connect: '777689', stilling: 'Sykepleier', sted: 'Oslo', arbeidsgiver: 'Oslo Sykehusdrift', ref: 'Oppdrag 22 31',
      kanaler: ['Meta', 'Nettsteder og aviser'], fra: '2026-09-03', til: '2026-10-03', budsjett: 48200, sok: 52, status: 'Aktiv', bestiller: 'Kari Hansen', side: 'campaign.html' },
    { id: '129070', connect: '777845', stilling: 'Helsesykepleier', sted: 'Kristiansand', arbeidsgiver: 'Sørlandet Helse', ref: 'Oppdrag 22 52',
      kanaler: null, fra: '', til: '', frist: '2026-11-08', budsjett: 0, status: 'Kladd', bestiller: 'Kari Hansen', side: 'ny-kampanje.html?kladd=129070',
      endret: 'i går kl. 14.12' },
    { id: '129068', connect: '777731', stilling: 'Anestesisykepleier', sted: 'Stavanger', arbeidsgiver: 'Vestlandet Helse', ref: 'Rekruttering Stavanger',
      kanaler: ['Meta', 'LinkedIn'], fra: '2026-09-10', til: '2026-09-27', budsjett: 22000, sok: 11, status: 'Avsluttet', bestiller: 'Kari Hansen', side: 'rapport.html' },
    { id: '129062', connect: '777112', stilling: 'Sykepleier', sted: 'Trondheim', arbeidsgiver: 'Trøndelag Helse', ref: 'Nybygg Trondheim',
      kanaler: ['Meta', 'Nettsteder og aviser'], fra: '2026-08-28', til: '2026-09-22', budsjett: 35000, sok: 19, status: 'Avsluttet', bestiller: 'Ingrid Moe', side: 'rapport.html' },
    { id: '129055', connect: '777702', stilling: 'Intensivsykepleier', sted: 'Bergen', arbeidsgiver: 'Vestlandet Helse', ref: 'Rekruttering Bergen',
      kanaler: ['Meta', 'LinkedIn', 'Nettsteder og aviser'], fra: '2026-08-14', til: '2026-09-04', budsjett: 26000, sok: 16, status: 'Avsluttet', bestiller: 'Kari Hansen', side: 'rapport.html' },
    { id: '128984', rapportKomplett: true, radgiver: 'Martin Karlsen', connect: '777301', stilling: 'Sykepleier', sted: 'Bodø', arbeidsgiver: 'Nordland Sykehjem', ref: 'Rekruttering Bodø',
      kanaler: ['Meta', 'Nettsteder og aviser'], fra: '2026-07-02', til: '2026-07-30', budsjett: 31200, sok: 18, status: 'Avsluttet', bestiller: 'Kari Hansen', side: 'rapport.html' },
    { id: '128951', connect: '777544', stilling: 'Jordmor', sted: 'Ålesund', arbeidsgiver: 'Vestlandet Helse', ref: 'Sommervikarer',
      kanaler: ['Meta'], fra: '2026-06-08', til: '2026-06-22', budsjett: 15000, sok: 6, status: 'Avsluttet', bestiller: 'Kari Hansen', side: 'rapport.html' }
  ];

  function lesListe(nokkel) {
    try { var liste = JSON.parse(localStorage.getItem(nokkel) || '[]'); return Array.isArray(liste) ? liste : []; }
    catch (e) { return []; }
  }
  function nye() { return lesListe(NYE); }
  function lagreSlettede(liste) {
    try { localStorage.setItem(SLETTEDE_KLADDER, JSON.stringify(liste)); return true; }
    catch (e) { return false; }
  }
  function alle() {
    var ny = nye();
    var materialLinks;
    try { materialLinks = JSON.parse(localStorage.getItem(MATERIAL) || '{}'); } catch (error) { materialLinks = {}; }
    var slettede = lesListe(SLETTEDE_KLADDER);
    // An order made from a draft replaces the draft
    var ersatt = ny.map(function (k) { return k.connect; }).filter(Boolean);
    var nyeId = ny.map(function (k) { return k.id; }); // a saved or ordered example draft replaces the example
    return ny.concat(LISTE.filter(function (k) { return nyeId.indexOf(k.id) === -1 && !(k.status === 'Kladd' && ersatt.indexOf(k.connect) !== -1); }))
      .filter(function (k) { return k.status !== 'Kladd' || slettede.indexOf(String(k.id)) === -1; }).map(function (k) { return medFelt(Object.assign({}, k, materialLinks[k.id] || {})); });
  }

  // dd.mm.yyyy from 2026-09-03
  function dato(x) { var m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(x || ''); return m ? m[3] + '.' + m[2] + '.' + m[1] : ''; }
  function fraIso(x) { var m = x.split('-'); return new Date(+m[0], m[1] - 1, +m[2]); }
  // Days are counted with both the first and the last day. 03.09–03.10 is 31 days.
  function dager(fra, til) { return Math.round((fraIso(til) - fraIso(fra)) / 86400000) + 1; }
  function idag() { var d = window.FZ_I_DAG ? window.FZ_I_DAG() : new Date(); return new Date(d.getFullYear(), d.getMonth(), d.getDate()); }
  function medFelt(k) {
    var ut = {};
    Object.keys(k).forEach(function (n) { ut[n] = k[n]; });
    ut.tittel = [k.stilling, k.sted].filter(Boolean).join(' ') || k.ref || 'Ny kampanje';
    if (['Aktiv', 'Avsluttet', 'Bestilt'].indexOf(k.status) !== -1 && k.side.indexOf('id=') === -1) ut.side = k.side + (k.side.indexOf('?') === -1 ? '?' : '&') + 'id=' + encodeURIComponent(k.id);
    ut.periode = k.fra ? dato(k.fra).slice(0, 5) + ' – ' + dato(k.til) : '';
    ut.lengde = k.fra ? dager(k.fra, k.til) : 0;
    if (k.status === 'Aktiv') ut.dag = Math.round((idag() - fraIso(k.fra)) / 86400000) + 1;
    return ut;
  }

  // Every campaign and draft gets its own number, also after drafts are deleted.
  function nyId() {
    var hoyeste = LISTE.concat(nye()).reduce(function (max, k) { return Math.max(max, Number(k.id) || 0); }, 129074);
    return String(hoyeste + 1);
  }
  function lagreNye(liste) {
    try { localStorage.setItem(NYE, JSON.stringify(liste)); return true; } catch (e) { return false; }
  }

  return {
    alle: alle,
    // Keep partial examples addressable, but only show complete ended reports in demo lists.
    synlige: function () { return alle().filter(function (k) { return k.status !== 'Avsluttet' || k.rapportKomplett === true; }); },
    finn: function (id) { return alle().filter(function (k) { return k.id === String(id); })[0] || null; },
    forConnect: function (connect) { return alle().filter(function (k) { return k.connect && k.connect === String(connect); })[0] || null; },
    // Keep draft records so deletion can be undone. Ordered campaigns cannot be deleted.
    slettKladd: function (id) {
      var k = alle().filter(function (k) { return k.id === String(id) && k.status === 'Kladd'; })[0];
      if (!k) return false;
      return lagreSlettede(lesListe(SLETTEDE_KLADDER).concat(String(id)));
    },
    gjenopprettKladd: function (id) {
      var slettede = lesListe(SLETTEDE_KLADDER);
      if (slettede.indexOf(String(id)) === -1) return false;
      return lagreSlettede(slettede.filter(function (slettet) { return slettet !== String(id); }));
    },
    dato: dato,
    dager: dager,
    // The ID the next order gets. Ny kampanje shows it while the order is filled in.
    nesteId: nyId,
    // A new campaign becomes a draft with its own number and address as soon as it has content.
    // Saving again updates the same draft. Returns the draft id.
    lagreKladd: function (k) {
      var liste = nye();
      var id = k.id ? String(k.id) : nyId();
      var tidligere = liste.filter(function (x) { return x.id === id; })[0] || {};
      var kladd = Object.assign({}, tidligere, k, { id: id, status: 'Kladd', bestiller: 'Kari Hansen', side: 'ny-kampanje.html?kladd=' + id });
      lagreNye([kladd].concat(liste.filter(function (x) { return x.id !== id; })));
      return id;
    },
    // Saves a new order. An order from a draft keeps the draft's number. Returns the campaign id.
    bestill: function (k) {
      var liste = nye();
      k.id = k.id ? String(k.id) : nyId();
      k.status = 'Bestilt';
      k.bestiller = 'Kari Hansen';
      k.side = 'kampanje-bestilt.html?id=' + k.id;
      lagreNye([k].concat(liste.filter(function (x) { return x.id !== k.id; })));
      return k.id;
    },
    oppdaterMateriell: function (id, materialId, approvalKey) {
      var links;
      try { links = JSON.parse(localStorage.getItem(MATERIAL) || '{}'); } catch (error) { links = {}; }
      links[String(id)] = { materiellId: materialId, approvalKey: approvalKey };
      localStorage.setItem(MATERIAL, JSON.stringify(links));
    },
    badge: function (status) {
      return { 'Kladd': 'badge--draft', 'Bestilt': 'badge--ordered', 'Under arbeid': 'badge--setup', 'Aktiv': 'badge--active', 'Avsluttet': 'badge--ended', 'Uten kampanje': 'badge--draft' }[status] || 'badge--default';
    },
    STATUSER: ['Kladd', 'Bestilt', 'Under arbeid', 'Aktiv', 'Avsluttet']
  };
})();
