/* Resultatgraf med kanalvalg. Eldre eksempler kan fortsatt velge grafvisning. */
(function () {
  var lagret = new WeakMap();
  var ryddOpp = new WeakMap();
  var teller = 0;

  function tok(navn) {
    return getComputedStyle(document.documentElement).getPropertyValue(navn).trim();
  }
  function tall(n) {
    return Math.round(n).toLocaleString('nb-NO');
  }
  function pst(x) {
    return Number.isFinite(x) ? (x * 100).toFixed(1).replace('.', ',') + ' %' : '—';
  }
  function escape(value) { return String(value == null ? '' : value).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
  function channelColor(name, index) {
    var colors = { meta: '--kanal-meta', linkedin: '--kanal-linkedin', snapchat: '--color-amber', tiktok: '--color-violet', 'nettsteder og aviser': '--kanal-nettsteder' };
    return 'var(' + (colors[String(name).toLowerCase()] || ['--color-data-700', '--color-green', '--color-violet', '--color-coral', '--color-data-900'][index % 5]) + ')';
  }

  var PIL = '<svg width="13" height="13" viewBox="0 0 14 14" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><path d="M7 2.5v8M3.5 7.5 7 11l3.5-3.5"/></svg>';
  var HAKE = '<svg width="13" height="13" viewBox="0 0 14 14" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"><path d="m3 7.4 2.7 2.7L11 4.5"/></svg>';

  function tegnGraf(visning, v, farger, lag, gradId, W, H, kol, ekte, utenMerker, skalaMaks, stableLag) {
    ekte = ekte || v;
    var maks = Math.max(skalaMaks == null ? v[0] : skalaMaks, 1);
    var n = v.length, siste = n - 1;
    var skiller = v.slice(1).map(function (_, k) {
      var i = k + 1;
      return '<line x1="' + (i * kol) + '" y1="0" x2="' + (i * kol) + '" y2="' + H + '" stroke="var(--chart-divider)" stroke-width="2"></line>';
    }).join('');

    if (visning === 'steg') {
      /* Like Google Analytics and Hotjar: each column is everyone who reached the
         step before (light), and the filled part is those who went on. Every step
         stays readable even when the numbers fall from 100 000 to 300.
         The percent is shown above the chart, not in the SVG, so it never stretches. */
      var b = 150;
      return v.map(function (verdi, i) {
        var andel = i === 0 ? 1 : (v[i - 1] ? verdi / v[i - 1] : 0);
        var fh = Math.max(H * andel, 5);
        var x = i * kol + (kol - b) / 2;
        var farge = i === siste ? tok('--color-amber') : tok('--color-data-700');
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
        var halv = function (i) { return serie[Math.min(i, siste)] * f / 2; };
        var d = 'M 0 ' + (cy - halv(0));
        for (var i = 0; i < n; i++) {
          var x0 = i * kol, x1 = (i + 1) * kol, m = (x0 + x1) / 2;
          d += ' C ' + m + ' ' + (cy - halv(i)) + ', ' + m + ' ' + (cy - halv(i + 1)) + ', ' + x1 + ' ' + (cy - halv(i + 1));
        }
        d += ' L ' + W + ' ' + (cy + halv(n));
        for (var j = siste; j >= 0; j--) {
          var a = j * kol, b = (j + 1) * kol, mm = (a + b) / 2;
          d += ' C ' + mm + ' ' + (cy + halv(j + 1)) + ', ' + mm + ' ' + (cy + halv(j)) + ', ' + a + ' ' + (cy + halv(j));
        }
        return d + ' Z';
      };
      var kanalSti = function (k) {
        var over = k ? kum(k - 1) : v.map(function () { return 0; });
        var under = kum(k);
        // Centre the whole funnel, then stack each channel directly against the
        // previous one. All heights use raw counts divided by relevant visits.
        var kant = function (serie, i) {
          var j = Math.min(i, siste);
          return cy - v[j] * f / 2 + serie[j] * f;
        };
        var d = 'M 0 ' + kant(over, 0);
        for (var i = 0; i < n; i++) {
          var x0 = i * kol, x1 = (i + 1) * kol, m = (x0 + x1) / 2;
          d += ' C ' + m + ' ' + kant(over, i) + ', ' + m + ' ' + kant(over, i + 1) + ', ' + x1 + ' ' + kant(over, i + 1);
        }
        d += ' L ' + W + ' ' + kant(under, n);
        for (var j = siste; j >= 0; j--) {
          var a = j * kol, b = (j + 1) * kol, mm = (a + b) / 2;
          d += ' C ' + mm + ' ' + kant(under, j + 1) + ', ' + mm + ' ' + kant(under, j) + ', ' + a + ' ' + kant(under, j);
        }
        return d + ' Z';
      };
      var rekkefolge = lag.map(function (_, k) { return k; });
      if (!stableLag) rekkefolge.reverse();
      var flater = rekkefolge.map(function (k) {
        return '<path d="' + (stableLag ? kanalSti(k) : sti(kum(k))) + '" fill="' + (lag[k].farge || 'url(#' + gradId + ')') + '" opacity="' + (lag[k].farge ? 1 : lag[k].o) + '"></path>';
      }).join('');
      var merker = v.map(function (verdi, i) {
        var x = i * kol + kol / 2, b = 86;
        return '<g><rect x="' + (x - b / 2) + '" y="' + (cy - 15) + '" width="' + b + '" height="30" rx="15" fill="var(--surface-raised)" stroke="' + tok('--color-line') + '"></rect>' +
          '<text x="' + x + '" y="' + (cy + 5) + '" text-anchor="middle" style="font-size:var(--text-base);font-weight:var(--font-weight-bold)" fill="' + tok('--color-navy') + '">' + tall(ekte[i]) + '</text></g>';
      }).join('');
      return flater + skiller + (utenMerker ? '' : merker);
    }

    /* Trakt: én sammenhengende flate som smalner av mot høyre */
    var y = function (i) { return H - Math.max((v[Math.min(i, siste)] / maks) * H, 5); };
    var kant = 'M 0 ' + y(0);
    for (var s = 0; s < n; s++) {
      var p0 = s * kol, p1 = (s + 1) * kol, mid = (p0 + p1) / 2;
      kant += ' C ' + mid + ' ' + y(s) + ', ' + mid + ' ' + y(s + 1) + ', ' + p1 + ' ' + y(s + 1);
    }
    return '<path d="' + kant + ' L ' + W + ' ' + H + ' L 0 ' + H + ' Z" fill="url(#' + gradId + ')"></path>' + skiller;
  }

  window.tegnTrakt = function (el, data) {
    if (data) lagret.set(el, data);
    var d = lagret.get(el);
    if (!d) return;
    if (ryddOpp.has(el)) { ryddOpp.get(el)(); ryddOpp.delete(el); }

    var steg = d.stegIndekser || d.verdier.map(function (_, i) { return i; });
    var prosjekt = function (serie) { return steg.map(function (i) { return serie[i]; }); };
    var totaler = prosjekt(d.verdier);
    var v = totaler;
    var navn = prosjekt(d.navn || ['Relevante besøk', 'Begynte å lese', 'Leste hele annonsen', 'Trykket på søknad']);
    var hjelp = d.hjelp ? prosjekt(d.hjelp) : null;
    var alleLag = d.lag ? d.lag.map(function (l) { return Object.assign({}, l, { v: prosjekt(l.v) }); }) : null;
    var kanalvalg = d.kanalvalg && alleLag && alleLag.length;
    var skjulte = skjulteKanaler(el);
    var lag = alleLag;
    if (kanalvalg) {
      lag = alleLag.filter(function (l) { return skjulte.indexOf(l.navn) === -1; });
      v = totaler.map(function (_, i) { return lag.reduce(function (sum, l) { return sum + l.v[i]; }, 0); });
    }
    var tom = kanalvalg && !lag.length;

    // Rebuild adjacent bands from enabled channels, preserving the original
    // portal's proportions while keeping each legend control independent.
    var f = v.map(function (x) { return !kanalvalg && d.skala === 'rot' ? (x > 0 ? Math.sqrt(x) / x : 0) : 1; });
    var graf = {
      v: v.map(function (x, i) { return x * f[i]; }),
      maks: v[0] * f[0],
      lag: lag ? lag.map(function (l) {
        return { navn: l.navn, o: l.o, farge: l.farge, v: l.v.map(function (x, i) { return x * f[i]; }) };
      }) : null
    };
    var visning = kanalvalg ? 'lagdelt' : el.dataset.visning || 'trakt';
    var n = v.length, siste = n - 1;
    var W = 1000, H = 230, kol = W / n;
    var grafNavn = tom ? 'Ingen kanaler valgt' : 'Fra ' + tall(v[0]) + ' ' + navn[0].toLowerCase() + ' til ' + tall(v[siste]) + ' som trykket «Søk»';
    // The CSS grids under and over the chart use the same number of columns
    el.style.setProperty('--funnel-steg', n);
    el.style.setProperty('--funnel-min-width', n <= 4 ? '320px' : '520px');

    if (!el.dataset.gradId) {
      el.dataset.gradId = 'traktfarge-' + (++teller);
    }
    var gradId = el.dataset.gradId;

    // Blue steps get darker towards the result. The last step, the result, is amber.
    var bla = ['--color-data-300', '--color-data-500', '--color-data-700'];
    var farger = v.map(function (_, i) {
      if (i === siste) return tok('--color-amber');
      if (visning === 'steg') return tok('--color-data-700');
      return tok(bla[siste > 1 ? Math.round(i * (bla.length - 1) / (siste - 1)) : 0]);
    });

    var gradient = '<linearGradient id="' + gradId + '" x1="0" y1="0" x2="1" y2="0">' +
      farger.map(function (f, i) {
        return '<stop offset="' + (i / n) + '" stop-color="' + f + '"></stop><stop offset="' + ((i + 1) / n) + '" stop-color="' + f + '"></stop>';
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
      if (i === siste) {
        return '<div class="funnel__foot-cell">' +
          '<span class="funnel__badge funnel__badge--ok">' + HAKE + '</span>' +
          '<div class="funnel__foot-label">' + (d.totalNavn || 'Konvertering') + '</div>' +
          '<div class="funnel__foot-pct funnel__foot-pct--ok">' + pst(v[siste] / v[0]) + '</div>' +
          '<div class="funnel__foot-sub">' + tall(v[siste]) + ' av ' + tall(v[0]) + '</div>' +
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
    var fanePanel = '';
    if (!el.id) el.id = 'trakt-' + Math.random().toString(36).slice(2, 7);
    if (kanalvalg) {
      fanePanel = ' role="region" id="' + el.id + '-panel" aria-label="Resultatgraf: ' + escape(lag.length ? lag.map(function (l) { return l.navn; }).join(', ') : 'Ingen kanaler valgt') + '"';
    } else if (!d.skjulFaner) {
      fanePanel = ' role="tabpanel" id="' + el.id + '-panel" aria-labelledby="' + el.id + '-fane-' + visning + '"';
      faner = '<div class="funnel__tabs" role="tablist" aria-label="Visning">' +
        [['steg', 'Steg for steg'], ['trakt', 'Trakt'], ['stolper', 'Stolper'], ['lagdelt', d.lagNavn || 'Lagdelt']]
          .filter(function (f) { return f[0] !== 'lagdelt' || (lag && lag.length); })
          .filter(function (f) { return d.visninger ? d.visninger.indexOf(f[0]) !== -1 : f[0] !== 'steg'; })
          .map(function (f) {
            var valgt = visning === f[0];
            return '<button type="button" class="filter" role="tab" id="' + el.id + '-fane-' + f[0] + '" data-visning-valg="' + f[0] +
              '" aria-selected="' + valgt + '" aria-controls="' + el.id + '-panel" tabindex="' + (valgt ? 0 : -1) + '">' + f[1] + '</button>';
          }).join('') + '</div>';
    }

    var forklaring = '';
    if (visning === 'lagdelt' && alleLag && alleLag.length) {
      forklaring = '<div class="funnel__legend"' + (kanalvalg ? ' role="group" aria-label="Vis eller skjul kanaler"' : '') + '>' +
        alleLag.map(function (l) {
          var cost = Number.isFinite(l.kostnadPerSok) && l.kostnadPerSok >= 0 ? '<span class="funnel__channel-cost">kr ' + tall(l.kostnadPerSok) + ' per «Søk»</span>' : '';
          var innhold = '<span class="funnel__channel-name"><i style="' + (l.farge ? 'background:' + l.farge : 'opacity:' + l.o) + '" aria-hidden="true"></i>' + escape(l.navn) + '</span>' + cost;
          if (!kanalvalg) return '<div class="funnel__legend-item">' + innhold + '</div>';
          var synlig = skjulte.indexOf(l.navn) === -1;
          return '<button type="button" class="funnel__legend-item funnel__legend-toggle" data-trakt-toggle="' + escape(l.navn) + '" aria-pressed="' + synlig + '" aria-controls="' + el.id + '-panel" title="' + escape((synlig ? 'Skjul ' : 'Vis ') + l.navn) + '">' + innhold + '<span class="funnel__channel-check" aria-hidden="true">' + HAKE + '</span></button>';
        }).join('') +
        (!kanalvalg && lag.length > 1 ? '<span style="color:var(--text-faint)">' + (d.lagTekst || 'Lagene er kanaler. Tykkelsen er antall personer.') + '</span>' : '') + '</div>';
    }

    if (d.interaktiv) {
      /* Calm view: the chart first, small labels under it, the share that went on
         between the steps, and details opened by click or keyboard focus. */
      var akse = v.map(function (verdi, i) {
        return '<div class="funnel__akse-steg"><span class="funnel__akse-navn">' + (kanalvalg ? '' : '<i style="background:' + farger[i] + '" aria-hidden="true"></i>') + '<span>' + escape(navn[i]) + '</span></span>' +
          '<span class="funnel__akse-tall">' + (tom ? '—' : tall(verdi)) + '</span>' +
          (d.visStegRater === false ? '' : '<span class="funnel__akse-rate">' + (i === 0 ? '&nbsp;' : pst(verdi / v[i - 1]) + ' av forrige steg') + '</span>') + '</div>';
      }).join('');
      var soner = v.map(function (verdi, i) {
        return '<button type="button" class="funnel__sone" data-sone="' + i + '" style="left:' + (i * 100 / n) + '%" aria-label="' + navn[i] + ': ' + tall(verdi) + '"' + (tom ? ' disabled' : '') + '></button>';
      }).join('');
      el.innerHTML = faner +
        '<p class="funnel__hint"><span class="icon-lucide icon-lucide--info" aria-hidden="true"></span>' + (tom ? 'Slå på en kanal under grafen for å vise resultater.' : 'Trykk på et steg i grafen for å se detaljer.') + '</p>' +
        '<div class="funnel__box funnel__box--rolig"' + fanePanel + '>' +
        '<div class="funnel__graph funnel__graph--hover"><svg viewBox="0 0 ' + W + ' ' + H + '" preserveAspectRatio="none" role="img" aria-label="' + escape(grafNavn) + '" style="height:260px">' +
        '<defs>' + gradient + '</defs>' + (tom ? '' : tegnGraf(visning, graf.v, farger, graf.lag, gradId, W, H, kol, v, true, graf.maks, kanalvalg)) +
        '</svg>' + soner +
        '<div class="funnel__kort" role="status" tabindex="0" hidden></div></div>' +
        '<div class="funnel__akse">' + akse + '</div>' +
        forklaring +
        '</div>';

      var grafEl = el.querySelector('.funnel__graph--hover');
      var kort = grafEl.querySelector('.funnel__kort');
      var events = new AbortController();
      var layered = typeof kort.showPopover === 'function';
      if (layered) kort.setAttribute('popover', 'manual');
      else document.body.appendChild(kort);
      var aktiv = -1;
      var laast = false;
      var ignorerFokus = null;
      function plasserKort() {
        if (kort.hidden || aktiv < 0) return;
        var anchor = grafEl.querySelector('[data-sone="' + aktiv + '"]').getBoundingClientRect();
        var edge = 16, gap = 8;
        var width = kort.offsetWidth, height = kort.offsetHeight;
        var right = anchor.right + gap, leftSide = anchor.left - width - gap;
        var rightFits = right + width <= window.innerWidth - edge, leftFits = leftSide >= edge;
        var left = aktiv >= n / 2 && leftFits ? leftSide : rightFits ? right : leftSide;
        var top = anchor.bottom - height;
        if (!rightFits && !leftFits) {
          left = (anchor.left + anchor.right - width) / 2;
          if (anchor.bottom + gap + height <= window.innerHeight - edge) top = anchor.bottom + gap;
          else if (anchor.top - gap - height >= edge) top = anchor.top - gap - height;
        }
        kort.style.left = Math.max(edge, Math.min(left, window.innerWidth - width - edge)) + 'px';
        kort.style.top = Math.max(edge, Math.min(top, window.innerHeight - height - edge)) + 'px';
      }
      var vis = function (i) {
        aktiv = i;
        var linjer = [];
        if (i > 0) {
          linjer.push(['Kom fra forrige steg', pst(v[i] / v[i - 1])]);
          linjer.push(['Falt fra', tall(v[i - 1] - v[i]) + ' personer']);
        }
        if (i === siste) linjer.push([kanalvalg ? 'Av ' + navn[0].toLowerCase() : 'Av alle som så annonsen', pst(v[siste] / v[0])]);
        (lag || []).forEach(function (l) { linjer.push(['<i style="background:' + (l.farge || 'var(--color-data-700)') + '"></i>' + escape(l.navn), tall(l.v[i])]); });
        kort.innerHTML = '<span class="funnel__kort-navn">' + navn[i] + '</span>' +
          '<span class="funnel__kort-tall">' + tall(v[i]) + '</span>' +
          (hjelp && hjelp[i] ? '<span class="funnel__kort-hjelp">' + hjelp[i] + '</span>' : '') +
          (linjer.length ? '<dl>' + linjer.map(function (x) { return '<div><dt>' + x[0] + '</dt><dd>' + x[1] + '</dd></div>'; }).join('') + '</dl>' : '');
        kort.hidden = false;
        kort.scrollTop = 0;
        // The top layer escapes the chart's scroll clipping; keep the full card in the viewport.
        if (layered && !kort.matches(':popover-open')) kort.showPopover();
        plasserKort();
        Array.prototype.forEach.call(el.querySelectorAll('.funnel__sone'), function (b, k) { b.classList.toggle('funnel__sone--aktiv', k === i); });
        Array.prototype.forEach.call(el.querySelectorAll('.funnel__akse-steg'), function (c, k) { c.classList.toggle('funnel__akse-steg--aktiv', k === i); });
      };
      var skjul = function () {
        // Closing a popover can restore focus to its trigger; do not reopen it then.
        ignorerFokus = grafEl.querySelector('[data-sone="' + aktiv + '"]');
        aktiv = -1;
        laast = false;
        kort.classList.remove('funnel__kort--laast');
        if (layered && kort.matches(':popover-open')) kort.hidePopover();
        kort.hidden = true;
        Array.prototype.forEach.call(el.querySelectorAll('.funnel__sone--aktiv, .funnel__akse-steg--aktiv'), function (x) {
          x.classList.remove('funnel__sone--aktiv', 'funnel__akse-steg--aktiv');
        });
      };
      Array.prototype.forEach.call(grafEl.querySelectorAll('.funnel__sone'), function (b) {
        var i = Number(b.dataset.sone);
        b.addEventListener('focus', function () {
          var ignore = ignorerFokus === b;
          ignorerFokus = null;
          if (!laast && !ignore && b.matches(':focus-visible')) vis(i);
        });
        // A click pins the card, so it stays while you read. Click the same step again to close it.
        b.addEventListener('click', function () {
          ignorerFokus = null;
          if (laast && aktiv === i) { skjul(); return; }
          vis(i);
          laast = true;
          kort.classList.add('funnel__kort--laast');
        });
        b.addEventListener('blur', function (e) { if (!laast && !kort.contains(e.relatedTarget)) skjul(); });
      });
      document.addEventListener('click', function (e) { if (laast && !grafEl.contains(e.target) && !kort.contains(e.target)) skjul(); }, { signal: events.signal });
      document.addEventListener('keydown', function (e) { if (!kort.hidden && e.key === 'Escape') skjul(); }, { signal: events.signal });
      window.addEventListener('resize', plasserKort, { signal: events.signal });
      window.addEventListener('scroll', plasserKort, { capture: true, signal: events.signal });
      ryddOpp.set(el, function () { skjul(); events.abort(); if (!layered) kort.remove(); });
      return;
    }

    el.innerHTML = faner +
      '<div class="funnel__scroll"' + fanePanel + '><div class="funnel__box">' +
      '<div class="funnel__top">' +
      '<div><span class="funnel__top-label">' + navn[0] + '</span><span class="funnel__top-value">' + tall(v[0]) + '</span></div>' +
      '<div><span class="funnel__top-label">' + (d.rateNavn || 'Konverteringsrate') + '</span><span class="funnel__top-value">' + pst(v[siste] / v[0]) + '</span></div>' +
      '</div>' +
      '<div class="funnel__cells">' + celler + '</div>' +
      '<div class="funnel__graph"><svg viewBox="0 0 ' + W + ' ' + H + '" preserveAspectRatio="none" role="img" aria-label="' + escape(grafNavn) + '" style="height:230px">' +
      '<defs>' + gradient + '</defs>' + (tom ? '' : tegnGraf(visning, graf.v, farger, graf.lag, gradId, W, H, kol, v, false, graf.maks, kanalvalg)) +
      '</svg></div>' +
      forklaring +
      '<div class="funnel__foot">' + fot + '</div>' +
      '</div></div>';
  };

  // Report figures are the source for costs; do not duplicate them in page templates.
  // Return false when this chart cannot represent every supplied channel.
  window.oppdaterTraktKanaler = function (el, channels) {
    var data = lagret.get(el);
    if (!data || !data.lag || !Array.isArray(channels) || !channels.length) return false;
    var reported = channels.every(function (channel) { return Array.isArray(channel.funnel) && channel.funnel.length === data.verdier.length && channel.funnel.every(function (value) { return Number.isFinite(value) && value >= 0; }); });
    if (!reported && data.lag.length !== channels.length) return false;
    var layers = channels.map(function (channel, index) {
      var layer = reported ? { navn: channel.name, v: channel.funnel.slice(), farge: channelColor(channel.name, index), o: 1 } : data.lag.find(function (item) { return item.navn === channel.name; });
      return layer ? Object.assign({}, layer, { kostnadPerSok: channel.cost, readTime: channel.readTime, strategies: channel.strategies, details: true }) : null;
    });
    if (layers.some(function (layer) { return !layer; })) return false;
    var values = reported ? data.verdier.map(function (_, i) { return layers.reduce(function (sum, layer) { return sum + layer.v[i]; }, 0); }) : data.verdier;
    window.tegnTrakt(el, Object.assign({}, data, { lag: layers, verdier: values }));
    return true;
  };

  function skjulteKanaler(el) {
    try {
      var value = JSON.parse(el.dataset.traktSkjulteKanaler || '[]');
      return Array.isArray(value) ? value : [];
    } catch (_) { return []; }
  }

  window.toggleTraktKanal = function (el, kanal) {
    var data = lagret.get(el);
    if (!data || !data.kanalvalg || !data.lag || !data.lag.some(function (l) { return l.navn === kanal; })) return false;
    var skjulte = skjulteKanaler(el);
    el.dataset.traktSkjulteKanaler = JSON.stringify(skjulte.indexOf(kanal) === -1 ? skjulte.concat(kanal) : skjulte.filter(function (navn) { return navn !== kanal; }));
    window.tegnTrakt(el);
    return true;
  };

  function velgFane(knapp, fokus) {
    var vert = knapp.closest('[data-trakt]');
    if (!vert) return;
    vert.dataset.visning = knapp.dataset.visningValg;
    window.tegnTrakt(vert);
    // The tabs are drawn again, so move focus to the new selected tab
    if (fokus) {
      var ny = vert.querySelector('[data-visning-valg="' + knapp.dataset.visningValg + '"]');
      if (ny) ny.focus();
    }
  }

  document.addEventListener('click', function (e) {
    var kanal = e.target.closest('button[data-trakt-toggle]');
    if (kanal) {
      var vert = kanal.closest('[data-trakt]');
      var fokus = document.activeElement === kanal;
      if (vert && window.toggleTraktKanal(vert, kanal.dataset.traktToggle) && fokus) {
        Array.prototype.find.call(vert.querySelectorAll('[data-trakt-toggle]'), function (b) { return b.dataset.traktToggle === kanal.dataset.traktToggle; }).focus();
      }
      return;
    }
    var knapp = e.target.closest('[data-visning-valg]');
    if (knapp) velgFane(knapp, document.activeElement === knapp);
  });

  /* Tabs: arrow left/right, Home and End move between them and show that view */
  document.addEventListener('keydown', function (e) {
    var knapp = e.target.closest && e.target.closest('[data-visning-valg]');
    if (!knapp) return;
    var faner = Array.prototype.slice.call(knapp.parentNode.querySelectorAll('[data-visning-valg]'));
    var i = faner.indexOf(knapp);
    var ny = null;
    if (e.key === 'ArrowRight') ny = faner[(i + 1) % faner.length];
    else if (e.key === 'ArrowLeft') ny = faner[(i - 1 + faner.length) % faner.length];
    else if (e.key === 'Home') ny = faner[0];
    else if (e.key === 'End') ny = faner[faner.length - 1];
    if (!ny) return;
    e.preventDefault();
    velgFane(ny, true);
  });
})();
