/* Password field: the eye button shows or hides what was typed, and a warning shows while Caps Lock is on.
   Markup: .form-password > input + button.form-password__knapp[aria-controls]. Optional warning: [data-caps-for="<input id>"]. */
(function () {
  document.querySelectorAll('.form-password__knapp').forEach(function (knapp) {
    knapp.addEventListener('click', function () {
      var input = document.getElementById(knapp.getAttribute('aria-controls'));
      var vis = input.type === 'password';
      input.type = vis ? 'text' : 'password';
      knapp.setAttribute('aria-pressed', String(vis));
      knapp.setAttribute('aria-label', vis ? 'Skjul passordet' : 'Vis passordet');
      knapp.querySelector('.icon-lucide').className = 'icon-lucide icon-lucide--' + (vis ? 'eye-off' : 'eye') + ' icon-lucide--md';
    });
  });

  document.querySelectorAll('[data-caps-for]').forEach(function (varsel) {
    var input = document.getElementById(varsel.dataset.capsFor);
    function caps(e) { if (e.getModifierState) varsel.hidden = !e.getModifierState('CapsLock'); }
    input.addEventListener('keydown', caps);
    input.addEventListener('keyup', caps);
    input.addEventListener('blur', function () { varsel.hidden = true; });
  });
})();
