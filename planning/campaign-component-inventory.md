# Campaign page component inventory

User requirement, 27 October 2026: use existing tokens and components. Any gap that
requires something new must be recorded explicitly. Reusing colours alone does not
make a separately styled control an existing component.

## Submission and phase navigation — 27 October 2026

Verified before this iteration: 27 data, approval, material, report and disclosure tests pass. A fresh
order was placed and reopened on the isolated localhost origin. All five tabs pass
layout checks at seven widths (320–1672 px), including copy-button containment.

The tab order is **Stilling, Kampanje, Annonser, Innsikt, Interessenter**. Only destinations with content are shown. Innsikt appears when results exist, Interessenter when people have registered, and Annonser when submitted material or creatives exist. Hidden tabs are skipped by keyboard navigation; unavailable deep links fall back to the phase default.
Kampanje and Annonser remain separate: submitted configuration and developments
belong to Kampanje; material, creative versions and approvals belong to Annonser.

- Bestilt defaults to Kampanje. Production defaults to Kampanje while Frantz is
  preparing or publishing, and Annonser when ready for approval. Active/completed
  campaigns default to Innsikt. Explicit tab links are respected; old tab hashes
  map to the new sections.
- The full reviewed field registry is captured with every new order. Stilling and
  Kampanje render the immutable submission, original text/link and original file
  attachments. Later campaign metadata does not overwrite the submitted values.
  Older fixtures only show the original data that exists; missing fields are not invented.
  Kampanjen som bestilt uses the existing disclosure component, collapsed initially and placed immediately after Kampanjeforløp in every phase. Grunnlag for bestillingen uses the same collapsed disclosure in Stilling, with source text, links and files inside one expansion.
- **Kampanjeoversikt** is the only sticky area. It reuses the existing disclosure, form-hint, strong text and spacing utilities for the current period, orderer and assigned Frantz adviser. Adviser names come from campaign metadata (with the original order as fallback); unassigned campaigns show “Tildeles av Frantz”. Status stays beside the title; the application deadline stays in Stilling, and channels/budget stay in Kampanje. Period no longer appears beneath the campaign title. The whole sidebar
  sticks as one unit, bounded by the viewport. On smaller screens it becomes a
  normal, collapsed disclosure above the tabs. Campaign number, portal URL,
  published campaign URL, source job URL and automatically generated report URL use the same copy row. New links have no expiry date, retain the same token, and omit costs by default. Existing sharing choices and deliberate revocation remain respected. Before launch, the public report destination explains that results will arrive when the campaign is active.
- The sidebar no longer has a Delingsvalg button. Published social-ad URLs use
  campaign metadata `annonselenker: [{ kanal, navn, url }]` and the existing copy row.
  Unsafe or duplicate URLs are omitted. Missing URLs show an honest availability
  message; no platform homepages or fabricated ad destinations are substituted.
  The report is opened and copied from Kampanjeoversikt only. The header actions
  and advanced report-sharing controls have been removed.
- Kontakt rådgiver sits inside the blue campaign-status alert in every phase,
  using the existing small secondary button and campaign-task layout. Text takes
  a flexible share of the row and the action wraps below on narrow screens; no
  new control, visual variant or token was introduced.
- **CopyField** is the existing tracking copy-row composition extracted into a shared
  component, using existing ghost buttons, icons, spacing, colours and focus tokens.
  No new visual variant or token. The existing submitted-material appearance is
  extracted into shared CSS and reused in every campaign phase.
- Original submission loading, private detail rendering and append-only campaign
  activity are shared modules. Approval events and existing advisor developments
  stay in Kampanje. Public reports never load the private submission/detail modules.
- Report links still use the existing same-browser demonstration store;
  production cross-device access requires server-side integration.

Current iteration: 29 data, approval, material, report and disclosure checks pass, including automatic token creation and preservation of existing sharing choices. No new component or token was added.

## Completed examples shown in the portal

Avsluttet and the home-page results list use the shared `synlige()` collection.
Only completed campaigns marked `rapportKomplett` are listed. Bodø is currently
the complete example; the four totals-only fixtures remain stored and directly
addressable but are not offered in the campaign lists. Other campaign statuses
and local orders remain visible.

