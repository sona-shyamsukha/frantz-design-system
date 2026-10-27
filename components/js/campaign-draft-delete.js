/* Draft deletion belongs to the opened draft. Require its name before deleting. */
(function () {
  var id = new URLSearchParams(location.search).get('kladd');
  var draft = id && window.FZ_KAMPANJER.finn(id);
  if (!draft || draft.status !== 'Kladd') return;

  var $ = function (id) { return document.getElementById(id); };
  var trigger = $('kladd-slett');
  var dialog = $('kladd-dialog');
  var input = $('kladd-bekreft-navn');
  var confirm = $('kladd-bekreft');
  var expectedName = '';
  trigger.hidden = false;

  function matchesName() { return expectedName !== '' && input.value.trim() === expectedName; }

  trigger.addEventListener('click', function () {
    // The name may have been edited since the draft was opened.
    expectedName = $('ref').value.trim() || draft.ref || draft.tittel;
    $('kladd-slett-navn').textContent = expectedName;
    input.value = '';
    confirm.disabled = true;
    $('kladd-slett-feil').hidden = true;
    dialog.showModal();
  });
  input.addEventListener('input', function () { confirm.disabled = !matchesName(); });
  $('kladd-avbryt').addEventListener('click', function () { dialog.close(); });
  dialog.addEventListener('close', function () { trigger.focus(); });
  $('kladd-slett-skjema').addEventListener('submit', function (event) {
    event.preventDefault();
    // Recheck on submit as Enter must obey the same rule as the button.
    if (!matchesName()) return;
    if (!window.FZ_KAMPANJER.slettKladd(id)) {
      $('kladd-slett-feil').textContent = 'Kladden kunne ikke slettes. Last inn siden på nytt og prøv igjen.';
      $('kladd-slett-feil').hidden = false;
      return;
    }
    try { sessionStorage.setItem('fzSlettetKladd', JSON.stringify({ id: id, navn: expectedName })); } catch (e) {}
    var params = new URLSearchParams(location.search);
    params.delete('kladd');
    location.href = 'campaigns.html' + (params.size ? '?' + params.toString() : '');
  });
})();
