const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const window = {};
vm.runInNewContext(fs.readFileSync('components/js/campaign-validation.js', 'utf8'), { window });
const errors = window.FrantzCampaignValidation.errors;
const valid = () => ({ position: 'Sykepleier', locations: ['Kristiansand'], budget: 15000,
  channels: ['Meta'], minimum: 6000, period: { start: 100, end: 200 } });
const fields = result => Array.from(result, error => error.felt);

test('a complete order permits an omitted reference and missing optional materials', () => {
  assert.equal(errors({ ...valid(), reference: '', material: null }).length, 0);
});

test('every missing required field gets a specific error in focus order', () => {
  const result = errors({ position: '   ', locations: [], budget: null, channels: [], period: {} });
  assert.deepEqual(fields(result), ['stilling', 'sted', 'budsjett', 'kanaler', 'periode']);
  assert.match(result[0].tekst, /Skriv inn en stilling/);
  assert.match(result[1].tekst, /Velg minst ett arbeidssted/);
  assert.match(result[3].tekst, /Velg minst én kanal/);
});

test('budget errors distinguish an absent amount from a channel minimum', () => {
  for (const budget of [0, -1, NaN, null]) {
    assert.match(errors({ ...valid(), budget })[0].tekst, /Skriv inn kampanjebudsjettet/);
  }
  const result = errors({ ...valid(), budget: 5000, minimum: 14000 });
  assert.deepEqual(fields(result), ['budsjett']);
  assert.match(result[0].tekst, /14\s000/);
  assert.equal(errors({ ...valid(), budget: 14000, minimum: 14000 }).length, 0);
});

test('a channel correction clears its own error without clearing the missing budget', () => {
  const input = { ...valid(), channels: [], budget: 0 };
  assert.deepEqual(fields(errors(input)), ['budsjett', 'kanaler']);
  input.channels = ['Meta'];
  assert.deepEqual(fields(errors(input)), ['budsjett']);
  input.budget = 15000;
  assert.deepEqual(fields(errors(input)), []);
});

test('the period must be selected, complete and in chronological order', () => {
  for (const period of [{ start: 100, end: 200, open: true }, { start: 100, end: 200, waiting: true }, { start: NaN, end: 200 }, { start: 100, end: NaN }, { start: 200, end: 100 }]) {
    assert.deepEqual(fields(errors({ ...valid(), period })), ['periode']);
  }
  assert.equal(errors({ ...valid(), period: { start: 100, end: 100 } }).length, 0);
});
