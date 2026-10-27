/* LOCAL DESIGN PROTOTYPE ONLY.
   Sharing records live in this browser. Production requires a server that authorizes each
   read, applies field visibility before sending data, expires links and enforces revocation.
   Never use this local store as access control for real reports or candidate data. */
(function (root) {
  'use strict';
  var KEY = 'fzReportSharingReviewV1';
  function read() {
    try {
      var value = JSON.parse(localStorage.getItem(KEY) || '{}');
      return value && typeof value === 'object' && !Array.isArray(value) ? value : {};
    } catch (error) { return {}; }
  }
  function save(records) {
    // Fail visibly if storage is unavailable; do not report a link as created.
    localStorage.setItem(KEY, JSON.stringify(records));
    root.dispatchEvent(new Event('frantz:report-sharing-change'));
  }
  function state(record) {
    if (!record || record.revoked) return 'revoked';
    if (record.expires && Date.now() >= new Date(record.expires).getTime()) return 'expired';
    return 'active';
  }
  function resolve(token) {
    return Object.values(read()).find(function (record) { return record.token === token; }) || null;
  }
  function url(record) {
    var target = new URL('delt-rapport.html', location.href);
    target.searchParams.set('lenke', record.token);
    return target.href;
  }
  function linkFor(id) { var record = read()[id]; return state(record) === 'active' ? url(record) : null; }
  function ensure(id) {
    var records = read();
    // Keep existing choices, including deliberate revocation and expiry.
    if (!Object.prototype.hasOwnProperty.call(records, id)) {
      records[id] = { campaign: String(id), token: crypto.randomUUID(), costs: false, expires: null, expiryChoice: 'never', revoked: false };
      save(records);
    }
    return records[id];
  }
  function previewUrl(id, costs) {
    var target = new URL('delt-rapport.html', location.href);
    target.searchParams.set('kampanje', id);
    target.searchParams.set('forhandsvis', '1');
    if (costs) target.searchParams.set('kostnader', '1');
    return target.href;
  }
  root.FrantzReportSharing = Object.freeze({ state: state, resolve: resolve, previewUrl: previewUrl, linkFor: linkFor, ensure: ensure, key: KEY });
})(window);
