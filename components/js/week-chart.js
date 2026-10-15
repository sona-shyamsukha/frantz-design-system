/* Uke for uke — one small line chart per number, side by side.
   Visninger and klikk are far apart in size, so each gets its own chart
   instead of sharing one axis where klikk would look flat.
   data.enhet: 'uke' (default) or 'dag'. Day by day has many points, so it marks only
   the last point and labels only the first, middle and last day. */
(function () {
  function tall(n) { return Math.round(n).toLocaleString('nb-NO'); }

  function graf(serie, uker, enhet) {
    var mange = uker.length > 12;
    var W = 320, H = 120, pl = 8, pr = 8, pt = 16, pb = 8;
    var maks = Math.max.apply(null, serie.v) * 1.15 || 1;
    var x = function (i) { return pl + (serie.v.length === 1 ? 0 : i * (W - pl - pr) / (serie.v.length - 1)); };
    var y = function (v) { return pt + (H - pt - pb) * (1 - v / maks); };
    var linje = serie.v.map(function (v, i) { return (i ? 'L' : 'M') + x(i).toFixed(1) + ' ' + y(v).toFixed(1); }).join(' ');
    var flate = linje + ' L' + x(serie.v.length - 1).toFixed(1) + ' ' + (H - pb) + ' L' + x(0).toFixed(1) + ' ' + (H - pb) + ' Z';
    var siste = serie.v.length - 1;
    var punkter = serie.v.map(function (v, i) {
      if (mange && i !== siste) return '';
      return '<circle cx="' + x(i) + '" cy="' + y(v) + '" r="' + (i === siste ? 4.5 : 3) + '" fill="' + (i === siste ? serie.farge : 'var(--surface-raised)') + '" stroke="' + serie.farge + '" stroke-width="2"><title>' + uker[i] + ': ' + tall(v) + '</title></circle>';
    }).join('');
    var sum = serie.v.reduce(function (a, b) { return a + b; }, 0);
    return '<figure class="ukegraf">' +
      '<figcaption><span class="ukegraf__navn">' + serie.navn + ' per ' + enhet + '</span><span class="ukegraf__sum">' + tall(sum) + ' totalt</span></figcaption>' +
      '<svg viewBox="0 0 ' + W + ' ' + H + '" role="img" aria-label="' + serie.navn + ' per ' + enhet + ': ' + serie.v.map(function (v, i) { return uker[i] + ' ' + tall(v); }).join(', ') + '">' +
      [0.5, 1].map(function (f) { var yy = pt + (H - pt - pb) * (1 - f / 1.15); return '<line x1="' + pl + '" x2="' + (W - pr) + '" y1="' + yy + '" y2="' + yy + '" stroke="var(--border-subtle)" stroke-dasharray="3 4"></line>'; }).join('') +
      '<path d="' + flate + '" fill="' + serie.farge + '" opacity="0.08"></path>' +
      '<path d="' + linje + '" fill="none" stroke="' + serie.farge + '" stroke-width="2.5" stroke-linejoin="round" stroke-linecap="round"></path>' +
      punkter + '</svg>' +
      '<div class="ukegraf__akse">' + uker.map(function (u, i) {
        if (mange && i !== 0 && i !== siste && i !== Math.round(siste / 2)) return '';
        return '<span>' + u + (i === siste ? '<b>' + tall(serie.v[i]) + '</b>' : '') + '</span>';
      }).join('') + '</div>' +
      '</figure>';
  }

  window.tegnUkegraf = function (el, data) {
    var enhet = data.enhet || 'uke';
    el.innerHTML = '<div class="ukegraf__rad">' + data.serier.map(function (s) { return graf(s, data.uker, enhet); }).join('') + '</div>';
  };
})();
