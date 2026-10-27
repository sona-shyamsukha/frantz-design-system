const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const source = fs.readFileSync('portal/data/kampanjer.js', 'utf8');

function setup(values = new Map(), failWrites = false) {
  const window = {};
  const localStorage = {
    getItem: key => values.get(key) ?? null,
    setItem: (key, value) => {
      if (failWrites) throw new Error('Storage unavailable');
      values.set(key, value);
    }
  };
  vm.runInNewContext(source, { window, localStorage });
  return window.FZ_KAMPANJER;
}

test('deleting a draft persists across page loads and removes its Connect association', () => {
  const values = new Map();
  const campaigns = setup(values);
  assert.equal(campaigns.finn('129070').status, 'Kladd');
  assert.equal(campaigns.slettKladd('129070'), true);
  assert.equal(campaigns.finn('129070'), null);
  assert.equal(campaigns.forConnect('777845'), null);
  assert.equal(setup(values).finn('129070'), null);
  assert.equal(campaigns.slettKladd('129070'), false);
});

test('undo restores the same draft and its details after reloading', () => {
  const values = new Map();
  const campaigns = setup(values);
  const original = JSON.stringify(campaigns.finn('129070'));
  campaigns.slettKladd('129070');
  assert.equal(campaigns.gjenopprettKladd('129070'), true);
  assert.equal(JSON.stringify(setup(values).finn('129070')), original);
  assert.equal(campaigns.gjenopprettKladd('129070'), false);
});

test('only drafts can be deleted, and unrelated campaigns are preserved', () => {
  const campaigns = setup();
  const others = JSON.stringify(campaigns.alle().filter(k => k.status !== 'Kladd'));
  for (const campaign of campaigns.alle().filter(k => k.status !== 'Kladd')) {
    assert.equal(campaigns.slettKladd(campaign.id), false);
  }
  assert.equal(campaigns.slettKladd('missing'), false);
  campaigns.slettKladd('129070');
  assert.equal(JSON.stringify(campaigns.alle()), others);
});

test('failed storage writes leave drafts visible and report failure', () => {
  const campaigns = setup(new Map(), true);
  assert.equal(campaigns.slettKladd('129070'), false);
  assert.equal(campaigns.finn('129070').status, 'Kladd');
  const values = new Map([['fzKampanjerSlettedeKladder', '["129070"]']]);
  assert.equal(setup(values, true).gjenopprettKladd('129070'), false);
  assert.equal(setup(values).finn('129070'), null);
});

test('malformed storage does not prevent listing or deleting drafts', () => {
  for (const value of ['broken JSON', '{}', 'null']) {
    const campaigns = setup(new Map([['fzKampanjerSlettedeKladder', value]]));
    assert.equal(campaigns.finn('129070').status, 'Kladd');
    assert.equal(campaigns.slettKladd('129070'), true);
  }
});

test('restoring a draft never brings back a draft already replaced by an order', () => {
  const values = new Map();
  const campaigns = setup(values);
  campaigns.slettKladd('129070');
  campaigns.bestill({ connect: '777845', stilling: 'Helsesykepleier', sted: 'Kristiansand' });
  campaigns.gjenopprettKladd('129070');
  assert.equal(campaigns.finn('129070'), null);
  assert.equal(campaigns.forConnect('777845').status, 'Bestilt');
});
