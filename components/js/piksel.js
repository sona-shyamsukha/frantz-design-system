/* Piksel: fills every [data-piksel] block with the tracking code for that campaign.
   <div class="summary-panel__block piksel" id="piksel" data-piksel="129041" data-status="aktiv" data-tid="i dag kl. 09.14"></div>
   data-status: venter (bestilt, under arbeid), aktiv, avsluttet. data-tid: last measured, or the day it stopped.
   data-connect: the ConnectID, when the campaign was ordered from Connect. Then the code is the ConnectID's code,
   so the job ad has one code, not two. Without it, Frantz made the code for the campaign. */
(function () {
  var STATUS = {
    venter: function () { return 'Ikke funnet på stillingssiden ennå. Vi sjekker av oss selv.'; },
    aktiv: function (tid) { return tid ? 'Aktiv · sist målt ' + tid : 'Aktiv'; },
    avsluttet: function (tid) { return tid ? 'Målingen stoppet ' + tid : 'Målingen er avsluttet'; }
  };
  var HJELP = {
    venter: 'Legg koden på stillingssiden før kampanjen starter. Da kan Frantz måle hvem som trykker «Søk».',
    aktiv: 'Koden ligger på stillingssiden og måler hvem som trykker «Søk».',
    avsluttet: 'Kampanjen er ferdig. Dere kan fjerne koden fra stillingssiden.'
  };
  // The same script tag as the live portal. Each stilling or campaign has its own ID in it.
  function kode(id) {
    return '<script crossorigin="anonymous" async data-r="' + id + '" data-frpixel="' + id + '" src="https://api.frantz.no/scripts/tech/frantzTech.min.js"></script>';
  }
  // The steps the web developer needs. Used in the email and on sporingskode.html, so both say the same.
  var MERKER = [
    { attr: 'applyposition', hvor: 'Søknadsknappen', nar: 'Alltid' },
    { attr: 'gdpraccept', hvor: 'Knappen der brukeren godtar personvern (GDPR)', nar: 'Hvis siden har en slik knapp' },
    { attr: 'readmorescenechanged', hvor: 'Knappen som viser hele stillingsteksten', nar: 'Hvis teksten åpnes med en knapp' },
    { attr: 'readmorescrollchanged', hvor: 'Elementet som har hele stillingsteksten', nar: 'Hvis brukeren ruller for å lese teksten' },
    { attr: 'readmorescrollblocker', hvor: 'Et element rett over stillingsteksten, for eksempel logoen', nar: 'Hvis en del av teksten vises når siden åpnes' }
  ];
  function epost(id, tittel) {
    var steg = MERKER.map(function (m) { return '- ' + m.hvor + ' (' + m.nar.toLocaleLowerCase('nb-NO') + '): data-frnav-context="' + m.attr + '"'; }).join('\n');
    return 'mailto:?subject=' + encodeURIComponent('Sporingskode til stillingssiden: ' + tittel) +
      '&body=' + encodeURIComponent('Hei!\n\nKan du legge sporingskoden fra Frantz på stillingssiden for ' + tittel + '?\n\n' +
        '1. Lim inn denne koden i <head> på stillingssiden:\n\n' + kode(id) + '\n\n' +
        '2. Legg til disse attributtene, så Frantz kan måle hvem som leser og trykker «Søk»:\n\n' + steg + '\n\nTakk!');
  }
  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }

  function render() {
  document.querySelectorAll('[data-piksel]').forEach(function (el) {
    var connect = el.dataset.connect;
    var id = connect || el.dataset.piksel, status = STATUS[el.dataset.status] ? el.dataset.status : 'venter';
    var kodetekst = kode(id);
    var h1 = document.querySelector('h1');
    var tittel = h1 ? h1.textContent.trim() : 'kampanjen';
    el.classList.add('piksel--' + status);
    el.innerHTML =
      (el.closest('details') ? '' : '<span class="summary-panel__label">Sporingskode</span>') +
      '<p class="piksel__status"><span class="piksel__prikk" aria-hidden="true"></span>' + esc(STATUS[status](el.dataset.tid || '')) + '</p>' +
      '<div data-piksel-code></div>' +
      '<div class="piksel__knapper"><a class="link link--xs" href="' + esc(epost(id, tittel)) + '">Send til den som lager nettsiden</a></div>' +
      '<p class="piksel__hjelp">' + HJELP[status] + (connect
        ? ' Koden hører til <a class="link" href="connect-detalj.html?id=' + esc(connect) + '">ConnectID ' + esc(connect) + '</a>.'
        : ' Koden har samme ID som kampanjen.') + ' <a class="link" href="sporingskode.html">Slik legger dere inn koden</a>.</p>';
    var field = window.FrantzCopyField.create(kodetekst, { label: 'Sporingskoden' });
    field.classList.add('piksel__code-row');
    el.querySelector('[data-piksel-code]').replaceWith(field);
  });
  }
  window.FrantzPiksel = { render: render, kode: kode, epost: epost, merker: MERKER };
  render();
})();
