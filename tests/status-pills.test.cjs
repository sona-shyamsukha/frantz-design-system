const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');

const tokens = Object.fromEntries([...fs.readFileSync('tokens/base.css', 'utf8')
  .matchAll(/(--[\w-]+)\s*:\s*([^;]+);/g)].map(([, name, value]) => [name, value.trim()]));
const badges = fs.readFileSync('components/badge/componentBadge.css', 'utf8');
const window = {};
vm.runInNewContext(fs.readFileSync('components/js/ad-colors.js', 'utf8'), { window });

function resolve(value) {
  const reference = /^var\((--[\w-]+)\)$/.exec(value);
  if (reference) return resolve(tokens[reference[1]]);
  assert.match(value, /^#[\da-f]{6}$/i, 'Expected an opaque colour token');
  return value;
}

const states = ['active', 'draft', 'paused', 'ordered', 'ended', 'setup'].map(state => {
  const rule = badges.match(new RegExp('\\.badge--' + state + ',[^}]+\\{([^}]+)\\}'));
  assert.ok(rule, 'Missing shared campaign status: ' + state);
  return {
    state,
    background: resolve(rule[1].match(/background:\s*([^;]+);/)[1].trim()),
    text: resolve(rule[1].match(/\bcolor:\s*([^;]+);/)[1].trim())
  };
});

test('every campaign status meets WCAG AA text contrast on its light fill', () => {
  for (const { state, background, text } of states) {
    assert.ok(window.FrantzAdColors.contrast(background, text) >= 4.5, state);
  }
});

test('text-coloured status borders remain distinct on grey pages and white tables', () => {
  for (const { state, text } of states) {
    for (const surface of ['--surface-page', '--surface-raised']) {
      assert.ok(window.FrantzAdColors.contrast(text, resolve(tokens[surface])) >= 3,
        state + ' on ' + surface);
    }
  }
});
