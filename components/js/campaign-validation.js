/* Required order fields. Drafts can still be saved before all fields are complete. */
(function (root) {
  'use strict';
  function errors(input) {
    var result = [];
    var add = function (field, message) { result.push({ felt: field, tekst: message }); };
    if (!String(input.position || '').trim()) add('stilling', 'Skriv inn en stilling.');
    if (!input.locations || !input.locations.length) add('sted', 'Velg minst ett arbeidssted.');
    if (!Number.isFinite(input.budget) || input.budget <= 0) add('budsjett', 'Skriv inn kampanjebudsjettet.');
    else if (input.channels && input.channels.length && input.budget < input.minimum) {
      add('budsjett', 'Budsjettet må være minst kr ' + input.minimum.toLocaleString('nb-NO') + ' for kanalene dere har valgt. Øk budsjettet, eller fjern en kanal.');
    }
    if (!input.channels || !input.channels.length) add('kanaler', 'Velg minst én kanal.');
    var period = input.period || {};
    if (period.open || period.waiting || !Number.isFinite(period.start) || !Number.isFinite(period.end)) {
      add('periode', 'Velg startdato og kampanjens varighet.');
    } else if (period.end < period.start) add('periode', 'Kampanjen må slutte på eller etter startdatoen.');
    return result;
  }
  root.FrantzCampaignValidation = Object.freeze({ errors: errors });
})(window);
