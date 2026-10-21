/* Shared crop presentation: editor controls and submitted-material preview use the same values. */
(function (root) {
  'use strict';
  function normalise(value) {
    var c = value || {};
    function bounded(n, fallback, min, max) { n = Number(n); return Number.isFinite(n) ? Math.min(max, Math.max(min, n)) : fallback; }
    return { x: bounded(c.x, 50, 0, 100), y: bounded(c.y, 50, 0, 100), zoom: bounded(c.zoom, 1, 1, 3), fit: ['cover', 'contain'].indexOf(c.fit) !== -1 ? c.fit : 'auto' };
  }
  function apply(background, image, value, finished) {
    var c = normalise(value), fit = c.fit === 'auto' ? finished ? 'contain' : 'cover' : c.fit;
    if (!background.querySelector('.ad-crop-photo')) {
      var layer = document.createElement('span'); layer.className = 'ad-crop-photo'; layer.setAttribute('aria-hidden', 'true'); background.appendChild(layer);
    }
    background.classList.add('ad-crop-area');
    background.style.setProperty('--crop-fit', fit);
    background.style.setProperty('--crop-zoom', c.zoom);
    background.style.setProperty('--pv-pos', c.x + '% ' + c.y + '%');
    image.style.objectFit = fit;
    image.style.objectPosition = c.x + '% ' + c.y + '%';
    image.style.transform = 'scale(' + c.zoom + ')';
    image.style.transformOrigin = c.x + '% ' + c.y + '%';
  }
  function bind(element, getCrop, onChange) {
    var start;
    element.addEventListener('dragstart', function (e) { e.preventDefault(); });
    element.addEventListener('pointerdown', function (e) {
      if (e.button !== 0 || e.target.closest('button, input, label, .crop-toolbar')) return;
      var c = normalise(getCrop()); start = { x: e.clientX, y: e.clientY, crop: c };
      element.setPointerCapture(e.pointerId);
    });
    element.addEventListener('pointermove', function (e) {
      if (!start) return;
      var rect = element.getBoundingClientRect(), c = Object.assign({}, start.crop);
      c.x -= (e.clientX - start.x) / rect.width * 100;
      c.y -= (e.clientY - start.y) / rect.height * 100;
      onChange(normalise(c));
    });
    ['pointerup', 'pointercancel'].forEach(function (type) { element.addEventListener(type, function () { start = null; }); });
    element.tabIndex = 0;
    element.addEventListener('keydown', function (e) {
      if (e.target !== element) return;
      var c = normalise(getCrop()), step = e.shiftKey ? 20 : 5;
      var delta = { ArrowLeft: [-step,0], ArrowRight: [step,0], ArrowUp: [0,-step], ArrowDown: [0,step] }[e.key];
      if (e.key === 'Home') { e.preventDefault(); c.x = c.y = 50; onChange(c); }
      else if (delta) { e.preventDefault(); c.x += delta[0]; c.y += delta[1]; onChange(normalise(c)); }
    });
  }
  root.FrantzAdCrop = { normalise: normalise, apply: apply, bind: bind };
})(window);
