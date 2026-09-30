/* Job title with suggestions, and a picker for one or more places.
   Needs window.FRANTZ_TAKSONOMI and window.FRANTZ_STEDER (portal/data/frantz-data.js).

   FrantzPicker.stilling(rootEl, { onChange(valg) })   valg = { tittel, rolle, sti } or null
   FrantzPicker.steder(rootEl, { onChange(liste), start: ['Kristiansand (by)'] })
   Both return an object with .set(...) to fill them from code. */

(function () {
  var STED_TYPE = { fylke: 'Fylke', kommune: 'Kommune', by: 'By', tettsted: 'Tettsted', landsdekkende: 'Hele landet', fjernarbeid: 'Fjernarbeid' };
  var HELE_NORGE = 'Hele Norge (landsdekkende)';
  var HJEMMEKONTOR = 'Hjemmekontor (fjernarbeid)';

  function esc(t) {
    return String(t).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; });
  }
  function merk(tekst, q) {
    if (!q) return esc(tekst);
    var i = tekst.toLowerCase().indexOf(q);
    if (i === -1) return esc(tekst);
    return esc(tekst.slice(0, i)) + '<mark>' + esc(tekst.slice(i, i + q.length)) + '</mark>' + esc(tekst.slice(i + q.length));
  }
  function delSted(s) {
    var m = /^(.*) \((.*)\)$/.exec(s);
    return m ? { navn: m[1], type: m[2] } : { navn: s, type: '' };
  }

  /* One flat list of job titles from «Velg målgruppe» */
  var ROLLER = null;
  function roller() {
    if (ROLLER) return ROLLER;
    var sett = {};
    ROLLER = [];
    (window.FRANTZ_TAKSONOMI || []).forEach(function (n) {
      n.grupper.forEach(function (g) {
        (g.stillinger.length ? g.stillinger : [g.navn]).forEach(function (s) {
          if (sett[s]) return;
          sett[s] = true;
          ROLLER.push({ navn: s, sti: n.navn + ' › ' + g.navn, l: s.toLowerCase() });
        });
      });
    });
    return ROLLER;
  }

  function sokRoller(q) {
    q = q.trim().toLowerCase();
    if (q.length < 2) return [];
    var treff = [];
    roller().forEach(function (r) {
      var i = r.l.indexOf(q);
      if (i === -1) return;
      var rang = i === 0 ? 0 : (r.l.charAt(i - 1) === ' ' || r.l.charAt(i - 1) === '-') ? 1 : 2;
      treff.push({ r: r, rang: rang });
    });
    treff.sort(function (a, b) { return a.rang - b.rang || a.r.navn.length - b.r.navn.length; });
    return treff.slice(0, 8).map(function (t) { return t.r; });
  }

  /* Keyboard and click handling shared by both pickers */
  function liste(root, input, lagValg, velg) {
    var boks = root.querySelector('.picker__liste');
    var aktiv = -1;
    var valg = [];

    function tegn() {
      var res = lagValg(input.value);
      valg = res.valg;
      aktiv = valg.length ? 0 : -1;
      boks.innerHTML = res.html;
      boks.hidden = !res.html;
      input.setAttribute('aria-expanded', String(!boks.hidden));
      marker();
    }
    function marker() {
      Array.prototype.forEach.call(boks.querySelectorAll('.picker__opt'), function (o, i) {
        o.setAttribute('aria-selected', String(i === aktiv));
        if (i === aktiv) o.scrollIntoView({ block: 'nearest' });
      });
    }
    function lukk() {
      boks.hidden = true;
      input.setAttribute('aria-expanded', 'false');
    }

    input.addEventListener('input', tegn);
    input.addEventListener('focus', tegn);
    input.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
        e.preventDefault();
        if (boks.hidden) return tegn();
        if (!valg.length) return;
        aktiv = (aktiv + (e.key === 'ArrowDown' ? 1 : -1) + valg.length) % valg.length;
        marker();
      } else if (e.key === 'Enter') {
        e.preventDefault();
        if (!boks.hidden && valg[aktiv] !== undefined) { velg(valg[aktiv]); lukk(); }
      } else if (e.key === 'Escape') {
        lukk();
      }
    });
    boks.addEventListener('mousedown', function (e) {
      var o = e.target.closest('.picker__opt');
      if (!o) return;
      e.preventDefault();
      velg(valg[Number(o.dataset.i)]);
      lukk();
    });
    document.addEventListener('mousedown', function (e) {
      if (!root.contains(e.target)) lukk();
    });
    return { lukk: lukk, tegn: tegn };
  }

  function stilling(root, opt) {
    opt = opt || {};
    var input = root.querySelector('.picker__input');
    var valgt = root.querySelector('.picker__valgt');
    var naa = null;

    function vis(v) {
      naa = v;
      if (valgt) {
        valgt.hidden = !v;
        if (v) valgt.innerHTML = '<span class="icon-lucide icon-lucide--circle-check" aria-hidden="true"></span><span>Målgruppe: <b>' + esc(v.rolle) + '</b> · ' + esc(v.sti) + '</span>';
      }
      if (opt.onChange) opt.onChange(v);
    }
    function velg(r) {
      input.value = r.navn;
      vis({ tittel: r.navn, rolle: r.navn, sti: r.sti });
    }

    var l = liste(root, input, function (q) {
      var treff = sokRoller(q);
      if (!q.trim() || q.trim().length < 2) return { valg: [], html: '' };
      var html = treff.length
        ? '<p class="picker__gruppe">Forslag</p>' + treff.map(function (r, i) {
            return '<button type="button" class="picker__opt" role="option" data-i="' + i + '"><span>' + merk(r.navn, q.trim().toLowerCase()) + '</span><span class="picker__opt-meta">' + esc(r.sti) + '</span></button>';
          }).join('')
        : '<p class="picker__tom">Ingen stillinger passer. Frantz velger nærmeste målgruppe ut fra tittelen.</p>';
      return { valg: treff, html: html };
    }, velg);

    input.addEventListener('input', function () {
      // A typed title is fine too: match it quietly to the nearest known title
      var q = input.value.trim().toLowerCase();
      var eksakt = roller().filter(function (r) { return r.l === q; })[0];
      if (eksakt) return vis({ tittel: input.value.trim(), rolle: eksakt.navn, sti: eksakt.sti });
      var slutt = null;
      roller().forEach(function (r) { if (q.length > r.l.length && q.slice(-r.l.length) === r.l && (!slutt || r.l.length > slutt.l.length)) slutt = r; });
      vis(q ? (slutt ? { tittel: input.value.trim(), rolle: slutt.navn, sti: slutt.sti } : { tittel: input.value.trim(), rolle: '', sti: '' }) : null);
      if (naa && !naa.rolle && valgt) valgt.hidden = true;
    });

    return {
      set: function (tekst) {
        input.value = tekst || '';
        input.dispatchEvent(new Event('input'));
        l.lukk();
      },
      verdi: function () { return naa; }
    };
  }

  function steder(root, opt) {
    opt = opt || {};
    var input = root.querySelector('.picker__input');
    var chips = root.querySelector('.picker__chips');
    var valgte = (opt.start || []).slice();

    function endret() {
      chips.innerHTML = valgte.map(function (s, i) {
        var d = delSted(s);
        return '<span class="picker-chip">' + esc(d.navn) + (d.type ? ' <small>' + esc(STED_TYPE[d.type] || d.type) + '</small>' : '') +
          '<button type="button" data-fjern="' + i + '" aria-label="Fjern ' + esc(d.navn) + '"><span class="icon-lucide icon-lucide--x" aria-hidden="true"></span></button></span>';
      }).join('');
      input.placeholder = valgte.length ? 'Legg til et sted til …' : (opt.placeholder || 'Skriv et sted, f.eks. Bergen');
      Array.prototype.forEach.call(root.querySelectorAll('[data-sted-snarvei]'), function (b) {
        b.setAttribute('aria-pressed', String(valgte.indexOf(b.dataset.stedSnarvei) !== -1));
      });
      if (opt.onChange) opt.onChange(valgte.slice());
    }
    function leggTil(s) {
      if (s === HELE_NORGE) valgte = [];
      else valgte = valgte.filter(function (x) { return x !== HELE_NORGE; });
      if (valgte.indexOf(s) === -1) valgte.push(s);
      input.value = '';
      endret();
    }

    liste(root, input, function (q) {
      q = q.trim().toLowerCase();
      var alle = (window.FRANTZ_STEDER || []).concat([HELE_NORGE, HJEMMEKONTOR]).filter(function (s) { return valgte.indexOf(s) === -1; });
      var treff;
      if (!q) {
        treff = [HELE_NORGE, HJEMMEKONTOR].concat(alle.filter(function (s) { return /\((by|fylke)\)$/.test(s); }).slice(0, 8));
      } else {
        treff = alle.filter(function (s) { return delSted(s).navn.toLowerCase().indexOf(q) !== -1; })
          .sort(function (a, b) {
            var an = delSted(a).navn.toLowerCase(), bn = delSted(b).navn.toLowerCase();
            var PRI = { by: 0, fylke: 1, kommune: 2, tettsted: 3 };
            return (an.indexOf(q) === 0 ? 0 : 1) - (bn.indexOf(q) === 0 ? 0 : 1) ||
              (PRI[delSted(a).type] || 4) - (PRI[delSted(b).type] || 4) || an.length - bn.length;
          }).slice(0, 10);
      }
      var html = treff.length ? treff.map(function (s, i) {
        var d = delSted(s);
        return '<button type="button" class="picker__opt" role="option" data-i="' + i + '"><span>' + merk(d.navn, q) + '</span><span class="picker__opt-meta">' + esc(STED_TYPE[d.type] || d.type) + '</span></button>';
      }).join('') : '<p class="picker__tom">Ingen steder passer.</p>';
      return { valg: treff, html: html };
    }, function (s) { leggTil(s); input.focus(); });

    chips.addEventListener('click', function (e) {
      var b = e.target.closest('[data-fjern]');
      if (!b) return;
      valgte.splice(Number(b.dataset.fjern), 1);
      endret();
      input.focus();
    });
    root.querySelector('.picker__felt').addEventListener('mousedown', function (e) {
      if (e.target.closest('button') || e.target === input) return;
      e.preventDefault();
      input.focus();
    });
    Array.prototype.forEach.call(root.querySelectorAll('[data-sted-snarvei]'), function (b) {
      b.addEventListener('click', function () {
        var i = valgte.indexOf(b.dataset.stedSnarvei);
        if (i !== -1) { valgte.splice(i, 1); endret(); } else leggTil(b.dataset.stedSnarvei);
      });
    });

    endret();
    return {
      set: function (liste) { valgte = liste.slice(); endret(); },
      leggTil: leggTil,
      verdi: function () { return valgte.slice(); }
    };
  }

  /* Finds the full place name, e.g. «Tromsø» → «Tromsø (by)» */
  function finnSted(navn) {
    var p = (navn || '').toLowerCase().trim();
    if (!p) return null;
    var alle = window.FRANTZ_STEDER || [];
    return alle.filter(function (s) { return s.toLowerCase() === p + ' (by)'; })[0] ||
      alle.filter(function (s) { return s.toLowerCase() === p + ' (kommune)'; })[0] ||
      alle.filter(function (s) { return delSted(s).navn.toLowerCase() === p; })[0] || null;
  }

  /* Budget: typed amount and slider stay in sync.
     FrantzPicker.budsjett(root, { onChange(verdi) }) → { verdi(), set(n), anbefalt(n) } */
  function budsjett(root, opt) {
    opt = opt || {};
    var felt = root.querySelector('.form-input');
    var slider = root.querySelector('.budsjett-slider');
    var merke = root.querySelector('.slider-wrap__mark');
    var knapp = root.querySelector('.budsjett-kontroll__anbefalt');
    var min = Number(slider.min), max = Number(slider.max);
    var verdi = null, forslag = null;
    var tall = function (n) { return Math.round(n).toLocaleString('nb-NO').replace(/[\u00a0\u202f]/g, ' '); };

    function vis() {
      slider.value = verdi === null ? min : Math.min(max, Math.max(min, verdi));
      var pst = (Number(slider.value) - min) / (max - min) * 100;
      slider.style.background = 'linear-gradient(to right, var(--color-navy) ' + pst + '%, var(--surface-section) ' + pst + '%)';
      if (merke) {
        merke.hidden = forslag === null;
        if (forslag !== null) merke.style.left = ((Math.min(max, Math.max(min, forslag)) - min) / (max - min) * 100) + '%';
      }
      if (knapp) knapp.hidden = forslag === null || (verdi !== null && Math.abs(verdi - forslag) < 500);
    }
    function sett(n, fraFelt) {
      verdi = n === null || isNaN(n) || n <= 0 ? null : Math.round(n);
      if (!fraFelt) felt.value = verdi === null ? '' : tall(verdi);
      vis();
      if (opt.onChange) opt.onChange(verdi);
    }

    felt.addEventListener('input', function () {
      var siffer = felt.value.replace(/\D/g, '');
      var pos = felt.selectionStart, lengde = felt.value.length;
      felt.value = siffer ? tall(Number(siffer)) : '';
      var ny = Math.max(0, pos + felt.value.length - lengde);
      felt.setSelectionRange(ny, ny);
      sett(siffer ? Number(siffer) : null, true);
    });
    slider.addEventListener('input', function () { sett(Number(slider.value)); });
    if (knapp) knapp.addEventListener('click', function () { if (forslag !== null) sett(forslag); });

    vis();
    return {
      verdi: function () { return verdi; },
      set: function (n) { sett(n); },
      anbefalt: function (n) { forslag = n === undefined ? null : n; vis(); }
    };
  }

  window.FrantzPicker = { budsjett: budsjett, stilling: stilling, steder: steder, delSted: delSted, finnSted: finnSted, HELE_NORGE: HELE_NORGE, HJEMMEKONTOR: HJEMMEKONTOR };
})();
