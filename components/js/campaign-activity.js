/* Local campaign events are separate from the original, immutable order. */
(function (root) {
  'use strict';
  var KEY = 'fzCampaignActivityV1';
  function read(campaign) {
    try { return JSON.parse(root.localStorage.getItem(KEY) || '[]').filter(function (event) { return event.campaign === String(campaign); }); }
    catch (error) { return []; }
  }
  function append(campaign, event) {
    var all;
    try { all = JSON.parse(root.localStorage.getItem(KEY) || '[]'); } catch (error) { all = []; }
    if (!Array.isArray(all)) all = [];
    var existing = event.key && all.find(function (item) { return item.campaign === String(campaign) && item.key === event.key; });
    if (existing) return existing;
    var saved = Object.assign({}, event, { id: root.crypto.randomUUID(), campaign: String(campaign), at: new Date().toISOString() });
    all.push(saved);
    root.localStorage.setItem(KEY, JSON.stringify(all));
    root.dispatchEvent(new Event('frantz:campaign-activity'));
    return saved;
  }
  root.FrantzCampaignActivity = Object.freeze({ read: read, append: append, key: KEY });
})(window);
