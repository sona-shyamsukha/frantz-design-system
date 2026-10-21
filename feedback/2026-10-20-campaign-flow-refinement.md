# Campaign flow refinement — 20 October 2026

Local prototype changes following Sona's review. These are design decisions from this chat, not client approval or production behaviour.

## Decisions

- Step 1: optional campaign name first. One full-width field per row. No source tabs, introductory block above Stillinger, or divider under the name.
- Link, free text, file and a saved job from Stillinger can be combined. Keep a manually supplied campaign name and link when reading other sources.
- Step 2: leave both tabs unselected when only job details are available. A supplied budget or channels selects custom setup; an explicit request for a named saved package selects that package. Explain text-based selections, keep everything editable, and preserve entered values when switching routes.
- Packages show their price and included channels. Remove the excluded-channel lists from the shared cards and component-library examples.
- Step 3: two routes, “Jeg har materiell” and “Bestill design fra Frantz”. Show the design price inside the paid-design panel only after “Bestill design fra Frantz” is selected: from kr 2 180 / hour, additional to the campaign budget.
- In the upload route, ask whether the file already contains text and logo only after upload. Finished ads use the file as-is; ordinary pictures get the editable overlay. Show the preview after a file or library picture is selected.
- An image, finished ad or explicit request for paid design is required to continue. Text alone is insufficient.
- Step 4: show add-ons openly. Use the shared header summary for reviewing the order, with channel/material details and edit links. Keep design instructions in the review and order, and distinguish sharing for approval from ordering.
- No new animation added; design review comes first.

## Verification

- Browser-checked combined job sources, explicit setup choice, package/custom switching, image upload, finished-ad classification, retained material when switching to paid design, review, extras and approval-link creation.
- Checked layouts at 320, 390, 768, 1024 and 1440 pixels without horizontal overflow.
- Exercised a local demo order on localhost (separate browser origin from Sona's 127.0.0.1 preview). No real order, email or publication was sent.
- Fixed the confirmation checklist showing strategic advice when that extra was not chosen: hidden checklist rows now stay hidden.
- Inline script parsing and whitespace checks pass. The design-token check only reports an existing hard-coded overlay colour in `portal/mediebibliotek.html:37`, outside these changes.

Preview: http://127.0.0.1:8080/portal/ny-kampanje.html

## Final design selected — 21 October 2026

Sona selected the version with the summary at the top as the main local design. This records the design choice in this chat, not client approval or production release.

- Promoted the reviewed design to `portal/ny-kampanje.html`. The former `ny-kampanje-summary-option.html` address redirects to the main flow, retaining query parameters.
- One shared full-width page layout across all four stages, aligned with the portal content area. Fields fill their available content area. A later experiment with a narrower desktop container was reverted at Sona's request. The title remains “Opprett kampanje”; an eyebrow names the stage and its number. Removed the progress bar and lead text; demo links sit below the first-step inputs.
- The header's fixed-label “Se oppsummering” control appears after the job has been read and a budget exists. It opens a panel with horizontal sections, consistent edit actions, a fixed total at the top and a conditional scroll cue. Design charges are identified separately. Removed the duplicate tax statement at the bottom.
- Shared package cards use a smaller, lighter package name, a prominent price and quieter channel details, including on Lagrede pakker.
- The period is available before selecting a setup. Budget and period controls remain full width.
- Ad upload and design-brief fields fill the content area. After selecting an image, the preview is on the left and editing on the right when space allows. Selected material has clear change/remove controls. Disclosures use chevrons with fixed labels.
- Paid Frantz design must be chosen explicitly; source text no longer selects it automatically. Retain the user's choice when moving between steps. Show its price and a concise service explanation only for that route.
- Changed job-source inputs expose “Oppdater informasjon” using the standard primary-button size.
- Do not add a separate Tekstproduksjon add-on; Sona confirmed that the supplied lead-collection description corresponds to Meld interesse.

## Width exploration reverted — 21 October 2026

- Sona rejected the preview with different widths for individual fields and requested the previous full-width layout.
- The form-width preview now redirects to the main campaign flow, preserving query parameters.
- Removed the slider from “Sett opp selv”. Keep the full-width budget input and “Bruk anbefalt”. The shared budget controller supports both text-only input and existing slider-based consumers.

## Current checkpoint — 21 October 2026

- The main campaign route now uses the reviewed layout. The collapsed-summary comparison route redirects to it. Other experiments remain available as references.
- Ad layouts: Profil øverst, Luft rundt bildet and Ingen mal. Layout choices stay in the left form. Image adjustment is an action in the preview-panel header, outside the ad artwork; clicking the image also activates crop controls.
- Background changes update the preview, with automatic text contrast. Empty message fields show labelled preview-only sample text. Finished artwork has no added logo or headline.
- Per-order browser storage retains original material, source-step files, design instructions, template, colours and crop. Ordered campaign sections are Hva skjer nå?, Bestillingen, then Annonse og materiell.
- Campaign names and job details share one campaign-table column. The calculator supports manually named saved searches in a table and shareable search URLs.
- Preview sizes remain provisional: LinkedIn square is a supported format; Meta feed specifications could not be directly verified, and website formats require Frantz's publisher specifications. Channel labels distinguish feed previews and the website example. Removed the visible ratio label.
- Client-logo selection is still a proposal, not implemented. The current logo is a sender-name/initial stand-in. Agency client selection versus per-campaign logo upload is awaiting Sona's preference.
- Validation for this checkpoint: 15 Node checks passed; 32 inline portal scripts parsed; whitespace check passed. The design-token checker fails on literal styles in the ad concept explorations, new ad-template CSS, existing experimental layout widths, and the existing media-library overlay. Token cleanup remains outstanding; this checkpoint does not claim that check passed.
- This is a local prototype checkpoint, not a production order system or client release. Orders, files and saved searches are stored in the browser and are separate between browsers and hostnames.
