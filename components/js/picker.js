/* Job title with suggestions, and a picker for one or more places.
   Needs window.FRANTZ_TAKSONOMI and window.FRANTZ_STEDER (portal/data/frantz-data.js).

   FrantzPicker.stilling(rootEl, { onChange(valg) })   valg = { tittel, rolle, sti } or null
   FrantzPicker.steder(rootEl, { onChange(liste), start: ['Kristiansand (by)'] })
   Both return an object with .set(...) to fill them from code. */

(function () {
  // Focus the field without opening the suggestions
  function stilleFokus(input) {
    input._stilleFokus = true;
    input.focus();
    input._stilleFokus = false;
  }

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

  /* Common titles people write that are not in the list, and the målgruppe they belong to */
  var VANLIGE = {
    'CFO': 'Økonomisjef', 'Økonomidirektør': 'Økonomisjef', 'Finansdirektør': 'Økonomisjef',
    'CEO': 'Administrerende direktør', 'Adm. dir.': 'Administrerende direktør', 'Konsernsjef': 'Administrerende direktør',
    'COO': 'Driftsdirektør', 'CHRO': 'HR-sjef/HR-leder', 'HR-direktør': 'HR-sjef/HR-leder',
    'CCO': 'Kommunikasjonssjef', 'Kommunikasjonsdirektør': 'Kommunikasjonssjef', 'Salgssjef': 'Salgsdirektør',
    'Rådmann': 'Kommunedirektør/rådmann/administrasjonssjef', 'Kommunedirektør': 'Kommunedirektør/rådmann/administrasjonssjef',
    'Enhetsleder': 'Avdelingsleder', 'Virksomhetsleder': 'Avdelingsleder', 'Seksjonsleder': 'Avdelingsleder',
    'Barnehagestyrer': 'Styrer i førskole/barnehage'
  };

  /* One flat list of job titles from «Velg målgruppe», plus the common titles above */
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
          ROLLER.push({ navn: s, rolle: s, sti: n.navn + ' › ' + g.navn, l: s.toLowerCase() });
        });
      });
    });
    Object.keys(VANLIGE).forEach(function (t) {
      var mal = ROLLER.filter(function (r) { return r.navn === VANLIGE[t]; })[0];
      if (mal && !sett[t]) ROLLER.push({ navn: t, rolle: mal.navn, sti: mal.sti + ' › ' + mal.navn, l: t.toLowerCase() });
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

  var teller = 0;

  /* A hidden status line that screen readers read out, e.g. «5 forslag» */
  function status(root) {
    var el = root.querySelector('.picker__status');
    if (!el) {
      el = document.createElement('span');
      el.className = 'picker__status sr-only';
      el.setAttribute('role', 'status');
      root.appendChild(el);
    }
    var tid;
    return function (tekst) {
      clearTimeout(tid);
      tid = setTimeout(function () { el.textContent = tekst; }, 400);
    };
  }

  /* Keyboard and click handling shared by both pickers.
     The input keeps focus. aria-activedescendant points at the marked option. */
  function liste(root, input, lagValg, velg, si) {
    var boks = root.querySelector('.picker__liste');
    var id = boks.id || (input.id ? input.id + '-liste' : 'picker-liste-' + (++teller));
    var aktiv = -1;
    var valg = [];
    boks.id = id;
    boks.setAttribute('role', 'listbox');
    input.setAttribute('role', 'combobox');
    input.setAttribute('aria-autocomplete', 'list');
    input.setAttribute('aria-controls', id);
    input.setAttribute('aria-expanded', 'false');

    function tegn() {
      var res = lagValg(input.value);
      valg = res.valg;
      aktiv = valg.length ? 0 : -1;
      boks.innerHTML = res.html;
      Array.prototype.forEach.call(boks.querySelectorAll('.picker__opt'), function (o, i) {
        o.id = id + '-' + i;
        o.tabIndex = -1;
      });
      boks.hidden = !res.html;
      input.setAttribute('aria-expanded', String(!boks.hidden));
      marker();
      if (!boks.hidden) si(res.status || (valg.length ? valg.length + ' forslag. Bruk pil opp og ned.' : 'Ingen forslag.'));
    }
    function marker() {
      Array.prototype.forEach.call(boks.querySelectorAll('.picker__opt'), function (o, i) {
        o.setAttribute('aria-selected', String(i === aktiv));
        if (i === aktiv) o.scrollIntoView({ block: 'nearest' });
      });
      if (aktiv >= 0 && !boks.hidden) input.setAttribute('aria-activedescendant', id + '-' + aktiv);
      else input.removeAttribute('aria-activedescendant');
    }
    function lukk() {
      boks.hidden = true;
      input.setAttribute('aria-expanded', 'false');
      input.removeAttribute('aria-activedescendant');
    }

    input.addEventListener('input', tegn);
    // A pick moves focus back to the field. That focus must not open the list again.
    input.addEventListener('focus', function () { if (!input._stilleFokus) tegn(); });
    input.addEventListener('blur', function () { setTimeout(function () { if (!root.contains(document.activeElement)) lukk(); }, 0); });
    input.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
        e.preventDefault();
        if (boks.hidden) return tegn();
        if (!valg.length) return;
        aktiv = (aktiv + (e.key === 'ArrowDown' ? 1 : -1) + valg.length) % valg.length;
        marker();
      } else if (e.key === 'Enter') {
        if (!boks.hidden && valg[aktiv] !== undefined) { e.preventDefault(); velg(valg[aktiv]); lukk(); }
      } else if (e.key === 'Escape') {
        if (!boks.hidden) { e.preventDefault(); e.stopPropagation(); lukk(); }
      }
    });
    // mousedown keeps focus in the input. click picks, so Enter and Space on an option work too.
    boks.addEventListener('mousedown', function (e) {
      if (e.target.closest('.picker__opt')) e.preventDefault();
    });
    boks.addEventListener('click', function (e) {
      var o = e.target.closest('.picker__opt');
      if (!o) return;
      velg(valg[Number(o.dataset.i)]);
      lukk();
      stilleFokus(input);
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
    var si = status(root);
    var naa = null;
    if (valgt) valgt.setAttribute('aria-live', 'polite');

    function vis(v) {
      naa = v;
      if (valgt) {
        var html = v ? '<span class="icon-lucide icon-lucide--circle-check" aria-hidden="true"></span><span>Målgruppe: <b>' + esc(v.rolle) + '</b> · ' + esc(v.sti) + '</span>' : '';
        valgt.hidden = !v;
        // Wait a moment after showing it, so screen readers notice the new text
        if (valgt.innerHTML !== html) setTimeout(function () { if (naa === v) valgt.innerHTML = html; }, 50);
      }
      if (opt.onChange) opt.onChange(v);
    }
    function velg(r) {
      input.value = r.navn;
      vis({ tittel: r.navn, rolle: r.rolle, sti: r.sti });
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
    }, velg, si);

    input.addEventListener('input', function () {
      // A typed title is fine too: match it quietly to the nearest known title
      var q = input.value.trim().toLowerCase();
      var eksakt = roller().filter(function (r) { return r.l === q; })[0];
      if (eksakt) return vis({ tittel: input.value.trim(), rolle: eksakt.rolle, sti: eksakt.sti });
      var slutt = null;
      roller().forEach(function (r) { if (q.length > r.l.length && q.slice(-r.l.length) === r.l && (!slutt || r.l.length > slutt.l.length)) slutt = r; });
      vis(q ? (slutt ? { tittel: input.value.trim(), rolle: slutt.rolle, sti: slutt.sti } : { tittel: input.value.trim(), rolle: '', sti: '' }) : null);
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
    var si = status(root);
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
      si('La til ' + delSted(s).navn + '. ' + valgte.length + (valgte.length === 1 ? ' sted' : ' steder') + ' valgt.');
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
    }, function (s) { leggTil(s); stilleFokus(input); }, si);

    chips.addEventListener('click', function (e) {
      var b = e.target.closest('[data-fjern]');
      if (!b) return;
      var borte = valgte.splice(Number(b.dataset.fjern), 1)[0];
      endret();
      stilleFokus(input);
      si('Fjernet ' + delSted(borte).navn + '.');
    });
    root.querySelector('.picker__felt').addEventListener('mousedown', function (e) {
      if (e.target.closest('button') || e.target === input) return;
      e.preventDefault();
      input.focus();
    });
    Array.prototype.forEach.call(root.querySelectorAll('[data-sted-snarvei]'), function (b) {
      b.addEventListener('click', function () {
        var i = valgte.indexOf(b.dataset.stedSnarvei);
        if (i !== -1) { valgte.splice(i, 1); endret(); si('Fjernet ' + delSted(b.dataset.stedSnarvei).navn + '.'); } else leggTil(b.dataset.stedSnarvei);
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
      slider.setAttribute('aria-valuetext', verdi === null ? 'Ikke valgt' : 'kr ' + tall(verdi));
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

  // Searchable single selection. Only jobs without a campaign can be selected.
  function connect(root, opt) {
    opt = opt || {};
    var input = root.querySelector('.picker__input');
    var l = liste(root, input, function (q) {
      var ord = q.trim().toLocaleLowerCase('nb').split(/\s+/).filter(Boolean);
      var ledige = (opt.hent ? opt.hent() : []).filter(function (c) { return !c.kampanje; });
      var treff = ledige.filter(function (c) {
        var tekst = [c.tittel, c.sted, c.arbeidsgiver, c.prosjekt, c.id].join(' ').toLocaleLowerCase('nb');
        return ord.every(function (o) { return tekst.indexOf(o) !== -1; });
      });
      // Bound rendered results for large imports; search always covers the full list.
      var vist = treff.slice(0, 50);
      var antall = treff.length > vist.length ? 'Viser ' + vist.length + ' av ' + treff.length + ' treff. Søk mer presist.' : treff.length + (treff.length === 1 ? ' stilling' : ' stillinger');
      var html = vist.length ? '<p class="picker__gruppe">' + antall + '</p>' + vist.map(function (c, i) {
        return '<button class="picker__opt" type="button" role="option" data-i="' + i + '">' +
          '<span class="connect-sok__tittel">' + esc(c.tittel) + '</span>' +
          '<span class="connect-sok__meta">' + esc(c.arbeidsgiver) + ' · ConnectID ' + esc(c.id) + (c.prosjekt ? ' · ' + esc(c.prosjekt) : '') + '</span></button>';
      }).join('') : '<p class="picker__tom">' + (ledige.length ? 'Ingen stillinger passer søket. Prøv en annen tittel, arbeidsgiver, prosjekt eller ConnectID.' : 'Ingen stillinger uten kampanje. Nye stillinger fra Connect vises her når de er hentet inn.') + '</p>';
      return { valg: vist, html: html, status: antall + '. Bruk pil opp og ned for å velge.' };
    }, function (c) {
      if (!c) return;
      input.value = c.tittel;
      if (opt.onChange) opt.onChange(c);
    }, status(root));
    var apner = root.querySelector('[data-picker-toggle]');
    if (apner) apner.addEventListener('click', function () {
      if (input.getAttribute('aria-expanded') === 'true') { l.lukk(); stilleFokus(input); }
      else { input.focus(); l.tegn(); }
    });
    return { apne: function () { input.focus(); l.tegn(); }, lukk: l.lukk };
  }

  window.FrantzPicker = { connect: connect, budsjett: budsjett, stilling: stilling, steder: steder, delSted: delSted, finnSted: finnSted, HELE_NORGE: HELE_NORGE, HJEMMEKONTOR: HJEMMEKONTOR };
})();
