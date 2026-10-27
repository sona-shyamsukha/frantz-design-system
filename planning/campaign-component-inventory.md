# Campaign page component inventory

User requirement, 27 October 2026: use existing tokens and components. Any gap that
requires something new must be recorded explicitly. Reusing colours alone does not
make a separately styled control an existing component.

## Reused components

| Element | Existing component / source | Application |
| --- | --- | --- |
| Page tabs | `.filter[role="tab"]`, `components/form/componentForm.css`; `.funnel__tabs.sidefaner`, `styles/layout.css` | Oversikt, Detaljer, Interessenter use the same pill tabs as the original campaign page. No campaign-specific tab appearance. |
| Buttons | `.btn`, `.btn--primary`, `.btn--secondary`, `.btn--ghost`, `.btn--sm`, `components/button/componentButton.css` | Standard sizes and padding. Page layouts align controls rather than stretching their height. No new size variant. |
| Button groups | `.btn-row`, `components/button/componentButton.css` | Sharing actions reuse the existing spacing and alignment. |
| Cards | `.card--betjen`, `.card--les`, `components/card/componentCard.css` | Result summaries, next steps, sharing panel and expanded information use standard card surfaces and padding. |
| Compact campaign facts | `.summary-panel`, `.summary-panel__head`, `.summary-panel__block`, `.summary-row`, `components/summary/componentSummary.css` | Sidebar facts reuse the original panel, including its headings and stacked labels. |
| Result figures | `.metrics`, `.metrics--fire`, `.metric`, `.metric__icon`, `.metric__value`, `.metric__label`, `components/metric/componentMetric.css` | Existing three- or four-figure layouts and metric tiles. No custom dividers or large figure style. |
| Channel comparison | `.metrics--channel`, `.metric__channel`, `.metric__foot`, `components/metric/componentMetric.css` | Reuses the existing two-channel comparison. |
| Adviser assessment | `.quote`, `components/quote/componentQuote.css`; `.avatar--sm.avatar--data` | Existing adviser quote and identity treatment. |
| Progress | `.meter.meter--sm`, `.meter__track`, `.meter__bar`, `components/progress/componentProgress.css` | Existing bar, with accessible progress attributes. Width is calculated from campaign data, not a new design token. |
| Tables | `.table.table--inset`, `components/table/componentTable.css`; `.results__scroll` | Daily, ad, placement and geography tables follow the existing responsive table pattern. Cells include their mobile labels. |
| Expandable information | `.approval-message`, `components/del-godkjenning/approval.css` | Shared disclosure control refined at Sona's request: full-width label, existing right-aligned chevron, token-based separator and focus ring. Expanded content uses an existing read card. See component-library.html#disclosure. |
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
| Expanded campaign details | A disclosure followed by a read card | Existing `.approval-message` and `.card--les` | Composition of existing components. The existing disclosure was refined on 27 October at Sona's request and documented in the component library. No page-specific variant or new tokens. |
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
