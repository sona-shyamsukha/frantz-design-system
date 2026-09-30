/* Annonse-studio: live preview of the ad. Starts from the brand defaults in Innstillinger → Merkevare. */
(function () {
  if (!document.getElementById('post')) return;
  var $ = function (id) { return document.getElementById(id); };
  var post = $('post'), kreativ = $('pv-kreativ'), bilde = $('pv-bilde'), felt = $('st-bildefelt');
  var bildeUrl = '';
  function tekster() {
    $('pv-tittel').textContent = $('st-tittel').value;
    $('pv-tekst').textContent = $('st-tekst').value;
    $('pv-stilling').lastChild.textContent = $('st-stilling').value;
  }
  ['st-tittel', 'st-tekst', 'st-stilling'].forEach(function (id) { $(id).addEventListener('input', tekster); });
  function farge(par, varNavn) {
    var c = $(par), h = $(par + '-hex');
    var sett = function (v) { kreativ.style.setProperty(varNavn, v); };
    c.addEventListener('input', function () { h.value = c.value; sett(c.value); });
    h.addEventListener('input', function () { if (/^#[0-9a-f]{6}$/i.test(h.value)) { c.value = h.value; sett(h.value); } });
    sett(c.value);
  }
  try {
    var bg = localStorage.getItem('frantz-std-bg'), chip = localStorage.getItem('frantz-std-chip'), logo = localStorage.getItem('frantz-std-logo');
    if (bg) $('st-bg').value = $('st-bg-hex').value = bg;
    if (chip) $('st-chip').value = $('st-chip-hex').value = chip;
    if (logo === '0') { $('st-vis-logo').checked = false; $('pv-logo').hidden = true; }
  } catch (e) {}
  farge('st-bg', '--pv-bg'); farge('st-chip', '--pv-chip');
  $('st-vis-bg').addEventListener('change', function () { kreativ.classList.toggle('uten-bg', !this.checked); });
  $('st-vis-logo').addEventListener('change', function () { $('pv-logo').hidden = !this.checked; });
  document.querySelectorAll('[data-plattform]').forEach(function (b) {
    if (b.tagName !== 'BUTTON') return;
    b.addEventListener('click', function () {
      document.querySelectorAll('button[data-plattform]').forEach(function (x) { x.setAttribute('aria-pressed', x === b); });
      post.dataset.plattform = b.dataset.plattform;
    });
  });
  document.querySelectorAll('[data-format]').forEach(function (b) {
    b.addEventListener('click', function () {
      document.querySelectorAll('[data-format]').forEach(function (x) { x.setAttribute('aria-pressed', x === b); });
      kreativ.style.aspectRatio = b.dataset.format.replace('/', ' / ');
    });
  });
  function settBilde(url) {
    bildeUrl = url;
    var v = url ? 'url("' + url + '")' : '';
    bilde.style.backgroundImage = v; felt.style.backgroundImage = v;
    felt.classList.toggle('har-bilde', !!url);
  }
  $('st-last').addEventListener('click', function () { $('st-fil').click(); });
  $('st-fil').addEventListener('change', function () { var f = this.files[0]; if (f) settBilde(URL.createObjectURL(f)); });
  $('st-fjern').addEventListener('click', function () { settBilde(''); });
  // Drag to move the image inside the frame
  var pos = { x: 50, y: 50 }, start = null;
  bilde.addEventListener('pointerdown', function (e) { start = { x: e.clientX, y: e.clientY, px: pos.x, py: pos.y }; bilde.setPointerCapture(e.pointerId); bilde.classList.add('drar'); });
  bilde.addEventListener('pointermove', function (e) {
    if (!start) return;
    var r = bilde.getBoundingClientRect();
    pos.x = Math.max(0, Math.min(100, start.px - (e.clientX - start.x) / r.width * 100));
    pos.y = Math.max(0, Math.min(100, start.py - (e.clientY - start.y) / r.height * 100));
    bilde.style.setProperty('--pv-pos', pos.x + '% ' + pos.y + '%');
  });
  ['pointerup', 'pointercancel'].forEach(function (ev) { bilde.addEventListener(ev, function () { start = null; bilde.classList.remove('drar'); }); });
  // Follow the job title from the order form until the user edits the ad field
  var kilde = $('stilling');
  if (kilde) {
    var egen = false;
    $('st-stilling').addEventListener('input', function () { egen = true; });
    var folg = function () { if (!egen && kilde.value.trim()) { $('st-stilling').value = kilde.value.trim(); tekster(); } };
    kilde.addEventListener('input', folg); kilde.addEventListener('change', folg);
    setInterval(folg, 800);
  }
  tekster();
})();
