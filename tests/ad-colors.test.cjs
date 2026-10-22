const {test} = require('node:test');
const assert = require('node:assert/strict');
const vm = require('node:vm');
const fs = require('node:fs');
const window = {};
vm.runInNewContext(fs.readFileSync('components/js/ad-colors.js','utf8'),{window});
const colors = window.FrantzAdColors;
test('text remains legible across light, dark and middle-tone backgrounds', () => {
 for (const background of ['#174c50','#ecefe9','#ffffff','#000000','#777777','#f6a321','#0c3f59','#ff00ff']) {
  assert.ok(colors.contrast(background,colors.textFor(background)) >= 4.5, background);
 }
});
test('uses white on the dark default and dark text on the light default',()=>{
 assert.equal(colors.textFor('#174c50'),'#ffffff');
 assert.equal(colors.textFor('#ecefe9'),'#123c42');
});
