const { test } = require('node:test');
const assert = require('node:assert/strict');
const vm = require('node:vm');
const fs = require('node:fs');
const window = {};
vm.runInNewContext(fs.readFileSync('components/js/approval-b/rules.js', 'utf8'), { window });
const rules = window.FrantzApprovalRules;
test('only available customer creative is included with the plan', () => {
  assert.equal(rules.scope({ material: { modus: 'bygg', bilde: { navn: 'ad.png' } } }), 'plan-material');
  assert.equal(rules.scope({ material: { modus: 'hjelp', bilde: { navn: 'brief.png' } } }), 'plan');
  assert.equal(rules.scope({ material: { modus: 'bygg', bilde: null } }), 'plan');
});
test('only approved combined snapshots clear the material checkpoint', () => {
  for (const state of ['pending', 'changes', 'expired', 'revoked', 'superseded']) {
    assert.equal(rules.clearsMaterial({ content: { scope: 'plan-material' } }, state), false);
  }
  assert.equal(rules.clearsMaterial({ content: { scope: 'plan-material' } }, 'approved'), true);
  assert.equal(rules.clearsMaterial({ content: { scope: 'plan' } }, 'approved'), false);
});
test('ordering can retain a matching pending request without treating it as approved', () => {
  const pending = { id: 'pending-plan', state: 'pending', fingerprint: 'current', content: { scope: 'plan-material' } };
  assert.equal(rules.forOrder(pending, 'current'), pending);
  assert.equal(rules.clearsMaterial(pending, 'pending'), false);
  assert.equal(rules.forOrder(pending, 'changed'), null);
  assert.equal(rules.forOrder({ ...pending, state: 'superseded' }, 'current'), null);
  assert.equal(rules.forOrder(null, 'current'), null);
});
