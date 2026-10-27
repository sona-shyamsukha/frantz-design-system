/* Architectural guard: ordinary expanders must not acquire independent page styles. */
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '..');

test('ordinary portal disclosures use the shared component', () => {
  for (const name of fs.readdirSync(path.join(root, 'portal')).filter(name => name.endsWith('.html'))) {
    const html = fs.readFileSync(path.join(root, 'portal', name), 'utf8');
    for (const match of html.matchAll(/<details\b[^>]*>/g)) {
      const classes = /class="([^"]*)"/.exec(match[0])?.[1].split(/\s+/) || [];
      assert.ok(classes.includes('disclosure') || classes.includes('ordre-meny'), `${name}: unaccounted expander ${match[0]}`);
    }
  }
});

test('campaign pages do not define competing help or editor accordion styles', () => {
  for (const name of ['dashboard.html', 'campaign.html', 'rapport.html', 'ny-kampanje.html', 'ny-kampanje-alternativ.html']) {
    const html = fs.readFileSync(path.join(root, 'portal', name), 'utf8');
    assert.doesNotMatch(html, /\.forklar\s+summary|\.an-mer__knapp\s*\{|\.flere\s*>\s*summary/);
  }
  const approval = fs.readFileSync(path.join(root, 'components/del-godkjenning/approval.css'), 'utf8');
  assert.doesNotMatch(approval, /\.approval-(?:message|test)\s*>?\s*summary/);
  assert.match(fs.readFileSync(path.join(root, 'frantz-ds.css'), 'utf8'), /components\/disclosure\/componentDisclosure\.css/);
});
