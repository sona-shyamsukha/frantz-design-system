const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const source = fs.readFileSync('portal/ny-kampanje.html', 'utf8');

function setup() {
  const fields = { ref: { value: '' }, stilling: { value: 'Sykepleier' } };
  let locations = [{ navn: 'Kristiansand' }];
  const context = {
    $: id => fields[id],
    steder: { verdi: () => locations },
    FrantzPicker: { delSted: value => value },
    tilstand: { v2ok: { navn: 'Previously saved name' }, v2kilde: {} }
  };
  vm.createContext(context);
  for (const name of ['kampanjereferanse', 'v2VisVerdi']) {
    const match = source.match(new RegExp('  function ' + name + '\\([^)]*\\) \\{[\\s\\S]*?\\n  \\}'));
    assert.ok(match, `Missing ${name}`);
    vm.runInContext(match[0], context);
  }
  return { fields, context, locations: value => { locations = value; } };
}

test('blank references remain empty rather than being replaced with the job name', () => {
  const { fields, context, locations } = setup();
  for (const value of ['', '   ']) {
    fields.ref.value = value;
    assert.equal(context.kampanjereferanse(), '');
    assert.equal(fields.ref.value, value);
    assert.equal(context.v2VisVerdi('navn'), '', 'Stale saved names cannot replace an intentionally blank reference');
  }
  fields.stilling.value = 'Jordmor';
  locations([{ navn: 'Bergen' }]);
  assert.equal(context.kampanjereferanse(), '');
  locations([]);
  assert.equal(context.kampanjereferanse(), '');
});

test('an explicit reference is retained and clearing it leaves the reference unspecified', () => {
  const { fields, context } = setup();
  fields.ref.value = '  Oppdrag 42  ';
  assert.equal(context.kampanjereferanse(), 'Oppdrag 42');
  fields.stilling.value = 'Helsefagarbeider';
  assert.equal(context.v2VisVerdi('navn'), 'Oppdrag 42');
  fields.ref.value = '';
  assert.equal(context.v2VisVerdi('navn'), '');
});

test('campaign name is optional when validating an order', () => {
  const list = source.match(/var V2OBLIGATORISK = (\[[^;]+\]);/)[1];
  const required = vm.runInNewContext(list);
  assert.equal(required.includes('navn'), false);
  for (const field of ['stilling', 'sted', 'budsjett', 'kanaler']) assert.ok(required.includes(field));
});
