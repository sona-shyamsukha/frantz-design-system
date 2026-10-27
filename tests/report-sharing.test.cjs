const test = require('node:test');
const assert = require('node:assert/strict');
const vm = require('node:vm');
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '..');

function load(relative, window = {}) {
  vm.runInNewContext(fs.readFileSync(path.join(root, relative), 'utf8'), { window, localStorage: window.localStorage, Date, URL, URLSearchParams });
  return window;
}

test('a report can omit every monetary value without omitting campaign results', () => {
  const window = load('portal/data/rapporter.js');
  load('components/js/report-view.js', window);
  for (const report of Object.values(window.FZ_REPORTS)) {
    const html = window.FrantzReportView.overview(report, { costs: false });
    assert.doesNotMatch(html, /Kostnad per|kr\s|Avtalt budsjett/);
    assert.match(html, /Trykket «Søk»/);
    assert.match(html, /ikke antall innsendte søknader/);
    assert.match(html, new RegExp(String(report.applications)));
  }
});

test('public report fixtures contain aggregates and no candidate or account records', () => {
  const window = load('portal/data/rapporter.js');
  const allowed = new Set(['id', 'title', 'employer', 'period', 'active', 'updated', 'budget', 'spend', 'cost', 'visits', 'applications', 'interest', 'impressions', 'goal', 'day', 'totalDays', 'start', 'read', 'readTime', 'assessment', 'channels', 'daily', 'ads', 'placements', 'geography', 'channelNames']);
  for (const report of Object.values(window.FZ_REPORTS)) {
    for (const key of Object.keys(report)) assert.ok(allowed.has(key), `Unexpected public field: ${key}`);
    assert.doesNotMatch(JSON.stringify(report), /@|"email"|"phone"|"contact"|"candidates"|"account"|"requests"/i);
    if (report.channels) assert.equal(report.channels.reduce((sum, channel) => sum + channel.applications, 0), report.applications);
    if (report.ads) assert.equal(report.ads.reduce((sum, ad) => sum + ad.applications, 0), report.applications);
    if (report.placements) assert.equal(report.placements.reduce((sum, site) => sum + site.impressions, 0), report.impressions - (report.active ? 117000 : 31000));
    if (report.daily) assert.equal(report.daily[0].length, report.daily[1].length);
  }
  const page = fs.readFileSync(path.join(root, 'portal/delt-rapport.html'), 'utf8');
  assert.doesNotMatch(page, /src="[^"]*(?:interessenter|konto|approval|kampanjer)\.js/);
});

test('revoked, expired and unknown report links cannot resolve to an active report', () => {
  const records = {
    active: { token: 'active-token', campaign: '129041', expires: '2999-01-01T00:00:00Z' },
    revoked: { token: 'revoked-token', revoked: true },
    expired: { token: 'expired-token', expires: '2000-01-01T00:00:00Z' }
  };
  const window = load('components/js/report-sharing.js', { localStorage: { getItem: () => JSON.stringify(records) } });
  const sharing = window.FrantzReportSharing;
  assert.equal(sharing.state(sharing.resolve('active-token')), 'active');
  assert.equal(sharing.state(sharing.resolve('revoked-token')), 'revoked');
  assert.equal(sharing.state(sharing.resolve('expired-token')), 'expired');
  assert.equal(sharing.state(sharing.resolve('unknown-token')), 'revoked');
});

test('each campaign list destination carries its own identity', () => {
  const window = load('portal/data/kampanjer.js');
  const routes = [];
  for (const campaign of window.FZ_KAMPANJER.alle()) {
    if (!['Aktiv', 'Avsluttet', 'Bestilt'].includes(campaign.status)) continue;
    const url = new URL(campaign.side, 'https://example.invalid/portal/');
    assert.equal(url.searchParams.get('id'), campaign.id);
    routes.push(url.href);
  }
  assert.equal(new Set(routes).size, routes.length);
});

// List totals are the only recorded results for these campaigns. Missing figures must
// not become zero or be borrowed from the completed Bodø fixture.
test('every ended campaign retains its own aggregates without invented breakdowns', () => {
  const window = load('portal/data/kampanjer.js');
  load('portal/data/rapporter.js', window);
  load('components/js/report-view.js', window);
  for (const campaign of window.FZ_KAMPANJER.alle().filter(c => c.status === 'Avsluttet')) {
    const report = window.FZ_REPORTS[campaign.id];
    assert.ok(report, `Missing report for ${campaign.id}`);
    assert.equal(report.title, campaign.tittel);
    assert.equal(report.budget, campaign.budsjett);
    assert.equal(report.applications, campaign.sok);
    if (campaign.id === '128984') continue;
    for (const field of ['visits', 'cost', 'interest', 'goal', 'daily', 'ads', 'assessment', 'channels']) assert.equal(report[field], undefined);
    const html = window.FrantzReportView.overview(report, { costs: true });
    assert.doesNotMatch(html, /NaN|undefined|kr 0|Besøk på|Meldte interesse|planlagte klikk/);
    assert.match(html, /Detaljert fordeling per kanal er ikke tilgjengelig/);
  }
});
