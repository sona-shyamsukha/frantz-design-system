const { test } = require('node:test');
const assert = require('node:assert/strict');
const vm = require('node:vm');
const fs = require('node:fs');
const { File } = require('node:buffer');
const window = {};
vm.runInNewContext(fs.readFileSync('components/js/approval-store.js', 'utf8'), { window, Blob });
const store = window.FrantzApprovals;
const now = Date.parse('2026-10-22T09:00:00Z');
const pending = { id: 'request', state: 'pending', expires: '2026-10-29T09:00:00Z', version: 2, email: 'person@example.com', content: { budget: 15000 } };

test('opening an unexpired request leaves it pending', () => {
  assert.equal(store.status(pending, now), 'pending');
  assert.equal(pending.answered, undefined);
});
test('approval preserves the invited recipient, version and snapshot', () => {
  const approved = store.transition(pending, 'approved', '', now);
  assert.equal(approved.email, pending.email);
  assert.equal(approved.version, 2);
  assert.equal(approved.content.budget, 15000);
  assert.equal(approved.answered, '2026-10-22T09:00:00.000Z');
  assert.equal(pending.state, 'pending');
});
test('requires a meaningful comment and retains it for the sender', () => {
  assert.throws(() => store.transition(pending, 'changes', '  ', now), /comment-required/);
  assert.equal(store.transition(pending, 'changes', '  Bytt bilde.  ', now).comment, 'Bytt bilde.');
});
test('expired, revoked, replaced and answered requests cannot be answered again', () => {
  for (const state of ['approved', 'changes', 'revoked', 'superseded']) {
    assert.throws(() => store.transition({ ...pending, state }, 'approved', '', now), /closed/);
  }
  assert.throws(() => store.transition(pending, 'approved', '', Date.parse(pending.expires)), /closed/);
  assert.throws(() => store.transition(null, 'approved', '', now), /closed/);
});
test('content fingerprint detects budget, crop, text, logo and original-file changes', () => {
  const before = { budget: 15000, crop: { x: 20, y: 50 }, text: 'Ledig jobb', logo: true, file: new File(['first'], 'ad.png', { type: 'image/png', lastModified: 1 }) };
  for (const patch of [{ budget: 20000 }, { crop: { x: 70, y: 50 } }, { text: 'Ny tekst' }, { logo: false }, { file: new File(['second'], 'ad.png', { type: 'image/png', lastModified: 2 }) }]) {
    assert.notEqual(store.fingerprint(before), store.fingerprint({ ...before, ...patch }));
  }
  assert.equal(store.fingerprint({ b: 2, a: 1 }), store.fingerprint({ a: 1, b: 2 }));
});
