const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
function setup() {
  const storage = {};
  const window = { localStorage: { getItem: key => storage[key] || null, setItem: (key, value) => { storage[key] = value; } }, crypto: { randomUUID: () => String(Math.random()) }, dispatchEvent() {} };
  vm.runInNewContext(fs.readFileSync('components/js/campaign-activity.js', 'utf8'), { window, Event: class {} });
  return window.FrantzCampaignActivity;
}
test('activity remains scoped to its campaign and preserves the first event for a version', () => {
  const events = setup();
  events.append('1', { key: 'approved-v1', title: 'First approval' });
  events.append('2', { key: 'approved-v1', title: 'Other campaign' });
  events.append('1', { key: 'approved-v1', title: 'Must not replace the first approval' });
  events.append('1', { key: 'approved-v2', title: 'Second version approval' });
  assert.equal(events.read('1').length, 2);
  assert.equal(events.read('1')[0].title, 'First approval');
  assert.equal(events.read('2').length, 1);
  assert.equal(events.read('2')[0].title, 'Other campaign');
});