## Shared campaign structure — 27 October 2026

Latest consistency check: Stilling has submitted fields followed by the source
disclosure; Kampanje has the status/contact alert, visible campaign history,
collapsed original order, then tracking. Annonser adds creatives/approval and
submitted material when present. The sidebar, tab order and tokens are shared.
The production checklist is visible inside Kampanjeforløp. Its recorded progress
suppresses the misleading “Ingen endringer” message. Approval controls reuse
card__footer, grid gap-4 and btn-row--stack, with standard-size primary/secondary
buttons. No new button size, surface or token was created.
Campaign section gaps use the existing 24 px spacing token (previously 32 px).
The material heading/status gap is 12 px, lead/action gap 16 px, and approval
action/preview gap 24 px. The original-order disclosure omits its repeated order
date; the dated event remains in Kampanjeforløp. Empty provenance notes are hidden. Help disclosures placed inside campaign cards
use the existing 16 px spacing token above the row, including Annonser and
Interessenter, so they never touch the preceding content.
Interest-card headings share content-sized layout rules across active and completed
campaigns. The old 260 px flex basis has been removed because it became a forced
heading height when the card switched to a column on mobile.


Campaign information panels use normal document flow on all four campaign pages;
stickiness is disabled in this page composition so expanded sections cannot pass
behind a pinned card. The ordering-flow summary keeps its separate behaviour.

All four statuses now reuse the same header composition, filter-tab component,
sidebar order, overview alert and disclosure component. Core tabs keep their positions;
sections are added when the campaign has the corresponding content.

| State | Core tabs | Added tabs | Same sidebar |
| --- | --- | --- | --- |
| Bestilt | Oversikt, Annonser (submitted material) | — | Campaign number, period, channels, adviser, total, VAT, order details, tracking, contact |
| Under arbeid | Oversikt, Annonser (drafts and approval) | — | Same sequence; budget and available order facts |
| Aktiv | Oversikt, Annonser (published) | Resultater, Interessenter when available | Same sequence; current tracking state |
| Avsluttet | Oversikt, Annonser (published) | Resultater, Interessenter when available | Same sequence; stopped tracking state |

New code is shared **page behaviour**, `campaign-sections.js`, not a new visual tab
component. It owns selected state, keyboard navigation, deep links and legacy
`#detaljer` links. Approval returns to Oversikt. Existing chart, material, consent,
sharing and candidate-follow-up IDs and behaviour remain attached to their content.

The existing tracking component gains a code-row composition with the existing
small ghost button and Lucide copy/check icons, with a keyboard-scrollable code line. Copy is next to the code and reports
success only after the clipboard accepts it. No new button size, colour, token or
UI primitive was added. Summary totals use existing navy/on-navy tokens, and VAT
notes use existing spacing tokens above the next disclosure.

Verification: 21 report/material/approval/disclosure tests pass. All available tabs
fit 320, 390, 768, 1024, 1116, 1280 and 1672 px with disclosures expanded and no
page overflow, overlapping fact rows or clipped copy buttons. Keyboard tab
navigation, legacy report links, sparse reports, inline copying and approval
returning to Oversikt are checked in the browser.

This earlier sidebar arrangement is superseded by the five-tab, links-only
sidebar described above. No separate review page is part of the client journey.

## Ordered page browser feedback — 27 October 2026

- Removed the company eyebrow on Bestilt. The period uses the existing `--space-8` gap below the title.
- Replaced the next-step card with the existing `.alert--info`, `.alert__title` and `.alert__body`. Adviser contact uses the existing `.summary-panel__cta` and small secondary button in the sidebar.
- Updated shared disclosure hover/open/pressed states using existing `--bg-navy-strong`, `--bg-navy-strong-hover` and `--text-on-navy` tokens. No new component or colour token.
- Fixed the existing summary-row label wrapping, gave desktop order labels a proportional column, and stacked label/value rows on phones. Shortened the reference label to “Kampanjenavn / referanse”.

## Client walkthrough cleanup — 27 October 2026

