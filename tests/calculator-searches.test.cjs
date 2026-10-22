const test = require('node:test');
const assert = require('node:assert/strict');
const searches = require('../components/js/calculator-searches.js');
const criteria = { stilling: 'Sykepleier & helsefag', steder: ['Tromsø (by)', 'Ålesund (by)'], budsjett: 23500 };
function storage(initial) {
  let value = initial;
  return { getItem: () => value, setItem: (_, next) => { value = next; } };
}
test('shared links round-trip all criteria without unrelated parameters', () => {
  const link = searches.toUrl('https://example.no/portal/kalkulator.html?bruker=ny&unrelated=1#old', criteria);
  assert.deepEqual(searches.fromUrl(link), criteria);
  assert.equal(new URL(link).searchParams.get('bruker'), 'ny');
  assert.equal(new URL(link).searchParams.has('unrelated'), false);
  assert.equal(new URL(link).hash, '');
});
test('malformed or incomplete links do not replace the default search', () => {
  for (const budget of ['NaN', '-2', 'Infinity', '100000001', '']) {
    assert.equal(searches.fromUrl('https://example.no/?stilling=Test&sted=Oslo&budsjett=' + budget), null);
  }
  assert.equal(searches.fromUrl('https://example.no/?budsjett=12000'), null);
});
test('named searches persist; repeated identical saves update the existing row', () => {
  const store = storage('[]');
  const first = searches.save(store, criteria, ' Helse · høst ');
  const again = searches.save(store, criteria, 'Helse · høst');
  assert.equal(first.id, again.id);
  assert.equal(searches.read(store).length, 1);
  assert.deepEqual(searches.criteria(searches.read(store)[0]), criteria);
  searches.save(store, { ...criteria, budsjett: 30000 }, 'Helse · høst');
  assert.equal(searches.read(store).length, 2);
});
test('corrupt storage is recoverable and write failures are reported', () => {
  assert.deepEqual(searches.read(storage('{broken')), []);
  assert.deepEqual(searches.read(storage('[null,{}, {"navn":"unsafe"}]')), []);
  assert.throws(() => searches.save({ getItem: () => null, setItem: () => { throw Error('full'); } }, criteria, 'Søk'), /full/);
});
