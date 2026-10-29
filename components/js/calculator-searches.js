/* Shared calculator criteria, URL links and browser-local saved searches. */
(function (root) {
  'use strict';
  var KEY = 'fzCalculatorSearchesV1';
  function criteria(value) {
    if (!value || typeof value !== 'object') return null;
    var title = typeof value.stilling === 'string' ? value.stilling.trim().slice(0, 200) : '';
    var places = Array.isArray(value.steder) ? value.steder.filter(function (s) { return typeof s === 'string' && s.trim() && s.length <= 200; }).map(function (s) { return s.trim(); }) : [];
    places = places.filter(function (s, i) { return places.indexOf(s) === i; }).slice(0, 30);
    var budget = Number(value.budsjett);
    if (!title || !places.length || !Number.isFinite(budget) || budget <= 0 || budget > 100000000) return null;
    return { stilling: title, steder: places, budsjett: Math.round(budget) };
  }
  function fromUrl(input) {
    try {
      var url = new URL(input), p = url.searchParams;
      return criteria({ stilling: p.get('stilling'), steder: p.getAll('sted'), budsjett: p.get('budsjett') });
    } catch (e) { return null; }
  }
  function toUrl(base, value) {
    var state = criteria(value);
    if (!state) throw new Error('Invalid calculator criteria');
    var url = new URL(base);
    url.search = ''; url.hash = '';
    url.searchParams.set('delt', '1');
    url.searchParams.set('stilling', state.stilling);
    state.steder.forEach(function (s) { url.searchParams.append('sted', s); });
    url.searchParams.set('budsjett', String(state.budsjett));
    return url.href;
  }
  function read(storage) {
    try {
      var rows = JSON.parse(storage.getItem(KEY) || '[]');
      return Array.isArray(rows) ? rows.filter(function (r) {
        return r && typeof r.id === 'string' && typeof r.navn === 'string' && r.navn.trim() && criteria(r) && typeof r.lagret === 'string' && Number.isFinite(Date.parse(r.lagret));
      }).slice(0, 100) : [];
    } catch (e) { return []; }
  }
  function save(storage, value, name) {
    var state = criteria(value), title = String(name || '').trim().slice(0, 100);
    if (!state || !title) throw new Error('A name and valid criteria are required');
    var rows = read(storage);
    var match = rows.filter(function (r) { return r.navn === title && JSON.stringify(criteria(r)) === JSON.stringify(state); })[0];
    var row = Object.assign({}, state, { id: match ? match.id : root.crypto.randomUUID(), navn: title, lagret: new Date().toISOString() });
    rows = [row].concat(rows.filter(function (r) { return r.id !== row.id; })).slice(0, 100);
    storage.setItem(KEY, JSON.stringify(rows));
    return row;
  }
  var api = { criteria: criteria, fromUrl: fromUrl, toUrl: toUrl, read: read, save: save };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.FrantzCalculatorSearches = api;
})(typeof window !== 'undefined' ? window : globalThis);
