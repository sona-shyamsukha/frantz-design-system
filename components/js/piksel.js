/* Piksel: fills every [data-piksel] block with the tracking code for that campaign.
   <div class="summary-panel__block piksel" id="piksel" data-piksel="129041" data-status="aktiv" data-tid="i dag kl. 09.14"></div>
   data-status: venter (bestilt, under arbeid), aktiv, avsluttet. data-tid: last measured, or the day it stopped.
   data-connect: the ConnectID, when the campaign was ordered from Connect. Then the code is the ConnectID's code,
   so the job ad has one code, not two. Without it, Frantz made the code for the campaign. */
(function () {
  var STATUS = {
    venter: function () { return 'Ikke funnet på stillingssiden ennå. Vi sjekker av oss selv.'; },
    aktiv: function (tid) { return 'Aktiv · sist målt ' + tid; },
    avsluttet: function (tid) { return 'Målingen stoppet ' + tid; }
  };
  var HJELP = {
    venter: 'Legg koden på stillingssiden før kampanjen starter. Da kan Frantz måle hvem som trykker «Søk».',
    aktiv: 'Koden ligger på stillingssiden og måler hvem som trykker «Søk».',
    avsluttet: 'Kampanjen er ferdig. Dere kan fjerne koden fra stillingssiden.'
  };
  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }

  function render() {
  document.querySelectorAll('[data-piksel]').forEach(function (el) {
    var connect = el.dataset.connect;
    var id = connect || el.dataset.piksel, status = STATUS[el.dataset.status] ? el.dataset.status : 'venter';
    var kode = '<script src="https://connect.frantz.no/c.js" data-id="' + id + '"></script>';
    var h1 = document.querySelector('h1');
    var tittel = h1 ? h1.textContent.trim() : 'kampanjen';
    var epost = 'mailto:?subject=' + encodeURIComponent('Sporingskode til stillingssiden: ' + tittel) +
      '&body=' + encodeURIComponent('Hei!\n\nKan du legge denne koden på stillingssiden for ' + tittel + '?\n\n' + kode + '\n\nDen måler hvem som trykker «Søk» fra kampanjen til Frantz.');
    el.classList.add('piksel--' + status);
    el.innerHTML =
      (el.closest('details') ? '' : '<span class="summary-panel__label">Sporingskode</span>') +
      '<p class="piksel__status"><span class="piksel__prikk" aria-hidden="true"></span>' + esc(STATUS[status](el.dataset.tid || '')) + '</p>' +
      '<div class="piksel__code-row"><code class="piksel__kode" tabindex="0" aria-label="Sporingskode">' + esc(kode) + '</code>' +
        '<button class="btn btn--ghost btn--sm" type="button" data-piksel-kopier aria-label="Kopier sporingskoden" title="Kopier sporingskoden"><span class="icon-lucide icon-lucide--copy" aria-hidden="true"></span></button></div>' +
      '<div class="piksel__knapper"><a class="link link--xs" href="' + esc(epost) + '">Send på e-post</a><span class="sr-only" aria-live="polite" data-piksel-melding></span></div>' +
      '<p class="piksel__hjelp">' + HJELP[status] + (connect
        ? ' Koden hører til <a class="link" href="connect-detalj.html?id=' + esc(connect) + '">ConnectID ' + esc(connect) + '</a>.'
        : ' Koden har samme ID som kampanjen.') + '</p>';
    var knapp = el.querySelector('[data-piksel-kopier]');
    var melding = el.querySelector('[data-piksel-melding]');
    knapp.addEventListener('click', async function () {
      knapp.disabled = true;
      try {
        await navigator.clipboard.writeText(kode);
        knapp.innerHTML = '<span class="icon-lucide icon-lucide--check" aria-hidden="true"></span>';
        knapp.setAttribute('aria-label', 'Sporingskoden er kopiert');
        knapp.title = 'Kopiert';
        melding.className = 'sr-only';
        melding.textContent = 'Koden er kopiert.';
        setTimeout(function () {
          knapp.innerHTML = '<span class="icon-lucide icon-lucide--copy" aria-hidden="true"></span>';
          knapp.setAttribute('aria-label', 'Kopier sporingskoden');
          knapp.title = 'Kopier sporingskoden';
          melding.textContent = '';
        }, 2000);
      } catch (error) {
        melding.className = 'form-hint';
        melding.textContent = 'Kunne ikke kopiere. Marker koden og kopier den selv.';
      } finally {
        knapp.disabled = false;
      }
    });
  });
  }
  window.FrantzPiksel = { render: render };
  render();
})();