The four campaign states are now presented directly in the portal. The earlier
review hub, review prompts and responsive harness are internal, not user journeys.

| Area | Existing component / tokens | Change or gap |
| --- | --- | --- |
| Accordions | `.disclosure`, `--surface-raised`, `--border-default`, `--radius-16`, shared spacing and focus ring | Updated the existing shared component to a white, bordered surface. Embedded summary rows keep one outer card. No new variant or token. |
| Headings and actions | Existing title typography, badges, `.btn`, `.btn-row` | One header composition for all four states. Completed campaigns also have an Open report action. No new button sizes or tab styles. |
| Reports | `.card`, `.metric`, `.metrics`, `.quote`, `.meter`, shared tabs | The existing four metric tiles wrap by available report-card width, including beside a sidebar. Optional data renders only when recorded. All completed campaign IDs have their own aggregates; unknown breakdowns and contacts are omitted. |
| Tracking | Existing `.piksel` in `.disclosure__content` | One title and consistent inset, without a second card inside the accordion. |
| Contact | Existing buttons, standard `mailto` action | Opens the user's email to the existing `post@frantz.no` address with campaign name/number. No invented personal advisor email. Correct personal routing remains an integration question. |
| Styles | `styles/campaign.css` | Page composition extracted from the review stylesheet. No new UI primitive. |
| Sharing | Existing report-sharing panel and public report | Development essays removed. A short note preserves the real limitation: cross-device links still require server integration. No claim of production access control. |

Verification: the six product views (including one total-only report) fit 320,
390, 768, 1024 and 1280 px with all disclosures expanded, with no horizontal page
overflow or duplicate IDs. Approval handoff, active report tabs and the shared
report are checked in the browser. Report/data/approval/material tests pass.

## Current expand/collapse standard

One ordinary disclosure component is now maintained in
`components/disclosure/componentDisclosure.css`, loaded by `frantz-ds.css`.
`.disclosure` controls the row, indicator, focus, padding and open state;
`.disclosure__content` controls the content inset. Section headings, help text,
prototype information, tracking code, approval previews and ad customisation all
use it. There is no smaller or differently styled help/prototype variant.

This consolidates the previous `.approval-message`, `.approval-test`, `.forklar`,
unstyled native controls and `.an-mer__knapp` appearance. Approval marker classes
remain only where existing form logic or layout uses them. Their appearance is
no longer defined separately. Unused legacy `.flere` accordion styles were removed.
No new token was added. Earlier entries below describe the implementation history;
this standard supersedes their component naming and variant notes.

The responsive **order summary** (`.ordre-meny` / `.ordre-linje`) remains a distinct
compound control: it displays a price, an order title and a recap entry point, and
its layout changes with the creation step and viewport. It is accounted for here
rather than silently reclassified as a simple content accordion. Menus, comboboxes,
image replacement, sharing forms and Show all buttons are also different actions,
not alternate visual variants of this component.

## Reused components

