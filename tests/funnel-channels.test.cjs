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

test('reported funnels support every channel, strategy rows and explicit unavailable reading times', () => {
  const { window, el } = chart();
  const channels = ['Meta', 'LinkedIn', 'Snapchat', 'TikTok', 'Nettsteder og aviser'].map((name, i) => ({
    name, cost: 100 + i, funnel: [20, 2],
    strategies: name === 'Meta' ? [{ name: 'QA strategy <one>', funnel: [10, 1], readTime: '45 s' }] : undefined
  }));
  const before = JSON.stringify(channels);
  assert.equal(window.oppdaterTraktKanaler(el, channels), true);
  for (const channel of channels) assert.ok(el.innerHTML.includes(channel.name));
  for (const token of ['--kanal-meta', '--kanal-linkedin', '--color-amber', '--color-violet', '--kanal-nettsteder']) {
    assert.match(el.innerHTML, new RegExp('fill="var\\(' + token + '\\)"'));
  }
  assert.match(el.innerHTML, /Se målinger per kanal og strategi/);
  assert.match(el.innerHTML, /QA strategy &lt;one&gt;/);
  assert.match(el.innerHTML, /45 s/);
  assert.match(el.innerHTML, /målingen ikke er tilgjengelig/);
  assert.equal(JSON.stringify(channels), before);
});

test('report channel counts and aggregate funnel totals agree', () => {
  const window = {};
  vm.runInNewContext(fs.readFileSync('portal/data/rapporter.js', 'utf8'), { window });
  for (const report of Object.values(window.FZ_REPORTS).filter(report => report.channels)) {
    const sum = index => report.channels.reduce((value, channel) => value + channel.funnel[index], 0);
    assert.equal(sum(0), report.impressions);
    assert.equal(sum(2), report.visits);
    assert.equal(sum(4), report.read);
    assert.equal(sum(5), report.applications);
    for (const channel of report.channels) assert.equal(channel.funnel[5], channel.applications);
  }
});
