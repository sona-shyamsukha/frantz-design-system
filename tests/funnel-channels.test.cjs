const { test } = require('node:test');
const assert = require('node:assert/strict');
const vm = require('node:vm');
const fs = require('node:fs');

function chart(options = {}) {
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
  ], ...options };
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

test('reported funnels support every channel without a repeated measurement section', () => {
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
  assert.doesNotMatch(el.innerHTML, /Se målinger per kanal og strategi|funnel__channel-details|funnel__measurement/);
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



function channelPath(html, token) {
  const paths = [...html.matchAll(/<path d="([^"]+)" fill="([^"]+)"/g)];
  return paths.find(match => match[2] === 'var(' + token + ')')?.[1];
}

test('each legend toggle changes only its own channel and preserves source totals', () => {
  const { window, el, data } = chart({ kanalvalg: true });
  const before = JSON.stringify(data);
  window.oppdaterTraktKanaler(el, [
    { name: 'Meta', cost: 2400, funnel: [60, 6] },
    { name: 'Nettsteder og aviser', cost: 1200, funnel: [40, 4] }
  ]);
  const originalBlue = channelPath(el.innerHTML, '--kanal-meta');
  const originalGreen = channelPath(el.innerHTML, '--kanal-nettsteder');
  assert.equal(window.toggleTraktKanal(el, 'Meta'), true);
  assert.match(el.innerHTML, /Fra 40 relevante besøk til 4/);
  assert.equal(channelPath(el.innerHTML, '--kanal-meta'), undefined);
  const green = channelPath(el.innerHTML, '--kanal-nettsteder');
  assert.ok(green);
  assert.equal((green.match(/M /g) || []).length, 1, 'The remaining channel is filled without a cutout');
  assert.match(el.innerHTML, /data-trakt-toggle="Meta" aria-pressed="false"/);
  assert.match(el.innerHTML, /data-trakt-toggle="Nettsteder og aviser" aria-pressed="true"/);
  assert.match(el.innerHTML, /kr 2\s400 per «Søk»/);
  window.toggleTraktKanal(el, 'Meta');
  assert.match(el.innerHTML, /Fra 100 relevante besøk til 10/);
  assert.equal(channelPath(el.innerHTML, '--kanal-meta'), originalBlue);
  assert.equal(channelPath(el.innerHTML, '--kanal-nettsteder'), originalGreen);
  window.toggleTraktKanal(el, 'Nettsteder og aviser');
  assert.match(el.innerHTML, /Fra 60 relevante besøk til 6/);
  window.toggleTraktKanal(el, 'Meta');
  assert.match(el.innerHTML, /Ingen kanaler valgt/);
  assert.equal(channelPath(el.innerHTML, '--kanal-meta'), undefined);
  assert.equal(channelPath(el.innerHTML, '--kanal-nettsteder'), undefined);
  assert.match(el.innerHTML, /data-trakt-toggle="Nettsteder og aviser" aria-pressed="false"/);
  window.toggleTraktKanal(el, 'Nettsteder og aviser');
  assert.match(el.innerHTML, /Fra 40 relevante besøk til 4/);
  assert.equal(window.toggleTraktKanal(el, 'Unknown'), false);
  window.toggleTraktKanal(el, 'Meta');
  assert.match(el.innerHTML, /Fra 100 relevante besøk til 10/);
  assert.equal(JSON.stringify(data), before);
});

test('four stages sum only enabled channels and allow both channels to be off', () => {
  const { window, el } = chart({ kanalvalg: true, stegIndekser: [2, 3, 4, 5],
    navn: ['Views', 'Clicks', 'Relevante besøk', 'Begynte å lese', 'Leste stillingsteksten', 'Trykket «Søk»'],
    verdier: [1000, 100, 80, 60, 40, 8],
    lag: [{ navn: 'Meta', v: [600, 60, 50, 40, 30, 6] }, { navn: 'Nettsteder og aviser', v: [400, 40, 30, 20, 10, 2] }]
  });
  assert.match(el.innerHTML, /Fra 80 relevante besøk til 8/);
  assert.equal((el.innerHTML.match(/class="funnel__cell"/g) || []).length, 4);
  window.toggleTraktKanal(el, 'Meta');
  assert.match(el.innerHTML, /Fra 30 relevante besøk til 2/);
  window.toggleTraktKanal(el, 'Nettsteder og aviser');
  assert.match(el.innerHTML, /Ingen kanaler valgt/);
  assert.doesNotMatch(el.innerHTML, /NaN|Infinity/);
  window.toggleTraktKanal(el, 'Nettsteder og aviser');
  assert.match(el.innerHTML, /Fra 30 relevante besøk til 2/);
  window.toggleTraktKanal(el, 'Meta');
  assert.match(el.innerHTML, /Fra 80 relevante besøk til 8/);
});

test('new channels start enabled while existing channel states are retained', () => {
  const { window, el } = chart({ kanalvalg: true });
  window.toggleTraktKanal(el, 'Meta');
  window.oppdaterTraktKanaler(el, [
    { name: 'LinkedIn', funnel: [20, 2] }, { name: 'Meta', funnel: [0, 0] }
  ]);
  assert.match(el.innerHTML, /Fra 20 relevante besøk til 2/);
  window.toggleTraktKanal(el, 'LinkedIn');
  assert.match(el.innerHTML, /Ingen kanaler valgt/);
  window.toggleTraktKanal(el, 'Meta');
  assert.match(el.innerHTML, /Fra 0 relevante besøk til 0/);
  assert.doesNotMatch(el.innerHTML, /NaN|Infinity/);
});

test('LinkedIn reproduces the reference portal proportions rather than a square-root curve', () => {
  // Observed reference: 14 visits, 10 began reading, 4 read the text, 0 clicked apply.
  const { window, el } = chart({ kanalvalg: true, skala: 'rot',
    navn: ['Relevante besøk', 'Begynte å lese', 'Leste stillingsteksten', 'Trykket «Søk»'],
    verdier: [391, 329, 223, 11],
    lag: [
      { navn: 'Meta', v: [377, 319, 219, 11], farge: 'var(--kanal-meta)' },
      { navn: 'LinkedIn', v: [14, 10, 4, 0], farge: 'var(--kanal-linkedin)' }
    ]
  });
  window.toggleTraktKanal(el, 'Meta');
  assert.match(el.innerHTML, /Fra 14 relevante besøk til 0/);
  const path = channelPath(el.innerHTML, '--kanal-linkedin');
  const coordinates = path.match(/-?\d+(?:\.\d+)?(?:e[+-]?\d+)?/g).map(Number);
  const usableHeight = 206;
  assert.ok(Math.abs(coordinates[7] - (115 - usableHeight * (10 / 14) / 2)) < 0.000001,
    '71.4% of the initial thickness after beginning to read');
  assert.ok(Math.abs(coordinates[13] - (115 - usableHeight * (4 / 14) / 2)) < 0.000001,
    '28.6% of the initial thickness after reading the full text');
  assert.equal(coordinates[19], 115, '0 apply clicks collapses the funnel to its centre line');
  assert.match(path, / L 1000 115 /);
  window.toggleTraktKanal(el, 'LinkedIn');
  window.toggleTraktKanal(el, 'Meta');
  assert.notEqual(channelPath(el.innerHTML, '--kanal-meta'), path, 'Channel profiles change the shape');
});

test('combined channels are adjacent bands with the same outer contour as the total funnel', () => {
  const { el } = chart({ kanalvalg: true,
    verdier: [100, 50],
    lag: [
      { navn: 'Meta', v: [60, 20], farge: 'var(--kanal-meta)' },
      { navn: 'Nettsteder og aviser', v: [40, 30], farge: 'var(--kanal-nettsteder)' }
    ]
  });
  const blue = channelPath(el.innerHTML, '--kanal-meta');
  const green = channelPath(el.innerHTML, '--kanal-nettsteder');
  const greenStart = Number(green.match(/^M 0 ([\d.]+)/)[1]);
  const blueEnd = Number(blue.match(/, 0 ([\d.]+) Z$/)[1]);
  assert.equal(greenStart, blueEnd, 'Channels touch at the same boundary, without a hole or double counting');
  assert.match(blue, /^M 0 12 /);
  assert.match(green, /, 0 218 Z$/);
});
