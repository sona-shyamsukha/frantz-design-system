# Campaign pages: visual proposals for approval

Branch: `codex/campaign-page-review`. Prepared 27 October 2026.
Entry: `portal/kampanje-designreview.html`. Local preview: port 8087.

## Scope and status

Sona asked for an isolated branch with concrete visual designs to review. These are
working local proposals, not approved designs or a production sharing service.
The current Frantz tokens, fonts, navigation and existing example figures are reused.
No animation, publication, external messages or Second Brain edits were added.

Sona's correction: reuse the existing components, including tabs and control sizes.
The initial custom tab, metric, table, card, progress and disclosure appearances have
been replaced. Existing component mappings, new compositions and functional gaps are
recorded in [the component inventory](campaign-component-inventory.md). The revised
content structure remains a proposal; the initial screenshots are superseded.

## Page-by-page decisions

1. **Bestilt:** one next step with ownership and next update; tracking as a specific task.
   Order details, submitted material and history are collapsed. Period, adviser and total
   stay visible. Existing submitted orders and material previews are preserved.
2. **Under arbeid:** distinguish production, customer approval and publication handoff.
   Approval shows the ad previews and actions. After approval, actions disappear and
   responsibility moves to Frantz. The review page links to all three example states.
3. **Aktiv:** visits, clicks on Søk, cost per Søk and interest count; short adviser assessment;
   compact channel comparison. Daily figures, funnel, ads, placements, geography and
   history remain in Details. Interested candidates have their own portal tab.
4. **Avsluttet:** the same structure with final results and a recommendation. No repeated
   result totals in the sidebar. Campaign URLs preserve the campaign ID.
5. **Shared report:** a separate read-only layout with employer, campaign, period, results,
   assessment, expandable daily/channel/ad/placement/geography information and PDF via
   the browser print dialog. No candidate contact list, portal menu, account controls,
   editing, approval or tracking-code UI.

## Open decisions

- Should agencies hide budget and costs by default? The proposal defaults to hidden,
  with an explicit sender choice and a matching preview.
- Should a final report be frozen when issued or accept delayed measurements? No
  production policy has been implemented. The examples display a last-updated date.
- Validate calculation rules for cost per Søk and actual spend with Frantz. The inherited
  prototype does not provide verified spend or a reconciled cost basis. Unknown spend
  is shown as unavailable, and unsupported benchmark chips are removed from the overview.

## Verification

- 18 focused checks passed for report output, aggregate-only fixtures, link states,
  campaign identity, existing approval storage and submitted campaign material.
- All six overview views fit 320, 390, 768, 1024 and 1280 px without document overflow
  or duplicate IDs. Active and completed Details plus expanded shared-report sections
  were also checked at 320 px. Placement tables scroll within their own region.
- Browser walkthrough: link creation, optional cost visibility, cross-tab updates and
  disabling a link; the already-open recipient view becomes unavailable.
- Approval walkthrough on the separate 8087 origin: approving ads removes approval
  controls and shows Frantz's publication handoff. Older approval requests on 8080
  were preserved.
- Candidate follow-up: consent, count updates and expanding to all nine example rows
  worked at phone width. The follow-up state persists locally by campaign.
- Existing daily charts and funnel still render. Other campaign IDs show an explicit
  missing-data state instead of borrowing Bodø's report. Unknown IDs show an error.
- New and modified campaign review sources have no design-token violations. The full
  repository checker still reports 132 pre-existing violations in unrelated sources.
- Remaining limits: complete assistive-technology validation, real-device printing and
  production storage/access/email integration have not been verified.

## Production sharing boundary

The browser-local sharing store is for reviewing the experience only. Links work only
within the same browser and origin. The server must enforce each link's scope, expiry,
revocation and field visibility before returning report data. A hidden cost control or
noindex flag is not access control. Do not put real candidate records in these fixtures.
No shared page imports the portal account, candidate, campaign or approval scripts.
