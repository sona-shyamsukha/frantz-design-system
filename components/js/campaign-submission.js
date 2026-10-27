/* Private, immutable order data. This module is never loaded by the public report. */
(function (root) {
  'use strict';
  var has = function (object, key) { return Object.prototype.hasOwnProperty.call(object || {}, key); };
  function money(value) { return value == null ? 'Avklares med Frantz' : 'kr ' + Number(value).toLocaleString('nb-NO').replace(/[\u00a0\u202f]/g, ' '); }
  function date(value) {
    var match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(String(value || ''));
    return match ? match[3] + '.' + match[2] + '.' + match[1] : String(value || '');
  }
  function text(value) {
    if (Array.isArray(value)) return value.join(', ');
    if (typeof value === 'boolean') return value ? 'Ja' : 'Nei';
    return value == null ? '' : String(value);
  }
  function capture(sections, readValue) {
    return sections.flatMap(function (section) {
      return section.felt.map(function (field) {
        return { id: field[0], label: field[1], group: section.id === 'stilling' ? 'stilling' : 'kampanje', value: text(readValue(field[0])) };
      });
    });
  }
  var definitions = [
    ['stilling', 'Stilling', 'stilling', 'stilling', 'stilling'],
    ['sted', 'Arbeidssted', 'stilling', 'sted', 'sted'],
    ['arbeidsgiver', 'Arbeidsgiver', 'stilling', 'arbeidsgiver', 'arbeidsgiver'],
    ['frist', 'Søknadsfrist', 'stilling', 'frist', 'frist'],
    ['navn', 'Kampanjenavn / referanse', 'kampanje', 'ref', 'ref'],
    ['pakke', 'Lagret pakke', 'kampanje', 'pakke'],
    ['budsjett', 'Budsjett', 'kampanje', 'budsjett', 'budsjett'],
    ['kanaler', 'Kanaler', 'kampanje', 'kanaler', 'kanaler'],
    ['periode', 'Periode', 'kampanje', 'periodeTekst', 'periode'],
    ['materiell', 'Materiell', 'kampanje', 'materiell'],
    ['avsender', 'Avsender', 'kampanje', 'avsender'],
    ['produkter', 'Valgte produkter', 'kampanje', 'tillegg'],
    ['ekstra', 'Tilleggsinformasjon', 'kampanje', 'notat', 'tilleggsinformasjon'],
    ['faktura', 'Fakturamottaker', 'kampanje', 'faktura'],
    ['sok', 'Forventet «Søk» ved bestilling', 'kampanje', 'sok'],
    ['ute', 'Tidligst ute', 'kampanje', 'ute']
  ];
  function normalizedFields(order, campaign) {
    var captured = Array.isArray(order.innsendteFelt) ? order.innsendteFelt.map(function (field) {
      return { id: field.id, label: field.label, group: field.group === 'stilling' ? 'stilling' : 'kampanje', value: text(field.value) };
    }) : [];
    var ids = new Set(captured.map(function (field) { return field.id; }));
    definitions.forEach(function (definition) {
      var id = definition[0], key = definition[3], fallback = definition[4];
      if (ids.has(id)) return;
      var available = has(order, key) || (fallback && has(campaign, fallback));
      var value = has(order, key) ? order[key] : campaign[fallback];
      if (id === 'periode' && !available && has(order, 'periode')) { available = true; value = order.periode; }
      if (!available) return;
      if (id === 'budsjett') value = money(value);
      if (id === 'frist') value = date(value);
      captured.push({ id: id, label: definition[1], group: definition[2], value: text(value) });
    });
    if (has(order, 'tilleggSum') && order.tilleggSum > 0) captured.push({ id: 'tilleggSum', label: 'Pris for tillegg', group: 'kampanje', value: money(order.tilleggSum) });
    if (has(order, 'total') && order.total != null) captured.push({ id: 'total', label: 'Totalsum', group: 'kampanje', value: money(order.total) });
    return captured;
  }
  function normalize(campaign, record, session) {
    campaign = campaign || {};
    var id = String(campaign.id || '');
    if (record && campaign.materiellId && record.id !== campaign.materiellId) record = null;
    if (record && record.ordre && record.ordre.id && String(record.ordre.id) !== id) record = null;
    if (session && String(session.id) !== id) session = null;
    var order = Object.assign({}, record && record.ordre || session || {});
    return {
      id: id, campaign: campaign, order: order, record: record || null,
      found: !!campaign.id, hasSubmission: !!(record || session), submittedAt: record && record.innsendt || order.innsendt || '',
      title: order.tittel || campaign.tittel || [campaign.stilling, campaign.sted].filter(Boolean).join(' '),
      status: campaign.status || 'Bestilt', fields: normalizedFields(order, campaign),
      source: { text: order.kildeTekst || '', url: order.kildeLenke || '' },
      material: record && record.materiell || null,
      approvalKey: order.approvalKey || campaign.approvalKey || id
    };
  }
  async function load(id, campaign) {
    var session = null;
    try { session = JSON.parse(root.sessionStorage.getItem('fzOrdre') || 'null'); } catch (error) {}
    if (session && String(session.id) !== String(id)) session = null;
    if (!campaign && session) campaign = { id: String(id), status: 'Bestilt', materiellId: session.materiellId };
    var materialId = campaign && campaign.materiellId || session && session.materiellId;
    var record = null;
    if (materialId && root.FrantzCampaignMaterial) {
      try { record = await root.FrantzCampaignMaterial.read(materialId); } catch (error) { /* Other saved campaign facts remain available. */ }
    }
    return normalize(campaign || {}, record, session);
  }
  root.FrantzCampaignSubmission = Object.freeze({ capture: capture, normalize: normalize, load: load, money: money, date: date });
})(window);
