/* One next-action model for campaign pages, home and notifications. Lifecycle badges stay separate. */
(function (root) {
  'use strict';
  function derive(campaign, request, events) {
    var state = request && root.FrantzApprovals.status(request);
    var confirmed = (events || []).some(function (event) {
      return event.kind === 'material-approved' && (!request || event.approvalId === request.id);
    });
    if (state === 'changes') return { key: 'changes', owner: 'Frantz', title: 'Endringer sendt – venter på Frantz', description: 'Frantz går gjennom tilbakemeldingen. Dere får beskjed når reviderte annonser er klare.', action: false };
    if (state === 'pending') return { key: 'pending', owner: request.name, title: 'Venter på svar fra ' + request.name, description: 'Annonsene er sendt til gjennomgang. Dere gir Frantz klarsignal etter at mottakeren har godkjent.', action: false };
    if (state === 'expired' || state === 'superseded') return { key: state, owner: 'Dere', title: state === 'expired' ? 'Send annonsene til godkjenning på nytt' : 'Endret materiell må vurderes på nytt', description: 'Den forrige godkjenningen gjelder ikke. Se gjennom gjeldende annonser og send en ny forespørsel.', action: true };
    if (campaign.status === 'Bestilt' && !request) return campaign.materialMode ? { key: 'ordered', owner: 'Frantz', title: 'Bestillingen er mottatt – venter på Frantz', description: 'Frantz går gjennom bestillingen og bekrefter videre fremdrift.', action: false } : { key: 'missing', owner: 'Dere', title: 'Legg til annonsemateriell', description: 'Last opp annonser, lag annonsen selv eller be Frantz om et designestimat.', action: true };
    if (confirmed) return { key: 'confirmed', owner: 'Frantz', title: 'Klarsignal gitt – venter på Frantz', description: 'Dere har godkjent annonsene for publisering. Frantz bekrefter oppstart.', action: false };
    if (state === 'approved') return { key: 'reviewed', owner: 'Dere', title: 'Gjennomgangen er godkjent – gi Frantz klarsignal', description: 'Mottakeren har godkjent denne versjonen. Dere bekrefter at annonsene kan publiseres.', action: true };
    return { key: 'review', owner: 'Dere', title: 'Se gjennom annonsene', description: 'Godkjenn annonsene, eller be om endringer. Frantz bekrefter oppstart etter deres klarsignal.', action: true };
  }
  async function read(campaign) {
    var key = campaign.approvalKey || String(campaign.id);
    if (campaign.materiellId && root.FrantzCampaignMaterial) {
      var record = await root.FrantzCampaignMaterial.read(campaign.materiellId);
      campaign = Object.assign({}, campaign, { materialMode: record && record.materiell && record.materiell.modus || '' });
      if (record && record.ordre && record.ordre.approvalKey) key = record.ordre.approvalKey;
    }
    var records = await root.FrantzApprovals.list(key);
    var latest = records.find(function (request) { return request.round === 'material'; });
    return Object.assign(derive(campaign, latest, root.FrantzCampaignActivity.read(campaign.id)), { updated: latest && (latest.answered || latest.created) || '' });
  }
  root.FrantzCampaignStatus = Object.freeze({ derive: derive, read: read });
})(window);
