const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const window = {};
vm.runInNewContext(fs.readFileSync('components/js/campaign-pricing.js', 'utf8'), { window });
const pricing = window.FrantzCampaignPricing;

test('original order prices override later campaign budgets without inferring allocations from performance', () => {
  const input = { order: { budsjett: 15000, tilleggSum: 8000, total: 23000, kanaler: ['Meta', 'LinkedIn'] }, campaign: { budsjett: 90000 } };
  const before = JSON.stringify(input);
  const result = pricing.model(input, { budget: 60000, channels: [{ name: 'Meta', cost: 100, applications: 150 }] });
  assert.equal(result.budget, 15000);
  assert.equal(result.total, 23000);
  assert.equal(result.channels[0].price, null);
  assert.equal(JSON.stringify(input), before);
});

test('recorded delivery prices and addon quantity, unit price and free items are retained', () => {
  const input = { order: { budsjett: 1000, tilleggSum: 600, prislinjer: {
    kanaler: [{ name: 'Meta', strategy: 'QA test', period: '01.11–15.11', price: 1000 }],
    tillegg: [{ name: 'QA service', quantity: 2, unitPrice: 300, price: 600 }, { name: 'QA free', quantity: 1, unitPrice: 0, price: 0 }]
  } } };
  const result = pricing.model(input);
  assert.equal(result.total, 1600);
  assert.equal(result.extras[0].quantity, 2);
  assert.equal(result.extras[0].unitPrice, 300);
  assert.equal(result.extras[1].price, 0);
  const html = pricing.render(input);
  assert.match(html, /01.11–15.11/);
  assert.match(html, /kr 600/);
  assert.match(html, /kr 0/);
  assert.doesNotMatch(html, /<input|<button|contenteditable/);
});

test('legacy reports keep unknown extras and totals unknown and escape supplied descriptions', () => {
  const result = pricing.model({ campaign: { kanaler: ['LinkedIn'] } }, { budget: 5000 });
  assert.equal(result.budget, 5000);
  assert.equal(result.total, null);
  assert.equal(result.extrasTotal, null);
  assert.equal(result.channels[0].price, null);
  const html = pricing.render({ order: { tillegg: ['<script>test</script>'] } });
  assert.doesNotMatch(html, /<script>/);
  assert.match(html, /&lt;script&gt;/);
  assert.match(html, /Ikke registrert/);
});

test('unsupported ranking and normal-level claims are absent from campaign templates', () => {
  for (const name of ['campaign.html', 'rapport.html']) {
    const html = fs.readFileSync('portal/' + name, 'utf8');
    assert.doesNotMatch(html, /Beste annonse|\d+ % lavere enn normalt|mot \d+ % normalt|Video ga \d+ ganger|ad-card--best/);
    assert.doesNotMatch(html, /id="dag-for-dag"|id="dagsgraf"|tegnUkegraf/);
    assert.match(html, /visStegRater: false/);
    assert.match(html, /Hvor ble annonsene vist/);
  }
});
