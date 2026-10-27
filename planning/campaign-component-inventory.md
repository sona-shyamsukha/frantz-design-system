# Campaign page component inventory

User requirement, 27 October 2026: use existing tokens and components. Any gap that
requires something new must be recorded explicitly. Reusing colours alone does not
make a separately styled control an existing component.

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