| Element | Existing component / source | Application |
| --- | --- | --- |
| Page tabs | `.filter[role="tab"]`, `components/form/componentForm.css`; `.funnel__tabs.sidefaner`, `styles/layout.css` | Oversikt, Detaljer, Interessenter use the same pill tabs as the original campaign page. No campaign-specific tab appearance. |
| Buttons | `.btn`, `.btn--primary`, `.btn--secondary`, `.btn--ghost`, `.btn--sm`, `components/button/componentButton.css` | Standard sizes and padding. Page layouts align controls rather than stretching their height. No new size variant. |
| Button groups | `.btn-row`, `components/button/componentButton.css` | Sharing actions reuse the existing spacing and alignment. |
| Cards | `.card--betjen`, `.card--les`, `components/card/componentCard.css` | Result summaries, next steps and the sharing panel use standard card surfaces and padding. Expandable content uses the shared disclosure inset. |
| Compact campaign facts | `.summary-panel`, `.summary-panel__head`, `.summary-panel__block`, `.summary-row`, `components/summary/componentSummary.css` | Sidebar facts reuse the original panel, including its headings and stacked labels. |
| Result figures | `.metrics`, `.metrics--fire`, `.metric`, `.metric__icon`, `.metric__value`, `.metric__label`, `components/metric/componentMetric.css` | Existing three- or four-figure layouts and metric tiles. No custom dividers or large figure style. |
| Channel comparison | `.metrics--channel`, `.metric__channel`, `.metric__foot`, `components/metric/componentMetric.css` | Reuses the existing two-channel comparison. |
| Adviser assessment | `.quote`, `components/quote/componentQuote.css`; `.avatar--sm.avatar--data` | Existing adviser quote and identity treatment. |
| Progress | `.meter.meter--sm`, `.meter__track`, `.meter__bar`, `components/progress/componentProgress.css` | Existing bar, with accessible progress attributes. Width is calculated from campaign data, not a new design token. |
| Tables | `.table.table--inset`, `components/table/componentTable.css`; `.results__scroll` | Daily, ad, placement and geography tables follow the existing responsive table pattern. Cells include their mobile labels. |
| Expandable information | `.disclosure`, `components/disclosure/componentDisclosure.css` | Shared disclosure control refined at Sona's request: full-width label, existing right-aligned chevron, token-based separator and focus ring. Expanded content uses the same shared inset. See component-library.html#disclosure. |
| Tracking task | `.alert.alert--warning`, `components/alert/componentAlert.css` | Existing warning treatment and normal secondary button. |
| Status | `.badge--ordered`, `.badge--setup`, `.badge--active`, `.badge--ended` | Existing status colours and sizes. |
| Fields and checkbox | `.form-group`, `.form-input`, `.form-select`, `.form-label`, `.form-check` | Sharing controls reuse the existing form components. |
| Typography and links | `.text-h2`, `.card__title`, `.form-hint`, `.text-sm`, `.link` | Existing text roles and actions. |
| Brand and icons | `.logo`, `.icon-lucide`, `.kanal-prikk` | Existing logo size, icons and channel colours. |

## Token use

- No new tokens are introduced. Sources remain `tokens/base.css` and the existing
  channel tokens in `components/results/componentResults.css`.
- Page composition uses existing spacing roles, containers, text roles and border
  tokens. Component files own control padding, radius, font, surface and state colours.
- The existing 640 px and 1180 px breakpoints are reused. Viewport dimensions in the
  test harness describe test devices; they are not new product design values.
- `styles/campaign-review.css` is limited to page composition, content spacing,
  alignment and printing. It must not define a parallel tab, button, card, metric,
  table, progress or disclosure appearance.

## New compositions and functional gaps accounted for

| Item | What is new | Existing building blocks | Status / remaining decision |
| --- | --- | --- | --- |
| Share-report panel | The arrangement and behaviour of link creation, cost visibility, expiry and revocation | Existing card, labels, checkbox, fields, select, buttons, button row and disclosure | New composition for Sona's design review. Local behaviour only; server-backed access and field filtering are still required. No new visual primitive. |
| Standalone report page | A recipient layout without portal navigation | Existing typography, cards, metrics, quote, progress, tables, disclosures and PDF action button | New page composition for review. Final-report update policy remains open. No new visual primitive. |
| Candidate tab | A third destination in the campaign page | Existing tabs, candidate table, consent checkbox and follow-up switches | Existing components reorganised; candidate data is excluded from the shared page. |
| Expanded campaign details | A disclosure followed by a read card | Shared `.disclosure` and its content region | Composition of existing components. The existing disclosure was refined on 27 October at Sona's request and documented in the component library. No page-specific variant or new tokens. |
| Review overview | Internal page for comparing states | Existing cards, typography, links, badges and buttons | Internal review composition only. |

There is no currently implemented new visual primitive or new token to approve.
Any future component gap must state its purpose, why an existing component cannot
serve it, the proposed token/component changes, and approval status here before work.

## Verification record

Compared the corrected page against the actual component-library button examples:
standard buttons are 50 px high, with 16 px text and 16/24 px padding; ghost buttons
are 32 px high, with 14 px text and 8/16 px padding. These are measured existing
component values, not new overrides. Sharing controls use the same sizes.

