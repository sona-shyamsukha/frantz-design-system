const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
function setup(extra = {}) {
  const window = { ...extra };
  vm.runInNewContext(fs.readFileSync('components/js/campaign-submission.js', 'utf8'), { window, Set });
  return window.FrantzCampaignSubmission;
}
test('captures every form field including future fields without retaining mutable form values', () => {
  const model = setup();
  const values = { stilling: 'Sykepleier', kanaler: ['Meta', 'LinkedIn'], future: 'A new submitted field' };
  const fields = model.capture([{ id: 'stilling', felt: [['stilling', 'Stilling']] }, { id: 'kampanje', felt: [['kanaler', 'Kanaler'], ['future', 'Future field']] }], key => values[key]);
  values.kanaler.push('Snapchat');
  assert.equal(fields.length, 3);
  assert.equal(fields[1].value, 'Meta, LinkedIn');
  assert.equal(fields[2].value, 'A new submitted field');
});
test('original submitted values survive later changes to campaign phase and settings', () => {
  const model = setup();
  const record = { id: 'm1', innsendt: '2026-10-27T12:00:00Z', ordre: { tittel: 'Original campaign', stilling: 'Sykepleier', budsjett: 15000, faktura: 'Client AS', frist: '2026-11-06', kildeTekst: 'Original source text', kildeLenke: 'https://example.com/job', notat: 'Finnmark too', tillegg: ['Meld interesse'], total: 16500, tilleggSum: 1500 }, materiell: { kilder: ['original.pdf'] } };
  for (const status of ['Bestilt', 'Under arbeid', 'Aktiv', 'Avsluttet']) {
    const result = model.normalize({ id: '42', materiellId: 'm1', status, budsjett: 99999, stilling: 'Later title' }, record, null);
    assert.equal(result.fields.find(f => f.id === 'budsjett').value, 'kr 15 000');
    assert.equal(result.fields.find(f => f.id === 'stilling').value, 'Sykepleier');
    assert.equal(result.fields.find(f => f.id === 'frist').value, '06.11.2026');
    assert.equal(result.fields.find(f => f.id === 'faktura').value, 'Client AS');
    assert.equal(result.source.text, 'Original source text');
    assert.equal(result.source.url, 'https://example.com/job');
    assert.equal(result.material.kilder[0], 'original.pdf');
  }
});
test('does not substitute another campaign session or original material record', () => {
  const model = setup();
  const result = model.normalize({ id: '42', materiellId: 'own', stilling: 'Own role' }, { id: 'other', ordre: { stilling: 'Foreign role' } }, { id: '43', stilling: 'Foreign session' });
  assert.equal(result.hasSubmission, false);
  assert.equal(result.fields.find(f => f.id === 'stilling').value, 'Own role');
});
test('preserves intentionally empty submitted fields instead of later campaign values', () => {
  const model = setup();
  const result = model.normalize({ id: '42', arbeidsgiver: 'Later employer', budsjett: 20000 }, { ordre: { arbeidsgiver: '', budsjett: null, kanaler: [] } }, null);
  assert.equal(result.fields.find(f => f.id === 'arbeidsgiver').value, '');
  assert.equal(result.fields.find(f => f.id === 'budsjett').value, 'Avklares med Frantz');
  assert.equal(result.fields.find(f => f.id === 'kanaler').value, '');
});
test('public report does not import private original submissions or campaign details', () => {
  assert.doesNotMatch(fs.readFileSync('portal/delt-rapport.html', 'utf8'), /src="[^"]*(?:campaign-submission|campaign-details)\.js/);
});
