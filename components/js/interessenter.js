/* Meldte interesse: listen har personopplysninger, så den vises først etter
   at brukeren bekrefter hvordan de skal brukes. Etterpå kan listen sendes på e-post.
   Markup: [data-samtykke="<kampanje-id>"] med [data-samtykke-boks], [data-samtykke-liste] og [data-epost]. */
(function () {
  function husk(nokkel, verdi) {
    try {
      if (verdi === undefined) return localStorage.getItem(nokkel);
      localStorage.setItem(nokkel, verdi);
    } catch (e) { return null; }
  }

  document.querySelectorAll('[data-samtykke]').forEach(function (kort) {
    var nokkel = 'frantz-samtykke-' + kort.dataset.samtykke;
    var boks = kort.querySelector('[data-samtykke-boks]');
    var liste = kort.querySelector('[data-samtykke-liste]');
    var avkrysning = boks.querySelector('input[type="checkbox"]');
    var vis = boks.querySelector('[data-vis-liste]');
    var epostKnapp = kort.querySelector('[data-epost-apne]');
    var epost = kort.querySelector('[data-epost]');

    function apne() {
      boks.hidden = true;
      liste.hidden = false;
      if (epostKnapp) epostKnapp.hidden = false;
    }

    if (husk(nokkel) === 'ja') apne();

    avkrysning.addEventListener('change', function () { vis.disabled = !avkrysning.checked; });
    vis.addEventListener('click', function () {
      if (!avkrysning.checked) return;
      husk(nokkel, 'ja');
      apne();
      liste.querySelector('table').focus();
    });

    if (!epostKnapp || !epost) return;
    var felt = epost.querySelector('input[type="email"]');
    var svar = epost.querySelector('[data-epost-svar]');
    epostKnapp.addEventListener('click', function () {
      epost.hidden = !epost.hidden;
      epostKnapp.setAttribute('aria-expanded', String(!epost.hidden));
      if (!epost.hidden) felt.focus();
    });
    epost.addEventListener('submit', function (e) {
      e.preventDefault();
      if (!felt.checkValidity()) { svar.textContent = 'Skriv en gyldig e-postadresse.'; felt.focus(); return; }
      svar.textContent = 'Listen er sendt til ' + felt.value + '.';
      felt.value = '';
    });
  });
})();
