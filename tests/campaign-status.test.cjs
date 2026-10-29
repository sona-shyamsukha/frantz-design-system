const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');

function status() {
  const window = { FrantzApprovals: { status: request => request.state } };
  vm.runInNewContext(fs.readFileSync('components/js/campaign-status.js', 'utf8'), { window });
  return window.FrantzCampaignStatus.derive;
}

test('requested changes supersede old publication confirmation and assign the task to Frantz', () => {
  const next = status()({ status: 'Under arbeid' }, { id: 'v2', state: 'changes' }, [{ kind: 'material-approved', approvalId: 'v1' }]);
  assert.equal(next.key, 'changes');
  assert.equal(next.owner, 'Frantz');
  assert.equal(next.action, false);
});

test('external review approval requires a separate confirmation for that exact request', () => {
  const derive = status(), campaign = { status: 'Under arbeid' }, request = { id: 'v2', state: 'approved' };
  assert.equal(derive(campaign, request, [{ kind: 'material-approved', approvalId: 'v1' }]).key, 'reviewed');
  assert.equal(derive(campaign, request, [{ kind: 'material-approved', approvalId: 'v2' }]).key, 'confirmed');
});

test('pending and invalidated reviews do not silently become publication approval', () => {
  const derive = status();
  assert.equal(derive({}, { state: 'pending', name: 'Kunde' }, []).action, false);
  assert.equal(derive({}, { state: 'superseded' }, []).key, 'superseded');
  assert.equal(derive({}, { state: 'expired' }, []).key, 'expired');
});

test('incomplete orders ask for material; a design request waits for Frantz', () => {
  const derive = status();
  assert.equal(derive({ status: 'Bestilt', materialMode: '' }, null, []).key, 'missing');
  const design = derive({ status: 'Bestilt', materialMode: 'hjelp' }, null, []);
  assert.equal(design.owner, 'Frantz');
  assert.equal(design.action, false);
});
