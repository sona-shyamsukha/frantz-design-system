const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const page = fs.readFileSync(path.join(__dirname, '../portal/dashboard.html'), 'utf8');
const controller = page.match(/<script>\s*(\/\/ Hjem[\s\S]*?)<\/script>/)[1];

function campaign(status, fields = {}) {
  return { status, bestiller: 'Kari Hansen', tittel: 'Sykepleier Oslo', arbeidsgiver: 'Sykehuset',
    side: 'campaign.html', fra: '2026-10-01', til: '2026-10-14', periode: '01.10–14.10',
    dag: 2, lengde: 14, budsjett: 10000, ...fields };
}

function render(campaigns) {
  const elements = new Map();
  const document = { getElementById(id) {
    if (!elements.has(id)) elements.set(id, { hidden: false, innerHTML: '', textContent: '',
      classes: new Set(), classList: { toggle(name, enabled) {
        const classes = elements.get(id).classes;
        enabled ? classes.add(name) : classes.delete(name);
      } } });
    return elements.get(id);
  } };
  vm.runInNewContext(controller, { document, FZ_KAMPANJER: {
    alle: () => campaigns, dato: value => value, badge: () => 'badge'
  } });
  return id => document.getElementById(id);
}

test('active campaigns without completed results or pending tasks use the full width', () => {
  const get = render([campaign('Aktiv'), campaign('Avsluttet', { bestiller: 'Ingrid Moe', sok: 4 })]);
  assert.equal(get('resultat-panel').hidden, true);
  assert.equal(get('venter-kort').hidden, true);
  assert.equal(get('hjem-kolonner').classes.has('cols--uten-resultater'), true);
});

test('a draft keeps the action section visible even without a campaign under preparation', () => {
  const get = render([campaign('Kladd', { side: 'ny-kampanje.html?kladd=1' })]);
  assert.equal(get('venter-kort').hidden, false);
  assert.match(get('venter-liste').innerHTML, /Fortsett kladden/);
  assert.equal(get('resultat-panel').hidden, true);
});

test('completed campaigns with zero or unavailable clicks remain visible without invalid prices', () => {
  const get = render([campaign('Avsluttet', { sok: 0 }), campaign('Avsluttet')]);
  assert.equal(get('resultat-panel').hidden, false);
  assert.match(get('resultat-liste').innerHTML, /0 «Søk»/);
  assert.match(get('resultat-liste').innerHTML, /Resultat kommer/);
  assert.doesNotMatch(get('resultat-liste').innerHTML, /Infinity|NaN|Billigst/);
});

test('completed results and outstanding approvals keep both sections visible', () => {
  const get = render([campaign('Under arbeid'), campaign('Avsluttet', { sok: 10 })]);
  assert.equal(get('venter-kort').hidden, false);
  assert.equal(get('resultat-panel').hidden, false);
  assert.equal(get('hjem-kolonner').classes.has('cols--uten-resultater'), false);
  assert.match(get('resultat-liste').innerHTML, /kr 1\u00a0000 per «Søk»/);
});
