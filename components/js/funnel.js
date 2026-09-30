/* Trakt — tre visninger av samme fire tall.
   Tallene står i kolonneoverskriftene, grafikken i midten,
   frafallet under. Fanen bytter bare den midterste delen.
   Fargen ender i amber på det ene tallet som er et resultat. */
(function () {
  var lagret = new WeakMap();
  var teller = 0;

  function tok(navn) {
    return getComputedStyle(document.documentElement).getPropertyValue(navn).trim();
  }
  function tall(n) {
    return Math.round(n).toLocaleString('nb-NO');
  }
  function pst(x) {
    return (x * 100).toFixed(1).replace('.', ',') + ' %';
  }

  var PIL = '<svg width="13" height="13" viewBox="0 0 14 14" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><path d="M7 2.5v8M3.5 7.5 7 11l3.5-3.5"/></svg>';
  var HAKE = '<svg width="13" height="13" viewBox="0 0 14 14" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"><path d="m3 7.4 2.7 2.7L11 4.5"/></svg>';

  function tegnGraf(visning, v, farger, lag, gradId, W, H, kol, ekte, utenMerker) {
    ekte = ekte || v;
    var maks = v[0];
    var skiller = [1, 2, 3].map(function (i) {
      return '<line x1="' + (i * kol) + '" y1="0" x2="' + (i * kol) + '" y2="' + H + '" stroke="rgba(255,255,255,.55)" stroke-width="2"></line>';
    }).join('');

    if (visning === 'steg') {
      /* Like Google Analytics and Hotjar: each column is everyone who reached the
         step before (light), and the filled part is those who went on. Every step
         stays readable even when the numbers fall from 100 000 to 300.
         The percent is shown above the chart, not in the SVG, so it never stretches. */
      var b = 150;
      return v.map(function (verdi, i) {
        var andel = i === 0 ? 1 : verdi / v[i - 1];
        var fh = Math.max(H * andel, 5);
        var x = i * kol + (kol - b) / 2;
        var farge = i === 3 ? tok('--color-amber') : tok('--color-data-700');
        return (i > 0 ? '<rect x="' + x + '" y="0" width="' + b + '" height="' + H + '" rx="8" fill="' + tok('--color-data-100') + '"></rect>' : '') +
          '<rect x="' + x + '" y="' + (H - fh) + '" width="' + b + '" height="' + fh + '" rx="' + Math.min(8, fh / 2) + '" fill="' + farge + '"></rect>';
      }).join('');
    }

    if (visning === 'stolper') {
      var bredde = 150;
      return v.map(function (verdi, i) {
        var hh = Math.max((verdi / maks) * H, 4);
        var x = i * kol + (kol - bredde) / 2;
        return '<rect x="' + x + '" y="' + (H - hh) + '" width="' + bredde + '" height="' + hh +
          '" rx="' + Math.min(8, hh / 2) + '" fill="' + farger[i] + '"></rect>';
      }).join('') + '<line x1="0" y1="' + H + '" x2="' + W + '" y2="' + H + '" stroke="' + tok('--color-line') + '" stroke-width="2"></line>';
    }

    if (visning === 'lagdelt' && lag && lag.length) {
      /* Symmetrisk om midtlinjen. Ytterst til innerst, så lagene
         legger seg oppå hverandre med økende metning. */
      var cy = H / 2;
      var f = (H - 24) / maks;
      var kum = function (k) {
        return lag.slice(0, k + 1).reduce(function (sum, l) {
          return l.v.map(function (x, i) { return x + (sum[i] || 0); });
        }, []);
      };
      var sti = function (serie) {
        var halv = function (i) { return Math.max(serie[Math.min(i, 3)] * f / 2, 1.5); };
        var d = 'M 0 ' + (cy - halv(0));
        for (var i = 0; i < 4; i++) {
          var x0 = i * kol, x1 = (i + 1) * kol, m = (x0 + x1) / 2;
          d += ' C ' + m + ' ' + (cy - halv(i)) + ', ' + m + ' ' + (cy - halv(i + 1)) + ', ' + x1 + ' ' + (cy - halv(i + 1));
        }
        d += ' L ' + W + ' ' + (cy + halv(4));
        for (var j = 3; j >= 0; j--) {
          var a = j * kol, b = (j + 1) * kol, mm = (a + b) / 2;
          d += ' C ' + mm + ' ' + (cy + halv(j + 1)) + ', ' + mm + ' ' + (cy + halv(j)) + ', ' + a + ' ' + (cy + halv(j));
        }
        return d + ' Z';
      };
      var flater = [2, 1, 0].filter(function (k) { return lag[k]; }).map(function (k) {
        return '<path d="' + sti(kum(k)) + '" fill="' + (lag[k].farge || 'url(#' + gradId + ')') + '" opacity="' + (lag[k].farge ? 1 : lag[k].o) + '"></path>';
      }).join('');
      var merker = v.map(function (verdi, i) {
        var x = i * kol + kol / 2, b = 86;
        return '<g><rect x="' + (x - b / 2) + '" y="' + (cy - 15) + '" width="' + b + '" height="30" rx="15" fill="#fff" stroke="' + tok('--color-line') + '"></rect>' +
          '<text x="' + x + '" y="' + (cy + 5) + '" text-anchor="middle" font-size="15" font-weight="700" fill="' + tok('--color-navy') + '">' + tall(ekte[i]) + '</text></g>';
      }).join('');
      return flater + skiller + (utenMerker ? '' : merker);
    }

    /* Trakt: én sammenhengende flate som smalner av mot høyre */
    var y = function (i) { return H - Math.max((v[Math.min(i, 3)] / maks) * H, 5); };
    var kant = 'M 0 ' + y(0);
    for (var n = 0; n < 4; n++) {
      var p0 = n * kol, p1 = (n + 1) * kol, mid = (p0 + p1) / 2;
      kant += ' C ' + mid + ' ' + y(n) + ', ' + mid + ' ' + y(n + 1) + ', ' + p1 + ' ' + y(n + 1);
    }
    return '<path d="' + kant + ' L ' + W + ' ' + H + ' L 0 ' + H + ' Z" fill="url(#' + gradId + ')"></path>' + skiller;
  }

  window.tegnTrakt = function (el, data) {
    if (data) lagret.set(el, data);
    var d = lagret.get(el);
    if (!d) return;

    var v = d.verdier;
    var navn = d.navn || ['Relevante besøk', 'Begynte å lese', 'Leste hele annonsen', 'Trykket på søknad'];
    var lag = d.lag || null;

    /* skala: 'rot' draws the shape on a square-root scale, so late steps stay
       visible when the numbers fall steeply (views → «Søk»). Numbers stay exact. */
    var graf = { v: v, lag: lag };
    if (d.skala === 'rot') {
      var f = v.map(function (x) { return x > 0 ? Math.sqrt(x) / x : 0; });
      graf.v = v.map(function (x, i) { return x * f[i]; });
      graf.lag = lag ? lag.map(function (l) { return { navn: l.navn, o: l.o, farge: l.farge, v: l.v.map(function (x, i) { return x * f[i]; }) }; }) : null;
    }
    var visning = el.dataset.visning || 'trakt';
    var W = 1000, H = 230, kol = W / 4;

    if (!el.dataset.gradId) {
      el.dataset.gradId = 'traktfarge-' + (++teller);
    }
    var gradId = el.dataset.gradId;

    var farger = [tok('--color-data-300'), tok('--color-data-500'), tok('--color-data-700'), tok('--color-amber')];
    if (visning === 'steg') farger = [tok('--color-data-700'), tok('--color-data-700'), tok('--color-data-700'), tok('--color-amber')];

    var gradient = '<linearGradient id="' + gradId + '" x1="0" y1="0" x2="1" y2="0">' +
      farger.map(function (f, i) {
        return '<stop offset="' + (i / 4) + '" stop-color="' + f + '"></stop><stop offset="' + ((i + 1) / 4) + '" stop-color="' + f + '"></stop>';
      }).join('') + '</linearGradient>';

    var celler = v.map(function (verdi, i) {
      return '<div class="funnel__cell">' +
        '<span class="funnel__flag" style="background:' + farger[i] + '"></span>' +
        '<div class="funnel__step">Trinn ' + (i + 1) + '</div>' +
        '<div class="funnel__name">' + navn[i] + '</div>' +
        '<div class="funnel__num">' + tall(verdi) + '</div>' +
        '<div class="funnel__of">' + (i === 0 ? (d.startTekst || 'utgangspunkt') : pst(verdi / v[i - 1]) + ' av ' + tall(v[i - 1])) + '</div>' +
        '</div>';
    }).join('');

    var fot = v.map(function (verdi, i) {
      if (i === 3) {
        return '<div class="funnel__foot-cell">' +
          '<span class="funnel__badge funnel__badge--ok">' + HAKE + '</span>' +
          '<div class="funnel__foot-label">' + (d.totalNavn || 'Konvertering') + '</div>' +
          '<div class="funnel__foot-pct funnel__foot-pct--ok">' + pst(v[3] / v[0]) + '</div>' +
          '<div class="funnel__foot-sub">' + tall(v[3]) + ' av ' + tall(v[0]) + '</div>' +
          '</div>';
      }
      var tap = verdi - v[i + 1];
      var andel = tap / verdi;
      return '<div class="funnel__foot-cell">' +
        '<span class="funnel__badge funnel__badge--' + (andel >= 0.45 ? 'high' : 'low') + '">' + PIL + '</span>' +
        '<div class="funnel__foot-label">Falt fra her</div>' +
        '<div class="funnel__foot-pct">' + pst(andel) + '</div>' +
        '<div class="funnel__foot-sub">' + tall(tap) + ' personer</div>' +
        '</div>';
    }).join('');

    var faner = '';
    if (!d.skjulFaner) {
      faner = '<div class="funnel__tabs" role="tablist" aria-label="Visning">' +
        [['steg', 'Steg for steg'], ['trakt', 'Trakt'], ['stolper', 'Stolper'], ['lagdelt', d.lagNavn || 'Lagdelt']]
          .filter(function (f) { return f[0] !== 'lagdelt' || (lag && lag.length); })
          .filter(function (f) { return d.visninger ? d.visninger.indexOf(f[0]) !== -1 : f[0] !== 'steg'; })
          .map(function (f) {
            return '<button type="button" class="filter" role="tab" data-visning-valg="' + f[0] +
              '" aria-selected="' + (visning === f[0]) + '" aria-pressed="' + (visning === f[0]) + '">' + f[1] + '</button>';
          }).join('') + '</div>';
    }

    var forklaring = '';
    if (visning === 'lagdelt' && lag && lag.length) {
      forklaring = '<div class="funnel__legend">' +
        lag.map(function (l) { return '<span><i style="' + (l.farge ? 'background:' + l.farge : 'opacity:' + l.o) + '"></i>' + l.navn + '</span>'; }).join('') +
        '<span style="color:var(--text-faint)">' + (d.lagTekst || 'Lagene er kanaler. Tykkelsen er antall personer.') + '</span></div>';
    }

    if (d.interaktiv) {
      /* Calm view: the chart first, small labels under it, the share that went on
         between the steps, and a card with details on hover or tap. */
      var akse = v.map(function (verdi, i) {
        return '<div class="funnel__akse-steg"><span class="funnel__akse-navn"><i style="background:' + farger[i] + '"></i>' + navn[i] + '</span>' +
          '<span class="funnel__akse-tall">' + tall(verdi) + '</span>' +
          '<span class="funnel__akse-rate">' + (i === 0 ? '&nbsp;' : pst(verdi / v[i - 1]) + ' av forrige steg') + '</span></div>';
      }).join('');
      var soner = v.map(function (verdi, i) {
        return '<button type="button" class="funnel__sone" data-sone="' + i + '" style="left:' + (i * 25) + '%" aria-label="' + navn[i] + ': ' + tall(verdi) + '"></button>';
      }).join('');
      el.innerHTML = faner +
        '<p class="funnel__hint"><span class="icon-lucide icon-lucide--info" aria-hidden="true"></span>Trykk på et steg i grafen for å se detaljer.</p>' +
        '<div class="funnel__box funnel__box--rolig">' +
        '<div class="funnel__graph funnel__graph--hover"><svg viewBox="0 0 ' + W + ' ' + H + '" preserveAspectRatio="none" role="img" aria-label="Fra ' + tall(v[0]) + ' ' + navn[0].toLowerCase() + ' til ' + tall(v[3]) + ' søknadsklikk" style="height:260px">' +
        '<defs>' + gradient + '</defs>' + tegnGraf(visning, graf.v, farger, graf.lag, gradId, W, H, kol, v, true) +
        '</svg>' + soner +
        '<div class="funnel__kort" role="status" hidden></div></div>' +
        '<div class="funnel__akse">' + akse + '</div>' +
        forklaring +
        '</div>';

      var grafEl = el.querySelector('.funnel__graph--hover');
      var kort = grafEl.querySelector('.funnel__kort');
      var aktiv = -1;
      var laast = false;
      var vis = function (i) {
        aktiv = i;
        var linjer = [];
        if (i > 0) {
          linjer.push(['Kom fra forrige steg', pst(v[i] / v[i - 1])]);
          linjer.push(['Falt fra', tall(v[i - 1] - v[i]) + ' personer']);
        }
        if (i === 3) linjer.push(['Av alle som så annonsen', pst(v[3] / v[0])]);
        (lag || []).forEach(function (l) { linjer.push(['<i style="background:' + (l.farge || 'var(--color-data-700)') + '"></i>' + l.navn, tall(l.v[i])]); });
        kort.innerHTML = '<span class="funnel__kort-navn">' + navn[i] + '</span>' +
          '<span class="funnel__kort-tall">' + tall(v[i]) + '</span>' +
          (d.hjelp && d.hjelp[i] ? '<span class="funnel__kort-hjelp">' + d.hjelp[i] + '</span>' : '') +
          (linjer.length ? '<dl>' + linjer.map(function (x) { return '<div><dt>' + x[0] + '</dt><dd>' + x[1] + '</dd></div>'; }).join('') + '</dl>' : '');
        kort.hidden = false;
        // Beside the step: to the right for the first two, to the left for the last two
        kort.style.left = (i >= 2 ? i * 25 : (i + 1) * 25) + '%';
        kort.classList.toggle('funnel__kort--venstre', i >= 2);
        Array.prototype.forEach.call(el.querySelectorAll('.funnel__sone'), function (b, k) { b.classList.toggle('funnel__sone--aktiv', k === i); });
        Array.prototype.forEach.call(el.querySelectorAll('.funnel__akse-steg'), function (c, k) { c.classList.toggle('funnel__akse-steg--aktiv', k === i); });
      };
      var skjul = function () {
        aktiv = -1;
        laast = false;
        kort.classList.remove('funnel__kort--laast');
        kort.hidden = true;
        Array.prototype.forEach.call(el.querySelectorAll('.funnel__sone--aktiv, .funnel__akse-steg--aktiv'), function (x) {
          x.classList.remove('funnel__sone--aktiv', 'funnel__akse-steg--aktiv');
        });
      };
      Array.prototype.forEach.call(grafEl.querySelectorAll('.funnel__sone'), function (b) {
        var i = Number(b.dataset.sone);
        b.addEventListener('mouseenter', function () { if (!laast) vis(i); });
        b.addEventListener('focus', function () { if (!laast) vis(i); });
        // A click pins the card, so it stays while you read. Click the same step again to close it.
        b.addEventListener('click', function () {
          if (laast && aktiv === i) { skjul(); return; }
          vis(i);
          laast = true;
          kort.classList.add('funnel__kort--laast');
        });
        b.addEventListener('blur', function () { if (!laast) skjul(); });
      });
      grafEl.addEventListener('mouseleave', function () { if (!laast) skjul(); });
      document.addEventListener('click', function (e) { if (laast && !grafEl.contains(e.target)) skjul(); });
      document.addEventListener('keydown', function (e) { if (laast && e.key === 'Escape') skjul(); });
      return;
    }

    el.innerHTML = faner +
      '<div class="funnel__scroll"><div class="funnel__box">' +
      '<div class="funnel__top">' +
      '<div><span class="funnel__top-label">' + navn[0] + '</span><span class="funnel__top-value">' + tall(v[0]) + '</span></div>' +
      '<div><span class="funnel__top-label">' + (d.rateNavn || 'Konverteringsrate') + '</span><span class="funnel__top-value">' + pst(v[3] / v[0]) + '</span></div>' +
      '</div>' +
      '<div class="funnel__cells">' + celler + '</div>' +
      '<div class="funnel__graph"><svg viewBox="0 0 ' + W + ' ' + H + '" preserveAspectRatio="none" role="img" aria-label="Fra ' + tall(v[0]) + ' ' + navn[0].toLowerCase() + ' til ' + tall(v[3]) + ' søknadsklikk" style="height:230px">' +
      '<defs>' + gradient + '</defs>' + tegnGraf(visning, graf.v, farger, graf.lag, gradId, W, H, kol, v) +
      '</svg></div>' +
      forklaring +
      '<div class="funnel__foot">' + fot + '</div>' +
      '</div></div>';
  };

  document.addEventListener('click', function (e) {
    var knapp = e.target.closest('[data-visning-valg]');
    if (!knapp) return;
    var vert = knapp.closest('[data-trakt]');
    if (!vert) return;
    vert.dataset.visning = knapp.dataset.visningValg;
    window.tegnTrakt(vert);
  });
})();
