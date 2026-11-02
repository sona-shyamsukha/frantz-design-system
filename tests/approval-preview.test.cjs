const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const { File } = require('node:buffer');

class Element {
  constructor(tag) {
    this.tagName = tag.toUpperCase(); this.children = []; this.dataset = {};
    this.style = { setProperty() {} }; this.classList = { add() {}, toggle() {} };
    this.attributes = {}; this.hidden = false;
  }
  append(...nodes) { nodes.forEach(node => this.appendChild(node)); }
  appendChild(node) { node.parentElement = this; this.children.push(node); return node; }
  replaceChildren(...nodes) { this.children = []; this.append(...nodes); }
  prepend(node) { this.children.unshift(node); }
  setAttribute(name, value) { this.attributes[name] = value; }
  addEventListener() {}
  querySelectorAll(tag) { return this.children.flatMap(node => [node, ...node.querySelectorAll(tag)]).filter(node => node.tagName === tag.toUpperCase()); }
}

function setup() {
  const files = [], revoked = [];
  const window = { crypto: { randomUUID: () => 'format' }, FrantzAdLogo: { render() {} }, FrantzAdColors: { textFor: () => '#000' }, FrantzAdCrop: { apply() {} } };
  vm.runInNewContext(fs.readFileSync('components/js/approval-preview.js', 'utf8'), {
    window, Blob, document: { createElement: tag => new Element(tag) },
    URL: { createObjectURL(file) { files.push(file); return 'blob:qa-' + files.length; }, revokeObjectURL(url) { revoked.push(url); } }
  });
  return { preview: window.FrantzApprovalPreview, host: new Element('div'), files, revoked };
}

test('a recipient can inspect every frozen image and video in a multi-file approval', () => {
  const s = setup();
  const first = new File(['first'], 'square.png', { type: 'image/png' });
  const second = new File(['second'], 'story.jpg', { type: 'image/jpeg' });
  const video = new File(['video'], 'video.mp4', { type: 'video/mp4' });
  const material = { modus: 'ferdig', ferdig: true, bilde: { navn: first.name, fil: first }, filer: [{ navn: second.name, fil: second }, { navn: video.name, fil: video }], utseende: {} };
  s.preview.mount(s.host, { title: 'Sykepleier Oslo', channels: ['Meta', 'LinkedIn'], material });
  assert.equal(s.host.children.filter(node => node.tagName === 'SECTION').length, 3);
  assert.deepEqual(s.files, [first, second, video]);
  assert.equal(s.host.querySelectorAll('img').filter(node => !node.hidden).length, 2);
  assert.equal(s.host.querySelectorAll('video').filter(node => !node.hidden).length, 1);
  assert.equal(material.filer.length, 2, 'rendering must not change the saved snapshot');
  s.host._cleanup();
  assert.equal(s.revoked.length, 3);
});

test('a single supplied ad stays a single preview and retains its own supported channels', () => {
  const s = setup();
  const file = new File(['image'], 'ad.png', { type: 'image/png' });
  s.preview.mount(s.host, { title: 'Own campaign', channels: ['TikTok', 'Snapchat'], material: { ferdig: true, bilde: { navn: file.name, fil: file }, utseende: {} } });
  assert.deepEqual(s.files, [file]);
  assert.equal(s.host.children.filter(node => node.tagName === 'SECTION').length, 0);
  assert.deepEqual(Array.from(s.preview.channels(['TikTok', 'Snapchat']), item => item.name), ['TikTok', 'Snapchat']);
});
