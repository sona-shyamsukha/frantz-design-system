# Status — Frantz portal prototype

Updated 02.11.2026.

## In progress
- Nothing open. The 5 quick fixes from the UX review are merged into `main` (PR 24, 02.11). Kampanjen dialog changes merged (PR 25, 02.11). Polish fixes and back link on campaign pages merged (PR 26, 02.11). Sporingskode in Firmainnstillinger, no prototype boxes, calculator actions (PR 27); «Trekk tilbake» fix (PR 28); «Gratis» (PR 29), all 02.11. Review page: `atelier/05-checks/ux-review/review.html`.

- Branch `atelier/nytt-passord` (02.11, not committed): Nytt passord has live password rules, a «Gjenta passordet» field, an eye button inside each field, a Caps Lock warning and a «Passordene er ikke like» error. Shared styles in `components/form/componentForm.css` (`.form-password`, `.form-krav`, `.form-varsel`). The four rules are placeholders until Frantz confirms theirs. Committed (6674c51). After that, not committed: login page has the same eye button and Caps Lock warning; shared code in `components/js/password-field.js`; «Passord» added to Skjemafelt in the component library.
- 02.11, not committed: after the plan is approved, Hjem shows «Planen er godkjent» with «Bestill kampanjen», and the bell shows the same notice (`FrantzApprovals.approvedDrafts()` in `components/js/approval-store.js`, used by `portal/dashboard.html` and `components/js/konto.js`).
- 02.11, not committed (Sona's model): every new campaign becomes a draft with its own number and address (`ny-kampanje.html?kladd=<id>`) as soon as it has content, or at once when filled from Stillinger or the calculator. Each draft has its own save slot and approval link, shows in Kampanjer and on Hjem as «Kladd», and keeps its number when ordered. «Ny kampanje» is always blank. The «Start en ny kampanje» button is gone. `FZ_KAMPANJER.lagreKladd()` in `portal/data/kampanjer.js`.
- Committed in 093bce8 (Sona chose «restore the draft»): «Opprett kampanje» now opens the saved draft on the summary, with the same answers, so approve → notice → «Bestill kampanjen» → order works end to end. «Start en ny kampanje» (next to the title) clears the draft and its approval link. Uploaded files are not restored (browser storage cannot hold them); a draft with files loses its approval on reopen. The restore was removed in bc07a92 (01.10).

## Waiting on Sona
- Report tiles: how to show if a number is good or bad. A) «normalt»  B) «sist» only  C) «sist», else «normalt». Recommended: C. Needs average numbers from Frantz for A and C.
1. Stillinger vs Kampanjer: A) Stillinger shows only jobs without a campaign  B) merge Stillinger into Kampanjer. Recommended: A.
2. Vercel previews reject every password: `SITE_PASSWORD` is set for Production only. Tick «Preview» on it in Vercel settings.
3. Open P1s from the review (not fixed): Stillinger/Kampanjer overlap, grey ad placeholders on approval, heavy «Kampanjeoversikt» panel, funnel not to scale.

## Questions for Frantz (Tuesday 3.11)
1. How do customers change job details after ordering today: the Pixel page, or «Forespør endringer»?
2. Do customers use their own tracking links («Vis annonselenker») for ads outside Frantz?
3. Customers without an integration: how often do they need the tracking code before they order?

## Next
- Flow check (02.11): every page and button clicked by a robot. Broken: admin inbox filters and case list do nothing (AI assistant part, not MVP, Sona 02.11); 2 old tests in `tests/dashboard.test.cjs` look for `resultat-panel`, which the page no longer has. No way in from the portal to `landingsside.html` and `ny-kampanje-samlet.html`. Nothing fixed yet.
- Presentation for the client on Tuesday 3.11.
- Status one-pager for Frantz (tilbud vs delivered, hours, way forward): `Kunder/Frantz/1-presentasjon/statusrapport-2026-11-02.html`, private preview https://claude.ai/artifact/8sm1V9WWW9YLnAWtVAfUDn. Not sent. Sona decides if the hours section stays.

## Decisions
- 02.11: PR 27, 28 and 29 merged into `main`.
- 02.11: `atelier/polish` merged into `main` (PR 26). Campaign pages use «‹ Kampanjer» instead of a breadcrumb.
- 02.11: Kampanjen dialog merged (PR 25). Taste rule saved: field links right-aligned with the field edge.
- 02.11: `atelier/quick-fixes` merged into `main` (PR 24).
- 02.11: Sona chose the 5 quick P1s. Job title + place leads everywhere; own campaign name is second.
- 29.10: `atelier/fixes` (with the review) merged into `main` (PR 22).
- 29.10: Report comparison was too much text in the small cards (Sona). Cards now say only «34 flere enn sist»; «Sist» is explained in one line under the cards.
- 28.10: The report funnel now draws all 6 steps (Sona said yes). The approval hint in Ny kampanje sits under both order buttons.
- 28.10: Suggested budget in Ny kampanje capped at kr 15 000, never below the channel minimum (Sona said yes).
- 28.10: `sporingskode-guide` and `tabell-justering` are merged into `main` (PR 19, PR 20).
- 28.10: `tabell-tekst` is merged into `main` (PR 21). One text size in every table cell.
- 28.10: Change 2 («Kontakt rådgiver» to a named advisor) is not important. Dropped.
- 28.10: Change 6 (language choice) is fixed in the real product, not in the prototype.
- 28.10: Connect detail page removed. Audience category and ISCO belong in the admin version only.
- 28.10: Interest confirmation captures both email and phone by default. No setting for customers.
- 28.10: Copy controls use one shared design everywhere: code font, one bordered box, copy icon inside.
