/* Local prototype storage. A production approval link needs server-side storage and email delivery. */
(function (root) {
  'use strict';
  var opening;
  var DAY = 24 * 60 * 60 * 1000;
  function database() {
    if (!opening) opening = new Promise(function (resolve, reject) {
      var request = indexedDB.open('frantzApprovalsV1', 1);
      request.onupgradeneeded = function () { request.result.createObjectStore('requests', { keyPath: 'id' }); };
      request.onsuccess = function () { resolve(request.result); };
      request.onerror = function () { opening = null; reject(request.error); };
    });
    return opening;
  }
  function normalize(value) {
    if (value instanceof Blob) return { file: value.name || '', size: value.size, type: value.type, modified: value.lastModified || 0 };
    if (Array.isArray(value)) return value.map(normalize);
    if (value && typeof value === 'object') {
      return Object.keys(value).sort().reduce(function (result, key) { result[key] = normalize(value[key]); return result; }, {});
    }
    return value;
  }
  function fingerprint(content) { return JSON.stringify(normalize(content)); }
  function status(request, now) {
    if (!request) return 'missing';
    if (request.state === 'pending' && Date.parse(request.expires) <= (now === undefined ? Date.now() : now)) return 'expired';
    return request.state;
  }
  function transition(request, state, comment, now) {
    if (status(request, now) !== 'pending') throw new Error('closed');
    if (state !== 'approved' && state !== 'changes') throw new Error('invalid-response');
    if (state === 'changes' && !String(comment || '').trim()) throw new Error('comment-required');
    return Object.assign({}, request, { state: state, comment: state === 'changes' ? comment.trim() : '', answered: new Date(now === undefined ? Date.now() : now).toISOString() });
  }
  async function read(id) {
    var db = await database();
    return new Promise(function (resolve, reject) {
      var request = db.transaction('requests', 'readonly').objectStore('requests').get(id);
      request.onsuccess = function () { resolve(request.result || null); };
      request.onerror = function () { reject(request.error); };
    });
  }
  async function list(key) {
    var db = await database();
    return new Promise(function (resolve, reject) {
      var request = db.transaction('requests', 'readonly').objectStore('requests').getAll();
      request.onsuccess = function () { resolve(request.result.filter(function (item) { return item.campaign === key; }).sort(function (a, b) { return b.sequence - a.sequence; })); };
      request.onerror = function () { reject(request.error); };
    });
  }
  function announce() {
    root.dispatchEvent(new Event('frantz:approval-change'));
    try { localStorage.setItem('fzApprovalChanged', root.crypto.randomUUID()); } catch (e) { /* Storage event is only a cross-tab refresh hint. */ }
  }
  async function create(options) {
    if (!options.name.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(options.email.trim())) throw new Error('recipient-required');
    if (!['plan', 'material'].includes(options.round)) throw new Error('invalid-round');
    var db = await database();
    return new Promise(function (resolve, reject) {
      var tx = db.transaction('requests', 'readwrite'), store = tx.objectStore('requests'), request = store.getAll(), result;
      request.onsuccess = function () {
        var previous = request.result.filter(function (item) { return item.campaign === options.campaign && item.round === options.round; });
        var version = previous.reduce(function (max, item) { return Math.max(max, item.version); }, 0) + 1;
        var now = new Date();
        result = {
          id: root.crypto.randomUUID(), campaign: options.campaign, round: options.round, version: version,
          sequence: request.result.reduce(function (max, item) { return Math.max(max, item.sequence || 0); }, 0) + 1,
          name: options.name.trim(), email: options.email.trim(), message: options.message.trim(),
          sender: options.sender || 'Kari Hansen', company: options.company || 'Nordlys Rekruttering AS',
          content: options.content, fingerprint: fingerprint(options.content),
          created: now.toISOString(), expires: new Date(now.getTime() + 7 * DAY).toISOString(), state: 'pending', comment: ''
        };
        previous.forEach(function (item) {
          if (item.state === 'pending' || item.state === 'approved') store.put(Object.assign({}, item, { state: 'superseded', replacement: result.id }));
        });
        store.add(result);
      };
      tx.oncomplete = function () { announce(); resolve(result); };
      tx.onerror = tx.onabort = function () { reject(tx.error || new Error('storage')); };
    });
  }
  async function update(id, change) {
    var db = await database();
    return new Promise(function (resolve, reject) {
      var tx = db.transaction('requests', 'readwrite'), store = tx.objectStore('requests'), request = store.get(id), result, error;
      request.onsuccess = function () {
        try { result = change(request.result); store.put(result); }
        catch (e) { error = e; tx.abort(); }
      };
      tx.oncomplete = function () { announce(); resolve(result); };
      tx.onerror = tx.onabort = function () { reject(error || tx.error || new Error('storage')); };
    });
  }
  function respond(id, state, comment) { return update(id, function (request) { return transition(request, state, comment); }); }
  function revoke(id) {
    return update(id, function (request) {
      if (status(request) !== 'pending') throw new Error('closed');
      return Object.assign({}, request, { state: 'revoked', revoked: new Date().toISOString() });
    });
  }
  async function invalidate(campaign, content) {
    var expected = fingerprint(content), db = await database();
    return new Promise(function (resolve, reject) {
      var tx = db.transaction('requests', 'readwrite'), store = tx.objectStore('requests'), request = store.getAll(), changed = false;
      request.onsuccess = function () {
        request.result.forEach(function (item) {
          if (item.campaign === campaign && item.round === 'plan' && item.fingerprint !== expected && ['pending', 'approved'].includes(item.state)) {
            store.put(Object.assign({}, item, { state: 'superseded' })); changed = true;
          }
        });
      };
      tx.oncomplete = function () { if (changed) announce(); resolve(); };
      tx.onerror = tx.onabort = function () { reject(tx.error); };
    });
  }
  var labels = { pending: 'Venter på svar', approved: 'Godkjent', changes: 'Endring ønsket', expired: 'Lenken er utløpt', superseded: 'Erstattet av ny versjon', revoked: 'Trukket tilbake' };
  root.FrantzApprovals = { create: create, read: read, list: list, respond: respond, revoke: revoke, invalidate: invalidate, status: status, transition: transition, fingerprint: fingerprint, labels: labels };
})(window);