All six views passed the layout check at 320, 390, 768, 1024 and 1280 px, including
the restored tabs. Details and candidate views were rechecked at phone width.
The 18 focused behaviour checks passed. No undefined token references or token
violations were found in the modified sources.

The earlier visual-review screenshots show the superseded custom styles and should
not be used to assess the corrected version.

## Shared expand/collapse refinement — 27 October 2026

Sona requested a clearer design for the plus/minus control. The existing disclosure
component in `components/del-godkjenning/approval.css` now uses a right-aligned
Lucide chevron, a stronger main label, a subtle divider, a full-row target and the
existing focus ring. Secondary prototype/help disclosures keep the quieter text role.
Open state reverses the same icon immediately; no animation or new token was added.
Direct-child selectors keep a parent disclosure from changing a nested disclosure's
indicator. Static and generated instances share the same markup and CSS.

Examples, markup and keyboard guidance: `component-library.html#disclosure`.
This is a requested refinement on the review branch, not client approval.
Mouse, Enter and Space were checked in the component example. Expanded campaign
and report sections fit 320 px and 1280 px layouts. A closed nested disclosure keeps
its downward indicator while its parent is open. The 18 focused checks still pass.

### Accordion padding correction

Sona flagged missing padding, especially Sporingskode in Om kampanjen. Shared
summary rows now use `--space-12` vertically and `--space-panel-padding` horizontally,
including the quieter variant. Tracking disclosures inside a summary panel reuse
`summary-panel__block` for expanded content instead of nesting a read card. The
summary panel owns the outer surface and the tracking component remains unchanged.
No new spacing token or card variant was introduced.

### Consolidation requested after the padding correction

The earlier standard/quiet split was itself part of the inconsistency. Both now
use the same row. Existing inline help CSS and ordinary native disclosures were
migrated, and page-specific accordion appearance was removed from the ad editor.
The new file is a consolidation of the existing control, not an extra visual style.
Native details continues to supply keyboard and state behaviour without new JS.

Verification after consolidation: 20 checks pass, including a guard that rejects
unaccounted ordinary native disclosures and retired page-specific appearances.
All six review views fit 320, 390, 768, 1024 and 1280 px. Generated approval-message
and report-sharing disclosures were opened in the browser and use the same computed
font and token-based padding. Message fields remain accessible after expansion.
Asset versions were updated so existing browser sessions load the consolidated CSS
and generated markup. Complete order-creation submission was not repeated for this
visual consolidation; the order-summary compound control itself was left intact.

## MVP consistency implementation — 29 October 2026

Authorized by Sona after the portal review. Reuses the existing task card, status
alert, button row, native section editor, upload controls, read-only summary and
brand settings. No new visual primitive, token or animation. Shared behaviour is
added in `campaign-status.js` and `brand-store.js`; material editing uses the existing
creation editor with a campaign-scoped return/save path.

Publication remains a separate confirmation by the account holder after any invited
reviewer has replied. Final agency/client authority still needs confirmation for
production. Cost-estimate approval and turnaround are service responsibilities;
no automatic paid work or real cancellation is implemented by the prototype.

Sona rejected the task card above the statistics on 29 October. It is restored
beneath the campaign list; the shared next-action logic remains in place.

Sona removed the added change/cancellation action block and the duplicated employer,
sender and brand-note rows in Bestilling. The original job/material fields and
invoice selector remain. Calculator sharing now copies a public criteria link
directly and reuses the public-report brand header for its anonymous view.

The shared calculator now leads with results and a compact role/location/budget
summary. Search inputs move into a closed native disclosure after the results,
using the existing disclosure component. The signed-in calculator stays unchanged.

Sona changed only the accordion hover on 29 October. Hover uses the existing
medium blue `--color-data-700` with white text. Closed labels, the dark blue
expanded header, pressed state and keyboard focus ring retain their original
appearance. This supersedes the earlier dark navy hover treatment.

The report metric definitions now use separate existing info tooltips inside
each metric tile, replacing the short-lived “Om tallene” disclosure. The
click-versus-submission caveat and previous campaign title/period stay visible;
each comparison tooltip includes its own previous value. Public reports retain
their expanded definitions and cost visibility rules.
