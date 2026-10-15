/* Kanal names with their logo.
   FZ_KANALER.html('Meta, Nettsteder') gives logo + name for each kanal.
   Markup: put data-vis-kanaler on an element, and its text is drawn with logos when the page loads.
   Text that is not a kanal, like «Frantz anbefaler» or «—», stays as it is. */
window.FZ_KANALER = (function () {
  var KANALER = {
    meta: { navn: 'Meta', k: 'meta' },
    facebook: { navn: 'Meta', k: 'meta' },
    instagram: { navn: 'Meta', k: 'meta' },
    linkedin: { navn: 'LinkedIn', k: 'linkedin' },
    snapchat: { navn: 'Snapchat', k: 'snapchat' },
    tiktok: { navn: 'TikTok', k: 'tiktok' },
    nettsteder: { navn: 'Nettsteder og aviser', k: 'nettsteder' },
    'nettsteder og aviser': { navn: 'Nettsteder og aviser', k: 'nettsteder' },
    programmatisk: { navn: 'Programmatisk', k: 'programmatisk' }
  };
  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  function finn(navn) { return KANALER[String(navn).trim().toLowerCase()]; }
  function merke(k) { return '<span class="kanal-navn"><span class="kanal-logo kanal-logo--sm kanal-logo--' + k.k + '" aria-hidden="true"></span>' + esc(k.navn) + '</span>'; }

  // Accepts a list, or text like «Meta, Nettsteder og aviser (Frantz anbefaler)»
  function html(kanaler) {
    var tekst = Array.isArray(kanaler) ? kanaler.join(', ') : String(kanaler || '');
    var ekstra = '';
    tekst = tekst.replace(/\s*(\([^)]*\))\s*$/, function (m, p) { ekstra = ' <span class="kanal-navner__ekstra">' + esc(p) + '</span>'; return ''; });
    var deler = tekst.split(/\s*,\s*|\s+og\s+(?!aviser)/).filter(Boolean);
    var funnet = deler.map(finn);
    if (!deler.length || funnet.some(function (k) { return !k; })) return esc(tekst) + ekstra;
    return '<span class="kanal-navner">' + funnet.map(merke).join('') + '</span>' + ekstra;
  }
  function tegn(el, kanaler) { el.innerHTML = html(kanaler === undefined ? el.textContent : kanaler); }

  document.querySelectorAll('[data-vis-kanaler]').forEach(function (el) { tegn(el); });
  return { html: html, tegn: tegn, finn: finn };
})();
