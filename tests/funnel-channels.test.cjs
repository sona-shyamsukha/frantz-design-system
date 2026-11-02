const { test } = require('node:test');
const assert = require('node:assert/strict');
const vm = require('node:vm');
const fs = require('node:fs');

function chart() {
  const window = {};
  vm.runInNewContext(fs.readFileSync('components/js/funnel.js', 'utf8'), {
    window,
    document: { documentElement: {}, addEventListener() {} },
    getComputedStyle: () => ({ getPropertyValue: () => '#0C3F59' })
  });
  const el = { id: 'test-chart', dataset: { visning: 'lagdelt' }, style: { setProperty() {} }, innerHTML: '' };
  const data = { verdier: [100, 10], lag: [
    { navn: 'Meta', v: [60, 6], o: 1 },
    { navn: 'Nettsteder og aviser', v: [40, 4], o: 0.6 }
  ] };
  window.tegnTrakt(el, data);
  return { window, el, data };
}

test('channel costs come from matching report names and survive chart view switches', () => {
  const { window, el, data } = chart();
  assert.equal(window.oppdaterTraktKanaler(el, [
    { name: 'Nettsteder og aviser', cost: 1200 }, { name: 'Meta', cost: 2400 }
  ]), true);
  assert.match(el.innerHTML, /Meta<\/span><span class="funnel__channel-cost">kr 2\s400/);
  assert.match(el.innerHTML, /Nettsteder og aviser<\/span><span class="funnel__channel-cost">kr 1\s200/);
  assert.equal(data.lag[0].kostnadPerSok, undefined, 'Original chart data is unchanged');
  el.dataset.visning = 'trakt';
  window.tegnTrakt(el);
  assert.doesNotMatch(el.innerHTML, /funnel__channel-cost/);
  el.dataset.visning = 'lagdelt';
  window.tegnTrakt(el);
  assert.match(el.innerHTML, /kr 2\s400/);
});

test('unknown costs are omitted and incompatible channels keep the fallback breakdown', () => {
  const { window, el } = chart();
  const original = el.innerHTML;
  assert.equal(window.oppdaterTraktKanaler(el, [{ name: 'LinkedIn', cost: 99 }]), false);
  assert.equal(el.innerHTML, original);
  assert.equal(window.oppdaterTraktKanaler(el, [
    { name: 'Meta', cost: null }, { name: 'Nettsteder og aviser', cost: 0 }
  ]), true);
  assert.equal((el.innerHTML.match(/funnel__channel-cost/g) || []).length, 1);
  assert.match(el.innerHTML, /kr 0 per «Søk»/);
});
