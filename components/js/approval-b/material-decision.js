/* One answer owns the material clearance, whether submitted by Kari or the invited person. */
(function () {
  'use strict';
  function init() {
  if (window.FrantzApprovalContext && FrantzApprovalContext.unavailable) return;
  var panel = document.getElementById('del-panel'), approve = document.getElementById('approve-campaign-material');
  if (!panel || !approve) return;
  var store = window.FrantzApprovals, change = document.getElementById('customer-request-change'),
    form = document.getElementById('customer-change-form'), comment = document.getElementById('customer-change-comment'),
    status = document.getElementById('material-customer-status');
  function refresh(records) {
    var latest = records.find(function (item) { return item.round === 'material'; });
    if (!latest) latest = records.find(function (item) { return item.round === 'plan' && FrantzApprovalRules.clearsMaterial(item, store.status(item)); });
    var state = latest && store.status(latest);
    var complete = state === 'approved', changes = state === 'changes';
    approve.closest('.handlinger').hidden = complete || changes;
    document.getElementById('material-delegation').hidden = complete || changes;
    status.hidden = !complete && !changes;
    if (complete || changes) {
      var card = approve.closest('.card'), title = card.querySelector('.card__title'), hint = card.querySelector('.card__hint');
      if (title) title.textContent = complete ? 'Annonsene er godkjent' : 'Frantz følger opp endringene';
      if (hint) hint.textContent = complete ? 'Planlagt start ' + panel.dataset.periode.split(' – ')[0] + '. Frantz kontrollerer oppsettet før publisering.' : 'Du får en ny forespørsel når annonsene er oppdatert.';
      var instruction = document.getElementById('material-review-instructions'); if (instruction) instruction.hidden = true;
      if (complete) card.querySelectorAll('.tag').forEach(function (tag) { tag.textContent = tag.textContent.replace('utkast', 'godkjent'); });
      var check = document.querySelector('.checklist li:last-child');
      if (complete && check) { check.className = 'er-ok'; check.querySelector('.sr-only').textContent = 'Fullført: '; check.querySelector('b').textContent = 'Annonsene er godkjent'; check.querySelector('small').textContent = 'Frantz følger opp publisering.'; check.querySelector('.icon-lucide').className = 'icon-lucide icon-lucide--circle-check'; }
      form.hidden = true;
      status.textContent = complete ? 'Takk! Annonsene er godkjent' + (latest.kind === 'self' ? '' : ' av ' + latest.name) + '. Planlagt start ' + panel.dataset.periode.split(' – ')[0] + '. Frantz kontrollerer oppsettet før publisering.' : 'Tilbakemeldingen er registrert. Frantz må oppdatere annonsene før de kan godkjennes.';
      var alert = document.querySelector('.status-alert');
      if (alert) alert.textContent = complete ? 'Annonsene er godkjent. Frantz følger opp publisering.' : 'Endringer er ønsket. Frantz følger opp tilbakemeldingen.';
    }
    if (!complete && !changes) {
      var initialCard = approve.closest('.card'); initialCard.querySelector('.card__title').textContent = 'Annonsene er klare for deg';
      var instruction = document.getElementById('material-review-instructions'); if (instruction) instruction.hidden = false;
    }
    approve.disabled = !!latest && !['revoked', 'superseded', 'expired'].includes(state);
    change.disabled = approve.disabled;
    approve.textContent = 'Godkjenn annonsene';
  }
  async function decide(state) {
    approve.disabled = true; change.disabled = true;
    try {
      await store.decideSelf(panel.dataset.id, window.FrantzApprovalContext && FrantzApprovalContext.content || FrantzApprovalShare.demoContent(panel.dataset), state, comment.value);
      refresh(await store.list(panel.dataset.id)); status.focus();
    } catch (e) {
      refresh(await store.list(panel.dataset.id));
      status.hidden = false; status.textContent = e.message === 'decision-in-progress' ? 'En forespørsel eller et svar finnes allerede. Se statusen nedenfor.' : 'Svaret kunne ikke lagres. Prøv igjen.';
    }
  }
  approve.addEventListener('click', function () { decide('approved'); });
  change.addEventListener('click', function () { form.hidden = !form.hidden; change.setAttribute('aria-expanded', String(!form.hidden)); if (!form.hidden) comment.focus(); });
  form.addEventListener('submit', function (event) { event.preventDefault(); if (comment.reportValidity()) decide('changes'); });
  window.FrantzMaterialDecision = { refresh: refresh };
  store.list(panel.dataset.id).then(refresh);
  }
  if (window.FrantzApprovalContext) FrantzApprovalContext.ready.then(init); else init();
})();
