# Status — Frantz portal prototype

Updated 28.10.2026.

## In progress
- Branch `atelier/review` (committed, not pushed): baseline review of the main flows for new and existing customers. Report: `atelier/05-checks/report.html`. 1 P0, 20 P1, 15 P2. Nothing in the prototype is changed.

## Waiting on Sona
1. Push the branch and deploy a Vercel preview of the report? yes / no
2. What to fix before 3.11: A) the order flow (themes 1–3)  B) all P0 and P1  C) nothing yet
3. Add to the Frantz questions: benchmarks for the report, and cancel and invoice rules? yes / no

## Questions for Frantz (Tuesday 3.11)
1. How do customers change job details after ordering today: the Pixel page, or «Forespør endringer»?
2. Do customers use their own tracking links («Vis annonselenker») for ads outside Frantz?
3. Customers without an integration: how often do they need the tracking code before they order?

## Next
- Presentation for the client on Tuesday 3.11.

## Decisions
- 28.10: `sporingskode-guide` and `tabell-justering` are merged into `main` (PR 19, PR 20).
- 28.10: `tabell-tekst` is merged into `main` (PR 21). One text size in every table cell.
- 28.10: Change 2 («Kontakt rådgiver» to a named advisor) is not important. Dropped.
- 28.10: Change 6 (language choice) is fixed in the real product, not in the prototype.
- 28.10: Connect detail page removed. Audience category and ISCO belong in the admin version only.
- 28.10: Interest confirmation captures both email and phone by default. No setting for customers.
- 28.10: Copy controls use one shared design everywhere: code font, one bordered box, copy icon inside.
