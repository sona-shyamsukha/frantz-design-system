const { test } = require('node:test');
const assert = require('node:assert/strict');
const vm = require('node:vm');
const fs = require('node:fs');
const { File } = require('node:buffer');

function setup() {
  const listeners = {};
  const window = { crypto: { randomUUID: () => 'material-test' } };
  const document = {
    addEventListener(type, handler) { listeners[type] = handler; },
    querySelectorAll() { return []; }
  };
  vm.runInNewContext(fs.readFileSync('components/js/campaign-material.js', 'utf8'), { window, document });
  const ad = { bilde: 'akutten-sykepleier.jpg', egetBilde: true, utseende: {} };
  const options = { ad, mode: 'bygg', channels: ['Meta'], files: [] };
  return { snapshot: () => window.FrantzCampaignMaterial.snapshot({ stilling: 'Sykepleier' }, options), listeners, options, ad };
}

test('keeps the uploaded original rather than its temporary preview URL', () => {
  const s = setup();
  const file = new File(['original'], 'image.png', { type: 'image/png' });
  s.listeners.change({ target: { id: 'an-bilde-fil', files: [file] } });
  s.ad.bildeUrl = 'blob:temporary';
  assert.equal(s.snapshot().materiell.bilde.fil, file);
  assert.equal(s.snapshot().materiell.bilde.sti, undefined);
});

test('refuses an uploaded preview when the original is unavailable', () => {
  const s = setup();
  s.ad.bildeUrl = 'blob:expired';
  assert.throws(s.snapshot, /original image/);
});

test('does not attach a previous upload after choosing a library image', () => {
  const s = setup();
  const file = new File(['old'], 'old.png', { type: 'image/png' });
  s.listeners.change({ target: { id: 'an-bilde-fil', files: [file] } });
  s.listeners.click({ target: { closest(selector) { return selector.includes('data-annonse-bilde') ? {} : null; } } });
  const image = s.snapshot().materiell.bilde;
  assert.equal(image.fil, undefined);
  assert.equal(image.sti, '../assets/media/akutten-sykepleier.jpg');
  s.ad.bilde = '../../private.png';
  assert.throws(s.snapshot, /original image/);
});

test('keeps remaining attachments aligned after removal', () => {
  const s = setup();
  s.options.mode = 'hjelp';
  s.ad.egetBilde = false;
  const first = new File(['a'], 'a.pdf', { type: 'application/pdf' });
  const second = new File(['b'], 'b.pdf', { type: 'application/pdf' });
  s.listeners.change({ target: { id: 'filer', files: [first, second] } });
  s.listeners.click({ target: { closest(selector) { return selector === '[data-fjern-fil]' ? { dataset: { fjernFil: '0' } } : null; } } });
  s.options.files = ['b.pdf'];
  assert.equal(s.snapshot().materiell.filer[0].fil, second);
  s.options.files = ['restored-but-missing.pdf'];
  assert.equal(s.snapshot().materiell.filer[0].fil, null);
});

test('keeps the file supplied on the job-information step', () => {
  const s = setup();
  const file = new File(['job'], 'stilling.png', { type: 'image/png' });
  s.options.sourceFile = file;
  assert.equal(s.snapshot().materiell.kilder[0].fil, file);
  assert.equal(s.snapshot().materiell.kilder[0].kilde, 'stillingsgrunnlag');
});

test('keeps every source attachment with its original file', () => {
  const s = setup();
  const first = new File(['job'], 'stilling.pdf', { type: 'application/pdf' });
  const second = new File(['brief'], 'brief.docx');
  s.options.sourceFiles = [first, second];
  const sources = s.snapshot().materiell.kilder;
  assert.equal(sources.length, 2);
  assert.equal(sources[0].fil, first);
  assert.equal(sources[1].fil, second);
  s.options.sourceFiles = [];
  assert.equal(s.snapshot().materiell.kilder.length, 0);
});

test('retains the selected ad template with the submitted material', () => {
  const s = setup();
  s.ad.template = 'frame';
  assert.equal(s.snapshot().materiell.template, 'frame');
});

test('saves a copy of the chosen crop with the order',()=>{
 const s=setup();s.ad.crop={x:20,y:70,zoom:1.6,fit:'cover'};
 const stored=s.snapshot().materiell.crop;
 s.ad.crop.x=80;
 assert.equal(stored.x,20);assert.equal(stored.zoom,1.6);assert.equal(stored.fit,'cover');
});

test('keeps the original custom logo with the order without saving its preview URL', () => {
  const s = setup();
  const file = new File(['logo'], 'client-logo.png', { type: 'image/png' });
  s.ad.logoFil = file;
  s.ad.logoUrl = 'blob:temporary-logo';
  const logo = s.snapshot().materiell.logo;
  assert.equal(logo.fil, file);
  assert.equal(logo.navn, 'client-logo.png');
  assert.equal(logo.url, undefined);
  s.ad.logoFil = null;
  assert.equal(s.snapshot().materiell.logo, null);
});
